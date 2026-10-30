# @mmd-toolkit/gitgraph-no-redefined-commit

Japanese version:
[gitgraph-no-redefined-commit.ja.md](./gitgraph-no-redefined-commit.ja.md)

Disallow a `commit` with the id of a commit or a merge written before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A git graph keeps one commit per id. mermaid.js accepts a later `commit` with an
earlier commit's id without an error and replaces the earlier commit. It writes
only a log warning, hidden by the default configuration.

## Rule Details

This rule applies to Git graphs (`gitGraph`). It reports a `commit` whose id
belongs to an earlier `commit` or `merge`, even if its options are identical.
The last `id:` option supplies the id; commits with no `id:` or an empty id
receive generated ids and are not compared.

A `merge` that reuses an earlier commit id is not reported, because mermaid.js
gives an error for it. A `cherry-pick` is neither reported nor counted: its
`id:` names the commit that it copies and declares no id.

Ids are case-sensitive, and surrounding quotes are ignored.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-redefined-commit: error
gitGraph
  commit id: "A" tag: "first"
  commit id: "A" tag: "second"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-redefined-commit: error
gitGraph
  commit id: "A" tag: "first"
  commit id: "B" tag: "second"
```

## Options

This rule has no options.

## Related Rules

- [gitgraph-no-duplicate-option](./gitgraph-no-duplicate-option.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gitgraph-no-redefined-commit.ts)
- [Tests source](../../tests/rules/gitgraph-no-redefined-commit.test.ts)

<!-- end auto-generated rule resources -->
