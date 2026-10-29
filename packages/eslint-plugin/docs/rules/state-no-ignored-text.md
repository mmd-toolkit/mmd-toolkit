# @mmd-toolkit/state-no-ignored-text

Japanese version: [state-no-ignored-text.ja.md](./state-no-ignored-text.ja.md)

Disallow text that mermaid.js drops.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When other text shares
the line, mermaid.js reads the whole line as the direction statement and drops
the rest without an error. State diagrams also have other places where text is
dropped.

## Rule Details

This rule applies to state diagrams (`stateDiagram` and `stateDiagram-v2`). It
reports text before `direction` or after its direction value on the same line,
including `direction` written in a state's description, as in
`B : x direction LR`. Text after the direction that starts with `%%` is not
reported, because it is written as a comment and mermaid.js drops it as
intended.

It also reports:

- Text from the second `:` of an alias definition, such as `: y` in
  `state "d" as A : x : y`.
- `%%` before a body's `{`, as in `state "d" as %% c {`, where the alias has no
  id.
- The character immediately after `:` in a one-line note, such as `h` in
  `note left of A:hi`. Write a space after `:` to keep the whole note text.
- Empty strings mermaid.js skips, such as `""` in `state x ""`, and empty
  description blocks or a second `state` before a body's `{` on a later line.

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

## Further Reading

- [State diagram notes](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/stateDiagram.md#L263)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-ignored-text.ts)
- [Tests source](../../tests/rules/state-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
