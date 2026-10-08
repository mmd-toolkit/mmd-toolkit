import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { ErGrammar } from "./grammar.ts"
import type { ErLexing } from "./units.ts"
import { ErUnitLexer } from "./units.ts"

/** The diagram text of an ER diagram and what the lexer read from it. */
export interface ErUnits extends ErLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/er.md, Lexical structure: the units of the diagram text of
 * `input`. Not public API: the tests read the source through the same
 * units.
 */
export function lexEr(input: DiagramInput): ErUnits {
  const text = openDiagramText(input)
  const lexing = new ErUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/er.md: the parser of the diagram type `er`. The lexer of
 * Lexical structure divides the diagram text into units, and the grammar
 * of Grammar makes the statements and the tokens from them; the Db throws
 * for no input (Rejections outside the grammar). The common part finishes
 * the tree (see `finishDiagram`).
 */
export function parseErDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexEr(input)
  const syntax = new ErGrammar(lexing.units, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      // diagrams/er.md, Comments: the ER lexer reads no diagram comments;
      // the bare `%%` lines before the header are comments (common.md,
      // Diagram detection).
      comments: commentsBefore,
    },
    // ast/er.md, ErDiagram: the range runs from the header keyword to the
    // last token of the diagram.
    (place) => ({ type: "ErDiagram", body: syntax.body, ...place }),
  )
}
