# mmd/flowchart/no-duplicate-description

Japanese version:
[no-duplicate-description.ja.md](./no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

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

For each report, the rule suggests removing one of two statements: the reported
one, or the one before it that sets the description. mermaid.js uses the last
description that remains.

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

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../../src/rules/flowchart/no-duplicate-description.ts)
- [Tests source](../../../tests/rules/flowchart/no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
