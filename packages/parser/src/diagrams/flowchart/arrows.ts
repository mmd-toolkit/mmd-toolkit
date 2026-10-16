import {
  EQUALS_SIGN,
  FULL_STOP,
  GREATER_THAN_SIGN,
  HYPHEN_MINUS,
  LATIN_SMALL_LETTER_O,
  LATIN_SMALL_LETTER_X,
  LESS_THAN_SIGN,
  TILDE,
} from "../../code-points.ts"
import type {
  FlowchartArrowLine,
  FlowchartArrowMarker,
  FlowchartOpeningArrowLine,
} from "../../ast/flowchart.ts"
import type { DiagramPosition, DiagramText } from "../../diagram-text.ts"
import type { Match } from "../../scanning.ts"
import { isCodePointAt } from "../../scanning.ts"

/** diagrams/flowchart.md, Arrows: the kinds of arrows that can stand around a link text. */
export type LinkTextKind = "dash" | "thick" | "dotted"

/**
 * ast/flowchart.md, FlowchartArrow: the parts of a closed arrow that its
 * node holds besides its text.
 */
export interface ClosedArrowParts {
  readonly form: "closed"
  readonly startMarker: FlowchartArrowMarker
  readonly line: FlowchartArrowLine
  readonly length: number
  readonly endMarker: FlowchartArrowMarker
}

/**
 * ast/flowchart.md, FlowchartOpeningArrow: the parts of an opening arrow
 * that its node holds besides its text, and the link text context that it
 * enters.
 */
export interface OpeningArrowParts {
  readonly form: "opening"
  readonly startMarker: FlowchartArrowMarker
  readonly line: FlowchartOpeningArrowLine
  readonly opens: LinkTextKind
}

/** diagrams/flowchart.md, Arrows: an arrow itself, without the whitespace around it, and its parts. */
export interface ArrowMatch extends Match {
  readonly parts: ClosedArrowParts | OpeningArrowParts
}

/** A closed arrow itself, without the whitespace around it, and its parts. */
export interface ClosedArrowMatch extends Match {
  readonly parts: ClosedArrowParts
}

/** ast/flowchart.md, FlowchartArrow: the line of an arrow of each kind. */
const LINES: Readonly<Record<LinkTextKind, FlowchartOpeningArrowLine>> = {
  dash: "solid",
  thick: "thick",
  dotted: "dotted",
}

/**
 * ast/flowchart.md, FlowchartArrow: the marker that the head before the
 * line writes: `arrow` for `<`, `cross` for `x`, `circle` for `o`; null for
 * another character.
 */
function startMarkerAt(position: DiagramPosition): FlowchartArrowMarker | null {
  if (isCodePointAt(position, LESS_THAN_SIGN)) return "arrow"
  if (isCodePointAt(position, LATIN_SMALL_LETTER_X)) return "cross"
  if (isCodePointAt(position, LATIN_SMALL_LETTER_O)) return "circle"
  return null
}

/**
 * ast/flowchart.md, FlowchartArrow: the marker that the character after the
 * line writes: `arrow` for `>`, `cross` for `x`, `circle` for `o`; null for
 * another character.
 */
function endMarkerAt(position: DiagramPosition): FlowchartArrowMarker | null {
  if (isCodePointAt(position, GREATER_THAN_SIGN)) return "arrow"
  if (isCodePointAt(position, LATIN_SMALL_LETTER_X)) return "cross"
  if (isCodePointAt(position, LATIN_SMALL_LETTER_O)) return "circle"
  return null
}

/** The line of a closed arrow after its head: where it ends, how many line characters it has, and its end marker. */
interface LineMatch extends Match {
  readonly length: number
  readonly endMarker: FlowchartArrowMarker
}

/** The characters at `from` that are `codePoint`, as many as possible: how many, and the place after them. */
function countRun(
  reader: DiagramText,
  from: DiagramPosition,
  codePoint: number,
): { readonly count: number; readonly end: DiagramPosition } {
  let count = 0
  let position = from
  while (isCodePointAt(position, codePoint)) {
    count += 1
    position = reader.after(position)
  }
  return { count, end: position }
}

/**
 * Arrows, items 1 and 3: the line of a closed dash or thick arrow, after its
 * head: three or more of `lineCharacter`, or two or more followed by `x`,
 * `o`, or `>`. All the line characters are taken.
 */
function matchClosedLine(
  reader: DiagramText,
  from: DiagramPosition,
  lineCharacter: number,
): LineMatch | null {
  const line = countRun(reader, from, lineCharacter)
  const endMarker = endMarkerAt(line.end)
  if (line.count >= 2 && line.end !== null && endMarker !== null) {
    return { end: reader.after(line.end), length: line.count, endMarker }
  }
  return line.count >= 3
    ? { end: line.end, length: line.count, endMarker: "none" }
    : null
}

/** Arrows, items 2 and 4: the line of an opening dash or thick arrow, after its head: two of `lineCharacter`. */
function matchOpeningLine(
  reader: DiagramText,
  from: DiagramPosition,
  lineCharacter: number,
): Match | null {
  if (!isCodePointAt(from, lineCharacter)) return null
  const second = reader.after(from)
  if (!isCodePointAt(second, lineCharacter)) return null
  return { end: reader.after(second) }
}

/**
 * Arrows, item 5: the line of a closed dotted arrow, after its head:
 * optionally `-`, then one or more `.`, then `-`, then optionally `x`, `o`,
 * or `>`. Its length is the number of its `.`.
 */
function matchClosedDottedLine(
  reader: DiagramText,
  from: DiagramPosition,
): LineMatch | null {
  const afterDash = isCodePointAt(from, HYPHEN_MINUS)
    ? reader.after(from)
    : from
  const dots = countRun(reader, afterDash, FULL_STOP)
  if (dots.count === 0 || !isCodePointAt(dots.end, HYPHEN_MINUS)) return null
  const afterLine = reader.after(dots.end)
  const endMarker = endMarkerAt(afterLine)
  return endMarker === null || afterLine === null
    ? { end: afterLine, length: dots.count, endMarker: "none" }
    : { end: reader.after(afterLine), length: dots.count, endMarker }
}

/** Arrows, item 6: the line of an opening dotted arrow, after its head: `-.`. */
function matchOpeningDottedLine(
  reader: DiagramText,
  from: DiagramPosition,
): Match | null {
  if (!isCodePointAt(from, HYPHEN_MINUS)) return null
  const second = reader.after(from)
  if (!isCodePointAt(second, FULL_STOP)) return null
  return { end: reader.after(second) }
}

/**
 * Arrows: an optional head and then the line that `matchLine` reads, with
 * the start marker of the head. The head is tried first; without a line
 * after it, the line is tried at `from` itself.
 */
function matchWithOptionalHead<Line extends Match>(
  reader: DiagramText,
  from: DiagramPosition,
  matchLine: (afterHead: DiagramPosition) => Line | null,
): { readonly line: Line; readonly startMarker: FlowchartArrowMarker } | null {
  const startMarker = startMarkerAt(from)
  if (from !== null && startMarker !== null) {
    const withHead = matchLine(reader.after(from))
    if (withHead !== null) return { line: withHead, startMarker }
  }
  const withoutHead = matchLine(from)
  return withoutHead === null
    ? null
    : { line: withoutHead, startMarker: "none" }
}

/** The line of a closed arrow of the kind `kind`, after its head. */
function matchClosedLineOfKind(
  reader: DiagramText,
  from: DiagramPosition,
  kind: LinkTextKind,
): LineMatch | null {
  switch (kind) {
    case "dash":
      return matchClosedLine(reader, from, HYPHEN_MINUS)
    case "thick":
      return matchClosedLine(reader, from, EQUALS_SIGN)
    case "dotted":
      return matchClosedDottedLine(reader, from)
    default:
      throw new Error(
        `mmd-toolkit parser bug: unknown arrow kind ${JSON.stringify(kind satisfies never)}`,
      )
  }
}

/** The line of an opening arrow of the kind `kind`, after its head. */
function matchOpeningLineOfKind(
  reader: DiagramText,
  from: DiagramPosition,
  kind: LinkTextKind,
): Match | null {
  switch (kind) {
    case "dash":
      return matchOpeningLine(reader, from, HYPHEN_MINUS)
    case "thick":
      return matchOpeningLine(reader, from, EQUALS_SIGN)
    case "dotted":
      return matchOpeningDottedLine(reader, from)
    default:
      throw new Error(
        `mmd-toolkit parser bug: unknown arrow kind ${JSON.stringify(kind satisfies never)}`,
      )
  }
}

/** Arrows, items 1, 3, and 5: a closed arrow of the kind `kind` at `from`, without whitespace. */
export function matchClosedArrow(
  reader: DiagramText,
  from: DiagramPosition,
  kind: LinkTextKind,
): ClosedArrowMatch | null {
  const match = matchWithOptionalHead(reader, from, (afterHead) =>
    matchClosedLineOfKind(reader, afterHead, kind),
  )
  if (match === null) return null
  return {
    end: match.line.end,
    parts: {
      form: "closed",
      startMarker: match.startMarker,
      line: LINES[kind],
      length: match.line.length,
      endMarker: match.line.endMarker,
    },
  }
}

/** Arrows, items 2, 4, and 6: an opening arrow of the kind `kind` at `from`, without whitespace. */
function matchOpeningArrow(
  reader: DiagramText,
  from: DiagramPosition,
  kind: LinkTextKind,
): ArrowMatch | null {
  const match = matchWithOptionalHead(reader, from, (afterHead) =>
    matchOpeningLineOfKind(reader, afterHead, kind),
  )
  if (match === null) return null
  return {
    end: match.line.end,
    parts: {
      form: "opening",
      startMarker: match.startMarker,
      line: LINES[kind],
      opens: kind,
    },
  }
}

/** The kinds of arrows, in the order in which Arrows tries them: a closed arrow of a kind before its opening arrow. */
const LINK_TEXT_KINDS: readonly LinkTextKind[] = ["dash", "thick", "dotted"]

/**
 * diagrams/flowchart.md, Arrows: the arrow itself at `from`, without the
 * whitespace around it, and its parts. The seven forms are tried in the
 * order of the specification.
 */
export function matchArrow(
  reader: DiagramText,
  from: DiagramPosition,
): ArrowMatch | null {
  for (const kind of LINK_TEXT_KINDS) {
    const closed = matchClosedArrow(reader, from, kind)
    if (closed !== null) return closed
    const opening = matchOpeningArrow(reader, from, kind)
    if (opening !== null) return opening
  }
  // Item 7, an invisible arrow: three or more `~`.
  const tildes = countRun(reader, from, TILDE)
  if (tildes.count < 3) return null
  return {
    end: tildes.end,
    parts: {
      form: "closed",
      startMarker: "none",
      line: "invisible",
      length: tildes.count,
      endMarker: "none",
    },
  }
}
