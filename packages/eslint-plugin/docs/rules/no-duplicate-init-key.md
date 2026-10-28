# @mmd-toolkit/no-duplicate-init-key

Japanese version: [no-duplicate-init-key.ja.md](./no-duplicate-init-key.ja.md)

Disallow a key written twice in one object of the JSON of an init directive.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

mermaid.js reads the JSON of an init directive with the last value of a key that
one object holds twice, without an error, and the earlier value is lost.

## Rule Details

This rule reports a key that an object of the JSON of an init directive holds
again with another value. It applies to every diagram type.

After `%%{init: {"theme": "dark", "theme": "forest"}}%%`, the theme is `forest`.
Objects at every depth are checked, as the object of `flowchart` in
`{"flowchart": {"inheritDir": true, "inheritDir": false}}`. Keys are compared as
JSON reads them, with every `'` read as `"`, as mermaid.js does. A key written
again with an equal value is not reported, nor are the keys of two init
directives: the documentation combines the init directives of a text, with the
last value of each key, as a way of writing.

Only JSON that mermaid.js reads is checked: where the JSON is not valid,
[no-invalid-init-directive](./no-invalid-init-directive.md) reports it.

Keep one of the two members.

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

## Background

[`detectDirective`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L159-L198)
reads each JSON argument with `JSON.parse`, which keeps the last value of a key,
and the
[documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md#L88-L96)
combines the init directives of a text with the last value given for each key.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-duplicate-init-key.ts)
- [Tests source](../../tests/rules/no-duplicate-init-key.test.ts)

<!-- end auto-generated rule resources -->
