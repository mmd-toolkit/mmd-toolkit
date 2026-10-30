# @mmd-toolkit/class-no-ignored-text

Japanese version: [class-no-ignored-text.ja.md](./class-no-ignored-text.ja.md)

Disallow text that mermaid.js drops.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When other text shares
the line, mermaid.js reads the whole line as the direction statement and drops
the rest without an error.

## Rule Details

This rule applies to class diagrams (`classDiagram` and `classDiagram-v2`). It
reports text before `direction` or after its direction value on the same line.
This includes a direction inside a relation label or note, such as
`A --> B : set direction LR now`, where the relation disappears.

Text after the direction that starts with `%%` is not reported, because it is
written as a comment and mermaid.js drops it as intended.

The rule also reports the parts dropped from a method line containing U+2028 or
U+2029: mermaid.js reads only one part of that line.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  class A direction LR
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction TBX
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  A --> B : set direction LR now
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction RL
  class A
```

```mmd
%% eslint @mmd-toolkit/class-no-ignored-text: error
classDiagram
  direction LR %% vertical
  class A
```

## Options

This rule has no options.

## Related Rules

- [class-no-bare-class-name](./class-no-bare-class-name.md)
- [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)
- [sequence-no-ignored-text](./sequence-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/class-no-ignored-text.ts)
- [Tests source](../../tests/rules/class-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
