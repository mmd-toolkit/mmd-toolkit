# Timeline positions

Japanese version: [timeline.ja.md](./timeline.ja.md)

This document defines the ranges of the nodes of the diagram type in the tree
that `@mmd-toolkit/parser` produces, besides the rules shared by all diagram
types in [positions.md](../positions.md). The nodes are defined by the
specification in [`ast/timeline.md`](../../../spec/docs/ast/timeline.md); the
tokens in [tokens/timeline.md](../tokens/timeline.md).

## Ranges

The ranges of the nodes of this diagram type, besides the rules of
[positions.md](../positions.md#node-ranges):

### TimelineDiagram

The range is that of the node in `Root.body` of every diagram (see
[Node ranges](../positions.md#node-ranges)).

### TimelinePeriodStatement and TimelineEventStatement

The range runs from the period, or the colon of the first event, to the last
token of the last event, over the lines between them: `a` followed by the lines
`: e1` and `: e2` covers the three lines, from `a` to `e2`, also with an empty
line between them. The whitespace that a period or an event keeps at its end is
inside the range: `a :` followed by two spaces covers `a :` and the space of its
event. [fixture: timeline/db-event-own-line] [fixture:
timeline/db-event-own-line-after-blank-line] [fixture:
timeline/db-event-two-spaces] [fixture:
timeline/db-event-after-section-joins-earlier-task]

### TimelineTitleStatement and TimelineSectionStatement

The range runs from the keyword to the end of its text, the whitespace at the
end of the text included, which the token keeps (see
[Tokens](../tokens/timeline.md#tokens)): `title T` followed by three spaces
covers the three spaces. [fixture: timeline/db-title-trailing-spaces] [fixture:
timeline/db-section-trailing-spaces]

### TimelineAccTitleStatement and TimelineAccDescrStatement

The range runs from the keyword to the last character of the text that is not
whitespace: the whitespace at the end of the line, which the value leaves out,
is outside it. [fixture: timeline/db-acc-title-trailing-spaces]

### TimelineLiteral

The range is that of its token, with the whitespace at its ends where the token
keeps it (see [Tokens](../tokens/timeline.md#tokens)), and the value is the
written text of the range: the period of `a : e` covers `a` and the space before
the colon. [fixture: timeline/db-period-and-event] [fixture:
timeline/db-period-trailing-spaces]
