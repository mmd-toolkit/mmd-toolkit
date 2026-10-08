# @mmd-toolkit/state-no-unclosed-description-block

Japanese version:
[state-no-unclosed-description-block.ja.md](./state-no-unclosed-description-block.ja.md)

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
`stateDiagram`.

A description written before the block is replaced by the empty one. The
statements after the block become its text: after `accDescr { x`, the line
`A --> B` makes no transition.

The rule also reports a block that a `}` written for something else closes. A
description block ends at the first `}` after its `{`; every other character up
to there, a `{` too, is its text
([Accessibility values](../../../spec/docs/diagrams/state.md#accessibility-values)
in the specification). The body of a composite state ends with its own `}`, so
after `accDescr { x`, the lines `state B {`, `C`, and `}` give the description
`x`, `state B {`, and `C`, and no state `B` or `C`. The rule reports a block
whose text holds a `{` on a later line than the `{` of the block, also where the
`}` that closes it stands alone on its line, as the `}` of a body does. A
description that holds a `{` and ends with its own `}` on a later line, as
`accDescr {`, then `uses { here`, and `}`, is reported too: the rule does not
tell that `}` from the `}` of a body, and such a description is rare. A `}` on
the line of the `{`, as in `accDescr { a { b }`, closes the block as written,
and is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  A --> B
  accDescr { x
```

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  accDescr { x
  state B {
    C
  }
  D --> E
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  A --> B
  accDescr { x }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
- [state-no-empty-description-block](./state-no-empty-description-block.md)
- [state-no-duplicate-description](./state-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/state-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
