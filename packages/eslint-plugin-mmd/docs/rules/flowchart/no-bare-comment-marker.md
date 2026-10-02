# mmd/flowchart/no-bare-comment-marker

Japanese version: [no-bare-comment-marker.ja.md](./no-bare-comment-marker.ja.md)

Disallow a line that holds only `%%`.

<!-- begin auto-generated rule notice -->

The `recommended` configuration does not enable this rule.

<!-- end auto-generated rule notice -->

A comment is `%%` followed by at least one character on the line. A line with
`%%` alone is not a comment. Such a line comes about when several lines are
commented out together and one of them is empty, and when the whitespace at the
end of `%% `, which is a comment, is removed.

## Rule Details

This rule reports a line that holds only `%%`. It applies to `flowchart-v2`,
`flowchart-elk`, and `swimlane`.

Flowchart reads the `%%` of such a line as a vertex with the id `%%`, so the
diagram gets a box that the author did not write. A directive after the `%%` on
the line, as in `%%%%{init: {}}%%`, changes nothing.

The same happens inside a label that spans lines, also when the label is a
string. mermaid.js removes the other comment lines from the label, but a line
with `%%` alone stays in it: the label of `A[a`, a line break, `%%`, a line
break, and `b]` is `a`, a line break, `%%`, a line break, and `b`, and the
diagram shows a line `%%` in the box. The rule reports that line too.

A line with a space after the `%%` is a comment and is not reported. It is not
shown as a code block below, because whitespace at the end of a line does not
survive there.

mermaid.js leaves such a line in the text because the expression with which
[`cleanupComments()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)
removes comment lines needs at least one character after `%%`. As of 2026-10-02,
a pull request that changes this,
[#7008](https://github.com/mermaid-js/mermaid/pull/7008) ("fix: empty
comments"), is open and not merged, and the issue it refers to,
[#6505](https://github.com/mermaid-js/mermaid/issues/6505), is open with the
labels "Type: Bug / Error" and "Status: Triage".

Examples of **incorrect** code for this rule:

```mmd
flowchart LR
  A --> B
  %% C-->D
  %%
  %% D-->E
```

```mmd
flowchart LR
  A[a
%%
b]
```

Examples of **correct** code for this rule:

```mmd
flowchart LR
  A --> B
  %% C-->D

  %% D-->E
```

## Options

This rule has no options.
