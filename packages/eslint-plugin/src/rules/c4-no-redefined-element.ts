import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { c4DeclarationVisitor } from "../utils/c4-declarations.ts"

/** Compare each declaration after its optional fields with the current target. */
export const c4NoRedefinedElement: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "redefined"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a declaration of an element or a boundary that replaces an earlier label, kind, or type.",
      recommended: true,
      url: ruleDocsUrl("c4-no-redefined-element"),
    },
    schema: [],
    messages: {
      redefined:
        "mermaid.js reuses this {{family}}, replacing its earlier {{field}}.",
    },
  },
  create(context) {
    return c4DeclarationVisitor({
      declaration(node, previous, current) {
        if (
          previous === undefined ||
          (previous.family === "boundary" && previous.alias === "global")
        )
          return
        const changedKind =
          previous.kind !== current.kind &&
          (node.type === "C4ElementStatement" ||
            (previous.writtenType && previous.kind !== ""))
        const changedLabel =
          previous.label !== null &&
          previous.label !== "" &&
          current.label !== null &&
          previous.label !== current.label
        if (!changedKind && !changedLabel) return
        context.report({
          node,
          messageId: "redefined",
          data: {
            family: current.family,
            field: changedKind
              ? node.type === "C4ElementStatement"
                ? "kind"
                : "type"
              : "label",
          },
        })
      },
    })
  },
}
