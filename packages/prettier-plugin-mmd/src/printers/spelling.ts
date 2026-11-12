import type { Node, Range, Token } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import type { Atom } from "./atoms.ts"
import { findArrowLengthRespellings } from "./arrow-length.ts"
import { findNodes } from "./collections.ts"
import { findColorRespellings } from "./color-form.ts"
import { keywordSpellings } from "./keyword-spellings.ts"
import { childrenOf } from "./layout.ts"
import { findLinkLabelRespellings } from "./link-label-form.ts"
import { shortestNumber } from "./number-form.ts"
import { findQuoteFormRespellings } from "./quote-form.ts"
import type { Source } from "./source.ts"

/** The text to print in place of the token or node at an offset. */
export interface Respelling {
  readonly end: number
  readonly text: string
}

/**
 * The header directions that name the top-to-bottom direction another way, by
 * the diagram type and the direction as written (docs/compatibility.md,
 * Spellings that are drawn the same). The diagram types listed appeared in a
 * version of mermaid.js after 11.10.0, which made `TD` behave as `TB`. The
 * header of a flowchart is not listed: a version before 11.10.0 draws it
 * differently with `TD` than with `TB`.
 */
const directionSpellings: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  agentflow: { TD: "TB" },
  swimlane: { TD: "TB" },
}

/**
 * The keywords that mermaid.js reads as another keyword, by the diagram type
 * and the keyword as written; the other keyword is the one of the examples in
 * the documentation of the pinned mermaid.js (docs/compatibility.md, Spellings
 * that are drawn the same).
 */
const keywordAliases: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  c4: {
    Rel_Down: "Rel_D",
    Rel_Left: "Rel_L",
    Rel_Right: "Rel_R",
    Rel_Up: "Rel_U",
  },
  gitGraph: { switch: "checkout" },
}

/**
 * The punctuation that mermaid.js reads as other punctuation, by the diagram
 * type and the punctuation as written: the assignment of a rule of the EBNF
 * notation of a railroad diagram.
 */
const punctuationAliases: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  railroadEbnf: { "::=": "=" },
}

/** The diagram types whose header can be followed by a `:`, which they read as no `:`. */
const headerColonTypes: ReadonlySet<string> = new Set(["cynefin", "radar"])

/**
 * The cardinalities of a relationship of an ER diagram as symbols, by their
 * name and the side of the relationship; the line is `--` for an identifying
 * relationship and `..` for another (docs/compatibility.md, Spellings that
 * are drawn the same).
 */
const leftCardinalitySymbols: Readonly<Record<string, string>> = {
  "one-or-more": "}|",
  "only-one": "||",
  "zero-or-more": "}o",
  "zero-or-one": "|o",
}
const rightCardinalitySymbols: Readonly<Record<string, string>> = {
  "one-or-more": "|{",
  "only-one": "||",
  "zero-or-more": "o{",
  "zero-or-one": "o|",
}
const lineSymbols: Readonly<Record<string, string>> = {
  identifying: "--",
  "non-identifying": "..",
}

/** The diagram types whose strings can be written between `'` as well. */
const singleQuoteTypes: ReadonlySet<string> = new Set([
  "cynefin",
  "gitGraph",
  "packet",
  "pie",
  "radar",
  "railroad",
  "railroadEbnf",
  "railroadPeg",
  "treeView",
  "treemap",
  "usecase",
  "wardley",
])

/**
 * The numbers that are printed in the shortest form, by the type of the node
 * that holds the number and the field: a value, a size, a limit of an axis. A
 * number that mermaid.js reads as text, such as the one in a `text` statement
 * of a Venn diagram, is not one.
 */
const numberFields: Readonly<Record<string, readonly string[]>> = {
  PieSectionStatement: ["value"],
  RadarMaxOption: ["value"],
  RadarMinOption: ["value"],
  RadarNumberEntry: ["value"],
  RadarTicksOption: ["value"],
  SankeyLinkStatement: ["value"],
  TreemapLeaf: ["value"],
  VennSubsetStatement: ["size"],
  XychartRange: ["end", "start"],
  XychartValue: ["value"],
}

/**
 * The types of the node that holds a number written as a number: the value of
 * a link of a sankey diagram is a field of text that mermaid.js reads with
 * `parseFloat`, so its node has a type of its own.
 */
const numberLiteralTypes: ReadonlySet<string> = new Set([
  "NumericLiteral",
  "SankeyLiteral",
])

/**
 * Whether the value of a treemap leaf is digits with an optional fraction, or
 * a fraction alone, which are the forms that are printed in the shortest form:
 * the value of a leaf with a sign, or with a `.` at its end, stays as written.
 */
function isTreemapDigits(text: string): boolean {
  return !text.startsWith("+") && !text.startsWith("-") && !text.endsWith(".")
}

/** The characters in a string that another reading of it could use. */
const quoteSensitive = "'\"\\\n\r\u2028\u2029`&#<"

interface SourceRespellings {
  readonly byStart: ReadonlyMap<number, Respelling>
  /** The offsets of `byStart` in source order. */
  readonly starts: readonly number[]
}

const respellingsOfSource = new WeakMap<Source, SourceRespellings>()

/**
 * The string between `"` that reads the same as the string between `'`, or
 * undefined where the string is not between `'` or holds a character that could
 * be read in another way.
 */
function doubleQuoted(text: string): string | undefined {
  if (text.length < 2 || !text.startsWith("'") || !text.endsWith("'")) {
    return undefined
  }
  const content = text.slice(1, -1)
  return [...content].some((character) => quoteSensitive.includes(character))
    ? undefined
    : `"${content}"`
}

/** Records the ranges of the outermost nodes below `node` of a wanted type. */
function collectRanges(
  node: Node,
  isWanted: (type: string) => boolean,
  found: Range[],
): void {
  for (const child of childrenOf(node)) {
    if (isWanted(child.type)) found.push(child.range)
    else collectRanges(child, isWanted, found)
  }
}

/** Records the respelling of the numbers below `node` that have a field above. */
function collectNumbers(
  source: Source,
  node: Node,
  found: Map<number, Respelling>,
): void {
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    for (const child of Array.isArray(value) ? value : [value]) {
      if (child === null || child === undefined) continue
      const item = child as Node
      if (!numberLiteralTypes.has(item.type)) {
        collectNumbers(source, item, found)
      } else if (numberFields[node.type]?.includes(key) === true) {
        const text = source.text.slice(...item.range)
        const shortest =
          node.type === "TreemapLeaf" && !isTreemapDigits(text)
            ? undefined
            : shortestNumber(text)
        if (shortest !== undefined && shortest !== text) {
          found.set(item.range[0], { end: item.range[1], text: shortest })
        }
      }
    }
  }
}

/**
 * What the printer writes in place of a spelling that is printed in one form
 * (docs/compatibility.md, Spellings that are drawn the same): a keyword in the
 * case of the examples of the pinned mermaid.js, the direction of a header,
 * a string between `"`, a number in its shortest form, and a color of a style
 * in lower case.
 */
export function findRespellings(
  source: Source,
): ReadonlyMap<number, Respelling> {
  return respellingsOf(source).byStart
}

/** The respellings of a source, found once, with their offsets in order. */
function respellingsOf(source: Source): SourceRespellings {
  let found = respellingsOfSource.get(source)
  if (found === undefined) {
    const map = new Map<number, Respelling>()
    findTokenRespellings(source, map)
    if (source.root.diagramType === "er") {
      findRelationshipRespellings(source, map)
    }
    if (source.root.diagramType === "packet") {
      findEqualRangeRespellings(source, map)
    }
    // A link respells its label in the form of the diagram type, also a label
    // in quotes that the printer writes without them, so the quotes come first.
    findQuoteFormRespellings(source, map)
    findLinkLabelRespellings(source, map)
    collectNumbers(source, source.root, map)
    findColorRespellings(source, map)
    findArrowLengthRespellings(source, map)
    found = { byStart: map, starts: [...map.keys()].sort((a, b) => a - b) }
    respellingsOfSource.set(source, found)
  }
  return found
}

/**
 * Records the respelling of the tokens that are respelled one by one: a
 * keyword, the direction of a header, the assignment of the EBNF notation, the
 * colon after the header of a cynefin or a radar diagram, and a string.
 */
function findTokenRespellings(
  source: Source,
  found: Map<number, Respelling>,
): void {
  const type = source.root.diagramType
  const spellings = keywordSpellings[type] ?? {}
  const tokens = source.root.tokens
  const headerIndex = tokens.findIndex((token) => token.type === "Keyword")
  // The direction of a header is the keyword that follows it.
  const directionIndex =
    directionSpellings[type] !== undefined &&
    headerIndex !== -1 &&
    tokens[headerIndex + 1]?.type === "Keyword" &&
    source.text
      .slice(tokens[headerIndex].range[1], tokens[headerIndex + 1].range[0])
      .trim() === ""
      ? headerIndex + 1
      : -1
  // The label of a flow of a Wardley map is between `'` only (`+'moving'>`).
  const arrows: Range[] = []
  collectRanges(source.root, (name) => name === "WardleyArrow", arrows)
  tokens.forEach((token, index) => {
    const text = source.text.slice(...token.range)
    let respelled: string | undefined
    if (token.type === "Keyword" && index === headerIndex) {
      // The keyword of the header stays as written: mermaid.js accepts the
      // names of a header from different versions on.
      respelled = undefined
    } else if (token.type === "Keyword") {
      respelled =
        index === directionIndex
          ? directionSpellings[type]?.[text]
          : (keywordAliases[type]?.[text] ?? spellings[text.toLowerCase()])
    } else if (token.type === "Punctuator") {
      respelled =
        headerColonTypes.has(type) &&
        index === headerIndex + 1 &&
        text === ":" &&
        !isTouchedAfter(source, token.range[1])
          ? ""
          : punctuationAliases[type]?.[text]
    } else if (
      token.type === "String" &&
      singleQuoteTypes.has(type) &&
      !arrows.some(
        ([from, to]) => from <= token.range[0] && token.range[1] <= to,
      )
    ) {
      respelled = doubleQuoted(text)
    }
    if (respelled !== undefined && respelled !== text) {
      found.set(token.range[0], { end: token.range[1], text: respelled })
    }
  })
}

/**
 * Whether the `;` that takes the place of the colon, or the `---` of a hidden
 * YAML block, follows the offset directly: the header without its colon would
 * not read the same before them, and the printer keeps them where they are.
 */
function isTouchedAfter(source: Source, offset: number): boolean {
  return source.text[offset] === ";" || source.text[offset] === "-"
}

/**
 * Records the respelling of the three units of each relationship of an ER
 * diagram as symbols: `only one to zero or more` is `||--o{`.
 */
function findRelationshipRespellings(
  source: Source,
  found: Map<number, Respelling>,
): void {
  // ErRelationship has no children, so a match cannot contain another match.
  const relationships = findNodes(
    source.root,
    (node) => node.type === "ErRelationship",
  )
  for (const relationship of relationships) {
    if (relationship.type !== "ErRelationship") continue
    const units = source.root.tokens.filter(
      (token) =>
        token.range[0] >= relationship.range[0] &&
        token.range[1] <= relationship.range[1],
    )
    const symbols = [
      leftCardinalitySymbols[relationship.leftCardinality],
      lineSymbols[relationship.line],
      rightCardinalitySymbols[relationship.rightCardinality],
    ]
    if (units.length !== 3 || symbols.includes(undefined as never)) continue
    units.forEach((unit, index) => {
      if (source.text.slice(...unit.range) !== symbols[index]) {
        found.set(unit.range[0], { end: unit.range[1], text: symbols[index] })
      }
    })
  }
}

/**
 * Records the respelling of a range of a packet diagram that starts and ends
 * at the same position as the position alone: `4-4` is `4`.
 */
function findEqualRangeRespellings(
  source: Source,
  found: Map<number, Respelling>,
): void {
  // A packet range has only literal and ignored-text leaves as children, so
  // traversing below a match cannot select another range.
  const ranges = findNodes(
    source.root,
    (node) => node.type === "PacketRangeBlockStatement",
  )
  for (const child of ranges) {
    if (child.type !== "PacketRangeBlockStatement") continue
    const { start, end } = child
    const between = source.text.slice(start.range[1], end.range[0])
    if (
      source.text.slice(...start.range) !== source.text.slice(...end.range) ||
      between.trim() !== "-"
    ) {
      continue
    }
    const dash = start.range[1] + between.indexOf("-")
    found.set(dash, { end: dash + 1, text: "" })
    found.set(end.range[0], { end: end.range[1], text: "" })
  }
}

/**
 * The text that a printer writes for a stretch that starts with a token, with
 * the token in the form it prints: `printed` is the stretch as the printer
 * writes it, or undefined where it writes the stretch as written.
 */
export function printedStretch(
  source: Source,
  start: number,
  end: number,
  printed: string | undefined,
): string | undefined {
  const respelling = findRespellings(source).get(start)
  if (respelling === undefined) return printed
  const text = printed ?? source.text.slice(start, end)
  const token = source.text.slice(start, respelling.end)
  return text.startsWith(token)
    ? respelling.text + text.slice(token.length)
    : text
}

/** The text of a token that a printer writes itself, in the form it prints. */
export function printedToken(source: Source, token: Token): string {
  return findRespellings(source).get(token.range[0])?.text ?? token.value
}

/**
 * The source text between two offsets with the spellings that are printed in
 * one form replaced: the text a printer writes for a stretch that it prints as
 * written. A token that the stretch holds in part keeps its spelling.
 */
export function writtenWithRespellings(
  source: Source,
  start: number,
  end: number,
): string {
  const { byStart, starts } = respellingsOf(source)
  // The first respelling that starts at or after `start`.
  let low = 0
  let high = starts.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (starts[middle] < start) low = middle + 1
    else high = middle
  }
  let text = ""
  let at = start
  for (let index = low; index < starts.length && starts[index] < end; index++) {
    const respelling = byStart.get(starts[index])!
    if (respelling.end > end) break
    text += source.text.slice(at, starts[index]) + respelling.text
    at = respelling.end
  }
  return text + source.text.slice(at, end)
}

/**
 * The atoms with each respelling that spans several atoms (a label of a link
 * written in the other form) replaced by one atom that holds the respelled
 * text, for the atoms that have no planned layout of their own.
 */
export function mergeRespelledAtoms(
  source: Source,
  atoms: readonly Atom[],
): readonly Atom[] {
  const { byStart } = respellingsOf(source)
  const merged: Atom[] = []
  for (let index = 0; index < atoms.length; index++) {
    const respelling = byStart.get(atoms[index].start)
    let last = index
    while (last < atoms.length && atoms[last].end < (respelling?.end ?? 0)) {
      last++
    }
    const spanned = atoms.slice(index, last + 1)
    if (
      respelling !== undefined &&
      last > index &&
      atoms[last].end === respelling.end &&
      spanned.every((atom) => atom.doc === undefined)
    ) {
      merged.push({
        start: atoms[index].start,
        end: respelling.end,
        doc: respelling.text,
      })
      index = last
    } else {
      merged.push(atoms[index])
    }
  }
  return merged
}
