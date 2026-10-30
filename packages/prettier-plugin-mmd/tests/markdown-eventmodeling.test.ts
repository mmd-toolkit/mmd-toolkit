/** Markdown containers and dedented Eventmodeling payloads have separate checks. */
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
    name: "eventmodeling Markdown: top-level",
    input: "```mermaid\neventmodeling tf 083evt Fenced\n```\n",
    output: "```mermaid\neventmodeling\n  tf 083 evt Fenced\n```\n",
    payloadInput: "eventmodeling tf 083evt Fenced",
    payloadOutput: "eventmodeling\n  tf 083 evt Fenced\n",
    options: {},
  },
  {
    name: "eventmodeling Markdown: list",
    input:
      "- item\n\n  ```mermaid\n  eventmodeling gwt 082 given evt Before then cmd After\n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  eventmodeling\n    gwt 082\n      given\n        evt Before\n      then\n        cmd After\n  ```\n",
    payloadInput: "eventmodeling gwt 082 given evt Before then cmd After",
    payloadOutput:
      "eventmodeling\n  gwt 082\n    given\n      evt Before\n    then\n      cmd After\n",
    options: {},
  },
  {
    name: "eventmodeling Markdown: quote",
    input:
      "> ```mmd\n> eventmodeling note 081 {\n>    written columns\n> }\n> ```\n",
    output:
      "> ```mmd\n> eventmodeling\n>   note 081 {\n>    written columns\n> }\n> ```\n",
    payloadInput: "eventmodeling note 081 {\n   written columns\n}",
    payloadOutput: "eventmodeling\n  note 081 {\n   written columns\n}\n",
    options: {},
  },
  {
    name: "eventmodeling Markdown: zero",
    input: "```mermaid\neventmodeling  accDescr: Zero\ntf 080evt Zero\n```\n",
    output: "```mermaid\neventmodeling  accDescr: Zero\ntf 080 evt Zero\n```\n",
    payloadInput: "eventmodeling  accDescr: Zero\ntf 080evt Zero",
    payloadOutput: "eventmodeling  accDescr: Zero\ntf 080 evt Zero\n",
    options: {
      tabWidth: 0,
    },
  },
  {
    name: "eventmodeling Markdown: tabs",
    input:
      "```mermaid\neventmodeling gwt 079 given evt TabBefore then ui TabAfter\n```\n",
    output:
      "```mermaid\neventmodeling\n\tgwt 079\n\t\tgiven\n\t\t\tevt TabBefore\n\t\tthen\n\t\t\tui TabAfter\n```\n",
    payloadInput: "eventmodeling gwt 079 given evt TabBefore then ui TabAfter",
    payloadOutput:
      "eventmodeling\n\tgwt 079\n\t\tgiven\n\t\t\tevt TabBefore\n\t\tthen\n\t\t\tui TabAfter\n",
    options: {
      useTabs: true,
    },
  },
  {
    name: "eventmodeling Markdown: metadata",
    input:
      "```mermaid\neventmodeling tf 078evt Metadata \t%%{wrap}%%  accDescr: Exact\n```\n",
    output:
      "```mermaid\neventmodeling\n  tf 078 evt Metadata \t%%{wrap}%%  accDescr: Exact\n```\n",
    payloadInput:
      "eventmodeling tf 078evt Metadata \t%%{wrap}%%  accDescr: Exact",
    payloadOutput:
      "eventmodeling\n  tf 078 evt Metadata \t%%{wrap}%%  accDescr: Exact\n",
    options: {},
  },
  {
    name: "eventmodeling Markdown: hidden-boundary",
    input:
      "```mermaid\neventmodeling\n%%{{host}}%%\n \taccDescr: Hidden\n```\n",
    output:
      "```mermaid\neventmodeling\n  %%{{host}}%%\n \taccDescr: Hidden\n```\n",
    payloadInput: "eventmodeling\n%%{{host}}%%\n \taccDescr: Hidden",
    payloadOutput: "eventmodeling\n  %%{{host}}%%\n \taccDescr: Hidden\n",
    options: {},
  },
  {
    name: "eventmodeling Markdown: prefix",
    input:
      "```mermaid\n\n---\ntitle: Ignored host event\n---\neventmodeling tf 077evt Prefix\n```\n",
    output:
      "```mermaid\n\n---\ntitle: Ignored host event\n---\neventmodeling\n  tf 077 evt Prefix\n```\n",
    payloadInput:
      "\n---\ntitle: Ignored host event\n---\neventmodeling tf 077evt Prefix",
    payloadOutput:
      "\n---\ntitle: Ignored host event\n---\neventmodeling\n  tf 077 evt Prefix\n",
    options: {},
  },
  {
    name: "eventmodeling Markdown: frontmatter",
    input:
      "```mermaid\n---\ntitle:   Host YAML\n---\neventmodeling tf 076evt Yaml\n```\n",
    output:
      "```mermaid\n---\ntitle: Host YAML\n---\neventmodeling\n  tf 076 evt Yaml\n```\n",
    payloadInput: "---\ntitle:   Host YAML\n---\neventmodeling tf 076evt Yaml",
    payloadOutput:
      "---\ntitle: Host YAML\n---\neventmodeling\n  tf 076 evt Yaml\n",
    options: {},
  },
  {
    name: "eventmodeling Markdown: final-hidden-padding",
    input: "```mermaid\neventmodeling\n%%{{final host}}%% \t\n```\n",
    output: "```mermaid\neventmodeling\n  %%{{final host}}%%\n```\n",
    payloadInput: "eventmodeling\n%%{{final host}}%% \t",
    payloadOutput: "eventmodeling\n  %%{{final host}}%%\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "eventmodeling Markdown: rejected",
    input: "```mermaid\neventmodeling  \ntf 075evt\n```\n",
    output: "```mermaid\neventmodeling\ntf 075evt\n```\n",
    payloadInput: "eventmodeling  \ntf 075evt",
    payloadOutput: "eventmodeling\ntf 075evt\n",
    options: {},
    rejected: true,
  },
]

describe("eventmodeling in Markdown", () => {
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
      filepath: "eventmodeling.mmd",
      plugins: [plugin],
    })
    expect(fixture.payloadOutput).toBe(
      fixture.hostTrims ? `${standalone.trimEnd()}\n` : standalone,
    )
    const embedded = defaultEmbedded()
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
