import type {
  TreemapAccDescrBlockStatement,
  TreemapAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { isEmptyDescriptionBlock } from "../utils/description-block.ts"
import {
  descriptionBlockText,
  descriptionLineText,
} from "../utils/common-value-text.ts"

/** Line and block statements share one replacement history. */
export const treemapNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an `accDescr` that replaces the description set before it.",
      recommended: true,
      url: ruleDocsUrl("treemap-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: string | null = null

    /** Empty blocks reset history, but their report belongs to the empty-block rule. */
    function check(
      node: TreemapAccDescrStatement | TreemapAccDescrBlockStatement,
      value: string,
      emptyBlock: boolean,
    ): void {
      if (
        !emptyBlock &&
        previous !== null &&
        previous !== "" &&
        previous !== value
      ) {
        context.report({
          node,
          messageId: "duplicate",
        })
      }
      previous = value
    }

    return {
      TreemapAccDescrStatement(node) {
        check(node, descriptionLineText(node.value?.value ?? ""), false)
      },
      TreemapAccDescrBlockStatement(node) {
        check(
          node,
          descriptionBlockText(node.value?.value ?? ""),
          isEmptyDescriptionBlock(context.sourceCode, node),
        )
      },
    }
  },
}
