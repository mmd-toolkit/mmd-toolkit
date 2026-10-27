import type {
  Node,
  Range,
  TreeviewBodyItem,
  TreeviewAccDescrBlockStatement,
  TreeviewDiagram,
  TreeviewIgnoredText,
  TreeviewNode,
} from "@mmd-toolkit/parser"
import {
  treeviewBoxCharacters,
  treeviewBranchCharacters,
} from "./treeview-characters.ts"
import { walk } from "./layout.ts"
import { lineStartOf } from "./kept-lines.ts"
import type { Source } from "./source.ts"
import { findStructuralToken, isWhitespace } from "./source.ts"
import type { TreeviewLine, TreeviewPhysicalLine } from "./treeview-layout.ts"
import {
  isTreeviewCommonStatement,
  treeviewPhysicalLines,
} from "./treeview-layout.ts"

/** A complete box plan is selected before any source structure is replaced. */
export type TreeviewBoxPlan =
  | { readonly kind: "written"; readonly reasons: readonly string[] }
  | {
      readonly kind: "drawn"
      readonly lines: readonly TreeviewLine[]
      readonly heads: ReadonlyMap<TreeviewNode, string>
      readonly decorations: ReadonlyMap<TreeviewIgnoredText, string>
      readonly trailingDecorations: ReadonlyMap<
        TreeviewNode,
        readonly TreeviewIgnoredText[]
      >
      readonly omitted: readonly Range[]
      readonly joinedAnnotations: ReadonlySet<number>
      readonly keptOpenerGaps: ReadonlyMap<
        TreeviewAccDescrBlockStatement,
        Range
      >
    }

/** A source interval intersects another, without inventing token boundaries. */
function overlaps(a: Range, b: Range): boolean {
  return a[0] < b[1] && b[0] < a[1]
}

/** Only tabs Mermaid reads within a value can change with a branch line. */
function valueHasTab(line: TreeviewPhysicalLine, value: Range): boolean {
  for (
    let index = line.text.indexOf("\t");
    index !== -1;
    index = line.text.indexOf("\t", index + 1)
  ) {
    const offset = line.offsets[index]
    if (value[0] <= offset && offset < value[1]) return true
  }
  return false
}

/** The first token after a common statement's owned prefix. */
export function treeviewContentStart(
  source: Source,
  item: TreeviewBodyItem,
): number {
  if (item.type === "TreeviewNode") return item.name.range[0]
  if (item.type === "TreeviewIgnoredText") return item.range[0]
  return findStructuralToken(source, item.prefix?.range[1] ?? item.range[0])!
    .range[0]
}

/**
 * Decisions 3–5, redrawing 1–10 (docs/treeview.md, Branch prefixes): decide
 * the whole body's safety once, then supply heads and omitted structure to
 * the existing block/atom path. Never parse a candidate output at run time.
 */
export function planTreeviewBox(
  source: Source,
  diagram: TreeviewDiagram,
  lines: readonly TreeviewLine[],
  headerEnd: number,
  protectedRows: boolean,
): TreeviewBoxPlan {
  const physical = treeviewPhysicalLines(source, headerEnd)
  const rows = lines.filter((line) => line.item.type === "TreeviewNode")
  const byNode = new Map(rows.map((line) => [line.item, line]))
  const forest = rows.some(
    (line) =>
      line.ancestors.length === 0 &&
      line.item.type === "TreeviewNode" &&
      line.item.prefix !== null,
  )
  const heads = new Map<TreeviewNode, string>()
  for (const row of rows) {
    const node = row.item as TreeviewNode
    const ancestors = row.ancestors.slice(forest ? 0 : 1)
    heads.set(
      node,
      forest || row.ancestors.length > 0
        ? ancestors
            .map((ancestor) =>
              byNode.get(ancestor)!.hasNextSibling ? "│   " : "    ",
            )
            .join("") + (row.hasNextSibling ? "├── " : "└── ")
        : "",
    )
  }
  const forms: Node[] = []
  const values: Node[] = []
  walk(diagram, (node) => {
    if (
      node.type === "TreeviewBranchPrefix" ||
      node.type === "TreeviewIgnoredText"
    )
      forms.push(node)
    if (
      node.type === "StringLiteral" ||
      node.type === "TreeviewIdentifier" ||
      node.type === "TreeviewLiteral"
    )
      values.push(node)
  })
  const reasons = new Set<string>()
  if (protectedRows) reasons.add("protected row boundary")
  const trivia = [...source.root.directives, ...source.root.comments]
  const prefixes = forms.filter((form) => form.type === "TreeviewBranchPrefix")
  const decorations = forms.filter(
    (form) => form.type === "TreeviewIgnoredText",
  )
  for (const prefix of prefixes) {
    const physicalLine = physical.find(
      (line) => line.prefix?.[0] === prefix.range[0],
    )
    const content =
      findStructuralToken(source, prefix.range[1])?.range[0] ?? prefix.range[1]
    const comment =
      source.root.comments.find((item) => item.range[0] >= prefix.range[1])
        ?.range[0] ?? Infinity
    // The logical prefix includes its separator up to the first component.
    // Source directives in that separator must not lose their contact gaps.
    const through = Math.max(
      prefix.range[1],
      Math.min(content, comment, physicalLine?.range[1] ?? Infinity),
    )
    const range: Range = [lineStartOf(source, prefix.range[0]), through]
    if (
      trivia.some((item) => overlaps(range, item.range)) ||
      [...source.ignoredSemicolons].some(
        (at) => range[0] <= at && at < range[1],
      )
    )
      reasons.add("shared trivia or selected semicolon in prefix")
    if (
      [
        ...source.text.slice(
          lineStartOf(source, prefix.range[0]),
          prefix.range[1],
        ),
      ].some(
        (character) =>
          !isWhitespace(character) &&
          !treeviewBoxCharacters.includes(character),
      )
    )
      reasons.add("arbitrary text in prefix")
  }
  for (const decoration of decorations) {
    const line = physical.find(
      (item) =>
        item.range[0] <= decoration.range[0] &&
        decoration.range[0] <= item.range[1],
    )
    if (
      line !== undefined &&
      trivia.some((item) => overlaps(line.range, item.range))
    )
      reasons.add("shared trivia on decoration line")
  }
  const joinedAnnotations = new Set<number>()
  const trailingDecorations = new Map<
    TreeviewNode,
    readonly TreeviewIgnoredText[]
  >()
  for (const row of rows) {
    const node = row.item as TreeviewNode
    let previousEnd = node.name.range[1]
    let description = false
    const after: TreeviewIgnoredText[] = []
    for (const annotation of node.annotations) {
      const marker = findStructuralToken(
        source,
        annotation.prefix?.range[1] ??
          annotation.textBefore.at(-1)?.range[1] ??
          annotation.range[0],
      )!
      if (annotation.prefix !== null) {
        const gap: Range = [previousEnd, marker.range[0]]
        if (description) reasons.add("prefixed annotation after description")
        if (
          trivia.some((item) => overlaps(gap, item.range)) ||
          source.joiningRegions.some((region) =>
            overlaps(gap, [region.start, region.end]),
          ) ||
          [...source.ignoredSemicolons].some(
            (at) => gap[0] <= at && at < gap[1],
          )
        )
          reasons.add("trivia between a node and its prefixed annotation")
        if (
          heads.get(node) === "" &&
          annotation.type === "TreeviewDescriptionAnnotation" &&
          [...(annotation.value?.value ?? "")].some((character) =>
            treeviewBranchCharacters.includes(character),
          )
        )
          reasons.add("joining annotation exposes a branch inside its value")
        const physicalLine = physical.find(
          (line) => line.prefix?.[0] === annotation.prefix!.range[0],
        )
        if (
          heads.get(node) === "" &&
          annotation.type === "TreeviewDescriptionAnnotation" &&
          annotation.value !== null &&
          physicalLine !== undefined &&
          valueHasTab(physicalLine, annotation.value.range)
        )
          reasons.add("joining annotation changes value tabs")
        joinedAnnotations.add(marker.range[0])
        after.push(...annotation.textBefore)
      }
      description ||= annotation.type === "TreeviewDescriptionAnnotation"
      previousEnd = annotation.range[1]
    }
    trailingDecorations.set(node, after)
  }

  const outerPrefixStarts = new Set(prefixes.map((prefix) => prefix.range[0]))
  const enclosed = physical.filter(
    (line) =>
      line.prefix !== null &&
      !outerPrefixStarts.has(line.prefix[0]) &&
      values.some(
        (value) =>
          value.range[0] <= line.prefix![0] && line.prefix![0] < value.range[1],
      ),
  )
  const columns = [
    ...rows.flatMap((row) => {
      const node = row.item as TreeviewNode
      const head = heads.get(node)!
      return head === ""
        ? []
        : [{ at: node.name.range[0], column: head.length - 4 }]
    }),
    ...enclosed.map((line) => ({ at: line.prefix![0], column: line.column })),
  ].sort((a, b) => a.at - b.at)
  const width = columns.find((column) => column.column > 0)?.column ?? 4
  const oldWidth = physical.find((line) => line.column > 0)?.column ?? 4
  if (
    enclosed.some(
      (line) =>
        Math.round(line.column / width) !== Math.round(line.column / oldWidth),
    )
  )
    reasons.add("redraw changes prefix indentation inside a value")

  // Compare branch-line reading where a branch is newly added or removed:
  // tabs expand there and owned common-whitespace tails disappear. Inspect
  // authored value spans on that line, rather than reparsing printed text.
  for (const row of rows) {
    const node = row.item as TreeviewNode
    const original = physical.find(
      (line) =>
        line.range[0] <= node.name.range[0] &&
        node.name.range[0] <= line.range[1],
    )
    if (
      heads.get(node) === "" &&
      original !== undefined &&
      original.offsets[0] < node.name.range[0] &&
      node.prefix === null &&
      isWhitespace(source.text[node.name.range[0]])
    )
      reasons.add("splitting a logical line exposes leading value whitespace")
    if (heads.get(node) === "" || original?.prefix !== null) continue
    if (
      original !== undefined &&
      values.some((value) => {
        const from = Math.max(value.range[0], node.name.range[0])
        const to = Math.min(value.range[1], original.range[1])
        return (
          from < to &&
          (valueHasTab(original, [from, to]) ||
            (to === original.range[1] && isWhitespace(source.text[to - 1])))
        )
      })
    )
      reasons.add("adding a branch changes value tabs or an owned tail")
  }
  for (const item of diagram.body) {
    if (!isTreeviewCommonStatement(item)) continue
    const removed = [
      item.prefix,
      ...(item.type === "TreeviewAccDescrBlockStatement"
        ? item.textBeforeOpen
        : []),
    ].filter((form) => form?.type === "TreeviewBranchPrefix")
    for (const form of removed) {
      const line = physical.find(
        (candidate) => candidate.prefix?.[0] === form.range[0],
      )
      if (
        line !== undefined &&
        item.value !== null &&
        valueHasTab(line, item.value.range)
      )
        reasons.add("removing a common prefix changes value tabs")
    }
  }
  const remainingSelector =
    columns.length > 0 ||
    physical.some(
      (line) =>
        line.candidate &&
        line.prefix === null &&
        !line.decoration &&
        [...line.text].some((character) =>
          treeviewBoxCharacters.includes(character),
        ),
    )
  const selectingDecorations = decorations.filter((decoration) =>
    physical.some(
      (line) =>
        line.candidate &&
        line.decoration &&
        line.range[0] <= decoration.range[0] &&
        decoration.range[0] <= line.range[1],
    ),
  )
  const keptSelectors = new Set<Node>(
    remainingSelector ? [] : selectingDecorations,
  )
  if (!remainingSelector && selectingDecorations.length === 0)
    reasons.add("redraw removes the box-mode selector")
  const keptOpenerGaps = new Map<TreeviewAccDescrBlockStatement, Range>()
  for (const item of diagram.body) {
    if (
      item.type !== "TreeviewAccDescrBlockStatement" ||
      !item.textBeforeOpen.some((form) => keptSelectors.has(form))
    )
      continue
    const keyword = findStructuralToken(
      source,
      treeviewContentStart(source, item),
    )!
    const brace = findStructuralToken(
      source,
      item.textBeforeOpen.at(-1)!.range[1],
    )!
    keptOpenerGaps.set(item, [keyword.range[1], brace.range[0]])
  }

  if (reasons.size > 0) return { kind: "written", reasons: [...reasons] }
  const drawings = new Map<TreeviewIgnoredText, string>()
  for (const decoration of decorations) {
    if (keptSelectors.has(decoration)) {
      drawings.set(decoration, source.text.slice(...decoration.range))
      continue
    }
    const next = rows.find(
      (row) =>
        row.item.type === "TreeviewNode" &&
        row.item.name.range[0] > decoration.range[1],
    )
    const previous = rows.findLast(
      (row) =>
        row.item.type === "TreeviewNode" &&
        row.item.name.range[1] <= decoration.range[0],
    )
    const ancestors = next?.ancestors.slice(forest ? 0 : 1) ?? []
    drawings.set(
      decoration,
      next !== undefined && previous !== undefined
        ? (
            ancestors
              .map((node) =>
                byNode.get(node)!.hasNextSibling ? "│   " : "    ",
              )
              .join("") + (forest || next.ancestors.length > 0 ? "│" : "")
          ).trimEnd()
        : "",
    )
  }
  const planned: TreeviewLine[] = []
  for (const line of lines) {
    if (line.item.type === "TreeviewIgnoredText") {
      if (drawings.get(line.item) !== "") planned.push(line)
      continue
    }
    if (line.item.type === "TreeviewNode") {
      for (const decoration of line.item.textBeforeName) {
        if (drawings.get(decoration) === "") continue
        planned.push({ ...line, item: decoration, range: decoration.range })
      }
    }
    planned.push({
      ...line,
      range: [
        line.leading?.directives[0]?.[0] ??
          treeviewContentStart(source, line.item),
        line.range[1],
      ],
    })
  }
  return {
    kind: "drawn",
    lines: planned,
    heads,
    decorations: drawings,
    trailingDecorations,
    omitted: forms
      .filter((form) => !keptSelectors.has(form))
      .map((form) => form.range),
    joinedAnnotations,
    keptOpenerGaps,
  }
}
