import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { KanbanGrammar } from "./grammar.ts"
import type { KanbanLexing } from "./units.ts"
import { KanbanUnitLexer } from "./units.ts"

/** The diagram text of a kanban diagram and what the lexer read from it. */
export interface KanbanUnits extends KanbanLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/kanban.md, Lexical structure: the units of the diagram text of
 * `input`, with its diagram comments. Not public API: the tests read the
 * source through the same units.
 */
export function lexKanban(input: DiagramInput): KanbanUnits {
  const text = openDiagramText(input)
  const lexing = new KanbanUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/kanban.md: the parser of the diagram type `kanban`. The lexer
 * of Lexical structure divides the diagram text into units and finds its
 * diagram comments, and the grammar of Grammar makes the nodes and the
 * tokens from them, with the two rejections outside the grammar. The
 * common part finishes the tree (see `finishDiagram`).
 */
export function parseKanbanDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexKanban(input)
  const syntax = new KanbanGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/kanban.md, KanbanDiagram: the range runs from the header keyword
    // to the last token of the diagram.
    (place) => ({ type: "KanbanDiagram", body: syntax.body, ...place }),
  )
}
