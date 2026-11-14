import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import os from "node:os"
import path from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { CoverageRow } from "../src/check-tree/coverage.ts"
import type { CheckedRoot } from "../src/check-tree/types.ts"
import { nodesOf } from "../src/check-tree/walk.ts"
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
  answersOf,
  changedItemsOf,
  changedRecordsOf,
  coverageOf,
  documentBlocksOf,
  placesOf,
} from "../../../tools/src/recorded-trees.ts"
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
      untraceable: [],
    })
  })

  it("names every read that is not a relative path of a module", () => {
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
      untraceable: [
        'an import of "node:fs"',
        'an import of "typescript"',
        'an export of "pkg"',
        "a call of import() at line 4",
        "a call of import() at line 5",
        "a call of require() at line 6",
        "import.meta at line 7",
      ],
    })
  })

  it("takes a method named require for no read", () => {
    expect(
      runtimeReadsOfSource("a.ts", 'this.require("x")\nobject.require("y")\n')
        .untraceable,
    ).toEqual([])
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
    cases: [{ file: "check-tree-er.test.ts", text: "er/gram-alias" }],
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
          cases: [{ file: "check-tree-er.test.ts", text: "er/other" }],
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
