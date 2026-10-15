# @mmd-toolkit/er-no-duplicate-description

Japanese version:
[er-no-duplicate-description.ja.md](./er-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. mermaid.js accepts every `accDescr` statement,
and each one that sets the description silently replaces the description set
before it. A second description is usually left over from rewriting the text or
from pasting a part twice.

## Rule Details

This rule reports every statement that sets the description after the first one,
when it sets a description other than the one before it. It applies to `er`.

`accDescr:` and a description block with text both set the description, and they
may be mixed: after `accDescr: a` and `accDescr { b }`, the description is `b`.
`accDescr:` with no text on its line takes the next line that holds text, as
`accTitle:` does; at the end of the text, mermaid.js rejects it. A statement
inside a subgraph sets the description of the whole diagram and is counted too;
mermaid.js also adds its text to the members of the subgraph.

A block that holds no description is not counted;
[er-no-empty-description-block](./er-no-empty-description-block.md) reports it.

A statement that sets the description that the diagram already has is not
reported, in either form: after `accDescr: d`, the block `accDescr { d }` loses
nothing. Descriptions are compared as mermaid.js keeps them, without the
whitespace at their ends and without the whitespace after each line break, so
the indentation of the lines of a block and the empty lines in it do not count.
After `accDescr: a` and `accDescr: b`, a third `accDescr: a` is reported,
because it replaces `b`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr { second }
  A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accTitle: first
  accDescr: second
  A
```

```mmd
%% eslint @mmd-toolkit/er-no-duplicate-description: error
erDiagram
  accDescr: first
  accDescr {
    first
  }
  A
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [er-no-duplicate-title](./er-no-duplicate-title.md)
- [er-no-empty-description-block](./er-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/er-no-duplicate-description.ts)
- [Tests source](../../tests/rules/er-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
