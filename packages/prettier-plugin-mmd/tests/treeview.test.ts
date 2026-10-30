/** Escaped treeview Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import { parse, traverseNodes } from "@mmd-toolkit/parser"
import { createSource } from "../src/printers/source.ts"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  describeFrontmatterChange,
  treeProblemsOfText,
  writtenEmbeddedTexts,
  writtenTextKeptUpToSemicolons,
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
    expect(writtenTextKeptUpToSemicolons(before, after)).toBe(true)
    expect(treeProblemsOfText(before)).toEqual([])
    expect(treeProblemsOfText(after)).toEqual([])
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
