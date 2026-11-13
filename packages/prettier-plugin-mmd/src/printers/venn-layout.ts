import type { Node, Range, VennStatement } from "@mmd-toolkit/ast"
import type { AtomLayout, GapRule } from "./atoms.ts"
import { holdsKeptSemicolon, lineEndOf, lineStartOf } from "./kept-lines.ts"
import {
  collectAtoms,
  collectValueNodes,
  keptAsWritten,
  protectSemicolonPrefixes,
  replaceInAtoms,
  trimBracketedText,
} from "./layout.ts"
import type { TextEdit } from "./layout.ts"
import { trimTextAfterKeyword } from "./statement-rules.ts"
import type { Source } from "./source.ts"
import { findRespellings } from "./spelling.ts"
import {
  findTriviaBetween,
  skipRemoved,
  hasTriviaBesidesTrailingDirectives,
  isSpaceOrTab,
} from "./source.ts"

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

/**
 * The edits that print each run of spaces and tabs between the words of an
 * unquoted value as one space. A run inside parentheses stays: mermaid.js keeps
 * it in the Db (`rgb(1,  2,3)`), where it joins the words outside them.
 */
function findWordRunEdits(source: Source, [start, end]: Range): TextEdit[] {
  const edits: TextEdit[] = []
  let depth = 0
  for (let position = start; position < end;) {
    const read = skipRemoved(source, position)
    if (read !== position) {
      position = read
      continue
    }
    const character = source.text[position]
    if (character === "(") depth++
    else if (character === ")" && depth > 0) depth--
    if (depth > 0 || !isSpaceOrTab(character)) {
      position++
      continue
    }
    let runEnd = position
    while (runEnd < end && isSpaceOrTab(source.text[runEnd])) runEnd++
    if (
      position > start &&
      runEnd < end &&
      !(runEnd - position === 1 && character === " ")
    )
      edits.push({ range: [position, runEnd], replacement: " " })
    position = runEnd
  }
  return edits
}

/** Whether a unit starts with a text statement that has targets. */
export function isExplicitVennTextUnit(unit: VennUnit): boolean {
  const first = unit.statements[0]
  return first.type === "VennTextStatement" && first.targets !== null
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
      hasTriviaBesidesTrailingDirectives(source, start, end))
  )
    return keptAsWritten(start, end)
  const values = collectValueNodes(statement, vennValueNodeTypes)
  let atoms = collectAtoms(source, start, end, values, [])
  // Protect the textual prefix on every semicolon segment, including
  // nonmatches. Folding whole atoms keeps a crossing value exactly once
  // (common.md, Style and classDef lines; docs/venn.md, Line rule and kept lines).
  atoms = protectSemicolonPrefixes(source, start, end, atoms)
  // mermaid.js trims the text of a label in brackets: `[ L ]` is printed `[L]`
  // (docs/venn.md, Labels). A label that is printed in quotes is respelled
  // whole, without the padding.
  if (
    "label" in statement &&
    statement.label !== null &&
    findRespellings(source).get(statement.label.range[0]) === undefined
  ) {
    trimBracketedText(source, atoms, statement.label.range)
  }
  if (statement.type === "VennTitleStatement") {
    trimTextAfterKeyword(source, atoms, statement.value.range, true)
  }
  // mermaid.js joins the words of a value that is not a string with one space,
  // so a run between them is no part of the Db (docs/venn.md, Style
  // properties).
  if (statement.type === "VennStyleStatement") {
    replaceInAtoms(
      source,
      atoms,
      statement.properties.flatMap((property) =>
        property.value.type === "VennLiteral"
          ? findWordRunEdits(source, property.value.range)
          : [],
      ),
    )
  }
  const rules = new Map<number, GapRule>()
  // A comma touches the name before it and is followed by one space, and the
  // colon of a style property is followed by one space too. The colon of a
  // size stands between the declaration and its size, with one space on each
  // side (docs/venn.md, Name lists, Sizes and numbers, and Style properties).
  const sizeStart =
    statement.type === "VennSubsetStatement"
      ? (statement.size?.range[0] ?? null)
      : null
  // The starts of the values that follow a colon: those of the properties of a
  // style, and the size of a set or a union.
  const colonValueStarts = new Set(
    statement.type === "VennStyleStatement"
      ? statement.properties.map((property) => property.value.range[0])
      : sizeStart === null
        ? []
        : [sizeStart],
  )
  // A `;` on the line is read by the line rule of mermaid.js, which ignores
  // it or not by whether whitespace lies between a `:` and a `#`: the gap
  // after the colon of a property or of a size keeps whether it holds
  // whitespace (docs/venn.md, Style properties and Line rule and kept lines).
  const keepsColonGap = holdsKeptSemicolon(
    source,
    start,
    lineEndOf(source, start),
  )
  for (let index = 1; index < atoms.length; index++) {
    const previous = atoms[index - 1]
    const atom = atoms[index]
    const before = source.text.slice(previous.start, previous.end)
    const text = source.text.slice(atom.start, atom.end)
    const afterColon = colonValueStarts.has(atom.start)
    const beforeSizeColon =
      text === ":" && atoms[index + 1]?.start === sizeStart
    rules.set(
      atom.start,
      afterColon
        ? keepsColonGap && skipRemoved(source, previous.end) === atom.start
          ? "none"
          : "space"
        : beforeSizeColon
          ? "space"
          : text === "," ||
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
