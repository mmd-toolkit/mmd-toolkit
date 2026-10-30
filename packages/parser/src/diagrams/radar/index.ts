import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import type { RadarDiagram } from "../../ast/radar.ts"
import { ParseError } from "../../errors.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { RadarGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { RadarUnitLexer } from "./units.ts"

/** The shared reader and units used by the parser and lexical fixture checks. */
export interface RadarUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** diagrams/radar.md, Ordered rules: keep retained pre-header forms for the hidden rules to read. */
export function lexRadar(input: DiagramInput): RadarUnits {
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
  return { text, ...new RadarUnitLexer(reader, input.lexer.lines).lex() }
}

/** Ordered lexing and grammar, shared atomic boundaries, then named-entry acceptance checks. */
export function parseRadarDiagram(input: DiagramInput): Root {
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
  const lexing = lexRadar(input)
  const syntax = new RadarGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    { tokens: syntax.tokens, comments: [...comments, ...lexing.comments] },
    (place) => {
      const body: RadarDiagram = {
        type: "RadarDiagram",
        textBeforeHeader: syntax.textBeforeHeader,
        textBeforeColon: syntax.textBeforeColon,
        body: syntax.body,
        ...place,
      }
      checkRadarEntries(body)
      return body
    },
  )
}

/** diagrams/radar.md, Semantic acceptance conditions: all axis names must occur in every named curve. */
function checkRadarEntries(diagram: RadarDiagram): void {
  const axes = new Set<string>()
  for (const statement of diagram.body)
    if (statement.type === "RadarAxisStatement")
      for (const axis of statement.axes) axes.add(axis.name.name)
  for (const statement of diagram.body) {
    if (statement.type !== "RadarCurveStatement") continue
    for (const curve of statement.curves) {
      if (curve.entries[0].type !== "RadarNamedEntry") continue
      const names = new Set(
        curve.entries.flatMap((entry) =>
          entry.type === "RadarNamedEntry" ? [entry.axis.name] : [],
        ),
      )
      if (axes.size === 0)
        throw new ParseError(
          "Radar named curve requires axes",
          curve.range,
          curve.loc,
        )
      if ([...axes].some((axis) => !names.has(axis)))
        throw new ParseError(
          "Radar named curve is missing an axis entry",
          curve.range,
          curve.loc,
        )
    }
  }
}
