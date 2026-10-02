# comment-takes-character

Japanese version:
[comment-takes-character.ja.md](./comment-takes-character.ja.md)

Diagram type: sequence. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

A comment in a Mermaid diagram starts with `%%` and runs to the end of its line.
In a sequence diagram, it is usually written on a line of its own:

```mmd
sequenceDiagram
  Alice ->> John: Hello John, how are you?
  %% this is a comment
  John -->> Alice: Great!
```

[fixture: sequence/docs-syntax-sequence-diagram-c404e4ed]

This document is about a `%%` that comes right after another character on its
line, with no whitespace between them, as in `autonumber 10%% c`. In this
specification, the comment starts at its `%%`, and the character before it
belongs to what the lexer reads there.

## The difference

Each example is a whole sequence diagram.

1. A one-character id right before `%%`:

   ```mmd
   sequenceDiagram
     A ->> B: x
     C%% c
   ```

2. `%%` right after the first character of the target of a message:

   ```mmd
   sequenceDiagram
     Alice ->> B%% cob: Hello
   ```

3. `%%` right after the `:` before the text of a message:

   ```mmd
   sequenceDiagram
     A ->> B:%% c
   ```

4. `%%` right after a number of two digits:

   ```mmd
   sequenceDiagram
     autonumber 10%% c
     A ->> B: x
   ```

5. `%%` right after a number of one digit:

   ```mmd
   sequenceDiagram
     autonumber 5%% c
     A ->> B: x
   ```

6. A space before the `%%`:

   ```mmd
   sequenceDiagram
     autonumber 10 %% c
     A ->> B: x
   ```

| Example | mermaid.js                 | This specification                  |
| ------- | -------------------------- | ----------------------------------- |
| 1       | the message, and a comment | rejected                            |
| 2       | rejected                   | the message from Alice to `B%% cob` |
| 3       | rejected                   | the message `%% c`                  |
| 4       | rejected                   | numbering from 10                   |
| 5       | numbering with no start    | numbering from 5                    |
| 6       | numbering from 10          | the same                            |

[fixture: sequence/div-comment-after-one-character-id] [fixture:
sequence/div-comment-after-id-run-first-character-target] [fixture:
sequence/div-comment-after-text-colon] [fixture:
sequence/div-comment-after-two-digit-number] [fixture:
sequence/lex-percent-comment-takes-number] [fixture:
sequence/lex-space-before-comment-after-two-digit-number]

So where a rule of the lexer of mermaid.js would start its match at the
character right before `%%`, mermaid.js reads that character as part of the
comment and loses it with the rest of the line, and a number right before `%%`
is no number for it. This specification keeps the character: in example 1,
`C%% c` is an id run, a statement without an arrow, and is rejected; in example
2, the target of the message is `B%% cob`, because inside an id run `%` is a
character of the run. mermaid.js reads `CD%% c` as the id run `CD%% c` too.

The difference goes both ways. mermaid.js accepts and this specification rejects
where a one-character id, a digit, or a `.` that starts a statement or its next
unit stands right before `%%`. mermaid.js rejects and this specification accepts
where what mermaid.js loses is needed: the first character of an id run, the `:`
before a message text, or a number of two or more characters, which mermaid.js
reads as an id run. Both accept with a different Db where what is left after the
comment of mermaid.js is still accepted: example 5; `autonumber 5 2%% c`, with
the step 2 in this specification and 1 in mermaid.js; and
`A%% clice->>Bob: Hello`, a message from `A%% clice` in this specification and
no message in mermaid.js. [fixture: sequence/div-comment-after-one-digit-line]
[fixture: sequence/div-comment-after-first-letter-of-keyword] [fixture:
sequence/div-comment-after-dot-before-number] [fixture:
sequence/div-comment-after-fraction-number] [fixture:
sequence/div-comment-after-step-number] [fixture:
sequence/div-comment-after-id-run-first-character-line-start]

Where the character that mermaid.js loses changes nothing, as with a `;` before
`%%`, both give the same result, and the input is not a divergence. A space
before the `%%` makes both read the same in most places, as in example 6, and
`A->>B: %% c` has the message `%% c` in both; but in an id run the space stays,
so `A %% clice->>Bob: Hello` is a message from `A %% clice` in both. [fixture:
sequence/lex-comment-after-semicolon] [fixture:
sequence/lex-comment-after-invalid-unit] [fixture:
sequence/lex-space-before-comment-after-text-colon] [fixture:
sequence/lex-space-before-comment-in-id-run]

Whether a `%%` comes right after a character is decided on the diagram text
without its directives, which is the text that both lexers read: in
`autonumber 1%%{init: {}}%%%% c0`, the `%%` comes right after the number 1.
[fixture: sequence/div-comment-after-number-across-directive]

## Why mermaid.js reads it so

The lexer of mermaid.js has two rules that differ from this specification
([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L29-L30)).
In its statement state, before its rules for numbers and ids, it tries a rule
that reads a character other than `}` followed by `%%` and the rest of the line
as one comment; and it reads a number only where a space or a line feed follows
it. Where a rule would start its match at the character right before `%%`, the
comment rule matches first, and a number right before `%%` is not read as one.

## The rule of this specification, and why

In this specification, a comment starts at its mark, and a number may be
followed by `%%` (see
[The statement context](../diagrams/sequence.md#the-statement-context)).

That a comment takes the character before it, and only where another rule would
start its match there, comes from the order of the rules of the lexer of
mermaid.js, and is nothing that a specification would state as a rule of the
syntax; this is the second of the reasons for a known divergence (see
[known-divergences.md](../known-divergences.md)).

## What it means for an author

A comment written right after a statement, without a space, can be read by
mermaid.js together with the last character of the statement: the diagram is
then rejected, or drawn without that character, without a word. This toolkit
reads the statement as written. To write a diagram that both read the same, put
each comment on a line of its own, or at least put a space before the `%%`.

## The documentation of mermaid.js and its issues

- The documentation of sequence diagrams of mermaid.js says, under
  [Comments](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/sequenceDiagram.md#L680-L682),
  "Comments need to be on their own line".
- [Issue #6401](https://github.com/mermaid-js/mermaid/issues/6401), "Inline
  comments cause errors when compiling", reports a comment after a statement in
  a flowchart. As of 2026-10-02 it is open, with the labels `Type: Bug / Error`,
  `Type: Other`, and `Close after 30 days`. On 2026-03-02 a collaborator
  answered, in a reply marked as written by a bot, that comments after a
  statement are not supported, as the grammar is designed, and that this applies
  to every diagram type.

## Counts and how they are checked

Inputs were made from the accepted sequence fixtures that are not marked with a
divergence, by inserting `%% c` after each character of the diagram text, 44,798
of them. Each was run through mermaid.js and through the parser of this
specification, and their acceptance and Db were compared:

| Inputs | Rejected by mermaid.js, accepted by this specification | Accepted by both, a different Db | Accepted by mermaid.js, rejected by this specification |
| ------ | -----------------------------------------------------: | -------------------------------: | -----------------------------------------------------: |
| 44,798 |                                                  1,908 |                              543 |                                                    663 |

The other 41,684 are read the same by both.

These inputs were also checked against mermaid.js changed in only the two ways
of its lexer described above: without the rule that reads a character and `%%`
as a comment, and with a number that may also end before `%%`
(`withoutDivergences: ["comment-takes-character"]`; see
[Checking a divergence](../known-divergences.md#checking-a-divergence)). The
differential test of the parser was run on all of them, 45,311 with the inputs
made in the same way from the fixtures marked with this divergence and from the
lines of the frontmatter: it compares the parser with mermaid.js on every input,
and with the changed mermaid.js on every input whose difference it attributes to
this divergence. It found no difference that this divergence or another known
divergence does not explain; the inputs inserted in the frontmatter differ only
as [`embedded-data-opaque`](./embedded-data-opaque.md).

No input given to mermaid.js with its own lexer can serve instead of the changed
one: its statement state reads a character followed by `%%` as a comment before
any rule for ids, so no input gives it an id run, as in a message, whose second
and third characters are `%%`.
