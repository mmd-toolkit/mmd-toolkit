import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildTree } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { hull } from "./statement-tree-built.ts"

/** Explicit dialect headers, independently supplied by each fixed test. */
export type RailroadDialect =
  "railroad" | "railroadEbnf" | "railroadAbnf" | "railroadPeg"

/** Fixed sources and authored components; this helper never discovers syntax. */
export function buildRailroad(
  source: string,
  dialect: RailroadDialect,
  make: (kit: Kit) => CheckedNode[],
): Built {
  const headers = {
    railroad: "railroad-beta",
    railroadEbnf: "railroad-ebnf-beta",
    railroadAbnf: "railroad-abnf-beta",
    railroadPeg: "railroad-peg-beta",
  }
  return buildTree(
    {
      header: headers[dialect],
      diagramType: dialect,
      bodyType: "RailroadDiagram",
      bodyFields: (body) => ({ textBeforeHeader: [], body }),
    },
    source,
    make,
  )
}

/** Named gap callbacks are supplied in authored order by the fixed test. */
export type Gaps = Readonly<Record<string, (() => CheckedNode[]) | undefined>>

/** A complete Identifier occurrence. */
export function identifier(kit: Kit, name: string): CheckedNode {
  return kit.node("Identifier", kit.token("Identifier", name).range, { name })
}

/** A complete quoted spelling, whose written value has not been decoded. */
export function string(kit: Kit, raw: string): CheckedNode {
  return kit.node("StringLiteral", kit.token("String", raw).range, {
    raw,
    value: raw.slice(1, -1),
    closed: true,
  })
}

/** One explicit decimal count, including a non-finite double after conversion. */
export function count(kit: Kit, raw: string): CheckedNode {
  return kit.node("NumericLiteral", kit.token("Numeric", raw).range, {
    raw,
    value: Number(raw),
  })
}

/** An IR call with its argument field and all native gaps explicitly supplied. */
export function call(
  kit: Kit,
  word:
    | "terminal"
    | "nonterminal"
    | "special"
    | "optional"
    | "zeroOrMore"
    | "oneOrMore",
  operand: () => CheckedNode,
  gaps: Gaps = {},
): CheckedNode {
  const keyword = kit.token("Keyword", word)
  const textBeforeOpen = gaps.textBeforeOpen?.() ?? []
  const open = kit.token("Punctuator", "(")
  const field =
    word === "terminal"
      ? "value"
      : word === "nonterminal"
        ? "name"
        : word === "special"
          ? "text"
          : "element"
  const gapField = `textBefore${field.charAt(0).toUpperCase()}${field.slice(1)}`
  const before = gaps[gapField]?.() ?? []
  const child = operand()
  const textBeforeClose = gaps.textBeforeClose?.() ?? []
  const close = kit.token("Punctuator", ")")
  const kind = word.charAt(0).toUpperCase() + word.slice(1)
  return kit.node(
    `Railroad${kind}Call`,
    hull([
      keyword,
      ...textBeforeOpen,
      open,
      ...before,
      child,
      ...textBeforeClose,
      close,
    ]),
    { textBeforeOpen, [gapField]: before, [field]: child, textBeforeClose },
  )
}

/** A list member owns only the before/after forms that the test names. */
export function member(
  kit: Kit,
  make: () => CheckedNode,
  gaps: Gaps = {},
): CheckedNode {
  const textBefore = gaps.textBefore?.() ?? []
  const expression = make()
  const textAfter = gaps.textAfter?.() ?? []
  return kit.node(
    "RailroadExpressionMember",
    hull([...textBefore, expression, ...textAfter]),
    { textBefore, expression, textAfter },
  )
}

/** Call and natural list spellings; every separator is an explicit test argument. */
export function list(
  kit: Kit,
  kind:
    "SequenceCall" | "ChoiceCall" | "SequenceExpression" | "ChoiceExpression",
  make: readonly (() => CheckedNode)[],
  separators: readonly string[],
  gaps: Gaps = {},
): CheckedNode {
  const isCall = kind.endsWith("Call")
  const pieces: { range: readonly [number, number] }[] = []
  if (isCall)
    pieces.push(
      kit.token("Keyword", kind === "SequenceCall" ? "sequence" : "choice"),
    )
  const textBeforeOpen = isCall ? (gaps.textBeforeOpen?.() ?? []) : []
  pieces.push(...textBeforeOpen)
  if (isCall) pieces.push(kit.token("Punctuator", "("))
  const members: CheckedNode[] = []
  for (const [index, build] of make.entries()) {
    if (index > 0) {
      const separator = separators[index - 1]
      if (separator) pieces.push(kit.token("Punctuator", separator))
    }
    const item = build()
    members.push(item)
    pieces.push(item)
  }
  if (isCall) pieces.push(kit.token("Punctuator", ")"))
  const field = isCall
    ? "arguments"
    : kind === "SequenceExpression"
      ? "elements"
      : "alternatives"
  return kit.node(`Railroad${kind}`, hull(pieces), {
    ...(isCall ? { textBeforeOpen } : {}),
    [field]: members,
  })
}

/** A group remains authored even when it surrounds one leaf. */
export function group(
  kit: Kit,
  open: "(" | "[" | "{",
  make: () => CheckedNode,
  gaps: Gaps = {},
): CheckedNode {
  const opening = kit.token("Punctuator", open)
  const textBeforeElement = gaps.textBeforeElement?.() ?? []
  const element = make()
  const textBeforeClose = gaps.textBeforeClose?.() ?? []
  const close = kit.token(
    "Punctuator",
    open === "(" ? ")" : open === "[" ? "]" : "}",
  )
  return kit.node(
    open === "("
      ? "RailroadGroupExpression"
      : open === "["
        ? "RailroadOptionalGroupExpression"
        : "RailroadRepetitionGroupExpression",
    hull([opening, ...textBeforeElement, element, ...textBeforeClose, close]),
    { textBeforeElement, element, textBeforeClose },
  )
}

/** A suffix wraps the complete preceding expression. */
export function postfix(
  kit: Kit,
  make: () => CheckedNode,
  operator: "?" | "*" | "+",
  before: () => CheckedNode[] = () => [],
): CheckedNode {
  const element = make()
  const textBeforeOperator = before()
  const token = kit.token("Punctuator", operator)
  return kit.node(
    "RailroadPostfixExpression",
    hull([element, ...textBeforeOperator, token]),
    { element, textBeforeOperator, operator },
  )
}

/** EBNF exception children retain their written left and right roles. */
export function exception(
  kit: Kit,
  leftOf: () => CheckedNode,
  rightOf: () => CheckedNode,
  gaps: Gaps = {},
): CheckedNode {
  const left = leftOf()
  const textBeforeOperator = gaps.textBeforeOperator?.() ?? []
  const minus = kit.token("Punctuator", "-")
  const textBeforeRight = gaps.textBeforeRight?.() ?? []
  const right = rightOf()
  return kit.node(
    "RailroadExceptionExpression",
    hull([left, ...textBeforeOperator, minus, ...textBeforeRight, right]),
    { left, textBeforeOperator, textBeforeRight, right },
  )
}

/** A special sequence is one RawText item with untrimmed authored interior. */
export function special(kit: Kit, raw: string): CheckedNode {
  return kit.node("RailroadSpecialSequence", kit.token("RawText", raw).range, {
    value: raw.slice(1, -1),
  })
}

/** An ABNF numeric value is one authored text item, without numeric conversion. */
export function numeric(kit: Kit, value: string): CheckedNode {
  return kit.node("RailroadNumericValue", kit.token("RawText", value).range, {
    value,
  })
}

/** Bounds and star are separate components, without any inferred omitted count. */
export function repeatRange(
  kit: Kit,
  min: string | null,
  max: string | null,
): CheckedNode {
  const minimum = min === null ? null : count(kit, min)
  const star = kit.token("Punctuator", "*")
  const maximum = max === null ? null : count(kit, max)
  return kit.node(
    "RailroadRepeatRange",
    hull([
      ...(minimum === null ? [] : [minimum]),
      star,
      ...(maximum === null ? [] : [maximum]),
    ]),
    { minimum, maximum },
  )
}

/** A complete repeat and its primary have an independently named native gap. */
export function repeat(
  kit: Kit,
  countOf: () => CheckedNode,
  elementOf: () => CheckedNode,
  before: () => CheckedNode[] = () => [],
): CheckedNode {
  const countNode = countOf()
  const textBeforeElement = before()
  const element = elementOf()
  return kit.node(
    "RailroadRepeatExpression",
    hull([countNode, ...textBeforeElement, element]),
    { repeat: countNode, textBeforeElement, element },
  )
}

/** A PEG predicate retains its entire authored suffix operand. */
export function predicate(
  kit: Kit,
  operator: "&" | "!",
  make: () => CheckedNode,
  before: () => CheckedNode[] = () => [],
): CheckedNode {
  const token = kit.token("Punctuator", operator)
  const textBeforeElement = before()
  const element = make()
  return kit.node(
    "RailroadPredicateExpression",
    hull([token, ...textBeforeElement, element]),
    { operator, textBeforeElement, element },
  )
}

/** A PEG dot remains a dedicated primary. */
export function any(kit: Kit): CheckedNode {
  return kit.node(
    "RailroadAnyExpression",
    kit.token("Punctuator", ".").range,
    {},
  )
}

/** The rule owns three native gaps and its visible terminator. */
export function rule(
  kit: Kit,
  nameText: string,
  definitionOf: () => CheckedNode,
  operator: "=" | "::=" | "<-" = "=",
  gaps: Gaps = {},
): CheckedNode {
  const name = identifier(kit, nameText)
  const textBeforeOperator = gaps.textBeforeOperator?.() ?? []
  const assignment = kit.token("Punctuator", operator)
  const textBeforeDefinition = gaps.textBeforeDefinition?.() ?? []
  const definition = definitionOf()
  const textBeforeTerminator = gaps.textBeforeTerminator?.() ?? []
  const end = kit.token("Punctuator", ";")
  return kit.node(
    "RailroadRule",
    hull([
      name,
      ...textBeforeOperator,
      assignment,
      ...textBeforeDefinition,
      definition,
      ...textBeforeTerminator,
      end,
    ]),
    {
      name,
      textBeforeOperator,
      textBeforeDefinition,
      definition,
      textBeforeTerminator,
    },
  )
}

/** Railroad metadata has no trailing-hidden field; following forms belong to body. */
export function common(
  kit: Kit,
  kind: "Title" | "AccTitle" | "AccDescr" | "AccDescrBlock",
  value: string | null,
): CheckedNode {
  const block = kind === "AccDescrBlock"
  const word =
    kind === "Title" ? "title" : kind === "AccTitle" ? "accTitle" : "accDescr"
  const parts: { range: readonly [number, number] }[] = [
    kit.token("Keyword", word),
  ]
  if (kind !== "Title") parts.push(kit.token("Punctuator", block ? "{" : ":"))
  const literal =
    value === null
      ? null
      : kit.node("RailroadLiteral", kit.token("RawText", value).range, {
          value,
        })
  if (literal !== null) parts.push(literal)
  if (block) parts.push(kit.token("Punctuator", "}"))
  return kit.node(`Railroad${kind}Statement`, hull(parts), { value: literal })
}

/** The exact retained match; consumed LF is outside its supplied raw text. */
export function ignored(
  kit: Kit,
  raw: string,
  kind: "yaml-block" | "directive" = "directive",
): CheckedNode {
  return kit.node("RailroadIgnoredText", kit.token("RawText", raw).range, {
    kind,
    value: raw,
  })
}
