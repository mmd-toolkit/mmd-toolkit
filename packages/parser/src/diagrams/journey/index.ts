import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { JourneyGrammar } from "./grammar.ts"
import type { JourneyLexing } from "./units.ts"
import { JourneyUnitLexer } from "./units.ts"

/** The diagram text of a journey diagram and what the lexer read from it. */
export interface JourneyUnits extends JourneyLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/journey.md, Lexical structure: the units of the diagram text of
 * `input`, with its diagram comments. Not public API: the tests read the
 * source through the same units.
 */
export function lexJourney(input: DiagramInput): JourneyUnits {
  const text = openDiagramText(input)
  const lexing = new JourneyUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/journey.md: the parser of the diagram type `journey`. The lexer
 * of Lexical structure divides the diagram text into units and finds its
 * diagram comments, and the grammar of Grammar makes the statements and
 * the tokens from them; the diagram type has no rejections outside the
 * grammar. The common part finishes the tree (see `finishDiagram`).
 */
export function parseJourneyDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexJourney(input)
  const syntax = new JourneyGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/journey.md, JourneyDiagram: the range runs from the header keyword
    // to the last token of the diagram.
    (place) => ({ type: "JourneyDiagram", body: syntax.body, ...place }),
  )
}
