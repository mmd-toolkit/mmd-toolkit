import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { ParseError } from "../../errors.ts"
import { IshikawaGrammar } from "./grammar.ts"
import type { IshikawaLexing } from "./units.ts"
import { IshikawaUnitLexer } from "./units.ts"

/** The diagram text and the units and comments read from it. */
export interface IshikawaUnits extends IshikawaLexing {
  readonly text: DiagramTextReader
}

/** diagrams/ishikawa.md, Lexical structure: the diagram's units and comments; not public API. */
export function lexIshikawa(input: DiagramInput): IshikawaUnits {
  const text = openDiagramText(input)
  return { text, ...new IshikawaUnitLexer(text, input.lexer.lines).lex() }
}

/** diagrams/ishikawa.md: shared text reading, ishikawa units and grammar, and common recording. */
export function parseIshikawaDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexIshikawa(input)
  const syntax = new IshikawaGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    (place) => {
      // The grammar rejects a later header, and common recording rejects a
      // cut header, before the general rule for a bare initial header at EOF.
      if (lexing.headerEndsText)
        throw new ParseError(
          "The header cannot end the text",
          place.range,
          place.loc,
        )
      return { type: "IshikawaDiagram", root: syntax.root, ...place }
    },
  )
}
