# Sequence positions

Japanese version: [sequence.ja.md](./sequence.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/sequence.md`](../../../spec/docs/ast/sequence.md); the
tokens in [tokens/sequence.md](../tokens/sequence.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### SequenceDiagram

The range runs from the keyword to the last token of the diagram text other than
a `Directive` or an `IgnoredSemicolon` token, the tokens that belong to no
statement included, as for the node in `Root.body` of every diagram (see
[Nodes](../../../spec/docs/ast.md#nodes)). [fixture:
sequence/gram-title-then-separators] [fixture:
sequence/tokens-comment-then-ignored-semicolon]

### SequenceParticipantStatement

The range starts at `create` when it is there. [fixture:
sequence/db-create-participant-before-message] [fixture:
sequence/db-participant-empty-alias]

### SequenceDestroyStatement

The range starts at `create` when it is there. [fixture:
sequence/gram-create-destroy] [fixture: sequence/db-destroy-participant]

### SequenceBoxText

A part is one token, unless a directive cuts it into tokens of the same kind
(see [Tokens](../tokens/sequence.md#tokens)): in `box Gr%%{init: {}}%%oup`, the
range of the candidate covers the `RawText` tokens `Gr` and `oup` and the
directive between them. [fixture:
sequence/tokens-box-text-directive-in-candidate] [fixture:
sequence/tokens-box-text-directive-in-remainder]

### SequenceArrow

Its range is its token. [fixture: sequence/db-message-activate-target]

### SequenceSection

The range starts at the keyword that starts the section, `else`, `and`, or
`option`, or, for the first section, the keyword of the block, and ends at its
last token; `end` belongs to the block. [fixture: sequence/db-block-alt]
[fixture: sequence/db-block-par] [fixture: sequence/db-block-critical]

### SequenceIdentifier

Its tokens are `RawText` tokens: one, or more when a directive or an ignored `;`
inside the unit cuts it (see [Tokens](../tokens/sequence.md#tokens)). In
`participant A%%{init: {}}%% c%%B`, the one unit of the participant is cut into
the tokens `A` and ` c%%B`, the space that the id holds included. [fixture:
sequence/lex-directive-in-id-before-space] [fixture:
sequence/tokens-ignored-semicolon-in-participant-id] [fixture:
sequence/db-participant-empty-alias]

### SequenceText

The range runs from the prefix, or from the text when there is no prefix, to the
end of the text. [fixture: sequence/lex-wrap-prefix-colon] [fixture:
sequence/db-note-over-two]

### SequenceDataBlock

Its range runs from `@{` to `}`. [fixture:
sequence/gram-data-block-line-break-only]
