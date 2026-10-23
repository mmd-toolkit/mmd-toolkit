/**
 * The nodes of a state tree that the Db reads: the fields of
 * `packages/spec/docs/ast/state.md` that `state.ts` uses, and no others.
 */
import type { Identifier, StringLiteral, TreeNode } from "./tree.ts"

/** ast/state.md: StateDiagram. */
export interface StateDiagram extends TreeNode {
  readonly type: "StateDiagram"
  readonly body: readonly StateStatement[]
}

/** ast/state.md: StateStatement. */
export type StateStatement =
  | StateDefinitionStatement
  | StateTransitionStatement
  | StateCompositeStatement
  | StateAliasDefinitionStatement
  | StatePseudostateDefinitionStatement
  | StateIgnoredStatement
  | StateDividerStatement
  | StateNoteStatement
  | StateFloatingNoteStatement
  | StateClickStatement
  | StateClassDefStatement
  | StateClassStatement
  | StateStyleStatement
  | StateDirectionStatement
  | StateAccTitleStatement
  | StateAccDescrStatement
  | StateAccDescrBlockStatement
  | StateScaleStatement
  | StateHideEmptyDescriptionStatement

/** ast/state.md: StateDefinitionStatement. */
export interface StateDefinitionStatement extends TreeNode {
  readonly type: "StateDefinitionStatement"
  readonly reference: StateReference
  readonly description: StateLiteral | null
}

/** ast/state.md: StateTransitionStatement. */
export interface StateTransitionStatement extends TreeNode {
  readonly type: "StateTransitionStatement"
  readonly from: StateReference
  readonly to: StateReference
  readonly label: StateLiteral | null
}

/** ast/state.md: StateReference. */
export interface StateReference extends TreeNode {
  readonly type: "StateReference"
  readonly state: Identifier | StateTerminal
  readonly cssClass: Identifier | null
}

/** ast/state.md: StateTerminal. */
export interface StateTerminal extends TreeNode {
  readonly type: "StateTerminal"
}

/** ast/state.md: StateCompositeStatement. */
export interface StateCompositeStatement extends TreeNode {
  readonly type: "StateCompositeStatement"
  readonly id: Identifier | null
  readonly body: readonly StateStatement[] | null
}

/** ast/state.md: StateAliasDefinitionStatement. */
export interface StateAliasDefinitionStatement extends TreeNode {
  readonly type: "StateAliasDefinitionStatement"
  readonly description: StringLiteral
  readonly id: StateLiteral | null
  readonly secondDescription: StateLiteral | null
  readonly body: readonly StateStatement[] | null
}

/** ast/state.md: StatePseudostateKind. */
export type StatePseudostateKind = "fork" | "join" | "choice"

/** ast/state.md: StatePseudostateDefinitionStatement. */
export interface StatePseudostateDefinitionStatement extends TreeNode {
  readonly type: "StatePseudostateDefinitionStatement"
  readonly id: StateLiteral | null
  readonly kind: StatePseudostateKind
}

/** ast/state.md: StateDividerStatement. */
export interface StateDividerStatement extends TreeNode {
  readonly type: "StateDividerStatement"
}

/** ast/state.md: StateNotePosition. */
export type StateNotePosition = "left" | "right"

/** ast/state.md: StateNoteStatement. */
export interface StateNoteStatement extends TreeNode {
  readonly type: "StateNoteStatement"
  readonly state: Identifier | null
  readonly text: StateLiteral | null
}

/** ast/state.md: StateFloatingNoteStatement. */
export interface StateFloatingNoteStatement extends TreeNode {
  readonly type: "StateFloatingNoteStatement"
  readonly text: StateLiteral | null
  readonly id: StateLiteral | null
}

/** ast/state.md: StateClickStatement. */
export interface StateClickStatement extends TreeNode {
  readonly type: "StateClickStatement"
  readonly reference: StateReference
  readonly url: StringLiteral
  readonly tooltip: StringLiteral | null
}

/** ast/state.md: StateClassDefStatement. */
export interface StateClassDefStatement extends TreeNode {
  readonly type: "StateClassDefStatement"
  readonly cssClass: Identifier
  readonly styles: readonly (StateLiteral | null)[]
}

/** ast/state.md: StateClassStatement. */
export interface StateClassStatement extends TreeNode {
  readonly type: "StateClassStatement"
  readonly states: readonly Identifier[]
  readonly cssClass: StateLiteral | null
}

/** ast/state.md: StateStyleStatement. */
export interface StateStyleStatement extends TreeNode {
  readonly type: "StateStyleStatement"
  readonly states: readonly (Identifier | null)[]
  readonly styles: readonly (StateLiteral | null)[]
}

/** ast/state.md: StateDirection. */
export type StateDirection = "TB" | "BT" | "RL" | "LR"

/** ast/state.md: StateDirectionStatement. */
export interface StateDirectionStatement extends TreeNode {
  readonly type: "StateDirectionStatement"
  readonly direction: StateDirection
}

/** ast/state.md: StateAccTitleStatement. */
export interface StateAccTitleStatement extends TreeNode {
  readonly type: "StateAccTitleStatement"
  readonly value: StateLiteral | null
}

/** ast/state.md: StateAccDescrStatement. */
export interface StateAccDescrStatement extends TreeNode {
  readonly type: "StateAccDescrStatement"
  readonly value: StateLiteral | null
}

/** ast/state.md: StateAccDescrBlockStatement. */
export interface StateAccDescrBlockStatement extends TreeNode {
  readonly type: "StateAccDescrBlockStatement"
  readonly value: StateLiteral | null
  readonly closed: boolean
}

/** ast/state.md: StateScaleStatement. */
export interface StateScaleStatement extends TreeNode {
  readonly type: "StateScaleStatement"
}

/** ast/state.md: StateHideEmptyDescriptionStatement. */
export interface StateHideEmptyDescriptionStatement extends TreeNode {
  readonly type: "StateHideEmptyDescriptionStatement"
}

/** ast/state.md: StateIgnoredStatement. */
export interface StateIgnoredStatement extends TreeNode {
  readonly type: "StateIgnoredStatement"
  readonly value: string
}

/** ast/state.md: StateLiteral. */
export interface StateLiteral extends TreeNode {
  readonly type: "StateLiteral"
  readonly value: string
}

/** ast/state.md: StateIgnoredText. */
export interface StateIgnoredText extends TreeNode {
  readonly type: "StateIgnoredText"
  readonly value: string
}
