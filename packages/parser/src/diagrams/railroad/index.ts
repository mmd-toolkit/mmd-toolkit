import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { AbnfGrammar, AbnfUnitLexer } from "./abnf.ts"
import { EbnfGrammar, EbnfUnitLexer } from "./ebnf.ts"
import { IrGrammar, IrUnitLexer } from "./ir.ts"
import { PegGrammar, PegUnitLexer } from "./peg.ts"
import type { UnitName } from "./units.ts"

/** Shared reader and ordered units for internal tests. */
export interface RailroadUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** Select only the dialect's lexical rules; each scan consumes the whole text before grammar. */
export function lexRailroad(input: DiagramInput): RailroadUnits {
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
  const lines = input.lexer.lines
  const lexer =
    input.diagramType === "railroad"
      ? new IrUnitLexer(reader, lines)
      : input.diagramType === "railroadEbnf"
        ? new EbnfUnitLexer(reader, lines)
        : input.diagramType === "railroadAbnf"
          ? new AbnfUnitLexer(reader, lines)
          : new PegUnitLexer(reader, lines)
  return { text, ...lexer.lex() }
}

/** Public gate: complete lexical/grammar reading and shared atom checks, without configuration. */
export function parseRailroadDiagram(input: DiagramInput): Root {
  const lexing = lexRailroad(input)
  const grammar =
    input.diagramType === "railroad"
      ? new IrGrammar(lexing, input.lexer)
      : input.diagramType === "railroadEbnf"
        ? new EbnfGrammar(lexing, input.lexer)
        : input.diagramType === "railroadAbnf"
          ? new AbnfGrammar(lexing, input.lexer)
          : new PegGrammar(lexing, input.lexer)
  const syntax = grammar.parseDiagram()
  const comments = input.passed.flatMap<DiagramComment>((part) =>
    part.kind === "bare-percent-line"
      ? [
          {
            range: [part.start, part.end],
            mark: "%%",
            valueStart: part.valueStart,
          },
        ]
      : [],
  )
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...comments, ...lexing.comments].toSorted(
        (a, b) => a.range[0] - b.range[0],
      ),
    },
    (place) => ({
      type: "RailroadDiagram",
      textBeforeHeader: syntax.textBeforeHeader,
      body: syntax.body,
      ...place,
    }),
  )
}
