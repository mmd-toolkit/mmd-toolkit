import type { Node } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import type { Source } from "./source.ts"
import { styleColorEdits } from "./style-text.ts"

/**
 * The fields that hold the text of a style, by the type of the node: a
 * `style`, a `classDef`, a `linkStyle`, and the styles of a point of a
 * quadrant chart and of a Venn diagram (docs/compatibility.md, Colors that are
 * drawn the same). The treemap holds none: its lexer rejects a `#`.
 */
const styleFields: Readonly<Record<string, readonly string[]>> = {
  AgentflowClassDefStatement: ["styles"],
  AgentflowDefaultLinkStyleStatement: ["styles"],
  AgentflowLinkStyleStatement: ["styles"],
  AgentflowStyleStatement: ["styles"],
  BlockClassDefStatement: ["styles"],
  BlockStyleStatement: ["styles"],
  ClassClassDefStatement: ["styles"],
  ClassStyleStatement: ["styles"],
  ErClassDefStatement: ["styles"],
  ErStyleStatement: ["styles"],
  FlowchartClassDefStatement: ["styles"],
  FlowchartDefaultLinkStyleStatement: ["styles"],
  FlowchartLinkStyleStatement: ["styles"],
  FlowchartStyleStatement: ["styles"],
  QuadrantClassDefStatement: ["styles"],
  QuadrantPointStatement: ["styles"],
  RequirementClassDefStatement: ["styles"],
  RequirementStyleStatement: ["styles"],
  StateClassDefStatement: ["styles"],
  StateStyleStatement: ["styles"],
  UsecaseClassDefStatement: ["styles"],
  UsecaseStyleStatement: ["styles"],
  VennStyleProperty: ["value"],
}

/**
 * Records the respelling in lower case of each color in the text of a style
 * below `node` (see `styleColorEdits`): the form of Prettier's CSS formatter,
 * which draws the same figure (docs/compatibility.md, Colors that are drawn the
 * same).
 */
export function findColorRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node = source.root,
): void {
  const fields = styleFields[node.type] ?? []
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      if (!fields.includes(key)) {
        findColorRespellings(source, found, item)
        continue
      }
      for (const { range, replacement } of styleColorEdits(
        source,
        item.range[0],
        item.range[1],
      )) {
        found.set(range[0], { end: range[1], text: replacement })
      }
    }
  }
}
