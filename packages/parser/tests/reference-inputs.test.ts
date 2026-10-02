import { describe, expect, it } from "vitest"
import {
  frontmatterChangesAttributeQuotes,
  withoutDirectives,
  withoutFrontmatterTagStarts,
  commentsAfterMatchStarts,
  commentsAfterUnits,
  namesStartingWithUnits,
} from "./helpers/reference-inputs.ts"

describe("the reference input for `html-tag-in-frontmatter`", () => {
  it("replaces every `<` of the frontmatter trivia, and nothing after it", () => {
    expect(
      withoutFrontmatterTagStarts('---\ntitle: <a <b\n---\nA[<c d="e">f]'),
    ).toBe('---\ntitle: (a (b\n---\nA[<c d="e">f]')
    expect(withoutFrontmatterTagStarts("A[<a>]")).toBe("A[<a>]")
  })
})

describe("the reference input for `directive-as-token-boundary`", () => {
  it("removes directives and joins the text around them, after the frontmatter", () => {
    expect(withoutDirectives("err%%{init: {}}%%or")).toBe("error")
    expect(withoutDirectives("---\na: '%%{x}%%'\n---\n%%{a}%%x%%{b}%%")).toBe(
      "---\na: '%%{x}%%'\n---\nx",
    )
  })
})

describe("the places of `comment-takes-character`", () => {
  const header = "sequenceDiagram\n"

  /** The offsets of `commentsAfterMatchStarts` within `statements`, after the header line. */
  function placesIn(statements: string): number[] | undefined {
    return commentsAfterMatchStarts(header + statements)?.map(
      (offset) => offset - header.length,
    )
  }

  it("finds a `%%` right after the first character of a match or after a number", () => {
    expect(placesIn("C%% c")).toEqual([1])
    expect(placesIn("A->>B:%% c")).toEqual([6])
    expect(placesIn("Alice->>B%% cob: Hello")).toEqual([9])
    expect(placesIn("autonumber 10%% c")).toEqual([13])
    expect(placesIn("autonumber 5 2%% c")).toEqual([14])
  })

  it("finds no `%%` inside a unit that the same match reads after another", () => {
    expect(placesIn("title x%% c")).toEqual([])
    expect(placesIn("A->>B: x%% c")).toEqual([])
    expect(placesIn("CD%% c->>B: x")).toEqual([])
  })

  it("decides on the diagram text, across the directives before the `%%`", () => {
    expect(placesIn("autonumber 1%%{init: {}}%%%% c")).toEqual([26])
  })
})

describe("the places of `comment-takes-line-break`", () => {
  it("finds a diagram comment that follows a unit on its line", () => {
    expect(commentsAfterUnits("classDiagram\nA --> B %% c\n")).toEqual([21])
    expect(commentsAfterUnits("classDiagram %% c\nclass A\n")).toEqual([13])
  })

  it("finds no comment of a comment-only line, nor `%%` in a label", () => {
    expect(commentsAfterUnits("classDiagram\nclass A\n%%\nclass B\n")).toEqual(
      [],
    )
    expect(commentsAfterUnits("classDiagram\n  %%{\nclass B\n")).toEqual([])
    expect(commentsAfterUnits("classDiagram\nA : x %% c\n")).toEqual([])
  })

  it("is null for a text that is no class diagram", () => {
    expect(commentsAfterUnits("sequenceDiagram\nA->>B: x %% c\n")).toBeNull()
  })
})

describe("the places of `name-start-reads-unit`", () => {
  it("finds a backquoted name or a generic text that starts with a unit that mermaid.js reads first", () => {
    expect(namesStartingWithUnits('classDiagram\nclass `"x`\n')).toEqual([19])
    expect(namesStartingWithUnits("classDiagram\nclass `~b`\n")).toEqual([19])
    expect(namesStartingWithUnits("classDiagram\nclass `note x`\n")).toEqual([
      19,
    ])
    expect(namesStartingWithUnits("classDiagram\nclass A~note x~\n")).toEqual([
      21,
    ])
  })

  it("finds no keyword that a word character follows, nor one later in the text, nor `~` at the start of a generic text", () => {
    expect(namesStartingWithUnits("classDiagram\nclass `notex`\n")).toEqual([])
    expect(namesStartingWithUnits("classDiagram\nclass `x note`\n")).toEqual([])
    expect(namesStartingWithUnits("classDiagram\nclass A~ note~\n")).toEqual([])
    expect(namesStartingWithUnits("classDiagram\nclass A~~\n")).toEqual([])
  })
})

describe("frontmatterChangesAttributeQuotes", () => {
  it.each([
    // A tag that starts in the frontmatter reaches a `"` of the text.
    ['---\ntitle: <a\n---\nflowchart LR\nA[b="c">d]\n', true],
    ['---\ntitle: <a\n---\n%% b="c">\nerror\n', true],
    // A value that opens in the frontmatter closes at the first `"` of the
    // text for mermaid.js, so the quotes of the tag in the text pair differently.
    ['---\ntitle: <a x="\n---\nA[<b c="d">e]', true],
    // A tag that starts in the frontmatter and ends at the `>` of a tag of
    // the text holds the same quoted values as that tag: no difference.
    ['---\ntitle: <a\n---\nA[<b c="d">e]>', false],
    // A tag that starts and ends in the frontmatter changes nothing in the text.
    ['---\ntitle: <a b="c">\n---\nA[<d e="f">g]', false],
    ['---\ntitle: x\n---\nA[<a href="u">t</a>]', false],
    // Without frontmatter the two readings are the same.
    ['flowchart LR\n%% <a\nA[b="c">d]\n', false],
    ["", false],
  ])("%j: %j", (text, expected) => {
    expect(frontmatterChangesAttributeQuotes(text)).toBe(expected)
  })
})
