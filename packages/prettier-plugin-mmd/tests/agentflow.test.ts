/** Escaped Unicode/control/EOL cases keep their contextual reading. */
import { describe, expect, it } from "vitest"
import { formatMermaid } from "./helpers.ts"
import {
  dbOfText,
  defaultEmbedded,
  writtenEmbeddedTexts,
  describeFrontmatterChange,
} from "./db-reading.ts"
import { agentflowCases } from "./agentflow-cases.ts"
import { dbForFormattingComparison } from "./db-comparison.ts"

describe("agentflow escaped cases", () => {
  it.each(agentflowCases)("$name", async (fixture) => {
    const { input, output, options } = fixture
    expect(await formatMermaid(input, "diagram.mmd", options)).toBe(output)
    expect(await formatMermaid(output, "diagram.mmd", options)).toBe(output)
    const before = input.startsWith("\ufeff") ? input.slice(1) : input
    const after = output.startsWith("\ufeff") ? output.slice(1) : output
    const dbBefore = dbOfText(before, defaultEmbedded())
    expect(
      dbForFormattingComparison(
        dbBefore,
        dbOfText(after, defaultEmbedded()),
        before,
        after,
      ),
    ).toEqual(dbBefore)
    expect(writtenEmbeddedTexts(after)).toEqual(writtenEmbeddedTexts(before))
    expect(await describeFrontmatterChange(before, after, options)).toBeNull()
  })
})

/**
 * The whitespace of the specification (packages/spec/docs/common.md, Notation)
 * but for the space, which the fixtures hold: what stands before a comment that
 * ends the label of a vertex or of an edge (docs/agentflow.md, Edge labels and
 * Labels).
 */
const whitespaceBeforeLabelComment: readonly string[] = [
  "\t",
  "\u000b",
  "\u000c",
  "\u00a0",
  "\u1680",
  "\u2000",
  "\u2001",
  "\u2002",
  "\u2003",
  "\u2004",
  "\u2005",
  "\u2006",
  "\u2007",
  "\u2008",
  "\u2009",
  "\u200a",
  "\u2028",
  "\u2029",
  "\u202f",
  "\u205f",
  "\u3000",
  "\ufeff",
]

/** Runs of different whitespace characters, which are printed as one space too. */
const mixedRunsBeforeLabelComment: readonly string[] = [
  "  \t",
  " \u00a0 ",
  "\u000b ",
  "\u2002\u2003",
  "\u3000\t",
]

/** A label ended by a comment, in a vertex and in an edge, with and without a `;`. */
const labelCommentForms = [
  {
    kind: "the label of a vertex",
    input: (gap: string) => `agentflow-beta TB\nA[x${gap}%% c\n]\n`,
    output: 'agentflow-beta TB\n  A["x" %% c\n    ]\n',
  },
  {
    kind: "the label of an edge",
    input: (gap: string) => `agentflow-beta TB\nA -->|x${gap}%% c\n| B\n`,
    output: "agentflow-beta TB\n  A -->|x %% c\n    | B\n",
  },
  {
    kind: "the label of a vertex, with a semicolon in the comment",
    input: (gap: string) => `agentflow-beta TB\nA[x${gap}%% c;  \n]\n`,
    output: "agentflow-beta TB\n  A[x %% c;  \n    ]\n",
  },
  {
    kind: "the label of an edge, with a semicolon in the comment",
    input: (gap: string) => `agentflow-beta TB\nA -->|x${gap}%% c;  \n| B\n`,
    output: "agentflow-beta TB\n  A -->|x %% c;  \n    | B\n",
  },
] as const

/** Formats the input as the output states, again to the same, with the Db kept. */
async function expectLabelCommentGap(
  input: string,
  output: string,
): Promise<void> {
  expect(await formatMermaid(input)).toBe(output)
  expect(await formatMermaid(output)).toBe(output)
  const dbBefore = dbOfText(input, defaultEmbedded())
  expect(
    dbForFormattingComparison(
      dbBefore,
      dbOfText(output, defaultEmbedded()),
      input,
      output,
    ),
  ).toEqual(dbBefore)
}

describe("agentflow whitespace before a comment that ends a label", () => {
  it("agentflow: every whitespace character of the specification before a comment that ends the label of a vertex", async () => {
    const form = labelCommentForms[0]
    for (const gap of whitespaceBeforeLabelComment)
      await expectLabelCommentGap(form.input(gap), form.output)
  })

  it("agentflow: every whitespace character of the specification before a comment that ends the label of an edge", async () => {
    const form = labelCommentForms[1]
    for (const gap of whitespaceBeforeLabelComment)
      await expectLabelCommentGap(form.input(gap), form.output)
  })

  it("agentflow: every whitespace character of the specification before a comment with a semicolon that ends the label of a vertex", async () => {
    const form = labelCommentForms[2]
    for (const gap of whitespaceBeforeLabelComment)
      await expectLabelCommentGap(form.input(gap), form.output)
  })

  it("agentflow: every whitespace character of the specification before a comment with a semicolon that ends the label of an edge", async () => {
    const form = labelCommentForms[3]
    for (const gap of whitespaceBeforeLabelComment)
      await expectLabelCommentGap(form.input(gap), form.output)
  })

  it("agentflow: a run of different whitespace characters before a comment that ends the label of a vertex or of an edge", async () => {
    for (const form of labelCommentForms)
      for (const gap of mixedRunsBeforeLabelComment)
        await expectLabelCommentGap(form.input(gap), form.output)
  })
})
