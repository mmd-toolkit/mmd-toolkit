/**
 * The title and the `accTitle:`, `accDescr:`, and `accDescription` lines of the
 * diagram types that have them, with a directive, a comment, or a whitespace
 * character that is no space or tab at their ends: what each group of diagram
 * types prints, in the rows of the tables of docs/compatibility.md, Texts after
 * a keyword that are drawn the same. The characters are written as escapes, and
 * no file holds them: an editor offers to remove them each time it opens such a
 * file.
 */
import { describe, expect, it } from "vitest"
import { dbForFormattingComparison } from "./db-comparison.ts"
import { dbOfText, defaultEmbedded } from "./db-reading.ts"
import { formatMermaid } from "./helpers.ts"

/** Formats the input, as the output states, again to the same, with the Db kept. */
async function expectKept(input: string, output: string): Promise<void> {
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

/**
 * The title of a diagram that mermaid.js reads with a Jison grammar loses the
 * spaces and tabs at its ends and keeps any other whitespace character
 * (docs/compatibility.md, Texts after a keyword that are drawn the same).
 */
const titleEndsExamples: readonly (readonly [string, string, string])[] = [
  [
    "a no-break space and U+3000 at both ends of the title of a gantt diagram",
    "gantt\ntitle \u00a0\u3000T\u3000\u00a0\n",
    "gantt\n  title \u00a0\u3000T\u3000\u00a0\n",
  ],
  [
    "a no-break space and U+3000 at both ends of the title of a user journey diagram",
    "journey\ntitle \u00a0\u3000T\u3000\u00a0\n",
    "journey\n  title \u00a0\u3000T\u3000\u00a0\n",
  ],
  [
    "a no-break space and U+3000 at both ends of the title of a timeline diagram",
    "timeline\ntitle \u00a0\u3000T\u3000\u00a0\n",
    "timeline\n  title \u00a0\u3000T\u3000\u00a0\n",
  ],
  [
    "a no-break space and U+3000 at both ends of the title of a sequence diagram",
    "sequenceDiagram\ntitle \u00a0\u3000T\u3000\u00a0\nA->>B: x\n",
    "sequenceDiagram\n  title \u00a0\u3000T\u3000\u00a0\n  A ->> B: x\n",
  ],
  [
    "a no-break space and U+3000 at both ends of the title of a Venn diagram",
    "venn-beta\ntitle \u00a0\u3000T\u3000\u00a0\nset A\n",
    "venn-beta\n  title \u00a0\u3000T\u3000\u00a0\n  set A\n",
  ],
  [
    "a no-break space and U+3000 at both ends of the title of a C4 diagram",
    'C4Context\ntitle \u00a0\u3000T\u3000\u00a0\nPerson(a,"A")\n',
    'C4Context\n  title \u00a0\u3000T\u3000\u00a0\n  Person(a, "A")\n',
  ],
]

describe("the title of a diagram with a whitespace character that is no space or tab at its ends", () => {
  it.each(titleEndsExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

/**
 * The title of a diagram that mermaid.js reads with a Langium grammar loses
 * every whitespace character at its ends
 * (docs/compatibility.md, Texts after a keyword that are drawn the same).
 */
const titleEndsDroppedExamples: readonly (readonly [string, string, string])[] =
  [
    [
      "a no-break space and U+3000 at both ends of the title of a pie chart",
      'pie\ntitle \u00a0\u3000T\u3000\u00a0\n"a": 1\n',
      'pie\n  title T\n  "a": 1\n',
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a radar chart",
      "radar-beta\ntitle \u00a0\u3000T\u3000\u00a0\naxis a, b\ncurve c{1, 2}\n",
      "radar-beta\n  title T\n  axis a, b\n  curve c{1, 2}\n",
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a packet diagram",
      'packet-beta\ntitle \u00a0\u3000T\u3000\u00a0\n0-7: "x"\n',
      'packet-beta\n  title T\n  0-7: "x"\n',
    ],
    [
      "a no-break space and U+3000 at both ends of the title of an architecture diagram",
      "architecture-beta\ntitle \u00a0\u3000T\u3000\u00a0\nservice a(server)[A]\n",
      "architecture-beta\n  title T\n  service a(server)[A]\n",
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a gitGraph",
      "gitGraph\ntitle \u00a0\u3000T\u3000\u00a0\ncommit\n",
      "gitGraph\n  title T\n  commit\n",
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a cynefin diagram",
      "cynefin-beta\ntitle \u00a0\u3000T\u3000\u00a0\n",
      "cynefin-beta\n  title T\n",
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a treemap",
      'treemap-beta\ntitle \u00a0\u3000T\u3000\u00a0\n"A": 1\n',
      'treemap\ntitle T\n  "A": 1\n',
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a Wardley map",
      "wardley-beta\ntitle \u00a0\u3000T\u3000\u00a0\ncomponent A [0.5, 0.5]\n",
      "wardley-beta\n  title T\n  component A [0.5, 0.5]\n",
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a treeView",
      "treeView-beta\ntitle \u00a0\u3000T\u3000\u00a0\nroot\n",
      "treeView-beta\n  title T\n  root\n",
    ],
    [
      "a no-break space and U+3000 at both ends of the title of an info diagram",
      "info\ntitle \u00a0\u3000T\u3000\u00a0\n",
      "info\n  title T\n",
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a railroad diagram",
      'railroad-abnf-beta\ntitle \u00a0\u3000T\u3000\u00a0\nr="a";\n',
      'railroad-abnf-beta\n  title T\n  r = "a";\n',
    ],
    [
      "a no-break space and U+3000 at both ends of the title of a quadrant chart",
      "quadrantChart\ntitle \u00a0\u3000T\u3000\u00a0\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
      "quadrantChart\n  title T\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    ],
  ]

/**
 * The text of a statement that mermaid.js reads with a Jison grammar keeps a
 * no-break space at its end (docs/compatibility.md, Texts after a keyword that
 * are drawn the same).
 */
const textEndsExamples: readonly (readonly [string, string, string])[] = [
  [
    "a no-break space at the end of the date format of a gantt diagram",
    "gantt\ndateFormat YYYY-MM-DD\u00a0\nsection S\nTask :a1, 2024-01-01, 1d\n",
    "gantt\n  dateFormat YYYY-MM-DD\u00a0\n  section S\n    Task : a1, 2024-01-01, 1d\n",
  ],
  [
    "a no-break space at the end of the axis format of a gantt diagram",
    "gantt\naxisFormat %Y\u00a0\nsection S\nTask :a1, 2024-01-01, 1d\n",
    "gantt\n  axisFormat %Y\u00a0\n  section S\n    Task : a1, 2024-01-01, 1d\n",
  ],
  [
    "a no-break space at the end of the last event of a line of a timeline",
    "timeline\ntitle T\n2004 : a : b\u00a0\n",
    "timeline\n  title T\n  2004 : a : b\u00a0\n",
  ],
  [
    "a no-break space at the end of the accDescription of a C4 diagram",
    'C4Context\naccDescription D\u00a0\nPerson(a, "A")\n',
    'C4Context\n  accDescription D\u00a0\n  Person(a, "A")\n',
  ],
  [
    "a no-break space at the end of the second description of a state with an alias",
    'stateDiagram-v2\nstate "d" as A : x\u00a0\n',
    'stateDiagram-v2\n  state "d" as A : x\u00a0\n',
  ],
]

describe("the text of a statement with a no-break space at its end, read with a Jison grammar", () => {
  it.each(textEndsExamples)("keeps %s", async (_name, input, output) => {
    await expectKept(input, output)
  })
})

describe("the title of a diagram that is read with a Langium grammar and has a whitespace character that is no space or tab at its ends", () => {
  it.each(titleEndsDroppedExamples)(
    "drops %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

/**
 * The title of each diagram type beside a directive or a comment, by the group
 * of types that print it alike (docs/compatibility.md, Texts after a keyword
 * that are drawn the same): a representative of each group holds every case,
 * and every type holds two cases that tell the groups apart.
 */
const titleTypes: readonly (readonly [string, number, string, string])[] = [
  [
    "a pie chart",
    0,
    'pie\ntitle {title}\n"a": 1\n',
    'pie\n  title {title}\n  "a": 1\n',
  ],
  [
    "a radar chart",
    0,
    "radar-beta\ntitle {title}\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title {title}\n  axis a, b\n  curve c{1, 2}\n",
  ],
  [
    "a packet diagram",
    0,
    'packet-beta\ntitle {title}\n0-7: "x"\n',
    'packet-beta\n  title {title}\n  0-7: "x"\n',
  ],
  [
    "an architecture diagram",
    0,
    "architecture-beta\ntitle {title}\nservice a(server)[A]\n",
    "architecture-beta\n  title {title}\n  service a(server)[A]\n",
  ],
  [
    "a gitGraph",
    0,
    "gitGraph\ntitle {title}\ncommit\n",
    "gitGraph\n  title {title}\n  commit\n",
  ],
  [
    "a cynefin diagram",
    0,
    "cynefin-beta\ntitle {title}\n",
    "cynefin-beta\n  title {title}\n",
  ],
  [
    "a treemap",
    0,
    'treemap-beta\ntitle {title}\n"A": 1\n',
    'treemap\ntitle {title}\n  "A": 1\n',
  ],
  [
    "a Wardley map",
    0,
    "wardley-beta\ntitle {title}\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title {title}\n  component A [0.5, 0.5]\n",
  ],
  [
    "a treeView",
    0,
    "treeView-beta\ntitle {title}\nroot\n",
    "treeView-beta\n  title {title}\n  root\n",
  ],
  ["an info diagram", 0, "info\ntitle {title}\n", "info\n  title {title}\n"],
  [
    "a railroad diagram",
    0,
    'railroad-abnf-beta\ntitle {title}\nr="a";\n',
    'railroad-abnf-beta\n  title {title}\n  r = "a";\n',
  ],
  [
    "a quadrant chart",
    1,
    "quadrantChart\ntitle {title}\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title {title}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  ["a Gantt chart", 2, "gantt\ntitle {title}\n", "gantt\n  title {title}\n"],
  [
    "a user journey",
    2,
    "journey\ntitle {title}\n",
    "journey\n  title {title}\n",
  ],
  ["a timeline", 2, "timeline\ntitle {title}\n", "timeline\n  title {title}\n"],
  [
    "a sequence diagram",
    2,
    "sequenceDiagram\ntitle {title}\nA->>B: x\n",
    "sequenceDiagram\n  title {title}\n  A ->> B: x\n",
  ],
  [
    "a Venn diagram",
    3,
    "venn-beta\ntitle {title}\nset A\n",
    "venn-beta\n  title {title}\n  set A\n",
  ],
  [
    "a C4 diagram",
    3,
    'C4Context\ntitle {title}\nPerson(a,"A")\n',
    'C4Context\n  title {title}\n  Person(a, "A")\n',
  ],
]

const titleDirectiveCases: readonly (readonly [
  string,
  string,
  string | null,
  string | null,
  string | null,
  string | null,
])[] = [
  [
    "runs and spaces around a directive that ends a title",
    "T  %%{x}%%  ",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "a comment and spaces after a directive that ends a title",
    "T  %%{x}%%  %% c  ",
    "T %%{x}%% %% c  ",
    "T  %%{x}%%  %% c",
    "T  %%{x}%%  %% c",
    null,
  ],
  [
    "a no-break space after the last directive of a title",
    "T %%{x}%%\u00a0",
    null,
    "T %%{x}%%",
    null,
    null,
  ],
  [
    "U+3000 after the last directive of a title",
    "T %%{x}%%\u3000",
    null,
    "T %%{x}%%",
    null,
    null,
  ],
  [
    "U+2003 after the last directive of a title",
    "T %%{x}%%\u2003",
    null,
    "T %%{x}%%",
    null,
    null,
  ],
  [
    "a no-break space after a directive that starts a title and before another directive",
    "%%{x}%%\u00a0T %%{y}%%",
    "%%{x}%%T %%{y}%%",
    "%%{x}%%T %%{y}%%",
    null,
    null,
  ],
  [
    "a no-break space after a directive that starts a title and after the last directive",
    "%%{x}%%\u00a0T %%{y}%%\u00a0",
    null,
    "%%{x}%%T %%{y}%%",
    null,
    null,
  ],
  [
    "a no-break space after a directive that starts a title and text after the last directive",
    "%%{x}%%\u00a0T %%{y}%% U",
    null,
    "%%{x}%%T %%{y}%% U",
    null,
    null,
  ],
  [
    "spaces after a directive that starts a title",
    "%%{x}%%  T  ",
    "%%{x}%%T",
    "%%{x}%%T",
    "%%{x}%%T",
    null,
  ],
  [
    "text after a directive and spaces at the end of a title",
    "T %%{x}%% U  ",
    null,
    "T %%{x}%% U",
    "T %%{x}%% U",
    null,
  ],
  [
    "a no-break space after a directive and spaces at the end of a title",
    "T %%{x}%%\u00a0U  ",
    null,
    "T %%{x}%%\u00a0U",
    "T %%{x}%%\u00a0U",
    null,
  ],
  [
    "text between two directives and spaces at the end of a title",
    "T %%{x}%%  U  %%{y}%%  ",
    null,
    "T %%{x}%%  U %%{y}%%",
    "T %%{x}%%  U %%{y}%%",
    null,
  ],
  [
    "a no-break space between the text and a directive that ends a title",
    "T\u00a0%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    null,
    null,
  ],
  [
    "U+3000 between the text and a directive that ends a title",
    "T\u3000%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    null,
    null,
  ],
  [
    "U+2003 between the text and a directive that ends a title",
    "T\u2003%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    null,
    null,
  ],
  [
    "a tab before and after the last directive of a title",
    "T\u0009%%{x}%%\u0009",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "a no-break space before a comment after the text of a title",
    "T\u00a0%% c",
    "T %% c",
    null,
    null,
    null,
  ],
  [
    "runs and spaces around a comment after the text of a title",
    "T  %% c  ",
    "T %% c  ",
    "T %% c",
    "T %% c",
    "T %% c",
  ],
  [
    "a comment and spaces after a directive that follows the text of a title",
    "T %%{x}%% %% c  ",
    null,
    "T %%{x}%% %% c",
    "T %%{x}%% %% c",
    null,
  ],
  [
    "a no-break space before a directive and a comment after the text of a title",
    "T\u00a0%%{x}%%%% c",
    "T %%{x}%%%% c",
    null,
    null,
    null,
  ],
  [
    "a directive and spaces only as a title",
    "%%{x}%%  ",
    null,
    "%%{x}%%",
    null,
    null,
  ],
  [
    "a directive and a tab only as a title",
    "%%{x}%%\t",
    null,
    "%%{x}%%",
    null,
    null,
  ],
  [
    "two directives and spaces only as a title",
    "%%{x}%%  %%{y}%%  ",
    null,
    "%%{x}%% %%{y}%%",
    null,
    null,
  ],
  [
    "two directives after the text of a title and spaces",
    "T  %%{x}%%  %%{y}%%  ",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
  ],
  [
    "two directives after the text of a title",
    "T  %%{x}%%  %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
  ],
  [
    "two directives touching after the text of a title and spaces",
    "T%%{x}%%%%{y}%%  ",
    "T%%{x}%%%%{y}%%",
    "T%%{x}%%%%{y}%%",
    "T%%{x}%%%%{y}%%",
    "T%%{x}%%%%{y}%%",
  ],
  [
    "U+2028 and spaces after the last directive of a title",
    "T %%{x}%%\u2028  ",
    null,
    "T %%{x}%%",
    "T %%{x}%%\u2028",
    null,
  ],
  [
    "U+2029 and spaces after the last directive of a title",
    "T %%{x}%%\u2029  ",
    null,
    "T %%{x}%%",
    "T %%{x}%%\u2029",
    null,
  ],
  [
    "U+2028 between the text and a directive that ends a title",
    "T\u2028%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    null,
    null,
  ],
  ["a comment touching the text of a title", "T%% c", null, null, null, null],
]

const titleOpenDirectiveExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    'pie\ntitle T  %%{x\n"a": 1\n',
    'pie\n  title T %%{x\n"a": 1\n',
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    'pie\ntitle T\u0009%%{x\n"a": 1\n',
    'pie\n  title T %%{x\n"a": 1\n',
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    'pie\ntitle T\u00a0%%{x\n"a": 1\n',
    'pie\n  title T %%{x\n"a": 1\n',
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    'pie\ntitle T\u3000%%{x\n"a": 1\n',
    'pie\n  title T %%{x\n"a": 1\n',
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    'pie\ntitle T\u2003%%{x\n"a": 1\n',
    'pie\n  title T %%{x\n"a": 1\n',
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    'pie\ntitle T  %%{x  y\n"a": 1\n',
    'pie\n  title T  %%{x  y\n"a": 1\n',
  ],
  [
    "a directive that is not closed after a space in a title",
    'pie\ntitle T %%{x\n"a": 1\n',
    'pie\n  title T %%{x\n"a": 1\n',
  ],
  [
    "a directive that is not closed touching the text of a title",
    'pie\ntitle T%%{x\n"a": 1\n',
    'pie\n  title T%%{x\n"a": 1\n',
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "pie\ntitle T  %%{x",
    "pie\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "pie\ntitle T\u0009%%{x",
    "pie\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "pie\ntitle T\u00a0%%{x",
    "pie\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "pie\ntitle T\u3000%%{x",
    "pie\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "pie\ntitle T\u2003%%{x",
    "pie\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "pie\ntitle T  %%{x  y",
    "pie\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "radar-beta\ntitle T  %%{x\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T  %%{x\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "radar-beta\ntitle T\u0009%%{x\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T\u0009%%{x\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "radar-beta\ntitle T\u00a0%%{x\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T\u00a0%%{x\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "radar-beta\ntitle T\u3000%%{x\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T\u3000%%{x\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "radar-beta\ntitle T\u2003%%{x\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T\u2003%%{x\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "radar-beta\ntitle T  %%{x  y\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T  %%{x  y\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "radar-beta\ntitle T %%{x\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T %%{x\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "radar-beta\ntitle T%%{x\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title T%%{x\naxis a, b\n  curve c{1, 2}\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "radar-beta\ntitle T  %%{x",
    "radar-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "radar-beta\ntitle T\u0009%%{x",
    "radar-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "radar-beta\ntitle T\u00a0%%{x",
    "radar-beta\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "radar-beta\ntitle T\u3000%%{x",
    "radar-beta\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "radar-beta\ntitle T\u2003%%{x",
    "radar-beta\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "radar-beta\ntitle T  %%{x  y",
    "radar-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    'packet-beta\ntitle T  %%{x\n0-7: "x"\n',
    'packet-beta\n  title T  %%{x\n0-7: "x"\n',
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    'packet-beta\ntitle T\u0009%%{x\n0-7: "x"\n',
    'packet-beta\n  title T\u0009%%{x\n0-7: "x"\n',
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    'packet-beta\ntitle T\u00a0%%{x\n0-7: "x"\n',
    'packet-beta\n  title T\u00a0%%{x\n0-7: "x"\n',
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    'packet-beta\ntitle T\u3000%%{x\n0-7: "x"\n',
    'packet-beta\n  title T\u3000%%{x\n0-7: "x"\n',
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    'packet-beta\ntitle T\u2003%%{x\n0-7: "x"\n',
    'packet-beta\n  title T\u2003%%{x\n0-7: "x"\n',
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    'packet-beta\ntitle T  %%{x  y\n0-7: "x"\n',
    'packet-beta\n  title T  %%{x  y\n0-7: "x"\n',
  ],
  [
    "a directive that is not closed after a space in a title",
    'packet-beta\ntitle T %%{x\n0-7: "x"\n',
    'packet-beta\n  title T %%{x\n0-7: "x"\n',
  ],
  [
    "a directive that is not closed touching the text of a title",
    'packet-beta\ntitle T%%{x\n0-7: "x"\n',
    'packet-beta\n  title T%%{x\n0-7: "x"\n',
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "packet-beta\ntitle T  %%{x",
    "packet-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "packet-beta\ntitle T\u0009%%{x",
    "packet-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "packet-beta\ntitle T\u00a0%%{x",
    "packet-beta\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "packet-beta\ntitle T\u3000%%{x",
    "packet-beta\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "packet-beta\ntitle T\u2003%%{x",
    "packet-beta\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "packet-beta\ntitle T  %%{x  y",
    "packet-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "architecture-beta\ntitle T  %%{x\nservice a(server)[A]\n",
    "architecture-beta\n  title T  %%{x\nservice a(server)[A]\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "architecture-beta\ntitle T\u0009%%{x\nservice a(server)[A]\n",
    "architecture-beta\n  title T\u0009%%{x\nservice a(server)[A]\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "architecture-beta\ntitle T\u00a0%%{x\nservice a(server)[A]\n",
    "architecture-beta\n  title T\u00a0%%{x\nservice a(server)[A]\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "architecture-beta\ntitle T\u3000%%{x\nservice a(server)[A]\n",
    "architecture-beta\n  title T\u3000%%{x\nservice a(server)[A]\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "architecture-beta\ntitle T\u2003%%{x\nservice a(server)[A]\n",
    "architecture-beta\n  title T\u2003%%{x\nservice a(server)[A]\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "architecture-beta\ntitle T  %%{x  y\nservice a(server)[A]\n",
    "architecture-beta\n  title T  %%{x  y\nservice a(server)[A]\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "architecture-beta\ntitle T %%{x\nservice a(server)[A]\n",
    "architecture-beta\n  title T %%{x\nservice a(server)[A]\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "architecture-beta\ntitle T%%{x\nservice a(server)[A]\n",
    "architecture-beta\n  title T%%{x\nservice a(server)[A]\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "architecture-beta\ntitle T  %%{x",
    "architecture-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "architecture-beta\ntitle T\u0009%%{x",
    "architecture-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "architecture-beta\ntitle T\u00a0%%{x",
    "architecture-beta\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "architecture-beta\ntitle T\u3000%%{x",
    "architecture-beta\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "architecture-beta\ntitle T\u2003%%{x",
    "architecture-beta\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "architecture-beta\ntitle T  %%{x  y",
    "architecture-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "gitGraph\ntitle T  %%{x\ncommit\n",
    "gitGraph\n  title T %%{x\ncommit\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "gitGraph\ntitle T\u0009%%{x\ncommit\n",
    "gitGraph\n  title T %%{x\ncommit\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "gitGraph\ntitle T\u00a0%%{x\ncommit\n",
    "gitGraph\n  title T %%{x\ncommit\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "gitGraph\ntitle T\u3000%%{x\ncommit\n",
    "gitGraph\n  title T %%{x\ncommit\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "gitGraph\ntitle T\u2003%%{x\ncommit\n",
    "gitGraph\n  title T %%{x\ncommit\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "gitGraph\ntitle T  %%{x  y\ncommit\n",
    "gitGraph\n  title T  %%{x  y\ncommit\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "gitGraph\ntitle T %%{x\ncommit\n",
    "gitGraph\n  title T %%{x\ncommit\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "gitGraph\ntitle T%%{x\ncommit\n",
    "gitGraph\n  title T%%{x\ncommit\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "gitGraph\ntitle T  %%{x",
    "gitGraph\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "gitGraph\ntitle T\u0009%%{x",
    "gitGraph\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "gitGraph\ntitle T\u00a0%%{x",
    "gitGraph\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "gitGraph\ntitle T\u3000%%{x",
    "gitGraph\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "gitGraph\ntitle T\u2003%%{x",
    "gitGraph\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "gitGraph\ntitle T  %%{x  y",
    "gitGraph\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "cynefin-beta\ntitle T  %%{x\n",
    "cynefin-beta\n  title T %%{x\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "cynefin-beta\ntitle T\u0009%%{x\n",
    "cynefin-beta\n  title T %%{x\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "cynefin-beta\ntitle T\u00a0%%{x\n",
    "cynefin-beta\n  title T %%{x\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "cynefin-beta\ntitle T\u3000%%{x\n",
    "cynefin-beta\n  title T %%{x\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "cynefin-beta\ntitle T\u2003%%{x\n",
    "cynefin-beta\n  title T %%{x\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "cynefin-beta\ntitle T  %%{x  y\n",
    "cynefin-beta\n  title T %%{x  y\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "cynefin-beta\ntitle T %%{x\n",
    "cynefin-beta\n  title T %%{x\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "cynefin-beta\ntitle T%%{x\n",
    "cynefin-beta\n  title T%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "cynefin-beta\ntitle T  %%{x",
    "cynefin-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "cynefin-beta\ntitle T\u0009%%{x",
    "cynefin-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "cynefin-beta\ntitle T\u00a0%%{x",
    "cynefin-beta\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "cynefin-beta\ntitle T\u3000%%{x",
    "cynefin-beta\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "cynefin-beta\ntitle T\u2003%%{x",
    "cynefin-beta\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "cynefin-beta\ntitle T  %%{x  y",
    "cynefin-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    'treemap-beta\ntitle T  %%{x\n"A": 1\n',
    'treemap\ntitle T %%{x\n"A": 1\n',
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    'treemap-beta\ntitle T\u0009%%{x\n"A": 1\n',
    'treemap\ntitle T %%{x\n"A": 1\n',
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    'treemap-beta\ntitle T\u00a0%%{x\n"A": 1\n',
    'treemap\ntitle T %%{x\n"A": 1\n',
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    'treemap-beta\ntitle T\u3000%%{x\n"A": 1\n',
    'treemap\ntitle T %%{x\n"A": 1\n',
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    'treemap-beta\ntitle T\u2003%%{x\n"A": 1\n',
    'treemap\ntitle T %%{x\n"A": 1\n',
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    'treemap-beta\ntitle T  %%{x  y\n"A": 1\n',
    'treemap\ntitle T  %%{x  y\n"A": 1\n',
  ],
  [
    "a directive that is not closed after a space in a title",
    'treemap-beta\ntitle T %%{x\n"A": 1\n',
    'treemap\ntitle T %%{x\n"A": 1\n',
  ],
  [
    "a directive that is not closed touching the text of a title",
    'treemap-beta\ntitle T%%{x\n"A": 1\n',
    'treemap\ntitle T%%{x\n"A": 1\n',
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "treemap-beta\ntitle T  %%{x",
    "treemap\ntitle T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "treemap-beta\ntitle T\u0009%%{x",
    "treemap\ntitle T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "treemap-beta\ntitle T\u00a0%%{x",
    "treemap\ntitle T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "treemap-beta\ntitle T\u3000%%{x",
    "treemap\ntitle T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "treemap-beta\ntitle T\u2003%%{x",
    "treemap\ntitle T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "treemap-beta\ntitle T  %%{x  y",
    "treemap\ntitle T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "wardley-beta\ntitle T  %%{x\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T  %%{x\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "wardley-beta\ntitle T\u0009%%{x\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T\u0009%%{x\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "wardley-beta\ntitle T\u00a0%%{x\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T\u00a0%%{x\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "wardley-beta\ntitle T\u3000%%{x\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T\u3000%%{x\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "wardley-beta\ntitle T\u2003%%{x\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T\u2003%%{x\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "wardley-beta\ntitle T  %%{x  y\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T  %%{x  y\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "wardley-beta\ntitle T %%{x\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T %%{x\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "wardley-beta\ntitle T%%{x\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title T%%{x\ncomponent A [0.5, 0.5]\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "wardley-beta\ntitle T  %%{x",
    "wardley-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "wardley-beta\ntitle T\u0009%%{x",
    "wardley-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "wardley-beta\ntitle T\u00a0%%{x",
    "wardley-beta\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "wardley-beta\ntitle T\u3000%%{x",
    "wardley-beta\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "wardley-beta\ntitle T\u2003%%{x",
    "wardley-beta\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "wardley-beta\ntitle T  %%{x  y",
    "wardley-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "treeView-beta\ntitle T  %%{x\nroot\n",
    "treeView-beta\n  title T %%{x\nroot\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "treeView-beta\ntitle T\u0009%%{x\nroot\n",
    "treeView-beta\n  title T %%{x\nroot\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "treeView-beta\ntitle T\u00a0%%{x\nroot\n",
    "treeView-beta\n  title T %%{x\nroot\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "treeView-beta\ntitle T\u3000%%{x\nroot\n",
    "treeView-beta\n  title T %%{x\nroot\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "treeView-beta\ntitle T\u2003%%{x\nroot\n",
    "treeView-beta\n  title T %%{x\nroot\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "treeView-beta\ntitle T  %%{x  y\nroot\n",
    "treeView-beta\n  title T  %%{x  y\nroot\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "treeView-beta\ntitle T %%{x\nroot\n",
    "treeView-beta\n  title T %%{x\nroot\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "treeView-beta\ntitle T%%{x\nroot\n",
    "treeView-beta\n  title T%%{x\nroot\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "treeView-beta\ntitle T  %%{x",
    "treeView-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "treeView-beta\ntitle T\u0009%%{x",
    "treeView-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "treeView-beta\ntitle T\u00a0%%{x",
    "treeView-beta\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "treeView-beta\ntitle T\u3000%%{x",
    "treeView-beta\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "treeView-beta\ntitle T\u2003%%{x",
    "treeView-beta\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "treeView-beta\ntitle T  %%{x  y",
    "treeView-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "info\ntitle T  %%{x\n",
    "info\n  title T %%{x\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "info\ntitle T\u0009%%{x\n",
    "info\n  title T %%{x\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "info\ntitle T\u00a0%%{x\n",
    "info\n  title T %%{x\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "info\ntitle T\u3000%%{x\n",
    "info\n  title T %%{x\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "info\ntitle T\u2003%%{x\n",
    "info\n  title T %%{x\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "info\ntitle T  %%{x  y\n",
    "info\n  title T %%{x  y\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "info\ntitle T %%{x\n",
    "info\n  title T %%{x\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "info\ntitle T%%{x\n",
    "info\n  title T%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "info\ntitle T  %%{x",
    "info\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "info\ntitle T\u0009%%{x",
    "info\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "info\ntitle T\u00a0%%{x",
    "info\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "info\ntitle T\u3000%%{x",
    "info\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "info\ntitle T\u2003%%{x",
    "info\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "info\ntitle T  %%{x  y",
    "info\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    'railroad-abnf-beta\ntitle T  %%{x\nr="a";\n',
    'railroad-abnf-beta\n  title T  %%{x\nr="a";\n',
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    'railroad-abnf-beta\ntitle T\u0009%%{x\nr="a";\n',
    'railroad-abnf-beta\n  title T\u0009%%{x\nr="a";\n',
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    'railroad-abnf-beta\ntitle T\u00a0%%{x\nr="a";\n',
    'railroad-abnf-beta\n  title T\u00a0%%{x\nr="a";\n',
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    'railroad-abnf-beta\ntitle T\u3000%%{x\nr="a";\n',
    'railroad-abnf-beta\n  title T\u3000%%{x\nr="a";\n',
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    'railroad-abnf-beta\ntitle T\u2003%%{x\nr="a";\n',
    'railroad-abnf-beta\n  title T\u2003%%{x\nr="a";\n',
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    'railroad-abnf-beta\ntitle T  %%{x  y\nr="a";\n',
    'railroad-abnf-beta\n  title T  %%{x  y\nr="a";\n',
  ],
  [
    "a directive that is not closed after a space in a title",
    'railroad-abnf-beta\ntitle T %%{x\nr="a";\n',
    'railroad-abnf-beta\n  title T %%{x\nr="a";\n',
  ],
  [
    "a directive that is not closed touching the text of a title",
    'railroad-abnf-beta\ntitle T%%{x\nr="a";\n',
    'railroad-abnf-beta\n  title T%%{x\nr="a";\n',
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "railroad-abnf-beta\ntitle T  %%{x",
    "railroad-abnf-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "railroad-abnf-beta\ntitle T\u0009%%{x",
    "railroad-abnf-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "railroad-abnf-beta\ntitle T\u00a0%%{x",
    "railroad-abnf-beta\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "railroad-abnf-beta\ntitle T\u3000%%{x",
    "railroad-abnf-beta\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "railroad-abnf-beta\ntitle T\u2003%%{x",
    "railroad-abnf-beta\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "railroad-abnf-beta\ntitle T  %%{x  y",
    "railroad-abnf-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "quadrantChart\ntitle T  %%{x\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T  %%{x\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "quadrantChart\ntitle T\u0009%%{x\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T\u0009%%{x\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "quadrantChart\ntitle T\u00a0%%{x\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T\u00a0%%{x\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "quadrantChart\ntitle T\u3000%%{x\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T\u3000%%{x\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "quadrantChart\ntitle T\u2003%%{x\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T\u2003%%{x\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "quadrantChart\ntitle T  %%{x  y\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T  %%{x  y\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "quadrantChart\ntitle T %%{x\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T %%{x\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "quadrantChart\ntitle T%%{x\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title T%%{x\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "quadrantChart\ntitle T  %%{x",
    "quadrantChart\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "quadrantChart\ntitle T\u0009%%{x",
    "quadrantChart\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "quadrantChart\ntitle T\u00a0%%{x",
    "quadrantChart\n  title T %%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "quadrantChart\ntitle T\u3000%%{x",
    "quadrantChart\n  title T %%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "quadrantChart\ntitle T\u2003%%{x",
    "quadrantChart\n  title T %%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "quadrantChart\ntitle T  %%{x  y",
    "quadrantChart\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "gantt\ntitle T  %%{x\n",
    "gantt\n  title T %%{x\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "gantt\ntitle T\u0009%%{x\n",
    "gantt\n  title T %%{x\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "gantt\ntitle T\u00a0%%{x\n",
    "gantt\n  title T\u00a0%%{x\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "gantt\ntitle T\u3000%%{x\n",
    "gantt\n  title T\u3000%%{x\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "gantt\ntitle T\u2003%%{x\n",
    "gantt\n  title T\u2003%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "gantt\ntitle T  %%{x  y\n",
    "gantt\n  title T %%{x  y\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "gantt\ntitle T %%{x\n",
    "gantt\n  title T %%{x\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "gantt\ntitle T%%{x\n",
    "gantt\n  title T%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "gantt\ntitle T  %%{x",
    "gantt\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "gantt\ntitle T\u0009%%{x",
    "gantt\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "gantt\ntitle T\u00a0%%{x",
    "gantt\n  title T\u00a0%%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "gantt\ntitle T\u3000%%{x",
    "gantt\n  title T\u3000%%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "gantt\ntitle T\u2003%%{x",
    "gantt\n  title T\u2003%%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "gantt\ntitle T  %%{x  y",
    "gantt\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "journey\ntitle T  %%{x\n",
    "journey\n  title T %%{x\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "journey\ntitle T\u0009%%{x\n",
    "journey\n  title T %%{x\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "journey\ntitle T\u00a0%%{x\n",
    "journey\n  title T\u00a0%%{x\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "journey\ntitle T\u3000%%{x\n",
    "journey\n  title T\u3000%%{x\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "journey\ntitle T\u2003%%{x\n",
    "journey\n  title T\u2003%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "journey\ntitle T  %%{x  y\n",
    "journey\n  title T %%{x  y\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "journey\ntitle T %%{x\n",
    "journey\n  title T %%{x\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "journey\ntitle T%%{x\n",
    "journey\n  title T%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "journey\ntitle T  %%{x",
    "journey\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "journey\ntitle T\u0009%%{x",
    "journey\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "journey\ntitle T\u00a0%%{x",
    "journey\n  title T\u00a0%%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "journey\ntitle T\u3000%%{x",
    "journey\n  title T\u3000%%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "journey\ntitle T\u2003%%{x",
    "journey\n  title T\u2003%%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "journey\ntitle T  %%{x  y",
    "journey\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "timeline\ntitle T  %%{x\n",
    "timeline\n  title T %%{x\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "timeline\ntitle T\u0009%%{x\n",
    "timeline\n  title T %%{x\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "timeline\ntitle T\u00a0%%{x\n",
    "timeline\n  title T\u00a0%%{x\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "timeline\ntitle T\u3000%%{x\n",
    "timeline\n  title T\u3000%%{x\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "timeline\ntitle T\u2003%%{x\n",
    "timeline\n  title T\u2003%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "timeline\ntitle T  %%{x  y\n",
    "timeline\n  title T %%{x  y\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "timeline\ntitle T %%{x\n",
    "timeline\n  title T %%{x\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "timeline\ntitle T%%{x\n",
    "timeline\n  title T%%{x\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "timeline\ntitle T  %%{x",
    "timeline\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "timeline\ntitle T\u0009%%{x",
    "timeline\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "timeline\ntitle T\u00a0%%{x",
    "timeline\n  title T\u00a0%%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "timeline\ntitle T\u3000%%{x",
    "timeline\n  title T\u3000%%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "timeline\ntitle T\u2003%%{x",
    "timeline\n  title T\u2003%%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "timeline\ntitle T  %%{x  y",
    "timeline\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "sequenceDiagram\ntitle T  %%{x\nA->>B: x\n",
    "sequenceDiagram\n  title T  %%{x\nA->>B: x\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "sequenceDiagram\ntitle T\u0009%%{x\nA->>B: x\n",
    "sequenceDiagram\n  title T\u0009%%{x\nA->>B: x\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "sequenceDiagram\ntitle T\u00a0%%{x\nA->>B: x\n",
    "sequenceDiagram\n  title T\u00a0%%{x\nA->>B: x\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "sequenceDiagram\ntitle T\u3000%%{x\nA->>B: x\n",
    "sequenceDiagram\n  title T\u3000%%{x\nA->>B: x\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "sequenceDiagram\ntitle T\u2003%%{x\nA->>B: x\n",
    "sequenceDiagram\n  title T\u2003%%{x\nA->>B: x\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "sequenceDiagram\ntitle T  %%{x  y\nA->>B: x\n",
    "sequenceDiagram\n  title T  %%{x  y\nA->>B: x\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "sequenceDiagram\ntitle T %%{x\nA->>B: x\n",
    "sequenceDiagram\n  title T %%{x\nA->>B: x\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "sequenceDiagram\ntitle T%%{x\nA->>B: x\n",
    "sequenceDiagram\n  title T%%{x\nA->>B: x\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "sequenceDiagram\ntitle T  %%{x",
    "sequenceDiagram\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "sequenceDiagram\ntitle T\u0009%%{x",
    "sequenceDiagram\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "sequenceDiagram\ntitle T\u00a0%%{x",
    "sequenceDiagram\n  title T\u00a0%%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "sequenceDiagram\ntitle T\u3000%%{x",
    "sequenceDiagram\n  title T\u3000%%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "sequenceDiagram\ntitle T\u2003%%{x",
    "sequenceDiagram\n  title T\u2003%%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "sequenceDiagram\ntitle T  %%{x  y",
    "sequenceDiagram\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    "venn-beta\ntitle T  %%{x\nset A\n",
    "venn-beta\n  title T  %%{x\nset A\n",
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    "venn-beta\ntitle T\u0009%%{x\nset A\n",
    "venn-beta\n  title T\u0009%%{x\nset A\n",
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    "venn-beta\ntitle T\u00a0%%{x\nset A\n",
    "venn-beta\n  title T\u00a0%%{x\nset A\n",
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    "venn-beta\ntitle T\u3000%%{x\nset A\n",
    "venn-beta\n  title T\u3000%%{x\nset A\n",
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    "venn-beta\ntitle T\u2003%%{x\nset A\n",
    "venn-beta\n  title T\u2003%%{x\nset A\n",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    "venn-beta\ntitle T  %%{x  y\nset A\n",
    "venn-beta\n  title T  %%{x  y\nset A\n",
  ],
  [
    "a directive that is not closed after a space in a title",
    "venn-beta\ntitle T %%{x\nset A\n",
    "venn-beta\n  title T %%{x\nset A\n",
  ],
  [
    "a directive that is not closed touching the text of a title",
    "venn-beta\ntitle T%%{x\nset A\n",
    "venn-beta\n  title T%%{x\nset A\n",
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "venn-beta\ntitle T  %%{x",
    "venn-beta\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "venn-beta\ntitle T\u0009%%{x",
    "venn-beta\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "venn-beta\ntitle T\u00a0%%{x",
    "venn-beta\n  title T\u00a0%%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "venn-beta\ntitle T\u3000%%{x",
    "venn-beta\n  title T\u3000%%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "venn-beta\ntitle T\u2003%%{x",
    "venn-beta\n  title T\u2003%%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "venn-beta\ntitle T  %%{x  y",
    "venn-beta\n  title T %%{x  y",
  ],
  [
    "two spaces before a directive that is not closed in a title, before a statement",
    'C4Context\ntitle T  %%{x\nPerson(a,"A")\n',
    'C4Context\n  title T  %%{x\nPerson(a,"A")\n',
  ],
  [
    "a tab before a directive that is not closed in a title, before a statement",
    'C4Context\ntitle T\u0009%%{x\nPerson(a,"A")\n',
    'C4Context\n  title T\u0009%%{x\nPerson(a,"A")\n',
  ],
  [
    "a no-break space before a directive that is not closed in a title, before a statement",
    'C4Context\ntitle T\u00a0%%{x\nPerson(a,"A")\n',
    'C4Context\n  title T\u00a0%%{x\nPerson(a,"A")\n',
  ],
  [
    "U+3000 before a directive that is not closed in a title, before a statement",
    'C4Context\ntitle T\u3000%%{x\nPerson(a,"A")\n',
    'C4Context\n  title T\u3000%%{x\nPerson(a,"A")\n',
  ],
  [
    "U+2003 before a directive that is not closed in a title, before a statement",
    'C4Context\ntitle T\u2003%%{x\nPerson(a,"A")\n',
    'C4Context\n  title T\u2003%%{x\nPerson(a,"A")\n',
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, before a statement",
    'C4Context\ntitle T  %%{x  y\nPerson(a,"A")\n',
    'C4Context\n  title T  %%{x  y\nPerson(a,"A")\n',
  ],
  [
    "a directive that is not closed after a space in a title",
    'C4Context\ntitle T %%{x\nPerson(a,"A")\n',
    'C4Context\n  title T %%{x\nPerson(a,"A")\n',
  ],
  [
    "a directive that is not closed touching the text of a title",
    'C4Context\ntitle T%%{x\nPerson(a,"A")\n',
    'C4Context\n  title T%%{x\nPerson(a,"A")\n',
  ],
  [
    "two spaces before a directive that is not closed in a title, at the end of the text",
    "C4Context\ntitle T  %%{x",
    "C4Context\n  title T %%{x",
  ],
  [
    "a tab before a directive that is not closed in a title, at the end of the text",
    "C4Context\ntitle T\u0009%%{x",
    "C4Context\n  title T %%{x",
  ],
  [
    "a no-break space before a directive that is not closed in a title, at the end of the text",
    "C4Context\ntitle T\u00a0%%{x",
    "C4Context\n  title T\u00a0%%{x",
  ],
  [
    "U+3000 before a directive that is not closed in a title, at the end of the text",
    "C4Context\ntitle T\u3000%%{x",
    "C4Context\n  title T\u3000%%{x",
  ],
  [
    "U+2003 before a directive that is not closed in a title, at the end of the text",
    "C4Context\ntitle T\u2003%%{x",
    "C4Context\n  title T\u2003%%{x",
  ],
  [
    "two spaces before a directive that is not closed and text after it in a title, at the end of the text",
    "C4Context\ntitle T  %%{x  y",
    "C4Context\n  title T %%{x  y",
  ],
]

const titleGroupRepresentatives = titleTypes.filter(([name]) =>
  [
    "a radar chart",
    "a quadrant chart",
    "a Gantt chart",
    "a Venn diagram",
    "a C4 diagram",
  ].includes(name),
)

describe.each(titleGroupRepresentatives)(
  "the title of %s with a directive or a comment",
  (_diagram, group, input, output) => {
    it.each(titleDirectiveCases)(
      "prints %s",
      async (_case, written, ...printed) => {
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", printed[group] ?? written),
        )
      },
    )
  },
)

const titleMembershipCases = titleDirectiveCases.filter(
  ([name]) =>
    name === "a comment and spaces after a directive that ends a title" ||
    name === "a no-break space after the last directive of a title" ||
    name === "a directive and spaces only as a title",
)

describe.each(titleTypes)(
  "the title of %s",
  (_diagram, group, input, output) => {
    it.each(titleMembershipCases)(
      "prints %s as its group does",
      async (_case, written, ...printed) => {
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", printed[group] ?? written),
        )
      },
    )
  },
)

/**
 * An `accTitle:` or `accDescr:` line of each diagram type that has one, beside a
 * directive or a comment: what the Langium types print, and what a quadrant
 * chart, a Gantt chart, a user journey, a timeline, a sequence diagram, and a
 * C4 diagram print for an `accTitle:` line and for an `accDescr:` line
 * (docs/compatibility.md, Texts after a keyword that are drawn the same). A
 * `null` is the written value.
 */
const accessibilityDirectiveCases: readonly (readonly [
  string,
  string,
  string | null,
  string | null,
  string | null,
])[] = [
  [
    "runs and spaces around a directive that ends an accessibility line",
    "T  %%{x}%%  ",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "a comment and spaces after a directive that ends an accessibility line",
    "T  %%{x}%%  %% c  ",
    "T %%{x}%% %% c  ",
    "T  %%{x}%%  %% c",
    "T  %%{x}%%  %% c",
  ],
  [
    "a no-break space after the last directive of an accessibility line",
    "T %%{x}%%\u00a0",
    null,
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "U+3000 after the last directive of an accessibility line",
    "T %%{x}%%\u3000",
    null,
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "U+2003 after the last directive of an accessibility line",
    "T %%{x}%%\u2003",
    null,
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "a no-break space after a directive that starts an accessibility line and before another directive",
    "%%{x}%%\u00a0T %%{y}%%",
    null,
    "%%{x}%%T %%{y}%%",
    "%%{x}%%T %%{y}%%",
  ],
  [
    "a no-break space after a directive that starts an accessibility line and after the last directive",
    "%%{x}%%\u00a0T %%{y}%%\u00a0",
    null,
    "%%{x}%%T %%{y}%%",
    "%%{x}%%T %%{y}%%",
  ],
  [
    "a no-break space after a directive that starts an accessibility line and text after the last directive",
    "%%{x}%%\u00a0T %%{y}%% U",
    null,
    "%%{x}%%T %%{y}%% U",
    "%%{x}%%T %%{y}%% U",
  ],
  [
    "spaces after a directive that starts an accessibility line",
    "%%{x}%%  T  ",
    null,
    "%%{x}%%T",
    "%%{x}%%T",
  ],
  [
    "text after a directive and spaces at the end of an accessibility line",
    "T %%{x}%% U  ",
    null,
    "T %%{x}%% U",
    "T %%{x}%% U",
  ],
  [
    "a no-break space after a directive and spaces at the end of an accessibility line",
    "T %%{x}%%\u00a0U  ",
    null,
    "T %%{x}%%\u00a0U",
    "T %%{x}%%\u00a0U",
  ],
  [
    "text between two directives and spaces at the end of an accessibility line",
    "T %%{x}%%  U  %%{y}%%  ",
    null,
    "T %%{x}%%  U %%{y}%%",
    "T %%{x}%%  U %%{y}%%",
  ],
  [
    "a no-break space between the text and a directive that ends an accessibility line",
    "T\u00a0%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "U+3000 between the text and a directive that ends an accessibility line",
    "T\u3000%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "U+2003 between the text and a directive that ends an accessibility line",
    "T\u2003%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "a tab before and after the last directive of an accessibility line",
    "T\t%%{x}%%\t",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "a no-break space before a comment after the text of an accessibility line",
    "T\u00a0%% c",
    "T %% c",
    null,
    null,
  ],
  [
    "runs and spaces around a comment after the text of an accessibility line",
    "T  %% c  ",
    "T %% c  ",
    "T  %% c",
    "T %% c",
  ],
  [
    "a comment and spaces after a directive that follows the text of an accessibility line",
    "T %%{x}%% %% c  ",
    null,
    "T %%{x}%% %% c",
    "T %%{x}%% %% c",
  ],
  [
    "a no-break space before a directive and a comment after the text of an accessibility line",
    "T\u00a0%%{x}%%%% c",
    "T %%{x}%%%% c",
    null,
    null,
  ],
  [
    "U+2028 and spaces after the last directive of an accessibility line",
    "T %%{x}%%\u2028  ",
    null,
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "U+2029 and spaces after the last directive of an accessibility line",
    "T %%{x}%%\u2029  ",
    null,
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "U+2028 between the text and a directive that ends an accessibility line",
    "T\u2028%%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
    "T %%{x}%%",
  ],
  [
    "two directives after the text of an accessibility line and spaces",
    "T  %%{x}%%  %%{y}%%  ",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
  ],
  [
    "two directives after the text of an accessibility line",
    "T  %%{x}%%  %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
    "T %%{x}%% %%{y}%%",
  ],
  [
    "two directives touching after the text of an accessibility line and spaces",
    "T%%{x}%%%%{y}%%  ",
    "T%%{x}%%%%{y}%%",
    "T%%{x}%%%%{y}%%",
    "T%%{x}%%%%{y}%%",
  ],
  [
    "a comment touching the text of an accessibility line",
    "T%% c",
    null,
    null,
    null,
  ],
]

/** The lines of every type that has them: a Venn diagram has none. */
const accessibilityLineTypes = titleTypes
  .filter(([name]) => name !== "a Venn diagram")
  .map(
    ([name, group, input, output]) =>
      [
        name,
        group === 0 ? 0 : 1,
        input.replace("title {title}", "{line} {title}"),
        output.replace("title {title}", "{line} {title}"),
      ] as const,
  )

const accessibilityLines = ["accTitle:", "accDescr:"] as const

describe.each(accessibilityLines)("the %s line", (line) => {
  describe.each(
    accessibilityLineTypes.filter(([name]) =>
      ["a radar chart", "a Gantt chart", "a C4 diagram"].includes(name),
    ),
  )("of %s with a directive or a comment", (_diagram, group, input, output) => {
    it.each(accessibilityDirectiveCases)(
      "prints %s",
      async (_case, written, langium, other, otherDescr) => {
        const printed =
          group === 0 ? langium : line === "accTitle:" ? other : otherDescr
        await expectKept(
          input.replace("{line}", line).replace("{title}", written),
          output.replace("{line}", line).replace("{title}", printed ?? written),
        )
      },
    )
  })

  describe.each(accessibilityLineTypes)(
    "of %s",
    (_diagram, group, input, output) => {
      it.each(
        accessibilityDirectiveCases.filter(
          ([name]) =>
            name ===
              "a no-break space after the last directive of an accessibility line" ||
            name ===
              "a no-break space after a directive that starts an accessibility line and before another directive",
        ),
      )(
        "prints %s as its group does",
        async (_case, written, langium, other, otherDescr) => {
          const printed =
            group === 0 ? langium : line === "accTitle:" ? other : otherDescr
          await expectKept(
            input.replace("{line}", line).replace("{title}", written),
            output
              .replace("{line}", line)
              .replace("{title}", printed ?? written),
          )
        },
      )
    },
  )
})

/** The accTitle line of a pie chart and of a gitGraph keeps the whitespace before a comment (docs/pie.md, Accessibility lines). */
const accessibilityCommentRows = [
  "a comment and spaces after a directive that ends a title",
  "a no-break space before a comment after the text of a title",
  "runs and spaces around a comment after the text of a title",
  "a no-break space before a directive and a comment after the text of a title",
]

describe.each(
  titleTypes
    .filter(([name]) => ["a pie chart", "a gitGraph"].includes(name))
    .map(
      ([name, , input, output]) =>
        [
          name,
          input.replace("title {title}", "accTitle: {title}"),
          output.replace("title {title}", "accTitle: {title}"),
        ] as const,
    ),
)("the accTitle line of %s with a comment", (_diagram, input, output) => {
  it.each(
    titleDirectiveCases.filter(([name]) =>
      accessibilityCommentRows.includes(name),
    ),
  )("keeps %s", async (_case, written) => {
    await expectKept(
      input.replace("{title}", written),
      output.replace("{title}", written),
    )
  })
})

describe("the accDescription of a C4 diagram with a directive or a comment", () => {
  it.each(titleDirectiveCases)(
    "prints %s",
    async (_case, written, _langium, _quadrant, _gantt, venn) => {
      await expectKept(
        `C4Context\naccDescription ${written}\nPerson(a,"A")\n`,
        `C4Context\n  accDescription ${venn ?? written}\n  Person(a, "A")\n`,
      )
    },
  )
})

describe("the title of a diagram with a directive that is not closed", () => {
  it.each(titleOpenDirectiveExamples)(
    "prints %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

const c4AccDescriptionExamples: readonly (readonly [string, string, string])[] =
  [
    [
      "two spaces before a comment after an accDescription of a C4 diagram",
      'C4Context\naccDescription D  %% c\nPerson(a, "A")\n',
      'C4Context\n  accDescription D %% c\n  Person(a, "A")\n',
    ],
    [
      "spaces after the comment of an accDescription of a C4 diagram",
      'C4Context\naccDescription D %% c  \nPerson(a, "A")\n',
      'C4Context\n  accDescription D %% c\n  Person(a, "A")\n',
    ],
    [
      "text after a directive and spaces at the end of an accDescription of a C4 diagram",
      'C4Context\naccDescription D %%{x}%% U  \nPerson(a, "A")\n',
      'C4Context\n  accDescription D %%{x}%% U  \n  Person(a, "A")\n',
    ],
  ]

describe("the accDescription of a C4 diagram with a comment or a directive", () => {
  it.each(c4AccDescriptionExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})
