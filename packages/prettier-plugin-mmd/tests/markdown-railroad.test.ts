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
    name: "railroad Markdown: ir-top-level",
    input: '```mermaid\nrailroad-beta r=terminal("fenced");\n```\n',
    output: '```mermaid\nrailroad-beta\n  r = terminal("fenced");\n```\n',
    payloadInput: 'railroad-beta r=terminal("fenced");',
    payloadOutput: 'railroad-beta\n  r = terminal("fenced");\n',
    options: {},
  },
  {
    name: "railroad Markdown: ebnf-list",
    input:
      '- item\n\n  ```mermaid\n  railroad-ebnf-beta\n  accDescr {\n   first\n     continuation\n  }\n  r::=( "fenced" );\n  ```\n',
    output:
      '- item\n\n  ```mermaid\n  railroad-ebnf-beta\n    accDescr {\n   first\n     continuation\n    }\n    r ::= ("fenced");\n  ```\n',
    payloadInput:
      'railroad-ebnf-beta\naccDescr {\n first\n   continuation\n}\nr::=( "fenced" );',
    payloadOutput:
      'railroad-ebnf-beta\n  accDescr {\n first\n   continuation\n  }\n  r ::= ("fenced");\n',
    options: {},
  },
  {
    name: "railroad Markdown: abnf-quote",
    input:
      '> ```mmd\n> railroad-abnf-beta\n> r=2*4 ("first\n>    continuation");\n> ```\n',
    output:
      '> ```mmd\n> railroad-abnf-beta\n>   r = 2*4("first\n>    continuation");\n> ```\n',
    payloadInput: 'railroad-abnf-beta\nr=2*4 ("first\n   continuation");',
    payloadOutput: 'railroad-abnf-beta\n  r = 2*4("first\n   continuation");\n',
    options: {},
  },
  {
    name: "railroad Markdown: peg-zero",
    input: '```mermaid\nrailroad-peg-beta\nr<- & ( "fenced" ) +;\n```\n',
    output: '```mermaid\nrailroad-peg-beta\nr <- &("fenced")+;\n```\n',
    payloadInput: 'railroad-peg-beta\nr<- & ( "fenced" ) +;',
    payloadOutput: 'railroad-peg-beta\nr <- &("fenced")+;\n',
    options: { tabWidth: 0 },
  },
  {
    name: "railroad Markdown: ir-tabs",
    input: '```mermaid\nrailroad-beta\nr=terminal("tabs host");\n```\n',
    output: '```mermaid\nrailroad-beta\n\tr = terminal("tabs host");\n```\n',
    payloadInput: 'railroad-beta\nr=terminal("tabs host");',
    payloadOutput: 'railroad-beta\n\tr = terminal("tabs host");\n',
    options: { useTabs: true },
  },
  {
    name: "railroad Markdown: ebnf-hidden-gap",
    input:
      '```mermaid\nrailroad-ebnf-beta\nr=%%{!host}%%\n"hidden host";\n```\n',
    output:
      '```mermaid\nrailroad-ebnf-beta\n  r =%%{!host}%%\n"hidden host";\n```\n',
    payloadInput: 'railroad-ebnf-beta\nr=%%{!host}%%\n"hidden host";',
    payloadOutput: 'railroad-ebnf-beta\n  r =%%{!host}%%\n"hidden host";\n',
    options: {},
  },
  {
    name: "railroad Markdown: abnf-prefix",
    input:
      '```mermaid\n\n---\ntitle: Hidden host\n---\nrailroad-abnf-beta\nr="prefix host";\n```\n',
    output:
      '```mermaid\n\n---\ntitle: Hidden host\n---\nrailroad-abnf-beta\n  r = "prefix host";\n```\n',
    payloadInput:
      '\n---\ntitle: Hidden host\n---\nrailroad-abnf-beta\nr="prefix host";',
    payloadOutput:
      '\n---\ntitle: Hidden host\n---\nrailroad-abnf-beta\n  r = "prefix host";\n',
    options: {},
  },
  {
    name: "railroad Markdown: peg-frontmatter",
    input:
      '```mermaid\n---\ntitle:   Real host\n---\nrailroad-peg-beta\nr<-"yaml host";\n```\n',
    output:
      '```mermaid\n---\ntitle: Real host\n---\nrailroad-peg-beta\n  r <- "yaml host";\n```\n',
    payloadInput:
      '---\ntitle:   Real host\n---\nrailroad-peg-beta\nr<-"yaml host";',
    payloadOutput:
      '---\ntitle: Real host\n---\nrailroad-peg-beta\n  r <- "yaml host";\n',
    options: {},
  },
  {
    name: "railroad Markdown: ir-final-comment",
    input:
      '```mermaid\nrailroad-beta\nr=terminal("comment host");%% final  \n```\n',
    output:
      '```mermaid\nrailroad-beta\n  r = terminal("comment host");%% final\n```\n',
    payloadInput: 'railroad-beta\nr=terminal("comment host");%% final  ',
    payloadOutput: 'railroad-beta\n  r = terminal("comment host");%% final\n',
    options: {},
    hostTrims: true,
  },
  {
    name: "railroad Markdown: peg-hidden-boundary",
    input:
      '```mermaid\nrailroad-peg-beta accDescr{host}%%{!suffix}%%\n\nr<-"after host";\n```\n',
    output:
      '```mermaid\nrailroad-peg-beta accDescr{host}%%{!suffix}%%\n\n  r <- "after host";\n```\n',
    payloadInput:
      'railroad-peg-beta accDescr{host}%%{!suffix}%%\n\nr<-"after host";',
    payloadOutput:
      'railroad-peg-beta accDescr{host}%%{!suffix}%%\n\n  r <- "after host";\n',
    options: {},
  },
  {
    name: "railroad Markdown: abnf-final-hidden-padding",
    input:
      '```mermaid\nrailroad-abnf-beta\nr="hidden host";\n%%{!last}%% \n```\n',
    output:
      '```mermaid\nrailroad-abnf-beta\n  r = "hidden host";\n  %%{!last}%%\n```\n',
    payloadInput: 'railroad-abnf-beta\nr="hidden host";\n%%{!last}%% ',
    payloadOutput: 'railroad-abnf-beta\n  r = "hidden host";\n  %%{!last}%%\n',
    options: {},
    hostTrims: true,
  },
  {
    name: "railroad Markdown: ir-rejected",
    input:
      '```mermaid\nrailroad-beta  \nr=terminal("missing terminator")\n```\n',
    output:
      '```mermaid\nrailroad-beta\nr=terminal("missing terminator")\n```\n',
    payloadInput: 'railroad-beta  \nr=terminal("missing terminator")',
    payloadOutput: 'railroad-beta\nr=terminal("missing terminator")\n',
    options: {},
    rejected: true,
  },
  {
    name: "railroad Markdown: ebnf-rejected",
    input: '```mermaid\nrailroad-ebnf-beta  \nr="missing terminator"\n```\n',
    output: '```mermaid\nrailroad-ebnf-beta\nr="missing terminator"\n```\n',
    payloadInput: 'railroad-ebnf-beta  \nr="missing terminator"',
    payloadOutput: 'railroad-ebnf-beta\nr="missing terminator"\n',
    options: {},
    rejected: true,
  },
  {
    name: "railroad Markdown: abnf-rejected",
    input: '```mermaid\nrailroad-abnf-beta  \nr="missing terminator"\n```\n',
    output: '```mermaid\nrailroad-abnf-beta\nr="missing terminator"\n```\n',
    payloadInput: 'railroad-abnf-beta  \nr="missing terminator"',
    payloadOutput: 'railroad-abnf-beta\nr="missing terminator"\n',
    options: {},
    rejected: true,
  },
  {
    name: "railroad Markdown: peg-rejected",
    input: '```mermaid\nrailroad-peg-beta  \nr<-"missing terminator"\n```\n',
    output: '```mermaid\nrailroad-peg-beta\nr<-"missing terminator"\n```\n',
    payloadInput: 'railroad-peg-beta  \nr<-"missing terminator"',
    payloadOutput: 'railroad-peg-beta\nr<-"missing terminator"\n',
    options: {},
    rejected: true,
  },
]

describe("railroad in Markdown", () => {
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
      filepath: "railroad.mmd",
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
