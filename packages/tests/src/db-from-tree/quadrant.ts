import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  QuadrantAxisStatement,
  QuadrantClassDefStatement,
  QuadrantDiagram,
  QuadrantLabel,
  QuadrantLiteral,
  QuadrantPointStatement,
  QuadrantStatement,
} from "./quadrant-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import { TreeError } from "./tree.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf, setOwnProperty, trimmed } from "./values.ts"

// docs/db-from-tree/quadrant.md: the summary of the Db that a quadrant chart
// tree denotes, in the form of `normalizeQuadrant()` of `@mmd-toolkit/tests`.
// The statements are executed in source order, as mermaid.js executes them
// while it parses; each step names the paragraph of "Building the summary
// from the tree" that defines it. Every value is read in converted form (see
// `converted-text.ts`).

/** What the Db adds to the text of an axis that has the arrow and no second text (`" ⟶ "`, before the trim). */
const ARROW_SUFFIX = " ⟶ "

const QUOTE = '"'
const MARKDOWN_OPENING = '"`'
const MARKDOWN_CLOSING = '`"'

/** The styles of a point or of a class, as the Db keeps them: in the order in which each name was first given. */
type Styles = Record<string, number | string>

/** A point of the Db. */
interface Point {
  readonly text: string
  readonly className: string
  readonly x: string
  readonly y: string
  readonly styles: Styles
}

/** The builder of the summary: the statements are executed in source order. */
class QuadrantDbBuilder {
  private title: string

  private accTitle = ""

  private accDescr = ""

  private readonly quadrants: [string, string, string, string] = [
    "",
    "",
    "",
    "",
  ]

  private xLeft = ""

  private xRight = ""

  private yBottom = ""

  private yTop = ""

  /** The points, the newest first. */
  private readonly points: Point[] = []

  /** The classes by name, in the order of their first definition, each with the styles of its last. */
  private readonly classes = new Map<string, Styles>()

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
    this.title = this.replace(embedded.title ?? "")
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: QuadrantDiagram): DbSummary {
    for (const statement of diagram.body) this.execute(statement)
    return {
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      quadrants: [...this.quadrants],
      xAxis: { left: this.xLeft, right: this.xRight },
      yAxis: { bottom: this.yBottom, top: this.yTop },
      points: this.points.map(pointSummary),
      classes: [...this.classes].map(([name, styles]) =>
        classSummary(name, styles),
      ),
    }
  }

  /** Executing: what one statement changes. */
  private execute(statement: QuadrantStatement): void {
    switch (statement.type) {
      case "QuadrantTitleStatement":
        // A title with no text sets the empty text.
        this.title = this.replace(
          statement.value === null ? "" : this.literalOf(statement.value),
        )
        break
      case "QuadrantAccTitleStatement":
        this.accTitle = this.replace(this.literalOf(statement.value))
        break
      case "QuadrantAccDescrStatement":
        this.accDescr = this.replace(
          descriptionOf(this.writtenOf(statement.value)),
        )
        break
      case "QuadrantAccDescrBlockStatement":
        // A block without text changes nothing.
        if (statement.value === null) break
        this.accDescr = this.replace(
          descriptionOf(this.writtenOf(statement.value)),
        )
        break
      case "QuadrantAxisStatement":
        this.executeAxis(statement)
        break
      case "QuadrantQuadrantStatement":
        this.quadrants[quadrantIndexOf(statement.quadrant)] = this.replace(
          trimmed(this.labelTextOf(statement.text)),
        )
        break
      case "QuadrantPointStatement":
        this.executePoint(statement)
        break
      case "QuadrantClassDefStatement":
        this.executeClassDef(statement)
        break
      default:
        throw new Error(
          `quadrant Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Axes: the first text of the statement is the first text of the axis, the
   * left or the bottom one, and the second text, if the statement has one, is
   * the second; a statement with the arrow and no second text sets the first
   * text with ` ⟶` after it and leaves the second, and a statement with one
   * text sets the first only. Each text is kept without the whitespace at its
   * ends, and with the replacement of characters.
   */
  private executeAxis(statement: QuadrantAxisStatement): void {
    const start = this.labelTextOf(statement.start)
    const first = this.replace(
      trimmed(
        statement.arrow && statement.end === null
          ? start + ARROW_SUFFIX
          : start,
      ),
    )
    const second =
      statement.end === null
        ? null
        : this.replace(trimmed(this.labelTextOf(statement.end)))
    if (statement.axis === "x") {
      this.xLeft = first
      if (second !== null) this.xRight = second
    } else {
      this.yBottom = first
      if (second !== null) this.yTop = second
    }
  }

  /** Points: adds the point before those already there, with the styles it names. */
  private executePoint(statement: QuadrantPointStatement): void {
    this.points.unshift({
      text: this.replace(trimmed(this.labelTextOf(statement.name))),
      className: statement.className === null ? "" : statement.className.name,
      x: this.literalOf(statement.x),
      y: this.literalOf(statement.y),
      styles: this.stylesOf(statement.styles),
    })
  }

  /** Classes: a class takes the styles of its last definition, and keeps the place of its first. */
  private executeClassDef(statement: QuadrantClassDefStatement): void {
    this.classes.set(
      this.text.of(statement.name.range),
      this.stylesOf(statement.styles),
    )
  }

  /** The text of a title or of a coordinate or style: the converted form of its range, without the whitespace at its ends. */
  private literalOf(literal: QuadrantLiteral): string {
    return trimmed(this.writtenOf(literal))
  }

  /** The converted form of the range of a literal, the whitespace inside it included. */
  private writtenOf(literal: QuadrantLiteral): string {
    return this.text.of(literal.range)
  }

  /**
   * Texts: the text that a label gives, before it is trimmed: for words
   * without quotes, the converted form of its range; for a string, the
   * converted form of what lies between the quotes followed by the converted
   * form of the rest; for a markdown string, the same with its backquotes
   * left out.
   */
  private labelTextOf(label: QuadrantLabel): string {
    const written = this.text.of(label.range)
    switch (label.kind) {
      case "text":
        return written
      case "string":
        return splitAfterDelimiter(written, QUOTE, QUOTE, label)
      case "markdown":
        return splitAfterDelimiter(
          written,
          MARKDOWN_OPENING,
          MARKDOWN_CLOSING,
          label,
        )
      default:
        throw new TreeError(
          "quadrant",
          "QuadrantLabel",
          `the kind is ${JSON.stringify(label.kind)}, none of text, string, markdown`,
        )
    }
  }

  /**
   * Styles: each style is a name, a `:`, and a value; the whitespace around
   * the first `:` is not part of either, and what lies after a second `:` is
   * dropped. The styles are put into the object in the order they are given,
   * a name given twice keeping its first place and its last value.
   */
  private stylesOf(styles: readonly QuadrantLiteral[]): Styles {
    const kept: Styles = {}
    for (const style of styles) {
      const written = this.literalOf(style)
      const colon = written.indexOf(":")
      const name = colon === -1 ? written : trimmed(written.slice(0, colon))
      const rest = colon === -1 ? "" : written.slice(colon + 1)
      const second = rest.indexOf(":")
      const value = trimmed(second === -1 ? rest : rest.slice(0, second))
      switch (name) {
        case "radius":
          setOwnProperty(kept, "radius", Number(value))
          break
        case "color":
          setOwnProperty(kept, "color", value)
          break
        case "stroke-color":
          setOwnProperty(kept, "strokeColor", value)
          break
        case "stroke-width":
          setOwnProperty(kept, "strokeWidth", value)
          break
        default:
          throw new TreeError(
            "quadrant",
            "QuadrantLiteral",
            `the style ${JSON.stringify(written)} has a name that the Db does not take`,
          )
      }
    }
    return kept
  }
}

/**
 * The text of a label that starts with a string: what lies between the
 * delimiters `opening` and `closing` of `written`, followed by what lies after
 * the closing one.
 */
function splitAfterDelimiter(
  written: string,
  opening: string,
  closing: string,
  label: QuadrantLabel,
): string {
  const close = written.indexOf(closing, opening.length)
  if (!written.startsWith(opening) || close === -1) {
    throw new TreeError(
      "quadrant",
      "QuadrantLabel",
      `the ${label.kind} is not written between ${opening} and ${closing}: ${JSON.stringify(written)}`,
    )
  }
  return (
    written.slice(opening.length, close) + written.slice(close + closing.length)
  )
}

/** The index in the list of four texts of the quadrant `quadrant`. */
function quadrantIndexOf(quadrant: number): 0 | 1 | 2 | 3 {
  switch (quadrant) {
    case 1:
      return 0
    case 2:
      return 1
    case 3:
      return 2
    case 4:
      return 3
    default:
      throw new TreeError(
        "quadrant",
        "QuadrantQuadrantStatement",
        `the quadrant is ${quadrant}, none of 1, 2, 3, 4`,
      )
  }
}

/** The styles as a summary holds them: a radius too large for a double is the text of the number. */
function stylesSummary(styles: Styles): JsonObject {
  const summary: JsonObject = {}
  for (const [name, value] of Object.entries(styles)) {
    setOwnProperty(
      summary,
      name,
      typeof value === "number" ? numberOrText(value) : value,
    )
  }
  return summary
}

/** The summary of a point. */
function pointSummary(point: Point): JsonObject {
  return {
    text: point.text,
    className: point.className,
    x: point.x,
    y: point.y,
    ...stylesSummary(point.styles),
  }
}

/** The summary of a class. */
function classSummary(name: string, styles: Styles): JsonObject {
  return { name, ...stylesSummary(styles) }
}

/**
 * docs/db-from-tree/quadrant.md: the summary of the Db that the quadrant chart
 * tree `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function quadrantDbOf(
  source: string,
  root: TreeRoot,
  diagram: QuadrantDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new QuadrantDbBuilder(source, root, embedded).summaryOf(diagram)
}
