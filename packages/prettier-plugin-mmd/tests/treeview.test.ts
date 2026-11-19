/** Escaped treeview Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import { parse, traverseNodes } from "@mmd-toolkit/parser"
import { createSource } from "../src/printers/source.ts"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  describeFrontmatterChange,
  writtenEmbeddedTexts,
  writtenTextKeptUpToSeparators,
} from "./db-reading.ts"
import { dbForFormattingComparison } from "./db-comparison.ts"
import { treeviewCases } from "./treeview-cases.ts"
import { loadFormatFixtures } from "./fixtures.ts"
import { treeviewLines } from "../src/printers/treeview-layout.ts"
import { planTreeviewBox } from "../src/printers/treeview-box.ts"

/** The source Prettier gives the parser, without a leading byte order mark. */
function parserText(text: string): string {
  return text.startsWith("\ufeff") ? text.slice(1) : text
}

describe("treeview escaped cases", () => {
  it.each(treeviewCases)("$name", async (fixture) => {
    const { input, output, options } = fixture
    expect(await formatMermaid(input, "diagram.mmd", options)).toBe(output)
    expect(await formatMermaid(output, "diagram.mmd", options)).toBe(output)
    expect(await formatMermaid(output, "diagram.mmd", options)).toBe(output)
    const before = parserText(input)
    const after = parserText(output)
    const embedded = defaultEmbedded()
    expect(dbOfText(after, embedded)).toEqual(dbOfText(before, embedded))
    expect(writtenEmbeddedTexts(after)).toEqual(writtenEmbeddedTexts(before))
    expect(await describeFrontmatterChange(before, after, options)).toBeNull()
    expect(writtenTextKeptUpToSeparators(before, after)).toBe(true)
  })

  it.each([
    {
      name: "treeview/annotation-lines/box-redraw-comment-region-prefix-ls",
      form: "TreeviewBranchPrefix",
      owner: "TreeviewClassAnnotation",
    },
    {
      name: "treeview/annotation-lines/box-redraw-comment-region-prefix-ps",
      form: "TreeviewBranchPrefix",
      owner: "TreeviewClassAnnotation",
    },
    {
      name: "treeview/branch-prefixes/box-redraw-comment-region-in-prefix-ps",
      form: "TreeviewBranchPrefix",
      owner: "TreeviewNode",
    },
    {
      name: "treeview/decorations/box-redraw-decoration-comment-region-ps",
      form: "TreeviewIgnoredText",
      owner: "TreeviewNode",
    },
  ])(
    "$name: a joining region crosses $owner.$form",
    ({ name, form, owner }) => {
      const fixture = treeviewCases.find((candidate) => candidate.name === name)
      if (fixture === undefined)
        throw new Error(`Missing treeview case: ${name}`)
      const root = parse(fixture.input)
      const source = createSource(fixture.input, root)
      expect(source.joiningRegions).toHaveLength(1)
      expect(source.joiningRegions[0].hasTextAfter).toBe(true)
      const crossed: string[] = []
      traverseNodes(root, {
        enterNode(node, parent) {
          if (
            node.type === form &&
            parent?.type === owner &&
            source.joiningRegions.some(
              (region) =>
                region.start < node.range[1] && node.range[0] < region.end,
            )
          )
            crossed.push(node.type)
        },
        leaveNode: () => undefined,
      })
      expect(crossed).toEqual([form])
    },
  )
})

/** Texts that mermaid.js rejects (docs/treeview.md, Modes and Final newline). */
describe("treeview texts that are rejected", () => {
  it.each([
    [
      "treeview/modes/box-annotation-column-one-rejected",
      'treeView-beta\n"R"\n\u251c\u2500\u2500 "a"\n:::x\n',
    ],
    [
      "treeview/final-newline/open-directive-after-quoted-name-space-rejected",
      'treeView-beta\n"R" %%{unfinished',
    ],
    [
      "treeview/final-newline/open-directive-after-class-space-rejected",
      "treeView-beta\nR :::x %%{unfinished",
    ],
    [
      "treeview/modes/box-annotation-indented-rejected",
      'treeView-beta\n"R"\n\u251c\u2500\u2500 "a"\n    :::x\n',
    ],
  ])("%s", async (_name, input) => {
    await expect(formatMermaid(input)).rejects.toBeInstanceOf(SyntaxError)
  })
})

it("treeview split directives remain redrawable", async () => {
  const fixtures = new Map(
    (await loadFormatFixtures("treeview")).map((fixture) => [
      fixture.id,
      fixture.output,
    ]),
  )
  for (const fixture of treeviewCases)
    fixtures.set(fixture.name, fixture.output)
  const names = [
    "treeview/statements-one-per-line/review159-box-quoted-inline-directive",
    "treeview/statements-one-per-line/review159-split-directive-touching",
    "treeview/statements-one-per-line/review159-split-directive-left-space",
    "treeview/statements-one-per-line/review159-split-directive-right-space",
    "treeview/statements-one-per-line/review159-split-directives-touching",
    "treeview/statements-one-per-line/review159-split-directives-spaced",
    "treeview/statements-one-per-line/review159-split-directive-quoted-bare",
    "treeview/statements-one-per-line/review159-split-directive-bare-quoted",
    "treeview/statements-one-per-line/review159-split-directive-three-nodes",
    "treeview/statements-one-per-line/review159-split-directive-deep",
    "treeview/statements-one-per-line/review159-split-directive-multiline",
    "treeview/statements-one-per-line/review159-split-directive-own-line",
    "treeview/statements-one-per-line/review159-split-directive-comment-line",
    "treeview/statements-one-per-line/review159-split-directive-empty-line",
    "treeview/statements-one-per-line/review159-split-directive-empty-block",
    "treeview/statements-one-per-line/review159-split-directive-region-ls",
    "treeview/statements-one-per-line/review159-split-directive-region-ps",
    "treeview/statements-one-per-line/review159-split-directive-redraw-again",
  ]
  for (const name of names) {
    const text = fixtures.get(name)
    if (typeof text !== "string") throw new Error(`Missing fixture: ${name}`)
    for (const options of [{}, { tabWidth: 0 }, { useTabs: true }]) {
      const output = await formatMermaid(text, "diagram.mmd", options)
      const root = parse(output)
      if (root.body.type !== "TreeviewDiagram")
        throw new Error(`Expected treeview fixture: ${name}`)
      const source = createSource(output, root)
      const header = root.tokens.find(
        (token) => token.value === "treeView-beta",
      )!
      // These canonical outputs have one node per line and no semicolons.
      // A second pass must reach the drawing plan, not freeze the body.
      const plan = planTreeviewBox(
        source,
        root.body,
        treeviewLines(source, root.body, header.range[1], true),
        header.range[1],
        false,
      )
      expect(plan.kind, name).toBe("drawn")
    }
  }
})

/**
 * What a title and an `accTitle:` and an `accDescr:` line print for the text
 * written after the keyword, where a directive (`%{x}%`, and `%{y}%` for a
 * second one) stands in it (docs/treeview.md, Title and Accessibility lines).
 */
const directiveBesideTextRows: readonly {
  readonly written: string
  readonly title: string
  readonly accTitle: string
  readonly accDescr: string
}[] = [
  {
    written: "T  %%{x}%%  ",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T  %%{x}%%  %%{y}%%  ",
    title: "T %%{x}%% %%{y}%%",
    accTitle: "T %%{x}%% %%{y}%%",
    accDescr: "T %%{x}%% %%{y}%%",
  },
  {
    written: "T  %%{x}%%  %% c",
    title: "T %%{x}%% %% c",
    accTitle: "T %%{x}%% %% c",
    accDescr: "T %%{x}%% %% c",
  },
  {
    written: "T  %%{x}%%%% c",
    title: "T %%{x}%%%% c",
    accTitle: "T %%{x}%%%% c",
    accDescr: "T %%{x}%%%% c",
  },
  {
    written: "T %%{x}%%  U  %%{y}%%  ",
    title: "T %%{x}%%  U  %%{y}%%  ",
    accTitle: "T %%{x}%%  U  %%{y}%%  ",
    accDescr: "T %%{x}%%  U  %%{y}%%  ",
  },
  {
    written: "T %%{x}%% U  ",
    title: "T %%{x}%% U  ",
    accTitle: "T %%{x}%% U  ",
    accDescr: "T %%{x}%% U  ",
  },
  {
    written: "T %%{x}%%\u00a0",
    title: "T %%{x}%%\u00a0",
    accTitle: "T %%{x}%%\u00a0",
    accDescr: "T %%{x}%%\u00a0",
  },
  {
    written: "T %%{x}%%\u3000",
    title: "T %%{x}%%\u3000",
    accTitle: "T %%{x}%%\u3000",
    accDescr: "T %%{x}%%\u3000",
  },
  {
    written: "T %%{x}%%\u2003",
    title: "T %%{x}%%\u2003",
    accTitle: "T %%{x}%%\u2003",
    accDescr: "T %%{x}%%\u2003",
  },
  {
    written: "T %%{x}%%\u0085",
    title: "T %%{x}%%\u0085",
    accTitle: "T %%{x}%%\u0085",
    accDescr: "T %%{x}%%\u0085",
  },
  {
    written: "T %%{x}%%\u2028",
    title: "T %%{x}%%\u2028",
    accTitle: "T %%{x}%%\u2028",
    accDescr: "T %%{x}%%\u2028",
  },
  {
    written: "T %%{x}%%\u2029",
    title: "T %%{x}%%\u2029",
    accTitle: "T %%{x}%%\u2029",
    accDescr: "T %%{x}%%\u2029",
  },
  {
    written: "T %%{x}%%;",
    title: "T %%{x}%%;",
    accTitle: "T %%{x}%%;",
    accDescr: "T %%{x}%%;",
  },
  {
    written: "T %%{x}%%\t",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T\u00a0%%{x}%%",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T\u2028%%{x}%%",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T\u2028%%{x}%%  ",
    title: "T\u2028%%{x}%%  ",
    accTitle: "T\u2028%%{x}%%  ",
    accDescr: "T\u2028%%{x}%%  ",
  },
  {
    written: "T\u2029%%{x}%%  ",
    title: "T\u2029%%{x}%%  ",
    accTitle: "T\u2029%%{x}%%  ",
    accDescr: "T\u2029%%{x}%%  ",
  },
  {
    written: "T\u0085%%{x}%%  ",
    title: "T\u0085%%{x}%%",
    accTitle: "T\u0085%%{x}%%",
    accDescr: "T\u0085%%{x}%%",
  },
  {
    written: "T\t%%{x}%%",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T\t%%{x}%%\t",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "%%{x}%%  T  ",
    title: "%%{x}%%T",
    accTitle: "%%{x}%%  T  ",
    accDescr: "%%{x}%%  T  ",
  },
  {
    written: "%%{x}%% T",
    title: "%%{x}%%T",
    accTitle: "%%{x}%% T",
    accDescr: "%%{x}%% T",
  },
  {
    written: "%%{x}%%\tT",
    title: "%%{x}%%T",
    accTitle: "%%{x}%%\tT",
    accDescr: "%%{x}%%\tT",
  },
  {
    written: "%%{x}%%\u00a0T",
    title: "%%{x}%%T",
    accTitle: "%%{x}%%\u00a0T",
    accDescr: "%%{x}%%\u00a0T",
  },
  {
    written: "%%{x}%%\u3000T",
    title: "%%{x}%%T",
    accTitle: "%%{x}%%\u3000T",
    accDescr: "%%{x}%%\u3000T",
  },
  {
    written: "%%{x}%%\u2003T",
    title: "%%{x}%%T",
    accTitle: "%%{x}%%\u2003T",
    accDescr: "%%{x}%%\u2003T",
  },
  {
    written: "%%{x}%%  T\u00a0",
    title: "%%{x}%%T",
    accTitle: "%%{x}%%  T\u00a0",
    accDescr: "%%{x}%%  T\u00a0",
  },
  {
    written: "%%{x}%%\u2028T",
    title: "%%{x}%%\u2028T",
    accTitle: "%%{x}%%\u2028T",
    accDescr: "%%{x}%%\u2028T",
  },
  {
    written: "%%{x}%%\u2029T",
    title: "%%{x}%%\u2029T",
    accTitle: "%%{x}%%\u2029T",
    accDescr: "%%{x}%%\u2029T",
  },
  {
    written: "%%{x}%%\u0085T",
    title: "%%{x}%%\u0085T",
    accTitle: "%%{x}%%\u0085T",
    accDescr: "%%{x}%%\u0085T",
  },
  {
    written: "%%{x}%%  T\u2028",
    title: "%%{x}%%T",
    accTitle: "%%{x}%%  T\u2028",
    accDescr: "%%{x}%%  T\u2028",
  },
  {
    written: "%%{x}%%  T\u0085",
    title: "%%{x}%%T\u0085",
    accTitle: "%%{x}%%  T\u0085",
    accDescr: "%%{x}%%  T\u0085",
  },
  {
    written: "%%{x}%%  %%{y}%%  T  ",
    title: "%%{x}%%  %%{y}%%  T  ",
    accTitle: "%%{x}%%  %%{y}%%  T  ",
    accDescr: "%%{x}%%  %%{y}%%  T  ",
  },
  {
    written: "%%{x}%%  %%{y}%%  T",
    title: "%%{x}%%  %%{y}%%  T",
    accTitle: "%%{x}%%  %%{y}%%  T",
    accDescr: "%%{x}%%  %%{y}%%  T",
  },
  {
    written: "%%{x}%%%%{y}%%  T  ",
    title: "%%{x}%%%%{y}%%T",
    accTitle: "%%{x}%%%%{y}%%  T  ",
    accDescr: "%%{x}%%%%{y}%%  T  ",
  },
  {
    written: "%%{x}%%  %%{y}%%T  ",
    title: "%%{x}%%  %%{y}%%T  ",
    accTitle: "%%{x}%%  %%{y}%%T  ",
    accDescr: "%%{x}%%  %%{y}%%T  ",
  },
  {
    written: "%%{x}%% %%{y}%%T",
    title: "%%{x}%% %%{y}%%T",
    accTitle: "%%{x}%% %%{y}%%T",
    accDescr: "%%{x}%% %%{y}%%T",
  },
  {
    written: "%%{x}%%%%{y}%%T",
    title: "%%{x}%%%%{y}%%T",
    accTitle: "%%{x}%%%%{y}%%T",
    accDescr: "%%{x}%%%%{y}%%T",
  },
  {
    written: "%%{x}%%  ",
    title: "%%{x}%%  ",
    accTitle: "%%{x}%%  ",
    accDescr: "%%{x}%%  ",
  },
  {
    written: "%%{x}%%\t",
    title: "%%{x}%%\t",
    accTitle: "%%{x}%%\t",
    accDescr: "%%{x}%%\t",
  },
  {
    written: "%%{x}%%  %%{y}%%  ",
    title: "%%{x}%%  %%{y}%%  ",
    accTitle: "%%{x}%%  %%{y}%%  ",
    accDescr: "%%{x}%%  %%{y}%%  ",
  },
  {
    written: "T\u3000%%{x}%%",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T\u2003%%{x}%%",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T\u2029%%{x}%%",
    title: "T %%{x}%%",
    accTitle: "T %%{x}%%",
    accDescr: "T %%{x}%%",
  },
  {
    written: "T\u0085%%{x}%%",
    title: "T\u0085%%{x}%%",
    accTitle: "T\u0085%%{x}%%",
    accDescr: "T\u0085%%{x}%%",
  },
  {
    written: "T %%{x}%%\u00a0%% c",
    title: "T %%{x}%%\u00a0%% c",
    accTitle: "T %%{x}%%\u00a0%% c",
    accDescr: "T %%{x}%%\u00a0%% c",
  },
  {
    written: "T %%{x}%%\u3000%% c",
    title: "T %%{x}%%\u3000%% c",
    accTitle: "T %%{x}%%\u3000%% c",
    accDescr: "T %%{x}%%\u3000%% c",
  },
  {
    written: "T %%{x}%%\t%% c",
    title: "T %%{x}%% %% c",
    accTitle: "T %%{x}%% %% c",
    accDescr: "T %%{x}%% %% c",
  },
  {
    written: "T %%{x}%%  %% c",
    title: "T %%{x}%% %% c",
    accTitle: "T %%{x}%% %% c",
    accDescr: "T %%{x}%% %% c",
  },
]

/** Formats the input as the output states, again to the same, with the Db kept. */
async function expectDirectiveRowKept(
  input: string,
  output: string,
): Promise<void> {
  expect(await formatMermaid(input)).toBe(output)
  expect(await formatMermaid(output)).toBe(output)
  const embedded = defaultEmbedded()
  expect(dbOfText(output, embedded)).toEqual(dbOfText(input, embedded))
}

/**
 * Formats the input as the output states, again to the same, with the Db kept
 * up to the runs of whitespace that mermaid.js draws as one space.
 */
async function expectDirectiveRowKeptUpToRuns(
  input: string,
  output: string,
): Promise<void> {
  expect(await formatMermaid(input)).toBe(output)
  expect(await formatMermaid(output)).toBe(output)
  const embedded = defaultEmbedded()
  const before = dbOfText(input, embedded)
  expect(
    dbForFormattingComparison(
      before,
      dbOfText(output, embedded),
      input,
      output,
    ),
  ).toEqual(before)
}

/**
 * The whitespace that becomes one space before the last directive of a title
 * and of an accessibility line, where nothing follows the directive: the tab and
 * the whitespace of the specification that is no space, tab, or line terminator
 * (docs/treeview.md, Title).
 */
const whitespaceBeforeTheLastDirective: readonly string[] = [
  "\t",
  "\u000b",
  "\u000c",
  "\u00a0",
  "\u1680",
  "\u2000",
  "\u2001",
  "\u2002",
  "\u2003",
  "\u2004",
  "\u2005",
  "\u2006",
  "\u2007",
  "\u2008",
  "\u2009",
  "\u200a",
  "\u2028",
  "\u2029",
  "\u202f",
  "\u205f",
  "\u3000",
  "\ufeff",
]

describe("the whitespace beside a directive in a title and in an accessibility line", () => {
  it("treeview: the whitespace beside a directive in a title", async () => {
    for (const row of directiveBesideTextRows)
      await expectDirectiveRowKept(
        `treeView-beta\ntitle ${row.written}\nR\n`,
        `treeView-beta\n  title ${row.title}\n  R\n`,
      )
  })

  it("treeview: each whitespace character before the last directive of a title and of an accessibility line", async () => {
    for (const keyword of ["title", "accTitle:", "accDescr:"]) {
      for (const character of whitespaceBeforeTheLastDirective)
        await expectDirectiveRowKept(
          `treeView-beta\n${keyword} T${character}%%{x}%%\nR\n`,
          `treeView-beta\n  ${keyword} T %%{x}%%\n  R\n`,
        )
      await expectDirectiveRowKept(
        `treeView-beta\n${keyword} T\u0085%%{x}%%\nR\n`,
        `treeView-beta\n  ${keyword} T\u0085%%{x}%%\n  R\n`,
      )
    }
  })

  it("treeview: the whitespace beside a directive in an accTitle line", async () => {
    for (const row of directiveBesideTextRows)
      await expectDirectiveRowKept(
        `treeView-beta\naccTitle: ${row.written}\nR\n`,
        `treeView-beta\n  accTitle: ${row.accTitle}\n  R\n`,
      )
  })

  it("treeview: the whitespace beside a directive in an accDescr line", async () => {
    for (const row of directiveBesideTextRows)
      await expectDirectiveRowKept(
        `treeView-beta\naccDescr: ${row.written}\nR\n`,
        `treeView-beta\n  accDescr: ${row.accDescr}\n  R\n`,
      )
  })
})

const keywordsOfTheTitleLines = ["title", "accTitle:", "accDescr:"] as const

/** A directive that holds a line break, and one that holds a semicolon. */
const lineBreakOrSemicolonDirectives = [
  "%%{init: {\n}}%%",
  "%%{init: {a;b}}%%",
] as const

/**
 * The whitespace characters that are no space, tab, or line separator, among
 * them the no-break space (docs/treeview.md, Title).
 */
const whitespaceLikeANoBreakSpace = whitespaceBeforeTheLastDirective.filter(
  (character) => !["\t", "\u2028", "\u2029"].includes(character),
)

/**
 * What a title, an accTitle: line, and an accDescr: line print for the
 * whitespace `{w}` before the last directive, or between it and a comment, by
 * what follows the directive (docs/treeview.md, Title). Each form is what is
 * printed for a tab, for the whitespace characters like a no-break space, for a
 * U+2028 and a U+2029, and for a U+0085, as the text after the keyword, or
 * "as written"; `null` is a form with no printed form, since the first pass and
 * the second differ.
 */
interface WhitespaceBeforeTheLastDirectiveRow {
  readonly name: string
  readonly written: string
  readonly tab: string | null
  readonly like: string | null
  readonly separator: string | null
  readonly nel: string | null
  /** The line after a U+2028 or a U+2029 before a comment stays at column one. */
  readonly separatorStartsALine?: true
  /** What a U+2028 and a U+2029 print where the line is the last statement. */
  readonly separatorAtTheEnd?: string
}

const whitespaceBeforeTheLastDirectiveRows: readonly WhitespaceBeforeTheLastDirectiveRow[] =
  [
    {
      name: "treeview: the whitespace before the last directive, with nothing after it",
      written: "T{w}%%{x}%%",
      tab: "T %%{x}%%",
      like: "T %%{x}%%",
      separator: "T %%{x}%%",
      nel: "as written",
    },
    {
      name: "treeview: the whitespace before the last directive, with spaces after it",
      written: "T{w}%%{x}%%  ",
      tab: "T %%{x}%%",
      like: null,
      separator: "as written",
      nel: "T{w}%%{x}%%",
    },
    {
      name: "treeview: the whitespace before the last directive, with a tab after it",
      written: "T{w}%%{x}%%\t",
      tab: "T %%{x}%%",
      like: null,
      separator: "as written",
      nel: "T{w}%%{x}%%",
    },
    {
      name: "treeview: the whitespace before the last directive, with a comment that touches it",
      written: "T{w}%%{x}%%%% c",
      tab: "T %%{x}%%%% c",
      like: "T %%{x}%%%% c",
      separator: "as written",
      nel: "as written",
      separatorStartsALine: true,
      separatorAtTheEnd: "T\n%%{x}%%%% c",
    },
    {
      name: "treeview: the whitespace before the last directive, with a comment after a space",
      written: "T{w}%%{x}%% %% c",
      tab: "T %%{x}%% %% c",
      like: "as written",
      separator: "as written",
      nel: "as written",
      separatorStartsALine: true,
      separatorAtTheEnd: "T\n%%{x}%% %% c",
    },
    {
      name: "treeview: the whitespace before the last directive, with a second directive that touches it",
      written: "T{w}%%{x}%%%%{y}%%",
      tab: "T %%{x}%%%%{y}%%",
      like: "T %%{x}%%%%{y}%%",
      separator: "T %%{x}%%%%{y}%%",
      nel: "as written",
    },
    {
      name: "treeview: the whitespace before the last directive, with a second directive after a space",
      written: "T{w}%%{x}%% %%{y}%%",
      tab: "T %%{x}%% %%{y}%%",
      like: "as written",
      separator: "as written",
      nel: "as written",
    },
    {
      name: "treeview: the whitespace before the last directive, with a semicolon after it",
      written: "T{w}%%{x}%%;",
      tab: "as written",
      like: "as written",
      separator: "as written",
      nel: "as written",
    },
    {
      name: "treeview: the whitespace before the last directive, with text after a space",
      written: "T{w}%%{x}%% U",
      tab: "as written",
      like: "as written",
      separator: "as written",
      nel: "as written",
    },
    {
      name: "treeview: the whitespace between the last directive and a comment",
      written: "T %%{x}%%{w}%% c",
      tab: "T %%{x}%% %% c",
      like: "as written",
      separator: "as written",
      nel: "as written",
      separatorStartsALine: true,
      separatorAtTheEnd: "as written",
    },
  ]

/** The characters of each column of the rows, in the order of their forms. */
const whitespaceColumns = [
  ["\t"],
  whitespaceLikeANoBreakSpace,
  ["\u2028", "\u2029"],
  ["\u0085"],
] as const

/**
 * The runs of whitespace before the last directive whose characters that are no
 * space or tab are all of one column, by that column: a tab, a no-break space,
 * a U+2028 or a U+2029, and a U+0085. A run of spaces and tabs only follows the
 * first column (docs/treeview.md, Title).
 */
const runsOfOneColumn = [
  ["\t ", " \t"],
  [" \u00a0", "\u00a0 ", "\u00a0\u00a0", "\u00a0\u3000"],
  [
    " \u2028",
    "\u2028 ",
    " \u2029",
    "\u2029 ",
    "\t\u2028",
    "\u2028\t",
    "\t\u2029",
    "\u2029\t",
  ],
  [" \u0085"],
] as const

/**
 * The runs that hold a tab and a character of the column of the no-break space
 * or of U+0085, by that column (docs/treeview.md, Title).
 */
const runsOfATabAndAnotherColumn = [
  [
    "\t\u00a0",
    "\u00a0\t",
    "\t\t\u00a0",
    " \t\u00a0",
    "\t\u00a0\t",
    "\t\u00a0 ",
    "\u00a0\t\u00a0",
    "\t\u3000",
    "\u3000\t",
  ],
  ["\t\u0085", "\u0085\t"],
] as const

/** The text with each run of spaces and tabs in it as one space. */
function withEachRunOfSpacesAndTabsAsOneSpace(text: string): string {
  let result = ""
  let inRun = false
  for (const character of text) {
    if (character === " " || character === "\t") {
      if (!inRun) result += " "
      inRun = true
    } else {
      result += character
      inRun = false
    }
  }
  return result
}

/** The text with the run of spaces and tabs at its end as one space. */
function withTheLastRunOfSpacesAndTabsAsOneSpace(text: string): string {
  let end = text.length
  while (end > 0 && (text[end - 1] === " " || text[end - 1] === "\t")) end--
  return end === text.length ? text : `${text.slice(0, end)} `
}

/** The text after the keyword that a printed form gives for a character. */
function printedBeforeTheLastDirective(
  written: string,
  printed: string,
  character: string,
): string {
  return printed === "as written"
    ? written.replace("{w}", character)
    : printed.replace("{w}", character)
}

/**
 * A run of whitespace before the last directive follows the column of its
 * characters that are no space or tab, with a statement after the line or with
 * the line as the last statement of the text (docs/treeview.md, Title).
 */
async function expectRunsOfOneColumn(statementAfter: boolean): Promise<void> {
  for (const row of whitespaceBeforeTheLastDirectiveRows.slice(0, 9)) {
    const forms = [
      row.tab,
      row.like,
      statementAfter ? row.separator : (row.separatorAtTheEnd ?? row.separator),
      row.nel,
    ]
    for (const keyword of keywordsOfTheTitleLines) {
      for (const [index, columnRuns] of runsOfOneColumn.entries()) {
        const printed = forms[index]
        if (printed === null || printed === undefined) continue
        for (const run of columnRuns) {
          const line = row.written.replace("{w}", run)
          const next = !statementAfter
            ? ""
            : index === 2 && row.separatorStartsALine === true
              ? "R\n"
              : "  R\n"
          await expectDirectiveRowKept(
            `treeView-beta\n${keyword} ${line}\n${statementAfter ? "R\n" : ""}`,
            `treeView-beta\n  ${keyword} ${printedBeforeTheLastDirective(line, printed, run)}\n${next}`,
          )
        }
      }
    }
  }
}

/**
 * A run that holds a tab and a character of the column of the no-break space
 * or of U+0085, with a statement after the line or with the line as the last
 * statement of the text (docs/treeview.md, Title).
 */
async function expectRunsOfATabAndAnotherColumn(
  statementAfter: boolean,
): Promise<void> {
  for (const row of whitespaceBeforeTheLastDirectiveRows.slice(0, 9)) {
    for (const keyword of keywordsOfTheTitleLines) {
      for (const [index, columnRuns] of runsOfATabAndAnotherColumn.entries()) {
        const printed = [row.like, row.nel][index]
        if (printed === null || printed === undefined) continue
        for (const run of columnRuns) {
          const line = row.written.replace("{w}", run)
          const kept =
            row.tab === "as written"
              ? run
              : keyword === "accTitle:"
                ? withTheLastRunOfSpacesAndTabsAsOneSpace(run)
                : withEachRunOfSpacesAndTabsAsOneSpace(run)
          const form =
            printed === "as written"
              ? row.written.replace("{w}", kept)
              : printed.replace("{w}", kept)
          await expectDirectiveRowKeptUpToRuns(
            `treeView-beta\n${keyword} ${line}\n${statementAfter ? "R\n" : ""}`,
            `treeView-beta\n  ${keyword} ${form}\n${statementAfter ? "  R\n" : ""}`,
          )
        }
      }
    }
  }
}

/**
 * The runs between the last directive and a comment, with the form each
 * prints: a run of spaces and tabs is one space, and a run that holds another
 * whitespace character stays as written (docs/treeview.md, Title).
 */
const runsBetweenTheLastDirectiveAndAComment = {
  oneSpace: ["  ", "\t ", " \t", "\t\t"],
  asWritten: [
    " \u00a0",
    "\u00a0 ",
    "\t\u00a0",
    "\u00a0\t",
    " \t\u00a0",
    "\t\u3000",
    " \u0085",
    "\t\u0085",
    "\u0085\t",
    " \u2028",
    "\t\u2028",
    "  \u2028",
    " \u2029",
    "\t\u2029",
    "\u2028\u0085",
    "\u2028  \u0085",
    "\u2029\u0085 ",
    "\u2028\u0085\u2028",
  ],
  /**
   * Whitespace after the first line separator, as the last statement prints
   * it: one space.
   */
  afterASeparator: [
    ["\u2028 ", "\u2028 "],
    ["\u2028  ", "\u2028 "],
    ["\u2028\t", "\u2028 "],
    ["\u2029 ", "\u2029 "],
    ["\u2029  ", "\u2029 "],
    ["\u2029\t", "\u2029 "],
    [" \u2028  ", " \u2028 "],
    ["\t\u2029  ", "\t\u2029 "],
    ["\u00a0\u2028  ", "\u00a0\u2028 "],
    ["\u0085\u2028  ", "\u0085\u2028 "],
    ["\u2028\u00a0", "\u2028 "],
    ["\u2028\u3000", "\u2028 "],
    ["\u2029\u00a0", "\u2029 "],
    ["\u2029\u3000", "\u2029 "],
  ],
  /**
   * A second line separator after whitespace, with the first one: the last
   * statement puts the comment on a line of its own after the first one.
   */
  withASecondSeparator: [
    ["\u2028\u2028", "\u2028"],
    ["\u2028 \u2029", "\u2028"],
    ["\u2029\u2028", "\u2029"],
    ["\u2029\u00a0\u2028", "\u2029"],
  ],
} as const

/** A title line with a run of whitespace between the last directive and a comment. */
function lineBetween(keyword: string, run: string): string {
  return `${keyword} T %%{x}%%${run}%% c`
}

/**
 * A run between the last directive and a comment, with a statement after the
 * line or with the line as the last statement of the text (docs/treeview.md,
 * Title).
 */
async function expectRunsBetweenTheLastDirectiveAndAComment(
  statementAfter: boolean,
): Promise<void> {
  const after = statementAfter ? "R\n" : ""
  const { oneSpace, asWritten, afterASeparator, withASecondSeparator } =
    runsBetweenTheLastDirectiveAndAComment
  for (const keyword of keywordsOfTheTitleLines) {
    for (const run of oneSpace) {
      await expectDirectiveRowKept(
        `treeView-beta\n${lineBetween(keyword, run)}\n${after}`,
        `treeView-beta\n  ${lineBetween(keyword, " ")}\n${statementAfter ? "  R\n" : ""}`,
      )
    }
    for (const run of asWritten) {
      // The line after a comment that starts a line, after a U+2028 or a U+2029,
      // is not indented; a U+0085 after the last of them keeps the comment on
      // the line of the U+0085.
      const startsALine =
        Math.max(run.lastIndexOf("\u2028"), run.lastIndexOf("\u2029")) >
        run.lastIndexOf("\u0085")
      await expectDirectiveRowKept(
        `treeView-beta\n${lineBetween(keyword, run)}\n${after}`,
        `treeView-beta\n  ${lineBetween(keyword, run)}\n${statementAfter ? (startsALine ? "R\n" : "  R\n") : ""}`,
      )
    }
    for (const [run, lastStatement] of afterASeparator) {
      await expectDirectiveRowKept(
        `treeView-beta\n${lineBetween(keyword, run)}\n${after}`,
        `treeView-beta\n  ${lineBetween(keyword, statementAfter ? run : lastStatement)}\n${statementAfter ? "R\n" : ""}`,
      )
    }
    for (const [run, first] of withASecondSeparator) {
      await expectDirectiveRowKept(
        `treeView-beta\n${lineBetween(keyword, run)}\n${after}`,
        statementAfter
          ? `treeView-beta\n  ${lineBetween(keyword, run)}\nR\n`
          : `treeView-beta\n  ${lineBetween(keyword, first).slice(0, -"%% c".length)}\n  %% c\n`,
      )
    }
  }
}

/**
 * Formats the input, as the output starts, again to the same, with the Db kept
 * up to the runs of whitespace that mermaid.js draws as one space.
 */
async function expectTitleLineWithSeparators(
  input: string,
  start: string,
): Promise<void> {
  const output = await formatMermaid(input)
  expect(output.slice(0, start.length)).toBe(start)
  expect(await formatMermaid(output)).toBe(output)
  const before = dbOfText(input, defaultEmbedded())
  expect(
    dbForFormattingComparison(
      before,
      dbOfText(output, defaultEmbedded()),
      input,
      output,
    ),
  ).toEqual(before)
}

/**
 * The whitespace before the first U+2028 or U+2029 and after it, before the last
 * directive and between it and a comment, with what the line prints where the
 * text ends: the directive and the comment move to lines of their own, unless a
 * U+0085 stands after the first separator, anywhere up to the comment
 * (docs/treeview.md, Title).
 */
const separatorsAroundTheLastDirective = [
  ["\u2028", "\u2029", "T\n%%{x}%%\n  %% c\n"],
  [" \u2028 ", "\u2028\u00a0", "T\n%%{x}%%\n  %% c\n"],
  ["\t\u2029\u00a0", " \u2028\t", "T\n%%{x}%%\n  %% c\n"],
  ["\u0085\u2028", "", "T\u0085\n%%{x}%%%% c\n"],
  ["\u0085\u2029 ", " ", "T\u0085\n%%{x}%% %% c\n"],
  ["\u0085\u2028", "\u2029", "T\u0085\n%%{x}%%\n  %% c\n"],
  ["\u2028\u0085", "", "T\u2028\u0085%%{x}%%%% c\n"],
  ["\u2029 \u0085", "", "T\u2029 \u0085%%{x}%%%% c\n"],
  ["\u2028", "\u0085", "T\u2028%%{x}%%\u0085%% c\n"],
  ["\u2028", "\u2029\u0085", "T\u2028%%{x}%%\u2029\u0085%% c\n"],
  ["\u2029", "\u0085\u2028  ", "T\u2029%%{x}%%\u0085\u2028 %% c\n"],
] as const

/**
 * What follows a line of a title, an accTitle: line, or an accDescr: line whose
 * last directive has a U+2028 or a U+2029 before it, and whether the directive
 * and the comment move to the next line (docs/treeview.md, Title).
 */
const whatFollowsATitleWithASeparatorBeforeTheDirective = [
  {
    name: "treeview: a U+2028 or U+2029 before the last directive of a title, with nothing or an empty line after it",
    follows: ["", "\n"],
    moved: true,
  },
  {
    name: "treeview: a U+2028 or U+2029 before the last directive of a title, with a comment line after it",
    follows: ["%% z\n"],
    moved: true,
  },
  {
    name: "treeview: a U+2028 or U+2029 before the last directive of a title, with a statement after it, directly or after an empty line or a comment line",
    follows: ["R\n", "\nR\n", "%% z\nR\n", "%% z\n\nR\n"],
    moved: false,
  },
  {
    name: "treeview: a U+2028 or U+2029 before the last directive of a title, with a line of spaces or a line of a directive after it",
    follows: [
      "   \n",
      "   \nR\n",
      "%%{y}%%\n",
      "%%{y}%%\nR\n",
      " %%{y}%%\n",
      " %%{y}%%\nR\n",
    ],
    moved: false,
  },
] as const

describe("the whitespace before the last directive of a title and of an accessibility line, by what follows the directive", () => {
  it.each(whitespaceBeforeTheLastDirectiveRows.map((row) => [row.name, row]))(
    "%s",
    async (_name, row) => {
      const forms = [row.tab, row.like, row.separator, row.nel]
      for (const keyword of keywordsOfTheTitleLines) {
        for (const [index, characters] of whitespaceColumns.entries()) {
          const printed = forms[index]
          if (printed === null || printed === undefined) continue
          for (const character of characters) {
            const next =
              index === 2 && row.separatorStartsALine === true ? "R" : "  R"
            await expectDirectiveRowKept(
              `treeView-beta\n${keyword} ${row.written.replace("{w}", character)}\nR\n`,
              `treeView-beta\n  ${keyword} ${printedBeforeTheLastDirective(row.written.replace("{w}", character), printed, character)}\n${next}\n`,
            )
          }
        }
      }
    },
  )

  it("treeview: the whitespace around a last directive that holds a line break or a semicolon, with nothing or a mark that touches it after it", async () => {
    for (const directive of lineBreakOrSemicolonDirectives) {
      for (const row of [0, 3, 5].map(
        (index) => whitespaceBeforeTheLastDirectiveRows[index],
      )) {
        if (row === undefined) continue
        const forms = [row.tab, row.like, row.separator, row.nel]
        for (const keyword of keywordsOfTheTitleLines) {
          for (const [index, characters] of whitespaceColumns.entries()) {
            const printed = forms[index]
            if (printed === null || printed === undefined) continue
            for (const character of characters.slice(0, 2)) {
              const line = row.written
                .replace("{w}", character)
                .replace("%%{x}%%", directive)
              const printedLine = printedBeforeTheLastDirective(
                line,
                printed.replace("%%{x}%%", directive),
                character,
              )
              const next =
                index === 2 && row.separatorStartsALine === true ? "R" : "  R"
              await expectDirectiveRowKept(
                `treeView-beta\n${keyword} ${line}\nR\n`,
                `treeView-beta\n  ${keyword} ${printedLine}\n${next}\n`,
              )
            }
          }
        }
      }
    }
  })

  it("treeview: the whitespace around a last directive that holds a line break or a semicolon, with spaces or a tab after it, or a mark after a space", async () => {
    for (const directive of lineBreakOrSemicolonDirectives) {
      for (const keyword of keywordsOfTheTitleLines) {
        for (const before of ["", "  ", "\t", "\u00a0", "\u2028", "\u0085"]) {
          for (const after of ["  ", "\t", " %% c", " %%{y}%%"]) {
            const line = `T${before}${directive}${after}`
            const next = before === "\u2028" && after === " %% c" ? "R" : "  R"
            await expectDirectiveRowKept(
              `treeView-beta\n${keyword} ${line}\nR\n`,
              `treeView-beta\n  ${keyword} ${line}\n${next}\n`,
            )
          }
        }
      }
    }
  })

  it("treeview: a run of whitespace before the last directive follows the column of its characters", async () => {
    await expectRunsOfOneColumn(true)
  })

  it("treeview: a run of whitespace before the last directive follows the column of its characters where the line is the last statement of the text", async () => {
    await expectRunsOfOneColumn(false)
  })

  it("treeview: a run that holds a tab and other whitespace before the last directive", async () => {
    await expectRunsOfATabAndAnotherColumn(true)
  })

  it("treeview: a run that holds a tab and other whitespace before the last directive where the line is the last statement of the text", async () => {
    await expectRunsOfATabAndAnotherColumn(false)
  })

  it.each(
    whatFollowsATitleWithASeparatorBeforeTheDirective.map(
      (row) => [row.name, row] as const,
    ),
  )("%s", async (_name, row) => {
    for (const keyword of keywordsOfTheTitleLines) {
      for (const character of ["\u2028", "\u2029"]) {
        // With a separator on both sides of the directive, the forms that move
        // are given (docs/treeview.md, Title).
        for (const [text, moved] of [
          [`T${character}%%{x}%%%% c`, "T\n%%{x}%%%% c\n"],
          ...(row.moved
            ? [
                [
                  `T${character}%%{x}%%${character}%% c`,
                  "T\n%%{x}%%\n  %% c\n",
                ] as const,
              ]
            : []),
        ] as const) {
          for (const follow of row.follows) {
            await expectTitleLineWithSeparators(
              `treeView-beta\n${keyword} ${text}\n${follow}`,
              `treeView-beta\n  ${keyword} ${row.moved ? moved : `${text}\n`}`,
            )
          }
        }
      }
    }
  })

  it("treeview: a U+2028 or U+2029 and a U+0085 around the last directive of a title, with the text ending", async () => {
    for (const keyword of keywordsOfTheTitleLines) {
      for (const [before, between, start] of separatorsAroundTheLastDirective) {
        for (const follow of ["", "\n", "%% z\n"]) {
          await expectTitleLineWithSeparators(
            `treeView-beta\n${keyword} T${before}%%{x}%%${between}%% c\n${follow}`,
            `treeView-beta\n  ${keyword} ${start}`,
          )
        }
      }
    }
  })

  it("treeview: a run between the last directive and a comment", async () => {
    await expectRunsBetweenTheLastDirectiveAndAComment(true)
  })

  it("treeview: a run between the last directive and a comment where the line is the last statement of the text", async () => {
    await expectRunsBetweenTheLastDirectiveAndAComment(false)
  })

  it("treeview: the whitespace before the last directive where the line is the last statement of the text", async () => {
    for (const row of whitespaceBeforeTheLastDirectiveRows) {
      const forms = [
        row.tab,
        row.like,
        row.separatorAtTheEnd ?? row.separator,
        row.nel,
      ]
      for (const keyword of keywordsOfTheTitleLines) {
        for (const [index, characters] of whitespaceColumns.entries()) {
          const printed = forms[index]
          if (printed === null || printed === undefined) continue
          for (const character of characters) {
            await expectDirectiveRowKept(
              `treeView-beta\n${keyword} ${row.written.replace("{w}", character)}\n`,
              `treeView-beta\n  ${keyword} ${printedBeforeTheLastDirective(row.written.replace("{w}", character), printed, character)}\n`,
            )
          }
        }
      }
    }
  })
})
