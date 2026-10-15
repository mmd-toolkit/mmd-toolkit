# Timeline tokens

Japanese version: [timeline.ja.md](./timeline.ja.md)

This document defines the tokens of the diagram type `timeline` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/timeline.md`](../../../spec/docs/ast/timeline.md); the tokens shared by
all diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/timeline.md](../../../spec/docs/diagrams/timeline.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/timeline.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                 |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header` unit and a `direction` unit; the `title`, `section`, `accTitle`, and `accDescr` units                                                                                                                                                                      |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/timeline.md#directives-inside-units): a `period-text`, an `event-text`, a `title-text`, a `section-text`, an `acc-title-text`, an `acc-description-text`, and an `acc-description-block-text` |
| `Punctuator` | `:`, `{`, and `}`                                                                                                                                                                                                                                                     |

[fixture: timeline/db-direction-td] [fixture: timeline/db-period-and-event]
[fixture: timeline/db-title-statement] [fixture: timeline/db-section-statement]
[fixture: timeline/db-acc-title-statement] [fixture:
timeline/db-acc-descr-statement] [fixture: timeline/db-acc-descr-block]

Every item is one unit, and so one **token**: `timeline TD` has the `Keyword`
tokens `timeline` and `TD`, and `a : e1 : e2` the `RawText` tokens `a` and a
space, `e1` and a space, and `e2`, with a `Punctuator` token `:` before each
event. [fixture: timeline/db-direction-td] [fixture:
timeline/db-event-two-on-a-line] A `:` unit that starts no event is taken by no
rule of the grammar, so the input is rejected and no token is made of it.
[fixture: timeline/gram-event-colon-glued-to-event]

A token holds no whitespace at its ends, except where mermaid.js reads it as
part of a value (see [Tokens](../tokens.md#tokens)). The units whose values keep
the whitespace at their ends keep it in their tokens too: a `period-text`, the
whitespace before what ends it included (`a` followed by three spaces has the
token `a` and the three spaces); an `event-text`, the whitespace after the one
whitespace character that follows its colon included (`a :   e` has the event
token of two spaces and `e`, and `a :` followed by two spaces the event token of
one space); and a `title-text` and a `section-text` (`title  T` has the token of
a space and `T`). An accessibility text, an `acc-title-text`, an
`acc-description-text`, or an `acc-description-block-text`, whose value
mermaid.js trims, leaves it out: `accTitle: T` followed by three spaces has the
token `T`, and `accDescr {`, a line `  line1`, a line `  line2`, and a line
`  }` have the token `line1`, the line break and the indentation, and `line2`.
[fixture: timeline/db-period-trailing-spaces] [fixture:
timeline/db-event-leading-spaces] [fixture: timeline/db-event-two-spaces]
[fixture: timeline/db-title-two-spaces] [fixture:
timeline/db-acc-title-trailing-spaces] [fixture: timeline/db-acc-descr-block]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says; inside a token of any other kind, a directive or an ignored `;` makes the
input rejected (see
[Directives inside units](../../../spec/docs/diagrams/timeline.md#directives-inside-units)):
`a : e%%{init: {}}%%f` has the `RawText` tokens `e` and `f` with the `Directive`
token between them, while `ti%%{init: {}}%%tle T` is rejected. [fixture:
timeline/lex-directive-in-event] [fixture:
timeline/div-directive-in-title-keyword]

- An empty description block has the `Keyword` token `accDescr` and the
  `Punctuator` tokens `{` and `}`. [fixture:
  timeline/db-acc-descr-block-braces-only]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token: after
  `accDescr { style:#x }` on the same line, `a;b` has the `RawText` tokens `a`
  and `b` with the `IgnoredSemicolon` token between them. [fixture:
  timeline/tokens-ignored-semicolon-in-period]
