/** Remove separators only between digits, when the whole result is a decimal number. */
export function numberWithoutDigitSeparators(text: string): string | undefined {
  if (!text.includes("_")) return undefined
  const separated = [...text].every(
    (character, at) =>
      character !== "_" ||
      (text[at - 1] >= "0" &&
        text[at - 1] <= "9" &&
        text[at + 1] >= "0" &&
        text[at + 1] <= "9"),
  )
  const value = text.replaceAll("_", "")
  return separated &&
    /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/u.test(value.toLowerCase())
    ? value
    : undefined
}

/** A lone decimal comma before three digits could instead be a thousands separator. */
export function numberWithDecimalPoint(text: string): string | undefined {
  return /^[+-]?\d+,\d+$/u.test(text) &&
    text.length - text.indexOf(",") - 1 !== 3
    ? text.replace(",", ".")
    : undefined
}
