# @mmd-toolkit/sequence-no-ignored-text

Japanese version:
[sequence-no-ignored-text.ja.md](./sequence-no-ignored-text.ja.md)

Disallow a line that mermaid.js reads as nothing.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A line that holds only a character such as `)` or `/` is no statement.
mermaid.js accepts it and drops it without an error, so what the author wrote on
it has no effect.

## Rule Details

This rule reports a line that mermaid.js ignores. It applies to `sequence`.

Such a line comes about when the end of a message is written on the next line. A
message cannot continue on the next line: `A ->> B: call(x`, a line break, and
`)` give the message `call(x`, and the `)` is dropped.

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
