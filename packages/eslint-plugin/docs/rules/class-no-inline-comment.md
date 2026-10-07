# @mmd-toolkit/class-no-inline-comment

Japanese version:
[class-no-inline-comment.ja.md](./class-no-inline-comment.ja.md)

Disallow a comment after other text on its line.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

The documentation of mermaid.js says that comments go on a line of their own.
Written after a statement, a comment is a comment for the parser of mmd-toolkit,
but mermaid.js reads the line break after it as part of the comment, so the next
line continues the statement, or the text is rejected.

## Rule Details

This rule reports a comment that follows other text on its line, when more text
follows it. It applies to `classDiagram`.

After `Animal <|-- Duck %% ducks` and a line `Animal : +int age`, mermaid.js has
one relation, from `Animal` to a class `DuckAnimal`, with the label `+int age`,
and no member of `Animal`. When the next line cannot continue the statement, as
`class Fish` cannot, mermaid.js rejects the text; so it does with a comment on
the header line, as in `classDiagram %% c`. The rule reports these comments too,
because the parser of mmd-toolkit accepts the text and its formatter formats it,
while mermaid.js cannot draw it. This is the known divergence
[`comment-takes-line-break`](../../../spec/docs/known-divergences/comment-takes-line-break.md)
of the specification.

A comment on the last line of the text is not reported: mermaid.js reads it as
the author meant.

In one case mermaid.js keeps the next line apart: when a line of only whitespace
follows the comment, and no comment line comes after that line. mermaid.js
removes a comment line together with the lines of only whitespace before it
([`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)),
so a comment line there undoes it. The rule reports the comment in this case
too: whether the next line is read apart then hangs on whitespace that cannot be
seen. Such a line is not shown as a code block below, because whitespace at the
end of a line does not survive there.

Examples of **incorrect** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  Animal <|-- Duck %% ducks
  Animal : +int age
```

Examples of **correct** code for this rule:

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  %% Animals
  class Animal
  Animal <|-- Duck
```

```mmd
%% eslint @mmd-toolkit/class-no-inline-comment: error
classDiagram
  class Animal
  Animal <|-- Duck %% ducks
```

## Options

This rule has no options.
