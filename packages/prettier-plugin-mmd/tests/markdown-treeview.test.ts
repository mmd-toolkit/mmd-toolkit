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
    name: "treeview Markdown: top-level",
    input: "```mermaid\ntreeView-beta\nHost\n   Child\n```\n",
    output: "```mermaid\ntreeView-beta\n  Host\n    Child\n```\n",
    payloadInput: "treeView-beta\nHost\n   Child",
    payloadOutput: "treeView-beta\n  Host\n    Child\n",
    options: {},
  },
  {
    name: "treeview Markdown: list",
    input:
      '- item\n\n  ```mermaid\n  treeView-beta\n  List\n   "Child\n    continuation"\n  ```\n',
    output:
      '- item\n\n  ```mermaid\n  treeView-beta\n    List\n      "Child\n    continuation"\n  ```\n',
    payloadInput: 'treeView-beta\nList\n "Child\n  continuation"',
    payloadOutput: 'treeView-beta\n  List\n    "Child\n  continuation"\n',
    options: {},
  },
  {
    name: "treeview Markdown: quote",
    input: "> ```mmd\n> treeView-beta\n> Quote\n>  Child\n> ```\n",
    output: "> ```mmd\n> treeView-beta\n>   Quote\n>     Child\n> ```\n",
    payloadInput: "treeView-beta\nQuote\n Child",
    payloadOutput: "treeView-beta\n  Quote\n    Child\n",
    options: {},
  },
  {
    name: "treeview Markdown: zero",
    input: "```mermaid\ntreeView-beta\nZero\n Child\n```\n",
    output: "```mermaid\ntreeView-beta\n Zero\n  Child\n```\n",
    payloadInput: "treeView-beta\nZero\n Child",
    payloadOutput: "treeView-beta\n Zero\n  Child\n",
    options: { tabWidth: 0 },
  },
  {
    name: "treeview Markdown: tabs",
    input: "```mermaid\ntreeView-beta\nTabs\n Child\n```\n",
    output: "```mermaid\ntreeView-beta\n\tTabs\n\t\tChild\n```\n",
    payloadInput: "treeView-beta\nTabs\n Child",
    payloadOutput: "treeView-beta\n\tTabs\n\t\tChild\n",
    options: { useTabs: true },
  },
  {
    name: "treeview Markdown: carried-indent",
    input: '```mermaid\ntreeView-beta\n"Carry"  \n"Child"\n```\n',
    output: '```mermaid\ntreeView-beta\n  "Carry"\n    "Child"\n```\n',
    payloadInput: 'treeView-beta\n"Carry"  \n"Child"',
    payloadOutput: 'treeView-beta\n  "Carry"\n    "Child"\n',
    options: {},
  },
  {
    name: "treeview Markdown: box",
    input: "```mermaid\ntreeView-beta\nRoot\n└── Child    :::  X\n```\n",
    output: "```mermaid\ntreeView-beta\nRoot\n└── Child :::X\n```\n",
    payloadInput: "treeView-beta\nRoot\n└── Child    :::  X",
    payloadOutput: "treeView-beta\nRoot\n└── Child :::X\n",
    options: {},
  },
  {
    name: "treeview Markdown: description",
    input: "```mermaid\ntreeView-beta\naccDescr {\n text\n}\nBlock\n```\n",
    output:
      "```mermaid\ntreeView-beta\n  accDescr {\n text\n  }\n  Block\n```\n",
    payloadInput: "treeView-beta\naccDescr {\n text\n}\nBlock",
    payloadOutput: "treeView-beta\n  accDescr {\n text\n  }\n  Block\n",
    options: {},
  },
  {
    name: "treeview Markdown: frontmatter",
    input: "```mermaid\n---\ntitle:   Tree\n---\ntreeView-beta\nYaml\n```\n",
    output: "```mermaid\n---\ntitle: Tree\n---\ntreeView-beta\n  Yaml\n```\n",
    payloadInput: "---\ntitle:   Tree\n---\ntreeView-beta\nYaml",
    payloadOutput: "---\ntitle: Tree\n---\ntreeView-beta\n  Yaml\n",
    options: {},
  },
  {
    name: "treeview Markdown: final-bare-padding",
    input: "```mermaid\ntreeView-beta\nLast  \n```\n",
    output: "```mermaid\ntreeView-beta\n  Last\n```\n",
    payloadInput: "treeView-beta\nLast  ",
    payloadOutput: "treeView-beta\n  Last\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "treeview Markdown: quoted-interior",
    input: '```mermaid\ntreeView-beta\n"Last  "\n```\n',
    output: '```mermaid\ntreeView-beta\n  "Last  "\n```\n',
    payloadInput: 'treeView-beta\n"Last  "',
    payloadOutput: 'treeView-beta\n  "Last  "\n',
    options: {},
  },
  {
    name: "treeview Markdown: rejected",
    input: '- item\n\n  ```mermaid\n  treeView \n  "Bad"\n  ```\n',
    output: '- item\n\n  ```mermaid\n  treeView\n  "Bad"\n  ```\n',
    payloadInput: 'treeView \n"Bad"',
    payloadOutput: 'treeView\n"Bad"\n',
    options: {},
    rejected: true,
  },
]

describe("treeview in Markdown", () => {
  it.each(cases)("$name", async (fixture) => {
    const options = {
      ...fixture.options,
      parser: "markdown",
      plugins: [plugin],
    }
    const output = await prettier.format(fixture.input, options)
    expect(output).toBe(fixture.output)
    expect(await prettier.format(output, options)).toBe(output)
    expect(await prettier.format(output, options)).toBe(output)
    if (fixture.rejected) {
      expect(output).toBe(await formatMarkdownWithoutPlugin(fixture.input))
      return
    }
    const standalone = await prettier.format(fixture.payloadInput, {
      ...fixture.options,
      filepath: "treeview.mmd",
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
