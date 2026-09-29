import type { DiagramType, Range } from "./ast.ts"
import {
  COMMENT_MARKER,
  isWhitespace,
  isWordCharacter,
} from "./character-classes.ts"
import { COLON } from "./code-points.ts"
import {
  findCharacters,
  findCodePoints,
  lineTerminatorEnd,
  matchCharacters,
  matchCharactersIgnoringCase,
  nextOffset,
  skipWhile,
} from "./text-cursor.ts"
import { findDirectives } from "./directives.ts"
import { matchFrontmatter } from "./frontmatter.ts"
import type { SourceLexer } from "./source-lexer.ts"

/** detection.md: the id a detector selects. `---` is a pseudo-diagram that is always rejected. */
export type DetectorId = DiagramType | "---"

/** detection.md, The detectors: one entry of the table. */
export interface Detector {
  readonly id: DetectorId
  /** Whether the detector's condition holds for the detection text. */
  readonly matches: (candidateText: string) => boolean
}

/**
 * detection.md, How to read the list: whether a keyword of the table occurs
 * at `offset` of the detection text, compared exactly. Returns the offset
 * after it, or null.
 */
function matchKeyword(
  candidateText: string,
  offset: number,
  keyword: string,
): number | null {
  return matchCharacters(candidateText, offset, keyword)
}

/** Like {@link matchKeyword}, compared case-insensitively in the sense of Notation. */
function matchKeywordIgnoringCase(
  candidateText: string,
  offset: number,
  keyword: string,
): number | null {
  return matchCharactersIgnoringCase(candidateText, offset, keyword)
}

/** The offset of the first occurrence of a keyword of the table in the detection text, or null. */
function findKeyword(candidateText: string, keyword: string): number | null {
  return findCharacters(candidateText, 0, keyword)
}

/** A condition on the character right after the keyword (undefined at the end of the text). */
type AfterKeyword = (codePoint: number | undefined) => boolean

/** detection.md: "anything may follow". */
function anythingMayFollow(): boolean {
  return true
}

/** detection.md: "a non-word character or the end". */
function nonWordCharacterOrEnd(codePoint: number | undefined): boolean {
  return codePoint === undefined || !isWordCharacter(codePoint)
}

/** detection.md, entry 38: "whitespace, `:`, or the end". */
function whitespaceColonOrEnd(codePoint: number | undefined): boolean {
  return (
    codePoint === undefined || codePoint === COLON || isWhitespace(codePoint)
  )
}

/** detection.md, entry 39: "whitespace or the end". */
function whitespaceOrEnd(codePoint: number | undefined): boolean {
  return codePoint === undefined || isWhitespace(codePoint)
}

/**
 * detection.md, Where "start": the detection text, after any leading
 * whitespace, begins with the keyword, compared exactly.
 */
function atStart(keyword: string, after: AfterKeyword): Detector["matches"] {
  return (candidateText) => {
    const start = skipWhile(candidateText, 0, isWhitespace)
    const end = matchKeyword(candidateText, start, keyword)
    return end !== null && after(candidateText.codePointAt(end))
  }
}

/** Where "start", compared case-insensitively in the sense of Notation. */
function atStartIgnoringCase(
  keyword: string,
  after: AfterKeyword,
): Detector["matches"] {
  return (candidateText) => {
    const start = skipWhile(candidateText, 0, isWhitespace)
    const end = matchKeywordIgnoringCase(candidateText, start, keyword)
    return end !== null && after(candidateText.codePointAt(end))
  }
}

/** Where "anywhere": the keyword occurs somewhere in the detection text. */
function anywhere(keyword: string): Detector["matches"] {
  return (candidateText) => findKeyword(candidateText, keyword) !== null
}

/**
 * Where "whole text": the detection text, lower-cased and with leading and
 * trailing whitespace removed, equals the keyword. Lower-casing gives the
 * same result as case-insensitive matching for `error` (detection.md, Notes).
 */
function wholeText(keyword: string): Detector["matches"] {
  return (candidateText) => {
    const start = skipWhile(candidateText, 0, isWhitespace)
    const end = matchKeywordIgnoringCase(candidateText, start, keyword)
    return (
      end !== null &&
      skipWhile(candidateText, end, isWhitespace) === candidateText.length
    )
  }
}

/** detection.md, The detectors, in registration order. */
export const detectors: readonly Detector[] = [
  { id: "error", matches: wholeText("error") },
  { id: "---", matches: atStart("---", anythingMayFollow) },
  { id: "flowchart-elk", matches: atStart("flowchart-elk", anythingMayFollow) },
  { id: "mindmap", matches: atStart("mindmap", anythingMayFollow) },
  { id: "architecture", matches: atStart("architecture", anythingMayFollow) },
  {
    id: "agentflow",
    matches: atStart("agentflow-beta", nonWordCharacterOrEnd),
  },
  {
    id: "c4",
    matches: (candidateText) =>
      atStart("C4Context", anythingMayFollow)(candidateText) ||
      anywhere("C4Container")(candidateText) ||
      anywhere("C4Component")(candidateText) ||
      anywhere("C4Dynamic")(candidateText) ||
      anywhere("C4Deployment")(candidateText),
  },
  { id: "kanban", matches: atStart("kanban", anythingMayFollow) },
  { id: "classDiagram", matches: atStart("classDiagram", anythingMayFollow) },
  { id: "er", matches: atStart("erDiagram", anythingMayFollow) },
  { id: "gantt", matches: atStart("gantt", anythingMayFollow) },
  { id: "info", matches: atStart("info", anythingMayFollow) },
  { id: "pie", matches: atStart("pie", anythingMayFollow) },
  { id: "requirement", matches: atStart("requirement", anythingMayFollow) },
  { id: "sequence", matches: atStart("sequenceDiagram", anythingMayFollow) },
  { id: "swimlane", matches: atStart("swimlane-beta", nonWordCharacterOrEnd) },
  {
    id: "flowchart-v2",
    matches: (candidateText) =>
      atStart("graph", anythingMayFollow)(candidateText) ||
      atStart("flowchart", anythingMayFollow)(candidateText),
  },
  { id: "timeline", matches: atStart("timeline", anythingMayFollow) },
  { id: "gitGraph", matches: atStart("gitGraph", anythingMayFollow) },
  { id: "stateDiagram", matches: atStart("stateDiagram", anythingMayFollow) },
  { id: "journey", matches: atStart("journey", anythingMayFollow) },
  { id: "quadrantChart", matches: atStart("quadrantChart", anythingMayFollow) },
  { id: "sankey", matches: atStart("sankey", anythingMayFollow) },
  { id: "packet", matches: atStart("packet", anythingMayFollow) },
  { id: "xychart", matches: atStart("xychart", anythingMayFollow) },
  { id: "block", matches: atStart("block", anythingMayFollow) },
  { id: "eventmodeling", matches: atStart("eventmodeling", anythingMayFollow) },
  { id: "treeView", matches: atStart("treeView-beta", anythingMayFollow) },
  { id: "radar", matches: atStart("radar-beta", anythingMayFollow) },
  {
    id: "ishikawa",
    matches: atStartIgnoringCase("ishikawa", nonWordCharacterOrEnd),
  },
  { id: "treemap", matches: atStart("treemap", anythingMayFollow) },
  {
    id: "railroad",
    matches: atStartIgnoringCase("railroad-beta", anythingMayFollow),
  },
  {
    id: "railroadEbnf",
    matches: atStartIgnoringCase("railroad-ebnf-beta", anythingMayFollow),
  },
  {
    id: "railroadAbnf",
    matches: atStartIgnoringCase("railroad-abnf-beta", anythingMayFollow),
  },
  {
    id: "railroadPeg",
    matches: atStartIgnoringCase("railroad-peg-beta", anythingMayFollow),
  },
  { id: "venn", matches: atStart("venn-beta", anythingMayFollow) },
  {
    id: "wardley",
    matches: atStartIgnoringCase("wardley-beta", anythingMayFollow),
  },
  { id: "cynefin", matches: atStart("cynefin-beta", whitespaceColonOrEnd) },
  { id: "usecase", matches: atStart("usecase-beta", whitespaceOrEnd) },
]

/**
 * common.md, Diagram detection: the `%%` removal of detection. For each `%%`
 * from left to right that has a line break somewhere after it, the whitespace
 * directly before it (not reaching into text already removed), the `%%`, and
 * everything through the next line break are replaced by one line break. A
 * `%%` with no line break after it is left alone, and so is everything after
 * it.
 */
export function removePercentRuns(text: string): string {
  let result = ""
  // Where the kept text starts: after the last removal.
  let keptStart = 0
  let offset = 0
  while (offset < text.length) {
    const marker = findCodePoints(text, offset, COMMENT_MARKER)
    if (marker === null) break
    const lineBreakEnd = findLineBreakEnd(text, marker + 2)
    if (lineBreakEnd === null) break
    let whitespaceStart = marker
    while (whitespaceStart > keptStart) {
      const before = text.codePointAt(whitespaceStart - 1)
      if (before === undefined || !isWhitespace(before)) break
      whitespaceStart -= 1
    }
    result += `${text.slice(keptStart, whitespaceStart)}\n`
    keptStart = lineBreakEnd
    offset = lineBreakEnd
  }
  return result + text.slice(keptStart)
}

/** The offset after the first line terminator at or after `from`, or null. */
function findLineBreakEnd(text: string, from: number): number | null {
  for (
    let offset = from;
    offset < text.length;
    offset = nextOffset(text, offset)
  ) {
    const end = lineTerminatorEnd(text, offset)
    if (end !== null) return end
  }
  return null
}

/**
 * common.md, Diagram detection: the last steps of deriving the detection
 * text from `prepared`, the text after the frontmatter without its
 * directives and comment regions. Leading whitespace is removed, a
 * frontmatter block at the start is removed, directives are found once more
 * in one scan (a directive can start at a `%%{` that whitespace and a word
 * follow only in this text, or that is formed only in this text) and
 * removed, and the `%%` runs are removed.
 */
function deriveDetectionText(prepared: string): string {
  let derived = prepared.slice(skipWhile(prepared, 0, isWhitespace))
  const frontmatter = matchFrontmatter(derived, 0)
  if (frontmatter !== null) derived = derived.slice(frontmatter.end)
  const secondScan = findDirectives(derived, 0).map(
    (directive) => directive.range,
  )
  return removePercentRuns(withoutRanges(derived, 0, secondScan))
}

/** common.md, Diagram detection: the detection text, and where the first character that is not trivia is. */
export interface DetectionInput {
  /** The detection text, as the detectors look at it. */
  readonly detectionText: string
  /** The offset of the first character after the frontmatter that is not trivia, or the end of the source. */
  readonly firstTokenOffset: number
}

/**
 * common.md, Diagram detection: builds the detection text from the whole
 * source, walking the comment regions and line segments that the lexer
 * decides: each comment region and each directive is left out, so that the
 * characters before and after a directive follow one another, each line
 * terminator of the source is one `\n`, and {@link deriveDetectionText}
 * does the rest.
 */
export function buildDetectionInput(lexer: SourceLexer): DetectionInput {
  const { text } = lexer
  let prepared = ""
  let firstTokenOffset = text.length
  for (const entry of lexer.lineEntries()) {
    if (entry.kind === "region") continue
    let offset = entry.start
    while (offset < entry.end) {
      const directive = entry.directives.get(offset)
      if (directive !== undefined) {
        offset = directive.range[1]
        continue
      }
      const codePoint = text.codePointAt(offset)
      const next = nextOffset(text, offset)
      if (
        firstTokenOffset === text.length &&
        codePoint !== undefined &&
        !isWhitespace(codePoint)
      ) {
        firstTokenOffset = offset
      }
      prepared += text.slice(offset, next)
      offset = next
    }
    // The separator after the segment stays in the detection text. A line
    // terminator of the source stays one line terminator, written as `\n`,
    // so that a lone `\r` does not join a `\n` from which a directive or a
    // comment region left out now separates it (common.md, Line
    // terminators).
    if (entry.end < text.length) {
      prepared +=
        lineTerminatorEnd(text, entry.end) === null
          ? text.slice(entry.end, nextOffset(text, entry.end))
          : "\n"
    }
  }
  return { detectionText: deriveDetectionText(prepared), firstTokenOffset }
}

/**
 * common.md, Diagram detection: the first detector whose condition holds
 * selects the diagram type. Returns null when none matches.
 */
export function detect(detectionTextValue: string): DetectorId | null {
  for (const detector of detectors) {
    if (detector.matches(detectionTextValue)) return detector.id
  }
  return null
}

/** The text from `from`, with the given ranges removed and the rest joined. */
function withoutRanges(
  text: string,
  from: number,
  ranges: readonly Range[],
): string {
  let joined = ""
  let offset = from
  for (const [start, end] of ranges) {
    joined += text.slice(offset, start)
    offset = end
  }
  return joined + text.slice(offset)
}
