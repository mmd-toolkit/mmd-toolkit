import { numberOrText } from "../summary-number.ts"
import type { DbSummary } from "../types.ts"
import { toJsonObject } from "./json.ts"

/** The parse-time fields exposed by mermaid's shared venn Db. */
interface VennDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getSubsetData(): { sets: string[]; size: number; label?: string }[]
  getTextData(): { sets: string[]; id: string; label?: string }[]
  getStyleData(): { targets: string[]; styles: Record<string, string> }[]
}

/**
 * Keeps the three declaration lists, including duplicates and their stored
 * sorted identifier lists, and the common title and accessibility strings.
 * Undefined labels are omitted; non-finite sizes are spelled as text.
 * Configuration and the known-set, current-set and indentation parsing state
 * are not summary fields. The Db clears the common strings itself and reads
 * no browser feature, generated id, time or data block during parsing.
 */
export function normalizeVenn(dbValue: unknown): DbSummary {
  const db = dbValue as VennDbLike
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    subsets: db.getSubsetData().map((subset) =>
      toJsonObject({
        sets: subset.sets,
        size: numberOrText(subset.size),
        label: subset.label,
      }),
    ),
    texts: db
      .getTextData()
      .map((text) =>
        toJsonObject({ sets: text.sets, id: text.id, label: text.label }),
      ),
    styles: db
      .getStyleData()
      .map((entry) =>
        toJsonObject({ targets: entry.targets, styles: entry.styles }),
      ),
  }
}
