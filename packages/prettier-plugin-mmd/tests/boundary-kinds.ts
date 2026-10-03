/**
 * The boundaries of the fixtures that the generated tests put text at, chosen
 * by kind, so that every kind that the fixtures have is covered, and none is
 * covered by chance. The kinds are defined in `@mmd-toolkit/tests`
 * (`findBoundaries` and `selectByKey`, docs/boundary-kinds.md there); this
 * module only gives each boundary its fixture and the key that these tests
 * use: the element before, where it stands in its line, and the element after,
 * with the statement of the line at a line end only.
 */
import type { Fixture, TextBoundary } from "@mmd-toolkit/tests"
import {
  findBoundaries as findTextBoundaries,
  selectByKey,
} from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"

/** A boundary of a fixture, with its kind. */
export interface Boundary extends TextBoundary {
  readonly fixture: Fixture
}

/** The kind of a boundary, as a text: `before | position | after`. */
export function kindOf(boundary: TextBoundary): string {
  const where =
    boundary.position === "lineEnd"
      ? `lineEnd of ${boundary.statement}`
      : boundary.position
  return `${boundary.before} | ${where} | ${boundary.after}`
}

/** The boundaries of a fixture that the parser accepts. */
export function findBoundaries(fixture: Fixture): Boundary[] {
  const text = fixture.input
  try {
    const { tokens, comments, directives } = parse(text)
    return findTextBoundaries({ text, tokens, comments, directives }).map(
      (boundary) => ({ ...boundary, fixture }),
    )
  } catch {
    return []
  }
}

/**
 * Takes up to `perKind` boundaries of each kind, from different fixtures
 * where there are several (see `selectByKey`).
 */
export function selectBoundaries(
  fixtures: readonly Fixture[],
  perKind: number,
): Map<string, Boundary[]> {
  return selectByKey(fixtures.map(findBoundaries), perKind, kindOf)
}
