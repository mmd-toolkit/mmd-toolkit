import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { InfoGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { InfoUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface InfoUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** diagrams/info.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexInfo(input: DiagramInput): InfoUnits {
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
  return { text, ...new InfoUnitLexer(reader, input.lexer.lines).lex() }
}

/** Info grammar, followed by shared token-boundary checks and root construction. */
export function parseInfoDiagram(input: DiagramInput): Root {
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
  const lexing = lexInfo(input)
  const syntax = new InfoGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => ({
      type: "InfoDiagram",
      showInfo: syntax.showInfo,
      textBeforeHeader: syntax.textBeforeHeader,
      textBeforeShowInfo: syntax.textBeforeShowInfo,
      body: syntax.body,
      ...place,
    }),
  )
}
