# mmd/class/no-inline-comment

Japanese version: [no-inline-comment.ja.md](./no-inline-comment.ja.md)

Notes for implementing the rule
[mmd/class/no-inline-comment](../../rules/class/no-inline-comment.md).

The rule is not implemented yet. These notes are for implementing it.

## How the tree shows it

A comment of `Root.comments` with a token before it on the same line (the header
keyword included) and a token after it in the text. Whether a token lies on the
same line is read from the `loc` of the token and the comment.

The condition has no exception for a line of only whitespace after the comment,
which keeps the next line apart in mermaid.js only when no comment line follows
it (see the rule document). Following that would mean repeating the steps with
which mermaid.js removes comment lines and reads line breaks, and reading the
source text between the comment and the next token.

## Fixtures

The behavior of mermaid.js that the rule relies on is recorded in these fixtures
of `@mmd-toolkit/tests`:

- `class/div-comment-joins-member`
- `class/div-comment-joins-lines`
- `class/div-comment-then-statement`
- `class/div-comment-on-header-line`
- `class/lex-comment-on-last-line`
- `class/lex-comment-blank-line-after`
- `class/lex-comment-own-line`
- `class/div-comment-then-comment-only-line`
- `class/div-comment-then-spaces-line-then-comment-line`
- `class/lex-comment-then-spaces-line-then-bare-comment`
- `class/lex-comment-line-then-spaces-line`
