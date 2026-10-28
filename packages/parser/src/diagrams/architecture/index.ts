import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import type { ArchitectureDiagram } from "../../ast/architecture.ts"
import { checkArchitectureDeclarations } from "./acceptance.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { ArchitectureGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { ArchitectureUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface ArchitectureUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** diagrams/architecture.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexArchitecture(input: DiagramInput): ArchitectureUnits {
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
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
