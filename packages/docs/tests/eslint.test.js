import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import markdownPlugin from "@eslint/markdown"
import { ESLint } from "eslint"
import mmd from "eslint-plugin-mmd"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress"
import { eslintCodeTransformer } from "../.vitepress/eslint.js"

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url))

/** Reads a canonical guide rather than a generated site copy. */
function guide(name, extension) {
  return readFileSync(
    new URL(`../pages/linter/${name}${extension}`, import.meta.url),
    "utf8",
  )
}

/** Extracts underlined source text from the VitePress hover components. */
function markedText(html) {
  return [
    ...html.matchAll(
      /<v-menu class="twoslash-error twoslash-error-hover"[^>]*>(.*?)<template/gsu,
    ),
  ].map((match) => match[1].replace(/<[^>]+>/gu, ""))
}

describe("ESLint diagnostic rendering", () => {
  let markdown

  beforeAll(async () => {
    disposeMdItInstance()
    markdown = await createMarkdownRenderer(repositoryRoot, {
      languageAlias: { mmd: "mermaid" },
      languages: ["mermaid", "js", "sh"],
      codeTransformers: [eslintCodeTransformer],
    })
  })

  afterAll(() => disposeMdItInstance())

  it.each([".md", ".ja.md"])(
    "marks C in the incorrect introduction example only: %s",
    async (extension) => {
      const html = await markdown.renderAsync(guide("index", extension))
      expect(markedText(html)).toEqual(["C"])
      expect(html).toContain("mermaid.js adds a new vertex <code>C</code>")
      expect(html).toContain("mmd/flowchart/no-undef</a>")
    },
  )

  it.each([".md", ".ja.md"])(
    "reflects rule settings, suppression, and malformed comments: %s",
    async (extension) => {
      const html = await markdown.renderAsync(guide("comments", extension))
      expect(markedText(html)).toEqual([
        "C",
        "D",
        "D",
        "%% eslint mmd/flowchart/no-undef: [",
      ])
      expect(html).toContain("Failed to parse JSON")
    },
  )

  it.each(
    Object.entries(mmd.rules).flatMap(([name, rule]) =>
      [".md", ".ja.md"].map((extension) => [
        name,
        extension,
        Object.keys(rule.meta.messages).length > 0,
      ]),
    ),
  )(
    "renders native rule examples: %s%s",
    async (name, extension, implemented) => {
      const document = readFileSync(
        new URL(
          `../../eslint-plugin-mmd/docs/rules/${name}${extension}`,
          import.meta.url,
        ),
        "utf8",
      )
      const incorrectHeading =
        extension === ".md"
          ? "Examples of **incorrect** code for this rule:"
          : "この規則に**反する**コードの例:"
      const correctHeading =
        extension === ".md"
          ? "Examples of **correct** code for this rule:"
          : "この規則に**従う**コードの例:"
      const start = document.indexOf(incorrectHeading)
      const boundary = document.indexOf(correctHeading, start)
      const nextHeading = document.indexOf("\n## ", boundary)
      expect(start).toBeGreaterThan(0)
      expect(boundary).toBeGreaterThan(start)
      for (const [section, reports] of [
        [document.slice(start, boundary), implemented],
        [
          document.slice(
            boundary,
            nextHeading === -1 ? undefined : nextHeading,
          ),
          false,
        ],
      ]) {
        const fences = [...section.matchAll(/```mmd\n[\s\S]*?\n```/gu)]
        expect(fences.length).toBeGreaterThan(0)
        for (const [fence] of fences) {
          const html = await markdown.renderAsync(fence)
          const marks = markedText(html)
          if (reports) expect(marks.length, fence).toBeGreaterThan(0)
          else expect(marks, fence).toEqual([])
          // A missing rule or malformed setting would underline the comment.
          expect(
            marks.some((text) => text.includes("%% eslint")),
            fence,
          ).toBe(false)
        }
      }
    },
  )

  it("accepts a mermaid fence with a directive before the header", async () => {
    const html = await markdown.renderAsync(
      "```mermaid\n" +
        "%% eslint mmd/flowchart/no-undef: error\n" +
        "flowchart LR\n  A --> B\n  style C fill:red\n```\n",
    )
    expect(markedText(html)).toEqual(["C"])
  })

  it.each([
    [
      "mmd eslint-check",
      'flowchart LR\n  A["{{ literal }}"] --> B\n  style C fill:red',
    ],
    ["js", 'const text = "%% eslint mmd/flowchart/no-undef: error"'],
  ])("preserves v-pre for an unselected %s fence", async (info, code) => {
    const html = await markdown.renderAsync(`\`\`\`${info}\n${code}\n\`\`\`\n`)
    expect(markedText(html)).toEqual([])
    expect(html).not.toContain("<v-menu")
    expect(html).toContain('v-pre=""')
  })
})

describe("documented Markdown integration limits", () => {
  const code =
    "# Example\n\n<div>HTML</div>\n\n```mermaid\n" +
    "flowchart LR\n  A --> B\n  style C fill:red\n```\n"
  const contentConfig = [
    ...markdownPlugin.configs.recommended,
    { files: ["**/*.md"], rules: { "markdown/no-html": "error" } },
  ]

  it.each([
    ["content", contentConfig, ["markdown/no-html"]],
    ["blocks", markdownPlugin.configs.processor, ["mmd/flowchart/no-undef"]],
    [
      "both",
      [...contentConfig, ...markdownPlugin.configs.processor],
      ["mmd/flowchart/no-undef"],
    ],
  ])("checks %s with the documented configuration", async (_, config, ids) => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [...config, mmd.configs.recommended],
    })
    const [result] = await eslint.lintText(code, { filePath: "example.md" })
    expect(result.messages.map((message) => message.ruleId)).toEqual(ids)
  })

  it("accepts %% comments before a header but not Markdown HTML directives", async () => {
    const eslint = new ESLint({
      overrideConfigFile: true,
      overrideConfig: [
        ...markdownPlugin.configs.processor,
        {
          files: ["**/*.mmd", "**/*.mermaid"],
          plugins: { mmd },
          language: "mmd/mermaid",
        },
      ],
    })
    const diagram = "flowchart LR\n  A --> B\n  style C fill:red\n"
    const [inside] = await eslint.lintText(
      [
        "```mermaid\n%% eslint mmd/flowchart/no-undef: error\n",
        diagram,
        "```\n",
      ].join(""),
      { filePath: "inside.md" },
    )
    expect(inside.messages.map((message) => message.ruleId)).toEqual([
      "mmd/flowchart/no-undef",
    ])
    const [outside] = await eslint.lintText(
      [
        "<!-- eslint mmd/flowchart/no-undef: error -->\n\n```mermaid\n",
        diagram,
        "```\n",
      ].join(""),
      { filePath: "outside.md" },
    )
    expect(outside.messages).toEqual([])
  })
})
