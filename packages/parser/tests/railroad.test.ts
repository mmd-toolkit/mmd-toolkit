import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type { Node, RailroadDiagram, Root } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { railroadLexingOf } from "./helpers/reference-inputs.ts"

/** Losslessness, source spelling, token boundaries, child containment, and source order. */
function expectCoverage(text: string, root: Root): void {
  const entries = [...root.tokens, ...root.comments].toSorted(
    (a, b) => a.range[0] - b.range[0],
  )
  let end = 0
  for (const entry of entries) {
    expect(entry.range[0]).toBeGreaterThanOrEqual(end)
    expect(entry.range[1]).toBeGreaterThan(entry.range[0])
    expect(
      [...text.slice(end, entry.range[0])].every((character) =>
        isWhitespace(character.codePointAt(0)!),
      ),
    ).toBe(true)
    expect(
      entry.type === "Comment"
        ? text.slice(...entry.range).endsWith(entry.value)
        : text.slice(...entry.range) === entry.value,
    ).toBe(true)
    end = entry.range[1]
  }
  expect(
    [...text.slice(end)].every((character) =>
      isWhitespace(character.codePointAt(0)!),
    ),
  ).toBe(true)
  traverseNodes(root, {
    enterNode(node, parent) {
      if ("raw" in node) expect(node.raw).toBe(text.slice(...node.range))
      if (parent !== null) {
        expect(node.range[0]).toBeGreaterThanOrEqual(parent.range[0])
        expect(node.range[1]).toBeLessThanOrEqual(parent.range[1])
      }
      const children: Node[] = []
      for (const key of visitorKeys[node.type]) {
        const value = (
          node as unknown as Record<
            string,
            Node | readonly (Node | null)[] | null
          >
        )[key]
        if (Array.isArray(value))
          children.push(
            ...value.filter((child): child is Node => child !== null),
          )
        else if (value !== null) children.push(value as Node)
      }
      let previous = node.range[0]
      for (const child of children) {
        expect(child.range[0]).toBeGreaterThanOrEqual(previous)
        previous = child.range[1]
      }
      if (node.type === "Root") return
      const tokens = root.tokens.filter(
        (token) =>
          token.type !== "Directive" &&
          token.type !== "IgnoredSemicolon" &&
          token.range[0] >= node.range[0] &&
          token.range[1] <= node.range[1],
      )
      expect(tokens[0]?.range[0]).toBe(node.range[0])
      const expectedEnd = tokens.at(-1)!.range[1]
      expect(node.range[1]).toBe(expectedEnd)
    },
    leaveNode() {
      // All checks are made on entry.
    },
  })
}

/** Compare the JSON tree, as recorded, with the fixture's comparable Db. */
function expectDb(fixture: Fixture, root: Root): void {
  const reading = fixture.specified ?? fixture.expected
  if (!reading.accepted || reading.db === null) return
  const tree = JSON.parse(JSON.stringify(root)) as DbTreeRoot
  const embedded = embeddedValuesOf(fixture, reading)
  if (embedded === undefined)
    throw new Error("Accepted railroad fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Railroad does not query CSS color support")
    }),
  ).toEqual(reading.db)
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

  for (const fixture of fixtures)
    it(`${fixture.diagram}/${fixture.name}`, () => {
      let root: Root | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
      }
      if (root !== null) {
        expect(root.body.type).toBe("RailroadDiagram")
        expectCoverage(fixture.input, root)
        expectDb(fixture, root)
      }
    })
})
