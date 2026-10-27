import type {
  Node,
  Range,
  TreemapBodyItem,
  TreemapDiagram,
  TreemapLeaf,
  TreemapSection,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { readGapElement } from "./gap.ts"
import type { LeadingDirectives } from "./indentation-lines.ts"
import { findLeadingDirectives } from "./indentation-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  protectSemicolonPrefixes,
} from "./layout.ts"
import { lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTokenStartingAt, findTriviaBetween } from "./source.ts"

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
  let position = item.range[1]
  const nextStart = treemapStatementRange(next)[0]
  for (const trivia of findTriviaBetween(source, position, nextStart)) {
    if (trivia.type !== "Directive" || trivia.range[0] !== position)
      return false
    position = trivia.range[1]
  }
  return position === nextStart
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
        items.push(...item.statementsBefore, item)
        depths.set(item, depth)
        if (item.type === "TreemapSection") visit(item.children, depth + 1)
      } else items.push(item)
    }
  }
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

/** Ordinary row components join; trivia and protected segments keep their lines. */
export function layoutTreemapStatement(
  source: Source,
  statement: TreemapBodyItem,
  column: string,
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
      const atoms = collectAtoms(
        source,
        start,
        end,
        statement.type === "TreemapClassDefStatement"
          ? collectValueNodes(statement, treemapValueNodeTypes)
          : treemapRowParts(statement).flatMap((part) =>
              treemapValueNodeTypes.has(part.type)
                ? [part]
                : collectValueNodes(part, treemapValueNodeTypes),
            ),
        [],
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
          return {
            ...atom,
            writtenIndentation:
              hasEarlierIndentation ||
              findTokenStartingAt(source, atom.start)?.value === ":::" ||
              (statement.type !== "TreemapClassDefStatement" &&
                statement.classSelector?.range[0] === atom.start)
                ? ""
                : column,
          }
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
  return {
    ...layout,
    atoms: protectSemicolonPrefixes(
      source,
      start,
      end,
      layout.atoms.map((atom) =>
        layout.outdented.has(atom.start)
          ? { ...atom, writtenIndentation: column }
          : atom,
      ),
    ),
  }
}
