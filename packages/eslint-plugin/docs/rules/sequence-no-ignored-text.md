# @mmd-toolkit/sequence-no-ignored-text

Japanese version:
[sequence-no-ignored-text.ja.md](./sequence-no-ignored-text.ja.md)

Disallow a line that mermaid.js reads as nothing.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

🔧 This rule is automatically fixable by the
[`--fix` CLI option](https://eslint.org/docs/latest/use/command-line-interface#--fix).

<!-- end auto-generated rule notice -->

Characters such as `)` or `/` can stand where a statement starts without
starting one. mermaid.js accepts and drops them without an error, so what the
author wrote has no effect. This often happens when the end of a message is
written on the next line.

## Rule Details

This rule applies to sequence diagrams (`sequenceDiagram`). It reports each
character that mermaid.js drops in this way, whether alone on a line, before a
statement on the same line, or after a block's `end` on that line. The line
`) )` gives two reports.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-ignored-text: error
sequenceDiagram
  A ->> B: call(x
  )
  B -->> A: done
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/sequence-no-ignored-text: error
sequenceDiagram
  A ->> B: call(x)
  B -->> A: done
```

## Options

This rule has no options.

## Related Rules

- [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)

<!-- begin auto-generated rule resources -->

## Resources

- [Rule source](../../src/rules/sequence-no-ignored-text.ts)
- [Tests source](../../tests/rules/sequence-no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
