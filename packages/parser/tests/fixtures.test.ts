/**
 * Layer 1 (acceptance), and where the parser builds a tree layers 2 and 3
 * (Db summary, and the invariants of ast.md, by which the tree and the
 * source give the input back), on the fixtures of `@mmd-toolkit/tests`.
 *
 * The `error` pseudo-diagram, the flowchart diagram types, `sequence`, and
 * `classDiagram` have a parser.
 * For every other detected type, `parse()` throws `UnsupportedDiagramError`,
 * and the test can only check that the type agrees with mermaid.js. The Db
 * summary is built from the tree, with the values that mermaid.js derives
 * from embedded data for the same text (`resolveEmbeddedData()`).
 *
 * The parser does not tell a known divergence apart; the `knownDivergence`
 * mark of a fixture alone decides what is expected.
 *
 * - Without a mark, the result must be that of mermaid.js.
 * - With `directive-as-token-boundary`, `click-reserved-word`,
 *   `tokenless-empty-forms`, or `headerless-empty-ending` the specification
 *   rejects what mermaid.js accepts, never the reverse.
 * - With `html-tag-in-frontmatter`, `comment-takes-character`,
 *   `comment-takes-line-break`, or `name-start-reads-unit` it gives the
 *   opposite acceptance, or the same acceptance with another Db.
 * - With `embedded-data-opaque` it accepts what mermaid.js rejects.
 *
 * Any other disagreement fails. For every mark but the last, a second test
 * checks with a reference input, or for `comment-takes-character` and
 * `comment-takes-line-break` with mermaid.js reading the input with the
 * rules of its lexer that the divergence names changed,
 * that the divergence is the only cause of the difference (see "marked
 * fixtures differ only by their divergence").
 */
import { isDeepStrictEqual } from "node:util"
import { describe, expect, it } from "vitest"
import type { Expectation, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type {
  DivergenceRemoval,
  EmbeddedValues,
} from "@mmd-toolkit/tests/mermaid"
import {
  resolveEmbeddedData,
  runMermaidWithEmbeddedData,
} from "@mmd-toolkit/tests/mermaid"
import type { Root, Token } from "../src/index.ts"
import { ParseError, UnsupportedDiagramError, parse } from "../src/index.ts"
import { checkTree } from "./helpers/check-tree.ts"
import { dbOf } from "./helpers/db.ts"
import { exceedsMaxEdges } from "./helpers/flowchart-edges.ts"
import {
  clickIdsWithinLeafNodes,
  clickReferenceOf,
  keepsUnitsWithoutEmptyForms,
  removedEmptyFormsIn,
  reservedClicksIn,
  withoutDirectives,
  withoutEmptyForms,
  withoutFrontmatterTagStarts,
  commentsAfterMatchStarts,
  commentsAfterUnits,
  CLASS_READING_REMOVALS,
  namesStartingWithUnits,
  rejectsWithoutHeader,
} from "./helpers/reference-inputs.ts"

/** What `parse()` does with an input. */
type Outcome =
  | { readonly kind: "tree"; readonly text: string; readonly root: Root }
  | { readonly kind: "unsupported"; readonly diagramType: string }
  | { readonly kind: "rejected" }

/**
 * What `parse()` does with an input, together with the one rejection of
 * mermaid.js that depends on the site configuration `config` and that
 * `parse()` therefore does not make: more Db edges than `maxEdges`
 * (diagrams/flowchart.md, Rejections outside the grammar).
 */
function outcomeOf(input: string, config?: Fixture["config"]): Outcome {
  try {
    const root = parse(input)
    return exceedsMaxEdges(root, config)
      ? { kind: "rejected" }
      : { kind: "tree", text: input, root }
  } catch (error) {
    if (error instanceof UnsupportedDiagramError) {
      return { kind: "unsupported", diagramType: error.diagramType }
    }
    if (error instanceof ParseError) return { kind: "rejected" }
    throw error
  }
}

/**
 * Asserts that `outcome` is what mermaid.js did, as far as the parser can
 * tell: the same acceptance; for an accepted input the same diagram type
 * and, when the parser builds a tree and mermaid.js gave a Db summary, the
 * same Db, built with `embedded`, the values that mermaid.js derived from
 * the embedded data of the text it read. When the diagram type is not
 * supported yet and mermaid.js rejected the input, the rejection must come
 * from the diagram's own parser: no diagram type, and the `---`
 * pseudo-diagram, are decided by the rules this parser implements.
 */
function expectSameAsMermaid(
  outcome: Outcome,
  mermaid: Expectation,
  embedded: EmbeddedValues | undefined,
): void {
  if (mermaid.accepted) {
    expect(outcome.kind).not.toBe("rejected")
    if (outcome.kind === "tree") {
      expect(outcome.root.diagramType).toBe(mermaid.diagramType)
      if (mermaid.db !== null) {
        if (embedded === undefined) {
          throw new Error("mermaid.js accepted the text but gave no values")
        }
        expect(dbOf(outcome.text, outcome.root, embedded)).toEqual(mermaid.db)
      }
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

/** The values that mermaid.js derives from the embedded data of the input of `fixture`. */
function embeddedOf(fixture: Fixture): Promise<EmbeddedValues | undefined> {
  return resolveEmbeddedData(
    fixture.input,
    fixture.config === undefined ? {} : { config: fixture.config },
  )
}

/**
 * Guards against a reference reading that changes nothing: whether
 * mermaid.js, read with `removals` removed from its lexer, gives for some
 * of `fixtures` another acceptance or another Db than `expected.json`,
 * which records mermaid.js as it is.
 */
async function readingChangesSomeFixture(
  fixtures: readonly Fixture[],
  removals: readonly DivergenceRemoval[],
): Promise<boolean> {
  for (const fixture of fixtures) {
    const { outcome } = await runMermaidWithEmbeddedData(fixture.input, {
      ...(fixture.config === undefined ? {} : { config: fixture.config }),
      withoutDivergences: removals,
    })
    const { expected } = fixture
    if (outcome.accepted !== expected.accepted) return true
    if (
      outcome.accepted &&
      expected.accepted &&
      !isDeepStrictEqual(outcome.db, expected.db)
    ) {
      return true
    }
  }
  return false
}

/**
 * Checks one fixture: the invariants of the tree, if there is one, and the
 * agreement with mermaid.js that its mark, or the lack of one, asks for.
 */
async function checkFixture(fixture: Fixture): Promise<void> {
  const { expected, knownDivergence } = fixture
  const outcome = outcomeOf(fixture.input, fixture.config)
  if (outcome.kind === "tree") checkTree(fixture.input, outcome.root)

  if (knownDivergence === undefined) {
    expectSameAsMermaid(outcome, expected, await embeddedOf(fixture))
  } else if (knownDivergence === "embedded-data-opaque") {
    // The parser never rejects for what embedded data contains.
    expect(expected.accepted).toBe(false)
    expect(outcome.kind).not.toBe("rejected")
  } else if (outcome.kind === "unsupported") {
    // The divergence shows in the diagram's own grammar, which this
    // parser does not have yet; only the detected type can be checked.
    if (expected.accepted) {
      expect(outcome.diagramType).toBe(expected.diagramType)
    }
  } else if (
    knownDivergence === "directive-as-token-boundary" ||
    knownDivergence === "click-reserved-word" ||
    knownDivergence === "tokenless-empty-forms" ||
    knownDivergence === "headerless-empty-ending"
  ) {
    // One way only: a directive inside a unit that may not have one, a
    // `click` that does not start a click statement, an empty form that no
    // rule takes, and a class diagram without its header are rejected here
    // and accepted by mermaid.js.
    expect(expected.accepted).toBe(true)
    expect(outcome.kind).toBe("rejected")
  } else if (outcome.kind === "rejected") {
    // The opposite acceptance.
    expect(expected.accepted).toBe(true)
  } else if (expected.accepted) {
    // Both accept: the divergence changes the Db only. The Db is checked
    // against the reference reading under "marked fixtures differ only by
    // their divergence".
    expect(outcome.root.diagramType).toBe(expected.diagramType)
  }
}

describe("common fixtures", async () => {
  const fixtures = await loadFixtures("common")

  it("has fixtures", () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  for (const fixture of fixtures) {
    it(fixture.name, async () => {
      await checkFixture(fixture)
    })
  }
})

describe("flowchart fixtures", async () => {
  const fixtures = await loadFixtures("flowchart")

  it("has fixtures", () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  for (const fixture of fixtures) {
    it(fixture.name, async () => {
      await checkFixture(fixture)
    })
  }
})

describe("sequence fixtures", async () => {
  const fixtures = await loadFixtures("sequence")

  it("has fixtures", () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  for (const fixture of fixtures) {
    it(fixture.name, async () => {
      await checkFixture(fixture)
    })
  }
})

describe("class fixtures", async () => {
  const fixtures = await loadFixtures("class")

  it("has fixtures", () => {
    expect(fixtures.length).toBeGreaterThan(0)
  })

  for (const fixture of fixtures) {
    it(fixture.name, async () => {
      await checkFixture(fixture)
    })
  }
})

/**
 * ast.md, ErrorDiagram: the tokens of the fixtures that section names, as it
 * states them, with their kinds: `RawText` tokens, and the `Directive`
 * token of a directive between them.
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
    ["RawText", ";"],
  ],
  "error-style-semicolon-inside": [
    ["RawText", "error"],
    ["RawText", "%%"],
    ["RawText", "style:#f;x"],
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
  ]

  /** The fixtures that carry the mark `knownDivergence`. */
  function marked(knownDivergence: string): Fixture[] {
    return fixtures.filter(
      (fixture) => fixture.knownDivergence === knownDivergence,
    )
  }

  // known-divergences/directive-as-token-boundary.md: mermaid.js removes each
  // directive and joins the text around it, and the specification reads
  // the text in the same way, but rejects a directive inside a unit that
  // is not `RawText` or `Identifier`. The reference input is the fixture
  // input without its directives, and the parser must give for it what
  // mermaid.js gave for the input. The reference input differs from the
  // input only by its directives, so when the parser agrees with mermaid.js
  // on the reference input, the directives alone explain that the parser
  // rejects the input itself.
  describe("directive-as-token-boundary", () => {
    const fixturesWithMark = marked("directive-as-token-boundary")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, async () => {
        expectSameAsMermaid(
          outcomeOf(withoutDirectives(fixture.input)),
          fixture.expected,
          await embeddedOf(fixture),
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
      it(`${fixture.diagram}/${fixture.name}`, async () => {
        expect(reservedClicksIn(fixture.input)?.length).toBeGreaterThan(0)
        const outcome = clickReferenceOutcomeOf(fixture)
        if (outcome === null) return
        expectSameAsMermaid(
          outcome,
          fixture.expected,
          await embeddedOf(fixture),
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
  // empty string, an empty call, and an empty description block that does
  // not start a statement, and the specification rejects them. The
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
      it(`${fixture.diagram}/${fixture.name}`, async () => {
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
          await embeddedOf(fixture),
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

  // known-divergences/comment-takes-character.md: in sequence, a
  // comment starts at its `%%` here, while mermaid.js takes the character
  // right before it into the comment where a rule would start there, and
  // reads no number before it. Each fixture has such a `%%`, and mermaid.js
  // with the two rules of its lexer that the divergence names changed
  // (`withoutDivergences`) must give what the parser gives for the input.
  describe("comment-takes-character", () => {
    const fixturesWithMark = marked("comment-takes-character")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    // Guards against a reading that changes nothing, which would compare
    // the parser with mermaid.js as it is.
    it("reads some of them otherwise than mermaid.js as it is", async () => {
      expect(
        await readingChangesSomeFixture(fixturesWithMark, [
          "comment-takes-character",
        ]),
      ).toBe(true)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, async () => {
        const places = commentsAfterMatchStarts(fixture.input)
        if (places === null) throw new Error("the input is no sequence")
        expect(places.length).toBeGreaterThan(0)
        const { outcome: mermaid, embedded } = await runMermaidWithEmbeddedData(
          fixture.input,
          {
            ...(fixture.config === undefined ? {} : { config: fixture.config }),
            withoutDivergences: ["comment-takes-character"],
          },
        )
        expectSameAsMermaid(outcomeOf(fixture.input), mermaid, embedded)
      })
    }
  })

  // known-divergences/comment-takes-line-break.md: in class diagrams, a
  // comment that follows a unit on its line ends at the end of the line
  // here, while mermaid.js takes the line feeds after it. Each fixture has
  // such a comment, and mermaid.js with the rule of its lexer that the
  // divergence names changed, and with `name-start-reads-unit` removed as
  // well (`withoutDivergences`, `CLASS_READING_REMOVALS`), must give what
  // the parser gives for the input.
  describe("comment-takes-line-break", () => {
    const fixturesWithMark = marked("comment-takes-line-break")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    // Guards against a reading that changes nothing, which would compare
    // the parser with mermaid.js as it is.
    it("reads some of them otherwise than mermaid.js as it is", async () => {
      expect(
        await readingChangesSomeFixture(
          fixturesWithMark,
          CLASS_READING_REMOVALS,
        ),
      ).toBe(true)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, async () => {
        const places = commentsAfterUnits(fixture.input)
        if (places === null) throw new Error("the input is no class diagram")
        expect(places.length).toBeGreaterThan(0)
        const { outcome: mermaid, embedded } = await runMermaidWithEmbeddedData(
          fixture.input,
          {
            ...(fixture.config === undefined ? {} : { config: fixture.config }),
            withoutDivergences: CLASS_READING_REMOVALS,
          },
        )
        expectSameAsMermaid(outcomeOf(fixture.input), mermaid, embedded)
      })
    }
  })

  // known-divergences/name-start-reads-unit.md: in class diagrams,
  // mermaid.js reads `"`, `~`, `<<`, `>>`, or a keyword at the start of a
  // backquoted name or of a generic type as that unit, and this
  // specification reads the text. Each fixture has such a name, and
  // mermaid.js with the rules of its lexer that the divergence names
  // reordered, and with `comment-takes-line-break` removed as well
  // (`withoutDivergences`, `CLASS_READING_REMOVALS`), must give what the
  // parser gives.
  describe("name-start-reads-unit", () => {
    const fixturesWithMark = marked("name-start-reads-unit")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    // Guards against a reading that changes nothing, which would compare
    // the parser with mermaid.js as it is.
    it("reads some of them otherwise than mermaid.js as it is", async () => {
      expect(
        await readingChangesSomeFixture(
          fixturesWithMark,
          CLASS_READING_REMOVALS,
        ),
      ).toBe(true)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, async () => {
        const places = namesStartingWithUnits(fixture.input)
        if (places === null) throw new Error("the input is no class diagram")
        expect(places.length).toBeGreaterThan(0)
        const { outcome: mermaid, embedded } = await runMermaidWithEmbeddedData(
          fixture.input,
          {
            ...(fixture.config === undefined ? {} : { config: fixture.config }),
            withoutDivergences: CLASS_READING_REMOVALS,
          },
        )
        expectSameAsMermaid(outcomeOf(fixture.input), mermaid, embedded)
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
  // tags that start in the frontmatter. The reference input is the fixture
  // input whose frontmatter starts no tag, so mermaid.js reads it as the
  // specification reads the input, and the parser must give for the input what
  // mermaid.js gives for the reference input. The values that depend on the
  // frontmatter (the title, the configuration) come from the reference input,
  // whose frontmatter holds `(` where the input holds `<`.
  describe("html-tag-in-frontmatter", () => {
    const fixturesWithMark = marked("html-tag-in-frontmatter")

    it("has fixtures", () => {
      expect(fixturesWithMark.length).toBeGreaterThan(0)
    })

    for (const fixture of fixturesWithMark) {
      it(`${fixture.diagram}/${fixture.name}`, async () => {
        const reference = withoutFrontmatterTagStarts(fixture.input)
        expect(reference).not.toBe(fixture.input)
        const { outcome: mermaid, embedded } = await runMermaidWithEmbeddedData(
          reference,
          fixture.config === undefined ? {} : { config: fixture.config },
        )
        expectSameAsMermaid(outcomeOf(fixture.input), mermaid, embedded)
      })
    }

    // Guards against the check passing vacuously.
    it("compares the reference input of most of them", async () => {
      let compared = 0
      for (const fixture of fixturesWithMark) {
        const reference = withoutFrontmatterTagStarts(fixture.input)
        const { outcome: mermaid } = await runMermaidWithEmbeddedData(
          reference,
          fixture.config === undefined ? {} : { config: fixture.config },
        )
        const outcome = outcomeOf(fixture.input, fixture.config)
        if (
          mermaid.accepted &&
          mermaid.db !== null &&
          outcome.kind === "tree"
        ) {
          compared += 1
        }
      }
      expect(compared * 2).toBeGreaterThan(fixturesWithMark.length)
    })
  })
})
