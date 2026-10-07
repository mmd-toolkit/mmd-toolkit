import type { SuggestedEdit } from "@eslint/core"
import type {
  FlowchartAccDescrBlockStatement,
  FlowchartSubgraphStatement,
} from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"
import type { MermaidSourceCode } from "../../source-code.ts"
import { removalRange } from "../../utils/removal.ts"
import {
  blocksInNameText,
  holdsWhitespace,
  isEmptyBlock,
  nameOwnText,
  subgraphIdsOf,
} from "../../utils/subgraph-ids.ts"

/**
 * The suggestion for an empty block: remove it, which changes nothing in the
 * diagram. The author may have meant to write a description, so it is a
 * suggestion, not a fix.
 */
function removalSuggestion(
  sourceCode: MermaidSourceCode,
  node: FlowchartAccDescrBlockStatement,
): SuggestedEdit<"removeBlock"> {
  const range = removalRange(sourceCode, node)
  return {
    messageId: "removeBlock",
    fix: (fixer) => fixer.removeRange(range),
  }
}

/**
 * The rule `flowchart/no-empty-description-block`, described in
 * `docs/rules/flowchart/no-empty-description-block.md`: a closed
 * `accDescr { }` block that holds nothing or only whitespace, which the tree
 * shows as a closed `FlowchartAccDescrBlockStatement` without a value. A block
 * that holds only comments is meant to do nothing, and is not reported.
 *
 * The suggestion to remove the block is offered only for a block that is the
 * first token of its line. Whether removing the whitespace before a block that
 * follows something on its line changes how mermaid.js reads what comes before
 * depends on that statement, and the tree does not tell it, so such a block
 * gets no suggestion.
 */
export const noEmptyDescriptionBlock: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds: "empty" | "emptyAfterSubgraphName" | "removeBlock"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow an `accDescr` block that holds no description.",
      recommended: true,
      url: ruleDocsUrl("flowchart/no-empty-description-block"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      empty:
        "mermaid.js takes no description from this empty `accDescr` block: the description stays as it was before it.",
      emptyAfterSubgraphName:
        "mermaid.js reads whitespace after the name `{{name}}` as part of the subgraph name, so the subgraph gets a generated id. This empty block sets no description.",
      removeBlock:
        "Remove the empty block: the block changed nothing, so mermaid.js reads the diagram as before.",
    },
  },
  create(context) {
    const { sourceCode } = context
    let subgraphIds: ReadonlyMap<FlowchartSubgraphStatement, string> | null =
      null

    /**
     * The subgraph whose generated id an empty block can be blamed on: the id
     * of a subgraph without a title is made from its name text, which can
     * include what follows the name (see "Building the summary from the
     * tree", Subgraphs, in `packages/tests/docs/db-from-tree/flowchart.md`). So
     * `block` qualifies when it is one of the empty blocks that the Db reads into
     * that name text (`blocksInNameText`), and the id is not the name although
     * the name holds no whitespace of its own. The block itself changes
     * nothing.
     */
    function subgraphNamedByTextAfterName(
      block: FlowchartAccDescrBlockStatement,
    ): FlowchartSubgraphStatement | null {
      const subgraph = sourceCode.getParent(block)
      if (subgraph?.type !== "FlowchartSubgraphStatement") return null
      const name = nameOwnText(sourceCode, subgraph)
      if (subgraph.title !== null || holdsWhitespace(name)) return null
      if (!blocksInNameText(sourceCode, subgraph).includes(block)) return null
      subgraphIds ??= subgraphIdsOf(sourceCode)
      return subgraphIds.get(subgraph) === name ? null : subgraph
    }

    /**
     * Whether `block` is at the start of the body of a subgraph, after empty
     * blocks only, and a U+2028, a U+2029, or an unclosed directive stands
     * between the name and the block. Such a unit takes line breaks into the
     * name text, so the line terminator after the block can be what ends the
     * name, and removing the block with its line would join the lines after
     * it to the name. The tree holds no node for the U+2028 and the U+2029,
     * which are no line terminators of its positions: they are in the value
     * of the name, which holds the whitespace after it, and between the end of
     * the name and the start of the block.
     */
    function startsNameTextWithLineBreakingUnit(
      block: FlowchartAccDescrBlockStatement,
    ): boolean {
      const subgraph = sourceCode.getParent(block)
      if (subgraph?.type !== "FlowchartSubgraphStatement") return false
      const before = subgraph.body.slice(0, subgraph.body.indexOf(block))
      const onlyEmptyBlocksBefore = before.every(isEmptyBlock)
      if (!onlyEmptyBlocksBefore) return false
      const between = [subgraph.name.range[1], block.range[0]] as const
      const textBefore = subgraph.name.value + sourceCode.text.slice(...between)
      const lineSeparators = ["\u2028", "\u2029"]
      return (
        lineSeparators.some((separator) => textBefore.includes(separator)) ||
        sourceCode.ast.directives.some(
          (directive) =>
            !directive.closed &&
            subgraph.name.range[0] <= directive.range[0] &&
            directive.range[0] < block.range[0],
        )
      )
    }

    return {
      FlowchartAccDescrBlockStatement(node) {
        if (!node.closed || node.value !== null) return
        // The comments that count are those between the `{` and the `}`.
        const opening = sourceCode.getFirstToken(node, {
          filter: (token) => token.type === "Punctuator" && token.value === "{",
        })
        const closing = sourceCode.getLastToken(node)
        if (closing === null || opening === null) return
        if (sourceCode.commentsExistBetween(opening, closing)) return
        const previous = sourceCode.getTokenBefore(node, {
          includeComments: true,
        })
        const startsLine =
          previous === null || previous.loc.end.line < node.loc.start.line
        // Removing the block would remove a directive, whose settings
        // mermaid.js applies.
        const holdsDirective = sourceCode.ast.directives.some(
          (directive) =>
            node.range[0] <= directive.range[0] &&
            directive.range[0] < node.range[1],
        )
        const suggestable =
          startsLine &&
          !holdsDirective &&
          !startsNameTextWithLineBreakingUnit(node)
        const subgraph = subgraphNamedByTextAfterName(node)
        context.report({
          node,
          messageId: subgraph === null ? "empty" : "emptyAfterSubgraphName",
          data: {
            name: subgraph === null ? "" : nameOwnText(sourceCode, subgraph),
          },
          suggest: suggestable ? [removalSuggestion(sourceCode, node)] : [],
        })
      },
    }
  },
}
