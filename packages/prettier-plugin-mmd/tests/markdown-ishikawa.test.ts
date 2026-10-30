/** Fixed hosts check container dedentation separately from payload reading. */
import { describe, expect, it } from "vitest"
import * as prettier from "prettier"
import type { Options } from "prettier"
import plugin from "../src/index.ts"
import {
  dbOfText,
  defaultEmbedded,
  treeProblemsOfText,
  writtenEmbeddedTexts,
} from "./db-reading.ts"
import { formatMarkdownWithoutPlugin } from "./helpers.ts"

interface MarkdownCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly options: Options
  readonly payloadInput: string
  readonly payloadOutput: string
  readonly rejected: boolean
}

const cases: readonly MarkdownCase[] = [
  {
    name: "ishikawa Markdown: top-level",
    input: "```mermaid\n  IsHiKaWa-BeTa R\n A\n   B\n```\n",
    options: {},
    payloadInput: "ishikawa R\n A\n   B",
    output: "```mermaid\nIsHiKaWa-BeTa\n  R\n    A\n      B\n```\n",
    payloadOutput: "IsHiKaWa-BeTa\n  R\n    A\n      B\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: list",
    input: "- item\n\n  ```mermaid\n  ishikawa\n  R\n   A\n     B\n  ```\n",
    options: {},
    payloadInput: "ishikawa\nR\n A\n   B",
    output:
      "- item\n\n  ```mermaid\n  ishikawa\n    R\n      A\n        B\n  ```\n",
    payloadOutput: "ishikawa\n  R\n    A\n      B\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: quote-list-clamped",
    input:
      "> - item\n>\n>   ```mermaid\n>   ishikawa\n>   R\n>       A\n>    B\n>     C\n>         D\n>   ```\n",
    options: {},
    payloadInput: "ishikawa\nR\n    A\n B\n  C\n      D",
    output:
      "> - item\n>\n>   ```mermaid\n>   ishikawa\n>     R\n>       A\n>       B\n>       C\n>         D\n>   ```\n",
    payloadOutput: "ishikawa\n  R\n    A\n    B\n    C\n      D\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: zero-width",
    input: "```mermaid\nishikawa\nR\n A\n   B\n```\n",
    options: { tabWidth: 0 },
    payloadInput: "ishikawa\nR\n A\n   B",
    output: "```mermaid\nishikawa\n R\n  A\n   B\n```\n",
    payloadOutput: "ishikawa\n R\n  A\n   B\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: tabs",
    input: "```mermaid\nishikawa\nR\n A\n   B\n```\n",
    options: { useTabs: true },
    payloadInput: "ishikawa\nR\n A\n   B",
    output: "```mermaid\nishikawa\n\tR\n\t\tA\n\t\t\tB\n```\n",
    payloadOutput: "ishikawa\n\tR\n\t\tA\n\t\t\tB\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: directives",
    input: "```mermaid\nishikawa%%{wrap}%% R\n   %%{a}%%  A\n      B\n```\n",
    options: {},
    payloadInput: "ishikawa%%{wrap}%% R\n   %%{a}%%  A\n      B",
    output: "```mermaid\nishikawa%%{wrap}%%\n  R\n  %%{a}%%  A\n      B\n```\n",
    payloadOutput: "ishikawa%%{wrap}%%\n  R\n  %%{a}%%  A\n      B\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: joined-region",
    input: "```mermaid\nishikawa\nR\u2028%% c\n A\n```\n",
    options: {},
    payloadInput: "ishikawa\nR\u2028%% c\n A",
    output: "```mermaid\nishikawa\n  R\u2028%% c\n A\n```\n",
    payloadOutput: "ishikawa\n  R\u2028%% c\n A\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: trailing-whitespace",
    input: "```mermaid\nishikawa\nR  \n A  \n```\n",
    options: {},
    payloadInput: "ishikawa\nR  \n A  ",
    output: "```mermaid\nishikawa\n  R  \n    A\n```\n",
    payloadOutput: "ishikawa\n  R  \n    A\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: rootless",
    input: "```mermaid\nishikawa\n```\n",
    options: {},
    payloadInput: "ishikawa\n",
    output: "```mermaid\nishikawa\n```\n",
    payloadOutput: "ishikawa\n",
    rejected: false,
  },
  {
    name: "ishikawa Markdown: rejected-bare-header",
    input: "- item\n\n  ```mermaid\n  ishikawa\n  ```\n",
    options: {},
    payloadInput: "ishikawa",
    output: "- item\n\n  ```mermaid\n  ishikawa\n  ```\n",
    payloadOutput: "ishikawa",
    rejected: true,
  },
  {
    name: "ishikawa Markdown: rejected-second-header",
    input: "> ```mermaid\n> ishikawa\n> R\n> ishikawa\n> ```\n",
    options: {},
    payloadInput: "ishikawa\nR\nishikawa",
    output: "> ```mermaid\n> ishikawa\n> R\n> ishikawa\n> ```\n",
    payloadOutput: "ishikawa\nR\nishikawa\n",
    rejected: true,
  },
  {
    name: "ishikawa Markdown: declined-nonfinal-trailing-whitespace",
    input: "```mermaid\nishikawa\nR  \nishikawa\n```\n",
    options: {},
    payloadInput: "ishikawa\nR  \nishikawa",
    output: "```mermaid\nishikawa\nR\nishikawa\n```\n",
    payloadOutput: "ishikawa\nR\nishikawa\n",
    rejected: true,
  },
  {
    name: "ishikawa Markdown: spaced-header-directive",
    input: "```mermaid\nishikawa %%{init: {}}%% R\n A\n```\n",
    options: {},
    payloadInput: "ishikawa %%{init: {}}%% R\n A",
    output: "```mermaid\nishikawa\n %%{init: {}}%% R\n    A\n```\n",
    payloadOutput: "ishikawa\n %%{init: {}}%% R\n    A\n",
    rejected: false,
  },
]

describe("ishikawa in Markdown", () => {
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
    expect(dbOfText(fixture.payloadOutput, defaultEmbedded())).toEqual(
      dbOfText(fixture.payloadInput, defaultEmbedded()),
    )
    expect(writtenEmbeddedTexts(fixture.payloadOutput)).toEqual(
      writtenEmbeddedTexts(fixture.payloadInput),
    )
    expect(treeProblemsOfText(fixture.payloadInput)).toEqual([])
    expect(treeProblemsOfText(fixture.payloadOutput)).toEqual([])
  })
})
