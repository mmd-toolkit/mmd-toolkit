import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import { cssSupportsColor, loadFixtures } from "../src/index.ts"
import { checkTree } from "../src/check-tree/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import { buildTreemap, classDef, common, row } from "./treemap-built.ts"

/** An accepted hand-built tree and the shared configuration it reads. */
function summary(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  embedded: EmbeddedValues = {
    config: { securityLevel: "strict" },
    title: undefined,
    dataBlockEffects: [],
  },
) {
  const { tree } = buildTreemap(source, make)
  expect(checkTree(source, tree)).toEqual([])
  return dbFromTree(
    source,
    tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("treemap Db from hand-built trees", () => {
  it("publishes empty defaults", () => {
    expect(summary("treemap", () => [])).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      nodes: [],
      classDefs: [],
    })
  })

  it("pops sections for every row, with leaves never entering the parent stack", () => {
    const result = summary(
      'treemap\n"A"\n  "B"\n    "x":2\n "y":3\n   "z":4\n"end"',
      (kit) => [
        row(kit, 0, '"A"'),
        row(kit, 2, '"B"'),
        row(kit, 4, '"x"', "2"),
        row(kit, 1, '"y"', "3"),
        row(kit, 3, '"z"', "4"),
        row(kit, 0, '"end"'),
      ],
    )
    expect(result.nodes).toEqual([
      {
        name: "A",
        children: [
          { name: "B", children: [{ name: "x", value: 2 }] },
          { name: "y", value: 3 },
          { name: "z", value: 4 },
        ],
      },
      { name: "end", children: [] },
    ])
  })

  it("keeps duplicate and empty names, initial indentation and unresolved selectors", () => {
    expect(
      summary(
        'treemap\n  "":::missing\n   "same":0\n   "same":1\n ""',
        (kit) => [
          row(kit, 2, '""', null, "missing"),
          row(kit, 3, '"same"', "0"),
          row(kit, 3, '"same"', "1"),
          row(kit, 1, '""'),
        ],
      ).nodes,
    ).toEqual([
      {
        name: "",
        classSelector: "missing",
        children: [
          { name: "same", value: 0 },
          { name: "same", value: 1 },
        ],
      },
      { name: "", children: [] },
    ])
  })

  it("uses trailing whitespace as the next row's indentation", () => {
    expect(
      summary('treemap\n"A" \n"b":1\t\n"c":2', (kit) => [
        row(kit, 0, '"A"'),
        row(kit, 1, '"b"', "1"),
        row(kit, 1, '"c"', "2"),
      ]).nodes,
    ).toEqual([
      {
        name: "A",
        children: [
          { name: "b", value: 1 },
          { name: "c", value: 2 },
        ],
      },
    ])
  })

  it("leaves the parent stack unchanged across class definitions and common forms", () => {
    expect(
      summary(
        'treemap\n"A"\nclassDef aa fill:red;\n title T\n  "b":1:::aa',
        (kit) => [
          row(kit, 0, '"A"'),
          classDef(kit, 0, "aa", "fill:red"),
          common(kit, "Title", "T"),
          row(kit, 2, '"b"', "1", "aa"),
        ],
      ).nodes,
    ).toEqual([
      { name: "A", children: [{ name: "b", value: 1, classSelector: "aa" }] },
    ])
  })

  it("merges styles in first-definition order, retaining leading whitespace and empty entries", () => {
    const result = summary(
      "treemap\nclassDef __proto__ fill:rgb(1\\,2\\,3), color:red ,;\nclassDef unused;\nclassDef __proto__ ,stroke:black  ;\nclassDef __proto__;",
      (kit) => [
        classDef(kit, 0, "__proto__", "fill:rgb(1\\,2\\,3), color:red ,"),
        classDef(kit, 0, "unused", null),
        classDef(kit, 0, "__proto__", ",stroke:black  "),
        classDef(kit, 0, "__proto__", null),
      ],
    )
    expect(result.classDefs).toEqual([
      {
        id: "__proto__",
        styles: ["fill:rgb(1,2,3)", " color:red", "", "", "stroke:black", ""],
      },
      { id: "unused", styles: [""] },
    ])
  })

  it("restores authored marker groups before splitting class styles", async () => {
    const fixtures = await loadFixtures("treemap")
    const cases = [
      { name: "db-class-style-marker", style: "fill:a§§§b" },
      { name: "db-class-style-marker-four", style: "fill:a§§§§b" },
      { name: "db-class-style-marker-escaped-comma", style: "fill:§§\\,x" },
    ]
    for (const { name, style } of cases) {
      const fixture = fixtures.find((entry) => entry.name === name)
      if (fixture === undefined) throw new Error(`no fixture ${name}`)
      if (!fixture.expected.accepted) throw new Error(`fixture ${name} rejects`)
      expect(
        summary(fixture.input, (kit) => [classDef(kit, 0, "ab", style, false)]),
      ).toEqual(fixture.expected.db)
    }
  })

  it("converts comma, underscore and repeated-dot spellings and records NaN as text", () => {
    expect(
      summary(
        'treemap\n"a":1,234.5\n"b":1_234\n"c":1.2.3\n"d":.\n"e":._',
        (kit) => [
          row(kit, 0, '"a"', "1,234.5"),
          row(kit, 0, '"b"', "1_234"),
          row(kit, 0, '"c"', "1.2.3"),
          row(kit, 0, '"d"', "."),
          row(kit, 0, '"e"', "._"),
        ],
      ).nodes,
    ).toEqual([
      { name: "a", value: 1234.5 },
      { name: "b", value: 1 },
      { name: "c", value: 1.2 },
      { name: "d", value: "NaN" },
      { name: "e", value: "NaN" },
    ])
  })

  it("keeps string padding, literal escapes and converted physical line feeds", () => {
    expect(
      summary('treemap\r\n" a\\n\r\nb ":1', (kit) => [
        row(kit, 0, '" a\\n\r\nb "', "1"),
      ]).nodes,
    ).toEqual([{ name: " a\\n\nb ", value: 1 }])
  })

  it("uses final common assignments, including empty assignments and the embedded title fallback", () => {
    const result = summary(
      "treemap\ntitle old\naccTitle: old\naccDescr: old\ntitle\naccTitle:\naccDescr {}",
      (kit) => [
        common(kit, "Title", "old"),
        common(kit, "AccTitle", " old"),
        common(kit, "AccDescr", " old"),
        common(kit, "Title", null),
        common(kit, "AccTitle", null),
        common(kit, "AccDescrBlock", null),
      ],
      {
        config: { securityLevel: "strict" },
        title: "Embedded",
        dataBlockEffects: [],
      },
    )
    expect(result).toMatchObject({
      title: "Embedded",
      accTitle: "",
      accDescr: "",
    })
  })

  it("shares common text collapsing and description line conversion", () => {
    const result = summary(
      "treemap\ntitle  T\t T \naccTitle: A  B\naccDescr { A\n\n  B }",
      (kit) => [
        common(kit, "Title", " T\t T "),
        common(kit, "AccTitle", " A  B"),
        common(kit, "AccDescrBlock", "A\n\n  B"),
      ],
    )
    expect(result).toMatchObject({
      title: "T T",
      accTitle: "A B",
      accDescr: "A\nB",
    })
  })
})
