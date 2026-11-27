# Kanban formatting rules

Japanese version: [kanban.ja.md](./kanban.ja.md)

How prettier-plugin-mmd formats a kanban board. Each rule below keeps what
mermaid.js reads from the board; where a change would alter it, the text is kept
as written, and the rule says where. Where a rule is the same as in a mindmap,
it says so, and the reason is in the mindmap rules.

A kanban board has columns with cards as their children (see the
[kanban tree](../../spec/docs/ast/kanban.md)). The Db has, for each node,
whether it is a section and which section it belongs to, and it has no
indentation. The node on the first line sets the indentation of the sections: a
node written at that indentation is a section, and every other node is an item
of the section before it, however deep it is written. A deeper item is no child
of the item before it. The printer reads columns from Diagram.body and cards
from each column’s children, keeps every line in source order and preserves its
role, and chooses the indentation (see [Indentation](#indentation)).

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
The parser follows the specification, not mermaid.js, so it also rejects forms
that mermaid.js accepts: an empty icon (`::icon()`), an empty class line
(`:::`), and an empty string or markdown string inside a shape (`S[""]`) (known
divergence
[`tokenless-empty-forms`](../../spec/docs/known-divergences/tokenless-empty-forms.md)).
The printer does not delete them: a rejected board is left as written, and no Db
of mermaid.js decides it. A whitespace-only icon, class, or label, a node
written `""` outside a shape, and an empty data block (`A@{}`) are accepted and
formatted, and the parser also accepts a data block with invalid YAML as opaque
text, although mermaid.js rejects it (known divergence
[`embedded-data-opaque`](../../spec/docs/known-divergences/embedded-data-opaque.md)),
and keeps it without checking or repairing it. The rejected inputs of the
conformance corpus are checked by `corpus/kanban.test.ts`.

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
and `A` and `B` with 4.

[fixture: indentation/sections-and-items] [fixture:
indentation/written-indentation-dropped] [fixture:
indentation/first-section-at-the-first-column] [fixture:
indentation/items-at-any-depth]

A step is what Prettier's `useTabs` and `tabWidth` options say: two spaces by
default, one tab with `useTabs`. Every whitespace character before a node is one
character of its indentation, a tab, a U+00A0, a U+3000, and a U+FEFF included
(see [Whitespace characters](#whitespace-characters)), and the printer writes
only the characters of the options, so the indentation of every line is of one
kind of character.

[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs] [test:
kanban: tab-one-space] [test: kanban: indent-whitespace-kind] [test: kanban:
ls-indent-one-space] [test: kanban: ps-indent-count]

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
makes up the rest.

[fixture: directives/leading-directive-indentation-decided] [fixture:
directives/wide-whitespace-after-directive] [fixture:
directives/leading-directive-gap-shortened] [fixture:
line-rule-and-kept-lines/kept-line-indentation-decided] [fixture:
blank-lines/div-between-comment-blank] [test: kanban: selected-ls-column-short]
[test: kanban: selected-ps-column-wide] [test: kanban: selected-ls-card-short]
[test: kanban: selected-ps-card-wide] [test: kanban: selected-icon-ls-column]
[test: kanban: selected-icon-ps-card] [test: kanban: selected-data-ls-column]
[test: kanban: selected-data-ps-card] [test: kanban: selected-column-zero]
[test: kanban: selected-card-tabs] [test: kanban: selected-column-directive]
[corpus fixture: kanban/lex-indent-comment-ls-selected-semicolon-touching]
[corpus fixture: kanban/lex-indent-comment-ps-selected-semicolon-touching]
[corpus fixture:
kanban/lex-indent-comment-ps-selected-semicolon-indent-directive]

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

The header `kanban` stands at the first column. A header at the first column is
easier to find than an indented one. Text after `kanban` on the header line is
read as a node line, with the whitespace between as its indentation: in
`kanban   S[x]` the node `S[x]` is the first node, and so a section. The printer
moves it to a line of its own and indents it as any section: `kanban`, a line
break, and `  S[x]`. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
gives that step: the header opens a block with no closing line, and a section is
a line inside it, one level deeper, as Prettier prints the lines inside a block.
The same holds when the node touches the header, as in `kanban[S]` or `kanban-x`
(`  [S]`, `  -x`). Everything after `kanban` moves with it, a `%%` that is text
of the node included (`kanban S %% literal` prints `  S %% literal` on its
line). A header line that holds a directive keeps it with the node (see
[Directives](#directives)), and one that holds a `;` is no exception: the word
`kanban` holds nothing that the line rule reads, so the node moves with its `;`
(`kanban S;T` prints `kanban` and `  S;T`; see
[Line rule and kept lines](#line-rule-and-kept-lines)).

[fixture: header/inline-count] [fixture: header/header-column] [fixture:
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

Read sections from Diagram.body and their items from children. These roles
reflect the input: the node on the first line sets the indentation of the
sections, a node at that indentation starts a section, and every other node is
an item of the section before it, however deep it is written. An item written
deeper than the item before it (`A`, then a deeper `B`) is not a child of it. So
the printer prints the nodes in the order written, one per line, and it does not
nest items under other items, merge, sort, or join nodes: two sections with the
same id stay two sections, items at any depth are printed at the one depth of an
item, and a last line that is shallower than the first section is printed as an
item (see [Indentation](#indentation)). Nesting items under other items,
merging, sorting, or joining would change the board that mermaid.js builds.

[fixture: nodes-one-per-line/flat-order] [fixture:
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
match the opener: `S[x)` is accepted, and `S[x]` would give the same Db. This
holds for every family of shapes (`S[x]`, `A(y)`, `B((z))`, `C{{q}}`, `D)w(`,
`E))v((`, and the dash spellings `F-)"bang"(-` and `G(-"cloud"-)`), and for a
shape with no id (`[S]`).

[fixture: shapes/mismatched] [fixture: shapes/matching-closer] [fixture:
shapes/shape-families] [fixture: shapes/shape-alone] [fixture:
shapes/db-shape-square] [fixture: shapes/db-shape-round] [fixture:
shapes/db-shape-circle] [fixture: shapes/db-shape-hexagon] [fixture:
shapes/db-shape-bang] [fixture: shapes/db-shape-bang-alt] [fixture:
shapes/db-shape-cloud] [fixture: shapes/db-shape-cloud-alt] [fixture:
shapes/db-shape-mismatched] [fixture: shapes/lex-shape-dash-bare] [fixture:
shapes/lex-shape-dash-string]

The whitespace between the id of a card and its shape is dropped: `A [x]` is
printed `A[x]`. The Db keeps it as part of the id, but the card is drawn the
same (see
[Mindmap texts that are drawn the same](./compatibility.md#mindmap-texts-that-are-drawn-the-same)).
The whitespace between the id of a column and its shape stays: `S [x]` has the
id `S ` with the space, and mermaid.js tells two columns apart by their ids, so
`todo [A]` and `todo[B]` are two columns, while `todo[A]` and `todo[B]` would be
one, drawn differently.

[fixture: shapes/id-before-shape] [fixture: shapes/card-id-before-shape-dropped]

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

A label is printed bare (`A[x y]`; a plain string `B["x y"]` loses its quotes,
see [Quotes](#quotes)) or as markdown (`C["`x y`"]`). The whitespace inside a
label is in the Db and stays, and so do whitespace-only labels (`S[ ]`,
`A[" "]`). The spaces and tabs at the ends of a bare label are dropped:
`S[  x  ]` is printed `S[x]`, since mermaid.js draws the same node without them
(see
[Mindmap texts that are drawn the same](./compatibility.md#mindmap-texts-that-are-drawn-the-same)).
A quote is the start of a string only right after the opener, so `D[ "x" ]` has
the bare text `"x"` with its quotes and the spaces around it, and the printer
does not move them. Entities (`a#35;b`) and HTML attributes (`<a href="x">`) are
text and stay, and so does a node written `""` or `"``"` outside a shape. Entity
placeholders remain in the Db until mermaid.js renders them, so entity spellings
stay: decoding or re-encoding them changes that stored form. For bare nodes that
look like empty strings, mermaid.js stores the quotes and backticks in both ids
and labels; removing them changes or removes a node, so those characters stay.
Neither change falls under a documented Db exception.

[corpus fixture: kanban/db-grid-entity-item-label-quoted] [corpus fixture:
kanban/db-empty-string-node] [corpus fixture: kanban/db-empty-markdown-node]

[fixture: labels/forms] [fixture: labels/inner-whitespace-trim] [fixture:
labels/leading-space-quote] [fixture: labels/whitespace-only-forms] [fixture:
labels/bare-empty-spellings] [fixture: labels/lex-style-entity-two-semicolons]
[fixture: labels/db-grid-html-attribute-item-label-quoted] [fixture:
labels/db-grid-entity-item-label-quoted]

The printer does not quote, pad, encode, or decode a label, and trims only the
spaces and tabs at the ends of a bare label. Bare labels covered by
[Mindmap texts that are drawn the same](./compatibility.md#mindmap-texts-that-are-drawn-the-same)
can lose their end spaces and tabs without changing the node that mermaid.js
draws. [Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives no
padding just inside a shape written with parentheses or square brackets (`S[x]`,
`A(y)`, `B((z))`), as Prettier prints none inside parentheses and square
brackets. `A[x y]` and `A["x y"]` have the same Db, and the form is the one of
[Quotes](#quotes). A space after the closing quote of a string (`S["x" ]`) is
rejected, so it is never a form to print (see
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
    B[x y]
    C["`x y`"]
    D[ "x" ]
```

### Quotes

The label of a shape in quotes is printed without them, as the examples in the
documentation of mermaid.js write it (see
[The quotes of a text](./compatibility.md#the-quotes-of-a-text)):
`col["Todo list"]` is printed `col[Todo list]`. The label keeps its quotes where
a label without quotes would end earlier or be read as a closer or an opener: a
label with a `)`, a `]`, a `(`, or a `}`; a label that starts with a `-`
(`card6("-x")`, since `(-` opens another shape, and a `-` before a `)` closes
one); a string next to a dash of the dash form (`card4(-"x"-)`); a label with
padding or a line break. A string after the opener `(-` loses its quotes, since
mermaid.js reads `card8(-x)` as it reads `card8(-"x")`. A label with a `:` and a
`;` keeps its quotes by the correction of
[rule 3](./printed-form.md#3-a-spelling): without them, `A[aStyle:#x;yb]` looks
like a card that holds a style. A markdown string stays as written. Directives
between the string and the dash change nothing, since mermaid.js removes them
before it reads the text: `card7("x"%%{init: {}}%%-)` keeps its quotes, and
`card9(-%%{init: {}}%%"y z")` loses them.

[fixture: quotes/labels-without-quotes] [fixture:
quotes/labels-that-need-quotes] [fixture:
quotes/dash-closer-after-a-directive-kept] [fixture:
quotes/dash-opener-string-unquoted] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-upper]

Input
([quotes/labels-without-quotes-input.mmd](../tests/fixtures/kanban/quotes/labels-without-quotes-input.mmd)):

```mmd
kanban
  col["Todo list"]
    card1["Write docs"]
    card2["x"]
    card3[x]
```

Output
([quotes/labels-without-quotes-output.mmd](../tests/fixtures/kanban/quotes/labels-without-quotes-output.mmd)):

```mmd
kanban
  col[Todo list]
    card1[Write docs]
    card2[x]
    card3[x]
```

### Icons and classes

A decoration line decorates the node line written last before it, whatever its
indentation, so its indentation is no part of the Db. The printer puts every
decoration line at the column of the node line it decorates. In ` S`, `   A`,
and `::icon(x)` at the first column, the icon decorates `A` and is printed with
4 characters of indentation, those of an item; after a node line that is
shallower than the first node, which is an item too, the icon follows that node
(`    S`, `  A`, and ` ::icon(x)` print `A` and the icon with 4 characters).

[fixture: icons-and-classes/aligned] [fixture:
icons-and-classes/decorations-align] [fixture:
icons-and-classes/gram-shallower-then-decoration] [fixture:
icons-and-classes/db-decoration-icon-section] [fixture:
icons-and-classes/gram-decoration-then-child]

The text of a decoration stays as written: the case of the marker (`::ICON(y)`),
the whitespace inside an icon and a class, and a second icon or class after the
first. The spaces and tabs at the ends of an icon and of a class are dropped:
`::icon( x )` is printed `::icon(x)`, and `::: hot ` is printed `:::hot`.
mermaid.js keeps the text after `:::` as the class of the node
([`decorateNode`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L202-L214))
and passes no class on to what it draws
([`getData`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/kanban/kanbanDb.ts#L54-L97)),
so the board is the same, and a space or a tab does not belong to a class name
in HTML. A class or an icon of only whitespace is printed as one space, which is
the least that keeps it (an empty one is rejected), so `::icon(  )` is printed
`::icon( )` and `:::` followed by two spaces is printed `:::` followed by one.

[fixture: icons-and-classes/gram-whitespace-icon] [fixture:
icons-and-classes/gram-whitespace-class]

A class line with a directive anywhere on it (`::: hot %%{x}%%`,
`::: h%%{x}%%ot`, `%%{x}%%::: hot`): a line with a directive is printed as
written (see [Directives](#directives)). Only spaces and tabs are dropped: `:::`
followed by spaces and a U+00A0 is printed with the U+00A0 next to the `:::`,
and it stays.

[fixture: icons-and-classes/class-padding-after-marker-dropped] [fixture:
icons-and-classes/class-with-directive-kept] [test: kanban:
class-spaces-then-no-break-space] [test: kanban: class-padding-then-u2028]
[test: kanban: class-padding-then-u2029]

A later icon replaces an earlier one in the Db, and both are kept, because the
printer drops no text. The printer never moves a decoration onto the line of its
node, because that changes the board: after a bare node an icon makes a round
shape of its text and the rest part of the id (`A ::icon(x)` is the node
`A ::icon` with the label `x`), a class becomes part of the id (`A :::c` is the
id `A :::c`), and after a shape both are rejected (`S[x] ::icon(star)`, see
[When a diagram is not formatted](../README.md#when-a-diagram-is-not-formatted)).
Classes and the icons of sections do not show in the Db that the tests compare,
but they are kept as well.

[fixture: icons-and-classes/icon-after-bare] [fixture:
icons-and-classes/class-after-bare] [fixture:
icons-and-classes/icon-appended-to-bare-is-a-shape] [fixture:
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
opaque, with its delimiters and its content retained (the colon of a key stays
as written: `A@{ ticket : MC-1 }` keeps the space before its colon; see
[A text that the tree holds whole](./printed-form.md#a-text-that-the-tree-holds-whole)),
apart from the uniform indentation below, the spaces at the ends of a block on
one line, and the printing of a block on one line on lines where its line is too
long: it does not format the YAML, and it does not merge, reorder, or repair
blocks, whether a block is empty (`A@{}`), has an unknown or duplicate key
(`A@{ticket: X, ticket: Y}`), is not valid YAML (`A@{assigned: [a}`), or runs
over several lines. The parser accepts a block whose YAML is invalid, although
mermaid.js rejects it (known divergence
[`embedded-data-opaque`](../../spec/docs/known-divergences/embedded-data-opaque.md)),
because the block is embedded text that the specification reads as opaque.

[fixture: data-blocks/data-opaque] [fixture: data-blocks/empty-data] [fixture:
data-blocks/data-invalid-yaml] [fixture: data-blocks/data-unknown-duplicate]
[fixture: data-blocks/gram-metadata-ticket-duplicate] [fixture:
data-blocks/data-multiline] [fixture: data-blocks/gram-metadata-empty-multiline]
[fixture: data-blocks/db-metadata-comment-line] [fixture:
data-blocks/db-metadata-ticket-false] [fixture:
data-blocks/db-metadata-assigned-zero] [fixture:
data-blocks/db-metadata-quoted-brace] [fixture: data-blocks/data-line-rule-gap]

A block on one line is printed with one space inside each end, as in
[Data blocks](./flowchart.md#data-blocks): `A@{ticket: X}` becomes
`A@{ ticket: X }`. Where its line is too long it prints on lines, one entry on
each, under the conditions listed there, which a node text that fills the line
before the block does not meet, a form decided under
[rule 4](./printed-form.md#4-where-none-of-these-rules-gives-a-form) (see
[Forms decided under rule 4](./printed-form.md#forms-decided-under-rule-4)). The
block stays as written in the cases listed there.

[fixture: data-blocks/long-split] [fixture:
data-blocks/long-prefix-too-long-kept] [fixture: data-blocks/one-line-padded]
[fixture: data-blocks/one-line-space-only-padded] [fixture:
data-blocks/one-line-directive-kept] [fixture:
data-blocks/one-line-kept-line-kept] [fixture:
data-blocks/one-line-touching-blocks-kept] [fixture:
data-blocks/one-line-surrounding-trivia] [fixture:
data-blocks/one-line-padded-zero-width] [fixture:
data-blocks/compat-document-marker-data-block-kept] [fixture:
data-blocks/one-line-document-marker-after-space-padded] [test: data blocks:
kanban one line with U+2028 inside] [test: data blocks: kanban one line with
U+2029 inside] [test: data blocks: kanban one line with no-break spaces at the
ends]

A card whose block is on one line and that ends with directives is printed by
both rules in one formatting: the block gets one space inside each end, and the
spaces and tabs after the last directive are left out (see
[Trailing whitespace](#trailing-whitespace)), so formatting the output again
changes nothing. The block does not stay as written because of those spaces and
tabs. This holds for a directive that is closed and for one that is not closed,
which runs to the end of the text, for a card with a shape and for one without,
and for directives that touch the block, that follow each other, or that also
start the card. A block whose line is too long is not split where a directive
follows its `}`, as in [Data blocks](./flowchart.md#data-blocks): it is printed
on its line with one space inside each end. A block over several lines is not
padded, and the whitespace after the last directive of its card stays as
written, as on any continuation line of a multi-line value (see
[Trailing whitespace](#trailing-whitespace)).

[fixture: data-blocks/one-line-padded-closed-directive-blanks] [fixture:
data-blocks/one-line-padded-closed-directive-tab] [fixture:
data-blocks/one-line-padded-closed-directive-blanks-end-of-text] [fixture:
data-blocks/one-line-padded-open-directive-blanks-end-of-text] [fixture:
data-blocks/one-line-padded-open-directive-tab-end-of-text] [fixture:
data-blocks/one-line-padded-bare-id-directive-blanks] [fixture:
data-blocks/one-line-padded-touching-directive-blanks] [fixture:
data-blocks/one-line-padded-two-directives-blanks] [fixture:
data-blocks/one-line-padded-leading-directive-blanks] [fixture:
data-blocks/one-line-padded-tab-inside-directive-blanks] [fixture:
data-blocks/one-line-padded-long-directive-blanks] [fixture:
data-blocks/multiline-directive-blanks-kept]

Apply the safety conditions of [Data blocks](./flowchart.md#data-blocks). When a
newline immediately follows `@{`, shift every body line by the same number of
ASCII spaces to put the shallowest text one level inside its node. A section's
body is two levels below the header, an item's three; nested YAML keeps its
relative indentation. A separate `}` aligns with the node, even if it had no
margin; a closer after text stays on that line.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the depth of
that separate closing `}` when the block opens on the node's line: the closing
line stands at the level of the opening line, as Prettier prints the closing
line of a block. A `}` after the text of a literal or folded scalar (`|`, `|-`,
`|+`, `>`, `>-`, and `>+`) stays on its line: on a line of its own it changes
the end of the text of the scalar in the Db, and formatting does not change the
Db. The drawing is the same, but no kind of exception that
[How the printed form is decided](./printed-form.md#the-check-and-formatting-that-changes-the-db)
defines covers that gap. The formatter does not look at the kind of scalar, so a
`}` after the text of a plain scalar stays too.

[fixture: data-blocks/section-and-item-margins] [fixture:
data-blocks/nested-yaml] [fixture: data-blocks/closing-after-text] [fixture:
data-blocks/closing-after-literal-text] [fixture:
data-blocks/closing-after-folded-text] [fixture:
data-blocks/closing-after-strip-text] [fixture:
data-blocks/closing-after-keep-text] [fixture:
data-blocks/closing-after-folded-strip-text] [fixture:
data-blocks/closing-after-folded-keep-text]

Move space-only lines by the same amount, making them empty when no spaces
remain, and leave empty lines empty: Prettier leaves no spaces or tabs on an
empty line, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) keeps
an empty line outside a scalar empty when the surrounding text lines move. Keep
trailing spaces: literal block scalars read both their trailing spaces and
blank-line widths, so discarding them can change the Db.

[fixture: data-blocks/scalar-blank-lines] [fixture:
data-blocks/scalar-blank-lines-outdent]

Keep columns when the shared conditions fail: inline-opening text counts its
first margin from `@{`, embedded directives keep their columns, kept lines must
stay whole, and `tabWidth: 0` supplies no inner step. Tab-indented YAML is
rejected by Mermaid; moving column-zero document markers can also make it fail.

[fixture: data-blocks/inline-opening-kept] [fixture:
data-blocks/directive-inside-kept] [fixture: data-blocks/kept-body-line]
[fixture: data-blocks/zero-width-kept] [fixture:
data-blocks/document-start-kept]

With `useTabs`, the lines of the block move as without it, indented with spaces.
The node line takes the indentation that its role gives it, which is not printed
as written because mermaid.js reads it as the level of the node (see
[Indentation](#indentation)), so the statement cannot be printed as written as
in the other diagram types (see [Data blocks](./flowchart.md#data-blocks)). The
lines then stand right where a tab is as wide as `tabWidth`, whatever the author
wrote, and off by the difference at any other width, while lines left as written
would stand right only where the indentation of the author happens to fit the
width of a tab.

[fixture: data-blocks/tab-statement-space-body] [fixture:
data-blocks/use-tabs-empty-lines-kept] [fixture:
data-blocks/use-tabs-folded-empty-lines-kept]

Comments, directives and blank lines outside the block retain their own rules. A
comment line and a directive line stand at the level of the lines around them,
as [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts every line
inside a block, whatever it holds (see [Comments](#comments)). CRLF and CR
follow `endOfLine`; Unicode separators inside values remain characters.

[fixture: data-blocks/surrounding-trivia] [test: kanban: multiline-data-crlf]
[test: kanban: multiline-data-cr] [test: data blocks: kanban U+2028]

Where a block is attached is part of the syntax. The block touches the closing
of a shape (`A[x]@{ticket: X}`), and a space there is rejected. After a bare id,
the spaces before the block are part of the id, so `A  @{ticket: X}` has the id
`A  `. Blocks that follow each other touch (`A[x]@{ticket: X,}@{assigned: Ada}`:
mermaid.js joins their interiors), with a directive between them at most
(`A@{ticket: X,}%%{init: {}}%%@{assigned: Ada}`), and a space between two blocks
is rejected. The printer keeps all of this as written.

[fixture: data-blocks/data-space-after-shape] [fixture:
data-blocks/data-space-after-bare] [fixture: data-blocks/data-space-before-kept]
[fixture: data-blocks/adjacent] [fixture: data-blocks/data-adjacent-gap]
[fixture: data-blocks/data-adjacent-directive] [fixture:
data-blocks/data-empty-adjacent]

A node with two blocks, as in `A@{`, a line break, `ticket: A,`, a line break,
and `}@{assigned: Ada}`, keeps both as written: the blocks touch, so Mermaid
joins their text, and moving the lines of the first alone makes accepted YAML
fail. The same holds when one of the two blocks is a single line.

[fixture: data-blocks/adjacent-multiline-kept] [fixture:
data-blocks/adjacent-single-line-after-kept] [fixture:
data-blocks/adjacent-single-line-before-kept]

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
start and at the end of the board are dropped, where no other rule keeps the gap
as written (see the gap with a diagram comment below), as in the other diagram
types: `kanban`, two empty lines, and ` S` print `kanban` and `  S`. Prettier
prints a run of empty lines as one and drops the empty lines at the start and at
the end of a block, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives that for the
board. Prettier drops blank lines at the start of a text, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) omits empty lines
before the `kanban` header. Whitespace after `kanban` on a header line with
nothing else is dropped, whatever the character (a space, a tab, a U+00A0, a
U+3000, a U+FEFF, a form feed, a vertical tab, a U+2028, a U+2029).

[fixture: blank-lines/collapsed] [fixture: blank-lines/blank-body-end] [fixture:
blank-lines/gram-grid-lf-header-line] [fixture:
blank-lines/decoration-blank-runs-collapsed] [fixture:
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
by another diagram comment, or by a U+2028 or U+2029 in the read text is kept
whole as written: its empty lines and its comments, up to the indentation of the
next statement, which the printer chooses (see [Indentation](#indentation)). A
separator counts only where it ends the comment or stands before the last line
feed of the gap; one after that line feed, in the indentation of the statement,
does not make the gap a kept one (see [Comments](#comments)). A comment line
takes the whitespace before it, a line of a separator or an empty line included,
out of the text that mermaid.js reads, so one of those that stands before a
comment line does not keep the gap either: the separator goes, and the gap is
printed as any gap, with one empty line where the source holds a line of a
separator or an empty line, and none right after the header line (see
[Comments](#comments)). A gap with only comment lines (`S`, `%% note`, an empty
line, `A`) is formatted as usual, and the comment line is aligned (see
[Comments](#comments)). A common comment after a directive containing a line
feed, or after a native `%%` comment, is still removed before this decision and
aligned as usual; a U+2028 or U+2029 inside that common comment is removed too
and cannot make the gap stay as written.

[test: kanban: comment-line-ls-taken] [test: kanban: ls-ends-comment-kept]
[test: kanban: ls-own-line-after-comment-kept] [test: kanban:
ls-indentation-after-comment] [fixture:
blank-lines/common-comment-after-multiline-directive] [fixture:
blank-lines/native-then-common-comment] [test: kanban: separator line before a
comment line is dropped, one empty line stays] [test: kanban: separator line
before a comment line after the header leaves no empty line]

A gap of this kind at the end of the board is kept whole too, with nothing after
it to indent: `kanban`, ` S`, `%%`, and two empty lines print `  S`, `%%`, and
the same two empty lines.

[fixture: blank-lines/div-between-comment-blank] [fixture:
blank-lines/div-comment-blank-before-icon] [fixture:
blank-lines/div-comment-blank-before-class] [fixture:
blank-lines/blank-comment-accepted] [fixture:
blank-lines/comment-blank-trailing] [fixture:
blank-lines/blank-comment-text-accepted] [fixture:
blank-lines/common-comment-after-directive] [test: kanban:
selected-before-blank-line] [test: kanban: selected-terminal-separator]

Directly after the header, mermaid.js rejects an empty line after `kanban`, and
whitespace at the end of the header line, while the specification accepts them.
The printer drops them, so mermaid.js accepts the output, with the Db of the
specification. An empty line after the diagram comments that follow the header
stays, by the rule above: `kanban`, `%%`, `%%`, an empty line, and `S` are
rejected by mermaid.js as input and as output, and after one `%%` both accept
the text, so the gap is kept. A rejected text has no Db of mermaid.js, so these
are no before-and-after comparisons of a Db.

[fixture: blank-lines/div-header-comments-blank] [fixture:
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
the first column; its mark and its text are kept as written. In the body this
shows which statement the comment is about.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) puts a standalone
comment line inside a block one level deeper than the line that opens it, as
Prettier prints the lines inside a block. In `kanban`, `%% c1`, ` S`,
`       %% c2`, `   A`, `%% c3`, the comments stand with 2, 4, and 4 characters
of indentation, those of `S` and `A`. A comment line inside a multi-line label
or data block is removed by mermaid.js and stays on its authored line, with
eligible data-block margins following [Data blocks](#data-blocks).

[fixture: data-blocks/indented-comment-line]

A diagram comment that is followed by an empty line, by another comment, or by a
U+2028 or U+2029 that ends it or stands before the last line feed of the gap
stays as written with the gap after it (see [Blank lines](#blank-lines)), unless
a comment line follows, which removes the whitespace before it.

[fixture: comments/comments-align] [fixture:
comments/bare-brace-comments-aligned] [fixture: comments/header-leading-comment]
[fixture: comments/comment-line-in-value]

A U+2028 or U+2029 in the indentation of the line after a diagram comment that a
line feed ends is one character of that indentation (see
[Whitespace characters](#whitespace-characters)), so it does not keep the gap:
`S[x]  %% c`, a line feed, a U+2028, and three spaces and `A` print `S[x] %% c`
and `A` with the indentation of its place, and so do a comment after the header,
after the shape of a card, after an icon, and after a data block. A separator
that ends the comment, one on a line of its own after the comment, and an empty
line after the comment keep the gap as written, unless a comment line follows
the last two, which removes the whitespace before it, the line of the separator
or the empty line included: `S[x]  %% c`, a line feed, a U+2028, a line feed,
`%% d`, and `  A` print `S[x] %% c`, an empty line, `%% d`, and `A`, the last
two with the indentation of their place, and a separator in the indentation of
the comment line, or before its `%%`, is dropped. A comment line before the
separator line takes nothing with it: `S[x]  %% c`, `%% d`, a line of a U+2028,
and `A` stay as written.

[test: kanban: ls-indentation-after-comment-after-closed-directive] [test:
kanban: ls-indentation-after-unclosed-directive-kept] [test: kanban:
ls-indentation-after-comment-with-ignored-semicolon] [test: kanban:
ls-indentation-after-comment-with-two-ignored-semicolons] [test: kanban:
ls-indentation-after-two-comment-lines] [test: kanban:
ls-indentation-after-comment-and-whitespace-line-kept] [test: kanban:
comment-at-end-of-text-without-line-feed] [test: kanban:
node-named-end-after-comment-and-ls-indentation] [test: kanban:
ls-indentation-after-comment] [test: kanban: ps-indentation-after-comment-tab]
[test: kanban: ls-indentation-after-comment-header] [test: kanban:
ls-indentation-after-comment-card-shape] [test: kanban:
ls-indentation-after-comment-icon] [test: kanban:
ls-indentation-after-comment-data-block] [test: kanban: ls-ends-comment-kept]
[test: kanban: ls-own-line-after-comment-kept] [test: kanban:
ls-indentation-after-comment-and-blank-line-kept] [test: kanban:
ls-line-then-comment-line-header] [test: kanban: ls-line-then-comment-line]
[test: kanban: ps-line-then-comment-line-card-shape] [test: kanban:
ls-line-then-comment-line-icon] [test: kanban:
ps-line-then-comment-line-data-block] [test: kanban:
comment-line-then-ls-line-kept] [test: kanban:
comment-line-then-ps-line-kept-data-block] [test: kanban:
ls-in-comment-line-indentation] [test: kanban:
ps-before-comment-line-mark-card-shape]

A diagram comment after the header, a shape, an icon, or a data block stays on
its line. A run of spaces and tabs before it becomes one space.
[Rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives one space
before a comment that stands after something on its line, as Prettier prints
`x = 1;   // c` as `x = 1; // c`. `S[x]   %% c` prints `S[x] %% c`.

A comment that touches what precedes it stays touching. `A[y]%% d` is not
changed. After a bare id, in a label, and in a class, `%%` is a character of the
text (`S %% x`, `A[%% y]`, `:::c %% z`), and a line that starts with `#` or with
a single `%` is node text; the printer does not touch these. A comment line is
removed with the text up to the line feed, and a U+2028 or a U+2029 on it does
not end it: the text after the separator is part of the removed comment, and the
printer keeps it there.

[fixture: comments/inline] [fixture: comments/header-comment-gap] [fixture:
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
directive back, when it does not. The gaps keep their size where they can; what
does not fit carries nothing that the Db reads. In `kanban`, ` S`, and
`      %%{init: {}}%%  A`, the node `A` is an item and is indented by 8
characters, 6 before the directive and 2 after it; it gets 4, 2 before the
directive and the 2 after it. In `    %%{a}%%  %%{b}%%   A` the gaps are 2 and 3
and `A` gets 4, so the last gap is shortened to 2, and nothing stands before the
first directive. A directive between two units of a line
(`A  %%{init: {}}%%  B[x]`), between data blocks, inside an id, an icon, a
class, or a markdown label, a directive that is not closed, and its line joins
stay exactly as written.

[fixture: directives/leading-directive-kept] [fixture:
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
directive before the header stands at the first column.

[fixture: directives/standalone] [fixture:
directives/standalone-directive-align] [fixture:
directives/header-directive-inline] [fixture:
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
the `;` in the label is ignored and the label is `style:#x y`.

[fixture: line-rule-and-kept-lines/line-rule-comment-after-label-kept] [fixture:
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
semicolon-line-crlf-trailing-whitespace] [test: kanban: after-shape-ls-column]
[test: kanban: after-icon-ps-card] [test: kanban: after-data-ls-card] [test:
kanban: before-shape-ps-column] [test: kanban: before-data-ls-column] [test:
kanban: both-data-ps-column] [test: kanban: selected-before-blank-line] [test:
kanban: selected-terminal-separator]

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

Whitespace at the end of a line is dropped where the node is drawn the same
without it (see
[Mindmap texts that are drawn the same](./compatibility.md#mindmap-texts-that-are-drawn-the-same)):
after a shape (`S[x]   `), after an icon (`::icon(z)  `), after a data block
(`A[y]@{ticket: X}   `), after a closed string (`A["Work"]  `), after the bare
id of a card (`A   ` is printed `A`), and after a class (`:::c   `). It stays
where the Db keeps it and the figure depends on it: after the bare id of a
column (`S   ` is the id `S   `, and so is the space before its shape), in a
comment, and inside labels, icons, data blocks, directives, and the continuation
lines of multi-line values. This is the distinction of
[mindmap](./mindmap.md#node-text), with the data block added, and with the id of
a column kept. On a kept line the same holds. On the line of a card, the spaces
and tabs after the last directive are left out, and the run of spaces and tabs
before each directive is printed as one space, unless a directive of the line
holds a line break or a `;` (see
[Directives that hold a line break or a semicolon](./compatibility.md#directives-that-hold-a-line-break-or-a-semicolon)
and
[Texts after a keyword that are drawn the same](./compatibility.md#texts-after-a-keyword-that-are-drawn-the-same)):
`A[x]  %%{y}%%  ` is printed `A[x] %%{y}%%`, and `A[x] %%{y}%%  %%{z}%%  ` is
printed `A[x] %%{y}%% %%{z}%%`. A whitespace character that is no space or tab
(U+000B, U+000C, a no-break space, U+1680, U+2000 to U+200A, U+2028, U+2029,
U+202F, U+205F, U+3000, or U+FEFF) after a directive, text after a directive of
a card with a bare id, and a comment after the last directive keep the line as
written, the spaces after the directive included: `A[x] %%{y}%%`, U+3000, and
two spaces, `t %%{x}%% u` and two spaces, and `A[x] %%{y}%%`, two spaces,
`%% c`, and two spaces are not changed. A no-break space or U+3000 before the
first directive stays as it is, with the spaces after the last directive left
out. Prettier omits spaces and tabs at the end of a line, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) also removes them
after the last directive of a card when a no-break space or U+3000 before the
first directive stays. On the line of a column, the line stays as written where
it holds a directive: `A[x] %%{y}%%` and two spaces, `A %%{y}%%` and two spaces,
and the same with a tab are not changed.

[fixture: trailing-whitespace/directives-end-blanks-dropped] [test: a tab after
the directive that ends the text of a card] [test: a tab before the directive
that ends the text of a card] [test: spaces before and after the directive that
ends the text of a card] [test: a no-break space before the directive that ends
the text of a card] [test: U+3000 before the directive that ends the text of a
card] [test: a no-break space after the directive that ends the text of a card]
[test: U+3000 after the directive that ends the text of a card] [test: tabs
around the directive that ends the bare id of a card] [test: U+2003 after the
directive that ends the text of a card] [test: U+2002 after the directive that
ends the text of a card] [test: U+2028 after the directive that ends the text of
a card] [test: a comment and spaces after the directive of a card] [test: a tab
after the directive on the line of a column] [test: U+3000 before the first
directive that ends the text of a card, with spaces after the last] [test: a
no-break space between two directives that end the text of a card] [test: U+3000
between two directives that end the text of a card] [test: U+3000 after the last
of two directives that end the text of a card] [test: U+3000 and spaces after
the directive of a card] [test: text after the directive of a bare card, with
spaces at the end] [test: text between two directives of a bare card, with
spaces at the end] [test: two spaces before the first directive of a bare card
whose text follows it] [test: spaces after the directive on the line of a column
with a shape] [test: spaces after the directive on the line of a column with a
bare id] [test: a whitespace character that is no space or tab after the
directive that ends the text of a card] [test: kanban: bare-trailing-trim]
[test: kanban: closed-trailing-trim] [test: kanban: closed-whitespace-trim]
[fixture: trailing-whitespace/class-trailing-trim] [fixture:
trailing-whitespace/lex-after-quoted-spaces] [fixture:
trailing-whitespace/kept-line-kept]

### Line terminators

A CRLF and a lone CR are line breaks to mermaid.js, as an LF is (the
specification's [Line terminators](../../spec/docs/common.md#line-terminators)),
also inside a label, an icon, a directive, and a data block. Prettier converts
them before the plugin reads the text, and the output has the line ending of the
`endOfLine` option, with the same lines. The printer has no rule of its own for
it.

[test: kanban: crlf-to-lf] [test: kanban: cr-to-lf] [test: kanban:
multiline-data-crlf] [test: kanban: multiline-data-cr] [test: kanban:
crlf-in-multiline-values] [test: a kanban diagram with other line endings]

### Whitespace characters

In the indentation of an ordinary line, a tab, a U+00A0, a U+FEFF, a U+3000, a
vertical tab, a form feed, a U+2028, and a U+2029 are each one character, and
each is replaced by one space (or one tab with `useTabs`); see
[Indentation](#indentation). Inside a label, an icon, a data block, a bare id,
and a class they are characters of the text and stay
(`A\u00a0B[x\ufeff\t\u3000y]`). The Db of mermaid.js keeps internal Unicode
whitespace in an icon and in the id and label of a bare node, so those
characters stay. Replacing them with ASCII spaces changes the stored values and
falls outside the changes to end spaces and tabs allowed by
[Mindmap texts that are drawn the same](./compatibility.md#mindmap-texts-that-are-drawn-the-same).
A U+0085 is text, not whitespace, and stays. A U+2028 and a U+2029 are not line
breaks: `S[x\u2028y]` is one node. A file that starts with a U+FEFF keeps it, as
Prettier handles it before the plugin.

[corpus fixture: kanban/db-grid-ideographic-item-icon] [corpus fixture:
kanban/lex-nbsp-bare-value]

[test: kanban: whitespace-values] [test: kanban: nel-is-text] [test: kanban:
ls-is-value] [test: kanban: ps-is-value] [test: kanban: ls-bare-value] [test:
kanban: ls-data-value] [test: kanban: ps-icon-value] [test: kanban: leading-bom]

A diagram comment ends at a U+2028 or a U+2029 as at a line feed, and the
separator and the whitespace after it count as the indentation of the next node
(`S[x]%% c\u2028   A`: `A` is indented by 4 characters, the separator and 3
spaces). The printer keeps such a comment and the separator as written, and
writes after the separator the whitespace that makes up the indentation of the
node (see [Indentation](#indentation)). Unlike a
[mindmap](./mindmap.md#line-separators), which writes a line break there, the
printer keeps the separator, because it is one character of the indentation of
the next node and keeping it rebuilds no comment region. Writing a line break
and one more space would give the same Db, so keeping the boundary is a
conservative choice, not a forced one. The same holds on a line that holds a
`;`: the node after the separator is a line of its own, so `S[x]%% c;`, U+2028,
and ` T` print the comment, the separator, and `T` as an item, and the `;` in
the comment does not join `T` to the line. A comment line (`%% c\u2029   A`) is
removed with the text up to the line feed, so `A` there is part of the comment;
the printer aligns the comment line and keeps its text. A separator after a
class text and before the line feed ends the class outside its value and is
dropped (`:::c\u2028`).

[test: kanban: comment-ls-split-count] [test: kanban:
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

mermaid.js removes a comment line that follows the separator, with the
whitespace and the directives before it, and the line of the node goes on after
it (common.md, Comment). So the indentation of the node is the separator and the
whitespace after the comment line, and a directive after the comment line starts
the line of the node, as in [Directives](#directives). The printer keeps the
separator, the comment line, and what stands before it as written, and prints
the line of the node with the indentation of its role, less the separator. In a
section, the gap after the directive is shortened when it does not fit, down to
nothing with `useTabs`: `%%{x}%%C`. A directive and a comment on the line of the
separator, with the node on the next line, are such a comment line too.

[test: kanban: comment-line-then-directive-item] [test: kanban:
comment-line-then-indented-directive-item] [test: kanban:
directive-and-comment-line-then-item] [test: kanban:
directive-comment-line-directive-item] [test: kanban:
selected-comment-line-then-directive-item] [test: kanban:
comment-line-then-directive-section] [test: kanban:
comment-line-then-directive-section-tabs] [test: kanban:
comment-line-then-directive-section-zero]

### Semicolons

A `;` is a character of text in a kanban board: no `;` separates statements.
`S;T` is one node with the id `S;T`, `A["x;y"]` has a `;` in the label, `;`
alone is a node, and `:::c;d` has a `;` in the class. The printer keeps every
`;`, the ones that the line rule of mermaid.js ignores included (see
[Line rule and kept lines](#line-rule-and-kept-lines)); dropping one, or
splitting a line at it, would change the text that the Db holds or which `;` the
line rule ignores. A `;` right after a shape is not part of the shape and is
rejected (`S[x];`).

[fixture: semicolons/values] [fixture: semicolons/semicolon-remove]

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
printed as written. Nothing is changed in the case.

[fixture: keyword-case/icon-case] [fixture: keyword-case/case-lower-icon]
[fixture: keyword-case/lower-case-header] [fixture:
keyword-case/keywords-ordinary] [fixture: keyword-case/lex-c4-c4container-id]

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

The YAML between the `---` lines is formatted by Prettier's YAML formatter, as
Prettier does for YAML anywhere
([rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)), and the `---`
lines are kept as written (see [Frontmatter](./compatibility.md#frontmatter)). A
frontmatter that is not valid YAML, one whose `---` lines are indented, one that
holds a `<` which may start an HTML tag, and one whose formatted YAML would hold
a `---` line stay as written. Whitespace after the closing `---` stays too. A
comment or a directive between the frontmatter and the header stays, at the
first column; the board after it is formatted as usual. YAML formatting does not
reach a data block; only its eligible margins move (see
[Data blocks](#data-blocks)).

[fixture: frontmatter-yaml/formatted] [fixture:
frontmatter-yaml/frontmatter-malformed] [fixture:
frontmatter-yaml/frontmatter-indented-kept] [fixture:
frontmatter-yaml/frontmatter-html-tag-kept] [fixture:
frontmatter-yaml/delimiter-line-kept] [test: kanban:
closing-delimiter-whitespace-kept] [fixture:
frontmatter-yaml/comment-and-directive] [fixture:
frontmatter-yaml/comment-and-directive-indented]

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

A label and an icon may run over several lines, and the line breaks and the
whitespace in them are in the Db (the label of `A["x`, a line break, and ` y"]`
holds the line break and the space). The printer keeps every line of such a
value as written, with the columns of its continuation lines, a comment line or
a directive inside it, and an empty line inside it. Only the first line of a
decoration is aligned (see [Icons and classes](#icons-and-classes)). It does not
join the lines, since a line break in a value is a character of it and joining
would change the Db or make another node.

[fixture: multi-line-values/labels-and-icon] [fixture:
multi-line-values/multiline-join] [fixture:
multi-line-values/multiline-icon-trim-unsafe] [fixture:
multi-line-values/lex-label-empty-line] [fixture:
multi-line-values/lex-label-directive-line] [fixture:
multi-line-values/lex-metadata-blank-line]

Multiline data blocks instead follow [Data blocks](#data-blocks): preserve their
line breaks and contents with only the eligible uniform margin change.

[fixture: data-blocks/data-multiline]

`printWidth` has no effect on a long bare node
(`This is a deliberately long kanban item ...`) or a long label: they stay on
their lines, since a bare node cannot be wrapped without becoming other nodes,
and a value is text. A data block on one line is the exception: where its line
is wider than `printWidth`, it prints on lines under the conditions of
[Data blocks](#data-blocks), a form decided under
[rule 4](./printed-form.md#4-where-none-of-these-rules-gives-a-form).

[fixture: multi-line-values/long-line-kept] [fixture:
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
`  S` and a line break. Prettier ends a text with one line break and no blank
line, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the
board that ending. An empty board is `kanban` and a line break. The exception is
a gap that stays whole under [Blank lines](#blank-lines) at the end of the
board: the output then ends with that gap, and the printer adds a line break
after it only where it does not end with one: `kanban`, ` S`, a line of `%%`, an
empty line, and a line of one space print `  S`, `%%`, the empty line, and the
line of one space with a line break after it. Prettier ends a file with one line
break, so [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the
line break after a final comment too, which the printer adds where the text ends
without one, also where it ends with a U+2028 or a U+2029. The spaces at the end
of a last bare id are part of the id and stay (`S   ` prints with its spaces,
then the line break). When a directive that is not closed reaches the end of the
text, it takes the rest up to its last character that is no whitespace; U+2028,
U+2029, U+0085, U+180E, and U+200B are no whitespace here. On a line of its own,
the whitespace after that character is dropped: U+0009 to U+000D (the tab, the
line breaks, the vertical tab, and the form feed), U+0020, U+00A0, U+1680,
U+2000 to U+200A, U+202F, U+205F, U+3000, and U+FEFF, and with them the empty
lines; one line break ends the text; nothing is added only where the text ends
right after the character and it is no U+2028 or U+2029. Prettier ends a text
with one line break. When terminal spaces and tabs are removed from an
unfinished directive on a line of its own,
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the final line
break. `%%{unfinished` and two spaces print `%%{unfinished` and a line break,
and `%%{unfinished` and U+2028 print `%%{unfinished`, U+2028, and a line break.
Prettier ends a text with one line break, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives a final line
break after the retained U+2028 or U+2029 at the end of an unfinished directive.
On the line of a column, the whitespace after the directive stays up to the
first line break instead: `S[x] %%{unfinished` and two spaces print as written,
with a line break after them, and `S[x] %%{unfinished` with nothing after it is
not changed. On the line of a card, the spaces and tabs after the directive are
dropped and any other whitespace character stays, and one line break ends the
text: `A[x] %%{unfinished` and two spaces print `A[x] %%{unfinished` and a line
break, and `A[x] %%{unfinished`, a no-break space, and nothing else print the
no-break space after it and a line break, and `A[x] %%{unfinished`, U+3000, and
two spaces print them as written, with a line break after them. Prettier ends a
text with one line break, so
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the final line
break after a card line that holds an unfinished directive. After the comment of
a statement or of the header line, a last line of whitespace that holds no
U+2028 or U+2029, that has no line break after it and no empty line before it is
left out (`S[x] %% c`, a line break, and a line of two spaces print `S[x] %% c`
and a line break), while one that a line break follows stays, and so does one
after an empty line, with a line break added after it (`S[x] %% c`, a line
break, an empty line, and a line of two spaces print `S[x] %% c`, the empty
line, and the line of two spaces with a line break after it). Prettier omits
blank lines at the end of a text and leaves one final line break. For the
whitespace-only line with no U+2028 or U+2029, no following line break, and no
preceding empty line, [rule 1](./printed-form.md#1-the-whitespace-beside-a-mark)
therefore gives the omission and the line break after the comment. A last line
that holds a U+2028 or a U+2029, alone or beside whitespace, stays after the
comment of the header line and of a statement, a column or a card, with a line
break added after it where none follows (`S[x] %% c`, a line break, and a U+2028
print the comment, the line of the U+2028, and a line break). Prettier ends a
text with one line break. For a retained last line that holds U+2028 or U+2029
after a header or statement comment,
[rule 1](./printed-form.md#1-the-whitespace-beside-a-mark) gives the missing
final line break without replacing the retained character. After a comment line
with text, every last line of whitespace is left out, one that holds a U+2028 or
a U+2029 too (`S[x]`, a line break, `%% c`, a line break, and a U+2028 print
`S[x]` and `%% c`, each followed by a line break), and after a line of `%%`
only, a last line that holds a U+2028 or a U+2029, alone or beside whitespace,
stays as written with the gap before it, and so does a last line of whitespace
that a line break follows or an empty line precedes (the gap stays whole, see
[Blank lines](#blank-lines)), while a last line of whitespace with neither is
left out and the `%%` is aligned (`S[x]`, a line of `%%`, a line break, and one
space print `S[x]`, the `%%` aligned, and a line break). On the header line, an
open directive takes the rest as on a line of its own: `kanban %%{unfinished`
and two spaces print `kanban %%{unfinished` and a line break. In Markdown, the
indentation of the code fence or of its list item is the indentation of the
host, and is not part of the indentation of the board.

[fixture: final-newline/accepted] [fixture: final-newline/no-final-lf] [fixture:
final-newline/empty-board] [fixture: final-newline/open-directive-at-eof]
[fixture: final-newline/open-directive-at-eof-trailing-blanks] [fixture:
final-newline/open-directive-at-eof-after-statement] [fixture:
final-newline/comment-gap-without-final-line-break] [test: an open directive
with nothing after it] [test: an open directive followed by two spaces] [test:
an open directive followed by a tab] [test: an open directive followed by a
no-break space] [test: an open directive followed by U+3000] [test: an open
directive followed by U+FEFF] [test: an open directive followed by a vertical
tab] [test: an open directive followed by a form feed] [test: an open directive
followed by a line break] [test: an open directive followed by CR and LF] [test:
an open directive followed by spaces and a line break] [test: an open directive
followed by empty lines] [test: an open directive followed by a line break and
spaces] [test: an open directive followed by U+2028] [test: an open directive
followed by U+2029] [test: an open directive followed by a space and U+2028]
[test: an open directive followed by U+2028 and a space] [test: an open
directive followed by U+0085] [test: an open directive followed by U+200B]
[test: an open directive followed by U+180E] [test: an open directive followed
by U+2003] [test: an open directive followed by U+1680] [test: an open directive
followed by U+2000] [test: an open directive followed by U+200A] [test: an open
directive followed by U+202F] [test: an open directive followed by U+205F]
[test: an open directive on the line of a column and with nothing after it]
[test: an open directive on the line of a column and followed by two spaces]
[test: an open directive on the line of a column and followed by a tab] [test:
an open directive on the line of a column and followed by a no-break space]
[test: an open directive on the line of a column and followed by spaces and a
line break] [test: an open directive on the line of a column and followed by
empty lines] [test: an open directive on the line of a column and followed by a
line break and spaces] [test: an open directive on the line of a column and
followed by U+2028] [test: an open directive on the line of a column and
followed by U+2028 and a space] [test: an open directive on the line of a card
with nothing after it] [test: an open directive on the line of a card followed
by two spaces] [test: an open directive on the line of a card followed by a tab]
[test: an open directive on the line of a card followed by a no-break space]
[test: an open directive on the line of a card followed by U+3000] [test: an
open directive on the line of a card followed by U+3000 and two spaces] [test:
an open directive on the line of a card followed by U+2003] [test: an open
directive on the line of a card followed by spaces and a line break] [test: an
open directive on the line of a card followed by a line break and spaces] [test:
an open directive on the line of a card followed by U+2028] [test: an open
directive on the line of a card followed by U+0085] [test: an open directive on
the line of a card with a bare id and followed by two spaces] [test: an open
directive on the line of a column with a bare id and followed by two spaces]
[test: an open directive on the line of a column and followed by U+2029] [test:
an open directive on the line of a column and followed by U+3000] [test: an open
directive on the line of a column and followed by U+FEFF] [test: an open
directive on the line of a column and followed by U+2003] [test: an open
directive on the line of a column and followed by a vertical tab] [test: an open
directive on the line of a column and followed by a form feed] [test: an open
directive on the line of a column and followed by CR and LF] [test: an open
directive on the line of a column and followed by U+0085] [test: an open
directive on the line of a column and followed by U+180E] [test: an open
directive on the line of a column and followed by U+200B] [test: a final line of
%% alone, two empty lines, and a space in a kanban board] [test: a final line of
%% alone and U+2029 in a kanban board] [test: a final comment with text and
U+2029 in a kanban board] [test: a final comment after a statement and a last
line of two spaces without a line break in a kanban board] [test: a final
comment after a statement and a last line of a U+2028 without a line break in a
kanban board] [test: a final comment after a statement and a last line of a
U+2029 without a line break in a kanban board] [test: a final comment after a
statement, an empty line, and a last line of a U+2028 in a kanban board] [test:
a final comment after a statement and a last line of one space after a line
break in a kanban board] [test: a final comment after a statement and a last
line of a tab without a line break in a kanban board] [test: a final comment
after a statement and a last line of a no-break space without a line break in a
kanban board] [test: a final comment with text and empty lines in a kanban
board] [test: a final comment after a statement, an empty line, and a last line
of one space in a kanban board] [test: a final comment after a statement, two
empty lines, and a last line of two spaces in a kanban board] [test: a final
comment on the header line and a last line of one space without a line break in
a kanban board] [test: a final comment on the header line and a last line of one
space after a line break in a kanban board] [test: a final comment on the header
line, an empty line, and a last line of one space in a kanban board] [test: a
final comment on the header line and a last line of a U+2028 without a line
break in a kanban board] [test: a final comment on the header line and a last
line of a U+2029 without a line break in a kanban board] [test: a final comment
after a card and a last line of a U+2028 without a line break in a kanban board]
[test: a last line of a U+2028 after a line of %% alone in a kanban board]
[test: a last line of a space and a U+2028 after a line of %% alone in a kanban
board] [test: a last line of a U+2029 and a space after a line of %% alone in a
kanban board] [test: a final comment after a statement and a last line of a
space and a U+2028 without a line break in a kanban board] [test: a last line of
one space without a line break after a line of %% alone in a kanban board]
[test: a last line of one space after a line break, after a line of %% alone in
a kanban board] [test: a last line of a U+2029 after a line of %% alone in a
kanban board] [test: a last line of a U+2028 after a final comment on a line of
its own in a kanban board] [test: a last line of a U+2029 after a final comment
on a line of its own in a kanban board] [test: a last line of a space and a
U+2028 after a final comment on a line of its own in a kanban board] [test: a
last line that holds a U+2028 or a U+2029, alone or beside whitespace, a final
comment after a statement in a kanban board] [test: a last line that holds a
U+2028 or a U+2029, alone or beside whitespace, a final comment after a card in
a kanban board] [test: a last line that holds a U+2028 or a U+2029, alone or
beside whitespace, a final comment after a card with a data block in a kanban
board] [test: a last line that holds a U+2028 or a U+2029, alone or beside
whitespace, a final comment after an icon line in a kanban board] [test: a last
line that holds a U+2028 or a U+2029, alone or beside whitespace, a final
comment on the header line of a kanban board] [test: a last line that holds a
U+2028 or a U+2029, alone or beside whitespace, a final line of %% alone in a
kanban board] [test: a last line that holds a U+2028 or a U+2029, alone or
beside whitespace, a final comment on a line of its own in a kanban board]
[test: a last line of one space after an empty line and a line break after a
final comment on a line of its own in a kanban board] [test: an open directive
on the header line of a kanban board] [test: an open directive on the header
line of a kanban board and empty lines] [fixture:
blank-lines/comment-blank-trailing] [test: kanban: selected-terminal-separator]

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
