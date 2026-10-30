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
import type { TreeviewBoxPlan } from "./treeview-box.ts"
import { treeviewContentStart } from "./treeview-box.ts"
import {
  treeviewBoxCharacters,
  treeviewBranchCharacters,
} from "./treeview-characters.ts"
import { lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findCoveringRange,
  findStructuralToken,
  findTriviaBetween,
  isWhitespace,
} from "./source.ts"

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
  readonly ancestors: readonly TreeviewNode[]
  readonly hasNextSibling: boolean
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

/** Logical LF lines and source positions needed by the direct box rules. */
export interface TreeviewPhysicalLine {
  readonly range: Range
  readonly text: string
  /** Original offsets of the logical line's UTF-16 units, after removals. */
  readonly offsets: readonly number[]
  readonly candidate: boolean
  readonly prefix: Range | null
  readonly column: number
  readonly decoration: boolean
}

/** ASCII entity words have the common placeholder's UTF-16 width. */
function branchColumn(text: string, branch: number): number {
  let column = 0
  for (let index = 0; index < branch; index++) {
    if (text[index] === "#") {
      let end = index + 1
      let numeric = true
      while (end < branch) {
        const character = text[end]
        if (!(
          (character >= "0" && character <= "9") ||
          (character >= "a" && character <= "z") ||
          (character >= "A" && character <= "Z") ||
          character === "_"
        ))
          break
        if (character < "0" || character > "9") numeric = false
        end++
      }
      if (end > index + 1 && text[end] === ";") {
        // common.md, Entities: numeric placeholders add five units to the
        // word, named placeholders four. They cannot introduce a branch.
        column += end - index - 1 + (numeric ? 5 : 4)
        index = end
        continue
      }
    }
    column += text[index] === "\t" ? 4 : 1
  }
  return column
}

/**
 * Implements diagrams/treeview.md, Scope and mode and Columns and prefix
 * indentation, once. Inspect logical LF lines including value interiors;
 * common removals contribute neither characters nor line boundaries.
 */
export function treeviewPhysicalLines(
  source: Source,
  headerEnd: number,
): TreeviewPhysicalLine[] {
  const removed: Range[] = [
    ...source.root.directives.map((item): Range => {
      let end = item.range[1]
      if (!item.closed)
        while (end < source.text.length && isWhitespace(source.text[end])) end++
      return [item.range[0], end]
    }),
    ...source.joiningRegions.map((region): Range => [region.start, region.end]),
  ].sort((a, b) => a[0] - b[0])
  const lines: TreeviewPhysicalLine[] = []
  let rangeIndex = 0
  let text = ""
  let offsets: number[] = []
  let afterHeader = false
  let start = headerEnd
  for (let position = headerEnd; position <= source.text.length; position++) {
    while (removed[rangeIndex]?.[1] <= position) rangeIndex++
    const range = removed[rangeIndex]
    if (range !== undefined && range[0] <= position) {
      position = range[1] - 1
      continue
    }
    if (source.ignoredSemicolons.has(position)) continue
    const character = source.text[position]
    if (character !== "\n" && character !== undefined) {
      text += character
      offsets.push(position)
      continue
    }
    if (afterHeader) {
      const trimmed = text.trimStart()
      const vertical = [...text].every(
        (part) => isWhitespace(part) || part === "│" || part === "┃",
      )
      const candidate =
        trimmed.trim() !== "" &&
        !trimmed.startsWith("%%") &&
        !isMetadataLine(trimmed) &&
        !vertical
      const branch = candidate
        ? [...text].find((part) => treeviewBranchCharacters.includes(part))
        : undefined
      const index = branch === undefined ? -1 : text.indexOf(branch)
      let end = index + 1
      while (text[end] === "─" || text[end] === "━") end++
      let first = 0
      while (first < text.length && isWhitespace(text[first])) first++
      lines.push({
        range: [start, position],
        text,
        offsets,
        candidate,
        column: index === -1 ? -1 : branchColumn(text, index),
        prefix: index === -1 ? null : [offsets[first], offsets[end - 1] + 1],
        decoration:
          trimmed.trim() !== "" &&
          !isMetadataLine(trimmed) &&
          !trimmed.startsWith("%%") &&
          index === -1 &&
          [...text].every(
            (part) =>
              isWhitespace(part) || treeviewBoxCharacters.includes(part),
          ),
      })
    }
    afterHeader = true
    start = position + 1
    text = ""
    offsets = []
  }
  return lines
}

/** Prefix presence alone cannot select box mode (docs/treeview.md, Modes). */
export function treeviewBoxMode(source: Source, headerEnd: number): boolean {
  return treeviewPhysicalLines(source, headerEnd).some(
    (line) =>
      line.candidate &&
      [...line.text].some((character) =>
        treeviewBoxCharacters.includes(character),
      ),
  )
}

/** Own syntax in source order, always including the required name. */
function treeviewNodeParts(node: TreeviewNode): readonly Node[] {
  return [
    ...(node.prefix === null ? [] : [node.prefix]),
    ...node.textBeforeName,
    node.name,
    ...node.annotations,
  ]
}

/** Only this item's syntax is printed here; gaps and descendants have lines. */
export function treeviewStatementRange(item: TreeviewBodyItem): Range {
  if (item.type !== "TreeviewNode") return item.range
  const parts = treeviewNodeParts(item)
  return [parts[0].range[0], parts.at(-1)!.range[1]]
}

/**
 * Read parents and sibling order from children, including file parents.
 * Named gaps print at their source position, outside the node's own syntax
 * (ast/treeview.md, Gap ownership; docs/treeview.md, Indentation).
 */
export function treeviewLines(
  source: Source,
  diagram: TreeviewDiagram,
  headerEnd: number,
  boxMode: boolean,
): TreeviewLine[] {
  const lines: TreeviewLine[] = []
  let previousEnd = headerEnd
  visit(diagram.body, [])
  return lines

  /** Visits the authored forest without deriving hierarchy from indentation. */
  function visit(
    items: readonly TreeviewBodyItem[],
    ancestors: readonly TreeviewNode[],
  ): void {
    const nodes = items.filter((item) => item.type === "TreeviewNode")
    for (const item of items) {
      if (item.type === "TreeviewNode") {
        for (const decoration of item.textBefore) addLine(decoration, [], false)
        addLine(item, ancestors, item !== nodes.at(-1))
        visit(item.children, [...ancestors, item])
      } else addLine(item, [], false)
    }
  }

  /** Retains the existing directive and carried-gap placement for one line. */
  function addLine(
    item: TreeviewBodyItem,
    ancestors: readonly TreeviewNode[],
    hasNextSibling: boolean,
  ): void {
    const range = treeviewStatementRange(item)
    const start = range[0]
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
      (!boxMode || (item.type === "TreeviewNode" && item.prefix === null)) &&
      from >= previousEnd &&
      findTriviaBetween(source, from, start).length > 0
        ? findLeadingDirectives(source, from, start)
        : null
    const precedingEnd = previousEnd
    previousEnd = range[1]
    lines.push({
      range: [leading?.directives[0]?.[0] ?? start, range[1]],
      item,
      depth: ancestors.length + 1,
      ancestors,
      hasNextSibling,
      leading:
        leading !== null &&
        lineStartOf(source, from) === lineStartOf(source, precedingEnd - 1)
          ? { ...leading, gaps: leading.gaps.map((gap) => Math.min(1, gap)) }
          : leading,
    })
  }
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
    [...(item.value?.value ?? "")].some((character) =>
      treeviewBoxCharacters.includes(character),
    )
  )
}

/** Node/annotation components use compact gaps without changing value spans. */
export function layoutTreeviewStatement(
  source: Source,
  item: TreeviewBodyItem,
  column: string,
  boxMode: boolean,
  drawing?: Extract<TreeviewBoxPlan, { readonly kind: "drawn" }>,
): AtomLayout {
  const [start, end] = treeviewStatementRange(item)
  let layout: AtomLayout
  switch (item.type) {
    case "TreeviewTitleStatement":
    case "TreeviewAccTitleStatement":
    case "TreeviewAccDescrStatement": {
      const common = {
        ...item,
        range: [item.prefix?.range[1] ?? start, end] as Range,
      }
      layout = layoutCommonLine(
        source,
        common,
        item.type === "TreeviewTitleStatement",
      )
      break
    }
    case "TreeviewAccDescrBlockStatement": {
      const content =
        drawing === undefined
          ? item
          : {
              ...item,
              range: [treeviewContentStart(source, item), end] as Range,
            }
      if (boxMode && keepsBlockGeometry(item)) {
        // Value-owned box lines keep the complete brace interior; only the
        // outer structure before the opener is replaced (Description blocks).
        const keyword = findStructuralToken(source, content.range[0])!
        const brace = findStructuralToken(
          source,
          item.textBeforeOpen.at(-1)?.range[1] ?? keyword.range[1],
        )!
        layout = {
          atoms: [
            { start: keyword.range[0], end: keyword.range[1] },
            { start: brace.range[0], end },
          ],
          rules: new Map(),
          outdented: new Set(),
          lineBreaks: "kept",
          joinedBefore:
            findTriviaBetween(source, keyword.range[1], brace.range[0])
              .length === 0
              ? new Set([brace.range[0]])
              : new Set(),
        }
      } else
        layout = layoutCommonDescription(
          source,
          content,
          treeviewValueNodeTypes,
        )
      const gap = drawing?.keptOpenerGaps.get(item)
      if (gap !== undefined) {
        // A sole mode selector belongs to this gap; keep only that gap while
        // the shared description layout formats the brace interior normally.
        layout = {
          ...layout,
          atoms: layout.atoms.filter(
            (atom) => atom.end <= gap[0] || atom.start >= gap[1],
          ),
          joinedBefore: new Set(
            [...(layout.joinedBefore ?? [])].filter((at) => at !== gap[1]),
          ),
          writtenGapsBefore: new Set([gap[1]]),
        }
      }
      break
    }
    case "TreeviewIgnoredText":
      layout = keptAsWritten(start, end)
      break
    case "TreeviewNode": {
      const atoms = collectAtoms(
        source,
        start,
        end,
        treeviewNodeParts(item).flatMap((part) =>
          treeviewValueNodeTypes.has(part.type)
            ? [part]
            : collectValueNodes(part, treeviewValueNodeTypes),
        ),
        [],
      )
      const rules = new Map<number, GapRule>()
      const annotationStarts = new Set(
        item.annotations.map((annotation) => annotation.range[0]),
      )
      for (const atom of atoms.slice(1)) {
        rules.set(
          atom.start,
          annotationStarts.has(atom.start) ? "space" : "none",
        )
      }
      // An annotation on its own physical line still needs ASCII separation
      // after Mermaid joins a comment region or removes a directive. Logical
      // lineStartOf cannot detect that boundary (diagrams/treeview.md,
      // Annotations; docs/treeview.md, Annotation lines).
      const laterAnnotations = new Set(
        item.annotations
          .filter((annotation) => {
            const physicalStart =
              source.text.lastIndexOf("\n", annotation.range[0] - 1) + 1
            return (
              physicalStart > item.name.range[0] &&
              !drawing?.joinedAnnotations.has(annotation.range[0])
            )
          })
          .map((annotation) => annotation.range[0]),
      )
      const annotationColumn =
        drawing === undefined
          ? column
          : " ".repeat(Math.max(1, drawing.heads.get(item)!.length))
      layout = {
        atoms: atoms.map((atom) => ({
          ...atom,
          writtenIndentation: laterAnnotations.has(atom.start)
            ? annotationColumn
            : column,
        })),
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown treeview item ${JSON.stringify(item satisfies never)}`,
      )
  }
  const omitted = drawing?.omitted ?? []
  const atoms = layout.atoms.filter(
    (atom) => findCoveringRange(omitted, atom.start, atom.end) === undefined,
  )
  const joinedBefore = new Set([
    ...(layout.joinedBefore ?? []),
    ...(drawing?.joinedAnnotations ?? []),
  ])
  const rules = new Map(layout.rules)
  for (const at of drawing?.joinedAnnotations ?? []) rules.set(at, "space")
  return {
    ...layout,
    rules,
    joinedBefore,
    omittedRanges: omitted,
    atoms: protectSemicolonPrefixes(
      source,
      drawing === undefined ? start : treeviewContentStart(source, item),
      end,
      atoms.map((atom) =>
        layout.outdented.has(atom.start)
          ? { ...atom, writtenIndentation: column }
          : atom,
      ),
    ),
  }
}
