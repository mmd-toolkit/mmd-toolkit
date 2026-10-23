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
import type { Node, GitgraphDiagram, Root } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { outcomeOf } from "./helpers/known-divergences.ts"

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
    throw new Error("Accepted gitgraph fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Gitgraph does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("gitgraph fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("gitgraph")),
    ...(await loadFixtures("common")).filter(
      (fixture) =>
        fixture.name.toLowerCase().includes("gitgraph") ||
        fixture.name.includes("git-graph"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): GitgraphDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "GitgraphDiagram")
      throw new Error("no gitgraph diagram")
    return root.body
  }

  it("owns header, option and trailing hidden forms in their specified gaps", () => {
    expect(diagramOf("header-two-hidden-forms")).toMatchObject({
      direction: "LR",
      textBeforeDirection: [
        { kind: "yaml-block", value: "---\na\n---" },
        { kind: "directive", value: "%%{}%%" },
      ],
      textBeforeColon: [],
      body: [],
    })
    expect(
      diagramOf("lex-option-between-options-hidden").body[0],
    ).toMatchObject({
      options: [
        { textBefore: [] },
        { textBefore: [{ value: "%%{}%%" }], value: { value: "B" } },
      ],
      textAfter: [],
    })
    expect(
      diagramOf("lex-branch-between-name-order-hidden").body[0],
    ).toMatchObject({
      order: {
        textBefore: [{ value: "%%{}%%" }],
        value: { raw: "2", value: 2 },
      },
      textAfter: [],
    })
    expect(
      diagramOf("lex-option-before-type-value-hidden").body[0],
    ).toMatchObject({
      options: [{ value: "HIGHLIGHT", textBeforeValue: [{ value: "%%{}%%" }] }],
    })
    expect(diagramOf("lex-hidden-directive-commit-eof").body[0]).toMatchObject({
      textAfter: [{ value: "%%{}%%", range: [15, 21] }],
    })
  })

  it("keeps repeated options, written escapes, raw line padding and nullable blocks", () => {
    expect(diagramOf("gram-commit-repeated-options").body[0]).toMatchObject({
      options: [
        { value: { value: "A" } },
        { value: { value: "B" } },
        { value: { value: "C" } },
        { keyword: null, value: { value: "one" } },
        { keyword: "msg", value: { value: "two" } },
        { keyword: null, value: { value: "three" } },
        { value: "NORMAL" },
        { value: "REVERSE" },
        { value: "HIGHLIGHT" },
        { value: { value: "x" } },
        { value: { value: "x" } },
        { value: { value: "" } },
      ],
    })
    expect(
      diagramOf("lex-string-unknown-unicode-escape").body[0],
    ).toMatchObject({
      options: [
        { value: { value: "\\u0041" } },
        { value: { value: "\\x41" } },
        { value: { value: "\\q" } },
      ],
    })
    expect(diagramOf("title-conversion").body[0]).toMatchObject({
      value: { value: " A  B\t C  " },
    })
    expect(diagramOf("lex-title-tab-hidden-tail").body[0]).toMatchObject({
      value: null,
    })
    expect(
      diagramOf("lex-description-block-only-directive").body[0],
    ).toMatchObject({ value: null })
    expect(diagramOf("accdescr-block").body[0]).toMatchObject({
      value: { value: "A  B\n\n  C" },
    })
  })

  it("keeps passed bare lines as comments, outside the diagram and its hidden forms", () => {
    const fixture = fixtures.find(
      (item) => item.name === "detect-bare-brace-eof-header",
    )!
    const root = parse(fixture.input)
    expect(root.comments).toMatchObject([
      { mark: "%%", value: "{}%%", range: [0, 6] },
    ])
    expect(root.body).toMatchObject({ textBeforeHeader: [], range: [7, 15] })
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
      const outcome = outcomeOf(fixture.input, fixture.config)
      expect(outcome.kind === "tree").toBe(fixtureAccepts(fixture))
      if (root !== null) {
        expect(root.diagramType).toBe("gitGraph")
        expectCoverage(fixture.input, root)
      }
      if (outcome.kind === "tree") {
        expectCoverage(fixture.input, outcome.root)
        expectDb(fixture, outcome.root)
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
