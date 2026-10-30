import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  CYNEFIN_CHILD_TYPES,
  CYNEFIN_FIELD_WORDS,
} from "../src/check-tree/cynefin.ts"
import { NODE_FIELDS, childFieldsOf } from "../src/check-tree/node-fields.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { buildCynefin, domain, item, transition } from "./cynefin-built.ts"
import { common, ignored, withPreheader } from "./statement-tree-built.ts"
import { itFailsEach, nodeWith } from "./check-tree-built.ts"
import type { BrokenCase, Built, Kit } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"

/** Every node and native ownership position is authored explicitly. */
function allFields(): Built {
  return buildCynefin(
    'cynefin-beta:\n%%{!body}%%\ncomplex %%{!name}%%\n"A" %%{!tail}%%\n\n---\nx\n---\n\'B\'\n\n%%{!outside}%%\nclear\ncomplex %%{!arrow}%%\n--> %%{!to}%%\nclear %%{!colon}%%\n: %%{!label}%%\n"C" %%{!end}%%\n\ntitle T\naccTitle: A\naccDescr: D\naccDescr { E\n F }',
    (k) => [
      ignored(k, "Cynefin", "%%{!body}%%", "directive"),
      domain(
        k,
        "complex",
        [
          () =>
            item(k, '"A"', {
              textAfter: () => [
                ignored(k, "Cynefin", "%%{!tail}%%", "directive"),
              ],
            }),
          () =>
            item(k, "'B'", {
              textBefore: () => [
                ignored(k, "Cynefin", "---\nx\n---", "yaml-block"),
              ],
            }),
        ],
        () => [ignored(k, "Cynefin", "%%{!name}%%", "directive")],
      ),
      ignored(k, "Cynefin", "%%{!outside}%%", "directive"),
      domain(k, "clear"),
      transition(k, "complex", "clear", '"C"', {
        textBeforeArrow: () => [
          ignored(k, "Cynefin", "%%{!arrow}%%", "directive"),
        ],
        textBeforeTo: () => [ignored(k, "Cynefin", "%%{!to}%%", "directive")],
        textBeforeColon: () => [
          ignored(k, "Cynefin", "%%{!colon}%%", "directive"),
        ],
        textBeforeLabel: () => [
          ignored(k, "Cynefin", "%%{!label}%%", "directive"),
        ],
        textAfter: () => [ignored(k, "Cynefin", "%%{!end}%%", "directive")],
      }),
      common(k, "Cynefin", "Title", "T"),
      common(k, "Cynefin", "AccTitle", " A"),
      common(k, "Cynefin", "AccDescr", " D"),
      common(k, "Cynefin", "AccDescrBlock", "E\n F"),
    ],
    true,
  )
}

const VALID: readonly { name: string; built: () => Built }[] = [
  {
    name: "a global directive between a domain word and its item",
    built: () =>
      buildCynefin('cynefin-beta\ncomplex%%{init:{}}%%"A"', (k) => [
        domain(k, "complex", [
          () => {
            k.directive("%%{init:{}}%%")
            return item(k, '"A"')
          },
        ]),
      ]),
  },
  {
    name: "a selected semicolon between the transition source and arrow",
    built: () =>
      buildCynefin(
        'cynefin-beta\ncomplex "style:#x" complex;--> clear',
        (k) => [
          domain(k, "complex", [() => item(k, '"style:#x"')]),
          transition(k, "complex", "clear", null, {
            textBeforeArrow: () => {
              k.token("IgnoredSemicolon", ";")
              return []
            },
          }),
        ],
      ),
  },
  {
    name: "a string with explicit fragments around a common directive",
    built: () =>
      buildCynefin('cynefin-beta\ncomplex "A%%{init:{}}%%B"', (k) => [
        domain(k, "complex", [
          () => {
            const first = k.token("StringFragment", '"A')
            k.directive("%%{init:{}}%%")
            const last = k.token("StringFragment", 'B"')
            const range = [first.range[0], last.range[1]] as const
            const label = k.node("StringLiteral", range, {
              raw: '"A%%{init:{}}%%B"',
              value: "AB",
              closed: true,
            })
            return k.node("CynefinDomainItem", range, {
              textBefore: [],
              label,
              textAfter: [],
            })
          },
        ]),
      ]),
  },
  { name: "all nodes and native owners", built: allFields },
  { name: "bare header", built: () => buildCynefin("cynefin-beta", () => []) },
  {
    name: "a final empty title followed by a space outside its range",
    built: () =>
      buildCynefin("cynefin-beta\ntitle ", (k) => [
        common(k, "Cynefin", "Title", null),
      ]),
  },
  {
    name: "a final empty title followed by a tab outside its range",
    built: () =>
      buildCynefin("cynefin-beta\ntitle\t", (k) => [
        common(k, "Cynefin", "Title", null),
      ]),
  },
  {
    name: "an empty title before a common comment",
    built: () =>
      buildCynefin('cynefin-beta\ntitle %% comment\ncomplex "A"', (k) => {
        const title = common(k, "Cynefin", "Title", null)
        k.comment("%%", "%% comment")
        return [title, domain(k, "complex", [() => item(k, '"A"')])]
      }),
  },
  {
    name: "an empty title before a global directive",
    built: () =>
      buildCynefin('cynefin-beta\ntitle %%{init: {}}%%\ncomplex "A"', (k) => {
        const title = common(k, "Cynefin", "Title", null)
        k.directive("%%{init: {}}%%")
        return [title, domain(k, "complex", [() => item(k, '"A"')])]
      }),
  },
  {
    name: "attached colon touching a domain",
    built: () =>
      buildCynefin(
        'cynefin-beta:complex"A"',
        (k) => [domain(k, "complex", [() => item(k, '"A"')])],
        true,
      ),
  },
  {
    name: "adjacent items and glued domains",
    built: () =>
      buildCynefin("cynefin-beta\ncomplex\"A\"'B'clear", (k) => [
        domain(k, "complex", [() => item(k, '"A"'), () => item(k, "'B'")]),
        domain(k, "clear"),
      ]),
  },
  {
    name: "empty domains and immediate name suffix",
    built: () =>
      buildCynefin("cynefin-beta\ncomplex %%{!}%%\nclear", (k) => [
        domain(k, "complex", [], () => [
          ignored(k, "Cynefin", "%%{!}%%", "directive"),
        ]),
        domain(k, "clear"),
      ]),
  },
  {
    name: "body form after an empty domain's visible LF",
    built: () =>
      buildCynefin("cynefin-beta\ncomplex\n%%{!}%%\nclear", (k) => [
        domain(k, "complex"),
        ignored(k, "Cynefin", "%%{!}%%", "directive"),
        domain(k, "clear"),
      ]),
  },
  {
    name: "first item owns forms after visible LF",
    built: () =>
      buildCynefin('cynefin-beta\ncomplex\n%%{!}%%\n"A"', (k) => [
        domain(k, "complex", [
          () =>
            item(k, '"A"', {
              textBefore: () => [ignored(k, "Cynefin", "%%{!}%%", "directive")],
            }),
        ]),
      ]),
  },
  {
    name: "item suffix before a next statement on the same logical line",
    built: () =>
      buildCynefin('cynefin-beta\ncomplex "A" %%{!}%% clear', (k) => [
        domain(k, "complex", [
          () =>
            item(k, '"A"', {
              textAfter: () => [ignored(k, "Cynefin", "%%{!}%%", "directive")],
            }),
        ]),
        domain(k, "clear"),
      ]),
  },
  {
    name: "unlabeled transition suffix belongs to textAfter",
    built: () =>
      buildCynefin("cynefin-beta\ncomplex --> clear %%{!}%%", (k) => [
        transition(k, "complex", "clear", null, {
          textAfter: () => [ignored(k, "Cynefin", "%%{!}%%", "directive")],
        }),
      ]),
  },
  {
    name: "self transition and empty label remain authored",
    built: () =>
      buildCynefin('cynefin-beta\nclear --> clear : ""', (k) => [
        transition(k, "clear", "clear", '""'),
      ]),
  },
  {
    name: "spare LF after transition hidden suffix",
    built: () =>
      buildCynefin(
        "cynefin-beta\ncomplex --> clear %%{!}%%\n\nchaotic",
        (k) => [
          transition(k, "complex", "clear", null, {
            textAfter: () => [ignored(k, "Cynefin", "%%{!}%%", "directive")],
          }),
          domain(k, "chaotic"),
        ],
      ),
  },
  {
    name: "space leaves LF visible after a common block suffix",
    built: () =>
      buildCynefin("cynefin-beta\naccDescr {}%%{!}%% \ncomplex", (k) => [
        common(k, "Cynefin", "AccDescrBlock", null, () => [
          ignored(k, "Cynefin", "%%{!}%%", "directive"),
        ]),
        domain(k, "complex"),
      ]),
  },
  {
    name: "EOF after a common block hidden suffix",
    built: () =>
      buildCynefin("cynefin-beta\naccDescr {}%%{!}%%", (k) => [
        common(k, "Cynefin", "AccDescrBlock", null, () => [
          ignored(k, "Cynefin", "%%{!}%%", "directive"),
        ]),
      ]),
  },
  {
    name: "body-present YAML before an adjacent empty fallback",
    built: () =>
      buildCynefin("cynefin-beta\n---\n---\n---", (k) => [
        ignored(k, "Cynefin", "---\n---\n---", "yaml-block"),
      ]),
  },
  {
    name: "two independent nonempty YAML matches",
    built: () =>
      buildCynefin("cynefin-beta\n---\nx\n---\n---\ny\n---", (k) => [
        ignored(k, "Cynefin", "---\nx\n---", "yaml-block"),
        ignored(k, "Cynefin", "---\ny\n---", "yaml-block"),
      ]),
  },
  {
    name: "earliest qualifying directive closer",
    built: () =>
      buildCynefin("cynefin-beta\n%%{!}%%x }%%\ncomplex", (k) => [
        ignored(k, "Cynefin", "%%{!}%%x }%%", "directive"),
        domain(k, "complex"),
      ]),
  },
  {
    name: "native-looking text enclosed by strings and common blocks",
    built: () =>
      buildCynefin(
        'cynefin-beta\ncomplex "%%{!}%%" "---\nx\n---"\naccDescr {---\nx\n---}',
        (k) => [
          domain(k, "complex", [
            () => item(k, '"%%{!}%%"'),
            () => item(k, '"---\nx\n---"'),
          ]),
          common(k, "Cynefin", "AccDescrBlock", "---\nx\n---"),
        ],
      ),
  },
  {
    name: "bare and whitespace-only common values",
    built: () =>
      buildCynefin(
        "cynefin-beta\ntitle\ntitle  \naccTitle: \t\naccDescr: {x}\naccDescr {  }",
        (k) => [
          common(k, "Cynefin", "Title", null),
          common(k, "Cynefin", "Title", " "),
          common(k, "Cynefin", "AccTitle", " \t"),
          common(k, "Cynefin", "AccDescr", " {x}"),
          common(k, "Cynefin", "AccDescrBlock", null),
        ],
      ),
  },
  {
    name: "CRLF and hidden consumed LF ownership",
    built: () =>
      buildCynefin('cynefin-beta\r\ncomplex %%{!\r\nx}%%\r\n"A"', (k) => [
        domain(k, "complex", [() => item(k, '"A"')], () => [
          ignored(k, "Cynefin", "%%{!\r\nx}%%", "directive"),
        ]),
      ]),
  },
  {
    name: "a native comment between two items",
    built: () =>
      buildCynefin('cynefin-beta\ncomplex "A" %% native\n"B"', (k) => [
        domain(k, "complex", [
          () => item(k, '"A"'),
          () => {
            k.comment("%%", "%% native")
            return item(k, '"B"')
          },
        ]),
      ]),
  },
  {
    name: "native directive fallback Comment",
    built: () =>
      buildCynefin("cynefin-beta\n%%{!open\ncomplex", (k) => {
        k.comment("%%", "%%{!open")
        return [domain(k, "complex")]
      }),
  },
]

describe("cynefin tree conditions", () => {
  for (const row of VALID)
    it(`passes ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })

  it("registers exactly the eleven documented types and their child fields", () => {
    const fields = Object.entries(NODE_FIELDS).filter(([name]) =>
      name.startsWith("Cynefin"),
    )
    expect(fields).toHaveLength(11)
    for (const [name] of fields) {
      expect(Object.keys(CYNEFIN_CHILD_TYPES[name] ?? {})).toEqual(
        childFieldsOf(name),
      )
    }
    expect(CYNEFIN_FIELD_WORDS.CynefinArrow).toEqual({
      startMarker: ["none"],
      line: ["solid"],
      endMarker: ["arrow"],
    })
  })
})

const BROKEN: readonly BrokenCase[] = [
  {
    name: "native forms assigned to the gaps of an absent transition label",
    built: () =>
      buildCynefin("cynefin-beta\ncomplex --> clear %%{!}%%", (k) => [
        transition(k, "complex", "clear", null, {
          textAfter: () => [ignored(k, "Cynefin", "%%{!}%%", "directive")],
        }),
      ]),
    mutate: (tree) => {
      const node = nodeWith(tree, "CynefinTransitionStatement")
      setField(node, "textBeforeColon", node.textAfter)
      setField(node, "textBeforeLabel", node.textAfter)
      setField(node, "textAfter", [])
    },
    expected: "the absent label's textBeforeColon gap must be empty",
  },
  {
    name: "an empty title range absorbing its sole separator",
    built: () =>
      buildCynefin("cynefin-beta\ntitle ", (k) => [
        common(k, "Cynefin", "Title", null),
      ]),
    mutate: (tree) => {
      const node = nodeWith(tree, "CynefinTitleStatement")
      setField(node, "range", [node.range[0], node.range[1] + 1])
    },
    expected: "CynefinTitleStatement at #: the range, which runs",
  },
  {
    name: "a diagram range absorbing the final empty title separator",
    built: () =>
      buildCynefin("cynefin-beta\ntitle\t", (k) => [
        common(k, "Cynefin", "Title", null),
      ]),
    mutate: (tree) =>
      setField(tree.body, "range", [
        tree.body.range[0],
        tree.body.range[1] + 1,
      ]),
    expected: "Root.body: does not run from its first token to its last",
  },
  {
    name: "a bare title range absorbing visible EOL",
    built: () =>
      buildCynefin("cynefin-beta\ntitle\n", (k) => [
        common(k, "Cynefin", "Title", null),
      ]),
    mutate: (tree) => {
      const node = nodeWith(tree, "CynefinTitleStatement")
      setField(node, "range", [node.range[0], node.range[1] + 1])
    },
    expected:
      "CynefinTitleStatement at #: does not run from the start of a token to the end of a token",
  },
  {
    name: "a valid but unwritten domain name",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinDomainStatement"), "name", "confusion"),
    expected: "the written domain name",
  },
  {
    name: "a valid but unwritten source domain",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinTransitionStatement"), "from", "chaotic"),
    expected: "the written from domain",
  },
  {
    name: "a valid but unwritten target domain",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinTransitionStatement"), "to", "complex"),
    expected: "the written to domain",
  },
  {
    name: "lost name suffix ownership",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinDomainStatement"), "textAfterName", []),
    expected: "a domain writes exactly one complete fixed domain word",
  },
  {
    name: "lost item prefix ownership",
    built: allFields,
    mutate: (tree) => {
      const members = nodeWith(tree, "CynefinDomainStatement")
        .items as CheckedNode[]
      setField(members[1], "textBefore", [])
    },
    expected: "the gap is not",
  },
  {
    name: "lost item suffix ownership",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinDomainItem"), "textAfter", []),
    expected: "the gap is not",
  },
  {
    name: "duplicated native ownership",
    built: allFields,
    mutate: (tree) => {
      const node = nodeWith(tree, "CynefinTransitionStatement")
      const forms = node.textBeforeArrow as CheckedNode[]
      setField(node, "textBeforeArrow", [forms[0], forms[0]])
    },
    expected: "overlaps the child node",
  },
  {
    name: "a transition form moved to the wrong named gap",
    built: allFields,
    mutate: (tree) => {
      const node = nodeWith(tree, "CynefinTransitionStatement")
      setField(node, "textBeforeArrow", [
        ...(node.textBeforeArrow as CheckedNode[]),
        ...(node.textBeforeTo as CheckedNode[]),
      ])
      setField(node, "textBeforeTo", [])
    },
    expected: "the gap is not",
  },
  {
    name: "an arrow's start marker",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinArrow"), "startMarker", "arrow"),
    expected: "the field startMarker is",
  },
  {
    name: "an arrow's line",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinArrow"), "line", "dotted"),
    expected: "the field line is",
  },
  {
    name: "an arrow's end marker",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinArrow"), "endMarker", "none"),
    expected: "the field endMarker is",
  },
  {
    name: "an arrow's authored value",
    built: allFields,
    mutate: (tree) => setField(nodeWith(tree, "CynefinArrow"), "value", "->"),
    expected: "value is not its written text",
  },
  {
    name: "decoded string value replacing its authored escape",
    built: () =>
      buildCynefin('cynefin-beta\ncomplex "a\\n"', (k) => [
        domain(k, "complex", [() => item(k, '"a\\n"')]),
      ]),
    mutate: (tree) => setField(nodeWith(tree, "StringLiteral"), "value", "a\n"),
    expected: "value is not its written text",
  },
  {
    name: "a trimmed common line value",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinLiteral", "value", " A"), "value", "A"),
    expected: "value is not its written text",
  },
  {
    name: "an authored hidden value",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinIgnoredText"), "value", "other"),
    expected: "value is not its written text",
  },
  {
    name: "the hidden kind",
    built: allFields,
    mutate: (tree) =>
      setField(nodeWith(tree, "CynefinIgnoredText"), "kind", "yaml-block"),
    expected: "the value is not one complete hidden YAML or DIRECTIVE form",
  },
  {
    name: "the earlier empty YAML fallback",
    built: () =>
      buildCynefin("cynefin-beta\n---\n---\n---", (k) => [
        ignored(k, "Cynefin", "---\n---\n---", "yaml-block"),
      ]),
    mutate: (tree) => {
      const node = nodeWith(tree, "CynefinIgnoredText")
      setField(node, "range", [node.range[0], node.range[0] + 7])
      setField(node, "value", "---\n---")
    },
    expected: "the value is not one complete hidden YAML or DIRECTIVE form",
  },
  {
    name: "a later YAML closer instead of the first qualifying one",
    built: () =>
      buildCynefin("cynefin-beta\n---\nx\n---\n---\ny\n---", (k) => [
        ignored(k, "Cynefin", "---\nx\n---", "yaml-block"),
        ignored(k, "Cynefin", "---\ny\n---", "yaml-block"),
      ]),
    mutate: (tree) => {
      const forms = tree.body.body as CheckedNode[]
      setField(forms[0], "range", [forms[0].range[0], forms[1].range[1]])
    },
    expected: "the value is not one complete hidden YAML or DIRECTIVE form",
  },
  {
    name: "the consumed LF included in a hidden node",
    built: allFields,
    mutate: (tree) => {
      const node = nodeWith(tree, "CynefinIgnoredText")
      setField(node, "range", [node.range[0], node.range[1] + 1])
    },
    expected: "the value is not one complete hidden YAML or DIRECTIVE form",
  },
]
itFailsEach(BROKEN)

for (const row of [
  {
    name: "item-leading forms without visible LF",
    source: 'cynefin-beta\ncomplex %%{!}%%\n"A"',
    make: (k: Kit) => [
      domain(k, "complex", [
        () =>
          item(k, '"A"', {
            textBefore: () => [ignored(k, "Cynefin", "%%{!}%%", "directive")],
          }),
      ]),
    ],
    message: "item-leading hidden forms require a preceding visible LF",
  },
  {
    name: "domain name suffix after visible LF",
    source: 'cynefin-beta\ncomplex\n%%{!}%%\n"A"',
    make: (k: Kit) => [
      domain(k, "complex", [() => item(k, '"A"')], () => [
        ignored(k, "Cynefin", "%%{!}%%", "directive"),
      ]),
    ],
    message: "the gap is not hidden ASCII whitespace",
  },
  {
    name: "body-owned immediate item suffix",
    source: 'cynefin-beta\ncomplex "A" %%{!}%%',
    make: (k: Kit) => [
      domain(k, "complex", [() => item(k, '"A"')]),
      ignored(k, "Cynefin", "%%{!}%%", "directive"),
    ],
    message: "a body-owned hidden form after a domain requires visible LF",
  },
  {
    name: "only LF consumed after a transition suffix",
    source: "cynefin-beta\ncomplex --> clear %%{!}%%\nchaotic",
    make: (k: Kit) => [
      transition(k, "complex", "clear", null, {
        textAfter: () => [ignored(k, "Cynefin", "%%{!}%%", "directive")],
      }),
      domain(k, "chaotic"),
    ],
    message: "a following statement requires visible EOL",
  },
  {
    name: "unattached header colon",
    source: "cynefin-beta :complex",
    make: (k: Kit) => [domain(k, "complex")],
    message: "the header word and colon must be adjacent",
  },
] as const)
  it(`reports ${row.name}`, () => {
    const { source, tree } = buildCynefin(
      row.source,
      row.make,
      row.name === "unattached header colon",
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(row.message)
  })

for (const row of [
  {
    source: "%% c\n---\nx\n---\n%%\n\u00a0cynefin-beta",
    parts: [["---\nx\n---", "yaml-block"]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n%%\n\u2028cynefin-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    comments: ["%% c", "%%"],
  },
  {
    source:
      "%% c\n---\nx\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\n%%\n\ufeffcynefin-beta",
    parts: [
      ["---\nx\n---", "yaml-block"],
      ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
    ],
    comments: ["%% c", "%%", "%% gap", "%%"],
  },
] as const)
  it(`passes retained-prefix detection trivia ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = withPreheader(
      buildCynefin(row.source, () => []),
      "Cynefin",
      row.parts,
      row.comments,
    )
    expect(checkTree(source, tree)).toEqual([])
  })

for (const row of [
  {
    source: "%% c\n---\nx\n---\n\u2028cynefin-beta",
    parts: [["---\nx\n---", "yaml-block"]],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n\u00a0cynefin-beta",
    parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
  },
] as const)
  it(`keeps ordinary prefix boundaries strict ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = withPreheader(
      buildCynefin(row.source, () => []),
      "Cynefin",
      row.parts,
      ["%% c"],
    )
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "ASCII whitespace and LF",
    )
  })

it("reports a native Comment disguising an earlier hidden directive", () => {
  const { source, tree } = buildCynefin(
    "cynefin-beta\n%%{!}%%\ncomplex",
    (k) => {
      k.comment("%%", "%%{!}%%")
      return [domain(k, "complex")]
    },
  )
  expect(JSON.stringify(checkTree(source, tree))).toContain(
    "earlier hidden DIRECTIVE rule matches",
  )
})

it("reports a native Comment inside an enclosing string", () => {
  const { source, tree } = buildCynefin(
    'cynefin-beta\ncomplex "%% native"',
    (k) => [domain(k, "complex", [() => item(k, '"%% native"')])],
  )
  const hidden = nodesOf(tree).find((n) => n.type === "StringLiteral")!
  setField(tree, "comments", [
    {
      type: "Comment",
      mark: "%%",
      value: ' native"',
      range: [hidden.range[0] + 1, hidden.range[1]],
      loc: hidden.loc,
    },
  ])
  expect(JSON.stringify(checkTree(source, tree))).toContain(
    "native Comment cannot start inside a STRING",
  )
})
