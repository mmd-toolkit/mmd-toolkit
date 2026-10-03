/**
 * Formats state statements of many forms, where formatting changes the
 * whitespace between tokens and the lines (docs/state.md): transitions
 * between references of every form, with whitespace around the arrow or
 * none, and labels; and every kind of statement, as written, with its
 * spaces doubled, and with tabs for its spaces, at the top level and in the
 * body of a composite state; and every alias definition and every note on
 * one line from their parts, with whitespace between them or none; and a
 * `state` name followed by statements with a `{`.
 *
 * The axes of a form are combined so that every pair of values of two axes
 * stands together somewhere (see `pairwise.ts`); a statement after another
 * statement is tried for every pair of the two lists.
 */
import type { GeneratedInput } from "./generated.ts"
import { defineCheckedGroups } from "./checked-groups.ts"
import { pairwiseIndexes } from "./pairwise.ts"

/** State references: an id, `[*]`, and an id with a class. */
const references: readonly string[] = [
  "A",
  "[*]",
  "A:::c",
  "A ::: c",
  "a;b",
  "A#1",
]

/** The whitespace on each side of the arrow of a transition. */
const arrowSpacings: readonly (readonly [string, string])[] = [
  ["", ""],
  [" ", " "],
  ["  ", "\t"],
  ["", " "],
]

/** What follows a transition: labels and comments. */
const labels: readonly string[] = [
  "",
  " : x",
  ":x",
  " : ",
  ":  ",
  " : x: ",
  " : x:  ",
  " : x:\t",
  " :: ",
  "::\t",
  " : x %% c",
  " : style:#f00;",
  " %% c",
]

/** Statements of every kind, written over one line or several. */
const statements: readonly string[] = [
  "A : x",
  "A:x",
  "A : ",
  "A::c",
  "A : x:y",
  "A : ; ;",
  "A --> B : ; ;",
  "A : x%%{init: {}}%%y:",
  "A --> B : x%%{init: {}}%%y:",
  "A : x: ",
  "A : x:\t",
  "A:: ",
  "A :: ",
  "[*] :: ",
  "A : x: %% c",
  "state A : x: ",
  'state "d" as A : x: ',
  'state "d" as A : x:',
  'state "d" as A : x:\t',
  "note left of A : x: ",
  "styleA :#f00;",
  "A --> B C --> D",
  "[*]x",
  "A B",
  "note left of A : hi",
  "note left of A:hi",
  "note left of A  : hi",
  "Note Left Of A : x",
  "note right of A\n  x\n    y\nend note",
  "note left of%%x A : t",
  "note right of\nA : x",
  "note right of %% c S\nx\nend note",
  'note "x" as N',
  'note ""x" as N',
  'note "x"" as N',
  'note "a b" as N 1',
  'note "x"\nas N',
  'state "d" as A',
  'state "d"as A',
  'state "d" as A : x',
  'state "d" as A :x',
  'state "d" as A :  x',
  'state "d" as A :',
  'state "d" as A : x : y',
  'state "d" as my id',
  'state "" "y" "" as A',
  'state "d" as A {\nB\n}',
  'state "d" as A : x\n{\nB\n}',
  'state "d" as %% c {\nB\n}',
  "state A {\nB\n}",
  "state A { B }",
  "state A {}",
  "state A {\n}",
  "state A\n{\nB\n}",
  "state X\n%%{}\nB\n}",
  "state X %%{}",
  "state a b",
  'state x "" y',
  'state x ""',
  'state ""',
  'state "" x {\nB\n}',
  'state x ""\n{\nB\n}',
  "state A {\nC\n--\nB\n}",
  "state A { C -- B }",
  "state A {\nstate B {\nC\n}\n}",
  "state f <<fork>>",
  "state f 1 <<fork>>",
  "state f<<fork>>",
  "state c[[choice]]",
  "state f 1<<fork>>",
  "state f  <<fork>>",
  'state "d"as A',
  'state "d"as A:x',
  'state "d"  as   A :  x',
  'state ""  "y""""as C',
  'state "d"as A{\nB\n}',
  'state "d"  as   A  {\nB\n}',
  "state <<join>>",
  "state c [[choice]]",
  "state x <<choice>> y",
  'A\nclick A href "u"',
  'A\nclick A "u" "t"',
  'A\nclick A "u" "t" accDescr {}',
  'click [*] "" ""',
  "A\nclassDef c fill:red,,x\nclass A c",
  "A\nclassDef c fill:red , x\nclass A c",
  "A\nclassDef c\nfill:red\nclass A c",
  "A\nB\nclass A,B c d",
  "A\nB\nclass A ,B c",
  "A\nstyle A,,B x",
  "A\nstyle A fill:red",
  "direction LR",
  "direction\nLR",
  "A --> B direction LR",
  "direction TBX",
  "accTitle: x",
  "accTitle:\nx",
  "accDescr: x",
  "accDescr {\n  x\n    y\n}",
  "accDescr {}",
  "A --> B accDescr {}",
  "scale 3 width",
  "scale\n3 width",
  "hide empty description",
  "HIDE EMPTY DESCRIPTION",
  "A --> B %% c",
  "A --> B%% c",
  "A --> B # c",
  "%% a comment line\nA",
]

/**
 * What can end a statement: whitespace, and a `:` with whitespace after it
 * or none, as the end of a description, with text before it or none. A
 * description cannot end with `:`, and needs a character after its `:`
 * (diagrams/state.md, The statement context).
 */
const endings: readonly string[] = [
  "",
  " ",
  "\t",
  ":",
  ": ",
  " :\t",
  "x:",
  "x: ",
  "::",
  ":: ",
]

/** A statement with its spaces doubled, or replaced by tabs. */
function respace(statement: string, space: string): string {
  return statement.split(" ").join(space)
}

/** A text of a state diagram with the statement at the top level. */
function atTopLevel(statement: string): GeneratedInput {
  return { text: `stateDiagram-v2\n${statement}\n`, options: {} }
}

/** A text with the statement in the body of a composite state. */
function inComposite(statement: string): GeneratedInput {
  return {
    text: `stateDiagram-v2\nstate P {\n${statement}\n}\n`,
    options: {},
  }
}

/**
 * The statements that precede another: a name after `state`, which the
 * state context reads a `{` after on the lines that follow, and other
 * statements (docs/state.md, Composite states).
 */
const precedingStatements: readonly string[] = [
  "state foo",
  "state foo\n",
  "state a b",
  'state foo ""',
  'state "d" as A',
  "state A <<fork>>",
  "A",
  "A --> B",
  "state foo {\n}",
  "note left of A : x",
  "classDef c fill:red",
  "state foo # c",
  "state foo %% c",
]

/** The statements with a `{` that the formatter moves or joins. */
const followingStatements: readonly string[] = [
  "state B\n{\nX\n}",
  'state "d" as B\n{\nX\n}',
  'state B ""\n{\nX\n}',
  "state\nB\n{\nX\n}",
  "state B\n%%{}\nX\n}",
  'note "x" as\naccDescr {}\n N1',
  "accDescr {\nx\n}",
  "state B {\nX\n}",
  "note right of A\nx\nend note",
]

/** The transitions: a reference, an arrow spacing, a reference, and a label. */
function makeTransitions(): GeneratedInput[] {
  return pairwiseIndexes([
    references.length,
    references.length,
    arrowSpacings.length,
    labels.length,
  ]).map(([from, to, spacing, label]) => {
    const [before, after] = arrowSpacings[spacing]
    return atTopLevel(
      `${references[from]}${before}-->${after}${references[to]}${labels[label]}`,
    )
  })
}

const SPACES: readonly string[] = [" ", "  ", "\t"]

/** The statements, with their spaces doubled or as tabs, and an ending, at the top level and in a composite state. */
function makeStatements(): GeneratedInput[] {
  return pairwiseIndexes([
    statements.length,
    SPACES.length,
    endings.length,
    2,
  ]).map(([statement, space, ending, context]) => {
    const text = `${respace(statements[statement], SPACES[space])}${endings[ending]}`
    return context === 0 ? atTopLevel(text) : inComposite(text)
  })
}

/**
 * Alias definitions from their parts: the empty string before the string
 * and after it, whitespace or none before `as`, whitespace of every kind
 * after it, and what follows the id (docs/state.md, Aliases).
 */
function makeAliases(): GeneratedInput[] {
  const leads = ["", '""', '"" ']
  const trails = ["", '""', ' ""']
  const beforeAs = ["", " ", "\t"]
  const afterAs = [" ", "  ", "\n"]
  const tails = ["", ":x", " : x", " {\nB\n}", "{\nB\n}"]
  return pairwiseIndexes([
    leads.length,
    trails.length,
    beforeAs.length,
    afterAs.length,
    tails.length,
  ]).map(([lead, trail, before, after, tail]) =>
    atTopLevel(
      `state ${leads[lead]}"d"${trails[trail]}${beforeAs[before]}as${afterAs[after]}A${tails[tail]}`,
    ),
  )
}

/** Notes on one line, with whitespace between their parts. */
function makeNotes(): GeneratedInput[] {
  const positions = ["left of", "right of"]
  const afterPositions = ["", "%%x"]
  const beforeIds = [" ", "  ", "\t"]
  const tails = [" : t", ":t", "  : t"]
  return pairwiseIndexes([
    positions.length,
    afterPositions.length,
    beforeIds.length,
    tails.length,
  ]).map(([position, afterPosition, beforeId, tail]) =>
    atTopLevel(
      `note ${positions[position]}${afterPositions[afterPosition]}${beforeIds[beforeId]}A${tails[tail]}`,
    ),
  )
}

/** Every statement after every other, at the top level. */
function makePairs(): GeneratedInput[] {
  return precedingStatements.flatMap((first) =>
    followingStatements.map((second) => atTopLevel(`${first}\n${second}`)),
  )
}

defineCheckedGroups("state statements", [
  ["transitions", makeTransitions()],
  ["statements of every kind, with spaces and endings", makeStatements()],
  ["alias definitions", makeAliases()],
  ["notes on one line", makeNotes()],
  ["a statement after another statement", makePairs()],
])
