import type { SequenceStatement } from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"

/** The blocks whose statements are one body, closed by `end`. */
export type SequenceBodyBlockStatement = Extract<
  SequenceStatement,
  {
    type:
      | "SequenceBoxStatement"
      | "SequenceLoopStatement"
      | "SequenceRectStatement"
      | "SequenceOptStatement"
      | "SequenceBreakStatement"
  }
>

/**
 * The blocks of sections: each section is closed by the next one, and the
 * last by `end`.
 */
export type SequenceSectionBlockStatement = Extract<
  SequenceStatement,
  {
    type:
      | "SequenceAltStatement"
      | "SequenceParStatement"
      | "SequenceParOverStatement"
      | "SequenceCriticalStatement"
  }
>

/** The statements that hold statements of their own, with an `end`. */
export type SequenceBlockStatement =
  SequenceBodyBlockStatement | SequenceSectionBlockStatement

/** A statement that holds no other statement. */
export type SequenceSimpleStatement = Exclude<
  SequenceStatement,
  SequenceBlockStatement
>

/** A statement, with the kind of statement it is. */
export type ClassifiedSequenceStatement =
  | { readonly kind: "body"; readonly statement: SequenceBodyBlockStatement }
  | {
      readonly kind: "sections"
      readonly statement: SequenceSectionBlockStatement
    }
  | { readonly kind: "simple"; readonly statement: SequenceSimpleStatement }

/**
 * Which kind of statement a node is: a block with one body, a block of
 * sections, or a statement that holds no other; null for a node that is no
 * statement of a sequence diagram. The kinds are decided here only. Every
 * statement type is listed, the node of each case is checked against the
 * type of its kind, and the check after the cases fails when a statement
 * type of the tree is not listed. The function has a module of its own
 * because `kept-lines.ts` asks for the kinds too, and `sequence-layout.ts`
 * imports `kept-lines.ts`.
 */
export function classifySequenceStatement(
  node: SequenceStatement,
): ClassifiedSequenceStatement
export function classifySequenceStatement(
  node: MermaidAst,
): ClassifiedSequenceStatement | null
export function classifySequenceStatement(
  node: MermaidAst,
): ClassifiedSequenceStatement | null {
  switch (node.type) {
    case "SequenceBoxStatement":
    case "SequenceLoopStatement":
    case "SequenceRectStatement":
    case "SequenceOptStatement":
    case "SequenceBreakStatement":
      return { kind: "body", statement: node }
    case "SequenceAltStatement":
    case "SequenceParStatement":
    case "SequenceParOverStatement":
    case "SequenceCriticalStatement":
      return { kind: "sections", statement: node }
    case "SequenceParticipantStatement":
    case "SequenceDestroyStatement":
    case "SequenceMessageStatement":
    case "SequenceAutonumberStatement":
    case "SequenceActivateStatement":
    case "SequenceDeactivateStatement":
    case "SequenceNoteStatement":
    case "SequenceLinksStatement":
    case "SequenceLinkStatement":
    case "SequencePropertiesStatement":
    case "SequenceDetailsStatement":
    case "SequenceTitleStatement":
    case "SequenceAccTitleStatement":
    case "SequenceAccDescrStatement":
    case "SequenceAccDescrBlockStatement":
    case "SequenceIgnoredStatement":
      return { kind: "simple", statement: node }
    default:
      node satisfies Exclude<MermaidAst, SequenceStatement>
      return null
  }
}
