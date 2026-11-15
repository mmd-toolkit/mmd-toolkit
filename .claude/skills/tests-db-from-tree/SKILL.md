---
name: tests-db-from-tree
description: >-
  Write the Db builder from a tree (src/db-from-tree/) of a diagram type in
  @mmd-toolkit/tests, with its documents, from the syntax and tree documents;
  the steps are written for Langium diagram types. Use once the specification
  defines the syntax and tree of a diagram type, and when a sentence of
  docs/db-from-tree/ is to be written, together with the tests skill.
---

# Langium diagrams: the Db builder from a tree (tests-db-from-tree)

Sections 1 to 4 of the skill [tests](../tests/SKILL.md) (the policies and
criteria, what to read first, what these skills write, and how to check) hold
for these steps too. Read them first.

Use the skill [tests-diagram-type](../tests-diagram-type/SKILL.md) to extract
the diagram's behavior and collect its fixed fixtures. Before generating
specified readings for retained forms or opaque embedded data, follow section
5.1 of the skill
[tests](../tests/SKILL.md#51-specified-readings-for-retained-forms-and-embedded-data).
Once the syntax and AST are defined, implement the Db builder from those
contracts as follows. Paths below are relative to `packages/tests`.

Semantic acceptance belongs to the parser and is checked by comparing recorded
result kinds with `fixtureAccepts`. Name specification-side modules and helpers
after their rules; engine names identify Mermaid's implementation in the
extraction procedure, not the rules that the tree implements.

1. Read the diagram's syntax and AST documents, the parser's token and position
   contracts, and `docs/db-from-tree.md`. Require semantic acceptance conditions
   to be direct sentences of the syntax specification, rather than delegated to
   Db extraction documents. Require their comparison values and state
   transitions to be defined there too, including escaping, entity conversion,
   effective identity and updates after each statement.
2. Implement `src/db-from-tree/<diagram>.ts` from the summary and the
   specification's value and state rules, reusing converted-text, number and
   embedded-value helpers and the stated generated-id order instead of copying
   Mermaid's pipeline. Preserve the documented replacement and ordering rules,
   omit unpublished values even when their nodes exist, and allow an empty
   summary without dropping nodes that affect it. Write fixed hand-built tree
   tests for the builder.
3. Document the builder in `docs/db-from-tree/<diagram>.md`, with a Japanese
   pair and fixtures for each distinguishing case. Before trees are recorded,
   implement from the specification and fixed hand-built trees; do not infer the
   contract from records. AI agents read changed recorded trees with
   [recorded-trees](../recorded-trees/SKILL.md). Compare every comparable
   `dbFromTree` result with its recorded reading, using the shared
   embedded-value helpers. Report actual tree and Db counts, missing records,
   and each mismatch with its input; do not silently skip a missing tree or an
   error record for an accepting reading, and skip an error record only when its
   mark's reading rejects. Keep cases without a comparison Db explicit as in
   section 5.1 of the skill
   [tests](../tests/SKILL.md#51-specified-readings-for-retained-forms-and-embedded-data).
   For the builder to run on the recorded trees, the diagram type leaves the
   list of diagram types without recorded trees and enters `DIAGRAMS`, as step 7
   of [The normalizer](../tests-diagram-type/SKILL.md#2-the-normalizer) in the
   skill tests-diagram-type says.
