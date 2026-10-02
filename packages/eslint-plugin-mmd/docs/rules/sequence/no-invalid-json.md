# mmd/sequence/no-invalid-json

Japanese version: [no-invalid-json.ja.md](./no-invalid-json.ja.md)

Disallow a `links` or `properties` statement whose text is not a JSON object.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

`links` and `properties` give a participant links or properties from a JSON
object, as in `links A: {"Dashboard": "https://x.example"}`. When the text is
not JSON, mermaid.js accepts the statement and does nothing with it, without an
error. A comma after the last entry is enough.

## Rule Details

This rule reports a `links` or `properties` statement whose text is not a JSON
object. It applies to `sequence`.

Text that is not JSON changes nothing:
`links A: {"Dashboard": "https://x.example",}` gives the participant no link,
and `properties A: {"class": "internal",}` no property. JSON that is not an
object is reported too, because mermaid.js does not read it as the author meant:
a string gives each of its characters under its position, `links A: "ab"` gives
the links `0` and `1`, an array gives each element under its position, and a
number gives nothing.

A statement with no text, as in `links A:` or `properties A:`, is reported too:
it gives the participant nothing.

Examples of **incorrect** code for this rule:

```mmd
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example",}
```

```mmd
sequenceDiagram
  participant A
  properties A: {"class": "internal",}
```

Examples of **correct** code for this rule:

```mmd
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example"}
```

## Options

This rule has no options.

## Related Rules

- [no-link-without-separator](./no-link-without-separator.md)
- [no-ignored-init-directive](../no-ignored-init-directive.md)
