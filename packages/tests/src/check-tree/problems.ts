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

  /** Reports `message`, with both values, when `actual` is not `expected` (compared as JSON). */
  public expectEqual(
    actual: unknown,
    expected: unknown,
    where: string,
    message: string,
  ): void {
    const written = JSON.stringify(actual)
    const wanted = JSON.stringify(expected)
    if (written !== wanted) {
      this.report(where, `${message}: ${written ?? "undefined"}, not ${wanted}`)
    }
  }
}
