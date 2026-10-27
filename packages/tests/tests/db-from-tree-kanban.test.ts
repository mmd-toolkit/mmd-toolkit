import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import { embeddedValuesOf, loadFixtures } from "../src/index.ts"
import { cssSupportsColor } from "../src/normalizers/browser-stand-ins.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { locationOf } from "./check-tree-trees.ts"

/** An explicitly specified row, with written leaf values, never inferred from its expected Db. */
interface Row {
  readonly indent: number
  readonly id: string | null
  readonly shape?: readonly [
    opener: string,
    raw: string,
    kind: "text" | "string" | "markdown",
    closer: string,
  ]
  readonly data?: readonly string[]
  readonly decorations?: readonly [kind: "icon" | "class", text: string][]
}
interface Case {
  readonly fixture: string
  readonly rows: readonly Row[]
  /** Explicit column occurrences; every remaining row is a card of the last one. */
  readonly columns?: readonly number[]
  /** Written values after the cuts, supplied explicitly for the case. */
  readonly values?: Readonly<Record<string, string>>
}

/** A fixed bare row, or one with a square text label. */
function r(indent: number, id: string | null, label?: string): Row {
  return {
    indent,
    id,
    ...(label === undefined
      ? {}
      : { shape: ["[", label, "text", "]"] as const }),
  }
}

const CASES: readonly Case[] = [
  { fixture: "db-shape-square", rows: [r(1, "S", "Todo"), r(3, "A", "Work")] },
  {
    fixture: "db-shape-round",
    rows: [
      { indent: 1, id: "S", shape: ["(", "Todo", "text", ")"] },
      { indent: 3, id: "A", shape: ["(", "Work", "text", ")"] },
    ],
  },
  {
    fixture: "db-shape-circle",
    rows: [
      { indent: 1, id: "S", shape: ["((", "Todo", "text", "))"] },
      { indent: 3, id: "A", shape: ["((", "Work", "text", "))"] },
    ],
  },
  {
    fixture: "db-shape-hexagon",
    rows: [
      { indent: 1, id: "S", shape: ["{{", "Todo", "text", "}}"] },
      { indent: 3, id: "A", shape: ["{{", "Work", "text", "}}"] },
    ],
  },
  {
    fixture: "db-shape-cloud",
    rows: [
      { indent: 1, id: "S", shape: [")", "Todo", "text", "("] },
      { indent: 3, id: "A", shape: [")", "Work", "text", "("] },
    ],
  },
  {
    fixture: "db-shape-bang",
    rows: [
      { indent: 1, id: "S", shape: ["))", "Todo", "text", "(("] },
      { indent: 3, id: "A", shape: ["))", "Work", "text", "(("] },
    ],
  },
  {
    fixture: "db-shape-cloud-alt",
    rows: [
      { indent: 1, id: "S", shape: ["(-", "Todo-", "text", ")"] },
      { indent: 3, id: "A", shape: ["(-", "Work-", "text", ")"] },
    ],
  },
  {
    fixture: "db-shape-bang-alt",
    rows: [
      { indent: 1, id: "S-", shape: [")", "Todo", "text", "(-"] },
      { indent: 3, id: "A-", shape: [")", "Work", "text", "(-"] },
    ],
  },
  {
    fixture: "db-grid-entity-item-id",
    rows: [r(1, "S"), r(3, "a#35;b", "Item")],
  },
  {
    fixture: "db-grid-entity-named-item-id",
    rows: [r(1, "S"), r(3, "a#amp;b", "Item")],
  },
  {
    fixture: "db-grid-html-attribute-item-id",
    rows: [r(1, "S"), r(3, 'a<a href="x">b', "Item")],
  },
  {
    fixture: "db-grid-entity-item-icon",
    rows: [r(1, "S"), { ...r(3, "I"), decorations: [["icon", "a#35;b"]] }],
  },
  {
    fixture: "db-grid-html-attribute-item-icon",
    rows: [
      r(1, "S"),
      { ...r(3, "I"), decorations: [["icon", 'a<a href="x">b']] },
    ],
  },
  {
    fixture: "db-grid-crlf-item-icon",
    rows: [r(1, "S"), { ...r(3, "I"), decorations: [["icon", "a\r\nb"]] }],
  },
  {
    fixture: "db-grid-entity-item-label-markdown",
    rows: [
      r(1, "S"),
      { indent: 3, id: "I", shape: ["[", '"`a#35;b`"', "markdown", "]"] },
    ],
  },
  {
    fixture: "db-grid-directive-item-icon",
    rows: [
      r(1, "S"),
      { ...r(3, "I"), decorations: [["icon", "a%%{init: {}}%%b"]] },
    ],
    values: { "a%%{init: {}}%%b": "ab" },
  },
  {
    fixture: "db-grid-directive-item-id",
    rows: [r(1, "S"), r(3, "a%%{init: {}}%%b", "Item")],
    values: { "a%%{init: {}}%%b": "ab" },
  },
  { fixture: "lex-indent-directive", rows: [r(1, "S"), r(3, "A")] },
  {
    fixture: "lex-label-directive-line",
    rows: [
      r(1, "S"),
      {
        indent: 3,
        id: "A",
        shape: ["[", '"a\n%%{init: {}}%%\nb"', "string", "]"],
      },
    ],
    values: { '"a\n%%{init: {}}%%\nb"': "a\n\nb" },
  },
  {
    fixture: "db-decoration-class-twice",
    rows: [
      r(1, "S"),
      {
        ...r(3, "A"),
        decorations: [
          ["class", "first"],
          ["class", "second"],
        ],
      },
    ],
  },
  {
    fixture: "db-metadata-priority-list",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" priority: [a, b] "] }],
  },
  {
    fixture: "db-metadata-priority-null",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" priority: null "] }],
  },
  { fixture: "header-only-lf", rows: [] },
  { fixture: "db-empty-board-comment", rows: [] },
  {
    fixture: "db-sections-items",
    columns: [0, 3],
    rows: [
      r(1, "S", "Todo"),
      r(3, "A", "First"),
      r(3, "B", "Second"),
      r(1, "T", "Done"),
      r(3, "C", "Third"),
    ],
  },
  { fixture: "db-name-no-id", rows: [r(1, null, "Todo"), r(3, null, "Work")] },
  {
    fixture: "db-name-space-before-shape",
    rows: [r(1, "S ", "Todo"), r(3, "A ", "Work")],
  },
  { fixture: "db-name-trailing-space", rows: [r(1, "S  "), r(3, "A  ")] },
  {
    fixture: "db-name-two-words",
    rows: [r(1, "In progress"), r(3, "Work item")],
  },
  {
    fixture: "db-markdown-label",
    rows: [
      { indent: 1, id: "S", shape: ["[", '"`**Todo**`"', "markdown", "]"] },
      { indent: 3, id: "A", shape: ["[", '"`*Work*`"', "markdown", "]"] },
    ],
  },
  {
    fixture: "db-label-multiline",
    rows: [
      r(1, "S", "First\nsecond"),
      { indent: 3, id: "A", shape: ["[", '"Line\nnext"', "string", "]"] },
    ],
  },
  {
    fixture: "db-spaces-label",
    rows: [{ indent: 1, id: "S", shape: ["[", '" "', "string", "]"] }],
  },
  { fixture: "db-indent-tabs", rows: [r(1, "S"), r(2, "A"), r(2, "T")] },
  {
    fixture: "db-indent-unindented",
    columns: [0, 2],
    rows: [r(0, "S"), r(1, "A"), r(0, "T"), r(1, "B")],
  },
  {
    fixture: "db-indent-deeper",
    rows: [r(1, "S"), r(3, "A"), r(5, "B"), r(3, "C")],
  },
  { fixture: "db-indent-shallower-last", rows: [r(4, "S"), r(2, "A")] },
  {
    fixture: "db-section-three-definitions",
    columns: [0, 2, 4, 6],
    rows: [
      r(1, "S", "First"),
      r(3, "A", "One"),
      r(1, "T", "Other"),
      r(3, "B", "Two"),
      r(1, "S", "Second"),
      r(3, "C", "Three"),
      r(1, "S", "Third"),
      r(3, "D", "Four"),
    ],
  },
  {
    fixture: "db-item-three-definitions",
    columns: [0, 2],
    rows: [
      r(1, "S"),
      r(3, "A", "First"),
      r(1, "T"),
      r(3, "A", "Second"),
      r(3, "B", "Partner"),
      r(3, "A", "Third"),
    ],
  },
  {
    fixture: "db-section-item-same-id",
    columns: [0, 2],
    rows: [r(1, "S"), r(3, "S", "Item"), r(1, "T"), r(3, "S", "Other item")],
  },
  {
    fixture: "db-metadata-repeated-id",
    rows: [
      r(1, "S"),
      { ...r(3, "A"), data: ["assigned: Ada"] },
      { ...r(3, "A"), data: ["ticket: TASK-1"] },
    ],
  },
  { fixture: "db-name-case", rows: [r(1, "S"), r(3, "a"), r(3, "A")] },
  {
    fixture: "db-object-prototype-ids",
    columns: [0, 3],
    rows: [
      r(1, "__proto__"),
      r(3, "constructor"),
      r(3, "toString"),
      r(1, "hasOwnProperty"),
      r(3, "__proto__"),
    ],
  },
  {
    fixture: "db-metadata-all",
    rows: [
      {
        ...r(1, "S", "Todo"),
        data: ["ticket: COL-1, assigned: Ada, priority: High, icon: star"],
      },
      {
        ...r(3, "A", "Work"),
        data: [
          "label: Changed, assigned: Ada, ticket: TASK-1, priority: High, icon: star",
        ],
      },
    ],
  },
  {
    fixture: "db-metadata-section-ticket",
    rows: [{ ...r(1, "S"), data: [" ticket: High "] }, r(3, "A")],
  },
  {
    fixture: "db-metadata-section-label",
    rows: [{ ...r(1, "S"), data: [" label: High "] }, r(3, "A")],
  },
  {
    fixture: "db-metadata-section-assigned",
    rows: [{ ...r(1, "S"), data: [" assigned: High "] }, r(3, "A")],
  },
  {
    fixture: "db-metadata-section-priority",
    rows: [{ ...r(1, "S"), data: [" priority: High "] }, r(3, "A")],
  },
  {
    fixture: "db-metadata-section-icon",
    rows: [{ ...r(1, "S"), data: [" icon: High "] }, r(3, "A")],
  },
  {
    fixture: "db-metadata-ticket-number",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" ticket: 23 "] }],
  },
  {
    fixture: "db-metadata-assigned-list",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" assigned: [a, b] "] }],
  },
  {
    fixture: "db-metadata-icon-true",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" icon: true "] }],
  },
  {
    fixture: "db-metadata-priority-non-finite",
    rows: [
      r(1, "S"),
      { ...r(3, "A"), data: ["priority: .inf"] },
      { ...r(3, "B"), data: ["priority: -.inf"] },
      { ...r(3, "C"), data: ["priority: .nan"] },
    ],
  },
  {
    fixture: "db-metadata-priority-nested-non-finite",
    rows: [
      r(1, "S"),
      { ...r(3, "A"), data: ["\npriority:\n  - .inf\n  - .nan\n  - -.inf\n"] },
    ],
  },
  {
    fixture: "db-metadata-priority-own-prototype-key",
    rows: [
      r(1, "S"),
      {
        ...r(3, "A"),
        data: ["\npriority:\n  __proto__: .nan\n  constructor: .inf\n"],
      },
    ],
  },
  {
    fixture: "db-metadata-label-list",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" label: [a, b] "] }],
  },
  {
    fixture: "db-metadata-label-false",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" label: false "] }],
  },
  {
    fixture: "db-metadata-label-zero",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" label: 0 "] }],
  },
  {
    fixture: "db-metadata-label-null",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" label: null "] }],
  },
  {
    fixture: "db-metadata-label-empty-string",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" label: '' "] }],
  },
  {
    fixture: "db-metadata-priority-zero",
    rows: [r(1, "S"), { ...r(3, "A", "Work"), data: [" priority: 0 "] }],
  },
  {
    fixture: "db-metadata-empty",
    rows: [r(1, "S"), { ...r(3, "A"), data: [""] }],
  },
  {
    fixture: "db-metadata-unknown-key",
    rows: [r(1, "S"), { ...r(3, "A"), data: [" unknown: value "] }],
  },
  {
    fixture: "db-metadata-shape-lower",
    rows: [r(1, "S"), { ...r(3, "A"), data: ["shape: kanbanitem"] }],
  },
  {
    fixture: "db-metadata-quoted-newline",
    rows: [r(1, "S"), { ...r(3, "A"), data: ['label: "first\n    second"'] }],
  },
  {
    fixture: "db-metadata-adjacent-empty",
    rows: [{ ...r(1, "S"), data: ["", ""] }],
  },
  {
    fixture: "db-metadata-adjacent-comma",
    rows: [{ ...r(1, "S"), data: ["ticket: X,", "assigned: Ada"] }],
  },
  {
    fixture: "db-metadata-two-items",
    rows: [r(1, "S"), { ...r(3, "A"), data: ["ticket: X,", "assigned: Ada"] }],
  },
  {
    fixture: "db-metadata-adjacent-directive",
    rows: [{ ...r(1, "S"), data: ["ticket: X,", "priority: High"] }],
  },
  {
    fixture: "db-decoration-icon-twice",
    rows: [
      r(1, "S"),
      {
        ...r(3, "A"),
        decorations: [
          ["icon", "first"],
          ["icon", "second"],
        ],
      },
    ],
  },
  {
    fixture: "db-decoration-icon-section",
    rows: [{ ...r(1, "S"), decorations: [["icon", "star"]] }],
  },
  {
    fixture: "db-decoration-class-item",
    rows: [r(1, "S"), { ...r(3, "A"), decorations: [["class", "hot cold"]] }],
  },
  {
    fixture: "lex-string-crlf",
    rows: [{ indent: 1, id: "S", shape: ["[", '"a\r\nb"', "string", "]"] }],
  },
  {
    fixture: "lex-cr-quoted-value",
    rows: [
      r(1, "S"),
      { indent: 3, id: "A", shape: ["[", '"a\rb"', "string", "]"] },
    ],
  },
  {
    fixture: "lex-comment-quoted-line",
    rows: [
      r(1, "S"),
      { indent: 3, id: "A", shape: ["[", '"one\n%% c\ntwo"', "string", "]"] },
    ],
    values: { '"one\n%% c\ntwo"': "one\ntwo" },
  },
  {
    fixture: "lex-label-style-rule",
    rows: [
      r(1, "S"),
      { indent: 3, id: "A", shape: ["[", '"astyle:#x;yb"', "string", "]"] },
    ],
    values: { '"astyle:#x;yb"': "astyle:#xyb" },
  },
  {
    fixture: "lex-directive-at-value-start",
    rows: [
      r(1, "S"),
      {
        indent: 3,
        id: "A",
        shape: ["[", '"%%{init: {}}%%Work"', "string", "]"],
      },
    ],
    values: { '"%%{init: {}}%%Work"': "Work" },
  },
  {
    fixture: "db-grid-entity-item-label-quoted",
    rows: [
      r(1, "S"),
      { indent: 3, id: "I", shape: ["[", '"a#35;b"', "string", "]"] },
    ],
  },
  {
    fixture: "db-grid-html-attribute-item-label-quoted",
    rows: [
      r(1, "S"),
      { indent: 3, id: "I", shape: ["[", '"a<a href="x">b"', "string", "]"] },
    ],
  },
  {
    fixture: "db-shape-mismatched",
    rows: [
      { indent: 1, id: "S", shape: ["[", "Todo", "text", ")"] },
      { indent: 3, id: "A", shape: ["[", "Work", "text", ")"] },
    ],
  },
  {
    fixture: "config-security-level-other",
    rows: [
      { indent: 1, id: "S", shape: ["[", '"<b>S</b>"', "string", "]"] },
      {
        indent: 3,
        id: "A",
        shape: ["[", '"<i>A</i><br>"', "string", "]"],
        data: ['ticket: "<u>T</u>"'],
      },
    ],
  },
  { fixture: "header-after-frontmatter", rows: [r(1, "S")] },
  {
    fixture: "db-frontmatter-drawing-config",
    rows: [r(1, "S"), { ...r(3, "A"), data: ["ticket: TASK-1"] }],
  },
  { fixture: "db-title-not-statement", rows: [r(1, "title Board")] },
  {
    fixture: "db-acc-title-not-statement",
    columns: [0, 1],
    rows: [r(1, "accTitle: First"), r(1, "accTitle: Second")],
  },
  { fixture: "db-acc-descr-not-statement", rows: [r(1, "accDescr: First")] },
]

/** Place only the pieces supplied above; values that contain cuts are explicitly specified. */
function treeOf(input: string, testCase: Case): DbTreeRoot {
  let cursor = input.indexOf("kanban") + "kanban".length

  /** The next occurrence of a piece explicitly named by the case. */
  function take(piece: string): TreeRange {
    const start = input.indexOf(piece, cursor)
    if (start < 0)
      throw new Error(`no ${JSON.stringify(piece)} after ${cursor}`)
    cursor = start + piece.length
    return [start, cursor]
  }

  /** A plain JSON node. */
  function node(
    type: string,
    range: TreeRange,
    fields: Record<string, unknown> = {},
  ): CheckedNode {
    return { type, range, loc: locationOf(input, range), ...fields }
  }

  /** A leaf placed at its explicitly written text. */
  function literal(value: string): CheckedNode {
    return node("KanbanLiteral", take(value), {
      value: testCase.values?.[value] ?? value,
    })
  }

  const occurrences = testCase.rows.map((row) => {
    const id = row.id === null ? null : literal(row.id)
    let shape: CheckedNode | null = null
    if (row.shape !== undefined) {
      const [opener, raw, kind, closer] = row.shape
      const start = take(opener)[0]
      const range = take(raw)
      const width = kind === "text" ? 0 : kind === "string" ? 1 : 2
      const value =
        testCase.values?.[raw] ?? (width === 0 ? raw : raw.slice(width, -width))
      const label = node("KanbanLabel", range, { kind, value })
      take(closer)
      shape = node("KanbanShape", [start, cursor], { opener, closer, label })
    }
    const data = (row.data ?? []).map((value) => {
      const start = take("@{")[0]
      // Empty interiors are real nodes; do not search for an empty token.
      if (value !== "") take(value)
      take("}")
      return node("KanbanDataBlock", [start, cursor], { value })
    })
    const decorations = (row.decorations ?? []).map(([kind, value]) => {
      const start = take(kind === "icon" ? "::icon(" : ":::")[0]
      const text = literal(value)
      if (kind === "icon") take(")")
      return node(
        kind === "icon" ? "KanbanIconStatement" : "KanbanClassStatement",
        [start, cursor],
        { [kind === "icon" ? "icon" : "cssClass"]: text },
      )
    })
    const first = id ?? shape
    if (first === null) throw new Error("no text or shape")
    return node("KanbanNode", [first.range[0], cursor], {
      indent: row.indent,
      id,
      shape,
      data,
      decorations,
      children: [],
    })
  })
  const body: CheckedNode[] = []
  for (const [index, occurrence] of occurrences.entries()) {
    if ((testCase.columns ?? [0]).includes(index)) body.push(occurrence)
    else {
      const column = body.at(-1)
      if (column === undefined)
        throw new Error("a hand-built card has no column")
      ;(column.children as CheckedNode[]).push(occurrence)
      Object.assign(column, {
        range: [column.range[0], occurrence.range[1]],
        loc: locationOf(input, [column.range[0], occurrence.range[1]]),
      })
    }
  }
  return node("Root", [0, input.length], {
    diagramType: "kanban",
    body: node("KanbanDiagram", [input.indexOf("kanban"), cursor], { body }),
    frontmatter: null,
    comments: [],
    directives: [],
    tokens: [],
  }) as unknown as DbTreeRoot
}

describe("dbFromTree of kanban trees made by hand", async () => {
  const fixtures = await loadFixtures("kanban")
  it("requires one matching embedded effect for an adjacent suffix", () => {
    const name = "db-metadata-two-items"
    const testCase = CASES.find((entry) => entry.fixture === name)
    const fixture = fixtures.find((entry) => entry.name === name)
    if (
      testCase === undefined ||
      fixture === undefined ||
      !fixture.expected.accepted
    )
      throw new Error("no adjacent suffix case")
    const embedded = embeddedValuesOf(fixture, fixture.expected)
    if (embedded === undefined) throw new Error("no embedded values")
    const tree = treeOf(fixture.input, testCase)
    expect(() =>
      dbFromTree(
        fixture.input,
        tree,
        { ...embedded, dataBlockEffects: [] },
        cssSupportsColor,
      ),
    ).toThrow("no recorded effect")
    expect(() =>
      dbFromTree(
        fixture.input,
        tree,
        { ...embedded, dataBlockEffects: [{ id: "wrong", set: {} }] },
        cssSupportsColor,
      ),
    ).toThrow('names "wrong", not "A"')
    expect(() =>
      dbFromTree(
        fixture.input,
        tree,
        {
          ...embedded,
          dataBlockEffects: [
            ...embedded.dataBlockEffects,
            ...embedded.dataBlockEffects,
          ],
        },
        cssSupportsColor,
      ),
    ).toThrow("no tree suffix")
  })
  for (const testCase of CASES)
    it(`builds the recorded Db of ${testCase.fixture}`, () => {
      const fixture = fixtures.find((entry) => entry.name === testCase.fixture)
      if (fixture === undefined || !fixture.expected.accepted)
        throw new Error(`no accepted fixture ${testCase.fixture}`)
      const embedded = embeddedValuesOf(fixture, fixture.expected)
      if (embedded === undefined) throw new Error("no embedded values")
      const tree = treeOf(fixture.input, testCase)
      const plain = JSON.parse(JSON.stringify(tree)) as DbTreeRoot
      for (const node of nodesOf(tree as unknown as CheckedRoot).filter(
        (candidate) => candidate.type === "KanbanNode",
      ))
        Object.defineProperty(node, "indent", {
          get() {
            throw new Error("read indent")
          },
        })
      expect(
        dbFromTree(fixture.input, tree, embedded, cssSupportsColor),
      ).toEqual(fixture.expected.db)
      // The same fixed fixture text, with reads confined to value ranges and
      // token access forbidden. A JSON round-trip excludes identity-based state.
      Object.defineProperty(plain, "tokens", {
        get() {
          throw new Error("read tokens")
        },
      })
      const ranges = nodesOf(plain as unknown as CheckedRoot)
        .filter(
          (node) =>
            node.type === "KanbanLiteral" || node.type === "KanbanLabel",
        )
        .map((node) => node.range)
      const bounded = new Proxy(
        {},
        {
          get(_target, key) {
            // HTML tag context is source-wide; value slices stay in their nodes.
            if (key === "indexOf")
              return fixture.input.indexOf.bind(fixture.input)
            if (key === "charCodeAt")
              return fixture.input.charCodeAt.bind(fixture.input)
            if (key !== "slice")
              throw new Error(`source read through ${String(key)}`)
            return (from: number, to: number) => {
              expect(ranges).toContainEqual([from, to])
              return fixture.input.slice(from, to)
            }
          },
        },
      ) as string
      expect(dbFromTree(bounded, plain, embedded, cssSupportsColor)).toEqual(
        fixture.expected.db,
      )
    })
})
