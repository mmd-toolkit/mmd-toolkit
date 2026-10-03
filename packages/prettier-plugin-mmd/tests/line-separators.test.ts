/**
 * Formats diagrams whose lines hold U+2028 or U+2029 that the printer must
 * keep: a state diagram keeps such a line as written (docs/state.md, Line
 * separators), and a sequence diagram keeps them at the end of the text of a
 * box and between a comment and the comment line after it (docs/sequence.md,
 * Line separators). The characters are written as escapes, and no file holds
 * them: an editor offers to remove them each time it opens such a file.
 */
import { describe, expect, it } from "vitest"
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import { describeReadingChange, readWithMermaid } from "./mermaid-readings.ts"

/** Formats a text of a diagram. */
function format(text: string): Promise<string> {
  return prettier.format(text, { filepath: "diagram.mmd", plugins: [plugin] })
}

/**
 * Each example is a statement with a line separator and its formatted form:
 * the line is printed as written, up to the whitespace before it, which
 * mermaid.js reads as the plugin would not.
 *
 * - The mark of a pseudostate is looked for in the text up to the line
 *   separator: `state a`, U+2028, and `b   <<fork>>` is the name `a` and the
 *   fork `b`, while with a space in place of the U+2028 it is the fork
 *   `a b`.
 * - A direction line ends at a line separator too.
 * - A line is kept as a whole: its spaces stay.
 */
const examples: readonly (readonly [string, string, string])[] = [
  [
    "a pseudostate mark after U+2028",
    "stateDiagram-v2\nstate a\u2028b   <<fork>>\n",
    "stateDiagram-v2\n  state a\u2028b   <<fork>>\n",
  ],
  [
    "a pseudostate mark after U+2029",
    "stateDiagram-v2\nstate a\u2029b   <<fork>>\n",
    "stateDiagram-v2\n  state a\u2029b   <<fork>>\n",
  ],
  [
    "a direction line after U+2028",
    "stateDiagram-v2\nA --> B\u2028direction LR\n",
    "stateDiagram-v2\n  A --> B\u2028direction LR\n",
  ],
  [
    "a line that starts with U+2028",
    "stateDiagram-v2\nstate a\n\u2028b <<fork>>\n",
    "stateDiagram-v2\n  state a\n\u2028b <<fork>>\n",
  ],
  [
    "a transition line with U+2028",
    "stateDiagram-v2\nA   -->   B \u2028 C\n",
    "stateDiagram-v2\n  A   -->   B \u2028 C\n",
  ],
]

/**
 * Each example is a sequence diagram with a line separator that is kept, and
 * its formatted form.
 *
 * - A box whose text ends with U+2028 has no name and the fill
 *   `transparent`; without the character, `box aqua` has the fill `aqua`.
 *   The whitespace around the character stays up to it, and what follows it
 *   is dropped.
 * - A `;` after the character at the end of the text stays: mermaid.js
 *   removes a comment line that follows the character, with the line breaks
 *   before it, and without the `;` the next line would join the text.
 * - A diagram comment goes on past a comment line that follows U+2029 on its
 *   line, so `C->>D: z` below is part of the comment, and with a line break
 *   in place of the U+2029 it is a message. The comment, the comment line, and
 *   the text after it are printed as written, with no indentation.
 */
const sequenceExamples: readonly (readonly [string, string, string])[] = [
  [
    "U+2028 at the end of the text of a box",
    "sequenceDiagram\nbox aqua\u2028\nparticipant A\nend\n",
    "sequenceDiagram\n  box aqua\u2028\n    participant A\n  end\n",
  ],
  [
    "whitespace around U+2028 at the end of the text of a box",
    "sequenceDiagram\nbox aqua  \u2028  \nparticipant A\nend\n",
    "sequenceDiagram\n  box aqua  \u2028\n    participant A\n  end\n",
  ],
  [
    "a `;` after U+2028 at the end of the text of a box",
    "sequenceDiagram\nbox red\u2028 ;;\n\n  %% c\nparticipant A\nend\n",
    "sequenceDiagram\n  box red\u2028 ;\n    %% c\n    participant A\n  end\n",
  ],
  [
    "a `;` after U+2028 at the end of a title",
    "sequenceDiagram\ntitle T\u2028;\n%% c\nA->>B: x\n",
    "sequenceDiagram\n  title T\u2028;\n  %% c\n  A ->> B: x\n",
  ],
  [
    "a `#` comment after U+2028, which joins no lines",
    "sequenceDiagram\nA->>B:   x\u2028# c\nC->>D: y\n",
    "sequenceDiagram\n  A ->> B: x # c\n  C ->> D: y\n",
  ],
  [
    "a `%%` comment line after U+2028, which joins the next line",
    "sequenceDiagram\nA->>B:   x\u2028%% c\nC->>D: y\n",
    "sequenceDiagram\n  A->>B:   x\u2028%% c\nC->>D: y\n",
  ],
  [
    "U+2029 after a comment that a comment line follows",
    "sequenceDiagram\nA->>B: y #c\u2029%% d\nC->>D: z\n",
    "sequenceDiagram\n  A->>B: y #c\u2029%% d\nC->>D: z\n",
  ],
]

/**
 * Checks that formatting an example gives its formatted form, that
 * formatting again changes nothing, and that mermaid.js reads both texts as
 * the same diagram.
 */
async function expectKept(input: string, output: string): Promise<void> {
  expect(await format(input)).toBe(output)
  expect(await format(output)).toBe(output)
  expect(
    describeReadingChange(
      await readWithMermaid(input),
      await readWithMermaid(output),
    ),
  ).toBeNull()
}

describe("a state diagram with a line separator", () => {
  it.each(examples)("keeps %s as written", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

describe("a sequence diagram with a line separator", () => {
  it.each(sequenceExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})
