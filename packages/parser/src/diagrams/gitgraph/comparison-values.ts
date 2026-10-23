import { isWhitespace } from "../../character-classes.ts"

/** Comparison values: decode each backslash pair once, without hexadecimal or octal extensions. */
export function decodeGitgraphString(text: string): string {
  let value = ""
  let escaped = false
  for (const character of text.slice(1, -1)) {
    if (!escaped) {
      if (character === "\\") escaped = true
      else value += character
      continue
    }
    escaped = false
    switch (character) {
      case "b":
        value += "\b"
        break
      case "f":
        value += "\f"
        break
      case "n":
        value += "\n"
        break
      case "r":
        value += "\r"
        break
      case "t":
        value += "\t"
        break
      case "v":
        value += "\v"
        break
      case "0":
        value += "\0"
        break
      default:
        value += character
    }
  }
  return value
}

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
