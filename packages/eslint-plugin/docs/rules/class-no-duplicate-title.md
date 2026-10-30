# @mmd-toolkit/class-no-duplicate-title

Japanese version:
[class-no-duplicate-title.ja.md](./class-no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A diagram has one accessible title. When another `accTitle` statement sets it,
mermaid.js replaces the earlier title without an error, so the earlier one is
lost.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports an `accTitle` statement that changes a title set by an earlier
statement. Repeating the current title is not reported, while going back to an
earlier one is (after `accTitle: a` and `accTitle: b`, a third `accTitle: a` is
reported), and whitespace at the ends is ignored when comparing titles.

With no text after `accTitle:`, the next line with text supplies the title, past
empty lines, comment lines, and directives.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-title: error
classDiagram
  accTitle: first
  accTitle: second
  class A
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-title: error
classDiagram
  accTitle: x
  accDescr: y
```

```mmd
%% eslint @mmd-toolkit/class-no-duplicate-title: error
classDiagram
  accTitle: first
  accTitle: first
```

## Options

This rule has no options.

## Related Rules

- [class-no-duplicate-description](./class-no-duplicate-description.md)
- [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)
- [sequence-no-duplicate-title](./sequence-no-duplicate-title.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-duplicate-title.ts)
- [Tests source](../../tests/rules/class-no-duplicate-title.test.ts)

<!-- end auto-generated rule resources -->
