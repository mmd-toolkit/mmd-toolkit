import { isOutsideBmp, isWhitespace } from "../../character-classes.ts"
import {
  CHARACTER_TABULATION,
  COLON,
  LEFT_CURLY_BRACKET,
  LINE_FEED,
  SPACE,
} from "../../code-points.ts"
import { isHws } from "../../common-form-unit-lexer.ts"
import type { PassedPart } from "../../detection.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import { ParseError } from "../../errors.ts"
import { firstIndexWhere } from "../../ordered-search.ts"
import type { LineIndex } from "../../positions.ts"
import { matchWord, samePosition, skipWhile } from "../../scanning.ts"

/** Box-drawing reading: a branch and each adjacent dash are separate components. */
export function isBranch(codePoint: number): boolean {
  return (
    codePoint === 0x2514 ||
    codePoint === 0x2517 ||
    codePoint === 0x251c ||
    codePoint === 0x2523
  )
}

/** Box-drawing reading: the two horizontal strokes. */
export function isDash(codePoint: number): boolean {
  return codePoint === 0x2500 || codePoint === 0x2501
}

/** Scope and mode: vertical-only lines are excluded from mode detection. */
function isVertical(codePoint: number): boolean {
  return codePoint === 0x2502 || codePoint === 0x2503
}

/** Scope and mode: the complete set of box characters. */
function isBox(codePoint: number): boolean {
  return isBranch(codePoint) || isDash(codePoint) || isVertical(codePoint)
}

/** Detection: passed bare lines and their accompanying trivia are not read again. */
export class TreeviewSource implements DiagramText {
  private readonly reader: DiagramText

  private readonly bareLines: readonly Extract<
    PassedPart,
    { kind: "bare-percent-line" }
  >[]

  public constructor(reader: DiagramText, passed: readonly PassedPart[]) {
    this.reader = reader
    this.bareLines = passed.filter((part) => part.kind === "bare-percent-line")
  }

  public first(): DiagramCharacter {
    return this.skipPassed(this.reader.first())!
  }

  public after(character: DiagramCharacter): DiagramPosition {
    return this.skipPassed(this.reader.after(character))
  }

  /** Preserve retained forms, excluding only detection-passed intervals and padding. */
  private skipPassed(at: DiagramPosition): DiagramPosition {
    let next = at
    for (;;) {
      if (next === null) return null
      const offset = next.start
      const passed = this.bareLines.some(
        (part) => offset >= part.start && offset < part.next,
      )
      if (!passed) return next
      next = this.reader.after(next)
    }
  }
}

/** A logical source line, before the box rules; offsets always address the input. */
interface SourceLine {
  readonly start: DiagramCharacter
  readonly lf: DiagramCharacter
  readonly first: DiagramCharacter | null
  readonly last: DiagramCharacter | null
  readonly branch: DiagramCharacter | null
  readonly column: number
  readonly hasBox: boolean
  readonly onlyBox: boolean
  readonly onlyVertical: boolean
  readonly excluded: boolean
}

/** A retained box form and the source positions needed by its direct reading. */
export type BoxForm =
  | {
      readonly kind: "branch-prefix"
      readonly start: DiagramCharacter
      readonly end: DiagramPosition
      readonly marker: DiagramCharacter
      readonly content: DiagramCharacter
      readonly indent: number
    }
  | {
      readonly kind: "box-decoration"
      readonly start: DiagramCharacter
      readonly end: DiagramPosition
    }

/** Scope and mode: metadata shape is independent of lexical quote/block contexts. */
function isMetadata(reader: DiagramText, at: DiagramCharacter): boolean {
  const title = matchWord(reader, at, "title")
  if (title?.end != null && isHws(title.end)) return true
  for (const keyword of ["accTitle", "accDescr"]) {
    const word = matchWord(reader, at, keyword)
    if (word === null) continue
    const end = skipWhile(reader, word.end, isHws)
    if (
      end?.codePoint === COLON ||
      (keyword === "accDescr" && end?.codePoint === LEFT_CURLY_BRACKET)
    )
      return true
  }
  return false
}

/** Scope and mode, Columns: inspect logical lines, without producing another text. */
function sourceLines(reader: DiagramText): SourceLine[] {
  const lines: SourceLine[] = []
  let at: DiagramPosition = reader.first()
  while (at !== null) {
    const start = at
    let first: DiagramCharacter | null = null
    let last: DiagramCharacter | null = null
    let branch: DiagramCharacter | null = null
    let branchColumn = 0
    let column = 0
    let hasBox = false
    let onlyBox = true
    let onlyVertical = true
    while (at !== null && at.codePoint !== LINE_FEED) {
      if (!isWhitespace(at.codePoint)) {
        first ??= at
        last = at
        onlyBox &&= isBox(at.codePoint)
        onlyVertical &&= isVertical(at.codePoint)
      }
      if (branch === null && isBranch(at.codePoint)) {
        branch = at
        branchColumn = column
      }
      hasBox ||= isBox(at.codePoint)
      column +=
        at.codePoint === CHARACTER_TABULATION
          ? 4
          : isOutsideBmp(at.codePoint)
            ? 2
            : 1
      at = reader.after(at)
    }
    if (at === null) break
    const excluded =
      first === null ||
      onlyVertical ||
      matchWord(reader, first, "%%") !== null ||
      isMetadata(reader, first)
    lines.push({
      start,
      lf: at,
      first,
      last,
      branch,
      column: branchColumn,
      hasBox,
      onlyBox,
      onlyVertical,
      excluded,
    })
    at = reader.after(at)
  }
  return lines
}

/**
 * Box-drawing reading: navigate source positions directly. Prefixes remain real
 * branch characters, interpreted as assigned padding by the unit readers; no
 * spaces, rewritten diagram, or line-number map is synthesized. Decorations
 * remain source anchors until their owner (a gap or an open value) is known.
 */
export class TreeviewText implements DiagramText {
  private readonly source: DiagramText

  private readonly forms = new Map<number, BoxForm>()

  private readonly redirects = new Map<number, DiagramCharacter>()

  private readonly afterForms = new Map<number, DiagramPosition>()

  private readonly branchContents: {
    readonly start: number
    readonly end: number
  }[] = []

  public constructor(source: DiagramText, lines: LineIndex) {
    this.source = source
    const physical = sourceLines(source)
    const header = physical.findIndex((line) => {
      if (line.first === null) return false
      const word = matchWord(source, line.first, "treeView-beta")
      if (word === null) return false
      const end = skipWhile(
        source,
        word.end,
        (c) => c.codePoint !== LINE_FEED && isWhitespace(c.codePoint),
      )
      return samePosition(end, line.lf)
    })
    if (header === -1) return
    const following = physical.slice(header + 1)
    const candidates = following.filter((line) => !line.excluded)
    if (!candidates.some((line) => line.hasBox)) return
    const width =
      candidates.find((line) => line.branch !== null && line.column > 0)
        ?.column ?? 4
    for (const line of following) this.classify(line, width, lines)
  }

  public first(): DiagramCharacter {
    return this.convert(this.source.first())!
  }

  public after(character: DiagramCharacter): DiagramPosition {
    const after = this.afterForms.has(character.start)
      ? this.afterForms.get(character.start)!
      : this.source.after(character)
    return this.convert(after)
  }

  /** A source box anchor at this position, never a synthetic whitespace character. */
  public formAt(at: DiagramCharacter): BoxForm | null {
    return this.forms.get(at.start) ?? null
  }

  /** Line classification and errors: cases in the specification's written order. */
  private classify(line: SourceLine, width: number, lines: LineIndex): void {
    if (line.first === null || line.last === null) return
    if (
      matchWord(this.source, line.first, "%%") !== null ||
      isMetadata(this.source, line.first)
    )
      return
    if (line.onlyVertical) {
      this.addDecoration(line)
      return
    }
    if (line.branch !== null) {
      let lastPrefix = line.branch
      let end = this.source.after(lastPrefix)
      while (end !== null && isDash(end.codePoint)) {
        lastPrefix = end
        end = this.source.after(end)
      }
      const content = skipWhile(this.source, end, isHws)
      if (content === null || content.start > line.last.start) {
        const range: [number, number] = [line.first.start, lastPrefix.end]
        throw new ParseError(
          "A treeview branch must have content",
          range,
          lines.location(range),
        )
      }
      const form: BoxForm = {
        kind: "branch-prefix",
        start: line.first,
        end,
        marker: line.branch,
        content,
        indent: 4 * (Math.floor(line.column / width + 0.5) + 1),
      }
      this.forms.set(line.branch.start, form)
      this.redirects.set(line.start.start, line.branch)
      this.afterForms.set(line.branch.start, content)
      const tail = this.source.after(line.last)
      if (tail !== null && !samePosition(tail, line.lf))
        this.redirects.set(tail.start, line.lf)
      this.branchContents.push({ start: content.start, end: line.last.end })
      return
    }
    if (line.onlyBox) {
      this.addDecoration(line)
      return
    }
    if (line.hasBox) return
    if (isWhitespace(line.start.codePoint)) {
      const range: [number, number] = [line.start.start, line.first.start]
      throw new ParseError(
        "Cannot mix ordinary indentation with treeview branches",
        range,
        lines.location(range),
      )
    }
  }

  /** Decorations exclude outer whitespace and their following LF, without losing ownership. */
  private addDecoration(line: SourceLine): void {
    const start = line.first!
    this.forms.set(start.start, {
      kind: "box-decoration",
      start,
      end: this.source.after(line.last!),
    })
    this.redirects.set(line.start.start, start)
    this.afterForms.set(start.start, this.source.after(line.lf))
  }

  /** Columns and prefix indentation: only remaining branch content expands tabs. */
  private convert(at: DiagramPosition): DiagramPosition {
    if (at === null) return null
    const next = this.redirects.get(at.start) ?? at
    if (next.codePoint !== CHARACTER_TABULATION) return next
    const index = firstIndexWhere(
      this.branchContents,
      (range) => range.end > next.start,
    )
    const content = this.branchContents[index]
    if (content === undefined || next.start < content.start) return next
    return {
      ...next,
      codePoint: SPACE,
      convertedForm: "    ",
      offsetInConvertedForm: 0,
    }
  }
}
