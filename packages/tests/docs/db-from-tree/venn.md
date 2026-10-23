# Building the Venn Db from the tree

Japanese version: [venn.ja.md](./venn.ja.md)

`src/db-from-tree/venn.ts` implements these steps for
[ast/venn.md](../../../spec/docs/ast/venn.md), following
[db-summaries.md, venn](../db-summaries.md#venn).
`tests/db-from-tree-venn.test.ts` supplies trees by hand and compares each
summary with the cited fixture's recorded Db, including after a JSON round trip
with tokens inaccessible and value slices confined to value-node ranges; the
shared HTML quote-context scan reads the source once.

## Building the summary from the tree

1. **Converted text.** Read written leaf values and their converted ranges,
   leaving out directives, common comment regions and selected ignored
   semicolons, converting CR and CRLF to LF, HTML attribute quotes to single
   quotes, and character references to placeholders, using the whole source's
   HTML tag context even when a tag starts outside the value. [fixture:
   venn/lex-identifier-directive-middle] [fixture:
   venn/lex-label-directive-middle] [fixture: venn/lex-identifier-comment-line]
   [fixture: venn/lex-label-comment-line] [fixture: venn/lex-cr-quoted-value]
   [fixture: venn/lex-crlf-quoted-value] [fixture:
   venn/lex-identifier-style-rule] [fixture: venn/db-grid-entity-label-bare]
   [fixture: venn/lex-title-entity-numeric] [fixture:
   venn/lex-title-entity-named] [fixture: venn/lex-title-html-attribute]
   [fixture: venn/db-grid-entity-style-value] [fixture:
   venn/lex-identifier-entity-numeric] [fixture: venn/lex-style-entity-numeric]
   [fixture: venn/lex-style-directive-middle] [fixture:
   venn/lex-style-comment-line] [fixture: venn/lex-title-directive-middle]
   [fixture: venn/lex-directive-label-delimiter-gap] [fixture:
   venn/lex-label-entity-numeric] [fixture: venn/lex-text-entity-numeric]
   [fixture: venn/lex-identifier-entity-named] [fixture:
   venn/lex-label-entity-named] [fixture: venn/lex-text-entity-named] [fixture:
   venn/lex-style-entity-named] [fixture:
   venn/lex-identifier-style-rule-two-semicolons] [fixture:
   venn/lex-label-style-rule-two-semicolons] [fixture:
   venn/lex-text-style-rule-two-semicolons] [fixture:
   venn/lex-style-style-rule-two-semicolons] [fixture:
   venn/lex-title-style-rule-two-semicolons] [fixture:
   venn/db-html-tag-from-title-name] [fixture:
   venn/db-html-tag-from-title-label] [fixture:
   venn/db-html-tag-from-title-style] [fixture:
   venn/db-html-tag-from-comment-name] [fixture: venn/db-html-tag-across-names]
2. **Initial summary.** Start with the embedded frontmatter title or an empty
   title, empty accessibility strings, and empty subsets, texts and styles;
   frontmatter accessibility keys and drawing settings add no fields. [fixture:
   venn/header-only] [fixture: venn/db-frontmatter-title] [fixture:
   venn/db-frontmatter-accessibility] [fixture: venn/db-markup]
3. **Names and ids.** Preserve case, duplicates, empty quoted strings and
   whitespace inside quotes, trim outside quotes, remove one outer quote pair,
   and keep a numeric text id's spelling rather than its numeric value.
   [fixture: venn/db-empty-identifiers] [fixture: venn/db-quoted-padding]
   [fixture: venn/db-text-leading-zeros] [fixture: venn/db-form-text-id]
   [fixture: venn/db-form-text-string] [fixture: venn/db-form-text-number]
   [fixture: venn/gram-repeated-target-lists] [fixture:
   venn/db-case-distinct-ids]
4. **Subsets and sizes.** Append each set or union in declaration order, sorting
   its names without removing duplicates, taking a written size through
   `parseFloat()` or defaulting to `10 / arity²`, and spelling non-finite sizes
   as text and negative zero as zero. [fixture: venn/db-all-fields] [fixture:
   venn/db-three-definitions] [fixture: venn/db-union-three-definitions]
   [fixture: venn/db-union-repeated-member] [fixture: venn/db-size-fraction]
   [fixture: venn/db-size-signed-fraction] [fixture: venn/db-size-plus]
   [fixture: venn/db-size-zero] [fixture: venn/db-size-negative] [fixture:
   venn/db-size-leading-zeros] [fixture: venn/db-size-negative-zero] [fixture:
   venn/db-size-overflow] [fixture: venn/db-size-negative-overflow]
5. **Labels.** Remove bracket and string delimiters, trim bare labels before the
   Db reading, omit an empty lexer label, then trim the remaining label and
   remove one outer quote pair, retaining an empty string when quoted whitespace
   reaches that second trim. [fixture: venn/db-label-empty] [fixture:
   venn/db-label-spaces] [fixture: venn/db-label-double-normalization] [fixture:
   venn/lex-label-bare-padding] [fixture: venn/db-label-backticks] [fixture:
   venn/db-label-inner-quotes] [fixture: venn/lex-label-quoted-directive-only]
   [fixture: venn/lex-label-quoted-ignored-semicolon-only] [fixture:
   venn/lex-label-bare-comment-only] [fixture:
   venn/lex-label-quoted-comment-only]
6. **Text targets.** Append text declarations in order with sorted explicit
   targets, including unknown targets and repetitions, or use the latest
   subset's sorted names for null targets; `checkTree` checks that null occurs
   only at an enabled indented implicit marker, with subsets enabling the mode,
   ordinary statement starts after a newline ending it, same-line statements
   preserving it, and blank lines, removed comments and common directives
   preserving it; an unindented `%%{ }%%` after an empty line ends the mode,
   while that comment immediately after the declaration, or prefixed by exactly
   one ASCII space or tab, and bare `%%` lines preserve it, as does an
   intervening nonempty line of only spaces or tabs; two or more leading spaces
   or tabs are skipped as one run, and rule 7 then ends the mode at `%%{` unless
   rule 2 swallows a separate prefix character before the comment. [fixture:
   venn/db-text-three-definitions] [fixture: venn/db-text-comma-list] [fixture:
   venn/gram-repeated-target-lists] [fixture: venn/db-form-indent-id] [fixture:
   venn/db-form-indent-string] [fixture: venn/db-form-indent-number] [fixture:
   venn/db-indent-width] [fixture: venn/db-indent-after-union] [fixture:
   venn/db-indent-after-blank] [fixture: venn/db-indent-blank-line] [fixture:
   venn/db-indent-after-comment] [fixture: venn/db-indent-after-directive]
   [fixture: venn/db-indent-after-same-line-style] [fixture:
   venn/db-indent-after-same-line-explicit-text] [fixture:
   venn/db-indent-after-same-line-title] [fixture:
   venn/lex-indented-text-after-style-explicit] [fixture:
   venn/lex-indented-text-at-bol-without-current-set-explicit] [fixture:
   venn/lex-empty-braces-percent-between-set-and-text] [fixture:
   venn/lex-indent-union-empty-braces] [fixture:
   venn/lex-indent-set-empty-braces-blank] [fixture:
   venn/lex-indent-set-two-empty-braces] [fixture:
   venn/lex-indent-indented-empty-braces-after-blank] [fixture:
   venn/lex-indent-bare-percent-after-blank] [fixture:
   venn/gram-indent-after-empty-braces-explicit-id] [fixture:
   venn/gram-indent-after-empty-braces-explicit-string] [fixture:
   venn/gram-indent-after-empty-braces-explicit-target-list] [fixture:
   venn/lex-indent-spaces-before-empty-braces] [fixture:
   venn/lex-indent-tab-line-before-empty-braces] [fixture:
   venn/lex-indent-empty-braces-without-empty-line-crlf] [fixture:
   venn/lex-indent-tab-prefixed-empty-braces-after-blank] [fixture:
   venn/gram-indent-two-spaces-empty-braces-explicit] [fixture:
   venn/gram-indent-two-spaces-empty-braces-after-blank-explicit] [fixture:
   venn/gram-indent-space-tab-empty-braces-explicit] [fixture:
   venn/gram-indent-space-tab-empty-braces-after-blank-explicit] [fixture:
   venn/lex-indent-ignored-prefix-empty-braces-after-blank]
7. **Style entries.** Append separate entries with sorted targets and arbitrary
   case-sensitive properties, letting the last duplicate key within one entry
   win, ignoring a string assignment to `__proto__`, and retaining other
   prototype-related names as own properties. [fixture:
   venn/db-style-three-definitions-same-target] [fixture:
   venn/db-style-case-and-order] [fixture: venn/db-style-duplicate-key]
   [fixture: venn/db-style-prototype-keys] [fixture:
   venn/gram-repeated-target-lists]
8. **Style values.** Preserve quoted content, including empty strings and
   padding, and split a bare VennLiteral's converted text into identifier,
   decimal, hex, rgb or rgba atoms joined by one space, even where their
   spellings touch, retaining each color's case, channel spelling and interior
   whitespace. [fixture: venn/db-empty-identifiers] [fixture:
   venn/db-quoted-padding] [fixture: venn/db-form-style-tokens] [fixture:
   venn/lex-style-adjacent-units] [fixture:
   venn/lex-style-single-number-whole-spelling] [fixture:
   venn/db-style-adjacent-numeric-tokens] [fixture: venn/db-form-style-rgba]
   [fixture: venn/db-style-rgb-uppercase] [fixture:
   venn/db-style-rgb-dot-components] [fixture:
   venn/db-style-hex-trailing-numeric-token] [fixture:
   venn/db-style-hex-trailing-identifier] [fixture: venn/db-style-rgb-crlf]
   [fixture: venn/db-style-rgb-nbsp] [fixture: venn/db-style-rgb-line-separator]
   [fixture: venn/db-style-rgba-paragraph-separator] [fixture:
   venn/db-style-rgb-directive] [fixture: venn/db-style-rgb-comment-line]
   [fixture: venn/db-grid-entity-style-value] [fixture:
   venn/lex-style-hex-ignored-semicolon] [fixture:
   venn/lex-style-rgb-ignored-semicolon] [fixture: venn/div-c4-bare-style-value]
9. **Ignored fragments.** Give VennIgnoredText no Db effect, retaining the
   complete preceding declaration. [fixture: venn/lex-style-extra-id-eaten]
   [fixture: venn/lex-set-colon-eaten]
10. **Title and configuration.** Preserve all title content after its first
    separator, including quotes and padding, let the last title replace the
    initial frontmatter title, and apply character replacement only to titles,
    with root HTML-label configuration taking precedence over flowchart
    configuration. [fixture: venn/db-title-padding] [fixture:
    venn/db-title-only-whitespace] [fixture: venn/db-title-value-next-line]
    [fixture: venn/db-title-quotes] [fixture: venn/lex-title-separator-crlf]
    [fixture: venn/db-title-last] [fixture:
    venn/db-frontmatter-title-overridden] [fixture: venn/db-markup] [fixture:
    venn/config-security-other] [fixture:
    venn/config-security-other-flowchart-false] [fixture:
    venn/config-security-other-html-false] [fixture:
    venn/config-security-other-root-false-flowchart-true] [fixture:
    venn/config-security-other-root-true-flowchart-false]
