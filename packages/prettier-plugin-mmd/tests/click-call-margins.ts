import type { DbSummary, JsonValue } from "@mmd-toolkit/tests"

/** The diagram types whose click calls the formatter prints in one form. */
export const clickCallDiagramTypes: ReadonlySet<string> = new Set([
  "agentflow",
  "classDiagram",
  "flowchart-elk",
  "flowchart-v2",
  "gantt",
  "swimlane",
])

/**
 * The arguments with which mermaid.js calls the function of a `click`: the text
 * between the parentheses is split at every `,` that has an even number of `"`
 * after it, each part is trimmed, and a part that starts and ends with `"`
 * loses them (docs/compatibility.md, Call arguments that are drawn the same).
 */
function readCallArguments(text: string): string[] {
  const quotes = [...text].filter((character) => character === '"').length
  const parts: string[] = []
  let quotesBefore = 0
  let partStart = 0
  for (let index = 0; index <= text.length; index++) {
    const character = text[index]
    if (character === '"') quotesBefore++
    if (
      index < text.length &&
      !(character === "," && (quotes - quotesBefore) % 2 === 0)
    )
      continue
    parts.push(text.slice(partStart, index))
    partStart = index + 1
  }
  return parts.map((part) => {
    const item = part.trim()
    return item.startsWith('"') && item.endsWith('"') ? item.slice(1, -1) : item
  })
}

/** Whether a JSON value is an object. */
function isObject(
  value: JsonValue,
): value is { readonly [key: string]: JsonValue } {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

/**
 * Checks the click calls of a formatted diagram even though the whitespace
 * around the parts of their arguments changed. The formatter prints the
 * arguments without whitespace at their ends or before a `,`, and with one
 * space after it. mermaid.js keeps the text in the Db, and calls the function
 * with the parts trimmed, so arguments that are read as the same list of parts
 * are restored from the written Db. Every other difference stays.
 */
export function clickCallDbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
): DbSummary | null {
  if (before === null || after === null) return after
  const written = before.clickCalls
  const printed = after.clickCalls
  if (!Array.isArray(written) || !Array.isArray(printed)) return after
  if (written.length !== printed.length) return after
  return {
    ...after,
    clickCalls: printed.map((call, index) => {
      const original = written[index]
      if (
        !isObject(call) ||
        !isObject(original) ||
        typeof call.args !== "string" ||
        typeof original.args !== "string"
      )
        return call
      const same =
        JSON.stringify(readCallArguments(call.args)) ===
        JSON.stringify(readCallArguments(original.args))
      return same ? { ...call, args: original.args } : call
    }),
  }
}
