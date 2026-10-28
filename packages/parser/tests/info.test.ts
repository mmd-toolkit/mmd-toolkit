import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { InfoDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"

describe("info fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("info")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("info"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): InfoDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "InfoDiagram") throw new Error("no info diagram")
    return root.body
  }

  it("keeps retained forms in the specified header, flag, body and suffix gaps", () => {
    expect(diagramOf("lex-flag-hidden-two")).toMatchObject({
      showInfo: true,
      textBeforeHeader: [],
      textBeforeShowInfo: [
        { kind: "directive", value: "%%{}%%" },
        { kind: "yaml-block", value: "---\nx: y\n---" },
      ],
      body: [],
    })
    expect(
      diagramOf("frontmatter-nonleading-comment").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block", value: "---\ntitle: Ignored\n---" }])
    expect(
      diagramOf("detect-second-scan-directive").textBeforeHeader,
    ).toMatchObject([{ kind: "directive" }])
    expect(diagramOf("lex-hidden-without-flag")).toMatchObject({
      showInfo: false,
      textBeforeShowInfo: [],
      body: [{ type: "InfoIgnoredText" }, { type: "InfoTitleStatement" }],
    })
    expect(diagramOf("lex-hidden-tail-two").body[0]).toMatchObject({
      textAfter: [{ kind: "directive" }, { kind: "yaml-block" }],
    })
    expect(diagramOf("lex-hidden-after-visible-eol").body).toMatchObject([
      { type: "InfoTitleStatement", textAfter: [] },
      { type: "InfoIgnoredText" },
      { type: "InfoIgnoredText" },
      { type: "InfoAccTitleStatement" },
    ])
  })

  it("keeps padding, null values, repeated occurrences and first-close block content", () => {
    expect(diagramOf("title-tabs").body[0]).toMatchObject({
      value: { type: "InfoLiteral", value: " A\t\tB \t" },
    })
    expect(diagramOf("lex-title-one-tab").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("lex-title-two-spaces").body[0]).toMatchObject({
      value: { value: " " },
    })
    expect(diagramOf("acctitle-empty").body[0]).toMatchObject({ value: null })
    expect(diagramOf("accdescr-line-repeat").body).toMatchObject([
      { value: { value: " A" } },
      { value: { value: " B" } },
      { value: null },
    ])
    expect(diagramOf("accdescr-block-lines").body[0]).toMatchObject({
      value: { value: "A  B\n\n  C" },
    })
    expect(diagramOf("lex-block-directive-only").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("title-open-quote").body[0]).toMatchObject({
      value: { type: "InfoLiteral", value: '"unfinished' },
    })
    expect(
      diagramOf("lex-yaml-three-fences").textBeforeShowInfo[0],
    ).toMatchObject({
      type: "InfoIgnoredText",
      value: "---\n---\n---",
    })
  })

  // known-divergences/embedded-data-opaque.md: mermaid.js rejects these
  // inputs for their frontmatter, whose data the specification keeps
  // opaque, and the tree keeps that frontmatter.
  it.each([
    "div-frontmatter-invalid-yaml",
    "div-frontmatter-html-invalid-yaml",
  ])("keeps the frontmatter of %s", (name) => {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    expect(fixture.knownDivergence).toBe("embedded-data-opaque")
    expect(fixture.expected.accepted).toBe(false)
    expect(parse(fixture.input).frontmatter).not.toBeNull()
  })
})
