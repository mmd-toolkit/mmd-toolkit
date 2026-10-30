/**
 * Runs ESLint on the inputs of `tests/language-inputs.ts` that the parser
 * accepts, and checks the token methods of `MermaidSourceCode` against answers
 * computed from the ranges of the tree alone: the tokens and comments inside a
 * node, before it, and after it, and whether whitespace lies between two
 * tokens. Every character of the source lies in a token or a comment, or is
 * whitespace or a line terminator (ast.md), so whitespace lies between two
 * tokens exactly when some character between them is in neither.
 */
import { describe, expect, it } from "vitest"
import type { Comment, Node, Range, Root, Token } from "@mmd-toolkit/parser"
import { traverseNodes } from "@mmd-toolkit/parser"
import type { MermaidSourceCode } from "../src/index.ts"
import { observe } from "./helpers.ts"
import { loadLanguageInputs } from "./language-inputs.ts"

/** Whether `inner` lies within `outer`. */
function isWithin(inner: Range, outer: Range): boolean {
  return outer[0] <= inner[0] && inner[1] <= outer[1]
}

/** The nodes of the tree, in the order of `traverseNodes`. */
function nodesOf(root: Root): Node[] {
  const nodes: Node[] = []
  traverseNodes(root, {
    enterNode(node) {
      nodes.push(node)
    },
    leaveNode() {
      // Each node is listed on entering it.
    },
  })
  return nodes
}

/** Whether some character between `left` and `right` lies in no token and no comment. */
function hasSpaceBetween(root: Root, left: Token, right: Token): boolean {
  const elements: Range[] = [...root.tokens, ...root.comments].map(
    (element) => element.range,
  )
  for (let offset = left.range[1]; offset < right.range[0]; offset++) {
    if (!elements.some((range) => range[0] <= offset && offset < range[1])) {
      return true
    }
  }
  return false
}

/** A token or a comment as a string that does not depend on which parse made it. */
function describeElement(element: Token | Comment | null): string {
  return element === null
    ? "null"
    : `${element.type} ${element.range.join(":")}`
}

/** The inputs of the language that the parser accepts. */
const inputs = (await loadLanguageInputs()).filter(
  (input) => observe(input.fixture.input).sourceCode !== null,
)

describe("the token methods of the source code", () => {
  it.each(
    inputs.map((input) => [
      `${input.diagram}/${input.name}`,
      input.fixture.input,
    ]),
  )("%s", (_name, input) => {
    const sourceCode: MermaidSourceCode | null = observe(input).sourceCode
    expect(sourceCode).not.toBeNull()
    if (sourceCode === null) return
    const root = sourceCode.ast

    for (const node of nodesOf(root)) {
      const inside = root.tokens.filter((token) =>
        isWithin(token.range, node.range),
      )
      const before = root.tokens.filter(
        (token) => token.range[1] <= node.range[0],
      )
      const after = root.tokens.filter(
        (token) => node.range[1] <= token.range[0],
      )
      expect(sourceCode.getTokens(node).map(describeElement)).toEqual(
        inside.map(describeElement),
      )
      expect(describeElement(sourceCode.getFirstToken(node, 0))).toBe(
        describeElement(inside.at(0) ?? null),
      )
      expect(describeElement(sourceCode.getLastToken(node, 0))).toBe(
        describeElement(inside.at(-1) ?? null),
      )
      expect(describeElement(sourceCode.getTokenBefore(node))).toBe(
        describeElement(before.at(-1) ?? null),
      )
      expect(describeElement(sourceCode.getTokenAfter(node))).toBe(
        describeElement(after.at(0) ?? null),
      )
      expect(sourceCode.getCommentsInside(node).map(describeElement)).toEqual(
        root.comments
          .filter((comment) => isWithin(comment.range, node.range))
          .map(describeElement),
      )
    }

    expect(sourceCode.getAllComments().map(describeElement)).toEqual(
      root.comments.map(describeElement),
    )

    for (let index = 0; index + 1 < root.tokens.length; index++) {
      const left = root.tokens[index]
      const right = root.tokens[index + 1]
      if (left === undefined || right === undefined) continue
      expect(sourceCode.isSpaceBetween(left, right)).toBe(
        hasSpaceBetween(root, left, right),
      )
    }
  })
})
