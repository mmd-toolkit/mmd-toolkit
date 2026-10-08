import type {
  SequenceLinksStatement,
  SequencePropertiesStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** A statement whose text is a JSON object of the keys to set. */
type JsonStatement = SequenceLinksStatement | SequencePropertiesStatement

/**
 * What the text of a statement is: no JSON (also no text), JSON that is no
 * object, or an object. The tree keeps the text as written, so the value is
 * parsed here, as mermaid.js parses it; an entity in it stays as written,
 * where mermaid.js has a placeholder, and neither is valid JSON outside a
 * string.
 */
function jsonKindOf(node: JsonStatement): "notJson" | "notObject" | "object" {
  const text = node.text?.value?.value
  if (text === undefined) return "notJson"
  let value: unknown
  try {
    value = JSON.parse(text)
  } catch {
    return "notJson"
  }
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? "object"
    : "notObject"
}

/**
 * The rule `sequence-no-invalid-json`, described in
 * `docs/rules/sequence-no-invalid-json.md`: a `links` or `properties`
 * statement whose text is not a JSON object.
 */
export const sequenceNoInvalidJson: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "notJson" | "notObject"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow a `links` or `properties` statement whose text is not a JSON object.",
      recommended: true,
      url: ruleDocsUrl("sequence-no-invalid-json"),
    },
    schema: [],
    messages: {
      notJson:
        "The text of this `{{keyword}}` statement is not JSON, so mermaid.js sets nothing from it.",
      notObject:
        "The text of this `{{keyword}}` statement is JSON but not an object, so mermaid.js does not read names from it: a string and an array give their positions, and any other value gives nothing.",
    },
  },
  create(context) {
    /** Reports `node` when its text is not a JSON object. */
    function check(node: JsonStatement, keyword: string): void {
      const kind = jsonKindOf(node)
      if (kind === "object") return
      context.report({ node, messageId: kind, data: { keyword } })
    }

    return {
      SequenceLinksStatement: (node) => check(node, "links"),
      SequencePropertiesStatement: (node) => check(node, "properties"),
    }
  },
}
