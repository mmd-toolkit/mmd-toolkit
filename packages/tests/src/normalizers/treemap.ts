import type { DbSummary, JsonObject, JsonValue } from "../types.ts"
import { numberOrText } from "../summary-number.ts"

/** A published node, before D3 derives values, order and coordinates. */
interface TreemapNode {
  readonly name: string
  readonly value?: number
  readonly classSelector?: string
  readonly children?: readonly TreemapNode[]
}

/** The tree and classes read by treemap drawing. */
interface TreemapDbLike {
  getDiagramTitle(): string
  getAccTitle(): string
  getAccDescription(): string
  getRoot(): { readonly children: readonly TreemapNode[] }
  getClasses(): ReadonlyMap<
    string,
    { readonly id: string; readonly styles: readonly string[] }
  >
}

/** Keeps each authored node once, without the artificial root or copied styles. */
function summarizeNode(node: TreemapNode): JsonObject {
  const result: Record<string, JsonValue> = { name: node.name }
  if (node.value !== undefined) result.value = numberOrText(node.value)
  if (node.classSelector !== undefined)
    result.classSelector = node.classSelector
  if (node.children !== undefined)
    result.children = node.children.map(summarizeNode)
  return result
}

/** Keeps the published forest and class definitions without drawing state. */
export function normalizeTreemap(value: unknown): DbSummary {
  const db = value as TreemapDbLike
  return {
    title: db.getDiagramTitle(),
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    nodes: db.getRoot().children.map(summarizeNode),
    classDefs: [...db.getClasses().values()].map(({ id, styles }) => ({
      id,
      styles: styles.map((style) => style.trimEnd()),
    })),
  }
}
