import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { TREEVIEW_CHILD_TYPES } from "../src/check-tree/treeview.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { itFailsEach, nodeWith, tokenWith } from "./check-tree-built.ts"
import type { Built } from "./check-tree-built.ts"
import { copyOf, setField } from "./check-tree-recorded.ts"
import {
  commentOf,
  directiveOf,
  locationOf,
  tokenOf,
} from "./check-tree-trees.ts"
import { withBefore, withChildren } from "./nesting-built.ts"
import {
  readChildFields,
  readChildTypeNames,
  readFieldTables,
} from "./spec-field-tables.ts"
import {
  annotation,
  buildTreeview,
  common,
  decoration,
  prefix,
  row,
} from "./treeview-built.ts"

/** All thirteen treeview types, with source spelling and nested children intact. */
function allFields(): Built {
  return buildTreeview(
    'treeView-beta\ntitle Tree\naccTitle: A\naccDescr: D\naccDescr { B\n C }\nroot/\n├── "child" :::hot icon(pack:file) ## detail\n│\n└── other',
    (kit) => [
      common(kit, "Title", "Tree"),
      common(kit, "AccTitle", " A"),
      common(kit, "AccDescr", " D"),
      common(kit, "AccDescrBlock", " B\n C "),
      withChildren(kit, row(kit, 0, "root/"), [
        row(
          kit,
          4,
          '"child"',
          () => [
            annotation(kit, "Class", "hot"),
            annotation(kit, "Icon", "pack:file"),
            annotation(kit, "Description", " detail"),
          ],
          prefix(kit, "├──"),
        ),
        (() => {
          const before = decoration(kit)
          return withBefore(
            kit,
            row(kit, 4, "other", undefined, prefix(kit, "└──", "└")),
            "textBefore",
            [before],
          )
        })(),
      ]),
    ],
  )
}

/** Shared detection records are independent of the authored header. */
function beforeHeader(
  source: string,
  comments: readonly string[],
  directives: readonly string[] = [],
): Built {
  const built = buildTreeview(source, () => [])
  let from = 0
  setField(
    built.tree,
    "comments",
    comments.map((text) => {
      const found = commentOf(source, "%%", { text, from })
      from = found.range[1]
      return found
    }),
  )
  from = 0
  const records = directives.map((text) => {
    const found = directiveOf(source, { text, from })
    from = found.range[1]
    return found
  })
  setField(built.tree, "directives", records)
  setField(
    built.tree,
    "tokens",
    [
      ...records
        .filter(
          (record) =>
            !built.tree.comments.some(
              (comment) =>
                comment.range[0] <= record.range[0] &&
                record.range[1] <= comment.range[1],
            ),
        )
        .map((record) =>
          tokenOf(source, "Directive", {
            text: source.slice(...record.range),
            from: record.range[0],
          }),
        ),
      ...built.tree.tokens,
    ].sort((a, b) => a.range[0] - b.range[0]),
  )
  return built
}

/** Decoration between a completed name and its following annotation. */
function annotationGap(): Built {
  return buildTreeview("treeView-beta\n├── node\n│\n└── :::hot", (kit) => [
    row(
      kit,
      4,
      "node",
      () => [
        annotation(
          kit,
          "Class",
          "hot",
          [decoration(kit)],
          prefix(kit, "└──", "└"),
        ),
      ],
      prefix(kit, "├──"),
    ),
  ])
}

/** A pending ordinary run survives an intervening box decoration. */
function nameGap(): Built {
  return buildTreeview('treeView-beta\n"root" \n│\nchild─', (kit) => [
    withChildren(kit, row(kit, 0, '"root"'), [
      row(kit, 1, "child─", undefined, null, [decoration(kit)]),
    ]),
  ])
}

/** Required block-opener gap owns both decoration and prefix. */
function openerGap(): Built {
  return buildTreeview(
    "treeView-beta\naccDescr\n│\n└── { B }\n├── node",
    (kit) => [
      common(kit, "AccDescrBlock", " B ", null, () => [
        decoration(kit),
        prefix(kit, "└──", "└"),
      ]),
      row(kit, 4, "node", undefined, prefix(kit, "├──")),
    ],
  )
}

const VALID: readonly { name: string; built: () => Built }[] = [
  { name: "all thirteen types", built: allFields },
  { name: "annotation-owned forms", built: annotationGap },
  { name: "pending-name decoration", built: nameGap },
  { name: "required block-opener forms", built: openerGap },
  {
    name: "header at EOF",
    built: () => buildTreeview("treeView-beta", () => []),
  },
  {
    name: "adjacent empty quotes and numeric-looking bare name",
    built: () =>
      buildTreeview("treeView-beta\n\"\"''42", (kit) => [
        row(kit, 0, '""'),
        row(kit, 0, "''"),
        row(kit, 0, "42"),
      ]),
  },
  {
    name: "empty icon, empty description and repeated assignments",
    built: () =>
      buildTreeview("treeView-beta\nnode :::A icon() :::B ##\n ## x", (kit) => [
        row(kit, 0, "node", () => [
          annotation(kit, "Class", "A"),
          annotation(kit, "Icon", null),
          annotation(kit, "Class", "B"),
          annotation(kit, "Description", null),
          annotation(kit, "Description", " x"),
        ]),
      ]),
  },
  {
    name: "quoted trailing tab supplies next indentation",
    built: () =>
      buildTreeview('treeView-beta\n"a"\t\n"b"', (kit) => [
        withChildren(kit, row(kit, 0, '"a"'), [row(kit, 1, '"b"')]),
      ]),
  },
  {
    name: "native comment keeps branch indentation for the next name",
    built: () =>
      buildTreeview("treeView-beta\n├── %%\nchild", (kit) => {
        const branch = prefix(kit, "├──")
        kit.comment("%%", "%%")
        return [row(kit, 4, "child", undefined, branch)]
      }),
  },
  {
    name: "decoration in an open quote remains inside its leaf",
    built: () =>
      buildTreeview('treeView-beta\n"a\n│\nb"\n├── child', (kit) => [
        withChildren(kit, row(kit, 0, '"a\n│\nb"'), [
          row(kit, 4, "child", undefined, prefix(kit, "├──")),
        ]),
      ]),
  },
  {
    name: "branch inside an open quote remains inside its leaf",
    built: () =>
      buildTreeview('treeView-beta\n"a\n└── b"', (kit) => [
        row(kit, 0, '"a\n└── b"'),
      ]),
  },
  {
    name: "decoration inside a block remains inside its payload",
    built: () =>
      buildTreeview("treeView-beta\naccDescr {a\n│\nb}\n├── x", (kit) => [
        common(kit, "AccDescrBlock", "a\n│\nb"),
        row(kit, 4, "x", undefined, prefix(kit, "├──")),
      ]),
  },
  {
    name: "no active box mode leaves vertical text as a name",
    built: () => buildTreeview("treeView-beta\n│", (kit) => [row(kit, 0, "│")]),
  },
  {
    name: "empty and whitespace-only common payloads",
    built: () =>
      buildTreeview(
        "treeView-beta\ntitle \naccTitle:\t\naccDescr: \naccDescr {  }",
        (kit) => [
          common(kit, "Title", null),
          common(kit, "AccTitle", "\t"),
          common(kit, "AccDescr", " "),
          common(kit, "AccDescrBlock", "  "),
        ],
      ),
  },
  {
    name: "first block closer and percent text enclosed by the payload",
    built: () =>
      buildTreeview('treeView-beta\naccDescr { %%{! }%%\n"x"', (kit) => {
        const block = common(kit, "AccDescrBlock", " %%{! ")
        kit.comment("%%", "%%")
        return [block, row(kit, 0, '"x"')]
      }),
  },
  {
    name: "common value ends before native percent text",
    built: () =>
      buildTreeview("treeView-beta\ntitle A%%{!}%%", (kit) => {
        const title = common(kit, "Title", "A")
        kit.comment("%%", "%%{!}%%")
        return [title]
      }),
  },
  {
    name: "first quote and first block closer leave following bare names",
    built: () =>
      buildTreeview('treeView-beta\naccDescr {a}b}\n"x"y"', (kit) => [
        common(kit, "AccDescrBlock", "a"),
        row(kit, 0, "b}"),
        row(kit, 0, '"x"'),
        row(kit, 0, 'y"'),
      ]),
  },
  {
    name: "literal slash comment-looking name",
    built: () =>
      buildTreeview("treeView-beta\n/* x */", (kit) => [
        row(kit, 0, "/* x */"),
      ]),
  },
  {
    name: "common block opener accepts Notation whitespace",
    built: () =>
      buildTreeview("treeView-beta\naccDescr\u00a0\u2028{ x }", (kit) => [
        common(kit, "AccDescrBlock", " x "),
      ]),
  },
  {
    name: "common statements can have their own branch prefix",
    built: () =>
      buildTreeview("treeView-beta\n├── accTitle: A\n└── node", (kit) => [
        common(kit, "AccTitle", " A", prefix(kit, "├──")),
        row(kit, 4, "node", undefined, prefix(kit, "└──", "└")),
      ]),
  },
  {
    name: "arbitrary source prefix stays RawText before the branch",
    built: () =>
      buildTreeview("treeView-beta\nx y ├─━ node", (kit) => [
        row(kit, 8, "node", undefined, prefix(kit, "x y ├─━")),
      ]),
  },
  {
    name: "attribute conversion supplies a differently spelled closing quote",
    built: () =>
      buildTreeview("treeView-beta\n'<b x=\"y\">a</b><BR>z'", (kit) => [
        row(kit, 0, "'<b x=\""),
        row(kit, 0, "y\">a</b><BR>z'"),
      ]),
  },
  {
    name: "LS and PS are authored text",
    built: () =>
      buildTreeview(
        "treeView-beta\naccTitle: A\u2028B\nnode ## x\u2029y",
        (kit) => [
          common(kit, "AccTitle", " A\u2028B"),
          row(kit, 0, "node", () => [
            annotation(kit, "Description", " x\u2029y"),
          ]),
        ],
      ),
  },
  {
    name: "native-looking percent text inside a bare name",
    built: () =>
      buildTreeview("treeView-beta\na%%{!}%%", (kit) => [
        row(kit, 0, "a%%{!}%%"),
      ]),
  },
  {
    name: "retained one-line Comment without a passed line",
    built: () =>
      beforeHeader(
        "%%{%%{wrap}%%wrap}%%\ntreeView-beta",
        ["%%{%%{wrap}%%wrap}%%"],
        ["%%{wrap}%%"],
      ),
  },
  {
    name: "retained Comment before passed Unicode trivia",
    built: () =>
      beforeHeader(
        "%%{%%{wrap}%%wrap}%%\n%%\n\u00a0treeView-beta",
        ["%%{%%{wrap}%%wrap}%%", "%%"],
        ["%%{wrap}%%"],
      ),
  },
  {
    name: "passed trivia before a retained Comment",
    built: () =>
      beforeHeader(
        "%%\n\u2028\n%%{%%{wrap}%%wrap}%%\ntreeView-beta",
        ["%%", "%%{%%{wrap}%%wrap}%%"],
        ["%%{wrap}%%"],
      ),
  },
  {
    name: "passed trivia between retained Comments",
    built: () =>
      beforeHeader(
        "%%{%%{wrap}%%wrap}%%\n%%\n\u2029\n%%{%%{wrap}%%wrap}%%\ntreeView-beta",
        ["%%{%%{wrap}%%wrap}%%", "%%", "%%{%%{wrap}%%wrap}%%"],
        ["%%{wrap}%%", "%%{wrap}%%"],
      ),
  },
]

describe("treeview tree conditions", () => {
  for (const { name, built } of VALID)
    it(`accepts ${name}`, () => {
      const value = built()
      expect(checkTree(value.source, value.tree)).toEqual([])
    })

  it("registers the thirteen types and every declared child field", () => {
    const fields = readChildFields()
    for (const [type, children] of Object.entries(TREEVIEW_CHILD_TYPES))
      expect(Object.keys(children), type).toEqual(fields.get(type))
    const tables = readFieldTables()
    for (const [type, children] of Object.entries(TREEVIEW_CHILD_TYPES))
      for (const [field, allowed] of Object.entries(children))
        expect(allowed, `${type}.${field}`).toEqual(
          readChildTypeNames("treeview", tables.get(type)?.get(field) ?? ""),
        )
    expect(
      new Set(
        nodesOf(allFields().tree)
          .filter((node) => node.type.startsWith("Treeview"))
          .map((node) => node.type),
      ).size,
    ).toBe(13)
  })

  itFailsEach([
    {
      name: "missing prefix",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewNode", "indent", 4), "prefix", null),
      expected: "each box prefix or decoration must have exactly one owner",
    },
    {
      name: "wrong prefix marker",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewBranchPrefix"), "marker", "┗"),
      expected: "the first branch marker",
    },
    {
      name: "short prefix spelling",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewBranchPrefix"), "value", "├"),
      expected: "value",
    },
    {
      name: "decoration assigned as YAML",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewIgnoredText"), "kind", "yaml-block"),
      expected: "only ignored kind is box-decoration",
    },
    {
      name: "lost inter-node decoration",
      built: allFields,
      mutate: (tree) =>
        setField(
          nodesOf(tree).find(
            (node) =>
              node.type === "TreeviewNode" &&
              (node.textBefore as unknown[]).length > 0,
          )!,
          "textBefore",
          [],
        ),
      expected: "each box prefix or decoration must have exactly one owner",
    },
    {
      name: "duplicated body decoration",
      built: allFields,
      mutate: (tree) =>
        setField(tree.body, "body", [
          ...(tree.body.body as unknown[]),
          nodeWith(tree, "TreeviewIgnoredText"),
        ]),
      expected: "overlap",
    },
    {
      name: "lost annotation decoration",
      built: annotationGap,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewClassAnnotation"), "textBefore", []),
      expected: "each box prefix or decoration must have exactly one owner",
    },
    {
      name: "lost pending-name decoration",
      built: nameGap,
      mutate: (tree) =>
        setField(
          nodeWith(tree, "TreeviewNode", "indent", 1),
          "textBeforeName",
          [],
        ),
      expected: "each box prefix or decoration must have exactly one owner",
    },
    {
      name: "lost opener-gap prefix",
      built: openerGap,
      mutate: (tree) =>
        setField(
          nodeWith(tree, "TreeviewAccDescrBlockStatement"),
          "textBeforeOpen",
          [nodeWith(tree, "TreeviewIgnoredText")],
        ),
      expected: "each box prefix or decoration must have exactly one owner",
    },
    {
      name: "changed assigned depth",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewNode", "indent", 4), "indent", 3),
      expected: "indent must equal",
    },
    {
      name: "negative indentation",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewNode", "indent", 0), "indent", -1),
      expected: "indent must equal",
    },
    {
      name: "noninteger indentation",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewNode", "indent", 0), "indent", 0.5),
      expected: "indent must equal",
    },
    {
      name: "null nonempty description",
      built: allFields,
      mutate: (tree) =>
        setField(
          nodeWith(tree, "TreeviewDescriptionAnnotation"),
          "value",
          null,
        ),
      expected: "description marker",
    },
    {
      name: "null nonempty icon",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewIconAnnotation"), "name", null),
      expected: "icon call components",
    },
    {
      name: "null nonempty common value",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewAccTitleStatement"), "value", null),
      expected: "authored components",
    },
    {
      name: "wrong bare value",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "TreeviewIdentifier"), "name", "root"),
      expected: "name",
    },
    {
      name: "wrong raw value",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "StringLiteral"), "raw", '"wrong"'),
      expected: "raw",
    },
    {
      name: "unclosed quoted value",
      built: allFields,
      mutate: (tree) =>
        setField(nodeWith(tree, "StringLiteral"), "closed", false),
      expected: "closed",
    },
    {
      name: "mistyped class token",
      built: allFields,
      mutate: (tree) => setField(tokenWith(tree, "hot"), "type", "RawText"),
      expected: "a class or icon name",
    },
    {
      name: "mistyped prefix token",
      built: allFields,
      mutate: (tree) => setField(tokenWith(tree, "├──"), "type", "Punctuator"),
      expected: "an authored box form",
    },
    {
      name: "mistyped header",
      built: allFields,
      mutate: (tree) =>
        setField(tokenWith(tree, "treeView-beta"), "type", "RawText"),
      expected: "kind of a token",
    },
    {
      name: "wrong root id",
      built: allFields,
      mutate: (tree) => setField(tree, "diagramType", "treeview"),
      expected: "diagram type treeview is not one of",
    },
  ])

  it("rejects an outer owner extracted from an enclosed decoration", () => {
    const { source, tree } = VALID.find(
      (entry) =>
        entry.name === "decoration in an open quote remains inside its leaf",
    )!.built()
    expect(checkTree(source, tree)).toEqual([])
    const broken = copyOf(tree)
    const token = tokenOf(source, "RawText", { text: "│" })
    const extra = {
      type: "TreeviewIgnoredText",
      range: token.range,
      loc: token.loc,
      kind: "box-decoration",
      value: "│",
    }
    setField(broken.body, "body", [...(broken.body.body as unknown[]), extra])
    expect(
      checkTree(source, broken).some((problem) =>
        problem.message.includes("exactly one owner"),
      ),
    ).toBe(true)
  })

  it("rejects a native Comment disguised inside an earlier quoted value", () => {
    const built = buildTreeview('treeView-beta\n"a%%{!}%%b"', (kit) => [
      row(kit, 0, '"a%%{!}%%b"'),
    ])
    expect(checkTree(built.source, built.tree)).toEqual([])
    setField(built.tree, "comments", [
      commentOf(built.source, "%%", { text: "%%{!}%%" }),
    ])
    expect(
      checkTree(built.source, built.tree).some((problem) =>
        problem.message.includes("earlier name or composite payload"),
      ),
    ).toBe(true)
  })

  it("rejects an excluded LF added to a decoration range", () => {
    const { source, tree } = allFields()
    const node = nodeWith(tree, "TreeviewIgnoredText")
    const range = [node.range[0], node.range[1] + 1] as const
    setField(node, "range", range)
    setField(node, "loc", locationOf(source, range))
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("complete authored box form"),
      ),
    ).toBe(true)
  })

  it("rejects a prefix moved into the next annotation", () => {
    const { source, tree } = allFields()
    const node = nodeWith(tree, "TreeviewNode", "indent", 4)
    const branch = nodeWith(tree, "TreeviewBranchPrefix")
    setField(node, "prefix", null)
    setField(nodeWith(tree, "TreeviewClassAnnotation"), "prefix", branch)
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("belongs to TreeviewNode.prefix"),
      ),
    ).toBe(true)
  })

  it("rejects a pending-name decoration moved to body even with adjusted hulls", () => {
    const { source, tree } = nameGap()
    const node = nodeWith(tree, "TreeviewNode", "indent", 1)
    const form = nodeWith(tree, "TreeviewIgnoredText")
    const name = nodeWith(tree, "TreeviewIdentifier")
    setField(node, "textBeforeName", [])
    setField(node, "range", name.range)
    setField(node, "loc", name.loc)
    const body = tree.body.body as unknown[]
    setField(tree.body, "body", [body[0], form, node])
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("belongs to TreeviewNode.textBeforeName"),
      ),
    ).toBe(true)
  })

  it("rejects trimmed authored block padding even when its token and value agree", () => {
    const { source, tree } = allFields()
    const block = nodeWith(tree, "TreeviewAccDescrBlockStatement")
    const value = block.value as typeof block
    const token = tree.tokens.find((item) => item.range[0] === value.range[0])!
    const range = [value.range[0] + 1, value.range[1] - 1] as const
    for (const piece of [value, token]) {
      setField(piece, "range", range)
      setField(piece, "loc", locationOf(source, range))
      setField(piece, "value", source.slice(...range))
    }
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("complete authored interior and padding"),
      ),
    ).toBe(true)
  })

  it("rejects a block choosing a later closer", () => {
    const { source, tree } = buildTreeview(
      "treeView-beta\naccDescr {a}b}",
      (kit) => [common(kit, "AccDescrBlock", "a}b")],
    )
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("complete first-priority lexical form"),
      ),
    ).toBe(true)
  })

  it("rejects a quoted name choosing a later closer", () => {
    const { source, tree } = buildTreeview('treeView-beta\n"a"b"', (kit) => [
      row(kit, 0, '"a"b"'),
    ])
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes(
          "complete first-priority bare or closed quoted unit",
        ),
      ),
    ).toBe(true)
  })

  it("keeps the ordinary body gap strict for Unicode whitespace", () => {
    const { source, tree } = buildTreeview(
      'treeView-beta\n"a"\u00a0"b"',
      (kit) => [row(kit, 0, '"a"'), row(kit, 0, '"b"')],
    )
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("gap is not ASCII whitespace and LF"),
      ),
    ).toBe(true)
  })

  it("keeps Unicode pre-header padding strict without a passed bare line", () => {
    const { source, tree } = beforeHeader(
      "%%{%%{wrap}%%wrap}%%\n\u00a0treeView-beta",
      ["%%{%%{wrap}%%wrap}%%"],
      ["%%{wrap}%%"],
    )
    expect(
      checkTree(source, tree).some((problem) =>
        problem.message.includes("gap is not ASCII whitespace and LF"),
      ),
    ).toBe(true)
  })
})
