import type {
  CynefinDiagram,
  CynefinBodyItem,
  CynefinDomainItem,
} from "@mmd-toolkit/parser"
import type { FlatHiddenPrinter } from "./flat-hidden-diagram.ts"
import { createFlatHiddenDiagramPrinter } from "./flat-hidden-diagram.ts"
import {
  layoutCynefinHeader,
  layoutCynefinStatement,
} from "./cynefin-layout.ts"

/** Domains and their items share the diagram's hidden-body printing path. */
export const cynefinPrinter: FlatHiddenPrinter = createFlatHiddenDiagramPrinter<
  CynefinDiagram,
  CynefinBodyItem | CynefinDomainItem
>({
  type: "CynefinDiagram",
  ignoredType: "CynefinIgnoredText",
  header: layoutCynefinHeader,
  statement: layoutCynefinStatement,
  inlineGapBefore: (item) =>
    item.type === "CynefinIgnoredText" ||
    (item.type === "CynefinDomainItem" && item.textBefore.length > 0)
      ? undefined
      : "space",
  suffixes: (item) =>
    item.type === "CynefinDomainStatement"
      ? (item.items.at(-1)?.textAfter ?? item.textAfterName)
      : "textAfter" in item
        ? item.textAfter
        : [],
})
