import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import { checkTokensInValueNodes, nodeTokensIn, tokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { nodesOf } from "./walk.ts"

/**
 * ast/er.md, ErRelationship, and diagrams/er.md, The statement context: the
 * cardinality that each spelling of a unit gives, in lower case, since the
 * words are compared case-insensitively. Either spelling of a symbol is read
 * at either end of the relationship.
 */
const ER_CARDINALITIES: ReadonlyMap<string, string> = new Map([
  ["|o", "zero-or-one"],
  ["o|", "zero-or-one"],
  ["one or zero", "zero-or-one"],
  ["zero or one", "zero-or-one"],
  ["}o", "zero-or-more"],
  ["o{", "zero-or-more"],
  ["zero or more", "zero-or-more"],
  ["zero or many", "zero-or-more"],
  ["0+", "zero-or-more"],
  ["many(0)", "zero-or-more"],
  ["many", "zero-or-more"],
  ["}|", "one-or-more"],
  ["|{", "one-or-more"],
  ["one or more", "one-or-more"],
  ["one or many", "one-or-more"],
  ["1+", "one-or-more"],
  ["many(1)", "one-or-more"],
  ["||", "only-one"],
  ["one", "only-one"],
  ["only one", "only-one"],
  ["1", "only-one"],
  ["u", "md-parent"],
])

/** ast/er.md, ErRelationship, and diagrams/er.md, The statement context: the relationship line that each spelling of a unit gives, in lower case. */
const ER_LINES: ReadonlyMap<string, string> = new Map([
  ["--", "identifying"],
  ["to", "identifying"],
  ["..", "non-identifying"],
  ["optionally to", "non-identifying"],
  [".-", "non-identifying"],
  ["-.", "non-identifying"],
])

/**
 * ast/er.md, ErRelationship: the node has the three units of the relationship
 * as its tokens, one token each, and its fields are the names that their
 * spellings give: the cardinality at the left entity, the line, and the
 * cardinality at the right one.
 */
function checkErRelationship(
  root: CheckedRoot,
  relationship: CheckedNode,
  problems: Problems,
): void {
  const where = label(relationship)
  const units = nodeTokensIn(root, relationship.range).map((token) =>
    token.value.toLowerCase(),
  )
  problems.expectEqual(
    units.length,
    3,
    where,
    "the number of tokens, one for each of its three units",
  )
  const [left, line, right] = units
  problems.expectEqual(
    {
      leftCardinality: relationship.leftCardinality,
      line: relationship.line,
      rightCardinality: relationship.rightCardinality,
    },
    {
      leftCardinality: ER_CARDINALITIES.get(left ?? "") ?? null,
      line: ER_LINES.get(line ?? "") ?? null,
      rightCardinality: ER_CARDINALITIES.get(right ?? "") ?? null,
    },
    where,
    `the fields, written ${units.join(" ")}`,
  )
}

/**
 * ast/er.md, ErDirectionStatement: the direction is the value of the
 * statement in upper case, the second `Keyword` token after `direction`, which
 * is written in any case.
 */
function checkErDirection(
  root: CheckedRoot,
  statement: CheckedNode,
  problems: Problems,
): void {
  const [word, value] = tokensIn(root, statement.range)
    .filter((token) => token.type === "Keyword")
    .map((token) => token.value)
  problems.expectEqual(
    [word?.toLowerCase(), value?.toUpperCase()],
    ["direction", statement.direction],
    label(statement),
    "the keywords, the value in upper case",
  )
}

/**
 * ast/er.md, ErAttribute: `optional` is whether a `?` follows the type, which
 * is the one `Punctuator` `?` of the attribute.
 */
function checkErAttribute(
  root: CheckedRoot,
  attribute: CheckedNode,
  problems: Problems,
): void {
  const marks = tokensIn(root, attribute.range).filter(
    (token) => token.type === "Punctuator" && token.value === "?",
  )
  problems.expectEqual(
    attribute.optional,
    marks.length > 0,
    label(attribute),
    "optional, which is whether a `?` follows the type",
  )
}

/**
 * ast/er.md: checks what the ER document states about its tree beyond the
 * conditions of every tree (ast.md): the tokens of values lie in value nodes,
 * and the fixed words and marks of a node are its tokens: the cardinalities
 * and the line of a relationship, the value of a direction statement, and the
 * `?` of an attribute.
 */
export function checkErTree(root: CheckedRoot, problems: Problems): void {
  checkTokensInValueNodes(root, problems)
  for (const node of nodesOf(root)) {
    switch (node.type) {
      case "ErRelationship":
        checkErRelationship(root, node, problems)
        break
      case "ErDirectionStatement":
        checkErDirection(root, node, problems)
        break
      case "ErAttribute":
        checkErAttribute(root, node, problems)
        break
      default:
        break
    }
  }
}
