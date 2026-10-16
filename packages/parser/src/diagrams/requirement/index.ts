import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { RequirementGrammar } from "./grammar.ts"
import type { RequirementLexing } from "./units.ts"
import { RequirementUnitLexer } from "./units.ts"

/** The diagram text of a requirement diagram and what the lexer read from it. */
export interface RequirementUnits extends RequirementLexing {
  readonly text: DiagramTextReader
}

/**
 * diagrams/requirement.md, Lexical structure: the units of the diagram
 * text of `input`, with its diagram comments. Not public API: the tests
 * read the source through the same units.
 */
export function lexRequirement(input: DiagramInput): RequirementUnits {
  const text = openDiagramText(input)
  const lexing = new RequirementUnitLexer(text, input.lexer.lines).lex()
  return { text, ...lexing }
}

/**
 * diagrams/requirement.md: the parser of the diagram type `requirement`.
 * The lexer of Lexical structure divides the diagram text into units and
 * finds its diagram comments, and the grammar of Grammar makes the
 * statements and the tokens from them; the Db throws for no input
 * (Rejections outside the grammar). The common part finishes the tree (see
 * `finishDiagram`).
 */
export function parseRequirementDiagram(input: DiagramInput): Root {
  const commentsBefore = commentsBeforeHeader(input)
  const lexing = lexRequirement(input)
  const syntax = new RequirementGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...commentsBefore, ...lexing.comments],
    },
    // ast/requirement.md, RequirementDiagram: the range runs from the header
    // keyword to the last token of the diagram.
    (place) => ({ type: "RequirementDiagram", body: syntax.body, ...place }),
  )
}
