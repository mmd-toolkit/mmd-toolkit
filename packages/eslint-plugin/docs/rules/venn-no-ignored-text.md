# @mmd-toolkit/venn-no-ignored-text

Japanese version: [venn-no-ignored-text.ja.md](./venn-no-ignored-text.ja.md)

Disallow a character that the comment after it removes.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `%%` comment can remove the character just before it when no space separates
them. In `set A:%% size to fill in`, the colon disappears with the comment, and
mermaid.js reads `set A` with the default size 10, without an error.

## Rule Details

This rule reports each character that a comment removes this way. It applies to
`venn`. The character may follow a statement, as the comma in
`style A fill:red,%% more later`, stand on a line of its own, or follow the
header `venn-beta`.

The comment takes the character before it only where mermaid.js starts to read a
new word or sign at that character. In `set AB%% c`, the name `AB` is read
before the comment, and nothing is removed. `set A%% c` loses the name `A` and
is rejected, so the rule does not see it. A space before `%%` is removed in the
same way and changes nothing; it is not reported. A `%%` inside a label or a
quoted name is text, not a comment.

Remove the character while keeping whitespace before the comment, as in
`set A %% size to fill in`, or complete the statement before the comment:
`set A:20 %% size` gives A the size 20.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-ignored-text: error
venn-beta
set A:%% size to fill in
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-ignored-text: error
venn-beta
set A:20 %% size
```

## Options

This rule has no options.

## Background

The
[comment rule of the lexer](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/parser/venn.jison#L8-L8)
reads any character but `}` before `%%` as part of the comment.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-ignored-text.ts)
- [Tests source](../../tests/rules/venn-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
