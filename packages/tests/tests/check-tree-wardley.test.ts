import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { checkTree } from "../src/check-tree/index.ts"
import { WARDLEY_CHILD_TYPES } from "../src/check-tree/wardley.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import type { CheckedNode } from "../src/check-tree/types.ts"
import { getFixturesRoot } from "../src/index.ts"
import { buildTree, nodeWith } from "./check-tree-built.ts"
import type { Built, Kit } from "./check-tree-built.ts"
import { copyOf, setField } from "./check-tree-recorded.ts"
import { commentOf, locationOf } from "./check-tree-trees.ts"
import { common, ignored, withPreheader } from "./statement-tree-built.ts"
import { readChildFields } from "./spec-field-tables.ts"
import {
  arrow,
  buildWardley,
  declaration,
  decoration,
  evolutionStatement,
  evolve,
  link,
  offset,
  pipeline,
  pipelineChild,
  positioned,
  size,
  stage,
} from "./wardley-built.ts"
import type { Gaps } from "./wardley-built.ts"

/** Each supplied field owns the next complete native occurrence in the fixed input. */
function gaps(kit: Kit, ...fields: string[]): Gaps {
  return Object.fromEntries(
    fields.map((field) => [
      field,
      () => [ignored(kit, "Wardley", "%%{!}%%", "directive")],
    ]),
  )
}

/** One fixed corpus input places forms at every applicable authored component gap. */
function allFields(): Built {
  const source = readFileSync(
    path.join(getFixturesRoot(), "wardley/hidden-all-unit-gaps/input.mmd"),
    "utf8",
  )
  return buildWardley(source, (k) => {
    /** Each coordinate pair has the same four explicitly owned native occurrences. */
    function pair(): Gaps {
      return gaps(
        k,
        "textBeforeVisibility",
        "textBeforeComma",
        "textBeforeEvolution",
        "textBeforeClose",
      )
    }

    return [
      size(
        k,
        "1",
        "2",
        gaps(
          k,
          "textBeforeOpen",
          "textBeforeWidth",
          "textBeforeComma",
          "textBeforeHeight",
          "textBeforeClose",
        ),
      ),
      evolutionStatement(k, [
        () =>
          stage(k, "G", {
            boundary: "0.2",
            secondName: "C",
            gaps: gaps(
              k,
              "textBefore",
              "textBeforeBoundaryMark",
              "textBeforeBoundary",
              "textBeforeSecondNameMark",
              "textBeforeSecondName",
              "textAfter",
            ),
          }),
        () => stage(k, "P", { gaps: gaps(k, "textBefore") }),
      ]),
      declaration(k, "anchor", "U", "0.1", "0.2", {
        gaps: gaps(k, "textBeforeName", "textBeforeCoordinates"),
        coordinateGaps: pair(),
      }),
      declaration(k, "component", "A", "0.1", "0.2", {
        gaps: gaps(k, "textBeforeName", "textBeforeCoordinates"),
        coordinateGaps: pair(),
        decorations: () => [
          offset(
            k,
            "-1",
            "2",
            gaps(
              k,
              "textBefore",
              "textBeforeOpen",
              "textBeforeX",
              "textAfterXSign",
              "textBeforeComma",
              "textBeforeY",
              "textBeforeClose",
            ),
          ),
          decoration(
            k,
            "build",
            gaps(k, "textBefore", "textBeforeValue", "textBeforeClose"),
          ),
          decoration(
            k,
            "(inertia)",
            gaps(k, "textBefore", "textBeforeInertia", "textBeforeClose"),
          ),
        ],
      }),
      link(k, "A", "U", {
        fromPort: "+>",
        toPort: "+<",
        arrow: () => arrow(k, "->"),
        label: " L",
        gaps: gaps(
          k,
          "textBeforeFromPort",
          "textBeforeArrow",
          "textBeforeTo",
          "textBeforeToPort",
          "textBeforeLabel",
        ),
      }),
      evolve(k, "A", "0.8", gaps(k, "textBeforeComponent", "textBeforeTarget")),
      pipeline(
        k,
        "A",
        () => [
          pipelineChild(k, "X", "0.3", {
            gaps: gaps(
              k,
              "textBeforeName",
              "textBeforeOpen",
              "textBeforeEvolution",
              "textBeforeClose",
            ),
            offset: () =>
              offset(
                k,
                "1",
                "-2",
                gaps(
                  k,
                  "textBefore",
                  "textBeforeOpen",
                  "textBeforeX",
                  "textBeforeComma",
                  "textBeforeY",
                  "textAfterYSign",
                  "textBeforeClose",
                ),
              ),
          }),
        ],
        gaps(k, "textBeforeParent", "textBeforeBody"),
      ),
      positioned(
        k,
        "note",
        "0.1",
        "0.2",
        '"N"',
        "1",
        gaps(k, "textBeforeText", "textBeforeCoordinates"),
        pair(),
      ),
      positioned(
        k,
        "annotations",
        "1",
        "2",
        undefined,
        "1",
        gaps(k, "textBeforeCoordinates"),
        pair(),
      ),
      positioned(
        k,
        "annotation",
        "1",
        "2",
        '"N"',
        "1",
        gaps(
          k,
          "textBeforeNumber",
          "textBeforeComma",
          "textBeforeCoordinates",
          "textBeforeText",
        ),
        pair(),
      ),
      declaration(k, "accelerator", "X", "0.1", "0.2", {
        gaps: gaps(k, "textBeforeName", "textBeforeCoordinates"),
        coordinateGaps: pair(),
      }),
      declaration(k, "deaccelerator", "Y", "0.1", "0.2", {
        gaps: gaps(k, "textBeforeName", "textBeforeCoordinates"),
        coordinateGaps: pair(),
      }),
    ]
  })
}

/** A reusable suffix case keeps the following statement explicit. */
function suffix(
  source: string,
  raw: string,
  kind: "yaml-block" | "directive",
  second = true,
): Built {
  return buildWardley(source, (k) => [
    declaration(k, "component", "A", "0.1", "0.2", {
      gaps: { textAfter: () => [ignored(k, "Wardley", raw, kind)] },
    }),
    ...(second ? [declaration(k, "component", "B", "0.3", "0.4")] : []),
  ])
}

describe("Wardley authored tree conditions", () => {
  it("registers every child field in the specification's visitor order", () => {
    const fields = readChildFields()
    for (const [type, children] of Object.entries(WARDLEY_CHILD_TYPES))
      expect(Object.keys(children), type).toEqual(fields.get(type))
  })
  it("accepts every named native component gap", () => {
    const { source, tree } = allFields()
    expect(checkTree(source, tree)).toEqual([])
  })

  const ownership = Object.entries(WARDLEY_CHILD_TYPES).flatMap(
    ([type, fields]) =>
      Object.entries(fields)
        .filter(([, allowed]) => allowed.includes("WardleyIgnoredText"))
        .map(([field]) => ({ type, field })),
  )
  for (const { type, field } of ownership) {
    const candidate = nodesOf(allFields().tree).find(
      (node) =>
        node.type === type &&
        Array.isArray(node[field]) &&
        node[field].length > 0,
    )
    if (candidate === undefined) continue
    it(`rejects a lost native match in ${type}.${field}`, () => {
      const { source, tree } = allFields()
      const node = nodesOf(tree).find(
        (item) =>
          item.type === type &&
          Array.isArray(item[field]) &&
          item[field].length > 0,
      )
      if (node === undefined) throw new Error(`missing ${type}.${field}`)
      setField(node, field, [])
      expect(checkTree(source, tree).length).toBeGreaterThan(0)
    })
  }
  it("rejects duplicated ownership and a match moved from a component gap into body", () => {
    const built = allFields()
    const component = nodeWith(built.tree, "WardleyComponentStatement")
    const hidden = (component.textBeforeName as CheckedNode[])[0]
    setField(component, "textBeforeCoordinates", [
      hidden,
      ...(component.textBeforeCoordinates as CheckedNode[]),
    ])
    expect(checkTree(built.source, built.tree).length).toBeGreaterThan(0)
    const moved = allFields()
    const owner = nodeWith(moved.tree, "WardleyComponentStatement")
    const form = (owner.textBeforeName as CheckedNode[])[0]
    setField(owner, "textBeforeName", [])
    setField(moved.tree.body, "body", [
      ...(moved.tree.body.body as CheckedNode[]),
      form,
    ])
    expect(checkTree(moved.source, moved.tree).length).toBeGreaterThan(0)
  })

  it.each([
    {
      source: "wardley-betacomponent A[0.1,0.2]",
      make: (k: Kit) => [declaration(k, "component", "A", "0.1", "0.2")],
    },
    {
      source: "wardley-beta\ncomponent _x[0.1,0.2]",
      make: (k: Kit) => [
        declaration(k, "component", "_x", "0.1", "0.2", {
          nameKind: "Identifier",
        }),
      ],
    },
    {
      source: "wardley-beta\ncomponent My builder[0.1,0.2]",
      make: (k: Kit) => [
        declaration(k, "component", "My builder", "0.1", "0.2"),
      ],
    },
    {
      source:
        "wardley-beta\ncomponent A[101.0,0.2]\npipeline Missing {\ncomponent X[200.0]\n}\nevolve A 200.0",
      make: (k: Kit) => [
        declaration(k, "component", "A", "101.0", "0.2"),
        pipeline(k, "Missing", () => [pipelineChild(k, "X", "200.0")]),
        evolve(k, "A", "200.0"),
      ],
    },
    {
      source: "wardley-beta\nA +'x<-.->y'> B; fallback",
      make: (k: Kit) => [
        link(k, "A", "B", {
          arrow: () => arrow(k, ">", "'x<-.->y'"),
          label: " fallback",
        }),
      ],
    },
    {
      source: "wardley-beta\nA +'a\\\n%%{!}%%'> B",
      make: (k: Kit) => [
        link(k, "A", "B", { arrow: () => arrow(k, ">", "'a\\\n%%{!}%%'") }),
      ],
    },
    {
      source: 'wardley-beta\nnote "%%{!}%%---"[0.1,0.2]',
      make: (k: Kit) => [positioned(k, "note", "0.1", "0.2", '"%%{!}%%---"')],
    },
    {
      source: "wardley-beta\naccDescr { ---\nx\n---\n%%\n}",
      make: (k: Kit) => [
        common(k, "Wardley", "AccDescrBlock", "---\nx\n---\n%%"),
      ],
    },
    {
      source:
        "wardley-beta\ntitle\ntitle  \naccTitle:\naccDescr: \naccDescr { }",
      make: (k: Kit) => [
        common(k, "Wardley", "Title", null),
        common(k, "Wardley", "Title", " "),
        common(k, "Wardley", "AccTitle", null),
        common(k, "Wardley", "AccDescr", " "),
        common(k, "Wardley", "AccDescrBlock", null),
      ],
    },
    {
      source: "wardley-beta\ncomponent A[0.1,0.2] inertia",
      make: (k: Kit) => [
        declaration(k, "component", "A", "0.1", "0.2", {
          decorations: () => [decoration(k, "inertia")],
        }),
      ],
    },
  ])("accepts authored control $source", ({ source, make }) => {
    const built = buildWardley(source, make)
    expect(checkTree(source, built.tree)).toEqual([])
  })

  it.each([
    {
      source: "wardley-beta\ncomponent builder[0.1,0.2]",
      raw: "builder",
      visibility: "0.1",
      kind: "RawText",
    },
    {
      source: "wardley-beta\ncomponent 9a[0.1,0.2]",
      raw: "9a",
      visibility: "0.1",
      kind: "Identifier",
    },
    {
      source: "wardley-beta\ncomponent title A[0.1,0.2]",
      raw: "title A",
      visibility: "0.1",
      kind: "RawText",
    },
    {
      source: "wardley-beta\ncomponent A[1,0.2]",
      raw: "A",
      visibility: "1",
      kind: "RawText",
    },
    {
      source: "wardley-beta\ncomponent A[01,0.2]",
      raw: "A",
      visibility: "01",
      kind: "RawText",
    },
    {
      source: "wardley-beta\ncomponent A[.1,0.2]",
      raw: "A",
      visibility: ".1",
      kind: "RawText",
    },
    {
      source: "wardley-beta\ncomponent A[0.1e0,0.2]",
      raw: "A",
      visibility: "0.1e0",
      kind: "RawText",
    },
  ])(
    "rejects a leaf that is not a complete first-match unit: $source",
    ({ source, raw, visibility, kind }) => {
      const { tree } = buildWardley(source, (k) => [
        declaration(k, "component", raw, visibility, "0.2", { nameKind: kind }),
      ])
      expect(JSON.stringify(checkTree(source, tree))).toContain("complete")
    },
  )

  it.each([
    ["kind", "dependency"],
    ["line", "dotted"],
    ["startMarker", "arrow"],
    ["endMarker", "none"],
    ["value", "+'x'<"],
  ])(
    "rejects the arrow field %s disagreeing with its written value",
    (field, value) => {
      const { source, tree } = buildWardley("wardley-beta\nA +'x'> B", (k) => [
        link(k, "A", "B", { arrow: () => arrow(k, ">", "'x'") }),
      ])
      expect(checkTree(source, tree)).toEqual([])
      setField(nodeWith(tree, "WardleyArrow"), field, value)
      expect(checkTree(source, tree).length).toBeGreaterThan(0)
    },
  )
  it("rejects a port flag and an offset sign disagreeing with their authored glyphs", () => {
    const built = buildWardley(
      "wardley-beta\nA +> B\ncomponent A[0.1,0.2] label[-0,1]",
      (k) => [
        link(k, "A", "B", { fromPort: "+>" }),
        declaration(k, "component", "A", "0.1", "0.2", {
          decorations: () => [offset(k, "-0", "1")],
        }),
      ],
    )
    expect(checkTree(built.source, built.tree)).toEqual([])
    setField(
      nodeWith(built.tree, "WardleyLinkStatement"),
      "fromPort",
      "backward",
    )
    setField(
      nodeWith(built.tree, "WardleyLabelOffsetDecoration"),
      "negativeX",
      false,
    )
    expect(checkTree(built.source, built.tree).length).toBeGreaterThan(0)
  })
  it("rejects two inertia forms and a strategy after inertia", () => {
    const source =
      "wardley-beta\ncomponent A[0.1,0.2] inertia (build) (inertia)"
    const { tree } = buildWardley(source, (k) => [
      declaration(k, "component", "A", "0.1", "0.2", {
        decorations: () => [
          decoration(k, "inertia"),
          decoration(k, "build"),
          decoration(k, "(inertia)"),
        ],
      }),
    ])
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "decorations must",
    )
  })

  it.each([
    {
      source:
        "wardley-beta\ncomponent A[0.1,0.2]%%{!}%%\n\ncomponent B[0.3,0.4]",
      raw: "%%{!}%%",
      kind: "directive",
    },
    {
      source:
        "wardley-beta\ncomponent A[0.1,0.2]%%{!}%% \ncomponent B[0.3,0.4]",
      raw: "%%{!}%%",
      kind: "directive",
    },
    {
      source:
        "wardley-beta\ncomponent A[0.1,0.2]---\nx\n---\n\ncomponent B[0.3,0.4]",
      raw: "---\nx\n---",
      kind: "yaml-block",
    },
  ] as const)("accepts surviving EOL $source", ({ source, raw, kind }) => {
    const built = suffix(source, raw, kind)
    expect(checkTree(source, built.tree)).toEqual([])
  })
  it.each([
    {
      source: "wardley-beta\ncomponent A[0.1,0.2]%%{!}%%",
      raw: "%%{!}%%",
      kind: "directive",
    },
    {
      source: "wardley-beta\ncomponent A[0.1,0.2]---\nx\n---",
      raw: "---\nx\n---",
      kind: "yaml-block",
    },
  ] as const)(
    "accepts appended-LF and EOF control $kind",
    ({ source, raw, kind }) => {
      const built = suffix(source, raw, kind, false)
      expect(checkTree(source, built.tree)).toEqual([])
    },
  )
  it("rejects a sole LF consumed by a statement suffix", () => {
    const source =
      "wardley-beta\ncomponent A[0.1,0.2]%%{!}%%\ncomponent B[0.3,0.4]"
    const built = suffix(source, "%%{!}%%", "directive")
    expect(JSON.stringify(checkTree(source, built.tree))).toContain(
      "requires visible EOL",
    )
  })
  it("leaves a form after visible EOL in body rather than the earlier suffix", () => {
    const source = "wardley-beta\ncomponent A[0.1,0.2]\n%%{!}%%"
    const valid = buildWardley(source, (k) => [
      declaration(k, "component", "A", "0.1", "0.2"),
      ignored(k, "Wardley", "%%{!}%%", "directive"),
    ])
    expect(checkTree(source, valid.tree)).toEqual([])
    const wrong = suffix(source, "%%{!}%%", "directive", false)
    expect(JSON.stringify(checkTree(source, wrong.tree))).toContain(
      "hidden ASCII whitespace",
    )
  })

  it.each([
    {
      source: "wardley-beta\n---\n---\n---",
      forms: ["---\n---\n---"],
      kind: "yaml-block",
    },
    {
      source: "wardley-beta\n---\na\n---\n---\nb\n---",
      forms: ["---\na\n---", "---\nb\n---"],
      kind: "yaml-block",
    },
    {
      source: "wardley-beta\n%%{!}%%x}%%",
      forms: ["%%{!}%%x}%%"],
      kind: "directive",
    },
    {
      source: "wardley-beta\n%%{!}%% %%{?}%%",
      forms: ["%%{!}%%", "%%{?}%%"],
      kind: "directive",
    },
  ] as const)(
    "uses the first qualifying alternative and closer $source",
    ({ source, forms, kind }) => {
      const built = buildWardley(source, (k) =>
        forms.map((raw) => ignored(k, "Wardley", raw, kind)),
      )
      expect(checkTree(source, built.tree)).toEqual([])
    },
  )
  it.each([
    {
      source: "wardley-beta\n---\na\n---\n---\nb\n---",
      raw: "---\na\n---\n---\nb\n---",
      kind: "yaml-block",
    },
    {
      source: "wardley-beta\n%%{!}%% %%{?}%%",
      raw: "%%{!}%% %%{?}%%",
      kind: "directive",
    },
    { source: "wardley-beta\n%%{!}%%\n", raw: "%%{!}%%\n", kind: "directive" },
  ] as const)(
    "rejects a later closer or included consumed LF: $source",
    ({ source, raw, kind }) => {
      const built = buildWardley(source, (k) => [
        ignored(k, "Wardley", raw, kind),
      ])
      expect(JSON.stringify(checkTree(source, built.tree))).toContain(
        "one complete hidden",
      )
    },
  )
  it("rejects adjacent empty YAML despite a qualifying body-present match", () => {
    const source = "wardley-beta\n---\n---\n---"
    const { tree } = buildWardley(source, (k) => [
      ignored(k, "Wardley", "---\n---\n---", "yaml-block"),
    ])
    const node = nodeWith(tree, "WardleyIgnoredText")
    const end = source.indexOf("\n---", 15) + 4
    setField(node, "range", [node.range[0], end])
    setField(node, "loc", locationOf(source, [node.range[0], end]))
    setField(node, "value", "---\n---")
    expect(JSON.stringify(checkTree(source, tree))).toContain(
      "one complete hidden",
    )
  })

  it.each([
    {
      source: "wardley-beta\npipeline A{%%{!}%%\n\ncomponent X[0.1]\n}",
      valid: true,
    },
    {
      source: "wardley-beta\npipeline A{%%{!}%%\ncomponent X[0.1]\n}",
      valid: false,
    },
  ])(
    "checks visible LF after a pipeline opener: $source",
    ({ source, valid }) => {
      const built = buildWardley(source, (k) => [
        pipeline(
          k,
          "A",
          () => [pipelineChild(k, "X", "0.1")],
          gaps(k, "textAfterOpen"),
        ),
      ])
      if (valid) expect(checkTree(source, built.tree)).toEqual([])
      else
        expect(JSON.stringify(checkTree(source, built.tree))).toContain(
          "opener requires",
        )
    },
  )
  it("checks child EOL and does not take a consumed hidden LF as that EOL", () => {
    const source = "wardley-beta\npipeline A{\ncomponent X[0.1]%%{!}%%\n}"
    const built = buildWardley(source, (k) => [
      pipeline(k, "A", () => [
        pipelineChild(k, "X", "0.1", { gaps: gaps(k, "textAfter") }),
      ]),
    ])
    expect(JSON.stringify(checkTree(source, built.tree))).toContain(
      "requires visible EOL",
    )
  })
  it("checks the last evolution stage's consumed LF at statement end", () => {
    const source = "wardley-beta\nevolution A -> B%%{!}%%\ncomponent C[0.1,0.2]"
    const built = buildWardley(source, (k) => [
      evolutionStatement(k, [
        () => stage(k, "A"),
        () => stage(k, "B", { gaps: gaps(k, "textAfter") }),
      ]),
      declaration(k, "component", "C", "0.1", "0.2"),
    ])
    expect(JSON.stringify(checkTree(source, built.tree))).toContain(
      "requires visible EOL",
    )
  })

  it("rejects a hidden directive disguised as a native Comment", () => {
    const source = "wardley-beta\n%%{!}%%"
    const built = buildWardley(source, (k) => {
      k.comment("%%", "%%{!}%%")
      return []
    })
    expect(JSON.stringify(checkTree(source, built.tree))).toContain(
      "earlier hidden DIRECTIVE",
    )
  })
  it.each([
    {
      source: 'wardley-beta\nnote "%%{!}%%"[0.1,0.2]',
      make: (k: Kit) => [positioned(k, "note", "0.1", "0.2", '"%%{!}%%"')],
    },
    {
      source: "wardley-beta\nA +'%%{!}%%'> B",
      make: (k: Kit) => [
        link(k, "A", "B", { arrow: () => arrow(k, ">", "'%%{!}%%'") }),
      ],
    },
    {
      source: "wardley-beta\nA -> B; %%{!}%%",
      make: (k: Kit) => [
        link(k, "A", "B", { arrow: () => arrow(k, "->"), label: " %%{!}%%" }),
      ],
    },
  ])(
    "does not read native Comments inside an earlier value: $source",
    ({ source, make }) => {
      const built = buildWardley(source, make)
      expect(checkTree(source, built.tree)).toEqual([])
      setField(built.tree, "comments", [commentOf(source, "%%", "%%{!}%%")])
      expect(JSON.stringify(checkTree(source, built.tree))).toContain(
        "native Comment cannot",
      )
    },
  )

  for (const row of [
    {
      source: "%% c\n---\nx\n---\n%%\n\u00a0wardley-beta",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n%%\n\u2028wardley-beta",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
      comments: ["%% c", "%%"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n\u2029%%{\n%% gap\nwrap}%%\nwardley-beta",
      parts: [
        ["---\nx\n---", "yaml-block"],
        ["%%{\n%% gap\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]],
      ],
      comments: ["%% c", "%%", "%% gap"],
    },
    {
      source: "%% c\n---\nx\n---\n%%\n \twardley-beta",
      parts: [["---\nx\n---", "yaml-block"]],
      comments: ["%% c", "%%"],
    },
  ] as const)
    it(`passes pre-header detection trivia ${JSON.stringify(row.source)}`, () => {
      const built = withPreheader(
        buildWardley(row.source, () => []),
        "Wardley",
        row.parts,
        row.comments,
      )
      expect(checkTree(built.source, built.tree)).toEqual([])
    })
  for (const row of [
    {
      source: "%% c\n---\nx\n---\n\u2028wardley-beta",
      parts: [["---\nx\n---", "yaml-block"]],
    },
    {
      source: "%%{\n%% c\nwrap}%%\n\u00a0wardley-beta",
      parts: [["%%{\n%% c\nwrap}%%", "directive", ["%%{\n", "wrap}%%"]]],
    },
  ] as const)
    it(`keeps a native prefix gap strict without a passed line ${JSON.stringify(row.source)}`, () => {
      const built = withPreheader(
        buildWardley(row.source, () => []),
        "Wardley",
        row.parts,
        ["%% c"],
      )
      expect(JSON.stringify(checkTree(built.source, built.tree))).toContain(
        "ASCII whitespace and LF",
      )
    })
  it("keeps body Unicode gaps strict after a bare Comment", () => {
    const source = "wardley-beta\n%%\n\u2028component A[0.1,0.2]"
    const built = buildWardley(source, (k) => {
      k.comment("%%", "%%")
      return [declaration(k, "component", "A", "0.1", "0.2")]
    })
    expect(JSON.stringify(checkTree(source, built.tree))).toContain(
      "ASCII whitespace and LF",
    )
  })
  it("checks the exact lowercase header", () => {
    const built = buildTree(
      {
        header: "WARDLEY-BETA",
        diagramType: "wardley",
        bodyType: "WardleyDiagram",
        bodyFields: (body) => ({ textBeforeHeader: [], body }),
      },
      "WARDLEY-BETA",
      () => [],
    )
    expect(JSON.stringify(checkTree(built.source, built.tree))).toContain(
      "written header",
    )
  })
  it("rejects a mutated written name through the shared value check", () => {
    const built = allFields()
    const tree = copyOf(built.tree)
    setField(nodeWith(tree, "WardleyIdentifier"), "name", "changed")
    expect(JSON.stringify(checkTree(built.source, tree))).toContain(
      "name is not its written text",
    )
  })

  it("rejects a semicolon label shortened to disguise its remainder as a Comment", () => {
    const source = "wardley-beta\nA -> B; label %%{!}%%"
    const built = buildWardley(source, (k) => [
      link(k, "A", "B", { arrow: () => arrow(k, "->"), label: " label" }),
    ])
    setField(built.tree, "comments", [commentOf(source, "%%", "%%{!}%%")])
    expect(JSON.stringify(checkTree(source, built.tree))).toContain(
      "complete physical-line value",
    )
  })
})
