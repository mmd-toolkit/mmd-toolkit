# @mmd-toolkit/flowchart-no-duplicate-description

Japanese version:
[flowchart-no-duplicate-description.ja.md](./flowchart-no-duplicate-description.ja.md)

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

`accDescr:` sets the description. Without text, it sets the description too: at
the end of the text it makes the description empty, and before more text it
takes the next line that holds text as the description, past empty lines,
comment lines, and directives. A closed block that holds a description sets it
as well. The line form and the block form may be mixed: whichever comes first,
the description written last is used. A statement inside a subgraph sets the
description of the whole diagram and is counted too; mermaid.js also adds the
value of such a statement to the members of the subgraph as an id, so that a
vertex or a subgraph with that id belongs to the subgraph.

A block that holds no description and a block that is not closed, which makes
the description empty, are not counted;
[flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
and
[flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
report them.

For each report, the rule suggests removing one of two statements: the reported
one, or the one before it that sets the description. mermaid.js uses the last
description that remains. Removing a statement inside a subgraph also removes
that member, unless another statement of the subgraph makes the same id a
member. A `;` after the statement stays where it separates statements; a `;`
that mermaid.js ignores by the rule of
[`style` and `classDef` lines](../../../spec/docs/common.md#style-and-classdef-lines)
in the specification, as in `accDescr: style:#b;` and `accDescr { style:#b };`,
is removed with the statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  subgraph S
    A
    accDescr: inner
  end
  accDescr: outer
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  A
  accDescr: first
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-duplicate-description.ts)
- [Tests source](../../tests/rules/flowchart-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
