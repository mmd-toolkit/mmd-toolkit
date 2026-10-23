import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { UsecaseGrammar } from "./grammar.ts"
import type { UsecaseLexing } from "./units.ts"
import { UsecaseUnitLexer } from "./units.ts"

/** The shared text reader and specification's lexical units, also available to fixture helpers. */
export interface UsecaseUnits extends UsecaseLexing {
  readonly text: DiagramTextReader
}

/** diagrams/usecase.md, Lexical structure; not public API. */
export function lexUsecase(input: DiagramInput): UsecaseUnits {
  const text = openDiagramText(input)
  return { text, ...new UsecaseUnitLexer(text, input.lexer.lines).lex() }
}

/** Usecase syntax and model validation followed by shared token recording and atomic-boundary checks. */
export function parseUsecaseDiagram(input: DiagramInput): Root {
  const comments = commentsBeforeHeader(input)
  const lexing = lexUsecase(input)
  const syntax = new UsecaseGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => ({ type: "UsecaseDiagram", body: syntax.body, ...place }),
  )
}
