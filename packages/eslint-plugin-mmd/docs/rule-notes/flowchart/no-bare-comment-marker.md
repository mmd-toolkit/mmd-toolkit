# mmd/flowchart/no-bare-comment-marker

Japanese version: [no-bare-comment-marker.ja.md](./no-bare-comment-marker.ja.md)

Notes for implementing the rule
[mmd/flowchart/no-bare-comment-marker](../../rules/flowchart/no-bare-comment-marker.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

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

## Fixtures

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
