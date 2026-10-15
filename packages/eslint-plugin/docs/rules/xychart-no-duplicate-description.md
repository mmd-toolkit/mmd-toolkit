# @mmd-toolkit/xychart-no-duplicate-description

Japanese version:
[xychart-no-duplicate-description.ja.md](./xychart-no-duplicate-description.ja.md)

Disallow a statement that sets the description of the chart again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An XY chart has one description. mermaid.js accepts every `accDescr` statement,
and each one that sets the description silently replaces the description set
before it. A second description is usually left over from rewriting the text or
from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one,
when it sets a description other than the one before it. It applies to
`xychart`.

`accDescr:` and a description block with text both set the description, and they
may be mixed: after `accDescr: a` and `accDescr { b }`, the description is `b`.
`accDescr:` with no text on its line takes the next line that holds text, as
`accTitle:` does. A block that holds no description is not counted: after
`accDescr: a`, the block `accDescr {}` leaves the description `a`, and
[xychart-no-empty-description-block](./xychart-no-empty-description-block.md)
reports it. Nor is a block that is not closed, which
[xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.md)
reports.

A statement that sets the description that the chart already has is not
reported, in either form: after `accDescr: d`, the block `accDescr { d }` loses
nothing. Descriptions are compared as mermaid.js keeps them, without the
whitespace at their ends and without the whitespace after each line break, so
the indentation of the lines of a block and the empty lines in it do not count.
Every line break (LF, CRLF, or CR) is read as a line feed, so a block written
with CRLF sets the same description as one written with LF. After `accDescr: a`
and `accDescr: b`, a third `accDescr: a` is reported, because it replaces `b`.

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
