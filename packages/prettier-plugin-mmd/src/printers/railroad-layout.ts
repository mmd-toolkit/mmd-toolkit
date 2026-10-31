import type {
  Node,
  RailroadBodyItem,
  RailroadDiagram,
  RailroadExpression,
  RailroadIgnoredText,
  RailroadRule,
} from "@mmd-toolkit/parser"
import type { Doc } from "prettier"
import { builders } from "prettier/doc"
import type { AtomLayout, GapRule } from "./atoms.ts"
import type { ItemRun } from "./gap.ts"
import { readGap } from "./gap.ts"
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
  expectValue,
  layoutKeywordHeader,
  keptAsWritten,
  layoutOnVerbatimStyleLine,
  protectSemicolonPrefixes,
  walk,
} from "./layout.ts"
import type { Source } from "./source.ts"
import { printAsWritten, withLeading, withTrailing } from "./lines.ts"
import {
  findStructuralToken,
  findTokenStartingAt,
  findTokenEndingBefore,
  findTokensBetween,
  findTriviaBetween,
} from "./source.ts"

const {
  group,
  hardline,
  ifBreak,
  indent,
  line,
  literalline,
  markAsRoot,
  softline,
} = builders

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
  // The shared word-line guard above protects actual line-rule selections.
  // Ordinary IR values can contain semicolons without freezing their calls.
  const wrapsCalls =
    statement.type === "RailroadRule" &&
    source.root.diagramType === "railroad" &&
    hidden.length === 0 &&
    !findTokensBetween(source, start, end).some((token) =>
      source.ignoredSemicolons.has(token.range[0]),
    )
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
        wrapsCalls,
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
      atoms: wrapsCalls
        ? layout.atoms
        : protectSemicolonPrefixes(
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
  wrapsCalls: boolean,
): AtomLayout {
  const [start, end] = statement.range
  const hasTextualSemicolon = source.text
    .slice(start, end)
    .split("")
    .some(
      (character, index) =>
        character === ";" && !grammaticalSemicolons.has(start + index),
    )
  // Textual semicolons retain their source segments; ordinary required
  // terminators alone do not prevent structural padding from joining.
  if (
    !wrapsCalls &&
    source.text.slice(start, end).includes("\n") &&
    (hasTextualSemicolon ||
      findSemicolonLines(source).has(lineStartOf(source, end - 1)))
  )
    return keptAsWritten(start, end)
  // Native IR padding is independent of columns. Only ordinary gaps take
  // width-based call layout; hidden forms and protected segments keep
  // their existing atom path (diagrams/railroad.md, IR grammar;
  // docs/railroad.md, Long lines).
  const atoms = collectAtoms(source, start, end, values, [
    ...(wrapsCalls
      ? [
          {
            start: statement.definition.range[0],
            end: statement.definition.range[1],
            doc: printCall(source, statement.definition),
          },
        ]
      : []),
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

/** Width-dependent IR calls retain each authored constructor and value. */
function printCall(source: Source, expression: RailroadExpression): Doc {
  if (expression.type === "StringLiteral")
    return printAsWritten(source, ...expression.range)
  let arguments_: readonly RailroadExpression[]
  let shouldBreak = false
  let valueCall = false
  switch (expression.type) {
    case "RailroadSequenceCall":
    case "RailroadChoiceCall":
      arguments_ = expression.arguments.map((member) => member.expression)
      shouldBreak =
        expression.arguments.length > 1 &&
        source.text.slice(...expression.range).includes("\n")
      break
    case "RailroadOptionalCall":
    case "RailroadOneOrMoreCall":
    case "RailroadZeroOrMoreCall":
      arguments_ = [expression.element]
      break
    case "RailroadTerminalCall":
      arguments_ = [expression.value]
      valueCall = true
      break
    case "RailroadNonterminalCall":
      arguments_ = [expression.name]
      valueCall = true
      break
    case "RailroadSpecialCall":
      arguments_ = [expression.text]
      valueCall = true
      break
    default:
      throw new Error(
        `prettier-plugin-mmd: ${expression.type} is not an IR call`,
      )
  }
  const keyword = expectToken(
    findTokenStartingAt(source, expression.range[0]),
    "an IR constructor",
  )
  const opening = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "an IR call opening parenthesis",
  )
  expectValue(opening, "(")
  const closing = expectToken(
    findTokenEndingBefore(source, expression.range[1]),
    "an IR call closing parenthesis",
  )
  expectValue(closing, ")")
  const contents: Doc[] = []
  let previousEnd = opening.range[1]
  for (const [index, argument] of arguments_.entries()) {
    if (index > 0) {
      const comma = expectToken(
        findStructuralToken(source, previousEnd),
        "an IR argument comma",
      )
      expectValue(comma, ",")
      contents.push(
        printCallGap(source, previousEnd, comma.range[0], "", "inline"),
        ",",
      )
      previousEnd = comma.range[1]
    }
    contents.push(
      printCallGap(
        source,
        previousEnd,
        argument.range[0],
        valueCall ? "" : index === 0 ? softline : line,
        "leading",
      ),
      printCall(source, argument),
    )
    previousEnd = argument.range[1]
  }
  return group(
    [
      printAsWritten(source, ...keyword.range),
      printCallGap(source, keyword.range[1], opening.range[0], "", "inline"),
      "(",
      indent(contents),
      printCallGap(
        source,
        previousEnd,
        closing.range[0],
        valueCall ? "" : softline,
        "closing",
      ),
      ")",
    ],
    { shouldBreak },
  )
}

/** Native padding permits call breaks; shared gaps retain trivia and its sides. */
function printCallGap(
  source: Source,
  start: number,
  end: number,
  ordinary: Doc,
  placement: "leading" | "inline" | "closing",
): Doc {
  const gap = readGap(source, start, end, true)
  if (gap.trailing === null && gap.lines.length === 0 && gap.leading === null)
    return ordinary
  if (!gap.breaksLine) {
    const run = gap.leading ?? gap.trailing!
    if (placement === "leading")
      return [
        ordinary === "" ? "" : softline,
        ordinary === ""
          ? run.spaceBefore
            ? " "
            : ""
          : ifBreak("", run.spaceBefore ? " " : ""),
        withLeading(run, ""),
      ]
    return [
      withTrailing("", run),
      placement === "closing"
        ? ifBreak(ordinary, run.spaceAfter ? " " : "")
        : run.spaceAfter
          ? " "
          : "",
    ]
  }
  const trivia: Doc[] = [withTrailing("", gap.trailing)]
  let previous = gap.trailing
  for (const item of gap.lines) {
    trivia.push(triviaBreak(previous, item.blankBefore), item.run.doc)
    previous = item.run
  }
  if (gap.leading !== null) {
    trivia.push(triviaBreak(previous, gap.blankAfter), gap.leading.doc)
    previous = gap.leading
  }
  const after =
    placement !== "closing" && gap.leading !== null
      ? gap.leading.spaceAfter
        ? " "
        : ""
      : triviaBreak(previous, gap.leading === null && gap.blankAfter)
  return placement === "closing" ? [indent(trivia), after] : [trivia, after]
}

/** A literal break keeps comment tails while adopting this call's indentation. */
function triviaBreak(previous: ItemRun | null, blank = false): Doc {
  const boundary =
    previous?.endsWithWhitespace === true ? markAsRoot(literalline) : hardline
  return blank ? [boundary, hardline] : boundary
}
