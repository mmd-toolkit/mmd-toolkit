import type { Node, Range, Token } from "@mmd-toolkit/ast"
import { traverseNodes, visitorKeys } from "@mmd-toolkit/parser"
import type { Doc } from "prettier"
import type { Atom, AtomLayout } from "./atoms.ts"
import { readGapElement } from "./gap.ts"
import { printAsWritten } from "./lines.ts"
import {
  findLinesEndedBySemicolon,
  findSemicolonLines,
  findVerbatimStyleLines,
  isDroppedSemicolon,
  isInsideStyleRuleStretch,
  joiningChangesIgnoredSemicolon,
  lineEndOf,
  lineStartOf,
  semicolonSegmentEnd,
  usesVerbatimStyleLines,
} from "./kept-lines.ts"
import { appendItems } from "./collections.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokenStartingAt,
  findTokensBetween,
  findTriviaAt,
  findTriviaBetween,
  isBracketPadding,
  isSpaceOrTab,
  isStructural,
  isWhitespace,
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

/** The children of a node, in the order of its visitor keys. */
export function childrenOf(node: Node): Node[] {
  return visitorKeys[node.type].flatMap((key) => {
    const value = (node as unknown as Record<string, unknown>)[key]
    return (Array.isArray(value) ? value : [value]).filter(
      (child) => child !== null && child !== undefined,
    ) as Node[]
  })
}

/**
 * Calls `visit` for every node below `node`, not for `node` itself, in the
 * order of the parser's `visitorKeys`. Value nodes have no child fields.
 */
export function walk(node: Node, visit: (node: Node) => void): void {
  traverseNodes(node, {
    enterNode(child, parent) {
      if (parent !== null) visit(child)
    },
    leaveNode() {
      // The caller visits descendants on the way down only.
    },
  })
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
  covered.sort((a, b) => a.start - b.start)
  let nextCovered = 0
  let coveredEnd = -Infinity
  // Tokens and covered ranges advance in source order, so each value or kept
  // stretch is visited once instead of being tested against every token.
  for (const token of findTokensBetween(source, start, end)) {
    while (
      nextCovered < covered.length &&
      covered[nextCovered].start < token.range[1]
    ) {
      coveredEnd = Math.max(coveredEnd, covered[nextCovered].end)
      nextCovered++
    }
    if (
      isStructural(source, token) &&
      // A common literal can own exterior padding beyond its printed range.
      // Such a token already contributes its printed part through the value.
      token.range[0] >= coveredEnd
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
 * joining its lines could change which `;` the line rule ignores
 * (`joiningChangesIgnoredSemicolon`), or its last line is one that a `;`
 * decides the end of (see `findLinesEndedBySemicolon`). Where the lexer reads
 * the line breaks inside a statement as whitespace, a printer joins the lines
 * of the statement; a comment would then take the rest of the line, and a `;`
 * could come to a line that matches the line rule (common.md, `style` and
 * `classDef` lines) while it did not on its own line, so the rule would ignore
 * it and the text would change: `classDef`, a line break, and `c fill:#f00;`
 * has the entity `#f00;` in its style, and `classDef c fill:#f00;` has the
 * style `fill:#f00`. The same holds when the `;` is in another statement on
 * the last line of the statement: the joined line takes the text before the
 * `;` from the first line, and the rule reads the text of the whole line.
 * `"style:#q" - satisfies`, a line break, and `-> "b" e - satisfies -> f;g`
 * has the target `f;g`, and the joined line has the target `fg`. Such a
 * statement is kept as written (docs/sequence.md and docs/class.md,
 * Multi-line statements). A statement with a `;` whose lines can be joined
 * without that change is joined as any other. This is the one decision about
 * joining lines that every layout takes. A caller that keeps line breaks
 * between its structural tokens can ignore trivia in this check; the
 * protections of the line rule still apply.
 */
export function spansLinesThatCannotJoin(
  source: Source,
  start: number,
  end: number,
  options: { readonly ignoresTrivia?: boolean } = {},
): boolean {
  const text = source.text.slice(start, end)
  if (!text.includes("\n")) return false
  if (
    !options.ignoresTrivia &&
    findTriviaBetween(source, start, end).length > 0
  ) {
    return true
  }
  return (
    findLinesEndedBySemicolon(source).has(lineStartOf(source, end - 1)) ||
    joiningChangesIgnoredSemicolon(source, start, end)
  )
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
 * The physical line that completes a block header aligns with its statement,
 * so the body remains one level deeper. A value spanning that line stays whole
 * (docs/state.md, Composite states; docs/requirement.md, Bodies).
 */
export function alignBlockOpeningLine(
  source: Source,
  layout: AtomLayout,
  opening: number,
): AtomLayout {
  const start = lineStartOf(source, opening)
  if (layout.atoms.some((atom) => atom.start < start && start < atom.end))
    return layout
  const first = layout.atoms.find(
    (atom) => start <= atom.start && atom.start <= opening,
  )
  return first === undefined
    ? layout
    : { ...layout, outdented: new Set([...layout.outdented, first.start]) }
}

/**
 * Some grammars require a non-LF whitespace run to start before a retained LF.
 * Keep each first gap-line tail, including complete trivia, while later lines
 * use ordinary continuation columns (diagrams/requirement.md, Whitespace;
 * docs/xychart.md, Multi-line statements). `keepsBreak` says, for the gap from
 * `from` to `to`, whether its line break stays: a layout that joins the other
 * line breaks leaves the atoms before them whole.
 */
export function keepFirstGapLineTails(
  source: Source,
  atoms: readonly Atom[],
  keepsBreak: (from: number, to: number) => boolean = () => true,
): Atom[] {
  return atoms.map((atom, index) => {
    const next = atoms[index + 1]
    if (next === undefined) return atom
    for (let end = atom.end; end < next.start;) {
      const part = readGapElement(source, end)
      if (part.element.kind === "lineTerminator") {
        return keepsBreak(atom.end, next.start) ? { ...atom, end } : atom
      }
      end = part.end
    }
    return atom
  })
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
  opening?: number,
): AtomLayout {
  if (!formatsTriviaLines && spansLinesThatCannotJoin(source, start, end)) {
    return spaceDescriptionOpening(
      source,
      start,
      keptAsWritten(start, end),
      opening,
    )
  }
  return {
    atoms: collectAtoms(source, start, end, [], []).filter(
      (atom) => source.text.slice(atom.start, atom.end).trim() !== "",
    ),
    rules: descriptionOpeningRules(source, start, opening),
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
  opening?: number,
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
  const layout = layoutEmptyDescriptionBlock(source, start, end, false, opening)
  return {
    ...layout,
    rules: new Map([...layout.rules, [closing.range[0], "none"]]),
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
  opening?: number,
): AtomLayout {
  return (
    layoutCompactEmptyDescriptionBlock(source, start, end, opening) ??
    originalLayout()
  )
}

/**
 * The layout of an `accDescr { ... }` statement: its text stands one level
 * inside the statement and its `}` stands at the statement's level (the
 * rules document of the diagram type, Accessibility statements). Callers set
 * `preservesBodyColumns` where raw text also controls membership or box reading.
 * A closed block
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
    /** Raw block text participates in membership or physical column rules. */
    readonly preservesBodyColumns?: boolean
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
  const block = {
    range: statement.range,
    value: statement.value,
    closed: statement.closed ?? true,
    ...(options.opening === undefined ? {} : { opening: options.opening }),
  }
  let layout: AtomLayout
  if (valueRange === null) {
    /** Keeps the existing empty-block trivia and continuation layout. */
    function originalLayout(): AtomLayout {
      return layoutEmptyDescriptionBlock(
        source,
        start,
        end,
        options.formatsEmptyTrivia,
        options.opening,
      )
    }

    layout =
      statement.closed !== false
        ? layoutCompactEmptyDescriptionBlockWithFallback(
            source,
            start,
            end,
            originalLayout,
            options.opening,
          )
        : originalLayout()
  } else {
    const closing = findAccDescrBlockClosing(source, block)
    layout = {
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
      rules: descriptionOpeningRules(source, start, options.opening),
      outdented: closing === null ? new Set() : new Set([closing]),
      lineBreaks: "kept",
    }
  }
  return formatDescriptionBlock(
    source,
    block,
    layout,
    options.preservesBodyColumns,
  )
}

/**
 * Separate the description keyword from its brace in ordinary whitespace;
 * interior contacts remain authored (docs/info.md, Description blocks).
 */
export function descriptionOpeningRules(
  source: Source,
  start: number,
  opening?: number,
): Map<number, "space"> {
  const keyword = expectToken(
    findTokenStartingAt(source, start),
    "the description keyword",
  )
  const brace = expectToken(
    findDescriptionOpening(source, keyword, opening),
    "the description opener",
  )
  expectValue(brace, "{")
  return new Map([[brace.range[0], "space"]])
}

/**
 * Expose only a plain same-line keyword/brace gap inside a retained header.
 * The rest of its atom stays whole, including empty-body trivia. Protected
 * line readings take precedence (docs/c4.md, Empty description blocks).
 */
export function spaceDescriptionOpening(
  source: Source,
  start: number,
  layout: AtomLayout,
  opening?: number,
): AtomLayout {
  const keyword = expectToken(findTokenStartingAt(source, start), "accDescr")
  const brace = expectToken(
    findDescriptionOpening(source, keyword, opening),
    "the description opener",
  )
  if (
    brace.value !== "{" ||
    ![...source.text.slice(keyword.range[1], brace.range[0])].every(
      (character) => character === " " || character === "\t",
    )
  )
    return layout
  const atoms: Atom[] = []
  for (const atom of layout.atoms) {
    if (
      atom.doc !== undefined ||
      atom.start > keyword.range[0] ||
      atom.end < brace.range[1] ||
      spansLinesThatCannotJoin(source, atom.start, atom.end, {
        ignoresTrivia: true,
      })
    ) {
      atoms.push(atom)
      continue
    }
    atoms.push(
      { ...atom, end: keyword.range[1] },
      { ...atom, start: brace.range[0] },
    )
  }
  return {
    ...layout,
    atoms,
    rules: new Map([...layout.rules, [brace.range[0], "space"]]),
  }
}

/** The authored opener, or the next structural token after the keyword. */
function findDescriptionOpening(
  source: Source,
  keyword: Token,
  opening?: number,
): Token | undefined {
  return opening === undefined
    ? findStructuralToken(source, keyword.range[1])
    : findTokenStartingAt(source, opening)
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

/** Whether a character ends a line: LF, CR, U+2028, or U+2029. */
function isLineBreak(character: string): boolean {
  return ["\n", "\r", "\u2028", "\u2029"].includes(character)
}

/**
 * Pad the text of an `accDescr { ... }` block on one line with one space
 * inside each brace, `{ a b }`: mermaid.js trims the text, so the whitespace
 * at its ends carries no meaning, as in the data blocks of
 * docs/flowchart.md, Data blocks. The block is padded only if it is closed
 * and the layout holds its text as one atom between the braces, with
 * nothing but whitespace on one line around it: a comment or a directive in
 * the block (a `%%{` in the text, whose `}` would be read as the closing
 * brace), a line break, a line that keeps its `;` (see
 * `findLinesWithOwnSemicolons`: the line rule of mermaid.js reads its whole
 * text), or a layout that holds the text
 * in a longer stretch (a kept line, a hidden form) leaves it as it is.
 */
function padOneLineDescription(
  source: Source,
  block: AccDescrBlock,
  layout: AtomLayout,
): AtomLayout {
  const closing = findAccDescrBlockClosing(source, block)
  if (closing === null || closing !== block.range[1] - 1) return layout
  const keyword = expectToken(
    findTokenStartingAt(source, block.range[0]),
    "the description keyword",
  )
  const opening = expectToken(
    findDescriptionOpening(source, keyword, block.opening),
    "the description opener",
  )
  const inside = layout.atoms.filter(
    (atom) => atom.start >= opening.range[1] && atom.end <= closing,
  )
  if (
    inside.length !== 1 ||
    !layout.atoms.some((atom) => atom.end === opening.range[1]) ||
    !layout.atoms.some((atom) => atom.start === closing)
  )
    return layout
  const [text] = inside
  const between = source.text.slice(opening.range[1], closing)
  if (
    text.doc !== undefined ||
    [...between].some(isLineBreak) ||
    between.includes("%%{") ||
    findSemicolonLines(source).has(lineStartOf(source, closing)) ||
    findTriviaBetween(source, opening.range[1], closing).length > 0
  )
    return layout
  return {
    ...layout,
    rules: new Map([
      ...layout.rules,
      [text.start, "space"],
      [closing, "space"],
    ]),
  }
}

/**
 * Format the text of an `accDescr { ... }` block: align its lines (see
 * `indentDescriptionLines`) and pad its text on one line (see
 * `padOneLineDescription`). Callers whose Db also stores the raw description
 * as a member keep the original body columns instead
 * (`preservesBodyColumns`; docs/flowchart.md, Multi-line values), and pad the
 * text on one line all the same: there are no columns to keep in it.
 */
export function formatDescriptionBlock(
  source: Source,
  block: AccDescrBlock,
  layout: AtomLayout,
  preservesBodyColumns = false,
): AtomLayout {
  return padOneLineDescription(
    source,
    block,
    dropOpeningLineWhitespace(
      source,
      block,
      preservesBodyColumns
        ? layout
        : indentDescriptionLines(source, block, layout),
    ),
  )
}

/**
 * Sets the whitespace on the line of the `{` of an `accDescr` block whose text
 * starts on a later line. The whitespace at the end of the line is left out,
 * after the `{` or after a directive that follows it: mermaid.js reads the
 * whitespace after the `{`, line feeds included, with the `{`, so the text
 * starts after it and the Db is the same. The whitespace before a comment or a
 * directive on the line is one space where it is a run or a tab, as a gap
 * before a directive at the end of a printed line is (docs/compatibility.md,
 * Description block indentation and Directives between tokens). The whitespace
 * after a comment is part of the comment and stays, as does a removed line
 * feed.
 */
function dropOpeningLineWhitespace(
  source: Source,
  block: AccDescrBlock,
  layout: AtomLayout,
): AtomLayout {
  const keyword = expectToken(
    findTokenStartingAt(source, block.range[0]),
    "the description keyword",
  )
  const opening = expectToken(
    findDescriptionOpening(source, keyword, block.opening),
    "the description opener",
  )
  const edits: TextEdit[] = []
  let lineEnd = opening.range[1]
  let itemEnd = opening.range[1]
  for (;;) {
    const runStart = lineEnd
    while (isSpaceOrTab(source.text[lineEnd])) lineEnd++
    const item = findTriviaAt(source, lineEnd)
    if (item === undefined) break
    if (lineEnd > runStart && source.text.slice(runStart, lineEnd) !== " ")
      edits.push({ range: [runStart, lineEnd], replacement: " " })
    lineEnd = itemEnd = item.range[1]
  }
  let dropFrom = lineEnd
  while (dropFrom > itemEnd && isSpaceOrTab(source.text[dropFrom - 1]))
    dropFrom--
  if (dropFrom < lineEnd)
    edits.push({ range: [dropFrom, lineEnd], replacement: "" })
  if (source.text[lineEnd] !== "\n" || source.removedLineFeeds.has(lineEnd))
    return layout
  const inAtoms = edits.filter((edit) =>
    layout.atoms.some(
      (atom) => atom.start <= edit.range[0] && edit.range[1] <= atom.end,
    ),
  )
  if (inAtoms.length === 0) return layout
  const atoms = [...layout.atoms]
  replaceInAtoms(source, atoms, inAtoms)
  return { ...layout, atoms }
}

/**
 * Align ordinary description text after LF without changing its contents or
 * line breaks. The Db setter drops this indentation. Directives and removed
 * line feeds keep their source, and atoms outside the body stay untouched
 * (docs/timeline.md, Multi-line values; docs/pie.md, Description blocks).
 */
export function indentDescriptionLines(
  source: Source,
  block: AccDescrBlock,
  layout: AtomLayout,
): AtomLayout {
  const keyword = expectToken(
    findTokenStartingAt(source, block.range[0]),
    "the description keyword",
  )
  const opening = expectToken(
    findDescriptionOpening(source, keyword, block.opening),
    "the description opener",
  )
  const closing = findAccDescrBlockClosing(source, block)
  const bodyEnd = closing ?? block.range[1]
  const atoms: Atom[] = []
  const keptBreaksBefore = new Set(layout.keptBreaksBefore)
  const outdented = new Set(layout.outdented)
  if (closing !== null) outdented.add(closing)
  for (const atom of layout.atoms) {
    if (atom.end <= opening.range[1] || atom.start >= bodyEnd) {
      atoms.push(atom)
      continue
    }
    // The whitespace before the `}` is neither in the text nor in the Db; a
    // diagram type that makes it a token of its own leaves it out, so that the
    // `}` is aligned the same in every pass.
    if (
      atom.doc === undefined &&
      atom.end === bodyEnd &&
      source.text.slice(atom.start, atom.end).trim() === ""
    )
      continue
    const trivia = findTriviaBetween(source, atom.start, atom.end)
    let start = atom.start
    for (
      let offset = Math.max(start, opening.range[1]);
      offset < Math.min(atom.end, bodyEnd);
      offset++
    ) {
      if (source.text[offset] !== "\n") continue
      if (
        trivia.some(
          (item) => item.range[0] <= offset && offset < item.range[1],
        ) ||
        source.removedLineFeeds.has(offset)
      )
        continue
      if (start < offset) atoms.push({ start, end: offset })
      start = offset + 1
      while (
        start < atom.end &&
        (source.text[start] === " " || source.text[start] === "\t")
      )
        start++
      if (start < atom.end && source.text[start] !== "\n")
        keptBreaksBefore.add(start)
      offset = start - 1
    }
    if (start < atom.end) atoms.push({ ...atom, start })
  }
  return { ...layout, atoms, keptBreaksBefore, outdented }
}

/**
 * The retained stretch of an `accDescr { ... }` block: from the `{` to the
 * end of its text and following trivia when text starts on a later line.
 * Initially retain the complete interior, including margins and comment lines.
 * `indentDescriptionLines` then aligns safe lines; container descriptions keep
 * the raw columns that also supply membership (docs/flowchart.md, Multi-line
 * values). The whitespace after `{` is read with `{`, so text on
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
      ? findDescriptionOpening(
          source,
          expectToken(
            findTokenStartingAt(source, statement.range[0]),
            "`accDescr`",
          ),
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
 * text range keeps its written limits (see `findAccDescrBlockStretches`),
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
 * Keeps as written the text of a segment with a kept `;` where formatting it
 * could change which `;` the line rule of mermaid.js ignores (common.md, The
 * `style` and `classDef` lines).
 *
 * - A statement on one line is formatted as anywhere else. The gaps and the
 *   padding inside the stretch that the rule reads, from the `:` after
 *   `style` or `classDef` to the `#` after it, keep whether they hold
 *   whitespace (see `isInsideStyleRuleStretch`), and the rest of the line may
 *   change. Text that no atom holds stays as written, as the layout left it to
 *   this function.
 * - A statement over several lines whose lines, joined, could change which
 *   `;` the rule ignores (`joiningChangesIgnoredSemicolon`), and the diagrams
 *   that keep complete word lines verbatim (railroad and wardley), keep the
 *   whole text of each segment up to its last kept `;`
 *   (`protectWholePrefixes`). Any other statement over several lines is
 *   formatted like a statement on one line.
 *
 * Callers can exclude required grammatical terminators, which are separate
 * atoms rather than protected text (docs/railroad.md, Semicolons). A kept range
 * includes source indentation; later lines add none before it (docs/radar.md,
 * Multi-line statements and Semicolons).
 */
export function protectSemicolonPrefixes(
  source: Source,
  start: number,
  end: number,
  atoms: readonly Atom[],
  structuralSemicolons: ReadonlySet<number> = new Set(),
): Atom[] {
  if (
    usesVerbatimStyleLines(source) ||
    joiningChangesIgnoredSemicolon(source, start, end)
  ) {
    return protectWholePrefixes(source, start, end, atoms, structuralSemicolons)
  }
  const kept: Atom[] = []
  for (let position = start; position < end;) {
    const stop = semicolonSegmentEnd(source, position)
    const semicolon = findLastKeptSemicolonIn(
      source,
      position,
      stop,
      structuralSemicolons,
    )
    if (semicolon < position) {
      position = stop + 1
      continue
    }
    appendItems(
      kept,
      findUncoveredText(source, position, Math.min(end, semicolon + 1), atoms),
    )
    position = stop + 1
  }
  return withKept(atoms, kept)
}

/** The offset of the last `;` of the segment that the printer keeps, or -1. */
function findLastKeptSemicolonIn(
  source: Source,
  position: number,
  stop: number,
  structuralSemicolons: ReadonlySet<number>,
): number {
  const segment = source.text.slice(position, stop)
  let index = segment.lastIndexOf(";")
  while (
    index !== -1 &&
    (structuralSemicolons.has(position + index) ||
      isDroppedSemicolon(source, position + index))
  )
    index = index === 0 ? -1 : segment.lastIndexOf(";", index - 1)
  return index === -1 ? -1 : position + index
}

/**
 * The whole text of each segment from its start through its last kept `;`,
 * with the values and comments that cross it, kept as written.
 */
function protectWholePrefixes(
  source: Source,
  start: number,
  end: number,
  atoms: readonly Atom[],
  structuralSemicolons: ReadonlySet<number>,
): Atom[] {
  const kept: Atom[] = []
  for (let position = start; position < end;) {
    const stop = semicolonSegmentEnd(source, position)
    const semicolon = findLastKeptSemicolonIn(
      source,
      position,
      stop,
      structuralSemicolons,
    )
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
  return withKept(atoms, kept)
}

/** The atoms outside a kept range, and the kept ranges, in order. */
function withKept(atoms: readonly Atom[], kept: readonly Atom[]): Atom[] {
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

/**
 * The runs of text between `start` and `end` that no atom holds, as atoms:
 * the characters that are neither whitespace nor in a comment or a directive.
 * A layout may leave such text to the protection of a `;` prefix.
 */
function findUncoveredText(
  source: Source,
  start: number,
  end: number,
  atoms: readonly Atom[],
): Atom[] {
  const trivia = findTriviaBetween(source, start, end)

  /** Whether an atom, a comment, or a directive holds the character. */
  function covered(offset: number): boolean {
    return (
      atoms.some((atom) => atom.start <= offset && offset < atom.end) ||
      trivia.some((item) => item.range[0] <= offset && offset < item.range[1])
    )
  }

  const runs: Atom[] = []
  let runStart = -1
  for (let offset = start; offset <= end; offset++) {
    const text =
      offset < end && !isWhitespace(source.text[offset]) && !covered(offset)
    if (text && runStart === -1) runStart = offset
    if (!text && runStart !== -1) {
      runs.push({ start: runStart, end: offset, writtenIndentation: "" })
      runStart = -1
    }
  }
  return runs
}

/**
 * Drops the whitespace of the text in brackets, `[ API ]` (the range holds the
 * brackets), next to the brackets: the spaces, tabs, and no-break spaces that
 * mermaid.js trims, so `[ API ]` and `["x" ]` read as `[API]` and `["x"]`
 * (docs/architecture.md, Label content). A text of only whitespace, one that
 * holds a comment or a directive, and one with no such space stay as written.
 * The whitespace is dropped wherever an atom holds it, also inside a protected
 * `;` prefix (see `protectSemicolonPrefixes` and `dropPaddings`).
 */
export function trimBracketedText(
  source: Source,
  atoms: Atom[],
  range: Range,
): void {
  let from = range[0] + 1
  let to = range[1] - 1
  while (from < to && isBracketPadding(source.text[from])) from++
  while (to > from && isBracketPadding(source.text[to - 1])) to--
  if (from === to || findTriviaBetween(source, range[0], range[1]).length > 0)
    return
  dropPaddings(source, atoms, [
    [range[0] + 1, from],
    [to, range[1] - 1],
  ])
}

/**
 * Drops the whitespace of each range in `pads` that an atom holds, by giving
 * that atom a replacement that leaves it out. A pad is the spaces, tabs, and
 * no-break spaces between a bracket and the text, which mermaid.js trims; a
 * range with anything else in it is left as written. A gap between two atoms is not
 * held by one, and is dropped by a rule of its own. Where the whitespace lies
 * between a `:` and a `#` of a line that the line rule of mermaid.js may read
 * (see `isInsideStyleRuleStretch`), one space stays: whether it is there
 * decides which `;` of the line is ignored, as for a gap in flowchart. The
 * atoms are those of `collectAtoms` and `protectSemicolonPrefixes`, which hold
 * no replacement yet.
 */
export function dropPaddings(
  source: Source,
  atoms: Atom[],
  pads: readonly Range[],
): void {
  const edits: TextEdit[] = []
  for (const pad of pads) {
    if (pad[0] >= pad[1]) continue
    // A line terminator, a comment, or a directive between the bracket and the
    // text is no padding, and stays.
    if (!Array.from(source.text.slice(pad[0], pad[1])).every(isBracketPadding))
      continue
    edits.push({
      range: pad,
      replacement: isInsideStyleRuleStretch(source, pad[0], pad[1]) ? " " : "",
    })
  }
  replaceInAtoms(source, atoms, edits)
}

/** A range of the source and the text that is printed in its place. */
export interface TextEdit {
  readonly range: Range
  readonly replacement: string
}

/**
 * Prints the replacement of each edit in place of its range, in the atom that
 * holds the range: the atom is given a replacement that leaves the rest of its
 * text as written. An edit that no atom holds whole (a gap between two atoms,
 * which a rule of its own handles), an edit in an atom that already has a
 * replacement, and one that changes nothing are left out. The atoms are those
 * of `collectAtoms` and `protectSemicolonPrefixes`.
 */
export function replaceInAtoms(
  source: Source,
  atoms: Atom[],
  edits: readonly TextEdit[],
): void {
  const byAtom = new Map<number, TextEdit[]>()
  for (const edit of edits) {
    const index = atoms.findIndex(
      (atom) => atom.start <= edit.range[0] && edit.range[1] <= atom.end,
    )
    if (index === -1 || atoms[index].doc !== undefined) continue
    if (edit.replacement === source.text.slice(...edit.range)) continue
    const list = byAtom.get(index) ?? []
    list.push(edit)
    byAtom.set(index, list)
  }
  for (const [index, list] of byAtom) {
    const atom = atoms[index]
    const parts: Doc[] = []
    let at = atom.start
    for (const edit of list.sort((a, b) => a.range[0] - b.range[0])) {
      parts.push(printAsWritten(source, at, edit.range[0]), edit.replacement)
      at = edit.range[1]
    }
    parts.push(printAsWritten(source, at, atom.end))
    atoms[index] = { ...atom, doc: parts }
  }
}
