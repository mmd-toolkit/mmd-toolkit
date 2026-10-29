# Gantt

Japanese version: [gantt.ja.md](./gantt.ja.md)

Source of truth in mermaid.js:

- [`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison)
- [`ganttDb.js`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js)
- the tests (`*.spec.js`) in
  [`gantt/`](https://github.com/mermaid-js/mermaid/tree/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt)

This document covers the diagram type `gantt`, the Gantt chart. The nodes of the
tree are defined in [ast/gantt.md](../ast/gantt.md).

## Detection

Entry 11 of [detection.md](../detection.md) selects this grammar: the text
starts with `gantt`, after whitespace, in exactly this case
([`ganttDetector.ts`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDetector.ts#L9-L11)).
`GANTT` is no gantt diagram and matches no detector. [fixture:
gantt/header-only] [fixture: gantt/header-leading-whitespace] [fixture:
gantt/header-upper-case]

The lexer then reads the header again, case-insensitively and not followed by a
word character (see [The statement context](#the-statement-context)). So
`gantt2` is detected as a gantt diagram and rejected, while `gantt-x : 1d` is
the header followed by the task `-x `. A statement may follow the header on its
line, after whitespace or not, and the header alone is accepted, also without a
line feed after it. `gantt:` and `gantt#` are rejected, as the header followed
by a `:` unit, which the grammar does not take, and by a task text without data.
[fixture: gantt/header-digit-suffix] [fixture: gantt/header-dash-suffix-task]
[fixture: gantt/header-statement-same-line] [fixture:
gantt/header-tab-then-task] [fixture: gantt/header-only] [fixture:
gantt/header-line-feed-only] [fixture: gantt/header-crlf] [fixture:
gantt/header-cr-only] [fixture: gantt/header-colon] [fixture: gantt/header-hash]

A line that holds only `%%`, or `%%{ }%%`, which is no directive, before the
header is a bare `%%` line, which detection reads and passes to find the header,
and which is a comment of the diagram here, with the mark `%%`, as in every
diagram type (see [Diagram detection](../common.md#diagram-detection)); the
comment belongs to no node, and the GanttDiagram starts at the header.
mermaid.js rejects the input in both cases, and also with a line of whitespace
only after the bare line, because its lexer reads the `%%` as a comment but the
line feed after it as a `newline` unit, which its grammar does not take before
the header: the known divergence
[`bare-percent-line-before-header`](#known-divergences). `%%` followed by a
space is a comment line, removed before detection, and so is a line `%% c`. A
directive on a line before the header or right after the header on its line is a
directive and nothing else, and an empty description block before the header is
the first unit of the text, so no detector matches. [fixture:
gantt/header-after-bare-percent-line] [fixture:
gantt/header-after-empty-braces-line] [fixture:
gantt/header-after-bare-percent-line-and-whitespace-line] [fixture:
gantt/header-after-percent-space-line] [fixture:
gantt/header-after-comment-line] [fixture: gantt/header-after-directive-line]
[fixture: gantt/header-then-directive-same-line] [fixture:
gantt/header-after-empty-description-block]

## Lexical structure

The lexer reads the [diagram text](../common.md#reading-a-source) in
[converted form](../common.md#reading-a-source): each line terminator as `\n`,
each attribute quote as `'`, each entity as its placeholder, and through comment
regions and the `;` that the line rule ignores as if they were not there. The
`\n` that the lexer reads after the last character
([End of text](../common.md#end-of-text)) is part of the diagram text. This
section describes the diagram's own unit rules, item 4 of
[Reading a source](../common.md#reading-a-source).

The lexer of mermaid.js for this diagram compares letters case-insensitively
(see [Notation](../common.md#notation)): `DATEFORMAT YYYY`, `TITLE T`,
`WEEKDAY MONDAY`, `ACCTITLE: T`, `ACCDESCR { D }`, and
`CLICK id1 CALL f() HREF "u"` are read as with the lower-case words, and a day
name in any case sets the day in lower case. The texts keep the case in which
they are written, and a click id is compared with the task ids as written.
[fixture: gantt/lex-keywords-upper-case] [fixture:
gantt/lex-acc-keywords-upper-case] [fixture:
gantt/lex-acc-descr-block-upper-case] [fixture:
gantt/lex-click-keywords-upper-case] [fixture: gantt/lex-day-mixed-case]
[fixture: gantt/lex-click-upper-case-id-kept] A **keyword** below is a word,
matched case-insensitively, that is not followed by a word character (see
[Notation](../common.md#notation)) where the rule says so, and a word followed
by whitespace where it says so: `gantt2` holds no header, `inclusiveEndDatesx`,
`topAxisx`, and `weekday mondayx` are task texts, and so are `titles`,
`title-x`, `clickx`, `hrefx`, and `callx`, because no whitespace follows the
word (see [Keywords and what follows them](#the-statement-context)). [fixture:
gantt/header-digit-suffix] [fixture: gantt/lex-inclusive-word-suffix-task]
[fixture: gantt/lex-topaxis-word-suffix-task] [fixture:
gantt/lex-weekday-word-suffix-task] [fixture: gantt/lex-title-word-suffix-task]
[fixture: gantt/lex-title-dash-task] [fixture: gantt/lex-click-word-suffix-task]
[fixture: gantt/lex-href-word-suffix-task] [fixture:
gantt/lex-call-word-suffix-task]

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
context, the description context, the description block context, the click
context, the href context, the callback name context, or the callback arguments
context: the input is then rejected. So `accTitle:` with nothing after it, also
with whitespace or a line feed after the colon, `accDescr:` with nothing after
it, `accDescr {` without `}`, with text after it or without, `click id1` at the
end of the text, `click` and whitespace at the end of the text, `href "u`
without its closing quote, `call f` without `(`, and `call f(1` without `)` are
rejected, also when lines follow, because the rules of these contexts read line
feeds. `click id1` followed by a line feed is read in the statement context at
the end, and is rejected by the grammar, because the click statement has no
part. [fixture: gantt/lex-acc-title-at-end] [fixture:
gantt/lex-acc-title-space-at-end] [fixture:
gantt/lex-acc-title-line-feed-at-end] [fixture: gantt/lex-acc-descr-at-end]
[fixture: gantt/lex-acc-descr-block-unclosed] [fixture:
gantt/lex-acc-descr-block-unclosed-lines] [fixture: gantt/lex-click-id-at-end]
[fixture: gantt/lex-click-whitespace-at-end] [fixture: gantt/lex-href-unclosed]
[fixture: gantt/lex-href-unclosed-lines] [fixture:
gantt/lex-callback-name-at-end] [fixture: gantt/lex-callback-name-at-end-lines]
[fixture: gantt/lex-callback-arguments-unclosed] [fixture:
gantt/lex-callback-arguments-unclosed-lines] [fixture:
gantt/lex-click-id-line-feed-at-end]

**Whitespace.** Whitespace in this document is the set of
[Notation](../common.md#notation): U+00A0, U+2028, U+3000, U+FEFF, a vertical
tab, and a form feed are whitespace wherever a rule reads whitespace, and so is
a line feed where a rule says so. In the statement context, a run of one or more
line feeds where a unit starts is a `newline` unit (rule 5), and any other run
of whitespace, line feeds included, lies between units without being part of one
(rule 6): `gantt`, U+00A0, and `title T` is the header and the title, and so
with U+2028 in place of U+00A0. The rules for the keywords read whitespace
themselves, each as it says, and the texts of the statements take whitespace as
their own characters: U+3000 before a task text is whitespace, and U+3000 before
the colon is a character of the text; a form feed inside task data is a
character of the data, and U+FEFF before a task is whitespace. [fixture:
gantt/lex-whitespace-nbsp-between-units] [fixture:
gantt/lex-whitespace-line-separator-between-units] [fixture:
gantt/lex-whitespace-ideographic-space-around-task] [fixture:
gantt/lex-whitespace-vertical-tab-before-task] [fixture:
gantt/lex-whitespace-form-feed-in-data] [fixture:
gantt/lex-whitespace-bom-before-task] [fixture: gantt/lex-newline-runs]
[fixture: gantt/lex-space-then-line-feeds-then-task] [fixture:
gantt/lex-task-text-tab-at-end]

**Entities.** An entity is read as its placeholder before the lexer reads the
text (see [Entities](../common.md#entities)), and the placeholder is made of
characters outside ASCII, so its `#` and `;` do not end a setting text or task
data, and the text keeps the entity as written: `a#amp; : 1d` is a task whose
description is `a#amp; `; `title #x;` has the title `#x;`; `dateFormat X#y;` has
the format `X#y;`; after the entity, a `#` or a `;` ends the text as usual.
[fixture: gantt/entity-placeholder-in-task-text] [fixture:
gantt/entity-placeholder-in-title] [fixture:
gantt/entity-placeholder-in-href-string] [fixture:
gantt/entity-placeholder-in-click-id] [fixture:
gantt/entity-placeholder-in-task-data] [fixture: gantt/lex-dateformat-entity]
[fixture: gantt/lex-dateformat-entity-then-hash] [fixture:
gantt/entity-placeholder-then-semicolon-in-data] [fixture:
gantt/lex-todaymarker-entity] The attribute quotes of an HTML tag are read as
`'` as in every diagram type (see
[HTML attribute quotes](../common.md#html-attribute-quotes)): `title`
`<b a="x">t</b>` has the title with `a='x'`, while quotes outside a tag stay
quotes. [fixture: gantt/lex-html-tag-in-title] [fixture:
gantt/lex-quotes-in-task-text-with-frontmatter-tag]

### Directives inside units

The lexer reads the diagram text, which has no directives, as mermaid.js reads
its text once it has removed them. The rule of
[A directive is a token boundary](../common.md#a-directive-is-a-token-boundary)
then applies to the units: a directive inside a text unit or a string unit keeps
the reading of mermaid.js, while a directive inside any other unit, a name unit
included, makes the input rejected. The **name units** are an `id` of the click
context and a `list-item` of an `includes` or `excludes` statement. The **text
units** are a `setting-text`, a `marker-text`, a `title-text`, a `section-text`,
a `task-text`, a `data-item`, a `callback-name`, a `callback-arguments`, an
`acc-title-text`, an `acc-description-text`, and an
`acc-description-block-text`. The one **string unit** is a `url-text`.

- `a%%{init: {}}%%b : 1d` is the task `ab `, `a : 1%%{init: {}}%%d` has the end
  `1d`, `title a%%{init: {}}%%b` the title `ab`, `section S%%{init: {}}%%T` the
  section `ST`, `dateFormat YY%%{init: {}}%%YY` the format `YYYY`,
  `accTitle: a%%{init: {}}%%b` the accessibility title `ab`, and so is the
  description of `accDescr { a%%{init: {}}%%b }`; `click id1 href`
  `"u%%{init: {}}%%v"` has the URL `uv`, `call f%%{init: {}}%%g()` the callback
  `fg`, and `call f(1%%{init: {}}%%2)` the arguments `12`, as in mermaid.js.
  [fixture: gantt/lex-directive-in-task-text] [fixture:
  gantt/lex-directive-in-task-data] [fixture: gantt/lex-directive-in-title-text]
  [fixture: gantt/lex-directive-in-section-text] [fixture:
  gantt/lex-directive-in-setting-text] [fixture:
  gantt/lex-directive-in-acc-title] [fixture:
  gantt/lex-directive-in-acc-descr-block] [fixture:
  gantt/lex-directive-in-href-string] [fixture:
  gantt/lex-directive-in-callback-name] [fixture:
  gantt/lex-directive-in-callback-arguments]
- A directive between two units is allowed whatever their kind:
  `a : 1d%%{init: {}}%%, 2d`, `title %%{init: {}}%%T`, `title%%{init: {}}%% T`,
  `weekday %%{init: {}}%%monday`, `click %%{init: {}}%%id1 href "u"`,
  `href %%{init: {}}%%"u"`, `call f%%{init: {}}%%()`, `call f(%%{init: {}}%%1)`,
  `accTitle%%{init: {}}%%: T`, `accDescr %%{init: {}}%%{ d }`,
  `a :%%{init: {}}%% 1d`, and `gantt%%{init: {}}%%` followed by a line are read
  as without the directive. [fixture: gantt/lex-directive-between-items]
  [fixture: gantt/lex-directive-between-title-and-text] [fixture:
  gantt/lex-directive-between-title-and-whitespace] [fixture:
  gantt/lex-directive-between-weekday-and-day] [fixture:
  gantt/lex-directive-between-click-and-id] [fixture:
  gantt/lex-directive-between-href-and-quote] [fixture:
  gantt/lex-directive-between-callback-name-and-parenthesis] [fixture:
  gantt/lex-directive-after-opening-parenthesis] [fixture:
  gantt/lex-directive-between-acc-title-and-colon] [fixture:
  gantt/lex-directive-between-acc-descr-and-brace] [fixture:
  gantt/lex-directive-after-task-colon] [fixture:
  gantt/header-then-directive-same-line]
- In `click id%%{init: {}}%%1 href "u"` and `excludes week%%{init: {}}%%ends`
  the directive lies inside a name unit, and in `ga%%{init: {}}%%ntt`,
  `ti%%{init: {}}%%tle T`, `sec%%{init: {}}%%tion S`,
  `date%%{init: {}}%%Format X`, `inclusive%%{init: {}}%%EndDates`,
  `week%%{init: {}}%%day monday`, `weekday mon%%{init: {}}%%day`,
  `cli%%{init: {}}%%ck`, `hr%%{init: {}}%%ef`, `ca%%{init: {}}%%ll`,
  `acc%%{init: {}}%%Title:`, and `acc%%{init: {}}%%Descr {` inside a keyword:
  the input is rejected, while mermaid.js accepts it, reading the two parts as
  one (see [Known divergences](#known-divergences)). [fixture:
  gantt/div-directive-in-click-id] [fixture: gantt/div-directive-in-list-item]
  [fixture: gantt/div-directive-in-header-keyword] [fixture:
  gantt/div-directive-in-title-keyword] [fixture:
  gantt/div-directive-in-section-keyword] [fixture:
  gantt/div-directive-in-dateformat-keyword] [fixture:
  gantt/div-directive-in-inclusive-keyword] [fixture:
  gantt/div-directive-in-weekday-keyword] [fixture:
  gantt/div-directive-in-day-keyword] [fixture:
  gantt/div-directive-in-click-keyword] [fixture:
  gantt/div-directive-in-href-keyword] [fixture:
  gantt/div-directive-in-call-keyword] [fixture:
  gantt/div-directive-in-acc-title-keyword] [fixture:
  gantt/div-directive-in-acc-descr-keyword]

**Trivia between units.** The trivia of [common.md](../common.md) meet the units
of this diagram as follows. A lone CR is a line terminator, read as a line feed
(see [Line terminators](../common.md#line-terminators)): the header, a title, a
section, and a task are read between lone CRs, and between CRLF line breaks, as
between line feeds, and a lone CR after a click id leaves the click context as a
line feed does. [fixture: gantt/header-cr-only] [fixture:
gantt/lex-title-cr-value] [fixture: gantt/lex-section-cr-value] [fixture:
gantt/header-crlf] [fixture: gantt/lex-title-crlf-value] [fixture:
gantt/lex-section-crlf-value] [fixture: gantt/tokens-cr-only-click-parts] A
closed directive between two units is read as nothing, and the whitespace around
it by the rule of the context: a closed directive at the end of a task, title,
or section line, after the text or glued to it, ends nothing, and the next line
is read as usual; the whitespace before it is a character of a title text or a
section text, so `title T %%{init: {}}%%` has the title `T ` and
`section S %%{init: {}}%%` the section `S `, while glued to the text they have
`T` and `S`. [fixture: gantt/lex-directive-at-end-of-data-line] [fixture:
gantt/lex-directive-glued-at-end-of-data] [fixture:
gantt/lex-directive-at-end-of-title-line] [fixture:
gantt/lex-directive-glued-at-end-of-title] [fixture:
gantt/lex-directive-at-end-of-section-line] [fixture:
gantt/lex-directive-glued-at-end-of-section] An unclosed directive takes the
rest of the text (see
[Where a directive is](../common.md#where-a-directive-is)): `a : 1d %%{init: {}`
followed by a line `b : 2d` has the one task `a ` with the end `1d`, `gantt`, a
line `%%{init: {}`, and a line `a : 1d` has no task, and `title T %%{init: {}`
followed by a task line has the title `T ` and no task. [fixture:
gantt/tokens-unclosed-directive-in-data-line] [fixture:
gantt/tokens-unclosed-directive-after-header] [fixture:
gantt/tokens-unclosed-directive-in-title] A comment line is removed before the
lexer reads the text, also inside a description block, inside callback arguments
or a URL string that run over several lines, and between a keyword and what
follows it: `title`, a comment line, and `T` has the title `T`, and so with
`weekday` and `monday`, `dateFormat` and `YYYY`, and `accTitle:` and `T`;
`click id1`, a comment line, and `href "u"` sets the link, because the line feed
after the id leaves the click context; `click id1 href "u"`, a comment line, and
`call f()` is rejected, because the line feed after the string is a `newline`
unit. A block that holds only a comment line is an empty description block.
[fixture: gantt/tokens-comment-line-in-acc-block] [fixture:
gantt/tokens-comment-line-only-in-acc-block] [fixture:
gantt/tokens-comment-line-in-callback-arguments] [fixture:
gantt/tokens-comment-line-in-href-string] [fixture:
gantt/tokens-comment-line-after-title-keyword] [fixture:
gantt/tokens-comment-line-after-weekday] [fixture:
gantt/tokens-comment-line-after-dateformat] [fixture:
gantt/tokens-comment-line-after-acc-title-colon] [fixture:
gantt/tokens-comment-line-after-click-id] [fixture:
gantt/tokens-comment-line-between-click-parts] On a line that matches the
`style` rule (see
[`style` and `classDef` lines](../common.md#style-and-classdef-lines)), the
ignored `;` is read through: inside a title text, a task text, task data, a
callback name, callback arguments, a URL string, an accessibility title, or a
description block, the two parts are read as one, as in mermaid.js, and so
between a keyword and its whitespace or after a URL string; the `;` that would
end a `todayMarker` text or task data is ignored instead, and the text goes on.
Where the `;` is not the last of its line, it is not ignored, and the `#` before
it makes an entity. Inside a keyword, a click id, or a list item, the ignored
`;` makes the input rejected, while mermaid.js accepts it (see
[Known divergences](#known-divergences)). [fixture:
gantt/tokens-ignored-semicolon-in-title-text] [fixture:
gantt/tokens-ignored-semicolon-in-task-text] [fixture:
gantt/tokens-ignored-semicolon-in-task-data] [fixture:
gantt/tokens-ignored-semicolon-in-callback-name] [fixture:
gantt/tokens-ignored-semicolon-in-callback-arguments] [fixture:
gantt/tokens-ignored-semicolon-in-href-string] [fixture:
gantt/tokens-ignored-semicolon-in-acc-title] [fixture:
gantt/tokens-ignored-semicolon-in-acc-block] [fixture:
gantt/tokens-ignored-semicolon-between-keyword-and-text] [fixture:
gantt/tokens-ignored-semicolon-after-href-string] [fixture:
gantt/tokens-ignored-semicolon-todaymarker] [fixture:
gantt/tokens-ignored-semicolon-two-tasks] [fixture:
gantt/tokens-ignored-semicolon-first-of-two-in-title] [fixture:
gantt/tokens-ignored-semicolon-in-section-text] [fixture:
gantt/lex-semicolon-not-ignored-in-click-id]

### The statement context

In the statement context, the lexer tries these rules in order:

1. `accTitle`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accTitle` unit
   and a `:` unit; enters the title context. [fixture: gantt/gram-acc-title]
   [fixture: gantt/lex-acc-title-no-space] [fixture:
   gantt/lex-acc-title-spaces-around-colon] [fixture:
   gantt/lex-acc-title-line-feed-before-colon] [fixture:
   gantt/gram-acc-title-line-feed-then-text]
2. `accDescr`, zero or more whitespace characters, line feeds included, `:`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `:` unit; enters the description context. [fixture:
   gantt/gram-acc-descr] [fixture: gantt/gram-acc-descr-line-feed-then-text]
3. `accDescr`, zero or more whitespace characters, line feeds included, `{`, and
   zero or more whitespace characters, line feeds included: an `accDescr` unit
   and a `{` unit; enters the description block context. [fixture:
   gantt/gram-acc-descr-block] [fixture: gantt/lex-acc-descr-block-no-space]
   [fixture: gantt/lex-acc-descr-block-spaces] [fixture:
   gantt/lex-acc-descr-block-line-feed-before-brace]
4. `%`: a diagram comment, from the `%` to the end of the line (see
   [Comments](#comments)). [fixture: gantt/lex-percent-comment-after-unit]
   [fixture: gantt/lex-single-percent-comment-glued]
5. One or more line feeds: a `newline` unit. [fixture: gantt/lex-newline-runs]
6. One or more whitespace characters, line feeds included: nothing. [fixture:
   gantt/lex-space-then-line-feeds-then-task]
7. `href`, one or more whitespace characters, line feeds included, and `"`: an
   `href` unit and a `"` unit; enters the href context. [fixture:
   gantt/gram-click-href] [fixture: gantt/lex-href-line-feed-before-quote]
   [fixture: gantt/lex-href-two-spaces-before-quote]
8. `call` and one or more whitespace characters, line feeds included: a `call`
   unit; enters the callback name context. [fixture: gantt/gram-click-call]
   [fixture: gantt/lex-call-line-feed-before-name]
9. `click` and one or more whitespace characters, line feeds included: a `click`
   unit; enters the click context. [fixture: gantt/gram-click-href] [fixture:
   gantt/lex-click-line-feed-id] [fixture: gantt/lex-click-tab-separators]
   [fixture: gantt/lex-click-double-spaces]
10. The keyword `gantt`: a `header` unit. [fixture: gantt/header-only]
11. `dateFormat`, one whitespace character, line feed included, and one or more
    characters other than `#`, `;`, and a line feed: a `dateFormat` unit and a
    `setting-text` unit, whose text is the characters after the one whitespace
    character. [fixture: gantt/db-date-format] [fixture:
    gantt/lex-dateformat-two-spaces] [fixture: gantt/lex-dateformat-tab]
    [fixture: gantt/lex-dateformat-line-feed-value] [fixture:
    gantt/lex-dateformat-hash] [fixture: gantt/lex-dateformat-semicolon]
    [fixture: gantt/lex-dateformat-trailing-spaces]
12. The keyword `inclusiveEndDates`: an `inclusiveEndDates` unit. [fixture:
    gantt/db-inclusive-end-dates]
13. The keyword `topAxis`: a `topAxis` unit. [fixture:
    gantt/db-top-axis-statement]
14. `axisFormat`, one whitespace character, and one or more characters other
    than `#`, `;`, and a line feed, as in rule 11: an `axisFormat` unit and a
    `setting-text` unit. [fixture: gantt/db-axis-format] [fixture:
    gantt/lex-axisformat-hash] [fixture: gantt/db-axis-format-ends-at-semicolon]
    [fixture: gantt/lex-axisformat-line-feed-value]
15. `tickInterval`, one whitespace character, and one or more characters other
    than `#`, `;`, and a line feed: a `tickInterval` unit and a `setting-text`
    unit. [fixture: gantt/db-tick-interval] [fixture:
    gantt/lex-tickinterval-semicolon] [fixture:
    gantt/db-tick-interval-ends-at-hash] [fixture:
    gantt/lex-tickinterval-line-feed-value]
16. `includes`, one whitespace character, and the **list text**, one or more
    characters other than `#`, `;`, and a line feed: an `includes` unit and the
    units of the list text: a `,` unit for each `,`, and a `list-item` unit for
    each maximal run of characters that are neither whitespace nor `,`; the
    whitespace of the list text belongs to no unit. A list text of whitespace
    only has no unit. [fixture: gantt/db-includes-tokens] [fixture:
    gantt/lex-excludes-commas-and-spaces] [fixture:
    gantt/lex-excludes-empty-items] [fixture:
    gantt/lex-excludes-whitespace-value] [fixture:
    gantt/lex-excludes-nbsp-separator] [fixture:
    gantt/lex-includes-line-separator-separator] [fixture:
    gantt/lex-includes-hash] [fixture: gantt/db-includes-ends-at-semicolon]
    [fixture: gantt/lex-includes-line-feed-value]
17. `excludes`, one whitespace character, and the list text, as in rule 16: an
    `excludes` unit and the units of the list text. [fixture:
    gantt/db-excludes-tokens] [fixture: gantt/lex-excludes-semicolon] [fixture:
    gantt/db-excludes-ends-at-hash] [fixture:
    gantt/lex-excludes-line-feed-value] [fixture: gantt/lex-excludes-tab-value]
18. `todayMarker`, one whitespace character, and one or more characters other
    than `;` and a line feed: a `todayMarker` unit and a `marker-text` unit,
    whose text may hold `#`. [fixture: gantt/db-today-marker] [fixture:
    gantt/lex-todaymarker-hash] [fixture: gantt/db-today-marker-holds-hash]
    [fixture: gantt/lex-todaymarker-semicolon] [fixture:
    gantt/lex-todaymarker-line-feed-value]
19. `weekday`, one or more whitespace characters, line feeds included, and one
    of the keywords `monday`, `tuesday`, `wednesday`, `thursday`, `friday`,
    `saturday`, and `sunday`: a `weekday` unit and a `day` unit. [fixture:
    gantt/db-weekday-last-wins] [fixture: gantt/spec-gantt-d1ffa392] [fixture:
    gantt/spec-gantt-7eb2ae90] [fixture: gantt/spec-gantt-76da20a3] [fixture:
    gantt/spec-gantt-a1618573] [fixture: gantt/spec-gantt-1635143f] [fixture:
    gantt/spec-gantt-b5307717] [fixture: gantt/lex-weekday-two-spaces] [fixture:
    gantt/lex-weekday-line-feed] [fixture: gantt/lex-weekday-blank-lines]
    [fixture: gantt/lex-weekday-tab] [fixture: gantt/lex-weekday-nbsp] [fixture:
    gantt/lex-weekday-line-separator] [fixture: gantt/lex-weekday-unknown-day]
    [fixture: gantt/lex-weekday-day-prefix]
20. `weekend`, one or more whitespace characters, line feeds included, and one
    of the keywords `friday` and `saturday`: a `weekend` unit and a `day` unit.
    [fixture: gantt/db-weekend-friday] [fixture: gantt/db-weekend-saturday]
    [fixture: gantt/lex-weekend-line-feed] [fixture:
    gantt/lex-weekend-upper-case] [fixture: gantt/lex-weekend-sunday] [fixture:
    gantt/lex-weekend-monday]
21. Four digits, `-`, two digits, `-`, and two digits, not followed by a word
    character: a `date` unit, which no rule of the grammar takes. [fixture:
    gantt/lex-date-line] [fixture: gantt/lex-date-only-line] [fixture:
    gantt/lex-date-colon] [fixture: gantt/lex-date-after-tab] [fixture:
    gantt/lex-date-dash-suffix] [fixture: gantt/lex-date-digit-suffix-task]
    [fixture: gantt/lex-date-short-task]
22. `title`, one whitespace character, line feed included, and one or more
    characters other than a line feed: a `title` unit and a `title-text` unit,
    whose text is the characters after the one whitespace character, to the end
    of the line, `:`, `#`, `;`, and `%%` included. [fixture:
    gantt/db-title-statement] [fixture: gantt/lex-title-two-spaces] [fixture:
    gantt/lex-title-tab] [fixture: gantt/lex-title-vertical-tab] [fixture:
    gantt/lex-title-ideographic-space] [fixture:
    gantt/lex-title-line-feed-value] [fixture:
    gantt/lex-title-hash-semicolon-percent] [fixture:
    gantt/lex-title-colon-inside] [fixture: gantt/lex-title-trailing-spaces]
    [fixture: gantt/lex-title-then-text-same-line]
23. `accDescription`, one whitespace character, and one or more characters other
    than `#`, `;`, and a line feed: an `accDescription` unit, which no rule of
    the grammar takes. [fixture: gantt/lex-acc-description]
24. `section`, one whitespace character, line feed included, and one or more
    characters other than a line feed: a `section` unit and a `section-text`
    unit, whose text is the characters after the one whitespace character, to
    the end of the line. [fixture: gantt/db-sections] [fixture:
    gantt/lex-section-two-spaces] [fixture: gantt/lex-section-tab] [fixture:
    gantt/lex-section-line-feed-value] [fixture: gantt/lex-section-hash-colon]
    [fixture: gantt/lex-section-trailing-spaces]
25. One or more characters other than `:` and a line feed: a `task-text` unit.
    [fixture: gantt/gram-task] [fixture: gantt/lex-task-text-keyword-inside]
    [fixture: gantt/lex-task-text-quotes] [fixture: gantt/lex-task-text-brace]
    [fixture: gantt/lex-task-hash-line-start] [fixture:
    gantt/lex-task-text-nbsp] [fixture: gantt/lex-task-text-line-separator]
    [fixture: gantt/lex-task-text-paragraph-separator] [fixture:
    gantt/lex-task-text-tab-inside] [fixture:
    gantt/lex-task-text-trailing-spaces]
26. `:` and the **data text**, one or more characters other than `#`, `;`, and a
    line feed: a `:` unit and the units of the data text: a `,` unit for each
    `,`, and, for each stretch of the data text between the `:`, the commas, and
    its end, a `data-item` unit whose text is the stretch without the whitespace
    at its ends, or no unit when the stretch holds only whitespace. [fixture:
    gantt/gram-task] [fixture: gantt/gram-task-no-whitespace] [fixture:
    gantt/lex-task-two-colons] [fixture: gantt/lex-task-double-colon] [fixture:
    gantt/lex-task-hash-in-data] [fixture: gantt/lex-task-semicolon-in-data]
    [fixture: gantt/lex-task-data-to-end-of-line] [fixture:
    gantt/lex-task-data-whitespace-only] [fixture:
    gantt/lex-task-data-leading-tab] [fixture:
    gantt/lex-task-data-line-separator-item] [fixture:
    gantt/lex-task-items-nbsp-trimmed] [fixture: gantt/gram-task-empty-items]
27. `:`: a `:` unit, which no rule of the grammar takes. [fixture:
    gantt/lex-task-colon-only] [fixture: gantt/lex-task-colon-at-end] [fixture:
    gantt/lex-task-hash-after-colon]

Every character other than a line feed and `:` is a character of a task text, so
no character is left for a unit of its own, and a line is rejected only by the
grammar: a task text without data (`a`, `#`, `}`, `title2 T`), a `date` unit, an
`accDescription` unit, or a `:` unit. [fixture: gantt/lex-task-text-only]
[fixture: gantt/lex-task-hash-line] [fixture: gantt/lex-task-brace-line]
[fixture: gantt/lex-title-digit-suffix] [fixture: gantt/lex-date-line] [fixture:
gantt/lex-acc-description] [fixture: gantt/lex-task-colon-only] Some
consequences of the order:

- A `%` where a unit starts is always a comment, also right after a unit on its
  line; inside a text it is a character of the text (see [Comments](#comments)).
  A line that starts with a date is rejected, while a date after other text on
  its line, or in a title, is text. [fixture:
  gantt/lex-single-percent-comment-glued] [fixture:
  gantt/lex-percent-comment-in-title-text] [fixture: gantt/lex-date-line]
  [fixture: gantt/lex-date-in-task-text] [fixture: gantt/lex-date-in-title]
- The statements are ended by their own units, not by line feeds: a `newline`
  unit is a line of its own to the grammar, and several statements may share a
  line, `weekday monday inclusiveEndDates a : 1d`, `inclusiveEndDates title T`,
  `weekday monday title T`, `accDescr { d } a : 1d`, and
  `click id1 href "u" b : 1d` among them, while a title text, a section text,
  and task data take the rest of their line, so `title T a : 1d` is the title
  `T a : 1d` and `a : 1d weekday monday` has the end `1d weekday monday`.
  [fixture: gantt/gram-statements-same-line] [fixture:
  gantt/lex-inclusive-then-title-same-line] [fixture:
  gantt/lex-weekday-then-title-same-line] [fixture:
  gantt/gram-acc-descr-block-then-task-same-line] [fixture:
  gantt/gram-click-href-then-task-same-line] [fixture:
  gantt/lex-title-then-text-same-line] [fixture:
  gantt/gram-task-then-weekday-same-line] [fixture:
  gantt/gram-empty-lines-and-indentation]
- A unit that is whitespace or a `newline` unit ends no statement that is not
  complete: `a` and `: 1d` on two lines, `a : 1d` and `, 2d` on two lines, and
  `a :` followed by a line feed are rejected. [fixture:
  gantt/lex-task-line-feed-before-colon] [fixture:
  gantt/lex-task-line-feed-before-comma] [fixture:
  gantt/lex-task-colon-line-feed-task]

**Keywords and what follows them.** `gantt`, `inclusiveEndDates`, `topAxis`, and
the day names are keywords only where no word character follows: a word
character after them makes the whole word a task text (`gantt2` has no header
and is rejected; `inclusiveEndDatesx : 1d`, `topAxisx : 1d`,
`weekday mondayx : 1d`, and `weekday monday2 : 1d` are tasks), while `-`, `:`,
`#`, `{`, `%`, a line feed, or the end of the text after them ends the keyword:
`gantt-x : 1d` and `inclusiveEndDates-x : 1d` are the keyword and the task
`-x `, `inclusiveEndDates{ : 1d` the keyword and the task `{ `,
`inclusiveEndDates%` the keyword and a comment, and `inclusiveEndDates:`,
`inclusiveEndDates#`, `inclusiveEndDates-x`, `weekday monday-x`,
`weekday monday:`, `weekday monday#`, and `weekday monday x` are rejected,
because the `:` unit and a task text without data are taken by no rule. A letter
outside ASCII is no word character either: `inclusiveEndDatesé : 1d`,
`ganttÉ : 1d`, and `weekday mondayé : 1d` are the keyword and the task `é ` or
`É `, and `topAxisé : 1d` is rejected as a `topAxis` statement, while
`titleé : 1d` and `clické : 1d` are tasks, because `title` and `click` need
whitespace after them. [fixture: gantt/lex-inclusive-non-ascii-letter-task]
[fixture: gantt/header-non-ascii-letter-task] [fixture:
gantt/lex-weekday-non-ascii-letter-task] [fixture:
gantt/lex-topaxis-non-ascii-letter] [fixture:
gantt/lex-title-non-ascii-letter-task] [fixture:
gantt/lex-click-non-ascii-letter-task] [fixture: gantt/header-digit-suffix]
[fixture: gantt/lex-inclusive-word-suffix-task] [fixture:
gantt/lex-topaxis-word-suffix-task] [fixture:
gantt/lex-weekday-word-suffix-task] [fixture:
gantt/lex-weekday-digit-suffix-task] [fixture: gantt/lex-weekday-word-suffix]
[fixture: gantt/header-dash-suffix-task] [fixture:
gantt/lex-inclusive-dash-task] [fixture: gantt/lex-inclusive-brace-task]
[fixture: gantt/lex-inclusive-percent] [fixture: gantt/lex-inclusive-line-feed]
[fixture: gantt/lex-inclusive-colon] [fixture: gantt/lex-inclusive-hash]
[fixture: gantt/lex-inclusive-dash] [fixture: gantt/lex-weekday-dash] [fixture:
gantt/lex-weekday-colon] [fixture: gantt/lex-weekday-hash] [fixture:
gantt/lex-weekday-then-text] `dateFormat`, `axisFormat`, `tickInterval`,
`includes`, `excludes`, `todayMarker`, `title`, `accDescription`, and `section`
are keywords only with exactly one whitespace character after them, which may be
a line feed, and then at least one character of their text: `title`, a line
feed, and `T` has the title `T`, and so with `dateFormat` and `YYYY`, `section`
and `S`, `excludes` and `weekends`, `todayMarker` and `off`; where the text
cannot start, as after a second line feed, after a space and a line feed, at the
end of the text, or, for `dateFormat`, at a `#`, the word is a task text, with
data or without: `title\n\nT`, `title`, `title `, `section`, `dateFormat`,
`dateFormat `, `dateFormat \nX`, `dateFormat\n#x`, and `title2 T` are rejected,
`title:T`, `section:S`, `dateFormat:x`, `tickInterval:1w`, and
`accDescription: x` are tasks whose description is the word, and `titles : 1d`,
`title-x : 1d`, `sectionx : 1d`, `dateFormat-x : 1d`, `weekdays monday : 1d`,
and `weekdayx monday : 1d` are tasks. [fixture: gantt/lex-title-line-feed-value]
[fixture: gantt/lex-dateformat-line-feed-value] [fixture:
gantt/lex-section-line-feed-value] [fixture: gantt/lex-excludes-line-feed-value]
[fixture: gantt/lex-todaymarker-line-feed-value] [fixture:
gantt/lex-title-blank-line-then-text] [fixture: gantt/lex-title-at-end]
[fixture: gantt/lex-title-space-at-end] [fixture: gantt/lex-section-at-end]
[fixture: gantt/lex-section-blank-line-then-text] [fixture:
gantt/lex-dateformat-at-end] [fixture: gantt/lex-dateformat-space-at-end]
[fixture: gantt/lex-dateformat-space-line-feed-value] [fixture:
gantt/lex-dateformat-digit] [fixture: gantt/lex-title-digit-suffix] [fixture:
gantt/lex-title-percent] [fixture: gantt/lex-title-colon-task] [fixture:
gantt/lex-section-colon-task] [fixture: gantt/lex-dateformat-colon-task]
[fixture: gantt/lex-tickinterval-colon-task] [fixture:
gantt/lex-acc-description-colon-task] [fixture:
gantt/lex-title-word-suffix-task] [fixture: gantt/lex-title-dash-task] [fixture:
gantt/lex-section-word-suffix-task] [fixture: gantt/lex-dateformat-dash-task]
[fixture: gantt/lex-weekdays-task] [fixture:
gantt/lex-weekday-word-suffix-keyword] `click`, `href`, and `call` are keywords
only with whitespace after them, a line feed included; `href` also needs the `"`
after the whitespace: `click:` `1d`, `click-x : 1d`, `clickx : 1d`,
`hrefx : 1d`, and `callx : 1d` are tasks, `click` alone, `href"u"` after a click
id, and `callf()` after a click id are rejected, and `click`, a line feed, and
`id1 href "u"` is a click statement. [fixture: gantt/lex-click-colon-task]
[fixture: gantt/lex-click-dash-task] [fixture: gantt/lex-click-word-suffix-task]
[fixture: gantt/lex-href-word-suffix-task] [fixture:
gantt/lex-call-word-suffix-task] [fixture: gantt/lex-click-at-end] [fixture:
gantt/lex-href-no-space] [fixture: gantt/lex-call-no-space] [fixture:
gantt/lex-click-line-feed-id] `accTitle` and `accDescr` are keywords only with
their `:` or `{` after them, after whitespace or not: `accTitlex: T` and
`accTitle-: T` are tasks whose description is the word, and `accTitle`, a line
feed, and `: T` has the title `T`. [fixture:
gantt/lex-acc-title-word-suffix-task] [fixture: gantt/lex-acc-title-dash-task]
[fixture: gantt/lex-acc-title-line-feed-before-colon] [fixture:
gantt/lex-acc-descr-block-line-feed-before-brace]

### The click context

The click context is entered after `click` and its whitespace (rule 9 of the
statement context). The lexer tries these rules in order:

1. One whitespace character, line feed included: nothing; leaves the context.
   [fixture: gantt/gram-click-href] [fixture:
   gantt/gram-click-id-line-feed-href] [fixture:
   gantt/gram-click-id-nbsp-separator] [fixture:
   gantt/gram-click-id-line-separator-separator]
2. The **id text**, one or more characters that are not whitespace: a `,` unit
   for each `,`, and an `id` unit for each maximal run of other characters.
   [fixture: gantt/gram-click-href] [fixture: gantt/gram-click-ids-list]
   [fixture: gantt/gram-click-ids-trailing-comma] [fixture:
   gantt/gram-click-ids-comma-only] [fixture: gantt/gram-click-ids-two-commas]
   [fixture: gantt/gram-click-id-colon] [fixture: gantt/gram-click-id-quotes]
   [fixture: gantt/gram-click-id-parentheses] [fixture:
   gantt/lex-percent-in-click-id]

The id text ends at the first whitespace character, which leaves the context and
is no `newline` unit: `click id1`, a line feed, and `href "u"` is one click
statement, also with whitespace before `href`, while `click id1`, a space, a
line feed, and `href "u"`, and `click id1`, two line feeds, and `href "u"`, are
rejected, because the second whitespace character starts a `newline` unit in the
statement context, and `click id1, id2 href "u"` is rejected, because the ids
end at the space and `id2 href "u"` is a task text without data. The text may
not end in the click context. [fixture: gantt/gram-click-id-line-feed-href]
[fixture: gantt/gram-click-id-line-feed-indent-href] [fixture:
gantt/gram-click-id-line-feed-tab-href] [fixture:
gantt/gram-click-id-space-line-feed-href] [fixture:
gantt/gram-click-id-blank-line-href] [fixture: gantt/gram-click-ids-comma-space]
[fixture: gantt/lex-click-id-at-end] A click id has no comment rule: `%` is a
character of the id. [fixture: gantt/lex-percent-in-click-id]

### The href context

The href context is entered after `href`, its whitespace, and `"` (rule 7 of the
statement context). The lexer tries these rules in order:

1. `"`: a `"` unit; leaves the context. [fixture: gantt/gram-click-href]
2. One or more characters other than `"`, line feeds included: a `url-text`
   unit. [fixture: gantt/gram-click-href] [fixture:
   gantt/gram-click-href-line-feed-inside] [fixture:
   gantt/lex-percent-in-href-string] [fixture: gantt/lex-href-line-feed-url]

A `url-text` is never empty: `href ""` has an `href` unit and two `"` units with
nothing between them, an **empty href**, which no rule of the grammar takes (see
[Empty hrefs and empty calls](#empty-hrefs-and-empty-calls)); `href "`, a line
feed, and `"` has the URL of one line feed. The text may not end in the href
context. [fixture: gantt/gram-click-empty-href-only] [fixture:
gantt/lex-href-line-feed-url] [fixture: gantt/lex-href-unclosed]

### The callback contexts

The callback name context is entered after `call` and its whitespace (rule 8 of
the statement context). The lexer tries these rules in order:

1. `(`, zero or more whitespace characters, line feeds included, and `)`: a `(`
   unit and a `)` unit; leaves the context. [fixture: gantt/gram-click-call]
   [fixture: gantt/gram-click-call-blank-arguments] [fixture:
   gantt/gram-empty-call-line-feed-inside]
2. `(`: a `(` unit; leaves the context and enters the callback arguments
   context. [fixture: gantt/gram-click-call-arguments]
3. One or more characters other than `(`, line feeds included: a `callback-name`
   unit. [fixture: gantt/gram-click-call] [fixture:
   gantt/gram-click-call-name-space-before-parenthesis] [fixture:
   gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
   gantt/gram-click-call-name-with-space] [fixture:
   gantt/gram-click-call-name-hash] [fixture:
   gantt/lex-percent-in-callback-name]

In the callback arguments context, the lexer tries these rules in order:

1. `)`: a `)` unit; leaves the context. [fixture:
   gantt/gram-click-call-arguments]
2. One or more characters other than `)`, line feeds included: a
   `callback-arguments` unit. [fixture: gantt/gram-click-call-arguments]
   [fixture: gantt/gram-click-call-arguments-leading-space] [fixture:
   gantt/gram-click-call-arguments-quoted-comma] [fixture:
   gantt/gram-click-call-arguments-line-feed] [fixture:
   gantt/lex-percent-in-callback-arguments]

A `callback-name` runs to the first `(`, whitespace and line feeds at its end
included: `call f ()` has the name `f` and a space, and `call f`, a line feed,
and `()` the name `f` and a line feed. A `(` right after the whitespace of
`call` leaves no name: `call (1)` is rejected, and `call ()`, with only
whitespace between the parentheses, is an **empty call**, which no rule of the
grammar takes (see [Empty hrefs and empty calls](#empty-hrefs-and-empty-calls)).
The arguments end at the first `)`, also inside quotes: `call f("a)b")` is
rejected. The text may not end in either context. [fixture:
gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
gantt/gram-click-call-no-name] [fixture: gantt/gram-click-empty-call-only]
[fixture: gantt/gram-click-call-arguments-parenthesis-in-string] [fixture:
gantt/lex-callback-name-at-end] [fixture: gantt/lex-callback-arguments-unclosed]

### Accessibility values

The title context is entered after `accTitle:` and its whitespace (rule 1 of the
statement context), the description context after `accDescr:` and its whitespace
(rule 2), and the description block context after `accDescr {` and its
whitespace (rule 3).

In the title context and in the description context, the one rule is: one or
more characters other than a line feed: an `acc-title-text` unit in the title
context, an `acc-description-text` unit in the description context; leaves the
context. The whitespace after the colon, line feeds included, is read with the
colon, so the text starts at the first character that is not whitespace, on the
line of the colon or on a later line, and runs to the end of that line, `;`,
`#`, `:`, and `%%` included: `accTitle:`, a line feed, and `title X` has the
accessibility title `title X` and no title. The text may not end in these
contexts, so `accTitle:` with nothing but whitespace after it is rejected.
[fixture: gantt/gram-acc-title] [fixture: gantt/gram-acc-title-hash-semicolon]
[fixture: gantt/gram-acc-title-two-colons] [fixture:
gantt/lex-percent-comment-in-acc-title] [fixture:
gantt/gram-acc-title-line-feed-then-text] [fixture:
gantt/gram-acc-title-blank-lines-then-text] [fixture:
gantt/gram-acc-title-takes-title-line] [fixture:
gantt/gram-acc-descr-semicolon-start] [fixture:
gantt/gram-acc-descr-line-feed-then-text] [fixture: gantt/lex-acc-title-at-end]
[fixture: gantt/lex-acc-title-space-at-end] [fixture:
gantt/lex-acc-descr-at-end]

In the description block context, the lexer tries these rules in order:

1. `}`: a `}` unit; leaves the context. [fixture: gantt/gram-acc-descr-block]
2. One or more characters other than `}`, line feeds included: an
   `acc-description-block-text` unit. [fixture: gantt/gram-acc-descr-block]
   [fixture: gantt/gram-acc-descr-block-multiline] [fixture:
   gantt/gram-acc-descr-block-brace-inside]

The whitespace after the `{`, line feeds included, is read with the brace, so a
block text starts at a character that is not whitespace and ends right before
the `}`, the whitespace before the `}` included; a block with only whitespace
between its braces has no text unit (see
[Empty description blocks](#empty-description-blocks)). The text may not end in
the description block context. After the `}`, a second `}` is a task text
without data, so `accDescr {d}}` is rejected. [fixture:
gantt/gram-acc-descr-block-multiline] [fixture:
gantt/gram-acc-descr-block-empty] [fixture:
gantt/gram-acc-descr-block-whitespace-only] [fixture:
gantt/lex-acc-descr-block-unclosed] [fixture:
gantt/gram-acc-descr-block-double-close]

### Comments

Besides units, the lexer reads **diagram comments**: text that runs to the end
of its line and that mermaid.js reads as nothing. They are not the comment lines
of [common.md](../common.md#comment-lines), which are removed before the lexer
reads the text; a diagram comment can start in the middle of a line, and a line
`%%` alone, `% c`, `%x`, or `%%{ }%%` is a diagram comment, not a comment line.
[fixture: gantt/comment-line] [fixture:
gantt/lex-bare-percent-line-after-header] [fixture:
gantt/lex-single-percent-comment-line] [fixture: gantt/lex-percent-x-line]
[fixture: gantt/lex-percent-brace-line-after-task]

A diagram comment starts at a `%` where a unit starts in the statement context
(rule 4) and runs to the line feed, which is not part of it. The **mark** of a
diagram comment is `%%` when it starts with `%%`, and `%` otherwise, and its
value is the text after the mark: the value of `%% c` is a space and `c`, that
of `% c` is the same, that of `%%` alone is empty, and that of `%%{ }%%` is
`{ }%%`. `%%{` that starts no directive (see
[Where a directive is](../common.md#where-a-directive-is)) is such a comment
wherever a unit starts: on a line of its own after a statement, `%%{}`,
`%%{-x}%%`, and `%%{` with nothing after it among them, after a unit and
whitespace on its line, where it takes the rest of the line, and right after a
unit. The mark is found in the text without directives, as the lexer reads it,
and the value is the source text after the mark, directives included, as for a
comment line. [fixture: gantt/lex-percent-comment-after-unit] [fixture:
gantt/lex-single-percent-comment-glued] [fixture:
gantt/lex-bare-percent-line-at-end] [fixture:
gantt/lex-bare-percent-lines-then-task] [fixture:
gantt/lex-percent-comment-glued-after-header] [fixture:
gantt/lex-single-percent-glued-after-header] [fixture:
gantt/lex-percent-comment-after-header] [fixture:
gantt/lex-task-percent-only-line] [fixture:
gantt/lex-percent-brace-line-after-task] [fixture:
gantt/lex-percent-brace-empty-line] [fixture:
gantt/lex-percent-brace-non-word-line] [fixture:
gantt/lex-percent-brace-open-line] [fixture:
gantt/lex-percent-brace-after-unit-space] [fixture:
gantt/lex-percent-brace-line-text-after] [fixture:
gantt/lex-percent-brace-after-line-feed-space] [fixture:
gantt/lex-percent-brace-after-tab] [fixture:
gantt/lex-percent-brace-after-percent-comment-line] [fixture:
gantt/lex-percent-brace-after-call-line-feed] [fixture:
gantt/lex-percent-brace-after-href-space] [fixture:
gantt/lex-percent-brace-after-block-space] [fixture:
gantt/lex-single-percent-comment-blank-lines-then-task] [fixture:
gantt/lex-triple-percent-comment-line]

mermaid.js reads `%` in three ways, which differ from this rule where it
**reaches** a `%%{` that starts no directive **directly**, where a character
other than `}` and whitespace stands right before a `%` at a unit start, and
where a `%` comment that it reaches directly takes the line feeds after it (see
[Known divergences](#known-divergences)). mermaid.js reaches a `%` directly when
its lexer stands at the `%`: take the whitespace between the `%` and the last
character that the lexer read: the end of the last unit other than a `newline`
unit, whose line feeds count as that whitespace, the end of the last comment,
the last of the line feeds that a `%` comment reached directly took, or the one
whitespace character that leaves the click context; the `%` is reached directly
when that whitespace is empty, or has two or more characters of which, after its
leading line feeds, not exactly one remains; it is not reached directly when
that whitespace is one character, or when exactly one character remains after
its leading line feeds. The whitespace is that of the text without its
directives, which the lexer reads, so a line that holds only a directive leaves
its line feed: after `title T`, a line with a directive, and a line `%%{ }%%`,
two line feeds stand before the `%`, as after an empty line, and mermaid.js
rejects the input, while with one space before the `%%{ }%%` it is a comment in
both, and so with two directive lines or a directive line and an empty line,
which leave three line feeds; with a space or two before the directive, or two
spaces before the `%%{ }%%`, mermaid.js rejects it, and a directive on the line
of the `%%{ }%%`, or glued to the end of the line before it, leaves one line
feed, a comment in both. [fixture: gantt/div-percent-brace-after-directive-line]
[fixture: gantt/lex-percent-brace-after-directive-line-space] [fixture:
gantt/div-percent-brace-after-directive-line-two-spaces] [fixture:
gantt/div-percent-brace-after-indented-directive-line] [fixture:
gantt/div-percent-brace-after-directive-line-indented-two] [fixture:
gantt/div-percent-brace-after-indented-directive-line-space] [fixture:
gantt/div-percent-brace-after-two-directive-lines] [fixture:
gantt/lex-percent-brace-after-two-directive-lines-space] [fixture:
gantt/div-percent-brace-after-directive-line-blank-line] [fixture:
gantt/lex-percent-brace-after-directive-line-blank-line-space] [fixture:
gantt/lex-percent-brace-after-directive-same-line] [fixture:
gantt/lex-percent-brace-after-unit-glued-directive] So `gantt%%{ }%%`,
`inclusiveEndDates%%{ }%%`, `href "u"%%{ }%%`, `accDescr { d }%%{ }%%`,
`accDescr {}%%{ }%%`, `gantt%%{}`, `gantt%%{`, `%%{ }%%` after a line feed and
two spaces or two tabs, after a unit and two spaces or two tabs on its line,
after two line feeds, after a space and a line feed, after a line feed, a space,
and a line feed, or on the line after a `%` comment that directly follows the
header or an empty line are comments here and rejected by mermaid.js, while
`%%{ }%%` after one line feed, after a line feed and one space or a tab, after
two line feeds and one space, or after a unit and one space or one tab is a
comment in both. After a comment that mermaid.js did not reach directly, the
same holds: `inclusiveEndDates %c`, a line feed, and `%%{ }%%` is a comment in
both, while with an empty line between them, or with `%%c` and a line feed and
two spaces, mermaid.js rejects it. [fixture:
gantt/lex-percent-brace-after-space-percent-comment-line] [fixture:
gantt/div-percent-brace-after-space-percent-comment-blank-line] [fixture:
gantt/div-percent-brace-after-double-percent-comment-two-spaces] [fixture:
gantt/lex-percent-brace-after-two-line-feeds-and-space] [fixture:
gantt/div-percent-brace-after-line-feed-space-line-feed] [fixture:
gantt/div-percent-brace-glued-after-header] [fixture:
gantt/div-percent-brace-glued-after-keyword] [fixture:
gantt/div-percent-brace-glued-after-day] [fixture:
gantt/div-percent-brace-glued-after-string] [fixture:
gantt/div-percent-brace-glued-after-block] [fixture:
gantt/div-percent-brace-glued-after-empty-block] [fixture:
gantt/div-percent-brace-glued-empty-after-header] [fixture:
gantt/div-percent-brace-open-glued-after-header] [fixture:
gantt/div-percent-brace-after-two-spaces] [fixture:
gantt/div-percent-brace-after-blank-line] [fixture:
gantt/div-percent-brace-after-space-line-feed] [fixture:
gantt/div-percent-brace-after-line-feed-two-tabs] [fixture:
gantt/div-percent-brace-after-unit-two-spaces] [fixture:
gantt/div-percent-brace-after-unit-two-tabs] [fixture:
gantt/lex-percent-brace-line-after-task] [fixture:
gantt/lex-percent-brace-after-line-feed-space] [fixture:
gantt/lex-percent-brace-after-tab] [fixture:
gantt/lex-percent-brace-after-unit-space] [fixture:
gantt/lex-percent-brace-after-unit-tab] [fixture:
gantt/div-percent-brace-after-glued-percent-comment] [fixture:
gantt/div-percent-brace-after-percent-comment-blank-line] A `%` that does not
stand where a unit starts is a character of the unit that holds it, as rule 25
and rule 26 say, also right after the first character of the unit, where
mermaid.js reads the character and the rest of the line as one comment:
`a% : 1d` and `x% : 2d` after spaces are the tasks `a% ` and `x% ` here and a
comment with no task in mermaid.js; `t%itle T`, `a : 1d;%c`, `a : 1d#%c`,
`dateFormat X;%c`, and `"%c` after a URL string are rejected here, because
`t%itle T`, `;%c`, `#%c`, and `"%c` are task texts without data, and accepted by
mermaid.js; `a :%c` is the task `a ` with the end `%c` here and rejected by
mermaid.js, whose comment leaves the task text without data. `ab% : 1d` is the
task `ab% ` and `}%c : 1d` the task `}%c ` in both, and a space between a unit
and `%` makes both read a comment. [fixture:
gantt/div-comment-after-task-text-start] [fixture:
gantt/div-comment-after-keyword-start] [fixture:
gantt/div-comment-after-semicolon-after-data] [fixture:
gantt/div-comment-after-hash-after-data] [fixture:
gantt/div-comment-after-semicolon-after-setting] [fixture:
gantt/div-comment-after-indented-text-start] [fixture:
gantt/div-comment-after-quote-after-string] [fixture:
gantt/lex-comment-after-two-characters] [fixture:
gantt/lex-brace-before-percent] [fixture: gantt/lex-colon-then-percent]
[fixture: gantt/lex-space-then-percent-after-unit] [fixture:
gantt/lex-two-spaces-then-percent-after-unit] `click id1 %c`, a line feed, and
`href "u"`, where the one space leaves the click context and the `%` is reached
directly, `click id1 call f()%c`, a line feed, and `href "u"`, also with two
line feeds, and `click id1 href "u"%c`, a line feed, and `call f()` are rejected
here, because the comment ends at its line and the `newline` unit ends the click
statement, and accepted by mermaid.js, where a `%` comment reached directly
takes the line feeds after it; with a space before the `%` after a call part,
with two spaces after the click id, or with `%%`, the `%` is not reached
directly or its comment takes no line feed, and both reject them, and between
statements the line feeds that mermaid.js takes change nothing. [fixture:
gantt/lex-percent-comment-after-click-id-two-spaces-then-href-line] [fixture:
gantt/lex-percent-comment-glued-after-call-then-blank-line-then-title] [fixture:
gantt/div-percent-comment-takes-line-feed-after-click-id] [fixture:
gantt/div-percent-comment-takes-line-feed-after-call] [fixture:
gantt/div-percent-comment-takes-line-feeds-after-call] [fixture:
gantt/div-percent-comment-takes-line-feed-after-href] [fixture:
gantt/lex-space-percent-comment-after-call-then-href-line] [fixture:
gantt/lex-double-percent-comment-after-click-id-then-href-line] [fixture:
gantt/lex-percent-comment-glued-after-header-blank-line]

Inside the other units, `%` is a character of the text: a title text, a section
text, a setting text, task data, an accessibility title, a callback name,
callback arguments, a URL string, and a click id, where it is a character of the
id. A comment after a click id ends the line, and the click statement has no
part, so `click id1 %% c` is rejected; `click id1 %%{ }%%`, a line feed, and
`href "u"` is rejected in both for the same reason, and so is `a : 1d; %%{ }%%`,
whose `; ` is a task text without data. [fixture:
gantt/lex-percent-comment-in-title-text] [fixture:
gantt/lex-percent-comment-in-section-text] [fixture:
gantt/lex-percent-comment-in-setting-text] [fixture:
gantt/lex-percent-comment-in-task-data] [fixture:
gantt/lex-percent-comment-in-acc-title] [fixture:
gantt/lex-percent-in-callback-name] [fixture:
gantt/lex-percent-in-callback-arguments] [fixture:
gantt/lex-percent-in-href-string] [fixture: gantt/lex-percent-in-click-id]
[fixture: gantt/lex-percent-comment-after-click-id] [fixture:
gantt/lex-percent-brace-after-click-id-space] [fixture:
gantt/lex-percent-brace-glued-after-task-semicolon] [fixture:
gantt/lex-percent-comment-after-href] [fixture:
gantt/lex-percent-comment-after-call] [fixture:
gantt/lex-percent-brace-in-title-text] [fixture:
gantt/lex-percent-brace-in-task-data] [fixture:
gantt/lex-percent-brace-glued-in-title-text]

The documentation of mermaid.js says, under
[Comments](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/gantt.md#L319-L322),
that comments "need to be on their own line and must be prefaced with `%%`".

## Grammar

The grammar uses the notation of [common.md](../common.md#notation), over units
instead of characters. A unit name, such as `task-text`, stands for one unit
with that name, and text in double quotes stands for the unit named by that
text, such as `"title"` or `":"`. The grammar is a restatement of the grammar in
[`gantt.jison`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L107-L173)
and accepts the same sequences of units, except for the empty forms that
mermaid.js reads no token for (see
[Empty description blocks](#empty-description-blocks) and
[Empty hrefs and empty calls](#empty-hrefs-and-empty-calls)).

Each rule below makes a node of the tree, defined in
[ast/gantt.md](../ast/gantt.md):

| Rule                                                                                                                                                                                                                  | Node                                                                           |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `diagram`                                                                                                                                                                                                             | GanttDiagram                                                                   |
| `task-statement`                                                                                                                                                                                                      | GanttTaskStatement                                                             |
| `click-statement`                                                                                                                                                                                                     | GanttClickStatement                                                            |
| `call-part`                                                                                                                                                                                                           | GanttCallback                                                                  |
| `date-format-statement`                                                                                                                                                                                               | GanttDateFormatStatement                                                       |
| `axis-format-statement`                                                                                                                                                                                               | GanttAxisFormatStatement                                                       |
| `tick-interval-statement`                                                                                                                                                                                             | GanttTickIntervalStatement                                                     |
| `today-marker-statement`                                                                                                                                                                                              | GanttTodayMarkerStatement                                                      |
| `includes-statement`                                                                                                                                                                                                  | GanttIncludesStatement                                                         |
| `excludes-statement`                                                                                                                                                                                                  | GanttExcludesStatement                                                         |
| `inclusive-end-dates-statement`                                                                                                                                                                                       | GanttInclusiveEndDatesStatement                                                |
| `top-axis-statement`                                                                                                                                                                                                  | none: the input is rejected (see Rejections outside the grammar)               |
| `weekday-statement`                                                                                                                                                                                                   | GanttWeekdayStatement                                                          |
| `weekend-statement`                                                                                                                                                                                                   | GanttWeekendStatement                                                          |
| `title-statement`                                                                                                                                                                                                     | GanttTitleStatement                                                            |
| `section-statement`                                                                                                                                                                                                   | GanttSectionStatement                                                          |
| `accessibility-statement`                                                                                                                                                                                             | GanttAccTitleStatement, GanttAccDescrStatement, or GanttAccDescrBlockStatement |
| `empty-description-block`                                                                                                                                                                                             | GanttAccDescrBlockStatement without text, a statement of its own               |
| `url-text` with its `"` units                                                                                                                                                                                         | StringLiteral                                                                  |
| `id`, `list-item`, or a `data-item` that is a tag                                                                                                                                                                     | Identifier                                                                     |
| `setting-text`, `marker-text`, `title-text`, `section-text`, `task-text`, a `data-item` that is no tag, `callback-name`, `callback-arguments`, `acc-title-text`, `acc-description-text`, `acc-description-block-text` | GanttLiteral                                                                   |

### Diagram and statements

```text
diagram   = header line*
header    = "gantt"
line      = statement | newline
statement = task-statement
          | click-statement
          | date-format-statement
          | axis-format-statement
          | tick-interval-statement
          | today-marker-statement
          | includes-statement
          | excludes-statement
          | inclusive-end-dates-statement
          | top-axis-statement
          | weekday-statement
          | weekend-statement
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
`date` unit, the `accDescription` unit, and the `:` unit of rule 27 are taken by
no rule, so a line that starts with a date, an `accDescription` statement, and a
colon with nothing after it on its line make the input rejected. [fixture:
gantt/header-only] [fixture: gantt/gram-statements-same-line] [fixture:
gantt/gram-empty-lines-and-indentation] [fixture:
gantt/lex-task-line-feed-before-colon] [fixture:
gantt/gram-click-call-line-feed-href] [fixture: gantt/lex-date-line] [fixture:
gantt/lex-acc-description] [fixture: gantt/lex-task-colon-at-end]

### Tasks

```text
task-statement = task-text ":" data-item? ( "," data-item? )*
```

A task is a `task-text` unit, the **description**, and its **data**: a `:` unit
and the items of the data text, separated by `,` units. The `task-text` and the
`:` are adjacent units of one line; the data text has at least one character, so
`a :` with nothing after it on its line is no task (see
[The statement context](#the-statement-context)). The description is the text of
the `task-text` unit as written, the whitespace before the colon included, which
the Db keeps. [fixture: gantt/gram-task] [fixture:
gantt/gram-task-no-whitespace] [fixture: gantt/lex-task-text-trailing-spaces]
[fixture: gantt/db-task-description-spaces] [fixture:
gantt/lex-task-colon-at-end] [fixture: gantt/lex-task-text-only] [fixture:
gantt/lex-task-data-only]

The items are the stretches of the data text between the colon, the commas, and
the end of the line, each without the whitespace at its ends; a stretch of
whitespace only is an **empty item**, which has no unit and is a null element of
the task's items (see [GanttTaskStatement](../ast/gantt.md#gantttaskstatement)).
There is always one item more than there are commas: `a : ` has one empty item,
`a : ,` two, `a : 1d,` the item `1d` and an empty one, and `a : id1,, 1d` the
items `id1`, an empty one, and `1d`. [fixture:
gantt/lex-task-data-whitespace-only] [fixture: gantt/gram-task-empty-items]
[fixture: gantt/gram-task-empty-items-no-spaces] [fixture:
gantt/gram-task-trailing-comma] [fixture: gantt/gram-task-empty-middle-item]
[fixture: gantt/gram-task-empty-item-first]

mermaid.js reads the items as
[`parseData()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L536-L590)
does, and the tree shows the items as written; how mermaid.js reads them is in
the summary of the tests package. The **tags** are taken from the front
([`getTaskTags()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L885-L899)):
as long as the first remaining item is one of the words `active`, `done`,
`crit`, `milestone`, and `vert`, in exactly this case, it is a tag and sets its
flag, also when it repeats; an empty item, a word in another case, and two tag
words in one item are no tag and end the tags, and a tag word after another item
is an item. The items after the tags are the `items` of the task, each as
written: `after` and ids, `until` and an id, a date, a length, and an id with
spaces are each one item. An id need not be unique: two tasks may have the same
id. [fixture: gantt/gram-task-duplicate-id-click] [fixture:
gantt/gram-task-tag-then-item] [fixture: gantt/gram-task-two-tags] [fixture:
gantt/gram-task-tag-repeated] [fixture: gantt/gram-task-tag-with-spaces]
[fixture: gantt/gram-task-tag-tab] [fixture: gantt/gram-task-tag-nbsp] [fixture:
gantt/lex-task-tag-ideographic-space] [fixture: gantt/gram-task-tags-upper-case]
[fixture: gantt/gram-task-tag-mixed-case] [fixture:
gantt/gram-task-two-words-no-tag] [fixture: gantt/gram-task-tag-after-item]
[fixture: gantt/gram-task-tag-empty-then-tag] [fixture:
gantt/gram-task-empty-item-first] [fixture: gantt/gram-task-tag-then-empty-item]
[fixture: gantt/gram-task-tag-then-whitespace-item] [fixture:
gantt/gram-task-one-item] [fixture: gantt/gram-task-two-items] [fixture:
gantt/gram-task-three-items] [fixture: gantt/gram-task-four-items] [fixture:
gantt/gram-task-four-tags-then-items] [fixture: gantt/gram-task-after-ids]
[fixture: gantt/gram-task-until] [fixture: gantt/gram-task-id-with-spaces]
[fixture: gantt/gram-task-milestone] [fixture: gantt/gram-task-vert] [fixture:
gantt/gram-task-crit] [fixture: gantt/gram-task-active] Data of tags only, with
no item left, makes the input rejected (see
[Rejections outside the grammar](#rejections-outside-the-grammar)). [fixture:
gantt/gram-task-tags-only] [fixture: gantt/gram-task-tags-only-two]

The issue
[mermaid-js/mermaid#8188](https://github.com/mermaid-js/mermaid/issues/8188),
"Gantt: a task line with four or more metadata items throws an internal
TypeError instead of reporting a parse error", reports that mermaid.js accepts a
task with four or more items and fails when it draws the diagram; as of
2026-10-08 it is open, with the labels `Type: Bug / Error` and `Status: Triage`,
and no reply. The input is accepted, as the parser of mermaid.js accepts it. The
issue
[mermaid-js/mermaid#2886](https://github.com/mermaid-js/mermaid/issues/2886),
"Restrictions on Gantt Task Names", reports that a description that starts with
a keyword, such as `gantt` or `section`, is not read as a task; as of 2026-10-08
it is open, with the labels `Type: Bug / Error`, `Contributor needed`,
`Status: Pending`, and `Graph: Gantt`. Such a line is read as
[The statement context](#the-statement-context) says, a keyword inside a
description is text, and a word that is no keyword because of what follows it is
a description. [fixture: gantt/header-colon] [fixture:
gantt/lex-task-text-keyword-inside] [fixture: gantt/lex-title-colon-task]

### Click statements

```text
click-statement = "click" ( id | "," )+ ( call-part href-part? | href-part call-part? )
call-part       = "call" callback-name "(" callback-arguments? ")"
href-part       = "href" '"' url-text '"'
```

A click statement is `click`, its ids, and one or two parts, a call and a link,
in either order. The ids are the `id` and `,` units of the id text (see
[The click context](#the-click-context)): `click id1,id2 href "u"` has two ids,
`click id1, href "u"` the id `id1` and an empty id, `click , href "u"` two empty
ids, and `click id1,,id2` three, the middle one empty; an empty id is a null
element of the statement's ids (see
[GanttClickStatement](../ast/gantt.md#ganttclickstatement)). mermaid.js looks
each id up among the tasks read so far: an id that names no task, an empty id
included, and the id of a task that comes later get nothing, and no error.
[fixture: gantt/db-click-ids-list] [fixture: gantt/gram-click-ids-list]
[fixture: gantt/gram-click-ids-trailing-comma] [fixture:
gantt/gram-click-ids-comma-only] [fixture: gantt/gram-click-ids-two-commas]
[fixture: gantt/gram-click-unknown-id] [fixture: gantt/gram-click-before-task]
[fixture: gantt/gram-click-id-colon] [fixture: gantt/gram-click-id-quotes]
[fixture: gantt/gram-click-id-parentheses]

A call part is `call`, a `callback-name` unit, and the parentheses, with a
`callback-arguments` unit between them or not (see
[The callback contexts](#the-callback-contexts)): the name is as written, with
the whitespace and line feeds before the `(`, and the arguments are the text
between the parentheses as written, whitespace at its ends included, or nothing
when only whitespace lies between them. A link part is `href` and a string: the
`"` units and the `url-text` between them, as written, line feeds included. The
second part may follow the first directly or after whitespace, but not after a
`newline` unit: `click id1 call f()`, a line feed, and `href "u"` is rejected,
while the line feed right after the ids leaves the click context and is no
`newline` unit. A click statement has at most one call and one link, and nothing
else on its line after them but another statement or a comment: two call parts,
two link parts, three parts, text after a part, text between the ids and a part,
and `click` whose id text is `href` are rejected. [fixture:
gantt/gram-click-call] [fixture: gantt/gram-click-call-arguments] [fixture:
gantt/gram-click-call-blank-arguments] [fixture:
gantt/gram-click-call-arguments-leading-space] [fixture:
gantt/gram-click-call-arguments-quoted-comma] [fixture:
gantt/gram-click-call-arguments-line-feed] [fixture:
gantt/gram-click-call-name-space-before-parenthesis] [fixture:
gantt/gram-click-call-name-with-space] [fixture:
gantt/gram-click-call-upper-case] [fixture: gantt/gram-click-href] [fixture:
gantt/gram-click-href-line-feed-inside] [fixture:
gantt/gram-click-href-then-call] [fixture: gantt/gram-click-call-then-href]
[fixture: gantt/gram-click-call-line-feed-href] [fixture:
gantt/gram-click-id-line-feed-href] [fixture: gantt/gram-click-call-twice]
[fixture: gantt/gram-click-href-twice] [fixture: gantt/gram-click-three-parts]
[fixture: gantt/gram-click-href-then-text] [fixture:
gantt/gram-click-call-then-text] [fixture:
gantt/gram-click-text-between-id-and-href] [fixture:
gantt/gram-click-href-as-id] [fixture:
gantt/gram-click-href-then-task-same-line] [fixture:
gantt/gram-click-call-then-title-same-line] [fixture:
gantt/gram-click-call-then-line-feed-at-end]

Several click statements may name the same id, with the same part or another;
how mermaid.js reads the parts into its Db, under every `securityLevel`, is in
the summary of the tests package. [fixture:
gantt/gram-click-two-statements-same-id] [fixture:
gantt/gram-click-href-replaced] [fixture: gantt/db-click-links-order] [fixture:
gantt/gram-click-security-level-strict] [fixture:
gantt/config-security-level-loose-click-call] [fixture:
gantt/config-security-level-strict-click-href]

The documentation of mermaid.js describes the two parts under
[Interaction](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/docs/syntax/gantt.md#L450-L458).

### Settings

```text
date-format-statement         = "dateFormat" setting-text
axis-format-statement         = "axisFormat" setting-text
tick-interval-statement       = "tickInterval" setting-text
today-marker-statement        = "todayMarker" marker-text
includes-statement            = "includes" ( list-item | "," )*
excludes-statement            = "excludes" ( list-item | "," )*
inclusive-end-dates-statement = "inclusiveEndDates"
top-axis-statement            = "topAxis"
weekday-statement             = "weekday" day
weekend-statement             = "weekend" day
```

The value of `dateFormat`, `axisFormat`, `tickInterval`, and `todayMarker` is
the text of their `setting-text` or `marker-text` unit as written, the
whitespace at its ends included. The items of `includes` and `excludes` are the
`list-item` units of their list text, as written, and there may be none. The day
of `weekday` and `weekend` is that of their `day` unit, in lower case whatever
its case in the text. Each of these statements may be written more than once;
how mermaid.js reads them into its Db is in the summary of the tests package.
[fixture: gantt/db-date-format] [fixture: gantt/db-date-format-extra-spaces]
[fixture: gantt/lex-dateformat-trailing-spaces] [fixture:
gantt/db-date-format-last-wins] [fixture: gantt/db-axis-format] [fixture:
gantt/db-tick-interval] [fixture: gantt/db-today-marker] [fixture:
gantt/db-today-marker-off] [fixture: gantt/db-includes-tokens] [fixture:
gantt/db-excludes-tokens] [fixture: gantt/db-excludes-merged-lines] [fixture:
gantt/db-excludes-duplicates] [fixture: gantt/lex-excludes-upper-case-items]
[fixture: gantt/lex-excludes-empty-items] [fixture:
gantt/db-inclusive-end-dates] [fixture: gantt/db-weekday-last-wins] [fixture:
gantt/lex-day-mixed-case] [fixture: gantt/db-weekend-friday] [fixture:
gantt/db-weekend-saturday] A `top-axis-statement` makes the input rejected (see
[Rejections outside the grammar](#rejections-outside-the-grammar)).

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
package. [fixture: gantt/db-title-statement] [fixture:
gantt/db-title-frontmatter] [fixture:
gantt/db-title-statement-after-frontmatter] [fixture: gantt/lex-title-twice]
[fixture: gantt/lex-title-two-spaces] [fixture: gantt/lex-title-trailing-spaces]
[fixture: gantt/db-sections] [fixture: gantt/lex-section-twice] [fixture:
gantt/lex-section-two-spaces] [fixture: gantt/db-task-before-section]

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
more than once, as a line or as a block. [fixture: gantt/gram-acc-title]
[fixture: gantt/gram-acc-title-trailing-spaces] [fixture: gantt/gram-acc-descr]
[fixture: gantt/gram-acc-descr-block] [fixture:
gantt/gram-acc-descr-block-multiline] [fixture:
gantt/gram-acc-descr-block-brace-inside] [fixture:
gantt/gram-acc-descr-colon-then-block-same-line] [fixture:
gantt/gram-acc-descr-twice] [fixture: gantt/db-acc-title] [fixture:
gantt/db-acc-descr] [fixture: gantt/db-acc-descr-block]

### Empty description blocks

```text
empty-description-block = "accDescr" "{" "}"
```

An `empty-description-block` is an `accDescr` unit and a `{` unit followed
directly by a `}` unit, with no `acc-description-block-text` unit:
`accDescr {}`, `accDescr { }`, and a block of whitespace or empty lines only.
mermaid.js reads no token for it (see
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md)). It is a
description block statement without text, which changes nothing, wherever a
statement starts: on a line of its own, right after the header, right after
another statement on the same line, also after a complete click statement, and
before a statement on the same line; two blocks on one line are two statements.
Inside a title text, a section text, a setting text, a task text, task data, a
callback name, callback arguments, or a URL string, `accDescr {}` is text, and
between `weekday` and its day the input is rejected in both, because no weekday
statement is read. [fixture: gantt/gram-acc-descr-block-empty] [fixture:
gantt/gram-acc-descr-block-empty-then-title] [fixture:
gantt/gram-acc-descr-block-whitespace-only] [fixture:
gantt/gram-empty-description-block-after-header] [fixture:
gantt/gram-empty-description-block-after-click-statement] [fixture:
gantt/gram-empty-description-block-before-task-same-line] [fixture:
gantt/gram-empty-description-blocks-adjacent] [fixture:
gantt/gram-empty-description-block-in-title-text] [fixture:
gantt/gram-empty-description-block-in-setting-text] [fixture:
gantt/gram-empty-description-block-in-task-text] [fixture:
gantt/gram-empty-description-block-in-task-data] [fixture:
gantt/gram-empty-description-block-in-callback-name] [fixture:
gantt/gram-empty-description-block-in-callback-arguments] [fixture:
gantt/gram-empty-description-block-in-href-string] [fixture:
gantt/lex-empty-description-block-between-weekday-and-day] [fixture:
gantt/gram-empty-description-block-then-percent-glued]

A block lies inside a statement instead, and the input is rejected, between the
ids of a click statement and its first part, and between its two parts:
`click id1 accDescr {} href "u"`, also glued, `click id1 call f() accDescr {}`
`href "u"`, and `click id1 href "u" accDescr {} call f()`. mermaid.js accepts
them as without the block: the known divergence
[`tokenless-empty-forms`](#known-divergences). [fixture:
gantt/div-empty-description-block-between-click-id-and-href] [fixture:
gantt/div-empty-description-block-glued-after-click-id] [fixture:
gantt/div-empty-description-block-between-call-and-href] [fixture:
gantt/div-empty-description-block-between-href-and-call]

### Empty hrefs and empty calls

An **empty href** is an `href` unit and two `"` units with nothing between them,
and an **empty call** is a `call` unit, a `(` unit, and a `)` unit with only
whitespace between the parentheses, a line feed included (see
[The href context](#the-href-context) and
[The callback contexts](#the-callback-contexts)). mermaid.js reads no token for
either, and accepts an input as if it were not there (see
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md)). No rule
of the grammar takes them, wherever they stand, so an input with an empty href
or an empty call is rejected here, as the known divergence
[`tokenless-empty-forms`](#known-divergences): on a line of its own, at the end
of the text, right after the header, after another statement on its line, a
complete click statement included, before a statement on its line, glued to it
or not, and inside a click statement, between the ids and the first part or
between the parts. mermaid.js accepts each of these as without the form:
`href ""` on a line before `title T` has the title, `call ()x : 1d` is the task
`x `, `click id1 href "" call f()` sets the call, and
`click id1 call () href "u"` the link. `click id1` followed only by `href ""` or
`call ()`, and `click id1 href "" b : 1d`, are rejected in both, because the
click statement has no part. Two empty hrefs or empty calls in a row are
rejected at the first of them, `href "" call ()` at the href. An empty
description block before them where a statement starts is a statement, and the
empty href or empty call after it is what is rejected, `accDescr {} href ""` at
the href; inside a click statement, where the block is no statement, the first
of the forms is rejected. [fixture: gantt/gram-empty-href-line] [fixture:
gantt/gram-empty-call-line] [fixture: gantt/gram-empty-call-space-inside]
[fixture: gantt/gram-empty-call-line-feed-inside] [fixture:
gantt/gram-empty-href-at-end] [fixture: gantt/gram-empty-call-at-end] [fixture:
gantt/gram-empty-href-after-header-same-line] [fixture:
gantt/gram-empty-href-after-keyword-same-line] [fixture:
gantt/gram-click-href-then-empty-href] [fixture:
gantt/gram-click-call-then-empty-href] [fixture:
gantt/gram-click-call-then-empty-call] [fixture:
gantt/gram-empty-href-then-title-same-line] [fixture:
gantt/gram-empty-call-then-title-same-line] [fixture:
gantt/gram-empty-href-glued-task] [fixture: gantt/gram-empty-call-glued-task]
[fixture: gantt/gram-empty-call-tab] [fixture: gantt/gram-empty-href-two-spaces]
[fixture: gantt/div-empty-href-before-call] [fixture:
gantt/div-empty-href-glued-before-href] [fixture:
gantt/div-empty-call-before-href] [fixture:
gantt/div-empty-href-between-call-and-href] [fixture:
gantt/div-empty-call-between-href-and-call] [fixture:
gantt/div-empty-href-between-href-and-call] [fixture:
gantt/div-empty-href-and-empty-call-before-href] [fixture:
gantt/div-empty-href-and-empty-call-between-parts] [fixture:
gantt/div-empty-description-block-and-empty-href-between-parts] [fixture:
gantt/gram-empty-href-and-empty-call-line] [fixture:
gantt/gram-empty-description-block-then-empty-href-same-line] [fixture:
gantt/gram-empty-description-block-then-empty-call-same-line] [fixture:
gantt/gram-empty-href-then-empty-description-block-same-line] [fixture:
gantt/div-empty-call-and-empty-description-block-between-parts] [fixture:
gantt/gram-click-empty-href-only] [fixture: gantt/gram-click-empty-call-only]
[fixture: gantt/gram-click-empty-href-then-task]

The empty forms are rejected, unlike an empty description block where a
statement starts (see [Empty description blocks](#empty-description-blocks)),
because they are written as a link and a call that mermaid.js discards whole,
and a tree that held them as statements that change nothing would show them as
read; the other diagram types reject the same forms (see
[tokenless-empty-forms](../known-divergences/tokenless-empty-forms.md)).
`call()` and `href""` without whitespace after the keyword are task texts, and
`href "`, a line feed, and `"` is no empty href. A directive between the two
quotes of an empty href, or between the parentheses of an empty call, lies
between units, so `href "%%{init: {}}%%"` and `call (%%{init: {}}%%)` are an
empty href and an empty call, as mermaid.js reads them once it has removed the
directive, and are rejected in the same way. [fixture:
gantt/lex-call-no-space-before-parenthesis] [fixture:
gantt/lex-href-no-space-before-quotes] [fixture: gantt/lex-href-line-feed-url]
[fixture: gantt/lex-empty-href-directive-between-quotes] [fixture:
gantt/lex-empty-call-directive-between-parentheses] [fixture:
gantt/div-empty-href-directive-between-quotes-before-call]

### Rejections outside the grammar

Two inputs that the grammar of mermaid.js accepts are rejected by its Db, and
are rejected here:

- A `top-axis-statement`: the grammar calls
  [`yy.TopAxis()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L141-L141),
  which the Db does not have, so every text with a `topAxis` statement is
  rejected with a `TypeError`, whatever else it holds. [fixture:
  gantt/db-top-axis-statement] [fixture: gantt/lex-topaxis-upper-case] [fixture:
  gantt/lex-topaxis-then-title]
- A task whose data holds tags only: after the tags are taken,
  [`getTaskTags()`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L885-L899)
  reads the first item of an empty list, and the text is rejected with a
  `TypeError`. [fixture: gantt/gram-task-tags-only] [fixture:
  gantt/gram-task-tags-only-two]

The Db throws for no other input. In particular, a start that is no date, a
start after an id that is no task, an end until an id that is no task, and a
task with four or more items are accepted: the Db computes the dates when the
diagram is drawn, not while the text is parsed (see the summary of the tests
package). [fixture: gantt/db-task-start-not-a-date] [fixture:
gantt/db-task-start-after-unknown] [fixture: gantt/db-task-end-until-unknown]
[fixture: gantt/gram-task-four-items]

## Known divergences

- **[`directive-as-token-boundary`](../known-divergences/directive-as-token-boundary.md).**
  A directive inside a unit other than a text unit and a string unit makes the
  input rejected in this specification, while mermaid.js accepts it (see
  [Directives inside units](#directives-inside-units)): inside a click id, a
  list item of `includes` or `excludes`, or a keyword, the header, a day name,
  `click`, `href`, `call`, `accTitle`, and `accDescr` included. [fixture:
  gantt/div-directive-in-click-id] [fixture: gantt/div-directive-in-list-item]
  [fixture: gantt/div-directive-in-header-keyword] [fixture:
  gantt/div-directive-in-title-keyword] [fixture:
  gantt/div-directive-in-day-keyword] [fixture:
  gantt/div-directive-in-click-keyword] [fixture:
  gantt/div-directive-in-href-keyword] [fixture:
  gantt/div-directive-in-call-keyword] [fixture:
  gantt/div-directive-in-acc-title-keyword]
- **[`ignored-semicolon-as-token-boundary`](../known-divergences/ignored-semicolon-as-token-boundary.md).**
  On a line that matches the `style` rule, an ignored `;` inside a unit other
  than a text unit and a string unit makes the input rejected here, while
  mermaid.js removes the `;` and reads the parts as one. The `style`, the `:`,
  and the `#` that the rule looks for may lie anywhere before the `;` on the
  line, in a URL string or callback arguments of the same click statement, in a
  description block before the statement on its line, or in the click ids
  themselves: `click style:#y,id;1 href "u"` sets the link of `id1` in
  mermaid.js, `click id1 href "style:#x" ca;ll f()` sets the call,
  `click id1 call f(style:#x) hr;ef "u"` the link, and after
  `accDescr { style:#x }` on the same line `cl;ick id1 href "u"`,
  `weekday mon;day`, `inclusiveEnd;Dates`, `date;Format X`, `ti;tle T`, and
  `excludes week;ends` are read as the statements without the `;`. Inside a text
  unit or a string unit, and between two units, the reading of mermaid.js is
  kept (see [Trivia between units](#directives-inside-units)). [fixture:
  gantt/div-ignored-semicolon-in-click-id] [fixture:
  gantt/div-ignored-semicolon-in-call-keyword] [fixture:
  gantt/div-ignored-semicolon-in-href-keyword] [fixture:
  gantt/div-ignored-semicolon-in-click-keyword] [fixture:
  gantt/div-ignored-semicolon-in-day-keyword] [fixture:
  gantt/div-ignored-semicolon-in-inclusive-keyword] [fixture:
  gantt/div-ignored-semicolon-in-dateformat-keyword] [fixture:
  gantt/div-ignored-semicolon-in-title-keyword] [fixture:
  gantt/div-ignored-semicolon-in-list-item] [fixture:
  gantt/tokens-ignored-semicolon-in-title-text] [fixture:
  gantt/tokens-ignored-semicolon-in-href-string] [fixture:
  gantt/tokens-ignored-semicolon-between-keyword-and-text]
- **[`html-tag-in-frontmatter`](../known-divergences/html-tag-in-frontmatter.md).**
  With `title: <a` in the frontmatter, `click id1 href "u="v">w"` has the URL
  `u='v'>w` in mermaid.js, while here the string ends at its second `"`, and the
  input is rejected; without the frontmatter both reject it. [fixture:
  gantt/div-html-tag-starts-in-frontmatter-href] [fixture:
  gantt/lex-html-tag-quotes-no-frontmatter]
- **[`embedded-data-opaque`](../known-divergences/embedded-data-opaque.md).** A
  frontmatter that is no valid YAML is accepted in this specification, while
  mermaid.js rejects it. [fixture: gantt/div-frontmatter-invalid-yaml]
- **[`tokenless-empty-forms`](../known-divergences/tokenless-empty-forms.md).**
  An empty description block inside a click statement, between its ids and its
  first part or between its parts, and an empty href or an empty call wherever
  it stands, make the input rejected in this specification, while mermaid.js
  reads no token for them and accepts the input (see
  [Empty description blocks](#empty-description-blocks) and
  [Empty hrefs and empty calls](#empty-hrefs-and-empty-calls)). Where a
  statement starts, an empty description block is a statement, and the input is
  accepted. [fixture:
  gantt/div-empty-description-block-between-click-id-and-href] [fixture:
  gantt/div-empty-description-block-between-call-and-href] [fixture:
  gantt/div-empty-description-block-between-href-and-call] [fixture:
  gantt/div-empty-description-block-glued-after-click-id] [fixture:
  gantt/div-empty-href-before-call] [fixture:
  gantt/div-empty-href-glued-before-href] [fixture:
  gantt/div-empty-call-before-href] [fixture:
  gantt/div-empty-href-between-call-and-href] [fixture:
  gantt/div-empty-call-between-href-and-call] [fixture:
  gantt/gram-acc-descr-block-empty] [fixture: gantt/gram-empty-href-line]
  [fixture: gantt/gram-empty-call-line]
- **[`comment-takes-character`](../known-divergences/comment-takes-character.md).**
  A `%` right after the first character of a unit, a character other than `}`
  and whitespace, is read here as [Comments](#comments) says: a comment starts
  only where a unit starts, so the `%` is a character of the unit. mermaid.js
  reads the character and the rest of the line as one comment. The difference
  goes both ways: `a% : 1d` is a task here and no task in mermaid.js;
  `t%itle T`, `a : 1d;%c`, `a : 1d#%c`, and `dateFormat X;%c` are rejected here
  and accepted by mermaid.js; `a :%c` is a task here and rejected by mermaid.js.
  [fixture: gantt/lex-colon-then-percent] [fixture:
  gantt/div-comment-after-task-text-start] [fixture:
  gantt/div-comment-after-keyword-start] [fixture:
  gantt/div-comment-after-semicolon-after-data] [fixture:
  gantt/div-comment-after-hash-after-data] [fixture:
  gantt/div-comment-after-semicolon-after-setting] [fixture:
  gantt/div-comment-after-indented-text-start] [fixture:
  gantt/div-comment-after-quote-after-string]
- **[`comment-takes-line-break`](../known-divergences/comment-takes-line-break.md).**
  A comment with the mark `%` that mermaid.js reaches directly (see
  [Comments](#comments)) takes the line feeds after it in mermaid.js, so a part
  of a click statement on the next line continues the statement: `click id1 %c`,
  a line feed, and `href "u"` sets the link there, and so does
  `click id1 call f()%c`, a line feed, and `href "u"`. Here the comment ends at
  its line, and the `newline` unit ends the statement, so the input is rejected
  (see [Comments](#comments)). The difference goes one way: mermaid.js accepts,
  and this specification rejects. [fixture:
  gantt/div-percent-comment-takes-line-feed-after-click-id] [fixture:
  gantt/div-percent-comment-takes-line-feed-after-call] [fixture:
  gantt/div-percent-comment-takes-line-feeds-after-call] [fixture:
  gantt/div-percent-comment-takes-line-feed-after-href]
- **[`percent-brace-after-unit`](../known-divergences/percent-brace-after-unit.md).**
  A `%%{` that starts no directive is a comment here wherever a unit starts (see
  [Comments](#comments)), while mermaid.js rejects the input where it reaches
  the `%%{` directly, as [Comments](#comments) defines it: right after a unit,
  after whitespace of two or more characters that leaves not exactly one
  character after its leading line feeds, or after the line feeds that a `%`
  comment reached directly takes. The difference goes one way: this
  specification accepts, and mermaid.js rejects. [fixture:
  gantt/div-percent-brace-glued-after-header] [fixture:
  gantt/div-percent-brace-glued-after-keyword] [fixture:
  gantt/div-percent-brace-glued-after-string] [fixture:
  gantt/div-percent-brace-after-two-spaces] [fixture:
  gantt/div-percent-brace-after-blank-line] [fixture:
  gantt/div-percent-brace-after-glued-percent-comment] [fixture:
  gantt/div-percent-brace-after-unit-two-spaces]
- **[`c4-keyword-anywhere`](../known-divergences/c4-keyword-anywhere.md).**
  `C4Container`, `C4Component`, `C4Dynamic`, or `C4Deployment` anywhere after
  the header, in a task text, a title, a section, or task data, makes mermaid.js
  hand the text to the C4 parser, which rejects it; here the text is a gantt
  diagram. `C4Context` is text in both. [fixture:
  gantt/div-c4-keyword-in-task-text] [fixture: gantt/div-c4-keyword-in-title]
  [fixture: gantt/div-c4-keyword-in-section] [fixture:
  gantt/div-c4-keyword-in-task-data] [fixture: gantt/lex-c4context-in-title]
- **[`bare-percent-line-before-header`](../known-divergences/bare-percent-line-before-header.md).**
  A line of `%%` alone, a line `%%{ }%%`, which is no directive, and a line of
  whitespace only after such a line, before the header, are a comment or nothing
  here, while mermaid.js rejects the input, because its lexer reads the line
  feed after the `%%` as a `newline` unit before the header (see
  [Detection](#detection)). [fixture: gantt/header-after-bare-percent-line]
  [fixture: gantt/header-after-empty-braces-line] [fixture:
  gantt/header-after-bare-percent-line-and-whitespace-line]
