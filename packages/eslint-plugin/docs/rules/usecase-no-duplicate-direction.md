# @mmd-toolkit/usecase-no-duplicate-direction

Japanese version:
[usecase-no-duplicate-direction.ja.md](./usecase-no-duplicate-direction.ja.md)

Disallow a `direction` statement that replaces the direction set before it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A use case diagram has one direction. mermaid.js accepts a later `direction`
statement without an error and replaces the earlier direction.

## Rule Details

This rule applies to use case diagrams (`usecase-beta`). It reports a
`direction` statement that changes the direction given by the preceding one.
Repeating the current direction is not reported. The first `direction` is not
reported, even when it changes the default `LR`.

`TD` and `TB` both mean top to bottom, so `direction TB` after `direction TD` is
not reported. After `direction LR` and `direction BT`, another `direction LR` is
reported because it replaces `BT`.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/usecase-no-duplicate-direction.ts)
- [Tests source](../../tests/rules/usecase-no-duplicate-direction.test.ts)

<!-- end auto-generated rule resources -->
