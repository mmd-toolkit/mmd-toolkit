import type { RailroadNode } from "../ast/railroad.ts"

/** ast/railroad.md: child fields in the specified visitor order. */
export const railroadVisitorKeys: Readonly<
  Record<RailroadNode["type"], readonly string[]>
> = {
  RailroadDiagram: ["textBeforeHeader", "body"],
  RailroadRule: [
    "name",
    "textBeforeOperator",
    "textBeforeDefinition",
    "definition",
    "textBeforeTerminator",
  ],
  RailroadTitleStatement: ["value"],
  RailroadAccTitleStatement: ["value"],
  RailroadAccDescrStatement: ["value"],
  RailroadAccDescrBlockStatement: ["value"],
  RailroadLiteral: [],
  RailroadIgnoredText: [],
  RailroadExpressionMember: ["textBefore", "expression", "textAfter"],
  RailroadSequenceCall: ["textBeforeOpen", "arguments"],
  RailroadChoiceCall: ["textBeforeOpen", "arguments"],
  RailroadOptionalCall: [
    "textBeforeOpen",
    "textBeforeElement",
    "element",
    "textBeforeClose",
  ],
  RailroadOneOrMoreCall: [
    "textBeforeOpen",
    "textBeforeElement",
    "element",
    "textBeforeClose",
  ],
  RailroadZeroOrMoreCall: [
    "textBeforeOpen",
    "textBeforeElement",
    "element",
    "textBeforeClose",
  ],
  RailroadTerminalCall: [
    "textBeforeOpen",
    "textBeforeValue",
    "value",
    "textBeforeClose",
  ],
  RailroadNonterminalCall: [
    "textBeforeOpen",
    "textBeforeName",
    "name",
    "textBeforeClose",
  ],
  RailroadSpecialCall: [
    "textBeforeOpen",
    "textBeforeText",
    "text",
    "textBeforeClose",
  ],
  RailroadChoiceExpression: ["alternatives"],
  RailroadSequenceExpression: ["elements"],
  RailroadGroupExpression: ["textBeforeElement", "element", "textBeforeClose"],
  RailroadOptionalGroupExpression: [
    "textBeforeElement",
    "element",
    "textBeforeClose",
  ],
  RailroadRepetitionGroupExpression: [
    "textBeforeElement",
    "element",
    "textBeforeClose",
  ],
  RailroadPostfixExpression: ["element", "textBeforeOperator"],
  RailroadExceptionExpression: [
    "left",
    "textBeforeOperator",
    "textBeforeRight",
    "right",
  ],
  RailroadSpecialSequence: [],
  RailroadRepeatExpression: ["repeat", "textBeforeElement", "element"],
  RailroadRepeatRange: ["minimum", "maximum"],
  RailroadNumericValue: [],
  RailroadPredicateExpression: ["textBeforeElement", "element"],
  RailroadAnyExpression: [],
}
