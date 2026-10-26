import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { TREEMAP_CHILD_TYPES } from "../src/check-tree/treemap.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { itFailsEach, nodeWith, tokenWith } from "./check-tree-built.ts"
import type { Built } from "./check-tree-built.ts"
import { copyOf, setField } from "./check-tree-recorded.ts"
import { commentOf, directiveOf, tokenOf } from "./check-tree-trees.ts"
import { readChildFields } from "./spec-field-tables.ts"
import { buildTreemap, classDef, common, row } from "./treemap-built.ts"

/** All nine node types and every optional child, written in a flat body. */
export function allFields(): Built {
  return buildTreemap(
    'treemap-beta\ntitle  T \n"A":::hot\n  "b" : 1,234.5:::hot\nclassDef hot fill:red, color:blue;\naccTitle: A\naccDescr: D\naccDescr { B\n C }',
    (kit) => [
      common(kit, "Title", " T "),
      row(kit, 0, '"A"', null, "hot"),
      row(kit, 2, '"b"', "1,234.5", "hot"),
      classDef(kit, 0, "hot", "fill:red, color:blue"),
      common(kit, "AccTitle", " A"),
      common(kit, "AccDescr", " D"),
      common(kit, "AccDescrBlock", "B\n C"),
    ],
    true,
  )
}

/** Detection-only prefix comments, supplied independently of the header and body. */
function beforeHeader(source: string, comments: readonly string[]): Built {
  const built = buildTreemap(source, () => [])
  let from = 0
  setField(
    built.tree,
    "comments",
    comments.map((text) => {
      const comment = commentOf(source, "%%", { text, from })
      from = comment.range[1]
      return comment
    }),
  )
  return built
}

/** A retained one-line Comment with one shared source Directive and optional passed bare lines. */
function retained(source: string, comments: readonly string[]): Built {
  const built = beforeHeader(source, comments)
  setField(built.tree, "directives", [
    directiveOf(source, { text: "%%{wrap}%%" }),
  ])
  return built
}

const VALID: readonly { name: string; built: () => Built }[] = [
  { name: "all nine nodes", built: allFields },
  {
    name: "native-looking form inside a string",
    built: () =>
      buildTreemap('treemap\n"%%{!}%%":1', (kit) => [
        row(kit, 0, '"%%{!}%%"', "1"),
      ]),
  },
  {
    name: "JSON-null NaN field",
    built: () => {
      const built = buildTreemap('treemap\n"a":.', (kit) => [
        row(kit, 0, '"a"', "."),
      ])
      setField(nodeWith(built.tree, "NumericLiteral"), "value", null)
      return built
    },
  },
  {
    name: "null title separator before another common form",
    built: () =>
      buildTreemap("treemap\ntitle \naccTitle:", (kit) => [
        common(kit, "Title", null),
        common(kit, "AccTitle", null),
      ]),
  },
  {
    name: "retained prefix before a passed Unicode line",
    built: () =>
      retained("%%{%%{wrap}%%wrap}%%\n\u00a0\n%%\ntreemap", [
        "%%{%%{wrap}%%wrap}%%",
        "%%",
      ]),
  },
  {
    name: "passed Unicode line before a retained prefix",
    built: () =>
      retained("%%\n\u00a0\n%%{%%{wrap}%%wrap}%%\ntreemap", [
        "%%",
        "%%{%%{wrap}%%wrap}%%",
      ]),
  },
  {
    name: "passed trivia immediately before the header",
    built: () =>
      retained("%%\n%%{%%{wrap}%%wrap}%%\n\u00a0treemap", [
        "%%",
        "%%{%%{wrap}%%wrap}%%",
      ]),
  },
  {
    name: "passed trivia between retained prefixes",
    built: () => {
      const source =
        "%%{%%{wrap}%%wrap}%%\n%%\n\u00a0\n%%{%%{wrap}%%wrap}%%\ntreemap"
      const built = retained(source, [
        "%%{%%{wrap}%%wrap}%%",
        "%%",
        "%%{%%{wrap}%%wrap}%%",
      ])
      setField(built.tree, "directives", [
        directiveOf(source, { text: "%%{wrap}%%" }),
        directiveOf(source, { text: "%%{wrap}%%", from: 25 }),
      ])
      return built
    },
  },
  { name: "empty body at EOF", built: () => buildTreemap("treemap", () => []) },
  {
    name: "glued rows and header",
    built: () =>
      buildTreemap('treemap"A""b",1', (kit) => [
        row(kit, 0, '"A"'),
        row(kit, 0, '"b"', "1", null, ","),
      ]),
  },
  {
    name: "empty names, NaN and a single-letter selector",
    built: () =>
      buildTreemap('treemap\n"":.:::a\n""', (kit) => [
        row(kit, 0, '""', ".", "a"),
        row(kit, 0, '""'),
      ]),
  },
  {
    name: "number underscores and multiple dots",
    built: () =>
      buildTreemap('treemap\n"a":1_234\n"b":1.2.3', (kit) => [
        row(kit, 0, '"a"', "1_234"),
        row(kit, 0, '"b"', "1.2.3"),
      ]),
  },
  {
    name: "single quotes, backslash and physical newline",
    built: () =>
      buildTreemap("treemap\n'a\\\nb':1", (kit) => [
        row(kit, 0, "'a\\\nb'", "1"),
      ]),
  },
  {
    name: "trailing section indentation",
    built: () =>
      buildTreemap('treemap\n"A" \n"b":1', (kit) => [
        row(kit, 0, '"A"'),
        row(kit, 1, '"b"', "1"),
      ]),
  },
  {
    name: "header tabs count once each",
    built: () => buildTreemap('treemap\t\n"a"', (kit) => [row(kit, 1, '"a"')]),
  },
  {
    name: "indent on a whitespace-only line",
    built: () => buildTreemap('treemap\n \n"a"', (kit) => [row(kit, 1, '"a"')]),
  },
  {
    name: "separator indentation can precede LF",
    built: () =>
      buildTreemap('treemap\n"a" \n:\t\n1', (kit) => [row(kit, 0, '"a"', "1")]),
  },
  {
    name: "selector gaps contain LF and native comments",
    built: () => {
      const built = buildTreemap('treemap\n"a"\n%%{!}%%\n:::\na', (kit) => [
        row(kit, 0, '"a"', null, "a"),
      ])
      setField(built.tree, "comments", [
        commentOf(built.source, "%%", { text: "%%{!}%%" }),
      ])
      return built
    },
  },
  {
    name: "class name bypasses keyword priority",
    built: () =>
      buildTreemap('treemap\nclassDef title;"a":::true', (kit) => [
        classDef(kit, 0, "title", null),
        row(kit, 0, '"a"', null, "true"),
      ]),
  },
  {
    name: "class style owns quotes and percent forms",
    built: () =>
      buildTreemap('treemap\nclassDef aa "x" %%{!}%%;', (kit) => [
        classDef(kit, 0, "aa", '"x" %%{!}%%'),
      ]),
  },
  {
    name: "style takes the next row across blank lines",
    built: () =>
      buildTreemap('treemap\nclassDef aa \n\n  "b":1', (kit) => [
        classDef(kit, 0, "aa", '"b":1', false),
      ]),
  },
  {
    name: "empty class consumes its whitespace",
    built: () =>
      buildTreemap("treemap\nclassDef aa \n\t", (kit) => [
        classDef(kit, 0, "aa", null, false),
      ]),
  },
  {
    name: "style padding is authored",
    built: () =>
      buildTreemap("treemap\nclassDef aa fill:red  ;", (kit) => [
        classDef(kit, 0, "aa", "fill:red  "),
      ]),
  },
  {
    name: "null title consumes one separator",
    built: () =>
      buildTreemap('treemap\ntitle \n"a"', (kit) => [
        common(kit, "Title", null),
        row(kit, 0, '"a"'),
      ]),
  },
  {
    name: "whitespace-only common values",
    built: () =>
      buildTreemap("treemap\ntitle  \naccTitle:\t\naccDescr: ", (kit) => [
        common(kit, "Title", " "),
        common(kit, "AccTitle", "\t"),
        common(kit, "AccDescr", " "),
      ]),
  },
  {
    name: "null common values and adjacent block",
    built: () =>
      buildTreemap(
        'treemap title\naccTitle:\naccDescr:\naccDescr {}"a"',
        (kit) => [
          common(kit, "Title", null),
          common(kit, "AccTitle", null),
          common(kit, "AccDescr", null),
          common(kit, "AccDescrBlock", null),
          row(kit, 0, '"a"'),
        ],
      ),
  },
  {
    name: "block owns native-looking text",
    built: () =>
      buildTreemap('treemap accDescr { %%{! }%%\n"a"', (kit) => {
        const block = common(kit, "AccDescrBlock", "%%{!")
        kit.comment("%%", "%%")
        return [block, row(kit, 0, '"a"')]
      }),
  },
  {
    name: "LS and PS remain style text",
    built: () =>
      buildTreemap("treemap\nclassDef aa x\u2028y\u2029z;", (kit) => [
        classDef(kit, 0, "aa", "x\u2028y\u2029z"),
      ]),
  },
  {
    name: "passed bare lines carry Unicode trivia",
    built: () => beforeHeader("%%\n\u00a0\n%%\n\u2028treemap", ["%%", "%%"]),
  },
]

/** A real global Directive outside all enclosing values, with its single token. */
function globalDirective(): Built {
  const source = "%%{wrap}%%\ntreemap"
  const built = buildTreemap(source, () => [])
  setField(built.tree, "directives", [
    directiveOf(source, { text: "%%{wrap}%%" }),
  ])
  setField(built.tree, "tokens", [
    tokenOf(source, "Directive", { text: "%%{wrap}%%" }),
    ...built.tree.tokens,
  ])
  return built
}

describe("treemap tree conditions", () => {
  for (const test of VALID)
    it(`accepts ${test.name}`, () => {
      const built = test.built()
      expect(checkTree(built.source, built.tree)).toEqual([])
    })

  it("matches every child field and type declared by the AST", () => {
    const fields = readChildFields()
    for (const [type, children] of Object.entries(TREEMAP_CHILD_TYPES))
      expect(Object.keys(children), type).toEqual(fields.get(type))
    expect(
      new Set(
        nodesOf(allFields().tree)
          .filter((node) => node.type.startsWith("Treemap"))
          .map((node) => node.type),
      ).size,
    ).toBe(9)
  })

  itFailsEach([
    {
      name: "removed global Directive disguised as a native Comment",
      built: globalDirective,
      mutate: (tree, source) => {
        setField(
          tree,
          "tokens",
          tree.tokens.filter((token) => token.type !== "Directive"),
        )
        setField(tree, "comments", [
          commentOf(source, "%%", { text: "%%{wrap}%%" }),
        ])
      },
      expected: "native Comment cannot start inside a removed source Directive",
    },
    {
      name: "changed class indentation",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreemapClassDefStatement"), "indent", 1),
      expected: "indent must equal",
    },
    {
      name: "native Comment disguised inside a string",
      built: () =>
        buildTreemap('treemap\n"%%{!}%%":1', (kit) => [
          row(kit, 0, '"%%{!}%%"', "1"),
        ]),
      mutate: (tree, source) =>
        setField(tree, "comments", [
          commentOf(source, "%%", { text: "%%{!}%%" }),
        ]),
      expected: "native Comment cannot start inside",
    },
    {
      name: "native Comment disguised inside a class style",
      built: () =>
        buildTreemap("treemap\nclassDef aa %%{!}%%;", (kit) => [
          classDef(kit, 0, "aa", "%%{!}%%"),
        ]),
      mutate: (tree, source) =>
        setField(tree, "comments", [
          commentOf(source, "%%", { text: "%%{!}%%" }),
        ]),
      expected: "native Comment cannot start inside",
    },
    {
      name: "native Comment disguised inside a block value",
      built: () =>
        buildTreemap("treemap accDescr { %%{! }", (kit) => [
          common(kit, "AccDescrBlock", "%%{!"),
        ]),
      mutate: (tree, source) =>
        setField(tree, "comments", [commentOf(source, "%%", { text: "%%{!" })]),
      expected: "native Comment cannot start inside",
    },
    {
      name: "changed row indentation",
      built: allFields,
      mutate: (tree) => setField(nodeWith(tree, "TreemapLeaf"), "indent", 0),
      expected: "indent must equal",
    },
    {
      name: "negative indentation",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreemapSection"), "indent", -1),
      expected: "indent must equal",
    },
    {
      name: "fractional indentation",
      built: allFields,
      mutate: (tree) => setField(nodeWith(tree, "TreemapLeaf"), "indent", 2.5),
      expected: "indent must equal",
    },
    {
      name: "indent included in a row range",
      built: allFields,
      mutate: (tree) => {
        const node = nodeWith(tree, "TreemapLeaf")
        setField(node, "range", [node.range[0] - 2, node.range[1]])
      },
      expected: "the range, which runs",
    },
    {
      name: "lost selector child",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreemapSection"), "classSelector", null),
      expected: "the row's separator and selector components",
    },
    {
      name: "lost style child",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreemapClassDefStatement"), "style", null),
      expected: "style must fill",
    },
    {
      name: "lost common value",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreemapTitleStatement"), "value", null),
      expected: "complete composite lexical value",
    },
    {
      name: "wrong separator token kind",
      built: allFields,
      mutate: (tree) => setField(tokenWith(tree, ":"), "type", "Keyword"),
      expected: "the kind of a token",
    },
    {
      name: "number field converted with Number",
      built: allFields,
      mutate: (tree) => setField(nodeWith(tree, "NumericLiteral"), "value", 1),
      expected: "value is not the number",
    },
    {
      name: "unclosed string field",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "StringLiteral"), "closed", false),
      expected: "first matching quote",
    },
    {
      name: "duplicate row",
      built: allFields,
      mutate: (tree) => {
        const body = tree.body.body as unknown[]
        body.splice(2, 0, structuredClone(body[1]))
      },
      expected: "child fields are not in their specified source order",
    },
  ])

  it("retains a second-scan comment and the inner directive exactly once", () => {
    const source = "%%{%%{wrap}%%wrap}%%\ntreemap"
    const built = buildTreemap(source, () => [])
    setField(built.tree, "comments", [
      commentOf(source, "%%", { text: "%%{%%{wrap}%%wrap}%%" }),
    ])
    const directive = directiveOf(source, { text: "%%{wrap}%%" })
    setField(built.tree, "directives", [directive])
    expect(checkTree(source, built.tree)).toEqual([])
    const broken = copyOf(built.tree)
    setField(broken, "directives", [])
    expect(checkTree(source, broken).length).toBeGreaterThan(0)
  })

  const lexical: readonly [string, () => Built, string][] = [
    [
      "retained prefix without a passed Unicode line",
      () =>
        retained("%%{%%{wrap}%%wrap}%%\n\u00a0\ntreemap", [
          "%%{%%{wrap}%%wrap}%%",
        ]),
      "pre-header gap without",
    ],
    [
      "retained prefix without a passed ASCII indent",
      () =>
        retained("%%{%%{wrap}%%wrap}%%\n treemap", ["%%{%%{wrap}%%wrap}%%"]),
      "pre-header gap without",
    ],
    [
      "two indentation units",
      () =>
        buildTreemap('treemap\n"a" \n  "b"', (kit) => [
          row(kit, 0, '"a"'),
          row(kit, 3, '"b"'),
        ]),
      "two separate indentation",
    ],
    [
      "selector indentation",
      () =>
        buildTreemap('treemap\n"a" :::a', (kit) => [
          row(kit, 0, '"a"', null, "a"),
        ]),
      "selector gap cannot",
    ],
    [
      "selector keyword priority",
      () =>
        buildTreemap('treemap\n"a":::titleX', (kit) => [
          row(kit, 0, '"a"', null, "titleX"),
        ]),
      "identifier is not",
    ],
    [
      "short class name",
      () =>
        buildTreemap("treemap\nclassDef a;", (kit) => [
          classDef(kit, 0, "a", null),
        ]),
      "identifier is not",
    ],
    [
      "unowned trailing indent",
      () => buildTreemap("treemap ", () => []),
      "unused indentation",
    ],
    [
      "body Unicode gap",
      () => buildTreemap('treemap\n\u00a0"a"', (kit) => [row(kit, 0, '"a"')]),
      "gap is not ASCII",
    ],
    [
      "indent before a later-line common form",
      () =>
        buildTreemap("treemap \ntitle X", (kit) => [common(kit, "Title", "X")]),
      "earlier indentation",
    ],
    [
      "long string past the first quote",
      () => buildTreemap('treemap\n"a"b"', (kit) => [row(kit, 0, '"a"b"')]),
      "first matching quote",
    ],
  ]
  for (const [name, make, message] of lexical)
    it(`reports ${name}`, () => {
      const built = make()
      expect(
        checkTree(built.source, built.tree).some((problem) =>
          problem.message.includes(message),
        ),
      ).toBe(true)
    })
})
