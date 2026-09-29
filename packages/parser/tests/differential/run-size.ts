/**
 * The size of a run of a differential test: `fallback`, kept small for CI,
 * or the positive integer that the environment variable `variable` gives.
 * A larger check sets the variable instead of editing the tracked test.
 * Throws when the variable holds anything other than a positive integer.
 */
export function runSizeFromEnvironment(
  variable: string,
  fallback: number,
): number {
  // eslint-disable-next-line no-process-env -- the size of a run comes from outside, so that a larger check does not edit a tracked file
  const written = process.env[variable]
  if (written === undefined) return fallback
  const size = Number(written)
  if (!Number.isInteger(size) || size <= 0) {
    throw new Error(
      `${variable} must be a positive integer, not ${JSON.stringify(written)}`,
    )
  }
  return size
}

/**
 * How long a check of `count` inputs with mermaid.js may take, in
 * milliseconds: five minutes, or 100 milliseconds an input when that is
 * longer, so that a larger run that the environment asks for has the time
 * it needs.
 */
export function timeoutFor(count: number): number {
  return Math.max(300_000, count * 100)
}
