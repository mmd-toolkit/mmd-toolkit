# Building the journey Db from the tree

Japanese version: [journey.ja.md](./journey.ja.md)

The steps that build the Db summary of a journey diagram from its tree, which
`src/db-from-tree/journey.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/journey.md](../../../spec/docs/diagrams/journey.md) and
[ast/journey.md](../../../spec/docs/ast/journey.md); the fields of the summary
are in [db-summaries.md](../db-summaries.md#journey).

mermaid.js builds the Db while it parses: the grammar calls a method of the Db
for each statement as the statement ends
([`statement`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/user-journey/parser/journey.jison#L60-L67)),
and the Db keeps what the methods are given
([`addTask`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L61-L84),
[`addSection`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/user-journey/journeyDb.js#L26-L29),
[`setDiagramTitle`, `setAccTitle`, and `setAccDescription`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)).
The summary is built the same way: the statements are executed in source order,
and the lists the Db holds are the summary. Values are kept as the Db holds
them, whitespace included. The summary reads the list of tasks once (see
[db-summaries.md](../db-summaries.md#journey)), so each task of the tree is one
task of the summary.

## Building the summary from the tree

**Converted form.** Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, in a description as in every other text: `a#amp; b: 5` is the
task whose description is `a`, the placeholder, and ` b`, and the same holds in
a title, a section name, a person, and the accessibility texts. The same form
has each line terminator, `\r\n` and a lone `\r` too, as `\n`, in a description
block, and each attribute quote as `'`, in a title and in a description. The
line terminator that ends a title or a section name is no part of its text,
whichever it is: `title T` followed by CRLF or a lone CR is the title `T`.
[fixture: journey/entity-placeholder-in-task-text] [fixture:
journey/entity-placeholder-in-title] [fixture:
journey/entity-placeholder-in-section] [fixture:
journey/entity-placeholder-in-person] [fixture:
journey/entity-placeholder-in-acc-title] [fixture:
journey/entity-placeholder-in-acc-descr] [fixture:
journey/entity-placeholder-in-acc-descr-block] [fixture:
journey/db-acc-descr-block-crlf] [fixture: journey/db-acc-descr-block-lone-cr]
[fixture: journey/lex-title-cr-value] [fixture: journey/lex-title-crlf-value]
[fixture: journey/lex-section-cr-value] [fixture:
journey/lex-section-crlf-value] [fixture: journey/lex-html-tag-in-title]
[fixture: journey/lex-html-tag-in-task-text]

**Texts.** The text of a leaf node of the tree is read as follows.

- A JourneyLiteral has the converted form of its range. Its `value` is the
  written text, which the tree keeps, and the Db has the text as mermaid.js
  reads it.
- A directive inside a text unit is not in the converted form, and so not in the
  text: `a%%{init: {}}%%b: 5` is the task `ab`, `title a%%{init: {}}%%b` has the
  title `ab`, and `A: 1%%{init: {}}%%0` has the score `10`. A comment line
  inside a description block is not either. [fixture:
  journey/lex-directive-in-task-text] [fixture: journey/lex-directive-in-score]
  [fixture: journey/lex-directive-in-person] [fixture:
  journey/lex-directive-in-title-text] [fixture:
  journey/lex-directive-in-section-text] [fixture:
  journey/lex-directive-in-acc-title] [fixture:
  journey/lex-directive-in-acc-descr-block] [fixture:
  journey/tokens-comment-line-in-acc-block]
- A `;` that the line rule ignores is not in the converted form either, inside a
  text: a description, a score, a person, a title, a section name, and an
  accessibility text hold the text without it. [fixture:
  journey/tokens-ignored-semicolon-in-task-text] [fixture:
  journey/tokens-ignored-semicolon-in-score] [fixture:
  journey/tokens-ignored-semicolon-in-person] [fixture:
  journey/tokens-ignored-semicolon-in-title-text] [fixture:
  journey/tokens-ignored-semicolon-in-section-text] [fixture:
  journey/tokens-ignored-semicolon-in-acc-title] [fixture:
  journey/tokens-ignored-semicolon-in-acc-descr] [fixture:
  journey/tokens-ignored-semicolon-in-acc-block]
- The whitespace at the ends of a text stays as the tree has it: the text of a
  description keeps the whitespace before its colon, and a title and a section
  name keep the whitespace at their ends, a name of whitespace only included,
  also where a directive that ends the line follows it. [fixture:
  journey/db-task-description-spaces] [fixture:
  journey/lex-whitespace-ideographic-space-around-task] [fixture:
  journey/lex-title-two-spaces] [fixture: journey/lex-title-trailing-spaces]
  [fixture: journey/lex-title-whitespace-only] [fixture:
  journey/lex-section-two-spaces] [fixture: journey/db-sections] [fixture:
  journey/lex-section-whitespace-only] [fixture:
  journey/lex-directive-at-end-of-title-line] [fixture:
  journey/lex-directive-at-end-of-section-line]
- A person and an accessibility text are the converted form of their range
  without the whitespace at its ends, as mermaid.js trims them, also when a
  directive lies next to that whitespace. [fixture:
  journey/gram-task-people-nbsp-trimmed] [fixture:
  journey/lex-directive-after-person] [fixture:
  journey/gram-acc-title-trailing-spaces] [fixture:
  journey/lex-acc-title-spaces-around-colon] [fixture:
  journey/lex-directive-after-acc-title-text]

**The walk.** The statements of the body are executed in source order, and a
statement changes the Db at the point where it stands. A task refers to the
sections before it (see **Tasks**). An empty description block, a
JourneyAccDescrBlockStatement without text, changes nothing; the statements
around it are executed as if it were not there. [fixture:
journey/gram-acc-descr-block-empty] [fixture:
journey/gram-acc-descr-block-whitespace-only] [fixture:
journey/gram-empty-description-block-after-block] [fixture:
journey/gram-empty-description-block-before-task-same-line] [fixture:
journey/gram-empty-description-blocks-adjacent]

**Defaults.** Without a statement, the Db has the empty text for the title (the
title of the frontmatter, if there is one), `accTitle`, and `accDescr`, and no
section and no task. [fixture: journey/header-only] [fixture:
journey/db-title-frontmatter]

**Titles and sections.** The title is that of the frontmatter, until a `title`
statement replaces it with the text of its value, as written, whitespace at its
ends included, and then the last one wins; the title has the replacement of
characters (see below). A `section` statement appends the text of its name, as
written, to `sections`, also when it repeats. [fixture:
journey/db-title-frontmatter] [fixture: journey/db-title-statement] [fixture:
journey/db-title-statement-after-frontmatter] [fixture: journey/lex-title-twice]
[fixture: journey/db-sections] [fixture: journey/db-section-ends-at-hash]

**Tasks.** A task statement appends one task to the tasks, with `section`,
`task`, `people`, and `score`. These values come from the statement and from the
sections before it.

- `task` is the text of the description, as written. `section` is the name of
  the last `section` statement before the task, as written, or the empty text.
  [fixture: journey/db-task-description-spaces] [fixture:
  journey/db-task-before-section] [fixture: journey/db-section-ends-at-hash]
  [fixture: journey/docs-intro-examples-e978837a]
- `score` is `0` when the statement has no score. Otherwise it is the number
  that JavaScript makes of the text of the score, so `3.5`, `-2`, `1e2`, and
  `0x10` are numbers. A score that is no finite number is the text of the
  number, since JSON has no such number: `NaN` for a text that is no number,
  such as `abc` and `5, 6`, and `Infinity` and `-Infinity` for the texts
  `Infinity` and `-Infinity` and for a number too large for a double, such as
  `1e400`. [fixture: journey/db-task-score-only] [fixture:
  journey/db-task-score-decimal] [fixture: journey/db-task-score-negative]
  [fixture: journey/db-task-score-exponent] [fixture:
  journey/db-task-score-hexadecimal] [fixture:
  journey/db-task-score-not-a-number] [fixture: journey/gram-task-score-comma]
  [fixture: journey/db-task-score-infinity] [fixture:
  journey/db-task-score-negative-infinity] [fixture:
  journey/db-task-score-overflow] [fixture: journey/db-task-score-spaces]
  [fixture: journey/lex-task-score-nbsp-trimmed] [fixture:
  journey/db-task-score-empty] [fixture: journey/gram-task-data-whitespace-only]
- `people` has one name for each element of the `people` of the statement: the
  text of a person, or the empty text for a null element. A statement without a
  second colon has no people. [fixture: journey/db-task-people] [fixture:
  journey/db-task-people-empty-item] [fixture: journey/db-task-people-blank]
  [fixture: journey/gram-task-second-colon-at-end] [fixture:
  journey/gram-task-people-trailing-comma] [fixture: journey/db-task-score-only]
- The text from the third colon of the data, the `textAfter` of the tree, is not
  in the Db. [fixture: journey/db-task-extra-colon] [fixture:
  journey/gram-task-third-colon-at-end] [fixture: journey/gram-task-four-colons]

**Accessibility.** `accTitle` is the text of the last `accTitle` statement, with
the replacement of characters, or the empty text. `accDescr` is the text of the
last `accDescr` statement or description block with text, with each line feed,
together with the whitespace that follows it, line feeds included, replaced by
one line feed, and then with the replacement of characters; the whitespace
before a line feed stays. A description block without text changes nothing. The
text may start on a later line: `accTitle:` followed by a line `A` gives the
title `A`. [fixture: journey/db-acc-title] [fixture:
journey/lex-acc-title-twice] [fixture:
journey/gram-acc-title-line-feed-then-text] [fixture:
journey/gram-acc-title-blank-lines-then-text] [fixture: journey/db-acc-descr]
[fixture: journey/gram-acc-descr-twice] [fixture:
journey/gram-acc-descr-block-then-line] [fixture:
journey/gram-acc-descr-colon-then-block-same-line] [fixture:
journey/db-acc-descr-block] [fixture: journey/db-acc-descr-block-blank-line]
[fixture: journey/db-acc-descr-block-spaces-before-line-feed]

**The summary.** The summary has the fields of
[db-summaries.md](../db-summaries.md#journey): the values above, `sections` as
the section names in the order of the statements, and `tasks` in source order.

## The replacement of characters

The Db passes three texts through `sanitizeText`: the title, `accTitle`, and
`accDescr`. `journeyDbOf()` applies the replacement
`textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text: descriptions, scores, people, and section names are as
written. The title is replaced whether it comes from the frontmatter or from a
`title` statement; the `accDescr` is replaced after its lines are joined, and a
block is replaced like a line. [fixture:
journey/config-security-level-other-title] [fixture:
journey/config-security-level-other-diagram-title] [fixture:
journey/config-security-level-other-acc-title] [fixture:
journey/config-security-level-other-acc-descr] [fixture:
journey/config-security-level-other-acc-descr-block] [fixture:
journey/config-security-level-other-html-labels-false] [fixture:
journey/config-security-level-other-names-as-written]
