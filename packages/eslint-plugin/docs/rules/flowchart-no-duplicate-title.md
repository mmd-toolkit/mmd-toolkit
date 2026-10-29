# @mmd-toolkit/flowchart-no-duplicate-title

Japanese version:
[flowchart-no-duplicate-title.ja.md](./flowchart-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one accessible title. When another `accTitle` statement sets it,
mermaid.js replaces the earlier title without an error, so the earlier one is
lost.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports an `accTitle` statement that changes a title set by
an earlier statement. Statements inside a subgraph set the title of the whole
diagram and count too.

With no text after `accTitle:`, the next line with text supplies the title, past
empty lines, comment lines, and directives; with no such line, the title becomes
empty.

Repeating the current title is not reported, while going back to an earlier one
is: after `accTitle: a` and `accTitle: b`, a third `accTitle: a` is reported.
Titles are compared without whitespace at their ends.

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

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-title: error
flowchart LR
  A
  accTitle: first
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
