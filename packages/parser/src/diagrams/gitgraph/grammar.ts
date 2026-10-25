import type { Identifier, StringLiteral } from "../../ast.ts"
import type {
  GitgraphBodyItem,
  GitgraphCherryPickOption,
  GitgraphCommitOption,
  GitgraphDiagram,
  GitgraphIgnoredText,
  GitgraphLiteral,
  GitgraphMergeOption,
  GitgraphOrderOption,
} from "../../ast/gitgraph.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"
import { decodeGitgraphString } from "./comparison-values.ts"
import type { GitgraphDecodedValues } from "./history.ts"

/** Written fields and pending tokens, before common token recording. */
export interface GitgraphSyntax {
  readonly direction: GitgraphDiagram["direction"]
  readonly textBeforeHeader: readonly GitgraphIgnoredText[]
  readonly textBeforeDirection: readonly GitgraphIgnoredText[]
  readonly textBeforeColon: readonly GitgraphIgnoredText[]
  readonly body: readonly GitgraphBodyItem[]
  readonly tokens: readonly PendingToken[]
  readonly decodedValues: GitgraphDecodedValues
}

/** The statement grammar gives each operation its own option vocabulary. */
type Operation = "commit" | "merge" | "cherry-pick"
type Option =
  GitgraphCommitOption | GitgraphMergeOption | GitgraphCherryPickOption

/** diagrams/gitgraph.md, Grammar: recursive descent over complete lexical components. */
export class GitgraphGrammar extends UnitGrammar<UnitName, Unit> {
  private readonly decodedValues = new Map<Identifier | StringLiteral, string>()

  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram and header: hidden gaps do not introduce a visible newline. */
  public parseDiagram(): GitgraphSyntax {
    const textBeforeHeader: GitgraphIgnoredText[] = []
    while (this.peek()?.name === "newline" || this.isHidden(this.peek())) {
      if (this.takeIf("newline") === null)
        textBeforeHeader.push(this.parseIgnoredText())
    }
    const header = this.peek()
    if (header?.name !== "gitGraph" && header?.name !== "gitGraph:")
      throw this.unexpected(header)
    this.keyword(header.name)
    let direction: GitgraphDiagram["direction"] = null
    let textBeforeDirection: GitgraphIgnoredText[] = []
    let textBeforeColon: GitgraphIgnoredText[] = []
    const body: GitgraphBodyItem[] = []
    if (header.name === "gitGraph:") this.punctuator(":")
    else {
      const gap = this.parseHiddenForms()
      const next = this.peek()
      if (next?.name === "LR" || next?.name === "TB" || next?.name === "BT") {
        direction = next.name
        textBeforeDirection = gap
        this.keyword(next.name)
        textBeforeColon = this.parseHiddenForms()
        this.punctuator(":")
      } else if (next?.name === ":") {
        textBeforeColon = gap
        this.punctuator(":")
      } else body.push(...gap)
    }
    while (this.peek() !== null) {
      if (this.takeIf("newline") !== null) continue
      body.push(
        this.isHidden(this.peek())
          ? this.parseIgnoredText()
          : this.parseStatement(),
      )
    }
    return {
      direction,
      textBeforeHeader,
      textBeforeDirection,
      textBeforeColon,
      body,
      tokens: this.tokensInOrder(),
      decodedValues: this.decodedValues,
    }
  }

  /** Empty strings and description blocks are real syntax; common recording rejects atomic cuts. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** statement and common-statement: select by the first visible component. */
  private parseStatement(): Exclude<GitgraphBodyItem, GitgraphIgnoredText> {
    const start = this.next
    const unit = this.peek()
    switch (unit?.name) {
      case "commit":
      case "cherry-pick": {
        const operation = unit.name
        this.keyword(operation)
        const { options, textAfter } = this.parseOptions(operation)
        const place = this.placeFrom(start)
        this.parseEol()
        return operation === "commit"
          ? {
              type: "GitgraphCommitStatement",
              options: options as GitgraphCommitOption[],
              textAfter,
              ...place,
            }
          : {
              type: "GitgraphCherryPickStatement",
              options: options as GitgraphCherryPickOption[],
              textAfter,
              ...place,
            }
      }
      case "branch": {
        this.keyword("branch")
        const textBeforeName = this.parseHiddenForms()
        const name = this.parseBranchReference()
        const orderStart = this.next
        const gap = this.parseHiddenForms()
        const order =
          this.peek()?.name === "order"
            ? this.parseOrderOption(orderStart, gap)
            : null
        const textAfter = order === null ? gap : this.parseHiddenForms()
        const place = this.placeFrom(start)
        this.parseEol()
        return {
          type: "GitgraphBranchStatement",
          textBeforeName,
          name,
          order,
          textAfter,
          ...place,
        }
      }
      case "checkout":
      case "switch": {
        const keyword = unit.name
        this.keyword(keyword)
        const textBeforeBranch = this.parseHiddenForms()
        const branch = this.parseBranchReference()
        const textAfter = this.parseHiddenForms()
        const place = this.placeFrom(start)
        this.parseEol()
        return {
          type: "GitgraphCheckoutStatement",
          keyword,
          textBeforeBranch,
          branch,
          textAfter,
          ...place,
        }
      }
      case "merge": {
        this.keyword("merge")
        const textBeforeBranch = this.parseHiddenForms()
        const branch = this.parseBranchReference()
        const { options, textAfter } = this.parseOptions("merge")
        const place = this.placeFrom(start)
        this.parseEol()
        return {
          type: "GitgraphMergeStatement",
          textBeforeBranch,
          branch,
          options: options as GitgraphMergeOption[],
          textAfter,
          ...place,
        }
      }
      case "title":
      case "accTitle":
      case "accDescr":
        return this.parseCommonStatement(unit.name)
      default:
        throw this.unexpected(unit)
    }
  }

  /** commit-option*, merge-option*, cherry-pick-option*: retain every repetition and its preceding forms. */
  private parseOptions(operation: Operation): {
    readonly options: Option[]
    readonly textAfter: GitgraphIgnoredText[]
  } {
    const options: Option[] = []
    for (;;) {
      const start = this.next
      const textBefore = this.parseHiddenForms()
      const name = this.peek()?.name
      if (
        name === "id" ||
        name === "tag" ||
        (name === "msg" && operation === "commit") ||
        (name === "parent" && operation === "cherry-pick") ||
        (name === "type" && operation !== "cherry-pick") ||
        (name === "string" && operation === "commit")
      ) {
        options.push(this.parseOption(start, textBefore))
      } else return { options, textAfter: textBefore }
    }
  }

  /** Each option has an atomic word/colon pair and a complete value, separated only after the colon. */
  private parseOption(
    start: number,
    textBefore: GitgraphIgnoredText[],
  ): Option {
    const unit = this.peek()!
    if (unit.name !== "string") {
      this.keyword(unit.name)
      this.punctuator(":")
    }
    const textBeforeValue =
      unit.name === "string" ? [] : this.parseHiddenForms()
    if (unit.name === "type") {
      const value = this.peek()
      if (
        value?.name !== "NORMAL" &&
        value?.name !== "REVERSE" &&
        value?.name !== "HIGHLIGHT"
      )
        throw this.unexpected(value)
      this.keyword(value.name)
      return {
        type: "GitgraphTypeOption",
        textBefore,
        textBeforeValue,
        value: value.name,
        ...this.placeFrom(start),
      }
    }
    const value = this.parseString()
    const place = this.placeFrom(start)
    if (unit.name === "msg" || unit.name === "string")
      return {
        type: "GitgraphMessageOption",
        keyword: unit.name === "msg" ? "msg" : null,
        textBefore,
        textBeforeValue,
        value,
        ...place,
      }
    return {
      type:
        unit.name === "id"
          ? "GitgraphIdOption"
          : unit.name === "parent"
            ? "GitgraphParentOption"
            : "GitgraphTagOption",
      textBefore,
      textBeforeValue,
      value,
      ...place,
    }
  }

  /** order-option: the hidden forms before the word belong to the option's range. */
  private parseOrderOption(
    start: number,
    textBefore: GitgraphIgnoredText[],
  ): GitgraphOrderOption {
    this.keyword("order")
    this.punctuator(":")
    const textBeforeValue = this.parseHiddenForms()
    const value = this.numericLiteralOf(this.take("unsigned-integer"))
    return {
      type: "GitgraphOrderOption",
      textBefore,
      textBeforeValue,
      value,
      ...this.placeFrom(start),
    }
  }

  /** branch-reference = bare-reference | string; quoted empty names remain strings. */
  private parseBranchReference(): Identifier | StringLiteral {
    if (this.peek()?.name === "string") return this.parseString()
    const unit = this.take("bare-reference")
    const node = this.identifierOf([unit])
    this.decodedValues.set(node, unit.text)
    return node
  }

  /** Quoted comparison values use the common lexical text, decoded once, while the leaf stays written. */
  private parseString(): StringLiteral {
    const unit = this.take("string")
    const node = this.closedStringLiteralOf(unit)
    this.decodedValues.set(node, decodeGitgraphString(unit.text))
    return node
  }

  /** Common statements keep line padding, trim block ends, and retain hidden suffixes before EOL. */
  private parseCommonStatement(
    keyword: "title" | "accTitle" | "accDescr",
  ): Exclude<GitgraphBodyItem, GitgraphIgnoredText> {
    const start = this.next
    this.keyword(keyword)
    const block = keyword === "accDescr" && this.peek()?.name === "{"
    if (keyword !== "title") this.punctuator(block ? "{" : ":")
    const text = this.takeIf(block ? "block-text" : "line-text")
    const value = text?.significantRange == null ? null : this.literalOf(text)
    if (block) this.punctuator("}")
    const textAfter = this.parseHiddenForms()
    const place = this.placeFrom(start)
    this.parseEol()
    return {
      type: block
        ? "GitgraphAccDescrBlockStatement"
        : keyword === "title"
          ? "GitgraphTitleStatement"
          : keyword === "accTitle"
            ? "GitgraphAccTitleStatement"
            : "GitgraphAccDescrStatement",
      value,
      textAfter,
      ...place,
    }
  }

  /** eol = newline+ | EOF; a hidden form's consumed LF supplies no newline unit. */
  private parseEol(): void {
    if (this.peek() !== null) this.take("newline")
    this.takeAll("newline")
  }

  /** GitgraphLiteral retains authored common text, with the range chosen by its lexical form. */
  private literalOf(unit: Unit): GitgraphLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "GitgraphLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /** Whole hidden forms occupy only the named AST gaps and body positions. */
  private isHidden(unit: Unit | null): boolean {
    return unit?.name === "yaml-block" || unit?.name === "directive"
  }

  /** Hidden forms retain source order and separate ownership, including adjacent forms. */
  private parseHiddenForms(): GitgraphIgnoredText[] {
    const forms: GitgraphIgnoredText[] = []
    while (this.isHidden(this.peek())) forms.push(this.parseIgnoredText())
    return forms
  }

  /** GitgraphIgnoredText: opener through closer, excluding the consumed following LF. */
  private parseIgnoredText(): GitgraphIgnoredText {
    const unit = this.peek()
    if (unit?.name !== "yaml-block" && unit?.name !== "directive")
      throw this.unexpected(unit)
    this.advance()
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "GitgraphIgnoredText",
      kind: unit.name,
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }

  /** One authored word is an atomic Keyword item. */
  private keyword(name: UnitName): void {
    this.addItem("Keyword", [this.take(name)])
  }

  /** Each authored colon or brace has its own Punctuator item. */
  private punctuator(name: UnitName): void {
    this.addItem("Punctuator", [this.take(name)])
  }
}
