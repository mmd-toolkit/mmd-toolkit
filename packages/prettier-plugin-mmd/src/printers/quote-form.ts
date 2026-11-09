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
 * The text that a printer writes for a text in the form of the examples, or
 * undefined where the text must stay in the form that it is written in.
 */
type Bare = (text: string) => string | undefined

/**
 * The form of the examples of a field: without quotes, or in quotes. `text` is
 * given the text of a field in the other form.
 */
interface QuoteRule {
  readonly form: "bare" | "quoted"
  readonly text: Bare
  /** The nodes whose field has the form, when it is not every node of the type. */
  readonly when?: (node: Node) => boolean
  /**
   * Whether the text before and after the field on its line, which the printer
   * does not separate from it, would join a text without quotes into a longer
   * name.
   */
  readonly joins?: (before: string, after: string) => boolean
}

/** A field that the examples write without quotes. */
function bare(
  text: Bare,
  options: Pick<QuoteRule, "when" | "joins"> = {},
): QuoteRule {
  return { form: "bare", text, ...options }
}

/** A field that the examples write in quotes. */
function quoted(text: Bare): QuoteRule {
  return { form: "quoted", text }
}

/**
 * Whether the `---` of a hidden YAML block touches a name of a Wardley map: a
 * name without quotes would take the dashes into the name.
 */
function touchesWardleyDashes(before: string, after: string): boolean {
  return before.endsWith("---") || after.startsWith("---")
}

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
 * The words of a Wardley map that its lexer reads as a unit of its own, in
 * lower case and without a boundary after them: a name that starts with one of
 * them is read as the unit and the rest of the name.
 */
const wardleyPrefixes: readonly string[] = [
  "build",
  "buy",
  "outsource",
  "market",
  "wardley-beta",
  "size",
  "evolution",
  "anchor",
  "component",
  "label",
  "inertia",
  "evolve",
  "pipeline",
  "note",
  "annotation",
  "accelerator",
  "deaccelerator",
  "title",
  "accTitle",
  "accDescr",
]

/**
 * A name of a Wardley map that the lexer reads whole without quotes: words of
 * ASCII letters, digits, and `_` that start with a letter, with a space between
 * them, and none of the words that it reads as a unit of its own at the start.
 */
function wardleyName(text: string): string | undefined {
  return text
    .split(" ")
    .every(
      (word) =>
        word !== "" &&
        ((word[0] >= "a" && word[0] <= "z") ||
          (word[0] >= "A" && word[0] <= "Z")) &&
        [...word].every(
          (character) =>
            (character >= "a" && character <= "z") ||
            (character >= "A" && character <= "Z") ||
            (character >= "0" && character <= "9") ||
            character === "_",
        ),
    ) && !wardleyPrefixes.some((prefix) => text.startsWith(prefix))
    ? text
    : undefined
}

/** Whether a link of a Wardley map has an arrow between its names. */
function hasArrow(node: Node): boolean {
  return (node as Node & { arrow?: unknown }).arrow !== null
}

/**
 * The fields that are written with or without quotes, by the type of the node
 * and the field, in the form that the examples in the documentation of the
 * pinned mermaid.js use at least twice as often as the other
 * (docs/compatibility.md, Spellings that are drawn the same): the three fields
 * of a link of a sankey diagram, the names and the roles of an ER diagram, the
 * names, the values, and the classes of a requirement diagram, and the names of
 * a Wardley map.
 */
const quoteRules: Readonly<
  Record<string, Readonly<Record<string, QuoteRule>>>
> = {
  ErEntityReference: { name: bare(wordWithout(erReserved)) },
  ErEntityStatement: { name: bare(wordWithout(erReserved)) },
  ErRelationshipStatement: { role: bare(wordWithout(erReserved)) },
  ErSubgraphStatement: { id: bare(wordWithout(erReserved)) },
  RequirementClassDefStatement: {
    cssClasses: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementClassStatement: {
    cssClasses: bare(wordWithout(requirementReserved, { digits: true })),
    names: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementElementField: {
    value: bare(
      wordWithout(requirementReserved, { spaces: true, digits: true }),
    ),
  },
  RequirementElementStatement: {
    name: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementRelationshipStatement: {
    left: bare(wordWithout(requirementReserved, { digits: true })),
    right: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementRequirementStatement: {
    cssClasses: bare(wordWithout(requirementReserved, { digits: true })),
    name: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementStyleStatement: {
    names: bare(wordWithout(requirementReserved, { digits: true })),
  },
  RequirementValueField: {
    value: bare(
      wordWithout(requirementReserved, { spaces: true, digits: true }),
    ),
  },
  SankeyLinkStatement: {
    source: bare(sankeyField),
    target: bare(sankeyField),
    value: bare((text) => {
      const field = sankeyField(text)
      return field === undefined ? undefined : (shortestNumber(field) ?? field)
    }),
  },
  WardleyAcceleratorStatement: { name: quoted(wardleyName) },
  WardleyAnchorStatement: {
    name: bare(wardleyName, { joins: touchesWardleyDashes }),
  },
  WardleyComponentStatement: {
    name: bare(wardleyName, { joins: touchesWardleyDashes }),
  },
  WardleyDeacceleratorStatement: { name: quoted(wardleyName) },
  WardleyEvolutionStage: {
    name: bare(wardleyName, { joins: touchesWardleyDashes }),
    secondName: bare(wardleyName, { joins: touchesWardleyDashes }),
  },
  WardleyEvolveStatement: {
    component: bare(wardleyName, { joins: touchesWardleyDashes }),
  },
  // Two names without an arrow between them, `A B`, read as one name.
  WardleyLinkStatement: {
    from: bare(wardleyName, { when: hasArrow, joins: touchesWardleyDashes }),
    to: bare(wardleyName, { when: hasArrow, joins: touchesWardleyDashes }),
  },
  WardleyPipelineComponent: { name: quoted(wardleyName) },
  WardleyPipelineStatement: {
    parent: bare(wardleyName, { joins: touchesWardleyDashes }),
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
 * quotes could join them into one name. A diagram type without a function of
 * its own is told by a `;` or a `%%` on the line.
 */
function isKept(source: Source, offset: number): boolean {
  const kept = keptLinesOf[source.root.diagramType]?.(source)
  const line = lineStartOf(source, offset)
  return kept === undefined
    ? source.text.slice(line, lineEndOf(source, offset)).includes(";") ||
        source.text.slice(line, lineEndOf(source, offset)).includes("%%")
    : kept.joined.has(line) || kept.verbatim.has(line)
}

/**
 * Records, for each field of `quoteRules` that is written in the other form
 * and holds a text that is read the same in the form of the examples, the
 * field in that form. A field that a `#`, a `%`, a `;`, or a `:` follows on
 * its line keeps its form: a text without quotes can run to the end of the
 * line and take the character, and the text after it, into the field. So does
 * a field on a kept line.
 */
export function findQuoteFormRespellings(
  source: Source,
  found: Map<number, { readonly end: number; readonly text: string }>,
  node: Node = source.root,
): void {
  const fields = quoteRules[node.type]
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      const rule = fields?.[key]
      if (rule === undefined) {
        findQuoteFormRespellings(source, found, item)
        continue
      }
      const isString = item.type === "StringLiteral"
      if (isString !== (rule.form === "bare")) continue
      if (rule.when?.(node) === false) continue
      const line = lineStartOf(source, item.range[0])
      let text: string
      if (isString) {
        const { value: content, raw } = item as Node & {
          value: string
          raw: string
        }
        // A directive or a comment region inside the string is part of `raw`
        // and no part of `value`.
        if (raw !== `"${content}"`) continue
        text = content
      } else {
        text = source.text.slice(...item.range)
      }
      const printed = rule.text(text)
      const after = source.text
        .slice(item.range[1], lineEndOf(source, item.range[1]))
        .trimStart()[0]
      if (
        printed !== undefined &&
        !"#%;:".includes(after ?? "\n") &&
        rule.joins?.(
          source.text.slice(line, item.range[0]),
          source.text.slice(item.range[1], lineEndOf(source, item.range[1])),
        ) !== true &&
        !isKept(source, item.range[0])
      ) {
        found.set(item.range[0], {
          end: item.range[1],
          text: isString ? printed : `"${printed}"`,
        })
      }
    }
  }
}
