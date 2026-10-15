/**
 * Ties each diagram printer's list of value node types to the parser's node
 * types, so that a node type added to the tree of a diagram type is placed
 * on purpose.
 */
import { visitorKeys } from "@mmd-toolkit/parser"
import { describe, expect, it } from "vitest"
import { valueNodeTypes } from "../src/printers/flowchart-layout.ts"
import { classValueNodeTypes } from "../src/printers/class-layout.ts"
import { erValueNodeTypes } from "../src/printers/er-layout.ts"
import { ganttValueNodeTypes } from "../src/printers/gantt-layout.ts"
import { journeyValueNodeTypes } from "../src/printers/journey-layout.ts"
import { mindmapValueNodeTypes } from "../src/printers/mindmap-layout.ts"
import { requirementValueNodeTypes } from "../src/printers/requirement-layout.ts"
import { sankeyValueNodeTypes } from "../src/printers/sankey-layout.ts"
import { sequenceValueNodeTypes } from "../src/printers/sequence-layout.ts"
import { stateValueNodeTypes } from "../src/printers/state-layout.ts"
import { timelineValueNodeTypes } from "../src/printers/timeline-layout.ts"

/** The leaf node types that every diagram type shares (ast.md, Shared leaf nodes). */
const sharedLeafTypes = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
])

const leafTypes = Object.entries(visitorKeys)
  .filter(([, keys]) => keys.length === 0)
  .map(([type]) => type)

/** A diagram printer's value node types, and its leaf types that are not values. */
interface DiagramValues {
  /** The name that the node types of the diagram type start with. */
  readonly prefix: string
  readonly values: ReadonlySet<string>
  /** The leaf node types that are not values, and how they are printed instead. */
  readonly notValues: ReadonlySet<string>
}

const diagrams: readonly DiagramValues[] = [
  {
    prefix: "Flowchart",
    values: valueNodeTypes,
    notValues: new Set([
      // A `;` of its own, printed as its token or dropped.
      "FlowchartEmptyStatement",
      // Arrows, whose range is the range of one token, printed as the token.
      "FlowchartArrow",
      "FlowchartOpeningArrow",
    ]),
  },
  {
    prefix: "Sequence",
    values: sequenceValueNodeTypes,
    notValues: new Set([
      // An arrow, whose range is the range of one token, printed as the token.
      "SequenceArrow",
    ]),
  },
  {
    prefix: "Class",
    values: classValueNodeTypes,
    notValues: new Set([
      // A name without whitespace, printed as its token.
      "Identifier",
      // A class name of several name parts, printed as its tokens.
      "ClassIdentifier",
      // An arrow, printed as its tokens, which touch.
      "ClassArrow",
    ]),
  },
  {
    prefix: "State",
    values: stateValueNodeTypes,
    notValues: new Set([
      // `[*]`, a divider `--`, and `hide empty description`, each printed
      // as its token.
      "StateTerminal",
      "StateDividerStatement",
      "StateHideEmptyDescriptionStatement",
    ]),
  },
  {
    prefix: "Er",
    values: erValueNodeTypes,
    notValues: new Set([
      // The three units of a relationship, printed as their tokens.
      "ErRelationship",
      // The node of the diagram type that fails to parse, which has no
      // statement and is no node of an ER diagram, though its name starts
      // with `Er`.
      "ErrorDiagram",
    ]),
  },
  {
    prefix: "Gantt",
    values: ganttValueNodeTypes,
    notValues: new Set([
      // Statements whose tokens are all the statement has, printed as the
      // tokens: the keyword, and the keyword and the day.
      "GanttInclusiveEndDatesStatement",
      "GanttWeekdayStatement",
      "GanttWeekendStatement",
      // A number is no node of a Gantt chart: its numbers are the text of
      // an item.
      "NumericLiteral",
    ]),
  },
  {
    prefix: "Journey",
    values: journeyValueNodeTypes,
    notValues: new Set([
      // The shared leaf nodes are no nodes of a user journey: its ids, names,
      // and numbers are the text of a score or a person.
      "Identifier",
      "StringLiteral",
      "NumericLiteral",
    ]),
  },
  {
    prefix: "Requirement",
    values: requirementValueNodeTypes,
    notValues: new Set([
      // A risk and a verification method, which are keywords: printed as
      // their tokens.
      "RequirementRiskField",
      "RequirementVerifyMethodField",
      // The shared leaf nodes that are no nodes of a requirement diagram:
      // its ids and numbers are the text of a name or a value.
      "Identifier",
      "NumericLiteral",
    ]),
  },
  {
    prefix: "Mindmap",
    values: mindmapValueNodeTypes,
    notValues: new Set([
      // The shared leaf nodes are no nodes of a mindmap: its ids, strings,
      // and numbers are the text of a node, a label, an icon, or a class.
      "Identifier",
      "StringLiteral",
      "NumericLiteral",
    ]),
  },
  {
    prefix: "Sankey",
    values: sankeyValueNodeTypes,
    notValues: new Set([
      // The shared leaf nodes that are no nodes of a sankey diagram: its ids
      // and numbers are the text of a SankeyIdentifier or a SankeyLiteral.
      "Identifier",
      "NumericLiteral",
    ]),
  },
  {
    prefix: "Timeline",
    values: timelineValueNodeTypes,
    notValues: new Set([
      // The shared leaf nodes are no nodes of a timeline: its periods, events,
      // and titles are the text of a TimelineLiteral.
      "Identifier",
      "StringLiteral",
      "NumericLiteral",
    ]),
  },
]

it("the shared leaf node types are defined by the parser", () => {
  for (const type of sharedLeafTypes) expect(leafTypes).toContain(type)
})

describe.each(diagrams)(
  "the value node types of $prefix",
  ({ prefix, values, notValues }) => {
    /**
     * The leaf node types of the diagram type: its own, whose names start
     * with the name of the diagram type (`.claude/skills/spec/SKILL.md`,
     * Policies and criteria), and the shared ones.
     */
    const ownLeafTypes = leafTypes.filter(
      (type) => type.startsWith(prefix) || sharedLeafTypes.has(type),
    )

    it("are node types of the diagram type without child fields", () => {
      for (const type of values) expect(ownLeafTypes).toContain(type)
    })

    it("leave out only node types of the diagram type without child fields", () => {
      for (const type of notValues) expect(ownLeafTypes).toContain(type)
    })

    it("are, with the listed exceptions, every such node type", () => {
      expect(
        ownLeafTypes.filter((type) => !notValues.has(type)).sort(),
      ).toEqual([...values].sort())
    })
  },
)
