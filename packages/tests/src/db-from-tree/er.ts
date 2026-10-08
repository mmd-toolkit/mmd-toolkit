import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  ErAttribute,
  ErCardinality,
  ErDiagram,
  ErEntityStatement,
  ErIdentifier,
  ErLine,
  ErLiteral,
  ErName,
  ErRelationshipStatement,
  ErStatement,
  ErSubgraphStatement,
} from "./er-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { Identifier, TreeRoot } from "./tree.ts"
import { TreeError } from "./tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

// docs/db-from-tree/er.md: the summary of the Db that an ER tree denotes, in
// the form of `normalizeEr()` of `@mmd-toolkit/tests`. The statements are
// executed in source order, as mermaid.js executes them while it parses;
// each step names the paragraph of "Building the summary from the tree" that
// defines it. Every value is read in converted form (see
// `converted-text.ts`).

/** The summary: one entity while it is built. */
interface EntityEntry {
  readonly id: string
  readonly name: string
  alias: string
  readonly attributes: JsonObject[]
  readonly classes: string[]
  readonly cssStyles: string[]
}

/** The summary: one subgraph. */
interface SubGraphEntry {
  readonly id: string
  readonly nodes: readonly string[]
  readonly title: string
  readonly classes: string[]
  readonly cssStyles: string[]
  readonly dir: string | null
}

/** The names that the Db gives the cardinalities of the tree. */
const CARDINALITY_NAMES: Readonly<Record<ErCardinality, string>> = {
  "zero-or-one": "ZERO_OR_ONE",
  "zero-or-more": "ZERO_OR_MORE",
  "one-or-more": "ONE_OR_MORE",
  "only-one": "ONLY_ONE",
  "md-parent": "MD_PARENT",
}

/** The names that the Db gives the lines of the tree. */
const LINE_NAMES: Readonly<Record<ErLine, string>> = {
  identifying: "IDENTIFYING",
  "non-identifying": "NON_IDENTIFYING",
}

/** The builder of the summary: the statements are executed in source order. */
class ErDbBuilder {
  private readonly title: string

  private accTitle = ""

  private accDescr = ""

  private readonly entities = new Map<string, EntityEntry>()

  private readonly relationships: JsonObject[] = []

  private readonly classes = new Map<string, string[]>()

  /** The subgraphs, in the order in which they ended. */
  private readonly subGraphs: SubGraphEntry[] = []

  /** The subgraph that an id names at this point: the last one with the id. */
  private readonly subGraphsById = new Map<string, SubGraphEntry>()

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
  public summaryOf(diagram: ErDiagram): DbSummary {
    this.executeAll(diagram.body)
    return {
      direction: lastDirectionOf(diagram.body) ?? "TB",
      title: this.title,
      accTitle: this.accTitle,
      accDescr: this.accDescr,
      entities: [...this.entities.values()].map((entity) => ({
        id: entity.id,
        name: entity.name,
        alias: entity.alias,
        attributes: entity.attributes,
        classes: entity.classes,
        cssStyles: entity.cssStyles,
      })),
      relationships: this.relationships,
      classes: [...this.classes].map(([id, styles]) => ({ id, styles })),
      subGraphs: this.subGraphs.map((subGraph) => ({
        id: subGraph.id,
        nodes: [...subGraph.nodes],
        title: subGraph.title,
        classes: subGraph.classes,
        cssStyles: subGraph.cssStyles,
        ...(subGraph.dir === null ? {} : { dir: subGraph.dir }),
      })),
    }
  }

  /** Executing: the statements `statements` in order; the values they return, in order. */
  private executeAll(statements: readonly ErStatement[]): string[] {
    return statements.flatMap((statement) => this.execute(statement))
  }

  /**
   * Executing: what one statement changes, and the values it returns, which
   * the subgraph around it lists as nodes (**Subgraphs**).
   */
  private execute(statement: ErStatement): string[] {
    switch (statement.type) {
      case "ErEntityStatement":
        return [this.executeEntity(statement)]
      case "ErRelationshipStatement":
        return this.executeRelationship(statement)
      case "ErSubgraphStatement":
        return [this.executeSubgraph(statement)]
      case "ErClassDefStatement": {
        const styles = statement.styles.map((style) => this.styleOf(style))
        for (const cssClass of statement.cssClasses) {
          const id = this.textOf(cssClass)
          const definition = this.classes.get(id) ?? []
          definition.push(...styles)
          this.classes.set(id, definition)
        }
        return [this.keywordOf(statement)]
      }
      case "ErClassStatement":
        this.addClasses(
          statement.entities.map((name) => this.textOf(name)),
          statement.cssClasses.map((name) => this.textOf(name)),
        )
        return [this.keywordOf(statement)]
      case "ErStyleStatement":
        this.addStyles(
          statement.entities.map((name) => this.textOf(name)),
          statement.styles.map((style) => this.styleOf(style)),
        )
        return [this.keywordOf(statement)]
      case "ErAccTitleStatement": {
        const text = trimmed(this.text.of(statement.value.range))
        this.accTitle = this.replace(text)
        return [text]
      }
      case "ErAccDescrStatement": {
        const text = this.text.of(statement.value.range)
        this.accDescr = this.replace(descriptionOf(text))
        return [trimmed(text)]
      }
      case "ErAccDescrBlockStatement": {
        // A block without text changes nothing and returns no value.
        if (statement.value === null) return []
        const text = this.text.of(statement.value.range)
        this.accDescr = this.replace(descriptionOf(text))
        return [trimmed(text)]
      }
      // The direction is read from the list of statements: the last one of
      // the body (`lastDirectionOf()`). The statement returns no value.
      case "ErDirectionStatement":
        return []
      default:
        throw new Error(
          `er Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }

  /**
   * Entities: an entity statement adds the entity with its alias, then its
   * attributes, then its classes. Returns the name.
   */
  private executeEntity(statement: ErEntityStatement): string {
    const name = this.textOf(statement.name)
    const entity = this.addEntity(
      name,
      statement.alias === null ? "" : this.textOf(statement.alias),
    )
    for (const item of statement.attributes ?? []) {
      // Text in the block that mermaid.js does not read is no attribute.
      if (item.type === "ErAttribute") {
        entity.attributes.push(this.attributeSummary(item))
      }
    }
    this.addClasses([name], this.namesOf(statement.cssClasses))
    return name
  }

  /** Entities: adds the entity `name` when there is none; an empty alias is given the alias `alias`. */
  private addEntity(name: string, alias = ""): EntityEntry {
    let entity = this.entities.get(name)
    if (entity === undefined) {
      entity = {
        id: `entity-${name}-${this.entities.size}`,
        name,
        alias,
        attributes: [],
        classes: [],
        cssStyles: [],
      }
      this.entities.set(name, entity)
    } else if (entity.alias === "" && alias !== "") {
      entity.alias = alias
    }
    return entity
  }

  /** Attributes: the summary of one attribute. */
  private attributeSummary(attribute: ErAttribute): JsonObject {
    return {
      type: this.textOf(attribute.dataType) + (attribute.optional ? "?" : ""),
      name: this.textOf(attribute.name),
      keys: this.namesOf(attribute.keys),
      comment: attribute.comment === null ? "" : this.textOf(attribute.comment),
    }
  }

  /**
   * Relationships: a relationship statement adds its two entities, then the
   * relationship, then the classes of the left and of the right entity.
   * Returns the two names.
   */
  private executeRelationship(statement: ErRelationshipStatement): string[] {
    const left = this.textOf(statement.left.name)
    const right = this.textOf(statement.right.name)
    const leftEntity = this.addEntity(left)
    const rightEntity = this.addEntity(right)
    this.relationships.push({
      entityA: this.subGraphsById.has(left) ? left : leftEntity.id,
      roleA: this.textOf(statement.role),
      entityB: this.subGraphsById.has(right) ? right : rightEntity.id,
      cardA: CARDINALITY_NAMES[statement.relationship.rightCardinality],
      cardB: CARDINALITY_NAMES[statement.relationship.leftCardinality],
      relType: LINE_NAMES[statement.relationship.line],
    })
    this.addClasses([left], this.namesOf(statement.left.cssClasses))
    this.addClasses([right], this.namesOf(statement.right.cssClasses))
    return [left, right]
  }

  /**
   * Classes and styles: adds the classes `classNames` to each of `names`
   * that is an entity or a subgraph at this point; a name that is both gets
   * them in its entity and in its subgraph.
   */
  private addClasses(names: readonly string[], classNames: string[]): void {
    for (const name of names) {
      this.entities.get(name)?.classes.push(...classNames)
      this.subGraphsById.get(name)?.classes.push(...classNames)
    }
  }

  /** Classes and styles: adds the styles `styles` to each of `names` that is an entity or a subgraph at this point. */
  private addStyles(names: readonly string[], styles: string[]): void {
    for (const name of names) {
      this.entities.get(name)?.cssStyles.push(...styles)
      this.subGraphsById.get(name)?.cssStyles.push(...styles)
    }
  }

  /**
   * Subgraphs: executes the body of a subgraph, and adds the subgraph when
   * it ends. Returns its id.
   */
  private executeSubgraph(statement: ErSubgraphStatement): string {
    const idText = this.textOf(statement.id)
    const titleText =
      statement.title === null
        ? idText
        : statement.title.map((name) => this.textOf(name)).join(" ")
    const values = this.executeAll(statement.body)
    // The nodes: a value that is blank, or equals the trimmed text of an
    // earlier one, is dropped, then those that an earlier subgraph holds.
    const seen = new Set<string>()
    const listed: string[] = []
    for (const value of values) {
      const trimmedValue = trimmed(value)
      if (trimmedValue === "" || seen.has(trimmedValue)) continue
      seen.add(trimmedValue)
      listed.push(value)
    }
    const held = new Set(this.subGraphs.flatMap((subGraph) => subGraph.nodes))
    const id = trimmed(idText)
    const subGraph: SubGraphEntry = {
      id,
      nodes: listed.filter((node) => !held.has(node)),
      title: trimmed(this.replace(titleText)),
      classes: [],
      cssStyles: [],
      dir: lastDirectionOf(statement.body),
    }
    this.subGraphs.push(subGraph)
    this.subGraphsById.set(id, subGraph)
    return id
  }

  /**
   * The text of a name, a role, or an attribute word: the converted form of
   * its range, or, for a string, of its range between the delimiters.
   */
  private textOf(node: ErName | Identifier): string {
    if (node.type !== "StringLiteral") return this.text.of(node.range)
    const [start, end] = node.range
    return this.text.of([start + 1, end - 1])
  }

  /** The texts of the names `names`. */
  private namesOf(names: readonly (ErIdentifier | Identifier)[]): string[] {
    return names.map((name) => this.textOf(name))
  }

  /**
   * The value of a style: the converted forms of the tokens inside the
   * literal, joined; the whitespace between the units of a style is no value.
   */
  private styleOf(style: ErLiteral): string {
    return this.root.tokens
      .filter(
        (token) =>
          style.range[0] <= token.range[0] && token.range[1] <= style.range[1],
      )
      .map((token) => this.text.of(token.range))
      .join("")
  }

  /** The keyword at the start of a `class`, `classDef`, or `style` statement, as written. */
  private keywordOf(statement: ErStatement): string {
    const keyword = this.root.tokens.find(
      (token) =>
        statement.range[0] <= token.range[0] &&
        token.range[1] <= statement.range[1],
    )
    if (keyword === undefined) {
      throw new TreeError("er", statement.type, "a statement has no keyword")
    }
    return this.text.of(keyword.range)
  }
}

/** The direction of the last direction statement of `statements`; null when there is none. */
function lastDirectionOf(statements: readonly ErStatement[]): string | null {
  const directions = statements.flatMap((statement) =>
    statement.type === "ErDirectionStatement" ? [statement.direction] : [],
  )
  return directions.at(-1) ?? null
}

/**
 * docs/db-from-tree/er.md: the summary of the Db that the ER tree `diagram`
 * of the source `source` denotes (see `dbFromTree()`).
 */
export function erDbOf(
  source: string,
  root: TreeRoot,
  diagram: ErDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new ErDbBuilder(source, root, embedded).summaryOf(diagram)
}
