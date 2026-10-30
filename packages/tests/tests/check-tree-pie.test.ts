import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { PIE_CHILD_TYPES, PIE_FIELD_WORDS } from "../src/check-tree/pie.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { nodeWith, tokenWith } from "./check-tree-built.ts"
import { copyOf, setField } from "./check-tree-recorded.ts"
import { buildPie, common, ignored, section } from "./pie-built.ts"
import { commentOf, locationOf, tokenOf } from "./check-tree-trees.ts"
import { readChildFields, readFieldTables } from "./spec-field-tables.ts"

/** A fixed source covering all common statement types, the flag and both shared leaves. */
function allFields() {
  return buildPie(
    'pie showData\ntitle  T \naccTitle:  A \naccDescr:  D \naccDescr { B\nC }\n"A":1.25\n',
    (kit) => [
      common(kit, "PieTitleStatement", " T "),
      common(kit, "PieAccTitleStatement", "  A "),
      common(kit, "PieAccDescrStatement", "  D "),
      common(kit, "PieAccDescrBlockStatement", "B\nC"),
      section(kit, '"A"', "1.25"),
    ],
    true,
  )
}

/** A complete hidden form consumes the physical LF but leaves a spare EOL. */
function trailingHidden() {
  return buildPie('pie\n"A":1%%{!}%%\n\n"B":2\n', (kit) => [
    section(kit, '"A"', "1", {
      after: () => [ignored(kit, "%%{!}%%", "directive")],
    }),
    section(kit, '"B"', "2"),
  ])
}

/** Explicit pre-header occurrences of fixed inputs, without applying a detector or lexer. */
function preheader(
  source: string,
  parts: readonly (readonly [
    string,
    "yaml-block" | "directive",
    (readonly string[])?,
  ])[],
  comment: string | readonly string[] | null = null,
) {
  const built = buildPie(source, () => [])
  let at = 0
  const forms: CheckedNode[] = []
  const tokens = []
  for (const [raw, kind, fragments] of parts) {
    const token = tokenOf(source, "RawText", { text: raw, from: at })
    if (fragments === undefined) tokens.push(token)
    else {
      let from = at
      for (const fragment of fragments) {
        const piece = tokenOf(source, "RawText", { text: fragment, from })
        tokens.push(piece)
        from = piece.range[1]
      }
    }
    at = token.range[1]
    forms.push({
      type: "PieIgnoredText",
      kind,
      value: fragments?.join("") ?? raw,
      range: token.range,
      loc: token.loc,
    })
  }
  const range = [
    forms[0]?.range[0] ?? built.tree.body.range[0],
    built.tree.body.range[1],
  ] as const
  setField(built.tree.body, "textBeforeHeader", forms)
  setField(built.tree.body, "range", range)
  setField(built.tree.body, "loc", locationOf(source, range))
  setField(built.tree, "tokens", [...tokens, ...built.tree.tokens])
  if (comment !== null) {
    let from = 0
    setField(
      built.tree,
      "comments",
      (typeof comment === "string" ? [comment] : comment).map((text) => {
        if (text === "%%") from = source.indexOf("\n%%\n", from) + 1
        const found = commentOf(source, "%%", { text, from })
        from = found.range[1]
        return found
      }),
    )
  }
  return built
}

const VALID = [
  {
    name: "native comment whitespace across a common region",
    built: () =>
      buildPie('pie\n"A":1%% tail\u2028\n%% removed\n"B":2', (kit) => {
        const first = section(kit, '"A"', "1")
        kit.comment("%%", "%% tail")
        kit.comment("%%", "%% removed")
        kit.comment(null, '"B":2')
        return [first]
      }),
  },
  {
    name: "negative value left to parser acceptance",
    built: () => buildPie('pie\n"A":-1', (kit) => [section(kit, '"A"', "-1")]),
  },
  {
    name: "negative duplicate left to parser acceptance",
    built: () =>
      buildPie('pie\n"A":1\n"A":-2\n', (kit) => [
        section(kit, '"A"', "1"),
        section(kit, '"A"', "-2"),
      ]),
  },
  { name: "all fields", built: allFields },
  { name: "empty diagram", built: () => buildPie("pie", () => []) },
  {
    name: "empty common values",
    built: () =>
      buildPie("pie\ntitle\naccTitle:\naccDescr:\naccDescr { }\n", (kit) => [
        common(kit, "PieTitleStatement", null),
        common(kit, "PieAccTitleStatement", null),
        common(kit, "PieAccDescrStatement", null),
        common(kit, "PieAccDescrBlockStatement", null),
      ]),
  },
  {
    name: "single quotes and negative zero",
    built: () =>
      buildPie("pie\n'A\\'B':-0\n", (kit) => [section(kit, "'A\\'B'", "-0")]),
  },
  {
    name: "empty label",
    built: () => buildPie('pie\n"":0', (kit) => [section(kit, '""', "0")]),
  },
  {
    name: "hidden forms in section gaps",
    built: () =>
      buildPie('pie\n"A"%%{!}%%\n:---\nx: [\n---\n1\n', (kit) => [
        section(kit, '"A"', "1", {
          beforeColon: () => [ignored(kit, "%%{!}%%", "directive")],
          beforeValue: () => [ignored(kit, "---\nx: [\n---", "yaml-block")],
        }),
      ]),
  },
  {
    name: "three adjacent YAML fences in one body form",
    built: () =>
      buildPie('pie\n---\n---\n---\n"A":1\n', (kit) => [
        ignored(kit, "---\n---\n---", "yaml-block"),
        section(kit, '"A"', "1"),
      ]),
  },
  {
    name: "adjacent YAML fence retained before a later body closer",
    built: () =>
      buildPie('pie\n---\n---\nx\n---\n"A":1\n', (kit) => [
        ignored(kit, "---\n---\nx\n---", "yaml-block"),
        section(kit, '"A"', "1"),
      ]),
  },
  {
    name: "three adjacent YAML fences before a section value",
    built: () =>
      buildPie('pie\n"A":---\n---\n---\n1\n', (kit) => [
        section(kit, '"A"', "1", {
          beforeValue: () => [ignored(kit, "---\n---\n---", "yaml-block")],
        }),
      ]),
  },
  {
    name: "empty YAML fallback before a section",
    built: () =>
      buildPie('pie\n---\n---\n"A":1\n', (kit) => [
        ignored(kit, "---\n---", "yaml-block"),
        section(kit, '"A"', "1"),
      ]),
  },
  {
    name: "empty YAML fallback at EOF",
    built: () =>
      buildPie("pie\n---\n---", (kit) => [
        ignored(kit, "---\n---", "yaml-block"),
      ]),
  },
  {
    name: "earliest body-present YAML closer before another nonempty block",
    built: () =>
      buildPie('pie\n---\nx\n---\n---\ny\n---\n"A":1\n', (kit) => [
        ignored(kit, "---\nx\n---", "yaml-block"),
        ignored(kit, "---\ny\n---", "yaml-block"),
        section(kit, '"A"', "1"),
      ]),
  },
  { name: "trailing hidden form with spare LF", built: trailingHidden },
  {
    name: "trailing YAML at EOF",
    built: () =>
      buildPie('pie\n"A":1---\nx: y\n---', (kit) => [
        section(kit, '"A"', "1", {
          after: () => [ignored(kit, "---\nx: y\n---", "yaml-block")],
        }),
      ]),
  },
  {
    name: "trailing YAML with space boundary",
    built: () =>
      buildPie('pie\n"A":1---\nx: y\n--- \n"B":2', (kit) => [
        section(kit, '"A"', "1", {
          after: () => [ignored(kit, "---\nx: y\n---", "yaml-block")],
        }),
        section(kit, '"B"', "2"),
      ]),
  },
  {
    name: "common line text ends at a hidden directive",
    built: () =>
      buildPie("pie\ntitle T%%{!}%%", (kit) => [
        common(kit, "PieTitleStatement", "T", () => [
          ignored(kit, "%%{!}%%", "directive"),
        ]),
      ]),
  },
  {
    name: "multiline block opener gap",
    built: () =>
      buildPie("pie\naccDescr\n\u2028{ A }\n", (kit) => [
        common(kit, "PieAccDescrBlockStatement", "A"),
      ]),
  },
  {
    name: "same-line section after flag",
    built: () =>
      buildPie(
        'pie showData "A":1\n',
        (kit) => [section(kit, '"A"', "1")],
        true,
      ),
  },
] as const

describe("pie trees made by hand", () => {
  for (const row of VALID)
    it(`passes ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })

  for (const row of [
    {
      name: "wrong child type",
      type: "PieSectionStatement",
      field: "label",
      value: "wrong",
      message: "label",
    },
    {
      name: "wrong flag",
      type: "PieDiagram",
      field: "showData",
      value: false,
      message: "showData flag",
    },
    {
      name: "unclosed string",
      type: "StringLiteral",
      field: "closed",
      value: false,
      message: "closed STRING",
    },
    {
      name: "changed raw spelling",
      type: "NumericLiteral",
      field: "raw",
      value: "2",
      message: "raw",
    },
    {
      name: "changed numeric value",
      type: "NumericLiteral",
      field: "value",
      value: 2,
      message: "number that its written text writes",
    },
    {
      name: "lost literal",
      type: "PieTitleStatement",
      field: "value",
      value: null,
      message: "composite lexical value",
    },
    {
      name: "empty literal",
      type: "PieLiteral",
      field: "value",
      value: "",
      message: "value is not its written text",
    },
  ])
    it(`reports ${row.name}`, () => {
      const { source, tree } = allFields()
      setField(nodeWith(tree, row.type), row.field, row.value)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  it("rejects punctuation outside the diagram before the header", () => {
    const { source, tree } = buildPie(":pie", () => [])
    setField(tree, "tokens", [
      tokenOf(source, "Punctuator", { text: ":" }),
      ...tree.tokens,
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "does not run from its first token to its last",
    )
  })

  it("passes a retained pre-header YAML block with a blank body line", () => {
    const { source, tree } = preheader(
      "%% c\n---\n\n---\npie\n",
      [["---\n\n---", "yaml-block"]],
      "%% c",
    )
    expect(checkTree(source, tree)).toEqual([])
  })

  it("passes three adjacent YAML fences in one retained pre-header form", () => {
    const { source, tree } = preheader(
      "%% c\n---\n---\n---\npie\n",
      [["---\n---\n---", "yaml-block"]],
      "%% c",
    )
    expect(checkTree(source, tree)).toEqual([])
  })

  for (const row of [
    {
      name: "three adjacent fences split into an empty block and a stray fence",
      built: () =>
        buildPie('pie\n---\n---\n---\n"A":1\n', (kit) => [
          ignored(kit, "---\n---", "yaml-block"),
          ignored(kit, "---", "yaml-block"),
          section(kit, '"A"', "1"),
        ]),
    },
    {
      name: "an adjacent fence chosen before a later qualifying body closer",
      built: () =>
        buildPie('pie\n---\n---\n"A":1\n---\nx\n---\n', (kit) => [
          ignored(kit, "---\n---", "yaml-block"),
          section(kit, '"A"', "1"),
          ignored(kit, "---\nx\n---", "yaml-block"),
        ]),
    },
  ])
    it(`rejects ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toContainEqual({
        where: "PieIgnoredText at 4-11",
        message:
          "the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
      })
    })

  for (const row of [
    {
      name: "retained YAML with LS after a bare line",
      source: "%% c\n---\nx: y\n---\n%%\n\u2028pie",
      parts: [["---\nx: y\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      name: "retained YAML with BOM after a bare line",
      source: "%% c\n---\nx: y\n---\n%%\n\ufeffpie",
      parts: [["---\nx: y\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      name: "retained YAML with an LS-only line after a bare line",
      source: "%% c\n---\nx: y\n---\n%%\n\u2028\npie",
      parts: [["---\nx: y\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      name: "second-scan directive with LS after a bare line",
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028pie",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      name: "second-scan directive with BOM after a bare line",
      source: "%%{\n%% c\nwrap}%%\n%%\n\ufeffpie",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      name: "second-scan directive with an LS-only line after a bare line",
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028\npie",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      name: "bare trivia between retained forms",
      source: "%% c\n---\nx: y\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\npie",
      parts: [
        ["---\nx: y\n---", "yaml-block"],
        ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
      ],
      comments: ["%% c", "%%", "%% gap"],
    },
  ] as const)
    it(`passes detection trivia: ${row.name}`, () => {
      const { source, tree } = preheader(row.source, row.parts, row.comments)
      expect(checkTree(source, tree)).toEqual([])
    })

  for (const row of [
    {
      source: "%% c\n---\nx: y\n---\n\u2028pie",
      parts: [["---\nx: y\n---", "yaml-block"]],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n\u2028pie",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    },
  ] as const)
    it(`rejects ordinary preheader Unicode trivia ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = preheader(row.source, row.parts, "%% c")
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "ASCII whitespace and LF",
      )
    })

  it("keeps body gaps restricted after a native bare line", () => {
    const { source, tree } = buildPie('pie\n%%\n\u2028"A":1', (kit) => {
      kit.comment("%%", "%%")
      return [section(kit, '"A"', "1")]
    })
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })

  it("passes a bare empty-brace comment detection read before the header", () => {
    const { source, tree } = preheader("%%{}%%\npie", [], "%%{}%%")
    expect(checkTree(source, tree)).toEqual([])
  })

  it("passes a native comment without a complete hidden directive closer", () => {
    const { source, tree } = buildPie('pie\n"A":1%%{}x%\n"B":2\n', (kit) => {
      const first = section(kit, '"A"', "1")
      kit.comment("%%", "%%{}x%")
      return [first, section(kit, '"B"', "2")]
    })
    expect(checkTree(source, tree)).toEqual([])
  })

  for (const row of [
    { source: 'pie\n"A%%{}%% B":1\n', block: false },
    { source: "pie\naccDescr { A%%{}%% B }\n", block: true },
  ])
    it(`rejects a native Comment inside an earlier composite ${row.block}`, () => {
      const { source, tree } = buildPie(row.source, (kit) => [
        row.block
          ? common(kit, "PieAccDescrBlockStatement", "A%%{}%% B")
          : section(kit, '"A%%{}%% B"', "1"),
      ])
      setField(tree, "comments", [commentOf(source, "%%", { text: "%%{}%%" })])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "cannot start inside a STRING or composite description block",
      )
    })

  for (const row of [
    { source: 'pie\n"A":1%%{}%%\n"B":2\n', type: "section", value: "" },
    {
      source: 'pie\ntitle T%%{}%%\n"A":1\n',
      type: "PieTitleStatement",
      value: "T",
    },
    {
      source: 'pie\naccTitle: AT%%{}%%\n"A":1\n',
      type: "PieAccTitleStatement",
      value: " AT",
    },
    {
      source: 'pie\naccDescr: AD%%{}%%\n"A":1\n',
      type: "PieAccDescrStatement",
      value: " AD",
    },
    {
      source: 'pie\naccDescr { AD }%%{}%%\n"A":1\n',
      type: "PieAccDescrBlockStatement",
      value: "AD",
    },
    { source: 'pie\n%%{}%%\n"B":2\n', type: "body", value: "" },
  ] as const)
    it(`rejects a native Comment hiding DIRECTIVE after ${row.type}`, () => {
      const { source, tree } = buildPie(row.source, (kit) => {
        const first =
          row.type === "section"
            ? [section(kit, '"A"', "1")]
            : row.type === "body"
              ? []
              : [common(kit, row.type, row.value)]
        kit.comment("%%", "%%{}%%")
        const followingSection =
          row.type === "section" || row.type === "body"
            ? section(kit, '"B"', "2")
            : section(kit, '"A"', "1")
        return [...first, followingSection]
      })
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "earlier hidden DIRECTIVE rule",
      )
    })

  for (const row of [
    {
      source: "%% c\n---\na: b\n---\n---\nc: d\n---\npie\n",
      parts: [
        ["---\na: b\n---", "yaml-block"],
        ["---\nc: d\n---", "yaml-block"],
      ],
      comment: "%% c",
      message: "only one retained YAML block",
    },
    {
      source: "%% heading\n---\n---\npie",
      parts: [["---\n---", "yaml-block"]],
      comment: "%% heading",
      message: "requires a body line",
    },
    {
      source: "%%\n---\ntitle: Hidden\n---\npie",
      parts: [["---\ntitle: Hidden\n---", "yaml-block"]],
      comment: "%%",
      message: "native bare percent line before YAML",
    },
    {
      source: "%%{}%%\npie",
      parts: [["%%{}%%", "directive"]],
      comment: null,
      message: "bare percent forms are Comments",
    },
    {
      source: "%%{!}%%\npie",
      parts: [["%%{!}%%", "directive"]],
      comment: null,
      message: "bare percent forms are Comments",
    },
  ] as const)
    it(`rejects invalid pre-header ownership ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = preheader(row.source, row.parts, row.comment)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  it("reports a changed token kind", () => {
    const { source, tree } = allFields()
    setField(tokenWith(tree, ":"), "type", "Keyword")
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      'not \\"Punctuator\\"',
    )
  })

  it("reports fields in the wrong source order", () => {
    const { source, tree } = trailingHidden()
    const statement = nodeWith(tree, "PieSectionStatement")
    setField(statement, "textBeforeValue", statement.textAfter)
    setField(statement, "textAfter", [])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "specified source order",
    )
  })

  it("reports hidden forms with an invalid kind or changed written value", () => {
    const { source, tree } = trailingHidden()
    const broken = copyOf(tree)
    setField(nodeWith(broken, "PieIgnoredText"), "kind", "yaml")
    expect(JSON.stringify(checkTree(source, broken))).toContain(
      "none of yaml-block, directive",
    )
    setField(nodeWith(tree, "PieIgnoredText"), "value", "x")
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "value is not its written text",
    )
  })

  for (const row of [
    { source: 'pie\n"A":01', raw: "01", message: "pie-number" },
    { source: 'pie\n"A":+1', raw: "+1", message: "pie-number" },
    { source: 'pie\n"A":1e2', raw: "1e2", message: "pie-number" },
    { source: 'pie\n"A":1.', raw: "1.", message: "pie-number" },
  ])
    it(`rejects the number spelling ${row.raw}`, () => {
      const { source, tree } = buildPie(row.source, (kit) => [
        section(kit, '"A"', row.raw),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  for (const row of [
    { source: 'pie\n"A":1%%{!}%%\n"B":2', raw: "%%{!}%%", kind: "directive" },
    {
      source: 'pie\n"A":1---\nx: y\n---\n"B":2',
      raw: "---\nx: y\n---",
      kind: "yaml-block",
    },
  ] as const)
    it(`rejects the only LF consumed by ${row.kind}`, () => {
      const { source, tree } = buildPie(row.source, (kit) => [
        section(kit, '"A"', "1", {
          after: () => [ignored(kit, row.raw, row.kind)],
        }),
        section(kit, '"B"', "2"),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "consumed the only LF",
      )
    })

  for (const row of [
    {
      source: 'pie\ntitle T%%{!}%%\n"A":1',
      type: "PieTitleStatement",
      value: "T",
    },
    {
      source: 'pie\naccTitle: T%%{!}%%\n"A":1',
      type: "PieAccTitleStatement",
      value: " T",
    },
    {
      source: 'pie\naccDescr: T%%{!}%%\n"A":1',
      type: "PieAccDescrStatement",
      value: " T",
    },
    {
      source: 'pie\naccDescr { T }%%{!}%%\n"A":1',
      type: "PieAccDescrBlockStatement",
      value: "T",
    },
  ] as const)
    it(`rejects the only LF consumed after ${row.type}`, () => {
      const { source, tree } = buildPie(row.source, (kit) => [
        common(kit, row.type, row.value, () => [
          ignored(kit, "%%{!}%%", "directive"),
        ]),
        section(kit, '"A"', "1"),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "consumed the only LF",
      )
    })

  for (const row of [
    {
      source: "pie\n---\nx: y\n ---",
      raw: "---\nx: y\n ---",
      kind: "yaml-block",
    },
    { source: "pie\n%%{!}%%x", raw: "%%{!}%%x", kind: "directive" },
    { source: "pie\n%%{!}%%\n", raw: "%%{!}%%\n", kind: "directive" },
    { source: "pie\n---\nx: y", raw: "---\nx: y", kind: "yaml-block" },
    { source: "pie\n%%{!", raw: "%%{!", kind: "directive" },
  ] as const)
    it(`rejects an incomplete or overlong hidden form ${JSON.stringify(row.raw)}`, () => {
      const { source, tree } = buildPie(row.source, (kit) => [
        ignored(kit, row.raw, row.kind),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "one complete hidden",
      )
    })

  for (const row of [
    { source: 'pie\n"A"\n:1', label: '"A"' },
    { source: 'pie\n"A\\\nB":1', label: '"A\\\nB"' },
    { source: 'pie\n"A\\\u2028B":1', label: '"A\\\u2028B"' },
    { source: 'pie\n"A:1', label: '"A' },
  ])
    it(`rejects a broken string or its section gap ${JSON.stringify(row.label)}`, () => {
      const { source, tree } = buildPie(row.source, (kit) => [
        section(kit, row.label, "1"),
      ])
      expect(checkTree(source, tree).length).toBeGreaterThan(0)
    })

  it("rejects arbitrary text held as a hidden form", () => {
    const { source, tree } = buildPie("pie\nnot-hidden", (kit) => [
      ignored(kit, "not-hidden", "directive"),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "one complete hidden",
    )
  })

  it("requires child types and their order to agree with the specification tables", () => {
    const fields = readFieldTables()
    const orders = readChildFields()
    for (const [type, children] of Object.entries(PIE_CHILD_TYPES)) {
      expect(Object.keys(children)).toEqual(orders.get(type))
      for (const [field, types] of Object.entries(children)) {
        const named = [
          ...(fields.get(type)?.get(field) ?? "").matchAll(
            /\b(?:Pie\w+|StringLiteral|NumericLiteral)\b/gu,
          ),
        ].map((match) => match[0])
        const expanded = named.flatMap((name) =>
          name === "PieBodyItem"
            ? [
                "PieSectionStatement",
                "PieTitleStatement",
                "PieAccTitleStatement",
                "PieAccDescrStatement",
                "PieAccDescrBlockStatement",
                "PieIgnoredText",
              ]
            : [name],
        )
        expect([...types].sort(), `${type}.${field}`).toEqual(expanded.sort())
      }
    }
    expect(PIE_FIELD_WORDS.PieIgnoredText?.kind).toEqual([
      "yaml-block",
      "directive",
    ])
    expect(nodesOf(allFields().tree).map((node) => node.type)).toContain(
      "PieAccDescrBlockStatement",
    )
  })
})
