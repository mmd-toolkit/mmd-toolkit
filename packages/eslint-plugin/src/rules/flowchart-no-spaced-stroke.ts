import type {
  FlowchartClassDefStatement,
  FlowchartDefaultLinkStyleStatement,
  FlowchartLinkStyleStatement,
  FlowchartLiteral,
  FlowchartVertex,
  FlowchartVertexStatement,
} from "@mmd-toolkit/ast"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { flowchartLinkIdsOf } from "../utils/flowchart-links.ts"
import { LinkStyleModel } from "../utils/link-style-model.ts"
import { spacedStrokesOf } from "../utils/spaced-stroke.ts"

/**
 * The rule `flowchart-no-spaced-stroke`, described in
 * `docs/rules/flowchart-no-spaced-stroke.md`: a style named `stroke` in lower
 * case with whitespace before its `:`, in `linkStyle`, `linkStyle default`, and
 * `classDef`. A `style` statement is not read, because the formatter
 * (`prettier-plugin-mmd`) prints its `stroke :` without the whitespace. The fix
 * removes the whitespace, except where a style named `stroke` follows it in the
 * styles of a link that it reaches, which {@link LinkStyleModel} finds.
 */
export const flowchartNoSpacedStroke: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "spaced"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow whitespace before the `:` of a `stroke` style.",
      recommended: false,
      url: ruleDocsUrl("flowchart-no-spaced-stroke"),
    },
    fixable: "code",
    schema: [],
    messages: {
      spaced:
        "`stroke` written with whitespace before `:` is not a form that the mermaid.js documentation shows, and mermaid.js does not read it for the colour of an arrowhead.",
    },
  },
  create(context) {
    const { sourceCode } = context
    const model = new LinkStyleModel<FlowchartLiteral>()
    let linkIdTable: ReturnType<typeof flowchartLinkIdsOf> = new Map()
    const styleLists: (readonly (FlowchartLiteral | null)[])[] = []

    /** Keeps the written styles for the report, and returns those that are not null. */
    function take(
      styles: readonly (FlowchartLiteral | null)[],
    ): FlowchartLiteral[] {
      styleLists.push(styles)
      return styles.filter((style) => style !== null)
    }

    return {
      FlowchartDiagram(node) {
        linkIdTable = flowchartLinkIdsOf(node)
      },
      "FlowchartVertexStatement:exit"(node: FlowchartVertexStatement) {
        for (const link of node.links) {
          model.addLinks(linkIdTable.get(link) ?? [])
        }
      },
      FlowchartVertex(node: FlowchartVertex) {
        if (node.cssClass !== null) {
          model.giveClass(node.id.name.split(","), node.cssClass.name)
        }
      },
      FlowchartClassStatement(node) {
        model.giveClass(
          node.ids.flatMap((id) => (id === null ? [] : [id.name])),
          node.cssClass.name,
        )
      },
      FlowchartClassDefStatement(node: FlowchartClassDefStatement) {
        model.defineClasses(
          node.cssClasses.flatMap((name) => (name === null ? [] : [name.name])),
          take(node.styles),
        )
      },
      FlowchartLinkStyleStatement(node: FlowchartLinkStyleStatement) {
        model.setLinkStyles(
          node.indices.map((index) => index.value),
          take(node.styles),
        )
      },
      FlowchartDefaultLinkStyleStatement(
        node: FlowchartDefaultLinkStyleStatement,
      ) {
        model.setDefaultStyles(take(node.styles))
      },
      "FlowchartDiagram:exit"() {
        const beforeLaterStroke = model.stylesBeforeLaterStroke()
        for (const styles of styleLists) {
          for (const { style, range, fix } of spacedStrokesOf(
            sourceCode,
            styles,
          )) {
            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(range[0]),
                end: sourceCode.getLocFromIndex(range[1]),
              },
              messageId: "spaced",
              fix: beforeLaterStroke.has(style) ? null : fix,
            })
          }
        }
      },
    }
  },
}
