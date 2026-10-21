import {
  ConvertedText,
  readConvertedCharacters,
  withAttributeQuotesRead,
} from "../db-from-tree/converted-text.ts"
import {
  checkChildTypes,
  checkFieldWords,
  checkListsWithAnEntry,
} from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  CHILD,
  between,
  checkAccessibilityBlock,
  checkAccessibilityLine,
  checkLayout,
  checkOwnKinds,
  checkRangeIsHull,
  checkTextAfter,
  checkTokenKinds,
  checkTrimmedValue,
  childOf,
  entriesOf,
  isBlank,
  ownOf,
  presentChildren,
  readingOf,
  textOf,
} from "./statement-checks.ts"
import type { Own, Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

/** ast/c4.md: all significant call families. */
const CALL_TYPES: readonly string[] = [
  "C4ElementStatement",
  "C4BoundaryStatement",
  "C4RelationshipStatement",
  "C4UpdateStatement",
]
/** ast/c4.md: the alternatives of C4Statement. */
const STATEMENTS: readonly string[] = [
  ...CALL_TYPES,
  "C4TitleStatement",
  "C4AccDescriptionStatement",
  "C4AccTitleStatement",
  "C4AccDescrStatement",
  "C4AccDescrBlockStatement",
]
/** ast/c4.md: the alternatives of C4Argument, with null handled by the field shape. */
const ARGUMENTS: readonly string[] = [
  "C4Literal",
  "StringLiteral",
  "C4NamedAttribute",
]

/** ast/c4.md: the Type column of each child field, in visit order. */
export const C4_CHILD_TYPES: FieldTable<readonly string[]> = {
  C4Diagram: { beforeBody: ["C4AccDescrBlockStatement"], body: STATEMENTS },
  C4ElementStatement: { arguments: ARGUMENTS },
  C4BoundaryStatement: {
    arguments: ARGUMENTS,
    beforeBody: ["C4AccDescrBlockStatement"],
    body: STATEMENTS,
  },
  C4RelationshipStatement: { arguments: ARGUMENTS },
  C4UpdateStatement: { arguments: ARGUMENTS },
  C4NamedAttribute: { key: ["C4Literal"], value: ["StringLiteral"] },
  C4TitleStatement: { value: ["C4Literal"] },
  C4AccDescriptionStatement: { value: ["C4Literal"] },
  C4AccTitleStatement: { value: ["C4Literal"] },
  C4AccDescrStatement: { value: ["C4Literal"] },
  C4AccDescrBlockStatement: { value: ["C4Literal"] },
}

/** ast/c4.md: exact keyword families and diagram kinds. */
export const C4_FIELD_WORDS: FieldTable<readonly string[]> = {
  C4Diagram: {
    kind: ["context", "container", "component", "dynamic", "deployment"],
  },
  C4ElementStatement: {
    keyword: [
      "Person",
      "Person_Ext",
      "System",
      "SystemDb",
      "SystemQueue",
      "System_Ext",
      "SystemDb_Ext",
      "SystemQueue_Ext",
      "Container",
      "ContainerDb",
      "ContainerQueue",
      "Container_Ext",
      "ContainerDb_Ext",
      "ContainerQueue_Ext",
      "Component",
      "ComponentDb",
      "ComponentQueue",
      "Component_Ext",
      "ComponentDb_Ext",
      "ComponentQueue_Ext",
    ],
  },
  C4BoundaryStatement: {
    keyword: [
      "Boundary",
      "Enterprise_Boundary",
      "System_Boundary",
      "Container_Boundary",
      "Deployment_Node",
      "Node",
      "Node_L",
      "Node_R",
    ],
  },
  C4RelationshipStatement: {
    keyword: [
      "Rel",
      "BiRel",
      "Rel_U",
      "Rel_Up",
      "Rel_D",
      "Rel_Down",
      "Rel_L",
      "Rel_Left",
      "Rel_R",
      "Rel_Right",
      "Rel_Back",
      "RelIndex",
    ],
  },
  C4UpdateStatement: {
    keyword: ["UpdateElementStyle", "UpdateRelStyle", "UpdateLayoutConfig"],
  },
}

/** parser/docs/tokens/c4.md: fixed punctuation, including the two empty-entry units. */
export const C4_PUNCTUATORS: readonly string[] = [
  "(",
  "(,",
  ")",
  ",",
  ",,",
  "$",
  "=",
  "{",
  "}",
  ":",
]

/** The opening empty-entry unit includes its ASCII spaces in one token. */
export function c4PunctuatorText(text: string): string {
  return text.startsWith("(") &&
    text.endsWith(",") &&
    [...text.slice(1, -1)].every((character) => character === " ")
    ? "(,"
    : text
}

/** ast/c4.md: every call has an argument entry, even where that entry is null. */
const NONEMPTY_LISTS: Readonly<Record<string, readonly string[]>> = {
  C4ElementStatement: ["arguments"],
  C4BoundaryStatement: ["arguments", "body"],
  C4RelationshipStatement: ["arguments"],
  C4UpdateStatement: ["arguments"],
  C4Diagram: ["body"],
}

/** Whitespace between statements, with diagram comments left out as well as common trivia. */
function statementGap(reading: Reading, from: number, to: number): string {
  return reading.written.of(
    [from, to],
    reading.root.comments.map((comment) => comment.range),
  )
}

/** Whether a statement has a grammar production, rather than being an empty block. */
function significant(node: CheckedNode | null): node is CheckedNode {
  return (
    node !== null &&
    !(
      node.type === "C4AccDescrBlockStatement" &&
      childOf(node, "value") === null
    )
  )
}

/** Header and statement sequences: call statements need a newline before a following significant statement. */
function checkBody(reading: Reading, node: CheckedNode, own: Own): void {
  const body = entriesOf(node, "body")
  const significantBody = body.filter(significant)
  const boundary = node.type === "C4BoundaryStatement"
  reading.problems.expect(
    significantBody.length > 0 &&
      (!boundary || CALL_TYPES.includes(significantBody[0]?.type ?? "")),
    label(node),
    boundary
      ? "the boundary body does not begin with a diagram statement"
      : "the body has no significant statement",
  )
  const before = entriesOf(node, "beforeBody")
  for (const block of before) {
    if (block === null) continue
    reading.problems.expect(
      childOf(block, "value") === null,
      label(node),
      "beforeBody holds a nonempty description block",
    )
  }
  const header = own.tokens[0]
  const open = own.tokens.find((token) => token.value === "{")
  const close = own.tokens.at(-1)
  if (!boundary && header !== undefined) {
    let end = header.range[1]
    for (const block of before) {
      if (block === null) continue
      const gap = statementGap(reading, end, block.range[0])
      reading.problems.expect(
        !gap.includes("\n") && !gap.includes("\r"),
        label(node),
        "beforeBody follows the header newline",
      )
      end = block.range[1]
    }
  }
  const start = boundary ? open : header
  if (start === undefined) return
  let previous = boundary
    ? start.range[1]
    : (before.at(-1)?.range[1] ?? start.range[1])
  let precedingCall = !boundary
  let hasPrevious = false
  let separation = ""
  let newlineUnits = 0
  for (const statement of body) {
    if (statement === null) continue
    const gap = statementGap(reading, previous, statement.range[0])
    reading.problems.expect(
      isBlank(gap),
      label(node),
      "the statement gap is not whitespace",
    )
    separation += gap
    if (gap.includes("\n") || gap.includes("\r")) newlineUnits++
    if (significant(statement)) {
      const sincePrevious = separation
      reading.problems.expect(
        !(
          precedingCall ||
          (hasPrevious && !CALL_TYPES.includes(statement.type))
        ) ||
          sincePrevious.includes("\n") ||
          sincePrevious.includes("\r"),
        label(node),
        "a required newline before a statement is missing",
      )
      reading.problems.expect(
        newlineUnits <= 1,
        label(node),
        "empty description blocks split the gap into extra newline units",
      )
      separation = ""
      newlineUnits = 0
      precedingCall = CALL_TYPES.includes(statement.type)
      hasPrevious = true
    }
    previous = statement.range[1]
  }
  // A next-line brace permits an inline first child; a same-line brace does not.
  if (boundary && open !== undefined) {
    const callClose = own.tokens.find((token) => token.value === ")")
    const first = significantBody[0]
    if (callClose !== undefined && first !== undefined) {
      const excluded = [
        ...reading.root.comments,
        ...before.filter((entry) => entry !== null),
        ...body.filter((entry) => entry !== null && !significant(entry)),
      ].map((entry) => entry.range)
      const beforeBrace = reading.written.of(
        [callClose.range[1], open.range[0]],
        excluded,
      )
      const afterBrace = reading.written.of(
        [open.range[1], first.range[0]],
        excluded,
      )
      reading.problems.expect(
        [beforeBrace, afterBrace].some(
          (gap) => gap.includes("\n") || gap.includes("\r"),
        ),
        label(node),
        "the boundary has no newline before or after its opening brace",
      )
    }
  }
  if (!boundary && header !== undefined && significantBody[0] !== undefined) {
    const first = significantBody[0]
    const from = before.at(-1)?.range[1] ?? header.range[1]
    const gap = statementGap(reading, from, first.range[0])
    reading.problems.expect(
      gap.includes("\n") || gap.includes("\r"),
      label(node),
      "the header has no required newline",
    )
  }
  const last = body.at(-1)
  const end = boundary
    ? (close?.range[0] ?? node.range[1])
    : reading.text.length
  const tail = statementGap(reading, last?.range[1] ?? start.range[1], end)
  if (tail.includes("\n") || tail.includes("\r")) newlineUnits++
  reading.problems.expect(
    newlineUnits <= 1,
    label(node),
    "empty description blocks leave extra trailing newline units",
  )
  reading.problems.expect(
    isBlank(tail),
    label(node),
    "the body has trailing text outside its statements",
  )
}

/** Calls: exact keyword, adjacent opening parenthesis, argument nodes and comma units, and a closing parenthesis. */
function checkCall(reading: Reading, node: CheckedNode, own: Own): void {
  const boundary = node.type === "C4BoundaryStatement"
  const keyword = own.tokens[0]
  const open = own.tokens[1]
  const closeIndex = own.tokens.findIndex((token) => token.value === ")")
  const close = own.tokens[closeIndex]
  const commas = own.tokens.slice(2, closeIndex)
  reading.problems.expect(
    keyword?.value === textOf(node, "keyword") &&
      (open?.value === "(" || c4PunctuatorText(open?.value ?? "") === "(,") &&
      close?.value === ")" &&
      commas.every((token) => token.value === "," || token.value === ",,"),
    label(node),
    "the call does not have its keyword, parentheses and commas",
  )
  if (keyword === undefined || open === undefined || close === undefined) return
  reading.problems.expect(
    between(reading, keyword.range[1], open.range[0]) === "",
    label(node),
    "the call keyword does not touch its opening parenthesis",
  )
  const args = entriesOf(node, "arguments")
  const parts = [
    ...commas.map((token) => ({
      range: token.range,
      child: null,
      text: token.value,
    })),
    ...args
      .filter((argument) => argument !== null)
      .map((child) => ({ range: child.range, child, text: CHILD })),
  ].sort((a, b) => a.range[0] - b.range[0])
  const read: (CheckedNode | null)[] =
    c4PunctuatorText(open.value) === "(," ? [null] : []
  let previous = open.range[1]
  for (let index = 0; index < parts.length; index++) {
    const part = parts[index]
    if (part === undefined) continue
    const gap = between(reading, previous, part.range[0])
    reading.problems.expect(
      isBlank(gap),
      label(node),
      "the argument gap is not whitespace",
    )
    if (part.child !== null) {
      read.push(part.child)
      const asciiSpaces = [...gap].every((character) => character === " ")
      if (part.child.type === "C4Literal") {
        reading.problems.expect(
          parts[index + 1]?.child === null,
          label(node),
          "a bare argument ends before its comma",
        )
        const value = withAttributeQuotesRead(textOf(part.child))
        reading.problems.expect(
          !asciiSpaces || (!value.startsWith('"') && !value.startsWith("$")),
          label(node),
          "the bare argument starts a quoted or named unit",
        )
      } else {
        reading.problems.expect(
          asciiSpaces,
          label(node),
          "a string or named argument has non-ASCII whitespace before it",
        )
      }
    } else {
      if (gap !== "" && parts[index - 1]?.child?.type !== "C4Literal")
        read.push(null)
      if (part.text === ",,") read.push(null)
      reading.problems.expect(
        !(
          index === 0 &&
          open.value === "(" &&
          [...gap].every((character) => character === " ")
        ),
        label(node),
        "the opening empty-entry form is not one Punctuator token",
      )
      const next = parts[index + 1]
      reading.problems.expect(
        !(
          part.text === "," &&
          next?.text.startsWith(",") &&
          between(reading, part.range[1], next.range[0]) === ""
        ),
        label(node),
        "the doubled comma is not one Punctuator token",
      )
    }
    previous = part.range[1]
  }
  reading.problems.expectEqual(
    read,
    args,
    label(node),
    "the argument entries, including comma and whitespace holes",
  )
  reading.problems.expect(
    between(reading, previous, close.range[0]) === "",
    label(node),
    "the closing parenthesis is preceded by an unrecorded bare argument",
  )
  const expected = [
    textOf(node, "keyword"),
    open.value,
    ...parts.map((part) => part.text),
    ")",
  ]
  if (boundary)
    expected.push(
      ...entriesOf(node, "beforeBody").map(() => CHILD),
      "{",
      ...entriesOf(node, "body").map(() => CHILD),
      "}",
    )
  checkLayout(reading, node, own, expected, (token) => token.value)
}

/** ast/c4.md: nonempty written literals; only title and accDescription preserve exterior whitespace. */
function checkLiteral(
  reading: Reading,
  node: CheckedNode,
  parent: CheckedNode | null,
): void {
  checkTokenKinds(reading, node, ["RawText"], "a C4Literal")
  reading.problems.expect(
    textOf(node) !== "",
    label(node),
    "the C4Literal is empty",
  )
  if (
    parent?.type !== "C4TitleStatement" &&
    parent?.type !== "C4AccDescriptionStatement"
  )
    checkTrimmedValue(reading, node, node, "the C4Literal")
  if (parent?.type === "C4NamedAttribute")
    reading.problems.expect(
      !withAttributeQuotesRead(textOf(node)).includes("="),
      label(node),
      "the named key holds its equals delimiter",
    )
  if (CALL_TYPES.includes(parent?.type ?? ""))
    reading.problems.expect(
      !textOf(node).includes(","),
      label(node),
      "the bare argument holds its comma delimiter",
    )
}

/** ast/c4.md, diagrams/c4.md and parser/docs/tokens/c4.md: the first-stage C4 checks. */
export function checkC4Tree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  const converted = new ConvertedText(readConvertedCharacters(text, root))
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node, parent) => {
    checkChildTypes(reading, node, C4_CHILD_TYPES)
    checkFieldWords(reading, node, C4_FIELD_WORDS)
    checkListsWithAnEntry(reading, node, NONEMPTY_LISTS)
    if (node.type === "StringLiteral") {
      problems.expect(
        node.closed === true,
        label(node),
        "the string is not closed",
      )
      const written = withAttributeQuotesRead(between(reading, ...node.range))
      problems.expect(
        written.startsWith('"') &&
          written.endsWith('"') &&
          !withAttributeQuotesRead(textOf(node)).includes('"'),
        label(node),
        "the string is not a double-quoted C4 argument",
      )
      if (parent?.type === "C4NamedAttribute")
        problems.expect(
          textOf(node) !== "",
          label(node),
          "the named value is empty",
        )
      return
    }
    if (!node.type.startsWith("C4")) return
    if (node.type === "C4Literal") {
      checkRangeIsHull(reading, node, ownOf(root, node))
      checkLiteral(reading, node, parent)
      return
    }
    // diagrams/c4.md, Direction rejection: only a top-level position starts
    // this lookahead; multiline argument and accessibility interiors do not.
    if (node.type === "C4Diagram" || STATEMENTS.includes(node.type)) {
      problems.expect(
        !/^[^\n\u2028\u2029]*direction\s+(?:TB|BT|RL|LR)/u.test(
          converted.of([node.range[0], text.length]),
        ),
        label(node),
        "the top-level line matches the direction rejection",
      )
    }
    const own = ownOf(root, node)
    checkRangeIsHull(reading, node, own)
    checkOwnKinds(reading, node, own, [
      ...C4_PUNCTUATORS,
      ...own.tokens
        .filter((token) =>
          C4_PUNCTUATORS.includes(c4PunctuatorText(token.value)),
        )
        .map((token) => token.value),
    ])
    if (CALL_TYPES.includes(node.type)) checkCall(reading, node, own)
    if (node.type === "C4Diagram" || node.type === "C4BoundaryStatement") {
      if (node.type === "C4Diagram") {
        const kind = textOf(node, "kind")
        checkLayout(
          reading,
          node,
          own,
          [
            `C4${kind.charAt(0).toUpperCase()}${kind.slice(1)}`,
            ...entriesOf(node, "beforeBody").map(() => CHILD),
            ...entriesOf(node, "body").map(() => CHILD),
          ],
          (token) => token.value,
        )
      }
      checkBody(reading, node, own)
    } else if (node.type === "C4NamedAttribute") {
      checkLayout(
        reading,
        node,
        own,
        ["$", ...presentChildren(node, "key"), "=", CHILD],
        (token) => token.value,
      )
      const key = childOf(node, "key")
      const dollar = own.tokens[0]
      const equals = own.tokens.at(-1)
      const value = childOf(node, "value")
      if (key === null && dollar !== undefined && equals !== undefined)
        problems.expect(
          isBlank(between(reading, dollar.range[1], equals.range[0])),
          label(node),
          "the null key has non-whitespace written text",
        )
      if (equals !== undefined && value !== null)
        problems.expect(
          [...between(reading, equals.range[1], value.range[0])].every(
            (character) => character === " ",
          ),
          label(node),
          "the named value has a separator other than ASCII spaces",
        )
    } else if (
      node.type === "C4TitleStatement" ||
      node.type === "C4AccDescriptionStatement"
    ) {
      checkLayout(
        reading,
        node,
        own,
        [node.type === "C4TitleStatement" ? "title" : "accDescription", CHILD],
        (token) => token.value,
      )
      checkTextAfter(reading, node, own, {
        field: "value",
        endsBefore: ["#", ";"],
      })
      problems.expect(
        !["#", ";", "\n", "\r"].some((character) =>
          converted
            .of(childOf(node, "value")?.range ?? node.range)
            .includes(character),
        ),
        label(node),
        "the line value holds a character that ends its unit",
      )
    } else if (node.type === "C4AccDescrBlockStatement") {
      checkLayout(
        reading,
        node,
        own,
        ["accDescr", "{", ...presentChildren(node, "value"), "}"],
        (token) => token.value,
      )
      checkAccessibilityBlock(reading, node, own)
      problems.expect(
        !textOf(childOf(node, "value")).includes("}"),
        label(node),
        "the description value holds its closing brace",
      )
    } else if (
      node.type === "C4AccTitleStatement" ||
      node.type === "C4AccDescrStatement"
    ) {
      checkLayout(
        reading,
        node,
        own,
        [
          node.type === "C4AccTitleStatement" ? "accTitle" : "accDescr",
          ":",
          ...presentChildren(node, "value"),
        ],
        (token) => token.value,
      )
      checkAccessibilityLine(reading, node, own)
      const colon = own.tokens.find((token) => token.value === ":")
      if (childOf(node, "value") === null && colon !== undefined) {
        const end = text.indexOf("\n", colon.range[1])
        problems.expect(
          isBlank(
            between(reading, colon.range[1], end < 0 ? text.length : end),
          ),
          label(node),
          "the null accessibility value has non-whitespace written text",
        )
      }
    }
  })
}
