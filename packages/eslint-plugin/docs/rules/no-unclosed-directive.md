# @mmd-toolkit/no-unclosed-directive

Japanese version: [no-unclosed-directive.ja.md](./no-unclosed-directive.ja.md)

Disallow a directive without its closing `}%%` that takes the lines after it.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A directive runs from `%%{` to its closing `}%%`. When the closer is missing,
mermaid.js can read later lines into the directive without an error, and their
statements disappear from the diagram.

## Rule Details

This rule applies to every diagram type. It reports a directive containing text
on a later line than its `%%{`, other than its name and the JSON object or array
that starts its argument. Such a directive is reported both when it has no `}%%`
and when a `}%%` written later, as that of a later directive, closes it.

Multiline JSON objects and arrays are not reported; when the object is not
closed, the rest of the directive is part of it and is not reported. Brackets
and quotes are counted as mermaid.js reads them: `'` and `"` each close a
string. A directive at the end of the text that takes no statement is not
reported, even without `}%%`. `%%{wrap` at the end of a line takes the first
word of the next line as its argument, and that word disappears; the rule
reports it.

When the text without what a directive takes is no valid diagram, as when the
directive takes the header, mermaid.js gives an error and the rule does not
report it.

The examples are flowcharts.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"theme": "dark"}}
  C --> D
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/no-unclosed-directive: error
flowchart LR
  A --> B
  %%{init: {"theme": "dark"}}%%
  C --> D
```

## Options

This rule has no options.

## Related Rules

- [no-invalid-init-directive](./no-invalid-init-directive.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/no-unclosed-directive.ts)
- [Tests source](../../tests/rules/no-unclosed-directive.test.ts)

<!-- end auto-generated rule resources -->
