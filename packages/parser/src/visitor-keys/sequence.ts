import type { SequenceNode } from "../ast/sequence.ts"

/**
 * ast/sequence.md, Nodes: the child fields of every sequence node type, as
 * each node's section states them, in the order in which a walk visits
 * them.
 */
export const sequenceVisitorKeys: Readonly<
  Record<SequenceNode["type"], readonly string[]>
> = {
  SequenceDiagram: ["body"],
  SequenceParticipantStatement: ["id", "data", "alias"],
  SequenceDestroyStatement: ["id"],
  SequenceBoxStatement: ["text", "body"],
  SequenceBoxText: ["colorCandidate", "remainder"],
  SequenceMessageStatement: ["from", "arrow", "to", "text"],
  SequenceArrow: [],
  SequenceAutonumberStatement: ["start", "step"],
  SequenceActivateStatement: ["id"],
  SequenceDeactivateStatement: ["id"],
  SequenceNoteStatement: ["ids", "text"],
  SequenceLinksStatement: ["id", "text"],
  SequenceLinkStatement: ["id", "text"],
  SequencePropertiesStatement: ["id", "text"],
  SequenceDetailsStatement: ["id", "text"],
  SequenceTitleStatement: ["value"],
  SequenceAccTitleStatement: ["value"],
  SequenceAccDescrStatement: ["value"],
  SequenceAccDescrBlockStatement: ["value"],
  SequenceLoopStatement: ["text", "body"],
  SequenceRectStatement: ["color", "body"],
  SequenceOptStatement: ["text", "body"],
  SequenceBreakStatement: ["text", "body"],
  SequenceAltStatement: ["sections"],
  SequenceParStatement: ["sections"],
  SequenceParOverStatement: ["sections"],
  SequenceCriticalStatement: ["sections"],
  SequenceSection: ["text", "body"],
  SequenceIgnoredStatement: [],
  SequenceIdentifier: [],
  SequenceText: ["value"],
  SequenceLiteral: [],
  SequenceDataBlock: [],
}
