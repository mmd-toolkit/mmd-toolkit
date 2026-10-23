import type {
  PieAccDescrBlockStatement,
  PieAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"
import {
  descriptionBlockText,
  descriptionLineText,
} from "../utils/common-value-text.ts"

/** Unlike usecase, pie collapses space/tab runs and trims LF/LS/PS line edges in blocks. */
export const pieNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("pie-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the description set on line {{line}} with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: { value: string; line: number } | null = null

    /** Empty blocks reset history, but their report belongs to the empty-block rule. */
    function check(
      node: PieAccDescrStatement | PieAccDescrBlockStatement,
      value: string,
      emptyBlock: boolean,
    ): void {
      if (
        !emptyBlock &&
        previous !== null &&
        previous.value !== "" &&
        previous.value !== value
      ) {
        context.report({
          node,
          messageId: "duplicate",
          data: { line: String(previous.line) },
        })
      }
      previous = { value, line: node.loc.start.line }
    }

    return {
      PieAccDescrStatement(node) {
        check(node, descriptionLineText(node.value?.value ?? ""), false)
      },
      PieAccDescrBlockStatement(node) {
        check(
          node,
          descriptionBlockText(node.value?.value ?? ""),
          isEmptyDescriptionBlock(context.sourceCode, node),
        )
      },
    }
  },
}
