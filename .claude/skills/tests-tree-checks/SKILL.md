---
name: tests-tree-checks
description: >-
  Write the Db builder from a tree (src/db-from-tree/) and the tree checker
  (src/check-tree/) of a diagram type in @mmd-toolkit/tests, with their
  documents, from its syntax and tree documents; the steps are written for
  Langium diagram types. Use once the specification defines the syntax and the
  tree of a diagram type, for the checkTree step that the spec skill names, and
  when a sentence of docs/db-from-tree/ is to be written, together with the
  tests skill.
---

# Langium diagrams: the Db builder and the tree checker (tests-tree-checks)

Sections 1 to 4 of the skill [tests](../tests/SKILL.md) (the policies and
criteria, what to read first, the working tree, and how to check) hold for these
steps too. Read them first.

Use the skill [tests-diagram-type](../tests-diagram-type/SKILL.md) to extract
the diagram's behavior and collect its fixed fixtures. Before generating
specified readings for retained forms or opaque embedded data, follow section
5.1 of the skill [tests](../tests/SKILL.md). Once the syntax and AST are
defined, implement the Db builder and tree checker from those contracts as
follows. Paths below are relative to `packages/tests`.

`checkTree` checks tree fields, ranges, tokens and lexical invariants only;
semantic acceptance belongs to the parser and is checked by comparing recorded
result kinds with `fixtureAccepts`. Name specification-side modules and helpers
after their rules; engine names identify Mermaid's implementation in the
extraction procedure, not the rules that the tree implements.

1. Read the diagram's syntax and AST documents, the parser's token and position
   contracts, `docs/db-from-tree.md` and `docs/check-tree.md`. Require semantic
   acceptance conditions to be direct sentences of the syntax specification,
   rather than delegated to Db extraction documents. Require their comparison
   values and state transitions to be defined there too, including escaping,
   entity conversion, effective identity and updates after each statement.
   Register every declared node and field in the shared dispatch and field/value
   tables, extending the shared table reader when the AST document's declared
   table shape differs.
2. Implement `src/db-from-tree/<diagram>.ts` from the summary and the
   specification's value and state rules, reusing converted-text, number and
   embedded-value helpers and the stated generated-id order instead of copying
   Mermaid's pipeline. Preserve the documented replacement and ordering rules,
   omit unpublished values even when their nodes exist, and allow an empty
   summary without dropping tree coverage. Write fixed hand-built tree tests for
   the builder, and accepted and broken-tree tests for the checker.
3. Implement `src/check-tree/<diagram>.ts` with shared coverage, field, range,
   token and written-value checks. Check each leaf as a complete lexical unit at
   its position, with that position's first-match priority and keyword/component
   boundaries. Check composite forms against their authored keyword, punctuation
   and value components, including the AST's empty/null and whitespace rules.
   Keep the written spelling checked here distinct from the converter's Db
   reading.
4. Check every retained hidden match exactly once, in source order, in its named
   gap or body position. Use explicit character scanning to find the earliest
   closer within the specification's first applicable alternative, trying a
   body-present match before an adjacent empty fallback where that is the rule.
   Check the whole authored form, not just its kind or value field. Enforce the
   AST's boundary between a statement's trailing gap and body, including whether
   a visible EOL precedes the form.
5. Where a hidden terminal consumes the following LF, keep that LF outside the
   retained form's range. Apply its consumption before checking separators: a
   following statement must have the surviving visible EOL its production
   requires. Check spare LF, lookahead-only closing boundaries, the appended LF
   and EOF separately; EOF can satisfy a production without a written EOL.
6. At each native Comment after the header, check that no earlier-priority
   terminal matches at that unit position and that no earlier string or
   composite value encloses its start. Use explicit character scanning for
   terminal matches. Distinguish source comment regions from native Comments.
   Before the header, bare lines passed by detection are Comments and their
   accompanying passed whitespace and line terminators are trivia; do not read
   them again as diagram units. Retained prefixes still follow their own
   terminal rules. Keep ordinary body gaps and hidden closing boundaries as
   strict as the diagram specifies; the detection exception applies only to the
   intervals it passed.
7. Write explicit accepted and broken trees in
   `tests/check-tree-<diagram>.test.ts`. Break ownership by losing, duplicating
   or moving a hidden form; choose a later closer within the selected
   alternative or an adjacent empty close despite a qualifying body match;
   include its consumed LF in its range; remove the surviving EOL; change
   authored components; and disguise an earlier terminal as Comment. Include
   accepted controls for hidden-looking text inside enclosing values, spare LF
   and EOF. Write fixed cases for each retained prefix followed by
   detection-passed bare lines and their Unicode trivia, and with passed trivia
   between retained forms. Include controls without a passed line. Check that
   ordinary body gaps stay strict. Derive these cases from each sentence and its
   rule intersections, not from corpus success alone.
8. Document the builder in `docs/db-from-tree/<diagram>.md` and the checks in
   `docs/check-tree.md`, both with Japanese pairs and fixtures for each
   distinguishing case. Before trees are recorded, implement from the
   specification and fixed hand-built trees; do not infer the contract from
   records. Once trees are recorded, run the checker on every recorded tree and
   compare every comparable `dbFromTree` result with its recorded reading, using
   the shared embedded-value helpers. Report actual tree and Db counts, missing
   records, and each mismatch with its input; do not silently skip a missing
   tree or an error record for an accepting reading, and skip an error record
   only when its mark's reading rejects. Keep cases without a comparison Db
   explicit as in section 5.1 of the skill [tests](../tests/SKILL.md).
