import { isWhitespace } from "../../character-classes.ts"

/** Comparison values: the end of a complete break form at the given opening angle, or null. */
function breakEndAt(value: string, start: number): number | null {
  let offset = start + 1
  if (value[offset] === "/") offset += 1
  if (value[offset] !== "b" && value[offset] !== "B") return null
  offset += 1
  if (value[offset] !== "r" && value[offset] !== "R") return null
  offset += 1
  while (offset < value.length && isWhitespace(value.codePointAt(offset)!))
    offset += 1
  if (value[offset] === "/") offset += 1
  return value[offset] === ">" ? offset + 1 : null
}

/** Comparison values: replace break forms, escape the result, then replace nonoverlapping placeholders. */
export function escapeGitgraphComparison(value: string): string {
  let breakPlaceholders = ""
  for (let offset = 0; offset < value.length;) {
    const character = String.fromCodePoint(value.codePointAt(offset)!)
    if (character === "<") {
      const end = breakEndAt(value, offset)
      if (end !== null) {
        breakPlaceholders += "#br#"
        offset = end
        continue
      }
    }
    breakPlaceholders += character
    offset += character.length
  }
  const escaped = breakPlaceholders
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("=", "&equals;")
  return escaped.replaceAll("#br#", "<br/>")
}
