import { isWhitespace } from "./characters.ts"

// The shape, direction and style readings explicitly shared by flowchart and Agentflow.

/** The text `text` without the whitespace at its end. */
function withoutWhitespaceAtEnd(text: string): string {
  let end = text.length
  while (end > 0 && isWhitespace(text.charCodeAt(end - 1))) end -= 1
  return text.slice(0, end)
}

/**
 * The summary: the style values of vertices, classes, edges, and the edge
 * defaults without the whitespace at their end, which the summary drops.
 */
export function styleValues(values: readonly string[]): string[] {
  return values.map(withoutWhitespaceAtEnd)
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
