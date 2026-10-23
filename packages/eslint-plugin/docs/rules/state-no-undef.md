# @mmd-toolkit/state-no-undef

Japanese version: [state-no-undef.ja.md](./state-no-undef.ja.md)

Disallow a `style`, `class`, `click`, or `note` statement that names no state.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

`style`, `class`, `click`, and a note name a state. When the name is that of no
state of the diagram, as when it is misspelled, mermaid.js gives no error:
`style` and `class` change nothing, `click` makes no state a link, and a note
makes a new state of that name, which no other statement writes.

## Rule Details

This rule reports a state name in such a statement that is the id of no state of
the diagram. It applies to `stateDiagram`.

The states of a diagram are those that a state written alone, a transition, a
`state` statement with a body, an alias, or a fork, join, or choice defines,
anywhere in the diagram and in any composite state. After `A --> B`,
`style Z fill:#f00` and `class Z c` change nothing, and `click Z href "…"` makes
no state a link. `note left of Z : x` makes a new state `Z` with the note, and
the rule reports the note when no other statement defines `Z`. When several
notes name such a state, only the first one is reported: mermaid.js makes the
state once, and the later notes point at it. The state that a note makes is a
state for `style`, `class`, and `click`, which apply to it wherever they stand:
after `note left of Z : x`, `style Z fill:#f00` styles `Z`, and only the note is
reported. Each name of a list is checked: `style A,Z fill:#f00` styles `A`, and
`Z` is reported.

A statement before the state that it names applies to it: `style A fill:#f00`
before `A --> B` styles `A`, and so for `class` and `click`. Inside a composite
state, `style` and `class` change nothing, whatever they name; the rule checks
the name only.

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
