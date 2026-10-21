# Venn

Japanese version: [venn.ja.md](./venn.ja.md)

Source of truth in mermaid.js:

- [`venn.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/parser/venn.jison#L1-L133)
- [`vennDB.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDB.ts#L16-L96)
- [`vennDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/venn/vennDetector.ts#L7-L11)

This document covers the diagram type `venn`. The tree is defined in
[ast/venn.md](../ast/venn.md). How mermaid.js reads accepted values into its Db
is in the [tests package summary](../../../tests/docs/db-summaries.md#venn).

## Detection

Entry 36 of [detection.md](../detection.md) selects this grammar. [fixture:
venn/header-only] [fixture: venn/header-capitalized] [fixture:
venn/header-upper] [fixture: venn/header-mixed] [fixture:
venn/header-word-suffix] [fixture: venn/header-digit-suffix] [fixture:
venn/header-underscore-suffix] Detection requires the exact lower-case prefix
`venn-beta` and has no following-character boundary. [fixture: venn/header-only]
[fixture: venn/header-capitalized] [fixture: venn/header-upper] [fixture:
venn/header-mixed] [fixture: venn/header-word-suffix] [fixture:
venn/header-digit-suffix] [fixture: venn/header-underscore-suffix]

Leading trivia follows the
[common detection rules](../common.md#diagram-detection), including a bare `%%`
line followed by a whitespace-only line. [fixture: venn/header-before-blank]
[fixture: venn/header-before-spaces] [fixture: venn/header-before-comment]
[fixture: venn/header-before-directive] [fixture:
venn/header-before-frontmatter] [fixture:
venn/header-before-frontmatter-comment] [fixture:
venn/header-before-bare-percent] [fixture: venn/header-before-empty-braces]
[fixture: venn/header-bare-percent-blank-before-header]

A `#` line, a single-percent line, a semicolon, or a statement before the header
prevents venn detection. [fixture: venn/header-before-hash] [fixture:
venn/header-before-percent] [fixture: venn/header-before-semicolon] [fixture:
venn/header-before-statement]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in converted
form. [fixture: venn/lex-cr-quoted-value] [fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-identifier-html-attribute] [fixture:
venn/lex-identifier-entity-named] [fixture: venn/lex-identifier-entity-numeric]
[fixture: venn/db-html-tag-from-title-name] [fixture:
venn/db-html-tag-from-title-label] [fixture: venn/db-html-tag-from-title-style]
[fixture: venn/db-html-tag-from-comment-name] [fixture:
venn/db-html-tag-across-names] Tree values keep the written text. [fixture:
venn/lex-cr-quoted-value] [fixture: venn/lex-crlf-quoted-value] [fixture:
venn/lex-identifier-html-attribute] [fixture: venn/lex-identifier-entity-named]
[fixture: venn/lex-identifier-entity-numeric]

### Units and contexts

The lexer starts in the ordinary context and applies the first matching rule at
each position. [fixture: venn/lex-inline-comment-eats-id] [fixture:
venn/lex-style-adjacent-units] [fixture: venn/lex-style-value-hex-nine]
[fixture: venn/gram-style-value-reserved-dash-prefix] [fixture:
venn/gram-style-value-union-dash-prefix] [fixture:
venn/gram-style-value-header-dash-prefix] [fixture:
venn/gram-style-value-title-line-priority] [fixture:
venn/gram-style-value-number-reserved-dash-prefix] [fixture:
venn/gram-style-value-followed-by-keyword-set] [fixture:
venn/gram-style-value-followed-by-keyword-title] [fixture:
venn/gram-style-value-followed-by-keyword-union] [fixture:
venn/gram-style-value-followed-by-keyword-text] [fixture:
venn/gram-style-value-followed-by-keyword-union-list] The longest competing
match is not selected. [fixture: venn/lex-inline-comment-eats-id] [fixture:
venn/lex-style-adjacent-units] [fixture: venn/lex-style-value-hex-nine]
[fixture: venn/gram-first-rule-keyword-prefix-name] [fixture:
venn/lex-first-rule-comment-before-multiline-string] [fixture:
venn/gram-style-value-reserved-dash-prefix] [fixture:
venn/gram-style-value-union-dash-prefix] [fixture:
venn/gram-style-value-header-dash-prefix] [fixture:
venn/gram-style-value-title-line-priority] [fixture:
venn/gram-style-value-number-reserved-dash-prefix] [fixture:
venn/gram-style-value-followed-by-keyword-set] [fixture:
venn/gram-style-value-followed-by-keyword-title] [fixture:
venn/gram-style-value-followed-by-keyword-union] [fixture:
venn/gram-style-value-followed-by-keyword-text] [fixture:
venn/gram-style-value-followed-by-keyword-union-list]

A newline unit enters the line-start context. [fixture: venn/db-indent-width]
[fixture: venn/gram-extra-indent-indented-style] [fixture:
venn/db-form-style-rgba] Both contexts use the ordered rules below, with the
marked rules restricted to line start. [fixture: venn/db-indent-width] [fixture:
venn/gram-extra-indent-indented-style] [fixture: venn/db-form-style-rgba]

Strings, bracket labels, titles, and colors are whole units, with no separate
lexical context. [fixture: venn/lex-identifier-blank-line] [fixture:
venn/lex-label-blank-line] [fixture: venn/db-title-quotes] [fixture:
venn/lex-style-value-rgb-multiline]

A character with no matching rule is rejected. [fixture:
venn/gram-grid-nonascii-identifier-bare] [fixture: venn/lex-nbsp-line-start]
[fixture: venn/gram-header-close-brace-not-eaten]

The rules are tried in this order:

1. `%%` not followed by `{` starts a diagram comment, read through the
   characters before the next line feed or the end of text. [fixture:
   venn/lex-inline-comment-spaced] [fixture: venn/db-indent-comment-ls]
   [fixture: venn/gram-first-rule-keyword-prefix-name] [fixture:
   venn/lex-first-rule-comment-before-multiline-string]

2. One UTF-16 code unit other than `}`, immediately followed by `%%`, is
   swallowed with the following diagram comment. [fixture:
   venn/db-grid-comment-header-line] [fixture: venn/header-nonascii-eaten]
   [fixture: venn/gram-header-non-bmp-before-comment] [fixture:
   venn/gram-header-close-brace-not-eaten] [fixture:
   venn/gram-first-rule-keyword-prefix-name] [fixture:
   venn/lex-first-rule-comment-before-multiline-string] [fixture:
   venn/lex-comment-swallowed-nbsp] [fixture:
   venn/lex-comment-swallowed-nbsp-between-statements]

3. In the line-start context, spaces and tabs immediately before a line feed are
   skipped. [fixture: venn/db-indent-blank-line] [fixture:
   venn/lex-tab-whitespace-line]

4. In the line-start context, one or more spaces or tabs before the bounded
   keyword `text` select an `implicit-text-start` unit when implicit text mode
   is enabled. [fixture: venn/db-form-indent-id] [fixture: venn/db-indent-width]
   [fixture: venn/gram-indent-text-prefix] [fixture:
   venn/db-indent-after-directive] This unit consumes that keyword and enters
   the ordinary context. [fixture: venn/db-form-indent-id] [fixture:
   venn/db-indent-width] [fixture: venn/gram-indent-text-prefix] [fixture:
   venn/db-indent-after-directive]

5. Otherwise, those spaces and tabs are skipped in the line-start context.
   [fixture: venn/lex-indented-text-at-bol-without-current-set-explicit]
   [fixture: venn/lex-indented-text-after-style-explicit]

6. In the line-start context, remaining leading spaces and tabs are skipped.
   [fixture: venn/gram-extra-indent-indented-style] [fixture:
   venn/gram-indent-after-indented-title]

7. In the line-start context, any other character except a line feed disables
   implicit text mode, enters the ordinary context, and is read again there.
   [fixture: venn/gram-indent-after-style] [fixture:
   venn/gram-indent-after-title] [fixture:
   venn/gram-extra-indent-indented-style] [fixture:
   venn/gram-indent-after-indented-title] [fixture:
   venn/gram-indent-empty-braces-after-blank] [fixture:
   venn/gram-indent-union-blank-empty-braces]

8. One or more line feeds make one `newline` unit and enter the line-start
   context. [fixture: venn/db-indent-after-blank] [fixture:
   venn/lex-cr-line-end] [fixture: venn/lex-crlf-line-end] [fixture:
   venn/gram-indent-empty-braces-after-blank] [fixture:
   venn/lex-indent-bare-percent-after-blank] [fixture:
   venn/lex-indent-indented-empty-braces-after-blank]

9. Any remaining `%%`, including `%%{` that starts no common directive, starts a
   diagram comment through the characters before the next line feed or end.
   [fixture: venn/lex-bare-percent-between-set-and-text] [fixture:
   venn/lex-empty-braces-percent-between-set-and-text] [fixture:
   venn/gram-indent-empty-braces-after-blank] [fixture:
   venn/lex-indent-bare-percent-after-blank] [fixture:
   venn/lex-indent-indented-empty-braces-after-blank]

10. ASCII spaces and tabs are skipped. [fixture: venn/lex-tab-line-start]
    [fixture: venn/lex-tab-line-end] [fixture: venn/db-set-label-space]
    [fixture: venn/db-set-label-tab] [fixture: venn/db-after-set-space]
    [fixture: venn/lex-after-set-tab] [fixture: venn/db-after-set-label-space]
    [fixture: venn/lex-after-set-label-tab] [fixture:
    venn/db-after-set-size-space] [fixture: venn/lex-after-set-size-tab]
    [fixture: venn/db-after-set-label-size-space] [fixture:
    venn/db-after-set-label-size-tab] [fixture: venn/db-after-union-space]
    [fixture: venn/lex-after-union-tab] [fixture:
    venn/db-after-union-label-space] [fixture: venn/db-after-union-label-tab]
    [fixture: venn/db-after-union-size-space] [fixture:
    venn/db-after-union-size-tab] [fixture:
    venn/db-after-union-label-size-space] [fixture:
    venn/lex-after-union-label-size-tab] [fixture: venn/db-after-text-id-space]
    [fixture: venn/lex-after-text-tab] [fixture:
    venn/db-after-text-id-label-space] [fixture: venn/lex-after-text-label-tab]
    [fixture: venn/db-after-text-string-space] [fixture:
    venn/lex-after-text-string-tab] [fixture:
    venn/db-after-text-string-label-space] [fixture:
    venn/db-after-text-string-label-tab] [fixture:
    venn/db-after-text-number-space] [fixture: venn/lex-after-text-number-tab]
    [fixture: venn/db-after-indent-id-space] [fixture:
    venn/lex-after-indent-tab] [fixture: venn/db-after-indent-id-label-space]
    [fixture: venn/db-after-indent-id-label-tab] [fixture:
    venn/db-after-indent-string-space] [fixture:
    venn/db-after-indent-string-tab] [fixture:
    venn/db-after-indent-string-label-space] [fixture:
    venn/db-after-indent-string-label-tab] [fixture:
    venn/db-after-indent-number-space] [fixture:
    venn/db-after-indent-number-tab] [fixture: venn/db-after-style-space]
    [fixture: venn/lex-after-style-tab] [fixture:
    venn/db-after-style-string-space] [fixture: venn/lex-after-style-string-tab]
    [fixture: venn/db-after-style-list-space] [fixture:
    venn/db-after-style-list-tab]

11. The end of text makes an `end` unit. [fixture: venn/header-only] [fixture:
    venn/header-only-lf]

12. `title`, one whitespace character of [Notation](../common.md#notation), and
    nonempty text without a converted `#`, line feed, or `;` make one
    `title-line` unit, taking as many characters as possible. [fixture:
    venn/db-title-padding] [fixture: venn/db-title-only-whitespace] [fixture:
    venn/db-title-value-next-line] [fixture: venn/lex-title-separator-crlf]
    [fixture: venn/lex-title-separator-ls] [fixture:
    venn/lex-title-separator-ps] [fixture: venn/lex-title-separator-nbsp]
    [fixture: venn/lex-title-separator-ff] [fixture:
    venn/lex-title-separator-vt] [fixture: venn/lex-title-separator-nel]
    [fixture: venn/gram-title-empty] [fixture: venn/gram-title-space-end]
    [fixture: venn/lex-title-entity-named] [fixture:
    venn/lex-title-entity-no-semicolon] [fixture:
    venn/gram-title-hash-color-outside-title] [fixture:
    venn/lex-after-title-semicolon]

13. The bounded keywords `venn-beta`, `set`, `union`, `text`, and `style` make
    `header`, `set-keyword`, `union-keyword`, `text-keyword`, and
    `style-keyword` units respectively. [fixture: venn/header-only] [fixture:
    venn/lex-keyword-set-upper] [fixture: venn/lex-keyword-union-upper]
    [fixture: venn/lex-keyword-text-upper] [fixture:
    venn/lex-keyword-style-upper] [fixture:
    venn/gram-first-rule-keyword-prefix-name] [fixture:
    venn/lex-first-rule-comment-before-multiline-string]

14. `["`, any number of characters other than `"`, and `"]` make a
    `quoted-label` unit. [fixture: venn/db-label-empty] [fixture:
    venn/db-form-set-label] [fixture:
    venn/lex-label-quoted-close-bracket-inside] [fixture:
    venn/lex-label-blank-line] [fixture: venn/lex-label-quoted-directive-only]
    [fixture: venn/lex-label-quoted-ignored-semicolon-only] [fixture:
    venn/lex-label-quoted-comment-only]

15. `[`, one or more characters other than `]` or `"`, and `]` make a
    `bare-label` unit. [fixture: venn/db-set-label] [fixture:
    venn/lex-label-bare-open-bracket-inside] [fixture:
    venn/lex-label-bare-whitespace-line] [fixture: venn/gram-label-bare-empty]
    [fixture: venn/gram-nested-label-quotes] [fixture:
    venn/gram-label-bare-directive-only] [fixture:
    venn/gram-label-bare-ignored-semicolon-only] [fixture:
    venn/lex-label-bare-comment-only]

16. An optional sign followed by a decimal integer, optionally followed by a dot
    and one or more fractional digits, makes a `number` unit. [fixture:
    venn/db-size-plus] [fixture: venn/db-size-fraction] [fixture:
    venn/db-size-signed-fraction] [fixture: venn/db-size-leading-zeros]
    [fixture: venn/db-size-negative] [fixture: venn/db-size-zero] An optional
    sign and a dot followed by one or more digits also make a `number` unit.
    [fixture: venn/db-size-plus] [fixture: venn/db-size-fraction] [fixture:
    venn/db-size-signed-fraction] [fixture: venn/db-size-leading-zeros]
    [fixture: venn/db-size-negative] [fixture: venn/db-size-zero]

17. `#` and three through eight hexadecimal digits make a `hex-color` unit,
    taking as many digits as possible. [fixture: venn/db-form-style-hex]
    [fixture: venn/lex-style-value-hex-three] [fixture:
    venn/lex-style-value-hex-eight] [fixture: venn/gram-style-value-hex-short]
    [fixture: venn/lex-style-value-hex-nine] [fixture: venn/db-style-hex-four]
    [fixture: venn/db-style-hex-five] [fixture: venn/db-style-hex-seven]

18. `rgba(`, four nonempty runs of digits or dots separated by commas, and `)`
    make an `rgba-color` unit. [fixture: venn/db-form-style-rgba] [fixture:
    venn/lex-style-value-rgba-case] [fixture:
    venn/gram-style-rgba-empty-channel] Whitespace of Notation is allowed around
    each run. [fixture: venn/db-form-style-rgba] [fixture:
    venn/lex-style-value-rgba-case] [fixture:
    venn/gram-style-rgba-empty-channel] [fixture:
    venn/gram-style-rgba-too-few-channels] [fixture:
    venn/gram-style-rgba-too-many-channels]

19. `rgb(` with three such runs and `)` makes an `rgb-color` unit. [fixture:
    venn/db-form-style-rgb] [fixture: venn/lex-style-value-rgb-unchecked-range]
    [fixture: venn/lex-style-value-rgb-multiline] [fixture:
    venn/gram-style-value-rgb-space-before-open] [fixture:
    venn/gram-style-rgb-negative-channel] [fixture:
    venn/gram-style-rgb-too-few-channels] [fixture:
    venn/gram-style-rgb-too-many-channels] [fixture:
    venn/gram-style-rgb-channel-internal-space]

20. An ASCII letter or underscore followed by as many ASCII letters, digits,
    hyphens, or underscores as possible makes an `identifier` unit. [fixture:
    venn/db-case-distinct-ids] [fixture: venn/db-grid-dash-identifier-bare]
    [fixture: venn/db-grid-digits-identifier-bare] [fixture:
    venn/gram-grid-nonascii-identifier-bare] [fixture:
    venn/gram-grid-spaces-identifier-bare] [fixture:
    venn/gram-first-rule-keyword-prefix-name] [fixture:
    venn/lex-first-rule-comment-before-multiline-string]

21. `"`, any number of characters other than `"`, and `"` make a `string` unit.
    [fixture: venn/db-empty-identifiers] [fixture:
    venn/lex-identifier-blank-line] [fixture: venn/gram-string-escape-quote]

22. `,` and `:` make the units `","` and `":"`. [fixture:
    venn/db-form-union-label-size] [fixture: venn/db-form-style-multiple]

Keyword letters, including those of `title`, `rgb`, and `rgba`, are compared
case-insensitively. [fixture: venn/lex-keyword-set-upper] [fixture:
venn/lex-keyword-union-upper] [fixture: venn/lex-keyword-text-upper] [fixture:
venn/lex-keyword-style-upper] [fixture: venn/lex-keyword-title-upper] [fixture:
venn/lex-keyword-set-letter] [fixture: venn/lex-keyword-set-digit] [fixture:
venn/lex-keyword-set-underscore] [fixture: venn/lex-keyword-set-dash] [fixture:
venn/lex-keyword-set-nonascii] [fixture: venn/lex-style-value-rgba-case]
[fixture: venn/header-word-suffix] [fixture: venn/header-digit-suffix] [fixture:
venn/header-underscore-suffix] A bounded keyword is not followed by an ASCII
letter, digit, or underscore. [fixture: venn/lex-keyword-set-upper] [fixture:
venn/lex-keyword-union-upper] [fixture: venn/lex-keyword-text-upper] [fixture:
venn/lex-keyword-style-upper] [fixture: venn/lex-keyword-title-upper] [fixture:
venn/lex-keyword-set-letter] [fixture: venn/lex-keyword-set-digit] [fixture:
venn/lex-keyword-set-underscore] [fixture: venn/lex-keyword-set-dash] [fixture:
venn/lex-keyword-set-nonascii] [fixture: venn/lex-style-value-rgba-case]
[fixture: venn/header-word-suffix] [fixture: venn/header-digit-suffix] [fixture:
venn/header-underscore-suffix]

The lexer reserves those keyword units in name and property-key positions.
[fixture: venn/lex-reserved-set-identifier] [fixture:
venn/lex-reserved-union-identifier] [fixture: venn/lex-reserved-text-identifier]
[fixture: venn/lex-reserved-style-identifier] [fixture:
venn/lex-reserved-venn-beta-identifier] [fixture:
venn/lex-reserved-title-identifier] [fixture: venn/lex-reserved-title-style-key]
[fixture: venn/lex-reserved-set-style-key] `title` without its whitespace
separator is an identifier. [fixture: venn/lex-reserved-set-identifier]
[fixture: venn/lex-reserved-union-identifier] [fixture:
venn/lex-reserved-text-identifier] [fixture: venn/lex-reserved-style-identifier]
[fixture: venn/lex-reserved-venn-beta-identifier] [fixture:
venn/lex-reserved-title-identifier] [fixture: venn/lex-reserved-title-style-key]
[fixture: venn/lex-reserved-set-style-key]

A keyword may touch a quoted name, as in `set"A"`. [fixture:
venn/lex-keyword-quote-no-space] [fixture: venn/header-dash-suffix] [fixture:
venn/header-nonascii-suffix] [fixture: venn/header-statement-glued] [fixture:
venn/gram-header-quote-no-space] Touching an invalid following character does
not supply an operand. [fixture: venn/lex-keyword-quote-no-space] [fixture:
venn/header-dash-suffix] [fixture: venn/header-nonascii-suffix] [fixture:
venn/header-statement-glued] [fixture: venn/gram-header-quote-no-space]

### Whitespace and value units

CRLF and lone CR are read as line feeds, including inside strings and labels.
[fixture: venn/lex-cr-quoted-value] [fixture: venn/lex-crlf-quoted-value]
[fixture: venn/lex-cr-line-end] [fixture: venn/lex-crlf-line-end] [fixture:
venn/db-grid-cr-label-bare] [fixture: venn/db-grid-crlf-label-bare] [fixture:
venn/lex-comment-swallowed-cr]

Outside value units, where no earlier rule reads the character, only ASCII
space, tab, and line feed are accepted after the header. [fixture:
venn/lex-tab-line-start] [fixture: venn/lex-tab-line-end] [fixture:
venn/lex-nbsp-header-after] [fixture: venn/lex-nbsp-line-start] [fixture:
venn/lex-nbsp-line-end] [fixture: venn/lex-nbsp-text-end] [fixture:
venn/lex-bom-line-start] [fixture: venn/lex-ff-line-start] [fixture:
venn/lex-vt-line-start] [fixture: venn/lex-ideographic-line-start] [fixture:
venn/lex-ls-line-start] [fixture: venn/lex-ps-line-start] [fixture:
venn/lex-comment-swallowed-nbsp] [fixture:
venn/lex-comment-swallowed-nbsp-between-statements] Vertical tab, form feed,
U+00A0, U+3000, U+FEFF, U+2028, and U+2029 are rejected there. [fixture:
venn/lex-tab-line-start] [fixture: venn/lex-tab-line-end] [fixture:
venn/lex-nbsp-header-after] [fixture: venn/lex-nbsp-line-start] [fixture:
venn/lex-nbsp-line-end] [fixture: venn/lex-nbsp-text-end] [fixture:
venn/lex-bom-line-start] [fixture: venn/lex-ff-line-start] [fixture:
venn/lex-vt-line-start] [fixture: venn/lex-ideographic-line-start] [fixture:
venn/lex-ls-line-start] [fixture: venn/lex-ps-line-start]

At a unit position, rule 2 swallows vertical tab, form feed, U+00A0, U+1680,
U+2000–U+200A, U+202F, U+205F, U+3000, U+FEFF, U+2028, or U+2029 immediately
before a `%%` that remains in the diagram text. [fixture:
venn/lex-comment-swallowed-nbsp] [fixture:
venn/lex-comment-swallowed-nbsp-between-statements] [fixture:
venn/lex-comment-swallowed-vt] [fixture: venn/lex-comment-swallowed-ff]
[fixture: venn/lex-comment-swallowed-ogham] [fixture:
venn/lex-comment-swallowed-en-quad] [fixture:
venn/lex-comment-swallowed-hair-space] [fixture:
venn/lex-comment-swallowed-narrow-nbsp] [fixture:
venn/lex-comment-swallowed-medium-math] [fixture:
venn/lex-comment-swallowed-ideographic] [fixture:
venn/lex-comment-swallowed-bom] [fixture:
venn/gram-comment-prefix-line-separator-bare-percent] [fixture:
venn/gram-comment-prefix-line-separator-u2029-bare-percent] [fixture:
venn/gram-comment-prefix-line-separator-brace-comment] [fixture:
venn/gram-comment-prefix-line-separator-u2029-brace-comment] [fixture:
venn/gram-comment-prefix-line-separator-between-statements-bare-percent]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-bare-percent]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-brace-comment]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-brace-comment]

A CR before `%%` is normalized to a line feed before common comment-line
removal. [fixture: venn/lex-comment-swallowed-cr]

The common [Comment lines](../common.md#comment-lines) rule removes `%% c` at a
comment start immediately after U+2028 or U+2029. [fixture:
venn/gram-comment-prefix-line-separator] [fixture:
venn/gram-comment-prefix-line-separator-u2029] U+2028 or U+2029 left outside
value units by that removal or common
[directive removal](../common.md#where-a-directive-is) is rejected. [fixture:
venn/gram-comment-prefix-line-separator] [fixture:
venn/gram-comment-prefix-line-separator-u2029] [fixture:
venn/gram-comment-prefix-line-separator-directive] [fixture:
venn/gram-comment-prefix-line-separator-u2029-directive]

A bare `%%` and `%%{ }%%` remain diagram text after either separator. [fixture:
venn/gram-comment-prefix-line-separator-bare-percent] [fixture:
venn/gram-comment-prefix-line-separator-u2029-bare-percent] [fixture:
venn/gram-comment-prefix-line-separator-brace-comment] [fixture:
venn/gram-comment-prefix-line-separator-u2029-brace-comment] [fixture:
venn/gram-comment-prefix-line-separator-between-statements-bare-percent]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-bare-percent]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-brace-comment]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-brace-comment]

Leading whitespace before detection follows the common rule. [fixture:
venn/lex-tab-header-before] [fixture: venn/lex-nbsp-header-before] [fixture:
venn/lex-nel-header-before] U+0085 is not whitespace. [fixture:
venn/lex-tab-header-before] [fixture: venn/lex-nbsp-header-before] [fixture:
venn/lex-nel-header-before]

Quoted names and bracket labels may contain line feeds, U+2028, and U+2029;
those characters do not end the unit. [fixture: venn/lex-identifier-blank-line]
[fixture: venn/lex-label-blank-line] [fixture: venn/lex-ls-quoted-value]
[fixture: venn/lex-ps-quoted-value] [fixture: venn/db-grid-ls-label-bare]
[fixture: venn/db-grid-ps-label-bare]

A string has no backslash escape, and strings and labels must close. [fixture:
venn/gram-string-escape-quote] [fixture:
venn/db-grid-backslash-identifier-quoted] [fixture: venn/gram-unclosed-id]
[fixture: venn/gram-unclosed-label] [fixture: venn/gram-unclosed-style]

Quotes and inline percent pairs inside a title are title text. [fixture:
venn/db-title-quotes] [fixture: venn/db-grid-comment-title] [fixture:
venn/db-grid-comment-label-bare] [fixture:
venn/lex-after-set-label-comment-glued] [fixture:
venn/lex-after-text-string-comment-glued] [fixture:
venn/lex-bare-percent-inside-quoted-name] [fixture:
venn/lex-bare-percent-inside-bare-label] Inline percent pairs inside a whole
string or label are value text. [fixture: venn/db-title-quotes] [fixture:
venn/db-grid-comment-title] [fixture: venn/db-grid-comment-label-bare] [fixture:
venn/lex-after-set-label-comment-glued] [fixture:
venn/lex-after-text-string-comment-glued] [fixture:
venn/lex-bare-percent-inside-quoted-name] [fixture:
venn/lex-bare-percent-inside-bare-label]

A title keeps every character after its first whitespace separator, including
further whitespace. [fixture: venn/db-title-padding] [fixture:
venn/db-title-only-whitespace] [fixture: venn/db-title-value-next-line]
[fixture: venn/lex-gap-title-blank] [fixture: venn/lex-gap-title-comment]
[fixture: venn/lex-gap-title-directive] [fixture:
venn/lex-title-size-number-no-space] `title` followed by a line feed can take
text from the next line. [fixture: venn/db-title-padding] [fixture:
venn/db-title-only-whitespace] [fixture: venn/db-title-value-next-line]
[fixture: venn/lex-gap-title-blank] [fixture: venn/lex-gap-title-comment]
[fixture: venn/lex-gap-title-directive] [fixture:
venn/lex-title-size-number-no-space] [fixture: venn/db-after-title-colon-space]
[fixture: venn/db-after-title-space] [fixture: venn/lex-after-title-tab]
[fixture: venn/lex-after-title-comment]

Color units allow whitespace including line feeds, U+2028, and U+2029 around
channels, but no gap before `(`. [fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/lex-style-value-rgb-unchecked-range] [fixture:
venn/gram-style-value-rgb-space-before-open] [fixture:
venn/db-style-rgb-line-separator] [fixture:
venn/db-style-rgba-paragraph-separator] Channels have no range check. [fixture:
venn/lex-style-value-rgb-multiline] [fixture:
venn/lex-style-value-rgb-unchecked-range] [fixture:
venn/gram-style-value-rgb-space-before-open] [fixture:
venn/db-style-rgb-line-separator] [fixture:
venn/db-style-rgba-paragraph-separator]

Whitespace cannot split a channel run of digits and dots. [fixture:
venn/gram-style-rgb-channel-internal-space]

A color with too few or too many channels is rejected. [fixture:
venn/gram-style-rgb-too-few-channels] [fixture:
venn/gram-style-rgb-too-many-channels] [fixture:
venn/gram-style-rgba-too-few-channels] [fixture:
venn/gram-style-rgba-too-many-channels]

### Comments and swallowed fragments

Common [comment regions](../common.md#comment-lines) are trivia, including
inside multiline strings and labels. [fixture: venn/lex-identifier-comment-line]
[fixture: venn/lex-label-comment-line] [fixture: venn/lex-style-comment-line]
[fixture: venn/lex-text-comment-line] [fixture:
venn/lex-comment-paragraph-separator] [fixture:
venn/lex-label-bare-comment-only] [fixture: venn/lex-label-quoted-comment-only]

A diagram comment starts only where a lexical rule is tried, stops before a line
feed, and does not stop at U+2028 or U+2029. [fixture:
venn/lex-inline-comment-spaced] [fixture: venn/lex-after-set-comment] [fixture:
venn/lex-inline-comment-line-separators] [fixture: venn/lex-after-set-comment]
[fixture: venn/lex-after-set-label-comment] [fixture:
venn/lex-after-set-size-comment] [fixture: venn/db-after-set-label-size-comment]
[fixture: venn/lex-after-union-comment] [fixture:
venn/db-after-union-label-comment] [fixture: venn/db-after-union-size-comment]
[fixture: venn/lex-after-union-label-size-comment] [fixture:
venn/lex-after-text-comment] [fixture: venn/lex-after-text-label-comment]
[fixture: venn/lex-after-text-string-comment] [fixture:
venn/db-after-text-string-label-comment] [fixture:
venn/lex-after-text-number-comment] [fixture: venn/lex-after-indent-comment]
[fixture: venn/db-after-indent-id-label-comment] [fixture:
venn/db-after-indent-string-comment] [fixture:
venn/db-after-indent-string-label-comment] [fixture:
venn/db-after-indent-number-comment] [fixture: venn/lex-after-style-comment]
[fixture: venn/lex-after-style-string-comment] [fixture:
venn/db-after-style-list-comment]

A swallowed non-whitespace prefix is an `ignored-text` unit and a
VennIgnoredText node when the remaining input is accepted. [fixture:
venn/db-grid-comment-header-line] [fixture: venn/lex-style-extra-id-eaten]
[fixture: venn/lex-style-extra-number-eaten] [fixture:
venn/lex-set-extra-id-eaten] [fixture: venn/lex-set-extra-number-eaten]
[fixture: venn/lex-set-colon-eaten] [fixture: venn/header-semicolon-eaten]
[fixture: venn/header-quote-eaten] [fixture: venn/header-open-bracket-eaten]
[fixture: venn/header-nonascii-eaten] [fixture:
venn/lex-text-extra-one-letter-eaten] [fixture: venn/lex-union-extra-id-eaten]
[fixture: venn/lex-style-comment-ignored-next-property-comma] [fixture:
venn/lex-comment-ignored-bracket-label-opener]

A whitespace character swallowed by rule 2 is trivia and makes no node.
[fixture: venn/lex-inline-comment-spaced] [fixture:
venn/lex-bare-percent-between-set-and-text] [fixture:
venn/lex-comment-swallowed-nbsp] [fixture:
venn/lex-comment-swallowed-nbsp-between-statements]

Swallowing a required operand does not make the remaining input valid. [fixture:
venn/lex-inline-comment-eats-id] [fixture:
venn/lex-after-set-size-comment-glued] [fixture:
venn/lex-after-text-number-comment-glued] [fixture:
venn/gram-style-numeric-only-eaten] [fixture:
venn/gram-style-required-key-eaten] [fixture: venn/gram-union-target-eaten]
[fixture: venn/gram-eaten-fragment-between-keyword-and-id] `set A%% c`,
`set A:2%% c`, and `text A 2%% c` are rejected. [fixture:
venn/lex-inline-comment-eats-id] [fixture:
venn/lex-after-set-size-comment-glued] [fixture:
venn/lex-after-text-number-comment-glued] [fixture:
venn/gram-style-numeric-only-eaten] [fixture:
venn/gram-style-required-key-eaten] [fixture: venn/gram-union-target-eaten]
[fixture: venn/gram-eaten-fragment-between-keyword-and-id]

The prefix rule is retried at each unit position. [fixture:
venn/lex-set-two-letter-id-comment] [fixture:
venn/lex-numeric-two-digit-comment] [fixture:
venn/gram-comment-after-directive-eats-id] [fixture:
venn/lex-comment-after-directive-keeps-id] `set AB%% c` and `text A 12%% c` keep
their complete operand, while a directive removed just before `%%` can expose a
one-character operand to swallowing. [fixture:
venn/lex-set-two-letter-id-comment] [fixture:
venn/lex-numeric-two-digit-comment] [fixture:
venn/gram-comment-after-directive-eats-id] [fixture:
venn/lex-comment-after-directive-keeps-id]

### Directives and ignored semicolons

The common
[directive boundary rule](../common.md#a-directive-is-a-token-boundary) rejects
a directive inside a header, keyword, identifier, or number. [fixture:
venn/header-directive-inside] [fixture: venn/lex-directive-in-set] [fixture:
venn/lex-directive-in-union] [fixture: venn/lex-directive-in-text] [fixture:
venn/lex-directive-in-style] [fixture: venn/lex-directive-in-title] [fixture:
venn/db-grid-directive-identifier-bare] [fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key] [fixture:
venn/db-grid-directive-text-number] [fixture:
venn/db-grid-directive-style-value] [fixture: venn/div-directive-union-target]
[fixture: venn/div-directive-text-id] [fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word] [fixture:
venn/div-directive-style-value-number] [fixture:
venn/lex-unterminated-directive-next-line] [fixture:
venn/lex-unterminated-colon-directive-next-line] This includes an identifier or
number inside a bare style value. [fixture: venn/header-directive-inside]
[fixture: venn/lex-directive-in-set] [fixture: venn/lex-directive-in-union]
[fixture: venn/lex-directive-in-text] [fixture: venn/lex-directive-in-style]
[fixture: venn/lex-directive-in-title] [fixture:
venn/db-grid-directive-identifier-bare] [fixture: venn/db-grid-directive-size]
[fixture: venn/db-grid-directive-style-key] [fixture:
venn/db-grid-directive-text-number] [fixture:
venn/db-grid-directive-style-value] [fixture: venn/div-directive-union-target]
[fixture: venn/div-directive-text-id] [fixture: venn/div-directive-style-target]
[fixture: venn/div-directive-style-value-word] [fixture:
venn/div-directive-style-value-number]

Strings, label content, title content, and whole color units are text or string
units that can contain directives. [fixture:
venn/lex-identifier-directive-middle] [fixture:
venn/db-grid-directive-label-bare] [fixture: venn/lex-label-directive-middle]
[fixture: venn/lex-style-directive-middle] [fixture:
venn/lex-title-directive-middle] [fixture: venn/lex-directive-style-value-color]
[fixture: venn/lex-style-value-rgb-directive-in-comma] [fixture:
venn/gram-label-bare-directive-only] [fixture:
venn/lex-label-quoted-directive-only] [fixture:
venn/lex-identifier-directive-only] [fixture:
venn/gram-style-value-directive-only]

Bracket and quote delimiters are separate characters, so a directive between `[`
and the opening quote or between the closing quote and `]` is allowed. [fixture:
venn/lex-directive-label-delimiter-gap] [fixture:
venn/lex-directive-label-closing-delimiter-gap]

The common
[`style` and `classDef` line rule](../common.md#style-and-classdef-lines)
selects its ignored `;` before the diagram units are recognized. [fixture:
venn/lex-identifier-style-rule] [fixture: venn/lex-identifier-style-rule-space]
[fixture: venn/lex-identifier-style-rule-upper] [fixture:
venn/lex-identifier-style-rule-no-hash] [fixture:
venn/lex-identifier-style-rule-other-line] [fixture:
venn/lex-identifier-style-rule-two-semicolons] [fixture:
venn/lex-label-classdef-rule] [fixture: venn/lex-style-style-rule] [fixture:
venn/lex-title-style-rule-two-semicolons] [fixture:
venn/db-grid-entity-style-value]

The line rule ignores only the last `;` of a matching line segment. [fixture:
venn/lex-label-style-rule-three-semicolons] [fixture:
venn/lex-label-style-rule-three-semicolons-space] [fixture:
venn/lex-style-style-rule-three-semicolons] [fixture:
venn/lex-style-style-rule-three-semicolons-tab] [fixture:
venn/gram-title-style-rule-three-semicolons] [fixture:
venn/gram-title-style-rule-three-semicolons-space] [fixture:
venn/lex-identifier-style-rule-three-semicolons] [fixture:
venn/lex-identifier-style-rule-three-semicolons-space] [fixture:
venn/lex-size-selected-semicolon-space] [fixture:
venn/gram-size-two-selected-semicolons-space] [fixture:
venn/gram-size-three-selected-semicolons] [fixture:
venn/lex-identifier-style-rule] [fixture:
venn/lex-identifier-style-rule-two-semicolons]

The selected semicolon has the same unit-boundary restriction as a directive,
including inside bare style-value identifiers and numbers. [fixture:
venn/div-ignored-semicolon-size] [fixture:
venn/div-ignored-semicolon-set-name-selected] [fixture:
venn/div-ignored-semicolon-set-keyword-selected] [fixture:
venn/div-ignored-semicolon-title-keyword-selected] [fixture:
venn/div-ignored-semicolon-style-key-selected] [fixture:
venn/div-ignored-semicolon-style-value-selected] [fixture:
venn/div-ignored-semicolon-text-id-selected] [fixture:
venn/div-ignored-semicolon-text-number-selected] [fixture:
venn/div-ignored-semicolon-style-value-number-selected]

Inside a whole color unit, the selected semicolon is trivia. [fixture:
venn/lex-style-hex-ignored-semicolon] [fixture:
venn/lex-style-rgb-ignored-semicolon]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over the
units named above.

```text
diagram = newline* header ( newline | statement )* end
statement = subset | text | style | title-line | ignored-text
subset = set-keyword name label? ( ":" number )?
        | union-keyword name-list label? ( ":" number )?
name = identifier | string
name-list = name ( "," name )*
label = quoted-label | bare-label
text = text-keyword name-list text-tail
     | implicit-text-start text-tail
text-tail = ( identifier | string ) label? | number
style = style-keyword name-list property ( "," property )*
property = identifier ":" style-value
style-value = string | style-atom+
style-atom = identifier | number | hex-color | rgb-color | rgba-color
```

| Rule                              | Node                |
| --------------------------------- | ------------------- |
| `diagram`                         | VennDiagram         |
| `subset`                          | VennSubsetStatement |
| `text`                            | VennTextStatement   |
| `style`                           | VennStyleStatement  |
| `property`                        | VennStyleProperty   |
| `title-line`                      | VennTitleStatement  |
| `label`                           | VennLabel           |
| bare `style-value`, title content | VennLiteral         |
| `ignored-text`                    | VennIgnoredText     |
| `identifier`                      | Identifier          |
| `string`                          | StringLiteral       |
| size or text-id `number`          | NumericLiteral      |

### Document and statement boundaries

A diagram has exactly one header and may have no statements. [fixture:
venn/header-only] [fixture: venn/header-only-lf] [fixture:
venn/db-same-line-statements] [fixture: venn/header-statement-on-line] [fixture:
venn/header-statement-tab] [fixture: venn/db-title-on-header] [fixture:
venn/header-twice] [fixture: venn/header-twice-same-line] [fixture:
venn/gram-bare-word] Complete statements may share a line, including the header
line. [fixture: venn/header-only] [fixture: venn/header-only-lf] [fixture:
venn/db-same-line-statements] [fixture: venn/header-statement-on-line] [fixture:
venn/header-statement-tab] [fixture: venn/db-title-on-header] [fixture:
venn/header-twice] [fixture: venn/header-twice-same-line] [fixture:
venn/gram-bare-word] [fixture: venn/db-after-set-blank] [fixture:
venn/db-after-set-crlf] [fixture: venn/db-after-set-label-blank] [fixture:
venn/db-after-set-label-crlf] [fixture: venn/db-after-set-size-blank] [fixture:
venn/db-after-set-size-crlf] [fixture: venn/db-after-set-label-size-blank]
[fixture: venn/db-after-set-label-size-crlf] [fixture:
venn/db-after-union-blank] [fixture: venn/db-after-union-crlf] [fixture:
venn/db-after-union-label-blank] [fixture: venn/db-after-union-label-crlf]
[fixture: venn/db-after-union-size-blank] [fixture:
venn/db-after-union-size-crlf] [fixture: venn/db-after-union-label-size-blank]
[fixture: venn/db-after-union-label-size-crlf] [fixture:
venn/db-after-text-id-blank] [fixture: venn/db-after-text-id-crlf] [fixture:
venn/db-after-text-id-label-blank] [fixture: venn/db-after-text-id-label-crlf]
[fixture: venn/db-after-text-string-blank] [fixture:
venn/db-after-text-string-crlf] [fixture: venn/db-after-text-string-label-blank]
[fixture: venn/db-after-text-string-label-crlf] [fixture:
venn/db-after-text-number-blank] [fixture: venn/db-after-text-number-crlf]
[fixture: venn/db-after-indent-id-blank] [fixture: venn/db-after-indent-id-crlf]
[fixture: venn/db-after-indent-id-label-blank] [fixture:
venn/db-after-indent-id-label-crlf] [fixture: venn/db-after-indent-string-blank]
[fixture: venn/db-after-indent-string-crlf] [fixture:
venn/db-after-indent-string-label-blank] [fixture:
venn/db-after-indent-string-label-crlf] [fixture:
venn/db-after-indent-number-blank] [fixture: venn/db-after-indent-number-crlf]
[fixture: venn/db-after-style-blank] [fixture: venn/db-after-style-crlf]
[fixture: venn/db-after-style-string-blank] [fixture:
venn/db-after-style-string-crlf] [fixture: venn/db-after-style-list-blank]
[fixture: venn/db-after-style-list-crlf] [fixture: venn/db-after-title-blank]
[fixture: venn/db-after-title-crlf]

A title takes the rest of its permitted line text, so `title T set A` contains
no set statement. [fixture: venn/lex-title-back-to-back-set-not-statement]

A newline cannot separate the units of a non-title statement unless it is inside
a string, label, or color unit. [fixture: venn/lex-gap-set-lf] [fixture:
venn/lex-gap-set-blank] [fixture: venn/lex-gap-set-comment] [fixture:
venn/lex-gap-set-directive] [fixture: venn/lex-gap-union-lf] [fixture:
venn/lex-gap-text-lf] [fixture: venn/lex-gap-style-lf] [fixture:
venn/gram-size-newline] [fixture: venn/lex-label-blank-line] [fixture:
venn/lex-identifier-blank-line] [fixture: venn/lex-style-blank-line] [fixture:
venn/lex-text-blank-line] [fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/gram-set-label-next-line] [fixture:
venn/gram-set-label-comment-gap] [fixture: venn/gram-set-label-directive-gap]
[fixture: venn/gram-set-label-blank-gap] [fixture: venn/gram-set-label-crlf-gap]
[fixture: venn/gram-set-label-size-label-next-line] [fixture:
venn/gram-set-label-size-label-comment-gap] [fixture:
venn/gram-set-label-size-label-directive-gap] [fixture:
venn/gram-set-label-size-label-blank-gap] [fixture:
venn/gram-set-label-size-label-crlf-gap] [fixture: venn/gram-set-size-next-line]
[fixture: venn/gram-set-size-comment-gap] [fixture:
venn/gram-set-size-directive-gap] [fixture: venn/gram-set-size-blank-gap]
[fixture: venn/gram-set-size-crlf-gap] [fixture:
venn/gram-set-label-size-size-next-line] [fixture:
venn/gram-set-label-size-size-comment-gap] [fixture:
venn/gram-set-label-size-size-directive-gap] [fixture:
venn/gram-set-label-size-size-blank-gap] [fixture:
venn/gram-set-label-size-size-crlf-gap] [fixture:
venn/gram-union-label-next-line] [fixture: venn/gram-union-label-comment-gap]
[fixture: venn/gram-union-label-directive-gap] [fixture:
venn/gram-union-label-blank-gap] [fixture: venn/gram-union-label-crlf-gap]
[fixture: venn/gram-union-label-size-label-next-line] [fixture:
venn/gram-union-label-size-label-comment-gap] [fixture:
venn/gram-union-label-size-label-directive-gap] [fixture:
venn/gram-union-label-size-label-blank-gap] [fixture:
venn/gram-union-label-size-label-crlf-gap] [fixture:
venn/gram-union-size-next-line] [fixture: venn/gram-union-size-comment-gap]
[fixture: venn/gram-union-size-directive-gap] [fixture:
venn/gram-union-size-blank-gap] [fixture: venn/gram-union-size-crlf-gap]
[fixture: venn/gram-union-label-size-size-next-line] [fixture:
venn/gram-union-label-size-size-comment-gap] [fixture:
venn/gram-union-label-size-size-directive-gap] [fixture:
venn/gram-union-label-size-size-blank-gap] [fixture:
venn/gram-union-label-size-size-crlf-gap] [fixture:
venn/gram-text-target-id-next-line] [fixture:
venn/gram-text-target-id-comment-gap] [fixture:
venn/gram-text-target-id-directive-gap] [fixture:
venn/gram-text-target-id-blank-gap] [fixture: venn/gram-text-target-id-crlf-gap]
[fixture: venn/gram-text-target-string-next-line] [fixture:
venn/gram-text-target-string-comment-gap] [fixture:
venn/gram-text-target-string-directive-gap] [fixture:
venn/gram-text-target-string-blank-gap] [fixture:
venn/gram-text-target-string-crlf-gap] [fixture:
venn/gram-text-target-number-next-line] [fixture:
venn/gram-text-target-number-comment-gap] [fixture:
venn/gram-text-target-number-directive-gap] [fixture:
venn/gram-text-target-number-blank-gap] [fixture:
venn/gram-text-target-number-crlf-gap] [fixture:
venn/gram-text-id-label-next-line] [fixture:
venn/gram-text-id-label-comment-gap] [fixture:
venn/gram-text-id-label-directive-gap] [fixture:
venn/gram-text-id-label-blank-gap] [fixture: venn/gram-text-id-label-crlf-gap]
[fixture: venn/gram-text-string-label-next-line] [fixture:
venn/gram-text-string-label-comment-gap] [fixture:
venn/gram-text-string-label-directive-gap] [fixture:
venn/gram-text-string-label-blank-gap] [fixture:
venn/gram-text-string-label-crlf-gap] [fixture:
venn/gram-indent-keyword-id-next-line] [fixture:
venn/gram-indent-keyword-id-comment-gap] [fixture:
venn/gram-indent-keyword-id-directive-gap] [fixture:
venn/gram-indent-keyword-id-blank-gap] [fixture:
venn/gram-indent-keyword-id-crlf-gap] [fixture:
venn/gram-indent-keyword-string-next-line] [fixture:
venn/gram-indent-keyword-string-comment-gap] [fixture:
venn/gram-indent-keyword-string-directive-gap] [fixture:
venn/gram-indent-keyword-string-blank-gap] [fixture:
venn/gram-indent-keyword-string-crlf-gap] [fixture:
venn/gram-indent-keyword-number-next-line] [fixture:
venn/gram-indent-keyword-number-comment-gap] [fixture:
venn/gram-indent-keyword-number-directive-gap] [fixture:
venn/gram-indent-keyword-number-blank-gap] [fixture:
venn/gram-indent-keyword-number-crlf-gap] [fixture:
venn/gram-indent-id-label-next-line] [fixture:
venn/gram-indent-id-label-comment-gap] [fixture:
venn/gram-indent-id-label-directive-gap] [fixture:
venn/gram-indent-id-label-blank-gap] [fixture:
venn/gram-indent-id-label-crlf-gap] [fixture:
venn/gram-indent-string-label-next-line] [fixture:
venn/gram-indent-string-label-comment-gap] [fixture:
venn/gram-indent-string-label-directive-gap] [fixture:
venn/gram-indent-string-label-blank-gap] [fixture:
venn/gram-indent-string-label-crlf-gap] [fixture:
venn/gram-set-colon-size-comment-gap] [fixture:
venn/gram-set-colon-size-directive-gap] [fixture:
venn/gram-set-colon-size-blank-gap] [fixture: venn/gram-set-colon-size-crlf-gap]
[fixture: venn/gram-set-label-colon-size-next-line] [fixture:
venn/gram-set-label-colon-size-comment-gap] [fixture:
venn/gram-set-label-colon-size-directive-gap] [fixture:
venn/gram-set-label-colon-size-blank-gap] [fixture:
venn/gram-set-label-colon-size-crlf-gap] [fixture:
venn/gram-union-colon-size-next-line] [fixture:
venn/gram-union-colon-size-comment-gap] [fixture:
venn/gram-union-colon-size-directive-gap] [fixture:
venn/gram-union-colon-size-blank-gap] [fixture:
venn/gram-union-colon-size-crlf-gap] [fixture:
venn/gram-union-label-colon-size-next-line] [fixture:
venn/gram-union-label-colon-size-comment-gap] [fixture:
venn/gram-union-label-colon-size-directive-gap] [fixture:
venn/gram-union-label-colon-size-blank-gap] [fixture:
venn/gram-union-label-colon-size-crlf-gap] [fixture:
venn/gram-style-target-property-next-line] [fixture:
venn/gram-style-target-property-comment-gap] [fixture:
venn/gram-style-target-property-directive-gap] [fixture:
venn/gram-style-target-property-blank-gap] [fixture:
venn/gram-style-target-property-crlf-gap] [fixture:
venn/gram-style-property-colon-next-line] [fixture:
venn/gram-style-property-colon-comment-gap] [fixture:
venn/gram-style-property-colon-directive-gap] [fixture:
venn/gram-style-property-colon-blank-gap] [fixture:
venn/gram-style-property-colon-crlf-gap] [fixture:
venn/gram-style-colon-value-next-line] [fixture:
venn/gram-style-colon-value-comment-gap] [fixture:
venn/gram-style-colon-value-directive-gap] [fixture:
venn/gram-style-colon-value-blank-gap] [fixture:
venn/gram-style-colon-value-crlf-gap] [fixture:
venn/gram-comment-extra-id-before-existing-label]

Spaces and tabs may separate arguments and optional suffixes. [fixture:
venn/db-set-label-space] [fixture: venn/db-set-label-tab] [fixture:
venn/db-set-colon-size-inline-directive] [fixture:
venn/gram-text-target-id-inline-directive] [fixture:
venn/db-text-target-string-inline-directive] [fixture:
venn/gram-style-target-property-inline-directive] [fixture:
venn/db-style-property-colon-inline-directive] [fixture:
venn/db-style-colon-value-inline-directive] [fixture:
venn/db-set-label-size-label-space] [fixture: venn/db-set-label-size-label-tab]
[fixture: venn/db-set-size-space] [fixture: venn/db-set-size-tab] [fixture:
venn/db-set-label-size-size-space] [fixture: venn/db-set-label-size-size-tab]
[fixture: venn/db-union-label-space] [fixture: venn/db-union-label-tab]
[fixture: venn/db-union-label-size-label-space] [fixture:
venn/db-union-label-size-label-tab] [fixture: venn/db-union-size-space]
[fixture: venn/db-union-size-tab] [fixture: venn/db-union-label-size-size-space]
[fixture: venn/db-union-label-size-size-tab] [fixture:
venn/db-text-target-id-tab] [fixture: venn/db-text-target-string-space]
[fixture: venn/db-text-target-string-tab] [fixture:
venn/db-text-target-number-space] [fixture: venn/db-text-target-number-tab]
[fixture: venn/db-text-id-label-space] [fixture: venn/db-text-id-label-tab]
[fixture: venn/db-text-string-label-space] [fixture:
venn/db-text-string-label-tab] [fixture: venn/db-indent-keyword-id-tab]
[fixture: venn/db-indent-keyword-string-space] [fixture:
venn/db-indent-keyword-string-tab] [fixture:
venn/db-indent-keyword-number-space] [fixture:
venn/db-indent-keyword-number-tab] [fixture: venn/db-indent-id-label-space]
[fixture: venn/db-indent-id-label-tab] [fixture:
venn/db-indent-string-label-space] [fixture: venn/db-indent-string-label-tab]
[fixture: venn/db-set-colon-size-tab] [fixture:
venn/db-set-label-colon-size-space] [fixture: venn/db-set-label-colon-size-tab]
[fixture: venn/db-union-colon-size-space] [fixture:
venn/db-union-colon-size-tab] [fixture: venn/db-union-label-colon-size-space]
[fixture: venn/db-union-label-colon-size-tab] [fixture:
venn/db-style-target-property-space] [fixture:
venn/db-style-target-property-tab] [fixture: venn/db-style-property-colon-space]
[fixture: venn/db-style-property-colon-tab] [fixture:
venn/db-style-colon-value-space] [fixture: venn/db-style-colon-value-tab]
[fixture: venn/db-set-label-inline-directive] [fixture:
venn/db-set-label-size-label-inline-directive] [fixture:
venn/db-set-size-inline-directive] [fixture:
venn/db-set-label-size-size-inline-directive] [fixture:
venn/db-union-label-inline-directive] [fixture:
venn/db-union-label-size-label-inline-directive] [fixture:
venn/db-union-size-inline-directive] [fixture:
venn/db-union-label-size-size-inline-directive] [fixture:
venn/gram-text-target-number-inline-directive] [fixture:
venn/db-text-id-label-inline-directive] [fixture:
venn/db-text-string-label-inline-directive] [fixture:
venn/gram-indent-keyword-id-inline-directive] [fixture:
venn/db-indent-keyword-string-inline-directive] [fixture:
venn/gram-indent-keyword-number-inline-directive] [fixture:
venn/db-indent-id-label-inline-directive] [fixture:
venn/db-indent-string-label-inline-directive] [fixture:
venn/db-set-label-colon-size-inline-directive] [fixture:
venn/db-union-colon-size-inline-directive] [fixture:
venn/db-union-label-colon-size-inline-directive] An inline directive between
complete units supplies no separating space. [fixture: venn/db-set-label-space]
[fixture: venn/db-set-label-tab] [fixture:
venn/db-set-colon-size-inline-directive] [fixture:
venn/gram-text-target-id-inline-directive] [fixture:
venn/db-text-target-string-inline-directive] [fixture:
venn/gram-style-target-property-inline-directive] [fixture:
venn/db-style-property-colon-inline-directive] [fixture:
venn/db-style-colon-value-inline-directive] [fixture:
venn/db-set-label-size-label-space] [fixture: venn/db-set-label-size-label-tab]
[fixture: venn/db-set-size-space] [fixture: venn/db-set-size-tab] [fixture:
venn/db-set-label-size-size-space] [fixture: venn/db-set-label-size-size-tab]
[fixture: venn/db-union-label-space] [fixture: venn/db-union-label-tab]
[fixture: venn/db-union-label-size-label-space] [fixture:
venn/db-union-label-size-label-tab] [fixture: venn/db-union-size-space]
[fixture: venn/db-union-size-tab] [fixture: venn/db-union-label-size-size-space]
[fixture: venn/db-union-label-size-size-tab] [fixture:
venn/db-text-target-id-tab] [fixture: venn/db-text-target-string-space]
[fixture: venn/db-text-target-string-tab] [fixture:
venn/db-text-target-number-space] [fixture: venn/db-text-target-number-tab]
[fixture: venn/db-text-id-label-space] [fixture: venn/db-text-id-label-tab]
[fixture: venn/db-text-string-label-space] [fixture:
venn/db-text-string-label-tab] [fixture: venn/db-indent-keyword-id-tab]
[fixture: venn/db-indent-keyword-string-space] [fixture:
venn/db-indent-keyword-string-tab] [fixture:
venn/db-indent-keyword-number-space] [fixture:
venn/db-indent-keyword-number-tab] [fixture: venn/db-indent-id-label-space]
[fixture: venn/db-indent-id-label-tab] [fixture:
venn/db-indent-string-label-space] [fixture: venn/db-indent-string-label-tab]
[fixture: venn/db-set-colon-size-tab] [fixture:
venn/db-set-label-colon-size-space] [fixture: venn/db-set-label-colon-size-tab]
[fixture: venn/db-union-colon-size-space] [fixture:
venn/db-union-colon-size-tab] [fixture: venn/db-union-label-colon-size-space]
[fixture: venn/db-union-label-colon-size-tab] [fixture:
venn/db-style-target-property-space] [fixture:
venn/db-style-target-property-tab] [fixture: venn/db-style-property-colon-space]
[fixture: venn/db-style-property-colon-tab] [fixture:
venn/db-style-colon-value-space] [fixture: venn/db-style-colon-value-tab]
[fixture: venn/db-set-label-inline-directive] [fixture:
venn/db-set-label-size-label-inline-directive] [fixture:
venn/db-set-size-inline-directive] [fixture:
venn/db-set-label-size-size-inline-directive] [fixture:
venn/db-union-label-inline-directive] [fixture:
venn/db-union-label-size-label-inline-directive] [fixture:
venn/db-union-size-inline-directive] [fixture:
venn/db-union-label-size-size-inline-directive] [fixture:
venn/gram-text-target-number-inline-directive] [fixture:
venn/db-text-id-label-inline-directive] [fixture:
venn/db-text-string-label-inline-directive] [fixture:
venn/gram-indent-keyword-id-inline-directive] [fixture:
venn/db-indent-keyword-string-inline-directive] [fixture:
venn/gram-indent-keyword-number-inline-directive] [fixture:
venn/db-indent-id-label-inline-directive] [fixture:
venn/db-indent-string-label-inline-directive] [fixture:
venn/db-set-label-colon-size-inline-directive] [fixture:
venn/db-union-colon-size-inline-directive] [fixture:
venn/db-union-label-colon-size-inline-directive]

An unclosed directive follows the common directive rule. [fixture:
venn/lex-after-set-directive-unclosed] [fixture:
venn/lex-after-set-directive-word-unclosed] [fixture:
venn/db-set-label-unclosed-directive-gap] [fixture:
venn/gram-set-colon-size-unclosed-directive-gap] [fixture:
venn/gram-text-target-id-unclosed-directive-gap] [fixture:
venn/gram-style-colon-value-unclosed-directive-gap] [fixture:
venn/db-set-label-size-label-unclosed-directive-gap] [fixture:
venn/db-set-size-unclosed-directive-gap] [fixture:
venn/db-set-label-size-size-unclosed-directive-gap] [fixture:
venn/db-union-label-unclosed-directive-gap] [fixture:
venn/db-union-label-size-label-unclosed-directive-gap] [fixture:
venn/db-union-size-unclosed-directive-gap] [fixture:
venn/db-union-label-size-size-unclosed-directive-gap] [fixture:
venn/gram-text-target-string-unclosed-directive-gap] [fixture:
venn/gram-text-target-number-unclosed-directive-gap] [fixture:
venn/db-text-id-label-unclosed-directive-gap] [fixture:
venn/db-text-string-label-unclosed-directive-gap] [fixture:
venn/gram-indent-keyword-id-unclosed-directive-gap] [fixture:
venn/gram-indent-keyword-string-unclosed-directive-gap] [fixture:
venn/gram-indent-keyword-number-unclosed-directive-gap] [fixture:
venn/db-indent-id-label-unclosed-directive-gap] [fixture:
venn/db-indent-string-label-unclosed-directive-gap] [fixture:
venn/gram-set-label-colon-size-unclosed-directive-gap] [fixture:
venn/gram-union-colon-size-unclosed-directive-gap] [fixture:
venn/gram-union-label-colon-size-unclosed-directive-gap] [fixture:
venn/gram-style-target-property-unclosed-directive-gap] [fixture:
venn/gram-style-property-colon-unclosed-directive-gap] A preceding complete
statement remains accepted, but a missing required operand is rejected.
[fixture: venn/lex-after-set-directive-unclosed] [fixture:
venn/lex-after-set-directive-word-unclosed] [fixture:
venn/db-set-label-unclosed-directive-gap] [fixture:
venn/gram-set-colon-size-unclosed-directive-gap] [fixture:
venn/gram-text-target-id-unclosed-directive-gap] [fixture:
venn/gram-style-colon-value-unclosed-directive-gap] [fixture:
venn/db-set-label-size-label-unclosed-directive-gap] [fixture:
venn/db-set-size-unclosed-directive-gap] [fixture:
venn/db-set-label-size-size-unclosed-directive-gap] [fixture:
venn/db-union-label-unclosed-directive-gap] [fixture:
venn/db-union-label-size-label-unclosed-directive-gap] [fixture:
venn/db-union-size-unclosed-directive-gap] [fixture:
venn/db-union-label-size-size-unclosed-directive-gap] [fixture:
venn/gram-text-target-string-unclosed-directive-gap] [fixture:
venn/gram-text-target-number-unclosed-directive-gap] [fixture:
venn/db-text-id-label-unclosed-directive-gap] [fixture:
venn/db-text-string-label-unclosed-directive-gap] [fixture:
venn/gram-indent-keyword-id-unclosed-directive-gap] [fixture:
venn/gram-indent-keyword-string-unclosed-directive-gap] [fixture:
venn/gram-indent-keyword-number-unclosed-directive-gap] [fixture:
venn/db-indent-id-label-unclosed-directive-gap] [fixture:
venn/db-indent-string-label-unclosed-directive-gap] [fixture:
venn/gram-set-label-colon-size-unclosed-directive-gap] [fixture:
venn/gram-union-colon-size-unclosed-directive-gap] [fixture:
venn/gram-union-label-colon-size-unclosed-directive-gap] [fixture:
venn/gram-style-target-property-unclosed-directive-gap] [fixture:
venn/gram-style-property-colon-unclosed-directive-gap] [fixture:
venn/lex-after-set-directive] [fixture: venn/lex-after-set-label-directive]
[fixture: venn/lex-after-set-size-directive] [fixture:
venn/db-after-set-label-size-directive] [fixture:
venn/db-after-set-label-size-unclosed-directive] [fixture:
venn/lex-after-union-directive] [fixture: venn/db-after-union-label-directive]
[fixture: venn/db-after-union-label-unclosed-directive] [fixture:
venn/db-after-union-size-directive] [fixture:
venn/db-after-union-size-unclosed-directive] [fixture:
venn/lex-after-union-label-size-directive] [fixture:
venn/lex-after-text-directive] [fixture: venn/lex-after-text-label-directive]
[fixture: venn/lex-after-text-string-directive] [fixture:
venn/db-after-text-string-label-directive] [fixture:
venn/db-after-text-string-label-unclosed-directive] [fixture:
venn/lex-after-text-number-directive] [fixture: venn/lex-after-indent-directive]
[fixture: venn/db-after-indent-id-label-directive] [fixture:
venn/db-after-indent-id-label-unclosed-directive] [fixture:
venn/db-after-indent-string-directive] [fixture:
venn/db-after-indent-string-unclosed-directive] [fixture:
venn/db-after-indent-string-label-directive] [fixture:
venn/db-after-indent-string-label-unclosed-directive] [fixture:
venn/db-after-indent-number-directive] [fixture:
venn/db-after-indent-number-unclosed-directive] [fixture:
venn/lex-after-style-directive] [fixture: venn/lex-after-style-string-directive]
[fixture: venn/db-after-style-list-directive] [fixture:
venn/db-after-style-list-unclosed-directive] [fixture:
venn/lex-after-title-directive]

A semicolon is not a statement separator. [fixture: venn/header-semicolon]
[fixture: venn/header-semicolon-spaced] [fixture: venn/lex-after-set-semicolon]
[fixture: venn/lex-after-set-double-semicolon] [fixture:
venn/lex-after-text-semicolon] [fixture: venn/lex-after-style-semicolon]
[fixture: venn/lex-after-title-semicolon] [fixture: venn/header-semicolon-eaten]
[fixture: venn/db-after-style-hex-semicolon] [fixture:
venn/db-after-style-hex-semicolon-spaced] [fixture:
venn/gram-after-style-hex-double-semicolon] An unselected semicolon outside a
value is rejected unless the comment-prefix rule swallows it. [fixture:
venn/header-semicolon] [fixture: venn/header-semicolon-spaced] [fixture:
venn/lex-after-set-semicolon] [fixture: venn/lex-after-set-double-semicolon]
[fixture: venn/lex-after-text-semicolon] [fixture:
venn/lex-after-style-semicolon] [fixture: venn/lex-after-title-semicolon]
[fixture: venn/header-semicolon-eaten] [fixture:
venn/db-after-style-hex-semicolon] [fixture:
venn/db-after-style-hex-semicolon-spaced] [fixture:
venn/gram-after-style-hex-double-semicolon] [fixture:
venn/lex-after-set-semicolon] [fixture: venn/lex-after-set-semicolon-spaced]
[fixture: venn/lex-after-set-double-semicolon] [fixture:
venn/gram-after-set-spaced-semicolons] [fixture:
venn/lex-after-set-label-semicolon] [fixture:
venn/lex-after-set-label-semicolon-spaced] [fixture:
venn/lex-after-set-label-double-semicolon] [fixture:
venn/gram-after-set-label-spaced-semicolons] [fixture:
venn/lex-after-set-size-semicolon] [fixture:
venn/lex-after-set-size-semicolon-spaced] [fixture:
venn/lex-after-set-size-double-semicolon] [fixture:
venn/gram-after-set-size-spaced-semicolons] [fixture:
venn/gram-after-set-label-size-semicolon] [fixture:
venn/gram-after-set-label-size-semicolon-spaced] [fixture:
venn/gram-after-set-label-size-double-semicolon] [fixture:
venn/gram-after-set-label-size-spaced-semicolons] [fixture:
venn/lex-after-union-semicolon] [fixture: venn/lex-after-union-semicolon-spaced]
[fixture: venn/lex-after-union-double-semicolon] [fixture:
venn/gram-after-union-spaced-semicolons] [fixture:
venn/gram-after-union-label-semicolon] [fixture:
venn/gram-after-union-label-semicolon-spaced] [fixture:
venn/gram-after-union-label-double-semicolon] [fixture:
venn/gram-after-union-label-spaced-semicolons] [fixture:
venn/gram-after-union-size-semicolon] [fixture:
venn/gram-after-union-size-semicolon-spaced] [fixture:
venn/gram-after-union-size-double-semicolon] [fixture:
venn/gram-after-union-size-spaced-semicolons] [fixture:
venn/lex-after-union-label-size-semicolon] [fixture:
venn/lex-after-union-label-size-semicolon-spaced] [fixture:
venn/lex-after-union-label-size-double-semicolon] [fixture:
venn/gram-after-union-label-size-spaced-semicolons] [fixture:
venn/lex-after-text-semicolon] [fixture: venn/lex-after-text-semicolon-spaced]
[fixture: venn/lex-after-text-double-semicolon] [fixture:
venn/gram-after-text-id-spaced-semicolons] [fixture:
venn/lex-after-text-label-semicolon] [fixture:
venn/lex-after-text-label-semicolon-spaced] [fixture:
venn/lex-after-text-label-double-semicolon] [fixture:
venn/gram-after-text-id-label-spaced-semicolons] [fixture:
venn/lex-after-text-string-semicolon] [fixture:
venn/lex-after-text-string-semicolon-spaced] [fixture:
venn/lex-after-text-string-double-semicolon] [fixture:
venn/gram-after-text-string-spaced-semicolons] [fixture:
venn/gram-after-text-string-label-semicolon] [fixture:
venn/gram-after-text-string-label-semicolon-spaced] [fixture:
venn/gram-after-text-string-label-double-semicolon] [fixture:
venn/gram-after-text-string-label-spaced-semicolons] [fixture:
venn/lex-after-text-number-semicolon] [fixture:
venn/lex-after-text-number-semicolon-spaced] [fixture:
venn/lex-after-text-number-double-semicolon] [fixture:
venn/gram-after-text-number-spaced-semicolons] [fixture:
venn/lex-after-indent-semicolon] [fixture:
venn/lex-after-indent-semicolon-spaced] [fixture:
venn/lex-after-indent-double-semicolon] [fixture:
venn/gram-after-indent-id-spaced-semicolons] [fixture:
venn/gram-after-indent-id-label-semicolon] [fixture:
venn/gram-after-indent-id-label-semicolon-spaced] [fixture:
venn/gram-after-indent-id-label-double-semicolon] [fixture:
venn/gram-after-indent-id-label-spaced-semicolons] [fixture:
venn/gram-after-indent-string-semicolon] [fixture:
venn/gram-after-indent-string-semicolon-spaced] [fixture:
venn/gram-after-indent-string-double-semicolon] [fixture:
venn/gram-after-indent-string-spaced-semicolons] [fixture:
venn/gram-after-indent-string-label-semicolon] [fixture:
venn/gram-after-indent-string-label-semicolon-spaced] [fixture:
venn/gram-after-indent-string-label-double-semicolon] [fixture:
venn/gram-after-indent-string-label-spaced-semicolons] [fixture:
venn/gram-after-indent-number-semicolon] [fixture:
venn/gram-after-indent-number-semicolon-spaced] [fixture:
venn/gram-after-indent-number-double-semicolon] [fixture:
venn/gram-after-indent-number-spaced-semicolons] [fixture:
venn/lex-after-style-semicolon] [fixture: venn/lex-after-style-semicolon-spaced]
[fixture: venn/lex-after-style-double-semicolon] [fixture:
venn/gram-after-style-spaced-semicolons] [fixture:
venn/lex-after-style-string-semicolon] [fixture:
venn/lex-after-style-string-semicolon-spaced] [fixture:
venn/lex-after-style-string-double-semicolon] [fixture:
venn/gram-after-style-string-spaced-semicolons] [fixture:
venn/gram-after-style-list-semicolon] [fixture:
venn/gram-after-style-list-semicolon-spaced] [fixture:
venn/gram-after-style-list-double-semicolon] [fixture:
venn/gram-after-style-list-spaced-semicolons] [fixture:
venn/lex-after-title-semicolon] [fixture: venn/lex-after-title-semicolon-spaced]
[fixture: venn/lex-after-title-double-semicolon] [fixture:
venn/gram-after-title-spaced-semicolons]

A `":"` unit cannot end a statement. [fixture: venn/gram-after-set-colon-space]
[fixture: venn/gram-after-set-label-colon-space] [fixture:
venn/gram-after-set-size-colon-space] [fixture:
venn/gram-after-set-label-size-colon-space] [fixture:
venn/gram-after-union-colon-space] [fixture:
venn/gram-after-union-label-colon-space] [fixture:
venn/gram-after-union-size-colon-space] [fixture:
venn/gram-after-union-label-size-colon-space] [fixture:
venn/gram-after-text-id-colon-space] [fixture:
venn/gram-after-text-id-label-colon-space] [fixture:
venn/gram-after-text-string-colon-space] [fixture:
venn/gram-after-text-string-label-colon-space] [fixture:
venn/gram-after-text-number-colon-space] [fixture:
venn/gram-after-indent-id-colon-space] [fixture:
venn/gram-after-indent-id-label-colon-space] [fixture:
venn/gram-after-indent-string-colon-space] [fixture:
venn/gram-after-indent-string-label-colon-space] [fixture:
venn/gram-after-indent-number-colon-space] [fixture:
venn/gram-after-style-colon-space] [fixture:
venn/gram-after-style-string-colon-space] [fixture:
venn/gram-after-style-list-colon-space] [fixture:
venn/db-after-title-colon-space]

The end of text supplies the common appended line feed. [fixture:
venn/header-only] [fixture: venn/header-only-lf] [fixture: venn/db-set-eof]
[fixture: venn/db-set-label-eof] [fixture: venn/db-set-size-eof] [fixture:
venn/db-set-label-size-eof] [fixture: venn/db-union-eof] [fixture:
venn/db-union-label-eof] [fixture: venn/db-union-size-eof] [fixture:
venn/db-union-label-size-eof] [fixture: venn/db-text-id-eof] [fixture:
venn/db-text-id-label-eof] [fixture: venn/db-text-string-eof] [fixture:
venn/db-text-string-label-eof] [fixture: venn/db-text-number-eof] [fixture:
venn/db-indent-id-eof] [fixture: venn/db-indent-id-label-eof] [fixture:
venn/db-indent-string-eof] [fixture: venn/db-indent-string-label-eof] [fixture:
venn/db-indent-number-eof] [fixture: venn/db-style-eof] [fixture:
venn/db-style-string-eof] [fixture: venn/db-style-list-eof] [fixture:
venn/db-title-eof]

### Subsets and name lists

`set` takes one name; `union` takes at least two names separated by commas.
[fixture: venn/db-form-set] [fixture: venn/db-form-union] [fixture:
venn/gram-set-list] [fixture: venn/gram-union-one] [fixture:
venn/gram-extra-set-no-id] [fixture: venn/gram-extra-union-no-id]

Each subset may have a bracket label, then a colon and numeric size, or either
suffix alone. [fixture: venn/db-form-set-label] [fixture: venn/db-form-set-size]
[fixture: venn/db-form-set-label-size] [fixture: venn/db-form-union-label]
[fixture: venn/db-form-union-size] [fixture: venn/db-form-union-label-size]
[fixture: venn/gram-subset-label-after-size] A label after a size is rejected.
[fixture: venn/db-form-set-label] [fixture: venn/db-form-set-size] [fixture:
venn/db-form-set-label-size] [fixture: venn/db-form-union-label] [fixture:
venn/db-form-union-size] [fixture: venn/db-form-union-label-size] [fixture:
venn/gram-subset-label-after-size]

A name list is nonempty, keeps order and repeated names, and has no empty item
or trailing comma. [fixture: venn/db-union-repeated-member] [fixture:
venn/db-text-comma-list] [fixture: venn/gram-name-list-empty] [fixture:
venn/gram-union-trailing-comma] [fixture: venn/gram-style-trailing-comma]
[fixture: venn/gram-repeated-target-lists] [fixture:
venn/gram-name-list-empty-middle]

A newline, an empty line, a comment-ending line feed, CRLF, or U+2028 between a
comma and the next name is rejected. [fixture:
venn/gram-name-list-comma-comment-gap] [fixture:
venn/gram-name-list-comma-blank-gap] [fixture:
venn/gram-name-list-comma-crlf-gap] [fixture:
venn/gram-name-list-comma-line-separator]

A directive may lie on either side of a name-list comma. [fixture:
venn/lex-name-list-comma-directive]

A name is bare or double-quoted, never numeric. [fixture: venn/db-form-set]
[fixture: venn/db-empty-identifiers] [fixture: venn/gram-set-numeric-name]
[fixture: venn/gram-text-numeric-target] An empty quoted name is accepted.
[fixture: venn/db-form-set] [fixture: venn/db-empty-identifiers] [fixture:
venn/gram-set-numeric-name] [fixture: venn/gram-text-numeric-target]

A size must be one numeric unit. [fixture: venn/gram-size-empty] [fixture:
venn/gram-size-exponent] [fixture: venn/gram-size-trailing-point] [fixture:
venn/gram-size-hex] [fixture: venn/gram-size-infinity] [fixture:
venn/gram-size-nan] [fixture: venn/gram-size-fullwidth] [fixture:
venn/gram-size-suffix] Exponents, a trailing dot, hexadecimal notation, `NaN`,
`Infinity`, non-ASCII digits, and a trailing identifier are rejected. [fixture:
venn/gram-size-empty] [fixture: venn/gram-size-exponent] [fixture:
venn/gram-size-trailing-point] [fixture: venn/gram-size-hex] [fixture:
venn/gram-size-infinity] [fixture: venn/gram-size-nan] [fixture:
venn/gram-size-fullwidth] [fixture: venn/gram-size-suffix]

### Text and implicit text mode

Explicit `text` has a target-name list and an identifier, string, or number as
its id. [fixture: venn/db-form-text-id] [fixture: venn/db-form-text-string]
[fixture: venn/db-form-text-number] [fixture: venn/db-form-text-id-label]
[fixture: venn/db-form-text-string-label] [fixture: venn/gram-text-no-id]
[fixture: venn/gram-size-numeric-label] Only identifier and string ids may have
a bracket label. [fixture: venn/db-form-text-id] [fixture:
venn/db-form-text-string] [fixture: venn/db-form-text-number] [fixture:
venn/db-form-text-id-label] [fixture: venn/db-form-text-string-label] [fixture:
venn/gram-text-no-id] [fixture: venn/gram-size-numeric-label]

Implicit text has the same id and label alternatives and no written targets.
[fixture: venn/db-form-indent-id] [fixture: venn/db-form-indent-string]
[fixture: venn/db-form-indent-number] [fixture: venn/db-form-indent-id-label]
[fixture: venn/db-form-indent-string-label]

Every completed `set` or `union` enables implicit text mode for that
declaration. [fixture: venn/db-indent-after-set] [fixture:
venn/db-indent-after-indented-set] [fixture: venn/db-indent-after-header-set]
[fixture: venn/db-indent-after-union] [fixture:
venn/db-indent-after-indented-union]

Only positive ASCII space or tab indentation before bounded `text` at line start
selects implicit text. [fixture: venn/db-indent-width] [fixture:
venn/db-form-indent-id] [fixture: venn/gram-indent-text-prefix] [fixture:
venn/gram-extra-indent-nonindent-text] Indentation width has no further meaning.
[fixture: venn/db-indent-width] [fixture: venn/db-form-indent-id] [fixture:
venn/gram-indent-text-prefix] [fixture: venn/gram-extra-indent-nonindent-text]

After a newline unit, an ordinary statement start disables the mode unless the
enabled implicit marker is selected first. [fixture:
venn/gram-indent-after-style] [fixture: venn/gram-indent-after-title] [fixture:
venn/gram-extra-indent-indented-style] [fixture:
venn/gram-indent-after-indented-title] [fixture:
venn/db-indent-after-indented-set] [fixture:
venn/gram-indent-set-explicit-text-blank-comment] [fixture:
venn/gram-indent-set-style-blank-comment] [fixture:
venn/gram-indent-union-explicit-text-blank-comment] [fixture:
venn/gram-indent-union-style-blank-comment]

A style, explicit text, or title following a subset on the same line leaves
implicit text mode enabled. [fixture: venn/db-indent-after-same-line-style]
[fixture: venn/db-indent-after-same-line-explicit-text] [fixture:
venn/db-indent-after-same-line-title] [fixture:
venn/lex-indent-set-same-line-explicit-text-blank-comment-without-empty-lines]
[fixture: venn/lex-indent-set-same-line-style-blank-comment-without-empty-lines]
[fixture:
venn/lex-indent-union-same-line-explicit-text-blank-comment-without-empty-lines]
[fixture:
venn/lex-indent-union-same-line-style-blank-comment-without-empty-lines]

Blank lines, space/tab-only lines, removed comment regions, common directive
lines, and swallowed fragments preserve the enabled mode. [fixture:
venn/db-indent-after-blank] [fixture: venn/db-indent-blank-line] [fixture:
venn/db-indent-after-comment] [fixture: venn/db-indent-after-directive]
[fixture: venn/lex-comment-line-before-text] [fixture:
venn/lex-unindented-blank-followed-comment] [fixture:
venn/lex-comment-multiple-spaces-before-text] [fixture:
venn/lex-eaten-fragment-before-line-break] [fixture:
venn/lex-bare-percent-between-set-and-text] [fixture:
venn/lex-empty-braces-percent-between-set-and-text] [fixture:
venn/lex-indent-set-blank-directive] [fixture:
venn/lex-indent-union-blank-directive] [fixture:
venn/lex-indent-set-bare-comment-blank] [fixture:
venn/lex-indent-set-mixed-lines-without-empty-lines] [fixture:
venn/lex-indent-union-empty] [fixture: venn/lex-indent-union-bare-comment]
[fixture: venn/lex-indent-union-blank-comment]

A diagram-comment line preserves implicit text mode if, before rule 7 runs, rule
1 reads the comment or rule 2 swallows the character immediately before its
`%%`; otherwise, rules 5 and 6 skip any leading ASCII spaces or tabs and rule 7
disables the mode before rule 9 reads the `%%{` comment. [fixture:
venn/lex-empty-braces-percent-between-set-and-text] [fixture:
venn/lex-indent-union-empty-braces] [fixture:
venn/lex-indent-set-empty-braces-blank] [fixture:
venn/lex-indent-union-empty-braces-blank] [fixture:
venn/lex-indent-set-two-empty-braces] [fixture:
venn/lex-indent-union-two-empty-braces] [fixture:
venn/lex-indent-set-blank-empty-braces-ls-without-empty-lines] [fixture:
venn/lex-indent-set-blank-empty-braces-ps-without-empty-lines] [fixture:
venn/lex-indent-empty-braces-without-empty-line-crlf] [fixture:
venn/gram-indent-set-blank-empty-braces-crlf] [fixture:
venn/gram-indent-set-blank-empty-braces-ls] [fixture:
venn/gram-indent-set-blank-empty-braces-ps] [fixture:
venn/gram-indent-set-blank-two-empty-braces] [fixture:
venn/gram-indent-set-empty-braces-blank-empty-braces] [fixture:
venn/gram-indent-set-mixed-lines] [fixture:
venn/gram-indent-set-same-line-explicit-text-blank-comment] [fixture:
venn/gram-indent-set-same-line-style-blank-comment] [fixture:
venn/gram-indent-union-blank-empty-braces] [fixture:
venn/gram-indent-union-empty-braces-blank-empty-braces] [fixture:
venn/gram-indent-union-same-line-explicit-text-blank-comment] [fixture:
venn/gram-indent-union-same-line-style-blank-comment] [fixture:
venn/gram-indent-empty-braces-after-blank] [fixture:
venn/gram-indent-after-empty-braces-explicit-id] [fixture:
venn/gram-indent-after-empty-braces-explicit-string] [fixture:
venn/gram-indent-after-empty-braces-explicit-target-list] [fixture:
venn/lex-indent-spaces-before-empty-braces] [fixture:
venn/gram-indent-spaces-before-empty-braces-extra-id] [fixture:
venn/lex-indent-tab-line-before-empty-braces] [fixture:
venn/gram-indent-tab-line-before-empty-braces-extra-id] [fixture:
venn/lex-indent-bare-percent-after-blank] [fixture:
venn/lex-indent-indented-empty-braces-after-blank] [fixture:
venn/lex-indent-union-blank-bare-comment] [fixture:
venn/lex-indent-tab-prefixed-empty-braces-after-blank] [fixture:
venn/gram-indent-two-spaces-empty-braces-explicit] [fixture:
venn/gram-indent-two-spaces-empty-braces-missing-id] [fixture:
venn/gram-indent-two-spaces-empty-braces-after-blank-explicit] [fixture:
venn/gram-indent-two-spaces-empty-braces-after-blank-missing-id] [fixture:
venn/gram-indent-space-tab-empty-braces-explicit] [fixture:
venn/gram-indent-space-tab-empty-braces-missing-id] [fixture:
venn/gram-indent-space-tab-empty-braces-after-blank-explicit] [fixture:
venn/gram-indent-space-tab-empty-braces-after-blank-missing-id] [fixture:
venn/lex-indent-ignored-prefix-empty-braces-after-blank] [fixture:
venn/gram-indent-ignored-prefix-empty-braces-after-blank-extra-id] [fixture:
venn/gram-comment-prefix-line-separator-between-statements-implicit-text]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-implicit-text]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-extra-id]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-extra-id]

The empty braces in `%%{ }%%` start no directive. [fixture:
venn/lex-empty-braces-percent-between-set-and-text] [fixture:
venn/gram-indent-empty-braces-after-blank] [fixture:
venn/lex-indent-union-empty-braces] [fixture:
venn/gram-indent-union-blank-empty-braces] [fixture:
venn/gram-indent-after-empty-braces-explicit-id] [fixture:
venn/gram-indent-after-empty-braces-explicit-string] [fixture:
venn/gram-indent-after-empty-braces-explicit-target-list]

The common comment-line removal leaves a line starting with `%%{` for the
diagram comment rules. [fixture:
venn/lex-empty-braces-percent-between-set-and-text] [fixture:
venn/gram-indent-empty-braces-after-blank] [fixture:
venn/lex-indent-union-empty-braces] [fixture:
venn/gram-indent-union-blank-empty-braces] [fixture:
venn/gram-indent-after-empty-braces-explicit-id] [fixture:
venn/gram-indent-after-empty-braces-explicit-string] [fixture:
venn/gram-indent-after-empty-braces-explicit-target-list]

With the mode disabled by that line, indented `text A x`, `text "A" "x"`, and
`text A,B x` are accepted as explicit text. [fixture:
venn/gram-indent-after-empty-braces-explicit-id] [fixture:
venn/gram-indent-after-empty-braces-explicit-string] [fixture:
venn/gram-indent-after-empty-braces-explicit-target-list]

Without enabled mode, indented `text` is explicit and still requires its target
list and id. [fixture: venn/gram-indent-without-set] [fixture:
venn/gram-indent-after-style] [fixture:
venn/lex-indented-text-at-bol-without-current-set-explicit] [fixture:
venn/lex-indented-text-after-style-explicit] [fixture:
venn/gram-indent-after-empty-braces-explicit-id] [fixture:
venn/gram-indent-after-empty-braces-explicit-string] [fixture:
venn/gram-indent-after-empty-braces-explicit-target-list] [fixture:
venn/lex-indent-set-style-blank-comment-explicit-target]

### Styles

`style` requires a nonempty target list and at least one comma-separated
property. [fixture: venn/db-form-style-id] [fixture:
venn/db-form-style-multiple] [fixture: venn/gram-extra-style-no-target]
[fixture: venn/gram-extra-style-quoted-key] [fixture: venn/gram-style-empty]
[fixture: venn/gram-style-missing-value] [fixture:
venn/gram-style-trailing-comma] [fixture: venn/gram-empty-quoted-style-key]
[fixture: venn/gram-style-property-missing-colon] Each property key is a bare
identifier followed by a colon and a value. [fixture: venn/db-form-style-id]
[fixture: venn/db-form-style-multiple] [fixture:
venn/gram-extra-style-no-target] [fixture: venn/gram-extra-style-quoted-key]
[fixture: venn/gram-style-empty] [fixture: venn/gram-style-missing-value]
[fixture: venn/gram-style-trailing-comma] [fixture:
venn/gram-empty-quoted-style-key] [fixture:
venn/gram-style-property-missing-colon]

Any nonreserved identifier is a property key; repeated keys and separate style
statements remain separate written entries. [fixture:
venn/db-style-duplicate-key] [fixture: venn/db-style-case-and-order] [fixture:
venn/db-style-three-definitions] [fixture: venn/db-style-prototype-keys]

A style value is one complete quoted string, which may be empty, or a nonempty
sequence of style atoms. [fixture: venn/db-form-style-tokens] [fixture:
venn/db-form-style-string] [fixture: venn/db-form-style-number] [fixture:
venn/lex-style-empty] [fixture: venn/gram-style-string-with-second-string]
[fixture: venn/gram-style-single-quoted] [fixture: venn/gram-unclosed-style]
[fixture: venn/gram-style-property-trailing-newline]

Adjacent bare style atoms need no whitespace, as in `1red#abc`; the VennLiteral
keeps their written spelling and spacing. [fixture:
venn/lex-style-adjacent-units] [fixture: venn/db-form-style-tokens] [fixture:
venn/lex-style-single-number-whole-spelling]

### Empty forms

An empty quoted label is a VennLabel with empty value. [fixture:
venn/db-label-empty] [fixture: venn/lex-empty-label-before-size] [fixture:
venn/lex-empty-quoted-label-text-before-size] [fixture:
venn/gram-label-bare-empty] [fixture: venn/db-label-spaces] [fixture:
venn/lex-label-bare-padding] [fixture: venn/lex-label-bare-whitespace-line] A
bare `[]` is rejected, while bare whitespace and quoted whitespace are label
content. [fixture: venn/db-label-empty] [fixture:
venn/lex-empty-label-before-size] [fixture:
venn/lex-empty-quoted-label-text-before-size] [fixture:
venn/gram-label-bare-empty] [fixture: venn/db-label-spaces] [fixture:
venn/lex-label-bare-padding] [fixture: venn/lex-label-bare-whitespace-line]

The first line feed remains in a bare or quoted label whose other content is a
common comment region. [fixture: venn/lex-label-bare-comment-only] [fixture:
venn/lex-label-quoted-comment-only]

A quoted label containing only a directive or selected ignored semicolon remains
a VennLabel with empty value. [fixture: venn/lex-label-quoted-directive-only]
[fixture: venn/lex-label-quoted-ignored-semicolon-only]

After trivia is excluded, a bare label must contain at least one character.
[fixture: venn/gram-label-bare-directive-only] [fixture:
venn/gram-label-bare-ignored-semicolon-only] [fixture:
venn/lex-label-bare-comment-only]

An empty quoted name or style string is a real StringLiteral. [fixture:
venn/db-empty-identifiers] [fixture: venn/lex-style-empty] [fixture:
venn/db-label-empty] No venn form is discarded as a tokenless empty form.
[fixture: venn/db-empty-identifiers] [fixture: venn/lex-style-empty] [fixture:
venn/db-label-empty] [fixture: venn/lex-identifier-directive-only]

A bare style value containing only a directive is rejected. [fixture:
venn/gram-style-value-directive-only]

A standalone string or bracket label, accessibility statements, description
blocks, and `@{ ... }` data blocks are rejected. [fixture:
venn/gram-bare-empty-string] [fixture: venn/gram-empty-label-alone] [fixture:
venn/gram-acc-title] [fixture: venn/gram-acc-descr] [fixture:
venn/gram-acc-block] [fixture: venn/gram-empty-acc-block] [fixture:
venn/gram-unclosed-acc-block] [fixture: venn/lex-empty-description-after-set]
[fixture: venn/gram-data-block] [fixture:
venn/gram-comment-extra-id-before-existing-label]

`intersection` is not a statement keyword and is rejected. [fixture:
venn/gram-intersection-unsupported]

### Rejections outside the grammar

Every union member must match an earlier set name after the converted name text
is trimmed outside its quotes and one outer double-quote pair is removed.
[fixture: venn/gram-union-unknown] [fixture: venn/gram-union-before-definitions]
[fixture: venn/gram-union-inner-space] [fixture: venn/gram-union-case-mismatch]
[fixture: venn/lex-union-converted-name-match] [fixture:
venn/lex-union-empty-quoted-members] [fixture:
venn/lex-union-matching-quoted-padding] Matching is case-sensitive. [fixture:
venn/gram-union-unknown] [fixture: venn/gram-union-before-definitions] [fixture:
venn/gram-union-inner-space] [fixture: venn/gram-union-case-mismatch] [fixture:
venn/lex-union-converted-name-match] [fixture:
venn/lex-union-empty-quoted-members] [fixture:
venn/lex-union-matching-quoted-padding] [fixture:
venn/lex-union-converted-equivalent-name]

Earlier sets need not be unique; repeated union members are accepted. [fixture:
venn/db-three-definitions] [fixture: venn/db-union-three-definitions] [fixture:
venn/db-union-repeated-member]

Text and style targets need no earlier declaration. [fixture:
venn/db-text-unknown] [fixture: venn/db-style-unknown]

## Known divergences

**[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
A directive inside a keyword, name, or number is rejected here, while mermaid.js
joins its parts. [fixture: venn/header-directive-inside] [fixture:
venn/lex-directive-in-set] [fixture: venn/db-grid-directive-size] [fixture:
venn/div-directive-style-value-word]

**[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
A selected ignored semicolon inside those units is rejected here, while
mermaid.js joins its parts. [fixture:
venn/div-ignored-semicolon-set-name-selected] [fixture:
venn/div-ignored-semicolon-size] [fixture:
venn/div-ignored-semicolon-style-value-selected]

**[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).** The
four C4 words in a bare or quoted name, label, bare or quoted style value, or
title are read as venn values here. [fixture:
venn/lex-c4-c4container-identifier] [fixture: venn/lex-c4-c4container-label]
[fixture: venn/lex-c4-c4container-style] [fixture:
venn/lex-c4-c4container-title] [fixture: venn/lex-c4-c4component-identifier]
[fixture: venn/lex-c4-c4component-label] [fixture:
venn/lex-c4-c4component-style] [fixture: venn/lex-c4-c4component-title]
[fixture: venn/lex-c4-c4dynamic-identifier] [fixture:
venn/lex-c4-c4dynamic-label] [fixture: venn/lex-c4-c4dynamic-style] [fixture:
venn/lex-c4-c4dynamic-title] [fixture: venn/lex-c4-c4deployment-identifier]
[fixture: venn/lex-c4-c4deployment-label] [fixture:
venn/lex-c4-c4deployment-style] [fixture: venn/lex-c4-c4deployment-title]
mermaid.js selects C4 and rejects the input. [fixture:
venn/lex-c4-c4container-identifier] [fixture: venn/lex-c4-c4container-label]
[fixture: venn/lex-c4-c4container-style] [fixture:
venn/lex-c4-c4container-title] [fixture: venn/lex-c4-c4component-identifier]
[fixture: venn/lex-c4-c4component-label] [fixture:
venn/lex-c4-c4component-style] [fixture: venn/lex-c4-c4component-title]
[fixture: venn/lex-c4-c4dynamic-identifier] [fixture:
venn/lex-c4-c4dynamic-label] [fixture: venn/lex-c4-c4dynamic-style] [fixture:
venn/lex-c4-c4dynamic-title] [fixture: venn/lex-c4-c4deployment-identifier]
[fixture: venn/lex-c4-c4deployment-label] [fixture:
venn/lex-c4-c4deployment-style] [fixture: venn/lex-c4-c4deployment-title]
[fixture: venn/div-c4-bare-identifier] [fixture: venn/div-c4-bare-style-value]

`C4Context` after the header and C4 words in removed comments or frontmatter do
not change detection in either reading. [fixture:
venn/lex-c4-c4context-identifier] [fixture: venn/lex-c4-c4context-label]
[fixture: venn/lex-c4-c4context-style] [fixture: venn/lex-c4-c4context-title]
[fixture: venn/lex-c4-c4container-comment] [fixture:
venn/lex-c4-c4container-frontmatter]

**[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
With `title: <a` in frontmatter, `set "b="c">d"` is rejected here, while
mermaid.js converts the inner attribute quotes and accepts it. [fixture:
venn/div-html-tag-starts-in-frontmatter] [fixture:
venn/gram-html-tag-body-only-reference]

**[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).**
Invalid YAML in a well-delimited frontmatter is accepted here and rejected by
mermaid.js. [fixture: venn/frontmatter-invalid] [fixture:
venn/frontmatter-empty] [fixture: venn/frontmatter-unclosed] Malformed
delimiters remain syntax errors. [fixture: venn/frontmatter-invalid] [fixture:
venn/frontmatter-empty] [fixture: venn/frontmatter-unclosed]
