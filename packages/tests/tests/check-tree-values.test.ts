import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { isWhitespaceAt } from "../src/db-from-tree/characters.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import {
  STRUCTURE_NODE_TYPES,
  VALUE_NODE_TYPES,
} from "../src/check-tree/node-types.ts"
import { VALUE_RULES } from "../src/check-tree/values.ts"
import { WrittenText } from "../src/check-tree/written-text.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import { label } from "../src/check-tree/problems.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { DiagramType } from "../src/index.ts"
import {
  expectWhitespaceCases,
  mayHaveRecordedTrees,
  recordedTree,
  recordedTreesOfCorpus,
} from "./check-tree-recorded.ts"
import type { WhitespaceCase } from "./check-tree-recorded.ts"
import { readFieldMeanings } from "./spec-field-tables.ts"

// The value of a node is made from the written text of its range by one rule
// (`src/check-tree/values.ts`): the table of that file lists, for each node
// type with a value, how. This test requires the table to list every value
// of the field tables, to agree with the Meaning column of the specification
// on which values are simply the written text, and every kind of break of a
// value to be reported in a recorded tree.

/** The fields `value` and `name` of the node types of the field tables that hold a string or a number: the values of the nodes. */
function valueFieldsOfTables(): Map<string, string> {
  const fields = new Map<string, string>()
  for (const [type, own] of Object.entries(NODE_FIELDS)) {
    if (!VALUE_NODE_TYPES.has(type) && !STRUCTURE_NODE_TYPES.has(type)) continue
    for (const field of ["value", "name"]) {
      const spec = own[field]
      if (
        spec?.shape === "value" &&
        (spec.valueType === "string" || spec.valueType === "number")
      ) {
        fields.set(type, field)
      }
    }
  }
  return fields
}

/** How the Meaning column of the specification says that a value is made: its written text, the texts of its units joined, or otherwise. */
function saidInSpecification(
  meaning: string,
): "written-text" | "units-joined" | "otherwise" {
  if (meaning.startsWith("Its written text between")) return "otherwise"
  if (meaning.startsWith("Its written text")) return "written-text"
  if (
    meaning.startsWith("The written texts of its units") ||
    meaning.startsWith("The texts of its units")
  ) {
    return "units-joined"
  }
  return "otherwise"
}

describe("the rules of the values of the nodes", () => {
  it("list exactly the fields value and name that the field tables give to a node", () => {
    const rules = new Map(
      Object.entries(VALUE_RULES).map(([type, rule]) => [type, rule.field]),
    )
    expect(rules).toEqual(valueFieldsOfTables())
  })

  it("say a value is its written text, or the texts of its units joined, where the specification says so, and make the others exceptions", () => {
    const meanings = readFieldMeanings()
    const differing: string[] = []
    for (const [type, rule] of Object.entries(VALUE_RULES)) {
      const meaning = meanings.get(type)?.get(rule.field)
      if (meaning === undefined) {
        differing.push(`${type}.${rule.field}: not in the specification`)
        continue
      }
      const expected =
        rule.kind === "units-joined"
          ? "units-joined"
          : rule.kind === "written-text" && rule.delimiters === undefined
            ? "written-text"
            : "otherwise"
      if (saidInSpecification(meaning) !== expected) {
        differing.push(
          `${type}.${rule.field}: the rule is ${expected}, the specification says ${meaning}`,
        )
      }
    }
    expect(differing).toEqual([])
  })
})

/** The edits of a value that the check must report. */
const VALUE_EDITS: readonly {
  name: string
  edit: (value: string | number) => string | number
}[] = [
  {
    name: "a character added at the end",
    edit: (value) => (typeof value === "number" ? value + 1 : `${value}Z`),
  },
  {
    name: "a character added at the start",
    edit: (value) => (typeof value === "number" ? value + 1 : `Z${value}`),
  },
  {
    name: "the last character dropped",
    edit: (value) =>
      typeof value === "number" ? value + 1 : value.slice(0, -1),
  },
  {
    name: "the first character dropped",
    edit: (value) => (typeof value === "number" ? value + 1 : value.slice(1)),
  },
]

/** The message of a value that is not the written text of its node: the rule of the type whose value is its written text. */
const NOT_WRITTEN_TEXT = "value is not its written text"

/** The message of a value that is not the texts of the tokens of its node joined: the rule of the type whose value is its units joined. */
const NOT_TOKENS_JOINED = "value is not the texts of its tokens joined"

/** The message of a name that is not the texts of the tokens of its node joined: the rule of the type whose name is its units joined. */
const NAME_NOT_TOKENS_JOINED = "name is not the texts of its tokens joined"

/** A value that a recorded tree breaks, and the rule of its type that must report it. */
interface BrokenValueRow {
  /** The node type of `VALUE_RULES` whose value is broken. */
  readonly type: string
  /** What the row breaks, when the type has more than one rule. */
  readonly variant?: "a style"
  /** The fixed start of the message of the rule of the type; the problem is at the node. */
  readonly message: string
}

/**
 * The message that each node type of `VALUE_RULES` reports for a broken value,
 * from the rule of its kind: a value that is the written text, one that is the
 * units joined (and its tokens joined with the field named), and the two that
 * follow from the text (the number, the shape name). A `ClassLiteral` and an
 * `ErLiteral` are the written text, except that a style is its units joined.
 */
const BROKEN_VALUE_ROWS: readonly BrokenValueRow[] = [
  { type: "Identifier", message: NAME_NOT_TOKENS_JOINED },
  { type: "StringLiteral", message: NOT_WRITTEN_TEXT },
  {
    type: "NumericLiteral",
    message: "value is not the number that its written text writes",
  },
  { type: "FlowchartLabel", message: NOT_WRITTEN_TEXT },
  { type: "FlowchartDataBlock", message: NOT_WRITTEN_TEXT },
  { type: "FlowchartLiteral", message: NOT_WRITTEN_TEXT },
  { type: "FlowchartIgnoredText", message: NOT_WRITTEN_TEXT },
  { type: "FlowchartArrow", message: NOT_WRITTEN_TEXT },
  { type: "FlowchartOpeningArrow", message: NOT_WRITTEN_TEXT },
  { type: "FlowchartShape", message: "the name of the shape, written " },
  { type: "SequenceBoxText", message: NOT_WRITTEN_TEXT },
  { type: "SequenceIgnoredStatement", message: NOT_WRITTEN_TEXT },
  { type: "SequenceIdentifier", message: "name is not its written text" },
  { type: "SequenceLiteral", message: NOT_WRITTEN_TEXT },
  { type: "SequenceArrow", message: NOT_WRITTEN_TEXT },
  { type: "SequenceDataBlock", message: NOT_WRITTEN_TEXT },
  { type: "ClassLiteral", message: NOT_WRITTEN_TEXT },
  { type: "ClassLiteral", variant: "a style", message: NOT_TOKENS_JOINED },
  { type: "ClassIdentifier", message: NAME_NOT_TOKENS_JOINED },
  { type: "ClassIgnoredText", message: NOT_WRITTEN_TEXT },
  { type: "ClassArrow", message: NOT_TOKENS_JOINED },
  { type: "StateLiteral", message: NOT_WRITTEN_TEXT },
  { type: "StateIgnoredText", message: NOT_WRITTEN_TEXT },
  { type: "StateIgnoredStatement", message: NOT_WRITTEN_TEXT },
  { type: "ErIdentifier", message: "name is not its written text" },
  { type: "ErLiteral", message: NOT_WRITTEN_TEXT },
  { type: "ErLiteral", variant: "a style", message: NOT_TOKENS_JOINED },
  { type: "ErIgnoredText", message: NOT_WRITTEN_TEXT },
  { type: "GanttLiteral", message: NOT_WRITTEN_TEXT },
  { type: "JourneyLiteral", message: NOT_WRITTEN_TEXT },
  { type: "JourneyIgnoredText", message: NOT_WRITTEN_TEXT },
  { type: "MindmapLabel", message: NOT_WRITTEN_TEXT },
  { type: "MindmapLiteral", message: NOT_WRITTEN_TEXT },
  { type: "TimelineLiteral", message: NOT_WRITTEN_TEXT },
  {
    type: "SankeyIdentifier",
    message: "name is not its written text without the whitespace at its ends",
  },
  {
    type: "SankeyLiteral",
    message: "value is not its written text without the whitespace at its ends",
  },
  { type: "RequirementIdentifier", message: "name is not its written text" },
  { type: "RequirementLiteral", message: NOT_WRITTEN_TEXT },
  { type: "RequirementIgnoredText", message: NOT_WRITTEN_TEXT },
]

/** The name of a row, for the failures. */
function nameOfRow(row: BrokenValueRow): string {
  return row.variant === undefined ? row.type : `${row.type} (${row.variant})`
}

/** The `ClassLiteral` and `ErLiteral` nodes of `tree` that are a style of a statement. */
function stylesIn(tree: CheckedRoot): Set<unknown> {
  const styles = new Set<unknown>()
  for (const node of nodesOf(tree)) {
    if (
      (node.type === "ClassStyleStatement" ||
        node.type === "ClassClassDefStatement" ||
        node.type === "ErStyleStatement" ||
        node.type === "ErClassDefStatement") &&
      Array.isArray(node.styles)
    ) {
      for (const style of node.styles as unknown[]) styles.add(style)
    }
  }
  return styles
}

/** The nodes of `tree` that the row breaks: of its type, of its variant, with a value that an edit changes. */
function instancesOfRow(tree: CheckedRoot, row: BrokenValueRow): CheckedNode[] {
  const field = VALUE_RULES[row.type]?.field ?? "value"
  const styles = stylesIn(tree)
  return nodesOf(tree).filter(
    (node) =>
      node.type === row.type &&
      (!(row.type === "ClassLiteral" || row.type === "ErLiteral") ||
        styles.has(node) === (row.variant === "a style")) &&
      (typeof node[field] === "number" ||
        (typeof node[field] === "string" && node[field] !== "")),
  )
}

describe("a broken value", () => {
  it("is reported, at its node and by the rule of its type, for every node type with a value, whatever the edit", async () => {
    // Any recorded tree that has such a node will do: the row names the
    // message, which does not depend on the tree.
    const trees = await recordedTreesOfCorpus()
    const unreported: string[] = []
    for (const row of BROKEN_VALUE_ROWS) {
      const rule = VALUE_RULES[row.type]
      if (rule === undefined) throw new Error(`${row.type} has no value rule`)
      for (const { name, edit } of VALUE_EDITS) {
        const failure = `${nameOfRow(row)}.${rule.field}: ${name}`
        let found = false
        for (const recorded of trees) {
          const tree = JSON.parse(recorded.json) as CheckedRoot
          const instance = instancesOfRow(tree, row)[0]
          if (instance === undefined) continue
          found = true
          const mutable = instance as Record<string, unknown>
          const before = mutable[rule.field]
          if (typeof before !== "string" && typeof before !== "number") {
            throw new Error(`${row.type} has no value to break`)
          }
          mutable[rule.field] = edit(before)
          const where = label(instance)
          const atTheNode = checkTree(recorded.input, tree).filter(
            (problem) => problem.where === where,
          )
          if (
            !atTheNode.some((problem) =>
              problem.message.startsWith(row.message),
            )
          ) {
            unreported.push(
              `${failure}: no problem at ${where} that starts with ${JSON.stringify(row.message)} in ${recorded.name}, but ${JSON.stringify(atTheNode.map((problem) => problem.message))}`,
            )
          }
          break
        }
        if (!found) unreported.push(`${failure}: no recorded tree has it`)
      }
    }
    expect(unreported).toEqual([])
  }, 120_000)

  it("has a row for every node type of the rules of the values, and for no other", () => {
    const types = [...new Set(BROKEN_VALUE_ROWS.map((row) => row.type))]
    expect(types.sort()).toEqual(
      Object.keys(VALUE_RULES).filter(mayHaveRecordedTrees).sort(),
    )
  })
})

// ast.md, Nodes, and parser/docs/tokens.md, Tokens: the tokens of a node are
// the units of its written text, so that the whitespace at an end of a token
// that a node holds is a character of its value, and a tree that leaves it out
// of the token (the token keeps the text of the source at its range, so the
// whitespace lies in no token) is reported. Each case below takes the recorded
// tree of a named fixture, takes the whitespace off one side of a token that a
// node of the type holds, and says which problems the check reports; the
// unedited tree has none. The whitespace lies at the end of a token next to a
// cut (a directive, a comment region, or a `;` that the line rule ignores), or
// inside the braces of a data block, where it is a part of the value. The
// value rule of a type does not differ by the side, so a case takes one.

/** A case of a node type of `VALUE_RULES` that holds a token with whitespace at an end. */
interface ValueCase extends WhitespaceCase {
  /** The type of the node whose value the case breaks. */
  readonly type: string
}

const JOINED = "the texts of its tokens joined are not its written text"

const LINE_SEPARATOR = String.fromCodePoint(0x2028)

const VALUE_CASES: readonly ValueCase[] = [
  {
    type: "StringLiteral",
    name: "a StringLiteral reports the whitespace taken off the end of the StringFragment token before a comment line",
    diagram: "class",
    fixture: "db-note-comment-line-inside-string",
    token: { type: "StringFragment", value: '"a\n' },
    side: "end",
    problems: [
      {
        where: "StringLiteral at 32-42",
        message: `${JOINED}: "ab", not "a\\nb"`,
      },
    ],
  },
  {
    type: "FlowchartLabel",
    name: "a FlowchartLabel reports the whitespace taken off the end of the RawText token before a comment line",
    diagram: "common",
    fixture: "comment-percent-space-line-in-label",
    token: { type: "RawText", value: "a\n" },
    side: "end",
    problems: [
      {
        where: "FlowchartLabel at 15-22",
        message: `${JOINED}: "ab", not "a\\nb"`,
      },
    ],
  },
  {
    type: "FlowchartDataBlock",
    name: "a FlowchartDataBlock reports the whitespace taken off the start of the RawText token between its braces",
    diagram: "flowchart",
    fixture: "db-data-after-next-vertex",
    token: { type: "RawText", value: " label: x " },
    side: "start",
    problems: [
      {
        where: "FlowchartDataBlock at 14-27",
        message: `${JOINED}: "label: x ", not " label: x "`,
      },
    ],
  },
  {
    type: "FlowchartLiteral",
    name: "a FlowchartLiteral reports the whitespace taken off the start of the RawText token after a `;` that the line rule ignores",
    diagram: "common",
    fixture: "entity-style-semicolon-between-statements",
    token: { type: "RawText", value: " style B fill:#0f0" },
    side: "start",
    problems: [
      {
        where: "FlowchartLiteral at 25-53",
        message: `${JOINED}: "fill:#f00style B fill:#0f0", not "fill:#f00 style B fill:#0f0"`,
      },
    ],
  },
  {
    type: "FlowchartIgnoredText",
    name: "a FlowchartIgnoredText reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "flowchart",
    fixture: "tokens-ignored-text-directive-before-direction",
    token: { type: "RawText", value: "A-->B a " },
    side: "end",
    problems: [
      {
        where: "FlowchartIgnoredText at 15-39",
        message:
          "the whitespace between RawText at 15-22 and RawText at 37-39, next to a cut, lies in no token",
      },
    ],
  },
  {
    type: "SequenceBoxText",
    // The box text is `aqua`, two spaces, and a line separator, which are
    // two RawText tokens.
    name: "a SequenceBoxText reports the whitespace taken off the start of the RawText token of two spaces that follows its colour",
    diagram: "sequence",
    fixture: "db-box-colour-then-spaces-and-line-separator",
    token: { type: "RawText", value: "  " },
    side: "start",
    problems: [
      {
        where: "RawText at 25-26",
        message:
          "starts with whitespace or a line terminator where no value starts",
      },
      {
        where: "SequenceBoxText at 20-27",
        message: `${JOINED}: "aqua ${LINE_SEPARATOR}", not "aqua  ${LINE_SEPARATOR}"`,
      },
    ],
  },
  {
    type: "SequenceIdentifier",
    name: "a SequenceIdentifier reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "sequence",
    fixture: "tokens-directive-participant-spaces",
    token: { type: "RawText", value: "A " },
    side: "end",
    problems: [
      {
        where: "SequenceIdentifier at 30-48",
        message: `${JOINED}: "A B", not "A  B"`,
      },
    ],
  },
  {
    type: "SequenceLiteral",
    name: "a SequenceLiteral reports the whitespace taken off the end of the RawText token before a directive line",
    diagram: "sequence",
    fixture: "db-acc-descr-block-directive-line",
    token: { type: "RawText", value: "a\n" },
    side: "end",
    problems: [
      {
        where: "SequenceLiteral at 27-45",
        message: `${JOINED}: "a\\nb", not "a\\n\\nb"`,
      },
    ],
  },
  {
    type: "SequenceDataBlock",
    name: "a SequenceDataBlock reports the whitespace taken off the start of the RawText token between its braces",
    diagram: "sequence",
    fixture: "db-data-block-alias-and-as",
    token: { type: "RawText", value: ' "alias": "Q" ' },
    side: "start",
    problems: [
      {
        where: "SequenceDataBlock at 29-46",
        message: `${JOINED}: "\\"alias\\": \\"Q\\" ", not " \\"alias\\": \\"Q\\" "`,
      },
    ],
  },
  {
    type: "ClassLiteral",
    name: "a ClassLiteral reports the whitespace taken off the start of the RawText token after a `;` that the line rule ignores",
    diagram: "class",
    fixture: "tokens-member-ignored-semicolon-inside",
    token: { type: "RawText", value: " b" },
    side: "start",
    problems: [
      {
        where: "ClassLiteral at 24-37",
        message: `${JOINED}: "x style:#ab", not "x style:#a b"`,
      },
    ],
  },
  {
    type: "ClassLiteral",
    name: "a ClassLiteral of a style, whose value is its units joined, reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "class",
    fixture: "tokens-style-directive-inside-label",
    token: { type: "RawText", value: "fill: " },
    side: "end",
    problems: [
      {
        where: "ClassLiteral at 29-54",
        message:
          'value is not the texts of its tokens joined: "fill:  #f00", not "fill: #f00"',
      },
    ],
  },
  {
    type: "ClassIgnoredText",
    name: "a ClassIgnoredText reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "class",
    fixture: "tokens-ignored-text-directive-after-direction",
    token: { type: "RawText", value: "x " },
    side: "end",
    problems: [
      {
        where: "ClassIgnoredText at 28-46",
        message:
          "the whitespace between RawText at 28-29 and RawText at 44-46, next to a cut, lies in no token",
      },
    ],
  },
  {
    type: "StateLiteral",
    name: "a StateLiteral reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "state",
    fixture: "db-acc-title-directive-in-text",
    token: { type: "RawText", value: "x " },
    side: "end",
    problems: [
      {
        where: "StateLiteral at 26-44",
        message: `${JOINED}: "x y", not "x  y"`,
      },
    ],
  },
  {
    type: "ErIdentifier",
    name: "an ErIdentifier reports the whitespace taken off the end of the Identifier token that ends with a U+00A0",
    diagram: "er",
    fixture: "lex-name-trailing-nbsp",
    token: { type: "Identifier", value: "A\u00a0" },
    side: "end",
    problems: [
      {
        where: "ErDiagram at 0-12",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "ErEntityStatement at 10-12",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "ErIdentifier at 10-12",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "Root.body",
        message:
          "does not run from its first token to its last: [0,12], not [0,11]",
      },
      {
        where: "ErIdentifier at 10-12",
        message: `${JOINED}: "A", not "A\u00a0"`,
      },
    ],
  },
  {
    type: "ErLiteral",
    name: "an ErLiteral reports the whitespace taken off the end of the RawText token before a directive line",
    diagram: "er",
    fixture: "db-acc-descr-block-directive-line",
    token: { type: "RawText", value: "a\n    " },
    side: "end",
    problems: [
      {
        where: "ErLiteral at 27-68",
        message: `${JOINED}: "a\\n    b", not "a\\n    \\n    b"`,
      },
    ],
  },
  {
    type: "GanttLiteral",
    name: "a GanttLiteral reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "gantt",
    fixture: "tokens-unclosed-directive-in-title",
    token: { type: "RawText", value: "T " },
    side: "end",
    problems: [
      {
        where: "GanttDiagram at 0-14",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "GanttTitleStatement at 6-14",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "GanttLiteral at 12-14",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "Root.body",
        message:
          "does not run from its first token to its last: [0,14], not [0,13]",
      },
      {
        where: "GanttLiteral at 12-14",
        message: `${JOINED}: "T", not "T "`,
      },
    ],
  },
  {
    type: "JourneyLiteral",
    name: "a JourneyLiteral reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "journey",
    fixture: "tokens-unclosed-directive-in-title",
    token: { type: "RawText", value: "T " },
    side: "end",
    problems: [
      {
        where: "JourneyDiagram at 0-18",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "JourneyTitleStatement at 10-18",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "JourneyLiteral at 16-18",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "Root.body",
        message:
          "does not run from its first token to its last: [0,18], not [0,17]",
      },
      {
        where: "JourneyLiteral at 16-18",
        message: `${JOINED}: "T", not "T "`,
      },
    ],
  },
  {
    type: "JourneyIgnoredText",
    name: "a JourneyIgnoredText reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "journey",
    fixture: "lex-directive-after-space-in-ignored-data",
    token: { type: "RawText", value: ": a " },
    side: "end",
    problems: [
      {
        where: "JourneyIgnoredText at 18-37",
        message: `${JOINED}: ": ab", not ": a b"`,
      },
    ],
  },
  {
    type: "MindmapLiteral",
    name: "a MindmapLiteral reports the whitespace taken off the end of the RawText token of a node text",
    diagram: "mindmap",
    fixture: "db-node-trailing-whitespace",
    token: { type: "RawText", value: "root   " },
    side: "end",
    problems: [
      {
        where: "MindmapLiteral at 10-17",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "MindmapLiteral at 10-17",
        message: `${JOINED}: "root", not "root   "`,
      },
    ],
  },
  {
    type: "MindmapLabel",
    name: "a MindmapLabel reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "mindmap",
    fixture: "lex-directive-in-shape-text-with-spaces",
    token: { type: "RawText", value: " x " },
    side: "end",
    problems: [
      {
        where: "MindmapLabel at 12-45",
        message: `${JOINED}: "  x ", not "  x  "`,
      },
    ],
  },
  {
    type: "TimelineLiteral",
    name: "a TimelineLiteral reports the whitespace taken off the end of the RawText token of a period",
    diagram: "timeline",
    fixture: "db-period-trailing-spaces",
    token: { type: "RawText", value: "a   " },
    side: "end",
    problems: [
      {
        where: "TimelineDiagram at 0-15",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "TimelinePeriodStatement at 11-15",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "TimelineLiteral at 11-15",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "Root.body",
        message:
          "does not run from its first token to its last: [0,15], not [0,12]",
      },
      {
        where: "TimelineLiteral at 11-15",
        message: `${JOINED}: "a", not "a   "`,
      },
    ],
  },
  {
    type: "TimelineLiteral",
    name: "a TimelineLiteral reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "timeline",
    fixture: "lex-directive-at-end-of-period-line",
    token: { type: "RawText", value: "a " },
    side: "end",
    problems: [
      {
        where: "TimelinePeriodStatement at 11-13",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "TimelineLiteral at 11-13",
        message: "does not run from the start of a token to the end of a token",
      },
      {
        where: "TimelineLiteral at 11-13",
        message: `${JOINED}: "a", not "a "`,
      },
    ],
  },
  {
    type: "RequirementLiteral",
    name: "a RequirementLiteral reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "requirement",
    fixture: "lex-directive-after-space-in-value",
    token: { type: "RawText", value: "a " },
    side: "end",
    problems: [
      {
        where: "RequirementLiteral at 41-58",
        message: `${JOINED}: "ab", not "a b"`,
      },
    ],
  },
  {
    type: "RequirementIdentifier",
    name: "a RequirementIdentifier reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "requirement",
    fixture: "lex-directive-after-space-in-name",
    token: { type: "RawText", value: "a " },
    side: "end",
    problems: [
      {
        where: "RequirementIdentifier at 31-48",
        message: `${JOINED}: "ab", not "a b"`,
      },
    ],
  },
  {
    type: "RequirementIgnoredText",
    name: "a RequirementIgnoredText reports the whitespace taken off the end of the RawText token before a directive",
    diagram: "requirement",
    fixture: "lex-directive-after-space-in-direction-text",
    token: { type: "RawText", value: "foo " },
    side: "end",
    problems: [
      {
        where: "RequirementIgnoredText at 19-40",
        message:
          "the whitespace between RawText at 19-22 and RawText at 37-40, next to a cut, lies in no token",
      },
    ],
  },
]

/** A node type of `VALUE_RULES` whose tokens hold no whitespace at an end, a fixture that has such a node, and the reason. */
interface TypeWithoutTokenWhitespace {
  readonly diagram: DiagramType
  readonly fixture: string
  readonly reason: string
}

/** The node types of `VALUE_RULES` that no case above takes: their tokens never start or end with whitespace, so that there is no whitespace to take off. */
const TYPES_WITHOUT_TOKEN_WHITESPACE: Readonly<
  Record<string, TypeWithoutTokenWhitespace>
> = {
  Identifier: {
    diagram: "flowchart",
    fixture: "db-arrow-double",
    reason: "its units hold no whitespace (ast.md, Identifier)",
  },
  ClassIdentifier: {
    diagram: "class",
    fixture: "gram-name-alone",
    reason:
      "its tokens are the runs of its units without whitespace (ast/class.md, ClassIdentifier)",
  },
  NumericLiteral: {
    diagram: "sequence",
    fixture: "db-autonumber-start",
    reason: "its token is a number",
  },
  FlowchartArrow: {
    diagram: "flowchart",
    fixture: "db-arrow-double",
    reason: "its token is an arrow",
  },
  FlowchartOpeningArrow: {
    diagram: "flowchart",
    fixture: "db-arrow-double",
    reason: "its token is an arrow",
  },
  FlowchartShape: {
    diagram: "flowchart",
    fixture: "db-vertex-label-redefined",
    reason:
      "its own tokens are the punctuators of its delimiters; the text between them is the FlowchartLabel inside it",
  },
  SequenceArrow: {
    diagram: "sequence",
    fixture: "lex-id-run-cross-arrow",
    reason: "its token is an arrow",
  },
  ClassArrow: {
    diagram: "class",
    fixture: "gram-relation-three-dashes",
    reason: "its tokens are the parts of an arrow",
  },
  StateIgnoredStatement: {
    diagram: "state",
    fixture: "gram-state-empty-string-alone",
    reason: "its tokens are words and strings",
  },
  StateIgnoredText: {
    diagram: "state",
    fixture: "gram-state-empty-string-before-name",
    reason: "its tokens are words and strings",
  },
  SequenceIgnoredStatement: {
    diagram: "sequence",
    fixture: "lex-invalid-line-two-units",
    reason: "its tokens are single characters and words",
  },
  ErIgnoredText: {
    diagram: "er",
    fixture: "lex-direction-line-text-before",
    reason: "its tokens are words and empty backquotes",
  },
  SankeyIdentifier: {
    diagram: "sankey",
    fixture: "db-fields-trimmed",
    reason:
      "its token is the field without the whitespace at its ends; only a field of whitespace only has a token of whitespace (ast/sankey.md, SankeyIdentifier)",
  },
  SankeyLiteral: {
    diagram: "sankey",
    fixture: "db-fields-trimmed",
    reason:
      "its token is the field without the whitespace at its ends; only a field of whitespace only has a token of whitespace (ast/sankey.md, SankeyLiteral)",
  },
}

describe("whitespace taken off an end of a token that a value node holds", () => {
  expectWhitespaceCases(VALUE_CASES)

  it("is a case or an exception for every node type of the rules of the values, and for no other", () => {
    const types = [
      ...new Set(VALUE_CASES.map((valueCase) => valueCase.type)),
      ...Object.keys(TYPES_WITHOUT_TOKEN_WHITESPACE),
    ]
    expect(types.sort()).toEqual(
      Object.keys(VALUE_RULES).filter(mayHaveRecordedTrees).sort(),
    )
  })

  for (const [type, exception] of Object.entries(
    TYPES_WITHOUT_TOKEN_WHITESPACE,
  )) {
    it(`has no token with whitespace at an end in a ${type}: ${exception.reason}`, () => {
      const { input, tree } = recordedTree(exception.diagram, exception.fixture)
      const holders = nodesOf(tree).filter((node) => node.type === type)
      expect(holders.length, exception.fixture).toBeGreaterThan(0)
      const withWhitespace = tree.tokens
        .filter((token) =>
          holders.some(
            (node) =>
              node.range[0] <= token.range[0] &&
              token.range[1] <= node.range[1],
          ),
        )
        .filter(
          (token) =>
            isWhitespaceAt(input, token.range[0]) ||
            isWhitespaceAt(input, token.range[1] - 1),
        )
        .map((token) => `${token.type} at ${token.range[0]}-${token.range[1]}`)
      expect(withWhitespace, exception.fixture).toEqual([])
    })
  }
})

// ast.md, Nodes, and parser/docs/tokens.md, Comment: a diagram comment that a
// comment line cuts runs from its mark to the end of its line, across the
// comment lines and the fragment after them, so that the value of a node of
// text that mermaid.js does not read leaves out all of it: the whitespace
// before a U+2028 or U+2029, the separator itself, the whitespace after the
// region, and what is left of the line when nothing but whitespace follows.

/**
 * The state fixtures of such comments: the classes are a U+2028 and a U+2029,
 * for `%%` and for `#`, a space before the separator, spaces after the
 * region, a line of spaces after it, and a fragment that ends with a space.
 */
const CUT_COMMENT_FIXTURES: readonly string[] = [
  "tokens-ignored-text-comment-cut-by-comment-line",
  "tokens-ignored-text-comment-cut-by-comment-line-paragraph-separator",
  "tokens-ignored-text-comment-cut-fragment-trailing-space",
  "tokens-ignored-text-comment-cut-space-before-separator",
  "tokens-ignored-text-comment-cut-spaces-after-region",
  "tokens-ignored-text-comment-cut-spaces-line-after-region",
  "tokens-ignored-text-hash-comment-cut-by-comment-line",
  "tokens-ignored-text-hash-comment-cut-by-comment-line-paragraph-separator",
]

// parser/docs/tokens.md, Comment: a diagram comment, and the fragment after a
// comment line that cuts it, ends before the line terminator that ends its
// line, which is a line feed, a CRLF, or a lone CR, or at the end of the text.
// The fixtures below are the input of
// `tokens-ignored-text-comment-cut-by-comment-line`, whose line terminator
// after the fragment `[*]` is a line feed, with a CRLF and with a lone CR in
// its place, and with the text ended after the fragment.

/** The fixture whose line terminator after the fragment is a CRLF. */
const CUT_COMMENT_ENDING_AT_CRLF = "tokens-ignored-text-comment-cut-end-crlf"

/** The fixture whose line terminator after the fragment is a lone CR. */
const CUT_COMMENT_ENDING_AT_CR = "tokens-ignored-text-comment-cut-end-cr"

/** The fixture whose text ends after the fragment. */
const CUT_COMMENT_ENDING_AT_END_OF_TEXT =
  "tokens-ignored-text-comment-cut-end-of-text"

describe("the value of a node of text that mermaid.js does not read, with a diagram comment that a comment line cuts", () => {
  it("is accepted in the recorded tree of each fixture of such a comment, with each end of its line", () => {
    for (const fixture of [
      ...CUT_COMMENT_FIXTURES,
      CUT_COMMENT_ENDING_AT_CRLF,
      CUT_COMMENT_ENDING_AT_CR,
      CUT_COMMENT_ENDING_AT_END_OF_TEXT,
    ]) {
      const { input, tree } = recordedTree("state", fixture)
      expect(checkTree(input, tree), fixture).toEqual([])
    }
  })

  it("is reported when it keeps what lies between the comments of the diagram comment", () => {
    const unreported: string[] = []
    for (const fixture of [
      ...CUT_COMMENT_FIXTURES,
      CUT_COMMENT_ENDING_AT_CRLF,
      CUT_COMMENT_ENDING_AT_CR,
    ]) {
      const { input, tree } = recordedTree("state", fixture)
      const written = new WrittenText(input, tree)
      const ignoredTexts = nodesOf(tree).filter((node) =>
        node.type.endsWith("IgnoredText"),
      )
      for (const node of ignoredTexts) {
        // The value that leaves out the comments only, one by one, as the
        // comment lines and the fragments are recorded.
        const commentsOnly = written.of(
          node.range,
          tree.comments
            .filter(
              (comment) =>
                node.range[0] <= comment.range[0] &&
                comment.range[1] <= node.range[1],
            )
            .map((comment) => comment.range),
        )
        // Every one of these fixtures keeps something between its comments.
        if (commentsOnly === node.value) {
          unreported.push(`${fixture}: the value keeps nothing between them`)
          continue
        }
        ;(node as Record<string, unknown>).value = commentsOnly
        if (checkTree(input, tree).length === 0) {
          unreported.push(`${fixture}: ${JSON.stringify(commentsOnly)}`)
        }
      }
    }
    expect(unreported).toEqual([])
  })

  it("is reported, with its own message, when the line terminator that ends the comment is another one in the value", () => {
    // The line terminator that ends the diagram comment is part of the value
    // as written: a CRLF is not a line feed, and a lone CR is not one.
    for (const [fixture, written, other] of [
      [CUT_COMMENT_ENDING_AT_CRLF, "\r\n", "\n"],
      [CUT_COMMENT_ENDING_AT_CR, "\r", "\n"],
    ] as const) {
      const { input, tree } = recordedTree("state", fixture)
      const ignoredText = nodesOf(tree).find(
        (node) => node.type === "StateIgnoredText",
      ) as (CheckedNode & { value: string }) | undefined
      if (ignoredText === undefined) throw new Error(`${fixture}: no text`)
      const right = ignoredText.value
      expect(right, fixture).toContain(written)
      const wrong = right.replace(written, other)
      ignoredText.value = wrong
      expect(checkTree(input, tree), fixture).toEqual([
        {
          where: `StateIgnoredText at ${ignoredText.range[0]}-${ignoredText.range[1]}`,
          message: `value is not its written text: ${JSON.stringify(wrong)}, not ${JSON.stringify(right)}`,
        },
      ])
    }
  })
})
