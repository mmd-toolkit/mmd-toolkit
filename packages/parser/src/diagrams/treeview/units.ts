import { isAsciiLetter, isWordCharacter } from "../../character-classes.ts"
import {
  APOSTROPHE,
  COLON,
  HYPHEN_MINUS,
  LEFT_CURLY_BRACKET,
  LEFT_PARENTHESIS,
  LINE_FEED,
  LOW_LINE,
  QUOTATION_MARK,
  RIGHT_CURLY_BRACKET,
  RIGHT_PARENTHESIS,
} from "../../code-points.ts"
import { CommonFormUnitLexer, isHws } from "../../common-form-unit-lexer.ts"
import type { CommonFormUnitName } from "../../common-form-unit-lexer.ts"
import { isWhitespace } from "../../character-classes.ts"
import type {
  DiagramCharacter,
  DiagramPosition,
  DiagramText,
} from "../../diagram-text.ts"
import type { DiagramUnit, UnitEnds } from "../../diagram-units.ts"
import { readUnit } from "../../diagram-units.ts"
import type { LineIndex } from "../../positions.ts"
import {
  isCodePointAt,
  matchWord,
  samePosition,
  skipWhile,
} from "../../scanning.ts"
import type { BoxForm, TreeviewText } from "./treeview-text.ts"

/** Ordered units, split only at authored atomic component boundaries. */
type TreeviewUnitName =
  | "treeView-beta"
  | ":::"
  | "icon"
  | "("
  | ")"
  | "##"
  | "class-name"
  | "icon-reference"
  | "description-text"
  | "indentation"
  | "quoted-name"
  | "bare-name"
  | "branch-prefix"
  | "box-decoration"

/** Reused common components do not import the shared common grammar. */
export type UnitName = TreeviewUnitName | CommonFormUnitName

/** A branch's assigned indentation and marker are decided once by lexing. */
export interface PrefixReading {
  readonly indent: number
  readonly marker: string
}

/** Ordinary units need no derived data; branch-prefix units keep their direct reading. */
export interface Unit extends DiagramUnit<UnitName> {
  readonly prefix?: PrefixReading
}

/** Annotations: the first character of a class name. */
function isClassStart(at: DiagramCharacter): boolean {
  return isAsciiLetter(at.codePoint) || at.codePoint === LOW_LINE
}

/** Annotations: the complete class suffix and either side of an icon colon. */
function isReferenceCharacter(at: DiagramCharacter): boolean {
  return isWordCharacter(at.codePoint) || at.codePoint === HYPHEN_MINUS
}

/** diagrams/treeview.md, Ordered units: one first-match context with hidden LF. */
export class TreeviewUnitLexer extends CommonFormUnitLexer<TreeviewUnitName> {
  private readonly boxText: TreeviewText

  private readonly source: DiagramText

  private readonly passedTriviaEnd: number

  public constructor(
    reader: TreeviewText,
    source: DiagramText,
    lines: LineIndex,
    passedTriviaEnd: number,
  ) {
    super(reader, lines)
    this.boxText = reader
    this.source = source
    this.passedTriviaEnd = passedTriviaEnd
  }

  /** Box rules apply independently of lexical units; their authored forms remain units. */
  protected override readInContext(at: DiagramCharacter): void {
    if (at.start < this.passedTriviaEnd && isWhitespace(at.codePoint)) {
      this.position = skipWhile(this.reader, at, (c) =>
        isWhitespace(c.codePoint),
      )
      return
    }
    const form = this.boxText.formAt(at)
    if (form?.kind === "box-decoration") {
      this.addBoxForm(form)
      this.position = this.reader.after(at)
      return
    }
    if (form?.kind === "branch-prefix") {
      this.addBoxForm(form)
      this.position = this.reader.after(at)
      this.readOrdered(form.content, true)
      return
    }
    this.readOrdered(at, false)
  }

  /** Rules 1-13: hidden ASCII whitespace is pre-empted by indentation, so has no reader. */
  private readOrdered(at: DiagramCharacter, prefixPadding: boolean): void {
    if (
      this.readHeader(at) ||
      this.readAccDescr(at) ||
      this.readAccTitle(at) ||
      this.readTitle(at) ||
      this.readClassAnnotation(at, prefixPadding) ||
      this.readIconAnnotation(at, prefixPadding) ||
      this.readDescriptionAnnotation(at, prefixPadding) ||
      this.readIndentation(at) ||
      this.readQuotedName(at) ||
      this.readComment(at) ||
      this.skipNewline(at) ||
      this.readBareName(at)
    )
      return
    throw this.noRuleMatches(at)
  }

  /** Header boundary: the sole explicit longer alternative is the whole bare name. */
  private readHeader(at: DiagramCharacter): boolean {
    const match = this.matchKeyword(at, "treeView-beta")
    if (match === null) return false
    this.readUnitOrLongerAlternative(
      at,
      "treeView-beta",
      match.end,
      "bare-name",
      this.bareNameEnd(at),
    )
    return true
  }

  /** Common forms: colon first; a block's required opener gap owns any box forms. */
  protected override readAccDescr(at: DiagramCharacter): boolean {
    const start = skipWhile(this.reader, at, isHws)
    if (start === null) return false
    const word = matchWord(this.reader, start, "accDescr")
    if (word === null) return false
    const colon = skipWhile(this.reader, word.end, isHws)
    if (isCodePointAt(colon, COLON)) return super.readAccDescr(at)
    let brace = word.end
    const forms: BoxForm[] = []
    while (brace !== null) {
      const form = this.boxText.formAt(brace)
      if (form !== null) {
        forms.push(form)
        brace = this.reader.after(brace)
      } else if (isWhitespace(brace.codePoint)) brace = this.reader.after(brace)
      else break
    }
    if (!isCodePointAt(brace, LEFT_CURLY_BRACKET)) return false
    const value = this.reader.after(brace)
    const close = skipWhile(
      this.reader,
      value,
      (c) => c.codePoint !== RIGHT_CURLY_BRACKET,
    )
    if (close === null) return false
    this.addUnit("accDescr", start, word.end)
    for (const form of forms) this.addBoxForm(form)
    this.addUnit("{", brace, value)
    // Authored values retain box forms and line endings skipped by the close search.
    const writtenValue = this.source.after(brace)
    if (writtenValue !== null && !samePosition(writtenValue, close)) {
      this.units.push(
        readUnit(
          this.source,
          "block-text",
          this.units.length,
          writtenValue,
          close,
          null,
          "keep-whitespace",
        ),
      )
    }
    this.read("}", close, this.reader.after(close))
    return true
  }

  /** Annotations: their leading ASCII run, or the padding denoted by a branch. */
  private annotationStart(
    at: DiagramCharacter,
    prefixPadding: boolean,
  ): DiagramPosition {
    return prefixPadding || isHws(at) ? skipWhile(this.reader, at, isHws) : null
  }

  /** Rule 5: only a complete class composite wins before indentation. */
  private readClassAnnotation(
    at: DiagramCharacter,
    prefixPadding: boolean,
  ): boolean {
    const start = this.annotationStart(at, prefixPadding)
    if (start === null) return false
    const marker = matchWord(this.reader, start, ":::")
    if (marker === null) return false
    const name = skipWhile(this.reader, marker.end, isHws)
    if (name === null || !isClassStart(name)) return false
    const end = skipWhile(
      this.reader,
      this.reader.after(name),
      isReferenceCharacter,
    )
    this.addUnit(":::", start, marker.end)
    this.read("class-name", name, end)
    return true
  }

  /** Rule 6: the whole reference is one atom, including an optional single colon. */
  private readIconAnnotation(
    at: DiagramCharacter,
    prefixPadding: boolean,
  ): boolean {
    const start = this.annotationStart(at, prefixPadding)
    if (start === null) return false
    const word = matchWord(this.reader, start, "icon")
    if (word === null || !isCodePointAt(word.end, LEFT_PARENTHESIS))
      return false
    const value = this.reader.after(word.end)
    let end = skipWhile(this.reader, value, isReferenceCharacter)
    if (isCodePointAt(end, COLON)) {
      const after = this.reader.after(end)
      if (after === null || !isReferenceCharacter(after)) return false
      end = skipWhile(this.reader, after, isReferenceCharacter)
    }
    if (!isCodePointAt(end, RIGHT_PARENTHESIS)) return false
    this.addUnit("icon", start, word.end)
    this.addUnit("(", word.end, value)
    if (value !== null && !samePosition(value, end))
      this.addUnit("icon-reference", value, end)
    this.read(")", end, this.reader.after(end))
    return true
  }

  /** Rule 7: percent pairs and all later annotation-looking text belong to this line value. */
  private readDescriptionAnnotation(
    at: DiagramCharacter,
    prefixPadding: boolean,
  ): boolean {
    const start = this.annotationStart(at, prefixPadding)
    if (start === null) return false
    const marker = matchWord(this.reader, start, "##")
    if (marker === null) return false
    this.addUnit("##", start, marker.end)
    const end = skipWhile(
      this.reader,
      marker.end,
      (c) => c.codePoint !== LINE_FEED,
    )
    if (marker.end !== null && !samePosition(marker.end, end))
      this.addUnit("description-text", marker.end, end, "keep-whitespace")
    this.position = end
    return true
  }

  /** Rule 8: one maximal ASCII run, with tabs counted once outside branches. */
  private readIndentation(at: DiagramCharacter): boolean {
    if (!isHws(at)) return false
    this.read("indentation", at, skipWhile(this.reader, at, isHws))
    return true
  }

  /** Rule 9: the next effective matching quote closes; backslashes are ordinary. */
  private readQuotedName(at: DiagramCharacter): boolean {
    if (at.codePoint !== QUOTATION_MARK && at.codePoint !== APOSTROPHE)
      return false
    const close = skipWhile(
      this.reader,
      this.reader.after(at),
      (c) => c.codePoint !== at.codePoint,
    )
    if (close === null) return false
    this.read("quoted-name", at, this.reader.after(close), "keep-whitespace")
    return true
  }

  /** Rule 12: LF is hidden, including the appended unauthored LF. */
  private skipNewline(at: DiagramCharacter): boolean {
    if (at.codePoint !== LINE_FEED) return false
    this.position = this.reader.after(at)
    return true
  }

  /** Names: start exclusions and stopping tests do not require a complete annotation. */
  private bareNameEnd(at: DiagramCharacter): DiagramPosition | undefined {
    if (
      isHws(at) ||
      at.codePoint === LINE_FEED ||
      at.codePoint === APOSTROPHE ||
      at.codePoint === QUOTATION_MARK
    )
      return undefined
    if (
      [":::", "icon(", "##"].some(
        (marker) => matchWord(this.reader, at, marker) !== null,
      )
    )
      return undefined
    let end = this.reader.after(at)
    while (end !== null && end.codePoint !== LINE_FEED) {
      if (isHws(end)) {
        const after = skipWhile(this.reader, end, isHws)
        if (after !== null) {
          const marker = matchWord(this.reader, after, ":::")
          const className =
            marker === null ? null : skipWhile(this.reader, marker.end, isHws)
          if (
            (className !== null && isClassStart(className)) ||
            matchWord(this.reader, after, "icon(") !== null ||
            matchWord(this.reader, after, "##") !== null
          )
            break
        }
        end = after
        continue
      }
      end = this.reader.after(end)
    }
    return end
  }

  /** Rule 13: the complete bare name owns trailing whitespace and interior quotes. */
  private readBareName(at: DiagramCharacter): boolean {
    const end = this.bareNameEnd(at)
    if (end === undefined) return false
    this.read("bare-name", at, end, "keep-whitespace")
    return true
  }

  /** All authored value whitespace is retained; only padding units have no token. */
  protected override addUnit(
    name: UnitName,
    from: DiagramCharacter,
    to: DiagramPosition,
    ends: UnitEnds = "trim-whitespace",
  ): Unit {
    return super.addUnit(
      name,
      from,
      to,
      name === "bare-name" ? "keep-whitespace" : ends,
    )
  }

  /** Gap ownership: box forms outside an open leaf get their own authored units. */
  private addBoxForm(form: BoxForm): void {
    const unit = readUnit(
      this.source,
      form.kind,
      this.units.length,
      form.start,
      form.end,
      null,
    )
    if (form.kind === "box-decoration") {
      this.units.push(unit)
      return
    }
    const prefix: PrefixReading = {
      indent: form.indent,
      marker: String.fromCodePoint(form.marker.codePoint),
    }
    const complete: Unit = { ...unit, prefix }
    this.units.push(complete)
  }
}
