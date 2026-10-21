# @mmd-toolkit/sequence-no-invalid-json

Japanese version:
[sequence-no-invalid-json.ja.md](./sequence-no-invalid-json.ja.md)

Disallow a `links` or `properties` statement whose text is not a JSON object.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

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
number, `true`, `false`, or `null` gives nothing.

A `#` ends the text of the statement, and mermaid.js reads the text before it. A
text that is a JSON object with the `#` and what follows it is not reported:
`links A: {"Docs": "https://x.example/#top"}`, with a URL with a fragment, is a
correct JSON object, and mermaid.js gives the participant no link only because
it cuts the text at the `#`, which looks like a defect of mermaid.js
([#5419](https://github.com/mermaid-js/mermaid/issues/5419), open, reports that
a `#` empties the texts of a sequence diagram). A text that is a JSON object
before the `#`, as in `links A: {"Docs": "https://x.example/"} # note`, gives
the link, and it is not reported either.

A statement with no text, as in `links A:` or `properties A:`, is reported too:
it gives the participant nothing.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-invalid-json: error
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example",}
```

```mmd
%% eslint @mmd-toolkit/sequence-no-invalid-json: error
sequenceDiagram
  participant A
  properties A: {"class": "internal",}
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-invalid-json: error
sequenceDiagram
  participant A
  links A: {"Dashboard": "https://x.example"}
```

## Options

This rule has no options.

## Related Rules

- [sequence-no-link-without-separator](./sequence-no-link-without-separator.md)
- [no-invalid-init-directive](./no-invalid-init-directive.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-invalid-json.ts)
- [Tests source](../../tests/rules/sequence-no-invalid-json.test.ts)

<!-- end auto-generated rule resources -->
