# Where a `ParseError` points

Japanese version: [error-positions.ja.md](./error-positions.ja.md)

The specification does not define error positions. This package chooses them as
follows. The `index` of a `ParseError` is always the start of its `range`.

## Before the diagram

- No detector matches: `range` runs from the first character that is not trivia
  to the end of its line. When the text is all trivia, such as empty text,
  whitespace, or comment lines, `range` is the empty range at the end of the
  text: `[2, 2]` for two spaces. [fixture: common/detect-boundary-swimlane]
  [fixture: common/empty] [fixture: common/comment-only] [fixture:
  common/whitespace-only]
- The `---` pseudo-diagram: `range` covers the three `-` characters that start
  the block. [fixture: common/frontmatter-adjacent-delimiters]
- A directive found once more before the header
  ([Diagram detection](../../spec/docs/common.md#diagram-detection)): `range`
  covers its opening `%%{`, from its first `%` to its `{`, with the directives
  and comment regions of the source between them; of several, the first.
  [fixture: flowchart/detect-directive-across-directive] [fixture:
  sequence/detect-directive-across-directive] [fixture:
  sequence/detect-directive-across-comment-line-closed] [fixture:
  class/detect-directive-across-directive] [fixture:
  state/detect-directive-across-directive]

## In a flowchart

- Where no rule of the lexer matches, `range` is the character there: both code
  units of a character outside the Basic Multilingual Plane. [fixture:
  flowchart/lex-non-bmp-character-unexpected] [fixture:
  flowchart/gram-edge-id-space-before-at]
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: the `click`
  whose click context has read nothing
  (`click has no click id before the end of the text`), the `call` that entered
  the callback name context
  (`The callback after call has no ( before the end of the text`), and the `(`
  that opens the callback arguments
  (`The arguments of the callback have no ) before the end of the text`).
  [fixture: flowchart/lex-click-at-end-of-text] [fixture:
  flowchart/lex-callback-no-parenthesis] [fixture:
  flowchart/lex-callback-arguments-end-of-text]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace. For a unit that is all whitespace, it is the empty range at the
  start of the unit. At the end of the text, it is the empty range at the end of
  the text, with the message `Unexpected end of text`; so it is where the
  grammar stops at a unit of whitespace that ends the text, as after
  `style A fill:red,`. Elsewhere the message is `Unexpected token`. [fixture:
  flowchart/gram-circle-gap] [fixture:
  flowchart/gram-empty-description-block-after-class-statement] [fixture:
  flowchart/db-style-trailing-comma]
- For a `linkStyle` number that names no link, `range` is the number. [fixture:
  flowchart/gram-linkstyle-before-link]
- For a subgraph whose member `hasOwnProperty` is followed by another member,
  `range` is that other member, the first after `hasOwnProperty`. A member is a
  vertex id, the name of a nested subgraph, the value of an accessibility
  statement, or the `;` of an empty statement. [fixture:
  flowchart/gram-subgraph-member-has-own-property-then-member] [fixture:
  flowchart/gram-subgraph-member-has-own-property-nested] [fixture:
  flowchart/gram-subgraph-member-has-own-property-acc-title] [fixture:
  flowchart/gram-subgraph-member-has-own-property-empty-statement]

## In a sequence diagram

- Where no rule of the lexer matches, `range` is the character there. [fixture:
  sequence/lex-id-context-line-break]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart. [fixture: sequence/gram-box-create-participant] [fixture:
  sequence/lex-keyword-before-dash]
- For a rejection outside the grammar, which mermaid.js makes while it builds
  the Db, `range` is what makes it, and the message says why:
  - deactivating a participant that is not active
    (`A participant that is not active cannot be deactivated`): the id after
    `deactivate`, or the id before the arrow of a message with `-`; [fixture:
    sequence/gram-deactivate-inactive] [fixture:
    sequence/gram-deactivate-after-message]
  - creating a participant that exists already
    (`A participant that exists already cannot be created`): the id after
    `create` and its keyword; [fixture: sequence/gram-create-after-message]
  - a message after `create` that does not go to the created participant
    (`The message after create must go to the created participant`), and a
    message after `destroy` that neither comes from nor goes to the destroyed
    participant
    (`The message after destroy must come from or go to the destroyed participant`):
    the message; [fixture: sequence/gram-create-message-from-created] [fixture:
    sequence/gram-create-then-destroy-message-to-other]
  - a participant statement inside a box for a participant that has another box
    already (`A participant cannot be in two boxes`): the id of the statement.
    [fixture: sequence/gram-box-participant-in-two-boxes]

## In a class diagram

- When the first unit of the diagram text is not the header keyword, as in
  `classDiagramX`, `range` is that unit, and the message is
  `A class diagram starts with classDiagram or classDiagram-v2`. The lexer
  reports it as soon as it reads the unit, also where the text then ends in a
  context that may not end there. [fixture:
  class/div-headerless-repeated-header] [fixture:
  class/div-headerless-empty-title]
- Where no rule of the lexer matches, `range` is the character there, as at the
  `"` of a string that is not closed. [fixture: class/lex-string-unclosed]
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
  (`The description block has no } before the end of the text`). [fixture:
  class/lex-acc-descr-at-end] [fixture: class/lex-member-body-unclosed]
  [fixture: class/lex-namespace-body-unclosed] [fixture:
  class/lex-generic-unclosed] [fixture: class/lex-call-at-end] [fixture:
  class/lex-callback-arguments-unclosed] [fixture: class/lex-acc-title-at-end]
  [fixture: class/lex-acc-descr-block-unclosed]
- For a method line that cannot be divided, `range` is the member text, the line
  without the whitespace at its ends, and the message is
  `A method line needs a ( that is not its first character and that a ) follows`.
  [fixture: class/lex-member-method-parenthesis-first]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart. [fixture: class/gram-class-annotation-then-css-class]
  [fixture: class/header-only]
- For an annotation statement for a class that does not exist, a rejection
  outside the grammar, `range` is the class name after the annotation, and the
  message is `An annotation statement needs a class that exists`. [fixture:
  class/gram-annotation-after-name-statement]

## In a state diagram

- Where no rule of the lexer matches, `range` is the character there. When only
  whitespace follows, so that the text ends there, the rule for the end of the
  text below applies. [fixture: state/lex-composite-ignored-percent-rejected]
  [fixture: state/gram-scale-without-width]
- For two words between `state` and `{`, `range` runs from the first word to the
  `{`, and the message is `A state name before { must be a single word`.
  [fixture: state/lex-state-two-names-body]
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
  `style has no state before the end of the text`). [fixture:
  state/lex-note-without-position-at-end] [fixture:
  state/lex-note-no-state-at-end] [fixture: state/lex-class-def-no-name-at-end]
  [fixture: state/lex-class-statement-no-state-at-end] [fixture:
  state/lex-style-statement-no-state-at-end] [fixture:
  state/lex-composite-unclosed] [fixture: state/lex-alias-string-unclosed]
  [fixture: state/lex-floating-note-string-unclosed] [fixture:
  state/lex-end-note-two-spaces] [fixture: state/lex-note-unclosed-at-end]
  [fixture: state/lex-scale-at-end]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart. [fixture: state/gram-click-trailing-word] [fixture:
  state/gram-click-href-at-end]
- For a composite state with more than one description, a rejection outside the
  grammar, `range` is the statement that first gave the state a body, which for
  a region of a divided body is the divider statement that closes it, and the
  message is `A composite state can have only one description`. [fixture:
  state/gram-composite-terminal-two-descriptions] [fixture:
  state/gram-region-two-descriptions]

## In an ER diagram

- Where no rule of the lexer matches, which only happens in the style context,
  `range` is the character there, as at the `.` of `font-size:1.5em` in a
  `classDef` statement. [fixture: er/lex-classdef-dot]
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: the `{` of an
  attribute block (`The attribute block has no } before the end of the text`),
  `classDef` and `style`, where whitespace at the end of the text has taken the
  line feed after the last character
  (`The classDef or style statement has no line feed before the end of the text`),
  `accTitle` and `accDescr` (`accTitle has no text before the end of the text`,
  `accDescr has no text before the end of the text`), and the `accDescr` of a
  description block
  (`The description block has no } before the end of the text`). For a
  backquoted word that the text ends in, `range` is its opening backquote, and
  the message is
  ``The backquoted word has no closing ` before the end of the text``. [fixture:
  er/lex-block-unclosed] [fixture: er/lex-block-unclosed-empty] [fixture:
  er/lex-classdef-trailing-space-at-end] [fixture:
  er/lex-style-trailing-tab-at-end] [fixture: er/lex-acc-title-at-end] [fixture:
  er/lex-acc-descr-at-end] [fixture: er/lex-acc-descr-block-unclosed] [fixture:
  er/lex-backquote-unclosed]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart. [fixture: er/lex-hash-after-name] [fixture:
  er/gram-subgraph-unclosed]

## In a Gantt chart

- Every character starts a unit in some rule of every context, so the lexer
  rejects an input only at the end of the text.
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: `click`
  (`click has no click id before the end of the text`), the opening `"` of the
  string of a link (`The string has no closing " before the end of the text`),
  the `call` and the `(` of a callback, as in a flowchart, `accTitle` and
  `accDescr` (`accTitle has no text before the end of the text`,
  `accDescr has no text before the end of the text`), and the `accDescr` of a
  description block
  (`The description block has no } before the end of the text`). [fixture:
  gantt/lex-click-whitespace-at-end] [fixture: gantt/lex-href-unclosed]
  [fixture: gantt/lex-href-unclosed-lines] [fixture:
  gantt/lex-callback-name-at-end] [fixture:
  gantt/lex-callback-arguments-unclosed] [fixture: gantt/lex-acc-title-at-end]
  [fixture: gantt/lex-acc-descr-at-end] [fixture:
  gantt/lex-acc-descr-block-unclosed]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart: a line that starts with a date is reported at the date, and
  the task text `a` without data at the end of the text at the end. [fixture:
  gantt/lex-date-line] [fixture: gantt/lex-task-text-only] [fixture:
  gantt/lex-click-id-at-end]
- For the two rejections outside the grammar, which the grammar makes where it
  reads the statement, `range` is the `topAxis` keyword, with the message
  `A topAxis statement cannot be written in a Gantt chart`, and the tags of a
  task whose data holds tags only, from the first to the last, with the message
  `The data of a task needs an item after its tags`. [fixture:
  gantt/db-top-axis-statement] [fixture: gantt/lex-topaxis-then-title] [fixture:
  gantt/gram-task-tags-only] [fixture: gantt/gram-task-tags-only-two]

## In a journey diagram

- Every character starts a unit in some rule of every context, so the lexer
  rejects an input only at the end of the text.
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: `accTitle` and
  `accDescr` (`accTitle has no text before the end of the text`,
  `accDescr has no text before the end of the text`), and the `accDescr` of a
  description block
  (`The description block has no } before the end of the text`). [fixture:
  journey/lex-acc-title-at-end] [fixture: journey/lex-acc-title-space-at-end]
  [fixture: journey/lex-acc-title-line-feed-at-end] [fixture:
  journey/lex-acc-descr-at-end] [fixture: journey/lex-acc-descr-block-unclosed]
  [fixture: journey/lex-acc-descr-block-unclosed-empty] [fixture:
  journey/lex-acc-descr-block-unclosed-lines]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, the empty range at the start of a `newline` unit, and at the end
  of the text the empty range at the end of the text, as in a flowchart: the
  task text `a` without data followed by a line feed is reported at that line
  feed, a colon with nothing after it on its line and a `;` at themselves,
  `journey2` at the task text, and the task text `title` at the end of the text
  at the end. [fixture: journey/lex-task-text-only] [fixture:
  journey/lex-task-colon-at-end] [fixture: journey/lex-semicolon-line] [fixture:
  journey/header-digit-suffix] [fixture: journey/lex-title-at-end]

## In a requirement diagram

- Where no rule of the lexer matches, `range` is the character there: a `;` or a
  `<` where a unit starts in the statement context, a letter outside ASCII after
  a keyword, and a tab or a `.` in the style context. [fixture:
  requirement/lex-semicolon-line] [fixture: requirement/lex-less-than-alone]
  [fixture: requirement/lex-keyword-then-e-acute] [fixture:
  requirement/lex-style-tab] [fixture: requirement/lex-style-dot]
- For a string that the text ends in, `range` is its opening quote, and the
  message is `The string has no closing " before the end of the text`. [fixture:
  requirement/lex-string-unclosed]
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: `accTitle` and
  `accDescr` (`accTitle has no text before the end of the text`,
  `accDescr has no text before the end of the text`), and the `accDescr` of a
  description block
  (`The description block has no } before the end of the text`). [fixture:
  requirement/lex-acc-title-at-end] [fixture:
  requirement/lex-acc-title-line-feed-at-end] [fixture:
  requirement/lex-acc-descr-at-end] [fixture:
  requirement/lex-acc-descr-block-unclosed]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, the empty range at the start of a `newline` unit, and at the end
  of the text the empty range at the end of the text, as in a flowchart: a
  `title` line is reported at its `title` unit, from `title` to the end of its
  text, a `%` in a style at itself, a field without a value at the line feed
  after its `:`, and a `class` statement with one list at the end of the text at
  the end. [fixture: requirement/lex-title-statement] [fixture:
  requirement/lex-style-percent] [fixture:
  requirement/gram-requirement-value-empty] [fixture:
  requirement/lex-class-one-list]

## In a mindmap

- Where no rule of the lexer matches, `range` is the character there: a single
  `{` or a `}` after a node text, and a `}` that does not start `}}` in a shape.
  [fixture: mindmap/lex-node-text-open-brace] [fixture:
  mindmap/lex-node-text-close-brace] [fixture:
  mindmap/gram-shape-text-close-brace]
- For a string that the text ends in, `range` is its opening quote, and the
  message is `The string has no closing " before the end of the text`; for a
  markdown string so, its opening quote, with the message
  ``The markdown string has no closing `" before the end of the text``. A
  markdown string that its first `` ` `` or `"` ends without `` `" `` is
  reported at its opening quote too, with the message
  ``The markdown string is not closed by `" at its first ` or "``. [fixture:
  mindmap/lex-string-unclosed] [fixture: mindmap/lex-markdown-string-unclosed]
  [fixture: mindmap/lex-markdown-string-quote] [fixture:
  mindmap/lex-markdown-string-then-text]
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: the opener of a
  shape (`The shape has no closer before the end of the text`) and `::icon(`
  (`The icon has no ) before the end of the text`). [fixture:
  mindmap/lex-shape-unclosed] [fixture: mindmap/lex-icon-unclosed]
- When the header ends the text, `range` is the header, and the message is
  `The header cannot end the text`. [fixture:
  mindmap/db-header-without-line-feed] [fixture:
  mindmap/header-directive-at-end]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and at the end of the text the empty range at the end of the text,
  as in a flowchart: `r[]` is reported at its `]`, and `r[text] tail` at `tail`.
  [fixture: mindmap/db-shape-empty-description] [fixture:
  mindmap/db-shape-text-after-end]
- For the two rejections outside the grammar, which the grammar makes where it
  reads the line, `range` is the node that is as indented as the root or less,
  with the message `A node cannot be as indented as the root or less`, and the
  icon or class line before the first node, with the message
  `An icon or a class line needs a node before it`. [fixture:
  mindmap/db-indent-same-as-root] [fixture: mindmap/db-icon-before-node]
  [fixture: mindmap/db-class-before-node]

## In a timeline

- Every character starts a unit in some rule of every context, so the lexer
  rejects an input only at the end of the text.
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: `accTitle` and
  `accDescr` (`accTitle has no text before the end of the text`,
  `accDescr has no text before the end of the text`), and the `accDescr` of a
  description block
  (`The description block has no } before the end of the text`). [fixture:
  timeline/gram-acc-title-empty] [fixture: timeline/gram-acc-descr-empty]
  [fixture: timeline/gram-acc-descr-block-unclosed]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace. Only two units can stand there, as the lexer reads the others in
  the pairs that the grammar takes and rejects a text that ends inside a
  statement: a `:` that starts no event, and a second header. [fixture:
  timeline/gram-event-colon-glued-to-event] [fixture:
  timeline/gram-event-empty-after-colon] [fixture:
  timeline/gram-header-as-later-line]
- For the rejection outside the grammar, which the grammar makes where it reads
  the statement, `range` is the event statement before the first period, from
  its first colon to its last event, with the message
  `An event needs a period before it`. [fixture: timeline/gram-event-first]
  [fixture: timeline/gram-event-after-title]

## In a sankey diagram

- Where no rule of the lexer matches, `range` is the character there: a tab, a
  character outside ASCII, both code units of a character outside the Basic
  Multilingual Plane, and the `#` that starts a complete entity, in a field or
  in a string. [fixture: sankey/gram-tab-in-field] [fixture:
  sankey/gram-quoted-non-ascii] [fixture: sankey/gram-emoji] [fixture:
  sankey/gram-entity-in-quoted-field]
- When the text ends in a string, `range` is its opening `"`, with the message
  `The string has no closing " before the end of the text`. [fixture:
  sankey/gram-quoted-unclosed] [fixture:
  sankey/gram-quoted-unclosed-at-end-of-text]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and the empty range at the start of a unit that is all whitespace,
  with the message `Unexpected token`; where the text ends before a record or a
  field, it is the empty range at the end of the text, with the message
  `Unexpected end of text`. A field before the header, such as `sankeyx`, is
  such a unit. [fixture: sankey/gram-four-columns] [fixture:
  sankey/gram-whitespace-line-between] [fixture: sankey/header-word-suffix]
  [fixture: sankey/gram-two-columns] [fixture: sankey/header-only]
- Two quotes with nothing between them read no unit, so `range` is the unit
  after them, or the end of the text: `"",c,1` is rejected at the `,`. [fixture:
  sankey/gram-quoted-empty] [fixture: sankey/gram-quoted-empty-value]

## In an XY chart

- Where no rule of the lexer matches, `range` is the character there: a
  character that no text without quotes holds, such as `<`, `{` after the
  header, or a character outside ASCII, and the `#` that starts a complete
  entity outside a string and an accessibility text. [fixture:
  xychart/gram-title-bare-angle] [fixture: xychart/gram-header-brace-suffix]
  [fixture: xychart/gram-grid-nonascii-category-bare] [fixture:
  xychart/gram-grid-entity-category-bare]
- When the text ends in a context that may not end there, `range` is what
  entered that context, and the message says what is not closed: the opening `"`
  of a string (`The string has no closing " before the end of the text`), and
  the `[` of the categories
  (`The categories have no ] before the end of the text`) and of the values
  (`The values have no ] before the end of the text`). [fixture:
  xychart/gram-title-quoted-unclosed-at-end] [fixture:
  xychart/gram-x-axis-band-unclosed] [fixture:
  xychart/gram-plot-values-unclosed]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and the empty range at the start of a unit that is all whitespace,
  with the message `Unexpected token`; where the text ends before a statement is
  complete, it is the empty range at the end of the text, with the message
  `Unexpected end of text`. [fixture: xychart/gram-plot-values-extra-text]
  [fixture: xychart/gram-header-after-statement] [fixture:
  xychart/gram-x-axis-empty] [fixture: xychart/gram-title-keyword-alone-at-end]
- An empty string that the grammar does not take as a whole text is rejected at
  it, as the known divergence below, also where mermaid.js rejects the input
  too, as `title ""`. [fixture: xychart/gram-title-empty-string] [fixture:
  xychart/div-empty-string-line]

## In a quadrant chart

- Where no rule of the lexer matches, `range` is the character there: a
  parenthesis, a `|`, and a `"` inside a markdown string. [fixture:
  quadrant/gram-quadrant-parens] [fixture: quadrant/gram-point-parens] [fixture:
  quadrant/gram-quadrant-pipe] [fixture:
  quadrant/gram-markdown-string-quote-inside]
- When the text ends in a context that may not end there, also with only
  whitespace after the last character, `range` is what entered that context, and
  the message says what is not closed: the opening `"` of a string
  (`The string has no closing " before the end of the text`) and of a markdown
  string (``The markdown string has no closing `" before the end of the text``),
  `accTitle` and `accDescr` (`accTitle has no text before the end of the text`,
  `accDescr has no text before the end of the text`), the `accDescr` of a
  description block
  (`The description block has no } before the end of the text`), the `:::` of a
  class name (`::: has no class name before the end of the text`), and the `[`
  of a point (`The point has no ] before the end of the text`). [fixture:
  quadrant/gram-unclosed-axis-quote-at-end] [fixture:
  quadrant/gram-unclosed-markdown-at-end] [fixture:
  quadrant/gram-unclosed-acc-title-at-end] [fixture:
  quadrant/gram-unclosed-acc-descr-at-end] [fixture:
  quadrant/gram-unclosed-acc-block-after-text] [fixture:
  quadrant/gram-unclosed-class-marker-at-end] [fixture:
  quadrant/gram-unclosed-point-after-comma-at-end]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, and the empty range at the start of a unit that is all whitespace,
  a `space` or a `newline` unit, with the message `Unexpected token`; where the
  text ends before a statement is complete, it is the empty range at the end of
  the text, with the message `Unexpected end of text`. [fixture:
  quadrant/header-twice] [fixture: quadrant/gram-name-only] [fixture:
  quadrant/gram-grid-tab-class-name] [fixture:
  quadrant/gram-unclosed-class-name-at-end]
- For the rejection outside the grammar, which the grammar makes once it has
  read the styles of a point or of a class, `range` is the first style that
  mermaid.js does not take, with the message
  `A style must be radius, color, stroke-color, or stroke-width with a value of its form`.
  [fixture: quadrant/gram-style-radius-word] [fixture:
  quadrant/gram-style-upper-case-key]
- An empty string and an empty markdown string are rejected at them, as the
  known divergence below, also where mermaid.js rejects the input too, as
  `"": [0.3, 0.6]`. [fixture: quadrant/gram-name-quoted-empty] [fixture:
  quadrant/div-empty-string-alone]

## In a block diagram

- Where no rule of the lexer matches, `range` is the character there: a label
  without quotes, a `-` inside an id, whitespace inside the brackets of a shape,
  and an unknown direction. [fixture: block/gram-label-unquoted] [fixture:
  block/gram-name-dash] [fixture: block/gram-spec-space-before-string] [fixture:
  block/gram-arrow-unknown]
- When the text ends in a context that may not end there, also with only
  whitespace after the last character, `range` is what entered that context, and
  the message says what is not closed: the opening `"` of a string
  (`The string has no closing " before the end of the text`) and of a markdown
  string (``The markdown string has no closing `" before the end of the text``),
  the opening of a shape
  (`The shape has no closing before the end of the text`), the `]>` of a block
  arrow (`The block arrow has no directions before the end of the text`), the
  `(` before its directions
  (`The directions have no ) before the end of the text`), an opening arrow
  (`The edge label has no arrow before the end of the text`), the `accDescr` of
  a description block
  (`The description block has no } before the end of the text`), `classDef`
  (`classDef has no styles before the end of the text`), and `class` and `style`
  (`class has no ids before the end of the text`,
  `style has no ids before the end of the text`). [fixture:
  block/gram-label-unclosed] [fixture: block/gram-label-backtick-start]
  [fixture: block/gram-label-unclosed-shape] [fixture:
  block/gram-arrow-no-paren] [fixture: block/gram-arrow-unclosed-paren]
  [fixture: block/gram-edge-label-start-without-end] [fixture:
  block/gram-empty-block-unclosed] [fixture: block/gram-class-def-no-name]
  [fixture: block/gram-class-def-no-style] [fixture:
  block/gram-class-apply-no-id]
- Where the grammar cannot read a unit, `range` is that unit without its
  whitespace, with the message `Unexpected token`; where the text ends before a
  statement or a composite is complete, it is the empty range at the end of the
  text, with the message `Unexpected end of text`. The name `DEFAULT` of
  `classDef` is such a unit. [fixture: block/header-only-block-beta] [fixture:
  block/gram-composite-not-closed] [fixture: block/gram-composite-extra-end]
  [fixture: block/gram-edge-to-space] [fixture:
  block/gram-class-def-default-upper]
- For the rejection outside the grammar, which the grammar makes when it reads
  the id of a `style` statement, `range` is that id, commas included, with the
  message `style names no block made before it`. [fixture:
  block/gram-style-undefined] [fixture: block/gram-style-list] [fixture:
  block/gram-style-on-chain]
- An empty string and an empty markdown string are rejected at them, and so is
  an empty description block inside a statement, as the known divergence below,
  also where mermaid.js rejects the input too, as `A[""]`. [fixture:
  block/gram-label-empty] [fixture: block/div-empty-string-line] [fixture:
  block/div-empty-markdown-line] [fixture: block/div-empty-block-in-edge]

## In a kanban diagram

- Where no lexer rule matches, `range` is the character there, with
  `Unexpected character`: a lone `@`, a brace outside a shape, a lone `}` inside
  a label, or an unquoted data caret. [fixture: kanban/gram-node-at] [fixture:
  kanban/gram-grid-open-brace-item-id] [fixture:
  kanban/gram-shape-single-brace-middle] [fixture: kanban/gram-metadata-caret]
- An unclosed string or markdown string is reported at its opening quote. The
  messages are `The string has no closing " before the end of the text` and
  ``The markdown string has no closing `" before the end of the text``. A
  markdown string ending at a quote or backtick without its closing pair is also
  reported at its opening quote, with
  ``The markdown string is not closed by `" at its first ` or "``. [fixture:
  kanban/gram-unclosed-quote] [fixture: kanban/gram-unclosed-markdown] [fixture:
  kanban/gram-markdown-quote] [fixture: kanban/gram-markdown-extra-backtick]
- Other unclosed contexts report what entered them: the shape opener
  (`The shape has no closer before the end of the text`), `::icon(`
  (`The icon has no ) before the end of the text`), `@{`
  (`The data block has no } before the end of the text`), or the opening quote
  of quoted data
  (`The data string has no closing " before the end of the text`). [fixture:
  kanban/gram-unclosed-shape] [fixture: kanban/gram-unclosed-icon] [fixture:
  kanban/gram-metadata-unclosed] [fixture: kanban/gram-metadata-unclosed-quote]
- A header that ends the text is reported at the keyword, with
  `The header cannot end the text`. [fixture: kanban/header-only] [fixture:
  kanban/header-header-directive-only]
- Where the grammar cannot read a unit, `range` is its token range, with
  `Unexpected token`, or the empty range at the start of an all-whitespace unit.
  At the end of the text it is the empty range there, with
  `Unexpected end of text`. [fixture: kanban/gram-empty-label] [fixture:
  kanban/gram-string-plus-space] [fixture: kanban/gram-two-shapes-on-line]
  [fixture: kanban/gram-metadata-adjacent-space]
- The two rejections outside the grammar report the subsequent node that follows
  a node shallower than the first, through its data suffix, with
  `A node cannot follow a node less indented than the first`, and the whole
  decoration before the first node, with
  `An icon or a class line needs a node before it`. [fixture:
  kanban/gram-indent-shallower-followed] [fixture:
  kanban/gram-decoration-before-node] [fixture:
  kanban/gram-decoration-class-before-node]
- Empty strings, markdown strings, icons, and class lines report their whole
  form with the shared empty-form messages below, wherever recognized. [fixture:
  kanban/gram-empty-quoted-label] [fixture: kanban/gram-empty-markdown-shape]
  [fixture: kanban/div-empty-icon-after-shape] [fixture:
  kanban/div-empty-class-after-shape]

## Known divergences

Where a [known divergence](../../spec/docs/known-divergences.md) makes the input
rejected, `range` is the form that causes it, and the message names the cause:

- `directive-as-token-boundary`: for a directive inside a token that may not be
  cut, a name, a number, a keyword, an arrow, or another delimiter, `range` is
  the directive, and the message is `Unexpected directive`. [fixture:
  flowchart/div-directive-in-arrow-length]
- `ignored-semicolon-as-token-boundary`: for a `;` that the line rule ignores
  inside such a token, `range` is the `;`, and the message is
  `Unexpected ; that the line rule ignores`. [fixture:
  flowchart/div-ignored-semicolon-in-arrow]
- `click-reserved-word`: for a `click` that does not start a click statement,
  `range` is the word `click`, and the message is
  `click is a reserved word: it may only start a click statement`. The grammar
  finds it where it stops: when the unit that it cannot read, or the first unit
  after it that is not a `space` unit, is a `click` unit, and when a `click` at
  the start of a statement has no click id after it. An input that mermaid.js
  rejects as well, such as `click A href "u" click _blank`, is reported in the
  same way. [fixture: flowchart/gram-click-mid-statement-tooltip] [fixture:
  flowchart/gram-ampersand-then-click-statement] [fixture:
  flowchart/gram-click-bare-before-vertex-statement] [fixture:
  flowchart/gram-click-mid-statement-link-target]
- `tokenless-empty-forms`: for an empty form that no rule takes, `range` is the
  whole form without the whitespace at its ends: the empty string, an empty call
  from its `call` to its `)`, or an empty description block from its `accDescr`
  to its `}`. The message is `An empty string cannot be written here`,
  `An empty call cannot be written here`, or
  `An empty description block can only be written where a statement starts or ends`.
  [fixture: flowchart/gram-click-empty-call-only] [fixture:
  flowchart/gram-empty-description-block-before-link] The grammar finds it where
  it stops, as for a `click`: when the unit that it cannot read, or the first
  unit after it that is not a `space` unit, belongs to an empty form. An input
  that mermaid.js rejects as well, such as `A[""]`, is reported in the same way.
  [fixture: flowchart/gram-label-empty-string] Between a `click` at the start of
  a statement and its click ids, the first empty string is reported; when no
  click id follows the empty strings, the `click` is. [fixture:
  flowchart/gram-click-empty-string-before-id] [fixture:
  flowchart/gram-click-bare-before-vertex-statement] In a class diagram, the
  empty forms also include an empty backquoted name, its two backquotes, and an
  empty generic type, its two `~`, with the messages
  `An empty backquoted name cannot be written here` and
  `An empty generic type can only end a class name`. An empty generic type is
  found where the grammar cannot read the unit after it, as in `class A~~B`.
  [fixture: class/div-empty-backquoted-in-name] [fixture:
  class/div-empty-generic-in-name] An empty string right after a class name is
  found where the grammar reads it, unless a relation end or a line follows it,
  which makes it the cardinality of a relation: `A ""` reports the empty string.
  [fixture: class/div-empty-string-after-name] In a state diagram, an empty
  description block is also found where the grammar cannot read the unit right
  after it: in `A accDescr {} --> B`, the block after `A` is a statement, the
  `-->` after it starts none, and the block is reported. [fixture:
  state/div-empty-description-block-in-transition] After the last unit of a
  statement that needs a separator, or of the header of a flowchart or a class
  diagram, empty description blocks before the separator or the line break are
  statements of their own; when none follows them, the first of them lies inside
  the statement and is reported, in every diagram type: in `A accDescr {} B` and
  `flowchart LR accDescr {} A` of a flowchart and in
  `click A "u" "t" accDescr {} B` of a state diagram, the block is reported.
  [fixture: flowchart/gram-empty-description-block-then-vertex] [fixture:
  flowchart/header-empty-description-block-then-statement] [fixture:
  state/gram-click-empty-description-block-then-statement] A flowchart statement
  or header with such blocks before its separator is read without them, so
  whitespace around them that the statement does not take is reported where it
  would be without them: in `flowchart LR accDescr {};A`, the `;` after the
  space is reported, as in `flowchart TD ;` followed by a line `A`. [fixture:
  flowchart/header-empty-description-block-before-semicolon] [fixture:
  flowchart/header-space-before-semicolon] In an ER diagram, the empty forms
  also include empty backquotes, two backquotes with nothing between them in an
  attribute block, with the message
  `Empty backquotes can only be written between two attributes`. Empty
  description blocks, and empty backquotes, written one after another are
  decided by the unit after the last of them: where that unit goes on with the
  statement or the attribute before them, the first of them is reported, as in
  `A accDescr {} ||--o{ B : x` and in an attribute `int a`, two backquotes, and
  `PK`. [fixture: er/div-empty-description-block-in-relationship] [fixture:
  er/div-empty-backquotes-before-key] [fixture:
  er/div-empty-description-blocks-in-relationship] [fixture:
  er/div-empty-description-blocks-before-role] [fixture:
  er/div-empty-description-blocks-after-class-keyword] [fixture:
  er/div-empty-backquotes-twice-between-type-and-name] [fixture:
  er/div-empty-backquotes-twice-before-key-comma] In a Gantt chart, the empty
  forms also include an empty href, `href` and two `"` with nothing between
  them, with the message `An empty href cannot be written here`. No rule takes
  an empty href or an empty call wherever it stands, so the grammar stops at it,
  where a statement starts as well as inside a click statement: a line `href ""`
  followed by a line `title T`, `call ()x : 1d`, `click id1 href ""`, and
  `click id1 href "u" href ""` report the empty form, and `href "" call ()` and
  `href "" accDescr {}` the first of the two. [fixture:
  gantt/gram-empty-href-line] [fixture: gantt/gram-empty-call-glued-task]
  [fixture: gantt/gram-click-empty-href-only] [fixture:
  gantt/gram-click-href-then-empty-href] [fixture:
  gantt/gram-empty-href-and-empty-call-line] [fixture:
  gantt/gram-empty-href-then-empty-description-block-same-line] An empty
  description block before them where a statement starts is a statement, so the
  empty href or the empty call after it is reported: `accDescr {} href ""`
  reports the empty href. [fixture:
  gantt/gram-empty-description-block-then-empty-href-same-line] [fixture:
  gantt/gram-empty-description-block-then-empty-call-same-line] An empty href
  with a directive between its quotes, and an empty call with one between its
  parentheses, are reported from the keyword to the closing quote or
  parenthesis, over the directive. [fixture:
  gantt/lex-empty-href-directive-between-quotes] [fixture:
  gantt/lex-empty-call-directive-between-parentheses] [fixture:
  gantt/div-empty-href-directive-between-quotes-before-call] Inside a click
  statement, an empty description block before its first part is found where the
  grammar stops too, and empty forms written one after another after the first
  part are decided by the unit after the last of them: where that unit starts
  the second part, the first of them is reported, as in
  `click id1 href "u" accDescr {} call f()`. [fixture:
  gantt/div-empty-href-before-call] [fixture: gantt/div-empty-call-before-href]
  [fixture: gantt/div-empty-href-and-empty-call-before-href] [fixture:
  gantt/div-empty-description-block-between-href-and-call] [fixture:
  gantt/div-empty-href-between-call-and-href] [fixture:
  gantt/div-empty-call-between-href-and-call] [fixture:
  gantt/div-empty-href-between-href-and-call] [fixture:
  gantt/div-empty-href-and-empty-call-between-parts] [fixture:
  gantt/div-empty-description-block-and-empty-href-between-parts] [fixture:
  gantt/div-empty-call-and-empty-description-block-between-parts]

`html-tag-in-frontmatter` changes which `"` characters are read as `'`. The
parser does not tell that apart, so a rejection that follows from it is reported
by the rules above.
