# @mmd-toolkit/packet-no-duplicate-title

Japanese version:
[packet-no-duplicate-title.ja.md](./packet-no-duplicate-title.ja.md)

Disallow a `title` or an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A packet diagram has one visible title set by `title` and one accessible title
set by `accTitle`. mermaid.js accepts a later statement without an error and
replaces the earlier title of that kind.

## Rule Details

This rule applies to packet diagrams (`packet` and `packet-beta`). It reports a
`title` or `accTitle` that changes a nonempty title set by the preceding
statement of the same kind. Visible and accessible titles are compared
separately. Repeating a title or setting one after an empty title is not
reported. After `title a` and `title b`, a third `title a` is reported, because
it replaces `b`.

An empty or whitespace-only `title` or `accTitle:` clears that title without
taking the next line and is reported after a nonempty title. Frontmatter titles
are not compared: replacing one is not reported, while clearing a preceding
`title` is reported even if the frontmatter restores the same displayed title.

Comparisons ignore whitespace at the ends and treat runs of two or more spaces
or tabs as one space. Other text is compared as written, so character references
and HTML attribute quotes can differ for this rule although mermaid.js reads
them alike.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/packet-no-duplicate-title: error
packet
  title First
  title Second
  0-15: "Source Port"
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/packet-no-duplicate-title: error
packet
  title Second
  0-15: "Source Port"
```

## Options

This rule has no options.

## Related Rules

- [packet-no-duplicate-description](./packet-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/packet-no-duplicate-title.ts)
- [Tests source](../../tests/rules/packet-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
