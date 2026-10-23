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
    name: "info Markdown: top-level",
    payloadInput: "info showInfo title Topic",
    payloadOutput: "info showInfo\n  title Topic\n",
    options: {},
    input: "```mermaid\ninfo showInfo title Topic\n```\n",
    output: "```mermaid\ninfo showInfo\n  title Topic\n```\n",
  },
  {
    name: "info Markdown: list",
    payloadInput: "info\naccDescr {\n one\n   two\n}",
    payloadOutput: "info\n  accDescr {\n one\n   two\n  }\n",
    options: {},
    input:
      "- item\n\n  ```mermaid\n  info\n  accDescr {\n   one\n     two\n  }\n  ```\n",
    output:
      "- item\n\n  ```mermaid\n  info\n    accDescr {\n   one\n     two\n    }\n  ```\n",
  },
  {
    name: "info Markdown: quote",
    payloadInput: "\n---\nx: [\n---\ninfo\ntitle Topic",
    payloadOutput: "\n---\nx: [\n---\ninfo\n  title Topic\n",
    options: {},
    input: "> ```mmd\n> \n> ---\n> x: [\n> ---\n> info\n> title Topic\n> ```\n",
    output:
      "> ```mmd\n> \n> ---\n> x: [\n> ---\n> info\n>   title Topic\n> ```\n",
  },
  {
    name: "info Markdown: zero",
    payloadInput: "info\naccTitle:  Access  ",
    payloadOutput: "info\naccTitle: Access\n",
    options: {
      tabWidth: 0,
    },
    input: "```mermaid\ninfo\naccTitle:  Access  \n```\n",
    output: "```mermaid\ninfo\naccTitle: Access\n```\n",
  },
  {
    name: "info Markdown: tabs",
    payloadInput: "info\naccTitle: Access",
    payloadOutput: "info\n\taccTitle: Access\n",
    options: {
      useTabs: true,
    },
    input: "```mermaid\ninfo\naccTitle: Access\n```\n",
    output: "```mermaid\ninfo\n\taccTitle: Access\n```\n",
  },
  {
    name: "info Markdown: hidden-boundary",
    payloadInput: "info\naccDescr {D}%%{}%% \ntitle Topic",
    payloadOutput: "info\n  accDescr {D}%%{}%% \n  title Topic\n",
    options: {},
    input: "```mermaid\ninfo\naccDescr {D}%%{}%% \ntitle Topic\n```\n",
    output: "```mermaid\ninfo\n  accDescr {D}%%{}%% \n  title Topic\n```\n",
  },
  {
    name: "info Markdown: preheader",
    payloadInput: "\n---\ntitle: Hidden host\n---\ninfo\ntitle Topic",
    payloadOutput: "\n---\ntitle: Hidden host\n---\ninfo\n  title Topic\n",
    options: {},
    input:
      "```mermaid\n\n---\ntitle: Hidden host\n---\ninfo\ntitle Topic\n```\n",
    output:
      "```mermaid\n\n---\ntitle: Hidden host\n---\ninfo\n  title Topic\n```\n",
  },
  {
    name: "info Markdown: frontmatter",
    payloadInput: "---\ntitle:   Real host\n---\ninfo\ntitle Topic",
    payloadOutput: "---\ntitle: Real host\n---\ninfo\n  title Topic\n",
    options: {},
    input: "```mermaid\n---\ntitle:   Real host\n---\ninfo\ntitle Topic\n```\n",
    output:
      "```mermaid\n---\ntitle: Real host\n---\ninfo\n  title Topic\n```\n",
  },
  {
    name: "info Markdown: global-and-semicolons",
    payloadInput: "%%{wrap}%%\ninfo title style:#a;b\naccDescr {D}",
    payloadOutput: "%%{wrap}%%\ninfo title style:#a;b\n  accDescr {D}\n",
    options: {},
    input: "```mermaid\n%%{wrap}%%\ninfo title style:#a;b\naccDescr {D}\n```\n",
    output:
      "```mermaid\n%%{wrap}%%\ninfo title style:#a;b\n  accDescr {D}\n```\n",
  },
  {
    name: "info Markdown: final-comment",
    payloadInput: "info\n%% note \t",
    payloadOutput: "info\n  %% note\n",
    options: {},
    hostTrims: true,
    input: "```mermaid\ninfo\n%% note \t\n```\n",
    output: "```mermaid\ninfo\n  %% note\n```\n",
  },
  {
    name: "info Markdown: final-hidden-padding",
    payloadInput: "info\naccDescr {D}%%{}%% \t",
    payloadOutput: "info\n  accDescr {D}%%{}%%\n",
    options: {},
    hostTrims: true,
    input: "```mermaid\ninfo\naccDescr {D}%%{}%% \t\n```\n",
    output: "```mermaid\ninfo\n  accDescr {D}%%{}%%\n```\n",
  },
  {
    name: "info Markdown: rejected",
    payloadInput: "info  \nunsupported  ",
    payloadOutput: "info\nunsupported\n",
    options: {},
    rejected: true,
    input: "- item\n\n  ```mermaid\n  info  \n  unsupported  \n  ```\n",
    output: "- item\n\n  ```mermaid\n  info\n  unsupported\n  ```\n",
  },
]

describe("info in Markdown", () => {
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
      filepath: "info.mmd",
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
