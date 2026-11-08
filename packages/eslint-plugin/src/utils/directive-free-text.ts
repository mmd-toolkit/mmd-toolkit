import type { Directive, Range } from "@mmd-toolkit/ast"
import type { MermaidSourceCode } from "../source-code.ts"

/**
 * The directives that overlap `start` to `end`. `Root.directives` is in source
 * order and no two directives overlap, so their ends are in order too, and a
 * binary search finds the first one that ends after `start`. Reading all the
 * directives for each style would make the time of a rule grow with the number
 * of styles times the number of directives.
 */
function directivesOverlapping(
  sourceCode: MermaidSourceCode,
  start: number,
  end: number,
): Directive[] {
  const { directives } = sourceCode.ast
  let low = 0
  let high = directives.length
  while (low < high) {
    const middle = Math.floor((low + high) / 2)
    if (directives[middle].range[1] <= start) low = middle + 1
    else high = middle
  }
  const overlapping: Directive[] = []
  for (
    let index = low;
    index < directives.length && directives[index].range[0] < end;
    index++
  ) {
    overlapping.push(directives[index])
  }
  return overlapping
}

/** The directive that begins at `at`, if there is one. */
export function directiveStartingAt(
  sourceCode: MermaidSourceCode,
  at: number,
): Directive | undefined {
  return directivesOverlapping(sourceCode, at, at + 1).find(
    (directive) => directive.range[0] === at,
  )
}

/** The positions from `start` to `end` that are not in a directive. */
function positionsWithoutDirectives(
  sourceCode: MermaidSourceCode,
  start: number,
  end: number,
): number[] {
  const directives = directivesOverlapping(sourceCode, start, end)
  const positions: number[] = []
  for (let at = start; at < end; at++) {
    const inDirective = directives.some(
      (directive) => directive.range[0] <= at && at < directive.range[1],
    )
    if (!inDirective) positions.push(at)
  }
  return positions
}

/** The characters of the source at `positions`. */
function textAt(
  sourceCode: MermaidSourceCode,
  positions: readonly number[],
): string {
  return positions.map((at) => sourceCode.text[at]).join("")
}

/**
 * The text of `sourceCode` from `start` to `end` (UTF-16 positions) without the
 * directives that lie in it, as mermaid.js reads it: it takes directives out
 * before it reads anything else. A directive that starts before `start` or
 * ends after `end` is left out for the part that lies in the range.
 */
export function textWithoutDirectives(
  sourceCode: MermaidSourceCode,
  start: number,
  end: number,
): string {
  return textAt(sourceCode, positionsWithoutDirectives(sourceCode, start, end))
}

/**
 * The positions in the source of the characters of `value`, which the tree
 * holds as the written text of `range` without its directives. It is `null`
 * where the value is not that text: mermaid.js leaves a `;` out of a style in
 * a `classDef`, so the written text and the value differ.
 */
export function positionsOfValue(
  sourceCode: MermaidSourceCode,
  [start, end]: Range,
  value: string,
): number[] | null {
  const positions = positionsWithoutDirectives(sourceCode, start, end)
  return textAt(sourceCode, positions) === value ? positions : null
}
