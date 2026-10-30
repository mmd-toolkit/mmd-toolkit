import type { Identifier, NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/eventmodeling.md, EventmodelingDiagram: Retained pre-header forms and all authored body occurrences.
 *
 * ```text
 * eventmodeling
 * ^^^^^^^^^^^^^
 * ```
 */
export interface EventmodelingDiagram extends NodeBase {
  readonly type: "EventmodelingDiagram"
  /** Retained pre-header forms. */
  readonly textBeforeHeader: readonly EventmodelingIgnoredText[]
  /** All authored statements and body hidden forms. */
  readonly body: readonly EventmodelingBodyItem[]
}

/**
 * ast/eventmodeling.md, EventmodelingTimeFrameStatement: A time frame with its written name, sources and optional data.
 *
 * ```text
 * tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface EventmodelingTimeFrameStatement extends NodeBase {
  readonly type: "EventmodelingTimeFrameStatement"
  /** Forms before frame name. */
  readonly textBeforeName: readonly EventmodelingIgnoredText[]
  /** Authored digit-string name. */
  readonly name: Identifier
  /** Forms before entity-type word. */
  readonly textBeforeModelEntityType: readonly EventmodelingIgnoredText[]
  /** Written entity-type word. */
  readonly modelEntityType: string
  /** Forms before qualified name. */
  readonly textBeforeEntityIdentifier: readonly EventmodelingIgnoredText[]
  /** Written entity name. */
  readonly entityIdentifier: EventmodelingQualifiedName
  /** All sources, including repetitions. */
  readonly sourceFrames: readonly EventmodelingSourceReference[]
  /** Explicit data reference. */
  readonly dataReference: EventmodelingDataReference | null
  /** Explicit inline data. */
  readonly data: EventmodelingInlineData | null
}

/**
 * ast/eventmodeling.md, EventmodelingResetFrameStatement: A reset frame with its written name, sources and optional data.
 *
 * ```text
 * rf 02 cmd Shop.Buy
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface EventmodelingResetFrameStatement extends NodeBase {
  readonly type: "EventmodelingResetFrameStatement"
  /** Forms before frame name. */
  readonly textBeforeName: readonly EventmodelingIgnoredText[]
  /** Authored digit-string name. */
  readonly name: Identifier
  /** Forms before entity-type word. */
  readonly textBeforeModelEntityType: readonly EventmodelingIgnoredText[]
  /** Written entity-type word. */
  readonly modelEntityType: string
  /** Forms before qualified name. */
  readonly textBeforeEntityIdentifier: readonly EventmodelingIgnoredText[]
  /** Written entity name. */
  readonly entityIdentifier: EventmodelingQualifiedName
  /** All sources, including repetitions. */
  readonly sourceFrames: readonly EventmodelingSourceReference[]
  /** Explicit data reference. */
  readonly dataReference: EventmodelingDataReference | null
  /** Explicit inline data. */
  readonly data: EventmodelingInlineData | null
}

/**
 * ast/eventmodeling.md, EventmodelingQualifiedName: A head segment followed by dot/name members.
 *
 * ```text
 * entity Shop.Buy
 *        ^^^^^^^^
 * ```
 */
export interface EventmodelingQualifiedName extends NodeBase {
  readonly type: "EventmodelingQualifiedName"
  /** First segment. */
  readonly head: Identifier
  /** Dot/name members in source order. */
  readonly tail: readonly EventmodelingQualifiedNamePart[]
}

/**
 * ast/eventmodeling.md, EventmodelingQualifiedNamePart: One dot/name member and its independently owned gaps.
 *
 * ```text
 * entity Shop.Buy
 *            ^^^^
 * ```
 */
export interface EventmodelingQualifiedNamePart extends NodeBase {
  readonly type: "EventmodelingQualifiedNamePart"
  /** Forms before dot. */
  readonly textBeforeDot: readonly EventmodelingIgnoredText[]
  /** Forms after dot, before name. */
  readonly textBeforeName: readonly EventmodelingIgnoredText[]
  /** Following segment. */
  readonly name: Identifier
}

/**
 * ast/eventmodeling.md, EventmodelingSourceReference: A whole arrow and an unresolved digit-string frame reference.
 *
 * ```text
 * tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
 *                       ^^^^^^
 * ```
 */
export interface EventmodelingSourceReference extends NodeBase {
  readonly type: "EventmodelingSourceReference"
  /** Forms before arrow. */
  readonly textBefore: readonly EventmodelingIgnoredText[]
  /** Authored arrow. */
  readonly arrow: EventmodelingArrow
  /** Forms between arrow and name. */
  readonly textBeforeFrame: readonly EventmodelingIgnoredText[]
  /** Authored frame reference name. */
  readonly frame: Identifier
}

/**
 * ast/eventmodeling.md, EventmodelingArrow: The complete authored solid arrow. No child fields.
 *
 * ```text
 * tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
 *                       ^^^
 * ```
 */
export interface EventmodelingArrow extends NodeBase {
  readonly type: "EventmodelingArrow"
  /** Written ->>. */
  readonly value: "->>"
  /** none. */
  readonly startMarker: "none"
  /** solid. */
  readonly line: "solid"
  /** arrow. */
  readonly endMarker: "arrow"
}

/**
 * ast/eventmodeling.md, EventmodelingDataReference: A bracketed single-identifier reference and its named gaps.
 *
 * ```text
 * tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
 *                                     ^^^^^
 * ```
 */
export interface EventmodelingDataReference extends NodeBase {
  readonly type: "EventmodelingDataReference"
  /** Forms before opener. */
  readonly textBefore: readonly EventmodelingIgnoredText[]
  /** Forms after opener. */
  readonly textBeforeName: readonly EventmodelingIgnoredText[]
  /** Single authored data name. */
  readonly name: Identifier
  /** Forms before closer. */
  readonly textBeforeClose: readonly EventmodelingIgnoredText[]
}

/**
 * ast/eventmodeling.md, EventmodelingInlineData: An optional type tag and quoted or brace inline payload.
 *
 * ```text
 * tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
 *                                           ^^^^^^^^^
 * ```
 */
export interface EventmodelingInlineData extends NodeBase {
  readonly type: "EventmodelingInlineData"
  /** Forms before tag or body opener. */
  readonly textBefore: readonly EventmodelingIgnoredText[]
  /** Written data-type word. */
  readonly dataType: string | null
  /** Forms after opening backtick. */
  readonly textBeforeDataType: readonly EventmodelingIgnoredText[]
  /** Forms before closing backtick. */
  readonly textBeforeTypeClose: readonly EventmodelingIgnoredText[]
  /** Forms after closing backtick. */
  readonly textBeforeValue: readonly EventmodelingIgnoredText[]
  /** Quoted or brace interior. */
  readonly value: StringLiteral | EventmodelingLiteral | null
}

/**
 * ast/eventmodeling.md, EventmodelingDataBlock: An optional type tag and the complete multiline brace interior.
 *
 * ```text
 * data D `text`{
 *        ^^^^^^^
 * y
 * ^
 * }
 * ^
 * ```
 */
export interface EventmodelingDataBlock extends NodeBase {
  readonly type: "EventmodelingDataBlock"
  /** Forms before tag or body opener. */
  readonly textBefore: readonly EventmodelingIgnoredText[]
  /** Written data-type word. */
  readonly dataType: string | null
  /** Forms after opening backtick. */
  readonly textBeforeDataType: readonly EventmodelingIgnoredText[]
  /** Forms before closing backtick. */
  readonly textBeforeTypeClose: readonly EventmodelingIgnoredText[]
  /** Forms after closing backtick. */
  readonly textBeforeValue: readonly EventmodelingIgnoredText[]
  /** Entire brace interior. */
  readonly value: EventmodelingLiteral
}

/**
 * ast/eventmodeling.md, EventmodelingModelEntityStatement: An authored qualified declaration name.
 *
 * ```text
 * entity Shop.Buy
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface EventmodelingModelEntityStatement extends NodeBase {
  readonly type: "EventmodelingModelEntityStatement"
  /** Forms after entity. */
  readonly textBeforeName: readonly EventmodelingIgnoredText[]
  /** Authored declaration name. */
  readonly name: EventmodelingQualifiedName
}

/**
 * ast/eventmodeling.md, EventmodelingDataEntityStatement: A single declaration name and required data block.
 *
 * ```text
 * data D `text`{
 * ^^^^^^^^^^^^^^
 * y
 * ^
 * }
 * ^
 * ```
 */
export interface EventmodelingDataEntityStatement extends NodeBase {
  readonly type: "EventmodelingDataEntityStatement"
  /** Forms after data keyword. */
  readonly textBeforeName: readonly EventmodelingIgnoredText[]
  /** Single authored declaration name. */
  readonly name: Identifier
  /** Required block and optional tag. */
  readonly data: EventmodelingDataBlock
}

/**
 * ast/eventmodeling.md, EventmodelingNoteStatement: An unresolved frame reference and required data block.
 *
 * ```text
 * note 99 {
 * ^^^^^^^^^
 * }
 * ^
 * ```
 */
export interface EventmodelingNoteStatement extends NodeBase {
  readonly type: "EventmodelingNoteStatement"
  /** Forms after note. */
  readonly textBeforeSourceFrame: readonly EventmodelingIgnoredText[]
  /** Written frame reference. */
  readonly sourceFrame: Identifier
  /** Required block and optional tag. */
  readonly data: EventmodelingDataBlock
}

/**
 * ast/eventmodeling.md, EventmodelingGwtStatement: A frame reference with required given/then and optional when clauses.
 *
 * ```text
 * gwt 99 given evt Bought when cmd Buy then ui Screen
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface EventmodelingGwtStatement extends NodeBase {
  readonly type: "EventmodelingGwtStatement"
  /** Forms after gwt. */
  readonly textBeforeSourceFrame: readonly EventmodelingIgnoredText[]
  /** Written frame reference. */
  readonly sourceFrame: Identifier
  /** Required given clause. */
  readonly given: EventmodelingGwtClause
  /** Written when clause. */
  readonly when: EventmodelingGwtClause | null
  /** Required then clause. */
  readonly then: EventmodelingGwtClause
}

/**
 * ast/eventmodeling.md, EventmodelingGwtClause: One clause keyword and its nonempty ordered item list.
 *
 * ```text
 * gwt 99 given evt Bought when cmd Buy then ui Screen
 *        ^^^^^^^^^^^^^^^^
 * ```
 */
export interface EventmodelingGwtClause extends NodeBase {
  readonly type: "EventmodelingGwtClause"
  /** Forms before clause keyword. */
  readonly textBefore: readonly EventmodelingIgnoredText[]
  /** given, when or then. */
  readonly kind: "given" | "when" | "then"
  /** One or more authored items. */
  readonly body: readonly EventmodelingGwtItem[]
}

/**
 * ast/eventmodeling.md, EventmodelingGwtItem: A written entity-type word and single-identifier reference.
 *
 * ```text
 * gwt 99 given evt Bought when cmd Buy then ui Screen
 *              ^^^^^^^^^^
 * ```
 */
export interface EventmodelingGwtItem extends NodeBase {
  readonly type: "EventmodelingGwtItem"
  /** Forms before type word. */
  readonly textBefore: readonly EventmodelingIgnoredText[]
  /** Written entity-type word. */
  readonly modelEntityType: string
  /** Forms before entity name. */
  readonly textBeforeEntityIdentifier: readonly EventmodelingIgnoredText[]
  /** Single authored entity reference. */
  readonly entityIdentifier: Identifier
}

/**
 * ast/eventmodeling.md, EventmodelingTitleStatement: The title payload after its one ASCII separator, or null.
 *
 * ```text
 * tf 03 ui Shop.Screen accDescr {} title All
 *                                  ^^^^^^^^^
 * ```
 */
export interface EventmodelingTitleStatement extends NodeBase {
  readonly type: "EventmodelingTitleStatement"
  /** Authored payload. */
  readonly value: EventmodelingLiteral | null
}

/**
 * ast/eventmodeling.md, EventmodelingAccTitleStatement: The accessibility title payload after its colon, or null.
 *
 * ```text
 * eventmodeling accTitle: Title
 *               ^^^^^^^^^^^^^^^
 * ```
 */
export interface EventmodelingAccTitleStatement extends NodeBase {
  readonly type: "EventmodelingAccTitleStatement"
  /** Authored payload. */
  readonly value: EventmodelingLiteral | null
}

/**
 * ast/eventmodeling.md, EventmodelingAccDescrStatement: The accessibility description line payload, or null.
 *
 * ```text
 * tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
 *                                                     ^^^^^^^^^^^
 * ```
 */
export interface EventmodelingAccDescrStatement extends NodeBase {
  readonly type: "EventmodelingAccDescrStatement"
  /** Authored payload. */
  readonly value: EventmodelingLiteral | null
}

/**
 * ast/eventmodeling.md, EventmodelingAccDescrBlockStatement: The untrimmed first-close description block payload, or null.
 *
 * ```text
 * tf 03 ui Shop.Screen accDescr {} title All
 *                      ^^^^^^^^^^^
 * ```
 */
export interface EventmodelingAccDescrBlockStatement extends NodeBase {
  readonly type: "EventmodelingAccDescrBlockStatement"
  /** Authored payload. */
  readonly value: EventmodelingLiteral | null
}

/**
 * ast/eventmodeling.md, EventmodelingLiteral: Unconverted authored payload, including owned whitespace. No child fields.
 *
 * ```text
 * tf 01 evt Shop.Bought ->> 02 ->> 02 [[D]] `json`{x} accDescr: D
 *                                                  ^
 * ```
 */
export interface EventmodelingLiteral extends NodeBase {
  readonly type: "EventmodelingLiteral"
  /** Unconverted authored payload. */
  readonly value: string
}

/**
 * ast/eventmodeling.md, EventmodelingIgnoredText: A whole native hidden form, excluding consumed following LF. No child fields.
 *
 * ```text
 * ---
 * ^^^
 * hidden
 * ^^^^^^
 * ---
 * ^^^
 * ```
 */
export interface EventmodelingIgnoredText extends NodeBase {
  readonly type: "EventmodelingIgnoredText"
  /** yaml-block or directive. */
  readonly kind: "yaml-block" | "directive"
  /** Written native ignored form. */
  readonly value: string
}

/** Every complete authored statement and top-level hidden form. */
export type EventmodelingBodyItem =
  | EventmodelingTimeFrameStatement
  | EventmodelingResetFrameStatement
  | EventmodelingModelEntityStatement
  | EventmodelingDataEntityStatement
  | EventmodelingNoteStatement
  | EventmodelingGwtStatement
  | EventmodelingTitleStatement
  | EventmodelingAccTitleStatement
  | EventmodelingAccDescrStatement
  | EventmodelingAccDescrBlockStatement
  | EventmodelingIgnoredText

/** Every node defined by ast/eventmodeling.md. */
export type EventmodelingNode =
  | EventmodelingDiagram
  | EventmodelingBodyItem
  | EventmodelingQualifiedName
  | EventmodelingQualifiedNamePart
  | EventmodelingSourceReference
  | EventmodelingArrow
  | EventmodelingDataReference
  | EventmodelingInlineData
  | EventmodelingDataBlock
  | EventmodelingGwtClause
  | EventmodelingGwtItem
  | EventmodelingLiteral
