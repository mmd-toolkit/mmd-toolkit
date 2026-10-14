import type { RequirementNode } from "../ast/requirement.ts"

/**
 * ast/requirement.md: the child fields of each requirement node type, as
 * each node's section states them, in the order in which a walk visits
 * them.
 */
export const requirementVisitorKeys: Readonly<
  Record<RequirementNode["type"], readonly string[]>
> = {
  RequirementDiagram: ["body"],
  RequirementRequirementStatement: ["name", "cssClasses", "body"],
  RequirementValueField: ["value"],
  RequirementRiskField: [],
  RequirementVerifyMethodField: [],
  RequirementElementStatement: ["name", "cssClasses", "body"],
  RequirementElementField: ["value"],
  RequirementRelationshipStatement: ["left", "right"],
  RequirementDirectionStatement: ["textBefore", "textAfter"],
  RequirementStyleStatement: ["names", "styles"],
  RequirementClassDefStatement: ["cssClasses", "styles"],
  RequirementClassStatement: ["names", "cssClasses"],
  RequirementClassShorthandStatement: ["name", "cssClasses"],
  RequirementAccTitleStatement: ["value"],
  RequirementAccDescrStatement: ["value"],
  RequirementAccDescrBlockStatement: ["value"],
  RequirementIdentifier: [],
  RequirementLiteral: [],
  RequirementIgnoredText: [],
}
