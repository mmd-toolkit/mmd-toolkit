# Sequence

Japanese version: [sequence.ja.md](./sequence.ja.md)

Source of truth in mermaid.js:

- [`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison)
- [`sequenceDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts)
- the tests in
  [`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)

This document covers the diagram type `sequence`. The nodes and tokens of the
tree are defined in [ast/sequence.md](../ast/sequence.md).

## Detection

Entry 15 of [detection.md](../detection.md) selects this grammar: the text
starts with `sequenceDiagram`, after whitespace, in exactly this case. [fixture:
common/detect-minimal-sequence] [fixture: common/detect-case-sensitive-sequence]

Detection only looks at the start of the text. The grammar then reads the
keyword `sequenceDiagram` again, as a whole word (see
[The statement context](#the-statement-context)), so `sequenceDiagramX` is
detected as a sequence diagram and rejected. The first statement may follow the
keyword on the same line: `sequenceDiagram A->>B: x` has a message from A to B.
[fixture: sequence/header-word-after-keyword] [fixture:
sequence/header-statement-same-line]

Detection leaves out more than the lexer does (see
[Diagram detection](../common.md#diagram-detection)): a line that holds only
`%%`, or `%%{ }%%`, which is no directive, may come before the keyword, and the
text is still detected as a sequence diagram. The lexer reads such a line as a
diagram comment (rule 4 of [The statement context](#the-statement-context)) and
its line feed as a `newline` unit, and the grammar allows `newline` units before
the keyword, as the grammar of mermaid.js does
([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L136-L140)).
The comment is in `Root.comments`, a `newline` unit read from a line feed is no
token, and the SequenceDiagram starts at the keyword. Detection fails for a text
before the keyword that it does not leave out, such as a line `#`, and for `%%`
on the keyword's own line, which it leaves out with the keyword. Detection never
leaves out a `;`, so no `newline` unit read from `;` comes before the keyword: a
line `;` makes detection fail, and in `%%{ }%%;` the `;` is part of the comment.
[fixture: sequence/header-after-semicolon-line] [fixture:
sequence/header-after-empty-braces-semicolon] [fixture:
sequence/header-after-bare-percent-line] [fixture:
sequence/header-after-empty-braces-line] [fixture:
sequence/header-after-two-bare-percent-lines] [fixture:
sequence/header-after-hash-line] [fixture:
sequence/header-after-bare-percent-on-same-line] In flowchart the same `%%` line
is rejected, as in mermaid.js (see [Detection](./flowchart.md#detection)).

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text. This
section describes the diagram's own token rules, item 4 of
[Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram is case-insensitive: every rule
compares letters case-insensitively (see [Notation](../common.md#notation)), so
`PARTICIPANT A` and `Note LEFT OF A: x` are read as `participant A` and
`note left of A: x`. The text of a unit keeps the case in which it is written,
and an id is compared as written: `participant A` and `participant a` add two
participants. [fixture: sequence/lex-keyword-upper-case] [fixture:
sequence/lex-keyword-mixed-case] [fixture: sequence/lex-id-case]

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form. The lexer keeps a stack of **contexts**.
It starts in the statement context. A rule may enter a context, which puts it on
top of the stack, or leave the current context, which returns to the one below
it. At each position, the lexer applies the first rule of the current context
that matches there; when none matches, the input is rejected. Whitespace that a
rule reads belongs to the unit it produces, or to no unit when the rule produces
none. At the end of the text, the lexer stops.

Besides units, the lexer reads **diagram comments**: text that runs to the end
of its line and that mermaid.js reads as nothing. They are not the comment lines
of [common.md](../common.md#comment-lines), which are removed before the lexer
reads the text: a diagram comment can start in the middle of a line. The
**mark** of a diagram comment is `#` when it starts with `#`, `%%` when it
starts with `%%`, and `%` otherwise, and its value is the text after the mark
(see [Comment](../ast.md#comment)): the value of `%% c` is a space and `c`, as
for a comment line, that of `% c` is the same, and that of `%%% c` is `%`, a
space, and `c`. [fixture: sequence/lex-percent-comment-after-unit] [fixture:
sequence/lex-single-percent-comment] [fixture:
sequence/lex-percent-comment-three-percent] The mark is found in the text
without directives, as the lexer reads it, and the value is the source text
after the mark, directives included, as for a comment line:
`autonumber %%%{a}%%%` has a comment whose mark `%%` is the first and the last
`%` and whose value is empty, and in `autonumber %%%{a}%% c` the text without
the directive is `% c`, so the mark is the first `%`, and the value is
`%%{a}%% c`. [fixture: sequence/lex-diagram-comment-directive-between-marks]
[fixture: sequence/lex-diagram-comment-directive-after-single-mark]

A **keyword** below is a word that the lexer reads case-insensitively and only
where it is not followed by a word character (see
[Notation](../common.md#notation)): `ender->>B: x` and `notes->>B: x` have the
participants `ender` and `notes`, while in `loop-a->>B: x` the lexer reads the
keyword `loop`, because `-` is no word character. [fixture:
sequence/lex-keyword-prefix-of-id] [fixture: sequence/lex-keyword-before-dash]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units and to the tokens made from them
([ast/sequence.md](../ast/sequence.md#tokens)): a directive inside a unit of
kind `RawText` or `Identifier` cuts its token, and the input keeps the reading
of mermaid.js, while a directive inside a unit of another kind makes the input
rejected.

- `A->>B: x%%{init: {}}%%y` has the message `xy`, `Al%%{init: {}}%%ice->>B: x`
  the participant `Alice`, and `participant A%%{init: {}}%%B` the participant
  `AB`, as in mermaid.js. [fixture: sequence/lex-directive-in-text] [fixture:
  sequence/lex-directive-in-id-run] [fixture:
  sequence/lex-directive-in-participant-id] Whitespace next to the directive
  stays in the id, which is one unit (see [Identifier](../ast.md#identifier)):
  `participant A%%{init: {}}%% c%%B` has the participant `A c%%B`, and
  `Al%%{init: {}}%% c%%ice->>B: x` the participant `Al c%%ice`. [fixture:
  sequence/lex-directive-in-id-before-space] [fixture:
  sequence/lex-directive-in-id-run-before-space]
- In `parti%%{init: {}}%%cipant A`, `A-%%{init: {}}%%>>B: x`, and
  `autonumber 1%%{init: {}}%%0`, the directive lies inside a keyword, an arrow,
  or a number, and the input is rejected, while mermaid.js accepts it (see
  [Known divergences](#known-divergences)). [fixture:
  sequence/div-directive-in-keyword] [fixture: sequence/div-directive-in-arrow]
  [fixture: sequence/div-directive-in-number]

### The statement context

In the statement context, the lexer tries these rules in order:

1. One or more line feeds: a `newline` unit.
2. One or more whitespace characters, the first of which is not a line feed:
   nothing. The run takes the line feeds that follow the whitespace too, so a
   line break after whitespace makes no `newline` unit. The other contexts and
   the rules that read to the end of a line keep the line break.
3. `#` and the rest of its line, up to the line feed: a diagram comment.
4. `%` that is not followed by `{`, and the rest of its line: a diagram comment.
   One `%` is enough: `autonumber % c` and a line `% hello` are comments, while
   a line with `%%` at its start is a comment line of
   [common.md](../common.md#comment-lines), removed before the lexer reads the
   text. [fixture: sequence/lex-single-percent-comment] [fixture:
   sequence/lex-single-percent-comment-line]
5. A **number**: one or more digits, optionally followed by `.` and one or two
   digits, or `.` followed by one or two digits; then, not read, a space, a line
   feed, or `%%` must follow. A `number` unit.
6. The keyword `box`: a `box` unit; enters the line context.
7. The keywords `participant` and `actor`: a unit named by the keyword; enters
   the id context.
8. The keyword `create`: a `create` unit.
9. The keyword `destroy`: a `destroy` unit; enters the id context.
10. The keywords `loop`, `rect`, `opt`, `alt`, `else`, `par`, `par_over`, `and`,
    `critical`, `option`, and `break`: a unit named by the keyword; enters the
    line context.
11. The keywords `end`, `left of`, and `right of`, with one space between the
    two words, `links`, `link`, `properties`, `details`, `over`, and `note`: a
    unit named by the keyword.
12. The keywords `activate` and `deactivate`: a unit named by the keyword;
    enters the id context.
13. `title`, one whitespace character, which may be a line feed, and one or more
    characters other than `#`, `;`, and line feed: a `title` unit for the word
    and the whitespace, and a `title-text` unit for the rest.
14. `title:`, one whitespace character, and one or more characters other than
    `#`, `;`, and line feed: a `title:` unit and a `title-text` unit, in the
    same way.
15. `accTitle`, zero or more whitespace, `:`, and zero or more whitespace: an
    `accTitle` unit and a `:` unit; enters the title context.
16. `accDescr`, zero or more whitespace, `:`, and zero or more whitespace: an
    `accDescr` unit and a `:` unit; enters the description context.
17. `accDescr`, zero or more whitespace, `{`, and zero or more whitespace: an
    `accDescr` unit and a `{` unit; enters the description block context.
18. The keywords `sequenceDiagram`, `autonumber`, and `off`: a unit named by the
    keyword.
19. `,`: a `,` unit.
20. `;`: a `newline` unit.
21. An **id run**: a run of characters described under [Id runs](#id-runs). An
    `id` unit, whose text is the run without the whitespace at its ends.
22. An arrow, the first of these that matches: `->>`, `<<->>`, `-->>`, `<<-->>`,
    `->`, `-->`, `-x`, `--x`, `-)`, `--)`, `--|\`, `--|/`, `--\\`, `--//`,
    `/|--`, `\|--`, `//--`, `\\--`, `-|\`, `-|/`, `-\\`, `-//`, `/|-`, `\|-`,
    `//-`, and `\\-`. An `arrow` unit.
23. `:` and the rest of its line, up to `#`, `;`, or a line feed: a `:` unit,
    followed by the rest read as a text part (see [Text parts](#text-parts)).
24. `+`, `-`, and `()`: a unit named by its text.
25. Any other character: an `invalid` unit.

At the end of the text, the lexer reads a `newline` unit.

Some consequences of the order:

- A `#` or a `%` starts a diagram comment only where a unit starts. Inside an id
  run, `#` is a character of the run: `participant A # c` adds the participant
  `A # c`, and in `A # c ->>B: x` the message comes from `A # c`. Inside a text,
  `%%` is part of the text and `#` ends it: `A->>B: y %% c` has the message
  `y %% c`, and `A->>B: x # c` the message `x`. [fixture:
  sequence/lex-hash-inside-id] [fixture: sequence/lex-hash-inside-id-run]
  [fixture: sequence/lex-percent-in-text] [fixture: sequence/lex-hash-ends-text]
  [fixture: sequence/lex-hash-comment-after-unit] [fixture:
  sequence/lex-percent-comment-after-unit]
- A diagram comment starts at its mark, and the unit before it keeps all its
  characters. A number may be followed by `%%`, so `autonumber 5%% c` starts at
  5, as `autonumber 5 %% c` does, and `autonumber 10%% c` starts at 10. One `%`
  after a number does not end it: `autonumber 5% c` is rejected, because the
  lexer reads an id run there. Where `%%` follows a character of an id run, it
  is a character of the run: a line `C%% c` is the id run `C%% c`, a statement
  without an arrow, and is rejected. After `:`, it is a character of the text:
  `A->>B:%% c` has the message `%% c`. mermaid.js reads these inputs otherwise
  (see [Known divergences](#known-divergences)). [fixture:
  sequence/lex-percent-comment-takes-number] [fixture:
  sequence/lex-percent-comment-after-space] [fixture:
  sequence/div-comment-after-two-digit-number] [fixture:
  sequence/lex-number-before-single-percent] [fixture:
  sequence/div-comment-after-one-character-id] [fixture:
  sequence/div-comment-after-text-colon]
- Rule 2 makes whitespace at the end of a line hide the line break from the
  statements that need a `newline` unit: `autonumber`, two spaces, a line break,
  and `A->>B: y` is rejected, while the same without the spaces is accepted. A
  comment line in between does not help, because it is removed before the lexer
  reads the text: `autonumber` and a space, a comment line, and `actor Patient`
  is rejected. [issue #4293](https://github.com/mermaid-js/mermaid/issues/4293)
  reports this input; as of 2026-10-01 it is open, with the labels
  `Type: Bug / Error` and `Status: Triage`. [fixture:
  sequence/lex-trailing-space-hides-line-break] [fixture:
  sequence/lex-autonumber-line-break] [fixture:
  sequence/lex-autonumber-space-before-comment-line]
- A number must be followed by a space, a line feed, or `%%`:
  `autonumber 10.001` and `autonumber 5`, a tab, and `6` are rejected, because
  the lexer reads an id run there. `1->>2: x` has the participants `1` and `2`,
  while `1 ->>2: x` is rejected, because `1` followed by a space is a number.
  [fixture: sequence/spec-sequence-diagram-e6409a58] [fixture:
  sequence/lex-number-before-tab] [fixture: sequence/lex-number-as-id] [fixture:
  sequence/lex-number-before-space]
- `title` takes one whitespace character, which may be a line feed, and the rest
  of the next line: `title`, a line break, and `A->>B: x` has the title
  `A->>B: x` and no message. `title x A->>B: y` has the title `x A->>B: y`.
  [fixture: sequence/lex-title-line-break] [fixture:
  sequence/lex-title-rest-of-line]
- A `,`, a `;`, and the characters of rule 22 to 24 end an id run, and a line of
  an `invalid` unit is accepted (see [Grammar](#grammar)): a line with only `)`,
  `/`, `\`, `<`, or `>` is accepted and changes nothing. [fixture:
  sequence/lex-invalid-line-parenthesis] [fixture:
  sequence/lex-invalid-line-slash] [fixture:
  sequence/lex-invalid-line-two-units]

### Id runs

An id run is the longest run of characters that is made of:

1. one or more characters other than `/`, `\`, `+`, `(`, `)`, `<`, `-`, `>`,
   `:`, `,`, `;`, and line feed; then
2. any number of continuations. A continuation is zero or more `-`, followed by
   one or more characters other than `+`, `<`, `-`, `>`, `:`, `,`, `;`, and line
   feed. A continuation cannot start where one of these follows: `-x`, `-)`,
   `-\`, `-/`, `-|\`, `-|/`, `--`, `/|-`, `\|-`, `//-`, `\\-`, and `()`.

So an id run may contain whitespace, `#`, and `=`, and, after its first
character, `/`, `\`, `(`, and `)`; a single `-` may join its parts, while `--`
and the start of an arrow end it. `Alice Smith->>Bob: hi` has the participant
`Alice Smith`, `A-B->>C: x` the participant `A-B`, and `A/B->>C: x` and
`A(B)->>C: x` the participants `A/B` and `A(B)`, while `A--B->>C: x` is rejected
and `A-xB: x` is a message with the arrow `-x` from A to B. The whitespace
before an arrow is part of the run and not of the unit's text: `A ->> B : x` is
a message from `A` to `B`. [fixture: sequence/lex-id-run-space] [fixture:
sequence/lex-id-run-dash] [fixture: sequence/lex-id-run-slash] [fixture:
sequence/lex-id-run-parentheses] [fixture: sequence/lex-id-run-double-dash]
[fixture: sequence/lex-id-run-cross-arrow] [fixture:
sequence/lex-id-run-spaces-around-arrow]

### The id context

The id context is entered by `participant`, `actor`, `destroy`, `activate`, and
`deactivate`. It reads one id:

1. Whitespace other than line feeds: nothing.
2. `#` and the rest of its line: a diagram comment.
3. `@{`: a `@{` unit; enters the data context.
4. One or more characters other than `<`, `=`, `>`, `-`, `:`, `,`, `;`, `@`,
   whitespace, and line feed, followed directly by `@{`, which is not read: an
   `id` unit.
5. One or more characters other than `<`, `>`, `:`, `,`, `;`, `@`, whitespace,
   and line feed, followed by whitespace, the keyword `as`, and one whitespace
   character, which are not read: an `id` unit; enters the alias context.
6. The longest run of one or more characters other than `<`, `>`, `:`, `,`, `;`,
   `@`, and line feed that is followed by zero or more whitespace and a line
   feed, `;`, or `#`, which are not read: an `id` unit, whose text is the run
   without the whitespace at its ends; leaves the id context.
7. Zero or more characters other than `<`, `>`, `:`, `,`, `;`, `@`, and line
   feed, then `<` and the rest of the line: an `invalid` unit; leaves the id
   context.
8. One or more characters other than line feed: an `invalid` unit; leaves the id
   context.

The run of rule 6 may contain `#`, and it is the longest one that the line
allows: `participant A # c` adds the participant `A # c`, because a line feed
follows the whole run, while in `participant A # c <x` a run up to `c` is
followed by `<`, so the run is `A`, and `# c <x` is a diagram comment of the
statement context; `participant A # b # c <x` adds `A # b`. [fixture:
sequence/lex-hash-inside-id] [fixture:
sequence/lex-id-context-hash-before-invalid] [fixture:
sequence/lex-id-context-two-hashes-before-invalid]

So an id after `participant` may contain whitespace, `#`, and `=`, and it ends
at the end of the line, at `;`, or before `as`: `participant A B` adds the
participant `A B`, `participant A=B` the participant `A=B`, and `activate A B`
activates `A B`. An id before `@{` cannot contain whitespace, `-`, or `=`:
`participant A-B@{ "type": "queue" }` is rejected. An id that contains `:` or
`<` is rejected, and so is `participant` at the end of a line, because no rule
reads the line feed. [fixture: sequence/lex-id-context-space] [fixture:
sequence/lex-id-context-equals] [fixture: sequence/lex-activate-id-space]
[fixture: sequence/lex-id-before-data-dash] [fixture:
sequence/lex-id-context-colon] [fixture: sequence/lex-id-context-line-break]

### The alias context

The alias context is entered after an id that `as` follows, and after a data
block that `as` follows:

1. Whitespace other than line feeds: nothing.
2. `#` and the rest of its line: a diagram comment.
3. The keyword `as`: an `as` unit; leaves the alias context and the id context,
   and enters the line context.
4. Nothing, at a line feed: a `newline` unit that reads no character; leaves the
   alias context and the id context.

The keyword is case-insensitive, and the whitespace around it may be any
whitespace other than a line feed: `participant A AS B` and the same with tabs
give A the description `B`. [fixture: sequence/lex-alias-upper-case] [fixture:
sequence/lex-alias-tabs]

Rule 4 applies when a line feed lies between the id or the data block and `as`.
The whitespace that rule 5 of the id context and rule 2 of the data context look
for before `as` includes line feeds, so `participant A`, a line break, and
`as ->> B: x` enter the alias context after `A`; the alias context reads no `as`
before the line feed and ends the statement there, with a `newline` unit of no
characters, which is no token. The line feed after it is a `newline` unit of the
statement context, and the next line is a statement of its own, read as without
the line before it: a message from `as` to B. This is so after every keyword
that enters the id context, also when the id is `as`, after a data block, and
across several line breaks; and a next line that is no statement, such as `as B`
or `as` alone, makes the input rejected. [fixture:
sequence/lex-alias-lookahead-line-break-participant] [fixture:
sequence/lex-alias-lookahead-line-break-id-as] [fixture:
sequence/lex-alias-lookahead-line-break-activate] [fixture:
sequence/lex-alias-lookahead-line-break-deactivate] [fixture:
sequence/lex-alias-lookahead-line-break-destroy] [fixture:
sequence/lex-alias-lookahead-line-break-create] [fixture:
sequence/lex-alias-lookahead-line-break-data-block] [fixture:
sequence/lex-alias-lookahead-line-break-blank-line] [fixture:
sequence/lex-alias-lookahead-space-before-line-break] [fixture:
sequence/lex-alias-lookahead-line-break-as-text] [fixture:
sequence/lex-alias-lookahead-line-break-as-alone]

### The line context

The line context is entered by `box`, `as`, and the keywords of blocks (rule 10
of the statement context). It reads the rest of the line:

1. Whitespace other than line feeds: nothing.
2. `#` and the rest of its line: a diagram comment.
3. Only as the first unit after `box`, a **colour candidate**: `rgb`, `rgba`,
   `hsl`, or `hsla`, in lower case, zero or more whitespace, `(`, and the
   characters up to the last `)` before the next `#`, `;`, or line feed; or else
   one or more word characters (ASCII letters, digits, and `_`). A
   `color-candidate` unit.
4. Zero or more characters other than `#`, `;`, and line feed: after `box`, a
   `text` unit unless they are all whitespace, and after another keyword, read
   as a text part (see [Text parts](#text-parts)); leaves the line context.

So the text of `loop x # c` is `x` and a space, and `alt;B->>A: y` is an `alt`
block with an empty text, followed by a message. [fixture:
sequence/spec-sequence-diagram-01f0c47f] [fixture:
sequence/spec-sequence-diagram-453b7670]

### The data context

The data context is entered by `@{` after an id:

1. One or more characters other than `}`: a `data-text` unit.
2. `}` followed by whitespace, the keyword `as`, and one whitespace character,
   which are not read: a `}` unit; leaves the data context and enters the alias
   context.
3. `}`: a `}` unit; leaves the data context and the id context.

A data block therefore ends at the first `}`, and its content cannot contain
one. [fixture: sequence/docs-syntax-sequence-diagram-1371ae9a] [fixture:
sequence/lex-data-block-nested-brace]

### Accessibility values

In the title context and in the description context, one or more characters
other than line feed are a `title-text` or `description-text` unit, and the
context is left; so they read the rest of the line, `#` and `;` included. In the
description block context, `}` is a `}` unit and leaves the context, and one or
more other characters are a `description-block-text` unit. [fixture:
sequence/lex-acc-title-line-feed] [fixture: sequence/lex-acc-title-hash]

### Text parts

A **text part** is the rest of a line after `:`, or after a keyword that enters
the line context other than `box`. Its whitespace at the start belongs to no
unit. When what follows starts with a **wrap prefix**, `wrap:` or `nowrap:`,
optionally after one `:`, compared case-sensitively, the prefix is a
`wrap-prefix` unit. The rest, when it is not all whitespace, is a `text` unit.
mermaid.js reads a text part as a text and its wrap setting: the text without
the prefix and without the whitespace at its ends, wrapped after `wrap:` and not
wrapped after `nowrap:`. `A->>B: wrap:long` has the message `long`, wrapped, and
`A->>B: :nowrap: x` the message `x`, not wrapped, while `A->>B: WRAP:x` has the
message `WRAP:x`. A text part may be empty: `A->>B:` has the empty message.
[fixture: sequence/lex-wrap-prefix] [fixture: sequence/lex-nowrap-prefix-colon]
[fixture: sequence/lex-wrap-prefix-upper-case] [fixture:
sequence/lex-empty-text]

After `box`, the rest of the line is divided by its form alone into a colour
candidate and a `text` unit, either of which may be missing, as mermaid.js
divides it before it asks whether the candidate is a colour: `box aqua Group`
has the candidate `aqua` and the text `Group`, `box rgb(1,2,3)x` the candidate
`rgb(1,2,3)` and the text `x`, `box rgb(1, 2, 3) a) b` the candidate
`rgb(1, 2, 3) a)` and the text `b`, `box rgb( a` the candidate `rgb` and the
text `( a`, and `box -x` no candidate and the text `-x`. Both are units, and so
tokens, because the division does not depend on the answer. Whether the
candidate is a colour does, and so does the place of a wrap prefix, which is
read from the candidate's text and the rest together when the candidate is no
colour; so there is no `wrap-prefix` unit after `box` (see
[Box colours](#box-colours)). [fixture: sequence/spec-sequence-diagram-9f31df65]
[fixture: sequence/db-box-colour-without-space] [fixture:
sequence/db-box-colour-function-last-parenthesis] [fixture:
sequence/db-box-colour-function-unclosed] [fixture:
sequence/db-box-no-colour-candidate] [fixture:
sequence/db-box-wrap-without-colour]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `id`, stands for one unit with that
name, and text in double quotes stands for the unit named by that text, such as
`"participant"` or `"+"`. `end-of-text` stands for the end of the text. The
grammar is a restatement of the grammar in
[`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L136-L419)
and accepts the same sequences of units.

Each rule below makes a node of the tree, defined in
[ast/sequence.md](../ast/sequence.md):

| Rule                                                                              | Node                                                                                                                                               |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `diagram`                                                                         | SequenceDiagram                                                                                                                                    |
| `participant-statement` with `participant` or `actor`                             | SequenceParticipantStatement                                                                                                                       |
| `participant-statement` with `destroy`                                            | SequenceDestroyStatement                                                                                                                           |
| `data-block`                                                                      | SequenceDataBlock                                                                                                                                  |
| `box-statement`                                                                   | SequenceBoxStatement                                                                                                                               |
| `box-text`                                                                        | SequenceBoxText; its `color-candidate` and `text` each a SequenceLiteral                                                                           |
| `message-statement`                                                               | SequenceMessageStatement                                                                                                                           |
| `arrow`                                                                           | SequenceArrow                                                                                                                                      |
| `autonumber-statement`                                                            | SequenceAutonumberStatement                                                                                                                        |
| `"activate" id newline`, `"deactivate" id newline`                                | SequenceActivateStatement, SequenceDeactivateStatement                                                                                             |
| `note-statement`                                                                  | SequenceNoteStatement                                                                                                                              |
| `"links"`, `"link"`, `"properties"`, `"details"` statements                       | SequenceLinksStatement, SequenceLinkStatement, SequencePropertiesStatement, SequenceDetailsStatement                                               |
| `title-statement`                                                                 | SequenceTitleStatement                                                                                                                             |
| `accessibility-statement`                                                         | SequenceAccTitleStatement, SequenceAccDescrStatement, or SequenceAccDescrBlockStatement                                                            |
| `"accDescr" "{" "}"` of a `box-statement`                                         | SequenceAccDescrBlockStatement                                                                                                                     |
| `block-statement` with `loop`, `rect`, `opt`, `break`                             | SequenceLoopStatement, SequenceRectStatement, SequenceOptStatement, SequenceBreakStatement                                                         |
| `block-statement` with `alt`, `par`, `par_over`, `critical`                       | SequenceAltStatement, SequenceParStatement, SequenceParOverStatement, SequenceCriticalStatement, with a SequenceSection for each `text-part line*` |
| `text-part`                                                                       | SequenceText, or nothing when it has neither unit                                                                                                  |
| `id`                                                                              | Identifier                                                                                                                                         |
| `number`                                                                          | NumericLiteral                                                                                                                                     |
| `text` of a text part, `title-text`, `description-text`, `description-block-text` | SequenceLiteral, or null for a title that is all whitespace                                                                                        |
| `invalid` as a line                                                               | SequenceIgnoredStatement                                                                                                                           |

### Diagram and statements

```text
diagram             = newline* "sequenceDiagram" line*
line                = statement | newline | invalid
statement           = participant-statement
                    | "create" participant-statement
                    | box-statement
                    | message-statement newline
                    | autonumber-statement newline
                    | ( "activate" | "deactivate" ) id newline
                    | note-statement newline
                    | ( "links" | "link" | "properties" | "details" ) id ":" text-part newline
                    | title-statement
                    | accessibility-statement
                    | block-statement
```

A statement that ends with `newline` must be followed by a line break, a `;`, or
the end of the text. The others need no separator: a box and a block end at
`end`, and a title or an accessibility statement runs to the end of its line, so
another statement may follow on the same line after `end`: `loop x`, a message,
and `end A->>B: z` has the message after the loop. [fixture:
sequence/gram-statement-after-end] A line of an `invalid` unit is accepted, is a
SequenceIgnoredStatement in the tree, and changes nothing in the Db, also after
`end` on the same line. [fixture: sequence/lex-invalid-line-parenthesis]
[fixture: sequence/gram-invalid-after-end] A line `)` after a message whose text
was meant to continue is such a line: `A->>B: call(x`, a line break, and `)` has
the message `call(x`. [fixture: sequence/db-ignored-line-after-wrapped-message]
[fixture: sequence/db-wrapped-message-closed]

### Participants and boxes

```text
participant-statement = ( "participant" | "actor" ) id data-block? ( "as" text-part )? newline
                      | "destroy" id newline
data-block            = "@{" data-text? "}"
box-statement         = "box" box-text? ( participant-statement | "accDescr" "{" "}" | newline )* "end"
box-text              = color-candidate text? | text
```

`as` and the text after it give the participant a description. The data block is
embedded data: its content is kept as written and not read (see
[Data blocks](#data-blocks-in-the-db)). `create` may come before any participant
statement, `destroy` included: `create destroy A` is a destroy statement with
`create`, which adds A as a created participant and destroys nothing (see
[Building the summary](#building-the-summary-from-the-tree)). [fixture:
sequence/gram-create-destroy] A box holds only participant statements, empty
description blocks, and empty lines, without `create` and without messages.
[fixture: sequence/gram-box-create-participant] [fixture:
sequence/gram-box-message-inside] An empty description block in a box is a
description block statement without text, as where any other statement starts:
it may be on a line of its own, over several lines with only whitespace between
its braces, or followed on the same line by a participant statement or by `end`,
and it changes nothing. [fixture:
sequence/gram-box-empty-description-block-line] [fixture:
sequence/gram-box-empty-description-block-lines] [fixture:
sequence/gram-box-empty-description-block-then-participant] [fixture:
sequence/gram-box-empty-description-block-before-end] A description block with
text and a description statement are no statements of a box, and both reject
them. [fixture: sequence/gram-box-description-block-with-text] [fixture:
sequence/gram-box-description-line]

### Messages

```text
message-statement = id arrow ( "+" | "-" | "()" )? id ":" text-part
                  | id "()" arrow "()"? id ":" text-part
```

`+` after the arrow activates the target, `-` deactivates the source, and `()`
after the arrow or before it, or both, marks a central connection. `+` and `-`
cannot be combined with `()`. A message needs a text, which may be empty after
its `:`: `A->>B` is rejected, and `A->>B:` is accepted. [fixture:
sequence/gram-message-without-text] [fixture: sequence/lex-empty-text]

### Other statements

```text
autonumber-statement    = "autonumber" ( number number? | "off" )?
note-statement          = "note" ( "left of" | "right of" ) id ":" text-part
                        | "note" "over" id ( "," id )? ":" text-part
text-part               = wrap-prefix? text?
title-statement         = ( "title" | "title:" ) title-text
accessibility-statement = "accTitle" ":" title-text?
                        | "accDescr" ":" description-text?
                        | "accDescr" "{" description-block-text? ( "}" | end-of-text )
```

### Blocks

```text
block-statement = ( "loop" | "rect" | "opt" | "break" ) text-part line* "end"
                | "alt" text-part line* ( "else" text-part line* )* "end"
                | ( "par" | "par_over" ) text-part line* ( "and" text-part line* )* "end"
                | "critical" text-part line* ( "option" text-part line* )* "end"
```

A block's text may be empty: `loop`, a line break, and `end` is a loop with the
empty text. [fixture: sequence/gram-block-empty-text]

## Db normalization

The diagram title from the frontmatter and the Db values that depend on the
configuration do not come from the tree: whoever checks Db values derives them
with mermaid.js's own functions (see
[Configuration (reference)](../common.md#configuration-reference)). Here this is
the wrap setting that a text without a wrap prefix gets: `wrap` of the
configuration, or else `sequence.wrap`, or else false. [fixture:
sequence/config-wrap-site] [fixture: sequence/config-sequence-wrap-site]
[fixture: sequence/config-wrap-site-nowrap-prefix]

### The summary

The fixtures record the Db of mermaid.js as a summary with these fields, made by
[`normalizeSequence()`](../../../tests/src/normalizers/sequence.ts) of
`@mmd-toolkit/tests`:

| Field             | Content                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `title`           | The title.                                                                                |
| `accTitle`        | The accessibility title, or the empty text.                                               |
| `accDescr`        | The accessibility description, or the empty text.                                         |
| `actors`          | The participants, in the order in which they were first added.                            |
| `boxes`           | The boxes, in source order: `name`, `wrap`, `fill`, and `actorKeys`.                      |
| `createdActors`   | The created participants: `id` and `messageIndex`.                                        |
| `destroyedActors` | The destroyed participants: `id` and `messageIndex`.                                      |
| `messages`        | The messages, notes, autonumber settings, activations, and the starts and ends of blocks. |

A participant has `name`, `description`, `wrap`, `prevActor`, `nextActor`,
`links`, `properties`, `type`, and `box`, the position of its box in `boxes`. A
field that the Db leaves unset is absent. The summary leaves out what only
rendering uses: the position of a message in the list as a string, the fields
that the renderer fills in, the separate list of notes (each note is also a
message), and whether sequence numbers are shown. Texts are recorded as
mermaid.js holds them before HTML sanitization (see
[Sanitizers are disabled](../../../tests/docs/expected-results.md#sanitizers-are-disabled)).

### Building the summary from the tree

The statements are applied in source order, a block's own entries before and
after its body, and each statement as follows. The **text** of a text part below
is its `text` unit without the whitespace at its ends, or the empty text when it
has none (see [Text parts](#text-parts)); its **wrap** is true after `wrap:`,
false after `nowrap:`, and the wrap setting of the configuration otherwise.

**Participants.** Adding a participant with an id, a description, a kind, and a
data block does this:

- Inside a box, a participant with that id that exists already and has no box
  gets the box, and one that has another box makes the input rejected (see
  [Rejections outside the grammar](#rejections-outside-the-grammar)). This
  happens before the next two items, so it happens also when nothing else
  changes. [fixture: sequence/db-box-existing-participant-joins-box] [fixture:
  sequence/gram-box-participant-in-two-boxes]
- When a participant with that id exists already and the statement has no
  description, nothing else changes: `participant A as Alice` followed by
  `participant A` keeps the description `Alice`. [fixture:
  sequence/db-participant-redeclared-without-alias]
- Otherwise the participant is recorded anew: `name` the id, `description` the
  description or else the id, `wrap` the wrap of the description, `type` the
  kind, `links` and `properties` empty, and `prevActor` the id of the
  participant added last, if there is one; that participant gets `nextActor` the
  id. A participant that existed already keeps its place in `actors`, and its
  box; its links and properties are emptied, and its `prevActor` is the
  participant added last, which may be itself: after `participant A`,
  `participant B`, and `participant A as Alice`, A has the description `Alice`
  and `prevActor` B, and B has `nextActor` A. [fixture:
  sequence/db-participant-redeclared-with-alias] [fixture:
  sequence/db-participant-redeclared-after-links] [fixture:
  sequence/db-participant-redeclared-itself-previous]
- When the participant is recorded inside a box, a participant recorded for the
  first time gets the box, and the box gets the id at the end of its
  `actorKeys`, each time the participant is recorded: `box a`, `participant A`,
  `participant A as X`, and `end` give `actorKeys` A twice, while two
  `participant A` give it once, and `participant A` before the box and again
  inside it give an empty `actorKeys` and A the box. Outside a box, a
  participant keeps its box. [fixture: sequence/spec-sequence-diagram-f1763a40]
  [fixture: sequence/db-box-participant-twice-with-alias] [fixture:
  sequence/db-box-participant-twice] [fixture:
  sequence/db-box-existing-participant-with-alias] [fixture:
  sequence/db-box-participant-redeclared-outside]

A participant statement adds its id with the description of its `as` text, if
any, and the kind `participant` or `actor`. The `type` and the description that
a data block sets are not derived from the tree (see
[Data blocks](#data-blocks-in-the-db)). A message, a note, and a `links`,
`link`, `properties`, or `details` statement first add each id they name with no
description and the kind `participant`, so an id that exists already is not
changed. `activate`, `deactivate`, and `destroy` add nothing. [fixture:
sequence/lex-activate-id-space]

**Create and destroy.** `create` before a participant statement is rejected when
a participant with that id exists already (see
[Rejections outside the grammar](#rejections-outside-the-grammar)); otherwise it
adds the participant, and records the id in `createdActors` with `messageIndex`
the number of entries in `messages` so far. `destroy` records the id in
`destroyedActors` in the same way. [fixture: sequence/db-create-participant]
[fixture: sequence/db-destroy-participant] [fixture:
sequence/db-create-participant-before-message] A destroy statement with `create`
does what `create participant` does with its id: it adds the participant with
the kind `participant` and the id as its description, and records it in
`createdActors`; it records nothing in `destroyedActors`, and the checks after
`create` apply to it (see
[Rejections outside the grammar](#rejections-outside-the-grammar)). [fixture:
sequence/gram-create-destroy] [fixture: sequence/db-create-destroy-then-destroy]
[fixture: sequence/gram-create-destroy-without-message] [fixture:
sequence/gram-create-destroy-existing]

**Messages.** A message statement adds an entry to `messages` with `from` and
`to` the two ids, `message` the text, `wrap` its wrap, `type` the number of the
arrow (see [The arrows](#the-arrows)), `activate`, and `centralConnection`, and
then:

- with `+`: `activate` true, then an entry of type 17 for the target;
- with `-`: `activate` false, then an entry of type 18 for the source;
- with `()` after the arrow: `activate` true and `centralConnection` 59, then an
  entry of type 59 for the target;
- with `()` before the arrow: `activate` false and `centralConnection` 60, then
  an entry of type 60 for the source;
- with both: `activate` true and `centralConnection` 61, then an entry of type
  59 for the target and one of type 60 for the source;
- otherwise: `activate` false and `centralConnection` 0.

An entry for one participant has `from` its id, no `to`, the empty `message`,
`wrap` the wrap setting of the configuration, `activate` false, and
`centralConnection` 0. `activate` and `deactivate` add such an entry of type 17
and 18. [fixture: sequence/db-message-activate-target] [fixture:
sequence/db-message-central-connection-target] [fixture:
sequence/db-message-central-connection-source] [fixture:
sequence/db-message-central-connection-both]

**Notes.** A note adds an entry with `from` and `to` the id, or the two ids of
`over` with a `,`, `message` the text, `wrap` its wrap, `type` 2, and
`placement` 0 for `left of`, 1 for `right of`, and 2 for `over`. [fixture:
sequence/db-note-over-two] [fixture: sequence/db-note-left-of]

**Autonumber.** `autonumber` adds an entry of type 26 whose `message` is
`visible` true, and `start` and `step` when a number follows: the first number,
and the second, or else 1. `autonumber off` gives `visible` false and no
numbers. Its `wrap` is false. [fixture: sequence/db-autonumber-bare] [fixture:
sequence/db-autonumber-start] [fixture: sequence/db-autonumber-start-step]
[fixture: sequence/db-autonumber-off]

**Blocks.** A block adds an entry at its start with the text and its wrap, one
for each `else`, `and`, or `option` with its text, and one at its `end` with the
empty text and the wrap setting of the configuration. The types are:

| Block      | Start | Section | End |
| ---------- | ----- | ------- | --- |
| `loop`     | 10    |         | 11  |
| `alt`      | 12    | 13      | 14  |
| `opt`      | 15    |         | 16  |
| `par`      | 19    | 20      | 21  |
| `rect`     | 22    |         | 23  |
| `critical` | 27    | 28      | 29  |
| `break`    | 30    |         | 31  |
| `par_over` | 32    | 20      | 21  |

The entries of blocks have no `from` and `to`, `activate` false, and
`centralConnection` 0. The text of `rect` is used by the renderer as the fill
colour; the Db holds it as a text. [fixture: sequence/db-block-loop-wrap]
[fixture: sequence/db-block-alt] [fixture: sequence/db-block-opt] [fixture:
sequence/db-block-rect] [fixture: sequence/db-block-critical] [fixture:
sequence/db-block-par] [fixture: sequence/db-block-par-over] [fixture:
sequence/db-block-break]

**Boxes.** A box adds an entry to `boxes` with `actorKeys` empty; the
participant statements inside it add their ids, and a destroy statement inside
it adds nothing. [fixture: sequence/db-box-empty] [fixture:
sequence/db-box-destroy-inside] Its `name`, `fill`, and `wrap` depend on whether
the start of its text is a colour, which mermaid.js asks the browser; they are
given from outside the tree (see [Box colours](#box-colours)).

**Links and properties.** `links` and `properties` read their text as JSON and
copy each key of the value into the participant's `links` or `properties`,
adding to the keys of earlier statements and replacing a key that exists. The
keys of a JSON object are its names; a JSON array gives each element under its
position from 0, a JSON string each of its UTF-16 code units under its position
from 0, and a number, `true`, `false`, or `null` nothing. A text that is not
JSON changes nothing, and the input is accepted. Whoever derives the Db reads
the JSON from the text of the tree, in converted form, where an entity is a
placeholder: the JSON is not embedded data in the sense of
[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md), because
mermaid.js never rejects an input because of it, and the tree keeps it as text
like any other. [fixture: sequence/db-links-not-json] [fixture:
sequence/db-properties-not-json] [fixture: sequence/db-links-string-value]
[fixture: sequence/db-properties-string-value] [fixture:
sequence/db-links-array-value] [fixture: sequence/db-links-number-value]
[fixture: sequence/db-links-two-statements] [fixture: sequence/db-links-entity]
[fixture: sequence/db-links-object] [fixture: sequence/db-links-trailing-comma]
[fixture: sequence/db-properties-trailing-comma] A statement without text has
the empty text, which is not JSON: `links A:` and `properties A:` change
nothing. [fixture: sequence/db-links-empty] [fixture:
sequence/db-properties-empty] [fixture: sequence/db-links-proto-key] [fixture:
sequence/db-properties-proto-key] `link` sets one link: its label is the text
before the first `@` without the character just before the `@`, and its URL the
text after that `@`, each without whitespace at its ends. When the `@` is the
first character, no character comes before it, and the label is the text without
its last character; when it is the second, the label is empty. Without an `@`,
the label is the text without its last two characters, and the URL the whole
text: `link A: Dash @ https://x` sets `Dash`, `link A: Dash@https://x` sets
`Das`, `link A: @ https://alic` sets `@ https://ali` to `https://alic`,
`link A: x@https://u` sets the empty label, and `link A: no at` sets `no` to
`no at`. [fixture: sequence/db-link-label] [fixture:
sequence/db-link-without-space] [fixture: sequence/db-link-at-first] [fixture:
sequence/db-link-at-second] [fixture: sequence/db-link-at-only] [fixture:
sequence/db-link-without-at] [fixture: sequence/db-link-without-at-url] With the
empty text, `link A:` has no `@`, and sets the empty label to the empty URL.
[fixture: sequence/db-link-empty] `details` changes nothing, also without text:
mermaid.js looks for an element of the page with the text as its id, which is
not part of the diagram's text, and the summary is made as on a page without
one. [fixture: sequence/db-details-empty]

**Titles.** `title` sets the title to the text of the `title-text` unit as it is
written, whitespace included: `title`, two spaces, `x`, and two spaces has the
title of a space, `x`, and two spaces. `title:` does the same. `accTitle:` sets
the accessibility title, and `accDescr:` and `accDescr {` the description, as in
[flowchart.md](./flowchart.md#building-the-summary-from-the-tree): without
whitespace at the ends, each line feed and the whitespace after it read as one
line feed, a later statement replacing an earlier one, an `accDescr {` block
that is not closed setting the empty description, and a closed block without
text changing nothing. [fixture: sequence/db-title-spaces] [fixture:
sequence/db-title-legacy] [fixture: sequence/db-acc-descr-block-lines] [fixture:
sequence/db-acc-descr-block-unclosed] [fixture:
sequence/db-acc-descr-line-alone] [fixture:
sequence/db-acc-descr-block-after-message]

The statements are applied in source order, inside blocks too, and each of the
three values keeps the last one set. The title starts as the title of the
frontmatter, which does not come from the tree (see
[Db normalization](#db-normalization)), and a `title` statement replaces it:
with `title: From frontmatter` in the frontmatter, `title From statement` gives
the title `From statement`. `title first` and `title second` give `second`, and
`accTitle:` and `accDescr:` replace an earlier statement of their own kind in
the same way; an `accDescr:` line also replaces the description of an earlier
block, and `accDescr: outer` after a loop replaces `accDescr: inner` inside it.
The title and the accessibility title are separate values: `title first` and
`accTitle: second` give the title `first` and the accessibility title `second`.
A closed block without text, also one with only whitespace, line breaks, or a
comment line, changes nothing: after `accDescr: x`, `accDescr {}` and
`accDescr { }` keep `x`. [fixture: sequence/db-title-replaces-frontmatter]
[fixture: sequence/db-title-replaces] [fixture: sequence/db-acc-title-replaces]
[fixture: sequence/db-acc-descr-replaces] [fixture:
sequence/db-acc-descr-line-replaces-block] [fixture:
sequence/db-acc-descr-outer-replaces-loop] [fixture:
sequence/db-title-and-acc-title] [fixture:
sequence/db-acc-descr-empty-block-keeps] [fixture:
sequence/db-acc-descr-spaces-block-keeps] [fixture:
sequence/db-acc-descr-comment-block-keeps] [fixture:
sequence/db-acc-descr-empty-block-after-message] [fixture:
sequence/db-acc-descr-empty-block-spaces-after-message] [fixture:
sequence/db-acc-descr-empty-block-lines-after-message] [fixture:
sequence/db-acc-descr-block-comment-only-after-message]

### The arrows

The `type` of a message is a number given by the line and the markers of its
arrow (see [SequenceArrow](../ast/sequence.md#sequencearrow)):

- with no half marker: for the line `solid`, 5 with no marker, 0 with the end
  marker `arrow`, 3 with `cross`, 24 with `open-arrow`, and 33 with the start
  and end marker `arrow`; for the line `dotted`, one more: 6, 1, 4, 25, and 34;
- with an end marker `half-arrow-top`, `half-arrow-bottom`, `half-stick-top`, or
  `half-stick-bottom`: 41, 42, 43, or 44 for the line `solid`, and 51, 52, 53,
  or 54 for `dotted`;
- with such a start marker: 45, 46, 47, or 48 for the line `solid`, and 55, 56,
  57, or 58 for `dotted`.

So `->>` is 0, `<<-->>` 34, `-//` 44, and `//--` 57. [fixture:
sequence/db-arrow-types]

### Rejections outside the grammar

mermaid.js rejects some inputs that the grammar accepts, while it builds the Db.
Each is decided from the statements in source order:

- **Deactivating an inactive participant.** An entry of type 18 for a
  participant, from `deactivate` or from `-` after an arrow, is rejected when
  the entries of type 17 for that participant so far are not more than those of
  type 18. [fixture: sequence/gram-deactivate-inactive] [fixture:
  sequence/gram-deactivate-after-message]
- **Creating an existing participant.** `create` with an id that a participant
  has already. [fixture: sequence/gram-create-existing]
- **The message after `create` or `destroy`.** See below. [fixture:
  sequence/gram-create-without-message] [fixture:
  sequence/gram-destroy-without-message]
- **A participant in two boxes.** A participant statement inside a box for a
  participant that has another box already. [fixture:
  sequence/gram-box-participant-in-two-boxes]

For the messages after `create` and `destroy`, two places are kept while the
statements are applied, each empty or holding one id: the **participant awaiting
creation** and the **participant awaiting destruction** (see
[`sequenceDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L581-L645)).
Both start empty.

- A statement with `create`, a destroy statement with `create` included, puts
  its id in the participant awaiting creation, replacing the one there. A
  destroy statement without `create` puts its id in the participant awaiting
  destruction, replacing the one there. `create destroy C` therefore makes C
  await creation, not destruction.
- A message statement is checked before its entries are added. When a
  participant awaits creation, the message must go to it, and the participant
  awaiting creation becomes empty; the participant awaiting destruction is not
  looked at. Otherwise, when a participant awaits destruction, the message must
  come from it or go to it, and the participant awaiting destruction becomes
  empty. A message that fails its check makes the input rejected.
- No other statement looks at either place or changes it: a note over the
  participant awaiting creation does not satisfy it, and neither do `activate`,
  `autonumber`, and the like. Blocks and their sections make no difference,
  since the statements are applied in source order.
- At the end of the text, nothing is checked: a participant may still await
  creation or destruction.

So after `create participant C` and `create participant E`, only E awaits
creation, and the next message must go to E. After `create participant C` and
`destroy D`, the next message must go to C, and the one after it must come from
D or go to it. After `destroy D` and `destroy E`, the next message must involve
E. [fixture: sequence/gram-create-two-last-waits] [fixture:
sequence/gram-create-two-first-rejected] [fixture:
sequence/gram-create-then-destroy-message-to-other] [fixture:
sequence/gram-create-then-destroy-message-to-destroyed] [fixture:
sequence/gram-destroy-then-create] [fixture:
sequence/gram-destroy-then-create-message-to-other] [fixture:
sequence/gram-destroy-two-last-waits] [fixture:
sequence/gram-destroy-two-first-rejected] [fixture:
sequence/gram-create-message-from-created] [fixture:
sequence/gram-create-self-message] [fixture:
sequence/gram-destroy-message-from-destroyed] [fixture:
sequence/gram-create-wait-across-other-statements] [fixture:
sequence/gram-create-wait-note-not-message] [fixture:
sequence/gram-create-wait-into-block] [fixture:
sequence/gram-create-wait-out-of-block] [fixture:
sequence/gram-create-wait-across-else] [fixture: sequence/gram-create-last]
[fixture: sequence/gram-destroy-last] [fixture:
sequence/gram-create-destroy-waits-for-creation] [fixture:
sequence/gram-create-destroy-message-to-other]

### Box colours

mermaid.js splits the text of a box into a colour candidate and the rest, and
asks the browser whether the candidate is a colour (see
[`parseBoxData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419)).
The answer does not come from the text, so the `name`, `fill`, and `wrap` of a
box are given from outside the tree, as a value of the configuration is.

Given the answer, they come from the SequenceBoxText (see
[SequenceBoxText](../ast/sequence.md#sequenceboxtext)). When the colour
candidate is a colour, `fill` is the candidate and the name comes from the
remainder; otherwise `fill` is `transparent` and the name comes from the whole
text. A wrap prefix at the start of the name sets `wrap` as in a text part (see
[Text parts](#text-parts)), and the name is the rest; when it is empty, or the
box has no text, the box has no `name`. With the answers of a browser:

- `box green Group 1` has the fill `green` and the name `Group 1`, and
  `box Group 1` the fill `transparent` and the name `Group 1`. [fixture:
  sequence/spec-sequence-diagram-f1763a40] [fixture:
  sequence/spec-sequence-diagram-1705b6f7]
- `box aqua` has the fill `aqua` and no name, and a box without text the fill
  `transparent` and no name. [fixture: sequence/spec-sequence-diagram-9f31df65]
  [fixture: sequence/db-box-no-text]
- `box rgb(34, 56, 0) Group1` has the fill `rgb(34, 56, 0)`, and
  `box Purple Alice & John` the fill `Purple` and the name `Alice & John`.
  [fixture: sequence/spec-sequence-diagram-97d37793] [fixture:
  sequence/docs-syntax-sequence-diagram-93d3c0ff] [fixture:
  sequence/demo-sequence-ec7c4269]
- `box red-team` has the fill `red` and the name `-team`. [fixture:
  sequence/db-box-colour-candidate-word-prefix]
- In `box RGB(0, 0, 255) Team` the candidate is the word `RGB`, and
  `rgb (0, 0, 255)` is no colour; both boxes have the fill `transparent` and
  their whole text as the name. [fixture:
  sequence/db-box-colour-function-upper-case] [fixture:
  sequence/db-box-colour-function-space]
- `box aqua wrap:Group` has the fill `aqua`, and `box wrap:Group` the fill
  `transparent`; both have the name `Group` and `wrap` true. [fixture:
  sequence/db-box-wrap-after-colour] [fixture:
  sequence/db-box-wrap-without-colour]
- `#` ends the text: `box aqua G # c` has the name `G`. [fixture:
  sequence/lex-box-hash-comment]

### Data blocks in the Db

The `type` and the description that a participant's `@{ ... }` block sets come
from `dataBlockEffects` of `@mmd-toolkit/tests`, one entry for each participant
statement with a data block (see
[`dataBlockEffects`](../../../tests/docs/embedded-data.md#datablockeffects)).
The description from `as` comes before the one from the block:
`participant A@{ "alias": "Q" } as R` has the description `R`. [fixture:
sequence/db-data-block-alias-and-as]

## Known divergences

These divergences of [known-divergences.md](../known-divergences.md) apply to
sequence, and show in it as follows.

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a keyword, an arrow, a number, or punctuation makes the
  input rejected here, while mermaid.js accepts it:
  `parti%%{init: {}}%%cipant A`, `A-%%{init: {}}%%>>B: x`, and
  `autonumber 1%%{init: {}}%%0` (see
  [Directives inside units](#directives-inside-units)). [fixture:
  sequence/div-directive-in-keyword] [fixture: sequence/div-directive-in-arrow]
  [fixture: sequence/div-directive-in-number]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).**
  The content of a participant's data block is not read. mermaid.js reads it as
  YAML and rejects content that is not valid YAML; here it is accepted.
  [fixture: sequence/spec-sequence-diagram-b8d593b1] [fixture:
  sequence/spec-sequence-diagram-335c8c00]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `A-xB: b="c">d` has the message `b='c'>d`
  in mermaid.js, whose tag reaches the `>` after `"c"`, and `b="c">d` here.
  Where an arrow with `>` lies between, as in `A->>B: b="c">d`, that `>` ends
  the tag in mermaid.js, and both give `b="c">d`. [fixture:
  sequence/div-html-tag-starts-in-frontmatter-message] [fixture:
  sequence/lex-html-tag-frontmatter-arrow-ends-tag]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty description block that does not start a statement makes the input
  rejected here, while mermaid.js reads no token for it and accepts the input:
  `A->>accDescr {}B: x` and `note left of accDescr {} A: x`. An empty
  description block where a statement starts, also inside a box, is a
  description block statement without text, which changes nothing. [fixture:
  sequence/gram-box-empty-description-block-line] [fixture:
  sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/gram-acc-descr-block-empty-then-statement]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.md).**
  A `%%` right after a number, or right after a character other than whitespace
  at which a rule of the statement context starts its match, starts a comment
  here and keeps that character, while mermaid.js reads the character as part of
  the comment, and reads no number before `%%`. A line `C%% c` is accepted by
  mermaid.js and rejected here, `A->>B:%% c` and `autonumber 10%% c` are
  rejected by mermaid.js and accepted here, and `autonumber 5%% c` starts at 5
  here and has no start in mermaid.js (see
  [The statement context](#the-statement-context)). [fixture:
  sequence/div-comment-after-one-character-id] [fixture:
  sequence/div-comment-after-text-colon] [fixture:
  sequence/div-comment-after-two-digit-number] [fixture:
  sequence/lex-percent-comment-takes-number]
