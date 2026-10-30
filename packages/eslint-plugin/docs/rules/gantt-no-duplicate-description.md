# @mmd-toolkit/gantt-no-duplicate-description

Japanese version:
[gantt-no-duplicate-description.ja.md](./gantt-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one description. When another `accDescr` statement sets it,
mermaid.js uses the later description without an error, and the earlier one is
lost.

## Rule Details

This rule applies to Gantt charts (`gantt`). It reports an `accDescr:` statement
or a description block that replaces the current description with a different
one. A statement that repeats the current description is not reported, even when
the two forms are mixed.

Descriptions are compared without the whitespace at their ends or after each
line break, so indentation and empty lines in a block do not count. LF, CRLF,
and CR line breaks are compared as LF. After `accDescr: a` and `accDescr: b`, a
third `accDescr: a` is reported because it replaces `b`.

An `accDescr:` with no text on its line also sets the description and is
counted: it takes the next line that holds text. A block with no description is
not counted.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-description: error
gantt
  accDescr: first
  accDescr { second }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-description: error
gantt
  accDescr: first
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

```mmd
%% eslint @mmd-toolkit/gantt-no-duplicate-description: error
gantt
  accDescr: first
  accDescr {
    first
  }
  dateFormat YYYY-MM-DD
  Design :2024-01-06, 3d
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [gantt-no-duplicate-title](./gantt-no-duplicate-title.md)
- [gantt-no-empty-description-block](./gantt-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/gantt-no-duplicate-description.ts)
- [Tests source](../../tests/rules/gantt-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
