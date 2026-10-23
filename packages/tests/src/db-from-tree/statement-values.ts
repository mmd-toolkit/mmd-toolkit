import { trimmed } from "./values.ts"

/** Decodes the specified string escapes after common text conversion. */
export function decodedString(text: string): string {
  const escapes: Readonly<Record<string, string>> = {
    b: "\b",
    f: "\f",
    n: "\n",
    r: "\r",
    t: "\t",
    v: "\v",
    "0": "\0",
  }
  let decoded = ""
  for (let at = 0; at < text.length; at++) {
    const character = text.charAt(at)
    if (character !== "\\") decoded += character
    else {
      const escaped = text.charAt(++at)
      decoded += escapes[escaped] ?? escaped
    }
  }
  return decoded
}

/** Trims and collapses common line or block values for the Db summary. */
export function commonValue(text: string, block: boolean): string {
  if (!block) return trimmed(text).replace(/[\t ]{2,}/gu, " ")
  return text
    .replace(/^\s*/gmu, "")
    .replace(/\s+$/gmu, "")
    .replace(/[\t ]{2,}/gu, " ")
    .replace(/[\n\r]{2,}/gu, "\n")
}
