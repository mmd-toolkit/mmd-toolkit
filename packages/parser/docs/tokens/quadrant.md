# Quadrant chart tokens

Japanese version: [quadrant.ja.md](./quadrant.ja.md)

This document defines the tokens of the diagram type `quadrantChart` in the tree
that `@mmd-toolkit/parser` produces. The nodes are defined by the specification
in [`ast/quadrant.md`](../../../spec/docs/ast/quadrant.md); the tokens shared by
all diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/quadrant.md](../../../spec/docs/diagrams/quadrant.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/quadrant.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                        |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | the header and the `title`, `accTitle`, `accDescr`, `x-axis`, `y-axis`, `quadrant-1` to `quadrant-4`, and `classDef` units                                                                                                                   |
| `RawText`    | the words of a text without quotes, of a name of a point, and of the rest of a text after a string; a `title-text`, an `acc-title-text`, an `acc-description-text`, and a `description-block-text`; a `coordinate`; and the units of a style |
| `String`     | a `string` and a `markdown-string` unit, with its quotes and backquotes                                                                                                                                                                      |
| `Identifier` | a `class-name` unit, an [Identifier](../../../spec/docs/ast.md#identifier), and the units of the name of a class of `classDef`, a QuadrantIdentifier                                                                                         |
| `Punctuator` | the `arrow`, `:::`, `:`, `[`, `,`, `]`, `{`, `}`, and `;` units of the grammar's own items, and the `,` between two styles                                                                                                                   |

[fixture: quadrant/db-y-axis-both] [fixture:
quadrant/db-quadrant-quoted-then-bare] [fixture: quadrant/db-name-markdown]
[fixture: quadrant/db-class-plain] [fixture: quadrant/db-style-two] [fixture:
quadrant/db-classdef-two-styles]

The units of a text without quotes, a name, a style, and the name of a class
follow one another, the `space` units among them, so each is one token, from its
first character that is not whitespace of ASCII to its last, with the whitespace
between its words inside it: `quadrant-1   A  b   ` has the `RawText` token
`A  b`, and `radius: 10, color: #f00` the `RawText` tokens `radius: 10` and
`color: #f00` with the `Punctuator` token `,` between them. A `:` and a `-`
inside a style or a name are characters of its token, not `Punctuator` tokens. A
keyword, the header, the arrow, and a `]` leave out the spaces that their units
read around them: `x-axis L -->` has the tokens `x-axis`, `L`, and `-->`. A
`space` unit and a `newline` unit are all whitespace and make no token.
[fixture: quadrant/db-quadrant-spaces-trimmed] [fixture: quadrant/db-style-two]
[fixture: quadrant/db-classdef-two-styles] [fixture:
quadrant/db-x-axis-left-with-arrow] [fixture: quadrant/db-point-plain]

The whitespace that a token leaves out at its ends is the whitespace of ASCII: a
space, a tab, a vertical tab, a form feed, and a line feed. U+00A0, U+2028,
U+2029, U+3000, and U+FEFF are characters of a word in this diagram type (see
[Lexical structure](../../../spec/docs/diagrams/quadrant.md#units-and-contexts)),
so they stay in the token of a text, a name, and the name of a class, at its
ends too: `quadrant-1 A` and U+00A0 has the `RawText` token of `A` and the
U+00A0, and `x-axis L`, U+00A0, `-->`, U+00A0, and `R` the `RawText` tokens `L`
with the U+00A0 after it and `R` with the U+00A0 before it. [fixture:
quadrant/db-ends-quadrant-nbsp-end] [fixture:
quadrant/db-x-axis-nbsp-around-arrow] [fixture: quadrant/db-name-after-nbsp]
[fixture: quadrant/db-grid-nbsp-classdef-name] The token of a title, an
accessibility text, and the text of a description block leaves out every
whitespace character of Notation at its ends, U+00A0 included, as its value does
(see [ast/quadrant.md](../../../spec/docs/ast/quadrant.md#quadrantliteral)):
`title`, U+00A0, and `T` has the `RawText` token `T`, and `title` and U+3000
only the token of `title`. [fixture: quadrant/db-title-nbsp-before-text]
[fixture: quadrant/db-ends-title-nbsp-end] [fixture:
quadrant/db-title-ideographic-only] [fixture:
quadrant/db-acc-descr-nbsp-around-text] [fixture:
quadrant/db-acc-descr-block-nbsp-before-brace-close]

A text that starts with a string has the `String` token of the string and a
`RawText` token of its rest: `quadrant-1 "a" b` has the tokens `"a"` and `b`. A
title with no text has the token of `title` only, and an empty description block
the tokens of `accDescr`, `{`, and `}`. [fixture:
quadrant/db-quadrant-quoted-then-bare] [fixture:
quadrant/db-title-keyword-alone] [fixture:
quadrant/db-acc-descr-block-empty-braces] [fixture:
quadrant/db-empty-block-after-point]

A directive, a comment region, or a `;` that the line rule ignores inside a
`RawText` or a `String` token cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says; inside a token of any other kind, an `Identifier` token included, a
directive or an ignored `;` makes the input rejected (see
[Directives inside units](../../../spec/docs/diagrams/quadrant.md#directives-inside-units)):
`quadrant-1 a%%{init: {}}%%b%%{init: {}}%%c` has the `RawText` tokens `a`, `b`,
and `c` with a `Directive` token between each two, while
`A:::c%%{init: {}}%%1: [0.3, 0.6]` is rejected. [fixture:
quadrant/db-directive-two-in-text] [fixture:
quadrant/div-class-directive-inside]
