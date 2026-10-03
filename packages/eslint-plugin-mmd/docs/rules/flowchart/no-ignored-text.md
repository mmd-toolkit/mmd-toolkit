# mmd/flowchart/no-ignored-text

Japanese version: [no-ignored-text.ja.md](./no-ignored-text.ja.md)

Disallow text on a direction line that mermaid.js does not read.

<!-- begin auto-generated rule notice -->

✅ The `recommended` configuration enables this rule.

💡 This rule is manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

<!-- end auto-generated rule notice -->

A `direction` statement is written on a line of its own. When the line also
holds other text, mermaid.js reads the whole line as the direction statement and
drops the rest without an error.

## Rule Details

This rule reports the text that stands on a direction line before `direction` or
after the direction value. It applies to `flowchart-v2`, `flowchart-elk`, and
`swimlane`.

A link written on the same line, before or after the direction, disappears, also
when a `;` separates the two. In a subgraph, `A-->B; direction TB` and
`direction TB; A-->B` give the subgraph the direction `TB` and make no vertex
and no link, while the same two statements on two lines make the link from `A`
to `B`. At the top level, `A-->B direction TB` makes no vertex and no link
either. Text after the direction, as in `direction LR trailing`, is dropped in
the same way.

A line becomes a direction statement also when it is not meant as one. When
`direction` and a direction value stand on it, as in `A[Set direction LR]-->B`,
the line is a direction statement and makes no vertex and no link. The rule
reports that too.

Text after the direction value is not reported when nothing but `;` and
whitespace stands before its first `%%`, or in all of it when it has no `%%`, as
in `direction TB %% vertical`, `direction TB; %% vertical`, and `direction TB;`.
The author means the text from the `%%` on as a comment, and a `;` only ends the
statement, so mermaid.js, which drops the text, drops nothing that the author
meant. Other text before the `%%` is reported: in `direction TB; x %% c`, the
`x` is dropped.

When a `;` separates every reported text on the line from the direction, as in
`A-->B; direction TB`, the rule suggests splitting the line there: the
whitespace after each such `;` becomes a line break and the indentation of the
line, and the `;` stays, as if the author had broken the line after it. Where
the `;` would then be no separator but part of a text, as after
`accTitle: What to buy`, whose text runs to the end of the line, or after the
direction value, where the rest of the line is dropped, the `;` is removed with
the whitespace. mermaid.js then reads that text as statements, and the direction
as a direction statement. The rule suggests it only when the text so split is
read as statements and nothing on the line is dropped any more. Otherwise the
rule suggests nothing: without a `;`, it is not clear that the text was meant as
statements, and inside a label, as in `A[Set direction LR]-->B`, a line break
would change the label. Once split, the text is read as statements, and other
rules may report what it holds, such as a second `accTitle`.

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  subgraph S
    A-->B; direction TB
  end
```

```mmd
flowchart LR
  A-->B direction TB
```

```mmd
flowchart LR
  subgraph S
    direction TB; A-->B
  end
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  subgraph S
    A --> B
    direction TB
  end
```

```mmd
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

- [Rule source](../../../src/rules/flowchart/no-ignored-text.ts)
- [Tests source](../../../tests/rules/flowchart/no-ignored-text.test.ts)

<!-- end auto-generated rule resources -->
