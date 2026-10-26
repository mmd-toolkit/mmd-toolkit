/**
 * A store on disk of the results of `runMermaidWithEmbeddedData()`, so that a
 * text read once by mermaid.js is not read again: the pinned mermaid.js gives
 * the same text with the same options the same result. See the section on the
 * store in docs/expected-results.md.
 *
 * Nothing the store does makes a run fail: a result that cannot be read,
 * written or removed only makes mermaid.js run again.
 */
import { spawn } from "node:child_process"
import { createHash, randomBytes } from "node:crypto"
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { deserialize, serialize } from "node:v8"
import { deflateSync, inflateSync } from "node:zlib"
import type { EmbeddedValues, MermaidOutcome, MermaidRun } from "./mermaid.ts"
import type { RunMermaidOptions } from "./run-mermaid-options.ts"

/**
 * The environment variable that turns the store off when it is
 * {@link MERMAID_RUN_STORE_DISABLED}. Unset or empty, the store is used.
 */
export const MERMAID_RUN_STORE_SWITCH = "MMD_TOOLKIT_MERMAID_CACHE"

/**
 * The value of {@link MERMAID_RUN_STORE_SWITCH} that turns the store off: a
 * word that every reading of YAML takes as a string, unlike `off`, `no` or
 * `false`, so that a workflow file sets it as written.
 */
export const MERMAID_RUN_STORE_DISABLED = "disabled"

/**
 * Whether the store is used, read from the environment at each call. Throws
 * on any other value of the switch, so that a value meant to turn the store
 * off (`off`, `0`) never leaves it on unnoticed.
 */
export function isMermaidRunStoreOn(): boolean {
  // eslint-disable-next-line no-process-env -- the store is turned off from outside, by the commands and runs that must not take stored results
  const value = process.env[MERMAID_RUN_STORE_SWITCH]
  if (value === undefined || value === "") return true
  if (value === MERMAID_RUN_STORE_DISABLED) return false
  throw new TypeError(
    `${MERMAID_RUN_STORE_SWITCH} must be unset, empty or ${MERMAID_RUN_STORE_DISABLED}, not ${JSON.stringify(value)}`,
  )
}

/**
 * The files of `src/` that decide a result: `mermaid.ts` and every file it
 * imports at run time, directly or not. A test checks that the list is that
 * set. The other files of `src/` (the loader of the fixtures, the checks of trees)
 * do not change a result, so changing them keeps the stored results.
 */
export const RESULT_FILES: readonly string[] = [
  "configuration.ts",
  "divergence-removals.ts",
  "mermaid-environment-error.ts",
  "mermaid-run-store.ts",
  "mermaid.ts",
  "normalizers/agentflow.ts",
  "normalizers/architecture.ts",
  "normalizers/block.ts",
  "normalizers/browser-stand-ins.ts",
  "normalizers/c4.ts",
  "normalizers/class.ts",
  "normalizers/click-calls.ts",
  "normalizers/data-blocks.ts",
  "normalizers/er.ts",
  "normalizers/flowchart.ts",
  "normalizers/gantt.ts",
  "normalizers/gitgraph.ts",
  "normalizers/info.ts",
  "normalizers/packet.ts",
  "normalizers/index.ts",
  "normalizers/ishikawa.ts",
  "normalizers/journey.ts",
  "normalizers/json.ts",
  "normalizers/kanban.ts",
  "normalizers/mindmap.ts",
  "normalizers/pie.ts",
  "normalizers/quadrant.ts",
  "normalizers/radar.ts",
  "normalizers/railroad.ts",
  "normalizers/requirement.ts",
  "normalizers/sankey.ts",
  "normalizers/sequence.ts",
  "normalizers/state.ts",
  "normalizers/timeline.ts",
  "normalizers/treemap.ts",
  "normalizers/usecase.ts",
  "normalizers/venn.ts",
  "normalizers/xychart.ts",
  "rejections.ts",
  "run-mermaid-options.ts",
  "summary-number.ts",
]

/** The directory of the store, under the root of the repository. */
const STORE_DIRECTORY = path.join(
  "node_modules",
  ".cache",
  "mmd-toolkit",
  "mermaid-runs",
)

/**
 * The number of results the store holds at most. It was set larger than the
 * results of the runs at full size that could be counted; whether it leaves
 * room for all of them is not measured. Each result takes about 4 KB on disk,
 * the least a file takes. {@link MermaidRunStore.prune} removes the results
 * last used longest ago until the store is within it, and no process writes
 * while it holds more all the same.
 */
export const MOST_RESULTS = 2_000_000

/**
 * How long after a prune the next one may start, in milliseconds. A prune
 * reads every name of the store, which takes seconds for a large store, so it
 * runs in a process of its own and not often; until the next one, the store
 * may hold some more results than its most.
 */
const PRUNE_INTERVAL_MILLISECONDS = 10 * 60 * 1000

/**
 * The file in the store that is there while the store holds more results
 * than its most, written by a prune: no process writes then.
 */
const FULL_MARKER = ".full"

/** The file in the store whose time is that of the last prune. */
const PRUNED_MARKER = ".pruned"

/**
 * The file in the store that holds the process id of the process pruning it,
 * so that two prunes do not run at once. The file is created before the id is
 * written to it, and a process that reads it in between takes it as left by a
 * process that stopped; two processes that take over the lock of a stopped one
 * at the same moment do the same. Both then prune, which is rare and does no
 * harm, since a prune only removes what is no longer needed; and the lock is
 * made in a way that every file system has.
 */
const PRUNING_LOCK = ".pruning"

/**
 * The URL of this module as the process that prunes loads it: this file when
 * run from source, and the entry `mermaid-run-store.mjs` of the build when
 * run from it, since the build bundles this code into a file that does not
 * export {@link MermaidRunStore}. Both have the extension of the file that
 * runs.
 */
const STORE_MODULE_URL = new URL(
  `./mermaid-run-store${path.extname(fileURLToPath(import.meta.url))}`,
  import.meta.url,
).href

/**
 * How old a temporary file must be to be taken as left by a write that
 * stopped half-way (its process ended) rather than one still going, which
 * lasts a moment.
 */
const LEFTOVER_AGE_MILLISECONDS = 60 * 60 * 1000

/**
 * The start of the name of a directory being deleted, followed by the process
 * id of the process deleting it.
 */
const REMOVED_PREFIX = ".removed-"

/**
 * The script of the process that prunes the store: it loads this module from
 * the URL it is given and prunes with the settings it is given.
 */
const PRUNING_SCRIPT = `
const [moduleUrl, settings] = process.argv.slice(1)
const { root, codeIdentity, codeIdentitiesKept, mostResults } = JSON.parse(settings)
import(moduleUrl).then(({ MermaidRunStore }) => {
  new MermaidRunStore(root, codeIdentity, { codeIdentitiesKept, mostResults }).pruneAlone()
})
`

/** The name of the directory of a day that holds the configurations. */
const CONFIGURATIONS = "configurations"

/**
 * The directory in the store that holds a record for each tree that uses the
 * store (see {@link TreeRecord}), in a file named by the SHA-256 of the
 * tree's path.
 */
const TREES = ".trees"

/**
 * What the file of a result holds: the result without mermaid.js's whole
 * configuration, which is kept once per day in a file of its own, named by
 * its hash.
 */
interface StoredRun {
  /** Everything the key is made from, to tell a file of another key apart. */
  readonly identity: Buffer
  readonly outcome: MermaidOutcome
  readonly embedded:
    | {
        readonly configurationHash: string
        readonly rest: Omit<EmbeddedValues, "config">
      }
    | undefined
}

/** What a store is set up with, besides its directory and its code. */
export interface MermaidRunStoreSettings {
  /**
   * The identities of the code of this store's tree, run from source and from
   * the build. Their results are kept, with those of the other trees recorded
   * in the store (see {@link TreeRecord}). Defaults to the store's own code
   * identity.
   */
  readonly codeIdentitiesKept?: readonly string[]
  /**
   * The real path of the directory of this package in the tree that uses the
   * store, recorded by {@link MermaidRunStore.recordTree}. A store of no tree
   * records nothing.
   */
  readonly tree?: string
  /** The clock that gives the day. */
  readonly now?: () => Date
  /** The number of results the store holds at most. */
  readonly mostResults?: number
}

/**
 * What the store records of a tree that uses it: the real path of the
 * directory of this package in it, and the identities of its code when it
 * last started using the store. Several trees use one store when they share
 * `node_modules` (a copy of the repository that links to it, say). The results
 * of a code are kept while a tree that is still there records it; a tree that
 * changes its code records the new identities when it next uses the store.
 */
interface TreeRecord {
  readonly tree: string
  readonly codeIdentities: readonly string[]
}

/** The directory of a day of a kept code, with the number of its results. */
interface DayDirectory {
  readonly directory: string
  readonly day: string
  readonly results: number
}

/**
 * The results of earlier runs.
 *
 * The results of one code identity lie in a directory of their own, and in it
 * in a directory for each day (in UTC): one file per result, in a directory
 * named by the first two digits of its hash, and the configurations of the
 * day's results in a directory of their own. A result is written in the
 * directory of the day, and a result read from the directory of an earlier
 * day is moved to that of the day, its configuration copied along, so the day
 * a result lies in is the day it was last used. {@link prune} removes what is
 * no longer needed by whole directories, without reading the files.
 */
export class MermaidRunStore {
  private readonly root: string

  private readonly codeIdentity: string

  private readonly codeIdentitiesKept: readonly string[]

  private readonly now: () => Date

  private readonly mostResults: number

  private readonly tree: string | undefined

  /**
   * `root` is the directory of the store, and `codeIdentity` everything
   * besides the input and the options that decides a result (see
   * {@link codeIdentityOf}).
   */
  public constructor(
    root: string,
    codeIdentity: string,
    settings: MermaidRunStoreSettings = {},
  ) {
    this.root = root
    this.codeIdentity = codeIdentity
    this.codeIdentitiesKept = settings.codeIdentitiesKept ?? [codeIdentity]
    this.now = settings.now ?? (() => new Date())
    this.mostResults = settings.mostResults ?? MOST_RESULTS
    this.tree = settings.tree
  }

  /**
   * The stored result of `text` with `options`, if there is one, looked for
   * in the directories of the days, from the day back.
   */
  public read(
    text: string,
    options: RunMermaidOptions,
  ): MermaidRun | undefined {
    const identity = identityOf(this.codeIdentity, text, options)
    if (identity === undefined) return undefined
    const today = this.today()
    const days = directoryNames(path.join(this.root, this.codeIdentity))
      .filter(isDay)
      .sort()
      .reverse()
    for (const day of days) {
      const file = this.resultFileOf(identity, day)
      const stored = readCompressed(file)
      if (stored === undefined) continue
      if (!isStoredRun(stored) || !identity.equals(stored.identity)) {
        return undefined
      }
      const run = this.runOf(stored, day)
      if (run === undefined) return undefined
      if (day !== today) this.moveToToday(stored, file, day, today)
      return run
    }
    return undefined
  }

  /**
   * Stores the result of `text` with `options`, unless the last prune found
   * the store holding more results than it may (see {@link FULL_MARKER}).
   * Each file is written under another name and then renamed, so that
   * another process reading it at the same time sees the whole file or none.
   */
  public write(
    text: string,
    options: RunMermaidOptions,
    run: MermaidRun,
  ): void {
    if (existsSync(path.join(this.root, FULL_MARKER))) return
    const identity = identityOf(this.codeIdentity, text, options)
    if (identity === undefined) return
    const today = this.today()
    let embedded: StoredRun["embedded"]
    if (run.embedded !== undefined) {
      const { config, ...rest } = run.embedded
      const configuration = serializeQuietly(config)
      if (configuration === undefined) return
      const configurationHash = createHash("sha256")
        .update(configuration)
        .digest("hex")
      writeOnce(
        this.configurationFileOf(configurationHash, today),
        deflateSync(configuration),
      )
      embedded = { configurationHash, rest }
    }
    const stored = serializeQuietly({
      identity,
      outcome: run.outcome,
      embedded,
    } satisfies StoredRun)
    if (stored === undefined) return
    writeReplacing(this.resultFileOf(identity, today), deflateSync(stored))
  }

  /**
   * Removes what is no longer needed:
   *
   * - the results of code that no tree uses and the records of trees that are
   *   gone (see {@link removeOtherCode}), which are never used again;
   * - the directories of past days left with no result (their results were
   *   all used since, and moved to a later day);
   * - while the store holds more than its most results, the results last used
   *   longest ago, a day at a time from the oldest day, but never those of the
   *   day;
   * - the temporary files of writes that stopped half-way, in the
   *   directories of the days, among the records of the trees, and at the top
   *   of the store.
   *
   * A result is never removed only because it was last used long ago. Only
   * the names of directories and files, and the records of the trees, are
   * read.
   */
  public prune(): void {
    const today = this.today()
    this.removeOtherCode()
    const days = this.dayDirectoriesOf(this.keptCodeIdentities())
    this.removeLeftoversIn(this.root)
    this.removeLeftoversIn(path.join(this.root, TREES))
    for (const { directory } of days) {
      for (const shard of directoryNames(directory)) {
        this.removeLeftoversIn(path.join(directory, shard))
      }
    }
    let results = days.reduce((sum, entry) => sum + entry.results, 0)
    const pastDays = days
      .filter((entry) => entry.day !== today)
      .sort((a, b) => (a.day < b.day ? -1 : a.day > b.day ? 1 : 0))
    for (const entry of pastDays) {
      if (entry.results === 0 || results > this.mostResults) {
        deleteApart(entry.directory, this.root)
        results -= entry.results
      }
    }
    const fullMarker = path.join(this.root, FULL_MARKER)
    if (results > this.mostResults) writeReplacing(fullMarker, Buffer.alloc(0))
    else removeQuietly(fullMarker)
  }

  /**
   * Records that this store's tree uses {@link codeIdentitiesKept} (see
   * {@link TreeRecord}), replacing what was recorded of it before. A process
   * does this when it first uses the store, before it writes a result.
   */
  public recordTree(): void {
    if (this.tree === undefined) return
    const record: TreeRecord = {
      tree: this.tree,
      codeIdentities: this.codeIdentitiesKept,
    }
    writeReplacing(
      this.treeRecordFileOf(this.tree),
      Buffer.from(JSON.stringify(record)),
    )
  }

  /**
   * Removes the records of trees that are gone or that cannot be read, then
   * the results of code that no tree uses (see {@link keptCodeIdentities}),
   * and gives to a new process the directories whose deleting process stopped.
   * Only the names at the top of the store and the records of the trees are
   * read, so a process does this when it first uses the store.
   */
  public removeOtherCode(): void {
    this.removeStaleTreeRecords()
    const kept = this.keptCodeIdentities()
    for (const code of directoryNames(this.root)) {
      if (code === TREES) continue
      const codeDirectory = path.join(this.root, code)
      if (code.startsWith(REMOVED_PREFIX)) {
        if (!isDeletedByLiveProcess(code)) deleteApart(codeDirectory, this.root)
      } else if (!kept.has(code)) {
        deleteApart(codeDirectory, this.root)
      }
    }
  }

  /**
   * Starts {@link prune} in a process of its own, which goes on after this
   * one ends, unless a prune is running or the last one ended less than
   * {@link PRUNE_INTERVAL_MILLISECONDS} ago. That process loads this module
   * from {@link STORE_MODULE_URL}. A process that cannot be started leaves the
   * prune to a later one.
   */
  public pruneInBackground(): void {
    if (isPruningProcessRunning(this.root)) return
    const lastPrune = modifiedTime(path.join(this.root, PRUNED_MARKER))
    if (
      lastPrune !== undefined &&
      this.now().getTime() - lastPrune < PRUNE_INTERVAL_MILLISECONDS
    ) {
      return
    }
    const settings = JSON.stringify({
      root: this.root,
      codeIdentity: this.codeIdentity,
      codeIdentitiesKept: this.codeIdentitiesKept,
      mostResults: this.mostResults,
    })
    startApart(PRUNING_SCRIPT, [STORE_MODULE_URL, settings])
  }

  /**
   * {@link prune}, unless another process holds the lock of pruning (see
   * {@link PRUNING_LOCK}); the time of the prune is then kept in
   * {@link PRUNED_MARKER}. Run by the process that
   * {@link pruneInBackground} starts.
   */
  public pruneAlone(): void {
    try {
      mkdirSync(this.root, { recursive: true })
    } catch {
      return // The store cannot be used: there is nothing to prune.
    }
    const lock = path.join(this.root, PRUNING_LOCK)
    if (!takeLock(lock)) return
    try {
      this.prune()
      writeReplacing(path.join(this.root, PRUNED_MARKER), Buffer.alloc(0))
    } finally {
      removeQuietly(lock)
    }
  }

  /**
   * The identities of the code whose results are kept: those of this store's
   * tree ({@link codeIdentitiesKept}), and those recorded of each tree that is
   * still there.
   */
  private keptCodeIdentities(): Set<string> {
    const kept = new Set(this.codeIdentitiesKept)
    for (const { record } of this.treeRecords()) {
      if (!isTreeThere(record)) continue
      for (const code of record.codeIdentities) kept.add(code)
    }
    return kept
  }

  /**
   * Removes the record of each tree that is gone, and each that cannot be
   * read.
   */
  private removeStaleTreeRecords(): void {
    for (const { file, record } of this.treeRecords()) {
      if (!isTreeThere(record)) removeQuietly(file)
    }
  }

  /** Each file of the records of the trees, with the record it holds, if any. */
  private treeRecords(): { file: string; record: TreeRecord | undefined }[] {
    const records = path.join(this.root, TREES)
    return fileNames(records)
      .filter((name) => !name.endsWith(".tmp"))
      .map((name) => {
        const file = path.join(records, name)
        return { file, record: readTreeRecord(file) }
      })
  }

  /**
   * The directories of the days of the code `kept`, with the number of
   * results in each, counted from the names alone. Directories being deleted
   * and those of other code are not counted.
   */
  private dayDirectoriesOf(kept: ReadonlySet<string>): DayDirectory[] {
    const days: DayDirectory[] = []
    for (const code of kept) {
      const codeDirectory = path.join(this.root, code)
      for (const day of directoryNames(codeDirectory).filter(isDay)) {
        const directory = path.join(codeDirectory, day)
        days.push({ directory, day, results: resultsIn(directory) })
      }
    }
    return days
  }

  /**
   * Removes from `directory` the temporary files that writes which stopped
   * half-way left: those older than {@link LEFTOVER_AGE_MILLISECONDS}. A write
   * still going lasts a moment.
   */
  private removeLeftoversIn(directory: string): void {
    const oldestKept = this.now().getTime() - LEFTOVER_AGE_MILLISECONDS
    for (const name of fileNames(directory)) {
      if (!name.endsWith(".tmp")) continue
      const file = path.join(directory, name)
      try {
        if (statSync(file).mtimeMs >= oldestKept) continue
      } catch {
        continue // Renamed or removed by its process at the same moment.
      }
      removeQuietly(file)
    }
  }

  /** The result that `stored`, read from the directory of `day`, holds. */
  private runOf(stored: StoredRun, day: string): MermaidRun | undefined {
    if (stored.embedded === undefined) {
      return { outcome: stored.outcome, embedded: undefined }
    }
    const config = readCompressed(
      this.configurationFileOf(stored.embedded.configurationHash, day),
    ) as EmbeddedValues["config"] | undefined
    if (config === undefined) return undefined
    return {
      outcome: stored.outcome,
      embedded: { config, ...stored.embedded.rest },
    }
  }

  /**
   * Moves a result read from `day` to the directory of `today`, its
   * configuration copied there first. Another process may move or remove it
   * at the same moment; the result was read either way.
   */
  private moveToToday(
    stored: StoredRun,
    file: string,
    day: string,
    today: string,
  ): void {
    if (stored.embedded !== undefined) {
      const { configurationHash } = stored.embedded
      let configuration: Buffer
      try {
        configuration = readFileSync(
          this.configurationFileOf(configurationHash, day),
        )
      } catch {
        return
      }
      writeOnce(
        this.configurationFileOf(configurationHash, today),
        configuration,
      )
    }
    const target = this.resultFileOf(stored.identity, today)
    try {
      mkdirSync(path.dirname(target), { recursive: true })
      renameSync(file, target)
    } catch {
      // Another process moved or removed it first.
    }
  }

  /**
   * The file of a result on `day`: named by the SHA-256 of its key, in a
   * directory named by the first two digits.
   */
  private resultFileOf(identity: Buffer, day: string): string {
    const hash = createHash("sha256").update(identity).digest("hex")
    return path.join(this.dayDirectoryOf(day), hash.slice(0, 2), `${hash}.bin`)
  }

  /** The file of a configuration on `day`, named by its hash. */
  private configurationFileOf(hash: string, day: string): string {
    return path.join(this.dayDirectoryOf(day), CONFIGURATIONS, `${hash}.bin`)
  }

  /** The file of the record of `tree` (see {@link TREES}). */
  private treeRecordFileOf(tree: string): string {
    const hash = createHash("sha256").update(tree).digest("hex")
    return path.join(this.root, TREES, hash)
  }

  /** The directory of the current code on `day`. */
  private dayDirectoryOf(day: string): string {
    return path.join(this.root, this.codeIdentity, day)
  }

  /** The day of now, in UTC, as `YYYY-MM-DD`. */
  private today(): string {
    return this.now().toISOString().slice(0, 10)
  }
}

/**
 * Everything the key of `text` with `options` under `codeIdentity` is made
 * from, serialized as V8 does, which tells apart what JSON does not (a field
 * set to `undefined` and one left out, `NaN` and `null`).
 */
function identityOf(
  codeIdentity: string,
  text: string,
  options: RunMermaidOptions,
): Buffer | undefined {
  return serializeQuietly([codeIdentity, text, options])
}

/**
 * `value` serialized as V8 does, or `undefined` when it cannot be (a function
 * in it, say): what cannot be serialized is neither stored nor found.
 */
function serializeQuietly(value: unknown): Buffer | undefined {
  try {
    return serialize(value)
  } catch {
    return undefined
  }
}

/**
 * The value that `file` holds, compressed with a checksum, or `undefined`
 * when it is missing, cannot be read, or does not match its checksum.
 */
function readCompressed(file: string): unknown {
  try {
    return deserialize(inflateSync(readFileSync(file)))
  } catch {
    return undefined
  }
}

/** Whether the tree of a record that was read is still there. */
function isTreeThere(record: TreeRecord | undefined): record is TreeRecord {
  return record !== undefined && existsSync(record.tree)
}

/**
 * The record of a tree that `file` holds, or `undefined` when it is missing
 * or holds something else.
 */
function readTreeRecord(file: string): TreeRecord | undefined {
  let record: unknown
  try {
    record = JSON.parse(readFileSync(file, "utf8"))
  } catch {
    return undefined
  }
  if (typeof record !== "object" || record === null) return undefined
  const { tree, codeIdentities } = record as Record<string, unknown>
  if (
    typeof tree !== "string" ||
    !Array.isArray(codeIdentities) ||
    !codeIdentities.every((code) => typeof code === "string")
  ) {
    return undefined
  }
  return { tree, codeIdentities }
}

/**
 * Whether a value read from a file of a result has the shape of a
 * {@link StoredRun}, as far as the store reads it before comparing keys.
 */
function isStoredRun(value: unknown): value is StoredRun {
  return (
    typeof value === "object" &&
    value !== null &&
    Buffer.isBuffer((value as { identity?: unknown }).identity)
  )
}

/**
 * Removes `file`, a directory with what it holds too. A failure (a directory
 * that is not writable, a parent that is a file) leaves it where it is, for a
 * later prune: nothing the store does makes a run fail.
 */
function removeQuietly(file: string): void {
  try {
    rmSync(file, { recursive: true, force: true })
  } catch {
    // Left in place.
  }
}

/**
 * Writes `contents` as `file`, under another name first and then renamed. A
 * failure leaves the file unwritten.
 */
function writeReplacing(file: string, contents: Buffer): void {
  const temporary = `${file}.${process.pid}.${randomBytes(6).toString("hex")}.tmp`
  try {
    mkdirSync(path.dirname(file), { recursive: true })
    writeFileSync(temporary, contents)
    renameSync(temporary, file)
  } catch {
    removeQuietly(temporary)
  }
}

/**
 * {@link writeReplacing}, unless `file` is there already: a file named by the
 * hash of what it holds needs no second writing.
 */
function writeOnce(file: string, contents: Buffer): void {
  if (!existsSync(file)) writeReplacing(file, contents)
}

/**
 * The script of the process that deletes a directory: it renames the
 * directory to `.removed-` and its own process id, in `root`, and then
 * deletes it. When another process renamed it first, there is nothing left
 * for it to do.
 */
const DELETING_SCRIPT = `
const { renameSync, rmSync } = require("node:fs")
const path = require("node:path")
const [directory, root] = process.argv.slice(1)
const removed = path.join(root, "${REMOVED_PREFIX}" + process.pid + "-" + Date.now())
try {
  renameSync(directory, removed)
} catch {
  process.exit(0)
}
rmSync(removed, { recursive: true, force: true })
`

/**
 * Deletes `directory` in a process of its own (see {@link DELETING_SCRIPT}),
 * so that no process waits for many files to be deleted.
 */
function deleteApart(directory: string, root: string): void {
  startApart(DELETING_SCRIPT, [directory, root])
}

/**
 * Runs `script` with `parameters` in a Node.js process of its own, which goes
 * on after this process ends. A process that cannot be started (too many
 * processes, say) is passed over: what it was to do is tried again later.
 */
function startApart(script: string, parameters: readonly string[]): void {
  try {
    const started = spawn(process.execPath, ["--eval", script, ...parameters], {
      detached: true,
      stdio: "ignore",
    })
    started.on("error", () => {
      // Not started; tried again later.
    })
    started.unref()
  } catch {
    // Not started; tried again later.
  }
}

/**
 * Takes the lock of pruning, or returns `false` when a running process holds
 * it. A lock left by a process that stopped is taken over. The lock may be
 * there for a moment before its process id is written to it; a process that
 * reads it then takes it over, and both prune, which does no harm (see
 * {@link PRUNING_LOCK}).
 */
function takeLock(lock: string): boolean {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      writeFileSync(lock, String(process.pid), { flag: "wx" })
      return true
    } catch {
      if (isPruningProcessRunning(path.dirname(lock))) return false
      removeQuietly(lock)
    }
  }
  return false
}

/** Whether the process whose id the lock of pruning in `root` holds runs. */
function isPruningProcessRunning(root: string): boolean {
  let id: number
  try {
    id = Number(readFileSync(path.join(root, PRUNING_LOCK), "utf8"))
  } catch {
    return false
  }
  return isRunning(id)
}

/** The time `file` was last changed, in milliseconds, if it is there. */
function modifiedTime(file: string): number | undefined {
  try {
    return statSync(file).mtimeMs
  } catch {
    return undefined
  }
}

/**
 * Whether the process whose id the name of a directory being deleted holds
 * is still running: then it is deleting the directory, and no other process
 * takes it over.
 */
function isDeletedByLiveProcess(name: string): boolean {
  return isRunning(Number(name.slice(REMOVED_PREFIX.length).split("-")[0]))
}

/** Whether a process with the id `id` runs. */
function isRunning(id: number): boolean {
  if (!Number.isInteger(id) || id <= 0) return false
  try {
    process.kill(id, 0)
    return true
  } catch (error) {
    // EPERM: the process runs, as another user.
    return (error as { code?: unknown }).code === "EPERM"
  }
}

/** The number of results in the directory of a day, from the names alone. */
function resultsIn(dayDirectory: string): number {
  let results = 0
  for (const shard of directoryNames(dayDirectory)) {
    if (shard === CONFIGURATIONS) continue
    results += fileNames(path.join(dayDirectory, shard)).filter((name) =>
      name.endsWith(".bin"),
    ).length
  }
  return results
}

/** Whether `name` is a day as `YYYY-MM-DD`. */
function isDay(name: string): boolean {
  const date = new Date(`${name}T00:00:00Z`)
  return (
    !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === name
  )
}

/** The names of the directories in `directory`, or none when it is gone. */
function directoryNames(directory: string): string[] {
  try {
    return readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  } catch {
    return []
  }
}

/** The names in `directory`, or none when it is gone. */
function fileNames(directory: string): string[] {
  try {
    return readdirSync(directory)
  } catch {
    return []
  }
}

/** Whether {@link defaultStore} has been made in this process. */
let defaultStoreMade = false

let defaultStore: MermaidRunStore | undefined

/**
 * The store of this repository, or `undefined` when the repository's root is
 * not found or the files of the code cannot be read (the build is being made,
 * say): the process then runs without the store. Made once per process (once
 * per test file of a test run): the code identities are computed then, the
 * tree recorded as using them, the results of code that no tree uses removed,
 * and a prune started in the background when one is due; nothing that reads
 * every name of the store runs in this process.
 * The code of this tree is that run from source (`src/`) and from the build
 * (`lib/`).
 */
export function defaultMermaidRunStore(
  mermaidVersion: string,
): MermaidRunStore | undefined {
  if (!defaultStoreMade) {
    defaultStore = makeDefaultStore(mermaidVersion)
    defaultStoreMade = true
  }
  return defaultStore
}

/** {@link defaultMermaidRunStore}, made and started. */
function makeDefaultStore(mermaidVersion: string): MermaidRunStore | undefined {
  const codeDirectory = path.dirname(fileURLToPath(import.meta.url))
  const root = repositoryRootOf(codeDirectory)
  if (root === undefined) return undefined
  const packageDirectory = path.dirname(codeDirectory)
  let store: MermaidRunStore
  try {
    const codeIdentitiesKept = ["src", "lib"]
      .map((name) => path.join(packageDirectory, name))
      .filter((directory) => existsSync(directory))
      .map((directory) => codeIdentityOf(directory, root, mermaidVersion))
    store = new MermaidRunStore(
      path.join(root, STORE_DIRECTORY),
      codeIdentityOf(codeDirectory, root, mermaidVersion),
      { codeIdentitiesKept, tree: realpathSync(packageDirectory) },
    )
  } catch {
    return undefined
  }
  store.recordTree()
  store.removeOtherCode()
  store.pruneInBackground()
  return store
}

/** The nearest directory at or above `directory` that holds the lockfile. */
function repositoryRootOf(directory: string): string | undefined {
  let current = directory
  for (;;) {
    if (existsSync(path.join(current, "pnpm-lock.yaml"))) return current
    const parent = path.dirname(current)
    if (parent === current) return undefined
    current = parent
  }
}

/**
 * The files of the code in `codeDirectory` that decide a result, relative to
 * it: the {@link RESULT_FILES} of `src/`, or every file of `lib/`, where the
 * build bundles them into files named by hashes.
 */
function resultFilesIn(codeDirectory: string): string[] {
  if (path.basename(codeDirectory) === "src") return [...RESULT_FILES]
  return readdirSync(codeDirectory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) =>
      path.relative(codeDirectory, path.join(entry.parentPath, entry.name)),
    )
    .sort()
}

/**
 * The SHA-256 of what decides a result besides the input and the options:
 * the files of the code that decide it (see {@link resultFilesIn}), the
 * lockfile in `root` (the versions of mermaid.js and of every module it
 * uses), `mermaidVersion` (the version installed), and the versions of
 * Node.js and V8 (the format of the stored files, and the behavior of the
 * language).
 */
export function codeIdentityOf(
  codeDirectory: string,
  root: string,
  mermaidVersion: string,
): string {
  const hash = createHash("sha256")
  for (const file of resultFilesIn(codeDirectory)) {
    hash.update(file).update("\0")
    hash.update(readFileSync(path.join(codeDirectory, file))).update("\0")
  }
  hash.update(readFileSync(path.join(root, "pnpm-lock.yaml"))).update("\0")
  hash.update(
    JSON.stringify([
      mermaidVersion,
      process.versions.node,
      process.versions.v8,
    ]),
  )
  return hash.digest("hex")
}
