# @mmd-toolkit/sequence-no-duplicate-description

Japanese version:
[sequence-no-duplicate-description.ja.md](./sequence-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. mermaid.js accepts every `accDescr` statement,
and each one that sets the description silently replaces the description set
before it. A second description is usually left over from rewriting the text or
from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one,
when it sets a description other than the one before it. It applies to
`sequence`.

`accDescr:` sets the description. Without text, it sets the description too: it
takes the next line that holds text as the description, past empty lines,
comment lines, and directives, and when no such line follows, it makes the
description empty. A closed block that holds a description sets it as well. The
line form and the block form may be mixed: whichever comes first, the
description written last is used. A statement inside a block, such as `loop`,
sets the description of the whole diagram and is counted too.

A block that holds no description is not counted;
[sequence-no-empty-description-block](./sequence-no-empty-description-block.md)
reports it. Nor is a block that is not closed, which runs to the end of the text
and makes the description empty;
[sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.md)
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
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  loop every minute
    A ->> B: x
    accDescr: inner
  end
  accDescr: outer
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  accDescr: first
  accDescr {
    first
  }
  A ->> B: x
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.md)
- [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-duplicate-description.ts)
- [Tests source](../../tests/rules/sequence-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
