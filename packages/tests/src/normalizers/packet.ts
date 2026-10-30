import type { DbSummary } from "../types.ts"
import { numberOrText } from "../summary-number.ts"

/** The row-split blocks consumed by the packet renderer. */
interface PacketDbLike {
  getPacket(): readonly (readonly {
    readonly start: number
    readonly end: number
    readonly label: string
  }[])[]
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/** Keeps published rows and endpoints, omitting the unused bit count. */
export function normalizePacket(value: unknown): DbSummary {
  const db = value as PacketDbLike
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    packet: db.getPacket().map((word) =>
      word.map((block) => ({
        start: numberOrText(block.start),
        end: numberOrText(block.end),
        label: block.label,
      })),
    ),
  }
}
