import type {
  JourneyAccTitleStatement,
  JourneyTitleStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { titleText } from "../utils/acc-text.ts"

/**
 * The rule `journey-no-duplicate-title`, described in
 * `docs/rules/journey-no-duplicate-title.md`: every `title` statement after the
 * first, and every `accTitle` statement after the first, also one without text
 * on its line, which takes the next line that holds text. The two are separate
 * values, so each kind is compared with the one before it of its own kind. A
 * line meant as a task, such as `Title page: 5: Me`, is a `title` statement in
 * the tree, as in mermaid.js. A `title` statement after the title of the
 * frontmatter is not reported: the frontmatter is no statement. ESLint visits
 * the statements in the order of the source.
 *
 * A statement is reported only when the value it sets differs from that of the
 * one before it (`titleText`): setting what the diagram already has loses nothing.
 */
export const journeyNoDuplicateTitle: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicateTitle" | "duplicateAccTitle"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `title` or `accTitle` statement that sets its title again.",
      recommended: true,
      url: ruleDocsUrl("journey-no-duplicate-title"),
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
    let previousTitle: JourneyTitleStatement | null = null
    let previousAccTitle: JourneyAccTitleStatement | null = null
    return {
      JourneyTitleStatement(node) {
        if (
          previousTitle !== null &&
          titleText(previousTitle) !== titleText(node)
        ) {
          context.report({
            node,
            messageId: "duplicateTitle",
            data: { line: String(previousTitle.loc.start.line) },
          })
        }
        previousTitle = node
      },
      JourneyAccTitleStatement(node) {
        if (
          previousAccTitle !== null &&
          titleText(previousAccTitle) !== titleText(node)
        ) {
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
