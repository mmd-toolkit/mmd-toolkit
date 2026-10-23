import type { DbSummary } from "../types.ts"

/**
 * Info publishes no syntax-dependent Db state. Its adapter discards the AST;
 * the renderer displays the supplied Mermaid version, not a parsed value.
 */
export function normalizeInfo(): DbSummary {
  return {}
}
