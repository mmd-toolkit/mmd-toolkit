import type { EmbeddedValues } from "../mermaid.ts"
import { numberOrText } from "../summary-number.ts"
import type { DbSummary, JsonObject } from "../types.ts"
import { ConvertedText, readConvertedCharacters } from "./converted-text.ts"
import type { RailroadDiagram, RailroadExpression } from "./railroad-tree.ts"
import { commonValue } from "./statement-values.ts"
import { textReplacementOf } from "./text-replacement.ts"
import type { TreeNode, TreeRoot } from "./tree.ts"
import { descriptionOf } from "./values.ts"

/** The seven published forms; bounds are numbers or the shared non-finite spelling. */
type Expression =
  | { readonly type: "terminal"; readonly value: string }
  | { readonly type: "nonterminal"; readonly name: string }
  | { readonly type: "special"; readonly text: string }
  | { readonly type: "sequence"; readonly elements: readonly Expression[] }
  | { readonly type: "choice"; readonly alternatives: readonly Expression[] }
  | { readonly type: "optional"; readonly element: Expression }
  | {
      readonly type: "repetition"
      readonly element: Expression
      readonly min: number | string
      readonly max: number | string
    }

/** Railroad strings decode only n/r/t; every other escaped character loses its slash. */
function decoded(text: string): string {
  let value = ""
  for (let at = 0; at < text.length; at++) {
    const character = text.charAt(at)
    if (character !== "\\") value += character
    else {
      const escaped = text.charAt(++at)
      value +=
        escaped === "n"
          ? "\n"
          : escaped === "r"
            ? "\r"
            : escaped === "t"
              ? "\t"
              : escaped
    }
  }
  return value
}

/** A predicate labels the already folded operand without escaping its terminal value. */
function predicateLabel(node: Expression): string {
  switch (node.type) {
    case "terminal":
      return `"${node.value}"`
    case "nonterminal":
      return node.name
    case "special":
      return node.text
    default:
      return "(...)"
  }
}

/** docs/db-from-tree/railroad.md: publish four dialects in one comparison shape. */
export function railroadDbOf(
  source: string,
  root: TreeRoot,
  diagram: RailroadDiagram,
  embedded: EmbeddedValues,
): DbSummary {
  const text = new ConvertedText(readConvertedCharacters(source, root))
  const replace = textReplacementOf(embedded.config)
  const rules: JsonObject[] = []
  let accTitle = ""
  let accDescr = ""

  /** Read the converted quoted range; ABNF retains every interior backslash. */
  function stringOf(node: TreeNode): string {
    const interior = text.of(node.range).slice(1, -1)
    return root.diagramType === "railroadAbnf" ? interior : decoded(interior)
  }

  /** Preserve nested lists; only a singleton list or explicit group collapses. */
  function listOf(
    type: "sequence" | "choice",
    elements: readonly Expression[],
  ): Expression {
    const first = elements[0]
    if (elements.length === 1 && first !== undefined) return first
    return type === "sequence"
      ? { type, elements }
      : { type, alternatives: elements }
  }

  /** Bounds are tested as numbers before non-finite values are serialized. */
  function repeat(element: Expression, min: number, max: number): Expression {
    return min === 0 && max === 1
      ? { type: "optional", element }
      : {
          type: "repetition",
          element,
          min: numberOrText(min),
          max: numberOrText(max),
        }
  }

  /** Replace published text after folding expressions and forming predicate labels. */
  function replaceExpression(node: Expression): Expression {
    switch (node.type) {
      case "terminal":
        return { ...node, value: replace(node.value) }
      case "nonterminal":
        return { ...node, name: replace(node.name) }
      case "special":
        return { ...node, text: replace(node.text) }
      case "sequence":
        return { ...node, elements: node.elements.map(replaceExpression) }
      case "choice":
        return {
          ...node,
          alternatives: node.alternatives.map(replaceExpression),
        }
      case "optional":
      case "repetition":
        return { ...node, element: replaceExpression(node.element) }
      default:
        throw new Error(
          `railroad Db: unknown published expression ${JSON.stringify(node satisfies never)}`,
        )
    }
  }

  /** Translate authored expression nodes without reading tokens as a second parser. */
  function expressionOf(node: RailroadExpression): Expression {
    switch (node.type) {
      case "Identifier":
        return { type: "nonterminal", name: text.of(node.range) }
      case "StringLiteral":
        return { type: "terminal", value: stringOf(node) }
      case "RailroadTerminalCall":
        return { type: "terminal", value: stringOf(node.value) }
      case "RailroadNonterminalCall":
        return { type: "nonterminal", name: stringOf(node.name) }
      case "RailroadSpecialCall":
        return { type: "special", text: stringOf(node.text) }
      case "RailroadSpecialSequence":
        return {
          type: "special",
          text: text.of(node.range).slice(1, -1).trim(),
        }
      case "RailroadNumericValue":
        return { type: "terminal", value: text.of(node.range) }
      case "RailroadAnyExpression":
        return { type: "special", text: "." }
      case "RailroadSequenceCall":
      case "RailroadChoiceCall":
        return listOf(
          node.type === "RailroadSequenceCall" ? "sequence" : "choice",
          node.arguments.map((member) => expressionOf(member.expression)),
        )
      case "RailroadSequenceExpression":
        return listOf(
          "sequence",
          node.elements.map((member) => expressionOf(member.expression)),
        )
      case "RailroadChoiceExpression":
        return listOf(
          "choice",
          node.alternatives.map((member) => expressionOf(member.expression)),
        )
      case "RailroadGroupExpression":
        return expressionOf(node.element)
      case "RailroadOptionalCall":
      case "RailroadOptionalGroupExpression":
        return { type: "optional", element: expressionOf(node.element) }
      case "RailroadOneOrMoreCall":
        return repeat(expressionOf(node.element), 1, Infinity)
      case "RailroadZeroOrMoreCall":
      case "RailroadRepetitionGroupExpression":
        return repeat(expressionOf(node.element), 0, Infinity)
      case "RailroadPostfixExpression": {
        const element = expressionOf(node.element)
        return node.operator === "?"
          ? { type: "optional", element }
          : repeat(element, node.operator === "+" ? 1 : 0, Infinity)
      }
      case "RailroadExceptionExpression":
        return {
          type: "sequence",
          elements: [
            expressionOf(node.left),
            { type: "terminal", value: "-" },
            expressionOf(node.right),
          ],
        }
      case "RailroadPredicateExpression":
        return {
          type: "special",
          text: node.operator + predicateLabel(expressionOf(node.element)),
        }
      case "RailroadRepeatExpression": {
        const count = node.repeat
        const min =
          count.type === "NumericLiteral"
            ? Number.parseInt(text.of(count.range), 10)
            : count.minimum === null
              ? 0
              : Number.parseInt(text.of(count.minimum.range), 10)
        const max =
          count.type === "NumericLiteral"
            ? min
            : count.maximum === null
              ? Infinity
              : Number.parseInt(text.of(count.maximum.range), 10)
        return repeat(expressionOf(node.element), min, max)
      }
      default:
        throw new Error(
          `railroad Db: unknown expression ${JSON.stringify(node satisfies never)}`,
        )
    }
  }

  for (const statement of diagram.body) {
    switch (statement.type) {
      case "RailroadIgnoredText":
      case "RailroadTitleStatement":
        break
      case "RailroadRule":
        rules.push({
          name: replace(text.of(statement.name.range)),
          definition: replaceExpression(expressionOf(statement.definition)),
        })
        break
      case "RailroadAccTitleStatement":
      case "RailroadAccDescrStatement":
      case "RailroadAccDescrBlockStatement": {
        const value = commonValue(
          statement.value === null ? "" : text.of(statement.value.range),
          statement.type === "RailroadAccDescrBlockStatement",
        )
        if (statement.type === "RailroadAccTitleStatement") accTitle = value
        else accDescr = value
        break
      }
      default:
        throw new Error(
          `railroad Db: unknown statement ${JSON.stringify(statement satisfies never)}`,
        )
    }
  }
  return {
    accTitle: replace(accTitle),
    accDescr: replace(descriptionOf(accDescr)),
    rules,
  }
}
