import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type { Node, CynefinDiagram, Root } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { cynefinLexingOf } from "./helpers/reference-inputs.ts"

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
    throw new Error("Accepted cynefin fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Cynefin does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("cynefin fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("cynefin")),
    ...(await loadFixtures("common")).filter((f) => f.name.includes("cynefin")),
  ]

  /** Corpus input shared with the syntax specification. */
  function fixtureOf(name: string): Fixture {
    const fixture = fixtures.find((f) => f.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return fixture
  }

  /** Authored Cynefin body of a corpus case. */
  function diagramOf(name: string): CynefinDiagram {
    const body = parse(fixtureOf(name).input).body
    if (body.type !== "CynefinDiagram") throw new Error("no Cynefin diagram")
    return body
  }

  it("keeps domains, items, transitions and common forms in source order", () => {
    const body = diagramOf("db-all-fields").body
    expect(body.map((node) => node.type)).toEqual([
      "CynefinTitleStatement",
      "CynefinAccTitleStatement",
      "CynefinAccDescrBlockStatement",
      "CynefinDomainStatement",
      "CynefinDomainStatement",
      "CynefinDomainStatement",
      "CynefinDomainStatement",
      "CynefinDomainStatement",
      "CynefinTransitionStatement",
      "CynefinTransitionStatement",
    ])
    expect(body[3]).toMatchObject({
      name: "confusion",
      items: [
        { label: { raw: '"F"', value: "F", closed: true } },
        { label: { value: "G" } },
        { label: { value: "H" } },
        { label: { value: "I" } },
      ],
    })
    expect(body[8]).toMatchObject({
      from: "complex",
      to: "complicated",
      arrow: {
        value: "-->",
        startMarker: "none",
        line: "solid",
        endMarker: "arrow",
      },
      label: { value: "Move" },
    })
    expect(body[9]).toMatchObject({
      label: null,
      textBeforeColon: [],
      textBeforeLabel: [],
    })
  })

  it("owns whole hidden forms at domain and item boundaries around visible LF", () => {
    expect(diagramOf("hidden-domain-item-members").body).toMatchObject([
      {
        name: "complex",
        textAfterName: [{ value: "%%{!before}%%" }],
        items: [
          {
            textBefore: [],
            label: { value: "A" },
            textAfter: [{ value: "%%{!after}%%" }],
          },
          {
            textBefore: [{ value: "%%{!beforeB}%%" }],
            label: { value: "B" },
            textAfter: [{ value: "%%{!tail}%%" }],
          },
        ],
      },
      { name: "clear", items: [{ label: { value: "C" } }] },
    ])
    expect(diagramOf("hidden-all-unit-gaps").body[0]).toMatchObject({
      type: "CynefinTransitionStatement",
      from: "complex",
      to: "clear",
      textBeforeArrow: [{ kind: "yaml-block", value: "---\nx\n---" }],
      textBeforeTo: [{ value: "---\ny\n---" }],
      textBeforeColon: [{ value: "---\nz\n---" }],
      textBeforeLabel: [{ value: "---\nw\n---" }],
      label: { raw: '"L"' },
      textAfter: [],
    })
  })

  it("splits composite header components while the transition arrow stays whole", () => {
    const fixture = fixtureOf("directive-every-field")
    const tokens = parse(fixture.input).tokens.map((token) => [
      token.type,
      token.value,
    ])
    expect(tokens).toContainEqual(["Keyword", "cynefin-beta"])
    expect(tokens).toContainEqual(["Punctuator", "-->"])
    expect(
      cynefinLexingOf(fixtureOf("header-colon-inline").input)!
        .units.slice(0, 2)
        .map((unit) => [unit.name, unit.text]),
    ).toEqual([
      ["header-colon", "cynefin-beta"],
      [":", ":"],
    ])
  })

  for (const fixture of fixtures)
    it(`${fixture.diagram}/${fixture.name}`, () => {
      let root: Root | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
      }
      if (root === null) return
      expect(root.body.type).toBe("CynefinDiagram")
      expectCoverage(fixture.input, root)
      expectDb(fixture, root)
      const units = cynefinLexingOf(fixture.input)!.units
      const forms: Node[] = []
      traverseNodes(root, {
        enterNode(node) {
          if (node.type === "CynefinIgnoredText") forms.push(node)
        },
        leaveNode() {
          /* The visitor order is checked on entry. */
        },
      })
      expect(forms.map((n) => n.range)).toEqual(
        units
          .filter((u) => u.name === "yaml-block" || u.name === "directive")
          .map((u) => u.significantRange),
      )
    })
})
