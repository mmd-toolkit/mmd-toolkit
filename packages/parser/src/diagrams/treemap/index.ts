import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { PassedPart } from "../../detection.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
  DiagramTextReader,
} from "../../diagram-text.ts"
import { TreemapGrammar } from "./grammar.ts"
import type { UnitName } from "./units.ts"
import { TreemapUnitLexer } from "./units.ts"

/** The shared source reader and lexical units, also available to internal tests. */
export interface TreemapUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
}

/** Detection: passed bare lines and accompanying trivia are never native indentation. */
class TreemapText implements DiagramText {
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

/** Ordered rules: retained prefixes remain text; only passed bare-line intervals disappear. */
export function lexTreemap(input: DiagramInput): TreemapUnits {
  const text = openDiagramText(input)
  const reader = new TreemapText(text, input.passed)
  const passedTriviaEnd = input.passed.some(
    (part) => part.kind === "bare-percent-line",
  )
    ? input.positionReached
    : 0
  return {
    text,
    ...new TreemapUnitLexer(reader, input.lexer.lines, passedTriviaEnd).lex(),
  }
}

/** Public parse gate: complete lexical/grammar consumption and shared atomic boundaries only. */
export function parseTreemapDiagram(input: DiagramInput): Root {
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
  const lexing = lexTreemap(input)
  const syntax = new TreemapGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...comments, ...lexing.comments].toSorted(
        (a, b) => a.range[0] - b.range[0],
      ),
    },
    (place) => ({ type: "TreemapDiagram", body: syntax.body, ...place }),
  )
}
