import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  XYCHART_CHILD_TYPES,
  XYCHART_ORIENTATIONS,
  XYCHART_PLOT_KINDS,
} from "../src/check-tree/xychart.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { BrokenCase, Built, Kit } from "./check-tree-built.ts"
import { buildTree, itFailsEach, nodeWith } from "./check-tree-built.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import {
  firstNode,
  problemsOf,
  retypeIn,
  says,
  setField,
} from "./check-tree-recorded.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import {
  readFieldMeanings,
  readFieldTables,
  readTreeDocuments,
} from "./spec-field-tables.ts"

// The trees of an xychart diagram made by hand: they are the smallest trees
// that hold the case they are about (see `check-tree-built.ts`). The header,
// the keywords, and the orientation are `Keyword` tokens, the brackets, the
// commas, the arrow, and the colons are `Punctuator` tokens, a number is a
// `Numeric` token, a string a `String` token with its quotes, and the units
// of a text without quotes and a text of an accessibility statement are
// `RawText` tokens. The kinds of the tokens are not held to a document of the
// parser here.

/** A tree of `source`, whose first line is the header; `makeStatements` makes the header node first. */
function build(
  source: string,
  makeStatements: (kit: Kit) => CheckedNode[],
): Built {
  return buildTree(
    {
      header: "xychart",
      diagramType: "xychart",
      bodyType: "XychartDiagram",
      bodyFields: (nodes) => ({
        headers: nodes.filter((node) => node.type === "XychartHeader"),
        body: nodes.filter((node) => node.type !== "XychartHeader"),
      }),
    },
    source,
    makeStatements,
  )
}

/** The header node of a source that starts with `xychart`, and the orientation after it, if `orientation` is given. */
function headerOf(kit: Kit, orientation?: string): CheckedNode {
  if (orientation !== undefined) kit.token("Keyword", orientation)
  return kit.node(
    "XychartHeader",
    [
      0,
      "xychart".length +
        (orientation === undefined ? 0 : 1 + orientation.length),
    ],
    { orientation: orientation ?? null },
  )
}

/** A text without quotes of these units: a `RawText` token for each, and the node with the units joined. */
function words(kit: Kit, ...units: string[]): CheckedNode {
  const tokens = units.map((unit) => kit.token("RawText", unit))
  return kit.node(
    "XychartLiteral",
    [tokens[0]?.range[0] ?? 0, tokens.at(-1)?.range[1] ?? 0],
    { value: units.join("") },
  )
}

/** A string written as `written`, whose content is `content`. */
function string(kit: Kit, written: string, content: string): CheckedNode {
  const token = kit.token("String", written)
  return kit.node("StringLiteral", token.range, {
    value: content,
    raw: written,
    closed: true,
  })
}

/** A number written as `written`. */
function number(kit: Kit, written: string): CheckedNode {
  const token = kit.token("Numeric", written)
  return kit.node("NumericLiteral", token.range, {
    value: Number(written),
    raw: written,
  })
}

/** The text of an accessibility statement: one `RawText` token and the node, `written` being its text. */
function accessibilityText(kit: Kit, written: string): CheckedNode {
  const token = kit.token("RawText", written)
  return kit.node("XychartLiteral", token.range, { value: written })
}

/** A node over the range from `first` to `last`. */
function spanning(
  kit: Kit,
  type: string,
  first: CheckedNode,
  last: CheckedNode,
  fields: Record<string, unknown>,
): CheckedNode {
  return kit.node(type, [first.range[0], last.range[1]], fields)
}

/** `title T`, where the title is made by `makeTitle`. */
function titleStatement(
  kit: Kit,
  makeTitle: (kit: Kit) => CheckedNode,
): CheckedNode {
  const keyword = kit.token("Keyword", "title")
  const value = makeTitle(kit)
  return kit.node("XychartTitleStatement", [keyword.range[0], value.range[1]], {
    value,
  })
}

/** The categories in brackets: `[a, "b c"]`. */
function band(
  kit: Kit,
  makeCategories: readonly ((kit: Kit) => CheckedNode)[],
): CheckedNode {
  const open = kit.token("Punctuator", "[")
  const categories = makeCategories.map((make, index) => {
    if (index > 0) kit.token("Punctuator", ",")
    return make(kit)
  })
  const close = kit.token("Punctuator", "]")
  return kit.node("XychartBand", [open.range[0], close.range[1]], {
    categories,
  })
}

/** A range `start --> end`. */
function range(kit: Kit, start: string, end: string): CheckedNode {
  const first = number(kit, start)
  kit.token("Punctuator", "-->")
  const last = number(kit, end)
  return spanning(kit, "XychartRange", first, last, { start: first, end: last })
}

/** An axis statement of the keyword `keyword`, with the title and the data made by the functions given. */
function axisStatement(
  kit: Kit,
  keyword: "x-axis" | "y-axis",
  makeTitle: ((kit: Kit) => CheckedNode) | null,
  makeData: ((kit: Kit) => CheckedNode) | null,
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const title = makeTitle === null ? null : makeTitle(kit)
  const data = makeData === null ? null : makeData(kit)
  return kit.node(
    keyword === "x-axis" ? "XychartXAxisStatement" : "XychartYAxisStatement",
    [first.range[0], (data ?? title)?.range[1] ?? first.range[1]],
    { title, data },
  )
}

/** A plot of the keyword `keyword`: its title (made by `makeTitle`), and its values, each with the label written as given. */
function plotStatement(
  kit: Kit,
  keyword: string,
  makeTitle: ((kit: Kit) => CheckedNode) | null,
  values: readonly (readonly [string, string?])[],
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const title = makeTitle === null ? null : makeTitle(kit)
  kit.token("Punctuator", "[")
  const nodes = values.map(([written, label], index) => {
    if (index > 0) kit.token("Punctuator", ",")
    const value = number(kit, written)
    const labelNode =
      label === undefined
        ? null
        : string(kit, label, label.slice(1, label.length - 1))
    return kit.node(
      "XychartValue",
      [value.range[0], (labelNode ?? value).range[1]],
      { value, label: labelNode },
    )
  })
  const close = kit.token("Punctuator", "]")
  return kit.node("XychartPlotStatement", [first.range[0], close.range[1]], {
    kind: keyword.toLowerCase(),
    title,
    values: nodes,
  })
}

/** An `accTitle:` or `accDescr:` statement with the text `written`, or none. */
function accessibilityLine(
  kit: Kit,
  keyword: "accTitle" | "accDescr",
  written: string | null,
): CheckedNode {
  const first = kit.token("Keyword", keyword)
  const colon = kit.token("Punctuator", ":")
  const value = written === null ? null : accessibilityText(kit, written)
  return kit.node(
    keyword === "accTitle"
      ? "XychartAccTitleStatement"
      : "XychartAccDescrStatement",
    [first.range[0], (value ?? colon).range[1]],
    { value },
  )
}

/** An `accDescr {` block with the text `written`, or none; `closed` says whether the `}` is there. */
function accessibilityBlock(
  kit: Kit,
  written: string | null,
  closed: boolean,
): CheckedNode {
  const first = kit.token("Keyword", "accDescr")
  const open = kit.token("Punctuator", "{")
  const value = written === null ? null : accessibilityText(kit, written)
  const close = closed ? kit.token("Punctuator", "}") : null
  return kit.node(
    "XychartAccDescrBlockStatement",
    [first.range[0], (close ?? value ?? open).range[1]],
    { value, closed },
  )
}

/** A body that is empty: the header alone. */
function headerAlone(): Built {
  return build("xychart\n", (kit) => [headerOf(kit)])
}

/** The orientation in upper case, after the header. */
function orientationUpperCase(): Built {
  return build("xychart VERTICAL\n", (kit) => [headerOf(kit, "VERTICAL")])
}

/** Two headers: the second has an orientation. */
function twoHeaders(): Built {
  return build("xychart\nxychart horizontal\ntitle T\n", (kit) => {
    const first = headerOf(kit)
    kit.token("Keyword", "xychart")
    kit.token("Keyword", "horizontal")
    const second = kit.node("XychartHeader", [8, 26], {
      orientation: "horizontal",
    })
    return [first, second, titleStatement(kit, (k) => words(k, "T"))]
  })
}

/** Every kind of statement with the text of each in the form of the grammar. */
function everyKind(): Built {
  const source =
    'xychart\ntitle Two words\nx-axis Month [a, "b c", 1.5]\ny-axis "Y" -1 --> 1.5\nx-axis "" [a]\ny-axis "" 0 --> 1\nline L [1 "p", +.5]\nbar "" [007 ""]\nBAR [.5]\naccTitle: a b\naccDescr: c d\naccDescr {\ne\n f\n}\n'
  return build(source, (kit) => [
    headerOf(kit),
    titleStatement(kit, (k) => words(k, "Two", "words")),
    axisStatement(
      kit,
      "x-axis",
      (k) => words(k, "Month"),
      (k) =>
        band(k, [
          (c) => words(c, "a"),
          (c) => string(c, '"b c"', "b c"),
          (c) => words(c, "1.5"),
        ]),
    ),
    axisStatement(
      kit,
      "y-axis",
      (k) => string(k, '"Y"', "Y"),
      (k) => range(k, "-1", "1.5"),
    ),
    axisStatement(
      kit,
      "x-axis",
      (k) => string(k, '""', ""),
      (k) => band(k, [(c) => words(c, "a")]),
    ),
    axisStatement(
      kit,
      "y-axis",
      (k) => string(k, '""', ""),
      (k) => range(k, "0", "1"),
    ),
    plotStatement(kit, "line", (k) => words(k, "L"), [["1", '"p"'], ["+.5"]]),
    plotStatement(kit, "bar", (k) => string(k, '""', ""), [["007", '""']]),
    plotStatement(kit, "BAR", null, [[".5"]]),
    accessibilityLine(kit, "accTitle", "a b"),
    accessibilityLine(kit, "accDescr", "c d"),
    accessibilityBlock(kit, "e\n f", true),
  ])
}

/** `accTitle:` without text, at the end of the text. */
function accTitleWithoutText(): Built {
  return build("xychart\ntitle T\naccTitle:", (kit) => [
    headerOf(kit),
    titleStatement(kit, (k) => words(k, "T")),
    accessibilityLine(kit, "accTitle", null),
  ])
}

/** `accDescr:` without text, at the end of the text. */
function accDescrWithoutText(): Built {
  return build("xychart\naccDescr:\n", (kit) => [
    headerOf(kit),
    accessibilityLine(kit, "accDescr", null),
  ])
}

/** An empty block that is not closed, at the end of the text. */
function unclosedEmptyBlock(): Built {
  return build("xychart\naccDescr {", (kit) => [
    headerOf(kit),
    accessibilityBlock(kit, null, false),
  ])
}

/** A block with a text that is not closed, at the end of the text. */
function unclosedBlock(): Built {
  return build("xychart\naccDescr {\ne", (kit) => [
    headerOf(kit),
    accessibilityBlock(kit, "e", false),
  ])
}

/** An axis title that is a text of characters other than digits, and a title with digits in a plot, a category, and the title of the chart. */
function digitsOutsideAxisTitles(): Built {
  return build(
    "xychart\ntitle Q1\nx-axis T [Q1]\ny-axis Y 0 --> 1\nline 2024 [1]\n",
    (kit) => [
      headerOf(kit),
      titleStatement(kit, (k) => words(k, "Q1")),
      axisStatement(
        kit,
        "x-axis",
        (k) => words(k, "T"),
        (k) => band(k, [(c) => words(c, "Q1")]),
      ),
      axisStatement(
        kit,
        "y-axis",
        (k) => words(k, "Y"),
        (k) => range(k, "0", "1"),
      ),
      plotStatement(kit, "line", (k) => words(k, "2024"), [["1"]]),
    ],
  )
}

/** A value of four hundred digits, which a double cannot hold: its `value` is `Infinity`. */
function numberTooLarge(): Built {
  const digits = "9".repeat(400)
  return build(`xychart\nbar [${digits}]\n`, (kit) => [
    headerOf(kit),
    plotStatement(kit, "bar", null, [[digits]]),
  ])
}

/** The trees that satisfy every sentence, by name. */
const VALID: Readonly<Record<string, () => Built>> = {
  "the header alone": headerAlone,
  "a number that a double cannot hold": numberTooLarge,
  "an orientation in upper case": orientationUpperCase,
  "two headers": twoHeaders,
  "every kind of statement": everyKind,
  "accTitle: without text at the end of the text": accTitleWithoutText,
  "accDescr: without text at the end of the text": accDescrWithoutText,
  "an empty block that is not closed": unclosedEmptyBlock,
  "a block with a text that is not closed": unclosedBlock,
  "digits in a title, a category, and the title of a plot":
    digitsOutsideAxisTitles,
}

describe("the check of an xychart tree made by hand", () => {
  for (const [name, make] of Object.entries(VALID)) {
    it(`passes ${name}`, () => {
      const { source, tree } = make()
      expect(checkTree(source, tree)).toEqual([])
    })
  }
})

/** A title in quotes, then a block, a statement after it, and `title T` as the last. */
function quotedTitleAndBlock(): Built {
  return build('xychart\ntitle "T"\naccDescr {\nx\n}\ntitle U\n', (kit) => [
    headerOf(kit),
    titleStatement(kit, (k) => string(k, '"T"', "T")),
    accessibilityBlock(kit, "x", true),
    titleStatement(kit, (k) => words(k, "U")),
  ])
}

/** Sets the field `fieldName` of the first node of the type `type` to `value`. */
function set(
  type: string,
  fieldName: string,
  value: unknown,
): BrokenCase["mutate"] {
  return (tree) => {
    setField(nodeWith(tree, type), fieldName, value)
  }
}

/** The first node of `tree` of the type `type` whose field `fieldName` holds a node of the type `holds`. */
function nodeHolding(
  tree: Parameters<BrokenCase["mutate"]>[0],
  type: string,
  fieldName: string,
  holds: string,
): CheckedNode {
  const found = nodesOf(tree).find((node) => {
    const held = node[fieldName]
    return (
      node.type === type &&
      typeof held === "object" &&
      held !== null &&
      (held as CheckedNode).type === holds
    )
  })
  if (found === undefined) throw new Error(`no ${type} with a ${holds}`)
  return found
}

/** The first node of `tree` of the type `type`. */
function firstOf(
  tree: Parameters<BrokenCase["mutate"]>[0],
  type: string,
): CheckedNode {
  return nodeWith(tree, type)
}

describe("the check of an xychart tree made by hand: a number that JSON cannot write", () => {
  it("passes a number too large for a double with the value null, as JSON.stringify writes it, and with -Infinity written as its text says", () => {
    const { source, tree } = numberTooLarge()
    const literal = nodeWith(tree, "NumericLiteral")
    expect(literal.value).toBe(Infinity)
    setField(literal, "value", null)
    expect(checkTree(source, tree)).toEqual([])
    const negative = build(`xychart\nbar [-${"9".repeat(400)}]\n`, (kit) => [
      headerOf(kit),
      plotStatement(kit, "bar", null, [[`-${"9".repeat(400)}`]]),
    ])
    expect(nodeWith(negative.tree, "NumericLiteral").value).toBe(-Infinity)
    setField(nodeWith(negative.tree, "NumericLiteral"), "value", null)
    expect(checkTree(negative.source, negative.tree)).toEqual([])
  })

  it("fails a value of null for a number that a double holds", () => {
    const { source, tree } = everyKind()
    setField(nodeWith(tree, "NumericLiteral"), "value", null)
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.startsWith(
          "value is not the number that its written text writes: null, not -1",
        ),
      ),
    ).toBe(true)
  })

  it("fails a value of Infinity for a number that a double holds", () => {
    const { source, tree } = everyKind()
    setField(nodeWith(tree, "NumericLiteral"), "value", Infinity)
    expect(checkTree(source, tree)).not.toEqual([])
  })

  it("tells Infinity from -Infinity in a tree in memory", () => {
    const negative = build(`xychart\nbar [-${"9".repeat(400)}]\n`, (kit) => [
      headerOf(kit),
      plotStatement(kit, "bar", null, [[`-${"9".repeat(400)}`]]),
    ])
    expect(checkTree(negative.source, negative.tree)).toEqual([])
    setField(nodeWith(negative.tree, "NumericLiteral"), "value", Infinity)
    expect(
      checkTree(negative.source, negative.tree).map(
        (problem) => problem.message,
      ),
    ).toEqual([
      "value is not the number that its written text writes: Infinity, not -Infinity",
    ])
  })
})

describe("the check of an xychart tree made by hand: the fields", () => {
  itFailsEach([
    {
      name: "a body that holds a band",
      built: everyKind,
      mutate: (tree) => {
        const diagram = firstOf(tree, "XychartDiagram")
        setField(diagram, "body", [firstOf(tree, "XychartBand")])
      },
      expected:
        "XychartDiagram at #: the field body holds a XychartBand, not a XychartTitleStatement or XychartXAxisStatement",
    },
    {
      name: "a number as the title of a statement",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartTitleStatement"),
          "value",
          firstOf(tree, "NumericLiteral"),
        )
      },
      expected:
        "XychartTitleStatement at #: the field value holds a NumericLiteral, not a XychartLiteral or StringLiteral",
    },
    {
      name: "a value as the data of an x axis",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartXAxisStatement"),
          "data",
          firstOf(tree, "XychartValue"),
        )
      },
      expected:
        "XychartXAxisStatement at #: the field data holds a XychartValue, not a XychartBand or XychartRange",
    },
    {
      name: "a band as the data of a y axis",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartYAxisStatement"),
          "data",
          firstOf(tree, "XychartBand"),
        )
      },
      expected:
        "XychartYAxisStatement at #: the field data holds a XychartBand, not a XychartRange",
    },
    {
      name: "a text without quotes as a label",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartValue"),
          "label",
          firstOf(tree, "XychartLiteral"),
        )
      },
      expected:
        "XychartValue at #: the field label holds a XychartLiteral, not a StringLiteral",
    },
    {
      name: "a number as a category",
      built: everyKind,
      mutate: (tree) => {
        setField(firstOf(tree, "XychartBand"), "categories", [
          firstOf(tree, "NumericLiteral"),
        ])
      },
      expected:
        "XychartBand at #: the field categories holds a NumericLiteral, not a XychartLiteral or StringLiteral",
    },
    {
      name: "a string as the text of an accessibility statement",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartAccTitleStatement"),
          "value",
          firstOf(tree, "StringLiteral"),
        )
      },
      expected:
        "XychartAccTitleStatement at #: the field value holds a StringLiteral, not a XychartLiteral",
    },
    {
      name: "a diagram without a header",
      built: everyKind,
      mutate: set("XychartDiagram", "headers", []),
      expected: "XychartDiagram at #: the list headers is empty",
    },
    {
      name: "a band without a category",
      built: everyKind,
      mutate: set("XychartBand", "categories", []),
      expected: "XychartBand at #: the list categories is empty",
    },
    {
      name: "a plot without a value",
      built: everyKind,
      mutate: set("XychartPlotStatement", "values", []),
      expected: "XychartPlotStatement at #: the list values is empty",
    },
    {
      name: "a header after the first statement",
      built: everyKind,
      mutate: (tree, source) => {
        setField(firstOf(tree, "XychartHeader"), "range", [
          source.length - 2,
          source.length - 1,
        ])
      },
      expected:
        "XychartHeader at #: the header is not before the first statement, XychartTitleStatement at #",
    },
    {
      name: "an orientation that is none of the words",
      built: orientationUpperCase,
      mutate: set("XychartHeader", "orientation", "diagonal"),
      expected:
        'XychartHeader at #: the orientation is "diagonal", none of vertical, horizontal in any case',
    },
    {
      name: "a kind of plot that is not in lower case",
      built: everyKind,
      mutate: set("XychartPlotStatement", "kind", "Line"),
      expected:
        'XychartPlotStatement at #: the kind is "Line", none of line, bar',
    },
    {
      name: "a title that is an empty string",
      built: quotedTitleAndBlock,
      mutate: (tree) => {
        setField(
          nodeHolding(tree, "XychartTitleStatement", "value", "StringLiteral")
            .value as object,
          "value",
          "",
        )
      },
      expected: "XychartTitleStatement at #: the title is empty",
    },
    {
      name: "an axis with neither a title nor data",
      built: everyKind,
      mutate: (tree) => {
        const axis = firstOf(tree, "XychartXAxisStatement")
        setField(axis, "title", null)
        setField(axis, "data", null)
      },
      expected:
        "XychartXAxisStatement at #: the statement has neither a title nor data",
    },
    {
      name: "an axis whose title is an empty string and has no data",
      built: everyKind,
      mutate: (tree) => {
        setField(
          nodeHolding(tree, "XychartYAxisStatement", "title", "StringLiteral"),
          "title",
          null,
        )
        const axis = nodesOf(tree).filter(
          (node) => node.type === "XychartYAxisStatement",
        )[1]
        if (axis === undefined) throw new Error("no second y axis")
        setField(axis, "data", null)
      },
      expected:
        "XychartYAxisStatement at #: the title is an empty string that no data follows",
    },
    {
      name: "a category that is an empty string",
      built: everyKind,
      mutate: (tree) => {
        const empty = nodesOf(tree).find(
          (node) => node.type === "StringLiteral" && node.value === "",
        )
        if (empty === undefined) throw new Error("no empty string")
        const bands = nodesOf(tree).filter(
          (node) => node.type === "XychartBand",
        )
        setField(bands[1] ?? firstOf(tree, "XychartBand"), "categories", [
          empty,
        ])
      },
      expected: "XychartBand at #: a category is an empty string",
    },
    {
      name: "accTitle: without text and a statement after it",
      built: everyKind,
      mutate: set("XychartAccTitleStatement", "value", null),
      expected:
        "XychartAccTitleStatement at #: the statement has no text and a statement follows it",
    },
    {
      name: "accDescr: without text and a statement after it",
      built: everyKind,
      mutate: set("XychartAccDescrStatement", "value", null),
      expected:
        "XychartAccDescrStatement at #: the statement has no text and a statement follows it",
    },
    {
      name: "a block that is not closed and a statement after it",
      built: quotedTitleAndBlock,
      mutate: set("XychartAccDescrBlockStatement", "closed", false),
      expected:
        "XychartAccDescrBlockStatement at #: the block is not closed and a statement follows it",
    },
  ])
})

describe("the check of an xychart tree made by hand: the texts and the numbers", () => {
  itFailsEach([
    {
      name: "a text without quotes that holds a comma",
      built: everyKind,
      mutate: set("XychartLiteral", "value", "Two,words"),
      expected:
        'XychartLiteral at #: the text "Two,words" is empty or holds a character that a word does not hold',
    },
    {
      name: "a text without quotes that is empty",
      built: everyKind,
      mutate: set("XychartLiteral", "value", ""),
      expected:
        'XychartLiteral at #: the text "" is empty or holds a character that a word does not hold',
    },
    {
      name: "a text without quotes that holds a character outside ASCII",
      built: everyKind,
      mutate: set("XychartLiteral", "value", "Twoé"),
      expected:
        'XychartLiteral at #: the text "Twoé" is empty or holds a character that a word does not hold',
    },
    {
      name: "a title of an axis that holds a digit",
      built: everyKind,
      mutate: (tree) => {
        const axis = firstOf(tree, "XychartXAxisStatement")
        setField(axis.title as object, "value", "Month1")
      },
      expected:
        'XychartLiteral at #: the title "Month1" of an axis holds a digit, which starts a number',
    },
    {
      name: "a title of a y axis that holds a digit",
      built: digitsOutsideAxisTitles,
      mutate: (tree) => {
        const axis = firstOf(tree, "XychartYAxisStatement")
        setField(axis.title as object, "value", "Y1")
      },
      expected:
        'XychartLiteral at #: the title "Y1" of an axis holds a digit, which starts a number',
    },
    {
      name: "the text of an accessibility statement that is empty",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartAccTitleStatement").value as object,
          "value",
          "",
        )
      },
      expected: "XychartLiteral at #: the text is empty",
    },
    {
      name: "the text of a line of an accessibility statement that holds a line feed",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartAccDescrStatement").value as object,
          "value",
          "c\nd",
        )
      },
      expected: "holds a line terminator",
    },
    {
      name: "the text of a block that holds a closing brace",
      built: everyKind,
      mutate: (tree) => {
        setField(
          firstOf(tree, "XychartAccDescrBlockStatement").value as object,
          "value",
          "e}",
        )
      },
      expected: "of a block holds a `}`",
    },
    {
      name: "a number whose range holds more than the number",
      built: everyKind,
      mutate: (tree, source) => {
        const literal = firstOf(tree, "NumericLiteral")
        const start = literal.range[0]
        setField(literal, "range", [start, source.indexOf("\n", start)])
      },
      expected: "NumericLiteral at #: the number",
    },
    {
      name: "a string that is not closed",
      built: everyKind,
      mutate: set("StringLiteral", "closed", false),
      expected: "StringLiteral at #: the string is not closed",
    },
    {
      name: "a string that holds a quote",
      built: everyKind,
      mutate: set("StringLiteral", "value", 'a"b'),
      expected: 'holds a `"`, which would close it',
    },
  ])
})

/** The words of `text` that are names of node types: a capital letter and a lower case letter, in a run of letters. */
function typeNamesIn(text: string): string[] {
  return [...text.matchAll(/[A-Z][A-Za-z]*[a-z][A-Za-z]*/gu)].map(
    (match) => match[0],
  )
}

/** The type names that the sentence `**XychartStatement** is a …` of ast/xychart.md lists. */
function statementTypesOfDocument(): string[] {
  const document = readTreeDocuments().find((text) =>
    text.includes("**XychartStatement** is a"),
  )
  if (document === undefined) throw new Error("no XychartStatement")
  const start = document.indexOf("**XychartStatement** is a")
  const sentence = document.slice(start, document.indexOf(".\n", start))
  return typeNamesIn(sentence.slice("**XychartStatement**".length))
}

/** The node types that the Type column cell `cell` names, with `XychartStatement` as the statements it stands for. */
function typesOfCell(cell: string, statements: readonly string[]): string[] {
  return typeNamesIn(cell).flatMap((type) =>
    type === "XychartStatement" ? statements : [type],
  )
}

describe("the tables of the check of an xychart tree", () => {
  const statements = statementTypesOfDocument()

  it("give the child types that the Type column of ast/xychart.md gives", () => {
    const documented = readFieldTables()
    const differing: string[] = []
    for (const [type, fields] of Object.entries(XYCHART_CHILD_TYPES)) {
      for (const [fieldName, allowed] of Object.entries(fields)) {
        const cell = documented.get(type)?.get(fieldName) ?? ""
        if (
          JSON.stringify(typesOfCell(cell, statements).sort()) !==
          JSON.stringify([...allowed].sort())
        ) {
          differing.push(`${type}.${fieldName}: ${cell}`)
        }
      }
    }
    expect(differing).toEqual([])
  })

  it("give a child type for every field of the xychart types that holds a node", () => {
    const missing: string[] = []
    for (const [type, fields] of readFieldTables()) {
      if (!type.startsWith("Xychart")) continue
      for (const [fieldName, cell] of fields) {
        if (
          typesOfCell(cell, statements).length > 0 &&
          XYCHART_CHILD_TYPES[type]?.[fieldName] === undefined
        ) {
          missing.push(`${type}.${fieldName}: ${cell}`)
        }
      }
    }
    expect(missing).toEqual([])
  })

  it("give the words that the Meaning column of ast/xychart.md gives for the orientation and the kind of a plot", () => {
    const meanings = readFieldMeanings()

    /** The words in backticks of the Meaning of a field. */
    function wordsOf(type: string, fieldName: string): string[] {
      return [
        ...(meanings.get(type)?.get(fieldName) ?? "").matchAll(/`([^`]+)`/gu),
      ].map((match) => match[1] ?? "")
    }

    expect(wordsOf("XychartHeader", "orientation")).toEqual([
      ...XYCHART_ORIENTATIONS,
    ])
    expect(wordsOf("XychartPlotStatement", "kind")).toEqual([
      ...XYCHART_PLOT_KINDS,
    ])
  })
})

describe("the check of an xychart tree made by hand: the tokens and the ranges", () => {
  itFailsEach([
    {
      name: "an axis whose data comes before its title",
      built: everyKind,
      mutate: (tree) => {
        const axis = nodesOf(tree).find(
          (node) =>
            node.type === "XychartXAxisStatement" &&
            node.title !== null &&
            node.data !== null,
        )
        if (axis === undefined) throw new Error("no axis with both")
        const { title, data } = axis
        setField(axis, "title", data)
        setField(axis, "data", title)
      },
      expected:
        "XychartXAxisStatement at #: the title does not come before the data",
    },
    {
      name: "a statement whose range stops before its last child",
      built: everyKind,
      mutate: (tree) => {
        const statement = firstOf(tree, "XychartTitleStatement")
        setField(statement, "range", [
          statement.range[0],
          statement.range[1] - 1,
        ])
      },
      expected:
        "XychartTitleStatement at #: the range, which runs from the first of its tokens and child nodes to the last",
    },
    {
      name: "a band without the comma between two categories",
      built: everyKind,
      mutate: (tree) => {
        const comma = tree.tokens.findIndex(
          (token) => token.type === "Punctuator" && token.value === ",",
        )
        setField(
          tree,
          "tokens",
          tree.tokens.filter((_token, index) => index !== comma),
        )
      },
      expected:
        "the tokens that the node writes itself and its child nodes, in source order",
    },
  ])
})

// The same sentences against the recorded trees of the corpus: each case
// changes one thing of the tree of a named fixture.

/** Sets the field `fieldName` of the first node of the type `type` to `value`. */
function setIn(
  type: string,
  fieldName: string,
  value: unknown,
): MutationCase["mutate"] {
  return (root) => {
    setField(firstNode(root, type), fieldName, value)
  }
}

const OWN_KIND = "the kind of a token that the node writes itself"
const HULL =
  "the range, which runs from the first of its tokens and child nodes to the last"
const LAYOUT =
  "the tokens that the node writes itself and its child nodes, in source order"

const RECORDED_CASES: readonly MutationCase[] = [
  {
    name: "the header as a RawText token",
    fixture: "db-orientation-capitalized",
    mutate: retypeIn("XychartHeader", "Keyword", "xychart-beta", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Keyword"`,
  },
  {
    name: "an orientation that is not the token as written",
    fixture: "db-orientation-capitalized",
    mutate: setIn("XychartHeader", "orientation", "horizontal"),
    expected:
      'the orientation of the header is not the token after the header keyword, or null when there is none: "horizontal", not "Horizontal"',
  },
  {
    name: "no orientation where one is written",
    fixture: "db-orientation-capitalized",
    mutate: setIn("XychartHeader", "orientation", null),
    expected:
      'the orientation of the header is not the token after the header keyword, or null when there is none: null, not "Horizontal"',
  },
  {
    name: "a bracket as a Keyword token",
    fixture: "db-x-axis-band-title",
    mutate: retypeIn("XychartBand", "Punctuator", "[", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "an arrow as a RawText token",
    fixture: "db-x-axis-range",
    mutate: retypeIn("XychartRange", "Punctuator", "-->", "RawText"),
    expected: `${OWN_KIND}: "RawText", not "Punctuator"`,
  },
  {
    name: "a `;` as a Keyword token",
    fixture: "db-semicolon-statements",
    mutate: retypeIn("XychartDiagram", "Punctuator", ";", "Keyword"),
    expected: `${OWN_KIND}: "Keyword", not "Punctuator"`,
  },
  {
    name: "a kind of plot that is not the keyword in lower case",
    fixture: "db-plot-upper-case-keyword",
    mutate: setIn("XychartPlotStatement", "kind", "LINE"),
    expected: `${LAYOUT}: ["line","[","·","]"], not ["LINE","[","·","]"]`,
  },
  {
    name: "a block that is closed, though it ends at the end of the text",
    fixture: "db-acc-descr-unclosed-block",
    mutate: setIn("XychartAccDescrBlockStatement", "closed", true),
    expected: "closed, which is whether it ends with }: true, not false",
  },
  {
    name: "a block that is not closed, though it ends with }",
    fixture: "db-acc-descr-block",
    mutate: setIn("XychartAccDescrBlockStatement", "closed", false),
    expected: "closed, which is whether it ends with }: false, not true",
  },
  {
    name: "a statement whose range stops before its text",
    fixture: "db-title-bare-words",
    mutate: (root) => {
      const statement = firstNode(root, "XychartTitleStatement")
      setField(statement, "range", [statement.range[0], statement.range[1] - 1])
    },
    expected: `XychartTitleStatement at 14-28: ${HULL}`,
  },
  {
    name: "an accessibility statement without its colon",
    fixture: "db-acc-title",
    mutate: (root) => {
      const colon = root.tokens.findIndex((token) => token.value === ":")
      setField(
        root,
        "tokens",
        root.tokens.filter((_token, index) => index !== colon),
      )
    },
    expected: LAYOUT,
  },
  {
    name: "the text of a title as a String token",
    fixture: "db-title-bare-words",
    mutate: retypeIn("XychartLiteral", "RawText", null, "Identifier"),
    expected: "the tokens of an XychartLiteral are not all of the kind RawText",
  },
  {
    name: "a number as a RawText token",
    fixture: "db-x-axis-range",
    mutate: retypeIn("NumericLiteral", "Numeric", null, "RawText"),
    expected: "the tokens of a NumericLiteral are not all of the kind Numeric",
  },
  {
    name: "two words with nothing between them as two tokens",
    fixture: "db-title-bare-words",
    mutate: (root) => {
      const [first, second] = root.tokens.filter(
        (token) => token.type === "RawText",
      )
      if (first === undefined || second === undefined) {
        throw new Error("no two words")
      }
      setField(second, "range", [first.range[1], second.range[1]])
    },
    expected: "have nothing between them, so they are one token",
  },
]

describe("the check of an xychart tree against the recorded trees", () => {
  for (const mutation of RECORDED_CASES) {
    it(`passes the recorded tree of ${mutation.fixture} and fails ${mutation.name}`, () => {
      const { base, mutated } = problemsOf("xychart", mutation)
      expect(base).toEqual([])
      expect(
        says(mutated, mutation.expected),
        JSON.stringify(mutated, null, 1),
      ).toBe(true)
    })
  }
})
