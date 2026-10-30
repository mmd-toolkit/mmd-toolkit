import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  ARCHITECTURE_CHILD_TYPES,
  ARCHITECTURE_FIELD_WORDS,
} from "../src/check-tree/architecture.ts"
import {
  buildArchitecture,
  declaration,
  edge,
  alignment,
} from "./architecture-built.ts"
import { buildTree, nodeWith, tokenWith } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { setField } from "./check-tree-recorded.ts"
import { common, ignored, withPreheader } from "./statement-tree-built.ts"
import { commentOf, directiveOf, tokenOf } from "./check-tree-trees.ts"
import { readChildFields } from "./spec-field-tables.ts"

/** Every child field in authored order, with native forms in their named gaps. */
function allFields(): Built {
  return buildArchitecture(
    'architecture-beta\ngroup outer\ngroup %%{!gi}%% g %%{!gc}%% (cloud) %%{!gt}%% [G] %%{!gn}%% in %%{!gp}%% outer %%{!ga}%%\n\nservice %%{!si}%% a %%{!sc}%% "A" %%{!st}%% [S] %%{!sn}%% in %%{!sp}%% g %%{!sa}%%\n\njunction %%{!ji}%% j %%{!jn}%% in %%{!jp}%% outer %%{!ja}%%\n\na %%{!lg}%% {group} %%{!ba}%% : %%{!sd}%% R %%{!sm}%% > %%{!ln}%% - %%{!lt}%% [link] %%{!ed}%% - %%{!em}%% < %%{!rd}%% L %%{!rc}%% : %%{!ri}%% j %%{!rg}%% {group} %%{!ea}%%\n\nalign %%{!ad}%% row %%{!m1}%% a %%{!m2}%% j %%{!aa}%%\n\ntitle  T \naccTitle: A\naccDescr: D\naccDescr { B\n C }',
    (kit) => {
      /** Supply one fixed native form to its named gap. */
      function hidden(raw: string) {
        return () => [ignored(kit, "Architecture", raw, "directive")]
      }

      return [
        declaration(kit, "Group", "outer"),
        declaration(kit, "Group", "g", {
          icon: "(cloud)",
          title: "[G]",
          parent: "outer",
          gaps: {
            textBeforeId: hidden("%%{!gi}%%"),
            textBeforeIcon: hidden("%%{!gc}%%"),
            textBeforeTitle: hidden("%%{!gt}%%"),
            textBeforeIn: hidden("%%{!gn}%%"),
            textBeforeParent: hidden("%%{!gp}%%"),
            textAfter: hidden("%%{!ga}%%"),
          },
        }),
        declaration(kit, "Service", "a", {
          icon: '"A"',
          title: "[S]",
          parent: "g",
          gaps: {
            textBeforeId: hidden("%%{!si}%%"),
            textBeforeIcon: hidden("%%{!sc}%%"),
            textBeforeTitle: hidden("%%{!st}%%"),
            textBeforeIn: hidden("%%{!sn}%%"),
            textBeforeParent: hidden("%%{!sp}%%"),
            textAfter: hidden("%%{!sa}%%"),
          },
        }),
        declaration(kit, "Junction", "j", {
          parent: "outer",
          gaps: {
            textBeforeId: hidden("%%{!ji}%%"),
            textBeforeIn: hidden("%%{!jn}%%"),
            textBeforeParent: hidden("%%{!jp}%%"),
            textAfter: hidden("%%{!ja}%%"),
          },
        }),
        edge(kit, "a", "j", {
          value:
            ": %%{!sd}%% R %%{!sm}%% > %%{!ln}%% - %%{!lt}%% [link] %%{!ed}%% - %%{!em}%% < %%{!rd}%% L %%{!rc}%% :",
          startMarker: ">",
          endMarker: "<",
          title: "[link]",
          lhsGroup: true,
          rhsGroup: true,
          gaps: {
            textBeforeLhsGroup: hidden("%%{!lg}%%"),
            textBeforeArrow: hidden("%%{!ba}%%"),
            textBeforeRhsId: hidden("%%{!ri}%%"),
            textBeforeRhsGroup: hidden("%%{!rg}%%"),
            textAfter: hidden("%%{!ea}%%"),
          },
          arrowGaps: {
            textBeforeStartDirection: hidden("%%{!sd}%%"),
            textBeforeStartMarker: hidden("%%{!sm}%%"),
            textBeforeLine: hidden("%%{!ln}%%"),
            textBeforeTitle: hidden("%%{!lt}%%"),
            textBeforeEndDash: hidden("%%{!ed}%%"),
            textBeforeEndMarker: hidden("%%{!em}%%"),
            textBeforeEndDirection: hidden("%%{!rd}%%"),
            textBeforeEndColon: hidden("%%{!rc}%%"),
          },
        }),
        alignment(kit, "row", ["a", "j"], {
          beforeDirection: hidden("%%{!ad}%%"),
          beforeMembers: [hidden("%%{!m1}%%"), hidden("%%{!m2}%%")],
          after: hidden("%%{!aa}%%"),
        }),
        common(kit, "Architecture", "Title", " T "),
        common(kit, "Architecture", "AccTitle", " A"),
        common(kit, "Architecture", "AccDescr", " D"),
        common(kit, "Architecture", "AccDescrBlock", "B\n C"),
      ]
    },
  )
}

const VALID: readonly { name: string; built: () => Built }[] = [
  {
    name: "CRLF consumption stays outside the hidden suffix",
    built: () =>
      buildArchitecture(
        "architecture-beta\r\nservice a---\r\nx\r\n---\r\n\r\nservice b",
        (kit) => [
          declaration(kit, "Service", "a", {
            gaps: {
              textAfter: () => [
                ignored(kit, "Architecture", "---\r\nx\r\n---", "yaml-block"),
              ],
            },
          }),
          declaration(kit, "Service", "b"),
        ],
      ),
  },
  { name: "every node and gap", built: allFields },
  {
    name: "empty diagram",
    built: () => buildArchitecture("architecture-beta", () => []),
  },
  {
    name: "inline declaration and icon-name punctuation",
    built: () =>
      buildArchitecture("architecture-beta service a(-:A_)", (kit) => [
        declaration(kit, "Service", "a", { icon: "(-:A_)" }),
      ]),
  },
  {
    name: "both marker characters in reversed positions",
    built: () =>
      buildArchitecture("architecture-beta a:R >--< L:a", (kit) => [
        edge(kit, "a", "a", {
          value: ":R >--< L:",
          startMarker: ">",
          endMarker: "<",
        }),
      ]),
  },
  {
    name: "quoted bracket content",
    built: () =>
      buildArchitecture('architecture-beta\nservice a["[x]"]', (kit) => [
        declaration(kit, "Service", "a", {
          title: '["[x]"]',
          titleKind: "string",
        }),
      ]),
  },
  {
    name: "quoted alternative falls back to bare label",
    built: () =>
      buildArchitecture('architecture-beta\nservice a["a"b]', (kit) => [
        declaration(kit, "Service", "a", { title: '["a"b]' }),
      ]),
  },
  {
    name: "padded quotes remain a bare label",
    built: () =>
      buildArchitecture('architecture-beta\nservice a[ "x" ]', (kit) => [
        declaration(kit, "Service", "a", { title: '[ "x" ]' }),
      ]),
  },
  {
    name: "escaped LS can fall back to a bare label",
    built: () =>
      buildArchitecture('architecture-beta\nservice a["a\\\u2028b"]', (kit) => [
        declaration(kit, "Service", "a", { title: '["a\\\u2028b"]' }),
      ]),
  },
  {
    name: "empty string icon and empty quoted label",
    built: () =>
      buildArchitecture("architecture-beta\nservice a ''['']", (kit) => [
        declaration(kit, "Service", "a", {
          icon: "''",
          title: "['']",
          titleKind: "string",
        }),
      ]),
  },
  {
    name: "hidden-looking label content",
    built: () =>
      buildArchitecture("architecture-beta\nservice a[%%{!}%%---]", (kit) => [
        declaration(kit, "Service", "a", { title: "[%%{!}%%---]" }),
      ]),
  },
  {
    name: "hidden-looking string content",
    built: () =>
      buildArchitecture(
        'architecture-beta\nservice a "---\nx\n---\n%%{}%%"',
        (kit) => [
          declaration(kit, "Service", "a", { icon: '"---\nx\n---\n%%{}%%"' }),
        ],
      ),
  },
  {
    name: "hidden-looking description block",
    built: () =>
      buildArchitecture(
        "architecture-beta\naccDescr { ---\nx\n---\n%%\n }",
        (kit) => [
          common(kit, "Architecture", "AccDescrBlock", "---\nx\n---\n%%"),
        ],
      ),
  },
  {
    name: "spare LF after consumed suffix",
    built: () =>
      buildArchitecture(
        "architecture-beta\nservice a%%{!}%%\n\nservice b",
        (kit) => [
          declaration(kit, "Service", "a", {
            gaps: {
              textAfter: () => [
                ignored(kit, "Architecture", "%%{!}%%", "directive"),
              ],
            },
          }),
          declaration(kit, "Service", "b"),
        ],
      ),
  },
  {
    name: "lookahead space preserves LF",
    built: () =>
      buildArchitecture(
        "architecture-beta\nservice a---\nx\n--- \nservice b",
        (kit) => [
          declaration(kit, "Service", "a", {
            gaps: {
              textAfter: () => [
                ignored(kit, "Architecture", "---\nx\n---", "yaml-block"),
              ],
            },
          }),
          declaration(kit, "Service", "b"),
        ],
      ),
  },
  {
    name: "appended LF and EOF",
    built: () =>
      buildArchitecture("architecture-beta\nservice a%%{!}%%", (kit) => [
        declaration(kit, "Service", "a", {
          gaps: {
            textAfter: () => [
              ignored(kit, "Architecture", "%%{!}%%", "directive"),
            ],
          },
        }),
      ]),
  },
  {
    name: "body after visible LF",
    built: () =>
      buildArchitecture(
        "architecture-beta\nservice a\n%%{!}%%\nservice b",
        (kit) => [
          declaration(kit, "Service", "a"),
          ignored(kit, "Architecture", "%%{!}%%", "directive"),
          declaration(kit, "Service", "b"),
        ],
      ),
  },
  {
    name: "two suffix forms",
    built: () =>
      buildArchitecture(
        "architecture-beta\nservice a%%{!}%% %%{?}%%",
        (kit) => [
          declaration(kit, "Service", "a", {
            gaps: {
              textAfter: () => [
                ignored(kit, "Architecture", "%%{!}%%", "directive"),
                ignored(kit, "Architecture", "%%{?}%%", "directive"),
              ],
            },
          }),
        ],
      ),
  },
  {
    name: "three fences use body-present alternative",
    built: () =>
      buildArchitecture("architecture-beta\n---\n---\n---", (kit) => [
        ignored(kit, "Architecture", "---\n---\n---", "yaml-block"),
      ]),
  },
  {
    name: "two nonempty YAML forms",
    built: () =>
      buildArchitecture(
        "architecture-beta\n---\na\n---\n---\nb\n---",
        (kit) => [
          ignored(kit, "Architecture", "---\na\n---", "yaml-block"),
          ignored(kit, "Architecture", "---\nb\n---", "yaml-block"),
        ],
      ),
  },
  {
    name: "nonqualifying directive close",
    built: () =>
      buildArchitecture("architecture-beta\n%%{!}%%x}%%", (kit) => [
        ignored(kit, "Architecture", "%%{!}%%x}%%", "directive"),
      ]),
  },
  {
    name: "native Comment fallback",
    built: () =>
      buildArchitecture(
        "architecture-beta\nservice a%%{!\nservice b",
        (kit) => {
          const first = declaration(kit, "Service", "a")
          kit.comment("%%", "%%{!")
          return [first, declaration(kit, "Service", "b")]
        },
      ),
  },
  {
    name: "empty and whitespace common values",
    built: () =>
      buildArchitecture(
        "architecture-beta\ntitle\ntitle  \naccTitle:\naccDescr: \naccDescr { }",
        (kit) => [
          common(kit, "Architecture", "Title", null),
          common(kit, "Architecture", "Title", " "),
          common(kit, "Architecture", "AccTitle", null),
          common(kit, "Architecture", "AccDescr", " "),
          common(kit, "Architecture", "AccDescrBlock", null),
        ],
      ),
  },
  {
    name: "semantics stay outside checker",
    built: () =>
      buildArchitecture(
        "architecture-beta\nservice a in missing\nservice a\nalign row a a",
        (kit) => [
          declaration(kit, "Service", "a", { parent: "missing" }),
          declaration(kit, "Service", "a"),
          alignment(kit, "row", ["a", "a"]),
        ],
      ),
  },
]

describe("architecture hand-built trees", () => {
  for (const row of VALID)
    it(`passes ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })

  it("registers child fields in the specification's visitor order", () => {
    const fields = readChildFields()
    for (const [type, own] of Object.entries(ARCHITECTURE_CHILD_TYPES))
      expect(Object.keys(own)).toEqual(fields.get(type))
    expect(ARCHITECTURE_FIELD_WORDS.ArchitectureIgnoredText?.kind).toEqual([
      "yaml-block",
      "directive",
    ])
  })

  for (const row of [
    {
      type: "ArchitectureLabel",
      field: "kind",
      value: "string",
      message: "first complete alternative",
    },
    {
      type: "ArchitectureLabel",
      field: "value",
      value: "changed",
      message: "written label content",
    },
    {
      type: "ArchitectureArrow",
      field: "value",
      value: ":R--L:",
      message: "value is not its written text",
    },
    {
      type: "ArchitectureArrow",
      field: "startDirection",
      value: "L",
      message: "written start direction",
    },
    {
      type: "ArchitectureArrow",
      field: "endDirection",
      value: "R",
      message: "written end direction",
    },
    {
      type: "ArchitectureArrow",
      field: "startMarker",
      value: "none",
      message: "authored component",
    },
    {
      type: "ArchitectureArrow",
      field: "endMarker",
      value: "none",
      message: "authored component",
    },
    {
      type: "ArchitectureEdgeStatement",
      field: "lhsGroup",
      value: false,
      message: "unexpected authored components",
    },
    {
      type: "ArchitectureEdgeStatement",
      field: "rhsGroup",
      value: false,
      message: "unexpected authored components",
    },
    {
      type: "ArchitectureAlignmentStatement",
      field: "direction",
      value: "column",
      message: "written alignment direction",
    },
    {
      type: "ArchitectureIgnoredText",
      field: "kind",
      value: "yaml-block",
      message: "one complete hidden",
    },
    {
      type: "ArchitectureIgnoredText",
      field: "value",
      value: "changed",
      message: "value is not its written text",
    },
    {
      type: "ArchitectureLiteral",
      field: "value",
      value: "changed",
      message: "value is not its written text",
    },
  ])
    it(`reports altered ${row.type}.${row.field}`, () => {
      const { source, tree } = allFields()
      setField(nodeWith(tree, row.type), row.field, row.value)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  it("reports loss of populated component gaps, including the first member", () => {
    for (const [type, fields] of Object.entries(ARCHITECTURE_CHILD_TYPES)) {
      for (const [field, allowed] of Object.entries(fields)) {
        if (
          !allowed.includes("ArchitectureIgnoredText") ||
          ["body", "textBeforeHeader"].includes(field)
        )
          continue
        const { source, tree } = allFields()
        const node = nodesOf(tree).find(
          (item) =>
            item.type === type &&
            Array.isArray(item[field]) &&
            (item[field] as unknown[]).length > 0,
        )
        if (node === undefined) continue
        setField(node, field, [])
        expect(
          checkTree(source, tree).length,
          `${type}.${field}`,
        ).toBeGreaterThan(0)
      }
    }
  })
  it("reports duplicated or moved hidden ownership", () => {
    const { source, tree } = allFields()
    const node = nodeWith(tree, "ArchitectureArrow")
    const forms = node.textBeforeLine
    setField(node, "textBeforeLine", [
      nodeWith(tree, "ArchitectureIgnoredText"),
      nodeWith(tree, "ArchitectureIgnoredText"),
    ])
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
    setField(node, "textBeforeLine", [])
    setField(node, "textBeforeTitle", forms)
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
  })

  for (const row of [
    {
      source: "architecture-beta\nservice a%%{!}%%\nservice b",
      raw: "%%{!}%%",
      kind: "directive",
    },
    {
      source: "architecture-beta\nservice a---\nx\n---\nservice b",
      raw: "---\nx\n---",
      kind: "yaml-block",
    },
  ] as const)
    it(`reports a consumed sole LF after ${row.kind}`, () => {
      const { source, tree } = buildArchitecture(row.source, (kit) => [
        declaration(kit, "Service", "a", {
          gaps: {
            textAfter: () => [ignored(kit, "Architecture", row.raw, row.kind)],
          },
        }),
        declaration(kit, "Service", "b"),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "consumed the only LF",
      )
    })
  for (const row of [
    {
      source: "architecture-beta\n%%{!}%%\n",
      raw: "%%{!}%%\n",
      kind: "directive",
    },
    {
      source: "architecture-beta\n---\n---\n---",
      raw: "---\n---",
      kind: "yaml-block",
    },
    {
      source: "architecture-beta\n---\na\n---\nb\n---",
      raw: "---\na\n---\nb\n---",
      kind: "yaml-block",
    },
    {
      source: "architecture-beta\n%%{!}%%\n}%%",
      raw: "%%{!}%%\n}%%",
      kind: "directive",
    },
  ] as const)
    it(`reports an incorrect hidden match ${JSON.stringify(row.raw)}`, () => {
      const { source, tree } = buildArchitecture(row.source, (kit) => [
        ignored(kit, "Architecture", row.raw, row.kind),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "one complete hidden",
      )
    })
  it("reports body/suffix ownership across visible LF in both directions", () => {
    const before = buildArchitecture(
      "architecture-beta\nservice a\n%%{!}%%",
      (kit) => [
        declaration(kit, "Service", "a", {
          gaps: {
            textAfter: () => [
              ignored(kit, "Architecture", "%%{!}%%", "directive"),
            ],
          },
        }),
      ],
    )
    expect(JSON.stringify(checkTree(before.source, before.tree))).toContain(
      "hidden ASCII whitespace",
    )
    const after = buildArchitecture(
      "architecture-beta\nservice a%%{!}%%",
      (kit) => [
        declaration(kit, "Service", "a"),
        ignored(kit, "Architecture", "%%{!}%%", "directive"),
      ],
    )
    expect(JSON.stringify(checkTree(after.source, after.tree))).toContain(
      "visible EOL",
    )
  })
  for (const row of [
    {
      source: "architecture-beta\nservice Lname",
      make: (kit: Kit) => [declaration(kit, "Service", "Lname")],
    },
    {
      source: "architecture-beta\nservice group",
      make: (kit: Kit) => [declaration(kit, "Service", "group")],
    },
    {
      source: "architecture-beta\nservice titleX",
      make: (kit: Kit) => [declaration(kit, "Service", "titleX")],
    },
    {
      source: "architecture-beta\nservice a( x )",
      make: (kit: Kit) => [declaration(kit, "Service", "a", { icon: "(x)" })],
    },
    {
      source: "architecture-beta\nservice\na",
      make: (kit: Kit) => [declaration(kit, "Service", "a")],
    },
    {
      source: "architecture-beta\nservice\u2028a",
      make: (kit: Kit) => [declaration(kit, "Service", "a")],
    },
    {
      source: "architecture-beta a{ group }:R--L:a",
      make: (kit: Kit) => [
        edge(kit, "a", "a", { value: ":R--L:", lhsGroup: true }),
      ],
    },
    {
      source: 'architecture-beta\nservice a["[x]"]',
      make: (kit: Kit) => [
        declaration(kit, "Service", "a", { title: '["[x]"]' }),
      ],
    },
    {
      source: 'architecture-beta\nservice a "a\\\nb"',
      make: (kit: Kit) => [
        declaration(kit, "Service", "a", { icon: '"a\\\nb"' }),
      ],
    },
  ])
    it(`reports invalid authored components ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = buildArchitecture(row.source, row.make)
      expect(checkTree(source, tree).length).toBeGreaterThan(0)
    })

  it("reports a complete native directive disguised as Comment", () => {
    const { source, tree } = buildArchitecture(
      "architecture-beta\nservice a%%{}%%\nservice b",
      (kit) => {
        const first = declaration(kit, "Service", "a")
        kit.comment("%%", "%%{}%%")
        return [first, declaration(kit, "Service", "b")]
      },
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "earlier hidden DIRECTIVE",
    )
  })
  it("reports a native Comment inside the earlier label alternative", () => {
    const { source, tree } = buildArchitecture(
      "architecture-beta\nservice a[%%{}%%]",
      (kit) => [declaration(kit, "Service", "a", { title: "[%%{}%%]" })],
    )
    setField(tree, "comments", [commentOf(source, "%%", { text: "%%{}%%" })])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "cannot start inside a bracketed label",
    )
  })
  it("reports changed token kinds and an atomic header cut", () => {
    const { source, tree } = allFields()
    setField(tokenWith(tree, "-"), "type", "Keyword")
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
    const raw = "architec%%{init: {}}%%ture-beta"
    const broken = buildTree(
      {
        header: "architec",
        diagramType: "architecture",
        bodyType: "ArchitectureDiagram",
        bodyFields: (body) => ({ textBeforeHeader: [], body }),
      },
      raw,
      (kit) => {
        kit.directive("%%{init: {}}%%")
        kit.token("Keyword", "ture-beta")
        return []
      },
    )
    expect(JSON.stringify(checkTree(raw, broken.tree))).toContain(
      "a Keyword token is cut",
    )
  })
})

for (const row of [
  {
    source: "%% c\n---\nx\n---\n%%\n\u2028\narchitecture-beta",
    parts: [["---\nx\n---", "yaml-block"]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n%%\n\u2028\narchitecture-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%% c\n---\nx\n---\n%%\n\u2028architecture-beta",
    parts: [["---\nx\n---", "yaml-block"]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%% c\n---\nx\n---\n%%\n\ufeffarchitecture-beta",
    parts: [["---\nx\n---", "yaml-block"]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n%%\n\u2028architecture-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n%%\n\ufeffarchitecture-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    comments: ["%% c", "%%"],
  },
  {
    source:
      "%% c\n---\nx\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\narchitecture-beta",
    parts: [
      ["---\nx\n---", "yaml-block"],
      ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
    ],
    comments: ["%% c", "%%", "%% gap"],
  },
] as const)
  it(`passes retained-prefix detection trivia ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = withPreheader(
      buildArchitecture(row.source, () => []),
      "Architecture",
      row.parts,
      row.comments,
    )
    expect(checkTree(source, tree)).toEqual([])
  })
for (const row of [
  {
    source: "%% c\n---\nx\n---\n\u2028architecture-beta",
    parts: [["---\nx\n---", "yaml-block"]],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n\u2028architecture-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
  },
] as const)
  it(`rejects native prefix gaps without a passed line ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = withPreheader(
      buildArchitecture(row.source, () => []),
      "Architecture",
      row.parts,
      ["%% c"],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })
it("keeps ordinary body gaps strict after a bare Comment", () => {
  const { source, tree } = buildArchitecture(
    "architecture-beta\n%%\n\u2028service a",
    (kit) => {
      kit.comment("%%", "%%")
      return [declaration(kit, "Service", "a")]
    },
  )
  expect(JSON.stringify(checkTree(source, tree))).toContain(
    "ASCII whitespace and LF",
  )
})

for (const row of [
  {
    source: "architecture-betaservice a",
    make: (kit: Kit) => [declaration(kit, "Service", "a")],
  },
  {
    source: "architecture-beta servicea",
    make: (kit: Kit) => [declaration(kit, "Service", "a")],
  },
  {
    source: "architecture-beta align rowx a",
    make: (kit: Kit) => [alignment(kit, "row", ["x", "a"])],
  },
])
  it(`rejects a keyword carved out of a longer ID ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = buildArchitecture(row.source, row.make)
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "longer ID alternative",
    )
  })
for (const row of [
  {
    source: "architecture-beta a:R---\nx\n---\nL:a",
    value: ":R---\nx\n---\nL:",
  },
  {
    source: "architecture-beta a:R-[x]---\nx\n---\nL:a",
    value: ":R-[x]---\nx\n---\nL:",
    title: "[x]",
  },
])
  it(`rejects either arrow dash taking priority over YAML ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = buildArchitecture(row.source, (kit) => [
      edge(kit, "a", "a", row),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "line dash yields",
    )
  })
for (const row of [
  {
    source: 'architecture-beta\nservice a "%%{}%%"',
    make: (kit: Kit) => [
      declaration(kit, "Service", "a", { icon: '"%%{}%%"' }),
    ],
  },
  {
    source: "architecture-beta\naccDescr { %%x }",
    make: (kit: Kit) => [common(kit, "Architecture", "AccDescrBlock", "%%x")],
  },
])
  it(`rejects a native Comment inside an earlier enclosing value ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = buildArchitecture(row.source, row.make)
    expect(checkTree(source, tree)).toEqual([])
    setField(tree, "comments", [
      commentOf(source, "%%", {
        text: row.source.includes("%%x") ? "%%x" : "%%{}%%",
      }),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "cannot start inside a STRING or composite",
    )
  })
for (const row of [
  {
    source: "architecture-beta\nservice a(%%{init: {}}%%cloud%%{wrap}%%)",
    make: (kit: Kit) => [declaration(kit, "Service", "a", { icon: "(cloud)" })],
  },
  {
    source: "architecture-beta a{%%{init: {}}%%group}:R--L:a",
    make: (kit: Kit) => [
      edge(kit, "a", "a", { value: ":R--L:", lhsGroup: true }),
    ],
  },
])
  it(`accepts common directives between composite components ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = buildArchitecture(row.source, row.make)
    const pieces = row.source.includes("%%{wrap}%%")
      ? [{ text: "%%{init: {}}%%" }, { text: "%%{wrap}%%" }]
      : [{ text: "%%{init: {}}%%" }]
    setField(
      tree,
      "directives",
      pieces.map((piece) => directiveOf(source, piece)),
    )
    setField(
      tree,
      "tokens",
      [
        ...tree.tokens,
        ...pieces.map((piece) => tokenOf(source, "Directive", piece)),
      ].sort((a, b) => a.range[0] - b.range[0]),
    )
    expect(checkTree(source, tree)).toEqual([])
  })
it("rejects a single labelled-line dash followed immediately by a YAML opener", () => {
  const { source, tree } = buildArchitecture(
    "architecture-beta a:R-[x]----\nx\n---\nL:a",
    (kit) => [
      edge(kit, "a", "a", {
        value: ":R-[x]----\nx\n---\nL:",
        title: "[x]",
        arrowGaps: {
          textBeforeEndDirection: () => [
            ignored(kit, "Architecture", "---\nx\n---", "yaml-block"),
          ],
        },
      }),
    ],
  )
  expect(JSON.stringify(checkTree(source, tree))).toContain(
    "earlier double dash",
  )
})
for (const row of [
  { raw: "---\nx\n---", accepted: true },
  { raw: "  ---\nx\n---", accepted: false },
] as const)
  it(`checks retained-prefix padding ownership ${row.accepted}`, () => {
    const { source, tree } = withPreheader(
      buildArchitecture("  ---\nx\n---\narchitecture-beta", () => []),
      "Architecture",
      [[row.raw, "yaml-block"]],
      [],
    )
    const problems = checkTree(source, tree)
    if (row.accepted) expect(problems).toEqual([])
    else expect(JSON.stringify(problems)).toContain("without preceding padding")
  })
