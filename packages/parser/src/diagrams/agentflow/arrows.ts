import {
  FULL_STOP,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LATIN_SMALL_LETTER_X,
} from "../../code-points.ts"
import type { DiagramPosition, DiagramText } from "../../diagram-text.ts"
import type { Match } from "../../scanning.ts"

/** ast/agentflow.md, AgentflowArrow: the closed arrow's written parts. */
export interface ClosedArrowParts {
  readonly form: "closed"
  readonly startMarker: "none"
  readonly line: "solid" | "dotted"
  readonly length: number
  readonly endMarker: "arrow" | "cross" | "none"
}

/** ast/agentflow.md, AgentflowOpeningArrow: only a solid split opener exists. */
export interface OpeningArrowParts {
  readonly form: "opening"
  readonly startMarker: "none"
  readonly line: "solid"
}

/** An arrow match before surrounding whitespace is read. */
export interface ArrowMatch extends Match {
  readonly parts: ClosedArrowParts | OpeningArrowParts
}

/** diagrams/agentflow.md, Arrows: two or more dashes followed by > or x. */
export function matchClosedArrow(
  reader: DiagramText,
  from: DiagramPosition,
): (Match & { readonly parts: ClosedArrowParts }) | null {
  let end = from
  let length = 0
  while (end !== null && end.codePoint === HYPHEN_MINUS) {
    length += 1
    end = reader.after(end)
  }
  if (
    length < 2 ||
    end === null ||
    (end.codePoint !== GREATER_THAN_SIGN &&
      end.codePoint !== LATIN_SMALL_LETTER_X)
  )
    return null
  return {
    end: reader.after(end),
    parts: {
      form: "closed",
      startMarker: "none",
      line: "solid",
      length,
      endMarker: end.codePoint === GREATER_THAN_SIGN ? "arrow" : "cross",
    },
  }
}

/** Arrows: solid closed, two-dash opener, then closed reference, in that order. */
export function matchArrow(
  reader: DiagramText,
  from: DiagramPosition,
): ArrowMatch | null {
  const closed = matchClosedArrow(reader, from)
  if (closed !== null) return closed
  if (from === null || from.codePoint !== HYPHEN_MINUS) return null
  const second = reader.after(from)
  if (second !== null && second.codePoint === HYPHEN_MINUS) {
    return {
      end: reader.after(second),
      parts: { form: "opening", startMarker: "none", line: "solid" },
    }
  }
  let end = second
  let length = 0
  while (end !== null && end.codePoint === FULL_STOP) {
    length += 1
    end = reader.after(end)
  }
  if (length === 0 || end === null || end.codePoint !== HYPHEN_MINUS)
    return null
  return {
    end: reader.after(end),
    parts: {
      form: "closed",
      startMarker: "none",
      line: "dotted",
      length,
      endMarker: "none",
    },
  }
}
