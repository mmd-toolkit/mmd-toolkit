import type { InfoNode } from "../ast/info.ts"

/** ast/info.md: child fields in the specified visitor and source order. */
export const infoVisitorKeys: Readonly<
  Record<InfoNode["type"], readonly string[]>
> = {
  InfoDiagram: ["textBeforeHeader", "textBeforeShowInfo", "body"],
  InfoTitleStatement: ["value", "textAfter"],
  InfoAccTitleStatement: ["value", "textAfter"],
  InfoAccDescrStatement: ["value", "textAfter"],
  InfoAccDescrBlockStatement: ["value", "textAfter"],
  InfoLiteral: [],
  InfoIgnoredText: [],
}
