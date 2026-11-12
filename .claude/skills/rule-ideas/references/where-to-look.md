# Where to look for ideas (rule-ideas)

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
