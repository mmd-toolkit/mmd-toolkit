/** Markdown containers and dedented Cynefin payloads have separate checks. */
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
    name: "cynefin Markdown: top-level",
    input: "```mermaid\ncynefin-beta:complex\"FencedAlpha\"'FencedBeta'\n```\n",
    output:
      "```mermaid\ncynefin-beta:\n  complex\n    \"FencedAlpha\"\n    'FencedBeta'\n```\n",
    payloadInput: "cynefin-beta:complex\"FencedAlpha\"'FencedBeta'",
    payloadOutput:
      "cynefin-beta:\n  complex\n    \"FencedAlpha\"\n    'FencedBeta'\n",
    options: {},
  },
  {
    name: "cynefin Markdown: list",
    input:
      '- item\n\n  ```mermaid\n  cynefin-beta\n  complex "ListFirst" "ListSecond"\n  ```\n',
    output:
      '- item\n\n  ```mermaid\n  cynefin-beta\n    complex\n      "ListFirst"\n      "ListSecond"\n  ```\n',
    payloadInput: 'cynefin-beta\ncomplex "ListFirst" "ListSecond"',
    payloadOutput:
      'cynefin-beta\n  complex\n    "ListFirst"\n    "ListSecond"\n',
    options: {},
  },
  {
    name: "cynefin Markdown: quote",
    input:
      "> ```mmd\n> cynefin-beta\n> clear 'QuoteFirst\n>     continuation'\n> ```\n",
    output:
      "> ```mmd\n> cynefin-beta\n>   clear\n>     'QuoteFirst\n>     continuation'\n> ```\n",
    payloadInput: "cynefin-beta\nclear 'QuoteFirst\n    continuation'",
    payloadOutput:
      "cynefin-beta\n  clear\n    'QuoteFirst\n    continuation'\n",
    options: {},
  },
  {
    name: "cynefin Markdown: zero",
    input: '```mermaid\ncynefin-beta\ncomplex "ZeroFence"\n```\n',
    output: '```mermaid\ncynefin-beta\ncomplex\n"ZeroFence"\n```\n',
    payloadInput: 'cynefin-beta\ncomplex "ZeroFence"',
    payloadOutput: 'cynefin-beta\ncomplex\n"ZeroFence"\n',
    options: {
      tabWidth: 0,
    },
  },
  {
    name: "cynefin Markdown: tabs",
    input: '```mermaid\ncynefin-beta\ncomplex "TabsFence"\n```\n',
    output: '```mermaid\ncynefin-beta\n\tcomplex\n\t\t"TabsFence"\n```\n',
    payloadInput: 'cynefin-beta\ncomplex "TabsFence"',
    payloadOutput: 'cynefin-beta\n\tcomplex\n\t\t"TabsFence"\n',
    options: {
      useTabs: true,
    },
  },
  {
    name: "cynefin Markdown: hidden-boundary",
    input:
      '```mermaid\ncynefin-beta\ncomplex-->clear%%{!fenced-gap}%% \nchaotic "FencedFollowing"\n```\n',
    output:
      '```mermaid\ncynefin-beta\n  complex --> clear%%{!fenced-gap}%% \n  chaotic\n    "FencedFollowing"\n```\n',
    payloadInput:
      'cynefin-beta\ncomplex-->clear%%{!fenced-gap}%% \nchaotic "FencedFollowing"',
    payloadOutput:
      'cynefin-beta\n  complex --> clear%%{!fenced-gap}%% \n  chaotic\n    "FencedFollowing"\n',
    options: {},
  },
  {
    name: "cynefin Markdown: header-hidden",
    input:
      '```mermaid\ncynefin-beta:%%{!host-header}%%\ncomplex "HostHidden"\n```\n',
    output:
      '```mermaid\ncynefin-beta:%%{!host-header}%%\n  complex\n    "HostHidden"\n```\n',
    payloadInput: 'cynefin-beta:%%{!host-header}%%\ncomplex "HostHidden"',
    payloadOutput:
      'cynefin-beta:%%{!host-header}%%\n  complex\n    "HostHidden"\n',
    options: {},
  },
  {
    name: "cynefin Markdown: prefix",
    input:
      '```mermaid\n\n---\ntitle: Ignored host\n---\ncynefin-beta\nclear "HostPrefix"\n```\n',
    output:
      '```mermaid\n\n---\ntitle: Ignored host\n---\ncynefin-beta\n  clear\n    "HostPrefix"\n```\n',
    payloadInput:
      '\n---\ntitle: Ignored host\n---\ncynefin-beta\nclear "HostPrefix"',
    payloadOutput:
      '\n---\ntitle: Ignored host\n---\ncynefin-beta\n  clear\n    "HostPrefix"\n',
    options: {},
  },
  {
    name: "cynefin Markdown: frontmatter",
    input:
      '```mermaid\n---\ntitle:   Fenced YAML\n---\ncynefin-beta\nclear "HostYaml"\n```\n',
    output:
      '```mermaid\n---\ntitle: Fenced YAML\n---\ncynefin-beta\n  clear\n    "HostYaml"\n```\n',
    payloadInput:
      '---\ntitle:   Fenced YAML\n---\ncynefin-beta\nclear "HostYaml"',
    payloadOutput:
      '---\ntitle: Fenced YAML\n---\ncynefin-beta\n  clear\n    "HostYaml"\n',
    options: {},
  },
  {
    name: "cynefin Markdown: final-hidden-padding",
    input:
      "```mermaid\ncynefin-beta\ncomplex-->clear%%{!fenced-final}%% \t\n```\n",
    output:
      "```mermaid\ncynefin-beta\n  complex --> clear%%{!fenced-final}%%\n```\n",
    payloadInput: "cynefin-beta\ncomplex-->clear%%{!fenced-final}%% \t",
    payloadOutput: "cynefin-beta\n  complex --> clear%%{!fenced-final}%%\n",
    options: {},
    hostTrims: true,
  },
  {
    name: "cynefin Markdown: rejected",
    input: '```mermaid\ncynefin-beta  \ncomplex {"BadHost"}\n```\n',
    output: '```mermaid\ncynefin-beta\ncomplex {"BadHost"}\n```\n',
    payloadInput: 'cynefin-beta  \ncomplex {"BadHost"}',
    payloadOutput: 'cynefin-beta\ncomplex {"BadHost"}\n',
    options: {},
    rejected: true,
  },
]

describe("cynefin in Markdown", () => {
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
      filepath: "cynefin.mmd",
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
