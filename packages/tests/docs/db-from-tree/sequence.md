# Building the sequence Db from the tree

Japanese version: [sequence.ja.md](./sequence.ja.md)

The steps that build the Db summary of a sequence diagram from its tree, which
`src/db-from-tree/sequence.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/sequence.md](../../../spec/docs/diagrams/sequence.md) and
[ast/sequence.md](../../../spec/docs/ast/sequence.md).

The diagram title from the frontmatter and the Db values that depend on the
configuration do not come from the tree: whoever checks Db values derives them
with mermaid.js's own functions (see
[Configuration (reference)](../configuration.md#configuration-reference)). Here
this is the wrap setting that a text without a wrap prefix gets: true when
`wrap` or `sequence.wrap` of the configuration is true, else false. One of the
two being true is enough, whatever the other says. [fixture:
sequence/config-wrap-site] [fixture: sequence/config-sequence-wrap-site]
[fixture: sequence/config-wrap-site-nowrap-prefix] [fixture:
sequence/config-wrap-false-sequence-wrap-true-site] [fixture:
sequence/config-wrap-true-sequence-wrap-false-site]

## Building the summary from the tree

The statements are applied in source order, a block's own entries before and
after its body, and each statement as follows. The **text** of a text part below
is its `text` unit without the whitespace at its ends, or the empty text when it
has none (see [Text parts](../../../spec/docs/diagrams/sequence.md#text-parts));
its **wrap** is true after `wrap:`, false after `nowrap:`, and the wrap setting
of the configuration otherwise.

The whitespace at the ends is the whitespace of
[Notation](../../../spec/docs/common.md#notation): in `A->>B:` followed by
U+00A0, U+FEFF, `x`, U+3000, and U+2003, the text is `x`, while U+0085 and
U+180E are not whitespace and stay around an `x`. [fixture:
sequence/db-message-text-unicode-whitespace-ends] [fixture:
sequence/db-message-text-non-whitespace-ends-kept] The whitespace after an id is
the same: `participant A`, U+3000, and U+00A0 adds `A`. [fixture:
sequence/db-participant-id-unicode-whitespace-ends] A message with only
whitespace after the `:` has the empty text, and `A->>B: wrap:` has the empty
text and the wrap true. [fixture: sequence/db-message-text-whitespace-only]
[fixture: sequence/db-message-wrap-prefix-without-text] A directive inside a
text is read as nothing, and the whitespace beside a directive at an end of the
text is removed: `loop a%%{init: {}}%%b` has the text `ab`, and
`loop %%{init: {}}%% c %%{init: {}}%%` the text `c`. [fixture:
sequence/db-block-text-directive]

Each value is read in
[converted form](../../../spec/docs/common.md#reading-a-source), so an entity is
its placeholder, in an id as in a text: `participant #quot;B` adds the
participant `ﬂ°quot¶ßB`, and `A->>B#quot;: x` a message to `Bﬂ°quot¶ß`, and so
does every statement that names an id. [fixture:
sequence/db-participant-id-entity] [fixture:
sequence/db-participant-id-numeric-entity] [fixture:
sequence/db-actor-id-entity] [fixture: sequence/db-participant-alias-id-entity]
[fixture: sequence/db-message-from-id-entity] [fixture:
sequence/db-message-to-id-entity] [fixture: sequence/db-create-id-entity]
[fixture: sequence/db-destroy-id-entity] [fixture:
sequence/db-note-over-id-entity] [fixture: sequence/db-note-right-id-entity]
[fixture: sequence/db-activate-id-entity] [fixture:
sequence/db-box-participant-id-entity] [fixture: sequence/db-link-id-entity]
[fixture: sequence/db-deactivate-id-entity] [fixture:
sequence/db-details-id-entity] [fixture: sequence/db-links-id-entity] [fixture:
sequence/db-properties-id-entity] [fixture: sequence/db-note-left-id-entity]
[fixture: sequence/db-create-destroy-id-entity] A text is read in converted form
in the same way: `note over A: a#amp;b` has the text `aﬂ°amp¶ßb`, and so do the
description after `as`, the text of a block, and the name of a box after its
colour (the title and the accessibility values are read so too, see **Titles**).
[fixture: sequence/db-note-text-entity] [fixture:
sequence/db-participant-alias-entity] [fixture: sequence/db-block-text-entity]
[fixture: sequence/db-box-text-entity] The converted form of a text also has the
quotes of an attribute value as `'`, so `A->>B: <a href="x">y</a>` has the text
`<a href='x'>y</a>` (see
[HTML attribute quotes](../../../spec/docs/common.md#html-attribute-quotes)),
and it has nothing for a `;` that
[the line rule](../../../spec/docs/common.md#style-and-classdef-lines) ignores:
in `participant Z@{ "style": "x:#y" };A->>B: x;y`, the text of the message is
`xy`. [fixture: sequence/db-message-text-attribute-quote] [fixture:
sequence/db-message-text-ignored-semicolon]

**Participants.** Adding a participant with an id, a description, a kind, and a
data block does this:

- Inside a box, a participant with that id that exists already gets the box or
  makes the input rejected, as **A participant in two boxes** in
  [Rejections outside the grammar](../../../spec/docs/diagrams/sequence.md#rejections-outside-the-grammar)
  defines. This happens before the next two items, so it happens also when
  nothing else changes. [fixture:
  sequence/db-box-existing-participant-joins-box] [fixture:
  sequence/gram-box-participant-in-two-boxes]
- When a participant with that id exists already and the statement has no
  description, nothing else changes: `participant A as Alice` followed by
  `participant A` keeps the description `Alice`, and `actor A` keeps also the
  kind `participant`. A statement has a description when it has `as`, also with
  nothing after it, which is the empty text: after `participant A as Alice`,
  `participant A as` records A anew with the empty description, and not with the
  id. It has one also when its data block sets an `alias` (see
  [Data blocks in the Db](#data-blocks-in-the-db)): after
  `participant A as Alice`, `participant A@{ "alias": "Q" }` records A anew with
  the description `Q`, while `participant A@{ "type": "queue" }` changes
  nothing, and A keeps the kind `participant`. [fixture:
  sequence/db-participant-redeclared-without-alias] [fixture:
  sequence/db-participant-redeclared-without-alias-keeps-kind] [fixture:
  sequence/db-participant-redeclared-empty-alias] [fixture:
  sequence/db-participant-empty-alias] [fixture:
  sequence/db-data-block-existing-participant-alias] [fixture:
  sequence/db-data-block-existing-participant-type]
- Otherwise the participant is recorded anew: `name` the id, `description` the
  description or else the id, `wrap` the wrap of the description, `type` the
  kind, `links` and `properties` empty, and `prevActor` the id of the
  participant added last, if there is one; that participant gets `nextActor` the
  id. A participant that existed already keeps its place in `actors`, and its
  box; its links and properties are emptied, and its `prevActor` is the
  participant added last, which may be itself: after `participant A`,
  `participant B`, and `participant A as Alice`, A has the description `Alice`
  and `prevActor` B, and B has `nextActor` A. The kind and the description are
  those of the new statement: `actor A as X` after `participant A` gives the
  kind `actor`, and `participant A as AA` after
  `participant A@{ "type": "queue" }` gives the kind `participant`, so that the
  type of the data block is gone. A description with a wrap prefix has the
  prefix taken off and its `wrap`: `participant A as wrap:z` has the description
  `z` and `wrap` true, and `participant B as wrap:` the empty description and
  `wrap` true. A description without a prefix, and a participant without a
  description, have the wrap setting of the configuration, and `nowrap:` gives
  false. [fixture: sequence/db-participant-redeclared-with-alias] [fixture:
  sequence/db-participant-redeclared-after-links] [fixture:
  sequence/db-participant-redeclared-itself-previous] [fixture:
  sequence/db-participant-redeclared-kind-changes] [fixture:
  sequence/db-participant-redeclared-after-data-block-type] [fixture:
  sequence/db-participant-redeclared-after-properties] [fixture:
  sequence/db-participant-alias-wrap-prefix] [fixture:
  sequence/config-wrap-site-participant-description]
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
[Data blocks](#data-blocks-in-the-db)). The other statements that add a
participant, which **Creating an existing participant** in
[Rejections outside the grammar](../../../spec/docs/diagrams/sequence.md#rejections-outside-the-grammar)
lists, first add each id they name with no description and the kind
`participant`, so an id that exists already is not changed: a participant that
has a description from `as` keeps it after a `link`, a `links`, a message, and a
note that name it. [fixture: sequence/demo-sequence-90dc5f3e] [fixture:
sequence/spec-sequence-diagram-1705b6f7] `activate` and `deactivate` add none:
`activate A B` adds an entry for the id `A B` and no participant. [fixture:
sequence/lex-activate-id-space]

**Create and destroy.** `create` before a participant statement is rejected when
a participant with that id exists already (see
[Rejections outside the grammar](../../../spec/docs/diagrams/sequence.md#rejections-outside-the-grammar));
otherwise it adds the participant, and records the id in `createdActors` with
`messageIndex` the number of entries in `messages` so far. `destroy` records the
id in `destroyedActors` in the same way. [fixture:
sequence/db-create-participant] [fixture: sequence/db-destroy-participant]
[fixture: sequence/db-create-participant-before-message] The entries of
`messages` that `messageIndex` counts are all of them, whatever their kind: in
`autonumber`, `note over A: n`, `loop x`, `A->>+B: m`, and
`create participant C`, the entries before the `create` are the `autonumber`,
the note, the start of the loop, the message, and the entry of the `+`, and
`messageIndex` is 5. A second `destroy` with the same id replaces the record of
the first: `destroy B` after the first message and again after the second
message give `destroyedActors` B once, with the `messageIndex` of the second.
[fixture: sequence/db-create-message-index-counts-entries] [fixture:
sequence/db-destroy-twice-replaces-index] A destroy statement with `create` does
what `create participant` does with its id: it adds the participant with the
kind `participant` and the id as its description, and records it in
`createdActors`; it records nothing in `destroyedActors`, and the checks after
`create` apply to it (see
[Rejections outside the grammar](../../../spec/docs/diagrams/sequence.md#rejections-outside-the-grammar)).
[fixture: sequence/gram-create-destroy] [fixture:
sequence/db-create-destroy-then-destroy] [fixture:
sequence/gram-create-destroy-without-message] [fixture:
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
sequence/db-message-central-connection-both] [fixture:
sequence/config-wrap-site-activation-entries]

**Notes.** A note adds an entry with `from` and `to` the id, or the two ids of
`over` with a `,`, `message` the text, `wrap` its wrap, `type` 2, and
`placement` 0 for `left of`, 1 for `right of`, and 2 for `over`. [fixture:
sequence/db-note-over-two] [fixture: sequence/db-note-left-of]

**Autonumber.** `autonumber` adds an entry of type 26 whose `message` is
`visible` true, and `start` and `step` when a number follows: the first number,
and the second, or else 1; a 0 is a number as any other, so `autonumber 0 0`
gives `start` 0 and `step` 0, and the step is not 1. `autonumber off` gives
`visible` false and no numbers. Its `wrap` is false, also when the wrap setting
of the configuration is true. [fixture: sequence/db-autonumber-bare] [fixture:
sequence/db-autonumber-start] [fixture: sequence/db-autonumber-start-step]
[fixture: sequence/db-autonumber-off] [fixture: sequence/db-autonumber-zero]
[fixture: sequence/config-wrap-site-autonumber]

**Blocks.** A block adds an entry at its start with the text and its wrap, one
for each `else`, `and`, or `option` with its text, and one at its `end` with the
empty text and the wrap setting of the configuration. A second `else` is another
entry of type 13: after `alt a`, `else wrap: b` gives `b` with `wrap` true, and
`else` without text the empty text. [fixture: sequence/db-block-alt-two-else] A
text without a prefix has the wrap setting too, so with the setting true the
start, the sections, and the `end` have `wrap` true, and `loop nowrap: x` has
`wrap` false while its `end` has true. [fixture:
sequence/config-wrap-site-block-sections] [fixture:
sequence/config-wrap-site-block-nowrap-prefix] The types are:

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
from 0, and a number, `true`, `false`, or `null` nothing: the string `"a`,
U+1F600, `"` gives the keys `0`, `1`, and `2`, the last two the two surrogates
of the character outside the BMP. A text that is not JSON changes nothing, and
the input is accepted. The text is that of a text part, so a wrap prefix is not
part of it: `links A: wrap: {"a": "b"}` sets `a`. A `#` ends the text, so
`links A: {"Docs": "https://x.example/#top"}` has the text up to the `#`, which
is not JSON, and changes nothing. A directive inside a string is read as
nothing: `links A: {"a": "b%%{init: {}}%%c"}` sets `a` to `bc`. Whoever derives
the Db reads the JSON from the text of the tree, in converted form, where an
entity is a placeholder: the JSON is not embedded data in the sense of
[`embedded-data-opaque`](../../../spec/docs/known-divergences/embedded-data-opaque.md),
because mermaid.js never rejects an input because of it, and the tree keeps it
as text like any other. [fixture: sequence/db-links-not-json] [fixture:
sequence/db-properties-not-json] [fixture: sequence/db-links-string-value]
[fixture: sequence/db-properties-string-value] [fixture:
sequence/db-links-array-value] [fixture: sequence/db-links-number-value]
[fixture: sequence/db-links-two-statements] [fixture: sequence/db-links-entity]
[fixture: sequence/db-links-object] [fixture: sequence/db-links-trailing-comma]
[fixture: sequence/db-properties-trailing-comma] [fixture:
sequence/db-links-true] [fixture: sequence/db-links-false] [fixture:
sequence/db-links-null] [fixture: sequence/db-links-string-astral] [fixture:
sequence/db-links-wrap-prefix] [fixture: sequence/db-links-hash-ends-text]
[fixture: sequence/db-links-directive-in-json] A statement without text has the
empty text, which is not JSON: `links A:` and `properties A:` change nothing.
[fixture: sequence/db-links-empty] [fixture: sequence/db-properties-empty]
[fixture: sequence/db-links-proto-key] [fixture:
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
sequence/db-link-without-at] [fixture: sequence/db-link-without-at-url] The text
is that of a text part, so `link A: wrap: Dash @ https://x.example` sets `Dash`
to `https://x.example`, and a `#` ends it, so
`link A: Docs @ https://x.example/#top` sets `Docs` to `https://x.example/`. A
second `@` stays in the URL: `link A: Mail @ mailto:x@y.example` sets `Mail` to
`mailto:x@y.example`. Without an `@`, a text of one character gives the empty
label: `link A: x` sets the empty label to `x`. [fixture:
sequence/db-link-wrap-prefix] [fixture: sequence/db-link-url-hash-ends-text]
[fixture: sequence/db-link-second-at-in-url] [fixture:
sequence/db-link-without-at-one-character] With the empty text, `link A:` has no
`@`, and sets the empty label to the empty URL. [fixture:
sequence/db-link-empty] `details` adds the participant its id names, if it has
none, and changes nothing else, also without text: mermaid.js looks for an
element of the page with the text as its id, which is not part of the diagram's
text, and the summary is made as on a page without one. [fixture:
sequence/db-details-empty] [fixture: sequence/db-details-adds-participant]

**Titles.** `title` sets the title to the value of its SequenceTitleStatement,
the text of the `title-text` unit in converted form, whitespace included:
`title`, two spaces, `x`, and two spaces has the title of a space, `x`, and two
spaces, and `title` followed by four spaces the title of three spaces. `title:`
does the same: with two spaces, `x`, and two spaces after the colon the title is
a space, `x`, and two spaces, and with a line break after the colon, then two
spaces and `x`, it is the two spaces and `x`. The text is in converted form:
`title a#amp;b` has the title `aﬂ°amp¶ßb`, and `title a%%{init: {}}%%b` the
title `ab`. `accTitle:` sets the accessibility title, and `accDescr:` and
`accDescr {` the description, as in
[flowchart.md](./flowchart.md#building-the-summary-from-the-tree): without
whitespace at the ends, each line feed and the whitespace after it read as one
line feed, a later statement replacing an earlier one, an `accDescr {` block
that is not closed setting the empty description, and a closed block without
text changing nothing. The whitespace at the ends of `accTitle:   x   ` and
`accDescr:   x   ` is removed. In a block, a line feed and the whitespace after
it, also over blank lines, are one line feed, and the whitespace before a line
feed stays: `a`, two blank lines, `b` after three spaces and followed by two
spaces, and `c` after two spaces give `a`, a line feed, `b` and two spaces, a
line feed, and `c`; a line terminator written as `\r\n` is one line feed. The
values are in converted form: `a#amp;b` after `accTitle:` or `accDescr:`, and in
an `accDescr {` block, holds the placeholder of the entity, and a directive on a
line of its own in a block is read as nothing, the line feeds around it as one:
`a`, a directive line, and `b` give `a`, a line feed, and `b`. [fixture:
sequence/db-title-spaces] [fixture: sequence/db-title-whitespace-only] [fixture:
sequence/db-title-legacy] [fixture: sequence/db-title-legacy-spaces] [fixture:
sequence/db-title-legacy-next-line-indented] [fixture: sequence/db-title-entity]
[fixture: sequence/db-title-directive] [fixture:
sequence/db-acc-descr-block-lines] [fixture:
sequence/db-acc-descr-block-unclosed] [fixture:
sequence/db-acc-descr-line-alone] [fixture:
sequence/db-acc-descr-block-after-message] [fixture:
sequence/db-acc-title-whitespace-ends] [fixture:
sequence/db-acc-descr-line-whitespace-ends] [fixture:
sequence/db-acc-descr-block-blank-lines] [fixture:
sequence/db-acc-descr-block-crlf] [fixture: sequence/db-acc-title-entity]
[fixture: sequence/db-acc-descr-entity] [fixture:
sequence/db-acc-descr-block-entity] [fixture:
sequence/db-acc-descr-block-directive-line]

The statements are applied in source order, inside blocks too, and each of the
three values keeps the last one set: `title outer`, a `loop`, and inside it
`title inner` and `accTitle: inner` give both `inner`. [fixture:
sequence/db-title-inside-block] The title starts as the title of the
frontmatter, which does not come from the tree (see
[The summary](../db-summaries.md#sequence)), and a `title` statement replaces
it: with `title: From frontmatter` in the frontmatter, `title From statement`
gives the title `From statement`. `title first` and `title second` give
`second`, and `accTitle:` and `accDescr:` replace an earlier statement of their
own kind in the same way; an `accDescr:` line also replaces the description of
an earlier block, and `accDescr: outer` after a loop replaces `accDescr: inner`
inside it. The title and the accessibility title are separate values:
`title first` and `accTitle: second` give the title `first` and the
accessibility title `second`. A closed block without text, also one with only
whitespace, line breaks, or a comment line, changes nothing: after
`accDescr: x`, `accDescr {}`, `accDescr { }`, and a block with a line break
between its braces keep `x`. [fixture: sequence/db-title-replaces-frontmatter]
[fixture: sequence/db-title-replaces] [fixture: sequence/db-acc-title-replaces]
[fixture: sequence/db-acc-descr-replaces] [fixture:
sequence/db-acc-descr-line-replaces-block] [fixture:
sequence/db-acc-descr-outer-replaces-loop] [fixture:
sequence/db-title-and-acc-title] [fixture:
sequence/db-acc-descr-empty-block-keeps] [fixture:
sequence/db-acc-descr-spaces-block-keeps] [fixture:
sequence/db-acc-descr-comment-block-keeps] [fixture:
sequence/db-acc-descr-lines-block-keeps] [fixture:
sequence/db-acc-descr-empty-block-after-message] [fixture:
sequence/db-acc-descr-empty-block-spaces-after-message] [fixture:
sequence/db-acc-descr-empty-block-lines-after-message] [fixture:
sequence/db-acc-descr-block-comment-only-after-message]

**Ignored statements.** A SequenceIgnoredStatement changes nothing, also after
`end` on the same line: a line with only `)` is such a statement. [fixture:
sequence/lex-invalid-line-parenthesis] [fixture:
sequence/gram-invalid-after-end]

**Lines that go on.** A comment line right after a line that ends with U+2028 or
U+2029 does not end that line (see
[Units and contexts](../../../spec/docs/diagrams/sequence.md#units-and-contexts)
and [Comment lines](../../../spec/docs/common.md#comment-lines)): the line after
the comment line is part of the same value. `A->>B: x`, U+2028, a comment line,
and `C->>D: y` have one message, with the text `x`, U+2028, and `C->>D: y`. The
same holds for the description after `as`, an id, the text of `title`,
`accTitle:`, and `accDescr:`, and a line of an `accDescr {` block: the
description of `accDescr {`, `x` and U+2028, a comment line, `y`, and `}` is
`x`, U+2028, and `y`. In a box, the line after the comment line is part of its
text, which then holds a U+2028 and has no name and the fill `transparent`: in
`box red`, U+2028, a comment line, `participant A`, and `end`, the participant
statement is not read, and the box has no participant. A directive line and an
empty line do not continue the line: `A->>B: x`, U+2028, either of them, and
`C->>D: y` have two messages. [fixture:
sequence/db-message-text-line-separator-then-comment-line] [fixture:
sequence/db-participant-description-line-separator-then-comment-line] [fixture:
sequence/db-participant-id-line-separator-then-comment-line] [fixture:
sequence/db-title-line-separator-then-comment-line] [fixture:
sequence/db-acc-title-line-separator-then-comment-line] [fixture:
sequence/db-acc-descr-line-separator-then-comment-line] [fixture:
sequence/db-acc-descr-block-line-separator-then-comment-line] [fixture:
sequence/db-box-line-separator-then-comment-line] [fixture:
sequence/db-message-text-line-separator-then-directive-line] [fixture:
sequence/db-message-text-line-separator-then-empty-line]

## The arrows

The `type` of a message is a number given by the line and the markers of its
arrow (see [SequenceArrow](../../../spec/docs/ast/sequence.md#sequencearrow)):

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

## Box colours

mermaid.js splits the text of a box into a colour candidate and the rest, and
asks the browser whether the candidate is a colour (see
[`parseBoxData()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/sequenceDb.ts#L394-L419)).
The answer does not come from the text, so the `name`, `fill`, and `wrap` of a
box are given from outside the tree, as a value of the configuration is.

The text that the split gets runs from the colour candidate, or from the text
when there is none, to the end of the `text` unit, the whitespace at its end
included. The split trims the other whitespace at the ends of the parts, so of
that whitespace only a U+2028 or U+2029 changes the result, and the value of the
[SequenceBoxText](../../../spec/docs/ast/sequence.md#sequenceboxtext) holds the
text up to the last of them: it is the text that the split reads. Its pattern
reads a U+2028 or U+2029 in one place only: in the whitespace between `rgb`,
`rgba`, `hsl`, or `hsla` and the `(` of a colour candidate. When the text holds
a U+2028 or U+2029 anywhere else, also only at its end, the split does not
match, and the box has the fill `transparent` and no name, whatever the text,
and no answer is asked for: `box red-team` and `box aqua`, each followed by
U+2028 at the end of the line, also with whitespace around the U+2028, and
`box red`, U+2029, and `team`, have no name and the fill `transparent`, while
`box red-team` followed by spaces has the fill `red` and the name `-team`. The
same holds for a U+2028 between the arguments of a colour function, as in
`box rgb(1,`, U+2028, and ` 2, 3) G`; for one in the whitespace before the `(`
together with one at the end, as in `box rgb`, U+2028, `(1, 2, 3) G`, and
U+2028; for one inside a word, as in `box re`, U+2028, and `d team`; and for one
in a text without a colour candidate, as in `box -x`, U+2028, and `y`. A U+2028
before the text is whitespace that the line context reads as nothing (rule 1 of
[The line context](../../../spec/docs/diagrams/sequence.md#the-line-context)),
so `box`, a space, U+2028, and `red team` has the fill `red` and the name
`team`. Where the only such characters lie in that whitespace of a colour
candidate, the split matches, and the candidate, as `rgb (0, 0, 255)` below, is
no colour: `box rgb`, U+2028, and `(1, 2, 3) G`, and the same with `hsl` and two
U+2029, have the fill `transparent` and the whole text, the U+2028 or U+2029
included, as the name, while `box rgb(1, 2, 3)`, U+2028, and ` G` has no name.
`box rgba`, U+2028, and `(1, 2, 3, 0.5) G`, `box hsla`, U+2029, and
`(1, 2%, 3%, 0.5) G`, and `box rgb`, a space, U+2028, U+2029, a space, and
`(1, 2, 3) G` have the fill `transparent` and the whole text as the name too.
[fixture: sequence/db-box-line-separator-in-colour-function] [fixture:
sequence/db-box-paragraph-separator-in-colour-function] [fixture:
sequence/db-box-line-separator-after-colour-function] [fixture:
sequence/db-box-line-separator-at-end] [fixture:
sequence/db-box-spaces-around-line-separator-at-end] [fixture:
sequence/db-box-colour-then-spaces-and-line-separator] [fixture:
sequence/tokens-box-text-trailing-spaces] [fixture:
sequence/db-box-paragraph-separator-in-text] [fixture:
sequence/db-box-colour-then-line-separator] [fixture:
sequence/db-box-line-separator-before-text] [fixture:
sequence/db-box-line-separator-in-colour-arguments] [fixture:
sequence/db-box-line-separator-in-colour-function-and-at-end] [fixture:
sequence/db-box-line-separator-in-word-candidate] [fixture:
sequence/db-box-line-separator-without-colour-candidate] [fixture:
sequence/db-box-line-separator-in-rgba-function] [fixture:
sequence/db-box-paragraph-separator-in-hsla-function] [fixture:
sequence/db-box-spaces-and-separators-in-colour-function]

Given the answer, they come from the SequenceBoxText (see
[SequenceBoxText](../../../spec/docs/ast/sequence.md#sequenceboxtext)). When the
colour candidate is a colour, `fill` is the candidate and the name comes from
the remainder; otherwise `fill` is `transparent` and the name comes from the
whole text. A wrap prefix at the start of the name sets `wrap` as in a text part
(see [Text parts](../../../spec/docs/diagrams/sequence.md#text-parts)), and the
name is the rest; when it is empty, or the box has no text, the box has no
`name`. Without a prefix, `wrap` is the wrap setting of the configuration, for a
box without text, with only a colour, or with a name, and `nowrap:` gives false,
after a colour or not. [fixture: sequence/config-wrap-site-box] [fixture:
sequence/config-wrap-site-box-nowrap-prefix] The prefix alone leaves no name,
and it may follow one `:`: `box aqua wrap:` has `wrap` true and no name, and
`box aqua :wrap:G` has `wrap` true and the name `G`. [fixture:
sequence/db-box-wrap-prefix-only] [fixture: sequence/db-box-wrap-colon-prefix]
With the answers of a browser:

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

## Data blocks in the Db

The `type` and the description that a participant's `@{ ... }` block sets come
from `dataBlockEffects` of `@mmd-toolkit/tests`, one entry for each participant
statement with a data block (see
[`dataBlockEffects`](../embedded-data.md#datablockeffects)). The description
from `as` comes before the one from the block:
`participant A@{ "alias": "Q" } as R` has the description `R`. [fixture:
sequence/db-data-block-alias-and-as] A participant that exists already and is
recorded anew by a statement with `as` gets the type of its data block as a new
participant does: `participant A as Alice`, then
`participant A@{ "type": "queue" } as Bob`, gives A the description `Bob` and
the type `queue`. After `create`, the data block gives the type as well:
`create participant A@{ "type": "queue" }` has the type `queue` for A, which
`createdActors` records with `messageIndex` 0. [fixture:
sequence/db-data-block-existing-participant-with-as] [fixture:
sequence/db-data-block-create-participant]
