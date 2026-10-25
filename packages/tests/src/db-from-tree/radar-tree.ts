import type {
  Identifier,
  NumericLiteral,
  StringLiteral,
  TreeNode,
} from "./tree.ts"

/** ast/radar.md: only the authored fields that the published summary reads. */
export interface RadarDiagram extends TreeNode {
  readonly type: "RadarDiagram"
  readonly body: readonly RadarStatement[]
}

/** Labels remain optional; an empty quoted label is still present. */
export interface RadarAxis extends TreeNode {
  readonly name: Identifier
  readonly label: StringLiteral | null
}

/** Both written entry forms survive until the summary resolves named entries. */
type RadarEntry =
  | (TreeNode & {
      readonly type: "RadarNumberEntry"
      readonly value: NumericLiteral
    })
  | (TreeNode & {
      readonly type: "RadarNamedEntry"
      readonly axis: Identifier
      readonly value: NumericLiteral
    })

/** Each curve retains its original entry order, including duplicate and extra names. */
interface RadarCurve extends RadarAxis {
  readonly entries: readonly RadarEntry[]
}

/** Options retain authored fixed words or numeric leaves before publication. */
type RadarOption =
  | (TreeNode & {
      readonly type: "RadarShowLegendOption" | "RadarGraticuleOption"
      readonly value: string
    })
  | (TreeNode & {
      readonly type: "RadarTicksOption" | "RadarMaxOption" | "RadarMinOption"
      readonly value: NumericLiteral
    })

/** Accepted statements; semantic acceptance has already been decided by the parser. */
type RadarStatement =
  | (TreeNode & {
      readonly type: "RadarAxisStatement"
      readonly axes: readonly RadarAxis[]
    })
  | (TreeNode & {
      readonly type: "RadarCurveStatement"
      readonly curves: readonly RadarCurve[]
    })
  | (TreeNode & {
      readonly type: "RadarOptionsStatement"
      readonly options: readonly RadarOption[]
    })
  | (TreeNode & {
      readonly type:
        | "RadarTitleStatement"
        | "RadarAccTitleStatement"
        | "RadarAccDescrStatement"
        | "RadarAccDescrBlockStatement"
      readonly value: TreeNode | null
    })
  | (TreeNode & { readonly type: "RadarIgnoredText" })
