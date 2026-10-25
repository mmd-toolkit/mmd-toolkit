import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  PACKET_CHILD_TYPES,
  PACKET_FIELD_WORDS,
} from "../src/check-tree/packet.ts"
import { buildTree, nodeWith, tokenWith } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { commentOf } from "./check-tree-trees.ts"
import { buildPacket, range, relative, single } from "./packet-built.ts"
import { common, ignored, withPreheader } from "./statement-tree-built.ts"
import { readChildFields } from "./spec-field-tables.ts"

/** Every packet node type, with each hidden gap owned in its written position. */
function allFields(): Built {
  return buildPacket(
    'packet-beta\n0 %%{!a}%% - %%{!b}%% 1 %%{!c}%% : %%{!d}%% "R"%%{!e}%%\n\n2 %%{!f}%% : %%{!g}%% \'S\'\n+ %%{!h}%% 2 %%{!i}%% : %%{!j}%% "T"\ntitle  T \naccTitle: A\naccDescr: D\naccDescr { B\n C }',
    (kit) => [
      range(kit, "0", "1", '"R"', {
        beforeDash: () => [ignored(kit, "Packet", "%%{!a}%%", "directive")],
        beforeEnd: () => [ignored(kit, "Packet", "%%{!b}%%", "directive")],
        beforeColon: () => [ignored(kit, "Packet", "%%{!c}%%", "directive")],
        beforeLabel: () => [ignored(kit, "Packet", "%%{!d}%%", "directive")],
        after: () => [ignored(kit, "Packet", "%%{!e}%%", "directive")],
      }),
      single(kit, "2", "'S'", {
        beforeColon: () => [ignored(kit, "Packet", "%%{!f}%%", "directive")],
        beforeLabel: () => [ignored(kit, "Packet", "%%{!g}%%", "directive")],
      }),
      relative(kit, "2", '"T"', {
        beforeCount: () => [ignored(kit, "Packet", "%%{!h}%%", "directive")],
        beforeColon: () => [ignored(kit, "Packet", "%%{!i}%%", "directive")],
        beforeLabel: () => [ignored(kit, "Packet", "%%{!j}%%", "directive")],
      }),
      common(kit, "Packet", "Title", " T "),
      common(kit, "Packet", "AccTitle", " A"),
      common(kit, "Packet", "AccDescr", " D"),
      common(kit, "Packet", "AccDescrBlock", "B\n C"),
    ],
    "packet-beta",
  )
}

const VALID: readonly { name: string; built: () => Built }[] = [
  { name: "every field", built: allFields },
  { name: "header only", built: () => buildPacket("packet", () => []) },
  {
    name: "inline beta block and empty single-quoted label",
    built: () =>
      buildPacket(
        "packet-beta0:''",
        (kit) => [single(kit, "0", "''")],
        "packet-beta",
      ),
  },
  {
    name: "spare LF after hidden suffix",
    built: () =>
      buildPacket('packet\n0:"A"%%{!}%%\n\n+1:"B"', (kit) => [
        single(kit, "0", '"A"', {
          after: () => [ignored(kit, "Packet", "%%{!}%%", "directive")],
        }),
        relative(kit, "1", '"B"'),
      ]),
  },
  {
    name: "lookahead space preserves LF",
    built: () =>
      buildPacket('packet\n0:"A"---\nx\n--- \n+1:"B"', (kit) => [
        single(kit, "0", '"A"', {
          after: () => [ignored(kit, "Packet", "---\nx\n---", "yaml-block")],
        }),
        relative(kit, "1", '"B"'),
      ]),
  },
  {
    name: "appended LF and EOF",
    built: () =>
      buildPacket('packet\n+1:"A"%%{!}%%', (kit) => [
        relative(kit, "1", '"A"', {
          after: () => [ignored(kit, "Packet", "%%{!}%%", "directive")],
        }),
      ]),
  },
  {
    name: "CRLF consumed outside hidden range",
    built: () =>
      buildPacket('packet\r\n0:"A"---\r\nx\r\n---\r\n\r\n+1:"B"', (kit) => [
        single(kit, "0", '"A"', {
          after: () => [
            ignored(kit, "Packet", "---\r\nx\r\n---", "yaml-block"),
          ],
        }),
        relative(kit, "1", '"B"'),
      ]),
  },
  {
    name: "body form after visible EOL",
    built: () =>
      buildPacket('packet\n0:"A"\n%%{!}%%\n+1:"B"', (kit) => [
        single(kit, "0", '"A"'),
        ignored(kit, "Packet", "%%{!}%%", "directive"),
        relative(kit, "1", '"B"'),
      ]),
  },
  {
    name: "two hidden suffixes",
    built: () =>
      buildPacket('packet\n0:"A"%%{!}%% %%{?}%%', (kit) => [
        single(kit, "0", '"A"', {
          after: () => [
            ignored(kit, "Packet", "%%{!}%%", "directive"),
            ignored(kit, "Packet", "%%{?}%%", "directive"),
          ],
        }),
      ]),
  },
  {
    name: "body-present YAML before empty fallback",
    built: () =>
      buildPacket("packet\n---\n---\n---", (kit) => [
        ignored(kit, "Packet", "---\n---\n---", "yaml-block"),
      ]),
  },
  {
    name: "separate nonempty YAML matches",
    built: () =>
      buildPacket("packet\n---\na\n---\n---\nb\n---", (kit) => [
        ignored(kit, "Packet", "---\na\n---", "yaml-block"),
        ignored(kit, "Packet", "---\nb\n---", "yaml-block"),
      ]),
  },
  {
    name: "nonqualifying directive closer",
    built: () =>
      buildPacket("packet\n%%{!}%%x}%%", (kit) => [
        ignored(kit, "Packet", "%%{!}%%x}%%", "directive"),
      ]),
  },
  {
    name: "hidden-looking string content",
    built: () =>
      buildPacket('packet\n0:"---\nx\n---\n%%{}%%"', (kit) => [
        single(kit, "0", '"---\nx\n---\n%%{}%%"'),
      ]),
  },
  {
    name: "hidden-looking description and line content",
    built: () =>
      buildPacket(
        "packet\naccDescr { ---\nx\n---\n%%\n }\ntitle ---",
        (kit) => [
          common(kit, "Packet", "AccDescrBlock", "---\nx\n---\n%%"),
          common(kit, "Packet", "Title", "---"),
        ],
      ),
  },
  {
    name: "empty and whitespace common values",
    built: () =>
      buildPacket(
        "packet\ntitle\ntitle  \naccTitle:\naccDescr: \naccDescr { }",
        (kit) => [
          common(kit, "Packet", "Title", null),
          common(kit, "Packet", "Title", " "),
          common(kit, "Packet", "AccTitle", null),
          common(kit, "Packet", "AccDescr", " "),
          common(kit, "Packet", "AccDescrBlock", null),
        ],
      ),
  },
  {
    name: "native Comment fallback",
    built: () =>
      buildPacket('packet\n0:"A"%%{!\n+1:"B"', (kit) => {
        const first = single(kit, "0", '"A"')
        kit.comment("%%", "%%{!")
        return [first, relative(kit, "1", '"B"')]
      }),
  },
  {
    name: "semantic rejection is outside the checker",
    built: () =>
      buildPacket('packet\n2-1:"A"\n+0:"B"', (kit) => [
        range(kit, "2", "1", '"A"'),
        relative(kit, "0", '"B"'),
      ]),
  },
  {
    name: "hidden YAML between plus and count consumes its LF",
    built: () =>
      buildPacket('packet\n+---\nx\n---\n1:"A"', (kit) => [
        relative(kit, "1", '"A"', {
          beforeCount: () => [
            ignored(kit, "Packet", "---\nx\n---", "yaml-block"),
          ],
        }),
      ]),
  },
  {
    name: "range dash before a separate YAML match",
    built: () =>
      buildPacket('packet\n0----\nx\n---\n0:"A"', (kit) => [
        range(kit, "0", "0", '"A"', {
          beforeEnd: () => [
            ignored(kit, "Packet", "---\nx\n---", "yaml-block"),
          ],
        }),
      ]),
  },
  {
    name: "YAML skips a nonqualifying closer",
    built: () =>
      buildPacket('packet\n---\nx\n---x\n--- \n0:"A"', (kit) => [
        ignored(kit, "Packet", "---\nx\n---x\n---", "yaml-block"),
        single(kit, "0", '"A"'),
      ]),
  },
]

describe("packet hand-built trees", () => {
  for (const row of VALID)
    it(`passes ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })

  for (const row of [
    {
      type: "PacketDiagram",
      field: "textBeforeHeader",
      value: null,
      message: "textBeforeHeader",
    },
    {
      type: "PacketRangeBlockStatement",
      field: "start",
      value: null,
      message: "start",
    },
    {
      type: "PacketLiteral",
      field: "value",
      value: "x",
      message: "value is not its written text",
    },
    {
      type: "PacketTitleStatement",
      field: "value",
      value: null,
      message: "composite lexical value",
    },
    {
      type: "PacketIgnoredText",
      field: "kind",
      value: "yaml",
      message: "the field kind",
    },
    {
      type: "PacketIgnoredText",
      field: "value",
      value: "x",
      message: "value is not its written text",
    },
    { type: "NumericLiteral", field: "value", value: 77, message: "value" },
    {
      type: "StringLiteral",
      field: "closed",
      value: false,
      message: "closed STRING",
    },
  ])
    it(`reports changed ${row.type}.${row.field}`, () => {
      const { source, tree } = allFields()
      setField(nodeWith(tree, row.type), row.field, row.value)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  for (const field of [
    "textBeforeDash",
    "textBeforeEnd",
    "textBeforeColon",
    "textBeforeLabel",
    "textAfter",
  ])
    it(`rejects lost range ownership in ${field}`, () => {
      const { source, tree } = allFields()
      setField(nodeWith(tree, "PacketRangeBlockStatement"), field, [])
      expect(checkTree(source, tree).length).toBeGreaterThan(0)
    })

  it("rejects duplicate and moved gap ownership", () => {
    const { source, tree } = allFields()
    const node = nodeWith(tree, "PacketRangeBlockStatement")
    const hidden = nodeWith(tree, "PacketIgnoredText")
    setField(node, "textBeforeDash", [hidden, hidden])
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
    setField(node, "textBeforeDash", [])
    setField(node, "textBeforeEnd", [hidden])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "hidden ASCII whitespace",
    )
  })

  for (const row of [
    {
      source: 'packet\n+1:"A"%%{!}%%\n+1:"B"',
      raw: "%%{!}%%",
      kind: "directive",
    },
    {
      source: 'packet\n+1:"A"---\nx\n---\n+1:"B"',
      raw: "---\nx\n---",
      kind: "yaml-block",
    },
  ] as const)
    it(`rejects a consumed sole LF after ${row.kind}`, () => {
      const { source, tree } = buildPacket(row.source, (kit) => [
        relative(kit, "1", '"A"', {
          after: () => [ignored(kit, "Packet", row.raw, row.kind)],
        }),
        relative(kit, "1", '"B"'),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "consumed the only LF",
      )
    })

  for (const row of [
    { source: "packet\n%%{!}%%\n", raw: "%%{!}%%\n", kind: "directive" },
    { source: "packet\n---\n---\n---", raw: "---\n---", kind: "yaml-block" },
    {
      source: "packet\n---\na\n---\nb\n---",
      raw: "---\na\n---\nb\n---",
      kind: "yaml-block",
    },
    { source: "packet\n%%{!}%%\n}%%", raw: "%%{!}%%\n}%%", kind: "directive" },
  ] as const)
    it(`rejects an incorrect hidden match ${JSON.stringify(row.raw)}`, () => {
      const { source, tree } = buildPacket(row.source, (kit) => [
        ignored(kit, "Packet", row.raw, row.kind),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "one complete hidden",
      )
    })

  it("rejects a body form moved to textAfter across visible LF", () => {
    const { source, tree } = buildPacket('packet\n0:"A"\n%%{!}%%', (kit) => [
      single(kit, "0", '"A"', {
        after: () => [ignored(kit, "Packet", "%%{!}%%", "directive")],
      }),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "hidden ASCII whitespace",
    )
  })
  it("rejects a trailing form moved from textAfter to body without visible LF", () => {
    const { source, tree } = buildPacket('packet\n0:"A"%%{!}%%', (kit) => [
      single(kit, "0", '"A"'),
      ignored(kit, "Packet", "%%{!}%%", "directive"),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain("visible EOL")
  })

  for (const row of [
    {
      source: 'packet0:"A"',
      make: (kit: Kit) => [single(kit, "0", '"A"')],
      message: "keyword has no",
    },
    {
      source: 'packet\n+01:"A"',
      make: (kit: Kit) => [relative(kit, "01", '"A"')],
      message: "unsigned-integer lexical unit",
    },
    {
      source: 'packet\n+12.3:"A"',
      make: (kit: Kit) => [relative(kit, "12", '"A"')],
      message: "unsigned-integer lexical unit",
    },
    {
      source: 'packet\n0---\nx\n---\n0:"A"',
      make: (kit: Kit) => [range(kit, "0", "0", '"A"')],
      message: "range dash yields",
    },
    {
      source: 'packet\n0\n:"A"',
      make: (kit: Kit) => [single(kit, "0", '"A"')],
      message: "hidden ASCII whitespace",
    },
    {
      source: 'packet\n0:\u2028"A"',
      make: (kit: Kit) => [single(kit, "0", '"A"')],
      message: "hidden ASCII whitespace",
    },
    {
      source: 'packet\n0:"A\\\nB"',
      make: (kit: Kit) => [single(kit, "0", '"A\\\nB"')],
      message: "closed STRING",
    },
  ])
    it(`rejects invalid lexical components ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = buildPacket(row.source, row.make)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  it("rejects altered operators and their token kinds", () => {
    const { source, tree } = allFields()
    setField(tokenWith(tree, "-"), "type", "Keyword")
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
    setField(tokenWith(tree, "+"), "value", "-")
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "authored operators",
    )
  })

  for (const row of [
    {
      source: 'packet\n0:"A"%%{}%%\n+1:"B"',
      make: (kit: Kit) => [single(kit, "0", '"A"')],
    },
    {
      source: 'packet\ntitle T%%{}%%\n+1:"B"',
      make: (kit: Kit) => [common(kit, "Packet", "Title", "T")],
    },
    { source: 'packet\n%%{}%%\n+1:"B"', make: () => [] },
  ])
    it(`rejects hidden DIRECTIVE disguised as Comment ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = buildPacket(row.source, (kit) => {
        const first = row.make(kit)
        kit.comment("%%", "%%{}%%")
        return [...first, relative(kit, "1", '"B"')]
      })
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "earlier hidden DIRECTIVE",
      )
    })

  for (const row of [
    {
      source: 'packet\n0:"A%%{}%%B"',
      make: (kit: Kit) => [single(kit, "0", '"A%%{}%%B"')],
    },
    {
      source: "packet\naccDescr { A%%{}%% B }",
      make: (kit: Kit) => [common(kit, "Packet", "AccDescrBlock", "A%%{}%% B")],
    },
  ])
    it(`rejects native Comment inside an earlier value ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = buildPacket(row.source, row.make)
      setField(tree, "comments", [commentOf(source, "%%", { text: "%%{}%%" })])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "cannot start inside a STRING or composite",
      )
    })

  for (const row of [
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028packet",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\ufeffpacket",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028\npacket",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028packet",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\ufeffpacket",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028\npacket",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\npacket",
      parts: [
        ["---\nx\n---", "yaml-block"],
        ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
      ],
      comments: ["%% c", "%%", "%% gap"],
    },
  ] as const)
    it(`passes detection trivia ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = withPreheader(
        buildPacket(row.source, () => []),
        "Packet",
        row.parts,
        row.comments,
      )
      expect(checkTree(source, tree)).toEqual([])
    })

  for (const row of [
    {
      source: "%% c\n---\nx\n---\n\u2028packet",
      parts: [["---\nx\n---", "yaml-block"]],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n\u2028packet",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    },
  ] as const)
    it(`rejects Unicode trivia without passed bare line ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = withPreheader(
        buildPacket(row.source, () => []),
        "Packet",
        row.parts,
        ["%% c"],
      )
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "ASCII whitespace and LF",
      )
    })

  it("keeps ordinary body gaps strict after a bare Comment", () => {
    const { source, tree } = buildPacket('packet\n%%\n\u2028+1:"A"', (kit) => {
      kit.comment("%%", "%%")
      return [relative(kit, "1", '"A"')]
    })
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })
  it("accepts a detection-passed empty-brace Comment", () => {
    const { source, tree } = withPreheader(
      buildPacket("%%{}%%\npacket", () => []),
      "Packet",
      [],
      ["%%{}%%"],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("checks atomic keywords cut by a global directive", () => {
    const source = "pack%%{init: {}}%%et"
    const { tree } = buildTree(
      {
        header: "pack",
        diagramType: "packet",
        bodyType: "PacketDiagram",
        bodyFields: (body) => ({ textBeforeHeader: [], body }),
      },
      source,
      (kit) => {
        kit.directive("%%{init: {}}%%")
        kit.token("Keyword", "et")
        return []
      },
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "a Keyword token is cut",
    )
  })
  it("registers every child field and hidden kind from the specification", () => {
    const fields = readChildFields()
    for (const [type, own] of Object.entries(PACKET_CHILD_TYPES))
      expect(Object.keys(own)).toEqual(fields.get(type))
    expect(PACKET_FIELD_WORDS.PacketIgnoredText?.kind).toEqual([
      "yaml-block",
      "directive",
    ])
  })
})
