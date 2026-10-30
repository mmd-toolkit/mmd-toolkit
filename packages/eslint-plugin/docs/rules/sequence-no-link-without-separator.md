# @mmd-toolkit/sequence-no-link-without-separator

Japanese version:
[sequence-no-link-without-separator.ja.md](./sequence-no-link-without-separator.ja.md)

Disallow a `link` statement without the `@` between its label and its URL.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A `link` statement gives a participant a link with a label, `@`, and a URL. When
`@` is missing, mermaid.js accepts the statement without an error but sets a
different label and URL from what was written.

## Rule Details

This rule applies to sequence diagrams (`sequenceDiagram`). It reports a `link`
statement with no `@` in its text, including one with no text.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-link-without-separator: error
sequenceDiagram
  participant A
  link A: Dashboard https://x.example
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-link-without-separator: error
sequenceDiagram
  link A: Dash @ https://x.example
```

## Options

This rule has no options.

## Related Rules

- [sequence-no-invalid-json](./sequence-no-invalid-json.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-link-without-separator.ts)
- [Tests source](../../tests/rules/sequence-no-link-without-separator.test.ts)

<!-- end auto-generated rule resources -->
