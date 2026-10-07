# State positions

Japanese version: [state.ja.md](./state.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/state.md`](../../../spec/docs/ast/state.md); the tokens
in [tokens/state.md](../tokens/state.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### StateDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### StateAliasDefinitionStatement

A `;` that the line rule ignores cuts the second description: in
`state "d" as A style:#x;` followed by two spaces, its tokens are `#x` and the
two spaces, with the `IgnoredSemicolon` token between them. [fixture:
state/tokens-alias-ignored-semicolon-then-spaces]

### StateDirectionStatement

The range covers the whole direction line. [fixture:
state/lex-direction-line-value-then-text] [fixture:
state/lex-direction-line-in-description]

### StateIgnoredStatement

Its range runs from the first `"` of the run to the last. [fixture:
state/gram-state-empty-string-alone] [fixture:
state/tokens-ignored-statement-directive-between-empty-strings]

### StateIgnoredText

Its range covers the tokens of the units it holds, each of the kind that
[Tokens](../tokens/state.md#tokens) gives for its unit, whatever the kind: the
`String` token of an empty string, the `RawText` token of a `%%`, the `Keyword`
token `accDescr` and the `Punctuator` tokens `{` and `}` of an empty description
block, and the `Keyword` token of an `ignored-state` unit. The kind of a token
is decided by its unit, not by the node that holds it. [fixture:
state/gram-empty-description-block-before-alias-body-next-line] [fixture:
state/gram-state-empty-string-before-name] [fixture:
state/gram-ignored-percent-before-body-next-line] [fixture:
state/gram-ignored-state-before-body-next-line]
