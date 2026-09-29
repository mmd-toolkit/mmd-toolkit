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
sequenceDiagram
  participant A
  link A: Dashboard https://x.example
```

Examples of **correct** code for this rule:

```mmd
sequenceDiagram
  link A: Dash @ https://x.example
```

## Options

This rule has no options.

## Related Rules

- [no-invalid-json](./no-invalid-json.md)

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A `SequenceLinkStatement` whose text holds no `@`: its `text` is null, the
`value` of its `text` is null, or the `value` of that `SequenceLiteral` holds no
`@`. Looking for `@` in the value is a reading of the value, not a second lexing
of the text.

### Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-link-without-at-url`
- `sequence/db-link-without-at`
- `sequence/db-link-label`
- `sequence/db-link-empty`
