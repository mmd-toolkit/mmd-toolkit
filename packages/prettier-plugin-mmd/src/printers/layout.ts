import type { Node, Range, Token } from "@mmd-toolkit/parser"
import { visitorKeys } from "@mmd-toolkit/parser"
import type { Atom } from "./atoms.ts"
import type { Source } from "./source.ts"
import {
  findStructuralToken,
  findTokenEndingBefore,
  findTokenStartingAt,
  findTokensBetween,
  findTriviaBetween,
  isStructural,
} from "./source.ts"

/**
 * The nodes below a statement whose text is a value, of one of
 * `valueTypes`: each is printed as written.
 */
export function collectValueNodes(
  statement: Node,
  valueTypes: ReadonlySet<Node["type"]>,
): Node[] {
  const values: Node[] = []
  walk(statement, (node) => {
    if (valueTypes.has(node.type)) values.push(node)
  })
  return values
}

/**
 * Calls `visit` for every node below `node`, not for `node` itself, in the
 * order of the parser's `visitorKeys`. Value nodes have no child fields.
 */
export function walk(node: Node, visit: (node: Node) => void): void {
  for (const key of visitorKeys[node.type]) {
    const value = (node as unknown as Record<string, unknown>)[key]
    const children = Array.isArray(value) ? value : [value]
    for (const child of children as (Node | null)[]) {
      if (child === null) continue
      visit(child)
      walk(child, visit)
    }
  }
}

/**
 * The atoms in `[start, end)`: the kept stretches, the value nodes outside
 * them, and the structural tokens outside both, in source order. The other
 * tokens outside them, the `;` tokens, separate statements or are items of
 * the gaps (see `isStructural` and gap.ts).
 */
export function collectAtoms(
  source: Source,
  start: number,
  end: number,
  values: readonly Node[],
  kept: readonly Atom[],
): Atom[] {
  const covered: Atom[] = [...kept]
  for (const value of values) {
    if (kept.some((stretch) => overlapsPartly(stretch, value.range))) {
      throw new Error(
        `prettier-plugin-mmd: a kept stretch cuts the ${value.type} at offset ${value.range[0]}`,
      )
    }
    if (!kept.some((stretch) => contains(stretch, value.range))) {
      covered.push({ start: value.range[0], end: value.range[1] })
    }
  }
  const atoms = [...covered]
  for (const token of findTokensBetween(source, start, end)) {
    if (
      isStructural(source, token) &&
      !covered.some((atom) => contains(atom, token.range))
    ) {
      atoms.push(toAtom(token))
    }
  }
  return atoms.sort((a, b) => a.start - b.start)
}

/**
 * Whether a stretch and a range share text without one containing the
 * other: the shared text would be printed twice.
 */
function overlapsPartly(stretch: Atom, range: Range): boolean {
  const shares = stretch.start < range[1] && range[0] < stretch.end
  return (
    shares &&
    !contains(stretch, range) &&
    !(range[0] <= stretch.start && stretch.end <= range[1])
  )
}

/** Whether `outer` contains the range. */
function contains(outer: Atom, range: Range): boolean {
  return outer.start <= range[0] && range[1] <= outer.end
}

/** The atom of a token. */
function toAtom(token: Token): Atom {
  return { start: token.range[0], end: token.range[1] }
}

/**
 * Whether the text of a statement from `start` to `end` lies on several
 * lines and cannot be joined into one: it holds a comment or a directive, or
 * a `;`. Where the lexer reads the line breaks inside a statement as
 * whitespace, a printer joins the lines of the statement; a comment would
 * then take the rest of the line, and a `;` could come to a line that
 * matches the line rule (common.md, `style` and `classDef` lines) while it
 * did not on its own line, so the rule would ignore it and the text would
 * change: `classDef`, a line break, and `c fill:#f00;` has the entity `#f00;`
 * in its style, and `classDef c fill:#f00;` has the style `fill:#f00`. Such a
 * statement is kept as written (docs/sequence.md and docs/class.md,
 * Multi-line statements).
 */
export function spansLinesThatCannotJoin(
  source: Source,
  start: number,
  end: number,
): boolean {
  const text = source.text.slice(start, end)
  return (
    text.includes("\n") &&
    (text.includes(";") || findTriviaBetween(source, start, end).length > 0)
  )
}

/** Fails when a token that the tree implies is missing. */
export function expectToken(token: Token | undefined, what: string): Token {
  if (token === undefined) {
    throw new Error(`prettier-plugin-mmd: no token for ${what}`)
  }
  return token
}

/** Fails when a token is not the one that the tree implies. */
export function expectValue(token: Token, value: string): void {
  if (token.value !== value) {
    throw new Error(
      `prettier-plugin-mmd: expected the token ${JSON.stringify(value)}, found ${JSON.stringify(token.value)} at offset ${token.range[0]}`,
    )
  }
}

/**
 * An `accDescr { ... }` block statement, of any diagram type: its text, and
 * whether a `}` closes it.
 */
export interface AccDescrBlock {
  readonly range: Range
  readonly value: Node | null
  readonly closed: boolean
}

/**
 * The stretch of an `accDescr { ... }` block that is printed exactly as
 * written: from the `{` to the end of its text and of the comments and
 * directives after the text, when the text starts on a later line than the
 * `{`. Its lines keep their columns (docs/flowchart.md, Multi-line values),
 * the first one included, and comment lines among them stay where they
 * are. The whitespace after the `{` is read with the `{`, so the text on
 * the line of the `{` is spaced as any other token.
 */
export function findAccDescrBlockStretches(
  source: Source,
  statement: AccDescrBlock,
): Atom[] {
  const brace = expectToken(
    findStructuralToken(
      source,
      expectToken(findTokenStartingAt(source, statement.range[0]), "`accDescr`")
        .range[1],
    ),
    "the `{` of an accDescr block",
  )
  expectValue(brace, "{")
  const { value } = statement
  if (value === null) return []
  if (!source.text.slice(brace.range[1], value.range[0]).includes("\n")) {
    return []
  }
  const lastTrivia = findTriviaBetween(
    source,
    value.range[1],
    statement.range[1],
  ).at(-1)
  return [
    {
      start: brace.range[0],
      end: Math.max(value.range[1], lastTrivia?.range[1] ?? 0),
    },
  ]
}

/**
 * The start of the `}` that closes an `accDescr` block, whose line starts
 * at the statement's indentation, or null when the block is not closed. The
 * lines of its text are kept as written (see `findAccDescrBlockStretches`),
 * and the whitespace before the `}` is neither in the text nor in the Db,
 * so the `}` lines up with the `accDescr` that it closes.
 */
export function findAccDescrBlockClosing(
  source: Source,
  statement: AccDescrBlock,
): number | null {
  if (!statement.closed) return null
  const closing = expectToken(
    findTokenEndingBefore(source, statement.range[1]),
    "the `}` of an accDescr block",
  )
  expectValue(closing, "}")
  return closing.range[0]
}

/**
 * The text with its ASCII letters in lower case. The lexer compares
 * keywords case-insensitively (common.md, Notation), and with an ASCII word
 * only the ASCII letters of either case match: a character outside ASCII
 * whose uppercase would be an ASCII letter keeps itself.
 */
export function toAsciiLowerCase(text: string): string {
  return [...text]
    .map((character) =>
      character >= "A" && character <= "Z"
        ? character.toLowerCase()
        : character,
    )
    .join("")
}
