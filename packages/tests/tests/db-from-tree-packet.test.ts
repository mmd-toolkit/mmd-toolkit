import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  loadFixtures,
} from "../src/index.ts"
import type { Kit } from "./check-tree-built.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { buildPacket, range, relative, single } from "./packet-built.ts"
import { common } from "./statement-tree-built.ts"

/** Read an explicitly built tree using the ordinary shared embedded-value path. */
function summary(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  embedded: EmbeddedValues = {
    config: { securityLevel: "strict" },
    title: undefined,
    dataBlockEffects: [],
  },
) {
  const { tree } = buildPacket(source, make)
  return dbFromTree(
    source,
    tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("packet Db from hand-built trees", () => {
  it("keeps all three authored forms, row order and repeated labels", () => {
    expect(
      summary('packet\n+2:"same"\n2:"same"\n3-34:"range"\n+1:"next"', (kit) => [
        relative(kit, "2", '"same"'),
        single(kit, "2", '"same"'),
        range(kit, "3", "34", '"range"'),
        relative(kit, "1", '"next"'),
      ]),
    ).toEqual({
      title: "",
      accTitle: "",
      accDescr: "",
      packet: [
        [
          { start: 0, end: 1, label: "same" },
          { start: 2, end: 2, label: "same" },
          { start: 3, end: 31, label: "range" },
        ],
        [
          { start: 32, end: 34, label: "range" },
          { start: 35, end: 35, label: "next" },
        ],
      ],
    })
  })

  it("publishes no empty final row on an exact boundary", () => {
    expect(
      summary('packet\n+32:""', (kit) => [relative(kit, "32", '""')]).packet,
    ).toEqual([[{ start: 0, end: 31, label: "" }]])
    expect(summary("packet", () => []).packet).toEqual([])
  })

  it("applies final empty common assignments before publication", () => {
    expect(
      summary(
        "packet\ntitle First\ntitle\naccTitle: A\naccTitle:\naccDescr { B }\naccDescr {}",
        (kit) => [
          common(kit, "Packet", "Title", "First"),
          common(kit, "Packet", "Title", null),
          common(kit, "Packet", "AccTitle", " A"),
          common(kit, "Packet", "AccTitle", null),
          common(kit, "Packet", "AccDescrBlock", "B"),
          common(kit, "Packet", "AccDescrBlock", null),
        ],
        {
          config: { securityLevel: "strict" },
          title: "Front",
          dataBlockEffects: [],
        },
      ),
    ).toEqual({ title: "Front", accTitle: "", accDescr: "", packet: [] })
  })

  it("collapses common whitespace but decodes label escapes without trimming", () => {
    const result = summary(
      'packet\ntitle  A  B\naccTitle: A\naccDescr { A\n  B\n\n C }\n0:" a\\n\\q\\u0041 "',
      (kit) => [
        common(kit, "Packet", "Title", " A  B"),
        common(kit, "Packet", "AccTitle", " A"),
        common(kit, "Packet", "AccDescrBlock", "A\n  B\n\n C"),
        single(kit, "0", '" a\\n\\q\\u0041 "'),
      ],
    )
    expect(result).toEqual({
      title: "A B",
      accTitle: "A",
      accDescr: "A\nB\nC",
      packet: [[{ start: 0, end: 0, label: " a\nqu0041 " }]],
    })
  })

  it("sanitizes common fields while label text bypasses replacement", () => {
    const source =
      'packet\ntitle <b x="q">T</b>\naccTitle: <i>A</i>\naccDescr { <u>D</u> }\n0:"<b>A</b>"'
    expect(
      summary(
        source,
        (kit) => [
          common(kit, "Packet", "Title", '<b x="q">T</b>'),
          common(kit, "Packet", "AccTitle", " <i>A</i>"),
          common(kit, "Packet", "AccDescrBlock", "<u>D</u>"),
          single(kit, "0", '"<b>A</b>"'),
        ],
        {
          config: { securityLevel: "other" },
          title: undefined,
          dataBlockEffects: [],
        },
      ),
    ).toEqual({
      title: "&lt;b x&equals;'q'&gt;T&lt;/b&gt;",
      accTitle: "&lt;i&gt;A&lt;/i&gt;",
      accDescr: "&lt;u&gt;D&lt;/u&gt;",
      packet: [[{ start: 0, end: 0, label: "<b>A</b>" }]],
    })
  })
})

/** Fixed fixture inputs with every contributing occurrence supplied explicitly. */
const CASES: readonly { name: string; make: (kit: Kit) => CheckedNode[] }[] = [
  {
    name: "gram-mixed",
    make: (kit) => [
      relative(kit, "2", '"two"'),
      single(kit, "2", '"single"'),
      range(kit, "3", "5", '"range"'),
    ],
  },
  {
    name: "db-row-split",
    make: (kit) => [
      range(kit, "0", "10", '"first"'),
      range(kit, "11", "90", '"split"'),
    ],
  },
  {
    name: "db-row-exact",
    make: (kit) => [relative(kit, "32", '"row"'), relative(kit, "1", '"next"')],
  },
  {
    name: "db-cap-following-block-unpublished",
    make: (kit) => [relative(kit, "320000", '"A"'), relative(kit, "1", '"B"')],
  },
  {
    name: "db-cap-later-logical-end",
    make: (kit) => [
      relative(kit, "320000", '"A"'),
      relative(kit, "1", '"B"'),
      single(kit, "320001", '"C"'),
    ],
  },
  {
    name: "db-precision-rounded",
    make: (kit) => [relative(kit, "9007199254740993", '"A"')],
  },
  {
    name: "db-overflow-wide",
    make: (kit) => [
      relative(
        kit,
        "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999",
        '"A"',
      ),
    ],
  },
  {
    name: "db-frontmatter-infinite-endpoint",
    make: (kit) => [
      relative(
        kit,
        "9999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999",
        '"A"',
      ),
    ],
  },
]

const WIDTH_CASES = [
  "config-frontmatter-row-fraction-accepted",
  "config-init-row-fraction-accepted",
  "config-frontmatter-row-infinity",
  "config-init-row-overflow",
  "config-frontmatter-row-overflow",
  "config-frontmatter-row-infinity-string",
  "config-init-row-infinity-word-string",
  "config-frontmatter-row-nan",
  "config-init-row-nan-string",
  "config-init-row-nan-token",
  "config-init-row-infinity-token",
  "config-init-row-infinity-string",
  "config-frontmatter-row-negative",
  "config-init-row-negative",
  "config-frontmatter-row-null",
  "config-init-row-null",
  "config-frontmatter-row-numeric-string",
  "config-init-row-numeric-string",
  "config-frontmatter-row-text",
  "config-init-row-text",
  "config-frontmatter-row-true",
  "config-init-row-true",
  "config-frontmatter-row-zero",
  "config-init-row-zero",
  "config-init-row-integer",
]

describe("packet Db of fixed fixtures from hand-built trees", () => {
  const fixtures = loadFixtures("packet")
  for (const row of [
    ...CASES,
    ...WIDTH_CASES.map((name) => ({
      name,
      make: (kit: Kit) => [range(kit, "0", "9", '"A"')],
    })),
  ])
    it(`matches ${row.name}`, async () => {
      const fixture = (await fixtures).find((entry) => entry.name === row.name)
      if (fixture === undefined) throw new Error(`missing packet/${row.name}`)
      const { tree } = buildPacket(fixture.input, row.make)
      if (fixture.input.startsWith("---")) {
        Object.assign(tree, {
          frontmatter: {
            type: "Frontmatter",
            range: [0, fixture.input.indexOf("\n---\n") + 4],
          },
        })
      }
      const result = fixture.specified ?? fixture.expected
      if (!result.accepted) throw new Error(`rejected reading: ${row.name}`)
      const embedded = embeddedValuesOf(fixture, result)
      if (embedded === undefined)
        throw new Error(`no embedded values: ${row.name}`)
      expect(
        dbFromTree(
          fixture.input,
          tree as unknown as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
      ).toEqual(result.db)
    })
})
