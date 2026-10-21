# @mmd-toolkit/requirement-no-ignored-text

Japanese version:
[requirement-no-ignored-text.ja.md](./requirement-no-ignored-text.ja.md)

Disallow text that mermaid.js drops.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When the line also
holds other text, mermaid.js reads the whole line as the direction statement and
drops the rest without an error.

## Rule Details

This rule reports text that mermaid.js drops on a direction line. It applies to
`requirement`.

`r - satisfies -> e direction LR` sets the direction `LR` and makes no
relationship. `direction LR x` sets the direction `LR`, and the `x` is dropped,
and `foo direction LR bar` drops both words. A word glued to `direction`, as in
`mydirection RL`, is dropped too. An empty description block after the
direction, as in `direction LR accDescr {}`, is dropped with the rest of the
line.

Text after the direction that starts with a comment mark of a requirement
diagram, `%%`, `%`, or `#`, as in `direction LR %% c` and `direction LR # c`, is
not reported. The author means it as a comment, and mermaid.js drops it, as the
author intended. A direction line that is commented out with `#` or `%`, as
`# direction LR`, still sets the direction, and the rule reports the mark before
it; a comment line, as `%% direction LR`, sets nothing.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  direction LR x
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  requirement r {
    id: 1
  }
  element e {
    type: simulation
  }
  r - satisfies -> e direction LR
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  direction LR
  requirement r {
    id: 1
  }
```

```mmd
%% eslint @mmd-toolkit/requirement-no-ignored-text: error
requirementDiagram
  direction LR %% c
  requirement r {
    id: 1
  }
```

## Options

This rule has no options.

## Related Rules

- [er-no-ignored-text](./er-no-ignored-text.md)
- [requirement-no-empty-description-block](./requirement-no-empty-description-block.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/requirement-no-ignored-text.ts)
- [Tests source](../../tests/rules/requirement-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
