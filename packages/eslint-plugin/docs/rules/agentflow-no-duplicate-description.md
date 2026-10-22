# @mmd-toolkit/agentflow-no-duplicate-description

Japanese version:
[agentflow-no-duplicate-description.ja.md](./agentflow-no-duplicate-description.ja.md)

Disallow an `accDescr` that replaces the description set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

An agentflow has one accessible description, which `accDescr` sets. A later
`accDescr` replaces the description set before it without an error, and the
earlier description is lost.

## Rule Details

This rule reports every statement that sets the description after the first one,
when it sets a description other than the one before it. It applies to
`agentflow`.

`accDescr:` sets the description. Without text, it sets the description too: it
takes the next line that holds text as the description, past empty lines and
directives, and when no such line follows, it makes the description empty. A
closed block that holds a description sets it as well. The line form and the
block form may be mixed: whichever comes first, the description written last is
used. A statement inside a flow or a `global` block sets the description of the
whole diagram and is counted too; mermaid.js also adds the value of such a
statement inside a flow to the members of the flow as an id.

A comment line is text in a description: the block `accDescr {`, `%% TODO`, and
`}` sets the description `%% TODO`, and after `accDescr: d`, it is reported.
mermaid.js keeps such lines in a block, although they are comments elsewhere in
the diagram.

A block that holds nothing and a block that is not closed, which makes the
description empty, are not counted;
[agentflow-no-empty-description-block](./agentflow-no-empty-description-block.md)
and
[agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.md)
report them.

A statement that sets the description that the diagram already has is not
reported, in either form: after `accDescr: d`, the block `accDescr { d }` loses
nothing. Descriptions are compared as mermaid.js keeps them, without the
whitespace at their ends and without the whitespace after each line break, so
the indentation of the lines of a block and the empty lines in it do not count.
Every line break (LF, CRLF, or CR) is read as a line feed. After `accDescr: a`
and `accDescr: b`, a third `accDescr: a` is reported, because it replaces `b`.
Descriptions are otherwise compared as written: mermaid.js turns character
references, as `#35;`, and the quotes of HTML attributes into other characters
before it reads a description, so two descriptions that differ only in those may
be one description for mermaid.js and two for this rule.

Write one description; write a description of several lines in one block.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr: short
  accDescr {
    A longer
    description
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-duplicate-description: error
agentflow-beta TB
  accDescr {
    A longer
    description
  }
```

## Options

This rule has no options.

## Related Rules

- [agentflow-no-duplicate-title](./agentflow-no-duplicate-title.md)
- [agentflow-no-empty-description-block](./agentflow-no-empty-description-block.md)
- [agentflow-no-unclosed-description-block](./agentflow-no-unclosed-description-block.md)

## Background

The
[`accDescr` statements](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L427-L428)
call the common `setAccDescription`, which replaces the description set before
it. The lexer of the
[block](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L61-L63)
has no rule for comments, and agentflow reads its text with the comments kept.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-duplicate-description.ts)
- [Tests source](../../tests/rules/agentflow-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
