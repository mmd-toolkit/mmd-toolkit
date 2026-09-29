# Where a `ParseError` points

Japanese version: [error-positions.ja.md](./error-positions.ja.md)

The specification does not define error positions. This package chooses them as
follows. The `index` of a `ParseError` is always the start of its `range`.

## Before the diagram

- No detector matches: `range` runs from the first character that is not trivia
  to the end of its line. When the text is all trivia, such as empty text,
  whitespace, or comment lines, `range` is the empty range at the end of the
  text: `[2, 2]` for two spaces.
- The `---` pseudo-diagram: `range` covers the three `-` characters that start
  the block.

## In a flowchart

- Where no rule of the lexer matches, `range` is the character there.
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: the `click`
  whose click context has read nothing
  (`click has no click id before the end of the text`), the `call` that entered
  the callback name context
  (`The callback after call has no ( before the end of the text`), and the `(`
  that opens the callback arguments
  (`The arguments of the callback have no ) before the end of the text`).
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace. For a unit that is all whitespace, it is the empty range at the
  start of the unit. At the end of the text, it is the empty range at the end of
  the text, with the message `Unexpected end of text`; so it is where the
  grammar stops at a unit of whitespace that ends the text, as after
  `style A fill:red,`. Elsewhere the message is `Unexpected token`.
- For a `linkStyle` number that names no link, `range` is the number.
- For a subgraph whose member `hasOwnProperty` is followed by another member,
  `range` is that other member, the first after `hasOwnProperty`. A member is a
  vertex id, the name of a nested subgraph, the value of an accessibility
  statement, or the `;` of an empty statement.

## In a sequence diagram

- Where no rule of the lexer matches, `range` is the character there.
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart.
- For a rejection outside the grammar, which mermaid.js makes while it builds
  the Db, `range` is what makes it, and the message says why:
  - deactivating a participant that is not active
    (`A participant that is not active cannot be deactivated`): the id after
    `deactivate`, or the id before the arrow of a message with `-`;
  - creating a participant that exists already
    (`A participant that exists already cannot be created`): the id after
    `create` and its keyword;
  - a message after `create` that does not go to the created participant
    (`The message after create must go to the created participant`), and a
    message after `destroy` that neither comes from nor goes to the destroyed
    participant
    (`The message after destroy must come from or go to the destroyed participant`):
    the message;
  - a participant statement inside a box for a participant that has another box
    already (`A participant cannot be in two boxes`): the id of the statement.

## Known divergences

Where a [known divergence](../../spec/docs/known-divergences.md) makes the input
rejected, `range` is the form that causes it, and the message names the cause:

- `directive-as-token-boundary`: for a directive inside a unit that may not have
  one, such as an arrow, a keyword, or a string, `range` is the directive, and
  the message is `Unexpected directive`.
- `click-reserved-word`: for a `click` that does not start a click statement,
  `range` is the word `click`, and the message is
  `click is a reserved word: it may only start a click statement`. The grammar
  finds it where it stops: when the unit that it cannot read, or the first unit
  after it that is not a `space` unit, is a `click` unit, and when a `click` at
  the start of a statement has no click id after it. An input that mermaid.js
  rejects as well, such as `click A href "u" click _blank`, is reported in the
  same way.
- `tokenless-empty-forms`: for an empty form that no rule takes, `range` is the
  whole form without the whitespace at its ends: the empty string, an empty call
  from its `call` to its `)`, or an empty description block from its `accDescr`
  to its `}`. The message is `An empty string cannot be written here`,
  `An empty call cannot be written here`, or
  `An empty description block can only be written where a statement starts`. The
  grammar finds it where it stops, as for a `click`: when the unit that it
  cannot read, or the first unit after it that is not a `space` unit, belongs to
  an empty form. An input that mermaid.js rejects as well, such as `A[""]`, is
  reported in the same way. Between a `click` at the start of a statement and
  its click ids, the first empty string is reported; when no click id follows
  the empty strings, the `click` is.

`html-tag-in-frontmatter` changes which `"` characters are read as `'`. The
parser does not tell that apart, so a rejection that follows from it is reported
by the rules above.
