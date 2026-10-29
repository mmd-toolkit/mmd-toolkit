import { canEditRange } from "../utils/edit-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type {
  UsecaseMetadataAssignmentStatement,
  UsecaseMetadataProperty,
  UsecaseSystemBoundaryStatement,
} from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import { commaRemovalRange } from "../utils/comma-parts.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import { removalRange } from "../utils/removal.ts"
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

/** Each update records the earlier value and origin that its removal would reveal. */
interface MetadataHistory {
  node: UsecaseMetadataProperty
  metadata: UsecaseMetadata
  owner: UsecaseMetadataAssignmentStatement | UsecaseSystemBoundaryStatement
  value: string
  origin: MetadataOrigin
  before: { value: string; origin: MetadataOrigin } | undefined
}

/** A boundary may lose its metadata block; a sole update loses its isolated statement. */
function metadataRemovals(
  sourceCode: MermaidSourceCode,
  current: MetadataHistory,
  previous: MetadataHistory,
): SuggestedEdit<"removeThis" | "removePrevious">[] {
  const choices: {
    item: MetadataHistory
    messageId: "removeThis" | "removePrevious"
  }[] = [{ item: current, messageId: "removeThis" }]
  const before = previous.before
  if (
    before === undefined ||
    before.value === "" ||
    before.value === current.value ||
    (current.origin === "update" && before.origin === "heading")
  )
    choices.push({ item: previous, messageId: "removePrevious" })
  const suggestions: SuggestedEdit<"removeThis" | "removePrevious">[] = []
  for (const { item, messageId } of choices) {
    const range =
      item.metadata.properties.length > 1
        ? commaRemovalRange(sourceCode, item.node, item.metadata.properties)
        : item.owner.type === "UsecaseSystemBoundaryStatement"
          ? canCompactRange(sourceCode, item.metadata.range)
            ? item.metadata.range
            : null
          : removalRange(sourceCode, item.owner)
    if (range !== null && canEditRange(sourceCode, range))
      suggestions.push({ messageId, fix: (fixer) => fixer.removeRange(range) })
  }
  return suggestions
}

/** Compare only update-like metadata, retaining each key's last written origin. */
export const usecaseNoDuplicateMetadata: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "duplicate" | "removeThis" | "removePrevious"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a metadata value that replaces the value of the same key set before it.",
      recommended: true,
      url: ruleDocsUrl("usecase-no-duplicate-metadata"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      removeThis: "Remove this metadata property.",
      removePrevious: "Remove the earlier metadata property.",
      duplicate:
        "mermaid.js replaces the `{{key}}` value given earlier for `{{id}}` with this value.",
    },
  },
  create(context) {
    const elements = new Map<string, Map<string, MetadataHistory>>()

    /** A header followed by an update is the documented way to change its type. */
    function check(
      id: string,
      metadata: UsecaseMetadata,
      origin: MetadataOrigin,
      owner:
        UsecaseMetadataAssignmentStatement | UsecaseSystemBoundaryStatement,
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
        const current: MetadataHistory = {
          node: property,
          metadata,
          owner,
          value,
          origin,
          before:
            previous === undefined
              ? undefined
              : { value: previous.value, origin: previous.origin },
        }
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
            suggest: metadataRemovals(context.sourceCode, current, previous),
          })
        }
        values.set(key, current)
      }
    }

    return {
      UsecaseMetadataAssignmentStatement(node) {
        check(writtenText(node.target), node.metadata, "update", node)
      },
      UsecaseSystemBoundaryStatement(node) {
        const name = node.id ?? node.title
        if (name !== null && node.metadata !== null) {
          check(writtenText(name), node.metadata, "heading", node)
        }
      },
    }
  },
}
