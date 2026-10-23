import { normalizeLineTerminators } from "./acc-text.ts"

/** Normalize line terminators, trim both ends, and collapse runs of at least two spaces/tabs. */
export function commonTitleText(value: string): string {
  const text = normalizeLineTerminators(value).trim()
  let result = ""
  for (let at = 0; at < text.length; at++) {
    const character = text[at]
    if (character === " " || character === "\t") {
      const start = at
      while (text[at + 1] === " " || text[at + 1] === "\t") at++
      result += at === start ? character : " "
    } else {
      result += character
    }
  }
  return result
}

/** Trim both ends and collapse runs of at least two spaces/tabs, keeping interior LS/PS as text. */
export function descriptionLineText(value: string): string {
  return commonTitleText(value)
}

/** Apply line-value normalization, then trim LF/LS/PS line edges and remove empty lines. */
export function descriptionBlockText(value: string): string {
  const text = descriptionLineText(value)

  let result = ""
  let start = 0
  for (let at = 0; at < text.length; at++) {
    const character = text[at]
    if (
      character === "\n" ||
      character === "\u2028" ||
      character === "\u2029"
    ) {
      result += text.slice(start, at).trimEnd() + character
      while (text[at + 1]?.trim() === "") at++
      start = at + 1
    }
  }
  return result + text.slice(start)
}
