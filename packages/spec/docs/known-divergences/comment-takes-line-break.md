# comment-takes-line-break

Japanese version:
[comment-takes-line-break.ja.md](./comment-takes-line-break.ja.md)

Diagram types: class, gantt, and c4. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A comment in a Mermaid diagram starts with `%%` and runs to the end of its line.
mermaid.js leaves it out, as if it were not there. The usual place of a comment
is a line of its own:

```mmd
classDiagram
  %% The animals of the farm
  class Animal
  Animal <|-- Duck
```

A comment can also be written after a statement, on the same line, as in
`Animal <|-- Duck %% ducks`. This document is about such a comment, after a
statement of a class diagram. A comment on a line of its own is read the same by
mermaid.js and by this specification, and so is a comment after a statement on
the last line of the text, also when only a line that holds a directive follows
it. A line whose `%%` follows only a directive is a comment line too. [fixture:
class/lex-comment-own-line] [fixture: class/lex-comment-on-last-line] [fixture:
class/lex-comment-then-directive-at-end] [fixture:
class/lex-directive-then-comment-line]

## The difference

Each example is a whole class diagram.

1. A statement on the next line:

   ```mmd
   classDiagram
     Animal <|-- Duck %% ducks
     class Fish
   ```

2. An empty line, then a statement:

   ```mmd
   classDiagram
     Animal <|-- Duck %% ducks

     class Fish
   ```

3. A member on the next line:

   ```mmd
   classDiagram
     Animal <|-- Duck %% ducks
     Animal : +int age
   ```

4. A relation split by the comment:

   ```mmd
   classDiagram
     Animal <|-- %% ducks
     Duck
   ```

5. A comment on the line of the header:

   ```mmd
   classDiagram %% animals
     class Animal
   ```

6. The comment on the last line:

   ```mmd
   classDiagram
     class Animal
     Animal <|-- Duck %% ducks
   ```

| Example | mermaid.js                                   | This specification                           |
| ------- | -------------------------------------------- | -------------------------------------------- |
| 1       | rejected                                     | the relation, and the class Fish             |
| 2       | rejected                                     | the relation, and the class Fish             |
| 3       | a relation to `DuckAnimal`, label `+int age` | the relation, and the member `age` of Animal |
| 4       | the relation from Animal to Duck             | rejected                                     |
| 5       | rejected                                     | the class Animal                             |
| 6       | the relation                                 | the same                                     |

With a line of spaces in place of the empty line of example 2, both read the
relation and the class Fish. [fixture: class/div-comment-then-statement]
[fixture: class/div-comment-then-empty-line] [fixture:
class/div-comment-joins-member] [fixture: class/div-comment-splits-relation]
[fixture: class/div-comment-after-header] [fixture:
class/lex-comment-on-last-line] [fixture: class/lex-comment-then-spaces-line]

So mermaid.js reads the line after such a comment as the rest of the statement
before it. Where the two lines together are no statement, mermaid.js rejects the
text; where they happen to form one, it reads a statement that the author did
not write. This specification reads the comment as a comment, and the line after
it as the next statement.

With a comment after a relation, then a line with only `%%`, and then a line of
spaces, mermaid.js takes the line feeds after the comment and after the `%%` and
reads one line break, while this specification reads two, and rejects the text,
as both do without the comment after the relation. [fixture:
class/div-comment-then-comment-only-line]

In a Gantt chart, a comment with the mark `%` that mermaid.js reaches directly,
as [Comments](../diagrams/gantt.md#comments) defines it, takes the line feeds
after it in the same way. It matters only inside a click statement, whose parts
may follow each other over a line break: `click id1 %c`, a line feed, and
`href "u"` sets the link in mermaid.js, and so does `click id1 call f()%c`, a
line feed, and `href "u"`, also with two line feeds; here the comment ends at
its line, and the `newline` unit ends the statement, so the input is rejected.
With a space before the `%` after a call part, or with `%%`, both reject the
input, and between statements the line feeds that mermaid.js takes change
nothing (see [Comments](../diagrams/gantt.md#comments)). The difference goes one
way in gantt: mermaid.js accepts, and this specification rejects. [fixture:
gantt/div-percent-comment-takes-line-feed-after-click-id] [fixture:
gantt/div-percent-comment-takes-line-feed-after-call] [fixture:
gantt/div-percent-comment-takes-line-feeds-after-call] [fixture:
gantt/div-percent-comment-takes-line-feed-after-href] [fixture:
gantt/lex-space-percent-comment-after-call-then-href-line] [fixture:
gantt/lex-double-percent-comment-after-click-id-then-href-line] [fixture:
gantt/lex-percent-comment-glued-after-header-blank-line]

In C4, a diagram comment after a header, call, or boundary leaves the following
line terminator outside the comment in this specification. [fixture:
c4/header-component-comment-glued] [fixture:
c4/header-component-comment-on-header-line] [fixture:
c4/header-container-comment-glued] [fixture:
c4/header-container-comment-on-header-line] [fixture:
c4/header-context-comment-glued] [fixture:
c4/header-context-comment-on-header-line] [fixture:
c4/header-deployment-comment-glued] [fixture:
c4/header-deployment-comment-on-header-line] [fixture:
c4/header-dynamic-comment-glued] [fixture:
c4/header-dynamic-comment-on-header-line] [fixture:
c4/div-comment-between-joined-statements] [fixture:
c4/div-boundary-comment-before-inline-body] [fixture:
c4/div-boundary-comment-before-next-statement]

mermaid.js takes consecutive following line feeds and rejects these inputs when
the required separator disappears, including with an empty line after the
comment. [fixture: c4/div-header-comment-blank-recovery] [fixture:
c4/div-comment-between-blank-recovery] [fixture: c4/div-diagram-comment-u2028]
[fixture: c4/div-diagram-comment-u2029]

A spaces-only line after the comment stops the C4 comment rule, so both accept
the separated statements. [fixture: c4/header-header-comment-spaces-recovery]
[fixture: c4/lex-comment-between-spaces-recovery]

## What it means for an author

A class diagram with a comment after a statement, which this toolkit accepts,
can be rejected by mermaid.js, or drawn by it with the next line joined to the
statement. To write a diagram that mermaid.js reads in the same way, put each
comment on a line of its own. A statement that is split across two lines by a
comment, which mermaid.js joins, is rejected by this specification.

## Why mermaid.js reads it so

The lexer of mermaid.js reads a comment with one rule
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L28-L28)):
`%%`, the rest of the line, and every line feed that follows it, one after
another. The rule fits a comment on a line of its own, which it removes with its
line break. After a statement, it removes the line break that ends the
statement, so the grammar sees the next line as part of the same statement. A
line of spaces stops the rule, because a space is no line feed; an empty line
does not. The lexer reads the text without its directives, so a line that holds
only a directive is an empty line to it, and a directive after spaces leaves a
line of spaces: `A <|-- B %% c`, a line `%%{init: {}}%%`, and `class C` is
rejected by mermaid.js, while with spaces before the directive both read the
relation and the class C. [fixture: class/div-comment-then-directive-line]
[fixture: class/lex-comment-then-indented-directive-line] Before its lexer reads
the text, though, mermaid.js removes each comment line with text after its `%%`,
other than a directive, together with the lines of only whitespace right before
it
([`cleanupComments`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)).
A line of spaces right before such a comment line is then gone, and stops
nothing: `A --> B %% c`, a line of spaces, `%% x`, and `A : +int age` is one
relation from A to `BA` with the label `+int age` in mermaid.js, as in
example 3. [fixture: class/div-comment-then-spaces-line-then-comment-line] The
lexer of gantt has a rule of the same shape for a comment that starts with a
single `%`
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L30-L30)),
which it reaches only where it stands directly at the `%`; its rule for `%%`,
and its rule for a `%` with a character before it, take no line feed.

## The rule of this specification, and why

In this specification, a comment after a statement ends at the end of its line,
and the line break after it ends the statement, as a line break does anywhere
else. A comment on a line of its own is left out with its line break, as in
mermaid.js (see
[The statement context](../diagrams/class.md#the-statement-context)).

The comment after a statement is a way of writing that authors already use, and
mermaid.js reads it as written in the places shown above as "the same". This
specification keeps it readable everywhere, instead of rejecting it, because a
rule that rejects what authors already write cannot be taken back later. That
mermaid.js joins the next line comes from how its lexer rule is built, and is
nothing that a specification would state as a rule of the syntax; this is the
second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).

## The documentation of mermaid.js and its issues

- The documentation of class diagrams of mermaid.js says, under
  [Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L573-L575):
  "Comments need to be on their own line". The documentation of
  [flowcharts](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/flowchart.md#L1219-L1219)
  and of
  [sequence diagrams](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L682-L682)
  says the same.
- [Issue #6401](https://github.com/mermaid-js/mermaid/issues/6401), "Inline
  comments cause errors when compiling", reports a comment after a statement in
  a flowchart. As of 2026-10-02 it is open, with the labels `Type: Bug / Error`,
  `Type: Other`, and `Close after 30 days`. On 2026-03-02 a collaborator
  answered, in a reply marked as written by a bot, that comments after a
  statement are not supported, as the grammar is designed, and that this applies
  to every diagram type.
- [Issue #1646](https://github.com/mermaid-js/mermaid/issues/1646) asks for
  comments at the end of a line in class diagrams. A contributor replied in 2020
  that this should be supported, and closed it in 2023 in favour of
  [issue #1645](https://github.com/mermaid-js/mermaid/issues/1645). As of
  2026-10-02, #1646 is closed with the label `Type: Enhancement`. #1645 is about
  comments inside the body of a class, not after a statement; it is closed, with
  the labels `Type: Bug / Error` and `Status: Approved` among others.

- The pinned
  [C4 documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L7-L17)
  puts the header and calls on separate lines and gives no rule for an inline
  comment taking the following line break. Searches of issues and pull requests
  in `mermaid-js/mermaid` on 2026-10-21 with `C4 comment in:title,body`,
  `C4 newline in:title,body`, `C4 "inline comments" in:title,body`, and
  `C4 comment "line break" in:title,body` found
  [PR #8504](https://github.com/mermaid-js/mermaid/pull/8504), whose change
  concerns C4 detector anchoring and leaves the parser unchanged. No report
  about the C4 comment rule consuming the required line break was found.
