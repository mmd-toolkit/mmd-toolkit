import type { Identifier, TreeNode } from "./tree.ts"

/** ast/eventmodeling.md: authored fields read by the comparison summary only. */
export interface EventmodelingDiagram extends TreeNode {
  readonly type: "EventmodelingDiagram"
  readonly body: readonly EventmodelingStatement[]
}

/** Qualified segments retain their own names; gaps do not become name text. */
interface QualifiedName extends TreeNode {
  readonly head: Identifier
  readonly tail: readonly { readonly name: Identifier }[]
}

/** The body delimiters are source tokens; the optional tag is not published. */
export interface EventmodelingData extends TreeNode {
  readonly type: "EventmodelingInlineData" | "EventmodelingDataBlock"
  readonly value: TreeNode | null
}

/** Frames remain in declaration order, with every written reference available. */
type EventmodelingStatement =
  | (TreeNode & {
      readonly type:
        "EventmodelingTimeFrameStatement" | "EventmodelingResetFrameStatement"
      readonly name: Identifier
      readonly modelEntityType: string
      readonly entityIdentifier: QualifiedName
      readonly sourceFrames: readonly { readonly frame: Identifier }[]
      readonly dataReference: { readonly name: Identifier } | null
      readonly data: EventmodelingData | null
    })
  | (TreeNode & {
      readonly type: "EventmodelingDataEntityStatement"
      readonly name: Identifier
      readonly data: EventmodelingData
    })
  | (TreeNode & {
      readonly type:
        | "EventmodelingTitleStatement"
        | "EventmodelingAccTitleStatement"
        | "EventmodelingAccDescrStatement"
        | "EventmodelingAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & {
      readonly type:
        | "EventmodelingModelEntityStatement"
        | "EventmodelingNoteStatement"
        | "EventmodelingGwtStatement"
        | "EventmodelingIgnoredText"
    })
