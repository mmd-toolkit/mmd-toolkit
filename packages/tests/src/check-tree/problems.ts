import { orderJsonKeys } from "../ordered-json.ts"
import type { Placed, TreeProblem } from "./types.ts"

/** `type` and range of `placed`, for the messages. */
export function label(placed: Placed): string {
  return `${placed.type} at ${placed.range[0]}-${placed.range[1]}`
}

/** The problems that the checks of a tree find, in the order they find them. */
export class Problems {
  public readonly list: TreeProblem[] = []

  /** Reports that the condition `where` names does not hold. */
  public report(where: string, message: string): void {
    this.list.push({ where, message })
  }

  /** Reports `message` when `condition` does not hold. */
  public expect(condition: boolean, where: string, message: string): void {
    if (!condition) this.report(where, message)
  }

  /**
   * Reports `message`, with both values, when `actual` is not `expected`,
   * compared as JSON with the keys of every object in alphabetical order, so
   * that two values that differ only in the order of the keys, as the `loc` of
   * a tree written by another parser may, are equal.
   */
  public expectEqual(
    actual: unknown,
    expected: unknown,
    where: string,
    message: string,
  ): void {
    const written = JSON.stringify(actual, orderJsonKeys)
    const wanted = JSON.stringify(expected, orderJsonKeys)
    if (written !== wanted) {
      this.report(where, `${message}: ${written ?? "undefined"}, not ${wanted}`)
    }
  }
}
