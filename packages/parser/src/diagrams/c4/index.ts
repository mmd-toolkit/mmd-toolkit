import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { C4Grammar } from "./grammar.ts"
import type { C4Lexing } from "./units.ts"
import { C4UnitLexer } from "./units.ts"

/** C4 diagram text and the units and comments read from it. */
export interface C4Units extends C4Lexing {
  readonly text: DiagramTextReader
}

/** diagrams/c4.md, Lexical structure: also used by tests; not public API. */
export function lexC4(input: DiagramInput): C4Units {
  const text = openDiagramText(input)
  return { text, ...new C4UnitLexer(text, input.lexer.lines).lex() }
}

/** diagrams/c4.md: the shared text reader, C4 lexer and grammar, and common token recording. */
export function parseC4Diagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexC4(input)
  const syntax = new C4Grammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    (place) => ({
      type: "C4Diagram",
      kind: syntax.kind,
      beforeBody: syntax.beforeBody,
      body: syntax.body,
      ...place,
    }),
  )
}
