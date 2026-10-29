# @mmd-toolkit/sequence-no-duplicate-description

Japanese version:
[sequence-no-duplicate-description.ja.md](./sequence-no-duplicate-description.ja.md)

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

This rule applies to sequence diagrams (`sequenceDiagram`). It reports an
`accDescr` statement that changes a description set by an earlier statement. The
line and block forms are compared together, including statements inside blocks
such as `loop`, which set the description of the whole diagram.

An `accDescr:` with no text also sets the description and is counted: the next
line with text supplies the description, past empty lines, comment lines, and
directives; with no such line, the description becomes empty. Empty blocks and
unclosed blocks are not counted by this rule.

Repeating the current description is not reported. Comparisons ignore whitespace
at the ends and after each line break, including indentation and empty lines in
blocks, and treat LF, CRLF, and CR as LF.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  loop every minute
    A ->> B: x
    accDescr: inner
  end
  accDescr: outer
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  A ->> B: x
  accDescr: first
```

```mmd
%% eslint @mmd-toolkit/sequence-no-duplicate-description: error
sequenceDiagram
  accDescr: first
  accDescr {
    first
  }
  A ->> B: x
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.md)
- [sequence-no-empty-description-block](./sequence-no-empty-description-block.md)
- [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-duplicate-description.ts)
- [Tests source](../../tests/rules/sequence-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
