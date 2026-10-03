/**
 * How long a check of `count` inputs with mermaid.js may take, in
 * milliseconds: five minutes, or 100 milliseconds an input when that is
 * longer, as the number of inputs grows with the fixtures.
 */
export function timeoutFor(count: number): number {
  return Math.max(300_000, count * 100)
}
