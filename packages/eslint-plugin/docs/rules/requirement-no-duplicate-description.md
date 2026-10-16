# @mmd-toolkit/requirement-no-duplicate-description

Japanese version:
[requirement-no-duplicate-description.ja.md](./requirement-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A requirement diagram has one description. mermaid.js accepts every `accDescr`
statement, and each one that sets the description silently replaces the
description set before it. A second description is usually left over from
rewriting the text or from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one,
when it sets a description other than the one before it. It applies to
`requirement`.

`accDescr:` and a description block with text both set the description, and they
may be mixed: after `accDescr: a` and `accDescr { b }`, the description is `b`,
and after `accDescr { b }` and `accDescr: a`, it is `a`. `accDescr:` with no
text on its line takes the next line that holds text, as `accTitle:` does.

A block that holds no description is not counted, also one that holds only a
comment line or only a directive, and one inside the body of a requirement or an
element: after `accDescr: a`, the block `accDescr {}` leaves the description
`a`.
[requirement-no-empty-description-block](./requirement-no-empty-description-block.md)
reports the blocks without text.

A statement that sets the description that the diagram already has is not
reported, in either form: after `accDescr: d`, the block `accDescr { d }` loses
nothing. Descriptions are compared as mermaid.js keeps them, without the
whitespace at their ends and without the whitespace after each line break, so
the indentation of the lines of a block and the empty lines in it do not count.
Every line break (LF, CRLF, or CR) is read as a line feed, so a block written
with CRLF sets the same description as one written with LF. After `accDescr: a`
and `accDescr: b`, a third `accDescr: a` is reported, because it replaces `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-description: error
requirementDiagram
  accDescr: first
  accDescr { second }
  requirement r {
    id: 1
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-description: error
requirementDiagram
  accDescr: first
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-duplicate-description: error
requirementDiagram
  accDescr: first
  accDescr {
    first
  }
  requirement r {
    id: 1
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-duplicate-description](./er-no-duplicate-description.md)
- [requirement-no-duplicate-title](./requirement-no-duplicate-title.md)
- [requirement-no-empty-description-block](./requirement-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-duplicate-description.ts)
- [Tests source](../../tests/rules/requirement-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
