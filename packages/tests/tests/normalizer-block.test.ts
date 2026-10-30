import { describe, expect, it } from "vitest"
import { runMermaid } from "../src/mermaid.ts"
import { normalizeBlock } from "../src/normalizers/block.ts"
import type { MermaidConfig } from "../src/types.ts"

/** Returns the summary mermaid gives `text` with `config`. */
async function summary(
  text: string,
  config: MermaidConfig = {},
): Promise<Record<string, unknown>> {
  const outcome = await runMermaid(text, { config })
  if (!outcome.accepted || !outcome.db) throw new Error("expected a Db")
  return outcome.db
}

/** The root block of the summary of `text`. */
async function rootOf(text: string): Promise<Record<string, unknown>> {
  return (await summary(text)).root as Record<string, unknown>
}

/**
 * A diagram with every kind of value the summary keeps: the columns of the
 * root and of a composite, a node with a shape and a width, a block arrow, a
 * `space`, an edge with a label and one without, a class that is defined and
 * applied, and a style.
 */
const KEPT_FIELDS = `block-beta
  columns 3
  A["Alpha"]:2 B
  C<["Arrow"]>(right, down)
  space:2
  block:G["Group"]:2
    columns 2
    D E
  end
  A -- "label" --> B
  C ==> D
  classDef warm fill:#f00,color:#fff
  class A warm
  style B stroke:#333
`

describe("the summary of a block diagram", () => {
  it("keeps the fields of the summary with their values", async () => {
    expect(await summary(KEPT_FIELDS)).toEqual({
      root: {
        type: "composite",
        columns: 3,
        children: [
          {
            id: "A",
            label: "Alpha",
            type: "square",
            widthInColumns: 2,
            classes: ["warm"],
          },
          {
            id: "B",
            label: "B",
            type: "na",
            widthInColumns: 1,
            styles: ["stroke:#333"],
          },
          {
            id: "C",
            label: "Arrow",
            type: "block_arrow",
            directions: ["right", "down"],
            widthInColumns: 1,
          },
          { type: "space", width: 2 },
          { type: "space", width: 2 },
          {
            id: "G",
            label: "Group",
            type: "composite",
            widthInColumns: 2,
            columns: 2,
            children: [
              { id: "D", label: "D", type: "na", widthInColumns: 1 },
              { id: "E", label: "E", type: "na", widthInColumns: 1 },
            ],
          },
        ],
      },
      unplaced: [],
      edges: [
        {
          start: "A",
          end: "B",
          label: "label",
          thickness: "normal",
          pattern: "solid",
          arrowTypeStart: "arrow_open",
          arrowTypeEnd: "arrow_point",
        },
        {
          start: "C",
          end: "D",
          label: "",
          thickness: "thick",
          pattern: "solid",
          arrowTypeStart: "arrow_open",
          arrowTypeEnd: "arrow_point",
        },
      ],
      classes: [{ id: "warm", styles: ["fill:#f00", "color:#fff"] }],
    })
  })

  it("starts each text from an empty Db", async () => {
    await summary(KEPT_FIELDS)
    expect(await summary("block-beta\n  A\n")).toEqual({
      root: {
        type: "composite",
        columns: -1,
        children: [{ id: "A", label: "A", type: "na", widthInColumns: 1 }],
      },
      unplaced: [],
      edges: [],
      classes: [],
    })
  })

  it("starts over after a text that the Db rejected while it was parsed", async () => {
    // The `style` for an id that no statement defined makes the Db throw after
    // `A` was added; the next text must not see it.
    const rejected = await runMermaid(
      "block-beta\n  A\n  style B fill:red\n  classDef c fill:red\n",
    )
    expect(rejected.accepted).toBe(false)
    expect(await summary("block-beta\n  C\n")).toMatchObject({
      root: { children: [{ id: "C" }] },
      classes: [],
    })
  })

  it("leaves out the ids that the Db makes up", async () => {
    // An id that `generateId()` makes holds `-`, which the id of a text cannot.
    const root = await rootOf("block-beta\n  block\n    A\n  end\n  space\n")
    expect(root.children).toEqual([
      {
        label: "",
        type: "composite",
        children: [{ id: "A", label: "A", type: "na", widthInColumns: 1 }],
      },
      { type: "space", width: 1 },
    ])
  })

  it("lists a space as many times as its width, and not at all for the width 0", async () => {
    expect((await rootOf("block-beta\n  space:3\n")).children).toEqual([
      { type: "space", width: 3 },
      { type: "space", width: 3 },
      { type: "space", width: 3 },
    ])
    expect((await rootOf("block-beta\n  space:0 A\n")).children).toEqual([
      { id: "A", label: "A", type: "na", widthInColumns: 1 },
    ])
  })

  it("lists the blocks that no list of children holds in unplaced", async () => {
    // A `class` for an id that no statement has defined yet makes a block that
    // the later definition of the id takes, and that stays out of the diagram.
    expect(
      await summary('block-beta\n  class A c\n  A["lab"]\n  B\n  class X d\n'),
    ).toMatchObject({
      root: { children: [{ id: "B" }] },
      unplaced: [
        { id: "A", label: "lab", type: "square", classes: ["c"] },
        { id: "X", type: "na", classes: ["d"] },
      ],
    })
    // The blocks of a composite whose id the Db already had are held apart.
    expect(
      await summary("block-beta\n  A\n  block:A\n    B\n  end\n"),
    ).toMatchObject({
      root: { children: [{ id: "A", type: "composite" }] },
      unplaced: [{ id: "B", label: "B", type: "na", widthInColumns: 1 }],
    })
  })

  it("lists a block of an unplaced composite in the composite and not again", async () => {
    const db = await summary(
      "block-beta\n  A\n  block:A\n    block:C\n      D\n    end\n  end\n",
    )
    expect(db.unplaced).toEqual([
      {
        id: "C",
        label: "",
        type: "composite",
        widthInColumns: 1,
        children: [{ id: "D", label: "D", type: "na", widthInColumns: 1 }],
      },
    ])
  })

  it("keeps the children of a composite whose type a later shape changed", async () => {
    const root = await rootOf('block-beta\n  block:G\n    A\n  end\n  G["x"]\n')
    expect(root.children).toEqual([
      {
        id: "G",
        label: "x",
        type: "square",
        widthInColumns: 1,
        children: [{ id: "A", label: "A", type: "na", widthInColumns: 1 }],
      },
    ])
  })

  it("keeps the changes that an id `root` makes to the block that holds the diagram", async () => {
    expect(await rootOf('block-beta\n  columns 2\n  root["x"]\n  A\n')).toEqual(
      {
        type: "square",
        label: "x",
        columns: 2,
        children: [{ id: "A", label: "A", type: "na", widthInColumns: 1 }],
      },
    )
    expect(await rootOf("block-beta\n  A\n  class root c\n")).toMatchObject({
      classes: ["c"],
    })
  })

  it("keeps the columns as the Db stores them", async () => {
    expect((await rootOf("block-beta\n  columns 0\n  A\n")).columns).toBe(0)
    expect((await rootOf("block-beta\n  columns auto\n  A\n")).columns).toBe(-1)
    expect((await rootOf("block-beta\n  columns 007\n  A\n")).columns).toBe(7)
    expect(
      (await rootOf(`block-beta\n  columns ${"9".repeat(400)}\n  A\n`)).columns,
    ).toBe("Infinity")
    expect(
      (await rootOf(`block-beta\n  A:${"9".repeat(400)}\n`)).children,
    ).toEqual([{ id: "A", label: "A", type: "na", widthInColumns: "Infinity" }])
  })

  it("keeps a chain of edges as the Db holds it: a block with no fields and an edge with no start", async () => {
    expect(await summary("block-beta\n  A --> B --> C\n")).toMatchObject({
      root: {
        children: [{}, { id: "C", label: "C", type: "na" }],
      },
      edges: [{ end: "C", label: "" }],
    })
  })

  it("drops the fields that the Db spreads into a composite from an edge statement", async () => {
    const root = await rootOf("block-beta\n  block:A --> B\n    C\n  end\n")
    expect(root.children).toEqual([
      {
        label: "",
        type: "composite",
        children: [{ id: "C", label: "C", type: "na", widthInColumns: 1 }],
      },
    ])
  })

  it("keeps the directions as the lexer read them, with the white space that follows a direction", async () => {
    expect(
      (await rootOf('block-beta\n  A<["x"]>(right  ,  down)\n')).children,
    ).toEqual([
      {
        id: "A",
        label: "x",
        type: "block_arrow",
        directions: ["right  ", "down"],
        widthInColumns: 1,
      },
    ])
  })

  it("keeps the styles split at each comma, and the styles of every classDef of an id", async () => {
    const db = await summary(
      "block-beta\n  A\n  style A fill:red , stroke:blue\n  classDef c fill:red\n  classDef c stroke:blue\n",
    )
    expect(db).toMatchObject({
      root: { children: [{ styles: ["fill:red ", " stroke:blue"] }] },
      classes: [{ id: "c", styles: ["fill:red", "stroke:blue"] }],
    })
  })

  it("keeps the names of Object.prototype as ids", async () => {
    const db = await summary(
      "block-beta\n  __proto__\n  constructor\n  classDef __proto__ fill:red\n  class constructor __proto__\n",
    )
    expect(db).toMatchObject({
      root: {
        children: [
          { id: "__proto__" },
          { id: "constructor", classes: ["__proto__"] },
        ],
      },
      classes: [{ id: "__proto__", styles: ["fill:red"] }],
    })
  })

  it("has the fields it keeps and none that it drops", async () => {
    const db = await summary(KEPT_FIELDS)
    expect(Object.keys(db)).toEqual(["root", "unplaced", "edges", "classes"])
    const text = JSON.stringify(db)
    expect(text).not.toContain("colorIndex")
    expect(text).not.toContain("textStyles")
    expect(text).not.toContain('"type":"edge"')
    for (const edge of db.edges as object[]) {
      expect(Object.keys(edge)).not.toContain("id")
    }
  })

  it("does not change with the settings of the chart or the theme", async () => {
    const settings = {
      theme: "dark",
      look: "neo",
      block: { padding: 40, useMaxWidth: false },
    }
    expect(await summary(KEPT_FIELDS, settings)).toEqual(
      await summary(KEPT_FIELDS),
    )
  })

  it("records the labels with the characters replaced under a securityLevel that is no value of mermaid.js", async () => {
    const text =
      'block-beta\n  A["<b>T</b>"]\n  A -- "<i>e</i>" --> B\n  block:G["<u>g</u>"]\n    C\n  end\n  classDef c fill:<b>\n'
    expect(await summary(text, { securityLevel: "other" })).toMatchObject({
      root: {
        children: [
          { id: "A", label: "&lt;b&gt;T&lt;/b&gt;" },
          { id: "B" },
          { id: "G", label: "&lt;u&gt;g&lt;/u&gt;" },
        ],
      },
      edges: [{ label: "&lt;i&gt;e&lt;/i&gt;" }],
      classes: [{ id: "c", styles: ["fill:<b>"] }],
    })
    expect(await summary(text, { securityLevel: "loose" })).toMatchObject({
      root: {
        children: [{ id: "A", label: "<b>T</b>" }, { id: "B" }, { id: "G" }],
      },
    })
  })

  it("refuses a Db that the patch was not applied to", () => {
    expect(() => normalizeBlock({})).toThrow(TypeError)
  })
})
