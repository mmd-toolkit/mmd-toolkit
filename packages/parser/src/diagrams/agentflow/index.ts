import type { Range, Root } from "../../ast.ts"
import type { DiagramInput } from "../../diagram-parsing.ts"
import { DiagramTextReader } from "../../diagram-text.ts"
import {
  commentsBeforeHeader,
  finishDiagram,
  openDiagramText,
} from "../../diagram-parsing.ts"
import { findDirectives } from "../../directives.ts"
import { SourceLexer } from "../../source-lexer.ts"
import { lineTerminatorEnd, nextOffset } from "../../text-cursor.ts"
import { AgentflowText } from "./agentflow-text.ts"
import { AgentflowGrammar } from "./grammar.ts"
import type { AgentflowLexing } from "./units.ts"
import { AgentflowUnitLexer } from "./units.ts"

/** The text and units used by the grammar and fixture helpers. */
export interface AgentflowUnits extends AgentflowLexing {
  readonly text: DiagramTextReader
  readonly lexer: SourceLexer
}

/** common.md, default maxTextSize: count normalized UTF-16 after frontmatter, excluding directives. */
function preservesComments(input: DiagramInput): boolean {
  const { text, start } = input.lexer
  const directives = findDirectives(text, start)
  let index = 0
  let size = 0
  for (let offset = start; offset < text.length;) {
    const directive = directives[index]
    if (directive?.range[0] === offset) {
      offset = directive.range[1]
      index += 1
    } else {
      const end = lineTerminatorEnd(text, offset) ?? nextOffset(text, offset)
      size += lineTerminatorEnd(text, offset) === null ? end - offset : 1
      if (size > 50000) return false
      offset = end
    }
  }
  return true
}

/** diagrams/agentflow.md: read its own units; not public API. */
export function lexAgentflow(input: DiagramInput): AgentflowUnits {
  const before = commentsBeforeHeader(input)
  const preserve = preservesComments(input)
  const lexer = preserve
    ? new SourceLexer(input.lexer.text, input.lexer.start, true)
    : input.lexer
  const text = preserve
    ? new DiagramTextReader(lexer, lexer.start)
    : openDiagramText(input)
  const lexing = new AgentflowUnitLexer(
    new AgentflowText(text),
    lexer.lines,
    input.textStart,
  ).lex()
  return {
    text,
    lexer,
    ...lexing,
    comments: [...(preserve ? [] : before), ...lexing.comments],
  }
}

/** The agentflow body, with common recording and token-boundary checks. */
export function parseAgentflowDiagram(input: DiagramInput): Root {
  const lexing = lexAgentflow(input)
  const syntax = new AgentflowGrammar(lexing, lexing.lexer).parseDiagram()
  return finishDiagram(
    { ...input, lexer: lexing.lexer },
    {
      tokens: syntax.tokens,
      comments: lexing.comments,
    },
    (place) => {
      const range: Range = [
        place.range[0],
        Math.max(
          place.range[1],
          syntax.body.at(-1)?.range[1] ?? place.range[1],
        ),
      ]
      return {
        type: "AgentflowDiagram",
        direction: syntax.direction,
        body: syntax.body,
        range,
        loc: lexing.lexer.lines.location(range),
      }
    },
  )
}
