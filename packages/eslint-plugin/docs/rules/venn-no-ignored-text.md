# @mmd-toolkit/venn-no-ignored-text

Japanese version: [venn-no-ignored-text.ja.md](./venn-no-ignored-text.ja.md)

Disallow a character that the comment after it removes.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `%%` comment can remove the character just before it when no space separates
them. In `set A:%% size to fill in`, the colon disappears with the comment, and
mermaid.js reads `set A` with the default size 10 without an error.

## Rule Details

This rule applies to Venn diagrams (`venn-beta`). It reports each character
removed by the comment immediately after it, whether after a statement, on its
own line, or after the header. This happens only where mermaid.js starts reading
a new word or sign: `set AB%% c` keeps `AB` and is not reported. `set A%% c`
loses `A` and is not reported, because mermaid.js gives an error for it.

Removed whitespace is not reported because it changes nothing. A `%%` inside a
label or quoted name is text, not a comment, and nothing before it is reported.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-ignored-text.ts)
- [Tests source](../../tests/rules/venn-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
