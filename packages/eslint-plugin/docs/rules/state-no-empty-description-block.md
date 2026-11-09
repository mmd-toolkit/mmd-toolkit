---
since: v0.1.0
---

# @mmd-toolkit/state-no-empty-description-block

Japanese version:
[state-no-empty-description-block.ja.md](./state-no-empty-description-block.ja.md)

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

This rule applies to state diagrams (`stateDiagram` and `stateDiagram-v2`). It
reports a closed `accDescr` block containing nothing or only whitespace.
Directives do not count as text, so a block containing only directives is
reported, although mermaid.js applies their settings.

A block containing a comment line is not reported, including when it also
contains directives, because comments can mark a description left to be filled
in later.

Empty blocks are also reported after a statement or the header on the same line.
An empty block before a body's `{` on a later line belongs to no statement and
is reported by [state-no-ignored-text](./state-no-ignored-text.md) instead.

The formatter prints an empty block as `accDescr {}` and a block with its text
on one line, `accDescr { text }`, as `accDescr: text`. The example with
whitespace inside the braces and the example of a block with its text on one
line are shown as written.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr {}
```

<!-- prettier-ignore -->
```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr {
  }
```

Examples of **correct** code for this rule:

<!-- prettier-ignore -->
```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/state-no-empty-description-block: error
stateDiagram-v2
  A --> B
  accDescr {
    %% c
  }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [state-no-unclosed-description-block](./state-no-unclosed-description-block.md)
- [state-no-duplicate-description](./state-no-duplicate-description.md)

<!-- begin auto-generated rule version -->

## Version

This rule was introduced in `@mmd-toolkit/eslint-plugin` v0.1.0.

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-empty-description-block.ts)
- [Tests source](../../tests/rules/state-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
