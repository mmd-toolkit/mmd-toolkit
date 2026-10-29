import type {
  Identifier,
  StringLiteral,
  UsecaseLabel,
  UsecaseMetadata,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { normalizeLineTerminators } from "../utils/acc-text.ts"

/** Native names and scalars compare their content, without their quote delimiters. */
function writtenText(node: Identifier | StringLiteral | UsecaseLabel): string {
  return normalizeLineTerminators(
    node.type === "Identifier" ? node.name : node.value,
  )
}

/** Boundary headers and standalone updates have different replacement roles. */
type MetadataOrigin = "heading" | "update"

/** Compare only update-like metadata, retaining each key's last written origin. */
export const usecaseNoDuplicateMetadata: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a metadata value that replaces the value of the same key set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-metadata"),
    },
    schema: [],
    messages: {
      duplicate:
        "mermaid.js replaces the `{{key}}` value given earlier for `{{id}}` with this value.",
    },
  },
  create(context) {
    const elements = new Map<
      string,
      Map<string, { value: string; origin: MetadataOrigin }>
    >()

    /** A header followed by an update is the documented way to change its type. */
    function check(
      id: string,
      metadata: UsecaseMetadata,
      origin: MetadataOrigin,
    ): void {
      let values = elements.get(id)
      if (values === undefined) {
        values = new Map()
        elements.set(id, values)
      }
      for (const property of metadata.properties) {
        const key = writtenText(property.key)
        if (
          key !== "type" &&
          key !== "business" &&
          key !== "icon" &&
          key !== "animation"
        )
          continue
        const value = writtenText(property.value)
        const previous = values.get(key)
        if (
          previous !== undefined &&
          previous.value !== "" &&
          previous.value !== value &&
          !(origin === "update" && previous.origin === "heading")
        ) {
          context.report({
            node: property,
            messageId: "duplicate",
            data: { key, id },
          })
        }
        values.set(key, { value, origin })
      }
    }

    return {
      UsecaseMetadataAssignmentStatement(node) {
        check(writtenText(node.target), node.metadata, "update")
      },
      UsecaseSystemBoundaryStatement(node) {
        const name = node.id ?? node.title
        if (name !== null && node.metadata !== null) {
          check(writtenText(name), node.metadata, "heading")
        }
      },
    }
  },
}
