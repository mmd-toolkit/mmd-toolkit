# Architecture tokens

Japanese version: [architecture.ja.md](./architecture.ja.md)

Tokens follow the specification's
[ordered rules](../../../spec/docs/diagrams/architecture.md#ordered-rules).
Composite matches split only at their authored component boundaries. [fixture:
architecture/gram-written-tree] [fixture:
architecture/directive-icon-delimiters] [fixture:
architecture/directive-group-delimiters]

## Tokens

| Kind         | Items                                                                                                                  | Fixtures                                                                                                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | Header, declaration and alignment words, `in`, port and alignment directions, modifier `group`, common-value keywords. | [fixture: architecture/db-mixed] [fixture: architecture/db-directions] [fixture: architecture/common-all]                                                                         |
| `Identifier` | Declaration IDs, references, alignment members and icon names.                                                         | [fixture: architecture/gram-written-tree] [fixture: architecture/lex-icon-leading-symbols] [fixture: architecture/lex-numeric-ids-text]                                           |
| `Punctuator` | Each colon, marker, dash unit, parenthesis, bracket or brace. Double dash is one item.                                 | [fixture: architecture/db-mixed] [fixture: architecture/end-edge-eof] [fixture: architecture/directive-icon-delimiters] [fixture: architecture/directive-group-delimiters]        |
| `String`     | Complete quoted text icon or quoted label content, including matching quotes.                                          | [fixture: architecture/db-empty-values] [fixture: architecture/lex-string-conversion] [fixture: architecture/lex-title-quoted-brackets]                                           |
| `RawText`    | Bare label content, one common value, or one whole native hidden form.                                                 | [fixture: architecture/lex-title-padded-quotes] [fixture: architecture/common-all] [fixture: architecture/hidden-yaml-three-fences] [fixture: architecture/hidden-directive-body] |

There are no Numeric items: numeric-looking names and labels remain text.
Parenthesized icons split into `(`, icon-name and `)`; modifiers split into `{`,
`group` and `}`. Padding and native hidden forms cannot split those composite
matches. [fixture: architecture/lex-numeric-ids-text] [fixture:
architecture/lex-icon-leading-symbols] [fixture:
architecture/directive-icon-delimiters] [fixture:
architecture/directive-group-delimiters] [fixture:
architecture/gram-hidden-inside-icon] [fixture:
architecture/gram-hidden-inside-modifier]

A label's brackets are separate items. The complete quoted alternative chosen by
the lexer has a String item; the bare fallback has a RawText item, including all
its padding. Neither conversion results nor quote-looking content change that
choice. [fixture: architecture/lex-title-quoted-brackets] [fixture:
architecture/lex-title-padded-quotes] [fixture:
architecture/lex-title-unclosed-quote-with-close] [fixture:
architecture/lex-title-unescaped-quote-fallback] [fixture:
architecture/lex-label-escaped-ls-fallback] [fixture:
architecture/html-label-authored-quotes] [fixture:
architecture/lex-label-selected-semicolon-after-quote]

Line values retain all padding after title's one ASCII separator or an
accessibility colon; empty content has no token. Block values trim common
whitespace only at their ends; empty or common-trivia-only content has no value
token. Common values remain RawText even with quote-looking content. [fixture:
architecture/lex-title-one-space-null] [fixture:
architecture/lex-title-one-tab-null] [fixture:
architecture/lex-title-two-spaces-literal] [fixture:
architecture/lex-acctitle-whitespace-only] [fixture:
architecture/lex-description-line-whitespace-only] [fixture:
architecture/lex-description-block-whitespace-only] [fixture:
architecture/common-description-block-directive] [fixture:
architecture/common-description-block-comment] [fixture:
architecture/common-title-literal-quotes]

A hidden form is one RawText item from its opener through its qualifying closer,
excluding preceding padding and the consumed following LF. Body-present YAML has
priority over adjacent empty fences and either dash rule. [fixture:
architecture/hidden-yaml-open-padding] [fixture:
architecture/hidden-yaml-adjacent-eof] [fixture:
architecture/hidden-yaml-three-fences] [fixture:
architecture/hidden-yaml-adjacent-later-closer] [fixture:
architecture/hidden-directive-crlf] [fixture: architecture/hidden-directive-eof]
[fixture: architecture/hidden-yaml-after-header]

Common directives, comment regions and selected semicolons cut text and string
items; string fragments have kind StringFragment. A directive or selected
semicolon inside an indivisible name, word or double dash rejects under the
shared atomic boundary rules. Directives between complete icon/modifier
components are allowed. Values preserve authored escapes, entities, attribute
quotes and source line endings. [fixture: architecture/directive-fields]
[fixture: architecture/comment-in-quoted-label] [fixture:
architecture/style-fields] [fixture: architecture/div-directive-name] [fixture:
architecture/div-directive-icon-name] [fixture:
architecture/div-directive-group-word] [fixture:
architecture/div-directive-line] [fixture:
architecture/div-semicolon-in-keyword] [fixture:
architecture/div-semicolon-parent-id] [fixture:
architecture/directive-icon-delimiters] [fixture:
architecture/directive-group-delimiters] [fixture:
architecture/common-quotes-entities] [fixture: architecture/html-all-fields]
[fixture: architecture/line-cr-title] [fixture: architecture/line-crlf]

## Comments and trivia

ASCII spaces/tabs between units, visible newlines and the appended LF have no
tokens. Native comments have mark `%%` and end before LF/CR, keeping LS/PS as
content. [fixture: architecture/space-tabs] [fixture: architecture/space-lines]
[fixture: architecture/end-statements-comments] [fixture:
architecture/space-comment-ls] [fixture: architecture/space-comment-ps]
[fixture: architecture/end-service-eof]

Bare percent lines and accompanying whitespace/line breaks passed by detection
are shared Comments and trivia, and are not read again, including between
retained forms. Earlier enclosing values own hidden-looking text. [fixture:
architecture/detect-empty-braces-bare] [fixture:
architecture/detect-unclosed-brace-bare] [fixture:
architecture/div-retained-bare-second-scan-ls] [fixture:
architecture/hidden-directive-inside-values] [fixture:
architecture/hidden-yaml-inside-values]
