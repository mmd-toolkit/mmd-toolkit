import type {
  TreeviewAccDescrBlockStatement,
  TreeviewAccDescrStatement,
  TreeviewAccTitleStatement,
  TreeviewAnnotation,
  TreeviewBodyItem,
  TreeviewBranchPrefix,
  TreeviewClassAnnotation,
  TreeviewDescriptionAnnotation,
  TreeviewIconAnnotation,
  TreeviewIdentifier,
  TreeviewIgnoredText,
  TreeviewLiteral,
  TreeviewNode,
  TreeviewTitleStatement,
} from "../../ast/treeview.ts"
import type { CommonFormLexing } from "../../common-form-unit-lexer.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { Unit, UnitName } from "./units.ts"

/** The flat source body and tokens, before the shared atomic-boundary check. */
export interface TreeviewSyntax {
  readonly body: readonly TreeviewBodyItem[]
  readonly tokens: readonly PendingToken[]
}

/** diagrams/treeview.md, Grammar and ast/treeview.md, Gap ownership. */
export class TreeviewGrammar extends UnitGrammar<UnitName, Unit> {
  public constructor(lexing: CommonFormLexing<UnitName>, lexer: SourceLexer) {
    super(lexing.units, lexer, [], lexing.comments)
  }

  /** diagram = header common-statement* node* end-of-text, with owned decorations. */
  public parseDiagram(): TreeviewSyntax {
    this.addItem("Keyword", [this.take("treeView-beta")])
    const body: TreeviewBodyItem[] = []
    let hasNode = false
    while (this.peek() !== null) {
      if (this.peek()?.name === "box-decoration") {
        body.push(this.parseDecoration())
        continue
      }
      const start = this.next
      const prefixUnit = this.takeIf("branch-prefix")
      const prefix = prefixUnit === null ? null : this.prefixOf(prefixUnit)
      const keyword = this.peek()?.name
      if (
        !hasNode &&
        (keyword === "title" ||
          keyword === "accTitle" ||
          keyword === "accDescr")
      )
        body.push(this.parseCommonStatement(start, keyword, prefix))
      else {
        body.push(this.parseNode(start, prefixUnit, prefix))
        hasNode = true
      }
    }
    return { body, tokens: this.tokensInOrder() }
  }

  /** Empty names/annotations remain syntax; there is no treeview semantic validator. */
  protected knownDivergenceAt(): ParseError | null {
    return null
  }

  /** node = indentation? name annotation*; prefixes denote exactly one assigned run. */
  private parseNode(
    start: number,
    prefixUnit: Unit | null,
    prefix: TreeviewBranchPrefix | null,
  ): TreeviewNode {
    const indentation = prefixUnit === null ? this.takeIf("indentation") : null
    const indent = prefixUnit?.prefix?.indent ?? indentation?.text.length ?? 0
    const textBeforeName =
      prefixUnit !== null || indentation !== null ? this.parseDecorations() : []
    const name =
      this.peek()?.name === "quoted-name"
        ? this.closedStringLiteralOf(this.take("quoted-name"))
        : this.identifierOfName(this.take("bare-name"))
    const annotations: TreeviewAnnotation[] = []
    while (this.annotationAhead()) annotations.push(this.parseAnnotation())
    return {
      type: "TreeviewNode",
      indent,
      prefix,
      textBeforeName,
      name,
      annotations,
      ...this.placeFrom(start),
    }
  }

  /** Optional annotation gaps are owned only when an annotation follows them. */
  private annotationAhead(): boolean {
    let at = this.afterUnitsNamed(this.next, ["box-decoration"])
    if (this.nameAt(at) === "branch-prefix") at = this.positionAfter(at)
    return (
      this.nameAt(at) === ":::" ||
      this.nameAt(at) === "icon" ||
      this.nameAt(at) === "##"
    )
  }

  /** annotation = class-annotation | icon-annotation | description-annotation. */
  private parseAnnotation():
    | TreeviewClassAnnotation
    | TreeviewIconAnnotation
    | TreeviewDescriptionAnnotation {
    const start = this.next
    const textBefore = this.parseDecorations()
    const prefixUnit = this.takeIf("branch-prefix")
    const prefix = prefixUnit === null ? null : this.prefixOf(prefixUnit)
    if (this.peek()?.name === ":::") {
      this.addItem("Punctuator", [this.take(":::")])
      const name = this.identifierOf([this.take("class-name")])
      return {
        type: "TreeviewClassAnnotation",
        textBefore,
        prefix,
        name,
        ...this.placeFrom(start),
      }
    }
    if (this.peek()?.name === "icon") {
      this.addItem("Keyword", [this.take("icon")])
      this.addItem("Punctuator", [this.take("(")])
      const reference = this.takeIf("icon-reference")
      const name = reference === null ? null : this.identifierOf([reference])
      this.addItem("Punctuator", [this.take(")")])
      return {
        type: "TreeviewIconAnnotation",
        textBefore,
        prefix,
        name,
        ...this.placeFrom(start),
      }
    }
    this.addItem("Punctuator", [this.take("##")])
    const text = this.takeIf("description-text")
    const value = text === null ? null : this.literalOf(text)
    return {
      type: "TreeviewDescriptionAnnotation",
      textBefore,
      prefix,
      value,
      ...this.placeFrom(start),
    }
  }

  /** Common forms repeat only in the preamble; a prefix belongs to its following statement. */
  private parseCommonStatement(
    start: number,
    keyword: "title" | "accTitle" | "accDescr",
    prefix: TreeviewBranchPrefix | null,
  ):
    | TreeviewTitleStatement
    | TreeviewAccTitleStatement
    | TreeviewAccDescrStatement
    | TreeviewAccDescrBlockStatement {
    this.addItem("Keyword", [this.take(keyword)])
    if (keyword === "accDescr" && this.peek()?.name !== ":") {
      const textBeforeOpen: (TreeviewBranchPrefix | TreeviewIgnoredText)[] = []
      while (
        this.peek()?.name === "branch-prefix" ||
        this.peek()?.name === "box-decoration"
      ) {
        textBeforeOpen.push(
          this.peek()?.name === "branch-prefix"
            ? this.prefixOf(this.take("branch-prefix"))
            : this.parseDecoration(),
        )
      }
      this.addItem("Punctuator", [this.take("{")])
      const text = this.takeIf("block-text")
      const value = text === null ? null : this.literalOf(text)
      this.addItem("Punctuator", [this.take("}")])
      return {
        type: "TreeviewAccDescrBlockStatement",
        prefix,
        textBeforeOpen,
        value,
        ...this.placeFrom(start),
      }
    }
    if (keyword !== "title") this.addItem("Punctuator", [this.take(":")])
    const text = this.takeIf("line-text")
    const value = text === null ? null : this.literalOf(text)
    return {
      type:
        keyword === "title"
          ? "TreeviewTitleStatement"
          : keyword === "accTitle"
            ? "TreeviewAccTitleStatement"
            : "TreeviewAccDescrStatement",
      prefix,
      value,
      ...this.placeFrom(start),
    }
  }

  /** TreeviewIdentifier: whole authored names, including owned trailing whitespace. */
  private identifierOfName(unit: Unit): TreeviewIdentifier {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "TreeviewIdentifier",
      name: this.textOf(place.range),
      ...place,
    }
  }

  /** TreeviewLiteral: complete authored payload, with shared removals only. */
  private literalOf(unit: Unit): TreeviewLiteral {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "TreeviewLiteral",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /** TreeviewBranchPrefix: one authored RawText value, including internal padding. */
  private prefixOf(unit: Unit): TreeviewBranchPrefix {
    if (unit.prefix === undefined)
      throw new Error(
        "mmd-toolkit parser bug: a branch prefix lacks its reading",
      )
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "TreeviewBranchPrefix",
      value: this.textOf(place.range),
      marker: unit.prefix.marker,
      ...place,
    }
  }

  /** TreeviewIgnoredText: only a box decoration outside an open leaf. */
  private parseDecoration(): TreeviewIgnoredText {
    const unit = this.take("box-decoration")
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "TreeviewIgnoredText",
      kind: "box-decoration",
      value: this.textOf(place.range),
      ...place,
    }
  }

  /** Required name gaps and optional annotation gaps retain source order. */
  private parseDecorations(): TreeviewIgnoredText[] {
    const forms: TreeviewIgnoredText[] = []
    while (this.peek()?.name === "box-decoration")
      forms.push(this.parseDecoration())
    return forms
  }
}
