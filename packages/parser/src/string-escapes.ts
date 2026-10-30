/** gitgraph.md and wardley.md, Comparison values: decode each backslash pair once, without hexadecimal or octal extensions. */
export function decodeStringEscapes(text: string): string {
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
