# @mmd-toolkit/venn-no-duplicate-title

Japanese version:
[venn-no-duplicate-title.ja.md](./venn-no-duplicate-title.ja.md)

Disallow a title that replaces a different title.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

`title` sets the title of the whole diagram. mermaid.js accepts a later `title`
without an error and displays only the later title, losing the earlier one.

## Rule Details

This rule applies to Venn diagrams (`venn-beta`). It reports a `title` that
changes the title set by the preceding `title` statement. Repeating the current
title is not reported. Replacing a frontmatter title is not reported either.

The keyword is case-insensitive. A title includes the rest of the line after the
first space or tab, including quotes and further spaces, so `title "Audience"`
differs from `title Audience`. A `title` at the end of a line takes the next
line as its title.

Titles are compared as written, so character references and HTML attribute
quotes can differ for this rule although mermaid.js reads them alike.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-title: error
venn-beta
title Audience
title Coverage
set A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/venn-no-duplicate-title: error
venn-beta
title Audience
set A
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-duplicate-title.ts)
- [Tests source](../../tests/rules/venn-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
