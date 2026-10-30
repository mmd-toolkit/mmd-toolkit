# @mmd-toolkit/flowchart-no-empty-description-block

Japanese version:
[flowchart-no-empty-description-block.ja.md](./flowchart-no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

An `accDescr` block is written to give the diagram a description. When it
contains nothing or only whitespace, mermaid.js accepts it without an error but
takes no description from it.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports a closed `accDescr` block containing nothing or
only whitespace. Directives do not count as text, so a block containing only
directives is reported, although mermaid.js applies their settings.

A block containing a comment line is not reported, including when it also
contains directives, because comments can mark a description left to be filled
in later.

Empty blocks are also reported after a statement or the header on the same line.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {}
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-empty-description-block: error
flowchart LR
  A
  accDescr {
    %% c
  }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-empty-description-block.ts)
- [Tests source](../../tests/rules/flowchart-no-empty-description-block.test.ts)

<!-- end auto-generated rule resources -->
