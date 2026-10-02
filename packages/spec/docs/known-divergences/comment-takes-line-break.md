# comment-takes-line-break

Japanese version:
[comment-takes-line-break.ja.md](./comment-takes-line-break.ja.md)

Diagram type: class. This is one of the
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
the last line of the text. [fixture: class/lex-comment-own-line] [fixture:
class/lex-comment-on-last-line]

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

## Why mermaid.js reads it so

The lexer of mermaid.js reads a comment with one rule
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L28-L28)):
`%%`, the rest of the line, and every line feed that follows it, one after
another. The rule fits a comment on a line of its own, which it removes with its
line break. After a statement, it removes the line break that ends the
statement, so the grammar sees the next line as part of the same statement. A
line of spaces stops the rule, because a space is no line feed; an empty line
does not. Before its lexer reads the text, though, mermaid.js removes each
comment line with text after its `%%`, other than a directive, together with the
lines of only whitespace right before it
([`cleanupComments`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/comments.ts#L6-L8)).
A line of spaces right before such a comment line is then gone, and stops
nothing: `A --> B %% c`, a line of spaces, `%% x`, and `A : +int age` is one
relation from A to `BA` with the label `+int age` in mermaid.js, as in
example 3. [fixture: class/div-comment-then-spaces-line-then-comment-line]

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

## What it means for an author

A class diagram with a comment after a statement, which this toolkit accepts,
can be rejected by mermaid.js, or drawn by it with the next line joined to the
statement. To write a diagram that mermaid.js reads in the same way, put each
comment on a line of its own. A statement that is split across two lines by a
comment, which mermaid.js joins, is rejected by this specification.

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

## Counts and how they are checked

Inputs were made from the accepted class fixtures that are not marked with a
divergence, by inserting ` %% c` at the end of each line, by inserting `%% c`
and a space after each space inside a line, and by inserting a line `%%` or
`%%{ }%%` after each line, all in the diagram text, not in the frontmatter. Each
was run through mermaid.js and through the parser of this specification, and
their acceptance and Db were compared:

| Inputs                                 | Rejected by mermaid.js, accepted by this specification | Accepted by both, a different Db | Accepted by mermaid.js, rejected by this specification |
| -------------------------------------- | -----------------------------------------------------: | -------------------------------: | -----------------------------------------------------: |
| ` %% c` at the end of a line, 2,728    |                                                    633 |                                8 |                                                      0 |
| `%% c` after a space in a line, 22,053 |                                                     83 |                              146 |                                                      9 |
| a comment line inserted, 5,924         |                                                      0 |                                0 |                                                      4 |

The other 29,822 are read the same by both. The 4 inputs with an inserted line
have a comment after a statement, then the inserted line, and then a line of
spaces: mermaid.js takes the line feeds after both comments and reads one line
break, while this specification reads two, and rejects the text, as both do
without the comment after the statement. [fixture:
class/div-comment-then-comment-only-line]

These inputs were also checked against mermaid.js changed so that it keeps the
rule of the comment when only whitespace comes before the `%%` on its line, and
otherwise uses a rule that reads `%%` and the rest of the line only
(`withoutDivergences: ["comment-takes-line-break"]`; see
[Checking a divergence](../known-divergences.md#checking-a-divergence)). The
differential test of the parser was run on all of them, 30,938 with the inputs
made in the same way from the fixtures marked with this divergence and from the
lines of the frontmatter: it compares the parser with mermaid.js on every input,
and with the changed mermaid.js on every input whose difference it attributes to
this divergence. It found no difference that this divergence or another known
divergence does not explain; the inputs inserted in the frontmatter differ only
as [`embedded-data-opaque`](./embedded-data-opaque.md).
