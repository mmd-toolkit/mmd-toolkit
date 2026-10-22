import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { isWordCharacter } from "./characters.ts"
import {
  ConvertedText,
  convertedValuesOf,
  readConvertedCharacters,
} from "./converted-text.ts"
import type { ConvertedValueReader } from "./converted-text.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { Identifier, StringLiteral, TreeNode, TreeRoot } from "./tree.ts"
import { TreeError } from "./tree.ts"
import type {
  UsecaseActor,
  UsecaseDiagram,
  UsecaseEntity,
  UsecaseLabel,
  UsecaseLiteral,
  UsecaseMetadata,
  UsecaseRelationshipStatement,
  UsecaseStatement,
  UsecaseStyleDeclaration,
  UsecaseSystemBoundaryStatement,
} from "./usecase-tree.ts"
import { descriptionOf, trimmed } from "./values.ts"

/** A native-model rejection, retaining the written occurrence for checkTree. */
export class UsecaseModelError extends TreeError {
  public readonly node: TreeNode

  public constructor(node: TreeNode, message: string) {
    super("usecase", node.type, message)
    this.node = node
  }
}

/** The shared symbol namespace; class definitions have their own map. */
type Kind = "actor" | "usecase" | "boundary" | "json" | "edge"

/** Stored fields plus declaration constraints, before final actor geometry is chosen. */
interface Symbol {
  readonly kind: Kind
  readonly node: TreeNode
  readonly generated: boolean
  readonly data: Record<string, unknown>
  readonly metadata: Map<string, string | boolean>
  shape: string | null
  stereotype: string | null
}

/** A quoted label's generated id replaces each non-word UTF-16 code unit with an underscore. */
function generatedIdOf(value: string): string {
  let id = ""
  for (let at = 0; at < value.length; at++)
    id += isWordCharacter(value.charCodeAt(at)) ? value.charAt(at) : "_"
  return id
}

/** docs/db-from-tree/usecase.md: source occurrences resolve over the complete diagram. */
class UsecaseModel {
  private readonly symbols = new Map<string, Symbol>()

  private readonly first = new Map<string, number>()

  private readonly relationships: {
    readonly node: UsecaseRelationshipStatement
    readonly data: Record<string, unknown>
  }[] = []

  private readonly jsonIds: string[] = []

  private readonly classDefs = new Map<string, JsonObject>()

  private readonly readValue: ConvertedValueReader

  private readonly converted: ConvertedText

  public constructor(source: string, root: TreeRoot) {
    this.readValue = convertedValuesOf(source, root, "usecase")
    this.converted = new ConvertedText(readConvertedCharacters(source, root))
  }

  /** Written values are converted once; their AST values retain the original spelling. */
  private text(
    node: Identifier | StringLiteral | UsecaseLabel | UsecaseLiteral,
  ): string {
    const value = node.type === "Identifier" ? node.name : node.value
    const delimiters =
      node.type === "StringLiteral"
        ? 1
        : node.type === "UsecaseLabel"
          ? node.kind === "markdown"
            ? 2
            : node.kind === "string"
              ? 1
              : 0
          : 0
    return this.readValue(node.range, value, delimiters)
  }

  /** An explicit id or the generated id of a quoted-only name. */
  private id(
    node: UsecaseActor | UsecaseEntity | UsecaseSystemBoundaryStatement,
  ): string {
    if (node.id !== null) return this.text(node.id)
    const label =
      node.type === "UsecaseSystemBoundaryStatement" ? node.title : node.label
    if (label === null)
      throw new UsecaseModelError(node, "a name needs an id or label")
    return generatedIdOf(this.text(label))
  }

  /** A metadata label target has the same generated name conversion as an element name. */
  private target(node: Identifier | UsecaseLabel): string {
    return node.type === "Identifier"
      ? this.text(node)
      : generatedIdOf(this.text(node))
  }

  /** Only declarations and relationship endpoints establish first-occurrence order. */
  private touch(id: string): void {
    if (!this.first.has(id)) this.first.set(id, this.first.size)
  }

  /** A stored target must exist; metadata/classes/styles do not create one. */
  private require(id: string, node: TreeNode): Symbol {
    const symbol = this.symbols.get(id)
    if (symbol === undefined)
      throw new UsecaseModelError(
        node,
        `unresolved target ${JSON.stringify(id)}`,
      )
    return symbol
  }

  /** Native keys, scalar types, and per-kind vocabularies are syntax, not embedded data. */
  private metadata(
    symbol: Symbol,
    block: UsecaseMetadata | null,
    declaration: boolean,
  ): void {
    if (block === null) return
    const allowed: Readonly<Record<Kind, readonly string[]>> = {
      actor: ["type", "icon", "business"],
      usecase: ["business"],
      boundary: ["type"],
      edge: ["animate", "animation"],
      json: [],
    }
    for (const property of block.properties) {
      const key = this.text(property.key)
      const raw = this.text(property.value)
      const value =
        property.value.type === "Identifier" &&
        (raw === "true" || raw === "false")
          ? raw === "true"
          : raw
      if (!allowed[symbol.kind].includes(key))
        throw new UsecaseModelError(
          property,
          `unknown ${symbol.kind} metadata key ${JSON.stringify(key)}`,
        )
      const boolean = key === "business" || key === "animate"
      if (boolean ? typeof value !== "boolean" : typeof value !== "string")
        throw new UsecaseModelError(
          property,
          `metadata ${key} has the wrong scalar type`,
        )
      if (
        (key === "type" &&
          !(
            symbol.kind === "actor"
              ? ["normal", "hollow", "awesome"]
              : ["rect", "package"]
          ).includes(String(value))) ||
        (key === "animation" && !["fast", "slow"].includes(String(value)))
      )
        throw new UsecaseModelError(
          property,
          `metadata ${key} has an invalid value`,
        )
      const old = symbol.metadata.get(key)
      if (
        declaration &&
        ["actor", "usecase"].includes(symbol.kind) &&
        old !== undefined &&
        old !== value
      )
        throw new UsecaseModelError(
          property,
          `conflicting declaration metadata ${key}`,
        )
      symbol.metadata.set(key, value)
    }
  }

  /** Repeated explicit declarations merge compatible fields and accumulate suffix classes. */
  private declareElement(
    node: UsecaseActor | UsecaseEntity | UsecaseSystemBoundaryStatement,
    parent = "",
  ): void {
    const kind: Kind =
      node.type === "UsecaseActor"
        ? "actor"
        : node.type === "UsecaseEntity"
          ? "usecase"
          : "boundary"
    const id = this.id(node)
    this.touch(id)
    const label =
      node.type === "UsecaseSystemBoundaryStatement" ? node.title : node.label
    const text = label === null ? id : this.text(label)
    const labelType = label?.kind === "markdown" ? "markdown" : "text"
    const shape =
      node.type === "UsecaseEntity"
        ? node.shape === "rectangle"
          ? "rect"
          : node.shape
        : null
    const stereotype =
      node.type === "UsecaseSystemBoundaryStatement" || node.stereotype === null
        ? null
        : trimmed(this.text(node.stereotype))
    let symbol = this.symbols.get(id)
    const firstDeclaration = symbol === undefined
    if (symbol !== undefined) {
      if (symbol.kind !== kind || symbol.generated || node.id === null)
        throw new UsecaseModelError(
          node,
          `duplicate or conflicting symbol ${JSON.stringify(id)}`,
        )
      if (symbol.data.label !== text || symbol.data.labelType !== labelType)
        throw new UsecaseModelError(
          node,
          "repeated declarations have incompatible labels",
        )
      if (shape !== null && symbol.shape !== null && shape !== symbol.shape)
        throw new UsecaseModelError(
          node,
          "repeated declarations have incompatible shapes",
        )
      if (
        stereotype !== null &&
        symbol.stereotype !== null &&
        stereotype !== symbol.stereotype
      )
        throw new UsecaseModelError(
          node,
          "repeated declarations have incompatible stereotypes",
        )
      if (
        parent !== "" &&
        symbol.data.parentId !== undefined &&
        symbol.data.parentId !== parent
      )
        throw new UsecaseModelError(
          node,
          "an element belongs to two boundaries",
        )
    } else {
      symbol = {
        kind,
        node,
        generated: node.id === null,
        data: { id, label: text, labelType, classes: [], styles: [] },
        metadata: new Map(),
        shape: null,
        stereotype: null,
      }
      this.symbols.set(id, symbol)
    }
    symbol.shape ??= shape
    symbol.stereotype ??= stereotype
    if (parent !== "") symbol.data.parentId = parent
    const classes = symbol.data.classes as string[]
    for (const name of node.classes.map((identifier) => this.text(identifier)))
      if (firstDeclaration || !classes.includes(name)) classes.push(name)
    this.metadata(symbol, node.metadata, true)
  }

  /** Bare/quoted endpoints refer unless their native declaration fields say otherwise. */
  private endpoint(node: UsecaseActor | UsecaseEntity): void {
    const id = this.id(node)
    this.touch(id)
    if (
      node.type === "UsecaseActor" ||
      node.metadata !== null ||
      node.stereotype !== null ||
      node.shape !== null
    )
      this.declareElement(node)
    else if (node.classes.length !== 0)
      throw new UsecaseModelError(
        node,
        "class suffix on a reference-only endpoint",
      )
  }

  /** Record declarations first, reserving JSON and explicit-edge ids in the same namespace. */
  private collect(
    statement: UsecaseStatement,
    parent = "",
    inBoundary = false,
  ): void {
    switch (statement.type) {
      case "UsecaseActorStatement":
        for (const actor of statement.actors) this.declareElement(actor, parent)
        break
      case "UsecaseEntityStatement":
        if (
          !inBoundary &&
          statement.entity.id !== null &&
          [
            "allowmixing",
            "newpage",
            "package",
            "rectangle",
            "skinparam",
          ].includes(this.text(statement.entity.id).toLowerCase())
        )
          throw new UsecaseModelError(
            statement.entity,
            "forbidden standalone entity name",
          )
        this.declareElement(statement.entity, parent)
        break
      case "UsecaseSystemBoundaryStatement":
        this.declareElement(statement)
        for (const member of statement.body)
          this.collect(member, this.id(statement), true)
        break
      case "UsecaseRelationshipStatement": {
        this.endpoint(statement.source)
        this.endpoint(statement.target)
        const start =
          statement.opening?.startMarker ?? statement.arrow.startMarker
        const end = statement.arrow.endMarker
        const arrowType =
          start === "arrow"
            ? 1
            : start === "circle"
              ? 5
              : start === "cross"
                ? 6
                : end === "circle"
                  ? 3
                  : end === "cross"
                    ? 4
                    : end === "none"
                      ? 2
                      : 0
        const data: Record<string, unknown> = {
          ...(statement.id === null ? {} : { id: this.text(statement.id) }),
          source: this.id(statement.source),
          target: this.id(statement.target),
          type: statement.kind,
          arrowType: statement.kind === "association" ? arrowType : 0,
          ...(statement.label === null
            ? statement.kind === "include" || statement.kind === "extend"
              ? { label: statement.kind, labelType: "text" }
              : {}
            : {
                label: this.text(statement.label),
                labelType:
                  statement.label.kind === "markdown" ? "markdown" : "text",
              }),
          minlen:
            statement.kind === "association" &&
            ![3, 4, 5, 6].includes(arrowType)
              ? statement.arrow.length - 1
              : 1,
          classes: [],
          styles: [],
          animate: false,
        }
        if (statement.id !== null) {
          const id = this.text(statement.id)
          if (this.symbols.has(id))
            throw new UsecaseModelError(
              statement.id,
              "duplicate explicit edge id",
            )
          this.symbols.set(id, {
            kind: "edge",
            node: statement,
            generated: false,
            data,
            metadata: new Map(),
            shape: null,
            stereotype: null,
          })
        }
        this.relationships.push({ node: statement, data })
        break
      }
      case "UsecaseJsonStatement": {
        const id = this.text(statement.id)
        this.touch(id)
        if (this.symbols.has(id))
          throw new UsecaseModelError(statement.id, "duplicate JSON id")
        this.symbols.set(id, {
          kind: "json",
          node: statement,
          generated: false,
          data: {
            id,
            classes: statement.classes.map((identifier) =>
              this.text(identifier),
            ),
            styles: [],
          },
          metadata: new Map(),
          shape: null,
          stereotype: null,
        })
        this.jsonIds.push(id)
        break
      }
      default:
        break
    }
  }

  /** Resolve all endpoints after declarations, then apply source-ordered standalone updates. */
  private resolve(diagram: UsecaseDiagram): void {
    for (const { node } of this.relationships) {
      for (const endpoint of [node.source, node.target]) {
        const id = this.id(endpoint)
        if (!this.symbols.has(id))
          this.symbols.set(id, {
            kind: "usecase",
            node: endpoint,
            generated: false,
            data: {
              id,
              label: endpoint.label === null ? id : this.text(endpoint.label),
              labelType:
                endpoint.label?.kind === "markdown" ? "markdown" : "text",
              classes: [],
              styles: [],
            },
            metadata: new Map(),
            shape: null,
            stereotype: null,
          })
      }
      const source = this.require(this.id(node.source), node.source)
      const target = this.require(this.id(node.target), node.target)
      if (
        [source.kind, target.kind].some(
          (kind) => kind === "boundary" || kind === "edge",
        )
      )
        throw new UsecaseModelError(
          node,
          "relationship endpoint is not an actor, usecase or JSON table",
        )
      if (
        (node.kind === "include" || node.kind === "extend") &&
        (source.kind !== "usecase" || target.kind !== "usecase")
      )
        throw new UsecaseModelError(
          node,
          "include/extend requires two usecases",
        )
      if (
        node.kind === "generalization" &&
        (source.kind !== target.kind ||
          !["actor", "usecase"].includes(source.kind))
      )
        throw new UsecaseModelError(
          node,
          "generalization requires two actors or two usecases",
        )
      if (
        (source.kind === "json" || target.kind === "json") &&
        (node.kind !== "association" ||
          ["circle", "cross"].includes(
            node.opening?.startMarker ?? node.arrow.startMarker,
          ) ||
          ["circle", "cross"].includes(node.arrow.endMarker))
      )
        throw new UsecaseModelError(
          node,
          "JSON tables require a point or markerless association",
        )
    }
    for (const statement of diagram.body) {
      if (statement.type === "UsecaseMetadataAssignmentStatement")
        this.metadata(
          this.require(this.target(statement.target), statement.target),
          statement.metadata,
          false,
        )
      else if (statement.type === "UsecaseClassStatement") {
        for (const target of statement.targets) {
          const classes = this.require(this.text(target), target).data
            .classes as string[]
          for (const name of statement.classes.map((identifier) =>
            this.text(identifier),
          ))
            if (!classes.includes(name)) classes.push(name)
        }
      } else if (statement.type === "UsecaseStyleStatement") {
        ;(
          this.require(this.text(statement.target), statement.target).data
            .styles as string[]
        ).push(...this.styles(statement.styles))
      } else if (statement.type === "UsecaseClassDefStatement") {
        for (const name of statement.classes) {
          const id = this.text(name)
          this.classDefs.set(id, { id, styles: this.styles(statement.styles) })
        }
      } else if (statement.type === "UsecaseNoteStatement") {
        const target = this.require(
          this.text(statement.target),
          statement.target,
        )
        if (target.kind !== "actor" && target.kind !== "usecase")
          throw new UsecaseModelError(
            statement.target,
            "a note requires an actor or usecase target",
          )
      }
    }
    for (const symbol of this.symbols.values()) {
      const meta = symbol.metadata
      if (symbol.kind === "actor") {
        const type = meta.get("type") ?? "normal"
        const icon = meta.get("icon") ?? ""
        const business = meta.get("business") ?? false
        if (icon !== "" && type !== "normal")
          throw new UsecaseModelError(
            symbol.node,
            "a nonempty icon conflicts with the explicit actor type",
          )
        if (
          business === true &&
          (icon !== "" || !["normal", "hollow"].includes(String(type)))
        )
          throw new UsecaseModelError(
            symbol.node,
            "business actor requires normal or hollow geometry",
          )
        symbol.data.type = icon === "" ? type : "icon"
        if (icon !== "") symbol.data.icon = icon
        symbol.data.business = business
      } else if (symbol.kind === "usecase") {
        symbol.data.shape = symbol.shape ?? "ellipse"
        symbol.data.business = meta.get("business") ?? false
        if (symbol.data.business === true && symbol.data.shape === "rect")
          throw new UsecaseModelError(
            symbol.node,
            "a rectangle cannot be a business usecase",
          )
      } else if (symbol.kind === "boundary")
        symbol.data.type = meta.get("type") ?? "rect"
      else if (symbol.kind === "edge") {
        const animation = meta.get("animation")
        symbol.data.animate =
          animation !== undefined || meta.get("animate") === true
        if (animation !== undefined) symbol.data.animation = animation
      }
      if (symbol.stereotype !== null) symbol.data.stereotype = symbol.stereotype
    }
  }

  /** CSS values are kept as text; only escaped commas are converted, then exterior padding is trimmed. */
  private styles(styles: readonly UsecaseStyleDeclaration[]): string[] {
    return styles.map((style) =>
      trimmed(this.converted.of(style.range)).replaceAll("\\,", ","),
    )
  }

  /** Validated native model, without reading or requiring any JSON interiors. */
  public build(diagram: UsecaseDiagram): void {
    for (const statement of diagram.body) this.collect(statement)
    this.resolve(diagram)
  }

  /** Effects are consumed in source order; summary maps are independently sorted by first occurrence. */
  public summary(diagram: UsecaseDiagram, embedded: EmbeddedValues): DbSummary {
    this.build(diagram)
    if (embedded.dataBlockEffects.length !== this.jsonIds.length)
      throw new Error(
        "usecase Db: JSON blocks and dataBlockEffects have different counts",
      )
    for (const [index, id] of this.jsonIds.entries()) {
      const effect = embedded.dataBlockEffects[index]
      if (
        effect?.id !== id ||
        !Object.hasOwn(effect.set, "value") ||
        !Object.hasOwn(effect.set, "propertyOrder")
      )
        throw new Error(
          `usecase Db: missing or mismatched JSON effect for ${JSON.stringify(id)}`,
        )
      const data = this.require(id, diagram).data
      data.value = effect.set.value
      data.propertyOrder = effect.set.propertyOrder
    }
    const sorted = [...this.symbols.entries()]
      .sort(
        ([a], [b]) =>
          (this.first.get(a) ?? Infinity) - (this.first.get(b) ?? Infinity),
      )
      .map(([, symbol]) => symbol)

    /** Stored records in the independent first-occurrence order of this kind. */
    function records(kind: Kind): JsonObject[] {
      return sorted
        .filter((symbol) => symbol.kind === kind)
        .map((symbol) => symbol.data as JsonObject)
    }

    const replace = textReplacementOf(embedded.config)
    let direction = "LR"
    let accTitle = ""
    let accDescr = ""
    const notes: JsonObject[] = []
    for (const statement of diagram.body) {
      if (statement.type === "UsecaseDirectionStatement")
        direction = statement.direction === "TD" ? "TB" : statement.direction
      else if (statement.type === "UsecaseAccTitleStatement")
        accTitle = replace(
          trimmed(statement.value === null ? "" : this.text(statement.value)),
        )
      else if (
        statement.type === "UsecaseAccDescrStatement" ||
        statement.type === "UsecaseAccDescrBlockStatement"
      )
        accDescr = replace(
          descriptionOf(
            statement.value === null ? "" : this.text(statement.value),
          ),
        )
      else if (statement.type === "UsecaseNoteStatement")
        notes.push({
          target: this.text(statement.target),
          label: this.text(statement.label),
          labelType: statement.label.kind === "markdown" ? "markdown" : "text",
        })
    }
    return {
      direction,
      title: "",
      accTitle,
      accDescr,
      actors: records("actor"),
      useCases: records("usecase"),
      systemBoundaries: records("boundary"),
      relationships: this.relationships.map(({ data }) => data as JsonObject),
      notes,
      jsonNodes: records("json"),
      classDefs: [...this.classDefs.values()],
    }
  }
}

/** Native acceptance conditions shared by checkTree; opaque JSON values are neither read nor fabricated. */
export function validateUsecaseModel(
  source: string,
  root: TreeRoot,
  diagram: UsecaseDiagram,
): void {
  new UsecaseModel(source, root).build(diagram)
}

/** docs/db-from-tree/usecase.md: the stored Db, with JSON values supplied only by Mermaid effects. */
export function usecaseDbOf(
  source: string,
  root: TreeRoot,
  diagram: UsecaseDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new UsecaseModel(source, root).summary(diagram, embedded)
}
