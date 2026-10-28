import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { PieDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"

describe("pie fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("pie")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("pie"),
    ),
  ]

  /** Only fixed corpus inputs supply the structure assertions. */
  function diagramOf(name: string): PieDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "PieDiagram") throw new Error("no pie diagram")
    return root.body
  }

  it("keeps hidden forms in the specified header, section and body gaps", () => {
    expect(diagramOf("review-hidden-directive-before-showdata")).toMatchObject({
      showData: true,
      textBeforeHeader: [],
      textBeforeShowData: [{ kind: "directive", value: "%%{}%%" }],
    })
    expect(
      diagramOf("frontmatter-nonleading-comment").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block", value: "---\ntitle: Hidden\n---" }])
    expect(
      diagramOf("frontmatter-between-section-parts").body[0],
    ).toMatchObject({
      textBeforeColon: [],
      textBeforeValue: [
        { kind: "yaml-block", value: "---\nignored: yes\n---" },
      ],
      textAfter: [],
    })
    expect(diagramOf("lex-yaml-before-colon-two-blocks").body[0]).toMatchObject(
      { textBeforeColon: [{ kind: "yaml-block" }, { kind: "yaml-block" }] },
    )
    expect(
      diagramOf("lex-yaml-three-fences-before-value").body[0],
    ).toMatchObject({ textBeforeValue: [{ value: "---\n---\n---" }] })
    expect(diagramOf("gram-section-eof-hidden-yaml").body[0]).toMatchObject({
      textAfter: [{ kind: "yaml-block" }],
    })
    expect(diagramOf("frontmatter-after-header")).toMatchObject({
      showData: false,
      textBeforeShowData: [],
      body: [{ type: "PieIgnoredText" }, { type: "PieSectionStatement" }],
    })
    expect(diagramOf("lex-yaml-after-showdata-eof")).toMatchObject({
      showData: true,
      textBeforeShowData: [],
      body: [{ type: "PieIgnoredText" }],
    })
  })

  it("keeps line padding, nullable values, trimmed blocks and authored escapes", () => {
    expect(diagramOf("title-spaces").body[0]).toMatchObject({
      value: { value: "  A  B\t\tC  " },
    })
    expect(diagramOf("acctitle-eof").body[0]).toMatchObject({ value: null })
    expect(diagramOf("ast-title-tab-null-eof").body[0]).toMatchObject({
      value: null,
      range: [4, 9],
    })
    expect(
      diagramOf("review-acctitle-whitespace-final").body.at(-1),
    ).toMatchObject({ value: { value: " \t" } })
    expect(diagramOf("accdescr-block").body[0]).toMatchObject({
      value: { value: "A  B\n\n  C\t\tD" },
    })
    expect(
      diagramOf("gram-description-block-directive-only").body.at(-1),
    ).toMatchObject({ value: null })
    expect(diagramOf("label-single-quote").body[0]).toMatchObject({
      label: { type: "StringLiteral", closed: true },
    })
    expect(diagramOf("label-unknown-escapes").body[0]).toMatchObject({
      label: { value: "\\q \\0 \\u0041 \\x41 \\/" },
    })
  })

  it("retains every duplicate and validates converted double negativity", () => {
    expect(diagramOf("db-three-definitions").body).toHaveLength(5)
    const zero = diagramOf("number-negative-zero").body[0]
    if (zero.type !== "PieSectionStatement") throw new Error("no section")
    expect(Object.is(zero.value.value, -0)).toBe(true)
    const overflow = diagramOf("number-overflow").body[0]
    if (overflow.type !== "PieSectionStatement") throw new Error("no section")
    expect(overflow.value.value).toBe(Infinity)
    const underflow = diagramOf("review-number-negative-underflow-final")
      .body[0]
    if (underflow.type !== "PieSectionStatement") throw new Error("no section")
    expect(Object.is(underflow.value.value, -0)).toBe(true)
  })
})
