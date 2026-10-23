import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { TimelineGrammar } from "./grammar.ts"
import type { TimelineLexing } from "./units.ts"
import { TimelineUnitLexer } from "./units.ts"

/** The diagram text of a timeline diagram and what the lexer read from it. */
export interface TimelineUnits extends TimelineLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/timeline.md, Lexical structure: the units of the diagram text of
 * `input`, with its diagram comments. Not public API: the tests read the
 * source through the same units.
 */
export function lexTimeline(input: DiagramInput): TimelineUnits {
  const text = openDiagramText(input)
  const lexing = new TimelineUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/timeline.md: the parser of the diagram type `timeline`. The lexer
 * of Lexical structure divides the diagram text into units and finds its
 * diagram comments, and the grammar of Grammar makes the statements and
 * the tokens from them, with the one rejection outside the grammar. The
 * common part finishes the tree (see `finishDiagram`).
 */
export function parseTimelineDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexTimeline(input)
  const syntax = new TimelineGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/timeline.md, TimelineDiagram: the range runs from the header keyword
    // to the last token of the diagram.
    (place) => ({
      type: "TimelineDiagram",
      direction: syntax.direction,
      body: syntax.body,
      ...place,
    }),
  )
}
