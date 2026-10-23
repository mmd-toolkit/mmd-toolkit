import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import type {
  C4Argument,
  C4BoundaryStatement,
  C4Diagram,
  C4ElementStatement,
  C4Literal,
  C4RelationshipStatement,
  C4Statement,
  C4UpdateStatement,
} from "./c4-tree.ts"
import { convertedValuesOf } from "./converted-text.ts"
import type { ConvertedValueReader } from "./converted-text.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TextReplacement } from "./text-replacement.ts"
import type { StringLiteral, TreeRoot } from "./tree.ts"
import { TreeError } from "./tree.ts"
import { setOwnProperty, trimmed } from "./values.ts"

/** db-summaries.md, c4, Statement readings: the shape names of the twenty keywords. */
const SHAPE_TYPES: Readonly<Record<string, string>> = {
  Person: "person",
  Person_Ext: "external_person",
  System: "system",
  SystemDb: "system_db",
  SystemQueue: "system_queue",
  System_Ext: "external_system",
  SystemDb_Ext: "external_system_db",
  SystemQueue_Ext: "external_system_queue",
  Container: "container",
  ContainerDb: "container_db",
  ContainerQueue: "container_queue",
  Container_Ext: "external_container",
  ContainerDb_Ext: "external_container_db",
  ContainerQueue_Ext: "external_container_queue",
  Component: "component",
  ComponentDb: "component_db",
  ComponentQueue: "component_queue",
  Component_Ext: "external_component",
  ComponentDb_Ext: "external_component_db",
  ComponentQueue_Ext: "external_component_queue",
}

/** db-summaries.md, c4, Statement readings: direction synonyms share the stored type. */
const REL_TYPES: Readonly<Record<string, string>> = {
  Rel: "rel",
  BiRel: "birel",
  Rel_U: "rel_u",
  Rel_Up: "rel_u",
  Rel_D: "rel_d",
  Rel_Down: "rel_d",
  Rel_L: "rel_l",
  Rel_Left: "rel_l",
  Rel_R: "rel_r",
  Rel_Right: "rel_r",
  Rel_Back: "rel_b",
  RelIndex: "rel",
}

/** db-summaries.md, c4: these optional attribute names wrap their value in { text }. */
const TEXT_FIELDS: readonly string[] = ["label", "descr", "techn", "type"]

/** A converted argument; a named argument keeps both its key and its fresh object value. */
interface Argument {
  readonly key?: string
  readonly value: string | JsonObject
}

/** db-summaries.md, c4: parseInt infers hexadecimal and accepts numeric prefixes. */
function integerOf(value: JsonValue | undefined): number {
  // eslint-disable-next-line radix -- C4 calls parseInt without a radix; hexadecimal is part of its documented reading.
  return Number.parseInt(String(value))
}

/** docs/db-from-tree/c4.md: attribute bags updated in first-insertion order. */
class C4DbBuilder {
  private title = ""

  private accDescr = ""

  private readonly shapes: Record<string, JsonValue>[] = []

  private readonly boundaries: Record<string, JsonValue>[] = [
    {
      alias: "global",
      label: { text: "global" },
      type: { text: "global" },
      tags: null,
      link: null,
      parentBoundary: "",
    },
  ]

  private readonly rels: Record<string, JsonValue>[] = []

  private shapeInRow = 4

  private boundaryInRow = 2

  private readonly replace: TextReplacement

  private readonly readValue: ConvertedValueReader

  private readonly embedded: EmbeddedValues

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.readValue = convertedValuesOf(source, root, "c4")
    this.embedded = embedded
    this.replace = textReplacementOf(embedded.config)
  }

  /** The header determines type; frontmatter title and accessibility values are unused. */
  public summaryOf(diagram: C4Diagram): DbSummary {
    this.walk(diagram.body, "global")
    return {
      type: `C4${diagram.kind.charAt(0).toUpperCase()}${diagram.kind.slice(1)}`,
      title: this.title,
      accTitle: "",
      accDescr: this.accDescr,
      shapes: this.shapes,
      boundaries: this.boundaries,
      rels: this.rels,
      c4ShapeInRow: numberOrText(this.shapeInRow),
      c4BoundaryInRow: numberOrText(this.boundaryInRow),
    }
  }

  /** Read a value range using the common source-wide HTML quote context. */
  private textOf(node: C4Literal | StringLiteral | null): string {
    return node === null
      ? ""
      : this.readValue(
          node.range,
          node.value,
          node.type === "StringLiteral" ? 1 : 0,
        )
  }

  /** Grammar trimming precedes slot dispatch; required named values stay objects. */
  private argumentOf(node: C4Argument): Argument {
    if (node?.type !== "C4NamedAttribute")
      return { value: trimmed(this.textOf(node)) }
    const key = trimmed(this.textOf(node.key))
    const value = trimmed(this.textOf(node.value))
    return {
      key,
      value: key === "__proto__" ? {} : Object.fromEntries([[key, value]]),
    }
  }

  /** Required slots retain their object, including an empty named __proto__ object. */
  private requiredOf(argument: Argument | undefined): string | JsonObject {
    return argument?.value ?? ""
  }

  /** Consuming an empty-entry named object as an optional field rejects the input. */
  private checkOptionalArgument(argument: Argument): void {
    if (argument?.key === "__proto__")
      throw new TreeError(
        "c4",
        "C4NamedAttribute",
        "named __proto__ cannot be consumed as an optional field",
      )
  }

  /** Null configuration wrap is omitted; every other supplied JSON value is retained. */
  private resetWrap(bag: Record<string, JsonValue>): void {
    const wrap = this.embedded.config.wrap
    if (wrap === undefined || wrap === null) delete bag.wrap
    else bag.wrap = wrap
  }

  /** Optional arguments dispatch by name; style values remain plain, offset slots parse numbers. */
  private assign(
    bag: Record<string, JsonValue>,
    arguments_: readonly Argument[],
    fields: readonly (string | null)[],
    style = false,
    numericFrom = Infinity,
  ): void {
    for (const [index, field] of fields.entries()) {
      const argument = arguments_[index]
      if (field === null) continue
      if (argument === undefined) {
        if (!style && TEXT_FIELDS.includes(field) && !Object.hasOwn(bag, field))
          setOwnProperty(bag, field, { text: "" })
        continue
      }
      this.checkOptionalArgument(argument)
      const key = argument.key ?? field
      const value =
        argument.key === undefined
          ? argument.value
          : ((argument.value as JsonObject)[argument.key] ?? "")
      const read: JsonValue =
        index >= numericFrom
          ? numberOrText(integerOf(value))
          : !style && TEXT_FIELDS.includes(key)
            ? { text: value }
            : value
      setOwnProperty(bag, key, read)
    }
  }

  /** Find the first matching alias, appending a new bag only when none matches. */
  private entry(
    list: Record<string, JsonValue>[],
    alias: JsonValue,
  ): Record<string, JsonValue> {
    let bag = list.find((entry) => entry.alias === alias)
    if (bag === undefined) {
      bag = { alias }
      list.push(bag)
    }
    return bag
  }

  /** Calls and text statements execute in written order; recursion supplies the parent stack. */
  private walk(statements: readonly C4Statement[], parent: JsonValue): void {
    for (const statement of statements) {
      switch (statement.type) {
        case "C4ElementStatement":
          this.element(statement, parent)
          break
        case "C4BoundaryStatement":
          this.boundary(statement, parent)
          break
        case "C4RelationshipStatement":
          this.relationship(statement)
          break
        case "C4UpdateStatement":
          this.update(statement)
          break
        case "C4TitleStatement":
          this.title = this.replace(this.textOf(statement.value))
          break
        case "C4AccTitleStatement":
          this.title = this.replace(trimmed(this.textOf(statement.value)))
          break
        case "C4AccDescriptionStatement":
        case "C4AccDescrStatement":
        case "C4AccDescrBlockStatement": {
          if (
            statement.type === "C4AccDescrBlockStatement" &&
            statement.value === null
          )
            break
          const text = this.textOf(statement.value)
          this.accDescr = this.replace(
            (statement.type === "C4AccDescriptionStatement"
              ? text
              : trimmed(text)
            ).replace(/\n\s+/gu, "\n"),
          )
          break
        }
        default:
          throw new Error(
            `c4 Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
          )
      }
    }
  }

  /** The two element slot families differ only by the technology position. */
  private element(statement: C4ElementStatement, parent: JsonValue): void {
    const args = statement.arguments.map((argument) =>
      this.argumentOf(argument),
    )
    const technology =
      statement.keyword.startsWith("Container") ||
      statement.keyword.startsWith("Component")
    const type = SHAPE_TYPES[statement.keyword]
    if (type === undefined)
      throw new TreeError("c4", statement.type, "unknown element keyword")
    const bag = this.entry(this.shapes, this.requiredOf(args[0]))
    bag.label = { text: this.requiredOf(args[1]) }
    this.assign(
      bag,
      args.slice(2),
      technology
        ? ["techn", "descr", "sprite", "tags", "link"]
        : ["descr", "sprite", "tags", "link"],
    )
    bag.typeC4Shape = { text: type }
    bag.parentBoundary = parent
    this.resetWrap(bag)
  }

  /** Boundary membership uses the original required alias even if a named attribute changes the bag's alias. */
  private boundary(statement: C4BoundaryStatement, parent: JsonValue): void {
    const args = statement.arguments.map((argument) =>
      this.argumentOf(argument),
    )
    const alias = this.requiredOf(args[0])
    const nodeType = ["Deployment_Node", "Node", "Node_L", "Node_R"].includes(
      statement.keyword,
    )
      ? statement.keyword === "Node_L"
        ? "nodeL"
        : statement.keyword === "Node_R"
          ? "nodeR"
          : "node"
      : undefined
    const fixed: Readonly<Record<string, string>> = {
      Enterprise_Boundary: "ENTERPRISE",
      System_Boundary: "SYSTEM",
      Container_Boundary: "CONTAINER",
    }
    const fixedType = fixed[statement.keyword]
    const bag = this.entry(this.boundaries, alias)
    bag.label = { text: this.requiredOf(args[1]) }
    delete bag.type
    if (fixedType !== undefined || args[2] === undefined)
      bag.type = {
        text: fixedType ?? (nodeType === undefined ? "system" : "node"),
      }
    this.assign(
      bag,
      args.slice(2),
      fixedType !== undefined
        ? ["tags", "link"]
        : nodeType === undefined
          ? ["type", "tags", "link"]
          : ["type", "descr", null, "tags", "link"],
    )
    if (nodeType !== undefined) bag.nodeType = nodeType
    bag.parentBoundary = parent
    this.resetWrap(bag)
    this.walk(statement.body, alias)
  }

  /** Ordered endpoints identify the first relationship; RelIndex discards one argument. */
  private relationship(statement: C4RelationshipStatement): void {
    const args = statement.arguments
      .slice(statement.keyword === "RelIndex" ? 1 : 0)
      .map((argument) => this.argumentOf(argument))
    if (args[0] === undefined || args[1] === undefined || args[2] === undefined)
      return
    const from = this.requiredOf(args[0])
    const to = this.requiredOf(args[1])
    let bag = this.rels.find((entry) => entry.from === from && entry.to === to)
    if (bag === undefined) {
      bag = {}
      this.rels.push(bag)
    }
    bag.type = REL_TYPES[statement.keyword] ?? "rel"
    bag.from = from
    bag.to = to
    bag.label = { text: this.requiredOf(args[2]) }
    this.assign(bag, args.slice(3), [
      "techn",
      "descr",
      "sprite",
      "tags",
      "link",
    ])
    this.resetWrap(bag)
  }

  /** Style targets must already exist; layout counters use argument position and positive parsed integers. */
  private update(statement: C4UpdateStatement): void {
    const args = statement.arguments.map((argument) =>
      this.argumentOf(argument),
    )
    if (statement.keyword === "UpdateLayoutConfig") {
      const values = args
        .slice(0, 2)
        .map((argument) =>
          integerOf(
            argument.key === undefined
              ? argument.value
              : Object.values(argument.value)[0],
          ),
        )
      if ((values[0] ?? 0) >= 1) this.shapeInRow = values[0] ?? 4
      if ((values[1] ?? 0) >= 1) this.boundaryInRow = values[1] ?? 2
      return
    }
    if (statement.keyword === "UpdateElementStyle") {
      const alias = args[0]?.value ?? ""
      const bag =
        this.shapes.find((entry) => entry.alias === alias) ??
        this.boundaries.find((entry) => entry.alias === alias)
      if (bag !== undefined)
        this.assign(
          bag,
          args.slice(1),
          [
            "bgColor",
            "fontColor",
            "borderColor",
            "shadowing",
            "shape",
            "sprite",
            "techn",
            "legendText",
            "legendSprite",
          ],
          true,
        )
    } else if (statement.keyword === "UpdateRelStyle") {
      const from = args[0]?.value
      const to = args[1]?.value
      const bag = this.rels.find(
        (entry) => entry.from === from && entry.to === to,
      )
      if (bag !== undefined)
        this.assign(
          bag,
          args.slice(2),
          ["textColor", "lineColor", "offsetX", "offsetY"],
          true,
          2,
        )
    }
  }
}

/** docs/db-from-tree/c4.md: the normalized summary read solely from written value nodes. */
export function c4DbOf(
  source: string,
  root: TreeRoot,
  diagram: C4Diagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new C4DbBuilder(source, root, embedded).summaryOf(diagram)
}
