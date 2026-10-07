import type {
  Node,
  StateAliasDefinitionStatement,
  StateCompositeStatement,
  StateLiteral,
  StateNoteStatement,
  StateReference,
  StateStatement,
  Token,
} from "@mmd-toolkit/parser"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { findWrittenWhitespaceEnd } from "./gap.ts"
import { lineStartOf, printedEndOf } from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  spansLinesThatCannotJoin,
  toAsciiLowerCase,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokenEndingBefore,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
} from "./source.ts"
import { findStateSemicolonLines } from "./state-kept-lines.ts"

/**
 * The node types of a state diagram whose text is a value, printed as
 * written: the shared leaf nodes, the texts without quotes, the text that
 * mermaid.js does not read, and the statement of `""` alone that it does
 * not read either. They have no child fields; `tests/value-nodes.test.ts`
 * checks that every other such node type is left out on purpose.
 */
export const stateValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "StateLiteral",
  "StateIgnoredText",
  "StateIgnoredStatement",
])

/** A statement that may have a body of statements between `{` and `}`. */
export type StateBodyStatement =
  StateCompositeStatement | StateAliasDefinitionStatement

/** A statement that never has a body. */
export type StateSimpleStatement = Exclude<StateStatement, StateBodyStatement>

/** A statement, with the kind of statement it is. */
export type ClassifiedStateStatement =
  | { readonly kind: "body"; readonly statement: StateBodyStatement }
  | { readonly kind: "simple"; readonly statement: StateSimpleStatement }

/**
 * Which kind of statement a node is: a composite statement or an alias
 * definition, which may have a body of statements, or a statement that
 * never has one; null for a node that is no statement of a state diagram.
 * The kinds are decided here only. Every statement type is listed, the
 * node of each case is checked against the type of its kind, and the check
 * after the cases fails when a statement type of the tree is not listed.
 */
export function classifyStateStatement(
  node: StateStatement,
): ClassifiedStateStatement
export function classifyStateStatement(
  node: MermaidAst,
): ClassifiedStateStatement | null
export function classifyStateStatement(
  node: MermaidAst,
): ClassifiedStateStatement | null {
  switch (node.type) {
    case "StateCompositeStatement":
    case "StateAliasDefinitionStatement":
      return { kind: "body", statement: node }
    case "StateDefinitionStatement":
    case "StateTransitionStatement":
    case "StatePseudostateDefinitionStatement":
    case "StateDividerStatement":
    case "StateNoteStatement":
    case "StateFloatingNoteStatement":
    case "StateIgnoredStatement":
    case "StateClickStatement":
    case "StateClassDefStatement":
    case "StateClassStatement":
    case "StateStyleStatement":
    case "StateDirectionStatement":
    case "StateAccTitleStatement":
    case "StateAccDescrStatement":
    case "StateAccDescrBlockStatement":
    case "StateScaleStatement":
    case "StateHideEmptyDescriptionStatement":
      return { kind: "simple", statement: node }
    default:
      node satisfies Exclude<MermaidAst, StateStatement>
      return null
  }
}

/** The `{` and the `}` of the body of a statement. */
export function findBodyBraces(
  source: Source,
  statement: StateBodyStatement,
): { readonly opening: Token; readonly closing: Token } {
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `}` of a body",
  )
  expectValue(closing, "}")
  const before = statement.body?.at(0)?.range[0] ?? closing.range[0]
  const opening = expectToken(
    findTokensBetween(source, statement.range[0], before)
      .filter((token) => isStructural(source, token) && token.value === "{")
      .at(-1),
    "the `{` of a body",
  )
  return { opening, closing }
}

/**
 * Whether a statement is printed with its body as a block: the body holds a
 * statement, or a comment or a directive between braces on different
 * lines. An empty body, with nothing but whitespace between its braces, is
 * printed as `{ }` on the line of the statement (see `isEmptyBody`), and a
 * body without statements on one line keeps its comments and directives on
 * that line (docs/state.md, Composite states).
 */
export function hasBodyBlock(
  source: Source,
  statement: StateBodyStatement,
): boolean {
  if (statement.body === null) return false
  if (statement.body.length > 0) return true
  if (isEmptyBody(source, statement)) return false
  const { opening, closing } = findBodyBraces(source, statement)
  return source.text.slice(opening.range[1], closing.range[0]).includes("\n")
}

/**
 * Whether a statement has an empty body: nothing but whitespace and line
 * breaks between its braces. Every empty body is printed as `{ }`, with one
 * space, as in a class diagram (docs/state.md, Composite states).
 */
export function isEmptyBody(
  source: Source,
  statement: StateBodyStatement,
): boolean {
  if (statement.body === null || statement.body.length > 0) return false
  const { opening, closing } = findBodyBraces(source, statement)
  return (
    findTriviaBetween(source, opening.range[1], closing.range[0]).length === 0
  )
}

/** The layout of the header line: the keyword `stateDiagram`. */
export function layoutStateHeader(source: Source, keyword: Token): AtomLayout {
  return {
    atoms: collectAtoms(source, keyword.range[0], keyword.range[1], [], []),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of the line that opens a body, from the start of a statement
 * to the end of its `{`. The `{` stands on the line of the name, after one
 * space; a `{` written on the next line is moved there (docs/state.md,
 * Composite states). Such a line is kept as written when it is written
 * over several lines and holds a comment or a directive, when text that
 * mermaid.js does not read stands before its `{` and is read by its place
 * (see `hasReadOtherwiseTextBeforeBody`), or when it follows a state name
 * (see `isStateNameStatement`).
 */
export function layoutBodyOpening(
  source: Source,
  statement: StateBodyStatement,
  opening: Token,
  followsStateName: boolean,
): AtomLayout {
  const start = statement.range[0]
  const end = opening.range[1]
  if (
    spansLinesThatCannotJoin(source, start, end) ||
    hasReadOtherwiseTextBeforeBody(statement) ||
    followsStateName
  ) {
    return keptAsWritten(start, end)
  }
  const rules = new Map<number, GapRule>([[opening.range[0], "space"]])
  if (statement.type === "StateAliasDefinitionStatement") {
    addAliasHeaderRules(source, statement, rules)
  }
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, stateValueNodeTypes).filter(
        (value) => value.range[1] <= opening.range[0],
      ),
      [],
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * Whether a `{` stands in the text between `start` and `end`, outside its
 * directives and comments: the `{` that mermaid.js reads as the body of the
 * statement before it, after a `state` that it reads no token for. It may be
 * the `{` of an empty description block, which the tree has no token for.
 */
function holdsBrace(source: Source, start: number, end: number): boolean {
  const trivia = findTriviaBetween(source, start, end)
  for (let offset = start; offset < end; offset++) {
    if (source.text[offset] !== "{") continue
    if (!trivia.some(({ range }) => range[0] <= offset && offset < range[1])) {
      return true
    }
  }
  return false
}

/**
 * The layout of a statement that is printed on one line, from its start to
 * `end` (see `findStatePrintedEnd`): a statement that never has a body, and
 * a composite statement or alias definition without a body block (see
 * `hasBodyBlock`).
 *
 * - A statement written over several lines stands on one line. A line
 *   break inside a statement is whitespace to the lexer after `state`,
 *   `as`, the position of a note, `classDef` and `style` and their names,
 *   `scale`, `direction`, and the `:` of `accTitle` and `accDescr`
 *   (diagrams/state.md, Lexical structure); one with a comment or a
 *   directive in it is kept as written (see `spansLinesThatCannotJoin`). The
 *   lines of an `accDescr { ... }` block and of a note over lines are lines
 *   of their texts, and are kept (docs/state.md, Multi-line values).
 * - A transition has one space on each side of its arrow (docs/state.md,
 *   Arrow spacing).
 * - The `:` of a description or a label has one space on each side
 *   (docs/state.md, Descriptions and labels).
 * - What follows the id of a note, and the second description of an alias
 *   definition, are kept as written (docs/state.md, Notes and Aliases).
 */
export function layoutStateStatement(
  source: Source,
  statement: StateSimpleStatement | StateBodyStatement,
  end: number,
  followsStateName: boolean,
): AtomLayout {
  const start = statement.range[0]
  if (followsStateName && holdsBrace(source, start, end)) {
    return keptAsWritten(start, end)
  }
  if (statement.type === "StateAccDescrBlockStatement") {
    const closing = findAccDescrBlockClosing(source, statement)
    return {
      atoms: collectAtoms(
        source,
        start,
        end,
        collectValueNodes(statement, stateValueNodeTypes),
        findAccDescrBlockStretches(source, statement),
      ),
      rules: new Map(),
      outdented: closing === null ? new Set() : new Set([closing]),
      lineBreaks: "kept",
    }
  }
  if (
    statement.type === "StateNoteStatement" &&
    isNoteOverLines(source, statement)
  ) {
    return layoutNoteOverLines(source, statement, end)
  }
  if (
    spansLinesThatCannotJoin(source, start, end) ||
    ((statement.type === "StateCompositeStatement" ||
      statement.type === "StateAliasDefinitionStatement") &&
      hasReadOtherwiseTextBeforeBody(statement))
  ) {
    return keptAsWritten(start, end)
  }
  const kept = [
    ...findNoteStretches(statement, end),
    ...findSecondDescriptionStretches(source, statement, end),
    ...findBlankDescriptionStretches(source, statement, end),
  ]
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, stateValueNodeTypes).filter(
        (value) =>
          !kept.some(
            (stretch) =>
              stretch.start <= value.range[0] && value.range[1] <= stretch.end,
          ),
      ),
      kept,
    ),
    rules: statementRules(source, statement),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * Whether text that mermaid.js does not read stands before the `{` of a body
 * and is read by its place: a `%%`, or an empty description block, in the
 * text before the body (ast/state.md, StateCompositeStatement and
 * StateAliasDefinitionStatement), or `%%` as the name of a composite state,
 * which `%%` is only right before a `{`. A space after a `%%` makes `%% {` a
 * comment, and `%%{` on the line of a name, as in `state X %%{}`, is the
 * composite state `%%`, while after a line break, as in `state X` followed by
 * a line `%%{}`, it is text that opens a body of X. A line break before an
 * empty description block ends the name: `state "d" as A` followed by a line
 * `accDescr {} {` has the id `A`, while on one line the id is `A accDescr {}`
 * (diagrams/state.md, The statement context and The state context), and a
 * `state` keyword before the `{`, which the grammar ignores, starts a line of
 * its own after `state "d" as A`: the line break ends the alias, and on the
 * line of the alias the keyword would be part of it. So the
 * statement is kept as written up to its `{` (docs/state.md, Composite
 * states).
 */
function hasReadOtherwiseTextBeforeBody(
  statement: StateBodyStatement,
): boolean {
  const text = statement.textBeforeBody?.value ?? ""
  if (text.includes("%%") || text.includes("accDescr")) return true
  if (toAsciiLowerCase(text).includes("state")) return true
  return (
    statement.type === "StateCompositeStatement" &&
    (statement.id?.name.startsWith("%%") ?? false)
  )
}

/**
 * Whether a statement is a state name that the state context reads a `{`
 * after, on the lines that follow it: `state foo` without a body. The state
 * context reads a word, whitespace with line feeds, another word, and the
 * characters up to a `{` on that line as two names before a `{`, and rejects
 * them (diagrams/state.md, The state context). So after `state foo`, a line
 * that holds a `{` after a word is rejected, which `state B` followed by a
 * line `{` is not: a statement that follows a state name is kept as written
 * where it holds a `{`, and the `{` is not moved to the line of its name
 * (docs/state.md, Composite states).
 */
export function isStateNameStatement(node: MermaidAst | null): boolean {
  return (
    node?.type === "StateCompositeStatement" &&
    node.id !== null &&
    node.body === null
  )
}

/** A layout of one atom, the text from `start` to `end` as written. */
function keptAsWritten(start: number, end: number): AtomLayout {
  return {
    atoms: [{ start, end }],
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * Where the printed text of a statement ends: at its last token, except
 * where the whitespace after it is part of a value (see
 * `findTrailingValueStart`): where the second description of an alias
 * definition ends, and, for a description or a label of
 * only whitespace, one that ends with `:`, and a note, the end of the
 * whitespace written after it, which the scan reads: it passes whitespace,
 * directives, and the `;` that the line rule ignores, and stops at any
 * other `;`, which is a state of its own in a state diagram.
 */
export function findStatePrintedEnd(
  source: Source,
  statement: StateStatement,
): number {
  if (statement.type === "StateAliasDefinitionStatement") {
    const text = statement.secondDescription
    return text === null
      ? statement.range[1]
      : printedEndOf(source, statement.range[1], text.range[0], text.range[1])
  }
  if (findTrailingValueStart(source, statement) === null) {
    return statement.range[1]
  }
  return findWrittenWhitespaceEnd(source, statement.range[1])
}

/**
 * Where the stretch starts whose trailing whitespace is part of what
 * mermaid.js reads, or null when the whitespace at the end of the statement
 * is not:
 *
 * - a description or a label of only whitespace: `A : ` gives no
 *   description, while `A :` is rejected, since a description needs a
 *   character after its `:` (diagrams/state.md, The statement context);
 *   the tree has the `:` token and no text; the stretch starts at the `:`;
 * - a description or a label that ends with `:`: `A : x: ` is accepted,
 *   while `A : x:` is rejected, since a description cannot end with `:`; the
 *   whitespace is no part of the description, which is trimmed (the tree
 *   has the text up to the `:`); the stretch starts at the text, which a
 *   directive may cut, so that no stretch cuts it;
 * - the second description of an alias definition without a body, which
 *   is the text after its `:` up to the second `:` or the end of the line,
 *   whitespace included: `state "d" as A : ` gives A the second
 *   description of a space (diagrams/state.md, Building the summary); the
 *   stretch starts at the first `:`;
 * - a note on one line without text, whose `:` needs a character after it;
 *   the stretch starts at the `:`.
 */
function findTrailingValueStart(
  source: Source,
  statement: StateStatement,
): number | null {
  switch (statement.type) {
    case "StateDefinitionStatement":
      return findValueEnd(source, statement, statement.description)
    case "StateTransitionStatement":
      return findValueEnd(source, statement, statement.label)
    case "StateAliasDefinitionStatement":
      return findSecondDescriptionColon(source, statement)?.range[0] ?? null
    case "StateNoteStatement":
      return findNoteTrailingValueStart(source, statement)
    default:
      return null
  }
}

/**
 * Where the stretch of a note on one line starts whose trailing whitespace
 * is part of what mermaid.js reads, or null: a note whose text is empty
 * or only the `:` that stands in it, since the text needs a character after
 * the `:`: `note left of A : ` and `note left of A  : ` are accepted, while
 * the same without the whitespace is rejected. With two whitespace characters
 * before the `:`, the tree has the `:` as the text, and the whitespace after
 * it is no part of the text, which is trimmed.
 */
function findNoteTrailingValueStart(
  source: Source,
  statement: StateNoteStatement,
): number | null {
  if (isNoteOverLines(source, statement)) return null
  const { text } = statement
  if (text === null) {
    return findColonBefore(source, statement)?.range[0] ?? null
  }
  return source.text.slice(text.range[0], text.range[1]) === ":" &&
    text.range[1] === statement.range[1]
    ? text.range[0]
    : null
}

/**
 * Where the stretch of a statement with a description or a label starts: at
 * the `:` when the text is absent, so that the `:` is the last token, and at
 * the text when it ends the statement and ends with `:`; otherwise null.
 */
function findValueEnd(
  source: Source,
  statement: Node,
  value: StateLiteral | null,
): number | null {
  if (value === null)
    return findColonBefore(source, statement)?.range[0] ?? null
  const endsWithColon = source.text
    .slice(value.range[0], value.range[1])
    .endsWith(":")
  return endsWithColon && value.range[1] === statement.range[1]
    ? value.range[0]
    : null
}

/** The `:` that is the last token of a statement, or null. */
function findColonBefore(source: Source, statement: Node): Token | null {
  const last = findTokenEndingBefore(source, statement.range[1])
  return last?.value === ":" && last.range[1] === statement.range[1]
    ? last
    : null
}

/** The first structural `:` token of a statement, or null. */
function findFirstColon(source: Source, statement: Node): Token | null {
  return (
    findTokensBetween(source, statement.range[0], statement.range[1]).find(
      (token) => isStructural(source, token) && token.value === ":",
    ) ?? null
  )
}

/**
 * The stretch whose trailing whitespace is part of what mermaid.js reads:
 * from where it starts to the end of the written whitespace (see
 * `findTrailingValueStart`), as written. The second description of an
 * alias definition and what follows the id of a note are kept as written
 * in any case (see `findSecondDescriptionStretches` and
 * `findNoteStretches`).
 */
function findBlankDescriptionStretches(
  source: Source,
  statement: StateStatement,
  end: number,
): Atom[] {
  if (
    statement.type === "StateAliasDefinitionStatement" ||
    statement.type === "StateNoteStatement"
  ) {
    return []
  }
  const start = findTrailingValueStart(source, statement)
  if (start === null) return []
  return [{ start, end }]
}

/**
 * The stretch of the second description of an alias definition without a
 * body: from its `:` to the end of the statement, with the whitespace at
 * the end of the line when nothing follows the second description, as
 * written. mermaid.js reads the text between the first `:` and the second
 * `:` or the end, whitespace included: `state "d" as A :x` and
 * `state "d" as A : x` give A different second descriptions
 * (docs/state.md, Aliases).
 */
function findSecondDescriptionStretches(
  source: Source,
  statement: StateStatement,
  end: number,
): Atom[] {
  if (
    statement.type !== "StateAliasDefinitionStatement" ||
    statement.body !== null
  ) {
    return []
  }
  const colon = findSecondDescriptionColon(source, statement)
  if (colon === null) return []
  return [{ start: colon.range[0], end }]
}

/**
 * The `:` that starts the second description of an alias definition
 * without a body, or null: the last token of the structure before the
 * description, which starts after the directives that follow the `:`.
 */
function findSecondDescriptionColon(
  source: Source,
  statement: StateAliasDefinitionStatement,
): Token | null {
  const text = statement.secondDescription
  if (text === null) return null
  const colon = findStructuralTokenEndingBefore(source, text.range[0])
  return colon?.value === ":" ? colon : null
}

/**
 * Whether a note is written over lines: its text stands on the lines after
 * it, up to `end note`.
 */
function isNoteOverLines(
  source: Source,
  statement: StateNoteStatement,
): boolean {
  const last = findTokenEndingBefore(source, statement.range[1])
  return last?.type === "Keyword" && last.range[1] === statement.range[1]
}

/**
 * The stretch of a note on one line after its id: its `:` and its text, as
 * written, from right after the id. mermaid.js reads the text of the note
 * from there, without its first two characters: `note left of A:hi` has the
 * text `i`, and `note left of A  : hi` the text `: hi` (docs/state.md,
 * Notes). A text that mermaid.js does not read right after the position,
 * `note left of%%x A`, touches the position, as written, and stands before
 * the id, one space before it.
 */
function findNoteStretches(statement: StateStatement, end: number): Atom[] {
  if (statement.type !== "StateNoteStatement" || statement.state === null) {
    return []
  }
  return [{ start: statement.state.range[1], end }]
}

/**
 * The layout of a note over lines: its keyword, position, and id, its text
 * on the lines after them as written, and `end note` at the level of the
 * note (docs/state.md, Multi-line values).
 */
function layoutNoteOverLines(
  source: Source,
  statement: StateNoteStatement,
  end: number,
): AtomLayout {
  const note = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `note` of an `end note`",
  )
  // `end` and `note` are two tokens: the line that closes the note starts
  // with the `end`.
  const endKeyword = expectToken(
    findStructuralTokenEndingBefore(source, note.range[0]),
    "the `end` of an `end note`",
  )
  return {
    atoms: collectAtoms(
      source,
      statement.range[0],
      end,
      collectValueNodes(statement, stateValueNodeTypes),
      [],
    ),
    rules: new Map(),
    outdented: new Set([endKeyword.range[0]]),
    lineBreaks: "kept",
  }
}

/** The gap rules of a statement. */
function statementRules(
  source: Source,
  statement: StateSimpleStatement | StateBodyStatement,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  switch (statement.type) {
    case "StateTransitionStatement": {
      const arrow = expectToken(
        findStructuralToken(source, statement.from.range[1]),
        "the arrow of a transition",
      )
      expectValue(arrow, "-->")
      // After an id that a space would make a keyword, the arrow touches
      // both states, as after a number in a sequence diagram
      // (docs/state.md, Arrow spacing).
      const arrowRule = isReadOtherwiseBeforeWhitespace(statement.from)
        ? "none"
        : "space"
      rules.set(arrow.range[0], arrowRule)
      rules.set(statement.to.range[0], arrowRule)
      addDescriptionRules(source, statement.to, statement.label, rules)
      break
    }
    case "StateDefinitionStatement":
      addDescriptionRules(
        source,
        statement.reference,
        statement.description,
        rules,
      )
      break
    case "StateAliasDefinitionStatement": {
      addAliasHeaderRules(source, statement, rules)
      const colon = findFirstColon(source, statement)
      if (statement.body === null && colon !== null) {
        rules.set(colon.range[0], "space")
      }
      if (statement.body !== null) {
        const { opening, closing } = findBodyBraces(source, statement)
        rules.set(opening.range[0], "space")
        if (isEmptyBody(source, statement)) rules.set(closing.range[0], "space")
      }
      break
    }
    case "StateCompositeStatement":
      if (statement.body !== null) {
        const { opening, closing } = findBodyBraces(source, statement)
        rules.set(opening.range[0], "space")
        if (isEmptyBody(source, statement)) rules.set(closing.range[0], "space")
      }
      break
    case "StatePseudostateDefinitionStatement": {
      // The name before the mark is read without the whitespace at its
      // end, so one space stands before the mark (docs/state.md,
      // Pseudostates).
      const mark = expectToken(
        findTokenEndingBefore(source, statement.range[1]),
        "the mark of a pseudostate",
      )
      rules.set(mark.range[0], "space")
      break
    }
    case "StateAccTitleStatement":
    case "StateAccDescrStatement":
      addAccessibilityColonRules(source, statement, rules)
      break
    default:
      break
  }
  return rules
}

/**
 * Adds the rules of the `:` of a description or a label after a state
 * reference: one space on each side (docs/state.md, Descriptions and
 * labels), except before the `:` after a reference that a space would make
 * a keyword (see `isReadOtherwiseBeforeWhitespace`). A description of only
 * whitespace is a kept stretch (see `findBlankDescriptionStretches`).
 *
 * On a line that holds a `;`, whether whitespace follows the `:` is kept as
 * written. The line rule (common.md, `style` and `classDef` lines) ignores
 * the last `;` of a line where a `:` is followed by text without whitespace
 * up to a `#`, after the text `style`: in `styleA :#f00;`, the `;` is
 * ignored, and a space after the `:` would make it an id.
 */
function addDescriptionRules(
  source: Source,
  reference: StateReference,
  text: Node | null,
  rules: Map<number, GapRule>,
): void {
  if (text === null) return
  const colon = findStructuralToken(source, reference.range[1])
  if (colon?.value !== ":" || colon.range[0] >= text.range[0]) return
  if (!isReadOtherwiseBeforeWhitespace(reference)) {
    rules.set(colon.range[0], "space")
  }
  if (
    findStateSemicolonLines(source).has(lineStartOf(source, colon.range[0]))
  ) {
    return
  }
  rules.set(text.range[0], "space")
}

/**
 * Adds the rules of the parts of an alias definition before its body or its
 * second description: one space before the string, the `""` after it, `as`,
 * and the id (docs/state.md, Aliases). mermaid.js reads `"d"as A` as it
 * reads `"d" as A`, and `as` needs whitespace after it already, so the
 * spaces change nothing it reads; `asA` is no `as` and is rejected.
 */
function addAliasHeaderRules(
  source: Source,
  statement: StateAliasDefinitionStatement,
  rules: Map<number, GapRule>,
): void {
  const { description, textAfterDescription } = statement
  rules.set(description.range[0], "space")
  if (textAfterDescription !== null) {
    rules.set(textAfterDescription.range[0], "space")
  }
  const asKeyword = expectToken(
    findStructuralToken(source, (textAfterDescription ?? description).range[1]),
    "the `as` of an alias definition",
  )
  rules.set(asKeyword.range[0], "space")
  if (statement.id !== null) rules.set(statement.id.range[0], "space")
}

/**
 * The words that the lexer reads as keywords only when whitespace follows
 * them, as ids otherwise: rules 10, 14 to 17, 19, and 20 of the statement
 * context, of which a composite body tries 14 to 17 and 19 too
 * (diagrams/state.md, The statement context and The composite body
 * context). In a composite body, `scale` and `stateDiagram` are ids also
 * before whitespace, and keeping them touching what follows there changes
 * nothing. In lower case, since the lexer compares them case-insensitively.
 */
const keywordsBeforeWhitespace: ReadonlySet<string> = new Set([
  "scale",
  "classdef",
  "class",
  "style",
  "state",
  "note",
  "statediagram",
])

/**
 * Whether a state reference ends with an id that whitespace after it would
 * make a keyword: `style:#x` is the state `style` with the description
 * `#x`, and in `style :#x` the lexer reads the keyword `style` and a style
 * statement. No space is put after such an id where none is written
 * (docs/state.md, Arrow spacing and Descriptions and labels). The id that
 * ends a reference is its class after `:::` when it has one, which the
 * lexer reads as an id in the same way: `A:::state-->B`.
 */
export function isReadOtherwiseBeforeWhitespace(
  reference: StateReference,
): boolean {
  const last = reference.cssClass ?? reference.state
  return (
    last.type === "Identifier" &&
    keywordsBeforeWhitespace.has(toAsciiLowerCase(last.name))
  )
}

/**
 * Adds the rules of the `:` after `accTitle` and `accDescr`: it touches the
 * keyword and has one space after it (docs/state.md, Descriptions and
 * labels).
 */
function addAccessibilityColonRules(
  source: Source,
  statement: Extract<
    StateSimpleStatement,
    { type: "StateAccTitleStatement" | "StateAccDescrStatement" }
  >,
  rules: Map<number, GapRule>,
): void {
  const keyword = expectToken(
    findStructuralToken(source, statement.range[0]),
    "`accTitle` or `accDescr`",
  )
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` after `accTitle` or `accDescr`",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "none")
  if (statement.value !== null) rules.set(statement.value.range[0], "space")
}
