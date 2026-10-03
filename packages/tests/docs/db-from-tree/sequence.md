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
this is the wrap setting that a text without a wrap prefix gets: `wrap` of the
configuration, or else `sequence.wrap`, or else false. [fixture:
sequence/config-wrap-site] [fixture: sequence/config-sequence-wrap-site]
[fixture: sequence/config-wrap-site-nowrap-prefix]

## Building the summary from the tree

The statements are applied in source order, a block's own entries before and
after its body, and each statement as follows. The **text** of a text part below
is its `text` unit without the whitespace at its ends, or the empty text when it
has none (see [Text parts](../../../spec/docs/diagrams/sequence.md#text-parts));
its **wrap** is true after `wrap:`, false after `nowrap:`, and the wrap setting
of the configuration otherwise.

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
[Data blocks](#data-blocks-in-the-db)). The other statements that add a
participant, which **Creating an existing participant** in
[Rejections outside the grammar](../../../spec/docs/diagrams/sequence.md#rejections-outside-the-grammar)
lists, first add each id they name with no description and the kind
`participant`, so an id that exists already is not changed. [fixture:
sequence/lex-activate-id-space]

**Create and destroy.** `create` before a participant statement is rejected when
a participant with that id exists already (see
[Rejections outside the grammar](../../../spec/docs/diagrams/sequence.md#rejections-outside-the-grammar));
otherwise it adds the participant, and records the id in `createdActors` with
`messageIndex` the number of entries in `messages` so far. `destroy` records the
id in `destroyedActors` in the same way. [fixture:
sequence/db-create-participant] [fixture: sequence/db-destroy-participant]
[fixture: sequence/db-create-participant-before-message] A destroy statement
with `create` does what `create participant` does with its id: it adds the
participant with the kind `participant` and the id as its description, and
records it in `createdActors`; it records nothing in `destroyedActors`, and the
checks after `create` apply to it (see
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
[`embedded-data-opaque`](../../../spec/docs/known-divergences/embedded-data-opaque.md),
because mermaid.js never rejects an input because of it, and the tree keeps it
as text like any other. [fixture: sequence/db-links-not-json] [fixture:
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

**Titles.** `title` sets the title to the value of its SequenceTitleStatement,
the text of the `title-text` unit as it is written, whitespace included:
`title`, two spaces, `x`, and two spaces has the title of a space, `x`, and two
spaces, and `title` followed by four spaces the title of three spaces. `title:`
does the same. `accTitle:` sets the accessibility title, and `accDescr:` and
`accDescr {` the description, as in
[flowchart.md](./flowchart.md#building-the-summary-from-the-tree): without
whitespace at the ends, each line feed and the whitespace after it read as one
line feed, a later statement replacing an earlier one, an `accDescr {` block
that is not closed setting the empty description, and a closed block without
text changing nothing. [fixture: sequence/db-title-spaces] [fixture:
sequence/db-title-whitespace-only] [fixture: sequence/db-title-legacy] [fixture:
sequence/db-acc-descr-block-lines] [fixture:
sequence/db-acc-descr-block-unclosed] [fixture:
sequence/db-acc-descr-line-alone] [fixture:
sequence/db-acc-descr-block-after-message]

The statements are applied in source order, inside blocks too, and each of the
three values keeps the last one set. The title starts as the title of the
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
`accDescr: x`, `accDescr {}` and `accDescr { }` keep `x`. [fixture:
sequence/db-title-replaces-frontmatter] [fixture: sequence/db-title-replaces]
[fixture: sequence/db-acc-title-replaces] [fixture:
sequence/db-acc-descr-replaces] [fixture:
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

**Ignored statements.** A SequenceIgnoredStatement changes nothing, also after
`end` on the same line: a line with only `)` is such a statement. [fixture:
sequence/lex-invalid-line-parenthesis] [fixture:
sequence/gram-invalid-after-end]

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
`box red-team` followed by spaces has the fill `red` and the name `-team`. A
U+2028 before the text is whitespace that the line context reads as nothing
(rule 1 of
[The line context](../../../spec/docs/diagrams/sequence.md#the-line-context)),
so `box`, a space, U+2028, and `red team` has the fill `red` and the name
`team`. Where the only such characters lie in that whitespace of a colour
candidate, the split matches, and the candidate, as `rgb (0, 0, 255)` below, is
no colour: `box rgb`, U+2028, and `(1, 2, 3) G`, and the same with `hsl` and two
U+2029, have the fill `transparent` and the whole text, the U+2028 or U+2029
included, as the name, while `box rgb(1, 2, 3)`, U+2028, and ` G` has no name.
[fixture: sequence/db-box-line-separator-in-colour-function] [fixture:
sequence/db-box-paragraph-separator-in-colour-function] [fixture:
sequence/db-box-line-separator-after-colour-function] [fixture:
sequence/db-box-line-separator-at-end] [fixture:
sequence/db-box-spaces-around-line-separator-at-end] [fixture:
sequence/db-box-colour-then-spaces-and-line-separator] [fixture:
sequence/tokens-box-text-trailing-spaces] [fixture:
sequence/db-box-paragraph-separator-in-text] [fixture:
sequence/db-box-colour-then-line-separator] [fixture:
sequence/db-box-line-separator-before-text]

Given the answer, they come from the SequenceBoxText (see
[SequenceBoxText](../../../spec/docs/ast/sequence.md#sequenceboxtext)). When the
colour candidate is a colour, `fill` is the candidate and the name comes from
the remainder; otherwise `fill` is `transparent` and the name comes from the
whole text. A wrap prefix at the start of the name sets `wrap` as in a text part
(see [Text parts](../../../spec/docs/diagrams/sequence.md#text-parts)), and the
name is the rest; when it is empty, or the box has no text, the box has no
`name`. With the answers of a browser:

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
sequence/db-data-block-alias-and-as]
