# @mmd-toolkit/sequence-no-unclosed-description-block

Japanese version:
[sequence-no-unclosed-description-block.ja.md](./sequence-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block without its closing `}`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts a description block whose `}` is missing. It closes the block
at the first `}` after the `{`, or, without one, at the end of the text, and
reads the lines up to there as the text of the block. Without a `}`, the
description is empty, whatever the block holds.

## Rule Details

This rule reports an `accDescr {` block that is not closed by `}`. It applies to
`sequence`.

A description written before the block is replaced by the empty one. The
statements after the block become its text: after `accDescr { x`, the line
`A ->> B: y` makes no message.

The rule also reports a block that a `}` written for something else closes. A
description block ends at the first `}` after its `{`; every other character up
to there, a `{` too, is its text
([Accessibility values](../../../spec/docs/diagrams/sequence.md#accessibility-values)
in the specification). When a later statement holds a `{` with its `}`, as the
data block `participant A@{ "type": "actor" }`, the JSON of
`links A: {"a": "https://x"}`, or the text of a message, that `}` closes the
block, and the lines up to it become the description: after `accDescr { first`,
the lines `links A: {"a": "https://x"}` and `A ->> B: x` give the description
`first` and `links A: {"a": "https://x"`, no link, and the message `x`. The rule
reports a block whose text holds a `{` on a later line than the `{` of the
block, unless the `}` that closes the block stands alone on its line. A `}` on
the line of the `{`, as in `accDescr { a { b }`, and a `}` alone on its line
close the block as written, and are not reported. A `}` is alone on its line
when only whitespace and directives stand before it there, whatever follows it,
as in `};` or `} A ->> B: x`. A `}` alone on its line is the author's also after
such a `{`, as in `accDescr {`, `uses { here`, and `}`, whose description is
`uses { here`. A description that holds a `{` and ends with its own `}` on a
later line, as `accDescr {`, then `a {b }`, is reported too: the rule does not
tell that `}` from the `}` of a data block, and such a description is rare. For
the same reason, a data block written over lines whose `}` stands alone on its
line is not reported: `accDescr { x`, `participant A@{`, `"type": "actor"`, `}`,
and `A ->> B: y` give the description `x`, `participant A@{`, and
`"type": "actor"`, and A is no actor, but its `}` looks like the author's.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
  B ->> A: z
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
  B ->> A: z
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/sequence-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
