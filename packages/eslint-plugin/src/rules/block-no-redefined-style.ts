import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The whitespace of CSS: a space, a tab, a line feed, a carriage return, and a
 * form feed. Other characters that JavaScript counts as whitespace, as U+00A0,
 * are no whitespace to CSS, and a value with one of them is another value.
 */
const WHITESPACE_AT_ENDS = /^[\t\n\f\r ]+|[\t\n\f\r ]+$/gu

/** A run of the whitespace of CSS, which CSS reads as one space inside a value. */
const WHITESPACE_RUN = /[\t\n\f\r ]+/gu

/** `text` without the whitespace of CSS at its ends. */
function trimmed(text: string): string {
  return text.replaceAll(WHITESPACE_AT_ENDS, "")
}

/**
 * A style as CSS reads its whitespace: the property and the value without the
 * whitespace at their ends, joined by the first colon, and a run of whitespace
 * inside the value as one space. So `fill: #f00` and `fill:#f00` are the same
 * declaration, and so are `border:1px  solid red` and `border:1px solid red`.
 * Everything else, the case of letters too, is compared as written. A style
 * without a colon is its trimmed text.
 */
function declarationOf(style: string): string {
  const colon = style.indexOf(":")
  const text =
    colon === -1
      ? trimmed(style)
      : `${trimmed(style.slice(0, colon))}:${trimmed(style.slice(colon + 1))}`
  return text.replaceAll(WHITESPACE_RUN, " ")
}

/**
 * Compare the style lists for an id across composites, by the declarations in
 * them. A sole empty part changes nothing; other lists replace the previous
 * list.
 */
export const blockNoRedefinedStyle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `style` statement that loses a style of an earlier one.",
      recommended: true,
      url: ruleDocsUrl("block-no-redefined-style"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js replaces the whole style list of `{{name}}`, losing a style set on line {{line}}.",
    },
  },
  create(context) {
    const styles = new Map<string, { values: Set<string>; line: number }>()
    return {
      BlockStyleStatement(node) {
        if (node.styles.length === 1 && node.styles[0] === null) return
        const values = new Set(
          node.styles.map((style) => declarationOf(style?.value ?? "")),
        )
        const previous = styles.get(node.id.name)
        if (
          previous !== undefined &&
          [...previous.values].some(
            (value) => value.trim() !== "" && !values.has(value),
          )
        ) {
          context.report({
            node,
            messageId: "redefined",
            data: { name: node.id.name, line: String(previous.line) },
          })
        }
        styles.set(node.id.name, { values, line: node.loc.start.line })
      },
    }
  },
}
