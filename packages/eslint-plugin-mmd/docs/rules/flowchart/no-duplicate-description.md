# mmd/flowchart/no-duplicate-description

Japanese version:
[no-duplicate-description.ja.md](./no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. mermaid.js accepts every `accDescr` statement,
and each one that sets the description silently replaces the description set
before it. A second description is usually left over from rewriting the text or
from pasting a part twice, and the formatted text does not show which one
counts.

## Rule Details

This rule reports every statement that sets the description after the first one.
It applies to `flowchart-v2`, `flowchart-elk`, and `swimlane`.

`accDescr:` sets the description. Without text, it sets the description too: it
makes the description empty. A closed block that holds a description sets it as
well, and a line and a block replace each other in either order. A statement
inside a subgraph sets the description of the whole diagram and is counted too.

A block that holds no description and a block that is not closed are not
counted; [no-empty-description-block](./no-empty-description-block.md) and
[no-unclosed-description-block](./no-unclosed-description-block.md) report them.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  accDescr: first
  accDescr: second
```

```mmd
flowchart LR
  accDescr { first }
  accDescr: second
```

```mmd
flowchart LR
  subgraph S
    A
    accDescr: inner
  end
  accDescr: outer
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A
  accDescr: first
```

## Options

This rule has no options.

## Related Rules

- [no-duplicate-title](./no-duplicate-title.md)
- [no-empty-description-block](./no-empty-description-block.md)
- [no-unclosed-description-block](./no-unclosed-description-block.md)

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A statement that sets the description, when another statement that sets the
description comes before it in the source. A statement that sets the description
is a `FlowchartAccDescrStatement`, also one whose `value` is null, or a
`FlowchartAccDescrBlockStatement` whose `closed` is true and whose `value` is
not null. The statements are taken from the `body` of the `FlowchartDiagram` and
of every `FlowchartSubgraphStatement` in it, in the order of their ranges; the
rule reports each one after the first.

### Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-acc-descr-replaces`
- `flowchart/db-acc-descr-line-replaces-block`
- `flowchart/db-acc-descr-block-replaces`
- `flowchart/db-acc-descr-outer-replaces-subgraph`
- `flowchart/db-acc-descr-empty-replaces`
- `flowchart/db-acc-descr-empty-block-keeps`
- `flowchart/db-acc-repeated`
- `flowchart/db-acc-descr-line-alone`
