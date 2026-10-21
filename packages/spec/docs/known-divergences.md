# Known divergences

Japanese version: [known-divergences.ja.md](./known-divergences.ja.md)

This specification, which the parser of mmd-toolkit implements, reads Mermaid
text as the pinned mermaid.js does: it accepts and rejects the same inputs, and
gives an accepted input the same Db, the values from which mermaid.js draws the
diagram. The divergences listed here are the exceptions. Each of them concerns
one piece of syntax, and its document shows the inputs that the two read
differently and how to write them so that both read them the same.

## The divergences

| Identifier                                                                                          | Diagram types                                                                                                                     | Inputs                                                                                                                      | Reason |
| --------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------ |
| [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.md)                 | all                                                                                                                               | A directive inside a name, a keyword, a delimiter, an arrow, or a number                                                    | 2      |
| [`ignored-semicolon-as-token-boundary`](./known-divergences/ignored-semicolon-as-token-boundary.md) | flowchart, sequence, class, state, er, gantt, journey, requirement, mindmap, timeline, xychart, quadrant, block, kanban, c4, venn | An ignored `;` inside a name, a number, a keyword, an arrow, or a delimiter                                                 | 2      |
| [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.md)                         | all                                                                                                                               | An HTML tag that starts in the frontmatter                                                                                  | 2      |
| [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.md)                               | all                                                                                                                               | Embedded data that mermaid.js rejects                                                                                       | none   |
| [`click-reserved-word`](./known-divergences/click-reserved-word.md)                                 | flowchart                                                                                                                         | The word `click` where no click statement starts                                                                            | 3      |
| [`tokenless-empty-forms`](./known-divergences/tokenless-empty-forms.md)                             | flowchart, sequence, class, state, er, gantt, requirement, mindmap, xychart, quadrant, block, kanban                              | An empty form that mermaid.js reads no token for                                                                            | 1      |
| [`comment-takes-character`](./known-divergences/comment-takes-character.md)                         | sequence, gantt, journey, timeline, xychart, quadrant                                                                             | A character or a number right before `%%`, or before `%` in gantt                                                           | 2      |
| [`comment-takes-line-break`](./known-divergences/comment-takes-line-break.md)                       | class, gantt, c4                                                                                                                  | A line break after a comment that follows a unit on its line                                                                | 2      |
| [`headerless-empty-ending`](./known-divergences/headerless-empty-ending.md)                         | class                                                                                                                             | A text without a header that ends with an empty value                                                                       | 2      |
| [`name-start-reads-unit`](./known-divergences/name-start-reads-unit.md)                             | class                                                                                                                             | A backquoted name or generic type that starts with a keyword, `"`, `<<`, or `>>`, or a backquoted name that starts with `~` | 2      |
| [`c4-keyword-anywhere`](./known-divergences/c4-keyword-anywhere.md)                                 | all detected after C4                                                                                                             | `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` after the header of another diagram type                       | 2      |
| [`bare-percent-line-before-header`](./known-divergences/bare-percent-line-before-header.md)         | flowchart, class, state, er, gantt, journey, requirement, timeline, sankey, block, c4                                             | A bare `%%` line before the header, or a line of whitespace only after one, where the lexer of mermaid.js rejects it        | 2      |
| [`percent-brace-after-unit`](./known-divergences/percent-brace-after-unit.md)                       | gantt                                                                                                                             | A `%%{` that starts no directive, right after a unit or after whitespace of two or more characters                          | 2      |
| [`blank-line-after-header-or-comments`](./known-divergences/blank-line-after-header-or-comments.md) | mindmap, kanban                                                                                                                   | An empty line or a line of whitespace after the header or after diagram comments, where the lexer of mermaid.js rejects it  | 2      |
| [`title-digit-after-axis-statement`](./known-divergences/title-digit-after-axis-statement.md)       | xychart                                                                                                                           | A title without quotes with a digit after an axis statement, where the lexer of mermaid.js is still in its axis state       | 2      |

The reason is one of the three under
[When a divergence is made](#when-a-divergence-is-made); `none` marks the
divergence that goes the other way. Each document of a divergence has the same
parts: the syntax that it concerns, the difference with examples, what it means
for an author, why mermaid.js reads the inputs so, the rule of this
specification and why, and the documentation and the issues of mermaid.js where
any were found. Each diagram document lists, in its Known divergences section,
the divergences that apply to it and how they show in that diagram type.

## What is compared

Only the accept or reject decision and the Db are compared. Each group of inputs
that the two decide or read differently has a divergence identifier, and the
fixtures affected by it are marked with that identifier. When both reject an
input, it is not a divergence and its fixture is not marked, even when they
reject it at different stages. `flow%%{init: {}}%%chart LR` followed by a line
`A-->` is rejected by the flowchart grammar in mermaid.js, and by this
specification because the directive lies inside the header keyword. [fixture:
common/directive-splits-header-keyword]

## When a divergence is made

This specification rejects an input that mermaid.js accepts only for one of
three reasons, and only as a divergence listed here:

1. Text that mermaid.js does not read has no place of its own in the tree. Text
   that mermaid.js does not read is a node wherever it can be one, such as a
   [FlowchartIgnoredText](./ast/flowchart.md#flowchartignoredtext) or an empty
   description block that starts a statement, and such an input is accepted;
   that mermaid.js does not read a text is not by itself a reason to reject it.
   The same holds for text that mermaid.js reads as something other than what is
   written: it is accepted and shown in the tree as written. The exception is a
   form written with a meaning of its own, as a string, a link, or a call, that
   mermaid.js discards whole: an empty string where a statement starts in
   flowchart and class, an empty call where a statement starts in flowchart, an
   empty href or an empty call in gantt, wherever it stands, an empty string in
   requirement, wherever it stands, an empty icon, an empty class line, or an
   empty string inside a shape in mindmap, an empty string in xychart where it
   is not the whole title of an axis or of a plot or the whole label of a value,
   an empty string or an empty markdown string in quadrant, wherever it stands,
   an empty string or an empty markdown string in block, wherever it stands, and
   an empty icon, an empty class line, or an empty string inside a shape in
   kanban. [fixture: kanban/div-empty-string-before-label] The tree holds no
   statement that changes nothing for such a form, and the input is rejected as
   [tokenless-empty-forms](./known-divergences/tokenless-empty-forms.md). An
   empty string after `state` or after a statement in the state context of state
   is no such form: mermaid.js reads the statement before it, and the empty
   string is a [StateIgnoredStatement](./ast/state.md#stateignoredstatement).
2. This specification states a direct rule where the behavior of mermaid.js
   comes from the order of the steps of its pipeline or of the rules of its
   lexer, and is nothing that a specification would state. The inputs that are
   then read differently are the divergence; they may also be inputs that both
   accept with a different Db, or that only this specification accepts.
3. The maintainers of mermaid.js treat the behavior as a defect.

Before a divergence is made for a behavior that looks like a defect, the issues
and pull requests of mermaid.js are searched, and what is found is cited in the
document of the divergence as fact.

A divergence can also go the other way: this specification accepts some inputs
that mermaid.js rejects, where the reason for the rejection is nothing that the
tree depends on, as when mermaid.js rejects the content of embedded data
(`embedded-data-opaque`), and where the rejection comes from the order of the
steps of its pipeline or of the rules of its lexer (the second reason above) and
the direct rule of this specification accepts more: `c4-keyword-anywhere`,
`bare-percent-line-before-header`, and `percent-brace-after-unit`. A divergence
of the second reason may also go both ways, with inputs that only this
specification accepts among those that only mermaid.js accepts, as
`comment-takes-character`, `comment-takes-line-break`, `name-start-reads-unit`,
and `html-tag-in-frontmatter` do.
