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
} from "./db-reading.ts"
import { formatMarkdownWithoutPlugin } from "./helpers.ts"

interface MarkdownCase {
  readonly name: string
  readonly input: string
  readonly output: string
  readonly payloadInput: string
  readonly payloadOutput: string
  readonly options: Options
  readonly rejected: boolean
}
const cases: readonly MarkdownCase[] = [
  {
    name: "usecase Markdown: top-level",
    input: "```mermaid\nusecase-beta\nactor U\nU-->A\n```\n",
    payloadInput: "usecase-beta\nactor U\nU-->A",
    options: {},
    output: "```mermaid\nusecase-beta\n  actor U\n  U --> A\n```\n",
    payloadOutput: "usecase-beta\n  actor U\n  U --> A\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: list",
    input:
      "- item\n\n  ```mermaid\n  usecase-beta\n  systemBoundary Box\n  A\n  end\n  ```\n",
    payloadInput: "usecase-beta\nsystemBoundary Box\nA\nend",
    options: {},
    output:
      "- item\n\n  ```mermaid\n  usecase-beta\n    systemBoundary Box\n      A\n    end\n  ```\n",
    payloadOutput: "usecase-beta\n  systemBoundary Box\n    A\n  end\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: block-quote",
    input: "> ```mmd\n> usecase-beta\n> actor Reader\n> Reader--order\n> ```\n",
    payloadInput: "usecase-beta\nactor Reader\nReader--order",
    options: {},
    output:
      "> ```mmd\n> usecase-beta\n>   actor Reader\n>   Reader --o rder\n> ```\n",
    payloadOutput: "usecase-beta\n  actor Reader\n  Reader --o rder\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: stereotype-suffixes",
    input:
      "```mermaid\nusecase-beta\nsystemBoundary Portal\nactor Member <<  person  >>, Clerk<<operator>>\nFind(Search)<<task>>\nCard[Preview] <<  ui  card  >>\nend\n```\n",
    payloadInput:
      "usecase-beta\nsystemBoundary Portal\nactor Member <<  person  >>, Clerk<<operator>>\nFind(Search)<<task>>\nCard[Preview] <<  ui  card  >>\nend",
    options: {},
    output:
      "```mermaid\nusecase-beta\n  systemBoundary Portal\n    actor Member << person >>, Clerk<<operator>>\n    Find(Search)<<task>>\n    Card[Preview] << ui  card >>\n  end\n```\n",
    payloadOutput:
      "usecase-beta\n  systemBoundary Portal\n    actor Member << person >>, Clerk<<operator>>\n    Find(Search)<<task>>\n    Card[Preview] << ui  card >>\n  end\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: zero-metadata",
    input:
      "```mermaid\nusecase-beta\nactor Reader@{\ntype:normal,\nicon:''\n}\n```\n",
    payloadInput: "usecase-beta\nactor Reader@{\ntype:normal,\nicon:''\n}",
    options: {
      tabWidth: 0,
    },
    output:
      "```mermaid\nusecase-beta\nactor Reader@{\ntype: normal,\nicon: ''\n}\n```\n",
    payloadOutput: "usecase-beta\nactor Reader@{\ntype: normal,\nicon: ''\n}\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: tabs-boundary",
    input:
      "```mermaid\nusecase-beta\nsystemBoundary Shelf\nDocument\nend\n```\n",
    payloadInput: "usecase-beta\nsystemBoundary Shelf\nDocument\nend",
    options: {
      useTabs: true,
    },
    output:
      "```mermaid\nusecase-beta\n\tsystemBoundary Shelf\n\t\tDocument\n\tend\n```\n",
    payloadOutput:
      "usecase-beta\n\tsystemBoundary Shelf\n\t\tDocument\n\tend\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: json",
    input: "> ```mermaid\n> usecase-beta\n> json Empty @ {}\n> ```\n",
    payloadInput: "usecase-beta\njson Empty @ {}",
    options: {},
    output: "> ```mermaid\n> usecase-beta\n>   json Empty @ {}\n> ```\n",
    payloadOutput: "usecase-beta\n  json Empty @ {}\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: multiline-value",
    input: '```mermaid\nusecase-beta\nDocument("`first\n  second`")\n```\n',
    payloadInput: 'usecase-beta\nDocument("`first\n  second`")',
    options: {},
    output: '```mermaid\nusecase-beta\n  Document("`first\n  second`")\n```\n',
    payloadOutput: 'usecase-beta\n  Document("`first\n  second`")\n',
    rejected: false,
  },
  {
    name: "usecase Markdown: directives",
    input:
      "```mermaid\n%%{wrap}%%\nusecase-beta %%{init: {}}%%\nactor %%{wrap}%% Reader\n```\n",
    payloadInput:
      "%%{wrap}%%\nusecase-beta %%{init: {}}%%\nactor %%{wrap}%% Reader",
    options: {},
    output:
      "```mermaid\n%%{wrap}%%\nusecase-beta %%{init: {}}%%\n  actor %%{wrap}%% Reader\n```\n",
    payloadOutput:
      "%%{wrap}%%\nusecase-beta %%{init: {}}%%\n  actor %%{wrap}%% Reader\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: last-value-padding",
    input: "```mermaid\nusecase-beta\naccTitle:  Title  \n```\n",
    payloadInput: "usecase-beta\naccTitle:  Title  ",
    options: {},
    output: "```mermaid\nusecase-beta\n  accTitle: Title\n```\n",
    payloadOutput: "usecase-beta\n  accTitle: Title\n",
    rejected: false,
  },
  {
    name: "usecase Markdown: rejected-payload",
    input: "- item\n\n  ```mermaid\n  usecase-beta  \n  A;B  \n  ```\n",
    payloadInput: "usecase-beta  \nA;B  ",
    options: {},
    rejected: true,
    output: "- item\n\n  ```mermaid\n  usecase-beta\n  A;B\n  ```\n",
    payloadOutput: "usecase-beta\nA;B\n",
  },
  {
    name: "usecase Markdown: empty-header",
    input: "> ```mermaid\n> usecase-beta\n> ```\n",
    payloadInput: "usecase-beta",
    options: {},
    output: "> ```mermaid\n> usecase-beta\n> ```\n",
    payloadOutput: "usecase-beta\n",
    rejected: false,
  },
]

describe("usecase in Markdown", () => {
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
