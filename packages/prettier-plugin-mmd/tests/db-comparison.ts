import type { DbSummary } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import {
  clickCallDbForFormattingComparison,
  clickCallDiagramTypes,
} from "./click-call-margins.ts"
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
  let compared = after
  if (type === "stateDiagram")
    compared = stateDbForFormattingComparison(
      before,
      compared,
      beforeSource,
      afterSource,
    )
  if (keywordTextDiagramTypes.has(type))
    compared = keywordTextDbForFormattingComparison(before, compared)
  if (styleDiagramTypes.has(type))
    compared = styleDbForFormattingComparison(before, compared, type)
  if (clickCallDiagramTypes.has(type))
    compared = clickCallDbForFormattingComparison(before, compared)
  return compared
}
