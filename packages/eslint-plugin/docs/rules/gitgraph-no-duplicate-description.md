# @mmd-toolkit/gitgraph-no-duplicate-description

Japanese version:
[gitgraph-no-duplicate-description.ja.md](./gitgraph-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A git graph has one accessible description, set by `accDescr` on a line or in a
block. mermaid.js accepts a later description without an error and replaces the
earlier one.

## Rule Details

This rule applies to Git graphs (`gitGraph`). It reports an `accDescr` that
changes a nonempty description set by the preceding `accDescr`, comparing line
and block forms together. Repeating the same description or setting one after an
empty description is not reported. After `accDescr: a` and `accDescr: b`, a
third `accDescr: a` is reported, because it replaces `b`.

An empty or whitespace-only `accDescr:` clears the description without taking
the next line and is reported after a nonempty description. A block holding only
comment lines also clears it and is reported after a nonempty description. An
empty block there is reported by
[gitgraph-no-empty-description-block](./gitgraph-no-empty-description-block.md)
instead.

Comparisons ignore whitespace at each line's ends and empty lines, and treat
runs of two or more spaces or tabs as one space. LF, CRLF, and CR are compared
as LF.

Other text is compared as written, so character references and HTML attribute
quotes can differ for this rule although mermaid.js reads them alike.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-description: error
gitGraph
  accDescr: First
  accDescr: Second
  commit
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gitgraph-no-duplicate-description: error
gitGraph
  accDescr: Second
  commit
```

## Options

This rule has no options.

## Related Rules

- [gitgraph-no-duplicate-title](./gitgraph-no-duplicate-title.md)
- [gitgraph-no-empty-description-block](./gitgraph-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gitgraph-no-duplicate-description.ts)
- [Tests source](../../tests/rules/gitgraph-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
