import type {
  Node,
  Range,
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
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { collectAtoms, expectToken, layoutDescriptionBlock } from "./layout.ts"
import {
  accessibilityRules,
  endsWithDirectives,
  trimTextAfterKeyword,
} from "./statement-rules.ts"
import { collapsedRunsAtom } from "./text-runs.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
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
  const endsWithDirectives =
    hasTrivia &&
    (statement.textAfter?.length ?? 0) === 0 &&
    endsWithDirectives(source, value.range)
  let valueStart = value?.range[0] ?? delimiter.range[1]
  let valueEnd = value?.range[1] ?? valueStart
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
    while (valueStart < valueEnd && source.text[valueEnd - 1].trim() === "")
      valueEnd--
  } else if (endsWithDirectives) {
    while (valueStart < valueEnd && source.text[valueStart].trim() === "")
      valueStart++
  }
  const holdsTrivia = hasTrivia && !endsWithDirectives
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
          statement.type.includes("AccTitle")
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
  // keyword that are drawn the same). The runs inside an `accTitle` stay.
  if (endsWithDirectives) {
    trimTextAfterKeyword(
      source,
      atoms,
      [valueStart, valueEnd],
      !statement.type.includes("AccTitle"),
    )
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
