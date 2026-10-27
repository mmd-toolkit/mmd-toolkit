import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type {
  Node,
  TreemapBodyItem,
  TreemapDiagram,
  Root,
} from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { treemapLexingOf } from "./helpers/reference-inputs.ts"

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
    throw new Error("Accepted treemap fixture lacks embedded values")
  expect(
    dbFromTree(fixture.input, tree, embedded, () => {
      throw new Error("Treemap does not query CSS color support")
    }),
  ).toEqual(reading.db)
}

describe("treemap fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("treemap")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("treemap"),
    ),
  ]

  /** Corpus inputs are shared with the specification and recorded acceptance tests. */
  function fixtureOf(name: string): Fixture {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return fixture
  }

  /** Structure checks use the public parser without configuration options. */
  function diagramOf(name: string): TreemapDiagram {
    const root = parse(fixtureOf(name).input)
    if (root.body.type !== "TreemapDiagram")
      throw new Error("no treemap diagram")
    return root.body
  }

  /** Every authored statement, with nested gaps and hierarchy in visitor order. */
  function statementsOf(name: string): TreemapBodyItem[] {
    const statements: TreemapBodyItem[] = []
    traverseNodes(parse(fixtureOf(name).input), {
      enterNode(node) {
        if (
          node.type === "TreemapSection" ||
          node.type === "TreemapLeaf" ||
          node.type === "TreemapClassDefStatement" ||
          node.type === "TreemapTitleStatement" ||
          node.type === "TreemapAccTitleStatement" ||
          node.type === "TreemapAccDescrStatement" ||
          node.type === "TreemapAccDescrBlockStatement"
        )
          statements.push(node)
      },
      leaveNode() {
        /* Collected on entry. */
      },
    })
    return statements
  }

  it("keeps all nine node kinds, row indentation, separators and quote styles", () => {
    expect(diagramOf("gram-written-tree").body).toMatchObject([
      { type: "TreemapTitleStatement", value: { value: "Map" } },
      {
        type: "TreemapSection",
        indent: 0,
        name: { raw: '"Root"', closed: true },
        classSelector: { name: "aa" },
        statementsBefore: [],
        children: [
          {
            type: "TreemapLeaf",
            indent: 2,
            name: { value: "Left" },
            value: { raw: "1,234.5", value: 1234.5 },
            classSelector: null,
            statementsBefore: [],
          },
          {
            type: "TreemapLeaf",
            indent: 2,
            name: { raw: "'Right'" },
            value: { raw: "2", value: 2 },
            classSelector: { name: "aa" },
            statementsBefore: [
              {
                type: "TreemapClassDefStatement",
                indent: 2,
                name: { name: "aa" },
                style: { value: "fill:red,color:blue" },
              },
              { type: "TreemapAccDescrBlockStatement", value: null },
            ],
          },
        ],
      },
      { type: "TreemapAccTitleStatement", value: { value: " Map" } },
      { type: "TreemapAccDescrStatement", value: { value: " Short" } },
      { type: "TreemapAccDescrBlockStatement", value: { value: "Details" } },
    ])
  })

  it("keeps preceding trailing whitespace as the next row's indentation", () => {
    for (const name of ["db-header-tail-space", "db-header-tail-tab"])
      expect(diagramOf(name).body).toMatchObject([{ indent: 1 }, { indent: 0 }])
    for (const name of [
      "db-section-tail-space",
      "db-section-tail-tab",
      "db-leaf-tail-space",
      "db-leaf-tail-tab",
      "db-class-tail-space",
      "db-class-tail-tab",
    ])
      expect(
        statementsOf(name)
          .filter(
            (statement) =>
              statement.type === "TreemapSection" ||
              statement.type === "TreemapLeaf",
          )
          .at(-1),
      ).toMatchObject({ indent: 1 })
    expect(statementsOf("gram-indent-from-whitespace-line")).toMatchObject([
      { indent: 0 },
      { indent: 4 },
    ])
    expect(statementsOf("gram-indent-around-global-directive")).toMatchObject([
      { indent: 0 },
      { indent: 2 },
    ])
    expect(
      statementsOf("gram-selector-followed-by-indented-row"),
    ).toMatchObject([
      { indent: 0, classSelector: { name: "aa" } },
      { indent: 2 },
    ])
    expect(statementsOf("db-leaf-closes-open-sections")).toMatchObject([
      { type: "TreemapSection", indent: 0 },
      { type: "TreemapSection", indent: 2 },
      { type: "TreemapLeaf", indent: 0 },
      { type: "TreemapLeaf", indent: 4 },
    ])
  })

  it("retains authored numeric spelling and the specified decimal-prefix value", () => {
    for (const [name, raw, value] of [
      ["db-number-comma", "1,234.50", 1234.5],
      ["db-number-underscore", "1_234.50", 1],
      ["db-number-multiple-dots", "1.2.3", 1.2],
      ["db-number-mixed", "1,,2_3.4", 12],
      ["db-number-nan", ".", Number.NaN],
      ["lex-number-dot-underscore", "._", Number.NaN],
      ["lex-number-commas-before-next-node", "1,,", 1],
      ["db-number-rounded", "9007199254740993", 9007199254740992],
    ] as const) {
      expect(diagramOf(name).body[0]).toMatchObject({ value: { raw, value } })
    }
    expect(diagramOf("db-number-overflow").body[0]).toMatchObject({
      value: { value: Infinity },
    })
    expect(diagramOf("db-number-subnormal").body[0]).toMatchObject({
      value: { value: 1e-323 },
    })
    expect(diagramOf("db-number-underflow").body[0]).toMatchObject({
      value: { value: 0 },
    })
  })

  it("preserves empty strings, raw line endings and backslashes without escape decoding", () => {
    expect(statementsOf("db-empty-names")).toMatchObject([
      { name: { value: "", raw: '""', closed: true } },
      { name: { value: "", raw: "''", closed: true } },
      { name: { value: "", raw: '""', closed: true } },
      { type: "TreemapClassDefStatement" },
    ])
    expect(diagramOf("lex-string-conversion").body[0]).toMatchObject({
      name: { value: "A\\n\\t\\q\\u0041" },
    })
    expect(diagramOf("lex-string-backslash-line-feed").body[0]).toMatchObject({
      name: { value: "A\\\nB" },
    })
    expect(diagramOf("line-name-values").body[0]).toMatchObject({
      name: { value: "A\r\nB\rC\u2028D\u2029E" },
    })
  })

  it("keeps null and whitespace-only common values and each repeated occurrence", () => {
    for (const name of [
      "common-title-eof",
      "common-title-one-space",
      "common-title-one-tab",
      "common-title-directive-only",
    ])
      expect(diagramOf(name).body[0]).toMatchObject({ value: null })
    expect(diagramOf("common-title-two-spaces").body[0]).toMatchObject({
      value: { value: " " },
    })
    for (const name of [
      "common-acctitle-whitespace-only",
      "common-description-whitespace-only",
    ])
      expect(diagramOf(name).body[0]).toMatchObject({
        value: { value: " \t " },
      })
    for (const name of [
      "common-block-whitespace-only",
      "common-block-directive-only",
      "common-block-comment-only",
    ])
      expect(diagramOf(name).body[0]).toMatchObject({ value: null })
    expect(diagramOf("common-repeat-empty").body).toMatchObject([
      { value: { value: "First" } },
      { value: { value: " First" } },
      { value: { value: " First" } },
      { value: null },
      { value: null },
      { value: null },
    ])
    expect(diagramOf("gram-title-block-node-adjacent").body).toMatchObject([
      { type: "TreemapTitleStatement", value: null },
      { type: "TreemapAccDescrBlockStatement", value: null },
      { type: "TreemapLeaf" },
    ])
  })

  it("keeps composite class styles whole without re-lexing their contents", () => {
    expect(diagramOf("lex-class-name-title-prefix").body[0]).toMatchObject({
      name: { name: "titleClass" },
    })
    expect(diagramOf("lex-class-style-takes-next-class").body).toMatchObject([
      { name: { name: "aa" }, style: { value: "classDef bb fill:red" } },
    ])
    expect(diagramOf("lex-class-style-crosses-blank-line").body).toMatchObject([
      { style: { value: '"B":1' } },
    ])
    for (const name of [
      "db-class-empty",
      "gram-class-whitespace-style-null",
      "directive-class-only-style-null",
    ])
      expect(diagramOf(name).body[0]).toMatchObject({ style: null })
    expect(diagramOf("gram-selector-keywords").body).toMatchObject([
      { classSelector: { name: "true" } },
      { classSelector: { name: "false" } },
    ])
  })

  it("keeps sections open across statements, closes them at leaves, and never parents under a leaf", () => {
    expect(diagramOf("db-leaf-closes-open-sections").body).toMatchObject([
      {
        name: { value: "A" },
        children: [{ name: { value: "B" }, children: [] }],
      },
      { name: { value: "L" } },
      { name: { value: "C" } },
    ])
    expect(diagramOf("db-leaf-not-parent").body).toMatchObject([
      {
        name: { value: "A" },
        children: [{ name: { value: "B" } }, { name: { value: "C" } }],
      },
      { name: { value: "D" } },
      { name: { value: "E" } },
    ])
    expect(
      diagramOf("gram-nesting-statement-before-section").body,
    ).toMatchObject([
      {
        children: [
          {
            range: [12, 41],
            statementsBefore: [
              { type: "TreemapAccTitleStatement", range: [12, 25] },
            ],
            children: [{ name: { value: "C" }, range: [36, 41] }],
          },
        ],
      },
    ])
    expect(
      diagramOf("gram-nesting-statement-before-ancestor-child").body,
    ).toMatchObject([
      {
        children: [
          { range: [16, 31] },
          {
            range: [32, 66],
            statementsBefore: [
              { type: "TreemapClassDefStatement", range: [32, 53] },
            ],
          },
        ],
      },
    ])
    expect(
      diagramOf("gram-nesting-statement-after-last-child").body,
    ).toMatchObject([
      { range: [8, 19], children: [{ range: [14, 19] }] },
      { type: "TreemapClassDefStatement", range: [20, 41] },
    ])
    for (const [name, type] of [
      ["gram-nesting-title-before-child", "TreemapTitleStatement"],
      ["gram-nesting-acctitle-before-child", "TreemapAccTitleStatement"],
      ["gram-nesting-description-before-child", "TreemapAccDescrStatement"],
      ["gram-nesting-block-before-child", "TreemapAccDescrBlockStatement"],
      ["gram-nesting-empty-class-before-child", "TreemapClassDefStatement"],
      ["gram-nesting-statements-directive-inline", "TreemapClassDefStatement"],
      ["gram-nesting-statements-directive-line", "TreemapClassDefStatement"],
      ["gram-nesting-statements-comment-line", "TreemapClassDefStatement"],
      ["gram-nesting-statements-empty-line", "TreemapClassDefStatement"],
      ["gram-nesting-statements-comment-ls", "TreemapClassDefStatement"],
      ["gram-nesting-statements-comment-ps", "TreemapClassDefStatement"],
    ]) {
      const section = diagramOf(name).body[0]
      if (section.type !== "TreemapSection")
        throw new Error("Expected a section")
      const child = section.children[0]
      expect(child.statementsBefore).toMatchObject([{ type }])
      expect(child.range[0]).toBe(child.statementsBefore[0].range[0])
      expect(section.range[1]).toBe(child.range[1])
      expect(child).not.toHaveProperty("children")
    }
    expect(visitorKeys.TreemapSection).toEqual([
      "statementsBefore",
      "name",
      "classSelector",
      "children",
    ])
    expect(visitorKeys.TreemapLeaf).toEqual([
      "statementsBefore",
      "name",
      "value",
      "classSelector",
    ])
  })

  it("splits authored atoms and keeps indentation as a separate tokenless unit", () => {
    const fixture = fixtureOf("gram-written-tree")
    const units = treemapLexingOf(fixture.input)!.units
    expect(
      units
        .filter((unit) => unit.name === "indentation")
        .map((unit) => [unit.text, unit.significantRange]),
    ).toEqual([
      ["  ", null],
      ["  ", null],
      ["  ", null],
    ])
    const tokens = parse(fixture.input).tokens.map((token) => [
      token.type,
      token.value,
    ])
    for (const value of [
      "treemap-beta",
      "title",
      "classDef",
      "accTitle",
      "accDescr",
    ])
      expect(tokens).toContainEqual(["Keyword", value])
    for (const value of [":::", ":", ",", ";", "{", "}"])
      expect(tokens).toContainEqual(["Punctuator", value])
    expect(tokens).toContainEqual(["Numeric", "1,234.5"])
    expect(tokens).toContainEqual(["String", "'Right'"])
    expect(tokens).toContainEqual(["RawText", "fill:red,color:blue"])
  })

  it("retains second-scan forms as comments and consumes passed bare-line trivia once", () => {
    for (const name of [
      "detect-second-scan-single-line-comment",
      "detect-retained-bare-lf-control",
      "div-retained-before-bare-unicode-line",
      "div-bare-retained-unicode-header",
      "div-retained-bare-ascii-line",
      "div-bare-retained-ascii-header",
    ]) {
      const root = parse(fixtureOf(name).input)
      expect(root.directives).toHaveLength(1)
      expect(root.comments[0]).toMatchObject({ mark: "%%" })
      expect(root.body.type).toBe("TreemapDiagram")
    }
    const fixture = fixtureOf("comment-second-scan-shaped-body")
    expect(diagramOf(fixture.name).body).toMatchObject([
      { name: { value: "A" } },
      { name: { value: "C" } },
    ])
    expect(parse(fixture.input).comments[0].value).toContain('"B":2')
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
        expect(root.diagramType).toBe("treemap")
        expectCoverage(fixture.input, root)
        expectDb(fixture, root)
      }
    })
  }
})
