import type { NodeBase, StringLiteral, NumericLiteral } from "../ast.ts"

/**
 * ast/wardley.md, WardleyDiagram: authored fields and named hidden-form gaps.
 *
 * ```text
 * wardley-beta
 * ^^^^^^^^^^^^
 * ```
 */
export interface WardleyDiagram extends NodeBase {
  readonly type: "WardleyDiagram"
  readonly textBeforeHeader: readonly WardleyIgnoredText[]
  readonly body: readonly WardleyBodyItem[]
}

/**
 * ast/wardley.md, WardleyAnchorStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * anchor User [0.9,0.8]
 * ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyAnchorStatement extends NodeBase {
  readonly type: "WardleyAnchorStatement"
  readonly textBeforeName: readonly WardleyIgnoredText[]
  readonly name: WardleyIdentifier | StringLiteral
  readonly textBeforeCoordinates: readonly WardleyIgnoredText[]
  readonly coordinates: WardleyCoordinates
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyComponentStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * component A [0.4,0.5] label [-0,-2] (build) inertia
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyComponentStatement extends NodeBase {
  readonly type: "WardleyComponentStatement"
  readonly textBeforeName: readonly WardleyIgnoredText[]
  readonly name: WardleyIdentifier | StringLiteral
  readonly textBeforeCoordinates: readonly WardleyIgnoredText[]
  readonly coordinates: WardleyCoordinates
  readonly decorations: readonly WardleyDecoration[]
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyLinkStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * User -> Child; label
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyLinkStatement extends NodeBase {
  readonly type: "WardleyLinkStatement"
  readonly from: WardleyIdentifier | StringLiteral
  readonly textBeforeFromPort: readonly WardleyIgnoredText[]
  readonly fromPort: string | null
  readonly textBeforeArrow: readonly WardleyIgnoredText[]
  readonly arrow: WardleyArrow | null
  readonly textBeforeTo: readonly WardleyIgnoredText[]
  readonly to: WardleyIdentifier | StringLiteral
  readonly textBeforeToPort: readonly WardleyIgnoredText[]
  readonly toPort: string | null
  readonly textBeforeLabel: readonly WardleyIgnoredText[]
  readonly label: WardleyLiteral | null
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyEvolveStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * evolve A 0.9
 * ^^^^^^^^^^^^
 * ```
 */
export interface WardleyEvolveStatement extends NodeBase {
  readonly type: "WardleyEvolveStatement"
  readonly textBeforeComponent: readonly WardleyIgnoredText[]
  readonly component: WardleyIdentifier | StringLiteral
  readonly textBeforeTarget: readonly WardleyIgnoredText[]
  readonly target: NumericLiteral
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyPipelineStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * component A [0.4,0.5]
 * pipeline A {
 * ^^^^^^^^^^^^
 * component Child [0.6]
 * ^^^^^^^^^^^^^^^^^^^^^
 * }
 * ^
 * ```
 */
export interface WardleyPipelineStatement extends NodeBase {
  readonly type: "WardleyPipelineStatement"
  readonly textBeforeParent: readonly WardleyIgnoredText[]
  readonly parent: WardleyIdentifier | StringLiteral
  readonly textBeforeBody: readonly WardleyIgnoredText[]
  readonly textAfterOpen: readonly WardleyIgnoredText[]
  readonly body: readonly WardleyPipelineBodyItem[]
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyPipelineComponent: authored fields and named hidden-form gaps.
 *
 * ```text
 * component A [0.4,0.5]
 * pipeline A {
 * component Child [0.6]
 * ^^^^^^^^^^^^^^^^^^^^^
 * }
 * ```
 */
export interface WardleyPipelineComponent extends NodeBase {
  readonly type: "WardleyPipelineComponent"
  readonly textBeforeName: readonly WardleyIgnoredText[]
  readonly name: WardleyIdentifier | StringLiteral
  readonly textBeforeOpen: readonly WardleyIgnoredText[]
  readonly textBeforeEvolution: readonly WardleyIgnoredText[]
  readonly evolution: NumericLiteral
  readonly textBeforeClose: readonly WardleyIgnoredText[]
  readonly labelOffset: WardleyLabelOffsetDecoration | null
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyNoteStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * note "N" [0.1,0.2]
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyNoteStatement extends NodeBase {
  readonly type: "WardleyNoteStatement"
  readonly textBeforeText: readonly WardleyIgnoredText[]
  readonly text: StringLiteral
  readonly textBeforeCoordinates: readonly WardleyIgnoredText[]
  readonly coordinates: WardleyCoordinates
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyAnnotationsStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * annotations [10,20]
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyAnnotationsStatement extends NodeBase {
  readonly type: "WardleyAnnotationsStatement"
  readonly textBeforeCoordinates: readonly WardleyIgnoredText[]
  readonly coordinates: WardleyCoordinates
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyAnnotationStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * annotation 1,[30,40] "Text"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyAnnotationStatement extends NodeBase {
  readonly type: "WardleyAnnotationStatement"
  readonly textBeforeNumber: readonly WardleyIgnoredText[]
  readonly number: NumericLiteral
  readonly textBeforeComma: readonly WardleyIgnoredText[]
  readonly textBeforeCoordinates: readonly WardleyIgnoredText[]
  readonly coordinates: WardleyCoordinates
  readonly textBeforeText: readonly WardleyIgnoredText[]
  readonly text: StringLiteral
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyAcceleratorStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * accelerator X [0.2,0.3]
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyAcceleratorStatement extends NodeBase {
  readonly type: "WardleyAcceleratorStatement"
  readonly textBeforeName: readonly WardleyIgnoredText[]
  readonly name: WardleyIdentifier | StringLiteral
  readonly textBeforeCoordinates: readonly WardleyIgnoredText[]
  readonly coordinates: WardleyCoordinates
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyDeacceleratorStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * deaccelerator Y [0.3,0.4]
 * ^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyDeacceleratorStatement extends NodeBase {
  readonly type: "WardleyDeacceleratorStatement"
  readonly textBeforeName: readonly WardleyIgnoredText[]
  readonly name: WardleyIdentifier | StringLiteral
  readonly textBeforeCoordinates: readonly WardleyIgnoredText[]
  readonly coordinates: WardleyCoordinates
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyEvolutionStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * evolution " G "@0.3 / C -> P@1.0
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyEvolutionStatement extends NodeBase {
  readonly type: "WardleyEvolutionStatement"
  readonly stages: readonly WardleyEvolutionStage[]
}

/**
 * ast/wardley.md, WardleyEvolutionStage: authored fields and named hidden-form gaps.
 *
 * ```text
 * evolution " G "@0.3 / C -> P@1.0
 *           ^^^^^^^^^^^^^
 * ```
 */
export interface WardleyEvolutionStage extends NodeBase {
  readonly type: "WardleyEvolutionStage"
  readonly textBefore: readonly WardleyIgnoredText[]
  readonly name: WardleyIdentifier | StringLiteral
  readonly textBeforeBoundaryMark: readonly WardleyIgnoredText[]
  readonly textBeforeBoundary: readonly WardleyIgnoredText[]
  readonly boundary: NumericLiteral | null
  readonly textBeforeSecondNameMark: readonly WardleyIgnoredText[]
  readonly textBeforeSecondName: readonly WardleyIgnoredText[]
  readonly secondName: WardleyIdentifier | StringLiteral | null
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleySizeStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * size [900,600]
 * ^^^^^^^^^^^^^^
 * ```
 */
export interface WardleySizeStatement extends NodeBase {
  readonly type: "WardleySizeStatement"
  readonly textBeforeOpen: readonly WardleyIgnoredText[]
  readonly textBeforeWidth: readonly WardleyIgnoredText[]
  readonly width: NumericLiteral
  readonly textBeforeComma: readonly WardleyIgnoredText[]
  readonly textBeforeHeight: readonly WardleyIgnoredText[]
  readonly height: NumericLiteral
  readonly textBeforeClose: readonly WardleyIgnoredText[]
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyCoordinates: authored fields and named hidden-form gaps.
 *
 * ```text
 * anchor User [0.9,0.8]
 *             ^^^^^^^^^
 * ```
 */
export interface WardleyCoordinates extends NodeBase {
  readonly type: "WardleyCoordinates"
  readonly textBeforeVisibility: readonly WardleyIgnoredText[]
  readonly visibility: NumericLiteral
  readonly textBeforeComma: readonly WardleyIgnoredText[]
  readonly textBeforeEvolution: readonly WardleyIgnoredText[]
  readonly evolution: NumericLiteral
  readonly textBeforeClose: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyLabelOffsetDecoration: authored fields and named hidden-form gaps.
 *
 * ```text
 * component A [0.4,0.5] label [-0,-2] (build) inertia
 *                       ^^^^^^^^^^^^^
 * ```
 */
export interface WardleyLabelOffsetDecoration extends NodeBase {
  readonly type: "WardleyLabelOffsetDecoration"
  readonly textBefore: readonly WardleyIgnoredText[]
  readonly textBeforeOpen: readonly WardleyIgnoredText[]
  readonly textBeforeX: readonly WardleyIgnoredText[]
  readonly negativeX: boolean
  readonly textAfterXSign: readonly WardleyIgnoredText[]
  readonly offsetX: NumericLiteral
  readonly textBeforeComma: readonly WardleyIgnoredText[]
  readonly textBeforeY: readonly WardleyIgnoredText[]
  readonly negativeY: boolean
  readonly textAfterYSign: readonly WardleyIgnoredText[]
  readonly offsetY: NumericLiteral
  readonly textBeforeClose: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleySourceStrategyDecoration: authored fields and named hidden-form gaps.
 *
 * ```text
 * component A [0.4,0.5] label [-0,-2] (build) inertia
 *                                     ^^^^^^^
 * ```
 */
export interface WardleySourceStrategyDecoration extends NodeBase {
  readonly type: "WardleySourceStrategyDecoration"
  readonly textBefore: readonly WardleyIgnoredText[]
  readonly textBeforeValue: readonly WardleyIgnoredText[]
  readonly value: string
  readonly textBeforeClose: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyInertiaDecoration: authored fields and named hidden-form gaps.
 *
 * ```text
 * component A [0.4,0.5] label [-0,-2] (build) inertia
 *                                             ^^^^^^^
 * ```
 */
export interface WardleyInertiaDecoration extends NodeBase {
  readonly type: "WardleyInertiaDecoration"
  readonly textBefore: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyParenthesizedInertiaDecoration: authored fields and named hidden-form gaps.
 *
 * ```text
 * component B [0.2,0.3] (inertia)
 *                       ^^^^^^^^^
 * ```
 */
export interface WardleyParenthesizedInertiaDecoration extends NodeBase {
  readonly type: "WardleyParenthesizedInertiaDecoration"
  readonly textBefore: readonly WardleyIgnoredText[]
  readonly textBeforeInertia: readonly WardleyIgnoredText[]
  readonly textBeforeClose: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyArrow: authored fields and named hidden-form gaps.
 *
 * ```text
 * A +'flow'<> B; annotation
 *   ^^^^^^^^^
 * ```
 */
export interface WardleyArrow extends NodeBase {
  readonly type: "WardleyArrow"
  readonly value: string
  readonly kind: string
  readonly line: string
  readonly startMarker: string
  readonly label: StringLiteral | null
  readonly endMarker: string
}

/**
 * ast/wardley.md, WardleyTitleStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * title T
 * ^^^^^^^
 * ```
 */
export interface WardleyTitleStatement extends NodeBase {
  readonly type: "WardleyTitleStatement"
  readonly value: WardleyLiteral | null
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyAccTitleStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * accTitle: A
 * ^^^^^^^^^^^
 * ```
 */
export interface WardleyAccTitleStatement extends NodeBase {
  readonly type: "WardleyAccTitleStatement"
  readonly value: WardleyLiteral | null
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyAccDescrStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * accDescr: Short
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface WardleyAccDescrStatement extends NodeBase {
  readonly type: "WardleyAccDescrStatement"
  readonly value: WardleyLiteral | null
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyAccDescrBlockStatement: authored fields and named hidden-form gaps.
 *
 * ```text
 * accDescr { D
 * ^^^^^^^^^^^^
 *  E }
 * ^^^^
 * ```
 */
export interface WardleyAccDescrBlockStatement extends NodeBase {
  readonly type: "WardleyAccDescrBlockStatement"
  readonly value: WardleyLiteral | null
  readonly textAfter: readonly WardleyIgnoredText[]
}

/**
 * ast/wardley.md, WardleyIdentifier: authored fields and named hidden-form gaps.
 *
 * ```text
 * anchor User [0.9,0.8]
 *        ^^^^
 * ```
 */
export interface WardleyIdentifier extends NodeBase {
  readonly type: "WardleyIdentifier"
  readonly name: string
}

/**
 * ast/wardley.md, WardleyLiteral: authored fields and named hidden-form gaps.
 *
 * ```text
 * title T
 *       ^
 * ```
 */
export interface WardleyLiteral extends NodeBase {
  readonly type: "WardleyLiteral"
  readonly value: string
}

/**
 * ast/wardley.md, WardleyIgnoredText: authored fields and named hidden-form gaps.
 *
 * ```text
 * wardley-beta
 * %%{!}%%
 * ^^^^^^^
 * ```
 */
export interface WardleyIgnoredText extends NodeBase {
  readonly type: "WardleyIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** All authored statements and body hidden forms, in source order. */
export type WardleyBodyItem =
  | WardleyAnchorStatement
  | WardleyComponentStatement
  | WardleyLinkStatement
  | WardleyEvolveStatement
  | WardleyPipelineStatement
  | WardleyNoteStatement
  | WardleyAnnotationsStatement
  | WardleyAnnotationStatement
  | WardleyAcceleratorStatement
  | WardleyDeacceleratorStatement
  | WardleyEvolutionStatement
  | WardleySizeStatement
  | WardleyTitleStatement
  | WardleyAccTitleStatement
  | WardleyAccDescrStatement
  | WardleyAccDescrBlockStatement
  | WardleyIgnoredText

/** Authored pipeline members and whole native hidden forms. */
export type WardleyPipelineBodyItem =
  WardleyPipelineComponent | WardleyIgnoredText

/** Written component decorations, in their grammar order. */
export type WardleyDecoration =
  | WardleyLabelOffsetDecoration
  | WardleySourceStrategyDecoration
  | WardleyInertiaDecoration
  | WardleyParenthesizedInertiaDecoration

/** Every node defined by ast/wardley.md. */
export type WardleyNode =
  | WardleyDiagram
  | WardleyAnchorStatement
  | WardleyComponentStatement
  | WardleyLinkStatement
  | WardleyEvolveStatement
  | WardleyPipelineStatement
  | WardleyPipelineComponent
  | WardleyNoteStatement
  | WardleyAnnotationsStatement
  | WardleyAnnotationStatement
  | WardleyAcceleratorStatement
  | WardleyDeacceleratorStatement
  | WardleyEvolutionStatement
  | WardleyEvolutionStage
  | WardleySizeStatement
  | WardleyCoordinates
  | WardleyLabelOffsetDecoration
  | WardleySourceStrategyDecoration
  | WardleyInertiaDecoration
  | WardleyParenthesizedInertiaDecoration
  | WardleyArrow
  | WardleyTitleStatement
  | WardleyAccTitleStatement
  | WardleyAccDescrStatement
  | WardleyAccDescrBlockStatement
  | WardleyIdentifier
  | WardleyLiteral
  | WardleyIgnoredText
