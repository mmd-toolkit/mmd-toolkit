import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import { cssSupportsColor, loadFixture } from "../src/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { axis, buildRadar, curve, entry, group, option } from "./radar-built.ts"
import { common, ignored } from "./statement-tree-built.ts"

/** Read explicit authored components through the public builder and shared embedded values. */
function summary(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  embedded: EmbeddedValues = {
    config: { securityLevel: "strict" },
    title: undefined,
    dataBlockEffects: [],
  },
) {
  const { tree } = buildRadar(source, make)
  return dbFromTree(
    source,
    tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("radar Db from hand-built trees", () => {
  it("publishes the default options and empty collections", () => {
    expect(summary("radar-beta", () => [])).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      axes: [],
      curves: [],
      options: {
        showLegend: true,
        ticks: 5,
        max: null,
        min: 0,
        graticule: "circle",
      },
    })
  })

  it("publishes forward axes first, resolving the first named match in axis order", () => {
    const result = summary(
      'radar-beta\ncurve c[""]{A:2,B:0,B:9,Z:7},c{4,5,6}\naxis B["Bee"],A,B',
      (kit) => [
        group(kit, "Curve", [
          () =>
            curve(
              kit,
              "c",
              [
                () => entry(kit, "2", "A"),
                () => entry(kit, "0", "B"),
                () => entry(kit, "9", "B"),
                () => entry(kit, "7", "Z"),
              ],
              '""',
            ),
          () =>
            curve(kit, "c", [
              () => entry(kit, "4"),
              () => entry(kit, "5"),
              () => entry(kit, "6"),
            ]),
        ]),
        group(kit, "Axis", [
          () => axis(kit, "B", '"Bee"'),
          () => axis(kit, "A"),
          () => axis(kit, "B"),
        ]),
      ],
    )
    expect(result.axes).toEqual([
      { label: "Bee" },
      { label: "A" },
      { label: "B" },
    ])
    expect(result.curves).toEqual([
      { label: "", entries: [0, 2, 0] },
      { label: "c", entries: [4, 5, 6] },
    ])
  })

  it("keeps prototype-shaped names and positional entries without axes", () => {
    expect(
      summary("radar-beta\ncurve constructor{1,2}", (kit) => [
        group(kit, "Curve", [
          () =>
            curve(kit, "constructor", [
              () => entry(kit, "1"),
              () => entry(kit, "2"),
            ]),
        ]),
      ]).curves,
    ).toEqual([{ label: "constructor", entries: [1, 2] }])
    expect(
      summary(
        "radar-beta\naxis __proto__\ncurve constructor{__proto__ 3}",
        (kit) => [
          group(kit, "Axis", [() => axis(kit, "__proto__")]),
          group(kit, "Curve", [
            () =>
              curve(kit, "constructor", [
                () => entry(kit, "3", "__proto__", false),
              ]),
          ]),
        ],
      ).curves,
    ).toEqual([{ label: "constructor", entries: [3] }])
  })

  it("selects the last option, retains zero and fractions, and caps ticks", () => {
    expect(
      summary(
        "radar-beta\nticks 33,ticks 2.5,max 9,min 12,showLegend true,graticule circle\nticks 0,showLegend false,graticule polygon",
        (kit) => [
          group(kit, "Options", [
            () => option(kit, "ticks", "33"),
            () => option(kit, "ticks", "2.5"),
            () => option(kit, "max", "9"),
            () => option(kit, "min", "12"),
            () => option(kit, "showLegend", "true"),
            () => option(kit, "graticule", "circle"),
          ]),
          group(kit, "Options", [
            () => option(kit, "ticks", "0"),
            () => option(kit, "showLegend", "false"),
            () => option(kit, "graticule", "polygon"),
          ]),
        ],
      ).options,
    ).toEqual({
      showLegend: false,
      ticks: 0,
      max: 9,
      min: 12,
      graticule: "polygon",
    })
    expect(
      summary("radar-beta\nticks 32.5", (kit) => [
        group(kit, "Options", [() => option(kit, "ticks", "32.5")]),
      ]).options,
    ).toMatchObject({ ticks: 32 })
    expect(
      summary("radar-beta\nticks 2.5", (kit) => [
        group(kit, "Options", [() => option(kit, "ticks", "2.5")]),
      ]).options,
    ).toMatchObject({ ticks: 2.5 })
  })

  it("reads converted labels and decodes escapes without sanitizing labels", () => {
    const result = summary(
      'radar-beta\naxis A["a\\n\\q\\u0041\\0"],B["#65;"],C["<i>x</i>"]\ncurve c[\'a\\\'b\']{1}',
      (kit) => [
        group(kit, "Axis", [
          () => axis(kit, "A", '"a\\n\\q\\u0041\\0"'),
          () => axis(kit, "B", '"#65;"'),
          () => axis(kit, "C", '"<i>x</i>"'),
        ]),
        group(kit, "Curve", [
          () => curve(kit, "c", [() => entry(kit, "1")], "'a\\'b'"),
        ]),
      ],
      {
        config: { securityLevel: "other", htmlLabels: true },
        title: undefined,
        dataBlockEffects: [],
      },
    )
    expect(result.axes).toEqual([
      { label: "a\nqu0041\0" },
      { label: "ﬂ°°65¶ß" },
      { label: "<i>x</i>" },
    ])
    expect(result.curves).toEqual([{ label: "a'b", entries: [1] }])
  })

  it("lets empty final common assignments suppress earlier body values", () => {
    expect(
      summary(
        "radar-beta\ntitle First\ntitle\naccTitle: A\naccTitle:\naccDescr { B }\naccDescr {}",
        (kit) => [
          common(kit, "Radar", "Title", "First"),
          common(kit, "Radar", "Title", null),
          common(kit, "Radar", "AccTitle", " A"),
          common(kit, "Radar", "AccTitle", null),
          common(kit, "Radar", "AccDescrBlock", "B"),
          common(kit, "Radar", "AccDescrBlock", null),
        ],
        { config: {}, title: "Frontmatter", dataBlockEffects: [] },
      ),
    ).toMatchObject({ title: "Frontmatter", accTitle: "", accDescr: "" })
  })

  it("uses shared common whitespace, description and security readings", () => {
    expect(
      summary(
        "radar-beta\ntitle  T  U\naccTitle: <i>A</i>\naccDescr { A\r\n  B\r\n\r\n C }",
        (kit) => [
          common(kit, "Radar", "Title", " T  U"),
          common(kit, "Radar", "AccTitle", " <i>A</i>"),
          common(kit, "Radar", "AccDescrBlock", "A\r\n  B\r\n\r\n C"),
        ],
        {
          config: { securityLevel: "other", htmlLabels: true },
          title: undefined,
          dataBlockEffects: [],
        },
      ),
    ).toMatchObject({
      title: "T U",
      accTitle: "&lt;i&gt;A&lt;/i&gt;",
      accDescr: "A\nB\nC",
    })
  })

  it("leaves native properties and radar configuration out of Db options", () => {
    expect(
      summary(
        "radar-beta\n---\nticks: 9\n---",
        (kit) => [ignored(kit, "Radar", "---\nticks: 9\n---", "yaml-block")],
        {
          config: { radar: { ticks: 7, max: 20, showLegend: false } },
          title: undefined,
          dataBlockEffects: [],
        },
      ).options,
    ).toEqual({
      showLegend: true,
      ticks: 5,
      max: null,
      min: 0,
      graticule: "circle",
    })
  })

  it("records non-finite entries through the shared number convention", async () => {
    const fixture = await loadFixture("radar", "db-number-overflow")
    if (!fixture.expected.accepted)
      throw new Error("rejected fixed overflow fixture")
    const raw = fixture.input.slice(
      fixture.input.indexOf("{") + 1,
      fixture.input.indexOf("}"),
    )
    expect(
      summary(fixture.input, (kit) => [
        group(kit, "Axis", [() => axis(kit, "A")]),
        group(kit, "Curve", [() => curve(kit, "c", [() => entry(kit, raw)])]),
      ]),
    ).toEqual(fixture.expected.db)
  })
})
