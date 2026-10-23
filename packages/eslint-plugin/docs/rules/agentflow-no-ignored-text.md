# @mmd-toolkit/agentflow-no-ignored-text

Japanese version:
[agentflow-no-ignored-text.ja.md](./agentflow-no-ignored-text.ja.md)

Disallow text that mermaid.js drops from a direction line.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A line that holds `direction` and a direction value is a direction statement as
a whole. mermaid.js drops the rest of the line without an error, also statements
written on it.

## Rule Details

This rule reports the text that stands on a direction line before `direction` or
after the direction value. It applies to `agentflow`.

A link written on the same line, before or after the direction, disappears, also
when a `;` separates the two. In a flow, `A-->B; direction TB` and
`direction TB; A-->B` give the flow the direction `TB` and make no vertex and no
link, while the same two statements on two lines make the link from `A` to `B`.
At the top level, `A-->B direction TB` makes no vertex and no link either. Text
after the direction, as in `direction LR trailing`, is dropped in the same way.

A line becomes a direction statement also when it is not meant as one. When
`direction` and a direction value stand on it, as in `A[Set direction LR]-->B`,
the line is a direction statement and makes no vertex and no link. The rule
reports that too.

Two kinds of text are not reported:

- Text of only `;` and whitespace, as in `direction TB;`. A `;` only ends the
  statement.
- Text after the direction value in which only `;` and whitespace come before
  `%%`, as in `direction TB %% vertical` and `direction TB; %% vertical`. The
  author means the text from the `%%` to the end of the line as a comment.

mermaid.js drops both, but neither holds anything that the author meant to be
read as a statement. Other text before the `%%` is reported: in
`direction TB; x %% c`, the `x`, meant as a statement, is dropped.

Write a direction statement on a line of its own.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    A --> B; direction LR
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    direction LR
    A --> B
  end
```

## Options

This rule has no options.

## Background

The
[lexer](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/parser/agentflow.jison#L165-L169)
reads a whole line that holds `direction` and a direction value as one direction
statement.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-ignored-text.ts)
- [Tests source](../../tests/rules/agentflow-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
