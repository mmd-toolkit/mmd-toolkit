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
    name: "radar Markdown: top-level",
    input: "```mermaid\nradar-beta axis fence\n```\n",
    output: "```mermaid\nradar-beta\n  axis fence\n```\n",
    payloadInput: "radar-beta axis fence",
    payloadOutput: "radar-beta\n  axis fence\n",
    options: {},
  },
  {
    name: "radar Markdown: list",
    input:
      "- item\n\n  ```mermaid\n  radar-beta\n  accDescr {\n   one\n     two\n  }\n  axis list_node\n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  radar-beta\n    accDescr {\n   one\n     two\n    }\n    axis list_node\n  ```\n",
    payloadInput: "radar-beta\naccDescr {\n one\n   two\n}\naxis list_node",
    payloadOutput:
      "radar-beta\n  accDescr {\n one\n   two\n  }\n  axis list_node\n",
    options: {},
  },
  {
    name: "radar Markdown: quote",
    input:
      '> ```mmd\n> radar-beta\n> axis quote_node ["first\n>    second"]\n> ```\n',
    output:
      '> ```mmd\n> radar-beta\n>   axis quote_node["first\n>    second"]\n> ```\n',
    payloadInput: 'radar-beta\naxis quote_node ["first\n   second"]',
    payloadOutput: 'radar-beta\n  axis quote_node["first\n   second"]\n',
    options: {},
  },
  {
    name: "radar Markdown: zero",
    input:
      '```mermaid\nradar-beta\naxis zero_host [ "Zero" ]\naccTitle:  Access  \n```\n',
    output:
      '```mermaid\nradar-beta\naxis zero_host["Zero"]\naccTitle: Access\n```\n',
    payloadInput: 'radar-beta\naxis zero_host [ "Zero" ]\naccTitle:  Access  ',
    payloadOutput: 'radar-beta\naxis zero_host["Zero"]\naccTitle: Access\n',
    options: {
      tabWidth: 0,
    },
  },
  {
    name: "radar Markdown: tabs",
    input: "```mermaid\nradar-beta\naxis tabs_host\n```\n",
    output: "```mermaid\nradar-beta\n\taxis tabs_host\n```\n",
    payloadInput: "radar-beta\naxis tabs_host",
    payloadOutput: "radar-beta\n\taxis tabs_host\n",
    options: {
      useTabs: true,
    },
  },
  {
    name: "radar Markdown: hidden-gap",
    input: "```mermaid\nradar-beta\naxis%%{}%%\ngap_host\n```\n",
    output: "```mermaid\nradar-beta\n  axis%%{}%%\ngap_host\n```\n",
    payloadInput: "radar-beta\naxis%%{}%%\ngap_host",
    payloadOutput: "radar-beta\n  axis%%{}%%\ngap_host\n",
    options: {},
  },
  {
    name: "radar Markdown: hidden-boundary",
    input:
      "```mermaid\nradar-beta\naccDescr {Detail}%%{}%% \naxis following_host\n```\n",
    output:
      "```mermaid\nradar-beta\n  accDescr {Detail}%%{}%% \n  axis following_host\n```\n",
    payloadInput: "radar-beta\naccDescr {Detail}%%{}%% \naxis following_host",
    payloadOutput:
      "radar-beta\n  accDescr {Detail}%%{}%% \n  axis following_host\n",
    options: {},
  },
  {
    name: "radar Markdown: preheader",
    input:
      "```mermaid\n\n---\ntitle: Hidden host title\n---\nradar-beta\naxis prefix_host\n```\n",
    output:
      "```mermaid\n\n---\ntitle: Hidden host title\n---\nradar-beta\n  axis prefix_host\n```\n",
    payloadInput:
      "\n---\ntitle: Hidden host title\n---\nradar-beta\naxis prefix_host",
    payloadOutput:
      "\n---\ntitle: Hidden host title\n---\nradar-beta\n  axis prefix_host\n",
    options: {},
  },
  {
    name: "radar Markdown: frontmatter",
    input:
      "```mermaid\n---\ntitle:   Real host title\n---\nradar-beta\naxis yaml_host\n```\n",
    output:
      "```mermaid\n---\ntitle: Real host title\n---\nradar-beta\n  axis yaml_host\n```\n",
    payloadInput:
      "---\ntitle:   Real host title\n---\nradar-beta\naxis yaml_host",
    payloadOutput:
      "---\ntitle: Real host title\n---\nradar-beta\n  axis yaml_host\n",
    options: {},
  },
  {
    name: "radar Markdown: global-and-semicolons",
    input:
      '```mermaid\n%%{wrap}%%\nradar-beta title style:#a;b\naxis global_host["style:#c;d"]\n```\n',
    output:
      '```mermaid\n%%{wrap}%%\nradar-beta title style:#a;b\n  axis global_host["style:#c;d"]\n```\n',
    payloadInput:
      '%%{wrap}%%\nradar-beta title style:#a;b\naxis global_host["style:#c;d"]',
    payloadOutput:
      '%%{wrap}%%\nradar-beta title style:#a;b\n  axis global_host["style:#c;d"]\n',
    options: {},
  },
  {
    name: "radar Markdown: final-comment",
    input: "```mermaid\nradar-beta\naxis comment_host%% final  \n```\n",
    output: "```mermaid\nradar-beta\n  axis comment_host%% final\n```\n",
    payloadInput: "radar-beta\naxis comment_host%% final  ",
    payloadOutput: "radar-beta\n  axis comment_host%% final\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "radar Markdown: final-hidden-padding",
    input: "```mermaid\nradar-beta\naccDescr {Final detail}%%{}%% \n```\n",
    output: "```mermaid\nradar-beta\n  accDescr {Final detail}%%{}%%\n```\n",
    payloadInput: "radar-beta\naccDescr {Final detail}%%{}%% ",
    payloadOutput: "radar-beta\n  accDescr {Final detail}%%{}%%\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "radar Markdown: rejected",
    input:
      "- item\n\n  ```mermaid\n  radar-beta  \n  axis rejected_host;  \n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  radar-beta\n  axis rejected_host;\n  ```\n",
    payloadInput: "radar-beta  \naxis rejected_host;  ",
    payloadOutput: "radar-beta\naxis rejected_host;\n",
    options: {},
    rejected: true,
  },
]

describe("radar in Markdown", () => {
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
      filepath: "radar.mmd",
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
