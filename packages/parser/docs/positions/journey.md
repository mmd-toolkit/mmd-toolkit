# Journey positions

Japanese version: [journey.ja.md](./journey.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/journey.md`](../../../spec/docs/ast/journey.md); the
tokens in [tokens/journey.md](../tokens/journey.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### JourneyDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### JourneyTaskStatement

The range runs from the description to the last token of the data: the ignored
data, the last person, the last `,` when the person after it is empty, the
second colon when the people part holds only whitespace, the score, or the first
colon when the data holds only whitespace. `A: 5: Me,` covers `A: 5: Me,`,
`A: 5:` covers `A: 5:`, and `A:` followed by a space covers `A:`. [fixture:
journey/db-task-people] [fixture: journey/db-task-extra-colon] [fixture:
journey/gram-task-people-trailing-comma] [fixture:
journey/gram-task-second-colon-at-end] [fixture: journey/db-task-score-only]
[fixture: journey/gram-task-data-whitespace-only]

### JourneyTitleStatement and JourneySectionStatement

The range runs from the keyword to the end of its text, the whitespace at the
end of the text included, which the token keeps (see
[Tokens](../tokens/journey.md#tokens)): `title T` followed by three spaces
covers the three spaces, and `section` followed by two spaces, whose name is a
space, covers both spaces. [fixture: journey/lex-title-trailing-spaces]
[fixture: journey/lex-section-whitespace-only]

### JourneyAccTitleStatement and JourneyAccDescrStatement

The range runs from the keyword to the last character of the text that is not
whitespace: the whitespace at the end of the line, which the value leaves out,
is outside it. [fixture: journey/gram-acc-title-trailing-spaces]

### JourneyLiteral

The range is that of its token, with the whitespace at its ends where the token
keeps it (see [Tokens](../tokens/journey.md#tokens)), and the value is the
written text of the range: the description of `Make tea  : 3` covers `Make tea`
and the two spaces before the colon, and the title of `title T` followed by
three spaces covers `T` and the three spaces. [fixture:
journey/db-task-description-spaces] [fixture: journey/lex-title-trailing-spaces]

### JourneyIgnoredText

The range runs from the third colon of the data to its last character that is
not whitespace: `A: 3: a,b: c, d` has the ignored text `: c, d`, and `A: 5: Me:`
the ignored text `:`; the whitespace after its last character, at the end of the
data, is outside it, and outside the task. A directive in the data lies inside
the range, and the value leaves it out: the ignored text of
`A: 5: Me: a %%{init: {}}%%b` runs from the third colon to `b`, with the value
`: a b`. [fixture: journey/lex-directive-after-space-in-ignored-data] [fixture:
journey/db-task-extra-colon] [fixture: journey/gram-task-third-colon-at-end]
[fixture: journey/gram-task-four-colons] [fixture:
journey/gram-task-ignored-data-trailing-spaces]
