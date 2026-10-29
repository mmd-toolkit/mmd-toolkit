import type {
  XychartAccDescrBlockStatement,
  XychartAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"

/** A statement that sets the description. */
type DescriptionStatement =
  XychartAccDescrStatement | XychartAccDescrBlockStatement

/**
 * The rule `xychart-no-duplicate-description`, described in
 * `docs/rules/xychart-no-duplicate-description.md`: a later description that
 * differs from the preceding one, in source order. Lines and closed blocks
 * with text set the description; empty and unclosed blocks are not counted.
 * `accDescrText` reads the text as mermaid.js keeps it.
 */
export const xychartNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a statement that sets the description of the chart again.",
      recommended: true,
      url: ruleDocsUrl("xychart-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the earlier description with the one of this `accDescr`.",
    },
  },
  create(context) {
    let previous: DescriptionStatement | null = null

    /** Reports `node` when it replaces an earlier description with another value. */
    function check(node: DescriptionStatement): void {
      if (previous !== null && accDescrText(previous) !== accDescrText(node)) {
        context.report({
          node,
          messageId: "duplicate",
        })
      }
      previous = node
    }

    return {
      XychartAccDescrStatement: check,
      XychartAccDescrBlockStatement(node) {
        if (node.closed && node.value !== null) check(node)
      },
    }
  },
}
