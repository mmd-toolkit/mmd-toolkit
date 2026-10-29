# @mmd-toolkit/no-duplicate-init-key

Japanese version: [no-duplicate-init-key.ja.md](./no-duplicate-init-key.ja.md)

Disallow a key written twice in one object of the JSON of an init directive.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

When one JSON object in an init directive contains a key twice, mermaid.js uses
its last value without an error. The earlier value is lost.

## Rule Details

This rule applies to every diagram type. It reports a key repeated with a
different value in the same JSON object of an init directive, at any depth. Keys
are compared as JSON reads them after replacing each `'` with `"`, as mermaid.js
does.

Repeating an equal value is not reported. Nor is repeating a key in separate
init directives: combining their settings with the last value of each key is a
documented way of writing. Invalid JSON is reported by
[no-invalid-init-directive](./no-invalid-init-directive.md) instead.

The examples are flowcharts.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-duplicate-init-key: error
%%{init: {"theme": "dark", "theme": "forest"}}%%
flowchart LR
  A --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-duplicate-init-key: error
%%{init: {"theme": "forest"}}%%
flowchart LR
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [no-invalid-init-directive](./no-invalid-init-directive.md)

## Further Reading

- [Directives](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md#L88-L96)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-duplicate-init-key.ts)
- [Tests source](../../tests/rules/no-duplicate-init-key.test.ts)

<!-- end auto-generated rule resources -->
