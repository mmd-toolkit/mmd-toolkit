import { isWordCharacter } from "../db-from-tree/characters.ts"
import {
  checkChildTypes,
  checkFieldWords,
  checkListsWithAnEntry,
} from "./field-rules.ts"
import { NODE_FIELDS } from "./node-fields.ts"
import type { Problems } from "./problems.ts"
import { label } from "./problems.ts"
import {
  between,
  checkAccessibilityBlock,
  checkAccessibilityLine,
  checkOwnKinds,
  checkRangeIsHull,
  checkTokenKinds,
  checkTrimmedValue,
  childOf,
  endsWithWhitespace,
  entriesOf,
  isBlank,
  ownOf,
  readingOf,
  restOfLineIsBlank,
  startsWithWhitespace,
  textOf,
} from "./statement-checks.ts"
import type { Own, Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes, nodeTokensIn } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { isNode, walkNodes } from "./walk.ts"

// ast/requirement.md and diagrams/requirement.md: what the requirement
// documents state about the tree beyond the conditions of every tree (ast.md).
// The tokens of a statement that no child node holds are the keywords and
// marks that its grammar rule writes (diagrams/requirement.md, Grammar); the
// gaps between them and the values are what the rules of the lexer read (The
// statement context). The kinds of the tokens are those of the table of
// parser/docs/tokens/requirement.md, and the ranges of the nodes those of
// parser/docs/positions/requirement.md.

/**
 * parser/docs/tokens/requirement.md, Tokens: the texts of the `Punctuator`
 * tokens that a node writes itself; every other token that a node writes
 * itself is a `Keyword` token (the header, the kinds of requirement, the names
 * of the fields, the risks, the methods, the relationships, `element`, `style`,
 * `classDef`, `class`, `accTitle`, `accDescr`, `direction`, and its value).
 */
const OWN_PUNCTUATORS: readonly string[] = [
  ":",
  ",",
  "{",
  "}",
  ":::",
  "-",
  "->",
  "<-",
]

/**
 * parser/docs/tokens/requirement.md, Tokens, and diagrams/requirement.md, The
 * style context: the kinds of the tokens of a name, by the field of its node
 * that holds it. A name after `style` or `classDef` is a `style-word` unit, an
 * `Identifier` token; one of a requirement, an element, a relationship, and a
 * shorthand is an `unquoted-text` unit, a `RawText` token; a name of a `class`
 * statement is a `style-word` unit (a line feed ends the style context, and
 * the names list does not go on after it), and a class of it a `style-word`
 * unit, or an `unquoted-text` unit where the statement goes on after the line
 * feed.
 */
const NAME_TOKEN_KINDS: Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
> = {
  RequirementRequirementStatement: {
    name: ["RawText"],
    cssClasses: ["RawText"],
  },
  RequirementElementStatement: { name: ["RawText"], cssClasses: ["RawText"] },
  RequirementRelationshipStatement: { left: ["RawText"], right: ["RawText"] },
  RequirementClassShorthandStatement: {
    name: ["RawText"],
    cssClasses: ["RawText"],
  },
  RequirementStyleStatement: { names: ["Identifier"] },
  RequirementClassDefStatement: { cssClasses: ["Identifier"] },
  RequirementClassStatement: {
    names: ["Identifier"],
    cssClasses: ["Identifier", "RawText"],
  },
}

/** ast/requirement.md, RequirementRequirementStatement: the kinds of requirement. */
const REQUIREMENT_TYPES: readonly string[] = [
  "requirement",
  "functionalRequirement",
  "interfaceRequirement",
  "performanceRequirement",
  "physicalRequirement",
  "designConstraint",
]

/** ast/requirement.md, RequirementRiskField: the risks. */
const RISKS: readonly string[] = ["low", "medium", "high"]

/** ast/requirement.md, RequirementVerifyMethodField: the verification methods. */
const VERIFY_METHODS: readonly string[] = [
  "analysis",
  "demonstration",
  "inspection",
  "test",
]

/** ast/requirement.md, RequirementRelationshipStatement: the kinds of relationship. */
const RELATIONSHIPS: readonly string[] = [
  "contains",
  "copies",
  "derives",
  "satisfies",
  "verifies",
  "refines",
  "traces",
]

/** ast/requirement.md, RequirementDirectionStatement: the directions. */
const DIRECTIONS: readonly string[] = ["TB", "BT", "RL", "LR"]

/** The words that a value field of a node type has, by node type and field. */
const FIELD_WORDS: Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
> = {
  RequirementRequirementStatement: { requirementType: REQUIREMENT_TYPES },
  RequirementValueField: { field: ["id", "text"] },
  RequirementRiskField: { risk: RISKS },
  RequirementVerifyMethodField: { verifyMethod: VERIFY_METHODS },
  RequirementElementField: { field: ["type", "docref"] },
  RequirementRelationshipStatement: {
    relationship: RELATIONSHIPS,
    arrow: ["forward", "backward"],
  },
  RequirementDirectionStatement: { direction: DIRECTIONS },
}

/** ast/requirement.md, RequirementStatement. */
const STATEMENTS: readonly string[] = [
  "RequirementRequirementStatement",
  "RequirementElementStatement",
  "RequirementRelationshipStatement",
  "RequirementDirectionStatement",
  "RequirementStyleStatement",
  "RequirementClassDefStatement",
  "RequirementClassStatement",
  "RequirementClassShorthandStatement",
  "RequirementAccTitleStatement",
  "RequirementAccDescrStatement",
  "RequirementAccDescrBlockStatement",
]

/** The node types of a name (the Type column of the tables of ast/requirement.md). */
const NAME: readonly string[] = ["RequirementIdentifier", "StringLiteral"]

/** The node types of the value of a field. */
const VALUE: readonly string[] = ["RequirementLiteral", "StringLiteral"]

/**
 * ast/requirement.md: the node types that a field of a node type holds, as the
 * Type column of its table gives them; a field that holds a value is not in
 * it. `tests/check-tree-requirement.test.ts` requires the table to be that
 * column. The unit that the author wrote decides the type: a name is a
 * RequirementIdentifier for an `unquoted-text` or a `style-word` unit and a
 * StringLiteral for a `string` unit, and a value is a RequirementLiteral or a
 * StringLiteral in the same way.
 */
export const REQUIREMENT_CHILD_TYPES: Readonly<
  Record<string, Readonly<Record<string, readonly string[]>>>
> = {
  RequirementDiagram: { body: STATEMENTS },
  RequirementRequirementStatement: {
    name: NAME,
    cssClasses: NAME,
    body: [
      "RequirementValueField",
      "RequirementRiskField",
      "RequirementVerifyMethodField",
      "RequirementIgnoredText",
    ],
  },
  RequirementValueField: { value: VALUE },
  RequirementElementStatement: {
    name: NAME,
    cssClasses: NAME,
    body: ["RequirementElementField", "RequirementIgnoredText"],
  },
  RequirementElementField: { value: VALUE },
  RequirementRelationshipStatement: { left: NAME, right: NAME },
  RequirementDirectionStatement: {
    textBefore: ["RequirementIgnoredText"],
    textAfter: ["RequirementIgnoredText"],
  },
  RequirementStyleStatement: {
    names: NAME,
    styles: ["RequirementLiteral"],
  },
  RequirementClassDefStatement: {
    cssClasses: NAME,
    styles: ["RequirementLiteral"],
  },
  RequirementClassStatement: { names: NAME, cssClasses: NAME },
  RequirementClassShorthandStatement: { name: NAME, cssClasses: NAME },
  RequirementAccTitleStatement: { value: ["RequirementLiteral"] },
  RequirementAccDescrStatement: { value: ["RequirementLiteral"] },
  RequirementAccDescrBlockStatement: { value: ["RequirementLiteral"] },
}

/**
 * ast/requirement.md, RequirementStyleStatement, RequirementClassDefStatement,
 * RequirementClassStatement, and RequirementClassShorthandStatement: the lists
 * of a node type that are never empty (a statement with an empty list is
 * rejected).
 */
const LISTS_WITH_AN_ENTRY: Readonly<Record<string, readonly string[]>> = {
  RequirementStyleStatement: ["names", "styles"],
  RequirementClassDefStatement: ["cssClasses", "styles"],
  RequirementClassStatement: ["names", "cssClasses"],
  RequirementClassShorthandStatement: ["cssClasses"],
}

/**
 * diagrams/requirement.md, Units and contexts, Names and values: the
 * characters that end an `unquoted-text` unit, which starts with an ASCII word
 * character and goes on with any character but these. A name or a value that
 * is not quoted holds none of them, so that a text that holds one is a string.
 * A lone CR is a line terminator, read as a line feed.
 */
const UNQUOTED_TEXT_ENDS: readonly string[] = [
  ":",
  ",",
  "{",
  "<",
  ">",
  "-",
  "=",
  "\n",
  "\r",
]

/** diagrams/requirement.md, The direction line: the characters that the text before `direction` holds none of (a lone CR is a line feed). */
const TEXT_BEFORE_NEVER_HOLDS: readonly string[] = [
  "\n",
  "\r",
  "\u2028",
  "\u2029",
]

/** diagrams/requirement.md, The direction line: the characters that the text after the value holds none of; a U+2028 is one it may hold. */
const TEXT_AFTER_NEVER_HOLDS: readonly string[] = ["\n", "\r"]

/** `word` as a label of a part of a statement: a token, by its text in lower case. */
function tokenLabel(word: string): string {
  return JSON.stringify(word)
}

/** The label of a part of a statement that is a child node of the field `field`. */
function childLabel(field: string): string {
  return `<${field}>`
}

/** One label for each entry of the list in `field`. */
function each(node: CheckedNode, field: string): string[] {
  return entriesOf(node, field).map(() => childLabel(field))
}

/** The label of the node in `field`, or none where it is null. */
function optional(node: CheckedNode, field: string): string[] {
  return childOf(node, field) === null ? [] : [childLabel(field)]
}

/** One label for each entry of the list in `field`, and the label of a `,` between each two entries. */
function separated(node: CheckedNode, field: string): string[] {
  return each(node, field).flatMap((entry, index) =>
    index === 0 ? [entry] : [tokenLabel(","), entry],
  )
}

/** The `:::` and the classes of `node` that follow a name, none where it has no classes. */
function classes(node: CheckedNode): string[] {
  const list = separated(node, "cssClasses")
  return list.length === 0 ? [] : [tokenLabel(":::"), ...list]
}

/**
 * diagrams/requirement.md, Grammar, and the tables of ast/requirement.md: the
 * tokens that a node writes itself and its child nodes, in source order, as
 * labels: a token by its text in lower case, since the keywords are read
 * case-insensitively, and a child node by its field. The words of the fields
 * are those of the node, so that a
 * field that disagrees with the keyword that was written is reported here:
 * the kind of requirement (the keyword that starts the statement, in the form
 * of the names of the kinds), the field, the risk, the verification method,
 * the relationship, and the direction (the value in upper case).
 *
 * - A requirement or an element: the keyword, the name, the `:::` and the
 *   classes (none where there are no classes), `{`, the items, `}`.
 * - A relationship: the left name, the line, the relationship, the line, the
 *   right name. The arrow `forward` is `-` and `->`, and `backward` is `<-`
 *   and `-`.
 * - A direction: the text before, `direction`, the value, the text after.
 * - A style, a class definition, a class statement: the keyword and the lists,
 *   with a `,` between two entries of a list.
 */
const PARTS: Readonly<Record<string, (node: CheckedNode) => string[]>> = {
  RequirementDiagram: (node) => [
    tokenLabel("requirementdiagram"),
    ...each(node, "body"),
  ],
  RequirementRequirementStatement: (node) => [
    tokenLabel(textOf(node, "requirementType").toLowerCase()),
    childLabel("name"),
    ...classes(node),
    tokenLabel("{"),
    ...each(node, "body"),
    tokenLabel("}"),
  ],
  RequirementValueField: (node) => [
    tokenLabel(textOf(node, "field")),
    tokenLabel(":"),
    childLabel("value"),
  ],
  RequirementRiskField: (node) => [
    tokenLabel("risk"),
    tokenLabel(":"),
    tokenLabel(textOf(node, "risk")),
  ],
  RequirementVerifyMethodField: (node) => [
    tokenLabel("verifymethod"),
    tokenLabel(":"),
    tokenLabel(textOf(node, "verifyMethod")),
  ],
  RequirementElementStatement: (node) => [
    tokenLabel("element"),
    childLabel("name"),
    ...classes(node),
    tokenLabel("{"),
    ...each(node, "body"),
    tokenLabel("}"),
  ],
  RequirementElementField: (node) => [
    tokenLabel(textOf(node, "field")),
    tokenLabel(":"),
    childLabel("value"),
  ],
  RequirementRelationshipStatement: (node) =>
    node.arrow === "backward"
      ? [
          childLabel("left"),
          tokenLabel("<-"),
          tokenLabel(textOf(node, "relationship")),
          tokenLabel("-"),
          childLabel("right"),
        ]
      : [
          childLabel("left"),
          tokenLabel("-"),
          tokenLabel(textOf(node, "relationship")),
          tokenLabel("->"),
          childLabel("right"),
        ],
  RequirementDirectionStatement: (node) => [
    ...optional(node, "textBefore"),
    tokenLabel("direction"),
    tokenLabel(textOf(node, "direction").toLowerCase()),
    ...optional(node, "textAfter"),
  ],
  RequirementStyleStatement: (node) => [
    tokenLabel("style"),
    ...separated(node, "names"),
    ...separated(node, "styles"),
  ],
  RequirementClassDefStatement: (node) => [
    tokenLabel("classdef"),
    ...separated(node, "cssClasses"),
    ...separated(node, "styles"),
  ],
  RequirementClassStatement: (node) => [
    tokenLabel("class"),
    ...separated(node, "names"),
    ...separated(node, "cssClasses"),
  ],
  RequirementClassShorthandStatement: (node) => [
    childLabel("name"),
    tokenLabel(":::"),
    ...separated(node, "cssClasses"),
  ],
  RequirementAccTitleStatement: () => [
    tokenLabel("acctitle"),
    tokenLabel(":"),
    childLabel("value"),
  ],
  RequirementAccDescrStatement: () => [
    tokenLabel("accdescr"),
    tokenLabel(":"),
    childLabel("value"),
  ],
  RequirementAccDescrBlockStatement: (node) => [
    tokenLabel("accdescr"),
    tokenLabel("{"),
    ...optional(node, "value"),
    tokenLabel("}"),
  ],
}

/** The tokens that `node` writes itself and its child nodes, in source order, as labels (see {@link PARTS}). */
function actualPartsOf(node: CheckedNode, own: Own): string[] {
  const parts = own.tokens.map((token) => ({
    label: tokenLabel(token.value.toLowerCase()),
    start: token.range[0],
  }))
  for (const field of Object.keys(NODE_FIELDS[node.type] ?? {})) {
    const value = node[field]
    for (const child of Array.isArray(value) ? (value as unknown[]) : [value]) {
      if (isNode(child)) {
        parts.push({ label: childLabel(field), start: child.range[0] })
      }
    }
  }
  return parts.sort((a, b) => a.start - b.start).map((part) => part.label)
}

/**
 * ast/requirement.md, RequirementDirectionStatement, and
 * diagrams/requirement.md, The statement context, The direction line: the text
 * before `direction` and the text after the value are what lies on the
 * direction line around the statement, without the whitespace at their ends.
 * The text before holds no line feed, no U+2028, and no U+2029, and the text
 * after no line feed; the whitespace between the keyword and the value is not
 * empty, and the text after, or the value where there is none, reaches the end
 * of the line.
 */
function checkDirection(reading: Reading, node: CheckedNode, own: Own): void {
  const where = label(node)
  const before = childOf(node, "textBefore")
  const after = childOf(node, "textAfter")
  const [keyword, value] = own.tokens
  if (keyword === undefined || value === undefined) return
  if (before !== null) {
    const holds = TEXT_BEFORE_NEVER_HOLDS.find((character) =>
      textOf(before).includes(character),
    )
    reading.problems.expect(
      holds === undefined,
      where,
      `the text before ${JSON.stringify(textOf(before))} holds ${JSON.stringify(holds)}, which ends a direction line or the text before`,
    )
    const gap = between(reading, before.range[1], keyword.range[0])
    reading.problems.expect(
      isBlank(gap),
      where,
      `the written text between the text before and \`direction\` is ${JSON.stringify(gap)}, not whitespace only`,
    )
  }
  const separator = between(reading, keyword.range[1], value.range[0])
  reading.problems.expect(
    separator !== "" && isBlank(separator),
    where,
    `the written text between \`direction\` and the value is ${JSON.stringify(separator)}, not whitespace`,
  )
  if (after !== null) {
    const holds = TEXT_AFTER_NEVER_HOLDS.find((character) =>
      textOf(after).includes(character),
    )
    reading.problems.expect(
      holds === undefined,
      where,
      `the text after ${JSON.stringify(textOf(after))} holds ${JSON.stringify(holds)}, which ends the direction line`,
    )
    const gap = between(reading, value.range[1], after.range[0])
    reading.problems.expect(
      isBlank(gap),
      where,
      `the written text between the value and the text after is ${JSON.stringify(gap)}, not whitespace only`,
    )
  }
  reading.problems.expect(
    restOfLineIsBlank(reading, (after ?? value).range[1]),
    where,
    "the direction line goes on after the last part of the statement",
  )
}

/** The field of `parent` that holds `node`, or the empty text for a node with no parent. */
function fieldOf(parent: CheckedNode | null, node: CheckedNode): string {
  if (parent === null) return ""
  for (const field of Object.keys(NODE_FIELDS[parent.type] ?? {})) {
    const value = parent[field]
    if (value === node || (Array.isArray(value) && value.includes(node))) {
      return field
    }
  }
  return ""
}

/** Checks that a name or an unquoted value starts with an ASCII word character and holds none of the characters that end an unquoted unit (see {@link UNQUOTED_TEXT_ENDS}). */
function checkUnquotedText(reading: Reading, node: CheckedNode): void {
  const value = textOf(
    node,
    node.type === "RequirementIdentifier" ? "name" : "value",
  )
  const where = label(node)
  reading.problems.expect(
    value === "" || isWordCharacter(value.charCodeAt(0)),
    where,
    `${JSON.stringify(value)} starts with ${JSON.stringify(value.charAt(0))}, which is no ASCII word character, with which an unquoted name or value starts`,
  )
  const end = UNQUOTED_TEXT_ENDS.find((character) => value.includes(character))
  reading.problems.expect(
    end === undefined,
    where,
    `${JSON.stringify(value)} holds ${JSON.stringify(end)}, which ends an unquoted name or value`,
  )
}

/**
 * ast/requirement.md, RequirementIdentifier and RequirementLiteral: the value
 * of a name or a text without quotes is not empty and starts and ends without
 * whitespace; the tokens of a text are `RawText` tokens, also where a directive
 * cuts them, and those of a name are of the kinds that its field gives (see
 * {@link NAME_TOKEN_KINDS}).
 */
function checkUnquoted(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | null,
): void {
  const isName = node.type === "RequirementIdentifier"
  const value = textOf(node, isName ? "name" : "value")
  const where = label(node)
  reading.problems.expect(value !== "", where, `the ${node.type} is empty`)
  reading.problems.expect(
    !startsWithWhitespace(value) && !endsWithWhitespace(value),
    where,
    `the ${node.type} starts or ends with whitespace: ${JSON.stringify(value)}`,
  )
  if (isName) {
    const field = fieldOf(parent, node)
    checkTokenKinds(
      reading,
      node,
      NAME_TOKEN_KINDS[parent?.type ?? ""]?.[field] ?? ["RawText"],
      `a ${node.type} in ${field}`,
    )
  } else {
    checkTokenKinds(reading, node, ["RawText"], `a ${node.type}`)
  }
  // A name, and the value of a field, are units of an unquoted text; the
  // styles and the accessibility texts are not.
  if (
    isName ||
    parent?.type === "RequirementValueField" ||
    parent?.type === "RequirementElementField"
  ) {
    checkUnquotedText(reading, node)
  }
  if (
    !isName &&
    (parent?.type === "RequirementStyleStatement" ||
      parent?.type === "RequirementClassDefStatement")
  ) {
    reading.problems.expect(
      !value.includes(","),
      where,
      `the style ${JSON.stringify(value)} holds a \`,\`, which separates styles`,
    )
  }
}

/**
 * ast/requirement.md, RequirementIgnoredText: the text of a direction line
 * is `RawText`, trimmed, and not empty; an item of a body is the text of an
 * empty description block, `accDescr`, `{`, and `}`, with only whitespace
 * between them.
 */
function checkIgnoredText(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | null,
): void {
  const value = textOf(node)
  const where = label(node)
  reading.problems.expect(
    value !== "",
    where,
    "the RequirementIgnoredText is empty",
  )
  reading.problems.expect(
    !startsWithWhitespace(value) && !endsWithWhitespace(value),
    where,
    `the RequirementIgnoredText starts or ends with whitespace: ${JSON.stringify(value)}`,
  )
  if (parent?.type === "RequirementDirectionStatement") {
    checkTokenKinds(reading, node, ["RawText"], "the text of a direction line")
    return
  }
  checkTokenKinds(
    reading,
    node,
    ["Keyword", "Punctuator"],
    "an empty description block, `accDescr {}`",
  )
  const block = [...value]
    .filter((character) => !isBlank(character))
    .join("")
    .toLowerCase()
  reading.problems.expectEqual(
    block,
    "accdescr{}",
    where,
    "the text of an item of a body, without its whitespace, which is an empty description block",
  )
}

/**
 * ast.md, StringLiteral, and diagrams/requirement.md, Units and contexts: a
 * string is closed (the text may not end inside one), and it is a `string`
 * unit only when a character lies between its quotes, so it is not empty. It
 * is one `String` token, or `StringFragment` tokens where a directive or an
 * ignored `;` cuts it (parser/docs/tokens/requirement.md, Tokens).
 */
function checkString(reading: Reading, node: CheckedNode): void {
  const where = label(node)
  reading.problems.expect(
    node.closed === true,
    where,
    "the string is not closed",
  )
  reading.problems.expect(textOf(node) !== "", where, "the string is empty")
  const tokens = nodeTokensIn(reading.root, node.range)
  const [first] = tokens
  reading.problems.expect(
    (tokens.length === 1 && first?.type === "String") ||
      (tokens.length > 0 &&
        tokens.every((token) => token.type === "StringFragment")),
    where,
    `the tokens of the string are not one String token or StringFragment tokens: ${tokens.map((token) => token.type).join(", ")}`,
  )
}

/**
 * ast/requirement.md, RequirementAccDescrBlockStatement: the text between the
 * braces holds no `}`, which closes the block.
 */
function checkBlockValue(reading: Reading, node: CheckedNode): void {
  const value = textOf(childOf(node, "value"))
  reading.problems.expect(
    !value.includes("}"),
    label(node),
    `the value ${JSON.stringify(value)} holds a \`}\`, which closes the block`,
  )
}

/**
 * Checks what the requirement document states about a requirement tree beyond
 * the conditions of every tree (ast.md): the tokens of values lie in value
 * nodes; the tokens that a node writes itself and its child nodes are those of
 * its statement, in source order (the keywords with the words of its fields,
 * the marks, and the names); the child nodes are of the types that the tables
 * give; and the values are what they write: the names and the texts without
 * quotes, the strings, the text around a direction, and the accessibility
 * statements.
 */
export function checkRequirementTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  checkTokensInValueNodes(root, problems)
  const reading = readingOf(text, root, problems)
  walkNodes(root, (node, parent) => {
    switch (node.type) {
      case "RequirementIdentifier":
      case "RequirementLiteral":
        checkUnquoted(reading, node, parent)
        return
      case "RequirementIgnoredText":
        checkIgnoredText(reading, node, parent)
        return
      case "StringLiteral":
        checkString(reading, node)
        return
      default:
        break
    }
    // The root holds the tokens of the frontmatter, which no statement has.
    if (node.type === "Root") return
    const own = ownOf(root, node)
    checkOwnKinds(reading, node, own, OWN_PUNCTUATORS)
    checkRangeIsHull(reading, node, own)
    const parts = PARTS[node.type]
    if (parts !== undefined) {
      problems.expectEqual(
        actualPartsOf(node, own),
        parts(node),
        label(node),
        "the tokens that the node writes itself and its child nodes, in source order",
      )
    }
    checkChildTypes(reading, node, REQUIREMENT_CHILD_TYPES)
    checkFieldWords(reading, node, FIELD_WORDS)
    checkListsWithAnEntry(reading, node, LISTS_WITH_AN_ENTRY)
    switch (node.type) {
      case "RequirementDiagram":
        // diagrams/requirement.md, Detection: the detector compares
        // `requirement` in exactly this case, and the lexer reads the rest of
        // the header in any case.
        problems.expect(
          own.text.startsWith("requirement"),
          label(node),
          `the header ${JSON.stringify(own.text)} does not start with \`requirement\` in lower case`,
        )
        break
      case "RequirementDirectionStatement":
        checkDirection(reading, node, own)
        break
      case "RequirementAccTitleStatement":
      case "RequirementAccDescrStatement":
        checkAccessibilityLine(reading, node, own)
        checkTrimmedValue(
          reading,
          node,
          childOf(node, "value"),
          "the value of an accessibility statement",
        )
        break
      case "RequirementAccDescrBlockStatement":
        checkAccessibilityBlock(reading, node, own)
        checkTrimmedValue(
          reading,
          node,
          childOf(node, "value"),
          "the value of a description block",
        )
        checkBlockValue(reading, node)
        break
      default:
        break
    }
  })
}
