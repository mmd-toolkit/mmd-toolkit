import { usecaseAccepts } from "./helpers/usecase-fixtures.ts"
import { agentflowAccepts } from "./helpers/agentflow-fixtures.ts"
/**
 * The fixtures of `@mmd-toolkit/tests`, parsed: for each fixture, what
 * `parse()` gives must be what the fixture records for this parser, the tree
 * in `ast.json` or the error in `parse-error.json`, next to its input in
 * `packages/tests/fixtures/<diagram>/<fixture name>/`; and the acceptance
 * must be what the fixture records of mermaid.js, as its `knownDivergence`
 * mark asks. Whether the recorded trees keep the conditions of the
 * specification and give the Db of mermaid.js is a check of the corpus
 * (`@mmd-toolkit/tests`, `check-tree-corpus.test.ts` and
 * `db-from-tree.test.ts`), not of the parser.
 *
 * The files: for an input that the parser accepts, the tree, as
 * `JSON.stringify(root, null, 2)`, locations included, in `ast.json`; for an
 * input that it rejects, the `message`, `range`, and `loc` of the
 * `ParseError`, in `parse-error.json`; for a diagram type that it does not
 * support yet, neither. Outside CI a missing file is written; `vitest -u`
 * (`pnpm run test:update`) writes the files anew. Only this test writes
 * these two files; the other files of a fixture belong to
 * `@mmd-toolkit/tests`.
 *
 * The parser does not tell a known divergence apart; the `knownDivergence`
 * mark of a fixture alone decides what acceptance is expected.
 *
 * - Without a mark, the acceptance and the diagram type of mermaid.js.
 * - With `directive-as-token-boundary`,
 *   `ignored-semicolon-as-token-boundary`, `click-reserved-word`,
 *   `tokenless-empty-forms`, or `headerless-empty-ending` the specification
 *   rejects what mermaid.js accepts, never the reverse.
 * - With `html-tag-in-frontmatter`, `comment-takes-character`,
 *   `comment-takes-line-break`, `name-start-reads-unit`,
 *   `c4-keyword-anywhere`, or `bare-percent-line-before-header`, the
 *   acceptance
 *   and the diagram type of the reading of the specification, which the
 *   fixture records where it differs from that of mermaid.js
 *   (`specified.json`).
 * - With `embedded-data-opaque` it accepts what mermaid.js rejects.
 *
 * For every mark but the last, a second test checks, with the parser's own
 * lexer, that the input has the form of its divergence, and, for a
 * divergence that goes one way, that the parser gives for a reference input
 * without that form what mermaid.js gave for the input (see "marked fixtures
 * differ only by their divergence"). No mermaid.js runs here: every result
 * compared with is recorded in the corpus.
 */
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import type { EmbeddedValues, Expectation, Fixture } from "@mmd-toolkit/tests"
import {
  embeddedValuesOf,
  getFixturesRoot,
  loadFixtures,
} from "@mmd-toolkit/tests"
import type { Location, Range, Root, Token } from "../src/index.ts"
import { ParseError, UnsupportedDiagramError, parse } from "../src/index.ts"
import { dbOfTree } from "./helpers/db-of-tree.ts"
import type { Outcome } from "./helpers/known-divergences.ts"
import {
  declaredDivergence,
  oneWayDivergencesIn,
  outcomeOf,
} from "./helpers/known-divergences.ts"
import {
  clickIdsWithinLeafNodes,
  clickReferenceOf,
  c4DiagramComments,
  commentsAfterMatchStarts,
  commentsAfterOneCharacterUnits,
  commentsAfterUnits,
  doublePercentsAfterUnitStarts,
  percentBracesReachedDirectly,
  indentationBlankLinesRejectedByMermaid,
  percentCommentsReachedDirectly,
  percentsAfterUnitStarts,
  frontmatterChangesAttributeQuotes,
  holdsBarePercentLineBeforeHeader,
  holdsC4KeywordAfterHeader,
  keepsUnitsWithoutEmptyForms,
  namesStartingWithUnits,
  rejectsWithoutHeader,
  removedEmptyFormsIn,
  reservedClicksIn,
  withoutTokenCuts,
  withoutEmptyForms,
} from "./helpers/reference-inputs.ts"
import { RECORDED_DIAGRAMS } from "./helpers/recorded-diagrams.ts"

/** The name of the file that holds the tree of an accepted input. */
const AST_FILE = "ast.json"

/** The name of the file that holds the error of a rejected input. */
const ERROR_FILE = "parse-error.json"

/** The record of a `ParseError` in `parse-error.json`. */
interface ParseErrorRecord {
  readonly message: string
  readonly range: Range
  readonly loc: Location
}

/** What `parse()` gives for an input, as the fixture records it. */
type ParseResult =
  | { readonly kind: "tree"; readonly root: Root }
  | { readonly kind: "error"; readonly error: ParseErrorRecord }
  | { readonly kind: "unsupported" }

/** What `parse()` gives for `input`. */
function resultOf(input: string): ParseResult {
  try {
    return { kind: "tree", root: parse(input) }
  } catch (error) {
    if (error instanceof ParseError) {
      const { message, range, loc } = error
      return { kind: "error", error: { message, range, loc } }
    }
    if (error instanceof UnsupportedDiagramError) return { kind: "unsupported" }
    throw error
  }
}

/** The file that records `result`, and its content; null for an unsupported diagram type. */
function recordOf(
  result: ParseResult,
): { readonly file: string; readonly content: string } | null {
  switch (result.kind) {
    case "tree":
      return {
        file: AST_FILE,
        content: `${JSON.stringify(result.root, null, 2)}\n`,
      }
    case "error":
      return {
        file: ERROR_FILE,
        content: `${JSON.stringify(result.error, null, 2)}\n`,
      }
    case "unsupported":
      return null
    default:
      throw new Error(
        `unknown parse result ${JSON.stringify(result satisfies never)}`,
      )
  }
}

/**
 * The fixtures under `directory`, a directory of fixtures of one diagram,
 * that have both an `ast.json` and a `parse-error.json`. A fixture records
 * one parse result, so there should be none. Only the files are looked at.
 */
function fixturesWithBothRecords(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter(
      (name) =>
        existsSync(path.join(directory, name, AST_FILE)) &&
        existsSync(path.join(directory, name, ERROR_FILE)),
    )
}

/**
 * Asserts that `outcome` has the acceptance that mermaid.js had in
 * `mermaid`, a result that the fixture records, and, for an accepted input,
 * the same diagram type. When the diagram type is not supported yet and
 * mermaid.js rejected the input, the rejection must come from the diagram's
 * own parser: no diagram type, and the `---` pseudo-diagram, are decided by
 * the rules this parser implements.
 */
function expectSameAcceptance(outcome: Outcome, mermaid: Expectation): void {
  if (mermaid.accepted) {
    expect(outcome.kind).not.toBe("reject")
    if (outcome.kind === "tree") {
      expect(outcome.root.diagramType).toBe(mermaid.diagramType)
    } else if (outcome.kind === "unsupported") {
      expect(outcome.diagramType).toBe(mermaid.diagramType)
    }
  } else {
    expect(outcome.kind).not.toBe("tree")
    if (outcome.kind === "unsupported") {
      expect(mermaid.error.name).not.toBe("UnknownDiagramError")
      expect(
        mermaid.error.message.startsWith("Diagrams beginning with ---"),
      ).toBe(false)
    }
  }
}

/**
 * Asserts that `outcome`, the outcome of a reference input, is what
 * mermaid.js did in `mermaid` for the input itself: the same acceptance and
 * diagram type and, for a tree when mermaid.js gave a Db summary, the same
 * Db, built from the tree as `@mmd-toolkit/tests` builds it from a recorded
 * tree, with `embedded`, the values that mermaid.js derived from the
 * embedded data of the input.
 */
function expectSameAsMermaid(
  outcome: Outcome,
  mermaid: Expectation,
  embedded: EmbeddedValues | undefined,
): void {
  expectSameAcceptance(outcome, mermaid)
  if (!mermaid.accepted || mermaid.db === null || outcome.kind !== "tree") {
    return
  }
  if (embedded === undefined) {
    throw new Error("mermaid.js accepted the text but gave no values")
  }
  expect(dbOfTree(outcome.text, outcome.root, embedded)).toEqual(mermaid.db)
}

/**
 * known-divergences/click-reserved-word.md: the tree of the reference input of
 * the input of `fixture`, where mermaid.js gives it the Db of the input; null
 * where the removal changes the units or puts a click id outside one leaf node,
 * or where the parser rejects the reference input.
 */
function clickReferenceOutcomeOf(
  fixture: Fixture,
): Extract<Outcome, { kind: "tree" }> | null {
  const reference = clickReferenceOf(fixture.input)
  if (reference === null) throw new Error("the input is no flowchart")
  if (!reference.keepsUnits) return null
  const outcome = outcomeOf(reference.text, fixture.config)
  if (outcome.kind !== "tree") return null
  return clickIdsWithinLeafNodes(reference, outcome.root) ? outcome : null
}

/** The known divergences that go one way only: the parser rejects what mermaid.js accepts. */
const ONE_WAY_DIVERGENCES: readonly (string | undefined)[] = [
  "directive-as-token-boundary",
  "ignored-semicolon-as-token-boundary",
  "click-reserved-word",
  "tokenless-empty-forms",
  "headerless-empty-ending",
]

/**
 * The acceptance of one fixture, as its mark, or the lack of one, asks for
 * it: `outcome` is what `parse()` gives for its input, with the rejection
 * by the site configuration (`outcomeOf`).
 */
function checkAcceptance(fixture: Fixture, outcome: Outcome): void {
  if (fixture.diagram === "usecase") {
    expect(outcome.kind === "tree").toBe(usecaseAccepts(fixture))
    return
  }
  if (fixture.diagram === "agentflow") {
    expect(outcome.kind === "tree").toBe(agentflowAccepts(fixture))
    return
  }
  const { expected, knownDivergence } = fixture
  if (knownDivergence === undefined) {
    expectSameAcceptance(outcome, expected)
  } else if (knownDivergence === "embedded-data-opaque") {
    // The parser never rejects for what embedded data contains.
    expect(expected.accepted).toBe(false)
    expect(outcome.kind).not.toBe("reject")
  } else if (knownDivergence === "blank-line-after-header-or-comments") {
    // This divergence accepts the blank lines that mermaid.js rejects.
    expect(expected.accepted).toBe(false)
    expect(outcome.kind).toBe("tree")
    if (outcome.kind === "tree") {
      expect(outcome.root.diagramType).toBe(fixture.diagram)
    }
  } else if (outcome.kind === "unsupported") {
    // The divergence shows in the diagram's own grammar, which this
    // parser does not have yet; only the detected type can be checked.
    if (expected.accepted) {
      expect(outcome.diagramType).toBe(expected.diagramType)
    }
  } else if (ONE_WAY_DIVERGENCES.includes(knownDivergence)) {
    // One way only: a directive inside a unit that may not have one, a
    // `click` that does not start a click statement, an empty form that no
    // rule takes, and a class diagram without its header are rejected here
    // and accepted by mermaid.js. The input has the form of its mark,
    // found by the rule of that divergence, and the rejection is that of
    // such a divergence, where the parser rejects for it, as
    // `helpers/known-divergences.ts` declares it. An input may have two of
    // them, as an empty string before a `click` that does not start a
    // click statement; the parser rejects at the first, whose divergence
    // is then the one declared.
    expect(expected.accepted).toBe(true)
    expect(outcome.kind).toBe("reject")
    expect(oneWayDivergencesIn(fixture.input, fixture.config)).toContain(
      knownDivergence,
    )
    expect(ONE_WAY_DIVERGENCES).toContain(
      declaredDivergence(fixture.input, fixture.config, outcome),
    )
  } else {
    // Both ways: the acceptance and the diagram type of the reading of the
    // specification, which the corpus records where it differs from that
    // of mermaid.js (`specified.json`); the Db of that reading is checked
    // by the corpus.
    expectSameAcceptance(outcome, fixture.specified ?? expected)
  }
}

for (const diagram of RECORDED_DIAGRAMS) {
  describe(`${diagram} fixtures`, async () => {
    const fixtures = await loadFixtures(diagram)
    const directory = path.join(getFixturesRoot(), diagram)
    const recordedFiles = new Map<string, string>()

    it("has fixtures", () => {
      expect(fixtures.length).toBeGreaterThan(0)
    })

    for (const fixture of fixtures) {
      const result = resultOf(fixture.input)
      const record = recordOf(result)
      if (record !== null) recordedFiles.set(fixture.name, record.file)
      it(fixture.name, async () => {
        if (record !== null) {
          await expect(record.content).toMatchFileSnapshot(
            path.join(directory, fixture.name, record.file),
          )
        }
        checkAcceptance(fixture, outcomeOf(fixture.input, fixture.config))
      })
    }

    it("no fixture has both `ast.json` and `parse-error.json`", () => {
      expect(fixturesWithBothRecords(directory)).toEqual([])
    })

    it("has no `ast.json` or `parse-error.json` left behind: each fixture has the one file of its result, and a directory without an input has none", () => {
      const leftBehind = readdirSync(directory, { withFileTypes: true })
        .filter((entry) => entry.isDirectory())
        .flatMap((entry) =>
          [AST_FILE, ERROR_FILE]
            .filter((file) =>
              existsSync(path.join(directory, entry.name, file)),
            )
            .filter((file) => recordedFiles.get(entry.name) !== file)
            .map((file) => `${entry.name}/${file}`),
        )
      expect(leftBehind).toEqual([])
    })
  })
}

/**
 * ast.md, ErrorDiagram: the tokens of the fixtures that section names, as it
 * states them, with their kinds: `RawText` tokens, and the `Directive` token
 * of a directive and the `IgnoredSemicolon` token of an ignored `;` between
 * them.
 */
const errorDiagramTokens: Readonly<
  Record<string, readonly (readonly [Token["type"], string])[]>
> = {
  "error-bare-percent-line": [
    ["RawText", "%%"],
    ["RawText", "error"],
  ],
  "error-trailing-percent": [
    ["RawText", "error"],
    ["RawText", "%%"],
    ["RawText", "x"],
  ],
  "error-directive-adjacent": [
    ["RawText", "error"],
    ["Directive", "%%{wrap}%%"],
  ],
  "error-directive-inside": [
    ["RawText", "error"],
    ["Directive", "%%{init: {}}%%"],
    ["RawText", "%%"],
    ["RawText", "x"],
  ],
  "error-comment-inside": [
    ["RawText", "error"],
    ["RawText", "%%{"],
    ["RawText", "}"],
  ],
  "error-style-semicolon-trailing": [
    ["RawText", "error"],
    ["RawText", "%%"],
    ["RawText", "style:#f"],
    ["IgnoredSemicolon", ";"],
  ],
  "error-style-semicolon-inside": [
    ["RawText", "error"],
    ["RawText", "%%"],
    ["RawText", "style:#f"],
    ["IgnoredSemicolon", ";"],
    ["RawText", "x"],
  ],
  "error-split-by-directive": [
    ["RawText", "err"],
    ["Directive", "%%{init: {}}%%"],
    ["RawText", "or"],
  ],
}

describe("the tokens of the error pseudo-diagram", async () => {
  const fixtures = await loadFixtures("common")

  for (const [name, tokens] of Object.entries(errorDiagramTokens)) {
    it(name, () => {
      const fixture = fixtures.find((candidate) => candidate.name === name)
      expect(fixture, `fixture common/${name}`).toBeDefined()
      const root = parse(fixture!.input)
      expect(root.tokens.map((token) => [token.type, token.value])).toEqual(
        tokens,
      )
      // The body runs from its first `RawText` token to its last.
      const runs = root.tokens.filter((token) => token.type === "RawText")
      expect(root.body.range).toEqual([
        runs[0].range[0],
        runs[runs.length - 1].range[1],
      ])
    })
  }
})

describe("marked fixtures differ only by their divergence", async () => {
  const fixtures: Fixture[] = [
    ...(await loadFixtures("common")),
    ...(await loadFixtures("flowchart")),
    ...(await loadFixtures("sequence")),
    ...(await loadFixtures("class")),
    ...(await loadFixtures("state")),
    ...(await loadFixtures("er")),
    ...(await loadFixtures("gantt")),
    ...(await loadFixtures("journey")),
    ...(await loadFixtures("requirement")),
    ...(await loadFixtures("mindmap")),
    ...(await loadFixtures("timeline")),
    ...(await loadFixtures("sankey")),
    ...(await loadFixtures("xychart")),
    ...(await loadFixtures("quadrant")),
    ...(await loadFixtures("block")),
    ...(await loadFixtures("kanban")),
    ...(await loadFixtures("venn")),
    ...(await loadFixtures("ishikawa")),
  ]

  /** The fixtures that carry the mark `knownDivergence`. */
  function marked(knownDivergence: string): Fixture[] {
    return fixtures.filter(
      (fixture) => fixture.knownDivergence === knownDivergence,
    )
  }

  // known-divergences/directive-as-token-boundary.md: mermaid.js removes each
  // directive and joins the text around it, and the specification reads
  // the text in the same way, but rejects a directive inside a token that
  // may not be cut, one that is not a text or a string. The reference input
  // is the fixture input without its directives and with each `;` that the
  // line rule ignores moved to the end of its line segment
  // (`withoutTokenCuts`), and the parser must give for it what mermaid.js
  // gave for the input. Both steps keep the diagram text, so when the
  // parser agrees with mermaid.js on the reference input, the cuts alone
  // explain that the parser rejects the input itself.
  describe("directive-as-token-boundary", () => {
    const fixturesWithMark = marked("directive-as-token-boundary")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expectSameAsMermaid(
          outcomeOf(withoutTokenCuts(fixture.input)),
          fixture.expected,
          embeddedValuesOf(fixture, fixture.expected),
        )
      })
    }
  })

  // known-divergences/ignored-semicolon-as-token-boundary.md: mermaid.js
  // removes the `;` that the line rule ignores from its line, and the
  // specification leaves it out of the diagram text in the same way, but
  // rejects it inside a token that may not be cut. The reference input is
  // that of `directive-as-token-boundary` above: there, each such `;` lies
  // at the end of its line segment, where both still ignore it and it lies
  // in no token.
  describe("ignored-semicolon-as-token-boundary", () => {
    const fixturesWithMark = marked("ignored-semicolon-as-token-boundary")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expectSameAsMermaid(
          outcomeOf(withoutTokenCuts(fixture.input)),
          fixture.expected,
          embeddedValuesOf(fixture, fixture.expected),
        )
      })
    }
  })

  // known-divergences/click-reserved-word.md: mermaid.js accepts a `click` unit
  // that does not start a click statement, and the specification rejects
  // it. The reference input is the fixture input without its comment
  // regions, without its empty forms, and without the click text of each
  // such `click`. Where the parser's lexer reads it as the units of the
  // input but the removed ones (the click ids of those `click` units may be
  // read as other units in their place), the parser accepts it, and the
  // text of each of those click ids lies within one leaf node of its tree,
  // the parser must give what mermaid.js gave for the input, so that the
  // reserved `click` units alone explain that the parser rejects the input
  // itself. Elsewhere the removal joins the text around a `click`, or puts
  // a click id where the statement context reads it otherwise, and
  // mermaid.js may read the reference input otherwise.
  describe("click-reserved-word", () => {
    const fixturesWithMark = marked("click-reserved-word")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expect(reservedClicksIn(fixture.input)?.length).toBeGreaterThan(0)
        const outcome = clickReferenceOutcomeOf(fixture)
        if (outcome === null) return
        expectSameAsMermaid(
          outcome,
          fixture.expected,
          embeddedValuesOf(fixture, fixture.expected),
        )
      })
    }

    // Guards against the check passing vacuously.
    it("compares the reference input of most of them", () => {
      const compared = fixturesWithMark.filter(
        (fixture) => clickReferenceOutcomeOf(fixture) !== null,
      )
      expect(compared.length * 2).toBeGreaterThan(fixturesWithMark.length)
    })
  })

  // known-divergences/tokenless-empty-forms.md: mermaid.js reads nothing for an
  // empty string, an empty call, an empty description block that is not a
  // statement, and, in a class diagram, an empty backquoted name and an
  // empty generic type, and the specification rejects them. The
  // reference input is the fixture input without its comment regions and
  // without those forms. Where the parser's lexer reads it as the units of
  // the input other than those of the forms, and the parser accepts it, it
  // must give what mermaid.js gave for the input, so that the empty forms
  // alone explain that the parser rejects the input itself. Elsewhere the
  // removal joins the text around a form into other units, and mermaid.js
  // may read the reference input otherwise.
  describe("tokenless-empty-forms", () => {
    const fixturesWithMark = marked("tokenless-empty-forms")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expect(removedEmptyFormsIn(fixture.input)?.length).toBeGreaterThan(0)
        const reference = withoutEmptyForms(fixture.input)
        if (reference === null) {
          throw new Error("the input has no lexer for its empty forms here")
        }
        if (!keepsUnitsWithoutEmptyForms(fixture.input)) return
        const outcome = outcomeOf(reference, fixture.config)
        if (outcome.kind !== "tree") return
        expectSameAsMermaid(
          outcome,
          fixture.expected,
          embeddedValuesOf(fixture, fixture.expected),
        )
      })
    }

    // Guards against the check passing vacuously.
    it("compares the reference input of most of them", () => {
      const accepted = fixturesWithMark.filter((fixture) => {
        const reference = withoutEmptyForms(fixture.input)
        return (
          reference !== null &&
          keepsUnitsWithoutEmptyForms(fixture.input) &&
          outcomeOf(reference, fixture.config).kind === "tree"
        )
      })
      expect(accepted.length * 2).toBeGreaterThan(fixturesWithMark.length)
    })
  })

  // known-divergences/comment-takes-character.md: in sequence, a comment
  // starts at its `%%` here, while mermaid.js takes the character right
  // before it into the comment where a rule would start there, and reads no
  // number before it; in gantt, a `%` right after the first character of a
  // unit, and in journey and timeline, a `%%` there, is a character of the
  // text here or follows a unit that the grammar does not take, and in an
  // XY chart and a quadrant chart a comment starts right after a unit of one
  // character, while
  // mermaid.js reads that character and the rest of the line as one
  // comment. Each fixture has such a `%%` or `%`, found by the parser's
  // lexer; the reading of the specification is recorded in the corpus.
  describe("comment-takes-character", () => {
    const fixturesWithMark = marked("comment-takes-character")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        const places =
          commentsAfterMatchStarts(fixture.input) ??
          percentsAfterUnitStarts(fixture.input) ??
          doublePercentsAfterUnitStarts(fixture.input) ??
          commentsAfterOneCharacterUnits(fixture.input)
        if (places === null) {
          throw new Error(
            "the input is no sequence diagram, Gantt chart, journey diagram, timeline, XY chart, or quadrant chart",
          )
        }
        expect(places.length).toBeGreaterThan(0)
      })
    }
  })

  // known-divergences/comment-takes-line-break.md: in class diagrams, a
  // comment that follows a unit on its line ends at the end of the line
  // here, while mermaid.js takes the line feeds after it; in gantt, so does
  // a comment with the mark `%` that mermaid.js reaches directly. Each
  // fixture has such a comment, found by the parser's lexer and units.
  // C4 diagram comments leave their following line terminator outside too.
  describe("comment-takes-line-break", () => {
    const fixturesWithMark = marked("comment-takes-line-break")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        const places =
          commentsAfterUnits(fixture.input) ??
          percentCommentsReachedDirectly(fixture.input) ??
          c4DiagramComments(fixture.input)
        if (places === null) {
          throw new Error("the input is no class, Gantt, or C4 diagram")
        }
        expect(places.length).toBeGreaterThan(0)
      })
    }
  })

  // known-divergences/percent-brace-after-unit.md: in gantt, a `%%{` that
  // starts no directive is a comment here wherever a unit starts, while
  // mermaid.js rejects it where it reaches it directly. Each fixture has
  // such a `%%{`, found by the parser's lexer and units; the reading of the
  // specification is recorded in the corpus.
  describe("percent-brace-after-unit", () => {
    const fixturesWithMark = marked("percent-brace-after-unit")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        const places = percentBracesReachedDirectly(fixture.input)
        if (places === null) throw new Error("the input is no Gantt chart")
        expect(places.length).toBeGreaterThan(0)
      })
    }
  })

  // known-divergences/blank-line-after-header-or-comments.md: in mindmap, kanban, and Ishikawa,
  // blank lines and diagram comments change nothing here wherever they
  // stand after the header, while mermaid.js rejects them in the four
  // cases of the divergence. Each fixture has such a place, found from the
  // parser's units and diagram comments; the reading of the specification
  // is recorded in the corpus.
  describe("blank-line-after-header-or-comments", () => {
    const fixturesWithMark = marked("blank-line-after-header-or-comments")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        const places = indentationBlankLinesRejectedByMermaid(fixture.input)
        if (places === null)
          throw new Error(
            "the input is no mindmap, kanban, or Ishikawa diagram",
          )
        expect(places.length).toBeGreaterThan(0)
      })
    }
  })

  // known-divergences/name-start-reads-unit.md: in class diagrams,
  // mermaid.js reads `"`, `~`, `<<`, `>>`, or a keyword at the start of a
  // backquoted name or of a generic type as that unit, and this
  // specification reads the text. Each fixture has such a name, found by
  // the parser's units.
  describe("name-start-reads-unit", () => {
    const fixturesWithMark = marked("name-start-reads-unit")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        const places = namesStartingWithUnits(fixture.input)
        if (places === null) throw new Error("the input is no class diagram")
        expect(places.length).toBeGreaterThan(0)
      })
    }
  })

  // known-divergences/headerless-empty-ending.md: mermaid.js accepts a
  // class diagram without its header where the text ends in an empty
  // match, and the specification rejects it. The divergence goes one way
  // and has no reference reading; each fixture must be rejected for its
  // missing header, which the parser's lexer decides.
  describe("headerless-empty-ending", () => {
    const fixturesWithMark = marked("headerless-empty-ending")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expect(rejectsWithoutHeader(fixture.input)).toBe(true)
      })
    }
  })

  // known-divergences/html-tag-in-frontmatter.md: mermaid.js also finds HTML
  // tags that start in the frontmatter. Each fixture has such a tag, whose
  // start changes which `"` mermaid.js reads as `'`, found by the parser's
  // reading of the frontmatter and of the attribute quotes; the reading of
  // the specification is recorded in the corpus.
  describe("html-tag-in-frontmatter", () => {
    const fixturesWithMark = marked("html-tag-in-frontmatter")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expect(frontmatterChangesAttributeQuotes(fixture.input)).toBe(true)
      })
    }
  })

  // known-divergences/c4-keyword-anywhere.md: mermaid.js looks for four of
  // the five keywords of C4 anywhere in the text, and the specification at
  // the start only, so a text whose header is another diagram's and whose
  // diagram text holds one of them is a C4 diagram there and the diagram of
  // its header here. Each fixture has such a keyword after the header found
  // by the parser's detection; the reading of the specification, its
  // acceptance and its diagram type, is recorded in the corpus
  // (`specified.json`) and compared above.
  describe("c4-keyword-anywhere", () => {
    const fixturesWithMark = marked("c4-keyword-anywhere")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expect(holdsC4KeywordAfterHeader(fixture.input)).toBe(true)
      })
    }
  })

  // known-divergences/bare-percent-line-before-header.md: a bare `%%` line
  // before the header is a comment in every diagram type here, while the
  // lexer of the diagram that mermaid.js detects rejects it in flowchart,
  // a line `%%{ }%%` in state, and a line of whitespace only after one in
  // class. Each fixture has such a line, which the parser's detection
  // passes; the reading of the specification, its acceptance and its
  // diagram type, is recorded in the corpus (`specified.json`) and compared
  // above.
  describe("bare-percent-line-before-header", () => {
    const fixturesWithMark = marked("bare-percent-line-before-header")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expect(holdsBarePercentLineBeforeHeader(fixture.input)).toBe(true)
      })
    }
  })
})
