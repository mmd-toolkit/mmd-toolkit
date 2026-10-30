/**
 * Lints the Mermaid code blocks of a Markdown file through the processor of
 * `@eslint/markdown`. The processor gives each `mermaid` and `mmd` block a
 * file name with that extension, which the recommended configuration matches,
 * and maps the reports back to the Markdown file.
 */
import { readFile } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import markdown from "@eslint/markdown"
import type { Linter } from "eslint"
import { ESLint } from "eslint"
import { describe, expect, it } from "vitest"
import type { MermaidRuleDefinition } from "../src/index.ts"
import { LANGUAGE_CONFIG } from "./helpers.ts"
import { flowchartNoDuplicateTitle } from "../src/rules/flowchart-no-duplicate-title.ts"

const fixturePath = fileURLToPath(
  new URL("fixtures/markdown/code-blocks.md", import.meta.url),
)
const markdownText = await readFile(fixturePath, "utf8")

/** Reports every identifier, with its name as the message. */
const identifiers: MermaidRuleDefinition = {
  meta: { type: "problem" },
  create(context) {
    return {
      Identifier(node) {
        context.report({ loc: node.loc, message: node.name })
      },
    }
  },
}

/** Lints the fixture with the Markdown processor, the plugin, and the rule above. */
async function lintMarkdown(): Promise<Linter.LintMessage[]> {
  const eslint = new ESLint({
    cwd: fileURLToPath(new URL(".", import.meta.url)),
    overrideConfigFile: true,
    overrideConfig: [
      ...markdown.configs.processor,
      LANGUAGE_CONFIG,
      {
        files: ["**/*.mmd", "**/*.mermaid"],
        plugins: { test: { rules: { identifiers } } },
        rules: { "test/identifiers": "error" },
      },
    ],
  })
  const [result] = await eslint.lintText(markdownText, {
    filePath: fixturePath,
  })
  return result?.messages ?? []
}

/** The text of the Markdown file at a reported line and column (both from 1). */
function textAt(line: number, column: number, length: number): string {
  const lineText = markdownText.split("\n")[line - 1] ?? ""
  return lineText.slice(column - 1, column - 1 + length)
}

describe("Mermaid code blocks in Markdown", () => {
  it("reports at the places of the Markdown file", async () => {
    const messages = await lintMarkdown()
    const reports = messages.filter((message) => message.ruleId !== null)
    expect(reports.map((message) => message.message)).toEqual([
      "A",
      "B",
      "C",
      "D",
    ])
    for (const report of reports) {
      expect(textAt(report.line, report.column, report.message.length)).toBe(
        report.message,
      )
    }
  })

  it("reports a block that holds no diagram as a parse error at the block", async () => {
    const messages = await lintMarkdown()
    const errors = messages.filter((message) => message.fatal === true)
    expect(errors).toHaveLength(1)
    expect(errors[0]?.message).toBe("Parsing error: No diagram type detected")
    expect(textAt(errors[0]?.line ?? 0, 1, "not a diagram".length)).toBe(
      "not a diagram",
    )
  })

  it("identifies earlier statements in Markdown without virtual line numbers", async () => {
    const source =
      "# T\n\nText.\n\n```mermaid\nflowchart LR\n  accTitle: a\n  accTitle: b\n```\n"
    const eslint = new ESLint({
      cwd: fileURLToPath(new URL(".", import.meta.url)),
      overrideConfigFile: true,
      overrideConfig: [
        ...markdown.configs.processor,
        LANGUAGE_CONFIG,
        {
          files: ["**/*.mmd", "**/*.mermaid"],
          plugins: { test: { rules: { title: flowchartNoDuplicateTitle } } },
          rules: { "test/title": "error" },
        },
      ],
    })
    const [result] = await eslint.lintText(source, { filePath: fixturePath })
    expect(result?.messages).toHaveLength(1)
    const report = result?.messages[0]
    expect(report).toMatchObject({
      line: 8,
      column: 3,
      message:
        "mermaid.js replaces the earlier title with the one of this `accTitle`.",
    })
    expect(report?.suggestions).toHaveLength(2)
    expect(report?.suggestions?.[1]?.desc).toBe(
      "Remove the earlier `accTitle` statement.",
    )
    expect(
      report?.suggestions?.map(
        ({ fix }) =>
          source.slice(0, fix.range[0]) + fix.text + source.slice(fix.range[1]),
      ),
    ).toEqual([
      "# T\n\nText.\n\n```mermaid\nflowchart LR\n  accTitle: a\n```\n",
      "# T\n\nText.\n\n```mermaid\nflowchart LR\n  accTitle: b\n```\n",
    ])
  })
})
