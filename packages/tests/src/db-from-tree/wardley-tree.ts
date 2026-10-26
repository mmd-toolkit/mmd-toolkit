import type { NumericLiteral, StringLiteral, TreeNode } from "./tree.ts"

/** ast/wardley.md: only authored fields that the summary reads. */
export interface WardleyDiagram extends TreeNode {
  readonly type: "WardleyDiagram"
  readonly body: readonly WardleyStatement[]
}

/** Comparison names retain their authored leaf until common conversion. */
type Name = StringLiteral | (TreeNode & { readonly type: "WardleyIdentifier" })

/** The pair stays in written visibility/evolution order. */
interface Coordinates extends TreeNode {
  readonly visibility: NumericLiteral
  readonly evolution: NumericLiteral
}

/** Signs belong to the decoration, not to its unsigned numeric leaves. */
export interface WardleyLabelOffset extends TreeNode {
  readonly type: "WardleyLabelOffsetDecoration"
  readonly negativeX: boolean
  readonly offsetX: NumericLiteral
  readonly negativeY: boolean
  readonly offsetY: NumericLiteral
}

/** The four authored decoration forms have separate tree nodes. */
type Decoration =
  | WardleyLabelOffset
  | (TreeNode & {
      readonly type: "WardleySourceStrategyDecoration"
      readonly value: string
    })
  | (TreeNode & {
      readonly type:
        "WardleyInertiaDecoration" | "WardleyParenthesizedInertiaDecoration"
    })

/** Every statement occurrence remains, even when its value is later replaced. */
type WardleyStatement =
  | (TreeNode & {
      readonly type:
        | "WardleyAnchorStatement"
        | "WardleyAcceleratorStatement"
        | "WardleyDeacceleratorStatement"
      readonly name: Name
      readonly coordinates: Coordinates
    })
  | (TreeNode & {
      readonly type: "WardleyComponentStatement"
      readonly name: Name
      readonly coordinates: Coordinates
      readonly decorations: readonly Decoration[]
    })
  | (TreeNode & {
      readonly type: "WardleyPipelineStatement"
      readonly parent: Name
      readonly body: readonly (
        | (TreeNode & { readonly type: "WardleyIgnoredText" })
        | (TreeNode & {
            readonly type: "WardleyPipelineComponent"
            readonly name: Name
            readonly evolution: NumericLiteral
            readonly labelOffset: WardleyLabelOffset | null
          })
      )[]
    })
  | (TreeNode & {
      readonly type: "WardleyLinkStatement"
      readonly from: Name
      readonly to: Name
      readonly fromPort: string | null
      readonly toPort: string | null
      readonly arrow: TreeNode | null
      readonly label: TreeNode | null
    })
  | (TreeNode & {
      readonly type: "WardleyEvolveStatement"
      readonly component: Name
      readonly target: NumericLiteral
    })
  | (TreeNode & {
      readonly type: "WardleyNoteStatement"
      readonly text: StringLiteral
      readonly coordinates: Coordinates
    })
  | (TreeNode & {
      readonly type: "WardleyAnnotationStatement"
      readonly text: StringLiteral
      readonly coordinates: Coordinates
      readonly number: NumericLiteral
    })
  | (TreeNode & {
      readonly type: "WardleyAnnotationsStatement"
      readonly coordinates: Coordinates
    })
  | (TreeNode & {
      readonly type: "WardleyEvolutionStatement"
      readonly stages: readonly (TreeNode & {
        readonly name: Name
        readonly boundary: NumericLiteral | null
        readonly secondName: Name | null
      })[]
    })
  | (TreeNode & {
      readonly type: "WardleySizeStatement"
      readonly width: NumericLiteral
      readonly height: NumericLiteral
    })
  | (TreeNode & {
      readonly type:
        | "WardleyTitleStatement"
        | "WardleyAccTitleStatement"
        | "WardleyAccDescrStatement"
        | "WardleyAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "WardleyIgnoredText" })
