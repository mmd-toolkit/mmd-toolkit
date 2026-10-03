/**
 * Checks which tokens the printers take for tokens of a node's structure:
 * the tokens of the diagram text, without the directives, the `;` tokens,
 * and the tokens of the frontmatter, whose `---` delimiters have the kind
 * and the value of a flowchart arrow, and which line feeds the comment
 * regions that join lines remove (src/printers/source.ts).
 */
import { describe, expect, it } from "vitest"
import { parse } from "@mmd-toolkit/parser"
import type { Source } from "../src/printers/source.ts"
import {
  createSource,
  findStructuralToken,
  findStructuralTokenEndingBefore,
  isStructural,
} from "../src/printers/source.ts"

/** Parses a text and makes its printing context. */
function sourceOf(text: string): Source {
  return createSource(text, parse(text))
}

const withFrontmatter = "---\ntitle: t\n---\nflowchart LR\nA---B\n"

describe("structural tokens", () => {
  it("leave out the tokens of the frontmatter, and keep an arrow of the same value", () => {
    const source = sourceOf(withFrontmatter)
    const dashes = source.root.tokens.filter((token) => token.value === "---")
    expect(dashes.map((token) => isStructural(source, token))).toEqual([
      false,
      false,
      true,
    ])
  })

  it("are not found in the frontmatter, forward or back", () => {
    const source = sourceOf(withFrontmatter)
    expect(findStructuralToken(source, 0)?.value).toBe("flowchart")
    const keyword = source.text.indexOf("flowchart")
    expect(findStructuralTokenEndingBefore(source, keyword)).toBeUndefined()
  })

  it("leave out directives and `;` tokens", () => {
    const source = sourceOf("flowchart LR\nA%%{init: {}}%%-->B;\n")
    const values = source.root.tokens
      .filter((token) => !isStructural(source, token))
      .map((token) => token.value)
    expect(values).toEqual(["%%{init: {}}%%", ";"])
  })
})

/** The lines (counted from 0) whose line feed a comment region removes. */
function removedLines(text: string): number[] {
  return [...sourceOf(text).removedLineFeeds].map(
    (offset) => text.slice(0, offset).split("\n").length - 1,
  )
}

describe("comment regions that join lines", () => {
  it("remove the line feed of a comment line that follows U+2028", () => {
    expect(removedLines("flowchart LR\nA\u2028%% c\n;B\n")).toEqual([1])
    expect(removedLines("flowchart LR\nA\u2029  %% c\n;B\n")).toEqual([1])
  })

  it("remove nothing for a comment line after a line break", () => {
    expect(removedLines("flowchart LR\nA\n%% c\nB\n")).toEqual([])
  })

  it("remove nothing for a `#` comment, which the lexer of its diagram reads", () => {
    const text = "sequenceDiagram\nA->>B: x\u2028# c\nC->>D: y\n"
    expect(removedLines(text)).toEqual([])
    expect(sourceOf(text).joiningRegions).toEqual([])
  })

  it("take the whitespace-only lines before a comment line, and follow one another", () => {
    expect(removedLines("flowchart LR\nA\u2028%% a\n  \n%% b\n;B\n")).toEqual([
      1, 2, 3,
    ])
  })

  it("leave an empty line after the comment line as the end of the line", () => {
    expect(removedLines("flowchart LR\nA\u2028%% c\n\n;B\n")).toEqual([1])
  })

  it("start after a U+2028 that precedes a directive", () => {
    expect(
      removedLines("flowchart LR\nA\u2028%%{init: {}}%% %% c\n;B\n"),
    ).toEqual([1])
  })

  it("join nothing at the end of the text, but are still regions", () => {
    const source = sourceOf("flowchart LR\nA\u2028%% c\n")
    expect(source.removedLineFeeds.size).toBe(0)
    expect(source.joiningRegions).toHaveLength(1)
  })

  it("are no regions for a `%%` that is no comment line", () => {
    for (const marker of ["%%", "%%{ }%%"]) {
      const source = sourceOf(`classDiagram\nA\u2028${marker}\nB\n`)
      expect(source.joiningRegions).toEqual([])
      expect(source.removedLineFeeds.size).toBe(0)
    }
  })

  it("start before a directive, not after a line break inside it", () => {
    const text = "flowchart LR\nA\u2028%%{init:\n{}}%% %% c\n;B\n"
    const source = sourceOf(text)
    expect(source.joiningRegions.map((region) => region.start)).toEqual([
      text.indexOf("%%{init:"),
    ])
    expect(removedLines(text)).toEqual([1, 2])
  })

  it("take an empty line before the next comment line into the region", () => {
    expect(removedLines("flowchart LR\nA\u2028%% a\n\n%% b\n;B\n")).toEqual([
      1, 2, 3,
    ])
  })

  it("start at the earliest comment start, after the first U+2028", () => {
    const text = "flowchart LR\nA\u2028 \u2028%% c\n;B\n"
    expect(sourceOf(text).joiningRegions.map((region) => region.start)).toEqual(
      [text.indexOf("\u2028") + 1],
    )
  })

  it("are no regions for a `%%` comment in the middle of a line", () => {
    const source = sourceOf("sequenceDiagram\nA->>B: x\u2028y %% c\n")
    expect(source.joiningRegions).toEqual([])
    expect(source.removedLineFeeds.size).toBe(0)
  })
})
