# name-start-reads-unit

Japanese version: [name-start-reads-unit.ja.md](./name-start-reads-unit.ja.md)

Diagram type: class. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

In a class diagram, a class name can be written between backquotes, so that it
can hold characters that a bare name cannot, and a class name can be followed by
a generic type between two `~`:

```mmd
classDiagram
  class `Car`
  class A~T~
```

A backquoted name is a `` ` ``, any characters other than `` ` ``, and a
`` ` ``; the text of a generic type is any characters other than `~` between two
`~` (see
[Strings, backquoted names, and generic types](../diagrams/class.md#strings-backquoted-names-and-generic-types)).
[fixture: class/spec-class-diagram-c327a7be] [fixture:
class/lex-generic-plain-type]

This document is about such a text when it starts with `"`, with `~` (in a
backquote), with `<<` or `>>`, or with one of the keywords `cssClass`,
`callback`, `link`, `click`, `note`, and `href`. A text that has one of these
later, or as the start of a longer word, is read the same by mermaid.js and by
this specification: `` class `x note` `` and `` class `notex` `` declare the
classes `x note` and `notex` in both. [fixture:
class/lex-backquote-keyword-later] [fixture: class/lex-backquote-keyword-prefix]

## The difference

Each example is a whole class diagram.

1. A keyword between backquotes:

   ```mmd
   classDiagram
     class `note`
   ```

2. A `"` at the start of a backquoted name:

   ```mmd
   classDiagram
     class `"x`
   ```

3. A keyword at the start of a generic type:

   ```mmd
   classDiagram
     class A~note x~
   ```

4. A string between backquotes, after a name:

   ```mmd
   classDiagram
     A `"1"` --> B
   ```

5. A string as a generic type:

   ```mmd
   classDiagram
     A~"1"~ --> B
   ```

6. A keyword between backquotes, then a string:

   ```mmd
   classDiagram
     `note` "x"
   ```

| Example | mermaid.js                         | This specification                     |
| ------- | ---------------------------------- | -------------------------------------- |
| 1       | rejected                           | the class `note`                       |
| 2       | rejected                           | the class `"x`                         |
| 3       | rejected                           | the class A, with the type `note x`    |
| 4       | a relation from A, cardinality `1` | a relation from the class `A"1"`       |
| 5       | a relation from A, cardinality `1` | a relation from A, with the type `"1"` |
| 6       | a note `x`                         | rejected                               |

The fixtures record the readings compared in the table. [fixture:
class/div-backquote-keyword-escaped] [fixture:
class/div-backquote-starts-with-quote] [fixture:
class/div-generic-starts-with-keyword] [fixture:
class/div-backquote-around-string] [fixture: class/div-generic-around-string]
[fixture: class/div-backquote-around-keyword]

Without the backquotes or the `~`, both read the same: `A "1" --> B` is a
relation from A to B with the cardinality `1` at A, and `note "x"` is a note.
[fixture: class/gram-cardinality-before-arrow] [fixture: class/gram-note-plain]

So where the text starts with one of these units, mermaid.js reads that unit
instead of the name or the type, and reads the backquotes and the `~` around it
as nothing. Most such texts are then no statement, and mermaid.js rejects them;
where what it reads happens to fit its grammar, as in examples 4 to 6, it reads
the statement that the text would be without the backquotes or the `~`. This
specification reads the text between the backquotes or the `~` as the name or
the type, whatever it starts with. [fixture:
class/div-backquote-starts-with-double-less-than] [fixture:
class/div-backquote-starts-with-double-greater-than] [fixture:
class/div-generic-starts-with-double-less-than] [fixture:
class/div-generic-starts-with-double-greater-than] [fixture:
class/div-backquote-keyword-css-class] [fixture:
class/div-backquote-keyword-callback] [fixture:
class/div-backquote-keyword-link] [fixture: class/div-backquote-keyword-click]
[fixture: class/div-backquote-keyword-href] In example 6, a class name followed
by a string is no statement, so this specification rejects the text.

## What it means for an author

Backquotes are the way to write a class name that a bare name cannot hold. Where
that name starts with a keyword or with `"`, this toolkit reads the name as
written, while mermaid.js rejects the diagram, or, as in examples 4 to 6, draws
something else without a word. The same holds for a generic type that starts
with a keyword, `"`, `<<`, or `>>`. To write a diagram that mermaid.js reads in
the same way, start such a name or type with another character.

## Why mermaid.js reads it so

The lexer of mermaid.js reads the text of a backquoted name and of a generic
type in states of its own
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)).
Some of its rules apply in every state: the keywords, `<<`, and `>>`
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L89-L104)),
the start of a string
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L62-L62)),
and the start of a generic type. The lexer tries the rules in the order of the
file and takes the first that matches, and these rules come before the rule for
the text of a backquoted name, and all but the last before the rule for the text
of a generic type. Where the text starts with one of them, that rule matches
first.

## The rule of this specification, and why

In this specification, the text of a backquoted name runs to the next `` ` ``,
and the text of a generic type to the next `~`, whatever they start with (see
[Strings, backquoted names, and generic types](../diagrams/class.md#strings-backquoted-names-and-generic-types)).

That a backquoted name cannot start with `note`, while it can hold `note` later,
comes from the order of the rules of the lexer of mermaid.js, and is nothing
that a specification would state as a rule of the syntax; this is the second of
the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)). mermaid.js changed the same
order for strings in 2023, so that a string can start with a keyword; the rules
of backquoted names and generic types were left after the shared rules (see
below).

## The documentation of mermaid.js and its issues

- The documentation of class diagrams of mermaid.js says, under
  [Class labels](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L161-L168),
  "You can also use backticks to escape special characters in the label", and
  describes generic types under
  [Generic Types](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/classDiagram.md#L215-L217).
  Neither says that the text cannot start with a keyword.
- [Issue #4590](https://github.com/mermaid-js/mermaid/issues/4590), "Note "note"
  throws an error", reported that a note whose string is `note` is rejected. A
  contributor replied that the lexer reads the keyword in any state, also inside
  a string. It has the labels `Type: Bug / Error`, `Graph: Class`, and
  `Internals: Parser` among others, and was closed on 2023-07-11 by the merged
  [pull request #4597](https://github.com/mermaid-js/mermaid/pull/4597), "allow
  notes identical to keywords", which moved the rules of the text of a string
  before the shared rules. The pinned version reads such a note as written.
  [fixture: class/spec-class-diagram-61cad801]
- [Issue #6076](https://github.com/mermaid-js/mermaid/issues/6076), "Allow
  puncutation in class names", is open as of 2026-10-02, with the labels
  `Type: Enhancement`, `Status: Approved`, `Contributor needed`, and
  `Graph: Class`. On 2026-03-02 a collaborator answered, in a reply marked as
  written by a bot, that backquotes around a class name are a workaround for
  dots in a class name.
