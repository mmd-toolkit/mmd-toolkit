import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type { Node, WardleyDiagram, Root } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { wardleyLexingOf } from "./helpers/reference-inputs.ts"

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
    throw new Error("Accepted wardley fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Wardley does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("wardley fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("wardley")),
    ...(await loadFixtures("common")).filter((f) => f.name.includes("wardley")),
  ]

  /** Corpus input shared with the syntax specification. */
  function fixtureOf(name: string): Fixture {
    const fixture = fixtures.find((f) => f.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return fixture
  }

  /** Authored Wardley body of a corpus case. */
  function diagramOf(name: string): WardleyDiagram {
    const body = parse(fixtureOf(name).input).body
    if (body.type !== "WardleyDiagram") throw new Error("no Wardley diagram")
    return body
  }

  it("keeps the authored fields, coordinate order, signed offsets and pipeline members", () => {
    const body = diagramOf("db-all-fields").body
    expect(body.map((n) => n.type)).toEqual([
      "WardleyTitleStatement",
      "WardleyAccTitleStatement",
      "WardleyAccDescrBlockStatement",
      "WardleySizeStatement",
      "WardleyEvolutionStatement",
      "WardleyAnchorStatement",
      "WardleyComponentStatement",
      "WardleyComponentStatement",
      "WardleyPipelineStatement",
      "WardleyLinkStatement",
      "WardleyEvolveStatement",
      "WardleyAnnotationsStatement",
      "WardleyAnnotationStatement",
      "WardleyNoteStatement",
      "WardleyAcceleratorStatement",
      "WardleyDeacceleratorStatement",
    ])
    expect(body[6]).toMatchObject({
      name: { type: "WardleyIdentifier", name: "A" },
      coordinates: {
        visibility: { raw: "0.4", value: 0.4 },
        evolution: { raw: "0.5", value: 0.5 },
      },
      decorations: [
        {
          type: "WardleyLabelOffsetDecoration",
          negativeX: true,
          offsetX: { raw: "0", value: 0 },
          negativeY: true,
          offsetY: { raw: "2", value: 2 },
        },
        { type: "WardleySourceStrategyDecoration", value: "build" },
        { type: "WardleyInertiaDecoration" },
      ],
    })
    expect(body[8]).toMatchObject({
      parent: { name: "A" },
      body: [
        {
          type: "WardleyPipelineComponent",
          name: { name: "Child" },
          evolution: { raw: "0.6" },
          labelOffset: null,
        },
      ],
    })
    expect(body[11]).toMatchObject({
      coordinates: { visibility: { raw: "10" }, evolution: { raw: "20" } },
    })
  })

  it("keeps both labels and ports, authored arrow glyphs, and separate inertia forms", () => {
    expect(diagramOf("db-inertia-forms").body[1]).toMatchObject({
      decorations: [{ type: "WardleyParenthesizedInertiaDecoration" }],
    })
    const links = diagramOf("db-link-forms").body
    expect(links[0]).toMatchObject({
      fromPort: null,
      arrow: null,
      toPort: null,
      label: null,
    })
    expect(links[3]).toMatchObject({
      arrow: { value: "-.->", kind: "dependency", line: "dotted" },
    })
    expect(links[8]).toMatchObject({ fromPort: "forward", toPort: "backward" })
    expect(links[9]).toMatchObject({
      arrow: {
        value: "+'flow'<>",
        kind: "flow",
        startMarker: "arrow",
        endMarker: "arrow",
        label: { raw: "'flow'", value: "flow" },
      },
      label: { value: " annotation" },
    })
  })

  it("splits composite flow and common forms at authored components", () => {
    const fixture = fixtureOf("directive-flow-before-label")
    const units = wardleyLexingOf(fixture.input)!.units
    expect(
      units
        .filter((u) => u.name.startsWith("flow-"))
        .map((u) => [u.name, u.text]),
    ).toEqual([
      ["flow-open", "+"],
      ["flow-label", "'x'"],
      ["flow-marker", ">"],
    ])
    const tokens = parse(fixture.input).tokens.map((t) => [t.type, t.value])
    expect(tokens).toContainEqual(["Punctuator", "+"])
    expect(tokens).toContainEqual(["String", "'x'"])
    expect(tokens).toContainEqual(["Punctuator", ">"])
  })

  it("keeps evolution gaps and pending forms in the present optional component's named owner", () => {
    const stages = diagramOf("lex-hidden-evolution-members").body[0]
    expect(stages).toMatchObject({
      stages: [
        {
          textBefore: [{ value: "%%{!a}%%" }],
          textBeforeBoundaryMark: [{ value: "%%{!b}%%" }],
          textBeforeBoundary: [{ value: "%%{!c}%%" }],
          textBeforeSecondNameMark: [{ value: "%%{!d}%%" }],
          textBeforeSecondName: [{ value: "%%{!e}%%" }],
          textAfter: [{ value: "%%{!f}%%" }],
        },
        {
          textBefore: [{ value: "%%{!g}%%" }],
          boundary: null,
          secondName: null,
          textAfter: [{ value: "%%{!h}%%" }],
        },
      ],
    })
    expect(diagramOf("lex-hidden-pipeline-before-close").body[1]).toMatchObject(
      {
        body: [
          { type: "WardleyPipelineComponent", textAfter: [] },
          { type: "WardleyIgnoredText", value: "%%{!x}%%" },
        ],
      },
    )
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
      expect(root.body.type).toBe("WardleyDiagram")
      expectCoverage(fixture.input, root)
      expectDb(fixture, root)
      const units = wardleyLexingOf(fixture.input)!.units
      const forms: Node[] = []
      traverseNodes(root, {
        enterNode(node) {
          if (node.type === "WardleyIgnoredText") forms.push(node)
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
