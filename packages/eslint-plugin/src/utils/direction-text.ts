/** Whether a character merely ends a direction statement or pads its line. */
export function isSeparatorOrSpace(character: string): boolean {
  return character === ";" || character.trim() === ""
}

/** Whether a direction line drops text other than separators or a trailing comment. */
export function isIgnoredDirectionText(
  value: string,
  side: "before" | "after",
): boolean {
  const comment = side === "after" ? value.indexOf("%%") : -1
  const counted = comment === -1 ? value : value.slice(0, comment)
  return ![...counted].every(isSeparatorOrSpace)
}

/** TD and TB both mean top to bottom. */
export function comparableDirection(direction: string): string {
  return direction === "TD" ? "TB" : direction
}
