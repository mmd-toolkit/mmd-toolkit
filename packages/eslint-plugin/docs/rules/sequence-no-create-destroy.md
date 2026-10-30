# @mmd-toolkit/sequence-no-create-destroy

Japanese version:
[sequence-no-create-destroy.ja.md](./sequence-no-create-destroy.ja.md)

Disallow `create` before `destroy`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`create` is written before `participant` or `actor` to create a participant at a
message. Before `destroy`, mermaid.js accepts it without an error and creates
the participant, but does not destroy it: `create destroy A` does what
`create participant A` does.

## Rule Details

This rule applies to sequence diagrams (`sequenceDiagram`). It reports a
`destroy` statement preceded by `create`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-create-destroy: error
sequenceDiagram
  create destroy A
  B ->> A: x
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-create-destroy: error
sequenceDiagram
  create participant A
  B ->> A: x
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-create-destroy.ts)
- [Tests source](../../tests/rules/sequence-no-create-destroy.test.ts)

<!-- end auto-generated rule resources -->
