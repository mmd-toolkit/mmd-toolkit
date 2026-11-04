import type {
  C4AccDescrBlockStatement,
  C4BoundaryStatement,
  C4Diagram,
  C4ElementStatement,
  C4RelationshipStatement,
  C4Statement,
  C4UpdateStatement,
  Node,
  Range,
  Token,
} from "@mmd-toolkit/parser"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { maxOf } from "./collections.ts"
import {
  alignBlockOpeningLine,
  collectAtoms,
  collectValueNodes,
  expectToken,
  indentDescriptionLines,
  keepFirstGapLineTails,
  keptAsWritten,
  layoutDescriptionBlock,
  spansLinesThatCannotJoin,
  spaceDescriptionOpening,
} from "./layout.ts"
import {
  holdsJoiningRegion,
  keptSemicolonPrefixEnd,
  lineStartOf,
  semicolonSegmentEnd,
} from "./kept-lines.ts"
import type { Source } from "./source.ts"
import {
  findTokenEndingBefore,
  findTokenStartingAt,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
  isWhitespace,
} from "./source.ts"
import { accessibilityRules } from "./statement-rules.ts"

/** Written leaves, including number-looking text (docs/c4.md, Argument forms). */
export const c4ValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "C4Literal",
  "StringLiteral",
])

/** A call without its boundary's body. */
type C4Call =
  | C4ElementStatement
  | C4BoundaryStatement
  | C4RelationshipStatement
  | C4UpdateStatement
/** Title and accessibility statements. */
type C4Text = Exclude<C4Statement, C4Call>

/** Statements whose null-block adjacency keeps them on their written lines. */
export interface C4Unit {
  readonly range: Range
  readonly statements: readonly C4Statement[]
}

/**
 * Empty blocks introduce no separator. Group their authored adjacency before
 * the shared block printer chooses statement lines (diagrams/c4.md, Empty
 * description blocks; docs/c4.md, Empty description blocks).
 */
export function groupC4Units(
  source: Source,
  statements: readonly C4Statement[],
): C4Unit[] {
  const units: C4Unit[] = []
  for (const statement of statements) {
    const previous = units.at(-1)
    const last = previous?.statements.at(-1)
    if (
      previous !== undefined &&
      last !== undefined &&
      (isEmptyC4Block(last) || isEmptyC4Block(statement)) &&
      lineStartOf(source, last.range[1] - 1) ===
        lineStartOf(source, statement.range[0])
    ) {
      units[units.length - 1] = {
        range: [previous.range[0], statement.range[1]],
        statements: [...previous.statements, statement],
      }
    } else units.push({ range: statement.range, statements: [statement] })
  }
  return units
}

/** Whether a statement supplies neither a significant statement nor a newline. */
function isEmptyC4Block(statement: C4Statement): boolean {
  return (
    statement.type === "C4AccDescrBlockStatement" && statement.value === null
  )
}

/** The call and body kinds are decided here, exhaustively. */
export function classifyC4Statement(statement: C4Statement):
  | { readonly kind: "boundary"; readonly statement: C4BoundaryStatement }
  | {
      readonly kind: "call"
      readonly statement: Exclude<C4Call, C4BoundaryStatement>
    }
  | {
      readonly kind: "text"
      readonly statement: C4Text
    } {
  switch (statement.type) {
    case "C4BoundaryStatement":
      return { kind: "boundary", statement }
    case "C4ElementStatement":
    case "C4RelationshipStatement":
    case "C4UpdateStatement":
      return { kind: "call", statement }
    case "C4TitleStatement":
    case "C4AccDescriptionStatement":
    case "C4AccTitleStatement":
    case "C4AccDescrStatement":
    case "C4AccDescrBlockStatement":
      return { kind: "text", statement }
    default:
      throw new Error(
        `prettier-plugin-mmd: unknown C4 statement ${JSON.stringify(statement satisfies never)}`,
      )
  }
}

/** The header and its null blocks stay before the required header newline. */
export function layoutC4Header(source: Source, diagram: C4Diagram): AtomLayout {
  const start = diagram.range[0]
  const keyword = expectToken(
    findTokenStartingAt(source, start),
    "the C4 header",
  )
  const end = diagram.beforeBody.at(-1)?.range[1] ?? keyword.range[1]
  const layout: AtomLayout =
    findTriviaBetween(source, start, end).length > 0
      ? keptAsWritten(start, end)
      : {
          atoms: collectAtoms(source, start, end, [], []),
          rules: new Map(),
          outdented: new Set(),
          lineBreaks: "joined",
        }
  return indentC4BeforeBody(source, diagram.beforeBody, layout)
}

/**
 * Null blocks before a body use ordinary description columns without changing
 * their adjacency or line breaks. Protected source stays written (ast/c4.md,
 * C4Diagram and C4BoundaryStatement; docs/c4.md, Empty description blocks).
 */
function indentC4BeforeBody(
  source: Source,
  blocks: readonly C4AccDescrBlockStatement[],
  layout: AtomLayout,
): AtomLayout {
  let aligned = layout
  for (const block of blocks) {
    const text = source.text.slice(...block.range)
    if (text.includes(";") || holdsJoiningRegion(source, ...block.range))
      continue
    aligned = spaceDescriptionOpening(source, block.range[0], aligned)
    if (!text.includes("\n")) continue
    aligned = indentDescriptionLines(
      source,
      { range: block.range, value: block.value, closed: true },
      aligned,
    )
  }
  return aligned
}

/** The boundary braces, outside arguments and beforeBody blocks. */
export function c4BoundaryBraces(
  source: Source,
  statement: C4BoundaryStatement,
): { readonly opening: Token; readonly closing: Token } {
  const lastBeforeBody = statement.beforeBody.at(-1)
  const afterArguments = Math.max(
    statement.range[0],
    maxOf(statement.arguments.map((argument) => argument?.range[1] ?? 0)),
  )
  const opening = expectToken(
    findTokensBetween(
      source,
      lastBeforeBody?.range[1] ?? afterArguments,
      statement.body[0].range[0],
    ).find((token) => isStructural(source, token) && token.value === "{"),
    "the opening brace of a C4 boundary",
  )
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the closing brace of a C4 boundary",
  )
  return { opening, closing }
}

/**
 * Lays out a call or boundary head from AST argument units. A bare prefix
 * can select bare rather than string/named lexing; whitespace-only bare
 * units have no node but still occupy a slot. Keep both facts through the
 * spacing decision (diagrams/c4.md, The keyword and argument contexts;
 * docs/c4.md, Argument spacing and Empty entries).
 */
export function layoutC4Call(
  source: Source,
  statement: C4Call,
  end: number,
): AtomLayout {
  const start = statement.range[0]
  const opening = findTokenEndingBefore(source, end)
  if (statement.type === "C4BoundaryStatement" && opening?.value === "{") {
    const previous = expectToken(
      findTokensBetween(source, start, opening.range[0]).findLast(
        (token) => token.type !== "Directive",
      ),
      "the end of a C4 boundary call",
    )
    const gap = source.text.slice(previous.range[1], opening.range[0])
    if (
      gap.includes("\n") &&
      gap.trim() === "" &&
      !gap.includes("\u2028") &&
      !gap.includes("\u2029") &&
      findTriviaBetween(source, previous.range[1], opening.range[0]).length ===
        0
    ) {
      // The brace is structural whitespace after the complete call, even
      // when a semicolon keeps the call's own text or the first child line.
      const head = layoutC4Call(source, statement, previous.range[1])
      return alignBlockOpeningLine(
        source,
        {
          ...head,
          atoms: [...head.atoms, { start: opening.range[0], end }],
          rules: new Map([...head.rules, [opening.range[0], "space"]]),
          joinedBefore: new Set([
            ...(head.joinedBefore ?? []),
            opening.range[0],
          ]),
        },
        previous.range[0],
      )
    }
  }
  // Structural LF and trivia stay in their gaps. Only textual semicolon
  // segments need the whole multiline call kept (diagrams/c4.md, Directives
  // inside units; docs/c4.md, Argument spacing and Line rule and semicolons).
  if (spansLinesThatCannotJoin(source, start, end, { ignoresTrivia: true })) {
    return keptAsWritten(start, end)
  }
  const values = collectValueNodes(statement, c4ValueNodeTypes).filter(
    (value) => value.range[1] <= end,
  )
  const namedAttributes = statement.arguments.filter(
    (argument) => argument?.type === "C4NamedAttribute",
  )
  const stretches = findC4CallStretches(source, statement, end, values)
  const atoms = splitC4EmptyEntryTokens(
    source,
    collectAtoms(source, start, end, values, stretches),
  )
  const rules = new Map<number, GapRule>()
  const outdented = new Set<number>()
  const joinedBefore = new Set<number>()
  const keptBreaksBefore = new Set<number>()
  const bareStarts = new Set<number>()
  const bareEnds = new Set<number>()
  for (const argument of statement.arguments) {
    if (argument?.type !== "C4Literal") continue
    bareStarts.add(argument.range[0])
    bareEnds.add(argument.range[1])
  }
  for (let index = 1; index < atoms.length; index++) {
    const previous = atoms[index - 1]
    const atom = atoms[index]
    const before = source.text.slice(previous.start, previous.end)
    const text = source.text.slice(atom.start, atom.end)
    const gap = source.text.slice(previous.end, atom.start)
    const sensitivePrefix =
      bareStarts.has(atom.start) &&
      (text.startsWith('"') || text.startsWith("$"))
    const afterDelimiter = before === "(" || before.endsWith(",")
    const beforeComma = text.startsWith(",")
    // Preserve null units, adjacent-unit gaps and physical-line shielding.
    const inBeforeBody =
      statement.type === "C4BoundaryStatement" &&
      statement.beforeBody.some(
        (block) => block.range[0] <= atom.start && atom.end <= block.range[1],
      )
    const afterCall =
      statement.type === "C4BoundaryStatement" &&
      atom.start >= (statement.beforeBody[0]?.range[0] ?? end - 1)
    // Named keys and strings remain values. Their exterior gaps retain LF
    // without retaining columns or moving direction text onto the call line
    // (diagrams/c4.md, Direction rejection; docs/c4.md, Named attributes).
    const namedGap = namedAttributes.some(
      (argument) =>
        argument.range[0] <= previous.start && atom.end <= argument.range[1],
    )
    if (namedGap && gap.includes("\n")) keptBreaksBefore.add(atom.start)
    const keepsPhysicalLine = gap.includes("\n") && !afterCall && !namedGap
    const keepsCommaGap =
      beforeComma && !bareEnds.has(previous.end) && before !== "("
    const keepsAdjacentUnits =
      !inBeforeBody &&
      !afterCall &&
      !afterDelimiter &&
      !beforeComma &&
      before !== "$" &&
      text !== "=" &&
      before !== "=" &&
      text !== "{"
    if (
      keepsPhysicalLine ||
      sensitivePrefix ||
      keepsCommaGap ||
      keepsAdjacentUnits
    ) {
      if (gap !== "") atoms[index] = { start: previous.end, end: atom.end }
      rules.set(previous.end, "none")
      continue
    }
    if (
      afterCall &&
      findTriviaBetween(source, previous.end, atom.start).length === 0
    )
      joinedBefore.add(atom.start)
    if (text === "{" && atom.end === end) {
      outdented.add(atom.start)
      rules.set(atom.start, "space")
    } else if (afterDelimiter)
      rules.set(
        atom.start,
        before !== "(" && text !== ")" && !beforeComma ? "space" : "none",
      )
    else if (namedGap && (text === "=" || before === "="))
      rules.set(atom.start, "space")
    else if (
      beforeComma ||
      text === ")" ||
      before === "$" ||
      text === "=" ||
      before === "="
    )
      rules.set(atom.start, "none")
  }
  const layout = indentC4BeforeBody(
    source,
    statement.type === "C4BoundaryStatement" ? statement.beforeBody : [],
    {
      atoms,
      rules,
      outdented,
      lineBreaks: "kept",
      joinedBefore,
      keptBreaksBefore,
    },
  )
  return statement.type === "C4BoundaryStatement" && opening?.value === "{"
    ? alignBlockOpeningLine(source, layout, opening.range[0])
    : layout
}

/**
 * Preserve semicolon-bearing null blocks and textual line prefixes through
 * their last semicolon. A prefix can cross a value, which must stay whole
 * (common.md, Style and classDef lines; docs/c4.md, Line rule and semicolons).
 */
function findC4CallStretches(
  source: Source,
  statement: C4Call,
  end: number,
  values: readonly Node[],
): Atom[] {
  const start = statement.range[0]
  const kept: Atom[] = []
  if (statement.type === "C4BoundaryStatement") {
    for (const block of statement.beforeBody) {
      if (source.text.slice(...block.range).includes(";")) {
        kept.push({ start: block.range[0], end: block.range[1] })
      }
    }
  }
  for (let line = lineStartOf(source, start); line < end;) {
    const lineEnd = semicolonSegmentEnd(source, line)
    const last = source.text.lastIndexOf(";", Math.min(end, lineEnd) - 1)
    if (last >= Math.max(start, line)) {
      let from = Math.max(start, line)
      let to = last + 1
      for (const value of values) {
        if (value.range[0] < to && from < value.range[1]) {
          from = Math.min(from, value.range[0])
          to = Math.max(to, value.range[1])
        }
      }
      kept.push({ start: from, end: to })
    }
    line = lineEnd + 1
  }
  // Prefixes can overlap through values; collectAtoms needs one whole atom.
  kept.sort((left, right) => left.start - right.start)
  const stretches: Atom[] = []
  for (const stretch of kept) {
    const previous = stretches.at(-1)
    if (previous !== undefined && stretch.start <= previous.end) {
      stretches[stretches.length - 1] = {
        start: previous.start,
        end: Math.max(previous.end, stretch.end),
      }
    } else stretches.push(stretch)
  }
  return stretches
}

/** Expose the padding in an opening empty-entry token (tokens/c4.md). */
function splitC4EmptyEntryTokens(
  source: Source,
  atoms: readonly Atom[],
): Atom[] {
  const split: Atom[] = []
  for (const atom of atoms) {
    const token = findTokenStartingAt(source, atom.start)
    if (
      token?.type === "Punctuator" &&
      token.value.startsWith("(") &&
      token.value.endsWith(",")
    ) {
      split.push({ start: atom.start, end: atom.start + 1 })
      split.push({ start: atom.end - 1, end: atom.end })
    } else split.push(atom)
  }
  return split
}

/**
 * Title separators consume one character, unlike colon text. A multiline
 * text statement keeps its physical lines if joining would expose a
 * direction lookahead; keeping all such continuations avoids rescanning
 * values (diagrams/c4.md, Direction rejection; docs/c4.md, Direction rejection).
 */
export function layoutC4Text(source: Source, statement: C4Text): AtomLayout {
  const [start, end] = statement.range
  if (keptSemicolonPrefixEnd(source, start) > start)
    return keptAsWritten(start, end)
  if (statement.type === "C4AccDescrBlockStatement") {
    if (source.text.slice(start, end).includes(";"))
      return keptAsWritten(start, end)
    // Ordinary block spacing and closing-brace alignment follow the sibling
    // diagrams. The shared layout aligns body lines and the closer while
    // preserving interior edge contacts (diagrams/c4.md, Title
    // and accessibility statements; docs/c4.md, Description blocks).
    return layoutDescriptionBlock(source, statement, end, c4ValueNodeTypes, {
      keepsTrailingTrivia: true,
    })
  }
  if (
    source.text.slice(start, end).includes("\n") &&
    c4DirectionIn(statement.value?.value ?? "")
  )
    return keptAsWritten(start, end)
  if (
    statement.type === "C4AccTitleStatement" ||
    statement.type === "C4AccDescrStatement"
  ) {
    const keepsLineBreaks = spansLinesThatCannotJoin(source, start, end)
    // Colon forms trim exterior whitespace; their structural trivia gaps
    // can align while retained LF still shields direction text. Native
    // title forms below instead own their additional separator whitespace
    // (diagrams/c4.md, Title and accessibility contexts; docs/c4.md,
    // Accessibility lines and Direction rejection).
    if (
      holdsJoiningRegion(source, start, end) ||
      spansLinesThatCannotJoin(source, start, end, { ignoresTrivia: true })
    )
      return keptAsWritten(start, end)
    const atoms = collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, c4ValueNodeTypes),
      [],
    )
    return {
      atoms: keepsLineBreaks ? keepFirstGapLineTails(source, atoms) : atoms,
      rules:
        statement.value === null
          ? new Map()
          : accessibilityRules(source, {
              range: statement.range,
              value: statement.value,
            }),
      outdented: new Set(),
      lineBreaks: keepsLineBreaks ? "kept" : "joined",
    }
  }
  if (
    findTriviaBetween(source, start, end).length > 0 ||
    spansLinesThatCannotJoin(source, start, end)
  )
    return keptAsWritten(start, end)
  const keyword = expectToken(
    findTokenStartingAt(source, start),
    "a C4 title keyword",
  )
  const separator = keyword.range[1]
  if (
    source.text[separator] === "\u2028" ||
    source.text[separator] === "\u2029"
  )
    return keptAsWritten(start, end)
  return {
    atoms: [
      { start, end: separator },
      { start: separator + 1, end },
    ],
    rules: new Map([[separator + 1, "space"]]),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/**
 * C4's lookahead uses exact case and no word boundaries, with whitespace
 * allowed before the direction (diagrams/c4.md, Direction rejection).
 */
function c4DirectionIn(text: string): boolean {
  let from = text.indexOf("direction")
  while (from !== -1) {
    const after = from + "direction".length
    let next = after
    while (next < text.length && isWhitespace(text[next])) next++
    if (
      next > after &&
      ["TB", "BT", "RL", "LR"].includes(text.slice(next, next + 2))
    )
      return true
    from = text.indexOf("direction", from + 1)
  }
  return false
}
