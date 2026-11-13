---
name: rule-ideas
description:
  Find ideas for the rules of @mmd-toolkit/eslint-plugin and decide which rules
  to keep (adoption, name, scope, whether `recommended` enables them). Use when
  looking for new rule candidates, reviewing proposed candidates, or rechecking
  existing rules against the adoption criteria. Deciding the suggestions of a
  kept rule has a skill of its own, rule-ideas-suggestions.
---

# Finding rule ideas and deciding which rules to keep (rule-ideas)

How to find candidate rules for `@mmd-toolkit/eslint-plugin` (an ESLint language
plugin for Mermaid diagram text) and decide whether to keep each one, its name,
its scope, and whether `recommended` enables it. The adoption criteria are in
"Policies and criteria" in section 2.

## 1. What this procedure covers, and how to work

- Show the decisions in the form of section 6. This procedure writes no file of
  the repository except the records of sections 2 and 7
  ([references/adoption-decisions.md](references/adoption-decisions.md) and
  [references/recommended-decisions.md](references/recommended-decisions.md))
  and the record of the skill rule-ideas-suggestions
  ([references/suggestion-decisions.md](../rule-ideas-suggestions/references/suggestion-decisions.md)).
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
    [section 4](../eslint-plugin/references/checking-before-and-after-writing.md)).
- Mark each claim as run (checked by running it), read (checked by reading), or
  unchecked. Withdraw a wrong claim in those words.
- Read the current specification before relying on it.
- Read the skill [conventions](../conventions/SKILL.md) first: the working tree
  is treated as its section
  [The working tree](../conventions/SKILL.md#the-working-tree) says, and the
  scripts of a check are set up and run as its section
  [Scripts run outside the repository](../conventions/SKILL.md#scripts-run-outside-the-repository)
  says.

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

The places to look for new candidates, and what each gives, are in
[references/where-to-look.md](references/where-to-look.md). Read it when looking
for new candidates.

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
   mermaid accepts it. The diagrams that the pinned mermaid.js accepts are in
   [references/minimal-diagrams.md](references/minimal-diagrams.md), one for
   each first word; make the others when needed.
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
  it, recorded in
  [references/option-decisions.md](references/option-decisions.md), whose last
  row holds every rule that it does not name; the rule document names only the
  options that the rule has.

Show what was decided to be dropped as well, with the name and the item of
"Policies and criteria" in section 2 under which it was dropped.

When writing a rule document shows a new candidate, a needed change of scope or
name, or that the tree cannot show something, decide it again with the same
criteria and show the result in the same form.

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

Whether a kept rule offers suggestions or a fix, and which, is decided with the
skill [rule-ideas-suggestions](../rule-ideas-suggestions/SKILL.md), which also
keeps the record of each rule.
