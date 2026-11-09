import type { Node } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import { shortestNumber } from "./number-form.ts"

/**
 * The text that a printer writes for a text without quotes, or undefined where
 * the text must stay in quotes.
 */
type Bare = (text: string) => string | undefined

/**
 * A field of a sankey diagram without the spaces at its ends, which
 * mermaid.js drops from a field with or without quotes, when it is plain text:
 * ASCII letters, digits, `_`, `-`, and `.`, with spaces between them. No other
 * character is certain to be read the same without quotes: a stage that reads
 * the text of a diagram before its lexer gives `%%`, `#`, `;`, and `\` a
 * meaning, and the lexer a `,` and a `"`.
 */
function sankeyField(text: string): string | undefined {
  const field = text.trim()
  return field !== "" &&
    [...field].every(
      (character) =>
        (character >= "a" && character <= "z") ||
        (character >= "A" && character <= "Z") ||
        (character >= "0" && character <= "9") ||
        character === "_" ||
        character === "-" ||
        character === "." ||
        character === " ",
    )
    ? field
    : undefined
}

/**
 * A word of ASCII letters, digits, and `_` that starts with a letter or `_`
 * and is none of the `reserved` words, which are compared in lower case: the
 * lexer of a diagram type reads a reserved word as a unit of its own, and a
 * text of other characters has a meaning in the stages before the lexer.
 */
function wordWithout(reserved: ReadonlySet<string>): Bare {
  return (text) => {
    const first = text[0]
    return first !== undefined &&
      !(first >= "0" && first <= "9") &&
      [...text].every(
        (character) =>
          (character >= "a" && character <= "z") ||
          (character >= "A" && character <= "Z") ||
          (character >= "0" && character <= "9") ||
          character === "_",
      ) &&
      !reserved.has(text.toLowerCase())
      ? text
      : undefined
  }
}

/**
 * The words of an ER diagram that its lexer reads as a unit of its own:
 * keywords, the words of the cardinalities and of the relationship lines, the
 * names of the directions and of the keys of an attribute, and the letters
 * `u` and `o`, which begin the symbols `u.`, `u-`, `u|`, `o|` and `o{`.
 */
const erReserved: ReadonlySet<string> = new Set([
  "erdiagram",
  "style",
  "classdef",
  "class",
  "subgraph",
  "end",
  "one",
  "many",
  "only",
  "zero",
  "optionally",
  "or",
  "to",
  "acctitle",
  "accdescr",
  "direction",
  "tb",
  "bt",
  "rl",
  "lr",
  "pk",
  "fk",
  "uk",
  "u",
  "o",
])

/**
 * The fields that are written without quotes, by the type of the node and the
 * field, in the form that the examples in the documentation of the pinned
 * mermaid.js use at least twice as often as the form in quotes
 * (docs/compatibility.md, Spellings that are drawn the same): the three fields
 * of a link of a sankey diagram, and the names and the roles of an ER diagram.
 */
const bareFields: Readonly<Record<string, Readonly<Record<string, Bare>>>> = {
  ErEntityReference: { name: wordWithout(erReserved) },
  ErEntityStatement: { name: wordWithout(erReserved) },
  ErRelationshipStatement: { role: wordWithout(erReserved) },
  ErSubgraphStatement: { id: wordWithout(erReserved) },
  SankeyLinkStatement: {
    source: sankeyField,
    target: sankeyField,
    value: (text) => {
      const field = sankeyField(text)
      return field === undefined ? undefined : (shortestNumber(field) ?? field)
    },
  },
}

/**
 * Records, for each field of `bareFields` that is written in quotes and holds
 * a text that is read the same without them, the field without the quotes.
 */
export function findQuoteFormRespellings(
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node,
): void {
  const fields = bareFields[node.type]
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      const bare = fields?.[key]
      if (bare === undefined) {
        findQuoteFormRespellings(found, item)
      } else if (item.type === "StringLiteral") {
        const { value: text, raw } = item as Node & {
          value: string
          raw: string
        }
        // A directive or a comment region inside the string is part of `raw`
        // and no part of `value`.
        const printed = raw === `"${text}"` ? bare(text) : undefined
        if (printed !== undefined) {
          found.set(item.range[0], { end: item.range[1], text: printed })
        }
      }
    }
  }
}
