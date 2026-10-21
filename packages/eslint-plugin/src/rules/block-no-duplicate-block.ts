import type { BlockNode } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import {
  declaredNodesOf,
  isCompositeHead,
} from "../utils/block-declarations.ts"
import { BLOCK_DIRECTIONS, BLOCK_SHAPES } from "../utils/block-shapes.ts"

/**
 * The type that mermaid.js gives a block without a shape, `na` in its Db, and
 * the type that this rule gives a pair of brackets that `BLOCK_SHAPES` has no
 * type for. mermaid.js keeps the type that a block already has when a later
 * declaration brings none.
 */
const NO_TYPE = "na"

/** The appearance needed to compare a later declaration with the block it finds. */
interface Appearance {
  readonly kind: string
  readonly label: string
  readonly directions: ReadonlySet<string>
  readonly hasShape: boolean
}

/** The written label, kind, and recognized directions of a declaration. */
function appearanceOf(node: BlockNode, composite: boolean): Appearance {
  const shape = node.shape
  const directions = new Set<string>()
  if (shape?.type === "BlockArrowShape") {
    for (const direction of shape.directions) {
      for (const value of BLOCK_DIRECTIONS[direction.value] ?? []) {
        directions.add(value)
      }
    }
  }
  return {
    kind: composite
      ? "composite"
      : shape?.type === "BlockArrowShape"
        ? "block_arrow"
        : shape?.type === "BlockShape"
          ? (BLOCK_SHAPES[shape.open]?.[shape.close] ?? NO_TYPE)
          : NO_TYPE,
    label: shape?.label.value ?? (composite ? "" : node.id.name),
    directions,
    hasShape: shape !== null,
  }
}

/** Whether the label, kind, and (for block arrows) drawn directions agree. */
function sameAppearance(earlier: Appearance, current: Appearance): boolean {
  return (
    earlier.kind === current.kind &&
    earlier.label === current.label &&
    (current.kind !== "block_arrow" ||
      (earlier.directions.size === current.directions.size &&
        [...earlier.directions].every((value) =>
          current.directions.has(value),
        )))
  )
}

/**
 * Walk declarations in source order, keeping the appearance that a later one
 * finds. Standalone declarations place nothing after the first, except for
 * adding a first shape without a width; edge endpoints may reuse a shape.
 */
export const blockNoDuplicateBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "redefined" | "noDirections"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow declaring a block again.",
      recommended: true,
      url: ruleDocsUrl("block-no-duplicate-block"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js already has the block `{{name}}`; this declaration places no second block.",
      redefined:
        "mermaid.js reuses the block `{{name}}`; its earlier declaration and this shape differ.",
      noDirections:
        "mermaid.js gives the block `{{name}}` the kind and the label of this arrow but none of its directions.",
    },
  },
  create(context) {
    const blocks = new Map<string, Appearance>([
      [
        "root",
        {
          kind: "composite",
          label: "",
          directions: new Set(),
          hasShape: false,
        },
      ],
    ])
    return {
      BlockNodeStatement(node, parent) {
        const composite = isCompositeHead(node, parent)
        for (const block of declaredNodesOf(node, parent)) {
          const name = block.id.name
          const current = appearanceOf(block, composite)
          const previous = blocks.get(name)
          if (previous !== undefined) {
            // A later declaration of a block that had no shape gives it the
            // kind and the label of the shape, but a block arrow loses its
            // directions that way.
            const arrowOnBareBlock =
              !previous.hasShape && block.shape?.type === "BlockArrowShape"
            if (node.links.length === 0) {
              if (
                composite ||
                previous.hasShape ||
                block.shape === null ||
                node.width !== null
              ) {
                context.report({
                  node,
                  messageId: "duplicate",
                  data: { name },
                })
              } else if (arrowOnBareBlock) {
                context.report({
                  node,
                  messageId: "noDirections",
                  data: { name },
                })
              }
            } else if (previous.hasShape) {
              if (block.shape !== null && !sameAppearance(previous, current)) {
                context.report({
                  node: block,
                  messageId: "redefined",
                  data: { name },
                })
              }
            } else if (arrowOnBareBlock) {
              context.report({
                node: block,
                messageId: "noDirections",
                data: { name },
              })
            }
          }
          // What the block has afterwards, as mermaid.js merges a later
          // declaration into an earlier one: the later type, unless it brings
          // none; the later label, unless it is the id, which is the label of
          // a block without one; the directions of the first declaration.
          blocks.set(
            name,
            previous === undefined
              ? current
              : {
                  kind: current.kind === NO_TYPE ? previous.kind : current.kind,
                  label:
                    current.label === name ? previous.label : current.label,
                  directions: previous.directions,
                  hasShape: previous.hasShape || current.hasShape,
                },
          )
        }
      },
    }
  },
}
