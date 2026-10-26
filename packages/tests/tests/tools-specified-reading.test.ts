import { describe, expect, it } from "vitest"
import {
  specifiedRunOf,
  withoutBarePercentLinesBeforeHeader,
  withoutBlankLinesAfterHeader,
  withoutFrontmatterTagStarts,
  opaqueReferenceInput,
} from "../../../tools/src/specified-reading.ts"
import { KNOWN_DIVERGENCES, loadFixtures } from "../src/index.ts"
import type { MermaidRun } from "../src/mermaid.ts"
import {
  extractFrontmatterTitle,
  readMermaidConfiguration,
  runMermaidWithEmbeddedData,
} from "../src/mermaid.ts"

/**
 * The marks whose fixtures are read with a part of mermaid.js taken out: the
 * detector of C4, or lexer rules.
 */
const REMOVAL_MARKS = [
  "c4-keyword-anywhere",
  "comment-takes-character",
  "comment-takes-line-break",
  "name-start-reads-unit",
  "percent-brace-after-unit",
  "title-digit-after-axis-statement",
]

/** The mark of the divergence about a bare `%%` line before the header. */
const BARE_PERCENT_MARK = "bare-percent-line-before-header"

/** The mark of the divergence about a blank line after the header or after a comment line in a mindmap. */
const BLANK_LINES_MARK = "blank-line-after-header-or-comments"

/** The mark of the divergence about the HTML tag that starts in the frontmatter. */
const HTML_TAG_MARK = "html-tag-in-frontmatter"

/** The mark of the divergence about opaque embedded data. */
const OPAQUE_MARK = "embedded-data-opaque"

/**
 * The marks of the divergences where the specification rejects what
 * mermaid.js accepts, with no other reading of mermaid.js to take: their
 * fixtures have no `specified.json`
 * (`docs/expected-results.md`).
 */
const MARKS_WITHOUT_READING = [
  "directive-as-token-boundary",
  "ignored-semicolon-as-token-boundary",
  "click-reserved-word",
  "tokenless-empty-forms",
  "headerless-empty-ending",
]

/** The first line of the message of the error of a rejected run. */
function firstLine(run: MermaidRun | undefined): string {
  if (run === undefined || run.outcome.accepted) {
    throw new Error("expected a rejection")
  }
  return run.outcome.error.message.split("\n")[0] ?? ""
}

/** The Db of an accepted run, as a record. */
function dbOf(run: MermaidRun | undefined): Record<string, unknown> {
  if (run === undefined || !run.outcome.accepted || run.outcome.db === null) {
    throw new Error("expected an accepted run with a Db")
  }
  return run.outcome.db
}

/** The ids of the classes of an accepted run of a class diagram. */
function classIds(run: MermaidRun | undefined): string[] {
  return (dbOf(run).classes as { id: string }[]).map((entry) => entry.id)
}

describe("the marks", () => {
  it("are those of the removals, of the frontmatter, of the bare `%%` lines and of the blank lines, of opaque data, and the marks without a reading, and no other", () => {
    expect(KNOWN_DIVERGENCES.toSorted()).toEqual(
      [
        ...REMOVAL_MARKS,
        HTML_TAG_MARK,
        OPAQUE_MARK,
        BARE_PERCENT_MARK,
        BLANK_LINES_MARK,
        ...MARKS_WITHOUT_READING,
      ].sort(),
    )
  })
})

describe("withoutFrontmatterTagStarts", () => {
  it("replaces the `<` of the title, and of any other key", () => {
    expect(
      withoutFrontmatterTagStarts("---\ntitle: <a\n---\nflowchart LR\nA\n"),
    ).toBe("---\ntitle: (a\n---\nflowchart LR\nA\n")
    expect(
      withoutFrontmatterTagStarts(
        "---\ndescription: <a\n---\nflowchart LR\nA\n",
      ),
    ).toBe("---\ndescription: (a\n---\nflowchart LR\nA\n")
  })

  it("replaces a `<` that starts a line, a key or a nested value, and every `<` of the frontmatter", () => {
    expect(
      withoutFrontmatterTagStarts(
        "---\n<a: 1\ntitle: <b <c\nconfig:\n  theme: <d\n---\nA\n",
      ),
    ).toBe("---\n(a: 1\ntitle: (b (c\nconfig:\n  theme: (d\n---\nA\n")
  })

  it("leaves a text without a frontmatter as it is, a `<` of the diagram too", () => {
    expect(withoutFrontmatterTagStarts("flowchart LR\nA[<b>x]\n")).toBe(
      "flowchart LR\nA[<b>x]\n",
    )
    expect(withoutFrontmatterTagStarts("")).toBe("")
  })

  it("leaves the `<` after the closing line as it is", () => {
    expect(
      withoutFrontmatterTagStarts(
        '---\ntitle: <a\n---\nflowchart LR\nA[<b x="y">t]\n',
      ),
    ).toBe('---\ntitle: (a\n---\nflowchart LR\nA[<b x="y">t]\n')
  })

  it("closes the frontmatter at the first line that holds `---` alone", () => {
    expect(
      withoutFrontmatterTagStarts("---\ntitle: <a\n---\nA[<b>]\n---\n<c\n"),
    ).toBe("---\ntitle: (a\n---\nA[<b>]\n---\n<c\n")
  })

  it("does not take a line that has more than `---` for the closing line", () => {
    expect(
      withoutFrontmatterTagStarts("---\ntitle: <a\n--- x\n<b\n---\nA[<c>]\n"),
    ).toBe("---\ntitle: (a\n--- x\n(b\n---\nA[<c>]\n")
    expect(
      withoutFrontmatterTagStarts("---\ntitle: <a\n----\n<b\n---\nA[<c>]\n"),
    ).toBe("---\ntitle: (a\n----\n(b\n---\nA[<c>]\n")
    expect(
      withoutFrontmatterTagStarts("---\ntitle: <a\n  ---\n<b\n---\nA[<c>]\n"),
    ).toBe("---\ntitle: (a\n  ---\n(b\n---\nA[<c>]\n")
  })

  it("takes a closing line with blanks after the `---`", () => {
    expect(
      withoutFrontmatterTagStarts("---\ntitle: <a\n---   \nA[<b>]\n"),
    ).toBe("---\ntitle: (a\n---   \nA[<b>]\n")
    expect(
      withoutFrontmatterTagStarts("---\ntitle: <a\n---\t \nA[<b>]\n"),
    ).toBe("---\ntitle: (a\n---\t \nA[<b>]\n")
  })

  it("takes an opening line with blanks after the `---`", () => {
    expect(
      withoutFrontmatterTagStarts("---  \t\ntitle: <a\n---\nA[<b>]\n"),
    ).toBe("---  \t\ntitle: (a\n---\nA[<b>]\n")
  })

  it("takes CRLF line breaks, and a lone CR as a line break", () => {
    expect(
      withoutFrontmatterTagStarts(
        "---\r\ntitle: <a\r\n---\r\nflowchart LR\r\nA[<b>]\r\n",
      ),
    ).toBe("---\r\ntitle: (a\r\n---\r\nflowchart LR\r\nA[<b>]\r\n")
    expect(withoutFrontmatterTagStarts("---\rtitle: <a\r---\rA[<b>]\r")).toBe(
      "---\rtitle: (a\r---\rA[<b>]\r",
    )
  })

  it("takes a frontmatter whose body is empty or has an empty line first", () => {
    expect(withoutFrontmatterTagStarts("---\n\n---\nA[<b>]\n")).toBe(
      "---\n\n---\nA[<b>]\n",
    )
    expect(withoutFrontmatterTagStarts("---\n\n<a\n---\nA[<b>]\n")).toBe(
      "---\n\n(a\n---\nA[<b>]\n",
    )
  })

  it("finds no frontmatter in a text that does not start with `---`", () => {
    for (const text of [
      "\n---\ntitle: <a\n---\nflowchart LR\n",
      " ---\ntitle: <a\n---\nflowchart LR\n",
      "--\ntitle: <a\n---\nflowchart LR\n",
      "flowchart LR\n---\ntitle: <a\n---\n",
    ]) {
      expect(withoutFrontmatterTagStarts(text)).toBe(text)
    }
  })

  it("takes a frontmatter whose opening and closing lines have the same indentation", () => {
    expect(
      withoutFrontmatterTagStarts(
        "  ---\n  title: <a\n  ---\nflowchart LR\nA[<b>]\n",
      ),
    ).toBe("  ---\n  title: (a\n  ---\nflowchart LR\nA[<b>]\n")
    expect(
      extractFrontmatterTitle(
        "  ---\n  title: <a\n  ---\nflowchart LR\nA[<b>]\n",
      ),
    ).toBe("<a")
  })

  it("takes a byte order mark before the `---` as the indentation that the closing line has to repeat", () => {
    const mark = String.fromCharCode(0xfeff)
    expect(
      withoutFrontmatterTagStarts(
        `${mark}---\ntitle: <a\n${mark}---\nflowchart LR\n`,
      ),
    ).toBe(`${mark}---\ntitle: (a\n${mark}---\nflowchart LR\n`)
  })

  it("finds no frontmatter whose closing line has another indentation than the opening line", () => {
    for (const text of [
      "  ---\ntitle: <a\n---\nflowchart LR\n",
      "---\ntitle: <a\n  ---\nflowchart LR\n",
      "  ---\n  title: <a\n   ---\nflowchart LR\n",
    ]) {
      expect(withoutFrontmatterTagStarts(text)).toBe(text)
    }
  })

  it("finds no frontmatter where the opening line has more than blanks after the `---`", () => {
    for (const text of [
      "---x\ntitle: <a\n---\nflowchart LR\n",
      "---- \ntitle: <a\n---\nflowchart LR\n",
      "--- !!map\ntitle: <a\n---\nflowchart LR\n",
    ]) {
      expect(withoutFrontmatterTagStarts(text)).toBe(text)
    }
  })

  it("finds no frontmatter where the opening line has no line break", () => {
    for (const text of ["---", "---  ", "---<a"]) {
      expect(withoutFrontmatterTagStarts(text)).toBe(text)
    }
  })

  it("finds no frontmatter that is not closed", () => {
    for (const text of [
      "---\ntitle: <a\nflowchart LR\n",
      "---\ntitle: <a\n",
      "---\ntitle: <a\n--\nflowchart LR\n",
    ]) {
      expect(withoutFrontmatterTagStarts(text)).toBe(text)
    }
  })

  it("finds no frontmatter where the closing `---` has no line break after its blanks", () => {
    for (const text of [
      "---\ntitle: <a\n---",
      "---\ntitle: <a\n---  ",
      "---\ntitle: <a\n---x\nflowchart LR\n",
    ]) {
      expect(withoutFrontmatterTagStarts(text)).toBe(text)
    }
  })

  it("agrees with the frontmatter that mermaid.js reads, for texts where only a frontmatter has a title to read", () => {
    const closedByBlanks = "---\ntitle: <a\n---   \nflowchart LR\nA\n"
    const closedWithoutBreak = "---\ntitle: <a\n---"
    const leadingNewline = "\n---\ntitle: <a\n---\nflowchart LR\nA\n"
    expect(extractFrontmatterTitle(closedByBlanks)).toBe("<a")
    expect(withoutFrontmatterTagStarts(closedByBlanks)).not.toBe(closedByBlanks)
    expect(extractFrontmatterTitle(leadingNewline)).toBeUndefined()
    expect(withoutFrontmatterTagStarts(leadingNewline)).toBe(leadingNewline)
    expect(extractFrontmatterTitle(closedWithoutBreak)).toBeUndefined()
    expect(withoutFrontmatterTagStarts(closedWithoutBreak)).toBe(
      closedWithoutBreak,
    )
  })
})

describe("specifiedRunOf: marks that have no other reading", () => {
  it("gives nothing for an input without a mark", async () => {
    expect(
      await specifiedRunOf("sequenceDiagram\nA->>B: x\n", undefined, undefined),
    ).toBeUndefined()
  })

  it("gives nothing for the mark of a divergence where the specification differs without another reading of mermaid.js", async () => {
    for (const mark of MARKS_WITHOUT_READING) {
      expect(
        await specifiedRunOf("sequenceDiagram\nA->>B: x\n", mark, undefined),
        mark,
      ).toBeUndefined()
    }
  })

  it("gives nothing for a text that is no mark", async () => {
    expect(
      await specifiedRunOf("sequenceDiagram\nA->>B: x\n", "other", undefined),
    ).toBeUndefined()
  })
})

describe("specifiedRunOf: embedded-data-opaque", () => {
  it("removes only acceptance keys from derived configuration, retaining a body YAML form", async () => {
    const cases = [
      {
        diagram: "gitgraph",
        name: "div-frontmatter-main-branch-duplicate-default-accepted",
        reference:
          "---\nconfig:\n  gitGraph: {}\n---\ngitGraph\ncommit\nbranch dev\n",
      },
      {
        diagram: "gitgraph",
        name: "div-init-main-branch-duplicate-default-accepted",
        reference:
          "---\nconfig:\n  gitGraph: {}\n---\n\ngitGraph\ncommit\nbranch dev\n",
      },
      {
        diagram: "pie",
        name: "lex-yaml-three-adjacent-fences",
      },
    ] as const
    for (const row of cases) {
      const fixture = (await loadFixtures(row.diagram)).find(
        (entry) => entry.name === row.name,
      )
      if (fixture === undefined) throw new Error(`missing fixture: ${row.name}`)
      expect(await opaqueReferenceInput(fixture.input, fixture.config)).toBe(
        "reference" in row ? row.reference : fixture.input,
      )
    }
  }, 10_000)

  it("keeps Mermaid's title when removing an acceptance key", async () => {
    const fixture = (await loadFixtures("gitgraph")).find(
      (entry) => entry.name === "div-frontmatter-main-branch-preserves-title",
    )
    if (fixture === undefined) throw new Error("missing title fixture")
    const run = await specifiedRunOf(fixture.input, OPAQUE_MARK, fixture.config)
    expect(dbOf(run)).toMatchObject({
      title: "T",
      branches: [{ name: "main" }, { name: "dev" }],
    })
    expect(run?.embedded?.title).toBe("T")
    expect(run?.embedded?.config.gitGraph).toMatchObject({
      mainBranchName: "main",
    })
  })

  it("keeps a valid wrap directive when omitting invalid frontmatter", async () => {
    const fixture = (await loadFixtures("sequence")).find(
      (entry) =>
        entry.name === "div-invalid-frontmatter-preserves-wrap-directive",
    )
    if (fixture === undefined) throw new Error("missing wrap fixture")
    expect(await opaqueReferenceInput(fixture.input, fixture.config)).toBe(
      '%%{init: {"wrap": true}}%%\nsequenceDiagram\nA->>B: x\n',
    )
    const run = await specifiedRunOf(fixture.input, OPAQUE_MARK, fixture.config)
    expect(dbOf(run).messages).toEqual([
      expect.objectContaining({ message: "x", wrap: true }),
    ])
    expect(run?.embedded?.config.wrap).toBe(true)
  })

  for (const name of [
    "div-frontmatter-html-labels-default-comparison",
    "div-init-html-labels-default-comparison",
  ])
    it(`uses default escaping for ${name}`, async () => {
      const fixture = (await loadFixtures("gitgraph")).find(
        (entry) => entry.name === name,
      )
      if (fixture === undefined) throw new Error(`missing fixture: ${name}`)
      const run = await specifiedRunOf(
        fixture.input,
        OPAQUE_MARK,
        fixture.config,
      )
      expect(firstLine(run)).toContain("Trying to create an existing branch")
    })

  it("leaves valid frontmatter, unrelated configuration and directives as written", async () => {
    for (const [diagram, name] of [
      ["pie", "frontmatter-html"],
      ["common", "config-two-inits-merged"],
    ] as const) {
      const fixture = (await loadFixtures(diagram)).find(
        (entry) => entry.name === name,
      )
      if (fixture === undefined) throw new Error(`missing fixture: ${name}`)
      expect(await opaqueReferenceInput(fixture.input, fixture.config)).toBe(
        fixture.input,
      )
    }
  })

  it("preserves other settings in the same configuration as an acceptance key", async () => {
    const fixture = (await loadFixtures("gitgraph")).find(
      (entry) => entry.name === "docs-syntax-gitgraph-2ea99686",
    )
    if (fixture === undefined) throw new Error("missing gitgraph docs fixture")
    const text = await opaqueReferenceInput(fixture.input, fixture.config)
    const reading = await readMermaidConfiguration(text)
    expect(reading).toMatchObject({
      accepted: true,
      config: {
        logLevel: "debug",
        theme: "base",
        gitGraph: { showBranches: true, showCommitLabel: true },
      },
    })
    if (!reading.accepted) throw new Error("expected valid configuration")
    expect(reading.config.gitGraph).not.toHaveProperty("mainBranchName")
  })

  it("omits an init block rejected by configuration's second detection scan", async () => {
    const fixture = (await loadFixtures("common")).find(
      (entry) => entry.name === "config-init-detection-rejects",
    )
    if (fixture === undefined) throw new Error("missing detection fixture")
    expect(await opaqueReferenceInput(fixture.input, fixture.config)).toBe(
      "\nerror\n%% x",
    )
    expect(
      await specifiedRunOf(fixture.input, OPAQUE_MARK, fixture.config),
    ).toMatchObject({
      outcome: { accepted: true, diagramType: "error", db: {} },
    })
  })

  it("derives configuration without reading opaque statements and restores the parser", async () => {
    const fixture = (await loadFixtures("flowchart")).find(
      (entry) => entry.name === "div-data-unknown-shape",
    )
    if (fixture === undefined) throw new Error("missing shape fixture")
    expect(await readMermaidConfiguration(fixture.input)).toMatchObject({
      accepted: true,
      config: {},
    })
    expect(
      (await runMermaidWithEmbeddedData(fixture.input)).outcome.accepted,
    ).toBe(false)
  })

  for (const row of [
    { name: "docs-community-contributing-05cdc44b", accepted: false },
    { name: "docs-syntax-gitgraph-2ea99686", accepted: false },
    {
      name: "div-frontmatter-main-branch-checkout-default-accepted",
      accepted: true,
    },
    {
      name: "div-frontmatter-main-branch-duplicate-default-accepted",
      accepted: true,
    },
    { name: "div-init-main-branch-duplicate-default-accepted", accepted: true },
  ])
    it(`uses default acceptance for ${row.name}`, async () => {
      const fixture = (await loadFixtures("gitgraph")).find(
        (entry) => entry.name === row.name,
      )
      if (fixture === undefined) throw new Error(`missing fixture: ${row.name}`)
      const run = await specifiedRunOf(
        fixture.input,
        OPAQUE_MARK,
        fixture.config,
      )
      expect(run?.outcome.accepted).toBe(row.accepted)
      if (row.accepted) {
        expect(dbOf(run).commits).toEqual([
          {
            id: "generated-commit-1",
            seq: 0,
            type: 0,
            tags: [],
            parents: [],
            branch: "main",
          },
        ])
      } else {
        expect(firstLine(run)).toContain("Trying to checkout branch")
      }
    })

  for (const row of [
    {
      diagram: "flowchart",
      name: "div-data-unknown-shape",
      diagramType: "flowchart-v2",
    },
    {
      diagram: "kanban",
      name: "gram-metadata-bad-yaml",
      diagramType: "kanban",
    },
    {
      diagram: "usecase",
      name: "div-gram-json-unquoted-key",
      diagramType: "usecase",
    },
  ] as const)
    it(`records acceptance without a comparison Db for ${row.diagram}/${row.name}`, async () => {
      const fixture = (await loadFixtures(row.diagram)).find(
        (entry) => entry.name === row.name,
      )
      if (fixture === undefined) throw new Error(`missing fixture: ${row.name}`)
      expect(
        await specifiedRunOf(fixture.input, OPAQUE_MARK, fixture.config),
      ).toEqual({
        outcome: { accepted: true, diagramType: row.diagramType, db: null },
        embedded: undefined,
      })
    })
})

describe("specifiedRunOf: c4-keyword-anywhere", () => {
  const SEQUENCE_WITH_KEYWORD = "sequenceDiagram\nA->>B: C4Container"

  it("reads the input as the diagram of its header: the specification accepts what mermaid.js rejects", async () => {
    expect(
      (await runMermaidWithEmbeddedData(SEQUENCE_WITH_KEYWORD)).outcome
        .accepted,
    ).toBe(false)
    const run = await specifiedRunOf(
      SEQUENCE_WITH_KEYWORD,
      "c4-keyword-anywhere",
      undefined,
    )
    expect(run?.outcome.accepted).toBe(true)
    expect(
      (dbOf(run).messages as { message: string }[]).map(
        ({ message }) => message,
      ),
    ).toEqual(["C4Container"])
  })

  it("gives what mermaid.js gives for a C4 diagram", async () => {
    const input = 'C4Container\n  Container(a, "A")\n'
    expect(
      await specifiedRunOf(input, "c4-keyword-anywhere", undefined),
    ).toEqual(await runMermaidWithEmbeddedData(input))
  })

  it("takes only its own removal out, not the removals of the other marks", async () => {
    const input = "sequenceDiagram\np%% carticipant A\nA->>B: C4Container\n"
    expect(
      (await specifiedRunOf(input, "c4-keyword-anywhere", undefined))?.outcome
        .accepted,
    ).toBe(true)
    expect(
      (await specifiedRunOf(input, "comment-takes-character", undefined))
        ?.outcome.accepted,
    ).toBe(false)
  })
})

describe("specifiedRunOf: marks of lexer rules", () => {
  /** `comment-takes-character` reads `p%%` as a keyword's first letter. */
  const SEQUENCE_COMMENT_AFTER_LETTER =
    "sequenceDiagram\np%% carticipant A\nA->>B: x\n"

  /** Joins the next line to the comment after a name: mermaid.js rejects it. */
  const CLASS_COMMENT_AFTER_NAME = "classDiagram\nA %% c\nclass Z\n"

  /**
   * Accepted only when both `comment-takes-line-break` and
   * `name-start-reads-unit` are taken out: the first line is rejected through
   * the one rule, the third and the fourth through the other.
   */
  const CLASS_NEEDS_BOTH = "classDiagram\nclass `note`\nA %% c\nclass Z\n"

  it("reads the input without comment-takes-character: the specification rejects what mermaid.js accepts", async () => {
    expect(
      (await runMermaidWithEmbeddedData(SEQUENCE_COMMENT_AFTER_LETTER)).outcome
        .accepted,
    ).toBe(true)
    const run = await specifiedRunOf(
      SEQUENCE_COMMENT_AFTER_LETTER,
      "comment-takes-character",
      undefined,
    )
    expect(firstLine(run)).toBe("Parse error on line 2:")
    expect(run?.embedded).toBeUndefined()
  })

  it("gives what mermaid.js gives for an input that comment-takes-character changes nothing in", async () => {
    const input = "sequenceDiagram\nA->>B: x\n"
    expect(
      await specifiedRunOf(input, "comment-takes-character", undefined),
    ).toEqual(await runMermaidWithEmbeddedData(input))
  })

  it("reads the input without comment-takes-line-break and name-start-reads-unit, whichever the mark: the specification accepts what mermaid.js rejects", async () => {
    expect(
      (await runMermaidWithEmbeddedData(CLASS_COMMENT_AFTER_NAME)).outcome
        .accepted,
    ).toBe(false)
    for (const mark of ["comment-takes-line-break", "name-start-reads-unit"]) {
      const run = await specifiedRunOf(
        CLASS_COMMENT_AFTER_NAME,
        mark,
        undefined,
      )
      expect(run?.outcome.accepted, mark).toBe(true)
      expect(classIds(run), mark).toEqual(["Z"])
    }
  })

  it("takes both class rules out together, for an input that is read as the specification reads it only then", async () => {
    for (const removed of [
      ["comment-takes-line-break"],
      ["name-start-reads-unit"],
    ] as const) {
      const alone = await runMermaidWithEmbeddedData(CLASS_NEEDS_BOTH, {
        withoutDivergences: removed,
      })
      expect(alone.outcome.accepted, removed.join()).toBe(false)
    }
    for (const mark of ["comment-takes-line-break", "name-start-reads-unit"]) {
      const run = await specifiedRunOf(CLASS_NEEDS_BOTH, mark, undefined)
      expect(classIds(run), mark).toEqual(["note", "Z"])
    }
  })

  it("gives the same reading for both class marks", async () => {
    expect(
      await specifiedRunOf(CLASS_NEEDS_BOTH, "comment-takes-line-break", {}),
    ).toEqual(
      await specifiedRunOf(CLASS_NEEDS_BOTH, "name-start-reads-unit", {}),
    )
  })

  it("takes the three gantt rules out together, for an input that is read as the specification reads it only then", async () => {
    // A `%` comment right after the header takes its line feed, and the `%%{`
    // on the next line is then directly after the header.
    const text = "gantt% c\n%%{ }%%"
    for (const removed of [
      ["comment-takes-character"],
      ["comment-takes-line-break", "percent-brace-after-unit"],
    ] as const) {
      const partly = await runMermaidWithEmbeddedData(text, {
        withoutDivergences: removed,
      })
      expect(partly.outcome.accepted, removed.join()).toBe(removed.length === 2)
    }
    for (const mark of [
      "comment-takes-character",
      "comment-takes-line-break",
      "percent-brace-after-unit",
    ]) {
      const run = await specifiedRunOf(text, mark, undefined)
      expect(run?.outcome.accepted, mark).toBe(true)
    }
  })

  it("takes both xychart rules out together, for an input that is read as the specification reads it only then", async () => {
    // The comment takes the `]`, and the title with a digit follows an axis
    // statement: each rule alone leaves the input rejected.
    const text = "xychart\nx-axis A; line [1]%% c\ntitle Q1\n"
    for (const removed of [
      ["comment-takes-character"],
      ["title-digit-after-axis-statement"],
    ] as const) {
      const alone = await runMermaidWithEmbeddedData(text, {
        withoutDivergences: removed,
      })
      expect(alone.outcome.accepted, removed.join()).toBe(false)
    }
    for (const mark of [
      "comment-takes-character",
      "title-digit-after-axis-statement",
    ]) {
      const run = await specifiedRunOf(text, mark, undefined)
      expect(run?.outcome.accepted, mark).toBe(true)
      expect(dbOf(run).title, mark).toBe("Q1")
    }
  })

  it("reads with the site configuration, whose values the embedded configuration has", async () => {
    const run = await specifiedRunOf(
      CLASS_COMMENT_AFTER_NAME,
      "comment-takes-line-break",
      { flowchart: { inheritDir: true } },
    )
    expect(run?.embedded?.config).toMatchObject({
      flowchart: { inheritDir: true },
    })
    const withoutSite = await specifiedRunOf(
      CLASS_COMMENT_AFTER_NAME,
      "comment-takes-line-break",
      undefined,
    )
    expect(withoutSite?.embedded?.config).toMatchObject({
      flowchart: { inheritDir: false },
    })
  })

  it("keeps the title and the configuration of the frontmatter in the reading of a rejected input too, as far as mermaid.js gives them", async () => {
    const input = "---\ntitle: T\n---\nclassDiagram\nA %% c\nclass Z\n"
    const run = await specifiedRunOf(
      input,
      "comment-takes-line-break",
      undefined,
    )
    expect(run?.outcome.accepted).toBe(true)
    expect(run?.embedded?.title).toBe("T")
  })
})

describe("specifiedRunOf: html-tag-in-frontmatter", () => {
  it("uses Mermaid's converted frontmatter title for pie as for the other diagram types", async () => {
    const fixture = (await loadFixtures("pie")).find(
      (entry) => entry.name === "frontmatter-html",
    )
    if (fixture === undefined) throw new Error("missing pie HTML title fixture")
    expect(fixture.knownDivergence).toBeUndefined()
    const mermaid = await runMermaidWithEmbeddedData(fixture.input)
    const specified = await specifiedRunOf(
      fixture.input,
      HTML_TAG_MARK,
      fixture.config,
    )
    expect(dbOf(mermaid).title).toBe("<b class='x'>Front</b> &amp;")
    expect(dbOf(specified).title).toBe("<b class='x'>Front</b> &amp;")
    expect(specified?.embedded?.title).toBe("<b class='x'>Front</b> &amp;")
    expect(
      await specifiedRunOf(
        fixture.input,
        fixture.knownDivergence,
        fixture.config,
      ),
    ).toBeUndefined()
  })

  it("reads the input with the `<` of the frontmatter replaced by `(`: the specification rejects what mermaid.js accepts", async () => {
    const input = '---\ntitle: <a\n---\nflowchart LR\nA[b="c">d]\n'
    expect((await runMermaidWithEmbeddedData(input)).outcome.accepted).toBe(
      true,
    )
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(firstLine(run)).toBe("Parse error on line 2:")
    expect(run?.embedded).toBeUndefined()
  })

  it("gives the rejection itself where mermaid.js rejects both the input and the input with `(`", async () => {
    const input = "---\ntitle: <a\n---\nflowchart LR\nA -->\n"
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(run).toEqual(
      await runMermaidWithEmbeddedData(
        "---\ntitle: (a\n---\nflowchart LR\nA -->\n",
      ),
    )
    expect(firstLine(run)).toBe("Parse error on line 4:")
  })

  it("finds the tag in any key of the frontmatter, in one with CRLF line breaks, and in one whose closing line has blanks after it", async () => {
    for (const input of [
      '---\ndescription: <a\n---\nflowchart LR\nA[b="c">d]\n',
      '---\r\ntitle: <a\r\n---\r\nflowchart LR\r\nA[b="c">d]\r\n',
      '---\ntitle: <a\n---   \nflowchart LR\nA[b="c">d]\n',
    ]) {
      const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
      expect(firstLine(run), JSON.stringify(input)).toBe(
        "Parse error on line 2:",
      )
    }
  })

  it("takes the Db of the reading, and the title of the frontmatter as written, where both readings accept the input", async () => {
    const input = '---\ntitle: <a\n---\nflowchart LR\naccTitle: b="c">d\nA\n'
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    const written = await runMermaidWithEmbeddedData(input)
    // mermaid.js rewrites `="c"` to `='c'` for the tag of the title.
    expect(dbOf(written).accTitle).toBe("b='c'>d")
    expect(dbOf(run).accTitle).toBe('b="c">d')
    expect(dbOf(run).title).toBe("<a")
    expect(run?.embedded).toEqual(written.embedded)
    expect(run?.embedded?.title).toBe("<a")
  })

  it("writes `'` for a `\"` after an `=` in the title of a tag of the frontmatter, as mermaid.js gives it", async () => {
    const input = '---\ntitle: <a z="\n---\nflowchart LR\nA[<b x="y">t]\n'
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(run?.outcome.accepted).toBe(true)
    expect(dbOf(run).title).toBe("<a z='")
    expect(run?.embedded?.title).toBe("<a z='")
  })

  it("takes the embedded values of the reference where mermaid.js rejects the input as written: a `<` in a value of the configuration is then `(`", async () => {
    const input =
      '---\nconfig:\n  flowchart:\n    curve: <a z="\n---\nflowchart LR\nA[<b x="y">t]\n'
    const written = await runMermaidWithEmbeddedData(input)
    expect(written.outcome.accepted).toBe(false)
    expect(written.embedded).toBeUndefined()
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(run?.outcome.accepted).toBe(true)
    expect(run?.embedded?.config).toMatchObject({
      flowchart: { curve: '(a z="' },
    })
    expect(run?.embedded?.title).toBeUndefined()
  })

  it("takes the embedded values of the input as written where mermaid.js accepts it", async () => {
    // mermaid.js drops the `<` of a configuration value (`basis` stays); the
    // input with `(` would give `(a`.
    const input =
      "---\nconfig:\n  flowchart:\n    curve: <a\n---\nflowchart LR\nA\n"
    const written = await runMermaidWithEmbeddedData(input)
    const reference = await runMermaidWithEmbeddedData(
      "---\nconfig:\n  flowchart:\n    curve: (a\n---\nflowchart LR\nA\n",
    )
    expect(reference.embedded?.config).toMatchObject({
      flowchart: { curve: "(a" },
    })
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(run?.embedded).toEqual(written.embedded)
    expect(run?.embedded?.config).not.toEqual(reference.embedded?.config)
  })

  it("leaves the title of the Db alone where it is not the title of the frontmatter", async () => {
    const input = "---\ntitle: <a\n---\nsequenceDiagram\ntitle: Own\nA->>B: x\n"
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(dbOf(run).title).toBe("Own")
    expect(run?.embedded?.title).toBe("<a")
  })

  it("gives the title as written to the Db and embedded where the Db has the title of the frontmatter", async () => {
    const input = "---\ntitle: <a\n---\nsequenceDiagram\nA->>B: x\n"
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(dbOf(run).title).toBe("<a")
    expect(run?.embedded?.title).toBe("<a")
  })

  it("keeps an undrawn treeView title in embedded values only", async () => {
    const input = "---\ntitle: <a\n---\ntreeView-beta\n"
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(run?.outcome).toEqual({
      accepted: true,
      diagramType: "treeView",
      db: { accTitle: "", accDescr: "", nodes: [] },
    })
    expect(run?.embedded?.title).toBe("<a")
  })

  it("keeps the Db and the embedded values as mermaid.js gives them where the frontmatter has no title", async () => {
    const input = "---\ndescription: <a\n---\nflowchart LR\nA\n"
    const run = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(run).toEqual(await runMermaidWithEmbeddedData(input))
    expect(run?.embedded?.title).toBeUndefined()
    expect(dbOf(run).title).toBe("")
  })

  it("reads with the site configuration", async () => {
    const input = "---\ntitle: <a\n---\nflowchart LR\nsubgraph S\nA\nend\n"
    const run = await specifiedRunOf(input, HTML_TAG_MARK, {
      flowchart: { inheritDir: true },
    })
    expect(run?.embedded?.config).toMatchObject({
      flowchart: { inheritDir: true },
    })
    expect(
      (dbOf(run).subgraphs as { id: string; dir?: string }[]).map(
        (subgraph) => [subgraph.id, subgraph.dir],
      ),
    ).toEqual([["S", "LR"]])
  })

  it("reads an input without a frontmatter as it is", async () => {
    const input = "flowchart LR\nA[<b>x]\n"
    expect(await specifiedRunOf(input, HTML_TAG_MARK, undefined)).toEqual(
      await runMermaidWithEmbeddedData(input),
    )
  })

  it("gives the rejection itself where the YAML of the frontmatter is invalid as written, and the replacement is not the cause", async () => {
    const input = "---\ntitle: <a\nfoo: [\n---\nflowchart LR\nA\n"
    const reading = await specifiedRunOf(input, HTML_TAG_MARK, undefined)
    expect(reading?.outcome.accepted).toBe(false)
    if (reading === undefined || reading.outcome.accepted) return
    expect(reading.outcome.error.name).toBe("YAMLException")
  })

  it("stops where the replacement made the YAML of the frontmatter invalid", async () => {
    // `<a` and `(a` are two keys of one mapping after the replacement.
    await expect(
      specifiedRunOf(
        "---\n<a: 1\n(a: 2\n---\nflowchart LR\nA\n",
        HTML_TAG_MARK,
        undefined,
      ),
    ).rejects.toThrow(
      "the replacement of `<` in the frontmatter made its YAML invalid, so the specified reading cannot be taken from mermaid.js; decide how it is made for this fixture",
    )
  })
})

describe("withoutBarePercentLinesBeforeHeader", () => {
  it("does not move a block after a bare line to the detection point or the source start", () => {
    for (const text of [
      "%%\n---\na: b\n---\nerror\n",
      "%%{!}%%\n---\nignored\n---\nradar-beta\naxis A",
      "---\ntitle: Front\n---\n%%\n---\nignored\n---\nradar-beta\naxis A",
      "---\ntitle: Front\n---\n%%{!}%%\n%%\n\u00a0\n---\nignored\n---\nradar-beta\naxis A",
      "---\ntitle: Front\n---\n%%\n%%{init: {}}%%---\nignored\n---\nradar-beta\naxis A",
    ]) {
      expect(withoutBarePercentLinesBeforeHeader(text)).toBe(text)
    }
  })

  it("still passes a block at the detection point after a source directive", () => {
    expect(
      withoutBarePercentLinesBeforeHeader(
        "---\ntitle: Front\n---\n%%{init: {}}%%\n---\nignored\n---\n%%\n\u00a0radar-beta\naxis A",
      ),
    ).toBe(
      "---\ntitle: Front\n---\n%%{init: {}}%%\n---\nignored\n---\nradar-beta\naxis A",
    )
  })

  it("keeps nonleading YAML before removing a bare line and its Unicode trivia", () => {
    expect(
      withoutBarePercentLinesBeforeHeader(
        "%% c\n---\nx: y\n---\n%%\n\u2028pie",
      ),
    ).toBe("%% c\n---\nx: y\n---\npie")
    expect(
      withoutBarePercentLinesBeforeHeader(
        "%% c\n---\nx: y\n---\n%%\n\ufeffpie",
      ),
    ).toBe("%% c\n---\nx: y\n---\npie")
  })

  it("keeps a second-scan directive rather than dropping its opener as a bare line", () => {
    expect(
      withoutBarePercentLinesBeforeHeader("%%{\n%% c\nwrap}%%\n%%\n\u2028pie"),
    ).toBe("%%{\n%% c\nwrap}%%\npie")
    expect(
      withoutBarePercentLinesBeforeHeader("%%{\n%% c\nwrap}%%\n%%\n\ufeffpie"),
    ).toBe("%%{\n%% c\nwrap}%%\npie")
  })

  it("passes a bare line's trivia between retained YAML and a second-scan directive", () => {
    expect(
      withoutBarePercentLinesBeforeHeader(
        "%% c\n---\nx: y\n---\n%%\n\u2028%%{\n%% gap\nwrap}%%\npie",
      ),
    ).toBe("%% c\n---\nx: y\n---\n%%{\n%% gap\nwrap}%%\npie")
  })

  it("drops a line of `%%` alone before the header", () => {
    expect(
      withoutBarePercentLinesBeforeHeader("%%\nflowchart LR\nA-->B\n"),
    ).toBe("flowchart LR\nA-->B\n")
  })

  it("drops a line `%%{ }%%`, which is no directive", () => {
    expect(
      withoutBarePercentLinesBeforeHeader("%%{ }%%\nflowchart LR\nA-->B\n"),
    ).toBe("flowchart LR\nA-->B\n")
  })

  it("drops the lines of whitespace only among the lines before the header", () => {
    expect(
      withoutBarePercentLinesBeforeHeader("%%\n  \nclassDiagram\nclass A\n"),
    ).toBe("classDiagram\nclass A\n")
    expect(
      withoutBarePercentLinesBeforeHeader(
        "%%{ }%%\n  \nclassDiagram\nclass A\n",
      ),
    ).toBe("classDiagram\nclass A\n")
  })

  it("keeps a comment line and a directive before the header, with the lines a directive spans", () => {
    expect(
      withoutBarePercentLinesBeforeHeader(
        "%% c\n%%\n%%{init: {}}%%\n \nflowchart LR\n",
      ),
    ).toBe("%% c\n%%{init: {}}%%\nflowchart LR\n")
    expect(
      withoutBarePercentLinesBeforeHeader(
        "%%{init:\n {}}%%\n%%\nflowchart LR\n",
      ),
    ).toBe("%%{init:\n {}}%%\nflowchart LR\n")
  })

  it("drops the whitespace around a directive on its line, which would be a line of whitespace only without it", () => {
    expect(
      withoutBarePercentLinesBeforeHeader(
        "%%\n  %%{init: {}}%%\nclassDiagram\nclass A\n",
      ),
    ).toBe("%%{init: {}}%%\nclassDiagram\nclass A\n")
    expect(
      withoutBarePercentLinesBeforeHeader("  %%{init: {}}%%  \nflowchart LR\n"),
    ).toBe("%%{init: {}}%%\nflowchart LR\n")
  })

  it("drops a line of a tab only, a line `%%{}`, and a line `%%{-x}%%`, none of which is a directive", () => {
    expect(
      withoutBarePercentLinesBeforeHeader("%%\n\t\nclassDiagram\nclass A\n"),
    ).toBe("classDiagram\nclass A\n")
    expect(withoutBarePercentLinesBeforeHeader("%%{}\nstateDiagram-v2\n")).toBe(
      "stateDiagram-v2\n",
    )
    expect(
      withoutBarePercentLinesBeforeHeader("%%{-x}%%\nflowchart LR\n"),
    ).toBe("flowchart LR\n")
  })

  it("changes nothing after the header", () => {
    const text = "flowchart LR\n%%\n  \nA\n%%{ }%%\n"
    expect(withoutBarePercentLinesBeforeHeader(text)).toBe(text)
  })

  it("starts after the frontmatter, with its closing line", () => {
    expect(
      withoutBarePercentLinesBeforeHeader(
        "---\ntitle: x\n---\n%%\nflowchart LR\n",
      ),
    ).toBe("---\ntitle: x\n---\nflowchart LR\n")
  })

  it("takes CRLF and a lone CR as the ends of the lines", () => {
    expect(withoutBarePercentLinesBeforeHeader("%%\r\n\r\nflowchart LR")).toBe(
      "flowchart LR",
    )
    expect(withoutBarePercentLinesBeforeHeader("%%\r  \rflowchart LR")).toBe(
      "flowchart LR",
    )
  })
})

describe("specifiedRunOf: bare-percent-line-before-header", () => {
  it("preserves rejection when bare lines precede a retained block", async () => {
    const fixtures = await loadFixtures("radar")
    for (const name of [
      "retained-between-trivia",
      "retained-after-bare-with-directive",
    ]) {
      const fixture = fixtures.find((entry) => entry.name === name)
      if (fixture === undefined) throw new Error(`missing radar/${name}`)
      const written = await runMermaidWithEmbeddedData(fixture.input)
      const reference = await specifiedRunOf(
        fixture.input,
        BARE_PERCENT_MARK,
        fixture.config,
      )
      expect(firstLine(written)).toContain(
        "Diagrams beginning with --- are not valid",
      )
      expect(reference, name).toEqual(written)
    }
  })

  it("reads the five inputs of the divergence as accepted, with the diagram of their header, where mermaid.js rejects them", async () => {
    const [flowchart, braces, state, classPercent, classBraces] =
      await Promise.all(
        [
          "%%\nflowchart LR\nA-->B\n",
          "%%{ }%%\nflowchart LR\nA-->B\n",
          "%%{ }%%\nstateDiagram-v2\n[*] --> A\n",
          "%%\n  \nclassDiagram\nclass A\n",
          "%%{ }%%\n  \nclassDiagram\nclass A\n",
        ].map((input) => specifiedRunOf(input, BARE_PERCENT_MARK, undefined)),
      )
    for (const [run, diagramType] of [
      [flowchart, "flowchart-v2"],
      [braces, "flowchart-v2"],
      [state, "stateDiagram"],
      [classPercent, "classDiagram"],
      [classBraces, "classDiagram"],
    ] as const) {
      expect(run?.outcome.accepted, diagramType).toBe(true)
      if (run === undefined || !run.outcome.accepted) continue
      expect(run.outcome.diagramType).toBe(diagramType)
    }
    expect(classIds(classPercent)).toEqual(["A"])
  })

  it("gives the result of mermaid.js for an input without such a line", async () => {
    const plain = await runMermaidWithEmbeddedData("flowchart LR\nA-->B\n", {})
    const read = await specifiedRunOf(
      "flowchart LR\nA-->B\n",
      BARE_PERCENT_MARK,
      undefined,
    )
    expect(read).toEqual(plain)
  })
})

describe("withoutBlankLinesAfterHeader", () => {
  it("takes out the empty lines and the lines of whitespace only after the header", () => {
    expect(withoutBlankLinesAfterHeader("mindmap\n\n  root\n")).toBe(
      "mindmap\n  root\n",
    )
    expect(withoutBlankLinesAfterHeader("mindmap\n \t\n  root\n")).toBe(
      "mindmap\n  root\n",
    )
    expect(
      withoutBlankLinesAfterHeader("mindmap\nroot\n\n   \n  child\n"),
    ).toBe("mindmap\nroot\n  child\n")
  })

  it("takes out the whitespace that ends the header line", () => {
    expect(withoutBlankLinesAfterHeader("mindmap  \nroot\n")).toBe(
      "mindmap\nroot\n",
    )
  })

  it("keeps the comment lines and takes out the blank line after them", () => {
    expect(withoutBlankLinesAfterHeader("mindmap\n%% c\n\nroot\n")).toBe(
      "mindmap\n%% c\nroot\n",
    )
    expect(withoutBlankLinesAfterHeader("mindmap %% c\n%%\n\nroot\n")).toBe(
      "mindmap %% c\n%%\nroot\n",
    )
  })

  it("keeps the lines before the header, and the node lines as they are", () => {
    expect(
      withoutBlankLinesAfterHeader("\n%% c\n  \nmindmap\n\n  root   \n"),
    ).toBe("\n%% c\n  \nmindmap\n  root   \n")
  })

  it("moves a directive off a line that is left empty, to a line before the header", () => {
    expect(
      withoutBlankLinesAfterHeader("mindmap\n%%{init: {}}%%\n  root\n"),
    ).toBe("%%{init: {}}%%\nmindmap\n  root\n")
    expect(withoutBlankLinesAfterHeader("mindmap %%{init: {}}%%\nroot\n")).toBe(
      "%%{init: {}}%%\nmindmap\nroot\n",
    )
  })

  it("moves a directive that stands on a node line to a line before the header", () => {
    expect(
      withoutBlankLinesAfterHeader("mindmap\n\n  root%%{init: {}}%%\n"),
    ).toBe("%%{init: {}}%%\nmindmap\n  root\n")
  })

  it("puts a line feed before a U+2028 or a U+2029 that ends a comment when a statement follows on the line", () => {
    expect(withoutBlankLinesAfterHeader("mindmap %% c\u2028root\n")).toBe(
      "mindmap %% c\n\u2028root\n",
    )
    expect(
      withoutBlankLinesAfterHeader(
        "mindmap\nroot\n  a[x] %% c\n%%{ }%%\u2029  b\n",
      ),
    ).toBe("mindmap\nroot\n  a[x] %% c\n%%{ }%%\n\u2029  b\n")
  })

  it("leaves out a separator that ends a comment with only whitespace after it, and leaves one in the text of a node", () => {
    expect(
      withoutBlankLinesAfterHeader("mindmap\nroot\n  a[x] %% c\u2028\n  b\n"),
    ).toBe("mindmap\nroot\n  a[x] %% c\n  b\n")
    expect(withoutBlankLinesAfterHeader("mindmap\n\nroot %% c\u2028 b\n")).toBe(
      "mindmap\nroot %% c\u2028 b\n",
    )
  })

  it("starts after the frontmatter", () => {
    expect(
      withoutBlankLinesAfterHeader("---\ntitle: T\n---\nmindmap\n\n  root\n"),
    ).toBe("---\ntitle: T\n---\nmindmap\n  root\n")
  })

  it("throws for a line to take out inside the text of a node that is not closed", () => {
    expect(() =>
      withoutBlankLinesAfterHeader("mindmap\n  r[a\n\n  b]\n"),
    ).toThrow("not closed yet")
  })

  it("gives a text with no line to take out as it is", () => {
    const text = "mindmap\n  root\n    child\n"
    expect(withoutBlankLinesAfterHeader(text)).toBe(text)
  })
})

describe("specifiedRunOf: blank-line-after-header-or-comments", () => {
  it("reads the inputs of the divergence as accepted, with the same tree as without the blank line, where mermaid.js rejects them", async () => {
    const reference = await runMermaidWithEmbeddedData(
      "mindmap\nroot\n  a\n%%\n  b\n",
      {},
    )
    for (const input of [
      "mindmap\n\n  root\n",
      "mindmap  \nroot\n",
      "mindmap\n%% c\n\nroot\n",
      "mindmap\n%%{init: {}}%%\n  root\n",
    ]) {
      const run = await specifiedRunOf(input, BLANK_LINES_MARK, undefined)
      expect(run?.outcome.accepted, input).toBe(true)
    }
    const read = await specifiedRunOf(
      "mindmap\nroot\n  a\n%%\n\n  b\n",
      BLANK_LINES_MARK,
      undefined,
    )
    expect(read?.outcome).toEqual(reference.outcome)
  })

  it("gives the result of mermaid.js for an input without such a line", async () => {
    const input = "mindmap\n  root\n    child\n"
    const plain = await runMermaidWithEmbeddedData(input, {})
    expect(await specifiedRunOf(input, BLANK_LINES_MARK, undefined)).toEqual(
      plain,
    )
  })
})

describe("blank-line references with multiline directives", () => {
  for (const [name, input, reference, transformed, rootText, rawAccepted] of [
    [
      "joined node text after header padding",
      "ishikawa \nR%%{wrap: {\n}}%%A\n",
      "ishikawa\nR%%{wrap: {\n}}%%A\n",
      "%%{wrap: {\n}}%%\nishikawa\nRA\n",
      "RA",
      false,
    ],
    [
      "joined node text without header padding",
      "ishikawa\nR%%{wrap: {\n}}%%A\n",
      "ishikawa\nRA\n",
      "%%{wrap: {\n}}%%\nishikawa\nRA\n",
      "RA",
      true,
    ],
    [
      "continued header comment before LS",
      "ishikawa%% x%%{wrap: {\n}}%%y\u2028 R\n",
      "ishikawa\u2028 R\n",
      "%%{wrap: {\n}}%%\nishikawa%% xy\n\u2028 R\n",
      "R",
      false,
    ],
  ] as const)
    it(`keeps directive line terminators out of ${name}`, async () => {
      expect(withoutBlankLinesAfterHeader(input)).toBe(transformed)
      const raw = await runMermaidWithEmbeddedData(input)
      expect(raw.outcome.accepted).toBe(rawAccepted)
      const control = await runMermaidWithEmbeddedData(reference)
      const specified = await specifiedRunOf(input, BLANK_LINES_MARK, undefined)
      expect(specified?.outcome).toEqual(control.outcome)
      expect(dbOf(specified).root).toEqual({ text: rootText, children: [] })
    })
})

describe("packet opaque acceptance settings", () => {
  it("records both acceptance directions and retains the frontmatter title", async () => {
    const fixtures = await loadFixtures("packet")
    for (const entry of [
      { name: "config-frontmatter-fraction", accepted: true, title: "Front" },
      { name: "config-directive-fraction", accepted: true, title: undefined },
      {
        name: "config-frontmatter-overrides-site",
        accepted: false,
        title: "Front",
      },
      {
        name: "config-directive-overrides-site",
        accepted: false,
        title: undefined,
      },
    ]) {
      const fixture = fixtures.find((value) => value.name === entry.name)
      if (fixture === undefined) throw new Error(`missing ${entry.name}`)
      const reference = await opaqueReferenceInput(
        fixture.input,
        fixture.config,
      )
      const reading = await readMermaidConfiguration(reference, {
        config: fixture.config,
      })
      expect(reading.accepted, entry.name).toBe(true)
      if (reading.accepted) {
        expect(reading.config.packet, entry.name).not.toHaveProperty(
          "bitsPerRow",
        )
        if (entry.title !== undefined)
          expect(reading.title, entry.name).toBe(entry.title)
      }
      const result = await specifiedRunOf(
        fixture.input,
        OPAQUE_MARK,
        fixture.config,
      )
      expect(result?.outcome.accepted, entry.name).toBe(entry.accepted)
      const specified = fixture.specified
      if (specified === undefined) throw new Error("missing specified reading")
      const expected = specified.accepted
        ? {
            accepted: true,
            diagramType: specified.diagramType,
            db: specified.db,
          }
        : specified
      expect(result?.outcome, entry.name).toEqual(expected)
      if (entry.accepted && entry.title !== undefined) {
        expect(dbOf(result).title).toBe(entry.title)
        expect(result?.embedded?.title).toBe(entry.title)
      }
    }
  })

  it("keeps unrelated valid configuration when omitting malformed opaque data", async () => {
    const fixture = (await loadFixtures("packet")).find(
      (entry) => entry.name === "frontmatter-invalid-keeps-config",
    )
    if (fixture === undefined) throw new Error("missing packet opaque fixture")
    const reference = await opaqueReferenceInput(fixture.input, fixture.config)
    expect(reference).toContain('%%{init:{"packet":{"showBits":false}}}%%')
    const result = await specifiedRunOf(
      fixture.input,
      OPAQUE_MARK,
      fixture.config,
    )
    expect(result?.outcome.accepted).toBe(true)
    expect(result?.embedded?.config.packet).toMatchObject({ showBits: false })
  })
})
