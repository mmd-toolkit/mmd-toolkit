# @mmd-toolkit/flowchart-no-duplicate-title

Japanese version:
[flowchart-no-duplicate-title.ja.md](./flowchart-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one accessible title. mermaid.js accepts every `accTitle`
statement, and each one silently replaces the title set before it. A second
title is usually left over from rewriting the text or from pasting a part twice,
and the formatted text does not show which one counts.

## Rule Details

This rule reports every `accTitle` statement after the first one. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

After `accTitle: first` and `accTitle: second`, the title is `second`.
`accTitle:` with no text sets the title too: at the end of the text it makes the
title empty, and before more text it takes the next line that holds text as the
title, past empty lines, comment lines, and directives. Either way, a title
written before it is lost. A statement inside a subgraph sets the title of the
whole diagram and is counted too; mermaid.js also adds the value of such a
statement to the members of the subgraph as an id, so that a vertex or a
subgraph with that id belongs to the subgraph.

For each report, the rule suggests removing one of two statements: the reported
one, or the `accTitle` statement before it. mermaid.js uses the last title that
remains. Removing a statement inside a subgraph also removes that member, unless
another statement of the subgraph makes the same id a member. A `;` after the
statement stays where it separates statements; a `;` that mermaid.js ignores by
the rule of
[`style` and `classDef` lines](../../../spec/docs/common.md#style-and-classdef-lines)
in the specification, as in `accTitle: style:#b;`, is removed with the
statement.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  accTitle: first
  accTitle: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: x
  accTitle:
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  subgraph S
    A
    accTitle: inner
  end
  accTitle: outer
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: first
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-duplicate-title.ts)
- [Tests source](../../tests/rules/flowchart-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
