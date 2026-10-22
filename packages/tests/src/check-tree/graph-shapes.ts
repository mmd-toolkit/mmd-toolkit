/**
 * diagrams/flowchart.md and diagrams/agentflow.md, Shapes: the rows of the table of shapes: the name of
 * each, the text of its opening, and the texts of the closings that it may
 * have. Each opening and each closing is one `Punctuator` token (parser/docs/
 * tokens/flowchart.md and tokens/agentflow.md, Tokens).
 */
export interface GraphShapeRow {
  readonly name: string
  readonly opening: string
  readonly closings: readonly string[]
}

/** The `backslash-end` unit of the slanted context (diagrams/flowchart.md, The slanted context, rule 3): one of these characters followed by `]`. */
const BACKSLASH_ENDS: readonly string[] = ["\\]", "(]", "?]", "=]", "]]", ")]"]

/** The `slash-end` unit of the slanted context. */
const SLASH_ENDS: readonly string[] = ["/]"]

/** The `ellipse-end` unit of the ellipse context. */
const ELLIPSE_ENDS: readonly string[] = ["-)", "/)", "))"]

export const GRAPH_SHAPES: readonly GraphShapeRow[] = [
  { name: "rectangle", opening: "[", closings: ["]"] },
  { name: "rounded", opening: "(", closings: [")"] },
  { name: "circle", opening: "((", closings: ["))"] },
  { name: "double-circle", opening: "(((", closings: [")))"] },
  { name: "diamond", opening: "{", closings: ["}"] },
  { name: "hexagon", opening: "{{", closings: ["}}"] },
  { name: "stadium", opening: "([", closings: ["])"] },
  { name: "framed-rectangle", opening: "[[", closings: ["]]"] },
  { name: "cylinder", opening: "[(", closings: [")]"] },
  { name: "odd", opening: ">", closings: ["]"] },
  { name: "ellipse", opening: "(-", closings: ELLIPSE_ENDS },
  { name: "trapezoid-bottom", opening: "[/", closings: BACKSLASH_ENDS },
  { name: "lean-right", opening: "[/", closings: SLASH_ENDS },
  { name: "trapezoid-top", opening: "[\\", closings: SLASH_ENDS },
  { name: "lean-left", opening: "[\\", closings: BACKSLASH_ENDS },
  { name: "rectangle", opening: "[|", closings: ["]"] },
]
