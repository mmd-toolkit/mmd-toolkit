# Sequence tokens

Japanese version: [sequence.ja.md](./sequence.ja.md)

This document defines the tokens of the diagram type `sequence` in the tree that
`@mmd-toolkit/parser` produces. The nodes are defined by the specification in
[`ast/sequence.md`](../../../spec/docs/ast/sequence.md); the tokens shared by
all diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/sequence.md](../../../spec/docs/diagrams/sequence.md#lexical-structure).
Every unit that is not all whitespace, the `title-text` unit of a `title` or
`title:` statement, and a `text` unit of a box that holds a U+2028 or U+2029
(see
[SequenceTitleStatement](../../../spec/docs/ast/sequence.md#sequencetitlestatement)
and [SequenceBoxText](../../../spec/docs/ast/sequence.md#sequenceboxtext)), is
one token, of the kind that this table gives for it:

| Kind         | Units                                                                                                                                                                                                                                                                                                                                                                                                              |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Keyword`    | the keywords: `sequenceDiagram`, `participant`, `actor`, `create`, `destroy`, `as`, `box`, `loop`, `rect`, `opt`, `alt`, `else`, `par`, `par_over`, `and`, `critical`, `option`, `break`, `end`, `note`, `left`, `right`, `of`, `over`, `links`, `link`, `properties`, `details`, `activate`, `deactivate`, `autonumber`, and `off`; the `title`, `title:`, `accTitle`, and `accDescr` units; a `wrap-prefix` unit |
| `Numeric`    | a `number` unit                                                                                                                                                                                                                                                                                                                                                                                                    |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/sequence.md#directives-inside-units)                                                                                                                                                                                                                                                                                                       |
| `Punctuator` | an `arrow` unit; `+`, `-`, `()`, `,`, `:`, `{`, `}`, and `@{`; a `newline` unit read from `;`                                                                                                                                                                                                                                                                                                                      |

A token holds its unit without the whitespace at its ends, except where
mermaid.js reads that whitespace as part of a value (see
[Tokens](../tokens.md#tokens)): the token of the `title-text` unit of a `title`
or `title:` statement is the whole unit, while that of `accTitle:` is without
the whitespace at its ends, which mermaid.js trims, and in a box text a U+2028
or U+2029 counts as no whitespace (see
[SequenceBoxText](../../../spec/docs/ast/sequence.md#sequenceboxtext)). In a box
text, the whitespace between the colour candidate and the remainder, which the
value of the SequenceBoxText holds and neither of its parts does, is a `RawText`
token of its own, held by the SequenceBoxText; a directive in it cuts it as it
cuts any token: `box Aqua G` has the tokens `Aqua`, a space, and `G`. [fixture:
sequence/tokens-box-text-space-between-parts] [fixture:
sequence/tokens-box-text-directive-between-parts] A directive right after the
colour candidate is outside that whitespace, so without whitespace there is no
such token: `box red%%{init: {}}%%-team` has the tokens `red`, the directive,
and `-team`, and `box red%%{init: {}}%% text` the tokens `red`, the directive, a
space, and `text`. [fixture:
sequence/tokens-box-text-directive-between-parts-without-space] [fixture:
sequence/tokens-box-text-directive-then-space-before-remainder] A `newline` unit
read from line feeds is whitespace and no token. A directive, a comment region,
or an ignored `;` inside a token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says: `title x %%{init: {}}%%` followed by two spaces has the tokens `x` with a
space and the two spaces, and the title `x` and three spaces. [fixture:
sequence/tokens-title-directive-then-spaces] A directive or an ignored `;`
inside a token that is not a `RawText` token makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/sequence.md#directives-inside-units)).

- A participant id is one `RawText` token, the whitespace inside it included,
  which mermaid.js reads as part of the id, and a directive or an ignored `;`
  cuts it as any text: `participant A %%{init: {}}%% B` has the tokens `A ` and
  ` B`, and the id `A`, two spaces, and `B`. [fixture:
  sequence/tokens-directive-participant-spaces] [fixture:
  sequence/tokens-ignored-semicolon-in-participant-id]
- The keyword `left of` or `right of` is two `Keyword` tokens, one for each
  word. A directive or an ignored `;` next to the space between the words lies
  between the two tokens: `Note left%%{init: {}}%% of A: t` is a note, as in
  mermaid.js. [fixture: sequence/lex-directive-between-left-and-of] [fixture:
  sequence/tokens-ignored-semicolon-between-left-and-of]
- The `:` before a text, and the `:` after `accTitle` and `accDescr`, are
  `Punctuator` tokens of the statement and belong to no field.
- The wrap prefix of a text, such as `wrap:` or `:nowrap:`, is one `Keyword`
  token, the first token of its
  [SequenceText](../../../spec/docs/ast/sequence.md#sequencetext).
- The text of a data block between `@{` and `}` is one `RawText` token with the
  whitespace and line feeds at its ends, which the value of the
  [SequenceDataBlock](../../../spec/docs/ast/sequence.md#sequencedatablock)
  holds: `participant A@{`, a line break, and `}` has the token of the line
  feed, and `participant A@{ type: %%{init: {}}%% actor }` the tokens `type:`
  and `actor`, with the directive between them. An empty line before a comment
  line lies in the comment region, and in neither the value nor a token.
  [fixture: sequence/gram-data-block-line-break-only] [fixture:
  sequence/tokens-data-block-directive-inside] [fixture:
  sequence/tokens-data-block-directive-line] [fixture:
  sequence/tokens-comment-region-in-data-block] [fixture:
  sequence/tokens-comment-region-blank-line-in-data-block]
- A `;` that ends a statement is a `Punctuator` token that belongs to no
  statement, as a line break belongs to none: `title a;;` has the title `a`,
  followed by two such tokens. [fixture: sequence/gram-title-then-separators]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token in every
  context, and it cuts a `RawText` token that it lies inside (see
  [Tokens](../tokens.md#tokens)). In `loop style:#x;` the text `style:` leaves
  the line context, `#x` is a diagram comment of the statement context, and the
  `;` after it is an `IgnoredSemicolon` token, as in `title style:a#b;`, whose
  title is `style:a`. With `accTitle: style:#x;`, the title is `style:#x` and
  the `;` after it is an `IgnoredSemicolon` token, and so is the `;` after
  `style:#x` in `participant A@{ style:#x; }`, which cuts the data text into the
  `RawText` tokens ` style:#x` and ` `, and the `;` after
  `participant A@{ "style": "x:#y" }`. In `participant A@{ "style": "x:#y;" }`
  the `;` cuts the data text into the `RawText` tokens ` "style": "x:#y` and
  `" `. [fixture: sequence/tokens-acc-title-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-ignored-semicolon] [fixture:
  sequence/tokens-acc-descr-block-ignored-semicolon] [fixture:
  sequence/tokens-data-block-ignored-semicolon-alone] [fixture:
  sequence/tokens-data-block-then-ignored-semicolon] [fixture:
  sequence/tokens-data-block-ignored-semicolon-inside] [fixture:
  sequence/tokens-loop-comment-then-ignored-semicolon] [fixture:
  sequence/tokens-title-comment-then-ignored-semicolon] [fixture:
  sequence/tokens-comment-then-ignored-semicolon]
