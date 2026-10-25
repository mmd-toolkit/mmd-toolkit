/**
 * Keeps the documents in step with the formatting fixtures: each rule of a
 * rules document, `docs/<diagram>.md`, is a fixture folder, and each example
 * in the rules documents and the READMEs is a copy of the fixture file it
 * links to.
 */
import { readdir, readFile, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { readRuleNames } from "./fixtures.ts"

const packageRoot = new URL("../", import.meta.url)

const RULE_HEADING = "### "
const FIXTURE_FILE_LINK = ".mmd)"
const EXAMPLE_LINK_END = ".mmd)):"

/**
 * The rules documents, each with the rules whose examples are not shown in
 * it, because what they are about cannot be seen in it: whitespace at the
 * ends of lines.
 */
const ruleDocuments: readonly {
  readonly diagram: string
  readonly rulesWithoutExamples: readonly string[]
  /**
   * The rules whose examples are in test code, with no fixture folder,
   * because they hold characters that no file of this package may hold:
   * U+2028 and U+2029.
   */
  readonly rulesInTestCode: readonly string[]
}[] = [
  {
    diagram: "radar",
    rulesWithoutExamples: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
    rulesInTestCode: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
  },
  {
    diagram: "architecture",
    rulesWithoutExamples: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
    rulesInTestCode: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
  },
  {
    diagram: "packet",
    rulesWithoutExamples: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
    rulesInTestCode: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
  },
  {
    diagram: "info",
    rulesWithoutExamples: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
    rulesInTestCode: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
  },
  {
    diagram: "gitgraph",
    rulesWithoutExamples: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
    rulesInTestCode: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
  },
  {
    diagram: "pie",
    rulesWithoutExamples: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
    rulesInTestCode: [
      "line-terminators-and-unicode",
      "specified-readings",
      "markdown-fences",
    ],
  },
  {
    diagram: "usecase",
    rulesWithoutExamples: ["line-terminators"],
    rulesInTestCode: ["line-terminators"],
  },
  {
    diagram: "agentflow",
    rulesWithoutExamples: ["default-size-branches", "line-terminators"],
    rulesInTestCode: ["line-terminators"],
  },
  {
    diagram: "ishikawa",
    rulesWithoutExamples: [
      "trailing-whitespace",
      "line-terminators",
      "line-separators",
    ],
    rulesInTestCode: ["line-terminators"],
  },
  {
    diagram: "flowchart",
    rulesWithoutExamples: ["style-trailing-whitespace"],
    rulesInTestCode: [],
  },
  {
    diagram: "sequence",
    rulesWithoutExamples: ["line-separators", "multi-line-statements"],
    rulesInTestCode: ["line-separators"],
  },
  {
    diagram: "class",
    rulesWithoutExamples: ["unclosed-backquoted-names"],
    rulesInTestCode: [],
  },
  {
    diagram: "state",
    rulesWithoutExamples: ["line-separators"],
    rulesInTestCode: ["line-separators"],
  },
  {
    diagram: "er",
    rulesWithoutExamples: ["line-separators"],
    rulesInTestCode: ["line-separators"],
  },
  {
    diagram: "gantt",
    rulesWithoutExamples: ["line-separators", "whitespace-characters"],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
  {
    diagram: "journey",
    rulesWithoutExamples: ["line-separators", "whitespace-characters"],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
  {
    diagram: "requirement",
    rulesWithoutExamples: ["line-separators", "whitespace-characters"],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
  {
    diagram: "mindmap",
    rulesWithoutExamples: ["line-separators", "whitespace-characters"],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
  {
    diagram: "sankey",
    rulesWithoutExamples: ["whitespace-characters"],
    rulesInTestCode: ["whitespace-characters"],
  },
  {
    diagram: "timeline",
    rulesWithoutExamples: ["line-separators", "whitespace-characters"],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
  {
    diagram: "quadrant",
    rulesWithoutExamples: [
      "multi-line-statements",
      "line-separators",
      "whitespace-characters",
    ],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
  {
    diagram: "kanban",
    rulesWithoutExamples: [
      "trailing-whitespace",
      "line-terminators",
      "whitespace-characters",
    ],
    rulesInTestCode: ["line-terminators", "whitespace-characters"],
  },
  {
    diagram: "venn",
    rulesWithoutExamples: [
      "trailing-whitespace",
      "line-terminators",
      "whitespace-characters",
    ],
    rulesInTestCode: [],
  },
  {
    diagram: "c4",
    rulesWithoutExamples: [
      "trailing-whitespace",
      "line-terminators",
      "whitespace-characters",
    ],
    rulesInTestCode: ["line-terminators", "whitespace-characters"],
  },
  {
    diagram: "block",
    rulesWithoutExamples: [
      "multi-line-statements",
      "line-separators",
      "whitespace-characters",
    ],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
  {
    diagram: "xychart",
    rulesWithoutExamples: [
      "multi-line-statements",
      "line-separators",
      "whitespace-characters",
    ],
    rulesInTestCode: ["line-separators", "whitespace-characters"],
  },
]
const EXAMPLE_OPENING = "```mmd"
const EXAMPLE_CLOSING = "```"

/** An example in a document: the fixture file it links to, and its text. */
interface Example {
  /** The heading of the rule the example is under, or null before any. */
  readonly heading: string | null
  /** The fixture file, resolved against the document. */
  readonly file: URL
  readonly text: string
}

/** A rule of a rules document: its heading and its examples. */
interface Rule {
  readonly heading: string
  readonly examples: readonly Example[]
}

/** The rule headings and the examples of a document. */
interface DocumentContents {
  readonly headings: readonly string[]
  readonly examples: readonly Example[]
}

/**
 * Reads a document, relative to the package. An example is a line that
 * ends with a link to a fixture file and `:`, followed by an empty line and
 * an `mmd` code block. Throws when such a line is not followed by its block,
 * and when a line links to a fixture file without being an example.
 */
async function readDocument(document: string): Promise<DocumentContents> {
  const url = new URL(document, packageRoot)
  const lines = (await readFile(url, "utf8")).split("\n")
  const headings: string[] = []
  const examples: Example[] = []
  let heading: string | null = null
  for (let index = 0; index < lines.length; index++) {
    const line = lines[index]
    if (line.startsWith(RULE_HEADING)) {
      heading = line.slice(RULE_HEADING.length)
      headings.push(heading)
      continue
    }
    if (!line.includes(FIXTURE_FILE_LINK)) continue
    if (!line.endsWith(EXAMPLE_LINK_END)) {
      throw new Error(
        `${document}: a link to a fixture file on a line that is not an example: ${line}`,
      )
    }
    const link = line.slice(line.lastIndexOf("](") + 2, -3)
    const closing = lines.indexOf(EXAMPLE_CLOSING, index + 3)
    if (
      lines[index + 1] !== "" ||
      lines[index + 2] !== EXAMPLE_OPENING ||
      closing === -1
    ) {
      throw new Error(`${document}: no \`text\` block after ${link}`)
    }
    examples.push({
      heading,
      file: new URL(link, url),
      text: `${lines.slice(index + 3, closing).join("\n")}\n`,
    })
    index = closing
  }
  return { headings, examples }
}

/**
 * Reads the rules of a rules document: its `###` headings, each with the
 * examples under it. Throws on an example before the first rule.
 */
async function readRules(document: string): Promise<Rule[]> {
  const { headings, examples } = await readDocument(document)
  if (examples.some((example) => example.heading === null)) {
    throw new Error(`${document}: an example comes before the first rule`)
  }
  return headings.map((heading) => ({
    heading,
    examples: examples.filter((example) => example.heading === heading),
  }))
}

/** The folder name of a rule heading: `Arrow spacing` is `arrow-spacing`. */
function folderOf(heading: string): string {
  return heading.toLowerCase().replaceAll(" ", "-")
}

/** The fixture file of an example, relative to the package. */
function relativeFile(example: Example): string {
  return example.file.href.slice(packageRoot.href.length)
}

/** The rules of a rules document, in English and in Japanese. */
const rulesByDiagram = new Map(
  await Promise.all(
    ruleDocuments.map(
      async ({ diagram }) =>
        [
          diagram,
          {
            english: await readRules(`docs/${diagram}.md`),
            japanese: await readRules(`docs/${diagram}.ja.md`),
          },
        ] as const,
    ),
  ),
)
const englishReadme = (await readDocument("README.md")).examples
const japaneseReadme = (await readDocument("README.ja.md")).examples

describe.each(ruleDocuments)(
  "the $diagram rules document",
  ({ diagram, rulesWithoutExamples, rulesInTestCode }) => {
    const { english, japanese } = rulesByDiagram.get(diagram) ?? {
      english: [],
      japanese: [],
    }

    it("has one rule for each fixture folder", async () => {
      expect(
        english
          .map((rule) => folderOf(rule.heading))
          .filter((folder) => !rulesInTestCode.includes(folder))
          .sort(),
      ).toEqual(await readRuleNames(diagram))
    })

    it("shows examples of every rule except the listed ones", () => {
      expect(
        english
          .filter((rule) => rule.examples.length === 0)
          .map((rule) => folderOf(rule.heading)),
      ).toEqual(rulesWithoutExamples)
    })

    it("links each example to a file of its rule's folder", () => {
      for (const rule of english) {
        const folder = `tests/fixtures/${diagram}/${folderOf(rule.heading)}/`
        for (const example of rule.examples) {
          expect(relativeFile(example).slice(0, folder.length)).toBe(folder)
        }
      }
    })

    it("has the same rules and examples in Japanese", () => {
      expect(japanese.map((rule) => rule.examples.map(relativeFile))).toEqual(
        english.map((rule) => rule.examples.map(relativeFile)),
      )
    })
  },
)

describe("the README", () => {
  it("has an example", () => {
    expect(englishReadme.length).toBeGreaterThan(0)
  })

  it("has the same examples in Japanese", () => {
    expect(japaneseReadme.map(relativeFile)).toEqual(
      englishReadme.map(relativeFile),
    )
  })
})

describe("the examples in the documents", () => {
  const examples = [
    ...[...rulesByDiagram.values()].flatMap(({ english, japanese }) => [
      ...english,
      ...japanese,
    ]),
    { examples: englishReadme },
    { examples: japaneseReadme },
  ].flatMap((document) => document.examples)

  it.each(examples.map((example) => [relativeFile(example), example] as const))(
    "show %s as it is",
    async (_file, example) => {
      expect(example.text).toBe(
        await readFile(fileURLToPath(example.file), "utf8"),
      )
    },
  )
})

/**
 * The titles of the cases of the test files that hold examples as test code,
 * which the documents cite as `[test: <title>]`: the title of an example, with
 * `%s` for a diagram type where a test is made for each of them.
 */
async function readCitedTestTitles(): Promise<string[]> {
  const titles: string[] = []
  const testsRoot = new URL("tests/", packageRoot)
  const files = (await readdir(testsRoot))
    .filter((file) => file.endsWith(".ts"))
    .sort()
  for (const file of files) {
    const text = await readFile(new URL(file, testsRoot), "utf8")
    for (const line of text.split("\n")) {
      const trimmed = line.trim()
      const literal = trimmed.startsWith('it("')
        ? trimmed.slice(3)
        : trimmed.startsWith("[")
          ? trimmed.slice(1).trimStart()
          : trimmed.startsWith("name: ")
            ? trimmed.slice("name: ".length)
            : trimmed
      if (!literal.startsWith('"')) continue
      let end = 1
      while (end < literal.length) {
        if (literal[end] === "\\") end += 2
        else if (literal[end] === '"') break
        else end++
      }
      if (literal[end + 1] !== ",") continue
      const title = JSON.parse(literal.slice(0, end + 1)) as string
      if (title.includes("%s")) {
        for (const { diagram } of ruleDocuments) {
          titles.push(title.replaceAll("%s", diagram))
        }
      } else {
        titles.push(title)
      }
    }
  }
  return titles
}

/** Reads bracket citations across wrapped lines, including indented lists. */
async function readCitations(
  document: string,
  kind: "corpus fixture" | "test",
): Promise<string[]> {
  const text = await readFile(new URL(document, packageRoot), "utf8")
  const oneLine = text
    .split("\n")
    .map((line) => line.trim())
    .join(" ")
  const marker = `[${kind}:`
  const citations: string[] = []
  let index = oneLine.indexOf(marker)
  while (index !== -1) {
    const end = oneLine.indexOf("]", index)
    expect(end, `${document}: unclosed ${kind} citation`).toBeGreaterThan(index)
    citations.push(oneLine.slice(index + marker.length, end).trim())
    index = oneLine.indexOf(marker, end + 1)
  }
  return citations
}

describe("the citations in the documents", async () => {
  const titles = await readCitedTestTitles()
  const citations: string[] = []
  for (const document of [
    "docs/radar.md",
    "docs/architecture.md",
    "docs/packet.md",
    "docs/info.md",
    "docs/gitgraph.md",
    "docs/pie.md",
    "docs/usecase.md",
    "docs/agentflow.md",
    "docs/flowchart.md",
    "docs/sequence.md",
    "docs/class.md",
    "docs/state.md",
    "docs/er.md",
    "docs/gantt.md",
    "docs/journey.md",
    "docs/requirement.md",
    "docs/mindmap.md",
    "docs/sankey.md",
    "docs/timeline.md",
    "docs/xychart.md",
    "docs/quadrant.md",
    "docs/block.md",
    "docs/kanban.md",
    "docs/c4.md",
    "docs/venn.md",
    "docs/ishikawa.md",
    "docs/compatibility.md",
  ]) {
    it.each([document, `${document.slice(0, -3)}.ja.md`])(
      "cites existing corpus fixtures in %s",
      async (corpusDocument) => {
        for (const citation of await readCitations(
          corpusDocument,
          "corpus fixture",
        )) {
          const input = await stat(
            new URL(`../tests/fixtures/${citation}/input.mmd`, packageRoot),
          ).catch(() => undefined)
          expect
            .soft(
              input?.isFile() ?? false,
              `${corpusDocument}: corpus fixture ${citation}/input.mmd does not exist`,
            )
            .toBe(true)
        }
      },
    )

    citations.push(...(await readCitations(document, "test")))
  }

  /** The title with its line breaks, which a document wraps at, as spaces. */
  function flat(title: string): string {
    return title.split(" ").filter(Boolean).join(" ")
  }

  it.each([...new Set(citations)].map((citation) => [citation] as const))(
    "cites a case that exists: %s",
    (citation) => {
      expect(titles.map(flat)).toContain(flat(citation))
    },
  )
})
