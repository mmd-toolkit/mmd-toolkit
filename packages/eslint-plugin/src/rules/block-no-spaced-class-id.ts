import { canEditRange } from "../utils/edit-range.ts"
import { canCompactRange } from "../utils/compact-range.ts"
import type { RuleFixer } from "@eslint/core"
import type { BlockClassStatement } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../source-code.ts"
import type { MermaidRuleDefinition } from "../rule-types.ts"
import { ruleDocsUrl } from "../rule-docs-url.ts"
import { hasLeadingWhitespace } from "../utils/block-class-ids.ts"

/** Remove only whitespace next to commas, treating directives as absent for adjacency. */
function whitespaceFix(
  sourceCode: MermaidSourceCode,
  node: BlockClassStatement,
): RuleFixer | null {
  const positions: number[] = []
  const start = node.ids[0]?.range[0]
  if (start === undefined) return null
  const authored: { character: string; at: number }[] = []
  const end =
    node.cssClass === null || node.cssClass.value.startsWith(",")
      ? node.range[1]
      : node.cssClass.range[0]
  if (!canCompactRange(sourceCode, [start, end])) return null
  for (let at = start; at < end; at++) {
    const directive = sourceCode.ast.directives.find(
      (item) => item.range[0] <= at && at < item.range[1],
    )
    if (directive !== undefined) at = directive.range[1] - 1
    else authored.push({ character: sourceCode.text[at], at })
  }
  for (const [index, item] of authored.entries()) {
    if (item.character !== ",") continue
    for (
      let before = index - 1;
      before >= 0 && authored[before].character.trim() === "";
      before--
    )
      positions.push(authored[before].at)
    for (
      let after = index + 1;
      after < authored.length && authored[after].character.trim() === "";
      after++
    )
      positions.push(authored[after].at)
  }
  const unique = [...new Set(positions)].sort((left, right) => left - right)
  if (
    unique.length === 0 ||
    unique.some((at) => !canEditRange(sourceCode, [at, at + 1]))
  )
    return null
  return (fixer) => unique.map((at) => fixer.removeRange([at, at + 1]))
}

/**
 * Reports each class id whose lookup includes whitespace after a comma, and
 * the name of the class when it starts with a comma, which is what whitespace
 * before a comma leaves: whitespace ends the ids, and the rest of the line is
 * the name of the class.
 */
export const blockNoSpacedClassId: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "spaced" | "commaClass"
}> = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow whitespace around a comma in the ids of a `class` statement.",
      recommended: true,
      url: ruleDocsUrl("block-no-spaced-class-id"),
    },
    fixable: "code",
    schema: [],
    messages: {
      spaced:
        "mermaid.js includes the whitespace after the comma in this id and gives the class to an unplaced block.",
      commaClass:
        "mermaid.js ends the ids at the whitespace before the comma and takes the rest of the line as the name of the class, which no `classDef` defines.",
    },
  },
  create(context) {
    return {
      BlockClassStatement(node) {
        for (const id of node.ids) {
          if (hasLeadingWhitespace(id)) {
            context.report({
              node: id,
              messageId: "spaced",
              fix: whitespaceFix(context.sourceCode, node),
            })
          }
        }
        if (node.cssClass?.value.startsWith(",")) {
          context.report({
            node: node.cssClass,
            messageId: "commaClass",
            fix: whitespaceFix(context.sourceCode, node),
          })
        }
      },
    }
  },
}
