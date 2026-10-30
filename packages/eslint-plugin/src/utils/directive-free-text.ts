import type { MermaidSourceCode } from "../source-code.ts"

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
  let text = ""
  for (let at = start; at < end; at++) {
    const inDirective = sourceCode.ast.directives.some(
      (directive) => directive.range[0] <= at && at < directive.range[1],
    )
    if (!inDirective) text += sourceCode.text[at]
  }
  return text
}
