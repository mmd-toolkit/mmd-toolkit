import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { SuggestedEdit } from "@eslint/core"
import type { JourneyIgnoredText, Node } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"

/** Whether `text` holds a character other than a colon and whitespace. */
function holdsText(text: string): boolean {
  return [...text].some(
    (character) => character !== ":" && character.trim() !== "",
  )
}

/** Every extra colon must introduce nonempty people; directive contents stay untouched. */
function colonSuggestions(
  sourceCode: MermaidSourceCode,
  node: JourneyIgnoredText,
  parent: Node | null,
): SuggestedEdit<"colonsToCommas">[] {
  if (
    parent?.type !== "JourneyTaskStatement" ||
    parent.people.some((person) => person === null)
  )
    return []
  if (
    node.value
      .split(":")
      .slice(1)
      .some((part) => part.split(",").some((person) => person.trim() === ""))
  )
    return []
  if (!canCompactRange(sourceCode, node.range)) return []
  const colons: number[] = []
  for (let at = node.range[0]; at < node.range[1]; at++) {
    const directive = sourceCode.ast.directives.find(
      (item) => item.range[0] <= at && at < item.range[1],
    )
    if (directive !== undefined) at = directive.range[1] - 1
    else if (sourceCode.text[at] === ":") colons.push(at)
  }
  if (colons.some((at) => !canEditRange(sourceCode, [at, at + 1]))) return []
  return [
    {
      messageId: "colonsToCommas",
      fix: (fixer) =>
        colons.map((at) => fixer.replaceTextRange([at, at + 1], ",")),
    },
  ]
}

/**
 * The rule `journey-no-ignored-text`, described in
 * `docs/rules/journey-no-ignored-text.md`: the text of the data of a task from
 * its third colon (a `JourneyIgnoredText`) that holds anything but colons and
 * whitespace. The value is the text without directives, so a directive in it is
 * no text.
 */
export const journeyNoIgnoredText: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "ignored" | "colonsToCommas"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow text in the data of a task that mermaid.js drops.",
      recommended: true,
      url: ruleDocsUrl("journey-no-ignored-text"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      colonsToCommas: "Replace the extra colons with commas.",
      ignored:
        "mermaid.js does not read the data of a task from its third colon and drops `{{text}}`.",
    },
  },
  create(context) {
    return {
      JourneyIgnoredText(node, parent) {
        if (!holdsText(node.value)) return
        context.report({
          node,
          messageId: "ignored",
          data: { text: node.value },
          suggest: colonSuggestions(context.sourceCode, node, parent),
        })
      },
    }
  },
}
