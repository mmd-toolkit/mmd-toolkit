import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { MindmapGrammar } from "./grammar.ts"
import type { MindmapLexing } from "./units.ts"
import { MindmapUnitLexer } from "./units.ts"

/** The diagram text of a mindmap diagram and what the lexer read from it. */
export interface MindmapUnits extends MindmapLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/mindmap.md, Lexical structure: the units of the diagram text of
 * `input`, with its diagram comments. Not public API: the tests read the
 * source through the same units.
 */
export function lexMindmap(input: DiagramInput): MindmapUnits {
  const text = openDiagramText(input)
  const lexing = new MindmapUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/mindmap.md: the parser of the diagram type `mindmap`. The lexer
 * of Lexical structure divides the diagram text into units and finds its
 * diagram comments, and the grammar of Grammar makes the nodes and the
 * tokens from them, with the two rejections outside the grammar. The
 * common part finishes the tree (see `finishDiagram`).
 */
export function parseMindmapDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexMindmap(input)
  const syntax = new MindmapGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/mindmap.md, MindmapDiagram: the range runs from the header keyword
    // to the last token of the diagram.
    (place) => ({ type: "MindmapDiagram", root: syntax.root, ...place }),
  )
}
