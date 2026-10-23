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
- The `---` pseudo-diagram, or a retained nonleading block before a supported
  diagram other than pie: `range` covers the three `-` characters that start the
  block. [fixture: common/frontmatter-adjacent-delimiters] [fixture:
  common/frontmatter-nonleading-class] [fixture:
  common/frontmatter-nonleading-sequence] [fixture:
  common/frontmatter-nonleading-state] [fixture:
  common/frontmatter-after-bare-percent-flowchart]
- A directive found once more before the header, except in pie,
  ([Diagram detection](../../spec/docs/common.md#diagram-detection)): `range`
  covers its opening `%%{`, from its first `%` to its `{`, with the directives
  and comment regions of the source between them; of several, the first.
  [fixture: flowchart/detect-directive-across-directive] [fixture:
  sequence/detect-directive-across-directive] [fixture:
  sequence/detect-directive-across-comment-line-closed] [fixture:
  class/detect-directive-across-directive] [fixture:
  state/detect-directive-across-directive] [fixture:
  block/detect-directive-second-scan-preheader] [fixture:
  venn/detect-directive-second-scan-preheader] [fixture:
  ishikawa/detect-directive-second-scan-preheader] [fixture:
  agentflow/detect-directive-second-scan-preheader] [fixture:
  usecase/detect-directive-second-scan-preheader]

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

## In a C4 diagram

- Where no lexer rule matches, `range` is the character there, with
  `Unexpected character`: an unknown top-level word, whitespace between a call
  keyword and `(`, or an unquoted named value. [fixture:
  c4/lex-keyword-gap-person-space] [fixture: c4/gram-named-bare-value] [fixture:
  c4/lex-after-person-word]
- Unfinished contexts report what entered them, also when only whitespace
  remains. The message identifies the missing part, as in the table below.
  [fixture: c4/lex-keyword-eof] [fixture: c4/lex-unclosed-parenthesis] [fixture:
  c4/lex-unclosed-quote] [fixture: c4/lex-unclosed-named] [fixture:
  c4/lex-named-open-eof] [fixture: c4/gram-unclosed-acctitle] [fixture:
  c4/gram-unclosed-accdescr] [fixture: c4/gram-acc-descr-block-unclosed]

| Context                         | Range               | Message                                                           |
| ------------------------------- | ------------------- | ----------------------------------------------------------------- |
| Call keyword                    | Keyword             | `The call keyword has no ( before the end of the text`            |
| Arguments                       | Opening `(` or `(,` | `The arguments have no ) before the end of the text`              |
| Quoted argument or named string | Opening quote       | `The string has no closing " before the end of the text`          |
| Named key                       | `$`                 | `The named attribute has no = before the end of the text`         |
| Named value opener              | `$`                 | `The named attribute has no opening " before the end of the text` |
| Colon title                     | `accTitle`          | `accTitle has no text before the end of the text`                 |
| Colon description               | `accDescr`          | `accDescr has no text before the end of the text`                 |
| Description block               | `accDescr`          | `The description block has no } before the end of the text`       |

- Where the grammar cannot read a unit, `range` is its token range, or the empty
  range at the start of an all-whitespace unit, with `Unexpected token`. End of
  text before a required statement or closing boundary brace has the empty range
  there, with `Unexpected end of text`. An empty named value is reported at its
  closing quote. [fixture: c4/gram-arguments-person-none] [fixture:
  c4/gram-named-empty-value] [fixture: c4/header-context-only] [fixture:
  c4/gram-boundary-unclosed] [fixture:
  c4/gram-unmatched-right-brace-after-person]
- Direction lookahead rejects before the top-level unit is read. Its range
  covers the matched `direction` through its direction value, with
  `A direction line is not allowed in C4`. [fixture: c4/gram-direction-tb]
  [fixture: c4/gram-header-direction-tb] [fixture:
  c4/gram-direction-value-next-line]
- A consumed named `__proto__` attribute is reported at its trimmed key,
  excluding `$` and `=`, with
  `A consumed named attribute cannot have the key __proto__`. [fixture:
  c4/gram-named-proto] [fixture: c4/gram-named-proto-person-description]
  [fixture: c4/gram-named-proto-existing-relationship-style]
- Cuts inside fixed keywords use the shared divergence errors below. [fixture:
  c4/div-directive-header] [fixture: c4/lex-directive-keyword] [fixture:
  c4/div-semicolon-call-keyword-after-block]

## In a venn diagram

- A character matched by no lexer rule has its character range and the message
  `Unexpected character`. A non-BMP character covers both code units. Unclosed
  strings and labels match no whole unit, so the error is at their opening quote
  or bracket. [fixture: venn/gram-header-non-bmp-before-comment] [fixture:
  venn/gram-unclosed-id] [fixture: venn/gram-unclosed-label] [fixture:
  venn/gram-unclosed-style] [fixture: venn/lex-nbsp-line-start]
- A unit the grammar cannot read has its **significant range**: its source range
  without whitespace at its ends, except where the
  [token rules](./tokens/venn.md) keep that whitespace as part of a value. The
  message is `Unexpected token`. A newline has the empty range at its start; at
  the end of the source, the empty range has `Unexpected end of text`. A union
  with only one member reports that member with `Unexpected token`. [fixture:
  venn/gram-extra-set-no-id] [fixture: venn/gram-size-empty] [fixture:
  venn/gram-name-list-empty] [fixture: venn/gram-union-one] [fixture:
  venn/gram-union-trailing-comma] [fixture:
  venn/gram-set-colon-size-unclosed-directive-gap]
- A complete label in a position that does not allow one reports only its
  opening `[` unit with `Unexpected token`. The
  [label node's range](./positions/venn.md) includes both brackets when the
  label is accepted. [fixture: venn/gram-empty-label-alone] [fixture:
  venn/db-set-label]
- The first union member not matching an earlier set is reported at its name,
  including quotes for a quoted name, with
  `A union member must name an earlier set`. [fixture: venn/gram-union-unknown]
  [fixture: venn/gram-union-before-definitions] [fixture:
  venn/gram-union-inner-space] [fixture: venn/gram-union-case-mismatch]
- Cuts inside keywords, names, and numbers, including bare style-value atoms,
  use the shared divergence errors below. [fixture:
  venn/header-directive-inside] [fixture: venn/db-grid-directive-size] [fixture:
  venn/div-directive-style-value-word] [fixture:
  venn/div-ignored-semicolon-style-value-selected]

## In an Ishikawa diagram

- An initial header that is not cut by a directive and is followed only by
  removed directives and the appended LF is reported at its selected keyword,
  with `The header cannot end the text`. [fixture: ishikawa/header-only]
  [fixture: ishikawa/header-beta-only] [fixture:
  ishikawa/header-directive-only-eof]
- A later header is reported at its keyword, including its beta suffix when
  selected and any directive inside it, with `Unexpected token`. Leading
  indentation is outside the range. [fixture: ishikawa/header-twice] [fixture:
  ishikawa/header-beta-twice] [fixture: ishikawa/header-indented-second]
  [fixture: ishikawa/gram-header-ls-second-header] [fixture:
  ishikawa/gram-header-second-beta-prefix] [fixture:
  ishikawa/gram-directive-joins-second-header] [fixture:
  ishikawa/gram-second-header-eof] [fixture:
  ishikawa/gram-second-beta-header-eof] [fixture:
  ishikawa/gram-second-header-cut-eof]
- A directive cutting the initial selected header uses the shared
  `Unexpected directive` error below. Node text has no unclosed-string or
  empty-form error. [fixture: ishikawa/directive-in-header] [fixture:
  ishikawa/directive-in-beta-header] [fixture:
  ishikawa/div-directive-beta-prefix] [fixture:
  ishikawa/gram-root-unclosed-quote] [fixture: ishikawa/gram-empty-quotes]
  [fixture: ishikawa/gram-initial-header-cut-eof] [fixture:
  ishikawa/gram-initial-beta-cut-eof]

The later-header and directive-cut rules take precedence over the bare-header
EOF rule. Their messages are the same with or without a following source LF.
[fixture: ishikawa/header-twice] [fixture: ishikawa/gram-second-header-eof]
[fixture: ishikawa/header-beta-twice] [fixture:
ishikawa/gram-second-beta-header-eof] [fixture:
ishikawa/gram-directive-joins-second-header] [fixture:
ishikawa/gram-second-header-cut-eof] [fixture: ishikawa/directive-in-header]
[fixture: ishikawa/gram-initial-header-cut-eof] [fixture:
ishikawa/directive-in-beta-header] [fixture: ishikawa/gram-initial-beta-cut-eof]

## In an agentflow diagram

| Rejection                                | Range and message                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| No lexical rule matches                  | The one character, including both UTF-16 units of a non-BMP character, with `Unexpected character`. An unclosed string or markdown string reports its opening quote.                       |
| Unfinished callback context              | The call keyword with `The callback after call has no ( before the end of the text`, or its opening parenthesis with `The arguments of the callback have no ) before the end of the text`. |
| A click context reads nothing before EOF | Its click keyword, with `click has no click id before the end of the text`.                                                                                                                |
| The grammar cannot read a unit           | Its significant token range, or the empty range at the start of an all-whitespace unit, with `Unexpected token`; at source EOF, the empty range there with `Unexpected end of text`.       |
| An invalid linkStyle index               | The number, with `linkStyle <number> does not name a link that exists`.                                                                                                                    |
| A member after hasOwnProperty            | The first following candidate member's id, name, accessibility value, or empty-statement semicolon, with `A flow member follows the member hasOwnProperty`.                                |

Cases of the lexical-rule row: [fixture: agentflow/lex-class-suffix-equals]
[fixture: agentflow/lex-vertex-equals-alone] [fixture:
agentflow/lex-vertex-supplementary-alone] [fixture:
agentflow/gram-bare-label-pipe] [fixture:
agentflow/gram-slanted-label-open-bracket] [fixture:
agentflow/gram-ellipse-label-open-paren] [fixture:
agentflow/lex-style-equals-in-value]

Cases of the grammar-unit row: [fixture:
agentflow/gram-click-url-merged-strings] [fixture:
agentflow/gram-name-click-second-string] [fixture:
agentflow/gram-class-target-global] [fixture: agentflow/gram-props-number-unit]
[fixture: agentflow/gram-interpolate-default-name] [fixture:
agentflow/gram-bare-label-open-bracket] [fixture:
agentflow/gram-bare-callback-global] [fixture:
agentflow/gram-connector-name-default]

[fixture: agentflow/lex-supplementary-id] [fixture:
agentflow/lex-unclosed-string] [fixture: agentflow/lex-unclosed-markdown]
[fixture: agentflow/lex-call-without-parenthesis] [fixture:
agentflow/lex-callback-args-unclosed] [fixture:
agentflow/gram-connector-name-click-only-eof] [fixture:
agentflow/gram-node-empty-label] [fixture:
agentflow/lex-class-double-space-value] [fixture: agentflow/gram-flow-open]
[fixture: agentflow/lex-linkstyle-leading-zero] [fixture:
agentflow/gram-linkstyle-style-out-of-bounds] [fixture:
agentflow/lex-flow-hasownproperty-member] [fixture:
agentflow/gram-flow-named-member-hasownproperty] [fixture:
agentflow/gram-connector-member-hasownproperty] [fixture:
agentflow/gram-accessibility-hasownproperty-member] [fixture:
agentflow/gram-flow-hasownproperty-before-empty-statement] [fixture:
agentflow/gram-name-click-empty-string-adjacent-text]

When followed by a newline, a class statement with one operand or a style
statement with an empty value reports that newline unit at its empty significant
range. When a statement comment takes the required style gap, the error covers
that comment from its first percent through its last character before LF.
[fixture: agentflow/gram-class-one-operand] [fixture:
agentflow/gram-style-empty-value] [fixture:
agentflow/gram-style-null-before-comment]

In a flow name, bare text adjacent to an empty string or empty markdown string
in a click context reports that text's significant unit range with
`Unexpected token`. [fixture:
agentflow/gram-name-click-empty-string-adjacent-text] [fixture:
agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected]

Directives and selected ignored semicolons inside atomic items use the shared
boundary errors below. An unretained empty form uses the shared empty-form error
and its whole range; retained Name and click-prefix forms have no such error.
Agentflow has no reserved-click error. [fixture: agentflow/div-directive-in-id]
[fixture: agentflow/div-ignored-semicolon-in-arrow] [fixture:
agentflow/div-empty-call-before-arrow] [fixture:
agentflow/div-empty-description-before-style-comma] [fixture:
agentflow/lex-empty-call-in-flow-name] [fixture:
agentflow/gram-click-erased-before-url]

## In a usecase diagram

The lexer reads the complete diagram before the grammar, so an unreadable later
character is reported before a grammar error in an earlier prefix; no recovery
accepts that prefix. [fixture: usecase/lex-lex-first-error-not-recovered]
[fixture: usecase/lex-lex-later-error-priority]

A physical line break retained before a comment has an empty error range when it
separates a native property's key/colon/value or a CSS dash prefix from its
word; U+2028 in that CSS gap is reported over its label-symbol unit. [fixture:
usecase/gram-native-key-comment-region-keeps-line-break] [fixture:
usecase/gram-native-value-comment-region-keeps-line-break] [fixture:
usecase/gram-css-name-comment-region-lf] [fixture:
usecase/gram-css-name-comment-region-ls]

When the trailing comma and remaining line breaks after the last native metadata
property total more than two, the closing brace is read where another property
key is required: `Unexpected token` covers that brace. Count after the common
comment-region and line-terminator rules, while ranges retain the original
source positions. [fixture: usecase/gram-metadata-trailing-comma-two-newlines]
[fixture: usecase/gram-metadata-trailing-comma-three-newlines] [fixture:
usecase/gram-metadata-trailing-comma-two-newlines-hws] [fixture:
usecase/gram-metadata-trailing-comma-two-newlines-crlf] [fixture:
usecase/gram-metadata-trailing-comma-three-newlines-crlf] [fixture:
usecase/gram-metadata-trailing-comma-comment-line-blank-after] [fixture:
usecase/gram-metadata-no-trailing-comma-three-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-four-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-three-crlf] [fixture:
usecase/gram-metadata-no-trailing-comma-whitespace-lines] [fixture:
usecase/gram-metadata-no-trailing-comma-tab-lines] [fixture:
usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines] [fixture:
usecase/gram-edge-metadata-three-newlines] [fixture:
usecase/gram-metadata-no-trailing-comma-comment-three-newlines]

A native metadata comma after a line break requires another property; if a
closing brace follows, `Unexpected token` covers that brace. [fixture:
usecase/gram-metadata-tail-newline-before-comma] [fixture:
usecase/gram-metadata-tail-newline-before-comma-newline]

| Rejection                            | Range and message                                                                                                                                                            | Fixtures                                                                                                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No lexical rule matches              | The character, with `Unexpected character`; an unclosed plain string reports its opening quote.                                                                              | [fixture: usecase/lex-plain-crlf] [fixture: usecase/lex-plain-escaped-quote]                                                                                   |
| The grammar cannot read a unit       | Its significant range, retaining whitespace where the token rules keep it, with `Unexpected token`; newline has an empty range, and source EOF has `Unexpected end of text`. | [fixture: usecase/gram-empty-label] [fixture: usecase/gram-native-key-newline-colon] [fixture: usecase/gram-boundary-open]                                     |
| Conflicting element declaration      | The conflicting Actor or Entity occurrence, with `An element declaration conflicts with an existing symbol`.                                                                 | [fixture: usecase/gram-generated-label-repeat] [fixture: usecase/gram-bare-declaration-label-conflict] [fixture: usecase/gram-actor-repeat-labeltype-conflict] |
| Conflicting membership               | The conflicting Actor or Entity occurrence, with `An element cannot belong to two nonempty boundaries`.                                                                      | [fixture: usecase/spec-usecase-parser-0996ad58]                                                                                                                |
| Conflicting boundary declaration     | The complete conflicting boundary, with `A boundary declaration conflicts with an existing symbol`.                                                                          | [fixture: usecase/gram-boundary-repeat-labeltype-conflict]                                                                                                     |
| Duplicate JSON or explicit edge id   | The conflicting id, with `A JSON or explicit edge id must be unique`.                                                                                                        | [fixture: usecase/gram-json-duplicate-id] [fixture: usecase/spec-usecase-parser-31b56285]                                                                      |
| Classes on a reference-only endpoint | That endpoint, with `A reference-only endpoint cannot have a class suffix`.                                                                                                  | [fixture: usecase/gram-classes-on-reference-only] [fixture: usecase/gram-classes-on-quoted-reference-only]                                                     |
| Boundary or explicit edge endpoint   | The whole relationship, with `A relationship cannot connect a boundary or explicit edge`.                                                                                    | [fixture: usecase/gram-relationship-boundary-endpoint]                                                                                                         |
| Actor/JSON in include or extend      | The whole relationship, with `Include and extend require two usecases`.                                                                                                      | [fixture: usecase/spec-usecase-parser-81a7a3d7] [fixture: usecase/spec-usecase-parser-5c692f7f]                                                                |
| Incompatible generalization          | The whole relationship, with `Generalization requires two actors or two usecases of the same kind`.                                                                          | [fixture: usecase/spec-usecase-parser-70ebd0e2]                                                                                                                |
| Invalid JSON association markers     | The whole relationship, with `JSON permits only point or markerless associations`.                                                                                           | [fixture: usecase/spec-usecase-parser-800c93e6]                                                                                                                |
| Invalid note target                  | The target id, with `A note target must resolve to an actor or usecase`.                                                                                                     | [fixture: usecase/gram-note-unresolved] [fixture: usecase/spec-usecase-parser-67cf728b]                                                                        |
| Unresolved metadata target           | The target id or quoted label, with `A metadata target must resolve to a stored symbol`.                                                                                     | [fixture: usecase/gram-metadata-empty]                                                                                                                         |
| Unresolved class/style target        | The target id, with `A class or style target must resolve to a stored symbol`.                                                                                               | [fixture: usecase/gram-class-unknown] [fixture: usecase/gram-style-unknown]                                                                                    |
| Invalid native property              | The property from key through value, with `The native metadata property is invalid for its target`.                                                                          | [fixture: usecase/gram-native-quoted-business] [fixture: usecase/gram-native-unknown-empty-value] [fixture: usecase/gram-native-invalid-property-later-fix]    |
| Conflicting declaration property     | The later property, with `Repeated declaration metadata values must agree`.                                                                                                  | [fixture: usecase/gram-metadata-duplicate-inline-conflict] [fixture: usecase/gram-metadata-duplicate-inline-business]                                          |
| Final icon/type conflict             | The first declaration occurrence, with `An actor icon cannot coexist with a non-normal explicit type`.                                                                       | [fixture: usecase/spec-usecase-parser-ca3ba61c]                                                                                                                |
| Final business actor conflict        | The first declaration occurrence, with `A business actor must have normal or hollow geometry`.                                                                               | [fixture: usecase/spec-usecase-parser-3f58fb81]                                                                                                                |
| Final business rectangle conflict    | The first declaration occurrence, with `A rectangle cannot be a business usecase`.                                                                                           | [fixture: usecase/spec-usecase-parser-49661584]                                                                                                                |

Lexical and grammar cases: [fixture: usecase/lex-plain-crlf] [fixture:
usecase/lex-plain-escaped-quote] [fixture: usecase/lex-markdown-unclosed]
[fixture: usecase/gram-empty-label] [fixture: usecase/gram-stereotype-empty]
[fixture: usecase/gram-stereotype-space] [fixture:
usecase/gram-stereotype-newline] [fixture:
usecase/gram-json-empty-delimiter-only] [fixture:
usecase/lex-json-mode-unclosed-string] [fixture: usecase/gram-boundary-open]
[fixture: usecase/gram-native-key-newline-colon] [fixture:
usecase/gram-native-value-newline] [fixture:
usecase/gram-css-whitespace-without-component] [fixture:
usecase/gram-forbidden-uppercase] [fixture:
usecase/gram-split-opening-forward-circle-prefix] [fixture:
usecase/gram-split-opening-forward-cross-prefix] [fixture:
usecase/gram-split-opening-extra-dash] [fixture:
usecase/gram-split-backward-opening-extra-dash] [fixture:
usecase/gram-style-json-prefix-mode] [fixture:
usecase/gram-style-json-prefix-nonempty-mode] [fixture:
usecase/gram-classdef-json-prefix-mode] [fixture:
usecase/gram-style-json-prefix-after-word-mode] [fixture:
usecase/gram-style-json-prefix-after-hash-mode].

Namespace, compatibility and reference cases: [fixture:
usecase/gram-generated-label-repeat] [fixture:
usecase/gram-bare-declaration-label-conflict] [fixture:
usecase/gram-actor-repeat-labeltype-conflict] [fixture:
usecase/spec-usecase-parser-0996ad58] [fixture:
usecase/gram-boundary-repeat-labeltype-conflict] [fixture:
usecase/gram-json-duplicate-id] [fixture: usecase/spec-usecase-parser-31b56285]
[fixture: usecase/gram-classes-on-reference-only] [fixture:
usecase/gram-classes-on-quoted-reference-only].

Relationship and target cases: [fixture: usecase/spec-usecase-parser-81a7a3d7]
[fixture: usecase/spec-usecase-parser-70ebd0e2] [fixture:
usecase/spec-usecase-parser-5c692f7f] [fixture:
usecase/spec-usecase-parser-800c93e6] [fixture: usecase/gram-note-unresolved]
[fixture: usecase/spec-usecase-parser-67cf728b] [fixture:
usecase/gram-metadata-empty] [fixture: usecase/gram-class-unknown] [fixture:
usecase/gram-style-unknown].

Native property and final-geometry cases: [fixture:
usecase/gram-native-quoted-business] [fixture:
usecase/gram-metadata-unknown-key] [fixture:
usecase/gram-native-unknown-empty-value] [fixture:
usecase/gram-native-invalid-property-later-fix] [fixture:
usecase/gram-metadata-duplicate-inline-conflict] [fixture:
usecase/gram-metadata-duplicate-inline-business] [fixture:
usecase/gram-native-inline-conflict-later-fix] [fixture:
usecase/spec-usecase-parser-ca3ba61c] [fixture:
usecase/spec-usecase-parser-3f58fb81] [fixture:
usecase/spec-usecase-parser-49661584].

An unclosed markdown or JSON fallback is a grammar unit, reported over its whole
written range; an unclosed stereotype fallback is likewise reported over its
non-LF run. Atomic cuts use the shared boundary errors below. [fixture:
usecase/lex-markdown-unclosed] [fixture: usecase/gram-json-empty-delimiter-only]
[fixture: usecase/gram-stereotype-open] [fixture:
usecase/div-directive-stereotype-closer] [fixture:
usecase/div-semicolon-stereotype-closer-selected]

## In a pie diagram

The complete lexical scan precedes recursive descent, so a later unreadable
character takes precedence over an earlier grammatical failure. [fixture:
pie/recover-lexer-after-parser] [fixture: pie/recover-lexer-first]

| Rejection                                     | Range and message                                                                                                                      | Fixtures                                                                                                                                                                                       |
| --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No lexical rule matches                       | The source character, with `Unexpected character`; an unclosed string reports its opening quote.                                       | [fixture: pie/lex-nbsp] [fixture: pie/label-unclosed] [fixture: pie/label-unclosed-single]                                                                                                     |
| An unclosed description block or YAML form    | The first keyword character or opening dash, with `Unexpected character`, because no complete composite match exists.                  | [fixture: pie/accdescr-block-unclosed] [fixture: pie/yaml-unclosed-in-body]                                                                                                                    |
| The grammar cannot read a unit                | Its significant range with `Unexpected token`; a newline has an empty range at its start, and source EOF has `Unexpected end of text`. | [fixture: pie/gram-adjacent-sections] [fixture: pie/gram-newline-before-colon] [fixture: pie/gram-missing-number] [fixture: pie/gram-common-same-line]                                         |
| A hidden form consumes the only separating LF | The next visible unit, with `Unexpected token`; EOF instead satisfies EOL.                                                             | [fixture: pie/review-hidden-directive-after-title] [fixture: pie/lex-yaml-after-value-before-eol] [fixture: pie/review-hidden-directive-title-eof] [fixture: pie/gram-section-eof-hidden-yaml] |
| A section's converted double is below zero    | The number, with `A pie section value cannot be negative`, including duplicate sections and negative infinity.                         | [fixture: pie/number-negative] [fixture: pie/db-duplicate-negative] [fixture: pie/number-negative-overflow]                                                                                    |

A keyword or number cut by a global directive or selected semicolon uses the
shared boundary errors below. A failed hidden DIRECTIVE may instead match a
comment, leaving a missing component to the grammar. [fixture:
pie/div-directive-in-header] [fixture: pie/div-directive-number] [fixture:
pie/div-atomic-semicolon-number] [fixture: pie/review-directive-hidden-unclosed]
[fixture: pie/lex-hidden-comment-fallback-no-boundary]

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
