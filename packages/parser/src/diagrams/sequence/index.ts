import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { SequenceDbRejections } from "./db-rejections.ts"
import { SequenceGrammar } from "./grammar.ts"
import type { SequenceLexing } from "./units.ts"
import { SequenceUnitLexer } from "./units.ts"

/** The diagram text of a sequence diagram and what the lexer read from it. */
export interface SequenceUnits extends SequenceLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/sequence.md, Lexical structure: the units of the diagram text of
 * `input`, with what else the lexer read (see `SequenceLexing`). Not
 * public API: the tests read the source through the same units.
 */
export function lexSequence(input: DiagramInput): SequenceUnits {
  const text = openDiagramText(input)
  const lexing = new SequenceUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/sequence.md: the parser of the diagram type `sequence`. The
 * lexer of Lexical structure divides the diagram text into units and finds
 * its diagram comments, the grammar of Grammar makes the statements and
 * the tokens from them, and the walk of Rejections
 * outside the grammar rejects what mermaid.js rejects while it builds the
 * Db. The common part finishes the tree (see `finishDiagram`).
 */
export function parseSequenceDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexSequence(input)
  const syntax = new SequenceGrammar(lexing, input.lexer).parseDiagram()
  new SequenceDbRejections(input.lexer.lines).check(syntax.body)
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/sequence.md, SequenceDiagram: the range runs from the keyword to
    // the last token of the diagram.
    (place) => ({ type: "SequenceDiagram", body: syntax.body, ...place }),
  )
}
