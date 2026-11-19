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
