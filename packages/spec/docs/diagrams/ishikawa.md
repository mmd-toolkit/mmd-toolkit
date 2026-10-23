# Ishikawa

Japanese version: [ishikawa.ja.md](./ishikawa.ja.md)

Source of truth in mermaid.js:

- [`ishikawa.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/ishikawa/parser/ishikawa.jison#L1-L56)
- [`ishikawaDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/ishikawa/ishikawaDb.ts#L20-L96)
- [`ishikawaDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/ishikawa/ishikawaDetector.ts#L7-L11)

This document covers the diagram type `ishikawa`. The tree is defined in
[ast/ishikawa.md](../ast/ishikawa.md). The
[tests package summary](../../../tests/docs/db-summaries.md#ishikawa) defines
how accepted values are read into the Db.

## Detection

Entry 30 of [detection.md](../detection.md) selects this grammar for `ishikawa`
or `ishikawa-beta`, case-insensitively, at the start after common leading
trivia. An ASCII letter, digit, or `_` immediately after `ishikawa` prevents
detection. A non-ASCII letter does not. [fixture: ishikawa/header-uppercase]
[fixture: ishikawa/header-beta-mixed-case] [fixture:
ishikawa/header-before-comments] [fixture: ishikawa/header-before-spaces]
[fixture: ishikawa/header-letter-suffix] [fixture: ishikawa/header-digit-suffix]
[fixture: ishikawa/header-underscore-suffix] [fixture:
ishikawa/header-nonascii-suffix] [fixture: ishikawa/lex-header-kelvin-boundary]
[fixture: ishikawa/lex-header-dotted-i-boundary] [fixture:
ishikawa/detect-kelvin-in-header]

A preceding `#`, `%` alone, `;`, or ordinary text is not leading trivia.
Frontmatter and directives follow the common rules; the C4 override is covered
under Known divergences. [fixture: ishikawa/header-before-hash] [fixture:
ishikawa/header-before-percent] [fixture: ishikawa/header-before-semicolon]
[fixture: ishikawa/header-before-text] [fixture: ishikawa/frontmatter-config]
[fixture: ishikawa/directive-before-header]

## Lexical structure

The lexer reads the converted [diagram text](../common.md#reading-a-source). CR
and CRLF are single line breaks, as is LF. Tree values keep the written
spelling, including quotes and entities. [fixture: ishikawa/lex-cr-lines]
[fixture: ishikawa/lex-crlf-lines] [fixture: ishikawa/lex-quoted-cr] [fixture:
ishikawa/lex-quoted-crlf] [fixture: ishikawa/header-root-inline-html] [fixture:
ishikawa/header-root-inline-entity] [fixture:
ishikawa/lex-entity-directive-in-node-text] [fixture:
ishikawa/lex-html-tag-starts-in-comment-line] [fixture:
ishikawa/lex-html-tag-crosses-directive] [fixture:
ishikawa/lex-html-tag-ends-in-comment-line]

### Units and contexts

There is one context. At each position the first matching rule below is applied,
then the rules are tried again at the next position; a longer competing text
match does not take priority. Common trivia and the blank-line rule below apply
throughout. [fixture: ishikawa/header-beta-letter-suffix] [fixture:
ishikawa/header-indented-second] [fixture: ishikawa/lex-header-word-child]
[fixture: ishikawa/lex-header-middle-label] [fixture:
ishikawa/div-header-blank-node]

1. After zero or more whitespace characters, `%%` starts a diagram comment. Its
   body is the longest run before a line break, U+2028, U+2029, or the end of
   text. The whitespace before its marker is trivia. [fixture:
   ishikawa/header-before-bare-pair] [fixture:
   ishikawa/gram-preserved-comment-after-root] [fixture:
   ishikawa/comment-preserved-u2028] [fixture: ishikawa/comment-preserved-u2029]
   [fixture: ishikawa/comment-only-eof]

2. `ishikawa-beta`, then `ishikawa`, case-insensitively, are `header` units. A
   header unit must not be followed by a word character. The beta form is tried
   first. Thus `ishikawa-betaX`, `ishikawa-beta1`, and `ishikawa-beta_` start
   with the stable header and have node text beginning `-beta`;
   `ishikawa-beta-x` uses the beta header and begins its text at `-x`. [fixture:
   ishikawa/header-uppercase] [fixture: ishikawa/header-beta-mixed-case]
   [fixture: ishikawa/header-beta-letter-suffix] [fixture:
   ishikawa/header-beta-digit-suffix] [fixture:
   ishikawa/header-beta-underscore-suffix] [fixture:
   ishikawa/header-beta-dash-suffix] [fixture:
   ishikawa/lex-directive-before-beta-fallback-text] [fixture:
   ishikawa/lex-directive-in-beta-fallback-text] [fixture:
   ishikawa/lex-kelvin-node-text] [fixture: ishikawa/lex-long-s-node-text]
   [fixture: ishikawa/lex-header-kelvin-boundary] [fixture:
   ishikawa/lex-header-dotted-i-boundary]

A header may touch punctuation or a non-ASCII letter, including `-`, `:`, `#`,
`%`, `{`, or `"`. A later header unit is rejected by the grammar, even when
indented or followed by a non-ASCII letter. [fixture:
ishikawa/header-dash-suffix] [fixture: ishikawa/header-colon-root] [fixture:
ishikawa/header-hash-root] [fixture: ishikawa/header-percent-root] [fixture:
ishikawa/header-brace-root] [fixture: ishikawa/header-quoted-root-glued]
[fixture: ishikawa/header-nonascii-suffix] [fixture: ishikawa/header-twice]
[fixture: ishikawa/header-beta-twice] [fixture: ishikawa/header-indented-second]
[fixture: ishikawa/lex-header-nonascii-child] [fixture:
ishikawa/lex-beta-nonascii-child] [fixture: ishikawa/gram-header-second-on-line]
[fixture: ishikawa/gram-header-second-beta-prefix] [fixture:
ishikawa/header-beta-colon-root] [fixture:
ishikawa/gram-header-ls-second-header] [fixture:
ishikawa/gram-comment-ls-second-header] [fixture:
ishikawa/gram-second-header-eof] [fixture: ishikawa/gram-second-beta-header-eof]
[fixture: ishikawa/gram-second-header-cut-eof]

3. A line break is a `newline`. Empty and whitespace-only lines are trivia under
   [Blank lines](#blank-lines). [fixture: ishikawa/lex-cr-lines] [fixture:
   ishikawa/lex-crlf-lines] [fixture: ishikawa/gram-between-empty-line]
   [fixture: ishikawa/gram-between-spaces-line] [fixture:
   ishikawa/div-header-blank-node]

4. A nonempty run of line whitespace before node text is `indentation`. It uses
   the whitespace set in [Notation](../common.md#notation), including tab, VT,
   FF, U+00A0, U+1680, U+2000–U+200A, U+2028, U+2029, U+202F, U+205F, U+3000,
   and U+FEFF. [fixture: ishikawa/lex-space-positions] [fixture:
   ishikawa/lex-tab-positions] [fixture: ishikawa/lex-vt-positions] [fixture:
   ishikawa/lex-ff-positions] [fixture: ishikawa/lex-nbsp-positions] [fixture:
   ishikawa/lex-ogham-positions] [fixture: ishikawa/lex-en-quad-positions]
   [fixture: ishikawa/lex-em-quad-positions] [fixture:
   ishikawa/lex-en-space-positions] [fixture: ishikawa/lex-em-space-positions]
   [fixture: ishikawa/lex-three-per-em-positions] [fixture:
   ishikawa/lex-four-per-em-positions] [fixture:
   ishikawa/lex-six-per-em-positions] [fixture:
   ishikawa/lex-figure-space-positions] [fixture:
   ishikawa/lex-punctuation-space-positions] [fixture:
   ishikawa/lex-thin-space-positions] [fixture:
   ishikawa/lex-hair-space-positions] [fixture: ishikawa/lex-u2028-indent]
   [fixture: ishikawa/lex-u2029-indent] [fixture:
   ishikawa/lex-narrow-nbsp-positions] [fixture:
   ishikawa/lex-medium-math-space-positions] [fixture:
   ishikawa/lex-ideographic-positions] [fixture: ishikawa/lex-bom-positions]

A physical line containing only U+2028 or U+2029 is a blank line. [fixture:
ishikawa/lex-ls-only-line] [fixture: ishikawa/lex-ps-only-line] [fixture:
ishikawa/div-header-ls-line-node] [fixture: ishikawa/div-header-ps-line-node]

5. `node-text` is one or more characters other than a line break, read as far as
   possible. It includes internal whitespace, U+2028 and U+2029, punctuation,
   quotes, backticks, backslashes, NUL, U+0085, and U+200B. U+0085 and U+200B
   are text even at the start; they are not indentation. There is no
   quoted-string context and no escape syntax. [fixture:
   ishikawa/gram-spaces-inside-text] [fixture: ishikawa/lex-u2028-in-root]
   [fixture: ishikawa/lex-u2029-in-child] [fixture:
   ishikawa/lex-text-punctuation] [fixture: ishikawa/lex-nul-in-text] [fixture:
   ishikawa/lex-nel-label] [fixture: ishikawa/lex-nel-only-line] [fixture:
   ishikawa/lex-zero-width-label] [fixture: ishikawa/gram-root-unclosed-quote]

Once `node-text` has begun, a header spelling, `%%`, and an unselected `;`
remain part of that text. A quote or punctuation before `ishikawa` makes the
whole remainder text. [fixture: ishikawa/lex-header-middle-label] [fixture:
ishikawa/lex-header-quoted-label] [fixture: ishikawa/lex-header-in-parentheses]
[fixture: ishikawa/comment-root-inline-glued] [fixture:
ishikawa/comment-child-inline-spaced] [fixture:
ishikawa/gram-after-child-semicolon] [fixture:
ishikawa/lex-semicolon-before-header-text]

The text keeps its trailing whitespace, including at EOF and after a colon.
[fixture: ishikawa/gram-root-trailing-space] [fixture:
ishikawa/gram-child-trailing-space] [fixture:
ishikawa/lex-trailing-ls-ps-whitespace] [fixture:
ishikawa/lex-trailing-whitespace-eof] [fixture:
ishikawa/gram-after-root-colon-space] [fixture:
ishikawa/gram-after-child-colon-space]

### Comments

Common [comment regions](../common.md#comment-lines) are left out before these
rules. They can remove the rest of a physical line after U+2028 or U+2029,
including its line break; text on the following physical line can then continue
the same node. A bare `%%` and `%%{}%%` are diagram comments at a unit boundary.
After node text has begun, even quoted-looking text keeps `%%` literally.
[fixture: ishikawa/comment-u2028] [fixture: ishikawa/comment-u2029] [fixture:
ishikawa/comment-ls-region-in-text] [fixture:
ishikawa/comment-ls-region-end-of-text] [fixture:
ishikawa/gram-preserved-comment-after-child] [fixture:
ishikawa/header-bare-percent-eof] [fixture: ishikawa/comment-ps-bare-in-text]
[fixture: ishikawa/comment-quoted-root-inline] [fixture:
ishikawa/comment-quoted-child-inline] [fixture:
ishikawa/lex-node-text-ps-comment-region] [fixture:
ishikawa/lex-style-rule-comment-region-in-text] [fixture:
ishikawa/lex-indent-comment-region-ls] [fixture:
ishikawa/lex-indent-comment-region-ps]

A diagram comment has marker `%%` and the following body, excluding its ending
line break or separator; `%%{}%%` has body `{}%%`. A directive may lie between
the two percent signs or inside ordinary text, according to the common rules.
`#` and a single `%` do not start comments. [fixture:
ishikawa/gram-preserved-comment-after-root] [fixture:
ishikawa/comment-directive-between-marks] [fixture:
ishikawa/directive-in-inline-percent-text] [fixture: ishikawa/comment-hash]
[fixture: ishikawa/comment-single-percent] [fixture:
ishikawa/lex-directive-before-diagram-comment-ls] [fixture:
ishikawa/div-header-comment-directive-value-ps] [fixture:
ishikawa/div-header-comment-directive-marker-ls] [fixture:
ishikawa/div-header-comment-multiline-directive-ls]

After a diagram comment ends at U+2028 or U+2029, rules resume at that
separator. A following node counts the separator and the whitespace after it as
indentation. A common comment region instead removes its whole region. [fixture:
ishikawa/comment-preserved-u2028] [fixture: ishikawa/comment-preserved-u2029]
[fixture: ishikawa/db-comment-ls-indent-below-first-cause] [fixture:
ishikawa/comment-u2028] [fixture: ishikawa/comment-u2029] [fixture:
ishikawa/div-header-comment-ls-node] [fixture:
ishikawa/div-header-comment-ps-node] [fixture:
ishikawa/div-header-inline-comment-ls-node] [fixture:
ishikawa/div-header-inline-comment-ps-node] [fixture:
ishikawa/lex-directive-before-diagram-comment-ls] [fixture:
ishikawa/div-header-comment-directive-value-ps] [fixture:
ishikawa/div-header-comment-directive-marker-ls] [fixture:
ishikawa/lex-comment-ps-indent-excludes-body-padding] [fixture:
ishikawa/lex-indent-comment-region-ls] [fixture:
ishikawa/lex-indent-comment-region-ps] [fixture:
ishikawa/header-comment-ps-whitespace-eof]

### Directives

Common [directives](../common.md#directives) are allowed before and after the
header, in indentation, and inside node text. Their contents are not node text
or indentation. Inside text they join the parts without adding a space; a
multiline directive can therefore join physical lines into one node. [fixture:
ishikawa/directive-before-header] [fixture:
ishikawa/directive-before-header-glued] [fixture:
ishikawa/directive-header-line-root] [fixture: ishikawa/directive-in-indent]
[fixture: ishikawa/db-indent-around-directives] [fixture:
ishikawa/directive-root-middle] [fixture: ishikawa/directive-child-middle]
[fixture: ishikawa/directive-in-quoted-root] [fixture:
ishikawa/directive-multiline-joins-node-text] [fixture:
ishikawa/directive-cr-lf-separated-node] [fixture:
ishikawa/lex-entity-directive-in-node-text] [fixture:
ishikawa/lex-html-tag-crosses-directive] [fixture:
ishikawa/lex-style-rule-directive-in-trigger] [fixture:
ishikawa/lex-indent-multiline-directive] [fixture:
ishikawa/lex-header-indent-multiline-directive] [fixture:
ishikawa/div-header-padding-multiline-directive-text]

An unclosed directive follows the common rule through its argument or the end of
text; quotes in node text do not close it. A `%%{` that does not start a
directive can still start a diagram comment. [fixture:
ishikawa/directive-open-root-eof] [fixture:
ishikawa/directive-open-word-argument] [fixture:
ishikawa/directive-open-root-quoted] [fixture:
ishikawa/comment-unclosed-percent-brace] [fixture:
ishikawa/header-before-empty-braces]

A directive cannot split the keyword selected as the header by the ordered unit
rules, including before `-beta` in a complete beta header. This is
[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md).
[fixture: ishikawa/directive-in-header] [fixture:
ishikawa/directive-in-beta-header] [fixture: ishikawa/div-directive-beta-prefix]

When the beta boundary fails, the stable header is selected and the suffix is
node text. A directive before `-betaX` or inside `-betaX` is allowed.
Numeric-looking prose is also node text, so `1`, a directive, and `2` is allowed
as one text value. [fixture: ishikawa/lex-directive-before-beta-fallback-text]
[fixture: ishikawa/lex-directive-in-beta-fallback-text] [fixture:
ishikawa/lex-directive-in-numeric-looking-text]

A header spelling formed inside node text remains text; one formed at a new unit
boundary is rejected as a second header. [fixture:
ishikawa/lex-directive-inside-quoted-header-text] [fixture:
ishikawa/gram-directive-joins-second-header]

### Frontmatter

[Frontmatter](../common.md#frontmatter) is recognized only at the start of the
source, before comment lines and the diagram header; its opening and closing
indentation follow the common rule. CRLF frontmatter is allowed. After the
header, `---` and title-looking lines are ordinary node text. [fixture:
ishikawa/frontmatter-indented] [fixture: ishikawa/frontmatter-crlf] [fixture:
ishikawa/frontmatter-after-comment] [fixture: ishikawa/frontmatter-after-header]

### Common line rules

The common
[`style` and `classDef` line rule](../common.md#style-and-classdef-lines)
applies, also inside quotes. A selected `;` is ignored inside node text and has
no statement of its own; the other written text and trailing whitespace remain,
also with two or three semicolons. [fixture: ishikawa/lex-root-style-semicolon]
[fixture: ishikawa/lex-root-style-semicolon-padding] [fixture:
ishikawa/lex-root-style-two-semicolons] [fixture:
ishikawa/lex-root-style-two-semicolons-padding] [fixture:
ishikawa/lex-root-style-three-semicolons] [fixture:
ishikawa/lex-root-style-three-semicolons-padding] [fixture:
ishikawa/lex-child-classdef-semicolon] [fixture:
ishikawa/lex-style-and-classdef-semicolons] [fixture:
ishikawa/lex-style-quoted-semicolon]

All other semicolons remain text; they do not separate nodes. [fixture:
ishikawa/lex-style-uppercase-semicolon] [fixture:
ishikawa/lex-style-no-hash-semicolon] [fixture:
ishikawa/lex-style-colon-space-semicolon] [fixture:
ishikawa/lex-style-semicolon-other-line] [fixture:
ishikawa/gram-after-root-semicolon] [fixture:
ishikawa/gram-after-root-spaced-semicolon] [fixture:
ishikawa/gram-after-root-two-semicolons] [fixture:
ishikawa/gram-after-root-spaced-semicolons] [fixture:
ishikawa/gram-after-child-semicolon] [fixture:
ishikawa/gram-after-child-spaced-semicolon] [fixture:
ishikawa/gram-after-child-two-semicolons] [fixture:
ishikawa/gram-after-child-spaced-semicolons] [fixture:
ishikawa/gram-semicolon-line]

A directive can split the line-rule trigger without ending node text. U+2028 and
U+2029 end a line-rule segment while node text continues, also across a common
comment region. [fixture: ishikawa/lex-style-semicolon-before-directive]
[fixture: ishikawa/lex-style-rule-directive-in-trigger] [fixture:
ishikawa/lex-style-rule-ls-segment] [fixture:
ishikawa/lex-style-rule-ps-segment] [fixture:
ishikawa/lex-style-rule-comment-region-in-text]

The line rule can join a header spelling inside node text, which remains text.
It cannot repair detection of a header that already contains `;`. No additional
semicolon-boundary divergence applies to these text units. [fixture:
ishikawa/lex-header-ignored-semicolon-in-text] [fixture:
ishikawa/detect-semicolon-in-header]

## Grammar

The grammar uses [Notation](../common.md#notation). Common leading trivia,
directives, comments, and blank lines are allowed as described above; `newline`
is required between successive node lines after that trivia is left out. A
comment-ending U+2028 or U+2029 can also start a node line, as described under
Comments. [fixture: ishikawa/header-before-comments] [fixture:
ishikawa/directive-before-header] [fixture: ishikawa/gram-between-empty-line]
[fixture: ishikawa/gram-root-and-child-one-line] [fixture:
ishikawa/directive-multiline-joins-node-text] [fixture:
ishikawa/comment-preserved-u2028] [fixture: ishikawa/comment-preserved-u2029]

```text
diagram = header node? (newline node?)*
node = indentation? node-text
```

| Rule      | Node                                                  |
| --------- | ----------------------------------------------------- |
| `diagram` | IshikawaDiagram                                       |
| `node`    | IshikawaNode, with an IshikawaLiteral for `node-text` |

The header cannot end the source with nothing after it but removed directives
and the appended line feed. A source line break, whitespace, a diagram comment,
or node text may follow it. A diagram without nodes has `root` null. [fixture:
ishikawa/header-only] [fixture: ishikawa/header-beta-only] [fixture:
ishikawa/header-directive-only-eof] [fixture: ishikawa/header-only-lf] [fixture:
ishikawa/header-cr-only] [fixture: ishikawa/header-crlf-only] [fixture:
ishikawa/header-spaces-eof] [fixture: ishikawa/header-tab-eof] [fixture:
ishikawa/header-vt-eof] [fixture: ishikawa/header-ff-eof] [fixture:
ishikawa/header-u2028-only] [fixture: ishikawa/header-u2029-only] [fixture:
ishikawa/header-bare-percent-eof] [fixture: ishikawa/header-glued-comment-eof]
[fixture: ishikawa/header-lf-directive-eof] [fixture:
ishikawa/header-same-line-root] [fixture: ishikawa/gram-root-eof] [fixture:
ishikawa/gram-initial-header-cut-eof] [fixture:
ishikawa/gram-initial-beta-cut-eof] [fixture:
ishikawa/header-comment-ps-whitespace-eof]

The last node needs no final source line break. [fixture:
ishikawa/gram-root-eof] [fixture: ishikawa/comment-child-inline-eof] [fixture:
ishikawa/directive-closed-child-eof] [fixture:
ishikawa/directive-open-child-eof]

A node is nonempty text, not a declaration or a reference. Repetitions remain
separate nodes. Numbers, prototype property names, `title`, `accTitle:`,
`accDescr:`, and `accDescr {}` are ordinary text. They have no title or
accessibility statement form. [fixture: ishikawa/db-three-definitions] [fixture:
ishikawa/db-number-labels] [fixture: ishikawa/db-prototype-labels] [fixture:
ishikawa/db-title-line-is-node] [fixture: ishikawa/db-acctitle-is-node]
[fixture: ishikawa/db-accdescr-is-node] [fixture:
ishikawa/db-accdescr-empty-keeps-node] [fixture: ishikawa/db-empty-descr-root]

Quotes, empty strings, empty backticks, brackets, calls, and `@{...}` have no
special forms. They remain literal text, including missing closing quotes or
braces. A line break inside quote-like text begins another node. Empty brackets
between nodes are a node, not a gap. [fixture: ishikawa/gram-empty-quotes]
[fixture: ishikawa/gram-empty-backticks-text] [fixture:
ishikawa/gram-empty-brackets] [fixture:
ishikawa/gram-empty-calls-and-strings-text] [fixture:
ishikawa/db-empty-brackets-child] [fixture: ishikawa/db-data-block-is-text]
[fixture: ishikawa/gram-child-unclosed-brace] [fixture:
ishikawa/gram-root-unclosed-quote] [fixture: ishikawa/lex-quoted-crlf] [fixture:
ishikawa/gram-blank-multiline-quotes]

### Indentation and parents

The first node is the root. Every other node is called a cause here. The next
node, if any, is the first cause and a child of the root. Root indentation does
not decide any parent. [fixture: ishikawa/db-indent-first-cause] [fixture:
ishikawa/db-indent-root-deeper] [fixture: ishikawa/db-indent-root-shallower]
[fixture: ishikawa/spec-ishikawa-c5953a5f]

For every later node, if its indentation is less than or equal to the first
cause's indentation, its parent is the root. Otherwise its parent is the nearest
preceding cause with strictly smaller indentation. A node immediately following
a cause with the same indentation is its sibling. An indentation need not repeat
an earlier width, and a jump needs no intervening node. [fixture:
ishikawa/db-indent-clamped] [fixture: ishikawa/db-indent-clamp-below-base]
[fixture: ishikawa/db-indent-relative-zero] [fixture:
ishikawa/db-indent-unindented-siblings] [fixture: ishikawa/db-indent-jump]
[fixture: ishikawa/db-indent-pop-several] [fixture:
ishikawa/db-indent-nearest-smaller-cause]

Indentation is a nonnegative integer counting each line whitespace character as
one, a tab included. On the header line it counts only whitespace between header
and node text. Directives are excluded. A comment-ending U+2028 or U+2029 counts
with the following indentation. [fixture: ishikawa/db-indent-tab-character]
[fixture: ishikawa/db-indent-mixed-tab-space] [fixture:
ishikawa/db-indent-equal-mixed-whitespace] [fixture:
ishikawa/header-same-line-root] [fixture: ishikawa/gram-header-tab-root]
[fixture: ishikawa/gram-header-u2028-root] [fixture:
ishikawa/gram-header-u2029-root] [fixture: ishikawa/db-indent-around-directives]
[fixture: ishikawa/comment-preserved-u2028] [fixture:
ishikawa/comment-preserved-u2029] [fixture:
ishikawa/db-comment-ls-indent-below-first-cause] [fixture:
ishikawa/lex-indent-multiline-directive] [fixture:
ishikawa/lex-header-indent-multiline-directive] [fixture:
ishikawa/lex-indent-comment-region-ls] [fixture:
ishikawa/lex-indent-comment-region-ps] [fixture:
ishikawa/lex-comment-ps-indent-excludes-body-padding]

### Blank lines

After the header, empty lines, whitespace-only lines, common comment lines, and
diagram comments do not change acceptance or parents, before the first node,
between nodes, or at the end. A directive-only line is a blank line after the
directive is left out. Trailing header whitespace before a later node is
allowed. [fixture: ishikawa/div-header-blank-node] [fixture:
ishikawa/div-header-blank-indented-node] [fixture:
ishikawa/div-header-whitespace-indented-node] [fixture:
ishikawa/div-header-several-blank-node] [fixture:
ishikawa/div-header-spaces-line-node] [fixture:
ishikawa/div-header-ls-line-node] [fixture: ishikawa/div-header-ps-line-node]
[fixture: ishikawa/lex-ls-only-line] [fixture: ishikawa/lex-ps-only-line]
[fixture: ishikawa/div-header-common-comment-blank-node] [fixture:
ishikawa/div-header-directive-blank-node] [fixture:
ishikawa/div-header-trailing-space-node] [fixture:
ishikawa/div-header-trailing-tab-node] [fixture:
ishikawa/div-header-trailing-nbsp-node] [fixture:
ishikawa/div-beta-header-trailing-space-node] [fixture:
ishikawa/div-header-space-directive-node] [fixture:
ishikawa/gram-between-empty-line] [fixture: ishikawa/gram-between-spaces-line]
[fixture: ishikawa/gram-between-comment-line] [fixture:
ishikawa/gram-between-directive-line] [fixture:
ishikawa/gram-last-whitespace-line] [fixture:
ishikawa/db-indent-first-cause-after-blanks] [fixture:
ishikawa/gram-last-comment-blank-line] [fixture:
ishikawa/div-between-comment-directive-blank-node] [fixture:
ishikawa/div-header-two-comments-common-gap] [fixture:
ishikawa/div-between-comment-common-gap-blank-node] [fixture:
ishikawa/div-header-padding-multiline-directive-text] [fixture:
ishikawa/div-header-comment-multiline-directive-ls]

The inputs rejected only because mermaid.js pairs these blanks and diagram
comments differently fall under
[blank-line-after-header-or-comments](../known-divergences/blank-line-after-header-or-comments.md).
The four cases are header comments followed by blanks, a header comment ending
at U+2028 or U+2029 before a node, comments between nodes followed by blanks,
and comments between nodes ending at U+2028 or U+2029 before a node. The
accepted counterparts keep the same tree. [fixture:
ishikawa/div-header-two-comments-blank-node] [fixture:
ishikawa/div-header-comment-ls-node] [fixture:
ishikawa/div-header-comment-ps-node] [fixture:
ishikawa/div-between-comment-blank-node] [fixture:
ishikawa/div-between-comment-ls-blank-node] [fixture:
ishikawa/div-between-two-comments-ls-node] [fixture:
ishikawa/div-between-two-comments-ps-node] [fixture:
ishikawa/gram-header-comment-blank-node] [fixture:
ishikawa/gram-between-two-comments-blank-node] [fixture:
ishikawa/gram-header-comment-spaces-node] [fixture:
ishikawa/gram-header-two-comments-ls-node] [fixture:
ishikawa/gram-between-blank-comment-node] [fixture:
ishikawa/header-comment-ls-whitespace-eof] [fixture:
ishikawa/div-header-two-comments-blank-cr] [fixture:
ishikawa/div-header-two-comments-blank-crlf] [fixture:
ishikawa/div-header-two-comments-common-gap] [fixture:
ishikawa/div-header-inline-comment-ls-node] [fixture:
ishikawa/div-header-inline-comment-ps-node] [fixture:
ishikawa/div-between-comment-ps-blank-node] [fixture:
ishikawa/div-between-comment-blank-cr] [fixture:
ishikawa/div-between-comment-blank-crlf] [fixture:
ishikawa/div-between-comment-directive-blank-node] [fixture:
ishikawa/div-between-comment-common-gap-blank-node] [fixture:
ishikawa/gram-last-comment-blank-line] [fixture:
ishikawa/gram-header-two-comments-ps-node]

### Rejections outside the grammar

There are no additional diagram-specific rejections: an arbitrary indentation
width, repeated text, and prototype property names are accepted. Frontmatter
boundaries follow the common syntax; adjacent empty delimiter lines and an
unclosed frontmatter are rejected. Malformed contents of a well-delimited
frontmatter are covered by embedded-data-opaque. [fixture:
ishikawa/db-indent-jump] [fixture: ishikawa/db-three-definitions] [fixture:
ishikawa/db-prototype-labels] [fixture: ishikawa/frontmatter-empty] [fixture:
ishikawa/frontmatter-unclosed] [fixture: ishikawa/frontmatter-malformed]

## Known divergences

- **[blank-line-after-header-or-comments](../known-divergences/blank-line-after-header-or-comments.md):**
  the direct blank-line rule accepts inputs mermaid.js rejects, including
  trailing header whitespace and the four comment cases. [fixture:
  ishikawa/div-header-trailing-space-node] [fixture:
  ishikawa/div-header-two-comments-blank-node] [fixture:
  ishikawa/div-header-comment-ls-node] [fixture:
  ishikawa/div-header-comment-ps-node] [fixture:
  ishikawa/div-between-comment-blank-node] [fixture:
  ishikawa/div-between-two-comments-ls-node] [fixture:
  ishikawa/div-between-two-comments-ps-node]

- **[directive-as-token-boundary](../known-divergences/directive-as-token-boundary.md):**
  a split header keyword is rejected; mermaid.js joins the parts. Node text may
  contain directives. [fixture: ishikawa/directive-in-header] [fixture:
  ishikawa/directive-in-beta-header] [fixture:
  ishikawa/div-directive-beta-prefix] [fixture: ishikawa/directive-root-middle]

- **[html-tag-in-frontmatter](../known-divergences/html-tag-in-frontmatter.md):**
  a tag starting in frontmatter does not convert quotes in node text here. Both
  forms remain accepted text, while mermaid.js changes the attribute quotes.
  [fixture: ishikawa/div-frontmatter-open-tag-bare-node] [fixture:
  ishikawa/div-frontmatter-open-tag-quoted-node] [fixture:
  ishikawa/lex-quotes-without-frontmatter-tag]

- **[embedded-data-opaque](../known-divergences/embedded-data-opaque.md):**
  frontmatter and directive contents are opaque. Invalid YAML does not reject
  well-delimited frontmatter here. `@{...}` is ordinary node text, not embedded
  data. [fixture: ishikawa/frontmatter-malformed] [fixture:
  ishikawa/frontmatter-html-title] [fixture: ishikawa/directive-before-header]
  [fixture: ishikawa/db-data-block-is-text]

- **[c4-keyword-anywhere](../known-divergences/c4-keyword-anywhere.md):**
  `C4Container`, `C4Component`, `C4Dynamic`, and `C4Deployment` in node text do
  not override the Ishikawa header here. When the word remains visible to
  detection, mermaid.js selects C4 and rejects the input. `C4Context` does not
  override it. Removed common comments and directives do not trigger the
  override. Inline percent text remains node text; its suffix is left out by
  detection only when a physical line terminator follows it. EOF, also after
  U+2028 or U+2029 alone, leaves the C4 word visible to detection and is this
  divergence. [fixture: ishikawa/detect-c4-container-text] [fixture:
  ishikawa/detect-c4-component-root] [fixture:
  ishikawa/detect-c4-dynamic-quoted] [fixture:
  ishikawa/detect-c4-deployment-suffix] [fixture:
  ishikawa/detect-c4-context-text] [fixture: ishikawa/detect-c4-comment]
  [fixture: ishikawa/detect-c4-in-directive] [fixture:
  ishikawa/detect-inline-comment-c4-text] [fixture:
  ishikawa/detect-inline-comment-c4-cr] [fixture:
  ishikawa/div-c4-inline-percent-eof] [fixture:
  ishikawa/div-c4-inline-percent-ls-eof] [fixture:
  ishikawa/div-c4-inline-percent-ps-eof]
