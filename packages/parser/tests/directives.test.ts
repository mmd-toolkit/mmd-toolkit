import { describe, expect, it } from "vitest"
import { findDirectives, readDirective } from "../src/directives.ts"

/** Runs the scan and returns `[source text, name, value, closed]` of each directive. */
function directivesOf(
  text: string,
  from = 0,
): [string, string, string, boolean][] {
  return findDirectives(text, from).map((directive) => [
    text.slice(...directive.range),
    directive.name,
    text.slice(...directive.valueRange),
    directive.closed,
  ])
}

// Expectations come from common.md, Where a directive is.

describe("findDirectives", () => {
  it.each([
    [
      "%%{init: {'a': 1}}%%",
      [["%%{init: {'a': 1}}%%", "init", "init: {'a': 1}", true]],
    ],
    [
      "%%{ init : {} }%% x",
      [["%%{ init : {} }%%", "init", " init : {} ", true]],
    ],
    // A word argument, with and without a colon.
    ["%%{init:dark}%% x", [["%%{init:dark}%%", "init", "init:dark", true]]],
    ["%%{wrap}%% x", [["%%{wrap}%%", "wrap", "wrap", true]]],
    // The argument is only the word; `foo}%%` is ordinary text.
    [
      "%%{init: dark foo}%%",
      [["%%{init: dark ", "init", "init: dark ", false]],
    ],
    // The whitespace before the argument crosses line breaks.
    ["%%{wrap\nA-->B", [["%%{wrap\nA", "wrap", "wrap\nA", false]]],
    // Free text runs to the first `}%%`, and a `}` alone does not end it.
    [
      '%%{init: {"x": 1}\nC-->D',
      [['%%{init: {"x": 1}\nC-->D', "init", 'init: {"x": 1}\nC-->D', false]],
    ],
    // Free text stops before U+2028; the whitespace after it takes U+2028 and a `}%%` still closes.
    [
      "%%{init: {'theme':'dark'}\u2028}%%\nx",
      [
        [
          "%%{init: {'theme':'dark'}\u2028}%%",
          "init",
          "init: {'theme':'dark'}\u2028",
          true,
        ],
      ],
    ],
    [
      "%%{init: { \u2028}}%%\nx",
      [["%%{init: { \u2028", "init", "init: { \u2028", false]],
    ],
    // Not directives: nothing but whitespace before `}`, or a non-word character first.
    ["%%{ }%%", []],
    ["%%{-x}%%", []],
    ["%%{", []],
    // Name and case do not matter.
    ["%%{INIT: {}}%%", [["%%{INIT: {}}%%", "INIT", "INIT: {}", true]]],
    ["%%{foo: bar}%%", [["%%{foo: bar}%%", "foo", "foo: bar", true]]],
    // The search continues after each directive; directives do not overlap.
    [
      "%%{a}%%%%{b}%%",
      [
        ["%%{a}%%", "a", "a", true],
        ["%%{b}%%", "b", "b", true],
      ],
    ],
    // A `%%{` that starts no directive is passed over, and the next one is found.
    ["%%{ }%%{a}%%", [["%%{a}%%", "a", "a", true]]],
    // A directive spans a lone `\r`.
    [
      "%%{init: {'a':\r'b'}}%%\nx",
      [["%%{init: {'a':\r'b'}}%%", "init", "init: {'a':\r'b'}", true]],
    ],
    // The name is a whole word, and an empty free text is allowed.
    ["%%{init}%%", [["%%{init}%%", "init", "init", true]]],
    ["%%{init:}%%", [["%%{init:}%%", "init", "init:", true]]],
  ])("%j", (text, expected) => {
    expect(directivesOf(text)).toEqual(expected)
  })

  it("starts the search at the given offset", () => {
    expect(directivesOf("%%{a}%% %%{b}%%", 7)).toEqual([
      ["%%{b}%%", "b", "b", true],
    ])
  })

  it("reads the directive at a position, and nothing elsewhere", () => {
    expect(readDirective("x\n%%{a}%%", 2)).toEqual({
      range: [2, 9],
      name: "a",
      valueRange: [5, 6],
      closed: true,
    })
    expect(readDirective("x\n%%{a}%%", 0)).toBeNull()
    expect(readDirective("x\n%%{a}%%", 3)).toBeNull()
  })
})
