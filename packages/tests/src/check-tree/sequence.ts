import { isWhitespace } from "../db-from-tree/characters.ts"
import type { TreeRange } from "../db-from-tree/tree.ts"
import { contains } from "./invariants.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  checkTokensInValueNodes,
  tokensIn,
  nodeTokensIn,
  wordsIn,
} from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { isNode, nodesOf } from "./walk.ts"

/**
 * ast/sequence.md, SequenceArrow: the markers that an arrow writes before its
 * line, and after it, case-insensitively. An arrow ends with one of the end
 * markers, and with nothing after a start marker other than `arrow`.
 */
const SEQUENCE_START_MARKERS: readonly (readonly [string, string])[] = [
  ["<<", "arrow"],
  ["/|", "half-arrow-top"],
  ["\\|", "half-arrow-bottom"],
  ["//", "half-stick-top"],
  ["\\\\", "half-stick-bottom"],
]
const SEQUENCE_END_MARKERS: ReadonlyMap<string, string> = new Map([
  [">>", "arrow"],
  [">", "none"],
  ["x", "cross"],
  [")", "open-arrow"],
  ["|\\", "half-arrow-top"],
  ["|/", "half-arrow-bottom"],
  ["\\\\", "half-stick-top"],
  ["//", "half-stick-bottom"],
  ["", "none"],
])

/**
 * ast/sequence.md, SequenceArrow: the arrow is one `Punctuator` token, and its fields are
 * what its value writes: an optional start marker, the line `-` (`solid`) or
 * `--` (`dotted`), and the end marker.
 */
function checkSequenceArrow(
  root: CheckedRoot,
  arrow: CheckedNode,
  problems: Problems,
): void {
  const where = label(arrow)
  problems.expectEqual(
    nodeTokensIn(root, arrow.range).map((token) => [token.type, token.range]),
    [["Punctuator", arrow.range]],
    where,
    "tokens",
  )
  if (typeof arrow.value !== "string") {
    problems.report(where, "has no value")
    return
  }
  const value = arrow.value.toLowerCase()
  const start = SEQUENCE_START_MARKERS.find(([written]) =>
    value.startsWith(written),
  )
  const afterStart = value.slice(start?.[0].length ?? 0)
  const line = afterStart.startsWith("--") ? "dotted" : "solid"
  const end = afterStart.slice(line === "dotted" ? 2 : 1)
  problems.expectEqual(
    {
      startMarker: arrow.startMarker,
      line: arrow.line,
      endMarker: arrow.endMarker,
    },
    {
      startMarker: start?.[1] ?? "none",
      line,
      endMarker: SEQUENCE_END_MARKERS.get(end),
    },
    where,
    `fields, written ${arrow.value}`,
  )
}

/**
 * ast/sequence.md: checks what the sequence document states about its tree
 * beyond the invariants of ast.md: the values of the leaf nodes are their
 * written texts, the tokens of values lie in value nodes, and the fixed words
 * and operators of a node are its tokens: `create` and the keyword of a
 * participant statement, the activation of a message, the placement of a note,
 * the wrap prefix of a text, `off` of an autonumber statement, and the `}` of
 * a closed description block; the arrow of a message is one token, and its
 * fields are what it writes; and each part of a box text is a token of its
 * own.
 */
export function checkSequenceTree(root: CheckedRoot, problems: Problems): void {
  checkTokensInValueNodes(root, problems)
  for (const node of nodesOf(root)) {
    const where = label(node)
    const keywords = wordsIn(root, node.range, "Keyword")
    const punctuators = wordsIn(root, node.range, "Punctuator")
    switch (node.type) {
      case "SequenceParticipantStatement":
      case "SequenceDestroyStatement": {
        // ast/sequence.md, SequenceParticipantStatement and
        // SequenceDestroyStatement: `created` is whether `create` comes before
        // the keyword, and `kind` is the keyword in lower case.
        const [first, second] = keywords
        problems.expectEqual(node.created, first === "create", where, "created")
        const keyword = node.created === true ? second : first
        problems.expectEqual(
          node.type === "SequenceDestroyStatement" ? "destroy" : node.kind,
          keyword,
          where,
          "keyword",
        )
        break
      }
      case "SequenceMessageStatement":
        // ast/sequence.md, SequenceMessageStatement: `activation` is the `+`
        // or `-` after the arrow, and each central connection is a `()`
        // token between the arrow and an id.
        if (isNode(node.arrow)) {
          checkSequenceArrow(root, node.arrow, problems)
        } else {
          problems.report(where, "has no arrow node")
        }
        if (node.activation !== null) {
          problems.expect(
            punctuators.some((value) => value === node.activation),
            where,
            `activation ${JSON.stringify(node.activation)} is not a token`,
          )
        }
        problems.expectEqual(
          Number(node.fromCentralConnection) + Number(node.toCentralConnection),
          punctuators.filter((value) => value === "()").length,
          where,
          "central connections",
        )
        break
      case "SequenceNoteStatement":
        // ast/sequence.md, SequenceNoteStatement: `placement` is the words
        // after `note`, in lower case with one space: `over`, or `left` or
        // `right` and `of`, each a `Keyword` token.
        problems.expectEqual(
          node.placement,
          keywords[1] === "over" ? "over" : keywords.slice(1, 3).join(" "),
          where,
          "placement",
        )
        break
      case "SequenceText": {
        // ast/sequence.md, SequenceText: `wrap` is `wrap` or `nowrap` for the
        // prefix that the text starts with, and null when there is none.
        const [first] = tokensIn(root, node.range)
        const prefix = first?.type === "Keyword" ? first.value : null
        problems.expectEqual(
          node.wrap,
          prefix === null
            ? null
            : prefix.includes("nowrap")
              ? "nowrap"
              : "wrap",
          where,
          "wrap, by the prefix",
        )
        break
      }
      case "SequenceAutonumberStatement":
        // ast/sequence.md, SequenceAutonumberStatement: `off` is whether the
        // statement is `autonumber off`.
        problems.expectEqual(node.off, keywords.includes("off"), where, "off")
        break
      case "SequenceBoxText": {
        // ast/sequence.md, SequenceBoxText, and parser/docs/tokens/sequence.md:
        // each part is one token, unless a directive cuts it into tokens of
        // the same kind, and the whitespace between the colour candidate and
        // the remainder, which the value holds and neither part does, is a
        // `RawText` token of its own (cut into fragments by a directive in
        // it). So the tokens of the text are those in its parts and those of
        // that whitespace. That the range of each part runs from a token to
        // a token is invariant 9.
        const { colorCandidate, remainder } = node
        const parts = [colorCandidate, remainder].filter(
          (part) => part !== null,
        )
        if (!parts.every(isNode)) {
          problems.report(where, "has a part that is not a node")
          break
        }
        const between: TreeRange = [
          isNode(colorCandidate) ? colorCandidate.range[1] : node.range[0],
          isNode(remainder) ? remainder.range[0] : node.range[1],
        ]
        for (const token of tokensIn(root, node.range)) {
          if (
            token.type === "Directive" ||
            parts.some((part) => contains(part.range, token.range))
          ) {
            continue
          }
          problems.expect(
            token.type === "RawText" &&
              isNode(colorCandidate) &&
              isNode(remainder) &&
              between[0] <= token.range[0] &&
              token.range[1] <= between[1] &&
              [...token.value].every((character) =>
                isWhitespace(character.codePointAt(0) ?? 0),
              ),
            where,
            `${label(token)} is neither in a part nor the whitespace between them`,
          )
        }
        break
      }
      case "SequenceAccDescrBlockStatement": {
        // ast/sequence.md, SequenceAccDescrBlockStatement: `closed` is whether
        // the block ends with `}`.
        const last = tokensIn(root, node.range).at(-1)
        problems.expectEqual(
          node.closed,
          last?.type === "Punctuator" && last.value === "}",
          where,
          "closed, by whether its last token is `}`",
        )
        break
      }
      default:
        break
    }
  }
}
