# mmd/flowchart/no-unclosed-description-block

Japanese version:
[no-unclosed-description-block.ja.md](./no-unclosed-description-block.ja.md)

Disallow an `accDescr {` block without its closing `}`.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

mermaid.js accepts a description block that is never closed. The rest of the
diagram is read as the text of the block, and the description is empty, whatever
the block holds.

## Rule Details

This rule reports an `accDescr {` block that is not closed by `}`. It applies to
`flowchart-v2`, `flowchart-elk`, and `swimlane`.

A description written before the block is replaced by the empty one. The
statements after the block become its text: after `accDescr { x`, the line
`B --> C` makes no link.

For each report, the rule suggests closing the block:

- At the end of the line of the `{`, when text follows the `{` on that line.
  mermaid.js then reads that text as the description, and the lines after it as
  statements.
- At the end of the text, when the block has text on a later line. mermaid.js
  then reads all the text after the `{` as the description.

A block with nothing after its `{` gets no suggestion: closed there, it would be
empty. A directive is not text: with only a directive after the `{`, the block
gets no suggestion at the end of the line. A block that holds a directive that
is not closed gets no suggestion: from that directive on, the directive decides
what mermaid.js reads, wherever the block is closed. After `accDescr { d }`, the
lines `more %%{init: {}` and `A --> B` give no edge from A to B, and with
`%%{wrap` in place of `%%{init: {}`, closing the block right before the
directive is rejected. When a description is set before the block, the closed
block replaces it, and [no-duplicate-description](./no-duplicate-description.md)
then reports the block: the text sets the description twice.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  A
  accDescr { x
```

```mmd
flowchart LR
  A --> B
  accDescr { x
  B --> C
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A
  accDescr { y }
```

```mmd
flowchart LR
  A --> B
  accDescr { x }
  B --> C
```

## Options

This rule has no options.

## Related Rules

- [no-empty-description-block](./no-empty-description-block.md)
- [no-duplicate-description](./no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../../src/rules/flowchart/no-unclosed-description-block.ts)
- [Tests source](../../../tests/rules/flowchart/no-unclosed-description-block.test.ts)

<!-- end auto-generated rule resources -->
