/**
 * Formats flowcharts in Markdown code blocks with the real parser and
 * printer. `markdown.test.ts` checks, with a stand-in parser, which blocks
 * reach the plugin; this file checks what comes back into the blocks.
 */
import { describe, expect, it } from "vitest"
import { formatMarkdown, formatMarkdownWithoutPlugin } from "./helpers.ts"

/** Formats Markdown, and checks that formatting the result changes nothing. */
async function formatTwice(markdown: string): Promise<string> {
  const output = await formatMarkdown(markdown)
  expect(await formatMarkdown(output)).toBe(output)
  return output
}

describe("a flowchart in a Markdown code block", () => {
  it("is formatted at the top level", async () => {
    expect(
      await formatTwice(
        "# Title\n\n```mermaid\nflowchart LR\nA-->B;B-->C\nsubgraph S\nC\nend\n```\n",
      ),
    ).toBe(
      "# Title\n\n```mermaid\nflowchart LR\n  A --> B\n  B --> C\n  subgraph S\n    C\n  end\n```\n",
    )
  })

  it("is formatted in a list item, indented from the list item's column", async () => {
    expect(
      await formatTwice(
        "- item\n\n  ```mermaid\n  flowchart LR\n  A-->B\n  subgraph S\n  C\n  end\n  ```\n",
      ),
    ).toBe(
      "- item\n\n  ```mermaid\n  flowchart LR\n    A --> B\n    subgraph S\n      C\n    end\n  ```\n",
    )
  })

  it("is formatted in a block quote", async () => {
    expect(
      await formatTwice(
        "> ```mermaid\n> flowchart LR\n> A-->B\n> subgraph S\n> C\n> end\n> ```\n",
      ),
    ).toBe(
      "> ```mermaid\n> flowchart LR\n>   A --> B\n>   subgraph S\n>     C\n>   end\n> ```\n",
    )
  })

  it("keeps the info string, and uses the fence Prettier prints", async () => {
    expect(
      await formatTwice("~~~~mermaid title=x\nflowchart LR\nA-->B\n~~~~\n"),
    ).toBe("```mermaid title=x\nflowchart LR\n  A --> B\n```\n")
  })

  it("has its frontmatter formatted as YAML", async () => {
    expect(
      await formatTwice(
        "```mermaid\n---\ntitle:   'x'\n---\nflowchart LR\n%% c\nA-->B\n```\n",
      ),
    ).toBe(
      '```mermaid\n---\ntitle: "x"\n---\nflowchart LR\n  %% c\n  A --> B\n```\n',
    )
  })

  it("keeps whitespace at the end of a line inside the block", async () => {
    expect(
      await formatTwice(
        "```mermaid\nflowchart LR\n%% \nA\nstyle A fill:#f00, \nB\n```\n",
      ),
    ).toBe(
      "```mermaid\nflowchart LR\n  %% \n  A\n  style A fill:#f00, \n  B\n```\n",
    )
  })

  // A known limitation: Prettier's Markdown printer removes whitespace at the
  // end of the last line of every code block, with or without this plugin.
  // mermaid.js rejects `style A fill:#f00,`, which it accepts with the space.
  it("loses whitespace at the end of its last line, as without the plugin", async () => {
    const markdown =
      "```mermaid\nflowchart LR\n  A\n  style A fill:#f00, \n```\n"
    const expected =
      "```mermaid\nflowchart LR\n  A\n  style A fill:#f00,\n```\n"
    expect(await formatMarkdownWithoutPlugin(markdown)).toBe(expected)
    expect(await formatMarkdown(markdown)).toBe(expected)
  })
})
