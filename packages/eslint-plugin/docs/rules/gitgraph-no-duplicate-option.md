# @mmd-toolkit/gitgraph-no-duplicate-option

Japanese version:
[gitgraph-no-duplicate-option.ja.md](./gitgraph-no-duplicate-option.ja.md)

Disallow an option that replaces the value of the same option before it in one
statement.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`id:` and `type:` of a `commit` or a `merge`, and `id:` and `parent:` of a
`cherry-pick`, each hold one value. When a statement gives one of them twice,
mermaid.js uses the later value without an error, and the earlier one is lost.

## Rule Details

This rule reports an `id:`, `type:`, or `parent:` option that gives another
value than the same option before it in the same statement gave. It applies to
`gitgraph`.

After `commit id: "a" id: "b"`, the commit has the id `b`, and no commit `a` is
drawn. After `commit id: "a" id: "b" id: "a"`, the second and the third are
reported: each replaces the value before it. `id: ""` after `id: "a"` is
reported too: the commit gets an id that mermaid.js makes, and `a` is lost. An
option after an empty value, as `id: "b"` after `id: ""`, loses nothing and is
not reported. An earlier value is lost also where mermaid.js would have rejected
it: in `cherry-pick id: "missing" id: "B"`, mermaid.js does not look for
`missing`.

An option that gives the value that the statement already has is not reported.
`tag:` is not compared, since every tag is kept, and neither is a message, since
mermaid.js does not draw it. Values are compared with their case, and the quotes
around them do not count: `id: "a"` and `id: 'a'` are one value. Every line
break (LF, CRLF, or CR) in a value is read as a line feed. Values are otherwise
compared as written: mermaid.js decodes escapes, as `\q`, and turns the quotes
of HTML attributes into other characters before it reads a value, so two values
that differ only in those may be one value for mermaid.js and two for this rule.

Give each option one value.

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

## Background

The
[grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/gitGraph/gitGraph.langium#L26-L56)
assigns `id`, `type`, and `parent` one value each, so the last one written is
kept, and adds every `tag` to a list.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gitgraph-no-duplicate-option.ts)
- [Tests source](../../tests/rules/gitgraph-no-duplicate-option.test.ts)

<!-- end auto-generated rule resources -->
