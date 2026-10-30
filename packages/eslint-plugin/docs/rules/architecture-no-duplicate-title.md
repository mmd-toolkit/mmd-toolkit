# @mmd-toolkit/architecture-no-duplicate-title

Japanese version:
[architecture-no-duplicate-title.ja.md](./architecture-no-duplicate-title.ja.md)

Disallow an `accTitle` that replaces the title set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An architecture diagram has one accessible title, which `accTitle` sets. A later
`accTitle` replaces the title set before it without an error, and the earlier
title is lost.

## Rule Details

This rule applies to architecture diagrams (`architecture-beta`). It reports an
`accTitle` that changes a nonempty accessible title set by the preceding
`accTitle`. An empty or whitespace-only `accTitle:` clears the title without
taking the next line, and is reported after a nonempty title. A statement after
an empty title, or one that repeats the current title, is not reported. Going
back to an earlier title is reported: after `accTitle: a` and `accTitle: b`, a
third `accTitle: a` is reported.

A repeated `title` statement is not reported, because mermaid.js does not draw
the title of an architecture diagram.

Titles are compared without whitespace at their ends and with a run of two or
more spaces or tabs as one space. They are otherwise compared as written.
mermaid.js converts character references such as `#35;` and HTML attribute
quotes before reading a title. Titles differing only in these ways may be the
same for mermaid.js and different for this rule.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-duplicate-title: error
architecture-beta
  accTitle: First
  accTitle: Second
  service api(server)[API]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/architecture-no-duplicate-title: error
architecture-beta
  accTitle: Second
  service api(server)[API]
```

## Options

This rule has no options.

## Related Rules

- [architecture-no-duplicate-description](./architecture-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/architecture-no-duplicate-title.ts)
- [Tests source](../../tests/rules/architecture-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
