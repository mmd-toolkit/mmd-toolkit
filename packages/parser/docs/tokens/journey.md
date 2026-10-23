# Journey tokens

Japanese version: [journey.ja.md](./journey.ja.md)

This document defines the tokens of the diagram type `journey` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/journey.md`](../../../spec/docs/ast/journey.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/journey.md](../../../spec/docs/diagrams/journey.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/journey.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header` unit; the `title`, `section`, `accTitle`, and `accDescr` units                                                                                                                                                                                                                   |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/journey.md#directives-inside-units): a `title-text`, a `section-text`, a `task-text`, a `score`, a `person`, an `ignored-data`, an `acc-title-text`, an `acc-description-text`, and an `acc-description-block-text` |
| `Punctuator` | `:`, `,`, `{`, and `}`                                                                                                                                                                                                                                                                      |

[fixture: journey/header-only] [fixture: journey/db-title-statement] [fixture:
journey/db-sections] [fixture: journey/db-acc-title] [fixture:
journey/db-acc-descr] [fixture: journey/db-acc-descr-block] [fixture:
journey/db-task-people] [fixture: journey/db-task-extra-colon]

Every item is one unit, and so one **token**: `A: 3: a,b: c, d` has the
`RawText` tokens `A`, `3`, `a`, and `b`, the `Punctuator` tokens `:`, `:`, and
`,`, and the `RawText` token `: c, d` of the ignored data, whose colons are
characters of it. [fixture: journey/db-task-extra-colon] A `;` unit and a `:`
unit that starts no data are taken by no rule of the grammar, so the input is
rejected and no token is made of them. [fixture: journey/lex-semicolon-line]
[fixture: journey/lex-task-colon-at-end]

A token holds no whitespace at its ends, except where mermaid.js reads it as
part of a value (see [Tokens](../tokens.md#tokens)). The units whose values keep
the whitespace at their ends keep it in their tokens too: a `task-text`, the
whitespace before the colon included (`Make tea  : 3` has the token `Make tea`
and two spaces); a `title-text` and a `section-text` (`title` and two spaces
before `T` has the token of a space and `T`, and `title T` followed by three
spaces the token `T` and three spaces). An accessibility text, an
`acc-title-text`, an `acc-description-text`, or an `acc-description-block-text`,
whose value mermaid.js trims, and a `score`, a `person`, and an `ignored-data`,
whose units have no whitespace at their ends, leave it out: `accTitle: T`
followed by three spaces has the token `T`; `accDescr {`, a line `line one`, a
line `line two`, and `}` on a line of its own have the token `line one`, the
line break and the indentation, and `line two`, without the line break and the
spaces before the `}`, which the lexer reads into the block text; and the score
of `A:` followed by U+00A0, `5`, U+00A0, and `: Me` has the token `5`. [fixture:
journey/db-task-description-spaces] [fixture: journey/lex-title-two-spaces]
[fixture: journey/lex-title-trailing-spaces] [fixture:
journey/lex-section-two-spaces] [fixture:
journey/gram-acc-title-trailing-spaces] [fixture: journey/db-acc-descr-block]
[fixture: journey/lex-task-score-nbsp-trimmed]

At the end of a title text or a section text, a closed directive ends nothing
and the whitespace before it stays in the token, and a CR or a CRLF ends the
text as a line feed does: `title T %%{init: {}}%%` has the token `T` and a
space, `title T%%{init: {}}%%` the token `T`, and `title T` followed by a CRLF
the token `T`. [fixture: journey/lex-directive-at-end-of-title-line] [fixture:
journey/lex-directive-glued-at-end-of-title] [fixture:
journey/lex-directive-at-end-of-section-line] [fixture:
journey/lex-directive-glued-at-end-of-section] [fixture:
journey/lex-title-crlf-value] [fixture: journey/lex-title-cr-value] [fixture:
journey/lex-section-crlf-value] [fixture: journey/lex-section-cr-value]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says; inside a token of any other kind, a directive or an ignored `;` makes the
input rejected (see
[Directives inside units](../../../spec/docs/diagrams/journey.md#directives-inside-units)):
`a%%{init: {}}%%b: 5` has the `RawText` tokens `a` and `b` with the `Directive`
token between them, and the ignored data of `A: 5: Me: a %%{init: {}}%%b` the
`RawText` tokens `: a`, with the space before the directive, and `b`, while
`ti%%{init: {}}%%tle T` is rejected. [fixture:
journey/lex-directive-after-space-in-ignored-data] [fixture:
journey/lex-directive-in-task-text] [fixture:
journey/div-directive-in-title-keyword] [fixture:
journey/div-ignored-semicolon-in-title-keyword]

- An empty description block has the `Keyword` token `accDescr` and the
  `Punctuator` tokens `{` and `}`. [fixture: journey/gram-acc-descr-block-empty]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token:
  `accTitle: style:#x;` has the `RawText` token `style:#x` and the
  `IgnoredSemicolon` token `;`, and after `accDescr { style:#x }` on the same
  line, `A;B: 5` has the `RawText` tokens `A` and `B` with the
  `IgnoredSemicolon` token between them. [fixture:
  journey/tokens-ignored-semicolon-in-acc-title] [fixture:
  journey/tokens-ignored-semicolon-in-task-text]
