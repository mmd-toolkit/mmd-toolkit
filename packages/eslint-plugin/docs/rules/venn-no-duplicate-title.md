# @mmd-toolkit/venn-no-duplicate-title

Japanese version:
[venn-no-duplicate-title.ja.md](./venn-no-duplicate-title.ja.md)

Disallow a title that replaces a different title.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `title` statement sets the title of the whole diagram. A later `title`
replaces it without an error: after `title Audience` and `title Coverage`, the
diagram shows only `Coverage`.

## Rule Details

This rule reports every `title` statement after the first one when it sets a
title other than the one before it. It applies to `venn`.

The keyword is read in any case. A title takes the rest of its line after the
first space or tab, with its quotes and any further spaces: after
`title Audience`, the statement `title "Audience"` sets the title `"Audience"`,
with its quotes, and it is reported. `title` at the end of a line takes the next
line as its title.

A statement that sets the title that the diagram already has is not reported.
After `title First` and `title Second`, a third `title First` is reported,
because it replaces `Second`. Titles are compared as written: mermaid.js turns
character references, as `#35;`, and the quotes of HTML attributes into other
characters before it reads a title, so two titles that differ only in those may
be one title for mermaid.js and two for this rule.

A `title` statement also replaces the title of the frontmatter without an error:
with `title: Front` in the frontmatter, `title T` gives the title `T`. The rule
does not report this.

Keep one `title` statement.

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

## Background

The
[`title` statement](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/parser/venn.jison#L72-L72)
calls
[`setDiagramTitle`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L28-L30),
which replaces the title set before it.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/venn-no-duplicate-title.ts)
- [Tests source](../../tests/rules/venn-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
