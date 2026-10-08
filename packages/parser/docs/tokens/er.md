# ER tokens

Japanese version: [er.ja.md](./er.ja.md)

This document defines the tokens of the diagram type `er` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/er.md`](../../../spec/docs/ast/er.md); the tokens shared by all diagram
types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/er.md](../../../spec/docs/diagrams/er.md#lexical-structure). Every
unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/er.md#grammar) and has the kind that
this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                                                                            |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header` unit; the `style`, `classDef`, `class`, `subgraph`, `end`, `accTitle`, `accDescr`, `direction`, and `direction-value` units; a cardinality or a line written with a word: `one or zero`, `one or more`, `one or many`, `zero or one`, `zero or more`, `zero or many`, `many(0)`, `many(1)`, `many`, `one`, `only one`, `u`, `to`, and `optionally to` |
| `Identifier` | the name units of [Directives inside units](../../../spec/docs/diagrams/er.md#directives-inside-units): a `name`, a `number`, a `word`, a `key`, and a `style-text` that is a name                                                                                                                                                                               |
| `String`     | the string units of [Directives inside units](../../../spec/docs/diagrams/er.md#directives-inside-units): a `quoted-name`, a `string`, a `comment-string`, and a `backquoted-word`; an `empty-backquotes` unit                                                                                                                                                   |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/er.md#directives-inside-units): a `tilde-word`, a `title-text`, a `description-text`, a `description-block-text`, and a `direction-text`; the `style-text`, `:`, and `#` units of a style                                                                                                |
| `Punctuator` | `{`, `}`, `[`, `]`, `:::`, `:`, `,`, `?`, and `;`; a cardinality or a line written with symbols: `\|o`, `}o`, `}\|`, `\|\|`, `o\|`, `o{`, `\|{`, `1+`, `0+`, `1`, `..`, `--`, `.-`, and `-.`                                                                                                                                                                     |

[fixture: er/header-only] [fixture: er/gram-classdef] [fixture: er/gram-class]
[fixture: er/gram-subgraph] [fixture: er/lex-end-blank-line-then-name] [fixture:
er/gram-acc-title] [fixture: er/gram-acc-descr-block] [fixture:
er/lex-direction-line-text-before] [fixture: er/lex-cardinality-words] [fixture:
er/lex-cardinality-many-zero] [fixture: er/lex-md-parent] [fixture:
er/lex-name-number] [fixture: er/gram-keys-comma-space] [fixture:
er/lex-quoted-name] [fixture: er/gram-role-string] [fixture: er/gram-comment]
[fixture: er/lex-backquote-word] [fixture: er/gram-empty-backquotes-twice]
[fixture: er/lex-tilde-word] [fixture: er/gram-alias] [fixture:
er/gram-entity-classes] [fixture: er/gram-optional-type] [fixture:
er/lex-classdef-semicolon-line-feed] [fixture: er/gram-relationship-symbols]
[fixture: er/lex-cardinality-plus] [fixture: er/lex-one-digit-cardinalities]

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them. Whitespace belongs to no unit in this diagram
type, so a run breaks where whitespace lies between two units: the style of
`classDef a fill : #f9f` is the three `RawText` tokens `fill`, `:`, and `#f9f`,
and its value is `fill:#f9f`, while `classDef a fill:#f9f` has the one token
`fill:#f9f`. [fixture: er/lex-classdef-style-spaces] [fixture: er/gram-classdef]
A cardinality or a line of several words is one unit and one token, with the
spaces between its words: `one or more` is one `Keyword` token. [fixture:
er/lex-cardinality-words] A token holds no whitespace at its ends, except where
mermaid.js reads it as part of a value (see [Tokens](../tokens.md#tokens)): the
whitespace that the `end` unit reads after the keyword is outside its token,
[fixture: er/lex-end-blank-line-then-name] while a whitespace character that is
a character of a name, a word, or a style-text unit, such as U+00A0 at the end
of a name, is inside the token, as it is inside the value. [fixture:
er/lex-name-trailing-nbsp] [fixture: er/lex-style-nbsp-before-line-feed]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says, and a cut `String` token becomes `StringFragment` tokens; inside a token
of any other kind, a directive or an ignored `;` makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/er.md#directives-inside-units)).
[fixture: er/lex-directive-in-role-string] [fixture:
er/tokens-comment-line-in-role-string] [fixture:
er/tokens-ignored-semicolon-in-role-string] [fixture: er/div-directive-in-name]
[fixture: er/div-ignored-semicolon-in-name]

- An empty description block that is a statement has the `Keyword` token
  `accDescr` and the `Punctuator` tokens `{` and `}`. [fixture:
  er/gram-acc-descr-block-empty]
- Each `empty-backquotes` unit of an ErIgnoredText is a `String` token of its
  own: an attribute block with two of them between two attributes has two such
  tokens. [fixture: er/gram-empty-backquotes-twice]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token: in
  `A ||--o{ Bstyle : "x:#y";`, the role is the `String` token `"x:#y"`, and the
  `;` after it is an `IgnoredSemicolon` token. [fixture:
  er/tokens-ignored-semicolon-after-role]
