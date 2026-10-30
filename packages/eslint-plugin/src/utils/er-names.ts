import type { ErIdentifier, StringLiteral } from "@mmd-toolkit/parser"

/**
 * The text of a name of an ER diagram: an entity name, an alias, or the id of a
 * subgraph. It is the written name of an `ErIdentifier`, and the content of a
 * `StringLiteral` (a quoted name, without its quotes). A quoted name and the
 * bare name with the same text are one name. The conversion of entities that
 * mermaid.js makes on the text is not repeated: two names that differ only in
 * it compare as different.
 */
export function erNameText(name: ErIdentifier | StringLiteral): string {
  return name.type === "ErIdentifier" ? name.name : name.value
}
