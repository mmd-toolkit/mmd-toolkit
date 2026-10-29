# Quadrant chart

Japanese version: [quadrant.ja.md](./quadrant.ja.md)

Source of truth in mermaid.js:

- [`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison)
- [`quadrantDb.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDb.ts)
- the tests (`*.spec.ts`) in
  [`quadrant-chart/`](https://github.com/mermaid-js/mermaid/tree/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart)

This document covers the diagram type `quadrantChart`. The nodes of the tree are
defined in [ast/quadrant.md](../ast/quadrant.md).

## Detection

Entry 22 of [detection.md](../detection.md) selects this grammar: the text
starts with `quadrantChart`, after whitespace, in exactly this case
([`quadrantDetector.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/quadrantDetector.ts#L9-L11)).
`QUADRANTCHART`, `quadrantchart`, and `QuadrantChart` match no detector.
[fixture: quadrant/header-upper-case] [fixture: quadrant/header-lower-case]
[fixture: quadrant/header-capitalized]

The lexer then reads the header, the keyword `quadrantChart`, with the spaces
before and after it, compared case-insensitively and followed by anything (see
[The statement context](#the-statement-context)). A second header, on a line of
its own or on the line of the first, is rejected, and so is the word
`quadrantChart` anywhere a unit starts: `A quadrantChart: [0.3, 0.6]` is
rejected, while `"quadrantChart": [0.3, 0.6]` is a point. The header may be the
whole text. [fixture: quadrant/spec-quadrant-jison-fe2d2340] [fixture:
quadrant/header-word-suffix] [fixture: quadrant/header-spaced-word-suffix]
[fixture: quadrant/header-dash-suffix] [fixture:
quadrant/header-non-ascii-suffix] [fixture: quadrant/header-digit-suffix]
[fixture: quadrant/header-title-glued] [fixture: quadrant/header-twice]
[fixture: quadrant/header-twice-indented] [fixture:
quadrant/header-twice-same-line] [fixture: quadrant/db-keyword-header-in-word]
[fixture: quadrant/db-name-quoted-header-word] [fixture:
quadrant/gram-keyword-header-in-quadrant-text] [fixture:
quadrant/gram-name-header-word] [fixture:
quadrant/gram-name-header-word-after-word] [fixture: quadrant/header-bom-after]
[fixture: quadrant/header-bom-after-statement] [fixture:
quadrant/header-underscore-suffix]

Whitespace, empty lines, comment lines, a line of `%%` alone, directive lines, a
line `%%{ }%%`, and a frontmatter before the header change nothing (see
[Leading whitespace](../common.md#leading-whitespace)); a line that starts with
`#` or `;`, a statement, or a text of nothing but a comment line before the
header is detected as no diagram. [fixture: quadrant/header-indented] [fixture:
quadrant/header-tab-indented] [fixture: quadrant/header-after-bare-percent-line]
[fixture: quadrant/header-after-blank-lines] [fixture:
quadrant/header-after-comment-line] [fixture:
quadrant/header-after-directive-line] [fixture:
quadrant/header-after-empty-braces-line] [fixture:
quadrant/header-after-frontmatter] [fixture:
quadrant/header-after-frontmatter-and-comment] [fixture:
quadrant/header-after-hash-line] [fixture: quadrant/header-after-semicolon-line]
[fixture: quadrant/header-after-whitespace-line] [fixture:
quadrant/header-bom-before] [fixture: quadrant/header-nbsp-before] [fixture:
quadrant/header-ideographic-space-before] [fixture: quadrant/header-ls-before]
[fixture: quadrant/header-leading-semicolon] [fixture:
quadrant/header-only-comment] [fixture: quadrant/header-statement-first]

On the line of the header, the first statement may follow the header, after
spaces, after a tab, or with nothing between them, and so may a `;`, a comment,
or a directive: `quadrantChart title T`, `quadrantChart;title T`, and
`quadrantChartA: [0.3, 0.6]` are accepted. A text that starts no statement after
it makes the input rejected, such as a word, a dash and a word, a digit, or a
character outside ASCII glued to the header, and a U+00A0, a U+2028, a U+2029,
or a U+0085 after it, while a vertical tab and a form feed after it are
whitespace. [fixture: quadrant/header-comment-on-header-line] [fixture:
quadrant/header-comment-glued] [fixture: quadrant/header-directive-glued]
[fixture: quadrant/header-bare-percent-line-after-header] [fixture:
quadrant/header-statement-on-header-line] [fixture:
quadrant/header-statement-on-header-line-tab] [fixture:
quadrant/header-semicolon] [fixture: quadrant/header-semicolon-spaced] [fixture:
quadrant/header-semicolon-statement] [fixture: quadrant/header-trailing-nbsp]
[fixture: quadrant/header-trailing-spaces] [fixture:
quadrant/header-trailing-tab] [fixture: quadrant/header-crlf] [fixture:
quadrant/header-cr] [fixture: quadrant/header-ls-after] [fixture:
quadrant/header-ps-after] [fixture: quadrant/header-vt-after] [fixture:
quadrant/header-ff-after] [fixture: quadrant/header-nel-after] [fixture:
quadrant/header-glued-point]

## Lexical structure

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it. At each position, the lexer
applies the first rule of the current context that matches there. When no rule
of the current context matches, the input is rejected; the lists below do not
repeat this.

The text may end in the statement context and in the title context. It may not
end in a string, a markdown string, a description block, a point, or the class
name context, nor right after `accTitle:` or `accDescr:` with only whitespace
after it: `x-axis "L`, ``quadrant-1 "`a``, `accDescr {` and a line `D`,
`A: [0.3,`, `A:::c1`, and `accTitle:` at the end of the text are rejected, while
`title` and `x-axis L -->` at the end of the text are a title with no text and
an axis statement with the arrow. [fixture:
quadrant/db-unclosed-axis-arrow-at-end] [fixture:
quadrant/db-unclosed-directive-at-end] [fixture:
quadrant/db-unclosed-title-keyword-at-end] [fixture:
quadrant/gram-unclosed-acc-block-after-text] [fixture:
quadrant/gram-unclosed-acc-descr-at-end] [fixture:
quadrant/gram-unclosed-acc-title-at-end] [fixture:
quadrant/gram-unclosed-axis-quote-at-end] [fixture:
quadrant/gram-unclosed-class-marker-at-end] [fixture:
quadrant/gram-unclosed-class-name-at-end] [fixture:
quadrant/gram-unclosed-classdef-at-end] [fixture:
quadrant/gram-unclosed-markdown-at-end] [fixture:
quadrant/gram-unclosed-name-quote-at-end] [fixture:
quadrant/gram-unclosed-point-after-comma-at-end] [fixture:
quadrant/gram-unclosed-quadrant-quote-at-end] [fixture:
quadrant/gram-acc-title-spaces-at-end]

**Whitespace.** In this diagram type, whitespace between units is a space, a
tab, a vertical tab, or a form feed, but for the places named below, and each of
these characters is a `space` unit where the grammar counts it (see
[The statement context](#the-statement-context)). The other whitespace
characters of [Notation](../common.md#notation), U+00A0, U+2028, U+2029, U+3000,
and U+FEFF, are characters outside ASCII, which are characters of a word: they
stand inside a text, a name, a title, and an accessibility text, and at the ends
of a text and a name, where the Db trims them, while a title, an accessibility
text, and the text of a description block leave them out at their ends with the
other whitespace (see [ast/quadrant.md](../ast/quadrant.md#quadrantliteral)),
[fixture: quadrant/db-ends-title-nbsp-end] [fixture:
quadrant/db-ends-acc-title-nbsp-end] [fixture:
quadrant/db-acc-descr-block-nbsp-before-brace-close] and they start a text where
a statement starts, so that U+00A0 before `x-axis` or `title` makes the input
rejected and U+00A0 before the name of a point is part of the name. Where a rule
reads a run of whitespace, between `accTitle` or `accDescr` and its `:` or `{`,
after that `:` or `{`, and in the point context, around the `:` and the `[` that
start a point and inside its brackets, whitespace is every whitespace character
of [Notation](../common.md#notation), line feeds included (see
[Accessibility values](#accessibility-values) and
[The point context](#the-point-context)). Everywhere else, in a `space` unit,
around a keyword and the arrow, and after the `]` of a point, it is a space, a
tab, a vertical tab, or a form feed, and after the `]` only spaces are part of
it. [fixture: quadrant/db-point-nbsp-before-colon] [fixture:
quadrant/db-point-nbsp-inside-brackets] [fixture:
quadrant/gram-ends-point-nbsp-end] A line of nothing but spaces and tabs stands
anywhere, while a line of U+00A0, U+3000, U+FEFF, or U+2028 is a text where no
statement starts and is rejected. [fixture: quadrant/db-grid-tab-acc-descr]
[fixture: quadrant/db-grid-tab-acc-descr-block] [fixture:
quadrant/db-grid-tab-acc-title] [fixture: quadrant/db-grid-tab-point-bare]
[fixture: quadrant/db-grid-tab-point-quoted] [fixture:
quadrant/db-grid-tab-quadrant-bare] [fixture:
quadrant/db-grid-tab-quadrant-quoted] [fixture: quadrant/db-grid-tab-title]
[fixture: quadrant/db-grid-tab-x-axis-bare] [fixture:
quadrant/db-grid-tab-x-axis-quoted] [fixture:
quadrant/db-grid-tab-x-axis-right-bare] [fixture:
quadrant/db-grid-tab-x-axis-right-quoted] [fixture:
quadrant/db-grid-tab-y-axis-bare] [fixture: quadrant/db-grid-tab-y-axis-quoted]
[fixture: quadrant/db-grid-tab-y-axis-top-bare] [fixture:
quadrant/db-grid-tab-y-axis-top-quoted] [fixture:
quadrant/gram-grid-tab-class-name] [fixture:
quadrant/gram-grid-tab-classdef-name] [fixture: quadrant/db-grid-bom-acc-descr]
[fixture: quadrant/db-grid-bom-acc-descr-block] [fixture:
quadrant/db-grid-bom-acc-title] [fixture: quadrant/db-grid-bom-classdef-name]
[fixture: quadrant/db-grid-bom-point-bare] [fixture:
quadrant/db-grid-bom-point-quoted] [fixture: quadrant/db-grid-bom-quadrant-bare]
[fixture: quadrant/db-grid-bom-quadrant-quoted] [fixture:
quadrant/db-grid-bom-title] [fixture: quadrant/db-grid-bom-x-axis-bare]
[fixture: quadrant/db-grid-bom-x-axis-quoted] [fixture:
quadrant/db-grid-bom-x-axis-right-bare] [fixture:
quadrant/db-grid-bom-x-axis-right-quoted] [fixture:
quadrant/db-grid-bom-y-axis-bare] [fixture: quadrant/db-grid-bom-y-axis-quoted]
[fixture: quadrant/db-grid-bom-y-axis-top-bare] [fixture:
quadrant/db-grid-bom-y-axis-top-quoted] [fixture:
quadrant/gram-grid-bom-class-name] [fixture: quadrant/db-grid-nbsp-acc-descr]
[fixture: quadrant/db-grid-nbsp-acc-descr-block] [fixture:
quadrant/db-grid-nbsp-acc-title] [fixture: quadrant/db-grid-nbsp-classdef-name]
[fixture: quadrant/db-grid-nbsp-point-bare] [fixture:
quadrant/db-grid-nbsp-point-quoted] [fixture:
quadrant/db-grid-nbsp-quadrant-bare] [fixture:
quadrant/db-grid-nbsp-quadrant-quoted] [fixture: quadrant/db-grid-nbsp-title]
[fixture: quadrant/db-grid-nbsp-x-axis-bare] [fixture:
quadrant/db-grid-nbsp-x-axis-quoted] [fixture:
quadrant/db-grid-nbsp-x-axis-right-bare] [fixture:
quadrant/db-grid-nbsp-x-axis-right-quoted] [fixture:
quadrant/db-grid-nbsp-y-axis-bare] [fixture:
quadrant/db-grid-nbsp-y-axis-quoted] [fixture:
quadrant/db-grid-nbsp-y-axis-top-bare] [fixture:
quadrant/db-grid-nbsp-y-axis-top-quoted] [fixture:
quadrant/gram-grid-nbsp-class-name] [fixture:
quadrant/db-grid-ideographic-acc-descr] [fixture:
quadrant/db-grid-ideographic-acc-descr-block] [fixture:
quadrant/db-grid-ideographic-acc-title] [fixture:
quadrant/db-grid-ideographic-classdef-name] [fixture:
quadrant/db-grid-ideographic-point-bare] [fixture:
quadrant/db-grid-ideographic-point-quoted] [fixture:
quadrant/db-grid-ideographic-quadrant-bare] [fixture:
quadrant/db-grid-ideographic-quadrant-quoted] [fixture:
quadrant/db-grid-ideographic-title] [fixture:
quadrant/db-grid-ideographic-x-axis-bare] [fixture:
quadrant/db-grid-ideographic-x-axis-quoted] [fixture:
quadrant/db-grid-ideographic-x-axis-right-bare] [fixture:
quadrant/db-grid-ideographic-x-axis-right-quoted] [fixture:
quadrant/db-grid-ideographic-y-axis-bare] [fixture:
quadrant/db-grid-ideographic-y-axis-quoted] [fixture:
quadrant/db-grid-ideographic-y-axis-top-bare] [fixture:
quadrant/db-grid-ideographic-y-axis-top-quoted] [fixture:
quadrant/gram-grid-ideographic-class-name] [fixture:
quadrant/db-grid-ls-acc-descr] [fixture: quadrant/db-grid-ls-acc-descr-block]
[fixture: quadrant/db-grid-ls-acc-title] [fixture:
quadrant/db-grid-ls-classdef-name] [fixture: quadrant/db-grid-ls-point-bare]
[fixture: quadrant/db-grid-ls-point-quoted] [fixture:
quadrant/db-grid-ls-quadrant-bare] [fixture:
quadrant/db-grid-ls-quadrant-quoted] [fixture: quadrant/db-grid-ls-title]
[fixture: quadrant/db-grid-ls-x-axis-bare] [fixture:
quadrant/db-grid-ls-x-axis-quoted] [fixture:
quadrant/db-grid-ls-x-axis-right-bare] [fixture:
quadrant/db-grid-ls-x-axis-right-quoted] [fixture:
quadrant/db-grid-ls-y-axis-bare] [fixture: quadrant/db-grid-ls-y-axis-quoted]
[fixture: quadrant/db-grid-ls-y-axis-top-bare] [fixture:
quadrant/db-grid-ls-y-axis-top-quoted] [fixture:
quadrant/gram-grid-ls-class-name] [fixture: quadrant/db-grid-ps-acc-descr]
[fixture: quadrant/db-grid-ps-acc-descr-block] [fixture:
quadrant/db-grid-ps-acc-title] [fixture: quadrant/db-grid-ps-classdef-name]
[fixture: quadrant/db-grid-ps-point-bare] [fixture:
quadrant/db-grid-ps-point-quoted] [fixture: quadrant/db-grid-ps-quadrant-bare]
[fixture: quadrant/db-grid-ps-quadrant-quoted] [fixture:
quadrant/db-grid-ps-title] [fixture: quadrant/db-grid-ps-x-axis-bare] [fixture:
quadrant/db-grid-ps-x-axis-quoted] [fixture:
quadrant/db-grid-ps-x-axis-right-bare] [fixture:
quadrant/db-grid-ps-x-axis-right-quoted] [fixture:
quadrant/db-grid-ps-y-axis-bare] [fixture: quadrant/db-grid-ps-y-axis-quoted]
[fixture: quadrant/db-grid-ps-y-axis-top-bare] [fixture:
quadrant/db-grid-ps-y-axis-top-quoted] [fixture:
quadrant/gram-grid-ps-class-name] [fixture:
quadrant/db-whitespace-line-between-spaces-and-tab] [fixture:
quadrant/db-whitespace-line-between-tab] [fixture:
quadrant/db-whitespace-line-first-spaces-and-tab] [fixture:
quadrant/db-whitespace-line-first-tab] [fixture:
quadrant/db-whitespace-line-last-spaces-and-tab] [fixture:
quadrant/db-whitespace-line-last-tab] [fixture:
quadrant/gram-whitespace-line-between-bom] [fixture:
quadrant/gram-whitespace-line-between-ideographic] [fixture:
quadrant/gram-whitespace-line-between-ls] [fixture:
quadrant/gram-whitespace-line-between-nbsp] [fixture:
quadrant/gram-whitespace-line-first-bom] [fixture:
quadrant/gram-whitespace-line-first-ideographic] [fixture:
quadrant/gram-whitespace-line-first-ls] [fixture:
quadrant/gram-whitespace-line-first-nbsp] [fixture:
quadrant/gram-whitespace-line-last-bom] [fixture:
quadrant/gram-whitespace-line-last-ideographic] [fixture:
quadrant/gram-whitespace-line-last-ls] [fixture:
quadrant/gram-whitespace-line-last-nbsp] [fixture:
quadrant/db-ends-acc-descr-bom-end] [fixture:
quadrant/db-ends-acc-descr-bom-end-of-text] [fixture:
quadrant/db-ends-acc-descr-cr-end-of-text] [fixture:
quadrant/db-ends-acc-descr-crlf-end-of-text] [fixture:
quadrant/db-ends-acc-descr-ideographic-end] [fixture:
quadrant/db-ends-acc-descr-ideographic-end-of-text] [fixture:
quadrant/db-ends-acc-descr-ls-end-of-text] [fixture:
quadrant/db-ends-acc-descr-nbsp-end] [fixture:
quadrant/db-ends-acc-descr-nbsp-end-of-text] [fixture:
quadrant/db-ends-acc-descr-no-line-feed] [fixture:
quadrant/db-ends-acc-descr-ps-end-of-text] [fixture:
quadrant/db-ends-acc-descr-tab-end] [fixture:
quadrant/db-ends-acc-descr-tab-end-of-text] [fixture:
quadrant/db-ends-acc-descr-tab-start] [fixture:
quadrant/db-ends-acc-title-bom-end] [fixture:
quadrant/db-ends-acc-title-bom-end-of-text] [fixture:
quadrant/db-ends-acc-title-cr-end-of-text] [fixture:
quadrant/db-ends-acc-title-crlf-end-of-text] [fixture:
quadrant/db-ends-acc-title-ideographic-end] [fixture:
quadrant/db-ends-acc-title-ideographic-end-of-text] [fixture:
quadrant/db-ends-acc-title-ls-end-of-text] [fixture:
quadrant/db-ends-acc-title-nbsp-end] [fixture:
quadrant/db-ends-acc-title-nbsp-end-of-text] [fixture:
quadrant/db-ends-acc-title-no-line-feed] [fixture:
quadrant/db-ends-acc-title-ps-end-of-text] [fixture:
quadrant/db-ends-acc-title-tab-end] [fixture:
quadrant/db-ends-acc-title-tab-end-of-text] [fixture:
quadrant/db-ends-acc-title-tab-start] [fixture:
quadrant/db-ends-classdef-cr-end-of-text] [fixture:
quadrant/db-ends-classdef-crlf-end-of-text] [fixture:
quadrant/db-ends-classdef-no-line-feed] [fixture:
quadrant/db-ends-classdef-tab-end] [fixture:
quadrant/db-ends-classdef-tab-end-of-text] [fixture:
quadrant/db-ends-classdef-tab-start] [fixture: quadrant/db-ends-point-bom-start]
[fixture: quadrant/db-ends-point-class-bom-start] [fixture:
quadrant/db-ends-point-class-cr-end-of-text] [fixture:
quadrant/db-ends-point-class-crlf-end-of-text] [fixture:
quadrant/db-ends-point-class-no-line-feed] [fixture:
quadrant/db-ends-point-class-tab-start] [fixture:
quadrant/db-ends-point-cr-end-of-text] [fixture:
quadrant/db-ends-point-crlf-end-of-text] [fixture:
quadrant/db-ends-point-no-line-feed] [fixture:
quadrant/db-ends-point-style-bom-start] [fixture:
quadrant/db-ends-point-style-cr-end-of-text] [fixture:
quadrant/db-ends-point-style-crlf-end-of-text] [fixture:
quadrant/db-ends-point-style-no-line-feed] [fixture:
quadrant/db-ends-point-style-tab-end] [fixture:
quadrant/db-ends-point-style-tab-end-of-text] [fixture:
quadrant/db-ends-point-style-tab-start] [fixture:
quadrant/db-ends-point-tab-start] [fixture: quadrant/db-ends-quadrant-bom-end]
[fixture: quadrant/db-ends-quadrant-bom-end-of-text] [fixture:
quadrant/db-ends-quadrant-cr-end-of-text] [fixture:
quadrant/db-ends-quadrant-crlf-end-of-text] [fixture:
quadrant/db-ends-quadrant-ideographic-end] [fixture:
quadrant/db-ends-quadrant-ideographic-end-of-text] [fixture:
quadrant/db-ends-quadrant-ls-end-of-text] [fixture:
quadrant/db-ends-quadrant-nbsp-end] [fixture:
quadrant/db-ends-quadrant-nbsp-end-of-text] [fixture:
quadrant/db-ends-quadrant-no-line-feed] [fixture:
quadrant/db-ends-quadrant-ps-end-of-text] [fixture:
quadrant/db-ends-quadrant-tab-end] [fixture:
quadrant/db-ends-quadrant-tab-end-of-text] [fixture:
quadrant/db-ends-quadrant-tab-start] [fixture: quadrant/db-ends-title-bom-end]
[fixture: quadrant/db-ends-title-bom-end-of-text] [fixture:
quadrant/db-ends-title-cr-end-of-text] [fixture:
quadrant/db-ends-title-crlf-end-of-text] [fixture:
quadrant/db-ends-title-ideographic-end] [fixture:
quadrant/db-ends-title-ideographic-end-of-text] [fixture:
quadrant/db-ends-title-ls-end-of-text] [fixture:
quadrant/db-ends-title-nbsp-end] [fixture:
quadrant/db-ends-title-nbsp-end-of-text] [fixture:
quadrant/db-ends-title-no-line-feed] [fixture:
quadrant/db-ends-title-ps-end-of-text] [fixture:
quadrant/db-ends-title-tab-end-of-text] [fixture:
quadrant/db-ends-x-axis-bom-end] [fixture:
quadrant/db-ends-x-axis-bom-end-of-text] [fixture:
quadrant/db-ends-x-axis-cr-end-of-text] [fixture:
quadrant/db-ends-x-axis-crlf-end-of-text] [fixture:
quadrant/db-ends-x-axis-ideographic-end] [fixture:
quadrant/db-ends-x-axis-ideographic-end-of-text] [fixture:
quadrant/db-ends-x-axis-ls-end-of-text] [fixture:
quadrant/db-ends-x-axis-nbsp-end] [fixture:
quadrant/db-ends-x-axis-nbsp-end-of-text] [fixture:
quadrant/db-ends-x-axis-no-line-feed] [fixture:
quadrant/db-ends-x-axis-ps-end-of-text] [fixture:
quadrant/db-ends-x-axis-tab-end] [fixture:
quadrant/db-ends-x-axis-tab-end-of-text] [fixture:
quadrant/db-ends-x-axis-tab-start] [fixture: quadrant/db-ends-y-axis-bom-end]
[fixture: quadrant/db-ends-y-axis-bom-end-of-text] [fixture:
quadrant/db-ends-y-axis-cr-end-of-text] [fixture:
quadrant/db-ends-y-axis-crlf-end-of-text] [fixture:
quadrant/db-ends-y-axis-ideographic-end] [fixture:
quadrant/db-ends-y-axis-ideographic-end-of-text] [fixture:
quadrant/db-ends-y-axis-ls-end-of-text] [fixture:
quadrant/db-ends-y-axis-nbsp-end] [fixture:
quadrant/db-ends-y-axis-nbsp-end-of-text] [fixture:
quadrant/db-ends-y-axis-no-line-feed] [fixture:
quadrant/db-ends-y-axis-ps-end-of-text] [fixture:
quadrant/db-ends-y-axis-tab-end] [fixture:
quadrant/db-ends-y-axis-tab-end-of-text] [fixture:
quadrant/db-ends-y-axis-tab-start] [fixture:
quadrant/gram-ends-acc-descr-bom-start] [fixture:
quadrant/gram-ends-acc-title-bom-start] [fixture:
quadrant/gram-ends-classdef-bom-end] [fixture:
quadrant/gram-ends-classdef-bom-end-of-text] [fixture:
quadrant/gram-ends-classdef-bom-start] [fixture:
quadrant/gram-ends-classdef-ideographic-end] [fixture:
quadrant/gram-ends-classdef-ideographic-end-of-text] [fixture:
quadrant/gram-ends-classdef-ls-end-of-text] [fixture:
quadrant/gram-ends-classdef-nbsp-end] [fixture:
quadrant/gram-ends-classdef-nbsp-end-of-text] [fixture:
quadrant/gram-ends-classdef-ps-end-of-text] [fixture:
quadrant/gram-ends-point-bom-end] [fixture:
quadrant/gram-ends-point-bom-end-of-text] [fixture:
quadrant/gram-ends-point-class-bom-end] [fixture:
quadrant/gram-ends-point-class-bom-end-of-text] [fixture:
quadrant/gram-ends-point-class-ideographic-end] [fixture:
quadrant/gram-ends-point-class-ideographic-end-of-text] [fixture:
quadrant/gram-ends-point-class-ls-end-of-text] [fixture:
quadrant/gram-ends-point-class-nbsp-end] [fixture:
quadrant/gram-ends-point-class-nbsp-end-of-text] [fixture:
quadrant/gram-ends-point-class-ps-end-of-text] [fixture:
quadrant/gram-ends-point-class-tab-end] [fixture:
quadrant/gram-ends-point-class-tab-end-of-text] [fixture:
quadrant/gram-ends-point-ideographic-end] [fixture:
quadrant/gram-ends-point-ideographic-end-of-text] [fixture:
quadrant/gram-ends-point-ls-end-of-text] [fixture:
quadrant/gram-ends-point-nbsp-end] [fixture:
quadrant/gram-ends-point-nbsp-end-of-text] [fixture:
quadrant/gram-ends-point-ps-end-of-text] [fixture:
quadrant/gram-ends-point-style-bom-end] [fixture:
quadrant/gram-ends-point-style-bom-end-of-text] [fixture:
quadrant/gram-ends-point-style-ideographic-end] [fixture:
quadrant/gram-ends-point-style-ideographic-end-of-text] [fixture:
quadrant/gram-ends-point-style-ls-end-of-text] [fixture:
quadrant/gram-ends-point-style-nbsp-end] [fixture:
quadrant/gram-ends-point-style-nbsp-end-of-text] [fixture:
quadrant/gram-ends-point-style-ps-end-of-text] [fixture:
quadrant/gram-ends-point-tab-end-of-text] [fixture:
quadrant/gram-ends-quadrant-bom-start] [fixture:
quadrant/gram-ends-title-bom-start] [fixture:
quadrant/gram-ends-x-axis-bom-start] [fixture:
quadrant/gram-ends-y-axis-bom-start] [fixture:
quadrant/gram-nbsp-before-keyword] [fixture: quadrant/gram-nbsp-before-title]
[fixture: quadrant/db-tab-before-keyword] [fixture: quadrant/db-name-after-nbsp]

**Line breaks.** A line break of the source is a line feed in the diagram text
(see [Reading a source](../common.md#reading-a-source)), so a CRLF and a lone CR
end a line as a line feed does. A line feed where a unit starts in the statement
context is a `newline` unit, which ends a statement: a keyword with its text on
the next line, `x-axis` followed by a line `L`, is rejected, and so is an axis
statement whose arrow stands on the next line. A line feed is a character of the
text inside a string, a markdown string, and a description block, and whitespace
inside the brackets of a point, around the `:` and the `,` of a point, and
around the `:` of `accTitle:` and `accDescr:`; before the `:` of a point, it is
whitespace only after a whitespace character, as described in
[The point context](#the-point-context). A U+2028 and a U+2029 are no line
break. [fixture: quadrant/gram-keyword-blank-line-classdef] [fixture:
quadrant/gram-keyword-blank-line-quadrant] [fixture:
quadrant/gram-keyword-blank-line-x-axis] [fixture:
quadrant/gram-keyword-blank-line-y-axis] [fixture:
quadrant/gram-keyword-comment-line-classdef] [fixture:
quadrant/gram-keyword-comment-line-quadrant] [fixture:
quadrant/gram-keyword-comment-line-title] [fixture:
quadrant/gram-keyword-comment-line-x-axis] [fixture:
quadrant/gram-keyword-comment-line-y-axis] [fixture:
quadrant/gram-keyword-directive-line-classdef] [fixture:
quadrant/gram-keyword-directive-line-quadrant] [fixture:
quadrant/gram-keyword-directive-line-x-axis] [fixture:
quadrant/gram-keyword-directive-line-y-axis] [fixture:
quadrant/gram-keyword-line-feed-classdef] [fixture:
quadrant/gram-keyword-line-feed-quadrant] [fixture:
quadrant/gram-keyword-line-feed-title] [fixture:
quadrant/gram-keyword-line-feed-x-axis] [fixture:
quadrant/gram-keyword-line-feed-y-axis] [fixture:
quadrant/db-grid-cr-acc-descr-block] [fixture: quadrant/db-grid-cr-point-quoted]
[fixture: quadrant/db-grid-cr-quadrant-quoted] [fixture:
quadrant/db-grid-cr-x-axis-quoted] [fixture:
quadrant/db-grid-cr-x-axis-right-quoted] [fixture:
quadrant/db-grid-cr-y-axis-quoted] [fixture:
quadrant/db-grid-cr-y-axis-top-quoted] [fixture:
quadrant/db-grid-crlf-acc-descr-block] [fixture:
quadrant/db-grid-crlf-point-quoted] [fixture:
quadrant/db-grid-crlf-quadrant-quoted] [fixture:
quadrant/db-grid-crlf-x-axis-quoted] [fixture:
quadrant/db-grid-crlf-x-axis-right-quoted] [fixture:
quadrant/db-grid-crlf-y-axis-quoted] [fixture:
quadrant/db-grid-crlf-y-axis-top-quoted] [fixture:
quadrant/db-grid-lf-acc-descr-block] [fixture: quadrant/db-grid-lf-point-quoted]
[fixture: quadrant/db-grid-lf-quadrant-quoted] [fixture:
quadrant/db-grid-lf-x-axis-quoted] [fixture:
quadrant/db-grid-lf-x-axis-right-quoted] [fixture:
quadrant/db-grid-lf-y-axis-quoted] [fixture:
quadrant/db-grid-lf-y-axis-top-quoted] [fixture:
quadrant/gram-grid-cr-acc-descr] [fixture: quadrant/gram-grid-cr-acc-title]
[fixture: quadrant/gram-grid-cr-class-name] [fixture:
quadrant/gram-grid-cr-classdef-name] [fixture: quadrant/gram-grid-cr-point-bare]
[fixture: quadrant/gram-grid-cr-quadrant-bare] [fixture:
quadrant/gram-grid-cr-title] [fixture: quadrant/gram-grid-cr-x-axis-bare]
[fixture: quadrant/gram-grid-cr-x-axis-right-bare] [fixture:
quadrant/gram-grid-cr-y-axis-bare] [fixture:
quadrant/gram-grid-cr-y-axis-top-bare] [fixture:
quadrant/gram-grid-crlf-acc-descr] [fixture: quadrant/gram-grid-crlf-acc-title]
[fixture: quadrant/gram-grid-crlf-class-name] [fixture:
quadrant/gram-grid-crlf-classdef-name] [fixture:
quadrant/gram-grid-crlf-point-bare] [fixture:
quadrant/gram-grid-crlf-quadrant-bare] [fixture: quadrant/gram-grid-crlf-title]
[fixture: quadrant/gram-grid-crlf-x-axis-bare] [fixture:
quadrant/gram-grid-crlf-x-axis-right-bare] [fixture:
quadrant/gram-grid-crlf-y-axis-bare] [fixture:
quadrant/gram-grid-crlf-y-axis-top-bare] [fixture:
quadrant/gram-grid-lf-acc-descr] [fixture: quadrant/gram-grid-lf-acc-title]
[fixture: quadrant/gram-grid-lf-class-name] [fixture:
quadrant/gram-grid-lf-classdef-name] [fixture: quadrant/gram-grid-lf-point-bare]
[fixture: quadrant/gram-grid-lf-quadrant-bare] [fixture:
quadrant/gram-grid-lf-title] [fixture: quadrant/gram-grid-lf-x-axis-bare]
[fixture: quadrant/gram-grid-lf-x-axis-right-bare] [fixture:
quadrant/gram-grid-lf-y-axis-bare] [fixture:
quadrant/gram-grid-lf-y-axis-top-bare] [fixture:
quadrant/gram-x-axis-line-feed-before-arrow]

**Entities, HTML attribute quotes, and `style` lines.** An entity is read as its
placeholder (see [Entities](../common.md#entities)), which is made of characters
outside ASCII, so it is a character of every text, name, title, and
accessibility text, and of the name of a class of `classDef`, while the class
name of a point and a style take no placeholder: `#f00;` in a style is an
entity, so `A: [0.3, 0.6] color: #f00;` is rejected, while
`A: [0.3, 0.6] color: #f00 ;` has the colour `#f00`. The attribute quotes of an
HTML tag are read as `'` (see
[HTML attribute quotes](../common.md#html-attribute-quotes)). The `;` that the
line rule of `style` and `classDef` lines ignores (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)) is left
out of a text, a title, and an accessibility text. [fixture:
quadrant/db-grid-style-acc-descr] [fixture:
quadrant/db-grid-style-acc-descr-block] [fixture:
quadrant/db-grid-style-acc-title] [fixture: quadrant/db-grid-style-point-quoted]
[fixture: quadrant/db-grid-style-quadrant-quoted] [fixture:
quadrant/db-grid-style-title] [fixture: quadrant/db-grid-style-x-axis-quoted]
[fixture: quadrant/db-grid-style-x-axis-right-quoted] [fixture:
quadrant/db-grid-style-y-axis-quoted] [fixture:
quadrant/db-grid-style-y-axis-top-quoted] [fixture:
quadrant/gram-grid-style-class-name] [fixture:
quadrant/gram-grid-style-point-bare] [fixture:
quadrant/gram-grid-style-quadrant-bare] [fixture:
quadrant/gram-grid-style-x-axis-bare] [fixture:
quadrant/gram-grid-style-x-axis-right-bare] [fixture:
quadrant/gram-grid-style-y-axis-bare] [fixture:
quadrant/gram-grid-style-y-axis-top-bare] [fixture:
quadrant/db-grid-entity-acc-descr] [fixture:
quadrant/db-grid-entity-acc-descr-block] [fixture:
quadrant/db-grid-entity-acc-title] [fixture:
quadrant/db-grid-entity-classdef-name] [fixture:
quadrant/db-grid-entity-point-quoted] [fixture:
quadrant/db-grid-entity-quadrant-bare] [fixture:
quadrant/db-grid-entity-quadrant-quoted] [fixture:
quadrant/db-grid-entity-x-axis-quoted] [fixture:
quadrant/db-grid-entity-x-axis-right-bare] [fixture:
quadrant/db-grid-entity-x-axis-right-quoted] [fixture:
quadrant/db-grid-entity-y-axis-quoted] [fixture:
quadrant/db-grid-entity-y-axis-top-bare] [fixture:
quadrant/db-grid-entity-y-axis-top-quoted] [fixture:
quadrant/gram-grid-entity-class-name] [fixture: quadrant/db-title-entity]
[fixture: quadrant/db-x-axis-entity] [fixture: quadrant/db-y-axis-entity]
[fixture: quadrant/db-quadrant-entity] [fixture: quadrant/db-name-entity]
[fixture: quadrant/db-grid-hash-acc-descr] [fixture:
quadrant/db-grid-hash-acc-descr-block] [fixture:
quadrant/db-grid-hash-acc-title] [fixture: quadrant/db-grid-hash-classdef-name]
[fixture: quadrant/db-grid-hash-point-bare] [fixture:
quadrant/db-grid-hash-point-quoted] [fixture:
quadrant/db-grid-hash-quadrant-bare] [fixture:
quadrant/db-grid-hash-quadrant-quoted] [fixture: quadrant/db-grid-hash-title]
[fixture: quadrant/db-grid-hash-x-axis-bare] [fixture:
quadrant/db-grid-hash-x-axis-quoted] [fixture:
quadrant/db-grid-hash-x-axis-right-bare] [fixture:
quadrant/db-grid-hash-x-axis-right-quoted] [fixture:
quadrant/db-grid-hash-y-axis-bare] [fixture:
quadrant/db-grid-hash-y-axis-quoted] [fixture:
quadrant/db-grid-hash-y-axis-top-bare] [fixture:
quadrant/db-grid-hash-y-axis-top-quoted] [fixture:
quadrant/gram-grid-hash-class-name] [fixture:
quadrant/db-entity-hash-in-class-name] [fixture:
quadrant/db-entity-hash-word-semicolon] [fixture: quadrant/db-entity-html-named]
[fixture: quadrant/db-entity-html-numeric] [fixture:
quadrant/db-entity-numeric-quadrant-quoted-two] [fixture:
quadrant/db-entity-without-semicolon] [fixture:
quadrant/db-style-line-classdef-keyword-acc-title] [fixture:
quadrant/db-style-line-classdef-keyword-quadrant-quoted] [fixture:
quadrant/db-style-line-classdef-keyword-title] [fixture:
quadrant/db-style-line-hash-on-another-line-quoted] [fixture:
quadrant/db-style-line-ignored-in-point] [fixture:
quadrant/db-style-line-ignored-in-value] [fixture:
quadrant/db-style-line-keyword-on-another-line-quoted] [fixture:
quadrant/db-style-line-no-hash-acc-title] [fixture:
quadrant/db-style-line-no-hash-quadrant-quoted] [fixture:
quadrant/db-style-line-no-hash-title] [fixture:
quadrant/db-style-line-semicolon-on-another-line-quoted] [fixture:
quadrant/db-style-line-semicolon-statement-separator-in-title] [fixture:
quadrant/db-style-line-space-after-colon-acc-title] [fixture:
quadrant/db-style-line-space-after-colon-quadrant-quoted] [fixture:
quadrant/db-style-line-space-after-colon-title] [fixture:
quadrant/db-style-line-two-semicolons-acc-title] [fixture:
quadrant/db-style-line-two-semicolons-quadrant-quoted] [fixture:
quadrant/db-style-line-two-semicolons-title] [fixture:
quadrant/db-style-line-upper-case-acc-title] [fixture:
quadrant/db-style-line-upper-case-quadrant-quoted] [fixture:
quadrant/db-style-line-upper-case-title] [fixture:
quadrant/gram-style-line-ignored-between-axis-statements] [fixture:
quadrant/gram-style-line-ignored-between-statements] [fixture:
quadrant/gram-style-color-entity-semicolon] [fixture:
quadrant/db-style-color-space-semicolon] [fixture:
quadrant/db-classdef-color-space-semicolon]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string keeps the
reading of mermaid.js, while a directive inside any other unit makes the input
rejected. The **text units** are a `word`, a `title-text`, an `acc-title-text`,
an `acc-description-text`, a `description-block-text`, a `string`, a
`markdown-string`, and a `coordinate`; a `word` in the name of a class of
`classDef`, which is a name (see [Classes](#classes)), is no text unit. The
other units, the header, the keywords, the arrow, `:::`, a `class-name`, `-`,
`:`, `;`, and the brackets, are no text units.

- A directive inside a text, a name, a title, an accessibility text, a string, a
  coordinate, or a style joins the parts around it, as in mermaid.js:
  `quadrant-1 a%%{init: {}}%%b` has the text `ab`, and
  `A: [0.%%{init: {}}%%3, 0.6]` the coordinate `0.3`. A comment line or a
  directive line inside a value that runs over several lines is left out with
  its line. [fixture: quadrant/db-grid-directive-acc-descr] [fixture:
  quadrant/db-grid-directive-acc-descr-block] [fixture:
  quadrant/db-grid-directive-acc-title] [fixture:
  quadrant/db-grid-directive-point-bare] [fixture:
  quadrant/db-grid-directive-point-quoted] [fixture:
  quadrant/db-grid-directive-quadrant-bare] [fixture:
  quadrant/db-grid-directive-quadrant-quoted] [fixture:
  quadrant/db-grid-directive-title] [fixture:
  quadrant/db-grid-directive-x-axis-bare] [fixture:
  quadrant/db-grid-directive-x-axis-quoted] [fixture:
  quadrant/db-grid-directive-x-axis-right-bare] [fixture:
  quadrant/db-grid-directive-x-axis-right-quoted] [fixture:
  quadrant/db-grid-directive-y-axis-bare] [fixture:
  quadrant/db-grid-directive-y-axis-quoted] [fixture:
  quadrant/db-grid-directive-y-axis-top-bare] [fixture:
  quadrant/db-grid-directive-y-axis-top-quoted] [fixture:
  quadrant/db-comment-line-inside-acc-block] [fixture:
  quadrant/db-comment-line-inside-brackets] [fixture:
  quadrant/db-comment-line-inside-markdown] [fixture:
  quadrant/db-comment-line-inside-quoted-axis] [fixture:
  quadrant/db-comment-line-inside-quoted-name] [fixture:
  quadrant/db-comment-line-inside-quoted-text] [fixture:
  quadrant/db-directive-line-inside-brackets] [fixture:
  quadrant/db-directive-inside-quoted-multiline] [fixture:
  quadrant/db-directive-inside-acc-block-line] [fixture:
  quadrant/db-comment-inline-in-quoted-block]
- A directive between two units is allowed: on a line of its own, before or
  after a statement on its line, between a keyword and its text, between
  `accTitle` and its `:`, between the `:` and the `[` of a point, and between
  two statements of a `;`. [fixture: quadrant/db-directive-after-statement]
  [fixture: quadrant/db-directive-before-statement-same-line] [fixture:
  quadrant/db-directive-between-statements] [fixture:
  quadrant/db-directive-config-width] [fixture:
  quadrant/db-directive-glued-to-statement] [fixture:
  quadrant/db-directive-in-acc-block] [fixture:
  quadrant/db-directive-in-header-line] [fixture:
  quadrant/db-directive-in-point-brackets] [fixture:
  quadrant/db-directive-in-quotes] [fixture:
  quadrant/db-directive-in-style-value] [fixture: quadrant/db-directive-line]
  [fixture: quadrant/db-directive-line-empty] [fixture:
  quadrant/db-directive-line-spaces] [fixture: quadrant/db-directive-multiline]
  [fixture: quadrant/db-directive-two-in-text] [fixture:
  quadrant/db-directive-unclosed] [fixture:
  quadrant/db-directive-unclosed-last-line] [fixture:
  quadrant/db-directive-wrap-statement] [fixture:
  quadrant/db-comment-line-brace-closed-wrong] [fixture:
  quadrant/db-directive-between-acc-title-and-colon]
- A directive inside the header, a keyword, the arrow, `:::`, a `class-name`, or
  the name of a class of `classDef` makes the input rejected, while mermaid.js
  joins the parts: `quadrant%%{init: {}}%%Chart`, `tit%%{init: {}}%%le T`,
  `acc%%{init: {}}%%Title: A`, `x-%%{init: {}}%%axis L`,
  `L --%%{init: {}}%%> R`, `A::%%{init: {}}%%:c1: [0.3, 0.6]`,
  `A:::c%%{init: {}}%%1: [0.3, 0.6]`, and
  `classDef c%%{init: {}}%%1 color: #f00`. This is the known divergence
  [`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).
  [fixture: quadrant/div-acc-title-keyword-inside-directive] [fixture:
  quadrant/div-class-directive-inside] [fixture:
  quadrant/div-directive-in-class-name] [fixture:
  quadrant/div-directive-in-keyword-classdef] [fixture:
  quadrant/div-directive-in-keyword-title] [fixture:
  quadrant/div-grid-directive-class-name] [fixture:
  quadrant/div-grid-directive-classdef-name] [fixture:
  quadrant/div-quadrant-directive-in-keyword] [fixture:
  quadrant/div-x-axis-directive-in-arrow] [fixture:
  quadrant/div-x-axis-directive-in-keyword] [fixture:
  quadrant/div-y-axis-directive-in-arrow] [fixture:
  quadrant/div-y-axis-directive-in-keyword] [fixture:
  quadrant/div-directive-in-class-marker] [fixture:
  quadrant/div-directive-inside]
- A directive that is not closed runs to the end of the text, and its argument
  may start on the next line (see
  [Where a directive is](../common.md#where-a-directive-is)): `%%{init` at the
  end of a line takes the word at the start of the next line. [fixture:
  quadrant/gram-directive-word-unclosed-takes-keyword] [fixture:
  quadrant/gram-directive-colon-unclosed-takes-keyword] [fixture:
  quadrant/db-directive-argument-word-unclosed] [fixture:
  quadrant/db-directive-name-only-closed] [fixture:
  quadrant/db-directive-at-start-of-axis-text] [fixture:
  quadrant/db-directive-at-start-of-classdef-styles] [fixture:
  quadrant/db-directive-at-start-of-name] [fixture:
  quadrant/db-directive-at-start-of-quadrant-text] [fixture:
  quadrant/db-directive-at-start-of-title] [fixture:
  quadrant/db-directive-glued-before-axis-text] [fixture:
  quadrant/db-directive-glued-before-quadrant-text] [fixture:
  quadrant/db-directive-glued-before-title-text] [fixture:
  quadrant/db-directive-glued-after-classdef]

### The statement context

The rules of the statement context, in the order they are tried:

1. `%%` and the rest of its line: a comment (see [Comments](#comments)).
2. One or more line feeds: a `newline` unit.
3. A **keyword**, compared case-insensitively:
   - `title`, not followed by a word character (a letter, a digit, or `_`): a
     `title` unit, which enters the title context;
   - `accTitle` and `accDescr`, whitespace, line feeds included, and `:`: an
     `accTitle` or `accDescr` unit and a `:` unit, which enter the accessibility
     context of the keyword;
   - `accDescr`, whitespace, line feeds included, and `{`: an `accDescr` unit
     and a `{` unit, which enter the description block context;
   - `x-axis`, `y-axis`, and `quadrant-1` to `quadrant-4`, with the spaces
     (U+0020) before and after it, followed by anything: the unit named by the
     keyword;
   - two or more `-` and `>`, with the spaces before and after them: an `arrow`
     unit;
   - `classDef`, not followed by a word character: a `classDef` unit;
4. `"` followed by a backquote: enters the markdown string context, and `"`:
   enters the string context (see [Strings](#strings)).
5. `:::`: a `:::` unit, which enters the class name context.
6. Whitespace, line feeds included, then `:`, whitespace, line feeds included,
   and `[`: a `:` unit and a `[` unit, which enter the point context (see
   [The point context](#the-point-context)).
7. `quadrantChart`, with the spaces before and after it: the header.
8. A **word**: one or more letters of ASCII, one or more characters outside
   ASCII, one or more digits, or one of `!`, `$`, `%`, `&`, `'`, `*`, `+`, `,`,
   `.`, `/`, `=`, `?`, `\`, `_`, `#`, and the backquote: a `word` unit.
9. `-`, `:`, or `;`: a unit of that character.
10. One whitespace character other than a line feed: a `space` unit.

A keyword is tried before a word at every position where a unit starts, and a
word of letters reads all the letters that follow one another, so a keyword is
read at the start of a run of letters, also after a digit, `_`, `-`, or `.`
inside a text: `quadrant-1 a.title`, `quadrant-1 a-title`, `quadrant-1 a1title`,
`quadrant-1 a_title`, `quadrant-1 a.x-axis`, `A.title: [0.3, 0.6]`, and
`a.classDef: [0.3, 0.6]` hold a keyword and are rejected, while `Titles` and
`classDefs` are words, and in a title `title a.title` is text. `title` and
`classDef` followed by a word character are no keyword: `titleT`, `title1`,
`title_x`, `classDef1`, and `classDef_x` are words, which `title1: [0.3, 0.6]`
and `title_x: [0.3, 0.6]` take as names, while `title-x` is the title `-x`,
`titleé` the title `é`, and `classDef-x` and `classDefé` are `classDef` without
the whitespace after it. `x-axis`, `y-axis`, `quadrant-1` to `quadrant-4`, and
the header need nothing after them: `x-axisL`, `x-axis1`, `x-axis_x`, and
`x-axisé` are the x axis with a text, and `quadrant-11` is `quadrant-1` with the
text `1`, while `x-axis-x` and `quadrant-1-x` are a keyword and a text that
starts with a dash, which is rejected. A keyword in another case is a keyword:
`TITLE`, `Title`, `X-Axis`, `Quadrant-1`, `CLASSDEF`, `ACCTITLE:`, and
`ACCDESCR:` start statements. `accTitle` and `accDescr` without their `:` or `{`
are letters of a word, and a character between the keyword and the `:` other
than whitespace makes the input rejected: `accTitlex:`, `accTitle-x:`,
`accTitle1:`, and `accTitleé:`. [fixture:
quadrant/db-keyword-suffix-quadrant-digit] [fixture:
quadrant/db-keyword-suffix-quadrant-non-ascii] [fixture:
quadrant/db-keyword-suffix-quadrant-underscore] [fixture:
quadrant/db-keyword-suffix-title-dash] [fixture:
quadrant/db-keyword-suffix-title-non-ascii] [fixture:
quadrant/db-keyword-suffix-x-axis-digit] [fixture:
quadrant/db-keyword-suffix-x-axis-non-ascii] [fixture:
quadrant/db-keyword-suffix-x-axis-underscore] [fixture:
quadrant/db-keyword-suffix-y-axis-digit] [fixture:
quadrant/db-keyword-suffix-y-axis-non-ascii] [fixture:
quadrant/db-keyword-suffix-y-axis-underscore] [fixture:
quadrant/gram-keyword-suffix-acc-descr-dash] [fixture:
quadrant/gram-keyword-suffix-acc-descr-digit] [fixture:
quadrant/gram-keyword-suffix-acc-descr-non-ascii] [fixture:
quadrant/gram-keyword-suffix-acc-descr-underscore] [fixture:
quadrant/gram-keyword-suffix-acc-title-dash] [fixture:
quadrant/gram-keyword-suffix-acc-title-digit] [fixture:
quadrant/gram-keyword-suffix-acc-title-non-ascii] [fixture:
quadrant/gram-keyword-suffix-acc-title-underscore] [fixture:
quadrant/gram-keyword-suffix-classdef-dash] [fixture:
quadrant/gram-keyword-suffix-classdef-digit] [fixture:
quadrant/gram-keyword-suffix-classdef-non-ascii] [fixture:
quadrant/gram-keyword-suffix-classdef-underscore] [fixture:
quadrant/gram-keyword-suffix-quadrant-dash] [fixture:
quadrant/gram-keyword-suffix-title-digit] [fixture:
quadrant/gram-keyword-suffix-title-underscore] [fixture:
quadrant/gram-keyword-suffix-x-axis-dash] [fixture:
quadrant/gram-keyword-suffix-y-axis-dash] [fixture:
quadrant/db-keyword-after-dot-in-title] [fixture:
quadrant/gram-keyword-after-dash-in-name] [fixture:
quadrant/gram-keyword-after-dash-in-quadrant-text] [fixture:
quadrant/gram-keyword-after-digit-in-name] [fixture:
quadrant/gram-keyword-after-digit-in-quadrant-text] [fixture:
quadrant/gram-keyword-after-dot-in-name] [fixture:
quadrant/gram-keyword-after-dot-in-quadrant-text] [fixture:
quadrant/gram-keyword-after-underscore-in-name] [fixture:
quadrant/gram-keyword-after-underscore-in-quadrant-text] [fixture:
quadrant/gram-keyword-axis-after-dot-in-quadrant-text] [fixture:
quadrant/gram-keyword-classdef-after-dot-in-name] [fixture:
quadrant/db-acc-descr-upper-case] [fixture: quadrant/db-acc-title-upper-case]
[fixture: quadrant/db-class-upper-case] [fixture:
quadrant/db-classdef-upper-case] [fixture: quadrant/db-name-keyword-prefix]
[fixture: quadrant/db-quadrant-upper-case] [fixture:
quadrant/db-title-keyword-capitalized] [fixture:
quadrant/db-title-keyword-digit-word] [fixture:
quadrant/db-title-keyword-underscore-word] [fixture:
quadrant/db-title-keyword-upper-case] [fixture:
quadrant/db-title-prefix-of-name] [fixture: quadrant/db-x-axis-upper-case]
[fixture: quadrant/db-y-axis-upper-case] [fixture:
quadrant/gram-acc-descr-glued-word] [fixture:
quadrant/gram-acc-title-glued-word] [fixture: quadrant/gram-title-glued-word]

So a text without quotes is made of words, `-`, and whitespace. A `-` may not
start it, and a `:`, a `;`, a bracket, a parenthesis, a brace, `<`, `>`, `|`,
`@`, `^`, `~`, and the keywords are no part of it: `x-axis -L`, `x-axis L: M`,
`x-axis L[M]`, `quadrant-1 a(b)`, `quadrant-1 a|b`, `quadrant-1 a^b`,
`quadrant-1 A title B`, and `quadrant-1 A quadrant-2 B` are rejected, while
`quadrant-1 a % b` and `quadrant-1 a!$'?\/b` keep their characters. A `;` ends
the statement, and an arrow in a text of a quadrant or in a name is the arrow,
which the statement does not take: `quadrant-1 a-->b` is rejected. In quotes, in
a title, in an accessibility text, and in a description block, a keyword is
text. `__proto__`, `constructor`, and `hasOwnProperty` are words like any other.
[fixture: quadrant/db-grid-nonascii-acc-descr] [fixture:
quadrant/db-grid-nonascii-acc-descr-block] [fixture:
quadrant/db-grid-nonascii-acc-title] [fixture:
quadrant/db-grid-nonascii-point-quoted] [fixture:
quadrant/db-grid-nonascii-quadrant-bare] [fixture:
quadrant/db-grid-nonascii-quadrant-quoted] [fixture:
quadrant/db-grid-nonascii-x-axis-bare] [fixture:
quadrant/db-grid-nonascii-x-axis-quoted] [fixture:
quadrant/db-grid-nonascii-x-axis-right-bare] [fixture:
quadrant/db-grid-nonascii-x-axis-right-quoted] [fixture:
quadrant/db-grid-nonascii-y-axis-bare] [fixture:
quadrant/db-grid-nonascii-y-axis-quoted] [fixture:
quadrant/db-grid-nonascii-y-axis-top-bare] [fixture:
quadrant/db-grid-nonascii-y-axis-top-quoted] [fixture:
quadrant/db-grid-html-acc-descr] [fixture:
quadrant/db-grid-html-acc-descr-block] [fixture:
quadrant/db-grid-html-acc-title] [fixture: quadrant/db-grid-html-point-quoted]
[fixture: quadrant/db-grid-html-quadrant-quoted] [fixture:
quadrant/db-grid-html-title] [fixture: quadrant/db-grid-html-x-axis-quoted]
[fixture: quadrant/db-grid-html-x-axis-right-quoted] [fixture:
quadrant/db-grid-html-y-axis-quoted] [fixture:
quadrant/db-grid-html-y-axis-top-quoted] [fixture:
quadrant/gram-grid-html-class-name] [fixture:
quadrant/gram-grid-html-classdef-name] [fixture:
quadrant/gram-grid-html-point-bare] [fixture:
quadrant/gram-grid-html-quadrant-bare] [fixture:
quadrant/gram-grid-html-x-axis-bare] [fixture:
quadrant/gram-grid-html-x-axis-right-bare] [fixture:
quadrant/gram-grid-html-y-axis-bare] [fixture:
quadrant/gram-grid-html-y-axis-top-bare] [fixture:
quadrant/db-grid-punct-acc-descr] [fixture:
quadrant/db-grid-punct-acc-descr-block] [fixture:
quadrant/db-grid-punct-acc-title] [fixture: quadrant/db-grid-punct-point-quoted]
[fixture: quadrant/db-grid-punct-quadrant-quoted] [fixture:
quadrant/db-grid-punct-title] [fixture: quadrant/db-grid-punct-x-axis-quoted]
[fixture: quadrant/db-grid-punct-x-axis-right-quoted] [fixture:
quadrant/db-grid-punct-y-axis-quoted] [fixture:
quadrant/db-grid-punct-y-axis-top-quoted] [fixture:
quadrant/gram-grid-punct-class-name] [fixture:
quadrant/gram-grid-punct-classdef-name] [fixture:
quadrant/gram-grid-punct-point-bare] [fixture:
quadrant/gram-grid-punct-quadrant-bare] [fixture:
quadrant/gram-grid-punct-x-axis-bare] [fixture:
quadrant/gram-grid-punct-x-axis-right-bare] [fixture:
quadrant/gram-grid-punct-y-axis-bare] [fixture:
quadrant/gram-grid-punct-y-axis-top-bare] [fixture:
quadrant/db-grid-semicolon-acc-descr] [fixture:
quadrant/db-grid-semicolon-acc-descr-block] [fixture:
quadrant/db-grid-semicolon-acc-title] [fixture:
quadrant/db-grid-semicolon-point-quoted] [fixture:
quadrant/db-grid-semicolon-quadrant-quoted] [fixture:
quadrant/db-grid-semicolon-title] [fixture:
quadrant/db-grid-semicolon-x-axis-quoted] [fixture:
quadrant/db-grid-semicolon-x-axis-right-quoted] [fixture:
quadrant/db-grid-semicolon-y-axis-quoted] [fixture:
quadrant/db-grid-semicolon-y-axis-top-quoted] [fixture:
quadrant/gram-grid-semicolon-class-name] [fixture:
quadrant/gram-grid-semicolon-classdef-name] [fixture:
quadrant/gram-grid-semicolon-point-bare] [fixture:
quadrant/gram-grid-semicolon-quadrant-bare] [fixture:
quadrant/gram-grid-semicolon-x-axis-bare] [fixture:
quadrant/gram-grid-semicolon-x-axis-right-bare] [fixture:
quadrant/gram-grid-semicolon-y-axis-bare] [fixture:
quadrant/gram-grid-semicolon-y-axis-top-bare] [fixture:
quadrant/db-grid-colon-acc-descr] [fixture:
quadrant/db-grid-colon-acc-descr-block] [fixture:
quadrant/db-grid-colon-acc-title] [fixture:
quadrant/db-grid-colon-classdef-name] [fixture:
quadrant/db-grid-colon-point-quoted] [fixture:
quadrant/db-grid-colon-quadrant-quoted] [fixture: quadrant/db-grid-colon-title]
[fixture: quadrant/db-grid-colon-x-axis-quoted] [fixture:
quadrant/db-grid-colon-x-axis-right-quoted] [fixture:
quadrant/db-grid-colon-y-axis-quoted] [fixture:
quadrant/db-grid-colon-y-axis-top-quoted] [fixture:
quadrant/gram-grid-colon-class-name] [fixture:
quadrant/gram-grid-colon-point-bare] [fixture:
quadrant/gram-grid-colon-quadrant-bare] [fixture:
quadrant/gram-grid-colon-x-axis-bare] [fixture:
quadrant/gram-grid-colon-x-axis-right-bare] [fixture:
quadrant/gram-grid-colon-y-axis-bare] [fixture:
quadrant/gram-grid-colon-y-axis-top-bare] [fixture:
quadrant/db-grid-arrow-acc-descr] [fixture:
quadrant/db-grid-arrow-acc-descr-block] [fixture:
quadrant/db-grid-arrow-acc-title] [fixture: quadrant/db-grid-arrow-point-quoted]
[fixture: quadrant/db-grid-arrow-quadrant-quoted] [fixture:
quadrant/db-grid-arrow-title] [fixture: quadrant/db-grid-arrow-x-axis-bare]
[fixture: quadrant/db-grid-arrow-x-axis-quoted] [fixture:
quadrant/db-grid-arrow-x-axis-right-quoted] [fixture:
quadrant/db-grid-arrow-y-axis-bare] [fixture:
quadrant/db-grid-arrow-y-axis-quoted] [fixture:
quadrant/db-grid-arrow-y-axis-top-quoted] [fixture:
quadrant/gram-grid-arrow-class-name] [fixture:
quadrant/gram-grid-arrow-classdef-name] [fixture:
quadrant/gram-grid-arrow-point-bare] [fixture:
quadrant/gram-grid-arrow-quadrant-bare] [fixture:
quadrant/gram-grid-arrow-x-axis-right-bare] [fixture:
quadrant/gram-grid-arrow-y-axis-top-bare] [fixture:
quadrant/db-grid-quote-acc-descr] [fixture:
quadrant/db-grid-quote-acc-descr-block] [fixture:
quadrant/db-grid-quote-acc-title] [fixture: quadrant/db-grid-quote-title]
[fixture: quadrant/gram-grid-quote-class-name] [fixture:
quadrant/gram-grid-quote-classdef-name] [fixture:
quadrant/gram-grid-quote-point-bare] [fixture:
quadrant/gram-grid-quote-point-quoted] [fixture:
quadrant/gram-grid-quote-quadrant-bare] [fixture:
quadrant/gram-grid-quote-quadrant-quoted] [fixture:
quadrant/gram-grid-quote-x-axis-bare] [fixture:
quadrant/gram-grid-quote-x-axis-quoted] [fixture:
quadrant/gram-grid-quote-x-axis-right-bare] [fixture:
quadrant/gram-grid-quote-x-axis-right-quoted] [fixture:
quadrant/gram-grid-quote-y-axis-bare] [fixture:
quadrant/gram-grid-quote-y-axis-quoted] [fixture:
quadrant/gram-grid-quote-y-axis-top-bare] [fixture:
quadrant/gram-grid-quote-y-axis-top-quoted] [fixture:
quadrant/db-grid-backtick-acc-descr] [fixture:
quadrant/db-grid-backtick-acc-descr-block] [fixture:
quadrant/db-grid-backtick-acc-title] [fixture:
quadrant/db-grid-backtick-point-bare] [fixture:
quadrant/db-grid-backtick-point-quoted] [fixture:
quadrant/db-grid-backtick-quadrant-bare] [fixture:
quadrant/db-grid-backtick-quadrant-quoted] [fixture:
quadrant/db-grid-backtick-title] [fixture:
quadrant/db-grid-backtick-x-axis-bare] [fixture:
quadrant/db-grid-backtick-x-axis-quoted] [fixture:
quadrant/db-grid-backtick-x-axis-right-bare] [fixture:
quadrant/db-grid-backtick-x-axis-right-quoted] [fixture:
quadrant/db-grid-backtick-y-axis-bare] [fixture:
quadrant/db-grid-backtick-y-axis-quoted] [fixture:
quadrant/db-grid-backtick-y-axis-top-bare] [fixture:
quadrant/db-grid-backtick-y-axis-top-quoted] [fixture:
quadrant/gram-grid-backtick-class-name] [fixture:
quadrant/gram-grid-backtick-classdef-name] [fixture:
quadrant/db-grid-percent-acc-descr] [fixture:
quadrant/db-grid-percent-acc-descr-block] [fixture:
quadrant/db-grid-percent-acc-title] [fixture:
quadrant/db-grid-percent-point-bare] [fixture:
quadrant/db-grid-percent-point-quoted] [fixture:
quadrant/db-grid-percent-quadrant-bare] [fixture:
quadrant/db-grid-percent-quadrant-quoted] [fixture:
quadrant/db-grid-percent-title] [fixture: quadrant/db-grid-percent-x-axis-bare]
[fixture: quadrant/db-grid-percent-x-axis-quoted] [fixture:
quadrant/db-grid-percent-x-axis-right-bare] [fixture:
quadrant/db-grid-percent-x-axis-right-quoted] [fixture:
quadrant/db-grid-percent-y-axis-bare] [fixture:
quadrant/db-grid-percent-y-axis-quoted] [fixture:
quadrant/db-grid-percent-y-axis-top-bare] [fixture:
quadrant/db-grid-percent-y-axis-top-quoted] [fixture:
quadrant/gram-grid-percent-class-name] [fixture:
quadrant/gram-grid-percent-classdef-name] [fixture:
quadrant/db-grid-empty-x-axis-right-bare] [fixture:
quadrant/db-grid-empty-y-axis-top-bare] [fixture:
quadrant/gram-grid-empty-acc-descr] [fixture:
quadrant/gram-grid-empty-acc-title] [fixture:
quadrant/gram-grid-empty-classdef-name] [fixture:
quadrant/gram-grid-empty-point-bare] [fixture:
quadrant/gram-grid-empty-quadrant-bare] [fixture:
quadrant/gram-grid-empty-quadrant-quoted] [fixture:
quadrant/gram-grid-empty-x-axis-bare] [fixture:
quadrant/gram-grid-empty-y-axis-bare] [fixture:
quadrant/db-quadrant-single-percent] [fixture:
quadrant/db-quadrant-punctuation-run] [fixture:
quadrant/db-grid-constructor-acc-descr] [fixture:
quadrant/db-grid-constructor-acc-descr-block] [fixture:
quadrant/db-grid-constructor-acc-title] [fixture:
quadrant/db-grid-constructor-point-quoted] [fixture:
quadrant/db-grid-constructor-quadrant-bare] [fixture:
quadrant/db-grid-constructor-quadrant-quoted] [fixture:
quadrant/db-grid-constructor-title] [fixture:
quadrant/db-grid-constructor-x-axis-bare] [fixture:
quadrant/db-grid-constructor-x-axis-quoted] [fixture:
quadrant/db-grid-constructor-x-axis-right-bare] [fixture:
quadrant/db-grid-constructor-x-axis-right-quoted] [fixture:
quadrant/db-grid-constructor-y-axis-bare] [fixture:
quadrant/db-grid-constructor-y-axis-quoted] [fixture:
quadrant/db-grid-constructor-y-axis-top-bare] [fixture:
quadrant/db-grid-constructor-y-axis-top-quoted] [fixture:
quadrant/db-grid-keyword-acc-descr] [fixture:
quadrant/db-grid-keyword-acc-descr-block] [fixture:
quadrant/db-grid-keyword-acc-title] [fixture:
quadrant/db-grid-keyword-class-name] [fixture:
quadrant/db-grid-keyword-point-quoted] [fixture:
quadrant/db-grid-keyword-quadrant-quoted] [fixture:
quadrant/db-grid-keyword-title] [fixture:
quadrant/db-grid-keyword-x-axis-quoted] [fixture:
quadrant/db-grid-keyword-x-axis-right-quoted] [fixture:
quadrant/db-grid-keyword-y-axis-quoted] [fixture:
quadrant/db-grid-keyword-y-axis-top-quoted] [fixture:
quadrant/db-grid-proto-acc-descr] [fixture:
quadrant/db-grid-proto-acc-descr-block] [fixture:
quadrant/db-grid-proto-acc-title] [fixture: quadrant/db-grid-proto-point-quoted]
[fixture: quadrant/db-grid-proto-quadrant-bare] [fixture:
quadrant/db-grid-proto-quadrant-quoted] [fixture: quadrant/db-grid-proto-title]
[fixture: quadrant/db-grid-proto-x-axis-bare] [fixture:
quadrant/db-grid-proto-x-axis-quoted] [fixture:
quadrant/db-grid-proto-x-axis-right-bare] [fixture:
quadrant/db-grid-proto-x-axis-right-quoted] [fixture:
quadrant/db-grid-proto-y-axis-bare] [fixture:
quadrant/db-grid-proto-y-axis-quoted] [fixture:
quadrant/db-grid-proto-y-axis-top-bare] [fixture:
quadrant/db-grid-proto-y-axis-top-quoted] [fixture:
quadrant/gram-grid-keyword-quadrant-bare] [fixture:
quadrant/gram-grid-keyword-x-axis-bare] [fixture:
quadrant/gram-grid-keyword-x-axis-right-bare] [fixture:
quadrant/gram-grid-keyword-y-axis-bare] [fixture:
quadrant/gram-grid-keyword-y-axis-top-bare]

### The title context

`title` enters the title context, which reads the rest of the line as a
`title-text` unit and leaves; the unit is empty when the line ends after the
keyword. Every character up to the line feed is a character of the title: a `;`,
a `#`, `%%` and what follows it, quotes, a colon, keywords, and a text that
looks like a point. So `title T; quadrant-1 A` is the title `T; quadrant-1 A`,
and `title: [0.3, 0.6]` is a title. [fixture:
quadrant/db-title-keyword-trailing-space] [fixture: quadrant/db-title-twice]
[fixture: quadrant/db-title-indented] [fixture: quadrant/db-title-tab-indented]
[fixture: quadrant/db-title-tab-separator] [fixture:
quadrant/db-title-after-semicolon] [fixture: quadrant/db-title-frontmatter]
[fixture: quadrant/db-title-frontmatter-after-statement] [fixture:
quadrant/db-title-frontmatter-and-statement] [fixture:
quadrant/gram-title-in-name-middle] [fixture: quadrant/gram-title-lf-ends]
[fixture: quadrant/gram-title-after-axis-text] [fixture:
quadrant/db-title-spaces-trimmed] [fixture: quadrant/db-title-tab-trailing]
[fixture: quadrant/db-title-inner-spaces] [fixture: quadrant/db-title-colon]
[fixture: quadrant/db-title-quotes-kept] [fixture:
quadrant/db-title-semicolon-kept] [fixture:
quadrant/db-title-semicolon-then-statement] [fixture:
quadrant/db-acc-title-after-semicolon] [fixture: quadrant/db-title-hash-kept]
[fixture: quadrant/db-title-leading-dash] [fixture:
quadrant/db-title-leading-hash] [fixture: quadrant/db-title-leading-semicolon]
[fixture: quadrant/db-title-percent-kept] [fixture:
quadrant/db-title-comment-glued-kept] [fixture: quadrant/db-title-comment-kept]
[fixture: quadrant/db-title-comment-only] [fixture:
quadrant/db-title-directive-removed] [fixture: quadrant/db-title-dash] [fixture:
quadrant/db-title-non-ascii] [fixture: quadrant/db-title-html] [fixture:
quadrant/db-title-keyword-in-text] [fixture:
quadrant/db-title-with-colon-point-like] [fixture:
quadrant/db-title-digit-after-axis-semicolon] [fixture:
quadrant/db-title-digit-after-classdef] [fixture:
quadrant/db-title-digit-after-empty-block] [fixture:
quadrant/db-title-digit-after-point] [fixture:
quadrant/db-title-digit-after-quadrant] [fixture:
quadrant/db-title-digit-after-x-axis] [fixture:
quadrant/db-title-digit-after-x-axis-arrow] [fixture:
quadrant/db-title-digit-alone] [fixture: quadrant/db-title-digits-with-space]
[fixture: quadrant/db-title-takes-empty-block]

### Accessibility values

`accTitle` and `:` enter the accessibility title context, and `accDescr` and `:`
the accessibility description context. Each reads the whitespace after the `:`,
line feeds included, and then the rest of the line as an `acc-title-text` or an
`acc-description-text` unit, and leaves. So the text starts on the first line
after the keyword that has a character other than whitespace, and takes that
line whole, also when it is a statement: `accTitle:` followed by a line
`quadrant-1 A` has the text `quadrant-1 A`, which is then no statement. A
comment line and a directive line between them are no lines of the text.
Whitespace may precede the `:`, line feeds too, with comment lines and directive
lines between, and U+00A0, U+2028, U+2029, U+3000, and U+FEFF are whitespace
before and after the `:`. [fixture: quadrant/db-acc-title-nbsp-before-colon]
[fixture: quadrant/db-acc-title-ideographic-before-colon] [fixture:
quadrant/db-acc-title-bom-before-colon] [fixture:
quadrant/db-acc-title-ls-before-colon] [fixture:
quadrant/db-acc-title-ps-before-colon] [fixture:
quadrant/db-acc-descr-nbsp-before-colon] [fixture:
quadrant/db-acc-descr-ideographic-before-colon] [fixture:
quadrant/db-acc-descr-bom-before-colon] [fixture:
quadrant/db-acc-descr-ls-before-colon] [fixture:
quadrant/db-acc-descr-ps-before-colon] [fixture:
quadrant/db-acc-title-nbsp-after-colon] [fixture:
quadrant/db-acc-title-ideographic-after-colon] [fixture:
quadrant/db-acc-title-bom-after-colon] [fixture:
quadrant/db-acc-title-ls-after-colon] [fixture:
quadrant/db-acc-title-ps-after-colon] [fixture:
quadrant/db-acc-title-comment-line-before-colon] [fixture:
quadrant/db-acc-descr-comment-line-before-colon] [fixture:
quadrant/db-acc-title-directive-line-before-colon] When only whitespace follows
the `:` up to the end of the text, the input is rejected, also after an earlier
accessibility statement. The characters `:`, `;`, `#`, `%%`, quotes, and the
characters of the statement context are characters of the text. [fixture:
quadrant/db-acc-title-plain] [fixture: quadrant/db-acc-title-glued-colon]
[fixture: quadrant/db-acc-title-space-before-colon] [fixture:
quadrant/db-acc-title-tab-before-colon] [fixture:
quadrant/gram-acc-title-no-colon] [fixture: quadrant/db-acc-title-trimmed]
[fixture: quadrant/db-acc-title-indented] [fixture:
quadrant/db-acc-title-frontmatter-like-yaml] [fixture:
quadrant/db-acc-descr-plain] [fixture: quadrant/db-acc-descr-glued-colon]
[fixture: quadrant/db-acc-descr-space-before-colon] [fixture:
quadrant/gram-acc-descr-no-colon] [fixture: quadrant/db-acc-descr-trimmed]
[fixture: quadrant/db-acc-descr-frontmatter-like-yaml] [fixture:
quadrant/db-acc-both] [fixture: quadrant/db-acc-title-semicolon-kept] [fixture:
quadrant/db-acc-title-semicolon-only] [fixture:
quadrant/db-acc-title-semicolon-then-statement] [fixture:
quadrant/db-acc-title-hash-kept] [fixture: quadrant/db-acc-title-comment-kept]
[fixture: quadrant/db-acc-title-quotes-kept] [fixture:
quadrant/db-acc-title-colon-kept] [fixture:
quadrant/db-acc-title-directive-removed] [fixture:
quadrant/db-acc-descr-semicolon-kept] [fixture:
quadrant/db-acc-descr-semicolon-only] [fixture:
quadrant/db-acc-descr-comment-kept] [fixture: quadrant/db-acc-descr-hash-kept]
[fixture: quadrant/db-acc-descr-directive-removed] [fixture:
quadrant/gram-acc-title-empty] [fixture: quadrant/gram-acc-title-spaces-only]
[fixture: quadrant/gram-acc-title-twice-empty-last] [fixture:
quadrant/gram-acc-descr-empty] [fixture: quadrant/db-acc-title-next-line]
[fixture: quadrant/db-acc-title-next-line-after-blank-lines] [fixture:
quadrant/db-acc-title-next-line-crlf] [fixture:
quadrant/db-acc-title-next-line-indented] [fixture:
quadrant/db-acc-title-next-line-keyword] [fixture:
quadrant/db-acc-title-next-line-no-line-feed-at-end] [fixture:
quadrant/db-acc-descr-next-line] [fixture: quadrant/db-acc-descr-next-line-tab]
[fixture: quadrant/db-acc-title-comment-line-before-text] [fixture:
quadrant/db-acc-title-directive-line-before-text] [fixture:
quadrant/db-acc-title-statement-as-text] [fixture:
quadrant/db-acc-title-quadrant-as-text] [fixture:
quadrant/db-acc-descr-comment-line-before-text] [fixture:
quadrant/db-acc-descr-classdef-as-text] [fixture:
quadrant/db-acc-descr-title-text-keeps-title] [fixture:
quadrant/db-acc-title-line-feed-before-colon]

`accDescr`, whitespace, and `{` enter the description block context, which reads
the whitespace after the `{` and then every character up to the next `}` as a
`description-block-text` unit, reads the `}` as a `}` unit, and leaves; the
whitespace before the `}` is part of the text. When only whitespace lies between
the `{` and the `}`, there is no `description-block-text` unit. The text may
hold line feeds, `#`, `;`, quotes, keywords, and `%%`; a CRLF or a lone CR in it
is a line feed. Whitespace may precede the `{`, line feeds too, with comment
lines and directive lines between, U+00A0 and the other whitespace characters of
Notation included. [fixture: quadrant/db-acc-descr-nbsp-before-brace] [fixture:
quadrant/db-acc-descr-ideographic-before-brace] [fixture:
quadrant/db-acc-descr-bom-before-brace] [fixture:
quadrant/db-acc-descr-ls-before-brace] [fixture:
quadrant/db-acc-descr-ps-before-brace] [fixture:
quadrant/db-acc-descr-comment-line-before-brace] [fixture:
quadrant/db-acc-descr-directive-line-before-brace] A block without a `}` makes
the input rejected. [fixture: quadrant/db-acc-descr-block] [fixture:
quadrant/db-acc-descr-block-glued-brace] [fixture:
quadrant/db-acc-descr-block-lines] [fixture:
quadrant/db-acc-descr-block-indented-lines] [fixture:
quadrant/db-acc-descr-block-empty] [fixture:
quadrant/db-acc-descr-block-one-line] [fixture:
quadrant/db-acc-descr-block-blank-lines] [fixture:
quadrant/db-acc-descr-block-semicolon-kept] [fixture:
quadrant/db-acc-descr-block-hash-kept] [fixture:
quadrant/db-acc-descr-block-comment-kept] [fixture:
quadrant/db-acc-descr-block-directive-removed] [fixture:
quadrant/db-acc-descr-block-twice] [fixture: quadrant/db-acc-descr-block-crlf]
[fixture: quadrant/db-acc-descr-block-cr] [fixture:
quadrant/db-acc-descr-block-quotes-kept] [fixture:
quadrant/db-acc-descr-block-keyword-inside] [fixture:
quadrant/db-acc-descr-block-after-title] [fixture:
quadrant/db-acc-descr-block-brace-on-next-line] [fixture:
quadrant/db-acc-descr-block-tab-before-brace] [fixture:
quadrant/db-acc-descr-block-no-line-feed-after-brace] [fixture:
quadrant/db-acc-descr-block-empty-braces] [fixture:
quadrant/db-acc-descr-block-spaces-only] [fixture:
quadrant/db-acc-descr-block-only-blank-lines]

### Strings

`"` enters the string context, which reads all the characters up to the next `"`
as a `string` unit, whose text is what lies between the quotes, and leaves the
context at that `"`. The text may hold any character but `"`, line feeds
included: spaces at its ends, punctuation, keywords, an arrow, brackets, a
backquote, a `%%` after a space or glued to a word, and characters outside
ASCII. A string has no escape, and a string that is not closed makes the input
rejected. [fixture: quadrant/db-quoted-comment-glued-kept] [fixture:
quadrant/db-quoted-comment-mark-kept-axis] [fixture:
quadrant/db-quoted-comment-mark-kept-point] [fixture:
quadrant/db-quoted-comment-mark-kept-quadrant] [fixture:
quadrant/db-quoted-comment-mark-markdown] [fixture:
quadrant/db-quadrant-string-backtick-inside]

A quote followed by a backquote enters the markdown string context, which reads
the characters up to the next backquote as a `markdown-string` unit and leaves
at the backquote and the quote after it. The text holds no backquote and no
quote: ``quadrant-1 "`a"b`"`` is rejected. A markdown string that is not closed
makes the input rejected. [fixture: quadrant/db-name-markdown] [fixture:
quadrant/db-quadrant-markdown] [fixture: quadrant/db-quadrant-markdown-newline]
[fixture: quadrant/db-quadrant-markdown-then-bare] [fixture:
quadrant/db-quadrant-markdown-then-title] [fixture:
quadrant/db-x-axis-markdown-multiline] [fixture:
quadrant/db-x-axis-markdown-string] [fixture:
quadrant/db-y-axis-markdown-multiline] [fixture:
quadrant/db-y-axis-markdown-string] [fixture:
quadrant/gram-markdown-string-quote-inside] [fixture:
quadrant/gram-quadrant-markdown-unclosed] [fixture:
quadrant/gram-x-axis-markdown-unclosed] [fixture:
quadrant/gram-y-axis-markdown-unclosed]

An empty string, `""`, and an empty markdown string are a `string` unit and a
`markdown-string` unit with the empty text (see
[Empty strings](#empty-strings)).

### The class name context

`:::` enters the class name context, which reads one or more word characters of
ASCII (letters, digits, and `_`) as a `class-name` unit and leaves; the `:` of
the point follows it. Whitespace right after `:::`, an empty name, a dash, a
character outside ASCII, or a placeholder of an entity in the name, a second
`:::`, a class name with no `:` after it, and `:::` with no name before it make
the input rejected. [fixture: quadrant/db-class-constructor] [fixture:
quadrant/db-class-digits] [fixture: quadrant/db-class-has-own-property]
[fixture: quadrant/db-class-marker-in-bare-name] [fixture:
quadrant/db-class-marker-with-comment] [fixture:
quadrant/db-class-name-with-trailing-text] [fixture:
quadrant/db-class-on-quoted-name] [fixture: quadrant/db-class-plain] [fixture:
quadrant/db-class-proto] [fixture: quadrant/db-class-spaces-around] [fixture:
quadrant/db-class-undefined] [fixture: quadrant/db-class-underscore] [fixture:
quadrant/gram-class-after-colon-name] [fixture: quadrant/gram-class-dash]
[fixture: quadrant/gram-class-empty-name] [fixture:
quadrant/gram-class-in-name-position] [fixture: quadrant/gram-class-non-ascii]
[fixture: quadrant/gram-class-space-after-marker] [fixture:
quadrant/gram-class-two-markers] [fixture:
quadrant/gram-class-spaces-around-marker] [fixture:
quadrant/db-class-space-before-marker]

### The point context

A `:` and a `[` with whitespace around them enter the point context (rule 6 of
the statement context); the whitespace is any whitespace character of
[Notation](../common.md#notation), line feeds, U+00A0, U+2028, U+2029, U+3000,
and U+FEFF included, so `A`, U+00A0, and `: [0.3, 0.6]`, and `A:`, U+3000, and
`[0.3, 0.6]` are the point `A`. [fixture: quadrant/db-point-nbsp-before-colon]
[fixture: quadrant/db-point-ideographic-before-colon] [fixture:
quadrant/db-point-bom-before-colon] [fixture: quadrant/db-point-ls-before-colon]
[fixture: quadrant/db-point-ps-before-colon] [fixture:
quadrant/db-point-nbsp-after-colon] [fixture:
quadrant/db-point-ideographic-after-colon] [fixture:
quadrant/db-point-bom-after-colon] [fixture: quadrant/db-point-ls-after-colon]
[fixture: quadrant/db-point-ps-after-colon] [fixture:
quadrant/db-class-nbsp-before-colon] The whitespace before the `:` may hold line
feeds only when it starts with a whitespace character other than a line feed: a
line feed right after the name of a point or after its class name is a `newline`
unit, so `A`, a line feed, and `: [0.3, 0.6]` is rejected, while `A`, a space, a
line feed, and `: [0.3, 0.6]` is a point, and so is `A:`, a line feed, and
`[0.3, 0.6]`; after a class name, `A:::c`, a space, a line feed, and
`: [0.3, 0.6]` is a point, and without the space it is rejected. A tab before
the `:` is whitespace too, and comment lines, directive lines, and empty lines
may stand among the line feeds before it. [fixture:
quadrant/db-point-tab-and-line-feed-before-colon] [fixture:
quadrant/db-point-comment-line-before-colon] [fixture:
quadrant/db-point-directive-line-before-colon] [fixture:
quadrant/db-point-empty-line-before-colon] [fixture:
quadrant/db-class-comment-line-before-colon] [fixture:
quadrant/gram-point-newline-before-bracket-open] [fixture:
quadrant/db-point-space-and-line-feed-before-colon] [fixture:
quadrant/db-point-line-feed-after-colon] [fixture:
quadrant/gram-class-line-feed-before-colon] [fixture:
quadrant/db-class-space-and-line-feed-before-colon] [fixture:
quadrant/db-point-tab-before-colon] [fixture:
quadrant/db-point-newline-after-bracket] [fixture:
quadrant/db-point-newline-after-comma] [fixture:
quadrant/db-point-newline-before-bracket] [fixture:
quadrant/db-point-newline-before-comma]

In the point context, a **coordinate** is a `coordinate` unit: `1`, or `0`
optionally followed by one character other than a line feed, U+2028, and U+2029,
and one or more digits. So `0`, `1`, `0.3`, and `0.30` are coordinates, and so
are `0x5`, `0 3`, `0,3`, `0;3`, `0#3`, and `0` with a quote, a character outside
ASCII, U+00A0, U+3000, or U+FEFF before its digits, while `1.5`, `2`, `10`,
`00`, `01`, `.3`, `-0.3`, `+0.3`, `0.`, `0..5`, `0.6e1`, a word, and `0` with a
line feed, a U+2028, or a U+2029 before its digits are rejected. [fixture:
quadrant/db-point-coordinate-nbsp] [fixture:
quadrant/db-point-coordinate-ideographic] [fixture:
quadrant/db-point-coordinate-bom] [fixture:
quadrant/gram-point-coordinate-line-separator] [fixture:
quadrant/gram-point-coordinate-ps] The `,` after the first coordinate, with
whitespace of any kind around it, is a `,` unit, and `]` with the spaces after
it is a `]` unit, which leaves the context; whitespace of any kind after the `[`
and before the `]` is allowed. [fixture: quadrant/db-point-nbsp-after-bracket]
[fixture: quadrant/db-point-ideographic-after-bracket] [fixture:
quadrant/db-point-bom-after-bracket] [fixture:
quadrant/db-point-ls-after-bracket] [fixture:
quadrant/db-point-ps-after-bracket] [fixture:
quadrant/db-point-nbsp-before-comma] [fixture:
quadrant/db-point-ideographic-before-comma] [fixture:
quadrant/db-point-bom-before-comma] [fixture: quadrant/db-point-ls-before-comma]
[fixture: quadrant/db-point-ps-before-comma] [fixture:
quadrant/db-point-nbsp-inside-brackets] [fixture:
quadrant/db-point-ideographic-after-comma] [fixture:
quadrant/db-point-bom-after-comma] [fixture: quadrant/db-point-ls-after-comma]
[fixture: quadrant/db-point-ps-after-comma] [fixture:
quadrant/db-point-nbsp-before-close] [fixture:
quadrant/db-point-ideographic-before-close] [fixture:
quadrant/db-point-bom-before-close] [fixture: quadrant/db-point-ls-before-close]
[fixture: quadrant/db-point-ps-before-close] Since the character after `0` may
be a comma, `A:[0,1]` has the coordinate `0,1` and no second one, and is
rejected, while `A: [0, 1]` is a point. A `%%` inside the brackets is no comment
and makes the input rejected. [fixture: quadrant/db-point-plain] [fixture:
quadrant/db-point-glued] [fixture: quadrant/db-point-spaces-everywhere]
[fixture: quadrant/db-point-tab-around-colon] [fixture:
quadrant/db-point-tab-inside-brackets] [fixture:
quadrant/db-point-nbsp-inside-brackets] [fixture: quadrant/db-point-crlf-inside]
[fixture: quadrant/db-point-both-one] [fixture: quadrant/db-point-both-zero]
[fixture: quadrant/db-point-zero-decimals] [fixture:
quadrant/db-point-trailing-zero] [fixture: quadrant/db-point-long-fraction]
[fixture: quadrant/db-point-one-zero] [fixture: quadrant/gram-point-x-over-one]
[fixture: quadrant/gram-point-x-ten] [fixture: quadrant/gram-point-x-two]
[fixture: quadrant/gram-point-y-over-one] [fixture:
quadrant/gram-point-no-leading-zero] [fixture: quadrant/gram-point-double-zero]
[fixture: quadrant/gram-point-leading-zero] [fixture:
quadrant/gram-point-negative] [fixture: quadrant/gram-point-plus] [fixture:
quadrant/gram-point-trailing-dot] [fixture: quadrant/gram-point-exponent]
[fixture: quadrant/gram-point-one-coordinate] [fixture:
quadrant/gram-point-three-coordinates] [fixture: quadrant/gram-point-no-comma]
[fixture: quadrant/gram-point-semicolon-comma] [fixture:
quadrant/gram-point-word-coordinate] [fixture: quadrant/gram-point-word-second]
[fixture: quadrant/gram-point-empty-brackets] [fixture:
quadrant/gram-point-open-bracket-only] [fixture: quadrant/gram-point-unclosed]
[fixture: quadrant/gram-point-double-close] [fixture:
quadrant/gram-point-no-brackets] [fixture: quadrant/gram-point-no-colon]
[fixture: quadrant/gram-point-parens] [fixture:
quadrant/db-point-coordinate-any-char-x] [fixture:
quadrant/db-point-coordinate-any-char-x2] [fixture:
quadrant/db-point-coordinate-any-char-y] [fixture:
quadrant/db-point-coordinate-comma] [fixture: quadrant/db-point-coordinate-hash]
[fixture: quadrant/db-point-coordinate-nonascii] [fixture:
quadrant/db-point-coordinate-quote] [fixture:
quadrant/db-point-coordinate-semicolon] [fixture:
quadrant/db-point-coordinate-space-in-x] [fixture:
quadrant/db-point-coordinate-tab-in-x] [fixture:
quadrant/gram-point-coordinate-line-feed] [fixture:
quadrant/db-point-zero-and-one] [fixture:
quadrant/gram-point-coordinate-comma-without-space] [fixture:
quadrant/gram-point-coordinate-line-separator] [fixture:
quadrant/gram-point-coordinate-two-dots]

After the `]`, the spaces are part of it; U+00A0, U+2028, U+2029, U+3000, and
U+FEFF are characters of a word there, which no style takes, so the input is
rejected, [fixture: quadrant/gram-ends-point-nbsp-end] [fixture:
quadrant/gram-ends-point-ideographic-end] [fixture:
quadrant/gram-ends-point-bom-end] [fixture: quadrant/gram-point-ls-after-close]
[fixture: quadrant/gram-point-ps-after-close] and any other whitespace character
is a `space` unit, which starts the styles: a tab after the `]` is a style
without a name (see
[Rejections outside the grammar](#rejections-outside-the-grammar)), and a word
after it is a style, so `A: [0.3, 0.6] x` and a second point on the line are
rejected. A second `]` is rejected. [fixture: quadrant/db-point-trailing-space]
[fixture: quadrant/db-point-semicolon] [fixture:
quadrant/db-point-semicolon-spaced-next] [fixture:
quadrant/db-point-semicolon-twice] [fixture: quadrant/db-point-semicolon-gap]
[fixture: quadrant/gram-point-two-on-line] [fixture:
quadrant/db-point-comment-after-space] [fixture:
quadrant/db-point-comment-glued] [fixture: quadrant/gram-point-comment-inside]
[fixture: quadrant/db-point-directive-inside] [fixture:
quadrant/db-point-directive-after-colon] [fixture:
quadrant/db-point-directive-in-name] [fixture: quadrant/db-point-crlf-between]
[fixture: quadrant/db-point-cr-between] [fixture:
quadrant/db-style-glued-to-bracket]

### Comments

A comment starts at `%%` where a unit starts in the statement context and runs
to the end of its line, the line feed left out; it belongs to no unit. A comment
line, a comment after a statement, after a space or glued to it, a comment after
the header, and a comment at the end of the text change nothing. A comment takes
nothing before it: `quadrant-1 ab%% c` has the text `ab`, and
`x-axis L --> R%% c` the texts `L` and `R`. A `%%` inside a title, an
accessibility text, a description block, or a string is a character of it, and
inside the brackets of a point it makes the input rejected. A line `%%` alone,
and `%%{` where no directive starts, such as a line `%%{ }%%`, are comments.
[fixture: quadrant/db-comment-line] [fixture: quadrant/db-comment-line-last]
[fixture: quadrant/db-comment-line-no-line-feed] [fixture:
quadrant/db-comment-line-indented] [fixture:
quadrant/db-comment-line-tab-indented] [fixture:
quadrant/db-comment-line-semicolon] [fixture: quadrant/db-comment-line-keyword]
[fixture: quadrant/db-comment-line-hash] [fixture:
quadrant/db-comment-line-triple] [fixture:
quadrant/gram-comment-line-single-percent] [fixture:
quadrant/gram-comment-line-brace] [fixture:
quadrant/gram-comment-line-after-brace] [fixture: quadrant/db-comment-crlf]
[fixture: quadrant/db-comment-cr] [fixture: quadrant/db-comment-ls] [fixture:
quadrant/db-comment-two-lines] [fixture:
quadrant/db-comment-between-point-lines] [fixture:
quadrant/db-grid-comment-acc-descr] [fixture:
quadrant/db-grid-comment-acc-descr-block] [fixture:
quadrant/db-grid-comment-acc-title] [fixture:
quadrant/db-grid-comment-glued-acc-descr] [fixture:
quadrant/db-grid-comment-glued-acc-descr-block] [fixture:
quadrant/db-grid-comment-glued-acc-title] [fixture:
quadrant/db-grid-comment-glued-point-quoted] [fixture:
quadrant/db-grid-comment-glued-quadrant-quoted] [fixture:
quadrant/db-grid-comment-glued-title] [fixture:
quadrant/db-grid-comment-glued-x-axis-quoted] [fixture:
quadrant/db-grid-comment-glued-x-axis-right-quoted] [fixture:
quadrant/db-grid-comment-glued-y-axis-quoted] [fixture:
quadrant/db-grid-comment-glued-y-axis-top-quoted] [fixture:
quadrant/db-grid-comment-point-quoted] [fixture:
quadrant/db-grid-comment-quadrant-bare] [fixture:
quadrant/db-grid-comment-quadrant-quoted] [fixture:
quadrant/db-grid-comment-title] [fixture: quadrant/db-grid-comment-x-axis-bare]
[fixture: quadrant/db-grid-comment-x-axis-quoted] [fixture:
quadrant/db-grid-comment-x-axis-right-bare] [fixture:
quadrant/db-grid-comment-x-axis-right-quoted] [fixture:
quadrant/db-grid-comment-y-axis-bare] [fixture:
quadrant/db-grid-comment-y-axis-quoted] [fixture:
quadrant/db-grid-comment-y-axis-top-bare] [fixture:
quadrant/db-grid-comment-y-axis-top-quoted] [fixture:
quadrant/gram-grid-comment-class-name] [fixture:
quadrant/gram-grid-comment-classdef-name] [fixture:
quadrant/gram-grid-comment-glued-class-name] [fixture:
quadrant/gram-grid-comment-glued-classdef-name] [fixture:
quadrant/gram-grid-comment-point-bare] [fixture:
quadrant/db-bare-percent-line-after-point] [fixture:
quadrant/db-comment-glued-after-semicolon] [fixture:
quadrant/db-empty-braces-line-between-statements]

mermaid.js reads a comment that is glued to a unit of one character together
with that character, the lexer reading a run of letters, a run of digits, a run
of characters outside ASCII, or any other character alone. So `x-axis L%% c`,
`quadrant-1 a%%b`, and `A: [0.3, 0.6] radius: 1%% c` are rejected there, since
the statement loses its text or the style its value; `A%% c` and
`a%%b: [0.3, 0.6]` are accepted there as lines of nothing, while here they are a
name without a point and are rejected; and `x-axis L --> R%% c` has the left
text with the arrow and no right text there, `quadrant-1 ab,%% c` the text `ab`,
and `quadrant-1 a b%% c` the text `a`. A whitespace character is a unit of one
character too, where the grammar counts it: `accDescr {x}`, a space or a tab,
and `%% c`, the same after an empty block or a directive glued to the `}`, and
`A: [0.3, 0.6]`, a tab, and `%% c`, are accepted there, while here the
whitespace stays and is rejected (see
[Titles and accessibility statements](#titles-and-accessibility-statements) and
[The point context](#the-point-context)); with two whitespace characters both
reject them. A comment after `;`, after the `]` of a point, after a run of two
characters or more, and after the `}` of a block takes nothing that changes the
reading in both. This is the known divergence
[`comment-takes-character`](../known-divergences/comment-takes-character.md).
[fixture: quadrant/div-after-x-axis-glued-comment] [fixture:
quadrant/div-after-y-axis-glued-comment] [fixture:
quadrant/div-comment-unit-letter-then-non-ascii] [fixture:
quadrant/div-comment-unit-letters-then-digit] [fixture:
quadrant/div-comment-unit-non-ascii-single] [fixture:
quadrant/div-comment-unit-punctuation] [fixture:
quadrant/div-comment-unit-word-after-space] [fixture:
quadrant/div-grid-comment-glued-point-bare] [fixture:
quadrant/div-grid-comment-glued-x-axis-right-bare] [fixture:
quadrant/div-grid-comment-glued-y-axis-top-bare] [fixture:
quadrant/div-name-comment-glued] [fixture:
quadrant/div-x-axis-comment-glued-arrow] [fixture:
quadrant/div-x-axis-comment-unit-dash] [fixture:
quadrant/div-x-axis-comment-unit-right-digit] [fixture:
quadrant/div-y-axis-comment-glued-arrow] [fixture:
quadrant/div-y-axis-comment-unit-dash] [fixture:
quadrant/div-y-axis-comment-unit-top-digit] [fixture:
quadrant/div-acc-descr-block-space-and-comment-after-brace] [fixture:
quadrant/div-acc-descr-block-tab-and-comment-after-brace] [fixture:
quadrant/div-comment-glued-digit-in-quadrant-text] [fixture:
quadrant/div-comment-glued-hash-in-quadrant-text] [fixture:
quadrant/div-comment-glued-one-letter-name] [fixture:
quadrant/div-comment-glued-tab-after-point] [fixture:
quadrant/div-acc-descr-block-empty-block-space-and-comment] [fixture:
quadrant/div-acc-descr-block-directive-space-and-comment] [fixture:
quadrant/div-after-point-style-glued-comment] [fixture:
quadrant/div-after-quadrant-glued-comment] [fixture:
quadrant/div-classdef-comment-unit-single-digit] [fixture:
quadrant/div-grid-comment-glued-quadrant-bare] [fixture:
quadrant/div-grid-comment-glued-x-axis-bare] [fixture:
quadrant/div-grid-comment-glued-y-axis-bare] [fixture:
quadrant/div-quadrant-comment-glued] [fixture:
quadrant/div-style-radius-comment-glued-one-digit] [fixture:
quadrant/div-x-axis-comment-glued-text] [fixture:
quadrant/div-y-axis-comment-glued-text] [fixture:
quadrant/db-comment-unit-non-ascii-run] [fixture:
quadrant/db-comment-unit-two-digits]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `word`, stands for one unit with
that name, and text in double quotes stands for the unit named by that text,
such as `"title"` or `","`. The grammar is a restatement of the grammar in
[`quadrant.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/quadrant-chart/parser/quadrant.jison#L83-L189)
and accepts the same sequences of units, but for the known divergences.

Each rule below makes a node of the tree, defined in
[ast/quadrant.md](../ast/quadrant.md):

| Rule                                                     | Node                           |
| -------------------------------------------------------- | ------------------------------ |
| `diagram`                                                | QuadrantDiagram                |
| `title-statement`                                        | QuadrantTitleStatement         |
| `acc-title-statement`                                    | QuadrantAccTitleStatement      |
| `acc-description-statement`                              | QuadrantAccDescrStatement      |
| `description-block-statement`, `empty-description-block` | QuadrantAccDescrBlockStatement |
| `axis-statement`                                         | QuadrantAxisStatement          |
| `quadrant-statement`                                     | QuadrantQuadrantStatement      |
| `point-statement`                                        | QuadrantPointStatement         |
| `class-def-statement`                                    | QuadrantClassDefStatement      |
| `text`                                                   | QuadrantLabel                  |
| `title-text`, `acc-title-text`, `acc-description-text`   | QuadrantLiteral                |
| `description-block-text`, `coordinate`, `style`          | QuadrantLiteral                |
| `class-name`                                             | Identifier                     |
| `class-def-name`                                         | QuadrantIdentifier             |

### Diagram and statements

```text
diagram   = header line ( eol line )*
line      = blanks ( statement blanks
                   | description-block-statement empty-description-block* )?
blanks    = ( space | empty-description-block )*
eol       = newline | ";" | end-of-text
statement = title-statement | acc-title-statement | acc-description-statement
          | axis-statement | quadrant-statement | point-statement
          | class-def-statement
```

The diagram is the header and then the lines, separated by line breaks and `;`;
the first line starts right after the header. A line has one statement or none,
with whitespace and empty description blocks before and after it (see
[Empty description blocks](#empty-description-blocks)); after a description
block with text, only empty description blocks may come, with no whitespace. So
two statements on one line are rejected unless a `;` separates them: `x-axis L`
followed by `quadrant-1 A` on the same line, a point followed by a second point,
and a word after a point, which is read as a style, are rejected. Empty lines,
lines of spaces and tabs, and empty statements between two `;` change nothing.
The examples of the documentation of mermaid.js are accepted. [fixture:
quadrant/db-after-acc-descr-cr] [fixture: quadrant/db-after-acc-descr-crlf]
[fixture: quadrant/db-after-acc-descr-directive] [fixture:
quadrant/db-after-acc-descr-directive-glued] [fixture:
quadrant/db-after-acc-descr-glued-comment] [fixture:
quadrant/db-after-acc-descr-semicolon] [fixture:
quadrant/db-after-acc-descr-semicolon-comment] [fixture:
quadrant/db-after-acc-descr-space-comment] [fixture:
quadrant/db-after-acc-descr-trailing-spaces] [fixture:
quadrant/db-after-acc-descr-trailing-tab] [fixture:
quadrant/db-after-acc-title-cr] [fixture: quadrant/db-after-acc-title-crlf]
[fixture: quadrant/db-after-acc-title-directive] [fixture:
quadrant/db-after-acc-title-directive-glued] [fixture:
quadrant/db-after-acc-title-glued-comment] [fixture:
quadrant/db-after-acc-title-semicolon] [fixture:
quadrant/db-after-acc-title-semicolon-comment] [fixture:
quadrant/db-after-acc-title-space-comment] [fixture:
quadrant/db-after-acc-title-trailing-spaces] [fixture:
quadrant/db-after-acc-title-trailing-tab] [fixture:
quadrant/db-after-classdef-cr] [fixture: quadrant/db-after-classdef-crlf]
[fixture: quadrant/db-after-classdef-directive] [fixture:
quadrant/db-after-classdef-directive-glued] [fixture:
quadrant/db-after-classdef-glued-comment] [fixture:
quadrant/db-after-classdef-space-comment] [fixture:
quadrant/db-after-classdef-trailing-spaces] [fixture:
quadrant/db-after-classdef-trailing-tab] [fixture:
quadrant/db-after-point-class-cr] [fixture: quadrant/db-after-point-class-crlf]
[fixture: quadrant/db-after-point-class-directive] [fixture:
quadrant/db-after-point-class-directive-glued] [fixture:
quadrant/db-after-point-class-glued-comment] [fixture:
quadrant/db-after-point-class-semicolon] [fixture:
quadrant/db-after-point-class-semicolon-comment] [fixture:
quadrant/db-after-point-class-space-comment] [fixture:
quadrant/db-after-point-class-trailing-spaces] [fixture:
quadrant/db-after-point-cr] [fixture: quadrant/db-after-point-crlf] [fixture:
quadrant/db-after-point-directive] [fixture:
quadrant/db-after-point-directive-glued] [fixture:
quadrant/db-after-point-glued-comment] [fixture:
quadrant/db-after-point-semicolon] [fixture:
quadrant/db-after-point-semicolon-comment] [fixture:
quadrant/db-after-point-space-comment] [fixture:
quadrant/db-after-point-style-cr] [fixture: quadrant/db-after-point-style-crlf]
[fixture: quadrant/db-after-point-style-directive] [fixture:
quadrant/db-after-point-style-directive-glued] [fixture:
quadrant/db-after-point-style-semicolon] [fixture:
quadrant/db-after-point-style-semicolon-comment] [fixture:
quadrant/db-after-point-style-space-comment] [fixture:
quadrant/db-after-point-style-trailing-spaces] [fixture:
quadrant/db-after-point-style-trailing-tab] [fixture:
quadrant/db-after-point-trailing-spaces] [fixture:
quadrant/db-after-quadrant-cr] [fixture: quadrant/db-after-quadrant-crlf]
[fixture: quadrant/db-after-quadrant-directive] [fixture:
quadrant/db-after-quadrant-directive-glued] [fixture:
quadrant/db-after-quadrant-semicolon] [fixture:
quadrant/db-after-quadrant-semicolon-comment] [fixture:
quadrant/db-after-quadrant-space-comment] [fixture:
quadrant/db-after-quadrant-trailing-spaces] [fixture:
quadrant/db-after-quadrant-trailing-tab] [fixture: quadrant/db-after-title-cr]
[fixture: quadrant/db-after-title-crlf] [fixture:
quadrant/db-after-title-directive] [fixture:
quadrant/db-after-title-directive-glued] [fixture:
quadrant/db-after-title-glued-comment] [fixture:
quadrant/db-after-title-semicolon] [fixture:
quadrant/db-after-title-semicolon-comment] [fixture:
quadrant/db-after-title-space-comment] [fixture:
quadrant/db-after-title-trailing-spaces] [fixture:
quadrant/db-after-title-trailing-tab] [fixture: quadrant/db-after-x-axis-cr]
[fixture: quadrant/db-after-x-axis-crlf] [fixture:
quadrant/db-after-x-axis-directive] [fixture:
quadrant/db-after-x-axis-directive-glued] [fixture:
quadrant/db-after-x-axis-semicolon] [fixture:
quadrant/db-after-x-axis-semicolon-comment] [fixture:
quadrant/db-after-x-axis-space-comment] [fixture:
quadrant/db-after-x-axis-trailing-spaces] [fixture:
quadrant/db-after-x-axis-trailing-tab] [fixture: quadrant/db-after-y-axis-cr]
[fixture: quadrant/db-after-y-axis-crlf] [fixture:
quadrant/db-after-y-axis-directive] [fixture:
quadrant/db-after-y-axis-directive-glued] [fixture:
quadrant/db-after-y-axis-semicolon] [fixture:
quadrant/db-after-y-axis-semicolon-comment] [fixture:
quadrant/db-after-y-axis-space-comment] [fixture:
quadrant/db-after-y-axis-trailing-spaces] [fixture:
quadrant/db-after-y-axis-trailing-tab] [fixture:
quadrant/gram-after-classdef-semicolon] [fixture:
quadrant/gram-after-classdef-semicolon-comment] [fixture:
quadrant/db-after-acc-descr-space-semicolon] [fixture:
quadrant/db-after-acc-title-space-semicolon] [fixture:
quadrant/db-after-classdef-space-semicolon] [fixture:
quadrant/db-after-point-class-space-semicolon] [fixture:
quadrant/db-after-point-space-semicolon] [fixture:
quadrant/db-after-point-style-space-semicolon] [fixture:
quadrant/db-after-quadrant-space-semicolon] [fixture:
quadrant/db-after-title-space-semicolon] [fixture:
quadrant/db-after-x-axis-space-semicolon] [fixture:
quadrant/db-after-y-axis-space-semicolon] [fixture:
quadrant/db-after-acc-descr-double-semicolon] [fixture:
quadrant/db-after-acc-title-double-semicolon] [fixture:
quadrant/db-after-point-class-double-semicolon] [fixture:
quadrant/db-after-point-double-semicolon] [fixture:
quadrant/db-after-point-style-double-semicolon] [fixture:
quadrant/db-after-quadrant-double-semicolon] [fixture:
quadrant/db-after-title-double-semicolon] [fixture:
quadrant/db-after-x-axis-double-semicolon] [fixture:
quadrant/db-after-y-axis-double-semicolon] [fixture:
quadrant/gram-after-classdef-double-semicolon] [fixture:
quadrant/db-after-acc-descr-spaced-semicolons] [fixture:
quadrant/db-after-acc-title-spaced-semicolons] [fixture:
quadrant/db-after-classdef-spaced-semicolons] [fixture:
quadrant/db-after-point-class-spaced-semicolons] [fixture:
quadrant/db-after-point-spaced-semicolons] [fixture:
quadrant/db-after-point-style-spaced-semicolons] [fixture:
quadrant/db-after-quadrant-spaced-semicolons] [fixture:
quadrant/db-after-title-spaced-semicolons] [fixture:
quadrant/db-after-x-axis-spaced-semicolons] [fixture:
quadrant/db-after-y-axis-spaced-semicolons] [fixture:
quadrant/db-after-acc-descr-directive-unclosed] [fixture:
quadrant/db-after-acc-title-directive-unclosed] [fixture:
quadrant/db-after-classdef-directive-unclosed] [fixture:
quadrant/db-after-point-class-directive-unclosed] [fixture:
quadrant/db-after-point-directive-unclosed] [fixture:
quadrant/db-after-point-style-directive-unclosed] [fixture:
quadrant/db-after-quadrant-directive-unclosed] [fixture:
quadrant/db-after-title-directive-unclosed] [fixture:
quadrant/db-after-x-axis-directive-unclosed] [fixture:
quadrant/db-after-y-axis-directive-unclosed] [fixture:
quadrant/db-after-acc-descr-directive-closed-twice] [fixture:
quadrant/db-after-acc-title-directive-closed-twice] [fixture:
quadrant/db-after-classdef-directive-closed-twice] [fixture:
quadrant/db-after-point-class-directive-closed-twice] [fixture:
quadrant/db-after-point-directive-closed-twice] [fixture:
quadrant/db-after-point-style-directive-closed-twice] [fixture:
quadrant/db-after-quadrant-directive-closed-twice] [fixture:
quadrant/db-after-title-directive-closed-twice] [fixture:
quadrant/db-after-x-axis-directive-closed-twice] [fixture:
quadrant/db-after-y-axis-directive-closed-twice] [fixture:
quadrant/db-after-acc-descr-directive-word-unclosed] [fixture:
quadrant/db-after-acc-title-directive-word-unclosed] [fixture:
quadrant/db-after-quadrant-directive-word-unclosed] [fixture:
quadrant/db-after-title-directive-word-unclosed] [fixture:
quadrant/db-after-x-axis-directive-word-unclosed] [fixture:
quadrant/db-after-y-axis-directive-word-unclosed] [fixture:
quadrant/db-title-three-times] [fixture: quadrant/db-quadrant-three-times]
[fixture: quadrant/db-quadrant-three-times-with-partner] [fixture:
quadrant/db-x-axis-three-times-arrow-forms] [fixture:
quadrant/db-x-axis-three-times-then-both] [fixture:
quadrant/db-y-axis-three-times-arrow-forms] [fixture:
quadrant/db-classdef-three-times] [fixture:
quadrant/db-classdef-three-times-partner] [fixture:
quadrant/db-frontmatter-crlf] [fixture:
quadrant/db-frontmatter-indented-delimiters] [fixture:
quadrant/db-frontmatter-no-title] [fixture:
quadrant/db-frontmatter-then-bom-header] [fixture:
quadrant/db-frontmatter-title-empty] [fixture:
quadrant/db-frontmatter-title-number] [fixture:
quadrant/db-frontmatter-title-quoted] [fixture:
quadrant/db-frontmatter-title-spaces] [fixture:
quadrant/db-frontmatter-title-with-quadrant-statement] [fixture:
quadrant/db-frontmatter-title-yaml-multiline] [fixture:
quadrant/db-frontmatter-with-quadrant-config] [fixture:
quadrant/db-frontmatter-with-theme] [fixture: quadrant/config-settings-chart]
[fixture: quadrant/config-settings-max-text-size] [fixture:
quadrant/config-settings-point-radius] [fixture:
quadrant/config-security-level-default-script] [fixture:
quadrant/config-security-level-loose-all] [fixture:
quadrant/config-security-level-other-all] [fixture:
quadrant/config-security-level-other-flowchart-html-labels-false] [fixture:
quadrant/config-security-level-other-html-labels-false] [fixture:
quadrant/config-security-level-other-script] [fixture:
quadrant/config-security-level-sandbox-all] [fixture:
quadrant/demo-quadrantchart-52c3bebf] [fixture:
quadrant/demo-quadrantchart-a0fc48ce] [fixture:
quadrant/docs-intro-examples-19ab9ebf] [fixture:
quadrant/docs-syntax-quadrant-chart-ba45a744] [fixture:
quadrant/docs-syntax-quadrant-chart-cb034871] [fixture:
quadrant/spec-quadrant-jison-0fc9ec32] [fixture:
quadrant/spec-quadrant-jison-15068193] [fixture:
quadrant/spec-quadrant-jison-1cb39768] [fixture:
quadrant/spec-quadrant-jison-225dccc3] [fixture:
quadrant/spec-quadrant-jison-2b917256] [fixture:
quadrant/spec-quadrant-jison-2e0a7de4] [fixture:
quadrant/spec-quadrant-jison-2ece6aa9] [fixture:
quadrant/spec-quadrant-jison-43cd7d36] [fixture:
quadrant/spec-quadrant-jison-50b898df] [fixture:
quadrant/spec-quadrant-jison-5a924a42] [fixture:
quadrant/spec-quadrant-jison-6536aa70] [fixture:
quadrant/spec-quadrant-jison-6b480a86] [fixture:
quadrant/spec-quadrant-jison-732d669e] [fixture:
quadrant/spec-quadrant-jison-7ea55739] [fixture:
quadrant/spec-quadrant-jison-8418297c] [fixture:
quadrant/spec-quadrant-jison-856c8f79] [fixture:
quadrant/spec-quadrant-jison-86140df1] [fixture:
quadrant/spec-quadrant-jison-8c3d1169] [fixture:
quadrant/spec-quadrant-jison-8dac10d0] [fixture:
quadrant/spec-quadrant-jison-91681bd8] [fixture:
quadrant/spec-quadrant-jison-988ca5bc] [fixture:
quadrant/spec-quadrant-jison-9a746fe8] [fixture:
quadrant/spec-quadrant-jison-a0e26bb0] [fixture:
quadrant/spec-quadrant-jison-a3f7c02f] [fixture:
quadrant/spec-quadrant-jison-a5cf313b] [fixture:
quadrant/spec-quadrant-jison-a7ea43d1] [fixture:
quadrant/spec-quadrant-jison-a8ceb50a] [fixture:
quadrant/spec-quadrant-jison-ae92ea6b] [fixture:
quadrant/spec-quadrant-jison-b0118e13] [fixture:
quadrant/spec-quadrant-jison-bade5876] [fixture:
quadrant/spec-quadrant-jison-bbfa81b2] [fixture:
quadrant/spec-quadrant-jison-ce8b41ea] [fixture:
quadrant/spec-quadrant-jison-d38a2087] [fixture:
quadrant/spec-quadrant-jison-d461dfbf] [fixture:
quadrant/spec-quadrant-jison-da977a09] [fixture:
quadrant/spec-quadrant-jison-dfcee3bd] [fixture:
quadrant/spec-quadrant-jison-e268a026] [fixture:
quadrant/spec-quadrant-jison-e748e90b] [fixture:
quadrant/spec-quadrant-jison-e87d7a3c] [fixture:
quadrant/spec-quadrant-jison-f2dc5cde] [fixture:
quadrant/spec-quadrant-jison-f4315511] [fixture:
quadrant/spec-quadrant-jison-f816f569] [fixture:
quadrant/spec-quadrant-jison-fa7ba120] [fixture:
quadrant/spec-quadrant-jison-fd1ba7ac]

### Texts

```text
text      = bare-text | ( string | markdown-string ) text-rest?
bare-text = word text-rest?
text-rest = ( word | "-" | space )+
```

A **text** is the text of an axis, of a quadrant, and the name of a point. It is
words, dashes, and whitespace without quotes, starting with a word; or a string
or a markdown string, which a text without quotes may follow, glued to it or
after whitespace: `"A" B` is the text `A B`, and `"A"B` the text `AB`. A string
after a text without quotes, two strings, and a string after a markdown string
are rejected. The whitespace at the ends of a text is no part of it. Which of
the three forms starts a text is the kind of its node. [fixture:
quadrant/db-x-axis-quoted-both] [fixture: quadrant/db-y-axis-quoted-both]
[fixture: quadrant/db-x-axis-quoted-left-only] [fixture:
quadrant/db-y-axis-quoted-bottom-only] [fixture:
quadrant/db-x-axis-quoted-arrow] [fixture: quadrant/db-y-axis-quoted-arrow]
[fixture: quadrant/db-x-axis-quoted-real-arrow] [fixture:
quadrant/db-y-axis-quoted-real-arrow] [fixture:
quadrant/db-x-axis-backticks-without-quotes] [fixture:
quadrant/db-y-axis-backticks-without-quotes] [fixture:
quadrant/db-x-axis-text-with-dash] [fixture: quadrant/db-y-axis-text-with-dash]
[fixture: quadrant/db-x-axis-quoted-brackets] [fixture:
quadrant/db-y-axis-quoted-brackets] [fixture: quadrant/db-x-axis-quoted-newline]
[fixture: quadrant/db-y-axis-quoted-newline] [fixture:
quadrant/db-x-axis-quoted-glued-text] [fixture:
quadrant/db-y-axis-quoted-glued-text] [fixture: quadrant/db-x-axis-unicode-text]
[fixture: quadrant/db-y-axis-unicode-text] [fixture:
quadrant/db-x-axis-numeric-text] [fixture: quadrant/db-y-axis-numeric-text]
[fixture: quadrant/db-x-axis-space-text-with-punctuation] [fixture:
quadrant/db-y-axis-space-text-with-punctuation] [fixture:
quadrant/db-x-axis-html] [fixture: quadrant/db-y-axis-html] [fixture:
quadrant/gram-x-axis-text-with-colon] [fixture:
quadrant/gram-y-axis-text-with-colon] [fixture:
quadrant/gram-x-axis-text-starting-with-dash] [fixture:
quadrant/gram-y-axis-text-starting-with-dash] [fixture:
quadrant/gram-x-axis-text-with-brackets] [fixture:
quadrant/gram-y-axis-text-with-brackets] [fixture:
quadrant/gram-x-axis-keyword-in-text] [fixture:
quadrant/gram-y-axis-keyword-in-text] [fixture:
quadrant/gram-x-axis-semicolon-in-text] [fixture:
quadrant/gram-y-axis-semicolon-in-text] [fixture:
quadrant/gram-x-axis-quoted-unclosed] [fixture:
quadrant/gram-y-axis-quoted-unclosed] [fixture:
quadrant/gram-x-axis-text-then-quoted] [fixture:
quadrant/gram-y-axis-text-then-quoted] [fixture:
quadrant/gram-x-axis-two-quoted] [fixture: quadrant/gram-y-axis-two-quoted]
[fixture: quadrant/gram-quadrant-tab-after-keyword] [fixture:
quadrant/db-quadrant-tab-inside] [fixture: quadrant/db-quadrant-dash-inside]
[fixture: quadrant/gram-quadrant-leading-dash] [fixture:
quadrant/gram-quadrant-colon] [fixture: quadrant/db-quadrant-colon-in-quotes]
[fixture: quadrant/db-quadrant-quoted] [fixture:
quadrant/db-quadrant-quoted-then-bare] [fixture:
quadrant/gram-quadrant-bare-then-quoted] [fixture:
quadrant/gram-quadrant-two-strings] [fixture:
quadrant/gram-quadrant-quoted-unclosed] [fixture:
quadrant/db-quadrant-quoted-newline] [fixture: quadrant/gram-quadrant-semicolon]
[fixture: quadrant/db-quadrant-semicolon-in-quotes] [fixture:
quadrant/db-quadrant-hash] [fixture: quadrant/gram-quadrant-brackets] [fixture:
quadrant/gram-quadrant-parens] [fixture: quadrant/gram-quadrant-angle] [fixture:
quadrant/gram-quadrant-braces] [fixture: quadrant/gram-quadrant-pipe] [fixture:
quadrant/gram-quadrant-at] [fixture: quadrant/gram-quadrant-caret] [fixture:
quadrant/gram-quadrant-tilde] [fixture: quadrant/db-quadrant-punctuation]
[fixture: quadrant/db-quadrant-brackets-in-quotes] [fixture:
quadrant/gram-quadrant-arrow-in-text] [fixture:
quadrant/db-quadrant-double-dash] [fixture: quadrant/db-quadrant-non-ascii]
[fixture: quadrant/db-quadrant-nbsp-inside] [fixture:
quadrant/db-quadrant-ideographic-inside] [fixture:
quadrant/db-quadrant-ideographic-after-keyword] [fixture:
quadrant/db-quadrant-nbsp-after-keyword] [fixture:
quadrant/db-quadrant-nbsp-trailing] [fixture: quadrant/db-quadrant-html]
[fixture: quadrant/gram-quadrant-keyword-in-text] [fixture:
quadrant/gram-quadrant-title-in-text] [fixture:
quadrant/gram-quadrant-point-like-text] [fixture:
quadrant/db-quadrant-proto-text] [fixture:
quadrant/db-quadrant-constructor-text] [fixture:
quadrant/db-quadrant-trailing-tab] [fixture: quadrant/db-name-acc-descr-word]
[fixture: quadrant/db-name-acc-title-word] [fixture: quadrant/db-name-backticks]
[fixture: quadrant/db-name-comma] [fixture: quadrant/db-name-constructor]
[fixture: quadrant/db-name-dash] [fixture: quadrant/db-name-digits] [fixture:
quadrant/db-name-has-own-property] [fixture: quadrant/db-name-hash] [fixture:
quadrant/db-name-html] [fixture: quadrant/db-name-ideographic] [fixture:
quadrant/db-name-indented] [fixture: quadrant/db-name-keyword-in-quotes]
[fixture: quadrant/db-name-long-spaces] [fixture: quadrant/db-name-nbsp]
[fixture: quadrant/db-name-non-ascii] [fixture: quadrant/db-name-proto]
[fixture: quadrant/db-name-quoted] [fixture: quadrant/db-name-quoted-colon]
[fixture: quadrant/db-name-quoted-newline] [fixture:
quadrant/db-name-quoted-spaces] [fixture: quadrant/db-name-single-dash]
[fixture: quadrant/db-name-spaces] [fixture: quadrant/db-name-spaces-trimmed]
[fixture: quadrant/db-name-tab-inside] [fixture: quadrant/db-name-to-string]
[fixture: quadrant/gram-name-arrow] [fixture: quadrant/gram-name-bracket]
[fixture: quadrant/gram-name-class-def-keyword] [fixture:
quadrant/gram-name-colon] [fixture: quadrant/gram-name-comment-after-space]
[fixture: quadrant/gram-name-comment-unit-digit] [fixture:
quadrant/gram-name-keyword-word-inside] [fixture:
quadrant/gram-name-leading-dash] [fixture: quadrant/gram-name-only] [fixture:
quadrant/gram-name-quadrant-keyword] [fixture: quadrant/gram-name-quoted-empty]
[fixture: quadrant/gram-name-semicolon] [fixture: quadrant/gram-name-x-axis]
[fixture: quadrant/db-name-quoted-glued-word] [fixture:
quadrant/db-name-dash-at-end]

### Titles and accessibility statements

```text
title-statement             = "title" title-text
acc-title-statement         = "accTitle" ":" acc-title-text
acc-description-statement   = "accDescr" ":" acc-description-text
description-block-statement = "accDescr" "{" description-block-text "}"
empty-description-block     = "accDescr" "{" "}"
```

A title may be empty: `title` alone is a title with no text. An accessibility
title and description are never empty (see
[Accessibility values](#accessibility-values)). A later statement of the same
kind is a statement like the first, and a description on a line and a block are
both descriptions. [fixture: quadrant/db-title-keyword-alone] [fixture:
quadrant/db-title-twice-empty-last] [fixture: quadrant/db-acc-title-twice]
[fixture: quadrant/db-acc-descr-twice] [fixture:
quadrant/db-acc-descr-line-then-block] [fixture:
quadrant/db-acc-descr-block-then-line]

A description block with text is followed by its separator with nothing between
but a comment and empty description blocks right after the `}`: `accDescr {x}`
followed by spaces at the end of its line, by a space and a `;`, by a space and
a comment or a directive, by text, or by a space and an empty description block
is rejected, while `accDescr {x};title T`, `accDescr {x}%% c`, and
`accDescr {x}accDescr {}` are accepted, and so are
`accDescr {x}accDescr {}accDescr {}`, `accDescr {x}accDescr {};title T`, and
`accDescr {x}` with a directive glued to the `}`, while
`accDescr {x}accDescr {}` followed by a space is rejected. mermaid.js accepts a
block followed by one whitespace character and a comment, also after an empty
block or a directive (see [Comments](#comments)). [fixture:
quadrant/db-acc-descr-block-then-two-empty-blocks] [fixture:
quadrant/db-acc-descr-block-empty-block-then-semicolon] [fixture:
quadrant/db-acc-descr-block-then-directive] [fixture:
quadrant/gram-acc-descr-block-empty-block-then-space] [fixture:
quadrant/div-acc-descr-block-empty-block-space-and-comment] [fixture:
quadrant/div-acc-descr-block-directive-space-and-comment] [fixture:
quadrant/db-acc-descr-block-closing-brace-same-line] [fixture:
quadrant/gram-acc-descr-block-braces-inside] [fixture:
quadrant/gram-acc-descr-block-unclosed] [fixture:
quadrant/gram-acc-descr-block-unclosed-no-line-feed] [fixture:
quadrant/gram-acc-descr-block-statement-after-brace] [fixture:
quadrant/db-acc-descr-block-statement-after-brace-semicolon] [fixture:
quadrant/gram-acc-descr-block-stray-brace] [fixture:
quadrant/gram-acc-descr-block-trailing-spaces-before-brace] [fixture:
quadrant/gram-acc-descr-block-text-after-brace] [fixture:
quadrant/gram-acc-descr-block-semicolon-spaced-after-brace] [fixture:
quadrant/db-comment-after-statement-brace] [fixture:
quadrant/db-acc-descr-block-then-empty-block-glued] [fixture:
quadrant/gram-acc-descr-block-space-and-directive] [fixture:
quadrant/gram-acc-descr-block-spaces-after-brace] [fixture:
quadrant/gram-acc-descr-block-then-empty-block-spaced] [fixture:
quadrant/gram-acc-descr-block-two-spaces-and-comment]

### Axes

```text
axis-statement = ( "x-axis" | "y-axis" ) text ( arrow text? )?
```

`x-axis` and `y-axis` take one text, or a text, the arrow, and a second text, or
a text and the arrow alone. The arrow is two dashes or more and `>`, with spaces
around it or not: `L-->R` and `L ---> R` have the texts `L` and `R`, while
`L -> R`, `L -- > R`, a second arrow, an arrow with no text before it, and the
keyword alone are rejected, and so are a tab between the keyword and the text
and a tab around the arrow, which are `space` units. The x axis and the y axis
are separate statements, in either order, and a later statement for an axis is a
statement like the first. [fixture: quadrant/db-x-axis-both] [fixture:
quadrant/db-y-axis-both] [fixture: quadrant/db-x-axis-left-only] [fixture:
quadrant/db-y-axis-bottom-only] [fixture: quadrant/db-x-axis-left-with-arrow]
[fixture: quadrant/db-y-axis-bottom-with-arrow] [fixture:
quadrant/gram-x-axis-right-only] [fixture: quadrant/gram-y-axis-top-only]
[fixture: quadrant/gram-x-axis-arrow-only] [fixture:
quadrant/gram-y-axis-arrow-only] [fixture: quadrant/gram-x-axis-no-text]
[fixture: quadrant/gram-y-axis-no-text] [fixture:
quadrant/db-x-axis-glued-arrow] [fixture: quadrant/db-y-axis-glued-arrow]
[fixture: quadrant/db-x-axis-long-arrow] [fixture:
quadrant/db-y-axis-long-arrow] [fixture: quadrant/gram-x-axis-short-arrow]
[fixture: quadrant/gram-y-axis-short-arrow] [fixture:
quadrant/gram-x-axis-broken-arrow] [fixture: quadrant/gram-y-axis-broken-arrow]
[fixture: quadrant/gram-x-axis-two-arrows] [fixture:
quadrant/gram-y-axis-two-arrows] [fixture: quadrant/db-x-axis-twice] [fixture:
quadrant/db-x-axis-twice-arrow-then-both] [fixture:
quadrant/db-x-axis-twice-arrow-without-right] [fixture:
quadrant/db-x-axis-twice-both] [fixture: quadrant/db-y-axis-twice] [fixture:
quadrant/db-y-axis-twice-arrow-then-both] [fixture:
quadrant/db-y-axis-twice-arrow-without-top] [fixture:
quadrant/db-y-axis-twice-both] [fixture:
quadrant/db-x-axis-right-only-after-left] [fixture:
quadrant/db-y-axis-top-only-after-bottom] [fixture:
quadrant/db-x-axis-arrow-form-then-both] [fixture:
quadrant/db-y-axis-arrow-form-then-both] [fixture:
quadrant/db-x-axis-arrow-alone-with-text-after-no-space] [fixture:
quadrant/db-y-axis-arrow-alone-with-text-after-no-space] [fixture:
quadrant/db-x-axis-dash-before-arrow] [fixture:
quadrant/db-y-axis-dash-before-arrow] [fixture:
quadrant/db-x-axis-dashes-after-text] [fixture:
quadrant/db-y-axis-dashes-after-text] [fixture: quadrant/db-x-axis-extra-spaces]
[fixture: quadrant/db-y-axis-extra-spaces] [fixture:
quadrant/db-x-axis-glued-text] [fixture: quadrant/db-y-axis-glued-text]
[fixture: quadrant/gram-x-axis-glued-dash] [fixture:
quadrant/gram-y-axis-glued-dash] [fixture: quadrant/db-x-axis-indented]
[fixture: quadrant/db-y-axis-indented] [fixture:
quadrant/gram-x-axis-tab-after-keyword] [fixture:
quadrant/gram-y-axis-tab-after-keyword] [fixture:
quadrant/gram-x-axis-tab-around-arrow] [fixture:
quadrant/gram-y-axis-tab-around-arrow] [fixture:
quadrant/db-x-axis-nbsp-around-arrow] [fixture:
quadrant/db-y-axis-nbsp-around-arrow] [fixture: quadrant/db-x-axis-then-y-axis]
[fixture: quadrant/db-axes-y-then-x] [fixture:
quadrant/db-x-axis-semicolon-then-y] [fixture:
quadrant/db-axes-semicolon-y-then-x] [fixture:
quadrant/db-x-axis-trailing-semicolon] [fixture:
quadrant/db-y-axis-trailing-semicolon] [fixture:
quadrant/db-x-axis-comment-after-text] [fixture:
quadrant/db-y-axis-comment-after-text] [fixture:
quadrant/db-x-axis-comment-glued-text-longer] [fixture:
quadrant/db-y-axis-comment-glued-text-longer] [fixture:
quadrant/db-x-axis-comment-after-arrow] [fixture:
quadrant/db-y-axis-comment-after-arrow] [fixture:
quadrant/db-x-axis-directive-in-text] [fixture:
quadrant/db-y-axis-directive-in-text]

### Quadrants

```text
quadrant-statement = ( "quadrant-1" | "quadrant-2" | "quadrant-3" | "quadrant-4" ) text
```

A quadrant statement is the keyword and a text; `quadrant-0`, `quadrant-5`, and
the keyword alone are rejected. The four quadrants are set in any order, and a
later statement for a quadrant is a statement like the first. [fixture:
quadrant/db-quadrant-all-four] [fixture: quadrant/db-quadrant-reverse-order]
[fixture: quadrant/db-quadrant-1-alone] [fixture: quadrant/db-quadrant-2-alone]
[fixture: quadrant/db-quadrant-3-alone] [fixture: quadrant/db-quadrant-4-alone]
[fixture: quadrant/gram-quadrant-no-text] [fixture:
quadrant/gram-quadrant-empty-string] [fixture: quadrant/gram-quadrant-five]
[fixture: quadrant/gram-quadrant-zero] [fixture: quadrant/db-quadrant-ten]
[fixture: quadrant/db-quadrant-glued-text] [fixture: quadrant/db-quadrant-twice]
[fixture: quadrant/db-quadrant-twice-empty-spaces] [fixture:
quadrant/db-quadrant-spaces-trimmed] [fixture:
quadrant/db-quadrant-comment-after-space] [fixture:
quadrant/db-quadrant-comment-glued-longer] [fixture:
quadrant/db-quadrant-directive-inside] [fixture:
quadrant/db-quadrant-semicolon-then-next] [fixture:
quadrant/db-quadrant-semicolon-spaced-then-next] [fixture:
quadrant/db-quadrant-trailing-semicolon] [fixture:
quadrant/db-quadrant-blank-lines-between] [fixture:
quadrant/db-quadrant-whitespace-lines-between] [fixture:
quadrant/db-quadrant-crlf-between] [fixture: quadrant/db-quadrant-cr-between]
[fixture: quadrant/db-quadrant-cr-cr-lf] [fixture:
quadrant/gram-quadrant-ls-between] [fixture: quadrant/gram-quadrant-vt-between]

### Points

```text
point-statement = text ( ":::" class-name )? ":" "[" coordinate "," coordinate "]" styles?
styles          = style ( "," style )*
style           = ( style-word | space )+
```

A point is a name, a class name after `:::` or none, and two coordinates in
brackets, with styles after the `]` or none. A `style-word` is one of the units
that a style is made of, read in the statement context: a word of letters or
digits, `:`, `#`, and `-`. So a style holds letters, digits, `:`, `#`, `-`, and
whitespace, and no `.`, `_`, `%`, character outside ASCII, or placeholder of an
entity: `radius: 1.5` and `color: rgb(1,2,3)` are rejected. The styles are
separated by `,`, with whitespace around it or not, and may follow the `]` with
no space. A point without a name, without the brackets, the colon, or the comma,
with one or three coordinates, or with a `;` for the comma, is rejected. Two
points of the same name or position are two points. [fixture:
quadrant/db-points-three] [fixture: quadrant/db-points-same-name] [fixture:
quadrant/db-points-same-position] [fixture: quadrant/db-points-identical]
[fixture: quadrant/db-points-between-statements] [fixture:
quadrant/db-style-radius] [fixture: quadrant/db-style-radius-glued] [fixture:
quadrant/db-style-radius-spaced-colon] [fixture: quadrant/db-style-radius-zero]
[fixture: quadrant/db-style-radius-leading-zeros] [fixture:
quadrant/db-style-radius-big] [fixture: quadrant/db-style-radius-overflow]
[fixture: quadrant/gram-style-radius-fraction] [fixture:
quadrant/db-style-radius-trailing-space] [fixture:
quadrant/db-style-radius-colon-after] [fixture: quadrant/db-style-color]
[fixture: quadrant/db-style-color-colon-after] [fixture:
quadrant/db-style-color-colon-space-after] [fixture:
quadrant/db-style-color-no-hash] [fixture: quadrant/db-style-color-short]
[fixture: quadrant/db-style-color-upper] [fixture:
quadrant/gram-style-color-function] [fixture: quadrant/db-style-stroke-color]
[fixture: quadrant/db-style-stroke-width] [fixture:
quadrant/db-style-stroke-width-big] [fixture:
quadrant/db-style-stroke-width-leading-zero] [fixture:
quadrant/gram-style-stroke-width-fraction] [fixture: quadrant/db-style-two]
[fixture: quadrant/db-style-two-reversed] [fixture: quadrant/db-style-four]
[fixture: quadrant/db-style-same-twice] [fixture:
quadrant/gram-style-trailing-comma] [fixture: quadrant/gram-style-leading-comma]
[fixture: quadrant/gram-style-double-comma] [fixture:
quadrant/db-style-space-around] [fixture: quadrant/db-style-tab-around]
[fixture: quadrant/gram-style-nbsp-in-value] [fixture:
quadrant/gram-style-newline-after-comma] [fixture:
quadrant/db-style-semicolon-then-point] [fixture: quadrant/db-style-with-class]
[fixture: quadrant/gram-style-keyword-in-value] [fixture:
quadrant/gram-style-non-ascii-key] [fixture:
quadrant/db-style-colon-in-point-name] [fixture:
quadrant/db-classdef-with-point-radius-overflow] [fixture:
quadrant/db-style-radius-semicolon] [fixture: quadrant/db-style-radius-comment]
[fixture: quadrant/db-style-radius-comment-glued] [fixture:
quadrant/db-style-radius-directive-inside]

### Classes

```text
class-def-statement = "classDef" space class-def-name space styles
class-def-name      = ( word-of-name | "-" | "," | ":" )+
```

A class definition is `classDef`, one whitespace character, the name, one
whitespace character, and the styles of a point. A `word-of-name` is a word of
letters, digits, or characters outside ASCII, or one of `&`, `#`, and `*`: the
name holds no `_`, `.`, or other punctuation, and its colons, commas, and dashes
are part of it, so `classDef a:b color: #fff` is the class `a:b`. Two whitespace
characters before the name are rejected, while whitespace after the second one
belongs to the first style. A `classDef` without styles, without a name, or with
a name in quotes, is rejected. A later definition of a class is a statement like
the first, and a class may be defined before or after a point that uses it, or
not used. [fixture: quadrant/db-classdef-color] [fixture:
quadrant/db-classdef-two-styles] [fixture: quadrant/db-classdef-all-four]
[fixture: quadrant/db-classdef-twice-replaces] [fixture:
quadrant/db-classdef-twice-same-style] [fixture:
quadrant/db-classdef-two-classes] [fixture: quadrant/db-classdef-redefine-order]
[fixture: quadrant/gram-classdef-no-style] [fixture:
quadrant/gram-classdef-name-only-space] [fixture:
quadrant/gram-classdef-no-name] [fixture:
quadrant/db-classdef-two-spaces-after-name] [fixture:
quadrant/gram-classdef-two-spaces-before-name] [fixture:
quadrant/db-classdef-lower-case] [fixture: quadrant/gram-classdef-glued-name]
[fixture: quadrant/gram-classdef-quoted-name] [fixture:
quadrant/db-classdef-class-used-after] [fixture:
quadrant/db-classdef-class-used-before] [fixture:
quadrant/db-classdef-point-style-and-class] [fixture:
quadrant/db-classdef-unused] [fixture: quadrant/db-classdef-indented] [fixture:
quadrant/gram-classdef-keyword-as-class] [fixture:
quadrant/gram-classdef-name-keyword-title] [fixture:
quadrant/db-classdef-blank-line-between] [fixture:
quadrant/db-classdef-comment-after] [fixture:
quadrant/db-classdef-comment-glued] [fixture:
quadrant/db-classdef-constructor-name] [fixture: quadrant/db-classdef-dash-name]
[fixture: quadrant/db-classdef-digit-name] [fixture:
quadrant/db-classdef-has-own-property-name] [fixture:
quadrant/db-classdef-name-amp] [fixture: quadrant/db-classdef-name-colon]
[fixture: quadrant/db-classdef-name-comma] [fixture:
quadrant/db-classdef-name-hash] [fixture: quadrant/db-classdef-name-star]
[fixture: quadrant/db-classdef-non-ascii-name] [fixture:
quadrant/db-classdef-proto-via-dash] [fixture:
quadrant/db-classdef-semicolon-line-start] [fixture:
quadrant/db-classdef-to-string-name] [fixture: quadrant/gram-classdef-name-dot]
[fixture: quadrant/gram-classdef-proto-name] [fixture:
quadrant/gram-classdef-semicolon-end] [fixture:
quadrant/gram-classdef-semicolon-separated] [fixture:
quadrant/gram-classdef-underscore-name] [fixture:
quadrant/db-name-prototype-definegetter] [fixture:
quadrant/db-name-prototype-isprototypeof] [fixture:
quadrant/db-name-prototype-lookupgetter] [fixture:
quadrant/db-name-prototype-propertyisenumerable] [fixture:
quadrant/db-name-prototype-tolocalestring] [fixture:
quadrant/db-name-prototype-valueof] [fixture:
quadrant/db-class-prototype-value-of] [fixture:
quadrant/db-classdef-prototype-to-string-redefined] [fixture:
quadrant/db-classdef-prototype-twice] [fixture:
quadrant/db-classdef-prototype-used] [fixture:
quadrant/db-classdef-radius-semicolon] [fixture: quadrant/db-classdef-tabs]
[fixture: quadrant/db-classdef-name-colon-between-letters]

### Empty description blocks

A description block statement with no `description-block-text` unit is an
**empty description block**: `accDescr {}`, `accDescr { }`, and a block of line
feeds or of tabs. mermaid.js reads no token for it, wherever it stands. It is a
statement where a statement starts, on the line of the header too, before
another statement on its line, and after the last unit of a statement, before
its separator: `accDescr {}`, `accDescr {} x-axis L`,
`A: [0.3, 0.6] accDescr {}`, and `quadrant-1 A accDescr {}` are accepted, with
whitespace after the block or not. Anywhere else, inside a statement, the
grammar takes it nowhere, and the input is rejected: inside a text, between the
`]` of a point and its styles, between the name of a class and its styles, and
right after the keyword of an axis. mermaid.js accepts such an input as if the
block were not there, but right after the keyword of an axis, where the
whitespace before the text is a `space` unit there too. This is the known
divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).
[fixture: quadrant/div-empty-block-in-classdef] [fixture:
quadrant/div-empty-block-in-name] [fixture:
quadrant/div-empty-block-in-quadrant-text] [fixture:
quadrant/div-empty-block-in-x-axis-text] [fixture:
quadrant/div-empty-block-between-point-and-styles] [fixture:
quadrant/db-empty-block-after-point] [fixture:
quadrant/db-empty-block-before-statement] [fixture:
quadrant/db-empty-block-on-header-line] [fixture:
quadrant/gram-empty-block-before-x-axis-text] [fixture:
quadrant/gram-block-with-text-in-quadrant-text] [fixture:
quadrant/db-block-on-header-line] [fixture:
quadrant/db-acc-descr-empty-block-keeps-block] [fixture:
quadrant/db-acc-descr-empty-block-keeps-line-blank-line] [fixture:
quadrant/db-acc-descr-empty-block-keeps-line-braces] [fixture:
quadrant/db-acc-descr-empty-block-keeps-line-line-feed] [fixture:
quadrant/db-acc-descr-empty-block-keeps-line-space] [fixture:
quadrant/db-acc-descr-empty-block-keeps-line-tab] [fixture:
quadrant/db-acc-descr-empty-block-twice-keeps] [fixture:
quadrant/db-acc-title-then-empty-block] [fixture:
quadrant/gram-acc-descr-empty-line-after-text] [fixture:
quadrant/db-acc-descr-empty-block-keeps-line-plain] [fixture:
quadrant/db-acc-descr-empty-block-spaces-after] [fixture:
quadrant/db-acc-descr-empty-block-tab-after] [fixture:
quadrant/db-classdef-empty-block-after] [fixture:
quadrant/db-quadrant-empty-block-after] [fixture:
quadrant/db-x-axis-empty-block-after]

### Empty strings

An empty string, `""`, and an empty markdown string are a `string` unit and a
`markdown-string` unit with the empty text. mermaid.js reads no token for them,
wherever they stand. The grammar takes them nowhere, since a text that is an
empty string has no character for mermaid.js either: `quadrant-1 ""`,
`x-axis ""`, `x-axis "" --> R`, and `"": [0.3, 0.6]` are rejected, as in
mermaid.js. Where mermaid.js accepts an input with them, as if they were not
there, it is rejected here: on a line of its own, before a statement, before or
after a word of a text or a name, after the arrow, where mermaid.js reads the
axis statement with the arrow and no second text, among the styles of a point,
and in a `classDef` line. This is the known divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md). In a
title, an accessibility text, and a description block, `""` is two characters of
the text. [fixture: quadrant/div-empty-string-after-name] [fixture:
quadrant/div-empty-string-before-name] [fixture:
quadrant/div-empty-string-before-quadrant-text] [fixture:
quadrant/div-empty-string-before-statement] [fixture:
quadrant/div-empty-string-between-words] [fixture:
quadrant/div-empty-string-in-classdef] [fixture:
quadrant/div-empty-string-in-point-styles] [fixture:
quadrant/div-empty-string-in-quadrant-text] [fixture:
quadrant/div-empty-string-inside-word] [fixture: quadrant/div-empty-string-line]
[fixture: quadrant/div-x-axis-empty-string-after-arrow] [fixture:
quadrant/div-y-axis-empty-string-after-arrow] [fixture:
quadrant/div-empty-markdown-string-before-statement] [fixture:
quadrant/div-empty-markdown-string-line] [fixture:
quadrant/div-empty-string-alone] [fixture:
quadrant/div-x-axis-empty-markdown-string-after-arrow] [fixture:
quadrant/db-empty-string-in-title] [fixture:
quadrant/db-empty-string-title-before-statement-line] [fixture:
quadrant/gram-empty-string-after-colon] [fixture:
quadrant/gram-empty-string-in-brackets] [fixture:
quadrant/gram-empty-string-twice-quadrant] [fixture:
quadrant/gram-x-axis-empty-string] [fixture: quadrant/gram-y-axis-empty-string]
[fixture: quadrant/gram-x-axis-empty-string-with-arrow] [fixture:
quadrant/gram-y-axis-empty-string-with-arrow] [fixture:
quadrant/db-x-axis-spaces-only-string] [fixture:
quadrant/db-y-axis-spaces-only-string] [fixture:
quadrant/db-x-axis-spaces-only-string-alone] [fixture:
quadrant/db-y-axis-spaces-only-string-alone]

### Rejections outside the grammar

The Db of mermaid.js reads the styles of a point and of a class while it reads
the text, and throws for a style it does not take. A style is a name, a `:`, and
a value, with whitespace around the `:` or not; a second `:` after the value,
and what follows it, is allowed. The names, in lower case only, are `radius`,
whose value is digits, `color` and `stroke-color`, whose value is a hex code of
three or six digits with or without `#`, and `stroke-width`, whose value is
digits and `px`. Any other name, an empty style, a style without a `:` or a
value, and a value of another form make the input rejected: `radius: -5`,
`radius: 1e3`, `color: red`, `stroke-width: 3`, `stroke-width: 3 px`,
`stroke-width: 3PX`, `stroke-width: 1.5px`, `RADIUS: 10`, and a tab after the
`]` of a point. A `radius` of many digits is accepted. [fixture:
quadrant/db-radius-above-safe-integer] [fixture:
quadrant/db-radius-first-infinite] [fixture: quadrant/db-radius-largest-finite]
[fixture: quadrant/gram-radius-arabic-digit] [fixture:
quadrant/gram-radius-exponent] [fixture: quadrant/gram-radius-fullwidth-digits]
[fixture: quadrant/gram-radius-hexadecimal] [fixture:
quadrant/gram-radius-infinity] [fixture: quadrant/gram-radius-nan] [fixture:
quadrant/gram-radius-negative-zero] [fixture: quadrant/gram-radius-plus]
[fixture: quadrant/gram-radius-space-text-after-number] [fixture:
quadrant/gram-radius-text-after-number] [fixture:
quadrant/gram-radius-underscore] [fixture: quadrant/gram-stroke-width-negative]
[fixture: quadrant/gram-stroke-width-text-after-unit] [fixture:
quadrant/db-stroke-width-zero] [fixture:
quadrant/gram-after-classdef-directive-word-unclosed] [fixture:
quadrant/gram-after-point-class-directive-word-unclosed] [fixture:
quadrant/gram-after-point-class-trailing-tab] [fixture:
quadrant/gram-after-point-directive-word-unclosed] [fixture:
quadrant/gram-after-point-style-directive-word-unclosed] [fixture:
quadrant/gram-after-point-trailing-tab] [fixture:
quadrant/gram-classdef-bad-style] [fixture: quadrant/gram-classdef-empty-value]
[fixture: quadrant/gram-classdef-space-in-name] [fixture:
quadrant/gram-classdef-tab-between-styles] [fixture:
quadrant/gram-point-text-after] [fixture: quadrant/gram-point-text-after-spaced]
[fixture: quadrant/gram-point-trailing-tab] [fixture:
quadrant/gram-point-two-tabs-and-comment] [fixture:
quadrant/gram-style-capital-key] [fixture:
quadrant/gram-style-color-four-digits] [fixture:
quadrant/gram-style-color-hash-only] [fixture: quadrant/gram-style-color-name]
[fixture: quadrant/gram-style-color-not-hex] [fixture:
quadrant/gram-style-newline-in-style] [fixture: quadrant/gram-style-no-comma]
[fixture: quadrant/gram-style-radius-double-colon] [fixture:
quadrant/gram-style-radius-empty] [fixture:
quadrant/gram-style-radius-leading-colon] [fixture:
quadrant/gram-style-radius-negative] [fixture:
quadrant/gram-style-radius-no-colon] [fixture:
quadrant/gram-style-radius-two-values] [fixture:
quadrant/gram-style-radius-unit] [fixture: quadrant/gram-style-radius-word]
[fixture: quadrant/gram-style-stroke-width-no-unit] [fixture:
quadrant/gram-style-stroke-width-spaced-unit] [fixture:
quadrant/gram-style-stroke-width-upper-unit] [fixture:
quadrant/gram-style-unknown-key] [fixture: quadrant/gram-style-upper-case-key]
[fixture: quadrant/gram-style-value-hash] [fixture:
quadrant/spec-quadrant-jison-2981d92b]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside the header, a keyword, the arrow, `:::`, a class name, or
  the name of a class of `classDef` makes the input rejected here, while
  mermaid.js joins the parts (see
  [Directives inside units](#directives-inside-units)).
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  The `;` that the line rule ignores inside the name of a class of `classDef`
  makes the input rejected here, while mermaid.js joins the parts:
  `classDef style:#x;y color: #f00` is the class `style:#xy` there. [fixture:
  quadrant/div-grid-style-classdef-name]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.md).**
  A `%%` glued to a unit of one character takes that character in mermaid.js
  (see [Comments](#comments)).
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty string, an empty markdown string, and an empty description block
  inside a statement are rejected here, while mermaid.js accepts them as if they
  were not there (see [Empty description blocks](#empty-description-blocks) and
  [Empty strings](#empty-strings)).
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, in a title, an accessibility text, a text, a string, or a class
  name, makes mermaid.js hand the text to the C4 parser, which rejects it; here
  the text is a quadrant chart. `C4Context` counts at the start of the text only
  in both, so it is a name of a point. [fixture: quadrant/db-c4-context-in-name]
  [fixture: quadrant/div-c4-keyword-in-acc-title] [fixture:
  quadrant/div-c4-keyword-in-class-name] [fixture:
  quadrant/div-c4-keyword-in-quadrant-text] [fixture:
  quadrant/div-c4-keyword-in-quoted-name] [fixture:
  quadrant/div-c4-keyword-in-title]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md)**
  and **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md)**
  apply as in every diagram type: with `title: <a` in the frontmatter,
  `accTitle: b="c">d` has the accessibility title `b='c'>d` in mermaid.js, and a
  frontmatter that is no valid YAML is rejected there and accepted here.
  [fixture: quadrant/div-frontmatter-html-tag-starts-in-field] [fixture:
  quadrant/div-frontmatter-invalid-yaml]

The known divergences
[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md),
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md),
and
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.md)
have no case in this diagram type: mermaid.js reads a line of `%%` alone before
the header as a comment, the line feed that its comment rule takes before a `%%`
changes nothing that a line feed after it does not, and it reads `%%{` that
starts no directive as a comment.
