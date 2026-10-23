# percent-brace-after-unit

Japanese version:
[percent-brace-after-unit.ja.md](./percent-brace-after-unit.ja.md)

Diagram type: gantt. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A directive is written between `%%{` and `}%%`, as in `%%{init: {}}%%` (see
[Where a directive is](../common.md#where-a-directive-is)). A `%%{` that no word
follows, as in `%%{ }%%`, `%%{}`, `%%{-x}%%`, or `%%{` alone at the end of a
line, starts no directive and stays in the text. In a Gantt chart, such a text
on a line of its own after a statement is a comment of the diagram:

```mmd
gantt
  a : 1d
  %%{ }%%
  b : 2d
```

[fixture: gantt/lex-percent-brace-line-after-task]

This document is about such a `%%{` where mermaid.js reaches it directly, as
[Comments](../diagrams/gantt.md#comments) defines it: right after a unit on its
line, after whitespace of two or more characters that leaves not exactly one
character after its leading line feeds, or after the line feeds that a `%`
comment reached directly takes. In this specification, every `%%{` that starts
no directive is a comment where a unit starts.

## The difference

Each example is a whole Gantt chart.

1. `%%{ }%%` right after the header:

   ```mmd
   gantt%%{ }%%
     title T
   ```

2. `%%{ }%%` right after a keyword:

   ```mmd
   gantt
     inclusiveEndDates%%{ }%%
     title T
   ```

3. `%%{ }%%` right after the string of a link:

   ```mmd
   gantt
     a : id1, 2024-01-01, 1d
     click id1 href "u"%%{ }%%
   ```

4. `%%{ }%%` after a line feed and two spaces:

   ```mmd
   gantt
     title T
       %%{ }%%
   ```

5. `%%{ }%%` after an empty line:

   ```mmd
   gantt
     title T

     %%{ }%%
   ```

6. `%%{ }%%` on the line after a `%` comment that follows the header directly:
   `gantt% c`, a line feed, and `%%{ }%%`.

7. `%%{ }%%` after a line feed and one space:

   ```mmd
   gantt
     title T
    %%{ }%%
   ```

| Example | mermaid.js | This specification               |
| ------- | ---------- | -------------------------------- |
| 1       | rejected   | a chart with the title T         |
| 2       | rejected   | a chart with inclusive end dates |
| 3       | rejected   | a chart with the link            |
| 4       | rejected   | a chart with the title T         |
| 5       | rejected   | a chart with the title T         |
| 6       | rejected   | a chart with no statement        |
| 7       | the same   | a chart with the title T         |

[fixture: gantt/div-percent-brace-glued-after-header] [fixture:
gantt/div-percent-brace-glued-after-keyword] [fixture:
gantt/div-percent-brace-glued-after-string] [fixture:
gantt/div-percent-brace-after-two-spaces] [fixture:
gantt/div-percent-brace-after-blank-line] [fixture:
gantt/div-percent-brace-after-glued-percent-comment] [fixture:
gantt/lex-percent-brace-after-line-feed-space]

The other forms are read in the same way: `%%{}` and `%%{` right after the
header, `%%{ }%%` right after a day name, a description block, or an empty
description block, after a space and a line feed, and after a `%` comment line
and an empty line are comments here and rejected by mermaid.js, while `%%{ }%%`
after a line feed and a tab, after a unit and one space, where it takes the rest
of the line, on the line after a `%` comment line, after a click statement, and
`%%{}` or `%%{-x}%%` on a line of its own are comments in both. [fixture:
gantt/div-percent-brace-glued-empty-after-header] [fixture:
gantt/div-percent-brace-open-glued-after-header] [fixture:
gantt/div-percent-brace-glued-after-day] [fixture:
gantt/div-percent-brace-glued-after-block] [fixture:
gantt/div-percent-brace-glued-after-empty-block] [fixture:
gantt/div-percent-brace-after-space-line-feed] [fixture:
gantt/div-percent-brace-after-percent-comment-blank-line] [fixture:
gantt/lex-percent-brace-after-tab] [fixture:
gantt/lex-percent-brace-after-unit-space] [fixture:
gantt/lex-percent-brace-after-percent-comment-line] [fixture:
gantt/lex-percent-brace-after-call-line-feed] [fixture:
gantt/lex-percent-brace-after-href-space] [fixture:
gantt/lex-percent-brace-empty-line] [fixture:
gantt/lex-percent-brace-non-word-line] The difference goes one way: this
specification accepts inputs that mermaid.js rejects, and it never rejects one
that mermaid.js accepts here. Where a `%%{` lies inside a title text, task data,
or another text, it is text in both. [fixture:
gantt/lex-percent-brace-in-title-text] [fixture:
gantt/lex-percent-brace-in-task-data]

## What it means for an author

A `%%{` that is no directive is read as a comment by this toolkit, and by
mermaid.js only where a line feed, one whitespace character, or another
character stands right before it. To write a chart that both read the same,
write a directive with a name after its `%%{`, as in `%%{init: {}}%%`, and write
nothing else that starts with `%%{`.

## Why mermaid.js reads it so

The first rule of the lexer of mermaid.js for this diagram reads `%%{` and
enters a state named `open_directive`
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L18-L18)),
which the lexer does not declare, and returns a token that the grammar does not
take; the rule is a remnant of the time when the lexer read directives itself,
before mermaid.js removed them from the text. mermaid.js removes every directive
before the lexer runs, so the rule meets only a `%%{` that starts no directive,
and the input is rejected. The rule is tried only where the lexer stands
directly at the `%%{`. Where one character that is not `}` stands right before
it, a line feed, a space, or a character of a text, a later rule reads that
character, the `%`, and the rest of the line as one comment
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L29-L29)),
and the input is accepted. The lexer stands directly at the `%%{` after a unit
that ends right before it, after the one whitespace character that leaves its
click state, after a run of two or more whitespace characters, which its rules
for line feeds and for whitespace read as a whole unless exactly one character
is left after the leading line feeds, and after the line feeds that a `%`
comment takes when the lexer reaches it so
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L30-L30)).

## The rule of this specification, and why

In this specification, `%%{` that starts no directive is a comment of the
diagram wherever a unit starts, as `%%` is (see
[Comments](../diagrams/gantt.md#comments)): the tree holds it as a comment with
the mark `%%`, and the input is read as what was written. Whether mermaid.js
accepts it depends on which character its lexer last read before the `%%{`, that
is, on the order of the rules of its lexer, which is nothing a specification
would state as a rule of the syntax: the second of the reasons for a known
divergence (see [known-divergences.md](../known-divergences.md)). The inputs
that mermaid.js rejects for this reason are the divergence.

## The documentation of mermaid.js and its issues

- The documentation of Gantt charts of mermaid.js says, under
  [Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gantt.md#L319-L322),
  that comments "need to be on their own line and must be prefaced with `%%`",
  and says nothing about `%%{`.
- On 2026-10-08, the issues and pull requests of mermaid-js/mermaid were
  searched for "gantt open_directive", "gantt %%{", "gantt directive", and
  "gantt percent"; none reports this behavior.
