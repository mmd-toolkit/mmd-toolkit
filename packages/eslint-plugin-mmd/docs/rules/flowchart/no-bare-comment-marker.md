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

## Implementation Notes

The rule is not implemented yet. These notes are for implementing it.

### How the tree shows it

The rule reports either of these, on a line on which `Root.comments` has no
comment:

- An `Identifier` token whose `value` is `%%`, on a line that holds no other
  token. Flowchart reads it as the id of a vertex.
- In a token of a `FlowchartLabel` (a `RawText` token, or a `String` token for a
  label that is a string), a line of the token's `value` that lies between two
  line terminators and is `%%` once the whitespace at its ends is left out.
  Reading the lines of the value of a token is a reading of the value, not a
  second lexing of the text.

With whitespace after it, the `%%` is a comment, which the rule does not report,
also inside a label: the condition on comments leaves it out. A directive on the
line, as in `%%%%{init: {}}%%`, is not a token and does not change this.

### Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `common/comment-bare`
- `common/comment-bare-with-space`
- `flowchart/comment-percent-before-directive`
- `common/comment-bare-line-in-label`
- `common/comment-bare-line-in-string-label`
- `common/comment-percent-space-line-in-label`
- `common/comment-bare-between-comment-lines`
- `common/comment-bare-between-comment-lines-empty`
- `common/comment-bare-between-comment-lines-space`
