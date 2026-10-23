# Timeline

Japanese version: [timeline.ja.md](./timeline.ja.md)

Source of truth in mermaid.js:

- [`timeline.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison)
- [`timelineDb.js`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js)
- the tests (`*.spec.js`) in
  [`timeline/`](https://github.com/mermaid-js/mermaid/tree/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline)

This document covers the diagram type `timeline`. The nodes of the tree are
defined in [ast/timeline.md](../ast/timeline.md).

## Detection

Entry 18 of [detection.md](../detection.md) selects this grammar: the text
starts with `timeline`, after whitespace, in exactly this case
([`detector.ts`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/detector.ts#L9-L11)).
`Timeline` and `TIMELINE` match no detector. [fixture: timeline/db-header-only]
[fixture: timeline/header-indented] [fixture: timeline/header-after-blank-lines]
[fixture: timeline/header-capitalized] [fixture: timeline/header-upper-case]

The lexer then reads the header, the keyword `timeline`, case-insensitively and
not followed by a word character (see
[The statement context](#the-statement-context)). So `timelinex` and
`timelineTD` are detected and rejected, as they are periods, while `timeline-x`
is the header followed by the period `-x`, and so is `timelineé` with the period
`é`, since a letter outside ASCII is no word character. A statement may follow
the header on its line, after whitespace or not, and the header alone is
accepted, also without a line feed after it. `timeline:` is rejected, as the
header followed by a `:` unit, which the grammar does not take, `timeline;` is
the header followed by the period `;`, and `timeline#c` and `timeline%c` are the
header and a comment. A second header is taken by no rule. [fixture:
timeline/header-word-suffix] [fixture: timeline/header-glued-direction]
[fixture: timeline/header-dash-suffix] [fixture:
timeline/header-non-ascii-letter-suffix] [fixture:
timeline/header-text-on-header-line] [fixture:
timeline/header-period-with-event-on-header-line] [fixture:
timeline/header-section-on-header-line] [fixture:
timeline/header-title-on-header-line] [fixture:
timeline/header-acc-title-on-header-line] [fixture:
timeline/header-trailing-spaces] [fixture: timeline/header-without-line-feed]
[fixture: timeline/header-colon] [fixture: timeline/header-semicolon] [fixture:
timeline/header-hash-glued] [fixture: timeline/header-percent-glued] [fixture:
timeline/header-hash-comment-on-header-line] [fixture:
timeline/header-percent-comment-on-header-line] [fixture: timeline/header-twice]
[fixture: timeline/header-twice-with-directions] [fixture:
timeline/gram-header-as-later-line]

The header may carry a **direction**: one or more spaces or tabs after
`timeline` and then the keyword `LR` or `TD`, compared case-insensitively and
not followed by a word character. `timeline TD`, `timeline td`, `timeline Lr`,
`timeline` with a tab and `TD`, and `timeline` with two spaces and `TD` have a
direction. Other whitespace does not join the direction to the header: after a
U+00A0, a U+3000, a U+2028, or a line feed, `TD` is a period, and so is `TDx`
after a space. Only one direction is read: in `timeline TD LR` and
`timeline LR TD` the second word is a period, and `LR` on a line of its own is a
period. [fixture: timeline/db-direction-td] [fixture: timeline/db-direction-lr]
[fixture: timeline/db-direction-lower-case] [fixture:
timeline/db-direction-mixed-case] [fixture: timeline/db-direction-tab] [fixture:
timeline/db-direction-two-spaces] [fixture:
timeline/db-direction-trailing-space] [fixture:
timeline/header-direction-no-break-space] [fixture:
timeline/header-direction-ideographic-space] [fixture:
timeline/header-direction-line-separator] [fixture:
timeline/header-direction-line-feed] [fixture:
timeline/header-direction-word-suffix] [fixture:
timeline/header-direction-word-suffix-lr] [fixture:
timeline/header-direction-twice] [fixture: timeline/header-direction-lr-td]
[fixture: timeline/lex-direction-word-as-period] [fixture:
timeline/header-direction-glued-colon]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, before the
header is a bare `%%` line, which detection reads and passes to find the header,
and which is a comment of the diagram here, with the mark `%%`, as in every
diagram type (see [Diagram detection](../common.md#diagram-detection)); the
comment belongs to no node, and the TimelineDiagram starts at the header.
mermaid.js rejects the input in both cases, and also with a line of whitespace
only after the bare line, because its lexer reads the `%%` as a comment but the
line feed after it as a `newline` unit, which its grammar does not take before
the header: the known divergence
[`bare-percent-line-before-header`](#known-divergences). A comment line before
the header is removed before detection, and a directive on a line before the
header or after the header on its line is a directive and nothing else. A line
`# c` before the header is the first text, so no detector matches. [fixture:
timeline/header-after-bare-percent-line] [fixture:
timeline/header-after-empty-braces-line] [fixture:
timeline/header-after-bare-percent-line-and-whitespace-line] [fixture:
timeline/header-after-comment-line] [fixture:
timeline/header-after-directive-line] [fixture:
timeline/header-directive-after-header] [fixture:
timeline/header-space-directive-then-line] [fixture:
timeline/header-after-hash-line]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text, so a
title text, a period, or an event at the end of the text ends there. [fixture:
timeline/lex-title-at-end-of-text] [fixture: timeline/lex-period-at-end-of-text]
[fixture: timeline/lex-event-at-end-of-text] [fixture:
timeline/demo-timeline-eab9c50d] This section describes the diagram's own unit
rules, item 4 of [Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram compares letters case-insensitively
(see [Notation](../common.md#notation)): `TITLE T`, `SECTION S`, `ACCTITLE: T`,
`ACCDESCR: D`, and `ACCDESCR { D }` are read as with the words this document
writes, and `Title`, a line feed, and `  Section` is a title. The texts keep the
case in which they are written. [fixture: timeline/db-title-upper-case]
[fixture: timeline/db-section-upper-case] [fixture:
timeline/db-acc-title-upper-case] [fixture: timeline/lex-acc-descr-upper-case]
[fixture: timeline/lex-acc-descr-block-upper-case] [fixture:
timeline/db-period-title-then-section-lines] A **keyword** below is a word,
matched case-insensitively, that is not followed by a word character (see
[Notation](../common.md#notation)) where the rule says so, and a word followed
by whitespace where it says so (see
[Keywords and what follows them](#the-statement-context)).

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
without `}`, with text after it or without, are rejected. [fixture:
timeline/gram-acc-title-empty] [fixture: timeline/gram-acc-title-only-space]
[fixture: timeline/lex-acc-title-colon-at-end-of-text] [fixture:
timeline/gram-acc-descr-empty] [fixture: timeline/gram-acc-descr-block-unclosed]
[fixture: timeline/lex-acc-descr-block-unclosed-empty]

**Whitespace.** Whitespace in this document is the set of
[Notation](../common.md#notation): U+00A0, U+2028, U+2029, U+3000, U+FEFF, and a
tab are whitespace wherever a rule reads whitespace, and so is a line feed where
a rule says so. In the statement context, a run of one or more line feeds where
a unit starts is a `newline` unit (rule 2), and any other run of whitespace,
line feeds included, lies between units without being part of one (rule 3):
indentation, U+3000 before a period, and U+2028 after the header or before a
period are whitespace. The texts of the statements take whitespace as their own
characters: a period keeps the whitespace before its colon, and U+2028 and
U+2029 inside a period, an event, a title, a section, or an accessibility text
are characters of it. A tab, a U+00A0, or a U+3000 at the end of a period, an
event, a title, or a section text is a character of it, while an accessibility
title, an accessibility description, and the text of a description block are
read without whitespace at their ends, these characters included (see
[Accessibility statements](#accessibility-statements)). Indentation means
nothing: a period indented more than the one before it is another period.
[fixture: timeline/lex-period-trailing-tab] [fixture:
timeline/lex-event-trailing-tab] [fixture: timeline/lex-title-trailing-tab]
[fixture: timeline/lex-section-trailing-tab] [fixture:
timeline/lex-acc-title-trailing-tab] [fixture:
timeline/lex-acc-descr-trailing-tab] [fixture:
timeline/lex-title-trailing-ideographic-space] [fixture:
timeline/lex-section-trailing-no-break-space] [fixture:
timeline/lex-acc-title-trailing-no-break-space] [fixture:
timeline/lex-acc-title-leading-ideographic-space] [fixture:
timeline/lex-acc-descr-trailing-ideographic-space] [fixture:
timeline/lex-acc-descr-block-trailing-ideographic-space] [fixture:
timeline/db-whitespace-only-line] [fixture:
timeline/db-period-leading-whitespace] [fixture: timeline/db-tab-indentation]
[fixture: timeline/lex-ideographic-space-indentation] [fixture:
timeline/db-period-leading-ideographic-space] [fixture:
timeline/lex-line-separator-after-header] [fixture:
timeline/lex-line-separator-before-period] [fixture:
timeline/lex-line-separator-before-event-colon] [fixture:
timeline/lex-no-break-space-around-period-and-event] [fixture:
timeline/lex-ideographic-space-at-end-of-period] [fixture:
timeline/lex-period-line-separator-inside] [fixture:
timeline/lex-period-paragraph-separator-inside] [fixture:
timeline/lex-event-line-separator-inside] [fixture:
timeline/lex-event-paragraph-separator-inside] [fixture:
timeline/lex-title-line-separator-inside] [fixture:
timeline/lex-section-line-separator-inside] [fixture:
timeline/lex-acc-title-line-separator-inside] [fixture:
timeline/lex-acc-descr-line-separator-inside] [fixture:
timeline/lex-acc-descr-block-line-separator-inside] [fixture:
timeline/db-indentation-does-not-nest]

**Entities.** An entity is read as its placeholder before the lexer reads the
text (see [Entities](../common.md#entities)), and the placeholder is made of
characters outside ASCII, so its `#` and `;` do not end a period and do not
start a comment, and the text keeps the entity as written: `a #35; b : c #35; d`
has the period `a #35; b ` and the event `c #35; d`; the named and the
hexadecimal forms are read the same way; `a : #35;` has the event `#35;`; a
title, a section, an accessibility title, an accessibility description, and a
description block may hold one. A `#` that starts no entity starts a comment
where it ends a period: `a #bogus b` is the period `a ` and a comment. [fixture:
timeline/db-event-entity] [fixture: timeline/db-event-entity-named] [fixture:
timeline/db-event-entity-hex] [fixture: timeline/db-event-entity-is-no-comment]
[fixture: timeline/db-title-entity] [fixture: timeline/db-section-entity]
[fixture: timeline/db-acc-title-entity] [fixture: timeline/db-acc-descr-entity]
[fixture: timeline/db-acc-descr-block-entity] [fixture:
timeline/db-period-unclosed-reference] The attribute quotes of an HTML tag are
read as `'` as in every diagram type (see
[HTML attribute quotes](../common.md#html-attribute-quotes)): `title`
`<b a="x">t</b>` has the title with `a='x'`, and the period `A <a b="c">d` has
`b='c'`, while quotes outside a tag stay quotes, as in the event `"b"`.
[fixture: timeline/lex-html-tag-in-title] [fixture:
timeline/lex-html-tag-in-period] [fixture:
timeline/db-event-quotes-and-brackets]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit keeps the reading of
mermaid.js, while a directive inside any other unit makes the input rejected.
This diagram type has no string units. The **text units** are a `period-text`,
an `event-text`, a `title-text`, a `section-text`, an `acc-title-text`, an
`acc-description-text`, and an `acc-description-block-text`. The other units,
the header, the direction, `title`, `section`, `accTitle`, `accDescr`, `:`, `{`,
and `}`, are no text units.

- `a%%{init: {}}%%b` is the period `ab`, `a : e%%{init: {}}%%f` has the event
  `ef`, `title a %%{init: {}}%% b` the title `a`, two spaces, and `b`,
  `section a %%{init: {}}%% b` the section of the same text,
  `accTitle: a %%{init: {}}%% b` the accessibility title of the same text,
  `accDescr: a%%{init: {}}%%b` the description `ab`, and a description block the
  text of the same kind, as in mermaid.js; in `a : e %%{init: {}}%% : f` the
  event is `e` and two spaces. [fixture: timeline/db-period-directive-glued]
  [fixture: timeline/lex-directive-in-event] [fixture:
  timeline/db-title-directive] [fixture: timeline/db-section-directive]
  [fixture: timeline/db-acc-title-directive] [fixture:
  timeline/lex-directive-in-acc-descr] [fixture:
  timeline/db-acc-descr-block-directive] [fixture: timeline/db-event-directive]
- A directive between two units is allowed: between the header and its
  direction, `timeline %%{init: {}}%% TD`; between a colon and the whitespace
  character after it, `a:%%{init: {}}%% e`, which has the event `e`; between
  `title` and its whitespace character and between that character and the text,
  `title%%{init: {}}%% T` and `title %%{init: {}}%%T`; and before the colon of
  an event, `a %%{init: {}}%% : e`, whose period is `a` and two spaces. Without
  the directive, the units must still be read: in `a :%%{init: {}}%%e` no
  whitespace follows the colon, and the input is rejected by both. [fixture:
  timeline/header-directive-before-direction] [fixture:
  timeline/lex-directive-between-colon-and-space] [fixture:
  timeline/lex-directive-between-title-and-whitespace] [fixture:
  timeline/lex-directive-between-title-whitespace-and-text] [fixture:
  timeline/db-period-directive-before-colon] [fixture:
  timeline/lex-directive-between-colon-and-event-text]
- In `time%%{init: {}}%%line`, `timeline T%%{init: {}}%%D`,
  `ti%%{init: {}}%%tle T`, `sec%%{init: {}}%%tion S`,
  `acc%%{init: {}}%%Title: T`, `acc%%{init: {}}%%Descr: T`, and
  `acc%%{init: {}}%%Descr { T }`, the directive lies inside a keyword or the
  direction: the input is rejected, while mermaid.js accepts it, reading the two
  parts as one (see [Known divergences](#known-divergences)). [fixture:
  timeline/div-directive-in-header-keyword] [fixture:
  timeline/div-directive-in-direction] [fixture:
  timeline/div-directive-in-title-keyword] [fixture:
  timeline/div-directive-in-section-keyword] [fixture:
  timeline/div-directive-in-acc-title-keyword] [fixture:
  timeline/div-directive-in-acc-descr-keyword] [fixture:
  timeline/div-directive-in-acc-descr-block-keyword]

**Trivia between units.** The trivia of [common.md](../common.md) meet the units
of this diagram as follows. A lone CR and CRLF are line terminators, read as a
line feed (see [Line terminators](../common.md#line-terminators)), also as the
whitespace character after `title`. [fixture: timeline/db-lone-cr-line-ends]
[fixture: timeline/db-crlf-line-ends] [fixture:
timeline/lex-title-separator-carriage-return] A closed directive at the end of a
line ends nothing, and the whitespace before it is a character of the text
before it where the text keeps whitespace: `a %%{init: {}}%%` has the period
`a `, and `title T %%{init: {}}%%` the title `T `, while
`accTitle: T  %%{init: {}}%%` has the accessibility title `T`, which is read
without the whitespace at its ends. An unclosed directive takes the rest of the
text (see [Where a directive is](../common.md#where-a-directive-is)): `a`, a
space, and `%%{init: {}` followed by a line `b` has the one period `a `.
[fixture: timeline/lex-directive-at-end-of-period-line] [fixture:
timeline/lex-directive-at-end-of-title-line] [fixture:
timeline/lex-directive-after-acc-title-text] [fixture:
timeline/tokens-unclosed-directive-in-period-line]

A comment line is removed with its line feed before the lexer reads the text,
also between a keyword and its text and between a colon and the line of its
event, while a directive on a line of its own leaves the line, with the
whitespace before the directive, in the text. So `title`, a comment line, and
`  T` has the title of two spaces and `T`, and so with two comment lines;
`section`, a comment line, and `  S` the section `  S`; `a :`, a comment line,
and `  e` the event `  e`, and so with a line `:` alone in place of `a :`;
`accTitle:` and `accDescr:`, a comment line, and a text the value of that text;
and a block that holds a comment line and `d` the description `d`. With a
directive line in place of the comment line, its whitespace is the text: `title`
and an indented directive line has the title of two spaces and is followed by
the period `T`, and so with `section`; `a :` and an indented directive line has
the event of two spaces; with the directive at the start of its line, the line
is empty, so `title` and `section` are periods, and the event cannot start and
the input is rejected; after `accTitle:` and `accDescr:`, the whitespace of the
line is read with the colon. A line `# c` after `title` is the title `  # c`,
since a title text holds `#`. [fixture: timeline/db-comment-percent-line]
[fixture: timeline/lex-title-line-feed-comment-line] [fixture:
timeline/lex-title-line-feed-two-comment-lines] [fixture:
timeline/lex-section-line-feed-comment-line] [fixture:
timeline/lex-event-line-feed-comment-line] [fixture:
timeline/lex-event-own-line-colon-comment-line] [fixture:
timeline/lex-acc-title-value-after-comment-line] [fixture:
timeline/lex-acc-descr-value-after-comment-line] [fixture:
timeline/db-acc-descr-block-percent-line] [fixture:
timeline/lex-title-line-feed-directive-line] [fixture:
timeline/lex-section-line-feed-directive-line] [fixture:
timeline/lex-event-line-feed-directive-line] [fixture:
timeline/lex-title-line-feed-directive-line-unindented] [fixture:
timeline/lex-section-line-feed-directive-line-unindented] [fixture:
timeline/lex-event-line-feed-directive-line-unindented] [fixture:
timeline/lex-event-own-line-colon-directive-line-unindented] [fixture:
timeline/lex-acc-title-value-after-directive-line] [fixture:
timeline/lex-acc-descr-value-after-directive-line] [fixture:
timeline/lex-title-line-feed-hash-line]

On a line that matches the `style` rule or the `classDef` rule (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)), the last
`;` is ignored and read through. In a text unit, the two parts are read as one,
as in mermaid.js: `title style:#x;y` has the title `style:#xy`, and so with
`classDef` in place of `style`; `accTitle: style:#x;y`, `accDescr: style:#x;y`,
and a block line `style:#x;y` have the text `style:#xy`; `2020 : style:#x;y` has
the event `style:#xy`, also as the second event of its line; and after
`accDescr { style:#x }` on the same line, `a;b` is the period `ab`. The rule
needs `style` in lower case and a `#` after the `:`: `title Style:#x;y`,
`title style:x;y`, and `title style#:x;y` keep their `;`, and in the first,
`#x;` is an entity. With two, only the last is ignored, and `#x;` before it is
an entity, as in `title style:#x;y;z`, while in `title style:#35;` the only `;`
is ignored before entities are read, and `#35` stays text. A period or a section
text stops at the `:` of `style:`, so `style:#x;y` and `section style:#x;y` are
rejected by both, as the rest is a `:` unit. Inside a keyword, the ignored `;`
makes the input rejected, while mermaid.js accepts it (see
[Known divergences](#known-divergences)): after `accDescr { style:#x }` on the
same line, `ti;tle T`, `sec;tion S`, and `accTi;tle: T`. [fixture:
timeline/lex-title-semicolon-in-style-line] [fixture:
timeline/lex-title-semicolon-in-classdef-line] [fixture:
timeline/lex-acc-title-semicolon-in-style-line] [fixture:
timeline/lex-acc-descr-semicolon-in-style-line] [fixture:
timeline/lex-acc-descr-block-semicolon-in-style-line] [fixture:
timeline/lex-event-semicolon-in-style-line] [fixture:
timeline/lex-event-semicolon-in-style-line-second-event] [fixture:
timeline/tokens-ignored-semicolon-in-period] [fixture:
timeline/lex-title-semicolon-style-upper-case] [fixture:
timeline/lex-title-semicolon-without-hash] [fixture:
timeline/lex-title-semicolon-hash-before-colon] [fixture:
timeline/lex-title-semicolon-after-text-before-style] [fixture:
timeline/lex-title-semicolon-in-style-line-last-only] [fixture:
timeline/lex-title-semicolon-in-style-line-entity] [fixture:
timeline/gram-period-style-line] [fixture: timeline/gram-section-style-line]
[fixture: timeline/div-ignored-semicolon-in-title-keyword] [fixture:
timeline/div-ignored-semicolon-in-section-keyword] [fixture:
timeline/div-ignored-semicolon-in-acc-title-keyword]

### The statement context

In the statement context, the lexer tries these rules in order:

1. `%`, not followed by `{`: a diagram comment, from the `%` to the end of the
   line (see [Comments](#comments)): `% c`, `%c`, and `%` alone are comments,
   also between a period and its event line and after the header. [fixture:
   timeline/db-comment-percent-line] [fixture:
   timeline/db-comment-single-percent-line] [fixture:
   timeline/db-comment-single-percent-glued] [fixture:
   timeline/db-comment-single-percent-only] [fixture:
   timeline/db-comment-single-percent-between-task-and-event] [fixture:
   timeline/header-single-percent-comment-on-header-line] [fixture:
   timeline/lex-percent-x-line] [fixture: timeline/lex-percent-brace-period]
2. One or more line feeds: a `newline` unit. [fixture:
   timeline/db-blank-line-between-tasks]
3. One or more whitespace characters, line feeds included: nothing. [fixture:
   timeline/db-whitespace-only-line]
4. `#`: a diagram comment, from the `#` to the end of the line (see
   [Comments](#comments)). [fixture: timeline/db-comment-hash-line]
5. The keyword `timeline`, one or more spaces or tabs, and the keyword `LR`: a
   `header` unit and a `direction` unit. [fixture: timeline/db-direction-lr]
6. The keyword `timeline`, one or more spaces or tabs, and the keyword `TD`: a
   `header` unit and a `direction` unit. [fixture: timeline/db-direction-td]
7. The keyword `timeline`: a `header` unit. [fixture: timeline/db-header-only]
8. `title`, one whitespace character, line feed included, and one or more
   characters other than a line feed: a `title` unit and a `title-text` unit,
   whose text is the characters after the one whitespace character. [fixture:
   timeline/db-title-statement] [fixture: timeline/db-title-two-spaces]
   [fixture: timeline/lex-title-separator-line-feed]
9. `accTitle`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accTitle` unit
   and a `:` unit; enters the title context. [fixture:
   timeline/db-acc-title-statement] [fixture: timeline/db-acc-title-glued]
   [fixture: timeline/db-acc-title-space-before-colon] [fixture:
   timeline/lex-acc-title-colon-on-next-line]
10. `accDescr`, zero or more whitespace characters, line feeds included, `:`,
    and zero or more whitespace characters, line feeds included: an `accDescr`
    unit and a `:` unit; enters the description context. [fixture:
    timeline/db-acc-descr-statement] [fixture: timeline/db-acc-descr-glued]
11. `accDescr`, zero or more whitespace characters, line feeds included, `{`,
    and zero or more whitespace characters, line feeds included: an `accDescr`
    unit and a `{` unit; enters the description block context. [fixture:
    timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-glued]
    [fixture: timeline/db-acc-descr-block-spaces]
12. `section`, one whitespace character, line feed included, and one or more
    characters other than `:` and a line feed: a `section` unit and a
    `section-text` unit, whose text is the characters after the one whitespace
    character. [fixture: timeline/db-section-statement] [fixture:
    timeline/db-section-two-spaces] [fixture:
    timeline/lex-section-separator-line-feed]
13. `:`, one whitespace character, line feed included, and the **event text**:
    one or more characters, each a character other than `:` and a line feed or a
    `:` that no whitespace follows: a `:` unit and an `event-text` unit.
    [fixture: timeline/db-period-and-event] [fixture:
    timeline/db-event-colon-glued-inside] [fixture:
    timeline/db-event-line-feed-after-colon]
14. One or more characters other than `#`, `:`, and a line feed: a `period-text`
    unit. [fixture: timeline/db-period-only] [fixture:
    timeline/db-period-with-spaces] [fixture:
    timeline/db-period-trailing-spaces]
15. `:`: a `:` unit, which no rule of the grammar takes. [fixture:
    timeline/gram-event-colon-glued-to-event] [fixture:
    timeline/gram-event-empty-after-colon] [fixture: timeline/header-colon]

Every character other than a line feed, `#`, and `:` is a character of a period
where no earlier rule matches, so a line is rejected by the lexer only at a `:`
that no event follows. A `:` that no whitespace follows, a `:` with only
whitespace after it on its line, and a `:` at the end of an event text with
nothing after it are such units: `a:e`, `a :e`, `:e`, `a :`, `a : `, `a : e1 :`,
`a : b:`, and `a : :` are rejected, while `;` is a character of every text: on a
line of its own, it is the period `;`, and so it is right after a description
block, as in `accDescr { d };`; `a;` is the period `a;`, `section s;` the
section `s;`, and `accDescr: d;` the description `d;`. [fixture:
timeline/gram-event-colon-glued-to-event] [fixture:
timeline/gram-event-colon-space-glued] [fixture:
timeline/gram-event-colon-glued-first] [fixture:
timeline/gram-event-empty-after-colon] [fixture:
timeline/gram-event-empty-after-colon-space] [fixture:
timeline/gram-event-trailing-colon] [fixture:
timeline/gram-event-trailing-colon-space] [fixture:
timeline/gram-event-colon-at-end-glued] [fixture:
timeline/gram-event-colon-then-colon] [fixture:
timeline/lex-semicolon-line-is-period] [fixture:
timeline/gram-semicolon-after-block] [fixture:
timeline/db-period-trailing-semicolon] [fixture:
timeline/db-section-trailing-semicolon] [fixture:
timeline/db-acc-descr-semicolon] Some consequences of the order:

- A `%` where a unit starts is a comment unless `{` follows it; inside a text it
  is a character of the text (see [Comments](#comments)). `%{x}` is the period
  `%{x}`. [fixture: timeline/lex-percent-brace-period] [fixture:
  timeline/db-comment-percent-after-period]
- The statements are ended by their own units, not by line feeds: a `newline`
  unit is a line of its own to the grammar, and several statements may share a
  line, `timeline TD title T`, `timeline a : b`, `accDescr { D } a : e`, and
  `accDescr {}accDescr {} a` among them, while a title text takes the rest of
  its line, a section text the rest up to a `:`, a period the rest up to a `#`
  or a `:`, and an event text the rest up to a `:` that whitespace follows. So
  `title T : e` is the title `T : e`, `section S : x` is the section `S ` and an
  event, and `a : b -- c : d --> e` is the period `a ` with the events `b -- c `
  and `d --> e`. [fixture: timeline/header-title-on-header-line] [fixture:
  timeline/header-period-with-event-on-header-line] [fixture:
  timeline/gram-acc-descr-block-then-period-same-line] [fixture:
  timeline/gram-empty-description-blocks-then-period] [fixture:
  timeline/gram-title-takes-event-text] [fixture:
  timeline/db-section-with-event-after-task] [fixture: timeline/db-event-arrows]
- A period keeps the whitespace before its colon, `#`, or line feed: `a : e` has
  the period `a `, and `a: e` the period `a`. An event text keeps the whitespace
  after the one whitespace character and the whitespace at its end: `a :   e`
  has the event `  e`, `a : e   ` the event `e   `, and `a :` with two spaces
  the event of one space. [fixture: timeline/db-period-and-event] [fixture:
  timeline/db-period-colon-glued-to-period] [fixture:
  timeline/db-event-leading-spaces] [fixture: timeline/db-event-trailing-spaces]
  [fixture: timeline/db-event-two-spaces]
- In an event text, a `:` that a character other than whitespace follows is a
  character: `a : b:c` has the event `b:c`, `a : x::y` the event `x::y`, and
  `a : e1 :e2` the event `e1 :e2`, while `: ` starts the next event:
  `a : e1: e2` has the events `e1` and `e2`, and `a : x: :y` the events `x` and
  `:y`. [fixture: timeline/db-event-colon-glued-inside] [fixture:
  timeline/db-event-double-colon-inside] [fixture:
  timeline/db-event-colon-space-before-glued-after] [fixture:
  timeline/db-event-colon-glued-before] [fixture:
  timeline/db-event-colon-space-then-glued-colon]
- The one whitespace character after `title`, `section`, or the colon of an
  event may be a line feed, so the text starts on the next line: `a :`, a line
  feed, and `e` has the event `e`, and `a :`, a line feed, and `  e` the event
  `  e`; `a : e1 :` and a line `  e2` the events `e1 ` and `  e2`. A text may be
  whitespace only: `a :`, a line feed, a line of three spaces, and `e` has the
  event of three spaces and the period `e`, while after a line feed and an empty
  line the event cannot start, and the input is rejected. [fixture:
  timeline/db-event-line-feed-after-colon] [fixture:
  timeline/db-event-line-feed-after-colon-indented] [fixture:
  timeline/db-event-line-feed-after-second-colon] [fixture:
  timeline/db-event-line-feed-then-whitespace-line] [fixture:
  timeline/gram-event-line-feed-then-empty-line]
- A `#` ends a period and starts a comment, so `a #c : e` has the period `a `
  and no event, while a `#` inside a title text, a section text, an event text,
  or an accessibility text is a character: `title T # c`, `section S # c`,
  `a : e # c`, `a : #`, and `title #my#title#` keep it. [fixture:
  timeline/db-comment-hash-after-period] [fixture:
  timeline/db-comment-hash-after-period-hides-event] [fixture:
  timeline/db-title-hash] [fixture: timeline/db-section-hash] [fixture:
  timeline/db-event-hash] [fixture: timeline/db-event-only-hash] [fixture:
  timeline/spec-timeline-51f39885]

**Keywords and what follows them.** `timeline` is a keyword only where no word
character follows (see [Detection](#detection)). `title` and `section` are
keywords only with exactly one whitespace character after them, which may be a
line feed or another whitespace character such as a tab, U+00A0, U+3000, U+2028,
U+2029, or U+FEFF, and then at least one character of their text; a section text
may not start with `:`. Where the text cannot start, as after a second line
feed, after a space and a line feed, or at the end of the text, the word is a
period: `title` and `section` alone, `title` and `section` followed by a space,
`title` and `section` followed by a line feed and an empty line, and `titlex`
and `sectionx` are periods, and `title:T` and `section:S` are the period `title`
or `section` followed by a `:` unit and rejected. A title or a section whose
text is whitespace only is read: `title` and two spaces at the end of a line has
the title of one space, and so with `section`. [fixture:
timeline/lex-title-separator-tab] [fixture:
timeline/lex-title-separator-no-break-space] [fixture:
timeline/lex-title-separator-ideographic-space] [fixture:
timeline/lex-title-separator-line-separator] [fixture:
timeline/lex-title-separator-paragraph-separator] [fixture:
timeline/lex-title-separator-byte-order-mark] [fixture:
timeline/lex-title-separator-line-feed] [fixture:
timeline/lex-section-separator-tab] [fixture:
timeline/lex-section-separator-ideographic-space] [fixture:
timeline/lex-section-separator-line-separator] [fixture:
timeline/lex-section-separator-line-feed] [fixture:
timeline/gram-title-keyword-alone] [fixture:
timeline/gram-section-keyword-alone] [fixture:
timeline/gram-title-keyword-trailing-space] [fixture:
timeline/gram-section-keyword-trailing-space] [fixture:
timeline/lex-title-line-feed-empty-line] [fixture:
timeline/lex-section-line-feed-empty-line] [fixture:
timeline/gram-title-word-suffix] [fixture: timeline/gram-section-word-suffix]
[fixture: timeline/gram-title-colon-glued] [fixture:
timeline/gram-section-colon-glued] [fixture: timeline/db-title-only-space]
[fixture: timeline/db-section-only-space] `accTitle` and `accDescr` are keywords
only with their `:` or `{` after them, after whitespace or not: `accTitle` and
`accDescr` on lines of their own are periods, and `accTitle`, a line feed, and
`: T` has the accessibility title `T`. [fixture:
timeline/db-period-acc-keywords-alone] [fixture:
timeline/lex-acc-title-colon-on-next-line]

### Accessibility values

The title context is entered after `accTitle:` and its whitespace (rule 9 of the
statement context), the description context after `accDescr:` and its whitespace
(rule 10), and the description block context after `accDescr {` and its
whitespace (rule 11).

In the title context and in the description context, the one rule is: one or
more characters other than a line feed: an `acc-title-text` unit in the title
context, an `acc-description-text` unit in the description context; leaves the
context. The whitespace after the colon, line feeds included, is read with the
colon, so the text starts at the first character that is not whitespace, on the
line of the colon or on a later line, and runs to the end of that line, `:`,
`#`, `;`, and `%%` included: `accTitle: T : e` has the accessibility title
`T : e`, and `accTitle:` and a line `T` the accessibility title `T`. The text
may not end in these contexts, so `accTitle:` with nothing but whitespace after
it is rejected. [fixture: timeline/db-acc-title-statement] [fixture:
timeline/db-acc-title-many-spaces] [fixture: timeline/db-acc-title-colon]
[fixture: timeline/gram-acc-title-takes-event-text] [fixture:
timeline/db-acc-title-hash] [fixture: timeline/db-acc-title-semicolon] [fixture:
timeline/db-acc-title-percent] [fixture:
timeline/lex-acc-title-value-on-next-line] [fixture:
timeline/lex-acc-title-separator-no-break-space] [fixture:
timeline/db-acc-descr-hash] [fixture: timeline/gram-acc-title-empty]

In the description block context, the lexer tries these rules in order:

1. `}`: a `}` unit; leaves the context. [fixture: timeline/db-acc-descr-block]
2. One or more characters other than `}`, line feeds included: an
   `acc-description-block-text` unit. [fixture: timeline/db-acc-descr-block]
   [fixture: timeline/db-acc-descr-block-hash-and-percent]

The whitespace after the `{`, line feeds included, is read with the brace, so a
block text starts at a character that is not whitespace and ends right before
the `}`, the whitespace before the `}` included; a block with only whitespace
between its braces has no text unit (see
[Empty description blocks](#empty-description-blocks)). The text may not end in
the description block context. After the `}`, the statement context goes on, so
`}a` after a block is the period `a`, and in a block `a } b` followed by a line
`}`, the block ends at the first `}`, and `b` and `}` are periods. [fixture:
timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-braces-only]
[fixture: timeline/db-acc-descr-block-empty] [fixture:
timeline/gram-acc-descr-block-unclosed] [fixture:
timeline/db-acc-descr-block-then-text] [fixture:
timeline/db-acc-descr-block-brace-inside]

### Comments

Besides units, the lexer reads **diagram comments**: text that runs to the end
of its line and that mermaid.js reads as nothing. They are not the comment lines
of [common.md](../common.md#comment-lines), which are removed before the lexer
reads the text; a diagram comment can start in the middle of a line, and a line
`%%` alone, `%x`, `# c`, or `%%{ }%%` is a diagram comment, not a comment line.
[fixture: timeline/db-comment-hash-line] [fixture:
timeline/db-comment-percent-only] [fixture: timeline/lex-percent-x-line]
[fixture: timeline/lex-percent-brace-line-after-period]

A diagram comment starts where a unit starts in the statement context, at a `#`
(rule 4) or at a `%` that no `{` follows (rule 1), and runs to the line feed,
which is not part of it. The **mark** of a diagram comment is `#` when it starts
with `#`, `%%` when it starts with `%%`, and `%` otherwise, and its value is the
text after the mark. `%%{` that starts no directive (see
[Where a directive is](../common.md#where-a-directive-is)) is such a comment
wherever a unit starts, because its first `%` is followed by a `%`: on a line of
its own, indented or not, and right after a description block. The mark is found
in the text without directives, as the lexer reads it, and the value is the
source text after the mark, directives included, as for a comment line.
[fixture: timeline/db-comment-hash-line] [fixture:
timeline/db-comment-hash-only] [fixture: timeline/db-comment-hash-line-indented]
[fixture: timeline/db-comment-hash-between-header-and-first-line] [fixture:
timeline/db-comment-hash-line-at-end] [fixture:
timeline/db-comment-percent-after-header] [fixture:
timeline/lex-percent-brace-line-after-period] [fixture:
timeline/lex-percent-brace-line-unindented] [fixture:
timeline/lex-percent-brace-after-block] [fixture:
timeline/lex-percent-comment-after-block] [fixture:
timeline/lex-hash-before-percent]

Inside the units, `#` ends a period and starts a comment where it stands, since
a period stops before it, and is a character of every other text; `%` is a
character of every text: `50% off` is a period, `a : % c` has the event `% c`,
`title % c` the title `% c`, and so do a section, an accessibility title, an
accessibility description, and a line of a description block that hold `% c`;
and `a %% c`, `a %%c`, and `ab%% c` are periods, `a : e %% c`, `a : e%% c`,
`a: e%% c`, and `a : %%` have events with the `%%`, and a title, a section, an
accessibility title, and an accessibility description hold `%%` as characters,
as in `accDescr: d %% c`. [fixture: timeline/db-comment-percent-after-period]
[fixture: timeline/db-comment-percent-after-period-glued-no-space] [fixture:
timeline/db-comment-percent-glued-after-two-characters] [fixture:
timeline/db-event-percent] [fixture: timeline/db-comment-percent-glued-in-event]
[fixture: timeline/db-event-percent-glued] [fixture:
timeline/db-event-only-percent] [fixture: timeline/db-title-percent] [fixture:
timeline/db-section-percent] [fixture: timeline/db-acc-title-percent] [fixture:
timeline/db-period-percent-inside] [fixture: timeline/db-event-single-percent]
[fixture: timeline/db-title-single-percent] [fixture:
timeline/db-acc-descr-percent] [fixture: timeline/db-section-single-percent]
[fixture: timeline/db-acc-title-single-percent] [fixture:
timeline/db-acc-descr-single-percent] [fixture:
timeline/db-acc-descr-block-single-percent]

mermaid.js reads `%` in one more way, which differs from this rule where a
character other than `}` and whitespace stands right before `%%` where a unit
starts: it reads that character and the rest of the line as one comment (see
[Known divergences](#known-divergences)). Here the `%%` is part of the unit that
starts at that character, or that character is a unit that the grammar does not
take: `a%% c` is the period `a%% c` here and nothing in mermaid.js, and so are
`;%% c`, `é%% c`, `;%% c` right after the header, and `x%%{ }%%` right after a
description block; `:%% c` is rejected here, as no whitespace follows the colon,
and a comment in mermaid.js. `}%% c` is a period in both, and a `#` before `%%`
makes both read a comment. [fixture:
timeline/db-comment-percent-after-period-glued] [fixture:
timeline/div-comment-after-period-start] [fixture:
timeline/div-comment-after-semicolon] [fixture:
timeline/div-comment-after-non-ascii-letter] [fixture:
timeline/div-comment-after-semicolon-after-header] [fixture:
timeline/div-comment-after-block-character] [fixture:
timeline/div-comment-after-colon] [fixture:
timeline/db-comment-percent-after-closing-brace] [fixture:
timeline/lex-hash-before-percent]

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `period-text`, stands for one unit
with that name, and text in double quotes stands for the unit named by that
text, such as `"title"` or `":"`. The grammar is a restatement of the grammar in
[`timeline.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L49-L85)
and accepts the same sequences of units, except for the empty description block,
for which mermaid.js reads no token (see
[Empty description blocks](#empty-description-blocks)). It groups the events
into the statements of the tree, which the grammar of mermaid.js reads one by
one.

Each rule below makes a node of the tree, defined in
[ast/timeline.md](../ast/timeline.md):

| Rule                                                                                                                              | Node                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `diagram`                                                                                                                         | TimelineDiagram                                                                         |
| `period-statement`                                                                                                                | TimelinePeriodStatement                                                                 |
| `event-statement`                                                                                                                 | TimelineEventStatement                                                                  |
| `title-statement`                                                                                                                 | TimelineTitleStatement                                                                  |
| `section-statement`                                                                                                               | TimelineSectionStatement                                                                |
| `accessibility-statement`                                                                                                         | TimelineAccTitleStatement, TimelineAccDescrStatement, or TimelineAccDescrBlockStatement |
| `empty-description-block`                                                                                                         | TimelineAccDescrBlockStatement without text, a statement of its own                     |
| `period-text`, `event-text`, `title-text`, `section-text`, `acc-title-text`, `acc-description-text`, `acc-description-block-text` | TimelineLiteral                                                                         |

### Diagram and statements

```text
diagram   = header line*
header    = "timeline" direction?
line      = statement | newline
statement = period-statement
          | event-statement
          | title-statement
          | section-statement
          | accessibility-statement
          | empty-description-block
```

The diagram is the header, with its direction or without, and any number of
lines, each a statement or a `newline` unit. Nothing separates statements: each
ends with its own last unit, and the next may follow on the same line, after
whitespace or without it, or on a later line. The `:` unit of rule 15 is taken
by no rule, so a colon that no event text follows makes the input rejected.
[fixture: timeline/db-header-only] [fixture: timeline/db-direction-td] [fixture:
timeline/header-title-on-header-line] [fixture:
timeline/gram-acc-descr-block-then-period-same-line] [fixture:
timeline/db-blank-line-between-tasks] [fixture:
timeline/gram-event-colon-glued-to-event]

### Periods and events

```text
period-statement = period-text ( newline* event )*
event-statement  = event ( newline* event )*
event            = ":" event-text
```

A period statement is a `period-text` unit and the events that follow it, each a
`:` unit and an `event-text` unit, with nothing between them but `newline`
units, which may stand for empty lines, lines of whitespace, comment lines, and
diagram comments. It takes every event that follows it so: `a : e1 : e2` has two
events, and so has `a` followed by the lines `: e1` and `: e2`, also with an
empty line, a comment line, a line `# c`, or a bare `%%` line between them. A
period is the text of its unit as written, the whitespace before the colon, `#`,
or line feed included, which the Db keeps; the whitespace before it is outside
it. [fixture: timeline/db-event-two-on-a-line] [fixture:
timeline/db-event-own-line] [fixture: timeline/gram-event-line-two-events]
[fixture: timeline/db-event-own-line-after-blank-line] [fixture:
timeline/db-event-own-line-after-comment-line] [fixture:
timeline/db-event-own-line-after-hash-line] [fixture:
timeline/gram-event-after-bare-percent-line] [fixture:
timeline/db-event-own-line-two-tasks] [fixture:
timeline/db-period-trailing-spaces] [fixture:
timeline/db-period-same-text-twice]

An event statement is one or more events in the same way, after a statement that
is not a period statement: after a title, a section, an accessibility statement,
or an empty description block, also on the same line, as in `section S : x`. In
`a`, `section S`, and `: e` on three lines, `: e` is an event statement; to
which period mermaid.js gives its events is in the summary of the tests package.
An event statement before the first period makes the input rejected (see
[Rejections outside the grammar](#rejections-outside-the-grammar)). [fixture:
timeline/db-event-own-line-after-title] [fixture:
timeline/db-event-own-line-after-acc-title] [fixture:
timeline/db-event-own-line-after-acc-descr-block] [fixture:
timeline/gram-event-after-empty-description-block] [fixture:
timeline/gram-event-after-empty-description-block-same-line] [fixture:
timeline/db-event-after-section-joins-earlier-task] [fixture:
timeline/db-section-with-event-after-task] [fixture:
timeline/gram-event-after-section-joins-last-period]

### Titles and sections

```text
title-statement   = "title" title-text
section-statement = "section" section-text
```

The title of a title statement is the text of its `title-text` unit as written,
whitespace at its ends included, and the name of a section statement the text of
its `section-text` unit as written; a title and a section name may repeat. How
mermaid.js reads the titles, the title of the frontmatter, and the sections into
its Db is in the summary of the tests package. [fixture:
timeline/db-title-statement] [fixture: timeline/db-title-twice] [fixture:
timeline/db-title-frontmatter] [fixture:
timeline/db-title-frontmatter-and-statement] [fixture:
timeline/db-section-then-title] [fixture: timeline/db-section-statement]
[fixture: timeline/db-section-twice-same-name]

### Accessibility statements

```text
accessibility-statement = "accTitle" ":" acc-title-text
                        | "accDescr" ":" acc-description-text
                        | "accDescr" "{" acc-description-block-text "}"
```

An accessibility title and an accessibility description are the text of their
unit without the whitespace at its ends, which mermaid.js trims; the text of a
block keeps its line breaks, and the whitespace after each of them is left out
of the Db (see the summary of the tests package). A title and a description may
be written more than once, a description as a line or as a block. [fixture:
timeline/db-acc-title-statement] [fixture:
timeline/db-acc-title-trailing-spaces] [fixture: timeline/db-acc-title-twice]
[fixture: timeline/db-acc-descr-statement] [fixture:
timeline/db-acc-descr-block] [fixture: timeline/db-acc-descr-block-blank-line]
[fixture: timeline/db-acc-descr-block-then-line] [fixture:
timeline/db-acc-descr-line-then-block] [fixture: timeline/db-acc-all-statements]

### Empty description blocks

```text
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `acc-description-block-text` unit:
`accDescr {}`, a block of whitespace or empty lines only, and a block that holds
only directives or comment lines, which are removed before the lexer reads the
text. mermaid.js reads no token for it. It is a description block statement
without text, which changes nothing, so a description written before it stays,
wherever a statement starts: on a line of its own, right after the header, right
after another block, and before a statement on the same line; an event after it
is an event statement. Inside a period, an event, a title text, or a section
text, `accDescr {}` is text. A statement starts at every place where a block can
be read as one, so no block lies inside a statement, and the known divergence
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md) has no
case in this diagram type. [fixture: timeline/db-acc-descr-block-braces-only]
[fixture: timeline/gram-empty-description-block-directive-only] [fixture:
timeline/gram-empty-description-block-comment-line-only] [fixture:
timeline/gram-empty-description-block-keeps-description] [fixture:
timeline/db-acc-descr-block-empty] [fixture:
timeline/gram-empty-description-block-after-header] [fixture:
timeline/gram-empty-description-blocks-then-period] [fixture:
timeline/gram-event-after-empty-description-block] [fixture:
timeline/gram-empty-description-block-in-period] [fixture:
timeline/gram-empty-description-block-in-event] [fixture:
timeline/gram-empty-description-block-in-title] [fixture:
timeline/gram-empty-description-block-in-section]

### Rejections outside the grammar

The Db of mermaid.js throws for one kind of input, which is rejected: an event
statement before the first period, which
[`addEvent()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L65-L70)
has no period to give to. So `: e` right after the header, `timeline : b` and
`timeline: x`, `timeline TD: x`, `: e` after a title or a section and no period,
and `section S : x` before any period are rejected. [fixture:
timeline/gram-event-first] [fixture: timeline/header-event-on-header-line]
[fixture: timeline/header-colon-suffix] [fixture:
timeline/header-direction-then-colon] [fixture: timeline/gram-event-after-title]
[fixture: timeline/gram-event-after-section-only] [fixture:
timeline/gram-section-then-event-line] [fixture:
timeline/gram-section-with-event]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a keyword or the direction makes the input rejected in this
  specification, while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)): inside the header, the
  direction, `title`, `section`, `accTitle`, and `accDescr`. [fixture:
  timeline/div-directive-in-header-keyword] [fixture:
  timeline/div-directive-in-direction] [fixture:
  timeline/div-directive-in-title-keyword] [fixture:
  timeline/div-directive-in-section-keyword] [fixture:
  timeline/div-directive-in-acc-title-keyword] [fixture:
  timeline/div-directive-in-acc-descr-keyword] [fixture:
  timeline/div-directive-in-acc-descr-block-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule, an ignored `;` inside a keyword makes
  the input rejected here, while mermaid.js removes the `;` and reads the parts
  as one. The `style`, the `:`, and the `#` that the rule looks for lie in a
  description block before the statement on its line: after
  `accDescr { style:#x }` on the same line, `ti;tle T`, `sec;tion S`, and
  `accTi;tle: T` are read as the statements without the `;`. Inside a text unit,
  the reading of mermaid.js is kept (see
  [Trivia between units](#directives-inside-units)). [fixture:
  timeline/div-ignored-semicolon-in-title-keyword] [fixture:
  timeline/div-ignored-semicolon-in-section-keyword] [fixture:
  timeline/div-ignored-semicolon-in-acc-title-keyword] [fixture:
  timeline/tokens-ignored-semicolon-in-period]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.md).**
  A `%%` right after the first character of a unit, a character other than `}`
  and whitespace, is read here as [Comments](#comments) says: a comment starts
  only where a unit starts, so the `%%` is part of the unit, or the character
  before it is a unit that the grammar does not take. mermaid.js reads the
  character and the rest of the line as one comment. The difference goes both
  ways: `a%% c`, `;%% c`, `é%% c`, `timeline;%% c`, and `x%%{ }%%` right after a
  description block are periods here and nothing in mermaid.js; `:%% c` is
  rejected here and accepted by mermaid.js. [fixture:
  timeline/db-comment-percent-after-period-glued] [fixture:
  timeline/div-comment-after-period-start] [fixture:
  timeline/div-comment-after-semicolon] [fixture:
  timeline/div-comment-after-non-ascii-letter] [fixture:
  timeline/div-comment-after-semicolon-after-header] [fixture:
  timeline/div-comment-after-block-character] [fixture:
  timeline/div-comment-after-colon]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, in an event, a period, a title, or a section, makes mermaid.js
  hand the text to the C4 parser, which rejects it; here the text is a timeline.
  `C4Context` is text in both. [fixture: timeline/div-c4-keyword-in-event]
  [fixture: timeline/div-c4-keyword-in-period] [fixture:
  timeline/div-c4-keyword-in-title] [fixture:
  timeline/div-c4-keyword-in-section] [fixture:
  timeline/lex-c4context-in-period]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of `%%` alone, a line `%%{ }%%`, which is no directive, and a line of
  whitespace only after such a line, before the header, are a comment or nothing
  here, while mermaid.js rejects the input, because its lexer reads the line
  feed after the `%%` as a `newline` unit before the header (see
  [Detection](#detection)). [fixture: timeline/header-after-bare-percent-line]
  [fixture: timeline/header-after-empty-braces-line] [fixture:
  timeline/header-after-bare-percent-line-and-whitespace-line]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, the period `A b="c">d` is `A b='c'>d` in
  mermaid.js, while here the frontmatter is not searched for tags and the quotes
  stay. Both accept the input; the Db differs. Without the frontmatter, a tag
  that starts in the text, as in `A <a b="c">d`, is read in the same way by
  both. [fixture: timeline/div-html-tag-starts-in-frontmatter-period] [fixture:
  timeline/lex-html-tag-in-period]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: timeline/div-frontmatter-invalid-yaml]

The known divergences
[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md)
and
[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.md)
have no case in this diagram type: a comment of mermaid.js that takes a line
feed before its `%%` changes nothing, since the grammar needs no line feed
between statements, and a `%%{` where a unit starts is a comment in both (see
[Comments](#comments)). Neither has
[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md) (see
[Empty description blocks](#empty-description-blocks)).
