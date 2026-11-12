---
name: rule-ideas
description:
  Find ideas for the rules of @mmd-toolkit/eslint-plugin and decide which rules
  to keep (adoption, name, scope, whether `recommended` enables them,
  suggestions). Use when looking for new rule candidates, reviewing proposed
  candidates, or rechecking existing rules against the adoption criteria.
---

# Finding rule ideas and deciding which rules to keep (rule-ideas)

How to find candidate rules for `@mmd-toolkit/eslint-plugin` (an ESLint language
plugin for Mermaid diagram text) and decide whether to keep each one, its name,
its scope, and whether `recommended` enables it. The adoption criteria are in
"Policies and criteria" in section 2.

## 1. What this procedure covers, and how to work

- Show the decisions in the form of section 6. This procedure writes no file of
  the repository except the records of sections 2, 7, and 8
  ([references/adoption-decisions.md](references/adoption-decisions.md),
  [references/recommended-decisions.md](references/recommended-decisions.md),
  and [references/suggestion-decisions.md](references/suggestion-decisions.md));
  keep working scripts and their output in a working directory outside the
  repository.
- The decisions are recorded in the repository by these procedures:
  - The rule documents (`packages/eslint-plugin/docs/rules/`) follow the
    eslint-plugin SKILL, and the rules (`packages/eslint-plugin/src/rules/`) the
    eslint-plugin-rules SKILL. A rule is added, renamed, or removed (also when
    dropped) with its document in one change.
  - Request a missing supporting fixture from the tests package with the
    smallest input and the claim that it answers
    (`packages/tests/docs/maintaining-fixtures.md`). The fixture is used in the
    examples of the rule document and in the tests of the rule (the
    eslint-plugin SKILL, step 4 of
    [section 4](../eslint-plugin/SKILL.md#4-checking-before-and-after-writing)).
- Mark each claim as run (checked by running it), read (checked by reading), or
  unchecked. Withdraw a wrong claim in those words.
- Read the current specification before relying on it.
- When the working tree is shared with other work:
  - Do not touch a file that someone else is editing: the changes of one of the
    two are lost, also when you wait until the edits stop.
  - Read the target before deleting or replacing it.
  - Do not change the git staging area, and do not use git mv or git rm.

## 2. The adoption criteria, and how to apply them

### Policies and criteria

- A rule reports a mistake of the author that mermaid.js accepts without a word
  and reads as something other than what was meant: a typing mistake, something
  left unclosed, broken JSON, an id used twice. Check each rule by running the
  pinned mermaid.js on an example of ordinary writing, and by formatting the
  example.
- For each case that a rule reports, the output of mermaid.js loses, replaces,
  leaves without effect, or adds something, and the case names which value or
  text: an earlier `accTitle` replaced, text on a direction line dropped, a
  closer with no effect on the shape, a state that no statement writes. A value
  outside the range or the words that the documentation of mermaid.js defines (a
  score above 5, an unknown word of `excludes`) has no effect, on the ground of
  that documentation. Writing that mermaid.js reads by its grammar, with nothing
  lost, is no rule, also when the author probably meant another syntax:
  `Write ::icon(fa fa-book)` on the line of a node is the node `Write ::icon`
  with the label `fa fa-book`.
- The package holds no rule of these kinds:
  - A stylistic rule: mermaid.js reads the text as written, and only a later
    edit would break it. One exception: writing that relies on a form the
    documentation of mermaid.js does not show is avoided, so a `stroke` written
    with whitespace before its `:` in a `linkStyle` or a `classDef` of a
    flowchart or an agentflow is reported also where nothing is lost now (the
    notes of section 7, in
    [references/recommended-decisions.md](references/recommended-decisions.md)).
    A `stroke` in a `style`, which styles no link, is not reported.
  - A rule for text that is obscure on purpose.
  - A rule for a defect of mermaid.js: the author writes correct, meaningful
    text and mermaid.js misreads it (`subgraph Front end`, CSS in a label). The
    author has nothing to fix; the rule would rest on the implementation, not on
    the language, so it would call correct text a mistake once the defect is
    fixed; and the fix belongs in mermaid.js. A case is such a defect only where
    the text is written as the documentation of mermaid.js shows and no other
    way of writing avoids the loss (a URL with a fragment in `links`); where the
    documentation shows a form that loses nothing, it stays a mistake
    (`note left of A:hi`; the documentation puts a space after the `:`). A kept
    rule leaves such a defect out of its condition where the tree tells it apart
    from the mistake, and otherwise reports it with the mistake, as section 7
    says (the text `direction LR` inside a label).
  - A rule whose condition also matches a way of writing that an author means
    (`A[Issue #123; fixed]` has the same form as the entity `#9829;`).
  - A rule for what the formatter of this project makes visible (`A---orders` is
    printed as `A ---o rders`): it would be a second thing to maintain.
  - For now, a rule for a mistake that comes from not knowing the syntax, where
    the specification's grammar or text says that the way of writing means
    something else (`A"Start"` without brackets, `;` between styles).
- A rule is common only when one definition, over the part of the tree that
  every diagram type shares, covers every diagram type and they all behave the
  same; otherwise it belongs to a diagram type, and its name starts with
  `<diagram>-` (document `docs/rules/<diagram>-<name>.md`).

Read them before every decision.

### Examples of decisions (run)

The decisions made so far, the rules kept and the candidates dropped, each with
what mermaid does, are in
[references/adoption-decisions.md](references/adoption-decisions.md). Before
proposing a candidate, search that file for a past decision on it. Many rows
start with the diagram type in words (`In a state diagram`, `In a user journey`,
`In every diagram type`); the others name none, so search also for the keywords
of the input and for the name of the rule.

### Questions for unclear cases

1. Is the input something that a person who is simply drawing a diagram writes,
   not a copy of an unusual example of the specification?
2. Does mermaid, now, give a result different from what was written? If only a
   later edit breaks it, the rule is stylistic.
3. Does the condition of the rule also match a documented correct way of
   writing, or a way of writing that an author means? If it does, the rule is
   not kept. Always run one intended way of writing through mermaid as an
   example that is not reported.
4. Does the specification's grammar or text say that the way of writing means
   something else? If it does, and an author who knows the syntax would not
   write it, it is not kept for now. Mistakes that such an author makes by
   accident (an unclosed block, a typo, a reused id) are kept.
5. Does formatting the reported example (section 4) make the way mermaid reads
   it visible? If it does, the rule is not kept. Weak hints, such as indentation
   that does not line up or a difference in where spaces go, do not count.
6. Does the author write correctly, with a sensible meaning, while mermaid reads
   it wrongly? If the behavior looks like a bug, it is not a rule, whether or
   not the maintainers of mermaid treat it as one, its docs mention it, or it
   will be fixed. Record those facts with the decision: (a) read the section of
   mermaid's docs for that syntax and the warnings at the top of the page; (b)
   search the issues and pull requests by title (`in:title`) and by body, with
   the words as separate terms, and record the words; (c) say whether the user
   sees the wrong result in the drawn diagram, not only in the Db. Reporting the
   behavior to mermaid is outside this procedure and needs evidence.
7. When you cannot decide (an empty `%%` line, whitespace at the end of a line),
   ask for a decision, with the reasons on both sides.

## 3. Where to look for ideas

- The specification: `packages/spec/docs/common.md` and
  `packages/spec/docs/diagrams/<diagram>.md`, for the accepted but surprising
  readings written as consequences of the rules.
- Fixtures: `packages/tests/fixtures/<diagram>/` (`input.mmd`, `expected.json`,
  `ast.json`), above all those whose names start with `lex-`, `gram-`, or `db-`.
- The formatter's limits: `packages/prettier-plugin-mmd/docs/<diagram>.md` and
  `docs/compatibility.md`, which list where one space or one `;` changes the
  meaning.
- Existing rules: `packages/eslint-plugin/docs/rules/`. Do not propose the same
  rule again.
- Your own search: start from an author's mistakes (an unclosed block, a typo, a
  reused id, broken configuration JSON, leftovers of commenting out) and run
  mermaid; the unusual examples of the specification give mostly inputs that are
  obscure on purpose. Show an ordinary way of writing that mermaid reads wrongly
  (the word `end` in a subgraph name taking the line break) as a candidate
  mermaid bug, not as a rule.

## 4. Checking with mermaid and parse()

The scripts that run the pinned mermaid.js and `parse()` on a list of inputs
(`probe.mts`) and that format them (`format.mts`), with how to set them up,
write their inputs, and run them, are in
[references/probe-scripts.md](references/probe-scripts.md).

- For each candidate, run these three together:
  - an example that is reported (ordinary writing)
  - an example that is not reported (the corrected writing)
  - an intended way of writing (question 3 of section 2; for example `#9829;` or
    `R&D`)
- Check each claim of a condition or a suggestion with an input for each case
  that the claim distinguishes, and for each other rule that meets it at the
  place it names, as
  [the Principles of AGENTS.md](../../../AGENTS.md#principles) list them. The
  inputs are chosen from these cases; none is generated.
- Before showing the table of the cases of a rule, check it against these kinds
  of case, add a row for each kind that a sentence of the document touches, and
  run it through mermaid.js before the sentence states it:
  - a statement that takes its value from a later line, with an empty line, a
    comment line, or a directive between them (a second `accTitle:` that takes
    the line after `%% c` or after `%%{init: {}}%%`);
  - a word that a sentence says is read in any case, written in another case
    (`TITLE`, `Until`), and written without the whitespace after it (`untilb1`);
  - for a rule that compares a statement with earlier ones, first decide from
    what mermaid.js keeps and drops which earlier one it is compared with (the
    first, the first of its kind, or the latest), then write three occurrences
    that mix the kinds and the forms that the rule tells apart, so that the
    first statement and the right partner of the third differ (a requirement, an
    element, and a requirement of one name, where the third is compared with the
    second; for a rule that compares with the latest, any third, with a value
    that the rule does not count, such as an empty block, between), and check
    that the message names that partner; the plain third of one form gives two
    reports;
  - for such a rule, a statement that sets the value it replaces, also in
    another spelling that mermaid.js keeps as the same value (whitespace at the
    ends, a string and the same text, another case), which loses nothing and is
    not reported;
  - each kind of value that a rule does not count (an empty block, a block of
    only a comment line, a block of only directives);
  - an input where the rule meets a neighbouring rule (`A: 5:: x` in a user
    journey, an empty person and ignored text);
  - empty items in a row and a list of separators only (`a,,b`, `,`);
  - the counterpart of each form (`until` beside `after`, the end beside the
    start);
  - a character that ends a value that mermaid.js reads (`.`, a tab, a letter
    outside ASCII), and line ends written as CRLF;
  - data that mermaid.js does not read at all (four items of gantt data), where
    no rule reports.
- Judge whether the result changes by acceptance, rejection, and the Db summary
  that `runMermaid` gives for every diagram type (the normalizers are in
  `packages/tests/src/normalizers/index.ts`).
- Check how the tree shows what a rule reports by applying the condition to the
  result of `parse()`. Write the condition with the fields of nodes, the kinds
  and values of tokens, `Root.comments`, and `Root.directives`, never by lexing
  the text again. Say so when the value of a leaf node has to be searched, or
  when the tree and the tokens cannot show it.

## 5. Common rule or rule of a diagram type

The condition is the last item of "Policies and criteria" in section 2. Even
when the cause is the shared syntax (a rule of `common.md`), the rule is not
common when the lexer of a diagram type absorbs or rejects the input.

How to check:

1. Take the diagram types and their first words from the table of
   `packages/spec/docs/detection.md`, not from a list written by hand.
2. For each, make the smallest diagram that starts with that word and check that
   mermaid accepts it. The pinned mermaid.js accepts these (run; in parentheses,
   the diagram type id it returns); make the others when needed:
   - `sequenceDiagram`, a line break, `A->>B: hi` (sequence)
   - `classDiagram`, a line break, `class A` (classDiagram)
   - `stateDiagram-v2`, a line break, `[*] --> A` (stateDiagram)
   - `erDiagram`, a line break, `A ||--o{ B : has` (er)
   - `gantt`, a line break, `title T`, a line break, `section S`, a line break,
     `Task :a1, 2024-01-01, 1d` (gantt)
   - `pie`, a line break, `"a" : 1` (pie)
   - `journey`, a line break, `title T`, a line break, `section S`, a line
     break, `Task: 5: Me` (journey)
   - `gitGraph`, a line break, `commit` (gitGraph)
   - `mindmap`, a line break, `root`, a line break, `  A` (mindmap)
   - `timeline`, a line break, `title T`, a line break, `2020 : a` (timeline)
   - `quadrantChart`, a line break, `x-axis Low --> High` (quadrantChart)
   - `requirementDiagram`, a line break, `requirement r {`, a line break,
     `id: 1`, a line break, `}` (requirement)
   - `block`, a line break, `A` (block)
   - `xychart`, a line break, `x-axis [a, b]`, a line break, `bar [1, 2]`
     (xychart)
   - `sankey`, a line break, `A,B,1` (sankey)
   - `packet`, a line break, `0-15: "A"` (packet)
   - `kanban`, a line break, `todo`, a line break, `  a` (kanban)
   - `architecture-beta`, a line break, `service a(server)[A]` (architecture)
   - `C4Context`, a line break, `Person(a, "A")` (c4)
   - `radar-beta`, a line break, `axis a, b, c`, a line break, `curve c1{1,2,3}`
     (radar)
   - `treemap-beta`, a line break, `"A"`, a line break, `  "B": 1` (treemap)
   - `info` (info)
3. Put the construct in each diagram and run them through mermaid. A diagram
   type that rejects it needs no rule.
4. For a diagram type that accepts it, read its lexer rules in the build of the
   pinned mermaid to see whether the result changes.
   - They are in
     `node_modules/.pnpm/mermaid@<version>/node_modules/mermaid/dist/chunks/mermaid.core/`.
     The file name has one of these forms:
     - `<name>Diagram-*.mjs` (sequenceDiagram, pieDiagram, and others)
     - `<name>-definition-*.mjs` (timeline, mindmap, kanban)
     - `diagram-*.mjs` without a name (packet, radar, treemap, and others). Find
       it with `grep -l` for the diagram type id.
   - Extract the lexer rules of a jison diagram, regular expressions of the form
     `/^(?:...)/`, with `grep -o`.
   - A Langium diagram has no such rules (pie, gitgraph, info, architecture;
     run); treat whether its Db changes as unchecked.
5. Example: a line that holds only `%%`.
   - Only flowchart-v2 makes the vertex `%%` (run).
   - er and sankey reject it (run).
   - sequence, classDiagram, stateDiagram, gantt, journey, timeline, mindmap,
     kanban, c4, quadrantChart, and xychart have a lexer rule that reads a line
     starting with `%%` as a comment (run; extracted with grep).
   - So this rule is a rule of flowchart.

## 6. What a decision shows

For each rule decided, show:

- The name of the rule (`<diagram>-<name>`, or `<name>` for a common rule; its
  id is the name after `@mmd-toolkit/`), and whether it is common or belongs to
  a diagram type.
- What it reports (one sentence).
- Why: how mermaid reads the input, why it happens in ordinary writing, and why
  the result differs from what was written.
- An example that is reported, an example that is not reported, and an intended
  way of writing, each accepted, in ordinary writing, with the result of mermaid
  (run); a lead-in added only to check the behavior (such as an earlier
  description) goes in the reason and the fixtures, not in the example.
- How the tree shows it: which node, field, or token finds it, with the result
  checked on `parse()` (run).
- The supporting fixtures: their names if they exist; otherwise the smallest
  inputs to add, with a contrasting example.
- Whether the `recommended` configuration enables it, and why, decided by
  section 7.
- Its suggestions, or why it has none, decided by section 8.
- Its options, and an option considered for later with the condition for adding
  it, recorded in the table below; the rule document names only the options that
  the rule has.

Show what was decided to be dropped as well, with the name and the item of
"Policies and criteria" in section 2 under which it was dropped.

When writing a rule document shows a new candidate, a needed change of scope or
name, or that the tree cannot show something, decide it again with the same
criteria and show the result in the same form.

Decisions about options:

| Rule                                                                      | Options | Considered for later                                                                                                        |
| ------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------------------- |
| flowchart-no-empty-description-block, sequence-no-empty-description-block | None    | Also reporting a block that holds only comments, which the rule does not report: added only if users of the rule ask for it |
| Every other rule                                                          | None    | None                                                                                                                        |

## 7. Whether `recommended` enables a rule

`recommended` is the set of rules whose reports are nearly always mistakes to
fix. Every rule reports such a mistake (section 2), so a kept rule is enabled
unless it fails one of these criteria:

1. **Every report is a fact.** At every place the rule reports, mermaid.js reads
   the text differently from what the author meant: it drops the text, reads it
   as something else, rejects it, or replaces an earlier value.
2. **No intended way of writing is reported.** No form that an author writes on
   purpose matches the condition. A kept rule normally meets this; a rule for
   which a doubt remains is not enabled.
3. **The reports do not rest on behavior of mermaid.js that is expected to
   change.** No pull request that fixes the behavior is open, and the
   maintainers of mermaid.js have not said they will fix it: once mermaid.js
   changes, the reports would no longer be facts.
4. **The fix is clear.** An author who gets a report knows what to write
   instead.

A defect of mermaid.js reported with the mistake because it lies in the same
node does not keep a rule out (the text `direction LR` inside a label, which
flowchart-no-ignored-text reports with the text on a direction line): mermaid.js
drops that text too (criterion 1), and the author avoids it by rewriting the
text (criterion 4).

Judge each rule against its document, case by case:

1. Criterion 1: check each case that the document distinguishes, also those that
   the document names as reported although mermaid.js reads them as written.
2. Criterion 2: check each case with the question of section 2: the report says
   what the output loses, replaces, leaves without effect, or adds, with no
   guess about what the author meant, and reports no way of writing that the
   documentation of mermaid.js shows. Where an author may write the form on
   purpose, as an empty block left to be filled in, the note says what the
   report states then.
3. Criterion 3: search the issues and the pull requests of mermaid.js for each
   rule, and record the words and what they found.
4. Criterion 4: check that the document says what to write instead.

The decision of each rule, and what was checked for each criterion, are in
[references/recommended-decisions.md](references/recommended-decisions.md). To
find the decision on a rule, search that file for the name of the rule. Read
also the paragraph that opens the notes of its diagram type
(`The XY chart rules.`), a note on a group of rules that names the rule as
`<diagram>-<name>` with a list of diagram types, and the notes that a found note
refers to (`the notes of the title rules above`).

## 8. Suggestions

Decide whether a kept rule offers suggestions (edits applied only when the user
picks one in the editor) or a fix, and which. A candidate edit is a suggestion
only when it meets the five criteria below.

Offering no suggestion is better than offering a guarded one. A candidate is
offered only where one or two sentences of the specification state when it is
right; one that would need a parse of its result, a check for each known
divergence, or an exception for a diagram type is not offered, and no condition
is added to keep it. The same holds within a rule: it offers the edit only in
the cases that such sentences cover (removing a statement only when it has its
lines to itself, joining a range only when no comment stands in it), and none in
the others.

1. **The candidates are few, and the reported text decides them (one to
   three).** What an edit writes is decided by the positions of the tree and its
   tokens, and the values of its nodes. An edit that needs a new name (a
   mistyped id changed into another id, a reused id changed into a new one) is
   no candidate: the text does not tell which name was meant.
2. **Every candidate is something the author may have meant.** The result is one
   of the forms that an author who made the mistake meant to write. An edit that
   only silences the rule, whatever the author meant, is no candidate.
3. **The conditions are written from the sentences of the specification, the
   rule no longer reports that place, and the edit writes no new mistake.** No
   edit parses its result when the rule runs: at about 0.04 ms a line, 100
   reports in a diagram of 1,000 lines would take about 9 seconds on every lint.
   An edit that gives back as statements the lines that a block, a directive, a
   backquote, or a name took (closing a block at the end of the line of its `{`,
   closing a treeview name, closing a directive, closing a backquoted name), and
   an edit that splits a line at a `;`, are not offered: whether those lines
   come back as statements, and how mermaid.js reads them, is known only by
   parsing the whole result and by checking it for the known divergences, which
   repeat steps of the lexer of mermaid.js that the specification does not
   state. Closing an unclosed block while it is empty is no candidate: the edit
   writes an empty block, which no-empty-description-block reports. Another rule
   may report the result only for a mistake that the text of the author already
   held and the edit makes visible: closing an unclosed block after an earlier
   description shows that the text sets the description twice, which
   no-duplicate-description reports. The tests of a rule list the rules whose
   reports its suggestions may make visible in this way, each with the mistake
   it shows, and fail on a report of any other rule on a result. This section
   and [references/suggestion-decisions.md](references/suggestion-decisions.md)
   record them and the fixtures show them, not the rule document.
4. **How mermaid.js reads the result is known.** This section,
   [references/suggestion-decisions.md](references/suggestion-decisions.md), and
   the fixtures hold that reading, checked by running an example through
   mermaid.js (run). The message of a suggestion says only the edit, as
   ``Remove this `accTitle` statement.``,
   ``Remove the earlier `accTitle` statement.``, `Remove the empty block.`, and
   `Close the block at the end of the text.`, not the reading: the result shows
   it, and a clause on it would be false for the second of three statements that
   set the same value.
5. **The result does not hang on invisible whitespace.** An edit that changes
   the reading only through whitespace at the end of a line (a space after `%%`)
   is no candidate: an editor that removes such whitespace on saving undoes it.

An edit is a fix (`meta.fixable`; applied by `eslint --fix` and by an editor on
saving) instead of a suggestion only when both of these hold. First, the result
is beyond doubt what the author meant and mermaid.js then reads it as meant: the
text allows this one edit, and it removes nothing and adds nothing that the
author may have meant otherwise. Second, what decides the edit lies in the text
that it changes and in its own statement: `--fix` applies in one pass the fixes
of every rule found on the same text, all those whose ranges do not overlap, and
then lints again, up to ten passes (`lib/linter/source-code-fixer.js` and
`MAX_AUTOFIX_PASSES` of ESLint), so a fix whose condition reads other lines
could be made wrong by the fix of another rule in the same pass. A condition
that only withholds a fix may read other lines when no fix can create the form
that it looks for: the fix then comes in a later pass. A report that offers a
fix offers no suggestion of the same edit; where the conditions of a fix do not
hold for a report, that report offers the edit as a suggestion. Which edits are
fixes is listed under Fixes in
[references/suggestion-decisions.md](references/suggestion-decisions.md).

A rule document says nothing about the suggestions in its body (the skill
`eslint-plugin`,
[section 3](../eslint-plugin/SKILL.md#3-the-form-of-a-document)): the generated
notice says that the rule has suggestions or a fix, and the message of each says
its edit. What each edit changes, the conditions under which it is offered, how
mermaid.js reads the result, what it may make visible, why a rule offers none,
and the permalinks to the source of mermaid.js that explain it are recorded in
this section and in
[references/suggestion-decisions.md](references/suggestion-decisions.md); the
implementation follows this record, and the tests of the rule check it. The
readings were checked on the invalid fixtures of each rule (run).

### The kinds of edits

No edit takes a directive with it. An edit is not offered when a directive lies
within the range that it removes or replaces, because the settings of the
directive would go with it: in sankey, `a,b,1%%{init: {"theme":"dark"}}%%_000`
rewritten as `a,b,1000` is accepted (run), and the directive, and with it the
theme, is gone. A directive next to the range stays where it is (the whitespace
after a directive that block-no-spaced-class-id removes), and an edit inside a
directive (no-invalid-init-directive, no-duplicate-init-key) changes only its
argument. Fixtures: the sankey value above (none), and a value of the same rule
without a directive (offered).

- Remove a statement: the statement with its lines and their line terminators,
  only when it has its lines to itself: no character other than whitespace, and
  no comment, stands before it on its first line or after it on its last line,
  so that no other statement, `;`, or comment shares them. A statement over
  several lines, as `accTitle:` of flowchart with its text on the next line,
  goes with all of them. A statement that shares a line with another statement,
  a `;`, or a comment gets no removal: `A --> B; accTitle: x` and
  `accTitle: style:#b;` keep their lines. For the duplicates, mermaid.js uses
  the last description or title that remains (run); a description inside a
  subgraph is also a member of the subgraph in the Db, so removing it changes
  the members as well (run). Fixtures: a statement alone on its line (offered);
  one with another statement after it on its line, one after a `;`, and one with
  a comment after it on its line (none); an `accTitle:` whose text is on the
  next line (offered, both lines go).
- Remove the statement before it: offered only when the rule then no longer
  reports this statement (after `accTitle: A`, `accTitle: A`, and `accTitle: B`,
  removing the second `A` leaves `B` replacing the first, against criterion 3;
  run). For a part, the same holds with the part before it.
- Remove a line statement of eventmodeling: an `accTitle:` or `accDescr:` line
  is written after another statement on its line in the usual form
  (`eventmodeling accTitle: First`, `tf 01 evt Bought accTitle: Second`); such a
  line statement claims the ASCII space or tab before it, and its text runs to
  the end of the line or to the first `%%`
  (`packages/spec/docs/diagrams/eventmodeling.md`, the common forms), so the
  statement before it ends before that space. There, the statement is removed
  with the spaces and tabs before it, up to the end of its line and without the
  line terminator, when nothing follows it on its line; with a `%%` after it, it
  gets none. All such statements in the invalid fixtures of the rules and in the
  corpus of eventmodeling, removed so, leave a text that the parser and
  mermaid.js accept and that mermaid.js reads as before apart from the title and
  the description (run). Fixtures: after the header (offered), after a frame
  (offered), and with a comment after it (none).
- Remove a part of a statement (gitgraph-no-duplicate-option,
  radar-no-duplicate-option, quadrant-no-duplicate-style,
  venn-no-duplicate-style, usecase-no-duplicate-metadata,
  treeview-no-duplicate-annotation, no-duplicate-init-key, and
  journey-no-empty-person): the part goes with one separator next to it, so that
  no separator is left alone and the list keeps its form. Where the parts are
  separated by `,` (radar options, quadrant and venn styles, usecase metadata,
  the members of a JSON object, journey people), the `,` before the part goes,
  or, for the first part, the `,` after it, each with the whitespace next to it
  on the side of the part. Where the parts are separated by whitespace (gitgraph
  options, treeview annotations on the line of the node), the whitespace before
  the part goes. A part that is the only one of its statement is not removed as
  a part: the statement goes instead, under the condition for statements (a
  radar option, a venn property, a usecase update), and a usecase heading of a
  `systemBoundary` loses its metadata block instead, which the grammar allows
  (`packages/spec/docs/ast/usecase.md`, the metadata of a boundary may be
  absent). A treeview annotation on a line of its own goes with its line, under
  the condition for statements. The results are the forms that the grammar of
  each list allows, so no other check is needed; gitgraph has the conditions
  given with its rules in
  [references/suggestion-decisions.md](references/suggestion-decisions.md).
  Fixtures: the first, a middle, and the last part of a list (each offered, with
  its separator); a part that is the only one of its statement (the statement
  goes, or none when the statement shares its line); a treeview annotation on
  the line of the node and on a line of its own.
- Remove or join across line terminators: an edit that removes, or joins into
  one line, a range that holds a line terminator (the whitespace around a
  separator or inside brackets that spans lines, a part of a statement that
  spans lines, the line break before a line that is joined) is offered only when
  no comment stands in the range and every line of the range other than its
  first and its last is empty or holds only whitespace. Otherwise joining the
  edge lines can make a comment take the text after it, or move a line between
  them into the value. Fixtures: in block-no-invalid-direction,
  `A<["x"]>(right`, `%% c`, and `down)` (none; run: accepted by the parser and
  by mermaid.js), and `A<["x"]>(right ,`, an empty line, and ` down)` (offered).
- Remove an empty block: under the condition for statements. Removing an empty
  block leaves the Db as it is in flowchart (run); a block that holds a
  directive is not removed, by the rule on directives above (run: removed, a
  subgraph would lose the direction that `inheritDir` gave it). Where the block
  empties the description (architecture, cynefin, gitgraph, packet, pie, radar,
  railroad, treemap, treeview, usecase, and wardley) or sets its own text
  (eventmodeling), mermaid.js then uses the last description that remains (run),
  and no-duplicate-description may report a later statement. In eventmodeling, a
  block stands after another statement on its line, as the line statements do
  (at the start of a line it is rejected, except after a `---` block, where it
  has its line to itself and the condition for statements applies; run), and may
  have another statement after it
  (`eventmodeling accDescr {} tf 01 evt Bought`). There, the block is removed
  with the spaces and tabs before it on its line, and what follows it stays. All
  such blocks in the invalid fixtures of the rules and the corpus of
  eventmodeling, and the inputs written for the question (after the header,
  after a frame, with a frame, an `accTitle:`, or a comment after it, at the end
  of the text, and a block that spans lines), removed so, leave a text that the
  parser and mermaid.js accept and that mermaid.js reads as before apart from
  the description (run). Fixtures: an empty block alone on its line (offered),
  and one after a statement on its line, outside eventmodeling (none).
- Close a block at the end of the text: a line `}` after the last line, where a
  block without its `}` is accepted (agentflow, flowchart, sequence, state, and
  xychart), only when the block has text on a line after the line of the `{`.
  The closing gives back no line. A block that holds a directive that is not
  closed gets none: from that directive on, the directive decides what
  mermaid.js reads (run: closing at the end of the text a block with `d`, then
  `more %%{wrap` and `A --> B`, gives the description `d` and `more --> B`). A
  block left open at the end of the text, with the lines `Long` and `text`,
  closed at the end of the text, has those two lines as its description (run).
  May make visible: no-duplicate-description, when a description is set before
  the block (`accDescr: d`, then `accDescr { x` closed, gives `x`; run). A block
  that a later `}` closes is reported too, and gets none: after
  `accDescr { first`, the lines `B --> C`, `A{y}`, and `D` give the description
  `first`, `B --> C`, `A{y` and only the vertex `D`, because the `}` of `A{y}`
  closes the block (run); the condition is that the text of the block holds a
  `{` on a later line than the `{` of the block and the closing `}` does not
  stand alone on its line, so that the `}` that closes the block is the one of a
  shape or data block on that line, also one that spans lines (`B{`, then `y}`;
  run). A `}` is alone on its line when only whitespace and directives stand
  before it there, whatever follows it (`};`, `} C`; run): `accDescr {`,
  `uses { here`, and `}` close with the author's `}`; a `}` on the line of the
  `{` (`accDescr { a { b }` gives `a { b`) and a `}` alone on its line
  (`accDescr { x {`, then `}`, gives `x {`) close the block as written and are
  not reported (run).

### The rules

The edits that each rule offers, and which edits are fixes, are in
[references/suggestion-decisions.md](references/suggestion-decisions.md). To
find those of a rule, search that file for the name of the rule and for its name
as `<diagram>-<name>`, which an item on a group of rules uses with a list of
diagram types, and read the item of its diagram type (`- class:`).

The rules whose report is an element, a label, or a name written again for
another value, where the likely fix is a new id or name, get none by criterion
1; removing one of the two would only silence the rule when two were meant. The
rules whose report is a setting, a style, or an option of one element written
again get the two removals.
