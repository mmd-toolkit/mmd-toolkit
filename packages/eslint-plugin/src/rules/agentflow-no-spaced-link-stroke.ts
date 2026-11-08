import type {
  AgentflowClassDefStatement,
  AgentflowDefaultLinkStyleStatement,
  AgentflowLinkStyleStatement,
} from "@mmd-toolkit/ast"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { agentflowLinkIdsOf } from "../utils/agentflow-links.ts"
import { spacedStrokesOf } from "../utils/spaced-stroke.ts"

/**
 * The rule `agentflow-no-spaced-link-stroke`, described in
 * `docs/rules/agentflow-no-spaced-link-stroke.md`: a style of a link whose name
 * ends with `stroke` and has whitespace before its `:`. The styles that reach a
 * link are those of `linkStyle` and `linkStyle default`, and those of a
 * `classDef` whose class a `class` statement gives to a link, before or after
 * the `classDef`; a `classDef` that only vertices take is not read.
 */
export const agentflowNoSpacedLinkStroke: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "spaced"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow whitespace before the `:` of a `stroke` style of a link.",
      recommended: false,
      url: ruleDocsUrl("agentflow-no-spaced-link-stroke"),
    },
    fixable: "code",
    schema: [],
    messages: {
      spaced:
        "mermaid.js draws the line with this style but finds the colour of the arrowhead by `stroke:`, so the whitespace before the `:` leaves the arrowhead in the colour of the theme.",
    },
  },
  create(context) {
    const { sourceCode } = context
    const linkIds = new Set<string>()
    const linkClasses = new Set<string>()
    const classDefs: AgentflowClassDefStatement[] = []

    /** Reports the spaced `stroke` styles of `styles`. */
    function check(styles: AgentflowLinkStyleStatement["styles"]): void {
      for (const { range, fix } of spacedStrokesOf(sourceCode, styles)) {
        context.report({
          loc: {
            start: sourceCode.getLocFromIndex(range[0]),
            end: sourceCode.getLocFromIndex(range[1]),
          },
          messageId: "spaced",
          fix,
        })
      }
    }

    return {
      AgentflowDiagram(node) {
        for (const ids of agentflowLinkIdsOf(node).values()) {
          for (const id of ids) linkIds.add(id)
        }
      },
      AgentflowLinkStyleStatement(node: AgentflowLinkStyleStatement) {
        check(node.styles)
      },
      AgentflowDefaultLinkStyleStatement(
        node: AgentflowDefaultLinkStyleStatement,
      ) {
        check(node.styles)
      },
      AgentflowClassStatement(node) {
        if (node.ids.some((id) => id !== null && linkIds.has(id.name))) {
          linkClasses.add(node.cssClass.name)
        }
      },
      AgentflowClassDefStatement(node) {
        classDefs.push(node)
      },
      "AgentflowDiagram:exit"() {
        for (const node of classDefs) {
          if (
            node.cssClasses.some(
              (name) => name !== null && linkClasses.has(name.name),
            )
          ) {
            check(node.styles)
          }
        }
      },
    }
  },
}
