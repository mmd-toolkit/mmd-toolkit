---
name: review
description:
  Review a change in this repository (a parser, a printer, a lint rule, a
  specification document, a test helper, or a tool) so that one review finds
  everything it is going to find. Use before reviewing a change, before
  re-reviewing a fix, and when a review is repeated more than twice on the same
  item. It names the inputs a review takes from the sentences, the checks it
  runs on documents, how a finding is classified and reported, and how a
  reviewer runs things on a shared machine.
---

# Reviewing a change

## Policies and criteria

A review says, with evidence, whether a change is correct against the pinned
mermaid.js and the specification, whether it is in its proper form, and whether
its documents follow the conventions. It says it once: the reviewer looks at
every point of view in the first pass, so that a second pass finds only what the
fix introduced. A re-review that finds something the first pass could have found
is a failure of the first pass, and the report says so.

Every claim in a review is marked as run (the reviewer executed it: mermaid.js,
`parse()`, a test, a measurement) or read (the reviewer read code or a
document). A claim in the report under review is neither until the reviewer has
run it. Numbers are counted again before they are sent; a wrong count is a
finding against the review.

The reviewer edits nothing in the working tree. Probes, copies, and generated
inputs live outside it.

## 1. Scope

- Read the whole of every file the change touched, not the part the report
  points at. A document that covers several diagram types is read for all of
  them.
- List what the change can affect beyond the files it touched: the packages that
  use a shared interface it changed, the fixtures that back a rule it changed,
  the printers and rules that read a node it changed.
- Write down, before looking, the points of view the review will cover: behavior
  against mermaid.js, the cases of each sentence, proper form, documents, and
  the specific concerns the requester named. The report lists what was seen and
  what was not.

## 2. Inputs

A review of a parser, a printer, or a rule is closed by inputs, each compared
with mermaid.js (acceptance, the Db, and for the formatter idempotence and the
Db after formatting). The mermaid fact is defined independently of the
implementation under review, never by running the implementation and reading its
answer back.

The inputs come from the sentences. For every sentence that the change concerns
(in the specification, the parser's documents of tokens and positions, the
documents of `dbFromTree`, the formatting rules), the reviewer lists the cases
the sentence distinguishes and the other rules that meet it at the place it
names, and checks that each has a fixture; a case without a fixture is a finding
against the fixtures, and a case the sentence does not state is a finding
against the sentence. The reviewer builds no product of places and strings: a
product repeats one rule as many times as it has contexts and names no question.

The shapes below name the other rules to think of at each sentence. A review
that leaves one out says which and why.

- Line endings, after every statement form: ` ;`, `;`, `;;`, `; ;`, `: `, a
  trailing space, a trailing tab, a trailing comment, a trailing directive
  (closed and unclosed), a blank line, `\r\n`, and the end of the text without a
  line terminator.
- The `;` that the line rule ignores: one, two, and three of them, with and
  without whitespace after, in every value that mermaid.js reads to a separator
  (`style`, `classDef`, `linkStyle`, titles, descriptions, notes). The line rule
  fires on any line that holds `style` and `:#`, not only on a `style`
  statement, so its trigger (`style:#x;`, `#x;;  `) is also put into labels,
  titles, messages, notes, and alias descriptions.
- Directives inside values and inside words (`e%%{init: {}}%%nd`), between a
  keyword and its value, and at the end of a line. Between a keyword and its
  value also a comment line and an empty line (`title`, a line break, `%% c`, a
  line break, `x`).
- Inputs chosen by a random source or by a number (a seed, a count, a sample of
  N), in a test or in the review's own inputs: a finding (重). No sentence names
  such an input, so a run of it answers no question.
- The transformations a formatter actually performs, applied to the input and
  checked against mermaid.js: swap a `;` and a line break, remove the trailing
  whitespace of a line, move a line's content to the previous or the next line,
  join two lines, collapse whitespace between tokens.
- For a change of a shared function: inputs at every place that calls it, not
  only the place the change was made for.
- For a lint rule: check each claim separately, on its own input. What a message
  says the text does is checked by removing exactly that text and comparing the
  Db; what a suggestion does is checked by applying exactly the suggestion's
  edit (a suggestion that removes a line removes its line terminator too) and
  comparing the Db. One input that mixes the two attributes the suggestion's
  effect to the message.

Check the parts before building inputs with them: each inserted string is what
its name says. Parse it alone and read the result (a "closed directive" has
`closed: true`, a "comment line" is one `Comment`, a "line separator" is
U+2028). A part that is not what it claims makes every result built on it a
claim about something else, and the review does not notice.

An input on which the implementation and mermaid.js disagree is not a finding
until the known divergences are ruled out: run mermaid.js again on the input
with its divergences removed (`withoutDivergences`) and check that a declared
divergence explains the difference. Without this step a declared input is
reported as a finding, or a real one is dismissed as declared.

When the change is a fix, run the same inputs on the version before the fix.
Every difference in output is classified by reading each one, not by a rule that
sorts them: intended by the fix, a consequence the fix did not report, or
unrelated. Unreported consequences are findings.

For a tool or a piece of infrastructure (the mermaid result store, the fixture
tools, a CLI), the inputs are different and the list is this:

- Run it from the build (`lib/`) as well as from the sources; a module that the
  build does not export fails only there.
- Vary the environment: time zone, locale, process order, several processes;
  results read back must equal results made afresh.
- Damage its files: flip single bits across every byte, truncate at every
  length; a damaged file is read as absent, never as a different result.
- Concurrency at a fixed number of processes, a clock that crosses midnight, the
  lock or PID file of a process that died, the window between creating and
  filling a lock, a start that cannot spawn (`ulimit -u 1`).
- Pass the options of a public function in forms that serialize alike
  (`undefined` fields and missing fields, `NaN` and `null`); two options that
  change the result must not share a key.

## 3. Documents

- Every Markdown document changed has its `.ja.md` pair changed in the same
  change, with the same headings and the same number of code blocks.
- Measure the width of every changed Japanese document, every line, with the
  output unfiltered (never pipe a check through `grep -v`). Prose lines are at
  most 80 columns, full-width characters counted as two; tables, code blocks,
  and lines that are one link are exempt.
- No invisible characters written literally; links to mermaid.js source are
  permalinks of the pinned commit; Mermaid code blocks have the info string
  `mmd` and are written as the formatter prints them unless the example shows a
  way of writing.
- A kept document names no working arrangement: not who works on what, not where
  they talk to each other, not a scratch file.
- A claim in a document is checked against mermaid.js when it states a behavior,
  and against the code when it states what the code does.

## 4. Proper form

Every review has a section on proper form, also when the behavior is right:

- Is the thing needed, and is it named for what it is?
- Is each decision made in one place? A rule copied into a printer and a parser,
  or a condition repeated per caller, is a finding.
- Does a caller rely on a promise the callee does not state (a token always
  before a range, a field always non-empty)? A promise held only by a test is
  not stated.
- Does the code reproduce a pipeline of mermaid.js where the specification
  states a direct rule?
- Readability: types inferred from values, generalizations with one user,
  indirection without a reader, empty JSDoc, autofix stubs, commented-out code.

## 5. Findings and the report

- One report per review, with every finding, graded (a wrong Db or acceptance, a
  lost idempotence, a wrong document claim: major; wording, width, naming:
  minor). Minor findings are not held back for a later round.
- Each finding carries its evidence (input, mermaid.js output, file and line),
  and names its class: the other places, diagram types, and forms where the same
  mistake would appear, enumerated before a fix is proposed. A finding without
  its class invites a fix of one point.
- In a re-review, each new finding names its origin: made by the fix, present
  before and missed by the earlier review, or new scope. A missed finding names
  which case the earlier review did not list or which place it did not read, and
  that gap is added to the inputs of every later review.
- When the same item reaches a third round with new findings, the review stops
  and reports the origins before anything else is fixed.
- A finding against the parser or the specification whose input the conformance
  corpus lacks names the fixture to add: the input is kept in the corpus
  (`packages/tests/fixtures/`), where a parser in any language is checked with
  it, and not in a list inside the parser.
- The report says what the reviewer did not look at and why, so that nobody
  reads a pass as exhaustive.

## 6. Running things on a shared machine

- Fix the number of concurrent processes before a parallel run, children
  included (8 to 16), and announce before probing a system limit. Hitting the
  per-user process limit kills other people's runs.
- A copy of code that runs mermaid.js runs with the result store disabled
  (`MMD_TOOLKIT_MERMAID_CACHE=disabled`), unless the copy reads the tree's own
  `packages/tests` and so shares its key.
- Stop only one's own tasks, by task id or PID; never a process by name.
- Do not start a long run while another long run is going; the load multiplies
  both.
