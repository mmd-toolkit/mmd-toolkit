import type { DbSummary } from "@mmd-toolkit/tests"
import type { DbPath } from "./db-restore.ts"
import { restoreStrings } from "./db-restore.ts"

/** The diagram types whose styles the formatter prints in one form. */
export const styleDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "block",
  "classDiagram",
  "flowchart-elk",
  "flowchart-v2",
  "stateDiagram",
  "swimlane",
  "treemap",
  "usecase",
])

/**
 * The diagram types whose printer prints a run of spaces and tabs between the
 * words of a style as one space.
 */
const runCollapsingDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "block",
  "classDiagram",
  "flowchart-elk",
  "flowchart-v2",
  "stateDiagram",
  "swimlane",
  "treemap",
  "usecase",
])

/**
 * The diagram types whose printer prints a run of spaces, tabs, and form feeds
 * before a `%%` comment on the line of the last style as one space in every
 * statement that has styles (docs/compatibility.md, Whitespace at the end of a
 * style). A state diagram does so in its `classDef` only, which the Db keeps
 * apart from the `style` of a state (`classDefs`, see `joinsFormFeedsAt`), and
 * a class diagram in its `style` only, which the Db does not keep apart from
 * its `classDef`: both put their styles in `classes`, so the form feed before
 * a comment in a class diagram is compared as it is.
 */
const formFeedJoiningDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "block",
  "flowchart-elk",
  "flowchart-v2",
  "swimlane",
  "treemap",
])

/** The diagram types whose styles can reach a link. */
const linkStyleDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "flowchart-elk",
  "flowchart-v2",
  "swimlane",
  "usecase",
])

/** What mermaid.js reads of a style besides its text. */
interface StyleReading {
  /**
   * It looks for `stroke:` in the style, so whether whitespace stands between
   * a name that ends with `stroke` and the `:` is no margin; its amount is.
   */
  readonly readsStroke: boolean
  /**
   * The style is one of a link. Where the look is `handDrawn`, it reads
   * whether a style starts with `stroke:`, so whether whitespace stands before
   * such a style is no margin; and it draws no colour from a `stroke` with a
   * value of whitespace only, so whether such a value has whitespace in it is
   * no margin. Where whitespace stands, its amount is.
   */
  readonly readsLinkStyle: boolean
  /**
   * It joins the styles with `;` as they are: the styles of a link, of a block
   * of a block diagram, and of a class. A style that ends with a backslash
   * escapes the `;`, so whether whitespace stands after the backslash is no
   * margin; its amount is.
   */
  readonly joinsStyles: boolean
  /**
   * The style is one of a node of a block diagram, which sorts the styles that
   * start with `color:` or `text-align:` into the style of the label, so
   * whether whitespace stands before such a style, or between its name and the
   * `:`, is no margin; its amount is.
   */
  readonly splitsLabelStyles: boolean
  /**
   * The printer prints a run of spaces and tabs between the words of a style
   * as one space, and mermaid.js keeps the run in the Db and draws the figure
   * without it, so a run is no margin, except inside a string, a comment, or
   * the parentheses of `url(`, and the escape after a backslash; whether
   * whitespace stands between two words is.
   */
  readonly collapsesWordGaps: boolean
  /**
   * The printer prints a run before a `%%` comment, which the Db keeps in the
   * text of the style, as one space also where it holds form feeds, which CSS
   * reads as whitespace, so that run is no margin. Elsewhere a form feed is
   * part of the text of a style, and the printer keeps it before a comment
   * where a version that counts reads the text as the words of another
   * statement.
   */
  readonly joinsFormFeeds: boolean
  /**
   * The style is one of a node of an agentflow diagram, which mermaid.js draws
   * without any whitespace at the end of the last style, and the printer
   * leaves all of it out, so whitespace of every kind there is no margin; in
   * the other styles, only what CSS reads as whitespace is (docs/compatibility.md,
   * Whitespace at the end of a style).
   */
  readonly dropsEveryWhitespaceAtEnd: boolean
}

/**
 * The text of a style without the whitespace that mermaid.js takes away
 * before it draws the figure: what CSS reads as whitespace (see
 * `isCssWhitespace`) at its ends and around its first `:` (docs/flowchart.md,
 * Styles), except the whitespace described in `StyleReading`.
 */
function withoutStyleMargins(
  written: string,
  {
    readsStroke,
    readsLinkStyle,
    joinsStyles,
    splitsLabelStyles,
    collapsesWordGaps,
    joinsFormFeeds,
    dropsEveryWhitespaceAtEnd,
  }: StyleReading,
): string {
  const style = collapsesWordGaps
    ? withoutWordRuns(written, joinsFormFeeds)
    : written
  const trimmed = trimCssWhitespaceStart(
    dropsEveryWhitespaceAtEnd ? style.trimEnd() : trimCssWhitespaceEnd(style),
  )
  const escapedTail =
    joinsStyles && escapesNext(trimmed) && style !== trimCssWhitespaceEnd(style)
  const tail = escapedTail ? " " : ""
  const colon = trimmed.indexOf(":")
  if (colon < 0) return `${trimmed}${tail}`
  const beforeColon = trimmed.slice(0, colon)
  const nameText = trimCssWhitespaceEnd(beforeColon)
  // CSS reads the space that a backslash escapes as part of the name.
  const name =
    nameText !== beforeColon && escapesNext(nameText)
      ? `${nameText} `
      : nameText
  const gap =
    name.length < colon &&
    ((readsStroke && name.endsWith("stroke")) ||
      (splitsLabelStyles && (name === "color" || name === "text-align")))
  const startsWithWhitespace = style !== trimCssWhitespaceStart(style)
  const start =
    startsWithWhitespace &&
    ((readsLinkStyle && trimmed.startsWith("stroke:")) ||
      (splitsLabelStyles &&
        (trimmed.startsWith("color:") || trimmed.startsWith("text-align:"))))
  const value = trimCssWhitespaceStart(trimmed.slice(colon + 1))
  const writtenValue = style.slice(style.indexOf(":") + 1)
  const blank =
    readsLinkStyle &&
    name.endsWith("stroke") &&
    value === "" &&
    writtenValue !== ""
  return `${start ? " " : ""}${name}${gap ? " " : ""}:${blank ? " " : value}${tail}`
}

/**
 * Whether a character is one that CSS reads as whitespace: a space, a tab, a
 * line feed, a carriage return, or a form feed. The other characters that
 * JavaScript's `trim` takes away (a no-break space, U+3000, a vertical tab, a
 * byte order mark, U+2028, U+2029, and the other spaces of Unicode) are part of
 * the value for CSS: the `style` of a class diagram that ends in one is drawn
 * otherwise than without it (docs/compatibility.md, Whitespace at the end of a
 * style).
 */
function isCssWhitespace(character: string | undefined): boolean {
  return (
    character === " " ||
    character === "\t" ||
    character === "\n" ||
    character === "\r" ||
    character === "\f"
  )
}

/** The text without the CSS whitespace at its start. */
function trimCssWhitespaceStart(text: string): string {
  let start = 0
  while (isCssWhitespace(text[start])) start++
  return text.slice(start)
}

/** The text without the CSS whitespace at its end. */
function trimCssWhitespaceEnd(text: string): string {
  let end = text.length
  while (end > 0 && isCssWhitespace(text[end - 1])) end--
  return text.slice(0, end)
}

/**
 * The text of a style with each run of spaces and tabs replaced by one space,
 * and, where `joinsFormFeeds` is set, a run before a `%%` comment, which the Db
 * keeps in the text of the style, also where it holds form feeds, which CSS
 * reads as whitespace, except inside a string (`"…"` or `'…'`), a comment (`/*…*\/`), or the
 * parentheses of `url(`, and the escape after a backslash, where CSS reads it
 * as part of the value: the hexadecimal digits (at most six) and the one space
 * or tab after them, or else the next character. What is not closed runs to
 * the end of the text.
 */
function withoutWordRuns(text: string, joinsFormFeeds: boolean): string {
  let result = ""
  let position = 0
  while (position < text.length) {
    const character = text[position]
    let next = position + 1
    if (character === "\\") {
      next = endOfEscape(text, position)
    } else if (character === '"' || character === "'") {
      next = endOfString(text, position)
    } else if (text.startsWith("/*", position)) {
      const close = text.indexOf("*/", position + 2)
      next = close === -1 ? text.length : close + 2
    } else if (text.slice(position, position + 4).toLowerCase() === "url(") {
      next = position + 4
      while (next < text.length && text[next] !== ")") {
        if (text[next] === "\\") next++
        else if (text[next] === '"' || text[next] === "'")
          next = endOfString(text, next) - 1
        next++
      }
      next = Math.min(next + 1, text.length)
    } else if (character === " " || character === "\t" || character === "\f") {
      // A form feed belongs to a run only before a comment.
      let blanksEnd = position
      while (" \t\f".includes(text[blanksEnd] ?? "-")) blanksEnd++
      let runEnd = position
      if (joinsFormFeeds && text.startsWith("%%", blanksEnd)) runEnd = blanksEnd
      else while (text[runEnd] === " " || text[runEnd] === "\t") runEnd++
      if (runEnd > position) {
        result += " "
        position = runEnd
        continue
      }
    }
    result += text.slice(position, next)
    position = next
  }
  return result
}

/** The offset after the escape that starts at the backslash at `start`. */
function endOfEscape(text: string, start: number): number {
  let end = start + 1
  while (end < start + 7 && "0123456789abcdefABCDEF".includes(text[end] ?? "-"))
    end++
  if (end === start + 1) return Math.min(start + 2, text.length)
  return text[end] === " " || text[end] === "\t" ? end + 1 : end
}

/** The offset after the string that starts at the quote at `start`. */
function endOfString(text: string, start: number): number {
  for (let index = start + 1; index < text.length; index++) {
    if (text[index] === "\\") index++
    else if (text[index] === text[start]) return index + 1
  }
  return text.length
}

/** Whether a backslash at the end of a text escapes the next character. */
function escapesNext(text: string): boolean {
  let backslashes = 0
  while (text[text.length - 1 - backslashes] === "\\") backslashes++
  return backslashes % 2 === 1
}

/** Whether a Db key holds the styles of a vertex, a class, or a link. */
function isStyleKey(key: string): boolean {
  return key === "styles" || key === "style"
}

/**
 * Whether the styles at a place of the Db can reach a link: the styles of a
 * link, of the default of the links, and of a class, which can be put on a
 * link.
 */
function reachesLink(path: DbPath): boolean {
  const [key, owner] = [path.at(-1), path.at(-2)]
  return (
    key === "style" ||
    (key === "styles" && (owner === "classDefs" || owner === "relationships"))
  )
}

/**
 * Whether mermaid.js joins the styles at a place of the Db with `;` as they are
 * (see `StyleReading`): the styles of a link, the styles of a block of a block
 * diagram, and the styles of a class of a class diagram. The styles of the
 * other nodes and of a `classDef` are trimmed before they are used.
 */
function joinsStylesAt(
  path: DbPath,
  diagramType: string,
  linksCanBeStyled: boolean,
): boolean {
  const [key, owner] = [path.at(-1), path.at(-2)]
  if (key === "style") return linksCanBeStyled
  if (key !== "styles") return false
  return (
    (diagramType === "block" && owner === "children") ||
    (diagramType === "classDiagram" && owner === "classes")
  )
}

/**
 * Whether the printer prints a form feed before a comment as one space in the
 * styles at a place of the Db: in every statement of the diagram types of
 * `formFeedJoiningDiagramTypes`, and in the `classDef` of a state diagram.
 */
function joinsFormFeedsAt(path: DbPath, diagramType: string): boolean {
  if (formFeedJoiningDiagramTypes.has(diagramType)) return true
  return diagramType === "stateDiagram" && path.at(-2) === "classDefs"
}

/**
 * Checks the styles of a formatted diagram even though their text changed.
 * The formatter puts no whitespace before the first `:` of a style or before a
 * `,` and one space after them (docs/compatibility.md, Styles that are drawn
 * the same). mermaid.js keeps the whitespace in the Db and takes it away
 * before it draws, so a style whose text differs from the written one only by
 * the whitespace at its ends and around its first `:` is restored from the
 * written Db. Every other difference stays, among them the number of styles
 * (a numbered `linkStyle` gets a `fill:none` where no style starts with
 * `fill`). In a diagram whose styles can reach a link, mermaid.js looks for
 * `stroke:` in the styles of the link to colour its arrowheads, so whether
 * whitespace stands before the `:` of a name that ends with `stroke` is no
 * margin there, and neither is the whitespace before a style of a link that
 * starts with `stroke:`, or the value of a `stroke` that is whitespace only,
 * and where mermaid.js joins the styles as they are, neither is the
 * whitespace after a backslash that ends a style, and in the diagram types of
 * `runCollapsingDiagramTypes` a run of spaces and tabs between the words of a
 * style is no margin, and where the printer prints a form feed before a comment
 * as one space, neither is a run with a form feed before a comment (see
 * `StyleReading`).
 */
export function styleDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
  diagramType: string,
): DbSummary | null {
  if (before === null || after === null) return after
  const linksCanBeStyled = linkStyleDiagramTypes.has(diagramType)
  return restoreStrings(before, after, (written, printed, path) => {
    const key = path.at(-1)
    const reading: StyleReading = {
      readsStroke: linksCanBeStyled && reachesLink(path),
      readsLinkStyle: linksCanBeStyled && key === "style",
      joinsStyles: joinsStylesAt(path, diagramType, linksCanBeStyled),
      splitsLabelStyles:
        diagramType === "block" &&
        key === "styles" &&
        path.at(-2) === "children",
      collapsesWordGaps: runCollapsingDiagramTypes.has(diagramType),
      joinsFormFeeds: joinsFormFeedsAt(path, diagramType),
      dropsEveryWhitespaceAtEnd:
        diagramType === "agentflow" &&
        key === "styles" &&
        path.at(-2) === "vertices",
    }
    return key !== undefined &&
      isStyleKey(key) &&
      withoutStyleMargins(printed, reading) ===
        withoutStyleMargins(written, reading)
      ? written
      : printed
  }) as DbSummary
}

/**
 * Checks the styles of a formatted ER diagram even though the printer left a
 * U+2028 or U+2029 out of the end of one. mermaid.js keeps the character in
 * the text of the last style when no whitespace stands before it, and the
 * printer drops it together with the `;` that ends the statement where a
 * comment line follows, since the `;` alone cannot be dropped there
 * (docs/er.md, Semicolons at the end of a style statement). The figure is the
 * same without the character (docs/compatibility.md, Whitespace at the end of
 * a style). A style whose text differs from the written one only by those
 * characters and the spaces and tabs among them at its end is restored from
 * the written Db.
 */
export function styleEndSeparatorDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
): DbSummary | null {
  if (before === null || after === null) return after
  return restoreStrings(before, after, (written, printed, path) => {
    const key = path.at(-1)
    return (key === "cssStyles" || key === "styles") &&
      withoutEndSeparators(written) === printed
      ? written
      : printed
  }) as DbSummary
}

/** The text without the U+2028, U+2029, spaces, and tabs at its end. */
function withoutEndSeparators(text: string): string {
  let end = text.length
  while (
    end > 0 &&
    (text[end - 1] === "\u2028" ||
      text[end - 1] === "\u2029" ||
      text[end - 1] === " " ||
      text[end - 1] === "\t")
  )
    end--
  return text.slice(0, end)
}
