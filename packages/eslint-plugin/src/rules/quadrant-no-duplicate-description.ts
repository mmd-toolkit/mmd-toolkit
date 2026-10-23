import type {
  QuadrantAccDescrBlockStatement,
  QuadrantAccDescrStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { accDescrText } from "../utils/acc-text.ts"

/** A statement that sets the description. */
type DescriptionStatement =
  QuadrantAccDescrStatement | QuadrantAccDescrBlockStatement

/**
 * The rule `quadrant-no-duplicate-description`, described in
 * `docs/rules/quadrant-no-duplicate-description.md`: a later description
 * that differs from the preceding one, in source order. Lines and blocks
 * with text set the description; blocks without text do not set it.
 * `accDescrText` compares descriptions as mermaid.js keeps them.
 */
export const quadrantNoDuplicateDescription: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a statement that sets the description of the chart again.",
      recommended: true,
      url: ruleDocsUrl("quadrant-no-duplicate-description"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the description set on line {{line}} with the one of this `accDescr`.",
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
          data: { line: String(previous.loc.start.line) },
        })
      }
      previous = node
    }

    return {
      QuadrantAccDescrStatement: check,
      QuadrantAccDescrBlockStatement(node) {
        if (node.value !== null) check(node)
      },
    }
  },
}
