# mmd/flowchart/no-ignored-text

Japanese version: [no-ignored-text.ja.md](./no-ignored-text.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-ignored-text](../../rules/flowchart/no-ignored-text.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A `FlowchartDirectionStatement` whose `textBefore` is not null, or whose
`textAfter` is not null and has a `value` that does not start with `%%`. Each of
the two is a `FlowchartIgnoredText` node with the range of the text. Looking at
the start of the value is a reading of the value, not a second lexing of the
text. Text after the direction value that starts with `%%` is no comment of
`Root.comments`: it is the `textAfter`.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `flowchart/lex-direction-line-after-semicolon`
- `flowchart/lex-direction-line-swallows-edge`
- `flowchart/lex-direction-line-then-semicolon-statement`
- `flowchart/lex-direction-line-own-line-after-link`
- `flowchart/lex-direction-line-percent-after-value`
- `flowchart/lex-direction-line-text-after-value`
- `flowchart/lex-direction-line-in-label-with-link`
