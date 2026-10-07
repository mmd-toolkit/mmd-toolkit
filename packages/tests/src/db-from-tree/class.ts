import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  ClassAnnotation,
  ClassArrowMarker,
  ClassAttribute,
  ClassCallbackStatement,
  ClassDeclaration,
  ClassDiagram,
  ClassLiteral,
  ClassMember,
  ClassMethod,
  ClassIdentifier,
  ClassName,
  ClassNamespaceStatement,
  ClassNoteStatement,
  ClassRelationStatement,
  ClassStatement,
} from "./class-tree.ts"
import type { Identifier, StringLiteral, TreeRange, TreeRoot } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

// docs/db-from-tree/class.md: the summary of the Db that a class
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

  private readonly clickCalls: JsonObject[] = []

  private readonly root: TreeRoot

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.root = root
    this.text = new ConvertedText(readConvertedCharacters(source, root))
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
      ...(this.clickCalls.length === 0 ? {} : { clickCalls: this.clickCalls }),
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
        this.recordClickCalls(statement)
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
      case "ClassAnnotation":
        // The name of a member line, whitespace included (ast/class.md,
        // ClassAnnotation).
        entry.annotations.push(
          member.name === null || member.name.type !== "ClassLiteral"
            ? ""
            : this.literalTextOf(member.name),
        )
        return
      case "ClassMethod":
        entry.methods.push({
          memberType: "method",
          visibility: VISIBILITY_MARKS[member.visibility],
          classifier: CLASSIFIER_MARKS[member.classifier],
          id: this.memberNameOf(member),
          parameters: this.literalTextOf(member.parameters),
          // The return type, with the whitespace before a classifier mark
          // that ends it (ast/class.md, ClassMethod).
          returnType: this.literalTextOf(member.returnType),
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
   * Member statements and member lines: the member name, the value of the
   * name with the whitespace at its start made one space; the value starts
   * with whitespace only when the member name text starts with a space
   * (U+0020), in converted form, which leaves directives out.
   */
  private memberNameOf(member: ClassMethod | ClassAttribute): string {
    const name = this.literalTextOf(member.name)
    const rest = name.trimStart()
    return rest.length < name.length ? ` ${rest}` : name
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
   * Click statements: a callback records a click call for each name of the
   * written name of its class (the name of the function and the arguments as
   * written, the text between the parentheses, whitespace at its ends too),
   * whether or not the name is a class.
   */
  private recordClickCalls(statement: ClassCallbackStatement): void {
    const name =
      statement.callback.type === "StringLiteral"
        ? this.stringTextOf(statement.callback)
        : this.literalTextOf(statement.callback)
    const args =
      statement.arguments === null
        ? null
        : this.literalTextOf(statement.arguments)
    for (const id of this.writtenNameOf(statement.class).split(",")) {
      this.clickCalls.push({ id, name, args })
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
   * Styles: the style values of `styles`: the converted form of the value
   * of each style (the written texts of its units joined, ast/class.md,
   * ClassLiteral), split at each `,`, without the whitespace at the end of
   * each value, which the summary leaves out.
   */
  private styleValuesOf(styles: readonly ClassLiteral[]): string[] {
    return styles.flatMap((style) =>
      this.convertedTokensOf(style.range)
        .split(",")
        .map((value) => value.trimEnd()),
    )
  }

  /**
   * The converted form of the texts of the tokens in `range`, joined, without
   * the `Directive` and `IgnoredSemicolon` tokens: the value of a node whose
   * value is the texts of its tokens (ast/class.md, ClassLiteral and
   * Identifier).
   */
  private convertedTokensOf(range: TreeRange): string {
    return this.root.tokens
      .filter(
        (token) =>
          token.type !== "Directive" &&
          token.type !== "IgnoredSemicolon" &&
          range[0] <= token.range[0] &&
          token.range[1] <= range[1],
      )
      .map((token) => this.text.of(token.range))
      .join("")
  }

  /**
   * Names: the written name of `name`: its name text, followed by `~`, the
   * generic type as written, whitespace included, and `~` when it has one.
   */
  private writtenNameOf(name: ClassName): string {
    const nameText = this.nameTextOf(name.prefix, name.name)
    if (name.generic === null) return nameText
    return `${nameText}~${this.literalTextOf(name.generic)}~`
  }

  /**
   * Names: the name text of the name parts `prefix` and the name `name`: the
   * texts of their units, joined, with the backquotes of a backquoted name
   * left out. A backquoted name that is not closed runs to the end of the
   * text and ends with the line feed after it (common.md, End of text).
   */
  private nameTextOf(
    prefix: ClassIdentifier | null,
    name: ClassIdentifier | StringLiteral,
  ): string {
    const prefixText = prefix === null ? "" : this.identifierTextOf(prefix)
    if (name.type === "ClassIdentifier") {
      return prefixText + this.identifierTextOf(name)
    }
    if (name.closed) return prefixText + this.stringTextOf(name)
    // A backquoted name that is not closed runs to the end of the source,
    // whitespace included, and the line feed after it ends the text.
    return `${prefixText}${this.stringTextOf(name)}\n`
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

  /**
   * The converted form of the texts of the tokens of `identifier`, an
   * Identifier or a ClassIdentifier, joined: the whitespace between them is
   * not part of it.
   */
  private identifierTextOf(identifier: Identifier | ClassIdentifier): string {
    return this.convertedTokensOf(identifier.range)
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
    const content: TreeRange = [start + 1, string.closed ? end - 1 : end]
    return this.text.of(content)
  }

  /** The converted form of the value of `literal`; the empty text when there is none. */
  private literalTextOf(literal: ClassLiteral | null): string {
    return literal === null ? "" : this.text.of(literal.range)
  }
}

/**
 * docs/db-from-tree/class.md: the summary of the Db that the class
 * `diagram` denotes. The title comes from mermaid.js through `embedded`:
 * the tree does not read embedded data.
 */
export function classDbOf(
  source: string,
  root: TreeRoot,
  diagram: ClassDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new ClassDbBuilder(source, root, embedded).summaryOf(diagram)
}
