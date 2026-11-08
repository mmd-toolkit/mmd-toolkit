import type { RuleFixer } from "@eslint/core"
import type { QuadrantLiteral, Range } from "@mmd-toolkit/ast"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import type { MermaidSourceCode } from "../source-code.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { canEditRange } from "../utils/edit-range.ts"

/** A `:` with the whitespace around it, where mermaid.js splits a style into the name, the value, and the rest. */
const SEPARATOR = /\s*:\s*/u

/** Three or six hexadecimal digits, which `validateHexCode` of mermaid.js accepts without a `#`. */
const BARE_HEX_COLOR = /^(?:[\da-f]{6}|[\da-f]{3})$/iu

/**
 * Where the value of a `color` style stands in the text of the style when it is
 * three or six hexadecimal digits without `#`, or null. mermaid.js reads the
 * style by splitting the trimmed text at each `:` with the whitespace around it,
 * and takes the first two parts as the name and the value.
 */
function bareColorRange(text: string): Range | null {
  const first = SEPARATOR.exec(text)
  if (first === null || text.slice(0, first.index) !== "color") return null
  const start = first.index + first[0].length
  const value = text.slice(start).split(SEPARATOR)[0]
  return BARE_HEX_COLOR.test(value) ? [start, start + value.length] : null
}

/** Writes the `#` before the value, where the text of the style is the text of the source. */
function hashFix(
  sourceCode: MermaidSourceCode,
  style: QuadrantLiteral,
  at: number,
): RuleFixer | null {
  if (
    sourceCode.text.slice(...style.range) !== style.value ||
    !canEditRange(sourceCode, [at, at])
  )
    return null
  return (fixer) => fixer.insertTextBeforeRange([at, at], "#")
}

/**
 * The rule `quadrant-no-invalid-color`, described in
 * `docs/rules/quadrant-no-invalid-color.md`: the `color` of a point or of a
 * `classDef` written as hexadecimal digits without `#`. mermaid.js lets the `#`
 * be left out when it checks the colour, and then writes the text into the
 * drawing as `fill="f00"`, which a browser does not read as a colour.
 * `stroke-color` passes the same check but is not read.
 */
export const quadrantNoInvalidColor: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "bare"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a hexadecimal colour without `#` in the style of a point or a class.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-invalid-color"),
    },
    fixable: "code",
    schema: [],
    messages: {
      bare: "mermaid.js accepts `{{color}}` as a colour but writes it into the drawing as it is, which browsers do not read, so the colour is not drawn.",
    },
  },
  create(context) {
    const { sourceCode } = context

    /** Reports each `color` style of `styles` with a bare hexadecimal value. */
    function check(styles: readonly QuadrantLiteral[]): void {
      for (const style of styles) {
        const value = bareColorRange(style.value)
        if (value === null) continue
        const range: Range = [
          style.range[0] + value[0],
          style.range[0] + value[1],
        ]
        const written = sourceCode.text.slice(...style.range) === style.value
        context.report({
          loc: written
            ? {
                start: sourceCode.getLocFromIndex(range[0]),
                end: sourceCode.getLocFromIndex(range[1]),
              }
            : style.loc,
          messageId: "bare",
          data: { color: style.value.slice(...value) },
          fix: hashFix(sourceCode, style, range[0]),
        })
      }
    }

    return {
      QuadrantPointStatement(node) {
        check(node.styles)
      },
      QuadrantClassDefStatement(node) {
        check(node.styles)
      },
    }
  },
}
