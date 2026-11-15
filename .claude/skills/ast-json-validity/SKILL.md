---
name: ast-json-validity
description: >-
  A checklist and the procedure for AI agents to check recorded ast.json trees
  against the specification, node by node and token by token. Use after
  test:record or test:update in packages/parser, when reviewing changed trees,
  when a fixture input changes, or when tree, token, or position documents or
  sections they link to change.
---

# Checking recorded trees

Japanese version: [SKILL.ja.md](./SKILL.ja.md)

This procedure is for AI agents only. People are not asked to follow it. Read
[conventions](../conventions/SKILL.md) first. Reviewers also follow
[review](../review/SKILL.md), sections 2, Inputs, and 5, Findings and the
report.

## 1. Read the input and write the expected tree

From the repository root, list changed fixture inputs and trees:

```sh
git diff --name-only <base> -- 'packages/tests/fixtures/**/ast.json' 'packages/tests/fixtures/**/input.mmd'
```

Use `HEAD` for uncommitted work and `origin/main` for the whole pull request.
Include untracked fixture paths from `git status`. Check each listed fixture
once if it has an `ast.json` now, whether its input, tree, or both changed.
Rejection records (`parse-error.json`) are outside this procedure.

For each fixture, before opening `ast.json`:

1. Read the whole `input.mmd`; inspect the bytes where invisible characters
   matter. Distinguish whitespace, line terminators, and the end of the text.
2. Determine the diagram from the input, also for a fixture in `common/`. Read
   `packages/spec/docs/diagrams/<diagram>.md`, `common.md`, and the applicable
   definitions in `known-divergences.md` and its linked documents.
3. Read `packages/spec/docs/ast.md` and `ast/<diagram>.md`,
   `packages/parser/docs/tokens.md` and `tokens/<diagram>.md`, and
   `packages/parser/docs/positions.md` and `positions/<diagram>.md`. Follow the
   sections linked by the applicable blocks.
4. Write the expected nodes, tokens, and records: types, kinds, parent and child
   fields, order, values, ranges, and `loc`, including nulls, empty lists,
   comments, directives, and frontmatter. Identify the input text each covers
   and the document sentences that decide it. Derive boundaries from the input,
   in UTF-16 code units, before the record can steer the expectations.

If the documents do not decide a question, follow
[Resolve mismatches](#4-resolve-mismatches).

## 2. Compare with the checklist

Open `ast.json` and compare it with the expected tree, item by item using
[the checklist](references/checklist.md). Apply every item to the whole input
and to every node, token, and record it concerns. Check for missing constructs
from the input too; the recorded types and kinds do not limit the comparison.
Read the applicable blocks of the diagram's documents, including their linked
sections, rather than only the field tables. A range spanning text does not by
itself account for that text.

## 3. Read the citing sentences

Find the sentences that cite the fixture:

```sh
git grep -n "<diagram>/<fixture>]" -- packages/spec/docs packages/parser/docs packages/tests/docs packages/prettier-plugin-mmd/docs
```

This finds `[fixture: <diagram>/<fixture>]` and
`[corpus fixture: <diagram>/<fixture>]`, including a citation wrapped after
`fixture:`. In formatter documents, only `corpus fixture` cites this corpus.

A citation stands in a paragraph of citations or in a table's `Fixtures` cell.
Read the sentences immediately before its paragraph of citations, back to the
previous paragraph of citations or the start of the paragraph or list item. A
paragraph of citations after a table cites the whole table; one after a code
block cites that example; a `Fixtures` cell cites its row. Read the whole
paragraph, list item, or table that holds the sentences.

For each sentence, identify the case this fixture shows and compare the affected
nodes, tokens, comments, and positions against it and the tree, token, and
position documents. If the sentence touches no part of the tree, say so. If
there is no citing sentence, say so; the full checklist still applies. Report a
missing specification citation for an authored fixture added by the change.
Collected fixtures need no citation, but a cited one is checked like any other;
read `source.kind` in `expected.json` to distinguish them (`mermaid` means
collected).

## 4. Resolve mismatches

Read the sentences that decide the mismatch and determine its cause:

- Parser error: correct the parser, record again with step 4 of
  [parser section 4.7, Recorded parse results](../parser/SKILL.md#47-recorded-parse-results),
  and check the new record with this procedure.
- Missing or wrong specification: report it with step 2 of
  [parser section 4.2, Reading the specification and its gaps first](../parser/SKILL.md#42-reading-the-specification-and-its-gaps-first).

Never edit `ast.json` by hand: the fixture test records it, as
[parser section 4.6, Tests](../parser/SKILL.md#46-tests) requires. If the
documents leave a question undecided, report it rather than keeping the
undecided tree, as step 1 of parser section 4.7 requires.

## 5. When the tree, token, or position documents change

Read the diff against the base of those documents and the sections their blocks
link to:

```sh
git diff <base> -- <the documents>
```

For each block whose text changed, check the accepted fixtures it cites against
the new text, including blocks in the linked sections. Read a linked section
with the tree, token, or position block that links to it. Derive expectations
before opening records, then follow sections 2 to 4. Note cited fixtures that no
longer exist or have no tree, so the report identifies records not checked.

A new or rewritten block with no cited fixture needs fixtures for its cases
under conventions. This includes changed blocks in a linked section, but not a
deleted block or a block whose own text is unchanged.

## 6. Review independently

Before reading the author's fixes in the commits of the change, check the same
`ast.json` files and changed document blocks by sections 1 to 5. Write the
independent comparisons, then compare them with the author's fixes. Report
differences with evidence of which tree or document is wrong, following
[review section 5, Findings and the report](../review/SKILL.md#5-findings-and-the-report).
Reviewers edit nothing in the working tree.
