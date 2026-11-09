import type { Node } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import { shortestNumber } from "./number-form.ts"
import type { Source } from "./source.ts"

/** Whether a text is written the same between quotes and without them. */
type Plain = (text: string) => boolean

/**
 * The form of the text of a field that the examples in the documentation of
 * the pinned mermaid.js use at least twice as often as the other
 * (docs/compatibility.md, Spellings that are drawn the same), and the texts
 * that either form writes the same.
 */
interface QuoteForm {
  readonly form: "bare" | "quoted"
  readonly plain: Plain
  /** The text as a printer writes it without quotes, when that differs. */
  readonly printed?: (text: string) => string
}

/**
 * The text of a field that has no character with a meaning of its own in
 * any stage that reads the text of a diagram: ASCII letters, digits, `_`, `-`,
 * and `.`, and a space between them where `spaces` is true.
 */
function isPlainText(text: string, spaces: boolean): boolean {
  return (
    text !== "" &&
    !text.startsWith(" ") &&
    !text.endsWith(" ") &&
    [...text].every(
      (character) =>
        (character >= "a" && character <= "z") ||
        (character >= "A" && character <= "Z") ||
        (character >= "0" && character <= "9") ||
        character === "_" ||
        character === "-" ||
        character === "." ||
        (spaces && character === " "),
    )
  )
}

/**
 * The fields that are written with or without quotes, by the type of the node
 * and the field: the three fields of a link of a sankey diagram.
 */
const quoteForms: Readonly<
  Record<string, Readonly<Record<string, QuoteForm>>>
> = {
  SankeyLinkStatement: {
    source: { form: "bare", plain: (text) => isPlainText(text, true) },
    target: { form: "bare", plain: (text) => isPlainText(text, true) },
    value: {
      form: "bare",
      plain: (text) => isPlainText(text, true),
      printed: (text) => shortestNumber(text) ?? text,
    },
  },
}

/**
 * Records, for each field of `quoteForms` that is written in the other form
 * and holds a plain text, the field in the form of the examples: the quotes of
 * the string are left out, or put around the text.
 */
export function findQuoteFormRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
): void {
  const visit = (node: Node): void => {
    const fields = quoteForms[node.type]
    for (const key of visitorKeys[node.type]) {
      const value = (node as unknown as Record<string, unknown>)[key]
      for (const child of Array.isArray(value) ? value : [value]) {
        if (child === null || child === undefined) continue
        const item = child as Node
        const rule = fields?.[key]
        if (rule === undefined) {
          visit(item)
        } else if (item.type === "StringLiteral" && rule.form === "bare") {
          const { value: text, raw } = item as Node & {
            value: string
            raw: string
          }
          // A directive or a comment region inside the string is part of
          // `raw` and no part of `value`.
          if (raw === `"${text}"` && rule.plain(text)) {
            found.set(item.range[0], {
              end: item.range[1],
              text: rule.printed?.(text) ?? text,
            })
          }
        } else if (item.type !== "StringLiteral" && rule.form === "quoted") {
          const text = source.text.slice(...item.range)
          if (rule.plain(text)) {
            found.set(item.range[0], { end: item.range[1], text: `"${text}"` })
          }
        }
      }
    }
  }
  visit(source.root)
}
