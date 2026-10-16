# Requirement tokens

Japanese version: [requirement.ja.md](./requirement.ja.md)

This document defines the tokens of the diagram type `requirement` in the tree
that `@mmd-toolkit/parser` produces. The nodes are defined by the specification
in [`ast/requirement.md`](../../../spec/docs/ast/requirement.md); the tokens
shared by all diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/requirement.md](../../../spec/docs/diagrams/requirement.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/requirement.md#grammar) and has the
kind that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                                                                                                      |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | a `header` unit; the units of the keywords of rule 15 of [The statement context](../../../spec/docs/diagrams/requirement.md#the-statement-context): the kinds of requirement, `element`, the names of the fields, the risks, the methods, and the relations; the `style`, `classDef`, `class`, `accTitle`, `accDescr`, `direction`, and `direction-value` units                            |
| `Identifier` | the name units of [Directives inside units](../../../spec/docs/diagrams/requirement.md#directives-inside-units): a `style-word` that is a name after `style`, `classDef`, or `class`, or a class                                                                                                                                                                                           |
| `String`     | the string unit of [Directives inside units](../../../spec/docs/diagrams/requirement.md#directives-inside-units): a `string`                                                                                                                                                                                                                                                               |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/requirement.md#directives-inside-units): an `unquoted-text`, a name as well as a value, a `title-text`, a `description-text`, a `description-block-text`, and a `direction-text`; the units of a style: the `style-word`, `style-colon`, `style-semicolon`, `style-dash`, and `style-hash` units of a `style-item` |
| `Punctuator` | `:`, `,`, `{`, `}`, `:::`, `-`, `->`, and `<-`                                                                                                                                                                                                                                                                                                                                             |

[fixture: requirement/header-only] [fixture:
requirement/db-requirement-all-fields] [fixture: requirement/db-element-fields]
[fixture: requirement/db-relationship-arrows] [fixture:
requirement/db-style-statement] [fixture: requirement/db-class-def] [fixture:
requirement/db-class-statement] [fixture: requirement/db-class-colon-form]
[fixture: requirement/db-acc-title-descr] [fixture:
requirement/db-acc-descr-block] [fixture:
requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/db-relationship-quoted-names] [fixture:
requirement/db-requirement-name-spaces]

An unquoted name is a `RawText` token, not an `Identifier` token, because it may
hold whitespace between its words, as a name of a class diagram that may hold
whitespace is (see [tokens/class.md](./class.md#tokens)):
`requirement  spaced name  {` has the one `RawText` token `spaced name`. A
`style-word` holds no whitespace, and a name of that unit is an `Identifier`
token. [fixture: requirement/db-requirement-name-spaces] [fixture:
requirement/db-style-statement]

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them. Whitespace belongs to no unit between the
units of a style, so a run breaks where whitespace lies between two of them: the
style of `style r fill: red , stroke : blue` is the `RawText` tokens `fill:` and
`red`, and the next one `stroke`, `:`, and `blue`, while `style r fill:red` has
the one token `fill:red`; and `style r fill:red #c` has the tokens `fill:red`
and `#c` of the one style `fill:red#c`. [fixture: requirement/lex-style-spaces]
[fixture: requirement/db-style-statement] [fixture:
requirement/lex-style-hash-after-style] Every other item is one unit, and so one
token.

A token holds no whitespace at its ends, except where mermaid.js reads it as
part of a value (see [Tokens](../tokens.md#tokens)). An `unquoted-text` reads
the whitespace after it on its line, which mermaid.js leaves out of the name or
the value, so its token leaves it out too, U+00A0 included, and keeps the
whitespace between its characters: `requirement  spaced name  {` has the token
`spaced name`, `id:   1` followed by two spaces the token `1`, and `a` followed
by U+00A0 and `{` the token `a`. The accessibility texts, whose values
mermaid.js trims, leave it out as well: `accTitle:   t1` followed by two spaces
has the token `t1`, and `accDescr {`, a line `  line 1`, a line `  line 2`, and
`}` on a line of its own have the token `line 1`, the line break and the
indentation, and `line 2`, without the line break before the `}`, which the
lexer reads into the block text. [fixture:
requirement/db-requirement-name-spaces] [fixture:
requirement/db-requirement-value-spaces] [fixture:
requirement/lex-whitespace-nbsp-after-name] [fixture:
requirement/lex-whitespace-nbsp-in-name] [fixture:
requirement/db-acc-title-descr] [fixture: requirement/db-acc-descr-block]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says, and a cut `String` token becomes `StringFragment` tokens; inside a token
of any other kind, a directive or an ignored `;` makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/requirement.md#directives-inside-units)):
`requirement a%%{init: {}}%%b {` has the `RawText` tokens `a` and `b` with the
`Directive` token between them, and `style r fi%%{init: {}}%%ll:red` the
`RawText` tokens `fi` and `ll:red`, while `style r%%{init: {}}%%x fill:red`,
whose directive lies inside the `Identifier` token of the name, is rejected.
[fixture: requirement/lex-directive-in-name] [fixture:
requirement/lex-directive-in-style] [fixture:
requirement/div-directive-in-style-name] [fixture:
requirement/lex-directive-in-string]

- An empty description block has the `Keyword` token `accDescr` and the
  `Punctuator` tokens `{` and `}`, as a statement and as an item of a body.
  [fixture: requirement/gram-acc-descr-block-empty] [fixture:
  requirement/gram-empty-description-block-in-body]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token:
  `accTitle: style:#x a;b` has the `RawText` tokens `style:#x a` and `b` with
  the `IgnoredSemicolon` token between them, after the requirement `"style:#x"`
  the target of `"style:#x" - satisfies -> b;c` is the `RawText` tokens `b` and
  `c` with the `IgnoredSemicolon` token between them, and `style r fill:#f00;`
  ends in the `RawText` token `fill:#f00` and the `IgnoredSemicolon` token `;`.
  [fixture: requirement/tokens-ignored-semicolon-in-acc-title] [fixture:
  requirement/tokens-ignored-semicolon-in-name] [fixture:
  requirement/tokens-ignored-semicolon-in-style]
