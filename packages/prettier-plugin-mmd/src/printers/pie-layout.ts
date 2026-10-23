import type {
  Node,
  PieBodyItem,
  PieDiagram,
  PieIgnoredText,
  Token,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  expectValue,
  layoutDescriptionBlock,
  protectSemicolonPrefixes,
} from "./layout.ts"
import { accessibilityRules } from "./statement-rules.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
} from "./source.ts"

/** Authored leaves; common line edges alone are compacted (docs/pie.md). */
export const pieValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "StringLiteral",
  "NumericLiteral",
  "PieLiteral",
  "PieIgnoredText",
])

/** The actual header token follows any retained preheader forms. */
export function pieKeyword(source: Source, diagram: PieDiagram): Token {
  return expectToken(
    findStructuralToken(
      source,
      diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
    ),
    "the pie header",
  )
}

/** Hidden forms keep their gap and consumed LF before a written flag. */
export function layoutPieHeader(
  source: Source,
  diagram: PieDiagram,
): AtomLayout {
  const keyword = pieKeyword(source, diagram)
  const beforeFlag =
    diagram.textBeforeShowData.at(-1)?.range[1] ?? keyword.range[1]
  const end = diagram.showData
    ? expectToken(findStructuralToken(source, beforeFlag), "showData").range[1]
    : keyword.range[1]
  const atoms = collectAtoms(
    source,
    keyword.range[0],
    end,
    diagram.textBeforeShowData,
    [],
  )
  const rules = new Map<number, GapRule>()
  if (diagram.showData) rules.set(atoms.at(-1)!.start, "space")
  return protectHiddenGaps(
    {
      atoms,
      rules,
      outdented: new Set(),
      lineBreaks: "kept",
    },
    diagram.textBeforeShowData,
  )
}

/**
 * Pie line values never read the next physical line, unlike graph/C4 values
 * (diagrams/pie.md, Composite common forms; docs/pie.md, Accessibility lines).
 * Shared colon and description layouts still decide their exterior spacing.
 */
export function layoutPieStatement(
  source: Source,
  statement: PieBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  const values = collectValueNodes(statement, pieValueNodeTypes)
  const rules = new Map<number, GapRule>()
  let layout: AtomLayout
  switch (statement.type) {
    case "PieIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "PieAccDescrBlockStatement": {
      const after = statement.textAfter.at(0)?.range[0] ?? end
      const closing = findTokensBetween(source, start, after).findLast(
        (token) => isStructural(source, token) && token.value === "}",
      )
      const blockEnd = expectToken(closing, "the pie description closer")
        .range[1]
      const block = {
        ...statement,
        range: [start, blockEnd] as [number, number],
        textAfter: [],
      }
      layout = layoutDescriptionBlock(
        source,
        block,
        blockEnd,
        pieValueNodeTypes,
        {
          compactEmpty: true,
          keepsTrailingTrivia: true,
          formatsEmptyTrivia: true,
        },
      )
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
      break
    }
    case "PieSectionStatement": {
      const colonStart =
        statement.textBeforeColon.at(-1)?.range[1] ?? statement.label.range[1]
      const colon = expectToken(
        findStructuralToken(source, colonStart),
        "the section colon",
      )
      expectValue(colon, ":")
      rules.set(colon.range[0], "space")
      rules.set(statement.value.range[0], "space")
      layout = {
        atoms: collectAtoms(source, start, end, values, []),
        rules,
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    }
    case "PieTitleStatement":
    case "PieAccTitleStatement":
    case "PieAccDescrStatement": {
      const keyword = expectToken(
        findStructuralToken(source, start),
        "the common keyword",
      )
      const delimiter =
        statement.type === "PieTitleStatement"
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
      const lineRules =
        statement.type === "PieTitleStatement"
          ? new Map<number, GapRule>()
          : accessibilityRules(source, {
              range: statement.range,
              value: printedValue,
            })
      if (printedValue !== null)
        lineRules.set(valueStart, hasTrivia ? "none" : "space")
      // Collect only the keyword/delimiter and the trimmed value. The original
      // RawText token includes padding and must not be collected a second time.
      layout = {
        atoms: [
          ...collectAtoms(source, start, delimiter.range[1], [], []),
          ...(printedValue === null
            ? []
            : [{ start: valueStart, end: valueEnd }]),
          ...statement.textAfter.map((item) => ({
            start: item.range[0],
            end: item.range[1],
          })),
        ],
        rules: lineRules,
        outdented: new Set(),
        lineBreaks: "kept",
        // Common line-value edges trim Unicode whitespace too. Pie never
        // reads a next-line value (docs/pie.md, Line terminators and unicode).
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
      break
    }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown pie item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  const hidden =
    statement.type === "PieIgnoredText"
      ? []
      : values.filter(
          (value): value is PieIgnoredText => value.type === "PieIgnoredText",
        )
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(source, start, end, layout.atoms),
    },
    hidden,
  )
}

/**
 * A hidden token consumes LF outside its node range; moving or trimming that
 * gap can reject pie (diagrams/pie.md, Hidden YAML / Hidden DIRECTIVE;
 * docs/pie.md, Hidden yaml and Hidden directives).
 */
function protectHiddenGaps(
  layout: AtomLayout,
  hidden: readonly PieIgnoredText[],
): AtomLayout {
  const writtenGapsBefore = new Set<number>()
  for (const item of hidden) {
    const next = layout.atoms.find((atom) => atom.start >= item.range[1])
    if (next !== undefined) writtenGapsBefore.add(next.start)
  }
  return { ...layout, writtenGapsBefore }
}
