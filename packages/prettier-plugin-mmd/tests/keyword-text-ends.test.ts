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
 * The groups of diagram types that print a title with a directive or a comment
 * alike (docs/compatibility.md, Texts after a keyword that are drawn the same).
 */
type TitleGroup = "langium" | "quadrant" | "gantt" | "vennAndC4"

/**
 * The title of each diagram type beside a directive or a comment, by the group
 * of types that print it alike: a representative of each group holds every
 * case, and every type holds three cases that tell the groups apart.
 */
interface TitleType {
  readonly name: string
  readonly group: TitleGroup
  /** The text of a diagram of the type, with `{title}` where its title goes. */
  readonly input: string
  /** What the printer makes of the text when the title is printed as written. */
  readonly output: string
}

const titleTypes: readonly TitleType[] = [
  {
    name: "a pie chart",
    group: "langium",
    input: 'pie\ntitle {title}\n"a": 1\n',
    output: 'pie\n  title {title}\n  "a": 1\n',
  },
  {
    name: "a radar chart",
    group: "langium",
    input: "radar-beta\ntitle {title}\naxis a, b\ncurve c{1, 2}\n",
    output: "radar-beta\n  title {title}\n  axis a, b\n  curve c{1, 2}\n",
  },
  {
    name: "a packet diagram",
    group: "langium",
    input: 'packet-beta\ntitle {title}\n0-7: "x"\n',
    output: 'packet-beta\n  title {title}\n  0-7: "x"\n',
  },
  {
    name: "an architecture diagram",
    group: "langium",
    input: "architecture-beta\ntitle {title}\nservice a(server)[A]\n",
    output: "architecture-beta\n  title {title}\n  service a(server)[A]\n",
  },
  {
    name: "a gitGraph",
    group: "langium",
    input: "gitGraph\ntitle {title}\ncommit\n",
    output: "gitGraph\n  title {title}\n  commit\n",
  },
  {
    name: "a cynefin diagram",
    group: "langium",
    input: "cynefin-beta\ntitle {title}\n",
    output: "cynefin-beta\n  title {title}\n",
  },
  {
    name: "a treemap",
    group: "langium",
    input: 'treemap-beta\ntitle {title}\n"A": 1\n',
    output: 'treemap\ntitle {title}\n  "A": 1\n',
  },
  {
    name: "a Wardley map",
    group: "langium",
    input: "wardley-beta\ntitle {title}\ncomponent A [0.5, 0.5]\n",
    output: "wardley-beta\n  title {title}\n  component A [0.5, 0.5]\n",
  },
  {
    name: "a treeView",
    group: "langium",
    input: "treeView-beta\ntitle {title}\nroot\n",
    output: "treeView-beta\n  title {title}\n  root\n",
  },
  {
    name: "an info diagram",
    group: "langium",
    input: "info\ntitle {title}\n",
    output: "info\n  title {title}\n",
  },
  {
    name: "a railroad diagram",
    group: "langium",
    input: 'railroad-abnf-beta\ntitle {title}\nr="a";\n',
    output: 'railroad-abnf-beta\n  title {title}\n  r = "a";\n',
  },
  {
    name: "a quadrant chart",
    group: "quadrant",
    input:
      "quadrantChart\ntitle {title}\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    output:
      "quadrantChart\n  title {title}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  },
  {
    name: "a Gantt chart",
    group: "gantt",
    input: "gantt\ntitle {title}\n",
    output: "gantt\n  title {title}\n",
  },
  {
    name: "a user journey",
    group: "gantt",
    input: "journey\ntitle {title}\n",
    output: "journey\n  title {title}\n",
  },
  {
    name: "a timeline",
    group: "gantt",
    input: "timeline\ntitle {title}\n",
    output: "timeline\n  title {title}\n",
  },
  {
    name: "a sequence diagram",
    group: "gantt",
    input: "sequenceDiagram\ntitle {title}\nA->>B: x\n",
    output: "sequenceDiagram\n  title {title}\n  A ->> B: x\n",
  },
  {
    name: "a Venn diagram",
    group: "vennAndC4",
    input: "venn-beta\ntitle {title}\nset A\n",
    output: "venn-beta\n  title {title}\n  set A\n",
  },
  {
    name: "a C4 diagram",
    group: "vennAndC4",
    input: 'C4Context\ntitle {title}\nPerson(a,"A")\n',
    output: 'C4Context\n  title {title}\n  Person(a, "A")\n',
  },
]

/** A title written beside a directive or a comment, and what each group prints. */
interface TitleDirectiveCase {
  readonly name: string
  readonly written: string
  /** What each group prints; a group that is missing prints the written title. */
  readonly printed: Readonly<Partial<Record<TitleGroup, string>>>
}

/** What a group prints for a case: the written title where it prints it so. */
function printedTitle(row: TitleDirectiveCase, group: TitleGroup): string {
  return row.printed[group] ?? row.written
}

const titleDirectiveCases: readonly TitleDirectiveCase[] = [
  {
    name: "runs and spaces around a directive that ends a title",
    written: "T  %%{x}%%  ",
    printed: {
      langium: "T %%{x}%%",
      quadrant: "T %%{x}%%",
      gantt: "T %%{x}%%",
      vennAndC4: "T %%{x}%%",
    },
  },
  {
    name: "a comment and spaces after a directive that ends a title",
    written: "T  %%{x}%%  %% c  ",
    printed: {
      langium: "T %%{x}%% %% c  ",
      quadrant: "T  %%{x}%%  %% c",
      gantt: "T  %%{x}%%  %% c",
    },
  },
  {
    name: "a no-break space after the last directive of a title",
    written: "T %%{x}%%\u00a0",
    printed: {
      quadrant: "T %%{x}%%",
    },
  },
  {
    name: "U+3000 after the last directive of a title",
    written: "T %%{x}%%\u3000",
    printed: {
      quadrant: "T %%{x}%%",
    },
  },
  {
    name: "U+2003 after the last directive of a title",
    written: "T %%{x}%%\u2003",
    printed: {
      quadrant: "T %%{x}%%",
    },
  },
  {
    name: "a no-break space after a directive that starts a title and before another directive",
    written: "%%{x}%%\u00a0T %%{y}%%",
    printed: {
      langium: "%%{x}%%T %%{y}%%",
      quadrant: "%%{x}%%T %%{y}%%",
    },
  },
  {
    name: "a no-break space after a directive that starts a title and after the last directive",
    written: "%%{x}%%\u00a0T %%{y}%%\u00a0",
    printed: {
      quadrant: "%%{x}%%T %%{y}%%",
    },
  },
  {
    name: "a no-break space after a directive that starts a title and text after the last directive",
    written: "%%{x}%%\u00a0T %%{y}%% U",
    printed: {
      quadrant: "%%{x}%%T %%{y}%% U",
    },
  },
  {
    name: "spaces after a directive that starts a title",
    written: "%%{x}%%  T  ",
    printed: {
      langium: "%%{x}%%T",
      quadrant: "%%{x}%%T",
      gantt: "%%{x}%%T",
    },
  },
  {
    name: "text after a directive and spaces at the end of a title",
    written: "T %%{x}%% U  ",
    printed: {
      quadrant: "T %%{x}%% U",
      gantt: "T %%{x}%% U",
    },
  },
  {
    name: "a no-break space after a directive and spaces at the end of a title",
    written: "T %%{x}%%\u00a0U  ",
    printed: {
      quadrant: "T %%{x}%%\u00a0U",
      gantt: "T %%{x}%%\u00a0U",
    },
  },
  {
    name: "text between two directives and spaces at the end of a title",
    written: "T %%{x}%%  U  %%{y}%%  ",
    printed: {
      quadrant: "T %%{x}%%  U %%{y}%%",
      gantt: "T %%{x}%%  U %%{y}%%",
    },
  },
  {
    name: "a no-break space between the text and a directive that ends a title",
    written: "T\u00a0%%{x}%%",
    printed: {
      langium: "T %%{x}%%",
      quadrant: "T %%{x}%%",
    },
  },
  {
    name: "U+3000 between the text and a directive that ends a title",
    written: "T\u3000%%{x}%%",
    printed: {
      langium: "T %%{x}%%",
      quadrant: "T %%{x}%%",
    },
  },
  {
    name: "U+2003 between the text and a directive that ends a title",
    written: "T\u2003%%{x}%%",
    printed: {
      langium: "T %%{x}%%",
      quadrant: "T %%{x}%%",
    },
  },
  {
    name: "a tab before and after the last directive of a title",
    written: "T\t%%{x}%%\t",
    printed: {
      langium: "T %%{x}%%",
      quadrant: "T %%{x}%%",
      gantt: "T %%{x}%%",
      vennAndC4: "T %%{x}%%",
    },
  },
  {
    name: "a no-break space before a comment after the text of a title",
    written: "T\u00a0%% c",
    printed: {
      langium: "T %% c",
    },
  },
  {
    name: "runs and spaces around a comment after the text of a title",
    written: "T  %% c  ",
    printed: {
      langium: "T %% c  ",
      quadrant: "T %% c",
      gantt: "T %% c",
      vennAndC4: "T %% c",
    },
  },
  {
    name: "a comment and spaces after a directive that follows the text of a title",
    written: "T %%{x}%% %% c  ",
    printed: {
      quadrant: "T %%{x}%% %% c",
      gantt: "T %%{x}%% %% c",
    },
  },
  {
    name: "a no-break space before a directive and a comment after the text of a title",
    written: "T\u00a0%%{x}%%%% c",
    printed: {
      langium: "T %%{x}%%%% c",
    },
  },
  {
    name: "a directive and spaces only as a title",
    written: "%%{x}%%  ",
    printed: {
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "a directive and a tab only as a title",
    written: "%%{x}%%\t",
    printed: {
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "two directives and spaces only as a title",
    written: "%%{x}%%  %%{y}%%  ",
    printed: {
      quadrant: "%%{x}%% %%{y}%%",
    },
  },
  {
    name: "two directives after the text of a title and spaces",
    written: "T  %%{x}%%  %%{y}%%  ",
    printed: {
      langium: "T %%{x}%% %%{y}%%",
      quadrant: "T %%{x}%% %%{y}%%",
      gantt: "T %%{x}%% %%{y}%%",
      vennAndC4: "T %%{x}%% %%{y}%%",
    },
  },
  {
    name: "two directives after the text of a title",
    written: "T  %%{x}%%  %%{y}%%",
    printed: {
      langium: "T %%{x}%% %%{y}%%",
      quadrant: "T %%{x}%% %%{y}%%",
      gantt: "T %%{x}%% %%{y}%%",
      vennAndC4: "T %%{x}%% %%{y}%%",
    },
  },
  {
    name: "two directives touching after the text of a title and spaces",
    written: "T%%{x}%%%%{y}%%  ",
    printed: {
      langium: "T%%{x}%%%%{y}%%",
      quadrant: "T%%{x}%%%%{y}%%",
      gantt: "T%%{x}%%%%{y}%%",
      vennAndC4: "T%%{x}%%%%{y}%%",
    },
  },
  {
    name: "U+2028 and spaces after the last directive of a title",
    written: "T %%{x}%%\u2028  ",
    printed: {
      quadrant: "T %%{x}%%",
      gantt: "T %%{x}%%\u2028",
    },
  },
  {
    name: "U+2029 and spaces after the last directive of a title",
    written: "T %%{x}%%\u2029  ",
    printed: {
      quadrant: "T %%{x}%%",
      gantt: "T %%{x}%%\u2029",
    },
  },
  {
    name: "U+2028 between the text and a directive that ends a title",
    written: "T\u2028%%{x}%%",
    printed: {
      langium: "T %%{x}%%",
      quadrant: "T %%{x}%%",
    },
  },
  {
    name: "a comment touching the text of a title",
    written: "T%% c",
    printed: {},
  },
  {
    name: "a directive and a comment only as a title",
    written: "%%{x}%%  %% c  ",
    printed: {
      quadrant: "%%{x}%%%% c",
      gantt: "%%{x}%%%% c",
    },
  },
  {
    name: "two directives and a comment only as a title",
    written: "%%{x}%%  %%{y}%%  %% c  ",
    printed: {
      quadrant: "%%{x}%%%%{y}%%%% c",
      gantt: "%%{x}%%%%{y}%%%% c",
    },
  },
  {
    name: "a comment and then a directive after the text of a title",
    written: "T %% c %%{x}%%",
    printed: {},
  },
  {
    name: "a no-break space between a directive and a comment after the text of a title",
    written: "T %%{x}%%\u00a0%% c",
    printed: {},
  },
  {
    name: "two directives and a comment after the text of a title",
    written: "T  %%{x}%%  %%{y}%%  %% c",
    printed: {
      langium: "T %%{x}%% %%{y}%% %% c",
    },
  },
  {
    name: "a tab before a comment after the text of a title",
    written: "T\t%% c",
    printed: {
      langium: "T %% c",
      quadrant: "T %% c",
      gantt: "T %% c",
      vennAndC4: "T %% c",
    },
  },
  {
    name: "a space before a directive that starts a title and text after it",
    written: " %%{x}%% T",
    printed: {
      quadrant: "%%{x}%%T",
      gantt: "%%{x}%%T",
    },
  },
  {
    name: "a no-break space before the directive of a title of directives only",
    written: "\u00a0%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "a no-break space before the directive and spaces after it in a title of directives only",
    written: "\u00a0%%{x}%%  ",
    printed: {
      quadrant: "%%{x}%%",
      gantt: "\u00a0%%{x}%%",
      vennAndC4: "\u00a0%%{x}%%",
    },
  },
  {
    name: "U+3000 before the directive of a title of directives only",
    written: "\u3000%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "U+2003 before the directive of a title of directives only",
    written: "\u2003%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "a comment only as a title, with spaces around it",
    written: "  %% c  ",
    printed: {
      langium: "%% c  ",
      quadrant: "%% c",
      gantt: "%% c",
      vennAndC4: "%% c",
    },
  },
  {
    name: "a no-break space before a comment only as a title",
    written: "\u00a0%% c",
    printed: {
      langium: "%% c",
      quadrant: "%% c",
    },
  },
  {
    name: "a space before a directive and a comment only as a title",
    written: " %%{x}%%%% c",
    printed: {
      langium: "%%{x}%%%% c",
      quadrant: "%%{x}%%%% c",
      gantt: "%%{x}%%%% c",
    },
  },
  {
    name: "runs around a comment and then a directive after the text of a title",
    written: "T  %% c  %%{x}%%",
    printed: {
      langium: "T %% c  %%{x}%%",
      quadrant: "T %% c %%{x}%%",
      gantt: "T %% c %%{x}%%",
      vennAndC4: "T %% c %%{x}%%",
    },
  },
  {
    name: "U+3000 before a comment after the text of a title",
    written: "T\u3000%% c",
    printed: {
      langium: "T %% c",
    },
  },
  {
    name: "U+2003 before a comment after the text of a title",
    written: "T\u2003%% c",
    printed: {
      langium: "T %% c",
    },
  },
  {
    name: "a vertical tab before a comment after the text of a title",
    written: "T\u000b%% c",
    printed: {
      langium: "T %% c",
    },
  },
  {
    name: "a form feed before a comment after the text of a title",
    written: "T\u000c%% c",
    printed: {
      langium: "T %% c",
    },
  },
  {
    name: "U+FEFF before a comment after the text of a title",
    written: "T\ufeff%% c",
    printed: {
      langium: "T %% c",
    },
  },
  {
    name: "U+2028 at the end of a title",
    written: "T\u2028",
    printed: {
      langium: "T",
      quadrant: "T",
    },
  },
  {
    name: "spaces and U+2028 at the end of a title",
    written: "T  \u2028",
    printed: {
      langium: "T",
      quadrant: "T",
    },
  },
  {
    name: "U+2029 at the end of a title",
    written: "T\u2029",
    printed: {
      langium: "T",
      quadrant: "T",
    },
  },
  {
    name: "a no-break space between a directive and a comment only as a title",
    written: "%%{x}%%\u00a0%% c",
    printed: {
      quadrant: "%%{x}%%%% c",
    },
  },
  {
    name: "U+3000 between a directive and a comment only as a title",
    written: "%%{x}%%\u3000%% c",
    printed: {
      quadrant: "%%{x}%%%% c",
    },
  },
  {
    name: "U+2003 between a directive and a comment only as a title",
    written: "%%{x}%%\u2003%% c",
    printed: {
      quadrant: "%%{x}%%%% c",
    },
  },
  {
    name: "a tab between a directive and a comment only as a title",
    written: "%%{x}%%\t%% c",
    printed: {
      quadrant: "%%{x}%%%% c",
      gantt: "%%{x}%%%% c",
    },
  },
  {
    name: "U+2028 at the start of a title",
    written: "\u2028T",
    printed: {
      langium: "T",
    },
  },
  {
    name: "U+2029 at the start of a title",
    written: "\u2029T",
    printed: {
      langium: "T",
    },
  },
  {
    name: "U+2028 and then spaces at the end of a title",
    written: "T\u2028  ",
    printed: {
      langium: "T",
      quadrant: "T",
      gantt: "T\u2028",
      vennAndC4: "T\u2028",
    },
  },
  {
    name: "U+2028 before the directive of a title of directives only",
    written: "\u2028%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "U+2029 before the directive of a title of directives only",
    written: "\u2029%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "a vertical tab before the directive of a title of directives only",
    written: "\u000b%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "a form feed before the directive of a title of directives only",
    written: "\u000c%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "U+FEFF before the directive of a title of directives only",
    written: "\ufeff%%{x}%%",
    printed: {
      langium: "%%{x}%%",
      quadrant: "%%{x}%%",
    },
  },
  {
    name: "U+2028 before a directive that starts a title and text after it",
    written: "\u2028%%{x}%% T",
    printed: {},
  },
  {
    name: "U+2029 before a directive that starts a title and text after it",
    written: "\u2029%%{x}%% T",
    printed: {},
  },
  {
    name: "a form feed at the start of a title",
    written: "\u000cT",
    printed: {
      langium: "T",
      quadrant: "T",
    },
  },
  {
    name: "a form feed at the end of a title",
    written: "T\u000c",
    printed: {
      langium: "T",
      quadrant: "T",
    },
  },
  {
    name: "a no-break space before the directive of a title of a directive and a comment only",
    written: "\u00a0%%{x}%%%% c",
    printed: {
      langium: "%%{x}%%%% c",
      quadrant: "%%{x}%%%% c",
    },
  },
  {
    name: "a no-break space before the directive of a title of a directive and a comment only, with spaces around the comment",
    written: "\u00a0%%{x}%%  %% c  ",
    printed: {
      quadrant: "%%{x}%%%% c",
      gantt: "\u00a0%%{x}%%  %% c",
    },
  },
  {
    name: "a space before a directive and spaces around a comment only as a title",
    written: " %%{x}%%  %% c  ",
    printed: {
      quadrant: "%%{x}%%%% c",
      gantt: "%%{x}%%%% c",
    },
  },
  {
    name: "a tab before a directive and a comment only as a title",
    written: "\t%%{x}%%%% c",
    printed: {
      langium: "%%{x}%%%% c",
      quadrant: "%%{x}%%%% c",
      gantt: "%%{x}%%%% c",
    },
  },
  {
    name: "a last directive that holds a semicolon, and spaces after it",
    written: "T  %%{init: {a;b}}%%  ",
    printed: {
      quadrant: "T %%{init: {a;b}}%%",
      gantt: "T %%{init: {a;b}}%%",
      vennAndC4: "T %%{init: {a;b}}%%",
    },
  },
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

const titleGroupRepresentatives = titleTypes.filter(({ name }) =>
  [
    "a radar chart",
    "a quadrant chart",
    "a Gantt chart",
    "a Venn diagram",
    "a C4 diagram",
  ].includes(name),
)

describe.each(titleGroupRepresentatives)(
  "the title of $name with a directive or a comment",
  ({ group, input, output }) => {
    it.each(titleDirectiveCases)("prints $name", async (row) => {
      await expectKept(
        input.replace("{title}", row.written),
        output.replace("{title}", printedTitle(row, group)),
      )
    })
  },
)

const titleMembershipCases = titleDirectiveCases.filter(
  ({ name }) =>
    name === "a comment and spaces after a directive that ends a title" ||
    name === "a no-break space after the last directive of a title" ||
    name === "a directive and spaces only as a title",
)

describe.each(titleTypes)("the title of $name", ({ group, input, output }) => {
  it.each(titleMembershipCases)(
    "prints $name as its group does",
    async (row) => {
      await expectKept(
        input.replace("{title}", row.written),
        output.replace("{title}", printedTitle(row, group)),
      )
    },
  )
})

/**
 * An `accTitle:` or `accDescr:` line of each diagram type that has one, beside a
 * directive or a comment: what the Langium types print, and what a quadrant
 * chart, a Gantt chart, a user journey, a timeline, a sequence diagram, and a
 * C4 diagram print for an `accTitle:` line and for an `accDescr:` line
 * (docs/compatibility.md, Texts after a keyword that are drawn the same).
 */
interface AccessibilityDirectiveCase {
  readonly name: string
  readonly written: string
  /** What the Langium types print; the written value when it is missing. */
  readonly langium?: string
  /** What the other types print for an `accTitle:` line; the written value when it is missing. */
  readonly otherAccTitle?: string
  /** What the other types print for an `accDescr:` line; the written value when it is missing. */
  readonly otherAccDescr?: string
}

const accessibilityDirectiveCases: readonly AccessibilityDirectiveCase[] = [
  {
    name: "runs and spaces around a directive that ends an accessibility line",
    written: "T  %%{x}%%  ",
    langium: "T %%{x}%%",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "a comment and spaces after a directive that ends an accessibility line",
    written: "T  %%{x}%%  %% c  ",
    langium: "T %%{x}%% %% c  ",
    otherAccTitle: "T  %%{x}%%  %% c",
    otherAccDescr: "T  %%{x}%%  %% c",
  },
  {
    name: "a no-break space after the last directive of an accessibility line",
    written: "T %%{x}%%\u00a0",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "U+3000 after the last directive of an accessibility line",
    written: "T %%{x}%%\u3000",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "U+2003 after the last directive of an accessibility line",
    written: "T %%{x}%%\u2003",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "a no-break space after a directive that starts an accessibility line and before another directive",
    written: "%%{x}%%\u00a0T %%{y}%%",
    otherAccTitle: "%%{x}%%T %%{y}%%",
    otherAccDescr: "%%{x}%%T %%{y}%%",
  },
  {
    name: "a no-break space after a directive that starts an accessibility line and after the last directive",
    written: "%%{x}%%\u00a0T %%{y}%%\u00a0",
    otherAccTitle: "%%{x}%%T %%{y}%%",
    otherAccDescr: "%%{x}%%T %%{y}%%",
  },
  {
    name: "a no-break space after a directive that starts an accessibility line and text after the last directive",
    written: "%%{x}%%\u00a0T %%{y}%% U",
    otherAccTitle: "%%{x}%%T %%{y}%% U",
    otherAccDescr: "%%{x}%%T %%{y}%% U",
  },
  {
    name: "spaces after a directive that starts an accessibility line",
    written: "%%{x}%%  T  ",
    otherAccTitle: "%%{x}%%T",
    otherAccDescr: "%%{x}%%T",
  },
  {
    name: "text after a directive and spaces at the end of an accessibility line",
    written: "T %%{x}%% U  ",
    otherAccTitle: "T %%{x}%% U",
    otherAccDescr: "T %%{x}%% U",
  },
  {
    name: "a no-break space after a directive and spaces at the end of an accessibility line",
    written: "T %%{x}%%\u00a0U  ",
    otherAccTitle: "T %%{x}%%\u00a0U",
    otherAccDescr: "T %%{x}%%\u00a0U",
  },
  {
    name: "text between two directives and spaces at the end of an accessibility line",
    written: "T %%{x}%%  U  %%{y}%%  ",
    otherAccTitle: "T %%{x}%%  U %%{y}%%",
    otherAccDescr: "T %%{x}%%  U %%{y}%%",
  },
  {
    name: "a no-break space between the text and a directive that ends an accessibility line",
    written: "T\u00a0%%{x}%%",
    langium: "T %%{x}%%",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "U+3000 between the text and a directive that ends an accessibility line",
    written: "T\u3000%%{x}%%",
    langium: "T %%{x}%%",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "U+2003 between the text and a directive that ends an accessibility line",
    written: "T\u2003%%{x}%%",
    langium: "T %%{x}%%",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "a tab before and after the last directive of an accessibility line",
    written: "T\t%%{x}%%\t",
    langium: "T %%{x}%%",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "a no-break space before a comment after the text of an accessibility line",
    written: "T\u00a0%% c",
    langium: "T %% c",
  },
  {
    name: "runs and spaces around a comment after the text of an accessibility line",
    written: "T  %% c  ",
    langium: "T %% c  ",
    otherAccTitle: "T  %% c",
    otherAccDescr: "T %% c",
  },
  {
    name: "a comment and spaces after a directive that follows the text of an accessibility line",
    written: "T %%{x}%% %% c  ",
    otherAccTitle: "T %%{x}%% %% c",
    otherAccDescr: "T %%{x}%% %% c",
  },
  {
    name: "a no-break space before a directive and a comment after the text of an accessibility line",
    written: "T\u00a0%%{x}%%%% c",
    langium: "T %%{x}%%%% c",
  },
  {
    name: "U+2028 and spaces after the last directive of an accessibility line",
    written: "T %%{x}%%\u2028  ",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "U+2029 and spaces after the last directive of an accessibility line",
    written: "T %%{x}%%\u2029  ",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "U+2028 between the text and a directive that ends an accessibility line",
    written: "T\u2028%%{x}%%",
    langium: "T %%{x}%%",
    otherAccTitle: "T %%{x}%%",
    otherAccDescr: "T %%{x}%%",
  },
  {
    name: "two directives after the text of an accessibility line and spaces",
    written: "T  %%{x}%%  %%{y}%%  ",
    langium: "T %%{x}%% %%{y}%%",
    otherAccTitle: "T %%{x}%% %%{y}%%",
    otherAccDescr: "T %%{x}%% %%{y}%%",
  },
  {
    name: "two directives after the text of an accessibility line",
    written: "T  %%{x}%%  %%{y}%%",
    langium: "T %%{x}%% %%{y}%%",
    otherAccTitle: "T %%{x}%% %%{y}%%",
    otherAccDescr: "T %%{x}%% %%{y}%%",
  },
  {
    name: "two directives touching after the text of an accessibility line and spaces",
    written: "T%%{x}%%%%{y}%%  ",
    langium: "T%%{x}%%%%{y}%%",
    otherAccTitle: "T%%{x}%%%%{y}%%",
    otherAccDescr: "T%%{x}%%%%{y}%%",
  },
  {
    name: "a comment touching the text of an accessibility line",
    written: "T%% c",
  },
  {
    name: "a comment and then a directive after the text of an accessibility line",
    written: "T %% c %%{x}%%",
  },
  {
    name: "a no-break space between a directive and a comment after the text of an accessibility line",
    written: "T %%{x}%%\u00a0%% c",
  },
  {
    name: "two directives and a comment after the text of an accessibility line",
    written: "T  %%{x}%%  %%{y}%%  %% c",
    langium: "T %%{x}%% %%{y}%% %% c",
  },
  {
    name: "a tab before a comment after the text of an accessibility line",
    written: "T\t%% c",
    langium: "T %% c",
    otherAccDescr: "T %% c",
  },
  {
    name: "U+3000 before a comment after the text of an accessibility line",
    written: "T\u3000%% c",
    langium: "T %% c",
  },
  {
    name: "U+2028 at the end of an accessibility line",
    written: "T\u2028",
    langium: "T",
    otherAccTitle: "T",
    otherAccDescr: "T",
  },
  {
    name: "spaces and U+2028 at the end of an accessibility line",
    written: "T  \u2028",
    langium: "T",
    otherAccTitle: "T",
    otherAccDescr: "T",
  },
  {
    name: "U+2029 at the end of an accessibility line",
    written: "T\u2029",
    langium: "T",
    otherAccTitle: "T",
    otherAccDescr: "T",
  },
  {
    name: "a directive and a comment only as an accessibility line",
    written: "%%{x}%%  %% c  ",
    otherAccTitle: "%%{x}%%%% c",
    otherAccDescr: "%%{x}%%%% c",
  },
  {
    name: "a no-break space between a directive and a comment only as an accessibility line",
    written: "%%{x}%%\u00a0%% c",
    otherAccTitle: "%%{x}%%%% c",
    otherAccDescr: "%%{x}%%%% c",
  },
  {
    name: "U+3000 between a directive and a comment only as an accessibility line",
    written: "%%{x}%%\u3000%% c",
    otherAccTitle: "%%{x}%%%% c",
    otherAccDescr: "%%{x}%%%% c",
  },
  {
    name: "U+2003 between a directive and a comment only as an accessibility line",
    written: "%%{x}%%\u2003%% c",
    otherAccTitle: "%%{x}%%%% c",
    otherAccDescr: "%%{x}%%%% c",
  },
  {
    name: "a tab between a directive and a comment only as an accessibility line",
    written: "%%{x}%%\t%% c",
    otherAccTitle: "%%{x}%%%% c",
    otherAccDescr: "%%{x}%%%% c",
  },
  {
    name: "U+2028 and then spaces at the end of an accessibility line",
    written: "T\u2028  ",
    langium: "T",
    otherAccTitle: "T",
    otherAccDescr: "T",
  },
  {
    name: "U+2028 at the start of an accessibility line",
    written: "\u2028T",
    langium: "T",
  },
  {
    name: "U+2029 at the start of an accessibility line",
    written: "\u2029T",
    langium: "T",
  },
]

/** The types that have the lines: a Venn diagram has none. */
const accessibilityLineTypes = titleTypes
  .filter(({ name }) => name !== "a Venn diagram")
  .map(({ name, group, input, output }) => ({
    name,
    isLangium: group === "langium",
    input: input.replace("title {title}", "{line} {title}"),
    output: output.replace("title {title}", "{line} {title}"),
  }))

const accessibilityLines = ["accTitle:", "accDescr:"] as const

/** What a type prints for a line: the Langium types as one group, the others as the second. */
function printedLine(
  row: AccessibilityDirectiveCase,
  isLangium: boolean,
  line: (typeof accessibilityLines)[number],
): string {
  if (isLangium) return row.langium ?? row.written
  const printed = line === "accTitle:" ? row.otherAccTitle : row.otherAccDescr
  return printed ?? row.written
}

describe.each(accessibilityLines)("the %s line", (line) => {
  describe.each(
    accessibilityLineTypes.filter(({ name }) =>
      ["a radar chart", "a Gantt chart", "a C4 diagram"].includes(name),
    ),
  )(
    "of $name with a directive or a comment",
    ({ isLangium, input, output }) => {
      it.each(accessibilityDirectiveCases)("prints $name", async (row) => {
        await expectKept(
          input.replace("{line}", line).replace("{title}", row.written),
          output
            .replace("{line}", line)
            .replace("{title}", printedLine(row, isLangium, line)),
        )
      })
    },
  )

  describe.each(accessibilityLineTypes)(
    "of $name",
    ({ isLangium, input, output }) => {
      it.each(
        accessibilityDirectiveCases.filter(
          ({ name }) =>
            name ===
              "a no-break space after the last directive of an accessibility line" ||
            name ===
              "a no-break space after a directive that starts an accessibility line and before another directive",
        ),
      )("prints $name as its group does", async (row) => {
        await expectKept(
          input.replace("{line}", line).replace("{title}", row.written),
          output
            .replace("{line}", line)
            .replace("{title}", printedLine(row, isLangium, line)),
        )
      })
    },
  )
})

/**
 * The accTitle line of a pie chart and of a gitGraph keeps the whitespace
 * before a comment, in the rows of the first table with a comment after the
 * text or after a directive (docs/pie.md, Accessibility lines).
 */
const accessibilityCommentRows = [
  "a comment and spaces after a directive that ends a title",
  "a no-break space before a comment after the text of a title",
  "runs and spaces around a comment after the text of a title",
  "a no-break space before a directive and a comment after the text of a title",
  "two directives and a comment after the text of a title",
  "a tab before a comment after the text of a title",
  "U+3000 before a comment after the text of a title",
  "U+2003 before a comment after the text of a title",
  "a vertical tab before a comment after the text of a title",
  "a form feed before a comment after the text of a title",
  "U+FEFF before a comment after the text of a title",
]

describe.each(
  titleTypes
    .filter(({ name }) => ["a pie chart", "a gitGraph"].includes(name))
    .map(({ name, input, output }) => ({
      name,
      input: input.replace("title {title}", "accTitle: {title}"),
      output: output.replace("title {title}", "accTitle: {title}"),
    })),
)("the accTitle line of $name with a comment", ({ input, output }) => {
  it.each(
    titleDirectiveCases.filter(({ name }) =>
      accessibilityCommentRows.includes(name),
    ),
  )("keeps $name", async (row) => {
    await expectKept(
      input.replace("{title}", row.written),
      output.replace("{title}", row.written),
    )
  })
})

describe("the accDescription of a C4 diagram with a directive or a comment", () => {
  it.each(titleDirectiveCases)("prints $name", async (row) => {
    await expectKept(
      `C4Context\naccDescription ${row.written}\nPerson(a,"A")\n`,
      `C4Context\n  accDescription ${printedTitle(row, "vennAndC4")}\n  Person(a, "A")\n`,
    )
  })
})

/**
 * The whitespace characters that are no space or tab and no line terminator
 * (docs/compatibility.md, Texts after a keyword that are drawn the same): the
 * characters that `String.prototype.trim` removes, but for U+2028 and U+2029.
 */
const whitespaceThatIsNoSpaceOrTab: readonly string[] = [
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
  "\u202f",
  "\u205f",
  "\u3000",
  "\ufeff",
]

/** The title type of the diagram type that the first table of the document names. */
function titleTypeNamed(name: string): TitleType {
  const found = titleTypes.find((type) => type.name === name)
  if (found === undefined) throw new Error(`no type ${name}`)
  return found
}

describe("a whitespace character that is no space or tab beside the text of a title", () => {
  it("a whitespace character that is no space or tab at both ends of a title, in the Langium types and a quadrant chart", async () => {
    for (const name of ["a radar chart", "a pie chart", "a quadrant chart"]) {
      const { input, output } = titleTypeNamed(name)
      for (const character of whitespaceThatIsNoSpaceOrTab) {
        await expectKept(
          input.replace("{title}", `${character}T${character}`),
          output.replace("{title}", "T"),
        )
      }
    }
  })

  it("a whitespace character that is no space or tab before a comment after the text of a title, in each group", async () => {
    for (const name of [
      "a radar chart",
      "a quadrant chart",
      "a Gantt chart",
      "a Venn diagram",
      "a C4 diagram",
    ]) {
      const { group, input, output } = titleTypeNamed(name)
      for (const character of whitespaceThatIsNoSpaceOrTab) {
        const written = `T${character}%% c`
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", group === "langium" ? "T %% c" : written),
        )
      }
    }
  })

  it("a whitespace character that is no space or tab before a comment after the text of an accessibility line, in each group", async () => {
    for (const line of accessibilityLines) {
      for (const name of [
        "a radar chart",
        "a quadrant chart",
        "a Gantt chart",
        "a C4 diagram",
      ]) {
        const { isLangium, input, output } = accessibilityLineTypes.find(
          (type) => type.name === name,
        )!
        for (const character of whitespaceThatIsNoSpaceOrTab) {
          const written = `T${character}%% c`
          await expectKept(
            input.replace("{line}", line).replace("{title}", written),
            output
              .replace("{line}", line)
              .replace("{title}", isLangium ? "T %% c" : written),
          )
        }
      }
    }
  })
})

describe("an accessibility line of directives only", () => {
  it("an accessibility line of directives only stays as written in each type of the Langium grammar", async () => {
    for (const type of accessibilityLineTypes.filter(
      ({ isLangium }) => isLangium,
    )) {
      for (const line of accessibilityLines) {
        await expectKept(
          type.input.replace("{line}", line).replace("{title}", "%%{x}%%  "),
          type.output.replace("{line}", line).replace("{title}", "%%{x}%%  "),
        )
      }
    }
  })

  it("an accessibility line of directives and a comment with no text stays as written in each type of the Langium grammar", async () => {
    for (const type of accessibilityLineTypes.filter(
      ({ isLangium }) => isLangium,
    )) {
      for (const line of accessibilityLines) {
        await expectKept(
          type.input
            .replace("{line}", line)
            .replace("{title}", "%%{x}%%  %% c  "),
          type.output
            .replace("{line}", line)
            .replace("{title}", "%%{x}%%  %% c  "),
        )
      }
    }
  })
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

/**
 * The spaces and tabs before the first colon of a task of a user journey are
 * left out; a task with another whitespace character among them stays as
 * written (docs/compatibility.md, Texts after a keyword that are drawn the
 * same).
 */
const journeyTaskColonExamples: readonly (readonly [string, string, string])[] =
  [
    [
      "a no-break space before the first colon of a task of a user journey",
      "journey\nsection S\nMake tea\u00a0: 5: Me\n",
      "journey\n  section S\n    Make tea\u00a0: 5: Me\n",
    ],
    [
      "a tab, a no-break space, and a space before the first colon of a task of a user journey",
      "journey\nsection S\nMake tea\t\u00a0 : 5: Me\n",
      "journey\n  section S\n    Make tea\t\u00a0 : 5: Me\n",
    ],
  ]

describe("the whitespace before the first colon of a task of a user journey", () => {
  it.each(journeyTaskColonExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

/**
 * A C4 diagram reads the line after an `accTitle:` or `accDescr:` line of
 * directives only as its value, and the printer puts it one level deeper as
 * written (docs/compatibility.md, Texts after a keyword that are drawn the
 * same).
 */
const c4DirectivesOnlyExamples: readonly (readonly [string, string, string])[] =
  [
    [
      "the accTitle line of directives only of a C4 diagram",
      'C4Context\naccTitle: %%{x}%%\nPerson(a,"A")\n',
      'C4Context\n  accTitle: %%{x}%%\n    Person(a,"A")\n',
    ],
    [
      "the accDescr line of directives only of a C4 diagram",
      'C4Context\naccDescr: %%{x}%%\nPerson(a,"A")\n',
      'C4Context\n  accDescr: %%{x}%%\n    Person(a,"A")\n',
    ],
  ]

describe("an accessibility line of directives only of a C4 diagram", () => {
  it.each(c4DirectivesOnlyExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})

/**
 * The whitespace characters of the specification that are no space, tab, or
 * line terminator: the 19 of the list above and the two line separators
 * (docs/compatibility.md, Texts after a keyword that are drawn the same).
 */
const whitespaceThatIsNoSpaceOrTabWithLineSeparators: readonly string[] = [
  ...whitespaceThatIsNoSpaceOrTab,
  "\u2028",
  "\u2029",
]

/** The type of a group that the tests below run, by name. */
function titleTypesNamed(names: readonly string[]): readonly TitleType[] {
  return names.map(titleTypeNamed)
}

const titleTypesOfEachGroup = titleTypesNamed([
  "a radar chart",
  "a quadrant chart",
  "a Gantt chart",
  "a Venn diagram",
  "a C4 diagram",
])

describe("a whitespace character that is no space or tab at the start, at the end, and before a directive of a title", () => {
  it("a whitespace character that is no space or tab before the first directive of a title of directives only, in each group", async () => {
    for (const { group, input, output } of titleTypesOfEachGroup) {
      const droppedHere = group === "langium" || group === "quadrant"
      for (const character of whitespaceThatIsNoSpaceOrTabWithLineSeparators) {
        const written = `${character}%%{x}%%`
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", droppedHere ? "%%{x}%%" : written),
        )
      }
    }
  })

  it("a whitespace character that is no space or tab at the start of a title, in each group", async () => {
    for (const { group, input, output } of titleTypesOfEachGroup) {
      for (const character of whitespaceThatIsNoSpaceOrTabWithLineSeparators) {
        const written = `${character}T`
        const keptHere =
          group === "gantt" ||
          group === "vennAndC4" ||
          (group === "quadrant" && ["\u2028", "\u2029"].includes(character))
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", keptHere ? written : "T"),
        )
      }
    }
  })

  it("a whitespace character that is no space or tab at the end of a title, in each group", async () => {
    for (const { group, input, output } of titleTypesOfEachGroup) {
      for (const character of whitespaceThatIsNoSpaceOrTabWithLineSeparators) {
        const written = `T${character}`
        const keptHere = group === "gantt" || group === "vennAndC4"
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", keptHere ? written : "T"),
        )
      }
    }
  })

  it("a whitespace character that is no space or tab before a directive that starts a title and text after it, in each group", async () => {
    for (const { group, input, output } of titleTypesOfEachGroup) {
      for (const character of whitespaceThatIsNoSpaceOrTabWithLineSeparators) {
        const written = `${character}%%{x}%% T`
        const droppedHere =
          group === "quadrant" && !["\u2028", "\u2029"].includes(character)
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", droppedHere ? "%%{x}%%T" : written),
        )
      }
    }
  })

  it("a whitespace character that is no space or tab at the start and at the end of an accessibility line, in each group", async () => {
    for (const line of accessibilityLines) {
      for (const name of [
        "a radar chart",
        "a quadrant chart",
        "a Gantt chart",
        "a C4 diagram",
      ]) {
        const { isLangium, input, output } = accessibilityLineTypes.find(
          (type) => type.name === name,
        )!
        for (const character of whitespaceThatIsNoSpaceOrTabWithLineSeparators) {
          const atStart = `${character}T`
          const startKept =
            !isLangium && ["\u2028", "\u2029"].includes(character)
          await expectKept(
            input.replace("{line}", line).replace("{title}", atStart),
            output
              .replace("{line}", line)
              .replace("{title}", startKept ? atStart : "T"),
          )
          await expectKept(
            input.replace("{line}", line).replace("{title}", `T${character}`),
            output.replace("{line}", line).replace("{title}", "T"),
          )
        }
      }
    }
  })
})

describe("a whitespace character that is no space or tab before the first directive of a title of a directive and a comment only", () => {
  it("a whitespace character that is no space or tab before the directive of a title of a directive and a comment only, in each group", async () => {
    for (const { group, input, output } of titleTypesOfEachGroup) {
      for (const character of whitespaceThatIsNoSpaceOrTab) {
        const written = `${character}%%{x}%%%% c`
        const droppedHere = group === "langium" || group === "quadrant"
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", droppedHere ? "%%{x}%%%% c" : written),
        )
      }
    }
  })

  it("a whitespace character that is no space or tab before the directive of a title of a directive and a comment only, with spaces around the comment, in each group", async () => {
    for (const { group, input, output } of titleTypesOfEachGroup) {
      for (const character of whitespaceThatIsNoSpaceOrTab) {
        const written = `${character}%%{x}%%  %% c  `
        let printed = written
        if (group === "quadrant") printed = "%%{x}%%%% c"
        if (group === "gantt") printed = `${character}%%{x}%%  %% c`
        await expectKept(
          input.replace("{title}", written),
          output.replace("{title}", printed),
        )
      }
    }
  })
})

/** What a last directive that holds a line break or a `;` leaves of the spaces after it (docs/compatibility.md, Texts after a keyword that are drawn the same). */
describe("a last directive that holds a line break", () => {
  it("a title whose last directive holds a line break, with spaces after it, in each type", async () => {
    for (const { name, input, output } of titleTypes) {
      const written = "T  %%{init: {\n}}%%  "
      const printed = ["a quadrant chart", "a Venn diagram"].includes(name)
        ? "T %%{init: {\n}}%%"
        : written
      expect(await formatMermaid(input.replace("{title}", written))).toBe(
        output.replace("{title}", printed),
      )
    }
  })

  it("a card of a kanban board and a node of a mindmap whose last directive holds a line break, with spaces after it", async () => {
    const written = "%%{init: {\n}}%%  "
    for (const [input, output] of [
      [
        `kanban\n  S\n    A[x] ${written}\n`,
        `kanban\n  S\n    A[x] ${written}\n`,
      ],
      [
        `mindmap\n  root\n    a ${written}\n`,
        `mindmap\n  root\n    a ${written}\n`,
      ],
      [
        `mindmap\n  root\n    a[t] ${written}\n`,
        "mindmap\n  root\n    a[t] %%{init: {\n}}%%\n",
      ],
    ])
      expect(await formatMermaid(input)).toBe(output)
  })

  it("a title whose last directive holds a semicolon, with spaces after it, in each group", async () => {
    for (const { group, input, output } of titleTypesOfEachGroup) {
      const written = "T  %%{init: {a;b}}%%  "
      const printed = group === "langium" ? written : "T %%{init: {a;b}}%%"
      await expectKept(
        input.replace("{title}", written),
        output.replace("{title}", printed),
      )
    }
  })
})

/**
 * What a directive of the line that holds a line break, a `;`, both, or a
 * U+2028 leaves of the spaces around the directives, for each text of the list
 * in docs/compatibility.md, Directives that hold a line break or a semicolon:
 * the line as written (`written`), as without such a directive (`without`),
 * as written without the spaces and tabs at its end (`trimmed`), a form of its
 * own, or `null` for a form that no row states.
 */
const directiveHoldingColumns = [
  ["T  {d}", "%%{init: {\n}}%%", 0],
  ["T  {d}", "%%{init: {a;b}}%%", 0],
  ["T  {d}", "%%{init: {\u2028}}%%", 0],
  ["T  {d}  ", "%%{init: {\n}}%%", 1],
  ["T  {d}  ", "%%{init: {a;b}}%%", 1],
  ["T  {d}  ", "%%{init: {a;\nb}}%%", 1],
  ["T  {d}  ", "%%{init: {\u2028}}%%", 1],
  ["{d}  T  ", "%%{init: {\n}}%%", 2],
  ["{d}  T  ", "%%{init: {a;b}}%%", 2],
  ["{d}  T  ", "%%{init: {a;\nb}}%%", 2],
  ["T  {d}  %% c  ", "%%{init: {\n}}%%", 3],
  ["T  {d}  %% c  ", "%%{init: {a;b}}%%", 3],
  ["T  {d}%% c", "%%{init: {\n}}%%", 4],
  ["T  {d}%% c", "%%{init: {a;b}}%%", 4],
  ["{d}T  ", "%%{init: {a;b}}%%", 5],
  ["{d}T  ", "%%{init: {a;\nb}}%%", 5],
] as const

const directiveHoldingRows: readonly (readonly (string | null)[])[] = [
  [
    "without",
    "without",
    "written",
    "written",
    "written",
    "written",
    "written",
    "without",
    "without",
    "without",
    "written",
    "written",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "written",
    "written",
    "written",
    "written",
    "written",
    "written",
    "without",
    "L:%%{init: {a;b}}%% T",
    "L:%%{init: {a;\nb}}%% T",
    "written",
    "written",
    "without",
    "written",
    "L:%%{init: {a;b}}%% T",
    "L:%%{init: {a;\nb}}%% T",
  ],
  [
    "without",
    "written",
    "written",
    "written",
    "written",
    "written",
    "written",
    "without",
    "without",
    "without",
    "written",
    "written",
    "without",
    "written",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "written",
    "without",
    "without",
    "without",
    "trimmed",
    "trimmed",
    "without",
    "trimmed",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "written",
    "without",
    "without",
    "without",
    "trimmed",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "written",
    "written",
    "without",
    "written",
    "trimmed",
    "written",
    "without",
    "written",
    "written",
    "without",
    "without",
    "without",
    "without",
    "written",
  ],
  [
    "without",
    "without",
    "written",
    "without",
    "without",
    "without",
    "written",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "written",
    "written",
    "without",
    "written",
    "written",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "rejected",
    "without",
    "without",
    "without",
    "rejected",
    "without",
    "without",
    "without",
    "without",
    "L:%%{init: {a;b}}%% %% c",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "written",
    null,
    null,
    null,
    null,
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "written",
    null,
    null,
    null,
    null,
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "rejected",
    "written",
    "written",
    "written",
    "rejected",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "written",
    "written",
    "rejected",
    "written",
    "written",
    "written",
    "rejected",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "written",
    "without",
    "written",
    "written",
    "written",
    "without",
    "written",
    "written",
    "without",
    "trimmed",
    "without",
    "without",
    "written",
    "written",
  ],
  [
    "without",
    "without",
    "rejected",
    "written",
    "written",
    "written",
    "rejected",
    "written",
    "written",
    "written",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
  ],
  [
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    "without",
    null,
    null,
    null,
    null,
    "without",
    "without",
  ],
]

const directiveHoldingKinds: readonly (readonly [
  string,
  number,
  boolean,
  string,
  string,
  string,
  string,
  readonly [string, string, string, string, string, string],
])[] = [
  [
    "the title of a pie chart with a directive that holds a line break or a semicolon",
    0,
    false,
    'pie\ntitle {line}\n"a": 1\n',
    'pie\n  title {line}\n  "a": 1\n',
    'pie\n  title {line}\n  "a": 1\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a pie chart with a directive that holds a line break or a semicolon",
    0,
    false,
    'pie\naccTitle: {line}\n"a": 1\n',
    'pie\n  accTitle: {line}\n  "a": 1\n',
    'pie\n  accTitle: {line}\n  "a": 1\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T  %%{x}%%  %% c  ",
      "T  %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a pie chart with a directive that holds a line break or a semicolon",
    0,
    false,
    'pie\naccDescr: {line}\n"a": 1\n',
    'pie\n  accDescr: {line}\n  "a": 1\n',
    'pie\n  accDescr: {line}\n  "a": 1\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a radar chart with a directive that holds a line break or a semicolon",
    0,
    false,
    "radar-beta\ntitle {line}\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  title {line}\n  axis a, b\n  curve c{1, 2}\n",
    "radar-beta\n  title {line}\n  axis a, b\n  curve c{1, 2}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a radar chart with a directive that holds a line break or a semicolon",
    0,
    false,
    "radar-beta\naccTitle: {line}\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  accTitle: {line}\n  axis a, b\n  curve c{1, 2}\n",
    "radar-beta\n  accTitle: {line}\n  axis a, b\n  curve c{1, 2}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a radar chart with a directive that holds a line break or a semicolon",
    0,
    false,
    "radar-beta\naccDescr: {line}\naxis a, b\ncurve c{1, 2}\n",
    "radar-beta\n  accDescr: {line}\n  axis a, b\n  curve c{1, 2}\n",
    "radar-beta\n  accDescr: {line}\n  axis a, b\n  curve c{1, 2}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a packet diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    'packet-beta\ntitle {line}\n0-7: "x"\n',
    'packet-beta\n  title {line}\n  0-7: "x"\n',
    'packet-beta\n  title {line}\n  0-7: "x"\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a packet diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    'packet-beta\naccTitle: {line}\n0-7: "x"\n',
    'packet-beta\n  accTitle: {line}\n  0-7: "x"\n',
    'packet-beta\n  accTitle: {line}\n  0-7: "x"\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a packet diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    'packet-beta\naccDescr: {line}\n0-7: "x"\n',
    'packet-beta\n  accDescr: {line}\n  0-7: "x"\n',
    'packet-beta\n  accDescr: {line}\n  0-7: "x"\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of an architecture diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "architecture-beta\ntitle {line}\nservice a(server)[A]\n",
    "architecture-beta\n  title {line}\n  service a(server)[A]\n",
    "architecture-beta\n  title {line}\n  service a(server)[A]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of an architecture diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "architecture-beta\naccTitle: {line}\nservice a(server)[A]\n",
    "architecture-beta\n  accTitle: {line}\n  service a(server)[A]\n",
    "architecture-beta\n  accTitle: {line}\n  service a(server)[A]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of an architecture diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "architecture-beta\naccDescr: {line}\nservice a(server)[A]\n",
    "architecture-beta\n  accDescr: {line}\n  service a(server)[A]\n",
    "architecture-beta\n  accDescr: {line}\n  service a(server)[A]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a gitGraph with a directive that holds a line break or a semicolon",
    0,
    false,
    "gitGraph\ntitle {line}\ncommit\n",
    "gitGraph\n  title {line}\n  commit\n",
    "gitGraph\n  title {line}\n  commit\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a gitGraph with a directive that holds a line break or a semicolon",
    0,
    false,
    "gitGraph\naccTitle: {line}\ncommit\n",
    "gitGraph\n  accTitle: {line}\n  commit\n",
    "gitGraph\n  accTitle: {line}\n  commit\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T  %%{x}%%  %% c  ",
      "T  %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a gitGraph with a directive that holds a line break or a semicolon",
    0,
    false,
    "gitGraph\naccDescr: {line}\ncommit\n",
    "gitGraph\n  accDescr: {line}\n  commit\n",
    "gitGraph\n  accDescr: {line}\n  commit\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a cynefin diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "cynefin-beta\ntitle {line}\n",
    "cynefin-beta\n  title {line}\n",
    "cynefin-beta\n  title {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a cynefin diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "cynefin-beta\naccTitle: {line}\n",
    "cynefin-beta\n  accTitle: {line}\n",
    "cynefin-beta\n  accTitle: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a cynefin diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "cynefin-beta\naccDescr: {line}\n",
    "cynefin-beta\n  accDescr: {line}\n",
    "cynefin-beta\n  accDescr: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a treemap with a directive that holds a line break or a semicolon",
    0,
    false,
    'treemap-beta\ntitle {line}\n"A": 1\n',
    'treemap\ntitle {line}\n  "A": 1\n',
    'treemap\ntitle {line}\n  "A": 1\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a treemap with a directive that holds a line break or a semicolon",
    0,
    false,
    'treemap-beta\naccTitle: {line}\n"A": 1\n',
    'treemap\naccTitle: {line}\n  "A": 1\n',
    'treemap\naccTitle: {line}\n  "A": 1\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a treemap with a directive that holds a line break or a semicolon",
    0,
    false,
    'treemap-beta\naccDescr: {line}\n"A": 1\n',
    'treemap\naccDescr: {line}\n  "A": 1\n',
    'treemap\naccDescr: {line}\n  "A": 1\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a treeView with a directive that holds a line break or a semicolon",
    0,
    false,
    "treeView-beta\ntitle {line}\nroot\n",
    "treeView-beta\n  title {line}\n  root\n",
    "treeView-beta\n  title {line}\n  root\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a treeView with a directive that holds a line break or a semicolon",
    0,
    false,
    "treeView-beta\naccTitle: {line}\nroot\n",
    "treeView-beta\n  accTitle: {line}\n  root\n",
    "treeView-beta\n  accTitle: {line}\n  root\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a treeView with a directive that holds a line break or a semicolon",
    0,
    false,
    "treeView-beta\naccDescr: {line}\nroot\n",
    "treeView-beta\n  accDescr: {line}\n  root\n",
    "treeView-beta\n  accDescr: {line}\n  root\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of an info diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "info\ntitle {line}\n",
    "info\n  title {line}\n",
    "info\n  title {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of an info diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "info\naccTitle: {line}\n",
    "info\n  accTitle: {line}\n",
    "info\n  accTitle: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of an info diagram with a directive that holds a line break or a semicolon",
    0,
    false,
    "info\naccDescr: {line}\n",
    "info\n  accDescr: {line}\n",
    "info\n  accDescr: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a Wardley map with a directive that holds a line break or a semicolon",
    1,
    false,
    "wardley-beta\ntitle {line}\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title {line}\n  component A [0.5, 0.5]\n",
    "wardley-beta\n  title {line}\n  component A [0.5, 0.5]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the title of a railroad diagram with a directive that holds a line break or a semicolon",
    1,
    false,
    'railroad-abnf-beta\ntitle {line}\nr="a";\n',
    'railroad-abnf-beta\n  title {line}\n  r = "a";\n',
    'railroad-abnf-beta\n  title {line}\n  r = "a";\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a Wardley map with a directive that holds a line break or a semicolon",
    2,
    false,
    "wardley-beta\naccTitle: {line}\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  accTitle: {line}\n  component A [0.5, 0.5]\n",
    "wardley-beta\n  accTitle: {line}\n  component A [0.5, 0.5]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a Wardley map with a directive that holds a line break or a semicolon",
    2,
    false,
    "wardley-beta\naccDescr: {line}\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  accDescr: {line}\n  component A [0.5, 0.5]\n",
    "wardley-beta\n  accDescr: {line}\n  component A [0.5, 0.5]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accTitle: of a railroad diagram with a directive that holds a line break or a semicolon",
    2,
    false,
    'railroad-abnf-beta\naccTitle: {line}\nr="a";\n',
    'railroad-abnf-beta\n  accTitle: {line}\n  r = "a";\n',
    'railroad-abnf-beta\n  accTitle: {line}\n  r = "a";\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescr: of a railroad diagram with a directive that holds a line break or a semicolon",
    2,
    false,
    'railroad-abnf-beta\naccDescr: {line}\nr="a";\n',
    'railroad-abnf-beta\n  accDescr: {line}\n  r = "a";\n',
    'railroad-abnf-beta\n  accDescr: {line}\n  r = "a";\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a quadrant chart with a directive that holds a line break or a semicolon",
    3,
    false,
    "quadrantChart\ntitle {line}\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    "quadrantChart\n  title {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the description of a task of a user journey with a directive that holds a line break or a semicolon",
    15,
    false,
    "journey\nsection s\n{line}\n",
    "journey\n  section s\n    {line}\n",
    "journey\n  section s\n    {line}\n",
    " : 5: Me",
    [
      "T  %%{x}%% : 5: Me",
      "T  %%{x}%%   : 5: Me",
      "%%{x}%% T   : 5: Me",
      "T  %%{x}%%  %% c   : 5: Me",
      "T  %%{x}%%%% c : 5: Me",
      "%%{x}%%T   : 5: Me",
    ],
  ],
  [
    "the accTitle: of a quadrant chart with a directive that holds a line break or a semicolon",
    4,
    false,
    "quadrantChart\naccTitle: {line}\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  accTitle: {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    "quadrantChart\n  accTitle: {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accDescr: of a quadrant chart with a directive that holds a line break or a semicolon",
    4,
    false,
    "quadrantChart\naccDescr: {line}\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  accDescr: {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    "quadrantChart\n  accDescr: {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a Gantt chart with a directive that holds a line break or a semicolon",
    4,
    false,
    "gantt\naccTitle: {line}\n",
    "gantt\n  accTitle: {line}\n",
    "gantt\n  accTitle: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accDescr: of a Gantt chart with a directive that holds a line break or a semicolon",
    4,
    false,
    "gantt\naccDescr: {line}\n",
    "gantt\n  accDescr: {line}\n",
    "gantt\n  accDescr: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a user journey with a directive that holds a line break or a semicolon",
    4,
    false,
    "journey\naccTitle: {line}\n",
    "journey\n  accTitle: {line}\n",
    "journey\n  accTitle: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accDescr: of a user journey with a directive that holds a line break or a semicolon",
    4,
    false,
    "journey\naccDescr: {line}\n",
    "journey\n  accDescr: {line}\n",
    "journey\n  accDescr: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a timeline with a directive that holds a line break or a semicolon",
    4,
    false,
    "timeline\naccTitle: {line}\n",
    "timeline\n  accTitle: {line}\n",
    "timeline\n  accTitle: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accDescr: of a timeline with a directive that holds a line break or a semicolon",
    4,
    false,
    "timeline\naccDescr: {line}\n",
    "timeline\n  accDescr: {line}\n",
    "timeline\n  accDescr: {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a sequence diagram with a directive that holds a line break or a semicolon",
    4,
    false,
    "sequenceDiagram\naccTitle: {line}\nA->>B: x\n",
    "sequenceDiagram\n  accTitle: {line}\n  A ->> B: x\n",
    "sequenceDiagram\n  accTitle: {line}\n  A ->> B: x\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accDescr: of a sequence diagram with a directive that holds a line break or a semicolon",
    4,
    false,
    "sequenceDiagram\naccDescr: {line}\nA->>B: x\n",
    "sequenceDiagram\n  accDescr: {line}\n  A ->> B: x\n",
    "sequenceDiagram\n  accDescr: {line}\n  A ->> B: x\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accTitle: of a C4 diagram with a directive that holds a line break or a semicolon",
    4,
    false,
    'C4Context\naccTitle: {line}\nPerson(a,"A")\n',
    'C4Context\n  accTitle: {line}\n  Person(a, "A")\n',
    'C4Context\n  accTitle: {line}\n  Person(a, "A")\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accDescr: of a C4 diagram with a directive that holds a line break or a semicolon",
    4,
    false,
    'C4Context\naccDescr: {line}\nPerson(a,"A")\n',
    'C4Context\n  accDescr: {line}\n  Person(a, "A")\n',
    'C4Context\n  accDescr: {line}\n  Person(a, "A")\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "a last event of a timeline with a directive that holds a line break or a semicolon",
    4,
    false,
    "timeline\n2020 : {line}\n",
    "timeline\n  2020 : {line}\n",
    "timeline\n  2020 : {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the title of a Gantt chart with a directive that holds a line break or a semicolon",
    5,
    false,
    "gantt\ntitle {line}\n",
    "gantt\n  title {line}\n",
    "gantt\n  title {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the title of a user journey with a directive that holds a line break or a semicolon",
    5,
    false,
    "journey\ntitle {line}\n",
    "journey\n  title {line}\n",
    "journey\n  title {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the title of a timeline with a directive that holds a line break or a semicolon",
    5,
    false,
    "timeline\ntitle {line}\n",
    "timeline\n  title {line}\n",
    "timeline\n  title {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the title of a sequence diagram with a directive that holds a line break or a semicolon",
    5,
    false,
    "sequenceDiagram\ntitle {line}\nA->>B: x\n",
    "sequenceDiagram\n  title {line}\n  A ->> B: x\n",
    "sequenceDiagram\n  title {line}\n  A ->> B: x\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the date format of a Gantt chart with a directive that holds a line break or a semicolon",
    5,
    false,
    "gantt\ndateFormat {line}\n",
    "gantt\n  dateFormat {line}\n",
    "gantt\n  dateFormat {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the axis format of a Gantt chart with a directive that holds a line break or a semicolon",
    5,
    false,
    "gantt\naxisFormat {line}\n",
    "gantt\n  axisFormat {line}\n",
    "gantt\n  axisFormat {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the title of a Venn diagram with a directive that holds a line break or a semicolon",
    6,
    false,
    "venn-beta\ntitle {line}\nset A\n",
    "venn-beta\n  title {line}\n  set A\n",
    "venn-beta\n  title {line}\n  set A\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T  %%{x}%%  %% c  ",
      "T  %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the title of a C4 diagram with a directive that holds a line break or a semicolon",
    7,
    false,
    'C4Context\ntitle {line}\nPerson(a,"A")\n',
    'C4Context\n  title {line}\n  Person(a, "A")\n',
    'C4Context\n  title {line}\n  Person(a, "A")\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T  %%{x}%%  %% c  ",
      "T  %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the accDescription of a C4 diagram with a directive that holds a line break or a semicolon",
    7,
    false,
    'C4Context\naccDescription {line}\nPerson(a,"A")\n',
    'C4Context\n  accDescription {line}\n  Person(a, "A")\n',
    'C4Context\n  accDescription {line}\n  Person(a, "A")\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T  %%{x}%%  %% c  ",
      "T  %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "a node of a mindmap after a shape, the directive alone with a directive that holds a line break or a semicolon",
    8,
    true,
    "mindmap\n  root\n    a[t] {line}\n",
    "mindmap\n  root\n    a[t] {line}\n",
    "mindmap\n  root\n    a[t] {line}\n",
    "",
    [
      "%%{x}%%",
      "%%{x}%%",
      "%%{x}%%",
      "%%{x}%% %% c  ",
      "%%{x}%%%% c",
      "%%{x}%%",
    ],
  ],
  [
    "the accTitle: of a use case diagram with a directive that holds a line break or a semicolon",
    9,
    false,
    "usecase-beta\naccTitle: {line}\nactor a\n",
    "usecase-beta\n  accTitle: {line}\n  actor a\n",
    "usecase-beta\n  accTitle: {line}\n  actor a\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the accDescr: of a use case diagram with a directive that holds a line break or a semicolon",
    9,
    false,
    "usecase-beta\naccDescr: {line}\nactor a\n",
    "usecase-beta\n  accDescr: {line}\n  actor a\n",
    "usecase-beta\n  accDescr: {line}\n  actor a\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the text of an ishikawa literal with a directive that holds a line break or a semicolon",
    10,
    false,
    "ishikawa\n  R\n    {line}\n",
    "ishikawa\n  R\n    {line}\n",
    "ishikawa\n  R\n  {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the text of a treeView node with a directive that holds a line break or a semicolon",
    10,
    false,
    "treeView-beta\nR\n  {line}\n",
    "treeView-beta\n  R\n    {line}\n",
    "treeView-beta\n  R\n  {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T",
      "T  %%{x}%%  %% c",
      "T  %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "the text of a mindmap node with a directive that holds a line break or a semicolon",
    11,
    false,
    "mindmap\n  root\n    {line}\n",
    "mindmap\n  root\n    {line}\n",
    "mindmap\n  root\n    {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T  %%{x}%%  %% c  ",
      "T  %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the text of a kanban card with a directive that holds a line break or a semicolon",
    12,
    false,
    "kanban\n  S\n    {line}\n",
    "kanban\n  S\n    {line}\n",
    "kanban\n  S\n  {line}\n",
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T  ",
      "T  %%{x}%%  %% c  ",
      "T  %%{x}%%%% c",
      "%%{x}%%T  ",
    ],
  ],
  [
    "the second description of a state alias with a directive that holds a line break or a semicolon",
    13,
    false,
    'stateDiagram-v2\nstate "d" as A : {line}\n',
    'stateDiagram-v2\n  state "d" as A : {line}\n',
    'stateDiagram-v2\n  state "d" as A : {line}\n',
    "",
    [
      "T %%{x}%%",
      "T %%{x}%%",
      "%%{x}%%  T",
      "T %%{x}%% %% c  ",
      "T %%{x}%%%% c",
      "%%{x}%%T",
    ],
  ],
  [
    "a card of a kanban board, the directive alone with a directive that holds a line break or a semicolon",
    14,
    true,
    "kanban\n  S\n    A[x] {line}\n",
    "kanban\n  S\n    A[x] {line}\n",
    "kanban\n  S\n    A[x] {line}\n",
    "",
    [
      "%%{x}%%",
      "%%{x}%%",
      "%%{x}%%",
      "%%{x}%%  %% c  ",
      "%%{x}%%%% c",
      "%%{x}%%",
    ],
  ],
  [
    "a bare node of a mindmap, the directive alone with a directive that holds a line break or a semicolon",
    14,
    true,
    "mindmap\n  root\n    a {line}\n",
    "mindmap\n  root\n    a {line}\n",
    "mindmap\n  root\n    a {line}\n",
    "",
    [
      "%%{x}%%",
      "%%{x}%%",
      "%%{x}%%",
      "%%{x}%%  %% c  ",
      "%%{x}%%%% c",
      "%%{x}%%",
    ],
  ],
]

/**
 * The statement that follows the line of each text of the table above whose
 * line is the last of the text, as written and as printed (an info diagram has
 * none: mermaid.js rejects a `showInfo` after a title or an accessibility
 * line).
 */
const statementAfterTheDirectiveHoldingLine: ReadonlyMap<
  string,
  readonly [string, string]
> = new Map([
  ["cynefin-beta\ntitle {line}\n", ['complex "a"\n', '  complex\n    "a"\n']],
  [
    "cynefin-beta\naccTitle: {line}\n",
    ['complex "a"\n', '  complex\n    "a"\n'],
  ],
  [
    "cynefin-beta\naccDescr: {line}\n",
    ['complex "a"\n', '  complex\n    "a"\n'],
  ],
  ["gantt\naccTitle: {line}\n", ["section s\n", "  section s\n"]],
  ["gantt\naccDescr: {line}\n", ["section s\n", "  section s\n"]],
  ["journey\naccTitle: {line}\n", ["section s\n", "  section s\n"]],
  ["journey\naccDescr: {line}\n", ["section s\n", "  section s\n"]],
  ["timeline\naccTitle: {line}\n", ["section s\n", "  section s\n"]],
  ["timeline\naccDescr: {line}\n", ["section s\n", "  section s\n"]],
  ["timeline\n2020 : {line}\n", ["2021 : e\n", "  2021 : e\n"]],
  ["gantt\ntitle {line}\n", ["section s\n", "  section s\n"]],
  ["journey\ntitle {line}\n", ["section s\n", "  section s\n"]],
  ["timeline\ntitle {line}\n", ["section s\n", "  section s\n"]],
  ["gantt\ndateFormat {line}\n", ["section s\n", "  section s\n"]],
  ["gantt\naxisFormat {line}\n", ["section s\n", "  section s\n"]],
  ["mindmap\n  root\n    a[t] {line}\n", ["    b\n", "    b\n"]],
  ["ishikawa\n  R\n    {line}\n", ["    S\n", "    S\n"]],
  ["treeView-beta\nR\n  {line}\n", ["  S\n", "    S\n"]],
  ["mindmap\n  root\n    {line}\n", ["    b\n", "    b\n"]],
  ["kanban\n  S\n    {line}\n", ["    B[y]\n", "    B[y]\n"]],
  ['stateDiagram-v2\nstate "d" as A : {line}\n', ["A --> B\n", "  A --> B\n"]],
  ["kanban\n  S\n    A[x] {line}\n", ["    B[y]\n", "    B[y]\n"]],
  ["mindmap\n  root\n    a {line}\n", ["    b\n", "    b\n"]],
  ["journey\nsection s\n{line}\n", ["u: 5: Me\n", "    u: 5: Me\n"]],
])

/**
 * Formats each form of a text of the table of docs/compatibility.md, Directives
 * that hold a line break or a semicolon, as the table gives, with the statement
 * after its line where it has one.
 */
async function expectDirectiveHoldingKind(
  [
    _name,
    row,
    alone,
    input,
    output,
    outputAtTheStart,
    suffix,
    plain,
  ]: (typeof directiveHoldingKinds)[number],
  statement: readonly [string, string],
): Promise<void> {
  for (const [
    index,
    [form, directive, plainIndex],
  ] of directiveHoldingColumns.entries()) {
    const cell = directiveHoldingRows[row]?.[index]
    if (cell === null || cell === undefined || cell === "rejected") continue
    for (const held of directive.includes("\u2028")
      ? [directive, directive.replace("\u2028", "\u2029")]
      : [directive]) {
      const written =
        (alone ? form.replace("T  ", "") : form).replace("{d}", held) + suffix
      const without = plain[plainIndex]?.replace("%%{x}%%", held) ?? ""
      let printed = cell
      if (cell === "written") printed = written
      else if (cell === "without") printed = without
      else if (cell === "trimmed")
        printed = withoutSpacesAndTabsAtTheEnd(written)
      else if (cell.startsWith("L:")) printed = cell.slice(2)
      await expectKept(
        input.replace("{line}", written) + statement[0],
        (plainIndex === 2 ? outputAtTheStart : output).replace(
          "{line}",
          printed,
        ) + statement[1],
      )
    }
  }
}

describe("a directive that holds a line break or a semicolon", () => {
  it.each(directiveHoldingKinds)("prints %s", async (...kind) => {
    await expectDirectiveHoldingKind(kind, ["", ""])
  })

  it("a directive that holds a line break or a semicolon, with a statement after the line", async () => {
    for (const kind of directiveHoldingKinds) {
      const statement = statementAfterTheDirectiveHoldingLine.get(kind[3])
      if (statement === undefined) continue
      await expectDirectiveHoldingKind(kind, statement)
    }
  })
})

const directivePositionKinds: readonly (readonly [
  string,
  number,
  string,
  string,
  readonly [string, string, string, string],
])[] = [
  [
    "the title of a pie chart with a directive that holds a line break or a semicolon, wherever the directive stands",
    0,
    'pie\ntitle {line}\n"a": 1\n',
    'pie\n  title {line}\n  "a": 1\n',
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the title of a Wardley map with a directive that holds a line break or a semicolon, wherever the directive stands",
    1,
    "wardley-beta\ntitle {line}\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  title {line}\n  component A [0.5, 0.5]\n",
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the accTitle: of a Wardley map with a directive that holds a line break or a semicolon, wherever the directive stands",
    2,
    "wardley-beta\naccTitle: {line}\ncomponent A [0.5, 0.5]\n",
    "wardley-beta\n  accTitle: {line}\n  component A [0.5, 0.5]\n",
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the title of a quadrant chart with a directive that holds a line break or a semicolon, wherever the directive stands",
    3,
    "quadrantChart\ntitle {line}\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the accTitle: of a quadrant chart with a directive that holds a line break or a semicolon, wherever the directive stands",
    4,
    "quadrantChart\naccTitle: {line}\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  accTitle: {line}\n  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the title of a Gantt chart with a directive that holds a line break or a semicolon, wherever the directive stands",
    5,
    "gantt\ntitle {line}\n",
    "gantt\n  title {line}\n",
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the title of a Venn diagram with a directive that holds a line break or a semicolon, wherever the directive stands",
    6,
    "venn-beta\ntitle {line}\nset A\n",
    "venn-beta\n  title {line}\n  set A\n",
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the title of a C4 diagram with a directive that holds a line break or a semicolon, wherever the directive stands",
    7,
    'C4Context\ntitle {line}\nPerson(a,"A")\n',
    'C4Context\n  title {line}\n  Person(a, "A")\n',
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the accDescription of a C4 diagram with a directive that holds a line break or a semicolon, wherever the directive stands",
    7,
    'C4Context\naccDescription {line}\nPerson(a,"A")\n',
    'C4Context\n  accDescription {line}\n  Person(a, "A")\n',
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the text of a mindmap node with a directive that holds a line break or a semicolon, wherever the directive stands",
    11,
    "mindmap\n  root\n    {line}\n",
    "mindmap\n  root\n    {line}\n",
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
  [
    "the second description of a state alias with a directive that holds a line break or a semicolon, wherever the directive stands",
    13,
    'stateDiagram-v2\nstate "d" as A : {line}\n',
    'stateDiagram-v2\n  state "d" as A : {line}\n',
    [
      "T %%{x}%% %%{y}%%",
      "T %%{y}%% %%{x}%%",
      "T %%{x}%%",
      "T %%{y}%% %%{x}%%",
    ],
  ],
]

/** The position of the directive among the directives of the line, and a tab in place of the spaces after it, give what the first form of its row gives. */
describe("a directive that holds a line break or a semicolon, wherever it stands", () => {
  it.each(directivePositionKinds)(
    "prints %s",
    async (_name, row, input, output, plain) => {
      const forms = [
        "T  {d}  {p}  ",
        "T  {p}  {d}  ",
        "T  {d}\t",
        "T  {p}  {d}",
      ] as const
      const directives = [
        ["%%{init: {\n}}%%", 3, 0],
        ["%%{init: {a;b}}%%", 4, 1],
      ] as const
      for (const [directive, afterColumn, nothingAfterColumn] of directives) {
        for (const [index, form] of forms.entries()) {
          const cell =
            directiveHoldingRows[row]?.[
              index === 3 ? nothingAfterColumn : afterColumn
            ]
          if (cell === null || cell === undefined) continue
          const written = form
            .replace("{d}", directive)
            .replace("{p}", "%%{y}%%")
          const without = plain[index]?.replace("%%{x}%%", directive) ?? ""
          const printed = cell === "written" ? written : without
          await expectKept(
            input.replace("{line}", written),
            output.replace("{line}", printed),
          )
        }
      }
    },
  )
})

/**
 * The statement right after a title that stays as written, as the printer
 * writes it: its first line as written, the other lines indented.
 */
function statementAfterTheTitleLine(statement: string): string {
  const [first, ...rest] = statement.split("\n")
  return `${[first, ...rest.map((line) => `  ${line}`)].join("\n")}\n`
}

/**
 * The diagram types that have a title, each with the group that the table of
 * docs/compatibility.md, Texts after a keyword that are drawn the same, gives
 * it, a statement, and what the type prints for the statement.
 */
const titleStatementTypes = [
  {
    name: "a pie chart",
    header: "pie",
    printedHeader: "pie",
    indent: "  ",
    statement: '"a": 1',
    printedStatement: '  "a": 1\n',
    group: "langium",
  },
  {
    name: "a radar chart",
    header: "radar-beta",
    printedHeader: "radar-beta",
    indent: "  ",
    statement: "axis a, b\ncurve c{1, 2}",
    printedStatement: "  axis a, b\n  curve c{1, 2}\n",
    group: "langium",
  },
  {
    name: "a packet diagram",
    header: "packet-beta",
    printedHeader: "packet-beta",
    indent: "  ",
    statement: '0-7: "x"',
    printedStatement: '  0-7: "x"\n',
    group: "langium",
  },
  {
    name: "an architecture diagram",
    header: "architecture-beta",
    printedHeader: "architecture-beta",
    indent: "  ",
    statement: "service a(server)[A]",
    printedStatement: "  service a(server)[A]\n",
    group: "langium",
  },
  {
    name: "a gitGraph",
    header: "gitGraph",
    printedHeader: "gitGraph",
    indent: "  ",
    statement: "commit",
    printedStatement: "  commit\n",
    group: "langium",
  },
  {
    name: "a cynefin diagram",
    header: "cynefin-beta",
    printedHeader: "cynefin-beta",
    indent: "  ",
    statement: 'complex "a"',
    printedStatement: '  complex\n    "a"\n',
    group: "langium",
  },
  {
    name: "a treemap",
    header: "treemap-beta",
    printedHeader: "treemap",
    indent: "",
    statement: '"A": 1',
    printedStatement: '  "A": 1\n',
    group: "langium",
  },
  {
    name: "a Wardley map",
    header: "wardley-beta",
    printedHeader: "wardley-beta",
    indent: "  ",
    statement: "component A [0.5, 0.5]",
    printedStatement: "  component A [0.5, 0.5]\n",
    group: "langium",
  },
  {
    name: "a treeView",
    header: "treeView-beta",
    printedHeader: "treeView-beta",
    indent: "  ",
    statement: "root",
    printedStatement: "  root\n",
    group: "treeView",
  },
  {
    name: "an info diagram",
    header: "info",
    printedHeader: "info",
    indent: "  ",
    statement: "showInfo",
    printedStatement: "  showInfo\n",
    group: "langium",
  },
  {
    name: "a railroad diagram",
    header: "railroad-abnf-beta",
    printedHeader: "railroad-abnf-beta",
    indent: "  ",
    statement: 'r="a";',
    printedStatement: '  r = "a";\n',
    group: "langium",
  },
  {
    name: "a quadrant chart",
    header: "quadrantChart",
    printedHeader: "quadrantChart",
    indent: "  ",
    statement: "x-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]",
    printedStatement: "  x-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
    group: "quadrant",
  },
  {
    name: "a Gantt chart",
    header: "gantt",
    printedHeader: "gantt",
    indent: "  ",
    statement: "section s",
    printedStatement: "  section s\n",
    group: "other",
  },
  {
    name: "a user journey",
    header: "journey",
    printedHeader: "journey",
    indent: "  ",
    statement: "section s",
    printedStatement: "  section s\n",
    group: "other",
  },
  {
    name: "a timeline",
    header: "timeline",
    printedHeader: "timeline",
    indent: "  ",
    statement: "section s",
    printedStatement: "  section s\n",
    group: "other",
  },
  {
    name: "a sequence diagram",
    header: "sequenceDiagram",
    printedHeader: "sequenceDiagram",
    indent: "  ",
    statement: "A->>B: x",
    printedStatement: "  A ->> B: x\n",
    group: "other",
  },
  {
    name: "a Venn diagram",
    header: "venn-beta",
    printedHeader: "venn-beta",
    indent: "  ",
    statement: "set A",
    printedStatement: "  set A\n",
    group: "other",
  },
  {
    name: "a C4 diagram",
    header: "C4Context",
    printedHeader: "C4Context",
    indent: "  ",
    statement: 'Person(a,"A")',
    printedStatement: '  Person(a, "A")\n',
    group: "other",
  },
] as const

/**
 * What a title of a directive and a comment only, with a U+2028 or a U+2029
 * before the directive, prints by what follows the title (docs/compatibility.md).
 * `moved` says whether each group of types moves the directive and the comment
 * to the next line, which prints the text as if the U+2028 were a line break;
 * `tail` is what follows the title line where the title stays as written, with
 * `{S}` for the printed statement and `{S0}` for it without the indent of its
 * first line (a `null` tail is given by `otherTail` and `c4Tail`). The info
 * diagram rejects a statement after an empty line, a line of spaces, or a line
 * of a directive.
 */
const titleFollowRows = [
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: nothing, or an empty line",
    follows: [
      {
        text: "",
        tail: "",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
      {
        text: "\n",
        tail: "",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: "\n",
      },
    ],
    moved: { langium: true, treeView: true, quadrant: true, other: false },
    oneSpace: true,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: an empty line, then a statement",
    follows: [
      {
        text: "\n{ST}\n",
        tail: "\n{S}",
        rejectedByInfo: true,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: true, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: true,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a comment line",
    follows: [
      {
        text: "%% z\n",
        tail: null,
        rejectedByInfo: false,
        otherTail: "  %% z\n",
        c4Tail: "%% z\n",
      },
    ],
    moved: { langium: true, treeView: true, quadrant: true, other: false },
    oneSpace: true,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: one comment line or two, then a statement",
    follows: [
      {
        text: "%% z\n{ST}\n",
        tail: "%% z\n{S0}",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
      {
        text: "%% z\n%% w\n{ST}\n",
        tail: "%% z\n%% w\n{S0}",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: false, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a comment line, an empty line, then a statement",
    follows: [
      {
        text: "%% z\n\n{ST}\n",
        tail: "%% z\n\n{S}",
        rejectedByInfo: true,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: true, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: true,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a line of spaces",
    follows: [
      {
        text: "   \n",
        tail: "   \n",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: false, treeView: false, quadrant: true, other: false },
    oneSpace: false,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a line of spaces, then a statement",
    follows: [
      {
        text: "   \n{ST}\n",
        tail: "   \n{S}",
        rejectedByInfo: true,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: false, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a line of a directive",
    follows: [
      {
        text: "%%{y}%%\n",
        tail: "%%{y}%%\n",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: true, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a line of a directive, then a statement",
    follows: [
      {
        text: "%%{y}%%\n{ST}\n",
        tail: "%%{y}%%\n{S}",
        rejectedByInfo: true,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: true, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: true,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a line of a directive after a space, alone or then a statement",
    follows: [
      {
        text: " %%{y}%%\n",
        tail: " %%{y}%%\n",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
      {
        text: " %%{y}%%\n{ST}\n",
        tail: " %%{y}%%\n{S}",
        rejectedByInfo: true,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: false, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a line of a directive and a comment, with or without a space before it",
    follows: [
      {
        text: "%%{y}%% %% d\n",
        tail: null,
        rejectedByInfo: false,
        otherTail: "  %%{y}%% %% d\n",
        c4Tail: "%%{y}%% %% d\n",
      },
      {
        text: "%%{y}%%%% d\n",
        tail: null,
        rejectedByInfo: false,
        otherTail: "  %%{y}%%%% d\n",
        c4Tail: "%%{y}%%%% d\n",
      },
      {
        text: " %%{y}%% %% d\n",
        tail: null,
        rejectedByInfo: false,
        otherTail: "  %%{y}%% %% d\n",
        c4Tail: " %%{y}%% %% d\n",
      },
    ],
    moved: { langium: true, treeView: true, quadrant: true, other: false },
    oneSpace: true,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a line of a directive and a comment, then a statement",
    follows: [
      {
        text: "%%{y}%% %% d\n{ST}\n",
        tail: "%%{y}%% %% d\n{S0}",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
      {
        text: "%%{y}%%%% d\n{ST}\n",
        tail: "%%{y}%%%% d\n{S0}",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
      {
        text: " %%{y}%% %% d\n{ST}\n",
        tail: " %%{y}%% %% d\n{S0}",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: false, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: false,
  },
  {
    name: "U+2028 and U+2029 before the directive of a title of a directive and a comment only, by what follows the title: a statement",
    follows: [
      {
        text: "{ST}\n",
        tail: "{S0}",
        rejectedByInfo: false,
        otherTail: null,
        c4Tail: null,
      },
    ],
    moved: { langium: false, treeView: false, quadrant: false, other: false },
    oneSpace: false,
    unstableInATreemap: false,
  },
] as const

describe("a U+2028 or U+2029 before the directive of a title of a directive and a comment only, by what follows the title", () => {
  it.each(titleFollowRows.map((row) => [row.name, row] as const))(
    "%s",
    async (_name, row) => {
      for (const type of titleStatementTypes) {
        for (const character of ["\u2028", "\u2029"]) {
          for (const touching of [true, false]) {
            for (const follow of row.follows) {
              const written = touching ? "%%{x}%%%% c" : "%%{x}%%  %% c  "
              const input = `${type.header}\ntitle ${character} ${written}\n${follow.text.replace("{statement}", type.statement).replace("{ST}", type.statement)}`
              if (type.name === "an info diagram" && follow.rejectedByInfo) {
                await expect(formatMermaid(input)).rejects.toThrow(
                  "Unexpected token",
                )
                continue
              }
              // A treemap with spaces before the comment prints these rows one
              // way the first time and another the second time: no form is given.
              if (
                type.name === "a treemap" &&
                !touching &&
                row.unstableInATreemap
              )
                continue
              const isC4 = type.name === "a C4 diagram"
              let expected: string
              if (row.moved[type.group]) {
                // The moved form prints the text as if the U+2028 were a line break.
                expected = await formatMermaid(
                  input.replace(` ${character} `, "\n"),
                )
              } else {
                const tail =
                  (isC4 ? follow.c4Tail : null) ??
                  follow.tail ??
                  follow.otherTail ??
                  (() => {
                    throw new Error("no tail")
                  })()
                // Where the comment stands after spaces, the types of the last
                // group but a C4 diagram print one space before it where the
                // text ends after the line (docs/compatibility.md).
                const oneSpace =
                  !touching && type.group === "other" && !isC4 && row.oneSpace
                expected = `${type.printedHeader}\n${type.indent}title ${character} ${oneSpace ? "%%{x}%% %% c  " : written}\n${tail
                  .replace("{S0}", statementAfterTheTitleLine(type.statement))
                  .replace("{S}", type.printedStatement)}`
              }
              const output = await formatMermaid(input)
              expect(output).toBe(expected)
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
          }
        }
      }
    },
  )

  it("a directive that holds a U+2028 or a U+2029 after a U+2028 or a U+2029 before the directive of a title, with nothing or a statement after the title", async () => {
    for (const type of titleStatementTypes) {
      for (const [character, held] of [
        ["\u2028", "\u2028"],
        ["\u2029", "\u2029"],
        ["\u2028", "\u2029"],
      ] as const) {
        for (const follow of ["", "{ST}\n"]) {
          const written = `title ${character} %%{init: {${held}}}%%%% c`
          const input = `${type.header}\n${written}\n${follow.replace("{ST}", type.statement)}`
          // An info diagram rejects a statement after a title with a comment
          // that holds a separator.
          if (type.name === "an info diagram" && follow !== "") continue
          const tail = follow === "" ? "" : type.printedStatement
          const output = await formatMermaid(input)
          expect(output).toBe(
            `${type.printedHeader}\n${type.indent}${written}\n${tail}`,
          )
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
      }
    }
  })
})

/** The text without the spaces and tabs at its end. */
function withoutSpacesAndTabsAtTheEnd(text: string): string {
  let end = text.length
  while (end > 0 && (text[end - 1] === " " || text[end - 1] === "\t")) end--
  return text.slice(0, end)
}

/** A U+2028 or U+2029 before the directive of a title of a directive and a comment only keeps the title and the line after it as written (docs/compatibility.md). */
const lineSeparatorBeforeTheDirectiveExamples: readonly (readonly [
  string,
  string,
  string,
])[] = [
  [
    "U+2028 before the directive of a title of a directive and a comment only in a pie chart",
    'pie\ntitle \u2028%%{x}%%%% c\n"a": 1\n',
    'pie\n  title \u2028%%{x}%%%% c\n"a": 1\n',
  ],
  [
    "U+2029 before the directive of a title of a directive and a comment only in a pie chart",
    'pie\ntitle \u2029%%{x}%%%% c\n"a": 1\n',
    'pie\n  title \u2029%%{x}%%%% c\n"a": 1\n',
  ],
  [
    "U+2028 before the directive of a title of a directive and a comment only in a quadrant chart",
    "quadrantChart\ntitle \u2028%%{x}%%%% c\nx-axis L --> R\ny-axis B --> T\nA: [0.5, 0.5]\n",
    "quadrantChart\n  title \u2028%%{x}%%%% c\nx-axis L --> R\n  y-axis B --> T\n  A: [0.5, 0.5]\n",
  ],
  [
    "U+2028 before the directive of a title of a directive and a comment only in a Gantt chart",
    "gantt\ntitle \u2028%%{x}%%%% c\n",
    "gantt\n  title \u2028%%{x}%%%% c\n",
  ],
  [
    "U+2028 before the directive of a title of a directive and a comment only in a Venn diagram",
    "venn-beta\ntitle \u2028%%{x}%%%% c\nset A\n",
    "venn-beta\n  title \u2028%%{x}%%%% c\nset A\n",
  ],
  [
    "U+2028 before the directive of a title of a directive and a comment only in a C4 diagram",
    'C4Context\ntitle \u2028%%{x}%%%% c\nPerson(a,"A")\n',
    'C4Context\n  title \u2028%%{x}%%%% c\nPerson(a,"A")\n',
  ],
]

describe("a line separator before the directive of a title of a directive and a comment only", () => {
  it.each(lineSeparatorBeforeTheDirectiveExamples)(
    "keeps %s",
    async (_name, input, output) => {
      await expectKept(input, output)
    },
  )
})
