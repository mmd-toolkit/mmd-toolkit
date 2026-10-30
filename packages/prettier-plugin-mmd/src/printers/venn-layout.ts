import type { Node, Range, VennStatement } from "@mmd-toolkit/parser"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { lineStartOf } from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  keptAsWritten,
  protectSemicolonPrefixes,
} from "./layout.ts"
import type { Source } from "./source.ts"
import { findTriviaBetween } from "./source.ts"

/** Written leaves, including complete bare styles (docs/venn.md, Style properties). */
export const vennValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "Identifier",
  "StringLiteral",
  "NumericLiteral",
  "VennLabel",
  "VennLiteral",
  "VennIgnoredText",
])

/** A declaration and the followers that must not clear its implicit mode. */
export interface VennUnit {
  readonly range: Range
  readonly statements: readonly VennStatement[]
}

/**
 * Group locally, before choosing lines: a line-start follower would clear
 * implicit mode. Swallowed fragments keep their authored line neighbours
 * (diagrams/venn.md, Text and implicit text mode; docs/venn.md,
 * Statements one per line and Comments).
 */
export function groupVennUnits(
  source: Source,
  statements: readonly VennStatement[],
): VennUnit[] {
  const units: VennUnit[] = []
  for (const statement of statements) {
    const previous = units.at(-1)
    const last = previous?.statements.at(-1)
    const followsDeclaration = previous?.statements.some(
      (item) => item.type === "VennSubsetStatement",
    )
    const follower =
      statement.type === "VennStyleStatement" ||
      statement.type === "VennTitleStatement" ||
      (statement.type === "VennTextStatement" && statement.targets !== null)
    if (
      previous !== undefined &&
      last !== undefined &&
      lineStartOf(source, last.range[1] - 1) ===
        lineStartOf(source, statement.range[0]) &&
      ((followsDeclaration && follower) || statement.type === "VennIgnoredText")
    ) {
      units[units.length - 1] = {
        range: [previous.range[0], statement.range[1]],
        statements: [...previous.statements, statement],
      }
    } else units.push({ range: statement.range, statements: [statement] })
  }
  return units
}

/** Only targetless text uses positive indentation; it is a marker, not nesting. */
export function isImplicitVennUnit(unit: VennUnit): boolean {
  const first = unit.statements[0]
  return first.type === "VennTextStatement" && first.targets === null
}

/**
 * Values are indivisible. Punctuation uses the tree's complete name, label,
 * number and style units, never a second lexer (docs/venn.md, Name lists,
 * Labels, Sizes and numbers, Style properties and Title).
 */
export function layoutVennStatement(
  source: Source,
  statement: VennStatement,
): AtomLayout {
  const [start, end] = statement.range
  if (
    statement.type === "VennIgnoredText" ||
    (statement.type === "VennTitleStatement" &&
      findTriviaBetween(source, start, end).length > 0)
  )
    return keptAsWritten(start, end)
  const values = collectValueNodes(statement, vennValueNodeTypes)
  let atoms = collectAtoms(source, start, end, values, [])
  // Protect the textual prefix on every semicolon segment, including
  // nonmatches. Folding whole atoms keeps a crossing value exactly once
  // (common.md, Style and classDef lines; docs/venn.md, Line rule and kept lines).
  atoms = protectSemicolonPrefixes(source, start, end, atoms)
  const rules = new Map<number, GapRule>()
  for (let index = 1; index < atoms.length; index++) {
    const previous = atoms[index - 1]
    const atom = atoms[index]
    const before = source.text.slice(previous.start, previous.end)
    const text = source.text.slice(atom.start, atom.end)
    rules.set(
      atom.start,
      text === "," ||
        text === ":" ||
        before === ":" ||
        ("label" in statement && atom.start === statement.label?.range[0])
        ? "none"
        : "space",
    )
  }
  return {
    atoms,
    rules,
    outdented: new Set(),
    lineBreaks: "kept",
    // A title consumes one separator. Only an ordinary separator may join;
    // trivia or a kept prefix retains its boundary (docs/venn.md, Title).
    ...(statement.type === "VennTitleStatement" &&
    atoms.length === 2 &&
    findTriviaBetween(source, start, end).length === 0
      ? { joinedBefore: new Set([statement.value.range[0]]) }
      : {}),
  }
}
