import type { EventmodelingNode } from "@mmd-toolkit/ast"

/** ast/eventmodeling.md: child fields in specified visitor order. */
export const eventmodelingVisitorKeys: Readonly<
  Record<EventmodelingNode["type"], readonly string[]>
> = {
  EventmodelingDiagram: ["textBeforeHeader", "body"],
  EventmodelingTimeFrameStatement: [
    "textBeforeName",
    "name",
    "textBeforeModelEntityType",
    "textBeforeEntityIdentifier",
    "entityIdentifier",
    "sourceFrames",
    "dataReference",
    "data",
  ],
  EventmodelingResetFrameStatement: [
    "textBeforeName",
    "name",
    "textBeforeModelEntityType",
    "textBeforeEntityIdentifier",
    "entityIdentifier",
    "sourceFrames",
    "dataReference",
    "data",
  ],
  EventmodelingQualifiedName: ["head", "tail"],
  EventmodelingQualifiedNamePart: ["textBeforeDot", "textBeforeName", "name"],
  EventmodelingSourceReference: [
    "textBefore",
    "arrow",
    "textBeforeFrame",
    "frame",
  ],
  EventmodelingArrow: [],
  EventmodelingDataReference: [
    "textBefore",
    "textBeforeName",
    "name",
    "textBeforeClose",
  ],
  EventmodelingInlineData: [
    "textBefore",
    "textBeforeDataType",
    "textBeforeTypeClose",
    "textBeforeValue",
    "value",
  ],
  EventmodelingDataBlock: [
    "textBefore",
    "textBeforeDataType",
    "textBeforeTypeClose",
    "textBeforeValue",
    "value",
  ],
  EventmodelingModelEntityStatement: ["textBeforeName", "name"],
  EventmodelingDataEntityStatement: ["textBeforeName", "name", "data"],
  EventmodelingNoteStatement: ["textBeforeSourceFrame", "sourceFrame", "data"],
  EventmodelingGwtStatement: [
    "textBeforeSourceFrame",
    "sourceFrame",
    "given",
    "when",
    "then",
  ],
  EventmodelingGwtClause: ["textBefore", "body"],
  EventmodelingGwtItem: [
    "textBefore",
    "textBeforeEntityIdentifier",
    "entityIdentifier",
  ],
  EventmodelingTitleStatement: ["value"],
  EventmodelingAccTitleStatement: ["value"],
  EventmodelingAccDescrStatement: ["value"],
  EventmodelingAccDescrBlockStatement: ["value"],
  EventmodelingLiteral: [],
  EventmodelingIgnoredText: [],
}
