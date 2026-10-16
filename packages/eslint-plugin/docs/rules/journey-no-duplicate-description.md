# @mmd-toolkit/journey-no-duplicate-description

Japanese version:
[journey-no-duplicate-description.ja.md](./journey-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A user journey has one description. mermaid.js accepts every `accDescr`
statement, and each one that sets the description silently replaces the
description set before it. A second description is usually left over from
rewriting the text or from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one,
when it sets a description other than the one before it. It applies to
`journey`.

`accDescr:` and a description block with text both set the description, and they
may be mixed: after `accDescr: a` and `accDescr { b }`, the description is `b`,
and after `accDescr { a }` and `accDescr: b`, it is `b` too. `accDescr:` with no
text on its line takes the next line that holds text, as `accTitle:` does.

A block that holds no description is not counted: after `accDescr: a`, the block
`accDescr {}` leaves the description `a`.
[journey-no-empty-description-block](./journey-no-empty-description-block.md)
reports it.

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
%% eslint @mmd-toolkit/journey-no-duplicate-description: error
journey
  accDescr: first
  accDescr { second }
  section Work
    Make tea: 5: Me
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-description: error
journey
  accDescr: first
  section Work
    Make tea: 5: Me
```

```mmd
%% eslint @mmd-toolkit/journey-no-duplicate-description: error
journey
  accDescr: first
  accDescr {
    first
  }
  section Work
    Make tea: 5: Me
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [journey-no-duplicate-title](./journey-no-duplicate-title.md)
- [journey-no-empty-description-block](./journey-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/journey-no-duplicate-description.ts)
- [Tests source](../../tests/rules/journey-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
