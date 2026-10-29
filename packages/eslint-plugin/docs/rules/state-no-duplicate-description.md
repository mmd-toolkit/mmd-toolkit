# @mmd-toolkit/state-no-duplicate-description

Japanese version:
[state-no-duplicate-description.ja.md](./state-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A diagram has one description. When another `accDescr` statement sets it,
mermaid.js replaces the earlier description without an error, so the earlier one
is lost.

## Rule Details

This rule applies to state diagrams (`stateDiagram` and `stateDiagram-v2`). It
reports an `accDescr` statement that changes a description set by an earlier
statement. The line and block forms are compared together.

An `accDescr:` with no text also sets the description and is counted: the next
line with text supplies the description, past empty lines, comment lines, and
directives; with no such line, the description becomes empty. Empty blocks and
unclosed blocks are not counted by this rule. Inside a composite state,
`accDescr: x` defines a state named `accDescr` with description `x`, so it is
not counted either.

Repeating the current description is not reported. Comparisons ignore whitespace
at the ends and after each line break, including indentation and empty lines in
blocks, and treat LF, CRLF, and CR as LF.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr { first }
  accDescr: second
  A --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accTitle: first
  accDescr: second
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-duplicate-description: error
stateDiagram-v2
  accDescr: first
  accDescr {
    first
  }
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [state-no-duplicate-title](./state-no-duplicate-title.md)
- [state-no-empty-description-block](./state-no-empty-description-block.md)
- [state-no-unclosed-description-block](./state-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-duplicate-description.ts)
- [Tests source](../../tests/rules/state-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
