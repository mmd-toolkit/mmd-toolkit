import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type { Node, InfoDiagram, Root } from "../src/index.ts"
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
    throw new Error("Accepted info fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Info does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("info fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("info")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("info"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): InfoDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "InfoDiagram") throw new Error("no info diagram")
    return root.body
  }

  it("keeps retained forms in the specified header, flag, body and suffix gaps", () => {
    expect(diagramOf("lex-flag-hidden-two")).toMatchObject({
      showInfo: true,
      textBeforeHeader: [],
      textBeforeShowInfo: [
        { kind: "directive", value: "%%{}%%" },
        { kind: "yaml-block", value: "---\nx: y\n---" },
      ],
      body: [],
    })
    expect(
      diagramOf("frontmatter-nonleading-comment").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block", value: "---\ntitle: Ignored\n---" }])
    expect(
      diagramOf("detect-second-scan-directive").textBeforeHeader,
    ).toMatchObject([{ kind: "directive" }])
    expect(diagramOf("lex-hidden-without-flag")).toMatchObject({
      showInfo: false,
      textBeforeShowInfo: [],
      body: [{ type: "InfoIgnoredText" }, { type: "InfoTitleStatement" }],
    })
    expect(diagramOf("lex-hidden-tail-two").body[0]).toMatchObject({
      textAfter: [{ kind: "directive" }, { kind: "yaml-block" }],
    })
    expect(diagramOf("lex-hidden-after-visible-eol").body).toMatchObject([
      { type: "InfoTitleStatement", textAfter: [] },
      { type: "InfoIgnoredText" },
      { type: "InfoIgnoredText" },
      { type: "InfoAccTitleStatement" },
    ])
  })

  it("keeps padding, null values, repeated occurrences and first-close block content", () => {
    expect(diagramOf("title-tabs").body[0]).toMatchObject({
      value: { type: "InfoLiteral", value: " A\t\tB \t" },
    })
    expect(diagramOf("lex-title-one-tab").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("lex-title-two-spaces").body[0]).toMatchObject({
      value: { value: " " },
    })
    expect(diagramOf("acctitle-empty").body[0]).toMatchObject({ value: null })
    expect(diagramOf("accdescr-line-repeat").body).toMatchObject([
      { value: { value: " A" } },
      { value: { value: " B" } },
      { value: null },
    ])
    expect(diagramOf("accdescr-block-lines").body[0]).toMatchObject({
      value: { value: "A  B\n\n  C" },
    })
    expect(diagramOf("lex-block-directive-only").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("title-open-quote").body[0]).toMatchObject({
      value: { type: "InfoLiteral", value: '"unfinished' },
    })
    expect(
      diagramOf("lex-yaml-three-fences").textBeforeShowInfo[0],
    ).toMatchObject({
      type: "InfoIgnoredText",
      value: "---\n---\n---",
    })
  })

  for (const fixture of fixtures) {
    it(`${fixture.diagram}/${fixture.name}`, () => {
      let root: Root | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
      }
      if (fixture.knownDivergence === "embedded-data-opaque") {
        expect(fixture.expected.accepted).toBe(false)
        expect(root?.frontmatter).not.toBeNull()
      }
      if (root !== null) {
        expect(root.diagramType).toBe("info")
        expectCoverage(fixture.input, root)
        expectDb(fixture, root)
      }
    })
  }
})
