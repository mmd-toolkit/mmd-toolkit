import type { CynefinNode } from "../ast/cynefin.ts"

/** ast/cynefin.md: child fields in specified source order. */
export const cynefinVisitorKeys: Readonly<
  Record<CynefinNode["type"], readonly string[]>
> = {
  CynefinDiagram: ["textBeforeHeader", "body"],
  CynefinDomainStatement: ["textAfterName", "items"],
  CynefinDomainItem: ["textBefore", "label", "textAfter"],
  CynefinTransitionStatement: [
    "textBeforeArrow",
    "arrow",
    "textBeforeTo",
    "textBeforeColon",
    "textBeforeLabel",
    "label",
    "textAfter",
  ],
  CynefinArrow: [],
  CynefinTitleStatement: ["value", "textAfter"],
  CynefinAccTitleStatement: ["value", "textAfter"],
  CynefinAccDescrStatement: ["value", "textAfter"],
  CynefinAccDescrBlockStatement: ["value", "textAfter"],
  CynefinLiteral: [],
  CynefinIgnoredText: [],
}
