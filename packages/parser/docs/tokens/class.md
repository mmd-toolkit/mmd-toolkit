# Class tokens

Japanese version: [class.ja.md](./class.ja.md)

This document defines the tokens of the diagram type `classDiagram` in the tree
that `@mmd-toolkit/parser` produces. The nodes are defined by the specification
in [`ast/class.md`](../../../spec/docs/ast/class.md); the tokens shared by all
diagram types are defined in [tokens.md](../tokens.md).

## Tokens

The tokens are made from the units of
[diagrams/class.md](../../../spec/docs/diagrams/class.md#lexical-structure).
Every unit that is not all whitespace belongs to one **item** of
[the grammar](../../../spec/docs/diagrams/class.md#grammar) and has the kind
that this table gives for the item:

| Kind         | Items and their units                                                                                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Keyword`    | a `header` unit; the `class`, `namespace`, `style`, `classDef`, `cssClass`, `callback`, `link`, `click`, `note`, `for`, `href`, `call`, `accTitle`, and `accDescr` units; the `direction` and `direction-value` units; a `link-target` unit |
| `Identifier` | the name units of [Directives inside units](../../../spec/docs/diagrams/class.md#directives-inside-units)                                                                                                                                   |
| `String`     | a `string` or `backquoted` unit                                                                                                                                                                                                             |
| `RawText`    | the text units of [Directives inside units](../../../spec/docs/diagrams/class.md#directives-inside-units); a style, and the name parts and `.` units of a class name or a namespace name, are each one item with all their units            |
| `Punctuator` | the `:` of a `label` unit and the `:` after `accTitle` and `accDescr`; `{`, `}`, `[`, `]`, `:::`, `<<`, `>>`, `~`, `(`, `)`, and `,`; each relation end and line; a `visibility` or `classifier` unit                                       |

A `String` token that a comment region or a directive cuts becomes
`StringFragment` tokens (see
[Comment regions in tokens](../tokens.md#comment-regions-in-tokens) and
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)).

A **token** is a maximal run of units of one item and one kind that follow one
another with nothing between them, and, for the `RawText` items other than a
style and a name of name parts, also with whitespace between them; a token holds
no whitespace at its ends, except where mermaid.js reads it as part of a value
(see [Tokens](../tokens.md#tokens)): the token of a `generic-text` unit, of the
`annotation-name` unit of a member line, of a `member-name` or `return-type`
unit, and of a backquoted name that is not closed holds the whole unit, as
[Member lines](../../../spec/docs/diagrams/class.md#member-lines) and
[Strings, backquoted names, and generic types](../../../spec/docs/diagrams/class.md#strings-backquoted-names-and-generic-types)
define it. A directive, a comment region, or an ignored `;` inside such a run
cuts it into fragments, as
[A token that a directive cuts](../tokens.md#a-token-that-a-directive-cuts)
says, when the run is a `RawText` or a `String` token; inside a run of any other
kind, a directive or an ignored `;` makes the input rejected, also between two
of its units (see
[Directives inside units](../../../spec/docs/diagrams/class.md#directives-inside-units)).

- A class name or a namespace name of name parts is one `RawText` token for each
  run of them without whitespace between them: `Foo-Bar` and `a.b.C` are one
  token each, and `class Foo Bar` has the two tokens `Foo` and `Bar`, and the
  ClassIdentifier `FooBar`. A directive or an ignored `;` cuts such a token as
  any text: `class A%%{init: {}}%%.B` has the tokens `A` and `.B` and the
  ClassIdentifier `A.B`. [fixture: class/gram-name-spaces] [fixture:
  class/gram-name-dash-spaces] [fixture: class/lex-directive-in-dotted-name]
  [fixture: class/tokens-ignored-semicolon-in-relation-name]
- A label is one unit, from its `:`, and two tokens: the `:` and the text
  without the whitespace around it. In a member statement, the text is a member
  line, divided into the tokens of its parts. [fixture: class/lex-label-percent]
  [fixture: class/gram-member-statement]
- A style is one `RawText` token for each run of its units without whitespace
  between them, and so is each style of a `classDef` statement: mermaid.js drops
  the whitespace between two units of a style, so that whitespace lies in no
  token, while the whitespace inside a label is part of the label's token.
  `style A fill :#f00` has the tokens `fill` and `:#f00`, and `style A a b` the
  tokens `a` and `b`. [fixture: class/tokens-style-space-before-colon] [fixture:
  class/tokens-style-tab-before-label] [fixture:
  class/tokens-style-words-joined] [fixture:
  class/tokens-style-hash-after-space] [fixture:
  class/tokens-classdef-space-before-colon] A `,` unit separates two styles:
  `style A bold,italic` has the style tokens `bold` and `italic`, with a `,`
  token between them. A `,` inside a label is part of the style:
  `style A fill : #f00 , stroke-width: 2px` is one style, with the tokens `fill`
  and `: #f00 , stroke-width: 2px`, because the `,` lies in the label
  `: #f00 , stroke-width`. [fixture: class/tokens-style-comma-unit] [fixture:
  class/db-style-spaces]
- In a click statement with `call`, the `(` and `)` belong to the statement; the
  `call` token and the `(` and `)` tokens are in its range.
- The two `~` of a generic type are `Punctuator` tokens of the ClassName, also
  when nothing is between them.
- The units of a relation end and of a line are each one `Punctuator` token,
  also when no whitespace separates them: `<|--` is the two tokens `<|` and
  `--`.
- The keyword `note for` is two `Keyword` tokens, one for each word. A directive
  next to the space between the words lies between the two tokens:
  `note%%{init: {}}%% for A "t"` is a note for A, as in mermaid.js. [fixture:
  class/lex-directive-between-note-and-for]
- A backquoted name that is not closed is one `String` token to the last
  character that mermaid.js reads into the name, the whitespace and line feeds
  at its end included (see
  [StringLiteral](../../../spec/docs/ast.md#stringliteral)); a directive after
  that character lies outside it. A directive inside it cuts it into
  `StringFragment` tokens, as in a closed string, also one between the last
  character of the name that is not whitespace and that last character, where
  the last fragment, after the directive, is of whitespace and line terminators
  only. [fixture: class/tokens-backquote-unclosed-trailing-whitespace] [fixture:
  class/lex-backquote-unclosed-directive-inside] [fixture:
  class/lex-backquote-unclosed-directive-after-line-break] [fixture:
  class/lex-backquote-unclosed-directive-at-end]
- A `;` that the line rule ignores is an `IgnoredSemicolon` token, and it cuts a
  `RawText` or a `String` token that it lies inside (see
  [Tokens](../tokens.md#tokens)): in `style A fill:#f00;` and
  `classDef c fill:#f00;`, the style is `fill:#f00` and the `;` after it is an
  `IgnoredSemicolon` token, also with a space before it, and so is the `;` after
  the text in `accTitle: style:#x;` and in a member line `+x style:#a;`. In a
  member line `+x style:#a; b`, the `;` cuts the name into the `RawText` tokens
  `x style:#a` and `b`, and the name is `x style:#a b`. [fixture:
  class/tokens-style-ignored-semicolon] [fixture:
  class/tokens-style-space-ignored-semicolon] [fixture:
  class/tokens-class-def-ignored-semicolon] [fixture:
  class/tokens-acc-title-ignored-semicolon] [fixture:
  class/tokens-member-ignored-semicolon] [fixture:
  class/tokens-member-ignored-semicolon-inside]
