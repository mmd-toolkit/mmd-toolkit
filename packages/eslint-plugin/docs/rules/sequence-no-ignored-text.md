# @mmd-toolkit/sequence-no-ignored-text

Japanese version:
[sequence-no-ignored-text.ja.md](./sequence-no-ignored-text.ja.md)

Disallow a line that mermaid.js reads as nothing.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

<!-- end auto-generated rule notice -->

A character such as `)` or `/` that stands where a statement starts, and starts
none, is no statement. mermaid.js accepts it and drops it without an error, so
what the author wrote has no effect. Such a character may stand on a line of its
own, before a statement on its line, as in `) A ->> B: x`, or after the `end` of
a block on its line.

## Rule Details

This rule reports each such character. It applies to `sequence`. The line `) )`
holds two such characters and gives two reports.

Such a character usually comes about when the end of a message is written on the
next line. A message cannot continue on the next line: `A ->> B: call(x`, a line
break, and `)` give the message `call(x`, and the `)` is dropped.

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
