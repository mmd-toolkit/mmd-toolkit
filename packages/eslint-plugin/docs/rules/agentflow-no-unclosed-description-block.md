# @mmd-toolkit/agentflow-no-unclosed-description-block

Japanese version:
[agentflow-no-unclosed-description-block.ja.md](./agentflow-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block that is not closed by `}`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

An `accDescr {` block runs to its `}`. Without one, mermaid.js reads the rest of
the text as the block, without an error: the statements after it disappear, and
the description becomes empty.

## Rule Details

This rule reports an `accDescr {` block that is not closed by `}`. It applies to
`agentflow`.

A description written before the block is replaced by the empty one. The
statements after the block become its text: after `accDescr { x`, the line
`B --> C` makes no link. Inside a flow, the block also takes the `end` of the
flow, and mermaid.js rejects the text, so the rule does not see it.

The rule also reports a block that a `}` written for something else closes. A
description block ends at the first `}` after its `{`; every other character up
to there, a `{` too, is its text. When a later statement holds a `{` with its
`}`, as the shape `A{y}` or the data block `A@{ shape: task }`, that `}` closes
the block, and the lines up to it become the description: after
`accDescr { first`, the lines `B --> C`, `A{y}`, and `D` give the description
`first`, `B --> C`, and `A{y`, and only the vertex `D`. The rule reports a block
whose text holds a `{` on a later line than the `{` of the block, unless the `}`
that closes the block stands alone on its line: the `}` that then closes the
block is the first one after that `{`, the one of a shape or a data block. A `}`
on the line of the `{`, as in `accDescr { a { b }`, and a `}` alone on its line
close the block as written, and are not reported. A `}` is alone on its line
when only whitespace and directives stand before it there. A description that
holds a `{` and ends with its own `}` on a later line, as `accDescr {`, then
`a {b }`, is reported too: the rule does not tell that `}` from the `}` of a
shape. This is the reason that the `recommended` configuration does not enable
the rule.

Close the block where the description ends.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr { first
  B --> C
  A{y}
  D
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  A --> B
  accDescr { x }
  B --> C
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-unclosed-description-block: error
agentflow-beta TB
  accDescr {
    uses { here
  }
  A
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.md)
- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.md)

## Background

The
[lexer of the block](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L61-L63)
reads every character but `}` as its text, and ends the block at the first `}`.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/agentflow-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
