# Kanban

Japanese version: [kanban.ja.md](./kanban.ja.md)

Source of truth in mermaid.js:

- [`kanban.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/kanban/parser/kanban.jison)
- [`kanbanDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/kanban/kanbanDb.ts)
- [`detector.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/kanban/detector.ts#L6-L10)

This document covers the diagram type `kanban`. The nodes of the tree are
defined in [ast/kanban.md](../ast/kanban.md). How mermaid.js reads section
membership and metadata effects is in the
[tests package summary](../../../tests/docs/db-summaries.md#kanban).

## Detection

Entry 8 of [detection.md](../detection.md) selects this grammar when the text
after leading trivia starts with lower-case `kanban`. No boundary is required
after it. [fixture: kanban/header-indented] [fixture:
kanban/header-after-blank-lines] [fixture: kanban/header-bom-before] [fixture:
kanban/header-cr-before] [fixture: kanban/header-crlf-before] [fixture:
kanban/header-ff-before] [fixture: kanban/header-ideographic-before] [fixture:
kanban/header-ls-before] [fixture: kanban/header-nbsp-before] [fixture:
kanban/header-ps-before] [fixture: kanban/header-vt-before] [fixture:
kanban/header-nel-before] [fixture: kanban/header-tab-indented] [fixture:
kanban/header-after-whitespace-line] [fixture: kanban/header-only-comment]
[fixture: kanban/header-statement-first] [fixture: kanban/header-dash-suffix]
[fixture: kanban/header-non-ascii-suffix] `KANBAN`, `Kanban`, and mixed case
match no detector. [fixture: kanban/header-upper-case] [fixture:
kanban/header-capitalized] [fixture: kanban/header-mixed-case] A word, digit, or
underscore suffix is detected and then rejected by the grammar. [fixture:
kanban/header-word-suffix] [fixture: kanban/header-digit-suffix] [fixture:
kanban/header-underscore-suffix]

Frontmatter, directives, and comment regions before the header follow the common
rules. [fixture: kanban/header-after-frontmatter] [fixture:
kanban/header-after-frontmatter-and-comment] [fixture:
kanban/header-after-comment-line] [fixture: kanban/header-after-directive-line]
[fixture: kanban/gram-frontmatter-empty] [fixture:
kanban/gram-frontmatter-unclosed] A leading line of `%%` alone or `%%{ }%%` is a
diagram comment, also before a blank line. [fixture:
kanban/header-after-bare-percent-line] [fixture:
kanban/header-after-empty-braces-line] [fixture:
kanban/header-header-percent-blank] A `#` line or `;` line before the header
prevents detection. [fixture: kanban/header-after-hash-line] [fixture:
kanban/header-after-semicolon-line] [fixture: kanban/header-leading-semicolon]

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
kanban/header-statement-on-header-line-tab] [fixture: kanban/header-bom-after]
[fixture: kanban/header-ideographic-after] [fixture: kanban/header-ls-after]
[fixture: kanban/header-nbsp-after] [fixture: kanban/header-ps-after] [fixture:
kanban/header-tab-after] [fixture: kanban/header-semicolon-spaced] [fixture:
kanban/header-spaced-word-suffix] A shape or a non-word character, such as `-`,
`:`, `#`, `%`, or a quote, may start the node right after the header. [fixture:
kanban/header-shape-on-header-line] [fixture: kanban/header-dash-suffix]
[fixture: kanban/db-grid-colon-header-line] [fixture:
kanban/db-grid-hash-header-line] [fixture: kanban/db-grid-percent-header-line]
[fixture: kanban/header-header-quote] [fixture: kanban/header-nel-trailing]
[fixture: kanban/header-semicolon] A lone `{` is no opener and is rejected.
[fixture: kanban/gram-grid-open-brace-header-line]

The header cannot end the text with nothing after it but removed directives and
the appended line feed. [fixture: kanban/header-only] [fixture:
kanban/header-header-directive-only] A line feed in the source, whitespace, a
diagram comment, or a first node may follow it. A board without nodes has an
empty body. [fixture: kanban/header-only-lf] [fixture: kanban/header-cr-after]
[fixture: kanban/header-crlf-after] [fixture: kanban/db-empty-board-comment]
[fixture: kanban/db-empty-board-whitespace] [fixture:
kanban/header-header-space-only] [fixture:
kanban/header-header-comment-only-reference] [fixture:
kanban/header-header-space-directive-only]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in converted
form. CRLF and lone CR are line feeds. [fixture: kanban/lex-crlf-quoted-value]
[fixture: kanban/lex-cr-quoted-value] [fixture: kanban/lex-cr-bare-value]
[fixture: kanban/lex-cr-line-end] [fixture: kanban/lex-cr-line-start] [fixture:
kanban/lex-cr-text-end] [fixture: kanban/lex-cr-whitespace-between] [fixture:
kanban/lex-cr-whitespace-last] [fixture: kanban/lex-crlf-bare-value] [fixture:
kanban/lex-crlf-line-end] [fixture: kanban/lex-crlf-line-start] [fixture:
kanban/lex-crlf-line-trailing] [fixture: kanban/lex-crlf-text-end] [fixture:
kanban/lex-crlf-whitespace-between] [fixture: kanban/lex-crlf-whitespace-last]
Attribute quotes are single quotes. [fixture:
kanban/db-grid-html-attribute-item-label-quoted] Entities are placeholders.
[fixture: kanban/db-grid-entity-item-label-quoted] [fixture:
kanban/db-grid-entity-named-item-label-bare] Tree values keep the written text.
[fixture: kanban/lex-string-crlf]

The common [comment regions](../common.md#comment-lines) are trivia, also inside
multiline labels and data blocks. [fixture: kanban/lex-comment-quoted-line]
[fixture: kanban/db-metadata-comment-line] [fixture: kanban/lex-comment-line]
[fixture: kanban/lex-id-comment-line] [fixture: kanban/lex-id-directive-line]
[fixture: kanban/lex-label-comment-line] [fixture:
kanban/lex-metadata-comment-line] [fixture: kanban/lex-metadata-directive-line]
An inline `%%` inside node text, a shape label, or class text stays in that
text. [fixture: kanban/lex-comment-quoted-inline] [fixture:
kanban/db-grid-comment-item-id] [fixture:
kanban/db-grid-comment-item-label-bare] [fixture:
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
kanban/lex-c4-c4deployment-id] [fixture: kanban/lex-c4-c4context-label]
[fixture: kanban/lex-c4-c4context-metadata] Words in removed comments or
frontmatter do not participate in detection. [fixture:
kanban/lex-c4-c4container-comment] [fixture:
kanban/lex-c4-c4container-frontmatter] [fixture:
kanban/lex-c4-c4component-comment] [fixture:
kanban/lex-c4-c4component-frontmatter] [fixture:
kanban/lex-c4-c4context-comment] [fixture: kanban/lex-c4-c4context-frontmatter]
[fixture: kanban/lex-c4-c4deployment-comment] [fixture:
kanban/lex-c4-c4deployment-frontmatter] [fixture:
kanban/lex-c4-c4dynamic-comment] [fixture: kanban/lex-c4-c4dynamic-frontmatter]
`C4Context` after the header is ordinary text in both readings. [fixture:
kanban/lex-c4-c4context-id]

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
[fixture: kanban/db-grid-ps-metadata-label-quoted] [fixture:
kanban/lex-ls-line-trailing] [fixture: kanban/lex-ls-text-end] [fixture:
kanban/lex-ls-line-end] [fixture: kanban/lex-ps-line-trailing] [fixture:
kanban/lex-ps-text-end] [fixture: kanban/lex-ps-line-end]

Indentation is measured in the text without directives. [fixture:
kanban/lex-indent-directive] For a node on the header line, it is the whitespace
after the header. [fixture: kanban/header-statement-on-header-line] [fixture:
kanban/header-statement-on-header-line-tab] After a U+2028 or U+2029 ending a
diagram comment, indentation starts with that separator. [fixture:
kanban/lex-node-comment-ls] [fixture: kanban/div-header-comment-ps-node]
[fixture: kanban/lex-indent-comment-ps-semicolon-space] [fixture:
kanban/lex-indent-comment-ls-semicolon-space] [fixture:
kanban/lex-indent-comment-ps-semicolon-touching] [fixture:
kanban/lex-indent-comment-ls-semicolon-touching] [fixture:
kanban/lex-indent-comment-ps-no-semicolon-space] [fixture:
kanban/lex-indent-comment-ps-no-semicolon-touching] [fixture:
kanban/lex-indent-comment-ps-semicolon-wide-tail] [fixture:
kanban/lex-indent-comment-ps-space-after-card] [fixture:
kanban/lex-indent-comment-ps-space-after-column] [fixture:
kanban/lex-indent-comment-ls-space-after-column] [fixture:
kanban/lex-indent-comment-ps-two-spaces-after-card] [fixture:
kanban/lex-indent-comment-ps-after-card-then-column] [fixture:
kanban/lex-indent-comment-ps-zero-baseline] [fixture:
kanban/lex-indent-comment-ps-selected-semicolon-space] [fixture:
kanban/lex-indent-comment-ps-selected-semicolon-touching] [fixture:
kanban/lex-indent-comment-ps-unselected-semicolon-node] [fixture:
kanban/lex-indent-comment-lf-semicolon-space] [fixture:
kanban/lex-indent-comment-crlf-semicolon-space] [fixture:
kanban/lex-indent-comment-ps-common-line] [fixture:
kanban/lex-indent-comment-ps-indent-directive] [fixture:
kanban/lex-indent-comment-ps-tail-directive] [fixture:
kanban/lex-indent-comment-ps-empty-line-before] [fixture:
kanban/lex-indent-comment-ls-selected-semicolon-touching] [fixture:
kanban/lex-indent-comment-ps-tail-directive-touching] [fixture:
kanban/lex-indent-comment-ps-selected-semicolon-indent-directive]

### Directives inside units

The text units are `node-text`, `shape-text`, `icon-text`, `class-text`, and the
`data-text` and `data-quote` units between a `data-start` unit and its `}`. The
string units are `string` and `markdown-string`. A directive inside any of these
units is trivia. The remaining text keeps its reading, including whitespace on
both sides. [fixture: kanban/db-grid-directive-item-id] [fixture:
kanban/lex-id-directive-start] [fixture: kanban/lex-id-directive-end] [fixture:
kanban/lex-label-directive-line] [fixture: kanban/db-grid-directive-item-icon]
[fixture: kanban/db-grid-directive-item-class] [fixture:
kanban/db-grid-directive-metadata-key] [fixture: kanban/db-metadata-directive]
[fixture: kanban/lex-indent-directive] [fixture:
kanban/db-grid-directive-item-label-bare] [fixture:
kanban/db-grid-directive-item-label-markdown] [fixture:
kanban/lex-after-class-directive] [fixture:
kanban/lex-after-class-directive-unclosed] [fixture:
kanban/lex-after-class-directive-word-unclosed] [fixture:
kanban/lex-after-bare-directive] [fixture:
kanban/lex-after-bare-directive-unclosed] [fixture:
kanban/lex-after-bare-directive-word-unclosed] [fixture:
kanban/lex-label-directive-start] [fixture: kanban/lex-label-directive-end]
[fixture: kanban/lex-metadata-directive-start] [fixture:
kanban/lex-metadata-directive-end]

A directive inside the header keyword, a shape opener or closer, `::icon(`,
`:::`, or `@{` is rejected under
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).
[fixture: kanban/header-directive-inside] [fixture: kanban/div-directive-opener]
[fixture: kanban/div-directive-closer] [fixture:
kanban/div-directive-icon-marker] [fixture: kanban/div-directive-class-marker]
[fixture: kanban/div-directive-data-marker] [fixture:
kanban/div-directive-opener-round-dash] [fixture:
kanban/div-directive-opener-double-close] [fixture:
kanban/div-directive-opener-double-brace] [fixture:
kanban/div-directive-closer-double-brace] [fixture:
kanban/div-directive-closer-round-dash] [fixture:
kanban/div-directive-closer-dash-round] [fixture:
kanban/div-directive-closer-double-open] [fixture:
kanban/div-directive-opener-dash-round] A directive between complete units,
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
kanban/gram-semicolon-text-reference] [fixture:
kanban/lex-id-style-rule-no-hash] [fixture: kanban/lex-id-style-rule-other-line]
[fixture: kanban/lex-id-style-rule-space] [fixture:
kanban/lex-id-style-rule-two-semicolons] [fixture:
kanban/lex-id-style-rule-upper] [fixture:
kanban/lex-metadata-style-rule-no-hash] [fixture:
kanban/lex-metadata-style-rule-other-line] [fixture:
kanban/lex-metadata-style-rule-space] [fixture:
kanban/lex-metadata-style-rule-two-semicolons] [fixture:
kanban/lex-metadata-style-rule-upper] [fixture:
kanban/lex-metadata-classdef-rule] A selected semicolon inside a shape opener or
closer is rejected under
[ignored-semicolon-as-token-boundary](../known-divergences/ignored-semicolon-as-token-boundary.md).
[fixture: kanban/div-semicolon-opener] [fixture: kanban/div-semicolon-closer]
[fixture: kanban/div-semicolon-opener-round-dash] [fixture:
kanban/div-semicolon-opener-double-close] [fixture:
kanban/div-semicolon-opener-double-open] [fixture:
kanban/div-semicolon-closer-double-close] [fixture:
kanban/div-semicolon-closer-round-dash] [fixture:
kanban/div-semicolon-closer-dash-round] [fixture:
kanban/div-semicolon-closer-double-open] A semicolon on a different line from
`style:#x` is not selected. [fixture: kanban/lex-label-style-rule-other-line]
[fixture: kanban/lex-semicolon-icon-marker]

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

1. `@{`: a `data-start` unit; enters the data context (see
   [The data context](#the-data-context)). [fixture: kanban/db-metadata-all]
   [fixture: kanban/db-metadata-empty]

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
   [fixture: kanban/lex-bom-whitespace-between] [fixture:
   kanban/lex-bom-whitespace-last] [fixture:
   kanban/lex-ideographic-whitespace-between] [fixture:
   kanban/lex-ideographic-whitespace-last] [fixture:
   kanban/lex-nbsp-whitespace-between] [fixture:
   kanban/lex-nbsp-whitespace-last] [fixture: kanban/lex-tab-whitespace-last]
   [fixture: kanban/lex-ls-whitespace-between] [fixture:
   kanban/lex-ls-whitespace-last] [fixture: kanban/lex-ps-whitespace-between]
   [fixture: kanban/lex-ps-whitespace-last]

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
[fixture: kanban/db-grid-spaces-item-id] [fixture: kanban/lex-bom-bare-value]
[fixture: kanban/lex-bom-line-trailing] [fixture: kanban/lex-bom-text-end]
[fixture: kanban/lex-bom-line-end] [fixture: kanban/lex-ideographic-bare-value]
[fixture: kanban/lex-ideographic-line-trailing] [fixture:
kanban/lex-ideographic-text-end] [fixture: kanban/lex-ideographic-line-end]
[fixture: kanban/lex-nbsp-bare-value] [fixture: kanban/lex-nbsp-line-trailing]
[fixture: kanban/lex-nbsp-text-end] [fixture: kanban/lex-nbsp-line-end]
[fixture: kanban/lex-tab-bare-value] [fixture: kanban/lex-tab-line-trailing]
[fixture: kanban/lex-tab-text-end] [fixture: kanban/lex-tab-line-end] Leading
indentation is separate. A lone `@` is rejected. [fixture: kanban/gram-node-at]

This grammar has no title, accessibility, style, class-definition, or columns
statement. `title`, `accTitle:`, `accDescr:`, `style`, `classDef`, `columns`,
`space`, `end`, `default`, `interpolate`, and `linkStyle` are ordinary node
text, in any case and with any character after them. [fixture:
kanban/db-title-not-statement] [fixture: kanban/db-acc-title-not-statement]
[fixture: kanban/db-acc-descr-not-statement] [fixture:
kanban/db-acc-title-empty] [fixture: kanban/lex-keyword-style-upper] [fixture:
kanban/lex-keyword-classdef-dash] [fixture: kanban/lex-keyword-columns-digit]
[fixture: kanban/lex-keyword-space-letter] [fixture:
kanban/lex-keyword-end-non-ascii] [fixture: kanban/lex-keyword-accdescr-dash]
[fixture: kanban/lex-keyword-accdescr-digit] [fixture:
kanban/lex-keyword-accdescr-letter] [fixture:
kanban/lex-keyword-accdescr-non-ascii] [fixture:
kanban/lex-keyword-accdescr-underscore] [fixture:
kanban/lex-keyword-accdescr-upper] [fixture: kanban/lex-keyword-acctitle-dash]
[fixture: kanban/lex-keyword-acctitle-digit] [fixture:
kanban/lex-keyword-acctitle-letter] [fixture:
kanban/lex-keyword-acctitle-non-ascii] [fixture:
kanban/lex-keyword-acctitle-underscore] [fixture:
kanban/lex-keyword-acctitle-upper] [fixture: kanban/lex-keyword-classdef-digit]
[fixture: kanban/lex-keyword-classdef-letter] [fixture:
kanban/lex-keyword-classdef-non-ascii] [fixture:
kanban/lex-keyword-classdef-underscore] [fixture:
kanban/lex-keyword-classdef-upper] [fixture: kanban/lex-keyword-columns-dash]
[fixture: kanban/lex-keyword-columns-letter] [fixture:
kanban/lex-keyword-columns-non-ascii] [fixture:
kanban/lex-keyword-columns-underscore] [fixture:
kanban/lex-keyword-columns-upper] [fixture: kanban/lex-keyword-default-dash]
[fixture: kanban/lex-keyword-default-digit] [fixture:
kanban/lex-keyword-default-letter] [fixture:
kanban/lex-keyword-default-non-ascii] [fixture:
kanban/lex-keyword-default-underscore] [fixture:
kanban/lex-keyword-default-upper] [fixture: kanban/lex-keyword-end-dash]
[fixture: kanban/lex-keyword-end-digit] [fixture: kanban/lex-keyword-end-letter]
[fixture: kanban/lex-keyword-end-underscore] [fixture:
kanban/lex-keyword-end-upper] [fixture: kanban/lex-keyword-interpolate-dash]
[fixture: kanban/lex-keyword-interpolate-digit] [fixture:
kanban/lex-keyword-interpolate-letter] [fixture:
kanban/lex-keyword-interpolate-non-ascii] [fixture:
kanban/lex-keyword-interpolate-underscore] [fixture:
kanban/lex-keyword-interpolate-upper] [fixture:
kanban/lex-keyword-linkstyle-dash] [fixture: kanban/lex-keyword-linkstyle-digit]
[fixture: kanban/lex-keyword-linkstyle-letter] [fixture:
kanban/lex-keyword-linkstyle-non-ascii] [fixture:
kanban/lex-keyword-linkstyle-underscore] [fixture:
kanban/lex-keyword-linkstyle-upper] [fixture: kanban/lex-keyword-space-dash]
[fixture: kanban/lex-keyword-space-digit] [fixture:
kanban/lex-keyword-space-non-ascii] [fixture:
kanban/lex-keyword-space-underscore] [fixture: kanban/lex-keyword-space-upper]
[fixture: kanban/lex-keyword-style-dash] [fixture:
kanban/lex-keyword-style-digit] [fixture: kanban/lex-keyword-style-letter]
[fixture: kanban/lex-keyword-style-non-ascii] [fixture:
kanban/lex-keyword-style-underscore] [fixture: kanban/lex-keyword-title-dash]
[fixture: kanban/lex-keyword-title-digit] [fixture:
kanban/lex-keyword-title-letter] [fixture: kanban/lex-keyword-title-non-ascii]
[fixture: kanban/lex-keyword-title-underscore] [fixture:
kanban/lex-keyword-title-upper] Such a word at the end of its line does not take
the next line, also across an empty line, a comment line, or a directive line:
`title` followed by a line `A[Work]` is two nodes. [fixture:
kanban/lex-keyword-gap-accdescr-blank-line] [fixture:
kanban/lex-keyword-gap-accdescr-comment-line] [fixture:
kanban/lex-keyword-gap-accdescr-directive-line] [fixture:
kanban/lex-keyword-gap-accdescr-lf] [fixture:
kanban/lex-keyword-gap-acctitle-blank-line] [fixture:
kanban/lex-keyword-gap-acctitle-comment-line] [fixture:
kanban/lex-keyword-gap-acctitle-directive-line] [fixture:
kanban/lex-keyword-gap-acctitle-lf] [fixture:
kanban/lex-keyword-gap-classdef-blank-line] [fixture:
kanban/lex-keyword-gap-classdef-comment-line] [fixture:
kanban/lex-keyword-gap-classdef-directive-line] [fixture:
kanban/lex-keyword-gap-classdef-lf] [fixture:
kanban/lex-keyword-gap-style-blank-line] [fixture:
kanban/lex-keyword-gap-style-comment-line] [fixture:
kanban/lex-keyword-gap-style-directive-line] [fixture:
kanban/lex-keyword-gap-style-lf] [fixture:
kanban/lex-keyword-gap-title-blank-line] [fixture:
kanban/lex-keyword-gap-title-comment-line] [fixture:
kanban/lex-keyword-gap-title-directive-line] [fixture:
kanban/lex-keyword-gap-title-lf] `accDescr {}` is rejected at its brace.
[fixture: kanban/gram-acc-descr-block-not-statement] [fixture:
kanban/gram-empty-description-block-after-value] [fixture:
kanban/gram-unclosed-acc-block]

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
   [fixture: kanban/lex-ps-quoted-value] [fixture: kanban/lex-bom-quoted-value]
   [fixture: kanban/lex-ideographic-quoted-value] [fixture:
   kanban/lex-nbsp-quoted-value] [fixture: kanban/lex-tab-quoted-value]
   [fixture: kanban/lex-label-blank-line] [fixture: kanban/lex-label-empty-line]
   [fixture: kanban/spec-kanban-76e41a77] [fixture:
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

At a statement-context unit start, `@{` is a `data-start` unit and enters the
data context. In the data context, the lexer tries these rules in order:

1. `"`: a `data-quote` unit; enters the quoted-data context. [fixture:
   kanban/db-metadata-quotes-empty] [fixture:
   kanban/db-metadata-brace-in-quoted]
2. One or more characters other than `}`, `^`, and `"`: a `data-text` unit.
   [fixture: kanban/db-metadata-all] [fixture: kanban/db-metadata-whitespace]
3. `}`: a `}` unit; leaves the context. [fixture: kanban/db-metadata-all]
   [fixture: kanban/db-metadata-empty]

So a data block ends at the first `}` outside double quotes, and it may be
empty: `@{}` is a `data-start` unit and a `}` unit. [fixture:
kanban/db-metadata-empty] A caret outside double quotes has no rule and is
rejected. [fixture: kanban/gram-metadata-caret] `{` and single quotes are
ordinary content. [fixture: kanban/db-metadata-assigned-single-quoted] [fixture:
kanban/db-metadata-caret-reference] Single quotes do not protect a caret or a
closing brace. [fixture: kanban/gram-metadata-single-caret] [fixture:
kanban/gram-metadata-single-brace] [fixture:
kanban/gram-metadata-assigned-mapping] [fixture:
kanban/gram-metadata-icon-mapping] [fixture: kanban/gram-metadata-label-mapping]
[fixture: kanban/gram-metadata-priority-mapping] [fixture:
kanban/gram-metadata-shape-mapping] [fixture:
kanban/gram-metadata-ticket-mapping]

In the quoted-data context, `"` is a `data-quote` unit and leaves the context,
and one or more other characters are a `data-text` unit, which may hold `}`,
`^`, line feeds, and backslashes. [fixture: kanban/db-metadata-quotes-empty]
[fixture: kanban/db-metadata-quoted-brace] [fixture:
kanban/db-metadata-double-caret] [fixture: kanban/gram-metadata-newline-quotes]
[fixture: kanban/lex-metadata-blank-line] A backslash does not escape the
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
kanban/lex-between-comment-ls-node] [fixture:
kanban/lex-indent-comment-ps-semicolon-space] [fixture:
kanban/lex-indent-comment-ls-semicolon-space] [fixture:
kanban/lex-indent-comment-ps-selected-semicolon-space] [fixture:
kanban/lex-indent-comment-ps-selected-semicolon-touching] [fixture:
kanban/lex-indent-comment-ls-selected-semicolon-touching] [fixture:
kanban/lex-indent-comment-ps-tail-directive-touching]

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
[fixture: kanban/lex-comment-quoted-line] [fixture:
kanban/lex-indent-comment-ps-common-line]

The end of a diagram comment is a `newline` unit, also at U+2028 or U+2029.
Indentation after it starts a new node line. The separator and the whitespace on
its right count as indentation. [fixture: kanban/div-header-comment-ls-node]
[fixture: kanban/div-header-comment-ps-node] [fixture:
kanban/lex-between-comment-ls-node] [fixture: kanban/lex-node-comment-ls]
[fixture: kanban/lex-icon-comment-ls] [fixture: kanban/db-metadata-comment-ls]
[fixture: kanban/lex-indent-comment-ps-selected-semicolon-touching] [fixture:
kanban/lex-indent-comment-ls-selected-semicolon-touching] [fixture:
kanban/lex-indent-comment-ps-selected-semicolon-indent-directive] [fixture:
kanban/lex-indent-comment-ps-space-after-card] [fixture:
kanban/lex-indent-comment-ps-space-after-column]

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
data-block  = data-start ( data-text | data-quote )* "}"
```

Each node or decoration needs a line end. A second statement after a shape, data
suffix, icon, or quoted label is rejected. [fixture:
kanban/gram-two-shapes-on-line] [fixture: kanban/lex-after-shape-colon-space]
[fixture: kanban/lex-after-quoted-colon-space] [fixture:
kanban/lex-after-markdown-colon-space] [fixture:
kanban/lex-after-metadata-colon-space] [fixture:
kanban/lex-after-icon-colon-space] [fixture:
kanban/gram-second-statement-icon-after-shape] [fixture:
kanban/gram-second-statement-class-after-shape] [fixture:
kanban/gram-second-statement-after-metadata] [fixture:
kanban/gram-second-statement-icon-after-metadata] [fixture:
kanban/gram-second-statement-after-icon] [fixture:
kanban/gram-second-statement-after-quoted] [fixture:
kanban/gram-second-statement-after-markdown] A semicolon after a shape, data
suffix, icon, or quoted label is rejected. [fixture:
kanban/lex-after-shape-semicolon] [fixture:
kanban/lex-after-shape-semicolon-spaced] [fixture:
kanban/lex-after-metadata-semicolon] [fixture: kanban/lex-after-icon-semicolon]
[fixture: kanban/lex-after-quoted-semicolon] [fixture:
kanban/lex-after-markdown-semicolon] [fixture:
kanban/lex-after-shape-semicolon-space-semicolon] [fixture:
kanban/lex-after-quoted-semicolon-space-semicolon] [fixture:
kanban/lex-after-markdown-semicolon-space-semicolon] [fixture:
kanban/lex-after-metadata-semicolon-space-semicolon] [fixture:
kanban/lex-after-icon-semicolon-space-semicolon] [fixture:
kanban/lex-after-shape-directive-semicolon] [fixture:
kanban/lex-after-shape-directive-word-semicolon] [fixture:
kanban/lex-after-shape-double-semicolon] [fixture:
kanban/lex-after-quoted-double-semicolon] [fixture:
kanban/lex-after-quoted-semicolon-spaced] [fixture:
kanban/lex-after-markdown-double-semicolon] [fixture:
kanban/lex-after-markdown-semicolon-spaced] [fixture:
kanban/lex-after-metadata-double-semicolon] [fixture:
kanban/lex-after-metadata-semicolon-spaced] [fixture:
kanban/lex-after-icon-double-semicolon] [fixture:
kanban/lex-after-icon-semicolon-spaced] A semicolon inside bare node text or
class text stays text. [fixture: kanban/lex-after-class-semicolon] [fixture:
kanban/db-semicolon-bare-node] [fixture: kanban/db-semicolon-only-node]
[fixture: kanban/lex-after-class-semicolon-space-semicolon] [fixture:
kanban/lex-after-bare-semicolon-space-semicolon] [fixture:
kanban/lex-after-class-double-semicolon] [fixture:
kanban/lex-after-class-semicolon-spaced] [fixture:
kanban/lex-after-bare-double-semicolon] [fixture:
kanban/lex-after-bare-semicolon-spaced]

Whitespace, a diagram comment, and a directive may follow a completed shape,
icon, or data suffix before its line ends. [fixture:
kanban/lex-after-shape-spaces] [fixture: kanban/lex-after-icon-spaces] [fixture:
kanban/lex-after-metadata-spaces] [fixture: kanban/lex-after-shape-comment]
[fixture: kanban/lex-after-icon-comment] [fixture:
kanban/lex-after-metadata-comment] [fixture: kanban/db-metadata-before-comment]
[fixture: kanban/lex-after-shape-crlf] [fixture:
kanban/lex-after-shape-blank-line] [fixture: kanban/lex-after-quoted-crlf]
[fixture: kanban/lex-after-quoted-blank-line] [fixture:
kanban/lex-after-markdown-crlf] [fixture: kanban/lex-after-markdown-blank-line]
[fixture: kanban/lex-after-metadata-crlf] [fixture:
kanban/lex-after-metadata-blank-line] [fixture: kanban/lex-after-icon-crlf]
[fixture: kanban/lex-after-icon-blank-line] [fixture:
kanban/lex-after-class-crlf] [fixture: kanban/lex-after-class-blank-line]
[fixture: kanban/lex-crlf-text-end] [fixture: kanban/lex-after-bare-blank-line]
[fixture: kanban/spec-kanban-4fa35e34] [fixture: kanban/lex-after-shape-tab]
[fixture: kanban/lex-after-shape-nbsp] [fixture: kanban/lex-after-shape-bom]
[fixture: kanban/lex-after-shape-directive] [fixture:
kanban/lex-after-shape-directive-unclosed] [fixture:
kanban/lex-after-shape-directive-word-unclosed] [fixture:
kanban/lex-after-quoted-spaces] [fixture: kanban/lex-after-quoted-tab] [fixture:
kanban/lex-after-quoted-nbsp] [fixture: kanban/lex-after-quoted-bom] [fixture:
kanban/lex-after-quoted-comment] [fixture:
kanban/lex-after-quoted-comment-glued] [fixture:
kanban/lex-after-quoted-directive] [fixture:
kanban/lex-after-quoted-directive-unclosed] [fixture:
kanban/lex-after-quoted-directive-word-unclosed] [fixture:
kanban/lex-after-markdown-spaces] [fixture: kanban/lex-after-markdown-tab]
[fixture: kanban/lex-after-markdown-nbsp] [fixture:
kanban/lex-after-markdown-bom] [fixture: kanban/lex-after-markdown-comment]
[fixture: kanban/lex-after-markdown-comment-glued] [fixture:
kanban/lex-after-markdown-directive] [fixture:
kanban/lex-after-markdown-directive-unclosed] [fixture:
kanban/lex-after-markdown-directive-word-unclosed] [fixture:
kanban/lex-after-metadata-tab] [fixture: kanban/lex-after-metadata-nbsp]
[fixture: kanban/lex-after-metadata-bom] [fixture:
kanban/lex-after-metadata-comment-glued] [fixture:
kanban/lex-after-metadata-directive] [fixture:
kanban/lex-after-metadata-directive-unclosed] [fixture:
kanban/lex-after-metadata-directive-word-unclosed] [fixture:
kanban/lex-after-icon-tab] [fixture: kanban/lex-after-icon-nbsp] [fixture:
kanban/lex-after-icon-bom] [fixture: kanban/lex-after-icon-comment-glued]
[fixture: kanban/lex-after-icon-directive] [fixture:
kanban/lex-after-icon-directive-unclosed] [fixture:
kanban/lex-after-icon-directive-word-unclosed] Class and bare node text keep
their trailing text. [fixture: kanban/lex-after-class-comment] [fixture:
kanban/lex-after-bare-spaces] [fixture: kanban/lex-after-class-colon-space]
[fixture: kanban/lex-after-bare-colon-space] [fixture:
kanban/lex-after-class-spaces] [fixture: kanban/lex-after-class-tab] [fixture:
kanban/lex-after-class-nbsp] [fixture: kanban/lex-after-class-bom] [fixture:
kanban/lex-after-class-comment-glued]

The last node needs no final line feed in the source (see
[End of text](../common.md#end-of-text)). [fixture:
kanban/db-no-final-line-feed] [fixture: kanban/lex-after-shape-end-of-text]
[fixture: kanban/lex-after-quoted-end-of-text] [fixture:
kanban/lex-after-markdown-end-of-text] [fixture:
kanban/lex-after-metadata-end-of-text] [fixture:
kanban/lex-after-icon-end-of-text] [fixture: kanban/lex-after-class-end-of-text]
[fixture: kanban/spec-kanban-0cd8856c] [fixture: kanban/spec-kanban-764a099a]
Shapes, strings, markdown strings, and icons must close. [fixture:
kanban/gram-unclosed-shape] [fixture: kanban/gram-unclosed-quote] [fixture:
kanban/gram-unclosed-markdown] [fixture: kanban/gram-unclosed-icon] A class may
end at the end of the source. Empty forms are rejected (see
[Empty forms](#empty-forms)). [fixture: kanban/div-class-end-empty]

### Nodes and shapes

A node is bare node text, node text followed by a shape, or a shape alone.
[fixture: kanban/db-name-two-words] [fixture: kanban/db-shape-square] [fixture:
kanban/db-name-space-before-shape] A shape alone has no id child. [fixture:
kanban/db-name-no-id] [fixture: kanban/spec-kanban-46081dfb] [fixture:
kanban/spec-kanban-3ef59952]

The diagram body contains columns, each with its cards, under
[Indentation and parents](#indentation-and-parents). Nodes retain their absolute
indentation. [fixture: kanban/db-indent-unindented] [fixture:
kanban/db-indent-tabs] [fixture: kanban/db-indent-deeper] [fixture:
kanban/db-indent-shallower-last] [fixture: kanban/db-sections-items] [fixture:
kanban/spec-kanban-d05521ff] [fixture: kanban/spec-kanban-2ae1792f] [fixture:
kanban/spec-kanban-9d61a67e] [fixture: kanban/docs-syntax-kanban-64d47195]
[fixture: kanban/docs-syntax-kanban-1463e787] The
[tests package](../../../tests/docs/db-summaries.md#kanban) defines value
conversion and publication.

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
[fixture: kanban/db-metadata-multiline] [fixture: kanban/spec-kanban-0a8960fa]
[fixture: kanban/spec-kanban-3283219d] [fixture: kanban/spec-kanban-3da77593]
[fixture: kanban/spec-kanban-4b19cf5b] [fixture: kanban/spec-kanban-98f0b1ea]
[fixture: kanban/spec-kanban-cdfdcce7] [fixture: kanban/spec-kanban-f1762a09]
[fixture: kanban/docs-syntax-kanban-6a07fd6d] [fixture:
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
[fixture: kanban/spec-kanban-3f5b450b] [fixture: kanban/spec-kanban-3fa978ee]
[fixture: kanban/spec-kanban-7ab4b766] A decoration before a later, deeper node
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
[fixture: kanban/lex-id-blank-line] [fixture: kanban/spec-kanban-39a3f7b2]
[fixture: kanban/spec-kanban-3e2d4f7b] [fixture: kanban/spec-kanban-4eec5c8a]
[fixture: kanban/spec-kanban-cf8e8c50] [fixture: kanban/spec-kanban-da074888]
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

### Indentation and parents

The first node is a column. A later node with the same indentation as that first
node is another column; every other node is a card of the most recent column.
Columns appear in KanbanDiagram.body and their cards in KanbanNode.children, in
source order. A card is never a parent, even when a later card is more deeply
indented. The first indentation may be zero or nonzero; multiple columns and
arbitrary increases or decreases above that baseline are allowed. [fixture:
kanban/db-indent-unindented] [fixture: kanban/db-indent-tabs] [fixture:
kanban/db-sections-items] [fixture: kanban/spec-kanban-d05521ff] [fixture:
kanban/db-indent-deeper] [fixture: kanban/lex-indent-comment-ps-semicolon-space]
[fixture: kanban/lex-indent-comment-ps-space-after-card] [fixture:
kanban/lex-indent-comment-ps-space-after-column] [fixture:
kanban/lex-indent-comment-ls-space-after-column] [fixture:
kanban/lex-indent-comment-ps-two-spaces-after-card] [fixture:
kanban/lex-indent-comment-ps-after-card-then-column] [fixture:
kanban/lex-indent-comment-ps-zero-baseline]

A final node shallower than the first column is still a card of the most recent
column. The rejection below prevents another node from following it; decorations
and empty lines do not count as another node. Repeated ids do not merge columns
or cards. [fixture: kanban/db-indent-shallower-last] [fixture:
kanban/gram-indent-shallower-followed] [fixture:
kanban/gram-shallower-then-decoration] [fixture:
kanban/gram-shallower-then-empty] [fixture: kanban/db-section-three-definitions]
[fixture: kanban/db-section-item-same-id]

Icon and class lines decorate the last written node regardless of indentation;
they do not become cards or change the next card's column. Shared directives,
comments, empty lines and selected ignored semicolons add no hierarchy nodes.
Retain the lexical indentation count, including a comment-ending LS/PS. An
unselected semicolon remains text rather than separating cards. Title and
classDef-looking text remain nodes; an empty description block is not a common
statement here. [fixture: kanban/gram-decoration-then-child] [fixture:
kanban/gram-nesting-item-decoration-before-deeper-item] [fixture:
kanban/lex-indent-directive] [fixture:
kanban/lex-keyword-gap-title-directive-line] [fixture: kanban/lex-comment-line]
[fixture: kanban/lex-keyword-gap-title-blank-line] [fixture:
kanban/lex-id-style-rule] [fixture: kanban/lex-after-bare-semicolon-spaced]
[fixture: kanban/lex-node-comment-ls] [fixture:
kanban/gram-nesting-card-after-comment-ps] [fixture:
kanban/gram-nesting-card-ls-ordinary-indent] [fixture:
kanban/gram-nesting-card-ps-ordinary-indent] [fixture:
kanban/gram-nesting-common-looking-title-is-card] [fixture:
kanban/gram-nesting-classdef-looking-text-is-card] [fixture:
kanban/gram-empty-description-block-after-value]

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
  [fixture: kanban/div-directive-data-marker] [fixture:
  kanban/div-directive-opener-round-dash] [fixture:
  kanban/div-directive-opener-double-close] [fixture:
  kanban/div-directive-opener-double-brace] [fixture:
  kanban/div-directive-closer-double-brace] [fixture:
  kanban/div-directive-closer-round-dash] [fixture:
  kanban/div-directive-closer-dash-round] [fixture:
  kanban/div-directive-closer-double-open] [fixture:
  kanban/div-directive-opener-dash-round]

- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  The semicolon selected by the common line rule inside a shape opener or closer
  is rejected. mermaid.js removes it. [fixture: kanban/div-semicolon-opener]
  [fixture: kanban/div-semicolon-closer] [fixture:
  kanban/div-semicolon-opener-round-dash] [fixture:
  kanban/div-semicolon-opener-double-close] [fixture:
  kanban/div-semicolon-opener-double-open] [fixture:
  kanban/div-semicolon-closer-double-close] [fixture:
  kanban/div-semicolon-closer-round-dash] [fixture:
  kanban/div-semicolon-closer-dash-round] [fixture:
  kanban/div-semicolon-closer-double-open]

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
  [fixture: kanban/gram-metadata-shape-underscore] [fixture:
  kanban/gram-metadata-section-shape] [fixture:
  kanban/gram-metadata-shape-double-quoted] [fixture:
  kanban/gram-metadata-shape-infinity-word] [fixture:
  kanban/gram-metadata-shape-list] [fixture:
  kanban/gram-metadata-shape-nan-word] [fixture:
  kanban/gram-metadata-shape-negative] [fixture:
  kanban/gram-metadata-shape-plain] [fixture: kanban/gram-metadata-shape-plus]
  [fixture: kanban/gram-metadata-shape-single-quoted] [fixture:
  kanban/gram-metadata-shape-true] An empty multiline block and adjacent blocks
  whose combined content mermaid.js rejects are accepted. [fixture:
  kanban/gram-metadata-empty-multiline] [fixture:
  kanban/gram-metadata-two-blocks]
