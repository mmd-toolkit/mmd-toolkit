import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import { finishDiagram, openDiagramText } from "../../diagram-parsing.ts"
import type { DiagramTextReader } from "../../diagram-text.ts"
import { TreeviewGrammar } from "./grammar.ts"
import { TreeviewSource, TreeviewText } from "./treeview-text.ts"
import type { Unit, UnitName } from "./units.ts"
import { TreeviewUnitLexer } from "./units.ts"

/** The shared reader and units, also used by internal lexical fixture checks. */
export interface TreeviewUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
  readonly units: readonly Unit[]
}

/** Direct box rules and ordered units; no native YAML, hidden directives or common EOL. */
export function lexTreeview(input: DiagramInput): TreeviewUnits {
  const text = openDiagramText(input)
  const source = new TreeviewSource(text, input.passed)
  const reader = new TreeviewText(source, input.lexer.lines)
  const passedTriviaEnd = input.passed.some(
    (part) => part.kind === "bare-percent-line",
  )
    ? input.positionReached
    : 0
  return {
    text,
    ...new TreeviewUnitLexer(
      reader,
      source,
      input.lexer.lines,
      passedTriviaEnd,
    ).lex(),
  }
}

/** Public gate: complete lexing/grammar, the two box errors, and shared atomic boundaries. */
export function parseTreeviewDiagram(input: DiagramInput): Root {
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
  const lexing = lexTreeview(input)
  const syntax = new TreeviewGrammar(lexing, input.lexer).parseDiagram()
  return finishDiagram(
    input,
    {
      tokens: syntax.tokens,
      comments: [...comments, ...lexing.comments].toSorted(
        (a, b) => a.range[0] - b.range[0],
      ),
    },
    (place) => ({ type: "TreeviewDiagram", body: syntax.body, ...place }),
  )
}
