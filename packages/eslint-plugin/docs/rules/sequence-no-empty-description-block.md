# @mmd-toolkit/sequence-no-empty-description-block

Japanese version:
[sequence-no-empty-description-block.ja.md](./sequence-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `accDescr` block is written to give the diagram a description. When it
contains nothing or only whitespace, mermaid.js accepts it without an error, but
it has no effect.

## Rule Details

This rule applies to sequence diagrams (`sequenceDiagram`). It reports a closed
`accDescr` block containing nothing or only whitespace. Directives do not count
as text, so a block containing only directives is reported, although mermaid.js
applies their settings.

A block containing a comment line is not reported, including when it also
contains directives, because comments can mark a description left to be filled
in later.

An empty block is reported also where it shares a line with a statement, before
it or after its last part, where it follows the header on its line, and inside a
box.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {
    %% c
  }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-empty-description-block.ts)
- [Tests source](../../tests/rules/sequence-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
