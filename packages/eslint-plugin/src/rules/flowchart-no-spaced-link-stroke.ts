import type {
  FlowchartClassDefStatement,
  FlowchartDefaultLinkStyleStatement,
  FlowchartLinkStyleStatement,
} from "@mmd-toolkit/ast"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { flowchartLinkIdsOf } from "../utils/flowchart-links.ts"
import { spacedStrokesOf } from "../utils/spaced-stroke.ts"

/**
 * The rule `flowchart-no-spaced-link-stroke`, described in
 * `docs/rules/flowchart-no-spaced-link-stroke.md`: a style of a link whose name
 * ends with `stroke` and has whitespace before its `:`. The styles that reach a
 * link are those of `linkStyle` and `linkStyle default`, and those of a
 * `classDef` whose class a `class` statement gives to a link, before or after
 * the `classDef`; a `classDef` that only vertices take is not read.
 */
export const flowchartNoSpacedLinkStroke: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "spaced"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow whitespace before the `:` of a `stroke` style of a link.",
      recommended: false,
      url: ruleDocsUrl("flowchart-no-spaced-link-stroke"),
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
    const classDefs: FlowchartClassDefStatement[] = []

    /** Reports the spaced `stroke` styles of `styles`. */
    function check(styles: FlowchartLinkStyleStatement["styles"]): void {
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
      FlowchartDiagram(node) {
        for (const ids of flowchartLinkIdsOf(node).values()) {
          for (const id of ids) linkIds.add(id)
        }
      },
      FlowchartLinkStyleStatement(node: FlowchartLinkStyleStatement) {
        check(node.styles)
      },
      FlowchartDefaultLinkStyleStatement(
        node: FlowchartDefaultLinkStyleStatement,
      ) {
        check(node.styles)
      },
      FlowchartClassStatement(node) {
        if (node.ids.some((id) => id !== null && linkIds.has(id.name))) {
          linkClasses.add(node.cssClass.name)
        }
      },
      FlowchartClassDefStatement(node) {
        classDefs.push(node)
      },
      "FlowchartDiagram:exit"() {
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
