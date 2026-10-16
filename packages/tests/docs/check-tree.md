# Checking a recorded tree

Japanese version: [check-tree.ja.md](./check-tree.ja.md)

This document explains `checkTree()` of `@mmd-toolkit/tests`: it checks a
recorded tree (`ast.json`) against the conditions that the specification states
for a tree, from the tree and the input alone, without running a parser.

## Why

The comparison of [db-from-tree.md](./db-from-tree.md) shows that the ranges and
the texts a Db is built from are right. It cannot show that the other fields of
the tree are: the value of a leaf node, the fields of an arrow, the name of a
shape, the marks of a comment, whether a token starts or ends with whitespace
where it may. A parser could record a wrong value there and the Db would still
be the Db of mermaid.js, because the Db reads the input again. `checkTree()`
closes that gap: a tree that `ast.json` records is a tree in which every such
field is what the specification says it is. A parser in another language has to
give the same trees, and these checks hold it to the same conditions.

## What it reads

```ts
const problems: TreeProblem[] = checkTree(text, tree)
```

- `text` is the input as written, and `tree` the content of `ast.json`
  (`CheckedRoot`). The tree is plain JSON; the checks read the fields that they
  name and report a missing or malformed field as a problem, not as an error.
- The result lists the conditions that do not hold, each with where (a node, a
  token, a record) and a message; it is empty for a tree that satisfies them
  all. Checking all of a tree, not stopping at the first, shows the whole damage
  of a wrong tree.
- The directives and the comment lines are found in the text (`scanSource()` of
  `src/source-scan.ts`, also used for the converted form of
  [db-from-tree.md](./db-from-tree.md)), not taken from the tree, so that a
  comment or a directive that the tree lacks is found. The tree gives the
  `IgnoredSemicolon` tokens: which `;` the line rule ignores depends on the line
  segment and on the diagram.
- The form of a tree is given by a table of the fields of each node type and
  record (`src/check-tree/node-fields.ts`): the name of each field and its kind
  (a value of a type, a node, a node or null, a list of nodes). The
  specification defines the form of a tree in the field tables of ast.md,
  `ast/<diagram>.md`, and parser/docs/tokens.md; the table is its copy, and
  `tests/check-tree-node-fields.test.ts` requires it to agree with those tables.
  A tree that lacks a field, has a field that its type does not have, or has a
  field of another kind (a list for a node, a string for a node or null), or a
  range that is no offset pair, is reported, and the other checks are not run on
  it.
- The children of a node are the fields that the table gives as a node, a node
  or null, or a list of nodes; the one child field of `Root` is `body`. The
  order of the fields of a node is not used, nor the order of the keys inside a
  `loc`.

## The checks

- **Positions.** Every range lies in the input, and every `loc` is the place of
  its `range` ([positions.md](../../parser/docs/positions.md), Positions); no
  token, comment, or directive has an empty range (positions.md, Invariants).
- **Every character is placed.** A character outside the tokens and comments is
  whitespace (positions.md, Invariants).
- **Texts.** The `value` of a token, and the text of a comment, a directive, and
  the frontmatter, equal the source of their ranges (positions.md, Invariants;
  [ast.md](../../spec/docs/ast.md)).
- **Comments.** A comment line is where the scan finds it, with the mark `%%`; a
  diagram comment has a mark that its diagram has, and ends where its line ends
  (before a U+2028 or a U+2029 too in a mindmap diagram, whose comments run to
  the end of their line segment); a flowchart, an ER diagram, a sankey diagram,
  and a block diagram have the mark `%%` for a line of `%%` alone before their
  header, as every diagram type does, and for no other comment; a gantt diagram
  has the marks `%%` and `%` for its diagram comments, and a journey diagram and
  a requirement diagram the marks `#`, `%%`, and `%`, a timeline diagram the
  same marks, a mindmap diagram, an xychart diagram, and a quadrant chart the
  mark `%%`; a fragment without a mark follows a comment region
  (parser/docs/tokens.md, Comment;
  [common.md](../../spec/docs/common.md#comment-lines), Comment lines).
- **Directives.** The directives of the tree are those of the scan, each with
  its `closed` and the range of the match without the whitespace at its end
  (ast.md, Directive; common.md, Where a directive is).
- **Tokens.** They are in source order and do not overlap. A token starts or
  ends with whitespace only where a value starts or ends, next to a cut (a
  directive, a comment region, or a `;` that the line rule ignores), or where it
  goes on with a value that the token before it starts, or where it is all
  whitespace and a token that belongs to the same value follows it directly (the
  whitespace between the colour candidate and the remainder of a sequence box
  text). A directive lies in no other token, and a comment lies in none
  (positions.md, Invariants).
- **Strings.** The tokens of a StringLiteral, a node type that every diagram
  type shares, are one `String` token where nothing cuts it, and, where a
  directive, a comment region, or a `;` that the line rule ignores cuts it,
  `StringFragment` tokens, one more than there are cuts (parser/docs/tokens.md,
  String tokens).
- **Tokens that are not cut.** A directive or a `;` that the line rule ignores
  lies in a `String` (which then is `StringFragment` tokens) or a `RawText`
  token, and in no other token (parser/docs/tokens.md, A token that a directive
  cuts).
  - Two tokens of the kind `Identifier` or `Numeric` with a cut and no
    whitespace between them are the fragments of a cut token and are reported,
    as is a node of one token (an arrow, a number, an `Identifier`) with more
    than one.
  - A `Keyword` token and a `Punctuator` token have a text that the table of
    their diagram lists, and one decision, made in one place
    (`fragmentsOfEntries()` in `src/check-tree/tokens.ts`), tells the fragments
    of a cut one: a run of two tokens or more of that kind, which cuts glue
    together with nothing else between them, is reported when its texts joined
    are one text of the table. The run has any number of tokens, and a shorter
    run inside a longer one that cuts glue together is looked at too, whatever
    token the cut attaches to it. One report is made for each run, in one place
    (`reportCutEntries()`), at the first token of the run, and it lists the
    fragments in order with the text that they make. So `sub`, a cut, and
    `graph` are the fragments of `subgraph`, and so are `su`, a cut, `bgr`, a
    cut, and `aph`, where no two of them are a keyword. A pseudostate mark and
    the start of an empty description block, `<<choice>>`, a cut, and
    `accDescr`, are units of their own, as no text of the table is their two
    texts joined.
  - The table of the `Keyword` texts (`src/check-tree/keywords.ts`) is the words
    of the row `Keyword` of the table of Tokens of each diagram and the texts of
    the units that the row names without their text (a header, a direction, a
    link target, a pseudostate mark, a wrap prefix, a day); a test requires
    that, and requires every `Keyword` token of a recorded tree to have a text
    in it. For a gantt diagram the row names the header and the days (`day`) as
    units, which are `gantt` and the seven days of a `weekday` and a `weekend`
    statement. For a journey diagram the row names the header, which is
    `journey`, and the words that start a statement (`title`, `section`,
    `accTitle`, `accDescr`).
  - The text of a `Punctuator` token other than those of the arrows is one that
    its diagram has (`src/check-tree/punctuators.ts`, a copy of the row
    `Punctuator` of the table of Tokens of each diagram), and no run of its
    tokens is the fragments of one text of the table (`:` and `::` for `:::`;
    `(` and `(` for `((`), also when the run starts with a token that the cut
    attaches, as the `)` of `A(x)%%{init: {}}%%:::c` does. The opening and the
    closing of a shape are one token each, and so are the relation ends and the
    line of a class arrow. Two `,` with a cut between are two units, as no text
    of the table is `,,`.
  - A `String` token starts with a quote, and one that a cut follows is closed.
- **Frontmatter.** The first tokens are `---`, the body, and `---`; the body is
  a `RawText` token without the whitespace around it, and there is none when the
  body is all whitespace (positions.md, Invariants).
- **Node ranges.** A node runs from the start of a token to the end of one,
  inside its parent, so every node has a token: a flowchart label that is all
  whitespace has the one `RawText` token of that whitespace. The children of a
  node do not overlap, and they are in source order in the order of the child
  fields, each list in its own order, except for the nodes of one list
  (`CHILD_FIELDS_NOT_IN_SOURCE_ORDER` in `src/check-tree/invariants.ts`), each
  with the sentence of its document: the label of a flowchart link written
  between its two arrows, which comes before the arrow in the source, and the
  link of a gantt click statement written before its call, which comes before it
  in the source while the child fields are `ids`, `call`, `href` (the ids come
  first whichever part follows); the body is a diagram of the specification and
  covers the tokens of the diagram (positions.md, Node ranges and Invariants).
- **Literals.** The `raw` of a `StringLiteral` or a `NumericLiteral` is the
  source of its range, and `closed` of a `StringLiteral` is whether its `raw`
  has more than one character and ends with the quote that it starts with
  (positions.md, Invariants; ast.md, StringLiteral).
- **The `error` pseudo-diagram.** Its tokens are `RawText` tokens that hold no
  whitespace or line terminator, and no two of them touch (ast.md,
  ErrorDiagram).
- **Values.** The value of every node that has one is made from the source of
  its range by one rule, which the table of `src/check-tree/values.ts` applies
  type by type (ast.md, Nodes, and `ast/<diagram>.md`); see below.
- **Tokens and value nodes.** The tokens of a value lie in value nodes, and
  keywords and punctuators do not, with the exceptions that the documents state
  (`parser/docs/tokens/<diagram>.md`, Tokens).
- **Fixed words and fields.** The fields that the words and marks of a node
  write are what they write, and are null where nothing is written
  (`ast/<diagram>.md`):
  - flowchart: the markers, the line, and the length of an arrow; the name of a
    shape and whether it has a property; the `kind` of a label; the direction of
    the header, which is null when the token after the header keyword is no
    direction; the direction of a direction statement; the target of a click
    statement; the whitespace that a style or the name of a subgraph holds, and
    the `,` that separates two styles; `closed` of a description block;
  - sequence: `created` and `kind` of a participant; `activation`, which is the
    `+` or `-` of a message and null when it has none; the two central
    connections of a message, each the `()` on its own side of the arrow; the
    arrow of a message; the `wrap` of a text; the parts of a box text; the
    placement of a note; `off` of an autonumber statement; `closed` of a
    description block;
  - class: the markers and the line of an arrow, each one token, and an arrow
    text that is an arrow; the visibility of a member, and its classifier, of
    which a member has at most one mark; the direction and the target;
  - state: the tokens of a terminal and of a divider; the kind of a pseudostate,
    written `<<kind>>` or `[[kind]]`; the position of a note; the words of
    `hide empty description`, one token each; the direction; `closed` of a
    description block and of a string;
  - er: the cardinalities and the line of a relationship, one token each; the
    direction, which is the value of a direction statement in upper case;
    whether an attribute has a `?`; the attributes of an entity, which a `{`
    opens, and the title of a subgraph, which a `[` opens;
  - gantt: the tokens that a node writes itself, outside its child nodes, are
    those of its rule, each of the kind that the table of Tokens gives (`:`,
    `,`, `{`, `}`, `(`, `)` are `Punctuator` tokens and the others `Keyword`
    tokens): the header `gantt` in exactly this case, the keyword of a
    statement, the `:` or the braces of an accessibility statement, the `call`
    and the parentheses of a call part, a colon and commas for the data of a
    task, `click`, commas, and `href` for a click statement; the `day` of a
    weekday or weekend statement, which is its token in lower case, one of the
    seven days or of `friday` and `saturday`; the tags (one of five words, in
    exactly this case), the items, and the ids as the stretches between the
    separators (one more than there are commas), each filling its stretch and
    null where only whitespace lies in it, with the first item none of the tag
    words, `items` not empty, and no `,` in an id or an item of a list; at least
    one of the call and the link of a click statement, and a URL that is closed
    and not empty; the name of a callback, which runs to the `(`, and its
    arguments, which are null where only whitespace lies between the
    parentheses; the kinds of the tokens of the values: those of a
    `GanttLiteral` are `RawText`, those of an id and of an item of a list
    `Identifier`, and those of a tag `RawText` (one for each fragment where a
    directive cuts it); the range of a statement and of a call part, which runs
    from the first of the tokens and child nodes of the node to the last, so
    that a click statement ends at the last part in the source whatever the
    order of its child fields, and the whitespace after the last token is
    outside it; the link, which runs from `"` to `"`; where the text of a
    setting, a title, or a section starts (one whitespace character after the
    keyword) and ends (the end of its line, or before `#` or `;` where the
    statement says so); where the value of an accessibility statement starts and
    ends, which is without the whitespace at its ends;
  - journey: the checks of the tokens that a node writes itself, of their kinds,
    of the range of a statement, of the text of a title and a section, and of
    the value of an accessibility statement are those of a gantt diagram (one
    code, `src/check-tree/statement-checks.ts`), with the kinds of the tokens of
    parser/docs/tokens/journey.md (`:`, `,`, `{`, `}` are `Punctuator` tokens,
    the header and the keywords `Keyword` tokens, every value a `RawText`
    token); a task writes a colon, and with people a second colon and the commas
    between them; the score and the people are the stretches between the colons
    and the commas (the score part runs from the first colon to the second colon
    or the end of the data, the people part from the second colon to the third
    colon or the end), one person more than there are commas, each filling its
    stretch and null where only whitespace lies in it, and read without the
    whitespace at their ends, with no `:` in a score and no `,` or `:` in a
    person; `textAfter` starts with the third colon, does not end with
    whitespace, and exists only where the second colon does; the description of
    a task runs to the colon, the whitespace before the colon included, and
    neither starts with whitespace nor holds a `:`; the name of a section holds
    no `:`; the text of a title or a section starts one whitespace character
    after the keyword and ends at the end of its line or before a `#`;
  - requirement: the tokens that a node writes itself, outside its child nodes,
    and its child nodes, in source order, are those of its statement, as one
    list of labels (a token by its text in lower case, a child node by its
    field): a requirement or an element is its keyword, the name, the `:::` and
    the classes with a `,` between two of them (none without classes), `{`, the
    items, and `}`; a relationship is the left name, `-`, the relationship,
    `->`, and the right name, or, for `backward`, `<-`, the relationship, and
    `-`; a direction is the text before, `direction`, the value, and the text
    after, each of the texts only where it is not null; a style, a class
    definition, a class statement, and a shorthand are their keyword (a
    shorthand its name and `:::`) and their lists, with a `,` between two
    entries of a list; an accessibility statement is its keyword, the `:` or the
    braces, and the value (none for an empty block). The words of the fields are
    those of the keywords that were written: the kind of requirement is the
    keyword that starts the statement in the form of the names of the kinds
    (`functionalRequirement`), the field, the risk, the verification method, and
    the relationship are the keyword in lower case, and the direction is the
    value in upper case; each is one of the words of the document, and the lists
    of styles, names, and classes are not empty. The header is
    `requirementDiagram` with `requirement` in exactly this case and the rest in
    any case (diagrams/requirement.md, Detection). The child nodes of a field
    are of the types of its table (`REQUIREMENT_CHILD_TYPES`, which a test holds
    to the Type column of ast/requirement.md). A name or a text without quotes
    is not empty, does not start or end with whitespace, a name or the value of
    a field starts with an ASCII word character and holds none of `:`, `,`, `{`,
    `<`, `>`, `-`, `=`, and the line terminators, and a style holds no `,`
    (diagrams/requirement.md, Names and values, The style context). A string is
    closed and is not empty. The text before `direction` holds no line
    terminator and no U+2028 or U+2029, the text after the value no line
    terminator, the whitespace between `direction` and the value is not empty,
    and the line ends with the last part (The direction line). The text of an
    item of a body, without its whitespace, is `accDescr{}`, in any case. The
    value of an accessibility statement is read as in a gantt diagram, and the
    text of a description block holds no `}`. The kinds of the tokens are those
    of `parser/docs/tokens/requirement.md`: a token that a node writes itself is
    `Punctuator` for `:`, `,`, `{`, `}`, `:::`, `-`, `->`, and `<-`, and
    `Keyword` for the rest; the tokens of a text are `RawText`, those of the
    text of a direction line `RawText`, and those of an empty description block
    of a body `Keyword` and `Punctuator`; a name is `Identifier` after `style`
    and `classDef` and in the names of a `class` statement, `RawText` for a
    requirement, an element, a relationship, and a shorthand, and `Identifier`
    or `RawText` for a class of a `class` statement. The range of a statement is
    the hull of its tokens and child nodes
    (`parser/docs/positions/requirement.md`).
  - mindmap: the checks read the tree and the text of the source. The child
    nodes of a field are of the types of its table (`MINDMAP_CHILD_TYPES`, which
    a test holds to the Type column of ast/mindmap.md), and the opener, the
    closer, and the kind of a label are words of the lists that the Meaning
    column gives, which the test holds as well. A node has a node text, a shape,
    or both. Its `indent` is the number of whitespace characters before it on
    its line in the written text, each counted as one (a tab, a U+3000, a
    U+2028), back to the previous line terminator or character that is not
    whitespace, so that the whitespace after the header is the `indent` of a
    root on the line of the header (diagrams/mindmap.md, Units and contexts).
    The parent of a node is the nearest node before it with a smaller `indent`,
    and the children of a node are those nodes in source order; a node that is
    not the first and has no such node would be a second root (Indentation and
    parents). The decorations of a node start after its text and end before the
    next node in the source, whichever node that is (ast/mindmap.md,
    MindmapNode). A node text keeps the whitespace at its end: the shape starts
    where it ends, and without a shape the line ends right after it. It starts
    with no whitespace, holds none of `(`, `[`, `)`, `{`, `}` and the line
    terminators, and starts with none of `%%`, `::icon(` (in any case), `:::`,
    and the keyword `mindmap`, which rules before the rule of the node text read
    (The statement context). An icon lies between `::icon(` and `)`, whatever
    whitespace is next to them, and holds no `)`; a class follows `:::` and runs
    to a line feed, a U+2028, a U+2029, or the end of the text, and holds none
    of them (The icon and class contexts). A shape is written as its opener, its
    label, and its closer, and nothing else; the opener `-)` is the opener of a
    shape that starts a unit, so no node text lies before it, and the closer
    `-)` follows only a string or a markdown string (The shape context). A label
    is not empty. A string and a markdown string are written with their
    delimiters, which the value leaves out and which are the first and the last
    characters of the written text of the label, so that a directive between the
    two characters of a delimiter is no part of the value; a text does not start
    with `"`, since the rule of a string comes before the rule of a text (The
    shape context); a text holds none of `)`, `]`, `(`, `}`, a string no `"`,
    and a markdown string no backquote and no `"`. The kinds of the tokens are
    those of `parser/docs/tokens/mindmap.md`: a token that a node writes itself
    is `Punctuator` for `:::`, the `)` of an icon line, and the openers and the
    closers of a shape, and `Keyword` for the header and `::icon(`; the tokens
    of a node text, a shape text, an icon, and a class are `RawText`, and those
    of a string and a markdown string `String` or `StringFragment`. The child
    fields `id`, `shape`, `decorations`, and `children` are in source order, and
    so is a list (ast.md, Nodes; ast/mindmap.md states no exception). The tokens
    that a node writes itself, joined, are `mindmap` in lower case for the
    diagram (diagrams/mindmap.md, Detection), `::icon(` (in any case) and `)`
    for an icon line, `:::` for a class line, the opener and the closer for a
    shape, and none for a node. The range of a node and of a statement is the
    hull of its tokens and child nodes (`parser/docs/positions/mindmap.md`); the
    range of a literal and of a label runs from the start of a token to the end
    of a token, which the checks of every tree read.
  - timeline: the checks read the tree and the text of the source. The child
    nodes of a field are of the types of its table (`TIMELINE_CHILD_TYPES`,
    which a test holds to the Type column of ast/timeline.md, with the
    statements that its sentence on `TimelineStatement` lists), the direction is
    `LR` or `TD` in any case (`TIMELINE_DIRECTIONS`, which the test holds to the
    Meaning column), and the events of an event statement are never none. A
    period is never empty, starts with no whitespace, holds no `#` but the `#`
    of an entity (common.md, Entities), no `:`, and no line terminator, and ends
    before a `#`, a `:`, a line terminator, or the end of the text
    (diagrams/timeline.md, The statement context, rule 14). The written text
    from its start on, as the lexer reads it, with the directives and the
    comment lines left out, starts with none of the units that the rules before
    its rule read: a `%` that no `{` follows, the keyword `timeline`, `title` or
    `section` with a whitespace character, a line feed included, and a character
    after it, and `accTitle` or `accDescr` with its `:` or `{` after whitespace,
    line feeds included; so it is the lines after a period that decide whether
    it is one. An event is the text after a `:` and one whitespace character, a
    line feed included; it is never empty, holds no line terminator, holds a `:`
    only before a character that is no whitespace, and ends before a `:`, a line
    terminator, or the end of the text, and nothing but whitespace and diagram
    comments lies between it and the item before it besides that `:` and that
    character (rule 13). A title and a section name start after their keyword
    and one whitespace character, are never empty, and hold no line terminator;
    a title runs to the end of its line, and a section name holds no `:` and
    ends before a `:` or the end of its line (rules 8 and 12). An accessibility
    text follows its keyword, a `:` or, for a block, a `{`, and whitespace, line
    feeds included (rules 9 to 11, Accessibility values); it is never empty and
    has no whitespace at its ends; the text of a line runs to the end of its
    line, the text of a block holds no `}` and is followed by whitespace and the
    `}`, and a block without text is the keyword, `{`, whitespace, and `}` only.
    An event statement follows a statement that is neither a period statement
    nor an event statement, and some period statement lies before it
    (ast/timeline.md, TimelineEventStatement). The child fields are in source
    order (ast.md, Nodes; ast/timeline.md states no exception). The kinds of the
    tokens are those of `parser/docs/tokens/timeline.md`: a token that a node
    writes itself is `Punctuator` for `:`, `{`, and `}`, and `Keyword` for the
    header, the direction, and the keywords; the tokens of a text are `RawText`.
    The tokens that a node writes itself, joined, are `timeline` and the
    direction as written for the diagram, a `:` for each event of a period
    statement and of an event statement, the keyword (in any case) for a title
    and a section, the keyword and `:` for an accessibility statement, and the
    keyword and the braces for a block; the `direction` is the token after the
    header, or null where there is none. The range of a node and of a statement
    is the hull of its tokens and child nodes
    (`parser/docs/positions/timeline.md`); the range of a literal runs from the
    start of a token to the end of a token, which the checks of every tree read.
  - sankey: the checks read the tree and the text of the source. The child nodes
    of a field are of the types of its table (`SANKEY_CHILD_TYPES`, which a test
    holds to the Type column of ast/sankey.md), and the body of the diagram has
    a link. The value of a SankeyIdentifier and of a SankeyLiteral has no
    whitespace at its ends and holds the spaces between its characters and
    printable characters of ASCII but `"` and `,` (ast/sankey.md,
    SankeyIdentifier and SankeyLiteral); the value of a StringLiteral is closed,
    is never empty, holds printable characters of ASCII and line terminators,
    and has each `"` in a pair of `"` (diagrams/sankey.md, Strings). The `"` of
    an HTML attribute quote is read as `'` for these conditions
    (diagrams/sankey.md, Characters). A sankey diagram has no diagram comment
    after its header (diagrams/sankey.md, Comments). The header, `sankey` or
    `sankey-beta` in any case, is the one token that the diagram writes itself,
    a `Keyword` token, and the header and each record lie on lines of their own:
    only whitespace with a line terminator lies between the header and the first
    record, and between two records, besides the directives and the comment
    lines. A link writes two `Punctuator` tokens, the `,`, and its source, its
    first `,`, its target, its second `,`, and its value follow each other with
    only whitespace between them. The tokens of a field without quotes are
    `RawText` tokens, which a directive or an ignored `;` may cut into several,
    and hold no whitespace at the ends of the field, but for a field of
    whitespace only, which has one token, its whitespace, and the empty value.
    The range of the diagram and of a link is the hull of its tokens and child
    nodes, and the range of a field is that of its tokens, without the spaces
    around it (`parser/docs/tokens/sankey.md` and
    `parser/docs/positions/sankey.md`).
  - xychart: the checks read the tree and the text of the source. The child
    nodes of a field are of the types of its table (`XYCHART_CHILD_TYPES`, which
    a test holds to the Type column of ast/xychart.md), and a diagram has a
    header, a band a category, and a plot a value. The headers come before the
    first statement (ast/xychart.md, XychartDiagram). The orientation of a
    header is none, or `vertical` or `horizontal` in any case, and the kind of a
    plot is `line` or `bar` in lower case (`XYCHART_ORIENTATIONS` and
    `XYCHART_PLOT_KINDS`, which the test holds to the Meaning column). A title
    is never empty; an axis statement has a title, its data, or both, and a
    title in quotes that is empty has data after it; a category is never empty
    (ast/xychart.md, XychartTitleStatement, XychartXAxisStatement,
    XychartYAxisStatement, and XychartBand). A text without quotes is not empty
    and holds letters and digits of ASCII and `-`, `_`, `.`, `+`, `=`, `*`, `&`,
    and `#` (diagrams/xychart.md, The statement context, rule 6); the title of
    an axis holds no digit, which starts a number there (The axis context). The
    text of an accessibility statement is not empty, holds no line terminator in
    a line, and no `}` in a block (Accessibility values). An `accTitle:` or
    `accDescr:` statement without a text is the last statement, since its text
    is the first line after the keyword that has one (Accessibility values), and
    so is a block that is not closed, which runs to the end of the text
    (ast/xychart.md, XychartAccDescrBlockStatement). The written text of a
    number is an optional sign, digits with an optional fraction, or a fraction
    alone (The axis context), and a string is closed and holds no `"` but the
    `"` of an HTML attribute quote, which is read as `'` (Strings). A diagram
    comment has the mark `%%` (Comments). The kinds of the tokens are those of
    `parser/docs/tokens/xychart.md`: a token that a node writes itself is
    `Punctuator` for `[`, `]`, `,`, `;`, `:`, `{`, `}`, and `-->`, and `Keyword`
    for the header, the orientation, and the keywords; the tokens of a text
    without quotes and of the text of an accessibility statement are `RawText`,
    those of a number `Numeric`. The tokens that a node writes itself and its
    child nodes lie in this order, with only whitespace between them: the
    header, the orientation if there is one; `title` and its text; `x-axis` or
    `y-axis`, the title, and the data, the title first; `[`, the categories with
    a `,` between each two, and `]`; the start, `-->`, and the end; `line` or
    `bar`, the title, and `[`, the values with a `,` between each two, and `]`;
    a number and its label; `accTitle` or `accDescr`, `:`, and the text, which
    runs to the end of its line; and `accDescr`, `{`, the text, and `}` (the `}`
    only when `closed` is true). The diagram writes itself the `;` that end
    lines. The orientation is the second token of the header as written, or
    null; the kind of a plot is its keyword in lower case; `closed` is whether
    the last token of a block is `}`, and a block that is not closed has only
    whitespace after its text. The words of a text without quotes that follow
    one another with nothing between them are one token, so two tokens of such a
    text have whitespace or a cut between them. The range of the diagram, of a
    statement, and of the nodes below it is the hull of its tokens and child
    nodes (`parser/docs/positions/xychart.md`).
  - quadrant: the checks read the tree and the text of the source. The child
    nodes of a field are of the types of its table (`QUADRANT_CHILD_TYPES`,
    which a test holds to the Type column of ast/quadrant.md), and a `classDef`
    has a style. The axis of an axis statement is `x` or `y`, and the letter of
    its keyword in lower case; `end` is null unless `arrow` is true, and the
    arrow is written between the texts, or after the only text, and is not
    written otherwise (ast/quadrant.md, QuadrantAxisStatement). The number of a
    quadrant statement is the digit of its keyword, from 1 to 4
    (QuadrantQuadrantStatement). The kind of a label is `text`, `string`, or
    `markdown` (`QUADRANT_AXES` and `QUADRANT_LABEL_KINDS`, which the test holds
    to the Meaning column), and its value is its written text, or, for a string
    or a markdown string, its content followed by the written text of the rest
    (QuadrantLabel). A text without quotes starts with a word, and holds
    letters, digits, characters outside ASCII, the punctuation `!$%&'*+,./=?\_#`
    and the backquote, `-`, and spaces; a string is not empty, and what follows
    it is the rest of a text, which holds no string (diagrams/quadrant.md, The
    statement context, Texts, Strings, and Empty strings); the characters are
    those of the converted form of the text, in which an entity is a character
    outside ASCII (Entities, HTML attribute quotes, and `style` lines). A title
    is none, or not empty, without whitespace of Notation at its ends and
    without a line terminator; the text of an accessibility line is not empty,
    has no whitespace at its ends and no line terminator, and the text of a
    block no `}` (Accessibility values). A class name of a point is letters of
    ASCII, digits, and `_` (The class name context); a coordinate is `1`, or `0`
    optionally followed by one character other than a line feed, U+2028, and
    U+2029 and by digits (The point context); the name of a class of `classDef`
    holds, in the converted form, letters, digits, characters outside ASCII,
    `&`, `#`, `*`, `-`, `,`, and `:`, and no whitespace (Classes); a style holds
    letters, digits, `:`, `#`, `-`, and spaces, and is a name of
    `QUADRANT_STYLE_NAMES`, a `:`, and a value of the form of the name (Points
    and Rejections outside the grammar). Two statements on a line have a `;`
    between them, unless one is an empty description block; a block with text is
    followed by nothing but empty description blocks on its line, with nothing
    between, and its line ends right after, a comment at the end of the line
    being no part of what follows (Diagram and statements, Titles and
    accessibility statements). A diagram comment has the mark `%%` (Comments).
    The tokens of a string label are one `String` token, or `StringFragment`
    tokens where a directive, a comment region, or an ignored `;` cuts the
    string, and the `RawText` tokens of the words after it.
  - block: child types follow `BLOCK_CHILD_TYPES`, checked against ast/block.md;
    diagram and composite bodies, class ids, and style slot lists are nonempty,
    and a body cannot consist only of empty description blocks. The fields that
    may be null agree with the written forms: widths follow their colons without
    whitespace, `space:` includes its colon, `columns auto` has no count, a
    named composite has a head after `block:`, and a link has both an opening
    arrow and a label or neither. Shapes have the written opening and closing
    independently, including mismatched pairs, with no whitespace inside the
    brackets. A block arrow has a nonempty list of the directions `right`,
    `left`, `up`, `down`, `x`, and `y`, in written order, each a BlockLiteral of
    its word and the whitespace written after it and, for the first where no
    comma stands before it, the whitespace written after the `(`, with optional
    commas before directions and no final or consecutive commas. A direction is
    the `Keyword` token of its word between the `RawText` tokens of its
    whitespace (cut where a directive or a comment line cuts it), and the
    whitespace after a comma is in no direction and no token. Arrow fields agree
    with the written markers, line, and length, and each arrow is one
    punctuator; opening and closing lines may differ. Labels are closed,
    nonempty StringLiterals, without markdown; widths and counts are decimal
    digits. Node ids hold the characters of an id, while the id of `style` and
    the name of `classDef` hold ASCII word characters (commas separate nonempty
    words of the one style id). An id of `class` is a BlockLiteral of a word
    and, after a comma, the whitespace written after the comma, which is
    `RawText` tokens before the `Identifier` token of the word. Class names have
    no whitespace at their ends and stay on their line. A style keeps the
    whitespace between it and a comma, so that the first starts and the last
    ends at a character that is not whitespace; a part of whitespace only
    between two commas is a literal of that whitespace, and a part with nothing
    in it is null. The layouts of statements, including token kinds, child
    order, gaps, and ranges, follow statement-checks.ts and
    parser/docs/tokens/block.md and positions/block.md. BlockLiteral values are
    written text, identifiers are their tokens joined, strings are their
    contents, and numbers are checked against their written digits. Comments are
    comment lines with `%%`; block has no diagram comment after its header.
    Whether two units touch is judged on the written text, so a directive
    between them leaves them touching (a shape's delimiter and its string, a `:`
    and its number). `check-tree-block.test.ts` checks hand-made trees and the
    recorded trees.

The **written text** of a range is its source without the directives, the
comment regions, and the `;` that the line rule ignores (ast.md, Nodes).

The **value rule** says that the value of a node is its written text, and that
the tokens of the node agree with it: the texts of the tokens in its range, the
`Directive` and `IgnoredSemicolon` tokens left out, joined, are the value. This
holds for each type with a value field (`value`, or `name`), except where the
table gives the type another way, each with the sentence of the specification
that says so:

- A value made of units joined (`Identifier`, `ClassIdentifier`, a class arrow,
  a style of a class diagram, an ER diagram, or a requirement diagram) leaves
  out the whitespace between its units; the joined tokens are the value. An
  `Identifier` is one token.
- A field without quotes in a sankey diagram (`SankeyIdentifier`,
  `SankeyLiteral`) has the value of its written text without the whitespace at
  its ends, which is empty for a field of whitespace only; the node is the field
  without that whitespace, but for a field of whitespace only, whose one
  `RawText` token is the whitespace, and the tokens are the written text.
- A quadrant chart has the value of its written text in a coordinate, a style,
  and the name of a class (`QuadrantLiteral` and `QuadrantIdentifier`), and the
  value of its written text without the whitespace of Notation at its ends in a
  title, an accessibility text, and the text of a block (`QuadrantLiteral`); a
  label (`QuadrantLabel`) has a value that follows from its written text and its
  kind, which the check of the diagram reads.
- A text of an xychart diagram (`XychartLiteral`) without quotes is a value made
  of units joined, which holds no whitespace; the text of an accessibility
  statement has the value of its written text without the whitespace at its
  ends, the whitespace between its characters included, and the tokens are the
  written text.
- A string, a label that starts with a string, a label of a mindmap diagram that
  is a string or a markdown string, and a data block have delimiters that belong
  to their own text; the value is the written text without them, with the
  whitespace written inside them, and that whitespace lies in the tokens.
- A node of text that mermaid.js does not read (an ignored text or statement)
  shows what was written, the whitespace between its units too, and the comments
  in its range are left out; that whitespace lies in no token, except in a run
  of text (`RawText`), which keeps the whitespace next to a cut. A diagram
  comment runs from its mark to the line terminator that ends its line
  (state.md, Comments; common.md, Notation): a line feed, a CRLF, or a lone CR,
  or the end of the text where none follows. It runs past the comment lines that
  cut it, so the value leaves out everything of that range: the whitespace
  before a U+2028 or U+2029, the separator, the comment lines with their line
  terminators, the whitespace after them, and the fragment after them. The line
  terminator that ends the comment, a CRLF as one, and a comment line of its own
  with no diagram comment before it, leave nothing else out.
- The number of a `NumericLiteral` and the name of a `FlowchartShape` follow
  from the text and are not the text; the number is checked against the written
  text, and the name against the delimiters of the shape.

`tests/check-tree-values.test.ts` requires the table to list exactly the value
fields of the field tables, and to agree with the Meaning column of the
specification on which values are simply the written text or the texts of units
joined, so that the exceptions are those the specification states.

The records that the diagrams share are checked once (`leaves.ts`): the `name`
of a directive is its first word, and the `diagramType` of the root is one of
those of its body. The checks of a diagram are the checks of its own nodes.

Every field of every node type is checked by a rule of its own:
`tests/check-tree-fields.test.ts` breaks each field of each type in a recorded
tree and requires the check to report it at the node that holds the field, with
the message of the rule of that field. A field of a node or of a list that holds
a string has the message of the form of a tree; a field that holds a value has
the message that a table of the test names for it. A problem of another rule
does not satisfy a field. A field that may be null is also made null where the
source writes it, and set where it writes none, and the problem must be the
field's own: for a field of a string, one of the node that holds the field; for
a field of a node or of a list of nodes, one inside the range that the field
covered, with the message that its tokens lie in no node that holds them, or,
for the fields that the next paragraph names, one of the node that holds the
field, with a message that names the field.

A field of a node or of a list of nodes that may be null is null where the node
writes nothing for it. Where what the node writes for the field has a token of a
value, that token lies in no node when the field is null, and the placement of
the tokens of a value reports it. Where the field is written with the tokens of
the node itself, as with a `{`, `src/check-tree/null-fields.ts` reads the tokens
of the node that lie in none of its child nodes and reports a field that is null
while one of them is its text: the member of a class member statement, which
follows the `:`; the members of a class declaration, the body of a composite
state, and the body of an alias state, which a `{` opens, and the attributes of
an entity and the title of a subgraph of an ER diagram, which a `{` and a `[`
open; the text of a message, which follows its `:`; the alias of a participant,
which follows its `as`; the text before the body of a composite state and of an
alias state, which is every token of the node before the `{` of the body other
than its own words; and the text of a note on one line, which starts with the
`:` that follows two or more whitespace characters, counted past directives and
`;` that the line rule ignores (diagrams/state.md, The note contexts). A list
that the node writes with a `{` or a `[` is not null also when it is empty, so a
list that is not null with no `{` or `[` is reported as well.

Not checked:

- The condition that every `;` the line rule ignores has an `IgnoredSemicolon`
  token: the line rule is not written twice, so the tokens are taken as given
  and their correctness is shown by the Db comparison.

## The tests

`tests/check-tree-corpus.test.ts` checks every recorded tree of the corpus and
that every node type in it is classified as a value node or not. The tests that
require a recorded tree for every node type of the tables read the recorded
trees of every diagram of the corpus. `check-tree-gantt.test.ts` and
`check-tree-journey.test.ts` break the recorded trees for the kinds of tokens
and the ranges, and make, by hand, the smallest trees that hold each of the
sentences of the diagram (the hand-made trees and their breaking cases are built
by `tests/check-tree-built.ts`; the journey file makes fourteen of them); and
`check-tree-node-ranges.test.ts` makes, by hand, the click statements for the
order of their child fields. `check-tree-requirement.test.ts` makes, by hand,
the smallest trees that hold each sentence above, breaks each in every way that
the sentence distinguishes, with the problem that the check must report for it,
and breaks the recorded trees of named fixtures. `check-tree-mindmap.test.ts`
does the same for the sentences of the mindmap diagram, on hand-made trees and
on the recorded trees of named fixtures; it breaks the recorded trees for the
kinds of tokens and the ranges, and requires the tables of the check to be the
Type and the Meaning columns of ast/mindmap.md. `check-tree-timeline.test.ts`
does the same for the sentences of the timeline diagram, on hand-made trees and
on the recorded trees of named fixtures, which it breaks for the kinds of tokens
and the ranges too, and it requires the tables of the check to be the Type and
the Meaning columns of ast/timeline.md. `check-tree-sankey.test.ts` makes, by
hand, the smallest trees that hold the sentences of the sankey diagram above,
breaks each in every way that the sentence distinguishes, with the problem that
the check must report, and requires the table of the check to be the Type column
of ast/sankey.md. `check-tree-xychart.test.ts` makes, by hand, the smallest
trees that hold the sentences of the xychart diagram above, breaks each in every
way that the sentence distinguishes, with the problem that the check must
report, and requires the tables of the check to be the Type and the Meaning
columns of ast/xychart.md. It also breaks the recorded trees of named fixtures
for the kinds of the tokens, their order, the orientation, the kind of a plot,
`closed`, and the ranges. `check-tree-quadrant.test.ts` makes, by hand, the
smallest trees that hold the sentences of the quadrant chart above, with the
tokens of the kinds and the layout of `parser/docs/tokens/quadrant.md`, breaks
each in every way that the sentence distinguishes, with the problem that the
check must report, and requires the tables of the check to be the Type and the
Meaning columns of ast/quadrant.md. It also breaks the recorded trees of named
fixtures for the kinds of the tokens, their order, the number of a quadrant, the
axis, the arrow, the kind of a label, the value of a title, and the ranges.
`check-tree-string-tokens.test.ts` changes the kind of a token of the first
string of the recorded tree of a named fixture of the flowchart, class, state,
ER, and sankey diagrams, and requires the check of the tokens of a string to
report it. The tests that require a recorded tree for every node type or every
field leave out the node types whose names start with a prefix of
`NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES` (`tests/check-tree-recorded.ts`),
the new diagram types whose trees are not recorded yet; the prefix is removed
when the trees are recorded, and the list stays empty between two diagram types.
`tests/check-tree-fields.test.ts` is the test of the paragraphs above: it reads
the recorded trees once and indexes the first tree that has each node type, and
the first in which each field is null and is not null, and it breaks each field
in the tree that the index gives; any recorded tree that has the field will do,
since the problem that the field must cause has the same message in every tree.
It has a named case for each field of a string that may be null, in each
direction, for each rule of `null-fields.ts`, and for the two parts of a box
text, whose message holds the place of a token (a fixture, a type, a field, and
the exact message of the problem at the node), and, made by hand from the tree
of a note with two whitespace characters before its `:`, the three notes with
one, whose text is null and which the check must accept.
`tests/check-tree-values.test.ts` is the test of the value rule: for every node
type with a value, it adds a character to the value at either end and drops one
from either end, and requires each value so made to be reported at its node,
with the message of the rule of the type (the written text, or the tokens
joined; the style of a class diagram or an ER diagram has the second). For each
node type with a value that has a token with whitespace at an end, it has a
named case (a fixture, a token, a side, and the exact problems) that takes the
whitespace off that end of the token in the recorded tree and requires the
problems; for each other type, it names a fixture whose tokens in a node of the
type have no whitespace at an end, with the reason, and it requires every type
to be one or the other. It also lists by name the fixtures of a diagram comment
that a comment line cuts: eight that end at a line feed, and one each that ends
at a CRLF, at a lone CR, and at the end of the text; it requires their recorded
trees to be accepted, and, for the CRLF and the lone CR, a value with another
line terminator to be reported with its exact message.
`tests/check-tree-comments.test.ts` makes, by hand, a diagram comment and a
comment line that end at a line feed, a CRLF, a lone CR, and the end of the
text, and requires the range that ends after the line terminator to be reported.
`tests/check-tree-cut-tokens.test.ts` is a list of named cases, each of which
takes the recorded tree of a named fixture and writes a directive, or a `;` that
the line rule ignores, once, twice, or three times, inside one of its tokens, as
a parser that cuts the token would record the text. The cases are an
`Identifier`, a `Numeric`, a `Keyword` (into two fragments in each diagram, and
into three and four in a flowchart), a `Punctuator` (into two fragments in each
diagram, where the fragments of a sequence, class, state, and ER diagram are
texts that the diagram lacks, and into three in a flowchart), and a `String` cut
into `String` tokens, each cut by a directive or by a `;`. For each, the test
requires the check to report the problems of the condition that the case names,
with their exact places and messages, and requires the unedited tree of the
fixture to have none. A `String` cut into `StringFragment` tokens and a
`RawText` cut into `RawText` tokens, by a directive and by a `;` and in several
diagrams, are required to have no problem at all. The same file makes, by hand,
the trees of a run of `Punctuator` fragments of `:::` that cuts attach a `)` to
before it, a `(` after it, or both, and requires the one problem for the run of
`:::`; and a `)` and a `(` that a cut separates are required to have none.
`tests/check-tree-keywords.test.ts` requires the table of the `Keyword` texts to
be the words of the row of each diagram and the texts of the units that the row
names without their text, and to hold every `Keyword` token of a recorded tree,
and it makes, by hand, the trees of two, three, and four `Keyword` fragments.
`tests/check-tree-punctuators.test.ts` requires the table of the texts of the
`Punctuator` tokens, and the table of the shapes, to agree with the documents,
and, on a tree made by hand, the check of a `Punctuator` text that its diagram
does not have, in each diagram. `tests/check-tree-flowchart.test.ts` requires
the directions of the flowchart header that the check knows to be those of the
rule of the specification. `tests/check-tree-cut-whitespace.test.ts` takes, from
a named fixture each, a `RawText` or `StringFragment` token next to a cut and
takes the whitespace off its side that touches the cut, one case for each side
(before the cut, after it), each kind of cut (a directive, a comment region, a
`;` that the line rule ignores), and each kind of token (`RawText`,
`StringFragment`), and requires the check to report the tree with the message of
its value (the texts of the tokens joined are not the written text). For an
ignored text it has a case for a directive and one for a comment region, with
the message that the whitespace next to a cut lies in no token. It also makes,
from one recorded tree each, the two negative cases of the other exceptions: a
token that starts with whitespace in a value that began before it, where the
token before it does not touch it, and a token of whitespace that ends with
whitespace in the middle of a value, where no token follows it. The check must
report each with its message. `tests/check-tree-node-types.test.ts` requires the
tables of node types of the check to classify the node types that the tree
documents of the specification define, and no others. `tests/check-tree.test.ts`
and `tests/check-tree-*.test.ts` break a tree, one condition at a time, and
require the check to report it. The conditions that every tree satisfies
(positions, the placement of every character, the order of the tokens, the cuts,
the comments, the directives, and the frontmatter) are broken mostly on
hand-made trees (`check-tree.test.ts`, `check-tree-comments.test.ts`,
`check-tree-cut-units.test.ts`). The form of a tree, its fields and values, the
whitespace at the ends of tokens, the literals, and the conditions of a diagram
are broken on recorded trees, those of a diagram on the recorded trees of named
fixtures.
