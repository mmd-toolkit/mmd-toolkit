import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import { checkWardleyAcceptance } from "./acceptance.ts"
import type { WardleyDiagram } from "../../ast/wardley.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { WardleyGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { WardleyUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface WardleyUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** diagrams/wardley.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexWardley(input: DiagramInput): WardleyUnits {
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
  return { text, ...new WardleyUnitLexer(reader, input.lexer.lines).lex() }
}

/** Ordered lexing and grammar, shared atomic boundaries, then named-entry acceptance checks. */
export function parseWardleyDiagram(input: DiagramInput): Root {
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
  const lexing = lexWardley(input)
  const syntax = new WardleyGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => {
      const body: WardleyDiagram = {
        type: "WardleyDiagram",
        textBeforeHeader: syntax.textBeforeHeader,
        body: syntax.body,
        ...place,
      }
      checkWardleyAcceptance(body, syntax.comparisonNames)
      return body
    },
  )
}
