import { execFileSync } from "node:child_process"
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
import { getFixturesRoot } from "../src/index.ts"
import {
  COVERAGE_TABLE,
  coverageOf,
  isRead,
  readCoverageTable,
} from "../../../tools/src/coverage-table.ts"
import type { CoverageRow } from "../../../tools/src/coverage-table.ts"
import {
  citationsIn,
  withoutCitations,
} from "../../../tools/src/fixture-citations.ts"
import {
  LinkedSections,
  blocksOf,
  keyTextOf,
  sectionsOf,
  tokenKindsOf,
} from "../../../tools/src/recorded-tree-documents.ts"
import type {
  BlockVocabulary,
  DocumentBlock,
  DocumentReader,
} from "../../../tools/src/recorded-tree-documents.ts"
import {
  ANSWERS,
  answersOf,
  changeSince,
  changedItemsOf,
  changedRecordsOf,
  checkRecordedTrees,
  citationsOf,
  documentBlocksOf,
  everyTreeReasonFrom,
  placesOf,
} from "../../../tools/src/recorded-trees.ts"
import {
  failsOf,
  formatReport,
} from "../../../tools/src/recorded-trees-report.ts"
import { runtimeReadsOfSource } from "../../../tools/src/runtime-imports.ts"

/** A reader of documents held in memory, by path from the root of the repository. */
function memoryReader(files: Record<string, string>): DocumentReader {
  return {
    read: (file) => files[file],
    list: (directory) =>
      Object.keys(files)
        .filter((file) => file.startsWith(`${directory}/`))
        .map((file) => file.slice(directory.length + 1))
        .filter((name) => !name.includes("/")),
  }
}

const VOCABULARY: BlockVocabulary = {
  nodeTypes: new Set(["ErEntityStatement", "ErAttribute"]),
  tokenKinds: new Set(["Identifier", "RawText"]),
}

/** The blocks of the document `text`, read as `packages/spec/docs/ast/er.md`, with linked documents `files`. */
function blocks(
  text: string,
  files: Record<string, string> = {},
): DocumentBlock[] {
  return blocksOf(
    "packages/spec/docs/ast/er.md",
    text,
    VOCABULARY,
    new LinkedSections(memoryReader(files)),
  )
}

describe("runtimeReadsOfSource", () => {
  it("follows the relative imports and exports that Node.js runs", () => {
    const reads = runtimeReadsOfSource(
      "a.ts",
      [
        'import { a } from "./a.ts"',
        'import type { B } from "./b.ts"',
        'import "./c.ts"',
        'export { d } from "./d.ts"',
        'export type { E } from "./e.ts"',
      ].join("\n"),
    )
    expect(reads).toEqual({
      relative: ["./a.ts", "./c.ts", "./d.ts"],
      modules: [],
      dynamic: [],
    })
  })

  it("names the modules of a path that is not relative, and every read whose file cannot be known", () => {
    const reads = runtimeReadsOfSource(
      "a.ts",
      [
        'import { readFileSync } from "node:fs"',
        'import ts from "typescript"',
        'export * from "pkg"',
        'const m = await import("./m.ts")',
        "const n = await import(name)",
        'const r = require("./r.cjs")',
        "const u = new URL('x', import.meta.url)",
      ].join("\n"),
    )
    expect(reads).toEqual({
      relative: ["./m.ts"],
      modules: ["node:fs", "typescript", "pkg"],
      dynamic: [
        "a call of import() at line 4",
        "a call of import() at line 5",
        "the global require at line 6",
        "import.meta at line 7",
      ],
    })
  })

  it("names a reference to a global through which a module reads what no file holds", () => {
    expect(
      runtimeReadsOfSource(
        "a.ts",
        [
          "const a = process.env.X",
          'const fs = process.getBuiltinModule("fs")',
          "const f = globalThis.fetch",
          'eval("1")',
          'const g = new Function("")',
          "const h = global.x",
        ].join("\n"),
      ).dynamic,
    ).toEqual([
      "the global process at line 1",
      "the global process at line 2",
      "the global globalThis at line 3",
      "the global eval at line 4",
      "the global Function at line 5",
      "the global global at line 6",
    ])
  })

  it("takes a member or a property named as a global for no read", () => {
    expect(
      runtimeReadsOfSource(
        "a.ts",
        [
          'this.require("x")',
          'object.process("y")',
          "const o = { process: 1, eval() {} }",
          "class C { require(): void {} }",
          "type T = { process: string }",
        ].join("\n"),
      ).dynamic,
    ).toEqual([])
  })
})

describe("everyTreeReasonFrom", () => {
  const runner = {
    file: "/r/tools/src/run.ts",
    modules: ["node:fs"],
    dynamic: [],
  }
  const rule = {
    file: "/r/packages/tests/src/rule.ts",
    modules: [],
    dynamic: [],
  }

  it("checks only the changed trees when the change changes no file that decides the result", () => {
    expect(
      everyTreeReasonFrom([runner, rule], runner.file, "/r", [
        "packages/tests/src/other.ts",
      ]),
    ).toBeUndefined()
  })

  it("checks every tree when the change changes the runner or a file that it reaches", () => {
    expect(
      everyTreeReasonFrom([runner, rule], runner.file, "/r", [
        "tools/src/run.ts",
        "packages/tests/src/rule.ts",
      ]),
    ).toEqual({
      changedFiles: ["tools/src/run.ts", "packages/tests/src/rule.ts"],
      untraceable: [],
    })
  })

  it("lets the runner import built-in modules, and nothing else that cannot be followed", () => {
    expect(
      everyTreeReasonFrom(
        [
          {
            ...runner,
            modules: ["node:fs", "pkg"],
            dynamic: ["the global process at line 9"],
          },
          {
            ...rule,
            modules: ["node:path"],
            dynamic: ["import.meta at line 3"],
          },
        ],
        runner.file,
        "/r",
        [],
      ),
    ).toEqual({
      changedFiles: [],
      untraceable: [
        { file: "tools/src/run.ts", read: 'an import of "pkg"' },
        { file: "tools/src/run.ts", read: "the global process at line 9" },
        {
          file: "packages/tests/src/rule.ts",
          read: 'an import of "node:path"',
        },
        { file: "packages/tests/src/rule.ts", read: "import.meta at line 3" },
      ],
    })
  })
})

describe("citationsIn and withoutCitations", () => {
  const text =
    "A [fixture: er/a] and [fixture:\n  er/b], not [fixture: <diagram>/<name>]; [corpus\nfixture: er/c]."

  it("reads the citations of a form across line breaks, and no placeholder", () => {
    expect(citationsIn(text).map((citation) => citation.fixture)).toEqual([
      "er/a",
      "er/b",
    ])
    expect(
      citationsIn(text, "corpus fixture").map((citation) => citation.fixture),
    ).toEqual(["er/c"])
  })

  it("takes the citations out after making the whitespace one space", () => {
    expect(withoutCitations("One [fixture:\n  er/b]  two.")).toBe("One two.")
  })
})

describe("blocksOf", () => {
  const document = [
    "# ER nodes",
    "",
    "Japanese version: [er.ja.md](./er.ja.md)",
    "",
    "A paragraph about the tree. [fixture: er/gram-alias]",
    "",
    "### ErEntityStatement",
    "",
    "- An item of a list,",
    "  wrapped.",
    "  - A nested item.",
    "",
    "| Field  | Type          |",
    "| ------ | ------------- |",
    "| `name` | ErIdentifier  |",
    "",
    "## Tokens",
    "",
    "| Kind         | Units     |",
    "| ------------ | --------- |",
    "| `Identifier` | the names |",
    "| `Keyword`    | the words |",
    "",
    "```mmd",
    "erDiagram",
    "```",
    "",
  ].join("\n")

  it("reads paragraphs, items of a list and rows of a table, each as written", () => {
    expect(
      blocks(document).map((block) => [block.line, block.text, block.category]),
    ).toEqual([
      [
        5,
        "A paragraph about the tree. [fixture: er/gram-alias]",
        { kind: "other" },
      ],
      [
        9,
        "An item of a list,\n  wrapped.",
        { kind: "node", nodeType: "ErEntityStatement" },
      ],
      [11, "A nested item.", { kind: "node", nodeType: "ErEntityStatement" }],
      [
        15,
        "| `name` | ErIdentifier  |",
        { kind: "node", nodeType: "ErEntityStatement" },
      ],
      [
        21,
        "| `Identifier` | the names |",
        { kind: "token", tokenKind: "Identifier" },
      ],
      [22, "| `Keyword`    | the words |", { kind: "other" }],
    ])
  })

  it("takes the cited fixtures as the cases of a block", () => {
    expect(blocks(document)[0].cases).toEqual(["er/gram-alias"])
  })

  it("adds a following citation-only paragraph to every row of a table, without a block of its own", () => {
    const rows = blocks(
      [
        "| Kind | Units |",
        "| --- | --- |",
        "| `Identifier` | the names [fixture: er/names] |",
        "| `RawText` | the text |",
        "",
        "[fixture: er/a] [fixture:",
        "  er/b]",
        "",
        "[fixture: er/c]",
        "",
      ].join("\n"),
    )
    expect(rows.map((block) => [block.text, block.cases])).toEqual([
      [
        "| `Identifier` | the names [fixture: er/names] |",
        ["er/names", "er/a", "er/b", "er/c"],
      ],
      ["| `RawText` | the text |", ["er/a", "er/b", "er/c"]],
    ])
  })

  it("adds a citation-only paragraph to the last preceding paragraph", () => {
    const read = blocks(
      "Earlier.\n\nA condition. [fixture: er/a]\n\n[fixture: er/b]\n",
    )
    expect(read.map((block) => [block.text, block.cases])).toEqual([
      ["Earlier.", []],
      ["A condition. [fixture: er/a]", ["er/a", "er/b"]],
    ])
    expect(read[1].key).toBe(blocks("A condition.\n")[0].key)
  })

  it("skips code and HTML when adding a citation-only paragraph to its preceding block", () => {
    const read = blocks(
      [
        "A condition.",
        "",
        "```mmd",
        "erDiagram",
        "```",
        "",
        "[fixture: er/code]",
        "",
        "<div>HTML</div>",
        "",
        "[fixture: er/html]",
        "",
      ].join("\n"),
    )
    expect(read.map((block) => [block.text, block.cases])).toEqual([
      ["A condition.", ["er/code", "er/html"]],
    ])
  })

  it("ignores a citation-only paragraph when no block precedes it", () => {
    expect(
      blocks("# ER\n\n[fixture: er/a]\n\nA condition.\n").map((block) => [
        block.text,
        block.cases,
      ]),
    ).toEqual([["A condition.", []]])
  })

  it("keeps the key when the text is wrapped again or a citation is added", () => {
    const [before] = blocks("Some words of a condition.\n")
    const [rewrapped] = blocks("Some words\nof a condition.\n")
    const [cited] = blocks(
      "Some words of a condition. [fixture:\ner/gram-alias]\n",
    )
    expect(rewrapped.key).toBe(before.key)
    expect(cited.key).toBe(before.key)
    expect(before.key).toMatch(
      /^packages\/spec\/docs\/ast\/er\.md:[0-9a-f]{12}$/u,
    )
  })

  it("keeps a table row's key when a citation-only cell is added", () => {
    const [before] = blocks(
      "| Kind | Units |\n| --- | --- |\n| `Identifier` | the names |\n",
    )
    const [cited] = blocks(
      "| Kind | Units | Fixtures |\n| --- | --- | --- |\n| `Identifier` | the names | [fixture: er/a] |\n",
    )
    expect(cited.key).toBe(before.key)
    expect(cited.ownKeyText).toBe("`Identifier` | the names")
    expect(cited.text).toBe("| `Identifier` | the names | [fixture: er/a] |")
    expect(cited.cases).toEqual(["er/a"])
  })

  it("keeps a table row's key when citations move from its text to a citation-only cell", () => {
    const [before] = blocks(
      "| Kind | Units |\n| --- | --- |\n| `Identifier` | the  names [fixture: er/a] |\n",
    )
    const [moved] = blocks(
      "| Kind | Units | Fixtures |\n| --- | --- | --- |\n| `Identifier` | the names | [fixture: er/a] |\n",
    )
    expect(moved.key).toBe(before.key)
    expect(moved.ownKeyText).toBe(before.ownKeyText)
    expect(moved.cases).toEqual(before.cases)
  })

  it("changes the key when the node type above the block changes", () => {
    const [under] = blocks("### ErEntityStatement\n\nA condition.\n")
    const [other] = blocks("### ErAttribute\n\nA condition.\n")
    expect(other.key).not.toBe(under.key)
  })

  it("tells two blocks of the same key text apart by their order", () => {
    expect(
      blocks("- Same.\n- Same.\n").map((block) => block.key.slice(-2)),
    ).toEqual([blocks("- Same.\n")[0].key.slice(-2), ".2"])
  })

  it("adds the text of a linked section, without its citations, to the key", () => {
    const diagram = "packages/spec/docs/diagrams/er.md"
    const linking = "Units of [names](../diagrams/er.md#names).\n"
    const [first] = blocks(linking, {
      [diagram]:
        "# ER\n\n## Names\n\nA name is a word.\n\n## Other\n\nOther.\n",
    })
    const [cited] = blocks(linking, {
      [diagram]:
        "# ER\n\n## Names\n\nA name is a word. [fixture: er/gram-alias]\n\n## Other\n\nChanged.\n",
    })
    const [changed] = blocks(linking, {
      [diagram]: "# ER\n\n## Names\n\nA name is two words.\n",
    })
    expect(first.sections).toEqual([
      {
        target: `${diagram}#names`,
        text: "## Names\n\nA name is a word.\n\n",
      },
    ])
    expect(cited.key).toBe(first.key)
    expect(changed.key).not.toBe(first.key)
  })

  it("reads a link to a document without an anchor, or to another document, as no section", () => {
    const [block] = blocks(
      "See [er.md](../diagrams/er.md) and [tokens](../../../parser/docs/tokens.md#tokens).\n",
    )
    expect(block.sections).toEqual([])
  })

  it("keeps a link whose anchor names no heading in the key", () => {
    const [block] = blocks("See [x](../common.md#missing).\n", {
      "packages/spec/docs/common.md": "# Common\n",
    })
    expect(block.sections).toEqual([
      { target: "packages/spec/docs/common.md#missing", text: null },
    ])
  })
})

describe("sectionsOf", () => {
  it("reads each section up to the next heading of the same depth or a smaller one, with anchors as GitHub makes them", () => {
    const sections = sectionsOf(
      "# A\n\n## Same name\n\nOne.\n\n### Inner\n\nTwo.\n\n## Same name\n\nThree.\n",
      "x.md",
    )
    expect([...sections.keys()]).toEqual([
      "a",
      "same-name",
      "inner",
      "same-name-1",
    ])
    expect(sections.get("same-name")).toEqual({
      text: "## Same name\n\nOne.\n\n### Inner\n\nTwo.\n\n",
      blocks: [
        { ownKeyText: "One.", cases: [] },
        { ownKeyText: "Two.", cases: [] },
      ],
    })
  })

  it("keeps the cases of citation-only paragraphs with the rows of a section's table", () => {
    const sections = sectionsOf(
      "# Names\n\n| Kind | Meaning |\n| --- | --- |\n| A | a word |\n| B | two words |\n\n[fixture: er/a]\n",
      "x.md",
    )
    expect(sections.get("names")?.blocks).toEqual([
      { ownKeyText: "A | a word", cases: ["er/a"] },
      { ownKeyText: "B | two words", cases: ["er/a"] },
    ])
  })
})

describe("tokenKindsOf", () => {
  it("takes the first column of the table whose first heading cell is Kind", () => {
    expect([
      ...tokenKindsOf(
        "| Kind | Meaning |\n| --- | --- |\n| `Keyword` | a word |\n| `RawText` | text |\n",
      ),
    ]).toEqual(["Keyword", "RawText"])
  })
})

describe("changedItemsOf", () => {
  const ast = "packages/spec/docs/ast.md"
  const diagramAst = "packages/spec/docs/ast/er.md"
  const er = "packages/spec/docs/diagrams/er.md"

  /** The blocks of one version of a small repository. */
  function version(
    astText: string,
    erText: string,
  ): ReturnType<typeof documentBlocksOf> {
    return documentBlocksOf(
      memoryReader({
        [ast]: "# Nodes\n",
        [diagramAst]: astText,
        [er]: erText,
        "packages/parser/docs/tokens.md":
          "| Kind | Meaning |\n| --- | --- |\n| `Identifier` | a name |\n",
      }),
    )
  }

  const linking =
    "Names are [names](../diagrams/er.md#names). [fixture: er/a]\n"
  const sectionBefore =
    "# ER\n\n## Names\n\nA name is a word. [fixture: er/b]\n\nKept. [fixture: er/c]\n"

  it("reads the fixtures of the block when its own text changes", () => {
    const items = changedItemsOf(
      version(
        "Names are [names](../diagrams/er.md#names), changed. [fixture: er/a]\n",
        sectionBefore,
      ),
      version(linking, sectionBefore),
      (fixture) => fixture.split("/")[0],
    )
    expect(
      items.map((item) => [
        item.diagram,
        item.ownTextChanged,
        item.changedSections,
        item.fixtures,
      ]),
    ).toEqual([["er", true, [], ["er/a"]]])
  })

  it("reads, when only a section changes, the fixtures of the blocks of the section that one version has", () => {
    const sectionAfter =
      "# ER\n\n## Names\n\nA name is two words. [fixture: er/d]\n\nKept. [fixture: er/c]\n"
    const items = changedItemsOf(
      version(linking, sectionAfter),
      version(linking, sectionBefore),
      (fixture) => fixture.split("/")[0],
    )
    expect(
      items.map((item) => [
        item.ownTextChanged,
        item.changedSections,
        item.fixtures,
      ]),
    ).toEqual([[false, [`${er}#names`], ["er/d", "er/b"]]])
  })

  it("finds no change when only citations change", () => {
    expect(
      changedItemsOf(
        version(
          "Names are [names](../diagrams/er.md#names). [fixture: er/a] [fixture: er/e]\n",
          "# ER\n\n## Names\n\nA name is a word. [fixture: er/b] [fixture: er/f]\n\nKept. [fixture: er/c]\n",
        ),
        version(linking, sectionBefore),
        (fixture) => fixture.split("/")[0],
      ),
    ).toEqual([])
  })

  it("keeps only the fixtures of the diagram type of the item", () => {
    const items = changedItemsOf(
      version(
        "A new block. [fixture: er/a] [fixture: common/z]\n",
        sectionBefore,
      ),
      version(linking, sectionBefore),
      (fixture) => fixture.split("/")[0],
    )
    expect(items.map((item) => item.fixtures)).toEqual([["er/a"]])
  })
})

describe("coverageOf", () => {
  const [block] = blocks("A condition.\n")
  const held = new Map([[block.key, { block, diagrams: ["er", "gantt"] }]])
  const shown: CoverageRow["judgment"] = {
    status: "shown",
    cases: [
      {
        case: "A condition.",
        tests: [{ file: "check-tree-er.test.ts", text: "er/gram-alias" }],
      },
    ],
  }

  /** The text of a test file of this test. */
  function tests(file: string): string | undefined {
    return file === "check-tree-er.test.ts"
      ? 'it("breaks er/gram-alias")'
      : undefined
  }

  it("gives the judgment of a row to each diagram type it names", () => {
    const coverage = coverageOf(
      [
        {
          block: block.key,
          diagrams: ["er"],
          about: "A condition.",
          judgment: shown,
        },
      ],
      held,
      tests,
    )
    expect([...coverage.judgments.keys()]).toEqual([`${block.key}@er`])
    expect(coverage.staleRows).toEqual([])
  })

  it("counts no row whose block, case or diagram type is not there, or whose item an earlier row covers", () => {
    const rows: CoverageRow[] = [
      {
        block: "packages/spec/docs/ast/er.md:000000000000",
        diagrams: ["er"],
        about: "",
        judgment: shown,
      },
      {
        block: block.key,
        diagrams: ["er"],
        about: "",
        judgment: {
          status: "shown",
          cases: [
            {
              case: "A condition.",
              tests: [{ file: "check-tree-er.test.ts", text: "er/other" }],
            },
          ],
        },
      },
      {
        block: block.key,
        diagrams: ["flowchart"],
        about: "",
        judgment: shown,
      },
      { block: block.key, diagrams: ["gantt"], about: "", judgment: shown },
      {
        block: block.key,
        diagrams: ["gantt"],
        about: "",
        judgment: { status: "not-shown", reason: "no-rule", note: "" },
      },
    ]
    const coverage = coverageOf(rows, held, tests)
    expect(coverage.staleRows.map((stale) => stale.reason)).toEqual([
      "no block has this key now: its text, its node type, or a section it links to changed, or it was removed",
      'the test file check-tree-er.test.ts no longer holds "er/other"',
      "the block does not hold for the diagram type flowchart",
      "an earlier row covers the diagram type gantt",
    ])
    expect([...coverage.judgments.keys()]).toEqual([`${block.key}@gantt`])
  })

  it("checks every test of every case, including a missing file", () => {
    const coverage = coverageOf(
      [
        {
          block: block.key,
          diagrams: ["er"],
          about: "",
          judgment: {
            status: "shown",
            cases: [
              {
                case: "The first condition.",
                tests: [
                  { file: "check-tree-er.test.ts", text: "er/gram-alias" },
                  { file: "check-tree-er.test.ts", text: "er/other" },
                ],
              },
            ],
          },
        },
        {
          block: block.key,
          diagrams: ["gantt"],
          about: "",
          judgment: {
            status: "shown",
            cases: [
              {
                case: "The first condition.",
                tests: [
                  { file: "check-tree-er.test.ts", text: "er/gram-alias" },
                ],
              },
              {
                case: "The second condition.",
                tests: [{ file: "missing.test.ts", text: "gantt/other" }],
              },
            ],
          },
        },
      ],
      held,
      tests,
    )
    expect(coverage.judgments.size).toBe(0)
    expect(coverage.staleRows.map((row) => row.reason)).toEqual([
      'the test file check-tree-er.test.ts no longer holds "er/other"',
      'the test file missing.test.ts no longer holds "gantt/other"',
    ])
  })
})

describe("coverageOf with a block that states no condition", () => {
  const [block] = blocks("This document defines the tree.\n")
  it("takes the judgment for the diagram types named", () => {
    const coverage = coverageOf(
      [
        {
          block: block.key,
          diagrams: ["er"],
          about: "",
          judgment: { status: "no-condition", kind: "introduction", note: "" },
        },
      ],
      new Map([[block.key, { block, diagrams: ["er"] }]]),
      () => undefined,
    )
    expect(coverage.staleRows).toEqual([])
    expect(coverage.judgments.get(`${block.key}@er`)?.status).toBe(
      "no-condition",
    )
  })
})

describe("readCoverageTable", () => {
  const diagrams = new Set(["er", "gantt", "error"])
  const row = {
    block: "packages/spec/docs/ast/er.md:0123456789ab",
    diagrams: ["er"],
    about: "A condition.",
    judgment: {
      status: "no-condition",
      kind: "introduction",
      note: "It introduces the document.",
    },
  }

  /** The table of the files `files`, each of them under the table's folder. */
  function tableOf(files: Record<string, unknown>) {
    return readCoverageTable(
      memoryReader(
        Object.fromEntries(
          Object.entries(files).map(([name, value]) => [
            `${COVERAGE_TABLE}/${name}`,
            typeof value === "string" ? value : JSON.stringify(value),
          ]),
        ),
      ),
      diagrams,
    )
  }

  it("reads the rows of every file in the order of their names", () => {
    const second = {
      ...row,
      block: "packages/spec/docs/ast/er.md:ba9876543210",
    }
    expect(
      tableOf({ "b.json": { rows: [second] }, "a.json": { rows: [row] } }),
    ).toEqual({
      rows: [row, second],
      unreadable: [],
    })
  })

  it("reads named cases with one or more test references", () => {
    const shown = {
      ...row,
      judgment: {
        status: "shown",
        cases: [
          {
            case: "The first condition.",
            tests: [
              { file: "a.test.ts", text: "first" },
              { file: "b.test.ts", text: "also first" },
            ],
          },
          {
            case: "The second condition.",
            tests: [{ file: "b.test.ts", text: "second" }],
          },
        ],
      },
    }
    expect(tableOf({ "a.json": { rows: [shown] } })).toEqual({
      rows: [shown],
      unreadable: [],
    })
  })

  it("reads no-condition with kind not-in-diagram", () => {
    const notInDiagram = {
      ...row,
      judgment: {
        status: "no-condition",
        kind: "not-in-diagram",
        note: "The diagram document defines no node type for this condition.",
      },
    }
    expect(tableOf({ "a.json": { rows: [notInDiagram] } })).toEqual({
      rows: [notInDiagram],
      unreadable: [],
    })
  })

  it.each([
    ["the former flat references", [{ file: "a.test.ts", text: "a" }]],
    ["a missing case", [{ tests: [{ file: "a.test.ts", text: "a" }] }]],
    [
      "an empty case",
      [{ case: "", tests: [{ file: "a.test.ts", text: "a" }] }],
    ],
    [
      "a nonstring case",
      [{ case: 1, tests: [{ file: "a.test.ts", text: "a" }] }],
    ],
    ["missing tests", [{ case: "A condition." }]],
    ["empty tests", [{ case: "A condition.", tests: [] }]],
    ["tests that are no list", [{ case: "A condition.", tests: {} }]],
    ["a test that is no object", [{ case: "A condition.", tests: [null] }]],
    ["a missing file", [{ case: "A condition.", tests: [{ text: "a" }] }]],
    [
      "a missing text",
      [{ case: "A condition.", tests: [{ file: "a.test.ts" }] }],
    ],
    [
      "an empty text",
      [{ case: "A condition.", tests: [{ file: "a.test.ts", text: "" }] }],
    ],
  ])("rejects shown with %s", (_name, cases) => {
    expect(
      tableOf({
        "a.json": { rows: [{ ...row, judgment: { status: "shown", cases } }] },
      }),
    ).toEqual({
      rows: [],
      unreadable: [
        {
          file: `${COVERAGE_TABLE}/a.json`,
          reason:
            "rows[0] is shown without cases of { case, tests: [{ file, text }] }, with a nonempty case and tests",
        },
      ],
    })
  })

  it("names a file that is not of the form of the table, and takes no row of it", () => {
    const table = tableOf({
      "a.json": "{",
      "b.json": { rows: [{ ...row, diagrams: ["er", "flowchart"] }] },
      "c.json": { rows: [{ ...row, diagrams: [] }] },
      "d.json": {
        rows: [{ ...row, judgment: { status: "shown", cases: [] } }],
      },
      "e.json": {
        rows: [
          {
            ...row,
            judgment: { status: "not-shown", reason: "unknown", note: "" },
          },
        ],
      },
      "f.json": {
        rows: [{ ...row, judgment: { status: "no-condition", note: "" } }],
      },
      "g.json": { rows: [{ ...row, judgment: { status: "maybe" } }] },
      "h.json": { items: [] },
      "i.json": {
        rows: [
          {
            ...row,
            judgment: { status: "no-condition", kind: "unknown", note: "" },
          },
        ],
      },
    })
    expect(table).toEqual({
      rows: [],
      unreadable: [
        { file: `${COVERAGE_TABLE}/a.json`, reason: "it is not JSON" },
        {
          file: `${COVERAGE_TABLE}/b.json`,
          reason: 'rows[0] names "flowchart", which is no diagram type',
        },
        {
          file: `${COVERAGE_TABLE}/c.json`,
          reason: "rows[0] names no diagram types",
        },
        {
          file: `${COVERAGE_TABLE}/d.json`,
          reason:
            "rows[0] is shown without cases of { case, tests: [{ file, text }] }, with a nonempty case and tests",
        },
        {
          file: `${COVERAGE_TABLE}/e.json`,
          reason:
            "rows[0] is not shown without a reason (no-rule or rule-misses-condition) and a note",
        },
        {
          file: `${COVERAGE_TABLE}/f.json`,
          reason:
            "rows[0] states no condition without a kind (introduction, pointer, reason or not-in-diagram) and a note",
        },
        {
          file: `${COVERAGE_TABLE}/g.json`,
          reason:
            "rows[0] has a status other than shown, not-shown and no-condition",
        },
        {
          file: `${COVERAGE_TABLE}/h.json`,
          reason: "it is not a JSON object with a list `rows`",
        },
        {
          file: `${COVERAGE_TABLE}/i.json`,
          reason:
            "rows[0] states no condition without a kind (introduction, pointer, reason or not-in-diagram) and a note",
        },
      ],
    })
  })

  it("reads an item as one to read only when it is not shown or not judged", () => {
    expect(isRead(undefined)).toBe(true)
    expect(isRead({ status: "not-shown", reason: "no-rule", note: "" })).toBe(
      true,
    )
    expect(
      isRead({
        status: "shown",
        cases: [
          { case: "A condition.", tests: [{ file: "a.test.ts", text: "a" }] },
        ],
      }),
    ).toBe(false)
    expect(isRead({ status: "no-condition", kind: "pointer", note: "" })).toBe(
      false,
    )
  })
})

describe("citationsOf", () => {
  let root: string
  beforeEach(() => {
    root = mkdtempSync(path.join(os.tmpdir(), "recorded-trees-"))
    const files: Record<string, string> = {
      "packages/spec/docs/diagrams/er.md":
        "One.\n[fixture: er/a]\nTwo [fixture:\n  er/b].\n",
      "packages/spec/docs/diagrams/er.ja.md": "[fixture: er/a]\n",
      "packages/prettier-plugin-mmd/docs/er.md":
        "\n[corpus fixture: er/a] [fixture: er/own]\n",
    }
    for (const [file, text] of Object.entries(files)) {
      mkdirSync(path.dirname(path.join(root, file)), { recursive: true })
      writeFileSync(path.join(root, file), text)
    }
  })
  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("finds the sentences that cite a fixture by line, the corpus citations of the formatter, and no Japanese version", () => {
    expect(Object.fromEntries(citationsOf(root))).toEqual({
      "er/a": [
        "packages/spec/docs/diagrams/er.md:2",
        "packages/prettier-plugin-mmd/docs/er.md:2",
      ],
      "er/b": ["packages/spec/docs/diagrams/er.md:3"],
    })
  })
})

describe("answersOf", () => {
  it("reads the pairs of item and tree, and the trees, that the answers cover", () => {
    const answers = answersOf([
      {
        file: "a.json",
        text: JSON.stringify({
          items: [
            {
              item: "d.md:abc@er",
              trees: [{ key: "1:2", fixture: "er/x" }, { key: "3:4" }],
              answer: "read",
            },
          ],
          trees: [{ key: "1:2", fixture: "er/x", answer: "read" }],
        }),
      },
    ])
    expect([...answers.items]).toEqual(["d.md:abc@er 1:2", "d.md:abc@er 3:4"])
    expect([...answers.trees]).toEqual(["1:2"])
    expect(answers.unreadable).toEqual([])
  })

  it("counts no answer whose text is empty or whitespace only, as the template gives it", () => {
    const answers = answersOf([
      {
        file: "a.json",
        text: JSON.stringify({
          items: [
            { item: "d.md:abc@er", trees: [{ key: "1:2" }], answer: "" },
            { item: "d.md:def@er", trees: [{ key: "1:2" }], answer: " \n" },
          ],
          trees: [{ key: "1:2", answer: "\t" }],
        }),
      },
    ])
    expect(answers.items.size + answers.trees.size).toBe(0)
    expect(answers.unreadable).toEqual([])
  })

  it("names a file that is not an answer file, and counts nothing of it", () => {
    const answers = answersOf([
      { file: "a.json", text: undefined },
      { file: "b.json", text: "{" },
      { file: "c.json", text: "[]" },
      { file: "d.json", text: '{"items": []}' },
      {
        file: "e.json",
        text: '{"items": [{"item": "x", "trees": [{}], "answer": ""}], "trees": []}',
      },
      { file: "f.json", text: '{"items": [], "trees": [{"key": "1:2"}]}' },
    ])
    expect(answers.unreadable).toEqual([
      { file: "a.json", reason: "it cannot be read" },
      { file: "b.json", reason: "it is not JSON" },
      { file: "c.json", reason: "it is not a JSON object" },
      { file: "d.json", reason: "it has no list `items` and list `trees`" },
      {
        file: "e.json",
        reason: "items[0] is not { item, trees: [{ key, fixture? }], answer }",
      },
      { file: "f.json", reason: "trees[0] is not { key, fixture?, answer }" },
    ])
    expect(answers.items.size + answers.trees.size).toBe(0)
  })
})

describe("changedRecordsOf", () => {
  let root: string
  beforeEach(() => {
    root = mkdtempSync(path.join(os.tmpdir(), "recorded-trees-"))
    for (const [fixture, file] of [
      ["er/kept", "ast.json"],
      ["er/kept", "input.mmd"],
      ["er/rejected", "parse-error.json"],
    ] as const) {
      mkdirSync(path.join(root, "packages/tests/fixtures", fixture), {
        recursive: true,
      })
      writeFileSync(
        path.join(root, "packages/tests/fixtures", fixture, file),
        "",
      )
    }
  })
  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("takes a fixture whose input or tree changed and that has a tree now, and lists the others", () => {
    expect(
      changedRecordsOf(root, [
        "packages/tests/fixtures/er/kept/input.mmd",
        "packages/tests/fixtures/er/removed/ast.json",
        "packages/tests/fixtures/er/rejected/parse-error.json",
        "packages/tests/fixtures/er/rejected/input.mmd",
        "packages/tests/fixtures/default-config.json",
        "packages/tests/src/index.ts",
      ]),
    ).toEqual({
      trees: ["er/kept"],
      removedTrees: ["er/removed"],
      rejections: ["er/rejected"],
    })
  })
})

describe("placesOf", () => {
  const input = "erDiagram\n  A\n"

  /** The position of `offset` in the input. */
  function point(offset: number): { line: number; column: number } {
    return {
      line: offset < 10 ? 1 : 2,
      column: offset < 10 ? offset : offset - 10,
    }
  }

  /** The fields of a record of `type` at `start` to `end`. */
  function placed(
    type: string,
    start: number,
    end: number,
  ): { type: string; range: [number, number]; loc: object } {
    return {
      type,
      range: [start, end],
      loc: { start: point(start), end: point(end) },
    }
  }

  const tree = {
    ...placed("Root", 0, 14),
    diagramType: "er",
    body: {
      ...placed("ErDiagram", 0, 13),
      body: [
        {
          ...placed("ErEntityStatement", 12, 13),
          name: { ...placed("ErIdentifier", 12, 13), name: "A" },
          alias: null,
          cssClasses: [],
          attributes: [],
        },
      ],
    },
    frontmatter: null,
    comments: [],
    directives: [],
    tokens: [
      { ...placed("Keyword", 0, 9), value: "erDiagram" },
      { ...placed("Identifier", 12, 13), value: "A" },
    ],
  } as unknown as CheckedRoot
  const placedTree = {
    fixture: "er/x",
    input,
    nodes: nodesOf(tree),
    root: tree,
  }
  const [nodeBlock] = blocks("### ErEntityStatement\n\nAn entity.\n")
  const [tokenBlock] = blocks(
    "| Kind | Units |\n| --- | --- |\n| `Identifier` | names |\n",
  )
  const [otherBlock] = blocks("Every tree.\n")

  it("places a block under a node type at the nodes of the type", () => {
    expect(placesOf(nodeBlock, placedTree)).toEqual([
      { key: "er/x ErEntityStatement@12-13", text: "A" },
    ])
  })

  it("places a row of a token kind at the tokens of the kind, with the innermost node", () => {
    expect(placesOf(tokenBlock, placedTree)).toEqual([
      { key: "er/x Identifier@12-13 in ErIdentifier", text: "A" },
    ])
  })

  it("places any other block at the whole tree", () => {
    expect(placesOf(otherBlock, placedTree)).toEqual([
      { key: "er/x *", text: undefined },
    ])
  })
})

describe("keyTextOf", () => {
  it("joins the node type, the text and the sections, each without citations and with whitespace made one space", () => {
    expect(
      keyTextOf("ErEntity", "A  condition\n[fixture: er/a] here.", [
        {
          target: "packages/spec/docs/common.md#x",
          text: "## X\n\nWords. [fixture: er/b]",
        },
        { target: "packages/spec/docs/common.md#y", text: null },
      ]),
    ).toBe(
      "under ErEntity\nA condition here.\n## X Words.\npackages/spec/docs/common.md#y names no section",
    )
  })
})

describe("checkRecordedTrees and failsOf, on a repository of one change", () => {
  // A repository with no documents of the tree: the changed tree has no item,
  // and the reading of it against the sentences that cite it needs an answer.
  let root: string
  const changedFixture = "packages/tests/fixtures/pie/header-only"

  /** Runs git in the repository. */
  function git(...args: string[]): string {
    return execFileSync(
      "git",
      [
        "-c",
        "user.name=test",
        "-c",
        "user.email=test@example.invalid",
        ...args,
      ],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
    )
  }

  /** Copies a fixture of the corpus into the repository. */
  function copyFixture(fixture: string): void {
    mkdirSync(path.join(root, "packages/tests/fixtures", fixture), {
      recursive: true,
    })
    for (const name of ["input.mmd", "ast.json", "expected.json"]) {
      copyFileSync(
        path.join(getFixturesRoot(), fixture, name),
        path.join(root, "packages/tests/fixtures", fixture, name),
      )
    }
  }

  /** The report of the change since HEAD. */
  function check(): ReturnType<typeof checkRecordedTrees> {
    const { base, changed } = changeSince(root, "HEAD")
    return checkRecordedTrees(root, base, changed, { places: false })
  }

  beforeEach(() => {
    root = mkdtempSync(path.join(os.tmpdir(), "recorded-trees-"))
    git("init", "--quiet")
    copyFixture("info/header-lf")
    git("add", ".")
    git("commit", "--quiet", "-m", "base")
    copyFixture("pie/header-only")
  })
  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  it("fails a changed tree that no answer reads against the sentences that cite it", () => {
    const report = check()
    expect(report.changedTrees.map((tree) => tree.fixture)).toEqual([
      "pie/header-only",
    ])
    expect(report.unansweredTrees.map((tree) => tree.fixture)).toEqual([
      "pie/header-only",
    ])
    expect(failsOf(report)).toBe(true)
  })

  it("distinguishes uncited collected and authored inputs added by the change", () => {
    copyFixture("info/spec-info-06271baf")
    const report = check()
    expect(
      report.changedTrees.map(({ fixture, sourceKind }) => ({
        fixture,
        sourceKind,
      })),
    ).toEqual([
      { fixture: "info/spec-info-06271baf", sourceKind: "mermaid" },
      { fixture: "pie/header-only", sourceKind: "authored" },
    ])
    const output = formatReport(report, false)
    expect(output).toContain(
      "- info/spec-info-06271baf: no sentence cites it; this change adds the fixture; it is a collected input (source kind mermaid), which no sentence needs to cite\n",
    )
    expect(output).toContain(
      "- pie/header-only: no sentence cites it; this change adds the fixture; it is not a collected input (source kind authored); tell packages/spec that a sentence needs to cite it\n",
    )
  })

  it("does not ask for a spec sentence for an uncited authored fixture at the base", () => {
    git("add", ".")
    git("commit", "--quiet", "-m", "fixture")
    const treeFile = path.join(root, changedFixture, "ast.json")
    writeFileSync(treeFile, `\n${readFileSync(treeFile, "utf8")}`)
    const output = formatReport(check(), false)
    expect(output).toContain(
      "- pie/header-only: no sentence cites it; the base has the fixture; it is not a collected input (source kind authored)\n",
    )
    expect(output).not.toContain("tell packages/spec")
  })

  it.each([
    ["missing expected.json", undefined],
    ["invalid JSON", "{"],
    ["no source", "{}"],
    ["an unknown source kind", '{"source":{"kind":"unknown"}}'],
  ])("shows collected-input status as unknown with %s", (_name, text) => {
    const expectedFile = path.join(root, changedFixture, "expected.json")
    if (text === undefined) rmSync(expectedFile)
    else writeFileSync(expectedFile, text)
    const report = check()
    expect(report.changedTrees[0].sourceKind).toBeUndefined()
    const output = formatReport(report, false)
    expect(output).toContain(
      "- pie/header-only: no sentence cites it; this change adds the fixture; whether it is a collected input is unknown (expected.json source kind cannot be read)\n",
    )
    expect(output).not.toContain("tell packages/spec")
  })

  it("passes when an answer file of the change covers its content, and fails when the answer is empty", () => {
    const [tree] = check().changedTrees
    mkdirSync(path.join(root, ANSWERS), { recursive: true })

    /** Writes the answer file of the change, with `text` for the tree. */
    function answer(text: string): void {
      writeFileSync(
        path.join(root, ANSWERS, "change.json"),
        JSON.stringify({
          items: [],
          trees: [{ key: tree.contentKey, answer: text }],
        }),
      )
    }

    answer("Read against the sentences that cite it.")
    expect(failsOf(check())).toBe(false)
    answer("")
    expect(failsOf(check())).toBe(true)
  })

  it("fails, and does not stop, when the tree is no JSON or the input is missing", () => {
    writeFileSync(path.join(root, changedFixture, "ast.json"), "{")
    const unreadable = check()
    expect(unreadable.checked.map(({ result }) => result.kind)).toEqual([
      "unreadable",
    ])
    expect(failsOf(unreadable)).toBe(true)
    copyFixture("pie/header-only")
    rmSync(path.join(root, changedFixture, "input.mmd"))
    const missing = check()
    expect(missing.checked.map(({ result }) => result)).toEqual([
      { kind: "unreadable", reason: "input.mmd cannot be read" },
    ])
    expect(failsOf(missing)).toBe(true)
  })

  it("fails a file of the coverage table that cannot be read", () => {
    mkdirSync(path.join(root, COVERAGE_TABLE), { recursive: true })
    writeFileSync(path.join(root, COVERAGE_TABLE, "a.json"), "{")
    const report = check()
    expect(report.unreadableTable).toEqual([
      { file: `${COVERAGE_TABLE}/a.json`, reason: "it is not JSON" },
    ])
    expect(failsOf(report)).toBe(true)
  })
})
