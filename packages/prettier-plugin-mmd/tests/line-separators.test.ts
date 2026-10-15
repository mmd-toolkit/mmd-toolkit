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
    "stateDiagram-v2\n  state a b\u2028{\n    C\n  }\n",
  ],
  [
    "U+2028 on the closing line of a composite statement",
    "stateDiagram-v2\nstate A {\nB\n}\u2028\nC\n",
    "stateDiagram-v2\n  state A {\n    B\n  }\u2028\n  C\n",
  ],
  [
    "U+2029 and whitespace before it on the closing line of a composite statement",
    "stateDiagram-v2\nstate A {\nB\n}  \u2029\nC\n",
    "stateDiagram-v2\n  state A {\n    B\n  }  \u2029\n  C\n",
  ],
  [
    "U+2028 on the closing line of a composite statement in a body",
    "stateDiagram-v2\nstate A {\nB\nstate D {\nE\n}\u2028\n}\nC\n",
    "stateDiagram-v2\n  state A {\n    B\n    state D {\n      E\n    }\u2028\n  }\n  C\n",
  ],
  [
    "U+2028 after the closing brace at the end of the text",
    "stateDiagram-v2\nstate A {\nB\n}\u2028",
    "stateDiagram-v2\n  state A {\n    B\n  }\u2028\n",
  ],
  [
    "U+2028 on the opening and on the closing line of a composite statement",
    "stateDiagram-v2\nstate   a   b\u2028{\nC\n}\u2028\nD\n",
    "stateDiagram-v2\n  state a b\u2028{\n    C\n  }\u2028\n  D\n",
  ],
  [
    "U+2028 on a line of the body of a composite statement",
    "stateDiagram-v2\nstate A {\nB\u2028\n}\u2028\nC\n",
    "stateDiagram-v2\n  state A {\nB\u2028\n}\u2028\n  C\n",
  ],
  [
    "U+2028 on the closing lines of a composite statement and of one in its body",
    "stateDiagram-v2\nstate A {\nstate D {\nE\n}\u2028\nB\n}\u2028\nC\n",
    "stateDiagram-v2\n  state A {\n    state D {\n      E\n    }\u2028\n    B\n  }\u2028\n  C\n",
  ],
  [
    "U+2028 on the closing lines of three nested composite statements",
    "stateDiagram-v2\nstate A {\nstate D {\nstate F {\nG\n}\u2028\n}\u2028\n}\u2028\nC\n",
    "stateDiagram-v2\n  state A {\n    state D {\n      state F {\n        G\n      }\u2028\n    }\u2028\n  }\u2028\n  C\n",
  ],
  [
    "U+2028 on the closing line of a composite statement with an empty body",
    "stateDiagram-v2\nstate A {\n   }\u2028\nC\n",
    "stateDiagram-v2\n  state A {\n   }\u2028\n  C\n",
  ],
  [
    "U+2028 after a closing brace that follows a statement on its line",
    "stateDiagram-v2\nstate A {\nB }\u2028\nC\n",
    "stateDiagram-v2\n  state A {\nB }\u2028\n  C\n",
  ],
  [
    "U+2028 after a closing brace that follows a directive on its line",
    "stateDiagram-v2\nstate A {\nB\n%%{init: {}}%% }\u2028\nC\n",
    "stateDiagram-v2\n  state A {\nB\n%%{init: {}}%% }\u2028\n  C\n",
  ],
  [
    "a `;` after U+2029 on the closing line of a composite statement",
    "stateDiagram-v2\nstate   A   {\nB\n}\u2029;\nC\n",
    "stateDiagram-v2\n  state   A   {\nB\n}\u2029;\n  C\n",
  ],
  [
    "a comment line after U+2028 on the closing line of a composite statement",
    "stateDiagram-v2\nstate A {\nB\n}\u2028%% c\nC\n",
    "stateDiagram-v2\n  state A {\nB\n}\u2028%% c\nC\n",
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
    "a `%%` comment line after U+2028 at the end of a block header",
    "sequenceDiagram\nalt a\u2028%% c\n b\nA->>B: x\nend\n",
    "sequenceDiagram\n  alt a\u2028%% c\n b\n    A ->> B: x\n  end\n",
  ],
  [
    "a `%%` comment line after U+2028 at the end of a participant",
    "sequenceDiagram\nparticipant A\u2028%% c\n  B\nA->>B: x\n",
    "sequenceDiagram\n  participant A\u2028%% c\n  B\n  A ->> B: x\n",
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
 * Each example is a block that ends with a line separator after its closing
 * `end` or `}`: the character is whitespace to mermaid.js there, and the
 * formatter drops it with the whitespace at the end of the line, in every
 * diagram type but a state diagram.
 */
const droppedExamples: readonly (readonly [string, string, string])[] = [
  [
    "U+2028 after the `end` of a subgraph",
    "flowchart LR\nsubgraph S\nA\nend\u2028\nB\n",
    "flowchart LR\n  subgraph S\n    A\n  end\n  B\n",
  ],
  [
    "U+2029 and whitespace around it after the `end` of a subgraph",
    "flowchart LR\nsubgraph S\nA\nend  \u2029 \nB\n",
    "flowchart LR\n  subgraph S\n    A\n  end\n  B\n",
  ],
  [
    "U+2029 after the `}` of a class body",
    "classDiagram\nclass A {\n+x\n}\u2029\nclass B\n",
    "classDiagram\n  class A {\n    +x\n  }\n  class B\n",
  ],
  [
    "U+2028 after the `}` of a namespace",
    "classDiagram\nnamespace N {\nclass A\n}\u2028\nclass B\n",
    "classDiagram\n  namespace N {\n    class A\n  }\n  class B\n",
  ],
  [
    "U+2028 after the `end` of a block of a sequence diagram",
    "sequenceDiagram\nalt a\nA->>B: x\nend\u2028\nB->>A: y\n",
    "sequenceDiagram\n  alt a\n    A ->> B: x\n  end\n  B ->> A: y\n",
  ],
  [
    "U+2029 and whitespace around it after the last `end` of a sequence diagram",
    "sequenceDiagram\nloop a\nA->>B: x\nend  \u2029 \n",
    "sequenceDiagram\n  loop a\n    A ->> B: x\n  end\n",
  ],
]

/**
 * Each example is an ER diagram with U+2028 or U+2029: in the statement context
 * these are characters of a name, so the name keeps them, and a gap that holds
 * one is printed as written (docs/er.md, Line separators).
 */
const erExamples: readonly (readonly [string, string, string])[] = [
  [
    "U+2028 inside an entity name",
    "erDiagram\nA\u2028B   ||--o{   C : x\n",
    "erDiagram\n  A\u2028B ||--o{ C : x\n",
  ],
  [
    "U+2029 inside a role name",
    "erDiagram\nA ||--o{ B :   x\u2029y\n",
    "erDiagram\n  A ||--o{ B : x\u2029y\n",
  ],
  [
    "U+2028 before the colon of a role",
    "erDiagram\nA ||--o{ B\u2028: x\n",
    "erDiagram\n  A ||--o{ B\u2028 : x\n",
  ],
  [
    "U+2028 between direction and its value",
    "erDiagram\n   direction  \u2028 LR\n",
    "erDiagram\n  direction  \u2028 LR\n",
  ],
  [
    "U+2028 in the text after a direction",
    "erDiagram\ndirection LR a\u2028b\n",
    "erDiagram\n  direction LR a\u2028b\n",
  ],
  [
    "U+2028 inside an attribute name",
    "erDiagram\nA {\n int a\u2028b\n}\n",
    "erDiagram\n  A {\n    int a\u2028b\n  }\n",
  ],
]

/**
 * Each example is a Gantt chart with U+2028 or U+2029: they are whitespace
 * between the units, so a gap that holds one between statements is printed as
 * a line break, while a gap inside a statement that holds one is printed as
 * written, and in a text they are characters of the text (docs/gantt.md, Line
 * separators).
 */
const ganttLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 between the header and a statement",
    "gantt\u2028title T\n",
    "gantt\n  title T\n",
  ],
  [
    "U+2028 between two statements",
    "gantt\ninclusiveEndDates\u2028title T\n",
    "gantt\n  inclusiveEndDates\n  title T\n",
  ],
  [
    "U+2028 and whitespace at the end of a statement",
    "gantt\ninclusiveEndDates \u2028 \n",
    "gantt\n  inclusiveEndDates\n",
  ],
  [
    "U+2028 inside a task description",
    "gantt\na\u2028b : 1d\n",
    "gantt\n  a\u2028b :1d\n",
  ],
  [
    "U+2028 before the colon of a task",
    "gantt\na\u2028: 1d\n",
    "gantt\n  a\u2028:1d\n",
  ],
  [
    "U+2028 between the items of task data",
    "gantt\na : 1d,\u20282d\n",
    "gantt\n  a :1d,\u20282d\n",
  ],
  [
    "U+2028 after a title keyword",
    "gantt\ntitle\u2028T\n",
    "gantt\n  title\u2028T\n",
  ],
  [
    "U+2029 inside a title",
    "gantt\ntitle a\u2029b\n",
    "gantt\n  title a\u2029b\n",
  ],
  [
    "U+2028 between the items of a list",
    "gantt\nexcludes a\u2028b\n",
    "gantt\n  excludes a\u2028b\n",
  ],
  [
    "U+2028 between weekday and its day",
    "gantt\nweekday\u2028monday\n",
    "gantt\n  weekday\u2028monday\n",
  ],
  [
    "U+2028 after the colon of accTitle",
    "gantt\naccTitle:\u2028T\n",
    "gantt\n  accTitle:\u2028T\n",
  ],
  [
    "U+2028 between a click id and its part",
    'gantt\na : id1, 1d\nclick id1\u2028href "u"\n',
    'gantt\n  a :id1, 1d\n  click id1\u2028href "u"\n',
  ],
]

/**
 * Each example is a Gantt chart with a whitespace character other than a space
 * and a tab, which no file of this package may hold: U+00A0 and U+FEFF. Where
 * the lexer reads one whitespace character, a space stands for it; a
 * description keeps it before its colon; and a list keeps a U+FEFF between its
 * items, which the conversion to lower case ignores (docs/gantt.md, Lists and
 * Whitespace characters).
 */
const ganttWhitespaceExamples: readonly (readonly [string, string, string])[] =
  [
    [
      "U+00A0 after a title keyword",
      "gantt\ntitle\u00a0T\n",
      "gantt\n  title T\n",
    ],
    [
      "U+00A0 between weekday and its day",
      "gantt\nweekday\u00a0monday\n",
      "gantt\n  weekday monday\n",
    ],
    [
      "U+00A0 between two statements",
      "gantt\ninclusiveEndDates\u00a0title T\n",
      "gantt\n  inclusiveEndDates\n  title T\n",
    ],
    [
      "U+00A0 around an item of task data",
      "gantt\na :\u00a01d\u00a0\n",
      "gantt\n  a :1d\n",
    ],
    [
      "U+00A0 between the items of task data",
      "gantt\na : id1,\u00a0\u00a01d\n",
      "gantt\n  a :id1, 1d\n",
    ],
    [
      "U+00A0 before the colon of a task",
      "gantt\na\u00a0: 1d\n",
      "gantt\n  a\u00a0:1d\n",
    ],
    [
      "U+FEFF before a task",
      "gantt\ntitle T\n\ufeffa : 1d\n",
      "gantt\n  title T\n  a :1d\n",
    ],
    [
      "U+FEFF between the items of a list",
      "gantt\nincludes \u0391\u0392\ufeff\u03a3\n",
      "gantt\n  includes \u0391\u0392\ufeff\u03a3\n",
    ],
    [
      "U+00A0 between the items of a list",
      "gantt\nincludes \u0391\u0392\u00a0\u03a3\n",
      "gantt\n  includes \u0391\u0392 \u03a3\n",
    ],
  ]

/**
 * Each example is a user journey with U+2028 or U+2029: they are whitespace
 * between the units, so a gap between statements that holds one is printed as
 * a line break, while a gap inside a statement that holds one is printed as
 * written, and in a text they are characters of the text (docs/journey.md,
 * Line separators).
 */
const journeyLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 between the header and a statement",
    "journey\u2028title T\n",
    "journey\n  title T\n",
  ],
  [
    "U+2028 between a description block and a task",
    "journey\naccDescr { d }\u2028A: 5\n",
    "journey\n  accDescr { d }\n  A: 5\n",
  ],
  [
    "U+2028 inside a task description",
    "journey\nA\u2028b: 5\n",
    "journey\n  A\u2028b: 5\n",
  ],
  [
    "U+2028 before the colon of a task",
    "journey\nA\u2028: 5\n",
    "journey\n  A\u2028: 5\n",
  ],
  [
    "U+2028 before the second colon of a task",
    "journey\nA: 5\u2028: Me\n",
    "journey\n  A: 5\u2028: Me\n",
  ],
  [
    "U+2028 between the people of a task",
    "journey\nA: 3: Me,\u2028You\n",
    "journey\n  A: 3: Me,\u2028You\n",
  ],
  [
    "U+2028 in the ignored data of a task",
    "journey\nA: 5: Me: x\u2028y\n",
    "journey\n  A: 5: Me: x\u2028y\n",
  ],
  [
    "U+2028 after a title keyword",
    "journey\ntitle\u2028T\n",
    "journey\n  title\u2028T\n",
  ],
  [
    "U+2029 inside a title",
    "journey\ntitle a\u2029b\n",
    "journey\n  title a\u2029b\n",
  ],
  [
    "U+2028 at the end of a section",
    "journey\nsection S\u2028\nA: 5\n",
    "journey\n  section S\u2028\n    A: 5\n",
  ],
  [
    "U+2028 after the colon of accTitle",
    "journey\naccTitle:\u2028T\n",
    "journey\n  accTitle:\u2028T\n",
  ],
]

/**
 * Each example is a user journey with a whitespace character other than a
 * space and a tab, which no file of this package may hold: U+00A0 and U+FEFF.
 * Where the lexer reads one whitespace character, a space stands for it; a
 * description keeps it before its colon (docs/journey.md, Whitespace
 * characters).
 */
const journeyWhitespaceExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+00A0 after a title keyword",
    "journey\ntitle\u00a0T\n",
    "journey\n  title T\n",
  ],
  [
    "U+00A0 around the score of a task",
    "journey\nA:\u00a05\u00a0\n",
    "journey\n  A: 5\n",
  ],
  [
    "U+00A0 around the people of a task",
    "journey\nA: 3:\u00a0Me\u00a0,\u00a0You\n",
    "journey\n  A: 3: Me, You\n",
  ],
  [
    "U+00A0 before the second colon of a task",
    "journey\nA: 5\u00a0\u00a0: Me\n",
    "journey\n  A: 5: Me\n",
  ],
  [
    "U+00A0 before the colon of a task",
    "journey\nA\u00a0: 5\n",
    "journey\n  A\u00a0: 5\n",
  ],
  [
    "U+00A0 between a description block and a task",
    "journey\naccDescr { d }\u00a0A: 5\n",
    "journey\n  accDescr { d }\n  A: 5\n",
  ],
  [
    "U+FEFF before a task",
    "journey\ntitle T\n\ufeffA: 5\n",
    "journey\n  title T\n  A: 5\n",
  ],
]

/**
 * Each example is a requirement diagram with U+2028 or U+2029: they are
 * whitespace between the units, so a gap between statements that holds one
 * is printed as a line break, while a gap inside a statement that holds one
 * is printed as written, and in a name, a value, and a string they are
 * characters of the text (docs/requirement.md, Line separators).
 */
const requirementLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 after the closing brace of a body",
    "requirementDiagram\nrequirement r {\n}\u2028element e {\n}\n",
    "requirementDiagram\n  requirement r {\n  }\n  element e {\n  }\n",
  ],
  [
    "U+2028 inside a name",
    "requirementDiagram\nrequirement a\u2028b {\n}\n",
    "requirementDiagram\n  requirement a\u2028b {\n  }\n",
  ],
  [
    "U+2028 inside a class",
    "requirementDiagram\nrequirement r:::a\u2028b {\n}\n",
    "requirementDiagram\n  requirement r:::a\u2028b {\n  }\n",
  ],
  [
    "U+2028 after the keyword of a requirement",
    "requirementDiagram\nrequirement\u2028r {\n}\n",
    "requirementDiagram\n  requirement\u2028r {\n  }\n",
  ],
  [
    "U+2028 inside a value",
    "requirementDiagram\nrequirement r {\nid: a\u2028b\n}\n",
    "requirementDiagram\n  requirement r {\n    id: a\u2028b\n  }\n",
  ],
  [
    "U+2029 inside a string",
    'requirementDiagram\nrequirement r {\ntext: "a\u2029b"\n}\n',
    'requirementDiagram\n  requirement r {\n    text: "a\u2029b"\n  }\n',
  ],
  [
    "U+2028 before the colon of a field",
    "requirementDiagram\nrequirement r {\nid\u2028: 1\n}\n",
    "requirementDiagram\n  requirement r {\n    id\u2028: 1\n  }\n",
  ],
  [
    "U+2028 before the arrow of a relationship",
    "requirementDiagram\na - satisfies\u2028-> b\n",
    "requirementDiagram\n  a - satisfies\u2028-> b\n",
  ],
  [
    "U+2028 after the name of a relationship",
    "requirementDiagram\na\u2028- satisfies -> b\n",
    "requirementDiagram\n  a\u2028- satisfies -> b\n",
  ],
  [
    "U+2028 between direction and its value",
    "requirementDiagram\ndirection\u2028LR\n",
    "requirementDiagram\n  direction\u2028LR\n",
  ],
  [
    "U+2028 after the colon of accTitle",
    "requirementDiagram\naccTitle:\u2028T\n",
    "requirementDiagram\n  accTitle:\u2028T\n",
  ],
  [
    "U+2028 inside an accessibility text",
    "requirementDiagram\naccTitle: a\u2028b\n",
    "requirementDiagram\n  accTitle: a\u2028b\n",
  ],
]

/**
 * Each example is a requirement diagram with a whitespace character other
 * than a space and a tab, which no file of this package may hold: U+00A0 and
 * U+FEFF. Where the lexer reads whitespace between units, a space stands for
 * it; in a name or a value they are characters of the text, and stay
 * (docs/requirement.md, Whitespace characters).
 */
const requirementWhitespaceExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+00A0 around the name of a requirement",
    "requirementDiagram\nrequirement\u00a0r\u00a0{\n}\n",
    "requirementDiagram\n  requirement r {\n  }\n",
  ],
  [
    "U+00A0 around the value of a field",
    "requirementDiagram\nrequirement r {\nid:\u00a01\u00a0\n}\n",
    "requirementDiagram\n  requirement r {\n    id: 1\n  }\n",
  ],
  [
    "U+00A0 around the colon of a field",
    "requirementDiagram\nrequirement r {\nid\u00a0:\u00a01\n}\n",
    "requirementDiagram\n  requirement r {\n    id: 1\n  }\n",
  ],
  [
    "U+00A0 around the units of a relationship",
    "requirementDiagram\na\u00a0-\u00a0satisfies\u00a0->\u00a0b\n",
    "requirementDiagram\n  a - satisfies -> b\n",
  ],
  [
    "U+00A0 around the comma of a list of classes",
    "requirementDiagram\nrequirement r:::a\u00a0,\u00a0b {\n}\n",
    "requirementDiagram\n  requirement r:::a,b {\n  }\n",
  ],
  [
    "U+00A0 inside a name",
    "requirementDiagram\nrequirement a\u00a0b {\n}\n",
    "requirementDiagram\n  requirement a\u00a0b {\n  }\n",
  ],
  [
    "U+00A0 inside a value",
    "requirementDiagram\nrequirement r {\nid: a\u00a0b\n}\n",
    "requirementDiagram\n  requirement r {\n    id: a\u00a0b\n  }\n",
  ],
  [
    "U+00A0 between direction and its value",
    "requirementDiagram\ndirection\u00a0LR\n",
    "requirementDiagram\n  direction LR\n",
  ],
  [
    "U+00A0 after the closing brace of a body",
    "requirementDiagram\nrequirement r {\n}\u00a0element e {\n}\n",
    "requirementDiagram\n  requirement r {\n  }\n  element e {\n  }\n",
  ],
  [
    "U+FEFF before the opening brace",
    "requirementDiagram\nrequirement r\ufeff{\n}\n",
    "requirementDiagram\n  requirement r {\n  }\n",
  ],
  [
    "U+FEFF before a statement",
    "requirementDiagram\nrequirement r {\n}\n\ufeffelement e {\n}\n",
    "requirementDiagram\n  requirement r {\n  }\n  element e {\n  }\n",
  ],
]

/**
 * Each example is a mindmap with U+2028 or U+2029: a diagram comment ends at
 * one, and the text after it is a new line, with the character as the first
 * one of its indentation, so the lines go to lines of their own, while in a
 * node text, a shape text, and an icon they are characters of the text and
 * stay (docs/mindmap.md, Line separators).
 */
const mindmapLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 after a comment on the header line",
    "mindmap %% c\u2028root\n",
    "mindmap %% c\n  root\n",
  ],
  [
    "U+2028 after a comment after a shape",
    "mindmap\nroot\n  a[x] %% c\u2028y\n",
    "mindmap\n  root\n    a[x] %% c\n   y\n",
  ],
  [
    "U+2028 after a comment after an icon",
    "mindmap\n  root\n    a\n    ::icon(x) %% c\u2028    b\n",
    "mindmap\n  root\n    a\n    ::icon(x) %% c\n     b\n",
  ],
  [
    "U+2028 after a bare comment between nodes",
    "mindmap\nroot\n  a[x] %% c\n%%{ }%%\u2028  b\n",
    "mindmap\n  root\n    a[x] %% c\n     %%{ }%%\n     b\n",
  ],
  [
    "U+2028 inside a node text",
    "mindmap\n  root\n    a\u2028b\n",
    "mindmap\n  root\n    a\u2028b\n",
  ],
  [
    "U+2029 inside a shape text",
    "mindmap\n  root\n    a[x\u2029y]\n",
    "mindmap\n  root\n    a[x\u2029y]\n",
  ],
  [
    "U+2028 inside an icon",
    "mindmap\n  root\n    a\n    ::icon(x\u2028y)\n",
    "mindmap\n  root\n    a\n    ::icon(x\u2028y)\n",
  ],
  [
    "U+2028 after the header",
    "mindmap\u2028root\n  a\n  b\n  c\n",
    "mindmap\n  root\n   a\n   b\n   c\n",
  ],
]

/**
 * Each example is a mindmap with a whitespace character other than a space
 * and a tab, which no file of this package may hold. Every whitespace
 * character before a node is one character of its indentation, whatever it
 * is, so the printer writes the characters of the options and keeps their
 * number; in a node text and a shape text they are characters of the text
 * (docs/mindmap.md, Whitespace characters).
 */
const mindmapWhitespaceExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+00A0 in the indentation",
    "mindmap\n\u00a0\u00a0root\n\u00a0\u00a0\u00a0\u00a0a\n",
    "mindmap\n  root\n    a\n",
  ],
  [
    "U+3000 in the indentation",
    "mindmap\n\u3000root\n\u3000\u3000a\n",
    "mindmap\n  root\n   a\n",
  ],
  [
    "U+FEFF in the indentation",
    "mindmap\n\ufeffroot\n\ufeff\ufeffa\n",
    "mindmap\n  root\n   a\n",
  ],
  [
    "U+00A0 after the header",
    "mindmap\u00a0root\n  a\n",
    "mindmap\n  root\n   a\n",
  ],
  [
    "U+00A0 inside a node text",
    "mindmap\n  root\n    a\u00a0b\n",
    "mindmap\n  root\n    a\u00a0b\n",
  ],
  [
    "U+00A0 inside a shape text",
    "mindmap\n  root\n    c[x\u00a0y]\n",
    "mindmap\n  root\n    c[x\u00a0y]\n",
  ],
  [
    "U+00A0 and U+3000 after a shape",
    "mindmap\n  root\n    a[x]\u00a0\u3000\n",
    "mindmap\n  root\n    a[x]\n",
  ],
  [
    "U+00A0 before a comment after a shape",
    "mindmap\n  root\n    a[x]\u00a0%% c\n",
    "mindmap\n  root\n    a[x] %% c\n",
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

/**
 * Each example is a timeline with U+2028 or U+2029: they are whitespace
 * between the units, so a gap between statements that holds one is printed as
 * a line break, while a gap inside a statement that holds one is printed as
 * written, and in a text they are characters of the text (docs/timeline.md,
 * Line separators).
 */
const timelineLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 between the header and a statement",
    "timeline\u2028title T\n",
    "timeline\n  title T\n",
  ],
  [
    "U+2028 between the header and a period",
    "timeline\u2028a : e\n",
    "timeline\n  a : e\n",
  ],
  [
    "U+2028 between a description block and a period",
    "timeline\naccDescr { d }\u2028a : e\n",
    "timeline\n  accDescr { d }\n  a : e\n",
  ],
  [
    "U+2028 inside a period",
    "timeline\na\u2028b : e\n",
    "timeline\n  a\u2028b : e\n",
  ],
  [
    "U+2028 before the colon of an event",
    "timeline\na\u2028: e\n",
    "timeline\n  a\u2028: e\n",
  ],
  [
    "U+2028 inside an event",
    "timeline\na : e\u2028f\n",
    "timeline\n  a : e\u2028f\n",
  ],
  [
    "U+2028 before the second colon of an event",
    "timeline\na : e\u2028: f\n",
    "timeline\n  a : e\u2028: f\n",
  ],
  [
    "U+2028 after the colon of an event",
    "timeline\na :\u2028e\n",
    "timeline\n  a :\u2028e\n",
  ],
  [
    "U+2028 after a title keyword",
    "timeline\ntitle\u2028T\n",
    "timeline\n  title\u2028T\n",
  ],
  [
    "U+2029 inside a title",
    "timeline\ntitle a\u2029b\n",
    "timeline\n  title a\u2029b\n",
  ],
  [
    "U+2028 at the end of a section name",
    "timeline\nsection S\u2028\na : e\n",
    "timeline\n  section S\u2028\n    a : e\n",
  ],
  [
    "U+2028 after the colon of an accessibility title",
    "timeline\naccTitle:\u2028T\n",
    "timeline\n  accTitle:\u2028T\n",
  ],
  [
    "U+2028 between the header and a direction",
    "timeline\u2028TD\n",
    "timeline\n  TD\n",
  ],
]

/**
 * Each example is a timeline with a whitespace character other than a space
 * or a tab: where a rule reads one whitespace character it is printed as a
 * space, between statements it is dropped, and in a text, and in the
 * whitespace before the colon of a period, it stays (docs/timeline.md,
 * Whitespace characters).
 */
const timelineWhitespaceExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+00A0 as the separator after a title keyword",
    "timeline\ntitle\u00a0T\n",
    "timeline\n  title T\n",
  ],
  [
    "U+00A0 as the separator after the colon of an event",
    "timeline\na :\u00a0e\n",
    "timeline\n  a : e\n",
  ],
  [
    "U+00A0 after the separator of an event",
    "timeline\na : \u00a0e\n",
    "timeline\n  a : \u00a0e\n",
  ],
  [
    "U+00A0 before the colon of a period",
    "timeline\na\u00a0: e\n",
    "timeline\n  a\u00a0: e\n",
  ],
  [
    "U+00A0 at the end of an event",
    "timeline\na : e\u00a0\n",
    "timeline\n  a : e\u00a0\n",
  ],
  [
    "U+00A0 between the header and a direction",
    "timeline\u00a0TD\n",
    "timeline\n  TD\n",
  ],
  [
    "U+00A0 after a description block",
    "timeline\naccDescr { d }\u00a0a : e\n",
    "timeline\n  accDescr { d }\n  a : e\n",
  ],
  [
    "U+3000 in the indentation before a period",
    "timeline\n\u3000a : e\n",
    "timeline\n  a : e\n",
  ],
  [
    "U+3000 between two events",
    "timeline\na : e\u3000: f\n",
    "timeline\n  a : e\u3000: f\n",
  ],
  [
    "U+FEFF between statements",
    "timeline\ntitle T\n\ufeffa : e\n",
    "timeline\n  title T\n  a : e\n",
  ],
  [
    "U+00A0 inside a section name",
    "timeline\nsection S\u00a0T\n",
    "timeline\n  section S\u00a0T\n",
  ],
]

/**
 * Each example is a sankey diagram with a whitespace character other than a
 * space that mermaid.js accepts only at the end of the text, where it is
 * dropped, and so is it from the output (docs/sankey.md, Whitespace
 * characters).
 */
const sankeyWhitespaceExamples: readonly (readonly [string, string, string])[] =
  [
    [
      "U+00A0 at the end of the text",
      "sankey\na,b,1\u00a0\n",
      "sankey\na,b,1\n",
    ],
    [
      "U+3000 at the end of the text without a line feed",
      "sankey\na,b,1\u3000",
      "sankey\na,b,1\n",
    ],
    [
      "U+2028 at the end of the text without a line feed",
      "sankey\na,b,1\u2028",
      "sankey\na,b,1\n",
    ],
    [
      "U+2029 at the end of the text",
      "sankey\na,b,1\u2029\n",
      "sankey\na,b,1\n",
    ],
    [
      "U+FEFF at the end of the text without a line feed",
      "sankey\na,b,1\ufeff",
      "sankey\na,b,1\n",
    ],
    [
      "a tab at the end of the text without a line feed",
      "sankey\na,b,1\t",
      "sankey\na,b,1\n",
    ],
    [
      "U+00A0 on a line of its own at the end of the text",
      "sankey\na,b,1\n\u00a0\n",
      "sankey\na,b,1\n",
    ],
    [
      "U+00A0 at the end of the last comment line of the text",
      "sankey\na,b,1\n%% c\u00a0",
      "sankey\na,b,1\n%% c\u00a0\n",
    ],
  ]

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

describe("a block that ends with a line separator after its closing word", () => {
  it.each(droppedExamples)("drops %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

describe("an ER diagram with a line separator", () => {
  it.each(erExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

describe("a Gantt chart with a line separator", () => {
  it.each(ganttLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a Gantt chart with a whitespace character that no fixture file holds", () => {
  it.each(ganttWhitespaceExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

describe("a user journey with a line separator", () => {
  it.each(journeyLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a user journey with a whitespace character that no fixture file holds", () => {
  it.each(journeyWhitespaceExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a requirement diagram with a line separator", () => {
  it.each(requirementLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a requirement diagram with a whitespace character that no fixture file holds", () => {
  it.each(requirementWhitespaceExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a mindmap with a line separator", () => {
  it.each(mindmapLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a mindmap with a whitespace character that no fixture file holds", () => {
  it.each(mindmapWhitespaceExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a timeline with a line separator", () => {
  it.each(timelineLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a timeline with a whitespace character that no fixture file holds", () => {
  it.each(timelineWhitespaceExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a sankey diagram with a whitespace character at the end of the text", () => {
  it.each(sankeyWhitespaceExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})
