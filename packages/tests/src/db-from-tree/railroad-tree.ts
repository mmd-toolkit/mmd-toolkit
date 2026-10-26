import type {
  Identifier,
  NumericLiteral,
  StringLiteral,
  TreeNode,
} from "./tree.ts"

/** ast/railroad.md: only fields read while publishing an accepted tree. */
export interface RailroadDiagram extends TreeNode {
  readonly type: "RailroadDiagram"
  readonly body: readonly RailroadStatement[]
}

/** A member contributes its expression; native gap forms publish nothing. */
interface RailroadMember extends TreeNode {
  readonly expression: RailroadExpression
}

/** The exact count and the starred form remain distinct in the authored tree. */
interface RailroadRepeatRange extends TreeNode {
  readonly type: "RailroadRepeatRange"
  readonly minimum: NumericLiteral | null
  readonly maximum: NumericLiteral | null
}

/** Calls, groups and dialect operators are folded only in the comparison Db. */
export type RailroadExpression =
  | Identifier
  | StringLiteral
  | (TreeNode & {
      readonly type: "RailroadTerminalCall"
      readonly value: StringLiteral
    })
  | (TreeNode & {
      readonly type: "RailroadNonterminalCall"
      readonly name: StringLiteral
    })
  | (TreeNode & {
      readonly type: "RailroadSpecialCall"
      readonly text: StringLiteral
    })
  | (TreeNode & {
      readonly type: "RailroadSequenceCall" | "RailroadChoiceCall"
      readonly arguments: readonly RailroadMember[]
    })
  | (TreeNode & {
      readonly type: "RailroadSequenceExpression"
      readonly elements: readonly RailroadMember[]
    })
  | (TreeNode & {
      readonly type: "RailroadChoiceExpression"
      readonly alternatives: readonly RailroadMember[]
    })
  | (TreeNode & {
      readonly type:
        | "RailroadOptionalCall"
        | "RailroadOneOrMoreCall"
        | "RailroadZeroOrMoreCall"
        | "RailroadGroupExpression"
        | "RailroadOptionalGroupExpression"
        | "RailroadRepetitionGroupExpression"
      readonly element: RailroadExpression
    })
  | (TreeNode & {
      readonly type: "RailroadPostfixExpression" | "RailroadPredicateExpression"
      readonly operator: string
      readonly element: RailroadExpression
    })
  | (TreeNode & {
      readonly type: "RailroadExceptionExpression"
      readonly left: RailroadExpression
      readonly right: RailroadExpression
    })
  | (TreeNode & {
      readonly type: "RailroadSpecialSequence" | "RailroadNumericValue"
    })
  | (TreeNode & {
      readonly type: "RailroadRepeatExpression"
      readonly repeat: NumericLiteral | RailroadRepeatRange
      readonly element: RailroadExpression
    })
  | (TreeNode & { readonly type: "RailroadAnyExpression" })

/** Metadata retains all assignments, including null values and discarded titles. */
type RailroadStatement =
  | (TreeNode & {
      readonly type: "RailroadRule"
      readonly name: Identifier
      readonly definition: RailroadExpression
    })
  | (TreeNode & {
      readonly type:
        | "RailroadTitleStatement"
        | "RailroadAccTitleStatement"
        | "RailroadAccDescrStatement"
        | "RailroadAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "RailroadIgnoredText" })
