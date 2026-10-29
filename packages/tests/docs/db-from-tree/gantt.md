# Building the gantt Db from the tree

Japanese version: [gantt.ja.md](./gantt.ja.md)

The steps that build the Db summary of a gantt diagram from its tree, which
`src/db-from-tree/gantt.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in [diagrams/gantt.md](../../../spec/docs/diagrams/gantt.md)
and [ast/gantt.md](../../../spec/docs/ast/gantt.md); the fields of the summary
are in [db-summaries.md](../db-summaries.md#gantt).

mermaid.js builds the Db while it parses: the grammar calls a method of the Db
for each statement as the statement ends
([`statement`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L138-L156),
[`clickStatement`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/parser/gantt.jison#L162-L173)),
and the Db keeps what the methods are given
([`addTask`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L596-L630),
[`addSection`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L160-L163),
[`setIncludes`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L141-L143),
[`setLink`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L712-L733),
[`setClickEvent`](https://github.com/mermaid-js/mermaid/blob/1fb7869866dd619168d840291c9c54b4f129758b/packages/mermaid/src/diagrams/gantt/ganttDb.js#L817-L822)).
The summary is built the same way: the statements are executed in source order,
and the lists the Db holds are the summary. Values are kept as the Db holds
them, whitespace included. The dates of the tasks are not in the summary (see
[db-summaries.md](../db-summaries.md#gantt)), so none is computed.

## Building the summary from the tree

**Converted form.** Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, in a description as in every other text: `a#amp; : 1d` is the
task whose description is `a`, the placeholder, and a space, and the same holds
in a task item, a section name, a title, the value of a setting, a list item of
`includes`, a click id, a URL, a callback name, callback arguments, and the
accessibility texts. The same form has each line terminator, `\r\n` and a lone
`\r` too, as `\n`, in a description block, callback arguments, and a URL, and
each attribute quote as `'`, in a title, a URL, and callback arguments; the
string of a URL is not ended by a quote that is an attribute quote. [fixture:
gantt/entity-placeholder-in-task-text] [fixture:
gantt/entity-placeholder-in-task-data] [fixture:
gantt/entity-placeholder-in-section] [fixture:
gantt/entity-placeholder-in-title] [fixture: gantt/lex-dateformat-entity]
[fixture: gantt/entity-placeholder-in-axis-format] [fixture:
gantt/entity-placeholder-in-tick-interval] [fixture:
gantt/lex-todaymarker-entity] [fixture: gantt/entity-placeholder-in-includes]
[fixture: gantt/entity-placeholder-in-click-id] [fixture:
gantt/entity-placeholder-in-href-string] [fixture:
gantt/entity-placeholder-in-callback-name] [fixture:
gantt/entity-placeholder-in-callback-arguments] [fixture:
gantt/entity-placeholder-in-acc-title] [fixture:
gantt/entity-placeholder-in-acc-descr] [fixture:
gantt/entity-placeholder-in-acc-descr-block] [fixture:
gantt/db-acc-descr-block-crlf] [fixture: gantt/db-click-call-arguments-lone-cr]
[fixture: gantt/db-click-href-crlf] [fixture: gantt/lex-html-tag-in-title]
[fixture: gantt/db-click-href-attribute-quote] [fixture:
gantt/db-click-call-arguments-attribute-quote]

**Texts.** The text of a leaf node of the tree is read as follows.

- A GanttLiteral and an Identifier have the converted form of their range. The
  `value` of a GanttLiteral and the `name` of an Identifier are the written
  text, which the tree keeps, and the Db has the text as mermaid.js reads it. A
  StringLiteral, the URL of a click statement, has the converted form of its
  range without the quotes, so `click id1 href "u"` has the URL `u`, and a line
  feed inside it stays. [fixture: gantt/gram-click-href] [fixture:
  gantt/gram-click-href-line-feed-inside]
- A directive inside a text unit or a string unit is not in the converted form,
  and so not in the text: `a%%{init: {}}%%b : 1d` is the task `ab `, and
  `click id1 href "u%%{init: {}}%%v"` has the URL `uv`. A comment line inside a
  text unit or a string unit is not either. [fixture:
  gantt/lex-directive-in-task-text] [fixture: gantt/lex-directive-in-task-data]
  [fixture: gantt/lex-directive-in-title-text] [fixture:
  gantt/lex-directive-in-section-text] [fixture:
  gantt/lex-directive-in-setting-text] [fixture:
  gantt/lex-directive-in-acc-title] [fixture:
  gantt/lex-directive-in-acc-descr-block] [fixture:
  gantt/lex-directive-in-href-string] [fixture:
  gantt/lex-directive-in-callback-name] [fixture:
  gantt/lex-directive-in-callback-arguments] [fixture:
  gantt/tokens-comment-line-in-href-string] [fixture:
  gantt/tokens-comment-line-in-callback-arguments] [fixture:
  gantt/tokens-comment-line-in-acc-block]
- A `;` that the line rule ignores is not in the converted form either, inside a
  text or a string: a title, a section name, task data, a description, a
  callback name, callback arguments, a URL, and an accessibility text hold the
  text without it, and so does a `todayMarker` text, which the `;` would
  otherwise end. At a click id or a list item the `;` cuts the unit, and the
  input is rejected (see
  [Known divergences](../../../spec/docs/diagrams/gantt.md#known-divergences)).
  [fixture: gantt/tokens-ignored-semicolon-in-title-text] [fixture:
  gantt/tokens-ignored-semicolon-in-section-text] [fixture:
  gantt/tokens-ignored-semicolon-in-task-data] [fixture:
  gantt/tokens-ignored-semicolon-in-task-text] [fixture:
  gantt/tokens-ignored-semicolon-in-callback-name] [fixture:
  gantt/tokens-ignored-semicolon-in-callback-arguments] [fixture:
  gantt/tokens-ignored-semicolon-in-href-string] [fixture:
  gantt/tokens-ignored-semicolon-in-acc-title] [fixture:
  gantt/tokens-ignored-semicolon-in-acc-block] [fixture:
  gantt/tokens-ignored-semicolon-todaymarker] [fixture:
  gantt/div-ignored-semicolon-in-click-id] [fixture:
  gantt/div-ignored-semicolon-in-list-item]
- The whitespace at the ends of a text stays as the tree has it: the text of a
  description keeps the whitespace before its colon, the value of a setting, a
  title, and a section name keep the whitespace at their ends, and a callback
  name and callback arguments keep theirs. [fixture:
  gantt/lex-task-text-trailing-spaces] [fixture:
  gantt/db-task-description-spaces] [fixture: gantt/lex-dateformat-two-spaces]
  [fixture: gantt/lex-dateformat-trailing-spaces] [fixture:
  gantt/db-date-format-extra-spaces] [fixture: gantt/lex-title-two-spaces]
  [fixture: gantt/lex-title-trailing-spaces] [fixture:
  gantt/lex-section-two-spaces] [fixture: gantt/lex-section-trailing-spaces]
  [fixture: gantt/gram-click-call-name-space-before-parenthesis] [fixture:
  gantt/gram-click-call-name-line-feed-before-parenthesis] [fixture:
  gantt/gram-click-call-arguments-leading-space]
- An item of the data of a task and an accessibility text are the converted form
  of their range without the whitespace at its ends, as mermaid.js trims them,
  also when a directive lies next to that whitespace; a null item is the empty
  text. [fixture: gantt/lex-task-items-nbsp-trimmed] [fixture:
  gantt/lex-task-data-line-separator-item] [fixture:
  gantt/tokens-unclosed-directive-in-data-line] [fixture:
  gantt/db-task-empty-data] [fixture: gantt/gram-task-empty-items] [fixture:
  gantt/gram-acc-title-trailing-spaces] [fixture:
  gantt/lex-acc-title-spaces-around-colon] [fixture:
  gantt/gram-acc-descr-block-multiline]

**The walk.** The statements of the body are executed in source order, and a
statement changes the Db at the point where it stands. A statement that refers
to tasks, a click statement, refers to those read before it (see **Click
statements**). An empty description block, a GanttAccDescrBlockStatement without
text, changes nothing; the statements around it are executed as if it were not
there. [fixture: gantt/gram-acc-descr-block-empty-then-title] [fixture:
gantt/gram-acc-descr-block-whitespace-only] [fixture:
gantt/gram-empty-description-block-after-click-statement] [fixture:
gantt/db-acc-descr-then-empty-block]

**Defaults.** Without a statement, the Db has the empty text for `dateFormat`,
`axisFormat`, `todayMarker`, the title, `accTitle`, and `accDescr`; no token for
`includes` and `excludes`; `false` for `inclusiveEndDates`; `sunday` for
`weekday`; `saturday` for `weekend`; no section, no task, no link; and no field
`tickInterval` and no field `clickCalls`. [fixture: gantt/header-only]

**Settings.** The statements of a setting set one value of the Db.

- `dateFormat`, `axisFormat`, `tickInterval`, and `todayMarker` are the text of
  the value of the last statement of the kind, as written, whitespace at its
  ends included. The field `tickInterval` is there only when a `tickInterval`
  statement is. [fixture: gantt/db-date-format] [fixture:
  gantt/db-date-format-last-wins] [fixture: gantt/db-axis-format] [fixture:
  gantt/db-axis-format-last-wins] [fixture: gantt/db-tick-interval] [fixture:
  gantt/db-tick-interval-last-wins] [fixture: gantt/db-today-marker] [fixture:
  gantt/db-today-marker-off] [fixture: gantt/db-today-marker-last-wins]
  [fixture: gantt/lex-todaymarker-hash]
- `includes` and `excludes` are the tokens of the statements of the kind, in
  lower case, each once, in the order of its first place over all the
  statements; a statement without an item adds none. The tokens are the items of
  the statement, lowercased. The case is mapped over the list text from the
  first item to the last, and not item by item, because the lower case of a
  Greek capital sigma depends on the characters around it: it is the final sigma
  at the end of a word, and a U+FEFF between two items, a format character, does
  not end the word for it. [fixture: gantt/db-includes-tokens] [fixture:
  gantt/db-excludes-tokens] [fixture: gantt/db-excludes-merged-lines] [fixture:
  gantt/db-excludes-duplicates] [fixture: gantt/lex-excludes-upper-case-items]
  [fixture: gantt/lex-excludes-commas-and-spaces] [fixture:
  gantt/lex-excludes-empty-items] [fixture: gantt/lex-excludes-whitespace-value]
  [fixture: gantt/db-includes-final-sigma] [fixture:
  gantt/db-includes-sigma-before-bom] [fixture:
  gantt/db-includes-sigma-after-bom] [fixture: gantt/db-excludes-final-sigma]
- `inclusiveEndDates` is `true` once an `inclusiveEndDates` statement is
  executed. [fixture: gantt/db-inclusive-end-dates]
- `weekday` and `weekend` are the `day` of the last statement of the kind, in
  lower case whatever its case in the text. [fixture:
  gantt/db-weekday-last-wins] [fixture: gantt/lex-day-mixed-case] [fixture:
  gantt/db-weekend-friday] [fixture: gantt/db-weekend-saturday] [fixture:
  gantt/lex-weekend-upper-case]

**Titles and sections.** The title is that of the frontmatter, until a `title`
statement replaces it with the text of its value, as written, whitespace at its
ends included, and then the last one wins; the title has the replacement of
characters (see below). A `section` statement appends the text of its name, as
written, to `sections`, also when it repeats. [fixture:
gantt/db-title-frontmatter] [fixture: gantt/db-title-statement] [fixture:
gantt/db-title-statement-after-frontmatter] [fixture: gantt/lex-title-twice]
[fixture: gantt/db-sections] [fixture: gantt/lex-section-twice]

**Tasks.** A task statement appends one task to the tasks. These values come
from the statement and from the tasks and sections before it.

- `task` is the text of the description, as written. `section` is the name of
  the last `section` statement before the task, as written, or the empty text.
  `classes` starts empty. [fixture: gantt/db-task-description-spaces] [fixture:
  gantt/lex-task-text-quotes] [fixture: gantt/db-task-before-section] [fixture:
  gantt/db-task-id-written] [fixture: gantt/db-task-section-latest]
- The tags of the statement set the flags `active`, `done`, `crit`, `milestone`,
  and `vert`. The task has the field of a flag, with the value `true`, for each
  flag that a tag sets, once when the tag repeats, and no field for the others;
  the items that are no tag, `CRIT` and a `done` after another item among them,
  set none. [fixture: gantt/gram-task-active] [fixture:
  gantt/gram-task-tag-then-item] [fixture: gantt/gram-task-crit] [fixture:
  gantt/gram-task-milestone] [fixture: gantt/gram-task-vert] [fixture:
  gantt/db-task-tags] [fixture: gantt/db-task-tag-repeated] [fixture:
  gantt/gram-task-two-tags] [fixture: gantt/db-task-tag-case] [fixture:
  gantt/gram-task-tag-after-item] [fixture: gantt/gram-task]
- What the other items give depends on how many there are. One item is the end:
  `raw.endTime` is `{ data }` with the text of the item, and `raw.startTime` is
  `{ type: "prevTaskEnd", id }` with the `id` of the task before, left out when
  the task is the first or the task before has no id. Two items are the start
  and the end: `raw.startTime` is `{ type: "getStartDate", startData }` with the
  first item, and `raw.endTime` is `{ data }` with the second. Three items are
  the id, the start, and the end, the id being the first item, which may be
  empty or hold spaces. An item is the text as written, so `after id1 id2` and
  `until id1` are items like any other. Four items or more are not read: the
  task has no `id`, and `raw` has neither `startTime` nor `endTime`. [fixture:
  gantt/gram-task-one-item] [fixture: gantt/db-task-forms] [fixture:
  gantt/db-task-id-numbered] [fixture: gantt/db-task-one-item-after-four-items]
  [fixture: gantt/db-task-one-item-after-empty-id] [fixture:
  gantt/gram-task-two-items] [fixture: gantt/gram-task-three-items] [fixture:
  gantt/gram-task-id-with-spaces] [fixture: gantt/gram-task-empty-item-first]
  [fixture: gantt/gram-task-after-ids] [fixture: gantt/gram-task-until]
  [fixture: gantt/gram-task-four-items] [fixture: gantt/db-task-four-items]
  [fixture: gantt/gram-task-four-tags-then-items]
- A task of one or two items has the `id` `task1`, `task2`, …, numbered among
  the tasks that are given one in this way, from 1 in source order, so a task of
  three items has its written id and takes no number, and neither does a task of
  four items or more. [fixture: gantt/gram-task-numbered-ids] [fixture:
  gantt/db-task-id-numbered] [fixture: gantt/db-task-four-items-no-number]
- `order` is the number of the tasks before it that have an order, from 0. A
  task with the flag `vert` has the order -1 and is not counted. [fixture:
  gantt/db-task-vert] [fixture: gantt/docs-syntax-gantt-9bf761ee] [fixture:
  gantt/db-task-forms]

**Click statements.** A click statement refers to tasks by id, and executes its
call part, if it has one, and its link part, if it has one. The effects of the
two parts do not depend on their order in the text. [fixture:
gantt/db-click-call-then-href] [fixture: gantt/db-click-href-then-call]

- An id is its text, and a null id is the empty text. Each id finds **the task
  of the id**: the last task read before the statement whose id it is, written
  or numbered. An id that no task read before has finds nothing, also the id of
  a task that comes later, and so does the id `__proto__`, also when a task has
  it. A task with four items or more, which has no id, is the task of the id
  `undefined`, like a task that has this id; the later of the two is found. The
  empty text is an id too: an empty id of the list finds the task whose id is
  empty, and nothing when there is none. [fixture: gantt/db-click-before-task]
  [fixture: gantt/db-click-unknown-id] [fixture: gantt/gram-click-unknown-id]
  [fixture: gantt/db-task-duplicate-id] [fixture:
  gantt/gram-task-duplicate-id-click] [fixture:
  gantt/db-click-between-duplicate-ids] [fixture: gantt/spec-gantt-ea3e239d]
  [fixture: gantt/db-click-task-without-id] [fixture:
  gantt/db-click-task-without-id-and-id-undefined] [fixture:
  gantt/db-click-empty-id] [fixture: gantt/gram-click-ids-two-commas]
- Each part gives the class `clickable` to the task of each id in the list, once
  for each time the id is written, so a statement with both parts gives it
  twice, and a statement for the same task after another adds again. [fixture:
  gantt/db-click-href] [fixture: gantt/db-click-call] [fixture:
  gantt/db-click-call-then-href] [fixture: gantt/db-click-href-then-call]
  [fixture: gantt/db-click-ids-list] [fixture: gantt/db-click-id-repeated]
  [fixture: gantt/gram-click-two-statements-same-id] [fixture:
  gantt/db-click-links-order]
- The link part sets the link of the task of each id that finds a task: its `id`
  is the id as written and its `url` is the text of the URL, as written. A link
  of an id that has one is replaced and keeps its place, so `links` is in the
  order in which a link of each id was first set, with the last URL. [fixture:
  gantt/db-click-href] [fixture: gantt/db-click-links-order] [fixture:
  gantt/gram-click-href-replaced] [fixture: gantt/db-click-ids-list] [fixture:
  gantt/db-click-between-duplicate-ids]
- The call part adds a click call to `clickCalls`, whether or not an id finds a
  task, in the order of the statements: `id` is the texts of the `ids` joined by
  `,`, empty ids included, `name` is the text of the callback name, as written,
  and `args` is the text of the callback arguments, as written, or `null` when
  there are none or only whitespace lies between the parentheses. The field
  `clickCalls` is there only when a call is. [fixture: gantt/db-click-call]
  [fixture: gantt/db-click-call-args] [fixture: gantt/db-click-unknown-id]
  [fixture: gantt/db-click-ids-list] [fixture: gantt/db-click-call-ids-empty-id]
  [fixture: gantt/gram-click-call-blank-arguments] [fixture:
  gantt/gram-click-call-name-space-before-parenthesis] [fixture:
  gantt/gram-click-call-arguments-line-feed] [fixture:
  gantt/gram-click-call-then-href] [fixture:
  gantt/config-security-level-loose-click-call] [fixture:
  gantt/config-security-level-antiscript-click-call]
- The URL is the text as written under every `securityLevel`. [fixture:
  gantt/config-security-level-strict-click-href] [fixture:
  gantt/config-security-level-sandbox-click-href]

**Accessibility.** `accTitle` is the text of the last `accTitle` statement, with
the replacement of characters, or the empty text. `accDescr` is the text of the
last `accDescr` statement or description block with text, with each line feed,
together with the whitespace that follows it, line feeds included, replaced by
one line feed, and then with the replacement of characters. A description block
without text changes nothing. The text may start on a later line: `accTitle:`
followed by a line `A` gives the title `A`. [fixture: gantt/gram-acc-title]
[fixture: gantt/db-acc-title] [fixture: gantt/db-acc-title-twice] [fixture:
gantt/gram-acc-title-line-feed-then-text] [fixture:
gantt/gram-acc-title-blank-lines-then-text] [fixture: gantt/gram-acc-descr]
[fixture: gantt/db-acc-descr] [fixture: gantt/db-acc-descr-block] [fixture:
gantt/gram-acc-descr-block-multiline] [fixture:
gantt/db-acc-descr-block-blank-line] [fixture: gantt/gram-acc-descr-twice]
[fixture: gantt/db-acc-descr-block-then-line] [fixture:
gantt/db-acc-descr-then-empty-block]

**The summary.** The summary has the fields of
[db-summaries.md](../db-summaries.md#gantt): the values above, `sections` as the
section names in the order of the statements, `tasks` in source order, `links`,
and `clickCalls`. A task has `section`, `raw`, `task`, `classes`, the `id`
unless it has none, the flags it has, and `order`.

## The replacement of characters

The Db passes three texts through `sanitizeText`: the title, `accTitle`, and
`accDescr`. `ganttDbOf()` applies the replacement
`textReplacementOf(embedded.config)` of
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) to these and
to no other text: descriptions, sections, items, the values of the settings,
tokens, ids, URLs, and callbacks are as written. The title is replaced whether
it comes from the frontmatter or from a `title` statement; the `accDescr` is
replaced after its lines are joined. [fixture:
gantt/config-security-level-other-title] [fixture:
gantt/config-security-level-other-diagram-title] [fixture:
gantt/config-security-level-other-acc-title] [fixture:
gantt/config-security-level-other-acc-descr] [fixture:
gantt/config-security-level-other-acc-descr-block] [fixture:
gantt/config-security-level-other-html-labels-false] [fixture:
gantt/config-security-level-other-names-as-written] [fixture:
gantt/config-security-level-other-settings-as-written] [fixture:
gantt/config-security-level-other-task-data-as-written] [fixture:
gantt/config-security-level-other-click-as-written]
