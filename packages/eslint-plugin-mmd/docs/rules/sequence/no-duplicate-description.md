# mmd/sequence/no-duplicate-description

Japanese version:
[no-duplicate-description.ja.md](./no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. mermaid.js accepts every `accDescr` statement,
and each one that sets the description silently replaces the description set
before it. A second description is usually left over from rewriting the text or
from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one.
It applies to `sequence`.

`accDescr:` sets the description. Without text, it sets the description too: it
makes the description empty. A closed block that holds a description sets it as
well, and a line and a block replace each other in either order. A statement
inside a block, such as `loop`, sets the description of the whole diagram and is
counted too.

A block that holds no description is not counted;
[no-empty-description-block](./no-empty-description-block.md) reports it.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/sequence/no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
  accDescr: second
```

```mmd
%% eslint mmd/sequence/no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint mmd/sequence/no-duplicate-description: error
sequenceDiagram
  loop every minute
    A ->> B: x
    accDescr: inner
  end
  accDescr: outer
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/sequence/no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
```

## Options

This rule has no options.

## Related Rules

- [flowchart/no-duplicate-description](../flowchart/no-duplicate-description.md)
- [no-duplicate-title](./no-duplicate-title.md)
- [no-empty-description-block](./no-empty-description-block.md)
