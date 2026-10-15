# @mmd-toolkit/requirement-no-empty-description-block

Japanese version:
[requirement-no-empty-description-block.ja.md](./requirement-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A description block is written to give the diagram its description. When the
block holds nothing, or only whitespace, mermaid.js accepts it and does nothing
with it, so the block has no effect.

## Rule Details

This rule reports an `accDescr` block that holds nothing or only whitespace. It
applies to `requirement`. A directive in the block is no text: a block that
holds only directives is reported too, and mermaid.js still applies their
settings.

The description stays what it was before the block: after `accDescr: a`, the
block `accDescr {}` leaves the description `a`.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so. A block that holds a comment line is not reported also when it
holds directives besides; mermaid.js applies their settings. A block left to be
filled in later is written with a comment in it, as `accDescr {`, `%% TODO`, and
`}`, and it is not reported.

An empty block may also stand after the header, as in
`requirementDiagram accDescr {}`, and after the `}` of a body on its line.
Inside the body of a requirement or an element, mermaid.js does not read an
empty block either: on a line of its own, before a field on its line, as in
`accDescr {} id: 1`, after a field whose value is a string or a keyword, as in
`risk: high accDescr {}`, and before the `}`. The rule reports each such block
in the same way, two side by side as two. Inside the text of `accTitle:`,
`accDescr {}` is part of that text, and the rule does not report it; after a
direction, [requirement-no-ignored-text](./requirement-no-ignored-text.md)
reports it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr {}
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  requirement r {
    accDescr {}
    id: 1
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr { y }
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-empty-description-block: error
requirementDiagram
  accDescr {
    %% old description
  }
  requirement r {
    id: 1
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-empty-description-block](./er-no-empty-description-block.md)
- [requirement-no-duplicate-description](./requirement-no-duplicate-description.md)
- [requirement-no-ignored-text](./requirement-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-empty-description-block.ts)
- [Tests source](../../tests/rules/requirement-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
