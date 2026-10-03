import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import { StateDbRejections } from "./db-rejections.ts"
import { StateGrammar } from "./grammar.ts"
import type { StateLexing } from "./units.ts"
import { StateUnitLexer } from "./units.ts"

/** The diagram text of a state diagram and what the lexer read from it. */
export interface StateUnits extends StateLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/state.md, Lexical structure: the units of the diagram text of
 * `input`, with what else the lexer read (see `StateLexing`). Not public
 * API: the tests read the source through the same units.
 */
export function lexState(input: DiagramInput): StateUnits {
  const text = openDiagramText(input)
  const lexing = new StateUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/state.md: the parser of the diagram type `stateDiagram`. The
 * lexer of Lexical structure divides the diagram text into units and finds
 * its diagram comments, the grammar of Grammar makes the statements and
 * the tokens from them, and the walk of Rejections
 * outside the grammar rejects what mermaid.js rejects while it builds the
 * Db. The common part finishes the tree (see `finishDiagram`).
 */
export function parseStateDiagram(input: DiagramInput): Root {
  const lexing = lexState(input)
  const syntax = new StateGrammar(
    lexing.units,
    lexing.noteColonsInText,
    lexing.comments,
    input.lexer,
  ).parseDiagram()
  new StateDbRejections(
    input.lexer.lines,
    syntax.stateIds,
    syntax.tokens,
    input.lexer.text,
  ).check(syntax.body)
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: lexing.comments,
    },
    // ast/state.md, StateDiagram: the range runs from the header keyword to
    // the last token of the diagram.
    (place) => ({ type: "StateDiagram", body: syntax.body, ...place }),
  )
}
