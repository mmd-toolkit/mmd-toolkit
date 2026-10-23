import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  fixtureAccepts,
  getFixturesRoot,
  loadFixtures,
  DATA_BLOCK_NODE_TYPES,
} from "@mmd-toolkit/tests"
import type { Node, Root, UsecaseDiagram } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"

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

describe("usecase fixtures", async () => {
  const fixtures = await loadFixtures("usecase")

  /** Only named, fixed corpus inputs are parsed. */
  function rootOf(name: string): Root {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return parse(fixture.input)
  }

  /** Source structure of a named fixture. */
  function diagramOf(name: string): UsecaseDiagram {
    const body = rootOf(name).body
    if (body.type !== "UsecaseDiagram") throw new Error("no usecase diagram")
    return body
  }

  it("keeps declarations, native properties, arrow halves and JSON interiors distinct", () => {
    const root = rootOf("db-all-fields")
    const kinds: string[] = []
    traverseNodes(root, {
      enterNode(node) {
        kinds.push(node.type)
      },
      leaveNode() {
        /* All assertions use the collected occurrences. */
      },
    })
    expect(kinds).toContain("UsecaseMetadataProperty")
    expect(kinds).toContain("UsecaseJsonDataBlock")
    expect(DATA_BLOCK_NODE_TYPES.has("UsecaseJsonDataBlock")).toBe(true)
    expect(DATA_BLOCK_NODE_TYPES.has("UsecaseMetadata")).toBe(false)
    const body = (root.body as UsecaseDiagram).body
    expect(
      body.find((node) => node.type === "UsecaseRelationshipStatement"),
    ).toMatchObject({
      source: { id: { name: "Clerk" } },
      id: { name: "opens" },
      opening: { value: "--", startMarker: "none", line: "solid", length: 2 },
      label: { kind: "string", value: "orders" },
      arrow: {
        value: "--->",
        startMarker: "none",
        endMarker: "arrow",
        line: "solid",
        length: 3,
      },
      target: { id: { name: "Checkout" } },
    })
    expect(
      body.find((node) => node.type === "UsecaseSystemBoundaryStatement"),
    ).toMatchObject({
      id: { name: "Shop" },
      body: [
        { entity: { shape: "ellipse" } },
        { entity: { shape: "rectangle" } },
      ],
    })
  })

  it("uses single-quoted StringLiteral nodes without escape decoding", () => {
    expect(diagramOf("lex-native-single-quoted-keys").body[0]).toMatchObject({
      actors: [
        {
          metadata: {
            properties: [
              {
                key: {
                  type: "StringLiteral",
                  value: "type",
                  raw: "'type'",
                  closed: true,
                },
                value: {
                  type: "StringLiteral",
                  value: "hollow",
                  raw: "'hollow'",
                  closed: true,
                },
              },
            ],
          },
        },
      ],
    })
    const values: string[] = []
    traverseNodes(rootOf("lex-native-string-backslashes"), {
      enterNode(node) {
        if (node.type === "StringLiteral") values.push(node.value)
      },
      leaveNode() {
        /* Values are collected on entry. */
      },
    })
    expect(values.some((value) => value.includes("\\"))).toBe(true)
  })

  it("retains CSS name gaps, leading value padding, and raw accessibility padding", () => {
    expect(diagramOf("lex-class-property-custom-gap").body).toContainEqual(
      expect.objectContaining({
        styles: [
          expect.objectContaining({
            name: expect.objectContaining({ name: "-- color" }),
          }),
        ],
      }),
    )
    expect(diagramOf("lex-css-property-padding").body.at(-1)).toMatchObject({
      styles: [{ name: { name: "color" }, value: { value: " \t red" } }],
    })
    expect(diagramOf("gram-a11y-line-raw-padding").body[0]).toMatchObject({
      value: { value: " \t value \t" },
    })
  })

  it("accepts balanced invalid JSON as one opaque block and rejects unclosed balancing", () => {
    expect(diagramOf("div-json-balanced-single-quote").body[0]).toMatchObject({
      data: { value: "'a':1" },
    })
    expect(() => rootOf("gram-json-empty-delimiter-only")).toThrow(ParseError)
  })

  for (const fixture of fixtures) {
    it(fixture.name, async () => {
      let root: Root | null = null
      let rejection: ParseError | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
        rejection = error
      }
      expect(root !== null).toBe(fixtureAccepts(fixture))
      if (root !== null) {
        expect(root.diagramType).toBe("usecase")
        expectCoverage(fixture.input, root)
        expect(problemsOfTree(fixture.input, root)).toEqual([])
      }
      const result = root ?? {
        message: rejection!.message,
        range: rejection!.range,
        loc: rejection!.loc,
      }
      await expect(`${JSON.stringify(result, null, 2)}\n`).toMatchFileSnapshot(
        path.join(
          getFixturesRoot(),
          "usecase",
          fixture.name,
          root === null ? "parse-error.json" : "ast.json",
        ),
      )
    })
  }
})
