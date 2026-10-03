/**
 * Rows of values, one value from each axis, in which every pair of values of
 * two different axes stands together in some row. A full product of the
 * axes holds the same pairs many times over; the rows make the same
 * combinations of two axes with a few hundred inputs instead of tens of
 * thousands. The rows come out the same on every run.
 *
 * The rows are made one at a time: the first pair that is not yet together
 * starts a row, and each other axis takes the value that makes the most new
 * pairs with the values the row has so far.
 */

/** The key of a value of an axis, for the pairs that are together. */
function pairKey(
  firstAxis: number,
  firstValue: number,
  secondAxis: number,
  secondValue: number,
): string {
  return `${firstAxis}:${firstValue}/${secondAxis}:${secondValue}`
}

/**
 * The rows, as indexes of the values of each axis, for axes of different
 * types. With `passes` above 1, the rows of the first pass are shifted that
 * many times, the values of axis `n` by `pass * (n + 1)` places, and the rows
 * of all passes are put together without the ones that stand twice: the
 * pairs are together in every pass, and the other combinations differ from
 * pass to pass, so that more of the combinations of three axes are tried.
 */
export function pairwiseIndexes(
  sizes: readonly number[],
  passes = 1,
): number[][] {
  const rows: number[][] = []
  const seen = new Set<string>()
  for (let pass = 0; pass < passes; pass++) {
    for (const base of findPairwiseRows(sizes)) {
      const row = base.map(
        (value, axis) => (value + pass * (axis + 1)) % sizes[axis],
      )
      const key = row.join(",")
      if (seen.has(key)) continue
      seen.add(key)
      rows.push(row)
    }
  }
  return rows
}

/** The rows of one pass. */
function findPairwiseRows(sizes: readonly number[]): number[][] {
  // One axis has no pair of axes: every value is a row.
  if (sizes.length === 1) {
    return Array.from({ length: sizes[0] }, (_, value) => [value])
  }
  const together = new Set<string>()
  const rows: number[][] = []

  /** How many pairs the value would make that are not together yet. */
  function countNew(
    row: readonly number[],
    axis: number,
    value: number,
  ): number {
    let count = 0
    for (const [other, otherValue] of row.entries()) {
      if (other === axis || otherValue < 0) continue
      const key =
        other < axis
          ? pairKey(other, otherValue, axis, value)
          : pairKey(axis, value, other, otherValue)
      if (!together.has(key)) count++
    }
    return count
  }

  for (let first = 0; first < sizes.length; first++) {
    for (let second = first + 1; second < sizes.length; second++) {
      for (let a = 0; a < sizes[first]; a++) {
        for (let b = 0; b < sizes[second]; b++) {
          if (together.has(pairKey(first, a, second, b))) continue
          const row = sizes.map(() => -1)
          row[first] = a
          row[second] = b
          for (let axis = 0; axis < sizes.length; axis++) {
            if (row[axis] >= 0) continue
            let best = 0
            let bestCount = -1
            for (let value = 0; value < sizes[axis]; value++) {
              const count = countNew(row, axis, value)
              if (count > bestCount) {
                best = value
                bestCount = count
              }
            }
            row[axis] = best
          }
          for (let x = 0; x < row.length; x++) {
            for (let y = x + 1; y < row.length; y++) {
              together.add(pairKey(x, row[x], y, row[y]))
            }
          }
          rows.push(row)
        }
      }
    }
  }
  return rows
}

/** Rows of values in which every pair of values of two axes is together. */
export function pairwise<T>(axes: readonly (readonly T[])[]): T[][] {
  return pairwiseIndexes(axes.map((axis) => axis.length)).map((row) =>
    row.map((index, axis) => axes[axis][index]),
  )
}
