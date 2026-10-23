import type { StringLiteral } from "../../ast.ts"
import type {
  C4Argument,
  C4BoundaryKeyword,
  C4ElementKeyword,
  C4Literal,
  C4NamedAttribute,
  C4RelationshipKeyword,
  C4UpdateKeyword,
} from "../../ast/c4.ts"
import { ParseError } from "../../errors.ts"

/** A target's identity, with named arguments compared by object identity. */
type Target = string | number | C4NamedAttribute | undefined

/** Only the identity needed to find an element-style target is retained. */
interface ElementTarget {
  alias: Target
}

/** Only the ordered endpoints needed to find a relationship-style target are retained. */
interface RelationshipTarget {
  from: Target
  to: Target
}

/** Person/system consumed positions, counted from one. */
const PERSON_SYSTEM_POSITIONS: readonly number[] = [3, 4, 5, 6]

/** Container/component consumed positions. */
const ELEMENT_POSITIONS: readonly number[] = [3, 4, 5, 6, 7]

/** Generic boundary consumed positions. */
const BOUNDARY_POSITIONS: readonly number[] = [3, 4, 5]

/** Fixed boundary consumed positions. */
const FIXED_BOUNDARY_POSITIONS: readonly number[] = [3, 4]

/** Deployment-node consumed positions, excluding its ignored sprite slot. */
const NODE_POSITIONS: readonly number[] = [3, 4, 6, 7]

/** Ordinary relationship consumed positions. */
const RELATIONSHIP_POSITIONS: readonly number[] = [4, 5, 6, 7, 8]

/** RelIndex consumed positions, after its written index. */
const INDEX_POSITIONS: readonly number[] = [5, 6, 7, 8, 9]

/** Existing element-style target consumed positions. */
const ELEMENT_STYLE_POSITIONS: readonly number[] = [2, 3, 4, 5, 6, 7, 8, 9, 10]

/** Existing relationship-style target consumed positions. */
const REL_STYLE_POSITIONS: readonly number[] = [3, 4, 5, 6]

/**
 * diagrams/c4.md, Rejections outside the grammar: only consumed __proto__
 * attributes reject. The same section defines style targets: the first shape,
 * otherwise boundary (including global), or the first ordered endpoint pair,
 * using their current values as assigned before the update by declarations,
 * named attributes, and redefinitions. Match converted, trimmed strings
 * strictly and named attributes by object identity. Keep only aliases and
 * endpoints needed to find those targets.
 */
export class C4Rejections {
  private readonly converted: ReadonlyMap<C4Literal | StringLiteral, string>

  private readonly shapes: ElementTarget[] = []

  private readonly boundaries: ElementTarget[] = [{ alias: "global" }]

  private readonly relationships: RelationshipTarget[] = []

  public constructor(
    converted: ReadonlyMap<C4Literal | StringLiteral, string>,
  ) {
    this.converted = converted
  }

  /** Person/system consume 3-6, container/component consume 3-7. */
  public element(keyword: C4ElementKeyword, args: readonly C4Argument[]): void {
    const positions =
      keyword.startsWith("Person") || keyword.startsWith("System")
        ? PERSON_SYSTEM_POSITIONS
        : ELEMENT_POSITIONS
    this.rejectProto(args, positions)
    this.declareElement(this.shapes, args, positions)
  }

  /** The eight boundary keywords consume the positions in the specification's table. */
  public boundary(
    keyword: C4BoundaryKeyword,
    args: readonly C4Argument[],
  ): void {
    const positions =
      keyword === "Boundary"
        ? BOUNDARY_POSITIONS
        : keyword === "Enterprise_Boundary" ||
            keyword === "System_Boundary" ||
            keyword === "Container_Boundary"
          ? FIXED_BOUNDARY_POSITIONS
          : NODE_POSITIONS
    this.rejectProto(args, positions)
    this.declareElement(this.boundaries, args, positions)
  }

  /** A relationship is stored only with its required three arguments, after RelIndex's index. */
  public relationship(
    keyword: C4RelationshipKeyword,
    args: readonly C4Argument[],
  ): void {
    const offset = keyword === "RelIndex" ? 1 : 0
    if (args.length < offset + 3) return
    const positions = offset === 1 ? INDEX_POSITIONS : RELATIONSHIP_POSITIONS
    this.rejectProto(args, positions)
    const from = this.targetOf(args[offset])
    const to = this.targetOf(args[offset + 1])
    let target = this.relationships.find(
      (entry) => entry.from === from && entry.to === to,
    )
    if (target === undefined) {
      target = { from, to }
      this.relationships.push(target)
    }
    this.updateEndpoints(target, args, positions, false)
  }

  /** Updates reject only where their target already exists; layout has no rejection. */
  public update(keyword: C4UpdateKeyword, args: readonly C4Argument[]): void {
    if (keyword === "UpdateLayoutConfig") return
    if (keyword === "UpdateElementStyle") {
      const alias = this.targetOf(args[0])
      const target =
        this.shapes.find((entry) => entry.alias === alias) ??
        this.boundaries.find((entry) => entry.alias === alias)
      if (target === undefined) return
      this.rejectProto(args, ELEMENT_STYLE_POSITIONS)
      this.updateAlias(target, args, ELEMENT_STYLE_POSITIONS)
      return
    }
    const from = this.targetOf(args[0])
    const to = this.targetOf(args[1])
    const target = this.relationships.find(
      (entry) => entry.from === from && entry.to === to,
    )
    if (target === undefined) return
    this.rejectProto(args, REL_STYLE_POSITIONS)
    this.updateEndpoints(target, args, REL_STYLE_POSITIONS, true)
  }

  /** Rejections outside the grammar: a redefinition selects the first current alias before its new assignments. */
  private declareElement(
    entries: ElementTarget[],
    args: readonly C4Argument[],
    positions: readonly number[],
  ): void {
    const alias = this.targetOf(args[0])
    let target = entries.find((entry) => entry.alias === alias)
    if (target === undefined) {
      target = { alias }
      entries.push(target)
    }
    this.updateAlias(target, args, positions)
  }

  /** Rejections outside the grammar: a consumed named alias replaces the current comparison alias. */
  private updateAlias(
    target: ElementTarget,
    args: readonly C4Argument[],
    positions: readonly number[],
  ): void {
    for (const position of positions) {
      const arg = args[position - 1]
      if (arg?.type === "C4NamedAttribute" && this.keyOf(arg) === "alias") {
        target.alias = this.textOf(arg.value)
      }
    }
  }

  /**
   * Rejections outside the grammar: consumed named assignments replace current
   * endpoints. UpdateRelStyle positions 5 and 6 leave numeric endpoints; NaN
   * represents them because no later argument can match them.
   */
  private updateEndpoints(
    target: RelationshipTarget,
    args: readonly C4Argument[],
    positions: readonly number[],
    style: boolean,
  ): void {
    for (const position of positions) {
      const arg = args[position - 1]
      if (arg?.type !== "C4NamedAttribute") continue
      const key = this.keyOf(arg)
      if (key !== "from" && key !== "to") continue
      target[key] = style && position >= 5 ? Number.NaN : this.textOf(arg.value)
    }
  }

  /** A trimmed __proto__ key in a consumed position is reported at the key. */
  private rejectProto(
    args: readonly C4Argument[],
    positions: readonly number[],
  ): void {
    for (const position of positions) {
      const arg = args[position - 1]
      if (
        arg?.type === "C4NamedAttribute" &&
        this.keyOf(arg) === "__proto__" &&
        arg.key !== null
      ) {
        throw new ParseError(
          "A consumed named attribute cannot have the key __proto__",
          arg.key.range,
          arg.key.loc,
        )
      }
    }
  }

  /** Required positions keep named objects distinct and read empty entries as empty text. */
  private targetOf(arg: C4Argument | undefined): Target {
    if (arg === undefined) return undefined
    if (arg === null) return ""
    return arg.type === "C4NamedAttribute" ? arg : this.textOf(arg)
  }

  /** The converted trimmed key; an empty key is the empty text. */
  private keyOf(arg: C4NamedAttribute): string {
    return arg.key === null ? "" : this.textOf(arg.key)
  }

  /** The converted value decided by the lexer, never reconstructed from written node text. */
  private textOf(node: C4Literal | StringLiteral): string {
    const text = this.converted.get(node)
    if (text === undefined)
      throw new Error("mmd-toolkit parser bug: no converted C4 value")
    return text
  }
}
