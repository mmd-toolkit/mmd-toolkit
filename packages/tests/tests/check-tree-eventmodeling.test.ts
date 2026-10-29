import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import {
  EVENTMODELING_CHILD_TYPES,
  EVENTMODELING_FIELD_WORDS,
  EVENTMODELING_NONEMPTY_LISTS,
} from "../src/check-tree/eventmodeling.ts"
import { NODE_FIELDS } from "../src/check-tree/node-fields.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import {
  buildEventmodeling,
  common,
  frame,
  qualified,
  sourceReference,
  dataReference,
  data,
  blockStatement,
  clause,
  gwtItem,
  gwt,
  writtenTree,
} from "./eventmodeling-built.ts"
import { ignored, withPreheader } from "./statement-tree-built.ts"
import { itFailsEach, nodeWith } from "./check-tree-built.ts"
import type { BrokenCase, Built } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { commentOf, locationOf } from "./check-tree-trees.ts"

/** Each optional member owns its own leading native form, without an EOL field. */
function optionalGaps(): Built {
  return buildEventmodeling(
    "eventmodeling tf 01 evt A ---\na\n---\n->> 02 ---\nb\n---\n[[D]] ---\nc\n---\n{x}",
    (k) => [
      frame(k, "01", "evt", () => qualified(k, "A"), {
        sources: [
          () =>
            sourceReference(k, "02", {
              textBefore: () => [
                ignored(k, "Eventmodeling", "---\na\n---", "yaml-block"),
              ],
            }),
        ],
        reference: () =>
          dataReference(k, "D", {
            textBefore: () => [
              ignored(k, "Eventmodeling", "---\nb\n---", "yaml-block"),
            ],
          }),
        data: () =>
          data(k, "{x}", false, null, {
            textBefore: () => [
              ignored(k, "Eventmodeling", "---\nc\n---", "yaml-block"),
            ],
          }),
      }),
    ],
  )
}

/** Hidden ownership is supplied at every required frame, member and tag gap. */
function requiredGaps(): Built {
  return buildEventmodeling(
    "eventmodeling tf %%{{n}}%% 01 %%{{t}}%% evt %%{{e}}%% Shop %%{{d}}%% . %%{{p}}%% Bought ->> %%{{f}}%% 02 [[ %%{{dn}}%% D %%{{dc}}%% ]] ` %%{{tag}}%% json %%{{tc}}%% ` %%{{v}}%% {x}",
    (k) => [
      frame(
        k,
        "01",
        "evt",
        () =>
          qualified(k, "Shop", [
            {
              name: "Bought",
              gaps: {
                textBeforeDot: () => [
                  ignored(k, "Eventmodeling", "%%{{d}}%%", "directive"),
                ],
                textBeforeName: () => [
                  ignored(k, "Eventmodeling", "%%{{p}}%%", "directive"),
                ],
              },
            },
          ]),
        {
          gaps: {
            textBeforeName: () => [
              ignored(k, "Eventmodeling", "%%{{n}}%%", "directive"),
            ],
            textBeforeModelEntityType: () => [
              ignored(k, "Eventmodeling", "%%{{t}}%%", "directive"),
            ],
            textBeforeEntityIdentifier: () => [
              ignored(k, "Eventmodeling", "%%{{e}}%%", "directive"),
            ],
          },
          sources: [
            () =>
              sourceReference(k, "02", {
                textBeforeFrame: () => [
                  ignored(k, "Eventmodeling", "%%{{f}}%%", "directive"),
                ],
              }),
          ],
          reference: () =>
            dataReference(k, "D", {
              textBeforeName: () => [
                ignored(k, "Eventmodeling", "%%{{dn}}%%", "directive"),
              ],
              textBeforeClose: () => [
                ignored(k, "Eventmodeling", "%%{{dc}}%%", "directive"),
              ],
            }),
          data: () =>
            data(k, "{x}", false, "json", {
              textBeforeDataType: () => [
                ignored(k, "Eventmodeling", "%%{{tag}}%%", "directive"),
              ],
              textBeforeTypeClose: () => [
                ignored(k, "Eventmodeling", "%%{{tc}}%%", "directive"),
              ],
              textBeforeValue: () => [
                ignored(k, "Eventmodeling", "%%{{v}}%%", "directive"),
              ],
            }),
        },
      ),
    ],
  )
}

/** GWT's next member owns a native form, even when physical lines do not separate it. */
function gwtGaps(): Built {
  return buildEventmodeling(
    "eventmodeling gwt %%{{f}}%% 99 %%{{g}}%% given %%{{i}}%% evt %%{{n}}%% A %%{{w}}%% when cmd B %%{{t}}%% then ui C\n%%{{outside}}%%",
    (k) => [
      gwt(
        k,
        "99",
        () =>
          clause(
            k,
            "given",
            [
              () =>
                gwtItem(k, "evt", "A", {
                  textBefore: () => [
                    ignored(k, "Eventmodeling", "%%{{i}}%%", "directive"),
                  ],
                  textBeforeEntityIdentifier: () => [
                    ignored(k, "Eventmodeling", "%%{{n}}%%", "directive"),
                  ],
                }),
            ],
            () => [ignored(k, "Eventmodeling", "%%{{g}}%%", "directive")],
          ),
        () =>
          clause(k, "then", [() => gwtItem(k, "ui", "C")], () => [
            ignored(k, "Eventmodeling", "%%{{t}}%%", "directive"),
          ]),
        () =>
          clause(k, "when", [() => gwtItem(k, "cmd", "B")], () => [
            ignored(k, "Eventmodeling", "%%{{w}}%%", "directive"),
          ]),
        () => [ignored(k, "Eventmodeling", "%%{{f}}%%", "directive")],
      ),
      ignored(k, "Eventmodeling", "%%{{outside}}%%", "directive"),
    ],
  )
}

const VALID: readonly { name: string; built: () => Built }[] = [
  { name: "all 22 authored node types", built: writtenTree },
  {
    name: "a reset frame retaining data reference and inline fallback",
    built: () =>
      buildEventmodeling(
        "eventmodeling\nrf 01 cmd A [[D]] {inline}\ndata D {\nx\n}\n",
        (k) => [
          frame(k, "01", "cmd", () => qualified(k, "A"), {
            keyword: "rf",
            reference: () => dataReference(k, "D"),
            data: () => data(k, "{inline}"),
          }),
          blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
        ],
      ),
  },
  { name: "all optional frame gaps", built: optionalGaps },
  {
    name: "required frame, qualified member, source, reference and tag gaps",
    built: requiredGaps,
  },
  {
    name: "GWT required components, clauses, items and trailing body ownership",
    built: gwtGaps,
  },
  {
    name: "general body whitespace with no visible EOL requirement",
    built: () =>
      buildEventmodeling(
        "eventmodeling\u2028tf\u00a001\ufeffevt\u2029A rf 02 cmd B",
        (k) => [
          frame(k, "01", "evt", () => qualified(k, "A")),
          frame(k, "02", "cmd", () => qualified(k, "B"), { keyword: "rf" }),
        ],
      ),
  },
  {
    name: "unknown, forward and self references and repeated frame declarations",
    built: () =>
      buildEventmodeling(
        "eventmodeling tf 01 evt A ->> 99 ->> 01 tf 01 evt B",
        (k) => [
          frame(k, "01", "evt", () => qualified(k, "A"), {
            sources: [
              () => sourceReference(k, "99"),
              () => sourceReference(k, "01"),
            ],
          }),
          frame(k, "01", "evt", () => qualified(k, "B")),
        ],
      ),
  },
  {
    name: "empty quoted and brace inline payloads",
    built: () =>
      buildEventmodeling('eventmodeling tf 01 evt A "" tf 02 evt B {}', (k) => [
        frame(k, "01", "evt", () => qualified(k, "A"), {
          data: () => data(k, '""'),
        }),
        frame(k, "02", "evt", () => qualified(k, "B"), {
          data: () => data(k, "{}"),
        }),
      ]),
  },
  {
    name: "greedy same-line quoted bodies with ordinary backslashes",
    built: () =>
      buildEventmodeling('eventmodeling tf 01 evt A "x" "y\\n"', (k) => [
        frame(k, "01", "evt", () => qualified(k, "A"), {
          data: () => data(k, '"x" "y\\n"'),
        }),
      ]),
  },
  {
    name: "native-looking text enclosed in inline data",
    built: () =>
      buildEventmodeling(
        'eventmodeling tf 01 evt A "%%{{x}}%% /* c */"',
        (k) => [
          frame(k, "01", "evt", () => qualified(k, "A"), {
            data: () => data(k, '"%%{{x}}%% /* c */"'),
          }),
        ],
      ),
  },
  {
    name: "native-looking lines enclosed in block data",
    built: () =>
      buildEventmodeling(
        "eventmodeling data D {\n---\nx\n---\n%%{{x}}%%\n}",
        (k) => [
          blockStatement(k, "data", "D", () =>
            data(k, "{\n---\nx\n---\n%%{{x}}%%\n}", true),
          ),
        ],
      ),
  },
  {
    name: "native YAML inside a common composite remains literal text",
    built: () =>
      buildEventmodeling("eventmodeling accDescr {\n---\nx\n---\n}", (k) => [
        common(k, "AccDescrBlock", "\n---\nx\n---\n"),
      ]),
  },
  {
    name: "body-present YAML alternative before an adjacent empty closer",
    built: () =>
      buildEventmodeling("eventmodeling\n---\n---\n---", (k) => [
        ignored(k, "Eventmodeling", "---\n---\n---", "yaml-block"),
      ]),
  },
  {
    name: "earliest qualifying YAML closer before a second native block",
    built: () =>
      buildEventmodeling("eventmodeling\n---\nx\n---\n---\ny\n---", (k) => [
        ignored(k, "Eventmodeling", "---\nx\n---", "yaml-block"),
        ignored(k, "Eventmodeling", "---\ny\n---", "yaml-block"),
      ]),
  },
  {
    name: "data body-present alternative before an adjacent empty closer",
    built: () =>
      buildEventmodeling("eventmodeling data D {\n}\n}", (k) => [
        blockStatement(k, "data", "D", () => data(k, "{\n}\n}", true)),
      ]),
  },
  {
    name: "a nonqualifying directive closer before the first qualifying closer",
    built: () =>
      buildEventmodeling("eventmodeling %%{{a}}%%x}%% tf 01 evt A", (k) => [
        ignored(k, "Eventmodeling", "%%{{a}}%%x}%%", "directive"),
        frame(k, "01", "evt", () => qualified(k, "A")),
      ]),
  },
  {
    name: "block data at EOF with the logical closing LF outside ranges",
    built: () =>
      buildEventmodeling("eventmodeling data D {\nx\n}", (k) => [
        blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
      ]),
  },
  {
    name: "lookahead-only PS after a native YAML closer",
    built: () =>
      buildEventmodeling("eventmodeling ---\nx\n---\u2029tf 01 evt A", (k) => [
        ignored(k, "Eventmodeling", "---\nx\n---", "yaml-block"),
        frame(k, "01", "evt", () => qualified(k, "A")),
      ]),
  },
  {
    name: "a spare LF after native YAML before a frame",
    built: () =>
      buildEventmodeling("eventmodeling ---\nx\n---\n\ntf 01 evt A", (k) => [
        ignored(k, "Eventmodeling", "---\nx\n---", "yaml-block"),
        frame(k, "01", "evt", () => qualified(k, "A")),
      ]),
  },
  {
    name: "a common form after the only LF is consumed by block data",
    built: () =>
      buildEventmodeling("eventmodeling data D {\nx\n}\n accTitle: A", (k) => [
        blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
        common(k, "AccTitle", " A"),
      ]),
  },
  {
    name: "selected semicolon exposes a native directive closing LF",
    built: () =>
      buildEventmodeling(
        "eventmodeling\n%%{{style:#x}}%%;\n accTitle: A",
        (k) => {
          const hidden = ignored(
            k,
            "Eventmodeling",
            "%%{{style:#x}}%%",
            "directive",
          )
          k.token("IgnoredSemicolon", ";")
          return [hidden, common(k, "AccTitle", " A")]
        },
      ),
  },
  {
    name: "empty description blocks remain independent statement boundaries",
    built: () =>
      buildEventmodeling(
        "eventmodeling data D {\nx\n}\n accDescr {} accTitle: A",
        (k) => [
          blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
          common(k, "AccDescrBlock", null),
          common(k, "AccTitle", " A"),
        ],
      ),
  },
  {
    name: "line and block common values preserve whitespace-only payloads",
    built: () =>
      buildEventmodeling(
        "eventmodeling accTitle:  \ndata D {\nx\n}\n accDescr { \t }",
        (k) => [
          common(k, "AccTitle", "  "),
          blockStatement(k, "data", "D", () => data(k, "{\nx\n}", true)),
          common(k, "AccDescrBlock", " \t "),
        ],
      ),
  },
]

describe("eventmodeling tree conditions", () => {
  for (const row of VALID)
    it(`accepts ${row.name}`, () => {
      const { source, tree } = row.built()
      expect(checkTree(source, tree)).toEqual([])
    })

  it("registers every child and scalar membership field on all 22 node types", () => {
    expect(
      Object.keys(NODE_FIELDS).filter((type) =>
        type.startsWith("Eventmodeling"),
      ),
    ).toHaveLength(22)
    for (const [type, fields] of Object.entries(EVENTMODELING_CHILD_TYPES))
      for (const field of Object.keys(fields))
        expect(NODE_FIELDS[type]?.[field]?.shape).not.toBe("value")
    expect(EVENTMODELING_FIELD_WORDS.EventmodelingIgnoredText?.kind).toEqual([
      "yaml-block",
      "directive",
    ])
    expect(EVENTMODELING_NONEMPTY_LISTS.EventmodelingGwtClause).toEqual([
      "body",
    ])
    expect(
      new Set(
        nodesOf(writtenTree().tree)
          .filter((node) => node.type.startsWith("Eventmodeling"))
          .map((node) => node.type),
      ).size,
    ).toBe(22)
  })
})

const BROKEN: readonly BrokenCase[] = [
  {
    name: "arrow fields disagreeing with the written arrow",
    built: writtenTree,
    mutate: (tree) =>
      setField(nodeWith(tree, "EventmodelingArrow"), "startMarker", "arrow"),
    expected: "the field startMarker is",
  },
  {
    name: "a changed arrow value",
    built: writtenTree,
    mutate: (tree) =>
      setField(nodeWith(tree, "EventmodelingArrow"), "value", "-->"),
    expected: "value is not its written text",
  },
  {
    name: "a valid but different entity-type word",
    built: writtenTree,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "EventmodelingTimeFrameStatement"),
        "modelEntityType",
        "cmd",
      ),
    expected: "the written modelEntityType",
  },
  {
    name: "a changed GWT clause kind",
    built: writtenTree,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "EventmodelingGwtClause", "kind", "when"),
        "kind",
        "given",
      ),
    expected: "the written when clause kind",
  },
  {
    name: "an empty required GWT item list",
    built: writtenTree,
    mutate: (tree) =>
      setField(nodeWith(tree, "EventmodelingGwtClause"), "body", []),
    expected: "the list body is empty",
  },
  {
    name: "a missing native optional member gap",
    built: optionalGaps,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "EventmodelingSourceReference"),
        "textBefore",
        [],
      ),
    expected: "each native hidden match must have exactly one",
  },
  {
    name: "a native form moved from its required frame gap to body",
    built: requiredGaps,
    mutate: (tree) => {
      const frameNode = nodeWith(tree, "EventmodelingTimeFrameStatement")
      const hidden = (frameNode.textBeforeName as CheckedNode[])[0]
      setField(frameNode, "textBeforeName", [])
      ;(tree.body.body as CheckedNode[]).push(hidden)
    },
    expected: "component gap contains unowned text",
  },
  {
    name: "duplicate ownership of a native match",
    built: optionalGaps,
    mutate: (tree) =>
      (tree.body.body as CheckedNode[]).push(
        nodeWith(tree, "EventmodelingIgnoredText"),
      ),
    expected: "exactly one whole IgnoredText owner",
  },
  {
    name: "an omitted GWT item gap",
    built: gwtGaps,
    mutate: (tree) =>
      setField(nodeWith(tree, "EventmodelingGwtItem"), "textBefore", []),
    expected: "each native hidden match must have exactly one",
  },
  {
    name: "an omitted qualified member gap",
    built: requiredGaps,
    mutate: (tree) =>
      setField(
        nodeWith(tree, "EventmodelingQualifiedNamePart"),
        "textBeforeDot",
        [],
      ),
    expected: "each native hidden match must have exactly one",
  },
  {
    name: "a type tag removed while its native internal gaps remain",
    built: requiredGaps,
    mutate: (tree) =>
      setField(nodeWith(tree, "EventmodelingInlineData"), "dataType", null),
    expected: "without a type tag the textBeforeDataType gap must be empty",
  },
  {
    name: "a changed data-type value",
    built: requiredGaps,
    mutate: (tree) =>
      setField(nodeWith(tree, "EventmodelingInlineData"), "dataType", "html"),
    expected: "the field dataType is its written type word",
  },
  {
    name: "a native range consuming its closing LF",
    built: optionalGaps,
    mutate: (tree, source) => {
      const hidden = nodeWith(tree, "EventmodelingIgnoredText")
      const range = [hidden.range[0], hidden.range[1] + 1] as const
      setField(hidden, "range", range)
      setField(hidden, "loc", locationOf(source, range))
    },
    expected: "without its consumed LF",
  },
  {
    name: "trimming authored block-description padding",
    built: () =>
      VALID.find((row) => row.name.startsWith("line and block"))!.built(),
    mutate: (tree) =>
      setField(
        nodeWith(tree, "EventmodelingLiteral", "value", " \t "),
        "value",
        "",
      ),
    expected: "value is not its written text",
  },
  {
    name: "removing an empty description statement",
    built: writtenTree,
    mutate: (tree) =>
      setField(
        tree.body,
        "body",
        (tree.body.body as CheckedNode[]).filter(
          (node) => node.type !== "EventmodelingAccDescrBlockStatement",
        ),
      ),
    expected: "the diagram must own exactly",
  },
  {
    name: "an adjacent empty YAML closer despite a qualifying body match",
    built: () =>
      VALID.find((row) => row.name.startsWith("body-present YAML"))!.built(),
    mutate: (tree, source) => {
      const hidden = nodeWith(tree, "EventmodelingIgnoredText")
      const range = [hidden.range[0], hidden.range[0] + 7] as const
      setField(hidden, "range", range)
      setField(hidden, "loc", locationOf(source, range))
      setField(hidden, "value", "---\n---")
    },
    expected: "complete hidden YAML or DIRECTIVE form",
  },
]
itFailsEach(BROKEN)

for (const row of [
  {
    source: "%% c\n---\nx\n---\n%%\n\u2028eventmodeling",
    parts: [["---\nx\n---", "yaml-block"]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%% c\n---\nx\n---\n\u00a0eventmodeling",
    parts: [["---\nx\n---", "yaml-block"]],
    comments: ["%% c"],
  },
  {
    source: "%% c\n%%{\n%% gap\nwrap}%%\n%%\n\u2029eventmodeling",
    parts: [["%%{\n%% gap\nwrap}%%", "directive"]],
    comments: ["%% c", "%%"],
  },
  {
    source: "%%{\n%% c\nwrap}%%\n\u00a0eventmodeling",
    parts: [["%%{\n%% c\nwrap}%%", "directive"]],
    comments: [],
  },
  {
    source:
      "%% c\n---\nx\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\n%%\n\ufeffeventmodeling",
    parts: [
      ["---\nx\n---", "yaml-block"],
      ["%%{\n%% gap\nwrap}%%", "directive"],
    ],
    comments: ["%% c", "%%", "%%"],
  },
] as const)
  it(`keeps the pre-header detection exception for ${JSON.stringify(row.source)}`, () => {
    const { source, tree } = withPreheader(
      buildEventmodeling(row.source, () => []),
      "Eventmodeling",
      row.parts,
      row.comments,
    )
    expect(checkTree(source, tree)).toEqual([])
  })

it("checks native percent/slash comment marks, values and first block closer", () => {
  const built = buildEventmodeling(
    "eventmodeling // a\u2028b\n/* c\n d */ tf 01 evt A %% trailing",
    (k) => {
      k.comment("//", "// a\u2028b")
      k.comment("/*", "/* c\n d */")
      const f = frame(k, "01", "evt", () => qualified(k, "A"))
      k.comment("%%", "%% trailing")
      return [f]
    },
  )
  setField(built.tree.comments[1], "value", " c\n d ")
  expect(checkTree(built.source, built.tree)).toEqual([])
})

it("reports a Comment disguising an earlier native directive", () => {
  const built = buildEventmodeling(
    "eventmodeling %%{{x}}%%\ntf 01 evt A",
    (k) => {
      k.comment("%%", "%%{{x}}%%")
      return [frame(k, "01", "evt", () => qualified(k, "A"))]
    },
  )
  expect(JSON.stringify(checkTree(built.source, built.tree))).toContain(
    "no earlier unit enclosing its start",
  )
})

it("reports a native Comment inside an enclosing inline value", () => {
  const built = buildEventmodeling(
    'eventmodeling tf 01 evt A "%%{{x}}%%"',
    (k) => [
      frame(k, "01", "evt", () => qualified(k, "A"), {
        data: () => data(k, '"%%{{x}}%%"'),
      }),
    ],
  )
  setField(built.tree, "comments", [
    commentOf(built.source, "%%", { text: "%%{{x}}%%" }),
  ])
  expect(JSON.stringify(checkTree(built.source, built.tree))).toContain(
    "no earlier unit enclosing its start",
  )
})

it("keeps a global directive at the end of a native line comment in its source range and value", () => {
  const built = buildEventmodeling(
    "eventmodeling // c %%{wrap}%%\ntf 01 evt A",
    (k) => {
      k.comment("//", "// c %%{wrap}%%")
      return [frame(k, "01", "evt", () => qualified(k, "A"))]
    },
  )
  // The directive record is shared, while its characters remain inside Comment.
  const from = built.source.indexOf("%%{wrap}%%")
  const range = [from, from + "%%{wrap}%%".length] as const
  setField(built.tree, "directives", [
    {
      type: "Directive",
      range,
      loc: locationOf(built.source, range),
      name: "wrap",
      value: "wrap",
      closed: true,
    },
  ])
  expect(checkTree(built.source, built.tree)).toEqual([])
})

it("reports lost trailing whitespace in a native line comment", () => {
  const built = buildEventmodeling("eventmodeling // c  \ntf 01 evt A", (k) => {
    k.comment("//", "// c  ")
    return [frame(k, "01", "evt", () => qualified(k, "A"))]
  })
  expect(checkTree(built.source, built.tree)).toEqual([])
  const comment = built.tree.comments[0]
  const range = [comment.range[0], comment.range[1] - 2] as const
  setField(comment, "range", range)
  setField(comment, "loc", locationOf(built.source, range))
  setField(comment, "value", " c")
  expect(JSON.stringify(checkTree(built.source, built.tree))).toContain(
    "does not end where its line ends",
  )
})

it("reports splitting a native block Comment without a common region", () => {
  const built = buildEventmodeling("eventmodeling /* ab */", (k) => {
    k.comment("/*", "/* ab */")
    return []
  })
  setField(built.tree.comments[0], "value", " ab ")
  expect(checkTree(built.source, built.tree)).toEqual([])
  const start = built.source.indexOf("/*")
  const first = commentOf(built.source, "/*", { text: "/* a" })
  const range = [start + 4, start + 8] as const
  const second = {
    type: "Comment",
    mark: null,
    value: "b ",
    range,
    loc: locationOf(built.source, range),
  }
  setField(built.tree, "comments", [first, second])
  expect(JSON.stringify(checkTree(built.source, built.tree))).toContain(
    "a native Comment fragment must follow a common comment region",
  )
})

it("keeps a comment line inside a native block Comment as a part of its value", () => {
  const source = "eventmodeling /* A\n%% c\nB */ tf 01 evt A"
  const built = buildEventmodeling(source, (k) => {
    k.comment("/*", "/* A\n%% c\nB */")
    return [frame(k, "01", "evt", () => qualified(k, "A"))]
  })
  setField(built.tree.comments[0], "value", " A\n%% c\nB ")
  expect(checkTree(source, built.tree)).toEqual([])
})

it("reports taking a later YAML closer after an earlier qualifying body-present close", () => {
  const built = buildEventmodeling(
    "eventmodeling\n---\nx\n---\n---\ny\n---",
    (k) => [
      ignored(k, "Eventmodeling", "---\nx\n---", "yaml-block"),
      ignored(k, "Eventmodeling", "---\ny\n---", "yaml-block"),
    ],
  )
  expect(checkTree(built.source, built.tree)).toEqual([])
  const first = nodeWith(built.tree, "EventmodelingIgnoredText")
  const range = [first.range[0], built.source.length] as const
  setField(first, "range", range)
  setField(first, "loc", locationOf(built.source, range))
  setField(first, "value", built.source.slice(...range))
  expect(JSON.stringify(checkTree(built.source, built.tree))).toContain(
    "complete hidden YAML or DIRECTIVE form",
  )
})
