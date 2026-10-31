import { fileURLToPath } from "node:url"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import { createMarkdownRenderer, disposeMdItInstance } from "vitepress"
import { languages } from "../.vitepress/highlighting.js"

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url))

describe("Mermaid code blocks", () => {
  let markdown

  beforeAll(async () => {
    disposeMdItInstance()
    markdown = await createMarkdownRenderer(repositoryRoot, {
      languages,
    })
  })

  afterAll(() => disposeMdItInstance())

  it.each(["mmd", "mermaid"])(
    "colors the keywords of a diagram type that the bundled grammar does not know in a %s block",
    async (lang) => {
      const html = await markdown.renderAsync(
        `\`\`\`${lang}\ntimeline\n  title History\n  section Early\n    2002 : LinkedIn\n\`\`\`\n`,
      )
      // Each keyword is a span of its own, with the indentation before it; with
      // the bundled grammar, the lines of a timeline are plain text.
      expect(html).toMatch(/<span[^>]*>timeline<\/span>/u)
      expect(html).toMatch(/<span[^>]*>\s*title<\/span>/u)
      expect(html).toMatch(/<span[^>]*>\s*section<\/span>/u)
    },
  )

  it("colors the frontmatter as YAML and a flowchart as before", async () => {
    const html = await markdown.renderAsync(
      "```mmd\n---\ntitle: Hello\n---\nflowchart LR\n  A --> B\n```\n",
    )
    expect(html).toMatch(/<span[^>]*>title<\/span>/u)
    expect(html).toMatch(/<span[^>]*>flowchart<\/span>/u)
    expect(html).toMatch(/<span[^>]*>(?:-->|--&gt;)<\/span>/u)
  })
})
