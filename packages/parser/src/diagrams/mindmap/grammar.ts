import type {
  MindmapClassStatement,
  MindmapCloser,
  MindmapIconStatement,
  MindmapLabel,
  MindmapLiteral,
  MindmapNode,
  MindmapOpener,
  MindmapShape,
} from "../../ast/mindmap.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { MindmapLexing, Unit } from "./units.ts"
import type { UnitName } from "./units.ts"

/** What the grammar makes of the units of a mindmap. */
export interface MindmapSyntax {
  /** The root, the first node; null when there is none. */
  readonly root: MindmapNode | null
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** ast/mindmap.md, MindmapShape: the openers, as written. */
const OPENERS: readonly MindmapOpener[] = [
  "(",
  "((",
  "[",
  "{{",
  ")",
  "))",
  "(-",
  "-)",
]

/** ast/mindmap.md, MindmapShape: the closers, as written. */
const CLOSERS: readonly MindmapCloser[] = [
  ")",
  "))",
  "]",
  "}}",
  "(",
  "((",
  "(-",
  "-)",
]

/** A decoration of a node: an icon line or a class line. */
type Decoration = MindmapIconStatement | MindmapClassStatement

/**
 * A node line as the grammar reads it, before the tree is made: the node
 * with its indentation, the decorations read after it so far, and the
 * units that its range runs between.
 */
interface NodeLine {
  readonly indent: number
  readonly id: MindmapLiteral | null
  readonly shape: MindmapShape | null
  readonly decorations: Decoration[]
  /** The first unit of the node. */
  readonly first: Unit
  /** The last unit of the node or of its last decoration. */
  last: Unit
  /** The node lines whose parent it is, in source order. */
  readonly children: NodeLine[]
}

/**
 * diagrams/mindmap.md, Grammar: the recursive-descent parser over the
 * units of the mindmap lexer. Each method reads one rule of the grammar,
 * which its comment names, and makes the node that the specification
 * gives for the rule, with the tokens of `docs/tokens/mindmap.md`, Tokens.
 * The places of the nodes in the tree come from their indentation
 * (Indentation and parents), which the grammar follows as it reads them,
 * so that it makes the two rejections outside the grammar where it reads
 * the line.
 */
export class MindmapGrammar extends UnitGrammar<UnitName, Unit> {
  /** The node lines read so far, in source order. */
  private readonly nodeLines: NodeLine[] = []

  /**
   * Indentation and parents: the node lines that a later node may be a
   * child of, the root first: each is the last child of the one before it,
   * and each is less indented than the next.
   */
  private readonly openLines: NodeLine[] = []

  public constructor(lexing: MindmapLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.mindmap, lexing.comments)
  }

  /**
   * Diagram and lines: `diagram = "header" node? ( newline line? )*`, with
   * `line = node | icon-line | class-line`. The first node may stand on
   * the line of the header.
   */
  public parseDiagram(): MindmapSyntax {
    this.addItem("Keyword", [this.take("header")])
    if (this.startsLine()) this.parseNode()
    while (this.peek() !== null) {
      this.take("newline")
      if (this.startsLine()) this.parseLine()
    }
    return { root: this.makeTree(), tokens: this.tokensInOrder() }
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

  /**
   * Diagram and lines: `node = node-text shape? | shape`. Indentation and
   * parents: the node is a child of the nearest node before it whose
   * indentation is smaller than its own; a node that is not the first and
   * has none is rejected outside the grammar.
   */
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
    const line: NodeLine = {
      indent: first.whitespaceBefore,
      id,
      shape,
      decorations: [],
      first,
      last: this.lastUnitFrom(start),
      children: [],
    }
    this.placeLine(line)
  }

  /**
   * Indentation and parents, and Rejections outside the grammar: places
   * `line` in the tree: the first node line is the root, and every other
   * one is a child of the nearest open line less indented than it, which
   * closes the lines after that one. A line as indented as the root or less
   * has none, and is rejected.
   */
  private placeLine(line: NodeLine): void {
    if (this.nodeLines.length > 0) {
      for (
        let open = this.openLines.at(-1);
        open !== undefined && open.indent >= line.indent;
        open = this.openLines.at(-1)
      ) {
        this.openLines.pop()
      }
      const parent = this.openLines.at(-1)
      if (parent === undefined) {
        throw this.rejectedOutsideGrammar(
          "A node cannot be as indented as the root or less",
          line.first,
          line.last,
        )
      }
      parent.children.push(line)
    }
    this.nodeLines.push(line)
    this.openLines.push(line)
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
  private parseShape(): MindmapShape {
    const opener = this.take("opener")
    this.addItem("Punctuator", [opener])
    const label = this.parseLabel()
    const closer = this.take("closer")
    this.addItem("Punctuator", [closer])
    return {
      type: "MindmapShape",
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
  private parseLabel(): MindmapLabel {
    const unit = this.peek()
    switch (unit?.name) {
      case "shape-text": {
        this.advance()
        this.addItem("RawText", [unit])
        const place = this.placeOf([unit])
        return {
          type: "MindmapLabel",
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
  private quotedLabelOf(unit: Unit, kind: "string" | "markdown"): MindmapLabel {
    if (unit.contentRange === null) {
      throw new Error(
        `mmd-toolkit parser bug: the ${unit.name} unit at ${unit.start} has no content`,
      )
    }
    this.addItem("String", [unit])
    return {
      type: "MindmapLabel",
      kind,
      value: this.textOf(unit.contentRange),
      ...this.placeOf([unit]),
    }
  }

  /** Diagram and lines: `icon-line = "::icon(" icon-text ")"`. */
  private parseIconLine(): MindmapIconStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("::icon(")])
    const icon = this.literalOf(this.take("icon-text"))
    this.addItem("Punctuator", [this.take(")")])
    return { type: "MindmapIconStatement", icon, ...this.placeFrom(start) }
  }

  /**
   * Diagram and lines: `class-line = ":::" class-text`. A `:::` without a
   * `class-text` is an empty class line (Empty forms).
   */
  private parseClassLine(): MindmapClassStatement {
    const start = this.next
    const marker = this.take(":::")
    if (this.nameAt(this.next) !== "class-text") throw this.unexpected(marker)
    this.addItem("Punctuator", [marker])
    const cssClass = this.literalOf(this.take("class-text"))
    return { type: "MindmapClassStatement", cssClass, ...this.placeFrom(start) }
  }

  /**
   * ast/mindmap.md, MindmapLiteral: the text unit `unit`, a `node-text`, an
   * `icon-text`, or a `class-text`, one `RawText` item, whose value is the
   * written text of its token, which keeps the whitespace at its ends.
   */
  private literalOf(unit: Unit): MindmapLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "MindmapLiteral", value: this.textOf(place.range), ...place }
  }

  /**
   * ast/mindmap.md, MindmapNode: the tree of the node lines read, the node
   * of the root; null when there is none. The range of a node runs from its
   * first unit to the last unit of its subtree, which is that of the last
   * node line of the subtree, the line read last of them. The nodes are
   * made from the last line back, as the lines of a subtree follow the
   * line of its node, so that the children of a line are made before it:
   * making each node from its children, from the root down, would go as
   * deep into the call stack as the tree is deep.
   */
  private makeTree(): MindmapNode | null {
    const nodes = new Map<NodeLine, MindmapNode>()
    const subtreeLasts = new Map<NodeLine, Unit>()
    for (let index = this.nodeLines.length - 1; index >= 0; index -= 1) {
      const line = this.nodeLines[index]
      const children = line.children.map((child) => this.madeFrom(nodes, child))
      const lastChild = line.children.at(-1)
      const subtreeLast =
        lastChild === undefined
          ? line.last
          : this.madeFrom(subtreeLasts, lastChild)
      subtreeLasts.set(line, subtreeLast)
      nodes.set(line, {
        type: "MindmapNode",
        indent: line.indent,
        id: line.id,
        shape: line.shape,
        decorations: line.decorations,
        children,
        ...this.placeOf([line.first, subtreeLast]),
      })
    }
    const root = this.nodeLines.at(0)
    return root === undefined ? null : this.madeFrom(nodes, root)
  }

  /** What `made` holds for the node line `line`, which a line after it made; a line not made yet is a bug of the order. */
  private madeFrom<Made>(
    made: ReadonlyMap<NodeLine, Made>,
    line: NodeLine,
  ): Made {
    const value = made.get(line)
    if (value === undefined) {
      throw new Error(
        "mmd-toolkit parser bug: a node line is made after its parent",
      )
    }
    return value
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
