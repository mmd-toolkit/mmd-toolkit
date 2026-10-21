# Venn tokens

Japanese version: [venn.ja.md](./venn.ja.md)

These tokens supplement [tokens.md](../tokens.md). The nodes are defined in
[ast/venn.md](../../../spec/docs/ast/venn.md), and the lexical rules in
[diagrams/venn.md](../../../spec/docs/diagrams/venn.md#lexical-structure).

## Tokens

| Kind         | Items                                                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------- |
| `Keyword`    | `venn-beta`, `set`, `union`, explicit or implicit `text`, and `style`; the `title` part of a title line |
| `Punctuator` | Each comma, colon, opening bracket, and closing bracket                                                 |
| `Identifier` | Each bare name, text id, property key, and identifier atom in a bare style value                        |
| `Numeric`    | Each size, numeric text id, and number atom in a bare style value                                       |
| `String`     | Each quoted name, text id, style value, and quoted label interior, including both quotes                |
| `RawText`    | Bare label interior, title content, each whole color atom, and each swallowed non-whitespace fragment   |

[fixture: venn/db-all-fields] [fixture: venn/db-form-text-number] [fixture:
venn/db-form-style-number] [fixture: venn/db-form-style-hex] [fixture:
venn/db-form-style-rgba] [fixture: venn/lex-style-adjacent-units] [fixture:
venn/db-grid-comment-header-line]

Each listed item makes one token before common trivia cuts it. A whole label
match is divided into two bracket tokens and one interior item. An empty quoted
label still has a `String` token of its two quotes. Bare label text keeps every
interior whitespace character, including a whitespace-only value. A string keeps
its interior whitespace and original line terminators. [fixture:
venn/db-label-empty] [fixture: venn/lex-label-bare-padding] [fixture:
venn/lex-label-bare-whitespace-line] [fixture: venn/lex-crlf-quoted-value]

A quoted label containing only a directive or selected ignored semicolon still
has its quoted interior item, cut into `StringFragment` tokens. When a comment
region is the other content of a bare or quoted label, the first LF remains in
the interior token. A bare label with no character after trivia is removed is
rejected. [fixture: venn/lex-label-quoted-directive-only] [fixture:
venn/lex-label-quoted-ignored-semicolon-only] [fixture:
venn/lex-label-bare-comment-only] [fixture: venn/lex-label-quoted-comment-only]
[fixture: venn/gram-label-bare-directive-only] [fixture:
venn/gram-label-bare-ignored-semicolon-only]

A title-line match is divided into its keyword and its nonempty content. The
first whitespace separator has no token; additional leading and trailing
whitespace belongs to the `RawText` token, including a whitespace-only value. A
CRLF used as that first separator is excluded in full. [fixture:
venn/db-title-padding] [fixture: venn/db-title-only-whitespace] [fixture:
venn/lex-title-separator-crlf] [fixture: venn/lex-title-separator-ls]

The atoms of a bare style value keep their own token kinds even when adjacent.
Whitespace between atoms belongs to no token, while remaining part of the
VennLiteral's written value. Whitespace inside a whole color belongs to its
`RawText` token. Indentation, other inter-unit whitespace, and newline units
make no tokens. [fixture: venn/lex-style-adjacent-units] [fixture:
venn/db-form-style-tokens] [fixture: venn/lex-style-value-rgb-multiline]
[fixture: venn/db-indent-width] [fixture: venn/lex-tab-whitespace-line]

Common trivia cuts text and strings under the [shared rules](../tokens.md). Cut
strings become `StringFragment` tokens. Directives and selected ignored
semicolons inside identifier or numeric atoms reject the input, including in
bare style values. The brackets and quotes are separate delimiters, so a
directive between `[` and `"`, or between the closing `"` and `]`, cuts neither
token. [fixture: venn/lex-label-directive-middle] [fixture:
venn/lex-identifier-comment-line] [fixture: venn/lex-identifier-style-rule]
[fixture: venn/div-directive-style-value-word] [fixture:
venn/div-directive-style-value-number] [fixture:
venn/div-ignored-semicolon-style-value-selected] [fixture:
venn/lex-directive-label-delimiter-gap] [fixture:
venn/lex-directive-label-closing-delimiter-gap] [fixture:
venn/div-ignored-semicolon-style-value-number-selected]

A selected semicolon inside a whole color cuts its `RawText` token and is
recorded as `IgnoredSemicolon`. A name-list comma is a separate `Punctuator`
item, so directives immediately before and after it cut neither adjacent name.
[fixture: venn/lex-style-hex-ignored-semicolon] [fixture:
venn/lex-style-rgb-ignored-semicolon] [fixture:
venn/lex-name-list-comma-directive]

The swallowed non-whitespace fragment has its own `RawText` token before the
diagram comment. U+0085 is not whitespace and remains a `VennIgnoredText` node
with that token. [fixture: venn/db-grid-comment-header-line] [fixture:
venn/lex-inline-comment-spaced] [fixture: venn/lex-swallowed-nel-gap]

Diagram comments run from `%%` across U+2028 and U+2029 to LF or the end of the
converted diagram text. `Root.comments` records their source fragments under the
[shared comment-region rules](../tokens.md#comment), including fragments with
`mark: null` after a region. [fixture:
venn/lex-bare-percent-between-set-and-text] [fixture:
venn/lex-inline-comment-line-separators] [fixture:
venn/lex-diagram-comment-cut-ls-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ps-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ls-spaces-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ps-spaces-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ls-tab-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ps-tab-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ls-eof-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ps-eof-tree-gap] [fixture:
venn/lex-diagram-comment-cut-ls-following-real-statement] [fixture:
venn/lex-diagram-comment-cut-ps-following-real-statement] [fixture:
venn/lex-diagram-comment-cut-ls-joined-unit]

A character swallowed by rule 2 makes no token when it is whitespace of
[Notation](../../../spec/docs/common.md#notation): U+0009–U+000D, U+0020,
U+00A0, U+1680, U+2000–U+200A, U+2028, U+2029, U+202F, U+205F, U+3000, or
U+FEFF. This includes U+2028 and U+2029 immediately before a `%%` that common
comment-line or directive removal has left in the diagram text. [fixture:
venn/lex-comment-swallowed-vt] [fixture: venn/lex-comment-swallowed-ff]
[fixture: venn/lex-comment-swallowed-cr] [fixture:
venn/lex-comment-swallowed-nbsp] [fixture:
venn/lex-comment-swallowed-nbsp-between-statements] [fixture:
venn/lex-comment-swallowed-ogham] [fixture: venn/lex-comment-swallowed-en-quad]
[fixture: venn/lex-comment-swallowed-em-quad] [fixture:
venn/lex-comment-swallowed-en-space] [fixture:
venn/lex-comment-swallowed-em-space] [fixture:
venn/lex-comment-swallowed-three-per-em] [fixture:
venn/lex-comment-swallowed-four-per-em] [fixture:
venn/lex-comment-swallowed-six-per-em] [fixture:
venn/lex-comment-swallowed-figure] [fixture:
venn/lex-comment-swallowed-punctuation] [fixture:
venn/lex-comment-swallowed-thin-space] [fixture:
venn/lex-comment-swallowed-hair-space] [fixture:
venn/lex-comment-swallowed-narrow-nbsp] [fixture:
venn/lex-comment-swallowed-medium-math] [fixture:
venn/lex-comment-swallowed-ideographic] [fixture:
venn/lex-comment-swallowed-bom] [fixture: venn/lex-swallowed-nbsp-gap] [fixture:
venn/lex-swallowed-vt-gap] [fixture: venn/lex-swallowed-ff-gap] [fixture:
venn/lex-swallowed-bom-gap] [fixture: venn/lex-swallowed-ideographic-gap]
[fixture: venn/lex-swallowed-nbsp-header] [fixture: venn/lex-swallowed-nbsp-eof]
[fixture: venn/lex-swallowed-nbsp-between-subsets] [fixture:
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
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-implicit-text]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-implicit-text]
[fixture: venn/gram-comment-prefix-line-separator-between-statements-extra-id]
[fixture:
venn/gram-comment-prefix-line-separator-between-statements-u2029-extra-id]

Common trivia removal can instead leave a U+2028 or U+2029 outside a value
without a following `%%`; that separator is rejected. [fixture:
venn/gram-comment-prefix-line-separator] [fixture:
venn/gram-comment-prefix-line-separator-u2029] [fixture:
venn/gram-comment-prefix-line-separator-directive] [fixture:
venn/gram-comment-prefix-line-separator-u2029-directive]

Common recording supplies `Directive` and `IgnoredSemicolon` tokens outside
comments. [fixture: venn/lex-identifier-style-rule] [fixture:
venn/lex-label-directive-middle]
