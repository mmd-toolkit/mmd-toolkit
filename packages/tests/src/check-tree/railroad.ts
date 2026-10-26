import {
  isDigit,
  isWhitespace,
  isWordCharacter,
} from "../db-from-tree/characters.ts"
import {
  afterHorizontal,
  boundary,
  checkCommon,
  checkGap,
  checkHiddenGap,
  checkIgnored,
  checkPreheader,
  checkRawUnit,
  checkStatementNode,
  directiveEnd,
  following,
  yamlEnd,
} from "./common-statement-checks.ts"
import { checkChildTypes, checkFieldWords } from "./field-rules.ts"
import type { FieldTable } from "./field-rules.ts"
import { label } from "./problems.ts"
import type { Problems } from "./problems.ts"
import {
  childOf,
  entriesOf,
  ownOf,
  readingOf,
  checkRangeIsHull,
  checkTokenKinds,
} from "./statement-checks.ts"
import type { Reading } from "./statement-checks.ts"
import { checkTokensInValueNodes } from "./tokens.ts"
import type { CheckedNode, CheckedRoot } from "./types.ts"
import { walkNodes } from "./walk.ts"

const HIDDEN = ["RailroadIgnoredText"]
const COMMON = [
  "RailroadTitleStatement",
  "RailroadAccTitleStatement",
  "RailroadAccDescrStatement",
  "RailroadAccDescrBlockStatement",
]
const CALLS = [
  "RailroadSequenceCall",
  "RailroadChoiceCall",
  "RailroadOptionalCall",
  "RailroadOneOrMoreCall",
  "RailroadZeroOrMoreCall",
  "RailroadTerminalCall",
  "RailroadNonterminalCall",
  "RailroadSpecialCall",
]
const NATURAL = [
  "Identifier",
  "StringLiteral",
  "RailroadChoiceExpression",
  "RailroadSequenceExpression",
  "RailroadGroupExpression",
  "RailroadOptionalGroupExpression",
  "RailroadRepetitionGroupExpression",
  "RailroadPostfixExpression",
  "RailroadExceptionExpression",
  "RailroadSpecialSequence",
  "RailroadRepeatExpression",
  "RailroadNumericValue",
  "RailroadPredicateExpression",
  "RailroadAnyExpression",
]
const EXPRESSIONS = [...CALLS, ...NATURAL]
const CONSTRUCTORS = [
  "nonterminal",
  "zeroOrMore",
  "oneOrMore",
  "sequence",
  "optional",
  "terminal",
  "special",
  "choice",
]
const HEADERS: Readonly<Record<string, string>> = {
  railroad: "railroad-beta",
  railroadEbnf: "railroad-ebnf-beta",
  railroadAbnf: "railroad-abnf-beta",
  railroadPeg: "railroad-peg-beta",
}

/** The union of authored punctuation; position and dialect checks narrow each occurrence. */
export const RAILROAD_PUNCTUATORS: readonly string[] = [
  "=",
  "::=",
  "<-",
  ";",
  "(",
  ")",
  ",",
  "|",
  "/",
  "[",
  "]",
  "{",
  "}",
  "?",
  "*",
  "+",
  "-",
  "&",
  "!",
  ".",
  ":",
]

/** ast/railroad.md: every child field in its declared visitor order. */
export const RAILROAD_CHILD_TYPES: FieldTable<readonly string[]> = {
  RailroadDiagram: {
    textBeforeHeader: HIDDEN,
    body: ["RailroadRule", ...COMMON, ...HIDDEN],
  },
  RailroadRule: {
    name: ["Identifier"],
    textBeforeOperator: HIDDEN,
    textBeforeDefinition: HIDDEN,
    definition: EXPRESSIONS,
    textBeforeTerminator: HIDDEN,
  },
  RailroadTitleStatement: { value: ["RailroadLiteral"] },
  RailroadAccTitleStatement: { value: ["RailroadLiteral"] },
  RailroadAccDescrStatement: { value: ["RailroadLiteral"] },
  RailroadAccDescrBlockStatement: { value: ["RailroadLiteral"] },
  RailroadExpressionMember: {
    textBefore: HIDDEN,
    expression: EXPRESSIONS,
    textAfter: HIDDEN,
  },
  RailroadSequenceCall: {
    textBeforeOpen: HIDDEN,
    arguments: ["RailroadExpressionMember"],
  },
  RailroadChoiceCall: {
    textBeforeOpen: HIDDEN,
    arguments: ["RailroadExpressionMember"],
  },
  RailroadOptionalCall: {
    textBeforeOpen: HIDDEN,
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
    textBeforeClose: HIDDEN,
  },
  RailroadOneOrMoreCall: {
    textBeforeOpen: HIDDEN,
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
    textBeforeClose: HIDDEN,
  },
  RailroadZeroOrMoreCall: {
    textBeforeOpen: HIDDEN,
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
    textBeforeClose: HIDDEN,
  },
  RailroadTerminalCall: {
    textBeforeOpen: HIDDEN,
    textBeforeValue: HIDDEN,
    value: ["StringLiteral"],
    textBeforeClose: HIDDEN,
  },
  RailroadNonterminalCall: {
    textBeforeOpen: HIDDEN,
    textBeforeName: HIDDEN,
    name: ["StringLiteral"],
    textBeforeClose: HIDDEN,
  },
  RailroadSpecialCall: {
    textBeforeOpen: HIDDEN,
    textBeforeText: HIDDEN,
    text: ["StringLiteral"],
    textBeforeClose: HIDDEN,
  },
  RailroadChoiceExpression: { alternatives: ["RailroadExpressionMember"] },
  RailroadSequenceExpression: { elements: ["RailroadExpressionMember"] },
  RailroadGroupExpression: {
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
    textBeforeClose: HIDDEN,
  },
  RailroadOptionalGroupExpression: {
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
    textBeforeClose: HIDDEN,
  },
  RailroadRepetitionGroupExpression: {
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
    textBeforeClose: HIDDEN,
  },
  RailroadPostfixExpression: {
    element: EXPRESSIONS,
    textBeforeOperator: HIDDEN,
  },
  RailroadExceptionExpression: {
    left: EXPRESSIONS,
    textBeforeOperator: HIDDEN,
    textBeforeRight: HIDDEN,
    right: EXPRESSIONS,
  },
  RailroadRepeatExpression: {
    repeat: ["NumericLiteral", "RailroadRepeatRange"],
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
  },
  RailroadRepeatRange: {
    minimum: ["NumericLiteral"],
    maximum: ["NumericLiteral"],
  },
  RailroadPredicateExpression: {
    textBeforeElement: HIDDEN,
    element: EXPRESSIONS,
  },
}

/** Fixed authored words are independent of the comparison Db's expression types. */
export const RAILROAD_FIELD_WORDS: FieldTable<readonly string[]> = {
  RailroadIgnoredText: { kind: ["yaml-block", "directive"] },
  RailroadPostfixExpression: { operator: ["?", "*", "+"] },
  RailroadPredicateExpression: { operator: ["&", "!"] },
}

/** The selected dialect has no independent flag on RailroadDiagram. */
function dialectOf(reading: Reading): string {
  return reading.root.diagramType
}

/** An ASCII letter begins every natural name; only ABNF excludes underscore. */
function letter(code: number): boolean {
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
}

/** A complete maximal authored name, before the earlier metadata/keyword priorities. */
function nameEnd(text: string, dialect: string): number {
  const abnf = dialect === "railroadAbnf"
  if (!letter(text.charCodeAt(0)) && (abnf || !text.startsWith("_"))) return 0
  let at = 1
  while (
    abnf
      ? letter(text.charCodeAt(at)) ||
        isDigit(text.charCodeAt(at)) ||
        text.charAt(at) === "-"
      : isWordCharacter(text.charCodeAt(at)) || text.charAt(at) === "-"
  )
    at++
  return at
}

/** Decimal counts keep all leading zeroes and stop at the first nondigit. */
function countEnd(text: string): number {
  let at = 0
  while (isDigit(text.charCodeAt(at))) at++
  return at
}

/** A quoted unit closes at the first unescaped matching quote; ABNF has no escapes. */
function stringEnd(text: string, dialect: string): number {
  const quote = text.charAt(0)
  if (quote !== '"' && (dialect === "railroadAbnf" || quote !== "'")) return 0
  for (let at = 1; at < text.length; at++) {
    if (text.charAt(at) === quote) return at + 1
    if (dialect !== "railroadAbnf" && text.charAt(at) === "\\") {
      const escaped = text.charAt(++at)
      if (["", "\n", "\r", "\u2028", "\u2029"].includes(escaped)) return 0
    }
  }
  return 0
}

/** The first question-mark closer wins only for nonwhitespace, semicolon-free content. */
function specialEnd(text: string): number {
  if (!text.startsWith("?")) return 0
  let content = false
  for (let at = 1; at < text.length; at++) {
    if (text.charAt(at) === ";") return 0
    if (text.charAt(at) === "?") return content ? at + 1 : 0
    if (!isWhitespace(text.charCodeAt(at))) content = true
  }
  return 0
}

/** Numeric values preserve base case and hexadecimal runs without validating the base. */
function numericEnd(text: string): number {
  if (
    !text.startsWith("%") ||
    !"xXdDbB".includes(text.charAt(1)) ||
    text.length < 3
  )
    return 0
  let at = 2

  /** Each run must have at least one ASCII hexadecimal digit. */
  function run(): boolean {
    const start = at
    while (
      at < text.length &&
      "0123456789ABCDEFabcdef".includes(text.charAt(at))
    )
      at++
    return at > start
  }

  if (!run()) return 0
  while (text.charAt(at) === "-" || text.charAt(at) === ".") {
    const separator = at++
    if (!run()) return separator
  }
  return at
}

/** Physical LF ends line units; LS/PS remain content after common conversion. */
function lineEnd(text: string, start = 0): number {
  const lf = text.indexOf("\n", start)
  return lf < 0 ? text.length : lf
}

/** The first applicable metadata composite, including title's empty alternative. */
function metadataEnd(text: string): number {
  if (text.startsWith("title")) {
    if (text.charAt(5) !== " " && text.charAt(5) !== "\t") return 5
    const percent = text.indexOf("%%", 6)
    return percent < 0 ? lineEnd(text, 6) : Math.min(percent, lineEnd(text, 6))
  }
  for (const word of ["accTitle", "accDescr"]) {
    if (!text.startsWith(word)) continue
    const colon = afterHorizontal(text, word.length)
    if (text.charAt(colon) === ":") {
      const percent = text.indexOf("%%", colon + 1)
      return percent < 0
        ? lineEnd(text, colon + 1)
        : Math.min(percent, lineEnd(text, colon + 1))
    }
    if (word === "accDescr") {
      let at = word.length
      while (isWhitespace(text.charCodeAt(at))) at++
      const close = text.indexOf("}", at + 1)
      if (text.charAt(at) === "{" && close >= 0) return close + 1
    }
  }
  return 0
}

/** One first-match lexical unit at an authored component or native Comment start. */
interface Unit {
  readonly kind: string
  readonly end: number
  readonly mark?: string
}

/** Native priorities and explicit longer alternatives, never a general longest match. */
function unitAt(text: string, dialect: string): Unit | null {
  const header = HEADERS[dialect] ?? ""
  if (
    header !== "" &&
    text.startsWith(header) &&
    (boundary(text, header.length) || text.startsWith("%%", header.length))
  )
    return { kind: "keyword", end: header.length }
  if (dialect === "railroad") {
    for (const word of CONSTRUCTORS)
      if (text.startsWith(word)) {
        const end = nameEnd(text, dialect)
        return end > word.length
          ? { kind: "identifier", end }
          : { kind: "keyword", end: word.length }
      }
  }
  const punctuation =
    dialect === "railroad"
      ? ["=", ";", "(", ",", ")"]
      : dialect === "railroadEbnf"
        ? [
            "::=",
            "=",
            ";",
            "|",
            ",",
            "(",
            ")",
            "[",
            "]",
            "{",
            "}",
            "?",
            "*",
            "+",
            "-",
          ]
        : dialect === "railroadAbnf"
          ? ["=", ";", "/", "(", ")", "[", "]"]
          : ["<-", ";", "/", "&", "!", "?", "*", "+", "(", ")", "."]
  for (const word of punctuation)
    if (text.startsWith(word)) {
      if (dialect === "railroadEbnf") {
        if (word === "(" && text.startsWith("(*") && text.includes("*)", 2))
          return { kind: "comment", end: text.indexOf("*)", 2) + 2, mark: "(*" }
        if (word === "?" && specialEnd(text) > 1)
          return { kind: "special", end: specialEnd(text) }
        if (word === "-") {
          const end = yamlEnd(text)
          if (end !== undefined) return { kind: "yaml-block", end }
        }
      }
      if (dialect === "railroadAbnf" && word === ";" && lineEnd(text) > 1)
        return { kind: "comment", end: lineEnd(text), mark: ";" }
      return { kind: "punctuator", end: word.length }
    }
  const metadata = metadataEnd(text)
  if (metadata > 0) return { kind: "metadata", end: metadata }
  const name = nameEnd(text, dialect)
  if (name > 0) return { kind: "identifier", end: name }
  const string = stringEnd(text, dialect)
  if (string > 0) return { kind: "string", end: string }
  if (dialect === "railroadAbnf") {
    const numeric = numericEnd(text)
    if (numeric > 0) return { kind: "numeric-value", end: numeric }
    const repeat = countEnd(text)
    if (text.charAt(repeat) === "*")
      return {
        kind: "repeat",
        end: repeat + 1 + countEnd(text.slice(repeat + 1)),
      }
    if (repeat > 0) return { kind: "count", end: repeat }
  }
  const yaml = yamlEnd(text)
  if (yaml !== undefined) return { kind: "yaml-block", end: yaml }
  const directive = directiveEnd(text)
  if (directive !== undefined) return { kind: "directive", end: directive }
  if (text.startsWith("%%"))
    return { kind: "comment", end: lineEnd(text), mark: "%%" }
  if (
    (dialect === "railroad" || dialect === "railroadEbnf") &&
    text.startsWith("/*") &&
    text.includes("*/", 2)
  )
    return { kind: "comment", end: text.indexOf("*/", 2) + 2, mark: "/*" }
  if (dialect === "railroadPeg" && text.startsWith("#"))
    return { kind: "comment", end: lineEnd(text), mark: "#" }
  return null
}

/** Shared leaves retain whole lexical units at their written positions. */
function checkLeaf(reading: Reading, node: CheckedNode): void {
  const value = reading.converted.of(node.range)
  const tail = following(reading, node.range[0])
  const dialect = dialectOf(reading)
  const unit = unitAt(tail, dialect)
  if (node.type === "Identifier" || node.type === "StringLiteral") {
    const kind = node.type === "Identifier" ? "identifier" : "string"
    reading.problems.expect(
      unit?.kind === kind &&
        unit.end === value.length &&
        (kind !== "string" || node.closed === true),
      label(node),
      `the ${kind} is not a complete first-match lexical unit`,
    )
    if (kind === "identifier")
      checkTokenKinds(reading, node, ["Identifier"], "a railroad name")
  } else if (node.type === "NumericLiteral") {
    reading.problems.expect(
      dialect === "railroadAbnf" &&
        value.length > 0 &&
        countEnd(tail) === value.length,
      label(node),
      "the count is not one complete decimal digit run",
    )
    checkTokenKinds(reading, node, ["Numeric"], "an ABNF count")
  } else if (
    node.type === "RailroadNumericValue" ||
    node.type === "RailroadSpecialSequence"
  ) {
    const special = node.type === "RailroadSpecialSequence"
    reading.problems.expect(
      unit?.kind === (special ? "special" : "numeric-value") &&
        unit.end === value.length,
      label(node),
      "the value is not one complete first-match text unit",
    )
    checkRangeIsHull(reading, node, ownOf(reading.root, node))
    checkRawUnit(reading, node)
    checkTokenKinds(reading, node, ["RawText"], "a railroad text unit")
    if (special)
      reading.problems.expectEqual(
        node.value,
        reading.written.of(node.range).slice(1, -1),
        label(node),
        "value is not its written special-sequence interior",
      )
  }
}

/** Allowed authored expression roles, without any semantic acceptance checks. */
function primaryTypes(dialect: string): string[] {
  if (dialect === "railroad") return CALLS
  const base = ["Identifier", "StringLiteral", "RailroadGroupExpression"]
  return dialect === "railroadEbnf"
    ? [
        ...base,
        "RailroadOptionalGroupExpression",
        "RailroadRepetitionGroupExpression",
        "RailroadSpecialSequence",
      ]
    : dialect === "railroadAbnf"
      ? [...base, "RailroadOptionalGroupExpression", "RailroadNumericValue"]
      : [...base, "RailroadAnyExpression"]
}

/** A complete term can add only its dialect's authored operators around a primary. */
function termTypes(dialect: string): string[] {
  const base = primaryTypes(dialect)
  return dialect === "railroadEbnf"
    ? [...base, "RailroadPostfixExpression", "RailroadExceptionExpression"]
    : dialect === "railroadAbnf"
      ? [...base, "RailroadRepeatExpression"]
      : dialect === "railroadPeg"
        ? [...base, "RailroadPostfixExpression", "RailroadPredicateExpression"]
        : base
}

/** Only natural notation introduces implicit sequence and choice wrappers. */
function expressionTypes(dialect: string): string[] {
  return dialect === "railroad"
    ? CALLS
    : [
        ...termTypes(dialect),
        "RailroadSequenceExpression",
        "RailroadChoiceExpression",
      ]
}

/** A child remains in the grammar role that its authored parent declares. */
function role(
  reading: Reading,
  parent: CheckedNode,
  field: string,
  allowed: readonly string[],
): void {
  const child = childOf(parent, field)
  if (child !== null)
    reading.problems.expect(
      allowed.includes(child.type),
      label(parent),
      `the field ${field} is not an authored ${dialectOf(reading)} expression in this position`,
    )
}

/** Walk explicit components and their named gaps; all native gaps allow physical newlines. */
function components(reading: Reading, node: CheckedNode) {
  const tokens = ownOf(reading.root, node).tokens
  let index = 0
  let end = node.range[0]

  /** Check the next authored boundary using only its declared hidden owner. */
  function before(to: number, field?: string, tight = false): void {
    if (field !== undefined) checkHiddenGap(reading, node, field, end, to, true)
    else {
      const spacing = checkGap(reading, node, end, to, true)
      if (tight)
        reading.problems.expect(
          spacing === "",
          label(node),
          "native padding or hidden text cannot split repeat components",
        )
    }
  }

  return {
    token(expected: readonly string[], field?: string, part = false): string {
      const token = tokens[index++]
      reading.problems.expect(
        token !== undefined && expected.includes(token.value),
        label(node),
        `the authored component must be ${expected.join(" or ")}`,
      )
      if (token === undefined) return ""
      before(token.range[0], field, part)
      if (!part) {
        const unit = unitAt(
          following(reading, token.range[0]),
          dialectOf(reading),
        )
        reading.problems.expect(
          (unit?.kind === "keyword" || unit?.kind === "punctuator") &&
            unit.end === token.value.length,
          label(token),
          "the component loses to an earlier or longer lexical unit",
        )
      }
      end = token.range[1]
      return token.value
    },
    child(field: string, gapField?: string, tight = false): void {
      const child = childOf(node, field)
      if (child === null) return
      before(child.range[0], gapField, tight)
      end = child.range[1]
    },
    member(member: CheckedNode): void {
      before(member.range[0])
      end = member.range[1]
    },
    empty(field: string): void {
      reading.problems.expect(
        entriesOf(node, field).length === 0,
        label(node),
        `the field ${field} must be empty at this list boundary`,
      )
    },
    finish(): void {
      reading.problems.expect(
        index === tokens.length,
        label(node),
        "unexpected authored components remain",
      )
      before(node.range[1])
    },
  }
}

/** Calls and natural lists retain explicit separators and nearest-member gap ownership. */
function checkList(reading: Reading, node: CheckedNode): void {
  const call = node.type.endsWith("Call")
  const choice =
    node.type === "RailroadChoiceCall" ||
    node.type === "RailroadChoiceExpression"
  const field = call ? "arguments" : choice ? "alternatives" : "elements"
  const members = entriesOf(node, field).filter((member) => member !== null)
  const dialect = dialectOf(reading)
  const parts = components(reading, node)
  reading.problems.expect(
    members.length >= (call ? 1 : 2),
    label(node),
    `the list ${field} needs ${call ? "one" : "two"} or more authored members`,
  )
  if (call) {
    parts.token([choice ? "choice" : "sequence"])
    parts.token(["("], "textBeforeOpen")
  }
  for (const [index, member] of members.entries()) {
    if (!call && index === 0)
      reading.problems.expect(
        entriesOf(member, "textBefore").length === 0,
        label(member),
        "the first natural member's textBefore must be empty",
      )
    if (!call && index === members.length - 1)
      reading.problems.expect(
        entriesOf(member, "textAfter").length === 0,
        label(member),
        "the last natural member's textAfter must be empty",
      )
    if (index > 0) {
      const own = ownOf(reading.root, node).tokens
      const hasComma = own.some(
        (token) =>
          token.value === "," &&
          token.range[0] >= (members[index - 1]?.range[1] ?? 0) &&
          token.range[1] <= member.range[0],
      )
      if (call || choice || (dialect === "railroadEbnf" && hasComma))
        parts.token([
          call ? "," : choice ? (dialect === "railroadEbnf" ? "|" : "/") : ",",
        ])
      else {
        const preceding = members[index - 1]
        reading.problems.expect(
          preceding !== undefined &&
            entriesOf(preceding, "textAfter").length === 0,
          label(member),
          "an adjacent member leaves its preceding textAfter empty",
        )
      }
    }
    const allowed = call
      ? CALLS
      : choice
        ? [...termTypes(dialect), "RailroadSequenceExpression"]
        : termTypes(dialect)
    role(reading, member, "expression", allowed)
    parts.member(member)
  }
  if (call) parts.token([")"])
  parts.finish()
}

/** Every non-list expression keeps its authored operator and operand structure. */
function checkExpression(reading: Reading, node: CheckedNode): void {
  const dialect = dialectOf(reading)
  const parts = components(reading, node)
  if (CALLS.includes(node.type)) {
    const word =
      node.type === "RailroadTerminalCall"
        ? "terminal"
        : node.type === "RailroadNonterminalCall"
          ? "nonterminal"
          : node.type === "RailroadSpecialCall"
            ? "special"
            : node.type === "RailroadOptionalCall"
              ? "optional"
              : node.type === "RailroadOneOrMoreCall"
                ? "oneOrMore"
                : "zeroOrMore"
    parts.token([word])
    parts.token(["("], "textBeforeOpen")
    const field =
      node.type === "RailroadTerminalCall"
        ? "value"
        : node.type === "RailroadNonterminalCall"
          ? "name"
          : node.type === "RailroadSpecialCall"
            ? "text"
            : "element"
    parts.child(
      field,
      `textBefore${field.charAt(0).toUpperCase()}${field.slice(1)}`,
    )
    if (field === "element") role(reading, node, field, CALLS)
    parts.token([")"], "textBeforeClose")
  } else if (
    [
      "RailroadGroupExpression",
      "RailroadOptionalGroupExpression",
      "RailroadRepetitionGroupExpression",
    ].includes(node.type)
  ) {
    const open =
      node.type === "RailroadGroupExpression"
        ? "("
        : node.type === "RailroadOptionalGroupExpression"
          ? "["
          : "{"
    parts.token([open])
    parts.child("element", "textBeforeElement")
    parts.token(
      [open === "(" ? ")" : open === "[" ? "]" : "}"],
      "textBeforeClose",
    )
    role(reading, node, "element", expressionTypes(dialect))
  } else if (node.type === "RailroadPostfixExpression") {
    parts.child("element")
    const operator = parts.token(["?", "*", "+"], "textBeforeOperator")
    reading.problems.expectEqual(
      node.operator,
      operator,
      label(node),
      "the written postfix operator",
    )
    role(
      reading,
      node,
      "element",
      dialect === "railroadEbnf" ? termTypes(dialect) : primaryTypes(dialect),
    )
  } else if (node.type === "RailroadExceptionExpression") {
    parts.child("left")
    parts.token(["-"], "textBeforeOperator")
    parts.child("right", "textBeforeRight")
    role(reading, node, "left", termTypes(dialect))
    role(reading, node, "right", primaryTypes(dialect))
  } else if (node.type === "RailroadRepeatExpression") {
    parts.child("repeat")
    parts.child("element", "textBeforeElement")
    role(reading, node, "element", primaryTypes(dialect))
  } else if (node.type === "RailroadRepeatRange") {
    parts.child("minimum", undefined, true)
    parts.token(["*"], undefined, true)
    parts.child("maximum", undefined, true)
  } else if (node.type === "RailroadPredicateExpression") {
    const operator = parts.token(["&", "!"])
    parts.child("element", "textBeforeElement")
    reading.problems.expectEqual(
      node.operator,
      operator,
      label(node),
      "the written predicate operator",
    )
    role(reading, node, "element", [
      ...primaryTypes(dialect),
      "RailroadPostfixExpression",
    ])
  } else if (node.type === "RailroadAnyExpression") parts.token(["."])
  parts.finish()
}

/** A native Comment cannot replace an earlier unit or an enclosing authored value. */
function checkComments(reading: Reading, headerEnd: number): void {
  const enclosing: CheckedNode[] = []
  walkNodes(reading.root, (node) => {
    if (
      node.type === "StringLiteral" ||
      node.type === "RailroadSpecialSequence" ||
      node.type === "RailroadIgnoredText" ||
      COMMON.includes(node.type)
    )
      enclosing.push(node)
  })
  for (const comment of reading.root.comments) {
    const at = comment.range[0]
    if (reading.written.isLeftOut(at)) continue
    reading.problems.expect(
      !enclosing.some((node) => node.range[0] <= at && at < node.range[1]),
      label(comment),
      "a native Comment cannot start inside an earlier enclosing value or hidden form",
    )
    if (at < headerEnd) {
      reading.problems.expect(
        comment.mark === "%%",
        label(comment),
        "a detection-passed bare line has mark %%",
      )
      continue
    }
    if (comment.mark === null) {
      const anchor = reading.root.comments.findLast((candidate) => {
        if (
          candidate.mark === null ||
          candidate.range[0] < headerEnd ||
          candidate.range[1] > at ||
          reading.written.isLeftOut(candidate.range[0])
        )
          return false
        const start = unitAt(
          following(reading, candidate.range[0]),
          dialectOf(reading),
        )
        return (
          start?.kind === "comment" &&
          reading.converted.of([candidate.range[0], comment.range[1]]).length <=
            start.end
        )
      })
      reading.problems.expect(
        anchor !== undefined,
        label(comment),
        "an unmarked fragment must belong to an earlier native Comment lexical unit",
      )
      continue
    }
    const unit = unitAt(following(reading, at), dialectOf(reading))
    reading.problems.expect(
      unit?.kind === "comment" && unit.mark === comment.mark,
      label(comment),
      "an earlier terminal wins or this dialect has no such native Comment",
    )
    let end = comment.range[1]
    if (unit?.kind === "comment")
      for (const continuation of reading.root.comments) {
        if (
          continuation.mark !== null ||
          continuation.range[0] < end ||
          reading.written.isLeftOut(continuation.range[0])
        )
          continue
        if (
          reading.converted.of([at, continuation.range[0]]).length >= unit.end
        )
          break
        reading.problems.expect(
          [...reading.converted.of([end, continuation.range[0]])].every(
            (character) => isWhitespace(character.charCodeAt(0)),
          ),
          label(comment),
          "only common cuts and their whitespace separate native Comment fragments",
        )
        end = continuation.range[1]
      }
    const value = reading.converted.of([at, end])
    reading.problems.expect(
      unit?.end === value.length,
      label(comment),
      "the native Comment must end at its first lexical closer or physical line end",
    )
  }
}

/** Detection-retained prefixes and the flat body do not impose a visible-EOL production. */
function checkDiagram(reading: Reading, node: CheckedNode): void {
  const tokens = ownOf(reading.root, node).tokens
  const header = tokens[0]
  reading.problems.expect(
    tokens.length === 1 && header?.value === HEADERS[dialectOf(reading)],
    label(node),
    "the diagram owns exactly its dialect's complete lowercase header",
  )
  if (header === undefined) return
  const tail = following(reading, header.range[1])
  reading.problems.expect(
    boundary(tail, 0) || tail.startsWith("%%"),
    label(header),
    "the header requires Notation whitespace, a percent pair or EOF",
  )
  checkPreheader(reading, node)
  checkHiddenGap(
    reading,
    node,
    "textBeforeHeader",
    reading.root.frontmatter?.range[1] ?? 0,
    header.range[0],
    true,
    true,
  )
  let end = header.range[1]
  let previous: CheckedNode | null = null
  let ruleSeen = false
  for (const item of entriesOf(node, "body")) {
    if (item === null) continue
    checkGap(reading, node, end, item.range[0], true, previous)
    if (COMMON.includes(item.type))
      reading.problems.expect(
        !ruleSeen,
        label(item),
        "metadata belongs before the first rule",
      )
    if (item.type === "RailroadRule") ruleSeen = true
    end = item.range[1]
    previous = item
  }
  checkGap(reading, node, end, reading.text.length, true, previous)
  checkComments(reading, header.range[1])
}

/** Tree conditions only; parser acceptance is checked against fixture result records. */
export function checkRailroadTree(
  text: string,
  root: CheckedRoot,
  problems: Problems,
): void {
  const reading = readingOf(text, root, problems)
  const dialect = dialectOf(reading)
  checkTokensInValueNodes(root, problems)
  walkNodes(root, (node) => {
    checkChildTypes(reading, node, RAILROAD_CHILD_TYPES)
    checkFieldWords(reading, node, RAILROAD_FIELD_WORDS)
    checkLeaf(reading, node)
    if (!node.type.startsWith("Railroad")) return
    if (
      node.type === "RailroadNumericValue" ||
      node.type === "RailroadSpecialSequence"
    )
      return
    checkStatementNode(reading, node, RAILROAD_PUNCTUATORS)
    if (EXPRESSIONS.includes(node.type))
      reading.problems.expect(
        expressionTypes(dialect).includes(node.type),
        label(node),
        "the authored expression node does not belong to this dialect",
      )
    if (node.type === "RailroadRepeatRange")
      reading.problems.expect(
        dialect === "railroadAbnf",
        label(node),
        "repeat ranges belong only to ABNF",
      )
    if (node.type === "RailroadLiteral") return
    if (node.type === "RailroadDiagram") checkDiagram(reading, node)
    else if (COMMON.includes(node.type)) checkCommon(reading, node)
    else if (node.type === "RailroadIgnoredText") {
      const unit = unitAt(following(reading, node.range[0]), dialect)
      reading.problems.expect(
        unit !== null &&
          unit.kind === node.kind &&
          unit.end === reading.converted.of(node.range).length,
        label(node),
        "the retained form is not the first complete native hidden unit at its opener",
      )
      reading.problems.expect(
        reading.written
          .of(node.range)
          .startsWith(node.kind === "yaml-block" ? "---" : "%%{"),
        label(node),
        "a retained range starts at its authored opener without preceding padding",
      )
      checkIgnored(reading, node)
    } else if (node.type === "RailroadRule") {
      const parts = components(reading, node)
      parts.child("name")
      parts.token(
        dialect === "railroadPeg"
          ? ["<-"]
          : dialect === "railroadEbnf"
            ? ["=", "::="]
            : ["="],
        "textBeforeOperator",
      )
      parts.child("definition", "textBeforeDefinition")
      parts.token([";"], "textBeforeTerminator")
      parts.finish()
      role(reading, node, "definition", expressionTypes(dialect))
    } else if (
      [
        "RailroadSequenceCall",
        "RailroadChoiceCall",
        "RailroadSequenceExpression",
        "RailroadChoiceExpression",
      ].includes(node.type)
    )
      checkList(reading, node)
    else if (node.type === "RailroadExpressionMember") {
      const parts = components(reading, node)
      parts.child("expression", "textBefore")
      const expression = childOf(node, "expression")
      if (expression !== null)
        checkHiddenGap(
          reading,
          node,
          "textAfter",
          expression.range[1],
          node.range[1],
          true,
        )
      reading.problems.expect(
        ownOf(root, node).tokens.length === 0,
        label(node),
        "a member owns no separator or other authored token",
      )
    } else checkExpression(reading, node)
  })
}
