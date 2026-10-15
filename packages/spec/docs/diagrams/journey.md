# Journey

Japanese version: [journey.ja.md](./journey.ja.md)

Source of truth in mermaid.js:

- [`journey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison)
- [`journeyDb.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js)
- the tests (`*.spec.js`) in
  [`user-journey/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey)

This document covers the diagram type `journey`, the user journey diagram. The
nodes of the tree are defined in [ast/journey.md](../ast/journey.md).

## Detection

Entry 21 of [detection.md](../detection.md) selects this grammar: the text
starts with `journey`, after whitespace, in exactly this case
([`journeyDetector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDetector.ts#L9-L11)).
`JOURNEY` is no journey diagram and matches no detector. [fixture:
journey/header-only] [fixture: journey/header-leading-whitespace] [fixture:
journey/header-upper-case]

The lexer then reads the header again, case-insensitively and not followed by a
word character (see [The statement context](#the-statement-context)). So
`journey2` and `journeyX: 1` are detected as journey diagrams and rejected,
while `journey-x: 1` is the header followed by the task `-x`. A statement may
follow the header on its line, after whitespace or not, and the header alone is
accepted, also without a line feed after it. `journey:` is rejected, as the
header followed by a `:` unit, which the grammar does not take, while
`journey#c` and `journey%c` are the header and a comment. [fixture:
journey/header-digit-suffix] [fixture: journey/header-word-suffix-task]
[fixture: journey/header-dash-suffix-task] [fixture:
journey/header-statement-same-line] [fixture: journey/header-task-same-line]
[fixture: journey/header-section-same-line] [fixture:
journey/header-acc-title-same-line] [fixture: journey/header-tab-then-task]
[fixture: journey/header-only] [fixture: journey/header-line-feed-only]
[fixture: journey/header-crlf] [fixture: journey/header-cr-only] [fixture:
journey/header-colon] [fixture: journey/header-hash] [fixture:
journey/header-percent]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, before the
header is a bare `%%` line, which detection reads and passes to find the header,
and which is a comment of the diagram here, with the mark `%%`, as in every
diagram type (see [Diagram detection](../common.md#diagram-detection)); the
comment belongs to no node, and the JourneyDiagram starts at the header.
mermaid.js rejects the input in both cases, and also with a line of whitespace
only after the bare line, because its lexer reads the `%%` as a comment but the
line feed after it as a `newline` unit, which its grammar does not take before
the header: the known divergence
[`bare-percent-line-before-header`](#known-divergences). `%%` followed by a
space is a comment line, removed before detection, and so is a line `%% c`. A
directive on a line before the header or right after the header on its line is a
directive and nothing else, and an empty description block before the header is
the first unit of the text, so no detector matches. [fixture:
journey/header-after-bare-percent-line] [fixture:
journey/header-after-empty-braces-line] [fixture:
journey/header-after-bare-percent-line-and-whitespace-line] [fixture:
journey/header-after-percent-space-line] [fixture:
journey/header-after-comment-line] [fixture:
journey/header-after-directive-line] [fixture:
journey/header-then-directive-same-line] [fixture:
journey/header-after-empty-description-block]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text, so a
title text or task data at the end of the text ends there. [fixture:
journey/lex-task-at-end-of-text] [fixture:
journey/lex-title-text-at-end-of-text] This section describes the diagram's own
unit rules, item 4 of [Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram compares letters case-insensitively
(see [Notation](../common.md#notation)): `TITLE T`, `SECTION S`, `ACCTITLE: T`,
`ACCDESCR: D`, and `ACCDESCR { D }` are read as with the lower-case words. The
texts keep the case in which they are written. [fixture:
journey/lex-keywords-upper-case] [fixture: journey/lex-acc-keywords-upper-case]
[fixture: journey/lex-acc-descr-block-upper-case] A **keyword** below is a word,
matched case-insensitively, that is not followed by a word character (see
[Notation](../common.md#notation)) where the rule says so, and a word followed
by whitespace where it says so: `journey2` holds no header, and `titles`,
`title-x`, and `sectionx` are task texts, because no whitespace follows the word
(see [Keywords and what follows them](#the-statement-context)). [fixture:
journey/header-digit-suffix] [fixture: journey/lex-title-word-suffix-task]
[fixture: journey/lex-title-dash-task] [fixture:
journey/lex-section-word-suffix-task]

### Units and contexts

The lexer divides the diagram text into **units**. The grammar is written over
units. Each unit has a name, which the grammar uses, and a **text**: the
characters it read, in converted form.

The lexer keeps a stack of **contexts**. It starts in the statement context. A
rule may enter a context, which puts it on top of the stack, or leave the
current context, which returns to the one below it. At each position, the lexer
applies the first rule of the current context that matches there. Whitespace
that a rule reads belongs to no unit unless the rule says otherwise. When no
rule of the current context matches, the input is rejected; the lists below do
not repeat this.

The text may end in the statement context only. It may not end in the title
context, the description context, or the description block context: the input is
then rejected. So `accTitle:` with nothing after it, also with whitespace or a
line feed after the colon, `accDescr:` with nothing after it, and `accDescr {`
without `}`, with text after it or without, are rejected, also when lines
follow, because the rules of these contexts read line feeds. [fixture:
journey/lex-acc-title-at-end] [fixture: journey/lex-acc-title-space-at-end]
[fixture: journey/lex-acc-title-line-feed-at-end] [fixture:
journey/lex-acc-descr-at-end] [fixture: journey/lex-acc-descr-block-unclosed]
[fixture: journey/lex-acc-descr-block-unclosed-lines] [fixture:
journey/lex-acc-descr-block-unclosed-empty]

**Whitespace.** Whitespace in this document is the set of
[Notation](../common.md#notation): U+00A0, U+2028, U+3000, U+FEFF, a vertical
tab, and a form feed are whitespace wherever a rule reads whitespace, and so is
a line feed where a rule says so. In the statement context, a run of one or more
line feeds where a unit starts is a `newline` unit (rule 2), and any other run
of whitespace, line feeds included, lies between units without being part of one
(rule 3): `journey`, U+00A0, and `title T` is the header and the title, and so
with U+2028 in place of U+00A0. The rules for the keywords read whitespace
themselves, each as it says, and the texts of the statements take whitespace as
their own characters: U+3000 before a task text is whitespace, and U+3000 before
the colon is a character of the text; a form feed inside task data is a
character of the data, and U+FEFF and a vertical tab before a task are
whitespace. [fixture: journey/lex-whitespace-nbsp-between-units] [fixture:
journey/lex-whitespace-line-separator-between-units] [fixture:
journey/lex-whitespace-ideographic-space-around-task] [fixture:
journey/lex-whitespace-form-feed-in-data] [fixture:
journey/lex-whitespace-bom-before-task] [fixture:
journey/lex-whitespace-vertical-tab-before-task] [fixture:
journey/lex-newline-runs] [fixture: journey/lex-space-then-line-feeds-then-task]

**Entities.** An entity is read as its placeholder before the lexer reads the
text (see [Entities](../common.md#entities)), and the placeholder is made of
characters outside ASCII, so its `#` and `;` do not end a title text, a section
text, a task text, or task data, and the text keeps the entity as written:
`a#amp; b: 5` is a task whose description is `a#amp; b`; `title #x;` has the
title `#x;`; a person, an accessibility title, an accessibility description, and
a description block may hold one; after the entity, a `#` or a `;` ends the text
as usual. [fixture: journey/entity-placeholder-in-task-text] [fixture:
journey/entity-placeholder-in-title] [fixture:
journey/entity-placeholder-in-section] [fixture:
journey/entity-placeholder-in-person] [fixture:
journey/entity-placeholder-in-acc-title] [fixture:
journey/entity-placeholder-in-acc-descr] [fixture:
journey/entity-placeholder-in-acc-descr-block] [fixture:
journey/entity-placeholder-then-hash-in-title] [fixture:
journey/entity-placeholder-then-semicolon-in-data] The attribute quotes of an
HTML tag are read as `'` as in every diagram type (see
[HTML attribute quotes](../common.md#html-attribute-quotes)): `title`
`<b a="x">t</b>` has the title with `a='x'`, while quotes outside a tag stay
quotes, as in the task `A "x"`. [fixture: journey/lex-html-tag-in-title]
[fixture: journey/lex-quotes-in-task-text]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit keeps the reading of
mermaid.js, while a directive inside any other unit makes the input rejected.
This diagram type has no name units and no string units. The **text units** are
a `title-text`, a `section-text`, a `task-text`, a `score`, a `person`, an
`ignored-data`, an `acc-title-text`, an `acc-description-text`, and an
`acc-description-block-text`.

- `a%%{init: {}}%%b: 5` is the task `ab`, `A: 1%%{init: {}}%%0` has the score
  `10`, `A: 5: M%%{init: {}}%%e` the person `Me`, `title a%%{init: {}}%%b` the
  title `ab`, `section S%%{init: {}}%%T` the section `ST`,
  `accTitle: a%%{init: {}}%%b` the accessibility title `ab`, and so are the
  descriptions of `accDescr: a%%{init: {}}%%b` and
  `accDescr { a%%{init: {}}%%b }`, as in mermaid.js; in
  `A: 5: Me: a%%{init: {}}%%b` the directive lies inside the ignored data, and
  in `A: 5: Me: a %%{init: {}}%%b` the space before it is a character of the
  ignored data. [fixture: journey/lex-directive-in-task-text] [fixture:
  journey/lex-directive-in-score] [fixture: journey/lex-directive-in-person]
  [fixture: journey/lex-directive-in-title-text] [fixture:
  journey/lex-directive-in-section-text] [fixture:
  journey/lex-directive-in-acc-title] [fixture:
  journey/lex-directive-in-acc-descr] [fixture:
  journey/lex-directive-in-acc-descr-block] [fixture:
  journey/lex-directive-in-ignored-data] [fixture:
  journey/lex-directive-after-space-in-ignored-data]
- A directive between two units is allowed whatever their kind:
  `title %%{init: {}}%%T`, `title%%{init: {}}%% T`, `A %%{init: {}}%%: 5`,
  `A:%%{init: {}}%% 5`, `A: 5%%{init: {}}%%: Me`, `accTitle%%{init: {}}%%: T`,
  `accDescr %%{init: {}}%%{ d }`, and `journey%%{init: {}}%%` followed by a line
  are read as without the directive; the task of `A %%{init: {}}%%: 5` is `A `,
  whose space is a character of the task text. [fixture:
  journey/lex-directive-between-title-and-text] [fixture:
  journey/lex-directive-between-title-and-whitespace] [fixture:
  journey/lex-directive-between-task-text-and-colon] [fixture:
  journey/lex-directive-after-task-colon] [fixture:
  journey/lex-directive-before-second-colon] [fixture:
  journey/lex-directive-between-acc-title-and-colon] [fixture:
  journey/lex-directive-between-acc-descr-and-brace] [fixture:
  journey/header-then-directive-same-line]
- In `jour%%{init: {}}%%ney`, `ti%%{init: {}}%%tle T`,
  `sec%%{init: {}}%%tion S`, `acc%%{init: {}}%%Title: T`,
  `acc%%{init: {}}%%Descr: d`, and `acc%%{init: {}}%%Descr { d }` the directive
  lies inside a keyword: the input is rejected, while mermaid.js accepts it,
  reading the two parts as one (see [Known divergences](#known-divergences)).
  [fixture: journey/div-directive-in-header-keyword] [fixture:
  journey/div-directive-in-title-keyword] [fixture:
  journey/div-directive-in-section-keyword] [fixture:
  journey/div-directive-in-acc-title-keyword] [fixture:
  journey/div-directive-in-acc-descr-keyword] [fixture:
  journey/div-directive-in-acc-descr-block-keyword]

**Trivia between units.** The trivia of [common.md](../common.md) meet the units
of this diagram as follows. A lone CR is a line terminator, read as a line feed
(see [Line terminators](../common.md#line-terminators)): the header, a title, a
section, and a task are read between lone CRs, and between CRLF line breaks, as
between line feeds. [fixture: journey/header-cr-only] [fixture:
journey/lex-title-cr-value] [fixture: journey/lex-section-cr-value] [fixture:
journey/header-crlf] [fixture: journey/lex-title-crlf-value] [fixture:
journey/lex-section-crlf-value] A closed directive between two units is read as
nothing, and the whitespace around it by the rule of the context: a closed
directive at the end of a task, title, or section line, after the text or glued
to it, ends nothing, and the next line is read as usual; the whitespace before
it is a character of a title text or a section text, so `title T %%{init: {}}%%`
has the title `T ` and `section S %%{init: {}}%%` the section `S `, while glued
to the text they have `T` and `S`; an accessibility title and a person are read
without the whitespace at their ends, so the whitespace before such a directive
is outside them: `accTitle: T  %%{init: {}}%%` has the accessibility title `T`,
and `A: 5: Me %%{init: {}}%%` the person `Me`. [fixture:
journey/lex-directive-at-end-of-data-line] [fixture:
journey/lex-directive-glued-at-end-of-data] [fixture:
journey/lex-directive-at-end-of-title-line] [fixture:
journey/lex-directive-glued-at-end-of-title] [fixture:
journey/lex-directive-at-end-of-section-line] [fixture:
journey/lex-directive-glued-at-end-of-section] [fixture:
journey/lex-directive-after-acc-title-text] [fixture:
journey/lex-directive-after-person] An unclosed directive takes the rest of the
text (see [Where a directive is](../common.md#where-a-directive-is)):
`A: 5 %%{init: {}` followed by a line `B: 3` has the one task `A` with the score
`5`, `journey`, a line `%%{init: {}`, and a line `A: 1` has no task, and
`title T %%{init: {}` followed by a task line has the title `T ` and no task.
[fixture: journey/tokens-unclosed-directive-in-data-line] [fixture:
journey/tokens-unclosed-directive-after-header] [fixture:
journey/tokens-unclosed-directive-in-title] A comment line is removed before the
lexer reads the text, also inside a description block, and between a keyword and
what follows it: `title`, a comment line, and `T` has the title `T`, and so with
`section` and `S`, and with `accTitle:` and `T`. A block that holds only a
comment line is an empty description block. [fixture:
journey/tokens-comment-line-in-acc-block] [fixture:
journey/tokens-comment-line-only-in-acc-block] [fixture:
journey/tokens-comment-line-after-title-keyword] [fixture:
journey/tokens-comment-line-after-section-keyword] [fixture:
journey/tokens-comment-line-after-acc-title-colon] On a line that matches the
`style` rule (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)), the
ignored `;` is read through. The `style`, the `:`, and the `#` that the rule
looks for come before the `;` on the line, so the `;` lies after a `#`: in the
diagram comment that the `#` starts, in an accessibility title or description,
in a description block, or, when a description block on the line before the
statement holds the `#`, in the statement after it. In a text unit, the two
parts are read as one, as in mermaid.js: after `accDescr { style:#x }` on the
same line, `A;B: 5` is the task `AB`, `A: 5;6` has the score `56`, `A: 5: M;e`
the person `Me`, `title T;U` the title `TU`, and `section S;T` the section `ST`;
`accTitle: style:#x;` has the accessibility title `style:#x`, and so have the
description `accDescr: style:#x;` and the block `accDescr { style:#x; }`;
`title style:#x;` has the title `style:` and a comment. Between a keyword and
its whitespace, the `;` is read through too: `title; T` after such a block is
the title `T`. Where the `;` is not the last of its line, it is not ignored, and
the `#` before it makes an entity: `title style:#x;y;` has the title `style:`,
the placeholder of `#x;`, and `y`. Inside a keyword, the ignored `;` makes the
input rejected, while mermaid.js accepts it (see
[Known divergences](#known-divergences)). [fixture:
journey/tokens-ignored-semicolon-in-task-text] [fixture:
journey/tokens-ignored-semicolon-in-score] [fixture:
journey/tokens-ignored-semicolon-in-person] [fixture:
journey/tokens-ignored-semicolon-in-title-text] [fixture:
journey/tokens-ignored-semicolon-in-section-text] [fixture:
journey/tokens-ignored-semicolon-in-acc-title] [fixture:
journey/tokens-ignored-semicolon-in-acc-descr] [fixture:
journey/tokens-ignored-semicolon-in-acc-block] [fixture:
journey/tokens-ignored-semicolon-in-hash-comment] [fixture:
journey/tokens-ignored-semicolon-between-keyword-and-whitespace] [fixture:
journey/tokens-ignored-semicolon-first-of-two-in-title]

### The statement context

In the statement context, the lexer tries these rules in order:

1. `%`, not followed by `{`: a diagram comment, from the `%` to the end of the
   line (see [Comments](#comments)). [fixture: journey/lex-percent-comment-line]
   [fixture: journey/lex-percent-comment-glued-after-header] [fixture:
   journey/lex-percent-brace-task]
2. One or more line feeds: a `newline` unit. [fixture: journey/lex-newline-runs]
3. One or more whitespace characters, line feeds included: nothing. [fixture:
   journey/lex-space-then-line-feeds-then-task]
4. `#`: a diagram comment, from the `#` to the end of the line (see
   [Comments](#comments)). [fixture: journey/lex-hash-comment-line] [fixture:
   journey/lex-hash-comment-after-data]
5. The keyword `journey`: a `header` unit. [fixture: journey/header-only]
6. `title`, one whitespace character, line feed included, and one or more
   characters other than `#`, `;`, and a line feed: a `title` unit and a
   `title-text` unit, whose text is the characters after the one whitespace
   character. [fixture: journey/db-title-statement] [fixture:
   journey/lex-title-two-spaces] [fixture: journey/lex-title-tab] [fixture:
   journey/lex-title-nbsp] [fixture: journey/lex-title-line-feed-value]
   [fixture: journey/db-title-ends-at-hash] [fixture:
   journey/lex-title-semicolon] [fixture: journey/lex-title-colon-inside]
   [fixture: journey/lex-title-percent-inside] [fixture:
   journey/lex-title-trailing-spaces] [fixture:
   journey/lex-title-then-task-same-line]
7. `accTitle`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accTitle` unit
   and a `:` unit; enters the title context. [fixture: journey/db-acc-title]
   [fixture: journey/lex-acc-title-no-space] [fixture:
   journey/lex-acc-title-spaces-around-colon] [fixture:
   journey/lex-acc-title-line-feed-before-colon] [fixture:
   journey/gram-acc-title-line-feed-then-text]
8. `accDescr`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `:` unit; enters the description context. [fixture:
   journey/db-acc-descr] [fixture: journey/lex-acc-descr-line-feed-before-colon]
   [fixture: journey/gram-acc-descr-line-feed-then-text]
9. `accDescr`, zero or more whitespace characters, line feeds included, `{`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `{` unit; enters the description block context. [fixture:
   journey/db-acc-descr-block] [fixture: journey/lex-acc-descr-block-no-space]
   [fixture: journey/lex-acc-descr-block-spaces] [fixture:
   journey/lex-acc-descr-block-line-feed-before-brace]
10. `section`, one whitespace character, line feed included, and one or more
    characters other than `#`, `:`, `;`, and a line feed: a `section` unit and a
    `section-text` unit, whose text is the characters after the one whitespace
    character. [fixture: journey/db-sections] [fixture:
    journey/lex-section-two-spaces] [fixture: journey/lex-section-tab] [fixture:
    journey/lex-section-line-feed-value] [fixture:
    journey/db-section-ends-at-hash] [fixture: journey/lex-section-colon]
    [fixture: journey/lex-section-semicolon] [fixture:
    journey/lex-section-whitespace-only]
11. One or more characters other than `#`, `:`, `;`, and a line feed: a
    `task-text` unit. [fixture: journey/db-task-before-section] [fixture:
    journey/lex-task-text-keyword-inside] [fixture:
    journey/lex-quotes-in-task-text] [fixture: journey/lex-task-text-brace]
    [fixture: journey/lex-task-text-percent-inside] [fixture:
    journey/lex-task-text-nbsp] [fixture: journey/lex-task-text-line-separator]
    [fixture: journey/lex-task-text-tab-inside] [fixture:
    journey/db-task-description-spaces]
12. `:` and the **data text**, one or more characters other than `#`, `;`, and a
    line feed: a `:` unit and the units of the data text (see [Tasks](#tasks)).
    [fixture: journey/db-task-people] [fixture:
    journey/db-task-data-ends-at-hash] [fixture: journey/lex-task-semicolon]
    [fixture: journey/gram-task-data-whitespace-only] [fixture:
    journey/lex-task-data-to-end-of-line] [fixture:
    journey/lex-task-data-leading-tab] [fixture:
    journey/lex-task-data-line-separator] [fixture: journey/header-colon-data]
13. `:`: a `:` unit, which no rule of the grammar takes. [fixture:
    journey/lex-task-colon-at-end] [fixture: journey/lex-task-colon-then-hash]
    [fixture: journey/header-colon] [fixture: journey/lex-section-colon-at-end]
14. `;`: a `;` unit, which no rule of the grammar takes. [fixture:
    journey/lex-semicolon-line] [fixture: journey/lex-task-semicolon] [fixture:
    journey/lex-title-semicolon]

Every character other than a line feed, `#`, `:`, and `;` is a character of a
task text where no earlier rule matches, so a line is rejected only by the
grammar, as a task text without data (`a`, `}`, `title`), a `:` unit, or a `;`
unit. `;` is no character of any unit of the statement context: after a title
text, a section text, a task text, or task data, after the header, after a
description block, and on a line of its own, it is a `;` unit, and the input is
rejected. [fixture: journey/lex-task-text-only] [fixture:
journey/lex-task-brace-line] [fixture: journey/lex-title-at-end] [fixture:
journey/lex-task-colon-at-end] [fixture: journey/lex-semicolon-line] [fixture:
journey/lex-title-semicolon] [fixture: journey/lex-section-semicolon] [fixture:
journey/lex-task-semicolon] [fixture: journey/lex-task-semicolon-then-task]
[fixture: journey/header-semicolon] [fixture: journey/lex-semicolon-after-block]
Some consequences of the order:

- A `%` where a unit starts is a comment unless `{` follows it; inside a text it
  is a character of the text (see [Comments](#comments)). `%{x}: 5` is the task
  `%{x}`, also after whitespace. [fixture: journey/lex-percent-brace-task]
  [fixture: journey/lex-percent-brace-task-indented] [fixture:
  journey/lex-percent-comment-in-title-text]
- The statements are ended by their own units, not by line feeds: a `newline`
  unit is a line of its own to the grammar, and several statements may share a
  line, `journey title T`, `journey A: 5`, `accDescr { d } A: 5`, and
  `accDescr { d }accDescr { e }` among them, while a title text, a section text,
  and task data take the rest of their line up to a `#` or a `;`, so
  `title T A: 5` is the title `T A: 5`, `A: 5 B: 3` is the one task `A` whose
  score part is `5 B` and whose person is `3`, and `section S A: 5` is the
  section `S A` followed by data, which is rejected. [fixture:
  journey/header-statement-same-line] [fixture: journey/header-task-same-line]
  [fixture: journey/gram-acc-descr-block-then-task-same-line] [fixture:
  journey/gram-acc-descr-blocks-same-line] [fixture:
  journey/lex-title-then-task-same-line] [fixture:
  journey/gram-task-then-task-same-line] [fixture:
  journey/lex-section-then-task-same-line] [fixture:
  journey/gram-empty-lines-and-indentation]
- A unit that is whitespace or a `newline` unit ends no statement that is not
  complete: `a` and `: 5` on two lines and `a:` followed by a line feed are
  rejected. [fixture: journey/lex-task-line-feed-before-colon] [fixture:
  journey/lex-task-colon-line-feed-task]

**Keywords and what follows them.** `journey` is a keyword only where no word
character follows: a word character after it makes the whole word a task text
(`journey2` and `journeyX: 1` have no header and are rejected), while `-`, `{`,
`"`, `:`, `#`, `%`, a line feed, or the end of the text after it ends the
keyword: `journey-x: 1` is the header and the task `-x`, `journey{: 1` the
header and the task `{`, `journey"x": 1` the header and the task `"x"`,
`journey#c` and `journey%c` the header and a comment, and `journey:` is
rejected, because the `:` unit is taken by no rule. A letter outside ASCII is no
word character either: `journeyé: 5` is the header and the task `é`. [fixture:
journey/header-digit-suffix] [fixture: journey/header-word-suffix-task]
[fixture: journey/header-dash-suffix-task] [fixture:
journey/header-brace-suffix-task] [fixture: journey/header-quote-suffix-task]
[fixture: journey/header-hash] [fixture: journey/header-percent] [fixture:
journey/header-colon] [fixture: journey/header-non-ascii-letter-task] [fixture:
journey/header-line-feed-only] [fixture: journey/header-only] `title` and
`section` are keywords only with exactly one whitespace character after them,
which may be a line feed, and then at least one character of their text:
`title`, a line feed, and `T` has the title `T`, and so with `section` and `S`;
where the text cannot start, as after a second line feed, after a space and a
line feed, at a `#`, at the end of the text, or, for `section`, at a `:`, the
word is a task text, with data or without: `title\n\nT`, `title`, `title `,
`section`, `section\n\nS`, `title#x`, `section#x`, `title%x`, and `section%x`
are rejected, `title:T` and `section:S` are tasks whose description is the word,
and `titles: 5`, `title2: 5`, `title-x: 5`, `title{: 5`, `title"x": 5`,
`titleé: 5`, `sectionx: 5`, `section2: 5`, `section-x: 5`, `section{: 5`, and
`section"x": 5` are tasks. A title or a section whose text is whitespace only is
read: `title` and two spaces at the end of a line has the title of one space,
and so with `section`. [fixture: journey/lex-title-line-feed-value] [fixture:
journey/lex-section-line-feed-value] [fixture:
journey/lex-title-blank-line-then-text] [fixture:
journey/lex-title-space-line-feed-then-text] [fixture: journey/lex-title-at-end]
[fixture: journey/lex-title-space-at-end] [fixture: journey/lex-section-at-end]
[fixture: journey/lex-section-blank-line-then-text] [fixture:
journey/lex-section-space-line-feed-then-text] [fixture: journey/lex-title-hash]
[fixture: journey/lex-section-hash] [fixture: journey/lex-title-percent]
[fixture: journey/lex-title-quote-task] [fixture: journey/lex-title-colon-task]
[fixture: journey/lex-section-colon-task] [fixture:
journey/lex-title-word-suffix-task] [fixture:
journey/lex-title-digit-suffix-task] [fixture: journey/lex-title-dash-task]
[fixture: journey/lex-title-brace-task] [fixture:
journey/lex-title-non-ascii-letter-task] [fixture:
journey/lex-section-word-suffix-task] [fixture:
journey/lex-section-digit-suffix-task] [fixture: journey/lex-section-dash-task]
[fixture: journey/lex-section-percent] [fixture: journey/lex-section-brace-task]
[fixture: journey/lex-section-quote-task] [fixture:
journey/lex-title-whitespace-only] [fixture:
journey/lex-section-whitespace-only] `accTitle` and `accDescr` are keywords only
with their `:` or `{` after them, after whitespace or not: `accTitlex: T`,
`accTitle2: T`, `accTitle-: T`, `accTitle{: T`, and `accDescrx: T` are tasks
whose description is the word, `accTitle#x`, `accTitle%x`, and `accTitle` or
`accDescr` at the end of the text are task texts without data and rejected, and
`accTitle`, a line feed, and `: T` has the accessibility title `T`. [fixture:
journey/lex-acc-title-word-suffix-task] [fixture:
journey/lex-acc-title-digit-suffix-task] [fixture:
journey/lex-acc-title-dash-task] [fixture: journey/lex-acc-title-brace-task]
[fixture: journey/lex-acc-title-hash] [fixture: journey/lex-acc-title-percent]
[fixture: journey/lex-acc-title-keyword-at-end] [fixture:
journey/lex-acc-descr-keyword-at-end] [fixture:
journey/lex-acc-descr-word-suffix-task] [fixture:
journey/lex-acc-title-line-feed-before-colon] [fixture:
journey/lex-acc-descr-block-line-feed-before-brace]

### Accessibility values

The title context is entered after `accTitle:` and its whitespace (rule 7 of the
statement context), the description context after `accDescr:` and its whitespace
(rule 8), and the description block context after `accDescr {` and its
whitespace (rule 9).

In the title context and in the description context, the one rule is: one or
more characters other than a line feed: an `acc-title-text` unit in the title
context, an `acc-description-text` unit in the description context; leaves the
context. The whitespace after the colon, line feeds included, is read with the
colon, so the text starts at the first character that is not whitespace, on the
line of the colon or on a later line, and runs to the end of that line, `;`,
`#`, `:`, and `%%` included: `accTitle:`, a line feed, and `title X` has the
accessibility title `title X` and no title. The text may not end in these
contexts, so `accTitle:` with nothing but whitespace after it is rejected.
[fixture: journey/db-acc-title] [fixture: journey/gram-acc-title-hash-semicolon]
[fixture: journey/gram-acc-title-two-colons] [fixture:
journey/lex-percent-comment-in-acc-title] [fixture:
journey/gram-acc-title-line-feed-then-text] [fixture:
journey/gram-acc-title-blank-lines-then-text] [fixture:
journey/gram-acc-title-takes-title-line] [fixture:
journey/gram-acc-descr-semicolon-start] [fixture:
journey/gram-acc-descr-line-feed-then-text] [fixture:
journey/lex-acc-title-at-end] [fixture: journey/lex-acc-title-space-at-end]
[fixture: journey/lex-acc-descr-at-end]

In the description block context, the lexer tries these rules in order:

1. `}`: a `}` unit; leaves the context. [fixture: journey/db-acc-descr-block]
2. One or more characters other than `}`, line feeds included: an
   `acc-description-block-text` unit. [fixture: journey/db-acc-descr-block]
   [fixture: journey/gram-acc-descr-block-brace-inside] [fixture:
   journey/gram-acc-descr-block-hash-semicolon]

The whitespace after the `{`, line feeds included, is read with the brace, so a
block text starts at a character that is not whitespace and ends right before
the `}`, the whitespace before the `}` included; a block with only whitespace
between its braces has no text unit (see
[Empty description blocks](#empty-description-blocks)). The text may not end in
the description block context. After the `}`, a second `}` is a task text
without data, so `accDescr {d}}` is rejected. [fixture:
journey/db-acc-descr-block] [fixture: journey/gram-acc-descr-block-empty]
[fixture: journey/gram-acc-descr-block-whitespace-only] [fixture:
journey/lex-acc-descr-block-unclosed] [fixture:
journey/gram-acc-descr-block-double-close]

### Comments

Besides units, the lexer reads **diagram comments**: text that runs to the end
of its line and that mermaid.js reads as nothing. They are not the comment lines
of [common.md](../common.md#comment-lines), which are removed before the lexer
reads the text; a diagram comment can start in the middle of a line, and a line
`%%` alone, `% c`, `%x`, or `%%{ }%%` is a diagram comment, not a comment line.
[fixture: journey/lex-hash-comment-line] [fixture:
journey/lex-bare-percent-line-after-task] [fixture:
journey/lex-percent-comment-line] [fixture: journey/lex-percent-x-line]
[fixture: journey/lex-percent-brace-line-after-task]

A diagram comment starts where a unit starts in the statement context, at a `#`
(rule 4) or at a `%` that no `{` follows (rule 1), and runs to the line feed,
which is not part of it. The **mark** of a diagram comment is `#` when it starts
with `#`, `%%` when it starts with `%%`, and `%` otherwise, and its value is the
text after the mark: the value of `# c` is a space and `c`, that of `%% c` the
same, that of `% c` the same, that of `%%` alone is empty, and that of `%%{ }%%`
is `{ }%%`. `%%{` that starts no directive (see
[Where a directive is](../common.md#where-a-directive-is)) is such a comment
wherever a unit starts, because its first `%` is followed by a `%`: on a line of
its own, right after the header, right after a description block, and after the
header and whitespace on its line, where it takes the rest of the line. The
lexer of mermaid.js for this diagram has no rule for `%%{`, as the lexer of
gantt has
([`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L18-L18)),
so whatever whitespace stands before it, a `%%{ }%%` where a unit starts is a
comment in both: after the header or a description block and two spaces, after a
line feed and two spaces, and after an empty line. The mark is found in the text
without directives, as the lexer reads it, and the value is the source text
after the mark, directives included, as for a comment line: in `journey %`, a
directive, and `% c`, the mark is `%%`. [fixture: journey/lex-hash-comment-line]
[fixture: journey/lex-hash-comment-after-data] [fixture:
journey/lex-percent-comment-line] [fixture:
journey/lex-bare-percent-line-after-task] [fixture:
journey/lex-percent-brace-line-after-task] [fixture:
journey/lex-percent-brace-glued-after-header] [fixture:
journey/lex-percent-brace-glued-after-block] [fixture:
journey/lex-percent-brace-after-header-space] [fixture:
journey/lex-percent-brace-after-header-two-spaces] [fixture:
journey/lex-percent-brace-after-block-two-spaces] [fixture:
journey/lex-percent-brace-after-blank-line] [fixture:
journey/lex-percent-comment-glued-after-header] [fixture:
journey/lex-percent-comment-after-header] [fixture:
journey/lex-percent-comment-glued-after-block] [fixture:
journey/lex-percent-comment-after-block] [fixture:
journey/lex-percent-mark-split-by-directive] [fixture:
journey/lex-directive-in-percent-comment] A `%` followed by `{` where a unit
starts is a character of a task text: `%{x}: 5` is the task `%{x}`, and `%{x}`
alone is rejected. [fixture: journey/lex-percent-brace-task] [fixture:
journey/lex-percent-brace-task-indented] [fixture:
journey/lex-percent-brace-text-only]

Inside the other units, `#` ends the unit and starts a comment where it stands,
since a title text, a section text, a task text, and task data stop before it;
`%` is a character of the text: a title text, a section text, a task text, task
data, an accessibility title, an accessibility description, and a description
block. So `A#B: 5` is the task text `A` without data, followed by a comment, and
is rejected, `a: 5 %% c` has the score part `5 %% c`, which is no number, and
`A %% B: 5` is the task `A %% B`. [fixture: journey/lex-hash-ends-task-text]
[fixture: journey/lex-percent-comment-in-title-text] [fixture:
journey/lex-percent-comment-in-section-text] [fixture:
journey/lex-task-text-percent-inside] [fixture:
journey/lex-percent-comment-in-task-data] [fixture:
journey/lex-percent-comment-in-acc-title] [fixture:
journey/lex-percent-in-acc-descr] [fixture:
journey/lex-percent-in-acc-descr-block]

mermaid.js reads `%` in one more way, which differs from this rule where a
character other than `}` and whitespace stands right before `%%` at a unit
start: it reads that character and the rest of the line as one comment (see
[Known divergences](#known-divergences)). A `%%` that does not stand where a
unit starts is a character of the unit that holds it, as rule 11 and rule 12
say, also right after the first character of the unit: `A%%B: 5` is the task
`A%%B` here and a comment with no task in mermaid.js; `A: 5;%% c`,
`title x;%% c`, `journey;%% c`, `section a:%% c`, `journey:%% c`, and
`accDescr { x }a%% c` are rejected here, because the `;`, the `:` with its data,
or the task text without data is taken by no rule, and accepted by mermaid.js;
`A:%% c` is the task `A` with the score part `%% c` here and rejected by
mermaid.js, whose comment leaves the task text without data. `a%: 5` is the task
`a%` and `}%% c` a task text without data in both, and a `#` before `%%` makes
both read a comment. [fixture: journey/div-comment-after-task-text-start]
[fixture: journey/div-comment-after-indented-task-text-start] [fixture:
journey/div-comment-after-semicolon-after-data] [fixture:
journey/div-comment-after-semicolon-after-title] [fixture:
journey/div-comment-after-semicolon-after-header] [fixture:
journey/div-comment-after-colon-after-section] [fixture:
journey/div-comment-after-colon-after-header] [fixture:
journey/div-comment-after-block-character] [fixture:
journey/div-comment-after-task-colon] [fixture:
journey/lex-single-percent-after-character] [fixture:
journey/lex-brace-before-percent] [fixture: journey/lex-hash-before-percent]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `task-text`, stands for one unit
with that name, and text in double quotes stands for the unit named by that
text, such as `"title"` or `":"`. The grammar is a restatement of the grammar in
[`journey.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison#L44-L67)
and accepts the same sequences of units, except for the empty description block,
for which mermaid.js reads no token (see
[Empty description blocks](#empty-description-blocks)).

Each rule below makes a node of the tree, defined in
[ast/journey.md](../ast/journey.md):

| Rule                                                                                                                                 | Node                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ |
| `diagram`                                                                                                                            | JourneyDiagram                                                                       |
| `task-statement`                                                                                                                     | JourneyTaskStatement                                                                 |
| `title-statement`                                                                                                                    | JourneyTitleStatement                                                                |
| `section-statement`                                                                                                                  | JourneySectionStatement                                                              |
| `accessibility-statement`                                                                                                            | JourneyAccTitleStatement, JourneyAccDescrStatement, or JourneyAccDescrBlockStatement |
| `empty-description-block`                                                                                                            | JourneyAccDescrBlockStatement without text, a statement of its own                   |
| `title-text`, `section-text`, `task-text`, `score`, `person`, `acc-title-text`, `acc-description-text`, `acc-description-block-text` | JourneyLiteral                                                                       |
| `ignored-data`                                                                                                                       | JourneyIgnoredText                                                                   |

### Diagram and statements

```text
diagram   = header line*
header    = "journey"
line      = statement | newline
statement = task-statement
          | title-statement
          | section-statement
          | accessibility-statement
          | empty-description-block
```

The diagram is the header and any number of lines, each a statement or a
`newline` unit. Nothing separates statements: each ends with its own last unit,
and the next may follow on the same line, after whitespace or without it, or on
a later line; a `newline` unit between two statements is a line of its own. A
`newline` unit inside a statement, between its units, is taken by no rule, and
the input is rejected (see [The statement context](#the-statement-context)). The
`:` unit of rule 13 and the `;` unit of rule 14 are taken by no rule, so a colon
with nothing after it on its line and a `;` make the input rejected. [fixture:
journey/header-only] [fixture: journey/header-statement-same-line] [fixture:
journey/gram-empty-lines-and-indentation] [fixture:
journey/lex-task-line-feed-before-colon] [fixture:
journey/lex-task-colon-at-end] [fixture: journey/lex-semicolon-line]

### Tasks

```text
task-statement = task-text ":" score? ( ":" person? ( "," person? )* ignored-data? )?
```

A task is a `task-text` unit, the **description**, and its **data**: a `:` unit
and the units of the data text. The `task-text` and the `:` are adjacent units
of one line; the data text has at least one character, so `a:` with nothing
after it on its line is no task (see
[The statement context](#the-statement-context)). The description is the text of
the `task-text` unit as written, the whitespace before the colon included, which
the Db keeps; the whitespace before it is outside it. [fixture:
journey/db-task-people] [fixture: journey/db-task-description-spaces] [fixture:
journey/lex-task-colon-at-end] [fixture: journey/lex-task-text-only] [fixture:
journey/lex-task-data-only]

The data is divided by its colons, as
[`addTask()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)
divides it; the first colon of the data is the `:` unit after the description:

- The **score part** runs from the first colon to the second colon or the end of
  the data. It is a `score` unit whose text is the part without the whitespace
  at its ends, or no unit when the part is empty or holds only whitespace. A
  part that writes no number, such as `abc` or `5, 6`, is accepted; how
  mermaid.js reads the score as a number is in the summary of the tests package.
  [fixture: journey/db-task-score-only] [fixture: journey/db-task-score-spaces]
  [fixture: journey/lex-task-score-nbsp-trimmed] [fixture:
  journey/db-task-score-empty] [fixture: journey/gram-task-data-whitespace-only]
  [fixture: journey/db-task-score-not-a-number] [fixture:
  journey/gram-task-score-comma]
- The **people part** runs from the second colon, a `:` unit, to the third colon
  or the end of the data. It is divided by its commas into **people**: a `,`
  unit for each `,`, and for each stretch between the colon, the commas, and the
  end of the part, a `person` unit whose text is the stretch without the
  whitespace at its ends, or no unit when the stretch holds only whitespace,
  which is an **empty person**, a null element of the task's people (see
  [JourneyTaskStatement](../ast/journey.md#journeytaskstatement)). There is
  always one person more than there are commas: `A: 3: a,,b` has the people `a`,
  an empty one, and `b`; `A: 3: ` and `A: 5:` one empty person;
  `A: 3: Me, You ,  Them` the people `Me`, `You`, and `Them`. Without a second
  colon, the task has no people. [fixture: journey/db-task-people] [fixture:
  journey/db-task-people-empty-item] [fixture: journey/db-task-people-blank]
  [fixture: journey/gram-task-second-colon-at-end] [fixture:
  journey/gram-task-people-trailing-comma] [fixture:
  journey/gram-task-people-nbsp-trimmed] [fixture: journey/db-task-score-only]
- From the third colon, the rest of the data is an `ignored-data` unit, the
  colon included and the whitespace at its end left out, which mermaid.js does
  not read: `A: 3: a,b: c, d` has the people `a` and `b`, and `: c, d` is not
  read; `A: 5: Me:` has the ignored text `:`, `A: 5: Me: x: y` the ignored text
  `: x: y`, and `A: 5: Me: x` followed by two spaces the ignored text `: x`.
  [fixture: journey/db-task-extra-colon] [fixture:
  journey/gram-task-third-colon-at-end] [fixture: journey/gram-task-four-colons]
  [fixture: journey/gram-task-ignored-data-trailing-spaces]

The data keeps every character up to a `#`, a `;`, or the end of the line, so a
second task on the line, a keyword, or an empty description block after the data
is part of it: `A: 5 B: 3` has the score part `5 B` and the person `3`, and
`A: 5 accDescr {}` the score part `5 accDescr {}`. [fixture:
journey/gram-task-then-task-same-line] [fixture:
journey/gram-empty-description-block-in-task-data] [fixture:
journey/lex-task-data-to-end-of-line]

### Titles and sections

```text
title-statement   = "title" title-text
section-statement = "section" section-text
```

The title of a title statement is the text of its `title-text` unit as written,
whitespace at its ends included, and the name of a section statement the text of
its `section-text` unit as written; a title and a section name may repeat. How
mermaid.js reads the titles, the title of the frontmatter, and the sections into
its Db, and to which section a task belongs, is in the summary of the tests
package. [fixture: journey/db-title-statement] [fixture:
journey/db-title-frontmatter] [fixture:
journey/db-title-statement-after-frontmatter] [fixture: journey/lex-title-twice]
[fixture: journey/lex-title-two-spaces] [fixture:
journey/lex-title-trailing-spaces] [fixture: journey/db-sections] [fixture:
journey/lex-section-two-spaces] [fixture: journey/db-task-before-section]

### Accessibility statements

```text
accessibility-statement = "accTitle" ":" acc-title-text
                        | "accDescr" ":" acc-description-text
                        | "accDescr" "{" acc-description-block-text "}"
```

An accessibility title and an accessibility description are the text of their
unit without the whitespace at its ends, which mermaid.js trims; the text of a
block keeps its line breaks, and the whitespace after each of them is left out
of the Db (see the summary of the tests package). A description may be written
more than once, as a line or as a block. [fixture: journey/db-acc-title]
[fixture: journey/gram-acc-title-trailing-spaces] [fixture:
journey/db-acc-descr] [fixture: journey/db-acc-descr-block] [fixture:
journey/gram-acc-descr-block-brace-inside] [fixture:
journey/gram-acc-descr-colon-then-block-same-line] [fixture:
journey/gram-acc-descr-twice] [fixture: journey/gram-acc-descr-block-then-line]
[fixture: journey/lex-acc-title-twice]

### Empty description blocks

```text
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `acc-description-block-text` unit:
`accDescr {}`, `accDescr { }`, and a block of whitespace or empty lines only.
mermaid.js reads no token for it. It is a description block statement without
text, which changes nothing, wherever a statement starts: on a line of its own,
right after the header, right after another statement on the same line, and
before a statement on the same line; two blocks on one line are two statements.
Inside a title text, a section text, a task text, or task data, `accDescr {}` is
text. A statement starts at every place where a block can be read as one, so no
block lies inside a statement, and the known divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md) has no
case in this diagram type. [fixture: journey/gram-acc-descr-block-empty]
[fixture: journey/gram-acc-descr-block-whitespace-only] [fixture:
journey/gram-empty-description-block-after-header] [fixture:
journey/gram-empty-description-block-after-block] [fixture:
journey/gram-empty-description-block-before-task-same-line] [fixture:
journey/gram-empty-description-blocks-adjacent] [fixture:
journey/gram-empty-description-block-in-title-text] [fixture:
journey/gram-empty-description-block-in-section-text] [fixture:
journey/gram-empty-description-block-in-task-text] [fixture:
journey/gram-empty-description-block-in-task-data] [fixture:
journey/gram-empty-description-block-then-percent-glued]

### Rejections outside the grammar

None. The Db of mermaid.js throws for no input that its grammar accepts:
[`addSection()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L26-L29)
and
[`addTask()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84)
only store their texts, and a score that is no number, a task before the first
section, and a section that repeats are accepted. [fixture:
journey/db-task-score-not-a-number] [fixture: journey/db-task-before-section]
[fixture: journey/db-sections]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a keyword makes the input rejected in this specification,
  while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)): inside the header,
  `title`, `section`, `accTitle`, and `accDescr`. [fixture:
  journey/div-directive-in-header-keyword] [fixture:
  journey/div-directive-in-title-keyword] [fixture:
  journey/div-directive-in-section-keyword] [fixture:
  journey/div-directive-in-acc-title-keyword] [fixture:
  journey/div-directive-in-acc-descr-keyword] [fixture:
  journey/div-directive-in-acc-descr-block-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule, an ignored `;` inside a keyword makes
  the input rejected here, while mermaid.js removes the `;` and reads the parts
  as one. The `style`, the `:`, and the `#` that the rule looks for lie in a
  description block before the statement on its line: after
  `accDescr { style:#x }` on the same line, `ti;tle T`, `sec;tion S`,
  `accTi;tle: T`, and `accDe;scr: d` are read as the statements without the `;`.
  Inside a text unit, and between two units, the reading of mermaid.js is kept
  (see [Trivia between units](#directives-inside-units)). [fixture:
  journey/div-ignored-semicolon-in-title-keyword] [fixture:
  journey/div-ignored-semicolon-in-section-keyword] [fixture:
  journey/div-ignored-semicolon-in-acc-title-keyword] [fixture:
  journey/div-ignored-semicolon-in-acc-descr-keyword] [fixture:
  journey/tokens-ignored-semicolon-in-task-text] [fixture:
  journey/tokens-ignored-semicolon-between-keyword-and-whitespace]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, the task `A b="c">d` has the description
  `A b='c'>d` in mermaid.js, and the title `b="c">d` the title `b='c'>d`, while
  here the frontmatter is not searched for tags and the quotes stay. Both accept
  the input; the Db differs. Without the frontmatter, a tag that starts in the
  text, as in `A <a b="c">d`, is read in the same way by both. [fixture:
  journey/div-html-tag-starts-in-frontmatter-task-text] [fixture:
  journey/div-html-tag-starts-in-frontmatter-title] [fixture:
  journey/lex-html-tag-in-task-text]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: journey/div-frontmatter-invalid-yaml]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.md).**
  A `%%` right after the first character of a unit, a character other than `}`
  and whitespace, is read here as [Comments](#comments) says: a comment starts
  only where a unit starts, so the `%%` is part of the unit, or the character
  before it is a unit that the grammar does not take. mermaid.js reads the
  character and the rest of the line as one comment. The difference goes both
  ways: `A%%B: 5` is a task here and no task in mermaid.js; `A: 5;%% c`,
  `title x;%% c`, `journey;%% c`, `section a:%% c`, `journey:%% c`, and
  `accDescr { x }a%% c` are rejected here and accepted by mermaid.js; `A:%% c`
  is a task here and rejected by mermaid.js. [fixture:
  journey/div-comment-after-task-text-start] [fixture:
  journey/div-comment-after-indented-task-text-start] [fixture:
  journey/div-comment-after-semicolon-after-data] [fixture:
  journey/div-comment-after-semicolon-after-title] [fixture:
  journey/div-comment-after-semicolon-after-header] [fixture:
  journey/div-comment-after-colon-after-section] [fixture:
  journey/div-comment-after-colon-after-header] [fixture:
  journey/div-comment-after-block-character] [fixture:
  journey/div-comment-after-task-colon]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, in a task text, a title, a section, or task data, makes mermaid.js
  hand the text to the C4 parser, which rejects it; here the text is a journey
  diagram. `C4Context` is text in both. [fixture:
  journey/div-c4-keyword-in-task-text] [fixture:
  journey/div-c4-keyword-in-title] [fixture: journey/div-c4-keyword-in-section]
  [fixture: journey/div-c4-keyword-in-task-data] [fixture:
  journey/lex-c4context-in-title]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of `%%` alone, a line `%%{ }%%`, which is no directive, and a line of
  whitespace only after such a line, before the header, are a comment or nothing
  here, while mermaid.js rejects the input, because its lexer reads the line
  feed after the `%%` as a `newline` unit before the header (see
  [Detection](#detection)). [fixture: journey/header-after-bare-percent-line]
  [fixture: journey/header-after-empty-braces-line] [fixture:
  journey/header-after-bare-percent-line-and-whitespace-line]

The known divergences
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md)
and
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.md)
have no case in this diagram type: the comment rules of mermaid.js for it read
no line feed after a comment, and a `%%{` where a unit starts is a comment in
both (see [Comments](#comments)). Neither has
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md) (see
[Empty description blocks](#empty-description-blocks)).
