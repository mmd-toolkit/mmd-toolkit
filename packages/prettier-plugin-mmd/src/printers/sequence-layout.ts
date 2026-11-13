import type {
  Node,
  SequenceIdentifier,
  SequenceMessageStatement,
  SequenceStatement,
  SequenceTitleStatement,
  Token,
} from "@mmd-toolkit/ast"
import type { MermaidAst } from "../parser.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  descriptionOpeningRules,
  expectToken,
  expectValue,
  findAccDescrBlockClosing,
  findAccDescrBlockStretches,
  formatDescriptionBlock,
  keepFirstGapLineTails,
  layoutCompactEmptyDescriptionBlockWithFallback,
  replaceInAtoms,
  toAsciiLowerCase,
  walk,
} from "./layout.ts"
import { holdsNameLikeDataBlock } from "./sequence-name-blocks.ts"
import {
  findKeptBreaks,
  findLinesEndedBySemicolon,
  findLinesWithOwnSemicolons,
  gapKeepsLineBreak,
  holdsJoiningRegion,
  lineStartOf,
  printedEndOf,
  spansKeptBreaks,
} from "./kept-lines.ts"
import { trimTextAfterKeyword } from "./statement-rules.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTriviaAt,
  findTriviaBetween,
  isAtLineEnd,
  isSpaceOrTab,
  isWhitespace,
  skipRemoved,
} from "./source.ts"

/**
 * The node types of a sequence diagram whose text is a value, printed as
 * written: the shared leaf nodes, of which no sequence statement holds an
 * `Identifier` or a `StringLiteral` yet, and the leaf nodes of the diagram
 * type, among them `SequenceIdentifier`, the id of a participant, which may
 * contain whitespace (ast/sequence.md, SequenceIdentifier). They have no
 * child fields; `tests/value-nodes.test.ts` checks that every other such
 * node type is left out on purpose.
 */
export const sequenceValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "SequenceIdentifier",
  "SequenceLiteral",
  "SequenceDataBlock",
  "SequenceIgnoredStatement",
])

/** The blocks whose statements are one body, closed by `end`. */
export type SequenceBodyBlockStatement = Extract<
  SequenceStatement,
  {
    type:
      | "SequenceBoxStatement"
      | "SequenceLoopStatement"
      | "SequenceRectStatement"
      | "SequenceOptStatement"
      | "SequenceBreakStatement"
  }
>

/**
 * The blocks of sections: each section is closed by the next one, and the
 * last by `end`.
 */
export type SequenceSectionBlockStatement = Extract<
  SequenceStatement,
  {
    type:
      | "SequenceAltStatement"
      | "SequenceParStatement"
      | "SequenceParOverStatement"
      | "SequenceCriticalStatement"
  }
>

/** The statements that hold statements of their own, with an `end`. */
export type SequenceBlockStatement =
  SequenceBodyBlockStatement | SequenceSectionBlockStatement

/** A statement that holds no other statement. */
export type SequenceSimpleStatement = Exclude<
  SequenceStatement,
  SequenceBlockStatement
>

/** A statement, with the kind of statement it is. */
export type ClassifiedSequenceStatement =
  | { readonly kind: "body"; readonly statement: SequenceBodyBlockStatement }
  | {
      readonly kind: "sections"
      readonly statement: SequenceSectionBlockStatement
    }
  | { readonly kind: "simple"; readonly statement: SequenceSimpleStatement }

/**
 * Which kind of statement a node is: a block with one body, a block of
 * sections, or a statement that holds no other; null for a node that is no
 * statement of a sequence diagram. The kinds are decided here only. Every
 * statement type is listed, the node of each case is checked against the
 * type of its kind, and the check after the cases fails when a statement
 * type of the tree is not listed.
 */
export function classifySequenceStatement(
  node: SequenceStatement,
): ClassifiedSequenceStatement
export function classifySequenceStatement(
  node: MermaidAst,
): ClassifiedSequenceStatement | null
export function classifySequenceStatement(
  node: MermaidAst,
): ClassifiedSequenceStatement | null {
  switch (node.type) {
    case "SequenceBoxStatement":
    case "SequenceLoopStatement":
    case "SequenceRectStatement":
    case "SequenceOptStatement":
    case "SequenceBreakStatement":
      return { kind: "body", statement: node }
    case "SequenceAltStatement":
    case "SequenceParStatement":
    case "SequenceParOverStatement":
    case "SequenceCriticalStatement":
      return { kind: "sections", statement: node }
    case "SequenceParticipantStatement":
    case "SequenceDestroyStatement":
    case "SequenceMessageStatement":
    case "SequenceAutonumberStatement":
    case "SequenceActivateStatement":
    case "SequenceDeactivateStatement":
    case "SequenceNoteStatement":
    case "SequenceLinksStatement":
    case "SequenceLinkStatement":
    case "SequencePropertiesStatement":
    case "SequenceDetailsStatement":
    case "SequenceTitleStatement":
    case "SequenceAccTitleStatement":
    case "SequenceAccDescrStatement":
    case "SequenceAccDescrBlockStatement":
    case "SequenceIgnoredStatement":
      return { kind: "simple", statement: node }
    default:
      node satisfies Exclude<MermaidAst, SequenceStatement>
      return null
  }
}

/** The layout of the header line: the keyword `sequenceDiagram`. */
export function layoutSequenceHeader(
  source: Source,
  keyword: Token,
): AtomLayout {
  return {
    atoms: collectAtoms(source, keyword.range[0], keyword.range[1], [], []),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of the line that opens a block or a section, from its keyword
 * at `start` to `end`: the keyword and the text after it (`text`), whose
 * values are printed as written.
 *
 * The text of a box is kept as a whole, the whitespace between its colour
 * candidate and the rest included: when the candidate is no colour,
 * mermaid.js takes the whole text as the name of the box
 * (diagrams/sequence.md, Box colours), so `box Group   1` has the name
 * `Group   1`. The text ends where its last part ends, a U+2028 or U+2029
 * at its end included: they count as characters that are not whitespace
 * there (ast/sequence.md, SequenceBoxText), so the text is printed as it is.
 */
export function layoutBlockHeader(
  source: Source,
  start: number,
  end: number,
  text: Node | null,
): AtomLayout {
  if (holdsJoiningRegion(source, start, end)) {
    // A comment line cuts in, after a U+2028 or U+2029, and the text goes on
    // after it: `alt`, U+2028, `%% e`, and a line ` a` is `alt a`. The
    // header cannot be printed with its text on its own line, so it is kept
    // as written (docs/compatibility.md, A comment line after U+2028 or
    // U+2029).
    return {
      atoms: [{ start, end }],
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "kept",
    }
  }
  const kept: Atom[] =
    text?.type === "SequenceBoxText"
      ? [{ start: text.range[0], end: text.range[1] }]
      : []
  const rules = new Map<number, GapRule>()
  if (text !== null) {
    // The text stands after one space, also where it touched the keyword
    // (docs/sequence.md, Whitespace between tokens).
    rules.set(text.range[0], "space")
    addWrapRules(text, rules)
  }
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      kept.length === 0 ? valuesOf(text) : [],
      kept,
    ),
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * The layout of a statement that holds no other statement, from its start
 * to `end` (see `findSequencePrintedEnd`).
 *
 * - A statement written over several lines stands on one line: a line
 *   break inside a statement comes after whitespace, and the lexer reads
 *   the two as whitespace (diagrams/sequence.md, The statement context,
 *   rule 2). Comments and directives keep line breaks while structural
 *   continuations align; the lines of an `accDescr { ... }` block are
 *   lines of its text: keep their breaks and align their safe indentation
 *   (docs/sequence.md, Multi-line statements).
 * - A title is laid out by `layoutTitle`.
 * - A message has one space before and after its arrow (docs/sequence.md,
 *   Arrow spacing).
 * - A `:` before a text touches what comes before it and has one space
 *   after it when a text follows (docs/sequence.md, Colons).
 * - Later lines of an `accDescr { ... }` block align one level inside the
 *   statement without joining their text. Its `}` stands at the level of
 *   the statement (docs/sequence.md, Multi-line values).
 */
export function layoutSequenceStatement(
  source: Source,
  statement: SequenceSimpleStatement,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  const keptBreaks =
    statement.type === "SequenceAccDescrBlockStatement"
      ? new Set<number>()
      : findKeptBreaks(source, start, end)
  const keepsLineBreaks =
    statement.type !== "SequenceAccDescrBlockStatement" &&
    spansKeptBreaks(source, keptBreaks, start, end)
  if (
    keepsLineBreaks &&
    (statement.type === "SequenceTitleStatement" ||
      holdsJoiningRegion(source, start, end))
  ) {
    return {
      atoms: [{ start, end }],
      rules: new Map(),
      outdented: new Set(),
      lineBreaks: "kept",
    }
  }
  if (statement.type === "SequenceTitleStatement") {
    return layoutTitle(source, statement)
  }
  const values = collectValueNodes(statement, sequenceValueNodeTypes)
  if (statement.type === "SequenceIgnoredStatement") values.push(statement)
  // The directives and `;` that follow a statement whose last unit reads no
  // whitespace are part of it, as written (see `printedEndAfterSemicolons`).
  const tail =
    end > statement.range[1] ? [{ start: statement.range[1], end }] : []
  if (statement.type === "SequenceAccDescrBlockStatement") {
    const block = statement

    /** Builds the existing value, trivia and closing-brace layout. */
    function originalLayout(): AtomLayout {
      const closing = findAccDescrBlockClosing(source, block)
      return formatDescriptionBlock(source, block, {
        atoms: collectAtoms(
          source,
          start,
          end,
          values,
          findAccDescrBlockStretches(source, block),
        ),
        rules: descriptionOpeningRules(source, start),
        outdented: closing === null ? new Set() : new Set([closing]),
        lineBreaks: "kept",
      })
    }

    return statement.value === null && statement.closed
      ? layoutCompactEmptyDescriptionBlockWithFallback(
          source,
          start,
          end,
          originalLayout,
        )
      : originalLayout()
  }
  // A data block that a version that counts reads as a part of the name stays
  // as written with its id, so does the gap between them (docs/sequence.md,
  // Whitespace between tokens).
  const nameBlock = holdsNameLikeDataBlock(statement)
    ? [{ start: statement.id.range[0], end: statement.data.range[1] }]
    : []
  const atoms = collectAtoms(source, start, end, values, [
    ...tail,
    ...nameBlock,
    ...(statement.type === "SequenceMessageStatement"
      ? findNameGaps(source, statement)
      : []),
  ])
  return {
    atoms: keepFirstGapLineTails(source, atoms, (from, to) =>
      gapKeepsLineBreak(source, keptBreaks, from, to),
    ),
    rules: statementRules(source, statement),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * The stretches of a message whose whitespace stays as written, directives
 * and all: some versions that count read a `()` beside an id, and the `<<` of
 * a `<<->>` or `<<-->>`, as part of the name, so the whitespace between the id
 * and the `()` or the `<<` is part of the name, and so is the one between a
 * `()` and the target (docs/sequence.md, Arrow spacing).
 */
function findNameGaps(
  source: Source,
  statement: SequenceMessageStatement,
): Atom[] {
  const stretches: Atom[] = []
  const { arrow, from, to } = statement
  const arrowText = source.text.slice(arrow.range[0], arrow.range[1])
  if (arrowText === "<<->>" || arrowText === "<<-->>") {
    // The name reaches the `<<`, so the stretch holds the `()` and the gaps
    // around it.
    stretches.push({ start: from.range[1], end: arrow.range[0] })
  } else if (statement.fromCentralConnection) {
    const parentheses = expectToken(
      findStructuralToken(source, from.range[1]),
      "the `()` after the source of a message",
    )
    stretches.push({ start: from.range[1], end: parentheses.range[1] })
  }
  if (statement.toCentralConnection) {
    const parentheses = expectToken(
      findStructuralToken(source, arrow.range[1]),
      "the `()` before the target of a message",
    )
    stretches.push({ start: parentheses.range[0], end: to.range[0] })
  }
  return stretches
}

/**
 * The layout of a title: its keyword with the directives right after it,
 * one space for the one whitespace character that follows them, and the
 * rest as written (docs/sequence.md, Title). The title of the Db keeps the
 * whitespace after that character, at its end included, and that character
 * may be a line break, after which the next line is the title: `title`, a
 * line break, and `A->>B: x` is printed as `title A->>B: x`, which shows
 * how mermaid.js reads it. A U+2028 or U+2029 in its place is kept, as it
 * is where it ends the text: a `;` after it stays, and with the character
 * printed as a space the `;` of a second formatting would be dropped.
 */
function layoutTitle(
  source: Source,
  statement: SequenceTitleStatement,
): AtomLayout {
  const { separator, end } = findTitleText(source, statement)
  const keepsSeparator =
    source.text[separator] === "\u2028" || source.text[separator] === "\u2029"
  const text: Atom = { start: keepsSeparator ? separator : separator + 1, end }
  const atoms: Atom[] = [{ start: statement.range[0], end: separator }, text]
  // A `;` that the line rule ignores between the keyword and the text is
  // removed by mermaid.js. Printed on a line of its own, it would lose the
  // trigger of the rule and separate the statement from its text, so it is left
  // out, unless the line is one that stays together (docs/sequence.md, Title).
  const line = lineStartOf(source, statement.range[0])
  const ignored =
    findLinesWithOwnSemicolons(source).has(line) ||
    findLinesEndedBySemicolon(source).has(line)
      ? []
      : [...source.ignoredSemicolons].filter(
          (offset) => statement.range[0] <= offset && offset < separator,
        )
  replaceInAtoms(
    source,
    atoms,
    ignored.map((offset) => ({ range: [offset, offset + 1], replacement: "" })),
  )
  // mermaid.js keeps the whitespace after the separator in the title, and
  // draws the same text without it (docs/compatibility.md, Texts after a
  // keyword that are drawn the same).
  if (!keepsSeparator) {
    trimTextAfterKeyword(source, atoms, [text.start, end], true)
  }
  return {
    atoms,
    rules: keepsSeparator ? new Map() : new Map([[text.start, "space"]]),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * Where the text of a title lies: `separator`, the offset of the one
 * whitespace character after its keyword, and `end`, the end of the value
 * of the title, whitespace at its end included (ast/sequence.md,
 * SequenceTitleStatement). The text starts after the separator and may be
 * all whitespace; it runs to a `#`, a `;` that the line rule does not
 * ignore, or a line break (diagrams/sequence.md, The statement context).
 *
 * Between the keyword and the start of the value lie the separator, which
 * is a line feed when the text is on the next line, and directives and
 * comment regions (ast.md, Comment and Directive). The separator is the
 * first whitespace character there that no directive or comment covers.
 */
export function findTitleText(
  source: Source,
  statement: SequenceTitleStatement,
): { readonly separator: number; readonly end: number } {
  const { value } = statement
  const keyword = expectToken(
    findTokenStartingAt(source, statement.range[0]),
    "the keyword of a title",
  )
  let separator = keyword.range[1]
  while (separator < value.range[0]) {
    const covering = findTriviaBetween(source, separator, separator + 1).at(0)
    if (covering !== undefined) {
      separator = covering.range[1]
    } else if (isWhitespace(source.text.charAt(separator))) {
      return {
        separator,
        end: printedEndOf(
          source,
          statement.range[1],
          value.range[0],
          value.range[1],
        ),
      }
    } else {
      separator++
    }
  }
  throw new Error(
    `prettier-plugin-mmd: no whitespace between the keyword of the title at offset ${statement.range[0]} and its text`,
  )
}

/** What stands after the bare `:` of a statement (see `scanAfterBareColon`). */
interface ColonRemainder {
  readonly holdsWhitespace: boolean
  /** Whether nothing but spaces and tabs stands there. */
  readonly isPlainRun: boolean
  /**
   * Whether a space or a tab stands right after the `:`, and no line
   * separator (U+2028, U+2029) follows, so that the first character is the one
   * that is read as the text and the rest can be left out.
   */
  readonly startsWithSpaceOrTab: boolean
}

/**
 * What stands after the bare `:` of a message, a note, or a `links`, `link`,
 * `properties`, or `details` statement, whose text is empty: whether it holds
 * whitespace, and whether it is a plain run of spaces and tabs. Null when the
 * statement has a text, or when the line goes on after the whitespace and the
 * directives with anything else (a comment is read as text, which is no
 * whitespace to hold). The scan stops at the end of the line or at a `;`.
 */
function scanAfterBareColon(
  source: Source,
  statement: SequenceStatement,
): ColonRemainder | null {
  switch (statement.type) {
    case "SequenceMessageStatement":
    case "SequenceNoteStatement":
    case "SequenceLinksStatement":
    case "SequenceLinkStatement":
    case "SequencePropertiesStatement":
    case "SequenceDetailsStatement":
      break
    default:
      return null
  }
  if (statement.text !== null) return null
  let end = statement.range[1]
  let holdsWhitespace = false
  let holdsSeparator = false
  let isPlainRun = true
  while (!isAtLineEnd(source, end) && source.text[end] !== ";") {
    const character = source.text.charAt(end)
    if (isWhitespace(character)) {
      holdsWhitespace = true
      if (character === "\u2028" || character === "\u2029")
        holdsSeparator = true
      if (!isSpaceOrTab(character)) isPlainRun = false
      end++
      continue
    }
    const at = end
    const directive = findTriviaBetween(source, at, at + 1).find(
      (item) => item.type === "Directive" && item.range[0] === at,
    )
    if (directive === undefined) return null
    isPlainRun = false
    end = directive.range[1]
  }
  return {
    holdsWhitespace,
    isPlainRun,
    startsWithSpaceOrTab:
      isSpaceOrTab(source.text.charAt(statement.range[1])) && !holdsSeparator,
  }
}

/**
 * The end of the `%%` comment that follows such a data block on its line, or
 * undefined when none does. The name of a participant that a version that
 * counts reads reaches that comment, with the whitespace before it, so both
 * stay as written (a participant with a description after `as` has its text
 * run to the comment already).
 */
export function findEndOfCommentAfterNameBlock(
  source: Source,
  statement: SequenceStatement,
): number | undefined {
  if (!holdsNameLikeDataBlock(statement) || statement.alias !== null) {
    return undefined
  }
  // mermaid.js removes the directives before it reads the name, so the name
  // runs over the spaces and tabs and the directives to the comment.
  let position = statement.range[1]
  for (;;) {
    const read = skipRemoved(source, position)
    if (read !== position) position = read
    else if (isSpaceOrTab(source.text.charAt(position))) position++
    else break
  }
  const comment = findTriviaAt(source, position)
  return comment?.type === "Comment" &&
    comment.mark === "%%" &&
    comment.range[0] === position
    ? comment.range[1]
    : undefined
}

/**
 * The end of the statement together with the whitespace character that stays
 * after its `:` when no text follows it, or null when no whitespace stays:
 * `A->>B: ` is a message with an empty text, while a version that counts
 * rejects `A->>B:`, since its text rule needs a character at least. The
 * whitespace is outside the range of the statement, and its first character
 * is printed as written, as in a task of a Gantt chart or a user journey
 * (docs/sequence.md, Colons). It stays only where nothing but spaces and tabs
 * follows the `:` up to the end of the line or to a `;`, which the printer
 * drops. Where a directive or another whitespace character follows the `:`,
 * the line is printed as written (see `readsItsColonWhitespace`).
 */
export function findColonWhitespaceEnd(
  source: Source,
  statement: SequenceStatement,
): number | null {
  const remainder = scanAfterBareColon(source, statement)
  return remainder !== null &&
    remainder.holdsWhitespace &&
    (remainder.isPlainRun || remainder.startsWithSpaceOrTab)
    ? statement.range[1] + 1
    : null
}

/**
 * Whether the line of a statement with an empty text is printed as written,
 * because the whitespace after its `:` is read with what lies around it.
 * A version that counts needs a character after the `:`, takes a whitespace
 * character of any kind for it, and removes a directive before it reads the
 * line, so the whitespace after a directive is that character too. The printer
 * drops whitespace at the end of a line and prints another whitespace
 * character as a space, so where the whitespace after the `:` is more than a
 * run of spaces and tabs, the line stays as it is, as in a task of a Gantt
 * chart or a user journey (docs/sequence.md, Colons).
 */
export function readsItsColonWhitespace(
  source: Source,
  statement: SequenceStatement,
): boolean {
  const remainder = scanAfterBareColon(source, statement)
  return (
    remainder !== null &&
    remainder.holdsWhitespace &&
    !remainder.isPlainRun &&
    !remainder.startsWithSpaceOrTab
  )
}

/** The gap rules of a statement: around its arrow, its `,`, and its `:`. */
function statementRules(
  source: Source,
  statement: SequenceSimpleStatement,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  switch (statement.type) {
    case "SequenceMessageStatement":
      addArrowRules(source, statement, rules)
      addColonRules(source, statement.to.range[1], statement.text, rules)
      break
    case "SequenceNoteStatement":
      addCommaRules(source, statement.ids, rules)
      addColonRules(
        source,
        (statement.ids.at(-1) ?? statement).range[1],
        statement.text,
        rules,
      )
      break
    case "SequenceLinksStatement":
    case "SequenceLinkStatement":
    case "SequencePropertiesStatement":
    case "SequenceDetailsStatement":
      addColonRules(source, statement.id.range[1], statement.text, rules)
      break
    case "SequenceParticipantStatement":
      if (statement.data !== null) rules.set(statement.data.range[0], "none")
      break
    case "SequenceAccTitleStatement":
    case "SequenceAccDescrStatement":
      addColonRules(
        source,
        expectToken(
          findStructuralToken(source, statement.range[0]),
          "`accTitle` or `accDescr`",
        ).range[1],
        statement.value,
        rules,
      )
      break
    default:
      break
  }
  addWrapRules(statement, rules)
  return rules
}

/**
 * Adds the rule of the text after the prefix `wrap:` or `nowrap:` of each text
 * in a node: it stands after one space, also where it touched the prefix
 * (docs/sequence.md, Whitespace between tokens).
 */
function addWrapRules(node: Node, rules: Map<number, GapRule>): void {
  walk(node, (child) => {
    if (child.type !== "SequenceText") return
    if (child.wrap !== null && child.value !== null) {
      rules.set(child.value.range[0], "space")
    }
  })
}

/**
 * Adds the rules of a message's arrow: one space before the arrow and one
 * after it, before the `+`, `-`, or `()` that may follow it, or before the
 * target; none on either side when the source is an id that a following
 * space would make another unit (see `isReadOtherwiseBeforeWhitespace`).
 * The `+` or `-` before the target touches the target, and the whitespace
 * beside a `()` stays as written (docs/sequence.md, Arrow spacing).
 * The arrow is printed from its token, whose range is the range of the
 * arrow node.
 */
function addArrowRules(
  source: Source,
  statement: SequenceMessageStatement,
  rules: Map<number, GapRule>,
): void {
  const { arrow } = statement
  const next = expectToken(
    findStructuralToken(source, arrow.range[1]),
    "what follows the arrow of a message",
  )
  // A `()` between the source and the arrow ends the id, so no whitespace
  // after the id is at stake (see `isReadOtherwiseBeforeWhitespace`).
  const rule =
    !statement.fromCentralConnection &&
    isReadOtherwiseBeforeWhitespace(statement.from.name)
      ? "none"
      : "space"
  rules.set(arrow.range[0], rule)
  rules.set(next.range[0], rule)
  // A version that counts has no `<<->>` and `<<-->>` and reads the `<<` as
  // part of the name before them, so the whitespace before such an arrow stays
  // as written.
  const arrowText = source.text.slice(arrow.range[0], arrow.range[1])
  if (arrowText === "<<->>" || arrowText === "<<-->>")
    rules.delete(arrow.range[0])
  // The whitespace beside a `()` stays as written: some versions that count
  // have no central connection and read `()` as part of a name.
  if (statement.activation !== null) {
    // The `-` of an activation and the first characters of the target would
    // read as an arrow (see `isReadAsArrowAfterMinus`).
    rules.set(
      statement.to.range[0],
      statement.activation === "-" && isReadAsArrowAfterMinus(statement.to.name)
        ? "space"
        : "none",
    )
  }
}

/**
 * Whether an id is spelled so that, touching a `-` before it, the lexer reads
 * the two as an arrow: `-x` and `-X`, since the lexer ignores case, and `-|\`
 * and `-|/` (diagrams/sequence.md, The statement context). So `A ->> - x: b`
 * keeps its space: `A ->> -x: b` is rejected.
 */
function isReadAsArrowAfterMinus(id: string): boolean {
  return (
    toAsciiLowerCase(id).startsWith("x") ||
    id.startsWith("|\\") ||
    id.startsWith("|/")
  )
}

/**
 * Adds the rules of the `,` between the two ids of a note over two
 * participants: none before it and one space after it (docs/sequence.md,
 * Whitespace between tokens). A note with one id has no `,`.
 */
function addCommaRules(
  source: Source,
  ids: readonly SequenceIdentifier[],
  rules: Map<number, GapRule>,
): void {
  if (ids.length < 2) return
  const [first, second] = ids
  const comma = expectToken(
    findStructuralToken(source, first.range[1]),
    "the `,` between the ids of a note",
  )
  expectValue(comma, ",")
  rules.set(comma.range[0], "none")
  rules.set(second.range[0], "space")
}

/**
 * Whether an id is spelled so that, followed by whitespace where a unit
 * starts, the lexer reads it as another unit (diagrams/sequence.md, The
 * statement context). Two rules of the statement context need whitespace
 * after what they match: rule 5, a number, and rule 13, `title` followed by
 * one whitespace character; a keyword is read where no word character
 * follows it, whitespace or not. So `1 ->>2: x` is rejected, since `1` is a
 * number there, and `title ->> B: x` is a title, while `1->>2: x` and
 * `title->>B: x` are messages (docs/sequence.md, Arrow spacing).
 */
export function isReadOtherwiseBeforeWhitespace(id: string): boolean {
  return isNumber(id) || toAsciiLowerCase(id) === "title"
}

/**
 * Whether a text has the form of a number of rule 5 of the statement
 * context: one or more digits, optionally followed by `.` and one or two
 * digits, or `.` followed by one or two digits. A digit is an ASCII digit.
 */
function isNumber(text: string): boolean {
  const point = text.indexOf(".")
  if (point === -1) return text.length > 0 && isDigits(text)
  const whole = text.slice(0, point)
  const fraction = text.slice(point + 1)
  return (
    (whole.length === 0 || isDigits(whole)) &&
    fraction.length >= 1 &&
    fraction.length <= 2 &&
    isDigits(fraction)
  )
}

/** Whether every character of a text is an ASCII digit. */
function isDigits(text: string): boolean {
  return [...text].every((character) => character >= "0" && character <= "9")
}

/**
 * Adds the rules of the `:` that comes after `offset`: no space before it,
 * and one space after it before the text, when there is one.
 */
function addColonRules(
  source: Source,
  offset: number,
  text: Node | null,
  rules: Map<number, GapRule>,
): void {
  const colon: Token = expectToken(
    findStructuralToken(source, offset),
    "the `:` before a text",
  )
  expectValue(colon, ":")
  rules.set(colon.range[0], "none")
  if (text !== null) rules.set(text.range[0], "space")
}

/** The value nodes of a node and below it. */
function valuesOf(node: Node | null): Node[] {
  if (node === null) return []
  const values = collectValueNodes(node, sequenceValueNodeTypes)
  return sequenceValueNodeTypes.has(node.type) ? [node, ...values] : values
}
