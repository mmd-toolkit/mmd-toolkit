import type { Node, Range, Token } from "@mmd-toolkit/parser"
import { visitorKeys } from "@mmd-toolkit/parser"
import type { Atom, AtomLayout } from "./atoms.ts"
import {
  findSemicolonLines,
  findVerbatimStyleLines,
  lineEndOf,
  lineStartOf,
  semicolonSegmentEnd,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokenStartingAt,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
} from "./source.ts"

/**
 * The nodes below a statement whose text is a value, of one of
 * `valueTypes`: each is printed as written.
 */
export function collectValueNodes(
  statement: Node,
  valueTypes: ReadonlySet<Node["type"]>,
): Node[] {
  const values: Node[] = []
  walk(statement, (node) => {
    if (valueTypes.has(node.type)) values.push(node)
  })
  return values
}

/**
 * Calls `visit` for every node below `node`, not for `node` itself, in the
 * order of the parser's `visitorKeys`. Value nodes have no child fields.
 */
export function walk(node: Node, visit: (node: Node) => void): void {
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    const children = Array.isArray(value) ? value : [value]
    for (const child of children as (Node | null)[]) {
      if (child === null) continue
      visit(child)
      walk(child, visit)
    }
  }
}

/**
 * The atoms in `[start, end)`: the kept stretches, the value nodes outside
 * them, and the structural tokens outside both, in source order. The other
 * tokens outside them, the `;` tokens, separate statements or are items of
 * the gaps (see `isStructural` and gap.ts).
 */
export function collectAtoms(
  source: Source,
  start: number,
  end: number,
  values: readonly Node[],
  kept: readonly Atom[],
): Atom[] {
  const covered: Atom[] = [...kept]
  for (const value of values) {
    if (kept.some((stretch) => overlapsPartly(stretch, value.range))) {
      throw new Error(
        `prettier-plugin-mmd: a kept stretch cuts the ${value.type} at offset ${value.range[0]}`,
      )
    }
    if (!kept.some((stretch) => contains(stretch, value.range))) {
      covered.push({ start: value.range[0], end: value.range[1] })
    }
  }
  const atoms = [...covered]
  for (const token of findTokensBetween(source, start, end)) {
    if (
      isStructural(source, token) &&
      // A common literal can own exterior padding beyond its printed range.
      // Such a token already contributes its printed part through the value.
      !covered.some(
        (atom) => atom.start < token.range[1] && token.range[0] < atom.end,
      )
    ) {
      atoms.push(toAtom(token))
    }
  }
  return atoms.sort((a, b) => a.start - b.start)
}

/**
 * Whether a stretch and a range share text without one containing the
 * other: the shared text would be printed twice.
 */
function overlapsPartly(stretch: Atom, range: Range): boolean {
  const shares = stretch.start < range[1] && range[0] < stretch.end
  return (
    shares &&
    !contains(stretch, range) &&
    !(range[0] <= stretch.start && stretch.end <= range[1])
  )
}

/** Whether `outer` contains the range. */
function contains(outer: Atom, range: Range): boolean {
  return outer.start <= range[0] && range[1] <= outer.end
}

/** The atom of a token. */
function toAtom(token: Token): Atom {
  return { start: token.range[0], end: token.range[1] }
}

/**
 * Whether the text of a statement from `start` to `end` lies on several
 * lines and cannot be joined into one: it holds a comment or a directive, or
 * a `;`, or its last line is one that holds a `;` (see `findSemicolonLines`).
 * Where the lexer reads the line breaks inside a statement as whitespace, a
 * printer joins the lines of the statement; a comment would then take the
 * rest of the line, and a `;` could come to a line that matches the line rule
 * (common.md, `style` and `classDef` lines) while it did not on its own line,
 * so the rule would ignore it and the text would change: `classDef`, a line
 * break, and `c fill:#f00;` has the entity `#f00;` in its style, and
 * `classDef c fill:#f00;` has the style `fill:#f00`. The same holds when the
 * `;` is in another statement on the last line of the statement: the joined
 * line takes the text before the `;` from the first line, and the rule reads
 * the text of the whole line. `"style:#q" - satisfies`, a line break, and
 * `-> "b" e - satisfies -> f;g` has the target `f;g`, and the joined line has
 * the target `fg`. Such a statement is kept as written (docs/sequence.md and
 * docs/class.md, Multi-line statements). This is the one decision about
 * joining lines that every layout takes.
 */
export function spansLinesThatCannotJoin(
  source: Source,
  start: number,
  end: number,
): boolean {
  const text = source.text.slice(start, end)
  if (!text.includes("\n")) return false
  if (text.includes(";") || findTriviaBetween(source, start, end).length > 0) {
    return true
  }
  return findSemicolonLines(source).has(lineStartOf(source, end - 1))
}

/**
 * A statement crossing a shared word-protected line keeps its complete source
 * span, so moving its edges cannot alter line-rule selection (docs/railroad.md
 * and docs/wardley.md, Semicolons). The block printer retains same-line siblings.
 */
export function layoutOnVerbatimStyleLine(
  source: Source,
  start: number,
  end: number,
): AtomLayout | null {
  const verbatim = findVerbatimStyleLines(source)
  for (
    let line = lineStartOf(source, start);
    line < end;
    line = lineEndOf(source, line) + 1
  )
    if (verbatim.has(line)) return keptAsWritten(start, end)
  return null
}

/** A layout of one atom, the text from `start` to `end` as written. */
export function keptAsWritten(start: number, end: number): AtomLayout {
  return {
    atoms: [{ start, end }],
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "kept",
  }
}

/**
 * Where a layout ends: the end of its last atom. The statements of the body
 * start after the header, which holds more than the keyword where the header
 * has a direction or an orientation.
 */
export function findLayoutEnd(layout: AtomLayout): number {
  const last = layout.atoms.at(-1)
  if (last === undefined) {
    throw new Error("prettier-plugin-mmd: a header layout without atoms")
  }
  return last.end
}

/** The layout of the line of a header that is a keyword alone. */
export function layoutKeywordHeader(
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
 * The layout of an `accDescr {}` block without text, which changes nothing: a
 * statement of its own, or an item of the body of a block. It is printed on
 * one line unless it holds a comment or a directive over several lines (see
 * `spansLinesThatCannotJoin`); that case stays as written by default.
 * `formatsTriviaLines` instead keeps the line breaks while formatting the
 * tokens and trivia with the caller's statement and continuation indentation.
 */
export function layoutEmptyDescriptionBlock(
  source: Source,
  start: number,
  end: number,
  formatsTriviaLines = false,
): AtomLayout {
  if (!formatsTriviaLines && spansLinesThatCannotJoin(source, start, end)) {
    return keptAsWritten(start, end)
  }
  return {
    atoms: collectAtoms(source, start, end, [], []).filter(
      (atom) => source.text.slice(atom.start, atom.end).trim() !== "",
    ),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: formatsTriviaLines ? "kept" : "joined",
  }
}

/**
 * A closed empty block without trivia prints `{}`: no text needs surrounding
 * whitespace. Every diagram follows the same Db-equal form. Null leaves
 * each caller's previous trivia or nonjoining layout in charge (their rules
 * documents, Accessibility lines or Multi-line values).
 * A non-null layout ends with two atoms: the opening `{` and closing `}`,
 * whose ranges are exactly those of the brace tokens. Their intervening gap
 * is the compacted interior, also used by state-kept-lines.ts.
 */
export function layoutCompactEmptyDescriptionBlock(
  source: Source,
  start: number,
  end: number,
): AtomLayout | null {
  if (
    findTriviaBetween(source, start, end).length > 0 ||
    spansLinesThatCannotJoin(source, start, end)
  )
    return null
  const closing = expectToken(
    findTokenEndingBefore(source, end),
    "the closing empty description brace",
  )
  expectValue(closing, "}")
  return {
    ...layoutEmptyDescriptionBlock(source, start, end),
    rules: new Map([[closing.range[0], "none"]]),
    joinedBefore: new Set([closing.range[0]]),
  }
}

/**
 * Tries the compact layout of a closed empty description, otherwise builds
 * its original layout. Keeping the fallback lazy preserves the caller's
 * trivia and continuation layout without building it for a compact block.
 */
export function layoutCompactEmptyDescriptionBlockWithFallback(
  source: Source,
  start: number,
  end: number,
  originalLayout: () => AtomLayout,
): AtomLayout {
  return (
    layoutCompactEmptyDescriptionBlock(source, start, end) ?? originalLayout()
  )
}

/**
 * The layout of an `accDescr { ... }` statement: the lines of its text are
 * kept as written and its `}` stands at the level of the statement (the
 * rules document of the diagram type, Accessibility statements). A closed block
 * without text prints `{}` unless trivia requires its existing layout. The
 * text is a value of `valueTypes`. The block is closed unless the statement
 * says that it is not, as in an XY chart, where a block that is not closed
 * runs to the end of the text and is printed without a `}`.
 */
export function layoutDescriptionBlock(
  source: Source,
  statement: Node & {
    readonly value: Node | null
    readonly closed?: boolean
  },
  end: number,
  valueTypes: ReadonlySet<Node["type"]>,
  options: {
    readonly keepsTrailingTrivia?: boolean
    /** Formats an empty block's tokens and trivia lines, keeping its breaks. */
    readonly formatsEmptyTrivia?: boolean
    /** Common converters trim literal edges even when the AST owns them. */
    readonly trimValueEdges?: boolean
    /** Authored opener after structural forms that the caller replaces. */
    readonly opening?: number
  } = {},
): AtomLayout {
  const start = statement.range[0]
  let valueRange = statement.value?.range ?? null
  if (options.trimValueEdges && valueRange !== null) {
    let [from, to] = valueRange
    while (from < to && source.text[from].trim() === "") from++
    while (to > from && source.text[to - 1].trim() === "") to--
    const trivia = findTriviaBetween(source, ...valueRange)
    let hasText = false
    for (let offset = from; offset < to; offset++) {
      const item = trivia.find(
        (entry) => entry.range[0] <= offset && offset < entry.range[1],
      )
      if (item !== undefined) offset = item.range[1] - 1
      else if (source.text[offset].trim() !== "") hasText = true
    }
    for (const item of trivia) {
      from = Math.min(from, item.range[0])
      to = Math.max(to, item.range[1])
    }
    valueRange = hasText ? [from, to] : null
  }
  if (valueRange === null) {
    /** Keeps the existing empty-block trivia and continuation layout. */
    function originalLayout(): AtomLayout {
      return layoutEmptyDescriptionBlock(
        source,
        start,
        end,
        options.formatsEmptyTrivia,
      )
    }

    return statement.closed !== false
      ? layoutCompactEmptyDescriptionBlockWithFallback(
          source,
          start,
          end,
          originalLayout,
        )
      : originalLayout()
  }
  const block = {
    range: statement.range,
    value: statement.value,
    closed: statement.closed ?? true,
    ...(options.opening === undefined ? {} : { opening: options.opening }),
  }
  const closing = findAccDescrBlockClosing(source, block)
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, valueTypes).map((value) =>
        value === statement.value ? { ...value, range: valueRange } : value,
      ),
      findAccDescrBlockStretches(
        source,
        block,
        valueRange,
        options.keepsTrailingTrivia,
      ),
    ),
    rules: new Map(),
    outdented: closing === null ? new Set() : new Set([closing]),
    lineBreaks: "kept",
  }
}

/** Fails when a token that the tree implies is missing. */
export function expectToken(token: Token | undefined, what: string): Token {
  if (token === undefined) {
    throw new Error(`prettier-plugin-mmd: no token for ${what}`)
  }
  return token
}

/** Fails when a token is not the one that the tree implies. */
export function expectValue(token: Token, value: string): void {
  if (token.value !== value) {
    throw new Error(
      `prettier-plugin-mmd: expected the token ${JSON.stringify(value)}, found ${JSON.stringify(token.value)} at offset ${token.range[0]}`,
    )
  }
}

/**
 * An `accDescr { ... }` block statement, of any diagram type: its text, and
 * whether a `}` closes it.
 */
export interface AccDescrBlock {
  readonly range: Range
  readonly value: Node | null
  readonly closed: boolean
  /** Explicit opener when authored structural forms precede it. */
  readonly opening?: number
}

/**
 * The stretch of an `accDescr { ... }` block that is printed exactly as
 * written: from the `{` to the end of its text and of the comments and
 * directives after the text, when the text starts on a later line than the
 * `{`. Its lines keep their columns (docs/flowchart.md, Multi-line values),
 * the first one included, and comment lines among them stay where they
 * are. The whitespace after the `{` is read with the `{`, so the text on
 * the line of the `{` is spaced as any other token. `valueRange` supplies the
 * printed bounds when a Literal's AST range includes exterior whitespace.
 * `keepsTrailingTrivia` also keeps trivia lines after an opener-line value,
 * without absorbing the closing brace (docs/c4.md, Description blocks).
 */
export function findAccDescrBlockStretches(
  source: Source,
  statement: AccDescrBlock,
  valueRange: Range | null = statement.value?.range ?? null,
  keepsTrailingTrivia = false,
): Atom[] {
  const brace = expectToken(
    statement.opening === undefined
      ? findStructuralToken(
          source,
          expectToken(
            findTokenStartingAt(source, statement.range[0]),
            "`accDescr`",
          ).range[1],
        )
      : findTokenStartingAt(source, statement.opening),
    "the `{` of an accDescr block",
  )
  expectValue(brace, "{")
  if (valueRange === null) return []
  const lastTrivia = findTriviaBetween(
    source,
    valueRange[1],
    statement.range[1],
  ).at(-1)
  const startsLater = source.text
    .slice(brace.range[1], valueRange[0])
    .includes("\n")
  if (!startsLater && (!keepsTrailingTrivia || lastTrivia === undefined))
    return []
  return [
    {
      start: startsLater ? brace.range[0] : valueRange[0],
      end: Math.max(valueRange[1], lastTrivia?.range[1] ?? 0),
    },
  ]
}

/**
 * The start of the `}` that closes an `accDescr` block, whose line starts
 * at the statement's indentation, or null when the block is not closed. The
 * lines of its text are kept as written (see `findAccDescrBlockStretches`),
 * and the whitespace before the `}` is neither in the text nor in the Db,
 * so the `}` lines up with the `accDescr` that it closes.
 */
export function findAccDescrBlockClosing(
  source: Source,
  statement: AccDescrBlock,
): number | null {
  if (!statement.closed) return null
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `}` of an accDescr block",
  )
  expectValue(closing, "}")
  return closing.range[0]
}

/**
 * The text with its ASCII letters in lower case. The lexer compares
 * keywords case-insensitively (common.md, Notation), and with an ASCII word
 * only the ASCII letters of either case match: a character outside ASCII
 * whose uppercase would be an ASCII letter keeps itself.
 */
export function toAsciiLowerCase(text: string): string {
  return [...text]
    .map((character) =>
      character >= "A" && character <= "Z"
        ? character.toLowerCase()
        : character,
    )
    .join("")
}

/**
 * Whole crossing values and CSS declarations stay inside a textual prefix.
 * Its range includes source indentation; later lines add none before it
 * (docs/radar.md, Multi-line statements and Semicolons). Callers can exclude
 * required grammatical terminators, which are separate atoms rather than
 * protected text (docs/railroad.md, Semicolons).
 */
export function protectSemicolonPrefixes(
  source: Source,
  start: number,
  end: number,
  atoms: readonly Atom[],
  structuralSemicolons: ReadonlySet<number> = new Set(),
): Atom[] {
  const kept: Atom[] = []
  for (let position = start; position < end;) {
    const stop = semicolonSegmentEnd(source, position)
    let semicolon = source.text.lastIndexOf(";", stop - 1)
    while (semicolon >= position && structuralSemicolons.has(semicolon))
      semicolon =
        semicolon === 0 ? -1 : source.text.lastIndexOf(";", semicolon - 1)
    if (semicolon < position) {
      position = stop + 1
      continue
    }
    let from = position
    let through = Math.min(end, semicolon + 1)
    for (const atom of atoms) {
      if (atom.start < through && from < atom.end) {
        from = Math.min(from, atom.start)
        through = Math.max(through, atom.end)
      }
    }
    for (const item of findTriviaBetween(source, position, through))
      through = Math.min(end, Math.max(through, item.range[1]))
    const previous = kept.at(-1)
    if (previous !== undefined && from <= previous.end)
      kept[kept.length - 1] = {
        start: previous.start,
        end: through,
        writtenIndentation: "",
      }
    else kept.push({ start: from, end: through, writtenIndentation: "" })
    position = through
  }
  return [
    ...kept,
    ...atoms.filter(
      (atom) =>
        !kept.some(
          (stretch) => stretch.start <= atom.start && atom.end <= stretch.end,
        ),
    ),
  ].sort((a, b) => a.start - b.start)
}
