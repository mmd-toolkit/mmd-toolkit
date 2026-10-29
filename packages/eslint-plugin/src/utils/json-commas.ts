/** Commas followed only by padding and a closing bracket, outside escaped JSON strings. */
export function trailingJsonCommas(text: string): number[] {
  const commas: number[] = []
  let quoted = false
  for (let at = 0; at < text.length; at++) {
    const character = text[at]
    if (quoted) {
      if (character === "\\") at++
      else if (character === '"') quoted = false
    } else if (character === '"') quoted = true
    else if (character === ",") {
      let next = at + 1
      while (next < text.length && text[next].trim() === "") next++
      if (text[next] === "}" || text[next] === "]") commas.push(at)
    }
  }
  return commas
}
