import { describe, expect, it } from "vitest"
import { findAttributeQuotes } from "../src/html-quotes.ts"
import { SourceLexer } from "../src/source-lexer.ts"
import { textStartOf } from "./helpers/reference-inputs.ts"

// Expectations come from common.md, HTML attribute quotes: tags are found in
// the text after the frontmatter, in its characters as written.

describe("findAttributeQuotes", () => {
  it.each([
    ['A[<a href="u">t</a>]', [10, 12]],
    ['<a b="1" c="2">', [5, 7, 11, 13]],
    // The attribute part may span lines.
    ['<a\nb="1">', [5, 7]],
    // A `<` not followed by a word character starts no tag.
    ['< a b="1">', []],
    ['<-a b="1">', []],
    // Without a `>` anywhere after it, a `<` starts no tag.
    ['<a b="1"', []],
    ['<a b="1" <c d="2"', []],
    // Tags do not overlap, and are found from left to right: the `<b` lies
    // inside the tag that `<a` starts, so it is not a tag of its own.
    ['<a b="<c d="2">', [5, 11]],
    ['<a p="<b q=" r="s">', [5, 11, 15, 17]],
    ['<a b="1"><c d="2">', [5, 7, 14, 16]],
    // A quoted value needs its closing `"` before the `>`.
    ['<a b="1><c d="2">', [13, 15]],
    // A `"` that is not part of `="..."` is left alone.
    ['<a "b" c="d">', [9, 11]],
    // The tag name ends at the first character that is not a word character.
    ['<a="1">', [3, 5]],
    ['<a b="">', [5, 6]],
    // The characters as written: a tag starts on a comment line, and its
    // attribute part reaches into the diagram.
    ['flowchart LR\n%% <a\nA[b="c">d]\n', [23, 25]],
    // The frontmatter is not looked at: no tag starts in it.
    ['---\ntitle: <a\n---\nflowchart LR\nA[b="c">d]\n', []],
    ['---\ntitle: <a b="c">\n---\nA[<d e="f">g]', [32, 34]],
    // A tag crosses a directive.
    ['flowchart LR\nA[<a %%{init: {}}%% href="u">t]\n', [38, 40]],
    // A `>` on a comment line ends a tag, so the later `"` stay.
    ['flowchart LR\nA[<b]\n%% >\nB[c="d">e]\n', []],
    // A `"` on a comment line opens or closes a value.
    ['A[<a b="c\n%% "\nd">t]', [7, 13]],
    // The `;` that the line rule ignores is still there for this rule.
    ['A[<a style:#x=;"u">t]', []],
    ["", []],
    ["plain text", []],
  ])("%j has the quotes %j", (text, expected) => {
    expect([...findAttributeQuotes(text, textStartOf(text))]).toEqual(expected)
  })
})

describe("findAttributeQuotes from the start of the source", () => {
  it("finds the tags that mermaid.js finds, those that start in the frontmatter included", () => {
    const text = '---\ntitle: <a\n---\nflowchart LR\nA[b="c">d]\n'
    expect([...findAttributeQuotes(text, 0)]).toEqual([35, 37])
  })
})

describe("the lexer reads the attribute quotes of the text as `'`", () => {
  it("reads a `\"` of the text as `'` for a tag that starts on a comment line, and not for one in the frontmatter", () => {
    const text = '---\ntitle: <x\n---\n%% <a\nA[b="c">d]'
    const lexer = new SourceLexer(text, textStartOf(text))
    // The first token comes after the comment line.
    const texts: string[] = []
    let offset = lexer.firstTokenStart()
    for (;;) {
      const element = lexer.readAt(offset)
      if (element.kind === "directive" || element.endOfText) break
      texts.push(element.text)
      offset = element.end
    }
    expect(texts.join("")).toBe("A[b='c'>d]")
    const onlyFrontmatter = '---\ntitle: <a\n---\nA[b="c">d]'
    expect([
      ...findAttributeQuotes(onlyFrontmatter, textStartOf(onlyFrontmatter)),
    ]).toEqual([])
  })
})
