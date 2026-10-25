import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type { Node, ArchitectureDiagram, Root } from "../src/index.ts"
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
    throw new Error("Accepted architecture fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Architecture does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("architecture fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("architecture")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("architecture"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): ArchitectureDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "ArchitectureDiagram")
      throw new Error("no architecture diagram")
    return root.body
  }

  it("preserves source order, authored references, icons and arrow components", () => {
    expect(diagramOf("gram-written-tree").body).toMatchObject([
      {
        type: "ArchitectureGroupStatement",
        id: { name: "g" },
        icon: { name: "cloud" },
        title: { kind: "text", value: "Group" },
      },
      {
        type: "ArchitectureServiceStatement",
        icon: { type: "StringLiteral", raw: '"A"', value: "A", closed: true },
        in: { name: "g" },
      },
      {
        type: "ArchitectureJunctionStatement",
        id: { name: "j" },
        in: { name: "g" },
      },
      {
        type: "ArchitectureEdgeStatement",
        lhsId: { name: "a" },
        lhsGroup: false,
        rhsId: { name: "j" },
        rhsGroup: false,
        arrow: {
          value: ":R <-[link]-> L:",
          startDirection: "R",
          startMarker: "arrow",
          line: "solid",
          title: { kind: "text", value: "link" },
          endMarker: "arrow",
          endDirection: "L",
        },
      },
      {
        type: "ArchitectureAlignmentStatement",
        direction: "row",
        members: [{ id: { name: "a" } }, { id: { name: "j" } }],
      },
    ])
    expect(diagramOf("db-mixed").body.map((item) => item.type)).toEqual([
      "ArchitectureAccTitleStatement",
      "ArchitectureAccDescrBlockStatement",
      "ArchitectureJunctionStatement",
      "ArchitectureServiceStatement",
      "ArchitectureGroupStatement",
      "ArchitectureGroupStatement",
      "ArchitectureServiceStatement",
      "ArchitectureEdgeStatement",
      "ArchitectureEdgeStatement",
      "ArchitectureAlignmentStatement",
      "ArchitectureAlignmentStatement",
    ])
  })

  it("owns hidden forms in every present gap and leaves absent component gaps empty", () => {
    expect(
      diagramOf("detect-retained-before-second-scan").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block" }, { kind: "directive" }])
    const body = diagramOf("hidden-directive-unit-gaps").body
    expect(body).toMatchObject([
      { type: "ArchitectureIgnoredText", kind: "directive" },
      {
        textBeforeId: [{ kind: "directive" }],
        textBeforeIcon: [{ kind: "directive" }],
        textBeforeTitle: [{ kind: "directive" }],
        textBeforeIn: [],
        textBeforeParent: [],
        textAfter: [],
      },
      {
        textBeforeId: [{ kind: "directive" }],
        textBeforeIcon: [{ kind: "directive" }],
        textBeforeTitle: [{ kind: "directive" }],
        textBeforeIn: [{ kind: "directive" }],
        textBeforeParent: [{ kind: "directive" }],
      },
      {
        textBeforeId: [{ kind: "directive" }],
        textBeforeIn: [{ kind: "directive" }],
        textBeforeParent: [{ kind: "directive" }],
      },
      {
        textBeforeLhsGroup: [],
        textBeforeArrow: [{ kind: "directive" }],
        textBeforeRhsId: [{ kind: "directive" }],
        textBeforeRhsGroup: [],
        arrow: {
          textBeforeStartDirection: [{ kind: "directive" }],
          textBeforeStartMarker: [{ kind: "directive" }],
          textBeforeLine: [{ kind: "directive" }],
          textBeforeTitle: [{ kind: "directive" }],
          textBeforeEndDash: [{ kind: "directive" }],
          textBeforeEndMarker: [{ kind: "directive" }],
          textBeforeEndDirection: [{ kind: "directive" }],
          textBeforeEndColon: [{ kind: "directive" }],
        },
      },
      {
        textBeforeDirection: [{ kind: "directive" }],
        members: [
          { textBeforeId: [{ kind: "directive" }] },
          { textBeforeId: [{ kind: "directive" }] },
        ],
      },
    ])
    expect(diagramOf("lex-hidden-two-suffixes").body[0]).toMatchObject({
      textAfter: [{ kind: "directive" }, { kind: "directive" }],
    })
    expect(diagramOf("lex-hidden-after-visible-eol").body).toMatchObject([
      { textAfter: [] },
      { type: "ArchitectureIgnoredText" },
      { type: "ArchitectureServiceStatement" },
    ])
  })

  it("keeps label kinds from lexical alternatives and preserves authored content", () => {
    expect(diagramOf("lex-title-padded-quotes").body[0]).toMatchObject({
      title: { kind: "text", value: '  "A\\nB"  ' },
    })
    expect(
      diagramOf("lex-title-unclosed-quote-with-close").body[0],
    ).toMatchObject({ title: { kind: "text", value: '"open' } })
    expect(diagramOf("lex-title-quoted-brackets").body[0]).toMatchObject({
      title: { kind: "string", value: "[x]" },
    })
    expect(diagramOf("lex-title-one-space-null").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("lex-title-two-spaces-literal").body[0]).toMatchObject({
      value: { type: "ArchitectureLiteral", value: " " },
    })
    expect(
      diagramOf("common-description-block-directive").body[0],
    ).toMatchObject({ value: { value: "A\n\nB" } })
  })

  it("separates composite icon/modifier components and keeps double dash indivisible", () => {
    for (const name of [
      "directive-icon-delimiters",
      "directive-group-delimiters",
      "end-edge-eof",
    ]) {
      const fixture = fixtures.find((item) => item.name === name)!
      const root = parse(fixture.input)
      const spellings = root.tokens
        .filter((token) => token.type !== "Directive")
        .map((token) => [token.type, token.value])
      if (name === "directive-icon-delimiters")
        expect(spellings).toContainEqual(["Identifier", "cloud"])
      if (name === "directive-group-delimiters")
        expect(spellings).toContainEqual(["Keyword", "group"])
      if (name === "end-edge-eof")
        expect(spellings).toContainEqual(["Punctuator", "--"])
      for (const delimiter of name === "directive-icon-delimiters"
        ? ["(", ")"]
        : name === "directive-group-delimiters"
          ? ["{", "}"]
          : [":"])
        expect(spellings).toContainEqual(["Punctuator", delimiter])
    }
  })

  for (const fixture of fixtures) {
    it(`${fixture.diagram}/${fixture.name}`, () => {
      let root: Root | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
      }
      if (root !== null) {
        expect(root.diagramType).toBe("architecture")
        expectCoverage(fixture.input, root)
        expectDb(fixture, root)
      }
    })
  }
})
