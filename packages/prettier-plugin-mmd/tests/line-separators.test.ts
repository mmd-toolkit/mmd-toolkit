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
import type { Options } from "prettier"
import plugin from "../src/index.ts"
import {
  dbOfText,
  defaultEmbedded,
  writtenEmbeddedTexts,
  describeFrontmatterChange,
} from "./db-reading.ts"

/** Formats a text of a diagram. */
function format(text: string, options: Options = {}): Promise<string> {
  return prettier.format(text, {
    ...options,
    filepath: "diagram.mmd",
    plugins: [plugin],
  })
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
  Options?,
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
  [
    "mindmap: selected-comment-ls-kept",
    "mindmap\nRoot[x]%% style:#fill;\u2028 Child\n",
    "mindmap\n  Root[x]%% style:#fill;\n    Child\n",
  ],
  [
    "mindmap: comment-ps-semicolon-after",
    "mindmap\nRoot[x]%% c\u2029 Child;y\n",
    "mindmap\n  Root[x]%% c\n    Child;y\n",
  ],
  [
    "mindmap: comment-ls-semicolon-both",
    "mindmap\nRoot[x;y]%% c;\u2028 Child;y\n",
    "mindmap\n  Root[x;y]%% c;\n    Child;y\n",
  ],
  [
    "mindmap: icon-comment-ps-kept",
    "mindmap\nRoot\n::icon(i;j)%% c\u2029 Child;y\n",
    "mindmap\n  Root\n  ::icon(i;j)%% c\n    Child;y\n",
  ],
  [
    "mindmap: selected-comment-ps-wide",
    "mindmap\n     Root[x]%% style:#fill;\u2029        Child;y\n",
    "mindmap\n  Root[x]%% style:#fill;\n      Child;y\n",
  ],
  [
    "mindmap: selected-comment-ls-zero",
    "mindmap\nRoot[x]%% style:#fill;\u2028Child;y\n",
    "mindmap\n Root[x]%% style:#fill;\n  Child;y\n",
    { tabWidth: 0 },
  ],
  [
    "mindmap: icon-comment-ls-tabs",
    "mindmap\nRoot\n::icon(i)%% style:#fill;\u2028Child;y\n",
    "mindmap\n\tRoot\n\t::icon(i)%% style:#fill;\n\t\tChild;y\n",
    { useTabs: true },
  ],
  [
    "U+2028 before a directive that starts the line",
    "mindmap\nR[x]%% c\u2028%%{init: {}}%% C\n",
    "mindmap\n  R[x]%% c\n   %%{init: {}}%% C\n",
  ],
  [
    "U+2029 before a directive that touches the text",
    "mindmap\nR[x]%% c\u2029%%{init: {}}%%C\n",
    "mindmap\n  R[x]%% c\n   %%{init: {}}%%C\n",
  ],
  [
    "U+2028 and whitespace before and after a directive",
    "mindmap\nR[x]%% c\u2028   %%{init: {}}%%   C\n",
    "mindmap\n  R[x]%% c\n      %%{init: {}}%%   C\n",
  ],
  [
    "U+2028 before two directives",
    "mindmap\nR[x]%% c\u2028%%{a}%% %%{b}%%  C\n",
    "mindmap\n  R[x]%% c\n   %%{a}%% %%{b}%%  C\n",
  ],
  [
    "U+2028 before a directive and an icon",
    "mindmap\nR[x]%% c\u2028%%{x}%% ::icon(y)\n",
    "mindmap\n  R[x]%% c\n %%{x}%% ::icon(y)\n",
  ],
  [
    "U+2028 before a directive and a class",
    "mindmap\nR[x]%% c\u2028%%{x}%% :::cls\n",
    "mindmap\n  R[x]%% c\n %%{x}%% :::cls\n",
  ],
  [
    "U+2028 before a directive in a deeper line",
    "mindmap\n  R\n    A[x]%% c\u2028%%{x}%%     B\n",
    "mindmap\n  R\n    A[x]%% c\n %%{x}%%     B\n",
  ],
  [
    "U+2028 after a selected semicolon before a directive",
    "mindmap\nR[x]%% style:#x;\u2028%%{x}%% C\n",
    "mindmap\n  R[x]%% style:#x;\n   %%{x}%% C\n",
  ],
  [
    "U+2028 before a directive with a tab width of 0",
    "mindmap\nR[x]%% c\u2028%%{init: {}}%% C\n",
    "mindmap\n R[x]%% c\n  %%{init: {}}%% C\n",
    { tabWidth: 0 },
  ],
  [
    "U+2028 before a directive with tabs",
    "mindmap\nR[x]%% c\u2028%%{init: {}}%% C\n",
    "mindmap\n\tR[x]%% c\n\t\t%%{init: {}}%% C\n",
    { useTabs: true },
  ],
  [
    "U+2028 before a comment line and a directive",
    "mindmap\nR[x]%% c\u2028%% d\n%%{x}%% C\n",
    "mindmap\n  R[x]%% c\n    %% d\n   %%{x}%% C\n",
  ],
  [
    "U+2028 before a comment line and an indented directive",
    "mindmap\nR[x]%% c\u2028%% d\n  %%{x}%% C\n",
    "mindmap\n  R[x]%% c\n      %% d\n     %%{x}%% C\n",
  ],
  [
    "U+2028 before a directive, a comment line, and a directive",
    "mindmap\nR[x]%% c\u2028%%{a}%% %% d\n%%{x}%% C\n",
    "mindmap\n  R[x]%% c\n    %%{a}%% %% d\n   %%{x}%% C\n",
  ],
  [
    "U+2028 before two comment lines and a directive",
    "mindmap\nR[x]%% c\u2028%% d\n%% e\n%%{x}%% C\n",
    "mindmap\n  R[x]%% c\n    %% d\n    %% e\n   %%{x}%% C\n",
  ],
  [
    "U+2028 and U+2029 before two directives in two lines",
    "mindmap\nR[x]%% c\u2028%%{x}%% C[z]%% e\u2029%%{y}%% D\n",
    "mindmap\n  R[x]%% c\n   %%{x}%% C[z]%% e\n   %%{y}%% D\n",
  ],
  [
    "U+2028 before a directive and a sibling",
    "mindmap\nR[x]%% c\u2028%%{x}%% C\n  D\n",
    "mindmap\n  R[x]%% c\n   %%{x}%% C\n    D\n",
  ],
  [
    "U+2028 before a directive line of its own",
    "mindmap\nR[x]%% c\u2028%%{init: {}}%%\n  C\n",
    "mindmap\n  R[x]%% c\n    %%{init: {}}%%\n    C\n",
  ],
  [
    "U+2028 before an empty line",
    "mindmap\nR[x]%% c\u2028\n  C\n",
    "mindmap\n  R[x]%% c\n\n    C\n",
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
async function expectKept(
  input: string,
  output: string,
  options: Options = {},
): Promise<void> {
  expect(await format(input, options)).toBe(output)
  expect(await format(output, options)).toBe(output)
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
    "U+2028 inside a description line",
    "timeline\naccDescr {\n  a\u2028   b\n c\n}\n",
    "timeline\n  accDescr {\n    a\u2028   b\n    c\n  }\n",
  ],
  [
    "U+2029 inside a description line",
    "timeline\naccDescr {\n  a\u2029   b\n c\n}\n",
    "timeline\n  accDescr {\n    a\u2029   b\n    c\n  }\n",
  ],
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
    "U+2028 inside a period before a later event",
    "timeline\na\u2028b : e\n: f\n",
    "timeline\n  a\u2028b : e\n    : f\n",
  ],
  [
    "U+2029 inside a period before a later event",
    "timeline\na\u2029b : e\n: f\n",
    "timeline\n  a\u2029b : e\n    : f\n",
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

/**
 * Each example is an XY chart with U+2028 or U+2029: they are whitespace
 * between its units, a line break like any whitespace between statements, and
 * a gap inside a statement that holds one is printed as written; in a string
 * and in an accessibility text they are characters of the text
 * (docs/xychart.md, Line separators).
 */
const xychartLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 between the header and a statement",
    "xychart\u2028title T\n",
    "xychart\n  title T\n",
  ],
  [
    "U+2028 between two statements",
    "xychart\ntitle T\u2028line [1]\n",
    "xychart\n  title T\n  line [1]\n",
  ],
  [
    "U+2028 between the header and the orientation",
    "xychart\u2028horizontal\nline [1]\n",
    "xychart\u2028horizontal\n  line [1]\n",
  ],
  [
    "U+2028 between the words of a title",
    "xychart\ntitle a\u2028b\n",
    "xychart\n  title a\u2028b\n",
  ],
  [
    "U+2029 between the words of a title",
    "xychart\ntitle a\u2029b\n",
    "xychart\n  title a\u2029b\n",
  ],
  [
    "U+2028 after a title keyword",
    "xychart\ntitle\u2028T\n",
    "xychart\n  title\u2028T\n",
  ],
  [
    "U+2028 between the words of a category",
    "xychart\nx-axis [a\u2028b, c]\n",
    "xychart\n  x-axis [a\u2028b, c]\n",
  ],
  [
    "U+2028 after a comma of the values",
    "xychart\nline [1,\u20282]\n",
    "xychart\n  line [1,\u20282]\n",
  ],
  [
    "U+2028 before the bracket of a plot",
    "xychart\nline\u2028[1]\n",
    "xychart\n  line\u2028[1]\n",
  ],
  [
    "U+2028 between a value and its label",
    'xychart\nline [1\u2028"a"]\n',
    'xychart\n  line [1\u2028"a"]\n',
  ],
  [
    "U+2028 around the arrow of a range",
    "xychart\nx-axis 0\u2028-->\u20281\n",
    "xychart\n  x-axis 0\u2028-->\u20281\n",
  ],
  [
    "U+2028 in a string",
    'xychart\ntitle "a\u2028b"\n',
    'xychart\n  title "a\u2028b"\n',
  ],
  [
    "U+2028 in an accessibility text",
    "xychart\naccTitle: a\u2028b\n",
    "xychart\n  accTitle: a\u2028b\n",
  ],
  [
    "U+2028 after the colon of accTitle",
    "xychart\naccTitle:\u2028T\n",
    "xychart\n  accTitle:\u2028T\n",
  ],
  [
    "U+2028 after a description block",
    "xychart\naccDescr { d }\u2028title T\n",
    "xychart\n  accDescr { d }\n  title T\n",
  ],
  [
    "U+2028 at the end of a statement",
    "xychart\ntitle T\u2028\nline [1]\n",
    "xychart\n  title T\n  line [1]\n",
  ],
  [
    "U+2028 at the end of the text",
    "xychart\ntitle T\u2028",
    "xychart\n  title T\n",
  ],
]

/**
 * Each example is an XY chart with a whitespace character other than a space
 * or a tab: between units a run of them becomes one space, at the ends of a
 * statement they are dropped, and in a string and in an accessibility text
 * they stay (docs/xychart.md, Whitespace characters).
 */
const xychartWhitespaceExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+00A0 between the words of a title",
    "xychart\ntitle a\u00a0b\n",
    "xychart\n  title a b\n",
  ],
  [
    "a form feed between the words of a title",
    "xychart\ntitle a\fb\n",
    "xychart\n  title a b\n",
  ],
  [
    "U+00A0 after a title keyword",
    "xychart\ntitle\u00a0T\n",
    "xychart\n  title T\n",
  ],
  [
    "U+00A0 around the values of a plot",
    "xychart\nline [1,\u00a02\u00a0]\n",
    "xychart\n  line [1, 2]\n",
  ],
  [
    "U+00A0 around the arrow of a range",
    "xychart\nx-axis 0\u00a0-->\u00a01\n",
    "xychart\n  x-axis 0 --> 1\n",
  ],
  [
    "U+00A0 between the header and the orientation",
    "xychart\u00a0horizontal\nline [1]\n",
    "xychart horizontal\n  line [1]\n",
  ],
  [
    "U+FEFF between the words of a category",
    "xychart\nx-axis [a\ufeffb]\n",
    "xychart\n  x-axis [a b]\n",
  ],
  [
    "U+3000 before a statement",
    "xychart\n\u3000title T\n",
    "xychart\n  title T\n",
  ],
  [
    "U+FEFF before a statement",
    "xychart\ntitle T\n\ufeffline [1]\n",
    "xychart\n  title T\n  line [1]\n",
  ],
  [
    "U+00A0 between two statements",
    "xychart\ntitle T\u00a0line [1]\n",
    "xychart\n  title T\n  line [1]\n",
  ],
  [
    "U+00A0 at the end of a statement",
    "xychart\ntitle T\u00a0\nline [1]\n",
    "xychart\n  title T\n  line [1]\n",
  ],
  [
    "U+00A0 in a string",
    'xychart\ntitle "a\u00a0b"\n',
    'xychart\n  title "a\u00a0b"\n',
  ],
  [
    "U+00A0 in an accessibility text",
    "xychart\naccTitle: a\u00a0b\n",
    "xychart\n  accTitle: a\u00a0b\n",
  ],
  [
    "U+3000 around the text of accTitle",
    "xychart\naccTitle:\u3000T\u3000\n",
    "xychart\n  accTitle: T\n",
  ],
  [
    "U+00A0 inside a description block",
    "xychart\naccDescr {\u00a0d\u00a0}\n",
    "xychart\n  accDescr { d }\n",
  ],
  [
    "U+00A0 inside an empty description block",
    "xychart\naccDescr {\u00a0}\n",
    "xychart\n  accDescr {}\n",
  ],
]

/**
 * Each example is a quadrant chart with U+2028 or U+2029: they are characters
 * of a word, as U+00A0 is, so a text, a name, a title, and an accessibility
 * text keep them and a gap that holds one is printed as written; a title drops
 * them at its ends (docs/quadrant.md, Line separators).
 */
const quadrantLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 between the words of a text",
    "quadrantChart\nquadrant-1 a\u2028b\n",
    "quadrantChart\n  quadrant-1 a\u2028b\n",
  ],
  [
    "U+2029 between the words of a text",
    "quadrantChart\nquadrant-1 a\u2029b\n",
    "quadrantChart\n  quadrant-1 a\u2029b\n",
  ],
  [
    "U+2028 at the end of a text",
    "quadrantChart\nquadrant-1 A\u2028\n",
    "quadrantChart\n  quadrant-1 A\u2028\n",
  ],
  [
    "U+2028 between a statement and the next",
    "quadrantChart\ntitle T\nquadrant-1 A\u2028\nquadrant-2 B\n",
    "quadrantChart\n  title T\n  quadrant-1 A\u2028\n  quadrant-2 B\n",
  ],
  [
    "U+2028 between the words of a title",
    "quadrantChart\ntitle T\u2028U\n",
    "quadrantChart\n  title T\u2028U\n",
  ],
  [
    "U+2028 after a title keyword",
    "quadrantChart\ntitle\u2028T\n",
    "quadrantChart\n  title\u2028T\n",
  ],
  [
    "U+2028 at the end of a title",
    "quadrantChart\ntitle T\u2028\n",
    "quadrantChart\n  title T\n",
  ],
  [
    "U+2028 in the name of a point",
    "quadrantChart\nA\u2028B: [0.3, 0.6]\n",
    "quadrantChart\n  A\u2028B: [0.3, 0.6]\n",
  ],
  [
    "U+2028 in an accessibility text",
    "quadrantChart\naccTitle: a\u2028b\n",
    "quadrantChart\n  accTitle: a\u2028b\n",
  ],
  [
    "U+2028 in a string",
    'quadrantChart\nx-axis "a\u2028b"\n',
    'quadrantChart\n  x-axis "a\u2028b"\n',
  ],
  [
    "U+2028 around the arrow of an axis",
    "quadrantChart\nx-axis L\u2028-->\u2028R\n",
    "quadrantChart\n  x-axis L\u2028 --> \u2028R\n",
  ],
  [
    "U+2028 in the name of a class",
    "quadrantChart\nclassDef a\u2028b color: #f00\n",
    "quadrantChart\n  classDef a\u2028b color: #f00\n",
  ],
]

/**
 * Each example is a quadrant chart with a whitespace character other than a
 * space or a tab: in a text and a name the characters of a word stay, around
 * the `:`, the brackets, and the comma of a point and the colon and the brace
 * of an accessibility statement U+00A0 is whitespace and a space is printed,
 * and a form feed stays inside a text (docs/quadrant.md, Whitespace
 * characters).
 */
const quadrantWhitespaceExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+00A0 between the words of a text",
    "quadrantChart\nquadrant-1 a\u00a0b\n",
    "quadrantChart\n  quadrant-1 a\u00a0b\n",
  ],
  [
    "U+3000 between the words of a text",
    "quadrantChart\nquadrant-1 a\u3000b\n",
    "quadrantChart\n  quadrant-1 a\u3000b\n",
  ],
  [
    "U+FEFF between the words of a text",
    "quadrantChart\nquadrant-1 a\ufeffb\n",
    "quadrantChart\n  quadrant-1 a\ufeffb\n",
  ],
  [
    "a form feed between the words of a text",
    "quadrantChart\nquadrant-1 a\fb\n",
    "quadrantChart\n  quadrant-1 a\fb\n",
  ],
  [
    "U+00A0 at the end of a text",
    "quadrantChart\nquadrant-1 A\u00a0\n",
    "quadrantChart\n  quadrant-1 A\u00a0\n",
  ],
  [
    "U+00A0 around the text of a title",
    "quadrantChart\ntitle\u00a0T\u00a0\n",
    "quadrantChart\n  title T\n",
  ],
  [
    "U+00A0 before the name of a point",
    "quadrantChart\n\u00a0A: [0.3, 0.6]\n",
    "quadrantChart\n  \u00a0A: [0.3, 0.6]\n",
  ],
  [
    "U+00A0 around the colon and the brackets of a point",
    "quadrantChart\nA\u00a0:\u00a0[0.3,\u00a00.6]\n",
    "quadrantChart\n  A: [0.3, 0.6]\n",
  ],
  [
    "U+00A0 inside the brackets of a point",
    "quadrantChart\nA: [\u00a00.3\u00a0,\u00a00.6\u00a0]\n",
    "quadrantChart\n  A: [0.3, 0.6]\n",
  ],
  [
    "a form feed after the bracket of a point",
    "quadrantChart\nA: [0.3, 0.6]\f radius: 9\n",
    "quadrantChart\n  A: [0.3, 0.6] radius: 9\n",
  ],
  [
    "U+00A0 around the colon of accTitle",
    "quadrantChart\naccTitle\u00a0:\u00a0T\n",
    "quadrantChart\n  accTitle: T\n",
  ],
  [
    "U+00A0 inside a description block",
    "quadrantChart\naccDescr\u00a0{\u00a0d\u00a0}\n",
    "quadrantChart\n  accDescr { d }\n",
  ],
  [
    "U+00A0 inside an empty description block",
    "quadrantChart\naccDescr {\u00a0}\n",
    "quadrantChart\n  accDescr {}\n",
  ],
  [
    "U+00A0 around the arrow of an axis",
    "quadrantChart\nx-axis L\u00a0-->\u00a0R\n",
    "quadrantChart\n  x-axis L\u00a0 --> \u00a0R\n",
  ],
  [
    "U+00A0 in the name of a class",
    "quadrantChart\nclassDef a\u00a0b color: #f00\n",
    "quadrantChart\n  classDef a\u00a0b color: #f00\n",
  ],
]

/**
 * Each example is a block diagram with U+2028 or U+2029: they are whitespace between the units of a statement and between statements, as a space is, so a gap that holds one on a line is printed as written, and they are characters inside a label (docs/block.md, Line separators).
 */
const blockLineSeparatorExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 between two statements of a row",
    "block-beta\na\u2028b\n",
    "block-beta\n  a\u2028b\n",
  ],
  [
    "U+2029 between two statements of a row",
    "block-beta\na\u2029b\nc\n",
    "block-beta\n  a\u2029b\n  c\n",
  ],
  [
    "U+2028 around the arrow of an edge",
    "block-beta\nA\u2028-->\u2028B\n",
    "block-beta\n  A\u2028-->\u2028B\n",
  ],
  [
    "U+2028 between an id and its shape",
    'block-beta\nA\u2028("x")\n',
    'block-beta\n  A\u2028("x")\n',
  ],
  [
    "U+2028 before the colon of a width",
    "block-beta\nA\u2028:3\n",
    "block-beta\n  A\u2028:3\n",
  ],
  [
    "U+2028 after columns",
    "block-beta\ncolumns\u20283\n",
    "block-beta\n  columns\u20283\n",
  ],
  [
    "U+2028 in a label",
    'block-beta\nA["a\u2028b"]\n',
    'block-beta\n  A["a\u2028b"]\n',
  ],
  [
    "U+2028 at the end of a statement of a row",
    "block-beta\nA\u2028\n",
    "block-beta\n  A\n",
  ],
  [
    "U+2028 before a comment line that joins lines",
    "block-beta\ncolumns\u2028\n%% c\nA\n",
    "block-beta\n  columns\u2028\n%% c\nA\n",
  ],
  [
    "U+2029 before comment lines that join lines",
    "block-beta\na\u2029\n%% c\n%% d\nb\nc\n",
    "block-beta\n  a\u2029\n%% c\n%% d\nb\n  c\n",
  ],
  [
    "U+2028 between a composite head and its body",
    "block-beta\nblock:G\u2028a\u2028end\n",
    "block-beta\n  block:G\n    a\n  end\n",
  ],
  [
    "block: comment-ls-semicolon-before",
    'block-beta\nblock:r\n A["x"]%% c;\u2028 B["y"]\nend\n',
    'block-beta\n  block:r\n    A["x"] %% c;\u2028 B["y"]\n  end\n',
  ],
  [
    "block: comment-ps-semicolon-after",
    'block-beta\nblock:r\n A["x"]%% c\u2029 B["x;y"]\nend\n',
    'block-beta\n  block:r\n    A["x"] %% c\u2029 B["x;y"]\n  end\n',
  ],
  [
    "block: comment-ls-semicolon-both",
    'block-beta\nblock:r\n A["x"]%% c;\u2028 B["x;y"]\nend\n',
    'block-beta\n  block:r\n    A["x"] %% c;\u2028 B["x;y"]\n  end\n',
  ],
]

/**
 * Each example is a block diagram with a whitespace character other than a space or a line feed: where the printer chooses the whitespace it prints a space and drops them at the ends of a line, and U+0085 is no whitespace but a character of an id (docs/block.md, Whitespace characters).
 */
const blockWhitespaceExamples: readonly (readonly [string, string, string])[] =
  [
    [
      "U+00A0 between two statements of a row",
      "block-beta\na\u00a0b\n",
      "block-beta\n  a b\n",
    ],
    [
      "U+00A0 at the ends of a line",
      "block-beta\n\u00a0a\u00a0\n",
      "block-beta\n  a\n",
    ],
    [
      "a tab, a vertical tab, a form feed, U+3000, and U+FEFF between units",
      "block-beta\ncolumns\t3\u3000a\ufeffb\fc\u000bd\n",
      "block-beta\n  columns 3\n  a b c d\n",
    ],
    [
      "U+00A0 around the arrow of an edge",
      "block-beta\nA\u00a0-->\u00a0B\n",
      "block-beta\n  A --> B\n",
    ],
    [
      "U+00A0 between an id and its shape",
      'block-beta\nA\u00a0("x")\n',
      'block-beta\n  A("x")\n',
    ],
    [
      "U+00A0 before the directions of a block arrow",
      'block-beta\nA<["z"]>\u00a0(right)\n',
      'block-beta\n  A<["z"]>(right)\n',
    ],
    [
      "U+00A0 in a label",
      'block-beta\nA["a\u00a0b"]\n',
      'block-beta\n  A["a\u00a0b"]\n',
    ],
    [
      "U+00A0 in a class definition",
      "block-beta\nclassDef\u00a0c1\u00a0fill:#f00\u00a0\n",
      "block-beta\n  classDef c1 fill:#f00\n",
    ],
    [
      "U+00A0 in a style",
      "block-beta\nA\nstyle\u00a0A\u00a0fill:#f00\u00a0\n",
      "block-beta\n  A\n  style A fill:#f00\n",
    ],
    [
      "U+00A0 inside an empty description block",
      "block-beta\naccDescr\u00a0{\u00a0}\u00a0a\n",
      "block-beta\n  accDescr {}\n  a\n",
    ],
    [
      "U+00A0 in a composite head",
      "block-beta\nblock:\u00a0G\u00a0a\u00a0end\n",
      "block-beta\n  block:G\n    a\n  end\n",
    ],
    [
      "U+0085 inside an id",
      "block-beta\na\u0085b\n",
      "block-beta\n  a\u0085b\n",
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
  it.each(
    mindmapLineSeparatorExamples.map(([name, input, output, options]) => ({
      name,
      input,
      output,
      options,
    })),
  )("keeps $name", async ({ input, output, options }) => {
    await expectKept(input, output, options)
  })
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

describe("an XY chart with a line separator", () => {
  it.each(xychartLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("an XY chart with a whitespace character that no fixture file holds", () => {
  it.each(xychartWhitespaceExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a quadrant chart with a line separator", () => {
  it.each(quadrantLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a quadrant chart with a whitespace character that no fixture file holds", () => {
  it.each(quadrantWhitespaceExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a block diagram with a line separator", () => {
  it.each(blockLineSeparatorExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

describe("a block diagram with a whitespace character that no fixture file holds", () => {
  it.each(blockWhitespaceExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

/** Fixed kanban cases of Unicode whitespace, comment boundaries, and CR/LF. */
const kanbanExamples: readonly (readonly [string, string, string, Options?])[] =
  [
    ["kanban: tab-one-space", "kanban\n\tS\n\t\tA\n", "kanban\n  S\n    A\n"],
    [
      "kanban: blank-whitespace",
      "kanban\n S\n \t\n   A\n",
      "kanban\n  S\n\n    A\n",
    ],
    [
      "kanban: bare-trailing-trim",
      "kanban\n S   \n   A\t \n",
      "kanban\n  S   \n    A\t \n",
    ],
    [
      "kanban: closed-trailing-trim",
      "kanban\n S[x]   \n   A[y]@{ticket: X}\t \n ::icon(z)  \n",
      "kanban\n  S[x]\n    A[y]@{ticket: X}\n    ::icon(z)\n",
    ],
    [
      "kanban: crlf-to-lf",
      'kanban\r\n S["x\r\n y"]\r\n',
      'kanban\n  S["x\n y"]\n',
    ],
    ["kanban: cr-to-lf", 'kanban\r S["x\r y"]\r', 'kanban\n  S["x\n y"]\n'],
    [
      "kanban: ls-is-value",
      "kanban\n S[x\u2028y]\n",
      "kanban\n  S[x\u2028y]\n",
    ],
    [
      "kanban: ps-is-value",
      'kanban\n S["x\u2029y"]\n',
      'kanban\n  S["x\u2029y"]\n',
    ],
    [
      "kanban: comment-ls-split-count",
      "kanban\n S[x]%% c\u2028   A\n",
      "kanban\n  S[x]%% c\u2028   A\n",
    ],
    [
      "kanban: comment-line-ls-taken",
      "kanban\n S[x]\n%%\n%%\u2028   A\n",
      "kanban\n  S[x]\n%%\n%%\u2028   A\n",
    ],
    [
      "kanban: indent-whitespace-kind",
      "kanban\n\u00a0\ufeffS\n\t\u3000\u000b\fA\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: whitespace-values",
      "kanban\n S\n   A\u00a0B[x\ufeff\t\u3000y]\n",
      "kanban\n  S\n    A\u00a0B[x\ufeff\t\u3000y]\n",
    ],
    [
      "kanban: closed-whitespace-trim",
      "kanban\n S[x]\u00a0\ufeff\t\n",
      "kanban\n  S[x]\n",
    ],
    [
      "kanban: nel-is-text",
      "kanban\n S\n   A\u0085B\n",
      "kanban\n  S\n    A\u0085B\n",
    ],
    [
      "kanban: ls-indent-one-space",
      "kanban\n S\n\u2028  A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: ps-icon-value",
      "kanban\n S\n   A\n ::icon(x\u2029y)\n",
      "kanban\n  S\n    A\n    ::icon(x\u2029y)\n",
    ],
    ["kanban: header-tab-inline", "kanban\tS[x]\n", "kanban\n  S[x]\n"],
    ["kanban: leading-bom", "\ufeffkanban\n S\n", "\ufeffkanban\n  S\n"],
    [
      "kanban: multiline-data-crlf",
      "kanban\r\n S\r\n   A@{\r\n ticket: X\r\n}\r\n",
      "kanban\n  S\n    A@{\n ticket: X\n}\n",
    ],
    [
      "kanban: multiline-data-cr",
      "kanban\r S\r   A@{\r ticket: X\r}\r",
      "kanban\n  S\n    A@{\n ticket: X\n}\n",
    ],
    [
      "kanban: class-separator-empty-tail",
      "kanban\n S\n :::c\u2028\n",
      "kanban\n  S\n  :::c\n",
    ],
    [
      "kanban: ls-bare-value",
      "kanban\n S\n   A\u2028B\n",
      "kanban\n  S\n    A\u2028B\n",
    ],
    [
      "kanban: ls-data-value",
      'kanban\n S\n   A@{label: "x\u2028y"}\n',
      'kanban\n  S\n    A@{label: "x\u2028y"}\n',
    ],
    [
      "kanban: line-rule-ls-segment",
      'kanban\n S["style:#x\u2028;y"]\n',
      'kanban\n  S["style:#x\u2028;y"]\n',
    ],
    ["kanban: header-nbsp-count", "kanban\u00a0S[x]\n", "kanban\n  S[x]\n"],
    ["kanban: header-bom-count", "kanban\ufeffS[x]\n", "kanban\n  S[x]\n"],
    [
      "kanban: ps-indent-count",
      "kanban\n S\n\u2029  A\n",
      "kanban\n  S\n    A\n",
    ],
    ["kanban: header-tab-trailing", "kanban\t\n S\n", "kanban\n  S\n"],
    [
      "kanban: div-between-real-comments-ls-node",
      "kanban\n S[x]%% c\n%%{ }%%\u2028   A\n",
      "kanban\n  S[x]%% c\n%%{ }%%\u2028   A\n",
    ],
    [
      "kanban: div-between-real-comments-ps-node",
      "kanban\n S[x]%% c\n%%{ }%%\u2029   A\n",
      "kanban\n  S[x]%% c\n%%{ }%%\u2029   A\n",
    ],
    [
      "kanban: div-header-comment-ls-node",
      "kanban %% c\u2028 S\n",
      "kanban %% c\u2028 S\n",
    ],
    [
      "kanban: div-header-comment-ps-node",
      "kanban %% c\u2029 S\n",
      "kanban %% c\u2029 S\n",
    ],
    ["kanban: header-bom-trailing", "kanban\ufeff\n S\n", "kanban\n  S\n"],
    ["kanban: header-crlf-trailing", "kanban\r\n\n S\n", "kanban\n  S\n"],
    ["kanban: header-ff-trailing", "kanban\f\n S\n", "kanban\n  S\n"],
    [
      "kanban: header-ideographic-trailing",
      "kanban\u3000\n S\n",
      "kanban\n  S\n",
    ],
    ["kanban: header-ls-trailing", "kanban\u2028\n S\n", "kanban\n  S\n"],
    ["kanban: header-nbsp-trailing", "kanban\u00a0\n S\n", "kanban\n  S\n"],
    ["kanban: header-ps-trailing", "kanban\u2029\n S\n", "kanban\n  S\n"],
    ["kanban: header-vt-trailing", "kanban\u000b\n S\n", "kanban\n  S\n"],
    [
      "kanban: lex-tab-whitespace-first",
      "kanban\n\t\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: lex-bom-whitespace-first",
      "kanban\n\ufeff\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: lex-cr-whitespace-first",
      "kanban\n\r\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: lex-crlf-whitespace-first",
      "kanban\n\r\n\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: lex-ideographic-whitespace-first",
      "kanban\n\u3000\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: lex-ls-whitespace-first",
      "kanban\n\u2028\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: lex-nbsp-whitespace-first",
      "kanban\n\u00a0\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: lex-ps-whitespace-first",
      "kanban\n\u2029\n S\n   A\n",
      "kanban\n  S\n    A\n",
    ],
    [
      "kanban: closing-delimiter-whitespace-kept",
      "---  \ntitle:   x\n---\t \nkanban\n S\n",
      "---  \ntitle: x\n---\t \nkanban\n  S\n",
    ],
    [
      "kanban: crlf-in-multiline-values",
      'kanban\r\n S\r\n   A["x\r\ny"]\r\n ::icon(a\r\nb)\r\n%%{init:\r\n{}}%%\r\n',
      'kanban\n  S\n    A["x\ny"]\n    ::icon(a\nb)\n    %%{init:\n{}}%%\n',
    ],
    [
      "kanban: lex-icon-comment-ls",
      "kanban\n S\n ::icon(x)%% c\u2028   A\n",
      "kanban\n  S\n  ::icon(x)%% c\u2028   A\n",
    ],
    [
      "kanban: db-metadata-comment-ls",
      "kanban\n S@{}%% c\u2028   A\n",
      "kanban\n  S@{}%% c\u2028   A\n",
    ],
    [
      "kanban: shape-comment-ps",
      "kanban\n S[x]%% c\u2029   A\n",
      "kanban\n  S[x]%% c\u2029   A\n",
    ],
    [
      "kanban: common-comment-ps-swallows-suffix",
      "kanban\n S\n%% c\u2029   A\n",
      "kanban\n  S\n  %% c\u2029   A\n",
    ],
    [
      "kanban: unicode-inline-directive-indentation",
      "kanban\n S\n\u00a0%%{init: {}}%%\t\u3000A\n",
      "kanban\n  S\n  %%{init: {}}%%  A\n",
    ],
    [
      "kanban: directive-before-unicode-comment",
      "kanban\n S[x]%%{init: {}}%%%% c\u2028   A\n",
      "kanban\n  S[x]%%{init: {}}%%%% c\u2028   A\n",
    ],
    [
      "kanban: directive-after-unicode-comment",
      "kanban\n S[x]%% c\u2029 %%{init: {}}%%  A\n",
      "kanban\n  S[x]%% c\u2029 %%{init: {}}%%  A\n",
    ],
    [
      "kanban: comment-ls-then-item-on-semicolon-line",
      "kanban\n S[x]%% c;\u2028 T\n",
      "kanban\n  S[x]%% c;\u2028   T\n",
    ],
    [
      "kanban: comment-ps-then-section-on-semicolon-line",
      "kanban\n S[x]%% c; \u2029T;x\n   A;b\n",
      "kanban\n  S[x]%% c; \u2029 T;x\n    A;b\n",
    ],
    [
      "kanban: semicolon-in-a-comment-with-text-after-it",
      "kanban\n S\n   A[x]%% c;\u2028    B\n",
      "kanban\n  S\n    A[x]%% c;\u2028   B\n",
    ],
    [
      "kanban: semicolon-line-comment-ps-then-directive-line",
      "kanban\n S[x]%% c;\u2029 %%{init: {}}%%  T\n",
      "kanban\n  S[x]%% c;\u2029 %%{init: {}}%%  T\n",
    ],
    [
      "kanban: semicolon-line-comment-ls-then-empty-line",
      "kanban\n S[x]%% c;\u2028\n\n T\n",
      "kanban\n  S[x]%% c;\u2028\n\n  T\n",
    ],
    [
      "kanban: semicolon-line-two-comments-then-item",
      "kanban\n S[x]%% a;\u2028%% b\u2028 T\n",
      "kanban\n  S[x]%% a;\u2028%% b\u2028 T\n",
    ],
    [
      "kanban: semicolon-line-comment-ls-then-semicolon-node",
      "kanban\n S[x]%% c;\u2028 T;x\n   A\n",
      "kanban\n  S[x]%% c;\u2028   T;x\n    A\n",
    ],
    [
      "kanban: semicolon-line-empty-data-then-comment-ls",
      "kanban\n S@{}%% c;\u2028 T\n",
      "kanban\n  S@{}%% c;\u2028   T\n",
    ],
    [
      "kanban: semicolon-line-icon-comment-ls-then-item",
      "kanban\n S\n   A\n ::icon(a;b)%% c\u2028 T\n",
      "kanban\n  S\n    A\n    ::icon(a;b)%% c\u2028   T\n",
    ],
    [
      "kanban: semicolon-line-comment-ls-between-items",
      "kanban\n S\n   A[x]%% c;\u2028   B\n   C\n",
      "kanban\n  S\n    A[x]%% c;\u2028   B\n    C\n",
    ],
    [
      "kanban: semicolon-line-crlf-trailing-whitespace",
      "kanban\r\n S\r\n  A[x;y]   \r\n",
      "kanban\n  S\n    A[x;y]\n",
    ],
    [
      "kanban: selected-ls-column-short",
      "kanban\n R[root]%% style:#fill;\u2028C;y\n   D\n",
      "kanban\n  R[root]%% style:#fill;\u2028 C;y\n    D\n",
    ],
    [
      "kanban: selected-ps-column-wide",
      "kanban\n     R[x]%% classDef:#fill;\u2029    C;y\n       D\n",
      "kanban\n  R[x]%% classDef:#fill;\u2029 C;y\n    D\n",
    ],
    [
      "kanban: selected-ls-card-short",
      "kanban\nR[x]%% style:#fill;\u2028C\n D;y\n",
      "kanban\n  R[x]%% style:#fill;\u2028   C\n    D;y\n",
    ],
    [
      "kanban: selected-ps-card-wide",
      "kanban\n R\n     A[x]%% style:#fill;\u2029        C;y\n   D\n",
      "kanban\n  R\n    A[x]%% style:#fill;\u2029   C;y\n    D\n",
    ],
    [
      "kanban: selected-icon-ls-column",
      "kanban\n R\n       ::icon(i)%% style:#fill;\u2028C;y\n   D\n",
      "kanban\n  R\n  ::icon(i)%% style:#fill;\u2028 C;y\n    D\n",
    ],
    [
      "kanban: selected-icon-ps-card",
      "kanban\nR\n::icon(i;j)%% style:#fill;\u2029  C\n D\n",
      "kanban\n  R\n  ::icon(i;j)%% style:#fill;\u2029   C\n    D\n",
    ],
    [
      "kanban: selected-data-ls-column",
      "kanban\n R@{ticket: Q}%% style:#fill;\u2028C;y\n   D\n",
      "kanban\n  R@{ticket: Q}%% style:#fill;\u2028 C;y\n    D\n",
    ],
    [
      "kanban: selected-data-ps-card",
      "kanban\n   R\n      A[x]@{ticket: Q}%% style:#fill;\u2029       C;y\n     D\n",
      "kanban\n  R\n    A[x]@{ticket: Q}%% style:#fill;\u2029   C;y\n    D\n",
    ],
    [
      "kanban: after-shape-ls-column",
      "kanban\n   R[x]%% c\u2028  C;y\n     D\n",
      "kanban\n  R[x]%% c\u2028 C;y\n    D\n",
    ],
    [
      "kanban: after-icon-ps-card",
      "kanban\nR\n ::icon(i)%% c\u2029 C;y\n D\n",
      "kanban\n  R\n  ::icon(i)%% c\u2029   C;y\n    D\n",
    ],
    [
      "kanban: after-data-ls-card",
      "kanban\n R@{}%% c\u2028       C;y\n   D\n",
      "kanban\n  R@{}%% c\u2028   C;y\n    D\n",
    ],
    [
      "kanban: before-shape-ps-column",
      "kanban\n     R[x;y]%% c\u2029    C\n       D\n",
      "kanban\n  R[x;y]%% c\u2029 C\n    D\n",
    ],
    [
      "kanban: before-data-ls-column",
      "kanban\n R@{ticket: Q}%% style:#fill;\u2028C\n   D\n",
      "kanban\n  R@{ticket: Q}%% style:#fill;\u2028 C\n    D\n",
    ],
    [
      "kanban: both-data-ps-column",
      "kanban\n R@{ticket: 'Q;R'}%% c;\u2029C;y\n   D\n",
      "kanban\n  R@{ticket: 'Q;R'}%% c;\u2029 C;y\n    D\n",
    ],
    [
      "kanban: selected-column-zero",
      "kanban\n   R[x]%% style:#fill;\u2028  C;y\n     D\n",
      "kanban\n R[x]%% style:#fill;\u2028C;y\n  D\n",
      { tabWidth: 0 },
    ],
    [
      "kanban: selected-card-tabs",
      "kanban\nR[x]%% style:#fill;\u2029    C;y\n D\n",
      "kanban\n\tR[x]%% style:#fill;\u2029\tC;y\n\t\tD\n",
      { useTabs: true },
    ],
    [
      "kanban: selected-column-directive",
      "kanban\n     R[x]%% style:#fill;\u2029%%{init: {}}%%    C;y\n       D\n",
      "kanban\n  R[x]%% style:#fill;\u2029%%{init: {}}%% C;y\n    D\n",
    ],
    [
      "kanban: selected-before-blank-line",
      "kanban\n R[x]%% style:#fill;\u2028\n\n   C;y\n",
      "kanban\n  R[x]%% style:#fill;\u2028\n\n    C;y\n",
    ],
    [
      "kanban: selected-terminal-separator",
      "kanban\n R[x]%% style:#fill;\u2029",
      "kanban\n  R[x]%% style:#fill;\u2029\n",
    ],
    [
      "kanban: comment-line-then-directive-item",
      "kanban\nS[x]%% c\u2028%% d\n%%{x}%% C\n  D\n",
      "kanban\n  S[x]%% c\u2028%% d\n  %%{x}%% C\n    D\n",
    ],
    [
      "kanban: comment-line-then-indented-directive-item",
      "kanban\nS[x]%% c\u2028%% d\n  %%{x}%% C\n  D\n",
      "kanban\n  S[x]%% c\u2028%% d\n  %%{x}%% C\n    D\n",
    ],
    [
      "kanban: directive-and-comment-line-then-item",
      "kanban\nS[x]%% c\u2028%%{init: {}}%% %% d\n  C\n  D\n",
      "kanban\n  S[x]%% c\u2028%%{init: {}}%% %% d\n   C\n    D\n",
    ],
    [
      "kanban: directive-comment-line-directive-item",
      "kanban\nS[x]%% c\u2028%%{a}%% %% d\n%%{x}%% C\n  D\n",
      "kanban\n  S[x]%% c\u2028%%{a}%% %% d\n  %%{x}%% C\n    D\n",
    ],
    [
      "kanban: selected-comment-line-then-directive-item",
      "kanban\nS[x]%% style:#x;\u2028%% d\n%%{x}%% C\n  D\n",
      "kanban\n  S[x]%% style:#x;\u2028%% d\n  %%{x}%% C\n    D\n",
    ],
    [
      "kanban: comment-line-then-directive-section",
      "kanban\n  S[x]%% c\u2028%% d\n%%{x}%% C\n",
      "kanban\n  S[x]%% c\u2028%% d\n%%{x}%% C\n",
    ],
    [
      "kanban: comment-line-then-directive-section-tabs",
      "kanban\n  S[x]%% c\u2028%% d\n%%{x}%% C\n",
      "kanban\n\tS[x]%% c\u2028%% d\n%%{x}%%C\n",
      { useTabs: true },
    ],
    [
      "kanban: comment-line-then-directive-section-zero",
      "kanban\n  S[x]%% c\u2028%% d\n%%{x}%% C\n",
      "kanban\n S[x]%% c\u2028%% d\n%%{x}%%C\n",
      { tabWidth: 0 },
    ],
  ]

describe("kanban whitespace and line boundaries", () => {
  it.each(
    kanbanExamples.map(([title, input, expected, options]) => ({
      title,
      input,
      expected,
      options,
    })),
  )("$title", async ({ input, expected, options }) => {
    const output = await format(input, options)
    expect(output).toBe(expected)
    expect(await format(output, options)).toBe(output)
    expect(dbOfText(output, defaultEmbedded())).toEqual(
      dbOfText(input, defaultEmbedded()),
    )
    expect(writtenEmbeddedTexts(output)).toEqual(writtenEmbeddedTexts(input))
    expect(await describeFrontmatterChange(input, output, options)).toBeNull()
  })
})

/** C4 lexical whitespace can be a bare prefix or a value character. */
const c4Examples: readonly (readonly [string, string, string])[] = [
  [
    "c4: exterior-whitespace-kinds",
    'C4Context\n\t\u00a0\ufeff\u000b\u000c\u3000Person(a,"A")\n',
    'C4Context\n  Person(a, "A")\n',
  ],
  [
    "c4: file-leading-bom",
    '\ufeffC4Context\nPerson(a,"A")',
    '\ufeffC4Context\n  Person(a, "A")\n',
  ],
  [
    "c4: internal-whitespace-kinds",
    'C4Context\nPerson(a,"A\t\u00a0\ufeff\u000b\u000c\u3000B")',
    'C4Context\n  Person(a, "A\t\u00a0\ufeff\u000b\u000c\u3000B")\n',
  ],
  [
    "c4: tab-before-quote",
    'C4Context\nPerson(a,\t"A", "D")',
    'C4Context\n  Person(a,\t"A", "D")\n',
  ],
  [
    "c4: nbsp-before-quote",
    'C4Context\nPerson(a,\u00a0"A", "D")',
    'C4Context\n  Person(a,\u00a0"A", "D")\n',
  ],
  [
    "c4: bom-before-quote",
    'C4Context\nPerson(a, \ufeff"A", "D")',
    'C4Context\n  Person(a, \ufeff"A", "D")\n',
  ],
  [
    "c4: bare-dollar-prefix",
    'C4Context\nPerson(a, \t$descr="D", "X")',
    'C4Context\n  Person(a, \t$descr="D", "X")\n',
  ],
  [
    "c4: nbsp-dollar-prefix",
    'C4Context\nPerson(a,\u00a0$descr="D", "X")',
    'C4Context\n  Person(a,\u00a0$descr="D", "X")\n',
  ],
  [
    "c4: bom-dollar-prefix",
    'C4Context\nPerson(a, \ufeff$descr="D", "X")',
    'C4Context\n  Person(a, \ufeff$descr="D", "X")\n',
  ],
  [
    "c4: other-bare-prefix-kinds",
    'C4Context\nPerson(a,\u000b\u000c\u3000"A", "D")',
    'C4Context\n  Person(a,\u000b\u000c\u3000"A", "D")\n',
  ],
  [
    "c4: harmless-bare-exterior",
    "C4Context\nPerson(\t a\t,\u00a0A\ufeff,)",
    "C4Context\n  Person(a, A,)\n",
  ],
  [
    "c4: null-tab-unit",
    'C4Context\nPerson("a"\t,"A")',
    'C4Context\n  Person("a"\t, "A")\n',
  ],
  [
    "c4: internal-key-whitespace",
    'C4Context\nPerson(a,"A",$ first\u00a0second = "D")',
    'C4Context\n  Person(a, "A", $first\u00a0second="D")\n',
  ],
  [
    "c4: nel-is-value-text",
    'C4Context\nPerson(a,"A\u0085B")',
    'C4Context\n  Person(a, "A\u0085B")\n',
  ],
  [
    "c4: title-tab-separator",
    'C4Context\ntitle\t  T   \nPerson(a,"A")',
    'C4Context\n  title   T   \n  Person(a, "A")\n',
  ],
  [
    "c4: accdescription-tab-separator",
    'C4Context\naccDescription\t  D   \nPerson(a,"A")',
    'C4Context\n  accDescription   D   \n  Person(a, "A")\n',
  ],
  [
    "c4: ls-bare-value",
    "C4Context\nPerson(a,one\u2028two,)",
    "C4Context\n  Person(a, one\u2028two,)\n",
  ],
  [
    "c4: ps-quoted-value",
    'C4Context\nPerson(a,"one\u2029two")',
    'C4Context\n  Person(a, "one\u2029two")\n',
  ],
  [
    "c4: ls-argument-prefix",
    'C4Context\nPerson(a,\u2028"A", "D")',
    'C4Context\n  Person(a,\u2028"A", "D")\n',
  ],
  [
    "c4: ps-title-separator",
    'C4Context\ntitle\u2029T\nPerson(a,"A")',
    'C4Context\n  title\u2029T\n  Person(a, "A")\n',
  ],
  [
    "c4: ls-title-value",
    'C4Context\ntitle A\u2028B\nPerson(a,"A")',
    'C4Context\n  title A\u2028B\n  Person(a, "A")\n',
  ],
  [
    "c4: ps-colon-gap",
    'C4Context\naccTitle:\u2029T\nPerson(a,"A")',
    'C4Context\n  accTitle:\u2029T\n  Person(a, "A")\n',
  ],
  [
    "c4: ls-comment-boundary",
    'C4Context\nPerson(a,"A") %% left\u2028right\nPerson(b,"B")',
    'C4Context\n  Person(a, "A") %% left\u2028right\n  Person(b, "B")\n',
  ],
  [
    "c4: ps-common-comment-in-value",
    'C4Context\nPerson(a,"first\u2029%% note\nlast")',
    'C4Context\n  Person(a,"first\u2029%% note\nlast")\n',
  ],
  [
    "c4: ls-directive-terminator",
    'C4Context\nPerson(a,"first%%{init: {}}%%\u2028last")',
    'C4Context\n  Person(a,"first%%{init: {}}%%\u2028last")\n',
  ],
  [
    "c4: ps-open-directive-terminator",
    'C4Context\nPerson(a,"first%%{wrap\u2029last")',
    'C4Context\n  Person(a,"first%%{wrap\u2029last")\n',
  ],
  [
    "c4: ls-line-rule-segments",
    'C4Context\nPerson(a,"style:#x;\u2028end;")',
    'C4Context\n  Person(a,"style:#x;\u2028end;")\n',
  ],
  [
    "c4: ps-line-rule-segments",
    'C4Context\nPerson(a,"classDef:#x;\u2029end;")',
    'C4Context\n  Person(a,"classDef:#x;\u2029end;")\n',
  ],
  [
    "c4: ls-description-block",
    'C4Context\naccDescr { A\u2028B }Person(a,"A")',
    'C4Context\n  accDescr { A\u2028B }\n  Person(a, "A")\n',
  ],
  [
    "c4: ps-empty-block-gap",
    'C4Context accDescr {\u2029}\naccDescr {}Person(a,"A")',
    'C4Context accDescr {\u2029}\n  accDescr {}Person(a, "A")\n',
  ],
  [
    "c4: cr-bare-and-named-values",
    'C4Context\rPerson(a,one\r  two,$descr="three\r four")\r',
    'C4Context\n  Person(a, one\n  two, $descr="three\n four")\n',
  ],
  [
    "c4: ls-kept-comment-statement",
    'C4Context\nPerson(a, "x") %% c;\u2028 Person(b, "y")\n',
    'C4Context\n  Person(a, "x") %% c;\u2028 Person(b, "y")\n',
  ],
  [
    "c4: ps-kept-comment-statement",
    'C4Context\nPerson(a, "x") %% c;\u2029 Person(b, "y")\n',
    'C4Context\n  Person(a, "x") %% c;\u2029 Person(b, "y")\n',
  ],
  [
    "c4: ls-kept-call-comment-statement",
    'C4Context\nPerson(a, "x;y") %% c\u2028 Person(b, "y")\n',
    'C4Context\n  Person(a, "x;y") %% c\u2028 Person(b, "y")\n',
  ],
  [
    "c4: ps-kept-call-comment-statement",
    'C4Context\nPerson(a, "x;y") %% c\u2029 Person(b, "y")\n',
    'C4Context\n  Person(a, "x;y") %% c\u2029 Person(b, "y")\n',
  ],
  [
    "c4: ls-comment-statement-control",
    'C4Context\nPerson(a, "x") %% c\u2028 Person(b, "y")\n',
    'C4Context\n  Person(a, "x") %% c\u2028 Person(b, "y")\n',
  ],
  [
    "c4: ps-comment-statement-control",
    'C4Context\nPerson(a, "x") %% c\u2029 Person(b, "y")\n',
    'C4Context\n  Person(a, "x") %% c\u2029 Person(b, "y")\n',
  ],
  [
    "c4: ls-kept-comment-whitespace-text",
    'C4Context\nPerson(a, "x;y") %% c\u2028 \t x  \n',
    'C4Context\n  Person(a, "x;y") %% c\u2028 \t x\n',
  ],
  [
    "c4: ps-kept-comment-whitespace-text",
    'C4Context\nPerson(a, "x") %% c;\u2029 \t x  \n',
    'C4Context\n  Person(a, "x") %% c;\u2029 \t x\n',
  ],
  [
    "c4: ls-kept-comment-final-character",
    'C4Context\nPerson(a, "x;y") %% c\u2028\n',
    'C4Context\n  Person(a, "x;y") %% c\u2028\n',
  ],
  [
    "c4: ps-kept-comment-final-character",
    'C4Context\nPerson(a, "x") %% c;\u2029\n',
    'C4Context\n  Person(a, "x") %% c;\u2029\n',
  ],
  [
    "c4: ls-kept-call-comment-eof",
    'C4Context\nPerson(a, "x;y") %% c\u2028 x',
    'C4Context\n  Person(a, "x;y") %% c\u2028 x\n',
  ],
  [
    "c4: ps-kept-call-comment-eof",
    'C4Context\nPerson(a, "x;y") %% c\u2029 x',
    'C4Context\n  Person(a, "x;y") %% c\u2029 x\n',
  ],
  [
    "c4: ls-kept-comment-eof",
    'C4Context\nPerson(a, "x") %% c;\u2028',
    'C4Context\n  Person(a, "x") %% c;\u2028\n',
  ],
  [
    "c4: ps-kept-comment-eof",
    'C4Context\nPerson(a, "x") %% c;\u2029',
    'C4Context\n  Person(a, "x") %% c;\u2029\n',
  ],
  [
    "c4: ls-comment-header-control",
    'C4Context %% c\u2028 x\n \nPerson(a, "A")\n',
    'C4Context %% c\u2028 x\n \n  Person(a, "A")\n',
  ],
  [
    "c4: ps-comment-header-control",
    'C4Context %% c\u2029 x\n \nPerson(a, "A")\n',
    'C4Context %% c\u2029 x\n \n  Person(a, "A")\n',
  ],
  [
    "c4: ls-comment-opener-control",
    'C4Context\nSystem_Boundary(s, "S") { %% c\u2028 x\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S") { %% c\u2028 x\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ps-comment-opener-control",
    'C4Context\nSystem_Boundary(s, "S") { %% c\u2029 x\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S") { %% c\u2029 x\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ls-kept-comment-header",
    'C4Context %% c;\u2028 x\n \nPerson(a, "A")\n',
    'C4Context %% c;\u2028 x\n \n  Person(a, "A")\n',
  ],
  [
    "c4: ps-kept-comment-header",
    'C4Context %% c;\u2029 x\n \nPerson(a, "A")\n',
    'C4Context %% c;\u2029 x\n \n  Person(a, "A")\n',
  ],
  [
    "c4: ls-kept-comment-header-suffix-semicolon",
    'C4Context %% c\u2028 x;\n \nPerson(a, "A")\n',
    'C4Context %% c\u2028 x;\n \n  Person(a, "A")\n',
  ],
  [
    "c4: ps-kept-comment-header-suffix-semicolon",
    'C4Context %% c\u2029 x;\n \nPerson(a, "A")\n',
    'C4Context %% c\u2029 x;\n \n  Person(a, "A")\n',
  ],
  [
    "c4: ls-kept-comment-opener",
    'C4Context\nSystem_Boundary(s, "S") { %% c;\u2028 x\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S") { %% c;\u2028 x\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ps-kept-comment-opener",
    'C4Context\nSystem_Boundary(s, "S") { %% c;\u2029 x\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S") { %% c;\u2029 x\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ls-kept-call-comment-opener",
    'C4Context\nSystem_Boundary(s, "S;") { %% c\u2028 x\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S;") { %% c\u2028 x\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ps-kept-call-comment-opener",
    'C4Context\nSystem_Boundary(s, "S;") { %% c\u2029 x\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S;") { %% c\u2029 x\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ls-kept-comment-opener-suffix-semicolon",
    'C4Context\nSystem_Boundary(s, "S") { %% c\u2028 x;\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S") { %% c\u2028 x;\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ps-kept-comment-opener-suffix-semicolon",
    'C4Context\nSystem_Boundary(s, "S") { %% c\u2029 x;\n \nPerson(a, "A")\n}\n',
    'C4Context\n  System_Boundary(s, "S") { %% c\u2029 x;\n \n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ls-kept-directive",
    'C4Context\nPerson(a, "x;y") %%{init:\u2028 {}}%%\n',
    'C4Context\n  Person(a, "x;y") %%{init:\u2028 {}}%%\n',
  ],
  [
    "c4: ps-kept-directive",
    'C4Context\nPerson(a, "x;y") %%{init:\u2029 {}}%%\n',
    'C4Context\n  Person(a, "x;y") %%{init:\u2029 {}}%%\n',
  ],
  [
    "c4: ls-kept-boundary-brace-gap",
    'C4Context\nSystem_Boundary(b, "x;")\n\u2028      {\nPerson(a,"A")\n}\n',
    'C4Context\n  System_Boundary(b, "x;")\n\u2028      {\n    Person(a, "A")\n  }\n',
  ],
  [
    "c4: ps-kept-boundary-brace-gap",
    'C4Context\nSystem_Boundary(b, "x;")\n\u2029      {\nPerson(a,"A")\n}\n',
    'C4Context\n  System_Boundary(b, "x;")\n\u2029      {\n    Person(a, "A")\n  }\n',
  ],
]

describe("C4 whitespace and line boundaries", () => {
  it.each(c4Examples)("%s", async (_title, input, expected) => {
    const output = await format(input)
    expect(output).toBe(expected)
    expect(await format(output)).toBe(output)
    expect(dbOfText(output, defaultEmbedded())).toEqual(
      dbOfText(input, defaultEmbedded()),
    )
    expect(writtenEmbeddedTexts(output)).toEqual(writtenEmbeddedTexts(input))
    expect(await describeFrontmatterChange(input, output)).toBeNull()
  })

  it.each([
    'C4Context\nPerson(a,"A")\u2028Person(b,"B")',
    'C4Context\nPerson(a,"A")\u2029Person(b,"B")',
    'C4Context\nPerson(a,"A",$descr=\t"D")',
    'C4Context\nPerson(a,"A")\u0085',
  ])(
    "retains rejection of C4 Unicode and delimiter input %j",
    async (input) => {
      await expect(format(input)).rejects.toBeInstanceOf(SyntaxError)
    },
  )
})

/** Venn separators are characters inside values and whole diagram comments. */
const vennExamples: readonly (readonly [string, string, string])[] = [
  [
    "venn: crlf-values",
    'venn-beta\r\nset "A\r\n B"[L\r\n M]\r\nstyle A fill:rgb(1,\r\n 2,3)\r\n',
    'venn-beta\nset "A\n B"[L\n M]\nstyle A fill:rgb(1,\n 2,3)\n',
  ],
  [
    "venn: cr-values",
    'venn-beta\rset "A\r B"[L\r M]\rstyle A fill:rgb(1,\r 2,3)\r',
    'venn-beta\nset "A\n B"[L\n M]\nstyle A fill:rgb(1,\n 2,3)\n',
  ],
  [
    "venn: ls-values",
    'venn-beta\nset "A\u2028 B"[L\u2028 M]\nstyle A fill:rgb(1,\u2028 2,3)',
    'venn-beta\nset "A\u2028 B"[L\u2028 M]\nstyle A fill:rgb(1,\u2028 2,3)\n',
  ],
  [
    "venn: ps-values",
    'venn-beta\nset "A\u2029 B"[L\u2029 M]\nstyle A fill:rgba(1,\u2029 2,3,.5)',
    'venn-beta\nset "A\u2029 B"[L\u2029 M]\nstyle A fill:rgba(1,\u2029 2,3,.5)\n',
  ],
  [
    "venn: ls-comment-kept",
    "venn-beta\n set A[style:#x;y]%% c;\u2028set B\nset C",
    "venn-beta\nset A[style:#x;y]%% c;\u2028set B\nset C\n",
  ],
  [
    "venn: ps-comment-kept",
    "venn-beta\n set A[style:#x;y]%% c;\u2029set B\nset C",
    "venn-beta\nset A[style:#x;y]%% c;\u2029set B\nset C\n",
  ],
  [
    "venn: ps-comment-eof",
    "venn-beta\nset A[style:#x;y]%% c;\u2029 x",
    "venn-beta\nset A[style:#x;y]%% c;\u2029 x\n",
  ],
  [
    "venn: ls-header-comment",
    "venn-beta %% style:#x;y\u2028set Hidden\nset A",
    "venn-beta %% style:#x;y\u2028set Hidden\nset A\n",
  ],
  [
    "venn: ps-kept-comment-whitespace-line",
    "venn-beta\n set A[style:#x;y]%% c;\u2029   \nset B",
    "venn-beta\nset A[style:#x;y]%% c;\u2029   \nset B\n",
  ],
  [
    "venn: ls-kept-comment-last-character",
    "venn-beta\n set A[style:#x;y]%% c;\u2028x",
    "venn-beta\nset A[style:#x;y]%% c;\u2028x\n",
  ],
  ["venn: nbsp-leading-header", "\u00a0venn-beta\nset A", "venn-beta\nset A\n"],
  [
    "venn: nbsp-value-kept",
    'venn-beta\nset " A\u00a0B "[ L\u00a0M ]\nstyle A fill:rgb(1,\u00a02,3)',
    'venn-beta\nset " A\u00a0B "[ L\u00a0M ]\nstyle A fill:rgb(1,\u00a02,3)\n',
  ],
  ["venn: ff-title-separator", "venn-beta\ntitle\fT", "venn-beta\ntitle T\n"],
  [
    "venn: bom-leading-header",
    "\ufeffvenn-beta\nset A",
    "\ufeffvenn-beta\nset A\n",
  ],
  [
    "venn: vt-value-kept",
    'venn-beta\nset "A\u000bB"[L\fM]',
    'venn-beta\nset "A\u000bB"[L\fM]\n',
  ],
  [
    "venn: nbsp-title-separator",
    "venn-beta\ntitle\u00a0 T",
    "venn-beta\ntitle  T\n",
  ],
  [
    "venn: bom-title-separator",
    "venn-beta\ntitle\ufeffT",
    "venn-beta\ntitle T\n",
  ],
  [
    "venn: ps-header-comment",
    "venn-beta %% style:#x;y\u2029set Hidden\nset A",
    "venn-beta %% style:#x;y\u2029set Hidden\nset A\n",
  ],
  [
    "venn: ls-kept-comment-whitespace-line",
    "venn-beta\n set A[style:#x;y]%% c;\u2028   \nset B",
    "venn-beta\nset A[style:#x;y]%% c;\u2028   \nset B\n",
  ],
  [
    "venn: ps-kept-comment-last-character",
    "venn-beta\n set A[style:#x;y]%% c;\u2029x",
    "venn-beta\nset A[style:#x;y]%% c;\u2029x\n",
  ],
  [
    "venn: ls-kept-directive",
    "venn-beta\nset A[style:#x;y] %%{init:\u2028 {}}%%",
    "venn-beta\nset A[style:#x;y] %%{init:\u2028 {}}%%\n",
  ],
  [
    "venn: ps-kept-directive",
    "venn-beta\nset A[style:#x;y] %%{init:\u2029 {}}%%",
    "venn-beta\nset A[style:#x;y] %%{init:\u2029 {}}%%\n",
  ],
  [
    "venn: unicode-role-whitespace",
    '\u3000venn-beta\nset "A\ufeffB"[L\u3000M]\ntext A "x\u2028y"\nstyle A fill:"a\u2029b"',
    'venn-beta\nset "A\ufeffB"[L\u3000M]\ntext A "x\u2028y"\nstyle A fill:"a\u2029b"\n',
  ],
  [
    "venn: ls-kept-overlapping-value",
    "venn-beta\n set A[style:#x;\u2028rest] : 2",
    "venn-beta\nset A[style:#x;\u2028rest]:2\n",
  ],
  [
    "venn: ps-kept-overlapping-value",
    "venn-beta\n set A[style:#x;\u2029rest] : 2",
    "venn-beta\nset A[style:#x;\u2029rest]:2\n",
  ],
  [
    "venn: bom-frontmatter",
    "\ufeff---\ntitle:   T\n---\nvenn-beta\nset A",
    "\ufeff---\ntitle: T\n---\nvenn-beta\nset A\n",
  ],
  [
    "venn: ls-comment-competing-semicolon",
    "venn-beta\nset A[style:#x;y]%% c\u2028tail;",
    "venn-beta\nset A[style:#x;y]%% c\u2028tail;\n",
  ],
  [
    "venn: ps-comment-competing-semicolon",
    "venn-beta\nset A[style:#x;y]%% c\u2029tail;",
    "venn-beta\nset A[style:#x;y]%% c\u2029tail;\n",
  ],
]

describe("Venn whitespace and line boundaries", () => {
  it.each(vennExamples)("%s", async (_title, input, expected) => {
    const output = await format(input)
    expect(output).toBe(expected)
    expect(await format(output)).toBe(output)
    const original = input.startsWith("\uFEFF") ? input.slice(1) : input
    const formatted = output.startsWith("\uFEFF") ? output.slice(1) : output
    expect(dbOfText(formatted, defaultEmbedded())).toEqual(
      dbOfText(original, defaultEmbedded()),
    )
    expect(writtenEmbeddedTexts(formatted)).toEqual(
      writtenEmbeddedTexts(original),
    )
    expect(await describeFrontmatterChange(original, formatted)).toBeNull()
  })
})
