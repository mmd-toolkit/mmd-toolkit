# @mmd-toolkit/no-invalid-init-directive

Japanese version:
[no-invalid-init-directive.ja.md](./no-invalid-init-directive.ja.md)

Disallow a directive meant to configure the diagram that is not written validly,
so that mermaid.js ignores it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A directive whose name ends with `init` or `initialize` gives settings as JSON,
as `%%{init: {"theme": "dark"}}%%`. When its JSON is not valid, mermaid.js drops
the settings of every init directive of the text without an error. A name that
ends with `init` in another case of letters, as `INIT`, gives no settings at
all.

## Rule Details

This rule reports an init directive whose JSON is not valid, and a directive
whose name ends with `init` or `initialize` only in another case of letters. It
applies to every diagram type.

A directive gives settings when its name ends with `init` or `initialize` in
lower case: `init`, `initialize`, and `myinit` do. Its argument is JSON when it
starts with a character that is not a word character. mermaid.js turns every `'`
of the text into `"` before it reads the JSON, so `{'theme': 'dark'}` is valid.
With a trailing comma, as in `{"theme": "dark",}`, a key without quotes, a
missing value, or a string or an object left open, the JSON is not valid, and
mermaid.js drops the settings of this directive and of every other init
directive, before it and after it.

JSON that is valid as written is not reported, also where turning `'` into `"`
breaks it, as in `{"fontFamily": "O'Brien"}`: the author wrote valid JSON, and
mermaid.js drops the settings by its own reading. An argument that is a word, as
in `%%{init: dark}%%`, or no argument gives no settings and is not reported.
Before it reads the settings, mermaid.js removes the whitespace at the end of
the text, and then the text from a `%%` that `}%%` follows, as `%%}%%`, to the
end of its line where a line break ends that line. So a directive with JSON that
is not valid after `%%}%%` on its line drops only its own settings when text
other than whitespace follows that line, and on the last line, it drops those of
every init directive. It is reported in both cases.

`INIT`, `Init`, and `myINIT` end with `init` only in another case of letters:
mermaid.js does not read them as settings, and the other init directives still
apply.

When a directive without its `}%%` takes later lines into its JSON,
[no-unclosed-directive](./no-unclosed-directive.md) reports it too.

Correct the JSON, or write the name in lower case.

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

## Background

[`detectInit`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L98-L130)
reads the directives whose names end with `init` or `initialize`, and
[`detectDirective`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/utils.ts#L159-L198)
turns every `'` into `"`, parses each JSON argument, and gives no directive at
all when one of them is not valid. The
[documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/config/directives.md#L75-L75)
says that an argument that is not valid is ignored.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-invalid-init-directive.ts)
- [Tests source](../../tests/rules/no-invalid-init-directive.test.ts)

<!-- end auto-generated rule resources -->
