import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  fixtureAccepts,
  getFixturesRoot,
  loadFixtures,
  dbFromTree,
  embeddedValuesOf,
  cssSupportsColor,
} from "@mmd-toolkit/tests"
import type { DbTreeRoot } from "@mmd-toolkit/tests"
import type { Node, Root, PieDiagram } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"
import {
  frontmatterChangesAttributeQuotes,
  holdsBarePercentLineBeforeHeader,
  holdsC4KeywordAfterHeader,
  withoutTokenCuts,
} from "./helpers/reference-inputs.ts"

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

describe("pie fixtures", async () => {
  const fixtures = await loadFixtures("pie")

  /** A named, fixed corpus input, without synthesized test text. */
  function rootOf(name: string): Root {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return parse(fixture.input)
  }

  /** The authored pie fields of a fixed corpus input. */
  function diagramOf(name: string): PieDiagram {
    const body = rootOf(name).body
    if (body.type !== "PieDiagram") throw new Error("no pie diagram")
    return body
  }

  it("retains common statements, duplicate sections and their source order", () => {
    expect(diagramOf("db-all-fields")).toMatchObject({
      showData: true,
      textBeforeHeader: [],
      textBeforeShowData: [],
      body: [
        { type: "PieTitleStatement", value: { value: "Chart" } },
        { type: "PieAccTitleStatement", value: { value: " Accessible" } },
        {
          type: "PieAccDescrBlockStatement",
          value: { value: "First line\n  Second line" },
        },
        {
          type: "PieSectionStatement",
          label: { value: "B" },
          value: { value: 10 },
        },
        {
          type: "PieSectionStatement",
          label: { value: "A" },
          value: { value: 100 },
        },
        { type: "PieSectionStatement", value: { value: 0.1 } },
        { type: "PieSectionStatement", value: { value: 0 } },
      ],
    })
    expect(
      diagramOf("db-three-definitions").body.map((node) =>
        node.type === "PieSectionStatement" ? node.label.value : node.type,
      ),
    ).toEqual(["A", "B", "A", "B", "A"])
  })

  it("retains hidden forms in their specified component and header gaps", () => {
    expect(
      diagramOf("frontmatter-between-section-parts").body[0],
    ).toMatchObject({
      type: "PieSectionStatement",
      textBeforeColon: [],
      textBeforeValue: [
        {
          type: "PieIgnoredText",
          kind: "yaml-block",
          value: "---\nignored: yes\n---",
        },
      ],
      value: { raw: "1" },
      textAfter: [],
    })
    expect(diagramOf("lex-hidden-before-colon-lf").body[0]).toMatchObject({
      textBeforeColon: [{ kind: "directive", value: "%%{}%%" }],
    })
    expect(diagramOf("review-hidden-directive-before-showdata")).toMatchObject({
      showData: true,
      textBeforeShowData: [{ kind: "directive" }],
    })
    expect(
      diagramOf("lex-hidden-directive-second-detection-scan"),
    ).toMatchObject({
      textBeforeHeader: [{ kind: "directive" }],
    })
  })

  it("distinguishes absent, whitespace-only and trimmed common values", () => {
    expect(diagramOf("ast-title-tab-null-eof").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("title-spaces").body[0]).toMatchObject({
      value: { value: "  A  B\t\tC  " },
    })
    expect(diagramOf("accdescr-empty-block-last").body.at(-1)).toMatchObject({
      value: null,
    })
  })

  it("uses both written quote kinds and shared double conversion, including negative zero", () => {
    expect(diagramOf("label-single-quote").body[0]).toMatchObject({
      label: { type: "StringLiteral", raw: "'A'", value: "A", closed: true },
    })
    const zero = diagramOf("number-negative-zero").body[0]
    if (zero.type !== "PieSectionStatement") throw new Error("no section")
    expect(Object.is(zero.value.value, -0)).toBe(true)
    const underflow = diagramOf("review-number-negative-underflow-final")
      .body[0]
    const overflow = diagramOf("number-overflow").body[0]
    if (
      underflow.type !== "PieSectionStatement" ||
      overflow.type !== "PieSectionStatement"
    )
      throw new Error("no numeric section")
    expect(Object.is(underflow.value.value, -0)).toBe(true)
    expect(overflow.value.value).toBe(Infinity)
    expect(() => rootOf("db-duplicate-negative")).toThrow(
      "A pie section value cannot be negative",
    )
  })

  const commonControls = (await loadFixtures("common")).filter((fixture) =>
    [
      "detect-minimal-pie",
      "frontmatter-after-bare-percent-flowchart",
      "frontmatter-nonleading-class",
      "frontmatter-nonleading-sequence",
      "frontmatter-nonleading-state",
      "directive-before-frontmatter",
      "frontmatter-leading-newline",
    ].includes(fixture.name),
  )
  for (const fixture of [...fixtures, ...commonControls]) {
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
      if (
        fixture.knownDivergence === "directive-as-token-boundary" ||
        fixture.knownDivergence === "ignored-semicolon-as-token-boundary"
      ) {
        expect(rejection?.message).toBe(
          fixture.knownDivergence === "directive-as-token-boundary"
            ? "Unexpected directive"
            : "Unexpected ; that the line rule ignores",
        )
        const reference = withoutTokenCuts(fixture.input)
        const referenceRoot = parse(reference)
        expect(referenceRoot.diagramType).toBe("pie")
        if (fixture.expected.accepted) {
          const db = dbFromTree(
            reference,
            JSON.parse(JSON.stringify(referenceRoot)) as DbTreeRoot,
            embeddedValuesOf(fixture, fixture.expected)!,
            cssSupportsColor,
          )
          expect(JSON.parse(JSON.stringify(db))).toEqual(fixture.expected.db)
        }
      }
      if (fixture.knownDivergence === "html-tag-in-frontmatter")
        expect(frontmatterChangesAttributeQuotes(fixture.input)).toBe(true)
      if (fixture.knownDivergence === "bare-percent-line-before-header")
        expect(holdsBarePercentLineBeforeHeader(fixture.input)).toBe(true)
      if (fixture.knownDivergence === "c4-keyword-anywhere")
        expect(holdsC4KeywordAfterHeader(fixture.input)).toBe(true)
      if (root !== null) {
        expect(root.diagramType).toBe("pie")
        expectCoverage(fixture.input, root)
        expect(problemsOfTree(fixture.input, root)).toEqual([])
        const expected = fixture.specified ?? fixture.expected
        if (expected.accepted) {
          const db = dbFromTree(
            fixture.input,
            JSON.parse(JSON.stringify(root)) as DbTreeRoot,
            embeddedValuesOf(fixture, expected)!,
            cssSupportsColor,
          )
          expect(JSON.parse(JSON.stringify(db))).toEqual(expected.db)
        }
      }
      const result = root ?? {
        message: rejection!.message,
        range: rejection!.range,
        loc: rejection!.loc,
      }
      await expect(`${JSON.stringify(result, null, 2)}\n`).toMatchFileSnapshot(
        path.join(
          getFixturesRoot(),
          fixture.diagram,
          fixture.name,
          root === null ? "parse-error.json" : "ast.json",
        ),
      )
    })
  }
})
