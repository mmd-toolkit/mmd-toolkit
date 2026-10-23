import type { DbSummary } from "../types.ts"
import { numberOrText } from "../summary-number.ts"

/** The stored values consumed by pie drawing and common accessibility output. */
interface PieDbLike {
  getSections(): ReadonlyMap<string, number>
  getShowData(): boolean
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/** Keeps sections in insertion order, before derived percentages and geometry. */
export function normalizePie(dbValue: unknown): DbSummary {
  const db = dbValue as PieDbLike
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    showData: db.getShowData(),
    sections: [...db.getSections()].map(([label, value]) => ({
      label,
      value: numberOrText(value),
    })),
  }
}
