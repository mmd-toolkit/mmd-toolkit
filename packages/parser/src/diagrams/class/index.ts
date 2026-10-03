import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import { ClassDbRejections } from "./db-rejections.ts"
import { ClassGrammar } from "./grammar.ts"
import type { ClassLexing } from "./units.ts"
import { ClassUnitLexer } from "./units.ts"

/** The diagram text of a class diagram and what the lexer read from it. */
export interface ClassUnits extends ClassLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/class.md, Lexical structure: the units of the diagram text of
 * `input`, with what else the lexer read (see `ClassLexing`). Not public
 * API: the tests read the source through the same units.
 */
export function lexClass(input: DiagramInput): ClassUnits {
  const text = openDiagramText(input)
  const lexing = new ClassUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/class.md: the parser of the diagram type `classDiagram`. The
 * lexer of Lexical structure divides the diagram text into units and finds
 * its diagram comments, the grammar of Grammar makes the statements and
 * the tokens from them, and the walk of Rejections
 * outside the grammar rejects what mermaid.js rejects while it builds the
 * Db. The common part finishes the tree (see `finishDiagram`).
 */
export function parseClassDiagram(input: DiagramInput): Root {
  const lexing = lexClass(input)
  const syntax = new ClassGrammar(lexing, input.lexer).parseDiagram()
  new ClassDbRejections(input.lexer.lines, syntax.writtenNames).check(
    syntax.body,
  )
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: lexing.comments,
    },
    // ast/class.md, ClassDiagram: the range runs from the keyword to the
    // last token of the diagram.
    (place) => ({ type: "ClassDiagram", body: syntax.body, ...place }),
  )
}
