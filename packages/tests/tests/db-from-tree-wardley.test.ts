import { describe, expect, it } from "vitest"
import { dbFromTree } from "../src/db-from-tree/index.ts"
import type { DbTreeRoot } from "../src/db-from-tree/index.ts"
import type { CheckedNode, CheckedRoot } from "../src/check-tree/types.ts"
import {
  cssSupportsColor,
  embeddedValuesOf,
  loadFixture,
} from "../src/index.ts"
import type { Kit } from "./check-tree-built.ts"
import { setField } from "./check-tree-recorded.ts"
import { frontmatterOf } from "./check-tree-trees.ts"
import { common } from "./statement-tree-built.ts"
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

/** Fixed hand-built trees are compared with the fixture's actual or specified Db. */
interface Case {
  readonly name: string
  readonly make: (kit: Kit) => CheckedNode[]
  readonly prepare?: (source: string, tree: CheckedRoot) => void
}

/** Mark real frontmatter for the shared converted-text path; it is not a native form. */
function realFrontmatter(source: string, tree: CheckedRoot): void {
  const end = source.indexOf("\n---", 4) + 4
  const contentEnd = end - 4
  const start = 4
  setField(
    tree,
    "frontmatter",
    frontmatterOf(source, source.slice(0, end), [start, contentEnd]),
  )
}

const CASES: readonly Case[] = [
  { name: "header-only", make: () => [] },
  {
    name: "db-all-fields",
    make: (k) => [
      common(k, "Wardley", "Title", "T"),
      common(k, "Wardley", "AccTitle", " A"),
      common(k, "Wardley", "AccDescrBlock", "D\n E"),
      size(k, "900", "600"),
      evolutionStatement(k, [
        () => stage(k, '" G "', { boundary: "0.3", secondName: "C" }),
        () => stage(k, "P", { boundary: "1.0" }),
      ]),
      declaration(k, "anchor", "User", "0.9", "0.8"),
      declaration(k, "component", "A", "0.4", "0.5", {
        decorations: () => [
          offset(k, "-0", "-2"),
          decoration(k, "build"),
          decoration(k, "inertia"),
        ],
      }),
      declaration(k, "component", "B", "20.0", "30.0"),
      pipeline(k, "A", () => [pipelineChild(k, "Child", "0.6")]),
      link(k, "User", "Child", {
        arrow: () => arrow(k, "->"),
        label: " label",
      }),
      evolve(k, "A", "0.9"),
      positioned(k, "annotations", "10", "20"),
      positioned(k, "annotation", "30", "40", '"Text"'),
      positioned(k, "note", "0.1", "0.2", '"N"'),
      declaration(k, "accelerator", "X", "0.2", "0.3"),
      declaration(k, "deaccelerator", "Y", "0.3", "0.4"),
    ],
  },
  {
    name: "db-publication-order",
    make: (k) => [
      declaration(k, "component", "A", "0.2", "0.3"),
      declaration(k, "anchor", "B", "0.8", "0.9"),
      evolve(k, "A", "0.8"),
      link(k, "A", "C", { arrow: () => arrow(k, "->") }),
      pipeline(k, "A", () => [pipelineChild(k, "C", "0.6")]),
      declaration(k, "anchor", "A", "0.1", "0.1"),
    ],
  },
  {
    name: "db-node-duplicates",
    make: (k) => [
      declaration(k, "component", "A", "0.1", "0.2", {
        decorations: () => [
          offset(k, "-10", "20"),
          decoration(k, "build"),
          decoration(k, "inertia"),
        ],
      }),
      declaration(k, "component", "B", "0.2", "0.3"),
      declaration(k, "component", "A", "0.3", "0.4", {
        decorations: () => [offset(k, "1", "2")],
      }),
      declaration(k, "component", "A", "0.5", "0.6"),
      link(k, "A", "B", { arrow: () => arrow(k, "->") }),
    ],
  },
  {
    name: "db-pipeline-collision",
    make: (k) => [
      declaration(k, "component", "P", "0.1", "0.2"),
      declaration(k, "component", "P_X", "0.3", "0.4", {
        decorations: () => [decoration(k, "buy"), decoration(k, "inertia")],
      }),
      pipeline(k, "P", () => [pipelineChild(k, "X", "0.5")]),
      link(k, "P_X", "P", { arrow: () => arrow(k, "->") }),
    ],
  },
  {
    name: "db-pipeline-duplicates",
    make: (k) => [
      declaration(k, "component", "P", "0.1", "0.2"),
      declaration(k, "component", "Q", "0.3", "0.4"),
      pipeline(k, "P", () => [pipelineChild(k, "A", "0.2")]),
      pipeline(k, "Q", () => [pipelineChild(k, "B", "0.3")]),
      pipeline(k, "P", () => [pipelineChild(k, "C", "0.4")]),
      pipeline(k, "P", () => [
        pipelineChild(k, "D", "0.5"),
        pipelineChild(k, "D", "0.6", { offset: () => offset(k, "-2", "3") }),
      ]),
    ],
  },
  {
    name: "db-pipeline-label-inheritance",
    make: (k) => [
      declaration(k, "component", "P", "0.1", "0.2"),
      pipeline(k, "P", () => [
        pipelineChild(k, "X", "0.3", { offset: () => offset(k, "-3", "4") }),
        pipelineChild(k, "Y", "0.4"),
        pipelineChild(k, "X", "0.5"),
      ]),
    ],
  },
  {
    name: "db-pipeline-nested-parent",
    make: (k) => [
      declaration(k, "component", "P", "0.1", "0.2"),
      pipeline(k, "P", () => [pipelineChild(k, "X", "0.3")]),
      pipeline(k, "P_X", () => [pipelineChild(k, "Y", "0.4")]),
      evolve(k, "P_X_Y", "0.9"),
    ],
  },
  {
    name: "db-link-resolution",
    make: (k) => [
      declaration(k, "component", "P", "0.1", "0.2"),
      declaration(k, "component", "Q", "0.3", "0.4"),
      pipeline(k, "P", () => [pipelineChild(k, "X", "0.5")]),
      pipeline(k, "Q", () => [pipelineChild(k, "X", "0.6")]),
      link(k, "X", "P_X", { arrow: () => arrow(k, "->") }),
      link(k, "P_X", "Q", { arrow: () => arrow(k, "->") }),
      evolve(k, "X", "0.9"),
    ],
  },
  {
    name: "db-link-forms",
    make: (k) => [
      link(k, '"A"', '"B"'),
      link(k, "A", "B", { arrow: () => arrow(k, "->") }),
      link(k, "A", "B", { arrow: () => arrow(k, "-->") }),
      link(k, "A", "B", { arrow: () => arrow(k, "-.->") }),
      link(k, "A", "B", { arrow: () => arrow(k, ">") }),
      link(k, "A", "B", { fromPort: "+>" }),
      link(k, "A", "B", { fromPort: "+<" }),
      link(k, "A", "B", { fromPort: "+<>" }),
      link(k, "A", "B", {
        fromPort: "+>",
        arrow: () => arrow(k, "->"),
        toPort: "+<",
      }),
      link(k, "A", "B", {
        arrow: () => arrow(k, "<>", "'flow'"),
        label: " annotation",
      }),
      link(k, "A", "B", {
        arrow: () => arrow(k, ">", "''"),
        label: " fallback",
      }),
      link(k, "A", "B", { arrow: () => arrow(k, "->"), toPort: "+<" }),
    ],
  },
  {
    name: "lex-flow-label-changes-direction",
    make: (k) => [link(k, "A", "B", { arrow: () => arrow(k, ">", "'x<y'") })],
  },
  {
    name: "lex-flow-label-changes-bidirectional",
    make: (k) => [link(k, "A", "B", { arrow: () => arrow(k, "<", "'x<>y'") })],
  },
  {
    name: "lex-flow-label-changes-dashed",
    make: (k) => [
      link(k, "A", "B", { arrow: () => arrow(k, ">", "'x-.->y'") }),
    ],
  },
  {
    name: "lex-flow-label-changes-dashed-short",
    make: (k) => [link(k, "A", "B", { arrow: () => arrow(k, ">", "'x.-.y'") })],
  },
  {
    name: "lex-link-flow-raw-escapes",
    make: (k) => [
      link(k, "A", "B", { arrow: () => arrow(k, ">", "'a\\n\\q'") }),
    ],
  },
  {
    name: "db-coordinate-double-one",
    make: (k) => [
      declaration(
        k,
        "component",
        "A",
        "1.00000000000000001",
        "1.0000000000000002",
      ),
    ],
  },
  {
    name: "db-coordinate-double-hundred",
    make: (k) => [
      declaration(k, "component", "A", "100.000000000000001", "0.5"),
    ],
  },
  {
    name: "db-coordinate-rounding",
    make: (k) => [
      declaration(
        k,
        "component",
        "A",
        "0.12345678901234567890123456789",
        "0.3333333333333333333333",
      ),
    ],
  },
  {
    name: "db-trend-duplicates",
    make: (k) => [
      declaration(k, "component", "A", "0.1", "0.2"),
      declaration(k, "component", "B", "0.3", "0.4"),
      evolve(k, "A", "0.5"),
      evolve(k, "B", "0.6"),
      evolve(k, "A", "0.7"),
      evolve(k, "A", "0.8"),
    ],
  },
  {
    name: "db-stages-boundaries",
    make: (k) => [
      evolutionStatement(k, [
        () => stage(k, '" G "', { boundary: "1.2", secondName: '" C "' }),
        () => stage(k, '" "', { boundary: "0.0" }),
        () => stage(k, "P", { boundary: "0.4" }),
        () => stage(k, "P"),
      ]),
    ],
  },
  {
    name: "db-singletons-last",
    make: (k) => [
      size(k, "1", "2"),
      size(k, "3", "4"),
      size(k, "5", "6"),
      evolutionStatement(k, [
        () => stage(k, "A", { boundary: "0.1" }),
        () => stage(k, "B", { boundary: "0.2" }),
      ]),
      evolutionStatement(k, [() => stage(k, "C"), () => stage(k, "D")]),
      evolutionStatement(k, [
        () => stage(k, "E", { boundary: "0.8" }),
        () => stage(k, "F"),
      ]),
      positioned(k, "annotations", "1", "2"),
      positioned(k, "annotations", "3", "4"),
      positioned(k, "annotations", "5", "6"),
    ],
  },
  {
    name: "common-repeat-empty",
    make: (k) => [
      common(k, "Wardley", "Title", "One"),
      common(k, "Wardley", "AccTitle", " A"),
      common(k, "Wardley", "AccDescr", " D"),
      common(k, "Wardley", "Title", null),
      common(k, "Wardley", "AccTitle", " "),
      common(k, "Wardley", "AccDescrBlock", null),
    ],
  },
  {
    name: "frontmatter-empty-body-title",
    make: (k) => [
      common(k, "Wardley", "Title", "Body"),
      common(k, "Wardley", "Title", null),
    ],
    prepare: realFrontmatter,
  },
  {
    name: "lex-string-conversion",
    make: (k) => [
      declaration(k, "component", '"a\\n\\r\\t\\q\\u0041"', "0.1", "0.2"),
      declaration(k, "anchor", "'b\\n\\q'", "0.2", "0.3"),
      positioned(k, "note", "0.3", "0.4", '"c\\t\\q"'),
      evolutionStatement(k, [
        () => stage(k, '"d\\n\\q"'),
        () => stage(k, "'e\\t\\q'"),
      ]),
      positioned(k, "annotation", "1", "2", '"f\\q"'),
      declaration(k, "accelerator", '"g\\q"', "0.4", "0.5"),
      declaration(k, "deaccelerator", "'h\\q'", "0.5", "0.6"),
    ],
  },
  {
    name: "db-empty-texts",
    make: (k) => [
      declaration(k, "anchor", '""', "0.1", "0.2"),
      declaration(k, "component", '""', "0.3", "0.4"),
      positioned(k, "note", "0.5", "0.6", '""'),
      positioned(k, "annotation", "0", "0", '""', "0"),
      declaration(k, "accelerator", '""', "0.7", "0.8"),
      declaration(k, "deaccelerator", '""', "0.8", "0.9"),
      link(k, '""', '""', { arrow: () => arrow(k, "->"), label: "   " }),
      evolve(k, '""', "0.9"),
    ],
  },
  {
    name: "config-security-level-other",
    make: (k) => [
      common(k, "Wardley", "Title", "T<b>=x"),
      common(k, "Wardley", "AccTitle", " A<b>=x"),
      common(k, "Wardley", "AccDescr", " D<br>=x"),
      declaration(k, "component", '"C<b>=x"', "0.1", "0.2"),
      positioned(k, "note", "0.2", "0.3", '"N<br>=x"'),
    ],
  },
  {
    name: "div-html-frontmatter-value",
    make: (k) => [common(k, "Wardley", "AccTitle", ' b="c">d')],
    prepare: realFrontmatter,
  },
]

describe("Wardley Db from hand-built trees", () => {
  it.each(CASES)(
    "matches the recorded reading of $name",
    async ({ name, make, prepare }) => {
      const fixture = await loadFixture("wardley", name)
      const result = fixture.specified ?? fixture.expected
      expect(result.accepted).toBe(true)
      if (!result.accepted) throw new Error(`rejecting reading ${name}`)
      const embedded = embeddedValuesOf(fixture, result)
      if (embedded === undefined)
        throw new Error(`missing embedded reading ${name}`)
      const { tree } = buildWardley(fixture.input, make)
      prepare?.(fixture.input, tree)
      expect(
        dbFromTree(
          fixture.input,
          tree as unknown as DbTreeRoot,
          embedded,
          cssSupportsColor,
        ),
      ).toEqual(result.db)
    },
  )
})
