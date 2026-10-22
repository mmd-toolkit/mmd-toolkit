import type { Identifier, NodeBase } from "../../ast.ts"
import type {
  UsecaseActor,
  UsecaseEntity,
  UsecaseLabel,
  UsecaseMetadata,
  UsecaseStatement,
  UsecaseSystemBoundaryStatement,
} from "../../ast/usecase.ts"
import { isWordCharacter } from "../../character-classes.ts"
import { ParseError } from "../../errors.ts"
import type { ConvertedLeaf } from "./grammar.ts"

/** Only the symbol facts needed by the specification's model-validation rules. */
interface SymbolEntry {
  readonly kind: "actor" | "usecase" | "boundary" | "json" | "edge"
  readonly generated: boolean
  readonly label: string
  readonly labelType: "text" | "markdown"
  readonly node: NodeBase
  shape: "ellipse" | "rectangle" | null
  stereotype: string | null
  parent: string | null
  readonly properties: Map<string, string | boolean>
}

/** diagrams/usecase.md, Rejections outside the grammar: validate the complete diagram without resolving its AST. */
export class UsecaseRejections {
  private readonly converted: ReadonlyMap<ConvertedLeaf, string>

  private readonly symbols = new Map<string, SymbolEntry>()

  public constructor(converted: ReadonlyMap<ConvertedLeaf, string>) {
    this.converted = converted
  }

  /** Declare all authored symbols, infer otherwise unresolved endpoints, then apply updates and final checks. */
  public check(body: readonly UsecaseStatement[]): void {
    for (const statement of body) this.declareStatement(statement, null)
    for (const statement of body) {
      if (statement.type !== "UsecaseRelationshipStatement") continue
      this.endpoint(statement.source)
      this.endpoint(statement.target)
    }
    for (const statement of body) {
      switch (statement.type) {
        case "UsecaseRelationshipStatement":
          this.relationship(statement)
          break
        case "UsecaseNoteStatement": {
          const target = this.symbols.get(statement.target.name)
          if (target?.kind !== "actor" && target?.kind !== "usecase")
            this.reject(
              statement.target,
              "A note target must resolve to an actor or usecase",
            )
          break
        }
        case "UsecaseMetadataAssignmentStatement": {
          const target = this.symbols.get(this.targetId(statement.target))
          if (target === undefined)
            this.reject(
              statement.target,
              "A metadata target must resolve to a stored symbol",
            )
          this.metadata(target, statement.metadata, true)
          break
        }
        case "UsecaseClassStatement":
          for (const target of statement.targets) this.storedTarget(target)
          break
        case "UsecaseStyleStatement":
          this.storedTarget(statement.target)
          break
        default:
          break
      }
    }
    for (const symbol of this.symbols.values()) this.finalGeometry(symbol)
  }

  /** Written declaration occurrences only; relationship references do not redeclare a symbol. */
  private declareStatement(
    statement: UsecaseStatement,
    parent: string | null,
  ): void {
    switch (statement.type) {
      case "UsecaseActorStatement":
        for (const actor of statement.actors)
          this.element(actor, "actor", parent)
        break
      case "UsecaseEntityStatement":
        this.element(statement.entity, "usecase", parent)
        break
      case "UsecaseSystemBoundaryStatement": {
        const id = this.boundary(statement)
        for (const member of statement.body)
          this.declareStatement(member, id.length === 0 ? null : id)
        break
      }
      case "UsecaseJsonStatement":
        this.unique(statement.id.name, "json", statement.id)
        break
      case "UsecaseRelationshipStatement":
        if (this.isDeclaration(statement.source))
          this.element(
            statement.source,
            statement.source.type === "UsecaseActor" ? "actor" : "usecase",
            null,
          )
        if (this.isDeclaration(statement.target))
          this.element(statement.target, "usecase", null)
        if (statement.id !== null)
          this.unique(statement.id.name, "edge", statement.id)
        break
      default:
        break
    }
  }

  /** Metadata, stereotype or a shape makes an endpoint a declaration; a class suffix alone does not. */
  private isDeclaration(node: UsecaseActor | UsecaseEntity): boolean {
    return (
      node.type === "UsecaseActor" ||
      node.metadata !== null ||
      node.stereotype !== null ||
      node.shape !== null
    )
  }

  /** Generated ids replace each non-ASCII-word UTF-16 code unit separately. */
  private generatedId(label: UsecaseLabel): string {
    const value = this.text(label)
    let id = ""
    for (let index = 0; index < value.length; index += 1)
      id += isWordCharacter(value.charCodeAt(index)) ? value[index] : "_"
    return id
  }

  /** The id of a written occurrence, without inserting it into the tree. */
  private idOf(node: UsecaseActor | UsecaseEntity): string {
    return node.id?.name ?? this.generatedId(node.label!)
  }

  /** A quoted update target uses the same generated-id conversion as a quoted-only name. */
  private targetId(node: Identifier | UsecaseLabel): string {
    return node.type === "Identifier" ? node.name : this.generatedId(node)
  }

  /** Duplicate explicit elements must agree in their independently written declaration properties. */
  private element(
    node: UsecaseActor | UsecaseEntity,
    kind: "actor" | "usecase",
    parent: string | null,
  ): void {
    const id = this.idOf(node)
    const generated = node.id === null
    const label = node.label === null ? id : this.text(node.label)
    const labelType = node.label?.kind === "markdown" ? "markdown" : "text"
    const shape = node.type === "UsecaseEntity" ? node.shape : null
    const stereotype =
      node.stereotype === null ? null : this.text(node.stereotype).trim()
    let symbol = this.symbols.get(id)
    if (symbol !== undefined) {
      if (
        generated ||
        symbol.generated ||
        symbol.kind !== kind ||
        symbol.label !== label ||
        symbol.labelType !== labelType ||
        (shape !== null && symbol.shape !== null && shape !== symbol.shape) ||
        (stereotype !== null &&
          symbol.stereotype !== null &&
          stereotype !== symbol.stereotype)
      )
        this.reject(
          node,
          "An element declaration conflicts with an existing symbol",
        )
      if (parent !== null && symbol.parent !== null && parent !== symbol.parent)
        this.reject(node, "An element cannot belong to two nonempty boundaries")
      symbol.shape ??= shape
      symbol.stereotype ??= stereotype
      symbol.parent ??= parent
    } else {
      symbol = {
        kind,
        generated,
        label,
        labelType,
        shape,
        stereotype,
        parent,
        properties: new Map(),
        node,
      }
      this.symbols.set(id, symbol)
    }
    if (node.metadata !== null) this.metadata(symbol, node.metadata, false)
  }

  /** Boundaries share the symbol namespace; inline type is an update rather than a declaration conflict. */
  private boundary(node: UsecaseSystemBoundaryStatement): string {
    const id = node.id?.name ?? this.generatedId(node.title!)
    const label = node.title === null ? id : this.text(node.title)
    const labelType = node.title?.kind === "markdown" ? "markdown" : "text"
    let symbol = this.symbols.get(id)
    if (symbol !== undefined) {
      if (
        node.id === null ||
        symbol.generated ||
        symbol.kind !== "boundary" ||
        symbol.label !== label ||
        symbol.labelType !== labelType
      )
        this.reject(
          node,
          "A boundary declaration conflicts with an existing symbol",
        )
    } else {
      symbol = {
        kind: "boundary",
        generated: node.id === null,
        label,
        labelType,
        shape: null,
        stereotype: null,
        parent: null,
        properties: new Map(),
        node,
      }
      this.symbols.set(id, symbol)
    }
    if (node.metadata !== null) this.metadata(symbol, node.metadata, true)
    return id
  }

  /** JSON and authored edge ids are always unique, even against other symbol kinds. */
  private unique(id: string, kind: "json" | "edge", node: NodeBase): void {
    if (this.symbols.has(id))
      this.reject(node, "A JSON or explicit edge id must be unique")
    this.symbols.set(id, {
      kind,
      generated: false,
      label: id,
      labelType: "text",
      shape: null,
      stereotype: null,
      parent: null,
      properties: new Map(),
      node,
    })
  }

  /** Resolve over the complete diagram; a missing bare/quoted endpoint denotes an implicit usecase. */
  private endpoint(node: UsecaseActor | UsecaseEntity): SymbolEntry {
    const id = this.idOf(node)
    if (!this.isDeclaration(node) && node.classes.length > 0)
      this.reject(node, "A reference-only endpoint cannot have a class suffix")
    let symbol = this.symbols.get(id)
    if (symbol === undefined) {
      symbol = {
        kind: "usecase",
        generated: false,
        label: node.label === null ? id : this.text(node.label),
        labelType: node.label?.kind === "markdown" ? "markdown" : "text",
        shape: null,
        stereotype: null,
        parent: null,
        properties: new Map(),
        node,
      }
      this.symbols.set(id, symbol)
    }
    return symbol
  }

  /** Semantic operators constrain endpoint kinds; JSON allows only the three point/markerless associations. */
  private relationship(
    node: Extract<UsecaseStatement, { type: "UsecaseRelationshipStatement" }>,
  ): void {
    const source = this.endpoint(node.source)
    const target = this.endpoint(node.target)
    if (
      source.kind === "boundary" ||
      source.kind === "edge" ||
      target.kind === "boundary" ||
      target.kind === "edge"
    )
      this.reject(
        node,
        "A relationship cannot connect a boundary or explicit edge",
      )
    if (node.kind === "include" || node.kind === "extend") {
      if (source.kind !== "usecase" || target.kind !== "usecase")
        this.reject(node, "Include and extend require two usecases")
    } else if (node.kind === "generalization") {
      if (
        source.kind !== target.kind ||
        source.kind === "json" ||
        target.kind === "json"
      )
        this.reject(
          node,
          "Generalization requires two actors or two usecases of the same kind",
        )
    } else if (source.kind === "json" || target.kind === "json") {
      const start = node.opening?.startMarker ?? node.arrow.startMarker
      const end = node.arrow.endMarker
      if (!(
        (start === "none" && (end === "none" || end === "arrow")) ||
        (start === "arrow" && end === "none")
      ))
        this.reject(node, "JSON permits only point or markerless associations")
    }
  }

  /** Style and class target lists may name any stored symbol, including an explicit edge. */
  private storedTarget(node: Identifier): void {
    if (!this.symbols.has(node.name))
      this.reject(
        node,
        "A class or style target must resolve to a stored symbol",
      )
  }

  /** Native metadata has diagram-defined keys, scalar types and accepted values; embedded JSON rules do not apply. */
  private metadata(
    symbol: SymbolEntry,
    metadata: UsecaseMetadata,
    update: boolean,
  ): void {
    for (const property of metadata.properties) {
      const key = this.text(property.key)
      const written = this.text(property.value)
      const boolean =
        property.value.type === "Identifier" &&
        (written === "true" || written === "false")
      const value = boolean ? written === "true" : written
      let valid = false
      switch (symbol.kind) {
        case "actor":
          valid =
            key === "business"
              ? boolean
              : key === "type"
                ? !boolean && ["normal", "hollow", "awesome"].includes(written)
                : key === "icon" && !boolean
          break
        case "usecase":
          valid = key === "business" && boolean
          break
        case "boundary":
          valid =
            key === "type" && !boolean && ["rect", "package"].includes(written)
          break
        case "edge":
          valid =
            key === "animate"
              ? boolean
              : key === "animation" &&
                !boolean &&
                ["fast", "slow"].includes(written)
          break
        case "json":
          break
        default:
          throw new Error(
            `mmd-toolkit parser bug: unknown usecase symbol ${symbol.kind satisfies never}`,
          )
      }
      if (!valid)
        this.reject(
          property,
          "The native metadata property is invalid for its target",
        )
      const earlier = symbol.properties.get(key)
      if (!update && earlier !== undefined && earlier !== value)
        this.reject(property, "Repeated declaration metadata values must agree")
      symbol.properties.set(key, value)
    }
  }

  /** Geometry is validated only after all standalone updates; invalid individual properties already rejected. */
  private finalGeometry(symbol: SymbolEntry): void {
    const type = symbol.properties.get("type")
    const icon = symbol.properties.get("icon")
    const business = symbol.properties.get("business")
    if (symbol.kind === "actor") {
      if (
        typeof icon === "string" &&
        icon.length > 0 &&
        type !== undefined &&
        type !== "normal"
      )
        this.reject(
          symbol.node,
          "An actor icon cannot coexist with a non-normal explicit type",
        )
      if (
        business === true &&
        ((typeof icon === "string" && icon.length > 0) ||
          (type !== undefined && type !== "normal" && type !== "hollow"))
      )
        this.reject(
          symbol.node,
          "A business actor must have normal or hollow geometry",
        )
    } else if (
      symbol.kind === "usecase" &&
      symbol.shape === "rectangle" &&
      business === true
    )
      this.reject(symbol.node, "A rectangle cannot be a business usecase")
  }

  /** The lexer's converted value, rather than a second reading of authored AST text. */
  private text(node: ConvertedLeaf): string {
    const value = this.converted.get(node)
    if (value === undefined)
      throw new Error("mmd-toolkit parser bug: missing converted usecase value")
    return value
  }

  /** Model errors identify the offending written occurrence. */
  private reject(node: NodeBase, message: string): never {
    throw new ParseError(message, node.range, node.loc)
  }
}
