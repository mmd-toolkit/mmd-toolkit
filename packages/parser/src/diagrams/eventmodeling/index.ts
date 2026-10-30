import { DiagramTextWithoutPassedLines } from "../../passed-bare-lines.ts"
import type { EventmodelingDiagram } from "../../ast/eventmodeling.ts"
import type { Root } from "../../ast.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { DiagramComment, DiagramInput } from "../../diagram-parsing.ts"
import {
  finishDiagram,
  openDiagramText,
  readsCommentLines,
} from "../../diagram-parsing.ts"
import { DiagramTextReader } from "../../diagram-text.ts"
import { SourceLexer } from "../../source-lexer.ts"
import { EventmodelingGrammar } from "./grammar.ts"
import { rejectRepeatedFrameNames } from "./rejections.ts"
import type { UnitName } from "./units.ts"
import { EventmodelingUnitLexer } from "./units.ts"

/** The shared reader, lexer and units used by the parser and lexical fixture checks. */
export interface EventmodelingUnits extends CommonFormLexing<UnitName> {
  readonly text: DiagramTextReader
  readonly lexer: SourceLexer
}

/**
 * diagrams/eventmodeling.md, Ordered rules: keep retained pre-header forms
 * for the hidden rules to read. At or below the default maxTextSize the
 * lexer reads comment lines itself, from the end of the frontmatter, as its
 * native percent-comments or as text inside a value or a hidden form;
 * above it, the common comment removal applies, and the bare `%%` lines
 * that detection passed are diagram comments already.
 */
export function lexEventmodeling(input: DiagramInput): EventmodelingUnits {
  if (readsCommentLines(input)) {
    const lexer = new SourceLexer(input.lexer.text, input.lexer.start, true)
    const text = new DiagramTextReader(lexer, lexer.start)
    return {
      text,
      lexer,
      ...new EventmodelingUnitLexer(text, lexer.lines).lex(),
    }
  }
  const text = openDiagramText(input)
  const reader = new DiagramTextWithoutPassedLines(text, input.passed)
  const lexing = new EventmodelingUnitLexer(reader, input.lexer.lines).lex()
  const passed = input.passed.flatMap<DiagramComment>((part) =>
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
  return {
    text,
    lexer: input.lexer,
    ...lexing,
    comments: [...passed, ...lexing.comments],
  }
}

/** Ordered lexing and grammar, shared atomic boundaries, complete public consumption. */
export function parseEventmodelingDiagram(input: DiagramInput): Root {
  const lexing = lexEventmodeling(input)
  const syntax = new EventmodelingGrammar(lexing, lexing.lexer).parseDiagram()
  rejectRepeatedFrameNames(syntax.body, lexing.lexer.lines)
  return finishDiagram(
    { ...input, lexer: lexing.lexer },
    { tokens: syntax.tokens, comments: lexing.comments },
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
