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

## In a class diagram

- When the first unit of the diagram text is not the header keyword, as in
  `classDiagramX`, `range` is that unit, and the message is
  `A class diagram starts with classDiagram or classDiagram-v2`. The lexer
  reports it as soon as it reads the unit, also where the text then ends in a
  context that may not end there.
- Where no rule of the lexer matches, `range` is the character there, as at the
  `"` of a string that is not closed.
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: the `{` of a
  member body or a namespace body
  (`The member body has no } before the end of the text`,
  `The namespace body has no } before the end of the text`), the first `~` of a
  generic type (`The generic type has no closing ~ before the end of the text`),
  the `call` and the `(` of a callback, as in a flowchart, `accTitle` and
  `accDescr` (`accTitle has no text before the end of the text`,
  `accDescr has no text before the end of the text`), and the `accDescr` of a
  description block
  (`The description block has no } before the end of the text`).
- For a method line that cannot be divided, `range` is the member text, the line
  without the whitespace at its ends, and the message is
  `A method line needs a ( that is not its first character and that a ) follows`.
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart.
- For an annotation statement for a class that does not exist, a rejection
  outside the grammar, `range` is the class name after the annotation, and the
  message is `An annotation statement needs a class that exists`.

## In a state diagram

- Where no rule of the lexer matches, `range` is the character there. When only
  whitespace follows, so that the text ends there, the rule for the end of the
  text below applies.
- For two words between `state` and `{`, `range` runs from the first word to the
  `{`, and the message is `A state name before { must be a single word`.
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: the `{` of a
  composite body (`The composite state has no } before the end of the text`),
  the `"` that opens the string after `state`
  (`The string has no closing " before the end of the text`), the first `"`
  after `note` of a floating note
  (`The floating note has no as before the end of the text`), the keyword `note`
  of a note without its position, its state, or its text
  (`The note has no text before the end of the text`,
  `The note has no state before the end of the text`, and
  `The note has no end note before the end of the text`, also for a note over
  lines that no line of `end note` follows), `scale`
  (`scale has no width before the end of the text`), and `classDef`, `class`,
  and `style` with nothing after them
  (`classDef has no class name before the end of the text`,
  `class has no state before the end of the text`, and
  `style has no state before the end of the text`).
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart.
- For a composite state with more than one description, a rejection outside the
  grammar, `range` is the statement that first gave the state a body, which for
  a region of a divided body is the divider statement that closes it, and the
  message is `A composite state can have only one description`.

## Known divergences

Where a [known divergence](../../spec/docs/known-divergences.md) makes the input
rejected, `range` is the form that causes it, and the message names the cause:

- `directive-as-token-boundary`: for a directive inside a token that may not be
  cut, a name, a number, a keyword, an arrow, or another delimiter, `range` is
  the directive, and the message is `Unexpected directive`.
- `ignored-semicolon-as-token-boundary`: for a `;` that the line rule ignores
  inside such a token, `range` is the `;`, and the message is
  `Unexpected ; that the line rule ignores`.
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
  `An empty description block can only be written where a statement starts or ends`.
  The grammar finds it where it stops, as for a `click`: when the unit that it
  cannot read, or the first unit after it that is not a `space` unit, belongs to
  an empty form. An input that mermaid.js rejects as well, such as `A[""]`, is
  reported in the same way. Between a `click` at the start of a statement and
  its click ids, the first empty string is reported; when no click id follows
  the empty strings, the `click` is. In a class diagram, the empty forms also
  include an empty backquoted name, its two backquotes, and an empty generic
  type, its two `~`, with the messages
  `An empty backquoted name cannot be written here` and
  `An empty generic type can only end a class name`. An empty generic type is
  found where the grammar cannot read the unit after it, as in `class A~~B`. In
  a state diagram, an empty description block is also found where the grammar
  cannot read the unit right after it: in `A accDescr {} --> B`, the block after
  `A` is a statement, the `-->` after it starts none, and the block is reported.
  After the last unit of a statement that needs a separator, or of the header of
  a flowchart or a class diagram, empty description blocks before the separator
  or the line break are statements of their own; when none follows them, the
  first of them lies inside the statement and is reported, in every diagram
  type: in `A accDescr {} B` and `flowchart LR accDescr {} A` of a flowchart and
  in `click A "u" "t" accDescr {} B` of a state diagram, the block is reported.
  A flowchart statement or header with such blocks before its separator is read
  without them, so whitespace around them that the statement does not take is
  reported where it would be without them: in `flowchart LR accDescr {};A`, the
  `;` after the space is reported, as in `flowchart LR ;A`.

`html-tag-in-frontmatter` changes which `"` characters are read as `'`. The
parser does not tell that apart, so a rejection that follows from it is reported
by the rules above.
