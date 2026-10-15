# XY chart

Japanese version: [xychart.ja.md](./xychart.ja.md)

Source of truth in mermaid.js:

- [`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison)
- [`xychartDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDb.ts)
- the tests (`*.spec.ts`) in
  [`xychart/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart)

This document covers the diagram type `xychart`. The nodes of the tree are
defined in [ast/xychart.md](../ast/xychart.md).

## Detection

Entry 25 of [detection.md](../detection.md) selects this grammar: the text
starts with `xychart`, after whitespace, in exactly this case
([`xychartDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/xychartDetector.ts#L9-L11)).
`XYCHART` and `Xychart-Beta` match no detector; U+FEFF and U+00A0 before the
header are whitespace. [fixture: xychart/db-header-plain] [fixture:
xychart/db-header-beta-only] [fixture: xychart/header-indented] [fixture:
xychart/header-tab-indented] [fixture: xychart/header-nbsp-before] [fixture:
xychart/header-bom-before] [fixture: xychart/header-after-blank-lines] [fixture:
xychart/spec-xychart-jison-b46d27a1] [fixture: xychart/header-upper-case]
[fixture: xychart/header-beta-capitalized]

The lexer then reads the header, the keyword `xychart-beta` or the keyword
`xychart`, compared case-insensitively and not followed by a word character (see
[The statement context](#the-statement-context)). The two headers are the same
diagram type. `xychart-BETA` is a header, while `xychart-betax`, `xychartx`,
`xychart-1`, and `xychart-betaé` are rejected. The header may be the whole text.
[fixture: xychart/header-beta-upper-case-suffix] [fixture:
xychart/header-word-suffix] [fixture: xychart/header-plain-word-suffix]
[fixture: xychart/header-dash-suffix] [fixture:
xychart/spec-xychart-jison-80dffe73] [fixture: xychart/header-non-ascii-suffix]
[fixture: xychart/header-without-line-feed] [fixture:
xychart/spec-xychart-jison-d2539031]

A comment line and a directive line before the header change nothing, and so do
a line of `%%` alone and a line `%%{ }%%`, which are comment lines; a line that
starts with `#` before the header is read by no detector. [fixture:
xychart/header-after-comment-line] [fixture:
xychart/header-after-directive-line] [fixture:
xychart/header-after-bare-percent-line] [fixture:
xychart/header-after-empty-braces-line] [fixture:
xychart/header-after-bare-percent-line-and-whitespace-line] [fixture:
xychart/gram-header-after-hash-line]

On the line of the header, the header may be followed by an orientation, a
statement, a `;`, a comment, or nothing; any other text makes the input
rejected, such as `{`, `[`, `:`, `,`, a number, `#`, a quote, or a word that is
no keyword. [fixture: xychart/header-statement-on-header-line] [fixture:
xychart/header-line-on-header-line] [fixture: xychart/header-semicolon]
[fixture: xychart/header-semicolon-only] [fixture:
xychart/header-semicolon-spaced] [fixture:
xychart/header-comment-on-header-line] [fixture:
xychart/header-comment-glued-to-header] [fixture:
xychart/header-directive-glued-after-header] [fixture:
xychart/gram-header-brace-suffix] [fixture: xychart/gram-header-bracket-suffix]
[fixture: xychart/gram-header-colon-suffix] [fixture:
xychart/gram-header-comma-suffix] [fixture: xychart/gram-header-digit-suffix]
[fixture: xychart/gram-header-hash-suffix] [fixture:
xychart/gram-header-quote-suffix] [fixture: xychart/spec-xychart-jison-45159c50]
The statement may be a description block, also an empty one:
`xychart accDescr {}` and `xychart accDescr {x}` are accepted. [fixture:
xychart/db-header-line-empty-description-block] [fixture:
xychart/db-header-line-description-block]

The **orientation** is the keyword `vertical` or `horizontal`, compared
case-insensitively, right after a header, with whitespace other than a line feed
between them, or with whitespace and line feeds after whitespace between them
(see [Line breaks](#units-and-contexts)); a statement may follow it on its line.
It stands nowhere else: after a line break, after `;`, twice, followed by a
letter, after a statement, as a title, as the title of an axis, or as a
category, it makes the input rejected, while in quotes it is a text. [fixture:
xychart/db-orientation-vertical] [fixture: xychart/db-orientation-horizontal]
[fixture: xychart/db-orientation-capitalized] [fixture:
xychart/db-orientation-upper-case] [fixture:
xychart/db-orientation-vertical-upper-case] [fixture:
xychart/db-orientation-tab] [fixture: xychart/db-orientation-two-spaces]
[fixture: xychart/db-orientation-nbsp] [fixture:
xychart/db-orientation-plain-header] [fixture:
xychart/db-orientation-with-statement] [fixture:
xychart/spec-xychart-jison-03b26531] [fixture:
xychart/spec-xychart-jison-6668e7e4] [fixture:
xychart/gram-orientation-on-next-line] [fixture:
xychart/gram-orientation-on-second-line-after-semicolon] [fixture:
xychart/gram-orientation-twice] [fixture: xychart/gram-orientation-word-suffix]
[fixture: xychart/gram-orientation-after-statement] [fixture:
xychart/gram-orientation-as-title] [fixture:
xychart/gram-orientation-as-axis-title] [fixture:
xychart/gram-orientation-as-category] [fixture:
xychart/db-orientation-in-quotes]

## Lexical structure

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it. At each position, the lexer
applies the first rule of the current context that matches there. Whitespace
that a rule reads belongs to no unit unless the rule says otherwise. When no
rule of the current context matches, the input is rejected; the lists below do
not repeat this.

The text may end in any context but the string context, the category context,
and the values context: a string, the categories, and the values must be closed,
so `title "T` and `line [1, 2` at the end of the text are rejected. It may end
in the description block context, whose block then runs to the end of the text,
and right after `accTitle:` or `accDescr:`. [fixture:
xychart/gram-title-quoted-unclosed-at-end] [fixture:
xychart/gram-plot-values-unclosed] [fixture: xychart/gram-x-axis-band-unclosed]
[fixture: xychart/gram-x-axis-band-unclosed-string] [fixture:
xychart/db-acc-descr-unclosed-block] [fixture: xychart/db-acc-title-empty]
[fixture: xychart/db-title-at-end-of-text] [fixture:
xychart/db-x-axis-title-at-end-of-text] [fixture:
xychart/db-lines-no-line-feed-at-end]

**Whitespace.** Whitespace in this document is the set of
[Notation](../common.md#notation): a tab, a vertical tab, a form feed, U+00A0,
U+2028, U+2029, U+3000, and U+FEFF are whitespace wherever a rule reads
whitespace. Outside a string and an accessibility text, a run of whitespace that
starts with a character other than a line feed lies between units without being
part of one, and so do the line feeds in it (see Line breaks below): before and
after a statement, between the words of a text, and around the brackets, the
commas, and the arrow. A U+2028 or a U+2029 is no line break: `line [1]`,
U+2028, and `bar [2]` are two statements on one line. [fixture:
xychart/db-statement-tab-indented] [fixture:
xychart/db-lines-form-feed-before-statement] [fixture:
xychart/db-lines-vertical-tab-before-statement] [fixture:
xychart/db-title-bom-before-keyword] [fixture: xychart/db-title-bom-after-word]
[fixture: xychart/db-lines-keyword-bom-end] [fixture:
xychart/db-lines-statements-after-bom-and-tab] [fixture:
xychart/db-title-nbsp-before-keyword] [fixture:
xychart/db-lines-nbsp-after-statement] [fixture:
xychart/db-lines-trailing-spaces] [fixture: xychart/db-lines-trailing-tab]
[fixture: xychart/db-title-form-feed-after-word] [fixture:
xychart/db-title-tab-separator] [fixture: xychart/db-title-nbsp-between-words]
[fixture: xychart/db-title-ideographic-space] [fixture:
xychart/db-lines-unicode-line-separator-between-statements] [fixture:
xychart/db-title-line-separator-end] [fixture:
xychart/db-title-paragraph-separator-end] [fixture:
xychart/db-grid-ls-title-bare] [fixture: xychart/db-grid-ps-title-bare]
[fixture: xychart/db-grid-tab-title-bare] [fixture:
xychart/db-grid-bom-title-bare] [fixture: xychart/db-grid-ls-x-title-bare]
[fixture: xychart/db-grid-ls-category-bare] [fixture:
xychart/db-grid-ls-y-title-bare] [fixture: xychart/db-grid-ls-plot-title-bare]
[fixture: xychart/db-plot-values-tab-inside] [fixture:
xychart/db-plot-values-nbsp-inside] [fixture:
xychart/db-plot-values-line-separator-inside] [fixture:
xychart/db-plot-values-bom-inside] [fixture:
xychart/db-plot-values-form-feed-inside] [fixture:
xychart/db-x-axis-band-tab-inside] [fixture: xychart/db-x-axis-band-nbsp-inside]
[fixture: xychart/db-x-axis-band-line-separator-inside] [fixture:
xychart/db-grid-tab-x-title-bare] [fixture: xychart/db-grid-tab-category-bare]
[fixture: xychart/db-grid-tab-y-title-bare] [fixture:
xychart/db-grid-tab-plot-title-bare] [fixture: xychart/db-grid-bom-x-title-bare]
[fixture: xychart/db-grid-bom-category-bare] [fixture:
xychart/db-grid-bom-y-title-bare] [fixture: xychart/db-grid-bom-plot-title-bare]
[fixture: xychart/db-grid-nbsp-x-title-bare] [fixture:
xychart/db-grid-nbsp-category-bare] [fixture: xychart/db-grid-nbsp-y-title-bare]
[fixture: xychart/db-grid-nbsp-plot-title-bare] [fixture:
xychart/db-grid-ideographic-x-title-bare] [fixture:
xychart/db-grid-ideographic-category-bare] [fixture:
xychart/db-grid-ideographic-y-title-bare] [fixture:
xychart/db-grid-ideographic-plot-title-bare] [fixture:
xychart/db-grid-ps-x-title-bare] [fixture: xychart/db-grid-ps-category-bare]
[fixture: xychart/db-grid-ps-y-title-bare] [fixture:
xychart/db-grid-ps-plot-title-bare]

**Line breaks.** A line break of the source is a line feed in the diagram text
(see [Reading a source](../common.md#reading-a-source)), so a CRLF and a lone CR
end a line as a line feed does. A line feed where a unit starts is a **line
break**: it ends a text without quotes and a statement, and a line feed inside
the brackets, or between a keyword and the rest of its statement, makes the
input rejected. A line feed after whitespace on its line is no line break: it
belongs to the run of whitespace before it, with any further line feeds and
whitespace after it, so a statement goes on to the next line when its line ends
with whitespace. `title A`, a space, a line break, and `B` is the title `AB`; a
plot title, a space, a line break, and `[1]` is a plot; a category, a value, a
label, the arrow, or the end of a range may stand on the line after a comma, a
value, or a number and a space; and the orientation may stand on the line after
the header and a space. A directive between the whitespace and the line feed
changes nothing, while a directive glued to a unit leaves the line feed a line
break: `title A`, a space, a directive, a line break, and `B` is the title `AB`,
and without the space it is rejected. A comment line after a line that ends with
whitespace is no line of the diagram text (see
[Comment lines](../common.md#comment-lines)), so `title A`, a space, a line
break, a line `%% c`, and `B` is the title `AB`, and without the space it is
rejected; a line `%%` alone is a comment of this lexer (see
[Comments](#comments)), whose line feed is a line break, so `title A`, a space,
a line `%%`, and `B` is rejected. The text of an accessibility statement ends at
its line feed, also after whitespace. A title, a category, the title of an axis
or of a plot, and the values are otherwise on the line of their keyword.
[fixture: xychart/db-whitespace-line-feed-title-words] [fixture:
xychart/db-whitespace-line-feed-title-after-keyword] [fixture:
xychart/db-whitespace-tab-line-feed-title-words] [fixture:
xychart/db-whitespace-two-line-feeds-title-words] [fixture:
xychart/db-whitespace-line-separator-line-feed-title-words] [fixture:
xychart/db-whitespace-crlf-title-words] [fixture:
xychart/db-whitespace-lone-cr-title-words] [fixture:
xychart/db-whitespace-line-feed-axis-title-words] [fixture:
xychart/db-whitespace-line-feed-plot-title-words] [fixture:
xychart/db-whitespace-line-feed-plot-title-then-values] [fixture:
xychart/db-whitespace-line-feed-plot-keyword-then-values] [fixture:
xychart/db-whitespace-line-feed-axis-title-then-band] [fixture:
xychart/db-whitespace-line-feed-axis-keyword-then-band] [fixture:
xychart/db-whitespace-line-feed-y-axis-keyword-then-range] [fixture:
xychart/db-whitespace-line-feed-in-categories] [fixture:
xychart/db-whitespace-line-feed-in-values] [fixture:
xychart/db-whitespace-line-feed-before-comma] [fixture:
xychart/db-whitespace-line-feed-before-label] [fixture:
xychart/db-whitespace-line-feed-in-range-before-arrow] [fixture:
xychart/db-whitespace-line-feed-in-range-after-arrow] [fixture:
xychart/db-whitespace-line-feed-header-then-orientation] [fixture:
xychart/db-whitespace-tab-line-feed-header-then-orientation] [fixture:
xychart/db-whitespace-two-line-feeds-header-then-orientation] [fixture:
xychart/gram-whitespace-line-feed-title-then-string] [fixture:
xychart/gram-acc-title-trailing-space-then-word] [fixture:
xychart/db-whitespace-directive-line-feed-title-words] [fixture:
xychart/gram-directive-line-feed-title-words] [fixture:
xychart/db-whitespace-comment-line-title-words] [fixture:
xychart/gram-comment-line-title-words] [fixture:
xychart/gram-whitespace-bare-percent-line-title-words] [fixture:
xychart/db-title-crlf-line-ends] [fixture: xychart/db-title-lone-cr-line-ends]
[fixture: xychart/db-lines-statement-on-header-line-crlf] [fixture:
xychart/db-statement-blank-lines] [fixture: xychart/gram-grid-lf-title-bare]
[fixture: xychart/gram-grid-crlf-title-bare] [fixture:
xychart/gram-grid-cr-title-bare] [fixture: xychart/gram-grid-lf-acc-title]
[fixture: xychart/gram-grid-crlf-acc-title] [fixture:
xychart/gram-grid-cr-acc-title] [fixture: xychart/gram-grid-lf-acc-descr]
[fixture: xychart/gram-grid-crlf-acc-descr] [fixture:
xychart/gram-grid-cr-acc-descr] [fixture: xychart/gram-grid-lf-x-title-bare]
[fixture: xychart/gram-grid-crlf-x-title-bare] [fixture:
xychart/gram-grid-cr-x-title-bare] [fixture: xychart/gram-grid-lf-category-bare]
[fixture: xychart/gram-grid-crlf-category-bare] [fixture:
xychart/gram-grid-cr-category-bare] [fixture: xychart/gram-grid-lf-y-title-bare]
[fixture: xychart/gram-grid-crlf-y-title-bare] [fixture:
xychart/gram-grid-cr-y-title-bare] [fixture:
xychart/gram-grid-lf-plot-title-bare] [fixture:
xychart/gram-grid-crlf-plot-title-bare] [fixture:
xychart/gram-grid-cr-plot-title-bare] [fixture:
xychart/gram-title-text-on-next-line] [fixture:
xychart/gram-plot-values-line-feed-before-bracket] [fixture:
xychart/gram-plot-values-title-line-feed-before-bracket] [fixture:
xychart/gram-plot-values-line-feed-after-bracket] [fixture:
xychart/gram-plot-values-line-feed-before-comma] [fixture:
xychart/gram-plot-values-crlf-inside] [fixture:
xychart/gram-x-axis-band-line-feed] [fixture:
xychart/gram-x-axis-line-feed-before-bracket]

**Entities.** An entity is read as its placeholder before the lexer reads the
text (see [Entities](../common.md#entities)), and the placeholder is made of
characters outside ASCII. In a string and in an accessibility text it is a
character of the text, which keeps the entity as written: `title "a#35;b"` has
the title `a#35;b`. Outside them it is read by no rule, so `title a#35;b`, a
category `a#35;b`, and the title `a#35;b` of an axis or of a plot are rejected.
[fixture: xychart/lex-title-entity-in-quotes] [fixture: xychart/db-label-entity]
[fixture: xychart/db-plot-title-entity] [fixture: xychart/db-x-axis-band-entity]
[fixture: xychart/lex-acc-title-entity] [fixture: xychart/lex-acc-descr-entity]
[fixture: xychart/lex-acc-descr-block-entity] [fixture:
xychart/lex-title-quoted-hash-word-semicolon-entity] [fixture:
xychart/db-grid-entity-acc-title] [fixture: xychart/db-grid-entity-acc-descr]
[fixture: xychart/db-grid-entity-acc-descr-block] [fixture:
xychart/db-grid-entity-x-title-quoted] [fixture:
xychart/db-grid-entity-category-quoted] [fixture:
xychart/db-grid-entity-y-title-quoted] [fixture:
xychart/db-grid-entity-plot-title-quoted] [fixture:
xychart/gram-title-entity-bare] [fixture: xychart/gram-grid-entity-x-title-bare]
[fixture: xychart/gram-grid-entity-category-bare] [fixture:
xychart/gram-grid-entity-y-title-bare] [fixture:
xychart/gram-grid-entity-plot-title-bare]

**HTML attribute quotes and `style` lines.** The attribute quotes of an HTML tag
are read as `'` as in every diagram type (see
[HTML attribute quotes](../common.md#html-attribute-quotes)), so a tag with
quotes is a text in quotes and in an accessibility text, while without quotes
its `<` is read by no rule. The `;` that the line rule of `style` and `classDef`
lines ignores (see [Reading a source](../common.md#reading-a-source)) is left
out of a text in quotes and of an accessibility text. [fixture:
xychart/db-title-html-tag-in-quotes] [fixture: xychart/db-title-quoted-html]
[fixture: xychart/db-grid-html-acc-title] [fixture:
xychart/db-grid-html-acc-descr] [fixture: xychart/db-grid-html-acc-descr-block]
[fixture: xychart/db-grid-html-x-title-quoted] [fixture:
xychart/db-grid-html-category-quoted] [fixture:
xychart/db-grid-html-y-title-quoted] [fixture:
xychart/db-grid-html-plot-title-quoted] [fixture: xychart/db-grid-html-label]
[fixture: xychart/gram-grid-html-title-bare] [fixture:
xychart/gram-grid-html-x-title-bare] [fixture:
xychart/gram-grid-html-category-bare] [fixture:
xychart/gram-grid-html-y-title-bare] [fixture:
xychart/gram-grid-html-plot-title-bare] [fixture:
xychart/lex-title-style-line-semicolon] [fixture:
xychart/db-label-style-line-semicolon] [fixture:
xychart/db-plot-title-style-line-semicolon] [fixture:
xychart/db-x-axis-band-quoted-style-line-semicolon] [fixture:
xychart/db-x-axis-title-quoted-style-line-semicolon] [fixture:
xychart/db-y-axis-title-quoted-style-line-semicolon] [fixture:
xychart/lex-acc-title-style-line-semicolon] [fixture:
xychart/lex-acc-descr-style-line-semicolon] [fixture:
xychart/lex-acc-descr-block-style-line-semicolon] [fixture:
xychart/db-grid-style-acc-title] [fixture: xychart/db-grid-style-acc-descr]
[fixture: xychart/db-grid-style-acc-descr-block] [fixture:
xychart/db-grid-style-x-title-quoted] [fixture:
xychart/gram-grid-style-title-bare] [fixture:
xychart/gram-grid-style-x-title-bare] [fixture:
xychart/gram-grid-style-category-bare] [fixture:
xychart/gram-grid-style-y-title-bare] [fixture:
xychart/gram-grid-style-plot-title-bare] [fixture:
xychart/lex-style-line-classdef] [fixture:
xychart/lex-style-line-does-not-cross-lines-in-quotes] [fixture:
xychart/lex-style-line-no-hash] [fixture:
xychart/lex-style-line-semicolon-in-second-line-of-quotes] [fixture:
xychart/lex-style-line-semicolon-two] [fixture:
xychart/lex-style-line-space-after-colon] [fixture:
xychart/lex-style-line-statement-separator] [fixture:
xychart/lex-style-line-upper-case-keyword] [fixture:
xychart/db-title-quoted-hash-and-semicolon-apart]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string keeps the
reading of mermaid.js, while a directive inside any other unit makes the input
rejected. The **text units** are a `word`, an `acc-title-text`, an
`acc-description-text`, and a `description-block-text`. The other units, the
header, the orientation, the keywords, a `number`, `-->`, the brackets, `,`,
`;`, `:`, `{`, and `}`, are no text units.

- A directive between the words of a text, inside a word, inside a string, and
  inside an accessibility text joins the parts around it, as in mermaid.js:
  `title A%%{init: {}}%% B` has the title `AB`, a category `a%%{init: {}}%%b`
  the category `ab`, and `title "T%%{init: {}}%%U"` the title `TU`. A comment
  line or a directive line inside a string is left out with its line. [fixture:
  xychart/db-directive-between-title-words] [fixture:
  xychart/db-x-axis-band-directive-in-word] [fixture:
  xychart/db-title-directive-in-quotes] [fixture:
  xychart/db-title-directive-after-bare] [fixture:
  xychart/db-acc-descr-block-directive-inside] [fixture:
  xychart/db-acc-descr-block-comment-line-inside] [fixture:
  xychart/db-title-quoted-comment-line-inside] [fixture:
  xychart/db-title-quoted-directive-line-inside] [fixture:
  xychart/db-grid-directive-title-bare] [fixture:
  xychart/db-grid-directive-title-quoted] [fixture:
  xychart/db-grid-directive-acc-title] [fixture:
  xychart/db-grid-directive-acc-descr] [fixture:
  xychart/db-grid-directive-acc-descr-block] [fixture:
  xychart/db-grid-directive-x-title-bare] [fixture:
  xychart/db-grid-directive-x-title-quoted] [fixture:
  xychart/db-grid-directive-category-bare] [fixture:
  xychart/db-grid-directive-category-quoted] [fixture:
  xychart/db-grid-directive-y-title-bare] [fixture:
  xychart/db-grid-directive-y-title-quoted] [fixture:
  xychart/db-grid-directive-plot-title-bare] [fixture:
  xychart/db-grid-directive-plot-title-quoted] [fixture:
  xychart/db-grid-directive-label]
- A directive between two units is allowed: on a line of its own, before a
  keyword, between a keyword and a bracket, between the values or the
  categories, between a number and the arrow, and after a statement. [fixture:
  xychart/db-directive-line] [fixture:
  xychart/db-title-directive-before-keyword] [fixture:
  xychart/db-directive-glued-to-keyword] [fixture:
  xychart/db-plot-directive-inside] [fixture: xychart/db-x-axis-band-directive]
  [fixture: xychart/db-directive-in-range] [fixture:
  xychart/db-directive-between-label] [fixture: xychart/db-directive-after-plot]
- A directive inside a keyword, a number, or the arrow makes the input rejected,
  while mermaid.js joins the parts: `ti%%{init: {}}%%tle T`,
  `x-%%{init: {}}%%axis [a]`, `line [1%%{init: {}}%%2]`,
  `x-axis 1%%{init: {}}%%0 --> 20`, and `x-axis 1 -%%{init: {}}%%-> 5`. This is
  the known divergence
  [`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).
  [fixture: xychart/div-directive-in-keyword] [fixture:
  xychart/div-directive-in-axis-keyword] [fixture:
  xychart/db-plot-directive-in-number] [fixture:
  xychart/div-directive-in-range-number] [fixture:
  xychart/db-directive-in-arrow]
- A directive that is not closed runs to the end of the text, and its argument
  may start on the next line (see
  [Where a directive is](../common.md#where-a-directive-is)): `%%{init` at the
  end of the text, after a statement or after the header, takes nothing else,
  while `title T %%{init` followed by a line `line [1]` takes the word `line` as
  its argument, and the rest of that line is rejected. [fixture:
  xychart/db-directive-unclosed-at-end] [fixture:
  xychart/db-directive-unclosed-after-header] [fixture:
  xychart/db-directive-unclosed-after-plot] [fixture:
  xychart/db-directive-unclosed-after-categories] [fixture:
  xychart/gram-directive-unclosed-next-line]

### The statement context

The rules of the statement context, in the order they are tried:

1. `%%` and the rest of its line: a comment (see [Comments](#comments)).
2. One or more line feeds: a `newline` unit.
3. A **keyword**, compared case-insensitively:
   - `title`, `xychart-beta`, `xychart`, `x-axis`, `y-axis`, `line`, and `bar`,
     each not followed by a word character (a letter, a digit, or `_`): the unit
     named by the keyword, or the header for `xychart-beta` and `xychart`.
     `x-axis` and `y-axis` enter the axis context, and `line` and `bar` the plot
     context;
   - `vertical` and `horizontal`, followed by anything: an `orientation` unit;
   - `accTitle` and `accDescr`, whitespace, line feeds included, and `:`: an
     `accTitle` or `accDescr` unit and a `:` unit, which enter the accessibility
     context of the keyword;
   - `accDescr`, whitespace, line feeds included, and `{`: an `accDescr` unit
     and a `{` unit, which enter the description block context.
4. `"`: enters the string context (see [Strings](#strings)).
5. `[` or `]`: a unit of that character.
6. One or more letters of ASCII, one or more digits, or one of `-`, `_`, `.`,
   `+`, `=`, `*`, `&`, `#`: a `word` unit.
7. `,` or `;`: a unit of that character.
8. One or more whitespace characters, line feeds included: nothing.

A keyword is tried before a word at every position where a unit starts, and a
word of letters reads all the letters that follow one another, so a keyword is
read at the start of a run of letters: after a digit, `_`, `-`, or `.` inside a
word, `a1bar`, `T_line`, `a-title`, `a.line`, `a-xychart`, and `a-x-axis` hold a
keyword and are rejected, while `titleX`, `Titled`, `Barbara`, `a-titles`, and
`1accTitle` are words. A keyword of the first item of rule 3 followed by a
character that is no word character, such as `-` or `.`, is that keyword, and
the character starts the next unit: `x-axis-foo` and `y-axis-foo` are an axis
with the title `-foo`, `title-x` is the title `-x`, and `line.5` and `bar.5` are
a plot with the title `.5`. `vertical` and `horizontal` need no boundary after
them: `Verticals` and `a_vertical` hold the orientation and are rejected, while
`aVertical` is a word. A keyword in another case is a keyword: `Title`, `TITLE`,
`Bar`, `LINE`, `X-AXIS`, `ACCTITLE:`, and `ACCDESCR {` start statements, and
`title Title` is rejected. A keyword without quotes is never a text:
`title line`, a category `line`, and an axis title `Title` are rejected, while
in quotes and in an accessibility text a keyword is text. `accTitle` without a
`:` is letters of a word, and a letter, a digit, or a dash between `accTitle`
and the `:`, or a space inside `accTitle`, makes the input rejected. [fixture:
xychart/db-x-axis-keyword-glued-hyphen-title] [fixture:
xychart/db-y-axis-keyword-glued-hyphen-title] [fixture:
xychart/db-title-keyword-glued-hyphen] [fixture:
xychart/db-plot-keyword-glued-dot-title] [fixture:
xychart/db-bar-keyword-glued-dot-title] [fixture:
xychart/db-title-capitalized-keyword] [fixture:
xychart/db-title-upper-case-keyword] [fixture:
xychart/db-plot-capitalized-keyword] [fixture:
xychart/db-plot-upper-case-keyword] [fixture:
xychart/db-x-axis-upper-case-keyword] [fixture: xychart/db-acc-title-upper-case]
[fixture: xychart/db-acc-descr-block-upper-case] [fixture:
xychart/db-title-keyword-prefix-word] [fixture:
xychart/db-x-axis-title-keyword-prefix] [fixture:
xychart/db-keyword-capitalized-prefix-of-word] [fixture:
xychart/db-plot-keyword-prefix-of-word] [fixture:
xychart/db-keyword-word-starting-with-title-after-hyphen] [fixture:
xychart/db-acc-keyword-without-colon-in-word] [fixture:
xychart/db-orientation-inside-word] [fixture: xychart/gram-title-glued]
[fixture: xychart/gram-title-plural] [fixture:
xychart/gram-plot-values-keyword-glued-title] [fixture:
xychart/gram-plot-values-bar-keyword-glued] [fixture:
xychart/gram-x-axis-keyword-suffix] [fixture:
xychart/gram-acc-title-word-suffix] [fixture:
xychart/gram-acc-title-digit-suffix] [fixture:
xychart/gram-acc-title-dash-suffix] [fixture:
xychart/gram-acc-title-space-in-keyword] [fixture:
xychart/gram-keyword-after-digit-in-word] [fixture:
xychart/gram-keyword-after-underscore-in-word] [fixture:
xychart/gram-keyword-after-hyphen-in-word] [fixture:
xychart/gram-keyword-after-dot-in-word] [fixture:
xychart/gram-header-keyword-in-word] [fixture:
xychart/gram-axis-keyword-in-word] [fixture:
xychart/gram-orientation-prefix-of-word] [fixture:
xychart/gram-orientation-after-underscore-in-word] [fixture:
xychart/gram-title-bare-title-keyword] [fixture:
xychart/gram-title-keyword-as-text] [fixture:
xychart/gram-grid-keyword-title-bare] [fixture:
xychart/gram-grid-keyword-x-title-bare] [fixture:
xychart/gram-grid-keyword-y-title-bare] [fixture:
xychart/gram-grid-keyword-plot-title-bare] [fixture:
xychart/gram-x-axis-title-bare-title-keyword] [fixture:
xychart/gram-y-axis-title-bare-title-keyword] [fixture:
xychart/gram-grid-keyword-category-bare] [fixture:
xychart/gram-x-axis-band-title-keyword] [fixture:
xychart/gram-x-axis-band-keyword-upper-case] [fixture:
xychart/gram-x-axis-band-keyword] [fixture:
xychart/gram-x-axis-band-axis-keyword] [fixture:
xychart/db-grid-keyword-title-quoted] [fixture:
xychart/db-grid-keyword-acc-title] [fixture: xychart/db-grid-keyword-acc-descr]
[fixture: xychart/db-grid-keyword-acc-descr-block] [fixture:
xychart/db-grid-keyword-x-title-quoted] [fixture:
xychart/db-grid-keyword-category-quoted] [fixture:
xychart/db-grid-keyword-y-title-quoted] [fixture:
xychart/db-grid-keyword-plot-title-quoted] [fixture:
xychart/db-grid-keyword-label] [fixture: xychart/db-title-quoted-keyword]
[fixture: xychart/db-x-axis-band-quoted-keyword]

So a text without quotes is made of letters of ASCII, digits, and `-`, `_`, `.`,
`+`, `=`, `*`, `&`, and `#`, a `#` being no comment: `title T # c` has the title
`T#c`. Any other character is read by no rule, or is a unit that no text takes:
`,`, `:`, `/`, `(`, `)`, `'`, `<`, `>`, `[`, `]`, a single `%`, a backquote, and
any character outside ASCII make a title, a category, and the title of an axis
or of a plot rejected. A line that starts with `#` is a word, and no statement.
`__proto__` and `constructor` are words like any other. [fixture:
xychart/db-title-bare-characters] [fixture: xychart/db-title-hash-bare-word]
[fixture: xychart/db-title-bare-hash-comment] [fixture:
xychart/db-title-bare-digit] [fixture: xychart/db-title-bare-number] [fixture:
xychart/db-lines-prototype-title] [fixture: xychart/db-title-bare-word]
[fixture: xychart/spec-xychart-jison-571269be] [fixture:
xychart/gram-title-bare-angle] [fixture: xychart/gram-title-bare-apostrophe]
[fixture: xychart/gram-title-bare-colon] [fixture:
xychart/gram-title-bare-comma] [fixture: xychart/gram-title-bare-non-ascii]
[fixture: xychart/gram-title-bare-parenthesis] [fixture:
xychart/gram-title-bare-percent-at-end] [fixture:
xychart/gram-title-bare-percent-inside] [fixture: xychart/gram-title-bare-slash]
[fixture: xychart/gram-title-bare-square] [fixture:
xychart/gram-comment-hash-line] [fixture: xychart/gram-comment-percent-single]
[fixture: xychart/gram-grid-punct-title-bare] [fixture:
xychart/gram-grid-punct-x-title-bare] [fixture:
xychart/gram-grid-punct-category-bare] [fixture:
xychart/gram-grid-punct-y-title-bare] [fixture:
xychart/gram-grid-punct-plot-title-bare] [fixture:
xychart/gram-grid-nonascii-x-title-bare] [fixture:
xychart/gram-grid-nonascii-category-bare] [fixture:
xychart/gram-grid-nonascii-y-title-bare] [fixture:
xychart/gram-grid-nonascii-plot-title-bare] [fixture:
xychart/gram-x-axis-band-percent-inside] [fixture:
xychart/gram-x-axis-band-non-ascii] [fixture: xychart/db-grid-proto-title-bare]
[fixture: xychart/db-grid-proto-x-title-bare] [fixture:
xychart/db-grid-proto-category-bare] [fixture:
xychart/db-grid-proto-y-title-bare] [fixture:
xychart/db-plot-title-prototype-name] [fixture:
xychart/db-x-axis-prototype-title] [fixture: xychart/db-grid-hash-title-bare]
[fixture: xychart/db-grid-hash-x-title-bare] [fixture:
xychart/db-grid-hash-category-bare] [fixture: xychart/db-grid-hash-y-title-bare]
[fixture: xychart/db-grid-hash-plot-title-bare]

### The axis context

`x-axis` and `y-axis` enter the axis context. It ends at the end of its
statement: a line break leaves it and is a `newline` unit, and a `;` and a
keyword leave it and are read in the context below, but for `accDescr` with `{`,
which enters the description block context on top of it, so that the axis
context goes on after the `}`. A description block between a number and the
arrow of a range, or after the title of an axis and before its categories, is
read in the axis context and makes the input rejected, while `accTitle:` and
`accDescr:` take the rest of their line, and a description block followed by
another statement on its line, as in `x-axis A accDescr {x} line [1]`, are
accepted. [fixture: xychart/gram-x-axis-description-block-in-range] [fixture:
xychart/gram-x-axis-description-block-then-band] [fixture:
xychart/db-x-axis-title-then-acc-descr-line] [fixture:
xychart/db-x-axis-title-then-acc-title-line] [fixture:
xychart/db-x-axis-title-then-description-block] [fixture:
xychart/db-x-axis-title-description-block-then-plot] [fixture:
xychart/div-empty-description-block-in-range] [fixture:
xychart/div-empty-description-block-in-y-axis-range] [fixture:
xychart/gram-plot-description-block-before-values] Its rules, in order, are
those of the statement context with these before them:

1. `[`: a `[` unit, which enters the category context.
2. `-->`: a `-->` unit.
3. A **number**: an optional `+` or `-`, then digits with an optional `.` and
   digits, or `.` and digits: a `number` unit.

So a digit starts a number, and the title of an axis without quotes holds no
digit: `x-axis Q1`, `x-axis A-1`, `x-axis A_1`, `x-axis Year 2024`,
`y-axis 2024`, `y-axis Revenue2024`, and `x-axis a.5` are rejected, and
`x-axis T1 --> 2` is the title `T` and a range, while `x-axis "Q1"`, `a-b`, and
`- 1 --> 2`, whose `-` is a word before a space, are accepted. A range needs the
three characters of the arrow together: `1-->-2` is a range, and `1 - -> 2`,
`1 -- > 2`, and `1 -> 2` are rejected. A bracket and a quote may follow the
keyword with no space, and a bracket and a number a quoted title:
`x-axis "A"[a]` is the title `A` and the category `a`. [fixture:
xychart/db-x-axis-title-quoted-glued-band] [fixture:
xychart/gram-x-axis-title-bare-digit] [fixture:
xychart/gram-x-axis-title-bare-digit-before-band] [fixture:
xychart/gram-x-axis-title-bare-hyphen-digit] [fixture:
xychart/gram-x-axis-title-bare-underscore-digit] [fixture:
xychart/gram-x-axis-title-bare-words-number] [fixture:
xychart/gram-y-axis-title-bare-digit] [fixture:
xychart/gram-y-axis-title-bare-digit-before-range] [fixture:
xychart/gram-y-axis-title-bare-letters-digits] [fixture:
xychart/gram-x-axis-title-dot-digit] [fixture:
xychart/db-x-axis-title-quoted-digit] [fixture:
xychart/db-x-axis-title-bare-hyphen] [fixture:
xychart/db-x-axis-title-bare-characters] [fixture:
xychart/db-x-axis-title-then-glued-range] [fixture:
xychart/db-x-axis-title-hyphen-then-range] [fixture:
xychart/spec-xychart-jison-1627cb67] [fixture:
xychart/db-x-axis-range-glued-negative-end] [fixture:
xychart/db-x-axis-range-no-spaces] [fixture:
xychart/gram-x-axis-range-arrow-split-after-dash] [fixture:
xychart/gram-x-axis-range-arrow-split-before-head] [fixture:
xychart/gram-x-axis-range-short-arrow] [fixture:
xychart/db-y-axis-title-quoted-glued-range] [fixture:
xychart/db-x-axis-keyword-glued-bracket] [fixture:
xychart/db-x-axis-keyword-glued-quote] [fixture:
xychart/gram-y-axis-glued-bracket]

A number has no exponent and no `.` without digits after it: `1e3 --> 5` and
`1. --> 2` are rejected, while `.5`, `007`, `-0`, `+1`, and a number of twenty
digits are numbers. [fixture: xychart/db-x-axis-range-decimal] [fixture:
xychart/db-x-axis-range-leading-zeros] [fixture:
xychart/db-x-axis-range-negative] [fixture:
xychart/db-x-axis-range-negative-zero] [fixture: xychart/db-x-axis-range-plus]
[fixture: xychart/db-x-axis-range-large] [fixture:
xychart/gram-x-axis-range-exponent] [fixture:
xychart/gram-x-axis-range-trailing-dot] [fixture:
xychart/spec-xychart-jison-2e7c7613] [fixture:
xychart/spec-xychart-jison-7cef6803] [fixture:
xychart/spec-xychart-jison-f137f1b7]

The axis context ends with its statement, so a statement after it on the same
line, after `;`, after U+2028, after a description block, or with nothing
between, is read in the statement context, and so is every later line:
`x-axis A; title Q1`, `x-axis [a] title T5`, `title Q1` on the line after
`x-axis A; line [1]`, and `title Q1` on the line after `x-axis A` and a space
are accepted. mermaid.js reads the digits of such a title in the axis context
and rejects it, which is the known divergence
[`title-digit-after-axis-statement`](../known-divergences/title-digit-after-axis-statement.md).
[fixture: xychart/div-title-digit-after-axis-semicolon] [fixture:
xychart/div-title-digit-after-axis-band-same-line] [fixture:
xychart/div-title-digit-after-axis-band-semicolon] [fixture:
xychart/div-title-digit-after-axis-line-separator] [fixture:
xychart/div-title-digit-after-axis-and-empty-block] [fixture:
xychart/div-title-digit-next-line-after-axis-and-plot] [fixture:
xychart/div-title-digit-after-axis-trailing-space] [fixture:
xychart/db-title-digit-line-after-axis] [fixture:
xychart/db-title-digit-after-axis-and-plot-same-line] [fixture:
xychart/db-title-dotted-word-after-axis-semicolon]

### The category context

`[` in the axis context enters the category context, and `]` leaves it. Its
rules are those of the statement context with `]` before them, which leaves the
context. So digits are words there: `[Q1]`, `[1, 2]`, `[-1, +2, .5]`, and
`[1.5, -2]` are categories, and the words of a category, with whitespace between
them or not, are one category. A line feed is a `newline` unit, which the
categories do not take. [fixture: xychart/db-x-axis-band-digit] [fixture:
xychart/db-x-axis-band-numbers] [fixture: xychart/db-x-axis-band-negative]
[fixture: xychart/db-x-axis-band-decimal-and-negative] [fixture:
xychart/db-x-axis-band-characters] [fixture: xychart/db-x-axis-band-words]
[fixture: xychart/db-x-axis-band-no-spaces] [fixture:
xychart/gram-x-axis-band-spaces-only]

### The plot context

`line` and `bar` enter the plot context. It ends at the end of its statement as
the axis context does, and a description block, which `accDescr` with `{` enters
on top of it, does not end it: a description block between the title of a plot
and its values makes the input rejected. Its rules are those of the statement
context with `[` before them, which enters the values context. So digits are
words in the title of a plot: `line Q1 [1]`, `bar 2024 [1]`, `line a-1 [1]`,
`line -5 [2]`, and `line 1.5 [2]` have the titles `Q1`, `2024`, `a-1`, `-5`, and
`1.5`. A bracket may follow the keyword or the title with no space, and a tab
may stand between them. [fixture: xychart/db-line-title-bare-digit] [fixture:
xychart/db-bar-title-bare-number] [fixture:
xychart/db-plot-title-bare-hyphen-digit] [fixture:
xychart/db-plot-title-negative-number] [fixture: xychart/db-plot-title-decimal]
[fixture: xychart/db-plot-title-glued-bracket] [fixture:
xychart/db-plot-title-quoted-glued-bracket] [fixture:
xychart/db-plot-keyword-glued-bracket] [fixture:
xychart/db-plot-bar-keyword-glued-bracket] [fixture:
xychart/db-plot-tab-keyword] [fixture:
xychart/db-statements-same-line-plot-then-title-digit] [fixture:
xychart/db-title-digit-after-plot-semicolon]

### The values context

`[` in the plot context enters the values context, and `]` leaves it. Its rules
are those of the statement context with `]`, which leaves the context, and a
number, as in the axis context, before them. A value is a number: `.5`, `-1`,
`+.5`, `007`, `-0`, and numbers of twenty and of four hundred digits are values,
while `1e3`, `Infinity`, `NaN`, `5.`, `1.5.2`, `1_0`, `abc`, and `-4aa5` are
rejected. [fixture: xychart/db-plot-values-one] [fixture:
xychart/db-line-values] [fixture: xychart/db-bar-values] [fixture:
xychart/db-plot-values-no-spaces] [fixture: xychart/db-plot-values-spaces]
[fixture: xychart/db-plot-values-decimal] [fixture:
xychart/db-plot-values-negative] [fixture: xychart/db-plot-values-negative-zero]
[fixture: xychart/db-plot-values-plus] [fixture:
xychart/db-plot-values-leading-zeros] [fixture: xychart/db-plot-values-large]
[fixture: xychart/db-plot-values-overflow] [fixture:
xychart/demo-xychart-d8ce9a38] [fixture: xychart/gram-plot-values-exponent]
[fixture: xychart/gram-plot-values-infinity] [fixture:
xychart/gram-plot-values-nan] [fixture: xychart/gram-plot-values-trailing-dot]
[fixture: xychart/gram-plot-values-two-dots] [fixture:
xychart/gram-plot-values-underscore] [fixture: xychart/gram-plot-values-word]
[fixture: xychart/spec-xychart-jison-5ba427e7] [fixture:
xychart/spec-xychart-jison-35064ff7]

### Strings

`"` enters the string context, which reads all the characters up to the next `"`
as a `string` unit, whose text is what lies between the quotes, and leaves the
context at that `"`. The text may hold any character, line feeds included:
spaces at its ends, punctuation, keywords, characters outside ASCII, markup, a
`%%` after a space, backquotes, and a U+2028 are characters of it. A string with
nothing between its quotes is a `string` unit with the empty text (see
[Empty strings](#empty-strings)). A string has no escape: a second `"` ends it,
so `"a""b"` is two strings. A string that is not closed makes the input
rejected. [fixture: xychart/db-title-quoted] [fixture:
xychart/db-title-quoted-spaces-trimmed] [fixture:
xychart/db-title-quoted-special] [fixture: xychart/db-title-quoted-non-ascii]
[fixture: xychart/db-title-quoted-line-feed] [fixture:
xychart/db-title-quoted-crlf] [fixture: xychart/db-title-quoted-crlf-category]
[fixture: xychart/db-title-quoted-line-separator] [fixture:
xychart/db-title-quoted-percent] [fixture: xychart/db-title-md-string] [fixture:
xychart/gram-title-quoted-unclosed] [fixture: xychart/gram-label-doubled-quote]
[fixture: xychart/db-plot-title-quoted-lone-cr] [fixture:
xychart/db-plot-title-quoted-line-feed] [fixture: xychart/db-label-line-feed]
[fixture: xychart/db-label-quoted-crlf] [fixture:
xychart/db-x-axis-band-quoted-line-feed] [fixture:
xychart/db-category-quoted-line-separator] [fixture:
xychart/db-grid-crlf-title-quoted] [fixture: xychart/db-grid-cr-title-quoted]
[fixture: xychart/db-grid-ps-title-quoted] [fixture:
xychart/db-grid-tab-title-quoted] [fixture: xychart/db-grid-bom-title-quoted]
[fixture: xychart/db-grid-nbsp-title-quoted] [fixture:
xychart/db-grid-ideographic-title-quoted] [fixture:
xychart/db-grid-nonascii-title-quoted] [fixture:
xychart/db-grid-punct-title-quoted] [fixture:
xychart/db-grid-proto-title-quoted] [fixture: xychart/db-grid-hash-title-quoted]
[fixture: xychart/db-grid-lf-x-title-quoted] [fixture:
xychart/db-grid-lf-category-quoted] [fixture: xychart/db-grid-lf-y-title-quoted]
[fixture: xychart/db-grid-crlf-x-title-quoted] [fixture:
xychart/db-grid-crlf-category-quoted] [fixture:
xychart/db-grid-crlf-y-title-quoted] [fixture:
xychart/db-grid-crlf-plot-title-quoted] [fixture: xychart/db-grid-crlf-label]
[fixture: xychart/db-grid-cr-x-title-quoted] [fixture:
xychart/db-grid-cr-category-quoted] [fixture: xychart/db-grid-cr-y-title-quoted]
[fixture: xychart/db-grid-cr-label] [fixture: xychart/db-grid-ls-x-title-quoted]
[fixture: xychart/db-grid-ls-category-quoted] [fixture:
xychart/db-grid-ls-y-title-quoted] [fixture:
xychart/db-grid-ls-plot-title-quoted] [fixture: xychart/db-grid-ls-label]
[fixture: xychart/db-grid-ps-x-title-quoted] [fixture:
xychart/db-grid-ps-category-quoted] [fixture: xychart/db-grid-ps-y-title-quoted]
[fixture: xychart/db-grid-ps-plot-title-quoted] [fixture:
xychart/db-grid-ps-label] [fixture: xychart/db-grid-tab-x-title-quoted]
[fixture: xychart/db-grid-tab-category-quoted] [fixture:
xychart/db-grid-tab-y-title-quoted] [fixture:
xychart/db-grid-tab-plot-title-quoted] [fixture: xychart/db-grid-tab-label]
[fixture: xychart/db-grid-bom-x-title-quoted] [fixture:
xychart/db-grid-bom-category-quoted] [fixture:
xychart/db-grid-bom-y-title-quoted] [fixture:
xychart/db-grid-bom-plot-title-quoted] [fixture: xychart/db-grid-bom-label]
[fixture: xychart/db-grid-nbsp-x-title-quoted] [fixture:
xychart/db-grid-nbsp-category-quoted] [fixture:
xychart/db-grid-nbsp-y-title-quoted] [fixture:
xychart/db-grid-nbsp-plot-title-quoted] [fixture: xychart/db-grid-nbsp-label]
[fixture: xychart/db-grid-ideographic-x-title-quoted] [fixture:
xychart/db-grid-ideographic-category-quoted] [fixture:
xychart/db-grid-ideographic-y-title-quoted] [fixture:
xychart/db-grid-ideographic-plot-title-quoted] [fixture:
xychart/db-grid-ideographic-label] [fixture:
xychart/db-grid-nonascii-x-title-quoted] [fixture:
xychart/db-grid-nonascii-category-quoted] [fixture:
xychart/db-grid-nonascii-y-title-quoted] [fixture:
xychart/db-grid-nonascii-plot-title-quoted] [fixture:
xychart/db-grid-nonascii-label] [fixture: xychart/db-grid-punct-x-title-quoted]
[fixture: xychart/db-grid-punct-category-quoted] [fixture:
xychart/db-grid-punct-y-title-quoted] [fixture:
xychart/db-grid-punct-plot-title-quoted] [fixture: xychart/db-grid-punct-label]
[fixture: xychart/db-grid-proto-x-title-quoted] [fixture:
xychart/db-grid-proto-category-quoted] [fixture:
xychart/db-grid-proto-y-title-quoted] [fixture:
xychart/db-grid-proto-plot-title-quoted] [fixture: xychart/db-grid-proto-label]
[fixture: xychart/db-grid-hash-x-title-quoted] [fixture:
xychart/db-grid-hash-category-quoted] [fixture:
xychart/db-grid-hash-y-title-quoted] [fixture:
xychart/db-grid-hash-plot-title-quoted] [fixture: xychart/db-grid-hash-label]

A markdown string, a quote followed by a backquote, is no unit of its own in
this diagram type: `"`x`"` is a string whose text holds the two backquotes, and
a backquote outside a string is read by no rule. [fixture:
xychart/db-title-md-string]

### Accessibility values

`accTitle` and `:` enter the accessibility title context, and `accDescr` and `:`
the accessibility description context. Each reads the whitespace after the `:`,
line feeds included, and then the rest of the line as an `acc-title-text` or an
`acc-description-text` unit, and leaves. So the text starts on the first line
after the keyword that has a character other than whitespace, and takes that
line whole, also when it is a statement: `accTitle:` followed by a line
`line [1]` has the text `line [1]`, which is then no statement. A comment line
and a directive line between them are no lines of the text. When only whitespace
follows to the end of the text, the unit is empty. Whitespace may precede the
`:`, also a line feed, with comment lines and directive lines between, and
U+00A0, U+2028, U+2029, U+3000, and U+FEFF are whitespace before and after the
`:` [fixture: xychart/db-acc-title-nbsp-before-colon] [fixture:
xychart/db-acc-title-ideographic-before-colon] [fixture:
xychart/db-acc-title-bom-before-colon] [fixture:
xychart/db-acc-title-ls-before-colon] [fixture:
xychart/db-acc-title-ps-before-colon] [fixture:
xychart/db-acc-descr-nbsp-before-colon] [fixture:
xychart/db-acc-descr-ideographic-before-colon] [fixture:
xychart/db-acc-descr-bom-before-colon] [fixture:
xychart/db-acc-descr-ls-before-colon] [fixture:
xychart/db-acc-descr-ps-before-colon] [fixture:
xychart/db-acc-title-nbsp-after-colon] [fixture:
xychart/db-acc-title-ideographic-after-colon] [fixture:
xychart/db-acc-title-bom-after-colon] [fixture:
xychart/db-acc-title-ls-after-colon] [fixture:
xychart/db-acc-title-ps-after-colon]: `accTitle`, a comment line, and `: T` have
the title `T`. The characters `:`, `;`, `#`, `%%`, and the characters of the
statement context are characters of the text. [fixture:
xychart/db-acc-title-comment-line-before-colon] [fixture:
xychart/db-acc-descr-comment-line-before-colon] [fixture:
xychart/db-acc-title-directive-line-before-colon] [fixture:
xychart/db-acc-descr-directive-line-before-colon] [fixture:
xychart/db-acc-title] [fixture: xychart/db-acc-descr] [fixture:
xychart/db-acc-title-no-space] [fixture:
xychart/db-acc-title-space-before-colon] [fixture:
xychart/db-acc-title-colon-on-next-line] [fixture:
xychart/db-acc-descr-colon-on-next-line] [fixture:
xychart/db-acc-title-two-colons] [fixture: xychart/db-acc-title-colon-inside]
[fixture: xychart/db-acc-title-hash] [fixture: xychart/db-acc-title-semicolon]
[fixture: xychart/db-acc-title-spaces-trimmed] [fixture:
xychart/db-acc-title-leading-ideographic-space] [fixture:
xychart/db-acc-title-trailing-ideographic-space] [fixture:
xychart/db-acc-title-trailing-nbsp] [fixture: xychart/db-acc-title-trailing-tab]
[fixture: xychart/db-acc-title-trailing-bom] [fixture:
xychart/db-acc-title-line-separator-inside] [fixture:
xychart/db-acc-descr-line-separator-inside] [fixture:
xychart/db-acc-descr-no-space] [fixture: xychart/db-acc-title-takes-next-line]
[fixture: xychart/db-acc-title-blank-lines-then-text] [fixture:
xychart/db-acc-title-comment-line-then-text] [fixture:
xychart/db-acc-title-directive-line-then-text] [fixture:
xychart/db-acc-descr-takes-title-line] [fixture:
xychart/db-acc-descr-blank-lines-then-text] [fixture:
xychart/db-acc-descr-comment-line-then-text] [fixture:
xychart/db-acc-descr-directive-line-then-text] [fixture:
xychart/db-acc-title-empty] [fixture:
xychart/db-acc-title-empty-at-end-after-value] [fixture:
xychart/db-acc-descr-empty-at-end-after-value] [fixture:
xychart/db-grid-bom-acc-title] [fixture: xychart/db-grid-bom-acc-descr]
[fixture: xychart/db-grid-hash-acc-title] [fixture:
xychart/db-grid-hash-acc-descr] [fixture: xychart/db-grid-ideographic-acc-title]
[fixture: xychart/db-grid-ideographic-acc-descr] [fixture:
xychart/db-grid-nbsp-acc-title] [fixture: xychart/db-grid-nbsp-acc-descr]
[fixture: xychart/db-grid-nonascii-acc-title] [fixture:
xychart/db-grid-nonascii-acc-descr] [fixture: xychart/db-grid-proto-acc-title]
[fixture: xychart/db-grid-proto-acc-descr] [fixture:
xychart/db-grid-ps-acc-title] [fixture: xychart/db-grid-ps-acc-descr] [fixture:
xychart/db-grid-punct-acc-title] [fixture: xychart/db-grid-punct-acc-descr]
[fixture: xychart/db-grid-tab-acc-title] [fixture:
xychart/db-grid-tab-acc-descr] [fixture: xychart/db-grid-empty-acc-title]
[fixture: xychart/db-grid-empty-acc-descr]

`accDescr`, whitespace, and `{` enter the description block context, which reads
the whitespace after the `{` and then every character up to the next `}` as a
`description-block-text` unit, empty when the `}` follows the whitespace, reads
the `}` as a `}` unit, and leaves. The text may hold line feeds, `#`, `;`, and
`%%`; a CRLF or a lone CR in it is a line feed. Whitespace may precede the `{`,
also a line feed, with comment lines and directive lines between, U+00A0 and the
other whitespace characters of Notation included. [fixture:
xychart/db-acc-descr-nbsp-before-brace] [fixture:
xychart/db-acc-descr-ideographic-before-brace] [fixture:
xychart/db-acc-descr-bom-before-brace] [fixture:
xychart/db-acc-descr-ls-before-brace] [fixture:
xychart/db-acc-descr-ps-before-brace] [fixture:
xychart/db-acc-descr-comment-line-before-brace] [fixture:
xychart/db-acc-descr-directive-line-before-brace] Without a `}`, the text runs
to the end of the text. A second `}` after a block, and a brace inside the text,
are no part of it: `a } b` followed by `}` ends the block at the first `}`, and
the rest is read in the statement context, where `}` is read by no rule.
[fixture: xychart/db-acc-descr-block] [fixture:
xychart/db-acc-descr-block-no-space] [fixture:
xychart/db-acc-descr-block-spaces-inside] [fixture:
xychart/db-acc-descr-block-line-feed-before-brace] [fixture:
xychart/db-acc-descr-block-crlf] [fixture: xychart/db-acc-descr-block-cr]
[fixture: xychart/db-acc-descr-block-line-separator-inside] [fixture:
xychart/db-acc-descr-block-hash-semicolon] [fixture:
xychart/db-acc-descr-block-percent] [fixture:
xychart/db-acc-descr-unclosed-block] [fixture:
xychart/gram-acc-descr-block-braces-inside] [fixture:
xychart/gram-acc-descr-block-double-close] [fixture:
xychart/gram-acc-descr-block-two-blocks] [fixture:
xychart/db-acc-descr-block-then-title-same-line] [fixture:
xychart/db-acc-descr-block-twice-same-line] [fixture:
xychart/spec-xychart-jison-fc54230a] [fixture:
xychart/db-grid-bom-acc-descr-block] [fixture:
xychart/db-grid-cr-acc-descr-block] [fixture:
xychart/db-grid-crlf-acc-descr-block] [fixture:
xychart/db-grid-hash-acc-descr-block] [fixture:
xychart/db-grid-ideographic-acc-descr-block] [fixture:
xychart/db-grid-lf-acc-descr-block] [fixture:
xychart/db-grid-ls-acc-descr-block] [fixture:
xychart/db-grid-nbsp-acc-descr-block] [fixture:
xychart/db-grid-nonascii-acc-descr-block] [fixture:
xychart/db-grid-proto-acc-descr-block] [fixture:
xychart/db-grid-ps-acc-descr-block] [fixture:
xychart/db-grid-punct-acc-descr-block] [fixture:
xychart/db-grid-tab-acc-descr-block] [fixture:
xychart/db-grid-empty-acc-descr-block]

### Comments

A comment starts at `%%` where a unit starts and runs to the end of its line,
the line feed left out; it belongs to no unit. A comment line, a comment after a
statement, after a space or glued to the closing quote of a string, and a
comment at the end of the text change nothing. A comment takes nothing before
it: `title AB%% c` has the title `AB`, and `title T%% c` the title `T`. A
comment between a keyword and the rest of its statement ends the line, so
`line %% c` followed by a line `[1]`, `x-axis %% c` followed by a line `[a]`,
and `title %% c` followed by a line `T` are rejected, and so is a comment inside
the categories or the values, or between the words of the title of a plot, which
ends their line. A `%%` inside a string, an accessibility text, or a description
block is a character of it. [fixture: xychart/db-comment-line] [fixture:
xychart/db-comment-indented] [fixture: xychart/db-comment-line-between]
[fixture: xychart/db-comment-at-end] [fixture:
xychart/db-comment-after-statement] [fixture:
xychart/db-comment-after-bracket-line] [fixture:
xychart/db-comment-spaced-after-range] [fixture:
xychart/db-title-bare-percent-comment] [fixture: xychart/db-plot-comment-after]
[fixture: xychart/db-x-axis-band-comment-after] [fixture:
xychart/db-comment-glued-after-quote] [fixture:
xychart/db-comment-glued-after-quoted-axis-title] [fixture:
xychart/header-bare-percent-line-after-header] [fixture:
xychart/db-comment-glued-after-two-letter-word] [fixture:
xychart/db-comment-glued-after-two-digit-number] [fixture:
xychart/db-comment-glued-after-semicolon] [fixture:
xychart/gram-line-comment-before-bracket] [fixture:
xychart/gram-x-axis-comment-before-bracket] [fixture:
xychart/gram-title-comment-line-before-text] [fixture:
xychart/gram-title-comment-line-between] [fixture:
xychart/gram-grid-comment-category-bare] [fixture:
xychart/gram-grid-comment-plot-title-bare] [fixture:
xychart/gram-comment-in-label-quotes-closing] [fixture:
xychart/gram-plot-comment-inside] [fixture: xychart/db-grid-comment-title-bare]
[fixture: xychart/db-grid-comment-acc-title] [fixture:
xychart/db-grid-comment-acc-descr] [fixture:
xychart/db-grid-comment-acc-descr-block] [fixture:
xychart/db-grid-comment-x-title-bare] [fixture:
xychart/db-grid-comment-x-title-quoted] [fixture:
xychart/db-grid-comment-category-quoted] [fixture:
xychart/db-grid-comment-y-title-bare] [fixture:
xychart/db-grid-comment-y-title-quoted] [fixture:
xychart/db-grid-comment-plot-title-quoted] [fixture:
xychart/db-grid-comment-label] [fixture: xychart/db-title-quoted-percent]

mermaid.js reads a comment that is glued to a unit of one character together
with that character: `title T%% c`, `x-axis T%% c`, `line [1]%% c`,
`x-axis [a, b]%% c`, `bar [1 "a"]%% c`, and `y-axis 0 --> 1%% c` are rejected
there, `title A B%% c` has the title `A`, and `title a-%% c` the title `a`. This
is the known divergence
[`comment-takes-character`](../known-divergences/comment-takes-character.md).
[fixture: xychart/div-comment-glued-after-title-word] [fixture:
xychart/div-comment-glued-after-axis-title] [fixture:
xychart/div-comment-glued-after-bracket] [fixture:
xychart/div-comment-glued-after-categories] [fixture:
xychart/div-comment-glued-after-label] [fixture:
xychart/div-comment-glued-after-range] [fixture:
xychart/div-comment-takes-one-letter-word] [fixture:
xychart/div-comment-takes-hyphen]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `word`, stands for one unit with
that name, and text in double quotes stands for the unit named by that text,
such as `"title"` or `","`. The grammar is a restatement of the grammar in
[`xychart.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/xychart/parser/xychart.jison#L83-L175)
and accepts the same sequences of units, but for the known divergences.

Each rule below makes a node of the tree, defined in
[ast/xychart.md](../ast/xychart.md):

| Rule                                                               | Node                          |
| ------------------------------------------------------------------ | ----------------------------- |
| `diagram`                                                          | XychartDiagram                |
| `header-part`                                                      | XychartHeader                 |
| `title-statement`                                                  | XychartTitleStatement         |
| `x-axis-statement`                                                 | XychartXAxisStatement         |
| `y-axis-statement`                                                 | XychartYAxisStatement         |
| `band`                                                             | XychartBand                   |
| `range`                                                            | XychartRange                  |
| `plot-statement`                                                   | XychartPlotStatement          |
| `value`                                                            | XychartValue                  |
| `acc-title-statement`                                              | XychartAccTitleStatement      |
| `acc-description-statement`                                        | XychartAccDescrStatement      |
| `description-block-statement`                                      | XychartAccDescrBlockStatement |
| `words`                                                            | XychartLiteral                |
| `acc-title-text`, `acc-description-text`, `description-block-text` | XychartLiteral                |
| `string`                                                           | StringLiteral                 |
| `number`                                                           | NumericLiteral                |

### Diagram and statements

```text
diagram     = newline* header-part ( eol | header-part )* ( statement | eol )*
header-part = header orientation?
eol         = newline | ";"
statement   = title-statement | x-axis-statement | y-axis-statement
            | plot-statement | acc-title-statement
            | acc-description-statement | description-block-statement
words       = word+
```

The diagram is one or more headers and then the statements. A header may follow
another, on its line or on a later one, and may carry an orientation, but no
header follows a statement. A statement needs nothing before the next one: two
statements may stand on one line with whitespace or nothing between them, as in
`title T line [1]`, `x-axis [a] line [1]`, `line [1] accTitle: b`,
`line [1]bar [2]`, and `title "T"line [1]`. A `;` ends a line as a line feed
does, and empty lines and empty statements change nothing. Text after a
statement that starts no statement makes the input rejected:
`line [1, 2] extra`, `x-axis [a, b] extra`, `title "T" extra`, and a second `]`.
[fixture: xychart/header-twice] [fixture: xychart/header-twice-same-line]
[fixture: xychart/header-second-with-orientation] [fixture:
xychart/header-after-semicolon-line] [fixture: xychart/header-leading-semicolon]
[fixture: xychart/gram-header-after-statement] [fixture:
xychart/db-statements-same-line-title-then-plot] [fixture:
xychart/db-statements-same-line-axis-title-then-plot] [fixture:
xychart/db-statements-same-line-two-plots] [fixture:
xychart/db-statements-same-line-band-then-plot] [fixture:
xychart/db-statements-same-line-range-then-title] [fixture:
xychart/db-statements-same-line-title-then-acc-title] [fixture:
xychart/db-statements-same-line-plot-then-acc-title] [fixture:
xychart/db-statements-glued-two-plots] [fixture:
xychart/db-statements-glued-after-quoted-title] [fixture:
xychart/db-statements-glued-after-categories] [fixture:
xychart/db-semicolon-after-statement] [fixture: xychart/db-semicolon-line-alone]
[fixture: xychart/db-semicolon-spaced] [fixture:
xychart/db-semicolon-statements] [fixture: xychart/db-semicolon-twice] [fixture:
xychart/db-statement-leading-semicolon] [fixture:
xychart/db-title-semicolon-empty-statements] [fixture:
xychart/db-title-bare-semicolon] [fixture: xychart/db-title-quoted-semicolon]
[fixture: xychart/gram-plot-values-extra-text] [fixture:
xychart/gram-x-axis-band-extra-text] [fixture: xychart/gram-title-after-quoted]
[fixture: xychart/spec-xychart-jison-37d8510a] [fixture:
xychart/spec-xychart-jison-ad21b30c] [fixture:
xychart/spec-xychart-jison-284bf6c8] A statement keyword at the end of the text,
alone or with a title only, is rejected: `title`, `line`, `bar`, `line T`,
`bar T`, `x-axis`, `y-axis`, `accTitle`, and `accDescr`. [fixture:
xychart/gram-title-keyword-alone-at-end] [fixture:
xychart/gram-line-keyword-alone-at-end] [fixture:
xychart/gram-bar-keyword-alone-at-end] [fixture:
xychart/gram-line-title-only-at-end] [fixture:
xychart/gram-bar-title-only-at-end] [fixture:
xychart/gram-x-axis-keyword-alone-at-end] [fixture:
xychart/gram-y-axis-keyword-alone-at-end] [fixture:
xychart/gram-acc-title-keyword-alone] [fixture:
xychart/gram-acc-descr-keyword-alone] The examples of the documentation of
mermaid.js are accepted. [fixture: xychart/docs-intro-examples-9bc72e53]
[fixture: xychart/docs-syntax-xy-chart-26b0cd5e] [fixture:
xychart/docs-syntax-xy-chart-3685342d] [fixture:
xychart/docs-syntax-xy-chart-4191b7b5] [fixture:
xychart/docs-syntax-xy-chart-55d282bc] [fixture:
xychart/docs-syntax-xy-chart-58d05b22] [fixture:
xychart/docs-syntax-xy-chart-ade44d5c] [fixture:
xychart/docs-syntax-xy-chart-fbe6837b] [fixture:
xychart/docs-syntax-xy-chart-ff4787ed]

### Titles

```text
title-statement = "title" ( words | string )
```

The title is words or one string, not both, and never empty: `title` alone,
`title` and a space at the end of the text, and `title ""` are rejected. A later
title statement is a statement like the first. [fixture:
xychart/spec-xychart-jison-a63fe3ac] [fixture: xychart/db-title-bare-words]
[fixture: xychart/db-title-three-times] [fixture: xychart/db-title-twice]
[fixture: xychart/db-title-bare-then-quoted] [fixture:
xychart/db-title-frontmatter] [fixture:
xychart/db-title-frontmatter-and-statement] [fixture:
xychart/db-title-frontmatter-spaces] [fixture: xychart/gram-title-no-text]
[fixture: xychart/gram-grid-empty-title-bare] [fixture:
xychart/gram-title-empty-string]

### Axes

```text
x-axis-statement = "x-axis" ( axis-title | axis-title? ( band | range ) )
y-axis-statement = "y-axis" ( axis-title | axis-title? range )
axis-title       = words | string
band             = "[" category ( "," category )* "]"
category         = words | string
range            = number "-->" number
```

An axis statement has a title, its data, or both: the categories or a range for
the x axis, and a range for the y axis. The title comes first, and a title in
quotes that is empty must be followed by data, as in `x-axis "" [a]` and
`y-axis "" 1 --> 2`, while `x-axis ""` and `y-axis ""` are rejected. A category
is words or a string, and is never empty: `[]`, `[ ]`, `[, b]`, `["", b]`,
`[a, ""]`, and a comma before `]` are rejected, and so are a second list of
categories, a third number, one number, a range in brackets, two titles in
quotes, and a category of a string and words. Two categories of the same text
are two categories, and a later axis statement is a statement like the first.
[fixture: xychart/db-x-axis-band] [fixture: xychart/db-x-axis-band-one]
[fixture: xychart/db-x-axis-band-title] [fixture:
xychart/db-x-axis-band-title-quoted] [fixture: xychart/db-x-axis-band-quoted]
[fixture: xychart/db-x-axis-band-quoted-spaces] [fixture:
xychart/db-x-axis-band-same-category] [fixture:
xychart/db-x-axis-band-prototype-names] [fixture: xychart/db-x-axis-range]
[fixture: xychart/db-x-axis-range-title] [fixture:
xychart/db-x-axis-range-title-quoted] [fixture: xychart/db-x-axis-range-equal]
[fixture: xychart/db-x-axis-title-bare-word] [fixture:
xychart/db-x-axis-title-words] [fixture: xychart/db-x-axis-title-quoted]
[fixture: xychart/db-x-axis-twice] [fixture: xychart/db-x-axis-three-times]
[fixture: xychart/db-x-axis-range-then-band] [fixture:
xychart/db-x-axis-twice-title-cleared] [fixture:
xychart/db-y-axis-no-range-no-plot] [fixture: xychart/db-y-axis-range] [fixture:
xychart/db-y-axis-range-negative-decimal] [fixture:
xychart/db-y-axis-range-reversed] [fixture: xychart/db-y-axis-range-title]
[fixture: xychart/db-y-axis-title-bare-word] [fixture:
xychart/db-y-axis-title-only-then-range] [fixture:
xychart/db-y-axis-title-quoted] [fixture: xychart/db-y-axis-twice] [fixture:
xychart/db-y-axis-upper-case-keyword] [fixture: xychart/db-y-axis-before-plot]
[fixture: xychart/db-y-axis-after-plot] [fixture:
xychart/db-empty-string-as-x-axis-title-before-band] [fixture:
xychart/db-empty-string-as-x-axis-title-before-range] [fixture:
xychart/db-empty-string-as-y-axis-title] [fixture: xychart/gram-x-axis-empty]
[fixture: xychart/gram-y-axis-empty] [fixture:
xychart/gram-grid-empty-x-title-bare] [fixture:
xychart/gram-grid-empty-x-title-quoted] [fixture:
xychart/gram-grid-empty-y-title-bare] [fixture:
xychart/gram-grid-empty-y-title-quoted] [fixture:
xychart/gram-x-axis-band-empty] [fixture: xychart/gram-x-axis-band-spaces-only]
[fixture: xychart/gram-grid-empty-category-bare] [fixture:
xychart/gram-grid-empty-category-quoted] [fixture:
xychart/gram-x-axis-band-empty-string] [fixture:
xychart/gram-x-axis-band-trailing-comma] [fixture:
xychart/gram-x-axis-band-twice] [fixture: xychart/gram-x-axis-range-no-end]
[fixture: xychart/gram-x-axis-range-no-start] [fixture:
xychart/gram-x-axis-range-one-number] [fixture: xychart/gram-x-axis-range-third]
[fixture: xychart/gram-x-axis-range-text] [fixture: xychart/gram-y-axis-band]
[fixture: xychart/gram-y-axis-one-number] [fixture: xychart/gram-y-axis-third]
[fixture: xychart/gram-x-axis-band-after-string-title] [fixture:
xychart/gram-x-axis-band-quoted-then-word] [fixture:
xychart/spec-xychart-jison-1125531c] [fixture:
xychart/spec-xychart-jison-160181bb] [fixture:
xychart/spec-xychart-jison-1baf4156] [fixture:
xychart/spec-xychart-jison-26a57e49] [fixture:
xychart/spec-xychart-jison-282ab4b5] [fixture:
xychart/spec-xychart-jison-37c05bb9] [fixture:
xychart/spec-xychart-jison-45e9e2ce] [fixture:
xychart/spec-xychart-jison-465e04ec] [fixture:
xychart/spec-xychart-jison-4e1f7c24] [fixture:
xychart/spec-xychart-jison-5b9945db] [fixture:
xychart/spec-xychart-jison-62128235] [fixture:
xychart/spec-xychart-jison-6bd37a9c] [fixture:
xychart/spec-xychart-jison-71181da9] [fixture:
xychart/spec-xychart-jison-9c6c9e75] [fixture:
xychart/spec-xychart-jison-b38b6043] [fixture:
xychart/spec-xychart-jison-d1310050] [fixture:
xychart/spec-xychart-jison-d931b39e] [fixture:
xychart/spec-xychart-jison-d997b01c] [fixture:
xychart/spec-xychart-jison-e05fd96d] [fixture:
xychart/spec-xychart-jison-efa16dec] [fixture:
xychart/spec-xychart-jison-f5965f5c]

### Plots

```text
plot-statement = ( "line" | "bar" ) plot-title? "[" value ( "," value )* "]"
plot-title     = words | string
value          = number string?
```

A plot statement is `line` or `bar`, a title or none, and one or more values in
brackets, separated by commas. The title is words or one string, not both, and a
string may be empty. A value may be followed by a label, a string, with or
without whitespace between them, on a line and on a bar. Empty brackets, a comma
before the first value, after the last one, or after another comma, two values
without a comma, values without brackets, a label without quotes, a label before
its value, two labels, and a value after a label without a comma are rejected.
Two plots may have the same title. [fixture: xychart/db-line-title-bare]
[fixture: xychart/db-line-title-quoted] [fixture: xychart/db-line-title-words]
[fixture: xychart/db-bar-title-bare] [fixture: xychart/db-bar-title-quoted]
[fixture: xychart/db-plot-bar-then-line] [fixture:
xychart/db-plot-same-title-twice] [fixture: xychart/db-plot-title-keyword-like]
[fixture: xychart/db-plot-title-trimmed] [fixture:
xychart/db-plot-title-quoted-special] [fixture:
xychart/db-grid-empty-plot-title-quoted] [fixture:
xychart/db-grid-empty-plot-title-bare] [fixture:
xychart/gram-plot-title-bare-then-quoted] [fixture: xychart/db-label-all]
[fixture: xychart/db-label-one] [fixture: xychart/db-label-last] [fixture:
xychart/db-label-no-space] [fixture: xychart/db-label-glued-then-comma]
[fixture: xychart/db-label-beyond-categories] [fixture: xychart/db-label-on-bar]
[fixture: xychart/db-label-spaces-trimmed] [fixture: xychart/db-label-special]
[fixture: xychart/db-label-empty-string] [fixture: xychart/gram-label-bare]
[fixture: xychart/gram-label-before-value] [fixture: xychart/gram-label-twice]
[fixture: xychart/gram-label-unclosed] [fixture: xychart/gram-label-then-number]
[fixture: xychart/gram-plot-values-empty] [fixture:
xychart/gram-plot-values-double-comma] [fixture:
xychart/gram-plot-values-leading-comma] [fixture:
xychart/gram-plot-values-trailing-comma] [fixture:
xychart/gram-plot-values-missing-comma] [fixture:
xychart/gram-plot-values-no-brackets] [fixture:
xychart/gram-empty-string-as-last-value] [fixture:
xychart/spec-xychart-jison-3a65c313] [fixture:
xychart/spec-xychart-jison-494643b5] [fixture:
xychart/spec-xychart-jison-4922e556] [fixture:
xychart/spec-xychart-jison-4e8ed272] [fixture:
xychart/spec-xychart-jison-5111f0ab] [fixture:
xychart/spec-xychart-jison-5c3b8a48] [fixture:
xychart/spec-xychart-jison-5c9782dd] [fixture:
xychart/spec-xychart-jison-5d0c6f40] [fixture:
xychart/spec-xychart-jison-727d9a15] [fixture:
xychart/spec-xychart-jison-7d74bd3b] [fixture:
xychart/spec-xychart-jison-930c33d9] [fixture:
xychart/spec-xychart-jison-b2b889fc] [fixture:
xychart/spec-xychart-jison-d8f241fd] [fixture:
xychart/spec-xychart-jison-e0c06628] [fixture:
xychart/spec-xychart-jison-e37b0a2b] [fixture:
xychart/spec-xychart-jison-e3a04bdb] [fixture:
xychart/spec-xychart-jison-ed62ba96] [fixture:
xychart/spec-xychart-jison-f6e72740] [fixture:
xychart/spec-xychart-jison-f74af3f4] [fixture:
xychart/spec-xychart-jison-f7805467]

### Accessibility statements

```text
acc-title-statement         = "accTitle" ":" acc-title-text
acc-description-statement   = "accDescr" ":" acc-description-text
description-block-statement = "accDescr" "{" description-block-text ( "}" | end-of-text )
```

An accessibility title and an accessibility description are the text of their
unit without the whitespace at its ends, and a later statement of the same kind
is a statement like the first; a description on a line and a block are both
descriptions. [fixture: xychart/db-acc-title-twice] [fixture:
xychart/db-acc-title-three-times] [fixture:
xychart/db-acc-title-then-empty-line] [fixture:
xychart/db-acc-descr-block-then-line] [fixture:
xychart/db-acc-descr-line-then-block] [fixture:
xychart/db-acc-descr-block-then-empty-line] [fixture:
xychart/db-acc-descr-line-then-empty-line] [fixture:
xychart/spec-xychart-jison-d54713b7] [fixture:
xychart/spec-xychart-jison-440633f5] [fixture:
xychart/spec-xychart-jison-b2031c12]

### Empty description blocks

A description block statement whose text is empty or whitespace only is an
**empty description block**: `accDescr {}`, `accDescr { }`, and a block of line
feeds. mermaid.js reads no token for a closed one, wherever it stands. A closed
one is a statement where a statement starts: on a line of its own, and before or
after another statement on its line, as in `title T accDescr {}`. Anywhere else
the grammar takes it nowhere, and the input is rejected: inside the words of a
title, after an axis or a plot keyword, inside the categories, the values, or a
range, and between the header and the orientation. mermaid.js accepts such an
input as if the block were not there, which is the known divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md). An
empty description block before the header is no part of the diagram text and is
read by no detector. [fixture: xychart/db-acc-descr-empty-block-alone] [fixture:
xychart/db-acc-descr-block-empty] [fixture:
xychart/db-acc-descr-empty-block-spaces-then-plot] [fixture:
xychart/db-acc-descr-empty-block-line-feed-inside] [fixture:
xychart/db-acc-descr-empty-block-before-plot] [fixture:
xychart/db-acc-descr-empty-block-after-title-same-line] [fixture:
xychart/db-acc-descr-empty-block-before-title-same-line] [fixture:
xychart/db-acc-descr-block-then-empty-block] [fixture:
xychart/db-acc-descr-line-then-empty-braces] [fixture:
xychart/db-acc-descr-line-then-empty-block] [fixture:
xychart/db-acc-descr-line-then-spaces-block] [fixture:
xychart/gram-acc-descr-empty-block-before-header] [fixture:
xychart/div-empty-description-block-inside-title-text] [fixture:
xychart/div-empty-description-block-inside-axis] [fixture:
xychart/div-empty-description-block-inside-plot] [fixture:
xychart/div-empty-description-block-inside-values] [fixture:
xychart/div-empty-description-block-in-categories] [fixture:
xychart/div-empty-description-block-in-range] [fixture:
xychart/div-empty-description-block-before-orientation]

An empty description block that is not closed runs to the end of the text.
mermaid.js reads a token with the empty text for it, so it is no tokenless form,
and it is accepted only where a statement starts, as in `title T accDescr {` at
the end of the text, as in mermaid.js. [fixture:
xychart/db-acc-descr-unclosed-empty-block-after-line] [fixture:
xychart/db-acc-descr-unclosed-empty-block-spaces] [fixture:
xychart/db-acc-descr-unclosed-empty-block-line-feeds] [fixture:
xychart/db-acc-descr-unclosed-empty-block-after-title-same-line] [fixture:
xychart/gram-acc-descr-unclosed-empty-block-in-values] [fixture:
xychart/gram-x-axis-unclosed-empty-block]

### Empty strings

An empty string, `""`, is a `string` unit with the empty text. mermaid.js reads
no token for it, wherever it stands. The grammar takes it as the whole title of
a plot, as the whole title of an axis followed by data, and as the whole label
of a value, where it is a string with the empty value: `line "" [1]`,
`x-axis "" [a]`, `y-axis "" 1 --> 2`, and `line [1 ""]` are accepted. It is no
title of the chart and no category, which are never empty: `title ""` and
`x-axis ["", b]` are rejected, as in mermaid.js, and so are `title "" ""` and
`x-axis "" ""` without data. Anywhere else the grammar takes it nowhere, and the
input is rejected, while mermaid.js accepts it as if the string were not there:
on a line of its own, before or after a statement, before or after the words or
the string of a title, of an axis, or of a plot, two empty strings as the title
of an axis followed by data or of a plot, before or after a category, before a
value, before or after a label, and between the header and the orientation. This
is the known divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).
[fixture: xychart/db-grid-empty-plot-title-quoted] [fixture:
xychart/db-empty-string-as-x-axis-title-before-band] [fixture:
xychart/db-empty-string-as-x-axis-title-before-range] [fixture:
xychart/db-empty-string-as-y-axis-title] [fixture:
xychart/db-label-empty-string] [fixture: xychart/gram-title-empty-string]
[fixture: xychart/gram-grid-empty-category-quoted] [fixture:
xychart/div-empty-string-line] [fixture:
xychart/div-empty-string-before-statement] [fixture:
xychart/div-empty-string-after-title] [fixture:
xychart/div-empty-string-before-title-word] [fixture:
xychart/div-empty-string-after-quoted-title] [fixture:
xychart/div-empty-string-before-axis-title] [fixture:
xychart/div-empty-string-after-axis-title] [fixture:
xychart/div-empty-string-before-plot-title] [fixture:
xychart/div-empty-string-after-plot-title] [fixture:
xychart/div-empty-string-twice-as-plot-title] [fixture:
xychart/div-empty-string-twice-as-x-axis-title] [fixture:
xychart/div-empty-string-twice-as-y-axis-title] [fixture:
xychart/gram-title-two-empty-strings] [fixture:
xychart/gram-x-axis-two-empty-strings-only] [fixture:
xychart/div-empty-string-before-category] [fixture:
xychart/div-empty-string-after-category] [fixture:
xychart/div-empty-string-before-value] [fixture:
xychart/div-empty-string-before-label] [fixture:
xychart/div-empty-string-after-label] [fixture:
xychart/div-empty-string-before-orientation]

### Rejections outside the grammar

None. The Db of mermaid.js throws for no input that its grammar accepts while it
reads the text: its functions only store the texts and the numbers, and an empty
chart, an axis without plots, and a plot without axes are accepted. [fixture:
xychart/db-header-beta-only] [fixture: xychart/db-y-axis-no-range-no-plot]
[fixture: xychart/db-line-values]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a keyword, a number, or the arrow makes the input rejected
  here, while mermaid.js joins the parts (see
  [Directives inside units](#directives-inside-units)). [fixture:
  xychart/div-directive-in-keyword] [fixture:
  xychart/div-directive-in-axis-keyword] [fixture:
  xychart/div-directive-in-range-number] [fixture:
  xychart/db-plot-directive-in-number] [fixture: xychart/db-directive-in-arrow]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that the line rule of `style` lines applies to, as one with
  `"style:#a"`, the ignored `;` inside a value or a keyword makes the input
  rejected here, while mermaid.js joins the parts: `line "style:#a" [1;2]` has
  the value 12 there, and `li;ne` is the keyword `line`. [fixture:
  xychart/div-ignored-semicolon-in-value] [fixture:
  xychart/div-ignored-semicolon-in-keyword]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.md).**
  A `%%` glued to a unit of one character takes that character in mermaid.js
  (see [Comments](#comments)). [fixture:
  xychart/div-comment-glued-after-title-word] [fixture:
  xychart/div-comment-glued-after-axis-title] [fixture:
  xychart/div-comment-glued-after-bracket] [fixture:
  xychart/div-comment-glued-after-categories] [fixture:
  xychart/div-comment-glued-after-label] [fixture:
  xychart/div-comment-glued-after-range] [fixture:
  xychart/div-comment-takes-one-letter-word] [fixture:
  xychart/div-comment-takes-hyphen]
- **[`title-digit-after-axis-statement`](../known-divergences/title-digit-after-axis-statement.md).**
  A title without quotes that holds a digit, after an axis statement on its line
  or on a later line, is rejected by mermaid.js (see
  [The axis context](#the-axis-context)). [fixture:
  xychart/div-title-digit-after-axis-semicolon] [fixture:
  xychart/div-title-digit-next-line-after-axis-and-plot]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty string and an empty description block where the grammar takes none
  are rejected here, while mermaid.js accepts them as if they were not there
  (see [Empty description blocks](#empty-description-blocks) and
  [Empty strings](#empty-strings)). [fixture: xychart/div-empty-string-line]
  [fixture: xychart/div-empty-string-before-title-word] [fixture:
  xychart/div-empty-description-block-inside-title-text] [fixture:
  xychart/div-empty-description-block-in-categories]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, in a string or in an accessibility text, makes mermaid.js hand the
  text to the C4 parser, which rejects it; here the text is an XY chart.
  [fixture: xychart/div-c4-keyword-in-title] [fixture:
  xychart/div-c4-keyword-in-acc-title]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `accTitle: b="c">d` has the accessibility
  title `b='c'>d` in mermaid.js, while here the frontmatter is not searched for
  tags and the quotes stay. [fixture:
  xychart/div-html-tag-starts-in-frontmatter-acc-title]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: xychart/div-frontmatter-invalid-yaml]

The known divergences
[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md),
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md),
and
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.md)
have no case in this diagram type: mermaid.js reads a line of `%%` alone before
the header as a comment line, its comment rule leaves the line feed after the
comment, and it reads `%%{` that starts no directive as a comment. [fixture:
xychart/header-after-bare-percent-line] [fixture:
xychart/db-comment-after-statement] [fixture:
xychart/db-directive-unclosed-after-plot]
