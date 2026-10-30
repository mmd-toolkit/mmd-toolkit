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
    name: "treemap Markdown: top-level",
    input: '```mermaid\ntreemap"HostRoot"\n "HostChild":3\n```\n',
    payloadInput: 'treemap"HostRoot"\n "HostChild":3',
    options: {},
    output: '```mermaid\ntreemap\n  "HostRoot"\n    "HostChild": 3\n```\n',
    payloadOutput: 'treemap\n  "HostRoot"\n    "HostChild": 3\n',
  },
  {
    name: "treemap Markdown: list",
    input:
      '- item\n\n  ```mermaid\n  treemap\n  "ListRoot"\n   "ListChild\n    continuation":3\n  ```\n',
    payloadInput: 'treemap\n"ListRoot"\n "ListChild\n  continuation":3',
    options: {},
    output:
      '- item\n\n  ```mermaid\n  treemap\n    "ListRoot"\n      "ListChild\n    continuation": 3\n  ```\n',
    payloadOutput:
      'treemap\n  "ListRoot"\n    "ListChild\n  continuation": 3\n',
  },
  {
    name: "treemap Markdown: quote",
    input: '> ```mmd\n> treemap\n> "QuoteRoot"\n>  "QuoteChild":3\n> ```\n',
    payloadInput: 'treemap\n"QuoteRoot"\n "QuoteChild":3',
    options: {},
    output:
      '> ```mmd\n> treemap\n>   "QuoteRoot"\n>     "QuoteChild": 3\n> ```\n',
    payloadOutput: 'treemap\n  "QuoteRoot"\n    "QuoteChild": 3\n',
  },
  {
    name: "treemap Markdown: zero",
    input: '```mermaid\ntreemap\n"ZeroHost"\n "ZeroChild":3\n```\n',
    payloadInput: 'treemap\n"ZeroHost"\n "ZeroChild":3',
    options: {
      tabWidth: 0,
    },
    output: '```mermaid\ntreemap\n "ZeroHost"\n  "ZeroChild": 3\n```\n',
    payloadOutput: 'treemap\n "ZeroHost"\n  "ZeroChild": 3\n',
  },
  {
    name: "treemap Markdown: tabs",
    input: '```mermaid\ntreemap\n"TabsHost"\n "TabsChild":3\n```\n',
    payloadInput: 'treemap\n"TabsHost"\n "TabsChild":3',
    options: {
      useTabs: true,
    },
    output: '```mermaid\ntreemap\n\t"TabsHost"\n\t\t"TabsChild": 3\n```\n',
    payloadOutput: 'treemap\n\t"TabsHost"\n\t\t"TabsChild": 3\n',
  },
  {
    name: "treemap Markdown: carried-indent",
    input: '```mermaid\ntreemap\n"CarryHost"  \n"CarryChild":3\n```\n',
    payloadInput: 'treemap\n"CarryHost"  \n"CarryChild":3',
    options: {},
    output: '```mermaid\ntreemap\n  "CarryHost"\n    "CarryChild": 3\n```\n',
    payloadOutput: 'treemap\n  "CarryHost"\n    "CarryChild": 3\n',
  },
  {
    name: "treemap Markdown: directives-comments",
    input:
      '```mermaid\ntreemap\n"TriviaHost"\n%%\n %%{wrap}%% "TriviaChild":3\n```\n',
    payloadInput: 'treemap\n"TriviaHost"\n%%\n %%{wrap}%% "TriviaChild":3',
    options: {},
    output:
      '```mermaid\ntreemap\n  "TriviaHost"\n%%\n   %%{wrap}%% "TriviaChild": 3\n```\n',
    payloadOutput:
      'treemap\n  "TriviaHost"\n%%\n   %%{wrap}%% "TriviaChild": 3\n',
  },
  {
    name: "treemap Markdown: glued-class",
    input:
      '```mermaid\ntreemap\nclassDef zz"GluedHost"  "GluedChild":3\n"OtherHost"\n```\n',
    payloadInput:
      'treemap\nclassDef zz"GluedHost"  "GluedChild":3\n"OtherHost"',
    options: {},
    output:
      '```mermaid\ntreemap\n  classDef zz"GluedHost"\n  "GluedChild": 3\n"OtherHost"\n```\n',
    payloadOutput:
      'treemap\n  classDef zz"GluedHost"\n  "GluedChild": 3\n"OtherHost"\n',
  },
  {
    name: "treemap Markdown: protected",
    input: '```mermaid\ntreemap"style:#navy;":3 "ProtectedHost":4\n```\n',
    payloadInput: 'treemap"style:#navy;":3 "ProtectedHost":4',
    options: {},
    output: '```mermaid\ntreemap"style:#navy;":3 "ProtectedHost":4\n```\n',
    payloadOutput: 'treemap"style:#navy;":3 "ProtectedHost":4',
  },
  {
    name: "treemap Markdown: description",
    input:
      '```mermaid\ntreemap\naccDescr {\n detail\n}\n"DescriptionHost":3\n```\n',
    payloadInput: 'treemap\naccDescr {\n detail\n}\n"DescriptionHost":3',
    options: {},
    output:
      '```mermaid\ntreemap\n  accDescr {\n detail\n  }\n  "DescriptionHost": 3\n```\n',
    payloadOutput:
      'treemap\n  accDescr {\n detail\n  }\n  "DescriptionHost": 3\n',
  },
  {
    name: "treemap Markdown: frontmatter",
    input:
      '```mermaid\n---\ntitle:   Host map\n---\ntreemap\n"YamlHost":3\n```\n',
    payloadInput: '---\ntitle:   Host map\n---\ntreemap\n"YamlHost":3',
    options: {},
    output:
      '```mermaid\n---\ntitle: Host map\n---\ntreemap\n  "YamlHost": 3\n```\n',
    payloadOutput: '---\ntitle: Host map\n---\ntreemap\n  "YamlHost": 3\n',
  },
  {
    name: "treemap Markdown: final-style-padding",
    input: "```mermaid\ntreemap\nclassDef zz color:navy  \n```\n",
    payloadInput: "treemap\nclassDef zz color:navy  ",
    options: {},
    hostTrims: true,
    output: "```mermaid\ntreemap\n  classDef zz color:navy\n```\n",
    payloadOutput: "treemap\n  classDef zz color:navy\n",
  },
  {
    name: "treemap Markdown: rejected",
    input:
      '- item\n\n  ```mermaid\n  treemap:  \n  "RejectedHost":3;  \n  ```\n',
    payloadInput: 'treemap:  \n"RejectedHost":3;  ',
    options: {},
    rejected: true,
    output: '- item\n\n  ```mermaid\n  treemap:\n  "RejectedHost":3;\n  ```\n',
    payloadOutput: 'treemap:\n"RejectedHost":3;\n',
  },
]

describe("treemap in Markdown", () => {
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
      filepath: "treemap.mmd",
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
