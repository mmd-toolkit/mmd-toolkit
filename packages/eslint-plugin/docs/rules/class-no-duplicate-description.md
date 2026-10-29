# @mmd-toolkit/class-no-duplicate-description

Japanese version:
[class-no-duplicate-description.ja.md](./class-no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. When another `accDescr` statement sets it,
mermaid.js replaces the earlier description without an error, so the earlier one
is lost.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports an `accDescr` statement that changes a description set by an earlier
statement. The line form and blocks containing text are compared together.

With no text after `accDescr:`, the next line with text supplies the
description, past empty lines, comment lines, and directives.

Repeating the current description is not reported, while going back to an
earlier one is: after `accDescr: a` and `accDescr: b`, a third `accDescr: a` is
reported. Comparisons ignore whitespace at the ends and after each line break,
including indentation and empty lines in blocks, and treat LF, CRLF, and CR as
LF.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr: second
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr {
first
  }
  accDescr: second
  class A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accTitle: x
  accDescr: y
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr {
    first
  }
```

## Options

This rule has no options.

## Related Rules

- [class-no-duplicate-title](./class-no-duplicate-title.md)
- [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)
- [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-duplicate-description.ts)
- [Tests source](../../tests/rules/class-no-duplicate-description.test.ts)

<!-- end auto-generated rule resources -->
