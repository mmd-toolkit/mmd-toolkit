import { describe, expect, it } from "vitest"
import { checkInvariants } from "../src/check-tree/invariants.ts"
import { Problems } from "../src/check-tree/problems.ts"
import type {
  CheckedComment,
  CheckedDirective,
  CheckedRoot,
  CheckedToken,
  TreeProblem,
} from "../src/check-tree/types.ts"
import type { TreeRange } from "../src/db-from-tree/tree.ts"
import {
  directiveOf,
  handMadeRoot,
  locationOf,
  rawTokensOutside,
  tokenOf,
} from "./check-tree-trees.ts"

// The comments of a tree: where each ends, and its mark (parser/docs/tokens.md,
// Comment, and common.md, Comment lines). The trees are made by hand: the
// comments are given by their ranges, and every other run of characters that
// are not whitespace is a token.

/**
 * The problems of the conditions of every tree (positions.md, Invariants): the
 * hand made trees have the tokens of no diagram, so the checks of a diagram do
 * not apply.
 */
function checkTree(text: string, root: CheckedRoot): TreeProblem[] {
  const problems = new Problems()
  checkInvariants(text, root, problems)
  return problems.list
}

/** Whether one of the problems says `message`. */
function says(problems: readonly TreeProblem[], message: string): boolean {
  return problems.some((problem) =>
    `${problem.where}: ${problem.message}`.includes(message),
  )
}

/** One comment of a tree over `source`. */
interface CommentSpec {
  readonly mark: string | null
  readonly range: TreeRange
  /** Default: the text of the range after the mark. */
  readonly value?: string
}

/**
 * A tree over `source` whose comments and directives are given. Its tokens
 * are the runs outside them, the `Directive` tokens of the directives that
 * lie outside the comments, and `extraTokens` (type and text).
 */
function treeWith(
  source: string,
  bodyType: string,
  comments: readonly CommentSpec[],
  directives: readonly CheckedDirective[] = [],
  extraTokens: readonly (readonly [string, string])[] = [],
): CheckedRoot {
  const records: CheckedComment[] = comments.map((spec) => {
    const markLength = spec.mark === null ? 0 : spec.mark.length
    return {
      type: "Comment",
      mark: spec.mark,
      value:
        spec.value ?? source.slice(spec.range[0] + markLength, spec.range[1]),
      range: spec.range,
      loc: locationOf(source, spec.range),
    }
  })
  const extras = extraTokens.map(([type, text]) => tokenOf(source, type, text))
  const skip = [
    ...records.map((record) => record.range),
    ...directives.map((directive) => directive.range),
    ...extras.map((token) => token.range),
  ]
  const outsideComments = directives.filter((directive) =>
    records.every(
      (comment) =>
        directive.range[1] <= comment.range[0] ||
        comment.range[1] <= directive.range[0],
    ),
  )
  const tokens: CheckedToken[] = [
    ...rawTokensOutside(source, skip).map(([type, piece]) =>
      tokenOf(source, type, piece),
    ),
    ...outsideComments.map((directive) =>
      tokenOf(source, "Directive", {
        text: source.slice(...directive.range),
        from: directive.range[0],
      }),
    ),
    ...extras,
  ].sort((a, b) => a.range[0] - b.range[0])
  const diagramTokens = tokens.filter(
    (token) => token.type !== "Directive" && token.type !== "IgnoredSemicolon",
  )
  const bodyRange: TreeRange = [
    diagramTokens[0]?.range[0] ?? 0,
    diagramTokens.at(-1)?.range[1] ?? 0,
  ]
  const root = handMadeRoot(source, { bodyType, tokens: [] })
  return {
    ...root,
    body: {
      ...root.body,
      range: bodyRange,
      loc: locationOf(source, bodyRange),
    },
    comments: records,
    directives,
    tokens,
  }
}

describe("checkTree: where a comment ends", () => {
  it("passes a diagram comment that ends where its line ends, and fails one that runs on", () => {
    // A comment that runs on to the line terminator of the next line, a line
    // of whitespace, has a line terminator that no directive takes.
    const source = "sequenceDiagram\nA->>B: x #c\n  \nC->>D: y\n"
    const at = source.indexOf("#c")

    /** The tree whose comment ends at `end`. */
    function withEnd(end: number): CheckedRoot {
      return treeWith(source, "SequenceDiagram", [
        { mark: "#", range: [at, end] },
      ])
    }

    expect(checkTree(source, withEnd(at + 2))).toEqual([])
    expect(
      says(
        checkTree(source, withEnd(at + 5)),
        "which no directive in it takes",
      ),
    ).toBe(true)
  })

  it("fails a comment line that runs on past its line", () => {
    const source = "flowchart LR\n%% c\n  \nA\n"
    const at = source.indexOf("%%")
    const root = treeWith(source, "FlowchartDiagram", [
      { mark: "%%", range: [at, at + 7] },
    ])
    expect(says(checkTree(source, root), "the range of a comment line")).toBe(
      true,
    )
  })

  it("fails a comment that ends at a line terminator that a directive takes", () => {
    // A comment ends at the first line terminator that no directive takes:
    // here the directive takes the line feed and `A`, so a comment that ends
    // at that line feed, with the text after it in tokens, is wrong.
    const source = "sequenceDiagram\nA->>B: x #c %%{wrap\nA\n"
    const at = source.indexOf("#c")
    const directive = directiveOf(source, { text: "%%{wrap\nA" })
    const root = treeWith(
      source,
      "SequenceDiagram",
      [{ mark: "#", range: [at, source.lastIndexOf("\nA")] }],
      [directive],
      [["RawText", "A"]],
    )
    const tokenA = tokenOf(source, "RawText", {
      text: "A",
      from: source.lastIndexOf("\nA") + 1,
    })
    const problems = checkTree(source, {
      ...root,
      tokens: [...root.tokens.filter((t) => t.range[0] < at + 2), tokenA],
    })
    expect(
      says(problems, "ends at a line terminator that a directive takes"),
    ).toBe(true)
  })

  it("passes a comment that ends before the whitespace of its line, and fails one that ends earlier or later", () => {
    const source = "sequenceDiagram\nA->>B: x #c  \nC->>D: y\n"
    const at = source.indexOf("#c")

    /** The tree whose comment ends at `end`. */
    function withEnd(end: number): CheckedRoot {
      return treeWith(source, "SequenceDiagram", [
        { mark: "#", range: [at, end] },
      ])
    }

    expect(checkTree(source, withEnd(at + 4))).toEqual([])
    expect(
      says(
        checkTree(source, withEnd(at + 2)),
        "does not end where its line ends",
      ),
    ).toBe(true)
    expect(
      says(checkTree(source, withEnd(at + 5)), "ends with a line terminator"),
    ).toBe(true)
  })

  it("passes a diagram comment before a `;` that the line rule ignores and that ends its line", () => {
    // A `;` that the line rule ignores and that is the last character of a
    // diagram comment lies outside it, as a token of its own, after which the
    // line ends.
    const source = "sequenceDiagram\nA->>B: x #style:#x;\n"
    const at = source.indexOf("#style")
    const root = treeWith(
      source,
      "SequenceDiagram",
      [{ mark: "#", range: [at, source.indexOf(";")] }],
      [],
      [["IgnoredSemicolon", ";"]],
    )
    expect(checkTree(source, root)).toEqual([])
  })

  it("passes a comment line that a directive carries to the end of the text, and fails one that ends elsewhere", () => {
    // A directive that takes all to the end of the text: the comment ends
    // where the directive ends, without the whitespace that it took.
    const source = "flowchart LR\n%% %%{init: {} \n \n\n"
    const at = source.indexOf("%%")
    const directive = directiveOf(source, { text: "%%{init: {}" })

    /** The tree whose comment ends at `end`. */
    function withEnd(end: number): CheckedRoot {
      return treeWith(
        source,
        "FlowchartDiagram",
        [{ mark: "%%", range: [at, end] }],
        [directive],
      )
    }

    expect(checkTree(source, withEnd(directive.range[1]))).toEqual([])
    for (const end of [directive.range[1] + 1, directive.range[1] + 2]) {
      expect(
        says(checkTree(source, withEnd(end)), "the range of a comment line"),
      ).toBe(true)
    }
  })
})

// A comment ends before the line terminator that ends its line: a line feed,
// the CRLF as one, a lone CR, or at the end of the text where none follows.
// The comment is a diagram comment of a sequence diagram (`#c`, in the line of
// a message) and a comment line of a flowchart (`%% c`).
describe("checkTree: where a comment ends, by the line terminator", () => {
  /** The ways in which a line is ended, with the name of each. */
  const TERMINATORS: readonly (readonly [name: string, text: string])[] = [
    ["a line feed", "\n"],
    ["a CRLF", "\r\n"],
    ["a lone CR", "\r"],
    ["the end of the text", ""],
  ]

  for (const [name, terminator] of TERMINATORS) {
    it(`passes a diagram comment that ends before ${name}, and fails one that ends after the line terminator it ends at`, () => {
      const source = `sequenceDiagram\nA->>B: x #c${terminator}`
      const at = source.indexOf("#c")

      /** The tree whose comment ends at `end`. */
      function withEnd(end: number): CheckedRoot {
        return treeWith(source, "SequenceDiagram", [
          { mark: "#", range: [at, end] },
        ])
      }

      expect(checkTree(source, withEnd(at + 2))).toEqual([])
      if (terminator === "") return
      const where = `Comment at ${at}-${at + 2 + terminator.length}`
      expect(
        checkTree(source, withEnd(at + 2 + terminator.length)),
      ).toContainEqual({
        where,
        message: "ends with a line terminator",
      })
    })

    it(`passes a diagram comment that ends before ${name} and the whitespace before it, and fails one that ends before the whitespace`, () => {
      const source = `sequenceDiagram\nA->>B: x #c  ${terminator}`
      const at = source.indexOf("#c")

      /** The tree whose comment ends at `end`. */
      function comment(end: number): CheckedRoot {
        return treeWith(source, "SequenceDiagram", [
          { mark: "#", range: [at, end] },
        ])
      }

      expect(checkTree(source, comment(at + 4))).toEqual([])
      expect(checkTree(source, comment(at + 2))).toContainEqual({
        where: `Comment at ${at}-${at + 2}`,
        message: "does not end where its line ends",
      })
    })

    it(`passes a comment line that ends before ${name}, and fails one that ends after the line terminator it ends at`, () => {
      const source = `flowchart LR\n%% c${terminator}`
      const at = source.indexOf("%%")

      /** The tree whose comment ends at `end`. */
      function comment(end: number): CheckedRoot {
        return treeWith(source, "FlowchartDiagram", [
          { mark: "%%", range: [at, end] },
        ])
      }

      expect(checkTree(source, comment(at + 4))).toEqual([])
      if (terminator === "") return
      expect(
        checkTree(source, comment(at + 4 + terminator.length)),
      ).toContainEqual({
        where: `Comment at ${at}-${at + 4 + terminator.length}`,
        message: `the range of a comment line: ${JSON.stringify([at, at + 4 + terminator.length])}, not ${JSON.stringify([at, at + 4])}`,
      })
    })
  }
})

describe("checkTree: the mark of a comment", () => {
  it("passes a comment line whose two `%` have a directive between them", () => {
    // The text without the directives goes on where the scan of a directive
    // ends, after the U+2028 and the line feed that it takes: the mark of `%`,
    // the directive, U+2028, a line feed, and `%% e` is `%%`.
    const source =
      "sequenceDiagram\nautonumber %%%{init: {} style:#x;\u2028\n%% e\nC->>D: y\n"
    const start = source.indexOf("%%%{")
    const directive = directiveOf(source, {
      text: "%%{init: {} style:#x;",
      from: start,
    })
    const root = treeWith(
      source,
      "SequenceDiagram",
      [{ mark: "%%", range: [start, source.indexOf("\nC->>")], value: "% e" }],
      [directive],
    )
    expect(checkTree(source, root)).toEqual([])
  })

  it("fails a mark that the diagram type does not have", () => {
    const state = "stateDiagram-v2\nA #c\n"
    const at = state.indexOf("#c")
    const problems = checkTree(
      state,
      treeWith(state, "StateDiagram", [{ mark: "%", range: [at, at + 2] }]),
    )
    expect(says(problems, "no mark of the comments of a StateDiagram")).toBe(
      true,
    )
    const line = "flowchart LR\n%% c\nA\n"
    const lineAt = line.indexOf("%%")
    expect(
      says(
        checkTree(
          line,
          treeWith(line, "FlowchartDiagram", [
            { mark: "#", range: [lineAt, lineAt + 4] },
          ]),
        ),
        "the mark of a comment line is not %%",
      ),
    ).toBe(true)
    const hash = "sequenceDiagram\nA->>B: x #c\n"
    const hashAt = hash.indexOf("#c")
    expect(
      says(
        checkTree(
          hash,
          treeWith(hash, "SequenceDiagram", [
            { mark: "%", range: [hashAt, hashAt + 2] },
          ]),
        ),
        "mark",
      ),
    ).toBe(true)
  })

  it("fails a fragment without a mark that follows no comment region, or with whitespace before the region, and comments that overlap", () => {
    // The comments `%% x`, `%% end`, and `B`, the last without a mark.
    const cut = "stateDiagram-v2\nA %% x\u2029%% end\nB\n"
    const x = cut.indexOf("%% x")
    const end = cut.indexOf("%% end")
    const b = cut.indexOf("B\n")

    /** The three comments, with the fields of `extra` changed. */
    function comments(extra: Partial<CommentSpec>[]): CommentSpec[] {
      return [
        { mark: "%%", range: [x, x + 4], ...extra[0] },
        { mark: "%%", range: [end, end + 6], ...extra[1] },
        { mark: null, range: [b, b + 1], ...extra[2] },
      ]
    }

    expect(checkTree(cut, treeWith(cut, "StateDiagram", comments([])))).toEqual(
      [],
    )
    expect(
      says(
        checkTree(
          cut,
          treeWith(
            cut,
            "StateDiagram",
            comments([{ mark: null, value: "%% x" }]),
          ),
        ),
        "has no mark and follows no comment region",
      ),
    ).toBe(true)
    expect(
      says(
        checkTree(
          cut,
          treeWith(cut, "StateDiagram", comments([{}, {}, { mark: "%%" }])),
        ),
        "mark",
      ),
    ).toBe(true)
    expect(
      says(
        checkTree(
          cut,
          treeWith(
            cut,
            "StateDiagram",
            comments([{ range: [x, x + 5], value: " x\u2029" }]),
          ),
        ),
        "ends with whitespace before a comment region",
      ),
    ).toBe(true)
    const duplicated = treeWith(cut, "StateDiagram", comments([]))
    const first = duplicated.comments[0]
    expect(
      says(
        checkTree(cut, {
          ...duplicated,
          comments: [first, ...duplicated.comments],
        }),
        "overlaps",
      ),
    ).toBe(true)
  })

  it("keeps a `;` that the line rule ignores and that a U+2029 follows inside the fragment before it", () => {
    // A `;` that the line rule ignores and that a U+2029 follows has a
    // character of the comment after it, so it lies inside the fragment.
    const source = "stateDiagram-v2\nA %% style:#x;\u2029%% end\n"
    const at = source.indexOf("%% style")
    const root = treeWith(source, "StateDiagram", [
      { mark: "%%", range: [at, source.indexOf("\u2029")] },
      { mark: "%%", range: [source.indexOf("%% end"), source.length - 1] },
    ])
    expect(checkTree(source, root)).toEqual([])
  })
})

describe("checkTree: the text and the mark of a diagram comment", () => {
  it("fails a diagram comment whose value is not the text after its mark", () => {
    const source = "sequenceDiagram\nA->>B: x #c\n"
    const at = source.indexOf("#c")
    const root = treeWith(source, "SequenceDiagram", [
      { mark: "#", range: [at, at + 2], value: "cc" },
    ])
    expect(
      says(
        checkTree(source, root),
        `Comment at ${at}-${at + 2}: value of a diagram comment: "cc", not "c"`,
      ),
    ).toBe(true)
  })

  it("fails a sequence comment whose mark is not the one that the text writes", () => {
    // `%%` written and `%` recorded, and the reverse: the mark is the first
    // `%` or the two of `%%`.
    const long = "sequenceDiagram\nA->>B: x %% c\n"
    const longAt = long.indexOf("%%")
    expect(
      says(
        checkTree(
          long,
          treeWith(long, "SequenceDiagram", [
            { mark: "%", range: [longAt, longAt + 4] },
          ]),
        ),
        `Comment at ${longAt}-${longAt + 4}: mark: "%", not "%%"`,
      ),
    ).toBe(true)
    const short = "sequenceDiagram\nA->>B: x % c\n"
    const shortAt = short.indexOf("%")
    expect(
      says(
        checkTree(
          short,
          treeWith(short, "SequenceDiagram", [
            { mark: "%%", range: [shortAt, shortAt + 3] },
          ]),
        ),
        `Comment at ${shortAt}-${shortAt + 3}: mark: "%%", not "%"`,
      ),
    ).toBe(true)
  })

  it("fails a mark that a flowchart or a class diagram does not have", () => {
    // A flowchart has comment lines only, so a `%%` after a statement is no
    // comment of it; a class diagram has `%%` and not `#`.
    const flowchart = "flowchart LR\nA --> B %% c\n"
    const flowchartAt = flowchart.indexOf("%%")
    expect(
      says(
        checkTree(
          flowchart,
          treeWith(flowchart, "FlowchartDiagram", [
            { mark: "%%", range: [flowchartAt, flowchartAt + 4] },
          ]),
        ),
        `Comment at ${flowchartAt}-${flowchartAt + 4}: the mark %% is no mark of the comments of a FlowchartDiagram`,
      ),
    ).toBe(true)
    const classDiagram = "classDiagram\nclass A #c\n"
    const classAt = classDiagram.indexOf("#c")
    expect(
      says(
        checkTree(
          classDiagram,
          treeWith(classDiagram, "ClassDiagram", [
            { mark: "#", range: [classAt, classAt + 2] },
          ]),
        ),
        `Comment at ${classAt}-${classAt + 2}: the mark # is no mark of the comments of a ClassDiagram`,
      ),
    ).toBe(true)
  })

  it("fails a fragment that starts with whitespace or has the wrong value", () => {
    const cut = "stateDiagram-v2\nA %% x\u2029%% end\nB\n"
    const x = cut.indexOf("%% x")
    const end = cut.indexOf("%% end")
    const b = cut.indexOf("B\n")

    /** The tree whose fragment after the comment lines is given by `fragment`. */
    function withFragment(fragment: Partial<CommentSpec>): CheckedRoot {
      return treeWith(cut, "StateDiagram", [
        { mark: "%%", range: [x, x + 4] },
        { mark: "%%", range: [end, end + 6] },
        { mark: null, range: [b, b + 1], ...fragment },
      ])
    }

    expect(checkTree(cut, withFragment({}))).toEqual([])
    expect(
      says(
        checkTree(cut, withFragment({ range: [b - 1, b + 1] })),
        `Comment at ${b - 1}-${b + 1}: starts with whitespace`,
      ),
    ).toBe(true)
    expect(
      says(
        checkTree(cut, withFragment({ value: "b" })),
        `Comment at ${b}-${b + 1}: value of a fragment: "b", not "B"`,
      ),
    ).toBe(true)
  })
})

describe("checkTree: where a diagram comment ends, further", () => {
  it("fails a comment that ends after the directive that takes the rest of the text", () => {
    // The directive is not closed, so it takes the rest of the text, and the
    // comment that holds it ends where it does: before the whitespace that
    // follows.
    const source = "sequenceDiagram\nA->>B: x #c %%{init: {} \n \n"
    const at = source.indexOf("#c")
    const directive = directiveOf(source, { text: "%%{init: {}" })

    /** The tree whose comment ends at `end`. */
    function withEnd(end: number): CheckedRoot {
      return treeWith(
        source,
        "SequenceDiagram",
        [{ mark: "#", range: [at, end] }],
        [directive],
      )
    }

    expect(checkTree(source, withEnd(directive.range[1]))).toEqual([])
    expect(
      says(
        checkTree(source, withEnd(directive.range[1] + 1)),
        `Comment at ${at}-${directive.range[1] + 1}: does not end where the directive that takes the rest of the text ends`,
      ),
    ).toBe(true)
  })

  it("fails a comment that ends before a `;` that the line rule ignores when no token holds the `;`", () => {
    // The comment ends where the `;` starts, but the `;` has no
    // `IgnoredSemicolon` token, so it is not what ends the line.
    const source = "sequenceDiagram\nA->>B: x #style:#x;\n"
    const at = source.indexOf("#style")
    const root = treeWith(source, "SequenceDiagram", [
      { mark: "#", range: [at, source.indexOf(";")] },
    ])
    expect(
      says(
        checkTree(source, root),
        `Comment at ${at}-${source.indexOf(";")}: does not end where its line ends`,
      ),
    ).toBe(true)
  })
})
