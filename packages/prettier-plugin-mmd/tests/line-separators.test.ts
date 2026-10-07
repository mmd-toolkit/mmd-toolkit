/**
 * Formats diagrams whose lines hold U+2028 or U+2029 that the printer must
 * keep: a state diagram keeps such a line as written (docs/state.md, Line
 * separators), a sequence diagram keeps them at the end of the text of a
 * box and between a comment and the comment line after it (docs/sequence.md,
 * Line separators), and a flowchart keeps the `;` of a line that dropping it
 * would change (docs/flowchart.md, Semicolons). The characters are written as escapes, and no file holds
 * them: an editor offers to remove them each time it opens such a file.
 */
import { describe, expect, it } from "vitest"
import * as prettier from "prettier"
import plugin from "../src/index.ts"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"

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
 * - The text up to a `{` in which a second name is looked for ends at a line
 *   separator too: `state a b` and `{` with a space between them is rejected,
 *   while with U+2028 between them it is the state `a` and the composite
 *   state `b`.
 * - A line in a body is kept as written, after the indentation of its level,
 *   and a line that starts with the whitespace of a line separator keeps that
 *   whitespace.
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
  [
    "a direction line after U+2029",
    "stateDiagram-v2\nA --> B\u2029direction   LR\n",
    "stateDiagram-v2\n  A --> B\u2029direction   LR\n",
  ],
  [
    "a second name before a brace that U+2028 separates from it",
    "stateDiagram-v2\nstate   a   b\u2028{}\n",
    "stateDiagram-v2\n  state   a   b\u2028{}\n",
  ],
  [
    "U+2028 before the brace of a composite statement",
    "stateDiagram-v2\nstate   a   b\u2028{\nC\n}\n",
    "stateDiagram-v2\n  state   a   b\u2028{\nC\n}\n",
  ],
  [
    "U+2028 on the closing line of a composite statement",
    "stateDiagram-v2\nstate A {\nB\n}\u2028\nC\n",
    "stateDiagram-v2\n  state A {\nB\n}\u2028\n  C\n",
  ],
  [
    "a second name before a brace that U+2029 separates from it",
    "stateDiagram-v2\nstate   a   b\u2029{}\n",
    "stateDiagram-v2\n  state   a   b\u2029{}\n",
  ],
  [
    "a pseudostate mark after U+2028 in a body",
    "stateDiagram-v2\nstate A {\nstate a\u2028b   <<fork>>\n}\n",
    "stateDiagram-v2\n  state A {\n    state a\u2028b   <<fork>>\n  }\n",
  ],
  [
    "a line that starts with U+2029",
    "stateDiagram-v2\nstate a\n\u2029b <<fork>>\n",
    "stateDiagram-v2\n  state a\n\u2029b <<fork>>\n",
  ],
  [
    "a line that starts with whitespace and U+2028",
    "stateDiagram-v2\nstate a\n  \u2028b <<fork>>\n",
    "stateDiagram-v2\n  state a\n  \u2028b <<fork>>\n",
  ],
]

/**
 * Each example is a state diagram with a semicolon that a line keeps, because
 * dropping it would change what mermaid.js reads, and its formatted form: the
 * line is printed as written, up to the whitespace before it. No `;` ends a
 * statement in a state diagram, so these are the `;` that the line rule
 * ignores (`style`, a `:` followed by `#`, and a `;`), and the `;` that stops
 * a directive that is not closed.
 *
 * - A `;` after a directive that is not closed ends it: `%%{wrap foo;` and the
 *   next line are two lines, while without the `;` the directive takes the
 *   line break and the next line.
 * - The rule ignores only the last `;` of a line: dropping one of `;;` makes
 *   the other the ignored one. Whitespace between the two stays.
 * - The rule reads the text up to a line separator as the line, so a line
 *   separator after the ignored `;` stays where it is.
 */
const semicolonExamples: readonly (readonly [string, string, string])[] = [
  [
    "a semicolon after a directive that is not closed",
    "stateDiagram-v2\nA   -->   B   %%{wrap foo;\nC   -->   D\n",
    "stateDiagram-v2\n  A   -->   B   %%{wrap foo;\n  C --> D\n",
  ],
  [
    "an ignored semicolon next to another semicolon",
    "stateDiagram-v2\nA   -->   B   style:#f00;;\nC   -->   D\n",
    "stateDiagram-v2\n  A   -->   B   style:#f00;;\n  C --> D\n",
  ],
  [
    "an ignored semicolon and a semicolon after whitespace",
    "stateDiagram-v2\nA   -->   B   style:#f00; ;\nC   -->   D\n",
    "stateDiagram-v2\n  A   -->   B   style:#f00; ;\n  C --> D\n",
  ],
  [
    "an ignored semicolon before U+2028",
    "stateDiagram-v2\nA   -->   B   style:#f00;\u2028\nC   -->   D\n",
    "stateDiagram-v2\n  A   -->   B   style:#f00;\u2028\n  C --> D\n",
  ],
  [
    "an ignored semicolon before U+2029",
    "stateDiagram-v2\nA   -->   B   style:#f00;\u2029\nC   -->   D\n",
    "stateDiagram-v2\n  A   -->   B   style:#f00;\u2029\n  C --> D\n",
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
 *   the text after it are printed as written, with no indentation. This holds
 *   for each mark of a diagram comment, `#`, `%%`, and `%`.
 * - A directive that is not closed stops before U+2028 and U+2029, which it
 *   takes as whitespace: its line is printed as written, and the next line
 *   goes on as part of the directive, without indentation.
 * - U+2028 and U+2029 as the whitespace character after `title`, and between
 *   two parts of a statement (an id and an arrow, an arrow and an id, an id
 *   and `as`), stay where they are: they are not whitespace to every rule of
 *   mermaid.js, and a space or a line break in their place could be read
 *   otherwise. The whitespace beside the other parts is formatted as usual.
 * - On a line that holds a `;` that the line rule ignores and, after it, a
 *   U+2028 or U+2029, the statements are printed as written (the spaces in
 *   `participant   Z` stay), up to the end of the line that the rule reads.
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
  [
    "U+2029 at the end of the text of a box",
    "sequenceDiagram\nbox aqua\u2029\nparticipant A\nend\n",
    "sequenceDiagram\n  box aqua\u2029\n    participant A\n  end\n",
  ],
  [
    "whitespace around U+2029 at the end of the text of a box",
    "sequenceDiagram\nbox aqua  \u2029  \nparticipant A\nend\n",
    "sequenceDiagram\n  box aqua  \u2029\n    participant A\n  end\n",
  ],
  [
    "U+2028 after a `%%` comment that a comment line follows",
    "sequenceDiagram\nautonumber %% c\u2028%% d\nC->>D: z\n",
    "sequenceDiagram\n  autonumber %% c\u2028%% d\nC->>D: z\n",
  ],
  [
    "U+2029 after a `%` comment that a comment line follows",
    "sequenceDiagram\nautonumber % c\u2029%% d\nC->>D: z\n",
    "sequenceDiagram\n  autonumber % c\u2029%% d\nC->>D: z\n",
  ],
  [
    "U+2028 after a directive that is not closed",
    "sequenceDiagram\nA->>B: x %%{wrap foo\u2028\nB->>A: y\n",
    "sequenceDiagram\n  A->>B: x %%{wrap foo\u2028\nB->>A: y\n",
  ],
  [
    "U+2029 after a directive that is not closed",
    "sequenceDiagram\nA->>B: x %%{wrap foo\u2029\nB->>A: y\n",
    "sequenceDiagram\n  A->>B: x %%{wrap foo\u2029\nB->>A: y\n",
  ],
  [
    "a `;` after U+2029 after a directive that is not closed",
    "sequenceDiagram\nA->>B: x %%{init: {}\u2029;\nB->>A: y\n",
    "sequenceDiagram\n  A->>B: x %%{init: {}\u2029;\n  B ->> A: y\n",
  ],
  [
    "U+2028 as the whitespace character after `title`, with a `;` after it",
    "sequenceDiagram\ntitle\u2028 ;\nA->>B: x\n",
    "sequenceDiagram\n  title\u2028 ;\n  A ->> B: x\n",
  ],
  [
    "U+2029 as the whitespace character after `title`",
    "sequenceDiagram\ntitle\u2029T   \nA->>B: x\n",
    "sequenceDiagram\n  title\u2029T   \n  A ->> B: x\n",
  ],
  [
    "U+2028 between an id and an arrow",
    "sequenceDiagram\nA\u2028->>B: x\n",
    "sequenceDiagram\n  A\u2028->> B: x\n",
  ],
  [
    "U+2029 between an arrow and an id",
    "sequenceDiagram\nA->>\u2029B: y\n",
    "sequenceDiagram\n  A ->>\u2029B: y\n",
  ],
  [
    "U+2028 between an id and `as`",
    "sequenceDiagram\nparticipant C\u2028 as   Carol\n",
    "sequenceDiagram\n  participant C\u2028 as Carol\n",
  ],
  [
    "a `;` after an ignored `;` and U+2029, which the line rule reads as the end of its line",
    'sequenceDiagram\nparticipant   Z@{ "style": "x:#y" };\u2029;\nA  ->>  B: y\n',
    'sequenceDiagram\n  participant   Z@{ "style": "x:#y" };\u2029;\n  A ->> B: y\n',
  ],
  [
    "statements after an ignored `;`, with a U+2029 later on the line",
    'sequenceDiagram\nparticipant   Z@{ "style": "x:#y" };participant   B;C\u2029 participant D\nA  ->>  B: y\n',
    'sequenceDiagram\n  participant   Z@{ "style": "x:#y" };participant   B;C\u2029 participant D\n  A ->> B: y\n',
  ],
]

/**
 * Each example is a flowchart with a line separator that is kept, and its
 * formatted form.
 *
 * - A line with a `;` that the line rule of mermaid.js ignores, a line
 *   separator, and another `;` is printed as written: the rule reads the text
 *   up to the character as the line, so the character stays where it is, and
 *   printed as a space it would end the line elsewhere. In `Z[style:#x];`, the
 *   character, and `;`, neither `;` is dropped.
 * - A `;` after a directive that is not closed is kept, with the character
 *   between them: the directive takes the whitespace after its argument, and
 *   the `;` ends it.
 */
const flowchartExamples: readonly (readonly [string, string, string])[] = [
  [
    "an ignored `;` before U+2028 and a `;`",
    "flowchart LR\nZ[style:#x];\u2028;\nB\n",
    "flowchart LR\n  Z[style:#x];\u2028;\n  B\n",
  ],
  [
    "an ignored `;` before U+2029 and a `;`",
    "flowchart LR\nZ[style:#x];\u2029;\nB\n",
    "flowchart LR\n  Z[style:#x];\u2029;\n  B\n",
  ],
  [
    "a `;` after a directive that is not closed and U+2028",
    "flowchart LR\nA %%{init: {}\u2028;\nB\n",
    "flowchart LR\n  A %%{init: {}\u2028;\n  B\n",
  ],
  [
    "a `;` after a directive that is not closed and U+2029",
    "flowchart LR\nA %%{init: {}\u2029;\nB\n",
    "flowchart LR\n  A %%{init: {}\u2029;\n  B\n",
  ],
]

/**
 * Checks that formatting an example gives its formatted form, that
 * formatting again changes nothing, and that the Db that the tree denotes is
 * the same for both texts.
 */
async function expectKept(input: string, output: string): Promise<void> {
  expect(await format(input)).toBe(output)
  expect(await format(output)).toBe(output)
  expect(dbOfText(output, defaultEmbedded())).toEqual(
    dbOfText(input, defaultEmbedded()),
  )
}

describe("a state diagram with a line separator", () => {
  it.each(examples)("keeps %s as written", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

describe("a state diagram with a semicolon that a line keeps", () => {
  it.each(semicolonExamples)(
    "keeps %s as written",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a sequence diagram with a line separator", () => {
  it.each(sequenceExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

describe("a flowchart with a line separator", () => {
  it.each(flowchartExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})
