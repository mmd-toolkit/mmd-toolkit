/** Fixed Markdown hosts check dedented payloads separately from containers. */
import { describe, expect, it } from "vitest"
import type { Options } from "prettier"
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import {
  dbOfText,
  defaultEmbedded,
  treeProblemsOfText,
  writtenEmbeddedTexts,
  describeFrontmatterChange,
} from "./db-reading.ts"
import { formatMarkdownWithoutPlugin } from "./helpers.ts"

interface MarkdownCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly payloadInput: string
  readonly payloadOutput: string
  readonly options: Options
  readonly rejected?: boolean
  readonly hostTrims?: boolean
}
const cases: readonly MarkdownCase[] = [
  {
    name: "gitgraph Markdown: top-level",
    input: '```mermaid\ngitGraph:commit id:"Fence"\n```\n',
    output: '```mermaid\ngitGraph:\n  commit id: "Fence"\n```\n',
    payloadInput: 'gitGraph:commit id:"Fence"',
    payloadOutput: 'gitGraph:\n  commit id: "Fence"\n',
    options: {},
  },
  {
    name: "gitgraph Markdown: list",
    input:
      "- item\n\n  ```mermaid\n  gitGraph\n  accDescr {\n   one\n     two\n  }\n  commit\n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  gitGraph\n    accDescr {\n   one\n     two\n    }\n    commit\n  ```\n",
    payloadInput: "gitGraph\naccDescr {\n one\n   two\n}\ncommit",
    payloadOutput: "gitGraph\n  accDescr {\n one\n   two\n  }\n  commit\n",
    options: {},
  },
  {
    name: "gitgraph Markdown: quote",
    input: '> ```mmd\n> gitGraph\n> commit id:"first\n>    second"\n> ```\n',
    output:
      '> ```mmd\n> gitGraph\n>   commit id: "first\n>    second"\n> ```\n',
    payloadInput: 'gitGraph\ncommit id:"first\n   second"',
    payloadOutput: 'gitGraph\n  commit id: "first\n   second"\n',
    options: {},
  },
  {
    name: "gitgraph Markdown: zero",
    input: "```mermaid\ngitGraph\ncommit\naccTitle:  Title  \n```\n",
    output: "```mermaid\ngitGraph\ncommit\naccTitle: Title\n```\n",
    payloadInput: "gitGraph\ncommit\naccTitle:  Title  ",
    payloadOutput: "gitGraph\ncommit\naccTitle: Title\n",
    options: {
      tabWidth: 0,
    },
  },
  {
    name: "gitgraph Markdown: tabs",
    input: "```mermaid\ngitGraph\ncommit\n```\n",
    output: "```mermaid\ngitGraph\n\tcommit\n```\n",
    payloadInput: "gitGraph\ncommit",
    payloadOutput: "gitGraph\n\tcommit\n",
    options: {
      useTabs: true,
    },
  },
  {
    name: "gitgraph Markdown: hidden-gap",
    input: '```mermaid\ngitGraph\ncommit id:%%{}%%\n"A"\n```\n',
    output: '```mermaid\ngitGraph\n  commit id:%%{}%%\n"A"\n```\n',
    payloadInput: 'gitGraph\ncommit id:%%{}%%\n"A"',
    payloadOutput: 'gitGraph\n  commit id:%%{}%%\n"A"\n',
    options: {},
  },
  {
    name: "gitgraph Markdown: hidden-boundary",
    input: "```mermaid\ngitGraph\ncommit%%{}%% \ncommit\n```\n",
    output: "```mermaid\ngitGraph\n  commit%%{}%% \n  commit\n```\n",
    payloadInput: "gitGraph\ncommit%%{}%% \ncommit",
    payloadOutput: "gitGraph\n  commit%%{}%% \n  commit\n",
    options: {},
  },
  {
    name: "gitgraph Markdown: preheader",
    input: "```mermaid\n\n---\ntitle: Hidden\n---\ngitGraph\ncommit\n```\n",
    output: "```mermaid\n\n---\ntitle: Hidden\n---\ngitGraph\n  commit\n```\n",
    payloadInput: "\n---\ntitle: Hidden\n---\ngitGraph\ncommit",
    payloadOutput: "\n---\ntitle: Hidden\n---\ngitGraph\n  commit\n",
    options: {},
  },
  {
    name: "gitgraph Markdown: frontmatter",
    input: "```mermaid\n---\ntitle:   Real\n---\ngitGraph\ncommit\n```\n",
    output: "```mermaid\n---\ntitle: Real\n---\ngitGraph\n  commit\n```\n",
    payloadInput: "---\ntitle:   Real\n---\ngitGraph\ncommit",
    payloadOutput: "---\ntitle: Real\n---\ngitGraph\n  commit\n",
    options: {},
  },
  {
    name: "gitgraph Markdown: global-and-semicolons",
    input:
      '```mermaid\n%%{wrap}%%\ngitGraph title style:#a;b\ncommit msg:"style:#c;d"\n```\n',
    output:
      '```mermaid\n%%{wrap}%%\ngitGraph title style:#a;b\n  commit msg:"style:#c;d"\n```\n',
    payloadInput:
      '%%{wrap}%%\ngitGraph title style:#a;b\ncommit msg:"style:#c;d"',
    payloadOutput:
      '%%{wrap}%%\ngitGraph title style:#a;b\n  commit msg:"style:#c;d"\n',
    options: {},
  },
  {
    name: "gitgraph Markdown: final-comment",
    input: "```mermaid\ngitGraph\ncommit%% final  \n```\n",
    output: "```mermaid\ngitGraph\n  commit%% final\n```\n",
    payloadInput: "gitGraph\ncommit%% final  ",
    payloadOutput: "gitGraph\n  commit%% final\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "gitgraph Markdown: final-hidden-padding",
    input: "```mermaid\ngitGraph\ncommit%%{}%% \n```\n",
    output: "```mermaid\ngitGraph\n  commit%%{}%%\n```\n",
    payloadInput: "gitGraph\ncommit%%{}%% ",
    payloadOutput: "gitGraph\n  commit%%{}%%\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "gitgraph Markdown: rejected",
    input: "- item\n\n  ```mermaid\n  gitGraph  \n  commit;  \n  ```\n",
    output: "- item\n\n  ```mermaid\n  gitGraph\n  commit;\n  ```\n",
    payloadInput: "gitGraph  \ncommit;  ",
    payloadOutput: "gitGraph\ncommit;\n",
    options: {},
    rejected: true,
  },
]
describe("gitgraph in Markdown", () => {
  it.each(cases)("$name", async (fixture) => {
    const options = {
      ...fixture.options,
      parser: "markdown",
      plugins: [plugin],
    }
    const output = await prettier.format(fixture.input, options)
    expect(output).toBe(fixture.output)
    expect(await prettier.format(output, options)).toBe(output)
    if (fixture.rejected) {
      expect(output).toBe(await formatMarkdownWithoutPlugin(fixture.input))
      return
    }
    const standalone = await prettier.format(fixture.payloadInput, {
      ...fixture.options,
      filepath: "gitGraph.mmd",
      plugins: [plugin],
    })
    expect(fixture.payloadOutput).toBe(
      fixture.hostTrims ? `${standalone.trimEnd()}\n` : standalone,
    )
    expect(
      await describeFrontmatterChange(
        fixture.payloadInput,
        fixture.payloadOutput,
        fixture.options,
      ),
    ).toBeNull()
    const embedded = defaultEmbedded()
    expect(dbOfText(fixture.payloadOutput, embedded)).toEqual(
      dbOfText(fixture.payloadInput, embedded),
    )
    expect(writtenEmbeddedTexts(fixture.payloadOutput)).toEqual(
      writtenEmbeddedTexts(fixture.payloadInput),
    )
    expect(treeProblemsOfText(fixture.payloadInput)).toEqual([])
    expect(treeProblemsOfText(fixture.payloadOutput)).toEqual([])
  })
})
