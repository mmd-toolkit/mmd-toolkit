import type {
  SequenceLinksStatement,
  SequencePropertiesStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import type { MermaidSourceCode } from "../source-code.ts"

/** A statement whose text is a JSON object of the keys to set. */
type JsonStatement = SequenceLinksStatement | SequencePropertiesStatement

type JsonKind = "notJson" | "notObject" | "object"

/** What `text` is: no JSON, JSON that is no object, or an object. */
function jsonKindOfText(text: string): JsonKind {
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
 * What the text of a statement is. The tree keeps the text as written, so the
 * value is parsed here, as mermaid.js parses it; an entity in it stays as
 * written, where mermaid.js has a placeholder, and neither is valid JSON
 * outside a string. A `#` ends the text, and what follows it on the line is a
 * comment in the tree. A text that is no object, but that is one with the
 * comment after a `#` added, is the object that the author wrote with a `#` in
 * a string, such as a URL with a fragment, so it counts as an object.
 */
function jsonKindOf(
  node: JsonStatement,
  sourceCode: MermaidSourceCode,
): JsonKind {
  const text = node.text?.value
  if (text === null || text === undefined) return "notJson"
  const kind = jsonKindOfText(text.value)
  if (kind === "object") return kind
  const after = sourceCode.getTokenAfter(node, { includeComments: true })
  const cutAtHash =
    after?.type === "Comment" &&
    after.loc.start.line === node.loc.end.line &&
    sourceCode.getText(after).startsWith("#")
  if (!cutAtHash) return kind
  const whole = sourceCode.text.slice(text.range[0], after.range[1])
  return jsonKindOfText(whole) === "object" ? "object" : kind
}

/**
 * The rule `sequence-no-invalid-json`, described in
 * `docs/rules/sequence-no-invalid-json.md`: a `links` or `properties`
 * statement whose text is not a JSON object, not counting a `#` in a string
 * that cuts the text.
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
        "mermaid.js sets nothing from this `{{keyword}}` statement because its text is not JSON.",
      notObject:
        "mermaid.js does not read names from this `{{keyword}}` statement because its JSON is not an object: a string and an array give their positions, and any other value gives nothing.",
    },
  },
  create(context) {
    const { sourceCode } = context

    /** Reports `node` when its text is not a JSON object. */
    function check(node: JsonStatement, keyword: string): void {
      const kind = jsonKindOf(node, sourceCode)
      if (kind === "object") return
      context.report({ node, messageId: kind, data: { keyword } })
    }

    return {
      SequenceLinksStatement: (node) => check(node, "links"),
      SequencePropertiesStatement: (node) => check(node, "properties"),
    }
  },
}
