import type { FlowchartNode } from "../ast/flowchart.ts"

/**
 * ast/flowchart.md, Nodes: the child fields of every flowchart node type, as
 * each node's section states them, in the order in which a walk visits
 * them.
 */
export const flowchartVisitorKeys: Readonly<
  Record<FlowchartNode["type"], readonly string[]>
> = {
  FlowchartDiagram: ["body"],
  FlowchartEmptyStatement: [],
  FlowchartVertexStatement: ["first", "links"],
  FlowchartVertexGroup: ["vertices"],
  FlowchartVertex: ["id", "shape", "className", "data"],
  FlowchartShape: ["property", "label"],
  FlowchartShapeProperty: ["name", "value"],
  FlowchartLink: ["id", "opening", "arrow", "label", "target"],
  FlowchartArrow: [],
  FlowchartOpeningArrow: [],
  FlowchartLabel: [],
  FlowchartDataBlock: [],
  FlowchartSubgraphStatement: ["name", "title", "body"],
  FlowchartStyleStatement: ["id", "styles"],
  FlowchartClassDefStatement: ["classNames", "styles"],
  FlowchartClassStatement: ["ids", "className"],
  FlowchartClickCallbackStatement: ["ids", "callback", "arguments", "tooltip"],
  FlowchartClickUrlStatement: ["ids", "url", "tooltip"],
  FlowchartLinkStyleStatement: ["indices", "interpolate", "styles"],
  FlowchartDefaultLinkStyleStatement: ["interpolate", "styles"],
  FlowchartDirectionStatement: ["textBefore", "textAfter"],
  FlowchartAccTitleStatement: ["value"],
  FlowchartAccDescrStatement: ["value"],
  FlowchartAccDescrBlockStatement: ["value"],
  FlowchartLiteral: [],
  FlowchartIgnoredText: [],
}
