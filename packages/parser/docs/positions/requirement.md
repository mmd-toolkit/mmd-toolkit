# Requirement positions

Japanese version: [requirement.ja.md](./requirement.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/requirement.md`](../../../spec/docs/ast/requirement.md);
the tokens in [tokens/requirement.md](../tokens/requirement.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### RequirementDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### Statements and fields that end with an unquoted text

An `unquoted-text` unit reads the whitespace after it on its line, which its
token leaves out (see [Tokens](../tokens/requirement.md#tokens)), so a statement
or a field that ends with one ends at its last character that is not whitespace:
the field `id:   1` followed by two spaces covers `id:   1`, and
`text:   spaced out` followed by three spaces covers `text:   spaced out`.
[fixture: requirement/db-requirement-value-spaces]

### RequirementClassStatement

The range runs from `class` to the last class, also where the statement goes on
after the line feed that leaves the style context: `class r`, a line break, and
`c` covers both lines. [fixture: requirement/lex-class-list-next-line]

### RequirementIdentifier and RequirementLiteral

The range is that of the tokens of the node, and the value is the written text
of the range, except for a style: an unquoted name or value covers its
characters without the whitespace after them, the whitespace between them
included (`requirement  spaced name  {` has the name `spaced name`, which covers
`spaced name`), and an accessibility text covers its text without the whitespace
at its ends. A style covers its units from the first to the last, the spaces
between them included, while its value leaves them out: the first style of
`style r fill: red , stroke : blue` covers `fill: red` and has the value
`fill:red`. [fixture: requirement/db-requirement-name-spaces] [fixture:
requirement/db-acc-title-descr] [fixture: requirement/lex-style-spaces]

### RequirementIgnoredText

The text of a direction line covers it without the whitespace at its ends:
`foo direction LR bar` has the texts `foo` and `bar`. An empty description block
in a body covers it from `accDescr` to `}`, also over several lines, and the
value leaves out a comment line inside it: `accDescr {`, a comment line `%% c`,
and `}` has the value `accDescr {`, a line feed, and `}`. [fixture:
requirement/lex-direction-line-text-before-and-after] [fixture:
requirement/gram-empty-description-block-multiline-in-body] [fixture:
requirement/gram-empty-description-block-comment-line-in-body]
