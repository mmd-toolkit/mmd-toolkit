import type {
  SequenceAccTitleStatement,
  SequenceTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/**
 * The rule `sequence-no-duplicate-title`, described in
 * `docs/rules/sequence-no-duplicate-title.md`: every `title` statement after the
 * first, and every `accTitle` statement after the first, also in a block and
 * also an `accTitle` without text. The two are separate values, so each kind is
 * compared with the one before it of its own kind. ESLint visits the statements
 * in the order of the source.
 */
export const sequenceNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicateTitle" | "duplicateAccTitle"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or `accTitle` statement that sets its title again.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-duplicate-title"),
    },
    schema: [],
    messages: {
      duplicateTitle:
        "mermaid.js replaces the title set on line {{line}} with the one of this `title`.",
      duplicateAccTitle:
        "mermaid.js replaces the accessible title set on line {{line}} with the one of this `accTitle`.",
    },
  },
  create(context) {
    let previousTitle: SequenceTitleStatement | null = null
    let previousAccTitle: SequenceAccTitleStatement | null = null
    return {
      SequenceTitleStatement(node) {
        if (previousTitle !== null) {
          context.report({
            node,
            messageId: "duplicateTitle",
            data: { line: String(previousTitle.loc.start.line) },
          })
        }
        previousTitle = node
      },
      SequenceAccTitleStatement(node) {
        if (previousAccTitle !== null) {
          context.report({
            node,
            messageId: "duplicateAccTitle",
            data: { line: String(previousAccTitle.loc.start.line) },
          })
        }
        previousAccTitle = node
      },
    }
  },
}
