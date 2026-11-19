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
