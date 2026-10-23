import type {
  Node,
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
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { collectAtoms, expectToken, layoutDescriptionBlock } from "./layout.ts"
import { accessibilityRules } from "./statement-rules.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
} from "./source.ts"

type CommonStatement =
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
  let valueStart = value?.range[0] ?? delimiter.range[1]
  let valueEnd = value?.range[1] ?? valueStart
  if (!hasTrivia) {
    while (valueStart < valueEnd && source.text[valueStart].trim() === "")
      valueStart++
    while (valueStart < valueEnd && source.text[valueEnd - 1].trim() === "")
      valueEnd--
  }
  if (hasTrivia) valueStart = delimiter.range[1]
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
    lineRules.set(valueStart, hasTrivia ? "none" : "space")
  // Collect only the keyword/delimiter and the trimmed value. The original
  // RawText token includes padding and must not be collected a second time.
  let layout: AtomLayout = {
    atoms: [
      ...collectAtoms(source, start, delimiter.range[1], [], []),
      ...(printedValue === null ? [] : [{ start: valueStart, end: valueEnd }]),
      ...statement.textAfter.map((item) => ({
        start: item.range[0],
        end: item.range[1],
      })),
    ],
    rules: lineRules,
    outdented: new Set(),
    lineBreaks: "kept",
    // Common line-value edges trim Unicode whitespace too. These forms never
    // read a next-line value (docs/pie.md and docs/gitgraph.md).
    joinedBefore: new Set(
      printedValue !== null && !hasTrivia ? [valueStart] : [],
    ),
  }
  // Null values can still contain common directives outside their range.
  const textEnd = statement.textAfter.at(0)?.range[0] ?? end
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
): AtomLayout {
  const [start, end] = statement.range
  const after = statement.textAfter.at(0)?.range[0] ?? end
  const closing = findTokensBetween(source, start, after).findLast(
    (token) => isStructural(source, token) && token.value === "}",
  )
  const blockEnd = expectToken(closing, "the description closer").range[1]
  const block = {
    ...statement,
    range: [start, blockEnd] as [number, number],
    textAfter: [],
  }
  let layout = layoutDescriptionBlock(source, block, blockEnd, valueTypes, {
    keepsTrailingTrivia: true,
    formatsEmptyTrivia: true,
  })
  const opener = expectToken(findStructuralToken(source, start), "accDescr")
  const brace = expectToken(
    findStructuralToken(source, opener.range[1]),
    "the description opener",
  )
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
      ...statement.textAfter.map((item) => ({
        start: item.range[0],
        end: item.range[1],
      })),
    ],
  }

  return layout
}
