# @mmd-toolkit/flowchart-no-ignored-text

Japanese version:
[flowchart-no-ignored-text.ja.md](./flowchart-no-ignored-text.ja.md)

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

Two kinds of text after the direction value are not reported:

- Text of only `;` and whitespace, as in `direction TB;`. A `;` only ends the
  statement.
- Text in which only `;` and whitespace come before `%%`, as in
  `direction TB %% vertical` and `direction TB; %% vertical`. The author means
  the text from the `%%` to the end of the line as a comment.

mermaid.js drops both, but neither holds anything that the author meant to be
read as a statement. Other text before the `%%` is reported: in
`direction TB; x %% c`, the `x`, meant as a statement, is dropped.

When a `;` separates every reported text on the line from the direction, as in
`A-->B; direction TB`, the rule suggests splitting the line there: the
whitespace after each such `;` becomes a line break and the indentation of the
line, and the `;` stays, as if the author had broken the line after it. The line
break is of the kind that the text uses there: the one that ends the line, or,
on a last line without one, the one that ends the line before it. Where a kept
`;` would then not end the statement before it, the rule removes all the `;`s on
the line with the whitespace instead: after `accTitle: What to buy`, whose text
runs to the end of the line, the `;` would be part of the text; after the
direction value, the rest of the line is dropped; and after a description block,
as in `accDescr { x }; direction TB`, a `;` alone is a statement of its own,
which inside a subgraph makes a member `;`. mermaid.js then reads that text as
statements, and the direction as a direction statement. The rule suggests it
only when the result is read so, the split text as statements and the direction
as a direction statement, and the rule reports no text on the line any more.
Otherwise the rule suggests nothing: without a `;`, it is not clear that the
text was meant as statements, and inside a label, as in
`A[Set direction LR]-->B`, a line break would change the label. Once split, the
text is read as statements, and other rules may report what it holds, such as a
second `accTitle`.

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
