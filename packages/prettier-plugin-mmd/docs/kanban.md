# Kanban formatting rules

Japanese version: [kanban.ja.md](./kanban.ja.md)

How prettier-plugin-mmd formats a kanban board. Each rule below keeps what
mermaid.js reads from the board; where a change would alter it, the text is kept
as written, and the rule says where. Where a rule is the same as in a mindmap,
it says so, and the reason is in the mindmap rules.

A kanban board is a flat list of lines (see the
[kanban tree](../../spec/docs/ast/kanban.md)). The Db has, for each node,
whether it is a section and which section it belongs to, and it has no
indentation. The node on the first line sets the indentation of the sections: a
node written at that indentation is a section, and every other node is an item
of the section before it, however deep it is written. A deeper line is no child
of the line before it. So the printer keeps every line in its place in the list
and keeps its role, and it chooses the indentation (see
[Indentation](#indentation)).

Some words are used in the rules below:

- A **node line** holds a section or an item: an id, an optional shape, and
  optional data blocks, such as `Todo`, `a[Write docs]`, or
  `a[x]@{ticket: T-1}`.
- A **decoration line** is an icon line, `::icon(fa fa-star)`, or a class line,
  `:::urgent`. It decorates the node line written last before it, wherever it is
  indented.
- A **directive** is `%%{ ... }%%`. mermaid.js removes it before it reads the
  indentation and the text, so the whitespace beside a directive is part of the
  indentation or of the text.
- A **comment line** has text after its `%%`, as `%% note` has. mermaid.js
  removes it, with its line feed, before it reads the text. A **diagram
  comment** is a comment that the lexer of the diagram reads itself: a line of
  `%%` alone, a line `%%{ }%%`, and a `%%` after the header, a shape, an icon,
  or a data block, as in `S[x] %% note`. The known divergence
  [`blank-line-after-header-or-comments`](../../spec/docs/known-divergences/blank-line-after-header-or-comments.md)
  defines both.
- A **kept line** is a line that holds a `;`. The text of its node stays as
  written (see [Line rule and kept lines](#line-rule-and-kept-lines)).

The parser rejects some boards, and the plugin then reports a syntax error and
leaves the text as it is; the printer repairs nothing (see
[When a diagram is not formatted](../README.md#when-a-diagram-is-not-formatted)).
The rejected inputs of the conformance corpus are checked by `corpus.test.ts`.

Each rule below shows its formatting with examples: the text before formatting,
and the text that the plugin prints. The examples are the fixtures that the
tests check, and the link above each one is to its file. Whitespace that cannot
be shown in Markdown is written as an escape in the tests. How the fixtures are
organized and checked is described in
[Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

With spaces, one configured indentation level is at least one character, even
with `tabWidth: 0`; `useTabs` still supplies a tab. Formatting must not change
the Db, and one character is the smallest width that keeps the indentation's
reading.

[fixture: kanban/indentation/tab-width-0] [fixture:
kanban/indentation/tab-width-0-use-tabs]

The indentation of a node line tells a section from an item, and nothing else.
The Db has, for each node, whether it is a section and which section it belongs
to; it has no indentation. A node written at the indentation of the first node
is a section, and every other node is an item of the section before it, whatever
its indentation, a last line shallower than the first node included
(diagrams/kanban.md). So, as in a [mindmap](./mindmap.md#indentation), the
written indentation carries nothing that a reader of the Db keeps, and the
printer chooses it: a section stands one step deeper than the header, and an
item two steps deeper, whatever the item's depth was. `kanban`, `      S`,
`          A`, `             B`, and `      T` print `S` and `T` with 2 spaces,
and `A` and `B` with 4. [fixture: indentation/sections-and-items] [fixture:
indentation/written-indentation-dropped] [fixture:
indentation/first-section-at-the-first-column] [fixture:
indentation/items-at-any-depth]

A step is what Prettier's `useTabs` and `tabWidth` options say: two spaces by
default, one tab with `useTabs`. Every whitespace character before a node is one
character of its indentation, a tab, a U+00A0, a U+3000, and a U+FEFF included
(see [Whitespace characters](#whitespace-characters)), and the printer writes
only the characters of the options, so the indentation of every line is of one
kind of character. [fixture: indentation/tab-width-4] [fixture:
indentation/use-tabs] [test: kanban: tab-one-space] [test: kanban:
indent-whitespace-kind] [test: kanban: ls-indent-one-space] [test: kanban:
ps-indent-count]

A line that is printed as written in part still takes its indentation from the
printer, and the Db still compares the indentation of a node with that of the
first node, so the characters that count are kept right. On a line with a
directive before its text, the whitespace after the directive is indentation
too, and the directive is not counted (see [Directives](#directives)), so the
line has the indentation of its role like any other. On a line that holds a `;`
(see [Line rule and kept lines](#line-rule-and-kept-lines)), the whitespace
before the text is chosen in the same way. After a diagram comment that ends at
a U+2028 or U+2029 the separator is one character of the indentation of the next
node and stays (see [Blank lines](#blank-lines)), and the whitespace after it
makes up the rest. [fixture: directives/leading-directive-indentation-decided]
[fixture: directives/wide-whitespace-after-directive] [fixture:
directives/leading-directive-gap-shortened] [fixture:
line-rule-and-kept-lines/kept-line-indentation-decided] [fixture:
blank-lines/div-between-comment-blank]

Input
([indentation/sections-and-items-input.mmd](../tests/fixtures/kanban/indentation/sections-and-items-input.mmd)):

```mmd
kanban
      S
          A
             B
      T
```

Output
([indentation/sections-and-items-output.mmd](../tests/fixtures/kanban/indentation/sections-and-items-output.mmd)):

```mmd
kanban
  S
    A
    B
  T
```

Input
([indentation/items-at-any-depth-input.mmd](../tests/fixtures/kanban/indentation/items-at-any-depth-input.mmd)):

```mmd
kanban
 S
   A
      B
  C
 T
```

Output
([indentation/items-at-any-depth-output.mmd](../tests/fixtures/kanban/indentation/items-at-any-depth-output.mmd)):

```mmd
kanban
  S
    A
    B
    C
  T
```

### Header

The header `kanban` stands at the first column. Text after `kanban` on the
header line is read as a node line, with the whitespace between as its
indentation: in `kanban   S[x]` the node `S[x]` is the first node, and so a
section. The printer moves it to a line of its own and indents it as any
section: `kanban`, a line break, and `  S[x]`. The same holds when the node
touches the header, as in `kanban[S]` or `kanban-x` (`  [S]`, `  -x`).
Everything after `kanban` moves with it, a `%%` that is text of the node
included (`kanban S %% literal` prints `  S %% literal` on its line). A header
line that holds a directive keeps it with the node (see
[Directives](#directives)), and one that holds a `;` is no exception: the word
`kanban` holds nothing that the line rule reads, so the node moves with its `;`
(`kanban S;T` prints `kanban` and `  S;T`; see
[Line rule and kept lines](#line-rule-and-kept-lines)). [fixture:
header/inline-count] [fixture: header/header-column] [fixture:
header/header-touching-shape] [fixture: header/header-touching-dash] [fixture:
header/header-percent-in-text] [fixture:
header/header-line-with-semicolon-moved] [fixture:
header/header-directive-with-semicolon] [fixture:
header/header-line-with-semicolon-then-sections-and-items] [test: kanban:
header-tab-inline] [test: kanban: header-nbsp-count] [test: kanban:
header-bom-count]

A header with nothing after it stays `kanban` and a line break; whitespace after
`kanban` is dropped (see [Blank lines](#blank-lines)), and the board `kanban`
with no line break after it is rejected (see
[When a diagram is not formatted](../README.md#when-a-diagram-is-not-formatted)).
[fixture: header/header-only-lf] [fixture: header/header-space-only]

Input
([header/inline-count-input.mmd](../tests/fixtures/kanban/header/inline-count-input.mmd)):

```mmd
kanban   S[x]
     A
```

Output
([header/inline-count-output.mmd](../tests/fixtures/kanban/header/inline-count-output.mmd)):

```mmd
kanban
  S[x]
    A
```

### Nodes one per line

The nodes of a board are a flat list: the node on the first line sets the
indentation of the sections, a node at that indentation starts a section, and
every other node is an item of the section before it, however deep it is
written. An item written deeper than the item before it (`A`, then a deeper `B`)
is not a child of it. So the printer prints the nodes in the order written, one
per line, and it does not nest, merge, sort, or join them: two sections with the
same id stay two sections, items at any depth are printed at the one depth of an
item, and a last line that is shallower than the first section is printed as an
item (see [Indentation](#indentation)). Nesting, merging, sorting, or joining
would change the board that mermaid.js builds. [fixture:
nodes-one-per-line/flat-order] [fixture:
nodes-one-per-line/deeper-to-regular-items] [fixture:
nodes-one-per-line/repeated-ids] [fixture: nodes-one-per-line/shallower-last]

Input
([nodes-one-per-line/flat-order-input.mmd](../tests/fixtures/kanban/nodes-one-per-line/flat-order-input.mmd)):

```mmd
kanban
 S
   A
     B
   C
 T
```

Output
([nodes-one-per-line/flat-order-output.mmd](../tests/fixtures/kanban/nodes-one-per-line/flat-order-output.mmd)):

```mmd
kanban
  S
    A
    B
    C
  T
```

### Shapes

The opener and the closer of a shape are printed as written. The closer need not
match the opener: `S[x)` is accepted, and `S[x]` would give the same Db, but it
would rewrite what the author wrote, as in [mindmap](./mindmap.md#shapes). This
holds for every family of shapes (`S[x]`, `A(y)`, `B((z))`, `C{{q}}`, `D)w(`,
`E))v((`, and the dash spellings `F-)"bang"(-` and `G(-"cloud"-)`), and for a
shape with no id (`[S]`). [fixture: shapes/mismatched] [fixture:
shapes/matching-closer] [fixture: shapes/shape-families] [fixture:
shapes/shape-alone] [fixture: shapes/db-shape-square] [fixture:
shapes/db-shape-round] [fixture: shapes/db-shape-circle] [fixture:
shapes/db-shape-hexagon] [fixture: shapes/db-shape-bang] [fixture:
shapes/db-shape-bang-alt] [fixture: shapes/db-shape-cloud] [fixture:
shapes/db-shape-cloud-alt] [fixture: shapes/db-shape-mismatched] [fixture:
shapes/lex-shape-dash-bare] [fixture: shapes/lex-shape-dash-string]

The whitespace between a bare id and its shape stays: `S [x]` has the id `S `
with the space, because the Db keeps the whitespace at the end of a bare id.
[fixture: shapes/id-before-shape]

Input
([shapes/mismatched-input.mmd](../tests/fixtures/kanban/shapes/mismatched-input.mmd)):

```mmd
kanban
 S[x)
   A(y]
   B))z((
   C{{q}}
```

Output
([shapes/mismatched-output.mmd](../tests/fixtures/kanban/shapes/mismatched-output.mmd)):

```mmd
kanban
  S[x)
    A(y]
    B))z((
    C{{q}}
```

### Labels

A label is printed in the form written: bare (`A[x y]`), quoted (`B["x y"]`), or
markdown (`C["`x y`"]`). The whitespace inside a label is in the Db and stays,
whitespace-only labels (`S[ ]`, `A[" "]`) and the whitespace at the ends of a
bare label (`S[  x  ]`) included. A quote is the start of a string only right
after the opener, so `D[ "x" ]` has the bare text `"x"` with its quotes and the
spaces around it, and the printer does not move them. Entities (`a#35;b`) and
HTML attributes (`<a href="x">`) are text and stay, and so does a node written
`""` or `"``"` outside a shape. [fixture: labels/forms] [fixture:
labels/inner-whitespace-trim] [fixture: labels/leading-space-quote] [fixture:
labels/whitespace-only-forms] [fixture: labels/bare-empty-spellings] [fixture:
labels/lex-style-entity-two-semicolons] [fixture:
labels/db-grid-html-attribute-item-label-quoted] [fixture:
labels/db-grid-entity-item-label-quoted]

The printer does not quote, unquote, trim, pad, encode, or decode a label.
`A[x y]` and `A["x y"]` have the same Db, but the form is the author's. A space
after the closing quote of a string (`S["x" ]`) is rejected, so it is never a
form to print (see
[When a diagram is not formatted](../README.md#when-a-diagram-is-not-formatted)).
[fixture: labels/bare-to-quoted] [fixture: labels/space-after-string-invalid]

Input
([labels/forms-input.mmd](../tests/fixtures/kanban/labels/forms-input.mmd)):

```mmd
kanban
 S
   A[x y]
   B["x y"]
   C["`x y`"]
   D[ "x" ]
```

Output
([labels/forms-output.mmd](../tests/fixtures/kanban/labels/forms-output.mmd)):

```mmd
kanban
  S
    A[x y]
    B["x y"]
    C["`x y`"]
    D[ "x" ]
```

### Icons and classes

A decoration line decorates the node line written last before it, whatever its
indentation, so its indentation is no part of the Db. The printer puts every
decoration line at the column of the node line it decorates, as the
documentation of mermaid.js writes them and as in
[mindmap](./mindmap.md#decorations), so that the attachment shows. In ` S`,
`   A`, and `::icon(x)` at the first column, the icon decorates `A` and is
printed with 4 characters of indentation, those of an item; after a node line
that is shallower than the first node, which is an item too, the icon follows
that node (`    S`, `  A`, and ` ::icon(x)` print `A` and the icon with 4
characters). [fixture: icons-and-classes/aligned] [fixture:
icons-and-classes/decorations-align] [fixture:
icons-and-classes/gram-shallower-then-decoration] [fixture:
icons-and-classes/db-decoration-icon-section] [fixture:
icons-and-classes/gram-decoration-then-child]

The text of a decoration stays as written: the case of the marker (`::ICON(y)`),
the whitespace inside an icon (`::icon( x )`) and in a class (`::: c  `, whose
trailing spaces are part of the class), whitespace-only icons and classes, and a
second icon or class after the first. A later icon replaces an earlier one in
the Db, and both are kept, because the printer drops no text. The printer never
moves a decoration onto the line of its node, because that changes the board:
after a bare node an icon makes a round shape of its text and the rest part of
the id (`A ::icon(x)` is the node `A ::icon` with the label `x`), a class
becomes part of the id (`A :::c` is the id `A :::c`), and after a shape both are
rejected (`S[x] ::icon(star)`, see
[When a diagram is not formatted](../README.md#when-a-diagram-is-not-formatted)).
Classes and the icons of sections do not show in the Db that the tests compare,
but they are text that the author wrote, and they are kept as well. [fixture:
icons-and-classes/icon-after-bare] [fixture: icons-and-classes/class-after-bare]
[fixture: icons-and-classes/icon-appended-to-bare-is-a-shape] [fixture:
icons-and-classes/class-appended-to-bare-is-the-id] [fixture:
icons-and-classes/icon-after-shape] [fixture:
icons-and-classes/class-after-shape] [fixture:
icons-and-classes/icon-value-trim] [fixture:
icons-and-classes/class-value-trim-summary-only] [fixture:
icons-and-classes/gram-whitespace-class] [fixture:
icons-and-classes/gram-whitespace-icon] [fixture:
icons-and-classes/db-decoration-icon-twice] [fixture:
icons-and-classes/db-decoration-class-twice]

Input
([icons-and-classes/aligned-input.mmd](../tests/fixtures/kanban/icons-and-classes/aligned-input.mmd)):

```mmd
kanban
 S
   A
 ::icon(x)
       :::hot
```

Output
([icons-and-classes/aligned-output.mmd](../tests/fixtures/kanban/icons-and-classes/aligned-output.mmd)):

```mmd
kanban
  S
    A
    ::icon(x)
    :::hot
```

### Data blocks

A data block `@{ ... }` is embedded text that mermaid.js reads as YAML for the
properties of a node, such as `ticket` and `assigned`. The printer keeps it
opaque, with its delimiters, its interior, and its line breaks, as written: it
does not format the YAML, and it does not merge, split, reorder, wrap, or repair
blocks, whether a block is empty (`A@{}`), has an unknown or duplicate key
(`A@{ticket: X, ticket: Y}`), is not valid YAML (`A@{assigned: [a}`), or runs
over several lines. Even a rewrite that leaves the Db unchanged would change the
text that the author embedded. [fixture: data-blocks/data-opaque] [fixture:
data-blocks/empty-data] [fixture: data-blocks/data-invalid-yaml] [fixture:
data-blocks/data-unknown-duplicate] [fixture:
data-blocks/gram-metadata-ticket-duplicate] [fixture:
data-blocks/data-multiline] [fixture: data-blocks/gram-metadata-empty-multiline]
[fixture: data-blocks/db-metadata-comment-line] [fixture:
data-blocks/db-metadata-ticket-false] [fixture:
data-blocks/db-metadata-assigned-zero] [fixture:
data-blocks/db-metadata-quoted-brace] [fixture: data-blocks/data-line-rule-gap]

Where a block is attached is part of the syntax. The block touches the closing
of a shape (`A[x]@{ticket: X}`), and a space there is rejected. After a bare id,
the spaces before the block are part of the id, so `A  @{ticket: X}` has the id
`A  `. Blocks that follow each other touch (`A[x]@{ticket: X,}@{assigned: Ada}`:
mermaid.js joins their interiors), with a directive between them at most
(`A@{ticket: X,}%%{init: {}}%%@{assigned: Ada}`), and a space between two blocks
is rejected. The printer keeps all of this as written. [fixture:
data-blocks/data-space-after-shape] [fixture: data-blocks/data-space-after-bare]
[fixture: data-blocks/data-space-before-kept] [fixture: data-blocks/adjacent]
[fixture: data-blocks/data-adjacent-gap] [fixture:
data-blocks/data-adjacent-directive] [fixture: data-blocks/data-empty-adjacent]

Input
([data-blocks/adjacent-input.mmd](../tests/fixtures/kanban/data-blocks/adjacent-input.mmd)):

```mmd
kanban
 S
   A[x]@{ticket: X,}@{assigned: Ada}
```

Output
([data-blocks/adjacent-output.mmd](../tests/fixtures/kanban/data-blocks/adjacent-output.mmd)):

```mmd
kanban
  S
    A[x]@{ticket: X,}@{assigned: Ada}
```

### Blank lines

After the header, empty lines, comment lines, and diagram comments change
nothing in the Db between nodes, before decorations, and at the end of the board
(diagrams/kanban.md, Blank lines). Runs of empty lines between statements become
one empty line, whitespace-only lines are empty lines, and empty lines at the
start and at the end of the board are dropped, as in the other diagram types:
`kanban`, two empty lines, and ` S` print `kanban` and `  S`. Whitespace after
`kanban` on a header line with nothing else is dropped, whatever the character
(a space, a tab, a U+00A0, a U+3000, a U+FEFF, a form feed, a vertical tab, a
U+2028, a U+2029). [fixture: blank-lines/collapsed] [fixture:
blank-lines/blank-body-end] [fixture: blank-lines/gram-grid-lf-header-line]
[fixture: blank-lines/decoration-blank-runs-collapsed] [fixture:
blank-lines/gram-blank-before-icon] [fixture: blank-lines/div-header-space-node]
[test: kanban: blank-whitespace] [test: kanban: header-tab-trailing] [test:
kanban: header-bom-trailing] [test: kanban: header-crlf-trailing] [test: kanban:
header-ff-trailing] [test: kanban: header-ideographic-trailing] [test: kanban:
header-ls-trailing] [test: kanban: header-nbsp-trailing] [test: kanban:
header-ps-trailing] [test: kanban: header-vt-trailing] [test: kanban:
lex-tab-whitespace-first] [test: kanban: lex-bom-whitespace-first] [test:
kanban: lex-cr-whitespace-first] [test: kanban: lex-crlf-whitespace-first]
[test: kanban: lex-ideographic-whitespace-first] [test: kanban:
lex-ls-whitespace-first] [test: kanban: lex-nbsp-whitespace-first] [test:
kanban: lex-ps-whitespace-first]

mermaid.js rejects some of these placings that the specification accepts (known
divergence
[`blank-line-after-header-or-comments`](../../spec/docs/known-divergences/blank-line-after-header-or-comments.md)):
whether it accepts depends on how many diagram comments and empty lines lie
between two statements. For example, `S`, a line `%%`, an empty line, and `   A`
are rejected by mermaid.js and accepted by the specification. The printer does
not repair that. A gap that holds a diagram comment followed by an empty line,
by another comment, or by a U+2028 or U+2029 is kept whole as written: its empty
lines and its comments, up to the indentation of the next statement, which the
printer chooses (see [Indentation](#indentation)). A gap with only comment lines
(`S`, `%% note`, an empty line, `A`) is formatted as usual, and the comment line
is aligned (see [Comments](#comments)). [fixture:
blank-lines/div-between-comment-blank] [fixture:
blank-lines/div-comment-blank-before-icon] [fixture:
blank-lines/div-comment-blank-before-class] [fixture:
blank-lines/blank-comment-accepted] [fixture:
blank-lines/comment-blank-trailing] [fixture:
blank-lines/blank-comment-text-accepted] [fixture:
blank-lines/common-comment-after-directive]

Directly after the header, mermaid.js rejects an empty line after `kanban`, and
whitespace at the end of the header line, while the specification accepts them.
The printer drops them, so mermaid.js accepts the output, with the Db of the
specification. An empty line after the diagram comments that follow the header
stays, by the rule above: `kanban`, `%%`, `%%`, an empty line, and `S` are
rejected by mermaid.js as input and as output, and after one `%%` both accept
the text, so the gap is kept. A rejected text has no Db of mermaid.js, so these
are no before-and-after comparisons of a Db. [fixture:
blank-lines/div-header-comments-blank] [fixture:
blank-lines/header-header-comment-blank]

Input
([blank-lines/collapsed-input.mmd](../tests/fixtures/kanban/blank-lines/collapsed-input.mmd)):

```mmd
kanban
 S


   A



 T
```

Output
([blank-lines/collapsed-output.mmd](../tests/fixtures/kanban/blank-lines/collapsed-output.mmd)):

```mmd
kanban
  S

    A

  T
```

Input
([blank-lines/div-between-comment-blank-input.mmd](../tests/fixtures/kanban/blank-lines/div-between-comment-blank-input.mmd)):

```mmd
kanban
 S
%%

   A
```

Output
([blank-lines/div-between-comment-blank-output.mmd](../tests/fixtures/kanban/blank-lines/div-between-comment-blank-output.mmd)):

```mmd
kanban
  S
%%

    A
```

### Comments

A standalone comment is a comment line (`%% note`), a line of `%%` alone, or a
line `%%{ }%%`. It is printed at the column of the statement after it, at the
end of the board at the column of the last statement, and before the header at
the first column; its mark and its text are kept as written. This shows which
statement the comment is about, as in [mindmap](./mindmap.md#comments). In
`kanban`, `%% c1`, ` S`, `       %% c2`, `   A`, `%% c3`, the comments stand
with 2, 4, and 4 characters of indentation, those of `S` and `A`. A comment line
inside a multi-line label or data block is removed by mermaid.js and stays where
it is. A diagram comment that is followed by an empty line, by another comment,
or by a U+2028 or U+2029 stays as written with the gap after it (see
[Blank lines](#blank-lines)). [fixture: comments/comments-align] [fixture:
comments/bare-brace-comments-aligned] [fixture: comments/header-leading-comment]
[fixture: comments/comment-line-in-value]

A diagram comment after the header, a shape, an icon, or a data block stays on
its line: it has one space before it where whitespace was written, and none
where it touches. The whitespace before such a comment is no part of the Db, so
the form is a choice: the printer shortens a run to one space, and keeps whether
there is any, since the author decides whether a comment touches what it follows
(the choice of a [mindmap](./mindmap.md#comments) too). `S[x]   %% c` prints
`S[x] %% c`, and `A[y]%% d` is not changed. After a bare id, in a label, and in
a class, `%%` is a character of the text (`S %% x`, `A[%% y]`, `:::c %% z`), and
a line that starts with `#` or with a single `%` is node text; the printer does
not touch these. A comment line is removed with the text up to the line feed,
and a U+2028 or a U+2029 on it does not end it: the text after the separator is
part of the removed comment, and the printer keeps it there. [fixture:
comments/inline] [fixture: comments/header-comment-gap] [fixture:
comments/comment-after-data-gap] [fixture: comments/comment-after-icon-gap]
[fixture: comments/percent-values] [test: kanban: comment-line-ls-taken]

Input
([comments/inline-input.mmd](../tests/fixtures/kanban/comments/inline-input.mmd)):

```mmd
kanban
 S[x]   %% c
   A[y]%% d
```

Output
([comments/inline-output.mmd](../tests/fixtures/kanban/comments/inline-output.mmd)):

```mmd
kanban
  S[x] %% c
    A[y]%% d
```

### Directives

mermaid.js removes a directive before it reads the indentation and the text, so
the whitespace on both sides of a directive is part of the indentation of the
node line, or of its text. A line with a directive on it, an inline directive
line, is therefore printed as written from its first directive, with the
directive and the gaps beside it, and the indentation is the printer's: all the
whitespace before the text of the node is its indentation, the whitespace after
a directive included, and a directive is not counted, so the line has the
indentation of its role, like any other line. The printer writes the whitespace
before the first directive, keeps the whitespace after each directive as many
characters as it was while the whole fits, and shortens it, from the last
directive back, when it does not. The gaps keep their size where they can,
because the author wrote them beside the directive; what does not fit carries
nothing that the Db reads. In `kanban`, ` S`, and `      %%{init: {}}%%  A`, the
node `A` is an item and is indented by 8 characters, 6 before the directive and
2 after it; it gets 4, 2 before the directive and the 2 after it. In
`    %%{a}%%  %%{b}%%   A` the gaps are 2 and 3 and `A` gets 4, so the last gap
is shortened to 2, and nothing stands before the first directive. A directive
between two units of a line (`A  %%{init: {}}%%  B[x]`), between data blocks,
inside an id, an icon, a class, or a markdown label, a directive that is not
closed, and its line joins stay exactly as written. [fixture:
directives/leading-directive-kept] [fixture:
directives/leading-directive-with-semicolon] [fixture:
directives/two-leading-directives] [fixture:
directives/leading-directive-then-empty-data] [fixture:
directives/leading-directive-before-icon] [fixture:
directives/leading-directive-after-empty-lines] [fixture:
directives/id-directive-kept] [fixture: directives/unclosed-directive] [fixture:
directives/db-grid-directive-item-label-markdown] [fixture:
directives/db-grid-directive-item-icon] [fixture:
directives/db-grid-directive-item-class] [fixture:
directives/db-metadata-directive] [test: kanban:
unicode-inline-directive-indentation] [test: kanban:
directive-before-unicode-comment] [test: kanban:
directive-after-unicode-comment]

A directive on a line of its own is aligned like a standalone comment, at the
column of the statement after it. On the header line, the node moves to a line
of its own with everything after `kanban`, the directive included, and the line
is printed as written from the first directive or node
(`kanban %%{init: {}}%%  S[x]` prints `kanban` and `%%{init: {}}%%  S[x]`). A
directive before the header stands at the first column. [fixture:
directives/standalone] [fixture: directives/standalone-directive-align]
[fixture: directives/header-directive-inline] [fixture:
directives/directive-before-header]

Input
([directives/standalone-input.mmd](../tests/fixtures/kanban/directives/standalone-input.mmd)):

```mmd
kanban
 S
       %%{init: {}}%%
   A
```

Output
([directives/standalone-output.mmd](../tests/fixtures/kanban/directives/standalone-output.mmd)):

```mmd
kanban
  S
    %%{init: {}}%%
    A
```

Input
([directives/leading-directive-indentation-decided-input.mmd](../tests/fixtures/kanban/directives/leading-directive-indentation-decided-input.mmd)):

```mmd
kanban
 S
      %%{init: {}}%%  A
```

Output
([directives/leading-directive-indentation-decided-output.mmd](../tests/fixtures/kanban/directives/leading-directive-indentation-decided-output.mmd)):

```mmd
kanban
  S
  %%{init: {}}%%  A
```

### Line rule and kept lines

mermaid.js ignores the last `;` of a line that holds the word `style` (in lower
case), then a `:`, then a `#` with no whitespace between the `:` and the `#`,
then a `;`; a second pass does the same for `classDef` (the specification's
[`style` and `classDef` lines](../../spec/docs/common.md#style-and-classdef-lines)).
The rule reads the text of the line, a label, a data block, a comment, and what
stands between them included, and it is no kanban statement. Moving or reflowing
any of that text can make the rule ignore another `;`.
`S["style:#x ;y"]%% note;` has the label `style:#x ;y`, because the `;` of the
comment is the one that is ignored, and with the comment on a line of its own
the `;` in the label is ignored and the label is `style:#x y`. [fixture:
line-rule-and-kept-lines/line-rule-comment-after-label-kept] [fixture:
line-rule-and-kept-lines/line-rule-comment-on-its-own-line] [fixture:
line-rule-and-kept-lines/line-rule-comment-to-own-line] [fixture:
line-rule-and-kept-lines/line-rule-comment-move] [fixture:
line-rule-and-kept-lines/line-rule-classdef-and-style] [fixture:
line-rule-and-kept-lines/line-rule-two-semicolons]

So a line that holds a `;` is a kept line: the text of its node, and the comment
or the directive on the line, stay as written, with the gaps between them and
the whitespace between a `:` and a `#`. This holds wherever the `;` stands: in
an id (`astyle:#x;y`), a label, an icon (`::icon(style:#x;y)`), a class, a data
block, a comment, or a directive, and it holds whether the rule applies to the
line or not. A `style` that is in upper case (`aStyle`), a `:` and a `#` with
whitespace between them (`style: #x;`), no `#`, or a `;` on another line of a
multi-line label do not make the rule apply, and the text is kept all the same.
[fixture: line-rule-and-kept-lines/style-segment] [fixture:
line-rule-and-kept-lines/line-rule-kept] [fixture:
line-rule-and-kept-lines/line-rule-wrap] [fixture:
line-rule-and-kept-lines/line-rule-colon-space] [fixture:
line-rule-and-kept-lines/line-rule-directive-kept] [fixture:
line-rule-and-kept-lines/line-rule-id] [fixture:
line-rule-and-kept-lines/line-rule-data] [fixture:
line-rule-and-kept-lines/line-rule-icon] [fixture:
line-rule-and-kept-lines/line-rule-class] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-upper] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-no-hash] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-space] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-other-line] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-two-semicolons] [test: kanban:
line-rule-ls-segment]

The rest of the line is the printer's, as on any line. The rule looks at the
word `style` or `classDef`, the `:`, the `#`, the `;`, and the whitespace
between them. The indentation before the line, and the whitespace at the end of
the line after a shape, an icon, or a data block, are no part of that, and the
Db is the same without them: `A[style:#x;y]` with two tabs before it and three
spaces after it, and `A[style:#x;y]` with two spaces before it, are read alike.
So the indentation is chosen (see [Indentation](#indentation)), and the
whitespace at the end is dropped where it is not in the Db (see
[Trailing whitespace](#trailing-whitespace)): `kanban`, ` S`, and that line
print `  S` and `A[style:#x;y]` indented by 4 spaces, with nothing after it.
[fixture: line-rule-and-kept-lines/kept-line-whitespace-decided] [fixture:
line-rule-and-kept-lines/kept-line-indentation-decided] [fixture:
line-rule-and-kept-lines/kept-line-data-trailing-whitespace] [fixture:
line-rule-and-kept-lines/kept-line-after-kept-gap] [fixture:
line-rule-and-kept-lines/kept-line-ignored-semicolon] [fixture:
line-rule-and-kept-lines/kept-line-unclosed-directive] [fixture:
line-rule-and-kept-lines/kept-line-use-tabs] [test: kanban:
semicolon-line-crlf-trailing-whitespace]

Input
([line-rule-and-kept-lines/style-segment-input.mmd](../tests/fixtures/kanban/line-rule-and-kept-lines/style-segment-input.mmd)):

```mmd
kanban
 S
   A[style:#x;] %% c;
```

Output
([line-rule-and-kept-lines/style-segment-output.mmd](../tests/fixtures/kanban/line-rule-and-kept-lines/style-segment-output.mmd)):

```mmd
kanban
  S
    A[style:#x;] %% c;
```

### Trailing whitespace

Whitespace at the end of a line is dropped where it is not in the Db: after a
shape (`S[x]   `), after an icon (`::icon(z)  `), after a data block
(`A[y]@{ticket: X}   `), and after a closed string (`A["Work"]  `). It stays
where the Db keeps it: after a bare id (`S   ` is the id `S   `, and so is the
space before a shape or a data block), in a class (`:::c   `), in a comment, and
inside labels, icons, data blocks, directives, and the continuation lines of
multi-line values. This is the distinction of [mindmap](./mindmap.md#node-text),
with the data block added. On a kept line the same holds. [test: kanban:
bare-trailing-trim] [test: kanban: closed-trailing-trim] [test: kanban:
closed-whitespace-trim] [fixture: trailing-whitespace/class-trailing-trim]
[fixture: trailing-whitespace/lex-after-quoted-spaces] [fixture:
trailing-whitespace/kept-line-kept]

### Line terminators

A CRLF and a lone CR are line breaks to mermaid.js, as an LF is (the
specification's [Line terminators](../../spec/docs/common.md#line-terminators)),
also inside a label, an icon, a directive, and a data block. Prettier converts
them before the plugin reads the text, and the output has the line ending of the
`endOfLine` option, with the same lines. The printer has no rule of its own for
it. [test: kanban: crlf-to-lf] [test: kanban: cr-to-lf] [test: kanban:
multiline-data-crlf] [test: kanban: multiline-data-cr] [test: kanban:
crlf-in-multiline-values] [test: a kanban diagram with other line endings]

### Whitespace characters

In the indentation of an ordinary line, a tab, a U+00A0, a U+FEFF, a U+3000, a
vertical tab, a form feed, a U+2028, and a U+2029 are each one character, and
each is replaced by one space (or one tab with `useTabs`); see
[Indentation](#indentation). Inside a label, an icon, a data block, a bare id,
and a class they are characters of the text and stay
(`A\u00a0B[x\ufeff\t\u3000y]`). A U+0085 is text, not whitespace, and stays. A
U+2028 and a U+2029 are not line breaks: `S[x\u2028y]` is one node. A file that
starts with a U+FEFF keeps it, as Prettier handles it before the plugin. [test:
kanban: whitespace-values] [test: kanban: nel-is-text] [test: kanban:
ls-is-value] [test: kanban: ps-is-value] [test: kanban: ls-bare-value] [test:
kanban: ls-data-value] [test: kanban: ps-icon-value] [test: kanban: leading-bom]

A diagram comment ends at a U+2028 or a U+2029 as at a line feed, and the
separator and the whitespace after it count as the indentation of the next node
(`S[x]%% c\u2028   A`: `A` is indented by 4 characters, the separator and 3
spaces). The printer keeps such a comment and the separator as written, and
writes after the separator the whitespace that makes up the indentation of the
node (see [Indentation](#indentation)). The same holds on a line that holds a
`;`: the node after the separator is a line of its own, so `S[x]%% c;`, U+2028,
and ` T` print the comment, the separator, and `T` as an item, and the `;` in
the comment does not join `T` to the line. A comment line (`%% c\u2029   A`) is
removed with the text up to the line feed, so `A` there is part of the comment;
the printer aligns the comment line and keeps its text. A separator after a
class text and before the line feed ends the class outside its value and is
dropped (`:::c\u2028`). [test: kanban: comment-ls-split-count] [test: kanban:
div-between-real-comments-ls-node] [test: kanban:
div-between-real-comments-ps-node] [test: kanban: div-header-comment-ls-node]
[test: kanban: div-header-comment-ps-node] [test: kanban: lex-icon-comment-ls]
[test: kanban: db-metadata-comment-ls] [test: kanban: shape-comment-ps] [test:
kanban: common-comment-ps-swallows-suffix] [test: kanban:
class-separator-empty-tail] [test: kanban:
comment-ls-then-item-on-semicolon-line] [test: kanban:
semicolon-line-comment-ps-then-directive-line] [test: kanban:
semicolon-line-comment-ls-then-empty-line] [test: kanban:
semicolon-line-two-comments-then-item] [test: kanban:
semicolon-line-comment-ls-then-semicolon-node] [test: kanban:
semicolon-line-empty-data-then-comment-ls] [test: kanban:
semicolon-line-icon-comment-ls-then-item] [test: kanban:
semicolon-line-comment-ls-between-items] [test: kanban:
comment-ps-then-section-on-semicolon-line] [test: kanban:
semicolon-in-a-comment-with-text-after-it]

### Semicolons

A `;` is a character of text in a kanban board: no `;` separates statements.
`S;T` is one node with the id `S;T`, `A["x;y"]` has a `;` in the label, `;`
alone is a node, and `:::c;d` has a `;` in the class. The printer keeps every
`;`, the ones that the line rule of mermaid.js ignores included (see
[Line rule and kept lines](#line-rule-and-kept-lines)); dropping one, or
splitting a line at it, would change a written text or its reading. A `;` right
after a shape is not part of the shape and is rejected (`S[x];`). [fixture:
semicolons/values] [fixture: semicolons/semicolon-remove]

Input
([semicolons/values-input.mmd](../tests/fixtures/kanban/semicolons/values-input.mmd)):

```mmd
kanban
 S;T
   A["x;y"]
   ;
   :::c;d
```

Output
([semicolons/values-output.mmd](../tests/fixtures/kanban/semicolons/values-output.mmd)):

```mmd
kanban
  S;T
    A["x;y"]
    ;
    :::c;d
```

### Keyword case

A board is detected by `kanban` in lower case: `KANBAN` is rejected (see
[When a diagram is not formatted](../README.md#when-a-diagram-is-not-formatted)).
The marker of an icon is read in any case, and the printer keeps the case
written (`::ICON(x)`, `::Icon(y)`). Words that are statements in other diagram
types, `title`, `accTitle`, `accDescr`, `style`, `classDef`, `columns`, `space`,
`end`, and the C4 words (`C4Container`), are ordinary node text here and are
printed as written. Nothing is changed in the case, as in
[mindmap](./mindmap.md#keyword-case). [fixture: keyword-case/icon-case]
[fixture: keyword-case/case-lower-icon] [fixture:
keyword-case/lower-case-header] [fixture: keyword-case/keywords-ordinary]
[fixture: keyword-case/lex-c4-c4container-id]

Input
([keyword-case/icon-case-input.mmd](../tests/fixtures/kanban/keyword-case/icon-case-input.mmd)):

```mmd
kanban
 S
   A
 ::ICON(x)
 ::Icon(y)
```

Output
([keyword-case/icon-case-output.mmd](../tests/fixtures/kanban/keyword-case/icon-case-output.mmd)):

```mmd
kanban
  S
    A
    ::ICON(x)
    ::Icon(y)
```

### Frontmatter YAML

The YAML between the `---` lines is formatted by Prettier's YAML formatter, and
the `---` lines are kept as written, as in the other diagram types (see
[Frontmatter](./compatibility.md#frontmatter)). A frontmatter that is not valid
YAML, one whose `---` lines are indented, one that holds a `<` which may start
an HTML tag, and one whose formatted YAML would hold a `---` line stay as
written. Whitespace after the closing `---` stays too. A comment or a directive
between the frontmatter and the header stays, and the board after it is
formatted as usual. This permission to format does not reach a data block, which
stays as written (see [Data blocks](#data-blocks)). [fixture:
frontmatter-yaml/formatted] [fixture: frontmatter-yaml/frontmatter-malformed]
[fixture: frontmatter-yaml/frontmatter-indented-kept] [fixture:
frontmatter-yaml/frontmatter-html-tag-kept] [fixture:
frontmatter-yaml/delimiter-line-kept] [test: kanban:
closing-delimiter-whitespace-kept] [fixture:
frontmatter-yaml/comment-and-directive]

Input
([frontmatter-yaml/formatted-input.mmd](../tests/fixtures/kanban/frontmatter-yaml/formatted-input.mmd)):

```mmd
---
title:    T
config: {kanban: {ticketBaseUrl: "https://example.com/#TICKET#"}}
---
kanban
 S
```

Output
([frontmatter-yaml/formatted-output.mmd](../tests/fixtures/kanban/frontmatter-yaml/formatted-output.mmd)):

```mmd
---
title: T
config: { kanban: { ticketBaseUrl: "https://example.com/#TICKET#" } }
---
kanban
  S
```

### Multi-line values

A label, an icon, and a data block may run over several lines, and the line
breaks and the whitespace in them are in the Db (the label of `A["x`, a line
break, and ` y"]` holds the line break and the space). The printer keeps every
line of such a value as written, with the columns of its continuation lines, a
comment line or a directive inside it, and an empty line inside it. Only the
first line of a decoration is aligned (see
[Icons and classes](#icons-and-classes)). It does not join the lines, since a
line break in a value is a character of it and joining would change the Db or
make another node. [fixture: multi-line-values/labels-and-icon] [fixture:
multi-line-values/multiline-join] [fixture:
multi-line-values/multiline-icon-trim-unsafe] [fixture:
multi-line-values/lex-label-empty-line] [fixture:
multi-line-values/lex-label-directive-line] [fixture:
multi-line-values/lex-metadata-blank-line]

`printWidth` has no effect: a long bare node
(`This is a deliberately long kanban item ...`) and a long label stay on their
lines, since a bare node cannot be wrapped without becoming other nodes, and a
value is text. [fixture: multi-line-values/long-line-kept] [fixture:
multi-line-values/small-print-width]

Input
([multi-line-values/labels-and-icon-input.mmd](../tests/fixtures/kanban/multi-line-values/labels-and-icon-input.mmd)):

```mmd
kanban
 S
   A[x
 y]
   B["p
 q"]
   C["`r
 s`"]
 ::icon(fa
  fa-star)
```

Output
([multi-line-values/labels-and-icon-output.mmd](../tests/fixtures/kanban/multi-line-values/labels-and-icon-output.mmd)):

```mmd
kanban
  S
    A[x
 y]
    B["p
 q"]
    C["`r
 s`"]
    ::icon(fa
  fa-star)
```

### Final newline

The output ends with one line break, the one of the `endOfLine` option, after
the last line: `kanban`, a line break, and ` S` without a final line break print
`  S` and a line break. An empty board is `kanban` and a line break. The spaces
at the end of a last bare id are part of the id and stay (`S   ` prints with its
spaces, then the line break). When a directive that is not closed reaches the
end of the text, it takes the rest, and the printer adds nothing after it. In
Markdown, the indentation of the code fence or of its list item is the
indentation of the host, and is not part of the indentation of the board.
[fixture: final-newline/accepted] [fixture: final-newline/no-final-lf] [fixture:
final-newline/empty-board] [fixture: final-newline/open-directive-at-eof]

Input
([final-newline/empty-board-input.mmd](../tests/fixtures/kanban/final-newline/empty-board-input.mmd)):

```mmd
kanban
```

Output
([final-newline/empty-board-output.mmd](../tests/fixtures/kanban/final-newline/empty-board-output.mmd)):

```mmd
kanban
```
