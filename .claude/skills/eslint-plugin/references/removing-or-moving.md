# Removing or moving a document (eslint-plugin)

Section numbers below are those of [SKILL.md](../SKILL.md).

- Remove and move files as
  [The working tree](../../conventions/SKILL.md#the-working-tree) in the skill
  conventions says.
- When a document moves, its rule is renamed (section 6): change the sentence of
  Rule Details that names the diagram types and its relative links, and run
  `update`, which writes its title and its row in the index.
- When a document is removed, check with `grep` that no other document refers to
  it.
