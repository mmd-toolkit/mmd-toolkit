import { AttributeQuotes } from "../db-from-tree/converted-text.ts"
import { WrittenText } from "./written-text.ts"
import { isDigit, isWordCharacter } from "../db-from-tree/characters.ts"
import {
  UsecaseModelError,
  validateUsecaseModel,
} from "../db-from-tree/usecase.ts"
import type { UsecaseDiagram } from "../db-from-tree/usecase-tree.ts"
import { trimmed } from "../db-from-tree/values.ts"
import {
  checkChildTypes,
  checkFieldWords,
  checkListsWithAnEntry,
} from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  checkLayout,
  checkOwnKinds,
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  entriesOf,
  ownOf,
  readingOf,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import type { StringDelimitersOf } from "./values.ts"
import { childNodesOf, nodesOf, walkNodes } from "./walk.ts"

const STATEMENTS = [
  "UsecaseActorStatement",
  "UsecaseEntityStatement",
  "UsecaseRelationshipStatement",
  "UsecaseSystemBoundaryStatement",
  "UsecaseMetadataAssignmentStatement",
  "UsecaseNoteStatement",
  "UsecaseJsonStatement",
  "UsecaseDirectionStatement",
  "UsecaseClassDefStatement",
  "UsecaseClassStatement",
  "UsecaseStyleStatement",
  "UsecaseAccTitleStatement",
  "UsecaseAccDescrStatement",
  "UsecaseAccDescrBlockStatement",
]

/** ast/usecase.md: child types and visitation order, with no inferred symbols. */
export const USECASE_CHILD_TYPES: FieldTable<readonly string[]> = {
  UsecaseDiagram: { body: STATEMENTS },
  UsecaseActorStatement: { actors: ["UsecaseActor"] },
  UsecaseActor: {
    id: ["Identifier"],
    label: ["UsecaseLabel"],
    metadata: ["UsecaseMetadata"],
    stereotype: ["UsecaseLiteral"],
    classes: ["Identifier"],
  },
  UsecaseEntityStatement: { entity: ["UsecaseEntity"] },
  UsecaseEntity: {
    id: ["Identifier"],
    label: ["UsecaseLabel"],
    metadata: ["UsecaseMetadata"],
    stereotype: ["UsecaseLiteral"],
    classes: ["Identifier"],
  },
  UsecaseSystemBoundaryStatement: {
    id: ["Identifier"],
    title: ["UsecaseLabel"],
    metadata: ["UsecaseMetadata"],
    classes: ["Identifier"],
    body: ["UsecaseActorStatement", "UsecaseEntityStatement"],
  },
  UsecaseRelationshipStatement: {
    source: ["UsecaseActor", "UsecaseEntity"],
    id: ["Identifier"],
    opening: ["UsecaseOpeningArrow"],
    label: ["UsecaseLabel"],
    arrow: ["UsecaseArrow"],
    target: ["UsecaseEntity"],
  },
  UsecaseMetadata: { properties: ["UsecaseMetadataProperty"] },
  UsecaseMetadataProperty: {
    key: ["Identifier", "StringLiteral"],
    value: ["Identifier", "StringLiteral"],
  },
  UsecaseMetadataAssignmentStatement: {
    target: ["Identifier", "UsecaseLabel"],
    metadata: ["UsecaseMetadata"],
  },
  UsecaseNoteStatement: { target: ["Identifier"], label: ["UsecaseLabel"] },
  UsecaseJsonStatement: {
    id: ["Identifier"],
    data: ["UsecaseJsonDataBlock"],
    classes: ["Identifier"],
  },
  UsecaseClassDefStatement: {
    classes: ["Identifier"],
    styles: ["UsecaseStyleDeclaration"],
  },
  UsecaseClassStatement: { targets: ["Identifier"], classes: ["Identifier"] },
  UsecaseStyleStatement: {
    target: ["Identifier"],
    styles: ["UsecaseStyleDeclaration"],
  },
  UsecaseStyleDeclaration: {
    name: ["UsecaseIdentifier"],
    value: ["UsecaseLiteral"],
  },
  UsecaseAccTitleStatement: { value: ["UsecaseLiteral"] },
  UsecaseAccDescrStatement: { value: ["UsecaseLiteral"] },
  UsecaseAccDescrBlockStatement: { value: ["UsecaseLiteral"] },
}

/** ast/usecase.md: finite scalar vocabularies, before Db normalization. */
export const USECASE_FIELD_WORDS: FieldTable<readonly string[]> = {
  UsecaseRelationshipStatement: {
    kind: ["association", "include", "extend", "generalization"],
  },
  UsecaseLabel: { kind: ["text", "string", "markdown"] },
  UsecaseArrow: {
    startMarker: ["none", "arrow", "circle", "cross"],
    endMarker: ["none", "arrow", "circle", "cross", "triangle"],
    line: ["solid", "dotted"],
  },
  UsecaseOpeningArrow: {
    startMarker: ["none", "arrow", "circle", "cross"],
    line: ["solid"],
  },
  UsecaseDirectionStatement: { direction: ["TD", "TB", "BT", "LR", "RL"] },
}

/** The complete punctuation outside arrow nodes. */
export const USECASE_PUNCTUATORS: readonly string[] = [
  "(",
  ")",
  "[",
  "]",
  "@{",
  "@",
  "{",
  "}",
  "<<",
  ">>",
  ":::",
  ",",
  ":",
  "--",
]

const NONEMPTY: Readonly<Record<string, readonly string[]>> = {
  UsecaseActorStatement: ["actors"],
  UsecaseClassDefStatement: ["classes", "styles"],
  UsecaseClassStatement: ["targets", "classes"],
  UsecaseStyleStatement: ["styles"],
}
const WORDS = [
  "usecase-beta",
  "actor",
  "systemBoundary",
  "end",
  "direction",
  "TD",
  "TB",
  "BT",
  "LR",
  "RL",
  "note",
  "for",
  "json",
  "classDef",
  "class",
  "style",
  "include",
  "extend",
  "true",
  "false",
]

/** Default-mode horizontal trivia is ASCII space or tab only. */
function hws(value: string): boolean {
  return skipHws(value, 0) === value.length
}

/** The end of one maximal ASCII horizontal-whitespace run. */
function skipHws(value: string, from: number): number {
  let at = from
  while (value[at] === " " || value[at] === "\t") at++
  return at
}

/** Native line gaps additionally permit normalized physical LF. */
function whitespace(value: string): boolean {
  return [...value].every((c) => c === " " || c === "\t" || c === "\n")
}

/** The maximal ASCII word run, without any longer alternative. */
function wordEnd(value: string, from = 0): number {
  let at = from
  while (isWordCharacter(value.charCodeAt(at))) at++
  return at
}

/** A positive ASCII word run with no other characters. */
function asciiWord(value: string): boolean {
  return value.length > 0 && wordEnd(value) === value.length
}

/** ASCII letters are the only suffix characters of a number unit. */
function letter(c: string): boolean {
  return (c >= "A" && c <= "Z") || (c >= "a" && c <= "z")
}

/** Decimal/integer/unit spelling, with no sign or exponent. */
function numberEnd(value: string, from = 0): number {
  let at = from
  while (isDigit(value.charCodeAt(at))) at++
  if (value[at] === "." && isDigit(value.charCodeAt(at + 1))) {
    at++
    while (isDigit(value.charCodeAt(at))) at++
  }
  if (at === from) return from
  while (letter(value.charAt(at))) at++
  return at
}

/** Keywords extend to an Identifier only, without a recursive number alternative. */
function keyword(value: string): boolean {
  return (
    WORDS.includes(value) || ["include", "extend"].includes(value.toLowerCase())
  )
}

/** One exact identifier unit, including priority over backward circle/cross and decimal longer alternatives. */
function identifier(
  value: string,
  following = "",
  boolean = false,
  raw = false,
): boolean {
  if (!asciiWord(value)) return false
  if (raw) return !isWordCharacter(following.charCodeAt(0))
  if (keyword(value) && !(boolean && ["true", "false"].includes(value)))
    return false
  const text = value + following
  if (text.startsWith("o--") || text.startsWith("x--")) return false
  return (
    !isWordCharacter(following.charCodeAt(0)) && numberEnd(text) <= value.length
  )
}

/** Same-quote strings have no escapes; markdown closes at its first backtick/quote pair. */
function stringUnit(value: string, markdown: boolean): boolean {
  if (markdown)
    return value.startsWith('"`') && value.indexOf('`"', 2) === value.length - 2
  const quote = value[0]
  return (
    (quote === '"' || quote === "'") &&
    !value.startsWith('"`') &&
    value.length > 1 &&
    value.indexOf(quote, 1) === value.length - 1 &&
    !value.includes("\n")
  )
}

/** The default-context operator priority, before markerless dashes and ids. */
function operatorAt(text: string): string | null {
  for (const fixed of ["--|>", "..>"]) if (text.startsWith(fixed)) return fixed
  const dashes = dashEnd(text, 0)
  if (dashes >= 2 && text[dashes] === ">") return text.slice(0, dashes + 1)
  if (text.startsWith("<--")) return text.slice(0, dashEnd(text, 1))
  for (const fixed of ["--o", "o--", "--x", "x--"])
    if (text.startsWith(fixed)) return fixed
  return dashes >= 2 ? text.slice(0, dashes) : null
}

/** The maximal dash run, including arbitrarily long markerless operators. */
function dashEnd(value: string, from: number): number {
  let at = from
  while (value[at] === "-") at++
  return at
}

/** A JSON prefix switches context before any Word or CSS component can win. */
function jsonPrefix(value: string): boolean {
  if (!value.startsWith("json")) return false
  const idStart = skipHws(value, 4)
  if (idStart === 4) return false
  const idEnd = wordEnd(value, idStart)
  if (idEnd === idStart) return false
  const at = skipHws(value, idEnd)
  return value[at] === "@" && value[skipHws(value, at + 1)] === "{"
}

/** A CSS unit beginning with a letter/underscore, after earlier keyword rules. */
function cssEnd(value: string): number {
  if (!(letter(value.charAt(0)) || value.startsWith("_"))) return 0
  let at = wordEnd(value)
  let groups = 0
  while (value[at] === "-" && isWordCharacter(value.charCodeAt(at + 1))) {
    at = wordEnd(value, at + 1)
    groups++
  }
  return groups > 0 ? at : 0
}

/** Keyword alternatives stop at an Identifier; they do not recurse into its number alternative. */
function keywordEnd(value: string): number {
  const lower = value.toLowerCase()
  const matched = WORDS.find((candidate) =>
    candidate === "include" || candidate === "extend"
      ? lower.startsWith(candidate)
      : value.startsWith(candidate),
  )
  return matched === undefined ? 0 : Math.max(matched.length, wordEnd(value))
}

/** LabelText and style-component membership, respecting earlier compound tokens and string priority. */
function textUnits(value: string, style: boolean, following: string): boolean {
  const text = value + following
  let at = 0
  let components = 0
  while (at < value.length) {
    const rest = text.slice(at)
    const afterHws = skipHws(text, at)
    if (afterHws > at) {
      at = afterHws
      continue
    }
    if (rest.startsWith('"`')) return false
    if (rest.startsWith('"') || rest.startsWith("'")) {
      if (!style) return false
      const end = rest.indexOf(rest[0], 1)
      if (end < 0 || !stringUnit(rest.slice(0, end + 1), false)) return false
      at += end + 1
      components++
      continue
    }
    if (
      rest.startsWith("@{") ||
      rest.startsWith("<<") ||
      rest.startsWith(":::") ||
      jsonPrefix(rest)
    )
      return false
    const reserved = keywordEnd(rest)
    if (reserved > 0) {
      at += reserved
      components++
      continue
    }
    const operator = operatorAt(rest)
    if (operator !== null) {
      if (!style || dashEnd(operator, 0) !== operator.length) return false
      at += operator.length
      components++
      continue
    }
    if (rest.startsWith("#")) {
      let end = 1
      while (
        end < rest.length &&
        "0123456789abcdefABCDEF".includes(rest.charAt(end))
      )
        end++
      if (end > 1) {
        at += end
        components++
        continue
      }
    }
    // These maximal units can contain an apparent prefix that is not at a
    // lexical boundary (my-json, jsonName). Do not retry inside their spelling.
    const unitEnd = cssEnd(rest) || Math.max(wordEnd(rest), numberEnd(rest))
    if (unitEnd > 0) {
      at += unitEnd
      components++
      continue
    }
    if (rest.startsWith("\\,")) {
      at += 2
      components++
      continue
    }
    const c = rest[0] ?? ""
    if ("()[]{}".includes(c)) {
      if (!style) return false
    } else if (c === ",") {
      if (style) return false
    } else if (
      style &&
      (";<>\\`".includes(c) || c.charCodeAt(0) < 0x20 || c.charCodeAt(0) > 0x7e)
    )
      return false
    if (c === "\n") return false
    at++
    components++
  }
  return at === value.length && components > 0
}

/** CSS property names are one Word/CSS unit or a markerless dash prefix and one Word. */
function propertyName(value: string): boolean {
  const dashes = dashEnd(value, 0)
  if (dashes >= 2) {
    if (value.startsWith("--o") || value.startsWith("--x")) return false
    const rest = value.slice(skipHws(value, dashes))
    return asciiWord(rest) || keyword(rest)
  }
  if (asciiWord(value) || keyword(value)) return true
  return cssEnd(value) === value.length && keywordEnd(value) === 0
}

/** Source-only delimiters leave AST values unchanged, including single quotes and cut strings. */
export function usecaseStringDelimitersOf(
  text: string,
  root: CheckedRoot,
): StringDelimitersOf {
  const written = new WrittenText(text, root)
  const attributes = new AttributeQuotes(text, root)
  return (node) => {
    if (node.type === "UsecaseLabel" && node.kind === "text") return []
    const offsets: number[] = []
    for (let at = node.range[0]; at < node.range[1]; at++)
      if (!written.isLeftOut(at)) offsets.push(at)
    const source = attributes.of(node.range, (at) => written.isLeftOut(at))
    const size = source.startsWith('"`') ? 2 : 1
    return [...offsets.slice(0, size), ...offsets.slice(-size)].map(
      (at) => [at, at + 1] as const,
    )
  }
}

/** Arrow fields reflect the complete written unit, never the Db's fixed minlen. */
function arrow(reading: Reading, node: CheckedNode): void {
  const value = reading.converted.of(node.range)
  const opening = node.type === "UsecaseOpeningArrow"
  const complete =
    operatorAt(
      value + reading.converted.of([node.range[1], reading.text.length]),
    ) === value
  reading.problems.expect(
    complete && (!opening || ["--", "<--", "o--", "x--"].includes(value)),
    label(node),
    "the arrow has no complete lexical operator",
  )
  const start = value.startsWith("<")
    ? "arrow"
    : value.startsWith("o")
      ? "circle"
      : value.startsWith("x")
        ? "cross"
        : "none"
  const end =
    value === "--|>"
      ? "triangle"
      : value.endsWith(">")
        ? "arrow"
        : value.endsWith("o")
          ? "circle"
          : value.endsWith("x")
            ? "cross"
            : "none"
  for (const [field, expected] of Object.entries({
    startMarker: start,
    line: value === "..>" ? "dotted" : "solid",
    length: [...value].filter((c) => c === (value === "..>" ? "." : "-"))
      .length,
    ...(opening ? {} : { endMarker: end }),
  }))
    reading.problems.expectEqual(
      node[field],
      expected,
      label(node),
      `the ${field} of the arrow`,
    )
  reading.problems.expectEqual(
    nodeTokensIn(reading.root, node.range).map((token) => [
      token.type,
      token.range,
    ]),
    [["Punctuator", node.range]],
    label(node),
    "the tokens of the arrow",
  )
}

/** Every statement and boundary line has its physical separator, with only ASCII trivia in gaps. */
function body(
  reading: Reading,
  node: CheckedNode,
  from: number,
  to: number,
): void {
  let previous = from
  for (const statement of entriesOf(node, "body")) {
    if (statement === null) continue
    const gap = reading.converted.of(
      [previous, statement.range[0]],
      reading.root.comments.map((comment) => comment.range),
    )
    reading.problems.expect(
      whitespace(gap) && gap.includes("\n"),
      label(statement),
      "the statement requires a physical newline and ASCII-only gap",
    )
    previous = statement.range[1]
  }
  const tail = reading.converted.of(
    [previous, to],
    reading.root.comments.map((comment) => comment.range),
  )
  reading.problems.expect(
    whitespace(tail) && (to === reading.text.length || tail.includes("\n")),
    label(node),
    "the body tail requires line-end and ASCII-only trivia",
  )
}

/** Native metadata has ordered complete properties and the specified comma/newline grammar. */
function metadata(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const properties = entriesOf(node, "properties").filter((p) => p !== null)
  const first = own.tokens[0]
  const last = own.tokens.at(-1)
  reading.problems.expect(
    first?.value === "@{" && last?.value === "}",
    label(node),
    "metadata requires contiguous @{ and a closing brace",
  )
  if (first === undefined || last === undefined) return
  reading.problems.expect(
    own.tokens.slice(1, -1).every((token) => token.value === ","),
    label(node),
    "metadata writes only its delimiters and separator commas",
  )
  let previous = first.range[1]
  for (const [index, property] of properties.entries()) {
    const gap = reading.converted.of([previous, property.range[0]])
    reading.problems.expect(
      index === 0 ? whitespace(gap) : metadataSeparator(gap),
      label(property),
      "the metadata property separator is not a comma or newline production",
    )
    previous = property.range[1]
  }
  const tail = reading.converted.of([previous, last.range[0]])
  reading.problems.expect(
    properties.length === 0 ? whitespace(tail) : metadataTail(tail),
    label(node),
    "the trailing comma and line breaks must total at most two, with the comma first",
  )
}

/** After the last property, count a comma before any line breaks and at most two in total. */
function metadataTail(value: string): boolean {
  let total = 0
  for (const c of value) {
    if (c === "\n" || (c === "," && total === 0)) total++
    else if (c !== " " && c !== "\t") return false
    if (total > 2) return false
  }
  return true
}

/** Between complete properties, one comma or a newline group and optional comma. */
function metadataSeparator(value: string): boolean {
  let at = skipHws(value, 0)
  if (value[at] === ",") return whitespace(value.slice(at + 1))
  if (value[at] !== "\n") return false
  while (value[at] === "\n" || value[at] === " " || value[at] === "\t") at++
  if (value[at] === ",") at++
  return whitespace(value.slice(at))
}

/** A raw item fragments only where common trivia cuts its written content. */
function rawItem(reading: Reading, node: CheckedNode): void {
  const tokens = nodeTokensIn(reading.root, node.range).filter(
    (token) => token.type === "RawText",
  )
  for (let index = 1; index < tokens.length; index++) {
    const left = tokens[index - 1]
    const right = tokens[index]
    if (left === undefined || right === undefined) continue
    let cut = false
    for (let at = left.range[1]; at < right.range[0]; at++)
      if (reading.written.isLeftOut(at)) cut = true
    reading.problems.expect(
      cut,
      label(node),
      "a RawText item can fragment only at a source cut",
    )
  }
}

/** Balance braces with double-quote/backslash protection; all other JSON contents remain opaque. */
function data(reading: Reading, node: CheckedNode): void {
  rawItem(reading, node)
  const tokens = nodeTokensIn(reading.root, node.range)
  const value = reading.converted.of(node.range)
  const brace = skipHws(value, 1)
  const open = value.startsWith("@") && value[brace] === "{"
  let depth = 0
  let quoted = false
  let escaped = false
  let close = -1
  if (open)
    for (let at = brace; at < value.length; at++) {
      const c = value[at]
      if (quoted) {
        if (escaped) escaped = false
        else if (c === "\\") escaped = true
        else if (c === '"') quoted = false
      } else if (c === '"') quoted = true
      else if (c === "{") depth++
      else if (c === "}") {
        depth--
        if (depth === 0) {
          close = at
          break
        }
      }
    }
  reading.problems.expect(
    open && close === value.length - 1,
    label(node),
    "the JSON block must end at its first balancing close",
  )
  reading.problems.expect(
    tokens[0]?.value === "@" &&
      tokens[1]?.value === "{" &&
      tokens.at(-1)?.value === "}" &&
      tokens.slice(2, -1).every((token) => token.type === "RawText"),
    label(node),
    "the JSON block requires @, braces and opaque RawText interior",
  )
}

/** A suffix list keeps each written id, comma and the complete atomic separator. */
function suffix(node: CheckedNode): string[] {
  return entriesOf(node, "classes").flatMap((_, index) =>
    index === 0 ? [":::", CHILD] : [",", CHILD],
  )
}

/** A physical line ends at the first CR/LF outside common removed trivia. */
function lineEnd(reading: Reading, from: number): number {
  for (let at = from; at < reading.text.length; at++)
    if (
      !reading.written.isLeftOut(at) &&
      ["\r", "\n"].includes(reading.text.charAt(at))
    )
      return at
  return reading.text.length
}

/** Native comments exist only at ASCII-HWS-only physical line starts outside value modes. */
function comments(reading: Reading): void {
  const protectedNodes = nodesOf(reading.root).filter((node) =>
    [
      "UsecaseLabel",
      "UsecaseLiteral",
      "UsecaseJsonDataBlock",
      "StringLiteral",
    ].includes(node.type),
  )
  for (const comment of reading.root.comments) {
    if (
      reading.written.isLeftOut(comment.range[0]) ||
      comment.range[0] < reading.root.body.range[0]
    )
      continue
    const before = reading.converted.of([0, comment.range[0]])
    reading.problems.expect(
      comment.mark === "%%" && hws(before.slice(before.lastIndexOf("\n") + 1)),
      label(comment),
      "a native usecase comment requires an ASCII-HWS-only physical line start",
    )
    reading.problems.expect(
      !protectedNodes.some(
        (node) =>
          node.range[0] <= comment.range[0] &&
          comment.range[1] <= node.range[1],
      ),
      label(comment),
      "a native usecase comment cannot occur inside a value mode",
    )
  }
}

/** Structural tokens and nullable fields agree with their actual written position. */
function structure(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | null,
): void {
  const own = ownOf(reading.root, node)
  const children = childNodesOf(node)

  /** One layout slot for a present child. */
  function child(field: string): string[] {
    return childOf(node, field) === null ? [] : [CHILD]
  }

  /** Nonempty written list slots separated by commas. */
  function list(field: string): string[] {
    return entriesOf(node, field).flatMap((_, index) =>
      index === 0 ? [CHILD] : [",", CHILD],
    )
  }

  /** A production's exact words and children, with its native gap rule. */
  function layout(parts: readonly string[]): void {
    checkLayout(reading, node, own, parts, (token) => token.value)
    if (
      [
        "UsecaseDiagram",
        "UsecaseSystemBoundaryStatement",
        "UsecaseMetadata",
      ].includes(node.type)
    )
      return
    const pieces = [...own.tokens, ...children].sort(
      (a, b) => a.range[0] - b.range[0],
    )
    for (let at = 1; at < pieces.length; at++) {
      const left = pieces[at - 1]
      const right = pieces[at]
      if (left !== undefined && right !== undefined)
        reading.problems.expect(
          hws(reading.converted.of([left.range[1], right.range[0]])),
          label(node),
          "native production gaps permit only ASCII HWS",
        )
    }
  }

  switch (node.type) {
    case "UsecaseDiagram": {
      layout(["usecase-beta", ...children.map(() => CHILD)])
      const header = own.tokens[0]
      if (header !== undefined) {
        const following = reading.converted.of([
          header.range[1],
          reading.text.length + 1,
        ])
        reading.problems.expect(
          following === "" || ["\t", "\n", " "].includes(following.charAt(0)),
          label(node),
          "usecase-beta requires whitespace or end after its keyword",
        )
        body(reading, node, header.range[1], reading.text.length)
      }
      break
    }
    case "UsecaseActorStatement":
      layout(["actor", ...list("actors")])
      break
    case "UsecaseEntityStatement":
      layout([CHILD])
      break
    case "UsecaseActor":
    case "UsecaseEntity":
    case "UsecaseSystemBoundaryStatement": {
      const boundary = node.type === "UsecaseSystemBoundaryStatement"
      const id = childOf(node, "id")
      const content = childOf(node, boundary ? "title" : "label")
      const bracket = own.tokens.find(
        (token) => token.value === "(" || token.value === "[",
      )?.value
      const shape =
        bracket === "(" ? "ellipse" : bracket === "[" ? "rectangle" : null
      if (node.type === "UsecaseEntity")
        reading.problems.expectEqual(
          node.shape,
          shape,
          label(node),
          "the shape from the written delimiters",
        )
      reading.problems.expect(
        id !== null || (content !== null && content.kind !== "text"),
        label(node),
        "an element requires an id or a quoted-only name",
      )
      reading.problems.expect(
        id !== null || bracket === undefined,
        label(node),
        "a quoted-only name has no shape delimiters",
      )
      reading.problems.expect(
        content === null || id === null || bracket !== undefined,
        label(node),
        "an explicit id label requires shape delimiters",
      )
      reading.problems.expect(
        node.type !== "UsecaseActor" || bracket !== "[",
        label(node),
        "an actor label uses parentheses",
      )
      const stereotype = childOf(node, "stereotype")
      layout([
        ...(boundary ? ["systemBoundary"] : []),
        ...child("id"),
        ...(content === null
          ? []
          : bracket === undefined
            ? [CHILD]
            : [bracket, CHILD, bracket === "(" ? ")" : "]"]),
        ...child("metadata"),
        ...(stereotype === null ? [] : ["<<", CHILD, ">>"]),
        ...suffix(node),
        ...(boundary
          ? [...entriesOf(node, "body").map(() => CHILD), "end"]
          : []),
      ])
      if (boundary) {
        const headerEnd = Math.max(
          own.tokens.filter((token) => token.value !== "end").at(-1)
            ?.range[1] ?? node.range[0],
          ...children
            .filter((n) => !entriesOf(node, "body").includes(n))
            .map((n) => n.range[1]),
        )
        body(
          reading,
          node,
          headerEnd,
          own.tokens.at(-1)?.range[0] ?? node.range[1],
        )
      }
      if (
        parent?.type === "UsecaseRelationshipStatement" &&
        node.type === "UsecaseEntity" &&
        node.shape === null &&
        childOf(node, "metadata") === null &&
        stereotype === null
      )
        reading.problems.expect(
          entriesOf(node, "classes").length === 0,
          label(node),
          "class suffix on a reference-only endpoint",
        )
      if (
        parent?.type === "UsecaseEntityStatement" &&
        childOf(node, "metadata") !== null &&
        bracket === undefined
      ) {
        const inBoundary = nodesOf(reading.root).some(
          (candidate) =>
            candidate.type === "UsecaseSystemBoundaryStatement" &&
            entriesOf(candidate, "body").includes(parent),
        )
        reading.problems.expect(
          inBoundary,
          label(node),
          "top-level bare metadata must be an assignment",
        )
      }
      break
    }
    case "UsecaseRelationshipStatement": {
      const opening = childOf(node, "opening")
      const content = childOf(node, "label")
      const final = childOf(node, "arrow")
      reading.problems.expectEqual(
        opening !== null,
        content !== null,
        label(node),
        "opening and label must be present together",
      )
      const semantic =
        final?.value === "--|>"
          ? "generalization"
          : final?.value === "..>"
            ? own.tokens
                .find((token) =>
                  ["include", "extend"].includes(token.value.toLowerCase()),
                )
                ?.value.toLowerCase()
            : "association"
      reading.problems.expectEqual(
        node.kind,
        semantic,
        label(node),
        "the relationship kind from its operator",
      )
      const source = childOf(node, "source")
      const semanticToken =
        own.tokens.find((token) =>
          ["include", "extend"].includes(token.value.toLowerCase()),
        )?.value ?? ""
      layout([
        ...(source?.type === "UsecaseActor" ? ["actor"] : []),
        CHILD,
        ...(childOf(node, "id") === null ? [] : [CHILD, "@"]),
        ...child("opening"),
        ...child("label"),
        CHILD,
        ...(final?.value === "..>" ? [":", semanticToken] : []),
        CHILD,
      ])
      reading.problems.expect(
        node.kind === "association" || (opening === null && content === null),
        label(node),
        "semantic relationships have no authored label",
      )
      if (opening !== null && final !== null)
        reading.problems.expect(
          opening.value === "--"
            ? final.startMarker === "none" &&
                final.line === "solid" &&
                final.endMarker !== "triangle"
            : final.startMarker === "none" &&
                final.endMarker === "none" &&
                final.line === "solid",
          label(node),
          "the split closing arrow is incompatible with its opening",
        )
      break
    }
    case "UsecaseMetadata":
      metadata(reading, node)
      break
    case "UsecaseMetadataProperty": {
      layout([CHILD, ":", CHILD])
      const key = childOf(node, "key")
      const value = childOf(node, "value")
      if (key !== null && value !== null) {
        const gap = reading.converted.of([key.range[1], value.range[0]])
        const colon = gap.indexOf(":")
        reading.problems.expect(
          colon !== -1 && hws(gap.slice(0, colon)) && hws(gap.slice(colon + 1)),
          label(node),
          "a native property cannot cross a physical newline",
        )
      }
      break
    }
    case "UsecaseMetadataAssignmentStatement":
      layout([CHILD, CHILD])
      reading.problems.expect(
        childOf(node, "target")?.type !== "UsecaseLabel" ||
          childOf(node, "target")?.kind !== "text",
        label(node),
        "metadata label targets must be quoted",
      )
      break
    case "UsecaseNoteStatement":
      layout(["note", "for", CHILD, CHILD])
      break
    case "UsecaseJsonStatement": {
      layout(["json", CHILD, CHILD, ...suffix(node)])
      const id = childOf(node, "id")
      const block = childOf(node, "data")
      const jsonKeyword = own.tokens[0]
      if (id !== null && jsonKeyword !== undefined) {
        const gap = reading.converted.of([jsonKeyword.range[1], id.range[0]])
        reading.problems.expect(
          gap !== "" && hws(gap),
          label(node),
          "json requires positive HWS before its raw id",
        )
      }
      if (id !== null && block !== null)
        reading.problems.expect(
          hws(reading.converted.of([id.range[1], block.range[0]])),
          label(node),
          "the JSON prefix permits only HWS before @",
        )
      break
    }
    case "UsecaseDirectionStatement":
      layout(["direction", String(node.direction)])
      break
    case "UsecaseClassDefStatement":
      layout(["classDef", ...list("classes"), ...list("styles")])
      break
    case "UsecaseClassStatement": {
      layout(["class", ...list("targets"), ...list("classes")])
      const last = entriesOf(node, "targets").at(-1)
      const first = entriesOf(node, "classes")[0]
      if (
        last !== null &&
        last !== undefined &&
        first !== null &&
        first !== undefined
      ) {
        const gap = reading.converted.of([last.range[1], first.range[0]])
        reading.problems.expect(
          gap !== "" && hws(gap),
          label(node),
          "the target/class list boundary requires positive HWS",
        )
      }
      break
    }
    case "UsecaseStyleStatement":
      layout(["style", CHILD, ...list("styles")])
      break
    case "UsecaseStyleDeclaration": {
      layout([CHILD, ":", CHILD])
      const value = childOf(node, "value")
      const colon = own.tokens[0]
      if (value !== null && colon !== undefined)
        reading.problems.expect(
          reading.written.of([colon.range[1], value.range[0]]) === "",
          label(node),
          "the CSS value must start immediately after its colon",
        )
      break
    }
    case "UsecaseAccTitleStatement":
    case "UsecaseAccDescrStatement":
    case "UsecaseAccDescrBlockStatement": {
      const block = node.type === "UsecaseAccDescrBlockStatement"
      const name =
        node.type === "UsecaseAccTitleStatement" ? "accTitle" : "accDescr"
      layout([
        name,
        block ? "{" : ":",
        ...child("value"),
        ...(block ? ["}"] : []),
      ])
      const start = own.tokens[1]?.range[1]
      const end = block
        ? own.tokens.at(-1)?.range[0]
        : lineEnd(reading, own.tokens[1]?.range[1] ?? node.range[1])
      const value = childOf(node, "value")
      if (start !== undefined && end !== undefined) {
        reading.problems.expectEqual(
          value === null ? "" : reading.written.of(value.range),
          reading.written.of([start, end]),
          label(node),
          "the accessibility value must fill its complete written interior",
        )
        reading.problems.expect(
          value === null || textOf(value) !== "",
          label(node),
          "exactly empty accessibility content must be null",
        )
      }
      reading.problems.expect(
        hws(
          reading.converted.of([
            own.tokens[0]?.range[1] ?? node.range[0],
            own.tokens[1]?.range[0] ?? node.range[0],
          ]),
        ),
        label(node),
        "accessibility prefix permits only HWS",
      )
      const before = reading.converted.of([0, node.range[0]])
      reading.problems.expect(
        hws(before.slice(before.lastIndexOf("\n") + 1)),
        label(node),
        "an accessibility form requires ASCII-HWS-only line start",
      )
      break
    }
    default:
      break
  }
}

/** Leaves must be lexical units of their position, beyond merely agreeing with their range text. */
function leaf(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | null,
): void {
  const value = reading.converted.of(node.range)
  const following = reading.converted.of([node.range[1], reading.text.length])
  if (node.type === "Identifier") {
    const isBoolean =
      parent?.type === "UsecaseMetadataProperty" &&
      childOf(parent, "value") === node
    const raw =
      parent?.type === "UsecaseJsonStatement" && childOf(parent, "id") === node
    reading.problems.expect(
      identifier(value, following, isBoolean, raw),
      label(node),
      "the value has no lexical Identifier unit in its position",
    )
    checkTokenKinds(reading, node, ["Identifier"], "a usecase identifier")
  } else if (node.type === "StringLiteral") {
    reading.problems.expect(
      node.closed === true && stringUnit(value, false),
      label(node),
      "the native string must be one closed plain-string unit",
    )
  } else if (node.type === "UsecaseLabel") {
    const kind = value.startsWith('"`')
      ? "markdown"
      : value.startsWith('"') || value.startsWith("'")
        ? "string"
        : "text"
    reading.problems.expectEqual(
      node.kind,
      kind,
      label(node),
      "the label kind from its written delimiter",
    )
    reading.problems.expect(
      kind === "text"
        ? textUnits(value, false, following) &&
            skipHws(value, 0) === 0 &&
            !["\t", " "].includes(value.slice(-1))
        : stringUnit(value, kind === "markdown"),
      label(node),
      "the label has no complete lexical unit in its position",
    )
    checkTokenKinds(
      reading,
      node,
      kind === "text" ? ["RawText"] : ["String", "StringFragment"],
      "a usecase label",
    )
    if (kind === "text") rawItem(reading, node)
    else
      reading.problems.expectEqual(
        nodeTokensIn(reading.root, node.range).map((token) => token.type),
        reading.written.stringTokenKinds(node.range),
        label(node),
        "the label's complete string item and its cut fragments",
      )
  } else if (node.type === "UsecaseIdentifier") {
    reading.problems.expect(
      propertyName(value),
      label(node),
      "the CSS property name has no lexical name production",
    )
    const tokens = nodeTokensIn(reading.root, node.range)
    const prefix = tokens[0]?.type === "Punctuator" ? tokens[0] : undefined
    const word = tokens[prefix === undefined ? 0 : 1]
    reading.problems.expect(
      tokens.length === (prefix === undefined ? 1 : 2) &&
        word?.type === "Identifier" &&
        (prefix === undefined ||
          (prefix.value.length >= 2 &&
            dashEnd(prefix.value, 0) === prefix.value.length)),
      label(node),
      "a CSS name requires one atomic Identifier word and an optional dash Punctuator",
    )
    if (word !== undefined) {
      const atom = reading.converted.of(word.range)
      reading.problems.expect(
        prefix === undefined
          ? !value.startsWith("--") && propertyName(atom)
          : asciiWord(atom) || keyword(atom),
        label(node),
        "the CSS name word must be one lexical atom in its position",
      )
    }
    if (prefix !== undefined && word !== undefined)
      reading.problems.expect(
        hws(reading.converted.of([prefix.range[1], word.range[0]])),
        label(node),
        "the CSS dash-prefix gap permits only HWS",
      )
  } else if (node.type === "UsecaseLiteral") {
    rawItem(reading, node)
    checkTokenKinds(reading, node, ["RawText"], "a usecase literal")
    if (parent?.type === "UsecaseStyleDeclaration")
      reading.problems.expect(
        textUnits(value, true, following) &&
          !["\t", " "].includes(value.slice(-1)),
        label(node),
        "the CSS value has no complete style-component production",
      )
    else if (
      parent?.type === "UsecaseActor" ||
      parent?.type === "UsecaseEntity"
    )
      reading.problems.expect(
        trimmed(value) !== "" && !value.includes("\n") && !value.includes(">>"),
        label(node),
        "the stereotype must be nonblank text before its first >>",
      )
    else if (parent?.type === "UsecaseAccDescrBlockStatement")
      reading.problems.expect(
        !value.includes("}"),
        label(node),
        "the accessibility block stops at its first closing brace",
      )
    else
      reading.problems.expect(
        !value.includes("\n"),
        label(node),
        "an accessibility line cannot contain a physical newline",
      )
  }
}

/** Complete syntax, lexical-context membership, coverage and native model acceptance. */
export function checkUsecaseTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  checkTokensInValueNodes(root, problems)
  comments(reading)
  for (const token of root.tokens)
    if (token.type === "Keyword") {
      const next = reading.converted.of([
        token.range[1],
        Math.min(text.length, token.range[1] + 1),
      ])
      problems.expect(
        (WORDS.includes(token.value) ||
          ["include", "extend"].includes(token.value.toLowerCase()) ||
          ["accTitle", "accDescr"].includes(token.value)) &&
          !isWordCharacter(next.charCodeAt(0)),
        label(token),
        "the keyword must be a complete unit with its exact spelling",
      )
    }
  walkNodes(root, (node, parent) => {
    checkChildTypes(reading, node, USECASE_CHILD_TYPES)
    checkFieldWords(reading, node, USECASE_FIELD_WORDS)
    checkListsWithAnEntry(reading, node, NONEMPTY)
    if (node.type === "UsecaseArrow" || node.type === "UsecaseOpeningArrow")
      arrow(reading, node)
    else if (node.type === "UsecaseJsonDataBlock") data(reading, node)
    else leaf(reading, node, parent)
    if (
      node.type.startsWith("Usecase") &&
      ![
        "UsecaseLabel",
        "UsecaseLiteral",
        "UsecaseIdentifier",
        "UsecaseArrow",
        "UsecaseOpeningArrow",
        "UsecaseJsonDataBlock",
      ].includes(node.type)
    ) {
      checkRangeIsHull(reading, node, ownOf(root, node))
      checkOwnKinds(reading, node, ownOf(root, node), USECASE_PUNCTUATORS)
      structure(reading, node, parent)
    }
  })
  try {
    validateUsecaseModel(text, root, root.body as unknown as UsecaseDiagram)
  } catch (error) {
    if (error instanceof UsecaseModelError)
      problems.report(
        `${error.node.type} at ${error.node.range[0]}-${error.node.range[1]}`,
        error.message,
      )
    else
      problems.report(
        label(root.body),
        `the native model cannot be read: ${error instanceof Error ? error.message : String(error)}`,
      )
  }
}
