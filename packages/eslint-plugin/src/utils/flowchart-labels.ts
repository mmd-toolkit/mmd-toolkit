import type { FlowchartLabel } from "@mmd-toolkit/parser"
import { normalizeLineTerminators } from "./acc-text.ts"

/** Compare written label content, trimming its ends and reading CRLF and CR as LF. */
export function flowchartLabelText(label: FlowchartLabel): string {
  return normalizeLineTerminators(label.value).trim()
}
