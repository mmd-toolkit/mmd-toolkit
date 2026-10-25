import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  SPECIFIED_FILE,
  baselineConfigOf,
  diagramDir,
  fixtureKey,
  generateExpected,
  generateSpecified,
  headOf,
  isFixtureName,
  readFixtures,
  writeNewFixture,
} from "../../../tools/src/fixture-store.ts"
import type {
  DiagramType,
  Expectation,
  ExpectedFile,
  FixtureHead,
} from "../src/index.ts"
import {
  getDefaultConfig,
  getFixturesRoot,
  loadFixtures,
} from "../src/index.ts"
import { runMermaid } from "../src/mermaid.ts"

const AUTHORED: FixtureHead = { source: { kind: "authored", note: "a note" } }

const MERMAID_SOURCE: FixtureHead = {
  source: {
    kind: "mermaid",
    ref: "mermaid@12.0.0",
    path: "packages/mermaid/src/example.spec.js",
    line: 7,
    test: "a > b",
  },
}

/** An accepted result with a Db no input gives, to tell it from a real one. */
const MADE_UP_ACCEPTED: Expectation = {
  accepted: true,
  diagramType: "flowchart-v2",
  db: { made: "up" },
}

/**
 * The accepted result `expected` that `generateExpected` gives, with its type
 * for a test that changes one field of it.
 */
function acceptedOf(
  file: ExpectedFile,
): Extract<ExpectedFile, { accepted: true }> {
  if (!file.accepted) throw new Error("expected an accepted result")
  return file
}

/** The first line of the message of an error that mermaid.js gave. */
function firstLine(result: Expectation): string {
  if (result.accepted) throw new Error("expected a rejection")
  return result.error.message.split("\n")[0] ?? ""
}

describe("headOf", () => {
  it("keeps the source alone of a file that has no config and no mark", () => {
    const file: ExpectedFile = { ...AUTHORED, ...MADE_UP_ACCEPTED }
    expect(headOf(file)).toStrictEqual({ source: AUTHORED.source })
  })

  it("keeps the source of kind mermaid whole", () => {
    const file: ExpectedFile = { ...MERMAID_SOURCE, ...MADE_UP_ACCEPTED }
    expect(headOf(file)).toStrictEqual({ source: MERMAID_SOURCE.source })
  })

  it("keeps the config", () => {
    const config = { flowchart: { inheritDir: true } }
    const file: ExpectedFile = { ...AUTHORED, config, ...MADE_UP_ACCEPTED }
    expect(headOf(file)).toStrictEqual({ source: AUTHORED.source, config })
  })

  it("keeps the known divergence", () => {
    const file: ExpectedFile = {
      ...AUTHORED,
      knownDivergence: "click-reserved-word",
      ...MADE_UP_ACCEPTED,
    }
    expect(headOf(file)).toStrictEqual({
      source: AUTHORED.source,
      knownDivergence: "click-reserved-word",
    })
  })

  it("keeps the three fields together and leaves the result out of a rejection", () => {
    const config = { sequence: { wrap: true } }
    const file: ExpectedFile = {
      ...AUTHORED,
      config,
      knownDivergence: "directive-as-token-boundary",
      accepted: false,
      error: { name: "Error", message: "m" },
    }
    expect(headOf(file)).toStrictEqual({
      source: AUTHORED.source,
      config,
      knownDivergence: "directive-as-token-boundary",
    })
  })
})

describe("isFixtureName", () => {
  it("accepts lowercase words and digits joined by single hyphens", () => {
    for (const name of [
      "a",
      "0",
      "lex-name",
      "spec-flow-edges-3f2a9c1b",
      "a1-2b",
    ]) {
      expect(isFixtureName(name)).toBe(true)
    }
  })

  it("rejects an empty name and a name with a hyphen at an end or twice in a row", () => {
    for (const name of ["", "-a", "a-", "a--b", "-"]) {
      expect(isFixtureName(name)).toBe(false)
    }
  })

  it("rejects upper case, an underscore, a space, a slash and a dot", () => {
    for (const name of ["A", "a-B", "a_b", "a b", "a/b", "../a", "a.b"]) {
      expect(isFixtureName(name)).toBe(false)
    }
  })

  it("rejects a letter outside a to z, and a line break after a valid name", () => {
    expect(isFixtureName("caf\u00e9")).toBe(false)
    expect(isFixtureName("a\n")).toBe(false)
  })
})

describe("fixtureKey", () => {
  it("is the input and the configuration with its keys sorted, as JSON", () => {
    expect(fixtureKey("A", { b: 1, a: { d: 1, c: 2 } })).toBe(
      '["A",{"a":{"c":2,"d":1},"b":1}]',
    )
  })

  it("does not tell a missing configuration from an empty one", () => {
    expect(fixtureKey("A", undefined)).toBe('["A",{}]')
    expect(fixtureKey("A", undefined)).toBe(fixtureKey("A", {}))
  })

  it("does not depend on the order of the keys of a configuration, at any depth", () => {
    expect(
      fixtureKey("A", { flowchart: { curve: "linear", inheritDir: true } }),
    ).toBe(
      fixtureKey("A", { flowchart: { inheritDir: true, curve: "linear" } }),
    )
  })

  it("tells apart inputs and values of the configuration", () => {
    expect(fixtureKey("A", { a: 1 })).not.toBe(fixtureKey("B", { a: 1 }))
    expect(fixtureKey("A", { a: 1 })).not.toBe(fixtureKey("A", { a: 2 }))
    expect(fixtureKey("A", { a: 1 })).not.toBe(fixtureKey("A", undefined))
  })

  it("keeps the order of an array, which is a value", () => {
    expect(fixtureKey("A", { a: [1, 2] })).not.toBe(
      fixtureKey("A", { a: [2, 1] }),
    )
    expect(fixtureKey("A", { a: [{ y: 1, x: 2 }] })).toBe(
      '["A",{"a":[{"x":2,"y":1}]}]',
    )
  })
})

describe("diagramDir and SPECIFIED_FILE", () => {
  it("puts the fixtures of a diagram type in the directory of that name under the fixtures root", () => {
    expect(diagramDir("class")).toBe(path.join(getFixturesRoot(), "class"))
    expect(diagramDir("common")).toBe(path.join(getFixturesRoot(), "common"))
  })

  it("names the file of the specified reading specified.json", () => {
    expect(SPECIFIED_FILE).toBe("specified.json")
  })
})

describe("readFixtures", () => {
  const fixtures = readFixtures("class")

  it("lists the directories of the diagram type, sorted by name", () => {
    const names = fixtures.map((fixture) => fixture.name)
    expect(names.length).toBeGreaterThan(0)
    for (let index = 1; index < names.length; index++) {
      expect((names[index - 1] ?? "") < (names[index] ?? "")).toBe(true)
    }
  })

  it("reads the input, the expected file and the directory of a fixture without a specified reading", () => {
    const name = "config-init-trailing-comma"
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    expect(fixture.dir).toBe(path.join(diagramDir("class"), name))
    expect(fixture.input).toBe(
      readFileSync(path.join(fixture.dir, "input.mmd"), "utf8"),
    )
    expect(fixture.file.source.kind).toBe("authored")
    expect(fixture.file.accepted).toBe(true)
    expect(fixture.specified).toBeUndefined()
  })

  it("lists nothing for a diagram type that has no directory", () => {
    expect(readFixtures("missing" as DiagramType)).toEqual([])
  })

  it("reads the specified reading of a fixture that has the file, where it differs from the expected file", () => {
    const name = "div-comment-after-name-then-statement"
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    expect(existsSync(path.join(fixture.dir, SPECIFIED_FILE))).toBe(true)
    expect(fixture.file.knownDivergence).toBe("comment-takes-line-break")
    expect(fixture.file.accepted).toBe(false)
    expect(fixture.specified?.accepted).toBe(true)
  })
})

describe("writeNewFixture", () => {
  it("refuses a name that is not lowercase kebab-case, and creates nothing", () => {
    /** Tries to write the fixture. */
    function attempt(): string {
      return writeNewFixture(
        "class",
        "Bad_Name",
        "classDiagram\n",
        { ...AUTHORED, ...MADE_UP_ACCEPTED },
        undefined,
      )
    }

    expect(attempt).toThrow(
      "fixture name must be lowercase kebab-case ([a-z0-9-]): Bad_Name",
    )
    expect(existsSync(path.join(diagramDir("class"), "Bad_Name"))).toBe(false)
  })

  it("refuses a name that leaves the directory of the diagram type", () => {
    /** Tries to write the fixture. */
    function attempt(): string {
      return writeNewFixture(
        "class",
        "../escaped",
        "classDiagram\n",
        { ...AUTHORED, ...MADE_UP_ACCEPTED },
        undefined,
      )
    }

    expect(attempt).toThrow("fixture name must be lowercase kebab-case")
    expect(existsSync(path.join(getFixturesRoot(), "escaped"))).toBe(false)
  })

  it("refuses to overwrite a fixture that exists", () => {
    /** Tries to write the fixture. */
    function attempt(): string {
      return writeNewFixture(
        "class",
        "config-init-trailing-comma",
        "classDiagram\n",
        { ...AUTHORED, ...MADE_UP_ACCEPTED },
        undefined,
      )
    }

    expect(attempt).toThrow(
      "fixture already exists: class/config-init-trailing-comma",
    )
  })
})

describe("baselineConfigOf", () => {
  it("is the default configuration for a site configuration that is left out", async () => {
    expect(await baselineConfigOf(undefined)).toEqual(getDefaultConfig())
  })

  it("is read with the site configuration it is given", async () => {
    const plain = await baselineConfigOf(undefined)
    const inherited = await baselineConfigOf({
      flowchart: { inheritDir: true },
    })
    expect(plain.flowchart).toMatchObject({ inheritDir: false })
    expect(inherited.flowchart).toMatchObject({ inheritDir: true })
  })

  it("gives one read to an empty configuration and to none", async () => {
    const empty = baselineConfigOf({})
    const none = baselineConfigOf(undefined)
    expect(empty).toBe(none)
    await empty
  })

  it("gives one read to configurations that differ only in the order of keys", async () => {
    const first = baselineConfigOf({
      sequence: { wrap: true, mirrorActors: false },
      flowchart: { curve: "linear" },
    })
    const second = baselineConfigOf({
      flowchart: { curve: "linear" },
      sequence: { mirrorActors: false, wrap: true },
    })
    expect(second).toBe(first)
    await first
  })

  it("gives different reads to different configurations", async () => {
    const linear = baselineConfigOf({ flowchart: { curve: "linear" } })
    const step = baselineConfigOf({ flowchart: { curve: "step" } })
    expect(linear).not.toBe(step)
    expect((await linear).flowchart).toMatchObject({ curve: "linear" })
    expect((await step).flowchart).toMatchObject({ curve: "step" })
  })
})

describe("generateExpected", () => {
  it("gives the head and what mermaid.js gives for an accepted input, with no embedded field where the input gives no embedded value", async () => {
    const input = "flowchart LR\n  A\n"
    const file = await generateExpected("flowchart", input, AUTHORED)
    const accepted = acceptedOf(file)
    expect(accepted.source).toEqual(AUTHORED.source)
    expect(accepted.diagramType).toBe("flowchart-v2")
    const outcome = await runMermaid(input)
    if (!outcome.accepted) throw new Error("expected an accepted flowchart")
    expect(accepted.db).toEqual(outcome.db)
    expect(Object.keys(file)).toEqual([
      "source",
      "accepted",
      "diagramType",
      "db",
    ])
  })

  it("gives the error of mermaid.js for a rejected input, with no Db", async () => {
    const file = await generateExpected(
      "flowchart",
      "flowchart LR\n  A -->\n",
      AUTHORED,
    )
    expect(file.accepted).toBe(false)
    expect(firstLine(file)).toBe("Parse error on line 4:")
    expect(file.accepted ? undefined : file.error.name).toBe("Error")
    expect(Object.keys(file)).toEqual(["source", "accepted", "error"])
  })

  it("keeps the config and the known divergence of the head, and reads the input with that config", async () => {
    const head: FixtureHead = {
      ...AUTHORED,
      config: { flowchart: { inheritDir: true } },
      knownDivergence: "directive-as-token-boundary",
    }
    const file = await generateExpected(
      "flowchart",
      "flowchart LR\n  subgraph S\n    A\n  end\n",
      head,
    )
    const accepted = acceptedOf(file)
    expect(accepted.config).toEqual({ flowchart: { inheritDir: true } })
    expect(accepted.knownDivergence).toBe("directive-as-token-boundary")
    const subgraphs = accepted.db?.subgraphs as { id: string; dir?: string }[]
    expect(subgraphs.map((subgraph) => [subgraph.id, subgraph.dir])).toEqual([
      ["S", "LR"],
    ])
  })

  it("records the title of the frontmatter in embedded", async () => {
    const file = await generateExpected(
      "flowchart",
      "---\ntitle: T\n---\nflowchart LR\n  A\n",
      AUTHORED,
    )
    expect(acceptedOf(file).embedded).toEqual({ title: "T" })
  })

  it("records the configuration of the frontmatter as the values that differ from the baseline", async () => {
    const file = await generateExpected(
      "flowchart",
      "---\nconfig:\n  flowchart:\n    curve: linear\n---\nflowchart LR\n  A\n",
      AUTHORED,
    )
    expect(acceptedOf(file).embedded).toEqual({
      config: { flowchart: { curve: "linear" } },
    })
  })

  it("takes the baseline from the site configuration of the head, so that a value the site sets is not recorded", async () => {
    const siteOnly = await generateExpected(
      "flowchart",
      "flowchart LR\n  A\n",
      { ...AUTHORED, config: { flowchart: { curve: "linear" } } },
    )
    expect(acceptedOf(siteOnly).embedded).toBeUndefined()
    const inputToo = await generateExpected(
      "flowchart",
      "---\nconfig:\n  flowchart:\n    curve: step\n---\nflowchart LR\n  A\n",
      { ...AUTHORED, config: { flowchart: { curve: "linear" } } },
    )
    expect(acceptedOf(inputToo).embedded).toEqual({
      config: { flowchart: { curve: "step" } },
    })
  })

  it("records what the data blocks did in embedded", async () => {
    const file = await generateExpected(
      "flowchart",
      "flowchart LR\n  A@{ shape: rect }\n",
      AUTHORED,
    )
    expect(acceptedOf(file).embedded).toEqual({
      dataBlockEffects: [{ id: "A", set: { type: "rect" } }],
    })
  })

  it("throws for an accepted input that mermaid.js detects as a diagram type that does not belong in the directory", async () => {
    await expect(
      generateExpected("flowchart", "sequenceDiagram\n  A->>B: x\n", AUTHORED),
    ).rejects.toThrow(
      "mermaid detects this input as sequence, which does not belong in flowchart/",
    )
  })

  it("does not check the directory of a rejected input", async () => {
    const file = await generateExpected(
      "flowchart",
      "sequenceDiagram\n  A->>\n",
      AUTHORED,
    )
    expect(file.accepted).toBe(false)
  })

  it("records db null in common/ for a diagram type that has no normalizer", async () => {
    const file = await generateExpected(
      "common",
      (await loadFixtures("common")).find(
        (fixture) => fixture.name === "detect-minimal-treemap",
      )!.input,
      AUTHORED,
    )
    expect(acceptedOf(file)).toMatchObject({
      accepted: true,
      diagramType: "treemap",
      db: null,
    })
  })

  it("records a Db in common/ for a diagram type that has a normalizer", async () => {
    const file = await generateExpected(
      "common",
      "flowchart LR\n  A\n",
      AUTHORED,
    )
    expect(acceptedOf(file).db).not.toBeNull()
  })

  it("records classDiagram for classDiagram-v2 in class/ and stateDiagram for stateDiagram-v2 in state/", async () => {
    const classFile = await generateExpected(
      "class",
      "classDiagram-v2\n  class A\n",
      AUTHORED,
    )
    expect(acceptedOf(classFile).diagramType).toBe("classDiagram")
    const stateFile = await generateExpected(
      "state",
      "stateDiagram-v2\n  [*] --> A\n",
      AUTHORED,
    )
    expect(acceptedOf(stateFile).diagramType).toBe("stateDiagram")
  })

  it("accepts flowchart-elk in flowchart/, which uses the flowchart parser", async () => {
    const file = await generateExpected(
      "flowchart",
      "flowchart-elk TD\n  A\n",
      AUTHORED,
    )
    expect(acceptedOf(file).diagramType).toBe("flowchart-elk")
  })
})

describe("generateSpecified", () => {
  it("records the reference Db after leaving out converted invalid frontmatter YAML", async () => {
    const cases: readonly { diagram: DiagramType; name: string }[] = [
      {
        diagram: "usecase",
        name: "div-gram-frontmatter-html-attribute-quotes",
      },
      { diagram: "pie", name: "div-review-frontmatter-html-invalid-yaml" },
    ]
    for (const { diagram, name } of cases) {
      const fixture = readFixtures(diagram).find((entry) => entry.name === name)
      if (fixture === undefined) throw new Error(`missing fixture: ${name}`)
      const head = headOf(fixture.file)
      expect(head.knownDivergence).toBe("embedded-data-opaque")
      expect(fixture.file).toMatchObject({
        accepted: false,
        error: { name: "YAMLException" },
      })
      const specified = await generateSpecified(
        diagram,
        fixture.input,
        head,
        fixture.file,
      )
      expect(specified).toMatchObject({
        accepted: true,
        diagramType: diagram,
        db: { title: "", accTitle: "", accDescr: "" },
      })
      expect(specified).not.toHaveProperty("embedded")
    }
  })

  it("records an opaque specified reading without requiring a comparison Db normalizer result", async () => {
    const fixture = readFixtures("flowchart").find(
      (entry) => entry.name === "div-data-unknown-shape",
    )
    if (fixture === undefined) throw new Error("missing opaque shape fixture")
    expect(
      await generateSpecified(
        "flowchart",
        fixture.input,
        headOf(fixture.file),
        fixture.file,
      ),
    ).toEqual({
      accepted: true,
      diagramType: "flowchart-v2",
      db: null,
    })
  })

  /** `comment-takes-character` reads `p%%` as a keyword's first letter: accepted by mermaid.js, rejected by the specification. */
  const SEQUENCE_COMMENT_AFTER_LETTER =
    "sequenceDiagram\np%% carticipant A\nA->>B: x\n"

  /** An input that `comment-takes-character` changes nothing in. */
  const SEQUENCE_PLAIN = "sequenceDiagram\nA->>B: x\n"

  /** `comment-takes-line-break` joins the next line to a comment after a name. */
  const CLASS_COMMENT_AFTER_NAME = "classDiagram\nA %% c\nclass Z\n"

  /** The frontmatter ends a tag that the specification does not read. */
  const TAG_WITH_QUOTE_IN_TITLE =
    '---\ntitle: <a z="\n---\nflowchart LR\nA[<b x="y">t]\n'

  const FRONTMATTER_DUPLICATE_AFTER_REPLACEMENT =
    "---\n<a: 1\n(a: 2\n---\nflowchart LR\nA\n"

  /** The result part of the expected file of `input`, as the generator makes it. */
  async function expectedOf(
    diagram: "sequence" | "class" | "flowchart",
    input: string,
    head: FixtureHead = AUTHORED,
  ): Promise<Expectation> {
    const file = await generateExpected(diagram, input, head)
    if (!file.accepted) return { accepted: false, error: file.error }
    return {
      accepted: true,
      diagramType: file.diagramType,
      db: file.db,
      ...(file.embedded === undefined ? {} : { embedded: file.embedded }),
    }
  }

  it("gives nothing for a fixture without a mark", async () => {
    const expected = await expectedOf("sequence", SEQUENCE_PLAIN)
    expect(
      await generateSpecified("sequence", SEQUENCE_PLAIN, AUTHORED, expected),
    ).toBeUndefined()
  })

  it("gives nothing for a mark whose divergence changes nothing in how mermaid.js reads", async () => {
    const expected = await expectedOf("sequence", SEQUENCE_PLAIN)
    for (const knownDivergence of [
      "directive-as-token-boundary",
      "ignored-semicolon-as-token-boundary",
      "click-reserved-word",
      "tokenless-empty-forms",
      "headerless-empty-ending",
      "embedded-data-opaque",
    ]) {
      expect(
        await generateSpecified(
          "sequence",
          SEQUENCE_PLAIN,
          { ...AUTHORED, knownDivergence },
          expected,
        ),
      ).toBeUndefined()
    }
  })

  it("gives the reading of the specification when it rejects what mermaid.js accepts", async () => {
    const head = { ...AUTHORED, knownDivergence: "comment-takes-character" }
    const expected = await expectedOf(
      "sequence",
      SEQUENCE_COMMENT_AFTER_LETTER,
      head,
    )
    expect(expected.accepted).toBe(true)
    const specified = await generateSpecified(
      "sequence",
      SEQUENCE_COMMENT_AFTER_LETTER,
      head,
      expected,
    )
    expect(specified?.accepted).toBe(false)
    expect(specified === undefined ? "" : firstLine(specified)).toBe(
      "Parse error on line 2:",
    )
  })

  it("gives the reading of the specification when it accepts what mermaid.js rejects", async () => {
    const head = { ...AUTHORED, knownDivergence: "comment-takes-line-break" }
    const expected = await expectedOf("class", CLASS_COMMENT_AFTER_NAME, head)
    expect(expected.accepted).toBe(false)
    const specified = await generateSpecified(
      "class",
      CLASS_COMMENT_AFTER_NAME,
      head,
      expected,
    )
    expect(specified).toMatchObject({
      accepted: true,
      diagramType: "classDiagram",
    })
    const classes = (specified?.accepted ? specified.db?.classes : []) as {
      id: string
    }[]
    expect(classes.map((entry) => entry.id)).toEqual(["Z"])
  })

  it("gives nothing when the reading of the specification is what mermaid.js gave", async () => {
    const head = { ...AUTHORED, knownDivergence: "comment-takes-character" }
    const expected = await expectedOf("sequence", SEQUENCE_PLAIN, head)
    expect(
      await generateSpecified("sequence", SEQUENCE_PLAIN, head, expected),
    ).toBeUndefined()
  })

  it("gives the specified reading when only the Db differs", async () => {
    const head = { ...AUTHORED, knownDivergence: "comment-takes-character" }
    const real = await expectedOf("sequence", SEQUENCE_PLAIN, head)
    if (!real.accepted) throw new Error("expected an accepted result")
    const changed: Expectation = { ...real, db: { made: "up" } }
    expect(
      await generateSpecified("sequence", SEQUENCE_PLAIN, head, changed),
    ).toEqual(real)
  })

  it("gives the specified reading when only the diagram type differs", async () => {
    const head = { ...AUTHORED, knownDivergence: "comment-takes-character" }
    const real = await expectedOf("sequence", SEQUENCE_PLAIN, head)
    if (!real.accepted) throw new Error("expected an accepted result")
    const changed: Expectation = { ...real, diagramType: "other" }
    expect(
      await generateSpecified("sequence", SEQUENCE_PLAIN, head, changed),
    ).toEqual(real)
  })

  it("does not count the embedded values as a difference of reading", async () => {
    const head = { ...AUTHORED, knownDivergence: "comment-takes-character" }
    const real = await expectedOf("sequence", SEQUENCE_PLAIN, head)
    if (!real.accepted) throw new Error("expected an accepted result")
    const changed: Expectation = { ...real, embedded: { title: "made up" } }
    expect(
      await generateSpecified("sequence", SEQUENCE_PLAIN, head, changed),
    ).toBeUndefined()
  })

  it("gives nothing when both readings are the same rejection", async () => {
    const input = "---\ntitle: <a\n---\nflowchart LR\nA -->\n"
    const head = { ...AUTHORED, knownDivergence: "html-tag-in-frontmatter" }
    const expected = await expectedOf("flowchart", input, head)
    expect(expected.accepted).toBe(false)
    expect(
      await generateSpecified("flowchart", input, head, expected),
    ).toBeUndefined()
  })

  it("gives the specified reading when the rejections differ in the message, or in the name", async () => {
    const input = "---\ntitle: <a\n---\nflowchart LR\nA -->\n"
    const head = { ...AUTHORED, knownDivergence: "html-tag-in-frontmatter" }
    const real = await expectedOf("flowchart", input, head)
    if (real.accepted) throw new Error("expected a rejection")
    const otherMessage: Expectation = {
      accepted: false,
      error: { name: real.error.name, message: "another message" },
    }
    const otherName: Expectation = {
      accepted: false,
      error: { name: "AnotherError", message: real.error.message },
    }
    expect(
      await generateSpecified("flowchart", input, head, otherMessage),
    ).toEqual(real)
    expect(
      await generateSpecified("flowchart", input, head, otherName),
    ).toEqual(real)
  })

  it("records the title of the frontmatter as written, in the Db and in embedded", async () => {
    const head = { ...AUTHORED, knownDivergence: "html-tag-in-frontmatter" }
    const expected = await expectedOf(
      "flowchart",
      TAG_WITH_QUOTE_IN_TITLE,
      head,
    )
    expect(expected.accepted).toBe(false)
    const specified = await generateSpecified(
      "flowchart",
      TAG_WITH_QUOTE_IN_TITLE,
      head,
      expected,
    )
    expect(specified).toMatchObject({
      accepted: true,
      diagramType: "flowchart-v2",
      db: { title: "<a z='" },
      embedded: { title: "<a z='" },
    })
  })

  it("records the configuration of the reading as the values that differ from the baseline of the head", async () => {
    const input =
      '---\nconfig:\n  flowchart:\n    curve: <a z="\n---\nflowchart LR\nA[<b x="y">t]\n'
    const head = { ...AUTHORED, knownDivergence: "html-tag-in-frontmatter" }
    const expected = await expectedOf("flowchart", input, head)
    const specified = await generateSpecified(
      "flowchart",
      input,
      head,
      expected,
    )
    expect(specified?.accepted && specified.embedded).toEqual({
      config: { flowchart: { curve: '(a z="' } },
    })
  })

  it("reads with the site configuration of the head, and records only what the input adds to it", async () => {
    const head: FixtureHead = {
      ...AUTHORED,
      config: { flowchart: { inheritDir: true } },
      knownDivergence: "comment-takes-line-break",
    }
    const expected = await expectedOf("class", CLASS_COMMENT_AFTER_NAME, head)
    const specified = await generateSpecified(
      "class",
      CLASS_COMMENT_AFTER_NAME,
      head,
      expected,
    )
    expect(specified?.accepted).toBe(true)
    expect(specified?.accepted && "embedded" in specified).toBe(false)
  })

  it("stops where the replacement made the YAML of the frontmatter invalid", async () => {
    const head = { ...AUTHORED, knownDivergence: "html-tag-in-frontmatter" }
    const expected = await expectedOf(
      "flowchart",
      FRONTMATTER_DUPLICATE_AFTER_REPLACEMENT,
      head,
    )
    await expect(
      generateSpecified(
        "flowchart",
        FRONTMATTER_DUPLICATE_AFTER_REPLACEMENT,
        head,
        expected,
      ),
    ).rejects.toThrow(
      "the replacement of `<` in the frontmatter made its YAML invalid",
    )
  })

  it("throws for a reading that mermaid.js gives as a diagram type that does not belong in the directory", async () => {
    const head = { ...AUTHORED, knownDivergence: "comment-takes-line-break" }
    const expected: Expectation = {
      accepted: false,
      error: { name: "Error", message: "m" },
    }
    await expect(
      generateSpecified("flowchart", CLASS_COMMENT_AFTER_NAME, head, expected),
    ).rejects.toThrow(
      "mermaid detects this input as classDiagram, which does not belong in flowchart/",
    )
  })
})
