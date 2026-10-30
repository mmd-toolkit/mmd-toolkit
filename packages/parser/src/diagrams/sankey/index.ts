import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { SankeyGrammar } from "./grammar.ts"
import { SankeyText } from "./sankey-text.ts"
import type { SankeyLexing } from "./units.ts"
import { SankeyUnitLexer } from "./units.ts"

/** The diagram text of a sankey diagram and what the lexer read from it. */
export interface SankeyUnits extends SankeyLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/sankey.md, Lexical structure: the units of the diagram text of
 * `input`. Not public API: the tests read the source through the same
 * units.
 */
export function lexSankey(input: DiagramInput): SankeyUnits {
  const text = openDiagramText(input)
  const lexing = new SankeyUnitLexer(
    new SankeyText(text),
    input.lexer.lines,
  ).lex()
  return { text, ...lexing }
}

/**
 * diagrams/sankey.md: the parser of the diagram type `sankey`. The lexer of
 * Lexical structure divides the diagram text into units, and the grammar of
 * Grammar makes the links and the tokens from them; there is no rejection
 * outside the grammar. The common part finishes the tree (see
 * `finishDiagram`).
 */
export function parseSankeyDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexSankey(input)
  const syntax = new SankeyGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: commentsBefore },
    // ast/sankey.md, SankeyDiagram: the range runs from the header keyword
    // to the last token of the diagram.
    (place) => ({ type: "SankeyDiagram", body: syntax.body, ...place }),
  )
}
