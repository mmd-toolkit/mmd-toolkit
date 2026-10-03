/**
 * Ties each diagram printer's list of value node types to the parser's node
 * types, so that a node type added to the tree of a diagram type is placed
 * on purpose.
 */
import { visitorKeys } from "@mmd-toolkit/parser"
import { describe, expect, it } from "vitest"
import { valueNodeTypes } from "../src/printers/flowchart-layout.ts"
import { classValueNodeTypes } from "../src/printers/class-layout.ts"
import { sequenceValueNodeTypes } from "../src/printers/sequence-layout.ts"
import { stateValueNodeTypes } from "../src/printers/state-layout.ts"

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
