# State tokens

Japanese version: [state.ja.md](./state.ja.md)

This document defines the tokens of the diagram type `stateDiagram` in the tree
that `@mmd-toolkit/parser` produces. The nodes are defined by the specification
in [`ast/state.md`](../../../spec/docs/ast/state.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/state.md](../../../spec/docs/diagrams/state.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/state.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header` unit; the `state`, `as`, `note`, `position`, `of`, `end`, `click`, `href`, `classDef`, `class`, `style`, `scale`, `width`, `accTitle`, `accDescr`, and `ignored-state` units; the `hide`, `empty`, and `description-word` units; a pseudostate mark; the `direction` and `direction-value` units |
| `Identifier` | the name units of [Directives inside units](../../../spec/docs/diagrams/state.md#directives-inside-units)                                                                                                                                                                                                   |
| `Numeric`    | a `number` unit                                                                                                                                                                                                                                                                                             |
| `String`     | a `string` or `empty-string` unit                                                                                                                                                                                                                                                                           |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/state.md#directives-inside-units)                                                                                                                                                                                                   |
| `Punctuator` | the `:` of a `description` unit, the `:` unit of an alias statement, the `:` unit of a note on one line, and the `:` after `accTitle` and `accDescr`; `-->`, `--`, `:::`, `[*]`, `{`, `}`, and `,`; an `id-comma` unit; a `"` unit of a floating note                                                       |

A `String` token that a comment region or a directive cuts becomes
`StringFragment` tokens (see
[Comment regions in tokens](../tokens.md#comment-regions-in-tokens) and
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)).

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them, and, for the `RawText` items, also with
whitespace between them; a token holds no whitespace at its ends, except where
mermaid.js reads it as part of a value (see [Tokens](../tokens.md#tokens)): the
token of a `second-description` unit holds the whole unit, and where the `:` of
a note on one line starts its text, the token of the `note-text` unit after it
keeps the whitespace at its start, which the text holds: `note left of A`, two
spaces, and `: hi` has the tokens `:` and ` hi`, while with no space after the
`:`, the text `:hi` has the tokens `:` and `hi`. [fixture:
state/tokens-note-two-spaces-before-colon-space] [fixture:
state/lex-note-two-spaces-before-colon] A directive, a comment region, or an
ignored `;` inside such a run cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says, when the run is a `RawText` or a `String` token; inside a run of any other
kind, a directive or an ignored `;` makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/state.md#directives-inside-units)).

- Each word of the keywords `left of`, `right of`, `end note`, and
  `hide empty description` is a `Keyword` token of its own. A directive next to
  the space between two words lies between two tokens:
  `note left%%{init: {}}%% of A: t` is a note, as in mermaid.js. [fixture:
  state/lex-directive-between-left-and-of] [fixture:
  state/lex-directive-between-end-and-note] [fixture:
  state/lex-directive-between-hide-and-empty]
- A description is one unit, from its `:`, and two tokens: the `:` and the text
  without the whitespace around it.
- Each `"` unit of a floating note is a `Punctuator` token of its own, also
  where two follow one another: `note ""x" as N` has three `"` tokens, two
  before the `RawText` token `x` and one after it. [fixture:
  state/lex-floating-note-extra-quote-before-text]
- The units of an empty description block keep their kinds in the
  `textBeforeBody` of a statement too: a `Keyword` token `accDescr` and the
  `Punctuator` tokens `{` and `}`, inside the range of the StateIgnoredText (see
  [StateIgnoredText](../../../spec/docs/ast/state.md#stateignoredtext)).
- A `;` that the line rule ignores is an `IgnoredSemicolon` token, and it cuts a
  `RawText` or a `String` token that it lies inside (see
  [Tokens](../tokens.md#tokens)). In `classDef c fill:#f00;`, the style is
  `fill:#f00` and the `;` after it is an `IgnoredSemicolon` token, and so in
  `accTitle: style:#x;`, after `style:#x` in a note over lines, and in
  `A : style:#x;`, whose description is `style:#x`, also in a composite body. In
  `A : x;`, which the line rule does not change, the `;` is an `Identifier`
  token, the id of a state. In `A : style:#x; B`, the `;` cuts the description
  into the `RawText` tokens `style:#x` and `B`, and the description is
  `style:#x B`. [fixture: state/tokens-classdef-ignored-semicolon] [fixture:
  state/tokens-acc-title-ignored-semicolon] [fixture:
  state/tokens-note-block-ignored-semicolon] [fixture:
  state/tokens-alias-ignored-semicolon] [fixture:
  state/tokens-description-ignored-semicolon] [fixture:
  state/tokens-composite-description-ignored-semicolon] [fixture:
  state/lex-description-then-semicolon] [fixture:
  state/tokens-description-ignored-semicolon-inside] [fixture:
  state/tokens-class-ignored-semicolon]
