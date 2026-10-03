import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import { checkTokensInValueNodes, nodeTokensIn, tokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { nodesOf } from "./walk.ts"

/** ast/class.md, ClassArrow: the marker of each relation end. */
const CLASS_MARKERS: ReadonlyMap<string, string> = new Map([
  ["<|", "triangle"],
  ["|>", "triangle"],
  ["*", "filled-diamond"],
  ["o", "hollow-diamond"],
  ["<", "arrow"],
  [">", "arrow"],
  ["()", "lollipop"],
])

/** ast/class.md, ClassArrow: the line of each line token. */
const CLASS_LINES: ReadonlyMap<string, string> = new Map([
  ["--", "solid"],
  ["..", "dotted"],
])

/**
 * ast/class.md, ClassArrow: each relation end and the line are one
 * `Punctuator` token, and the fields are what the tokens write.
 */
function checkClassArrow(
  root: CheckedRoot,
  arrow: CheckedNode,
  problems: Problems,
): void {
  const where = label(arrow)
  // A directive can lie between a relation end and the line, so the arrow is
  // read from the texts of its tokens, joined.
  const tokens = nodeTokensIn(root, arrow.range)
  for (const token of tokens) {
    problems.expect(
      token.type === "Punctuator",
      where,
      `the token at ${token.range[0]}-${token.range[1]} is a ${token.type}, not a Punctuator`,
    )
  }
  const written = tokens.map((token) => token.value).join("")
  const parsed = parseClassArrow(written)
  if (parsed === null) {
    problems.report(where, `the text ${JSON.stringify(written)} is no arrow`)
    return
  }
  problems.expectEqual(
    {
      startMarker: arrow.startMarker,
      line: arrow.line,
      endMarker: arrow.endMarker,
    },
    parsed,
    where,
    `the fields, written ${String(arrow.value)}`,
  )
}

/**
 * ast/class.md, ClassArrow: the fields that an arrow writes: an optional
 * relation end, the line `--` or `..`, and an optional relation end; null
 * when the text is no arrow.
 */
function parseClassArrow(
  text: string,
): { startMarker: string; line: string; endMarker: string } | null {
  const ends = [...CLASS_MARKERS.keys()].sort((a, b) => b.length - a.length)
  const startEnd = ends.find((end) => text.startsWith(end)) ?? ""
  const afterStart = text.slice(startEnd.length)
  const line = [...CLASS_LINES.keys()].find((l) => afterStart.startsWith(l))
  if (line === undefined) return null
  const rest = afterStart.slice(line.length)
  if (rest !== "" && !CLASS_MARKERS.has(rest)) return null
  return {
    startMarker: startEnd === "" ? "none" : (CLASS_MARKERS.get(startEnd) ?? ""),
    line: CLASS_LINES.get(line) ?? "",
    endMarker: rest === "" ? "none" : (CLASS_MARKERS.get(rest) ?? ""),
  }
}

/** ast/class.md, ClassMethod: the mark of each visibility. */
const CLASS_VISIBILITY_MARKS: ReadonlyMap<string, string> = new Map([
  ["+", "public"],
  ["-", "private"],
  ["#", "protected"],
  ["~", "package"],
])

/** ast/class.md, ClassMethod: the mark of each classifier. */
const CLASS_CLASSIFIER_MARKS: ReadonlyMap<string, string> = new Map([
  ["$", "static"],
  ["*", "abstract"],
])

/**
 * ast/class.md, ClassMethod and ClassAttribute: the marks of visibility and
 * classifier are `Punctuator` tokens of the member: the visibility mark comes
 * before every other `Punctuator`, and the classifier mark is the one `$` or
 * `*` among them.
 */
function checkClassMember(
  root: CheckedRoot,
  member: CheckedNode,
  problems: Problems,
): void {
  const where = label(member)
  const punctuators = tokensIn(root, member.range)
    .filter((token) => token.type === "Punctuator")
    .map((token) => token.value)
  const [first] = punctuators
  problems.expectEqual(
    member.visibility,
    CLASS_VISIBILITY_MARKS.get(first ?? "") ?? "none",
    where,
    "the visibility",
  )
  const classifiers = punctuators.filter((value) =>
    CLASS_CLASSIFIER_MARKS.has(value),
  )
  problems.expect(
    classifiers.length <= 1,
    where,
    "has more than one classifier mark",
  )
  problems.expectEqual(
    member.classifier,
    CLASS_CLASSIFIER_MARKS.get(classifiers[0] ?? "") ?? "none",
    where,
    "the classifier",
  )
}

/**
 * ast/class.md: checks what the class document states about its tree beyond
 * the conditions of every tree (ast.md): the values of the leaf nodes are
 * their written texts, the tokens of values lie in value nodes, and the fixed
 * words and marks of a node are its tokens: the relation ends and the line of
 * an arrow, the visibility and classifier marks of a member, the value of a
 * direction statement, and the target of a link.
 */
export function checkClassTree(root: CheckedRoot, problems: Problems): void {
  const nodes = nodesOf(root)
  checkTokensInValueNodes(root, problems)
  for (const node of nodes) {
    switch (node.type) {
      case "ClassArrow":
        checkClassArrow(root, node, problems)
        break
      case "ClassMethod":
      case "ClassAttribute":
        checkClassMember(root, node, problems)
        break
      case "ClassDirectionStatement":
        problems.expectEqual(
          tokensIn(root, node.range)
            .filter((token) => token.type === "Keyword")
            .map((token) => token.value),
          ["direction", node.direction],
          label(node),
          "the keywords",
        )
        break
      case "ClassLinkStatement": {
        const last = tokensIn(root, node.range).at(-1)
        problems.expectEqual(
          last?.type === "Keyword" ? last.value : null,
          node.target,
          label(node),
          "the last token, which is the target",
        )
        break
      }
      default:
        break
    }
  }
}
