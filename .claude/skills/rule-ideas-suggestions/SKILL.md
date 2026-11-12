---
name: rule-ideas-suggestions
description: >-
  Decide whether a kept rule of @mmd-toolkit/eslint-plugin offers suggestions or
  a fix, and which, and keep the record of each rule. Use when the suggestions
  or the fix of a kept rule are decided or rechecked, and when a suggestion or a
  fix is implemented with the eslint-plugin-rules skill, together with the
  rule-ideas skill.
---

# Deciding the suggestions of a rule (rule-ideas-suggestions)

Sections 1, 2, and 4 of the skill [rule-ideas](../rule-ideas/SKILL.md) (what the
procedure covers and how to work, the adoption criteria, and checking with
mermaid and parse()) hold for these steps too. Read them first.

## 1. Suggestions

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
