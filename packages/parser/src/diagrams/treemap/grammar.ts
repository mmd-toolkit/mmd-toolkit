import type { Identifier, NumericLiteral } from "../../ast.ts"
import type {
  TreemapAccDescrBlockStatement,
  TreemapAccDescrStatement,
  TreemapAccTitleStatement,
  TreemapBodyItem,
  TreemapClassDefStatement,
  TreemapLeaf,
  TreemapLiteral,
  TreemapSection,
  TreemapTitleStatement,
} from "../../ast/treemap.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** The nested authored body and its tokens, before shared token-boundary checks. */
export interface TreemapSyntax {
  readonly body: readonly TreemapBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** An open section whose children are completed in source order. */
interface OpenSection {
  readonly section: TreemapSection
  readonly children: (TreemapSection | TreemapLeaf)[]
}

/** diagrams/treemap.md, Grammar: recursive descent without additional semantic gates. */
export class TreemapGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = (treemap-beta | treemap) statement* end-of-text. */
  public parseDiagram(): TreemapSyntax {
    const header = this.takeIf("treemap-beta") ?? this.take("treemap")
    this.addItem("Keyword", [header])
    const body: TreemapBodyItem[] = []
    const open: OpenSection[] = []
    let statementsBefore: (
      | TreemapClassDefStatement
      | TreemapTitleStatement
      | TreemapAccTitleStatement
      | TreemapAccDescrStatement
      | TreemapAccDescrBlockStatement
    )[] = []
    let hasNode = false
    while (this.peek() !== null) {
      const statement = this.parseStatement()
      if (
        statement.type !== "TreemapSection" &&
        statement.type !== "TreemapLeaf"
      ) {
        if (hasNode) statementsBefore.push(statement)
        else body.push(statement)
        continue
      }
      const range: TreemapSection["range"] = [
        statementsBefore[0]?.range[0] ?? statement.range[0],
        statement.range[1],
      ]
      const node = {
        ...statement,
        statementsBefore,
        range,
        loc: this.lines.location(range),
      }
      statementsBefore = []
      // Indentation and parents: a leaf closes sections but never opens one.
      while ((open.at(-1)?.section.indent ?? -1) >= node.indent)
        this.finishSection(open, body)
      if (node.type === "TreemapSection")
        open.push({ section: node, children: [] })
      else {
        const parent = open.at(-1)
        if (parent === undefined) body.push(node)
        else parent.children.push(node)
      }
      hasNode = true
    }
    while (open.length > 0) this.finishSection(open, body)
    body.push(...statementsBefore)
    return { body, tokens: this.tokensInOrder() }
  }

  /** ast/treemap.md, Section ranges: finish descendants before their parent. */
  private finishSection(open: OpenSection[], body: TreemapBodyItem[]): void {
    const entry = open.pop()
    if (entry === undefined)
      throw new Error("mmd-toolkit parser bug: no open treemap section")
    const { section, children } = entry
    const range: TreemapSection["range"] = [
      section.range[0],
      children.at(-1)?.range[1] ?? section.range[1],
    ]
    const completed: TreemapSection = {
      ...section,
      children,
      range,
      loc: this.lines.location(range),
    }
    const parent = open.at(-1)
    if (parent === undefined) body.push(completed)
    else parent.children.push(completed)
  }

  /** Empty names and blocks are retained; shared recording checks indivisible cuts. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** statement = row | common-statement; indentation can prefix only a row. */
  private parseStatement(): TreemapBodyItem {
    const keyword = this.peek()?.name
    if (keyword === "title" || keyword === "accTitle" || keyword === "accDescr")
      return this.parseCommonStatement(keyword)
    return this.parseRow()
  }

  /** row = indentation? (section | leaf | class-definition). */
  private parseRow(): TreemapSection | TreemapLeaf | TreemapClassDefStatement {
    const indent = this.takeIf("indentation")?.text.length ?? 0
    if (this.peek()?.name === "classDef")
      return this.parseClassDefinition(indent)
    const start = this.next
    const leaf = this.isLeaf()
    const name = this.closedStringLiteralOf(this.take("string"))
    if (leaf) {
      this.takeIf("indentation")
      const separator = this.takeIf(":") ?? this.take(",")
      this.addItem("Punctuator", [separator])
      this.takeIf("indentation")
      const value = this.parseNumber()
      const classSelector = this.parseClassSelector()
      return {
        type: "TreemapLeaf",
        indent,
        statementsBefore: [],
        name,
        value,
        classSelector,
        ...this.placeFrom(start),
      }
    }
    const classSelector = this.parseClassSelector()
    return {
      type: "TreemapSection",
      indent,
      statementsBefore: [],
      name,
      classSelector,
      children: [],
      ...this.placeFrom(start),
    }
  }

  /** Grammar: prefer the leaf only when its complete required components match. */
  private isLeaf(): boolean {
    if (this.peek()?.name !== "string") return false
    let at = this.positionAfter(this.next)
    if (this.nameAt(at) === "indentation") at = this.positionAfter(at)
    if (this.nameAt(at) !== ":" && this.nameAt(at) !== ",") return false
    at = this.positionAfter(at)
    if (this.nameAt(at) === "indentation") at = this.positionAfter(at)
    return this.nameAt(at) === "number"
  }

  /** section/leaf: a marker and identifier, without intervening indentation. */
  private parseClassSelector(): Identifier | null {
    const marker = this.takeIf(":::")
    if (marker === null) return null
    this.addItem("Punctuator", [marker])
    return this.identifierOf([this.take("id")])
  }

  /** ast.md, NumericLiteral: remove commas and read the decimal prefix as a double. */
  private parseNumber(): NumericLiteral {
    const unit = this.take("number")
    this.addItem("Numeric", [unit])
    const place = this.placeOf([unit])
    return {
      type: "NumericLiteral",
      value: Number.parseFloat(unit.text.split(",").join("")),
      raw: this.lexer.text.slice(...place.range),
      ...place,
    }
  }

  /** class-definition: split composite components, retaining the whole style. */
  private parseClassDefinition(indent: number): TreemapClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    const name = this.identifierOf([this.take("class-name")])
    const text = this.takeIf("style-text")
    const style = text === null ? null : this.literalOf(text)
    const semicolon = this.takeIf(";")
    if (semicolon !== null) this.addItem("Punctuator", [semicolon])
    return {
      type: "TreemapClassDefStatement",
      indent,
      name,
      style,
      ...this.placeFrom(start),
    }
  }

  /** common-statement: no following EOL or uniqueness condition. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ):
    | TreemapTitleStatement
    | TreemapAccTitleStatement
    | TreemapAccDescrStatement
    | TreemapAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take(keyword)])
    const block = keyword === "accDescr" && this.peek()?.name === "{"
    if (keyword !== "title")
      this.addItem("Punctuator", [this.take(block ? "{" : ":")])
    const text = this.takeIf(block ? "block-text" : "line-text")
    const value = text?.significantRange == null ? null : this.literalOf(text)
    if (block) this.addItem("Punctuator", [this.take("}")])
    return {
      type: block
        ? "TreemapAccDescrBlockStatement"
        : keyword === "title"
          ? "TreemapTitleStatement"
          : keyword === "accTitle"
            ? "TreemapAccTitleStatement"
            : "TreemapAccDescrStatement",
      value,
      ...this.placeFrom(start),
    }
  }

  /** TreemapLiteral: source spelling, line/style padding, or trimmed block interior. */
  private literalOf(unit: Unit): TreemapLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return { type: "TreemapLiteral", value: this.textOf(place.range), ...place }
  }
}
