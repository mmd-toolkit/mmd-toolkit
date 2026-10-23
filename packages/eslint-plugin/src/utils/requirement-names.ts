import type { RequirementName } from "@mmd-toolkit/parser"

/**
 * The text of a name of a requirement diagram: the name of a requirement, of an
 * element, of a class, or an end of a relationship. It is the written name of a
 * `RequirementIdentifier` and the content of a `StringLiteral` (a quoted name,
 * without its quotes). A quoted name and the bare name with the same text are
 * one name, and names that differ in case are two. The conversion of entities
 * that mermaid.js makes on the text is not repeated: two names that differ only
 * in it compare as different.
 */
export function requirementNameText(name: RequirementName): string {
  return name.type === "StringLiteral" ? name.value : name.name
}
