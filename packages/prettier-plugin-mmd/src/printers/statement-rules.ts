import type { Node, Range } from "@mmd-toolkit/parser"
import type { GapRule } from "./atoms.ts"
import { expectToken, expectValue } from "./layout.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokensBetween,
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
 * styles are printed as written, and the whitespace between them and the `,`
 * is as in the source.
 */
export function styleStatementRules(
  source: Source,
  names: readonly Node[],
  styles: readonly Node[],
): Map<number, GapRule> {
  const rules = new Map<number, GapRule>()
  addNameListRules(source, names, rules)
  rules.set(styles[0].range[0], "space")
  return rules
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
