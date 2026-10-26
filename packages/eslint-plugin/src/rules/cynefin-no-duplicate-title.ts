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
        "mermaid.js replaces the {{kind}} set on line {{line}} with the one of this `{{statement}}`.",
    },
  },
  create(context) {
    const titles = new Map<string, { value: string; line: number }>()

    /** Each kind keeps its own history, including an empty value that clears it. */
    function check(
      node: CynefinTitleStatement | CynefinAccTitleStatement,
    ): void {
      const value = commonTitleText(node.value?.value ?? "")
      const previous = titles.get(node.type)
      if (
        previous !== undefined &&
        previous.value !== "" &&
        previous.value !== value
      ) {
        const accessible = node.type === "CynefinAccTitleStatement"
        context.report({
          node,
          messageId: "duplicate",
          data: {
            kind: accessible ? "accessible title" : "title",
            statement: accessible ? "accTitle" : "title",
            line: String(previous.line),
          },
        })
      }
      titles.set(node.type, { value, line: node.loc.start.line })
    }

    return {
      CynefinTitleStatement: check,
      CynefinAccTitleStatement: check,
    }
  },
}
