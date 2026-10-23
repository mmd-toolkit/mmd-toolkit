import path from "node:path"
import { describe, expect, it } from "vitest"
import {
  fixtureAccepts,
  getFixturesRoot,
  loadFixtures,
} from "@mmd-toolkit/tests"
import type { Root, IshikawaDiagram } from "../src/index.ts"
import { ParseError, parse, traverseNodes } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { declaredDivergence, outcomeOf } from "./helpers/known-divergences.ts"
import { problemsOfTree } from "./helpers/tree-problems.ts"
import {
  frontmatterChangesAttributeQuotes,
  holdsC4KeywordAfterHeader,
  indentationBlankLinesRejectedByMermaid,
  withoutTokenCuts,
} from "./helpers/reference-inputs.ts"

/** Project invariant 3, and containment and source order of every child node. */
function expectCoverage(text: string, root: Root): void {
  const entries = [...root.tokens, ...root.comments].toSorted(
    (a, b) => a.range[0] - b.range[0],
  )
  let end = 0
  for (const entry of entries) {
    expect(entry.range[0]).toBeGreaterThanOrEqual(end)
    expect(entry.range[1]).toBeGreaterThan(entry.range[0])
    if (entry.type === "Comment")
      expect(text.slice(...entry.range).endsWith(entry.value)).toBe(true)
    else expect(entry.value).toBe(text.slice(...entry.range))
    for (const character of text.slice(end, entry.range[0]))
      expect(isWhitespace(character.codePointAt(0)!)).toBe(true)
    end = entry.range[1]
  }
  for (const character of text.slice(end))
    expect(isWhitespace(character.codePointAt(0)!)).toBe(true)
  const lastChildEnd = new Map<object, number>()
  traverseNodes(root, {
    enterNode(node, parent) {
      expect(node.loc.start.line).toBeGreaterThanOrEqual(1)
      if ("raw" in node) expect(node.raw).toBe(text.slice(...node.range))
      if (parent === null) return
      expect(node.range[0]).toBeGreaterThanOrEqual(
        lastChildEnd.get(parent) ?? parent.range[0],
      )
      expect(node.range[1]).toBeLessThanOrEqual(parent.range[1])
      lastChildEnd.set(parent, node.range[1])
    },
    leaveNode() {
      // All assertions are made on entry.
    },
  })
}

describe("ishikawa acceptance fixtures", async () => {
  const fixtures = await loadFixtures("ishikawa")

  /** Parses a fixed corpus input. */
  function rootOf(name: string): Root {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return parse(fixture.input)
  }

  /** The Ishikawa body of a fixed corpus input. */
  function diagramOf(name: string): IshikawaDiagram {
    const root = rootOf(name)
    if (root.body.type !== "IshikawaDiagram")
      throw new Error("no Ishikawa body")
    return root.body
  }

  it("uses the first cause's indentation and the nearest strictly smaller cause", () => {
    expect(diagramOf("db-indent-nearest-smaller-cause").root).toMatchObject({
      indent: 0,
      text: { value: "R" },
      children: [
        {
          indent: 2,
          text: { value: "A" },
          children: [
            { indent: 6, text: { value: "B" }, children: [] },
            {
              indent: 4,
              text: { value: "C" },
              children: [{ indent: 5, text: { value: "D" }, children: [] }],
            },
          ],
        },
      ],
    })
  })

  it("allows root children below the first cause and ignores root indentation", () => {
    expect(diagramOf("db-indent-clamp-below-base").root).toMatchObject({
      text: { value: "R" },
      children: [
        { text: { value: "A" } },
        { text: { value: "B" } },
        { text: { value: "C" } },
      ],
    })
    expect(diagramOf("db-indent-root-deeper").root).toMatchObject({
      indent: 8,
      children: [{ indent: 1 }, { indent: 1 }],
    })
  })

  it.each(["header-only-lf", "header-beta-only-lf", "header-spaces-eof"])(
    "keeps a rootless diagram's header: %s",
    (name) => {
      const body = diagramOf(name)
      expect(body.root).toBeNull()
      expect(body.range).toEqual(rootOf(name).tokens[0].range)
    },
  )

  it("retains quotes, numeric spelling, and trailing whitespace as literal text", () => {
    expect(diagramOf("gram-empty-quotes").root?.text).toMatchObject({
      type: "IshikawaLiteral",
      value: '""',
    })
    expect(diagramOf("gram-root-trailing-space").root?.text.value).toBe("R   ")
    expect(
      diagramOf("lex-directive-in-numeric-looking-text").root?.text,
    ).toMatchObject({
      type: "IshikawaLiteral",
      value: "12",
    })
  })

  it("uses RawText fragments around directives and ignored semicolons", () => {
    const directive = rootOf("directive-root-middle")
    expect(directive.tokens.map((token) => [token.type, token.value])).toEqual([
      ["Keyword", "ishikawa"],
      ["RawText", "Ro"],
      ["Directive", "%%{init: {}}%%"],
      ["RawText", "ot"],
    ])
    const semicolon = rootOf("lex-root-style-semicolon-padding")
    expect(semicolon.tokens.at(-1)).toMatchObject({
      type: "RawText",
      value: "  ",
    })
    expect(
      semicolon.tokens.filter((token) => token.type === "IgnoredSemicolon"),
    ).toHaveLength(1)
  })

  it.each([
    ["comment-preserved-u2028", "\u2028"],
    ["comment-preserved-u2029", "\u2029"],
  ])("ends a diagram comment before its separator: %s", (name, separator) => {
    const root = rootOf(name)
    expect(root.comments[0].mark).toBe("%%")
    expect(root.comments[0].value.includes(separator)).toBe(false)
    expect((root.body as IshikawaDiagram).root?.children[0].indent).toBe(1)
  })

  it.each([
    ["header-only", "The header cannot end the text", [0, 8]],
    ["header-beta-only", "The header cannot end the text", [0, 13]],
    ["header-twice", "Unexpected token", [9, 17]],
    ["gram-second-header-eof", "Unexpected token", [9, 17]],
    ["gram-second-beta-header-eof", "Unexpected token", [9, 22]],
    ["gram-second-header-cut-eof", "Unexpected token", [9, 31]],
    ["gram-initial-header-cut-eof", "Unexpected directive", [4, 18]],
    ["gram-initial-beta-cut-eof", "Unexpected directive", [9, 23]],
  ] as const)("reports %s at its cause", (name, message, range) => {
    expect(() => rootOf(name)).toThrow(
      expect.objectContaining({ constructor: ParseError, message, range }),
    )
  })

  for (const fixture of fixtures) {
    it(fixture.name, async () => {
      let root: Root | null = null
      let rejection: ParseError | null = null
      try {
        root = parse(fixture.input)
      } catch (error) {
        if (!(error instanceof ParseError)) throw error
        rejection = error
      }
      expect(root !== null).toBe(fixtureAccepts(fixture))
      if (fixture.knownDivergence === "directive-as-token-boundary") {
        const outcome = outcomeOf(fixture.input)
        if (outcome.kind === "unsupported")
          throw new Error("Ishikawa must be supported")
        expect(declaredDivergence(fixture.input, fixture.config, outcome)).toBe(
          fixture.knownDivergence,
        )
        expect(parse(withoutTokenCuts(fixture.input)).diagramType).toBe(
          "ishikawa",
        )
      }
      if (fixture.knownDivergence === "c4-keyword-anywhere")
        expect(holdsC4KeywordAfterHeader(fixture.input)).toBe(true)
      if (fixture.knownDivergence === "html-tag-in-frontmatter")
        expect(frontmatterChangesAttributeQuotes(fixture.input)).toBe(true)
      if (fixture.knownDivergence === "blank-line-after-header-or-comments")
        expect(
          indentationBlankLinesRejectedByMermaid(fixture.input)?.length,
        ).toBeGreaterThan(0)
      if (root !== null) {
        expect(root.diagramType).toBe("ishikawa")
        expectCoverage(fixture.input, root)
        expect(problemsOfTree(fixture.input, root)).toEqual([])
      }
      const result = root ?? {
        message: rejection!.message,
        range: rejection!.range,
        loc: rejection!.loc,
      }
      const file = root === null ? "parse-error.json" : "ast.json"
      await expect(`${JSON.stringify(result, null, 2)}\n`).toMatchFileSnapshot(
        path.join(getFixturesRoot(), "ishikawa", fixture.name, file),
      )
    })
  }
})
