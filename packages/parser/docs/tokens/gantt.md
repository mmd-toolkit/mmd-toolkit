# Gantt tokens

Japanese version: [gantt.ja.md](./gantt.ja.md)

This document defines the tokens of the diagram type `gantt` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/gantt.md`](../../../spec/docs/ast/gantt.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/gantt.md](../../../spec/docs/diagrams/gantt.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/gantt.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | a `header` unit; the `accTitle`, `accDescr`, `href`, `call`, `click`, `dateFormat`, `axisFormat`, `tickInterval`, `todayMarker`, `includes`, `excludes`, `inclusiveEndDates`, `weekday`, `weekend`, `title`, and `section` units; a `day` unit                                                                                                               |
| `Identifier` | the name units of [Directives inside units](../../../spec/docs/diagrams/gantt.md#directives-inside-units): an `id` and a `list-item`                                                                                                                                                                                                                         |
| `String`     | the string unit of [Directives inside units](../../../spec/docs/diagrams/gantt.md#directives-inside-units), a `url-text`, with the two `"` units around it                                                                                                                                                                                                   |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/gantt.md#directives-inside-units): a `setting-text`, a `marker-text`, a `title-text`, a `section-text`, a `task-text`, a `data-item`, a tag included, a `callback-name`, a `callback-arguments`, an `acc-title-text`, an `acc-description-text`, and an `acc-description-block-text` |
| `Punctuator` | `:`, `,`, `{`, `}`, `(`, and `)`                                                                                                                                                                                                                                                                                                                             |

[fixture: gantt/header-only] [fixture: gantt/gram-acc-title] [fixture:
gantt/gram-acc-descr] [fixture: gantt/gram-acc-descr-block] [fixture:
gantt/gram-click-href] [fixture: gantt/gram-click-call-arguments] [fixture:
gantt/db-date-format] [fixture: gantt/db-axis-format] [fixture:
gantt/db-tick-interval] [fixture: gantt/db-today-marker] [fixture:
gantt/db-includes-tokens] [fixture: gantt/db-excludes-tokens] [fixture:
gantt/db-inclusive-end-dates] [fixture: gantt/db-weekday-last-wins] [fixture:
gantt/db-weekend-friday] [fixture: gantt/db-title-statement] [fixture:
gantt/db-sections] [fixture: gantt/gram-task] [fixture:
gantt/gram-task-tag-then-item] [fixture: gantt/gram-click-ids-list] [fixture:
gantt/gram-empty-href-line]

A **token** is a run of units of one item that follow one another, without the
whitespace at its ends unless the unit keeps it. The string of a link part, its
`"` units and the `url-text` between them, is one `String` token from its
opening to its closing quote: `href "u"` has the `Keyword` token `href` and the
`String` token `"u"`. [fixture: gantt/gram-click-href] Every other item is one
unit, and so one token.

A token holds no whitespace at its ends, except where mermaid.js reads it as
part of a value (see [Tokens](../tokens.md#tokens)). The units whose values keep
the whitespace at their ends keep it in their tokens too: a `task-text`, the
whitespace before the colon included (`a  : 1d` has the token `a` and two
spaces); a `setting-text`, a `marker-text`, a `title-text`, and a `section-text`
(`dateFormat` and two spaces before `X` has the token of a space and `X`, and
`title T` and two spaces the token `T` and two spaces); a `callback-name`, the
whitespace and line feeds before its `(` included (`call f ()` has the token `f`
and a space); and a `callback-arguments` unit (`call f( 1)` has the token of a
space and `1`). [fixture: gantt/lex-task-text-trailing-spaces] [fixture:
gantt/lex-dateformat-two-spaces] [fixture: gantt/lex-title-trailing-spaces]
[fixture: gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
gantt/gram-click-call-arguments-leading-space] An accessibility text, whose
value mermaid.js trims, and an item of task data, whose unit has no whitespace
at its ends, leave it out: `accTitle: T` and two spaces has the token `T`.
[fixture: gantt/gram-acc-title-trailing-spaces] [fixture:
gantt/lex-task-items-nbsp-trimmed]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says, and a cut `String` token becomes `StringFragment` tokens; inside a token
of any other kind, a directive or an ignored `;` makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/gantt.md#directives-inside-units)):
`a : 1%%{init: {}}%%d` has the `RawText` tokens `1` and `d` with the `Directive`
token between them, while `click id%%{init: {}}%%1 href "u"` is rejected.
[fixture: gantt/lex-directive-in-task-data] [fixture:
gantt/lex-directive-in-task-text] [fixture: gantt/lex-directive-in-href-string]
[fixture: gantt/tokens-ignored-semicolon-in-href-string] [fixture:
gantt/div-directive-in-click-id] [fixture:
gantt/div-ignored-semicolon-in-click-id]

- A tag is a `data-item` unit, a text unit, so its token is a `RawText` token,
  as that of an item, although its node is an Identifier: `a : done, 1d` has the
  `RawText` tokens `done` and `1d`. A directive inside a tag cuts its token as
  that of any text unit, and the name of the tag is its text without the
  directive: `a : do%%{init: {}}%%ne, t1, 2024-01-01, 1d` has the tag `done`,
  with the `RawText` tokens `do` and `ne`. [fixture:
  gantt/gram-task-tag-then-item] [fixture: gantt/gram-task-tag-cut-by-directive]
- An empty description block that is a statement has the `Keyword` token
  `accDescr` and the `Punctuator` tokens `{` and `}`. [fixture:
  gantt/gram-acc-descr-block-empty]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token: in
  `title a;b style:#x;`, the first `;` is not the last of its line and is a
  character of the `RawText` token `a;b style:#x`, and the last `;` is an
  `IgnoredSemicolon` token. [fixture:
  gantt/tokens-ignored-semicolon-in-title-text]
