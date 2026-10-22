/** common.md, Notation: whitespace. */
export function isWhitespace(codeUnit: number): boolean {
  return (
    (codeUnit >= 0x09 && codeUnit <= 0x0d) ||
    codeUnit === 0x20 ||
    codeUnit === 0xa0 ||
    codeUnit === 0x1680 ||
    (codeUnit >= 0x2000 && codeUnit <= 0x200a) ||
    codeUnit === 0x2028 ||
    codeUnit === 0x2029 ||
    codeUnit === 0x202f ||
    codeUnit === 0x205f ||
    codeUnit === 0x3000 ||
    codeUnit === 0xfeff
  )
}

/** common.md, Notation: an ASCII digit. */
export function isDigit(codeUnit: number): boolean {
  return codeUnit >= 0x30 && codeUnit <= 0x39
}

/** common.md, Notation: a word character. */
export function isWordCharacter(codeUnit: number | undefined): boolean {
  return (
    codeUnit !== undefined &&
    (isDigit(codeUnit) ||
      (codeUnit >= 0x41 && codeUnit <= 0x5a) ||
      (codeUnit >= 0x61 && codeUnit <= 0x7a) ||
      codeUnit === 0x5f)
  )
}

/** Whether `code` is a line terminator character (common.md, Notation): `\n` or `\r`. */
export function isLineTerminatorCode(code: number): boolean {
  return code === 0x0a || code === 0x0d
}

/** Whether the character of `text` at `offset` is whitespace or part of a line terminator. */
export function isWhitespaceAt(text: string, offset: number): boolean {
  const codePoint = text.codePointAt(offset)
  return codePoint !== undefined && isWhitespace(codePoint)
}

/** ASCII keyword comparison: change A to Z only, preserving every other character. */
export function lowercaseAscii(text: string): string {
  let lower = ""
  for (const character of text) {
    lower +=
      character >= "A" && character <= "Z" ? character.toLowerCase() : character
  }
  return lower
}
