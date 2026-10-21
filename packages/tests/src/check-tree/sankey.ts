import {
  isLineTerminatorCode,
  isWhitespace,
} from "../db-from-tree/characters.ts"
import { checkChildTypes, checkListsWithAnEntry } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  between,
  checkOwnKinds,
  checkRangeIsHull,
  checkTokenKinds,
  childOf,
  endsWithWhitespace,
  entriesOf,
  ownOf,
  readingOf,
  startsWithWhitespace,
  textOf,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

// ast/sankey.md and diagrams/sankey.md: what the sankey documents state about
// the tree beyond the conditions of every tree (ast.md): the fields of the
// nodes, and the characters that the values hold.
// parser/docs/tokens/sankey.md and parser/docs/positions/sankey.md: the tokens
// that a node writes itself, their kinds, the kinds of the tokens of a value,
// and the ranges of the nodes.

/**
 * ast/sankey.md: the node types that a field of a node type holds, as the Type
 * column of its table gives them; a field that holds a value is not in it.
 * `tests/check-tree-sankey.test.ts` requires the table to be that column.
 */
export const SANKEY_CHILD_TYPES: FieldTable<readonly string[]> = {
  SankeyDiagram: { body: ["SankeyLinkStatement"] },
  SankeyLinkStatement: {
    source: ["SankeyIdentifier", "StringLiteral"],
    target: ["SankeyIdentifier", "StringLiteral"],
    value: ["SankeyLiteral", "StringLiteral"],
  },
}

/** ast/sankey.md, SankeyDiagram: the lists of a node type that are never empty. */
const LISTS_WITH_AN_ENTRY: Readonly<Record<string, readonly string[]>> = {
  SankeyDiagram: ["body"],
}

/** The value field of the node types that hold the text of a field without quotes. */
const TEXT_FIELD_OF: Readonly<Record<string, string>> = {
  SankeyIdentifier: "name",
  SankeyLiteral: "value",
}

const QUOTE = '"'
const COMMA = ","
const LINE_FEED = "\n"
const CARRIAGE_RETURN = "\r"

/** Whether `character` is a character from U+0020 to U+007E (diagrams/sankey.md, Characters). */
function isPrintableAscii(character: string): boolean {
  return character >= " " && character <= "~"
}

/** The characters of `text` that `allowed` does not allow, each once. */
function disallowedIn(
  text: string,
  allowed: (character: string) => boolean,
): string[] {
  return [...new Set([...text].filter((character) => !allowed(character)))]
}

/**
 * ast/sankey.md, SankeyIdentifier and SankeyLiteral: the value of a field
 * without quotes is the field without the whitespace at its ends, and holds
 * the spaces between its characters and every printable character of ASCII but
 * `"` and `,`; the `"` of an HTML attribute quote is read as `'` and is no `"`
 * (diagrams/sankey.md, Characters). An identifier or a value of spaces only is
 * empty.
 */
function checkTextField(
  reading: Reading,
  node: CheckedNode,
  field: string,
): void {
  const value = textOf(node, field)
  const where = label(node)
  reading.problems.expect(
    !startsWithWhitespace(value) && !endsWithWhitespace(value),
    where,
    `the ${field} ${JSON.stringify(value)} starts or ends with whitespace`,
  )
  const read = reading.attributeValueOf(
    node,
    field === "name" ? "name" : "value",
    true,
  )
  const others = disallowedIn(
    read,
    (character) =>
      isPrintableAscii(character) && character !== QUOTE && character !== COMMA,
  )
  reading.problems.expect(
    others.length === 0,
    where,
    `the ${field} ${JSON.stringify(value)} holds ${others.map((character) => JSON.stringify(character)).join(", ")}, which a field without quotes does not hold`,
  )
}

/** The lengths of the runs of `"` in `text`, in order. */
function quoteRunLengths(text: string): number[] {
  const lengths: number[] = []
  let length = 0
  for (const character of text) {
    if (character === QUOTE) {
      length += 1
    } else {
      if (length > 0) lengths.push(length)
      length = 0
    }
  }
  if (length > 0) lengths.push(length)
  return lengths
}

/**
 * ast/ast.md, StringLiteral, and diagrams/sankey.md, Strings: a string of a
 * field is closed, has a character between its quotes, and holds printable
 * characters of ASCII and line terminators; a `"` of its content stands in a
 * pair of `"`, since a single `"` closes the string, but for the `"` of an HTML
 * attribute quote, which is read as `'` (diagrams/sankey.md, Characters).
 */
function checkString(reading: Reading, node: CheckedNode): void {
  const value = textOf(node)
  const where = label(node)
  reading.problems.expect(
    node.closed === true,
    where,
    "the string is not closed",
  )
  reading.problems.expect(
    value !== "",
    where,
    "the string has nothing between its quotes",
  )
  const read = reading.attributeValueOf(node)
  const others = disallowedIn(
    read,
    (character) =>
      isPrintableAscii(character) ||
      character === LINE_FEED ||
      character === CARRIAGE_RETURN,
  )
  reading.problems.expect(
    others.length === 0,
    where,
    `the string ${JSON.stringify(value)} holds ${others.map((character) => JSON.stringify(character)).join(", ")}, which a string does not hold`,
  )
  reading.problems.expect(
    quoteRunLengths(read).every((length) => length % 2 === 0),
    where,
    `the string ${JSON.stringify(value)} holds a \`"\` that is not in a pair of \`"\`, which would close it`,
  )
}

/**
 * parser/docs/tokens/sankey.md, Tokens: the tokens that a node writes itself
 * are the `Keyword` token of the header, in the diagram, and the two `,`
 * `Punctuator` tokens of a record, in a link.
 */
const SANKEY_PUNCTUATORS: readonly string[] = [","]

/** diagrams/sankey.md, Detection: the two headers, in lower case. */
const HEADERS: readonly string[] = ["sankey", "sankey-beta"]

/**
 * diagrams/sankey.md, Diagram and records: the header stands alone on its
 * line, and each record is on a line of its own; so a line terminator lies
 * between the header and the first record, and between two records, with
 * nothing but whitespace besides (a line feed is a `newline` unit, which is all
 * whitespace). The written text between them leaves out the directives and the
 * comment lines.
 */
function checkLineBreak(
  reading: Reading,
  node: CheckedNode,
  from: number,
  to: number,
  what: string,
): void {
  const gap = between(reading, from, to)
  reading.problems.expect(
    [...gap].every((character) =>
      isWhitespace(character.codePointAt(0) ?? 0),
    ) &&
      [...gap].some((character) =>
        isLineTerminatorCode(character.codePointAt(0) ?? 0),
      ),
    label(node),
    `the written text between ${what} is ${JSON.stringify(gap)}, not whitespace with a line terminator`,
  )
}

/**
 * diagrams/sankey.md, Diagram and records, and parser/docs/tokens/sankey.md,
 * Tokens: the header is the one token that the diagram writes itself, a
 * `Keyword` token that is `sankey` or `sankey-beta`; the header and the first
 * record, and each two records, lie on lines of their own.
 */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const where = label(node)
  checkOwnKinds(reading, node, own, SANKEY_PUNCTUATORS)
  reading.problems.expect(
    own.tokens.length === 1 && HEADERS.includes(own.text.toLowerCase()),
    where,
    `the tokens of the node outside its child nodes, joined, are ${JSON.stringify(own.text)}, not the header (${HEADERS.join(" or ")})`,
  )
  checkRangeIsHull(reading, node, own)
  const links = entriesOf(node, "body")
  let end = own.tokens[0]?.range[1]
  for (const link of links) {
    if (link === null) continue
    if (end !== undefined) {
      checkLineBreak(
        reading,
        node,
        end,
        link.range[0],
        "the header or a record and the record after it",
      )
    }
    end = link.range[1]
  }
}

/**
 * ast/sankey.md, SankeyLinkStatement, and parser/docs/positions/sankey.md,
 * SankeyLinkStatement: the node writes two `,` `Punctuator` tokens, and its
 * fields lie in the order source, `,`, target, `,`, value with nothing but
 * whitespace between them; the range runs from the source to the value.
 */
function checkLink(reading: Reading, node: CheckedNode): void {
  const own = ownOf(reading.root, node)
  const where = label(node)
  checkOwnKinds(reading, node, own, SANKEY_PUNCTUATORS)
  reading.problems.expectEqual(
    own.text,
    ",,",
    where,
    "the tokens of the node outside its child nodes, joined",
  )
  checkRangeIsHull(reading, node, own)
  const [first, second] = own.tokens
  const source = childOf(node, "source")
  const target = childOf(node, "target")
  const value = childOf(node, "value")
  if (
    first === undefined ||
    second === undefined ||
    source === null ||
    target === null ||
    value === null
  ) {
    return
  }
  const parts: [string, number, number][] = [
    ["the source and the first `,`", source.range[1], first.range[0]],
    ["the first `,` and the target", first.range[1], target.range[0]],
    ["the target and the second `,`", target.range[1], second.range[0]],
    ["the second `,` and the value", second.range[1], value.range[0]],
  ]
  for (const [what, from, to] of parts) {
    reading.problems.expect(
      from <= to &&
        [...between(reading, from, to)].every((character) =>
          isWhitespace(character.codePointAt(0) ?? 0),
        ),
      where,
      `the fields and the \`,\` are not in the order source, \`,\`, target, \`,\`, value, with whitespace only between them: ${what}`,
    )
  }
}

/**
 * parser/docs/tokens/sankey.md, Tokens, and positions/sankey.md,
 * SankeyIdentifier and SankeyLiteral: the tokens of a field without quotes are
 * `RawText` tokens, which a directive or an ignored `;` may cut into several.
 * They hold no whitespace at the ends of the field; a field of whitespace only
 * has one token, its whitespace, and the empty value.
 */
function checkFieldTokens(
  reading: Reading,
  node: CheckedNode,
  field: string,
): void {
  checkTokenKinds(reading, node, ["RawText"], `a ${node.type}`)
  const tokens = nodeTokensIn(reading.root, node.range)
  const first = tokens[0]
  const last = tokens.at(-1)
  if (first === undefined || last === undefined) return
  const where = label(node)
  if (textOf(node, field) === "") {
    reading.problems.expect(
      tokens.length === 1 &&
        [...first.value].every((character) =>
          isWhitespace(character.codePointAt(0) ?? 0),
        ),
      where,
      "an empty value is not the one token of the whitespace of a field of whitespace only",
    )
    return
  }
  reading.problems.expect(
    !startsWithWhitespace(first.value) && !endsWithWhitespace(last.value),
    where,
    "a token of the field starts or ends with whitespace, though the field is not whitespace only",
  )
}

/**
 * Checks what the sankey documents state about a sankey tree beyond the
 * conditions of every tree (ast.md): the tokens of values lie in value nodes,
 * the child nodes are of the types that the table gives, the body has a link,
 * the header, the commas, and the fields are the tokens and lie where the
 * documents of the parser put them, and the values of the fields hold the
 * characters that the lexer reads in them.
 */
export function checkSankeyTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading = readingOf(text, root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, SANKEY_CHILD_TYPES)
    checkListsWithAnEntry(reading, node, LISTS_WITH_AN_ENTRY)
    const field = TEXT_FIELD_OF[node.type]
    if (field !== undefined) {
      checkTextField(reading, node, field)
      checkFieldTokens(reading, node, field)
    }
    if (node.type === "StringLiteral") checkString(reading, node)
    if (node.type === "SankeyDiagram") checkDiagram(reading, node)
    if (node.type === "SankeyLinkStatement") checkLink(reading, node)
  })
}
