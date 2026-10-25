import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  RADAR_CHILD_TYPES,
  RADAR_FIELD_WORDS,
} from "../src/check-tree/radar.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { nodeWith, tokenWith } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { copyOf, setField } from "./check-tree-recorded.ts"
import { commentOf, frontmatterOf, tokenOf } from "./check-tree-trees.ts"
import { axis, buildRadar, curve, entry, group, option } from "./radar-built.ts"
import { common, ignored, withPreheader } from "./statement-tree-built.ts"
import { readChildFields } from "./spec-field-tables.ts"

/** All nineteen node types and every populated internal gap, in authored order. */
function allFields(): Built {
  return buildRadar(
    "radar-beta %%{!hc}%% :\naxis %%{!ab}%% A %%{!al}%% [ %%{!av}%% \"A\" %%{!ac}%% ] %%{!aa}%% , %%{!bb}%% B\ncurve %%{!cb}%% c %%{!cl}%% [ %%{!cv}%% 'C' %%{!cc}%% ] %%{!ce}%% { %%{!eb}%% A %%{!ec}%% : %%{!ev}%% 1 %%{!ea}%% , B %%{!nv}%% 2 %%{!na}%% } %%{!ca}%% , d{ %%{!pb}%% 3 %%{!pa}%% }\nshowLegend %%{!sv}%% false %%{!sa}%% , %%{!tb}%% ticks %%{!tv}%% 33 %%{!ta}%% , %%{!xb}%% max %%{!xv}%% 9 %%{!xa}%% , %%{!mb}%% min %%{!mv}%% 0 %%{!ma}%% , %%{!gb}%% graticule %%{!gv}%% polygon %%{!ga}%%\ntitle  T \naccTitle: A\naccDescr: D\naccDescr { B\n C }",
    (kit) => {
      /** Supply one fixed occurrence to its explicitly named gap. */
      function hidden(raw: string) {
        return () => [ignored(kit, "Radar", raw, "directive")]
      }

      return [
        group(kit, "Axis", [
          () =>
            axis(kit, "A", '"A"', {
              textBefore: hidden("%%{!ab}%%"),
              textBeforeLabel: hidden("%%{!al}%%"),
              textBeforeLabelValue: hidden("%%{!av}%%"),
              textBeforeLabelClose: hidden("%%{!ac}%%"),
              textAfter: hidden("%%{!aa}%%"),
            }),
          () => axis(kit, "B", null, { textBefore: hidden("%%{!bb}%%") }),
        ]),
        group(kit, "Curve", [
          () =>
            curve(
              kit,
              "c",
              [
                () =>
                  entry(kit, "1", "A", true, {
                    textBefore: hidden("%%{!eb}%%"),
                    textBeforeColon: hidden("%%{!ec}%%"),
                    textBeforeValue: hidden("%%{!ev}%%"),
                    textAfter: hidden("%%{!ea}%%"),
                  }),
                () =>
                  entry(kit, "2", "B", false, {
                    textBeforeValue: hidden("%%{!nv}%%"),
                    textAfter: hidden("%%{!na}%%"),
                  }),
              ],
              "'C'",
              {
                textBefore: hidden("%%{!cb}%%"),
                textBeforeLabel: hidden("%%{!cl}%%"),
                textBeforeLabelValue: hidden("%%{!cv}%%"),
                textBeforeLabelClose: hidden("%%{!cc}%%"),
                textBeforeEntries: hidden("%%{!ce}%%"),
                textAfter: hidden("%%{!ca}%%"),
              },
            ),
          () =>
            curve(kit, "d", [
              () =>
                entry(kit, "3", null, false, {
                  textBefore: hidden("%%{!pb}%%"),
                  textAfter: hidden("%%{!pa}%%"),
                }),
            ]),
        ]),
        group(kit, "Options", [
          () =>
            option(kit, "showLegend", "false", {
              textBeforeValue: hidden("%%{!sv}%%"),
              textAfter: hidden("%%{!sa}%%"),
            }),
          () =>
            option(kit, "ticks", "33", {
              textBefore: hidden("%%{!tb}%%"),
              textBeforeValue: hidden("%%{!tv}%%"),
              textAfter: hidden("%%{!ta}%%"),
            }),
          () =>
            option(kit, "max", "9", {
              textBefore: hidden("%%{!xb}%%"),
              textBeforeValue: hidden("%%{!xv}%%"),
              textAfter: hidden("%%{!xa}%%"),
            }),
          () =>
            option(kit, "min", "0", {
              textBefore: hidden("%%{!mb}%%"),
              textBeforeValue: hidden("%%{!mv}%%"),
              textAfter: hidden("%%{!ma}%%"),
            }),
          () =>
            option(kit, "graticule", "polygon", {
              textBefore: hidden("%%{!gb}%%"),
              textBeforeValue: hidden("%%{!gv}%%"),
              textAfter: hidden("%%{!ga}%%"),
            }),
        ]),
        common(kit, "Radar", "Title", " T "),
        common(kit, "Radar", "AccTitle", " A"),
        common(kit, "Radar", "AccDescr", " D"),
        common(kit, "Radar", "AccDescrBlock", "B\n C"),
      ]
    },
    true,
    (kit) => [ignored(kit, "Radar", "%%{!hc}%%", "directive")],
  )
}

const VALID: readonly { name: string; built: () => Built }[] = [
  { name: "every node and member gap", built: allFields },
  { name: "bare header", built: () => buildRadar("radar-beta", () => []) },
  {
    name: "joined colon touching an axis",
    built: () =>
      buildRadar(
        "radar-beta:axis A",
        (kit) => [group(kit, "Axis", [() => axis(kit, "A")])],
        true,
      ),
  },
  {
    name: "a separate header colon after a consumed LF",
    built: () =>
      buildRadar(
        "radar-beta %%{!}%%\n:",
        () => [],
        true,
        (kit) => [ignored(kit, "Radar", "%%{!}%%", "directive")],
      ),
  },
  {
    name: "inline groups without statement EOL",
    built: () =>
      buildRadar(
        "radar-beta\naxis A curve c{1} ticks 0 showLegend false",
        (kit) => [
          group(kit, "Axis", [() => axis(kit, "A")]),
          group(kit, "Curve", [() => curve(kit, "c", [() => entry(kit, "1")])]),
          group(kit, "Options", [() => option(kit, "ticks", "0")]),
          group(kit, "Options", [() => option(kit, "showLegend", "false")]),
        ],
      ),
  },
  {
    name: "entry newlines after commas and before a closer",
    built: () =>
      buildRadar("radar-beta\ncurve c{\n1,\n2\n}", (kit) => [
        group(kit, "Curve", [
          () => curve(kit, "c", [() => entry(kit, "1"), () => entry(kit, "2")]),
        ]),
      ]),
  },
  {
    name: "last entry hidden ownership across trailing newlines",
    built: () =>
      buildRadar("radar-beta\ncurve c{1\n%%{!}%%\n}", (kit) => [
        group(kit, "Curve", [
          () =>
            curve(kit, "c", [
              () =>
                entry(kit, "1", null, false, {
                  textAfter: () => [
                    ignored(kit, "Radar", "%%{!}%%", "directive"),
                  ],
                }),
            ]),
        ]),
      ]),
  },
  {
    name: "hidden LF before an entry comma",
    built: () =>
      buildRadar("radar-beta\ncurve c{1%%{!}%%\n,2}", (kit) => [
        group(kit, "Curve", [
          () =>
            curve(kit, "c", [
              () =>
                entry(kit, "1", null, false, {
                  textAfter: () => [
                    ignored(kit, "Radar", "%%{!}%%", "directive"),
                  ],
                }),
              () => entry(kit, "2"),
            ]),
        ]),
      ]),
  },
  {
    name: "empty labels and bare accessibility ids",
    built: () =>
      buildRadar(
        "radar-beta\naxis accTitle[\"\"],accDescr['']\ncurve c{accTitle 1,accDescr 2}",
        (kit) => [
          group(kit, "Axis", [
            () => axis(kit, "accTitle", '""'),
            () => axis(kit, "accDescr", "''"),
          ]),
          group(kit, "Curve", [
            () =>
              curve(kit, "c", [
                () => entry(kit, "1", "accTitle", false),
                () => entry(kit, "2", "accDescr", false),
              ]),
          ]),
        ],
      ),
  },
  {
    name: "complete escaped multiline strings own hidden-looking text",
    built: () =>
      buildRadar('radar-beta\naxis A["---\nx\n---\n%%{}%%\\q"]', (kit) => [
        group(kit, "Axis", [() => axis(kit, "A", '"---\nx\n---\n%%{}%%\\q"')]),
      ]),
  },
  {
    name: "composite block and line values own hidden-looking text",
    built: () =>
      buildRadar(
        "radar-beta\naccDescr { ---\nx\n---\n%%\n }\ntitle ---",
        (kit) => [
          common(kit, "Radar", "AccDescrBlock", "---\nx\n---\n%%"),
          common(kit, "Radar", "Title", "---"),
        ],
      ),
  },
  {
    name: "spare LF after a common suffix",
    built: () =>
      buildRadar("radar-beta\ntitle T%%{!}%%\n\naxis A", (kit) => [
        common(kit, "Radar", "Title", "T", () => [
          ignored(kit, "Radar", "%%{!}%%", "directive"),
        ]),
        group(kit, "Axis", [() => axis(kit, "A")]),
      ]),
  },
  {
    name: "lookahead space preserves common EOL",
    built: () =>
      buildRadar("radar-beta\naccDescr {}---\nx\n--- \naxis A", (kit) => [
        common(kit, "Radar", "AccDescrBlock", null, () => [
          ignored(kit, "Radar", "---\nx\n---", "yaml-block"),
        ]),
        group(kit, "Axis", [() => axis(kit, "A")]),
      ]),
  },
  {
    name: "appended LF and EOF",
    built: () =>
      buildRadar("radar-beta\naccTitle: A%%{!}%%", (kit) => [
        common(kit, "Radar", "AccTitle", " A", () => [
          ignored(kit, "Radar", "%%{!}%%", "directive"),
        ]),
      ]),
  },
  {
    name: "CRLF consumed outside a suffix",
    built: () =>
      buildRadar(
        "radar-beta\r\naccDescr {}---\r\nx\r\n---\r\n\r\naxis A",
        (kit) => [
          common(kit, "Radar", "AccDescrBlock", null, () => [
            ignored(kit, "Radar", "---\r\nx\r\n---", "yaml-block"),
          ]),
          group(kit, "Axis", [() => axis(kit, "A")]),
        ],
      ),
  },
  {
    name: "body form after a visible EOL",
    built: () =>
      buildRadar("radar-beta\naxis A\n%%{!}%%\ncurve c{1}", (kit) => [
        group(kit, "Axis", [() => axis(kit, "A")]),
        ignored(kit, "Radar", "%%{!}%%", "directive"),
        group(kit, "Curve", [() => curve(kit, "c", [() => entry(kit, "1")])]),
      ]),
  },
  {
    name: "body-present YAML before empty fallback",
    built: () =>
      buildRadar("radar-beta\n---\n---\n---", (kit) => [
        ignored(kit, "Radar", "---\n---\n---", "yaml-block"),
      ]),
  },
  {
    name: "two separate nonempty YAML matches",
    built: () =>
      buildRadar("radar-beta\n---\na\n---\n---\nb\n---", (kit) => [
        ignored(kit, "Radar", "---\na\n---", "yaml-block"),
        ignored(kit, "Radar", "---\nb\n---", "yaml-block"),
      ]),
  },
  {
    name: "a nonqualifying directive closer",
    built: () =>
      buildRadar("radar-beta\n%%{!}%%x}%%", (kit) => [
        ignored(kit, "Radar", "%%{!}%%x}%%", "directive"),
      ]),
  },
  {
    name: "native Comment fallback when no closer qualifies",
    built: () =>
      buildRadar("radar-beta\n%%{!}%%axis A", (kit) => {
        kit.comment("%%", "%%{!}%%axis A")
        return []
      }),
  },
  {
    name: "empty and whitespace common forms",
    built: () =>
      buildRadar(
        "radar-beta\ntitle\ntitle  \naccTitle:\naccDescr: \naccDescr {}",
        (kit) => [
          common(kit, "Radar", "Title", null),
          common(kit, "Radar", "Title", " "),
          common(kit, "Radar", "AccTitle", null),
          common(kit, "Radar", "AccDescr", " "),
          common(kit, "Radar", "AccDescrBlock", null),
        ],
      ),
  },
  {
    name: "parser-owned semantic conditions are not tree conditions",
    built: () =>
      buildRadar("radar-beta\ncurve c{Missing:1}", (kit) => [
        group(kit, "Curve", [
          () => curve(kit, "c", [() => entry(kit, "1", "Missing")]),
        ]),
      ]),
  },
]

describe("radar hand-built trees", () => {
  for (const row of VALID)
    it(`passes ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })

  it("registers all child fields in specification visitor order", () => {
    const fields = readChildFields()
    for (const [type, own] of Object.entries(RADAR_CHILD_TYPES))
      expect(Object.keys(own)).toEqual(fields.get(type))
    expect(RADAR_FIELD_WORDS.RadarIgnoredText?.kind).toEqual([
      "yaml-block",
      "directive",
    ])
  })

  it("allows the bare header spelling as a name when its boundary fails before punctuation", () => {
    const { source, tree } = buildRadar(
      'radar-beta\naxis radar-beta["R"]\ncurve radar-beta{1}',
      (kit) => [
        group(kit, "Axis", [() => axis(kit, "radar-beta", '"R"')]),
        group(kit, "Curve", [
          () => curve(kit, "radar-beta", [() => entry(kit, "1")]),
        ]),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
  })

  it("keeps a real frontmatter separate from a retained YAML prefix and passed Unicode trivia", () => {
    const built = withPreheader(
      buildRadar(
        "---\ntitle: Front\n---\n---\nx\n---\n%%\n\u00a0radar-beta",
        () => [],
      ),
      "Radar",
      [["---\nx\n---", "yaml-block"]],
      ["%%"],
    )
    setField(
      built.tree,
      "frontmatter",
      frontmatterOf(built.source, "---\ntitle: Front\n---", [4, 16]),
    )
    setField(built.tree, "tokens", [
      tokenOf(built.source, "Punctuator", { text: "---", from: 0 }),
      tokenOf(built.source, "RawText", { text: "title: Front", from: 4 }),
      tokenOf(built.source, "Punctuator", { text: "---", from: 17 }),
      ...built.tree.tokens,
    ])
    expect(checkTree(built.source, built.tree)).toEqual([])
  })

  it("does not skip a YAML prefix after an already-passed bare percent line", () => {
    const { source, tree } = withPreheader(
      buildRadar("%%\n---\nx\n---\nradar-beta", () => []),
      "Radar",
      [["---\nx\n---", "yaml-block"]],
      ["%%"],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "bare percent line before YAML prevents detection",
    )
  })

  it("takes adjacent empty YAML fences only when no body-present closer remains", () => {
    const { source, tree } = buildRadar("radar-beta\n---\n---", (kit) => [
      ignored(kit, "Radar", "---\n---", "yaml-block"),
    ])
    expect(checkTree(source, tree)).toEqual([])
  })

  it("keeps an empty native directive and a line-description suffix at EOF", () => {
    const { source, tree } = buildRadar(
      "radar-beta\naccDescr: D%%{}%%",
      (kit) => [
        common(kit, "Radar", "AccDescr", " D", () => [
          ignored(kit, "Radar", "%%{}%%", "directive"),
        ]),
      ],
    )
    expect(checkTree(source, tree)).toEqual([])
  })

  for (const row of [
    {
      type: "RadarIgnoredText",
      field: "kind",
      value: "yaml-block",
      message: "one complete hidden",
    },
    {
      type: "RadarIgnoredText",
      field: "value",
      value: "changed",
      message: "value is not its written text",
    },
    {
      type: "RadarLiteral",
      field: "value",
      value: "changed",
      message: "value is not its written text",
    },
    {
      type: "RadarShowLegendOption",
      field: "value",
      value: "true",
      message: "the written option value",
    },
    {
      type: "RadarGraticuleOption",
      field: "value",
      value: "circle",
      message: "the written option value",
    },
  ])
    it(`reports altered ${row.type}.${row.field}`, () => {
      const { source, tree } = allFields()
      setField(nodeWith(tree, row.type), row.field, row.value)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  it("reports every populated hidden gap when its owner loses the occurrence", () => {
    const built = allFields()
    expect(checkTree(built.source, built.tree)).toEqual([])
    for (const [type, fields] of Object.entries(RADAR_CHILD_TYPES)) {
      for (const [field, allowed] of Object.entries(fields)) {
        if (!allowed.includes("RadarIgnoredText") || field === "body") continue
        const tree = copyOf(built.tree)
        const node = nodesOf(tree).find(
          (item) =>
            item.type === type &&
            Array.isArray(item[field]) &&
            (item[field] as unknown[]).length > 0,
        )
        if (node === undefined) continue
        setField(node, field, [])
        expect(
          checkTree(built.source, tree).length,
          `${type}.${field}`,
        ).toBeGreaterThan(0)
      }
    }
  })

  it("reports duplicated and moved hidden owners", () => {
    const built = allFields()
    const duplicated = copyOf(built.tree)
    const node = nodeWith(duplicated, "RadarAxis")
    setField(node, "textBeforeLabel", [
      nodeWith(duplicated, "RadarIgnoredText"),
      nodeWith(duplicated, "RadarIgnoredText"),
    ])
    expect(checkTree(built.source, duplicated).length).toBeGreaterThan(0)
    const moved = copyOf(built.tree)
    const member = nodeWith(moved, "RadarAxis")
    setField(member, "textBeforeLabelValue", member.textBeforeLabel)
    setField(member, "textBeforeLabel", [])
    expect(JSON.stringify(checkTree(built.source, moved))).toContain(
      "gap is not",
    )
  })

  it("rejects a hidden form moved from the last member into body before visible EOL", () => {
    const { source, tree } = buildRadar("radar-beta\naxis A%%{!}%%", (kit) => [
      group(kit, "Axis", [() => axis(kit, "A")]),
      ignored(kit, "Radar", "%%{!}%%", "directive"),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "requires visible EOL",
    )
  })

  for (const row of [
    {
      source: "radar-beta\n%%{!}%% x }%%",
      raw: "%%{!}%% x }%%",
      kind: "directive",
    },
    {
      source: "radar-beta\n---\nx\n---\ny\n---",
      raw: "---\nx\n---\ny\n---",
      kind: "yaml-block",
    },
    {
      source: "radar-beta\n---\n---\n---",
      raw: "---\n---",
      kind: "yaml-block",
    },
    { source: "radar-beta\n%%{!}%%\n", raw: "%%{!}%%\n", kind: "directive" },
    {
      source: "radar-beta\n---\nx\n---\n",
      raw: "---\nx\n---\n",
      kind: "yaml-block",
    },
  ] as const)
    it(`rejects a wrong selected hidden range ${JSON.stringify(row.raw)}`, () => {
      const { source, tree } = buildRadar(row.source, (kit) => [
        ignored(kit, "Radar", row.raw, row.kind),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "one complete hidden",
      )
    })

  for (const row of [
    { source: "radar-beta\ntitle T%%{!}%%\naxis A", block: false },
    { source: "radar-beta\naccDescr {}---\nx\n---\naxis A", block: true },
  ])
    it(`requires surviving EOL after common suffix ${row.block}`, () => {
      const { source, tree } = buildRadar(row.source, (kit) => [
        row.block
          ? common(kit, "Radar", "AccDescrBlock", null, () => [
              ignored(kit, "Radar", "---\nx\n---", "yaml-block"),
            ])
          : common(kit, "Radar", "Title", "T", () => [
              ignored(kit, "Radar", "%%{!}%%", "directive"),
            ]),
        group(kit, "Axis", [() => axis(kit, "A")]),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "requires visible EOL",
      )
    })

  it("does not disguise an earlier native directive as Comment", () => {
    const { source, tree } = buildRadar("radar-beta\n%%{!}%%", (kit) => {
      kit.comment("%%", "%%{!}%%")
      return []
    })
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "earlier hidden DIRECTIVE",
    )
  })

  it("does not put a native Comment inside an earlier string", () => {
    const { source, tree } = buildRadar(
      'radar-beta\naxis A["%%{!}%%"]',
      (kit) => [group(kit, "Axis", [() => axis(kit, "A", '"%%{!}%%"')])],
    )
    setField(tree, "comments", [commentOf(source, "%%", { text: "%%{!}%%" })])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "cannot start inside a STRING",
    )
  })

  it("does not put a native Comment inside an earlier composite block", () => {
    const { source, tree } = buildRadar(
      "radar-beta\naccDescr { %%bare\n }",
      (kit) => [common(kit, "Radar", "AccDescrBlock", "%%bare")],
    )
    expect(checkTree(source, tree)).toEqual([])
    setField(tree, "comments", [commentOf(source, "%%", { text: "%%bare" })])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "cannot start inside a STRING or composite description block",
    )
  })

  it("does not put a native Comment inside an earlier hidden YAML form", () => {
    const { source, tree } = buildRadar(
      "radar-beta\n---\nx %%{!}%%\n---",
      (kit) => [ignored(kit, "Radar", "---\nx %%{!}%%\n---", "yaml-block")],
    )
    expect(checkTree(source, tree)).toEqual([])
    setField(tree, "comments", [commentOf(source, "%%", { text: "%%{!}%%" })])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "cannot start inside an earlier hidden form",
    )
  })

  it("keeps a hidden form after visible common EOL out of textAfter", () => {
    const { source, tree } = buildRadar(
      "radar-beta\ntitle T\n%%{!}%%",
      (kit) => [
        common(kit, "Radar", "Title", "T", () => [
          ignored(kit, "Radar", "%%{!}%%", "directive"),
        ]),
      ],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "hidden ASCII whitespace",
    )
  })

  it("rejects an earlier closing brace hidden inside a block value", () => {
    const { source, tree } = buildRadar(
      "radar-beta\naccDescr {A} B}",
      (kit) => [common(kit, "Radar", "AccDescrBlock", "A} B")],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "complete composite lexical value",
    )
  })

  it("rejects mixed entry forms and an empty entry list", () => {
    const mixed = buildRadar("radar-beta\ncurve c{1,A:2}", (kit) => [
      group(kit, "Curve", [
        () =>
          curve(kit, "c", [() => entry(kit, "1"), () => entry(kit, "2", "A")]),
      ]),
    ])
    expect(JSON.stringify(checkTree(mixed.source, mixed.tree))).toContain(
      "nonempty list of one entry form",
    )
    const empty = buildRadar("radar-beta\ncurve c{}", (kit) => [
      group(kit, "Curve", [() => curve(kit, "c", [])]),
    ])
    expect(JSON.stringify(checkTree(empty.source, empty.tree))).toContain(
      "nonempty list of one entry form",
    )
  })

  for (const row of [
    { source: "radar-beta\naxis trueX", name: "trueX" },
    { source: "radar-beta\naxis polygonX", name: "polygonX" },
    { source: "radar-beta\naxis titleA", name: "titleA" },
    { source: "radar-beta\naxis axis", name: "axis" },
    { source: "radar-beta\naxis 1A", name: "1A" },
  ])
    it(`rejects an id read by an earlier rule ${row.name}`, () => {
      const { source, tree } = buildRadar(row.source, (kit) => [
        group(kit, "Axis", [() => axis(kit, row.name)]),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "one complete ID",
      )
    })

  it("rejects a number that spans two zero units", () => {
    const { source, tree } = buildRadar("radar-beta\nticks 01", (kit) => [
      group(kit, "Options", [() => option(kit, "ticks", "01")]),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "one unsigned-decimal NUMBER",
    )
  })

  it("checks option keyword longer-id priority", () => {
    const { source, tree } = buildRadar("radar-beta\nticks1", (kit) => [
      group(kit, "Options", [() => option(kit, "ticks", "1")]),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "longer ID alternative",
    )
  })

  it("rejects a visible newline before an entry comma even before a hidden suffix", () => {
    const { source, tree } = buildRadar(
      "radar-beta\ncurve c{1\n%%{!}%%\n,2}",
      (kit) => [
        group(kit, "Curve", [
          () =>
            curve(kit, "c", [
              () =>
                entry(kit, "1", null, false, {
                  textAfter: () => [
                    ignored(kit, "Radar", "%%{!}%%", "directive"),
                  ],
                }),
              () => entry(kit, "2"),
            ]),
        ]),
      ],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "hidden ASCII whitespace",
    )
  })

  for (const row of [
    {
      source: "radar-beta\naxis A,\nB",
      make: (kit: Kit) => [
        group(kit, "Axis", [() => axis(kit, "A"), () => axis(kit, "B")]),
      ],
    },
    {
      source: "radar-beta\ncurve c\n{1}",
      make: (kit: Kit) => [
        group(kit, "Curve", [() => curve(kit, "c", [() => entry(kit, "1")])]),
      ],
    },
    {
      source: "radar-beta\ncurve c{A:\n1}",
      make: (kit: Kit) => [
        group(kit, "Curve", [
          () => curve(kit, "c", [() => entry(kit, "1", "A")]),
        ]),
      ],
    },
    {
      source: "radar-beta\nticks 1,\nmax 2",
      make: (kit: Kit) => [
        group(kit, "Options", [
          () => option(kit, "ticks", "1"),
          () => option(kit, "max", "2"),
        ]),
      ],
    },
  ])
    it(`keeps member/component gaps strict ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = buildRadar(row.source, row.make)
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "hidden ASCII whitespace",
      )
    })

  it("keeps body gaps strict after a bare percent line", () => {
    const { source, tree } = buildRadar(
      "radar-beta\n%%\n\u2028axis A",
      (kit) => {
        kit.comment("%%", "%%")
        return [group(kit, "Axis", [() => axis(kit, "A")])]
      },
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })

  it("checks authored punctuation independently of values", () => {
    const { source, tree } = allFields()
    setField(tokenWith(tree, "["), "value", "{")
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "authored component must be [",
    )
  })
})

for (const row of [
  {
    source: "%% c\n---\nx\n---\n%%\n\u00a0radar-beta",
    parts: [["---\nx\n---", "yaml-block"]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n%%\n\u2028radar-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    comments: ["%% c", "%%"],
  },
  {
    source:
      "%% c\n---\nx\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\n%%\n\ufeffradar-beta",
    parts: [
      ["---\nx\n---", "yaml-block"],
      ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
    ],
    comments: ["%% c", "%%", "%% gap", "%%"],
  },
] as const)
  it(`passes retained-prefix detection trivia ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = withPreheader(
      buildRadar(row.source, () => []),
      "Radar",
      row.parts,
      row.comments,
    )
    expect(checkTree(source, tree)).toEqual([])
  })

for (const row of [
  {
    source: "%% c\n---\nx\n---\n\u2028radar-beta",
    parts: [["---\nx\n---", "yaml-block"]],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n\u00a0radar-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
  },
] as const)
  it(`does not pass native prefix whitespace without a passed line ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = withPreheader(
      buildRadar(row.source, () => []),
      "Radar",
      row.parts,
      ["%% c"],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })
