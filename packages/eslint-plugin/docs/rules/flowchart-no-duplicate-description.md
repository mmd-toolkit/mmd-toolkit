# @mmd-toolkit/flowchart-no-duplicate-description

Japanese version:
[flowchart-no-duplicate-description.ja.md](./flowchart-no-duplicate-description.ja.md)

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

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports an `accDescr` statement that changes a description
set by an earlier statement. The line and block forms are compared together,
including statements inside a subgraph, which set the description of the whole
diagram.

With no text after `accDescr:`, the next line with text supplies the
description, past empty lines, comment lines, and directives; with no such line,
the description becomes empty. Empty blocks and unclosed blocks are not counted
by this rule.

Repeating the current description is not reported, while going back to an
earlier one is: after `accDescr: a` and `accDescr: b`, a third `accDescr: a` is
reported. Comparisons ignore whitespace at the ends and after each line break,
including indentation and empty lines in blocks, and treat LF, CRLF, and CR as
LF.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr: first
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  accDescr { first }
  accDescr: second
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  subgraph S
    A
    accDescr: inner
  end
  accDescr: outer
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  A
  accDescr: first
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-duplicate-description: error
flowchart LR
  A
  accDescr: first
  accDescr {
    first
  }
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)
- [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-duplicate-description.ts)
- [Tests source](../../tests/rules/flowchart-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
