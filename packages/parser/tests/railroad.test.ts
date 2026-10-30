import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { Comment, Node, RailroadDiagram, Root } from "../src/index.ts"
import { parse, traverseNodes } from "../src/index.ts"
import { railroadLexingOf } from "./helpers/reference-inputs.ts"

/** Native block ranges own their marked and unmarked fragments, excluding shared comment regions. */
function blockCommentPartsOf(text: string, root: Root): ReadonlySet<Comment> {
  const lexing = railroadLexingOf(text)
  if (lexing === null) throw new Error("no railroad lexical reading")
  return new Set(
    root.comments.filter((comment) =>
      lexing.comments.some(
        (native) =>
          native.valueEnd !== undefined &&
          (comment.mark === null || comment.mark === native.mark) &&
          comment.range[0] >= native.range[0] &&
          comment.range[1] <= native.range[1],
      ),
    ),
  )
}

describe("railroad fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("railroad")),
    ...(await loadFixtures("common")).filter((f) =>
      f.name.includes("railroad"),
    ),
  ]

  /** Corpus-backed input and expectations, shared with the specification. */
  function fixtureOf(name: string): Fixture {
    const fixture = fixtures.find((f) => f.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return fixture
  }

  /** One diagram node for all four dialects. */
  function diagramOf(name: string): RailroadDiagram {
    const root = parse(fixtureOf(name).input)
    if (root.body.type !== "RailroadDiagram")
      throw new Error("no railroad diagram")
    return root.body
  }

  it.each([
    ["ir-comment-block-common-region", "/*"],
    ["ebnf-comment-iso-common-region", "(*"],
  ] as const)(
    "%s: block fragments keep their ownership across a shared comment region",
    (name, mark) => {
      const fixture = fixtureOf(name)
      const root = parse(fixture.input)
      const parts = blockCommentPartsOf(fixture.input, root)
      expect(
        root.comments.map((comment) => [comment.mark, parts.has(comment)]),
      ).toEqual([
        [mark, true],
        ["%%", false],
        [null, true],
      ])
      expect([...parts].map((comment) => comment.value)).toEqual([" a", "b "])
    },
  )

  it.each([
    ["ebnf-comment-block-ps", [["/*", " A\u2029B "]]],
    [
      "ebnf-comment-iso",
      [
        ["(*", " first "],
        ["/*", " second "],
      ],
    ],
    ["ebnf-iso-first-closer", [["(*", " outer (* inner "]]],
    ["ir-c-comment-first-closer", [["/*", " outer /* inner "]]],
    ["ir-spec-railroad-diagram-3c20b091", [["/*", " this is a comment "]]],
    [
      "ir-spec-railroad-test-ts-9642cc36",
      [["/*", " comment before the first rule "]],
    ],
  ] as const)(
    "%s: block comment values exclude their closer",
    (name, comments) => {
      const root = parse(fixtureOf(name).input)
      expect(
        root.comments.map((comment) => [comment.mark, comment.value]),
      ).toEqual(comments)
    },
  )

  it("keeps all authored expression kinds and metadata in the four grammar examples", () => {
    for (const dialect of ["ir", "ebnf", "abnf", "peg"]) {
      const body = diagramOf(`${dialect}-gram-written-tree`).body
      expect(body.slice(0, 5)).toMatchObject([
        { type: "RailroadTitleStatement", value: { value: '"Syntax"' } },
        { type: "RailroadAccTitleStatement", value: { value: " Rules" } },
        { type: "RailroadAccDescrStatement", value: { value: " Short" } },
        { type: "RailroadAccDescrBlockStatement", value: null },
        { type: "RailroadAccDescrBlockStatement", value: { value: "Details" } },
      ])
      expect(body[5]).toMatchObject({
        type: "RailroadRule",
        name: { name: "item" },
      })
    }
    expect(diagramOf("ir-gram-written-tree").body[5]).toMatchObject({
      definition: {
        type: "RailroadSequenceCall",
        arguments: [
          {
            expression: {
              type: "RailroadTerminalCall",
              value: { value: "a\\n" },
            },
          },
          { expression: { type: "RailroadNonterminalCall" } },
          { expression: { type: "RailroadChoiceCall" } },
          { expression: { type: "RailroadZeroOrMoreCall" } },
          { expression: { type: "RailroadOneOrMoreCall" } },
        ],
      },
    })
    expect(diagramOf("ebnf-gram-written-tree").body[5]).toMatchObject({
      definition: {
        type: "RailroadChoiceExpression",
        alternatives: [
          {
            expression: {
              type: "RailroadPostfixExpression",
              operator: "+",
              element: { type: "RailroadExceptionExpression" },
            },
          },
          { expression: { type: "RailroadSequenceExpression" } },
        ],
      },
    })
    expect(diagramOf("abnf-gram-written-tree").body[5]).toMatchObject({
      definition: {
        elements: [
          {
            expression: {
              type: "RailroadRepeatExpression",
              repeat: {
                minimum: { raw: "002", value: 2 },
                maximum: { raw: "004", value: 4 },
              },
            },
          },
          { expression: { type: "RailroadOptionalGroupExpression" } },
          {
            expression: {
              repeat: { minimum: { raw: "0" }, maximum: { raw: "1" } },
            },
          },
          { expression: { repeat: { raw: "3" } } },
          { expression: { repeat: { minimum: null, maximum: null } } },
        ],
      },
    })
    expect(diagramOf("peg-gram-written-tree").body[5]).toMatchObject({
      definition: {
        elements: [
          {
            expression: {
              type: "RailroadPredicateExpression",
              operator: "&",
              element: {
                type: "RailroadPostfixExpression",
                operator: "+",
                element: { type: "RailroadGroupExpression" },
              },
            },
          },
          {
            expression: {
              type: "RailroadPredicateExpression",
              operator: "!",
              element: { type: "RailroadAnyExpression" },
            },
          },
          { expression: { operator: "?" } },
          { expression: { operator: "*" } },
          {
            expression: {
              type: "RailroadGroupExpression",
              element: { type: "RailroadGroupExpression" },
            },
          },
        ],
      },
    })
  })

  it("splits repeat components and keeps numeric values as a single text item", () => {
    const fixture = fixtureOf("abnf-gram-written-tree")
    const units = railroadLexingOf(fixture.input)!.units
    expect(
      units
        .filter((u) => u.name.startsWith("repeat-"))
        .map((u) => [u.name, u.text]),
    ).toEqual([
      ["repeat-minimum", "002"],
      ["repeat-star", "*"],
      ["repeat-maximum", "004"],
      ["repeat-minimum", "0"],
      ["repeat-star", "*"],
      ["repeat-maximum", "1"],
      ["repeat-star", "*"],
    ])
    const tokens = parse(fixture.input).tokens.map((t) => [t.type, t.value])
    expect(tokens).toContainEqual(["RawText", "%X41.42-43"])
    expect(tokens).toContainEqual(["Numeric", "002"])
    expect(tokens).toContainEqual(["Punctuator", "*"])
    const counts: string[] = []
    traverseNodes(parse(fixture.input), {
      enterNode(node) {
        if (node.type === "NumericLiteral") counts.push(node.raw)
      },
      leaveNode() {
        // Counts are collected in visitor order.
      },
    })
    expect(counts).toEqual(["002", "004", "0", "1", "3"])
  })

  it("retains native hidden forms exactly once in the specified gaps", () => {
    for (const dialect of ["ir", "ebnf", "abnf", "peg"]) {
      const fixture = fixtureOf(`${dialect}-native-ownership`)
      const root = parse(fixture.input)
      const hidden: Node[] = []
      traverseNodes(root, {
        enterNode(node) {
          if (node.type === "RailroadIgnoredText") hidden.push(node)
        },
        leaveNode() {
          /* All checks use entry order. */
        },
      })
      expect(hidden.length).toBeGreaterThan(5)
      expect(new Set(hidden.map((n) => n.range[0])).size).toBe(hidden.length)
      expect(hidden.map((n) => n.range[0])).toEqual(
        hidden.map((n) => n.range[0]).toSorted((a, b) => a - b),
      )
    }
  })
})
