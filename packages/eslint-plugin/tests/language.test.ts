/**
 * Runs ESLint on the inputs of `tests/language-inputs.ts`, one for each case
 * that the language treats on its own, and checks what the language gives
 * ESLint: the parse errors at the places of the parser's errors, the nodes in
 * the order of `traverseNodes`, and positions that agree with the tree, so
 * that ESLint's lines and columns are the tree's.
 */
import { describe, expect, it } from "vitest"
import type {
  Comment,
  Directive,
  Frontmatter,
  Node,
  Root,
  Token,
} from "@mmd-toolkit/parser"
import {
  parse,
  ParseError,
  traverseNodes,
  visitorKeys,
} from "@mmd-toolkit/parser"
import { mermaidLanguage } from "../src/index.ts"
import type { Visit } from "./helpers.ts"
import { observe, withoutByteOrderMark } from "./helpers.ts"
import { loadLanguageInputs } from "./language-inputs.ts"

/** What the parser does with a text: its tree, or the error it throws. */
type ParserOutcome =
  | { readonly kind: "parsed"; readonly root: Root }
  | { readonly kind: "rejected"; readonly error: ParseError }

/** Parses `text` with the parser, as the reference for what ESLint reports. */
function parserOutcome(text: string): ParserOutcome {
  try {
    return { kind: "parsed", root: parse(text) }
  } catch (error) {
    if (error instanceof ParseError) return { kind: "rejected", error }
    throw error
  }
}

/** The visits of `traverseNodes`, the walk that the language promises to give ESLint. */
function walkOf(root: Root): Visit[] {
  const visits: Visit[] = []
  traverseNodes(root, {
    enterNode(node) {
      visits.push({ phase: "enter", node })
    },
    leaveNode(node) {
      visits.push({ phase: "leave", node })
    },
  })
  return visits
}

/** A visit as a string that does not depend on which parse made the node. */
function describeVisit(visit: Visit): string {
  return `${visit.phase} ${visit.node.type} ${visit.node.range.join(":")}`
}

/** Everything in the tree that has a range and a location. */
function elementsOf(
  root: Root,
): (Node | Token | Comment | Directive | Frontmatter)[] {
  const nodes = walkOf(root)
    .filter((visit) => visit.phase === "enter")
    .map((visit) => visit.node)
  return [
    ...nodes,
    ...root.tokens,
    ...root.comments,
    ...root.directives,
    ...(root.frontmatter === null ? [] : [root.frontmatter]),
  ]
}

const inputs = await loadLanguageInputs()

describe("the language object", () => {
  it("gives ESLint the visitor keys of the parser", () => {
    expect(mermaidLanguage.visitorKeys).toEqual(visitorKeys)
  })

  it("counts lines from 1 and columns from 0, as the tree does", () => {
    expect(mermaidLanguage.lineStart).toBe(1)
    expect(mermaidLanguage.columnStart).toBe(0)
  })
})

describe("the inputs of the language", () => {
  it.each(inputs.map((input) => [input.case, input]))(
    "%s is a case of its kind",
    (_case, input) => {
      expect(input.holds(input.fixture.input)).toBe(true)
    },
  )

  it.each(
    inputs.map((input) => [
      `${input.diagram}/${input.name}`,
      input.fixture.input,
    ]),
  )("%s", (_name, input) => {
    const text = withoutByteOrderMark(input)
    const outcome = parserOutcome(text)
    const observation = observe(input)

    if (outcome.kind === "rejected") {
      // ESLint shows the column of a parse error as it is, counted from 1.
      expect(observation.messages).toEqual([
        expect.objectContaining({
          ruleId: null,
          fatal: true,
          message: `Parsing error: ${outcome.error.message}`,
          line: outcome.error.loc.start.line,
          column: outcome.error.loc.start.column + 1,
        }),
      ])
      return
    }

    expect(observation.messages).toEqual([])
    const sourceCode = observation.sourceCode
    expect(sourceCode).not.toBeNull()
    if (sourceCode === null) return
    const root = sourceCode.ast

    expect(observation.visits.map(describeVisit)).toEqual(
      walkOf(outcome.root).map(describeVisit),
    )

    expect(sourceCode.lines).toHaveLength(root.loc.end.line)
    for (const element of elementsOf(root)) {
      expect(sourceCode.getLocFromIndex(element.range[0])).toEqual(
        element.loc.start,
      )
      expect(sourceCode.getLocFromIndex(element.range[1])).toEqual(
        element.loc.end,
      )
      expect(sourceCode.getIndexFromLoc(element.loc.start)).toBe(
        element.range[0],
      )
    }

    traverseNodes(root, {
      enterNode(node, parent) {
        expect(sourceCode.getParent(node)).toBe(parent ?? undefined)
      },
      leaveNode() {
        // The parent is checked on entering the node.
      },
    })
  })
})
