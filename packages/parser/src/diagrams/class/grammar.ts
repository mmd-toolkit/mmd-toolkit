import type { Identifier, StringLiteral } from "../../ast.ts"
import type {
  ClassAccDescrBlockStatement,
  ClassAnnotation,
  ClassAnnotationStatement,
  ClassArrow,
  ClassArrowMarker,
  ClassCallbackStatement,
  ClassClassDefStatement,
  ClassClassifier,
  ClassCssClassStatement,
  ClassDeclaration,
  ClassDirection,
  ClassDirectionStatement,
  ClassIdentifier,
  ClassIgnoredText,
  ClassLinkStatement,
  ClassLinkTarget,
  ClassLiteral,
  ClassMember,
  ClassName,
  ClassNamespaceStatement,
  ClassNoteStatement,
  ClassRelationStatement,
  ClassStatement,
  ClassStyleStatement,
  ClassVisibility,
} from "../../ast/class.ts"
import type { ParseError } from "../../errors.ts"
import type { PendingToken, SourceLexer } from "../../source-lexer.ts"
import type { NodePlace } from "../../unit-grammar.ts"
import { EMPTY_FORM_KINDS } from "../../empty-forms.ts"
import { UnitGrammar } from "../../unit-grammar.ts"
import type { ClassLexing, MemberLine, Unit, UnitName } from "./units.ts"
import { isClosedBackquotedName } from "./units.ts"

/** What the grammar makes of the units of a class diagram. */
export interface ClassSyntax {
  /** The statements of the diagram, in source order. */
  readonly body: readonly ClassStatement[]
  /** The tokens of the diagram, in source order. */
  readonly tokens: readonly PendingToken[]
  /**
   * Rejections outside the grammar: the written name of each
   * class name, in converted form, which the rejections outside the
   * grammar read.
   */
  readonly writtenNames: ReadonlyMap<ClassName, string>
}

/** Class names: the units of a name part. */
const NAME_PARTS: readonly UnitName[] = ["word", "-", "letter"]

/** Relations: the units of a relation end, and the marker of each (ast/class.md, ClassArrow). */
const RELATION_ENDS: Readonly<Partial<Record<UnitName, ClassArrowMarker>>> = {
  "<|": "triangle",
  "|>": "triangle",
  "*": "filled-diamond",
  o: "hollow-diamond",
  "<": "arrow",
  ">": "arrow",
  "()": "lollipop",
}

/** Relations: the units of a line. */
const LINES: Readonly<Partial<Record<UnitName, ClassArrow["line"]>>> = {
  "--": "solid",
  "..": "dotted",
}

/** Other statements: the units of a style. */
const STYLE_UNITS: readonly UnitName[] = [
  "word",
  ":",
  "#",
  "%",
  "style",
  "label",
]

/** Members and annotations: the visibility of each visibility mark. */
const VISIBILITIES: Readonly<Record<string, ClassVisibility>> = {
  "+": "public",
  "-": "private",
  "#": "protected",
  "~": "package",
}

/** Members and annotations: the classifier of each classifier mark. */
const CLASSIFIERS: Readonly<Record<string, ClassClassifier>> = {
  $: "static",
  "*": "abstract",
}

/** Other statements: the link targets, as written. */
const LINK_TARGETS: readonly ClassLinkTarget[] = [
  "_self",
  "_blank",
  "_parent",
  "_top",
]

/** The direction line: its values. */
const DIRECTIONS: readonly ClassDirection[] = ["TB", "BT", "RL", "LR"]

/**
 * diagrams/class.md, Grammar: the recursive-descent parser over the units of
 * the class lexer. Each method reads one rule of the grammar, which its
 * comment names, and makes the node that the specification gives for the
 * rule, with the tokens of `docs/tokens/class.md`, Tokens.
 */
export class ClassGrammar extends UnitGrammar<UnitName, Unit> {
  private readonly lexing: ClassLexing

  private readonly writtenNames = new Map<ClassName, string>()

  public constructor(lexing: ClassLexing, lexer: SourceLexer) {
    super(lexing.units, lexer, EMPTY_FORM_KINDS.class, lexing.comments)
    this.lexing = lexing
  }

  /**
   * Diagram and statements: `diagram = "header" empty-description-block*
   * newline statement ( statement-end statement )* empty-description-block*
   * newline? end-of-text`. The empty description blocks after the header
   * are the first statements of the body.
   */
  public parseDiagram(): ClassSyntax {
    this.addItem("Keyword", [this.take("header")])
    const body: ClassStatement[] = []
    const headerEnd = this.statementEndAt(["newline"], false)
    while (this.next < headerEnd) body.push(this.parseDescriptionBlock())
    this.take("newline")
    this.parseStatement(body)
    for (;;) {
      this.parseStatementEnd(body)
      if (this.peek() === null) break
      this.take("newline")
      if (this.peek() === null) break
      this.parseStatement(body)
    }
    return {
      body,
      tokens: this.tokensInOrder(),
      writtenNames: this.writtenNames,
    }
  }

  /**
   * `docs/tokens/class.md`, Tokens: whether `unit` follows `previous` with nothing of
   * the diagram text between them: the next character of the diagram text
   * after `previous` is the first of `unit`. Directives and the `;` that
   * the line rule ignores may lie between them, which the diagram text
   * leaves out (common.md, Reading a source).
   */
  private followsWithNothingBetween(previous: Unit, unit: Unit): boolean {
    let offset = previous.end
    for (;;) {
      const element = this.lexer.readAt(offset)
      if (element.kind === "character") return element.start === unit.start
      offset = element.end
    }
  }

  /**
   * `docs/tokens/class.md`, Tokens: the runs of `units` whose units follow one
   * another with nothing of the diagram text between them (see
   * {@link ClassGrammar.followsWithNothingBetween}), in source order:
   * whitespace, which belongs to no unit (diagrams/class.md, Units and
   * contexts), breaks a run.
   */
  private runsWithNothingBetween(units: readonly Unit[]): Unit[][] {
    const runs: Unit[][] = []
    for (const unit of units) {
      const run = runs.at(-1)
      const previous = run?.at(-1)
      if (
        run !== undefined &&
        previous !== undefined &&
        this.followsWithNothingBetween(previous, unit)
      ) {
        run.push(unit)
      } else {
        runs.push([unit])
      }
    }
    return runs
  }

  /**
   * ast/class.md, ClassIdentifier: the ClassIdentifier whose units are the
   * name parts and `.` units `units`. Its tokens are `RawText` tokens, one
   * for each run of units with nothing between them; its name is the
   * written text of each unit, joined in order, so the whitespace between
   * two runs, which mermaid.js does not read, is not part of it.
   */
  private classIdentifierOf(units: readonly Unit[]): ClassIdentifier {
    for (const run of this.runsWithNothingBetween(units)) {
      this.addItem("RawText", run)
    }
    const place = this.placeOf(units)
    const name = units.map((unit) => this.textOfUnit(unit)).join("")
    return { type: "ClassIdentifier", name, ...place }
  }

  /**
   * Diagram and statements: `statement`, added to `body`. An empty
   * description block is followed by another statement, and both are
   * added.
   */
  private parseStatement(body: ClassStatement[]): void {
    const unit = this.peek()
    switch (unit?.name) {
      case "class":
        body.push(this.parseClassDeclaration())
        return
      case "<<":
        body.push(this.parseAnnotationStatement())
        return
      case "namespace":
        body.push(this.parseNamespaceStatement())
        return
      case "note":
        body.push(this.parseNoteStatement())
        return
      case "callback":
      case "link":
      case "click":
        body.push(this.parseClickStatement())
        return
      case "style":
        body.push(this.parseStyleStatement())
        return
      case "classDef":
        body.push(this.parseClassDefStatement())
        return
      case "cssClass":
        body.push(this.parseCssClassStatement())
        return
      case "direction-text":
      case "direction":
        body.push(this.parseDirectionStatement())
        return
      case "accTitle":
      case "accDescr":
        this.parseAccessibilityStatement(body)
        return
      default:
        if (this.startsClassName()) {
          body.push(this.parseNameStatement())
          return
        }
        throw this.unexpected(unit ?? null)
    }
  }

  /**
   * Empty description blocks before a separator: `statement-end =
   * empty-description-block* newline`, and `empty-description-block*` before
   * the end of the text: the blocks, added to `body`, each a statement of
   * its own. The `newline` is left to the caller.
   */
  private parseStatementEnd(body: ClassStatement[]): void {
    const end = this.statementEndAt(["newline"], true)
    while (this.next < end) body.push(this.parseDescriptionBlock())
  }

  /** Whether a class name starts at the next unit: a name part or a backquoted name. */
  private startsClassName(): boolean {
    const name = this.nameAt(this.next)
    return name !== null && (NAME_PARTS.includes(name) || name === "backquoted")
  }

  /**
   * Class names: `class-name = ( name-part "."? )* ( name-part |
   * "backquoted" ) generic?`, a ClassName, whose written name is kept.
   */
  private parseClassName(): ClassName {
    const start = this.next
    const { prefix, name, nameText } = this.parseNameParts()
    let generic: ClassLiteral | null = null
    let writtenName = nameText
    const opening = this.takeIf("~")
    if (opening !== null) {
      this.addItem("Punctuator", [opening])
      const text = this.takeIf("generic-text")
      if (text !== null) {
        writtenName = `${nameText}~${text.text}~`
        generic = this.literalOf([text])
      }
      this.addItem("Punctuator", [this.take("~")])
    }
    const className: ClassName = {
      type: "ClassName",
      prefix,
      name,
      generic,
      ...this.placeFrom(start),
    }
    this.writtenNames.set(className, writtenName)
    return className
  }

  /**
   * Class names: the name parts and `.` of a class name or a namespace
   * name, and its backquoted name: its `prefix` and `name`, and its name text
   * (Rejections outside the grammar).
   */
  private parseNameParts(): {
    readonly prefix: ClassIdentifier | null
    readonly name: ClassIdentifier | StringLiteral
    readonly nameText: string
  } {
    const parts: Unit[] = []
    for (
      let name = this.nameAt(this.next);
      name !== null && NAME_PARTS.includes(name);
      name = this.nameAt(this.next)
    ) {
      parts.push(this.take(name))
      const dot = this.takeIf(".")
      if (dot !== null) parts.push(dot)
    }
    const nameText = parts.map((part) => part.text).join("")
    const backquoted = this.takeIf("backquoted")
    if (backquoted !== null) {
      return {
        prefix: parts.length === 0 ? null : this.classIdentifierOf(parts),
        name: this.stringLiteralOf(backquoted),
        nameText: nameText + this.contentOf(backquoted),
      }
    }
    const last = parts.at(-1)
    if (last === undefined || last.name === ".") {
      throw this.unexpected(this.peek())
    }
    return { prefix: null, name: this.classIdentifierOf(parts), nameText }
  }

  /**
   * Rejections outside the grammar: the text of the `backquoted`
   * unit `unit` between its backquotes, in converted form. A backquoted
   * name that is not closed runs to the end of the text and ends with the
   * line feed that the lexer reads after the last character (common.md,
   * End of text).
   */
  private contentOf(unit: Unit): string {
    const characters = [...unit.text]
    if (isClosedBackquotedName(unit)) return characters.slice(1, -1).join("")
    return `${characters.slice(1).join("")}\n`
  }

  /**
   * ast.md, Shared leaf nodes > StringLiteral: the StringLiteral of the
   * `string`, `empty-string`, `backquoted`, or `empty-backquoted` unit
   * `unit`, one `String` item. Its value is its written text without
   * its quotes, and without the opening one alone when it is not closed.
   */
  private stringLiteralOf(unit: Unit): StringLiteral {
    this.addItem("String", [unit])
    const place = this.placeOf([unit])
    const [start, end] = place.range
    // Strings: the lexer rejects a string that the text ends in; only a
    // backquoted name can be one.
    const closed = unit.name !== "backquoted" || isClosedBackquotedName(unit)
    return {
      type: "StringLiteral",
      value: this.textOf([start + 1, closed ? end - 1 : end]),
      raw: this.lexer.text.slice(start, end),
      closed,
      ...place,
    }
  }

  /** A `string` unit that is not empty, as a StringLiteral. */
  private parseString(): StringLiteral {
    return this.stringLiteralOf(this.take("string"))
  }

  /** `string-or-empty`, when one comes next, as a StringLiteral; null otherwise. */
  private parseStringOrEmpty(): StringLiteral | null {
    const unit = this.takeIf("string") ?? this.takeIf("empty-string")
    return unit === null ? null : this.stringLiteralOf(unit)
  }

  /** ClassLiteral: the literal whose units are `units`, one `RawText` item. Its value is its written text. */
  private literalOf(units: readonly Unit[]): ClassLiteral {
    this.addItem("RawText", units)
    const place = this.placeOf(units)
    return { type: "ClassLiteral", value: this.textOf(place.range), ...place }
  }

  /** ClassIgnoredText: the text of the unit `unit`, one `RawText` item, which mermaid.js does not read. */
  private ignoredTextOf(unit: Unit): ClassIgnoredText {
    this.addItem("RawText", [unit])
    const place = this.placeOf([unit])
    return {
      type: "ClassIgnoredText",
      value: this.unreadTextOf(place.range),
      ...place,
    }
  }

  /** Class names: a name part, one `Identifier` item. */
  private parseNamePart(): Identifier {
    const name = this.nameAt(this.next)
    if (name === null || !NAME_PARTS.includes(name)) {
      throw this.unexpected(this.peek())
    }
    return this.identifierOf([this.take(name)])
  }

  /**
   * Class statements: `class-statement = "class" class-name class-label?
   * class-tail?`, with `class-label = "[" string "]"` and `class-tail =
   * member-body | ":::" name-part ( "{" member-line+ "}" )? | "<<"
   * name-part ">>" member-body?`.
   */
  private parseClassDeclaration(): ClassDeclaration {
    const start = this.next
    this.addItem("Keyword", [this.take("class")])
    const name = this.parseClassName()
    const label = this.parseClassLabel()
    let cssClass: Identifier | null = null
    let annotation: ClassAnnotation | null = null
    let members: ClassMember[] | null = null
    const tripleColon = this.takeIf(":::")
    if (tripleColon !== null) {
      this.addItem("Punctuator", [tripleColon])
      cssClass = this.parseNamePart()
      if (this.nameAt(this.next) === "{") members = this.parseMemberBody(true)
    } else if (this.nameAt(this.next) === "<<") {
      annotation = this.parseStatementAnnotation()
      if (this.nameAt(this.next) === "{") members = this.parseMemberBody(false)
    } else if (this.nameAt(this.next) === "{") {
      members = this.parseMemberBody(false)
    }
    return {
      type: "ClassDeclaration",
      name,
      label,
      cssClass,
      annotation,
      members,
      ...this.placeFrom(start),
    }
  }

  /** Class statements: `class-label = "[" string "]"`, when one comes next; null otherwise. */
  private parseClassLabel(): StringLiteral | null {
    const opening = this.takeIf("[")
    if (opening === null) return null
    this.addItem("Punctuator", [opening])
    const label = this.parseString()
    this.addItem("Punctuator", [this.take("]")])
    return label
  }

  /** Class statements and annotation statements: `"<<" name-part ">>"`, a ClassAnnotation whose name is an Identifier. */
  private parseStatementAnnotation(): ClassAnnotation {
    const start = this.next
    this.addItem("Punctuator", [this.take("<<")])
    const name = this.parseNamePart()
    this.addItem("Punctuator", [this.take(">>")])
    return { type: "ClassAnnotation", name, ...this.placeFrom(start) }
  }

  /**
   * Class statements: `member-body = "{" member-line* "}"`, or, after
   * `:::`, `"{" member-line+ "}"`: the members, in source order. A blank
   * member line makes no node.
   */
  private parseMemberBody(needsLine: boolean): ClassMember[] {
    this.addItem("Punctuator", [this.take("{")])
    const members: ClassMember[] = []
    let lines = 0
    for (
      let line = this.peek()?.memberLine ?? null;
      line !== null;
      line = this.peek()?.memberLine ?? null
    ) {
      lines += 1
      const member = this.memberOf(this.takeMemberLine(line))
      if (member !== null) members.push(member)
    }
    if (needsLine && lines === 0) throw this.unexpected(this.peek())
    this.addItem("Punctuator", [this.take("}")])
    return members
  }

  /** Member lines: reads the units of the member line `line`, which come one after another. */
  private takeMemberLine(line: MemberLine): Unit[] {
    const units: Unit[] = []
    for (
      let unit = this.peek();
      unit?.memberLine === line;
      unit = this.peek()
    ) {
      units.push(this.take(unit.name))
    }
    return units
  }

  /**
   * Members and annotations: the member of the units `units` of one member
   * line: a ClassAnnotation, a ClassMethod, or a ClassAttribute; null for a
   * blank member line.
   */
  private memberOf(units: readonly Unit[]): ClassMember | null {
    const line = units.at(0)?.memberLine
    if (line === undefined || line === null) {
      throw new Error("mmd-toolkit parser bug: a member line has no units")
    }
    const { kind } = line
    const place = (): NodePlace => this.placeOf(units)
    switch (kind) {
      case "blank":
        return null
      case "annotation": {
        let name: ClassLiteral | null = null
        for (const unit of units) {
          if (unit.name === "annotation-name") {
            name = this.literalOf([unit])
          } else {
            this.addItem("Punctuator", [unit])
          }
        }
        return { type: "ClassAnnotation", name, ...place() }
      }
      case "method":
        return this.methodOf(units, place())
      case "attribute":
        return this.attributeOf(units, place())
      default:
        throw new Error(
          `mmd-toolkit parser bug: unknown member line ${JSON.stringify(kind satisfies never)}`,
        )
    }
  }

  /** Members and annotations: `method-line`, a ClassMethod. */
  private methodOf(units: readonly Unit[], place: NodePlace): ClassMember {
    let visibility: ClassVisibility = "none"
    let classifier: ClassClassifier = "none"
    let name: ClassLiteral | null = null
    let parameters: ClassLiteral | null = null
    let returnType: ClassLiteral | null = null
    let textBefore: ClassIgnoredText | null = null
    let textAfter: ClassIgnoredText | null = null
    let afterParentheses = false
    for (const unit of units) {
      switch (unit.name) {
        case "visibility":
          this.addItem("Punctuator", [unit])
          visibility = VISIBILITIES[unit.text]
          break
        case "classifier":
          this.addItem("Punctuator", [unit])
          classifier = CLASSIFIERS[unit.text]
          break
        case "member-name":
          name = this.literalOf([unit])
          break
        case "parameters":
          parameters = this.literalOf([unit])
          break
        case "return-type":
          returnType = this.literalOf([unit])
          break
        case "(":
          this.addItem("Punctuator", [unit])
          break
        case ")":
          this.addItem("Punctuator", [unit])
          afterParentheses = true
          break
        case "ignored-text":
          if (afterParentheses) textAfter = this.ignoredTextOf(unit)
          else textBefore = this.ignoredTextOf(unit)
          break
        default:
          throw new Error(
            `mmd-toolkit parser bug: the unit ${unit.name} in a method line`,
          )
      }
    }
    return {
      type: "ClassMethod",
      visibility,
      name,
      parameters,
      returnType,
      classifier,
      textBefore,
      textAfter,
      ...place,
    }
  }

  /** Members and annotations: `attribute-line`, a ClassAttribute. */
  private attributeOf(units: readonly Unit[], place: NodePlace): ClassMember {
    let visibility: ClassVisibility = "none"
    let classifier: ClassClassifier = "none"
    let name: ClassLiteral | null = null
    for (const unit of units) {
      if (unit.name === "visibility") {
        this.addItem("Punctuator", [unit])
        visibility = VISIBILITIES[unit.text]
      } else if (unit.name === "classifier") {
        this.addItem("Punctuator", [unit])
        classifier = CLASSIFIERS[unit.text]
      } else {
        name = this.literalOf([unit])
      }
    }
    return {
      type: "ClassAttribute",
      visibility,
      name,
      classifier,
      ...place,
    }
  }

  /**
   * Diagram and statements: a statement that starts with a class name:
   * `relation-statement label?`, `member-statement = class-name label?`
   * with a label, or a class name alone.
   */
  private parseNameStatement(): ClassStatement {
    const start = this.next
    const from = this.parseClassName()
    const next = this.nameAt(this.next)
    if (
      next === "empty-string" &&
      !this.startsRelationAt(this.positionAfter(this.next))
    ) {
      // Known divergences, tokenless-empty-forms: an empty string is a
      // cardinality only where a relation follows it; elsewhere after a
      // class name, it lies where the grammar takes no string.
      throw this.unexpected(this.peek())
    }
    if (
      next !== null &&
      (next === "string" ||
        next === "empty-string" ||
        next in RELATION_ENDS ||
        next in LINES)
    ) {
      return this.parseRelation(start, from)
    }
    const label = this.takeIf("label")
    if (label === null) {
      return {
        type: "ClassNameStatement",
        name: from,
        ...this.placeFrom(start),
      }
    }
    return {
      type: "ClassMemberStatement",
      class: from,
      member: this.labelMemberOf(label),
      ...this.placeFrom(start),
    }
  }

  /** Members and annotations: the member line of the label `label` of a member statement, its `:` one `Punctuator` item. */
  private labelMemberOf(label: Unit): ClassMember | null {
    const parts = this.labelPartsOf(label)
    this.addItem("Punctuator", [parts.colon])
    const units = this.lexing.memberLineOfLabel(label)
    return this.memberOf(units)
  }

  /** The parts of the `label` unit `label`. */
  private labelPartsOf(label: Unit): NonNullable<Unit["label"]> {
    if (label.label === null) {
      throw new Error(
        `mmd-toolkit parser bug: the unit at ${label.start} is no label`,
      )
    }
    return label.label
  }

  /** Relations: whether the unit at the position `position` starts a `relation`, a relation end or a line. */
  private startsRelationAt(position: number): boolean {
    const name = this.nameAt(position)
    return name !== null && (name in RELATION_ENDS || name in LINES)
  }

  /**
   * Relations: `relation-statement = class-name string-or-empty? relation
   * string-or-empty? class-name`, and its `label?`.
   */
  private parseRelation(
    start: number,
    from: ClassName,
  ): ClassRelationStatement {
    const fromCardinality = this.parseStringOrEmpty()
    const arrow = this.parseArrow()
    const toCardinality = this.parseStringOrEmpty()
    const to = this.parseClassName()
    let label: ClassLiteral | null = null
    const labelUnit = this.takeIf("label")
    if (labelUnit !== null) {
      const parts = this.labelPartsOf(labelUnit)
      this.addItem("Punctuator", [parts.colon])
      if (parts.text.significantRange !== null) {
        label = this.literalOf([parts.text])
      }
    }
    return {
      type: "ClassRelationStatement",
      from,
      fromCardinality,
      arrow,
      toCardinality,
      to,
      label,
      ...this.placeFrom(start),
    }
  }

  /**
   * Relations: `relation = relation-end? line relation-end?`, a ClassArrow.
   * Each relation end and the line are one `Punctuator` item each.
   */
  private parseArrow(): ClassArrow {
    const start = this.next
    const units: Unit[] = []
    const markerAt = (): ClassArrowMarker => {
      const name = this.nameAt(this.next)
      const marker = name === null ? undefined : RELATION_ENDS[name]
      if (marker === undefined || name === null) return "none"
      const unit = this.take(name)
      units.push(unit)
      this.addItem("Punctuator", [unit])
      return marker
    }
    const startMarker = markerAt()
    const lineName = this.nameAt(this.next)
    const line = lineName === null ? undefined : LINES[lineName]
    if (line === undefined || lineName === null)
      throw this.unexpected(this.peek())
    const lineUnit = this.take(lineName)
    units.push(lineUnit)
    this.addItem("Punctuator", [lineUnit])
    const endMarker = markerAt()
    return {
      type: "ClassArrow",
      value: units.map((unit) => this.textOfUnit(unit)).join(""),
      startMarker,
      line,
      endMarker,
      ...this.placeFrom(start),
    }
  }

  /** Members and annotations: `annotation-statement = "<<" name-part ">>" class-name`. */
  private parseAnnotationStatement(): ClassAnnotationStatement {
    const start = this.next
    const annotation = this.parseStatementAnnotation()
    const name = this.parseClassName()
    return {
      type: "ClassAnnotationStatement",
      annotation,
      class: name,
      ...this.placeFrom(start),
    }
  }

  /**
   * Namespaces: `namespace-statement = "namespace" namespace-name
   * class-label? "{" newline? namespace-item ( newline namespace-item )*
   * newline? "}"`, with `namespace-name = ( name-part "."? )* ( name-part |
   * "backquoted" )`.
   */
  private parseNamespaceStatement(): ClassNamespaceStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("namespace")])
    const { prefix, name } = this.parseNameParts()
    const label = this.parseClassLabel()
    this.addItem("Punctuator", [this.take("{")])
    this.takeIf("newline")
    const body: ClassNamespaceStatement["body"][number][] = [
      this.parseNamespaceItem(),
    ]
    while (this.takeIf("newline") !== null) {
      if (this.nameAt(this.next) === "}") break
      body.push(this.parseNamespaceItem())
    }
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "ClassNamespaceStatement",
      prefix,
      name,
      label,
      body,
      ...this.placeFrom(start),
    }
  }

  /** Namespaces: `namespace-item = class-statement | note-statement | namespace-statement`. */
  private parseNamespaceItem(): ClassNamespaceStatement["body"][number] {
    switch (this.nameAt(this.next)) {
      case "class":
        return this.parseClassDeclaration()
      case "note":
        return this.parseNoteStatement()
      case "namespace":
        return this.parseNamespaceStatement()
      default:
        throw this.unexpected(this.peek())
    }
  }

  /** Other statements: `note-statement = "note" "for" class-name string | "note" string`. */
  private parseNoteStatement(): ClassNoteStatement {
    const start = this.next
    let name: ClassName | null = null
    this.addItem("Keyword", [this.take("note")])
    const noteFor = this.takeIf("for")
    if (noteFor !== null) {
      this.addItem("Keyword", [noteFor])
      name = this.parseClassName()
    }
    const text = this.parseString()
    return {
      type: "ClassNoteStatement",
      class: name,
      text,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `click-statement = "callback" class-name string
   * string-or-empty? | "link" class-name string string-or-empty?
   * "link-target"? | "click" class-name "call" callback-name "("
   * callback-arguments? ")" string-or-empty? | "click" class-name "href"
   * string string-or-empty? "link-target"?`.
   */
  private parseClickStatement(): ClassCallbackStatement | ClassLinkStatement {
    const start = this.next
    const keyword = this.peek()
    if (keyword === null) throw this.unexpected(null)
    this.addItem("Keyword", [this.take(keyword.name)])
    const name = this.parseClassName()
    if (keyword.name === "callback") {
      const callback = this.parseString()
      const tooltip = this.parseStringOrEmpty()
      return {
        type: "ClassCallbackStatement",
        class: name,
        callback,
        arguments: null,
        tooltip,
        ...this.placeFrom(start),
      }
    }
    if (keyword.name === "click") {
      const call = this.takeIf("call")
      if (call !== null) {
        this.addItem("Keyword", [call])
        const callback = this.literalOf([this.take("callback-name")])
        this.addItem("Punctuator", [this.take("(")])
        const argumentsUnit = this.takeIf("callback-arguments")
        const callbackArguments =
          argumentsUnit === null || argumentsUnit.significantRange === null
            ? null
            : this.literalOf([argumentsUnit])
        this.addItem("Punctuator", [this.take(")")])
        const tooltip = this.parseStringOrEmpty()
        return {
          type: "ClassCallbackStatement",
          class: name,
          callback,
          arguments: callbackArguments,
          tooltip,
          ...this.placeFrom(start),
        }
      }
      this.addItem("Keyword", [this.take("href")])
    }
    const url = this.parseString()
    const tooltip = this.parseStringOrEmpty()
    let target: ClassLinkTarget | null = null
    const targetUnit = this.takeIf("link-target")
    if (targetUnit !== null) {
      this.addItem("Keyword", [targetUnit])
      target = linkTargetOf(targetUnit.text)
    }
    return {
      type: "ClassLinkStatement",
      class: name,
      url,
      tooltip,
      target,
      ...this.placeFrom(start),
    }
  }

  /** Other statements: `style-statement = "style" word styles`. */
  private parseStyleStatement(): ClassStyleStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("style")])
    const id = this.identifierOf([this.take("word")])
    const styles = this.parseStyles()
    return { type: "ClassStyleStatement", id, styles, ...this.placeFrom(start) }
  }

  /** Other statements: `class-def-statement = "classDef" word ( "," word )* styles`. */
  private parseClassDefStatement(): ClassClassDefStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("classDef")])
    const cssClasses = [this.identifierOf([this.take("word")])]
    while (this.nameAt(this.next) === ",") {
      this.addItem("Punctuator", [this.take(",")])
      cssClasses.push(this.identifierOf([this.take("word")]))
    }
    const styles = this.parseStyles()
    return {
      type: "ClassClassDefStatement",
      cssClasses,
      styles,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `styles = style ( "," style )*`, with `style = ( word
   * | ":" | "#" | "%" | "style" | label )+`.
   */
  private parseStyles(): ClassLiteral[] {
    const styles = [this.parseStyle()]
    while (this.nameAt(this.next) === ",") {
      this.addItem("Punctuator", [this.take(",")])
      styles.push(this.parseStyle())
    }
    return styles
  }

  /**
   * Other statements: one `style`, whose tokens are the runs of its units
   * with nothing between them, each one `RawText` item: mermaid.js drops
   * the whitespace between two units of a style (`docs/tokens/class.md`, Tokens). Its
   * value is the written texts of its units joined in order (ast/class.md,
   * ClassLiteral): a label keeps the whitespace before the `:` of the next
   * label, also where a directive lies between them, and only the
   * whitespace at the end of the style, after its range, is left out.
   */
  private parseStyle(): ClassLiteral {
    const units = this.takeWhile(STYLE_UNITS)
    if (units.length === 0) throw this.unexpected(this.peek())
    for (const run of this.runsWithNothingBetween(units)) {
      this.addItem("RawText", run)
    }
    const place = this.placeOf(units)
    const end = place.range[1]
    const value = units
      .map((unit) => this.textOf([unit.start, Math.min(unit.end, end)]))
      .join("")
    return { type: "ClassLiteral", value, ...place }
  }

  /** Other statements: `css-class-statement = "cssClass" string word`. */
  private parseCssClassStatement(): ClassCssClassStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("cssClass")])
    const idList = this.parseString()
    const cssClass = this.identifierOf([this.take("word")])
    return {
      type: "ClassCssClassStatement",
      idList,
      cssClass,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `direction-statement = "direction-text"? "direction"
   * "direction-value" "direction-text"?`. A `direction-text` unit is a
   * ClassIgnoredText.
   */
  private parseDirectionStatement(): ClassDirectionStatement {
    const start = this.next
    const before = this.takeIf("direction-text")
    const textBefore = before === null ? null : this.ignoredTextOf(before)
    this.addItem("Keyword", [this.take("direction")])
    const value = this.take("direction-value")
    this.addItem("Keyword", [value])
    const after = this.takeIf("direction-text")
    const textAfter = after === null ? null : this.ignoredTextOf(after)
    return {
      type: "ClassDirectionStatement",
      textBefore,
      direction: directionOf(value.text),
      textAfter,
      ...this.placeFrom(start),
    }
  }

  /**
   * Other statements: `accessibility-statement = "accTitle" ":" title-text |
   * "accDescr" ":" description-text | "accDescr" "{" description-block-text
   * "}"`, and `empty-description-block statement`, added to `body`.
   */
  private parseAccessibilityStatement(body: ClassStatement[]): void {
    const start = this.next
    const keyword = this.peek()
    if (keyword?.name === "accTitle") {
      this.addItem("Keyword", [this.take("accTitle")])
      this.addItem("Punctuator", [this.take(":")])
      const value = this.literalOf([this.take("title-text")])
      body.push({
        type: "ClassAccTitleStatement",
        value,
        ...this.placeFrom(start),
      })
      return
    }
    const afterKeyword = this.positionAfter(this.next)
    if (this.nameAt(afterKeyword) === ":") {
      this.addItem("Keyword", [this.take("accDescr")])
      this.addItem("Punctuator", [this.take(":")])
      const value = this.literalOf([this.take("description-text")])
      body.push({
        type: "ClassAccDescrStatement",
        value,
        ...this.placeFrom(start),
      })
      return
    }
    const empty = this.nameAt(this.positionAfter(afterKeyword)) === "}"
    body.push(this.parseDescriptionBlock())
    // Empty description blocks: another statement follows on the same line.
    if (empty) this.parseStatement(body)
  }

  /**
   * Other statements: `"accDescr" "{" description-block-text "}"`, and
   * `empty-description-block = "accDescr" "{" "}"`.
   */
  private parseDescriptionBlock(): ClassAccDescrBlockStatement {
    const start = this.next
    this.addItem("Keyword", [this.take("accDescr")])
    this.addItem("Punctuator", [this.take("{")])
    const text = this.takeIf("description-block-text")
    const value =
      text === null || text.significantRange === null
        ? null
        : this.literalOf([text])
    this.addItem("Punctuator", [this.take("}")])
    return {
      type: "ClassAccDescrBlockStatement",
      value,
      ...this.placeFrom(start),
    }
  }

  /**
   * The error of a known divergence for the unit `unit`, which the grammar
   * cannot read where it stands: a unit of an empty form, which no rule
   * takes, or the unit after an empty generic type, which then does not end
   * a class name (known-divergences/tokenless-empty-forms.md).
   */
  protected knownDivergenceAt(unit: Unit): ParseError | null {
    const own = this.emptyFormErrorAt(unit)
    if (own !== null) return own
    const previous = this.unitAt(this.positionBefore(unit.index))
    return previous?.name === "~" ? this.emptyFormErrorAt(previous) : null
  }
}

/** The direction line: the value of a `direction-value` unit. */
function directionOf(text: string): ClassDirection {
  const direction = DIRECTIONS.find((candidate) => candidate === text)
  if (direction === undefined) {
    throw new Error(`mmd-toolkit parser bug: the direction ${text}`)
  }
  return direction
}

/** Other statements: the link target of a `link-target` unit. */
function linkTargetOf(text: string): ClassLinkTarget {
  const target = LINK_TARGETS.find((candidate) => candidate === text)
  if (target === undefined) {
    throw new Error(`mmd-toolkit parser bug: the link target ${text}`)
  }
  return target
}
