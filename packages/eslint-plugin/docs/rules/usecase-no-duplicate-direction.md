# @mmd-toolkit/usecase-no-duplicate-direction

Japanese version:
[usecase-no-duplicate-direction.ja.md](./usecase-no-duplicate-direction.ja.md)

Disallow a `direction` statement that replaces the direction set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A use case diagram has one direction. A later `direction` statement replaces the
one before it without an error, and the earlier direction is lost.

## Rule Details

This rule reports a `direction` statement that gives a direction other than the
one that the `direction` statement before it gave. It applies to `usecase`.

After `direction LR` and `direction BT`, the diagram is drawn from bottom to
top. The direction that the diagram has when no statement gives one, `LR`, is
not written and is not compared.

A statement that gives the direction that the diagram already has is not
reported. `TD` and `TB` are the same direction, top to bottom: mermaid.js reads
`TD` as `TB`, so after `direction TD`, `direction TB` is not reported. After
`direction LR` and `direction BT`, a third `direction LR` is reported, because
it replaces `BT`.

Write one `direction` statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-direction: error
usecase-beta
  direction LR
  direction BT
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/usecase-no-duplicate-direction: error
usecase-beta
  direction LR
  A
```

## Options

This rule has no options.

## Background

[`setDirection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L237-L239)
records each direction, with `TD` as `TB`, and the
[model](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseModelBuilder.ts#L350-L350)
takes the last one.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-direction.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->
