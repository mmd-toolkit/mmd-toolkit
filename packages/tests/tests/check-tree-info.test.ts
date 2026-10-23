import { commentOf } from "./check-tree-trees.ts"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { INFO_CHILD_TYPES, INFO_FIELD_WORDS } from "../src/check-tree/info.ts"
import { buildTree, nodeWith, tokenWith } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import {
  buildInfo,
  common,
  ignored,
  withPreheader,
} from "./statement-tree-built.ts"
import { readChildFields } from "./spec-field-tables.ts"

/** A hand-built occurrence of every info node type. */
function allFields() {
  return buildInfo(
    "info showInfo\ntitle  T \naccTitle: A\naccDescr: D\naccDescr { B\n C }%%{!}%%\n",
    (kit) => [
      common(kit, "Info", "Title", " T "),
      common(kit, "Info", "AccTitle", " A"),
      common(kit, "Info", "AccDescr", " D"),
      common(kit, "Info", "AccDescrBlock", "B\n C", () => [
        ignored(kit, "Info", "%%{!}%%", "directive"),
      ]),
    ],
    true,
  )
}

const VALID = [
  {
    name: "whitespace-only line literal",
    built: () =>
      buildInfo("info\ntitle  \n", (kit) => [
        common(kit, "Info", "Title", " "),
      ]),
  },
  {
    name: "native fallback after incomplete directive",
    built: () =>
      buildInfo("info\ntitle T%%{!\naccTitle: A", (kit) => {
        const first = common(kit, "Info", "Title", "T")
        kit.comment("%%", "%%{!")
        return [first, common(kit, "Info", "AccTitle", " A")]
      }),
  },

  { name: "all fields", built: allFields },
  { name: "empty diagram", built: () => buildInfo("info", () => []) },
  {
    name: "flag on a later line",
    built: () => buildInfo("info\nshowInfo", () => [], true),
  },
  {
    name: "empty common forms",
    built: () =>
      buildInfo("info\ntitle\naccTitle:\naccDescr:\naccDescr { }", (kit) => [
        common(kit, "Info", "Title", null),
        common(kit, "Info", "AccTitle", null),
        common(kit, "Info", "AccDescr", null),
        common(kit, "Info", "AccDescrBlock", null),
      ]),
  },
  {
    name: "hidden body without flag",
    built: () =>
      buildInfo("info\n---\n---", (kit) => [
        ignored(kit, "Info", "---\n---", "yaml-block"),
      ]),
  },
  {
    name: "three YAML fences",
    built: () =>
      buildInfo("info\n---\n---\n---\ntitle T", (kit) => [
        ignored(kit, "Info", "---\n---\n---", "yaml-block"),
        common(kit, "Info", "Title", "T"),
      ]),
  },
  {
    name: "spare EOL",
    built: () =>
      buildInfo("info\ntitle T%%{!}%%\n\naccTitle: A", (kit) => [
        common(kit, "Info", "Title", "T", () => [
          ignored(kit, "Info", "%%{!}%%", "directive"),
        ]),
        common(kit, "Info", "AccTitle", " A"),
      ]),
  },
  {
    name: "lookahead closing space",
    built: () =>
      buildInfo("info\naccDescr { A }---\nx\n--- \ntitle T", (kit) => [
        common(kit, "Info", "AccDescrBlock", "A", () => [
          ignored(kit, "Info", "---\nx\n---", "yaml-block"),
        ]),
        common(kit, "Info", "Title", "T"),
      ]),
  },
  {
    name: "hidden-looking block content",
    built: () =>
      buildInfo("info\naccDescr { ---\nx\n---\n%%\n }", (kit) => [
        common(kit, "Info", "AccDescrBlock", "---\nx\n---\n%%"),
      ]),
  },
  {
    name: "body after a visible EOL",
    built: () =>
      buildInfo("info\ntitle T\n%%{!}%%\naccTitle: A", (kit) => [
        common(kit, "Info", "Title", "T"),
        ignored(kit, "Info", "%%{!}%%", "directive"),
        common(kit, "Info", "AccTitle", " A"),
      ]),
  },
]

describe("info hand-built trees", () => {
  for (const row of VALID)
    it(`passes ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })

  for (const row of [
    {
      name: "flag",
      type: "InfoDiagram",
      field: "showInfo",
      value: false,
      message: "showInfo flag",
    },
    {
      name: "common literal",
      type: "InfoLiteral",
      field: "value",
      value: "x",
      message: "value is not its written text",
    },
    {
      name: "missing value",
      type: "InfoTitleStatement",
      field: "value",
      value: null,
      message: "composite lexical value",
    },
    {
      name: "hidden kind",
      type: "InfoIgnoredText",
      field: "kind",
      value: "yaml",
      message: "the field kind",
    },
    {
      name: "hidden spelling",
      type: "InfoIgnoredText",
      field: "value",
      value: "x",
      message: "value is not its written text",
    },
  ])
    it(`reports changed ${row.name}`, () => {
      const { source, tree } = allFields()
      setField(nodeWith(tree, row.type), row.field, row.value)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  for (const row of [
    {
      name: "title",
      source: "info\ntitle T%%{}%%\naccTitle: A",
      kind: "Title",
      value: "T",
    },
    {
      name: "accTitle",
      source: "info\naccTitle: T%%{}%%\ntitle T",
      kind: "AccTitle",
      value: " T",
    },
    {
      name: "accDescr",
      source: "info\naccDescr: T%%{}%%\ntitle T",
      kind: "AccDescr",
      value: " T",
    },
    {
      name: "block",
      source: "info\naccDescr { T }%%{}%%\ntitle T",
      kind: "AccDescrBlock",
      value: "T",
    },
  ] as const)
    it(`rejects a native Comment hiding DIRECTIVE after ${row.name}`, () => {
      const { source, tree } = buildInfo(row.source, (kit) => {
        const first = common(kit, "Info", row.kind, row.value)
        kit.comment("%%", "%%{}%%")
        return [
          first,
          common(
            kit,
            "Info",
            row.kind === "Title" ? "AccTitle" : "Title",
            row.kind === "Title" ? " A" : "T",
          ),
        ]
      })
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "earlier hidden DIRECTIVE",
      )
    })

  for (const row of [
    {
      source: "info\ntitle T%%{!}%%\naccTitle: A",
      raw: "%%{!}%%",
      kind: "directive",
      block: false,
    },
    {
      source: "info\naccDescr { T }---\nx\n---\ntitle T",
      raw: "---\nx\n---",
      kind: "yaml-block",
      block: true,
    },
  ] as const)
    it(`rejects a consumed sole LF ${row.kind}`, () => {
      const { source, tree } = buildInfo(row.source, (kit) => [
        common(kit, "Info", row.block ? "AccDescrBlock" : "Title", "T", () => [
          ignored(kit, "Info", row.raw, row.kind),
        ]),
        common(
          kit,
          "Info",
          row.block ? "Title" : "AccTitle",
          row.block ? "T" : " A",
        ),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "consumed the only LF",
      )
    })

  for (const row of [
    { source: "info\n%%{!}%%\n", raw: "%%{!}%%\n", kind: "directive" },
    { source: "info\n---\n---\n---", raw: "---\n---", kind: "yaml-block" },
    { source: "info\n%%{!}%%\n}%%", raw: "%%{!}%%\n}%%", kind: "directive" },
  ] as const)
    it(`rejects an incorrect hidden range ${JSON.stringify(row.raw)}`, () => {
      const { source, tree } = buildInfo(row.source, (kit) => [
        ignored(kit, "Info", row.raw, row.kind),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "one complete hidden",
      )
    })

  for (const row of [
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028info",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\ufeffinfo",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028\ninfo",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028info",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\ufeffinfo",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028\ninfo",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\ninfo",
      parts: [
        ["---\nx\n---", "yaml-block"],
        ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
      ],
      comments: ["%% c", "%%", "%% gap"],
    },
  ] as const)
    it(`passes detection trivia ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = withPreheader(
        buildInfo(row.source, () => []),
        "Info",
        row.parts,
        row.comments,
      )
      expect(checkTree(source, tree)).toEqual([])
    })

  for (const row of [
    {
      source: "%% c\n---\nx\n---\n\u2028info",
      parts: [["---\nx\n---", "yaml-block"]],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n\u2028info",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    },
  ] as const)
    it(`rejects Unicode trivia without a passed bare line ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = withPreheader(
        buildInfo(row.source, () => []),
        "Info",
        row.parts,
        ["%% c"],
      )
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "ASCII whitespace and LF",
      )
    })

  it("keeps ordinary body gaps strict after bare Comments", () => {
    const { source, tree } = buildInfo("info\n%%\n\u2028title T", (kit) => {
      kit.comment("%%", "%%")
      return [common(kit, "Info", "Title", "T")]
    })
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })
  it("accepts a pre-header empty-brace Comment", () => {
    const { source, tree } = withPreheader(
      buildInfo("%%{}%%\ninfo", () => []),
      "Info",
      [],
      ["%%{}%%"],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("reports a wrong component token kind", () => {
    const { source, tree } = allFields()
    setField(tokenWith(tree, ":"), "type", "Keyword")
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
  })
  it("registers the documented child order and hidden kinds", () => {
    const fields = readChildFields()
    for (const [type, own] of Object.entries(INFO_CHILD_TYPES))
      expect(Object.keys(own)).toEqual(fields.get(type))
    expect(INFO_FIELD_WORDS.InfoIgnoredText?.kind).toEqual([
      "yaml-block",
      "directive",
    ])
  })
  it("passes a hidden YAML block before a later-line flag", () => {
    const { source, tree } = buildInfo(
      "info\n---\nx\n---\nshowInfo",
      () => [],
      true,
      (kit) => [ignored(kit, "Info", "---\nx\n---", "yaml-block")],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("rejects flag-gap ownership without a written flag", () => {
    const { source, tree } = buildInfo(
      "info\n---\nx\n---\nshowInfo",
      () => [],
      true,
      (kit) => [ignored(kit, "Info", "---\nx\n---", "yaml-block")],
    )
    setField(tree.body, "showInfo", false)
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "textBeforeShowInfo must be empty",
    )
  })
  it("rejects a body form moved into a common suffix across visible EOL", () => {
    const { source, tree } = buildInfo("info\ntitle T\n%%{!}%%", (kit) => [
      common(kit, "Info", "Title", "T", () => [
        ignored(kit, "Info", "%%{!}%%", "directive"),
      ]),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "hidden ASCII whitespace",
    )
  })
  it("rejects duplicate ownership", () => {
    const { source, tree } = allFields()
    const hidden = nodeWith(tree, "InfoIgnoredText")
    setField(nodeWith(tree, "InfoAccDescrBlockStatement"), "textAfter", [
      hidden,
      hidden,
    ])
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
  })
  it("rejects lost ownership", () => {
    const { source, tree } = allFields()
    setField(nodeWith(tree, "InfoAccDescrBlockStatement"), "textAfter", [])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "lies in no value node",
    )
  })
  it("rejects a native Comment inside a composite value", () => {
    const { source, tree } = buildInfo(
      "info\naccDescr { A%%{}%% B }",
      (kit) => [common(kit, "Info", "AccDescrBlock", "A%%{}%% B")],
    )
    setField(tree, "comments", [commentOf(source, "%%", { text: "%%{}%%" })])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "cannot start inside a STRING or composite",
    )
  })
  it("allows a native Comment after the first composite closer", () => {
    const { source, tree } = buildInfo("info\naccDescr { A%%{}%%\n", (kit) => {
      const block = common(kit, "Info", "AccDescrBlock", "A%%{")
      kit.comment("%%", "%%")
      return [block]
    })
    expect(checkTree(source, tree)).toEqual([])
  })
  it("rejects a hidden directive disguised as a body Comment", () => {
    const { source, tree } = buildInfo("info\n%%{}%%\ntitle T", (kit) => {
      kit.comment("%%", "%%{}%%")
      return [common(kit, "Info", "Title", "T")]
    })
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "earlier hidden DIRECTIVE",
    )
  })
  it("reports an atomic header split by a global directive", () => {
    const source = "in%%{init: {}}%%fo"
    const { tree } = buildTree(
      {
        header: "in",
        diagramType: "info",
        bodyType: "InfoDiagram",
        bodyFields: (body) => ({
          showInfo: false,
          textBeforeHeader: [],
          textBeforeShowInfo: [],
          body,
        }),
      },
      source,
      (kit) => {
        kit.directive("%%{init: {}}%%")
        kit.token("Keyword", "fo")
        return []
      },
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "a Keyword token is cut",
    )
  })
})
