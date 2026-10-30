# @mmd-toolkit/agentflow-no-ignored-text

Japanese version:
[agentflow-no-ignored-text.ja.md](./agentflow-no-ignored-text.ja.md)

Disallow text that mermaid.js drops from a direction line.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A line containing `direction` and a direction value is read as one direction
statement. mermaid.js drops the rest of the line without an error, including any
statements written there.

## Rule Details

This rule applies to agentflow diagrams (`agentflow-beta`). It reports text
before `direction` or after its direction value on the same line. This includes
statements separated by `;` and a line that contains the direction inside a
label, such as `A[Set direction LR]-->B`.

Text containing only `;` and whitespace is not reported. Nor is text after the
direction value where only `;` and whitespace precede `%%`, because the author
means it as a comment. Other text before `%%`, such as `x` in
`direction TB; x %% c`, is reported.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    A --> B; direction LR
  end
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/agentflow-no-ignored-text: error
agentflow-beta TB
  flow F
    direction LR
    A --> B
  end
```

## Options

This rule has no options.

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/agentflow-no-ignored-text.ts)
- [Tests source](../../tests/rules/agentflow-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
