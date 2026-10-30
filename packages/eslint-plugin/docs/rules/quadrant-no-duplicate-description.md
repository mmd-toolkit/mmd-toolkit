# @mmd-toolkit/quadrant-no-duplicate-description

Japanese version:
[quadrant-no-duplicate-description.ja.md](./quadrant-no-duplicate-description.ja.md)

Disallow a statement that sets the description of the chart again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one description. When another `accDescr` statement sets it,
mermaid.js uses the later description without an error, and the earlier one is
lost.

## Rule Details

This rule applies to quadrant charts (`quadrantChart`). It reports an
`accDescr:` statement or a description block that replaces the current
description with a different one. A statement that repeats the current
description is not reported, even when the two forms are mixed.

Descriptions are compared without the whitespace at their ends or after each
line break, so indentation and empty lines in a block do not count. LF, CRLF,
and CR line breaks are compared as LF. After `accDescr: a` and `accDescr: b`, a
third `accDescr: a` is reported because it replaces `b`.

The keyword is read in any case. `accDescr:` with no text on its line takes the
next line that holds text. Empty lines, comment lines, and directives are
skipped. A block with no description, including one with only comments or
directives, is not counted.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  accDescr {
    second
  }
  A: [0.3, 0.6]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  A: [0.3, 0.6]
```

```mmd
%% eslint @mmd-toolkit/quadrant-no-duplicate-description: error
quadrantChart
  accDescr: first
  accDescr {
    first
  }
  A: [0.3, 0.6]
```

## Options

This rule has no options.

## Related Rules

- [quadrant-no-duplicate-title](./quadrant-no-duplicate-title.md)
- [quadrant-no-empty-description-block](./quadrant-no-empty-description-block.md)
- [xychart-no-duplicate-description](./xychart-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/quadrant-no-duplicate-description.ts)
- [Tests source](../../tests/rules/quadrant-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
