import type { Source } from "./source.ts"

/**
 * The diagram types whose accessibility lines the oldest version that counts
 * reads with a lexer built with jison, and the pinned version with a grammar
 * that ends the value before a `%%` or at the end of its line. Both lexers
 * take what follows `accTitle`, `\s*`, `:`, and `\s*` up to the end of the
 * line as the value, a `%%` included, and the whitespace after an empty `:`
 * reaches over the line breaks (see `isReadAsAccValueByOlderVersions`).
 */
export const diagramTypesWithJisonAccessibilityLines: ReadonlySet<string> =
  new Set(["gitGraph", "pie"])

/** The statements of a body that have a `type`, as far as this module reads them. */
interface BodyItem {
  readonly type: string
  readonly value?: unknown
}

/** The statements that an older version reads as a value, found once per source. */
const joinedBySource = new WeakMap<Source, ReadonlySet<BodyItem>>()

/**
 * Whether the statement is read by a version that counts as the value of an
 * `accTitle:` or an `accDescr:` that has none before it. Their lexer, built
 * with jison, takes `accTitle`, `\s*`, `:`, and `\s*` before it reads the
 * value, so the whitespace after an empty `:` includes the line breaks, and
 * the next statement, after the blank lines and the comments and directives
 * that mermaid.js removes first, is the value. The text of that statement is
 * the title or the description there, so it stays as written. The pinned
 * grammar ends the value at the end of its line and reads the next line as a
 * statement (docs/pie.md, Accessibility lines). Only a pie chart and a gitGraph
 * are read so by a version that counts: the other diagram types whose grammar
 * ends the value at the end of its line have no such version.
 */
export function isReadAsAccValueByOlderVersions(
  source: Source,
  statement: BodyItem,
): boolean {
  if (!diagramTypesWithJisonAccessibilityLines.has(source.root.diagramType)) {
    return false
  }
  let joined = joinedBySource.get(source)
  if (joined === undefined) {
    const found = new Set<BodyItem>()
    const { body } = source.root
    const items = "body" in body ? (body.body as readonly BodyItem[]) : []
    let afterEmptyAcc = false
    for (const item of items) {
      if (item.type.endsWith("IgnoredText")) continue
      if (afterEmptyAcc) {
        // The text of the value is no statement there: it starts none.
        found.add(item)
        afterEmptyAcc = false
        continue
      }
      afterEmptyAcc =
        (item.type.endsWith("AccTitleStatement") ||
          item.type.endsWith("AccDescrStatement")) &&
        hasNoValue(item)
    }
    joined = found
    joinedBySource.set(source, joined)
  }
  return joined.has(statement)
}

/** Whether an `accTitle:` or `accDescr:` statement has no value, or whitespace only. */
function hasNoValue(item: BodyItem): boolean {
  const { value } = item
  if (value === null || value === undefined) return true
  return (
    typeof value === "object" &&
    "value" in value &&
    typeof value.value === "string" &&
    value.value.trim() === ""
  )
}
