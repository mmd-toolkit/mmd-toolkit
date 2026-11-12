import type { DbSummary, JsonValue } from "@mmd-toolkit/tests"
import type { DbPath } from "./db-restore.ts"
import { restoreStrings } from "./db-restore.ts"
import { objectOf } from "./db-values.ts"

/**
 * The diagram types whose styles hold colors that the formatter prints in lower
 * case, and the sequence diagram, whose boxes and rectangles hold color
 * functions that it prints with a space after each comma.
 */
export const colorCaseDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "block",
  "classDiagram",
  "er",
  "flowchart-elk",
  "flowchart-v2",
  "quadrantChart",
  "requirement",
  "sequence",
  "stateDiagram",
  "swimlane",
  "usecase",
  "venn",
])

/** The type of the message that starts a `rect` in the Db of a sequence diagram. */
const rectStartType = 22

/**
 * Whether the Db of a diagram type holds a style at a place: the key of a list
 * of styles, `styles`, `style`, or `cssStyles`; the colors of a quadrant chart,
 * which its Db holds apart from the other settings of a point and of a class;
 * and the properties of a style of a Venn diagram, in a map below `styles`.
 */
function holdsStyle(path: DbPath, diagramType: string): boolean {
  const key = path.at(-1)
  if (diagramType === "quadrantChart")
    return key === "color" || key === "strokeColor"
  if (diagramType === "venn") return path.includes("styles")
  return key === "styles" || key === "style" || key === "cssStyles"
}

/** Whether a character is an ASCII hexadecimal digit. */
function isHexDigit(character: string | undefined): boolean {
  return (
    character !== undefined &&
    ((character >= "0" && character <= "9") ||
      (character >= "a" && character <= "f") ||
      (character >= "A" && character <= "F"))
  )
}

/** Whether a character is whitespace between the words of a style. */
function isSpace(character: string | undefined): boolean {
  return character === " " || character === "\t"
}

/**
 * The offset after the escape that starts with the backslash at `backslashAt`:
 * one to six hexadecimal digits and the one space or tab after them, or else
 * the next character.
 */
function endOfEscape(text: string, backslashAt: number): number {
  let end = backslashAt + 1
  while (end < backslashAt + 7 && isHexDigit(text[end])) end++
  if (end === backslashAt + 1) return Math.min(backslashAt + 2, text.length)
  return isSpace(text[end]) ? end + 1 : end
}

/** The offset after the string that starts with the quote at `quoteAt`. */
function endOfString(text: string, quoteAt: number): number {
  for (let index = quoteAt + 1; index < text.length; index++) {
    if (text[index] === "\\") index++
    else if (text[index] === text[quoteAt]) return index + 1
  }
  return text.length
}

/**
 * The ranges of the colors in the text of a style: a `#` and 3, 4, 6, or 8
 * hexadecimal digits that start the text or follow whitespace, a `:`, a `,`, or
 * a `(`, and end the text or are followed by whitespace, a `,`, a `)`, or a
 * `!`. Nothing inside a string, a comment, the parentheses of `url(`, or after
 * a backslash is one (docs/compatibility.md, Colors that are drawn the same).
 */
function colorRanges(text: string): [number, number][] {
  const ranges: [number, number][] = []
  let position = 0
  while (position < text.length) {
    const character = text[position]
    if (character === "\\") {
      position = endOfEscape(text, position)
    } else if (character === '"' || character === "'") {
      position = endOfString(text, position)
    } else if (text.startsWith("/*", position)) {
      const close = text.indexOf("*/", position + 2)
      position = close === -1 ? text.length : close + 2
    } else if (text.slice(position, position + 4).toLowerCase() === "url(") {
      let end = position + 4
      while (end < text.length && text[end] !== ")") {
        if (text[end] === "\\") end++
        else if (text[end] === '"' || text[end] === "'")
          end = endOfString(text, end) - 1
        end++
      }
      position = Math.min(end + 1, text.length)
    } else if (character === "#") {
      let end = position + 1
      while (isHexDigit(text[end])) end++
      const digits = end - position - 1
      const before = text[position - 1]
      const after = text[end]
      if (
        (digits === 3 || digits === 4 || digits === 6 || digits === 8) &&
        (before === undefined || isSpace(before) || ":,(".includes(before)) &&
        (after === undefined || isSpace(after) || ",)!".includes(after))
      )
        ranges.push([position, end])
      position = end
    } else position++
  }
  return ranges
}

/**
 * The printed text of a style with the colors in the case that the written
 * text has, where the two have the same number of colors and each printed
 * color is the written one in lower case; any other text is returned as it is.
 */
function withWrittenColors(written: string, printed: string): string {
  const writtenColors = colorRanges(written)
  const printedColors = colorRanges(printed)
  if (writtenColors.length !== printedColors.length) return printed
  let result = ""
  let at = 0
  for (const [index, [start, end]] of printedColors.entries()) {
    const writtenColor = written.slice(...writtenColors[index])
    if (printed.slice(start, end) !== writtenColor.toLowerCase()) return printed
    result += printed.slice(at, start) + writtenColor
    at = end
  }
  return result + printed.slice(at)
}

/** The text without the spaces and tabs that follow a comma. */
function withoutSpacesAfterCommas(text: string): string {
  let result = ""
  for (let index = 0; index < text.length; index++) {
    result += text[index]
    if (text[index] === ",") while (isSpace(text[index + 1])) index++
  }
  return result
}

/** Whether a text is one color function: `rgb(`, `rgba(`, `hsl(` or `hsla(` and a `)`. */
function isColorFunction(text: string): boolean {
  const open = text.indexOf("(")
  return (
    ["rgb", "rgba", "hsl", "hsla"].includes(text.slice(0, open)) &&
    text.endsWith(")") &&
    !text.slice(open + 1, -1).includes("(") &&
    !text.slice(open + 1, -1).includes(")")
  )
}

/**
 * The printed text with the spaces after the commas of the written text, where
 * the two are one color function and differ in nothing else; any other text is
 * returned as it is (docs/compatibility.md, Colors that are drawn the same).
 */
function withWrittenColorFunction(written: string, printed: string): string {
  return isColorFunction(written) &&
    withoutSpacesAfterCommas(written) === withoutSpacesAfterCommas(printed)
    ? written
    : printed
}

/**
 * The Db of a sequence diagram with the color of each box (`fill`) and the text
 * of each `rect` (the message of the start of the rectangle) in the form of the
 * written Db, where the two differ in the spaces after the commas of a color
 * function. A list of another length stays as it is.
 */
function withWrittenSequenceColors(
  before: DbSummary,
  after: DbSummary,
): DbSummary {
  const written = objectOf(before)
  const printed = objectOf(after)
  if (written === undefined || printed === undefined) return after

  /** The items of a list of `after` with the string at `key` restored, where `isTarget` says so. */
  function restoreList(
    name: string,
    key: string,
    isTarget: (item: Record<string, JsonValue>) => boolean,
  ): JsonValue | undefined {
    const writtenItems = written![name]
    const printedItems = printed![name]
    if (
      !Array.isArray(writtenItems) ||
      !Array.isArray(printedItems) ||
      writtenItems.length !== printedItems.length
    )
      return printedItems
    return printedItems.map((item, index) => {
      const writtenItem = objectOf(writtenItems[index])
      const printedItem = objectOf(item)
      if (
        writtenItem === undefined ||
        printedItem === undefined ||
        !isTarget(printedItem) ||
        typeof writtenItem[key] !== "string" ||
        typeof printedItem[key] !== "string"
      )
        return item
      return {
        ...printedItem,
        [key]: withWrittenColorFunction(writtenItem[key], printedItem[key]),
      }
    })
  }

  return {
    ...printed,
    ...("boxes" in printed
      ? { boxes: restoreList("boxes", "fill", () => true) }
      : {}),
    ...("messages" in printed
      ? {
          messages: restoreList(
            "messages",
            "message",
            (item) => item.type === rectStartType,
          ),
        }
      : {}),
  }
}

/**
 * Checks the colors of the styles of a formatted diagram even though the
 * formatter printed them in lower case. mermaid.js keeps the colors of a style
 * in the case in which they are written, in its Db and in the `style`
 * attributes and the ids of the SVG, and draws the same figure
 * (docs/compatibility.md, Colors that are drawn the same). A color of a style
 * takes the case of the written color; every other difference stays, among
 * them a color that is not a color by the definition of that section and was
 * printed in lower case, and a text that lost or gained a color.
 */
export function colorCaseDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
  diagramType: string,
): DbSummary | null {
  if (before === null || after === null) return after
  if (diagramType === "sequence")
    return withWrittenSequenceColors(before, after)
  return restoreStrings(before, after, (written, printed, path) => {
    if (!holdsStyle(path, diagramType)) return printed
    const colors = withWrittenColors(written, printed)
    // The value of a property of a Venn style holds the text of its color
    // function as written.
    return diagramType === "venn"
      ? withWrittenColorFunction(written, colors)
      : colors
  }) as DbSummary
}
