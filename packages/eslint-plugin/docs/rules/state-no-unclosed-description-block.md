# @mmd-toolkit/state-no-unclosed-description-block

Japanese version:
[state-no-unclosed-description-block.ja.md](./state-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block without its closing `}`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js accepts an `accDescr {` block without its closing `}` without an
error. It reads later lines as description text until the first `}`, or the end
of the text. Without a `}`, the description becomes empty.

## Rule Details

This rule applies to state diagrams (`stateDiagram` and `stateDiagram-v2`). It
reports an `accDescr {` block with no closing `}`.

It also reports a closed block containing a `{` on a later line than its opening
`{`, even when its closing `}` stands alone on its line. A composite state's
closing `}` can close the description instead, taking the states inside it into
the description.

A description that intentionally includes a `{` on a later line is reported too,
because the rule cannot distinguish its closer from a composite state's. A
closer on the opening line, as in `accDescr { a { b }`, is not reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  A --> B
  accDescr { x
```

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  accDescr { x
  state B {
    C
  }
  D --> E
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-unclosed-description-block: error
stateDiagram-v2
  A --> B
  accDescr { x }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
- [state-no-empty-description-block](./state-no-empty-description-block.md)
- [state-no-duplicate-description](./state-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/state-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
