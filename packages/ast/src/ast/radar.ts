/** The nineteen authored source nodes defined by ast/radar.md. */
import type {
  NodeBase,
  Identifier,
  StringLiteral,
  NumericLiteral,
} from "../ast.ts"

/**
 * ast/radar.md, RadarDiagram: retained pre-header forms, optional colon gap and source-ordered body.
 *
 * ```text
 * radar-beta:
 * ^^^^^^^^^^^
 * ```
 */
export interface RadarDiagram extends NodeBase {
  readonly type: "RadarDiagram"
  readonly textBeforeHeader: readonly RadarIgnoredText[]
  readonly textBeforeColon: readonly RadarIgnoredText[]
  readonly body: readonly RadarBodyItem[]
}

/**
 * ast/radar.md, RadarAxisStatement: one nonempty authored comma group of axes.
 *
 * ```text
 * axis A["Axis A"], B
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarAxisStatement extends NodeBase {
  readonly type: "RadarAxisStatement"
  readonly axes: readonly RadarAxis[]
}

/**
 * ast/radar.md, RadarCurveStatement: one nonempty authored comma group of curves.
 *
 * ```text
 * curve c['Curve']{1, 2}
 * ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarCurveStatement extends NodeBase {
  readonly type: "RadarCurveStatement"
  readonly curves: readonly RadarCurve[]
}

/**
 * ast/radar.md, RadarOptionsStatement: one nonempty authored comma group of options, retaining repeats.
 *
 * ```text
 * showLegend false, ticks 33
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarOptionsStatement extends NodeBase {
  readonly type: "RadarOptionsStatement"
  readonly options: readonly RadarOption[]
}

/**
 * ast/radar.md, RadarAxis: written name and optional quoted label, with each hidden gap retained.
 *
 * ```text
 * axis A["Axis A"], B
 *      ^^^^^^^^^^^
 * ```
 */
export interface RadarAxis extends NodeBase {
  readonly type: "RadarAxis"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly name: Identifier
  readonly textBeforeLabel: readonly RadarIgnoredText[]
  readonly textBeforeLabelValue: readonly RadarIgnoredText[]
  readonly label: StringLiteral | null
  readonly textBeforeLabelClose: readonly RadarIgnoredText[]
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarCurve: written name, optional label and nonempty homogeneous entry list.
 *
 * ```text
 * curve c['Curve']{1, 2}
 *       ^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarCurve extends NodeBase {
  readonly type: "RadarCurve"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly name: Identifier
  readonly textBeforeLabel: readonly RadarIgnoredText[]
  readonly textBeforeLabelValue: readonly RadarIgnoredText[]
  readonly label: StringLiteral | null
  readonly textBeforeLabelClose: readonly RadarIgnoredText[]
  readonly textBeforeEntries: readonly RadarIgnoredText[]
  readonly entries: readonly RadarEntry[]
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarNumberEntry: a positional value, retaining hidden forms across permitted newlines.
 *
 * ```text
 * curve c{3, 4}
 *         ^
 * ```
 */
export interface RadarNumberEntry extends NodeBase {
  readonly type: "RadarNumberEntry"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly value: NumericLiteral
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarNamedEntry: an authored axis reference and value, with gaps around an optional colon.
 *
 * ```text
 * axis A
 * curve c{A 1}
 *         ^^^
 * ```
 */
export interface RadarNamedEntry extends NodeBase {
  readonly type: "RadarNamedEntry"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly axis: Identifier
  readonly textBeforeColon: readonly RadarIgnoredText[]
  readonly textBeforeValue: readonly RadarIgnoredText[]
  readonly value: NumericLiteral
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarShowLegendOption: the written true/false word and its hidden gaps.
 *
 * ```text
 * showLegend false
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarShowLegendOption extends NodeBase {
  readonly type: "RadarShowLegendOption"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly textBeforeValue: readonly RadarIgnoredText[]
  readonly value: string
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarTicksOption: the written numeric value before any publication cap.
 *
 * ```text
 * ticks 33
 * ^^^^^^^^
 * ```
 */
export interface RadarTicksOption extends NodeBase {
  readonly type: "RadarTicksOption"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly textBeforeValue: readonly RadarIgnoredText[]
  readonly value: NumericLiteral
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarMaxOption: the written maximum, without replacing its raw spelling.
 *
 * ```text
 * max 10
 * ^^^^^^
 * ```
 */
export interface RadarMaxOption extends NodeBase {
  readonly type: "RadarMaxOption"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly textBeforeValue: readonly RadarIgnoredText[]
  readonly value: NumericLiteral
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarMinOption: the written minimum, without replacing its raw spelling.
 *
 * ```text
 * min 0
 * ^^^^^
 * ```
 */
export interface RadarMinOption extends NodeBase {
  readonly type: "RadarMinOption"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly textBeforeValue: readonly RadarIgnoredText[]
  readonly value: NumericLiteral
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarGraticuleOption: the written circle/polygon word and its hidden gaps.
 *
 * ```text
 * graticule polygon
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarGraticuleOption extends NodeBase {
  readonly type: "RadarGraticuleOption"
  readonly textBefore: readonly RadarIgnoredText[]
  readonly textBeforeValue: readonly RadarIgnoredText[]
  readonly value: string
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarTitleStatement: the line value after one ASCII separator, or null, and its hidden suffix.
 *
 * ```text
 * title Radar
 * ^^^^^^^^^^^
 * ```
 */
export interface RadarTitleStatement extends NodeBase {
  readonly type: "RadarTitleStatement"
  readonly value: RadarLiteral | null
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarAccTitleStatement: the colon-line value with padding, or null, and its hidden suffix.
 *
 * ```text
 * accTitle: Axis comparison
 * ^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarAccTitleStatement extends NodeBase {
  readonly type: "RadarAccTitleStatement"
  readonly value: RadarLiteral | null
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarAccDescrStatement: the colon-line description with padding, or null, and its hidden suffix.
 *
 * ```text
 * accDescr: Short
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarAccDescrStatement extends NodeBase {
  readonly type: "RadarAccDescrStatement"
  readonly value: RadarLiteral | null
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarAccDescrBlockStatement: the first-close block with trimmed interior, or null, and its hidden suffix.
 *
 * ```text
 * accDescr { Long }
 * ^^^^^^^^^^^^^^^^^
 * ```
 */
export interface RadarAccDescrBlockStatement extends NodeBase {
  readonly type: "RadarAccDescrBlockStatement"
  readonly value: RadarLiteral | null
  readonly textAfter: readonly RadarIgnoredText[]
}

/**
 * ast/radar.md, RadarLiteral: authored common-value text, without common trivia. No child fields.
 *
 * ```text
 * title Radar
 *       ^^^^^
 * ```
 */
export interface RadarLiteral extends NodeBase {
  readonly type: "RadarLiteral"
  readonly value: string
}

/**
 * ast/radar.md, RadarIgnoredText: one complete fenced form, excluding its consumed following LF. No child fields.
 *
 * ```text
 * %%{}%%
 * ^^^^^^
 * ```
 */
export interface RadarIgnoredText extends NodeBase {
  readonly type: "RadarIgnoredText"
  readonly kind: "yaml-block" | "directive"
  readonly value: string
}

/** Written body forms, in source order. */
export type RadarBodyItem =
  | RadarAxisStatement
  | RadarCurveStatement
  | RadarOptionsStatement
  | RadarTitleStatement
  | RadarAccTitleStatement
  | RadarAccDescrStatement
  | RadarAccDescrBlockStatement
  | RadarIgnoredText

/** One authored entry form; each curve uses only one form. */
export type RadarEntry = RadarNumberEntry | RadarNamedEntry

/** Fixed option forms; repeated assignments stay separate. */
export type RadarOption =
  | RadarShowLegendOption
  | RadarTicksOption
  | RadarMaxOption
  | RadarMinOption
  | RadarGraticuleOption

/** Every node of the radar tree. */
export type RadarNode =
  | RadarDiagram
  | RadarBodyItem
  | RadarAxis
  | RadarCurve
  | RadarEntry
  | RadarOption
  | RadarLiteral
