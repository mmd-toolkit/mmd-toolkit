import type { DbSummary } from "../types.ts"
import { toJsonObject } from "./json.ts"

/** Published Cynefin values, before drawing derives boundaries and positions. */
interface CynefinDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getDomains(): ReadonlyMap<
    string,
    { readonly items: readonly { readonly label: string }[] }
  >
  getTransitions(): readonly {
    readonly from: string
    readonly to: string
    readonly label?: string
  }[]
}

/** Keeps domains with items in renderer lookup order, without drawing state. */
export function normalizeCynefin(value: unknown): DbSummary {
  const db = value as CynefinDbLike
  const domains = db.getDomains()
  return toJsonObject({
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    domains: ["complex", "complicated", "chaotic", "clear", "confusion"]
      .filter((name) => (domains.get(name)?.items.length ?? 0) > 0)
      .map((name) => ({
        name,
        items: domains.get(name)!.items.map(({ label }) => ({ label })),
      })),
    transitions: db.getTransitions().map(({ from, to, label }) => ({
      from,
      to,
      label,
    })),
  })
}
