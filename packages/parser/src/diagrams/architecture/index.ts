import type { ArchitectureDiagram } from "../../ast/architecture.ts"
import { checkArchitectureDeclarations } from "./acceptance.ts"
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
import { ArchitectureGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { ArchitectureUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface ArchitectureUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** common.md, Diagram detection: passed bare lines and accompanying trivia are not diagram text again. */
class ArchitectureText implements DiagramText {
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

/** diagrams/architecture.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexArchitecture(input: DiagramInput): ArchitectureUnits {
  const text = openDiagramText(input)
  const reader = new ArchitectureText(text, input.passed)
  return { text, ...new ArchitectureUnitLexer(reader, input.lexer.lines).lex() }
}

/** Ordered lexing and grammar, shared atomic boundaries, then semantic registration. */
export function parseArchitectureDiagram(input: DiagramInput): Root {
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
  const lexing = lexArchitecture(input)
  const syntax = new ArchitectureGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => {
      const body: ArchitectureDiagram = {
        type: "ArchitectureDiagram",
        textBeforeHeader: syntax.textBeforeHeader,
        body: syntax.body,
        ...place,
      }
      checkArchitectureDeclarations(body)
      return body
    },
  )
}
