# Kanban

Japanese version: [kanban.ja.md](./kanban.ja.md)

Source of truth in mermaid.js:

- [`kanban.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/parser/kanban.jison)
- [`kanbanDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts)
- [`detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/kanban/detector.ts#L6-L10)

This document covers the diagram type `kanban`. The nodes of the tree are
defined in [ast/kanban.md](../ast/kanban.md). How mermaid.js reads section
membership and metadata effects is in the
[tests package summary](../../../tests/docs/db-summaries.md#kanban).

## Detection

Entry 8 of [detection.md](../detection.md) selects this grammar when the text
after leading trivia starts with lower-case `kanban`. No boundary is required
after it. [fixture: kanban/header-indented] [fixture:
kanban/header-after-blank-lines] [fixture: kanban/header-dash-suffix] [fixture:
kanban/header-non-ascii-suffix] `KANBAN`, `Kanban`, and mixed case match no
detector. [fixture: kanban/header-upper-case] [fixture:
kanban/header-capitalized] [fixture: kanban/header-mixed-case] A word, digit, or
underscore suffix is detected and then rejected by the grammar. [fixture:
kanban/header-word-suffix] [fixture: kanban/header-digit-suffix] [fixture:
kanban/header-underscore-suffix]

Frontmatter, directives, and comment regions before the header follow the common
rules. [fixture: kanban/header-after-frontmatter] [fixture:
kanban/header-after-frontmatter-and-comment] [fixture:
kanban/header-after-comment-line] [fixture: kanban/header-after-directive-line]
A leading line of `%%` alone or `%%{ }%%` is a diagram comment, also before a
blank line. [fixture: kanban/header-after-bare-percent-line] [fixture:
kanban/header-after-empty-braces-line] [fixture:
kanban/header-header-percent-blank] A `#` line or `;` line before the header
prevents detection. [fixture: kanban/header-after-hash-line] [fixture:
kanban/header-after-semicolon-line]

The lexer reads the keyword `kanban` case-insensitively, only when no
[word character](../common.md#notation) follows it. [fixture:
kanban/lex-keyword-kanban-upper] A second header keyword where a unit starts in
the body is rejected. [fixture: kanban/header-twice] [fixture:
kanban/header-twice-indented] [fixture: kanban/header-twice-same-line]
`kanbanX`, `kanban2`, `kanban_`, and `a.kanban` are node text. [fixture:
kanban/lex-keyword-kanban-letter] [fixture: kanban/lex-keyword-kanban-digit]
[fixture: kanban/lex-keyword-kanban-underscore] [fixture:
kanban/lex-keyword-kanban-dash] [fixture: kanban/lex-keyword-kanban-non-ascii]
[fixture: kanban/lex-keyword-after-dot]

The first node may follow the header on its line after whitespace. [fixture:
kanban/header-statement-on-header-line] [fixture:
kanban/header-statement-on-header-line-tab] [fixture:
kanban/header-spaced-word-suffix] A shape or a non-word character, such as `-`,
`:`, `#`, `%`, or a quote, may start the node right after the header. [fixture:
kanban/header-shape-on-header-line] [fixture: kanban/header-dash-suffix]
[fixture: kanban/db-grid-colon-header-line] [fixture:
kanban/db-grid-hash-header-line] [fixture: kanban/db-grid-percent-header-line]
[fixture: kanban/header-header-quote] A lone `{` is no opener and is rejected.
[fixture: kanban/gram-grid-open-brace-header-line]

The header cannot end the text with nothing after it but removed directives and
the appended line feed. [fixture: kanban/header-only] [fixture:
kanban/header-header-directive-only] A line feed in the source, whitespace, a
diagram comment, or a first node may follow it. A board without nodes has an
empty body. [fixture: kanban/header-only-lf] [fixture:
kanban/db-empty-board-comment] [fixture: kanban/db-empty-board-whitespace]
[fixture: kanban/header-header-space-only] [fixture:
kanban/header-header-comment-only-reference] [fixture:
kanban/header-header-space-directive-only]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in converted
form. CRLF and lone CR are line feeds. [fixture: kanban/lex-crlf-quoted-value]
[fixture: kanban/lex-cr-quoted-value] Attribute quotes are single quotes.
[fixture: kanban/db-grid-html-attribute-item-label-quoted] Entities are
placeholders. [fixture: kanban/db-grid-entity-item-label-quoted] [fixture:
kanban/db-grid-entity-named-item-label-bare] Tree values keep the written text.
[fixture: kanban/lex-string-crlf]

The common [comment regions](../common.md#comment-lines) are trivia, also inside
multiline labels and data blocks. [fixture: kanban/lex-comment-quoted-line]
[fixture: kanban/db-metadata-comment-line] An inline `%%` inside node text, a
shape label, or class text stays in that text. [fixture:
kanban/lex-comment-quoted-inline] [fixture: kanban/db-grid-comment-item-id]
[fixture: kanban/db-grid-comment-item-label-bare] [fixture:
kanban/db-grid-comment-item-class]

The common rules keep embedded data opaque. [fixture:
kanban/gram-frontmatter-invalid-yaml] [fixture: kanban/gram-metadata-bad-yaml]
HTML tags are found only after the frontmatter. A tag beginning in frontmatter
does not convert attribute quotes in diagram text. [fixture:
kanban/div-frontmatter-open-tag] [fixture:
kanban/gram-frontmatter-no-tag-reference]

C4 words after the kanban header are read in their kanban positions under
[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md). [fixture:
kanban/lex-c4-c4container-id] [fixture: kanban/lex-c4-c4component-label]
[fixture: kanban/lex-c4-c4dynamic-metadata] [fixture:
kanban/lex-c4-c4deployment-id] Words in removed comments or frontmatter do not
participate in detection. [fixture: kanban/lex-c4-c4container-comment] [fixture:
kanban/lex-c4-c4container-frontmatter] `C4Context` after the header is ordinary
text in both readings. [fixture: kanban/lex-c4-c4context-id]

### Units and contexts

The lexer divides diagram text into **units**. The grammar uses each unit's
name. Its text is the characters read in converted form. [fixture:
kanban/db-decoration-inline] [fixture: kanban/db-name-two-words] [fixture:
kanban/db-grid-keyword-classdef-item-id] [fixture:
kanban/db-grid-comment-item-id] [fixture: kanban/lex-keyword-after-dot] The
lexer starts in the statement context. Leaving a context returns to the previous
one. [fixture: kanban/db-shape-square] [fixture: kanban/db-metadata-all]

At each position the lexer applies the first matching rule of the current
context. When no rule matches, the input is rejected. A text unit takes as many
characters as its rule allows. Keywords and decoration markers inside a node
text are part of that text. [fixture: kanban/db-decoration-inline] [fixture:
kanban/db-name-two-words] [fixture: kanban/db-grid-keyword-classdef-item-id]
[fixture: kanban/db-grid-comment-item-id] [fixture:
kanban/lex-keyword-after-dot]

Whitespace outside values separates units. Indentation counts every whitespace
character other than a line feed once. This includes a tab, form feed, vertical
tab, U+FEFF, U+00A0, U+3000, U+2028, and U+2029. [fixture:
kanban/db-indent-tabs] [fixture: kanban/lex-tab-line-start] [fixture:
kanban/lex-bom-line-start] [fixture: kanban/lex-nbsp-line-start] [fixture:
kanban/lex-ideographic-line-start] [fixture: kanban/lex-ls-line-start] [fixture:
kanban/lex-ps-line-start] [fixture: kanban/header-ff-after] [fixture:
kanban/header-vt-after] [fixture: kanban/lex-indent-directive] U+0085 is not
whitespace. [fixture: kanban/header-nel-after]

U+2028 and U+2029 inside node text, shape text, strings, icons, and data content
are value characters. They do not end statements. [fixture:
kanban/lex-ls-bare-value] [fixture: kanban/lex-ps-bare-value] [fixture:
kanban/lex-ls-quoted-value] [fixture: kanban/lex-ps-quoted-value] [fixture:
kanban/db-grid-ls-item-icon] [fixture: kanban/db-grid-ps-item-icon] [fixture:
kanban/db-grid-ls-metadata-label-quoted] [fixture: kanban/lex-shape-bare-ls]
[fixture: kanban/db-grid-ps-metadata-label-quoted]

Indentation is measured in the text without directives. [fixture:
kanban/lex-indent-directive] For a node on the header line, it is the whitespace
after the header. [fixture: kanban/header-statement-on-header-line] [fixture:
kanban/header-statement-on-header-line-tab] After a U+2028 or U+2029 ending a
diagram comment, indentation starts with that separator. [fixture:
kanban/lex-node-comment-ls] [fixture: kanban/div-header-comment-ps-node]

### Directives inside units

The text units are `node-text`, `shape-text`, `icon-text`, `class-text`, and
data content. The string units are `string` and `markdown-string`. A directive
inside any of these units is trivia. The remaining text keeps its reading,
including whitespace on both sides. [fixture: kanban/db-grid-directive-item-id]
[fixture: kanban/lex-id-directive-start] [fixture: kanban/lex-id-directive-end]
[fixture: kanban/lex-label-directive-line] [fixture:
kanban/db-grid-directive-item-icon] [fixture:
kanban/db-grid-directive-item-class] [fixture:
kanban/db-grid-directive-metadata-key] [fixture: kanban/db-metadata-directive]
[fixture: kanban/lex-indent-directive] [fixture:
kanban/db-grid-directive-item-label-bare] [fixture:
kanban/db-grid-directive-item-label-markdown]

A directive inside the header keyword, a shape opener or closer, `::icon(`,
`:::`, or `@{` is rejected under
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).
[fixture: kanban/header-directive-inside] [fixture: kanban/div-directive-opener]
[fixture: kanban/div-directive-closer] [fixture:
kanban/div-directive-icon-marker] [fixture: kanban/div-directive-class-marker]
[fixture: kanban/div-directive-data-marker] A directive between complete units,
including adjacent data blocks, is allowed. [fixture:
kanban/header-directive-glued] [fixture: kanban/db-metadata-adjacent-directive]

The common
[`style` and `classDef` line rule](../common.md#style-and-classdef-lines)
ignores its selected semicolon inside text and strings, including data content.
[fixture: kanban/lex-id-style-rule] [fixture: kanban/lex-id-classdef-rule]
[fixture: kanban/lex-label-style-rule] [fixture:
kanban/lex-label-style-rule-upper] [fixture: kanban/lex-label-style-rule-space]
[fixture: kanban/lex-label-style-rule-no-hash] [fixture:
kanban/lex-label-style-rule-two-semicolons] [fixture:
kanban/lex-metadata-style-rule] [fixture:
kanban/lex-style-entity-two-semicolons] [fixture:
kanban/gram-semicolon-text-reference] A selected semicolon inside a shape opener
or closer is rejected under
[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).
[fixture: kanban/div-semicolon-opener] [fixture: kanban/div-semicolon-closer] A
semicolon on a different line from `style:#x` is not selected. [fixture:
kanban/lex-label-style-rule-other-line] [fixture:
kanban/lex-semicolon-icon-marker]

### The statement context

In the statement context, the lexer tries the rules below in order. Blank lines
and comments follow [Blank lines](#blank-lines). [fixture:
kanban/gram-grid-lf-header-line] [fixture: kanban/gram-grid-spaces-header-line]
[fixture: kanban/header-tab-trailing] [fixture: kanban/lex-tab-whitespace-first]
[fixture: kanban/lex-tab-whitespace-between] [fixture:
kanban/spec-kanban-b45e7358] [fixture: kanban/header-header-comment-blank]
[fixture: kanban/div-header-comments-blank] [fixture:
kanban/div-between-comment-blank] [fixture: kanban/gram-between-comments-blank]
[fixture: kanban/div-comment-blank-before-icon] [fixture:
kanban/div-comment-blank-before-class] [fixture:
kanban/div-between-real-comments-ls-node] [fixture:
kanban/div-between-real-comments-ps-node] [fixture:
kanban/div-header-space-node] [fixture: kanban/lex-between-comments-ls-node]
[fixture: kanban/gram-blank-before-icon]

1. `@{`: enters the data context (see [The data context](#the-data-context)).
   [fixture: kanban/db-metadata-all] [fixture: kanban/db-metadata-empty]

2. A diagram comment, after any whitespace: nothing (see [Comments](#comments)).
   [fixture: kanban/lex-comment-bare] [fixture: kanban/header-comment-glued]

3. The keyword `kanban`, case-insensitively and not followed by a word
   character: a `header` unit. [fixture: kanban/header-only-lf] [fixture:
   kanban/lex-keyword-kanban-upper]

4. `:::`: enters the class context. [fixture: kanban/db-decoration-class-item]

5. `::icon(`, case-insensitively: enters the icon context. [fixture:
   kanban/db-decoration-icon-item] [fixture: kanban/lex-icon-case]

6. A line feed: a `newline` unit. [fixture: kanban/db-sections-items]
   Whitespace-only lines are nothing. [fixture: kanban/gram-grid-lf-header-line]

7. An opener: `-)`, `(-`, `))`, `)`, `((`, `{{`, `(`, or `[`, tried in this
   order. It is an `opener` unit and enters the shape context. [fixture:
   kanban/db-shape-bang-alt] [fixture: kanban/db-shape-cloud-alt] [fixture:
   kanban/db-shape-bang] [fixture: kanban/db-shape-cloud] [fixture:
   kanban/db-shape-circle] [fixture: kanban/db-shape-hexagon] [fixture:
   kanban/db-shape-round] [fixture: kanban/db-shape-square] [fixture:
   kanban/gram-shape-carryover-doublecircle]

8. One or more whitespace characters other than a line feed: nothing. [fixture:
   kanban/db-indent-tabs] [fixture: kanban/lex-tab-line-start] [fixture:
   kanban/lex-bom-line-start] [fixture: kanban/lex-nbsp-line-start] [fixture:
   kanban/lex-ideographic-line-start] [fixture: kanban/lex-ls-line-start]
   [fixture: kanban/lex-ps-line-start] [fixture: kanban/header-ff-after]
   [fixture: kanban/header-vt-after] [fixture: kanban/header-nel-after]
   [fixture: kanban/lex-indent-directive]

9. A node text: a `node-text` unit. [fixture: kanban/db-name-two-words]
   [fixture: kanban/db-name-space-before-shape] [fixture:
   kanban/db-name-trailing-space] [fixture: kanban/db-grid-spaces-item-id]
   [fixture: kanban/db-grid-close-square-item-id] [fixture:
   kanban/db-grid-quote-item-id] [fixture: kanban/db-grid-semicolon-item-id]
   [fixture: kanban/gram-grid-open-brace-item-id] [fixture:
   kanban/gram-grid-close-brace-item-id] [fixture: kanban/gram-node-at]
   [fixture: kanban/lex-shape-close-only]

A `node-text` is one or more characters other than `(`, `[`, line feed, `)`,
`{`, `}`, and `@`, as many as possible. [fixture:
kanban/gram-grid-open-brace-item-id] [fixture:
kanban/gram-grid-close-brace-item-id] [fixture: kanban/lex-shape-close-only] It
includes `]`, quotes, and semicolons. [fixture:
kanban/db-grid-close-square-item-id] [fixture: kanban/db-grid-quote-item-id]
[fixture: kanban/db-grid-semicolon-item-id] It keeps internal and trailing
whitespace. [fixture: kanban/db-name-two-words] [fixture:
kanban/db-name-space-before-shape] [fixture: kanban/db-name-trailing-space]
[fixture: kanban/db-grid-spaces-item-id] Leading indentation is separate. A lone
`@` is rejected. [fixture: kanban/gram-node-at]

This grammar has no title, accessibility, style, class-definition, or columns
statement. `title`, `accTitle:`, `accDescr:`, `style`, `classDef`, `columns`,
`space`, and `end` are ordinary node text. [fixture:
kanban/db-title-not-statement] [fixture: kanban/db-acc-title-not-statement]
[fixture: kanban/db-acc-descr-not-statement] [fixture:
kanban/db-acc-title-empty] [fixture: kanban/lex-keyword-style-upper] [fixture:
kanban/lex-keyword-classdef-dash] [fixture: kanban/lex-keyword-columns-digit]
[fixture: kanban/lex-keyword-space-letter] [fixture:
kanban/lex-keyword-end-non-ascii] `accDescr {}` is rejected at its brace.
[fixture: kanban/gram-acc-descr-block-not-statement] [fixture:
kanban/gram-empty-description-block-after-value]

### The shape context

An opener enters the shape context. The lexer tries these four rules in order.
[fixture: kanban/db-shape-bang-alt] [fixture: kanban/db-shape-cloud-alt]
[fixture: kanban/db-shape-bang] [fixture: kanban/db-shape-cloud] [fixture:
kanban/db-shape-circle] [fixture: kanban/db-shape-hexagon] [fixture:
kanban/db-shape-round] [fixture: kanban/db-shape-square] [fixture:
kanban/gram-shape-carryover-doublecircle]

1. A quote followed by a backtick starts a `markdown-string` before the
   ordinary-string rule. It reads zero or more characters other than a quote or
   backtick, line feeds included. A backtick and a quote close it. [fixture:
   kanban/db-markdown-label] [fixture: kanban/db-grid-lf-item-label-markdown] A
   quote alone, a backtick without a quote after it, or the end of text rejects
   the input. The ordinary-string rule is not tried. [fixture:
   kanban/gram-unclosed-markdown] [fixture:
   kanban/gram-grid-quote-item-label-markdown] [fixture:
   kanban/gram-grid-backtick-item-label-markdown] [fixture:
   kanban/gram-markdown-quote] [fixture: kanban/gram-markdown-extra-backtick]

2. A `string` runs from a quote to the next quote. [fixture:
   kanban/spec-kanban-562eb2dc] It has no escape mechanism. Its content may
   include line feeds, U+2028, U+2029, parentheses, brackets, and backslashes.
   [fixture: kanban/db-label-multiline] [fixture: kanban/lex-ls-quoted-value]
   [fixture: kanban/lex-ps-quoted-value] [fixture:
   kanban/gram-grid-quote-item-label-quoted] [fixture:
   kanban/db-grid-backslash-item-label-quoted] An unclosed string is rejected.
   [fixture: kanban/gram-unclosed-quote]

3. A closer: `))`, `)`, `]`, `}}`, `(-`, `-)`, `((`, or `(`, tried in this
   order. It is a `closer` unit and leaves the shape context. [fixture:
   kanban/db-shape-circle] [fixture: kanban/db-shape-round] [fixture:
   kanban/db-shape-square] [fixture: kanban/db-shape-hexagon] [fixture:
   kanban/db-shape-bang] [fixture: kanban/db-shape-cloud] [fixture:
   kanban/lex-shape-dash-string]

4. A `shape-text` is one or more characters other than `)`, `]`, `(`, and `}`,
   as many as possible. It includes whitespace, line feeds, U+2028, U+2029, `{`,
   `[`, `@`, and quotes after its first character. [fixture:
   kanban/db-label-multiline] [fixture: kanban/db-label-quotes-middle] [fixture:
   kanban/db-grid-punct-item-label-bare] [fixture: kanban/lex-shape-open-brace]
   [fixture: kanban/lex-shape-open-bracket] [fixture: kanban/lex-shape-bare-ls]
   [fixture: kanban/lex-bare-leading-space-string] [fixture:
   kanban/lex-bare-quotes-literal] A lone `}` at the start or in the middle of a
   label is rejected. [fixture: kanban/gram-shape-single-brace-first] [fixture:
   kanban/gram-shape-single-brace-middle]

Bare text takes the dash before `)` as text: `(-text-)` has the closer `)`.
[fixture: kanban/db-shape-cloud-alt] [fixture: kanban/lex-shape-dash-bare] After
a quoted label, the dash may belong to the closer `-)`, as in `(-"text"-)`.
[fixture: kanban/lex-shape-dash-string]

Whitespace inside a shape label is part of its value, including a
whitespace-only value. [fixture: kanban/db-spaces-label] [fixture:
kanban/gram-whitespace-string] [fixture: kanban/gram-whitespace-bare-shape]
`S[ "x" ]` is a text label with leading whitespace. [fixture:
kanban/lex-bare-leading-space-string] Whitespace after a string or markdown
string is a second label unit and is rejected. [fixture:
kanban/gram-string-plus-space] [fixture: kanban/gram-markdown-plus-space]

### The icon and class contexts

An icon starts with `::icon(`, compared case-insensitively. [fixture:
kanban/db-decoration-icon-item] [fixture: kanban/lex-icon-case] It has a
nonempty `icon-text` of as many characters other than `)` as possible, followed
by `)`. Whitespace and line feeds are value characters. [fixture:
kanban/lex-icon-spaces] [fixture: kanban/lex-icon-multiline] [fixture:
kanban/gram-whitespace-icon] [fixture: kanban/gram-unclosed-icon] `A ::icon(x)`
is node text `A ::icon` followed by the shape `(x)`. [fixture:
kanban/db-decoration-inline]

A class starts with `:::`. It takes the nonempty rest of its line segment as
`class-text`, whitespace included, and leaves the class context. [fixture:
kanban/db-decoration-class-item] [fixture: kanban/db-grid-comment-item-class]
[fixture: kanban/lex-class-trailing-spaces] [fixture:
kanban/gram-whitespace-class] A line feed at its start leaves the context
without content. A U+2028 or U+2029 at its start has no matching rule and
rejects the input. [fixture: kanban/gram-class-ls] [fixture:
kanban/lex-class-ls-lf] [fixture: kanban/gram-class-first-ls] [fixture:
kanban/gram-grid-ps-item-class]

In the icon context, the lexer reads the nonempty text first and leaves at `)`.
[fixture: kanban/db-decoration-icon-item] [fixture: kanban/lex-icon-multiline]
Reading class text leaves the class context. A separator after nonempty class
text is read in the statement context. `:::a`, U+2028, and `b` are two
statements on one line and are rejected. [fixture: kanban/gram-class-ls]
[fixture: kanban/lex-class-ls-lf] [fixture: kanban/gram-grid-ps-item-class]

### The data context

At a statement-context unit start, `@{` enters the data context. An unquoted `}`
leaves it and makes one `data-block` unit. The unit may be empty. [fixture:
kanban/db-metadata-all] [fixture: kanban/db-metadata-empty] [fixture:
kanban/db-metadata-whitespace] [fixture: kanban/db-metadata-brace-in-quoted] An
unclosed block is rejected. [fixture: kanban/gram-metadata-unclosed]

Inside data, the lexer tries these rules in order: double quote enters quoted
data, nonempty unquoted content is read, and `}` closes the block. [fixture:
kanban/db-metadata-all] [fixture: kanban/db-metadata-empty] Inside quoted data,
double quote leaves the context before the nonempty content rule is tried.
[fixture: kanban/db-metadata-quotes-empty] [fixture:
kanban/db-metadata-double-caret]

Outside double quotes, data content is a nonempty run of as many characters
other than `}`, `^`, and double quote as possible. A caret has no rule and is
rejected. [fixture: kanban/gram-metadata-caret] `{` and single quotes are
ordinary content. [fixture: kanban/db-metadata-assigned-single-quoted] [fixture:
kanban/db-metadata-caret-reference] Single quotes do not protect a caret or a
closing brace. [fixture: kanban/gram-metadata-single-caret] [fixture:
kanban/gram-metadata-single-brace] [fixture:
kanban/gram-metadata-assigned-mapping]

A double quote in data enters the quoted-data context. The next quote leaves it.
[fixture: kanban/db-metadata-quotes-empty] All other characters, including `}`,
`^`, line feeds, and backslashes, are content. [fixture:
kanban/db-metadata-quoted-brace] [fixture: kanban/db-metadata-double-caret]
[fixture: kanban/gram-metadata-newline-quotes] A backslash does not escape the
closing quote. [fixture: kanban/gram-metadata-unclosed-quote]

An unclosed data block or double-quoted data part is rejected. Every data block
in an accepted tree is closed. [fixture: kanban/gram-metadata-unclosed]
[fixture: kanban/gram-metadata-unclosed-quote]

### Comments

A diagram comment starts at `%%` where a unit starts in the statement context.
It may stand on its own or after a header, shape, icon, or data block, with or
without whitespace. [fixture: kanban/header-comment-glued] [fixture:
kanban/header-comment-on-header-line] [fixture: kanban/lex-comment-bare]
[fixture: kanban/lex-after-shape-comment] [fixture:
kanban/lex-after-shape-comment-glued] [fixture: kanban/lex-after-icon-comment]
[fixture: kanban/lex-after-metadata-comment] Its mark is `%%`. Its value is the
text after the mark up to line feed, U+2028, U+2029, or end of text. [fixture:
kanban/lex-node-comment-ls] [fixture: kanban/lex-icon-comment-ls] [fixture:
kanban/db-metadata-comment-ls] [fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node] [fixture:
kanban/lex-between-comment-ls-node]

An ordinary `#` or single `%` is node text. [fixture: kanban/lex-comment-hash]
[fixture: kanban/lex-comment-single-percent] A percent pair inside a node text
or shape label stays in that text. [fixture: kanban/lex-after-bare-comment]
[fixture: kanban/lex-after-bare-comment-glued] [fixture:
kanban/db-grid-comment-item-label-bare] [fixture:
kanban/lex-comment-quoted-inline]

A line of `%%` alone or `%%{ }%%` is a diagram comment. [fixture:
kanban/lex-comment-bare] [fixture: kanban/header-after-empty-braces-line] A
common comment line is removed with its line terminator, including text after
U+2028 or U+2029 on that line. [fixture: kanban/lex-between-comments-ls-node]
[fixture: kanban/lex-comment-quoted-line]

The end of a diagram comment is a `newline` unit, also at U+2028 or U+2029.
Indentation after it starts a new node line. The separator and the whitespace on
its right count as indentation. [fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node] [fixture:
kanban/lex-between-comment-ls-node] [fixture: kanban/lex-node-comment-ls]
[fixture: kanban/lex-icon-comment-ls] [fixture: kanban/db-metadata-comment-ls]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation). The unit
names are those defined above.

| Grammar rule                       | Node made            |
| ---------------------------------- | -------------------- |
| `diagram`                          | KanbanDiagram        |
| `node`                             | KanbanNode           |
| `shape`                            | KanbanShape          |
| `shape-label`                      | KanbanLabel          |
| `icon-line`                        | KanbanIconStatement  |
| `class-line`                       | KanbanClassStatement |
| `data-block`                       | KanbanDataBlock      |
| `node-text, icon-text, class-text` | KanbanLiteral        |

### Diagram and lines

```text
diagram     = header line? ( newline line? )*
line        = node data-block* | icon-line | class-line
node        = node-text shape? | shape
shape       = opener shape-label closer
shape-label = shape-text | string | markdown-string
icon-line   = "::icon(" icon-text ")"
class-line  = ":::" class-text
```

Each node or decoration needs a line end. A second statement after a shape, data
suffix, icon, or quoted label is rejected. [fixture:
kanban/gram-two-shapes-on-line] A semicolon after a shape, data suffix, icon, or
quoted label is rejected. [fixture: kanban/lex-after-shape-semicolon] [fixture:
kanban/lex-after-shape-semicolon-spaced] [fixture:
kanban/lex-after-metadata-semicolon] [fixture: kanban/lex-after-icon-semicolon]
[fixture: kanban/lex-after-quoted-semicolon] [fixture:
kanban/lex-after-markdown-semicolon] A semicolon inside bare node text or class
text stays text. [fixture: kanban/lex-after-class-semicolon] [fixture:
kanban/db-semicolon-bare-node] [fixture: kanban/db-semicolon-only-node]

Whitespace and a diagram comment may follow a completed shape, icon, or data
suffix before its line ends. [fixture: kanban/lex-after-shape-spaces] [fixture:
kanban/lex-after-icon-spaces] [fixture: kanban/lex-after-metadata-spaces]
[fixture: kanban/lex-after-shape-comment] [fixture:
kanban/lex-after-icon-comment] [fixture: kanban/lex-after-metadata-comment]
[fixture: kanban/db-metadata-before-comment] Class and bare node text keep their
trailing text. [fixture: kanban/lex-after-class-comment] [fixture:
kanban/lex-after-bare-spaces]

The last node needs no final line feed in the source (see
[End of text](../common.md#end-of-text)). [fixture:
kanban/db-no-final-line-feed] Shapes, strings, markdown strings, and icons must
close. [fixture: kanban/gram-unclosed-shape] [fixture:
kanban/gram-unclosed-quote] [fixture: kanban/gram-unclosed-markdown] [fixture:
kanban/gram-unclosed-icon] A class may end at the end of the source. Empty forms
are rejected (see [Empty forms](#empty-forms)). [fixture:
kanban/div-class-end-empty]

### Nodes and shapes

A node is bare node text, node text followed by a shape, or a shape alone.
[fixture: kanban/db-name-two-words] [fixture: kanban/db-shape-square] [fixture:
kanban/db-name-space-before-shape] A shape alone has no id child. [fixture:
kanban/db-name-no-id] [fixture: kanban/spec-kanban-46081dfb]

The diagram body is a flat list of nodes with their absolute indentation. Deeper
nodes do not create nested children. [fixture: kanban/db-indent-unindented]
[fixture: kanban/db-indent-tabs] [fixture: kanban/db-indent-deeper] [fixture:
kanban/db-indent-shallower-last] [fixture: kanban/db-sections-items] [fixture:
kanban/spec-kanban-d05521ff] The
[tests package](../../../tests/docs/db-summaries.md#kanban) defines section and
item assignment.

Repeated ids remain separate nodes in source order. Ids need not be unique.
[fixture: kanban/db-section-three-definitions] [fixture:
kanban/db-item-three-definitions] [fixture: kanban/db-section-item-same-id]
[fixture: kanban/db-metadata-repeated-id] Prototype property names and different
letter cases are ordinary node text. [fixture: kanban/db-object-prototype-ids]
[fixture: kanban/db-name-case]

A shape is an opener, exactly one nonempty `shape-text`, `string`, or
`markdown-string` label, and a closer. [fixture: kanban/db-shape-square]
[fixture: kanban/db-markdown-label] The closer need not match the opener:
`[text)` is a shape. [fixture: kanban/db-shape-mismatched] `[]`, `[""]`, and two
strings in one shape are rejected. [fixture: kanban/gram-empty-label] [fixture:
kanban/gram-empty-quoted-label] [fixture: kanban/gram-label-two-strings]
[fixture: kanban/gram-empty-markdown-shape]

The accepted shape forms are those listed above. `>` is bare node text.
[fixture: kanban/db-shape-carryover-left-arrow] Slash and backslash inside
`[...]` are label text. [fixture: kanban/db-shape-carryover-lean-left] [fixture:
kanban/db-shape-carryover-lean-right] [fixture:
kanban/db-shape-carryover-trapezoid] Cylinder, subroutine, diamond, stadium, and
block-arrow forms that require other delimiters are rejected. [fixture:
kanban/gram-shape-carryover-cylinder] [fixture:
kanban/gram-shape-carryover-subroutine] [fixture:
kanban/gram-shape-carryover-diamond] [fixture:
kanban/gram-shape-carryover-stadium] [fixture:
kanban/gram-shape-carryover-block-arrow]

### Data blocks

One or more adjacent data blocks may follow a node with no intervening
whitespace. [fixture: kanban/gram-metadata-two-blocks] [fixture:
kanban/db-metadata-adjacent-empty] [fixture: kanban/db-metadata-adjacent-comma]
[fixture: kanban/db-metadata-two-items] [fixture:
kanban/db-metadata-one-item-reference] A directive between complete blocks is
allowed. [fixture: kanban/db-metadata-adjacent-directive] Whitespace or a line
feed ends the suffix. Another block after it is rejected. [fixture:
kanban/gram-metadata-adjacent-space] [fixture:
kanban/gram-metadata-blank-between-blocks]

Data follows the node as a whole. It follows a shape immediately when one is
present. [fixture: kanban/db-metadata-all] [fixture:
kanban/gram-metadata-after-shape-space] Otherwise it follows bare node text,
whose trailing whitespace stays in that text. [fixture:
kanban/db-metadata-ticket-plain] [fixture: kanban/db-metadata-node-space] A
shape after data is rejected. [fixture: kanban/gram-metadata-before-shape] A
data block alone on the next line is rejected. [fixture:
kanban/gram-metadata-block-on-next-line]

Each data block keeps its whole written interior. This includes whitespace at
both ends, quotes, line terminators, commas, unknown keys, and duplicate keys.
It has no parsed key/value children. [fixture: kanban/db-metadata-spaces]
[fixture: kanban/db-metadata-multiline] [fixture:
kanban/db-metadata-unknown-key] [fixture: kanban/db-metadata-proto-key]
[fixture: kanban/gram-metadata-ticket-duplicate] [fixture:
kanban/db-metadata-whitespace] [fixture: kanban/db-metadata-unknown-reference]
[fixture: kanban/db-metadata-double-line-space] [fixture:
kanban/db-metadata-single-line-space]

The content of a well-delimited data block is not validated. YAML errors,
duplicate keys, metadata types, shape names, and empty multiline content fall
under [embedded-data-opaque](../known-divergences/embedded-data-opaque.md).
[fixture: kanban/gram-metadata-bad-yaml] [fixture:
kanban/gram-metadata-ticket-duplicate] [fixture:
kanban/gram-metadata-empty-multiline] [fixture:
kanban/gram-metadata-shape-camel] [fixture: kanban/gram-metadata-shape-number]
[fixture: kanban/gram-metadata-shape-underscore] [fixture:
kanban/gram-metadata-two-blocks] An unquoted caret, an unclosed block, or a
leftover brace is a syntax rejection. [fixture: kanban/gram-metadata-caret]
[fixture: kanban/gram-metadata-unclosed] [fixture:
kanban/gram-metadata-assigned-mapping]

### Icons and classes

Each icon or class line decorates the node written last, whatever its
indentation. Repeated decorations stay separate and in source order. [fixture:
kanban/db-decoration-icon-twice] [fixture: kanban/db-decoration-class-twice]
[fixture: kanban/spec-kanban-382e97e1] [fixture: kanban/spec-kanban-dc1ceff8]
[fixture: kanban/spec-kanban-3f5b450b] A decoration before a later, deeper node
belongs to the earlier node. [fixture: kanban/gram-decoration-then-child]
[fixture: kanban/gram-shallower-then-decoration]

### Empty forms

An empty icon or class form is rejected wherever its marker is recognized, under
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md).
[fixture: kanban/db-decoration-empty-icon] [fixture:
kanban/db-decoration-empty-class] [fixture: kanban/div-class-end-empty]
[fixture: kanban/gram-empty-icon-reference] This includes before the first node
and after a completed shape. [fixture: kanban/div-empty-icon-before-first]
[fixture: kanban/div-empty-icon-header] [fixture: kanban/div-empty-class-header]
[fixture: kanban/div-class-before-first-unindented-empty] [fixture:
kanban/div-empty-icon-after-shape] [fixture: kanban/div-empty-class-after-shape]
[fixture: kanban/gram-empty-class-before-first] Nonempty whitespace-only content
is a value. [fixture: kanban/gram-whitespace-icon] [fixture:
kanban/gram-whitespace-class]

An empty string or empty markdown string recognized inside a shape is rejected
under [tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md).
[fixture: kanban/gram-empty-quoted-label] [fixture:
kanban/gram-unclosed-empty-string] [fixture:
kanban/gram-unclosed-empty-markdown] [fixture: kanban/gram-empty-markdown-shape]
This also holds before or after a nonempty text or string label. [fixture:
kanban/div-empty-string-before-label] [fixture:
kanban/div-empty-markdown-before-label] [fixture:
kanban/div-empty-string-after-label] [fixture:
kanban/div-empty-markdown-after-label] [fixture:
kanban/div-string-before-string] [fixture:
kanban/div-empty-markdown-before-string] [fixture: kanban/gram-string-reference]
[fixture: kanban/gram-text-reference] Bare `""` and empty markdown strings
outside a shape are node text. [fixture: kanban/db-empty-string-node] [fixture:
kanban/db-empty-markdown-node] `x""` inside a bare shape label stays text.
[fixture: kanban/lex-bare-quotes-literal]

An empty data block is a data node. [fixture: kanban/db-metadata-empty]
[fixture: kanban/gram-metadata-empty-multiline] Empty quoted values are content
of its opaque body. [fixture: kanban/db-metadata-label-empty-string] [fixture:
kanban/db-metadata-quotes-empty] `accDescr {}` has no statement form here.
[fixture: kanban/gram-acc-descr-block-not-statement] [fixture:
kanban/gram-empty-description-block-after-value]

### Blank lines

After the header, empty lines, whitespace-only lines, comment lines, and diagram
comments change nothing between nodes, before decorations, or at the end.
[fixture: kanban/gram-grid-lf-header-line] [fixture:
kanban/gram-grid-spaces-header-line] [fixture: kanban/header-tab-trailing]
[fixture: kanban/lex-tab-whitespace-first] [fixture:
kanban/lex-tab-whitespace-between] [fixture: kanban/spec-kanban-b45e7358]
[fixture: kanban/header-header-comment-blank] [fixture:
kanban/gram-between-comments-blank] [fixture:
kanban/lex-between-comments-ls-node] [fixture: kanban/gram-blank-before-icon]
Inputs that mermaid.js rejects only because of their pairing fall under
[blank-line-after-header-or-comments](../known-divergences/blank-line-after-header-or-comments.md).
[fixture: kanban/div-header-comments-blank] [fixture:
kanban/div-between-comment-blank] [fixture:
kanban/div-comment-blank-before-icon] [fixture:
kanban/div-comment-blank-before-class] [fixture:
kanban/div-between-real-comments-ls-node] [fixture:
kanban/div-between-real-comments-ps-node] [fixture:
kanban/div-header-space-node]

### Rejections outside the grammar

- A node indented less than the first node rejects the input only if another
  node follows it. [fixture: kanban/db-indent-shallower-last] [fixture:
  kanban/gram-indent-shallower-followed] [fixture: kanban/spec-kanban-fd001ab2]
  Decorations and empty lines after that final shallower node do not cause
  rejection. [fixture: kanban/gram-shallower-then-decoration] [fixture:
  kanban/gram-shallower-then-empty]

- An icon or class decoration before the first node is rejected. [fixture:
  kanban/gram-decoration-before-node] [fixture:
  kanban/gram-decoration-class-before-node]

## Known divergences

- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty icon, empty class line, or empty string or markdown string inside a
  shape is rejected. mermaid.js reads no token for these forms and accepts
  inputs whose remainder is accepted. [fixture:
  kanban/db-decoration-empty-class] [fixture: kanban/db-decoration-empty-icon]
  [fixture: kanban/div-empty-icon-before-first] [fixture:
  kanban/div-empty-icon-header] [fixture: kanban/div-empty-class-header]
  [fixture: kanban/div-empty-string-before-label] [fixture:
  kanban/div-empty-markdown-before-label] [fixture:
  kanban/div-empty-string-after-label] [fixture:
  kanban/div-empty-markdown-after-label] [fixture:
  kanban/div-class-before-first-unindented-empty] [fixture:
  kanban/div-class-end-empty] [fixture: kanban/div-empty-icon-after-shape]
  [fixture: kanban/div-empty-class-after-shape] [fixture:
  kanban/div-string-before-string] [fixture:
  kanban/div-empty-markdown-before-string]

- **[`blank-line-after-header-or-comments`](../known-divergences/blank-line-after-header-or-comments.md).**
  Blank lines and trailing header whitespace before a node are accepted.
  [fixture: kanban/gram-grid-comment-line-header-line] [fixture:
  kanban/gram-grid-directive-line-header-line] [fixture:
  kanban/gram-grid-lf-header-line] [fixture:
  kanban/gram-grid-spaces-header-line] [fixture: kanban/header-bom-trailing]
  [fixture: kanban/header-crlf-trailing] [fixture: kanban/header-ff-trailing]
  [fixture: kanban/header-ideographic-trailing] [fixture:
  kanban/header-ls-trailing] [fixture: kanban/header-nbsp-trailing] [fixture:
  kanban/header-ps-trailing] [fixture: kanban/header-tab-trailing] [fixture:
  kanban/header-vt-trailing] [fixture: kanban/lex-bom-whitespace-first]
  [fixture: kanban/lex-cr-whitespace-first] [fixture:
  kanban/lex-crlf-whitespace-first] [fixture:
  kanban/lex-ideographic-whitespace-first] [fixture:
  kanban/lex-ls-whitespace-first] [fixture: kanban/lex-nbsp-whitespace-first]
  [fixture: kanban/lex-ps-whitespace-first] [fixture:
  kanban/lex-tab-whitespace-first] [fixture: kanban/div-header-space-node]
  Comments followed by blank lines before nodes or decorations are accepted.
  [fixture: kanban/div-header-comments-blank] [fixture:
  kanban/div-between-comment-blank] [fixture:
  kanban/div-comment-blank-before-icon] [fixture:
  kanban/div-comment-blank-before-class] A node after a comment-ending U+2028 or
  U+2029 is accepted. mermaid.js pairs the whitespace and rejects these inputs.
  [fixture: kanban/div-header-comment-ls-node] [fixture:
  kanban/div-header-comment-ps-node] [fixture:
  kanban/div-between-real-comments-ls-node] [fixture:
  kanban/div-between-real-comments-ps-node]

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive splitting `kanban`, a shape delimiter, `::icon(`, `:::`, or `@{`
  is rejected. mermaid.js joins the parts. [fixture:
  kanban/header-directive-inside] [fixture: kanban/div-directive-opener]
  [fixture: kanban/div-directive-closer] [fixture:
  kanban/div-directive-icon-marker] [fixture: kanban/div-directive-class-marker]
  [fixture: kanban/div-directive-data-marker]

- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  The semicolon selected by the common line rule inside a shape opener or closer
  is rejected. mermaid.js removes it. [fixture: kanban/div-semicolon-opener]
  [fixture: kanban/div-semicolon-closer]

- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  A tag starting in frontmatter does not convert the quotes of a later kanban
  label. With `title: <a` in frontmatter, `S["b="c">d"]` is rejected here.
  mermaid.js accepts it. [fixture: kanban/div-frontmatter-open-tag]

- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).** The
  words `C4Container`, `C4Component`, `C4Dynamic`, and `C4Deployment` in node
  text, a label, or data content do not override the kanban header. mermaid.js
  selects C4 and rejects the input. [fixture: kanban/lex-c4-c4component-id]
  [fixture: kanban/lex-c4-c4component-label] [fixture:
  kanban/lex-c4-c4component-metadata] [fixture: kanban/lex-c4-c4container-id]
  [fixture: kanban/lex-c4-c4container-label] [fixture:
  kanban/lex-c4-c4container-metadata] [fixture: kanban/lex-c4-c4deployment-id]
  [fixture: kanban/lex-c4-c4deployment-label] [fixture:
  kanban/lex-c4-c4deployment-metadata] [fixture: kanban/lex-c4-c4dynamic-id]
  [fixture: kanban/lex-c4-c4dynamic-label] [fixture:
  kanban/lex-c4-c4dynamic-metadata]

- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).**
  Frontmatter and data-block contents are kept without YAML, type, or shape-name
  validation. [fixture: kanban/gram-frontmatter-invalid-yaml] [fixture:
  kanban/gram-metadata-bad-yaml] [fixture:
  kanban/gram-metadata-ticket-duplicate] [fixture:
  kanban/gram-metadata-shape-camel] [fixture: kanban/gram-metadata-shape-number]
  [fixture: kanban/gram-metadata-shape-underscore] An empty multiline block and
  adjacent blocks whose combined content mermaid.js rejects are accepted.
  [fixture: kanban/gram-metadata-empty-multiline] [fixture:
  kanban/gram-metadata-two-blocks]
