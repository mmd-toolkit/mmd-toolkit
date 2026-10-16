# blank-line-after-header-or-comments

Japanese version:
[blank-line-after-header-or-comments.ja.md](./blank-line-after-header-or-comments.ja.md)

Diagram types: mindmap, kanban. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

In a mindmap, empty lines, lines of whitespace only, comment lines, and diagram
comments change nothing wherever they stand after the header (see
[Blank lines](../diagrams/mindmap.md#blank-lines)). A **blank line** below is a
line that is empty or holds whitespace only once its directives are left out,
such as an empty line, a line of spaces or tabs, and a line that holds only a
directive. A **diagram comment** is a comment that the lexer of the diagram
reads (see [Comments](../diagrams/mindmap.md#comments)): a line `%%` alone, a
line `%%{ }%%`, which is no directive, and `%%` with the rest of its line
segment after the header, after a shape, or after an icon. A comment line, with
text after its `%%`, is removed with its line feed before the lexer reads the
text, and is no diagram comment.

A **statement** below is a node line, an icon line, or a class line. Between the
header, or a statement, and the next statement there may stand diagram comments,
blank lines, and comment lines. Count the diagram comments there, including one
on the line of the header or of the statement before. mermaid.js rejects the
input in these cases, and this specification accepts it:

1. After the header, before the first node, when the count is even, zero
   included, and a blank line follows the last of the comments, or, with no
   comment, the header line ends with whitespace or a blank line follows it.
2. After the header, when the count is odd and the first node follows the last
   comment on its line, after a U+2028 or a U+2029 that ends the comment.
3. Between two statements, when the count is odd and a blank line follows the
   last of the comments, before the next statement.
4. Between two statements, when the count is even and not zero, and the next
   statement follows the last comment on its line, after a U+2028 or a U+2029.

A U+2028 or a U+2029 that ends a diagram comment ends its line, so whitespace
after it up to the line feed is a blank line. Blank lines before a comment are
no part of the count and change nothing. Everywhere else, both read blank lines
and comments as nothing: blank lines between two statements without comments, an
odd count after the header followed by a blank line, an even count between two
statements followed by a blank line, and blank lines at the end of the text.

Kanban uses the same blank-line rule and the four cases above. Node, icon, and
class lines are statements. Data suffixes belong to their node lines. Header
whitespace or blank lines before the first node are accepted. [fixture:
kanban/gram-grid-comment-line-header-line] [fixture:
kanban/gram-grid-directive-line-header-line] [fixture:
kanban/gram-grid-lf-header-line] [fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/header-bom-trailing] [fixture: kanban/header-crlf-trailing]
[fixture: kanban/header-ff-trailing] [fixture:
kanban/header-ideographic-trailing] [fixture: kanban/header-ls-trailing]
[fixture: kanban/header-nbsp-trailing] [fixture: kanban/header-ps-trailing]
[fixture: kanban/header-tab-trailing] [fixture: kanban/header-vt-trailing]
[fixture: kanban/lex-bom-whitespace-first] [fixture:
kanban/lex-cr-whitespace-first] [fixture: kanban/lex-crlf-whitespace-first]
[fixture: kanban/lex-ideographic-whitespace-first] [fixture:
kanban/lex-ls-whitespace-first] [fixture: kanban/lex-nbsp-whitespace-first]
[fixture: kanban/lex-ps-whitespace-first] [fixture:
kanban/lex-tab-whitespace-first] [fixture: kanban/div-header-space-node]
Comments followed by blank lines before nodes or decorations are accepted.
[fixture: kanban/div-header-comments-blank] [fixture:
kanban/div-between-comment-blank] [fixture:
kanban/div-comment-blank-before-icon] [fixture:
kanban/div-comment-blank-before-class] Comments ending at U+2028 or U+2029
before the next statement are accepted. mermaid.js rejects these inputs (see
[Blank lines](../diagrams/kanban.md#blank-lines)). [fixture:
kanban/div-header-comment-ls-node] [fixture: kanban/div-header-comment-ps-node]
[fixture: kanban/div-between-real-comments-ls-node] [fixture:
kanban/div-between-real-comments-ps-node]

In kanban, one diagram comment after the header is accepted by both. [fixture:
kanban/header-header-comment-blank] Two diagram comments between nodes are
accepted by both. [fixture: kanban/gram-between-comments-blank] A blank line
before an icon is accepted by both. [fixture: kanban/gram-blank-before-icon]
Blank lines at the end are accepted by both. [fixture:
kanban/gram-shallower-then-empty]

## The difference

Each example is a whole diagram; a line of spaces cannot be shown in a code
block here, since the formatter removes trailing whitespace, so such inputs are
described in words.

1. An empty line between the header and the first node:

   ```mmd
   mindmap

     root
   ```

2. Two bare `%%` lines and an empty line after the header:

   ```mmd
   mindmap
   %%
   %%

   root
   ```

3. A bare `%%` line and an empty line between two nodes:

   ```mmd
   mindmap
     root
       a
   %%

       b
   ```

4. A comment after a shape and an empty line before the next node:

   ```mmd
   mindmap
     root
       a[x] %% c

       b
   ```

5. The header followed by two spaces, a line break, and a line `root`.

| Example | mermaid.js | This specification                 |
| ------- | ---------- | ---------------------------------- |
| 1       | rejected   | the root                           |
| 2       | rejected   | the root                           |
| 3       | rejected   | the root with the children a and b |
| 4       | rejected   | the root with the children a and b |
| 5       | rejected   | the root                           |

[fixture: mindmap/db-blank-line-after-header] [fixture:
mindmap/div-header-two-comments-then-blank] [fixture:
mindmap/div-comment-then-blank-between-nodes] [fixture:
mindmap/div-shape-comment-then-blank] [fixture:
mindmap/div-header-trailing-spaces-then-node]

The cases of the list above, with the inputs that both read the same next to
them:

- Case 1: a line of whitespace, a tab line, a directive line, a space and a
  directive at the end of the header line, two diagram comments on the header
  line and the next line, and a comment line, which is removed with its line
  feed, before an empty line; while one or three comments and an empty line, an
  empty line before a comment, and a comment line alone are accepted by both.
  [fixture: mindmap/db-whitespace-line-after-header] [fixture:
  mindmap/div-tab-line-after-header] [fixture:
  mindmap/db-directive-between-header-and-first-node] [fixture:
  mindmap/div-header-space-directive-then-node] [fixture:
  mindmap/div-header-line-comment-comment-then-blank] [fixture:
  mindmap/div-comment-line-then-blank-after-header] [fixture:
  mindmap/gram-header-comment-then-blank] [fixture:
  mindmap/gram-header-three-comments-then-blank] [fixture:
  mindmap/gram-header-line-comment-then-blank] [fixture:
  mindmap/gram-header-blank-then-comment] [fixture:
  mindmap/db-comment-line-after-header]
- Case 2: `mindmap %% c`, a U+2028, and `root`; while two comments before such a
  node are accepted by both. [fixture:
  mindmap/div-header-comment-line-separator-node] [fixture:
  mindmap/gram-header-two-comments-line-separator-node]
- Case 3: three comments, a comment after an icon, a line `%%{ }%%`, a comment
  after a class line, and a comment followed by a U+2028 and a line feed, before
  a blank line; and a blank line before an icon or a class line after a comment;
  while two comments, a comment line, and a blank line between two comments are
  accepted by both. [fixture:
  mindmap/div-three-comments-then-blank-between-nodes] [fixture:
  mindmap/div-icon-comment-then-blank] [fixture:
  mindmap/div-percent-brace-then-blank-between-nodes] [fixture:
  mindmap/div-class-then-comment-then-blank] [fixture:
  mindmap/div-shape-comment-line-separator-then-blank] [fixture:
  mindmap/div-comment-then-blank-then-icon] [fixture:
  mindmap/div-comment-then-blank-then-class] [fixture:
  mindmap/gram-two-comments-then-blank-between-nodes] [fixture:
  mindmap/gram-shape-comment-comment-then-blank] [fixture:
  mindmap/gram-comment-line-then-blank-between-nodes] [fixture:
  mindmap/gram-comment-blank-comment-blank-between-nodes] [fixture:
  mindmap/db-blank-line-between-nodes] [fixture:
  mindmap/gram-blank-then-comment-between-nodes] [fixture:
  mindmap/gram-comment-then-blank-at-end] [fixture:
  mindmap/gram-blank-then-icon]
- Case 4: a comment after a shape, a line `%%{ }%%`, a U+2028, and the next
  node; while one comment before such a node is accepted by both. [fixture:
  mindmap/div-two-comments-line-separator-between-nodes] [fixture:
  mindmap/lex-comment-ends-at-line-separator]

The difference goes one way: this specification accepts inputs that mermaid.js
rejects, and it never rejects one that mermaid.js accepts here.

## What it means for an author

To write a mindmap that both read the same, put no empty line and no line of
whitespace between the header and the first node, leave no whitespace at the end
of the header line, and do not follow a line `%%` alone with an empty line.
Comments with text after `%%` may stand anywhere.

## Why mermaid.js reads it so

The lexer of
[`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L21-L30)
reads `\s*%%.*`, a comment with the whitespace and the line feeds before it, as
one token, and `[\s]+[\n]`, a run of whitespace up to its last line feed, as the
same token, `SPACELINE`. Its grammar
([`mindmap.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/mindmap/parser/mindmap.jison#L82-L108))
takes a `SPACELINE` as a statement of its own or as the end of the statement
before it, and an end may be followed by line feeds only. So the tokens after a
statement pair up as an end and a statement in turn, and a `SPACELINE` that is
left as a statement needs an end before the next node, which a node on the next
line does not give. The header is followed by a statement, so there the pairing
starts the other way round.

The kanban lexical rules and grammar pair whitespace and statements in the same
way
([`kanban.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/parser/kanban.jison#L48-L138)).
The pairing changes nothing held by the tree. The same direct rule applies.
[fixture: kanban/gram-grid-comment-line-header-line] [fixture:
kanban/gram-grid-directive-line-header-line] [fixture:
kanban/gram-grid-lf-header-line] [fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/header-bom-trailing] [fixture: kanban/header-crlf-trailing]
[fixture: kanban/header-ff-trailing] [fixture:
kanban/header-ideographic-trailing] [fixture: kanban/header-ls-trailing]
[fixture: kanban/header-nbsp-trailing] [fixture: kanban/header-ps-trailing]
[fixture: kanban/header-tab-trailing] [fixture: kanban/header-vt-trailing]
[fixture: kanban/lex-bom-whitespace-first] [fixture:
kanban/lex-cr-whitespace-first] [fixture: kanban/lex-crlf-whitespace-first]
[fixture: kanban/lex-ideographic-whitespace-first] [fixture:
kanban/lex-ls-whitespace-first] [fixture: kanban/lex-nbsp-whitespace-first]
[fixture: kanban/lex-ps-whitespace-first] [fixture:
kanban/lex-tab-whitespace-first] [fixture: kanban/div-header-space-node]
[fixture: kanban/div-header-comments-blank] [fixture:
kanban/div-between-comment-blank] [fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node] [fixture:
kanban/div-comment-blank-before-icon] [fixture:
kanban/div-comment-blank-before-class] [fixture:
kanban/div-between-real-comments-ls-node] [fixture:
kanban/div-between-real-comments-ps-node]

## The rule of this specification, and why

A blank line and a comment hold nothing that the tree keeps: the tree is the
same with them or without them. Whether mermaid.js accepts one depends on how
its lexer cuts the whitespace into tokens and how its grammar pairs them, that
is, on the order of the steps of its lexer, which is nothing a specification
would state: the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)). One rule is stated instead,
that blank lines and comments change nothing, and the inputs that mermaid.js
rejects for this reason are the divergence. An accepted input has the Db of the
same input changed in these ways, which mermaid.js accepts and which keep the
indentation of every node: its blank lines are removed, the directives on them
kept; the whitespace at the end of the header line is removed; and a U+2028 or a
U+2029 that ends a diagram comment is removed with the whitespace after it when
only whitespace follows it up to the line feed, and gets a line feed before it
when a statement follows it on its line. [fixture:
mindmap/db-directive-between-header-and-first-node] [fixture:
mindmap/div-header-trailing-spaces-then-node] [fixture:
mindmap/div-shape-comment-line-separator-then-blank] [fixture:
mindmap/div-two-comments-line-separator-between-nodes]

## The documentation of mermaid.js and its issues

- The
  [mindmap syntax](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/mindmap.md)
  says nothing of empty lines or comments between the lines of a mindmap.
- No issue or pull request about it was found (searched on 2026-10-15 for
  `mindmap empty line`, `mindmap blank line`, `mindmap comment`,
  `mindmap newline`, `mindmap parse`, and `mindmap error`).
