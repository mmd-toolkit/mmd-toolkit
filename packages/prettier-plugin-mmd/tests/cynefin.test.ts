/** Escaped cynefin Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import type { Node } from "@mmd-toolkit/parser"
import { parse, visitorKeys } from "@mmd-toolkit/parser"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  describeFrontmatterChange,
  treeProblemsOfText,
  writtenEmbeddedTexts,
  writtenTextKeptUpToSemicolons,
} from "./db-reading.ts"
import { cynefinCases } from "./cynefin-cases.ts"
import { loadFormatFixtures } from "./fixtures.ts"

/** Owner paths and source text must survive moving ordinary domain/item lines. */
function hiddenOwners(text: string): readonly (readonly [string, string])[] {
  const owners: [string, string][] = []
  const normalized = parserText(text)
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n")

  /** Follow the authored child fields without reconstructing effective values. */
  function visit(node: Node, path: string): void {
    if (node.type === "CynefinIgnoredText")
      owners.push([path, normalized.slice(...node.range)])
    for (const key of visitorKeys[node.type]) {
      const value = (node as unknown as Record<string, unknown>)[key]
      if (Array.isArray(value))
        for (const [index, child] of (value as Node[]).entries())
          visit(child, `${path}.${key}[${index}]`)
      else if (value !== null) visit(value as Node, `${path}.${key}`)
    }
  }

  visit(parse(normalized), "root")
  return owners
}

/** The source Prettier gives the parser, without a leading byte order mark. */
function parserText(text: string): string {
  return text.startsWith("\ufeff") ? text.slice(1) : text
}

describe("cynefin escaped cases", () => {
  it.each(cynefinCases)("$name", async (fixture) => {
    const { input, output, options } = fixture
    expect(await formatMermaid(input, "diagram.mmd", options)).toBe(output)
    const twice = await formatMermaid(output, "diagram.mmd", options)
    expect(twice).toBe(output)
    expect(await formatMermaid(twice, "diagram.mmd", options)).toBe(twice)
    const before = parserText(input)
    const after = parserText(output)
    const embedded = defaultEmbedded()
    expect(dbOfText(after, embedded)).toEqual(dbOfText(before, embedded))
    expect(writtenEmbeddedTexts(after)).toEqual(writtenEmbeddedTexts(before))
    expect(await describeFrontmatterChange(before, after, options)).toBeNull()
    expect(writtenTextKeptUpToSemicolons(before, after)).toBe(true)
    expect(treeProblemsOfText(before)).toEqual([])
    expect(treeProblemsOfText(after)).toEqual([])
    expect(hiddenOwners(output)).toEqual(hiddenOwners(input))
  })
})

describe("cynefin authored owners", async () => {
  const fixtures = (await loadFormatFixtures()).filter((fixture) =>
    fixture.id.startsWith("cynefin/"),
  )
  it.each(fixtures)("$id", (fixture) => {
    expect(hiddenOwners(fixture.output!)).toEqual(hiddenOwners(fixture.input))
    expect(treeProblemsOfText(fixture.output!)).toEqual([])
  })
})
