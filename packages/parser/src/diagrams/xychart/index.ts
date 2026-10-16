import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { XychartGrammar } from "./grammar.ts"
import type { XychartLexing } from "./units.ts"
import { XychartUnitLexer } from "./units.ts"

/** The diagram text of an XY chart and what the lexer read from it. */
export interface XychartUnits extends XychartLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/xychart.md, Lexical structure: the units of the diagram text of
 * `input`, with its diagram comments. Not public API: the tests read the
 * source through the same units.
 */
export function lexXychart(input: DiagramInput): XychartUnits {
  const text = openDiagramText(input)
  const lexing = new XychartUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/xychart.md: the parser of the diagram type `xychart`. The lexer
 * of Lexical structure divides the diagram text into units and finds its
 * diagram comments, and the grammar of Grammar makes the headers, the
 * statements, and the tokens from them; there is no rejection outside the
 * grammar. The common part finishes the tree (see `finishDiagram`).
 */
export function parseXychartDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexXychart(input)
  const syntax = new XychartGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/xychart.md, XychartDiagram: the range runs from the first header
    // keyword to the last token of the diagram.
    (place) => ({
      type: "XychartDiagram",
      headers: syntax.headers,
      body: syntax.body,
      ...place,
    }),
  )
}
