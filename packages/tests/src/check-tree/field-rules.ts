import { label } from "./problems.ts"
import { entriesOf, textOf } from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import type { CheckedNode } from "./types.ts"
import { isNode } from "./walk.ts"

// The rules of the fields of a node that the documents of the diagram types
// state in the same form: the types of the child nodes of a field, the words
// of a value field, and the lists that are never empty. Each diagram type gives
// its own tables, which its tests hold to its tree document.

/** Entries of a table by node type and then by field name. */
export type FieldTable<Entry> = Readonly<
  Record<string, Readonly<Record<string, Entry>>>
>

/** Checks that the node types in the fields of `node` are those that `table` gives. */
export function checkChildTypes(
  reading: Reading,
  node: CheckedNode,
  table: FieldTable<readonly string[]>,
): void {
  for (const [field, allowed] of Object.entries(table[node.type] ?? {})) {
    const value = node[field]
    for (const child of Array.isArray(value) ? (value as unknown[]) : [value]) {
      if (isNode(child)) {
        reading.problems.expect(
          allowed.includes(child.type),
          label(node),
          `the field ${field} holds a ${child.type}, not a ${allowed.join(" or ")}`,
        )
      }
    }
  }
}

/** Checks that each value field of `node` that has a fixed set of words in `table` holds one of them. */
export function checkFieldWords(
  reading: Reading,
  node: CheckedNode,
  table: FieldTable<readonly string[]>,
): void {
  for (const [field, words] of Object.entries(table[node.type] ?? {})) {
    reading.problems.expect(
      words.includes(textOf(node, field)),
      label(node),
      `the field ${field} is ${JSON.stringify(node[field])}, none of ${words.join(", ")}`,
    )
  }
}

/** Checks that the lists of `node` that `table` names for its type have an entry. */
export function checkListsWithAnEntry(
  reading: Reading,
  node: CheckedNode,
  table: Readonly<Record<string, readonly string[]>>,
): void {
  for (const field of table[node.type] ?? []) {
    reading.problems.expect(
      entriesOf(node, field).length > 0,
      label(node),
      `the list ${field} is empty`,
    )
  }
}
