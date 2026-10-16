/**
 * The nodes of a sequence tree that the Db reads: the fields of
 * `packages/spec/docs/ast/sequence.md` that `sequence.ts` uses, and no others.
 */
import type { NumericLiteral, TreeNode } from "./tree.ts"

/** ast/sequence.md: SequenceDiagram. */
export interface SequenceDiagram extends TreeNode {
  readonly type: "SequenceDiagram"
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md: SequenceStatement. */
export type SequenceStatement =
  | SequenceParticipantStatement
  | SequenceDestroyStatement
  | SequenceBoxStatement
  | SequenceMessageStatement
  | SequenceAutonumberStatement
  | SequenceActivateStatement
  | SequenceDeactivateStatement
  | SequenceNoteStatement
  | SequenceLinksStatement
  | SequenceLinkStatement
  | SequencePropertiesStatement
  | SequenceDetailsStatement
  | SequenceTitleStatement
  | SequenceAccTitleStatement
  | SequenceAccDescrStatement
  | SequenceAccDescrBlockStatement
  | SequenceLoopStatement
  | SequenceRectStatement
  | SequenceOptStatement
  | SequenceBreakStatement
  | SequenceAltStatement
  | SequenceParStatement
  | SequenceParOverStatement
  | SequenceCriticalStatement
  | SequenceIgnoredStatement

/** ast/sequence.md: SequenceParticipantKind. */
export type SequenceParticipantKind = "participant" | "actor"

/** ast/sequence.md: SequenceParticipantStatement. */
export interface SequenceParticipantStatement extends TreeNode {
  readonly type: "SequenceParticipantStatement"
  readonly kind: SequenceParticipantKind
  readonly created: boolean
  readonly id: SequenceIdentifier
  readonly data: TreeNode | null
  readonly alias: SequenceText | null
}

/** ast/sequence.md: SequenceDestroyStatement. */
export interface SequenceDestroyStatement extends TreeNode {
  readonly type: "SequenceDestroyStatement"
  readonly created: boolean
  readonly id: SequenceIdentifier
}

/** ast/sequence.md: SequenceBoxStatement. */
export interface SequenceBoxStatement extends TreeNode {
  readonly type: "SequenceBoxStatement"
  readonly text: SequenceBoxText | null
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md: SequenceBoxText. */
export interface SequenceBoxText extends TreeNode {
  readonly type: "SequenceBoxText"
  readonly colorCandidate: SequenceLiteral | null
  readonly remainder: SequenceLiteral | null
}

/** ast/sequence.md: SequenceActivation. */
export type SequenceActivation = "+" | "-"

/** ast/sequence.md: SequenceMessageStatement. */
export interface SequenceMessageStatement extends TreeNode {
  readonly type: "SequenceMessageStatement"
  readonly from: SequenceIdentifier
  readonly fromCentralConnection: boolean
  readonly arrow: SequenceArrow
  readonly activation: SequenceActivation | null
  readonly toCentralConnection: boolean
  readonly to: SequenceIdentifier
  readonly text: SequenceText | null
}

/** ast/sequence.md: SequenceArrowMarker. */
export type SequenceArrowMarker =
  | "none"
  | "arrow"
  | "cross"
  | "open-arrow"
  | "half-arrow-top"
  | "half-arrow-bottom"
  | "half-stick-top"
  | "half-stick-bottom"

/** ast/sequence.md: SequenceArrowLine. */
export type SequenceArrowLine = "solid" | "dotted"

/** ast/sequence.md: SequenceArrow. */
export interface SequenceArrow extends TreeNode {
  readonly type: "SequenceArrow"
  readonly value: string
  readonly startMarker: SequenceArrowMarker
  readonly line: SequenceArrowLine
  readonly endMarker: SequenceArrowMarker
}

/** ast/sequence.md: SequenceAutonumberStatement. */
export interface SequenceAutonumberStatement extends TreeNode {
  readonly type: "SequenceAutonumberStatement"
  readonly start: NumericLiteral | null
  readonly step: NumericLiteral | null
  readonly off: boolean
}

/** ast/sequence.md: SequenceActivateStatement. */
export interface SequenceActivateStatement extends TreeNode {
  readonly type: "SequenceActivateStatement"
  readonly id: SequenceIdentifier
}

/** ast/sequence.md: SequenceDeactivateStatement. */
export interface SequenceDeactivateStatement extends TreeNode {
  readonly type: "SequenceDeactivateStatement"
  readonly id: SequenceIdentifier
}

/** ast/sequence.md: SequenceNotePlacement. */
export type SequenceNotePlacement = "left of" | "right of" | "over"

/** ast/sequence.md: SequenceNoteStatement. */
export interface SequenceNoteStatement extends TreeNode {
  readonly type: "SequenceNoteStatement"
  readonly placement: SequenceNotePlacement
  readonly ids: readonly SequenceIdentifier[]
  readonly text: SequenceText | null
}

/** ast/sequence.md: SequenceLinksStatement. */
export interface SequenceLinksStatement extends TreeNode {
  readonly type: "SequenceLinksStatement"
  readonly id: SequenceIdentifier
  readonly text: SequenceText | null
}

/** ast/sequence.md: SequenceLinkStatement. */
export interface SequenceLinkStatement extends TreeNode {
  readonly type: "SequenceLinkStatement"
  readonly id: SequenceIdentifier
  readonly text: SequenceText | null
}

/** ast/sequence.md: SequencePropertiesStatement. */
export interface SequencePropertiesStatement extends TreeNode {
  readonly type: "SequencePropertiesStatement"
  readonly id: SequenceIdentifier
  readonly text: SequenceText | null
}

/** ast/sequence.md: SequenceDetailsStatement. */
export interface SequenceDetailsStatement extends TreeNode {
  readonly type: "SequenceDetailsStatement"
  readonly id: SequenceIdentifier
  readonly text: SequenceText | null
}

/** ast/sequence.md: SequenceTitleStatement. */
export interface SequenceTitleStatement extends TreeNode {
  readonly type: "SequenceTitleStatement"
  readonly value: SequenceLiteral
}

/** ast/sequence.md: SequenceAccTitleStatement. */
export interface SequenceAccTitleStatement extends TreeNode {
  readonly type: "SequenceAccTitleStatement"
  readonly value: SequenceLiteral | null
}

/** ast/sequence.md: SequenceAccDescrStatement. */
export interface SequenceAccDescrStatement extends TreeNode {
  readonly type: "SequenceAccDescrStatement"
  readonly value: SequenceLiteral | null
}

/** ast/sequence.md: SequenceAccDescrBlockStatement. */
export interface SequenceAccDescrBlockStatement extends TreeNode {
  readonly type: "SequenceAccDescrBlockStatement"
  readonly value: SequenceLiteral | null
  readonly closed: boolean
}

/** ast/sequence.md: SequenceLoopStatement. */
export interface SequenceLoopStatement extends TreeNode {
  readonly type: "SequenceLoopStatement"
  readonly text: SequenceText | null
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md: SequenceOptStatement. */
export interface SequenceOptStatement extends TreeNode {
  readonly type: "SequenceOptStatement"
  readonly text: SequenceText | null
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md: SequenceBreakStatement. */
export interface SequenceBreakStatement extends TreeNode {
  readonly type: "SequenceBreakStatement"
  readonly text: SequenceText | null
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md: SequenceRectStatement. */
export interface SequenceRectStatement extends TreeNode {
  readonly type: "SequenceRectStatement"
  readonly color: SequenceText | null
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md: SequenceAltStatement. */
export interface SequenceAltStatement extends TreeNode {
  readonly type: "SequenceAltStatement"
  readonly sections: readonly SequenceSection[]
}

/** ast/sequence.md: SequenceParStatement. */
export interface SequenceParStatement extends TreeNode {
  readonly type: "SequenceParStatement"
  readonly sections: readonly SequenceSection[]
}

/** ast/sequence.md: SequenceParOverStatement. */
export interface SequenceParOverStatement extends TreeNode {
  readonly type: "SequenceParOverStatement"
  readonly sections: readonly SequenceSection[]
}

/** ast/sequence.md: SequenceCriticalStatement. */
export interface SequenceCriticalStatement extends TreeNode {
  readonly type: "SequenceCriticalStatement"
  readonly sections: readonly SequenceSection[]
}

/** ast/sequence.md: SequenceSection. */
export interface SequenceSection extends TreeNode {
  readonly type: "SequenceSection"
  readonly text: SequenceText | null
  readonly body: readonly SequenceStatement[]
}

/** ast/sequence.md: SequenceIgnoredStatement. */
export interface SequenceIgnoredStatement extends TreeNode {
  readonly type: "SequenceIgnoredStatement"
}

/** ast/sequence.md: SequenceWrap. */
export type SequenceWrap = "wrap" | "nowrap"

/** ast/sequence.md: SequenceIdentifier. */
export interface SequenceIdentifier extends TreeNode {
  readonly type: "SequenceIdentifier"
  readonly name: string
}

/** ast/sequence.md: SequenceText. */
export interface SequenceText extends TreeNode {
  readonly type: "SequenceText"
  readonly wrap: SequenceWrap | null
  readonly value: SequenceLiteral | null
}

/** ast/sequence.md: SequenceLiteral. */
export interface SequenceLiteral extends TreeNode {
  readonly type: "SequenceLiteral"
  readonly value: string
}
