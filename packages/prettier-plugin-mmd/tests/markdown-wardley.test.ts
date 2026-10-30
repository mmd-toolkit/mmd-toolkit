/** Markdown containers and dedented Wardley payloads have separate checks. */
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
  readonly hostRejects?: boolean
}
const cases: readonly MarkdownCase[] = [
  {
    name: "wardley Markdown: top-level",
    input: "```mermaid\nwardley-betacomponentFenced[0.3,0.6]\n```\n",
    output: "```mermaid\nwardley-beta\n  component Fenced [0.3, 0.6]\n```\n",
    payloadInput: "wardley-betacomponentFenced[0.3,0.6]",
    payloadOutput: "wardley-beta\n  component Fenced [0.3, 0.6]\n",
    options: {},
  },
  {
    name: "wardley Markdown: list",
    input:
      "- item\n\n  ```mermaid\n  wardley-beta\n  component Host[0.3,0.6]\n  pipelineHost{\n  component Child[0.4]\n  }\n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  wardley-beta\n    component Host [0.3, 0.6]\n    pipeline Host {\n      component Child [0.4]\n    }\n  ```\n",
    payloadInput:
      "wardley-beta\ncomponent Host[0.3,0.6]\npipelineHost{\ncomponent Child[0.4]\n}",
    payloadOutput:
      "wardley-beta\n  component Host [0.3, 0.6]\n  pipeline Host {\n    component Child [0.4]\n  }\n",
    options: {},
  },
  {
    name: "wardley Markdown: quote",
    input:
      '> ```mmd\n> wardley-beta\n> note "host\n>    continuation"[0.3,0.6]\n> ```\n',
    output:
      '> ```mmd\n> wardley-beta\n>   note "host\n>    continuation" [0.3, 0.6]\n> ```\n',
    payloadInput: 'wardley-beta\nnote "host\n   continuation"[0.3,0.6]',
    payloadOutput: 'wardley-beta\n  note "host\n   continuation" [0.3, 0.6]\n',
    options: {},
  },
  {
    name: "wardley Markdown: zero",
    input:
      "```mermaid\nwardley-beta\ncomponent HostZero[0.3,0.6]\npipelineHostZero{\ncomponent Child[0.4]\n}\n```\n",
    output:
      "```mermaid\nwardley-beta\ncomponent HostZero [0.3, 0.6]\npipeline HostZero {\ncomponent Child [0.4]\n}\n```\n",
    payloadInput:
      "wardley-beta\ncomponent HostZero[0.3,0.6]\npipelineHostZero{\ncomponent Child[0.4]\n}",
    payloadOutput:
      "wardley-beta\ncomponent HostZero [0.3, 0.6]\npipeline HostZero {\ncomponent Child [0.4]\n}\n",
    options: { tabWidth: 0 },
  },
  {
    name: "wardley Markdown: tabs",
    input: "```mermaid\nwardley-beta\nsize[7,8]\n```\n",
    output: "```mermaid\nwardley-beta\n\tsize [7, 8]\n```\n",
    payloadInput: "wardley-beta\nsize[7,8]",
    payloadOutput: "wardley-beta\n\tsize [7, 8]\n",
    options: { useTabs: true },
  },
  {
    name: "wardley Markdown: hidden-boundary",
    input:
      "```mermaid\nwardley-beta component HostHidden[0.3,0.6]%%{!tail}%%\n\nsize[7,8]\n```\n",
    output:
      "```mermaid\nwardley-beta component HostHidden [0.3, 0.6]%%{!tail}%%\n\n  size [7, 8]\n```\n",
    payloadInput:
      "wardley-beta component HostHidden[0.3,0.6]%%{!tail}%%\n\nsize[7,8]",
    payloadOutput:
      "wardley-beta component HostHidden [0.3, 0.6]%%{!tail}%%\n\n  size [7, 8]\n",
    options: {},
  },
  {
    name: "wardley Markdown: prefix",
    input:
      "```mermaid\n\n---\ntitle: Ignored host\n---\nwardley-beta\nsize[7,8]\n```\n",
    output:
      "```mermaid\n\n---\ntitle: Ignored host\n---\nwardley-beta\n  size [7, 8]\n```\n",
    payloadInput: "\n---\ntitle: Ignored host\n---\nwardley-beta\nsize[7,8]",
    payloadOutput:
      "\n---\ntitle: Ignored host\n---\nwardley-beta\n  size [7, 8]\n",
    options: {},
  },
  {
    name: "wardley Markdown: frontmatter",
    input:
      "```mermaid\n---\ntitle:   Fenced YAML\n---\nwardley-beta\nsize[7,8]\n```\n",
    output:
      "```mermaid\n---\ntitle: Fenced YAML\n---\nwardley-beta\n  size [7, 8]\n```\n",
    payloadInput: "---\ntitle:   Fenced YAML\n---\nwardley-beta\nsize[7,8]",
    payloadOutput:
      "---\ntitle: Fenced YAML\n---\nwardley-beta\n  size [7, 8]\n",
    options: {},
  },
  {
    name: "wardley Markdown: final-whitespace-label",
    input: "```mermaid\nwardley-beta\nHostSource->HostTarget; \t\n```\n",
    output: "```mermaid\nwardley-beta\n  HostSource -> HostTarget;\n```\n",
    payloadInput: "wardley-beta\nHostSource->HostTarget; \t",
    payloadOutput: "wardley-beta\n  HostSource -> HostTarget;\n",
    options: {},
    hostTrims: true,
    hostRejects: true,
  },
  {
    name: "wardley Markdown: final-hidden-padding",
    input: "```mermaid\nwardley-beta\nsize[7,8]%%{!host}%% \n```\n",
    output: "```mermaid\nwardley-beta\n  size [7, 8]%%{!host}%%\n```\n",
    payloadInput: "wardley-beta\nsize[7,8]%%{!host}%% ",
    payloadOutput: "wardley-beta\n  size [7, 8]%%{!host}%%\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "wardley Markdown: rejected",
    input:
      "```mermaid\nwardley-beta  \ncomponent HostInvalid[101.0,0.6]\n```\n",
    output: "```mermaid\nwardley-beta\ncomponent HostInvalid[101.0,0.6]\n```\n",
    payloadInput: "wardley-beta  \ncomponent HostInvalid[101.0,0.6]",
    payloadOutput: "wardley-beta\ncomponent HostInvalid[101.0,0.6]\n",
    options: {},
    rejected: true,
  },
]

describe("wardley in Markdown", () => {
  it.each(cases)("$name", async (fixture) => {
    const options = {
      ...fixture.options,
      parser: "markdown",
      plugins: [plugin],
    }
    const output = await prettier.format(fixture.input, options)
    expect(output).toBe(fixture.output)
    const twice = await prettier.format(output, options)
    expect(twice).toBe(output)
    expect(await prettier.format(twice, options)).toBe(twice)
    if (fixture.rejected) {
      expect(output).toBe(await formatMarkdownWithoutPlugin(fixture.input))
      return
    }
    const standalone = await prettier.format(fixture.payloadInput, {
      ...fixture.options,
      filepath: "wardley.mmd",
      plugins: [plugin],
    })
    expect(fixture.payloadOutput).toBe(
      fixture.hostTrims ? `${standalone.trimEnd()}\n` : standalone,
    )
    const embedded = defaultEmbedded()
    if (fixture.hostRejects) {
      expect(() => dbOfText(fixture.payloadOutput, embedded)).toThrow(
        SyntaxError,
      )
      expect(treeProblemsOfText(standalone)).toEqual([])
      expect(dbOfText(standalone, embedded)).toEqual(
        dbOfText(fixture.payloadInput, embedded),
      )
      return
    }
    expect(
      await describeFrontmatterChange(
        fixture.payloadInput,
        fixture.payloadOutput,
        fixture.options,
      ),
    ).toBeNull()
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
