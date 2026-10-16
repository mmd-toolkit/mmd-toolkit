/**
 * The abstract syntax tree, as defined in `packages/spec/docs/ast.md`.
 *
 * Every type here implements a node, a token, or a record of that document
 * with the same name and the same field names. The comment on each type
 * names the section it implements. The document is the definition; this
 * file follows it. The nodes of each diagram type are defined in a document
 * of their own under `docs/ast/` and implemented in a file of the same name
 * under `ast/`.
 */
import type { ClassDiagram, ClassNode } from "./ast/class.ts"
import type { StateDiagram, StateNode } from "./ast/state.ts"
import type { ErDiagram, ErNode } from "./ast/er.ts"
import type { FlowchartDiagram, FlowchartNode } from "./ast/flowchart.ts"
import type { GanttDiagram, GanttNode } from "./ast/gantt.ts"
import type { JourneyDiagram, JourneyNode } from "./ast/journey.ts"
import type { MindmapDiagram, MindmapTreeNode } from "./ast/mindmap.ts"
import type { TimelineDiagram, TimelineNode } from "./ast/timeline.ts"
import type { SankeyDiagram, SankeyNode } from "./ast/sankey.ts"
import type { XychartDiagram, XychartNode } from "./ast/xychart.ts"
import type { QuadrantDiagram, QuadrantNode } from "./ast/quadrant.ts"
import type { BlockDiagram, BlockTreeNode } from "./ast/block.ts"
import type { KanbanDiagram, KanbanTreeNode } from "./ast/kanban.ts"
import type { RequirementDiagram, RequirementNode } from "./ast/requirement.ts"
import type { SequenceDiagram, SequenceNode } from "./ast/sequence.ts"

/** ast.md, Positions: a position record. */
export interface Position {
  /** Line number, counted from 1. */
  readonly line: number
  /** Column, counted from 0 in UTF-16 code units. */
  readonly column: number
}

/** ast.md, Positions: a location record. */
export interface Location {
  /** Position of the first character. */
  readonly start: Position
  /** Position just after the last character. */
  readonly end: Position
}

/**
 * ast.md, Positions: an offset pair. A 0-based start offset and an end offset
 * that is not included, both in UTF-16 code units.
 */
export type Range = [start: number, end: number]

/** ast.md, Nodes: the fields every node has. */
export interface NodeBase {
  /** The name of the node type, such as `Root`. */
  readonly type: string
  /** Where the node is in the source. */
  readonly range: Range
  /** The same place as lines and columns. */
  readonly loc: Location
}

/**
 * `docs/tokens.md`, Tokens: the token kinds that a diagram's own lexer gives its
 * tokens. Which characters form a token, and of which of these kinds, is
 * defined by each diagram document. The tokens of the frontmatter have two
 * of them: `Punctuator` for each `---` and `RawText` for the body.
 *
 * - `"Keyword"`: A word with a fixed meaning at its position.
 * - `"Identifier"`: A name that the author chooses.
 * - `"Numeric"`: A number.
 * - `"String"`: A quoted string, with its quotes.
 * - `"RawText"`: Characters that the parser takes as one content without
 *   reading any structure in them, not enclosed in quotes, such as the text
 *   of a label or a style.
 * - `"Punctuator"`: A delimiter, separator, or operator, such as `[` or
 *   `-->`.
 */
export type DiagramTokenKind =
  /** A word with a fixed meaning at its position. */
  | "Keyword"
  /** A name that the author chooses. */
  | "Identifier"
  /** A number. */
  | "Numeric"
  /** A quoted string, with its quotes. */
  | "String"
  /** Characters that the parser takes as one content without reading any structure in them, not enclosed in quotes, such as the text of a label or a style. */
  | "RawText"
  /** A delimiter, separator, or operator, such as `[` or `-->`. */
  | "Punctuator"

/**
 * `docs/tokens.md`, Tokens: the token kinds, shared by all diagram types: those of
 * the diagram's own tokens and of the frontmatter (see
 * {@link DiagramTokenKind}), and three more, the same in every diagram:
 *
 * - `"StringFragment"`: A piece of a quoted string that a comment region, a
 *   `;` that the line rule ignores, or a directive cuts: the text before or
 *   after it, without the closing or the opening quote.
 * - `"Directive"`: A directive outside every other token and every comment.
 * - `"IgnoredSemicolon"`: A `;` that the `style` and `classDef` line rule
 *   ignores, outside every comment, which no grammar reads.
 */
export type TokenKind =
  | DiagramTokenKind
  /** A piece of a quoted string that a comment region, a `;` that the line rule ignores, or a directive cuts: the text before or after it, without the closing or the opening quote. */
  | "StringFragment"
  /** A directive outside every other token and every comment. */
  | "Directive"
  /** A `;` that the `style` and `classDef` line rule ignores, outside every comment, which no grammar reads. */
  | "IgnoredSemicolon"

/**
 * `docs/tokens.md`, Tokens: one lexical unit of the diagram, a directive that lies
 * outside every token and comment, or the frontmatter. Tokens are listed in
 * `Root.tokens`; they are not nodes and are not the values of node fields.
 */
export interface Token {
  /** The token kind; see {@link TokenKind}. */
  readonly type: TokenKind
  /** The source text of `range`, as written. */
  readonly value: string
  /** Where the token is in the source. */
  readonly range: Range
  /** The same place as lines and columns. */
  readonly loc: Location
}

/**
 * ast.md, Comments, directives, and frontmatter > Comment. Not a token and
 * not a node: it is listed in `Root.comments`.
 */
export interface Comment {
  readonly type: "Comment"
  /**
   * The characters of the comment's mark: `%%` for a comment line; for a
   * diagram comment, `#`, `%%`, or `%` in sequence, `#` or `%%` in state,
   * and `%%` in class. Null for a fragment of a diagram comment after a
   * comment region, which has no mark.
   */
  readonly mark: "%%" | "#" | "%" | null
  /**
   * The source text after the mark, directives included; for a fragment
   * without a mark, the source text of its range.
   */
  readonly value: string
  /**
   * From the mark, or the first character of a fragment without a mark, to
   * the end of the comment (ast.md, Comment).
   */
  readonly range: Range
  /** The same place as lines and columns. */
  readonly loc: Location
}

/**
 * ast.md, Comments, directives, and frontmatter > Directive. Not a node: it
 * is listed in `Root.directives`. A directive that lies outside every token
 * and comment is also a `Directive` token with the same range.
 */
export interface Directive {
  readonly type: "Directive"
  /** The directive name, for example `init` in `%%{init: {...}}%%`. */
  readonly name: string
  /**
   * The text between `%%{` and `}%%`, or to the end of the directive when
   * unclosed.
   */
  readonly value: string
  /** Whether the directive ends with `}%%`. */
  readonly closed: boolean
  /** One match of the directive scan, without the whitespace at its end. */
  readonly range: Range
  /** The same place as lines and columns. */
  readonly loc: Location
}

/**
 * ast.md, Comments, directives, and frontmatter > Frontmatter. Not a node:
 * it is `Root.frontmatter`. Its range holds the first tokens: the opening
 * `---` and the closing `---`, `Punctuator` tokens, and between them the
 * body, a `RawText` token, unless the body is all whitespace.
 */
export interface Frontmatter {
  readonly type: "Frontmatter"
  /** The YAML text between the delimiter lines, as written in the source. */
  readonly value: string
  /** Where `value` is in the source. */
  readonly valueRange: Range
  /** From the `---` of the opening delimiter line, without the indent before it, through the closing `---`. */
  readonly range: Range
  /** The same place as lines and columns. */
  readonly loc: Location
}

/**
 * ast.md, ErrorDiagram: the body of the `error` pseudo-diagram. A node with
 * no other fields and no child fields; its range runs from the start of its
 * first `RawText` token to the end of its last.
 */
export interface ErrorDiagram extends NodeBase {
  readonly type: "ErrorDiagram"
}

/**
 * ast.md, Shared leaf nodes > Identifier: a name that the author chooses,
 * such as an id, which contains no whitespace. Its token is one
 * `Identifier` token, which a directive or a `;` that the line rule
 * ignores may not cut. No child fields.
 *
 * ```text
 * A --> B
 * ^
 *
 * click A,B href "u"
 *         ^
 * ```
 */
export interface Identifier extends NodeBase {
  readonly type: "Identifier"
  /** The written texts of its units, joined in order (ast.md, Nodes). */
  readonly name: string
}

/**
 * ast.md, Shared leaf nodes > StringLiteral: a string that the author
 * writes in quotes. Its token is one `String` token, quotes included, and
 * its range is that of the token, so `raw` equals the token's `value`. No
 * child fields.
 *
 * ```text
 * click A href "https://example.com"
 *              ^^^^^^^^^^^^^^^^^^^^^
 * ```
 */
export interface StringLiteral extends NodeBase {
  readonly type: "StringLiteral"
  /** Its content: its written text without the delimiters of the string, however they nest. */
  readonly value: string
  /** The source text of its range, with nothing left out and nothing converted: its quotes, and a comment region inside it, are part of it. */
  readonly raw: string
  /** Whether the string ends with its closing quote; false only for a string that the text ends in, which only a backquoted name of a class diagram can be. */
  readonly closed: boolean
}

/**
 * ast.md, Shared leaf nodes > NumericLiteral: a number that the author
 * writes. Its token is one `Numeric` token, and its range is that of the
 * token, so `raw` equals the token's `value`. No child fields.
 *
 * ```text
 * A --> B --> C
 * linkStyle 0,1 stroke:red
 *             ^
 * ```
 */
export interface NumericLiteral extends NodeBase {
  readonly type: "NumericLiteral"
  /** The number that the characters of its token write. */
  readonly value: number
  /** The source text of its range: the number as written. */
  readonly raw: string
}

/**
 * ast.md, Root: DiagramBody. An `ErrorDiagram` or the body node type of a
 * diagram type. Each diagram adds its body type here.
 */
export type DiagramBody =
  | ErrorDiagram
  | FlowchartDiagram
  | SequenceDiagram
  | ClassDiagram
  | StateDiagram
  | ErDiagram
  | GanttDiagram
  | JourneyDiagram
  | RequirementDiagram
  | MindmapDiagram
  | TimelineDiagram
  | SankeyDiagram
  | XychartDiagram
  | QuadrantDiagram
  | BlockDiagram
  | KanbanDiagram

/**
 * ast.md, Root: DiagramType. The 38 diagram type ids, in the order in which
 * mermaid.js tries the detectors (see `packages/spec/docs/detection.md`).
 * The `---` pseudo-diagram is not one of them: it is always rejected.
 */
export type DiagramType =
  | "error"
  | "flowchart-elk"
  | "mindmap"
  | "architecture"
  | "agentflow"
  | "c4"
  | "kanban"
  | "classDiagram"
  | "er"
  | "gantt"
  | "info"
  | "pie"
  | "requirement"
  | "sequence"
  | "swimlane"
  | "flowchart-v2"
  | "timeline"
  | "gitGraph"
  | "stateDiagram"
  | "journey"
  | "quadrantChart"
  | "sankey"
  | "packet"
  | "xychart"
  | "block"
  | "eventmodeling"
  | "treeView"
  | "radar"
  | "ishikawa"
  | "treemap"
  | "railroad"
  | "railroadEbnf"
  | "railroadAbnf"
  | "railroadPeg"
  | "venn"
  | "wardley"
  | "cynefin"
  | "usecase"

/**
 * ast.md, Root. Its only child field is `body`; `frontmatter`, `comments`,
 * `directives`, and `tokens` are lists, not child fields.
 */
export interface Root extends NodeBase {
  readonly type: "Root"
  /** The diagram type id as mermaid.js reports it, such as `flowchart-v2`. */
  readonly diagramType: DiagramType
  /** The diagram body. */
  readonly body: DiagramBody
  /** The frontmatter, if the source has one. */
  readonly frontmatter: Frontmatter | null
  /** Every comment, in source order. */
  readonly comments: readonly Comment[]
  /** Every directive, in source order. */
  readonly directives: readonly Directive[]
  /** Every token, `Directive` tokens and the tokens of the frontmatter included, in source order. */
  readonly tokens: readonly Token[]
}

/**
 * ast.md, Nodes: a node of any type: the root, the `ErrorDiagram`, the
 * shared leaf nodes, and the nodes of each diagram type. Each diagram adds
 * its nodes here.
 */
export type Node =
  | Root
  | ErrorDiagram
  | Identifier
  | StringLiteral
  | NumericLiteral
  | FlowchartNode
  | SequenceNode
  | ClassNode
  | StateNode
  | ErNode
  | GanttNode
  | JourneyNode
  | RequirementNode
  | MindmapTreeNode
  | TimelineNode
  | SankeyNode
  | XychartNode
  | QuadrantNode
  | BlockTreeNode
  | KanbanTreeNode
