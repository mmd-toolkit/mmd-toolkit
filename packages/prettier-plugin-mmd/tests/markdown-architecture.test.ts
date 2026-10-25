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
    name: "architecture Markdown: top-level",
    input: "```mermaid\narchitecture-beta service fence\n```\n",
    output: "```mermaid\narchitecture-beta\n  service fence\n```\n",
    payloadInput: "architecture-beta service fence",
    payloadOutput: "architecture-beta\n  service fence\n",
    options: {},
  },
  {
    name: "architecture Markdown: list",
    input:
      "- item\n\n  ```mermaid\n  architecture-beta\n  accDescr {\n   one\n     two\n  }\n  service list_node\n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  architecture-beta\n    accDescr {\n   one\n     two\n    }\n    service list_node\n  ```\n",
    payloadInput:
      "architecture-beta\naccDescr {\n one\n   two\n}\nservice list_node",
    payloadOutput:
      "architecture-beta\n  accDescr {\n one\n   two\n  }\n  service list_node\n",
    options: {},
  },
  {
    name: "architecture Markdown: quote",
    input:
      '> ```mmd\n> architecture-beta\n> service quote_node"first\n>    second"\n> ```\n',
    output:
      '> ```mmd\n> architecture-beta\n>   service quote_node "first\n>    second"\n> ```\n',
    payloadInput: 'architecture-beta\nservice quote_node"first\n   second"',
    payloadOutput:
      'architecture-beta\n  service quote_node "first\n   second"\n',
    options: {},
  },
  {
    name: "architecture Markdown: zero",
    input:
      "```mermaid\narchitecture-beta\nservice zero_host (cloud) [Zero]\naccTitle:  Access  \n```\n",
    output:
      "```mermaid\narchitecture-beta\nservice zero_host(cloud)[Zero]\naccTitle: Access\n```\n",
    payloadInput:
      "architecture-beta\nservice zero_host (cloud) [Zero]\naccTitle:  Access  ",
    payloadOutput:
      "architecture-beta\nservice zero_host(cloud)[Zero]\naccTitle: Access\n",
    options: {
      tabWidth: 0,
    },
  },
  {
    name: "architecture Markdown: tabs",
    input: "```mermaid\narchitecture-beta\nservice tabs_host\n```\n",
    output: "```mermaid\narchitecture-beta\n\tservice tabs_host\n```\n",
    payloadInput: "architecture-beta\nservice tabs_host",
    payloadOutput: "architecture-beta\n\tservice tabs_host\n",
    options: {
      useTabs: true,
    },
  },
  {
    name: "architecture Markdown: hidden-gap",
    input: "```mermaid\narchitecture-beta\nservice%%{}%%\ngap_host\n```\n",
    output: "```mermaid\narchitecture-beta\n  service%%{}%%\ngap_host\n```\n",
    payloadInput: "architecture-beta\nservice%%{}%%\ngap_host",
    payloadOutput: "architecture-beta\n  service%%{}%%\ngap_host\n",
    options: {},
  },
  {
    name: "architecture Markdown: hidden-boundary",
    input:
      "```mermaid\narchitecture-beta\nservice boundary_host%%{}%% \nservice following_host\n```\n",
    output:
      "```mermaid\narchitecture-beta\n  service boundary_host%%{}%% \n  service following_host\n```\n",
    payloadInput:
      "architecture-beta\nservice boundary_host%%{}%% \nservice following_host",
    payloadOutput:
      "architecture-beta\n  service boundary_host%%{}%% \n  service following_host\n",
    options: {},
  },
  {
    name: "architecture Markdown: preheader",
    input:
      "```mermaid\n\n---\ntitle: Hidden host title\n---\narchitecture-beta\nservice prefix_host\n```\n",
    output:
      "```mermaid\n\n---\ntitle: Hidden host title\n---\narchitecture-beta\n  service prefix_host\n```\n",
    payloadInput:
      "\n---\ntitle: Hidden host title\n---\narchitecture-beta\nservice prefix_host",
    payloadOutput:
      "\n---\ntitle: Hidden host title\n---\narchitecture-beta\n  service prefix_host\n",
    options: {},
  },
  {
    name: "architecture Markdown: frontmatter",
    input:
      "```mermaid\n---\ntitle:   Real host title\n---\narchitecture-beta\nservice yaml_host\n```\n",
    output:
      "```mermaid\n---\ntitle: Real host title\n---\narchitecture-beta\n  service yaml_host\n```\n",
    payloadInput:
      "---\ntitle:   Real host title\n---\narchitecture-beta\nservice yaml_host",
    payloadOutput:
      "---\ntitle: Real host title\n---\narchitecture-beta\n  service yaml_host\n",
    options: {},
  },
  {
    name: "architecture Markdown: global-and-semicolons",
    input:
      "```mermaid\n%%{wrap}%%\narchitecture-beta title style:#a;b\nservice global_host [style:#c;d]\n```\n",
    output:
      "```mermaid\n%%{wrap}%%\narchitecture-beta title style:#a;b\n  service global_host [style:#c;d]\n```\n",
    payloadInput:
      "%%{wrap}%%\narchitecture-beta title style:#a;b\nservice global_host [style:#c;d]",
    payloadOutput:
      "%%{wrap}%%\narchitecture-beta title style:#a;b\n  service global_host [style:#c;d]\n",
    options: {},
  },
  {
    name: "architecture Markdown: final-comment",
    input:
      "```mermaid\narchitecture-beta\nservice comment_host%% final  \n```\n",
    output:
      "```mermaid\narchitecture-beta\n  service comment_host%% final\n```\n",
    payloadInput: "architecture-beta\nservice comment_host%% final  ",
    payloadOutput: "architecture-beta\n  service comment_host%% final\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "architecture Markdown: final-hidden-padding",
    input: "```mermaid\narchitecture-beta\nservice last_host%%{}%% \n```\n",
    output: "```mermaid\narchitecture-beta\n  service last_host%%{}%%\n```\n",
    payloadInput: "architecture-beta\nservice last_host%%{}%% ",
    payloadOutput: "architecture-beta\n  service last_host%%{}%%\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "architecture Markdown: rejected",
    input:
      "- item\n\n  ```mermaid\n  architecture-beta  \n  service rejected_host;  \n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  architecture-beta\n  service rejected_host;\n  ```\n",
    payloadInput: "architecture-beta  \nservice rejected_host;  ",
    payloadOutput: "architecture-beta\nservice rejected_host;\n",
    options: {},
    rejected: true,
  },
]

describe("architecture in Markdown", () => {
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
      filepath: "architecture.mmd",
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
