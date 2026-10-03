# Known divergences

Japanese version: [known-divergences.ja.md](./known-divergences.ja.md)

This specification follows mermaid.js in every accept or reject decision and
every Db value, except for the inputs of the divergences listed here. Each group
of such inputs has a divergence identifier, and the fixtures affected by it are
marked with that identifier. Only the accept or reject decision and the Db are
compared: when both reject an input, it is not a divergence and its fixture is
not marked, even when they reject it at different stages.
`flow%%{init: {}}%%chart LR` followed by a line `A-->` is rejected by the
flowchart grammar in mermaid.js, and by this specification because the directive
lies inside the header keyword, a `Keyword` unit. [fixture:
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
   written: it is accepted and shown in the tree as written.
2. This specification states a direct rule where the behavior of mermaid.js
   comes from the order of the steps of its pipeline or of the rules of its
   lexer, and is nothing that a specification would state. The inputs that are
   then read differently are the divergence; they may also be inputs that both
   accept with a different Db, or that only this specification accepts.
3. The maintainers of mermaid.js treat the behavior as a defect.

Before a divergence is made for a behavior that looks like a defect, the issues
and pull requests of mermaid.js are searched, and what is found is cited in the
document of the divergence as fact.

A divergence can also go the other way only: this specification accepts some
inputs that mermaid.js rejects, where the reason for the rejection is nothing
that the tree depends on (`embedded-data-opaque`).

## The divergences

| Identifier                                                                          | Diagram types                     | Inputs                                                              | Reason |
| ----------------------------------------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------- | ------ |
| [`directive-as-token-boundary`](./known-divergences/directive-as-token-boundary.md) | all                               | A directive inside a unit that is not `RawText` or `Identifier`     | 2      |
| [`html-tag-in-frontmatter`](./known-divergences/html-tag-in-frontmatter.md)         | all                               | An HTML tag that starts in the frontmatter                          | 2      |
| [`embedded-data-opaque`](./known-divergences/embedded-data-opaque.md)               | all                               | Embedded data that mermaid.js rejects                               | none   |
| [`click-reserved-word`](./known-divergences/click-reserved-word.md)                 | flowchart                         | The word `click` where no click statement starts                    | 3      |
| [`tokenless-empty-forms`](./known-divergences/tokenless-empty-forms.md)             | flowchart, sequence, class, state | An empty form that mermaid.js reads no token for                    | 1      |
| [`comment-takes-character`](./known-divergences/comment-takes-character.md)         | sequence                          | A character or a number right before `%%`                           | 2      |
| [`comment-takes-line-break`](./known-divergences/comment-takes-line-break.md)       | class                             | A line break after a comment that follows a unit on its line        | 2      |
| [`headerless-empty-ending`](./known-divergences/headerless-empty-ending.md)         | class                             | A text without a header that ends with an empty value               | 2      |
| [`name-start-reads-unit`](./known-divergences/name-start-reads-unit.md)             | class                             | A backquoted name or generic type that starts with a keyword or `"` | 2      |

Each document of a divergence has the same parts: the syntax that it concerns,
the difference with examples, why mermaid.js reads the inputs so, the rule of
this specification and why, what it means for an author, the documentation and
the issues of mermaid.js where any were found, and the counts and how they are
checked. Each diagram document lists, in its Known divergences section, the
divergences that apply to it and how they show in that diagram type.

## Checking a divergence

A divergence is checked by comparing the parser of this specification with
mermaid.js on many generated inputs; each document gives the inputs and the
counts. A difference between them is explained by a divergence in one of three
ways, as the document of each divergence says:

- For a divergence that comes from a few rules of the lexer of mermaid.js,
  `@mmd-toolkit/tests` can run mermaid.js with those rules changed to read as
  this specification does: its `runMermaid()` takes the option
  `withoutDivergences`, a list of divergence identifiers (see
  [Running without a known divergence](../../tests/docs/expected-results.md#running-without-a-known-divergence)).
  The parser is to accept and reject every input as mermaid.js changed in this
  way does, and to give it the same Db. This is available for
  [`comment-takes-character`](./known-divergences/comment-takes-character.md),
  [`comment-takes-line-break`](./known-divergences/comment-takes-line-break.md),
  and [`name-start-reads-unit`](./known-divergences/name-start-reads-unit.md).
- For `directive-as-token-boundary`, `html-tag-in-frontmatter`,
  `click-reserved-word`, and `tokenless-empty-forms`, a reference input, the
  input with the text of the divergence removed or changed, is run through
  mermaid.js, and the parser is to give the input what mermaid.js gives the
  reference input, or the other way round, as each document defines.
- For `embedded-data-opaque` and `headerless-empty-ending`, which go one way
  only, a difference must be of the kind that the divergence names: an input
  that mermaid.js rejects for its embedded data, or one that mermaid.js accepts
  and this specification rejects for its missing header.
