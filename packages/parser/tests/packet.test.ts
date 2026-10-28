import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { PacketDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"

describe("packet fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("packet")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("packet"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): PacketDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "PacketDiagram") throw new Error("no packet diagram")
    return root.body
  }

  it("preserves the three authored block forms and their leaves", () => {
    expect(diagramOf("gram-mixed").body).toMatchObject([
      {
        type: "PacketRelativeBlockStatement",
        count: { raw: "2", value: 2 },
        label: { raw: '"two"', value: "two", closed: true },
      },
      { type: "PacketSingleBlockStatement", start: { raw: "2", value: 2 } },
      {
        type: "PacketRangeBlockStatement",
        start: { raw: "3" },
        end: { raw: "5" },
      },
    ])
    expect(diagramOf("db-row-split").body).toHaveLength(2)
    expect(diagramOf("gram-zero-range").body[0]).toMatchObject({
      type: "PacketRangeBlockStatement",
      start: { value: 0 },
      end: { value: 0 },
    })
  })

  it("owns complete hidden forms in header, interior, body and suffix gaps", () => {
    expect(
      diagramOf("detect-yaml-properties-ignored").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block" }])
    expect(
      diagramOf("detect-second-scan-directive").textBeforeHeader,
    ).toMatchObject([{ kind: "directive" }])
    expect(diagramOf("gram-hidden-range-gap-spaced").body[0]).toMatchObject({
      textBeforeDash: [{ kind: "directive" }],
      textBeforeEnd: [{ kind: "directive" }],
      textBeforeColon: [{ kind: "directive" }],
      textBeforeLabel: [],
    })
    expect(diagramOf("gram-single-hidden-gaps").body[0]).toMatchObject({
      textBeforeColon: [{ kind: "directive" }],
      textBeforeLabel: [{ kind: "directive" }],
    })
    expect(diagramOf("gram-hidden-yaml-gap").body[0]).toMatchObject({
      textBeforeCount: [{ kind: "yaml-block" }],
    })
    expect(diagramOf("lex-hidden-two-suffixes").body[0]).toMatchObject({
      textAfter: [{ kind: "directive" }, { kind: "directive" }],
    })
    expect(diagramOf("lex-hidden-after-visible-eol").body).toMatchObject([
      { type: "PacketSingleBlockStatement", textAfter: [] },
      { type: "PacketIgnoredText" },
      { type: "PacketSingleBlockStatement" },
    ])
  })

  it("keeps common-value padding, nulls, repetitions and authored quote spelling", () => {
    expect(diagramOf("lex-title-one-tab").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("lex-title-two-spaces").body[0]).toMatchObject({
      value: { type: "PacketLiteral", value: " " },
    })
    expect(diagramOf("acctitle-empty").body[0]).toMatchObject({ value: null })
    expect(diagramOf("accdescr-block-lines").body[0]).toMatchObject({
      value: { value: "A  B\n\n  C" },
    })
    expect(diagramOf("lex-description-directive-only").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("title-open-quote").body[0]).toMatchObject({
      value: { type: "PacketLiteral", value: '"open' },
    })
    expect(diagramOf("hidden-yaml-adjacent-later").body[0]).toMatchObject({
      value: "---\n---\n---",
    })
    expect(diagramOf("title-repeat-empty").body).toMatchObject([
      { value: { value: "First" } },
      { value: { value: "Second" } },
      { value: null },
    ])
  })
})
