import type { NumericLiteral, StringLiteral, TreeNode } from "./tree.ts"

/** ast/pie.md: only the fields that the Db reads. */
export interface PieDiagram extends TreeNode {
  readonly type: "PieDiagram"
  readonly showData: boolean
  readonly body: readonly PieStatement[]
}

/** Written common text; hidden forms never supply a Db value. */
export interface PieLiteral extends TreeNode {
  readonly type: "PieLiteral"
}

/** All retained occurrences, including duplicates and empty common assignments. */
export type PieStatement =
  PieSectionStatement | PieCommonStatement | PieIgnoredText

/** A section contributes its first converted-label value. */
export interface PieSectionStatement extends TreeNode {
  readonly type: "PieSectionStatement"
  readonly label: StringLiteral
  readonly value: NumericLiteral
}

/** Final common assignments are published only after the complete walk. */
export interface PieCommonStatement extends TreeNode {
  readonly type:
    | "PieTitleStatement"
    | "PieAccTitleStatement"
    | "PieAccDescrStatement"
    | "PieAccDescrBlockStatement"
  readonly value: PieLiteral | null
}

/** Hidden YAML and DIRECTIVE forms have no Db effect. */
export interface PieIgnoredText extends TreeNode {
  readonly type: "PieIgnoredText"
}
