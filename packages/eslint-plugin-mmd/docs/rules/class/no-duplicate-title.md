# mmd/class/no-duplicate-title

Japanese version: [no-duplicate-title.ja.md](./no-duplicate-title.ja.md)

Disallow an `accTitle` statement that sets the title again.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A diagram has one accessible title. mermaid.js accepts every `accTitle`
statement, and each one silently replaces the title set before it. A second
title is usually left over from rewriting the text or from pasting a part twice,
and the formatted text does not show which one counts.

## Rule Details

This rule reports every `accTitle` statement after the first one. It applies to
`classDiagram`.

After `accTitle: first` and `accTitle: second`, the title is `second`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/class/no-duplicate-title: error
classDiagram
  accTitle: first
  accTitle: second
  class A
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/class/no-duplicate-title: error
classDiagram
  accTitle: x
  accDescr: y
```

## Options

This rule has no options.

## Related Rules

- [no-duplicate-description](./no-duplicate-description.md)
- [flowchart/no-duplicate-title](../flowchart/no-duplicate-title.md)
- [sequence/no-duplicate-title](../sequence/no-duplicate-title.md)
