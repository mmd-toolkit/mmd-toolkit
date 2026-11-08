import type { RuleFixer } from "@eslint/core"
import type {
  QuadrantClassDefStatement,
  QuadrantLiteral,
  QuadrantPointStatement,
  Range,
} from "@mmd-toolkit/ast"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import type { MermaidSourceCode } from "../source-code.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { positionsOfValue } from "../utils/directive-free-text.ts"
import { styleOf, type QuadrantStyle } from "../utils/quadrant-styles.ts"

/** Three or six hexadecimal digits, which `validateHexCode` of mermaid.js accepts without a `#`. */
const BARE_HEX_COLOR = /^(?:[\da-f]{6}|[\da-f]{3})$/iu

/** A style of a list with the name and the value that mermaid.js reads from it. */
interface KeptStyle extends QuadrantStyle {
  readonly literal: QuadrantLiteral
}

/** The last style of each name in a list, which is the one that mermaid.js keeps. */
function lastStyles(
  styles: readonly QuadrantLiteral[],
): ReadonlyMap<string, KeptStyle> {
  const last = new Map<string, KeptStyle>()
  for (const literal of styles) {
    const style = styleOf(literal)
    last.set(style.name, { ...style, literal })
  }
  return last
}

/** Where the value stands in the value of a style: after the first `:` and the whitespace that follows it. */
function valueRange(text: string, value: string): Range {
  const afterColon = text.slice(text.indexOf(":") + 1)
  const start = text.length - afterColon.trimStart().length
  return [start, start + value.length]
}

/** Whether a point is drawn with a border wider than 0px: its `stroke-width`, or else that of its class. */
function hasBorder(
  own: ReadonlyMap<string, KeptStyle>,
  inherited: ReadonlyMap<string, KeptStyle>,
): boolean {
  const width = (own.get("stroke-width") ?? inherited.get("stroke-width"))
    ?.value
  return typeof width === "string" && Number.parseFloat(width) > 0
}

/**
 * Whether a `;` stands at `at`, or after the directives that begin there.
 * mermaid.js takes the directives out before it reads `#` and word characters
 * up to a `;` as a character reference, so `#f00;` is not read as a colour and
 * the diagram is rejected.
 */
function semicolonFollows(sourceCode: MermaidSourceCode, at: number): boolean {
  const directive = sourceCode.ast.directives.find(
    (candidate) => candidate.range[0] === at,
  )
  return directive === undefined
    ? sourceCode.text[at] === ";"
    : semicolonFollows(sourceCode, directive.range[1])
}

/**
 * Writes the `#` before the value, where no `;` follows the value. A fix is a
 * function of its own, apart from `create`, and is offered only where the edit
 * keeps the diagram accepted.
 */
function hashFix(
  sourceCode: MermaidSourceCode,
  [start, end]: Range,
): RuleFixer | null {
  return semicolonFollows(sourceCode, end)
    ? null
    : (fixer) => fixer.insertTextBeforeRange([start, start], "#")
}

/**
 * The rule `quadrant-no-invalid-color`, described in
 * `docs/rules/quadrant-no-invalid-color.md`: the `color` or the `stroke-color`
 * of a point or of a `classDef` written as hexadecimal digits without `#`.
 * mermaid.js lets the `#` be left out when it checks the colour, and then
 * writes the text into the drawing as `fill="f00"` or `stroke="f00"`, which a
 * browser does not read as a colour. A style is reported where a point is drawn
 * with its value: the last of its name in the styles of the point, or else in
 * those of the last `classDef` of its class. A `stroke-color` counts only where
 * the point is drawn with a border wider than 0px.
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
    const points: QuadrantPointStatement[] = []
    const classDefs = new Map<string, QuadrantClassDefStatement>()

    return {
      QuadrantPointStatement(node) {
        points.push(node)
      },
      QuadrantClassDefStatement(node) {
        classDefs.set(node.name.name, node)
      },
      "QuadrantDiagram:exit"() {
        const drawn = new Set<QuadrantLiteral>()
        for (const point of points) {
          const own = lastStyles(point.styles)
          const inherited = lastStyles(
            (point.className === null
              ? undefined
              : classDefs.get(point.className.name)
            )?.styles ?? [],
          )
          for (const name of ["color", "stroke-color"]) {
            const source = own.get(name) ?? inherited.get(name)
            if (
              source !== undefined &&
              (name === "color" || hasBorder(own, inherited))
            ) {
              drawn.add(source.literal)
            }
          }
        }
        for (const literal of drawn) {
          const { value } = styleOf(literal)
          if (typeof value !== "string" || !BARE_HEX_COLOR.test(value)) continue
          // Where the written text of the style is not its value, the report
          // covers the style and has no fix.
          const positions = positionsOfValue(
            sourceCode,
            literal.range,
            literal.value,
          )
          const [from, to] = valueRange(literal.value, value)
          const range: Range | null =
            positions === null ? null : [positions[from], positions[to - 1] + 1]
          context.report({
            loc:
              range === null
                ? literal.loc
                : {
                    start: sourceCode.getLocFromIndex(range[0]),
                    end: sourceCode.getLocFromIndex(range[1]),
                  },
            messageId: "bare",
            data: { color: value },
            fix: range === null ? null : hashFix(sourceCode, range),
          })
        }
      },
    }
  },
}
