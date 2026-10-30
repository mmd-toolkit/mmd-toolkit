import type { SuggestedEdit } from "@eslint/core"
import type {
  AgentflowDirectionStatement,
  FlowchartDirectionStatement,
  UsecaseDirectionStatement,
} from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { removalRange } from "./removal.ts"

/** The diagrams whose duplicate-direction rules remove whole direction statements. */
type DirectionSetter =
  | AgentflowDirectionStatement
  | FlowchartDirectionStatement
  | UsecaseDirectionStatement

/** Direction statements include ignored side text, which must never go with a direction. */
export function directionRemovals(
  sourceCode: MermaidSourceCode,
  node: DirectionSetter,
  previous: DirectionSetter | null,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  const choices: {
    node: DirectionSetter
    messageId: "removeThis" | "removePrevious"
  }[] = [{ node, messageId: "removeThis" }]
  if (previous !== null && canRemovePrevious)
    choices.push({ node: previous, messageId: "removePrevious" })
  for (const choice of choices) {
    if (
      choice.node.type !== "UsecaseDirectionStatement" &&
      (choice.node.textBefore !== null || choice.node.textAfter !== null)
    )
      continue
    const range = removalRange(sourceCode, choice.node)
    if (range !== null)
      suggestions.push({
        messageId: choice.messageId,
        fix: (fixer) => fixer.removeRange(range),
      })
  }
  return suggestions
}
