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
    name: "packet Markdown: top-level",
    input: '```mermaid\npacket-beta0:"Fence"\n```\n',
    output: '```mermaid\npacket-beta\n  0: "Fence"\n```\n',
    payloadInput: 'packet-beta0:"Fence"',
    payloadOutput: 'packet-beta\n  0: "Fence"\n',
    options: {},
  },
  {
    name: "packet Markdown: list",
    input:
      '- item\n\n  ```mermaid\n  packet\n  accDescr {\n   one\n     two\n  }\n  0:"List"\n  ```\n',
    output:
      '- item\n\n  ```mermaid\n  packet\n    accDescr {\n   one\n     two\n    }\n    0: "List"\n  ```\n',
    payloadInput: 'packet\naccDescr {\n one\n   two\n}\n0:"List"',
    payloadOutput: 'packet\n  accDescr {\n one\n   two\n  }\n  0: "List"\n',
    options: {},
  },
  {
    name: "packet Markdown: quote",
    input: '> ```mmd\n> packet\n> 0:"first\n>    second"\n> ```\n',
    output: '> ```mmd\n> packet\n>   0: "first\n>    second"\n> ```\n',
    payloadInput: 'packet\n0:"first\n   second"',
    payloadOutput: 'packet\n  0: "first\n   second"\n',
    options: {},
  },
  {
    name: "packet Markdown: zero",
    input: '```mermaid\npacket\n0:"Zero host"\naccTitle:  Title  \n```\n',
    output: '```mermaid\npacket\n0: "Zero host"\naccTitle: Title\n```\n',
    payloadInput: 'packet\n0:"Zero host"\naccTitle:  Title  ',
    payloadOutput: 'packet\n0: "Zero host"\naccTitle: Title\n',
    options: {
      tabWidth: 0,
    },
  },
  {
    name: "packet Markdown: tabs",
    input: '```mermaid\npacket\n0:"Tabs host"\n```\n',
    output: '```mermaid\npacket\n\t0: "Tabs host"\n```\n',
    payloadInput: 'packet\n0:"Tabs host"',
    payloadOutput: 'packet\n\t0: "Tabs host"\n',
    options: {
      useTabs: true,
    },
  },
  {
    name: "packet Markdown: hidden-gap",
    input: '```mermaid\npacket\n+%%{!}%%\n2:"Gap host"\n```\n',
    output: '```mermaid\npacket\n  +%%{!}%%\n2: "Gap host"\n```\n',
    payloadInput: 'packet\n+%%{!}%%\n2:"Gap host"',
    payloadOutput: 'packet\n  +%%{!}%%\n2: "Gap host"\n',
    options: {},
  },
  {
    name: "packet Markdown: hidden-boundary",
    input:
      '```mermaid\npacket\n0:"Boundary host"%%{!}%% \n1:"Following host"\n```\n',
    output:
      '```mermaid\npacket\n  0: "Boundary host"%%{!}%% \n  1: "Following host"\n```\n',
    payloadInput: 'packet\n0:"Boundary host"%%{!}%% \n1:"Following host"',
    payloadOutput:
      'packet\n  0: "Boundary host"%%{!}%% \n  1: "Following host"\n',
    options: {},
  },
  {
    name: "packet Markdown: preheader",
    input:
      '```mermaid\n\n---\ntitle: Hidden host title\n---\npacket\n0:"Prefix host"\n```\n',
    output:
      '```mermaid\n\n---\ntitle: Hidden host title\n---\npacket\n  0: "Prefix host"\n```\n',
    payloadInput:
      '\n---\ntitle: Hidden host title\n---\npacket\n0:"Prefix host"',
    payloadOutput:
      '\n---\ntitle: Hidden host title\n---\npacket\n  0: "Prefix host"\n',
    options: {},
  },
  {
    name: "packet Markdown: frontmatter",
    input:
      '```mermaid\n---\ntitle:   Real host title\n---\npacket\n0:"Yaml host"\n```\n',
    output:
      '```mermaid\n---\ntitle: Real host title\n---\npacket\n  0: "Yaml host"\n```\n',
    payloadInput: '---\ntitle:   Real host title\n---\npacket\n0:"Yaml host"',
    payloadOutput:
      '---\ntitle: Real host title\n---\npacket\n  0: "Yaml host"\n',
    options: {},
  },
  {
    name: "packet Markdown: global-and-semicolons",
    input:
      '```mermaid\n%%{wrap}%%\npacket title style:#a;b\n0:"style:#c;d"\n```\n',
    output:
      '```mermaid\n%%{wrap}%%\npacket title style:#a;b\n  0:"style:#c;d"\n```\n',
    payloadInput: '%%{wrap}%%\npacket title style:#a;b\n0:"style:#c;d"',
    payloadOutput: '%%{wrap}%%\npacket title style:#a;b\n  0:"style:#c;d"\n',
    options: {},
  },
  {
    name: "packet Markdown: final-comment",
    input: '```mermaid\npacket\n0:"Comment host"%% final  \n```\n',
    output: '```mermaid\npacket\n  0: "Comment host"%% final\n```\n',
    payloadInput: 'packet\n0:"Comment host"%% final  ',
    payloadOutput: 'packet\n  0: "Comment host"%% final\n',
    options: {},
    hostTrims: true,
  },
  {
    name: "packet Markdown: final-hidden-padding",
    input: '```mermaid\npacket\n0:"Last host"%%{!}%% \n```\n',
    output: '```mermaid\npacket\n  0: "Last host"%%{!}%%\n```\n',
    payloadInput: 'packet\n0:"Last host"%%{!}%% ',
    payloadOutput: 'packet\n  0: "Last host"%%{!}%%\n',
    options: {},
    hostTrims: true,
  },
  {
    name: "packet Markdown: rejected",
    input:
      '- item\n\n  ```mermaid\n  packet  \n  0:"Rejected host";  \n  ```\n',
    output: '- item\n\n  ```mermaid\n  packet\n  0:"Rejected host";\n  ```\n',
    payloadInput: 'packet  \n0:"Rejected host";  ',
    payloadOutput: 'packet\n0:"Rejected host";\n',
    options: {},
    rejected: true,
  },
]

describe("packet in Markdown", () => {
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
      filepath: "packet.mmd",
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
