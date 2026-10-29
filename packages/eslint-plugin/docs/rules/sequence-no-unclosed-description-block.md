# @mmd-toolkit/sequence-no-unclosed-description-block

Japanese version:
[sequence-no-unclosed-description-block.ja.md](./sequence-no-unclosed-description-block.ja.md)

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

This rule applies to sequence diagrams (`sequenceDiagram`). It reports an
`accDescr {` block with no closing `}`.

It also reports a closed block containing a `{` on a later line than its opening
`{`, unless only whitespace and directives precede its closing `}` on that line.
A block ends at the first `}` after its `{`, so the `}` of a later data block,
JSON object, or message can close it by mistake. A block closed on the line of
its `{`, as `accDescr { a { b }`, is not reported, and text after the closer, as
in `};` or `} A ->> B: x`, does not affect the exception.

A description that intentionally includes a `{` on a later line is also reported
when its closer does not meet that exception. Conversely, a data block whose
closing `}` has only whitespace and directives before it is not reported, even
though the description takes the data block's text. The rule cannot tell these
closers apart.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y
  B ->> A: z
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/sequence-no-unclosed-description-block: error
sequenceDiagram
  A ->> B: x
  accDescr { y }
  B ->> A: z
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/sequence-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
