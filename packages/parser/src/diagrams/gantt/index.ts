import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { GanttGrammar } from "./grammar.ts"
import type { GanttLexing } from "./units.ts"
import { GanttUnitLexer } from "./units.ts"

/** The diagram text of a Gantt chart and what the lexer read from it. */
export interface GanttUnits extends GanttLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/gantt.md, Lexical structure: the units of the diagram text of
 * `input`, with its diagram comments. Not public API: the tests read the
 * source through the same units.
 */
export function lexGantt(input: DiagramInput): GanttUnits {
  const text = openDiagramText(input)
  const lexing = new GanttUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/gantt.md: the parser of the diagram type `gantt`. The lexer of
 * Lexical structure divides the diagram text into units and finds its
 * diagram comments, and the grammar of Grammar makes the statements and
 * the tokens from them, rejecting the two inputs of Rejections outside the
 * grammar where it reads them. The common part finishes the tree (see
 * `finishDiagram`).
 */
export function parseGanttDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexGantt(input)
  const syntax = new GanttGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/gantt.md, GanttDiagram: the range runs from the header keyword to
    // the last token of the diagram.
    (place) => ({ type: "GanttDiagram", body: syntax.body, ...place }),
  )
}
