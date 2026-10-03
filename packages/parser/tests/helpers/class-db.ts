import type { JsonObject } from "@mmd-toolkit/tests"
import type { DbSummary, EmbeddedValues } from "@mmd-toolkit/tests/mermaid"
import type {
  ClassAnnotation,
  ClassAttribute,
  ClassArrowMarker,
  ClassDeclaration,
  ClassDiagram,
  ClassLiteral,
  ClassMember,
  ClassMethod,
  ClassDbTexts,
  ClassName,
  ClassNamespaceStatement,
  ClassNoteStatement,
  ClassRelationStatement,
  ClassStatement,
  Identifier,
  Range,
  Root,
  StringLiteral,
} from "../../src/index.ts"
import { classDbTexts } from "../../src/index.ts"
import { ClassSource } from "./class-source.ts"
import { ConvertedText } from "./converted-text.ts"
import { descriptionOf, trimmed } from "./db-values.ts"

// diagrams/class.md, Db normalization: the summary of the Db that a class
// tree denotes, in the form of `normalizeClass()` of `@mmd-toolkit/tests`.
// Every step below is a paragraph of "Building the summary from the tree",
// and its comment names it. Each step reads the values of the tree in
// converted form (see `converted-text.ts`).

/** The summary: one class. */
interface ClassEntry {
  id: string
  type: string
  label: string
  text: string
  shape: "classBox"
  cssClasses: string
  methods: JsonObject[]
  members: JsonObject[]
  annotations: string[]
  styles: string[]
  parent?: string
  link?: string
  linkTarget?: string
  haveCallback?: boolean
  tooltip?: string
}

/** The summary: one namespace. */
interface NamespaceEntry {
  id: string
  label: string
  classes: string[]
  notes: string[]
  children: string[]
  explicit: boolean
  parent?: string
}

/** The summary: one note. */
interface NoteEntry {
  id: string
  text: string
  class?: string
  parent?: string
}

/** A namespace item: what a namespace statement holds. */
type NamespaceItem = ClassNamespaceStatement["body"][number]

/** Relations: the number of each relation end. */
const RELATION_TYPES: Readonly<Record<ClassArrowMarker, number | "none">> = {
  "hollow-diamond": 0,
  triangle: 1,
  "filled-diamond": 2,
  arrow: 3,
  lollipop: 4,
  none: "none",
}

/** Member lines: the mark of each visibility. */
const VISIBILITY_MARKS: Readonly<Record<string, string>> = {
  none: "",
  public: "+",
  private: "-",
  protected: "#",
  package: "~",
}

/** Member lines: the mark of each classifier. */
const CLASSIFIER_MARKS: Readonly<Record<string, string>> = {
  none: "",
  static: "$",
  abstract: "*",
}

/** Whether `text` starts with an ASCII digit. */
function startsWithAsciiDigit(text: string): boolean {
  const first = text.charCodeAt(0)
  return first >= 0x30 && first <= 0x39
}

/**
 * Names: the id and the type of the written name `writtenName`: the text
 * before its first `~` and the text between its first and its second `~`,
 * or up to its end, when it has a `~` and its first `~` is not its first
 * character; otherwise the written name and the empty type.
 */
function idAndTypeOf(writtenName: string): {
  readonly id: string
  readonly type: string
} {
  const first = writtenName.indexOf("~")
  if (first <= 0) return { id: writtenName, type: "" }
  const second = writtenName.indexOf("~", first + 1)
  return {
    id: writtenName.slice(0, first),
    type: writtenName.slice(first + 1, second === -1 ? undefined : second),
  }
}

/** The builder of the summary: the statements are applied in source order. */
class ClassDbBuilder {
  private direction = "TB"

  private readonly title: string

  private accTitle = ""

  private accDescr = ""

  private readonly classes = new Map<string, ClassEntry>()

  private readonly relations: JsonObject[] = []

  private readonly notes: NoteEntry[] = []

  /** The note that each note statement added, for the namespace it is in. */
  private readonly noteOfStatement = new Map<ClassNoteStatement, NoteEntry>()

  private readonly namespaces = new Map<string, NamespaceEntry>()

  private readonly interfaces: JsonObject[] = []

  private readonly source: ClassSource

  private readonly root: Root

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The texts that the Db reads past the range of a value node (`classDbTexts`). */
  private readonly dbTexts: ClassDbTexts

  public constructor(source: string, root: Root, embedded: EmbeddedValues) {
    this.root = root
    this.source = new ClassSource(source, root)
    this.text = new ConvertedText(this.source.diagramText)
    this.dbTexts = classDbTexts(root, source)
    this.title = embedded.title ?? ""
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: ClassDiagram): DbSummary {
    for (const statement of diagram.body) this.apply(statement, null)
    return {
      direction: this.direction,
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      classes: [...this.classes.values()].map((entry) => ({ ...entry })),
      relations: this.relations,
      notes: this.notes.map((note) => ({ ...note })),
      namespaces: [...this.namespaces.values()].map((namespace) => ({
        ...namespace,
      })),
      interfaces: this.interfaces,
    }
  }

  /** Building the summary from the tree: one statement; `namespace` is the qualified id of the namespace it is in, if any. */
  private apply(
    statement: ClassStatement | NamespaceItem,
    namespace: string | null,
  ): void {
    switch (statement.type) {
      case "ClassDeclaration":
        this.applyClassStatement(statement)
        return
      case "ClassMemberStatement": {
        const id = this.addClass(statement.class)
        if (statement.member !== null) this.addMember(id, statement.member)
        return
      }
      case "ClassNameStatement":
        return
      case "ClassAnnotationStatement": {
        const entry = this.classes.get(this.idOf(statement.class))
        if (entry === undefined) {
          throw new Error("class Db: an annotation for no class")
        }
        entry.annotations.push(this.nameTextOfIdentifier(statement.annotation))
        return
      }
      case "ClassRelationStatement":
        this.applyRelation(statement)
        return
      case "ClassNamespaceStatement":
        this.applyNamespace(statement, namespace)
        return
      case "ClassNoteStatement": {
        const note: NoteEntry = {
          id: `note${this.notes.length}`,
          text: this.stringTextOf(statement.text),
          ...(statement.class === null
            ? {}
            : { class: this.writtenNameOf(statement.class) }),
        }
        this.notes.push(note)
        this.noteOfStatement.set(statement, note)
        return
      }
      case "ClassCallbackStatement":
        this.applyClick(statement.class, statement.tooltip, (name) => {
          const entry = this.classes.get(idAndTypeOf(name).id)
          if (entry !== undefined) entry.haveCallback = true
        })
        return
      case "ClassLinkStatement": {
        const url = trimmed(this.stringTextOf(statement.url))
        this.applyClick(statement.class, statement.tooltip, (name) => {
          const entry = this.classes.get(this.lookupIdOf(name))
          if (entry === undefined) return
          if (url === "") delete entry.link
          else entry.link = url
          entry.linkTarget = statement.target ?? "_blank"
        })
        return
      }
      case "ClassCssClassStatement":
        this.giveCssClass(
          this.stringTextOf(statement.idList),
          this.identifierTextOf(statement.cssClass),
        )
        return
      case "ClassStyleStatement": {
        const entry = this.classes.get(this.identifierTextOf(statement.id))
        entry?.styles.push(...this.styleValuesOf(statement.styles))
        return
      }
      case "ClassClassDefStatement": {
        const values = this.styleValuesOf(statement.styles)
        for (const cssClass of statement.cssClasses) {
          const name = this.identifierTextOf(cssClass)
          for (const entry of this.classes.values()) {
            if (entry.cssClasses.includes(name)) entry.styles.push(...values)
          }
        }
        return
      }
      case "ClassDirectionStatement":
        this.direction = statement.direction
        return
      case "ClassAccTitleStatement":
        this.accTitle = this.text.of(statement.value.range)
        return
      case "ClassAccDescrStatement":
        this.accDescr = descriptionOf(this.text.of(statement.value.range))
        return
      case "ClassAccDescrBlockStatement":
        if (statement.value !== null) {
          this.accDescr = descriptionOf(this.text.of(statement.value.range))
        }
        return
      default:
        throw new Error(
          `class Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Class statements: adds the class, then sets its label, gives it the
   * CSS class, adds the annotation, and adds the member lines.
   */
  private applyClassStatement(statement: ClassDeclaration): void {
    const id = this.addClass(statement.name)
    const entry = this.classOf(id)
    if (statement.label !== null) {
      entry.label = this.stringTextOf(statement.label)
      entry.text =
        entry.type === "" ? entry.label : `${entry.label}<${entry.type}>`
    }
    if (statement.cssClass !== null) {
      this.giveCssClass(
        this.writtenNameOf(statement.name),
        this.identifierTextOf(statement.cssClass),
      )
    }
    if (statement.annotation !== null) {
      entry.annotations.push(this.nameTextOfIdentifier(statement.annotation))
    }
    for (const member of statement.members ?? []) this.addMember(id, member)
  }

  /** Adding a class: adds the class of the written name of `name` unless one with its id exists; its id. */
  private addClass(name: ClassName): string {
    return this.addClassByWrittenName(this.writtenNameOf(name))
  }

  /** Adding a class: as `addClass`, from the written name `writtenName`. */
  private addClassByWrittenName(writtenName: string): string {
    const { id, type } = idAndTypeOf(writtenName)
    if (!this.classes.has(id)) {
      this.classes.set(id, {
        id,
        type,
        label: id,
        text: type === "" ? id : `${id}&lt;${type}&gt;`,
        shape: "classBox",
        cssClasses: "default",
        methods: [],
        members: [],
        annotations: [],
        styles: [],
      })
    }
    return id
  }

  /** Member statements and member lines: adds the member line `member` to the class `id`. */
  private addMember(id: string, member: ClassMember): void {
    const entry = this.classOf(id)
    switch (member.type) {
      case "ClassAnnotation": {
        // The text between `<<` and `>>`, whitespace included.
        const [start, end] = member.range
        entry.annotations.push(this.text.of([start + 2, end - 2]))
        return
      }
      case "ClassMethod":
        entry.methods.push({
          memberType: "method",
          visibility: VISIBILITY_MARKS[member.visibility],
          classifier: CLASSIFIER_MARKS[member.classifier],
          id: this.memberNameOf(member),
          parameters: this.literalTextOf(member.parameters),
          returnType: this.returnTypeOf(member),
        })
        return
      case "ClassAttribute":
        entry.members.push({
          memberType: "attribute",
          visibility: VISIBILITY_MARKS[member.visibility],
          classifier: CLASSIFIER_MARKS[member.classifier],
          id: this.memberNameOf(member),
        })
        return
      default:
        throw new Error(
          `class Db: unknown member ${JSON.stringify(member satisfies never)}`,
        )
    }
  }

  /**
   * Member statements and member lines: the member name, preceded by a
   * space when its member name text starts with a space (U+0020), in
   * converted form, which leaves directives out. Where the member name text
   * lies is the lexer's (`MemberLine`).
   */
  private memberNameOf(member: ClassMethod | ClassAttribute): string {
    const name = this.literalTextOf(member.name)
    const { nameText } = this.source.memberLineAt(member.range)
    if (nameText === null) throw new Error("class Db: no member name text")
    return this.text.of(nameText).startsWith(" ") ? ` ${name}` : name
  }

  /**
   * Member statements and member lines: the return type of `method`: the
   * text of its unit, followed, when a classifier mark ends the return type
   * (Member lines, item 5), by the whitespace between the unit and that
   * mark, the source between them in converted form.
   */
  private returnTypeOf(method: ClassMethod): string {
    const { returnType } = method
    if (returnType === null) return ""
    if (method.classifier === "none") return this.literalTextOf(returnType)
    // A classifier mark after the return type ends it (item 5); one right
    // after the closing parenthesis (item 4) comes before it.
    const mark = this.root.tokens.find(
      (token) =>
        token.type === "Punctuator" &&
        token.range[0] >= returnType.range[1] &&
        token.range[1] <= method.range[1] &&
        token.value === CLASSIFIER_MARKS[method.classifier],
    )
    const between =
      mark === undefined
        ? ""
        : this.text.of([returnType.range[1], mark.range[0]])
    return this.literalTextOf(returnType) + between
  }

  /**
   * Relations: adds the classes, or a class and an interface for a
   * lollipop at one end alone, and the relation.
   */
  private applyRelation(statement: ClassRelationStatement): void {
    const fromName = this.writtenNameOf(statement.from)
    const toName = this.writtenNameOf(statement.to)
    const type1 = RELATION_TYPES[statement.arrow.startMarker]
    const type2 = RELATION_TYPES[statement.arrow.endMarker]
    const [id1, id2] = this.addEnds(fromName, toName, type1, type2)
    this.relations.push({
      id1,
      id2,
      relation: {
        type1,
        type2,
        lineType: statement.arrow.line === "solid" ? 0 : 1,
      },
      relationTitle1: this.cardinalityOf(statement.fromCardinality),
      relationTitle2: this.cardinalityOf(statement.toCardinality),
      ...(this.hasLabel(statement)
        ? { title: trimmed(this.literalTextOf(statement.label)) }
        : {}),
    })
  }

  /**
   * Relations: adds the classes of the written names `fromName` and
   * `toName`, or, for a lollipop at one end alone, the class at the other
   * end and an interface in place of the class at that end; the ids of
   * the two ends.
   */
  private addEnds(
    fromName: string,
    toName: string,
    type1: number | "none",
    type2: number | "none",
  ): [string, string] {
    if (type1 === 4 && type2 === "none") {
      const id2 = this.addClassByWrittenName(toName)
      return [this.addInterface(fromName, toName), id2]
    }
    if (type2 === 4 && type1 === "none") {
      const id1 = this.addClassByWrittenName(fromName)
      return [id1, this.addInterface(toName, fromName)]
    }
    const id1 = this.addClassByWrittenName(fromName)
    return [id1, this.addClassByWrittenName(toName)]
  }

  /** Relations: adds the interface with the label `label` for the class `classId`; its id. */
  private addInterface(label: string, classId: string): string {
    const id = `interface${this.interfaces.length}`
    this.interfaces.push({ id, label, classId })
    return id
  }

  /** Relations: the text of a cardinality without the whitespace at its ends, or `none` for a missing or empty string. */
  private cardinalityOf(cardinality: StringLiteral | null): string {
    if (cardinality === null || cardinality.value === "") return "none"
    return trimmed(this.stringTextOf(cardinality))
  }

  /**
   * Relations: whether the relation has a label. A label whose text is all
   * whitespace has no node, and its `:` token shows it.
   */
  private hasLabel(statement: ClassRelationStatement): boolean {
    if (statement.label !== null) return true
    return this.root.tokens.some(
      (token) =>
        token.type === "Punctuator" &&
        token.value === ":" &&
        token.range[0] >= statement.to.range[1] &&
        token.range[1] <= statement.range[1],
    )
  }

  /** Namespaces: a namespace statement, inside the namespace `parent` when it is in one. */
  private applyNamespace(
    statement: ClassNamespaceStatement,
    parent: string | null,
  ): void {
    const nameText = this.nameTextOf(statement.prefix, statement.name)
    const qualifiedId = parent === null ? nameText : `${parent}.${nameText}`
    const label =
      statement.label === null ? null : this.stringTextOf(statement.label)
    const existing = this.namespaces.get(qualifiedId)
    if (existing !== undefined) {
      existing.explicit = true
      if (label !== null) existing.label = label
    } else {
      const parts = qualifiedId.split(".")
      parts.forEach((part, index) => {
        const id = parts.slice(0, index + 1).join(".")
        const isQualifiedId = index === parts.length - 1
        const found = this.namespaces.get(id)
        if (found !== undefined) {
          if (isQualifiedId) found.explicit = true
          return
        }
        const parentId = index === 0 ? null : parts.slice(0, index).join(".")
        this.namespaces.set(id, {
          id,
          label: isQualifiedId && label !== null ? label : part,
          classes: [],
          notes: [],
          children: [],
          explicit: isQualifiedId,
          ...(parentId === null ? {} : { parent: parentId }),
        })
        if (parentId !== null) {
          this.namespaces.get(parentId)?.children.push(id)
        }
      })
    }
    for (const item of statement.body) this.apply(item, qualifiedId)
    const namespace = this.namespaces.get(qualifiedId)
    if (namespace === undefined) throw new Error("class Db: no namespace")
    for (const item of statement.body) {
      if (item.type === "ClassDeclaration") {
        const id = this.idOf(item.name)
        this.classOf(id).parent = qualifiedId
        if (!namespace.classes.includes(id)) namespace.classes.push(id)
      } else if (item.type === "ClassNoteStatement") {
        const note = this.noteOfStatement.get(item)
        if (note === undefined) throw new Error("class Db: no note")
        note.parent = qualifiedId
        if (!namespace.notes.includes(note.id)) namespace.notes.push(note.id)
      }
    }
  }

  /**
   * Click statements: applies `step` to each name of the written name of
   * `name`, then gives each the CSS class `clickable`, and sets the tooltip
   * when it is not empty.
   */
  private applyClick(
    name: ClassName,
    tooltip: StringLiteral | null,
    step: (name: string) => void,
  ): void {
    const writtenName = this.writtenNameOf(name)
    for (const each of writtenName.split(",")) step(each)
    this.giveCssClass(writtenName, "clickable")
    const tooltipText = tooltip === null ? "" : this.stringTextOf(tooltip)
    if (tooltipText === "") return
    for (const each of writtenName.split(",")) {
      const entry = this.classes.get(idAndTypeOf(each).id)
      if (entry !== undefined) entry.tooltip = tooltipText
    }
  }

  /** CSS classes: gives the CSS class `cssClass` to each name of `writtenName`. */
  private giveCssClass(writtenName: string, cssClass: string): void {
    for (const name of writtenName.split(",")) {
      const entry = this.classes.get(this.lookupIdOf(name))
      if (entry !== undefined) entry.cssClasses += ` ${cssClass}`
    }
  }

  /**
   * CSS classes: the id that a name is looked up as: the id of the name
   * (Names), after `classId-` when the name starts with an ASCII digit.
   */
  private lookupIdOf(name: string): string {
    const { id } = idAndTypeOf(name)
    return startsWithAsciiDigit(name) ? `classId-${id}` : id
  }

  /**
   * Styles: the style values of `styles`: the text of each style, the
   * texts of its units joined, split at each `,`, without the whitespace
   * at the end of each value, which the summary leaves out.
   */
  private styleValuesOf(styles: readonly ClassLiteral[]): string[] {
    return styles.flatMap((style) =>
      this.source
        .unitsIn(style.range)
        .map((unit) => this.text.of([unit.start, unit.end]))
        .join("")
        .split(",")
        .map((value) => value.trimEnd()),
    )
  }

  /**
   * Names: the written name of `name`: its name text, followed by `~`, the
   * text of the generic type, and `~` when it has a `generic-text` unit,
   * whose range is that of `classDbTexts`.
   */
  private writtenNameOf(name: ClassName): string {
    const nameText = this.nameTextOf(name.prefix, name.name)
    const generic = this.dbTexts.genericTypes.get(name)
    if (generic === undefined) return nameText
    return `${nameText}~${this.text.of(generic.range, generic.leftOut)}~`
  }

  /**
   * Names: the name text of the name parts `prefix` and the name `name`: the
   * texts of their units, joined, with the backquotes of a backquoted name
   * left out. A backquoted name that is not closed runs to the end of the
   * text and ends with the line feed after it (common.md, End of text).
   */
  private nameTextOf(
    prefix: Identifier | null,
    name: Identifier | StringLiteral,
  ): string {
    const prefixText = prefix === null ? "" : this.identifierTextOf(prefix)
    if (name.type === "Identifier") {
      return prefixText + this.identifierTextOf(name)
    }
    if (name.closed) return prefixText + this.stringTextOf(name)
    const [unit] = this.source.unitsIn(name.range)
    return `${prefixText}${this.text.of([unit.start + 1, unit.end])}\n`
  }

  /** Names: the id of the written name of `name`. */
  private idOf(name: ClassName): string {
    return idAndTypeOf(this.writtenNameOf(name)).id
  }

  /** The class with the id `id`, which exists. */
  private classOf(id: string): ClassEntry {
    const entry = this.classes.get(id)
    if (entry === undefined) {
      throw new Error(`class Db: no class ${JSON.stringify(id)}`)
    }
    return entry
  }

  /** The converted form of the texts of the units of `identifier`, joined: the whitespace between them is not part of it. */
  private identifierTextOf(identifier: Identifier): string {
    return this.source
      .unitsIn(identifier.range)
      .map((unit) => this.text.of([unit.start, unit.end]))
      .join("")
  }

  /** The name of the annotation `annotation` of a statement, an Identifier. */
  private nameTextOfIdentifier(annotation: ClassAnnotation): string {
    const name = annotation.name
    if (name === null || name.type !== "Identifier") {
      throw new Error("class Db: an annotation of a statement has no name part")
    }
    return this.identifierTextOf(name)
  }

  /** The converted form of the content of `string`, without its quotes. */
  private stringTextOf(string: StringLiteral): string {
    const [start, end] = string.range
    const content: Range = [start + 1, string.closed ? end - 1 : end]
    return this.text.of(content)
  }

  /** The converted form of the value of `literal`; the empty text when there is none. */
  private literalTextOf(literal: ClassLiteral | null): string {
    return literal === null ? "" : this.text.of(literal.range)
  }
}

/**
 * diagrams/class.md, Db normalization: the summary of the Db that the class
 * `diagram` denotes. The title comes from mermaid.js through `embedded`:
 * the tree does not read embedded data.
 */
export function classDbOf(
  source: string,
  root: Root,
  diagram: ClassDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new ClassDbBuilder(source, root, embedded).summaryOf(diagram)
}
