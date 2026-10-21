# @mmd-toolkit/c4-no-duplicate-title

Japanese version: [c4-no-duplicate-title.ja.md](./c4-no-duplicate-title.ja.md)

Disallow a title statement that replaces a different title set by another title
statement.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A second `title` replaces the visible title of the whole diagram. mermaid.js
accepts both statements without an error, and the earlier title is lost.

## Rule Details

This rule reports a `title` when the preceding title setter is another `title`
with a different stored value. It applies to `c4`.

Comparison uses the latest setter, not the first: `First`, `Second`, and `First`
give two reports. A title inside a boundary still sets the title of the whole
diagram. Repeating the same value is not reported. A title keeps quotes and the
whitespace after its first separator: `title "Banking"` differs from
`title Banking`, and an extra value space is significant.

`accTitle:` is excluded from reports and ends the comparison with the preceding
`title`. In mermaid 12.0.0 it incorrectly writes the visible title instead of
the accessible title. The tree distinguishes that form, so this rule does not
turn the accessibility defect into an author mistake, including in mixed
`title`/`accTitle:` sequences.

Keep one title for the diagram.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  title Payments
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  title Banking
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  title Banking
  accTitle: Accessible banking
```

```mmd
%% eslint @mmd-toolkit/c4-no-duplicate-title: error
C4Context
  accTitle: Accessible banking
  title Banking
```

## Options

This rule has no options.

## Related Rules

- [c4-no-duplicate-description](./c4-no-duplicate-description.md)

## Background

[Issue #8040](https://github.com/mermaid-js/mermaid/issues/8040) records the
`accTitle:` defect. [PR #8041](https://github.com/mermaid-js/mermaid/pull/8041)
(open) changes that setter. The ordinary `title`/`title` reports do not depend
on that defect.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/c4-no-duplicate-title.ts)
- [Tests source](../../tests/rules/c4-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
