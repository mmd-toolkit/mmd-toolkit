import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import {
  loadFixtures,
  fixtureAccepts,
  dbFromTree,
  embeddedValuesOf,
} from "@mmd-toolkit/tests"
import type { Node, PieDiagram, Root } from "../src/index.ts"
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
    throw new Error("Accepted pie fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Pie does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("pie fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("pie")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("pie"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): PieDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "PieDiagram") throw new Error("no pie diagram")
    return root.body
  }

  it("keeps hidden forms in the specified header, section and body gaps", () => {
    expect(diagramOf("review-hidden-directive-before-showdata")).toMatchObject({
      showData: true,
      textBeforeHeader: [],
      textBeforeShowData: [{ kind: "directive", value: "%%{}%%" }],
    })
    expect(
      diagramOf("frontmatter-nonleading-comment").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block", value: "---\ntitle: Hidden\n---" }])
    expect(
      diagramOf("frontmatter-between-section-parts").body[0],
    ).toMatchObject({
      textBeforeColon: [],
      textBeforeValue: [
        { kind: "yaml-block", value: "---\nignored: yes\n---" },
      ],
      textAfter: [],
    })
    expect(diagramOf("lex-yaml-before-colon-two-blocks").body[0]).toMatchObject(
      { textBeforeColon: [{ kind: "yaml-block" }, { kind: "yaml-block" }] },
    )
    expect(
      diagramOf("lex-yaml-three-fences-before-value").body[0],
    ).toMatchObject({ textBeforeValue: [{ value: "---\n---\n---" }] })
    expect(diagramOf("gram-section-eof-hidden-yaml").body[0]).toMatchObject({
      textAfter: [{ kind: "yaml-block" }],
    })
    expect(diagramOf("frontmatter-after-header")).toMatchObject({
      showData: false,
      textBeforeShowData: [],
      body: [{ type: "PieIgnoredText" }, { type: "PieSectionStatement" }],
    })
    expect(diagramOf("lex-yaml-after-showdata-eof")).toMatchObject({
      showData: true,
      textBeforeShowData: [],
      body: [{ type: "PieIgnoredText" }],
    })
  })

  it("keeps line padding, nullable values, trimmed blocks and authored escapes", () => {
    expect(diagramOf("title-spaces").body[0]).toMatchObject({
      value: { value: "  A  B\t\tC  " },
    })
    expect(diagramOf("acctitle-eof").body[0]).toMatchObject({ value: null })
    expect(diagramOf("ast-title-tab-null-eof").body[0]).toMatchObject({
      value: null,
      range: [4, 9],
    })
    expect(
      diagramOf("review-acctitle-whitespace-final").body.at(-1),
    ).toMatchObject({ value: { value: " \t" } })
    expect(diagramOf("accdescr-block").body[0]).toMatchObject({
      value: { value: "A  B\n\n  C\t\tD" },
    })
    expect(
      diagramOf("gram-description-block-directive-only").body.at(-1),
    ).toMatchObject({ value: null })
    expect(diagramOf("label-single-quote").body[0]).toMatchObject({
      label: { type: "StringLiteral", closed: true },
    })
    expect(diagramOf("label-unknown-escapes").body[0]).toMatchObject({
      label: { value: "\\q \\0 \\u0041 \\x41 \\/" },
    })
  })

  it("retains every duplicate and validates converted double negativity", () => {
    expect(diagramOf("db-three-definitions").body).toHaveLength(5)
    const zero = diagramOf("number-negative-zero").body[0]
    if (zero.type !== "PieSectionStatement") throw new Error("no section")
    expect(Object.is(zero.value.value, -0)).toBe(true)
    const overflow = diagramOf("number-overflow").body[0]
    if (overflow.type !== "PieSectionStatement") throw new Error("no section")
    expect(overflow.value.value).toBe(Infinity)
    const underflow = diagramOf("review-number-negative-underflow-final")
      .body[0]
    if (underflow.type !== "PieSectionStatement") throw new Error("no section")
    expect(Object.is(underflow.value.value, -0)).toBe(true)
  })

  for (const fixture of fixtures) {
    it(`${fixture.diagram}/${fixture.name}`, async () => {
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
        expect(root.diagramType).toBe("pie")
        expectCoverage(fixture.input, root)
        expectDb(fixture, root)
      }
      const result = root ?? {
        message: rejection!.message,
        range: rejection!.range,
        loc: rejection!.loc,
      }
      await expect(`${JSON.stringify(result, null, 2)}\n`).toMatchFileSnapshot(
        path.join(
          fileURLToPath(new URL("../../tests/fixtures/", import.meta.url)),
          fixture.diagram,
          fixture.name,
          root === null ? "parse-error.json" : "ast.json",
        ),
      )
    })
  }
})
