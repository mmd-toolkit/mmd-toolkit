import { isWhitespace } from "./characters.ts"
import type { ConvertedText } from "./converted-text.ts"
import type {
  FlowchartClassDefStatement,
  FlowchartDefaultLinkStyleStatement,
  FlowchartLinkStyleStatement,
  FlowchartStyleStatement,
  FlowchartStatement,
} from "./flowchart-tree.ts"
import type {
  AgentflowClassDefStatement,
  AgentflowDefaultLinkStyleStatement,
  AgentflowLinkStyleStatement,
  AgentflowStyleStatement,
  AgentflowStatement,
} from "./agentflow-tree.ts"
import type { TreeRange } from "./tree.ts"

// The shape, direction and style readings explicitly shared by flowchart and Agentflow.

/** The graph statements whose styles have the same whitespace reading. */
type StatementWithStyles =
  | FlowchartStyleStatement
  | FlowchartClassDefStatement
  | FlowchartLinkStyleStatement
  | FlowchartDefaultLinkStyleStatement
  | AgentflowStyleStatement
  | AgentflowClassDefStatement
  | AgentflowLinkStyleStatement
  | AgentflowDefaultLinkStyleStatement

/** The empty description blocks, including those in nested graph bodies. */
export function emptyDescriptionBlocksOf(
  body: readonly (FlowchartStatement | AgentflowStatement)[],
): TreeRange[] {
  const blocks: TreeRange[] = []
  for (const statement of body) {
    if (
      (statement.type === "FlowchartAccDescrBlockStatement" ||
        statement.type === "AgentflowAccDescrBlockStatement") &&
      statement.closed &&
      statement.value === null
    )
      blocks.push(statement.range)
    if ("body" in statement)
      for (const range of emptyDescriptionBlocksOf(statement.body))
        blocks.push(range)
  }
  return blocks
}

/** The target or interpolation before the first style, through any trailing name-list commas. */
function stylePrefixEndOf(
  statement: StatementWithStyles,
  text: ConvertedText,
): number {
  if ("id" in statement) return statement.id.range[1]
  if ("interpolate" in statement && statement.interpolate !== null)
    return statement.interpolate.range[1]
  if ("indices" in statement)
    return statement.indices.at(-1)?.range[1] ?? statement.range[1]
  if ("cssClasses" in statement) {
    const lastName = statement.cssClasses.findLast((name) => name !== null)
    if (lastName !== undefined && lastName !== null) {
      for (const { start, codePoint } of text.from(lastName.range[1]))
        if (isWhitespace(codePoint)) return start
    }
  }
  // A default target or an all-null name list has no leaf at its end.
  // Skip the keyword's one space, then read the target to its separator.
  let afterKeyword = false
  for (const { start, codePoint } of text.from(statement.range[0])) {
    if (!isWhitespace(codePoint)) continue
    if (afterKeyword) return start
    afterKeyword = true
  }
  throw new Error("graph Db: the first style has no separator")
}

/** Styles keep the line whitespace after their ranges; null styles read only that whitespace. */
export function graphStyleValuesOf(
  statement: StatementWithStyles,
  text: ConvertedText,
  leftOut: readonly TreeRange[],
): string[] {
  let next = 0
  return statement.styles.map((style, index) => {
    const end =
      style?.range[1] ??
      (index === 0 ? stylePrefixEndOf(statement, text) : next)
    const tail = text.whitespaceFrom(end, leftOut)
    next = tail.end + 1 // The comma before the next style is one character.
    const value = style === null ? "" : text.of(style.range, leftOut)
    // The statement consumes one space before its first style.
    return (
      value + (style === null && index === 0 ? tail.value.slice(1) : tail.value)
    )
  })
}

/** Shapes: the Db type of each shape name, for `rectangle` without a property. */
const SHAPE_DB_TYPES: Readonly<Record<string, string>> = {
  rectangle: "square",
  rounded: "round",
  circle: "circle",
  "double-circle": "doublecircle",
  diamond: "diamond",
  hexagon: "hexagon",
  stadium: "stadium",
  "framed-rectangle": "subroutine",
  cylinder: "cylinder",
  odd: "odd",
  ellipse: "ellipse",
  "trapezoid-bottom": "trapezoid",
  "lean-right": "lean_right",
  "trapezoid-top": "inv_trapezoid",
  "lean-left": "lean_left",
}

/**
 * Shapes: the Db type of the shape `shape`, from its name, and `rect` for
 * a rectangle written with a property, `[|name:value|...]`.
 */
export function dbTypeOf(shape: {
  readonly name: string
  readonly property: unknown | null
}): string {
  if (shape.name === "rectangle" && shape.property !== null) return "rect"
  const type = SHAPE_DB_TYPES[shape.name]
  if (type === undefined) throw new Error(`unknown bracket shape ${shape.name}`)
  return type
}

/** Direction: the direction of the diagram that the header's direction gives. */
export function diagramDirectionOf(direction: string | null): string {
  switch (direction) {
    case null:
    case "v":
    case "TD":
      return "TB"
    case "<":
      return "RL"
    case "^":
      return "BT"
    case ">":
      return "LR"
    default:
      return direction
  }
}

/** Style statements: `classDef` reads each `\,` in a style as `,`. */
export function classDefStyleOf(style: string): string {
  return style.split("\\,").join(",")
}
