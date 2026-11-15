---
name: recorded-trees
description: >-
  Check the recorded trees of the conformance corpus (ast.json) that a change
  adds or rewrites: run recorded-trees:check with a base, read each changed tree
  against the sentences that cite its fixture, and answer each item that the
  command lists to read by comparing the tree, token, and position documents
  with the values of the trees. Use after pnpm run test:record or test:update in
  packages/parser, when reviewing a change whose diff has an ast.json, and when
  a change alters a block of those documents or a section that such a block
  links to.
---

# Checking recorded trees

Japanese version: [SKILL.ja.md](./SKILL.ja.md)

Read [conventions](../conventions/SKILL.md) first. Reviewers also follow
[review](../review/SKILL.md), sections 2, Inputs, and 5, Findings and the
report. The command, its output, the table, and the answer file format are
defined in [recorded-trees.md](../../../packages/tests/docs/recorded-trees.md);
read its sections Running it, The blocks and the items, The coverage table,
Answers, and What it prints before these steps.

## Policies and criteria

- Check the recorded `ast.json` that a change adds or rewrites, against the
  sentences that cite its fixture and the conditions of the tree, tokens, and
  positions. Changed document conditions also require reading the records of
  their cases (section 8). `parse-error.json` is outside this reading; the
  parser's recording steps still read new rejection records.
- An answer shows a comparison of what the block says with the values of the
  trees. "Read" or "everything agrees" alone is no answer. Section 5 gives the
  content of an answer; the command checks only its presence.
- Reviewers answer independently, before reading the author's answers, and
  compare afterwards. They put their answers in the review report and edit
  nothing in the working tree.

## 1. Running the command

After recording, run at the repository root:

```sh
pnpm --filter @mmd-toolkit/tests run recorded-trees:check --base HEAD --places
```

This base checks the records of the uncommitted work, including untracked files.
Before requesting review, use `--base origin/main --places` for the whole pull
request. The base is the merge base of the given ref and `HEAD`; the command
needs a git checkout with that history, not an archive.

Read the whole output, without filtering it. Its first section says whether it
checked the changed trees or every recorded tree, and why. Use the reported
scope rather than a list of rule files kept by hand.

Exit code 2 is a usage or git error: correct the invocation or history and run
again. Exit code 1 from missing answers is the work list for sections 3 to 5;
resolve the other problems first (section 2).

## 2. When problems are reported

Read Problems, including unreadable records, unclassified node types, and
unreadable answer or table files. For a `checkTree()` problem, find its message
in [The checks](../../../packages/tests/docs/check-tree.md#the-checks) and read
the tree, token, and position blocks that define its condition. Decide where the
error is before answering:

- Parser: correct it and record again with step 4 of
  [parser section 4.7](../parser/SKILL.md#47-recorded-parse-results).
- Specification: report a missing or wrong definition as in step 2 of
  [parser section 4.2](../parser/SKILL.md#42-reading-the-specification-and-its-gaps-first).
- Check rule, node classification, or table: report it to the tests package.
  Correct an unreadable answer in this change's file under section 9.

Do not repair `ast.json` by hand: the fixture test records it, as
[parser section 4.6](../parser/SKILL.md#46-tests) requires.

## 3. Reading each changed tree against its citing sentences

Use Sentences that cite each changed tree in the output and follow step 3 of
[parser section 4.7](../parser/SKILL.md#47-recorded-parse-results): read the
whole citing text, identify its case, and compare the parts of the tree it
touches with that sentence and the tree, token, and position blocks. Write the
tree's answer in this change's answer file (section 5), unless the base already
answers its content key.

For a tree with no citing sentence, say so and do not compare it in this step;
the item readings of section 4 cover its diagram type. Report a missing citation
to the specification only for an authored fixture that this change adds.
Collected inputs (`source.kind` is `mermaid`) need no citation; a collected
input that is cited is read like any other. If the output says its source kind
is unknown, read `expected.json` before deciding whether to report it.

## 4. Reading the items

Read every item under Items to read, including items with zero places and items
marked as answered by this change. Items answered at the base need no new
answer. For each item:

1. Read the whole block in its document, not just the opening words printed by
   the command, and every section printed as `read with`.
2. Read the cited cases' records to understand the condition. Cases help the
   reading; they are not the unit of an answer.
3. Compare the values at every place from `--places` with the condition. For a
   whole-tree place, read the tree with
   `pnpm run show-trees <diagram> <fixture>` in `packages/parser`. For a node or
   token, read any fields or text that the displayed source excerpt does not
   show there too.
4. With zero places, read the input and tree to establish that the input has no
   text that should have been a node of that type or a token of that kind. A
   wrongly recorded kind must not escape the reading by giving zero places.
5. Give one answer per item, covering the content keys of the trees read.

If the documents do not decide a value, do not keep the undecided tree as a
record: report the question, as step 1 of parser section 4.7 requires.

## 5. Writing the answers

Use one file for this change in `packages/tests/recorded-trees/answers/`. Follow
[Answers](../../../packages/tests/docs/recorded-trees.md#answers) for its
format; for changed trees, copy item and content keys from the Missing answers
template. For changed document items, use the keys in Items whose key changed
(section 8). The command writes no file. Write the answer text in English, as
with a fixture's `expected.json` note; JSON records have no Japanese Markdown
pair.

An item answer states:

- What the block says, in one sentence in the reader's words.
- The values compared: for each kind of value, the number of places and the
  comparison with what the block says.
- For zero places, what was read to establish the absence of text that should
  have that node type or token kind.
- Whether they agree; list every mismatch by its place key and resolve its cause
  under section 2 before keeping the record.
- Whether the evidence was run or read, as the review skill defines those words.

A tree answer gives the citing sentences by document and line, the case each
shows, the parts of the tree compared, the item keys of the blocks compared
with, and whether they agree. Say when a case touches no part of the tree. For
an uncited tree, write "no sentence cites it", say that its diagram's item
readings cover it, and, for a newly added authored fixture, record that the
missing citation was reported to the specification. Its content key comes from
the template, like an item answer's tree keys.

Resolve mismatches before keeping the records, so the file holds answers that
agree. Run the command again until it exits with 0: no problems and no missing
item or tree answers. This does not settle the table judgments of section 8.

## 6. Reporting and after merging

Report the command and base, the scope and its reason, the tree counts, any
problems and their resolution, and the answer file path. Do not copy the answers
into the author's report. List the changed `parse-error.json` under Records this
check does not read; report their separate reading as parser section 4.7
requires. Name any unread item or tree, why it was not read, and who can read
it, as review section 5 requires.

Follow conventions, Running tests, for what the result is evidence of. A run
with `--base HEAD` is not a check of the whole pull request.

As
[Until the table is judged](../../../packages/tests/docs/recorded-trees.md#until-the-table-is-judged)
states, the command is not part of CI until every table item is judged. Report
that absence and use the local result. When CI runs the command, read its scope
and problems too; handle problems after merging by section 2, including when a
rule change and a tree change meet on main.

## 7. Reviewing a change

1. Use the pull request's head in a git checkout with dependencies and no
   unrelated working changes. Run with `--base origin/main --places`; the
   command does not write to the working tree. Uncommitted and untracked files
   count, so an unrelated working tree or an archive does not give the pull
   request's scope. If CI ran it, compare its tree count and investigate a
   difference, taking its logged base into account; otherwise report its
   absence.
2. Read the problems. A tree that breaks a condition is a high-severity finding
   under review section 5; a missing answer is a missed reading. Check that a
   change to the runner or a file it reaches checks every tree, as the output
   explains.
3. Before reading the author's answers, perform sections 3 and 4 for the same
   items and trees, and section 8 for changed document items, and write your own
   answers in the review report. Do not read answer files, their diffs
   (including a pull request diff), or answers in the author's report or
   description until then. Afterwards compare them. Report differences with
   evidence of which tree, document, or answer is wrong, and answers with no
   comparison. Check the paths and statuses of the answer-file diff: only this
   change's file may be added; deleting or modifying a file of another change is
   a finding. This check need not read its answer text.
4. Read table rows added or changed here, and rows whose named test files this
   change edits. For `shown`, read the named tests: together they must break
   every case of this block's condition, not another condition. If reading is
   insufficient, copy a named recorded tree with that case and its input into
   your scratchpad, break that case, and call the repository's
   `packages/tests/src/check-tree/index.ts` from a small script with `node`. For
   example, change an `ErIdentifier` token from `Identifier` to `RawText` to
   check a condition on its kind. No build is needed. Choose a tree by the case,
   never by a count or at random. A case not reported makes the `shown` row
   wrong: a high-severity finding against the tests package.
5. For `no-condition`, read the whole block and check its kind and note against
   [The coverage table](../../../packages/tests/docs/recorded-trees.md#the-coverage-table),
   including the named documents for `not-in-diagram`. A condition's example is
   a case; a block that mixes a condition with an introduction still has a
   condition. Hiding either under `no-condition` is a high-severity finding,
   since nobody then reads that item.
6. Read Stale rows of the coverage table and Items not judged by the coverage
   table. Report rows or items introduced by this change, using the output's
   comparison with the base; do not make existing debt a finding on this change.
   The tests package must judge the new ones in the same pull request, even
   though they do not fail the command. Apply this check to document-only
   changes and changes to a `checkTree()` test too.

Report under review section 5, with your answers and run/read evidence.

## 8. When the tree, token, or position documents change

A block's text or a linked section can change an item's key. Citation-only
changes do not. Run with `--base origin/main --places` and use Items whose key
changed, which gives the reason and the fixtures to read:

- Block text changed: the fixtures that the block cites.
- Linked section changed: the fixtures cited by blocks present in only one of
  its two versions, as that version cites them, of the item's diagram type.
  These show the changed sentences' cases; the unchanged item block's own
  citations do not replace them.
- Both changed: the union of those fixtures.

For each item, compare those accepted fixtures' `ast.json` with the item block
read under its new text and linked sections, as in section 4. Do not read
rejection records here. Note fixtures that the output says no longer exist or
have no tree, so the report states which records were not read. Take the item
and content keys from Items whose key changed. Write one item answer in this
change's file, covering those content keys, as section 5 requires, even though
the command does not require answers for a document-only change. Keep previous
answers under section 9.

Ask the tests package to judge stale rows and unjudged items in the same pull
request, with the steps of [tests-tree-checks](../tests-tree-checks/SKILL.md),
step 8. Do not make those judgments as document work. A new or rewritten block
with no cited fixture needs fixtures for its cases under conventions; the
specification review asks for them. This also applies to changed blocks in a
linked section, but not to a deleted block or a block whose own text is
unchanged.

Reviewers perform the same comparisons before reading the author's answers, then
compare; check answer-file changes and the increase over the base in stale rows
and unjudged items as in section 7.

## 9. Keeping the answer files

Write only this change's file. Keep it after merging and do not rewrite it in a
later change. Do not add, delete, or rewrite another change's answer file. When
records change, answer the new content in this change's file; keep the old
answers even when their item or content keys no longer match, or an item becomes
`shown`. A rename or move with the same content is covered by its existing
answers, as recorded-trees.md, Answers, defines.
