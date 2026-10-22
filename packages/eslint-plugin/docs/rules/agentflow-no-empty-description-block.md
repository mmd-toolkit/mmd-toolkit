# @mmd-toolkit/agentflow-no-empty-description-block

Japanese version:
[agentflow-no-empty-description-block.ja.md](./agentflow-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js accepts a closed `accDescr { }` block with nothing in it without an
error, and the block sets no description.

## Rule Details

This rule reports a closed `accDescr` block that holds nothing or only
whitespace. It applies to `agentflow`. A directive in the block is no text: a
block that holds only directives is reported too, and mermaid.js still applies
their settings.

The description stays what it was before the block: after `accDescr: x`, the
block `accDescr { }` leaves the description `x`, and with no description before
it, the description stays empty. An empty description written as a line is
different: `accDescr:` with no line that holds text after it sets the
description to the empty text.

An empty block may also follow the last part of a statement on the same line, as
in `A accDescr {}`, or the header, as in `agentflow-beta TB accDescr {}`. It may
stand in the name of a flow or a connector, as in `flow F accDescr {}`, and
before the URL or the tooltip of a `click` statement. It sets no description
there either, and the rule reports it in the same way.

A block that holds a comment line is not empty: mermaid.js keeps the line as the
text of the block, so `accDescr {`, `%% TODO`, and `}` sets the description
`%% TODO`.

Write the description, or remove the block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
  }
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  flow F accDescr {}
    A
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-empty-description-block: error
agentflow-beta TB
  A
  accDescr {
    The steps of the review
  }
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-duplicate-description](./agentflow-no-duplicate-description.md)
- [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.md)

## Background

The
[lexer of the block](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L61-L63)
gives an empty block no text, so no statement sets the description.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-empty-description-block.ts)
- [Tests source](../../tests/rules/agentflow-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
