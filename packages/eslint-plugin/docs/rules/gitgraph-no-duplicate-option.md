# @mmd-toolkit/gitgraph-no-duplicate-option

Japanese version:
[gitgraph-no-duplicate-option.ja.md](./gitgraph-no-duplicate-option.ja.md)

Disallow an option that replaces the value of the same option before it in one
statement.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`id:` and `type:` of a `commit` or `merge`, and `id:` and `parent:` of a
`cherry-pick`, each hold one value. mermaid.js accepts another value for the
same option without an error and uses the last one, losing the earlier value.

## Rule Details

This rule applies to Git graphs (`gitGraph`). It reports an `id:`, `type:`, or
`parent:` option that changes a nonempty value given by the preceding occurrence
of that option in the same statement. Repeating a value or setting one after an
empty value is not reported. In `commit id: "a" id: "b" id: "a"`, the second and
the third `id:` are reported. Replacing a nonempty value with an empty one, as
`id: ""` after `id: "a"`, is reported: `a` is lost, and mermaid.js gives the
commit an id of its own.

An earlier value is counted even where mermaid.js would give an error for it
alone, as `missing` in `cherry-pick id: "missing" id: "B"`. Tags are not
compared because all are kept; messages are not compared because mermaid.js does
not draw them.

Values are case-sensitive, and surrounding quotes are ignored.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-option: error
gitGraph
  commit id: "a" id: "b"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-option: error
gitGraph
  commit id: "b"
```

## Options

This rule has no options.

## Related Rules

- [gitgraph-no-redefined-commit](./gitgraph-no-redefined-commit.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gitgraph-no-duplicate-option.ts)
- [Tests source](../../tests/rules/gitgraph-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
