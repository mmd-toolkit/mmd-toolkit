/**
 * Stand-ins for the browser functions that a Db method calls while mermaid
 * parses, given only for the duration of that call (see
 * docs/expected-results.md). Mermaid's processing is not copied: a stand-in
 * answers only the question the browser function answers.
 */
import { color } from "@csstools/css-color-parser"
import {
  isFunctionNode,
  parseComponentValue,
  walk,
} from "@csstools/css-parser-algorithms"
import { tokenize } from "@csstools/css-tokenizer"

/**
 * The CSS-wide keywords, valid for every property
 * (https://www.w3.org/TR/css-values-4/#common-keywords and `revert-layer` of
 * https://www.w3.org/TR/css-cascade-5/#revert-layer).
 */
const CSS_WIDE_KEYWORDS: readonly string[] = [
  "initial",
  "inherit",
  "unset",
  "revert",
  "revert-layer",
]

/**
 * Color keywords that are not a color the parser can resolve:
 * `currentcolor` (https://www.w3.org/TR/css-color-4/#currentcolor-color), the
 * system colors (https://www.w3.org/TR/css-color-4/#css-system-colors) and the
 * deprecated system colors, which stay valid
 * (https://www.w3.org/TR/css-color-4/#deprecated-system-colors).
 */
const UNRESOLVED_COLOR_KEYWORDS: readonly string[] = [
  "currentcolor",
  "accentcolor",
  "accentcolortext",
  "activetext",
  "buttonborder",
  "buttonface",
  "buttontext",
  "canvas",
  "canvastext",
  "field",
  "fieldtext",
  "graytext",
  "highlight",
  "highlighttext",
  "linktext",
  "mark",
  "marktext",
  "selecteditem",
  "selecteditemtext",
  "visitedtext",
  "activeborder",
  "activecaption",
  "appworkspace",
  "background",
  "buttonhighlight",
  "buttonshadow",
  "captiontext",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infobackground",
  "infotext",
  "menu",
  "menutext",
  "scrollbar",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "window",
  "windowframe",
  "windowtext",
]

/**
 * The substitution functions: a value that holds one is valid when it is
 * parsed, whatever else it holds, since the function is replaced only later
 * (`var()`: https://www.w3.org/TR/css-variables-1/#using-variables, `env()`:
 * https://drafts.csswg.org/css-env-1/#env-function, `attr()`:
 * https://www.w3.org/TR/css-values-5/#attr-notation).
 */
const SUBSTITUTION_FUNCTIONS: readonly string[] = ["var", "env", "attr"]

/**
 * What `CSS.supports("color", value)` answers: whether `value` is a valid
 * value of the `color` property.
 *
 * - A CSS-wide keyword or a color keyword of {@link UNRESOLVED_COLOR_KEYWORDS},
 *   in any ASCII case, is valid.
 * - A value that holds a function of {@link SUBSTITUTION_FUNCTIONS} is valid.
 * - Otherwise the value is valid when it is one color that
 *   `@csstools/css-color-parser` reads: a named color, `transparent`, a hex
 *   color or a color function.
 */
export function cssSupportsColor(value: string): boolean {
  const keyword = value.trim().toLowerCase()
  if (
    CSS_WIDE_KEYWORDS.includes(keyword) ||
    UNRESOLVED_COLOR_KEYWORDS.includes(keyword)
  ) {
    return true
  }
  const component = parseComponentValue(tokenize({ css: value }))
  if (!component) return false
  if (holdsSubstitutionFunction(component)) return true
  return color(component) !== false
}

/**
 * Whether a component value is or contains a substitution function.
 */
function holdsSubstitutionFunction(
  component: NonNullable<ReturnType<typeof parseComponentValue>>,
): boolean {
  if (isSubstitutionFunction(component)) return true
  let found = false
  walk([component], (entry) => {
    if (isSubstitutionFunction(entry.node)) found = true
  })
  return found
}

/**
 * Whether a node is a function of {@link SUBSTITUTION_FUNCTIONS}.
 */
function isSubstitutionFunction(node: unknown): boolean {
  return (
    isFunctionNode(node) &&
    SUBSTITUTION_FUNCTIONS.includes(node.getName().toLowerCase())
  )
}

/**
 * Runs `call` with the global `name` set to `value`, and restores the global
 * afterwards.
 */
export function withGlobal<T>(name: string, value: unknown, call: () => T): T {
  const saved = Object.getOwnPropertyDescriptor(globalThis, name)
  Object.defineProperty(globalThis, name, {
    value,
    configurable: true,
    writable: true,
  })
  try {
    return call()
  } finally {
    if (saved) Object.defineProperty(globalThis, name, saved)
    else Reflect.deleteProperty(globalThis, name)
  }
}
