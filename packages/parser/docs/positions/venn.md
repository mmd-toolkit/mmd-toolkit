# Venn positions

Japanese version: [venn.ja.md](./venn.ja.md)

These ranges supplement [positions.md](../positions.md). The nodes are defined
in [ast/venn.md](../../../spec/docs/ast/venn.md), and the tokens in
[tokens/venn.md](../tokens/venn.md).

## Ranges

### VennDiagram and statements

The diagram covers the header through its last diagram token, excluding trailing
trivia. A header-only diagram covers just `venn-beta`. Statements cover their
keyword through their last operand or closing bracket. A title includes the
trailing whitespace of its value. Indentation and following line terminators are
outside statements. [fixture: venn/header-only] [fixture:
venn/header-statement-on-line] [fixture: venn/db-all-fields] [fixture:
venn/db-title-padding] [fixture: venn/db-indent-width]

### VennStyleProperty, VennLabel, and shared leaves

A property covers its key through its value. A label covers both brackets; its
value excludes those brackets and, for a quoted label, both quotes. Identifiers
and numbers cover their one token; a StringLiteral covers both quotes. Its
`raw`, like that of a number, is the entire source range, including any common
trivia inside a string. [fixture: venn/db-form-style-multiple] [fixture:
venn/db-set-label] [fixture: venn/db-label-empty] [fixture:
venn/db-form-set-label-size] [fixture: venn/db-size-leading-zeros] [fixture:
venn/lex-identifier-directive-middle] [fixture: venn/lex-crlf-quoted-value]

A quoted label emptied by a directive or selected semicolon still covers both
brackets and quotes, including that trivia. In a bare or quoted label containing
a comment region, the first LF before the region remains in the value and its
interior token. [fixture: venn/lex-label-quoted-directive-only] [fixture:
venn/lex-label-quoted-ignored-semicolon-only] [fixture:
venn/lex-label-bare-comment-only] [fixture: venn/lex-label-quoted-comment-only]

### VennLiteral and VennIgnoredText

A title literal covers every character after the first whitespace separator,
including additional leading and trailing whitespace. A whitespace-only title
value covers that whitespace. A bare style literal covers its first through last
atom, including the original whitespace between atoms. [fixture:
venn/db-title-padding] [fixture: venn/db-title-only-whitespace] [fixture:
venn/lex-title-separator-crlf] [fixture: venn/db-form-style-tokens] [fixture:
venn/lex-style-adjacent-units]

An ignored-text node covers the swallowed non-whitespace code unit only. Its
comment lies outside it. It remains separate from any preceding complete
statement. [fixture: venn/db-grid-comment-header-line] [fixture:
venn/lex-set-extra-id-eaten] [fixture: venn/lex-style-extra-id-eaten]
