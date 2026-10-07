# Sequence

Japanese version: [sequence.ja.md](./sequence.ja.md)

Source of truth in mermaid.js:

- [`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison)
- [`sequenceDb.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts)
- the tests in
  [`sequenceDiagram.spec.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDiagram.spec.js)

This document covers the diagram type `sequence`. The nodes of the tree are
defined in [ast/sequence.md](../ast/sequence.md).

## Detection

Entry 15 of [detection.md](../detection.md) selects this grammar: the text
starts with `sequenceDiagram`, after whitespace, in exactly this case. [fixture:
common/detect-minimal-sequence] [fixture: common/detect-case-sensitive-sequence]
[fixture: sequence/docs-config-accessibility-6016a981]

Detection only looks at the detection point (see
[Diagram detection](../common.md#diagram-detection)). The grammar then reads the
keyword `sequenceDiagram` again, as a whole word (see
[The statement context](#the-statement-context)), so `sequenceDiagramX` is
detected as a sequence diagram and rejected. The first statement may follow the
keyword on the same line: `sequenceDiagram A->>B: x` has a message from A to B.
[fixture: sequence/header-word-after-keyword] [fixture:
sequence/header-statement-same-line]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, may come
before the keyword: it is a bare `%%` line, which detection reads and passes to
find the header, and which is a comment of the diagram, with the mark `%%`, from
the `%%` to the end of its line, as in every diagram type (see
[Diagram detection](../common.md#diagram-detection)); the lexer of mermaid.js
reads it so as well (rule 4 of [The statement context](#the-statement-context)).
The comment belongs to no node, and the SequenceDiagram starts at the keyword.
In `%%{ }%%;` the `;` is part of the comment, and so is the rest of a line that
begins with `%%{` where no directive starts, such as `%%{ }%% x` and `%%{-x}%%`,
a keyword on that line among it: `%%{ }%% sequenceDiagram` on one line leaves no
header, and the input is rejected. Any other text before the keyword, such as a
line `#` or `;`, or `%%` on the keyword's own line, is diagram text at the
detection point, which no detector matches, and the input is rejected, as in
mermaid.js. [fixture: sequence/header-after-bare-percent-line] [fixture:
sequence/header-after-empty-braces-line] [fixture:
sequence/header-after-empty-braces-semicolon] [fixture:
sequence/header-after-empty-braces-line-text] [fixture:
sequence/header-after-non-word-brace-line] [fixture:
sequence/header-after-empty-braces-then-keyword-same-line] [fixture:
sequence/header-after-non-word-brace-then-keyword-same-line] [fixture:
sequence/header-after-two-bare-percent-lines] [fixture:
sequence/header-after-hash-line] [fixture: sequence/header-after-semicolon-line]
[fixture: sequence/header-after-bare-percent-on-same-line] In flowchart the same
`%%` line is rejected, as in mermaid.js (see
[Detection](./flowchart.md#detection)).

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text. This
section describes the diagram's own unit rules, item 4 of
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
none; when the rule produces two units, the whitespace between them belongs to
neither. At the end of the text, the lexer stops.

Besides units, the lexer reads **diagram comments**: text that runs to the end
of its line and that mermaid.js reads as nothing. The line goes on past a
comment line that follows a U+2028 or U+2029 on it, whose comment region cuts
the diagram comment in two: `A->>B: y #c`, U+2029, a line `%% d`, and a line
`C->>D: z` have one message, from A to B. [fixture:
sequence/lex-hash-comment-across-comment-line] [fixture:
sequence/tokens-sequence-hash-comment-alone-u2028-94dfcd06] They are not the
comment lines of [common.md](../common.md#comment-lines), which are removed
before the lexer reads the text: a diagram comment can start in the middle of a
line. The **mark** of a diagram comment is `#` when it starts with `#`, `%%`
when it starts with `%%`, and `%` otherwise, and its value is the text after the
mark: the value of `%% c` is a space and `c`, as for a comment line, that of
`% c` is the same, and that of `%%% c` is `%`, a space, and `c`. [fixture:
sequence/lex-percent-comment-after-unit] [fixture:
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
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit, a name unit
included, makes the input rejected. It has no name units. The **text units** are
an `id` unit, the unit of a
[SequenceIdentifier](../ast/sequence.md#sequenceidentifier), a name that may
contain whitespace, a `text`, `color-candidate`, `title-text`,
`description-text`, `description-block-text`, or `data-text` unit, and an
`invalid` unit. It has no string units.

- `A->>B: x%%{init: {}}%%y` has the message `xy`, `Al%%{init: {}}%%ice->>B: x`
  the participant `Alice`, and `participant A%%{init: {}}%%B` the participant
  `AB`, as in mermaid.js. [fixture: sequence/lex-directive-in-text] [fixture:
  sequence/lex-directive-in-id-run] [fixture:
  sequence/lex-directive-in-participant-id] [fixture:
  sequence/lex-directive-in-title-text] [fixture:
  sequence/lex-directive-in-acc-descr-text] [fixture:
  sequence/lex-directive-in-acc-descr-block-text] Whitespace next to the
  directive stays in the id, which is one unit (see
  [SequenceIdentifier](../ast/sequence.md#sequenceidentifier)):
  `participant A%%{init: {}}%% c%%B` has the participant `A c%%B`,
  `Al%%{init: {}}%% c%%ice->>B: x` the participant `Al c%%ice`, and
  `participant A %%{init: {}}%% B` the participant `A`, two spaces, and `B`.
  [fixture: sequence/lex-directive-in-id-before-space] [fixture:
  sequence/lex-directive-in-id-run-before-space] [fixture:
  sequence/tokens-directive-participant-spaces] So it is with an ignored `;`: on
  a line that matches the `style` rule, `participant B;C` has the participant
  `BC`, and `B;C->>E: m` a message from `BC`. [fixture:
  sequence/tokens-ignored-semicolon-in-participant-id] [fixture:
  sequence/tokens-ignored-semicolon-in-message-id]
- In `parti%%{init: {}}%%cipant A`, `A-%%{init: {}}%%>>B: x`,
  `autonumber 1%%{init: {}}%%0`, and `A->>B: wr%%{init: {}}%%ap:x`, the
  directive lies inside a keyword, an arrow, a number, or a `wrap-prefix` unit,
  and the input is rejected, while mermaid.js accepts it (see
  [Known divergences](#known-divergences)). [fixture:
  sequence/div-directive-in-keyword] [fixture: sequence/div-directive-in-arrow]
  [fixture: sequence/div-directive-in-number] [fixture:
  sequence/div-directive-in-wrap-prefix]

### The statement context

In the statement context, the lexer tries these rules in order:

1. One or more line feeds: a `newline` unit. [fixture:
   sequence/lex-autonumber-line-break]
2. One or more whitespace characters, the first of which is not a line feed:
   nothing. The run takes the line feeds that follow the whitespace too, so a
   line break after whitespace makes no `newline` unit. The other contexts and
   the rules that read to the end of a line keep the line break. [fixture:
   sequence/lex-trailing-space-hides-line-break]
3. `#` and the rest of its line, up to the line feed: a diagram comment.
   [fixture: sequence/lex-hash-comment-after-unit]
4. `%` that is not followed by `{`, and the rest of its line: a diagram comment.
   One `%` is enough: `autonumber % c` and a line `% hello` are comments, while
   a line with `%%` at its start is a comment line of
   [common.md](../common.md#comment-lines), removed before the lexer reads the
   text. [fixture: sequence/lex-single-percent-comment] [fixture:
   sequence/lex-single-percent-comment-line]
5. A **number**: one or more digits, optionally followed by `.` and one or two
   digits, or `.` followed by one or two digits; then, not read, a space, a line
   feed, or `%%` must follow. A `number` unit. [fixture:
   sequence/db-autonumber-start] [fixture: sequence/db-autonumber-fraction]
   [fixture: sequence/lex-number-before-space] [fixture:
   sequence/lex-number-three-decimals] [fixture:
   sequence/spec-sequence-diagram-0c1ce079]
6. The keyword `box`: a `box` unit; enters the line context. [fixture:
   sequence/db-box-empty]
7. The keywords `participant` and `actor`: a unit named by the keyword; enters
   the id context. [fixture: sequence/lex-alias-tabs] [fixture:
   sequence/demo-sequence-6c40b039]
8. The keyword `create`: a `create` unit. [fixture:
   sequence/db-create-participant-before-message]
9. The keyword `destroy`: a `destroy` unit; enters the id context. [fixture:
   sequence/gram-destroy-last]
10. The keywords `loop`, `rect`, `opt`, `alt`, `else`, `par`, `par_over`, `and`,
    `critical`, `option`, and `break`: a unit named by the keyword; enters the
    line context. [fixture: sequence/gram-block-empty-text] [fixture:
    sequence/db-block-rect] [fixture: sequence/db-block-opt] [fixture:
    sequence/db-block-alt] [fixture: sequence/db-block-par] [fixture:
    sequence/db-block-par-over] [fixture: sequence/db-block-critical] [fixture:
    sequence/db-block-break]
11. The keywords `end`, `links`, `link`, `properties`, `details`, `over`, and
    `note`: a unit named by the keyword. The keyword `left of` or `right of`,
    with one space between the two words: a `left` or `right` unit and an `of`
    unit. With two spaces or a tab between the words, the input is rejected. The
    space is counted in the diagram text, and a directive or an ignored `;` next
    to it lies between two units: `Note left%%{init: {}}%% of A: t`,
    `Note left %%{init: {}}%%of A: t`, and `Note right%%{init: {}}%% of A: t`
    are notes, and so is `Note left; of A: t` on a line that matches the `style`
    rule, while `Note left %%{init: {}}%% of A: t` has two spaces and is
    rejected, all as in mermaid.js. [fixture:
    sequence/lex-note-position-two-spaces] [fixture:
    sequence/lex-note-position-tab] [fixture:
    sequence/lex-directive-between-left-and-of] [fixture:
    sequence/lex-directive-between-space-and-of] [fixture:
    sequence/lex-directive-between-right-and-of] [fixture:
    sequence/tokens-ignored-semicolon-between-left-and-of] [fixture:
    sequence/tokens-ignored-semicolon-between-space-and-of] [fixture:
    sequence/lex-note-position-directive-between-spaces] [fixture:
    sequence/gram-statement-after-end] [fixture: sequence/db-links-empty]
    [fixture: sequence/db-link-without-at] [fixture:
    sequence/db-properties-empty] [fixture: sequence/db-details-empty] [fixture:
    sequence/db-note-over-two] [fixture: sequence/lex-keyword-mixed-case]
12. The keywords `activate` and `deactivate`: a unit named by the keyword;
    enters the id context. [fixture: sequence/lex-activate-id-space] [fixture:
    sequence/db-deactivate-after-plus]
13. `title`, one whitespace character, which may be a line feed, and one or more
    characters other than `#`, `;`, and line feed: a `title` unit for the word
    and the whitespace, and a `title-text` unit for the rest. [fixture:
    sequence/lex-title-line-break] [fixture: sequence/lex-title-rest-of-line]
14. `title:`, one whitespace character, and one or more characters other than
    `#`, `;`, and line feed: a `title:` unit and a `title-text` unit, in the
    same way. [fixture: sequence/db-title-legacy]
15. `accTitle`, zero or more whitespace, `:`, and zero or more whitespace: an
    `accTitle` unit and a `:` unit; enters the title context. [fixture:
    sequence/lex-acc-title-line-feed] [fixture:
    sequence/lex-acc-title-directive-before-colon] [fixture:
    sequence/lex-acc-title-no-whitespace] [fixture:
    sequence/lex-acc-title-line-feed-before-colon]
16. `accDescr`, zero or more whitespace, `:`, and zero or more whitespace: an
    `accDescr` unit and a `:` unit; enters the description context. [fixture:
    sequence/db-acc-descr-empty-replaces] [fixture:
    sequence/lex-acc-descr-no-whitespace] [fixture:
    sequence/lex-acc-descr-space-before-colon] [fixture:
    sequence/lex-acc-descr-line-feed-before-colon]
17. `accDescr`, zero or more whitespace, `{`, and zero or more whitespace: an
    `accDescr` unit and a `{` unit; enters the description block context.
    [fixture: sequence/db-acc-descr-empty-block-after-message] [fixture:
    sequence/lex-acc-descr-block-no-whitespace] [fixture:
    sequence/lex-acc-descr-block-line-feed-before-brace]
18. The keywords `sequenceDiagram`, `autonumber`, and `off`: a unit named by the
    keyword. [fixture: sequence/header-statement-same-line] [fixture:
    sequence/lex-autonumber-line-break] [fixture: sequence/db-autonumber-off]
19. `,`: a `,` unit. [fixture: sequence/db-note-over-two]
20. `;`: a `newline` unit. [fixture: sequence/spec-sequence-diagram-543d2299]
21. An **id run**: a run of characters described under [Id runs](#id-runs). An
    `id` unit, whose text is the run without the whitespace at its ends.
    [fixture: sequence/lex-id-run-space]
22. An arrow, the first of these that matches: `->>`, `<<->>`, `-->>`, `<<-->>`,
    `->`, `-->`, `-x`, `--x`, `-)`, `--)`, `--|\`, `--|/`, `--\\`, `--//`,
    `/|--`, `\|--`, `//--`, `\\--`, `-|\`, `-|/`, `-\\`, `-//`, `/|-`, `\|-`,
    `//-`, and `\\-`. An `arrow` unit. [fixture: sequence/db-arrow-types]
23. `:` and the rest of its line, up to `#`, `;`, or a line feed: a `:` unit,
    followed by the rest read as a text part (see [Text parts](#text-parts)).
    [fixture: sequence/lex-empty-text] [fixture: sequence/lex-hash-ends-text]
    [fixture: sequence/spec-sequence-diagram-543d2299]
24. `+`, `-`, and `()`: a unit named by its text. [fixture:
    sequence/db-message-activate-target] [fixture:
    sequence/db-message-central-connection-both]
25. Any other character: an `invalid` unit. [fixture:
    sequence/lex-invalid-line-parenthesis]

At the end of the text, the lexer reads a `newline` unit when it is in the
statement context, and nothing in the other contexts: a description block that
the text ends, as in `accDescr {` or `accDescr { x` at the end of the text, is
followed by no `newline` unit, and its statement ends with the text (see the
production `accessibility-statement`). [fixture:
sequence/lex-acc-descr-block-unclosed-empty] [fixture:
sequence/db-acc-descr-block-unclosed] [fixture: sequence/demo-sequence-6c40b039]
[fixture: sequence/spec-sequence-diagram-f9fe3428] [fixture:
sequence/lex-acc-title-at-end] [fixture: sequence/db-acc-descr-empty-replaces]
[fixture: sequence/lex-alias-at-end] [fixture: sequence/lex-data-block-at-end]

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
  `A->>B: x` and no message. `title x A->>B: y` has the title `x A->>B: y`. The
  indentation of the next line is part of the title: `title`, a line break, two
  spaces, and `A->>B: x` has the title of the two spaces and `A->>B: x`. A `#`
  or a `;` ends the title: `title a;;` has the title `a`, and each `;` after it
  is a `newline` unit. [fixture: sequence/lex-title-line-break] [fixture:
  sequence/lex-title-rest-of-line] [fixture:
  sequence/db-title-next-line-indented] [fixture:
  sequence/gram-title-then-separators]
- An id run ends as [Id runs](#id-runs) describes. A character where no id run
  and no unit of rules 22 to 24 starts is an `invalid` unit, and a line of an
  `invalid` unit is accepted (see [Grammar](#grammar)): a line with only `)`,
  `/`, `\`, `<`, or `>` is accepted. [fixture:
  sequence/lex-invalid-line-parenthesis] [fixture:
  sequence/lex-invalid-line-slash] [fixture:
  sequence/lex-invalid-line-two-units]

### Id runs

An id run is read from left to right, in two steps:

1. as many characters as possible, at least one, other than `/`, `\`, `+`, `(`,
   `)`, `<`, `-`, `>`, `:`, `,`, `;`, and line feed; then [fixture:
   sequence/lex-id-run-space]
2. continuations, one after another, as long as one can start where the run
   ends. A continuation is zero or more `-`, followed by as many characters as
   possible, at least one, other than `+`, `<`, `-`, `>`, `:`, `,`, `;`, and
   line feed. A continuation cannot start where one of these follows: `-x`,
   `-)`, `-\`, `-/`, `-|\`, `-|/`, `--`, `/|-`, `\|-`, `//-`, `\\-`, and `()`;
   the first eleven are the starts of the arrows. [fixture:
   sequence/lex-id-run-dash] [fixture: sequence/db-arrow-types]

Neither step gives characters back to the one before: in `Alice()->>John: x`,
step 1 reads `Alice`, and no continuation can start before `()`, so the run is
`Alice`, followed by `()`, although `Alic` and a continuation `e()` would make a
longer run; and `Al()ice->>B: x` is rejected. The exception for `()` is checked
only where a continuation starts: in `A(x)()->>B: x`, the continuation `(x)()`
holds the `()`, and the participant is `A(x)()`. [fixture:
sequence/lex-id-run-empty-parentheses-ends-run] [fixture:
sequence/lex-id-run-empty-parentheses-inside-rejected] [fixture:
sequence/lex-id-run-empty-parentheses-in-continuation]

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

1. Whitespace other than line feeds: nothing. [fixture:
   sequence/lex-id-context-space]
2. `#` and the rest of its line: a diagram comment. [fixture:
   sequence/lex-id-context-hash-comment]
3. `@{`: a `@{` unit; enters the data context. [fixture:
   sequence/gram-data-block-line-break-only]
4. One or more characters other than `<`, `=`, `>`, `-`, `:`, `,`, `;`, `@`,
   whitespace, and line feed, followed directly by `@{`, which is not read: an
   `id` unit. [fixture: sequence/db-data-block-create-participant] [fixture:
   sequence/lex-id-before-data-dash]
5. One or more characters other than `<`, `>`, `:`, `,`, `;`, `@`, whitespace,
   and line feed, followed by whitespace, the keyword `as`, and one whitespace
   character, which are not read: an `id` unit; enters the alias context.
   [fixture: sequence/lex-alias-upper-case] [fixture:
   sequence/lex-id-context-line-separator-before-as]
6. The longest run of one or more characters other than `<`, `>`, `:`, `,`, `;`,
   `@`, and line feed that is followed by zero or more whitespace and a line
   feed, `;`, or `#`, which are not read: an `id` unit, whose text is the run
   without the whitespace at its ends; leaves the id context. [fixture:
   sequence/lex-id-context-space] [fixture:
   sequence/lex-id-context-line-separator-in-id]
7. Zero or more characters other than `<`, `>`, `:`, `,`, `;`, `@`, and line
   feed, then `<` and the rest of the line: an `invalid` unit; leaves the id
   context. [fixture: sequence/lex-id-context-hash-before-invalid]
8. One or more characters other than line feed: an `invalid` unit; leaves the id
   context. [fixture: sequence/lex-id-context-colon]

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

1. Whitespace other than line feeds: nothing. [fixture: sequence/lex-alias-tabs]
   [fixture: sequence/lex-alias-line-separator-after-as]
2. The keyword `as`: an `as` unit; leaves the alias context and the id context,
   and enters the line context. [fixture: sequence/lex-alias-upper-case]
3. Nothing, at a line feed: a `newline` unit that reads no character; leaves the
   alias context and the id context. [fixture:
   sequence/lex-alias-lookahead-line-break-participant]

The keyword is case-insensitive, and the whitespace around it may be any
whitespace other than a line feed: `participant A AS B` and the same with tabs
give A the description `B`. [fixture: sequence/lex-alias-upper-case] [fixture:
sequence/lex-alias-tabs]

Rule 3 applies when a line feed lies between the id or the data block and `as`.
The whitespace that rule 5 of the id context and rule 2 of the data context look
for before `as` includes line feeds, so `participant A`, a line break, and
`as ->> B: x` enter the alias context after `A`; the alias context reads no `as`
before the line feed and ends the statement there, with a `newline` unit of no
characters. The line feed after it is a `newline` unit of the statement context,
and the next line is a statement of its own, read as without the line before it:
a message from `as` to B. This is so after every keyword that enters the id
context, also when the id is `as`, after a data block, and across several line
breaks; and a next line that is no statement, such as `as B` or `as` alone,
makes the input rejected. [fixture:
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

1. Whitespace other than line feeds, except right after a colour candidate:
   nothing. [fixture: sequence/spec-sequence-diagram-01f0c47f]
2. `#` and the rest of its line: a diagram comment. [fixture:
   sequence/spec-sequence-diagram-01f0c47f]
3. Only as the first unit after `box`, a **colour candidate**: `rgb`, `rgba`,
   `hsl`, or `hsla`, in lower case, zero or more whitespace, `(`, and the
   characters up to the last `)` before the next `#`, `;`, or line feed; or else
   one or more word characters (ASCII letters, digits, and `_`). A
   `color-candidate` unit. [fixture: sequence/db-box-colour-without-space]
   [fixture: sequence/db-box-colour-rgba] [fixture: sequence/db-box-colour-hsl]
   [fixture: sequence/db-box-colour-hsla]
4. Zero or more characters other than `#`, `;`, and line feed: after `box`, a
   `text` unit unless they are all whitespace other than U+2028 and U+2029, and
   after another keyword, read as a text part (see [Text parts](#text-parts));
   leaves the line context. [fixture: sequence/db-box-no-colour-candidate]

So the text of `loop x # c` is `x` and a space, and `alt;B->>A: y` is an `alt`
block with an empty text, followed by a message. [fixture:
sequence/spec-sequence-diagram-01f0c47f] [fixture:
sequence/spec-sequence-diagram-453b7670] After a colour candidate, rule 4 reads
the rest of the line from the end of the candidate, its whitespace included,
because mermaid.js reads the whole text after `box` as one unit once it has
skipped the whitespace before it: `box aqua`, two spaces, and U+2028 has the
candidate `aqua` and the text of the two spaces and U+2028, and `box red-team`
followed by two spaces the text `-team` and the two spaces. [fixture:
sequence/db-box-colour-then-spaces-and-line-separator] [fixture:
sequence/tokens-box-text-trailing-spaces]

### The data context

The data context is entered by `@{` after an id:

1. One or more characters other than `}`: a `data-text` unit. [fixture:
   sequence/db-data-block-create-participant]
2. `}` followed by whitespace, the keyword `as`, and one whitespace character,
   which are not read: a `}` unit; leaves the data context and enters the alias
   context. [fixture: sequence/db-data-block-alias-and-as]
3. `}`: a `}` unit; leaves the data context and the id context. [fixture:
   sequence/db-data-block-create-participant]

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
[fixture: sequence/tokens-acc-descr-ignored-semicolon] [fixture:
sequence/tokens-acc-descr-block-ignored-semicolon]

### Text parts

A **text part** is the rest of a line after `:`, or after a keyword that enters
the line context other than `box`. Its whitespace at the start belongs to no
unit. When what follows starts with a **wrap prefix**, `wrap:` or `nowrap:`,
optionally after one `:`, compared case-sensitively, the prefix is a
`wrap-prefix` unit. It is not a text, so a directive inside it makes the input
rejected, while mermaid.js accepts `A->>B: wr%%{init: {}}%%ap:x` with the
message `x`, wrapped (see [Directives inside units](#directives-inside-units)).
[fixture: sequence/div-directive-in-wrap-prefix] The rest, when it is not all
whitespace, is a `text` unit. mermaid.js reads a text part as a text and its
wrap setting: the text without the prefix and without the whitespace at its
ends, wrapped after `wrap:` and not wrapped after `nowrap:`. `A->>B: wrap:long`
has the message `long`, wrapped, and `A->>B: :nowrap: x` the message `x`, not
wrapped, while `A->>B: WRAP:x` has the message `WRAP:x`. A text part may be
empty: `A->>B:` has the empty message. [fixture: sequence/lex-wrap-prefix]
[fixture: sequence/lex-nowrap-prefix-colon] [fixture:
sequence/lex-wrap-prefix-upper-case] [fixture:
sequence/config-wrap-site-nowrap-prefix] [fixture: sequence/db-block-loop-wrap]
[fixture: sequence/lex-empty-text] [fixture: sequence/lex-wrap-prefix-colon]
[fixture: sequence/lex-text-part-whitespace-only] [fixture:
sequence/lex-block-text-whitespace-only]

After `box`, the rest of the line is divided by its form alone into a colour
candidate and a `text` unit, either of which may be missing, as mermaid.js
divides it before it asks whether the candidate is a colour: `box aqua Group`
has the candidate `aqua` and the text `Group`, `box rgb(1,2,3)x` the candidate
`rgb(1,2,3)` and the text `x`, `box rgb(1, 2, 3) a) b` the candidate
`rgb(1, 2, 3) a)` and the text `b`, `box rgb( a` the candidate `rgb` and the
text `( a`, and `box -x` no candidate and the text `-x`. Both are units, because
the division does not depend on the answer. Whether the candidate is a colour
does, and so does the place of a wrap prefix, which is read from the candidate's
text and the rest together when the candidate is no colour; so there is no
`wrap-prefix` unit after `box`. [fixture:
sequence/spec-sequence-diagram-9f31df65] [fixture:
sequence/db-box-colour-without-space] [fixture:
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
| `"activate" id statement-end`, `"deactivate" id statement-end`                    | SequenceActivateStatement, SequenceDeactivateStatement                                                                                             |
| `note-statement`                                                                  | SequenceNoteStatement                                                                                                                              |
| `"links"`, `"link"`, `"properties"`, `"details"` statements                       | SequenceLinksStatement, SequenceLinkStatement, SequencePropertiesStatement, SequenceDetailsStatement                                               |
| `title-statement`                                                                 | SequenceTitleStatement                                                                                                                             |
| `accessibility-statement`                                                         | SequenceAccTitleStatement, SequenceAccDescrStatement, or SequenceAccDescrBlockStatement                                                            |
| `empty-description-block`                                                         | SequenceAccDescrBlockStatement without text: a statement of a box, or a statement after the statement before it                                    |
| `block-statement` with `loop`, `rect`, `opt`, `break`                             | SequenceLoopStatement, SequenceRectStatement, SequenceOptStatement, SequenceBreakStatement                                                         |
| `block-statement` with `alt`, `par`, `par_over`, `critical`                       | SequenceAltStatement, SequenceParStatement, SequenceParOverStatement, SequenceCriticalStatement, with a SequenceSection for each `text-part line*` |
| `text-part`                                                                       | SequenceText, or nothing when it has neither unit                                                                                                  |
| `id`                                                                              | SequenceIdentifier                                                                                                                                 |
| `number`                                                                          | NumericLiteral                                                                                                                                     |
| `text` of a text part, `title-text`, `description-text`, `description-block-text` | SequenceLiteral                                                                                                                                    |
| `invalid` as a line                                                               | SequenceIgnoredStatement                                                                                                                           |

### Diagram and statements

```text
diagram             = newline* "sequenceDiagram" line*
line                = statement | newline | invalid
statement           = participant-statement
                    | "create" participant-statement
                    | box-statement
                    | message-statement statement-end
                    | autonumber-statement statement-end
                    | ( "activate" | "deactivate" ) id statement-end
                    | note-statement statement-end
                    | ( "links" | "link" | "properties" | "details" ) id ":" text-part statement-end
                    | title-statement
                    | accessibility-statement
                    | block-statement
```

A statement that ends with `newline` must be followed by a line break, a `;`, or
the end of the text. The others need no separator: a box and a block end at
`end`, and a title or an accessibility statement runs to the end of its line, so
another statement may follow on the same line after `end`: `loop x`, a message,
and `end A->>B: z` has the message after the loop. [fixture:
sequence/gram-statement-after-end] [fixture:
sequence/spec-sequence-diagram-543d2299] [fixture:
sequence/spec-sequence-diagram-8e03af61] A line of an `invalid` unit is accepted
and is a SequenceIgnoredStatement in the tree, also after `end` on the same
line. [fixture: sequence/lex-invalid-line-parenthesis] [fixture:
sequence/gram-invalid-after-end] A line `)` after a message whose text was meant
to continue is such a line: `A->>B: call(x`, a line break, and `)` has the
message `call(x`. [fixture: sequence/db-ignored-line-after-wrapped-message]
[fixture: sequence/db-wrapped-message-closed]

### Empty description blocks before a separator

```text
statement-end           = empty-description-block* newline
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `description-block-text` unit. A statement that
needs a separator ends with a `statement-end`: after its last unit and before
its separator, any number of empty description blocks may come. Each is a
description block statement without text, a statement of its own after that
statement. mermaid.js reads no token for an empty description block (see
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md)), so it
reads the statement as followed directly by its separator. A description block
with text and any other statement may not come before the separator.

In sequence, the statements that need a `newline` unit are participant, destroy,
message, `autonumber`, activate and deactivate, note, and links, link,
properties, and details statements. A block can lie between the last unit of
such a statement and its `newline` only where that unit is not read with it: in
a text, an id, or a description after `as`, the lexer reads `accDescr {}` as
part of the text or the id. So it lies after a data block of a participant or an
actor and after `autonumber`: `participant A@{ "type": "actor" } accDescr {}`,
the same without the space, and `autonumber accDescr {}` are accepted. [fixture:
sequence/gram-empty-description-block-after-participant-data] [fixture:
sequence/gram-empty-description-block-after-actor-data-glued] [fixture:
sequence/gram-empty-description-block-after-autonumber] [fixture:
sequence/gram-empty-description-block-in-message-text] [fixture:
sequence/gram-empty-description-block-in-participant-id] [fixture:
sequence/gram-empty-description-block-in-alias-text] Whitespace before the block
is read alone, so the line break after the block is the `newline` unit of the
statement: `autonumber`, two spaces, `accDescr {}`, and a line break is
accepted, while `autonumber`, two spaces, and a line break is rejected, because
the spaces hide the line break (see
[The statement context](#the-statement-context)). [fixture:
sequence/gram-empty-description-block-after-autonumber-spaces] [fixture:
sequence/lex-trailing-space-hides-line-break] Another statement after the block
on the same line is rejected, as in mermaid.js:
`autonumber accDescr {} A->>B: x`. [fixture:
sequence/gram-empty-description-block-after-autonumber-then-message]

A statement may start right after the keyword `sequenceDiagram`, on its line
(see [Detection](#detection)), so an empty description block there needs no rule
of its own: it lies where a statement starts and is the first statement of the
diagram. `sequenceDiagram accDescr {}`, a line break, and `A->>B: x` is
accepted, as in mermaid.js. [fixture: sequence/header-empty-description-block]

### Participants and boxes

```text
participant-statement = ( "participant" | "actor" ) id data-block? ( "as" text-part )? statement-end
                      | "destroy" id statement-end
data-block            = "@{" data-text "}"
box-statement         = "box" box-text? ( participant-statement | empty-description-block | newline )* "end"
box-text              = color-candidate text? | text
```

The data block is embedded data: its content is kept as written and not read. It
needs content: `participant A@{}` is rejected, as in mermaid.js, while
`participant A@{ }` and the same with a line break between the braces are
accepted. [fixture: sequence/gram-data-block-empty] [fixture:
sequence/gram-data-block-line-break-only] `create` may come before any
participant statement, `destroy` included: `create destroy A` is a destroy
statement with `create` (see
[Rejections outside the grammar](#rejections-outside-the-grammar)). [fixture:
sequence/gram-create-destroy] [fixture: sequence/spec-sequence-diagram-a7618b16]
A box holds only participant statements, empty description blocks, and empty
lines, without `create` and without messages. [fixture:
sequence/gram-box-create-participant] [fixture:
sequence/gram-box-message-inside] An empty description block in a box is a
description block statement without text, as where any other statement starts:
it may be on a line of its own, over several lines with only whitespace between
its braces, or followed on the same line by a participant statement or by `end`.
[fixture: sequence/gram-box-empty-description-block-line] [fixture:
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

A message may have `+` or `-` after the arrow, or `()` after the arrow or before
it, or both, and `+` and `-` cannot be combined with `()`. A message needs a
text, which may be empty after its `:`: `A->>B` is rejected, and `A->>B:` is
accepted. [fixture: sequence/gram-message-without-text] [fixture:
sequence/db-message-central-connection-both] [fixture:
sequence/gram-message-activation-then-central-connection] [fixture:
sequence/gram-message-central-connection-then-activation] [fixture:
sequence/lex-empty-text]

### Other statements

```text
autonumber-statement    = "autonumber" ( number number? | "off" )?
note-statement          = "note" ( "left" | "right" ) "of" id ":" text-part
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
empty text. [fixture: sequence/gram-block-empty-text] Each keyword starts a
block of its own kind, and `else`, `and`, and `option` start the sections of an
`alt` block, of a `par` or `par_over` block, and of a `critical` block.
[fixture: sequence/db-block-rect] [fixture: sequence/gram-block-loop-else]
[fixture: sequence/gram-block-alt-option] [fixture:
sequence/gram-block-critical-and] [fixture: sequence/db-block-opt] [fixture:
sequence/db-block-break] [fixture: sequence/db-block-alt] [fixture:
sequence/db-block-par] [fixture: sequence/db-block-par-over] [fixture:
sequence/db-block-critical]

### Rejections outside the grammar

mermaid.js rejects some inputs that the grammar accepts, while it builds the Db.
Each is decided from the statements in source order:

- **Deactivating an inactive participant.** A participant is **activated** by an
  `activate` statement for it and by a message with `+` after the arrow, for its
  target, and **deactivated** by a `deactivate` statement for it and by a
  message with `-` after the arrow, for its source; `()` before or after an
  arrow does neither. A deactivation is rejected when the activations of that
  participant before it are not more than its deactivations before it. [fixture:
  sequence/gram-deactivate-inactive] [fixture:
  sequence/gram-deactivate-after-message] [fixture:
  sequence/db-activation-plus-then-minus] [fixture:
  sequence/db-activation-twice-deactivation-twice] [fixture:
  sequence/gram-deactivate-after-activate-deactivate] [fixture:
  sequence/gram-deactivate-after-central-connection] [fixture:
  sequence/db-deactivate-after-plus] [fixture: sequence/db-minus-after-activate]
- **Creating an existing participant.** `create` with the id of a participant
  that has been **added** before. A participant is added by a participant
  statement, by a destroy statement with `create`, and by a message, a note, and
  a `links`, `link`, `properties`, or `details` statement, for each id it names;
  `activate`, `deactivate`, and a destroy statement without `create` add none.
  [fixture: sequence/gram-create-existing] [fixture:
  sequence/gram-create-after-message] [fixture: sequence/gram-create-after-note]
  [fixture: sequence/gram-create-after-links] [fixture:
  sequence/gram-create-after-link] [fixture:
  sequence/gram-create-after-properties] [fixture:
  sequence/gram-create-after-details] [fixture:
  sequence/gram-create-after-create-destroy] [fixture:
  sequence/gram-create-after-message-and-destroy] [fixture:
  sequence/db-create-after-activate] [fixture:
  sequence/db-create-after-destroy-only]
- **The message after `create` or `destroy`.** See below. [fixture:
  sequence/gram-create-without-message] [fixture:
  sequence/gram-destroy-without-message]
- **A participant in two boxes.** A participant statement inside a box for a
  participant that has another box already. A participant **gets a box** when a
  participant statement inside the box names it while it has no box; a
  participant statement outside a box, and a destroy statement inside one,
  change no box. [fixture: sequence/gram-box-participant-in-two-boxes] [fixture:
  sequence/gram-box-participant-added-by-message] [fixture:
  sequence/db-box-existing-participant-joins-box] [fixture:
  sequence/db-box-same-participant-twice] [fixture:
  sequence/db-box-participant-outside-after] [fixture:
  sequence/db-box-destroy-in-other-box]

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

## Known divergences

These divergences of [known-divergences.md](../known-divergences.md) apply to
sequence, and show in it as follows.

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a unit other than a text unit, such as a keyword, a
  delimiter, an arrow, or a number, makes the input rejected here, while
  mermaid.js accepts it: `parti%%{init: {}}%%cipant A`,
  `A-%%{init: {}}%%>>B: x`, `autonumber 1%%{init: {}}%%0`, and
  `A->>B: wr%%{init: {}}%%ap:x` (see
  [Directives inside units](#directives-inside-units)). [fixture:
  sequence/div-directive-in-keyword] [fixture: sequence/div-directive-in-arrow]
  [fixture: sequence/div-directive-in-number] [fixture:
  sequence/div-directive-in-wrap-prefix]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule, as after
  `participant Z@{ "style": "x:#y" };`, the ignored `;` inside a number, a
  keyword, or an arrow makes the input rejected here, while mermaid.js accepts
  it: `autonumber 1;0`, `autonumber 1 1;0`, `parti;cipant B`,
  `Note le;ft of A: t`, and `A-;>>B: m`. [fixture:
  sequence/div-ignored-semicolon-in-autonumber-start] [fixture:
  sequence/div-ignored-semicolon-in-autonumber-step] [fixture:
  sequence/div-ignored-semicolon-in-keyword] [fixture:
  sequence/div-ignored-semicolon-in-position-word] [fixture:
  sequence/div-ignored-semicolon-in-arrow]
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
  An empty description block inside a statement, neither where a statement
  starts nor before its `newline`, makes the input rejected here, while
  mermaid.js reads no token for it and accepts the input: `A->>accDescr {}B: x`
  and `note left of accDescr {} A: x`. An empty description block where a
  statement starts, also inside a box, is a description block statement without
  text, which changes nothing. [fixture:
  sequence/gram-box-empty-description-block-line] [fixture:
  sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/gram-acc-descr-block-empty-then-statement]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.md).**
  A `%%` right after a character other than whitespace is read here as
  [The statement context](#the-statement-context) says: the character before it
  stays in what the lexer reads there, and the `%%` starts a comment after a
  number, and is a character of the id run or the text after a character of an
  id run or after `:`. mermaid.js reads the character before it as part of a
  comment instead, and reads no number before `%%`. A line `C%% c` is accepted
  by mermaid.js and rejected here, `A->>B:%% c` and `autonumber 10%% c` are
  rejected by mermaid.js and accepted here, and `autonumber 5%% c` starts at 5
  here and has no start in mermaid.js. [fixture:
  sequence/div-comment-after-one-character-id] [fixture:
  sequence/div-comment-after-text-colon] [fixture:
  sequence/div-comment-after-two-digit-number] [fixture:
  sequence/lex-percent-comment-takes-number]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, as a participant, in a message text, or in a note, makes
  mermaid.js hand the text to the C4 parser, which rejects it; here the text is
  a sequence diagram. [fixture: common/detect-c4-anywhere]
