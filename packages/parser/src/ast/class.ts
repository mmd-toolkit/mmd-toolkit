/**
 * The nodes of the class tree, as defined in
 * `packages/spec/docs/ast/class.md`, for the diagram type `classDiagram`.
 *
 * Every type here implements a node of that document with the same name and
 * the same field names. The document is the definition; this file follows
 * it. The values of the fields keep what the author wrote: each is the text
 * of a range (ast.md, Nodes), not the converted form of common.md, Reading
 * a source, which the Db normalization applies where it uses them. A
 * **class** is a box of the diagram, named by a class name; a CSS class is
 * always called a CSS class.
 *
 * The comment of each node type shows examples of the syntax it stands for.
 * The line of `^` under a line of input marks the range of the node. A node
 * that spans several lines has such a line under each of its lines. The
 * examples other than that of the diagram stand after the header line
 * `classDiagram`.
 */
import type { Identifier, NodeBase, StringLiteral } from "../ast.ts"

/**
 * ast/class.md, ClassDiagram: the body of the diagram type `classDiagram`.
 * Its child field is `body`. The header keyword is not a field; its token
 * is in `Root.tokens`. The range runs from the header keyword to the last
 * token of the diagram.
 *
 * ```text
 * classDiagram
 * ^^^^^^^^^^^^
 * class A
 * ^^^^^^^
 * ```
 */
export interface ClassDiagram extends NodeBase {
  readonly type: "ClassDiagram"
  /** The statements, in source order. */
  readonly body: readonly ClassStatement[]
}

/** ast/class.md, ClassDiagram: a statement of a class diagram. */
export type ClassStatement =
  | ClassDeclaration
  | ClassMemberStatement
  | ClassNameStatement
  | ClassAnnotationStatement
  | ClassRelationStatement
  | ClassNamespaceStatement
  | ClassNoteStatement
  | ClassCallbackStatement
  | ClassLinkStatement
  | ClassStyleStatement
  | ClassCssClassStatement
  | ClassClassDefStatement
  | ClassDirectionStatement
  | ClassAccTitleStatement
  | ClassAccDescrStatement
  | ClassAccDescrBlockStatement

/** ast/class.md, ClassDeclaration: a member line of a class body. */
export type ClassMember = ClassMethod | ClassAttribute | ClassAnnotation

/**
 * ast/class.md, ClassDeclaration: a `class` statement. Its child fields are
 * `name`, `label`, `cssClass`, `annotation`, and `members`. At most one of
 * `cssClass` and `annotation` is set.
 *
 * ```text
 * class A["Label"]:::c
 * ^^^^^^^^^^^^^^^^^^^^
 *
 * class B <<interface>> { +x }
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassDeclaration extends NodeBase {
  readonly type: "ClassDeclaration"
  /** The class name after `class`. */
  readonly name: ClassName
  /** The string between `[` and `]`; null when there is none. */
  readonly label: StringLiteral | null
  /** The CSS class after `:::`; null when there is none. */
  readonly cssClass: Identifier | null
  /** The annotation between `<<` and `>>` after the name; null when there is none. */
  readonly annotation: ClassAnnotation | null
  /**
   * The member lines of the body between `{` and `}`, in source order; null
   * without a body. A member line of only whitespace makes no node.
   */
  readonly members: readonly ClassMember[] | null
}

/**
 * ast/class.md, ClassMemberStatement: a class name with a label, which adds
 * a member. Its child fields are `class` and `member`.
 *
 * ```text
 * A : +int x
 * ^^^^^^^^^^
 * ```
 */
export interface ClassMemberStatement extends NodeBase {
  readonly type: "ClassMemberStatement"
  /** The class name before `:`. */
  readonly class: ClassName
  /** The member line after `:`; null when the text after `:` is all whitespace. */
  readonly member: ClassMember | null
}

/**
 * ast/class.md, ClassNameStatement: a class name alone on its line, without
 * a label, which changes nothing. Its child field is `name`.
 *
 * ```text
 * Foo
 * ^^^
 * ```
 */
export interface ClassNameStatement extends NodeBase {
  readonly type: "ClassNameStatement"
  /** The class name. */
  readonly name: ClassName
}

/**
 * ast/class.md, ClassAnnotationStatement: an annotation before a class
 * name. Its child fields are `annotation` and `class`.
 *
 * ```text
 * class A
 * <<interface>> A
 * ^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassAnnotationStatement extends NodeBase {
  readonly type: "ClassAnnotationStatement"
  /** The annotation, from `<<` to `>>`. */
  readonly annotation: ClassAnnotation
  /** The class name after it, which the Db annotates. */
  readonly class: ClassName
}

/**
 * ast/class.md, ClassRelationStatement: a relation between two class names.
 * Its child fields are `from`, `fromCardinality`, `arrow`, `toCardinality`,
 * `to`, and `label`.
 *
 * ```text
 * A "1" <|-- "*" B : uses
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassRelationStatement extends NodeBase {
  readonly type: "ClassRelationStatement"
  /** The class name before the arrow. */
  readonly from: ClassName
  /** The string between `from` and the arrow; null when there is none. */
  readonly fromCardinality: StringLiteral | null
  /** The arrow. */
  readonly arrow: ClassArrow
  /** The string between the arrow and `to`; null when there is none. */
  readonly toCardinality: StringLiteral | null
  /** The class name after the arrow. */
  readonly to: ClassName
  /** The text of the label after `:`, without the `:`; null when there is none. */
  readonly label: ClassLiteral | null
}

/**
 * ast/class.md, ClassArrow: the relation end at an end of the line of a
 * class arrow, before the line (`startMarker`) or after it (`endMarker`).
 * The words describe the drawn mark, not what mermaid.js calls the relation.
 *
 * - `"none"`: No relation end.
 * - `"triangle"`: A triangle, `<|` before the line or `|>` after it.
 * - `"filled-diamond"`: A filled diamond, `*`; composition in the Db.
 * - `"hollow-diamond"`: A hollow diamond, `o`; aggregation in the Db.
 * - `"arrow"`: An arrowhead, `<` before the line or `>` after it.
 * - `"lollipop"`: A lollipop, `()`; when the other end has no relation end, the name at this end is, in the Db, an interface of the class at the other end.
 */
export type ClassArrowMarker =
  /** No relation end. */
  | "none"
  /** A triangle, `<|` before the line or `|>` after it. */
  | "triangle"
  /** A filled diamond, `*`; composition in the Db. */
  | "filled-diamond"
  /** A hollow diamond, `o`; aggregation in the Db. */
  | "hollow-diamond"
  /** An arrowhead, `<` before the line or `>` after it. */
  | "arrow"
  /** A lollipop, `()`; when the other end has no relation end, the name at this end is, in the Db, an interface of the class at the other end. */
  | "lollipop"

/**
 * ast/class.md, ClassArrow: the line of a class arrow.
 *
 * - `"solid"`: A solid line, `--`.
 * - `"dotted"`: A dotted line, `..`.
 */
export type ClassArrowLine =
  /** A solid line, `--`. */
  | "solid"
  /** A dotted line, `..`. */
  | "dotted"

/**
 * ast/class.md, ClassArrow: the arrow of a relation, a line with optional
 * relation ends. Each relation end and the line are tokens of their own,
 * which may have whitespace between them; the range runs from the first to
 * the last. No child fields.
 *
 * ```text
 * A <|-- B
 *   ^^^^
 *
 * A <|  --  * B
 *   ^^^^^^^^^
 * ```
 */
export interface ClassArrow extends NodeBase {
  readonly type: "ClassArrow"
  /** The texts of its tokens, joined in order. */
  readonly value: string
  /** The relation end before the line; see {@link ClassArrowMarker}. */
  readonly startMarker: ClassArrowMarker
  /** The line between the relation ends; see {@link ClassArrowLine}. */
  readonly line: ClassArrowLine
  /** The relation end after the line; see {@link ClassArrowMarker}. */
  readonly endMarker: ClassArrowMarker
}

/**
 * ast/class.md, ClassNamespaceStatement: a namespace and its body. Its child
 * fields are `prefix`, `name`, `label`, and `body`.
 *
 * ```text
 * namespace A { class B }
 * ^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassNamespaceStatement extends NodeBase {
  readonly type: "ClassNamespaceStatement"
  /** The name parts before a backquoted name, as in ClassName; null when there are none. */
  readonly prefix: ClassIdentifier | null
  /** The name of the namespace: its name parts, or its backquoted name. */
  readonly name: ClassIdentifier | StringLiteral
  /** The string between `[` and `]`; null when there is none. */
  readonly label: StringLiteral | null
  /** The items of the body, in source order. */
  readonly body: readonly (
    ClassDeclaration | ClassNoteStatement | ClassNamespaceStatement
  )[]
}

/**
 * ast/class.md, ClassNoteStatement: a note. Its child fields are `class` and
 * `text`.
 *
 * ```text
 * note for A "text"
 * ^^^^^^^^^^^^^^^^^
 *
 * note "text"
 * ^^^^^^^^^^^
 * ```
 */
export interface ClassNoteStatement extends NodeBase {
  readonly type: "ClassNoteStatement"
  /** The class name after `note for`; null for a note with `note`. */
  readonly class: ClassName | null
  /** The text of the note. */
  readonly text: StringLiteral
}

/**
 * ast/class.md, ClassCallbackStatement: a `callback` statement, or a `click`
 * statement with `call`. Its child fields are `class`, `callback`,
 * `arguments`, and `tooltip`. Which keyword was written is in the tokens.
 *
 * ```text
 * callback A "fn" "tip"
 * ^^^^^^^^^^^^^^^^^^^^^
 *
 * click A call fn(x)
 * ^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassCallbackStatement extends NodeBase {
  readonly type: "ClassCallbackStatement"
  /** The class name after `callback` or `click`. */
  readonly class: ClassName
  /** The function name: the string after the class name, or the `callback-name` unit after `call`, a ClassLiteral. */
  readonly callback: StringLiteral | ClassLiteral
  /** The text between `(` and `)` after `call`; null when there is none. */
  readonly arguments: ClassLiteral | null
  /** The string at the end; null when there is none. */
  readonly tooltip: StringLiteral | null
}

/**
 * ast/class.md, ClassLinkStatement: the link target written at the end of a
 * link statement, as in `link A "url" "tip" _blank`. Each is the value of the
 * HTML attribute `target` of the same name, which the Db keeps as
 * `linkTarget`.
 *
 * - `"_self"`: Written `_self`.
 * - `"_blank"`: Written `_blank`.
 * - `"_parent"`: Written `_parent`.
 * - `"_top"`: Written `_top`.
 */
export type ClassLinkTarget =
  /** Written `_self`. */
  | "_self"
  /** Written `_blank`. */
  | "_blank"
  /** Written `_parent`. */
  | "_parent"
  /** Written `_top`. */
  | "_top"

/**
 * ast/class.md, ClassLinkStatement: a `link` statement, or a `click`
 * statement with `href`. Its child fields are `class`, `url`, and
 * `tooltip`.
 *
 * ```text
 * link A "https://x.example" "tip" _blank
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * click A href "https://x.example"
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassLinkStatement extends NodeBase {
  readonly type: "ClassLinkStatement"
  /** The class name after `link` or `click`. */
  readonly class: ClassName
  /** The URL. */
  readonly url: StringLiteral
  /** The second string; null when there is none. */
  readonly tooltip: StringLiteral | null
  /** The link target, as written; null when there is none. See {@link ClassLinkTarget}. */
  readonly target: ClassLinkTarget | null
}

/**
 * ast/class.md, ClassStyleStatement: the styles of one class. Its child
 * fields are `id` and `styles`.
 *
 * ```text
 * style A fill:#f00,stroke:#333
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassStyleStatement extends NodeBase {
  readonly type: "ClassStyleStatement"
  /** The word after `style`. */
  readonly id: Identifier
  /** The styles, separated by `,` units, in source order. */
  readonly styles: readonly ClassLiteral[]
}

/**
 * ast/class.md, ClassCssClassStatement: a CSS class given to a list of
 * classes. Its child fields are `idList` and `cssClass`.
 *
 * ```text
 * cssClass "A,B" c
 * ^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassCssClassStatement extends NodeBase {
  readonly type: "ClassCssClassStatement"
  /** The string after `cssClass`, a list of class names that the Db splits at `,`. */
  readonly idList: StringLiteral
  /** The CSS class. */
  readonly cssClass: Identifier
}

/**
 * ast/class.md, ClassClassDefStatement: the styles of CSS classes. Its child
 * fields are `cssClasses` and `styles`.
 *
 * ```text
 * classDef a,b fill:#f00
 * ^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassClassDefStatement extends NodeBase {
  readonly type: "ClassClassDefStatement"
  /** The CSS classes, separated by `,`, in source order. */
  readonly cssClasses: readonly Identifier[]
  /** The styles, as in ClassStyleStatement. */
  readonly styles: readonly ClassLiteral[]
}

/**
 * ast/class.md, ClassDirectionStatement: the value of a direction line, as
 * written after `direction`.
 *
 * - `"TB"`: Written `TB`.
 * - `"BT"`: Written `BT`.
 * - `"RL"`: Written `RL`.
 * - `"LR"`: Written `LR`.
 */
export type ClassDirection =
  /** Written `TB`. */
  | "TB"
  /** Written `BT`. */
  | "BT"
  /** Written `RL`. */
  | "RL"
  /** Written `LR`. */
  | "LR"

/**
 * ast/class.md, ClassDirectionStatement: a direction line. Its child fields
 * are `textBefore` and `textAfter`. The range covers the whole direction
 * line.
 *
 * ```text
 * direction LR
 * ^^^^^^^^^^^^
 *
 * class A direction LR
 * ^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassDirectionStatement extends NodeBase {
  readonly type: "ClassDirectionStatement"
  /** The text of the direction line before `direction`; null when there is none (when it is empty or all whitespace). */
  readonly textBefore: ClassIgnoredText | null
  /** The value after `direction`; see {@link ClassDirection}. */
  readonly direction: ClassDirection
  /** The text of the direction line after the value; null when there is none. */
  readonly textAfter: ClassIgnoredText | null
}

/**
 * ast/class.md, ClassAccTitleStatement: an `accTitle:` statement. Its child
 * field is `value`.
 *
 * ```text
 * accTitle: The title
 * ^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassAccTitleStatement extends NodeBase {
  readonly type: "ClassAccTitleStatement"
  /** The text after `accTitle:`, up to the end of the line. */
  readonly value: ClassLiteral
}

/**
 * ast/class.md, ClassAccDescrStatement: an `accDescr:` statement. Its child
 * field is `value`.
 *
 * ```text
 * accDescr: The description
 * ^^^^^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface ClassAccDescrStatement extends NodeBase {
  readonly type: "ClassAccDescrStatement"
  /** The text after `accDescr:`, up to the end of the line. */
  readonly value: ClassLiteral
}

/**
 * ast/class.md, ClassAccDescrBlockStatement: an `accDescr {` statement. Its
 * child field is `value`. An empty description block is a statement only
 * where a statement starts and another statement follows it on the same
 * line.
 *
 * ```text
 * accDescr { The description }
 * ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
 *
 * accDescr {} class A
 * ^^^^^^^^^^^
 * ```
 */
export interface ClassAccDescrBlockStatement extends NodeBase {
  readonly type: "ClassAccDescrBlockStatement"
  /** The text between `{` and `}`; null for an empty description block. */
  readonly value: ClassLiteral | null
}

/**
 * ast/class.md, ClassIdentifier: the name parts of a class name or a
 * namespace name, with the `.` between them, which may be written with
 * whitespace between them. Its name is the written texts of the parts and
 * the `.`, joined in order, without the whitespace, which mermaid.js does
 * not read. Its tokens are `RawText` tokens, one for each run of parts
 * with no whitespace between them.
 *
 * ```text
 * class Foo Bar
 *       ^^^^^^^
 *
 * class a.b.C
 *       ^^^^^
 * ```
 */
export interface ClassIdentifier extends NodeBase {
  readonly type: "ClassIdentifier"
  /** The texts of its parts, joined in order, without the whitespace between them. */
  readonly name: string
}

/**
 * ast/class.md, ClassName: a class name. Its child fields are `prefix`, `name`,
 * and `generic`. The name parts with whitespace or `.` between them are one
 * ClassIdentifier, whose name leaves the whitespace out.
 *
 * ```text
 * class Map~K, V~
 *       ^^^^^^^^^
 *
 * class A.`b c`
 *       ^^^^^^^
 * ```
 */
export interface ClassName extends NodeBase {
  readonly type: "ClassName"
  /** The name parts written before a backquoted name; null when there are none. */
  readonly prefix: ClassIdentifier | null
  /** The name parts, or the backquoted name. */
  readonly name: ClassIdentifier | StringLiteral
  /** The text between the two `~` of a generic type; null when there is none or it is empty. */
  readonly generic: ClassLiteral | null
}

/**
 * ast/class.md, ClassMethod and ClassAttribute: the visibility mark at the
 * start of a member line.
 *
 * - `"none"`: No visibility mark.
 * - `"public"`: Written `+`.
 * - `"private"`: Written `-`.
 * - `"protected"`: Written `#`.
 * - `"package"`: Written `~`.
 */
export type ClassVisibility =
  /** No visibility mark. */
  | "none"
  /** Written `+`. */
  | "public"
  /** Written `-`. */
  | "private"
  /** Written `#`. */
  | "protected"
  /** Written `~`. */
  | "package"

/**
 * ast/class.md, ClassMethod and ClassAttribute: the classifier mark of a
 * member line.
 *
 * - `"none"`: No classifier mark.
 * - `"static"`: Written `$`.
 * - `"abstract"`: Written `*`.
 */
export type ClassClassifier =
  /** No classifier mark. */
  | "none"
  /** Written `$`. */
  | "static"
  /** Written `*`. */
  | "abstract"

/**
 * ast/class.md, ClassMethod: a member line with parentheses. Its child
 * fields are `textBefore`, `name`, `parameters`, `returnType`, and
 * `textAfter`. The marks of visibility and classifier, `(`, and `)` are
 * tokens and the words of the fields.
 *
 * ```text
 * class A {
 * +foo(a: int) List~T~$
 * ^^^^^^^^^^^^^^^^^^^^^
 * }
 * ```
 */
export interface ClassMethod extends NodeBase {
  readonly type: "ClassMethod"
  /** The visibility mark; see {@link ClassVisibility}. */
  readonly visibility: ClassVisibility
  /** The `member-name` unit; null when there is none. */
  readonly name: ClassLiteral | null
  /** The `parameters` unit; null when there is none. */
  readonly parameters: ClassLiteral | null
  /** The `return-type` unit; null when there is none. */
  readonly returnType: ClassLiteral | null
  /** The classifier mark; see {@link ClassClassifier}. */
  readonly classifier: ClassClassifier
  /** The text before the part that mermaid.js reads, on a line with U+2028 or U+2029; null when there is none. */
  readonly textBefore: ClassIgnoredText | null
  /** The text after the part that mermaid.js reads, on a line with U+2028 or U+2029; null when there is none. */
  readonly textAfter: ClassIgnoredText | null
}

/**
 * ast/class.md, ClassAttribute: a member line without parentheses. Its
 * child field is `name`.
 *
 * ```text
 * A : -int count$
 *     ^^^^^^^^^^^
 * ```
 */
export interface ClassAttribute extends NodeBase {
  readonly type: "ClassAttribute"
  /** The visibility mark; see {@link ClassVisibility}. */
  readonly visibility: ClassVisibility
  /** The `member-name` unit; null when there is none. */
  readonly name: ClassLiteral | null
  /** The classifier mark; see {@link ClassClassifier}. */
  readonly classifier: ClassClassifier
}

/**
 * ast/class.md, ClassAnnotation: an annotation, from `<<` to `>>`. Its child
 * field is `name`. After the name of a class statement and in an annotation
 * statement, the name is one name part, an Identifier; as a member line, it
 * may be any text, a ClassLiteral.
 *
 * ```text
 * class A <<interface>>
 *         ^^^^^^^^^^^^^
 *
 * A : << y z >>
 *     ^^^^^^^^^
 * ```
 */
export interface ClassAnnotation extends NodeBase {
  readonly type: "ClassAnnotation"
  /** The text between `<<` and `>>`; null when it is empty. */
  readonly name: Identifier | ClassLiteral | null
}

/**
 * ast/class.md, ClassLiteral: a text without quotes that may contain
 * whitespace: the label of a relation, a generic type, a part of a member
 * line, the arguments of a callback, a style, and an accessibility text. No
 * child fields; the whitespace around it is outside its range.
 *
 * ```text
 * A --> B : uses it
 *           ^^^^^^^
 * ```
 */
export interface ClassLiteral extends NodeBase {
  readonly type: "ClassLiteral"
  /** Its written text. */
  readonly value: string
}

/**
 * ast/class.md, ClassIgnoredText: text that the author wrote and mermaid.js
 * does not read: the text before `direction` and after its value on a
 * direction line, and the parts of a method line around the part that
 * mermaid.js reads. No child fields.
 *
 * ```text
 * class A direction LR
 * ^^^^^^^
 * ```
 */
export interface ClassIgnoredText extends NodeBase {
  readonly type: "ClassIgnoredText"
  /** Its written text. */
  readonly value: string
}

/** Every node of the class tree. */
export type ClassNode =
  | ClassDiagram
  | ClassDeclaration
  | ClassMemberStatement
  | ClassNameStatement
  | ClassAnnotationStatement
  | ClassRelationStatement
  | ClassArrow
  | ClassNamespaceStatement
  | ClassNoteStatement
  | ClassCallbackStatement
  | ClassLinkStatement
  | ClassStyleStatement
  | ClassCssClassStatement
  | ClassClassDefStatement
  | ClassDirectionStatement
  | ClassAccTitleStatement
  | ClassAccDescrStatement
  | ClassAccDescrBlockStatement
  | ClassIdentifier
  | ClassName
  | ClassMethod
  | ClassAttribute
  | ClassAnnotation
  | ClassLiteral
  | ClassIgnoredText
