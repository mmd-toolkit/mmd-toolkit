# @mmd-toolkit/quadrant-no-duplicate-description

Japanese version:
[quadrant-no-duplicate-description.ja.md](./quadrant-no-duplicate-description.ja.md)

Disallow a statement that sets the description of the chart again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A quadrant chart has one description. mermaid.js accepts every `accDescr`
statement, and each one that sets the description silently replaces the
description set before it. A second description is usually left over from
rewriting the text or from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one,
when it sets a description other than the one before it. It applies to
`quadrantChart`.

`accDescr:` and a description block with text both set the description, and they
may be mixed: after `accDescr: a` and `accDescr { b }`, the description is `b`.
The keyword is read in any case. `accDescr:` with no text on its line takes the
next line that holds text, past empty lines, comment lines, and directives, as
`accTitle:` does. A block that holds no description is not counted: after
`accDescr: a`, the block `accDescr {}` leaves the description `a`, and so does a
block that holds only a comment line or only a directive;
[quadrant-no-empty-description-block](./quadrant-no-empty-description-block.md)
reports an empty block.

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
