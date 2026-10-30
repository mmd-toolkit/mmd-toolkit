# @mmd-toolkit/wardley-no-duplicate-evolve

Japanese version:
[wardley-no-duplicate-evolve.ja.md](./wardley-no-duplicate-evolve.ja.md)

Disallow an `evolve` that replaces the target of an earlier `evolve` of the same
node.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A node has one arrow of evolution. When a later `evolve` gives the node another
target, mermaid.js draws only the arrow to the later target without an error,
and the earlier target is lost.

## Rule Details

This rule applies to Wardley maps (`wardley-beta`). It reports an `evolve`
giving a node a different target from the preceding `evolve` for that node.
Repeating the current target is not reported. Targets are compared as
percentages, so `0.9` and `90.0` are the same target.

An `evolve` written before its node is declared is compared too. An `evolve`
naming no node id is reported by [wardley-no-undef](./wardley-no-undef.md)
instead. Names are compared as that rule compares them.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolve: error
wardley-beta
  component API [0.3, 0.4]
  evolve API 0.6
  evolve API 0.9
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/wardley-no-duplicate-evolve: error
wardley-beta
  component API [0.3, 0.4]
  evolve API 0.9
```

## Options

This rule has no options.

## Related Rules

- [wardley-no-undef](./wardley-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/wardley-no-duplicate-evolve.ts)
- [Tests source](../../tests/rules/wardley-no-duplicate-evolve.test.ts)

<!-- end auto-generated rule resources -->
