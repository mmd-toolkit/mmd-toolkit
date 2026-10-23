import type {
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
import {
  collectAtoms,
  collectValueNodes,
  expectToken,
  keptAsWritten,
  layoutDescriptionBlock,
  spansLinesThatCannotJoin,
} from "./layout.ts"
import {
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
  if (findTriviaBetween(source, start, end).length > 0)
    return keptAsWritten(start, end)
  return {
    atoms: collectAtoms(source, start, end, [], []),
    rules: new Map(),
    outdented: new Set(),
    lineBreaks: "joined",
  }
}

/** The boundary braces, outside arguments and beforeBody blocks. */
export function c4BoundaryBraces(
  source: Source,
  statement: C4BoundaryStatement,
): { readonly opening: Token; readonly closing: Token } {
  const lastBeforeBody = statement.beforeBody.at(-1)
  const afterArguments = Math.max(
    statement.range[0],
    ...statement.arguments.map((argument) => argument?.range[1] ?? 0),
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
      findTokenEndingBefore(source, opening.range[0]),
      "the end of a C4 boundary call",
    )
    const gap = source.text.slice(previous.range[1], opening.range[0])
    if (
      gap.includes("\n") &&
      gap.trim() === "" &&
      !gap.includes("\u2028") &&
      !gap.includes("\u2029") &&
      findTriviaBetween(source, start, end).length === 0
    ) {
      // The brace is structural whitespace after the complete call, even
      // when a semicolon keeps the call's own text or the first child line.
      const head = layoutC4Call(source, statement, previous.range[1])
      return {
        ...head,
        atoms: [...head.atoms, { start: opening.range[0], end }],
        rules: new Map([...head.rules, [opening.range[0], "space"]]),
        joinedBefore: new Set([...(head.joinedBefore ?? []), opening.range[0]]),
      }
    }
  }
  if (
    findTriviaBetween(source, start, end).length > 0 ||
    spansLinesThatCannotJoin(source, start, end)
  ) {
    return keptAsWritten(start, end)
  }
  const values = collectValueNodes(statement, c4ValueNodeTypes).filter(
    (value) => value.range[1] <= end,
  )
  const kept: Atom[] = []
  if (statement.type === "C4BoundaryStatement") {
    for (const block of statement.beforeBody) {
      if (source.text.slice(...block.range).includes(";")) {
        kept.push({ start: block.range[0], end: block.range[1] })
      }
    }
  }
  for (const argument of statement.arguments) {
    if (
      argument?.type === "C4NamedAttribute" &&
      source.text.slice(...argument.range).includes("\n")
    ) {
      kept.push({ start: argument.range[0], end: argument.range[1] })
    }
  }
  // The line rule is textual, so the prefix through the last semicolon is
  // opaque even when the semicolon is inside a value (common.md, Style and
  // classDef lines; docs/c4.md, Line rule and semicolons). A value stays whole.
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
  // Kept named attributes and line prefixes can overlap; they are one atom.
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
  const atoms = collectAtoms(source, start, end, values, stretches).flatMap(
    (atom) => {
      const token = findTokenStartingAt(source, atom.start)
      // The opening empty-entry token includes its ASCII padding (tokens/c4.md).
      return token?.type === "Punctuator" &&
        token.value.startsWith("(") &&
        token.value.endsWith(",")
        ? [
            { start: atom.start, end: atom.start + 1 },
            { start: atom.end - 1, end: atom.end },
          ]
        : [atom]
    },
  )
  const rules = new Map<number, GapRule>()
  const joinedBefore = new Set<number>()
  const bareStarts = new Set(
    statement.arguments
      .filter((argument) => argument?.type === "C4Literal")
      .map((argument) => argument.range[0]),
  )
  const bareEnds = new Set(
    statement.arguments
      .filter((argument) => argument?.type === "C4Literal")
      .map((argument) => argument.range[1]),
  )
  for (let index = 1; index < atoms.length; index++) {
    const previous = atoms[index - 1]
    const atom = atoms[index]
    const before = source.text.slice(previous.start, previous.end)
    const text = source.text.slice(atom.start, atom.end)
    const gap = source.text.slice(previous.end, atom.start)
    const bare = bareStarts.has(atom.start)
    const sensitivePrefix =
      bare && (text.startsWith('"') || text.startsWith("$"))
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
    if (
      (gap.includes("\n") && !afterCall) ||
      sensitivePrefix ||
      (beforeComma && !bareEnds.has(previous.end) && before !== "(") ||
      (!inBeforeBody &&
        !afterCall &&
        !afterDelimiter &&
        !beforeComma &&
        before !== "$" &&
        text !== "=" &&
        before !== "=" &&
        text !== "{")
    ) {
      if (gap !== "") atoms[index] = { start: previous.end, end: atom.end }
      rules.set(previous.end, "none")
      continue
    }
    if (afterCall) joinedBefore.add(atom.start)
    if (text === "{" && atom.end === end) rules.set(atom.start, "space")
    else if (afterDelimiter)
      rules.set(
        atom.start,
        before !== "(" && text !== ")" && !beforeComma ? "space" : "none",
      )
    else if (
      beforeComma ||
      text === ")" ||
      before === "$" ||
      text === "=" ||
      before === "="
    )
      rules.set(atom.start, "none")
  }
  return {
    atoms,
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
    joinedBefore,
  }
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
    if (
      findTriviaBetween(source, start, end).some(
        (item) => item.type === "Directive",
      ) ||
      source.text.slice(start, end).includes(";")
    )
      return keptAsWritten(start, end)
    const layout = layoutDescriptionBlock(
      source,
      statement,
      end,
      c4ValueNodeTypes,
      { keepsTrailingTrivia: true },
    )
    // Ordinary block spacing and closing-brace alignment follow the sibling
    // diagrams. The shared layout keeps value/comment columns and aligns the
    // closer; absent token-gap whitespace is not added (diagrams/c4.md, Title
    // and accessibility statements; docs/c4.md, Description blocks).
    return layout
  }
  if (
    findTriviaBetween(source, start, end).length > 0 ||
    spansLinesThatCannotJoin(source, start, end) ||
    (source.text.slice(start, end).includes("\n") &&
      c4DirectionIn(statement.value?.value ?? ""))
  )
    return keptAsWritten(start, end)
  if (
    statement.type === "C4TitleStatement" ||
    statement.type === "C4AccDescriptionStatement"
  ) {
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
  return {
    atoms: collectAtoms(
      source,
      start,
      end,
      collectValueNodes(statement, c4ValueNodeTypes),
      [],
    ),
    rules:
      statement.value === null
        ? new Map()
        : accessibilityRules(source, {
            range: statement.range,
            value: statement.value,
          }),
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
