import { appendItems } from "./collections.ts"
import type {
  Node,
  Range,
  TreemapBodyItem,
  TreemapClassDefStatement,
  TreemapDiagram,
  TreemapLeaf,
  TreemapSection,
} from "@mmd-toolkit/ast"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { readGapElement } from "./gap.ts"
import type { LeadingDirectives } from "./indentation-lines.ts"
import { findLeadingDirectives } from "./indentation-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  findLayoutEnd,
  protectSemicolonPrefixes,
} from "./layout.ts"
import {
  endingSemicolonOf,
  isDroppedSemicolon,
  lineEndOf,
  lineStartOf,
} from "./kept-lines.ts"
import { printAsWrittenTrimmed } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findTokenStartingAt,
  findTriviaBetween,
  isWhitespace,
  textRead,
} from "./source.ts"
import { normalizeStyleList } from "./statement-rules.ts"

/** Authored leaves preserve names, numeric spelling, selectors and styles. */
export const treemapValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "TreemapLiteral",
])

/** A statement, or the inseparable empty class definition and following row. */
export interface TreemapLine {
  readonly range: Range
  readonly statements: readonly TreemapBodyItem[]
  readonly depth: number
  readonly leading: LeadingDirectives | null
}

/**
 * The depth at which a line is printed. A title or an accessibility statement
 * is printed at the start of its line, unless it was written indented: the
 * first version with the diagram rejects such a statement when it is
 * indented, and accepts it at the start of its line and after the header on
 * the line of the header (`treemaptitle T`), so the printer does not indent
 * what was not written indented (docs/treemap.md, Title; docs/compatibility.md,
 * Forms kept for versions of mermaid.js that count). Every other line is
 * printed at its own depth.
 */
export function treemapPrintedDepth(source: Source, line: TreemapLine): number {
  const statement = line.statements[0]
  if (
    statement.type !== "TreemapTitleStatement" &&
    statement.type !== "TreemapAccTitleStatement" &&
    statement.type !== "TreemapAccDescrStatement" &&
    statement.type !== "TreemapAccDescrBlockStatement"
  ) {
    return line.depth
  }
  // mermaid.js removes the directives before the statement first, so a line
  // that starts with directives is indented only by the whitespace around them.
  const before = textRead(
    source,
    lineStartOf(source, statement.range[0]),
    statement.range[0],
  )
  const writtenIndented = before !== "" && [...before].every(isWhitespace)
  return writtenIndented ? line.depth : 0
}

/** Own row syntax in source order, always including the required name. */
function treemapRowParts(row: TreemapSection | TreemapLeaf): readonly Node[] {
  return [
    row.name,
    ...(row.type === "TreemapLeaf" ? [row.value] : []),
    ...(row.classSelector === null ? [] : [row.classSelector]),
  ]
}

/** The row's own components exclude its leading statements and descendants. */
export function treemapStatementRange(item: TreemapBodyItem): Range {
  if (item.type !== "TreemapSection" && item.type !== "TreemapLeaf")
    return item.range
  const parts = treemapRowParts(item)
  return [parts[0].range[0], parts.at(-1)!.range[1]]
}

/**
 * An empty class name touching a row must stay touching: whitespace would
 * consume the row as its style (diagrams/treemap.md, Class definitions;
 * docs/treemap.md, Statements one per line). No semicolon is synthesized.
 */
function touchesEmptyClass(
  source: Source,
  item: TreemapBodyItem,
  next: TreemapBodyItem | undefined,
): boolean {
  if (
    item.type !== "TreemapClassDefStatement" ||
    item.style !== null ||
    item.range[1] !== item.name.range[1] ||
    (next?.type !== "TreemapSection" && next?.type !== "TreemapLeaf")
  )
    return false
  return textRead(source, item.range[1], treemapStatementRange(next)[0]) === ""
}

/**
 * Groups only required contact and retains leading directives in a row's
 * indentation unit. Other gap whitespace is moved once to its planned column
 * (docs/treemap.md, Carried indentation and Directives).
 */
export function treemapLines(
  source: Source,
  diagram: TreemapDiagram,
  headerEnd: number,
): TreemapLine[] {
  const items: TreemapBodyItem[] = []
  const depths = new Map<TreemapBodyItem, number>()
  visit(diagram.body, 0)
  const zeroRoots = items.some((item, index) =>
    touchesEmptyClass(source, item, items[index + 1]),
  )
  const lines: TreemapLine[] = []
  let previousEnd = headerEnd
  for (let index = 0; index < items.length; index++) {
    const item = items[index]
    const next = items[index + 1]
    const statements = touchesEmptyClass(source, item, next)
      ? [item, next]
      : [item]
    if (statements.length === 2) index++
    const start = treemapStatementRange(item)[0]
    let from = start
    // Only a same-unit suffix of spaces/tabs and directives can lead a row.
    // A physical newline outside a directive ends that suffix; trailing runs
    // on earlier lines instead belong to the gap relocation below.
    for (;;) {
      while (
        from > previousEnd &&
        (source.text[from - 1] === " " || source.text[from - 1] === "\t")
      )
        from--
      const boundary = from
      const directive = source.trivia.findLast(
        (trivia) => trivia.type === "Directive" && trivia.range[1] === boundary,
      )
      if (directive === undefined || directive.range[0] < previousEnd) break
      from = directive.range[0]
    }
    const atLineStart =
      source.text.slice(lineStartOf(source, from), from).trim() === "" &&
      from > previousEnd
    const leading =
      atLineStart && findTriviaBetween(source, from, start).length > 0
        ? findLeadingDirectives(source, from, start)
        : null
    lines.push({
      range: [
        leading?.directives[0]?.[0] ?? start,
        treemapStatementRange(statements.at(-1)!)[1],
      ],
      statements,
      depth: depths.has(item) ? depths.get(item)! + (zeroRoots ? 0 : 1) : 1,
      leading,
    })
    previousEnd = treemapStatementRange(statements.at(-1)!)[1]
  }
  return lines

  /** Named gaps keep source order and body depth regardless of their owner. */
  function visit(body: readonly TreemapBodyItem[], depth: number): void {
    for (const item of body) {
      if (item.type === "TreemapSection" || item.type === "TreemapLeaf") {
        appendItems(items, item.statementsBefore)
        items.push(item)
        depths.set(item, depth)
        if (item.type === "TreemapSection") visit(item.children, depth + 1)
      } else items.push(item)
    }
  }
}

/**
 * The style of a `classDef` together with what follows it, printed without the
 * `;` that ends the statement and without the whitespace around that `;`,
 * where the printer drops that `;` (see `isDroppedSemicolon`); none where it
 * keeps it. The `;` is a unit at the end of the statement, or one that the
 * line rule ignores: right after the statement, or inside its style, which then
 * holds the whitespace that follows the `;`.
 */
function findDroppedSemicolonStretches(
  source: Source,
  statement: TreemapBodyItem,
): Atom[] {
  if (statement.type !== "TreemapClassDefStatement" || statement.style === null)
    return []
  const [start] = statement.style.range
  const end = statement.range[1]
  const semicolon = endingSemicolonOf(source, statement.range, statement.style)
  if (semicolon === undefined || !isDroppedSemicolon(source, semicolon))
    return []
  // The style is printed as in a statement without that `;` (see
  // `normalizeTreemapStyle`), so that a second formatting finds the same text.
  let styleEnd = semicolon
  while (styleEnd > start && isWhitespace(source.text[styleEnd - 1])) styleEnd--
  const style: Atom[] = [{ start, end: styleEnd }]
  normalizeTreemapStyle(source, style, statement, styleEnd)
  return [
    {
      start,
      end,
      doc: style[0].doc ?? printAsWrittenTrimmed(source, start, semicolon),
    },
  ]
}

/**
 * Only a trailing comment keeps whitespace before its mark. Standalone
 * comments lose their leading run, while directive interiors are not gaps
 * (diagrams/treemap.md, Comments and authored boundaries;
 * docs/treemap.md, Component newlines).
 */
function hasTrailingIndentation(
  source: Source,
  start: number,
  end: number,
): boolean {
  let hasWhitespace = false
  for (let offset = start; offset < end;) {
    const { element, end: next } = readGapElement(source, offset)
    if (element.kind === "lineTerminator") return false
    if (element.kind === "item" && element.item.type === "Comment")
      return hasWhitespace
    if (
      element.kind === "whitespace" &&
      (source.text[offset] === " " || source.text[offset] === "\t")
    )
      hasWhitespace = true
    offset = next
  }
  return false
}

/**
 * Where a line of the body is printed to: its range, except for a title, which
 * leaves out the whitespace at its end. That whitespace is then the gap before
 * a directive or a comment that follows the title on its line, which a gap rule
 * prints as one space, as in the other diagram types.
 */
export function findTreemapPrintedEnd(
  source: Source,
  line: TreemapLine,
): number {
  const last = line.statements.at(-1)!
  if (
    last.type !== "TreemapTitleStatement" &&
    last.type !== "TreemapAccTitleStatement" &&
    last.type !== "TreemapAccDescrStatement"
  )
    return line.range[1]
  return Math.min(
    line.range[1],
    findLayoutEnd(layoutTreemapStatement(source, last, "", "")),
  )
}

/** Ordinary row components join; trivia and protected segments keep their lines. */
export function layoutTreemapStatement(
  source: Source,
  statement: TreemapBodyItem,
  column: string,
  continuationPadding: string,
): AtomLayout {
  const [start, end] = treemapStatementRange(statement)
  let layout: AtomLayout
  switch (statement.type) {
    case "TreemapTitleStatement":
    case "TreemapAccTitleStatement":
    case "TreemapAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "TreemapTitleStatement",
      )
      break
    case "TreemapAccDescrBlockStatement":
      layout = layoutCommonDescription(source, statement, treemapValueNodeTypes)
      break
    case "TreemapSection":
    case "TreemapLeaf":
    case "TreemapClassDefStatement": {
      const dropped = findDroppedSemicolonStretches(source, statement)
      const atoms = collectAtoms(
        source,
        start,
        end,
        statement.type === "TreemapClassDefStatement"
          ? collectValueNodes(statement, treemapValueNodeTypes).filter(
              (value) => value !== statement.style || dropped.length === 0,
            )
          : treemapRowParts(statement).flatMap((part) =>
              treemapValueNodeTypes.has(part.type)
                ? [part]
                : collectValueNodes(part, treemapValueNodeTypes),
            ),
        dropped,
      )
      const rules = new Map<number, GapRule>()
      const joinedBefore = new Set<number>()
      for (const [index, atom] of atoms.entries()) {
        const previous = atoms[index - 1]
        if (previous === undefined) continue
        const token = findTokenStartingAt(source, atom.start)
        const before = findTokenStartingAt(source, previous.start)
        const space =
          statement.type === "TreemapClassDefStatement"
            ? token?.value !== ";"
            : before?.value === ":" || before?.value === ","
        rules.set(atom.start, space ? "space" : "none")
        if (findTriviaBetween(source, previous.end, atom.start).length === 0)
          joinedBefore.add(atom.start)
      }
      layout = {
        atoms: atoms.map((atom, index) => {
          const previous = atoms[index - 1]
          // One indentation unit may already precede a native comment in
          // this gap. A second run before the separator/number rejects
          // (diagrams/treemap.md, Headers and indentation;
          // docs/treemap.md, Component newlines).
          const hasEarlierIndentation =
            previous !== undefined &&
            hasTrailingIndentation(source, previous.end, atom.start)
          // The class-style separator consumes indentation, unlike row
          // selectors and native-comment row gaps (docs/treemap.md, Style gaps).
          const styleContinuation =
            statement.type === "TreemapClassDefStatement" &&
            statement.style?.range[0] === atom.start &&
            !hasEarlierIndentation
          let writtenIndentation = column
          if (
            hasEarlierIndentation ||
            findTokenStartingAt(source, atom.start)?.value === ":::" ||
            (statement.type !== "TreemapClassDefStatement" &&
              statement.classSelector?.range[0] === atom.start)
          )
            writtenIndentation = ""
          else if (styleContinuation) writtenIndentation += continuationPadding
          if (styleContinuation)
            return {
              ...atom,
              statementPadding: continuationPadding,
              writtenIndentation,
            }
          return { ...atom, writtenIndentation }
        }),
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
        joinedBefore,
      }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown treemap item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  const atoms = protectSemicolonPrefixes(
    source,
    start,
    end,
    layout.atoms.map((atom) =>
      layout.outdented.has(atom.start)
        ? { ...atom, writtenIndentation: column }
        : atom,
    ),
  )
  // mermaid.js splits the style at the commas that no backslash escapes, and
  // takes the whitespace around the name and the value of each style away
  // before it draws, so the styles are printed as in the other diagram types
  // (docs/treemap.md, Styles; docs/compatibility.md, Styles that are drawn the
  // same).
  if (statement.type === "TreemapClassDefStatement")
    normalizeTreemapStyle(source, atoms, statement)
  return { ...layout, atoms }
}

/**
 * Prints the style of a `classDef` in the atoms as the styles of the other
 * diagram types are printed: the whitespace around the first `:` and the `,` of
 * each style, between the words of a style, and at the end of the style are
 * set. mermaid.js splits the style at the commas that no backslash escapes, and
 * takes the whitespace around the name and the value of each style away before
 * it draws (docs/treemap.md, Styles; docs/compatibility.md, Styles that are
 * drawn the same). An empty style between two commas, or after the last one,
 * stays as written (see `normalizeStyleList`), and so does a style that holds a
 * `;`, or that has a comment or a directive on its line: they may take part in
 * the line rule, and a second formatting must find the same. `styleEnd` is
 * where the style ends when a `;` that the printer drops ends it (see
 * `findDroppedSemicolonStretches`), so that the whitespace before that `;` and
 * what is dropped with it decide nothing.
 */
function normalizeTreemapStyle(
  source: Source,
  atoms: Atom[],
  statement: TreemapClassDefStatement,
  styleEnd = statement.style?.range[1],
): void {
  const { style } = statement
  if (style === null || styleEnd === undefined) return
  const range: Range = [style.range[0], styleEnd]
  if (
    source.text.slice(...range).includes(";") ||
    findTriviaBetween(source, range[0], lineEndOf(source, range[0])).length > 0
  )
    return
  normalizeStyleList(
    source,
    atoms,
    { range: [statement.range[0], styleEnd], styles: [{ ...style, range }] },
    { escapesComma: true, collapsesWordGaps: true, trimsEnd: true },
  )
}
