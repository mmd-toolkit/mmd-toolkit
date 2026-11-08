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
}

/**
 * The text of a style without the whitespace that mermaid.js takes away
 * before it draws the figure: at its ends, and around its first `:`
 * (docs/flowchart.md, Styles), except the whitespace described in
 * `StyleReading`.
 */
function withoutStyleMargins(
  style: string,
  { readsStroke, readsLinkStyle, joinsStyles, splitsLabelStyles }: StyleReading,
): string {
  const trimmed = style.trim()
  const escapedTail =
    joinsStyles && escapesNext(trimmed) && style !== style.trimEnd()
  const tail = escapedTail ? " " : ""
  const colon = trimmed.indexOf(":")
  if (colon <= 0) return `${trimmed}${tail}`
  const name = trimmed.slice(0, colon).trimEnd()
  const gap =
    name.length < colon &&
    ((readsStroke && name.endsWith("stroke")) ||
      (splitsLabelStyles && (name === "color" || name === "text-align")))
  const startsWithWhitespace = style !== style.trimStart()
  const start =
    startsWithWhitespace &&
    ((readsLinkStyle && trimmed.startsWith("stroke:")) ||
      (splitsLabelStyles &&
        (trimmed.startsWith("color:") || trimmed.startsWith("text-align:"))))
  const value = trimmed.slice(colon + 1).trimStart()
  const writtenValue = style.slice(style.indexOf(":") + 1)
  const blank =
    readsLinkStyle &&
    name.endsWith("stroke") &&
    value === "" &&
    writtenValue !== ""
  return `${start ? " " : ""}${name}${gap ? " " : ""}:${blank ? " " : value}${tail}`
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
 * whitespace after a backslash that ends a style (see `StyleReading`).
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
    }
    return key !== undefined &&
      isStyleKey(key) &&
      withoutStyleMargins(printed, reading) ===
        withoutStyleMargins(written, reading)
      ? written
      : printed
  }) as DbSummary
}
