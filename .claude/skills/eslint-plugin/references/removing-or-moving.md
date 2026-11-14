# Removing or moving a document (eslint-plugin)

Section numbers below are those of [SKILL.md](../SKILL.md).

- When a document moves, its rule is renamed (section 6): change the sentence of
  Rule Details that names the diagram types and its relative links, and run
  `update`, which writes its title and its row in the index.
- When a document is removed, check with `grep` that no other document refers to
  it.
- The tests that a removed or moved document runs are in
  [tests-after-writing.md](tests-after-writing.md).
