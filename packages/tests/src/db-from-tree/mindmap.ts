import type { EmbeddedValues } from "../mermaid.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type {
  MindmapDiagram,
  MindmapLabel,
  MindmapLiteral,
  MindmapNode,
  MindmapShape,
} from "./mindmap-tree.ts"
import type { TextReplacement } from "./text-replacement.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeRoot } from "./tree.ts"
import { TreeError } from "./tree.ts"

// docs/db-from-tree/mindmap.md: the summary of the Db that a mindmap tree
// denotes, in the form of `normalizeMindmap()` of `@mmd-toolkit/tests`. The
// nodes are visited in the order in which mermaid.js adds them while it
// parses, a node before the nodes below it; each step names the paragraph of
// "Building the summary from the tree" that defines it. Every value is read
// in converted form (see `converted-text.ts`).

/** The numbers that the Db gives the shapes (`MindmapDB.nodeType`). */
const DEFAULT_TYPE = 0
const ROUNDED_RECTANGLE_TYPE = 1
const RECTANGLE_TYPE = 2
const CIRCLE_TYPE = 3
const CLOUD_TYPE = 4
const BANG_TYPE = 5
const HEXAGON_TYPE = 6

/** The number of characters that the delimiters of a string take at each end. */
const STRING_DELIMITER_LENGTH = 1

/** The number of characters that the delimiters of a markdown string take at each end. */
const MARKDOWN_DELIMITER_LENGTH = 2

/**
 * Shapes: the number that the Db gives the shape. It comes from the opener,
 * and, for `(`, from the closer too.
 */
function shapeTypeOf(shape: MindmapShape): number {
  switch (shape.opener) {
    case "[":
      return RECTANGLE_TYPE
    case "(":
      return shape.closer === ")" ? ROUNDED_RECTANGLE_TYPE : CLOUD_TYPE
    case "((":
      return CIRCLE_TYPE
    case ")":
      return CLOUD_TYPE
    case "))":
      return BANG_TYPE
    case "{{":
      return HEXAGON_TYPE
    case "(-":
    case "-)":
      return DEFAULT_TYPE
    default:
      throw new Error(
        `mindmap Db: unknown opener ${JSON.stringify(shape.opener satisfies never)}`,
      )
  }
}

/** The builder of the summary: the nodes are visited in the order in which the Db adds them. */
class MindmapDbBuilder {
  /** The converted form of ranges of the source. */
  private readonly text: ConvertedText

  /** The replacement of characters that the configuration gives the texts that the Db keeps. */
  private readonly replace: TextReplacement

  public constructor(source: string, root: TreeRoot, embedded: EmbeddedValues) {
    this.text = new ConvertedText(readConvertedCharacters(source, root))
    this.replace = textReplacementOf(embedded.config)
  }

  /** The summary of `diagram`. */
  public summaryOf(diagram: MindmapDiagram): DbSummary {
    const { root } = diagram
    return {
      root: root === null ? null : this.nodeSummaryOf(root, root.indent),
    }
  }

  /**
   * Nodes: the summary of `node` and, below it, of its children in source
   * order. The level is the indentation of the node less that of the root,
   * `rootIndent`. The parent of a node is the node that holds it in the tree.
   */
  private nodeSummaryOf(node: MindmapNode, rootIndent: number): JsonObject {
    const { nodeId, descr } = this.textsOf(node)
    const { icon, cssClass } = this.decorationsOf(node)
    return {
      nodeId,
      level: node.indent - rootIndent,
      descr,
      type: node.shape === null ? DEFAULT_TYPE : shapeTypeOf(node.shape),
      ...(icon === undefined ? {} : { icon }),
      ...(cssClass === undefined ? {} : { class: cssClass }),
      children: node.children.map((child) =>
        this.nodeSummaryOf(child, rootIndent),
      ),
    }
  }

  /**
   * Texts: the id and the description of a node. A node without a shape has
   * its text as both. A shape alone has the text of its label as both. With
   * both, the id is the node text and the description the text of the label.
   */
  private textsOf(node: MindmapNode): { nodeId: string; descr: string } {
    const { id, shape } = node
    if (shape === null) {
      if (id === null) {
        throw new TreeError(
          "mindmap",
          node.type,
          "a node has neither a text nor a shape",
        )
      }
      const text = this.replace(this.literalOf(id))
      return { nodeId: text, descr: text }
    }
    const label = this.labelOf(shape.label)
    return {
      nodeId: this.replace(id === null ? label : this.literalOf(id)),
      descr: this.replace(label),
    }
  }

  /**
   * Decorations: the icon and the class that the lines after a node give it.
   * The Db gives them to the node added last, and a later line replaces an
   * earlier one of its kind.
   */
  private decorationsOf(node: MindmapNode): {
    icon: string | undefined
    cssClass: string | undefined
  } {
    let icon: string | undefined, cssClass: string | undefined
    for (const decoration of node.decorations) {
      switch (decoration.type) {
        case "MindmapIconStatement":
          icon = this.replace(this.literalOf(decoration.icon))
          break
        case "MindmapClassStatement":
          cssClass = this.replace(this.literalOf(decoration.cssClass))
          break
        default:
          throw new Error(
            `mindmap Db: unknown decoration ${JSON.stringify(decoration satisfies never)}`,
          )
      }
    }
    return { icon, cssClass }
  }

  /** The text of a literal: the converted form of its range. */
  private literalOf(literal: MindmapLiteral): string {
    return this.text.of(literal.range)
  }

  /**
   * The text of a label: the converted form of its range, without the
   * delimiters of a string or a markdown string, which the range includes.
   * The delimiters are cut from the converted form, where a directive that
   * lies inside a delimiter is not.
   */
  private labelOf(label: MindmapLabel): string {
    const text = this.text.of(label.range)
    switch (label.kind) {
      case "text":
        return text
      case "string":
        return text.slice(STRING_DELIMITER_LENGTH, -STRING_DELIMITER_LENGTH)
      case "markdown":
        return text.slice(MARKDOWN_DELIMITER_LENGTH, -MARKDOWN_DELIMITER_LENGTH)
      default:
        throw new Error(
          `mindmap Db: unknown label kind ${JSON.stringify(label.kind satisfies never)}`,
        )
    }
  }
}

/**
 * docs/db-from-tree/mindmap.md: the summary of the Db that the mindmap tree
 * `diagram` of the source `source` denotes (see `dbFromTree()`).
 */
export function mindmapDbOf(
  source: string,
  root: TreeRoot,
  diagram: MindmapDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  return new MindmapDbBuilder(source, root, embedded).summaryOf(diagram)
}
