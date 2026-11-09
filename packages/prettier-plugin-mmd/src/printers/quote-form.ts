import type { Node } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import { findErKeptLines } from "./er-kept-lines.ts"
import type { KeptLines } from "./kept-lines.ts"
import { lineEndOf, lineStartOf } from "./kept-lines.ts"
import { shortestNumber } from "./number-form.ts"
import { findRequirementKeptLines } from "./requirement-kept-lines.ts"
import { findSankeyKeptLines } from "./sankey-kept-lines.ts"
import type { Source } from "./source.ts"

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
 * A word of ASCII letters, digits, and `_`, or, where `spaces` is true, words
 * with spaces between them, that starts with a letter or `_` (or, where
 * `digits` is true, with any of these characters) and whose first word is none
 * of the `reserved` words, which are compared in lower case: the lexer of a
 * diagram type reads a reserved word as a unit of its own, and a text of other
 * characters has a meaning in the stages before the lexer.
 */
function wordWithout(
  reserved: ReadonlySet<string>,
  { spaces = false, digits = false } = {},
): Bare {
  return (text) => {
    const first = text[0]
    return first !== undefined &&
      (digits || !(first >= "0" && first <= "9")) &&
      first !== " " &&
      !text.endsWith(" ") &&
      [...text].every(
        (character) =>
          (character >= "a" && character <= "z") ||
          (character >= "A" && character <= "Z") ||
          (character >= "0" && character <= "9") ||
          character === "_" ||
          (spaces && character === " "),
      ) &&
      !reserved.has(text.split(" ")[0].toLowerCase())
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
 * The words of a requirement diagram that its lexer reads as a unit of its own:
 * keywords, the names of the directions, the kinds of a requirement and of a
 * relationship, and the words of the risk and of the verification method.
 */
const requirementReserved: ReadonlySet<string> = new Set([
  "title",
  "acctitle",
  "accdescr",
  "direction",
  "tb",
  "bt",
  "rl",
  "lr",
  "requirementdiagram",
  "id",
  "text",
  "risk",
  "verifymethod",
  "requirement",
  "functionalrequirement",
  "interfacerequirement",
  "performancerequirement",
  "physicalrequirement",
  "designconstraint",
  "low",
  "medium",
  "high",
  "analysis",
  "demonstration",
  "inspection",
  "test",
  "element",
  "contains",
  "copies",
  "derives",
  "satisfies",
  "verifies",
  "refines",
  "traces",
  "type",
  "docref",
  "style",
  "classdef",
  "class",
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
  RequirementClassDefStatement: {
    cssClasses: wordWithout(requirementReserved, { digits: true }),
  },
  RequirementClassStatement: {
    cssClasses: wordWithout(requirementReserved, { digits: true }),
    names: wordWithout(requirementReserved, { digits: true }),
  },
  RequirementElementField: {
    value: wordWithout(requirementReserved, { spaces: true, digits: true }),
  },
  RequirementElementStatement: {
    name: wordWithout(requirementReserved, { digits: true }),
  },
  RequirementRelationshipStatement: {
    left: wordWithout(requirementReserved, { digits: true }),
    right: wordWithout(requirementReserved, { digits: true }),
  },
  RequirementRequirementStatement: {
    cssClasses: wordWithout(requirementReserved, { digits: true }),
    name: wordWithout(requirementReserved, { digits: true }),
  },
  RequirementStyleStatement: {
    names: wordWithout(requirementReserved, { digits: true }),
  },
  RequirementValueField: {
    value: wordWithout(requirementReserved, { spaces: true, digits: true }),
  },
  SankeyLinkStatement: {
    source: sankeyField,
    target: sankeyField,
    value: (text) => {
      const field = sankeyField(text)
      return field === undefined ? undefined : (shortestNumber(field) ?? field)
    },
  },
}

/** The kept lines of the diagram types that have fields in `bareFields`. */
const keptLinesOf: Readonly<Record<string, (source: Source) => KeptLines>> = {
  er: findErKeptLines,
  requirement: findRequirementKeptLines,
  sankey: findSankeyKeptLines,
}

/**
 * Whether the line of an offset is one that the printer writes as it is, or
 * keeps whole, because of a `;` or a number that the lexer reads with what
 * follows: the characters that touch a text stay there, and a text without
 * quotes could join them into one name.
 */
function isKept(source: Source, offset: number): boolean {
  const kept = keptLinesOf[source.root.diagramType]?.(source)
  const line = lineStartOf(source, offset)
  return (
    kept !== undefined && (kept.joined.has(line) || kept.verbatim.has(line))
  )
}

/**
 * Records, for each field of `bareFields` that is written in quotes and holds
 * a text that is read the same without them, the field without the quotes. A
 * field that a `#`, a `%`, a `;`, or a `:` follows on its line keeps its
 * quotes: the text without them can run to the end of the line and take the
 * character, and the text after it, into the field. So does a field on a kept
 * line.
 */
export function findQuoteFormRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node = source.root,
): void {
  const fields = bareFields[node.type]
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      const bare = fields?.[key]
      if (bare === undefined) {
        findQuoteFormRespellings(source, found, item)
      } else if (item.type === "StringLiteral") {
        const { value: text, raw } = item as Node & {
          value: string
          raw: string
        }
        // A directive or a comment region inside the string is part of `raw`
        // and no part of `value`.
        const printed = raw === `"${text}"` ? bare(text) : undefined
        const after = source.text
          .slice(item.range[1], lineEndOf(source, item.range[1]))
          .trimStart()[0]
        if (
          printed !== undefined &&
          !"#%;:".includes(after ?? "\n") &&
          !isKept(source, item.range[0])
        ) {
          found.set(item.range[0], { end: item.range[1], text: printed })
        }
      }
    }
  }
}
