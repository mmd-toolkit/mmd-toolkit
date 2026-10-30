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

This rule applies to requirement diagrams (`requirementDiagram`). It reports
text on a direction line before `direction` or after its value, including words
joined to `direction` and empty description blocks after the value. Text after
the value that starts with `%%`, `%`, or `#` is not reported: the author means
it as a comment, and mermaid.js drops it as meant.

A direction line prefixed with `#` or `%`, as in `# direction LR`, still sets
the direction, and the prefix is reported. A comment line starting with `%%`, as
in `%% direction LR`, sets no direction and is not reported.

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
