import { commentOf } from "./check-tree-trees.ts"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { loadFixtures } from "../src/index.ts"
import {
  GITGRAPH_CHILD_TYPES,
  GITGRAPH_FIELD_WORDS,
} from "../src/check-tree/gitgraph.ts"
import { buildTree, nodeWith, tokenWith } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { branch, checkout, commit, merge, option } from "./gitgraph-built.ts"
import {
  buildGitgraph,
  common,
  ignored,
  withPreheader,
} from "./statement-tree-built.ts"
import { readChildFields } from "./spec-field-tables.ts"

/** Explicit authored occurrences covering every gitgraph node. */
function allFields() {
  return buildGitgraph(
    'gitGraph TB:\ntitle T\naccTitle: A\naccDescr: D\naccDescr { B }\ncommit id:"A" msg:"one" tag:"x" type:REVERSE\nbranch b order:2\ncommit id:"B"\ncheckout main\nmerge b id:"M"\nbranch c\ncherry-pick id:"M" parent:"A"%%{!}%%\n',
    (kit) => [
      common(kit, "Gitgraph", "Title", "T"),
      common(kit, "Gitgraph", "AccTitle", " A"),
      common(kit, "Gitgraph", "AccDescr", " D"),
      common(kit, "Gitgraph", "AccDescrBlock", "B"),
      commit(kit, () => [
        option(kit, "Id", '"A"'),
        option(kit, "Message", '"one"'),
        option(kit, "Tag", '"x"'),
        option(kit, "Type", "REVERSE"),
      ]),
      branch(kit, "b", () => option(kit, "Order", "2")),
      commit(kit, () => [option(kit, "Id", '"B"')]),
      checkout(kit, "main"),
      merge(kit, "b", () => [option(kit, "Id", '"M"')]),
      branch(kit, "c"),
      commit(
        kit,
        () => [option(kit, "Id", '"M"'), option(kit, "Parent", '"A"')],
        () => [ignored(kit, "Gitgraph", "%%{!}%%", "directive")],
        true,
      ),
    ],
    "TB",
  )
}

const VALID = [
  {
    name: "empty common forms",
    built: () =>
      buildGitgraph(
        "gitGraph\ntitle\naccTitle:\naccDescr:\naccDescr { }",
        (kit) => [
          common(kit, "Gitgraph", "Title", null),
          common(kit, "Gitgraph", "AccTitle", null),
          common(kit, "Gitgraph", "AccDescr", null),
          common(kit, "Gitgraph", "AccDescrBlock", null),
        ],
      ),
  },
  {
    name: "whitespace-only line literal",
    built: () =>
      buildGitgraph("gitGraph\ntitle  \n", (kit) => [
        common(kit, "Gitgraph", "Title", " "),
      ]),
  },
  {
    name: "native fallback after incomplete directive",
    built: () =>
      buildGitgraph("gitGraph\ncommit%%{!\ncommit", (kit) => {
        const first = commit(kit)
        kit.comment("%%", "%%{!")
        return [first, commit(kit)]
      }),
  },

  { name: "all fields", built: allFields },
  { name: "empty diagram", built: () => buildGitgraph("gitGraph", () => []) },
  {
    name: "joined colon",
    built: () =>
      buildGitgraph("gitGraph:commit", (kit) => [commit(kit)], null, true),
  },
  {
    name: "bare and explicit messages",
    built: () =>
      buildGitgraph('gitGraph\ncommit "a" msg:"b" "c"', (kit) => [
        commit(kit, () => [
          option(kit, "Message", '"a"', {}, true),
          option(kit, "Message", '"b"'),
          option(kit, "Message", '"c"', {}, true),
        ]),
      ]),
  },
  {
    name: "duplicate ids",
    built: () =>
      buildGitgraph('gitGraph\ncommit id:"A"\ncommit id:"A"', (kit) => [
        commit(kit, () => [option(kit, "Id", '"A"')]),
        commit(kit, () => [option(kit, "Id", '"A"')]),
      ]),
  },
  {
    name: "reference and integer priority",
    built: () =>
      buildGitgraph(
        "gitGraph\nbranch 1.5\nbranch 1.2.3\nbranch commitA",
        (kit) => [
          branch(kit, "1.5"),
          branch(kit, "1.2.3"),
          branch(kit, "commitA"),
        ],
      ),
  },
  {
    name: "single quotes and escaped quotes",
    built: () =>
      buildGitgraph("gitGraph\ncommit id:'A\\'B'\nbranch 'commit'", (kit) => [
        commit(kit, () => [option(kit, "Id", "'A\\'B'")]),
        branch(kit, "'commit'"),
      ]),
  },
  {
    name: "hidden-looking string",
    built: () =>
      buildGitgraph('gitGraph\ncommit id:"%%{}%%"', (kit) => [
        commit(kit, () => [option(kit, "Id", '"%%{}%%"')]),
      ]),
  },
  {
    name: "three YAML fences before value",
    built: () =>
      buildGitgraph('gitGraph\ncommit id:---\n---\n---\n"A"', (kit) => [
        commit(kit, () => [
          option(kit, "Id", '"A"', {
            beforeValue: () => [
              ignored(kit, "Gitgraph", "---\n---\n---", "yaml-block"),
            ],
          }),
        ]),
      ]),
  },
  {
    name: "hidden form before a later option",
    built: () =>
      buildGitgraph('gitGraph\ncommit id:"A"%%{!}%%\ntag:"x"', (kit) => [
        commit(kit, () => [
          option(kit, "Id", '"A"'),
          option(kit, "Tag", '"x"', {
            before: () => [ignored(kit, "Gitgraph", "%%{!}%%", "directive")],
          }),
        ]),
      ]),
  },
  {
    name: "spare EOL",
    built: () =>
      buildGitgraph("gitGraph\ncommit%%{!}%%\n\ncommit", (kit) => [
        commit(kit, undefined, () => [
          ignored(kit, "Gitgraph", "%%{!}%%", "directive"),
        ]),
        commit(kit),
      ]),
  },
  {
    name: "lookahead space leaves EOL",
    built: () =>
      buildGitgraph("gitGraph\ncommit ---\nx\n--- \ncommit", (kit) => [
        commit(kit, undefined, () => [
          ignored(kit, "Gitgraph", "---\nx\n---", "yaml-block"),
        ]),
        commit(kit),
      ]),
  },
  {
    name: "hidden form after a visible EOL",
    built: () =>
      buildGitgraph("gitGraph\ncommit\n%%{!}%%\ncommit", (kit) => [
        commit(kit),
        ignored(kit, "Gitgraph", "%%{!}%%", "directive"),
        commit(kit),
      ]),
  },
]

describe("gitgraph hand-built trees", () => {
  for (const row of VALID)
    it(`passes ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })
  for (const row of [
    {
      name: "direction",
      type: "GitgraphDiagram",
      field: "direction",
      value: "TD",
      message: "written direction",
    },
    {
      name: "checkout alias",
      type: "GitgraphCheckoutStatement",
      field: "keyword",
      value: "reset",
      message: "the field keyword",
    },
    {
      name: "message keyword",
      type: "GitgraphMessageOption",
      field: "keyword",
      value: "other",
      message: "message keyword",
    },
    {
      name: "type",
      type: "GitgraphTypeOption",
      field: "value",
      value: "OTHER",
      message: "the field value",
    },
    {
      name: "hidden kind",
      type: "GitgraphIgnoredText",
      field: "kind",
      value: "yaml",
      message: "the field kind",
    },
    {
      name: "common literal",
      type: "GitgraphLiteral",
      field: "value",
      value: "x",
      message: "value is not its written text",
    },
    {
      name: "string closedness",
      type: "StringLiteral",
      field: "closed",
      value: false,
      message: "closed STRING",
    },
    {
      name: "numeric value",
      type: "NumericLiteral",
      field: "value",
      value: 3,
      message: "number that its written text writes",
    },
  ])
    it(`reports changed ${row.name}`, () => {
      const { source, tree } = allFields()
      setField(nodeWith(tree, row.type), row.field, row.value)
      expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
    })

  for (const row of [
    {
      name: "keyword as reference",
      source: "gitGraph\nbranch commit",
      raw: "commit",
    },
    { name: "title prefix", source: "gitGraph\nbranch titleA", raw: "titleA" },
    {
      name: "integer before reference",
      source: "gitGraph\nbranch 1abc",
      raw: "1abc",
    },
    {
      name: "integer backtracking before dot",
      source: "gitGraph\nbranch 12.3",
      raw: "12.3",
    },
    {
      name: "trailing reference slash",
      source: "gitGraph\nbranch a/",
      raw: "a/",
    },
  ])
    it(`rejects ${row.name}`, () => {
      const { source, tree } = buildGitgraph(row.source, (kit) => [
        branch(kit, row.raw),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "bare-reference lexical unit",
      )
    })

  for (const row of [
    { source: "gitGraph\nbranch b order:01", raw: "01" },
    { source: "gitGraph\nbranch b order:-0", raw: "-0" },
    { source: "gitGraph\nbranch b order:1.5", raw: "1.5" },
  ])
    it(`rejects order spelling ${row.raw}`, () => {
      const { source, tree } = buildGitgraph(row.source, (kit) => [
        branch(kit, "b", () => option(kit, "Order", row.raw)),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "unsigned-integer lexical unit",
      )
    })

  it("rejects space between option word and colon", () => {
    const { source, tree } = buildGitgraph(
      'gitGraph\ncommit id :"A"',
      (kit) => [commit(kit, () => [option(kit, "Id", '"A"')])],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "word and colon must be contiguous",
    )
  })
  it("rejects a longer reference disguised as commit", () => {
    const { source, tree } = buildGitgraph(
      'gitGraph\ncommitA id:"A"',
      (kit) => [commit(kit, () => [option(kit, "Id", '"A"')])],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "longer bare-reference match",
    )
  })
  it("rejects an option belonging to another statement", () => {
    const { source, tree } = allFields()
    const changed = nodeWith(tree, "GitgraphMessageOption")
    const target = nodeWith(tree, "GitgraphMergeStatement")
    setField(target, "options", [changed])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "not a GitgraphIdOption",
    )
  })

  for (const row of [
    {
      source: "gitGraph\ncommit%%{!}%%\ncommit",
      raw: "%%{!}%%",
      kind: "directive",
    },
    {
      source: "gitGraph\ncommit ---\nx\n---\ncommit",
      raw: "---\nx\n---",
      kind: "yaml-block",
    },
  ] as const)
    it(`rejects the only LF consumed by ${row.kind}`, () => {
      const { source, tree } = buildGitgraph(row.source, (kit) => [
        commit(kit, undefined, () => [
          ignored(kit, "Gitgraph", row.raw, row.kind),
        ]),
        commit(kit),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "consumed the only LF",
      )
    })

  for (const row of [
    { source: "gitGraph\ncommit%%{}%%\ncommit", kind: "commit" },
    { source: "gitGraph\nbranch b%%{}%%\ncommit", kind: "branch" },
    { source: "gitGraph\ncheckout main%%{}%%\ncommit", kind: "checkout" },
    { source: "gitGraph\nswitch main%%{}%%\ncommit", kind: "switch" },
    { source: "gitGraph\nmerge b%%{}%%\ncommit", kind: "merge" },
    {
      source: 'gitGraph\ncherry-pick id:"A"%%{}%%\ncommit',
      kind: "cherry-pick",
    },
    { source: "gitGraph\n%%{}%%\ncommit", kind: "body" },
  ])
    it(`rejects a native Comment hiding DIRECTIVE after ${row.kind}`, () => {
      const { source, tree } = buildGitgraph(row.source, (kit) => {
        const first =
          row.kind === "commit"
            ? [commit(kit)]
            : row.kind === "branch"
              ? [branch(kit, "b")]
              : row.kind === "checkout" || row.kind === "switch"
                ? [checkout(kit, "main", row.kind)]
                : row.kind === "merge"
                  ? [merge(kit, "b")]
                  : row.kind === "cherry-pick"
                    ? [
                        commit(
                          kit,
                          () => [option(kit, "Id", '"A"')],
                          undefined,
                          true,
                        ),
                      ]
                    : []
        kit.comment("%%", "%%{}%%")
        return [...first, commit(kit)]
      })
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "earlier hidden DIRECTIVE",
      )
    })

  for (const row of [
    { name: "lex-hidden-directive-after-title", kind: "Title", value: "T" },
    {
      name: "lex-hidden-directive-after-acctitle",
      kind: "AccTitle",
      value: " A",
    },
    {
      name: "lex-hidden-directive-after-accdescr",
      kind: "AccDescr",
      value: " D",
    },
    {
      name: "lex-hidden-directive-after-block",
      kind: "AccDescrBlock",
      value: "D",
    },
  ] as const)
    it(`rejects the hidden form recorded as Comment in ${row.name}`, async () => {
      const fixture = (await loadFixtures("gitgraph")).find(
        (entry) => entry.name === row.name,
      )
      if (fixture === undefined) throw new Error(`missing gitgraph/${row.name}`)
      expect(fixture.expected.accepted).toBe(false)
      const { source, tree } = buildGitgraph(fixture.input, (kit) => {
        const first = common(kit, "Gitgraph", row.kind, row.value)
        kit.comment("%%", "%%{}%%")
        return [first, commit(kit)]
      })
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "earlier hidden DIRECTIVE",
      )
    })

  for (const row of [
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028gitGraph",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\ufeffgitGraph",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028\ngitGraph",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028gitGraph",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\ufeffgitGraph",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028\ngitGraph",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\ngitGraph",
      parts: [
        ["---\nx\n---", "yaml-block"],
        ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
      ],
      comments: ["%% c", "%%", "%% gap"],
    },
  ] as const)
    it(`passes detection trivia ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = withPreheader(
        buildGitgraph(row.source, () => []),
        "Gitgraph",
        row.parts,
        row.comments,
      )
      expect(checkTree(source, tree)).toEqual([])
    })

  for (const row of [
    {
      source: "%% c\n---\nx\n---\n\u2028gitGraph",
      parts: [["---\nx\n---", "yaml-block"]],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n\u2028gitGraph",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    },
  ] as const)
    it(`rejects Unicode gaps without a passed bare line ${JSON.stringify(row.source)}`, () => {
      const { source, tree } = withPreheader(
        buildGitgraph(row.source, () => []),
        "Gitgraph",
        row.parts,
        ["%% c"],
      )
      expect(JSON.stringify(checkTree(source, tree))).toContain(
        "ASCII whitespace and LF",
      )
    })

  it("keeps ordinary body gaps strict", () => {
    const { source, tree } = buildGitgraph(
      "gitGraph\n%%\n\u2028commit",
      (kit) => {
        kit.comment("%%", "%%")
        return [commit(kit)]
      },
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })
  it("accepts a pre-header empty-brace Comment", () => {
    const { source, tree } = withPreheader(
      buildGitgraph("%%{}%%\ngitGraph", () => []),
      "Gitgraph",
      [],
      ["%%{}%%"],
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("reports a changed component token kind", () => {
    const { source, tree } = allFields()
    setField(tokenWith(tree, ":"), "type", "Keyword")
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
  })
  it("registers all documented child fields and the fixed type words", () => {
    const fields = readChildFields()
    for (const [type, own] of Object.entries(GITGRAPH_CHILD_TYPES))
      expect(Object.keys(own), type).toEqual(fields.get(type))
    expect(GITGRAPH_FIELD_WORDS.GitgraphTypeOption?.value).toEqual([
      "NORMAL",
      "REVERSE",
      "HIGHLIGHT",
    ])
  })
  it("passes hidden forms in both header gaps", () => {
    const { source, tree } = buildGitgraph(
      "gitGraph %%{!}%%\nTB ---\nx\n---\n:",
      () => [],
      "TB",
      true,
      {
        beforeDirection: (kit) => [
          ignored(kit, "Gitgraph", "%%{!}%%", "directive"),
        ],
        beforeColon: (kit) => [
          ignored(kit, "Gitgraph", "---\nx\n---", "yaml-block"),
        ],
      },
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("rejects visible LF in a header gap", () => {
    const { source, tree } = buildGitgraph("gitGraph\nTB:", () => [], "TB")
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "hidden ASCII whitespace",
    )
  })
  it("rejects a missing owner of a hidden value gap", () => {
    const { source, tree } = buildGitgraph(
      'gitGraph\ncommit id:%%{!}%%\n"A"',
      (kit) => [
        commit(kit, () => [
          option(kit, "Id", '"A"', {
            beforeValue: () => [
              ignored(kit, "Gitgraph", "%%{!}%%", "directive"),
            ],
          }),
        ]),
      ],
    )
    setField(nodeWith(tree, "GitgraphIdOption"), "textBeforeValue", [])
    expect(JSON.stringify(checkTree(source, tree))).toContain("the gap is not")
  })
  it("rejects duplicate ownership of a hidden form", () => {
    const { source, tree } = buildGitgraph(
      'gitGraph\ncommit id:%%{!}%%\n"A"',
      (kit) => [
        commit(kit, () => [
          option(kit, "Id", '"A"', {
            beforeValue: () => [
              ignored(kit, "Gitgraph", "%%{!}%%", "directive"),
            ],
          }),
        ]),
      ],
    )
    const hidden = nodeWith(tree, "GitgraphIgnoredText")
    setField(nodeWith(tree, "GitgraphIdOption"), "textBeforeValue", [
      hidden,
      hidden,
    ])
    expect(checkTree(source, tree).length).toBeGreaterThan(0)
  })
  it("rejects a body form moved across visible EOL into textAfter", () => {
    const { source, tree } = buildGitgraph(
      "gitGraph\ncommit\n%%{!}%%",
      (kit) => [
        commit(kit, undefined, () => [
          ignored(kit, "Gitgraph", "%%{!}%%", "directive"),
        ]),
      ],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "hidden ASCII whitespace",
    )
  })
  it("rejects an adjacent YAML closer selected before a later qualifying closer", () => {
    const { source, tree } = buildGitgraph("gitGraph\n---\n---\n---", (kit) => [
      ignored(kit, "Gitgraph", "---\n---", "yaml-block"),
      ignored(kit, "Gitgraph", "---", "yaml-block"),
    ])
    expect(checkTree(source, tree)).toContainEqual({
      where: "GitgraphIgnoredText at 9-16",
      message:
        "the value is not one complete hidden YAML or DIRECTIVE form without its following LF",
    })
  })
  it("rejects the consumed LF inside an ignored range", () => {
    const { source, tree } = buildGitgraph("gitGraph\n---\nx\n---\n", (kit) => [
      ignored(kit, "Gitgraph", "---\nx\n---\n", "yaml-block"),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "one complete hidden",
    )
  })
  it("rejects a later bounded directive closer", () => {
    const { source, tree } = buildGitgraph("gitGraph\n%%{!}%%\n}%%", (kit) => [
      ignored(kit, "Gitgraph", "%%{!}%%\n}%%", "directive"),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "one complete hidden",
    )
  })
  it("rejects a native Comment inside an earlier STRING", () => {
    const { source, tree } = buildGitgraph(
      'gitGraph\ncommit id:"A%%{}%% B"',
      (kit) => [commit(kit, () => [option(kit, "Id", '"A%%{}%% B"')])],
    )
    setField(tree, "comments", [commentOf(source, "%%", { text: "%%{}%%" })])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "cannot start inside a STRING or composite",
    )
  })
  it("allows the native Comment after the first composite closing brace", () => {
    const { source, tree } = buildGitgraph(
      "gitGraph\naccDescr { A%%{}%%\n",
      (kit) => {
        const block = common(kit, "Gitgraph", "AccDescrBlock", "A%%{")
        kit.comment("%%", "%%")
        return [block]
      },
    )
    expect(checkTree(source, tree)).toEqual([])
  })
  it("reports an atomic header split by a global directive", () => {
    const source = "git%%{init: {}}%%Graph"
    const { tree } = buildTree(
      {
        header: "git",
        diagramType: "gitGraph",
        bodyType: "GitgraphDiagram",
        bodyFields: (body) => ({
          direction: null,
          textBeforeHeader: [],
          textBeforeDirection: [],
          textBeforeColon: [],
          body,
        }),
      },
      source,
      (kit) => {
        kit.directive("%%{init: {}}%%")
        kit.token("Keyword", "Graph")
        return []
      },
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "a Keyword token is cut",
    )
  })
})
