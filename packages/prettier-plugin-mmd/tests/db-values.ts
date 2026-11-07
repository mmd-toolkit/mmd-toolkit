import type { JsonObject, JsonValue } from "@mmd-toolkit/tests"

/** A JSON record, excluding arrays, primitives, null and an absent value. */
export function objectOf(value: JsonValue | undefined): JsonObject | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : undefined
}

/** The number of ASCII spaces that start a text; tabs and others are content. */
export function leadingSpaces(value: string): number {
  let end = 0
  while (value[end] === " ") end++
  return end
}

/** The text without the spaces and tabs at its ends. */
export function withoutBlanks(text: string): string {
  let start = 0
  let end = text.length
  while (start < end && (text[start] === " " || text[start] === "\t")) start++
  while (end > start && (text[end - 1] === " " || text[end - 1] === "\t")) end--
  return text.slice(start, end)
}
