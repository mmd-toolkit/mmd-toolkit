import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { ISHIKAWA_CHILD_TYPES } from "../src/check-tree/ishikawa.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { childOf } from "../src/check-tree/statement-checks.ts"
import { buildTree, itFailsEach, nodeWith, retype } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import {
  firstNode,
  problemsOf,
  retypeIn,
  setField,
} from "./check-tree-recorded.ts"
import type { MutationCase } from "./check-tree-recorded.ts"
import { readFieldTables } from "./spec-field-tables.ts"

/** Each caller supplies the source and its nesting; no syntax is parsed here. */
function build(
  source: string,
  make: (kit: Kit) => CheckedNode | null,
  header = "ishikawa",
): Built {
  return buildTree(
    {
      header,
      diagramType: "ishikawa",
      bodyType: "IshikawaDiagram",
      bodyFields: (nodes) => ({ root: nodes[0] ?? null }),
    },
    source,
    (kit) => {
      const root = make(kit)
      return root === null ? [] : [root]
    },
  )
}

/** One literal, followed by the children supplied explicitly in source order. */
function node(
  kit: Kit,
  text: string | (() => CheckedNode),
  indent = 0,
  children: () => CheckedNode[] = () => [],
): CheckedNode {
  const literal =
    typeof text === "string"
      ? (() => {
          const token = kit.token("RawText", text)
          return kit.node("IshikawaLiteral", token.range, { value: text })
        })()
      : text()
  const nested = children()
  return kit.node(
    "IshikawaNode",
    [literal.range[0], nested.at(-1)?.range[1] ?? literal.range[1]],
    { indent, text: literal, children: nested },
  )
}

/** A cause below the base is followed by a cause at the base, then two deeper siblings. */
function parents(): Built {
  return build(
    "ishikawa\n        R\n    A\n   B\n    C\n      D\n     E\nF\n",
    (kit) =>
      node(kit, "R", 8, () => [
        node(kit, "A", 4),
        node(kit, "B", 3),
        node(kit, "C", 4, () => [node(kit, "D", 6), node(kit, "E", 5)]),
        node(kit, "F"),
      ]),
  )
}

/** A tab is one character, regardless of how it is displayed. */
function tabs(): Built {
  return build("ishikawa\nR\n\tA\n  B\n\tC\n", (kit) =>
    node(kit, "R", 0, () => [
      node(kit, "A", 1, () => [node(kit, "B", 2)]),
      node(kit, "C", 1),
    ]),
  )
}

/** Count the separator and following space, excluding the comment's own trailing spaces. */
function commentIndent(): Built {
  return build("ishikawa\nR\n%%{}%%  \u2028 A\n", (kit) =>
    node(kit, "R", 0, () => {
      kit.comment("%%", "%%{}%%  ")
      return [node(kit, "A", 2)]
    }),
  )
}

/** A directive's source whitespace belongs to its interior. */
function directiveIndent(): Built {
  return build("ishikawa\nR\n %%{init: {}}%% A\n", (kit) =>
    node(kit, "R", 0, () => {
      kit.directive("%%{init: {}}%%")
      return [node(kit, "A", 2)]
    }),
  )
}

/** A multiline directive joins fragments into one written literal. */
function joined(): Built {
  return build("ishikawa\nA%%{init:\n{}}%%B \n", (kit) =>
    node(kit, () => {
      const first = kit.token("RawText", "A")
      kit.directive("%%{init:\n{}}%%")
      const last = kit.token("RawText", "B ")
      return kit.node("IshikawaLiteral", [first.range[0], last.range[1]], {
        value: "AB ",
      })
    }),
  )
}

const VALID: readonly (readonly [string, () => Built])[] = [
  ["rootless LF", () => build("ishikawa\n", () => null)],
  [
    "rootless beta",
    () => build("IsHiKaWa-BeTa\n", () => null, "IsHiKaWa-BeTa"),
  ],
  [
    "header-line indentation",
    () => build("ishikawa  R\n", (kit) => node(kit, "R", 2)),
  ],
  ["root offset, zero clamp, jumps and nearest smaller cause", parents],
  ["tab indentation", tabs],
  ["comment-ending LS indentation", commentIndent],
  [
    "comment-ending PS indentation",
    () =>
      build("ishikawa\n%%{}%%\u2029 R\n", (kit) => {
        kit.comment("%%", "%%{}%%")
        return node(kit, "R", 2)
      }),
  ],
  ["directive indentation", directiveIndent],
  ["multiline directive inside a literal", joined],
  [
    "common comment region inside text",
    () =>
      build("ishikawa\nA\u2028%% c\n B\n", (kit) =>
        node(kit, () => {
          const first = kit.token("RawText", "A\u2028")
          kit.comment("%%", "%% c")
          const last = kit.token("RawText", " B")
          return kit.node("IshikawaLiteral", [first.range[0], last.range[1]], {
            value: "A\u2028 B",
          })
        }),
      ),
  ],
  [
    "selected semicolon",
    () =>
      build("ishikawa\nstyle R fill:#abc;  \n", (kit) =>
        node(kit, () => {
          const first = kit.token("RawText", "style R fill:#abc")
          kit.token("IgnoredSemicolon", ";")
          const last = kit.token("RawText", "  ")
          return kit.node("IshikawaLiteral", [first.range[0], last.range[1]], {
            value: "style R fill:#abc  ",
          })
        }),
      ),
  ],
  [
    "literal quotes and brackets",
    () =>
      build('ishikawa\n""\n  []\n', (kit) =>
        node(kit, '""', 0, () => [node(kit, "[]", 2)]),
      ),
  ],
  [
    "header whitespace and blank lines are trivia",
    () =>
      build("ishikawa \n\nR\n\n A\n", (kit) =>
        node(kit, "R", 0, () => [node(kit, "A", 1)]),
      ),
  ],
  [
    "percent text after a node starts",
    () => build("ishikawa\nR%% tail\n", (kit) => node(kit, "R%% tail")),
  ],
  [
    "internal LS is text",
    () => build("ishikawa\nR\u2028X\n", (kit) => node(kit, "R\u2028X")),
  ],
  [
    "NEL is text",
    () =>
      build("ishikawa\nR\n\u0085\n A\n", (kit) =>
        node(kit, "R", 0, () => [
          node(kit, "\u0085", 0, () => [node(kit, "A", 1)]),
        ]),
      ),
  ],
  [
    "Kelvin sign in root text",
    () =>
      build("ishikawa\nishi\u212aawa\n", (kit) => node(kit, "ishi\u212aawa")),
  ],
  [
    "Kelvin sign in cause text",
    () =>
      build("ishikawa\nR\n ishi\u212aawa\n", (kit) =>
        node(kit, "R", 0, () => [node(kit, "ishi\u212aawa", 1)]),
      ),
  ],
  [
    "Kelvin sign in beta-looking text",
    () =>
      build("ishikawa\nishi\u212aawa-beta\n", (kit) =>
        node(kit, "ishi\u212aawa-beta"),
      ),
  ],
  [
    "long-s in node text",
    () =>
      build("ishikawa\ni\u017fhikawa\n", (kit) => node(kit, "i\u017fhikawa")),
  ],
  [
    "Kelvin sign after the stable header",
    () => build("ishikawa\u212a\n", (kit) => node(kit, "\u212a")),
  ],
  [
    "dotted I after the stable header",
    () => build("ishikawa\u0130\n", (kit) => node(kit, "\u0130")),
  ],
  [
    "Kelvin sign after the beta header",
    () =>
      build(
        "ishikawa-beta\u212a\n",
        (kit) => node(kit, "\u212a"),
        "ishikawa-beta",
      ),
  ],
]

describe("Ishikawa trees built by hand", () => {
  for (const [name, built] of VALID)
    it(`accepts ${name}`, () => {
      const { source, tree } = built()
      expect(checkTree(source, tree)).toEqual([])
    })

  it("uses the child types of the specification's field tables", () => {
    const fields = readFieldTables()
    for (const [type, children] of Object.entries(ISHIKAWA_CHILD_TYPES)) {
      for (const [field, types] of Object.entries(children)) {
        const cell = fields.get(type)?.get(field)
        expect(cell).toBeDefined()
        for (const child of types) expect(cell).toContain(child)
      }
    }
  })

  itFailsEach([
    {
      name: "noninteger indentation",
      built: tabs,
      mutate: (tree) =>
        setField(firstNode(tree, "IshikawaNode"), "indent", 0.5),
      expected: "the indent is not a nonnegative integer",
    },
    {
      name: "negative indentation",
      built: tabs,
      mutate: (tree) => setField(firstNode(tree, "IshikawaNode"), "indent", -1),
      expected: "the indent is not a nonnegative integer",
    },
    {
      name: "visual tab width",
      built: tabs,
      mutate: (tree) =>
        setField(nodeWith(tree, "IshikawaNode", "indent", 1), "indent", 8),
      expected: "the indent is not the written line whitespace count",
    },
    {
      name: "header-line indentation",
      built: VALID[2][1],
      mutate: (tree) => setField(firstNode(tree, "IshikawaNode"), "indent", 0),
      expected: "the indent is not the written line whitespace count",
    },
    {
      name: "comment-ending separator not counted",
      built: commentIndent,
      mutate: (tree) =>
        setField(nodeWith(tree, "IshikawaNode", "indent", 2), "indent", 1),
      expected: "the indent is not the written line whitespace count",
    },
    {
      name: "directive interior counted",
      built: directiveIndent,
      mutate: (tree) =>
        setField(nodeWith(tree, "IshikawaNode", "indent", 2), "indent", 3),
      expected: "the indent is not the written line whitespace count",
    },
    {
      name: "written value altered",
      built: joined,
      mutate: (tree) =>
        setField(firstNode(tree, "IshikawaLiteral"), "value", "AB"),
      expected: "value is not its written text",
    },
    {
      name: "empty literal",
      built: joined,
      mutate: (tree) =>
        setField(firstNode(tree, "IshikawaLiteral"), "value", ""),
      expected: "the literal is empty",
    },
    {
      name: "RawText reclassified as a string",
      built: joined,
      mutate: retype("A", "String"),
      expected: "Ishikawa node text",
    },
    {
      name: "root omitted",
      built: tabs,
      mutate: (tree) => setField(tree.body, "root", null),
      expected: "lies in no value node",
    },
    {
      name: "text omitted",
      built: tabs,
      mutate: (tree) => setField(firstNode(tree, "IshikawaNode"), "text", null),
      expected: "text",
    },
    {
      name: "wrong parent despite complete coverage",
      built: parents,
      mutate: (tree) => {
        const root = firstNode(tree, "IshikawaNode")
        const children = root.children as CheckedNode[]
        const c = children[2]
        const nested = c.children as CheckedNode[]
        setField(root, "children", [
          ...children.slice(0, 3),
          ...nested,
          ...children.slice(3),
        ])
        setField(c, "children", [])
      },
      expected: "children do not follow the Ishikawa",
    },
    {
      name: "trailing text ends early",
      built: () => build("ishikawa\nRoot \n", (kit) => node(kit, "Root ")),
      mutate: (tree) => {
        const literal = firstNode(tree, "IshikawaLiteral")
        setField(literal, "range", [literal.range[0], literal.range[1] - 1])
      },
      expected: "node text ends before the end of its line",
    },
    {
      name: "missing character coverage",
      built: tabs,
      mutate: (tree) =>
        setField(
          tree,
          "tokens",
          tree.tokens.filter((token) => token.value !== "A"),
        ),
      expected: "character outside the tokens and comments is not whitespace",
    },
    {
      name: "literal child type",
      built: tabs,
      mutate: (tree) =>
        setField(firstNode(tree, "IshikawaLiteral"), "type", "MindmapLiteral"),
      expected: "text",
    },
  ])

  for (const [name, source, header, raw] of [
    ["bare header EOF", "ishikawa", "ishikawa", null],
    ["Kelvin sign in a header", "ishi\u212aawa\nR\n", "ishi\u212aawa", "R"],
    [
      "Kelvin sign in a beta header",
      "ishi\u212aawa-beta\nR\n",
      "ishi\u212aawa-beta",
      "R",
    ],
    [
      "later header before Kelvin sign",
      "ishikawa\nishikawa\u212a\n",
      "ishikawa",
      "ishikawa\u212a",
    ],
    [
      "later header before dotted I",
      "ishikawa\nishikawa\u0130\n",
      "ishikawa",
      "ishikawa\u0130",
    ],
    [
      "later beta header before Kelvin sign",
      "ishikawa\nishikawa-beta\u212a\n",
      "ishikawa",
      "ishikawa-beta\u212a",
    ],
    ["later header", "ishikawa\nishikawa\n", "ishikawa", "ishikawa"],
    [
      "non-ASCII header boundary",
      "ishikawa\nishikawa界\n",
      "ishikawa",
      "ishikawa界",
    ],
    [
      "comment represented as a node",
      "ishikawa\n%%{}%%\n",
      "ishikawa",
      "%%{}%%",
    ],
    ["blank represented as a node", "ishikawa\n  \n", "ishikawa", "  "],
    ["line break inside literal", "ishikawa\nR\nA\n", "ishikawa", "R\nA"],
    ["header ASCII word boundary", "ishikawax\nR\n", "ishikawax", "R"],
    [
      "wrong stable header before bounded beta",
      "ishikawa-beta\n",
      "ishikawa",
      "-beta",
    ],
  ] as const)
    it(`rejects ${name}`, () => {
      const built = build(
        source,
        (kit) => (raw === null ? null : node(kit, raw)),
        header,
      )
      expect(checkTree(built.source, built.tree).length).toBeGreaterThan(0)
    })

  it("rejects two nodes on one logical line", () => {
    const built = build("ishikawa\nR A\n", (kit) =>
      node(kit, "R", 0, () => [node(kit, "A", 1)]),
    )
    expect(
      checkTree(built.source, built.tree).some((problem) =>
        problem.message.includes("successive nodes"),
      ),
    ).toBe(true)
  })

  it("rejects a split selected header", () => {
    const built = build(
      "ishi%%{init: {}}%%kawa\nR\n",
      (kit) => {
        kit.directive("%%{init: {}}%%")
        kit.token("Keyword", "kawa")
        return node(kit, "R")
      },
      "ishi",
    )
    expect(
      checkTree(built.source, built.tree).some((problem) =>
        problem.message.includes("complete Ishikawa header"),
      ),
    ).toBe(true)
  })

  it("checks the single literal child", () => {
    const built = tabs()
    expect(childOf(firstNode(built.tree, "IshikawaNode"), "text")?.type).toBe(
      "IshikawaLiteral",
    )
  })

  const recorded: readonly MutationCase[] = [
    {
      name: "header token kind",
      fixture: "header-only-lf",
      mutate: retypeIn("IshikawaDiagram", "Keyword", null, "RawText"),
      expected: "one complete Ishikawa header Keyword",
    },
    {
      name: "written literal value",
      fixture: "gram-quotes-padding",
      mutate: (tree) =>
        setField(firstNode(tree, "IshikawaLiteral"), "value", "R"),
      expected: "value is not its written text",
    },
    {
      name: "literal token kind",
      fixture: "db-all-fields",
      mutate: retypeIn("IshikawaLiteral", "RawText", null, "String"),
      expected: "Ishikawa node text",
    },
    {
      name: "tab counted as visual columns",
      fixture: "db-indent-tab-character",
      mutate: (tree) =>
        setField(nodeWith(tree, "IshikawaNode", "indent", 1), "indent", 8),
      expected: "written line whitespace count",
    },
    {
      name: "zero-level cause wrongly becomes a parent",
      fixture: "db-indent-relative-zero",
      mutate: (tree) => {
        const root = firstNode(tree, "IshikawaNode")
        const children = root.children as CheckedNode[]
        setField(root, "children", children.slice(0, 2))
        setField(children[1], "children", [children[2]])
      },
      expected: "children do not follow the Ishikawa",
    },
    {
      name: "range extended into indentation",
      fixture: "db-indent-first-cause",
      mutate: (tree) => {
        const cause = (
          firstNode(tree, "IshikawaNode").children as CheckedNode[]
        )[0]
        setField(cause, "range", [cause.range[0] - 1, cause.range[1]])
      },
      expected: "range, which runs from the first",
    },
    {
      name: "comment crosses its LS",
      fixture: "comment-preserved-u2028",
      mutate: (tree) => {
        const comment = tree.comments[0]
        setField(comment, "range", [comment.range[0], comment.range[1] + 1])
      },
      expected: "ends with a line terminator",
    },
    {
      name: "comment crosses its PS",
      fixture: "comment-preserved-u2029",
      mutate: (tree) => {
        const comment = tree.comments[0]
        setField(comment, "range", [comment.range[0], comment.range[1] + 1])
      },
      expected: "ends with a line terminator",
    },
  ]
  for (const mutation of recorded)
    it(`reports a broken recorded ${mutation.name}`, () => {
      const result = problemsOf("ishikawa", mutation)
      expect(result.base).toEqual([])
      expect(
        result.mutated.some((problem) =>
          problem.message.includes(mutation.expected),
        ),
      ).toBe(true)
    })
})
