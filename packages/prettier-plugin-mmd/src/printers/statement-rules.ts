import type { Node, Range } from "@mmd-toolkit/ast"
import type { Doc } from "prettier"
import type { Atom, GapRule } from "./atoms.ts"
import type { TextEdit } from "./layout.ts"
import { expectToken, expectValue, replaceInAtoms } from "./layout.ts"
import { findLinesWithOwnSemicolons, lineStartOf } from "./kept-lines.ts"
import { printAsWritten } from "./lines.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findStructuralTokenEndingBefore,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
} from "./source.ts"

/**
 * The gap rules of the statements that more than one diagram type has in
 * the same form: the lists of classes and names of the style context, the
 * direction line, and the accessibility statements. An ER diagram and a
 * requirement diagram read them with the same units, so they are printed
 * with the same rules (docs/er.md and docs/requirement.md). A rule is
 * stated by the start of the atom after the gap (see `GapRule`).
 */

/**
 * Adds the rules of a list of classes after `:::`: the `:::`, the `,`, and
 * the names touch what is before them. The list lies after `start`.
 */
export function addClassListRules(
  source: Source,
  classes: readonly Node[],
  start: number,
  rules: Map<number, GapRule>,
): void {
  const last = classes.at(-1)
  if (last === undefined) return
  for (const name of classes) rules.set(name.range[0], "none")
  for (const token of findTokensBetween(source, start, last.range[1])) {
    if (
      isStructural(source, token) &&
      (token.value === ":::" || token.value === ",")
    ) {
      rules.set(token.range[0], "none")
    }
  }
}

/**
 * Adds the rules of the class after a `:::`: the `:::` touches what is before
 * it, and the class touches the `:::`, as in `A:::c`.
 */
export function addCssClassRules(
  source: Source,
  cssClass: Node,
  rules: Map<number, GapRule>,
): void {
  const separator = expectToken(
    findStructuralTokenEndingBefore(source, cssClass.range[0]),
    "the `:::` before a class",
  )
  expectValue(separator, ":::")
  rules.set(separator.range[0], "none")
  rules.set(cssClass.range[0], "none")
}

/**
 * Adds the rules of a list of names separated by `,`: the first name stands
 * after one space, and the others touch the `,` before them, which touches
 * the name before it.
 */
export function addNameListRules(
  source: Source,
  names: readonly Node[],
  rules: Map<number, GapRule>,
): void {
  const first = names.at(0)
  const last = names.at(-1)
  if (first === undefined || last === undefined) return
  rules.set(first.range[0], "space")
  for (const name of names.slice(1)) rules.set(name.range[0], "none")
  for (const token of findTokensBetween(
    source,
    first.range[1],
    last.range[0],
  )) {
    if (isStructural(source, token) && token.value === ",") {
      rules.set(token.range[0], "none")
    }
  }
}

/**
 * The rules of a `classDef` or `style` statement: its names are separated by
 * `,` without whitespace, and the first style stands after one space. The
 * default style/comma gaps follow the source. Safe ER and requirement units
 * instead use no space before a comma and one after it (docs/er.md and
 * docs/requirement.md, Styles and classes).
 */
export function styleStatementRules(
  source: Source,
  names: readonly Node[],
  styles: readonly Node[],
  compactStyles = false,
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  addNameListRules(source, names, rules)
  rules.set(styles[0].range[0], "space")
  if (compactStyles) {
    for (let index = 1; index < styles.length; index++) {
      const comma = expectToken(
        findStructuralToken(source, styles[index - 1].range[1]),
        "the comma between styles",
      )
      rules.set(comma.range[0], "none")
      rules.set(styles[index].range[0], "space")
    }
  }
  return rules
}

/** Keep property and value text, changing only the first colon's padding. */
export function printStyleUnitSpacing(source: Source, style: Node): Doc {
  const colon = source.text.indexOf(":", style.range[0])
  if (colon <= style.range[0] || colon >= style.range[1])
    return printAsWritten(source, ...style.range)
  let propertyEnd = colon
  while (
    source.text[propertyEnd - 1] === " " ||
    source.text[propertyEnd - 1] === "\t"
  )
    propertyEnd--
  if (propertyEnd === style.range[0])
    return printAsWritten(source, ...style.range)
  let valueStart = colon + 1
  while (source.text[valueStart] === " " || source.text[valueStart] === "\t")
    valueStart++
  return [
    printAsWritten(source, style.range[0], propertyEnd),
    ":",
    valueStart < style.range[1]
      ? [" ", printAsWritten(source, valueStart, style.range[1])]
      : "",
  ]
}

/**
 * ER and requirement discard simple same-line style-unit padding. Keep trivia,
 * physical/Unicode line boundaries and complete semicolon-sensitive lines (a
 * line that holds a `;` of its own, not one that separates statements and is
 * dropped) on their original path (diagrams/er.md and diagrams/requirement.md, Style context).
 */
export function styleUnitsCanCompact(
  source: Source,
  start: number,
  end: number,
  styles: readonly Node[],
): boolean {
  return (
    styles.every((style) => {
      const text = source.text.slice(...style.range)
      return (
        !text.includes("\n") &&
        !text.includes("\u2028") &&
        !text.includes("\u2029")
      )
    }) &&
    !findLinesWithOwnSemicolons(source).has(lineStartOf(source, start)) &&
    findTriviaBetween(source, start, end).length === 0
  )
}

/**
 * Prints the styles of a `classDef`, `style`, or `linkStyle` statement in the
 * form of ER and requirement: no whitespace before the first `:` of a style,
 * one space after it where the value is not empty, no whitespace before a `,`
 * and one space after it. mermaid.js draws the same figure whatever the
 * whitespace there: it takes the whitespace around the name and the value of a
 * style away before it makes the CSS of the figure (docs/flowchart.md,
 * Styles). The Db keeps the whitespace in the styles, so it changes (see
 * `styleDbForFormattingComparison`). The styles lie in the atoms as written,
 * and the edits are made in the atoms that hold them: where the layout makes
 * each style an atom of its own, the commas between them are the business of
 * the gap rules (see `replaceInAtoms`).
 *
 * `keepsSpaceBeforeFill` is set for a `linkStyle` with link numbers. Where no
 * style of such a statement starts with `fill`, mermaid.js adds `fill:none` to
 * the styles of the link, and a style that starts with whitespace does not
 * start with `fill`, so a style that starts with `fill` keeps whether
 * whitespace stands before it, a run of whitespace becoming one space.
 *
 * A `,` after a backslash is part of a style, and so is a space after a
 * backslash. A statement with a style that is all whitespace, with a line
 * break, a comment or a directive, or on a line with a kept `;` stays as
 * written, as in ER (see `styleUnitsCanCompact`).
 */
export function normalizeStyleList(
  source: Source,
  atoms: Atom[],
  statement: {
    readonly range: Range
    readonly styles: readonly (Node | null)[]
  },
  keepsSpaceBeforeFill = false,
): void {
  const styles = statement.styles.filter((style) => style !== null)
  const first = styles.at(0)
  const last = styles.at(-1)
  if (
    styles.length !== statement.styles.length ||
    first === undefined ||
    last === undefined ||
    !styleUnitsCanCompact(
      source,
      statement.range[0],
      statement.range[1],
      styles,
    )
  ) {
    return
  }
  // The styles are the text between the commas that no backslash escapes.
  const edits: TextEdit[] = []
  const [from, to] = [first.range[0], last.range[1]]
  let previousEnd = -1
  for (let start = from; start <= to;) {
    let comma = start
    while (
      comma < to &&
      (source.text[comma] !== "," || source.text[comma - 1] === "\\")
    )
      comma++
    const core = trimStyle(source, [start, comma])
    if (core[0] === core[1]) return
    addColonEdit(source, core, edits)
    if (previousEnd !== -1) {
      const touchesFill =
        keepsSpaceBeforeFill &&
        core[0] === start &&
        source.text.startsWith("fill", core[0])
      edits.push(
        { range: [previousEnd, start - 1], replacement: "" },
        { range: [start, core[0]], replacement: touchesFill ? "" : " " },
      )
    }
    previousEnd = core[1]
    start = comma + 1
  }
  // An insertion at the edge of an atom is the business of the gap rules.
  replaceInAtoms(
    source,
    atoms,
    edits.filter((edit) =>
      atoms.some((atom) =>
        edit.range[0] === edit.range[1]
          ? atom.start < edit.range[0] && edit.range[0] < atom.end
          : atom.start <= edit.range[0] && edit.range[1] <= atom.end,
      ),
    ),
  )
}

/**
 * Prints the text of a style, from `range[0]` to `range[1]`, with the
 * whitespace around its first `:` as `normalizeStyleList` puts it.
 */
export function printStyleWithColon(source: Source, range: Range): Doc {
  const edits: TextEdit[] = []
  addColonEdit(source, trimStyle(source, range), edits)
  const [edit] = edits
  if (edit === undefined) return printAsWritten(source, ...range)
  return [
    printAsWritten(source, range[0], edit.range[0]),
    edit.replacement,
    printAsWritten(source, edit.range[1], range[1]),
  ]
}

/**
 * The range of a style without the spaces and tabs at its ends, except a
 * space after a backslash.
 */
function trimStyle(source: Source, range: Range): Range {
  let [start, end] = range
  while (start < end && isSpaceOrTab(source.text[start])) start++
  while (
    end > start &&
    isSpaceOrTab(source.text[end - 1]) &&
    source.text[end - 2] !== "\\"
  )
    end--
  return [start, end]
}

/**
 * Adds the edit that takes the whitespace before the first `:` of a style away
 * and puts one space after it, where the value is not empty. A style without
 * a name before the `:`, or with an escaped space before it, stays.
 */
function addColonEdit(
  source: Source,
  [start, end]: Range,
  edits: TextEdit[],
): void {
  const colon = source.text.indexOf(":", start)
  if (colon <= start || colon >= end) return
  let nameEnd = colon
  while (nameEnd > start && isSpaceOrTab(source.text[nameEnd - 1])) nameEnd--
  if (nameEnd === start) return
  if (nameEnd < colon && source.text[nameEnd - 1] === "\\") return
  let valueStart = colon + 1
  while (valueStart < end && isSpaceOrTab(source.text[valueStart])) valueStart++
  edits.push({
    range: [nameEnd, valueStart],
    replacement: valueStart < end ? ": " : ":",
  })
}

/** Whether a character is a space or a tab. */
function isSpaceOrTab(character: string): boolean {
  return character === " " || character === "\t"
}

/**
 * The rules of a `class` statement: the names of the entities and the
 * classes are lists separated by `,` without whitespace, and the first class
 * stands after one space.
 */
export function classStatementRules(
  source: Source,
  names: readonly Node[],
  classes: readonly Node[],
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  addNameListRules(source, names, rules)
  addNameListRules(source, classes, rules)
  return rules
}

/**
 * The rules of a direction line: the text before and after, kept as written,
 * is separated from `direction` by one space where it was written apart, and
 * the value stands after one space.
 */
export function directionRules(
  source: Source,
  statement: { readonly range: Range; readonly textBefore: Node | null },
): Map<number, GapRule> {
  const keyword = expectToken(
    findStructuralToken(
      source,
      statement.textBefore?.range[1] ?? statement.range[0],
    ),
    "`direction`",
  )
  const value = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the value of a direction line",
  )
  return new Map<number, GapRule>([[value.range[0], "space"]])
}

/**
 * The rules of an `accTitle` or `accDescr` line: the `:` touches the keyword
 * and the text stands after one space.
 */
export function accessibilityRules(
  source: Source,
  statement: { readonly range: Range; readonly value: Node | null },
): Map<number, GapRule> {
  const keyword = expectToken(
    findStructuralToken(source, statement.range[0]),
    "`accTitle` or `accDescr`",
  )
  const colon = expectToken(
    findStructuralToken(source, keyword.range[1]),
    "the `:` after `accTitle` or `accDescr`",
  )
  expectValue(colon, ":")
  const rules = new Map<number, GapRule>([[colon.range[0], "none"]])
  if (statement.value !== null) rules.set(statement.value.range[0], "space")
  return rules
}

/**
 * The range from the `(` through the `)` around the arguments of a call, when
 * a comment or a directive stands among them; otherwise null. The whitespace
 * before the `)` is part of the arguments in the Db, and a comment line before
 * the `)` would otherwise indent it, so class and gantt print this range as
 * written (docs/class.md and docs/gantt.md, call arguments).
 */
export function findCallRangeWithTrivia(
  source: Source,
  args: Node,
): Range | null {
  const opening = expectToken(
    findStructuralTokenEndingBefore(source, args.range[0]),
    "the `(` of a call",
  )
  expectValue(opening, "(")
  const closing = expectToken(
    findStructuralToken(source, args.range[1]),
    "the `)` of a call",
  )
  expectValue(closing, ")")
  return findTriviaBetween(source, opening.range[1], closing.range[0]).length >
    0
    ? [opening.range[0], closing.range[1]]
    : null
}
