# @mmd-toolkit/no-invalid-init-directive

Japanese version:
[no-invalid-init-directive.ja.md](./no-invalid-init-directive.ja.md)

Disallow a directive meant to configure the diagram that is not written validly,
so that mermaid.js ignores it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

An init directive gives diagram settings as JSON. Invalid JSON can make
mermaid.js drop the settings of every init directive without an error. A name
ending in `init` or `initialize` with different letter case gives no settings at
all.

## Rule Details

This rule applies to every diagram type. It reports invalid JSON in an init
directive and a directive name ending in `init` or `initialize` with different
letter case, such as `INIT` or `myINIT`.

Names ending in lowercase `init` or `initialize`, including `myinit`, give
settings. mermaid.js replaces every `'` with `"` before reading the JSON, so
`{'theme': 'dark'}` is valid and is not reported. Trailing commas, unquoted
keys, missing values, and unclosed strings or objects make the JSON invalid.

JSON valid as written is not reported even if replacing `'` with `"` breaks it,
as in `{"fontFamily": "O'Brien"}`. A word argument, such as `%%{init: dark}%%`,
or no argument gives no settings and is not reported.

The examples are flowcharts.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-invalid-init-directive: error
%%{init: {"theme": "dark",}}%%
flowchart LR
  A --> B
```

```mmd
%% eslint @mmd-toolkit/no-invalid-init-directive: error
%%{INIT: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-invalid-init-directive: error
%%{init: {"theme": "dark"}}%%
flowchart LR
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [no-unclosed-directive](./no-unclosed-directive.md)
- [no-duplicate-init-key](./no-duplicate-init-key.md)

## Further Reading

- [Directives](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md#L75-L75)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-invalid-init-directive.ts)
- [Tests source](../../tests/rules/no-invalid-init-directive.test.ts)

<!-- end auto-generated rule resources -->
