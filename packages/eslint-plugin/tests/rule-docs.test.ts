/** Checks the authoring requirements enforced by the rule-document command. */
import {
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
