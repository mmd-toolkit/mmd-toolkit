import type { DiagramType, Range } from "./ast.ts"
import {
  COMMENT_MARKER,
  isWhitespace,
  isWordCharacter,
  matchesIgnoringCase,
} from "./character-classes.ts"
import { COLON, LEFT_CURLY_BRACKET, PERCENT_SIGN } from "./code-points.ts"
import type { DirectiveRuleText } from "./directives.ts"
import { findDirectives, matchDirective } from "./directives.ts"
import { matchFrontmatter, matchFrontmatterIn } from "./frontmatter.ts"
import type { SourceLexer } from "./source-lexer.ts"
import {
  findCodePoints,
  lineTerminatorEnd,
  matchCharactersIgnoringCase,
  nextOffset,
  skipWhile,
} from "./text-cursor.ts"

/** detection.md: the id a detector selects. `---` is a pseudo-diagram that is always rejected. */
export type DetectorId = DiagramType | "---"

/**
 * common.md, Diagram detection: the diagram text from an offset, as the
 * detectors read it, one character at a time. Directives and comment regions
 * are left out (see {@link SourceLexer.skipDirectivesAndComments}).
 */
interface DetectionCharacter {
  /** The character, or undefined at the end of the text. */
  readonly codePoint: number | undefined
  /** Where the character starts in the source. */
  readonly start: number
  /** The offset after the character: after a whole `\r\n` for a line terminator. */
  readonly end: number
}

/** The character of the diagram text at or after `offset`. */
function characterAt(lexer: SourceLexer, offset: number): DetectionCharacter {
  const { text } = lexer
  const start = lexer.skipDirectivesAndComments(offset)
  if (start >= text.length) {
    return { codePoint: undefined, start: text.length, end: text.length }
  }
  return {
    codePoint:
      lineTerminatorEnd(text, start) === null ? text.codePointAt(start) : 0x0a,
    start,
    end: lineTerminatorEnd(text, start) ?? nextOffset(text, start),
  }
}

/** detection.md, The detectors: one entry of the table after the two pseudo-diagrams. */
export interface Detector {
  readonly id: DiagramType
  /** Whether the detector's condition holds for the diagram text at `position`. */
  readonly matches: (lexer: SourceLexer, position: number) => boolean
}

/** Whether two characters are equal, or match in the sense of detection.md's Case column. */
type CompareCharacters = (actual: number, expected: number) => boolean

/** detection.md, Case "exact". */
function exactly(actual: number, expected: number): boolean {
  return actual === expected
}

/**
 * detection.md, How to read the list: whether the diagram text at `position`
 * begins with `keyword`, each character compared with `compare`. Returns the
 * offset after the keyword, or null. Reads no further than the keyword.
 */
function keywordEnd(
  lexer: SourceLexer,
  position: number,
  keyword: string,
  compare: CompareCharacters,
): number | null {
  let offset = position
  for (const expected of keyword) {
    const found = characterAt(lexer, offset)
    const expectedCodePoint = expected.codePointAt(0)
    if (
      found.codePoint === undefined ||
      expectedCodePoint === undefined ||
      !compare(found.codePoint, expectedCodePoint)
    ) {
      return null
    }
    offset = found.end
  }
  return offset
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
 * detection.md, Where "start": the diagram text at the position begins with
 * the keyword, compared exactly, and the character after it satisfies
 * `after`. Reads the keyword and the character after it, no further.
 */
function atStart(keyword: string, after: AfterKeyword): Detector["matches"] {
  return (lexer, position) => {
    const end = keywordEnd(lexer, position, keyword, exactly)
    return end !== null && after(characterAt(lexer, end).codePoint)
  }
}

/** Where "start", compared case-insensitively in the sense of Notation. */
function atStartIgnoringCase(
  keyword: string,
  after: AfterKeyword,
): Detector["matches"] {
  return (lexer, position) => {
    const end = keywordEnd(lexer, position, keyword, matchesIgnoringCase)
    return end !== null && after(characterAt(lexer, end).codePoint)
  }
}

/**
 * detection.md, The detectors, entries 3 to 39, in registration order. The
 * two pseudo-diagrams before them, entries 1 and 2, are decided in
 * {@link detectDiagram}: the `error` pseudo-diagram from the detection
 * point, and the `---` pseudo-diagram at the position reached, as these.
 */
export const detectors: readonly Detector[] = [
  { id: "flowchart-elk", matches: atStart("flowchart-elk", anythingMayFollow) },
  { id: "mindmap", matches: atStart("mindmap", anythingMayFollow) },
  { id: "architecture", matches: atStart("architecture", anythingMayFollow) },
  {
    id: "agentflow",
    matches: atStart("agentflow-beta", nonWordCharacterOrEnd),
  },
  {
    id: "c4",
    matches: (lexer, position) =>
      atStart("C4Context", anythingMayFollow)(lexer, position) ||
      atStart("C4Container", anythingMayFollow)(lexer, position) ||
      atStart("C4Component", anythingMayFollow)(lexer, position) ||
      atStart("C4Dynamic", anythingMayFollow)(lexer, position) ||
      atStart("C4Deployment", anythingMayFollow)(lexer, position),
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
    matches: (lexer, position) =>
      atStart("graph", anythingMayFollow)(lexer, position) ||
      atStart("flowchart", anythingMayFollow)(lexer, position),
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
    const marker = findCodePoints(text, offset, text.length, COMMENT_MARKER)
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
 * common.md, Diagram detection, the `error` pseudo-diagram: the diagram text
 * from `position` to the end of the text, read through the directives and
 * comment regions of the source, as a string on which the condition makes
 * its removals. Each line terminator of the source is one `\n`, so that a
 * lone `\r` does not join a `\n` from which a directive or a comment region
 * left out now separates it (common.md, Line terminators).
 */
function diagramTextFrom(lexer: SourceLexer, position: number): string {
  const { text } = lexer
  let diagramText = ""
  let offset = position
  for (;;) {
    const found = characterAt(lexer, offset)
    if (found.codePoint === undefined) return diagramText
    diagramText +=
      lineTerminatorEnd(text, found.start) === null
        ? text.slice(found.start, found.end)
        : "\n"
    offset = found.end
  }
}

/**
 * common.md, Diagram detection: the diagram text as the rule of Where a
 * directive is reads it once more, through the directives and comment
 * regions of the source, as a unit is read through them; its offsets are
 * those of the source.
 */
function detectionRuleText(lexer: SourceLexer): DirectiveRuleText {
  return {
    codePointAt: (offset) => characterAt(lexer, offset).codePoint,
    after: (offset) => characterAt(lexer, offset).end,
  }
}

/**
 * common.md, Diagram detection: where detection goes on after a directive
 * that the rule of Where a directive is finds once more at `position`, in the
 * diagram text from there, where leaving out the directives and comment
 * regions of the source has brought `%%{`, whitespace, and a word together;
 * null when no such directive starts there. The directive reaches as far as
 * the rule takes it, past line terminators when it is not closed.
 */
function afterDirectiveFoundOnceMore(
  lexer: SourceLexer,
  position: number,
): number | null {
  return matchDirective(detectionRuleText(lexer), position)?.end ?? null
}

/**
 * common.md, Diagram detection, the `error` pseudo-diagram: the diagram text
 * from the detection point ({@link diagramTextFrom}) with the three things
 * that its condition leaves out removed. A block at the start that satisfies
 * the conditions of Frontmatter is
 * removed, the directives that one more scan finds in this text are removed,
 * and the comments of the pseudo-diagram are removed
 * ({@link removePercentRuns}).
 */
export function errorConditionText(
  lexer: SourceLexer,
  detectionPoint: number,
): string {
  const diagramText = diagramTextFrom(lexer, detectionPoint)
  const frontmatter = matchFrontmatter(diagramText, 0)
  const afterFrontmatter =
    frontmatter === null ? diagramText : diagramText.slice(frontmatter.end)
  const secondScan = findDirectives(afterFrontmatter, 0).map(
    (directive) => directive.range,
  )
  return removePercentRuns(withoutRanges(afterFrontmatter, 0, secondScan))
}

/**
 * common.md, Diagram detection, the `error` pseudo-diagram (detection.md,
 * Where "whole text"): the text of {@link errorConditionText} is the word
 * `error`, compared case-insensitively, with nothing but whitespace and line
 * terminators around it.
 */
function isErrorPseudoDiagram(
  lexer: SourceLexer,
  detectionPoint: number,
): boolean {
  const conditionText = errorConditionText(lexer, detectionPoint)
  const start = skipWhile(conditionText, 0, isWhitespace)
  const end = matchCharactersIgnoringCase(conditionText, start, "error")
  return (
    end !== null &&
    skipWhile(conditionText, end, isWhitespace) === conditionText.length
  )
}

/**
 * common.md, Diagram detection: whether a bare `%%` line starts at
 * `position`, the first character of its line that is not trivia: the
 * diagram text there begins with `%%` followed by a line terminator, the end
 * of the text, or `{`. A `{` read here starts no directive: the lexer left
 * out the directives of the source, and {@link positionReached} skips a
 * directive found once more before it asks this. Returns the offset after
 * the second `%`, where the text after the mark starts, or null when no bare
 * `%%` line starts there.
 */
function bareCommentLineAt(
  lexer: SourceLexer,
  position: number,
): number | null {
  const first = characterAt(lexer, position)
  if (first.codePoint !== PERCENT_SIGN) return null
  const second = characterAt(lexer, first.end)
  if (second.codePoint !== PERCENT_SIGN) return null
  const third = characterAt(lexer, second.end)
  const isBare =
    third.codePoint === undefined ||
    third.codePoint === LEFT_CURLY_BRACKET ||
    lineTerminatorEnd(lexer.text, third.start) !== null
  return isBare ? second.end : null
}

/**
 * The opening `%%{` of the directive found once more at `start`: from its
 * first `%` to the offset after its `{`, the directives and comment regions
 * of the source between them included.
 */
function openingOf(lexer: SourceLexer, start: number): Range {
  const second = characterAt(lexer, characterAt(lexer, start).end)
  return [start, characterAt(lexer, second.end).end]
}

/**
 * Where the line of diagram text that goes on at `position` ends: `end`,
 * where the line terminator that ends it starts, or the end of the text, and
 * `next`, the offset after that line terminator.
 */
function lineEndFrom(
  lexer: SourceLexer,
  position: number,
): { readonly end: number; readonly next: number } {
  let offset = position
  for (;;) {
    const found = characterAt(lexer, offset)
    if (
      found.codePoint === undefined ||
      lineTerminatorEnd(lexer.text, found.start) !== null
    ) {
      return { end: found.start, next: found.end }
    }
    offset = found.end
  }
}

/**
 * common.md, Diagram detection: one thing that detection read and passed
 * between the detection point and the position reached, which the diagram's
 * lexer does not read again (see `commentsBeforeHeader`).
 */
export type PassedPart =
  | {
      readonly kind: "bare-percent-line"
      /** Where the `%%` of the line starts. */
      readonly start: number
      /** The offset after the second `%` of the `%%`, where the text after the mark starts. */
      readonly valueStart: number
      /** Where the line ends: where the line terminator that ends it starts, or the end of the text. */
      readonly end: number
      /** End of the line and its accompanying trivia, which the diagram does not read again. */
      readonly next: number
    }
  | {
      readonly kind: "directive-found-once-more"
      /** Its opening `%%{` ({@link openingOf}). */
      readonly opening: Range
    }

/**
 * common.md, Diagram detection: the position that detection reaches from the
 * detection point, and what it passed on the way. At each position it
 * reaches, a directive found once more there is skipped as far as the rule
 * reaches; otherwise a bare `%%` line is skipped as a whole, whatever follows
 * on it, up to and with the line terminator of its diagram text. The trivia
 * after either is skipped with it.
 */
function positionReached(
  lexer: SourceLexer,
  detectionPoint: number,
): {
  readonly position: number
  readonly passed: readonly PassedPart[]
  readonly retainedFrontmatterStart: number | null
} {
  const passed: PassedPart[] = []
  const block = matchFrontmatterIn(detectionRuleText(lexer), detectionPoint)
  let position = block === null ? detectionPoint : lexer.skipTrivia(block.end)
  for (;;) {
    const afterDirective = afterDirectiveFoundOnceMore(lexer, position)
    if (afterDirective !== null) {
      passed.push({
        kind: "directive-found-once-more",
        opening: openingOf(lexer, position),
      })
      position = lexer.skipTrivia(afterDirective)
      continue
    }
    const valueStart = bareCommentLineAt(lexer, position)
    if (valueStart === null)
      return {
        position,
        passed,
        retainedFrontmatterStart: block === null ? null : detectionPoint,
      }
    const line = lineEndFrom(lexer, valueStart)
    const next = lexer.skipTrivia(line.next)
    passed.push({
      kind: "bare-percent-line",
      start: position,
      valueStart,
      end: line.end,
      next,
    })
    position = next
  }
}

/** common.md, Diagram detection: what detection decides. */
export interface Detection {
  /** The id that the first matching detector selects, or null when none matches. */
  readonly detected: DetectorId | null
  /** The detection point: the first position after the frontmatter that is not leading trivia, or the end of the source. */
  readonly detectionPoint: number
  /** The position that detection reaches from the detection point ({@link positionReached}), where every detector but that of the `error` pseudo-diagram looks, and where the diagram's lexer starts. */
  readonly positionReached: number
  /** A block passed once at the detection point, retained for pie, gitgraph, info, packet and architecture; null when absent. */
  readonly retainedFrontmatterStart: number | null
  /** What detection passed before {@link Detection.positionReached}, in source order; none for the `error` pseudo-diagram. */
  readonly passed: readonly PassedPart[]
}

/**
 * common.md, Diagram detection: decides the diagram type in the one reading
 * of the source. The detection point is the first position that is not
 * leading trivia. The `error` pseudo-diagram, entry 1 of detection.md, looks
 * at the diagram text from the detection point; every other detector, the
 * `---` pseudo-diagram first and then the others in registration order,
 * looks at the position reached ({@link positionReached}).
 */
export function detectDiagram(lexer: SourceLexer): Detection {
  const detectionPoint = lexer.firstTokenStart()
  if (isErrorPseudoDiagram(lexer, detectionPoint)) {
    return {
      detected: "error",
      detectionPoint,
      positionReached: detectionPoint,
      retainedFrontmatterStart: null,
      passed: [],
    }
  }
  const { position, passed, retainedFrontmatterStart } = positionReached(
    lexer,
    detectionPoint,
  )
  const reached = {
    detectionPoint,
    positionReached: position,
    retainedFrontmatterStart,
    passed,
  }
  if (keywordEnd(lexer, position, "---", exactly) !== null) {
    return { detected: "---", ...reached }
  }
  const detector = detectors.find((entry) => entry.matches(lexer, position))
  return { detected: detector?.id ?? null, ...reached }
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
