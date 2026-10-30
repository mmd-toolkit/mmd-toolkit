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
 * `ParseError`, in `parse-error.json`. A missing file fails the test
 * (`update: "none"` in `vitest.config.ts`); `vitest --update=new`
 * (`pnpm run test:record`) writes the missing files, and `vitest -u`
 * (`pnpm run test:update`) writes the files anew. Only this test writes these
 * two files; the other files of a fixture belong to `@mmd-toolkit/tests`. A
 * fixture of a diagram type in `DIAGRAM_TYPES_WITHOUT_BODY` has neither file
 * and is not checked.
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
 * - With `embedded-data-opaque`, the specification keeps embedded data opaque;
 *   its recorded reading can change acceptance in either direction.
 *
 * The common fixture loop checks the declared forms through
 * `expectDivergenceForm`, including token-cut reference readings. Further
 * reference readings are checked under "marked fixtures differ only by their
 * divergence". No mermaid.js runs here: every result compared with is
 * recorded in the corpus.
 */
import { existsSync, readdirSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import type {
  DiagramType,
  EmbeddedValues,
  Expectation,
  Fixture,
} from "@mmd-toolkit/tests"
import {
  fixtureAccepts,
  embeddedValuesOf,
  getFixturesRoot,
  loadFixtures,
} from "@mmd-toolkit/tests"
import type { Location, Range, Token } from "../src/index.ts"
import { parse } from "../src/index.ts"
import { dbOfTree } from "./helpers/db-of-tree.ts"
import type { Outcome, Parsed } from "./helpers/known-divergences.ts"
import { outcomeOf, parsedOf } from "./helpers/known-divergences.ts"
import { expectDivergenceForm } from "./helpers/divergence-form.ts"
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
  keepsUnitsWithoutEmptyForms,
  namesStartingWithUnits,
  rejectsWithoutHeader,
  removedEmptyFormsIn,
  reservedClicksIn,
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

/** The file that records `result`, and its content. */
function recordOf(result: Parsed): {
  readonly file: string
  readonly content: string
} {
  switch (result.kind) {
    case "tree":
      return {
        file: AST_FILE,
        content: `${JSON.stringify(result.root, null, 2)}\n`,
      }
    case "error": {
      const { message, range, loc } = result.error
      const error: ParseErrorRecord = { message, range, loc }
      return {
        file: ERROR_FILE,
        content: `${JSON.stringify(error, null, 2)}\n`,
      }
    }
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
 * the same diagram type.
 */
function expectSameAcceptance(outcome: Outcome, mermaid: Expectation): void {
  if (mermaid.accepted) {
    expect(outcome.kind).not.toBe("reject")
    if (outcome.kind === "tree") {
      expect(outcome.root.diagramType).toBe(mermaid.diagramType)
    }
  } else {
    expect(outcome.kind).not.toBe("tree")
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
 * Whether the reference input of a marked fixture is compared with what
 * mermaid.js gave for the input: `compared`, with its tree, or the case of
 * the document of the divergence in which it is not.
 */
type ReferenceReading =
  | {
      readonly kind: "compared"
      readonly outcome: Extract<Outcome, { kind: "tree" }>
    }
  | {
      readonly kind:
        "units-change" | "click-id-outside-leaf" | "reference-rejected"
    }

/**
 * known-divergences/click-reserved-word.md: the reading of the reference input
 * of the input of `fixture`. It is not compared where the removal changes the
 * units, where the parser rejects the reference input, or where a click id
 * lies outside one leaf node of its tree.
 */
function clickReferenceReadingOf(fixture: Fixture): ReferenceReading {
  const reference = clickReferenceOf(fixture.input)
  if (reference === null) throw new Error("the input is no flowchart")
  if (!reference.keepsUnits) return { kind: "units-change" }
  const outcome = outcomeOf(reference.text, fixture.config)
  if (outcome.kind !== "tree") return { kind: "reference-rejected" }
  return clickIdsWithinLeafNodes(reference, outcome.root)
    ? { kind: "compared", outcome }
    : { kind: "click-id-outside-leaf" }
}

/**
 * known-divergences/tokenless-empty-forms.md: the reading of the reference
 * input of the input of `fixture`. It is not compared where the removal
 * changes the units. Where it keeps them, the parser must accept the
 * reference input: mermaid.js accepts the input and reads it as if its
 * empty forms were not there, so a rejection is an error, which is thrown
 * with its reason.
 */
function emptyFormReferenceReadingOf(fixture: Fixture): ReferenceReading {
  const reference = withoutEmptyForms(fixture.input)
  if (reference === null) {
    throw new Error("the input has no lexer for its empty forms here")
  }
  if (!keepsUnitsWithoutEmptyForms(fixture.input)) {
    return { kind: "units-change" }
  }
  const outcome = outcomeOf(reference, fixture.config)
  if (outcome.kind !== "tree") {
    throw new Error(
      `${fixture.diagram}/${fixture.name}: the parser rejects the reference input ${JSON.stringify(reference)}: ${rejectionOf(reference)}`,
    )
  }
  return { kind: "compared", outcome }
}

/** Why `parse()`, with the site configuration, rejects `text`: its error, or the configuration. */
function rejectionOf(text: string): string {
  const parsed = parsedOf(text)
  return parsed.kind === "error"
    ? `${parsed.error.message} at ${JSON.stringify(parsed.error.range)}`
    : "the site configuration rejects it"
}

/**
 * The acceptance of one fixture, as its mark, or the lack of one, asks for
 * it: `outcome` is what `parse()` gives for its input, with the rejection
 * by the site configuration (`outcomeOf`).
 */
function checkAcceptance(fixture: Fixture, outcome: Outcome): void {
  const accepted = fixtureAccepts(fixture)
  const { expected } = fixture
  expect(outcome.kind === "tree").toBe(accepted)
  const reading = fixture.specified ?? expected
  if (outcome.kind === "tree" && reading.accepted) {
    expect(outcome.root.diagramType).toBe(reading.diagramType)
  }
  expectDivergenceForm(fixture, outcome)
}

/**
 * The diagram types of mermaid.js that this parser has no body for yet, in the
 * steps between the fixtures of a new diagram type and its parser (the skill
 * `parser`, updating mermaid.js). A type leaves the list in the change that
 * adds its body, and the list is empty between two diagram types.
 */
const DIAGRAM_TYPES_WITHOUT_BODY: readonly string[] = []

/** Whether the recorded reading of `fixture` accepts it as a type of `DIAGRAM_TYPES_WITHOUT_BODY`. */
function readsAsTypeWithoutBody(fixture: Fixture): boolean {
  const reading = fixture.specified ?? fixture.expected
  return (
    reading.accepted && DIAGRAM_TYPES_WITHOUT_BODY.includes(reading.diagramType)
  )
}

/** The fixtures of each recorded diagram, read once for all the checks of this file. */
const fixturesByDiagram = new Map<DiagramType, readonly Fixture[]>()
for (const diagram of RECORDED_DIAGRAMS) {
  fixturesByDiagram.set(diagram, await loadFixtures(diagram))
}

/** The fixtures of `diagram`, one of the recorded diagrams. */
function fixturesOf(diagram: DiagramType): readonly Fixture[] {
  const fixtures = fixturesByDiagram.get(diagram)
  if (fixtures === undefined) throw new Error(`${diagram} is not recorded`)
  return fixtures
}

for (const diagram of RECORDED_DIAGRAMS) {
  describe(`${diagram} fixtures`, () => {
    const fixtures = fixturesOf(diagram)
    const directory = path.join(getFixturesRoot(), diagram)
    const recordedFiles = new Map<string, string>()

    it("has fixtures", () => {
      expect(fixtures.length).toBeGreaterThan(0)
    })

    for (const fixture of fixtures) {
      // Recorded and checked once the body exists; a record of such a fixture
      // is reported below as left behind.
      if (readsAsTypeWithoutBody(fixture)) continue
      const parsed = parsedOf(fixture.input)
      const record = recordOf(parsed)
      recordedFiles.set(fixture.name, record.file)
      it(fixture.name, async () => {
        await expect(record.content).toMatchFileSnapshot(
          path.join(directory, fixture.name, record.file),
        )
        checkAcceptance(
          fixture,
          outcomeOf(fixture.input, fixture.config, parsed),
        )
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

describe("the tokens of the error pseudo-diagram", () => {
  const fixtures = fixturesOf("common")

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

describe("marked fixtures differ only by their divergence", () => {
  // Every fixture of every recorded diagram that carries a mark is checked
  // below, so that a fixture whose form the helpers cannot find fails.
  const fixtures: Fixture[] = RECORDED_DIAGRAMS.flatMap((diagram) =>
    fixturesOf(diagram),
  )

  /** The flowchart fixture named `name` among `candidates`. */
  function fixtureNamed(candidates: readonly Fixture[], name: string): Fixture {
    const fixture = candidates.find(
      (candidate) =>
        candidate.diagram === "flowchart" && candidate.name === name,
    )
    if (fixture === undefined) throw new Error(`no fixture flowchart/${name}`)
    return fixture
  }

  /** The fixtures that carry the mark `knownDivergence`. */
  function marked(knownDivergence: string): Fixture[] {
    return fixtures.filter(
      (fixture) => fixture.knownDivergence === knownDivergence,
    )
  }

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
        const reading = clickReferenceReadingOf(fixture)
        if (reading.kind !== "compared") return
        expectSameAsMermaid(
          reading.outcome,
          fixture.expected,
          embeddedValuesOf(fixture, fixture.expected),
        )
      })
    }

    // Each case of the document, with a fixture of it, so that the check
    // above does not pass without comparing.
    it.each([
      ["db-edge-target-bare-click", "compared"],
      ["gram-subgraph-name-click", "units-change"],
      ["db-subgraph-id-click-comma-blank-line", "reference-rejected"],
      ["gram-subgraph-name-click-semicolon-in-id", "click-id-outside-leaf"],
    ] as const)("flowchart/%s: %s", (name, kind) => {
      expect(
        clickReferenceReadingOf(fixtureNamed(fixturesWithMark, name)).kind,
      ).toBe(kind)
    })
  })

  // known-divergences/tokenless-empty-forms.md: mermaid.js reads nothing for an
  // empty string, an empty call, an empty description block that is not a
  // statement, and, in a class diagram, an empty backquoted name and an
  // empty generic type, and the specification rejects them. The
  // reference input is the fixture input without its comment regions and
  // without those forms. Where the parser's lexer reads it as the units of
  // the input other than those of the forms, the parser must accept it and
  // give what mermaid.js gave for the input, so that the empty forms alone
  // explain that the parser rejects the input itself. Elsewhere the removal
  // joins the text around a form into other units, and mermaid.js may read
  // the reference input otherwise.
  describe("tokenless-empty-forms", () => {
    const fixturesWithMark = marked("tokenless-empty-forms")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, () => {
        expect(removedEmptyFormsIn(fixture.input)?.length).toBeGreaterThan(0)
        const reading = emptyFormReferenceReadingOf(fixture)
        if (reading.kind !== "compared") return
        expectSameAsMermaid(
          reading.outcome,
          fixture.expected,
          embeddedValuesOf(fixture, fixture.expected),
        )
      })
    }

    // Each case of the document that the corpus has, with a fixture of it,
    // so that the check above does not pass without comparing.
    it.each([
      ["db-subgraph-id-trailing-empty-string", "compared"],
      ["db-style-empty-string-separator", "units-change"],
    ] as const)("flowchart/%s: %s", (name, kind) => {
      expect(
        emptyFormReferenceReadingOf(fixtureNamed(fixturesWithMark, name)).kind,
      ).toBe(kind)
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
})
