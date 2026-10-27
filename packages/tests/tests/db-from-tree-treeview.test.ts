import { describe, expect, it } from "vitest"
import { nodesOf } from "../src/check-tree/walk.ts"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  loadFixtures,
} from "../src/index.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import type { Kit } from "./check-tree-built.ts"
import { withBefore, withChildren } from "./nesting-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { frontmatterOf, tokenOf } from "./check-tree-trees.ts"
import {
  annotation,
  buildTreeview,
  common,
  decoration,
  prefix,
  row,
} from "./treeview-built.ts"

/** A fixed accepted tree, checked before interpreting its Db fields. */
function summary(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  embedded: EmbeddedValues = {
    config: { securityLevel: "strict" },
    title: undefined,
    dataBlockEffects: [],
  },
) {
  const built = buildTreeview(source, make)
  expect(checkTree(source, built.tree)).toEqual([])
  for (const node of nodesOf(built.tree).filter(
    (candidate) => candidate.type === "TreeviewNode",
  ))
    Object.defineProperty(node, "indent", {
      get() {
        throw new Error("read indent")
      },
    })
  return dbFromTree(
    source,
    built.tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("treeview Db from hand-built trees", () => {
  it("publishes an empty forest without the artificial root or diagram title", () => {
    expect(
      summary(
        "treeView-beta\ntitle Hidden",
        (kit) => [common(kit, "Title", "Hidden")],
        { config: {}, title: "Embedded", dataBlockEffects: [] },
      ),
    ).toEqual({ accTitle: "", accDescr: "", nodes: [] })
  })

  it("projects nested file parents, siblings and duplicate names", () => {
    expect(
      summary(
        'treeView-beta\n  file\n\t\t\tchild/\n    "same"\n    "same"\n   sibling\n end//\n""',
        (kit) => [
          withChildren(kit, row(kit, 2, "file"), [
            withChildren(kit, row(kit, 3, "child/"), [
              row(kit, 4, '"same"'),
              row(kit, 4, '"same"'),
            ]),
            row(kit, 3, "sibling"),
          ]),
          row(kit, 1, "end//"),
          row(kit, 0, '""'),
        ],
      ).nodes,
    ).toEqual([
      {
        name: "file",
        nodeType: "file",
        children: [
          {
            name: "child",
            nodeType: "directory",
            children: [
              { name: "same", nodeType: "file", children: [] },
              { name: "same", nodeType: "file", children: [] },
            ],
          },
          { name: "sibling", nodeType: "file", children: [] },
        ],
      },
      { name: "end/", nodeType: "directory", children: [] },
      { name: "", nodeType: "file", children: [] },
    ])
  })

  it("trims only bare ASCII tails, preserving quoted padding, slashes and literal escapes", () => {
    expect(
      summary("treeView-beta\nbare/ \t\n\"quoted/ \"\n'a\\n\r\nb'", (kit) => [
        row(kit, 0, "bare/ \t"),
        row(kit, 0, '"quoted/ "'),
        row(kit, 0, "'a\\n\r\nb'"),
      ]).nodes,
    ).toEqual([
      { name: "bare", nodeType: "directory", children: [] },
      { name: "quoted/ ", nodeType: "file", children: [] },
      { name: "a\\n\nb", nodeType: "file", children: [] },
    ])
  })

  it("keeps final annotation assignments, omitting cleared descriptions and missing icons", () => {
    const result = summary(
      "treeView-beta\nnode :::first icon(file) :::last icon() ## old\n ##\nother ##  detail  ",
      (kit) => [
        row(kit, 0, "node", () => [
          annotation(kit, "Class", "first"),
          annotation(kit, "Icon", "file"),
          annotation(kit, "Class", "last"),
          annotation(kit, "Icon", null),
          annotation(kit, "Description", " old"),
          annotation(kit, "Description", null),
        ]),
        row(kit, 0, "other", () => [
          annotation(kit, "Description", "  detail  "),
        ]),
      ],
    )
    expect(result.nodes).toEqual([
      {
        name: "node",
        nodeType: "file",
        cssClass: "last",
        icon: "none",
        children: [],
      },
      { name: "other", nodeType: "file", description: "detail", children: [] },
    ])
  })

  it("uses final common assignments and normalizes full authored block padding", () => {
    expect(
      summary(
        "treeView-beta\naccTitle: A  B\naccDescr: old\naccDescr { A\n\n  B }\naccTitle:",
        (kit) => [
          common(kit, "AccTitle", " A  B"),
          common(kit, "AccDescr", " old"),
          common(kit, "AccDescrBlock", " A\n\n  B "),
          common(kit, "AccTitle", null),
        ],
      ),
    ).toEqual({ accTitle: "", accDescr: "A\nB", nodes: [] })
  })

  it("reads prefix depth and enclosed decoration without changing authored leaves", () => {
    expect(
      summary('treeView-beta\nroot/\n├── "a\n│\nb"\n│\n└── child', (kit) => [
        withChildren(kit, row(kit, 0, "root/"), [
          row(kit, 4, '"a\n│\nb"', undefined, prefix(kit, "├──")),
          (() => {
            const before = decoration(kit)
            return withBefore(
              kit,
              row(kit, 4, "child", undefined, prefix(kit, "└──", "└")),
              "textBefore",
              [before],
            )
          })(),
        ]),
      ]).nodes,
    ).toEqual([
      {
        name: "root",
        nodeType: "directory",
        children: [
          { name: "a\nb", nodeType: "file", children: [] },
          { name: "child", nodeType: "file", children: [] },
        ],
      },
    ])
  })

  it("reads a branch inside an open quoted leaf as indentation and expands branch-line tabs", () => {
    expect(
      summary('treeView-beta\n"a\n└── b\t c"', (kit) => [
        row(kit, 0, '"a\n└── b\t c"'),
      ]).nodes,
    ).toEqual([{ name: "a\n    b     c", nodeType: "file", children: [] }])
  })

  it("uses the site sanitizer only on accessibility and description text", async () => {
    const fixture = (await loadFixtures("treeview")).find(
      (entry) => entry.name === "config-security-level-other",
    )!
    const embedded = embeddedValuesOf(fixture, fixture.expected)!
    const built = buildTreeview(fixture.input, (kit) => [
      common(kit, "AccTitle", " <b>A</b>"),
      common(kit, "AccDescr", " <b>D</b>"),
      row(kit, 0, "node", () => [
        annotation(kit, "Description", " a<b>=c<BR>d"),
      ]),
    ])
    expect(checkTree(fixture.input, built.tree)).toEqual([])
    expect(
      dbFromTree(
        fixture.input,
        built.tree as unknown as DbTreeRoot,
        embedded,
        cssSupportsColor,
      ),
    ).toEqual(fixture.expected.accepted ? fixture.expected.db : null)
  })

  it("uses the shared specified reading for the frontmatter HTML value difference", async () => {
    const fixture = (await loadFixtures("treeview")).find(
      (entry) => entry.name === "div-html-frontmatter-value",
    )!
    const result = fixture.specified!
    expect(result.accepted).toBe(true)
    const built = buildTreeview(fixture.input, (kit) => [
      row(kit, 0, 'b="c">d'),
    ])
    const end = fixture.input.indexOf("\n---", 4) + 4
    setField(
      built.tree,
      "frontmatter",
      frontmatterOf(fixture.input, fixture.input.slice(0, end), [4, end - 4]),
    )
    setField(built.tree, "tokens", [
      tokenOf(fixture.input, "Punctuator", { text: "---", from: 0 }),
      tokenOf(fixture.input, "RawText", { text: "title: <a" }),
      tokenOf(fixture.input, "Punctuator", { text: "---", from: end - 3 }),
      ...built.tree.tokens,
    ])
    expect(checkTree(fixture.input, built.tree)).toEqual([])
    expect(
      dbFromTree(
        fixture.input,
        built.tree as unknown as DbTreeRoot,
        embeddedValuesOf(fixture, result)!,
        cssSupportsColor,
      ),
    ).toEqual(result.accepted ? result.db : null)
    expect(result.accepted ? result.db : null).not.toEqual(
      fixture.expected.accepted ? fixture.expected.db : null,
    )
  })
})
