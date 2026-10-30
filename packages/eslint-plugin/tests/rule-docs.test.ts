/** Checks the authoring requirements enforced by the rule-document command. */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { rules } from "../src/rules/index.ts"
import {
  DIAGRAM_ORDER,
  diagramOf,
  mismatches,
  mmdCodeBlocks,
  RULE_DOCS_DIR,
  renderDocuments,
  ruleDocumentPath,
} from "../tools/rule-docs.ts"

/**
 * The order of the diagram families of the documentation site: the names in
 * `diagramOrder` of `packages/docs/.vitepress/documents.js`, read from the
 * file, which the site owns and this package does not import.
 */
function siteDiagramOrder(): string[] {
  const source = readFileSync(
    new URL("../../docs/.vitepress/documents.js", import.meta.url),
    "utf8",
  )
  const start = source.indexOf("const diagramOrder = [")
  const end = source.indexOf("]", start)
  if (start === -1 || end === -1)
    throw new Error("no diagramOrder in documents.js")
  return source
    .slice(start, end)
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith('"'))
    .map((line) => line.slice(1, line.indexOf('"', 1)))
}

describe("the order of the diagrams in the list of the rules", () => {
  it("is the order of the sidebar of the documentation site", () => {
    const site = siteDiagramOrder()
    expect(site.length).toBeGreaterThan(0)
    const positions = DIAGRAM_ORDER.map((diagram) => site.indexOf(diagram))
    expect(positions.every((position) => position >= 0)).toBe(true)
    expect(positions).toEqual([...positions].sort((a, b) => a - b))
  })

  it("names the diagram of every rule whose name starts with the name of a diagram", () => {
    // The name of a diagram type rule starts with the name of its document in
    // `packages/spec/docs/ast/`; a common rule has no such name.
    const astDocuments = new Set(
      readdirSync(new URL("../../spec/docs/ast/", import.meta.url))
        .filter((file) => file.endsWith(".md") && !file.endsWith(".ja.md"))
        .map((file) => file.slice(0, -".md".length)),
    )
    const diagramRules = Object.keys(rules).filter((name) =>
      astDocuments.has(name.split("-")[0]),
    )
    expect(diagramRules.length).toBeGreaterThan(0)
    for (const name of diagramRules) {
      expect(diagramOf(name), name).not.toBeNull()
    }
    for (const diagram of DIAGRAM_ORDER) {
      expect(astDocuments, diagram).toContain(diagram)
    }
  })
})

describe("rule example directives", () => {
  let directory: string

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "mmd-rule-docs-"))
    for (const name of Object.keys(rules)) {
      for (const language of ["en", "ja"] as const) {
        const path = ruleDocumentPath(`${directory}/`, name, language)
        mkdirSync(dirname(path), { recursive: true })
        writeFileSync(
          path,
          readFileSync(ruleDocumentPath(RULE_DOCS_DIR, name, language)),
        )
      }
    }
  })

  afterEach(() => rmSync(directory, { recursive: true, force: true }))

  it("accepts the canonical examples in both languages", () => {
    expect(mismatches(`${directory}/`)).toEqual([])
  })

  it("reports a rule that has no test file", () => {
    const testsDirectory = mkdtempSync(join(tmpdir(), "mmd-rule-tests-"))
    try {
      expect(mismatches(`${directory}/`, `${testsDirectory}/`)).toContain(
        `The rule flowchart-no-undef has no ${testsDirectory}/flowchart-no-undef.test.ts`,
      )
    } finally {
      rmSync(testsDirectory, { recursive: true, force: true })
    }
  })

  it.each(["en", "ja"] as const)(
    "rejects a missing directive in the last correct %s example too",
    (language) => {
      const path = ruleDocumentPath(
        `${directory}/`,
        "flowchart-no-undef",
        language,
      )
      const document = readFileSync(path, "utf8")
      const directive = "%% eslint @mmd-toolkit/flowchart-no-undef: error\n"
      const start = document.lastIndexOf(directive)
      writeFileSync(
        path,
        document.slice(0, start) + document.slice(start + directive.length),
      )
      expect(mismatches(`${directory}/`)).toContain(
        `The mmd code block ${mmdCodeBlocks(document).length} of ${path} must start with ${directive.trimEnd()}`,
      )
    },
  )

  it.each(
    (["en", "ja"] as const).flatMap((language) =>
      [
        ["missing", ""],
        ["wrong rule", "%% eslint @mmd-toolkit/no-unclosed-directive: error\n"],
        ["disabled", "%% eslint @mmd-toolkit/flowchart-no-undef: off\n"],
        ["indented", "  %% eslint @mmd-toolkit/flowchart-no-undef: error\n"],
        [
          "after the header",
          "flowchart LR\n%% eslint @mmd-toolkit/flowchart-no-undef: error\n",
        ],
      ].map(([kind, replacement]) => [language, kind, replacement] as const),
    ),
  )(
    "rejects a %s example with a %s directive",
    (language, _kind, replacement) => {
      const path = ruleDocumentPath(
        `${directory}/`,
        "flowchart-no-undef",
        language,
      )
      const document = readFileSync(path, "utf8").replace(
        "%% eslint @mmd-toolkit/flowchart-no-undef: error\n",
        replacement,
      )
      writeFileSync(path, document)
      expect(mismatches(`${directory}/`)).toContain(
        `The mmd code block 1 of ${path} must start with %% eslint @mmd-toolkit/flowchart-no-undef: error`,
      )
    },
  )
})

/** The line of the table in `index` that holds `link`, or an empty text. */
function rowOf(index: string | undefined, link: string): string {
  return (index ?? "").split("\n").find((line) => line.includes(link)) ?? ""
}

describe("a rule without a Japanese document", () => {
  const name = "flowchart-no-undef"
  let directory: string

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), "mmd-rule-docs-"))
    for (const language of ["en", "ja"] as const) {
      writeFileSync(
        `${directory}/index${language === "en" ? ".md" : ".ja.md"}`,
        readFileSync(
          `${RULE_DOCS_DIR}index${language === "en" ? ".md" : ".ja.md"}`,
        ),
      )
      for (const ruleName of Object.keys(rules)) {
        if (language === "ja" && ruleName === name) continue
        const path = ruleDocumentPath(`${directory}/`, ruleName, language)
        writeFileSync(
          path,
          readFileSync(ruleDocumentPath(RULE_DOCS_DIR, ruleName, language)),
        )
      }
    }
  })

  afterEach(() => rmSync(directory, { recursive: true, force: true }))

  /** The English document without the line that links to the Japanese one. */
  function withoutJapaneseLink(document: string): string {
    const start = document.indexOf("Japanese version:")
    const end = document.indexOf(".ja.md)", start) + ".ja.md)".length
    return document.slice(0, start) + document.slice(end).trimStart()
  }

  it("is reported when a document links to the missing one", () => {
    const missing = ruleDocumentPath(`${directory}/`, name, "ja")
    const problems = mismatches(`${directory}/`)
    expect(problems).toContain(
      `${ruleDocumentPath(`${directory}/`, name, "en")} links to ${missing}, which does not exist`,
    )
    expect(problems).toContain(
      `${ruleDocumentPath(`${directory}/`, "class-no-undef", "ja")} links to ${missing}, which does not exist`,
    )
  })

  describe("whose English document links to no Japanese one", () => {
    beforeEach(() => {
      const englishPath = ruleDocumentPath(`${directory}/`, name, "en")
      writeFileSync(
        englishPath,
        withoutJapaneseLink(readFileSync(englishPath, "utf8")),
      )
    })

    it("is reported while a Japanese document links to its missing Japanese version", () => {
      expect(mismatches(`${directory}/`)).toEqual(
        expect.arrayContaining([
          expect.stringContaining(
            `class-no-undef.ja.md links to ${ruleDocumentPath(`${directory}/`, name, "ja")}`,
          ),
        ]),
      )
    })

    it("is accepted when the Japanese documents link to its English one", () => {
      for (const ruleName of Object.keys(rules)) {
        const path = ruleDocumentPath(`${directory}/`, ruleName, "ja")
        if (!existsSync(path)) continue
        writeFileSync(
          path,
          readFileSync(path, "utf8").replaceAll(
            `./${name}.ja.md`,
            `./${name}.md`,
          ),
        )
      }
      expect(mismatches(`${directory}/`)).toEqual([])
    })

    it("has no generated Japanese document, and its row of the Japanese index links to the English one with the English description", async () => {
      const documents = await renderDocuments(`${directory}/`)
      expect([...documents.keys()]).not.toContain(
        ruleDocumentPath(`${directory}/`, name, "ja"),
      )
      const description = rules[name]?.meta?.docs?.description
      const japaneseRow = rowOf(
        documents.get(`${directory}/index.ja.md`),
        `[${name}](./${name}.md)`,
      )
      expect(japaneseRow).toContain(String(description))
      expect(
        rowOf(
          documents.get(`${directory}/index.md`),
          `[${name}](./${name}.md)`,
        ),
      ).toContain(String(description))
    })
  })
})
