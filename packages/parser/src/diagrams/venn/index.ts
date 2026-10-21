import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { VennGrammar } from "./grammar.ts"
import type { VennLexing } from "./units.ts"
import { VennUnitLexer } from "./units.ts"

/** The diagram text and the units and comments read from it. */
export interface VennUnits extends VennLexing {
  readonly text: DiagramTextReader
}

/** diagrams/venn.md, Lexical structure: the diagram's units and comments; not public API. */
export function lexVenn(input: DiagramInput): VennUnits {
  const text = openDiagramText(input)
  return { text, ...new VennUnitLexer(text, input.lexer.lines).lex() }
}

/** diagrams/venn.md: shared text reading, venn units and grammar, and common recording. */
export function parseVennDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexVenn(input)
  const syntax = new VennGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    (place) => ({ type: "VennDiagram", body: syntax.body, ...place }),
  )
}
