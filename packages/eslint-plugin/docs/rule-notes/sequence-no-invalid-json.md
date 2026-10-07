# @mmd-toolkit/sequence-no-invalid-json

Japanese version:
[sequence-no-invalid-json.ja.md](./sequence-no-invalid-json.ja.md)

Notes for implementing the rule
[@mmd-toolkit/sequence-no-invalid-json](../rules/sequence-no-invalid-json.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `SequenceLinksStatement` or a `SequencePropertiesStatement` whose text is not
a JSON object: its `text` is null, the `value` of its `text` is null, or the
`value` of that `SequenceLiteral`, parsed as JSON, is not JSON or is JSON that
is not an object. The tree does not read the JSON: the rule parses the value,
and mermaid.js parses the text in converted form, where an entity is its
placeholder (see Links and properties in the specification's
diagrams/sequence.md). This is a reading of data that the parser keeps as
written, as in
[no-ignored-init-directive](../rules/no-ignored-init-directive.md), not a second
lexing of the diagram.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `sequence/db-links-trailing-comma`
- `sequence/db-properties-trailing-comma`
- `sequence/db-links-object`
- `sequence/db-links-not-json`
- `sequence/db-properties-not-json`
- `sequence/db-links-string-value`
- `sequence/db-links-array-value`
- `sequence/db-links-number-value`
- `sequence/db-links-empty`
- `sequence/db-properties-empty`
