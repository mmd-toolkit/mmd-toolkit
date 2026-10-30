# @mmd-toolkit/xychart-no-duplicate-description

Japanese version:
[xychart-no-duplicate-description.ja.md](./xychart-no-duplicate-description.ja.md)

Disallow a statement that sets the description of the chart again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. When another `accDescr` statement sets it,
mermaid.js uses the later description without an error, and the earlier one is
lost.

## Rule Details

This rule applies to XY charts (`xychart` and `xychart-beta`). It reports an
`accDescr:` statement or a description block that replaces the current
description with a different one. A statement that repeats the current
description is not reported, even when the two forms are mixed.

Descriptions are compared without the whitespace at their ends or after each
line break, so indentation and empty lines in a block do not count. LF, CRLF,
and CR line breaks are compared as LF. After `accDescr: a` and `accDescr: b`, a
third `accDescr: a` is reported because it replaces `b`.

An `accDescr:` with no text on its line also sets the description and is
counted: it takes the next line that holds text, past empty lines, comment
lines, and directives, and with no such line before the end of the text, it sets
the empty description. A block with no description is not counted. An unclosed
block is not counted either;
[xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.md)
reports it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-description: error
xychart
  accDescr: first
  accDescr {
    second
  }
  line [1, 2]
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-description: error
xychart
  accDescr: first
  line [1, 2]
```

```mmd
%% eslint @mmd-toolkit/xychart-no-duplicate-description: error
xychart
  accDescr: first
  accDescr {
    first
  }
  line [1, 2]
```

## Options

This rule has no options.

## Related Rules

- [timeline-no-duplicate-description](./timeline-no-duplicate-description.md)
- [xychart-no-duplicate-title](./xychart-no-duplicate-title.md)
- [xychart-no-empty-description-block](./xychart-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/xychart-no-duplicate-description.ts)
- [Tests source](../../tests/rules/xychart-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
