# @mmd-toolkit/state-no-ignored-text

Japanese version: [state-no-ignored-text.ja.md](./state-no-ignored-text.ja.md)

Disallow text that mermaid.js drops.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When the line also
holds other text, mermaid.js reads the whole line as the direction statement and
drops the rest without an error. A few other places of a state diagram drop text
in the same way.

## Rule Details

This rule reports text that mermaid.js drops. It applies to `stateDiagram`.

`A --> B direction LR` sets the direction `LR` and makes no transition and no
state. `direction TBX` sets the direction `TB`, and the `X` is dropped. A line
becomes a direction statement also when it is not meant as one: in
`B : x direction LR`, there is no state `B` and no description.

Text after the direction that starts with `%%`, as in `direction LR %% c`, is
not reported. The author means it as a comment, and mermaid.js drops it, as the
author intended.

The rule also reports the other text that mermaid.js drops:

- The text from the second `:` of an alias definition: `state "d" as A : x : y`
  gives A the second description `x` with a space on each side, and `: y` is
  dropped.
- A `%%` before the `{` of a body: in `state "d" as %% c {`, the alias has no
  id, and its body holds states of no composite state.
- The character right after the `:` of a note written on one line:
  `note left of A:hi` gives the note the text `i`. The
  [documentation of mermaid.js](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/stateDiagram.md#L263)
  writes such a note with a space after the `:`, as
  `note left of State2 : This is the note to the left.`; written so, as
  `note left of A : hi`, nothing is dropped.
- Empty strings that mermaid.js skips, as the `""` of `state x ""`, and empty
  description blocks and a second `state` before the `{` of a body on a later
  line.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  A --> B direction LR
```

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  direction TBX
  A --> B
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  direction LR
  A --> B
```

```mmd
%% eslint @mmd-toolkit/state-no-ignored-text: error
stateDiagram-v2
  direction LR %% c
  A --> B
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)
- [class-no-ignored-text](./class-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-ignored-text.ts)
- [Tests source](../../tests/rules/state-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
