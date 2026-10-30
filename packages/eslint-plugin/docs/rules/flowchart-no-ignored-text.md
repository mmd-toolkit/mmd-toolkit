# @mmd-toolkit/flowchart-no-ignored-text

Japanese version:
[flowchart-no-ignored-text.ja.md](./flowchart-no-ignored-text.ja.md)

Disallow text on a direction line that mermaid.js drops.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When other text shares
the line, mermaid.js reads the whole line as the direction statement and drops
the rest without an error.

## Rule Details

This rule applies to flowcharts (`flowchart`, `graph`, `flowchart-elk`, and
`swimlane-beta`). It reports text before `direction` or after its direction
value on the same line. This includes statements separated by `;` and a line
that contains the direction inside a label, such as `A[Set direction LR]-->B`.

Text after the direction value containing only `;` and whitespace is not
reported. Nor is text where only `;` and whitespace precede `%%`, because the
author means it as a comment. Other text before `%%`, such as `x` in
`direction TB; x %% c`, is reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    A-->B; direction TB
  end
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  A-->B direction TB
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    direction TB; A-->B
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    A --> B
    direction TB
  end
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-ignored-text: error
flowchart LR
  subgraph S
    direction TB %% vertical
    A --> B
  end
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/flowchart-no-ignored-text.ts)
- [Tests source](../../tests/rules/flowchart-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
