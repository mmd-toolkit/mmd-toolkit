import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
  DiagramTextReader,
} from "../../diagram-text.ts"
import type { PassedPart } from "../../detection.ts"
import { InfoGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { InfoUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface InfoUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** common.md, Diagram detection: passed bare lines and accompanying trivia are not diagram text again. */
class InfoText implements DiagramText {
  private readonly reader: DiagramTextReader

  private readonly bareLines: readonly Extract<
    PassedPart,
    { kind: "bare-percent-line" }
  >[]

  public constructor(reader: DiagramTextReader, passed: readonly PassedPart[]) {
    this.reader = reader
    this.bareLines = passed.filter((part) => part.kind === "bare-percent-line")
  }

  public first(): DiagramCharacter {
    return this.reader.first()
  }

  public after(character: DiagramCharacter): DiagramPosition {
    let next = this.reader.after(character)
    for (const part of this.bareLines) {
      while (
        next !== null &&
        next.start >= part.start &&
        next.start < part.next
      )
        next = this.reader.after(next)
    }
    return next
  }
}

/** diagrams/info.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexInfo(input: DiagramInput): InfoUnits {
  const text = openDiagramText(input)
  const reader = new InfoText(text, input.passed)
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
