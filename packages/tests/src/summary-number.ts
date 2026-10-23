/**
 * A number the Db reads from text (`parseFloat()`, `Number()`) as a summary
 * holds it: the number itself if it is finite, and its text (`"NaN"`,
 * `"Infinity"`, `"-Infinity"`) otherwise, since JSON has no such number. JSON
 * has no -0 either, so -0 is 0. The normalizers and the builders of
 * `dbFromTree()` both use it, so that the one decision of the summary's form is
 * in one place.
 */
export function numberOrText(value: number): number | string {
  if (!Number.isFinite(value)) return String(value)
  return Object.is(value, -0) ? 0 : value
}
