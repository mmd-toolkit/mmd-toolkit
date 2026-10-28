import { describe, expect, it } from "vitest"
import { loadFixtures, DATA_BLOCK_NODE_TYPES } from "@mmd-toolkit/tests"
import type { Root, UsecaseDiagram } from "../src/index.ts"
import { parse, ParseError, traverseNodes } from "../src/index.ts"

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
})
