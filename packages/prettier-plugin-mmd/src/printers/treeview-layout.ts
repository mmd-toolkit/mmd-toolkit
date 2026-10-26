import type {
  Node,
  Range,
  TreeviewBodyItem,
  TreeviewDiagram,
  TreeviewIgnoredText,
  TreeviewNode,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import type { LeadingDirectives } from "./indentation-lines.ts"
import { findLeadingDirectives } from "./indentation-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  keptAsWritten,
  protectSemicolonPrefixes,
} from "./layout.ts"
import { lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween, isWhitespace } from "./source.ts"

/** Values and outer box forms each print once at their authored owner. */
export const treeviewValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "TreeviewIdentifier",
  "TreeviewLiteral",
  "TreeviewBranchPrefix",
  "TreeviewIgnoredText",
])

/** One authored body item and its planned indentation. */
export interface TreeviewLine {
  readonly range: Range
  readonly item: TreeviewBodyItem
  readonly depth: number
  readonly leading: LeadingDirectives | null
}

/** Common preamble items share their column and exterior-gap policy. */
export function isTreeviewCommonStatement(
  item: TreeviewBodyItem,
): item is Exclude<TreeviewBodyItem, TreeviewNode | TreeviewIgnoredText> {
  switch (item.type) {
    case "TreeviewTitleStatement":
    case "TreeviewAccTitleStatement":
    case "TreeviewAccDescrStatement":
    case "TreeviewAccDescrBlockStatement":
      return true
    case "TreeviewNode":
    case "TreeviewIgnoredText":
      return false
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown treeview item ${JSON.stringify(item satisfies never)}`,
      )
  }
}

/** The metadata-shaped exclusions of diagrams/treeview.md, Scope and mode. */
function isMetadataLine(text: string): boolean {
  if (text.startsWith("title ") || text.startsWith("title\t")) return true
  for (const keyword of ["accTitle", "accDescr"]) {
    if (!text.startsWith(keyword)) continue
    let position = keyword.length
    while (text[position] === " " || text[position] === "\t") position++
    if (
      text[position] === ":" ||
      (keyword === "accDescr" && text[position] === "{")
    )
      return true
  }
  return false
}

/**
 * Implements diagrams/treeview.md, Scope and mode, once: inspect logical LF
 * lines after the standalone header, including quoted and block interiors.
 * Common removals do not contribute characters or boundaries. Prefix presence
 * alone cannot decide the mode (docs/treeview.md, Modes).
 */
export function treeviewBoxMode(source: Source, headerEnd: number): boolean {
  const removed: Range[] = [
    ...source.root.directives.map((item): Range => {
      let end = item.range[1]
      if (!item.closed)
        while (end < source.text.length && isWhitespace(source.text[end])) end++
      return [item.range[0], end]
    }),
    ...source.joiningRegions.map((region): Range => [region.start, region.end]),
  ].sort((a, b) => a[0] - b[0])
  let rangeIndex = 0
  let line = ""
  let afterHeader = false

  /** Inspect the complete logical line, with the specified exclusions. */
  function selectsMode(): boolean {
    const text = line.trimStart()
    if (
      text.trim() === "" ||
      text.startsWith("%%") ||
      isMetadataLine(text) ||
      [...text].every(
        (character) =>
          isWhitespace(character) || character === "│" || character === "┃",
      )
    )
      return false
    return [...text].some((character) => "─━│┃└┗├┣".includes(character))
  }

  for (let position = headerEnd; position <= source.text.length; position++) {
    while (removed[rangeIndex]?.[1] <= position) rangeIndex++
    const range = removed[rangeIndex]
    if (range !== undefined && range[0] <= position) {
      position = range[1] - 1
      continue
    }
    if (source.ignoredSemicolons.has(position)) continue
    const character = source.text[position]
    if (character === "\n" || character === undefined) {
      if (afterHeader && selectsMode()) return true
      afterHeader = true
      line = ""
    } else line += character
  }
  return false
}

/**
 * All nodes enter the open stack, including files. Use assigned AST indents,
 * not physical leading whitespace, so carried runs move only once
 * (diagrams/treeview.md, Indentation and parents; docs/treeview.md, Indentation).
 */
export function treeviewLines(
  source: Source,
  diagram: TreeviewDiagram,
  headerEnd: number,
  boxMode: boolean,
): TreeviewLine[] {
  const open: TreeviewNode[] = []
  let previousEnd = headerEnd
  return diagram.body.map((item) => {
    let depth = 1
    if (item.type === "TreeviewNode") {
      while (open.length > 0 && open.at(-1)!.indent >= item.indent) open.pop()
      depth += open.length
      open.push(item)
    }
    const start = item.range[0]
    let from = start
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
    const leading =
      !boxMode &&
      from >= previousEnd &&
      findTriviaBetween(source, from, start).length > 0
        ? findLeadingDirectives(source, from, start)
        : null
    const precedingEnd = previousEnd
    previousEnd = item.range[1]
    return {
      range: [leading?.directives[0]?.[0] ?? start, item.range[1]],
      item,
      depth,
      leading:
        leading !== null &&
        lineStartOf(source, from) === lineStartOf(source, precedingEnd - 1)
          ? { ...leading, gaps: leading.gaps.map((gap) => Math.min(1, gap)) }
          : leading,
    }
  })
}

/**
 * A block with box syntax in its physical span must keep that geometry.
 * Ordinary blocks, including column-one blocks in box mode, use the shared
 * description layout (diagrams/treeview.md, Line classification and errors;
 * docs/treeview.md, Description blocks).
 */
function keepsBlockGeometry(item: TreeviewBodyItem): boolean {
  return (
    item.type === "TreeviewAccDescrBlockStatement" &&
    (item.prefix !== null ||
      item.textBeforeOpen.length > 0 ||
      [...(item.value?.value ?? "")].some((character) =>
        "─━│┃└┗├┣".includes(character),
      ))
  )
}

/** Node/annotation components use compact gaps without changing value spans. */
export function layoutTreeviewStatement(
  source: Source,
  item: TreeviewBodyItem,
  column: string,
  boxMode: boolean,
): AtomLayout {
  const [start, end] = item.range
  let layout: AtomLayout
  switch (item.type) {
    case "TreeviewTitleStatement":
    case "TreeviewAccTitleStatement":
    case "TreeviewAccDescrStatement": {
      // Prefixes are value atoms; the common path starts at its own keyword.
      const common = {
        ...item,
        range: [item.prefix?.range[1] ?? start, end] as Range,
      }
      layout = layoutCommonLine(
        source,
        common,
        item.type === "TreeviewTitleStatement",
      )
      if (item.prefix !== null)
        layout = {
          ...layout,
          atoms: [{ start, end: item.prefix.range[1] }, ...layout.atoms],
          writtenGapsBefore: new Set([layout.atoms[0].start]),
        }
      break
    }
    case "TreeviewAccDescrBlockStatement":
      layout =
        boxMode && keepsBlockGeometry(item)
          ? keptAsWritten(start, end)
          : layoutCommonDescription(source, item, treeviewValueNodeTypes)
      break
    case "TreeviewIgnoredText":
      layout = keptAsWritten(start, end)
      break
    case "TreeviewNode": {
      const atoms = collectAtoms(
        source,
        start,
        end,
        collectValueNodes(item, treeviewValueNodeTypes),
        [],
      )
      const rules = new Map<number, GapRule>()
      const annotationStarts = new Set(
        item.annotations.map((annotation) => annotation.range[0]),
      )
      const writtenGapsBefore = new Set<number>()
      for (const [index, atom] of atoms.entries()) {
        const previous = atoms[index - 1]
        if (previous === undefined) continue
        rules.set(
          atom.start,
          annotationStarts.has(atom.start) ? "space" : "none",
        )
        // In box mode the original physical boundaries, prefixes, separator
        // padding and decorations determine the reading. Ordinary same-line
        // annotation components still use the decided compact layout.
        if (
          boxMode &&
          (source.text.slice(previous.end, atom.start).includes("\n") ||
            item.prefix?.range[0] === previous.start ||
            item.textBeforeName.some(
              (form) => form.range[0] === previous.start,
            ) ||
            item.annotations.some(
              (annotation) =>
                annotation.prefix?.range[0] === previous.start ||
                annotation.textBefore.some(
                  (form) =>
                    form.range[0] === previous.start ||
                    form.range[0] === atom.start,
                ),
            ))
        )
          writtenGapsBefore.add(atom.start)
      }
      layout = {
        atoms: atoms.map((atom) => ({ ...atom, writtenIndentation: column })),
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
        writtenGapsBefore,
      }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown treeview item ${JSON.stringify(item satisfies never)}`,
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
