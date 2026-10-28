import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { ArchitectureDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"

describe("architecture fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("architecture")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("architecture"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): ArchitectureDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "ArchitectureDiagram")
      throw new Error("no architecture diagram")
    return root.body
  }

  it("preserves source order, authored references, icons and arrow components", () => {
    expect(diagramOf("gram-written-tree").body).toMatchObject([
      {
        type: "ArchitectureGroupStatement",
        id: { name: "g" },
        icon: { name: "cloud" },
        title: { kind: "text", value: "Group" },
      },
      {
        type: "ArchitectureServiceStatement",
        icon: { type: "StringLiteral", raw: '"A"', value: "A", closed: true },
        in: { name: "g" },
      },
      {
        type: "ArchitectureJunctionStatement",
        id: { name: "j" },
        in: { name: "g" },
      },
      {
        type: "ArchitectureEdgeStatement",
        lhsId: { name: "a" },
        lhsGroup: false,
        rhsId: { name: "j" },
        rhsGroup: false,
        arrow: {
          value: ":R <-[link]-> L:",
          startDirection: "R",
          startMarker: "arrow",
          line: "solid",
          title: { kind: "text", value: "link" },
          endMarker: "arrow",
          endDirection: "L",
        },
      },
      {
        type: "ArchitectureAlignmentStatement",
        direction: "row",
        members: [{ id: { name: "a" } }, { id: { name: "j" } }],
      },
    ])
    expect(diagramOf("db-mixed").body.map((item) => item.type)).toEqual([
      "ArchitectureAccTitleStatement",
      "ArchitectureAccDescrBlockStatement",
      "ArchitectureJunctionStatement",
      "ArchitectureServiceStatement",
      "ArchitectureGroupStatement",
      "ArchitectureGroupStatement",
      "ArchitectureServiceStatement",
      "ArchitectureEdgeStatement",
      "ArchitectureEdgeStatement",
      "ArchitectureAlignmentStatement",
      "ArchitectureAlignmentStatement",
    ])
  })

  it("owns hidden forms in every present gap and leaves absent component gaps empty", () => {
    expect(
      diagramOf("detect-retained-before-second-scan").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block" }, { kind: "directive" }])
    const body = diagramOf("hidden-directive-unit-gaps").body
    expect(body).toMatchObject([
      { type: "ArchitectureIgnoredText", kind: "directive" },
      {
        textBeforeId: [{ kind: "directive" }],
        textBeforeIcon: [{ kind: "directive" }],
        textBeforeTitle: [{ kind: "directive" }],
        textBeforeIn: [],
        textBeforeParent: [],
        textAfter: [],
      },
      {
        textBeforeId: [{ kind: "directive" }],
        textBeforeIcon: [{ kind: "directive" }],
        textBeforeTitle: [{ kind: "directive" }],
        textBeforeIn: [{ kind: "directive" }],
        textBeforeParent: [{ kind: "directive" }],
      },
      {
        textBeforeId: [{ kind: "directive" }],
        textBeforeIn: [{ kind: "directive" }],
        textBeforeParent: [{ kind: "directive" }],
      },
      {
        textBeforeLhsGroup: [],
        textBeforeArrow: [{ kind: "directive" }],
        textBeforeRhsId: [{ kind: "directive" }],
        textBeforeRhsGroup: [],
        arrow: {
          textBeforeStartDirection: [{ kind: "directive" }],
          textBeforeStartMarker: [{ kind: "directive" }],
          textBeforeLine: [{ kind: "directive" }],
          textBeforeTitle: [{ kind: "directive" }],
          textBeforeEndDash: [{ kind: "directive" }],
          textBeforeEndMarker: [{ kind: "directive" }],
          textBeforeEndDirection: [{ kind: "directive" }],
          textBeforeEndColon: [{ kind: "directive" }],
        },
      },
      {
        textBeforeDirection: [{ kind: "directive" }],
        members: [
          { textBeforeId: [{ kind: "directive" }] },
          { textBeforeId: [{ kind: "directive" }] },
        ],
      },
    ])
    expect(diagramOf("lex-hidden-two-suffixes").body[0]).toMatchObject({
      textAfter: [{ kind: "directive" }, { kind: "directive" }],
    })
    expect(diagramOf("lex-hidden-after-visible-eol").body).toMatchObject([
      { textAfter: [] },
      { type: "ArchitectureIgnoredText" },
      { type: "ArchitectureServiceStatement" },
    ])
  })

  it("keeps label kinds from lexical alternatives and preserves authored content", () => {
    expect(diagramOf("lex-title-padded-quotes").body[0]).toMatchObject({
      title: { kind: "text", value: '  "A\\nB"  ' },
    })
    expect(
      diagramOf("lex-title-unclosed-quote-with-close").body[0],
    ).toMatchObject({ title: { kind: "text", value: '"open' } })
    expect(diagramOf("lex-title-quoted-brackets").body[0]).toMatchObject({
      title: { kind: "string", value: "[x]" },
    })
    expect(diagramOf("lex-title-one-space-null").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("lex-title-two-spaces-literal").body[0]).toMatchObject({
      value: { type: "ArchitectureLiteral", value: " " },
    })
    expect(
      diagramOf("common-description-block-directive").body[0],
    ).toMatchObject({ value: { value: "A\n\nB" } })
  })

  it("separates composite icon/modifier components and keeps double dash indivisible", () => {
    for (const name of [
      "directive-icon-delimiters",
      "directive-group-delimiters",
      "end-edge-eof",
    ]) {
      const fixture = fixtures.find((item) => item.name === name)!
      const root = parse(fixture.input)
      const spellings = root.tokens
        .filter((token) => token.type !== "Directive")
        .map((token) => [token.type, token.value])
      if (name === "directive-icon-delimiters")
        expect(spellings).toContainEqual(["Identifier", "cloud"])
      if (name === "directive-group-delimiters")
        expect(spellings).toContainEqual(["Keyword", "group"])
      if (name === "end-edge-eof")
        expect(spellings).toContainEqual(["Punctuator", "--"])
      for (const delimiter of name === "directive-icon-delimiters"
        ? ["(", ")"]
        : name === "directive-group-delimiters"
          ? ["{", "}"]
          : [":"])
        expect(spellings).toContainEqual(["Punctuator", delimiter])
    }
  })
})
