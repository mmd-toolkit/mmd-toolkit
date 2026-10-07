import type { SuggestedEdit } from "@eslint/core"
import type { FlowchartDataBlock, Range, Token } from "@mmd-toolkit/parser"
import { traverseNodes } from "@mmd-toolkit/parser"
import type { MermaidRuleDefinition } from "../../rule-types.ts"
import { ruleDocsUrl } from "../../rule-docs-url.ts"
import type { MermaidSourceCode } from "../../source-code.ts"
import { removalRange } from "../../utils/removal.ts"
import type { TextNode } from "../../utils/text-nodes.ts"
import { isTextNode, textOf } from "../../utils/text-nodes.ts"

/** A line of the value of a token: its text, and where it starts in the value. */
interface ValueLine {
  readonly text: string
  readonly start: number
}

/** The lines of `value`, split at the line terminators `\r\n`, `\n`, and `\r`. */
function valueLines(value: string): ValueLine[] {
  const lines: ValueLine[] = []
  let start = 0
  for (let index = 0; index < value.length; index++) {
    const character = value[index]
    if (character !== "\n" && character !== "\r") continue
    lines.push({ text: value.slice(start, index), start })
    if (character === "\r" && value[index + 1] === "\n") index++
    start = index + 1
  }
  lines.push({ text: value.slice(start), start })
  return lines
}

/**
 * Whether only whitespace and directives stand between `index` and the line
 * terminator before it (`side` "before") or after it ("after"), or the start or
 * the end of the text. mermaid.js takes the directives out before it reads the
 * lines, so they do not count.
 */
function reachesLineBoundary(
  sourceCode: MermaidSourceCode,
  index: number,
  side: "before" | "after",
): boolean {
  const { text } = sourceCode
  const step = side === "before" ? -1 : 1
  let position = index
  for (;;) {
    const at = side === "before" ? position - 1 : position
    const character = text[at]
    if (character === undefined || character === "\n" || character === "\r") {
      return true
    }
    const directive = sourceCode.ast.directives.find(
      (each) => each.range[0] <= at && at < each.range[1],
    )
    if (directive !== undefined) {
      position = side === "before" ? directive.range[0] : directive.range[1]
    } else if (character.trim() === "") {
      position += step
    } else {
      return false
    }
  }
}

/**
 * The places of the `%%` of the lines of `token` that hold only `%%` and fill
 * their line of the source: only whitespace and directives stand on the line
 * besides the `%%`, also where the line of the value starts or ends in another
 * token, such as the piece of a string that a directive or a comment region
 * cuts.
 */
function bareMarkers(sourceCode: MermaidSourceCode, token: Token): number[] {
  return valueLines(token.value)
    .filter((line) => line.text.trim() === "%%")
    .map((line) => token.range[0] + line.start + line.text.indexOf("%%"))
    .filter(
      (marker) =>
        reachesLineBoundary(sourceCode, marker, "before") &&
        reachesLineBoundary(sourceCode, marker + "%%".length, "after"),
    )
}

/** Whether `value` holds a line other than a blank line or a line of only `%%`. */
function holdsOtherText(value: string): boolean {
  return valueLines(value).some(
    (line) => line.text.trim() !== "" && line.text.trim() !== "%%",
  )
}

/**
 * The suggestion for a `%%` token that makes a vertex: remove it, with its
 * line when nothing else is on it; a directive on the line stays. The `%%`
 * is text that the author wrote, so it is a suggestion, not a fix.
 */
function markerRemoval(
  sourceCode: MermaidSourceCode,
  token: Token,
): SuggestedEdit<"removeMarker"> {
  const range = removalRange(sourceCode, token)
  return { messageId: "removeMarker", fix: (fixer) => fixer.removeRange(range) }
}

/**
 * The suggestion for a line `%%` in a text, on the line `line` of the source:
 * remove the line with its line terminator. The line terminator may lie
 * outside the token, between the pieces of a token that a comment cuts, so
 * the line is taken from the source. There is none where a directive lies on
 * the line, or ends or starts there: the directive is not part of the text,
 * and removing the line would remove it too.
 */
function lineRemoval<
  MessageId extends "removeTextLine" | "removeDataLine" | "removeCallbackLine",
>(
  sourceCode: MermaidSourceCode,
  line: number,
  messageId: MessageId,
): SuggestedEdit<MessageId>[] {
  if (
    sourceCode.ast.directives.some(
      (directive) =>
        directive.loc.start.line <= line && line <= directive.loc.end.line,
    )
  ) {
    return []
  }
  const range: Range = [
    sourceCode.getIndexFromLoc({ line, column: 0 }),
    line < sourceCode.lines.length
      ? sourceCode.getIndexFromLoc({ line: line + 1, column: 0 })
      : sourceCode.text.length,
  ]
  return [{ messageId, fix: (fixer) => fixer.removeRange(range) }]
}

/**
 * Where a line `%%` stands, which decides how mermaid.js reads it: a vertex
 * (an `Identifier` token `%%` of a statement), the name of the function that
 * `click` calls (the whole name after `click A`, or a line of the name after
 * `call`), a line of the data of a data block, or a line of any other text,
 * the arguments of `call` among them. Each place is also the id of the
 * message of its report.
 */
type Place = "vertex" | "callback" | "dataBlock" | "text"

/**
 * The rule `flowchart/no-bare-comment-marker`, described in
 * `docs/rules/flowchart/no-bare-comment-marker.md`: a line that holds only
 * `%%`, in any token of the diagram (see `bareMarkers`). An `Identifier` token
 * `%%` is a vertex that mermaid.js makes; in the name of the function that
 * `click` calls, the line goes into the name; a line of any other token is
 * text that mermaid.js keeps, a label, a description, a title, a string, or
 * the arguments of `call`; in a data block, the line is read as part of the
 * data, where it makes the data invalid and mermaid.js rejects the diagram,
 * or stays in a string. The rule does not read the data, so its message says
 * only that it is part of it. Lines in a description block that is not closed
 * are not reported (see `create`).
 */
export const noBareCommentMarker: MermaidRuleDefinition<{
  RuleOptions: []
  MessageIds:
    | "vertex"
    | "callback"
    | "text"
    | "dataBlock"
    | "removeMarker"
    | "removeCallbackLine"
    | "removeTextLine"
    | "removeDataLine"
}> = {
  meta: {
    type: "problem",
    docs: {
      description: "Disallow a line that holds only `%%`.",
      recommended: false,
      url: ruleDocsUrl("flowchart/no-bare-comment-marker"),
    },
    hasSuggestions: true,
    schema: [],
    messages: {
      vertex:
        "mermaid.js reads this `%%` as a vertex with the id `%%`, not as a comment.",
      text: "mermaid.js keeps this `%%` line in the text, not as a comment.",
      callback:
        "mermaid.js reads this `%%` line into the name of the function to call, not as a comment.",
      dataBlock:
        "mermaid.js reads this `%%` line as part of the data, not as a comment.",
      removeMarker:
        "Remove the `%%`: mermaid.js then makes no vertex from this line.",
      removeCallbackLine:
        "Remove the line of only `%%`: the name of the function to call then no longer holds this line.",
      removeTextLine:
        "Remove the line of only `%%`: the text then no longer holds this line.",
      removeDataLine:
        "Remove the line of only `%%`: the data block then no longer holds this line.",
    },
  },
  create(context) {
    const { sourceCode } = context
    const dataBlocks: FlowchartDataBlock[] = []
    /** The names of the functions that `click A` calls. */
    const callbackNames: Range[] = []
    /**
     * The vertex statements that are one vertex and no link. Removing a `%%`
     * from another statement leaves a text that mermaid.js rejects or reads
     * with the link moved to the next statement.
     */
    const lonelyVertices: Range[] = []
    /** The nodes that show a text, which hold the lines. */
    const textNodes: TextNode[] = []
    // The description blocks that are not closed, whose lines are not
    // reported: mermaid.js drops their text whatever it holds, and
    // `no-unclosed-description-block` reports the block.
    const unclosedBlocks: Range[] = []

    /** Whether `index` lies in one of `ranges`. */
    function inAny(ranges: readonly Range[], index: number): boolean {
      return ranges.some((range) => range[0] <= index && index < range[1])
    }

    /** Where the line `%%` at `marker`, in `token`, stands. */
    function placeOf(token: Token, marker: number): Place {
      if (inAny(callbackNames, marker)) return "callback"
      if (token.type === "Identifier") return "vertex"
      if (
        inAny(
          dataBlocks.map((block) => block.range),
          marker,
        )
      ) {
        return "dataBlock"
      }
      return "text"
    }

    /**
     * The text of the value that holds `marker`: the text of the innermost
     * node of the `TEXT_NODE_TYPES` that holds it, or undefined where none
     * does.
     */
    function valueAt(marker: number): string | undefined {
      const innermost = textNodes
        .filter((each) => each.range[0] <= marker && marker < each.range[1])
        .reduce<TextNode | undefined>(
          (best, each) =>
            best === undefined ||
            each.range[1] - each.range[0] < best.range[1] - best.range[0]
              ? each
              : best,
          undefined,
        )
      return innermost === undefined ? undefined : textOf(innermost)
    }

    /** The suggestions for the line `%%` at `marker`, in `token`, at `place`. */
    function suggestionsFor(
      token: Token,
      marker: number,
      place: Place,
    ): SuggestedEdit<
      | "removeMarker"
      | "removeCallbackLine"
      | "removeTextLine"
      | "removeDataLine"
    >[] {
      const line = sourceCode.getLocFromIndex(marker).line
      if (place === "vertex") {
        return inAny(lonelyVertices, marker)
          ? [markerRemoval(sourceCode, token)]
          : []
      }
      // The line is removed only from a value that holds more than lines of
      // `%%`: where the line is the whole value, what is left is not what the
      // author wrote (the next line becomes the value, or nothing is left).
      const value = valueAt(marker)
      if (value === undefined || !holdsOtherText(value)) return []
      if (place === "callback") {
        return lineRemoval(sourceCode, line, "removeCallbackLine")
      }
      if (place === "dataBlock") {
        return lineRemoval(sourceCode, line, "removeDataLine")
      }
      return lineRemoval(sourceCode, line, "removeTextLine")
    }

    return {
      FlowchartDataBlock(node) {
        dataBlocks.push(node)
      },
      FlowchartAccDescrBlockStatement(node) {
        if (!node.closed) unclosedBlocks.push(node.range)
      },
      FlowchartVertexStatement(node) {
        if (node.links.length === 0 && node.first.vertices.length === 1) {
          lonelyVertices.push(node.range)
        }
      },
      FlowchartClickCallbackStatement(node) {
        callbackNames.push(node.callback.range)
      },
      "FlowchartDiagram:exit"(node) {
        traverseNodes(node, {
          enterNode(each) {
            if (isTextNode(each)) textNodes.push(each)
          },
          leaveNode() {
            // Each node is checked on entering it.
          },
        })
        for (const token of sourceCode.getTokens(node)) {
          if (token.type === "Directive") continue
          for (const marker of bareMarkers(sourceCode, token)) {
            if (inAny(unclosedBlocks, marker)) continue
            const place = placeOf(token, marker)
            context.report({
              loc: {
                start: sourceCode.getLocFromIndex(marker),
                end: sourceCode.getLocFromIndex(marker + "%%".length),
              },
              messageId: place,
              suggest: suggestionsFor(token, marker, place),
            })
          }
        }
      },
    }
  },
}
