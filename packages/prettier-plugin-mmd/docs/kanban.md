# Kanban formatting rules

Japanese version: [kanban.ja.md](./kanban.ja.md)

How prettier-plugin-mmd formats kanban, following the absolute levels and flat
node list of the [kanban tree](../../spec/docs/ast/kanban.md). Each rule keeps
the specified Db and written embedded text. Known divergences have the specified
reading, rather than an invented raw mermaid Db.

The linked input and output examples are formatting fixtures. Every rule cites
its fixed cases; whitespace that cannot be shown in Markdown uses escaped test
strings. See [Documents and fixtures](./development.md#documents-and-fixtures).

## Rules

### Indentation

Keep each node’s absolute indentation count, including zero and uneven steps;
replace each indentation character by one space, or one tab with `useTabs`.
`tabWidth` does not change the count. Absolute `level` is in the Db, so shifting
the first section or expanding tabs changes it; choosing one character kind
makes ordinary indentation consistent. Inline-directive lines, kept segments,
and protected gaps retain their written indentation under the corresponding
rules. [fixture: directives/leading-directive-kept] [fixture:
line-rule-and-kept-lines/style-segment] [fixture:
blank-lines/div-between-comment-blank] [fixture: indentation/absolute-counts]
[fixture: indentation/indentation-common-shift] [test: kanban: tab-one-space]
[test: kanban: indent-whitespace-kind] [test: kanban: ls-indent-one-space]
[fixture: indentation/spaces-to-tabs-count] [test: kanban: ps-indent-count]
[fixture: indentation/tab-width-4] [fixture: indentation/use-tabs]

Input
([indentation/absolute-counts-input.mmd](../tests/fixtures/kanban/indentation/absolute-counts-input.mmd)):

```mmd
kanban
      S
          A
             B
      T
```

Output
([indentation/absolute-counts-output.mmd](../tests/fixtures/kanban/indentation/absolute-counts-output.mmd)):

```mmd
kanban
      S
          A
             B
      T
```

### Header

Put `kanban` at column one. Move a first node on the header line to its own line
with its original post-header indentation count, even when a touching shape
gives count zero. This shares the usual header layout while preserving absolute
levels. A kept semicolon segment overrides relocation; an inline directive moves
with the complete suffix. [fixture: header/inline-count] [fixture:
header/header-column] [fixture: header/header-touching-shape] [fixture:
header/header-percent-in-text] [fixture: header/header-only-lf] [fixture:
header/header-space-only] [fixture: header/header-touching-dash] [test: kanban:
header-tab-inline] [test: kanban: header-nbsp-count] [test: kanban:
header-bom-count]

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

Print the flat node list in source order, one node per line, keeping repeated
ids, equal-level sections, deeper items, and a final shallower item. Do not
infer nested items, merge definitions, sort, or join lines: these operations
change the board or its values. [fixture: nodes-one-per-line/flat-order]
[fixture: nodes-one-per-line/deeper-to-regular-items] [fixture:
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

Keep the written opener and closer, including mismatches, shapes without ids,
and dash spellings. Keep whitespace between a bare id and its shape: it belongs
to the id. Matching a closer can leave the summary equal, but changes the
author’s structure, as in [mindmap](./mindmap.md#shapes). [fixture:
shapes/mismatched] [fixture: shapes/matching-closer] [fixture:
shapes/id-before-shape] [fixture: shapes/shape-families] [fixture:
shapes/shape-alone] [fixture: shapes/db-shape-square] [fixture:
shapes/db-shape-round] [fixture: shapes/db-shape-circle] [fixture:
shapes/db-shape-hexagon] [fixture: shapes/db-shape-bang] [fixture:
shapes/db-shape-bang-alt] [fixture: shapes/db-shape-cloud] [fixture:
shapes/db-shape-cloud-alt] [fixture: shapes/db-shape-mismatched] [fixture:
shapes/lex-shape-dash-bare] [fixture: shapes/lex-shape-dash-string]

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

Keep bare, quoted, and markdown label forms and every value character, including
whitespace-only values, quotes after leading spaces, entities, escapes, and HTML
attribute spellings. Do not quote, unquote, trim, pad, encode, decode, or
sanitize values: whitespace can change the reading, and equal Db does not
authorize replacing a written form. [fixture: labels/forms] [fixture:
labels/inner-whitespace-trim] [fixture: labels/bare-to-quoted] [fixture:
labels/leading-space-quote] [fixture: labels/space-after-string-invalid]
[fixture: labels/bare-empty-spellings] [fixture: labels/whitespace-only-forms]
[fixture: labels/lex-style-entity-two-semicolons] [fixture:
labels/db-grid-html-attribute-item-label-quoted] [fixture:
labels/db-grid-entity-item-label-quoted]

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

Outside inline-directive lines and kept segments, keep each icon and class on
its own line at its node’s absolute column, preserving order, repeated
decorations, marker case, and all value whitespace. Indentation does not decide
attachment; alignment makes it visible, as in
[mindmap](./mindmap.md#decorations). Appending a decoration can change an id or
reject a shape. Classes and section icons remain even when the summary does not
expose them. [fixture: icons-and-classes/aligned] [fixture:
icons-and-classes/decorations-align] [fixture:
icons-and-classes/icon-after-bare] [fixture: icons-and-classes/class-after-bare]
[fixture: icons-and-classes/icon-after-shape] [fixture:
icons-and-classes/icon-value-trim] [fixture:
icons-and-classes/class-value-trim-summary-only] [fixture:
icons-and-classes/class-after-shape] [fixture:
icons-and-classes/gram-whitespace-class] [fixture:
icons-and-classes/gram-whitespace-icon] [fixture:
icons-and-classes/db-decoration-icon-section] [fixture:
icons-and-classes/db-decoration-icon-twice] [fixture:
icons-and-classes/db-decoration-class-twice] [fixture:
icons-and-classes/gram-decoration-then-child] [fixture:
icons-and-classes/gram-shallower-then-decoration]

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

Keep every `@{ ... }` block opaque, with its delimiters, interior, attachment,
and adjacent blocks or intervening directives exactly as written. A shaped
node’s block touches its closer; spaces before a bare node’s block belong to its
id. Never format YAML, merge, split, reorder, wrap, or repair data, including
empty, unknown, duplicate, falsy, multiline, and invalid contents. Attachment is
grammatical, and even a Db-equal rewrite would violate written embedded text.
[fixture: data-blocks/adjacent] [fixture: data-blocks/data-opaque] [fixture:
data-blocks/data-space-after-shape] [fixture: data-blocks/data-space-after-bare]
[fixture: data-blocks/data-adjacent-gap] [fixture:
data-blocks/data-adjacent-directive] [fixture: data-blocks/data-multiline]
[fixture: data-blocks/empty-data] [fixture: data-blocks/data-invalid-yaml]
[fixture: data-blocks/data-unknown-duplicate] [fixture:
data-blocks/data-space-before-kept] [fixture: data-blocks/data-empty-adjacent]
[fixture: data-blocks/data-line-rule-gap] [fixture:
data-blocks/gram-metadata-ticket-duplicate] [fixture:
data-blocks/gram-metadata-empty-multiline] [fixture:
data-blocks/db-metadata-comment-line] [fixture:
data-blocks/db-metadata-ticket-false] [fixture:
data-blocks/db-metadata-assigned-zero] [fixture:
data-blocks/db-metadata-quoted-brace]

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

Collapse ordinary blank-line runs between statements to one empty line and drop
plain body-edge blank lines and bare-header trailing whitespace. This keeps the
usual compact separation. Preserve complete blank/comment gaps after diagram
comments, including terminal gaps: the known divergence
`blank-line-after-header-or-comments` is not an instruction to repair comment
pairings. Header-only blank removal can make raw-rejected input accepted with
the specified Db; a rejected endpoint has no raw Db. [fixture:
blank-lines/collapsed] [fixture: blank-lines/blank-body-end] [test: kanban:
blank-whitespace] [fixture: blank-lines/blank-comment-accepted] [fixture:
blank-lines/blank-comment-text-accepted] [fixture:
blank-lines/comment-blank-trailing] [fixture:
blank-lines/decoration-blank-runs-collapsed] [fixture:
blank-lines/gram-grid-lf-header-line] [fixture:
blank-lines/div-header-space-node] [test: kanban: header-tab-trailing] [fixture:
blank-lines/div-header-comments-blank] [fixture:
blank-lines/div-between-comment-blank] [fixture:
blank-lines/div-comment-blank-before-icon] [fixture:
blank-lines/div-comment-blank-before-class] [test: kanban: header-bom-trailing]
[test: kanban: header-crlf-trailing] [test: kanban: header-ff-trailing] [test:
kanban: header-ideographic-trailing] [test: kanban: header-ls-trailing] [test:
kanban: header-nbsp-trailing] [test: kanban: header-ps-trailing] [test: kanban:
header-vt-trailing] [test: kanban: lex-tab-whitespace-first] [test: kanban:
lex-bom-whitespace-first] [test: kanban: lex-cr-whitespace-first] [test: kanban:
lex-crlf-whitespace-first] [test: kanban: lex-ideographic-whitespace-first]
[test: kanban: lex-ls-whitespace-first] [test: kanban:
lex-nbsp-whitespace-first] [test: kanban: lex-ps-whitespace-first] [fixture:
blank-lines/header-header-comment-blank] [fixture:
blank-lines/gram-blank-before-icon] [fixture:
blank-lines/common-comment-after-directive]

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

### Comments

Outside inline-directive lines, protected gaps, and kept segments, align
standalone comments with the next statement, or the last statement at EOF, and
column one before the header. Keep marks and text. This shows the following
statement as in [mindmap](./mindmap.md#comments). Keep inline comments inline: a
harmless exterior gap becomes one space where whitespace was written and stays
touching otherwise. Percent pairs in ids, labels, and classes, single
percent/hash node text, and comments inside values/data retain their context;
splitting a common-comment region must not resurrect swallowed text. [fixture:
comments/inline] [fixture: comments/comments-align] [fixture:
comments/header-comment-gap] [fixture: comments/percent-values] [fixture:
comments/comment-line-in-value] [test: kanban: comment-line-ls-taken] [fixture:
comments/comment-after-data-gap] [fixture: comments/comment-after-icon-gap]
[fixture: comments/header-leading-comment] [fixture:
comments/bare-brace-comments-aligned]

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

Keep inline directives and their entire containing node or decoration lines as
written, including indentation and gaps; move a header-line node with its
complete suffix. Align only standalone directives outside values and protected
gaps, as standalone comments. Directive contents, multiline and unclosed forms,
line joins, and semicolon stops stay exact. Removal makes whitespace on both
sides participate in indentation or values, so ordinary gap collapsing is
unsafe. [fixture: directives/standalone] [fixture:
directives/leading-directive-kept] [fixture: directives/id-directive-kept]
[fixture: directives/standalone-directive-align] [fixture:
directives/unclosed-directive] [fixture: directives/header-directive-inline]
[fixture: directives/directive-before-header] [fixture:
directives/db-grid-directive-item-label-markdown] [fixture:
directives/db-grid-directive-item-icon] [fixture:
directives/db-grid-directive-item-class] [fixture:
directives/db-metadata-directive] [test: kanban:
unicode-inline-directive-indentation] [test: kanban:
directive-before-unicode-comment] [test: kanban:
directive-after-unicode-comment]

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

### Line rule and kept lines

Keep complete segments containing semicolons, their indentation, boundaries,
inline comments, removed-directive adjacency, and colon-to-hash whitespace as
written. The shared case-sensitive `style` pass and subsequent `classDef` pass
can ignore the last semicolon of a matching segment even inside values, data, or
comments; changing the segment can select another semicolon. These are not
kanban style statements. Kept segments take precedence over header relocation
and other layout rules. [fixture: line-rule-and-kept-lines/style-segment]
[fixture: line-rule-and-kept-lines/line-rule-kept] [fixture:
line-rule-and-kept-lines/line-rule-colon-space] [fixture:
line-rule-and-kept-lines/line-rule-wrap] [fixture:
line-rule-and-kept-lines/line-rule-comment-move] [fixture:
line-rule-and-kept-lines/line-rule-directive-kept] [fixture:
line-rule-and-kept-lines/line-rule-two-semicolons] [fixture:
line-rule-and-kept-lines/line-rule-id] [fixture:
line-rule-and-kept-lines/line-rule-data] [fixture:
line-rule-and-kept-lines/line-rule-icon] [fixture:
line-rule-and-kept-lines/line-rule-class] [fixture:
line-rule-and-kept-lines/line-rule-comment-to-own-line] [fixture:
line-rule-and-kept-lines/line-rule-classdef-and-style] [test: kanban:
line-rule-ls-segment] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-upper] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-no-hash] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-space] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-other-line] [fixture:
line-rule-and-kept-lines/lex-label-style-rule-two-semicolons]

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

Drop exterior trailing whitespace only after a completed shape, icon, or data
suffix, outside kept regions. Keep bare-id spaces at EOF and before shapes/data,
class whitespace including whitespace-only classes, and whitespace inside
labels, icons, data, comments, directives, and multiline continuations. This is
[mindmap’s value/exterior distinction](./mindmap.md#node-text) extended to data:
significant text must survive. [test: kanban: bare-trailing-trim] [test: kanban:
closed-trailing-trim] [fixture: trailing-whitespace/class-trailing-trim] [test:
kanban: closed-whitespace-trim] [fixture:
trailing-whitespace/lex-after-quoted-spaces]

### Line terminators

Use configured `endOfLine` for CRLF, CR, and LF, including label, icon,
directive, and opaque data contents, through the shared Prettier path. Mermaid
normalizes these endings too; no separate kanban EOL policy is needed. [test:
kanban: crlf-to-lf] [test: kanban: cr-to-lf] [test: kanban: multiline-data-crlf]
[test: kanban: multiline-data-cr] [test: kanban: crlf-in-multiline-values]
[test: a kanban diagram with other line endings]

### Whitespace characters

Replace tab, NBSP, BOM, ideographic space, vertical tab, form feed, U+2028, and
U+2029 one-for-one in ordinary indentation; keep them in values and
inline-directive lines. Keep U+0085 as text. Preserve Unicode separators ending
diagram comments, counting them in the following indentation, and common-comment
regions that swallow their suffixes. Unlike CR/LF they are not general line
terminators; blind conversion changes values or levels. A file-leading BOM
follows shared Prettier handling. A Unicode separator after nonempty class text
and before LF ends its segment outside the value and is dropped. [test: kanban:
ls-is-value] [test: kanban: ps-is-value] [test: kanban: comment-ls-split-count]
[test: kanban: whitespace-values] [test: kanban: nel-is-text] [test: kanban:
ps-icon-value] [test: kanban: leading-bom] [test: kanban:
class-separator-empty-tail] [test: kanban: ls-bare-value] [test: kanban:
ls-data-value] [test: kanban: div-between-real-comments-ls-node] [test: kanban:
div-between-real-comments-ps-node] [test: kanban: div-header-comment-ls-node]
[test: kanban: div-header-comment-ps-node] [test: kanban: lex-icon-comment-ls]
[test: kanban: db-metadata-comment-ls] [test: kanban: shape-comment-ps] [test:
kanban: common-comment-ps-swallows-suffix]

### Rejected inputs

Use the shared failure path for parser-rejected input, including empty forms,
broken delimiters, unattached data, invalid suffixes, token-boundary
divergences, and invalid headers: standalone formatting reports a syntax error
and leaves the file untouched; Markdown declines the embed and leaves it to
Prettier. Do not repair, delete empty values, or add a newline to make a
rejected header valid. Opaque-data rejection by raw mermaid alone does not
authorize content repair. [fixture: rejected-inputs/empty-icon] [fixture:
rejected-inputs/empty-icon-at-section-column] [fixture:
rejected-inputs/empty-class] [fixture: rejected-inputs/empty-shape] [fixture:
rejected-inputs/empty-string-shape] [fixture:
rejected-inputs/empty-markdown-shape] [fixture:
rejected-inputs/empty-description-not-syntax] [fixture:
rejected-inputs/semicolon-after-shape] [fixture:
rejected-inputs/header-only-invalid] [fixture:
rejected-inputs/empty-class-after-shape] [fixture:
rejected-inputs/decoration-before-node] [fixture:
rejected-inputs/data-before-shape-invalid] [fixture:
rejected-inputs/data-standalone-invalid] [fixture:
rejected-inputs/unclosed-directive-semicolon-kept] [fixture:
rejected-inputs/header-directive-inside] [fixture:
rejected-inputs/div-semicolon-opener] [fixture:
rejected-inputs/gram-indent-shallower-followed] [fixture:
rejected-inputs/gram-shape-carryover-doublecircle] [fixture:
rejected-inputs/div-frontmatter-open-tag] [fixture:
rejected-inputs/div-empty-icon-after-shape] [fixture:
rejected-inputs/div-empty-string-before-label] [fixture:
rejected-inputs/div-empty-string-after-label] [fixture:
rejected-inputs/div-empty-markdown-before-label] [fixture:
rejected-inputs/div-empty-markdown-after-label] [fixture:
rejected-inputs/gram-unclosed-shape] [fixture:
rejected-inputs/gram-unclosed-quote] [fixture:
rejected-inputs/gram-unclosed-markdown] [fixture:
rejected-inputs/gram-unclosed-icon] [fixture:
rejected-inputs/gram-decoration-before-node] [fixture:
rejected-inputs/gram-decoration-class-before-node] [fixture:
rejected-inputs/div-directive-data-marker] [fixture:
rejected-inputs/upper-case-header] [fixture: rejected-inputs/space-after-string]
[fixture: rejected-inputs/icon-appended-to-shape] [fixture:
rejected-inputs/space-before-shaped-data] [fixture:
rejected-inputs/space-between-data]

Input
([rejected-inputs/empty-icon-input.mmd](../tests/fixtures/kanban/rejected-inputs/empty-icon-input.mmd)):

```mmd
kanban
 S
   ::icon()
```

Output
([rejected-inputs/empty-icon-output.mmd](../tests/fixtures/kanban/rejected-inputs/empty-icon-output.mmd)):

```mmd
kanban
 S
   ::icon()
```

### Semicolons

Keep every semicolon, including isolated nodes, ids, labels, icons, classes,
data, and characters ignored by the shared line rule. Kanban has no semicolon
statement separator: dropping or splitting one changes written text or its
reading. A plain suffix after a shape can be rejected; an ignored suffix can be
accepted and is still kept. [fixture: semicolons/values] [fixture:
semicolons/semicolon-remove]

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

Keep mixed-case icon markers and ordinary node words as written; detection
requires lower-case `kanban`. Title, accessibility, style, class-definition,
columns, space, end, and C4 spellings do not become printer statements. This
preserves the author’s spelling and the parser’s specified reading, as in
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

Reuse the guarded shared YAML formatter and keep delimiter spelling. Malformed
YAML, indented delimiters, HTML-tag hazards, and formatted delimiter-line
hazards stay as written. Comments/directives between frontmatter and header
stay. Keeping config and the shared guards avoids changing embedded effects;
this permission does not extend to data blocks. [fixture:
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

Keep bare, quoted, and markdown labels, icons, and data over their written
lines, with continuation whitespace, internal comments/directives, and blank
lines intact. Do not join or wrap values or long bare nodes for `printWidth`.
Continuations are value text, so reflow can change the Db or create another
node; opaque embedded text also takes precedence over width. [fixture:
multi-line-values/labels-and-icon] [fixture: multi-line-values/multiline-join]
[fixture: multi-line-values/long-line-kept] [fixture:
multi-line-values/multiline-icon-trim-unsafe] [fixture:
multi-line-values/small-print-width] [fixture:
multi-line-values/lex-label-empty-line] [fixture:
multi-line-values/lex-label-directive-line] [fixture:
multi-line-values/lex-metadata-blank-line]

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

Outside an open directive that reaches EOF, end an accepted formatted board with
the shared configured newline, keeping significant spaces and protected trailing
comment gaps before it. An empty accepted board prints `kanban` and a newline;
rejected bare headers remain failures. This follows the shared file convention
without repairing syntax. Markdown fence/container indentation is host
indentation and must not enter kanban levels. [fixture: final-newline/accepted]
[fixture: final-newline/no-final-lf] [fixture: final-newline/empty-board]

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
