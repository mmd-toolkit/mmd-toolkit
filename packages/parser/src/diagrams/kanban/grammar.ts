import type {
  KanbanClassStatement,
  KanbanDataBlock,
  KanbanIconStatement,
  KanbanLabel,
  KanbanLiteral,
  KanbanNode,
  KanbanShape,
} from "../../ast/kanban.ts"
import { significantRangeOf } from "../../diagram-units.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import { CLOSERS, OPENERS } from "./units.ts"
import type { KanbanLexing, Unit } from "./units.ts"
import type { UnitName } from "./units.ts"

/** What the grammar makes of the units of a kanban. */
export interface KanbanSyntax {
  /** The columns, each with its cards, in source order. */
  readonly body: readonly KanbanNode[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** A decoration of a node: an icon line or a class line. */
type Decoration = KanbanIconStatement | KanbanClassStatement

/**
 * A node line as the grammar reads it, before the tree is made: the node
 * with its indentation, the decorations read after it so far, and the
 * units that its range runs between.
 */
interface NodeLine {
  readonly indent: number
  readonly id: KanbanLiteral | null
  readonly shape: KanbanShape | null
  readonly data: readonly KanbanDataBlock[]
  readonly decorations: Decoration[]
  /** The first unit of the node. */
  readonly first: Unit
  /** The last unit of the node or of its last decoration. */
  last: Unit
}

/**
 * diagrams/kanban.md, Grammar: the recursive-descent parser over the
 * units of the kanban lexer. Each method reads one rule of the grammar,
 * which its comment names, and makes the node that the specification
 * gives for the rule, with the tokens of `docs/tokens/kanban.md`, Tokens.
 * Columns own their cards; each node keeps its absolute indentation.
 */
export class KanbanGrammar extends UnitGrammar<UnitName, Unit> {
  /** The node lines read so far, in source order. */
  private readonly nodeLines: NodeLine[] = []

  public constructor(lexing: KanbanLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.kanban, lexing.comments)
  }

  /**
   * Diagram and lines: `diagram = header line? ( newline line? )*`, with
   * `line = node | icon-line | class-line`. The first node may stand on
   * the line of the header.
   */
  public parseDiagram(): KanbanSyntax {
    this.addItem("Keyword", [this.take("header")])
    if (this.startsLine()) this.parseLine()
    while (this.peek() !== null) {
      this.take("newline")
      if (this.startsLine()) this.parseLine()
    }
    return {
      body: this.makeBody(),
      tokens: this.tokensInOrder(),
    }
  }

  /**
   * known-divergences/tokenless-empty-forms.md: an empty string, an empty
   * markdown string, an empty icon, or an empty class line, which no rule
   * of the grammar takes wherever it stands (Empty forms).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }

  /** Whether a line starts at the next unit: it is neither a `newline` unit nor the end of the text. */
  private startsLine(): boolean {
    const name = this.nameAt(this.next)
    return name !== null && name !== "newline"
  }

  /** Diagram and lines: `line = node | icon-line | class-line`. */
  private parseLine(): void {
    const start = this.next
    switch (this.nameAt(start)) {
      case "::icon(":
        this.decorate(this.parseIconLine(), this.lastUnitFrom(start))
        return
      case ":::":
        this.decorate(this.parseClassLine(), this.lastUnitFrom(start))
        return
      default:
        this.parseNode()
    }
  }

  /** Diagram and lines: `node = node-text shape? | shape`, followed by adjacent data blocks. */
  private parseNode(): void {
    const start = this.next
    const first = this.peek()
    if (first === null) throw this.unexpected(null)
    const nodeText = this.takeIf("node-text")
    const id = nodeText === null ? null : this.literalOf(nodeText)
    const shape =
      nodeText === null || this.nameAt(this.next) === "opener"
        ? this.parseShape()
        : null
    const data = this.parseDataBlocks()
    const line: NodeLine = {
      indent: first.whitespaceBefore,
      id,
      shape,
      data,
      decorations: [],
      first,
      last: this.lastUnitFrom(start),
    }
    this.placeLine(line)
  }

  /** Rejections outside the grammar: a node after one shallower than the first is rejected. */
  private placeLine(line: NodeLine): void {
    const first = this.nodeLines.at(0)
    const previous = this.nodeLines.at(-1)
    if (
      first !== undefined &&
      previous !== undefined &&
      previous.indent < first.indent
    ) {
      throw this.rejectedOutsideGrammar(
        "A node cannot follow a node less indented than the first",
        line.first,
        line.last,
      )
    }
    this.nodeLines.push(line)
  }

  /**
   * Data blocks: `data-block = data-start ( data-text | data-quote )* "}"`,
   * each right after the node or the block before it, with no whitespace
   * between, and directives allowed there. The `data-start` and the `}` are
   * one `Punctuator` item each, and the units between them one `RawText`
   * item; the value is the written text between `@{` and `}`.
   */
  private parseDataBlocks(): KanbanDataBlock[] {
    const blocks: KanbanDataBlock[] = []
    while (this.peek()?.name === "data-start") {
      const start = this.next
      const opening = this.take("data-start")
      if (opening.whitespaceBefore !== 0) throw this.unexpected(opening)
      this.addItem("Punctuator", [opening])
      this.addItem("RawText", this.takeWhile(["data-text", "data-quote"]))
      const closing = this.take("}")
      this.addItem("Punctuator", [closing])
      blocks.push({
        type: "KanbanDataBlock",
        value: this.textOf([
          significantRangeOf(opening)[1],
          significantRangeOf(closing)[0],
        ]),
        ...this.placeFrom(start),
      })
    }
    return blocks
  }

  /**
   * Icons and classes, and Rejections outside the grammar: gives
   * `decoration` to the node added last, whatever the indentation of its
   * line; an icon or a class line before the first node is rejected.
   * `last` is the last unit of the decoration, which the node's range now
   * runs to.
   */
  private decorate(decoration: Decoration, last: Unit): void {
    const line = this.nodeLines.at(-1)
    if (line === undefined) {
      throw new ParseError(
        "An icon or a class line needs a node before it",
        decoration.range,
        decoration.loc,
      )
    }
    line.decorations.push(decoration)
    line.last = last
  }

  /** The last unit read, the one before the next unit, which lies at or after the position `start`. */
  private lastUnitFrom(start: number): Unit {
    const last = this.unitAt(this.positionBefore(this.next))
    if (last === null || last.index < start) {
      throw new Error("mmd-toolkit parser bug: a line has no unit")
    }
    return last
  }

  /**
   * Nodes and shapes: `shape = opener shape-label closer`, with
   * `shape-label = shape-text | string | markdown-string`.
   */
  private parseShape(): KanbanShape {
    const opener = this.take("opener")
    this.addItem("Punctuator", [opener])
    const label = this.parseLabel()
    const closer = this.take("closer")
    this.addItem("Punctuator", [closer])
    return {
      type: "KanbanShape",
      opener: this.wordOf(opener, OPENERS),
      closer: this.wordOf(closer, CLOSERS),
      label,
      ...this.placeOf([opener, closer]),
    }
  }

  /** The member of `words` that the text of `unit` is; any other text is a bug of the lexer, which reads only those. */
  private wordOf<Word extends string>(
    unit: Unit,
    words: readonly Word[],
  ): Word {
    const written = this.textOfUnit(unit)
    const word = words.find((candidate) => candidate === written)
    if (word === undefined) {
      throw new Error(
        `mmd-toolkit parser bug: ${JSON.stringify(written)} is no ${unit.name}`,
      )
    }
    return word
  }

  /**
   * Nodes and shapes, `shape-label`: a `shape-text`, one `RawText` item,
   * whose value is its written text; a `string` or a `markdown-string`, one
   * `String` item, whose value is its content between its delimiters.
   */
  private parseLabel(): KanbanLabel {
    const unit = this.peek()
    switch (unit?.name) {
      case "shape-text": {
        this.advance()
        this.addItem("RawText", [unit])
        const place = this.placeOf([unit])
        return {
          type: "KanbanLabel",
          kind: "text",
          value: this.textOf(place.range),
          ...place,
        }
      }
      case "string":
        this.advance()
        return this.quotedLabelOf(unit, "string")
      case "markdown-string":
        this.advance()
        return this.quotedLabelOf(unit, "markdown")
      default:
        throw this.unexpected(unit)
    }
  }

  /**
   * The label of the `string` or `markdown-string` unit `unit`, one
   * `String` item, whose value is the written text of its content, between
   * its delimiters (`Unit.contentRange`).
   */
  private quotedLabelOf(unit: Unit, kind: "string" | "markdown"): KanbanLabel {
    if (unit.contentRange === null) {
      throw new Error(
        `mmd-toolkit parser bug: the ${unit.name} unit at ${unit.start} has no content`,
      )
    }
    this.addItem("String", [unit])
    return {
      type: "KanbanLabel",
      kind,
      value: this.textOf(unit.contentRange),
      ...this.placeOf([unit]),
    }
  }

  /** Diagram and lines: `icon-line = "::icon(" icon-text ")"`. */
  private parseIconLine(): KanbanIconStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("::icon(")])
    const icon = this.literalOf(this.take("icon-text"))
    this.addItem("Punctuator", [this.take(")")])
    return { type: "KanbanIconStatement", icon, ...this.placeFrom(start) }
  }

  /**
   * Diagram and lines: `class-line = ":::" class-text`. A `:::` without a
   * `class-text` is an empty class line (Empty forms).
   */
  private parseClassLine(): KanbanClassStatement {
    const start = this.next
    const marker = this.take(":::")
    if (this.nameAt(this.next) !== "class-text") throw this.unexpected(marker)
    this.addItem("Punctuator", [marker])
    const cssClass = this.literalOf(this.take("class-text"))
    return { type: "KanbanClassStatement", cssClass, ...this.placeFrom(start) }
  }

  /**
   * ast/kanban.md, KanbanLiteral: the text unit `unit`, a `node-text`, an
   * `icon-text`, or a `class-text`, one `RawText` item, whose value is the
   * written text of its token, which keeps the whitespace at its ends.
   */
  private literalOf(unit: Unit): KanbanLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "KanbanLiteral", value: this.textOf(place.range), ...place }
  }

  /** Indentation and parents: the first indentation identifies columns; all other nodes are cards. */
  private makeBody(): KanbanNode[] {
    const body: KanbanNode[] = []
    let column: NodeLine | null = null
    let children: KanbanNode[] = []
    for (const line of this.nodeLines) {
      if (column === null || line.indent === this.nodeLines[0].indent) {
        if (column !== null) body.push(this.nodeOf(column, children))
        column = line
        children = []
      } else children.push(this.nodeOf(line, []))
    }
    if (column !== null) body.push(this.nodeOf(column, children))
    return body
  }

  /** ast/kanban.md, Node ranges: owned syntax through the final card, when present. */
  private nodeOf(line: NodeLine, children: readonly KanbanNode[]): KanbanNode {
    const range = this.placeOf([line.first, line.last]).range
    range[1] = children.at(-1)?.range[1] ?? range[1]
    return {
      type: "KanbanNode",
      indent: line.indent,
      id: line.id,
      shape: line.shape,
      data: line.data,
      decorations: line.decorations,
      children,
      range,
      loc: this.lines.location(range),
    }
  }

  /** Rejections outside the grammar: the error with the message `message`, over the units from `first` to `last`. */
  private rejectedOutsideGrammar(
    message: string,
    first: Unit,
    last: Unit,
  ): ParseError {
    const { range, loc } = this.placeOf([first, last])
    return new ParseError(message, range, loc)
  }
}
