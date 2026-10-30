import type { DbSummary, JsonObject } from "../types.ts"

/** The tree fields the ishikawa renderer reads. */
interface IshikawaNodeLike {
  text: string
  children: IshikawaNodeLike[]
}

/** The parse-time getters exposed by IshikawaDB. */
interface IshikawaDbLike {
  getRoot(): IshikawaNodeLike | undefined
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
}

/**
 * Keeps the renderer's ordered text tree and the common title strings.
 * An absent root is null. The stack and base indentation are parsing state;
 * drawing geometry and configuration are not summary fields. Parsing needs
 * no browser stand-in, data-block recording or generated-id replacement.
 */
export function normalizeIshikawa(dbValue: unknown): DbSummary {
  const db = dbValue as IshikawaDbLike
  const root = db.getRoot()
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    root: root === undefined ? null : nodeSummary(root),
  }
}

/** Copies only the stored text and children, retaining their order. */
function nodeSummary(node: IshikawaNodeLike): JsonObject {
  return { text: node.text, children: node.children.map(nodeSummary) }
}
