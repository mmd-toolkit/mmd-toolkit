import type { Token } from "@mmd-toolkit/parser"
import type { Doc } from "prettier"
import { utils } from "prettier/doc"
import { isLastOnItsLine } from "./kept-lines.ts"
import type { Source, Trivia } from "./source.ts"
import {
  findTokenStartingAt,
  findTriviaBetween,
  isWhitespace,
} from "./source.ts"

const { replaceEndOfLine } = utils

/**
 * What a gap prints: comments, directives, and the tokens that the grammar
 * reads past. The tree lists comments, and directives as tokens, but places
 * them in no node (see `Trivia`). The other tokens are the `;` that the
 * line rule ignores (`ignoredSemicolons`): no node contains them. All of
 * them are printed as written, and on each side of each, whitespace is
 * printed where the source has it and nothing where it has none
 * (docs/flowchart.md, Directives and Semicolons).
 */
export type GapItem = Trivia | Token

/**
 * Items written next to each other on one line, printed as written: one
 * space where the source had whitespace or a `;` between them, none where
 * they touch.
 */
export interface ItemRun {
  readonly doc: Doc
  /** Whether the source had whitespace or a `;` before the first item. */
  readonly spaceBefore: boolean
  /** Whether the source had whitespace or a `;` after the last item. */
  readonly spaceAfter: boolean
  /**
   * Whether the run ends with whitespace that must be kept: a comment that
   * ends with spaces or tabs. `%% ` is a comment; `%%` is not.
   */
  readonly endsWithWhitespace: boolean
}

/** A line of the source that holds only items, such as a comment line. */
export interface ItemLine {
  readonly run: ItemRun
  /** Whether an empty line comes before it in the source. */
  readonly blankBefore: boolean
  /**
   * Whether a line of only whitespace comes before it in the source, after
   * the line before it (see `BlockRules`).
   */
  readonly whitespaceLineBefore: boolean
}

/**
 * What lies in the source between two printed things, such as two
 * statements: the items, where they stand, and where the source has empty
 * lines. Whitespace, line terminators, and the `;` that separate statements
 * are not printed.
 */
export interface Gap {
  /** Items on the line of the thing before the gap; null when there are none. */
  readonly trailing: ItemRun | null
  /** Items on lines of their own, in source order. */
  readonly lines: readonly ItemLine[]
  /** Items on the line of the thing after the gap; null when there are none. */
  readonly leading: ItemRun | null
  /** Whether an empty line comes after the last line of `lines`, or, when there are none, anywhere in the gap. */
  readonly blankAfter: boolean
  /** Whether the gap breaks the line. */
  readonly breaksLine: boolean
  /** Whether the line before the gap ends with a comment. */
  readonly trailingEndsWithComment: boolean
  /**
   * Whether a line of only whitespace comes after the last line of `lines`,
   * or, when there are none, after the line before the gap (see
   * `BlockRules`).
   */
  readonly whitespaceLineAfter: boolean
}

/**
 * One item, or one `;` that separates statements, with what the source had
 * before it.
 */
interface Part {
  readonly item: GapItem
  readonly spaceBefore: boolean
  /** Whether the part is a `;` that separates statements (see `toRun`). */
  readonly separates: boolean
}

/** One line of the gap as scanned. */
interface ScannedLine {
  readonly parts: Part[]
  /**
   * Whether the line may count as an empty line: it holds nothing but
   * whitespace, and a line terminator ends it.
   */
  canBeEmpty: boolean
  /** Whether the source had whitespace after the last part. */
  spaceAfter: boolean
  /** The position in `parts` of the part after the last separating `;`. */
  afterLastSeparator: number
}

/**
 * Reads the source between `start` and `end`.
 *
 * The gap is split into lines at line terminators, and at a U+2028 or U+2029
 * that a comment follows. U+2028 and U+2029 are not line terminators: they
 * are whitespace, and the printer treats them so. But a comment may start
 * right after them (common.md, Comment lines), and a comment must start a
 * printed line, because a `%%` after other text on its line is not a
 * comment. The line breaks that the printer writes stand for either. A
 * diagram comment that a comment line cuts, with text after the comment line,
 * is one comment here (see `createSource`).
 *
 * A `;` that the line rule ignores is an item, printed as written. A `;`
 * that separates statements is dropped and counts as whitespace
 * (docs/flowchart.md, Semicolons), unless `keepsSeparators` is set, as on a
 * line that is kept together, where it is printed as written like an item.
 *
 * Throws when the gap holds any other text than whitespace, line
 * terminators, comments, directives, and `;` tokens: the tree places every
 * other token in a node, so such text means that the printer was given
 * wrong bounds.
 */
export function readGap(
  source: Source,
  start: number,
  end: number,
  keepsSeparators: boolean,
): Gap {
  const lines = scanLines(source, start, end, keepsSeparators)
  if (lines.length === 1) {
    return readSingleLine(source, lines[0])
  }
  const [first, ...rest] = lines
  const last = rest.pop() as ScannedLine
  const ownLines: ItemLine[] = []
  let emptyLineSeen = false
  let whitespaceLineSeen = false
  for (const line of rest) {
    const run = toRun(source, line.parts, line.spaceAfter, false)
    if (run === null) {
      if (line.canBeEmpty) emptyLineSeen = true
      if (line.canBeEmpty && line.spaceAfter) whitespaceLineSeen = true
      continue
    }
    ownLines.push({
      run,
      blankBefore: emptyLineSeen,
      whitespaceLineBefore: whitespaceLineSeen,
    })
    emptyLineSeen = false
    whitespaceLineSeen = false
  }
  return {
    trailing: toRun(source, first.parts, first.spaceAfter, true),
    lines: ownLines,
    leading: toRun(source, last.parts, last.spaceAfter, false),
    blankAfter: emptyLineSeen,
    breaksLine: true,
    trailingEndsWithComment: first.parts.at(-1)?.item.type === "Comment",
    whitespaceLineAfter: whitespaceLineSeen,
  }
}

/**
 * A gap within one line, such as between two statements written on the same
 * line: the items after its last `;` stand with the thing after the gap, the
 * others with the thing before it.
 */
function readSingleLine(source: Source, line: ScannedLine): Gap {
  const before = line.parts.slice(0, line.afterLastSeparator)
  const after = line.parts.slice(line.afterLastSeparator)
  return {
    trailing: toRun(source, before, after.length > 0 || line.spaceAfter, true),
    lines: [],
    leading: toRun(source, after, line.spaceAfter, false),
    blankAfter: false,
    breaksLine: false,
    trailingEndsWithComment: false,
    whitespaceLineAfter: false,
  }
}

/**
 * What starts at an offset between the things that the printers print:
 *
 * - `item`: a comment, a directive, or a token that the grammar reads past
 *   (see `GapItem`).
 * - `separator`: a `;` that separates statements, other than one that
 *   starts where a comment ends. A comment ends before a `;` only where
 *   the line rule ignores it, and no characters of the comment follow it
 *   (ast.md, Comment), so that `;` is an item, printed as written: with the
 *   whitespace after it, the `;` lies inside the comment, and a `;` that was
 *   dropped would make a second formatting differ from the first.
 * - `lineTerminator`: a line feed.
 * - `whitespace`: one whitespace character. `beforeComment` is set for a
 *   U+2028 or U+2029 that a comment follows on its line: a comment may start
 *   right after it (common.md, Comment lines), and a printed comment must
 *   start a line, because a `%%` after other text on its line is not a
 *   comment.
 * - `text`: anything else, which belongs to a node.
 *
 * Every scan of the text between printed things reads it with this one
 * function, so that they agree on what is an item.
 */
export type GapElement =
  | { readonly kind: "item"; readonly item: GapItem }
  | { readonly kind: "separator"; readonly token: Token }
  | { readonly kind: "lineTerminator" }
  | { readonly kind: "whitespace"; readonly beforeComment: boolean }
  | { readonly kind: "text" }

/** Reads the element that starts at `offset`, and where it ends. */
export function readGapElement(
  source: Source,
  offset: number,
): { readonly element: GapElement; readonly end: number } {
  const trivia = findTriviaBetween(source, offset, offset + 1).at(0)
  if (trivia !== undefined) {
    return { element: { kind: "item", item: trivia }, end: trivia.range[1] }
  }
  const character = source.text[offset]
  if (character === "\n") {
    return { element: { kind: "lineTerminator" }, end: offset + 1 }
  }
  if (isWhitespace(character)) {
    const beforeComment =
      (character === "\u2028" || character === "\u2029") &&
      isFollowedByComment(source, offset + 1)
    return { element: { kind: "whitespace", beforeComment }, end: offset + 1 }
  }
  const token = findTokenStartingAt(source, offset)
  if (token?.value === ";") {
    return source.ignoredSemicolons.has(offset)
      ? { element: { kind: "item", item: token }, end: token.range[1] }
      : { element: { kind: "separator", token }, end: token.range[1] }
  }
  return { element: { kind: "text" }, end: offset + 1 }
}

/**
 * Splits the gap into lines, keeping the items of each line.
 */
function scanLines(
  source: Source,
  start: number,
  end: number,
  keepsSeparators: boolean,
): ScannedLine[] {
  const lines: ScannedLine[] = [newLine()]
  let current = lines[0]
  let spacePending = false
  let offset = start

  /** Adds a part to the current line. */
  function addPart(item: GapItem, separates: boolean): void {
    current.parts.push({ item, spaceBefore: spacePending, separates })
    current.canBeEmpty = false
    spacePending = false
  }

  /** Starts a new line. Only a line terminator can leave an empty line behind. */
  function breakLine(isLineTerminator: boolean): void {
    current.spaceAfter = spacePending
    if (!isLineTerminator) current.canBeEmpty = false
    current = newLine()
    lines.push(current)
    spacePending = false
  }

  while (offset < end) {
    const { element, end: elementEnd } = readGapElement(source, offset)
    switch (element.kind) {
      case "item":
        if (!keepsSeparators && isDroppedSemicolon(source, element.item)) {
          addPart(element.item, true)
          current.afterLastSeparator = current.parts.length
        } else {
          addPart(element.item, false)
        }
        break
      case "separator":
        addPart(element.token, !keepsSeparators)
        if (!keepsSeparators) {
          current.afterLastSeparator = current.parts.length
        }
        break
      case "lineTerminator":
        breakLine(true)
        break
      case "whitespace":
        if (element.beforeComment) breakLine(false)
        else spacePending = true
        break
      default:
        // Text that belongs to a node.
        throw new Error(
          `prettier-plugin-mmd: unexpected text ${JSON.stringify(source.text.slice(offset, offset + 20))} at offset ${offset} between printed nodes`,
        )
    }
    offset = elementEnd
  }
  current.spaceAfter = spacePending
  return lines
}

/**
 * Whether an item of a gap between statements is a `;` that the line rule
 * ignores at the end of its line, which is dropped as a `;` that separates
 * statements is: mermaid.js removes it from the text. Not one right after a
 * comment: with whitespace after it, the `;` lies inside the comment, which
 * is printed as written, and a `;` that was dropped only when it stands
 * outside the comment would make a second formatting differ from the first
 * (ast.md, Comment).
 */
function isDroppedSemicolon(source: Source, item: GapItem): boolean {
  const offset = item.range[0]
  return (
    source.ignoredSemicolons.has(offset) &&
    isLastOnItsLine(source, offset) &&
    !source.root.comments.some((comment) => comment.range[1] === offset)
  )
}

/**
 * Whether a comment starts at `offset` after nothing but whitespace and
 * directives on the same line.
 */
function isFollowedByComment(source: Source, offset: number): boolean {
  const { text } = source
  let position = offset
  while (position < text.length) {
    const trivia = findTriviaBetween(source, position, position + 1).at(0)
    if (trivia?.type === "Comment") return true
    if (trivia?.type === "Directive") {
      position = trivia.range[1]
      continue
    }
    const character = text[position]
    if (character === "\n" || !isWhitespace(character)) return false
    position++
  }
  return false
}

/** Makes an empty scanned line. */
function newLine(): ScannedLine {
  return {
    parts: [],
    canBeEmpty: true,
    spaceAfter: false,
    afterLastSeparator: 0,
  }
}

/**
 * Prints the parts of one line as written, collapsing whitespace, or returns
 * null when no item is printed.
 *
 * A `;` that separates statements is dropped and counts as whitespace
 * (docs/flowchart.md, Semicolons), except in a run that stands after a statement on its line
 * (`keepsSeparatorsBeforeItems`), where a `;` with an item after it is kept.
 * Without it, the whitespace before that item would be read with the
 * statement: `class A c; %%{init: {}}%%` is accepted, and
 * `class A c %%{init: {}}%%` is rejected.
 */
function toRun(
  source: Source,
  parts: readonly Part[],
  spaceAfter: boolean,
  keepsSeparatorsBeforeItems: boolean,
): ItemRun | null {
  let lastItem = -1
  for (const [index, part] of parts.entries()) {
    if (!part.separates) lastItem = index
  }
  const doc: Doc[] = []
  let spaceBefore = false
  let spacePending = false
  let printed: Part | undefined
  for (const [index, part] of parts.entries()) {
    const space = spacePending || part.spaceBefore
    if (part.separates && !(keepsSeparatorsBeforeItems && index < lastItem)) {
      spacePending = true
      continue
    }
    if (printed === undefined) spaceBefore = space
    else if (space) doc.push(" ")
    doc.push(printItem(source, part.item))
    printed = part
    spacePending = false
  }
  if (printed === undefined) return null
  return {
    doc,
    spaceBefore,
    spaceAfter: spaceAfter || spacePending,
    endsWithWhitespace: endsWithSpaceOrTab(
      source.text.slice(printed.item.range[0], printed.item.range[1]),
    ),
  }
}

/**
 * Prints an item as written: its source text. A directive may span lines;
 * its inner lines keep their source columns.
 */
function printItem(source: Source, item: GapItem): Doc {
  return replaceEndOfLine(source.text.slice(item.range[0], item.range[1]))
}

/**
 * Whether a text ends with a space or a tab, the characters that Prettier
 * removes from the end of a line.
 */
export function endsWithSpaceOrTab(text: string): boolean {
  return text.endsWith(" ") || text.endsWith("\t")
}

/**
 * The end of the whitespace that the text of the range from `offset` to
 * the separator holds (ast.md, Nodes): the offset after its last whitespace
 * character, or `offset` when it holds none.
 *
 * The text of a range leaves out the directives in it, so whitespace after
 * a directive counts: in `style A fill:red,%%{init: {}}%% ` the last style
 * is the space after the directive. The separator is a line terminator, a
 * `;` that separates statements, or the end of the text. A comment also
 * ends the scan: it may start after whitespace on the same line, such as a
 * U+2028 (common.md, Comment lines), and the whitespace before it counts.
 *
 * A `;` that the line rule ignores (`ignoredSemicolons`) is not the
 * separator: `style A fill:red,; ` is accepted, its last style being the
 * space after the `;`. The scan passes it, and what it passes is printed as
 * written.
 *
 * The text is read as the gaps read it (`readGapElement`): the scan passes
 * whitespace and the items other than comments.
 */
export function findWrittenWhitespaceEnd(
  source: Source,
  offset: number,
): number {
  let position = offset
  let end = offset
  while (position < source.text.length) {
    const { element, end: elementEnd } = readGapElement(source, position)
    if (element.kind === "whitespace") {
      end = elementEnd
    } else if (element.kind !== "item" || element.item.type === "Comment") {
      break
    }
    position = elementEnd
  }
  return end
}
