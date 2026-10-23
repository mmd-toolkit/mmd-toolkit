# @mmd-toolkit/class-no-ignored-text

Japanese version: [class-no-ignored-text.ja.md](./class-no-ignored-text.ja.md)

Disallow text that mermaid.js drops.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When the line also
holds other text, mermaid.js reads the whole line as the direction statement and
drops the rest without an error.

## Rule Details

This rule reports the text that stands on a direction line before `direction` or
after the direction value, and the parts of a method line that mermaid.js drops.
It applies to `classDiagram`.

`class A direction LR` sets the direction `LR` and declares no class.
`direction TBX` sets the direction `TB`, and the `X` is dropped.

A line becomes a direction statement also when it is not meant as one. When
`direction` and a direction value stand on it, as in
`A --> B : set direction LR now` or `note "x direction TB"`, the line is a
direction statement, and the relation or the note is not there. The rule reports
that too.

Text after the direction that starts with `%%`, as in
`direction LR %% vertical`, is not reported. The author means it as a comment,
and mermaid.js drops it, as the author intended.

A method line with a line separator (U+2028 or U+2029) in it is read in one part
only, and the rule reports the other parts. Such a line is not shown as a code
block below.

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
