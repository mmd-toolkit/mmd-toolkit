import { describe, expect, it } from "vitest"
import { loadFixtures } from "@mmd-toolkit/tests"
import type { RadarDiagram } from "../src/index.ts"
import { parse } from "../src/index.ts"

describe("radar fixtures", async () => {
  const fixtures = [
    ...(await loadFixtures("radar")),
    ...(await loadFixtures("common")).filter((fixture) =>
      fixture.name.includes("radar"),
    ),
  ]

  /** Structure assertions take only fixed corpus inputs. */
  function diagramOf(name: string): RadarDiagram {
    const fixture = fixtures.find((item) => item.name === name)
    if (fixture === undefined) throw new Error(`no fixture ${name}`)
    const root = parse(fixture.input)
    if (root.body.type !== "RadarDiagram") throw new Error("no radar diagram")
    return root.body
  }

  it("keeps declaration groups, both entry forms, optional labels and all option types", () => {
    expect(diagramOf("gram-written-tree").body).toMatchObject([
      {
        type: "RadarAxisStatement",
        axes: [
          {
            name: { name: "A" },
            label: { raw: '"Axis A"', value: "Axis A", closed: true },
          },
          { name: { name: "B" }, label: null },
        ],
      },
      {
        type: "RadarCurveStatement",
        curves: [
          {
            name: { name: "c" },
            label: { raw: "'Curve'" },
            entries: [
              {
                type: "RadarNamedEntry",
                axis: { name: "A" },
                value: { raw: "1", value: 1 },
              },
              {
                type: "RadarNamedEntry",
                axis: { name: "B" },
                value: { raw: "2", value: 2 },
              },
              {
                type: "RadarNamedEntry",
                axis: { name: "Z" },
                value: { raw: "9", value: 9 },
              },
            ],
          },
          {
            name: { name: "d" },
            label: null,
            entries: [
              { type: "RadarNumberEntry", value: { raw: "3", value: 3 } },
              { type: "RadarNumberEntry", value: { raw: "4", value: 4 } },
            ],
          },
        ],
      },
      {
        type: "RadarOptionsStatement",
        options: [
          { type: "RadarShowLegendOption", value: "false" },
          { type: "RadarTicksOption", value: { raw: "33", value: 33 } },
          { type: "RadarMaxOption", value: { raw: "10", value: 10 } },
          { type: "RadarMinOption", value: { raw: "0", value: 0 } },
          { type: "RadarGraticuleOption", value: "polygon" },
        ],
      },
      { type: "RadarTitleStatement", value: { value: "Radar" } },
      { type: "RadarAccTitleStatement", value: { value: " Axis comparison" } },
      { type: "RadarAccDescrStatement", value: { value: " Short" } },
      { type: "RadarAccDescrBlockStatement", value: { value: "Long" } },
    ])
    expect(diagramOf("db-options-repeat").body).toHaveLength(2)
    expect(diagramOf("db-empty-labels").body).toMatchObject([
      {
        axes: [
          { label: { value: "", raw: '""' } },
          { label: { value: "", raw: "''" } },
        ],
      },
      { curves: [{ label: { value: "" } }, { label: { value: "" } }] },
    ])
  })

  it("assigns each hidden form to its specified header, member, label or entry gap", () => {
    expect(
      diagramOf("detect-yaml-before-secondscan-native").textBeforeHeader,
    ).toMatchObject([{ kind: "yaml-block" }, { kind: "directive" }])
    expect(diagramOf("header-colon-hidden")).toMatchObject({
      textBeforeHeader: [],
      textBeforeColon: [{ kind: "directive" }],
    })
    expect(diagramOf("header-colon-yaml")).toMatchObject({
      textBeforeColon: [],
      body: [
        { type: "RadarIgnoredText", kind: "yaml-block" },
        { type: "RadarAxisStatement" },
      ],
    })
    expect(diagramOf("lex-hidden-axis-comma").body).toMatchObject([
      {
        axes: [
          {
            textBefore: [],
            textBeforeLabel: [],
            textBeforeLabelValue: [],
            label: null,
            textBeforeLabelClose: [],
            textAfter: [{ kind: "directive" }],
          },
          { textBefore: [{ kind: "directive" }], textAfter: [] },
        ],
      },
    ])
    expect(diagramOf("lex-curve-label-hidden-gaps").body).toMatchObject([
      {
        curves: [
          {
            textBeforeLabel: [{ kind: "directive" }],
            textBeforeLabelValue: [{ kind: "directive" }],
            textBeforeLabelClose: [{ kind: "directive" }],
            textBeforeEntries: [{ kind: "directive" }],
          },
        ],
      },
    ])
    for (const name of ["lex-hidden-curve-comma", "lex-hidden-option-comma"]) {
      const statement = diagramOf(name).body[0]
      const members =
        statement.type === "RadarCurveStatement"
          ? statement.curves
          : statement.type === "RadarOptionsStatement"
            ? statement.options
            : []
      expect(members).toMatchObject([
        { textBefore: [], textAfter: [{ kind: "directive" }] },
        { textBefore: [{ kind: "directive" }], textAfter: [] },
      ])
    }
    for (const name of [
      "lex-number-entry-hidden-across-lines",
      "lex-named-entry-hidden-across-lines",
    ]) {
      const statement = diagramOf(name).body.find(
        (item) => item.type === "RadarCurveStatement",
      )!
      expect(statement.curves[0].entries).toMatchObject([
        {
          textBefore: [{ value: "%%{!}%%" }],
          textAfter: [{ value: "%%{?}%%" }],
        },
      ])
    }
    for (const [name, beforeColon, beforeValue] of [
      ["lex-hidden-detailed-before-colon", [{ kind: "directive" }], []],
      ["lex-hidden-detailed-no-colon", [], [{ kind: "directive" }]],
    ] as const) {
      const statement = diagramOf(name).body.find(
        (item) => item.type === "RadarCurveStatement",
      )!
      expect(statement.curves[0].entries[0]).toMatchObject({
        textBeforeColon: beforeColon,
        textBeforeValue: beforeValue,
      })
    }
    expect(diagramOf("lex-hidden-after-visible-eol").body).toMatchObject([
      { axes: [{ textAfter: [] }] },
      { type: "RadarIgnoredText" },
      { type: "RadarCurveStatement" },
    ])
  })

  it("separates authored punctuation and assigns token kinds before conversions", () => {
    const fixture = fixtures.find((item) => item.name === "gram-written-tree")!
    const tokens = parse(fixture.input).tokens.map((token) => [
      token.type,
      token.value,
    ])
    expect(tokens.slice(0, 2)).toEqual([
      ["Keyword", "radar-beta"],
      ["Punctuator", ":"],
    ])
    for (const spelling of [
      "axis",
      "curve",
      "showLegend",
      "false",
      "ticks",
      "max",
      "min",
      "graticule",
      "polygon",
      "title",
      "accTitle",
      "accDescr",
    ])
      expect(tokens).toContainEqual(["Keyword", spelling])
    for (const spelling of [":", ",", "[", "]", "{", "}"])
      expect(tokens).toContainEqual(["Punctuator", spelling])
    expect(tokens).toContainEqual(["Identifier", "Z"])
    expect(tokens).toContainEqual(["Numeric", "33"])
    expect(tokens).toContainEqual(["String", "'Curve'"])
    expect(tokens).toContainEqual(["RawText", " Axis comparison"])
    const hidden = fixtures.find(
      (item) => item.name === "lex-hidden-yaml-two-nonempty",
    )!
    expect(
      parse(hidden.input)
        .tokens.filter((token) => token.type === "RawText")
        .map((token) => token.value),
    ).toEqual(["---\nx\n---", "---\ny\n---"])
  })

  it("retains empty and repeated common values with their authored whitespace", () => {
    expect(diagramOf("common-repeat-empty").body).toMatchObject([
      { value: { value: "First" } },
      { value: null },
      { value: { value: " First" } },
      { value: null },
      { value: { value: " First" } },
      { value: null },
    ])
    expect(diagramOf("lex-common-title-one-space").body[0]).toMatchObject({
      value: null,
    })
    expect(diagramOf("lex-common-title-two-spaces").body[0]).toMatchObject({
      value: { value: " " },
    })
    expect(diagramOf("lex-common-empty-values").body).toMatchObject([
      { value: { value: " " } },
      { value: { value: "\t" } },
      { value: null },
    ])
  })

  it("keeps authored doubles, raw number spelling and source escapes", () => {
    const statement = diagramOf("db-number-leading-zero-decimal").body.find(
      (item) => item.type === "RadarCurveStatement",
    )!
    expect(statement.curves[0].entries[0].value).toMatchObject({
      raw: "00.5",
      value: 0.5,
    })
    const axis = diagramOf("lex-string-conversion").body[0]
    if (axis.type !== "RadarAxisStatement") throw new Error("no axes")
    expect(axis.axes[0].label?.value).toBe('a\\n\\t\\q\\u0041\\\\\\"')
  })
})
