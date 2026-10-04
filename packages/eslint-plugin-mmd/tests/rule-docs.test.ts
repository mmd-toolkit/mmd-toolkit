/** Checks the authoring requirements enforced by the rule-document command. */
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { rules } from "../src/rules/index.ts"
import {
  mismatches,
  mmdCodeBlocks,
  RULE_DOCS_DIR,
  ruleDocumentPath,
} from "../tools/rule-docs.ts"

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
        "flowchart/no-undef",
        language,
      )
      const document = readFileSync(path, "utf8")
      const directive = "%% eslint mmd/flowchart/no-undef: error\n"
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
        ["wrong rule", "%% eslint mmd/no-unclosed-directive: error\n"],
        ["disabled", "%% eslint mmd/flowchart/no-undef: off\n"],
        ["indented", "  %% eslint mmd/flowchart/no-undef: error\n"],
        [
          "after the header",
          "flowchart LR\n%% eslint mmd/flowchart/no-undef: error\n",
        ],
      ].map(([kind, replacement]) => [language, kind, replacement] as const),
    ),
  )(
    "rejects a %s example with a %s directive",
    (language, _kind, replacement) => {
      const path = ruleDocumentPath(
        `${directory}/`,
        "flowchart/no-undef",
        language,
      )
      const document = readFileSync(path, "utf8").replace(
        "%% eslint mmd/flowchart/no-undef: error\n",
        replacement,
      )
      writeFileSync(path, document)
      expect(mismatches(`${directory}/`)).toContain(
        `The mmd code block 1 of ${path} must start with %% eslint mmd/flowchart/no-undef: error`,
      )
    },
  )
})
