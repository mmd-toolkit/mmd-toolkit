import type { DbSummary } from "@mmd-toolkit/tests"
import { parse } from "@mmd-toolkit/parser"
import {
  clickCallDbForFormattingComparison,
  clickCallDiagramTypes,
} from "./click-call-margins.ts"
import {
  colorCaseDbForFormattingComparison,
  colorCaseDiagramTypes,
} from "./color-case-differences.ts"
import { eventmodelingDbForFormattingComparison } from "./eventmodeling-data-margins.ts"
import {
  labelTypeDbForFormattingComparison,
  labelTypeDiagramTypes,
} from "./label-type-differences.ts"
import {
  keywordTextDbForFormattingComparison,
  keywordTextDiagramTypes,
} from "./keyword-text-margins.ts"
import {
  kanbanDbForFormattingComparison,
  kanbanTextDiagramTypes,
} from "./kanban-text-margins.ts"
import {
  mindmapDbForFormattingComparison,
  mindmapTextDiagramTypes,
} from "./mindmap-text-margins.ts"
import { stateDbForFormattingComparison } from "./state-note-margins.ts"
import {
  styleDbForFormattingComparison,
  styleDiagramTypes,
} from "./style-margins.ts"
import {
  textRunDbForFormattingComparison,
  textRunDiagramTypes,
} from "./text-run-margins.ts"

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
  // The runs come first: a text that lost its ends and its runs is restored
  // to the written runs, and then to the written ends.
  if (textRunDiagramTypes.has(type))
    compared = textRunDbForFormattingComparison(before, compared, type)
  if (keywordTextDiagramTypes.has(type))
    compared = keywordTextDbForFormattingComparison(before, compared, type)
  // The colors come before the whitespace: a style that has both differences
  // takes the written case of its colors, and then the written whitespace.
  if (colorCaseDiagramTypes.has(type))
    compared = colorCaseDbForFormattingComparison(before, compared, type)
  if (styleDiagramTypes.has(type))
    compared = styleDbForFormattingComparison(before, compared, type)
  if (clickCallDiagramTypes.has(type))
    compared = clickCallDbForFormattingComparison(before, compared)
  if (mindmapTextDiagramTypes.has(type))
    compared = mindmapDbForFormattingComparison(before, compared)
  if (kanbanTextDiagramTypes.has(type))
    compared = kanbanDbForFormattingComparison(before, compared)
  if (labelTypeDiagramTypes.has(type))
    compared = labelTypeDbForFormattingComparison(before, compared)
  return compared
}
