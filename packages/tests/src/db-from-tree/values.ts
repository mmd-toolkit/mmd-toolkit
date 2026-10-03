import { isWhitespace } from "./characters.ts"

// The steps that build the Db that several diagrams share:
// docs/db-from-tree/flowchart.md and docs/db-from-tree/sequence.md read accessibility values
// and write the keys that the input names in the same way.

/** The text `text` without the whitespace at its start and at its end (Notation). */
export function trimmed(text: string): string {
  let start = 0
  let end = text.length
  while (start < end && isWhitespace(text.charCodeAt(start))) start += 1
  while (end > start && isWhitespace(text.charCodeAt(end - 1))) end -= 1
  return text.slice(start, end)
}

/**
 * Accessibility statements: the description that a value gives: trimmed,
 * with each line feed, together with the whitespace that follows it, line
 * feeds included, replaced by one line feed.
 */
export function descriptionOf(value: string): string {
  const text = trimmed(value)
  let description = ""
  let offset = 0
  while (offset < text.length) {
    const character = text[offset]
    description += character
    offset += 1
    if (character === "\n") {
      while (offset < text.length && isWhitespace(text.charCodeAt(offset))) {
        offset += 1
      }
    }
  }
  return description
}

/**
 * Sets `key` of `target` to `value` as an own property, whatever the name:
 * a name that the input gives, such as `__proto__`, is a key of the Db like
 * any other, while an assignment `target[key] = value` would set the
 * prototype for `__proto__` instead.
 */
export function setOwnProperty(
  target: object,
  key: string,
  value: unknown,
): void {
  Object.defineProperty(target, key, {
    value,
    writable: true,
    enumerable: true,
    configurable: true,
  })
}
