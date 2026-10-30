import { appendItems } from "../collections.ts"
import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  RequirementClassDefStatement,
  RequirementClassShorthandStatement,
  RequirementClassStatement,
  RequirementDiagram,
  RequirementElementStatement,
  RequirementKind,
  RequirementLiteral,
  RequirementName,
  RequirementRelationshipStatement,
  RequirementRequirementStatement,
  RequirementRisk,
  RequirementStatement,
  RequirementStyleStatement,
  RequirementVerifyMethod,
} from "./requirement-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

// docs/db-from-tree/requirement.md: the summary of the Db that a requirement
// tree denotes, in the form of `normalizeRequirement()` of
// `@mmd-toolkit/tests`. The statements are executed in source order, as
// mermaid.js executes them while it parses; each step names the paragraph of
// "Building the summary from the tree" that defines it. Every value is read in
// converted form (see `converted-text.ts`).

/** What a requirement and an element have in common: the styles and the classes that statements give them. */
interface StyledEntry {
  readonly name: string
  readonly cssStyles: string[]
  /** The classes in the order they were given, after the class `default` that every one starts with. */
  readonly classes: string[]
}

/** The summary: one requirement while it is built. */
interface RequirementEntry extends StyledEntry {
  readonly type: string
  readonly requirementId: string
  readonly text: string
  readonly risk: string
  readonly verifyMethod: string
}

/** The summary: one element while it is built. */
interface ElementEntry extends StyledEntry {
  readonly type: string
  readonly docRef: string
}

/** The summary: one class definition. */
interface ClassEntry {
  readonly id: string
  readonly styles: string[]
}

/** The class that every requirement and element starts with. */
const DEFAULT_CLASS = "default"

/** The names that the Db gives the kinds of the tree. */
const KIND_NAMES: Readonly<Record<RequirementKind, string>> = {
  requirement: "Requirement",
  functionalRequirement: "Functional Requirement",
  interfaceRequirement: "Interface Requirement",
  performanceRequirement: "Performance Requirement",
  physicalRequirement: "Physical Requirement",
  designConstraint: "Design Constraint",
}

/** The names that the Db gives the risks of the tree. */
const RISK_NAMES: Readonly<Record<RequirementRisk, string>> = {
  low: "Low",
  medium: "Medium",
  high: "High",
}

/** The names that the Db gives the verification methods of the tree. */
const VERIFY_METHOD_NAMES: Readonly<Record<RequirementVerifyMethod, string>> = {
  analysis: "Analysis",
  demonstration: "Demonstration",
  inspection: "Inspection",
  test: "Test",
}

/** The builder of the summary: the statements are executed in source order. */
class RequirementDbBuilder {
  private readonly title: string

  private accTitle = ""

  private accDescr = ""

  private direction = "TB"

  private readonly requirements = new Map<string, RequirementEntry>()

  private readonly elements = new Map<string, ElementEntry>()

  private readonly relationships: JsonObject[] = []

  private readonly classes = new Map<string, ClassEntry>()

  private readonly root: TreeRoot

  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.root = root
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
    this.title = this.replace(embedded.title ?? "")
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: RequirementDiagram): DbSummary {
    for (const statement of diagram.body) this.execute(statement)
    return {
      direction: this.direction,
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      requirements: [...this.requirements.values()].map((requirement) => ({
        name: requirement.name,
        type: requirement.type,
        requirementId: requirement.requirementId,
        text: requirement.text,
        risk: requirement.risk,
        verifyMethod: requirement.verifyMethod,
        cssStyles: requirement.cssStyles,
        classes: requirement.classes.slice(1),
      })),
      elements: [...this.elements.values()].map((element) => ({
        name: element.name,
        type: element.type,
        docRef: element.docRef,
        cssStyles: element.cssStyles,
        classes: element.classes.slice(1),
      })),
      relationships: this.relationships,
      classes: [...this.classes.values()].map((definition) => ({
        id: definition.id,
        styles: definition.styles,
      })),
    }
  }

  /** Executing: what one statement changes. */
  private execute(statement: RequirementStatement): void {
    switch (statement.type) {
      case "RequirementRequirementStatement":
        this.executeRequirement(statement)
        break
      case "RequirementElementStatement":
        this.executeElement(statement)
        break
      case "RequirementRelationshipStatement":
        this.executeRelationship(statement)
        break
      case "RequirementDirectionStatement":
        this.direction = statement.direction
        break
      case "RequirementStyleStatement":
        this.executeStyle(statement)
        break
      case "RequirementClassDefStatement":
        this.executeClassDef(statement)
        break
      case "RequirementClassStatement":
        this.executeClass(statement)
        break
      case "RequirementClassShorthandStatement":
        this.executeClassShorthand(statement)
        break
      case "RequirementAccTitleStatement":
        this.accTitle = this.replace(trimmed(this.textOf(statement.value)))
        break
      case "RequirementAccDescrStatement":
        this.accDescr = this.replace(trimmed(this.textOf(statement.value)))
        break
      case "RequirementAccDescrBlockStatement":
        // A block without text changes nothing.
        if (statement.value !== null) {
          this.accDescr = this.replace(
            descriptionOf(this.textOf(statement.value)),
          )
        }
        break
      default:
        throw new Error(
          `requirement Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Requirements: a requirement statement adds the requirement of its name
   * when there is none, with the values of its fields, then gives it the
   * classes of the statement.
   */
  private executeRequirement(statement: RequirementRequirementStatement): void {
    let requirementId = ""
    let text = ""
    let risk = ""
    let verifyMethod = ""
    // The Db applies the fields of a body from the last to the first, so the
    // first field of a kind is the one that stays.
    for (const item of statement.body.toReversed()) {
      switch (item.type) {
        case "RequirementValueField":
          if (item.field === "id") requirementId = this.textOf(item.value)
          else text = this.textOf(item.value)
          break
        case "RequirementRiskField":
          risk = RISK_NAMES[item.risk]
          break
        case "RequirementVerifyMethodField":
          verifyMethod = VERIFY_METHOD_NAMES[item.verifyMethod]
          break
        // An empty description block on a line of the body is not read.
        case "RequirementIgnoredText":
          break
        default:
          throw new Error(
            `requirement Db: unknown field ${JSON.stringify(item satisfies never)}`,
          )
      }
    }
    const name = this.textOf(statement.name)
    if (!this.requirements.has(name)) {
      this.requirements.set(name, {
        name,
        type: KIND_NAMES[statement.requirementType],
        requirementId,
        text,
        risk,
        verifyMethod,
        cssStyles: [],
        classes: [DEFAULT_CLASS],
      })
    }
    this.addClasses([name], this.namesOf(statement.cssClasses))
  }

  /**
   * Elements: an element statement adds the element of its name when there is
   * none, with the values of its fields, then gives the classes of the
   * statement to the requirement or element of that name.
   */
  private executeElement(statement: RequirementElementStatement): void {
    let type = ""
    let docRef = ""
    // The first field of a kind stays, as in a requirement.
    for (const item of statement.body.toReversed()) {
      switch (item.type) {
        case "RequirementElementField":
          if (item.field === "type") type = this.textOf(item.value)
          else docRef = this.textOf(item.value)
          break
        case "RequirementIgnoredText":
          break
        default:
          throw new Error(
            `requirement Db: unknown field ${JSON.stringify(item satisfies never)}`,
          )
      }
    }
    const name = this.textOf(statement.name)
    if (!this.elements.has(name)) {
      this.elements.set(name, {
        name,
        type,
        docRef,
        cssStyles: [],
        classes: [DEFAULT_CLASS],
      })
    }
    this.addClasses([name], this.namesOf(statement.cssClasses))
  }

  /**
   * Relationships: a relationship statement adds one relationship. The names
   * need not be those of a requirement or an element. `src` is the left name
   * for a forward arrow and the right one for a backward arrow.
   */
  private executeRelationship(
    statement: RequirementRelationshipStatement,
  ): void {
    const left = this.textOf(statement.left)
    const right = this.textOf(statement.right)
    this.relationships.push({
      type: statement.relationship,
      src: statement.arrow === "forward" ? left : right,
      dst: statement.arrow === "forward" ? right : left,
    })
  }

  /**
   * Classes and styles: a `style` statement adds its styles, in order, to the
   * requirement of each of its names, or the element when there is no
   * requirement of that name, and stops at the first name that is neither.
   */
  private executeStyle(statement: RequirementStyleStatement): void {
    const styles = statement.styles.map((style) => this.styleOf(style))
    for (const name of this.namesOf(statement.names)) {
      const entry = this.entryOf(name)
      if (entry === undefined) return
      appendItems(entry.cssStyles, styles)
    }
  }

  /**
   * Class definitions: a `classDef` statement adds its styles, in order, to
   * the definition of each of its names, which it makes at the end of the list
   * when there is none, and then to every requirement and element that has
   * the class at that point.
   */
  private executeClassDef(statement: RequirementClassDefStatement): void {
    const styles = statement.styles.map((style) => this.styleOf(style))
    for (const id of this.namesOf(statement.cssClasses)) {
      let definition = this.classes.get(id)
      if (definition === undefined) {
        definition = { id, styles: [] }
        this.classes.set(id, definition)
      }
      appendItems(definition.styles, styles)
      for (const entry of [
        ...this.requirements.values(),
        ...this.elements.values(),
      ]) {
        if (entry.classes.includes(id)) appendItems(entry.cssStyles, styles)
      }
    }
  }

  /** Classes and styles: a `class` statement gives its classes to its names. */
  private executeClass(statement: RequirementClassStatement): void {
    this.addClasses(
      this.namesOf(statement.names),
      this.namesOf(statement.cssClasses),
    )
  }

  /** Classes and styles: a class shorthand statement gives its classes to its name. */
  private executeClassShorthand(
    statement: RequirementClassShorthandStatement,
  ): void {
    this.addClasses(
      [this.textOf(statement.name)],
      this.namesOf(statement.cssClasses),
    )
  }

  /**
   * Classes and styles: adds the classes `classNames`, in order, to each of
   * `names` that is a requirement, or an element when there is no requirement
   * of that name, with the styles that each class has at this point. A name
   * that is neither is skipped, and the names after it still get the classes.
   */
  private addClasses(
    names: readonly string[],
    classNames: readonly string[],
  ): void {
    for (const name of names) {
      const entry = this.entryOf(name)
      if (entry === undefined) continue
      for (const className of classNames) {
        entry.classes.push(className)
        appendItems(entry.cssStyles, this.classes.get(className)?.styles ?? [])
      }
    }
  }

  /** The requirement of `name`, or the element when there is no requirement of that name. */
  private entryOf(name: string): StyledEntry | undefined {
    return this.requirements.get(name) ?? this.elements.get(name)
  }

  /**
   * The text of a name or a value: the converted form of its range, or, for a
   * string, of its range between the quotes.
   */
  private textOf(node: RequirementName | RequirementLiteral): string {
    if (node.type !== "StringLiteral") return this.text.of(node.range)
    const [start, end] = node.range
    return this.text.of([start + 1, end - 1])
  }

  /** The texts of the names `names`. */
  private namesOf(names: readonly RequirementName[]): string[] {
    return names.map((name) => this.textOf(name))
  }

  /** The value of a style: the converted forms of the tokens inside the literal, joined. */
  private styleOf(style: RequirementLiteral): string {
    return this.text.ofTokensIn(style.range, this.root.tokens)
  }
}

/**
 * docs/db-from-tree/requirement.md: the summary of the Db that the requirement
 * tree `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function requirementDbOf(
  source: string,
  root: TreeRoot,
  diagram: RequirementDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new RequirementDbBuilder(source, root, embedded).summaryOf(diagram)
}
