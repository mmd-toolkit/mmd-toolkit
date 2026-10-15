import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { QuadrantGrammar } from "./grammar.ts"
import type { QuadrantLexing } from "./units.ts"
import { QuadrantUnitLexer } from "./units.ts"

/** The diagram text of a quadrant chart and what the lexer read from it. */
export interface QuadrantUnits extends QuadrantLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/quadrant.md, Lexical structure: the units of the diagram text
 * of `input`, with its diagram comments. Not public API: the tests read the
 * source through the same units.
 */
export function lexQuadrant(input: DiagramInput): QuadrantUnits {
  const text = openDiagramText(input)
  const lexing = new QuadrantUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/quadrant.md: the parser of the diagram type `quadrantChart`.
 * The lexer of Lexical structure divides the diagram text into units and
 * finds its diagram comments, and the grammar of Grammar makes the
 * statements and the tokens from them, with the rejection of a style
 * outside the grammar. The common part finishes the tree (see
 * `finishDiagram`).
 */
export function parseQuadrantDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexQuadrant(input)
  const syntax = new QuadrantGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/quadrant.md, QuadrantDiagram: the range runs from the header
    // keyword to the last token of the diagram.
    (place) => ({ type: "QuadrantDiagram", body: syntax.body, ...place }),
  )
}
