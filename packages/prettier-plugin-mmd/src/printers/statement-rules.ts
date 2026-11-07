import type { Node, Range } from "@mmd-toolkit/ast"
import type { Doc } from "prettier"
import type { GapRule } from "./atoms.ts"
import { expectToken, expectValue } from "./layout.ts"
import { holdsKeptSemicolon, lineEndOf, lineStartOf } from "./kept-lines.ts"
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
 * physical/Unicode line boundaries and complete semicolon-sensitive lines on
 * their original path (diagrams/er.md and diagrams/requirement.md, Style context).
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
    !holdsKeptSemicolon(
      source,
      lineStartOf(source, start),
      lineEndOf(source, end),
    ) &&
    findTriviaBetween(source, start, end).length === 0
  )
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
