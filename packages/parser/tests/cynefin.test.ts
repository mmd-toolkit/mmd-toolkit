import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { CynefinDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"
import { cynefinLexingOf } from "./helpers/reference-inputs.ts"

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
})
