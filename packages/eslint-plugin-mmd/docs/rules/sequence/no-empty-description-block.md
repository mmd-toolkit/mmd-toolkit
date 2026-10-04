# mmd/sequence/no-empty-description-block

Japanese version:
[no-empty-description-block.ja.md](./no-empty-description-block.ja.md)

Disallow an `accDescr` block that holds no description.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A description block is written to give the diagram its description. When the
block holds nothing, or only whitespace, mermaid.js accepts it and does nothing
with it, so the block has no effect.

## Rule Details

This rule reports a closed `accDescr` block that holds nothing or only
whitespace. It applies to `sequence`.

The description stays what it was before the block: after `accDescr: x`, the
block `accDescr {}` leaves the description `x`, and with no description before
it, the description stays empty. An empty description written as a line is
different: `accDescr:` sets the description to the empty text.

A block that holds only comments is not reported. The author who turns the lines
of a description into comments means the block to do nothing, and mermaid.js
reads it so: the description before the block stays.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/sequence/no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {}
```

```mmd
%% eslint mmd/sequence/no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { }
```

```mmd
%% eslint mmd/sequence/no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {
  }
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/sequence/no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
%% eslint mmd/sequence/no-empty-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr {
    %% c
  }
```

## Options

This rule has no options. An option to also report a block that holds only
comments will be considered only if users of the rule ask for it.

## Related Rules

- [flowchart/no-empty-description-block](../flowchart/no-empty-description-block.md)
- [no-duplicate-description](./no-duplicate-description.md)
