import type { Identifier, NumericLiteral, StringLiteral } from "../../ast.ts"
import type {
  BlockAccDescrBlockStatement,
  BlockArrow,
  BlockArrowShape,
  BlockClassDefStatement,
  BlockClassStatement,
  BlockColumnsStatement,
  BlockCompositeStatement,
  BlockLink,
  BlockLiteral,
  BlockNode,
  BlockNodeStatement,
  BlockOpeningArrow,
  BlockShape,
  BlockSpaceStatement,
  BlockStatement,
  BlockStyleStatement,
} from "../../ast/block.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { BlockLexing, Unit, UnitName } from "./units.ts"

/** What the grammar makes of the units of a block diagram. */
export interface BlockSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly BlockStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
}

/** Edge statements: the units that start a link. */
const LINK_STARTS: readonly UnitName[] = ["arrow", "opening-arrow"]

/** Nodes and widths: the units that go on with a node after its id, the openings of a shape and of a block arrow. */
const SHAPE_STARTS: readonly UnitName[] = ["shape-open", "<["]

/**
 * diagrams/block.md, Rejections outside the grammar: the message of the
 * error for a `style` statement whose id names no block.
 */
const STYLE_MESSAGE = "style names no block made before it"

/**
 * diagrams/block.md, Grammar: the recursive-descent parser over the units
 * of the block lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of `docs/tokens/block.md`, Tokens.
 */
export class BlockGrammar extends UnitGrammar<UnitName, Unit> {
  /**
   * Rejections outside the grammar: the ids of the blocks that the
   * statements read so far made, which a `style` statement must name; the
   * block `root`, which holds the diagram, is always there.
   */
  private readonly madeIds = new Set<string>(["root"])

  public constructor(lexing: BlockLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.block, [])
  }

  /** Diagram and statements: `diagram = header statement+`, the header being `block-beta` or `block`. */
  public parseDiagram(): BlockSyntax {
    const header = this.peek()
    if (header?.name !== "block-beta" && header?.name !== "block") {
      throw this.unexpected(header)
    }
    this.addItem("Keyword", [header])
    this.advance()
    const body = this.parseStatements(false)
    return { body, tokens: this.tokensInOrder() }
  }

  /**
   * known-divergences/tokenless-empty-forms.md: an empty string and an
   * empty markdown string, which no rule of the grammar takes, and an empty
   * description block inside a statement (Empty description blocks, Empty
   * strings).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    return this.emptyFormErrorAt(unit)
  }

  /**
   * Diagram and statements, and Composites: `statement+`, up to the end of
   * the text, or, in a composite (`inComposite`), up to its `end`. An empty
   * description block where a statement starts is a statement; at least
   * one statement must be another.
   */
  private parseStatements(inComposite: boolean): BlockStatement[] {
    const body: BlockStatement[] = []
    let hasStatement = false
    for (let unit = this.peek(); unit !== null; unit = this.peek()) {
      if (inComposite && unit.name === "end") break
      if (this.emptyBlockStartsAt(this.next)) {
        body.push(this.parseAccDescrBlockStatement())
      } else {
        body.push(this.parseStatement(unit))
        hasStatement = true
      }
    }
    if (!hasStatement) throw this.unexpected(this.peek())
    return body
  }

  /** Empty description blocks: whether an empty description block starts at the position `position`. */
  private emptyBlockStartsAt(position: number): boolean {
    const unit = this.unitAt(position)
    const form = unit === null ? null : this.emptyFormOf(unit)
    return form?.kind === "empty-description-block" && form.units[0] === unit
  }

  /** Diagram and statements: `statement`, which starts at `unit`, the next unit. */
  private parseStatement(unit: Unit): BlockStatement {
    switch (unit.name) {
      case "id": {
        const statement = this.parseNodeStatement()
        this.recordNodeStatement(statement)
        return statement
      }
      case "space":
      case "space:":
        return this.parseSpaceStatement()
      case "columns":
        return this.parseColumnsStatement()
      case "block:":
      case "block":
      case "block-beta":
        return this.parseCompositeStatement()
      case "classDef":
        return this.parseClassDefStatement()
      case "class":
        return this.parseClassStatement()
      case "style":
        return this.parseStyleStatement()
      default:
        throw this.unexpected(unit)
    }
  }

  /**
   * Empty description blocks: `empty-description-block = "accDescr" "{"
   * "}"`, a statement where a statement starts.
   */
  private parseAccDescrBlockStatement(): BlockAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    this.addItem("Punctuator", [this.take("}")])
    return { type: "BlockAccDescrBlockStatement", ...this.placeFrom(start) }
  }

  /**
   * Nodes and widths, and Edge statements: `node-statement = node width?
   * link*`, with `width = ":" digits`. A width follows the first node
   * only.
   */
  private parseNodeStatement(): BlockNodeStatement {
    const start = this.next
    const node = this.parseNode()
    this.rejectEmptyFormsBefore([":", ...LINK_STARTS])
    const colon = this.takeIf(":")
    let width: NumericLiteral | null = null
    if (colon !== null) {
      this.addItem("Punctuator", [colon])
      width = this.numericLiteralOf(this.take("digits"))
      this.rejectEmptyFormsBefore(LINK_STARTS)
    }
    const links: BlockLink[] = []
    while (LINK_STARTS.some((name) => name === this.peek()?.name)) {
      links.push(this.parseLink())
      this.rejectEmptyFormsBefore(LINK_STARTS)
    }
    return {
      type: "BlockNodeStatement",
      node,
      width,
      links,
      ...this.placeFrom(start),
    }
  }

  /**
   * Rejections outside the grammar: the blocks that the node statement
   * `statement` makes, which a later `style` may name: its nodes, but for a
   * chain of two or more links, which keeps only the node at its end.
   */
  private recordNodeStatement(statement: BlockNodeStatement): void {
    const { node, links } = statement
    const last = links.at(-1)
    const kept =
      links.length >= 2 && last !== undefined
        ? [last.target]
        : [node, ...links.map((link) => link.target)]
    for (const keptNode of kept) this.madeIds.add(keptNode.id.name)
  }

  /** Nodes and widths: `node = id ( shape | block-arrow )?`. */
  private parseNode(): BlockNode {
    const start = this.next
    const id = this.identifierOf([this.take("id")])
    this.rejectEmptyFormsBefore(SHAPE_STARTS)
    let shape: BlockShape | BlockArrowShape | null = null
    if (this.peek()?.name === "shape-open") {
      shape = this.parseShape()
    } else if (this.peek()?.name === "<[") {
      shape = this.parseBlockArrow()
    }
    return { type: "BlockNode", id, shape, ...this.placeFrom(start) }
  }

  /** Shapes and block arrows: `shape = shape-open string shape-close`. */
  private parseShape(): BlockShape {
    const start = this.next
    const open = this.take("shape-open")
    this.addItem("Punctuator", [open])
    const label = this.parseString()
    const close = this.take("shape-close")
    this.addItem("Punctuator", [close])
    return {
      type: "BlockShape",
      open: this.textOfUnit(open),
      close: this.textOfUnit(close),
      label,
      ...this.placeFrom(start),
    }
  }

  /**
   * Shapes and block arrows: `block-arrow = "<[" string "]>" "(" direction+
   * ")"`, where a `,` may stand before each direction (Block arrows).
   */
  private parseBlockArrow(): BlockArrowShape {
    const start = this.next
    this.addItem("Punctuator", [this.take("<[")])
    const label = this.parseString()
    this.addItem("Punctuator", [this.take("]>")])
    this.addItem("Punctuator", [this.take("(")])
    const directions: BlockLiteral[] = []
    do {
      const comma = this.takeIf(",")
      if (comma !== null) this.addItem("Punctuator", [comma])
      directions.push(this.parseDirection())
    } while (this.peek()?.name !== ")")
    this.addItem("Punctuator", [this.take(")")])
    return {
      type: "BlockArrowShape",
      label,
      directions,
      ...this.placeFrom(start),
    }
  }

  /**
   * Block arrows: a direction, a `direction` unit, one `Keyword` item, with
   * the `direction-space` units of the whitespace that it holds, before it
   * after the `(` and after it, each one `RawText` item, as a BlockLiteral
   * over these units, whose value is their written text (ast/block.md,
   * BlockArrowShape).
   */
  private parseDirection(): BlockLiteral {
    const before = this.takeIf("direction-space")
    const word = this.take("direction")
    const after = this.takeIf("direction-space")
    const units = [before, word, after].filter((unit) => unit !== null)
    if (before !== null) this.addItem("RawText", [before])
    this.addItem("Keyword", [word])
    if (after !== null) this.addItem("RawText", [after])
    const place = this.placeOf(units)
    return { type: "BlockLiteral", value: this.textOf(place.range), ...place }
  }

  /** Edge statements: `link = ( arrow | opening-arrow string arrow ) node`. */
  private parseLink(): BlockLink {
    const start = this.next
    let opening: BlockOpeningArrow | null = null
    let label: StringLiteral | null = null
    const openingUnit = this.takeIf("opening-arrow")
    if (openingUnit !== null) {
      opening = this.openingArrowOf(openingUnit)
      label = this.parseString()
    }
    const arrow = this.arrowOf(this.take("arrow"))
    const target = this.parseNode()
    return {
      type: "BlockLink",
      opening,
      arrow,
      label,
      target,
      ...this.placeFrom(start),
    }
  }

  /** ast/block.md, BlockArrow: the arrow of the `arrow` unit `unit`, one `Punctuator` item. */
  private arrowOf(unit: Unit): BlockArrow {
    const parts = unit.arrow
    if (parts?.form !== "closed") {
      throw new Error(
        `mmd-toolkit parser bug: the ${unit.name} unit at ${unit.start} has no parts of an arrow`,
      )
    }
    this.addItem("Punctuator", [unit])
    return {
      type: "BlockArrow",
      value: this.textOfUnit(unit),
      startMarker: parts.startMarker,
      line: parts.line,
      length: parts.length,
      endMarker: parts.endMarker,
      ...this.placeOf([unit]),
    }
  }

  /** ast/block.md, BlockOpeningArrow: the opening arrow of the `opening-arrow` unit `unit`, one `Punctuator` item. */
  private openingArrowOf(unit: Unit): BlockOpeningArrow {
    const parts = unit.arrow
    if (parts?.form !== "opening") {
      throw new Error(
        `mmd-toolkit parser bug: the ${unit.name} unit at ${unit.start} has no parts of an opening arrow`,
      )
    }
    this.addItem("Punctuator", [unit])
    return {
      type: "BlockOpeningArrow",
      value: this.textOfUnit(unit),
      startMarker: parts.startMarker,
      line: parts.line,
      ...this.placeOf([unit]),
    }
  }

  /**
   * Shapes and block arrows, and Edge statements: a `string` unit, never
   * empty (Empty strings), as a StringLiteral, one `String` item. Its value
   * is its content: its written text without the quotes.
   */
  private parseString(): StringLiteral {
    const unit = this.take("string")
    if (this.emptyFormOf(unit) !== null) throw this.unexpected(unit)
    this.addItem("String", [unit])
    const place = this.placeOf([unit])
    const [start, end] = place.range
    return {
      type: "StringLiteral",
      value: this.textOf([start + 1, end - 1]),
      raw: this.lexer.text.slice(start, end),
      closed: true,
      ...place,
    }
  }

  /** Spaces and columns: `space-statement = "space" | "space:" digits`. */
  private parseSpaceStatement(): BlockSpaceStatement {
    const start = this.next
    const keyword = this.takeIf("space")
    if (keyword !== null) {
      this.addItem("Keyword", [keyword])
      return {
        type: "BlockSpaceStatement",
        width: null,
        ...this.placeFrom(start),
      }
    }
    this.addItem("Keyword", [this.take("space:")])
    const width = this.numericLiteralOf(this.take("digits"))
    return { type: "BlockSpaceStatement", width, ...this.placeFrom(start) }
  }

  /** Spaces and columns: `columns-statement = "columns" ( digits | "auto" )`. */
  private parseColumnsStatement(): BlockColumnsStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("columns")])
    const auto = this.takeIf("auto")
    if (auto !== null) this.addItem("Keyword", [auto])
    const count =
      auto === null ? this.numericLiteralOf(this.take("digits")) : null
    return { type: "BlockColumnsStatement", count, ...this.placeFrom(start) }
  }

  /**
   * Composites: `composite-statement = ( "block:" node-statement | "block"
   * | "block-beta" ) statement+ "end"`. Rejections outside the grammar: the
   * composite of `block:` makes the block of its node before its
   * statements, unless the node statement has links, which mermaid.js
   * reads as a composite with no id.
   */
  private parseCompositeStatement(): BlockCompositeStatement {
    const start = this.next
    let head: BlockNodeStatement | null = null
    const keyed = this.takeIf("block:")
    if (keyed !== null) {
      this.addItem("Keyword", [keyed])
      head = this.parseNodeStatement()
      if (head.links.length === 0) this.madeIds.add(head.node.id.name)
    } else {
      const keyword = this.peek()
      if (keyword?.name !== "block" && keyword?.name !== "block-beta") {
        throw this.unexpected(keyword)
      }
      this.addItem("Keyword", [keyword])
      this.advance()
    }
    const body = this.parseStatements(true)
    this.addItem("Keyword", [this.take("end")])
    return {
      type: "BlockCompositeStatement",
      head,
      body,
      ...this.placeFrom(start),
    }
  }

  /**
   * Classes and styles: `class-def-statement = "classDef" class-id style (
   * "," style )*`. The name `DEFAULT` is taken by no rule.
   */
  private parseClassDefStatement(): BlockClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    const nameUnit = this.take("class-id")
    if (nameUnit.text === "DEFAULT") throw this.unexpected(nameUnit)
    const name = this.identifierOf([nameUnit])
    const styles = this.parseStyles()
    return {
      type: "BlockClassDefStatement",
      name,
      styles,
      ...this.placeFrom(start),
    }
  }

  /**
   * Classes and styles: `class-statement = "class" class-ids class-name?`,
   * whose ids are the parts between the `,`, each with the whitespace after
   * the `,` before it. Rejections outside the grammar: after the statement
   * each of its ids, without that whitespace, is the id of a block, since
   * the statement makes one for an id that no block has.
   */
  private parseClassStatement(): BlockClassStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("class")])
    const ids: BlockLiteral[] = [this.parseClassId()]
    for (
      let comma = this.takeIf("id-comma");
      comma !== null;
      comma = this.takeIf("id-comma")
    ) {
      this.addItem("Punctuator", [comma])
      ids.push(this.parseClassId())
    }
    const name = this.takeIf("class-name")
    return {
      type: "BlockClassStatement",
      ids,
      cssClass: name === null ? null : this.literalOf([name]),
      ...this.placeFrom(start),
    }
  }

  /**
   * Classes and styles: an id of `class`, a `class-id` unit with the
   * `class-id-space` unit of the whitespace before it, when a `,` comes
   * before it, as a BlockLiteral, whose value keeps that whitespace
   * (ast/block.md, BlockClassStatement). The whitespace is a `RawText`
   * item, which a directive or a comment line may cut, and the word an
   * `Identifier` item, which a directive inside it makes the input
   * rejected (Directives inside units). Rejections outside the grammar: the
   * word is the id of a block from here on.
   */
  private parseClassId(): BlockLiteral {
    const space = this.takeIf("class-id-space")
    const word = this.take("class-id")
    if (space !== null) this.addItem("RawText", [space])
    this.addItem("Identifier", [word])
    this.madeIds.add(this.textOfUnit(word))
    const place = this.placeOf(space === null ? [word] : [space, word])
    return { type: "BlockLiteral", value: this.textOf(place.range), ...place }
  }

  /**
   * Classes and styles: `style-statement = "style" class-ids style ( ","
   * style )*`, whose id is one Identifier with its commas. Rejections
   * outside the grammar: the id, read as one text, must name a block that
   * an earlier statement made.
   */
  private parseStyleStatement(): BlockStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("style")])
    const idUnits = [this.take("class-id")]
    for (
      let comma = this.takeIf("id-comma");
      comma !== null;
      comma = this.takeIf("id-comma")
    ) {
      idUnits.push(comma)
      const space = this.takeIf("class-id-space")
      if (space !== null) idUnits.push(space)
      idUnits.push(this.take("class-id"))
    }
    this.addItem("Identifier", idUnits)
    const place = this.placeOf(idUnits)
    const id: Identifier = {
      type: "Identifier",
      name: this.textOf(place.range),
      ...place,
    }
    if (!this.madeIds.has(id.name)) {
      throw new ParseError(STYLE_MESSAGE, id.range, id.loc)
    }
    const styles = this.parseStyles()
    return {
      type: "BlockStyleStatement",
      id,
      styles,
      ...this.placeFrom(start),
    }
  }

  /**
   * Classes and styles: `style ( "," style )*`, the styles of the rest of
   * the line. A style is a `style-text` unit, with the whitespace at its
   * ends; null where the part between two `,` is empty.
   */
  private parseStyles(): (BlockLiteral | null)[] {
    const styles: (BlockLiteral | null)[] = []
    for (;;) {
      const text = this.takeIf("style-text")
      styles.push(text === null ? null : this.literalOf([text]))
      const comma = this.takeIf(",")
      if (comma === null) return styles
      this.addItem("Punctuator", [comma])
    }
  }

  /** ast/block.md, BlockLiteral: the units `units`, one `RawText` item, whose value is their written text. */
  private literalOf(units: readonly Unit[]): BlockLiteral {
    this.addItem("RawText", units)
    const place = this.placeOf(units)
    return { type: "BlockLiteral", value: this.textOf(place.range), ...place }
  }

  /**
   * Empty description blocks and Empty strings: where a part may end its
   * statement, the empty forms that come next lie inside the statement
   * when the unit after them, one of `goesOn`, takes it on; the input is
   * then rejected at the first of them. Otherwise the statement ends
   * before them, where an empty description block is a statement and an
   * empty string is rejected.
   */
  private rejectEmptyFormsBefore(goesOn: readonly UnitName[]): void {
    const after = this.afterEmptyForms(this.next, EMPTY_FORM_KINDS.block)
    const name = this.nameAt(after)
    if (after !== this.next && name !== null && goesOn.includes(name)) {
      throw this.unexpected(this.peek())
    }
  }
}
