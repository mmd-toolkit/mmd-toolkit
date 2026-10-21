# Mindmap formatting rules

Japanese version: [mindmap.ja.md](./mindmap.ja.md)

How prettier-plugin-mmd formats a mindmap. Each rule below keeps what mermaid.js
reads from the diagram; where a change would alter it, the text is kept as
written, and the rule says where. Where a rule is the same as in an ER diagram
or a Gantt chart, it says so, and the reason is in their rules.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

In a mindmap the indentation of a node is its level in the Db: the Db reads the
level of a node as its indentation minus the indentation of the root, counted in
characters, so the width of the step between a node and its children is part of
the diagram (diagrams/mindmap.md, Indentation and parents). A step of 4
characters and a step of 2 give different Db, and one diagram may use steps of
different widths. So the printer keeps the width of every step as written, and
the rules below change only what is not in the Db. [fixture:
indentation/step-widths-kept] [fixture: indentation/tree-from-the-indentation]
[fixture: indentation/siblings-after-deeper-nodes]

The indentation of the root is no part of the Db. The root stands one level
deeper than the header, as the statements of every diagram type do, and each
other node stands as many characters deeper than the root as it was written, so
no level changes. The indentation written in the input is not kept beyond that.
[fixture: indentation/root-shifted-to-one-level] [fixture:
indentation/root-at-the-first-column] [fixture:
indentation/written-indentation-dropped] A level is what Prettier's `useTabs`
and `tabWidth` options say: two spaces by default. [fixture:
indentation/tab-width-4]

Every whitespace character before a node is one character of its indentation, a
tab, a U+00A0, and a U+3000 included, and only their number counts. The printer
writes the character of the options, a space, or a tab with `useTabs`, and keeps
the number of characters: with `useTabs`, a step of n characters is n tabs. This
keeps the indentation of every line to one kind of character, the one that the
options say. [fixture: indentation/use-tabs] [fixture:
indentation/characters-replaced]

Input
([indentation/step-widths-kept-input.mmd](../tests/fixtures/mindmap/indentation/step-widths-kept-input.mmd)):

```mmd
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
```

Output
([indentation/step-widths-kept-output.mmd](../tests/fixtures/mindmap/indentation/step-widths-kept-output.mmd)):

```mmd
mindmap
  root((mindmap))
    Origins
      Long history
      ::icon(fa fa-book)
      Popularisation
        British popular psychology author Tony Buzan
    Research
      On effectiveness<br/>and features
      On Automatic creation
        Uses
            Creative techniques
            Strategic planning
            Argument mapping
    Tools
      Pen and paper
      Mermaid
```

Input
([indentation/root-shifted-to-one-level-input.mmd](../tests/fixtures/mindmap/indentation/root-shifted-to-one-level-input.mmd)):

```mmd
mindmap
      root((mindmap))
          Origins
             Long history
          Research
```

Output
([indentation/root-shifted-to-one-level-output.mmd](../tests/fixtures/mindmap/indentation/root-shifted-to-one-level-output.mmd)):

```mmd
mindmap
  root((mindmap))
      Origins
         Long history
      Research
```

Input
([indentation/tab-width-4-input.mmd](../tests/fixtures/mindmap/indentation/tab-width-4-input.mmd)):

```mmd
mindmap
  root
    a
      b
```

Output
([indentation/tab-width-4-output.mmd](../tests/fixtures/mindmap/indentation/tab-width-4-output.mmd)):

```mmd
mindmap
    root
      a
        b
```

### Root on header line

The first node, the root, may stand on the line of the header; its indentation
is the whitespace after the header, which is none for `mindmap((x))`. It is
printed on a line of its own, one level deeper than the header, and the nodes
below it keep their steps beyond the root (see [Indentation](#indentation)): the
Db is the same, and the root stands as the statements of the other diagram types
do after the header, which move to a line of their own too. [fixture:
root-on-header-line/moved-to-its-own-line] [fixture:
root-on-header-line/shape-glued-to-the-header] [fixture:
root-on-header-line/text-after-spaces] [fixture:
root-on-header-line/after-a-tab] A `%%` after the text of the root is part of
the text, not a comment. [fixture: root-on-header-line/text-with-percent]

Input
([root-on-header-line/moved-to-its-own-line-input.mmd](../tests/fixtures/mindmap/root-on-header-line/moved-to-its-own-line-input.mmd)):

```mmd
mindmap root((x))
   a
```

Output
([root-on-header-line/moved-to-its-own-line-output.mmd](../tests/fixtures/mindmap/root-on-header-line/moved-to-its-own-line-output.mmd)):

```mmd
mindmap
  root((x))
    a
```

Input
([root-on-header-line/shape-glued-to-the-header-input.mmd](../tests/fixtures/mindmap/root-on-header-line/shape-glued-to-the-header-input.mmd)):

```mmd
mindmap((x))
 a
```

Output
([root-on-header-line/shape-glued-to-the-header-output.mmd](../tests/fixtures/mindmap/root-on-header-line/shape-glued-to-the-header-output.mmd)):

```mmd
mindmap
  ((x))
   a
```

### Decorations

An icon line and a class line decorate the node written last before them,
whatever their indentation, so their indentation is no part of the Db. They are
printed at the column of the node that they decorate, as the documentation of
mermaid.js writes them. [fixture: decorations/at-the-column-of-the-node]
[fixture: decorations/before-and-after-children] A second class line, or a
second icon line, replaces the first in the Db, and both are kept as written,
since the printer drops no text that the author wrote. [fixture:
decorations/second-class-kept]

The text of an icon keeps the whitespace at its ends and inside, and so does a
class: the Db keeps them. The whitespace after the closing parenthesis of an
icon is not in the Db, and is dropped. [fixture:
decorations/whitespace-in-icon-and-class-kept] [fixture:
decorations/trailing-whitespace-after-icon-dropped]

Input
([decorations/at-the-column-of-the-node-input.mmd](../tests/fixtures/mindmap/decorations/at-the-column-of-the-node-input.mmd)):

```mmd
mindmap
  root
      a
  ::icon(fa fa-book)
          :::big
      b
```

Output
([decorations/at-the-column-of-the-node-output.mmd](../tests/fixtures/mindmap/decorations/at-the-column-of-the-node-output.mmd)):

```mmd
mindmap
  root
      a
      ::icon(fa fa-book)
      :::big
      b
```

Input
([decorations/before-and-after-children-input.mmd](../tests/fixtures/mindmap/decorations/before-and-after-children-input.mmd)):

```mmd
mindmap
  root
  ::icon(x)
    a
      b
    ::icon(y)
  :::c
```

Output
([decorations/before-and-after-children-output.mmd](../tests/fixtures/mindmap/decorations/before-and-after-children-output.mmd)):

```mmd
mindmap
  root
  ::icon(x)
    a
      b
      ::icon(y)
      :::c
```

### Node text

A node text keeps the whitespace at its end, since the Db keeps it as part of
the id: `root` followed by three spaces is the node `root   `, and `a (x)` has
the id `a `, so the space before a shape stays. [fixture:
node-text/trailing-whitespace-kept] [fixture:
node-text/space-before-a-shape-kept] A node text holds `]`, `:`, `#`, `"`, `%%`,
and `:::` as characters, and a line that starts with a single `%` is a node
text, not a comment. [fixture: node-text/special-characters] [fixture:
node-text/percent-in-text] [fixture: node-text/keywords-in-text]

Input
([node-text/special-characters-input.mmd](../tests/fixtures/mindmap/node-text/special-characters-input.mmd)):

```mmd
mindmap
  root
    a: b # c
    a]b
    a:::b
    ::x
    -x
```

Output
([node-text/special-characters-output.mmd](../tests/fixtures/mindmap/node-text/special-characters-output.mmd)):

```mmd
mindmap
  root
    a: b # c
    a]b
    a:::b
    ::x
    -x
```

Input
([node-text/space-before-a-shape-kept-input.mmd](../tests/fixtures/mindmap/node-text/space-before-a-shape-kept-input.mmd)):

```mmd
mindmap
  root
    a (x)
    b  [y]
```

Output
([node-text/space-before-a-shape-kept-output.mmd](../tests/fixtures/mindmap/node-text/space-before-a-shape-kept-output.mmd)):

```mmd
mindmap
  root
    a (x)
    b  [y]
```

### Shapes

The opener and the closer of a shape are printed as written. The closer need not
match the opener: `[text)` is a rectangle and `((x)` a circle, and writing the
closer that matches would change the text the author wrote. [fixture:
shapes/openers-and-closers-kept] [fixture: shapes/mismatched-closers-kept] A
shape may stand alone, without a node text. [fixture: shapes/shape-alone]

The text of a shape keeps its whitespace, which the Db keeps. A string is a
string only right after the opener, so `a[ "x" ]` has the text `"x"` with its
quotes, and `a["x"]` and `a[x]` have the same text; none is rewritten into
another. [fixture: shapes/inner-whitespace-kept] [fixture:
shapes/text-and-string-forms] [fixture: shapes/markdown-string] The whitespace
after a shape is not in the Db, and is dropped. [fixture:
shapes/trailing-whitespace-dropped]

Input
([shapes/mismatched-closers-kept-input.mmd](../tests/fixtures/mindmap/shapes/mismatched-closers-kept-input.mmd)):

```mmd
mindmap
  root((x)
    a[y)
    b(z]
    c)w(
```

Output
([shapes/mismatched-closers-kept-output.mmd](../tests/fixtures/mindmap/shapes/mismatched-closers-kept-output.mmd)):

```mmd
mindmap
  root((x)
    a[y)
    b(z]
    c)w(
```

Input
([shapes/text-and-string-forms-input.mmd](../tests/fixtures/mindmap/shapes/text-and-string-forms-input.mmd)):

```mmd
mindmap
  root
    a[x y]
    b["x y"]
    c[ "x" ]
    d["x"]
```

Output
([shapes/text-and-string-forms-output.mmd](../tests/fixtures/mindmap/shapes/text-and-string-forms-output.mmd)):

```mmd
mindmap
  root
    a[x y]
    b["x y"]
    c[ "x" ]
    d["x"]
```

### Multi-line texts

A shape text, a string, a markdown string, and an icon may go over lines. The
whitespace at the start of the later lines is part of the text, not an
indentation, so the lines are printed as written, and the nodes below keep their
steps as the rules above say. [fixture: multi-line-texts/shape-text] [fixture:
multi-line-texts/string] [fixture: multi-line-texts/markdown-string] [fixture:
multi-line-texts/icon] [fixture: multi-line-texts/rest-of-the-tree-shifted]

Input
([multi-line-texts/shape-text-input.mmd](../tests/fixtures/mindmap/multi-line-texts/shape-text-input.mmd)):

```mmd
mindmap
  root
    a[x
 y]
    b
```

Output
([multi-line-texts/shape-text-output.mmd](../tests/fixtures/mindmap/multi-line-texts/shape-text-output.mmd)):

```mmd
mindmap
  root
    a[x
 y]
    b
```

Input
([multi-line-texts/rest-of-the-tree-shifted-input.mmd](../tests/fixtures/mindmap/multi-line-texts/rest-of-the-tree-shifted-input.mmd)):

```mmd
mindmap
      root[x
  y]
          a[p
   q]
```

Output
([multi-line-texts/rest-of-the-tree-shifted-output.mmd](../tests/fixtures/mindmap/multi-line-texts/rest-of-the-tree-shifted-output.mmd)):

```mmd
mindmap
  root[x
  y]
      a[p
   q]
```

### Blank lines

Empty lines, comment lines, and diagram comments change nothing in the Db
wherever they stand after the header. Runs of empty lines become one empty line,
and empty lines at the start and the end of the body are dropped, as in the
other diagram types. [fixture: blank-lines/collapsed] [fixture:
blank-lines/body-edges-dropped] [fixture: blank-lines/before-a-comment]
[fixture: blank-lines/around-comment-lines-and-directives]

mermaid.js rejects some inputs that this specification accepts, as its lexer
reads a diagram comment together with the whitespace before it (known divergence
`blank-line-after-header-or-comments`): an empty line after the header, and an
empty line after a diagram comment in the places that the divergence lists. The
printer does not repair the second kind. The empty lines after the header are
dropped, like the whitespace at the end of the header line, so the output is
accepted by mermaid.js. [fixture: blank-lines/after-the-header-dropped]
[fixture: blank-lines/header-trailing-whitespace-dropped] [fixture:
blank-lines/whitespace-line-dropped-at-the-start] An empty line after a diagram
comment between nodes, or after the comments that follow the header, stays, as
one, and mermaid.js rejects the output as it rejects the input. [fixture:
blank-lines/after-two-comments-after-the-header] [fixture:
blank-lines/after-a-comment-between-nodes-kept] [fixture:
blank-lines/after-a-comment-between-nodes-collapsed] [fixture:
blank-lines/after-a-trailing-comment-kept] Where mermaid.js accepts the empty
line, it accepts the output. [fixture:
blank-lines/after-one-comment-after-the-header] [fixture:
blank-lines/after-two-comments-between-nodes]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/mindmap/blank-lines/collapsed-input.mmd)):

```mmd
mindmap
  root


    a



    b
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/mindmap/blank-lines/collapsed-output.mmd)):

```mmd
mindmap
  root

    a

    b
```

Input
([blank-lines/after-the-header-dropped-input.mmd](../tests/fixtures/mindmap/blank-lines/after-the-header-dropped-input.mmd)):

```mmd
mindmap

  root
    a
```

Output
([blank-lines/after-the-header-dropped-output.mmd](../tests/fixtures/mindmap/blank-lines/after-the-header-dropped-output.mmd)):

```mmd
mindmap
  root
    a
```

Input
([blank-lines/after-a-comment-between-nodes-kept-input.mmd](../tests/fixtures/mindmap/blank-lines/after-a-comment-between-nodes-kept-input.mmd)):

```mmd
mindmap
  root
    a
%%

    b
```

Output
([blank-lines/after-a-comment-between-nodes-kept-output.mmd](../tests/fixtures/mindmap/blank-lines/after-a-comment-between-nodes-kept-output.mmd)):

```mmd
mindmap
  root
    a
    %%

    b
```

### Comments

A comment line, a line `%%` alone, and a line `%%{ }%%` stand at the level of
the line after them, and at the end of the body at that of the last line. Their
indentation is no part of the Db and does not change what mermaid.js accepts,
and a `%%{` line needs no particular indentation. Their text and mark are kept
as written. This is the rule of the other diagram types. [fixture:
comments/lines-at-the-level-of-the-next-line] [fixture: comments/at-the-end]
[fixture: comments/bare-and-brace-lines] [fixture: comments/only-comments] A
comment line before the header stands at the first column. [fixture:
comments/before-the-header]

A comment after the header, a shape, or an icon stays on the line, as written:
one space stands before it where whitespace was written, and none where it
touches. The whitespace before such a comment is no part of the Db, so the form
is a choice: the printer shortens a run to one space and keeps whether there is
any, since the author decides whether a comment touches what it follows, as in
the other diagram types. [fixture: comments/after-the-header] [fixture:
comments/after-the-header-touching] [fixture: comments/after-a-shape] [fixture:
comments/after-an-icon] After a node text and inside a class, `%%` is a
character of the text. [fixture: comments/in-text-is-text] [fixture:
comments/single-percent-is-text]

Input
([comments/lines-at-the-level-of-the-next-line-input.mmd](../tests/fixtures/mindmap/comments/lines-at-the-level-of-the-next-line-input.mmd)):

```mmd
mindmap
%% c1
  root
          %% c2
    a
 %% c3
      ::icon(x)
```

Output
([comments/lines-at-the-level-of-the-next-line-output.mmd](../tests/fixtures/mindmap/comments/lines-at-the-level-of-the-next-line-output.mmd)):

```mmd
mindmap
  %% c1
  root
    %% c2
    a
    %% c3
    ::icon(x)
```

Input
([comments/after-a-shape-input.mmd](../tests/fixtures/mindmap/comments/after-a-shape-input.mmd)):

```mmd
mindmap
  root
    a[x] %% c
    b[y]%% d
    c((z))   %%  e
```

Output
([comments/after-a-shape-output.mmd](../tests/fixtures/mindmap/comments/after-a-shape-output.mmd)):

```mmd
mindmap
  root
    a[x] %% c
    b[y]%% d
    c((z)) %%  e
```

### Directives

A directive on a line of its own stands at the level of the line after it. A
directive on the line of a node keeps whether whitespace is written on each side
of it: where it is, one space stands there, and where it touches, it keeps
touching, as in the other diagram types. [fixture: directives/kept] [fixture:
directives/between-nodes] [fixture: directives/before-the-header] [fixture:
directives/after-the-header-on-the-same-line] [fixture:
directives/after-the-header-touching] [fixture: directives/after-a-shape]

A directive between two units stays where it is, and a directive inside a text
is part of the text. [fixture: directives/between-units] [fixture:
directives/inside-a-text] A directive that is not closed takes the rest of the
text, and is kept as written. [fixture: directives/unclosed] [fixture:
directives/unclosed-after-a-node]

The whitespace after a directive that starts a line counts as indentation of the
node, since the Db reads the indentation in the text without its directives.
Such a line is printed as written from the directive, and the printer decides
the whitespace before the directive, so that the node has as many characters of
indentation as the level of its step requires. [fixture:
directives/before-a-node-on-its-line] [fixture:
directives/before-a-node-after-spaces] [fixture: directives/before-the-root]

Input
([directives/between-nodes-input.mmd](../tests/fixtures/mindmap/directives/between-nodes-input.mmd)):

```mmd
mindmap
  root
      %%{wrap}%%
    a
          %%{init: {}}%%
    b
```

Output
([directives/between-nodes-output.mmd](../tests/fixtures/mindmap/directives/between-nodes-output.mmd)):

```mmd
mindmap
  root
    %%{wrap}%%
    a
    %%{init: {}}%%
    b
```

Input
([directives/before-a-node-on-its-line-input.mmd](../tests/fixtures/mindmap/directives/before-a-node-on-its-line-input.mmd)):

```mmd
mindmap
root
 %%{init: {}}%% a
```

Output
([directives/before-a-node-on-its-line-output.mmd](../tests/fixtures/mindmap/directives/before-a-node-on-its-line-output.mmd)):

```mmd
mindmap
  root
   %%{init: {}}%% a
```

### Keyword case

Keywords keep the case in which they are written: mermaid.js reads `::icon(` in
any case and the Db is the same, so nothing forces the case; it is the author's,
and the printer does not rewrite it. The header is detected in lower case only.
[fixture: keyword-case/icon-keyword]

Input
([keyword-case/icon-keyword-input.mmd](../tests/fixtures/mindmap/keyword-case/icon-keyword-input.mmd)):

```mmd
mindmap
  root
  ::ICON(x)
  ::Icon(y)
```

Output
([keyword-case/icon-keyword-output.mmd](../tests/fixtures/mindmap/keyword-case/icon-keyword-output.mmd)):

```mmd
mindmap
  root
  ::ICON(x)
  ::Icon(y)
```

### Frontmatter YAML

As in a flowchart: the YAML between the `---` lines is formatted with Prettier's
YAML formatter, and the `---` lines are kept as written, with the spaces and
tabs at the end of each. [fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/closing-delimiter-whitespace-kept] The YAML is kept as written
when Prettier cannot read it. [fixture: frontmatter-yaml/malformed-kept] A
comment line between the frontmatter and the header is kept. [fixture:
frontmatter-yaml/comment-after-frontmatter-before-header]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/mindmap/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:   T
config:
    theme:   dark
---
mindmap
  root
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/mindmap/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config:
  theme: dark
---
mindmap
  root
```

### Line separators

A diagram comment of a mindmap ends at a U+2028 or a U+2029, and the text after
it is a new line whose indentation starts with that character. So the printer
writes a line break there, and the line after it has the indentation that the Db
reads, counting the separator as one character. In a node text, a shape text,
and an icon, they are characters of the text and stay. The examples are written
as strings, in which `\u2028` is U+2028 and `\n` is a line break. [test: U+2028
after a comment on the header line] [test: U+2028 after a comment after a shape]
[test: U+2028 after a comment after an icon] [test: U+2028 after a bare comment
between nodes] [test: U+2028 inside a node text] [test: U+2029 inside a shape
text] [test: U+2028 inside an icon] [test: U+2028 after the header]

### Whitespace characters

U+00A0, U+3000, and U+FEFF are whitespace to the lexer. Before a node each is
one character of the indentation, and the printer writes the character of the
options in its place, keeping the number; after a shape they are dropped, and
before a comment a space stands for them; in a node text and a shape text they
are characters of the text and stay. The examples are written as strings, in
which `\u00a0` is U+00A0, `\u3000` is U+3000, and `\ufeff` is U+FEFF. [test:
U+00A0 in the indentation] [test: U+3000 in the indentation] [test: U+FEFF in
the indentation] [test: U+00A0 after the header] [test: U+00A0 inside a node
text] [test: U+00A0 inside a shape text] [test: U+00A0 and U+3000 after a shape]
[test: U+00A0 before a comment after a shape]
