import type { DbSummary, JsonObject } from "../types.ts"
import { numberOrText } from "../summary-number.ts"

/** The expression values published by all four railroad adapters. */
type RailroadExpression =
  | { readonly type: "terminal"; readonly value: string }
  | { readonly type: "nonterminal"; readonly name: string }
  | { readonly type: "special"; readonly text: string }
  | {
      readonly type: "sequence"
      readonly elements: readonly RailroadExpression[]
    }
  | {
      readonly type: "choice"
      readonly alternatives: readonly RailroadExpression[]
    }
  | { readonly type: "optional"; readonly element: RailroadExpression }
  | {
      readonly type: "repetition"
      readonly element: RailroadExpression
      readonly min: number
      readonly max: number
    }

/** Published railroad values, before drawing. */
interface RailroadDbLike {
  getAccTitle(): string
  getAccDescription(): string
  getRules(): readonly {
    readonly name: string
    readonly definition: RailroadExpression
  }[]
}

/** Copies the published expression without unpublished optional fields. */
function summarizeExpression(node: RailroadExpression): JsonObject {
  switch (node.type) {
    case "terminal":
      return { type: node.type, value: node.value }
    case "nonterminal":
      return { type: node.type, name: node.name }
    case "special":
      return { type: node.type, text: node.text }
    case "sequence":
      return {
        type: node.type,
        elements: node.elements.map(summarizeExpression),
      }
    case "choice":
      return {
        type: node.type,
        alternatives: node.alternatives.map(summarizeExpression),
      }
    case "optional":
      return { type: node.type, element: summarizeExpression(node.element) }
    case "repetition":
      return {
        type: node.type,
        element: summarizeExpression(node.element),
        min: numberOrText(node.min),
        max: numberOrText(node.max),
      }
    default:
      throw new Error("unknown railroad expression type")
  }
}

/** Keeps declaration order and duplicate rules, without the lookup index. */
export function normalizeRailroad(value: unknown): DbSummary {
  const db = value as RailroadDbLike
  return {
    accTitle: db.getAccTitle(),
    accDescr: db.getAccDescription(),
    rules: db.getRules().map(({ name, definition }) => ({
      name,
      definition: summarizeExpression(definition),
    })),
  }
}
