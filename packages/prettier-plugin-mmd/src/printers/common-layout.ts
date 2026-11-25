import type {
  Node,
  CynefinTitleStatement,
  CynefinAccTitleStatement,
  CynefinAccDescrStatement,
  CynefinAccDescrBlockStatement,
  WardleyTitleStatement,
  WardleyAccTitleStatement,
  WardleyAccDescrStatement,
  WardleyAccDescrBlockStatement,
  RailroadTitleStatement,
  RailroadAccTitleStatement,
  RailroadAccDescrStatement,
  RailroadAccDescrBlockStatement,
  RadarTitleStatement,
  RadarAccTitleStatement,
  RadarAccDescrStatement,
  RadarAccDescrBlockStatement,
  ArchitectureTitleStatement,
  ArchitectureAccTitleStatement,
  ArchitectureAccDescrStatement,
  ArchitectureAccDescrBlockStatement,
  InfoTitleStatement,
  InfoAccTitleStatement,
  InfoAccDescrStatement,
  InfoAccDescrBlockStatement,
  PieTitleStatement,
  PieAccTitleStatement,
  PieAccDescrStatement,
  PieAccDescrBlockStatement,
  GitgraphTitleStatement,
  GitgraphAccTitleStatement,
  GitgraphAccDescrStatement,
  GitgraphAccDescrBlockStatement,
  PacketTitleStatement,
  PacketAccTitleStatement,
  PacketAccDescrStatement,
  PacketAccDescrBlockStatement,
  TreeviewTitleStatement,
  TreeviewAccTitleStatement,
  TreeviewAccDescrStatement,
  TreeviewAccDescrBlockStatement,
  TreemapTitleStatement,
  TreemapAccTitleStatement,
  TreemapAccDescrStatement,
  TreemapAccDescrBlockStatement,
} from "@mmd-toolkit/ast"
import { diagramTypesWithJisonAccessibilityLines } from "./acc-value-join.ts"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { collectAtoms, expectToken, layoutDescriptionBlock } from "./layout.ts"
import {
  accessibilityRules,
  endsWithDirectives,
  trimTextAfterKeyword,
  trimmedTextEnd,
} from "./statement-rules.ts"
import { collapsedRunsAtom } from "./text-runs.ts"
import type { Source } from "./source.ts"
import {
  findDirectiveEndingAt,
  findStructuralToken,
  findTokensBetween,
  findTriviaBetween,
  isInlineWhitespace,
  isSpaceOrTab,
  isStructural,
  isWhitespace,
  skipRemoved,
} from "./source.ts"

type CommonStatement = (
  | CynefinTitleStatement
  | CynefinAccTitleStatement
  | CynefinAccDescrStatement
  | CynefinAccDescrBlockStatement
  | WardleyTitleStatement
  | WardleyAccTitleStatement
  | WardleyAccDescrStatement
  | WardleyAccDescrBlockStatement
  | RailroadTitleStatement
  | RailroadAccTitleStatement
  | RailroadAccDescrStatement
  | RailroadAccDescrBlockStatement
  | RadarTitleStatement
  | RadarAccTitleStatement
  | RadarAccDescrStatement
  | RadarAccDescrBlockStatement
  | ArchitectureTitleStatement
  | ArchitectureAccTitleStatement
  | ArchitectureAccDescrStatement
  | ArchitectureAccDescrBlockStatement
  | InfoTitleStatement
  | InfoAccTitleStatement
  | InfoAccDescrStatement
  | InfoAccDescrBlockStatement
  | PieTitleStatement
  | PieAccTitleStatement
  | PieAccDescrStatement
  | PieAccDescrBlockStatement
  | GitgraphTitleStatement
  | GitgraphAccTitleStatement
  | GitgraphAccDescrStatement
  | GitgraphAccDescrBlockStatement
  | PacketTitleStatement
  | PacketAccTitleStatement
  | PacketAccDescrStatement
  | PacketAccDescrBlockStatement
  | TreeviewTitleStatement
  | TreeviewAccTitleStatement
  | TreeviewAccDescrStatement
  | TreeviewAccDescrBlockStatement
  | TreemapTitleStatement
  | TreemapAccTitleStatement
  | TreemapAccDescrStatement
  | TreemapAccDescrBlockStatement
) & {
  readonly textAfter?: readonly Node[]
  readonly textBeforeOpen?: readonly Node[]
}

/** Whether a `%%` comment, and no directive, starts at `offset`. */
function startsPlainComment(source: Source, offset: number): boolean {
  return (
    source.text.startsWith("%%", offset) &&
    !source.text.startsWith("%%{", offset)
  )
}

/**
 * The diagram type whose `title` the oldest version that counts reads with a
 * lexer built with jison, which takes a whitespace character that is no space
 * or tab before a `%%` as a part of the title, where the later versions trim
 * it (docs/pie.md, Title). That version rejects the `title` of a gitGraph
 * (docs/gitgraph.md, Title and common values).
 */
const diagramTypeWithJisonTitle = "pie"

/**
 * Whether a whitespace character that is no space or tab stands between the
 * text of a value and the `%%` comment at `commentStart`, with or without
 * directives, which mermaid.js removes first, among the whitespace.
 */
function holdsOtherWhitespaceBeforeComment(
  source: Source,
  valueStart: number,
  commentStart: number,
): boolean {
  let position = commentStart
  for (;;) {
    while (position > valueStart && isWhitespace(source.text[position - 1])) {
      if (!isSpaceOrTab(source.text[position - 1])) return true
      position--
    }
    const directive = findDirectiveEndingAt(source, position)
    if (directive === undefined || directive.range[0] <= valueStart)
      return false
    position = directive.range[0]
  }
}

/** Whether the statement is an `accTitle:` line. */
function isAccTitle(statement: CommonStatement): boolean {
  return statement.type.includes("AccTitle")
}

/**
 * Where the whitespace that the planned indentation of the next line supplies
 * starts, after a line that ends with `statement`. A `title` with no text ends
 * where its keyword ends, and the whitespace after it is no part of its range,
 * unlike the whitespace after a title with text. That whitespace, when a
 * directive or a comment follows it on the line, is a gap of the line, which a
 * gap rule prints as one space, and no indentation of the next line, so the
 * run starts after the last of those items (docs/treemap.md and
 * docs/treeview.md, Title).
 */
export function relocatedWhitespaceStart(
  source: Source,
  statement: Node,
  end: number,
): number {
  if (!statement.type.endsWith("TitleStatement")) return end
  let position = end
  let after = end
  for (;;) {
    while (isSpaceOrTab(source.text.charAt(position))) position++
    const item = findTriviaBetween(source, position, position + 1)[0]
    if (item === undefined) return after
    position = item.range[1]
    after = position
  }
}

/**
 * Shared compact line forms never read the next physical line (docs/pie.md,
 * Accessibility lines; docs/gitgraph.md, Title and common values).
 */
export function layoutCommonLine(
  source: Source,
  statement: CommonStatement,
  isTitle: boolean,
): AtomLayout {
  const [start, end] = statement.range
  const keyword = expectToken(
    findStructuralToken(source, start),
    "the common keyword",
  )
  const delimiter = isTitle
    ? keyword
    : expectToken(
        findStructuralToken(source, keyword.range[1]),
        "the accessibility colon",
      )
  const value = statement.value
  const hasTrivia =
    value !== null && findTriviaBetween(source, ...value.range).length > 0
  const diagramType = source.root.diagramType
  const commentStart =
    value === null ? null : skipRemoved(source, value.range[1])
  const commentFollows =
    commentStart !== null && startsPlainComment(source, commentStart)
  // A `%%` right after the value of an `accTitle`, also after the directives
  // that mermaid.js removes first, is a part of the title to the oldest version
  // that counts, with the whitespace before it, so the line stays as written
  // (docs/pie.md, Accessibility lines).
  const accTitleReachesComment =
    commentFollows &&
    isAccTitle(statement) &&
    diagramTypesWithJisonAccessibilityLines.has(diagramType)
  // For the `title` of a pie chart and the `accDescr` line of a pie chart and a
  // gitGraph, that version draws only a whitespace character that is no space
  // or tab before the `%%` as a part of the text, where the later versions trim
  // it, so only that character stays; spaces and tabs are drawn the same, and
  // a value with a directive inside it is printed as in the other diagrams
  // (docs/pie.md, Title and Accessibility lines).
  const gapReachesComment =
    value !== null &&
    commentStart !== null &&
    commentFollows &&
    !hasTrivia &&
    !isAccTitle(statement) &&
    (isTitle
      ? diagramType === diagramTypeWithJisonTitle
      : diagramTypesWithJisonAccessibilityLines.has(diagramType)) &&
    holdsOtherWhitespaceBeforeComment(source, value.range[0], commentStart)
  const valueReachesComment = accTitleReachesComment || gapReachesComment
  // Only spaces and tabs stand between the directives and after the last one
  // where the text counts as ending with directives: with other whitespace
  // there the line stays as written, with the spaces and tabs after it
  // (docs/compatibility.md, Texts after a keyword that are drawn the same).
  const endsInDirectives =
    hasTrivia &&
    !valueReachesComment &&
    (statement.textAfter?.length ?? 0) === 0 &&
    endsWithDirectives(source, value.range)
  let valueStart = value?.range[0] ?? delimiter.range[1]
  let valueEnd = value?.range[1] ?? valueStart
  const valueTextEnd = trimmedTextEnd(
    source,
    valueStart,
    valueEnd,
    isWhitespace,
  )
  const trimsEnd = !valueReachesComment && (!hasTrivia || endsInDirectives)
  if (trimsEnd) valueEnd = valueTextEnd.end
  if (!hasTrivia) {
    // The text of a value that follows a second whitespace character starts
    // at that character, so a `;` that the line rule ignores can come before
    // the first character that is read. It is a gap item, as it is when one
    // whitespace character stands before it.
    while (
      valueStart < valueEnd &&
      (source.text[valueStart].trim() === "" ||
        source.ignoredSemicolons.has(valueStart))
    )
      valueStart++
    // A `%%` right after the value of an `accTitle` is a comment to the
    // pinned grammar and the end of the title to the later versions, and a part
    // of the title to the oldest version that counts, which shows the title as
    // a tooltip: the whitespace before the `%%` stays (docs/pie.md,
    // Accessibility lines).
    if (!valueReachesComment) {
      while (valueStart < valueEnd && source.text[valueEnd - 1].trim() === "")
        valueEnd--
    }
  } else if (endsInDirectives) {
    while (valueStart < valueEnd && source.text[valueStart].trim() === "")
      valueStart++
  }
  const holdsTrivia = hasTrivia && !endsInDirectives
  if (holdsTrivia) valueStart = delimiter.range[1]
  const printedValue =
    valueStart < valueEnd
      ? { ...value!, range: [valueStart, valueEnd] as [number, number] }
      : null
  const lineRules = isTitle
    ? new Map<number, GapRule>()
    : accessibilityRules(source, {
        range: statement.range,
        value: printedValue,
      })
  if (printedValue !== null)
    lineRules.set(valueStart, holdsTrivia ? "none" : "space")
  // Collect only the keyword/delimiter and the trimmed value. The original
  // RawText token includes padding and must not be collected a second time.
  const atoms: Atom[] = [
    ...collectAtoms(source, start, delimiter.range[1], [], []),
    ...(printedValue === null
      ? []
      : [
          // The runs inside the text are drawn as one space (docs/
          // compatibility.md, Runs of whitespace in a text that are drawn
          // the same), except in an `accTitle`, which the browser shows as
          // a tooltip.
          isAccTitle(statement)
            ? { start: valueStart, end: valueEnd }
            : collapsedRunsAtom(source, { start: valueStart, end: valueEnd }),
        ]),
    ...(statement.textAfter ?? []).map((item) => ({
      start: item.range[0],
      end: item.range[1],
    })),
  ]
  // A text that ends with directives prints them as at the end of a line, and
  // leaves out the whitespace at its end (docs/compatibility.md, Texts after a
  // keyword that are drawn the same). The runs inside an `accTitle` stay. The
  // run before the last directive holds any whitespace of a line, which the
  // line without blanks after the directive prints as one space too.
  if (endsInDirectives) {
    trimTextAfterKeyword(
      source,
      atoms,
      [valueStart, valueEnd],
      !statement.type.includes("AccTitle"),
      isInlineWhitespace,
    )
  }
  // An ignored `;` at the trimmed end stays against the text, as when its
  // trailing blanks lie outside the value (docs/pie.md, Accessibility lines).
  if (trimsEnd && valueTextEnd.trailingBlanks !== null) {
    atoms.push({ start: valueTextEnd.end, end: valueTextEnd.end + 1 })
    lineRules.set(valueTextEnd.end, "none")
  }
  let layout: AtomLayout = {
    atoms,
    rules: lineRules,
    outdented: new Set(),
    lineBreaks: "kept",
    // Common line-value edges trim Unicode whitespace too. These forms never
    // read a next-line value (docs/pie.md and docs/gitgraph.md).
    joinedBefore: new Set(
      printedValue !== null && !holdsTrivia ? [valueStart] : [],
    ),
  }
  // Null values can still contain common directives outside their range.
  const textEnd = statement.textAfter?.at(0)?.range[0] ?? end
  if (
    printedValue === null &&
    delimiter.range[1] < textEnd &&
    findTriviaBetween(source, delimiter.range[1], textEnd).length > 0
  ) {
    layout = {
      ...layout,
      atoms: [
        ...layout.atoms,
        { start: delimiter.range[1], end: textEnd },
      ].sort((a, b) => a.start - b.start),
      rules: new Map([...lineRules, [delimiter.range[1], "none"]]),
    }
  }

  return layout
}

/**
 * Shared block edges and aligned closer, followed by retained hidden suffixes
 * (docs/pie.md, Description blocks; docs/gitgraph.md, Title and common values).
 */
export function layoutCommonDescription(
  source: Source,
  statement: CommonStatement,
  valueTypes: ReadonlySet<Node["type"]>,
  options: { readonly preservesBodyColumns?: boolean } = {},
): AtomLayout {
  const [start, end] = statement.range
  const after = statement.textAfter?.at(0)?.range[0] ?? end
  const closing = findTokensBetween(source, start, after).findLast(
    (token) => isStructural(source, token) && token.value === "}",
  )
  const blockEnd = expectToken(closing, "the description closer").range[1]
  const block = {
    ...statement,
    range: [start, blockEnd] as [number, number],
    textAfter: [],
  }
  const opener = expectToken(findStructuralToken(source, start), "accDescr")
  const brace = expectToken(
    findStructuralToken(
      source,
      statement.textBeforeOpen?.at(-1)?.range[1] ?? opener.range[1],
    ),
    "the description opener",
  )
  let layout = layoutDescriptionBlock(source, block, blockEnd, valueTypes, {
    ...options,
    keepsTrailingTrivia: true,
    formatsEmptyTrivia: true,
    trimValueEdges: true,
    opening: brace.range[0],
  })
  const gapHasTrivia =
    findTriviaBetween(source, opener.range[1], brace.range[0]).length > 0
  // Plain whitespace before the opener is consumed by the block terminal;
  // real trivia keeps its authored break (docs/pie.md, Description blocks).
  layout = {
    ...layout,
    outdented: new Set([
      brace.range[0],
      expectToken(closing, "the description closer").range[0],
    ]),
    joinedBefore: new Set([
      ...(layout.joinedBefore ?? []),
      ...(gapHasTrivia ? [] : [brace.range[0]]),
    ]),
    atoms: [
      ...layout.atoms,
      ...(statement.textAfter ?? []).map((item) => ({
        start: item.range[0],
        end: item.range[1],
      })),
    ],
  }

  return layout
}
