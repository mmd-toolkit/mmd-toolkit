/**
 * The nodes of the flowchart tree, as defined in
 * `packages/spec/docs/ast/flowchart.md`, for the diagram types
 * `flowchart-v2`, `flowchart-elk`, and `swimlane`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source, which the Db normalization applies where it uses them.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after a header line, such
 * as `flowchart LR`.
 */
import type {
  Identifier,
  NodeBase,
  NumericLiteral,
  StringLiteral,
} from "../ast.ts"

/**
 * ast/flowchart.md, FlowchartDiagram: the body of the diagram types
 * `flowchart-v2`, `flowchart-elk`, and `swimlane`. Its child field is `body`.
 * The header keyword is not a field; its token is in `Root.tokens`.
 *
 * ```text
 * flowchart LR
 * ^^^^^^^^^^^^
 * A --> B
 * ^^^^^^^
 * B --> C
 * ^^^^^^^
 * ```
 */
export interface FlowchartDiagram extends NodeBase {
  readonly type: "FlowchartDiagram"
  /**
   * The direction of the header as written, such as `LR`, `TD`, or `<`,
   * without whitespace; null when there is none.
   */
  readonly direction: string | null
  /** The statements, in source order. */
  readonly body: readonly FlowchartStatement[]
}

/** ast/flowchart.md, FlowchartDiagram: FlowchartStatement. */
export type FlowchartStatement =
  | FlowchartEmptyStatement
  | FlowchartVertexStatement
  | FlowchartSubgraphStatement
  | FlowchartStyleStatement
  | FlowchartClassDefStatement
  | FlowchartClassStatement
  | FlowchartClickCallbackStatement
  | FlowchartClickUrlStatement
  | FlowchartLinkStyleStatement
  | FlowchartDefaultLinkStyleStatement
  | FlowchartDirectionStatement
  | FlowchartAccTitleStatement
  | FlowchartAccDescrStatement
  | FlowchartAccDescrBlockStatement

/**
 * ast/flowchart.md, FlowchartEmptyStatement: a `;` that the grammar reads as
 * a statement of its own, not as the separator of the statement before it.
 * No fields and no child fields; its range is that of its `;`. In the
 * example, the first `;` is the separator of the vertex statement.
 *
 * ```text
 * A --> B;;
 *         ^
 * ```
 */
export interface FlowchartEmptyStatement extends NodeBase {
  readonly type: "FlowchartEmptyStatement"
}

/**
 * ast/flowchart.md, FlowchartVertexStatement: a chain of vertex groups
 * joined by links, such as `A`, `A & B --> C`, or `A --> B --> C`. Its child
 * fields are `first` and `links`. The source of each link is the `target`
 * of the link before it, or `first` for the first link. The separator after
 * the statement is not part of it.
 *
 * ```text
 * A & B --> C;
 * ^^^^^^^^^^^
 *
 * A -->
 * ^^^^^
 *   B
 * ^^^
 * ```
 */
export interface FlowchartVertexStatement extends NodeBase {
  readonly type: "FlowchartVertexStatement"
  /** The first vertex group. */
  readonly first: FlowchartVertexGroup
  /** The links, in source order; each leads to its `target`. */
  readonly links: readonly FlowchartLink[]
}

/**
 * ast/flowchart.md, FlowchartVertexGroup: vertices joined by `&`. A single
 * vertex is a group of one. Its child field is `vertices`.
 *
 * ```text
 * A & B --> C
 * ^^^^^
 * ```
 */
export interface FlowchartVertexGroup extends NodeBase {
  readonly type: "FlowchartVertexGroup"
  /** One or more, in source order. */
  readonly vertices: readonly FlowchartVertex[]
}

/**
 * ast/flowchart.md, FlowchartVertex: one occurrence of a vertex. Its child
 * fields are `id`, `shape`, `className`, and `data`. Its range covers its
 * data blocks, and so do the ranges of the group and the statement that
 * hold it.
 *
 * ```text
 * A[text]:::c@{ shape: rect } --> B
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartVertex extends NodeBase {
  readonly type: "FlowchartVertex"
  /** The id, commas included. */
  readonly id: Identifier
  /** The shape with its label; null when the vertex is written without one. */
  readonly shape: FlowchartShape | null
  /** The class after `:::`, commas included; null when there is none. */
  readonly className: Identifier | null
  /** The data blocks written right after the vertex, one after another, in source order; empty when there is none. */
  readonly data: readonly FlowchartDataBlock[]
}

/**
 * diagrams/flowchart.md, Shapes: the name of a shape, by the brackets it is
 * written with: a word that mermaid.js accepts for the same shape in a data
 * block, `A@{ shape: ... }`. The Db type of the vertex comes from the name.
 *
 * - `"rectangle"`: Written `[...]`, or `[|name:value|...]` with a property; the
 *   Db type `square`, or `rect` with a property.
 * - `"rounded"`: Written `(...)`; the Db type `round`.
 * - `"circle"`: Written `((...))`; the Db type `circle`.
 * - `"double-circle"`: Written `(((...)))`; the Db type `doublecircle`.
 * - `"diamond"`: Written `{...}`; the Db type `diamond`.
 * - `"hexagon"`: Written `{{...}}`; the Db type `hexagon`.
 * - `"stadium"`: Written `([...])`; the Db type `stadium`.
 * - `"framed-rectangle"`: Written `[[...]]`; the Db type `subroutine`.
 * - `"cylinder"`: Written `[(...)]`; the Db type `cylinder`.
 * - `"odd"`: Written `>...]`; the Db type `odd`.
 * - `"ellipse"`: Written `(-...-)`; the Db type `ellipse`.
 * - `"trapezoid-bottom"`: Written `[/...\]`; the Db type `trapezoid`.
 * - `"lean-right"`: Written `[/.../]`; the Db type `lean_right`.
 * - `"trapezoid-top"`: Written `[\.../]`; the Db type `inv_trapezoid`.
 * - `"lean-left"`: Written `[\...\]`; the Db type `lean_left`.
 */
export type FlowchartShapeName =
  /** Written `[...]`, or `[|name:value|...]` with a property; the Db type `square`, or `rect` with a property. */
  | "rectangle"
  /** Written `(...)`; the Db type `round`. */
  | "rounded"
  /** Written `((...))`; the Db type `circle`. */
  | "circle"
  /** Written `(((...)))`; the Db type `doublecircle`. */
  | "double-circle"
  /** Written `{...}`; the Db type `diamond`. */
  | "diamond"
  /** Written `{{...}}`; the Db type `hexagon`. */
  | "hexagon"
  /** Written `([...])`; the Db type `stadium`. */
  | "stadium"
  /** Written `[[...]]`; the Db type `subroutine`. */
  | "framed-rectangle"
  /** Written `[(...)]`; the Db type `cylinder`. */
  | "cylinder"
  /** Written `>...]`; the Db type `odd`. */
  | "odd"
  /** Written `(-...-)`; the Db type `ellipse`. */
  | "ellipse"
  /** Written `[/...\]`; the Db type `trapezoid`. */
  | "trapezoid-bottom"
  /** Written `[/.../]`; the Db type `lean_right`. */
  | "lean-right"
  /** Written `[\.../]`; the Db type `inv_trapezoid`. */
  | "trapezoid-top"
  /** Written `[\...\]`; the Db type `lean_left`. */
  | "lean-left"

/**
 * ast/flowchart.md, FlowchartShape. Its child fields are `property` and
 * `label`, in source order. `property` is not null exactly when the shape is
 * written as `[|name:value|...]`, whose name is `rectangle`, as that of `[...]`
 * is.
 *
 * ```text
 * A[text]:::c
 *  ^^^^^^
 *
 * A(( text ))
 *  ^^^^^^^^^^
 * ```
 */
export interface FlowchartShape extends NodeBase {
  readonly type: "FlowchartShape"
  /** The name of the shape; see {@link FlowchartShapeName}. */
  readonly name: FlowchartShapeName
  /** The property of a rectangle written with `[|`; null for every other shape. */
  readonly property: FlowchartShapeProperty | null
  /** The label inside the shape. */
  readonly label: FlowchartLabel
}

/**
 * ast/flowchart.md, FlowchartShapeProperty: the property of a rectangle
 * written with `[|`.
 * Its child fields are `name` and `value`. Its range runs from the name to
 * the value; the `|` around them are not part of it.
 *
 * ```text
 * A[|borders:lt|text]
 *    ^^^^^^^^^^
 * ```
 */
export interface FlowchartShapeProperty extends NodeBase {
  readonly type: "FlowchartShapeProperty"
  /** The name before `:`, such as `borders`. */
  readonly name: Identifier
  /** The value after `:`, such as `lt`. */
  readonly value: Identifier
}

/**
 * ast/flowchart.md, FlowchartLink: one arrow with what belongs to it. Its
 * child fields are `id`, `opening`, `arrow`, `label`, and `target`. The
 * range runs from the first token of the link to the last token of its
 * target.
 *
 * ```text
 * A e1@-->|text| B & C --> D
 *   ^^^^^^^^^^^^^^^^^^
 *
 * A -- text --> B
 *   ^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartLink extends NodeBase {
  readonly type: "FlowchartLink"
  /** The edge id written before the arrow, without its `@`; null when there is none. */
  readonly id: Identifier | null
  /** The opening arrow of a link with text between two arrows; null otherwise. */
  readonly opening: FlowchartOpeningArrow | null
  /** The arrow, or the closing arrow of a link with text between two arrows. */
  readonly arrow: FlowchartArrow
  /** The text between the arrows or between `|`; null when there is none. */
  readonly label: FlowchartLabel | null
  /** The vertex group the link leads to. */
  readonly target: FlowchartVertexGroup
}

/**
 * ast/flowchart.md, FlowchartArrow and FlowchartOpeningArrow: the marker at
 * an end of the line of a flowchart arrow, before the line (`startMarker`)
 * or after it (`endMarker`).
 *
 * - `"none"`: No marker; the line ends plain, as both ends of `---`.
 * - `"arrow"`: An arrowhead, `<` before the line and `>` after it, as in `<-->`.
 * - `"cross"`: A cross, `x` before or after the line, as in `x--x`.
 * - `"circle"`: A circle, `o` before or after the line, as in `o--o`.
 */
export type FlowchartArrowMarker =
  /** No marker; the line ends plain, as both ends of `---`. */
  | "none"
  /** An arrowhead, `<` before the line and `>` after it, as in `<-->`. */
  | "arrow"
  /** A cross, `x` before or after the line, as in `x--x`. */
  | "cross"
  /** A circle, `o` before or after the line, as in `o--o`. */
  | "circle"

/**
 * ast/flowchart.md, FlowchartArrow: the line of a closed flowchart arrow,
 * by the character it is drawn with.
 *
 * - `"solid"`: A solid line of `-`, as in `-->`.
 * - `"thick"`: A thick line of `=`, as in `==>`.
 * - `"dotted"`: A dotted line of `.`, as in `-.->` or `.->`.
 * - `"invisible"`: An invisible link of three or more `~`, as in `~~~`.
 */
export type FlowchartArrowLine =
  /** A solid line of `-`, as in `-->`. */
  | "solid"
  /** A thick line of `=`, as in `==>`. */
  | "thick"
  /** A dotted line of `.`, as in `-.->` or `.->`. */
  | "dotted"
  /** An invisible link of three or more `~`, as in `~~~`. */
  | "invisible"

/**
 * ast/flowchart.md, FlowchartOpeningArrow: the line of an opening arrow, the
 * arrow before the text of a link written between two arrows. It is always
 * the line of the link's closing arrow, and never invisible.
 *
 * - `"solid"`: `--`, as in `A-- text -->B`.
 * - `"thick"`: `==`, as in `A== text ==>B`.
 * - `"dotted"`: `-.`, as in `A-. text .->B`.
 */
export type FlowchartOpeningArrowLine =
  /** `--`, as in `A-- text -->B`. */
  | "solid"
  /** `==`, as in `A== text ==>B`. */
  | "thick"
  /** `-.`, as in `A-. text .->B`. */
  | "dotted"

/**
 * ast/flowchart.md, FlowchartArrow: a closed arrow, the arrow of a link or
 * the closing arrow of a link with text between two arrows. No child
 * fields; its range is its token.
 *
 * ```text
 * A x==>|text| B
 *   ^^^^
 * ```
 */
export interface FlowchartArrow extends NodeBase {
  readonly type: "FlowchartArrow"
  /** The text of its range. */
  readonly value: string
  /** The marker before the line; see {@link FlowchartArrowMarker}. */
  readonly startMarker: FlowchartArrowMarker
  /** The line between the markers; see {@link FlowchartArrowLine}. */
  readonly line: FlowchartArrowLine
  /** The number of the characters of the line: its `-`, `=`, or `~`, or, for a dotted line, its `.`. */
  readonly length: number
  /** The marker after the line; see {@link FlowchartArrowMarker}. */
  readonly endMarker: FlowchartArrowMarker
}

/**
 * ast/flowchart.md, FlowchartOpeningArrow: the opening arrow of a link with
 * text between two arrows. No child fields; its range is its token. Its
 * line is always that of the link's closing arrow.
 *
 * ```text
 * A x-- text --x B
 *   ^^^
 * ```
 */
export interface FlowchartOpeningArrow extends NodeBase {
  readonly type: "FlowchartOpeningArrow"
  /** The text of its range. */
  readonly value: string
  /** The marker before the line; see {@link FlowchartArrowMarker}. */
  readonly startMarker: FlowchartArrowMarker
  /** The line after the marker; see {@link FlowchartOpeningArrowLine}. */
  readonly line: FlowchartOpeningArrowLine
}

/**
 * diagrams/flowchart.md, Labels: the kind of a label, by how it starts.
 *
 * - `"text"`: It starts with a text run, as in `A[text]`.
 * - `"string"`: It starts with a string, `"` and `"`, as in `A["text"]`.
 * - `"markdown"`: It starts with a markdown string, a string whose content
 *   is between backticks inside its quotes, as in ``A["`**text**`"]``.
 */
export type FlowchartLabelKind =
  /** It starts with a text run, as in `A[text]`. */
  | "text"
  /** It starts with a string, `"` and `"`, as in `A["text"]`. */
  | "string"
  /** It starts with a markdown string, a string whose content is between backticks inside its quotes, as in ``A["`**text**`"]``. */
  | "markdown"

/**
 * ast/flowchart.md, FlowchartLabel. No child fields. The range runs from
 * the first token of the label to its last, without the whitespace around
 * them. A label that is all whitespace has no token; its range covers its
 * units, as in the last example.
 *
 * ```text
 * A[ text ]
 *    ^^^^
 *
 * A["text"]
 *   ^^^^^^
 *
 * A -->| | B
 *       ^
 * ```
 */
export interface FlowchartLabel extends NodeBase {
  readonly type: "FlowchartLabel"
  /** How the label starts; see {@link FlowchartLabelKind}. */
  readonly kind: FlowchartLabelKind
  /**
   * The text of its range, without the delimiters of the string or markdown
   * string that it starts with.
   */
  readonly value: string
}

/**
 * ast/flowchart.md, FlowchartDataBlock: one data block, from `@{` to the
 * `}` that closes it. Blocks written one after another are a node each, as
 * in the second example. No child fields. The tree does not read the value
 * (known-divergences.md, `embedded-data-opaque`).
 *
 * ```text
 * A@{ shape: rect } --> B
 *  ^^^^^^^^^^^^^^^^
 *
 * A@{ shape: rect }@{ label: x }
 *                  ^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartDataBlock extends NodeBase {
  readonly type: "FlowchartDataBlock"
  /** The text of its range between `@{` and the `}` that closes it. */
  readonly value: string
}

/**
 * ast/flowchart.md, FlowchartSubgraphStatement. Its child fields are `name`,
 * `title`, and `body`.
 *
 * ```text
 * subgraph S [Title]
 * ^^^^^^^^^^^^^^^^^^
 * A --> B
 * ^^^^^^^
 * end
 * ^^^
 * ```
 */
export interface FlowchartSubgraphStatement extends NodeBase {
  readonly type: "FlowchartSubgraphStatement"
  /** The name written after `subgraph`. */
  readonly name: FlowchartLabel
  /** The title between `[` and `]`; null when there is none. */
  readonly title: FlowchartLabel | null
  /** The statements up to `end`, in source order. */
  readonly body: readonly FlowchartStatement[]
}

/**
 * ast/flowchart.md, FlowchartStyleStatement. Its child fields are `id` and
 * `styles`.
 *
 * ```text
 * style A fill:#f00,stroke:#333
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartStyleStatement extends NodeBase {
  readonly type: "FlowchartStyleStatement"
  /** The id, commas included. */
  readonly id: Identifier
  /**
   * The styles, in source order: each a literal whose value is a string
   * with its whitespace, or null for a style that is all whitespace.
   */
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/**
 * ast/flowchart.md, FlowchartClassDefStatement. Its child fields are
 * `classNames` and `styles`.
 *
 * ```text
 * classDef a,b fill:#f00
 * ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartClassDefStatement extends NodeBase {
  readonly type: "FlowchartClassDefStatement"
  /**
   * The class names: the parts of the `id-list` after `classDef` between
   * its `,` units, in source order; null for a part that is empty.
   */
  readonly classNames: readonly (Identifier | null)[]
  /**
   * The styles, as in FlowchartStyleStatement, except that a `,` right
   * after a `\` does not separate two styles but is part of the style.
   */
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/**
 * ast/flowchart.md, FlowchartClassStatement. Its child fields are `ids` and
 * `className`.
 *
 * ```text
 * class A,B c;
 * ^^^^^^^^^^^
 * ```
 */
export interface FlowchartClassStatement extends NodeBase {
  readonly type: "FlowchartClassStatement"
  /**
   * The first id after `class`, as a list: the parts of its `id-list`
   * between its `,` units; null for a part that is empty.
   */
  readonly ids: readonly (Identifier | null)[]
  /** The second id, commas included. */
  readonly className: Identifier
}

/**
 * ast/flowchart.md, FlowchartClickCallbackStatement: a click statement that
 * calls a function, `click A callback` or `click A call callback(arguments)`.
 * Its child fields are `ids`, `callback`, `arguments`, and `tooltip`.
 *
 * ```text
 * click A callback
 * ^^^^^^^^^^^^^^^^
 *
 * click A call callback(1, 2) "tooltip"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartClickCallbackStatement extends NodeBase {
  readonly type: "FlowchartClickCallbackStatement"
  /**
   * The click ids: the parts between the `click-comma` units, in source
   * order; null for a part that is empty.
   */
  readonly ids: readonly (Identifier | null)[]
  /**
   * The name of the function: the characters up to `(`, which may contain
   * whitespace and line breaks; the whitespace at its ends is not part of
   * the name.
   */
  readonly callback: Identifier
  /**
   * The arguments between the parentheses after a `call`, whose value is a
   * string with its whitespace and line feeds; null when there are none, or
   * when only whitespace is between the parentheses.
   */
  readonly arguments: FlowchartLiteral | null
  /** The tooltip string; null when there is none. */
  readonly tooltip: StringLiteral | null
}

/**
 * diagrams/flowchart.md, The statement context: the link target written at
 * the end of a click statement with a URL, as in
 * `click A "url" "tooltip" _blank`. Each is the value of the HTML attribute
 * `target` of the same name, which the Db keeps as `linkTarget`.
 *
 * - `"_self"`: Written `_self`.
 * - `"_blank"`: Written `_blank`.
 * - `"_parent"`: Written `_parent`.
 * - `"_top"`: Written `_top`.
 */
export type FlowchartLinkTarget =
  /** Written `_self`. */
  | "_self"
  /** Written `_blank`. */
  | "_blank"
  /** Written `_parent`. */
  | "_parent"
  /** Written `_top`. */
  | "_top"

/**
 * ast/flowchart.md, FlowchartClickUrlStatement: a click statement that links
 * to a URL, `click A href "url"` or `click A "url" "tooltip" _blank`. Its
 * child fields are `ids`, `url`, and `tooltip`.
 *
 * ```text
 * click A href "https://example.com" "tooltip" _blank
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartClickUrlStatement extends NodeBase {
  readonly type: "FlowchartClickUrlStatement"
  /** As in FlowchartClickCallbackStatement. */
  readonly ids: readonly (Identifier | null)[]
  /** The URL string. */
  readonly url: StringLiteral
  /** As in FlowchartClickCallbackStatement. */
  readonly tooltip: StringLiteral | null
  /** The link target; null when there is none. See {@link FlowchartLinkTarget}. */
  readonly target: FlowchartLinkTarget | null
}

/**
 * ast/flowchart.md, FlowchartLinkStyleStatement: a `linkStyle` statement for
 * numbered links. Its child fields are `indices`, `interpolate`, and
 * `styles`. `interpolate` is not null, or `styles` is not empty, or both. Each number names a link that a statement before it
 * has made.
 *
 * ```text
 * A --> B --> C
 * linkStyle 0,1 stroke:red
 * ^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartLinkStyleStatement extends NodeBase {
  readonly type: "FlowchartLinkStyleStatement"
  /** The numbers, in source order. */
  readonly indices: readonly NumericLiteral[]
  /** The name after `interpolate`; null when there is none. */
  readonly interpolate: Identifier | null
  /** The styles, as in FlowchartStyleStatement; empty when there are none. */
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/**
 * ast/flowchart.md, FlowchartDefaultLinkStyleStatement: a `linkStyle default`
 * statement, which sets the style of every link instead of numbered ones.
 * Its child fields are `interpolate` and `styles`. `interpolate` is not
 * null, or `styles` is not empty, or both.
 *
 * ```text
 * linkStyle default interpolate basis
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartDefaultLinkStyleStatement extends NodeBase {
  readonly type: "FlowchartDefaultLinkStyleStatement"
  /** As in FlowchartLinkStyleStatement. */
  readonly interpolate: Identifier | null
  /** As in FlowchartLinkStyleStatement. */
  readonly styles: readonly (FlowchartLiteral | null)[]
}

/**
 * ast/flowchart.md, FlowchartDirectionStatement: the value of a direction
 * line, as written after `direction`. In a subgraph, the last one is the
 * subgraph's `dir` in the Db, as written; outside a subgraph it changes
 * nothing (diagrams/flowchart.md, Db normalization).
 *
 * - `"TB"`: Written `TB`.
 * - `"BT"`: Written `BT`.
 * - `"RL"`: Written `RL`.
 * - `"LR"`: Written `LR`.
 * - `"TD"`: Written `TD`; it stays `TD` in the Db of a subgraph, while the
 *   same word in the header gives `TB`.
 */
export type FlowchartStatementDirection =
  /** Written `TB`. */
  | "TB"
  /** Written `BT`. */
  | "BT"
  /** Written `RL`. */
  | "RL"
  /** Written `LR`. */
  | "LR"
  /** Written `TD`; it stays `TD` in the Db of a subgraph, while the same word in the header gives `TB`. */
  | "TD"

/**
 * ast/flowchart.md, FlowchartDirectionStatement. Its child fields are
 * `textBefore` and `textAfter`. The range covers the whole direction line,
 * and so the ranges of both texts.
 *
 * ```text
 * direction TB
 * ^^^^^^^^^^^^
 *
 *   A --> B direction TB x
 *   ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartDirectionStatement extends NodeBase {
  readonly type: "FlowchartDirectionStatement"
  /** The text of the direction line before `direction`; null when there is none (when it is empty or all whitespace). */
  readonly textBefore: FlowchartIgnoredText | null
  /** The value after `direction`; see {@link FlowchartStatementDirection}. */
  readonly direction: FlowchartStatementDirection
  /** The text of the direction line after the value; null when there is none. */
  readonly textAfter: FlowchartIgnoredText | null
}

/**
 * ast/flowchart.md, FlowchartAccTitleStatement. Its child field is `value`.
 * The whitespace after `:` is read with it, line breaks included, so the
 * value is null only at the end of the text.
 *
 * ```text
 * accTitle: My chart
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartAccTitleStatement extends NodeBase {
  readonly type: "FlowchartAccTitleStatement"
  /** The text after `accTitle:`, up to the end of the line, whose value is a string; null when there is none. */
  readonly value: FlowchartLiteral | null
}

/**
 * ast/flowchart.md, FlowchartAccDescrStatement: an `accDescr:` statement
 * with its text. Its child field is `value`. The whitespace after `:` is
 * read with it, line breaks included, so the value is null only at the end
 * of the text.
 *
 * ```text
 * accDescr: One line
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface FlowchartAccDescrStatement extends NodeBase {
  readonly type: "FlowchartAccDescrStatement"
  /** The text after `accDescr:`, up to the end of the line, whose value is a string; null when there is none. */
  readonly value: FlowchartLiteral | null
}

/**
 * ast/flowchart.md, FlowchartAccDescrBlockStatement: an `accDescr {`
 * statement with its text and `}`, or with its text up to the end of the
 * text when the block is not closed. Its child field is `value`. A block
 * that is not closed has another effect on the Db than an `accDescr:`
 * statement. A closed block without text, such as `accDescr {}`, changes
 * nothing.
 *
 * ```text
 * accDescr {
 * ^^^^^^^^^^
 *   Two
 * ^^^^^
 *   lines
 * ^^^^^^^
 * }
 * ^
 * ```
 */
export interface FlowchartAccDescrBlockStatement extends NodeBase {
  readonly type: "FlowchartAccDescrBlockStatement"
  /**
   * The text between `accDescr {` and `}`, or to the end of the text when
   * the block is not closed, whose value is a string; null when there is
   * none, which only a block that is not closed may have.
   */
  readonly value: FlowchartLiteral | null
  /** Whether the block ends with `}`; false when the text ends inside the block. */
  readonly closed: boolean
}

/**
 * ast/flowchart.md, FlowchartLiteral: a value that the author writes as
 * text without quotes, at a position where the grammar allows whitespace in
 * it and decides where it ends: a style, the arguments of a callback, or the
 * text of an accessibility statement. Its value is the text of its range, so
 * it keeps the whitespace inside it and has none at its ends. No child
 * fields.
 *
 * ```text
 * style A fill:#f00 , stroke:#333
 *         ^^^^^^^^^
 *
 * classDef c fill:x\,y
 *            ^^^^^^^^^
 *
 * accTitle: My chart
 *           ^^^^^^^^
 * ```
 */
export interface FlowchartLiteral extends NodeBase {
  readonly type: "FlowchartLiteral"
  /** The text of its range. */
  readonly value: string
}

/**
 * ast/flowchart.md, FlowchartIgnoredText: text that the author writes but
 * that mermaid.js does not read, and that has no effect on the diagram: the
 * text of a direction line before `direction` and after the value. Its
 * value is the text of its range, which runs from its first token to its
 * last. No child fields.
 *
 * ```text
 *   A --> B direction TB x
 *   ^^^^^^^
 *
 *   A --> B direction TB x
 *                        ^
 * ```
 */
export interface FlowchartIgnoredText extends NodeBase {
  readonly type: "FlowchartIgnoredText"
  /** The text of its range. */
  readonly value: string
}

/** ast/flowchart.md, Nodes: a flowchart node of any type. */
export type FlowchartNode =
  | FlowchartDiagram
  | FlowchartEmptyStatement
  | FlowchartVertexStatement
  | FlowchartVertexGroup
  | FlowchartVertex
  | FlowchartShape
  | FlowchartShapeProperty
  | FlowchartLink
  | FlowchartArrow
  | FlowchartOpeningArrow
  | FlowchartLabel
  | FlowchartDataBlock
  | FlowchartSubgraphStatement
  | FlowchartStyleStatement
  | FlowchartClassDefStatement
  | FlowchartClassStatement
  | FlowchartClickCallbackStatement
  | FlowchartClickUrlStatement
  | FlowchartLinkStyleStatement
  | FlowchartDefaultLinkStyleStatement
  | FlowchartDirectionStatement
  | FlowchartAccTitleStatement
  | FlowchartAccDescrStatement
  | FlowchartAccDescrBlockStatement
  | FlowchartLiteral
  | FlowchartIgnoredText
