import type { Node, Range, Token } from "@mmd-toolkit/ast"
import { visitorKeys } from "@mmd-toolkit/parser"
import { keywordSpellings } from "./keyword-spellings.ts"
import type { Source } from "./source.ts"
import { findFirstIndex } from "./source.ts"

/** The text to print in place of the token or node at an offset. */
export interface Respelling {
  readonly end: number
  readonly text: string
}

/**
 * The header keywords that name a diagram type another way, by the diagram type
 * and the header as written. The form is the one of the examples in the
 * documentation of the pinned mermaid.js (docs/compatibility.md, Spellings that
 * are drawn the same).
 */
const headerSpellings: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  block: { "block-beta": "block" },
  "flowchart-v2": { graph: "flowchart" },
  ishikawa: { ishikawa: "ishikawa-beta" },
  packet: { "packet-beta": "packet" },
  sankey: { "sankey-beta": "sankey" },
  treemap: { treemap: "treemap-beta" },
  xychart: { "xychart-beta": "xychart" },
}

/**
 * The header directions that name the top-to-bottom direction another way, by
 * the diagram type and the direction as written (docs/compatibility.md,
 * Spellings that are drawn the same).
 */
const directionSpellings: Readonly<
  Record<string, Readonly<Record<string, string>>>
> = {
  agentflow: { TD: "TB" },
  "flowchart-v2": { TB: "TD" },
  swimlane: { TD: "TB" },
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
  TreemapLeaf: ["value"],
  VennSubsetStatement: ["size"],
  XychartRange: ["end", "start"],
  XychartValue: ["value"],
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

/**
 * The number in its shortest form: no `+`, no zero at the end of the fraction,
 * no `.` at its end, and a `0` before a `.` at its start. Undefined where the
 * text is no plain decimal, has a zero at the start of its integer part, is a
 * negative zero, or has more digits than a double holds exactly.
 */
function shortestNumber(text: string): string | undefined {
  const negative = text.startsWith("-")
  const unsigned = negative || text.startsWith("+") ? text.slice(1) : text
  const dot = unsigned.indexOf(".")
  const integer = dot === -1 ? unsigned : unsigned.slice(0, dot)
  const fraction = dot === -1 ? "" : unsigned.slice(dot + 1)
  const digits = integer + fraction
  if (
    digits.length === 0 ||
    digits.length > 15 ||
    [...digits].some((character) => character < "0" || character > "9") ||
    (integer.length > 1 && integer.startsWith("0"))
  ) {
    return undefined
  }
  let kept = fraction.length
  while (kept > 0 && fraction[kept - 1] === "0") kept--
  const whole = integer === "" ? "0" : integer
  const value = kept === 0 ? whole : `${whole}.${fraction.slice(0, kept)}`
  return negative && value === "0" ? undefined : (negative ? "-" : "") + value
}

/** The children of a node, in the order of its visitor keys. */
function childrenOf(node: Node): Node[] {
  return visitorKeys[node.type].flatMap((key) => {
    const value = (node as unknown as Record<string, unknown>)[key]
    return (Array.isArray(value) ? value : [value]).filter(
      (child) => child !== null && child !== undefined,
    ) as Node[]
  })
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

/**
 * Records the keywords that start a `class`, `classDef`, or `style` statement
 * in the body of a subgraph of an ER diagram: mermaid.js lists them in the
 * `nodes` of the subgraph as written (diagrams/er.md, Subgraphs).
 */
function collectListedKeywords(
  source: Source,
  node: Node,
  found: Set<number>,
): void {
  for (const child of childrenOf(node)) {
    if (child.type === "ErSubgraphStatement") {
      for (const statement of child.body) {
        if (
          statement.type === "ErClassDefStatement" ||
          statement.type === "ErClassStatement" ||
          statement.type === "ErStyleStatement"
        ) {
          const keyword =
            source.root.tokens[
              findFirstIndex(
                source.root.tokens,
                (token) => token.range[0] >= statement.range[0],
              )
            ]
          if (keyword !== undefined) found.add(keyword.range[0])
        }
      }
    }
    collectListedKeywords(source, child, found)
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
      if (item.type !== "NumericLiteral") {
        collectNumbers(source, item, found)
      } else if (numberFields[node.type]?.includes(key) === true) {
        const text = source.text.slice(...item.range)
        const shortest = shortestNumber(text)
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
 * case of the examples of the pinned mermaid.js, a header keyword, the
 * direction of a flowchart, the colon after the header of a gitGraph, a string
 * between `"`, and a number in its shortest form.
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
    const ignored: Range[] = []
    collectRanges(source.root, (name) => name.endsWith("IgnoredText"), ignored)
    const listed = new Set<number>()
    if (type === "er") collectListedKeywords(source, source.root, listed)
    tokens.forEach((token, index) => {
      const text = source.text.slice(...token.range)
      let respelled: string | undefined
      if (token.type === "Keyword" && index === headerIndex) {
        // The printer keeps a hidden YAML block, and a hidden directive, at
        // the header, as in `packet-beta---`, which `packet---` does not read.
        respelled = ignored.some(([from]) => from === token.range[1])
          ? undefined
          : headerSpellings[type]?.[text]
      } else if (token.type === "Keyword") {
        respelled = listed.has(token.range[0])
          ? undefined
          : index === directionIndex
            ? directionSpellings[type]?.[text]
            : spellings[text.toLowerCase()]
      } else if (
        token.type === "String" &&
        singleQuoteTypes.has(type) &&
        !arrows.some(
          ([from, to]) => from <= token.range[0] && token.range[1] <= to,
        )
      ) {
        respelled = doubleQuoted(text)
      } else if (
        token.type === "Punctuator" &&
        type === "gitGraph" &&
        text === ":" &&
        index === headerIndex + 1
      ) {
        respelled = ""
      }
      if (respelled !== undefined && respelled !== text) {
        map.set(token.range[0], { end: token.range[1], text: respelled })
      }
    })
    collectNumbers(source, source.root, map)
    found = { byStart: map, starts: [...map.keys()].sort((a, b) => a - b) }
    respellingsOfSource.set(source, found)
  }
  return found
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
