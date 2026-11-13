/**
 * Keeps the documents in step with the formatting fixtures: each rule of a
 * rules document, `docs/<diagram>.md`, is a fixture folder, and each example
 * in the rules documents and the READMEs is a copy of the fixture file it
 * links to. It keeps the table of the forms kept for versions of mermaid.js
 * that count in step with the table of those versions, and that table in step
 * with the pinned version of mermaid.js, in `docs/compatibility.md`.
 */
import { readdir, readFile, stat } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { mermaidVersion } from "@mmd-toolkit/tests/mermaid"
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
    diagram: "eventmodeling",
    rulesWithoutExamples: [
      "default-size-branches",
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
    diagram: "cynefin",
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
    diagram: "wardley",
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
    diagram: "railroad",
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
    diagram: "treeview",
    rulesWithoutExamples: [
      "trailing-whitespace",
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
    diagram: "treemap",
    rulesWithoutExamples: [
      "trailing-whitespace",
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
  kind: "corpus fixture" | "fixture" | "test",
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

/** The English documents of the package, which each have a Japanese pair. */
async function readDocumentNames(): Promise<string[]> {
  return (await readdir(new URL("docs/", packageRoot)))
    .filter((name) => name.endsWith(".md") && !name.endsWith(".ja.md"))
    .toSorted()
    .map((name) => `docs/${name}`)
}

/** Whether a file of the package exists. */
async function exists(path: string): Promise<boolean> {
  const found = await stat(new URL(path, packageRoot)).catch(() => undefined)
  return found?.isFile() ?? false
}

describe("the citations in the documents", async () => {
  const titles = await readCitedTestTitles()
  const diagramFolders = await readdir(new URL("tests/fixtures/", packageRoot))
  const citations: string[] = []
  for (const document of await readDocumentNames()) {
    const diagram = document.slice("docs/".length, -".md".length)
    it.each([document, `${document.slice(0, -3)}.ja.md`])(
      "cites existing corpus fixtures in %s",
      async (corpusDocument) => {
        for (const citation of await readCitations(
          corpusDocument,
          "corpus fixture",
        )) {
          expect
            .soft(
              await exists(`../tests/fixtures/${citation}/input.mmd`),
              `${corpusDocument}: corpus fixture ${citation}/input.mmd does not exist`,
            )
            .toBe(true)
        }
      },
    )

    // A fixture is cited by its path in the folder of the diagram of the
    // document, or by its path from the folder of the fixtures.
    // compatibility.md cites the fixtures of every diagram, and the check looks
    // for the fixture in the folder of each of them.
    it.each([document, `${document.slice(0, -3)}.ja.md`])(
      "cites existing fixtures in %s",
      async (fixtureDocument) => {
        const folders = diagram === "compatibility" ? diagramFolders : [diagram]
        for (const citation of await readCitations(
          fixtureDocument,
          "fixture",
        )) {
          if (citation.includes("<")) continue
          const found = await Promise.all(
            [...folders.map((folder) => `${folder}/`), ""].map((folder) =>
              exists(`tests/fixtures/${folder}${citation}-input.mmd`),
            ),
          )
          expect
            .soft(
              found.includes(true),
              `${fixtureDocument}: fixture ${citation} does not exist`,
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

  const flatTitles = new Set(titles.map(flat))

  it.each([...new Set(citations)].map((citation) => [citation] as const))(
    "cites a case that exists: %s",
    (citation) => {
      expect(flatTitles.has(flat(citation))).toBe(true)
    },
  )
})

/** The headings of the two tables of `docs/compatibility.md` that name versions. */
const versionTables = [
  {
    document: "docs/compatibility.md",
    counted: "## Versions of mermaid.js that count",
    kept: "## Forms kept for versions of mermaid.js that count",
  },
  {
    document: "docs/compatibility.ja.md",
    counted: "## 対象にする mermaid.js の版",
    kept: "## 対象にする版の mermaid.js のために残す形",
  },
]

/** The columns of the table of the forms kept, and the one that names versions. */
const KEPT_COLUMNS = 6
const NEEDED_BY_COLUMN = 4

/** The versions that count for each group of diagram types. */
const countedVersionGroups = [
  {
    diagrams: [
      "flowchart",
      "sequence",
      "class",
      "state",
      "ER",
      "gantt",
      "pie",
      "gitGraph",
      "user journey",
      "mindmap",
      "timeline",
      "requirement",
      "C4",
      "sankey",
      "xychart",
      "quadrant",
      "block",
    ],
    versions: ["10.9.8", "11.7.0", "11.17.2", "12.0.0", "12.3.0"],
  },
  {
    diagrams: ["packet", "architecture", "kanban", "radar"],
    versions: ["11.7.0", "11.17.2", "12.0.0", "12.3.0"],
  },
  {
    diagrams: ["treemap"],
    versions: ["11.8.1", "11.17.2", "12.0.0", "12.3.0"],
  },
  {
    diagrams: ["ishikawa", "Venn"],
    versions: ["11.13.0", "11.17.2", "12.0.0", "12.3.0"],
  },
  {
    diagrams: ["Wardley", "treeView"],
    versions: ["11.14.0", "11.17.2", "12.0.0", "12.3.0"],
  },
  {
    diagrams: ["eventmodeling"],
    versions: ["11.15.0", "11.17.2", "12.0.0", "12.3.0"],
  },
  {
    diagrams: ["cynefin", "railroad", "swimlane"],
    versions: ["11.16.1", "11.17.2", "12.0.0", "12.3.0"],
  },
  {
    diagrams: ["agentflow", "use case"],
    versions: ["12.0.0", "12.3.0"],
  },
]

/** The comma-separated diagram names used in the English and Japanese tables. */
function diagramNamesIn(text: string): string[] {
  return text
    .replaceAll("、", ",")
    .split(",")
    .map((name) => name.trim())
}

/** Expands the inclusive descriptions in the table's Diagram types column. */
function countedDiagramsIn(text: string): string[] {
  switch (text) {
    case "every diagram type that 10.9.8 has":
    case "10.9.8 が持つすべての図種":
      return countedVersionGroups[0].diagrams
    case "every diagram type that 11.7.0 has":
    case "11.7.0 が持つすべての図種":
      return countedVersionGroups.slice(0, 2).flatMap((group) => group.diagrams)
    case "every diagram type except agentflow and use case":
    case "agentflow と use case を除くすべての図種":
      return countedVersionGroups
        .slice(0, -1)
        .flatMap((group) => group.diagrams)
    case "every diagram type":
    case "すべての図種":
      return countedVersionGroups.flatMap((group) => group.diagrams)
    default:
      return diagramNamesIn(text)
  }
}

/** The rows of the table in the section that starts at the heading. */
function tableRowsOf(lines: readonly string[], heading: string): string[][] {
  const start = lines.indexOf(heading)
  expect(start, `no section ${heading}`).not.toBe(-1)
  const end = lines.findIndex(
    (line, index) => index > start && line.startsWith("## "),
  )
  return (
    lines
      .slice(start + 1, end === -1 ? lines.length : end)
      .filter((line) => line.startsWith("| "))
      // The first two lines of the table are its head and its rule.
      .slice(2)
      .map((line) =>
        line
          .slice(1, -1)
          .split(" | ")
          .map((cell) => cell.trim()),
      )
  )
}

/** Whether a character is an ASCII digit. */
function isDigit(character: string | undefined): boolean {
  return character !== undefined && character >= "0" && character <= "9"
}

/** The versions written as three numbers with dots, such as `11.7.0`, in a text. */
function versionsIn(text: string): string[] {
  const versions: string[] = []
  let index = 0
  while (index < text.length) {
    if (
      !isDigit(text[index]) ||
      isDigit(text[index - 1]) ||
      text[index - 1] === "."
    ) {
      index++
      continue
    }
    let end = index
    while (
      isDigit(text[end]) ||
      (text[end] === "." && isDigit(text[end + 1]))
    ) {
      end++
    }
    const version = text.slice(index, end)
    if (version.split(".").length === 3) versions.push(version)
    index = end
  }
  return versions
}

describe("the table of forms kept for versions of mermaid.js that count", () => {
  it.each(versionTables)(
    "ends with the pinned version, in $document",
    async ({ document, counted }) => {
      const text = await readFile(new URL(document, packageRoot), "utf8")
      const lines = text.split("\n")
      const versions = tableRowsOf(lines, counted).map((cells) => cells[0])
      const start = lines.indexOf(counted)
      const table = lines.findIndex(
        (line, index) => index > start && line.startsWith("| "),
      )
      const prose = lines.slice(start + 1, table).join(" ")
      const message = `${document}: the pinned version is ${mermaidVersion}: update the versions that count and the forms kept for them (.claude/skills/prettier-plugin/references/updating-mermaid.md)`
      expect(versions.at(-1), message).toBe(mermaidVersion)
      expect(versionsIn(prose), message).toEqual([mermaidVersion])
    },
  )

  it.each(versionTables)(
    "names the diagram types that each version counts for, in $document",
    async ({ document, counted }) => {
      const text = await readFile(new URL(document, packageRoot), "utf8")
      const rows = tableRowsOf(text.split("\n"), counted)
      const versions = [
        ...new Set(countedVersionGroups.flatMap((group) => group.versions)),
      ]
      expect(rows.map((cells) => cells[0]).toSorted()).toEqual(
        versions.toSorted(),
      )
      for (const cells of rows) {
        const version = cells[0]
        const message = `${document}: diagram types for ${version}`
        expect.soft(cells.length, message).toBe(4)
        expect
          .soft(countedDiagramsIn(cells[3] ?? "").toSorted(), message)
          .toEqual(
            countedVersionGroups
              .filter((group) => group.versions.includes(version))
              .flatMap((group) => group.diagrams)
              .toSorted(),
          )
      }
    },
  )

  it.each(versionTables)(
    "names only versions that count, in $document",
    async ({ document, kept }) => {
      const text = await readFile(new URL(document, packageRoot), "utf8")
      const lines = text.split("\n")
      const rows = tableRowsOf(lines, kept)
      expect(rows.length, `${document}: no row of forms kept`).toBeGreaterThan(
        0,
      )
      for (const [index, cells] of rows.entries()) {
        const row = `row ${index + 1} (${cells[0]}: ${cells[1]})`
        expect
          .soft(
            cells.length,
            `${document}: the row ${row} has the wrong columns`,
          )
          .toBe(KEPT_COLUMNS)
        const link = cells[0] ?? ""
        expect.soft(link.startsWith("["), `${document}: ${row}`).toBe(true)
        const end = link.indexOf("](")
        expect
          .soft(end, `${document}: ${row} has no diagram link`)
          .toBeGreaterThan(1)
        const diagrams = diagramNamesIn(link.slice(1, end))
        for (const diagram of diagrams) {
          expect
            .soft(
              countedVersionGroups.some((group) =>
                group.diagrams.includes(diagram),
              ),
              `${document}: ${row} names unknown diagram type ${diagram}`,
            )
            .toBe(true)
        }
        const needed = cells[NEEDED_BY_COLUMN] ?? ""
        const named = versionsIn(needed)
        expect
          .soft(named.length, `${document}: the row ${row} names no version`)
          .toBeGreaterThan(0)
        for (const part of needed.split(";")) {
          const scopedDiagram = countedVersionGroups
            .flatMap((group) => group.diagrams)
            .find((diagram) => part.trimStart().startsWith(`${diagram}:`))
          const partDiagrams =
            scopedDiagram === undefined ? diagrams : [scopedDiagram]
          if (scopedDiagram !== undefined) {
            expect
              .soft(diagrams, `${document}: ${row}`)
              .toContain(scopedDiagram)
          }
          const versions = countedVersionGroups
            .filter((group) =>
              group.diagrams.some((diagram) => partDiagrams.includes(diagram)),
            )
            .flatMap((group) => group.versions)
          for (const version of versionsIn(part)) {
            expect
              .soft(
                versions,
                `${document}: ${row} names ${version}, which does not count for ${partDiagrams.join(", ")}: delete the row, or the name if another version in the row counts for that diagram type`,
              )
              .toContain(version)
          }
        }
      }
    },
  )
})
