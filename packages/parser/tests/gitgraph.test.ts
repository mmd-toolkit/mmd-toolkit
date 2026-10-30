import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { GitgraphDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"

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
})
