import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type { Node, PacketDiagram, Root } from "../src/index.ts"
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
    throw new Error("Accepted packet fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Packet does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("packet fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("packet")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("packet"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): PacketDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "PacketDiagram") throw new Error("no packet diagram")
    return root.body
  }

  it("preserves the three authored block forms and their leaves", () => {
    expect(diagramOf("gram-mixed").body).toMatchObject([
      {
        type: "PacketRelativeBlockStatement",
        count: { raw: "2", value: 2 },
        label: { raw: '"two"', value: "two", closed: true },
      },
      { type: "PacketSingleBlockStatement", start: { raw: "2", value: 2 } },
      {
        type: "PacketRangeBlockStatement",
        start: { raw: "3" },
        end: { raw: "5" },
      },
    ])
    expect(diagramOf("db-row-split").body).toHaveLength(2)
    expect(diagramOf("gram-zero-range").body[0]).toMatchObject({
      type: "PacketRangeBlockStatement",
      start: { value: 0 },
      end: { value: 0 },
    })
  })

  it("owns complete hidden forms in header, interior, body and suffix gaps", () => {
    expect(
      diagramOf("detect-yaml-properties-ignored").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block" }])
    expect(
      diagramOf("detect-second-scan-directive").textBeforeHeader,
    ).toMatchObject([{ kind: "directive" }])
    expect(diagramOf("gram-hidden-range-gap-spaced").body[0]).toMatchObject({
      textBeforeDash: [{ kind: "directive" }],
      textBeforeEnd: [{ kind: "directive" }],
      textBeforeColon: [{ kind: "directive" }],
      textBeforeLabel: [],
    })
    expect(diagramOf("gram-single-hidden-gaps").body[0]).toMatchObject({
      textBeforeColon: [{ kind: "directive" }],
      textBeforeLabel: [{ kind: "directive" }],
    })
    expect(diagramOf("gram-hidden-yaml-gap").body[0]).toMatchObject({
      textBeforeCount: [{ kind: "yaml-block" }],
    })
    expect(diagramOf("lex-hidden-two-suffixes").body[0]).toMatchObject({
      textAfter: [{ kind: "directive" }, { kind: "directive" }],
    })
    expect(diagramOf("lex-hidden-after-visible-eol").body).toMatchObject([
      { type: "PacketSingleBlockStatement", textAfter: [] },
      { type: "PacketIgnoredText" },
      { type: "PacketSingleBlockStatement" },
    ])
  })

  it("keeps common-value padding, nulls, repetitions and authored quote spelling", () => {
    expect(diagramOf("lex-title-one-tab").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("lex-title-two-spaces").body[0]).toMatchObject({
      value: { type: "PacketLiteral", value: " " },
    })
    expect(diagramOf("acctitle-empty").body[0]).toMatchObject({ value: null })
    expect(diagramOf("accdescr-block-lines").body[0]).toMatchObject({
      value: { value: "A  B\n\n  C" },
    })
    expect(diagramOf("lex-description-directive-only").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("title-open-quote").body[0]).toMatchObject({
      value: { type: "PacketLiteral", value: '"open' },
    })
    expect(diagramOf("hidden-yaml-adjacent-later").body[0]).toMatchObject({
      value: "---\n---\n---",
    })
    expect(diagramOf("title-repeat-empty").body).toMatchObject([
      { value: { value: "First" } },
      { value: { value: "Second" } },
      { value: null },
    ])
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
        expect(root.diagramType).toBe("packet")
        expectCoverage(fixture.input, root)
        expectDb(fixture, root)
      }
    })
  }
})
