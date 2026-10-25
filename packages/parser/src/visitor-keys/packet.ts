import type { PacketNode } from "../ast/packet.ts"

/** ast/packet.md: child fields in the specified visitor and source order. */
export const packetVisitorKeys: Readonly<
  Record<PacketNode["type"], readonly string[]>
> = {
  PacketDiagram: ["textBeforeHeader", "body"],
  PacketRangeBlockStatement: [
    "start",
    "textBeforeDash",
    "textBeforeEnd",
    "end",
    "textBeforeColon",
    "textBeforeLabel",
    "label",
    "textAfter",
  ],
  PacketSingleBlockStatement: [
    "start",
    "textBeforeColon",
    "textBeforeLabel",
    "label",
    "textAfter",
  ],
  PacketRelativeBlockStatement: [
    "textBeforeCount",
    "count",
    "textBeforeColon",
    "textBeforeLabel",
    "label",
    "textAfter",
  ],
  PacketTitleStatement: ["value", "textAfter"],
  PacketAccTitleStatement: ["value", "textAfter"],
  PacketAccDescrStatement: ["value", "textAfter"],
  PacketAccDescrBlockStatement: ["value", "textAfter"],
  PacketLiteral: [],
  PacketIgnoredText: [],
}
