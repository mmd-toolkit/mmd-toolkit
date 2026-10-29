import type { TreeviewAnnotation } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"

/** Resolve the written reference without configuration; hiding an icon is a value. */
function iconValue(name: string): string {
  if (name === "" || name === "none") return "none"
  return name.includes(":") ? name : `mermaid-treeview:${name}`
}

/** Each node retains the previous annotation of each kind, including empty values. */
export const treeviewNoDuplicateAnnotation: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "class" | "icon" | "description"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow an annotation that replaces an annotation of the same kind on one node.",
      recommended: true,
      url: ruleDocsUrl("treeview-no-duplicate-annotation"),
    },
    schema: [],
    messages: {
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
        const previous = new Map<"class" | "icon" | "description", string>()

        /** Empty descriptions reset history; an explicit hidden icon remains nonempty. */
        function check(
          annotation: TreeviewAnnotation,
          kind: "class" | "icon" | "description",
          value: string,
        ): void {
          const before = previous.get(kind)
          if (before !== undefined && before !== "" && before !== value) {
            context.report({
              node: annotation,
              messageId: kind,
            })
          }
          previous.set(kind, value)
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
