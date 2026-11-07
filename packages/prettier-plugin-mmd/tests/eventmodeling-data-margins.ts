import type { DbSummary, JsonValue } from "@mmd-toolkit/tests"
import { leadingSpaces, objectOf } from "./db-values.ts"

/**
 * Exposes the formatter's permitted block-margin difference without changing
 * either raw Db. Every other field remains the formatted text's actual value.
 */
export function eventmodelingDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
): DbSummary | null {
  if (!Array.isArray(before?.frames) || !Array.isArray(after?.frames))
    return after
  const framesBefore: readonly JsonValue[] = before.frames
  const framesAfter: readonly JsonValue[] = after.frames
  return {
    ...after,
    frames: framesAfter.map((frame, index) => {
      const previous = objectOf(framesBefore[index])
      const current = objectOf(frame)
      const dataBefore = objectOf(previous?.data)
      const dataAfter = objectOf(current?.data)
      if (
        current === undefined ||
        dataBefore?.kind !== "block" ||
        dataAfter?.kind !== "block" ||
        typeof dataBefore.value !== "string" ||
        typeof dataAfter.value !== "string" ||
        !isAllowedMarginChange(dataBefore.value, dataAfter.value)
      )
        return frame
      return { ...current, data: { ...dataAfter, value: dataBefore.value } }
    }),
  }
}

/**
 * Compares every authored block, including unused declarations and notes.
 * Directives and all changes beyond the permitted margin remain observable.
 */
export function eventmodelingEmbeddedForFormattingComparison(
  before: readonly string[],
  after: readonly string[],
): readonly string[] {
  return after.map((value, index) => {
    const previous = before[index]
    return previous !== undefined && isAllowedMarginChange(previous, value)
      ? previous
      : value
  })
}

/**
 * Checks that nonblank rows share one positive ASCII-space margin,
 * independently of how the printer plans their leading spaces.
 * Content and the renderer's ASCII-space-separated words stay the same.
 * Protected semicolons also exclude Mermaid's native entity spellings.
 */
function isAllowedMarginChange(before: string, after: string): boolean {
  if (before === after) return true
  if (
    !before.startsWith("{\n") ||
    !after.startsWith("{\n") ||
    [before, after].some(
      (value) =>
        value.includes("<") ||
        value.includes("&") ||
        value.includes("%%{") ||
        value.includes(";"),
    )
  )
    return false
  const beforeClose = before.lastIndexOf("\n}")
  const afterClose = after.lastIndexOf("\n}")
  const suffix = before.slice(beforeClose)
  if (
    (suffix !== "\n}" && suffix !== "\n}\n") ||
    after.slice(afterClose) !== suffix
  )
    return false
  const rowsBefore = before.slice(0, beforeClose).split("\n").slice(1)
  const rowsAfter = after.slice(0, afterClose).split("\n").slice(1)
  if (rowsBefore.length !== rowsAfter.length) return false
  let printedMargin: number | undefined
  for (const [index, row] of rowsBefore.entries()) {
    const printed = rowsAfter[index]
    if (row.trim() === "" || printed.trim() === "") {
      if (printed !== row) return false
      continue
    }
    const writtenSpaces = leadingSpaces(row)
    const printedSpaces = leadingSpaces(printed)
    const content = row.slice(writtenSpaces)
    if (content[0].trim() === "" || content !== printed.slice(printedSpaces))
      return false
    if (printedSpaces === 0) return false
    printedMargin ??= printedSpaces
    if (printedSpaces !== printedMargin) return false
  }
  const beforeWords = rowsBefore.join("\n").split(" ").filter(Boolean)
  const afterWords = rowsAfter.join("\n").split(" ").filter(Boolean)
  return (
    beforeWords.length === afterWords.length &&
    beforeWords.every((word, index) => word === afterWords[index])
  )
}
