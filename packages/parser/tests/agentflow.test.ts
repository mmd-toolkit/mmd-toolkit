import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { AgentflowDiagram, Node, Root } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"

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
      children.sort((a, b) => a.range[0] - b.range[0])
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
      const expectedEnd =
        node.type === "AgentflowAccDescrBlockStatement" && !node.closed
          ? text.length
          : Math.max(
              tokens.at(-1)!.range[1],
              ...children.map((child) => child.range[1]),
            )
      expect(node.range[1]).toBe(expectedEnd)
    },
    leaveNode() {
      // All checks are made on entry.
    },
  })
}

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

  for (const fixture of fixtures) {
    it(fixture.name, () => {
      let root: Root | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
      }
      if (root !== null) {
        expect(root.diagramType).toBe("agentflow")
        expectCoverage(fixture.input, root)
      }
    })
  }
})
