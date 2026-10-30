# @mmd-toolkit/state-no-duplicate-title

Japanese version:
[state-no-duplicate-title.ja.md](./state-no-duplicate-title.ja.md)

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

This rule applies to state diagrams (`stateDiagram` and `stateDiagram-v2`). It
reports an `accTitle` statement that changes a title set by an earlier
statement. Repeating the current title is not reported, and whitespace at the
ends is ignored when comparing titles.

An `accTitle:` with no text also sets the title and is counted: the next line
with text supplies the title, past empty lines, comment lines, and directives;
with no such line, the title becomes empty. Inside a composite state,
`accTitle: x` defines a state named `accTitle` with description `x`, so it is
not counted.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accTitle: second
  A --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-title: error
stateDiagram-v2
  accTitle: first
  accTitle: first
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [state-no-duplicate-description](./state-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-duplicate-title.ts)
- [Tests source](../../tests/rules/state-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
