import type { AgentflowNode } from "../ast/agentflow.ts"

/**
 * ast/agentflow.md, Nodes: the child fields of every agentflow node type, as
 * each node's section states them, in the order in which a walk visits
 * them.
 */
export const agentflowVisitorKeys: Readonly<
  Record<AgentflowNode["type"], readonly string[]>
> = {
  AgentflowDiagram: ["body"],
  AgentflowEmptyStatement: [],
  AgentflowVertexStatement: ["first", "links"],
  AgentflowVertexGroup: ["vertices"],
  AgentflowVertex: ["id", "shape", "cssClass", "data"],
  AgentflowShape: ["property", "label"],
  AgentflowShapeProperty: ["name", "value"],
  AgentflowLink: ["id", "opening", "arrow", "label", "target"],
  AgentflowArrow: [],
  AgentflowOpeningArrow: [],
  AgentflowLabel: [],
  AgentflowDataBlock: [],
  AgentflowFlowStatement: ["name", "title", "data", "body"],
  AgentflowGlobalStatement: ["body"],
  AgentflowConnectorStatement: ["name", "title", "data"],
  AgentflowName: ["parts"],
  AgentflowStyleStatement: ["id", "styles"],
  AgentflowClassDefStatement: ["cssClasses", "styles"],
  AgentflowClassStatement: ["ids", "cssClass"],
  AgentflowClickCallbackStatement: [
    "ids",
    "callback",
    "arguments",
    "textBeforeTooltip",
    "tooltip",
  ],
  AgentflowClickUrlStatement: [
    "ids",
    "textBeforeUrl",
    "url",
    "textBeforeTooltip",
    "tooltip",
  ],
  AgentflowLinkStyleStatement: ["indices", "interpolate", "styles"],
  AgentflowDefaultLinkStyleStatement: ["interpolate", "styles"],
  AgentflowDirectionStatement: ["textBefore", "textAfter"],
  AgentflowAccTitleStatement: ["value"],
  AgentflowAccDescrStatement: ["value"],
  AgentflowAccDescrBlockStatement: ["value"],
  AgentflowLiteral: [],
  AgentflowIgnoredText: [],
}
