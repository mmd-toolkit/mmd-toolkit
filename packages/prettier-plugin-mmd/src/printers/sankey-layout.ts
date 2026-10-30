import type { Node, SankeyLinkStatement } from "@mmd-toolkit/parser"
import type { Atom, AtomLayout, GapRule } from "./atoms.ts"
import { collectAtoms } from "./layout.ts"
import type { Source } from "./source.ts"

/**
 * The node types of a sankey diagram whose text is a value, printed as
 * written: the ids and the value of a link written without quotes, and a
 * field in quotes, which is a StringLiteral, one of the shared leaf nodes.
 * They have no child fields; `tests/value-nodes.test.ts` checks that every
 * other such node type is left out on purpose.
 */
export const sankeyValueNodeTypes: ReadonlySet<Node["type"]> = new Set([
  "SankeyIdentifier",
  "SankeyLiteral",
  "StringLiteral",
])

/**
 * The fields of a link, in source order. A field without quotes that holds
 * only spaces has an empty text, and its range is the spaces.
 */
function fieldsOf(statement: SankeyLinkStatement): Node[] {
  return [statement.source, statement.target, statement.value]
}

/**
 * Whether a field is written without quotes and holds only spaces, which
 * mermaid.js reads as a field with an empty text: it is printed as one space
 * (docs/sankey.md, Commas).
 */
function isSpacesOnly(field: Node): boolean {
  return (
    (field.type === "SankeyIdentifier" && field.name === "") ||
    (field.type === "SankeyLiteral" && field.value === "")
  )
}

/**
 * Where the printed text of a link ends: at its last token, or, for a value of
 * spaces only, after the first of its spaces.
 */
export function findSankeyPrintedEnd(statement: SankeyLinkStatement): number {
  const { value } = statement
  return isSpacesOnly(value) ? value.range[0] + 1 : statement.range[1]
}

/**
 * The layout of a link: its three fields and the two commas, which touch the
 * fields on both sides, since a field without quotes is read without the
 * whitespace at its ends and mermaid.js rejects a space next to a quote
 * (docs/sankey.md, Commas). The fields are printed as written, and a field of
 * spaces only as its first space.
 */
export function layoutSankeyLink(
  source: Source,
  statement: SankeyLinkStatement,
): AtomLayout {
  const fields = fieldsOf(statement)
  const atoms: Atom[] = collectAtoms(
    source,
    statement.range[0],
    statement.range[1],
    fields,
    [],
  ).map((atom) => {
    const field = fields.find((candidate) => candidate.range[0] === atom.start)
    return field !== undefined && isSpacesOnly(field)
      ? { start: atom.start, end: atom.start + 1 }
      : atom
  })
  const rules = new Map<number, GapRule>(
    atoms.slice(1).map((atom) => [atom.start, "none"]),
  )
  return { atoms, rules, outdented: new Set(), lineBreaks: "kept" }
}
