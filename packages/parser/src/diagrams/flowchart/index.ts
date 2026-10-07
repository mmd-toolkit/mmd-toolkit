import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { FlowchartText } from "./flowchart-text.ts"
import { FlowchartGrammar } from "./grammar.ts"
import type { FlowchartLexing } from "./units.ts"
import { UnitLexer } from "./units.ts"

/** The diagram text of a flowchart and what the lexer read from it. */
export interface FlowchartUnits extends FlowchartLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/flowchart.md, Lexical structure: the units of the diagram text of
 * `input`, read with the rule of Whitespace after `}`, with what else the
 * lexer read (see `FlowchartLexing`). Not public API: the tests read the
 * source through the same units.
 */
export function lexFlowchart(input: DiagramInput): FlowchartUnits {
  const text = openDiagramText(input)
  const lexing = new UnitLexer(new FlowchartText(text), input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/flowchart.md: the parser of the diagram types `flowchart-v2`,
 * `flowchart-elk`, and `swimlane`, which share one grammar. It reads the
 * diagram text, which has no directives, with the rule of Whitespace after
 * `}`: the lexer of Lexical structure divides it into units, and the
 * grammar of Grammar makes the statements and the tokens from them. The common part finishes the tree (see
 * `finishDiagram`).
 */
export function parseFlowchartDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexFlowchart(input)
  const syntax = new FlowchartGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      // The flowchart lexer reads no diagram comments (diagrams/flowchart.md,
      // Lexical structure, has no rule for one); the bare `%%` lines before
      // the header are comments (common.md, Diagram detection).
      comments: commentsBefore,
    },
    // ast/flowchart.md, FlowchartDiagram: its tokens are all the tokens of
    // the diagram text, from the header keyword to the last token.
    (place) => ({
      type: "FlowchartDiagram",
      direction: syntax.direction,
      body: syntax.body,
      ...place,
    }),
  )
}
