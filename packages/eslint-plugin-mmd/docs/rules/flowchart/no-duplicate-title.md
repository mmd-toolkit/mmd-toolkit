# mmd/flowchart/no-duplicate-title

Japanese version: [no-duplicate-title.ja.md](./no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A diagram has one accessible title. mermaid.js accepts every `accTitle`
statement, and each one silently replaces the title set before it. A second
title is usually left over from rewriting the text or from pasting a part twice,
and the formatted text does not show which one counts.

## Rule Details

This rule reports every `accTitle` statement after the first one. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

After `accTitle: first` and `accTitle: second`, the title is `second`.
`accTitle:` with no text sets the title too: it makes the title empty, so a
title written before it is lost. A statement inside a subgraph sets the title of
the whole diagram and is counted too.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  accTitle: first
  accTitle: second
```

```mmd
flowchart LR
  A
  accTitle: x
  accTitle:
```

```mmd
flowchart LR
  subgraph S
    A
    accTitle: inner
  end
  accTitle: outer
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A
  accTitle: first
```

## Options

This rule has no options.

## Related Rules

- [no-duplicate-description](./no-duplicate-description.md)

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

A `FlowchartAccTitleStatement`, also one whose `value` is null, when another
`FlowchartAccTitleStatement` comes before it in the source. The statements are
taken from the `body` of the `FlowchartDiagram` and of every
`FlowchartSubgraphStatement` in it, in the order of their ranges; the rule
reports each one after the first.

### Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/db-acc-title-replaces`
- `flowchart/db-acc-title-empty-replaces`
- `flowchart/db-acc-title-outer-replaces-subgraph`
- `flowchart/db-acc-repeated`
- `flowchart/db-acc-title-alone`
