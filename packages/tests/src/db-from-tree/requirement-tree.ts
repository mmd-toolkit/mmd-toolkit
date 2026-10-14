/**
 * The nodes of a requirement tree that the Db reads: the fields of
 * `packages/spec/docs/ast/requirement.md` that `requirement.ts` uses, and no
 * others (the fields `textBefore` and `textAfter` of a direction statement are
 * not read: the Db has nothing of the text around the direction).
 */
import type { StringLiteral, TreeNode } from "./tree.ts"

/** ast/requirement.md: RequirementDiagram. */
export interface RequirementDiagram extends TreeNode {
  readonly type: "RequirementDiagram"
  readonly body: readonly RequirementStatement[]
}

/** ast/requirement.md: RequirementStatement. */
export type RequirementStatement =
  | RequirementRequirementStatement
  | RequirementElementStatement
  | RequirementRelationshipStatement
  | RequirementDirectionStatement
  | RequirementStyleStatement
  | RequirementClassDefStatement
  | RequirementClassStatement
  | RequirementClassShorthandStatement
  | RequirementAccTitleStatement
  | RequirementAccDescrStatement
  | RequirementAccDescrBlockStatement

/** ast/requirement.md: the name of a requirement, an element, or a class. */
export type RequirementName = RequirementIdentifier | StringLiteral

/** ast/requirement.md: the kinds of a requirement. */
export type RequirementKind =
  | "requirement"
  | "functionalRequirement"
  | "interfaceRequirement"
  | "performanceRequirement"
  | "physicalRequirement"
  | "designConstraint"

/** ast/requirement.md: the words of a risk. */
export type RequirementRisk = "low" | "medium" | "high"

/** ast/requirement.md: the words of a verification method. */
export type RequirementVerifyMethod =
  "analysis" | "demonstration" | "inspection" | "test"

/** ast/requirement.md: the words of a relationship. */
export type RequirementRelationship =
  | "contains"
  | "copies"
  | "derives"
  | "satisfies"
  | "verifies"
  | "refines"
  | "traces"

/** ast/requirement.md: the values of a direction. */
export type RequirementDirection = "TB" | "BT" | "RL" | "LR"

/** ast/requirement.md: RequirementRequirementStatement. */
export interface RequirementRequirementStatement extends TreeNode {
  readonly type: "RequirementRequirementStatement"
  readonly requirementType: RequirementKind
  readonly name: RequirementName
  readonly cssClasses: readonly RequirementName[]
  readonly body: readonly (
    | RequirementValueField
    | RequirementRiskField
    | RequirementVerifyMethodField
    | RequirementIgnoredText
  )[]
}

/** ast/requirement.md: RequirementValueField. */
export interface RequirementValueField extends TreeNode {
  readonly type: "RequirementValueField"
  readonly field: "id" | "text"
  readonly value: RequirementLiteral | StringLiteral
}

/** ast/requirement.md: RequirementRiskField. */
export interface RequirementRiskField extends TreeNode {
  readonly type: "RequirementRiskField"
  readonly risk: RequirementRisk
}

/** ast/requirement.md: RequirementVerifyMethodField. */
export interface RequirementVerifyMethodField extends TreeNode {
  readonly type: "RequirementVerifyMethodField"
  readonly verifyMethod: RequirementVerifyMethod
}

/** ast/requirement.md: RequirementElementStatement. */
export interface RequirementElementStatement extends TreeNode {
  readonly type: "RequirementElementStatement"
  readonly name: RequirementName
  readonly cssClasses: readonly RequirementName[]
  readonly body: readonly (RequirementElementField | RequirementIgnoredText)[]
}

/** ast/requirement.md: RequirementElementField. */
export interface RequirementElementField extends TreeNode {
  readonly type: "RequirementElementField"
  readonly field: "type" | "docref"
  readonly value: RequirementLiteral | StringLiteral
}

/** ast/requirement.md: RequirementRelationshipStatement. */
export interface RequirementRelationshipStatement extends TreeNode {
  readonly type: "RequirementRelationshipStatement"
  readonly left: RequirementName
  readonly relationship: RequirementRelationship
  readonly arrow: "forward" | "backward"
  readonly right: RequirementName
}

/** ast/requirement.md: RequirementDirectionStatement. */
export interface RequirementDirectionStatement extends TreeNode {
  readonly type: "RequirementDirectionStatement"
  readonly direction: RequirementDirection
}

/** ast/requirement.md: RequirementStyleStatement. */
export interface RequirementStyleStatement extends TreeNode {
  readonly type: "RequirementStyleStatement"
  readonly names: readonly RequirementName[]
  readonly styles: readonly RequirementLiteral[]
}

/** ast/requirement.md: RequirementClassDefStatement. */
export interface RequirementClassDefStatement extends TreeNode {
  readonly type: "RequirementClassDefStatement"
  readonly cssClasses: readonly RequirementName[]
  readonly styles: readonly RequirementLiteral[]
}

/** ast/requirement.md: RequirementClassStatement. */
export interface RequirementClassStatement extends TreeNode {
  readonly type: "RequirementClassStatement"
  readonly names: readonly RequirementName[]
  readonly cssClasses: readonly RequirementName[]
}

/** ast/requirement.md: RequirementClassShorthandStatement. */
export interface RequirementClassShorthandStatement extends TreeNode {
  readonly type: "RequirementClassShorthandStatement"
  readonly name: RequirementName
  readonly cssClasses: readonly RequirementName[]
}

/** ast/requirement.md: RequirementAccTitleStatement. */
export interface RequirementAccTitleStatement extends TreeNode {
  readonly type: "RequirementAccTitleStatement"
  readonly value: RequirementLiteral
}

/** ast/requirement.md: RequirementAccDescrStatement. */
export interface RequirementAccDescrStatement extends TreeNode {
  readonly type: "RequirementAccDescrStatement"
  readonly value: RequirementLiteral
}

/** ast/requirement.md: RequirementAccDescrBlockStatement. */
export interface RequirementAccDescrBlockStatement extends TreeNode {
  readonly type: "RequirementAccDescrBlockStatement"
  readonly value: RequirementLiteral | null
}

/** ast/requirement.md: RequirementIdentifier. */
export interface RequirementIdentifier extends TreeNode {
  readonly type: "RequirementIdentifier"
}

/** ast/requirement.md: RequirementLiteral. */
export interface RequirementLiteral extends TreeNode {
  readonly type: "RequirementLiteral"
}

/** ast/requirement.md: RequirementIgnoredText. */
export interface RequirementIgnoredText extends TreeNode {
  readonly type: "RequirementIgnoredText"
}
