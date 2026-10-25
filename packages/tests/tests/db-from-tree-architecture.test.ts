import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { EmbeddedValues } from "../src/mermaid.ts"
import { cssSupportsColor } from "../src/index.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import type { Kit } from "./check-tree-built.ts"
import {
  buildArchitecture,
  declaration,
  edge,
  alignment,
} from "./architecture-built.ts"
import { common, ignored } from "./statement-tree-built.ts"

/** Use the same converted-text and embedded-value path as recorded trees. */
function summary(
  source: string,
  make: (kit: Kit) => CheckedNode[],
  embedded: EmbeddedValues = {
    config: { securityLevel: "strict" },
    title: undefined,
    dataBlockEffects: [],
  },
) {
  const { tree } = buildArchitecture(source, make)
  return dbFromTree(
    source,
    tree as unknown as DbTreeRoot,
    embedded,
    cssSupportsColor,
  )
}

describe("architecture Db from hand-built trees", () => {
  it("publishes kind batches in source order, with forward references and written marker flags", () => {
    expect(
      summary(
        'architecture-beta\na{group}:R >-[" link "]-< L:j\nalign column j a\njunction j in outer\nservice a \'A\\n\\q\' ["  Name  "] in g\ngroup outer(-:A_)[ outer ]\ngroup g[Group] in outer\nservice b\na:R--R:a\nalign row a j',
        (kit) => [
          edge(kit, "a", "j", {
            value: ':R >-[" link "]-< L:',
            startMarker: ">",
            endMarker: "<",
            title: '[" link "]',
            titleKind: "string",
            lhsGroup: true,
          }),
          alignment(kit, "column", ["j", "a"]),
          declaration(kit, "Junction", "j", { parent: "outer" }),
          declaration(kit, "Service", "a", {
            icon: "'A\\n\\q'",
            title: '["  Name  "]',
            titleKind: "string",
            parent: "g",
          }),
          declaration(kit, "Group", "outer", {
            icon: "(-:A_)",
            title: "[ outer ]",
          }),
          declaration(kit, "Group", "g", { title: "[Group]", parent: "outer" }),
          declaration(kit, "Service", "b"),
          edge(kit, "a", "a", { value: ":R--R:", end: "R" }),
          alignment(kit, "row", ["a", "j"]),
        ],
      ),
    ).toEqual({
      accTitle: "",
      accDescr: "",
      nodes: [
        { id: "a", type: "service", in: "g", iconText: "A\nq", title: "Name" },
        { id: "b", type: "service" },
        { id: "j", type: "junction", in: "outer" },
      ],
      groups: [
        { id: "outer", icon: "-:A_", title: "outer" },
        { id: "g", title: "Group", in: "outer" },
      ],
      edges: [
        {
          lhsId: "a",
          lhsDir: "R",
          lhsInto: true,
          lhsGroup: true,
          rhsId: "j",
          rhsDir: "L",
          rhsInto: true,
          rhsGroup: false,
          title: "link",
        },
        {
          lhsId: "a",
          lhsDir: "R",
          lhsInto: false,
          lhsGroup: false,
          rhsId: "a",
          rhsDir: "R",
          rhsInto: false,
          rhsGroup: false,
        },
      ],
      layoutHints: [
        { direction: "column", members: ["j", "a"] },
        { direction: "row", members: ["a", "j"] },
      ],
    })
  })
  it("converts labels independently of their lexical kind and text icons with the shared escapes", () => {
    expect(
      summary(
        'architecture-beta\nservice a["a\\\'b"]\nservice b["a"b]\nservice c[ "  x  " ]\nservice d["a\\n"]\nservice e "a\\n\\q\\u0041\\0"',
        (kit) => [
          declaration(kit, "Service", "a", {
            title: '["a\\\'b"]',
            titleKind: "string",
          }),
          declaration(kit, "Service", "b", { title: '["a"b]' }),
          declaration(kit, "Service", "c", { title: '[ "  x  " ]' }),
          declaration(kit, "Service", "d", {
            title: '["a\\n"]',
            titleKind: "string",
          }),
          declaration(kit, "Service", "e", { icon: '"a\\n\\q\\u0041\\0"' }),
        ],
      ).nodes,
    ).toEqual([
      { id: "a", type: "service", title: "a'b" },
      { id: "b", type: "service", title: '"a"b' },
      { id: "c", type: "service", title: "x" },
      { id: "d", type: "service", title: "a\\n" },
      { id: "e", type: "service", iconText: "a\nqu0041\0" },
    ])
  })
  it.each([
    {
      name: "double quote",
      source: 'architecture-beta\nservice a[\\"B]\n',
      label: '[\\"B]',
      title: '\\"B',
    },
    {
      name: "single quote",
      source: "architecture-beta\nservice a[\\'B]\n",
      label: "[\\'B]",
      title: "\\'B",
    },
  ])(
    "preserves a bare $name escape in a service title",
    ({ source, label, title }) => {
      expect(
        summary(source, (kit) => [
          declaration(kit, "Service", "a", { title: label }),
        ]).nodes,
      ).toEqual([{ id: "a", type: "service", title }])
    },
  )
  it.each([
    {
      name: "one double quote",
      source: 'architecture-beta\nservice a["]',
      label: '["]',
    },
    {
      name: "one single quote",
      source: "architecture-beta\nservice a[']",
      label: "[']",
    },
    {
      name: "one padded double quote",
      source: 'architecture-beta\nservice a[ " ]',
      label: '[ " ]',
    },
  ])("converts $name to an empty service title", ({ source, label }) => {
    expect(
      summary(source, (kit) => [
        declaration(kit, "Service", "a", { title: label }),
      ]).nodes,
    ).toEqual([{ id: "a", type: "service", title: "" }])
  })
  it("converts one double quote to an empty group title", () => {
    expect(
      summary('architecture-beta\ngroup g["]', (kit) => [
        declaration(kit, "Group", "g", { title: '["]' }),
      ]).groups,
    ).toEqual([{ id: "g", title: "" }])
  })
  it("converts one double quote to an empty edge title", () => {
    expect(
      summary(
        'architecture-beta\nservice a\nservice b\na:R -["]- L:b',
        (kit) => [
          declaration(kit, "Service", "a"),
          declaration(kit, "Service", "b"),
          edge(kit, "a", "b", { value: ':R -["]- L:', title: '["]' }),
        ],
      ).edges,
    ).toEqual([
      {
        lhsId: "a",
        lhsDir: "R",
        lhsInto: false,
        lhsGroup: false,
        rhsId: "b",
        rhsDir: "L",
        rhsInto: false,
        rhsGroup: false,
        title: "",
      },
    ])
  })
  it("preserves empty optional values and duplicate edges and alignments", () => {
    expect(
      summary(
        "architecture-beta\nservice a \"\"[ ]\nservice b['']\na:R--L:b\na:R--L:b\nalign row a b\nalign row a b",
        (kit) => [
          declaration(kit, "Service", "a", { icon: '""', title: "[ ]" }),
          declaration(kit, "Service", "b", {
            title: "['']",
            titleKind: "string",
          }),
          edge(kit, "a", "b", { value: ":R--L:" }),
          edge(kit, "a", "b", { value: ":R--L:" }),
          alignment(kit, "row", ["a", "b"]),
          alignment(kit, "row", ["a", "b"]),
        ],
      ),
    ).toEqual({
      accTitle: "",
      accDescr: "",
      nodes: [
        { id: "a", type: "service", iconText: "", title: "" },
        { id: "b", type: "service", title: "" },
      ],
      groups: [],
      edges: [
        {
          lhsId: "a",
          lhsDir: "R",
          lhsInto: false,
          lhsGroup: false,
          rhsId: "b",
          rhsDir: "L",
          rhsInto: false,
          rhsGroup: false,
        },
        {
          lhsId: "a",
          lhsDir: "R",
          lhsInto: false,
          lhsGroup: false,
          rhsId: "b",
          rhsDir: "L",
          rhsInto: false,
          rhsGroup: false,
        },
      ],
      layoutHints: [
        { direction: "row", members: ["a", "b"] },
        { direction: "row", members: ["a", "b"] },
      ],
    })
  })
  it("keeps empty final accessibility assignments and omits all diagram titles", () => {
    expect(
      summary(
        "architecture-beta\ntitle T\naccTitle: A\naccTitle:\naccDescr { B }\naccDescr {}",
        (kit) => [
          common(kit, "Architecture", "Title", "T"),
          common(kit, "Architecture", "AccTitle", " A"),
          common(kit, "Architecture", "AccTitle", null),
          common(kit, "Architecture", "AccDescrBlock", "B"),
          common(kit, "Architecture", "AccDescrBlock", null),
        ],
        { config: {}, title: "Frontmatter title", dataBlockEffects: [] },
      ),
    ).toEqual({
      accTitle: "",
      accDescr: "",
      nodes: [],
      groups: [],
      edges: [],
      layoutHints: [],
    })
  })
  it("uses converted common values, then shared whitespace and description readings", () => {
    expect(
      summary(
        "architecture-beta\naccTitle:  A  B\t\tC \naccDescr { A\r\n  B\r\n\r\n C }",
        (kit) => [
          common(kit, "Architecture", "AccTitle", "  A  B\t\tC "),
          common(kit, "Architecture", "AccDescrBlock", "A\r\n  B\r\n\r\n C"),
        ],
      ),
    ).toEqual({
      accTitle: "A B C",
      accDescr: "A\nB\nC",
      nodes: [],
      groups: [],
      edges: [],
      layoutHints: [],
    })
  })
  it("sanitizes only common accessibility text and leaves hidden properties unpublished", () => {
    const result = summary(
      'architecture-beta\n---\ntitle: Hidden\n---\naccTitle: <i>A</i>\naccDescr { <b>D</b> }\nservice a "<b>I</b>"[<u>L</u>]',
      (kit) => [
        ignored(kit, "Architecture", "---\ntitle: Hidden\n---", "yaml-block"),
        common(kit, "Architecture", "AccTitle", " <i>A</i>"),
        common(kit, "Architecture", "AccDescrBlock", "<b>D</b>"),
        declaration(kit, "Service", "a", {
          icon: '"<b>I</b>"',
          title: "[<u>L</u>]",
        }),
      ],
      {
        config: { securityLevel: "other", htmlLabels: true },
        title: undefined,
        dataBlockEffects: [],
      },
    )
    expect(result).toEqual({
      accTitle: "&lt;i&gt;A&lt;/i&gt;",
      accDescr: "&lt;b&gt;D&lt;/b&gt;",
      nodes: [
        { id: "a", type: "service", iconText: "<b>I</b>", title: "<u>L</u>" },
      ],
      groups: [],
      edges: [],
      layoutHints: [],
    })
  })
})
