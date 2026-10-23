import type { Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import type { DiagramPosition, DiagramText } from "../../diagram-text.ts"
import { DiagramTextReader } from "../../diagram-text.ts"
import { PieGrammar } from "./grammar.ts"
import type { PieLexing } from "./units.ts"
import { PieUnitLexer } from "./units.ts"

/** Pie units and the source-positioned reader, also used by internal fixture helpers. */
export interface PieUnits extends PieLexing {
  readonly text: DiagramText
}

/** Detection's bare lines and accompanying whitespace are not read a second time. */
export function lexPie(input: DiagramInput): PieUnits {
  const source = openDiagramText(input)
  const bareLines = input.passed.filter(
    (part) => part.kind === "bare-percent-line",
  )

  /** Pass only the bare-line spans already classified by detection. */
  function afterPassed(at: DiagramPosition): DiagramPosition {
    let position = at
    for (const line of bareLines) {
      if (
        position !== null &&
        position.start >= line.start &&
        position.start <= line.end
      )
        position = new DiagramTextReader(
          input.lexer,
          input.lexer.skipTrivia(line.end),
        ).first()
    }
    return position
  }

  const text: DiagramText = {
    first: () => afterPassed(source.first())!,
    after: (character) => afterPassed(source.after(character)),
  }

  return { text, ...new PieUnitLexer(text, input.lexer.lines).lex() }
}

/** Pie's retained pre-header forms are lexed; only bare lines become detection comments. */
export function parsePieDiagram(input: DiagramInput): Root {
  const comments = commentsBeforeHeader({
    ...input,
    passed: input.passed.filter((part) => part.kind === "bare-percent-line"),
  })
  const lexing = lexPie(input)
  const { tokens, ...fields } = new PieGrammar(
    lexing,
    input.lexer,
  ).parseDiagram()
  return finishDiagram(
    input,
    { tokens, comments: [...comments, ...lexing.comments] },
    (place) => ({ type: "PieDiagram", ...fields, ...place }),
  )
}
