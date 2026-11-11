/**
 * The number in its shortest form: no `+`, no zero at the end of the fraction,
 * no `.` at its end, and a `0` before a `.` at its start. Undefined where the
 * text is no plain decimal, has a zero at the start of its integer part, is a
 * negative zero, or has more digits than a double holds exactly.
 */
export function shortestNumber(text: string): string | undefined {
  const negative = text.startsWith("-")
  const unsigned = negative || text.startsWith("+") ? text.slice(1) : text
  const dot = unsigned.indexOf(".")
  const integer = dot === -1 ? unsigned : unsigned.slice(0, dot)
  const fraction = dot === -1 ? "" : unsigned.slice(dot + 1)
  const digits = integer + fraction
  if (
    digits.length === 0 ||
    digits.length > 15 ||
    [...digits].some((character) => character < "0" || character > "9") ||
    (integer.length > 1 && integer.startsWith("0"))
  ) {
    return undefined
  }
  let kept = fraction.length
  while (kept > 0 && fraction[kept - 1] === "0") kept--
  const whole = integer === "" ? "0" : integer
  const value = kept === 0 ? whole : `${whole}.${fraction.slice(0, kept)}`
  return negative && value === "0" ? undefined : (negative ? "-" : "") + value
}
