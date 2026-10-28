import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"
import { pathToFileURL } from "node:url"
import { isDeepStrictEqual } from "node:util"
import { serialize } from "node:v8"
import { deflateSync } from "node:zlib"
import { build } from "tsdown"
import ts from "typescript"
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest"
import type { DiagramType } from "../src/index.ts"
import { loadFixture } from "../src/index.ts"
import type { MermaidConfig, MermaidRun } from "../src/mermaid.ts"
import type { RunMermaidOptions } from "../src/run-mermaid-options.ts"
import {
  detectDiagramType,
  mermaidVersion,
  runMermaidWithEmbeddedData,
} from "../src/mermaid.ts"
import {
  MERMAID_RUN_STORE_DISABLED,
  MERMAID_RUN_STORE_SWITCH,
  MermaidRunStore,
  RESULT_FILES,
  codeIdentityOf,
  defaultMermaidRunStore,
  isMermaidRunStoreOn,
} from "../src/mermaid-run-store.ts"

const RUN: MermaidRun = {
  outcome: { accepted: true, diagramType: "flowchart-v2", db: { a: 1 } },
  embedded: { config: {}, title: undefined, dataBlockEffects: [] },
}

let directory: string

beforeEach(() => {
  directory = mkdtempSync(path.join(os.tmpdir(), "mermaid-run-store-"))
})

afterEach(() => {
  rmSync(directory, { recursive: true, force: true })
})

/** Every file under `dir`. */
function filesUnder(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
}

/** The files of results under `dir`, without those of configurations. */
function resultFilesUnder(dir: string): string[] {
  return filesUnder(dir).filter(
    (file) =>
      file.endsWith(".bin") &&
      path.basename(path.dirname(file)) !== "configurations",
  )
}

describe("the switch of the store", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("is on when unset or empty, and off only when disabled", () => {
    vi.stubEnv(MERMAID_RUN_STORE_SWITCH, undefined)
    expect(isMermaidRunStoreOn()).toBe(true)
    vi.stubEnv(MERMAID_RUN_STORE_SWITCH, "")
    expect(isMermaidRunStoreOn()).toBe(true)
    vi.stubEnv(MERMAID_RUN_STORE_SWITCH, MERMAID_RUN_STORE_DISABLED)
    expect(isMermaidRunStoreOn()).toBe(false)
  })

  it("throws on any other value, such as one that YAML may read as false", () => {
    for (const value of ["off", "on", "false", "0", "no", "Disabled"]) {
      vi.stubEnv(MERMAID_RUN_STORE_SWITCH, value)
      expect(() => isMermaidRunStoreOn(), value).toThrow(TypeError)
    }
  })
})

describe("MermaidRunStore", () => {
  it("gives back what was stored, undefined fields included", () => {
    const store = new MermaidRunStore(directory, "code")
    expect(store.read("text", {})).toBeUndefined()
    store.write("text", {}, RUN)
    const read = store.read("text", {})
    expect(isDeepStrictEqual(read, RUN)).toBe(true)
    expect(Object.hasOwn(read?.embedded ?? {}, "title")).toBe(true)
    expect(resultFilesUnder(directory)).toHaveLength(1)
    expect(filesUnder(directory)).toHaveLength(2)
  })

  it("keeps a configuration once for the results that share it", () => {
    const store = new MermaidRunStore(directory, "code")
    store.write("one", {}, RUN)
    store.write("two", {}, RUN)
    store.write("three", {}, { outcome: RUN.outcome, embedded: undefined })
    expect(resultFilesUnder(directory)).toHaveLength(3)
    expect(filesUnder(directory)).toHaveLength(4)
    expect(isDeepStrictEqual(store.read("two", {}), RUN)).toBe(true)
    expect(store.read("three", {})?.embedded).toBeUndefined()
  })

  it("keys a result by the text, the options and the code", () => {
    const store = new MermaidRunStore(directory, "code")
    store.write("text", {}, RUN)
    expect(store.read("text ", {})).toBeUndefined()
    store.write("text", { config: {} }, RUN)
    // The type of a configuration has no field set to `undefined`, but a
    // caller that builds one can pass it, and mermaid.js reads it otherwise.
    const unset = { securityLevel: undefined } as unknown as MermaidConfig
    expect(store.read("text", { config: unset })).toBeUndefined()
    store.write("text", { config: { maxEdges: Number.NaN } }, RUN)
    expect(store.read("text", { config: { maxEdges: null } })).toBeUndefined()
    expect(
      store.read("text", { config: { securityLevel: "loose" } }),
    ).toBeUndefined()
    expect(
      store.read("text", { withoutDivergences: ["comment-takes-character"] }),
    ).toBeUndefined()
    expect(
      new MermaidRunStore(directory, "other code").read("text", {}),
    ).toBeUndefined()
  })

  it("keys a result by the divergences that were removed, each name apart", () => {
    const store = new MermaidRunStore(directory, "code")
    store.write("text", { withoutDivergences: ["c4-keyword-anywhere"] }, RUN)
    expect(store.read("text", {})).toBeUndefined()
    expect(
      store.read("text", { withoutDivergences: ["comment-takes-character"] }),
    ).toBeUndefined()
    expect(
      store.read("text", {
        withoutDivergences: ["c4-keyword-anywhere", "comment-takes-character"],
      }),
    ).toBeUndefined()
    expect(
      isDeepStrictEqual(
        store.read("text", { withoutDivergences: ["c4-keyword-anywhere"] }),
        RUN,
      ),
    ).toBe(true)
  })

  it("treats a file it cannot read, or of another key, as none", () => {
    const store = new MermaidRunStore(directory, "code")
    store.write("text", {}, RUN)
    const [file] = resultFilesUnder(directory)
    if (file === undefined) throw new Error("no file")
    writeFileSync(file, "not a stored run")
    expect(store.read("text", {})).toBeUndefined()
    writeFileSync(
      file,
      deflateSync(
        serialize({
          identity: serialize(["code", "another text", {}]),
          outcome: RUN.outcome,
          embedded: undefined,
        }),
      ),
    )
    expect(store.read("text", {})).toBeUndefined()
    for (const other of [null, 42, {}]) {
      writeFileSync(file, deflateSync(serialize(other)))
      expect(store.read("text", {})).toBeUndefined()
    }
    store.write("text", {}, RUN)
    const contents = readFileSync(file)
    for (let index = 0; index < contents.length; index++) {
      const flipped = Buffer.from(contents)
      flipped[index] = (flipped[index] ?? 0) ^ 0x10
      writeFileSync(file, flipped)
      const read = store.read("text", {})
      expect(
        read === undefined || isDeepStrictEqual(read, RUN),
        `byte ${String(index)}`,
      ).toBe(true)
    }
    store.write("text", {}, RUN)
    expect(isDeepStrictEqual(store.read("text", {}), RUN)).toBe(true)
  })
})

/** A clock that gives noon (UTC) of `day`, as `YYYY-MM-DD`. */
function clockAt(day: string): () => Date {
  return () => new Date(`${day}T12:00:00Z`)
}

/** The day `days` days after `day`, both as `YYYY-MM-DD`. */
function dayAfter(day: string, days: number): string {
  const date = new Date(`${day}T00:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

/** The names of the directories in `dir`, sorted. */
function directoriesIn(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/** A store of `code` in the directory of the test whose clock is at `day`. */
function storeAt(
  code: string,
  day: string,
  settings: { codeIdentitiesKept?: string[]; mostResults?: number } = {},
): MermaidRunStore {
  return new MermaidRunStore(directory, code, {
    ...settings,
    now: clockAt(day),
  })
}

describe("removing what is no longer needed", () => {
  const first = "2026-01-01"

  it("removes the results of code that is not kept at once, and keeps the rest", async () => {
    storeAt("old", first).write("t", {}, RUN)
    storeAt("lib", first).write("t", {}, RUN)
    storeAt("src", first, { codeIdentitiesKept: ["src", "lib"] }).prune()
    await vi.waitFor(
      () => {
        expect(directoriesIn(directory)).toEqual(["lib"])
      },
      { timeout: 10_000 },
    )
    expect(isDeepStrictEqual(storeAt("lib", first).read("t", {}), RUN)).toBe(
      true,
    )
  })

  it("does not remove a result only because it was last used long ago", () => {
    storeAt("code", first).write("t", {}, RUN)
    const muchLater = dayAfter(first, 400)
    const store = storeAt("code", muchLater)
    store.prune()
    expect(directoriesIn(path.join(directory, "code"))).toEqual([first])
    expect(isDeepStrictEqual(store.read("t", {}), RUN)).toBe(true)
    expect(directoriesIn(path.join(directory, "code"))).toEqual([
      first,
      muchLater,
    ])
  })

  it("moves a result read from an earlier day to the day, with its configuration", () => {
    storeAt("code", first).write("t", {}, RUN)
    const day = dayAfter(first, 2)
    expect(isDeepStrictEqual(storeAt("code", day).read("t", {}), RUN)).toBe(
      true,
    )
    rmSync(path.join(directory, "code", first), { recursive: true })
    expect(isDeepStrictEqual(storeAt("code", day).read("t", {}), RUN)).toBe(
      true,
    )
  })

  it("removes the results last used longest ago while the store holds too many, but not the day's", async () => {
    for (const [daysAgo, texts] of [
      [2, ["a", "b"]],
      [1, ["c", "d"]],
      [0, ["e", "f", "g"]],
    ] as const) {
      const store = storeAt("code", dayAfter(first, -daysAgo))
      for (const text of texts) store.write(text, {}, RUN)
    }
    storeAt("code", first, { mostResults: 5 }).prune()
    await vi.waitFor(
      () => {
        expect(directoriesIn(path.join(directory, "code"))).toEqual([
          dayAfter(first, -1),
          first,
        ])
      },
      { timeout: 10_000 },
    )
    storeAt("code", first, { mostResults: 2 }).prune()
    await vi.waitFor(
      () => {
        expect(directoriesIn(path.join(directory, "code"))).toEqual([first])
      },
      { timeout: 10_000 },
    )
  })

  it("removes the directory of a past day left with no result", async () => {
    storeAt("code", first).write("t", {}, RUN)
    const later = dayAfter(first, 1)
    expect(isDeepStrictEqual(storeAt("code", later).read("t", {}), RUN)).toBe(
      true,
    )
    storeAt("code", later).prune()
    await vi.waitFor(
      () => {
        expect(directoriesIn(path.join(directory, "code"))).toEqual([later])
      },
      { timeout: 10_000 },
    )
    expect(isDeepStrictEqual(storeAt("code", later).read("t", {}), RUN)).toBe(
      true,
    )
  })

  it("stops writing while the day alone holds too many results, and reads on", () => {
    const filled = storeAt("code", first)
    for (const text of ["a", "b", "c"]) filled.write(text, {}, RUN)
    const store = storeAt("code", first, { mostResults: 2 })
    store.prune()
    store.write("d", {}, RUN)
    expect(store.read("d", {})).toBeUndefined()
    expect(isDeepStrictEqual(store.read("a", {}), RUN)).toBe(true)
    expect(resultFilesUnder(directory)).toHaveLength(3)
  })

  it("removes the temporary files of writes that stopped half-way, and only those", () => {
    storeAt("code", first).write("t", {}, RUN)
    const [result] = resultFilesUnder(directory)
    if (result === undefined) throw new Error("no file")
    mkdirSync(path.join(directory, ".trees"))
    const olds = [
      result,
      path.join(directory, ".full"),
      path.join(directory, ".trees", "record"),
    ].map((file) => `${file}.1.old.tmp`)
    const fresh = `${result}.2.fresh.tmp`
    const twoHoursAgo = new Date(`${first}T10:00:00Z`)
    for (const old of olds) {
      writeFileSync(old, "")
      utimesSync(old, twoHoursAgo, twoHoursAgo)
    }
    writeFileSync(fresh, "")
    storeAt("code", first).prune()
    expect(olds.filter((old) => existsSync(old))).toEqual([])
    expect(existsSync(fresh)).toBe(true)
    expect(isDeepStrictEqual(storeAt("code", first).read("t", {}), RUN)).toBe(
      true,
    )
  })

  it("writes nothing while the last prune found the store too full, and writes again after", () => {
    const store = storeAt("code", first, { mostResults: 1 })
    store.write("a", {}, RUN)
    store.write("b", {}, RUN)
    store.prune()
    store.write("c", {}, RUN)
    expect(store.read("c", {})).toBeUndefined()
    storeAt("code", first, { mostResults: 10 }).prune()
    store.write("c", {}, RUN)
    expect(isDeepStrictEqual(store.read("c", {}), RUN)).toBe(true)
  })

  it("removes directories of no kept code, such as those of an older layout", async () => {
    mkdirSync(path.join(directory, "ab"), { recursive: true })
    writeFileSync(path.join(directory, "ab", "result.bin"), "")
    storeAt("code", first).prune()
    await vi.waitFor(
      () => {
        expect(directoriesIn(directory)).toEqual([])
      },
      { timeout: 10_000 },
    )
  })

  it("deletes again a directory whose deleting process stopped, and leaves one being deleted", async () => {
    const stoppedProcess = spawnSync(process.execPath, ["--eval", ""]).pid
    const stopped = path.join(directory, `.removed-${String(stoppedProcess)}-1`)
    const going = path.join(directory, `.removed-${String(process.pid)}-2`)
    mkdirSync(path.join(stopped, "inside"), { recursive: true })
    mkdirSync(going)
    storeAt("code", first).prune()
    await vi.waitFor(
      () => {
        expect(existsSync(stopped)).toBe(false)
      },
      { timeout: 10_000 },
    )
    expect(existsSync(going)).toBe(true)
  })
})

describe("trees that share the store", () => {
  const day = "2026-01-01"

  let trees: string

  beforeEach(() => {
    trees = mkdtempSync(path.join(os.tmpdir(), "mermaid-run-store-trees-"))
    for (const tree of ["one", "two"]) mkdirSync(path.join(trees, tree))
  })

  afterEach(() => {
    rmSync(trees, { recursive: true, force: true })
  })

  /** A store of `code` used by the tree `tree`, which it records. */
  function storeOfTree(tree: string, code: string): MermaidRunStore {
    const store = new MermaidRunStore(directory, code, {
      tree: path.join(trees, tree),
      now: clockAt(day),
    })
    store.recordTree()
    store.write("t", {}, RUN)
    return store
  }

  /** Waits until the directories of code in the store are `codes`. */
  async function codesBecome(codes: string[]): Promise<void> {
    await vi.waitFor(
      () => {
        expect(
          directoriesIn(directory).filter((name) => name !== ".trees"),
        ).toEqual(codes)
      },
      { timeout: 10_000 },
    )
  }

  it("keeps the results of the code of every tree that uses the store", async () => {
    const one = storeOfTree("one", "code-one")
    storeOfTree("two", "code-two")
    storeAt("unused", day).write("t", {}, RUN)
    one.removeOtherCode()
    await codesBecome(["code-one", "code-two"])
    storeAt("unused", day).write("t", {}, RUN)
    one.prune()
    await codesBecome(["code-one", "code-two"])
    expect(isDeepStrictEqual(storeAt("code-two", day).read("t", {}), RUN)).toBe(
      true,
    )
  })

  it("removes the results of a code once its tree records another code, or is gone", async () => {
    const one = storeOfTree("one", "code-one")
    storeOfTree("two", "code-two")
    storeOfTree("two", "code-two-changed")
    one.prune()
    await codesBecome(["code-one", "code-two-changed"])
    rmSync(path.join(trees, "two"), { recursive: true })
    one.prune()
    await codesBecome(["code-one"])
    expect(readdirSync(path.join(directory, ".trees"))).toHaveLength(1)
  })

  it("removes a record of a tree it cannot read", () => {
    storeOfTree("one", "code-one")
    const unreadable = path.join(directory, ".trees", "unreadable")
    writeFileSync(unreadable, "{")
    storeAt("code-one", day).prune()
    expect(existsSync(unreadable)).toBe(false)
  })
})

describe("a store that cannot be written", () => {
  const day = "2026-01-01"

  it("does not throw when a record of a tree is a directory, and removes it", () => {
    const records = path.join(directory, ".trees")
    mkdirSync(path.join(records, "record", "inside"), { recursive: true })
    const store = storeAt("code", day)
    expect(() => {
      store.removeOtherCode()
    }).not.toThrow()
    expect(existsSync(path.join(records, "record"))).toBe(false)
  })

  it("does not throw when the directory of the records, or of the code, is a file", () => {
    writeFileSync(path.join(directory, ".trees"), "")
    writeFileSync(path.join(directory, "code"), "")
    const store = new MermaidRunStore(directory, "code", {
      now: clockAt(day),
      tree: directory,
    })
    expect(() => {
      store.recordTree()
      store.removeOtherCode()
      store.write("t", {}, RUN)
      store.prune()
    }).not.toThrow()
    expect(store.read("t", {})).toBeUndefined()
  })

  it("does not throw on options that cannot be serialized, and neither stores nor finds them", () => {
    const store = storeAt("code", day)
    const options = {
      config: { theme: () => "dark" },
    } as unknown as RunMermaidOptions
    expect(() => {
      store.write("t", options, RUN)
    }).not.toThrow()
    expect(store.read("t", options)).toBeUndefined()
    expect(resultFilesUnder(directory)).toEqual([])
    const config = { theme: () => "dark" } as unknown as MermaidConfig
    expect(() => {
      store.write("t", {}, { ...RUN, embedded: { ...RUN.embedded!, config } })
    }).not.toThrow()
    expect(resultFilesUnder(directory)).toEqual([])
  })

  it("does not throw when pruning in a directory that is a file", () => {
    const file = path.join(directory, "root-is-a-file")
    writeFileSync(file, "")
    const store = new MermaidRunStore(file, "code", { now: clockAt(day) })
    expect(() => {
      store.pruneAlone()
      store.pruneInBackground()
      store.prune()
    }).not.toThrow()
  })

  it("makes no default store, and does not throw, when the files of the code cannot be read", async () => {
    const tree = path.join(directory, "tree")
    mkdirSync(path.join(tree, "src"), { recursive: true })
    writeFileSync(path.join(tree, "pnpm-lock.yaml"), "")
    const copy = path.join(tree, "src", "mermaid-run-store.ts")
    copyFileSync(
      path.join(import.meta.dirname, "..", "src", "mermaid-run-store.ts"),
      copy,
    )
    const { defaultMermaidRunStore: made } = (await import(
      pathToFileURL(copy).href
    )) as { defaultMermaidRunStore: typeof defaultMermaidRunStore }
    expect(made("1.0.0")).toBeUndefined()
    expect(existsSync(path.join(tree, "node_modules"))).toBe(false)
  })

  it("does not throw when the marker of a full store, or the lock, is a directory", () => {
    const store = storeAt("code", day)
    store.write("t", {}, RUN)
    mkdirSync(path.join(directory, ".full"))
    mkdirSync(path.join(directory, ".pruning"))
    expect(() => {
      store.prune()
      store.pruneAlone()
    }).not.toThrow()
    expect(isDeepStrictEqual(store.read("t", {}), RUN)).toBe(true)
    expect(existsSync(path.join(directory, ".pruned"))).toBe(true)
  })
})

describe("pruning in the background", () => {
  const today = new Date().toISOString().slice(0, 10)

  /** A store of the test's directory over its most results, at the day. */
  function storeTooFull(): MermaidRunStore {
    const store = storeAt("code", today, { mostResults: 1 })
    store.write("a", {}, RUN)
    store.write("b", {}, RUN)
    return store
  }

  it("prunes in a process of its own, which marks the store too full", async () => {
    storeTooFull().pruneInBackground()
    await vi.waitFor(
      () => {
        expect(existsSync(path.join(directory, ".pruned"))).toBe(true)
      },
      { timeout: 20_000 },
    )
    expect(existsSync(path.join(directory, ".full"))).toBe(true)
    expect(existsSync(path.join(directory, ".pruning"))).toBe(false)
  }, 30_000)

  it("does not prune again soon after a prune, nor while a prune runs", async () => {
    const store = storeTooFull()
    writeFileSync(path.join(directory, ".pruned"), "")
    store.pruneInBackground()
    rmSync(path.join(directory, ".pruned"))
    writeFileSync(path.join(directory, ".pruning"), String(process.pid))
    store.pruneInBackground()
    await new Promise((resolve) => {
      setTimeout(resolve, 3000)
    })
    expect(existsSync(path.join(directory, ".full"))).toBe(false)
  }, 30_000)

  it("prunes again once the last prune ended ten minutes ago, not before", async () => {
    const store = storeTooFull()
    const marker = path.join(directory, ".pruned")
    const now = clockAt(today)().getTime()
    const tenMinutes = 10 * 60 * 1000
    writeFileSync(marker, "")
    utimesSync(
      marker,
      new Date(now - tenMinutes + 1000),
      new Date(now - tenMinutes + 1000),
    )
    store.pruneInBackground()
    await new Promise((resolve) => {
      setTimeout(resolve, 3000)
    })
    expect(existsSync(path.join(directory, ".full"))).toBe(false)
    utimesSync(marker, new Date(now - tenMinutes), new Date(now - tenMinutes))
    store.pruneInBackground()
    await vi.waitFor(
      () => {
        expect(existsSync(path.join(directory, ".full"))).toBe(true)
      },
      { timeout: 20_000 },
    )
  }, 40_000)

  it("takes over the lock of a pruning process that stopped", () => {
    const stoppedProcess = spawnSync(process.execPath, ["--eval", ""]).pid
    writeFileSync(path.join(directory, ".pruning"), String(stoppedProcess))
    storeTooFull().pruneAlone()
    expect(existsSync(path.join(directory, ".full"))).toBe(true)
    expect(existsSync(path.join(directory, ".pruning"))).toBe(false)
  })

  it("takes over a lock that is there before its process id is written", () => {
    writeFileSync(path.join(directory, ".pruning"), "")
    storeTooFull().pruneAlone()
    expect(existsSync(path.join(directory, ".full"))).toBe(true)
    expect(existsSync(path.join(directory, ".pruned"))).toBe(true)
    expect(existsSync(path.join(directory, ".pruning"))).toBe(false)
  })

  it("starts a prune when the lock is there before its process id is written", async () => {
    writeFileSync(path.join(directory, ".pruning"), "")
    storeTooFull().pruneInBackground()
    await vi.waitFor(
      () => {
        expect(existsSync(path.join(directory, ".pruned"))).toBe(true)
      },
      { timeout: 20_000 },
    )
    expect(existsSync(path.join(directory, ".full"))).toBe(true)
    expect(existsSync(path.join(directory, ".pruning"))).toBe(false)
  }, 30_000)
})

describe("a process that cannot be started", () => {
  const today = new Date().toISOString().slice(0, 10)
  const otherCode = "code-of-no-tree"

  /**
   * Runs a prune in the background and the deleting of a directory of other
   * code while `process.execPath` is `execPath`, which is the program that
   * both start. Neither may throw, nor leave an error that nothing handles
   * (the run of vitest fails on one), and neither may have done anything.
   */
  async function startWithProgram(execPath: string): Promise<MermaidRunStore> {
    const store = storeAt("code", today, { mostResults: 1 })
    store.write("a", {}, RUN)
    store.write("b", {}, RUN)
    mkdirSync(path.join(directory, otherCode))
    const original = process.execPath
    process.execPath = execPath
    try {
      expect(() => {
        store.pruneInBackground()
        store.removeOtherCode()
      }).not.toThrow()
    } finally {
      process.execPath = original
    }
    await new Promise((resolve) => {
      setTimeout(resolve, 1000)
    })
    expect(existsSync(path.join(directory, ".full"))).toBe(false)
    expect(existsSync(path.join(directory, otherCode))).toBe(true)
    return store
  }

  /** Waits for the prune that a store starts again to end. */
  async function pruneAgain(store: MermaidRunStore): Promise<void> {
    store.pruneInBackground()
    await vi.waitFor(
      () => {
        expect(existsSync(path.join(directory, ".full"))).toBe(true)
      },
      { timeout: 20_000 },
    )
  }

  it("is passed over when the program does not exist, and tried again later", async () => {
    const store = await startWithProgram(path.join(directory, "no-such-node"))
    await pruneAgain(store)
  }, 40_000)

  it("is passed over when the program is refused at once, and tried again later", async () => {
    const store = await startWithProgram("")
    await pruneAgain(store)
  }, 40_000)
})

describe("run from the build", () => {
  let tree: string

  /** The build, in the tree. */
  function libOf(): string {
    return path.join(tree, "lib")
  }

  beforeAll(async () => {
    // A tree of its own, which is what the build finds the store and the
    // lockfile by: the lockfile, `node_modules` with the two modules that the
    // build does not bundle, and the build (`lib`).
    tree = mkdtempSync(path.join(os.tmpdir(), "mermaid-run-store-build-"))
    writeFileSync(path.join(tree, "pnpm-lock.yaml"), "lock")
    const packageDirectory = path.join(import.meta.dirname, "..")
    mkdirSync(path.join(tree, "node_modules"))
    for (const name of ["mermaid", "js-yaml"]) {
      symlinkSync(
        realpathSync(path.join(packageDirectory, "node_modules", name)),
        path.join(tree, "node_modules", name),
        "dir",
      )
    }
    await build({
      config: path.join(packageDirectory, "tsdown.config.ts"),
      cwd: packageDirectory,
      outDir: libOf(),
      dts: false,
      logLevel: "silent",
    })
  }, 120_000)

  afterAll(() => {
    rmSync(tree, { recursive: true, force: true })
  })

  it("prunes from the build too, whose bundled code does not export the store", async () => {
    const built = (await import(
      pathToFileURL(path.join(libOf(), "mermaid-run-store.mjs")).href
    )) as { MermaidRunStore: typeof MermaidRunStore }
    const store = new built.MermaidRunStore(directory, "code", {
      now: clockAt(new Date().toISOString().slice(0, 10)),
      mostResults: 1,
    })
    store.write("a", {}, RUN)
    store.write("b", {}, RUN)
    store.pruneInBackground()
    await vi.waitFor(
      () => {
        expect(existsSync(path.join(directory, ".pruned"))).toBe(true)
      },
      { timeout: 20_000 },
    )
    expect(existsSync(path.join(directory, ".full"))).toBe(true)
  }, 60_000)

  it("stores the results of a run of the build under the identity of the build", async () => {
    const text = "flowchart LR\n  A --> B\n"
    const storeDirectory = path.join(
      tree,
      "node_modules",
      ".cache",
      "mmd-toolkit",
      "mermaid-runs",
    )
    // The store is on in the process of the build, unlike in this one.
    vi.stubEnv(MERMAID_RUN_STORE_SWITCH, "")
    let run: ReturnType<typeof spawnSync>
    try {
      run = spawnSync(
        process.execPath,
        [
          "--input-type=module",
          "--eval",
          `const [url, text] = process.argv.slice(1)
const { runMermaidWithEmbeddedData } = await import(url)
await runMermaidWithEmbeddedData(text)`,
          pathToFileURL(path.join(libOf(), "mermaid.mjs")).href,
          text,
        ],
        { encoding: "utf8" },
      )
    } finally {
      vi.unstubAllEnvs()
    }
    expect(run.stderr).toBe("")
    expect(run.status).toBe(0)
    const identity = codeIdentityOf(libOf(), tree, mermaidVersion)
    expect(
      directoriesIn(storeDirectory).filter((name) => name !== ".trees"),
    ).toEqual([identity])
    expect(readdirSync(path.join(storeDirectory, ".trees"))).toHaveLength(1)
    expect(
      isDeepStrictEqual(
        new MermaidRunStore(storeDirectory, identity).read(text, {}),
        await runMermaidWithEmbeddedData(text),
      ),
    ).toBe(true)
    // The prune that the run started ends before the tree is removed.
    await vi.waitFor(
      () => {
        expect(existsSync(path.join(storeDirectory, ".pruned"))).toBe(true)
      },
      { timeout: 20_000 },
    )
  }, 60_000)
})

describe("codeIdentityOf", () => {
  it("changes with every file of the build, the lockfile and the mermaid version", () => {
    const code = path.join(directory, "lib")
    const nested = path.join(code, "normalizers")
    mkdirSync(nested, { recursive: true })
    writeFileSync(path.join(directory, "pnpm-lock.yaml"), "lock")
    writeFileSync(path.join(code, "a.ts"), "a")
    writeFileSync(path.join(nested, "b.ts"), "b")

    /** The identity of the code as it is now. */
    function identity(): string {
      return codeIdentityOf(code, directory, "1.0.0")
    }

    const first = identity()
    expect(identity()).toBe(first)
    writeFileSync(path.join(nested, "b.ts"), "b changed")
    const afterNested = identity()
    expect(afterNested).not.toBe(first)
    writeFileSync(path.join(code, "c.ts"), "")
    const afterAdded = identity()
    expect(afterAdded).not.toBe(afterNested)
    writeFileSync(path.join(directory, "pnpm-lock.yaml"), "lock changed")
    const afterLock = identity()
    expect(afterLock).not.toBe(afterAdded)
    expect(codeIdentityOf(code, directory, "1.0.1")).not.toBe(afterLock)
  })

  it("changes with the versions of Node.js and of V8", () => {
    const code = path.join(directory, "lib")
    mkdirSync(code, { recursive: true })
    writeFileSync(path.join(directory, "pnpm-lock.yaml"), "lock")
    writeFileSync(path.join(code, "a.ts"), "a")

    /** The identity of the code as it is now. */
    function identity(): string {
      return codeIdentityOf(code, directory, "1.0.0")
    }

    const first = identity()
    for (const name of ["node", "v8"] as const) {
      const original = Object.getOwnPropertyDescriptor(process.versions, name)
      if (original === undefined) throw new Error(`no version of ${name}`)
      Object.defineProperty(process.versions, name, {
        ...original,
        value: `${String(original.value)}-other`,
      })
      try {
        expect(identity(), name).not.toBe(first)
      } finally {
        Object.defineProperty(process.versions, name, original)
      }
      expect(identity(), name).toBe(first)
    }
  })

  it("changes with the files of the source that decide a result, and only those", () => {
    const code = path.join(directory, "src")
    writeFileSync(path.join(directory, "pnpm-lock.yaml"), "lock")
    for (const file of [...RESULT_FILES, "index.ts"]) {
      mkdirSync(path.dirname(path.join(code, file)), { recursive: true })
      writeFileSync(path.join(code, file), file)
    }

    /** The identity of the code as it is now. */
    function identity(): string {
      return codeIdentityOf(code, directory, "1.0.0")
    }

    const first = identity()
    writeFileSync(path.join(code, "index.ts"), "changed")
    expect(identity()).toBe(first)
    writeFileSync(path.join(code, "normalizers", "state.ts"), "changed")
    expect(identity()).not.toBe(first)
  })

  it("lists as the files that decide a result those that mermaid.ts imports at run time", () => {
    const source = path.join(import.meta.dirname, "..", "src")
    const reached = new Set<string>()
    const waiting = ["mermaid.ts"]
    for (let file = waiting.pop(); file !== undefined; file = waiting.pop()) {
      if (reached.has(file)) continue
      reached.add(file)
      for (const imported of runtimeImportsOf(path.join(source, file))) {
        waiting.push(
          path.relative(
            source,
            path.resolve(path.dirname(path.join(source, file)), imported),
          ),
        )
      }
    }
    expect([...reached].sort()).toEqual([...RESULT_FILES].sort())
  })
})

/**
 * The relative paths that `file` imports or exports from at run time, read
 * with the TypeScript parser: the import and export declarations, but not
 * those of types only, which Node.js removes, and the calls of `import()`
 * anywhere in the file.
 */
function runtimeImportsOf(file: string): string[] {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, "utf8"),
    ts.ScriptTarget.Latest,
  )
  const paths: string[] = []

  /** Adds the path that `specifier` names, if it is a relative one. */
  function add(specifier: ts.Node | undefined): void {
    if (
      specifier !== undefined &&
      ts.isStringLiteral(specifier) &&
      specifier.text.startsWith(".")
    ) {
      paths.push(specifier.text)
    }
  }

  /** Looks for imports in `node` and everything in it. */
  function visit(node: ts.Node): void {
    if (
      ts.isImportDeclaration(node) &&
      node.importClause?.isTypeOnly !== true
    ) {
      add(node.moduleSpecifier)
    } else if (ts.isExportDeclaration(node) && !node.isTypeOnly) {
      add(node.moduleSpecifier)
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword
    ) {
      add(node.arguments[0])
    }
    ts.forEachChild(node, visit)
  }

  visit(source)
  return paths
}

describe("stored results of mermaid.js", () => {
  /**
   * The fixtures that give the store each shape of result to save, one for
   * each question about the shape: what `shows` says about the result of the
   * fixture is why it is listed.
   */
  const SHAPES: readonly {
    readonly diagram: DiagramType
    readonly name: string
    readonly question: string
    readonly shows: (run: MermaidRun) => boolean
  }[] = [
    {
      diagram: "class",
      name: "db-annotation-statement-undefined-class",
      question: "a rejection, which has no embedded values",
      shows: (run) => !run.outcome.accepted && run.embedded === undefined,
    },
    {
      diagram: "common",
      name: "comment-bare",
      question: "a flowchart Db",
      shows: (run) =>
        run.outcome.accepted && run.outcome.diagramType === "flowchart-v2",
    },
    {
      diagram: "sequence",
      name: "db-acc-descr-block-after-message",
      question: "a sequence Db",
      shows: (run) =>
        run.outcome.accepted && run.outcome.diagramType === "sequence",
    },
    {
      diagram: "class",
      name: "db-acc-descr-block-collapse",
      question: "a class Db",
      shows: (run) =>
        run.outcome.accepted && run.outcome.diagramType === "classDiagram",
    },
    {
      diagram: "state",
      name: "db-acc-descr-block-crlf",
      question: "a state Db",
      shows: (run) =>
        run.outcome.accepted && run.outcome.diagramType === "stateDiagram",
    },
    {
      diagram: "common",
      name: "directive-init-theme",
      question: "a configuration changed by a directive of the text",
      shows: (run) => run.embedded?.config.theme === "dark",
    },
    {
      diagram: "class",
      name: "config-security-level-loose-click",
      question: "a configuration changed by the options of the run",
      shows: (run) => run.embedded?.config.securityLevel === "loose",
    },
    {
      diagram: "common",
      name: "config-title-list",
      question: "a title taken from the frontmatter",
      shows: (run) => run.embedded?.title === "1,2",
    },
    {
      diagram: "flowchart",
      name: "db-data-block-shape-names",
      question: "the effects of data blocks",
      shows: (run) => run.embedded?.dataBlockEffects.length === 14,
    },
  ]

  it("are the same as the results made again, for each shape of result", async () => {
    const store = new MermaidRunStore(directory, "code")
    for (const { diagram, name, question, shows } of SHAPES) {
      const fixture = await loadFixture(diagram, name)
      const { input, config } = fixture
      const options = config === undefined ? {} : { config }
      const run = await runMermaidWithEmbeddedData(input, options)
      expect(shows(run), `${name} shows ${question}`).toBe(true)
      store.write(input, options, run)
      const remade = await runMermaidWithEmbeddedData(input, options)
      expect(
        isDeepStrictEqual(store.read(input, options), remade),
        `${name}: ${question}`,
      ).toBe(true)
    }
  }, 60_000)

  it("do not include an error thrown instead of a result", async () => {
    const text = "flowchart LR\n  A --> B\n"
    const siteError: RunMermaidOptions = {
      config: { theme: "base", themeVariables: { primaryColor: "##00ff00" } },
    }
    const misspelled = { widthoutDivergences: [] } as RunMermaidOptions
    vi.stubEnv(MERMAID_RUN_STORE_SWITCH, "")
    try {
      const store = defaultMermaidRunStore(mermaidVersion)
      await expect(runMermaidWithEmbeddedData(text, siteError)).rejects.toThrow(
        "Unsupported color format",
      )
      expect(store?.read(text, siteError)).toBeUndefined()
      await expect(
        runMermaidWithEmbeddedData(text, misspelled),
      ).rejects.toThrow(TypeError)
      expect(store?.read(text, misspelled)).toBeUndefined()
      // What was thrown does not stay in the way of the same text without it.
      expect(await runMermaidWithEmbeddedData(text)).toMatchObject({
        outcome: { accepted: true },
      })
    } finally {
      vi.unstubAllEnvs()
    }
  })

  it("are neither read nor written by detectDiagramType", async () => {
    const text = `flowchart LR\n  A --> B${String(Date.now())}\n`
    vi.stubEnv(MERMAID_RUN_STORE_SWITCH, "")
    const read = vi.spyOn(MermaidRunStore.prototype, "read")
    const write = vi.spyOn(MermaidRunStore.prototype, "write")
    try {
      expect(await detectDiagramType(text)).toBe("flowchart-v2")
      expect(read).not.toHaveBeenCalled()
      expect(write).not.toHaveBeenCalled()
      // The spies see a run function, which does use the store.
      await runMermaidWithEmbeddedData(text)
      expect(read).toHaveBeenCalledTimes(1)
      expect(write).toHaveBeenCalledTimes(1)
    } finally {
      vi.restoreAllMocks()
      vi.unstubAllEnvs()
    }
  })

  it("are stored and read by the run functions when the store is on", async () => {
    const text = `flowchart LR\n  A --> B${String(Date.now())}\n`
    const fresh = await runMermaidWithEmbeddedData(text)
    vi.stubEnv(MERMAID_RUN_STORE_SWITCH, "")
    try {
      const store = defaultMermaidRunStore(mermaidVersion)
      expect(store?.read(text, {})).toBeUndefined()
      const first = await runMermaidWithEmbeddedData(text)
      expect(isDeepStrictEqual(store?.read(text, {}), fresh)).toBe(true)
      expect(
        isDeepStrictEqual(await runMermaidWithEmbeddedData(text), first),
      ).toBe(true)
    } finally {
      vi.unstubAllEnvs()
    }
  })
})
