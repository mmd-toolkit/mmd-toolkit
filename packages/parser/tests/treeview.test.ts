import { describe, expect, it } from "vitest"
import type { DbTreeRoot, Fixture } from "@mmd-toolkit/tests"
import { loadFixtures, dbFromTree, embeddedValuesOf } from "@mmd-toolkit/tests"
import type { Node, TreeviewDiagram, Root } from "../src/index.ts"
import { parse, ParseError, traverseNodes, visitorKeys } from "../src/index.ts"
import { isWhitespace } from "../src/character-classes.ts"
import { treeviewLexingOf } from "./helpers/reference-inputs.ts"

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
        ? text.slice(...entry.range).includes(entry.value)
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

/** Compare authored trees with each corpus reading's independently recorded Db. */
function expectDb(fixture: Fixture, root: Root): void {
  const reading = fixture.specified ?? fixture.expected
  if (!reading.accepted || reading.db === null) return
  const embedded = embeddedValuesOf(fixture, reading)
  if (embedded === undefined)
    throw new Error("Accepted treeview fixture lacks embedded values")
  expect(
    dbFromTree(
      fixture.input,
      JSON.parse(JSON.stringify(root)) as DbTreeRoot,
      embedded,
      () => {
        throw new Error("Treeview does not query CSS color support")
      },
    ),
  ).toEqual(reading.db)
}

describe("treeview fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("treeview")),
    ...(await loadFixtures("common")).filter((fixture) => {
      const reading = fixture.specified ?? fixture.expected
      return reading.accepted && reading.diagramType === "treeView"
    }),
  ]

  /** The corpus supplies all unit-test inputs. */
  function fixtureOf(name: string): Fixture {
    const fixture = fixtures.find((candidate) => candidate.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return fixture
  }

  /** Authored treeview body of a corpus case. */
  function diagramOf(name: string): TreeviewDiagram {
    const body = parse(fixtureOf(name).input).body
    if (body.type !== "TreeviewDiagram") throw new Error("no Treeview diagram")
    return body
  }

  it("keeps all common forms, repeated annotations, empty names and authored values", () => {
    const body = diagramOf("gram-written-tree").body
    expect(body.map((item) => item.type)).toEqual([
      "TreeviewTitleStatement",
      "TreeviewAccTitleStatement",
      "TreeviewAccDescrStatement",
      "TreeviewAccDescrBlockStatement",
      "TreeviewNode",
      "TreeviewNode",
      "TreeviewNode",
    ])
    expect(body.slice(0, 4)).toMatchObject([
      { prefix: null, value: { value: " Tree " } },
      { prefix: null, value: { value: "  Access " } },
      { prefix: null, value: { value: " Line " } },
      {
        prefix: null,
        textBeforeOpen: [],
        value: { value: "  Block\n  text  " },
      },
    ])
    expect(body[4]).toMatchObject({
      indent: 0,
      prefix: null,
      textBeforeName: [],
      name: { name: "root/" },
      annotations: [
        { type: "TreeviewClassAnnotation", name: { name: "first" } },
        { type: "TreeviewIconAnnotation", name: { name: "pack:file" } },
        { type: "TreeviewClassAnnotation", name: { name: "last" } },
        { type: "TreeviewIconAnnotation", name: null },
        {
          type: "TreeviewDescriptionAnnotation",
          value: { value: "  detail  " },
        },
      ],
    })
    expect(body[5]).toMatchObject({ indent: 2, name: { value: "child/ " } })
    expect(body[6]).toMatchObject({
      indent: 0,
      name: { value: "", raw: "''", closed: true },
    })
    expect(
      diagramOf("ast-common-whitespace-values").body.slice(0, 4),
    ).toMatchObject([
      { value: { value: " " } },
      { value: { value: " \t" } },
      { value: { value: " \t" } },
      { value: { value: " \t " } },
    ])
    expect(
      diagramOf("ast-common-removal-only-values").body.slice(0, 4),
    ).toMatchObject([
      { value: null },
      { value: null },
      { value: null },
      { value: null },
    ])
    expect(diagramOf("html-single").body[0]).toMatchObject({
      name: {
        type: "StringLiteral",
        value: "<b x=",
        raw: "'<b x=\"",
        closed: true,
      },
    })
  })

  it("assigns prefix indentation while keeping flat body order and source prefixes", () => {
    expect(diagramOf("box-written-tree").body).toMatchObject([
      {
        type: "TreeviewNode",
        indent: 0,
        prefix: null,
        name: { name: "root/" },
      },
      {
        type: "TreeviewNode",
        indent: 4,
        prefix: { value: "\u251c\u2500\u2500", marker: "\u251c" },
        name: { name: "src/" },
      },
      { type: "TreeviewIgnoredText", kind: "box-decoration", value: "\u2502" },
      {
        type: "TreeviewNode",
        indent: 8,
        prefix: { value: "\u2502   \u2514\u2500\u2500" },
        name: { value: "my file" },
      },
      {
        type: "TreeviewNode",
        indent: 4,
        prefix: { value: "\u2514\u2500\u2500" },
        name: { name: "other" },
      },
    ])
    expect(diagramOf("db-tabs-one-unit").body).toMatchObject([
      { indent: 0 },
      { indent: 1 },
      { indent: 1 },
      { indent: 2 },
      { indent: 2 },
    ])
    expect(diagramOf("box-column-nonbmp-discriminating").body).toMatchObject([
      { indent: 4 },
      { indent: 8 },
      { indent: 8 },
    ])
    const root = parse(fixtureOf("box-written-tree").input)
    const nested = diagramOf("box-written-tree").body[3]
    if (nested.type !== "TreeviewNode" || nested.prefix === null)
      throw new Error("Expected the nested branch prefix")
    const prefix = nested.prefix
    expect(
      root.tokens
        .filter(
          (token) =>
            token.range[0] >= prefix.range[0] &&
            token.range[1] <= prefix.range[1],
        )
        .map((token) => [token.type, token.value]),
    ).toEqual([["RawText", "\u2502   \u2514\u2500\u2500"]])
    expect(
      parse(fixtureOf("box-prefix-directive-column").input)
        .tokens.filter((token) => token.type === "RawText")
        .map((token) => token.value),
    ).toEqual([
      "\u251c\u2500\u2500",
      "first",
      "\u2502 ",
      "  \u2514\u2500\u2500",
      "second",
    ])
  })

  it("owns decorations in pending-name, annotation and block-opener gaps", () => {
    expect(diagramOf("box-decoration-pending-name-gap").body[1]).toMatchObject({
      indent: 1,
      prefix: null,
      textBeforeName: [{ value: "\u2502" }],
      name: { name: "other" },
    })
    expect(diagramOf("box-comment-indent-carry").body[1]).toMatchObject({
      indent: 4,
      prefix: { value: "\u251c\u2500\u2500" },
      textBeforeName: [{ value: "\u2502" }],
      name: { name: "child" },
    })
    expect(diagramOf("ast-annotation-prefixes").body[0]).toMatchObject({
      indent: 4,
      annotations: [
        {
          textBefore: [{ value: "\u2502" }],
          prefix: { value: "\u251c\u2500\u2500" },
          name: { name: "pack:file" },
        },
        {
          textBefore: [{ value: "\u2502" }],
          prefix: { value: "\u2514\u2500\u2500" },
          value: { value: " desc" },
        },
      ],
    })
    expect(
      diagramOf("box-prefix-common-block-two-prefixes").body[0],
    ).toMatchObject({
      prefix: { type: "TreeviewBranchPrefix" },
      textBeforeOpen: [{ type: "TreeviewBranchPrefix" }],
      value: { value: "B" },
    })
    expect(diagramOf("box-decoration-before-block-open").body[0]).toMatchObject(
      {
        textBeforeOpen: [{ value: "\u2502" }],
        value: { value: "B" },
      },
    )
    expect(diagramOf("box-decoration-trailing-body").body.at(-1)).toMatchObject(
      { type: "TreeviewIgnoredText" },
    )
  })

  it("keeps enclosed box forms in leaves and ignores prefix quotes and braces for closing", () => {
    expect(diagramOf("ast-prefix-inside-and-outside").body[0]).toMatchObject({
      prefix: { value: "\u251c\u2500\u2500" },
      name: { value: "one\n\u2502   \u2514\u2500\u2500 two" },
    })
    expect(diagramOf("box-block-decoration").body[0]).toMatchObject({
      textBeforeOpen: [],
      value: { value: "a\n\u2502\nb" },
    })
    expect(
      diagramOf("ast-decoration-internal-and-body").body.map((n) => n.type),
    ).toEqual([
      "TreeviewNode",
      "TreeviewNode",
      "TreeviewIgnoredText",
      "TreeviewNode",
    ])
    expect(diagramOf("box-trim-string-closing-quote").body[0]).toMatchObject({
      name: { type: "StringLiteral", closed: true },
    })
    expect(diagramOf("box-trim-block-closing-brace").body[0]).toMatchObject({
      type: "TreeviewAccDescrBlockStatement",
    })
  })

  it("reports box and lexical errors at their original source positions after decorations", () => {
    const empty = fixtureOf("box-empty-branch-after-decoration")
    try {
      parse(empty.input)
      throw new Error("expected empty-branch rejection")
    } catch (error) {
      if (!(error instanceof ParseError)) throw error
      expect(error.message).toBe("A treeview branch must have content")
      expect(error.loc.start.line).toBe(4)
      expect(empty.input.slice(...error.range)).toBe("\u2514\u2500\u2500")
    }
    const unclosed = fixtureOf("box-error-remap")
    try {
      parse(unclosed.input)
      throw new Error("expected unclosed-name rejection")
    } catch (error) {
      if (!(error instanceof ParseError)) throw error
      expect(error.message).toBe("Unexpected character")
      expect(error.loc.start.line).toBe(4)
      expect(unclosed.input.slice(...error.range)).toBe('"')
    }
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
      expect(root.body.type).toBe("TreeviewDiagram")
      expectCoverage(fixture.input, root)
      expectDb(fixture, root)
      const lexing = treeviewLexingOf(fixture.input)!
      expect(
        lexing.units.some(
          (unit) =>
            unit.name === "newline" ||
            unit.name === "yaml-block" ||
            unit.name === "directive",
        ),
      ).toBe(false)
      const forms: Node[] = []
      traverseNodes(root, {
        enterNode(node) {
          if (
            node.type === "TreeviewBranchPrefix" ||
            node.type === "TreeviewIgnoredText"
          )
            forms.push(node)
        },
        leaveNode() {
          /* Ownership is checked in source order on entry. */
        },
      })
      expect(forms.map((node) => node.range)).toEqual(
        lexing.units
          .filter(
            (unit) =>
              unit.name === "branch-prefix" || unit.name === "box-decoration",
          )
          .map((unit) => unit.significantRange),
      )
    })
})
