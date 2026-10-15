import { CLASS_CLASSIFIER_MARKS, CLASS_VISIBILITY_MARKS } from "./class.ts"
import { FLOWCHART_SHAPES } from "./flowchart-shapes.ts"
import { MINDMAP_PUNCTUATORS } from "./mindmap.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import { diagramTokensOf } from "./invariants.ts"
import type { CheckedRoot } from "./types.ts"
import { TIMELINE_PUNCTUATORS } from "./timeline.ts"
import { reportCutEntries } from "./tokens.ts"
import { nodesOf } from "./walk.ts"

// parser/docs/tokens/<diagram>.md, Tokens: the `Punctuator` tokens of a
// diagram, by their text. A unit of a diagram that is a delimiter, a
// separator, or an operator is one token, and a directive or an ignored `;`
// does not cut it (parser/docs/tokens.md, A token that a directive cuts: only
// a `String` and a `RawText` token can be cut). A tree that cuts one into two
// tokens has two tokens whose texts the table lacks, or a token of a text
// that is the whole of another entry glued to the next by the cut.

/** The text of each opening and closing of a shape (ast/flowchart.md, FlowchartShape; diagrams/flowchart.md, Shapes). */
const FLOWCHART_SHAPE_DELIMITERS: readonly string[] = FLOWCHART_SHAPES.flatMap(
  (shape) => [shape.opening, ...shape.closings],
)

/**
 * The texts of the `Punctuator` tokens that no arrow node holds, by the type
 * of the body of the diagram: the row `Punctuator` of the table of Tokens of
 * parser/docs/tokens/<diagram>.md, one entry for each text. The arrows are
 * checked with their nodes (an arrow of a flowchart or a sequence is one
 * token, a relation end and the line of a class arrow are one token each).
 * `tests/check-tree-punctuators.test.ts` requires the table to agree with
 * that row.
 */
export const PUNCTUATOR_TEXTS: Readonly<Record<string, readonly string[]>> = {
  FlowchartDiagram: [
    ...FLOWCHART_SHAPE_DELIMITERS,
    "|",
    ":",
    "&",
    ":::",
    ",",
    ";",
    "@",
    "@{",
    "}",
    "{",
    "(",
    ")",
  ],
  SequenceDiagram: ["()", "+", "-", ",", ":", ";", "@{", "{", "}"],
  ClassDiagram: [
    ":",
    "{",
    "}",
    "[",
    "]",
    ":::",
    "<<",
    ">>",
    "~",
    "(",
    ")",
    ",",
    ...CLASS_VISIBILITY_MARKS.keys(),
    ...CLASS_CLASSIFIER_MARKS.keys(),
  ],
  StateDiagram: ['"', ",", "--", "-->", ":", ":::", "[*]", "{", "}"],
  ErDiagram: [
    "{",
    "}",
    "[",
    "]",
    ":::",
    ":",
    ",",
    "?",
    ";",
    // The cardinalities and the relationship lines written with symbols.
    "|o",
    "}o",
    "}|",
    "||",
    "o|",
    "o{",
    "|{",
    "1+",
    "0+",
    "1",
    "..",
    "--",
    ".-",
    "-.",
  ],
  GanttDiagram: [":", ",", "{", "}", "(", ")"],
  JourneyDiagram: [":", ",", "{", "}"],
  // The row `Punctuator` of parser/docs/tokens/requirement.md.
  RequirementDiagram: [":", ",", "{", "}", ":::", "-", "->", "<-"],
  // The row `Punctuator` of parser/docs/tokens/mindmap.md.
  MindmapDiagram: MINDMAP_PUNCTUATORS,
  // The row `Punctuator` of parser/docs/tokens/timeline.md.
  TimelineDiagram: TIMELINE_PUNCTUATORS,
  // The row `Punctuator` of parser/docs/tokens/sankey.md.
  SankeyDiagram: [","],
  ErrorDiagram: [],
}

/** The node types whose range holds the tokens of an arrow, which the check of the node reads. */
const ARROW_NODE_TYPES: ReadonlySet<string> = new Set([
  "FlowchartArrow",
  "FlowchartOpeningArrow",
  "SequenceArrow",
  "ClassArrow",
])

/**
 * Checks that a directive or an ignored `;` cuts no `Punctuator` token: the
 * text of each `Punctuator` token outside the arrows is one that its diagram
 * has, and no run of two tokens or more that cuts glue together is the
 * fragments of an entry (`:`, `::`, and `:` for `:::`, `@` and `{` for `@{`),
 * whatever token the cut attaches to the run (`)` and `:::` in
 * `A(x)%%{init: {}}%%:::c`). A shape's opening and closing are checked with
 * the shape.
 */
export function checkPunctuatorsAreWhole(
  root: CheckedRoot,
  problems: Problems,
): void {
  const texts = PUNCTUATOR_TEXTS[root.body.type] ?? []
  const arrows = nodesOf(root).filter((node) => ARROW_NODE_TYPES.has(node.type))
  const punctuators = diagramTokensOf(root).filter(
    (token) =>
      token.type === "Punctuator" &&
      !arrows.some(
        (arrow) =>
          arrow.range[0] <= token.range[0] && token.range[1] <= arrow.range[1],
      ),
  )
  for (const token of punctuators) {
    problems.expect(
      texts.includes(token.value),
      label(token),
      `the Punctuator text ${JSON.stringify(token.value)} is none of those of a ${root.body.type}`,
    )
  }
  reportCutEntries(
    root,
    punctuators,
    (joined) => texts.includes(joined),
    problems,
  )
}
