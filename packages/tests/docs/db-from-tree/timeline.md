# Building the timeline Db from the tree

Japanese version: [timeline.ja.md](./timeline.ja.md)

The steps that build the Db summary of a timeline diagram from its tree, which
`src/db-from-tree/timeline.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/timeline.md](../../../spec/docs/diagrams/timeline.md) and
[ast/timeline.md](../../../spec/docs/ast/timeline.md); the fields of the summary
are in [db-summaries.md](../db-summaries.md#timeline).

mermaid.js builds the Db while it parses: the grammar calls a method of the Db
for each statement as the statement ends
([`statement`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/parser/timeline.jison#L71-L85)),
and the Db keeps what the methods are given
([`setDirection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L21-L23),
[`addSection`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L29-L32),
[`addTask`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L52-L63),
[`addEvent`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/timeline/timelineDb.js#L65-L70),
[`setDiagramTitle`, `setAccTitle`, and `setAccDescription`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/common/commonDb.ts#L16-L30)).
The summary is built the same way: the statements are executed in source order,
and the lists the Db holds are the summary. Values are kept as the Db holds
them, whitespace included. The summary reads the list of tasks once (see
[db-summaries.md](../db-summaries.md#timeline)), so each period of the tree is
one task of the summary.

## Building the summary from the tree

**Converted form.** Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, in a period as in every other text: `a#35; b : c#35; d` is the
task whose period is `a`, the placeholder, and `b`, with the event `c`, the
placeholder, and ` d`, and the same holds in a title, a section name, and the
accessibility texts. The same form has each line terminator, `\r\n` and a lone
`\r` too, as `\n`, in a description block and as the whitespace character after
`title`, and each attribute quote as `'`, in a title and in a period. [fixture:
timeline/db-event-entity] [fixture: timeline/db-event-entity-named] [fixture:
timeline/db-title-entity] [fixture: timeline/db-section-entity] [fixture:
timeline/db-acc-title-entity] [fixture: timeline/db-acc-descr-entity] [fixture:
timeline/db-acc-descr-block-entity] [fixture: timeline/db-crlf-line-ends]
[fixture: timeline/db-lone-cr-line-ends] [fixture:
timeline/lex-title-separator-carriage-return] [fixture:
timeline/lex-html-tag-in-title] [fixture: timeline/lex-html-tag-in-period]

**Texts.** The text of a leaf node of the tree is read as follows.

- A TimelineLiteral has the converted form of its range. Its `value` is the
  written text, which the tree keeps, and the Db has the text as mermaid.js
  reads it.
- A directive inside a text unit is not in the converted form, and so not in the
  text: `a%%{init: {}}%%b` is the period `ab`, and `title a %%{init: {}}%% b`
  has the title `a`, two spaces, and `b`. A comment line inside a description
  block is not either. [fixture: timeline/db-period-directive-glued] [fixture:
  timeline/lex-directive-in-event] [fixture: timeline/db-title-directive]
  [fixture: timeline/db-section-directive] [fixture:
  timeline/db-acc-title-directive] [fixture:
  timeline/lex-directive-in-acc-descr] [fixture:
  timeline/db-acc-descr-block-directive] [fixture: timeline/db-event-directive]
  [fixture: timeline/db-acc-descr-block-percent-line]
- A `;` that the line rule ignores is not in the converted form either, inside a
  text: a period, an event, a title, and an accessibility text hold the text
  without it. [fixture: timeline/tokens-ignored-semicolon-in-period] [fixture:
  timeline/lex-title-semicolon-in-style-line] [fixture:
  timeline/lex-acc-title-semicolon-in-style-line] [fixture:
  timeline/lex-acc-descr-semicolon-in-style-line] [fixture:
  timeline/lex-acc-descr-block-semicolon-in-style-line] [fixture:
  timeline/lex-event-semicolon-in-style-line] [fixture:
  timeline/lex-event-semicolon-in-style-line-second-event]
- The whitespace at the ends of a text stays as the tree has it: a period keeps
  the whitespace before its colon, `#`, or line feed, and an event, a title, and
  a section name keep the whitespace at their ends, a name of whitespace only
  included, also where a directive that ends the line follows it. [fixture:
  timeline/db-period-and-event] [fixture: timeline/db-comment-hash-after-period]
  [fixture: timeline/db-period-colon-glued-to-period] [fixture:
  timeline/db-period-trailing-spaces] [fixture:
  timeline/db-event-trailing-spaces] [fixture: timeline/db-event-leading-spaces]
  [fixture: timeline/db-title-trailing-spaces] [fixture:
  timeline/db-title-two-spaces] [fixture: timeline/db-title-only-space]
  [fixture: timeline/db-section-trailing-spaces] [fixture:
  timeline/db-section-only-space] [fixture:
  timeline/lex-no-break-space-around-period-and-event] [fixture:
  timeline/lex-ideographic-space-at-end-of-period] [fixture:
  timeline/lex-directive-at-end-of-period-line] [fixture:
  timeline/lex-directive-at-end-of-title-line]
- An accessibility text is the converted form of its range without the
  whitespace at its ends, as mermaid.js trims it, also when a directive lies
  next to that whitespace. [fixture: timeline/db-acc-title-trailing-spaces]
  [fixture: timeline/db-acc-title-many-spaces] [fixture:
  timeline/lex-directive-after-acc-title-text]

**The walk.** The statements of the body are executed in source order, and a
statement changes the Db at the point where it stands. A period refers to the
sections before it, and an event statement to the periods before it (see
**Periods and events**). An empty description block, a
TimelineAccDescrBlockStatement without text, changes nothing; the statements
around it are executed as if it were not there, so the description before it
stays. [fixture: timeline/gram-empty-description-block-keeps-description]
[fixture: timeline/db-acc-descr-block-then-empty-block] [fixture:
timeline/db-acc-descr-line-then-empty-braces] [fixture:
timeline/db-acc-descr-block-empty] [fixture:
timeline/db-acc-descr-block-braces-only] [fixture:
timeline/gram-empty-description-block-after-header] [fixture:
timeline/gram-empty-description-block-in-title] [fixture:
timeline/gram-empty-description-block-in-period] [fixture:
timeline/gram-empty-description-block-in-section] [fixture:
timeline/gram-empty-description-block-in-event] [fixture:
timeline/gram-empty-description-blocks-then-period]

**Defaults.** Without a statement, the Db has the direction `LR`, the empty text
for the title, `accTitle`, and `accDescr`, and no section and no task. The title
of the frontmatter is not the title of the diagram: the Db of the timeline has
no method that takes it, so the frontmatter, which the tree does not hold, is
not read. [fixture: timeline/db-header-only] [fixture:
timeline/db-title-frontmatter] [fixture:
timeline/db-title-frontmatter-and-statement]

**Direction.** The direction is `LR` when the header has none. Otherwise it is
the direction as written, in upper case: `td` is `TD` and `Lr` is `LR`.
[fixture: timeline/db-direction-lr] [fixture: timeline/db-direction-td]
[fixture: timeline/db-direction-lower-case] [fixture:
timeline/db-direction-mixed-case] [fixture: timeline/header-direction-twice]

**Titles and sections.** The title is the text of the value of the last `title`
statement, as written, whitespace at its ends included, with the replacement of
characters (see below); there is no title before the first. A `section`
statement appends the text of its name, as written, to `sections`, also when it
repeats. [fixture: timeline/db-title-statement] [fixture:
timeline/db-title-twice] [fixture: timeline/db-section-statement] [fixture:
timeline/db-section-twice-same-name]

**Periods and events.** A period statement appends one task, with the `section`,
the `task`, and the `events`.

- `task` is the text of the period, as written. `section` is the name of the
  last `section` statement before the period, as written, or the empty text.
  [fixture: timeline/db-section-two-with-tasks] [fixture:
  timeline/spec-timeline-8bf1d202] [fixture: timeline/db-section-after-tasks]
  [fixture: timeline/db-section-then-title]
- `events` has the texts of the events of the statement, in source order; it is
  empty when the statement has none. [fixture: timeline/db-period-and-event]
  [fixture: timeline/db-period-only] [fixture: timeline/db-event-two-on-a-line]
  [fixture: timeline/db-event-own-line] [fixture:
  timeline/db-event-own-line-two-tasks] [fixture:
  timeline/db-event-own-line-after-event]
- An event statement appends its events to the last task, whatever statements
  lie between that task and it: a title, a section, an accessibility text, or an
  empty description block. The task keeps its own `section`, so an event written
  after a section statement is in the section before it. A tree has no event
  statement before every period: the input is rejected. [fixture:
  timeline/db-event-after-section-joins-earlier-task] [fixture:
  timeline/db-section-with-event-after-task] [fixture:
  timeline/db-event-own-line-after-title] [fixture:
  timeline/db-event-own-line-after-acc-title] [fixture:
  timeline/db-event-own-line-after-acc-descr-block] [fixture:
  timeline/gram-event-after-empty-description-block] [fixture:
  timeline/gram-event-after-empty-description-block-same-line] [fixture:
  timeline/gram-event-first]

**Accessibility.** `accTitle` is the text of the last `accTitle` statement, with
the replacement of characters, or the empty text. `accDescr` is the text of the
last `accDescr` statement or description block with text, with each line feed,
together with the whitespace that follows it, line feeds included, replaced by
one line feed, and then with the replacement of characters; the whitespace
before a line feed stays, and the whitespace after it is removed whatever kind
it is: a tab, a no-break space, a U+3000, a U+2028, or a U+FEFF. A description
block without text changes nothing (see **The walk**). The text may start on a
later line: `accTitle:` followed by a line `A` gives the title `A`. [fixture:
timeline/db-acc-title-statement] [fixture: timeline/db-acc-title-twice]
[fixture: timeline/lex-acc-title-value-on-next-line] [fixture:
timeline/db-acc-descr-statement] [fixture:
timeline/db-acc-descr-line-then-block] [fixture:
timeline/db-acc-descr-block-then-line] [fixture: timeline/db-acc-descr-block]
[fixture: timeline/db-acc-descr-block-blank-line] [fixture:
timeline/db-acc-descr-block-spaces-before-line-feed] [fixture:
timeline/db-acc-descr-block-tab-before-line-feed] [fixture:
timeline/db-acc-descr-block-no-break-space-before-line-feed] [fixture:
timeline/db-acc-descr-block-ideographic-space-before-line-feed] [fixture:
timeline/db-acc-descr-block-tab-after-line-feed] [fixture:
timeline/db-acc-descr-block-no-break-space-after-line-feed] [fixture:
timeline/db-acc-descr-block-ideographic-space-after-line-feed] [fixture:
timeline/db-acc-descr-block-line-separator-after-line-feed] [fixture:
timeline/db-acc-descr-block-byte-order-mark-after-line-feed]

**The summary.** The summary has the fields of
[db-summaries.md](../db-summaries.md#timeline): the values above, `sections` as
the section names in the order of the statements, and `tasks` in source order.

## The replacement of characters

The Db passes three texts through `sanitizeText`: the title, `accTitle`, and
`accDescr`. `timelineDbOf()` applies the replacement
`textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text: periods, events, and section names are as written. The
`accDescr` is replaced after its lines are joined, and a block is replaced like
a line. [fixture: timeline/config-security-level-other-title-and-accessibility]
[fixture: timeline/config-security-level-other-accessibility-block] [fixture:
timeline/config-security-level-other-html-labels-false] [fixture:
timeline/config-security-level-other-flowchart-html-labels-false] [fixture:
timeline/config-security-level-other-sections-periods-events]
