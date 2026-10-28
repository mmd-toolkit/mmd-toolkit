import { describe, expect, it } from "vitest"
import type { Fixture } from "@mmd-toolkit/tests"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { EventmodelingDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"
import { eventmodelingLexingOf } from "./helpers/reference-inputs.ts"

describe("eventmodeling fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("eventmodeling")),
    ...(await loadFixtures("common")).filter((f) =>
      f.name.includes("eventmodeling"),
    ),
  ]

  /** Corpus input shared with the syntax and authored-tree specifications. */
  function fixtureOf(name: string): Fixture {
    const fixture = fixtures.find((f) => f.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    return fixture
  }

  /** Authored body of a corpus case. */
  function diagramOf(name: string): EventmodelingDiagram {
    const body = parse(fixtureOf(name).input).body
    if (body.type !== "EventmodelingDiagram")
      throw new Error("no Eventmodeling diagram")
    return body
  }

  it("preserves all statement kinds, repeated sources, data references and inline data", () => {
    const body = diagramOf("gram-written-tree").body
    expect(body.map((node) => node.type)).toEqual([
      "EventmodelingAccTitleStatement",
      "EventmodelingTimeFrameStatement",
      "EventmodelingAccDescrStatement",
      "EventmodelingResetFrameStatement",
      "EventmodelingModelEntityStatement",
      "EventmodelingDataEntityStatement",
      "EventmodelingNoteStatement",
      "EventmodelingGwtStatement",
      "EventmodelingIgnoredText",
      "EventmodelingTimeFrameStatement",
      "EventmodelingAccDescrBlockStatement",
      "EventmodelingTitleStatement",
    ])
    expect(body[1]).toMatchObject({
      name: { name: "01" },
      modelEntityType: "evt",
      entityIdentifier: {
        head: { name: "Shop" },
        tail: [{ name: { name: "Bought" } }],
      },
      sourceFrames: [{ frame: { name: "02" } }, { frame: { name: "02" } }],
      dataReference: { name: { name: "D" } },
      data: { dataType: "json", value: { value: "x" } },
    })
    expect(body[6]).toMatchObject({
      sourceFrame: { name: "99" },
      data: { value: { value: "\n" } },
    })
    expect(body[7]).toMatchObject({
      sourceFrame: { name: "99" },
      given: {
        kind: "given",
        body: [
          { modelEntityType: "evt", entityIdentifier: { name: "Bought" } },
        ],
      },
      when: {
        kind: "when",
        body: [{ modelEntityType: "cmd", entityIdentifier: { name: "Buy" } }],
      },
      then: {
        kind: "then",
        body: [{ modelEntityType: "ui", entityIdentifier: { name: "Screen" } }],
      },
    })
    expect(body[10]).toMatchObject({ value: null })
  })

  it("assigns optional gaps to their following components and completed suffixes to body", () => {
    expect(diagramOf("lex-hidden-frame-optional-gaps").body).toMatchObject([
      {
        sourceFrames: [{ textBefore: [{ value: "---\na\n---" }] }],
        dataReference: { textBefore: [{ value: "---\nb\n---" }] },
        data: { textBefore: [{ value: "---\nc\n---" }] },
      },
    ])
    expect(diagramOf("lex-qualified-hidden-components").body).toMatchObject([
      {
        name: {
          head: { name: "A" },
          tail: [
            {
              textBeforeDot: [{ value: "---\nx\n---" }],
              textBeforeName: [{ value: "---\ny\n---" }],
              name: { name: "B" },
            },
          ],
        },
      },
    ])
    expect(
      diagramOf("hidden-yaml-after-frame").body.map((n) => n.type),
    ).toEqual([
      "EventmodelingTimeFrameStatement",
      "EventmodelingIgnoredText",
      "EventmodelingTimeFrameStatement",
    ])
    expect(
      diagramOf("lex-native-directive-object-eof").body.at(-1),
    ).toMatchObject({
      type: "EventmodelingIgnoredText",
      kind: "directive",
    })
  })

  it("owns required GWT, clause, item, reference and tag gaps independently", () => {
    expect(diagramOf("lex-hidden-gwt-required-gaps").body[0]).toMatchObject({
      textBeforeSourceFrame: [{ value: "---\ns\n---" }],
      given: { textBefore: [{ value: "%%{{x}}%%" }] },
      when: null,
    })
    expect(diagramOf("lex-hidden-gwt-items").body[0]).toMatchObject({
      given: {
        body: [{ textBefore: [] }, { textBefore: [{ value: "---\nx\n---" }] }],
      },
      then: { textBefore: [] },
    })
    expect(diagramOf("lex-hidden-gwt-clause").body[0]).toMatchObject({
      then: { textBefore: [{ value: "---\nx\n---" }] },
    })
    expect(diagramOf("lex-hidden-reference-name-close").body[0]).toMatchObject({
      dataReference: {
        textBeforeName: [{ value: "---\nx\n---" }],
        textBeforeClose: [{ value: "---\ny\n---" }],
      },
    })
    expect(diagramOf("lex-hidden-data-tag-gaps").body[0]).toMatchObject({
      data: {
        textBefore: [{ value: "---\na\n---" }],
        textBeforeDataType: [{ value: "---\nb\n---" }],
        textBeforeTypeClose: [{ value: "---\nc\n---" }],
        textBeforeValue: [{ value: "---\nd\n---" }],
      },
    })
  })

  it("keeps block spacing, earlier closing-looking lines and native comment payload boundaries", () => {
    expect(diagramOf("lex-block-adjacent-later-close").body[1]).toMatchObject({
      data: { value: { value: "\n}\ntf 99 evt Hidden\n" } },
    })
    expect(diagramOf("lex-common-block-whitespace-only").body[0]).toMatchObject(
      {
        value: { value: " \n\t " },
      },
    )
    const root = parse(fixtureOf("comment-native").input)
    expect(root.comments.map((c) => [c.mark, c.value])).toEqual([
      ["/*", " multi\nline "],
      ["/*", " middle "],
      ["//", " line"],
    ])
    expect(
      parse(fixtureOf("comment-block-close-mark-directive").input).comments[0],
    ).toMatchObject({
      mark: "/*",
      value: "c",
    })
    expect(
      parse(fixtureOf("comment-mark-directive").input).comments[0],
    ).toMatchObject({
      mark: "//",
      value: " c",
    })
  })

  it("splits common components without common EOL units or payload conversion", () => {
    const fixture = fixtureOf("gram-common-block-leading-directive")
    const tokens = parse(fixture.input).tokens.map((t) => [t.type, t.value])
    expect(tokens).toContainEqual(["Keyword", "accDescr"])
    expect(tokens).toContainEqual(["Punctuator", "{"])
    expect(tokens).toContainEqual(["Punctuator", "}"])
    const units = eventmodelingLexingOf(fixture.input)!.units
    expect(units.some((u) => u.name === "newline")).toBe(false)
    expect(diagramOf("gram-written-tree").body[0]).toMatchObject({
      value: { value: " Title" },
    })
  })
})
