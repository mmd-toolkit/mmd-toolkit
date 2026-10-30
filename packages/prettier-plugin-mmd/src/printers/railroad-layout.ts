import type {
  Node,
  RailroadBodyItem,
  RailroadDiagram,
  RailroadIgnoredText,
  RailroadRule,
} from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { layoutCommonDescription, layoutCommonLine } from "./common-layout.ts"
import { protectHiddenGaps } from "./hidden-forms.ts"
import {
  findSemicolonLines,
  grammaticalSemicolonsOf,
  lineStartOf,
} from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  layoutKeywordHeader,
  keptAsWritten,
  layoutOnVerbatimStyleLine,
  protectSemicolonPrefixes,
  walk,
} from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTriviaBetween,
} from "./source.ts"

/** Written text leaves retain spelling, quotes and physical value columns. */
export const railroadValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "RailroadLiteral",
  "RailroadIgnoredText",
  "RailroadSpecialSequence",
  "RailroadNumericValue",
])

/** The first atom starts at the selected dialect's authored header keyword. */
export function layoutRailroadHeader(
  source: Source,
  diagram: RailroadDiagram,
): AtomLayout {
  return layoutKeywordHeader(
    source,
    expectToken(
      findStructuralToken(
        source,
        diagram.textBeforeHeader.at(-1)?.range[1] ?? diagram.range[0],
      ),
      "the railroad header",
    ),
  )
}

/**
 * The AST already distinguishes dialect-specific expressions and token
 * spellings. Common metadata uses the shared layouts (diagrams/railroad.md,
 * Grammar; docs/railroad.md, Assignment, Choices and Component newlines).
 */
export function layoutRailroadStatement(
  source: Source,
  statement: RailroadBodyItem,
): AtomLayout {
  const [start, end] = statement.range
  // A statement crossing a kept line cannot join either neighboring line.
  // The shared block printer also keeps every same-line sibling and trivia
  // (docs/railroad.md, Semicolons).
  const verbatim = layoutOnVerbatimStyleLine(source, start, end)
  if (verbatim !== null) return verbatim
  const values = collectValueNodes(statement, railroadValueNodeTypes)
  const hidden = values.filter(
    (value): value is RailroadIgnoredText =>
      value.type === "RailroadIgnoredText",
  )
  const grammaticalSemicolons = grammaticalSemicolonsOf(source)
  let layout: AtomLayout
  switch (statement.type) {
    case "RailroadIgnoredText":
      layout = {
        atoms: [{ start, end }],
        rules: new Map(),
        outdented: new Set(),
        lineBreaks: "kept",
      }
      break
    case "RailroadTitleStatement":
    case "RailroadAccTitleStatement":
    case "RailroadAccDescrStatement":
      layout = layoutCommonLine(
        source,
        statement,
        statement.type === "RailroadTitleStatement",
      )
      break
    case "RailroadAccDescrBlockStatement":
      layout = layoutCommonDescription(
        source,
        statement,
        railroadValueNodeTypes,
      )
      break
    case "RailroadRule":
      layout = layoutRule(
        source,
        statement,
        values,
        hidden,
        grammaticalSemicolons,
      )
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown railroad item ${JSON.stringify(statement satisfies never)}`,
      )
  }
  return protectHiddenGaps(
    {
      ...layout,
      atoms: protectSemicolonPrefixes(
        source,
        start,
        end,
        layout.atoms,
        grammaticalSemicolons,
      ),
    },
    hidden,
  )
}

/**
 * Calls, groups, postfixes, predicates and repeats attach; binary separators
 * and sequence members separate. Values are indivisible atoms, so question
 * marks in a special sequence never become postfixes (docs/railroad.md,
 * Groups, Postfixes, Predicates, Repeats, Calls and Special sequences).
 */
function layoutRule(
  source: Source,
  statement: RailroadRule,
  values: readonly Node[],
  hidden: readonly RailroadIgnoredText[],
  grammaticalSemicolons: ReadonlySet<number>,
): AtomLayout {
  const [start, end] = statement.range
  // Textual semicolons retain their source segments; ordinary required
  // terminators alone do not prevent structural padding from joining.
  if (
    source.text.slice(start, end).includes("\n") &&
    (source.text
      .slice(start, end)
      .split("")
      .some(
        (character, index) =>
          character === ";" && !grammaticalSemicolons.has(start + index),
      ) ||
      findSemicolonLines(source).has(lineStartOf(source, end - 1)))
  )
    return keptAsWritten(start, end)
  const atoms = collectAtoms(source, start, end, values, [
    { start: end - 1, end },
  ])
  const rules = new Map<number, GapRule>()
  const outdented = new Set<number>([end - 1])
  const joinedBefore = new Set<number>()
  const binary = new Set(["=", "::=", "<-", "|", "/", "-"])
  for (const [index, atom] of atoms.entries()) {
    const previous = atoms[index - 1]
    if (previous === undefined) continue
    const token = findTokenStartingAt(source, atom.start)
    const before = findTokenStartingAt(source, previous.start)
    rules.set(
      atom.start,
      (token?.type === "Punctuator" && binary.has(token.value)) ||
        (before?.type === "Punctuator" &&
          (binary.has(before.value) || before.value === ","))
        ? "space"
        : "none",
    )
    if (
      token?.type === "Punctuator" &&
      (token.value === ")" || token.value === "]" || token.value === "}")
    )
      outdented.add(atom.start)
    if (
      findTriviaBetween(source, previous.end, atom.start).length === 0 &&
      !hidden.some(
        (item) =>
          item.range[0] === atom.start || item.range[1] === previous.end,
      )
    )
      joinedBefore.add(atom.start)
  }
  walk(statement, (node) => {
    if (node.type !== "RailroadSequenceExpression") return
    for (const member of node.elements.slice(1))
      rules.set(member.range[0], "space")
  })
  return { atoms, rules, outdented, joinedBefore, lineBreaks: "kept" }
}
