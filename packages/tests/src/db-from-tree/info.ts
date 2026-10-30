import type { DbSummary } from "../types.ts"

/** docs/db-from-tree/info.md: the info adapter publishes no input-dependent Db field. */
export function infoDbOf(): DbSummary {
  return {}
}
