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
letter case, such as `INIT` or `myINIT` (a lowercase suffix such as `myinit`
gives settings).

mermaid.js turns every `'` into `"` before reading the JSON, so
`{'theme': 'dark'}` is valid, as is a string opened with one quote and closed
with the other, but a `'` inside a `"`-quoted string, an unescaped `"` inside a
`'`-quoted string, and `\'` are read as something else. A `\'` is always
reported; the other two are reported when they are all that keeps mermaid.js
from reading the JSON. Each report comes with a fix that writes `\u0027` or
`\"`; a trailing comma is removed too. Any other error is reported once per
directive, without a fix.

A word argument, such as `%%{init: dark}%%`, or no argument gives no settings
and is not reported.

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

```mmd
%% eslint @mmd-toolkit/no-invalid-init-directive: error
%%{init: {"fontFamily": "O'Brien"}}%%
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

- [Directives](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/config/directives.md#L75-L75)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-invalid-init-directive.ts)
- [Tests source](../../tests/rules/no-invalid-init-directive.test.ts)

<!-- end auto-generated rule resources -->
