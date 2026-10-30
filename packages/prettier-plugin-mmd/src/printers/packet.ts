import type { PacketDiagram, PacketBodyItem } from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import { layoutPacketHeader, layoutPacketStatement } from "./packet-layout.ts"

/** The flat packet body uses shared hidden-form and prefix preservation. */
export const packetPrinter: FlatHiddenPrinter = createFlatHiddenDiagramPrinter<
  PacketDiagram,
  PacketBodyItem
>({
  type: "PacketDiagram",
  ignoredType: "PacketIgnoredText",
  header: layoutPacketHeader,
  statement: layoutPacketStatement,
})
