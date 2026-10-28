import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import type { EventmodelingDiagram } from "../../ast/eventmodeling.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { EventmodelingGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { EventmodelingUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface EventmodelingUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** diagrams/eventmodeling.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexEventmodeling(input: DiagramInput): EventmodelingUnits {
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
  return {
    text,
    ...new EventmodelingUnitLexer(reader, input.lexer.lines).lex(),
  }
}

/** Ordered lexing and grammar, shared atomic boundaries, complete public consumption. */
export function parseEventmodelingDiagram(input: DiagramInput): Root {
  const comments = input.passed.flatMap<DiagramComment>((part) =>
    part.kind === "bare-percent-line"
      ? [
          {
            range: [part.start, part.end],
            mark: "%%" as const,
            valueStart: part.valueStart,
          },
        ]
      : [],
  )
  const lexing = lexEventmodeling(input)
  const syntax = new EventmodelingGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => {
      const body: EventmodelingDiagram = {
        type: "EventmodelingDiagram",
        textBeforeHeader: syntax.textBeforeHeader,
        body: syntax.body,
        ...place,
      }
      return body
    },
  )
}
