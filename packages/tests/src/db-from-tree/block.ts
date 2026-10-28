import { appendItems } from "../collections.ts"
import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  BlockArrowShape,
  BlockDiagram,
  BlockLiteral,
  BlockLink,
  BlockNode,
  BlockStatement,
} from "./block-tree.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TextReplacement } from "./text-replacement.ts"
import type { NumericLiteral, StringLiteral, TreeRoot } from "./tree.ts"
import { trimmed } from "./values.ts"

// docs/db-from-tree/block.md: a depth-first walk of the statements, with the
// table of blocks and the lists of edges and classes that the Db keeps.

/** A block while its summary is built; identity distinguishes discarded children lists. */
interface Block {
  id?: string
  label?: string
  type?: string
  widthInColumns?: number
  width?: number
  directions?: string[]
  columns?: number
  classes?: string[]
  styles?: string[]
  children?: Block[]
}

/** The type of each recognized opening and closing pair (db-summaries.md, block, Shapes). */
const SHAPE_TYPES: ReadonlyMap<string, string> = new Map([
  ["[]", "square"],
  ["()", "round"],
  ["(())", "circle"],
  ["((()))", "doublecircle"],
  ["([])", "stadium"],
  ["[[]]", "subroutine"],
  ["[()]", "cylinder"],
  ["{}", "diamond"],
  ["{{}}", "hexagon"],
  [">]", "rect_left_inv_arrow"],
  ["[//]", "lean_right"],
  ["[\\\\]", "lean_left"],
  ["[/\\]", "trapezoid"],
  ["[\\/]", "inv_trapezoid"],
])

/** The marker at the end of an edge, with the Db's empty text for none. */
const END_MARKERS: Readonly<Record<string, string>> = {
  none: "",
  arrow: "arrow_point",
  cross: "arrow_cross",
  circle: "arrow_circle",
}

/** Builds the summary directly from the statements, preserving the first block of each id. */
class BlockDbBuilder {
  private readonly root: Block = {
    type: "composite",
    columns: -1,
    children: [],
  }

  private readonly blocks = new Map<string | symbol | undefined, Block>([
    ["root", this.root],
  ])

  private readonly edges: JsonObject[] = []

  private readonly classes = new Map<string, string[]>()

  private readonly text: ConvertedText

  private readonly replace: TextReplacement

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
  }

  /** The completed hierarchy, and the entries unreachable from it. */
  public summaryOf(diagram: BlockDiagram): DbSummary {
    this.walk(diagram.body, this.root)
    const root = this.blocks.get("root")
    if (root === undefined) throw new Error("block Db: no root block")
    const placed = new Set<Block>()
    this.collectChildren(root, placed)
    const unplaced = [...this.blocks.values()].filter(
      (block) => block !== root && !placed.has(block),
    )
    const nested = new Set<Block>()
    for (const block of unplaced) this.collectChildren(block, nested)
    return {
      root: this.blockSummary(root, true),
      unplaced: unplaced
        .filter((block) => !nested.has(block))
        .map((block) => this.blockSummary(block)),
      edges: this.edges,
      classes: [...this.classes].map(([id, styles]) => ({ id, styles })),
    }
  }

  /** Collecting: walk each composite before continuing the surrounding list. */
  private walk(statements: readonly BlockStatement[], parent: Block): void {
    const children: Block[] = []
    for (const statement of statements) {
      switch (statement.type) {
        case "BlockAccDescrBlockStatement":
          break
        case "BlockColumnsStatement":
          parent.columns =
            statement.count === null ? -1 : this.numberOf(statement.count)
          break
        case "BlockSpaceStatement": {
          const width =
            statement.width === null ? 1 : this.numberOf(statement.width)
          for (let index = 0; index < width; index++) {
            const block: Block = { type: "space", width }
            this.blocks.set(Symbol(), block)
            children.push(block)
          }
          break
        }
        case "BlockNodeStatement": {
          const last = statement.links.at(-1)
          if (last === undefined) {
            const block = this.nodeOf(statement.node)
            block.widthInColumns =
              statement.width === null ? 1 : this.numberOf(statement.width)
            this.add(block, children)
          } else {
            // A chain loses every reduction before its last: its source is
            // the one fieldless block, shared by all chains.
            const source =
              statement.links.length === 1 ? this.nodeOf(statement.node) : {}
            this.add(source, children)
            this.edges.push(this.edgeOf(source.id, last))
            this.add(this.nodeOf(last.target), children)
          }
          break
        }
        case "BlockCompositeStatement": {
          const head = statement.head
          const block: Block =
            head === null || head.links.length > 0 ? {} : this.nodeOf(head.node)
          if (head !== null && head.links.length === 0) {
            block.widthInColumns =
              head.width === null ? 1 : this.numberOf(head.width)
          }
          // A bare head supplies no label to a composite.
          if (
            head === null ||
            head.links.length > 0 ||
            head.node.shape === null
          )
            block.label = ""
          block.type = "composite"
          const key = head === null ? Symbol() : block.id
          this.add(block, children, key)
          // A repeated id discards this new list, while its entries still
          // enter the table and can be found by class and style statements.
          this.walk(statement.body, block)
          break
        }
        case "BlockClassDefStatement": {
          const id = this.text.of(statement.name.range)
          const styles = this.stylesOf(statement.styles).map((style) =>
            trimmed(style.replace(";", "")),
          )
          const previous = this.classes.get(id) ?? []
          appendItems(previous, styles)
          this.classes.set(id, previous)
          break
        }
        case "BlockClassStatement": {
          const ids = statement.ids.map((id) => this.text.of(id.range))
          const name =
            statement.cssClass === null
              ? ""
              : trimmed(this.text.of(statement.cssClass.range))
          for (const id of ids) {
            let block = this.blocks.get(id)
            if (block === undefined) {
              block = { id: trimmed(id), type: "na", children: [] }
              this.blocks.set(trimmed(id), block)
            }
            block.classes ??= []
            block.classes.push(name)
          }
          break
        }
        case "BlockStyleStatement": {
          const id = this.text.of(statement.id.range)
          const block = this.blocks.get(id)
          if (block === undefined)
            throw new Error(
              `block Db: style names no earlier block ${JSON.stringify(id)}`,
            )
          // A statement with no style has the one part that holds nothing.
          const [only] = statement.styles
          if (statement.styles.length > 1 || only !== null) {
            block.styles = this.stylesOf(statement.styles)
          }
          break
        }
        default:
          throw new Error(
            `block Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
          )
      }
    }
    parent.children = children
  }

  /** Definitions: only the new type (unless `na`) and a label unequal to the id replace earlier fields. */
  private add(
    block: Block,
    children: Block[],
    key: string | symbol | undefined = block.id,
  ): void {
    const earlier = this.blocks.get(key)
    if (earlier === undefined) {
      this.blocks.set(key, block)
      children.push(block)
    } else {
      if (block.type !== "na") earlier.type = block.type
      if (block.label !== block.id) earlier.label = block.label
    }
  }

  /** Nodes and shapes: the written pair gives the type, and a missing shape gives the id as label. */
  private nodeOf(node: BlockNode): Block {
    const id = this.text.of(node.id.range)
    const shape = node.shape
    if (shape === null) return { id, label: id, type: "na" }
    return {
      id,
      label: this.stringOf(shape.label),
      type:
        shape.type === "BlockArrowShape"
          ? "block_arrow"
          : (SHAPE_TYPES.get(shape.open + shape.close) ?? "na"),
      ...(shape.type === "BlockArrowShape"
        ? { directions: this.directionsOf(shape) }
        : {}),
    }
  }

  /** Directions: the converted text of each, which holds the whitespace written with its word. */
  private directionsOf(shape: BlockArrowShape): string[] {
    return shape.directions.map((direction) => this.text.of(direction.range))
  }

  /** Labels: the converted content, with its whitespace and the configuration's replacement. */
  private stringOf(string: StringLiteral): string {
    return this.replace(this.text.of(string.range).slice(1, -1))
  }

  /** Widths and columns: parse the written digits, also when JSON replaced an infinite value with null. */
  private numberOf(number: NumericLiteral): number {
    return Number.parseInt(this.text.of(number.range), 10)
  }

  /** Styles: the converted text of each part between the commas, which holds the whitespace that mermaid.js keeps, and nothing for a part with nothing in it. */
  private stylesOf(styles: readonly (BlockLiteral | null)[]): string[] {
    return styles.map((style) =>
      style === null ? "" : this.text.of(style.range),
    )
  }

  /** Edges: only the last link and its closing arrow contribute to the summary. */
  private edgeOf(start: string | undefined, link: BlockLink): JsonObject {
    const { arrow } = link
    const target = link.target
    return {
      ...(start === undefined ? {} : { start }),
      end: this.text.of(target.id.range),
      label: link.label === null ? "" : this.stringOf(link.label),
      thickness: arrow.line === "thick" ? "thick" : "normal",
      pattern: arrow.line === "dotted" ? "dotted" : "solid",
      arrowTypeStart:
        arrow.startMarker === "arrow" ? "arrow_point" : "arrow_open",
      arrowTypeEnd: END_MARKERS[arrow.endMarker] ?? "",
      ...(target.shape?.type === "BlockArrowShape"
        ? { directions: this.directionsOf(target.shape) }
        : {}),
    }
  }

  /** The descendants of a block, used once for placement and once for nesting of unplaced entries. */
  private collectChildren(block: Block, found: Set<Block>): void {
    for (const child of block.children ?? []) {
      found.add(child)
      this.collectChildren(child, found)
    }
  }

  /** The normalizer's kept fields; the root has no id, and generated ids are never made. */
  private blockSummary(block: Block, isRoot = false): JsonObject {
    return {
      ...(isRoot || block.id === undefined ? {} : { id: block.id }),
      ...(block.label === undefined ? {} : { label: block.label }),
      ...(block.type === undefined ? {} : { type: block.type }),
      ...(block.widthInColumns === undefined
        ? {}
        : { widthInColumns: numberOrText(block.widthInColumns) }),
      ...(block.width === undefined
        ? {}
        : { width: numberOrText(block.width) }),
      ...(block.directions === undefined
        ? {}
        : { directions: block.directions }),
      ...(block.columns === undefined
        ? {}
        : { columns: numberOrText(block.columns) }),
      ...(block.classes === undefined ? {} : { classes: block.classes }),
      ...(block.styles === undefined ? {} : { styles: block.styles }),
      ...(block.children === undefined ||
      (!isRoot && block.type !== "composite" && block.children.length === 0)
        ? {}
        : {
            children: block.children.map((child) => this.blockSummary(child)),
          }),
    }
  }
}

/** docs/db-from-tree/block.md: the normalized Db denoted by a block tree. */
export function blockDbOf(
  source: string,
  root: TreeRoot,
  diagram: BlockDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new BlockDbBuilder(source, root, embedded).summaryOf(diagram)
}
