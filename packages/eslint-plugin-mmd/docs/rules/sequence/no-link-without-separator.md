# mmd/sequence/no-link-without-separator

Japanese version:
[no-link-without-separator.ja.md](./no-link-without-separator.ja.md)

Disallow a `link` statement without the `@` between its label and its URL.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A `link` statement gives a participant a link: its text is a label, `@`, and a
URL, as in `link A: Dashboard @ https://x.example`. When the `@` is left out,
mermaid.js accepts the statement anyway and sets a link whose label and URL are
not what was written.

## Rule Details

This rule reports a `link` statement whose text holds no `@`. It applies to
`sequence`.

Without the `@`, the label is the text without its last two characters, and the
URL is the whole text: `link A: Dashboard https://x.example` gives the label
`Dashboard https://x.examp` and the URL `Dashboard https://x.example`.

A `link` statement with no text is reported too: `link A:` gives the participant
a link whose label and URL are both empty.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/sequence/no-link-without-separator: error
sequenceDiagram
  participant A
  link A: Dashboard https://x.example
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/sequence/no-link-without-separator: error
sequenceDiagram
  link A: Dash @ https://x.example
```

## Options

This rule has no options.

## Related Rules

- [no-invalid-json](./no-invalid-json.md)
