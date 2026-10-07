# @mmd-toolkit/flowchart-no-unclosed-description-block

Japanese version:
[flowchart-no-unclosed-description-block.ja.md](./flowchart-no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block without its closing `}`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js accepts a description block whose `}` is missing. It closes the block
at the first `}` after the `{`, or, without one, at the end of the text, and
reads the lines up to there as the text of the block. Without a `}`, the
description is empty, whatever the block holds.

## Rule Details

This rule reports an `accDescr {` block that is not closed by `}`. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

A description written before the block is replaced by the empty one. The
statements after the block become its text: after `accDescr { x`, the line
`B --> C` makes no link.

The rule also reports a block that a `}` written for something else closes. A
description block ends at the first `}` after its `{`; every other character up
to there, a `{` too, is its text
([Accessibility values](../../../spec/docs/diagrams/flowchart.md#accessibility-values)
in the specification). When a later statement holds a `{` with its `}`, as the
shape `A{y}` or the data block `A@{ shape: rect }`, that `}` closes the block,
and the lines up to it become the description: after `accDescr { first`, the
lines `B --> C`, `A{y}`, and `D` give the description `first`, `B --> C`, and
`A{y`, and only the vertex `D`. The rule reports a block whose text holds a `{`
on a later line than the `{` of the block, unless the `}` that closes the block
stands alone on its line: the `}` that then closes the block is the first one
after that `{`, the one of a shape or a data block written on that line, also
where it spans lines, as `B{`, then `y}`. A `}` on the line of the `{`, as in
`accDescr { a { b }`, and a `}` alone on its line close the block as written,
and are not reported. A `}` is alone on its line when only whitespace and
directives stand before it there, whatever follows it, as in `};` or `} C`. A
`}` alone on its line is the author's also after such a `{`, as in `accDescr {`,
`uses { here`, and `}`, whose description is `uses { here`. A description that
holds a `{` and ends with its own `}` on a later line, as `accDescr {`, then
`a {b }`, is reported too: the rule does not tell that `}` from the `}` of a
shape, and such a description is rare. For the same reason, a shape written over
lines whose `}` stands alone on its line is not reported: `accDescr { x`, `B{`,
`y`, `}`, and `C` give the description `x`, `B{`, `y`, and no vertex `B`, but
its `}` looks like the author's.

For each report, the rule suggests closing the block:

- At the end of the line of the `{`, when text follows the `{` on that line and
  the lines after it are read as statements. mermaid.js then reads that text as
  the text of the block, and the lines after it as statements. Where a later
  line is no statement, as `second line, more`, the result would be rejected,
  and this suggestion is not offered.
- At the end of the text, when the block is not closed and has text on a later
  line. mermaid.js then reads all the text after the `{` as the description. A
  block that a later `}` closes gets only the first suggestion.

A block with nothing after its `{` gets no suggestion: closed there, it would be
empty. A directive is not text: with only a directive after the `{`, the block
gets no suggestion at the end of the line. A block that holds a directive that
is not closed gets no suggestion: from that directive on, the directive decides
what mermaid.js reads, wherever the block is closed. After `accDescr { d }`, the
lines `more %%{init: {}` and `A --> B` give no edge from A to B, and with
`%%{wrap` in place of `%%{init: {}`, closing the block right before the
directive is rejected. When a description is set before the block, or by a
statement after it, closing the block makes the text set the description twice,
and
[flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
then reports the later one: after `accDescr { x` and the line `accDescr { y }`,
closed at the end of the line, the description is `y`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-unclosed-description-block: error
flowchart LR
  A
  accDescr { x
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-unclosed-description-block: error
flowchart LR
  A --> B
  accDescr { x
  B --> C
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-unclosed-description-block: error
flowchart LR
  A
  accDescr { y }
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-unclosed-description-block: error
flowchart LR
  A --> B
  accDescr { x }
  B --> C
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-unclosed-description-block.ts)
- [Tests source](../../tests/rules/flowchart-no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
