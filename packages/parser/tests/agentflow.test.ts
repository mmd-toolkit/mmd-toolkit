import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { AgentflowDiagram, Root } from "../src/index.ts"
import { parse, ParseError, traverseNodes } from "../src/index.ts"

describe("agentflow fixtures", async () => {
  const fixtures = await loadFixtures("agentflow")

  /** Only fixed corpus inputs are used. */
  function rootOf(name: string): Root {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return parse(fixture.input)
  }

  /** The diagram body of a fixed fixture. */
  function diagramOf(name: string): AgentflowDiagram {
    const body = rootOf(name).body
    if (body.type !== "AgentflowDiagram") throw new Error("no agentflow body")
    return body
  }

  it("structure: keeps the three arrow kinds and written lengths", () => {
    const arrows: unknown[] = []
    traverseNodes(rootOf("gram-three-edge-kinds"), {
      enterNode(node) {
        if (node.type === "AgentflowArrow")
          arrows.push([
            node.value,
            node.startMarker,
            node.line,
            node.length,
            node.endMarker,
          ])
      },
      leaveNode() {
        /* Values are collected on entry. */
      },
    })
    expect(arrows).toEqual([
      ["-->", "none", "solid", 2, "arrow"],
      ["-.-", "none", "dotted", 1, "none"],
      ["--x", "none", "solid", 2, "cross"],
    ])
  })

  it("structure: keeps flow, connector, global, and unnamed headings distinct", () => {
    expect(diagramOf("gram-flow-all-forms").body).toMatchObject([
      {
        type: "AgentflowFlowStatement",
        name: { parts: [{ value: "named" }] },
        title: { value: "Title" },
      },
      {
        type: "AgentflowFlowStatement",
        name: { parts: [{ value: "bare" }] },
        title: null,
      },
      { type: "AgentflowFlowStatement", name: null, title: null, data: [] },
    ])
    expect(diagramOf("gram-connector-all-forms").body[0]).toMatchObject({
      type: "AgentflowConnectorStatement",
      name: { parts: [{ value: "C" }] },
      title: { value: "API" },
    })
    expect(diagramOf("gram-global").body[0].type).toBe(
      "AgentflowGlobalStatement",
    )
  })

  it("structure: splits names only at retained forms and click-context exits", () => {
    expect(diagramOf("lex-flow-name-click-mixed").body[0]).toMatchObject({
      name: {
        parts: [
          { type: "AgentflowLabel", kind: "text", value: "Handle " },
          { type: "AgentflowIgnoredText", value: "click" },
          { type: "AgentflowLabel", kind: "text", value: "events" },
          { type: "AgentflowLabel", kind: "text", value: "B" },
        ],
      },
    })
    expect(diagramOf("gram-flow-name-whitespace-only").body[0]).toMatchObject({
      name: { parts: [{ value: " " }] },
    })
  })

  it.each([
    {
      name: "lex-name-click-empty-string-before-text",
      parts: [
        { type: "AgentflowIgnoredText", value: "click" },
        { type: "AgentflowIgnoredText", value: '""' },
        { type: "AgentflowLabel", kind: "text", value: "A" },
      ],
    },
    {
      name: "lex-name-click-empty-markdown-before-text",
      parts: [
        { type: "AgentflowIgnoredText", value: "click" },
        { type: "AgentflowIgnoredText", value: '"``"' },
        { type: "AgentflowLabel", kind: "text", value: "A" },
      ],
    },
    {
      name: "lex-name-click-empty-string-before-string",
      parts: [
        { type: "AgentflowIgnoredText", value: "click" },
        { type: "AgentflowIgnoredText", value: '""' },
        { type: "AgentflowLabel", kind: "string", value: "A" },
      ],
    },
    {
      name: "lex-name-click-empty-string-then-call",
      parts: [
        { type: "AgentflowIgnoredText", value: "click" },
        { type: "AgentflowIgnoredText", value: '""' },
        { type: "AgentflowIgnoredText", value: "call ()" },
        { type: "AgentflowLabel", kind: "text", value: " A" },
      ],
    },
    {
      name: "lex-connector-name-click-empty-string-tail",
      parts: [
        { type: "AgentflowLabel", kind: "text", value: "F " },
        { type: "AgentflowIgnoredText", value: "click" },
        { type: "AgentflowIgnoredText", value: '""' },
      ],
    },
  ])(
    "structure: retains recognized empty click strings in $name",
    ({ name, parts }) => {
      expect(diagramOf(name).body[0]).toMatchObject({ name: { parts } })
    },
  )

  it("structure: still rejects adjacent bare text after an empty click string", () => {
    expect(() => rootOf("gram-name-click-empty-string-adjacent-text")).toThrow(
      ParseError,
    )
  })

  it.each([
    {
      name: "lex-connector-name-click-empty-string-adjacent-text",
      prefix: "F ",
      tail: "A",
    },
    {
      name: "lex-connector-name-click-empty-string-adjacent-semicolon",
      prefix: "F ",
      tail: ";A",
    },
    {
      name: "lex-connector-name-click-empty-string-no-id-adjacent-semicolon",
      prefix: null,
      tail: ";A",
    },
    {
      name: "lex-connector-name-click-empty-string-trailing-semicolon",
      prefix: "F ",
      tail: ";",
    },
  ])(
    "structure: keeps adjacent connector text after an empty string in $name",
    ({ name, prefix, tail }) => {
      const statement = diagramOf(name).body[0]
      if (statement.type !== "AgentflowConnectorStatement")
        throw new Error("no connector statement")
      expect(
        statement.name.parts.map(({ type, kind, value }) => ({
          type,
          kind,
          value,
        })),
      ).toEqual([
        ...(prefix === null
          ? []
          : [{ type: "AgentflowLabel", kind: "text", value: prefix }]),
        { type: "AgentflowIgnoredText", kind: "click", value: "click" },
        { type: "AgentflowIgnoredText", kind: "empty-string", value: '""' },
        { type: "AgentflowLabel", kind: "text", value: tail },
      ])
    },
  )

  it.each([
    { name: "lex-flow-name-click-state", kinds: ["click"] },
    { name: "lex-empty-string-in-flow-name", kinds: ["empty-string"] },
    {
      name: "lex-empty-markdown-in-flow-name",
      kinds: ["empty-markdown-string"],
    },
    { name: "lex-empty-call-in-flow-name", kinds: ["empty-call"] },
    {
      name: "lex-empty-description-in-flow-name",
      kinds: ["empty-description-block"],
    },
    {
      name: "lex-direction-swallows-shape-and-edge",
      kinds: ["direction-text", "direction-text"],
    },
  ])(
    "structure: records the recognized ignored kind in $name",
    ({ name, kinds }) => {
      const actual: string[] = []
      traverseNodes(rootOf(name), {
        enterNode(node) {
          if (node.type === "AgentflowIgnoredText") actual.push(node.kind)
        },
        leaveNode() {
          // Kinds are collected on entry.
        },
      })
      expect(actual).toEqual(kinds)
    },
  )

  it.each([
    "comment-label-keeps-interior-spaces",
    "comment-square-after-string-padding",
    "comment-ellipse-space-padding",
  ])(
    "structure: leaves comment text out while retaining interior padding: %s",
    (name) => {
      const root = rootOf(name)
      const labels: string[] = []
      traverseNodes(root, {
        enterNode(node) {
          if (node.type === "AgentflowLabel") labels.push(node.value)
        },
        leaveNode() {
          /* Values are collected on entry. */
        },
      })
      expect(labels).toEqual([
        name === "comment-label-keeps-interior-spaces"
          ? "a \n b"
          : name === "comment-square-after-string-padding"
            ? "x  \nb"
            : "a  \nb",
      ])
      expect(root.comments).toHaveLength(1)
    },
  )

  it("structure: retains erased click prefixes in the existing fields", () => {
    expect(diagramOf("gram-click-erased-before-url").body.at(-1)).toMatchObject(
      {
        type: "AgentflowClickUrlStatement",
        textBeforeUrl: [{ type: "AgentflowIgnoredText", value: "click" }],
      },
    )
    expect(
      diagramOf("gram-click-erased-before-callback-tooltip").body.at(-1),
    ).toMatchObject({
      type: "AgentflowClickCallbackStatement",
      textBeforeTooltip: [{ type: "AgentflowIgnoredText", value: "click" }],
    })
  })

  it("structure: records metadata as separate opaque blocks on its written occurrence", () => {
    const blocks: string[] = []
    traverseNodes(rootOf("db-data-block-adjacent"), {
      enterNode(node) {
        if (node.type === "AgentflowDataBlock") blocks.push(node.value)
      },
      leaveNode() {
        /* Values are collected on entry. */
      },
    })
    expect(blocks.length).toBeGreaterThan(1)
    expect(rootOf("db-data-block-invalid-yaml").diagramType).toBe("agentflow")
  })
})
