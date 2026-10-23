/** Agentflow payloads use the same rules after Markdown host dedentation. */
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import { readFile } from "node:fs/promises"
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import {
  formatMarkdown,
  formatMarkdownWithoutPlugin,
  formatMermaid,
} from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  writtenEmbeddedTexts,
} from "./db-reading.ts"

interface MarkdownAgentflowCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly before: string
  readonly after: string
  readonly options?: prettier.Options
}

const cases: readonly MarkdownAgentflowCase[] = [
  {
    name: "agentflow Markdown: top level",
    input: "# Title\n\n```mermaid\nagentflow-beta TB\nA-->B;B--xC\n```\n",
    output:
      "# Title\n\n```mermaid\nagentflow-beta TB\n  A --> B\n  B --x C\n```\n",
    before: "agentflow-beta TB\nA-->B;B--xC\n",
    after: "agentflow-beta TB\n  A --> B\n  B --x C\n",
  },
  {
    name: "agentflow Markdown: nested list flow and global",
    input:
      "- item\n\n  ```mermaid\n  agentflow-beta TB\n  flow F;global;A-->B;end;C;end\n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  agentflow-beta TB\n    flow F\n      global\n        A --> B\n      end\n      ;\n      C\n    end\n  ```\n",
    before: "agentflow-beta TB\nflow F;global;A-->B;end;C;end\n",
    after:
      "agentflow-beta TB\n  flow F\n    global\n      A --> B\n    end\n    ;\n    C\n  end\n",
  },
  {
    name: "agentflow Markdown: quote with name continuation",
    input:
      "> ```mermaid\n> agentflow-beta TB\n> flow click A\n> B\n> end\n> ```\n",
    output:
      "> ```mermaid\n> agentflow-beta TB\n>   flow click A\n> B\n>   end\n> ```\n",
    before: "agentflow-beta TB\nflow click A\nB\nend\n",
    after: "agentflow-beta TB\n  flow click A\nB\n  end\n",
  },
  {
    name: "agentflow Markdown: opaque data and inline directives",
    input:
      "```mermaid\nagentflow-beta TB\nA@{ custom: x }%%{init: {}}%%-->B\n```\n",
    output:
      "```mermaid\nagentflow-beta TB\n  A@{ custom: x }%%{init: {}}%%--> B\n```\n",
    before: "agentflow-beta TB\nA@{ custom: x }%%{init: {}}%%-->B\n",
    after: "agentflow-beta TB\n  A@{ custom: x }%%{init: {}}%%--> B\n",
  },
  {
    name: "agentflow Markdown: interior trailing value and comment spaces",
    input:
      '```mermaid\nagentflow-beta TB\nA["x  \n  y"]\n%% c  \nstyle A fill:red, \nB\n```\n',
    output:
      '```mermaid\nagentflow-beta TB\n  A["x  \n  y"]\n  %% c  \n  style A fill:red, \n  B\n```\n',
    before: 'agentflow-beta TB\nA["x  \n  y"]\n%% c  \nstyle A fill:red, \nB\n',
    after:
      'agentflow-beta TB\n  A["x  \n  y"]\n  %% c  \n  style A fill:red, \n  B\n',
  },
  {
    name: "agentflow Markdown: zero width",
    input: "```mermaid\nagentflow-beta TB\nflow F\nA\nend\n```\n",
    output: "```mermaid\nagentflow-beta TB\n flow F\n  A\n end\n```\n",
    before: "agentflow-beta TB\nflow F\nA\nend\n",
    after: "agentflow-beta TB\n flow F\n  A\n end\n",
    options: { tabWidth: 0 },
  },
  {
    name: "agentflow Markdown: tabs",
    input: "```mermaid\nagentflow-beta TB\nflow F\nA\nend\n```\n",
    output: "```mermaid\nagentflow-beta TB\n\tflow F\n\t\tA\n\tend\n```\n",
    before: "agentflow-beta TB\nflow F\nA\nend\n",
    after: "agentflow-beta TB\n\tflow F\n\t\tA\n\tend\n",
    options: { useTabs: true },
  },
]

describe("agentflow Markdown", () => {
  it.each(cases)("$name", async ({ input, output, before, after, options }) => {
    expect(
      await prettier.format(input, {
        ...options,
        parser: "markdown",
        plugins: [plugin],
      }),
    ).toBe(output)
    expect(
      await prettier.format(output, {
        ...options,
        parser: "markdown",
        plugins: [plugin],
      }),
    ).toBe(output)
    expect(await formatMermaid(before, "diagram.mmd", options)).toBe(after)
    expect(dbOfText(after, defaultEmbedded())).toEqual(
      dbOfText(before, defaultEmbedded()),
    )
    expect(writtenEmbeddedTexts(after)).toEqual(writtenEmbeddedTexts(before))
  })

  it("agentflow Markdown: null style host limitation", async () => {
    const input =
      "```mermaid\nagentflow-beta TB\n  A\n  style A fill:red, \n```\n"
    const output =
      "```mermaid\nagentflow-beta TB\n  A\n  style A fill:red,\n```\n"
    expect(await formatMarkdown(input)).toBe(output)
    expect(await formatMarkdownWithoutPlugin(input)).toBe(output)
    expect(() =>
      parse("agentflow-beta TB\n  A\n  style A fill:red, \n"),
    ).not.toThrow()
    expect(() =>
      parse("agentflow-beta TB\n  A\n  style A fill:red,\n"),
    ).toThrow()
    expect(await formatMarkdown(output)).toBe(output)
  })

  it("agentflow Markdown: failure is declined", async () => {
    const input = "```mermaid\nagentflow-beta TB ;A\n```\n"
    expect(await formatMarkdown(input)).toBe(
      await formatMarkdownWithoutPlugin(input),
    )
  })

  it("agentflow Markdown: large payload remains written", async () => {
    const payload = await readFile(
      new URL(
        "fixtures/agentflow/default-size-branches/size-preserving-to-fallback-unsafe-input.mmd",
        import.meta.url,
      ),
      "utf8",
    )
    const markdown = `\`\`\`mermaid\n${payload}\`\`\`\n`
    expect(await formatMarkdown(markdown)).toBe(markdown)
    expect(await formatMarkdown(await formatMarkdown(markdown))).toBe(markdown)
  })
})
