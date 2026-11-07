import type { DbSummary } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import { eventmodelingDbForFormattingComparison } from "./eventmodeling-data-margins.ts"
import {
  keywordTextDbForFormattingComparison,
  keywordTextDiagramTypes,
} from "./keyword-text-margins.ts"
import { stateDbForFormattingComparison } from "./state-note-margins.ts"
import {
  styleDbForFormattingComparison,
  styleDiagramTypes,
} from "./style-margins.ts"

/**
 * The Db of a formatted text with the differences restored that the formatter
 * is permitted to make, so that it can be compared with the Db of the written
 * text. The permitted differences are listed in AGENTS.md, item 4; each has
 * its own function, and a text is compared by the ones of its diagram type.
 */
export function dbForFormattingComparison(
  before: DbSummary | null,
  after: DbSummary | null,
  beforeSource: string,
  afterSource: string,
): DbSummary | null {
  const type = parse(beforeSource).diagramType
  if (type === "eventmodeling")
    return eventmodelingDbForFormattingComparison(before, after)
  const compared =
    type === "stateDiagram"
      ? stateDbForFormattingComparison(before, after, beforeSource, afterSource)
      : after
  if (keywordTextDiagramTypes.has(type))
    return keywordTextDbForFormattingComparison(before, compared)
  return styleDiagramTypes.has(type)
    ? styleDbForFormattingComparison(before, compared)
    : compared
}
