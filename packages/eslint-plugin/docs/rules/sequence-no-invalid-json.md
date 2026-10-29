# @mmd-toolkit/sequence-no-invalid-json

Japanese version:
[sequence-no-invalid-json.ja.md](./sequence-no-invalid-json.ja.md)

Disallow a `links` or `properties` statement whose text is not a JSON object.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

`links` and `properties` give a participant links or properties from a JSON
object. When the text is not JSON, mermaid.js accepts the statement without an
error but does nothing with it. A trailing comma is enough to lose the links or
properties.

## Rule Details

This rule applies to sequence diagrams (`sequenceDiagram`). It reports a `links`
or `properties` statement whose text is not a JSON object, including empty text.
Other JSON values are reported too: strings and arrays give entries under their
positions, while numbers, `true`, `false`, and `null` give nothing.

mermaid.js ends the text at `#`. A text that is a JSON object only with the `#`
and what follows it, as one that holds a URL with a fragment, is not reported:
it is correct JSON, and mermaid.js cutting it at the `#` looks like a defect
(see Further Reading). A JSON object valid before the `#` is not reported
either, because mermaid.js reads that object.

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

## Further Reading

- [Issue #5419: `#` in sequence diagram text](https://github.com/mermaid-js/mermaid/issues/5419)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-invalid-json.ts)
- [Tests source](../../tests/rules/sequence-no-invalid-json.test.ts)

<!-- end auto-generated rule resources -->
