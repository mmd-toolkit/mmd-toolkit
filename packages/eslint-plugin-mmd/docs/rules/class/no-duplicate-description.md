# mmd/class/no-duplicate-description

Japanese version:
[no-duplicate-description.ja.md](./no-duplicate-description.ja.md)

Disallow an `accDescr` statement that sets the description again.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A diagram has one description. mermaid.js accepts every `accDescr` statement,
and each one silently replaces the description set before it. A second
description is usually left over from rewriting the text or from pasting a part
twice.

## Rule Details

This rule reports every statement that sets the description after the first one.
It applies to `classDiagram`.

`accDescr:` and a description block with text both set the description, and a
line and a block replace each other in either order: after `accDescr: first` and
`accDescr: second`, the description is `second`, and so it is after a block with
`first` followed by `accDescr: second`.

Examples of **incorrect** code for this rule:

```mmd
%% eslint mmd/class/no-duplicate-description: error
classDiagram
  accDescr: first
  accDescr: second
  class A
```

```mmd
%% eslint mmd/class/no-duplicate-description: error
classDiagram
  accDescr {
first
  }
  accDescr: second
  class A
```

Examples of **correct** code for this rule:

```mmd
%% eslint mmd/class/no-duplicate-description: error
classDiagram
  accTitle: x
  accDescr: y
```

## Options

This rule has no options.

## Related Rules

- [no-duplicate-title](./no-duplicate-title.md)
- [flowchart/no-duplicate-description](../flowchart/no-duplicate-description.md)
- [sequence/no-duplicate-description](../sequence/no-duplicate-description.md)
