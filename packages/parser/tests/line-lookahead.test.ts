import { describe, expect, it } from "vitest"
import type { LineEntry } from "../src/line-lookahead.ts"
import { lookAheadFromCommentStart } from "../src/line-lookahead.ts"

/** The entries of the look-ahead from `start`, in a compact form. */
function entriesAt(text: string, start: number): unknown[] {
  return lookAheadFromCommentStart(text, start).map((entry: LineEntry) =>
    entry.kind === "region"
      ? {
          region: text.slice(entry.start, entry.end),
          comment: text.slice(...entry.comment),
          value: text.slice(entry.afterMarker, entry.comment[1]),
          directives: [...entry.directives.values()].map((d) =>
            text.slice(...d.range),
          ),
        }
      : {
          segment: text.slice(entry.start, entry.end),
          ignored: [...entry.ignoredSemicolons].sort((a, b) => a - b),
          directives: [...entry.directives.values()].map((d) =>
            text.slice(...d.range),
          ),
        },
  )
}

// Expectations come from common.md, Reading a source, Comment lines, and
// `style` and `classDef` lines.

describe("lookAheadFromCommentStart: comment regions", () => {
  it.each([
    ["%% a\nx", 0, "%% a\n", "%% a", []],
    ["x\n%% a\ny", 2, "%% a\n", "%% a", []],
    // The look-ahead crosses whitespace-only lines and the indent.
    ["x\n\n  \n  %% a\ny", 2, "\n  \n  %% a\n", "%% a", []],
    ["  %% a", 0, "  %% a", "%% a", []],
    // U+2028 and U+2029 do not end a comment.
    ["%% a\u2028b\ny", 0, "%% a\u2028b\n", "%% a\u2028b", []],
    ["%% \nx", 0, "%% \n", "%% ", []],
    ["%%\u2028x", 0, "%%\u2028x", "%%\u2028x", []],
    // The look-ahead crosses a directive, which is left out, and records it.
    [
      "%%{init: {}}%% %% c\nx",
      0,
      "%%{init: {}}%% %% c\n",
      "%% c",
      ["%%{init: {}}%%"],
    ],
    [
      "%%{init:\n{}}%% %% c\nx",
      0,
      "%%{init:\n{}}%% %% c\n",
      "%% c",
      ["%%{init:\n{}}%%"],
    ],
    // A directive after the `%%` is part of the comment and recorded; a
    // line terminator inside it does not end the comment.
    [
      "%% see %%{init: {}}%% here\nx",
      0,
      "%% see %%{init: {}}%% here\n",
      "%% see %%{init: {}}%% here",
      ["%%{init: {}}%%"],
    ],
    [
      "%% a %%{init:\n{}}%% b\nx",
      0,
      "%% a %%{init:\n{}}%% b\n",
      "%% a %%{init:\n{}}%% b",
      ["%%{init:\n{}}%%"],
    ],
    // A directive that starts right after the `%%` lies inside the comment,
    // and the character that must follow the `%%` is the one after it.
    ["%%%%{x}%% c\ny", 0, "%%%%{x}%% c\n", "%%%%{x}%% c", ["%%{x}%%"]],
    // The `%%` can be two `%` with a directive between them.
    [
      "%%%{init: {}}%%% c\nx",
      0,
      "%%%{init: {}}%%% c\n",
      "%%%{init: {}}%%% c",
      ["%%{init: {}}%%"],
    ],
    // `\r\n` and a lone `\r` end the comment and the region.
    ["  %% c\r\ny", 0, "  %% c\r\n", "%% c", []],
    ["%% c\ry", 0, "%% c\r", "%% c", []],
  ])("%j at %i", (text, start, region, comment, directives) => {
    expect(entriesAt(text, start)).toMatchObject([
      { region, comment, directives },
    ])
  })
})

describe("lookAheadFromCommentStart: the value of a comment", () => {
  it("is the source text after the second `%` of its `%%`", () => {
    expect(entriesAt("%% a\nx", 0)).toMatchObject([{ value: " a" }])
    expect(entriesAt("%%%{init: {}}%%% c\nx", 0)).toMatchObject([
      { value: " c" },
    ])
    expect(entriesAt("%%%%{x}%% c\ny", 0)).toMatchObject([
      { value: "%%{x}%% c" },
    ])
  })
})

describe("lookAheadFromCommentStart: line segments", () => {
  it.each([
    // No comment: one segment up to the separator of the line where the look-ahead stopped.
    ["x %% a\ny", 0, [{ segment: "x %% a", ignored: [], directives: [] }]],
    // `%%` needs a character after it that is not `{` and not a line terminator.
    ["%%\nx", 0, [{ segment: "%%", ignored: [], directives: [] }]],
    ["%%", 0, [{ segment: "%%", ignored: [], directives: [] }]],
    ["%%\r\nx", 0, [{ segment: "%%", ignored: [], directives: [] }]],
    ["%%{ }%%\nx", 0, [{ segment: "%%{ }%%", ignored: [], directives: [] }]],
    // Once the directive is left out, nothing follows the `%%`: no comment.
    [
      "%%%%{init: {}}%%\nx",
      0,
      [
        {
          segment: "%%%%{init: {}}%%",
          ignored: [],
          directives: ["%%{init: {}}%%"],
        },
      ],
    ],
    // One `%`, a directive, and another character: no `%%`.
    [
      "%%%{init: {}}%%x\ny",
      0,
      [
        {
          segment: "%%%{init: {}}%%x",
          ignored: [],
          directives: ["%%{init: {}}%%"],
        },
      ],
    ],
    // Whitespace-only lines the look-ahead passed become segments of their own.
    [
      "\n  \n%%{a}%%\nx\ny",
      0,
      [
        { segment: "", ignored: [], directives: [] },
        { segment: "  ", ignored: [], directives: [] },
        { segment: "%%{a}%%", ignored: [], directives: ["%%{a}%%"] },
        { segment: "x", ignored: [], directives: [] },
      ],
    ],
    // A directive in the segment is recorded and left out for the line rule.
    [
      "style A fill:#f00%%{x:\n1}%%;\nz",
      0,
      [
        {
          segment: "style A fill:#f00%%{x:\n1}%%;",
          ignored: [27],
          directives: ["%%{x:\n1}%%"],
        },
      ],
    ],
    [
      "x\u2028 style A:#f;",
      2,
      [{ segment: " style A:#f;", ignored: [13], directives: [] }],
    ],
    ["", 0, [{ segment: "", ignored: [], directives: [] }]],
  ])("%j at %i", (text, start, expected) => {
    expect(entriesAt(text, start)).toEqual(expected)
  })
})
