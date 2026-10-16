import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { BlockGrammar } from "./grammar.ts"
import type { BlockLexing } from "./units.ts"
import { BlockUnitLexer } from "./units.ts"

/** The diagram text of a block diagram and what the lexer read from it. */
export interface BlockUnits extends BlockLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/block.md, Lexical structure: the units of the diagram text of
 * `input`. Not public API: the tests read the source through the same
 * units.
 */
export function lexBlock(input: DiagramInput): BlockUnits {
  const text = openDiagramText(input)
  const lexing = new BlockUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/block.md: the parser of the diagram type `block`. The lexer of
 * Lexical structure divides the diagram text into units, and the grammar
 * of Grammar makes the statements and the tokens from them, with the
 * rejection of a `style` outside the grammar. The common part finishes the
 * tree (see `finishDiagram`).
 */
export function parseBlockDiagram(input: DiagramInput): Root {
  const lexing = lexBlock(input)
  const syntax = new BlockGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: commentsBeforeHeader(input) },
    // ast/block.md, BlockDiagram: the range runs from the header keyword to
    // the last token of the diagram.
    (place) => ({ type: "BlockDiagram", body: syntax.body, ...place }),
  )
}
