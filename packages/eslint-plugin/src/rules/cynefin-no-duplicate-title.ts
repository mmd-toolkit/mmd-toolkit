import type {
  CynefinAccTitleStatement,
  CynefinTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { commonTitleText } from "../utils/common-value-text.ts"

/** Title and accessible title keep separate replacement histories. */
export const cynefinNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or an `accTitle` that replaces the title set before it.",
      recommended: true,
      url: ruleDocsUrl("cynefin-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier {{kind}} with the one of this `{{statement}}`.",
    },
  },
  create(context) {
    const titles = new Map<string, string>()

    /** Each kind keeps its own history, including an empty value that clears it. */
    function check(
      node: CynefinTitleStatement | CynefinAccTitleStatement,
    ): void {
      const value = commonTitleText(node.value?.value ?? "")
      const previous = titles.get(node.type)
      if (previous !== undefined && previous !== "" && previous !== value) {
        const accessible = node.type === "CynefinAccTitleStatement"
        context.report({
          node,
          messageId: "duplicate",
          data: {
            kind: accessible ? "accessible title" : "title",
            statement: accessible ? "accTitle" : "title",
          },
        })
      }
      titles.set(node.type, value)
    }

    return {
      CynefinTitleStatement: check,
      CynefinAccTitleStatement: check,
    }
  },
}
