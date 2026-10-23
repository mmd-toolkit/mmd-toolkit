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
    name: "pie Markdown: top-level",
    input: '```mermaid\npie showData "Fence":2\n```\n',
    output: '```mermaid\npie showData\n  "Fence" : 2\n```\n',
    payloadInput: 'pie showData "Fence":2',
    payloadOutput: 'pie showData\n  "Fence" : 2\n',
    options: {},
  },
  {
    name: "pie Markdown: list",
    input:
      '- item\n\n  ```mermaid\n  pie\n  accDescr {\n   one\n     two\n  }\n  "Fence":2\n  ```\n',
    output:
      '- item\n\n  ```mermaid\n  pie\n    accDescr {\n   one\n     two\n    }\n    "Fence" : 2\n  ```\n',
    payloadInput: 'pie\naccDescr {\n one\n   two\n}\n"Fence":2',
    payloadOutput: 'pie\n  accDescr {\n one\n   two\n  }\n  "Fence" : 2\n',
    options: {},
  },
  {
    name: "pie Markdown: quote",
    input: '> ```mmd\n> pie\n> "first\n>    second":3\n> ```\n',
    output: '> ```mmd\n> pie\n>   "first\n>    second" : 3\n> ```\n',
    payloadInput: 'pie\n"first\n   second":3',
    payloadOutput: 'pie\n  "first\n   second" : 3\n',
    options: {},
  },
  {
    name: "pie Markdown: zero",
    input: '```mermaid\npie\n"Zero host":2\naccTitle:  direction LR  \n```\n',
    output: '```mermaid\npie\n"Zero host" : 2\naccTitle: direction LR\n```\n',
    payloadInput: 'pie\n"Zero host":2\naccTitle:  direction LR  ',
    payloadOutput: 'pie\n"Zero host" : 2\naccTitle: direction LR\n',
    options: {
      tabWidth: 0,
    },
  },
  {
    name: "pie Markdown: tabs",
    input: '```mermaid\npie\n"Tabs host":4\n```\n',
    output: '```mermaid\npie\n\t"Tabs host" : 4\n```\n',
    payloadInput: 'pie\n"Tabs host":4',
    payloadOutput: 'pie\n\t"Tabs host" : 4\n',
    options: {
      useTabs: true,
    },
  },
  {
    name: "pie Markdown: hidden-gap",
    input: '```mermaid\npie\n"Hidden host":%%{}%%\n6\n```\n',
    output: '```mermaid\npie\n  "Hidden host" :%%{}%%\n6\n```\n',
    payloadInput: 'pie\n"Hidden host":%%{}%%\n6',
    payloadOutput: 'pie\n  "Hidden host" :%%{}%%\n6\n',
    options: {},
  },
  {
    name: "pie Markdown: hidden-boundary",
    input: '```mermaid\npie\n"Boundary host":1%%{}%% \n"After host":2\n```\n',
    output:
      '```mermaid\npie\n  "Boundary host" : 1%%{}%% \n  "After host" : 2\n```\n',
    payloadInput: 'pie\n"Boundary host":1%%{}%% \n"After host":2',
    payloadOutput: 'pie\n  "Boundary host" : 1%%{}%% \n  "After host" : 2\n',
    options: {},
  },
  {
    name: "pie Markdown: preheader",
    input:
      '```mermaid\n\n---\ntitle: Hidden host title\n---\npie\n"Prefix host":2\n```\n',
    output:
      '```mermaid\n\n---\ntitle: Hidden host title\n---\npie\n  "Prefix host" : 2\n```\n',
    payloadInput: '\n---\ntitle: Hidden host title\n---\npie\n"Prefix host":2',
    payloadOutput:
      '\n---\ntitle: Hidden host title\n---\npie\n  "Prefix host" : 2\n',
    options: {},
  },
  {
    name: "pie Markdown: frontmatter",
    input:
      '```mermaid\n---\ntitle:   Real host title\n---\npie\n"Yaml host":2\n```\n',
    output:
      '```mermaid\n---\ntitle: Real host title\n---\npie\n  "Yaml host" : 2\n```\n',
    payloadInput: '---\ntitle:   Real host title\n---\npie\n"Yaml host":2',
    payloadOutput: '---\ntitle: Real host title\n---\npie\n  "Yaml host" : 2\n',
    options: {},
  },
  {
    name: "pie Markdown: global-and-semicolons",
    input:
      '```mermaid\n%%{wrap}%%\npie title style:#a;b\n"style:#c;d":3\n```\n',
    output:
      '```mermaid\n%%{wrap}%%\npie title style:#a;b\n  "style:#c;d" : 3\n```\n',
    payloadInput: '%%{wrap}%%\npie title style:#a;b\n"style:#c;d":3',
    payloadOutput: '%%{wrap}%%\npie title style:#a;b\n  "style:#c;d" : 3\n',
    options: {},
  },
  {
    name: "pie Markdown: final-comment",
    input: '```mermaid\npie\n"Comment host":3%% final  \n```\n',
    output: '```mermaid\npie\n  "Comment host" : 3%% final\n```\n',
    payloadInput: 'pie\n"Comment host":3%% final  ',
    payloadOutput: 'pie\n  "Comment host" : 3%% final\n',
    options: {},
    hostTrims: true,
  },
  {
    name: "pie Markdown: final-hidden-padding",
    input: '```mermaid\npie\n"Last":2%%{}%% \n```\n',
    output: '```mermaid\npie\n  "Last" : 2%%{}%%\n```\n',
    payloadInput: 'pie\n"Last":2%%{}%% ',
    payloadOutput: 'pie\n  "Last" : 2%%{}%%\n',
    options: {},
    hostTrims: true,
  },
  {
    name: "pie Markdown: rejected",
    input: '- item\n\n  ```mermaid\n  pie  \n  "Fence":2;  \n  ```\n',
    output: '- item\n\n  ```mermaid\n  pie\n  "Fence":2;\n  ```\n',
    payloadInput: 'pie  \n"Fence":2;  ',
    payloadOutput: 'pie\n"Fence":2;\n',
    options: {},
    rejected: true,
  },
]

describe("pie in Markdown", () => {
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
      filepath: "pie.mmd",
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
