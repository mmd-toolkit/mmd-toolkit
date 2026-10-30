import type { PieNode } from "../ast/pie.ts"

/** ast/pie.md: child fields in the specified visitor and source order. */
export const pieVisitorKeys: Readonly<
  Record<PieNode["type"], readonly string[]>
> = {
  PieDiagram: ["textBeforeHeader", "textBeforeShowData", "body"],
  PieSectionStatement: [
    "label",
    "textBeforeColon",
    "textBeforeValue",
    "value",
    "textAfter",
  ],
  PieTitleStatement: ["value", "textAfter"],
  PieAccTitleStatement: ["value", "textAfter"],
  PieAccDescrStatement: ["value", "textAfter"],
  PieAccDescrBlockStatement: ["value", "textAfter"],
  PieLiteral: [],
  PieIgnoredText: [],
}
