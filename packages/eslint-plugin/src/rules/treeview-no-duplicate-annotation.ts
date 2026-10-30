import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { TreeviewNode } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { whitespacePartRange } from "../utils/part-removal.ts"
import { removalRange } from "../utils/removal.ts"
import type { TreeviewAnnotation } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"

/** An annotation on the name's line is a part; one on a later line owns that line. */
function annotationRemovals(
  sourceCode: MermaidSourceCode,
  node: TreeviewNode,
  annotation: TreeviewAnnotation,
  previous: TreeviewAnnotation,
  canRemovePrevious: boolean,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    node: TreeviewAnnotation
    messageId: "removeThis" | "removePrevious"
  }[] = [{ node: annotation, messageId: "removeThis" }]
  if (canRemovePrevious)
    choices.push({ node: previous, messageId: "removePrevious" })
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  for (const choice of choices) {
    const range =
      choice.node.loc.start.line === node.name.loc.start.line
        ? whitespacePartRange(sourceCode, choice.node)
        : removalRange(sourceCode, choice.node)
    if (
      range !== null &&
      canEditRange(sourceCode, range) &&
      (choice.node.loc.start.line !== node.name.loc.start.line ||
        canCompactRange(sourceCode, range))
    )
      suggestions.push({
        messageId: choice.messageId,
        fix: (fixer) => fixer.removeRange(range),
      })
  }
  return suggestions
}

/** Resolve the written reference without configuration; hiding an icon is a value. */
function iconValue(name: string): string {
  if (name === "" || name === "none") return "none"
  return name.includes(":") ? name : `mermaid-treeview:${name}`
}

/** Each node retains the previous annotation of each kind, including empty values. */
export const treeviewNoDuplicateAnnotation: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "class" | "icon" | "description" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an annotation that replaces an annotation of the same kind on one node.",
      recommended: true,
      url: ruleDocsUrl("treeview-no-duplicate-annotation"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this annotation.",
      removePrevious: "Remove the earlier annotation.",
      class:
        "mermaid.js replaces the class given earlier for this node with this class.",
      icon: "mermaid.js replaces the earlier icon setting for this node with this icon setting.",
      description:
        "mermaid.js replaces the description given earlier for this node with this description.",
    },
  },
  create(context) {
    return {
      TreeviewNode(node) {
        const previous = new Map<
          "class" | "icon" | "description",
          {
            node: TreeviewAnnotation
            value: string
            before: string | undefined
          }
        >()

        /** Empty descriptions reset history; an explicit hidden icon remains nonempty. */
        function check(
          annotation: TreeviewAnnotation,
          kind: "class" | "icon" | "description",
          value: string,
        ): void {
          const before = previous.get(kind)
          if (
            before !== undefined &&
            before.value !== "" &&
            before.value !== value
          ) {
            context.report({
              node: annotation,
              messageId: kind,
              suggest: annotationRemovals(
                context.sourceCode,
                node,
                annotation,
                before.node,
                before.before === undefined ||
                  before.before === "" ||
                  before.before === value,
              ),
            })
          }
          previous.set(kind, { node: annotation, value, before: before?.value })
        }

        for (const annotation of node.annotations) {
          switch (annotation.type) {
            case "TreeviewClassAnnotation":
              check(annotation, "class", annotation.name.name)
              break
            case "TreeviewIconAnnotation":
              check(annotation, "icon", iconValue(annotation.name?.name ?? ""))
              break
            default:
              check(
                annotation,
                "description",
                normalizeLineTerminators(annotation.value?.value ?? "").trim(),
              )
              break
          }
        }
      },
    }
  },
}
