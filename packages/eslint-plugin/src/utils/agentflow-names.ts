import type { AgentflowLabel, AgentflowName } from "@mmd-toolkit/parser"
import { normalizeLineTerminators } from "./acc-text.ts"

/** The written name, without erased parts or whitespace at its ends. */
export function agentflowNameText(name: AgentflowName): string {
  const text = name.parts
    .filter((part) => part.type === "AgentflowLabel")
    .map((part) => part.value)
    .join("")
  return normalizeLineTerminators(text).trim()
}

/** The written label, ignoring its kind and exterior whitespace. */
export function agentflowLabelText(label: AgentflowLabel): string {
  return normalizeLineTerminators(label.value).trim()
}

/** The ordinary vertex step ignores this reserved id, even for a shape or style. */
export function isAgentflowOrdinaryVertexId(id: string): boolean {
  return id !== "connectors"
}

/** A connector with an empty read name creates no element. */
export function agentflowConnectorId(name: AgentflowName): string | null {
  const id = agentflowNameText(name)
  return id === "" ? null : id
}
