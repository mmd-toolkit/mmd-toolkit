import type {
  TreemapAccTitleStatement,
  TreemapTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { commonTitleText } from "../utils/common-value-text.ts"
import { oneOfTwoRemovals } from "../utils/removal.ts"

/** A statement that sets the diagram's title. */
type TitleStatement = TreemapTitleStatement | TreemapAccTitleStatement

/** Title and accessible title keep separate replacement histories. */
export const treemapNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("treemap-no-duplicate-title"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier {{kind}} with the one of this `{{statement}}`.",
      removeThis: "Remove this {{statement}}.",
      removePrevious: "Remove the earlier {{statement}}.",
    },
  },
  create(context) {
    const titles = new Map<
      string,
      { node: TitleStatement; value: string; beforeValue: string | null }
    >()

    /** Each kind keeps its own history, including an empty value that clears it. */
    function check(node: TitleStatement): void {
      const value = commonTitleText(node.value?.value ?? "")
      const previous = titles.get(node.type)
      if (
        previous !== undefined &&
        previous.value !== "" &&
        previous.value !== value
      ) {
        const accessible = node.type === "TreemapAccTitleStatement"
        context.report({
          node,
          messageId: "duplicate",
          data: {
            kind: accessible ? "accessible title" : "title",
            statement: accessible ? "accTitle" : "title",
          },
          suggest: oneOfTwoRemovals(
            context.sourceCode,
            node,
            previous.node,
            previous.beforeValue === null ||
              previous.beforeValue === "" ||
              previous.beforeValue === value,
            accessible
              ? {
                  current: "`accTitle` statement",
                  previous: "`accTitle` statement",
                }
              : {
                  current: "statement",
                  previous: "statement that sets the title",
                },
          ),
        })
      }
      titles.set(node.type, {
        node,
        value,
        beforeValue: previous?.value ?? null,
      })
    }

    return {
      TreemapTitleStatement: check,
      TreemapAccTitleStatement: check,
    }
  },
}
