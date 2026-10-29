# @mmd-toolkit/state-no-undef

Japanese version: [state-no-undef.ja.md](./state-no-undef.ja.md)

Disallow a `style`, `class`, `click`, or `note` statement that names no state.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `class`, `click`, and notes name a state. An unknown name gives no
error: styles and classes do nothing, clicks make no state a link, and a note
creates a new state that no other statement writes.

## Rule Details

This rule applies to state diagrams (`stateDiagram` and `stateDiagram-v2`). It
reports an unknown state name in a `style`, `class`, `click`, or `note`
statement, checking each name in a list. States defined by a state written
alone, a transition, a state body, an alias, a fork, a join, or a choice count
as defined anywhere in the diagram, including composite states.

Only the first note naming a state that no other statement defines is reported:
mermaid.js creates that state, and later notes point at it. That state also
counts as defined for `style`, `class`, and `click`, wherever they stand.

Statements before the states they name are not reported and apply to them.
Inside composite states, `style` and `class` have no effect, but this rule
checks only whether the name is defined.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  style Z fill:#f00
```

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  note left of Z : x
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/state-no-undef: error
stateDiagram-v2
  A --> B
  style A fill:#f00
  note left of B : x
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-undef](./flowchart-no-undef.md)
- [class-no-undef](./class-no-undef.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/state-no-undef.ts)
- [Tests source](../../tests/rules/state-no-undef.test.ts)

<!-- end auto-generated rule resources -->
