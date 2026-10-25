# Checking a recorded tree

Japanese version: [check-tree.ja.md](./check-tree.ja.md)

This document explains `checkTree()` of `@mmd-toolkit/tests`: it checks a
recorded tree (`ast.json`) against the conditions that the specification states
for a tree, from the tree and the input alone, without running a parser.

`checkTree()` checks tree conditions: fields, ranges, tokens and their lexical
invariants. It does not decide input acceptance. Acceptance conditions,
including semantic rejections, belong to the parser and are checked by comparing
the recorded result kind (`ast.json` or `parse-error.json`) with the fixture's
specification reading (`fixtureAccepts`).

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
- HTML attribute-quote positions use the same shared conversion as the Db: they
  are found once over the whole source after the frontmatter, including comments
  and earlier statements. Checks of strings, labels and data blocks apply that
  context to their ranges; they do not find tags anew inside each value. Written
  node values and token texts retain their original quotes. [fixture:
  venn/db-html-tag-from-title-name] [fixture: venn/db-html-tag-from-title-label]
  [fixture: venn/db-html-tag-from-title-style] [fixture:
  venn/db-html-tag-from-comment-name] [fixture: venn/db-html-tag-across-names]
  [fixture: c4/db-html-tag-from-earlier-text] [fixture:
  kanban/db-html-tag-from-earlier-text] [fixture:
  kanban/db-html-tag-from-earlier-text-data] [fixture:
  block/db-html-tag-from-earlier-text] [fixture:
  quadrant/db-html-tag-from-earlier-text] [fixture:
  sankey/db-html-tag-from-earlier-text] [fixture:
  sankey/db-html-tag-from-earlier-text-quoted] [fixture:
  xychart/db-html-tag-from-earlier-text]
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
  same marks, a mindmap diagram, an xychart diagram, a C4 diagram, and a
  quadrant chart the mark `%%`; a fragment without a mark follows a comment
  region (parser/docs/tokens.md, Comment;
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
    number has an optional sign followed by digits with an optional fraction or
    by a fraction alone (The axis context), and a string is closed and holds no
    `"` but the `"` of an HTML attribute quote, which is read as `'` (Strings).
    A diagram comment has the mark `%%` (Comments). The kinds of the tokens are
    those of `parser/docs/tokens/xychart.md`: a token that a node writes itself
    is `Punctuator` for `[`, `]`, `,`, `;`, `:`, `{`, `}`, and `-->`, and
    `Keyword` for the header, the orientation, and the keywords; the tokens of a
    text without quotes and of the text of an accessibility statement are
    `RawText`, those of a number `Numeric`. The tokens that a node writes itself
    and its child nodes lie in this order, with only whitespace between them:
    the header, the orientation if there is one; `title` and its text; `x-axis`
    or `y-axis`, the title, and the data, the title first; `[`, the categories
    with a `,` between each two, and `]`; the start, `-->`, and the end; `line`
    or `bar`, the title, and `[`, the values with a `,` between each two, and
    `]`; a number and its label; `accTitle` or `accDescr`, `:`, and the text,
    which runs to the end of its line; and `accDescr`, `{`, the text, and `}`
    (the `}` only when `closed` is true). The diagram writes itself the `;` that
    end lines. The orientation is the second token of the header as written, or
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
  - gitgraph: all 18 node types, child fields and source order follow
    [ast/gitgraph.md](../../spec/docs/ast/gitgraph.md). The header keeps only a
    written LR/TB/BT direction or null; joined and separated colons have their
    distinct boundaries, and no visible LF separates header components.
    [fixture: gitgraph/gram-all-fields] [fixture: gitgraph/header-only]
    [fixture: gitgraph/header-colon-commit-inline] [fixture:
    gitgraph/header-hidden-before-direction-colon] [fixture:
    gitgraph/header-visible-lf-before-colon] Each statement and option checks
    its authored keyword, punctuation, allowed children and nullable fields.
    Checkout preserves checkout/switch; a message preserves msg or null for a
    bare string; type preserves NORMAL/REVERSE/HIGHLIGHT. Repeated options stay
    in source order. Option words and colons are contiguous after common
    removal; native whitespace and hidden forms cannot separate them. [fixture:
    gitgraph/gram-commit-repeated-options] [fixture:
    gitgraph/gram-merge-repeated-options] [fixture:
    gitgraph/gram-cherry-pick-repeated-options] [fixture: gitgraph/gram-switch]
    [fixture: gitgraph/lex-option-global-before-colon] [fixture:
    gitgraph/lex-option-hidden-before-colon] [fixture:
    gitgraph/gram-commit-colon-space]

    Each shared leaf is a complete lexical unit at its position. Strings must
    close and backslash pairs cannot cross physical LF or LS/PS; unescaped line
    breaks remain content. Orders are complete unsigned integers with the zero
    and dot-boundary priority. Bare references obey their word, interior and
    ending characters and lose to earlier integers, equal-length keywords and
    composite common forms; other keywords yield to longer bare references.
    [fixture: gitgraph/lex-string-escapes] [fixture:
    gitgraph/lex-string-backslash-lf] [fixture: gitgraph/lex-string-multiline]
    [fixture: gitgraph/number-leading-zero] [fixture:
    gitgraph/lex-reference-zero-before-dot] [fixture:
    gitgraph/lex-reference-multiple-digits-before-dot] [fixture:
    gitgraph/lex-reference-digit-dot] [fixture: gitgraph/lex-reference-shape]
    [fixture: gitgraph/lex-reference-reserved] [fixture:
    gitgraph/lex-reference-common-prefix] [fixture:
    gitgraph/lex-reference-keyword-prefixes]

    Each hidden form has exactly one owner: the header's named gaps, the
    statement's named reference gaps, an option's textBefore/textBeforeValue,
    textAfter before visible EOL, or body after it. Explicit character scanning
    prefers YAML's earliest qualifying closer after a body line, falling back to
    the immediately adjacent fence only when none exists; DIRECTIVE takes its
    earliest bounded closer. Consumed following LF stays outside the range. A
    following statement requires a surviving visible LF; spare LF, a closing
    space and EOF are distinguished. Ordinary gaps allow only ASCII space/tab
    and permitted visible LF. [fixture: gitgraph/header-hidden-before-colon]
    [fixture: gitgraph/lex-hidden-directive-before-branch-name] [fixture:
    gitgraph/lex-option-between-options-hidden] [fixture:
    gitgraph/lex-hidden-directive-between-option-value] [fixture:
    gitgraph/lex-yaml-three-adjacent-fences] [fixture:
    gitgraph/lex-yaml-empty-followed-later-block] [fixture:
    gitgraph/lex-hidden-directive-after-commit] [fixture:
    gitgraph/lex-hidden-directive-commit-spare-lf] [fixture:
    gitgraph/lex-hidden-directive-commit-closing-space] [fixture:
    gitgraph/lex-hidden-directive-commit-eof] [fixture: gitgraph/lex-body-bom]

    Common line values retain the text after one title separator or after an
    accessibility colon; block values trim only their outer whitespace and close
    at the first brace. Empty values are null. Earlier strings and composite
    blocks own hidden-looking text, so a native Comment after the header must
    neither start inside one nor disguise an earlier hidden DIRECTIVE. Before
    the header, detection passes at most one retained YAML block before
    second-scan directives; passed bare Comments and their common whitespace are
    trivia even between retained forms, without widening body gaps or hidden
    boundaries. Shared coverage, raw/written values, token kinds and hulls
    apply. History's acceptance conditions are checked by the parser and the
    fixture acceptance comparison described above. [fixture: gitgraph/title-tab]
    [fixture: gitgraph/lex-description-line-null] [fixture:
    gitgraph/lex-description-block-only-directive] [fixture:
    gitgraph/lex-hidden-directive-string] [fixture:
    gitgraph/lex-hidden-directive-block] [fixture:
    gitgraph/lex-hidden-directive-fallback-complete-statement] [fixture:
    gitgraph/detect-two-nonleading-blocks] [fixture:
    gitgraph/div-detect-retained-yaml-bare-ls-line] [fixture:
    gitgraph/div-detect-retained-directive-bare-bom] [fixture:
    gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
    gitgraph/lex-preheader-hidden-no-bare-unicode]

  - info: all seven node types and their fields follow
    [ast/info.md](../../spec/docs/ast/info.md). showInfo agrees with its written
    keyword; textBeforeShowInfo is empty without it and may contain visible LF
    when it is written. Keywords require common whitespace, EOF or a percent
    pair; body gaps remain ASCII space/tab and LF only. Common statements retain
    repeated and empty occurrences, with null only where their composite value
    is empty. Their title separator, colon gap, block trim and first brace are
    checked independently of their lack of Db effect. [fixture:
    info/header-inline-flag] [fixture: info/header-flag-next-line] [fixture:
    info/lex-hidden-without-flag] [fixture: info/flag-letter-suffix] [fixture:
    info/space-header-nbsp] [fixture: info/title-repeat-empty] [fixture:
    info/lex-title-two-spaces] [fixture: info/acctitle-gap] [fixture:
    info/space-block-interior] [fixture: info/accdescr-block-first-close]

    Each InfoIgnoredText is one whole hidden YAML or DIRECTIVE match in its
    named header/flag gap, body or textAfter before visible EOL. YAML uses the
    body-present closer before the empty-body fallback; DIRECTIVE uses the
    earliest bounded closer. The consumed following LF is outside the range, and
    a later statement needs surviving EOL; spare LF, closing space and EOF are
    distinct controls. Hidden-looking text enclosed by a composite value remains
    content. A native Comment after the header cannot hide an earlier DIRECTIVE
    or start inside such a value. Before the header, retained forms obey their
    boundaries and one-block detection order, while passed bare Comments and
    their accompanying common whitespace are trivia even between retained forms.
    Ordinary body gaps stay strict. RawText fragmentation is allowed only at
    common source cuts. Shared coverage, field, written-value, range and token
    checks apply. [fixture: info/lex-flag-hidden-two] [fixture:
    info/lex-hidden-after-visible-eol] [fixture: info/lex-yaml-three-fences]
    [fixture: info/lex-yaml-two-empty] [fixture:
    info/hidden-directive-after-title] [fixture:
    info/hidden-directive-title-spare-lf] [fixture:
    info/hidden-directive-title-space] [fixture:
    info/hidden-directive-title-eof] [fixture: info/hidden-yaml-inside-block]
    [fixture: info/hidden-directive-close-glued] [fixture:
    info/lex-detect-preheader-empty-braces] [fixture: info/detect-two-blocks]
    [fixture: info/div-detect-retained-yaml-bare-ls] [fixture:
    info/div-detect-retained-directive-bare-bom] [fixture:
    info/div-detect-yaml-bare-directive] [fixture: info/lex-retained-no-bare-ls]
    [fixture: info/lex-hidden-common-comment]

  - architecture: the fifteen node types, child fields and visitor order follow
    [ast/architecture.md](../../spec/docs/ast/architecture.md). Check complete
    IDs against keyword/common-form/direction priority and the maximal ID
    alternative; icon names instead allow their full colon/dash spelling.
    Strings must be closed and obey their escape boundaries. Bracket labels
    choose the first complete quoted or bare alternative on converted text,
    while kind and value keep their authored contract. String versus RawText
    content tokens follow that choice; brackets are separate punctuation.
    [fixture: architecture/lex-keyword-prefix-ids] [fixture:
    architecture/lex-keyword-terminal-priority] [fixture:
    architecture/lex-direction-id-prefix] [fixture:
    architecture/lex-icon-leading-symbols] [fixture:
    architecture/lex-string-escaped-ls] [fixture:
    architecture/lex-title-unquoted-fallback] [fixture:
    architecture/lex-title-padded-quotes] [fixture:
    architecture/html-label-authored-quotes] [fixture:
    architecture/lex-label-selected-semicolon-after-quote]

    Check declaration words and ordered optional icon/title/parent components,
    modifier braces and group word, both port colons, directions, independent
    marker characters and solid line. Icon/modifier interiors admit common
    trivia between complete components, with no padding or native hidden form;
    double dash is indivisible and yields to a whole hidden YAML match.
    ArchitectureArrow.value is the written text of its whole range minus common
    trivia, including authored internal padding and hidden forms. Alignment
    direction and at least two members retain source order; each member owns its
    preceding hidden gap, including the first member. Semantic acceptance
    remains the parser's responsibility. [fixture: architecture/db-mixed]
    [fixture: architecture/directive-icon-delimiters] [fixture:
    architecture/directive-group-delimiters] [fixture:
    architecture/gram-hidden-inside-icon] [fixture:
    architecture/gram-hidden-inside-modifier] [fixture:
    architecture/gram-edge-reversed-labeled-markers] [fixture:
    architecture/hidden-yaml-edge-gaps] [fixture:
    architecture/hidden-yaml-align-gap] [fixture:
    architecture/hidden-directive-unit-gaps] [fixture:
    architecture/directive-fields]

    Every native hidden match has exactly one owner in its named gap, textAfter
    before visible EOL, body after visible EOL, or textBeforeHeader. Absent
    components have empty gaps. Check the earliest qualifying closer in the
    selected alternative: YAML tries body-present before adjacent-empty;
    DIRECTIVE skips nonqualifying closers. Exclude the consumed following LF and
    require surviving visible EOL before a next statement; spare LF, lookahead
    space and EOF have separate controls. [fixture:
    architecture/lex-hidden-two-suffixes] [fixture:
    architecture/lex-hidden-after-visible-eol] [fixture:
    architecture/hidden-yaml-three-fences] [fixture:
    architecture/hidden-yaml-adjacent-later-closer] [fixture:
    architecture/hidden-directive-nonqualifying-close] [fixture:
    architecture/hidden-directive-spare-lf] [fixture:
    architecture/hidden-directive-closing-space] [fixture:
    architecture/hidden-directive-eof] [fixture: architecture/hidden-yaml-crlf]

    Shared common-statement checks enforce the full lexical value or null,
    authored separator/colon/brace, block trimming and first closing brace. A
    native Comment cannot hide an earlier DIRECTIVE or begin inside a string,
    label or composite description. Before the header, retained YAML and
    second-scan directives keep their own closing rules; detection-passed bare
    lines and accompanying Unicode trivia are not read again, including between
    retained forms. Without a passed line the native gap stays strict. Ordinary
    body gaps accept only ASCII space/tab and visible LF as specified. [fixture:
    architecture/common-all] [fixture: architecture/common-repeat-empty]
    [fixture: architecture/common-block-first-close] [fixture:
    architecture/hidden-directive-inside-values] [fixture:
    architecture/hidden-yaml-inside-values] [fixture:
    architecture/detect-empty-braces-bare] [fixture:
    architecture/div-retained-bare-second-scan-ls] [fixture:
    architecture/retained-yaml-no-bare] [fixture:
    architecture/retained-directive-no-bare] [fixture:
    architecture/space-body-nbsp]

  - packet: all ten node types, fields and visitor order follow
    [ast/packet.md](../../spec/docs/ast/packet.md). Range, single and relative
    blocks retain their authored endpoints or count and their own named hidden
    gaps. Check their dash/plus/colon operators, required closed string label,
    integer spelling and complete units. The zero integer branch ends after one
    digit, and the nonzero branch can shorten before a dot. A range dash yields
    to a whole hidden YAML match. Only the plain packet header requires common
    whitespace, EOF or a percent-pair boundary; packet-beta may touch its first
    block or common form. No visible LF can divide block components. Semantic
    rejection belongs to the parser and fixture result comparison. [fixture:
    packet/gram-mixed] [fixture: packet/gram-single-hidden-gaps] [fixture:
    packet/gram-hidden-range-gap-spaced] [fixture: packet/gram-hidden-yaml-gap]
    [fixture: packet/gram-relative-hidden-colon] [fixture:
    packet/gram-leading-zero] [fixture: packet/lex-integer-shorter-before-dot]
    [fixture: packet/lex-dash-before-yaml] [fixture: packet/header-inline-block]
    [fixture: packet/header-beta-glued-block] [fixture:
    packet/gram-visible-newline-in-block] [fixture: packet/lex-label-escaped-lf]
    [fixture: packet/db-label-empty-single]

    Each PacketIgnoredText is one complete hidden match owned exactly once by
    textBeforeHeader, body, an internal block gap, or textAfter before visible
    EOL. Scan the earliest qualifying closer in the selected alternative: YAML
    tries a body-present match before the adjacent empty fallback, and DIRECTIVE
    uses its first bounded closer. Exclude a consumed following LF from the
    range; require surviving visible EOL before the next statement. Spare LF,
    lookahead space and EOF are separate controls. Enclosing strings and common
    values retain hidden-looking content, and line values absorb YAML dashes.
    [fixture: packet/lex-hidden-two-suffixes] [fixture:
    packet/lex-hidden-after-visible-eol] [fixture:
    packet/hidden-yaml-adjacent-later] [fixture: packet/lex-yaml-two-nonempty]
    [fixture: packet/hidden-directive-later-close] [fixture:
    packet/hidden-directive-block] [fixture:
    packet/hidden-directive-block-spare] [fixture:
    packet/hidden-directive-block-space] [fixture:
    packet/hidden-directive-block-eof] [fixture: packet/hidden-yaml-crlf]
    [fixture: packet/hidden-yaml-in-label] [fixture:
    packet/hidden-yaml-in-description] [fixture:
    packet/hidden-yaml-title-absorbed]

    Common statements check their authored keyword, separator/colon/brace,
    complete value or null, block trim and first closing brace. Shared written
    values, token kinds, coverage and range hulls apply. After the header a
    native Comment cannot hide a matching earlier DIRECTIVE or start inside an
    enclosing string/composite description. Before the header, one retained YAML
    precedes second-scan directives; detection-passed bare Comments and their
    accompanying Unicode whitespace remain trivia, including between retained
    forms. Without a passed bare line those gaps stay native. Ordinary body gaps
    stay ASCII space/tab and LF only. [fixture: packet/lex-title-two-spaces]
    [fixture: packet/acctitle-empty] [fixture:
    packet/accdescr-block-first-close] [fixture:
    packet/lex-description-comment-only] [fixture:
    packet/hidden-directive-close-glued] [fixture:
    packet/lex-label-native-directive] [fixture:
    packet/lex-description-hidden-first-brace] [fixture:
    packet/detect-one-block] [fixture: packet/detect-two-blocks] [fixture:
    packet/detect-second-scan-directive] [fixture:
    packet/detect-empty-braces-bare] [fixture: packet/retained-yaml-bare-ls]
    [fixture: packet/retained-directive-bare-bom] [fixture:
    packet/div-detect-yaml-bare-directive-ls] [fixture:
    packet/lex-retained-no-bare-ls] [fixture: packet/line-ls-between]

  - pie: all eight pie node types and their child order follow
    [ast/pie.md](../../spec/docs/ast/pie.md). The diagram keeps showData only
    for its written flag; textBeforeHeader holds only retained hidden forms,
    textBeforeShowData is empty without the flag, and hidden forms following the
    header or flag otherwise begin body. Every section, including empty and
    duplicate labels, remains a statement. [fixture: pie/db-all-fields]
    [fixture: pie/header-only] [fixture: pie/frontmatter-nonleading-comment]
    [fixture: pie/review-hidden-directive-before-showdata] [fixture:
    pie/frontmatter-after-header] [fixture: pie/label-empty] [fixture:
    pie/db-three-definitions] Before the header, detection permits one retained
    YAML block with a body line, before second-scan directives and native bare
    percent lines. Empty or punctuation-only percent-brace lines passed by
    detection are Comments, rather than hidden directives; a retained
    second-scan directive has a word type after common removal. [fixture:
    pie/detect-two-nonleading-blocks] [fixture:
    pie/detect-second-scan-directive-before-block] [fixture:
    pie/lex-yaml-after-comment-adjacent-fences] [fixture:
    pie/lex-yaml-after-bare-comment] [fixture:
    pie/lex-preheader-yaml-empty-line-control] [fixture:
    pie/lex-hidden-directive-second-detection-scan] [fixture:
    pie/lex-bare-percent-braces-before-header] [fixture:
    pie/lex-hidden-comment-before-header] Bare lines and the common whitespace
    and line terminators detection passes after them remain trivia even between
    a retained form and the header or another retained form. This does not widen
    body gaps or hidden closing boundaries. [fixture:
    pie/div-preheader-retained-yaml-bare-ls] [fixture:
    pie/div-preheader-retained-directive-bare-ls] [fixture:
    pie/div-preheader-retained-yaml-bare-bom] [fixture:
    pie/div-preheader-retained-directive-bare-bom] [fixture:
    pie/div-preheader-retained-yaml-bare-ls-line] [fixture:
    pie/div-preheader-retained-directive-bare-ls-line] [fixture:
    pie/div-preheader-retained-yaml-bare-then-directive] [fixture:
    pie/lex-preheader-retained-yaml-bare-ascii] [fixture:
    pie/lex-preheader-retained-directive-bare-ascii] [fixture:
    pie/lex-preheader-retained-yaml-bare-ascii-line] [fixture:
    pie/lex-preheader-retained-directive-bare-ascii-line] [fixture:
    pie/lex-preheader-retained-yaml-bare-then-directive-ascii] The
    case-sensitive pie/showData keywords require common whitespace, EOF or a
    percent pair immediately afterwards; intervening unreadable Unicode
    whitespace is rejected. StringLiteral is a complete closed single- or
    double-quoted unit: backslash escapes cannot cross a physical LF or LS/PS,
    while unescaped line breaks are content. NumericLiteral is a complete
    optional-minus integer or fraction, with leading zeroes allowed only in a
    fraction. Whether its shared double is negative, including on duplicates,
    belongs to parser acceptance rather than tree checking. Negative zero and
    negative underflow still have their written numeric values checked.
    [fixture: pie/header-letter-suffix] [fixture: pie/showdata-quote-glued]
    [fixture: pie/lex-header-nbsp] [fixture: pie/label-single-quote] [fixture:
    pie/label-escaped-quotes] [fixture: pie/label-multiline] [fixture:
    pie/label-backslash-ls] [fixture: pie/number-leading-zero] [fixture:
    pie/number-decimal-leading-zero] [fixture: pie/db-duplicate-negative]
    [fixture: pie/number-negative-zero] [fixture:
    pie/review-number-negative-underflow-final] Common values fill their entire
    composite lexical form. A title starts after one ASCII space/tab;
    accessibility line text starts immediately after its colon, whose preceding
    gap allows only ASCII spaces/tabs. These line values preserve their written
    edges and end before LF or a percent pair. Description blocks permit common
    whitespace before the opener, close at the first brace, and retain a trimmed
    interior. Null means no written value, including whitespace-only block
    interiors; it does not erase the statement. [fixture: pie/title-spaces]
    [fixture: pie/acctitle-spaces] [fixture: pie/acctitle-eof] [fixture:
    pie/ast-title-tab-null-eof] [fixture: pie/title-comment] [fixture:
    pie/accdescr-block-gap] [fixture: pie/accdescr-block-nested] [fixture:
    pie/review-accdescr-empty-block-first] Each PieIgnoredText is one complete
    hidden YAML or DIRECTIVE form. Explicit character scanning checks YAML's
    earliest bounded closer after at least one body line; only when none exists
    may the immediately following fence close an empty body. [fixture:
    pie/lex-yaml-three-adjacent-fences] [fixture:
    pie/lex-yaml-immediate-fence-before-later-closer] [fixture:
    pie/lex-yaml-three-fences-before-value] [fixture:
    pie/lex-nonleading-yaml-three-adjacent-fences] [fixture:
    pie/lex-yaml-apparent-empty-pairs-unmatched-fence] [fixture:
    pie/review-yaml-hidden-empty] [fixture:
    pie/lex-yaml-before-colon-two-blocks] DIRECTIVE uses its earliest bounded
    closer. The consumed following LF stays outside the node. [fixture:
    pie/lex-yaml-closer-suffix-skip-later] [fixture:
    pie/lex-hidden-multiple-closers] Only the specified section gaps, common
    textAfter lists and diagram positions can own it; strings and description
    blocks absorb hidden-looking text as content. A visible LF cannot stand
    between section components or before showData. After a completed statement,
    a following item needs an LF that remains after hidden consumption; EOF
    needs none. A hidden form after a visible EOL belongs to body, rather than
    the preceding statement. [fixture: pie/review-yaml-between-label-colon]
    [fixture: pie/frontmatter-between-section-parts] [fixture:
    pie/lex-yaml-closer-suffix-skip-later] [fixture:
    pie/lex-hidden-multiple-closers] [fixture: pie/gram-newline-before-colon]
    [fixture: pie/showdata-next-line] [fixture: pie/review-yaml-after-section]
    [fixture: pie/review-yaml-after-section-space] [fixture:
    pie/gram-section-eof-hidden-yaml] [fixture:
    pie/lex-hidden-after-title-before-comment] [fixture:
    pie/review-label-hidden-yaml-text] [fixture:
    pie/review-block-hidden-yaml-text] At each native Comment after the header,
    the earlier hidden DIRECTIVE rule must not match, and no STRING or composite
    description block may already enclose its start. Detection's pre-header bare
    percent-brace Comments remain valid. [fixture:
    pie/review-hidden-directive-after-section] [fixture:
    pie/review-hidden-directive-after-title] [fixture:
    pie/review-hidden-directive-after-acctitle] [fixture:
    pie/review-hidden-directive-after-accdescr] [fixture:
    pie/review-hidden-directive-after-block] [fixture:
    pie/review-directive-empty-body] [fixture:
    pie/lex-bare-percent-braces-before-header] Native comments also consume
    their trailing whitespace, including LS/PS; that padding is outside the
    trimmed Comment record and remains comment trivia when a common region
    bridges its continuation. [fixture: pie/lex-comment-ls-region-bridge] Shared
    coverage, written-value, raw, range and token checks also apply; hidden
    forms and common literals use RawText, numbers Numeric, and strings String
    or StringFragment. Hand-built and broken trees exercise these rules;
    recorded trees are checked without importing a parser.

  - agentflow: all 29 node types, child types, field order, required nonempty
    lists and scalar vocabularies follow
    [ast/agentflow.md](../../spec/docs/ast/agentflow.md). Structural ranges are
    the hull of their own tokens and children; source order places a split label
    before its closing arrow while visitation keeps arrow before label.
    EmptyStatement is exactly one semicolon. The header is one exact lower-case
    agentflow-beta Keyword, with the written same-line direction or null and the
    required first separator. [fixture: agentflow/gram-flow-all-forms] [fixture:
    agentflow/gram-global] [fixture: agentflow/gram-connector-all-forms]
    [fixture: agentflow/gram-tail-node-semicolons] [fixture:
    agentflow/gram-split-failure-label] [fixture: agentflow/header-only]
    [fixture: agentflow/header-td] [fixture:
    agentflow/lex-header-space-then-semicolon] [fixture:
    agentflow/gram-empty-description-after-header-direction]

    AgentflowIgnoredText has required string fields kind and value. In Name
    parts and click-prefix fields, kind must match the recognized erased form:
    click, empty-string, empty-markdown-string, empty-call, or
    empty-description-block. Direction prefixes and suffixes require
    direction-text, regardless of their spelling (ast/agentflow.md,
    AgentflowIgnoredText). [fixture: agentflow/lex-flow-name-click-state]
    [fixture: agentflow/lex-empty-string-in-flow-name] [fixture:
    agentflow/lex-empty-markdown-in-flow-name] [fixture:
    agentflow/lex-empty-call-in-connector-name] [fixture:
    agentflow/lex-empty-description-in-flow-name] [fixture:
    agentflow/lex-direction-line-greedy] A closed empty description block before
    a URL has kind empty-description-block; the same erased-form rules apply
    before URL and callback tooltips. [fixture:
    agentflow/gram-empty-description-before-href] [fixture:
    agentflow/lex-mixed-empty-forms-before-url-tooltip] [fixture:
    agentflow/gram-click-erased-before-callback-tooltip]

    Name.parts has a contributing Label, retains each recognized erased form as
    IgnoredText, keeps ordinary fragments maximal and their written whitespace,
    permits string/markdown kind only on the initial contributing fragment, and
    excludes exactly one click-context exit whitespace from its fragments. An
    empty string or empty markdown string recognized after click satisfies its
    need to read a unit without contributing a Label; in a flow, a following
    bare fragment still requires the one-whitespace exit. A terminal click that
    has read nothing is invalid. [fixture:
    agentflow/lex-name-click-empty-string-before-text] [fixture:
    agentflow/lex-name-click-empty-markdown-before-text] [fixture:
    agentflow/lex-name-click-empty-string-before-string] [fixture:
    agentflow/lex-name-click-empty-string-then-call] [fixture:
    agentflow/lex-connector-name-click-empty-string-tail] [fixture:
    agentflow/gram-name-click-empty-string-adjacent-text] [fixture:
    agentflow/gram-flow-name-click-empty-markdown-adjacent-rejected] In a
    connector, an erased empty string or empty markdown string after click, with
    kind empty-string or empty-markdown-string respectively, may touch a
    following text Label, including a leading or trailing semicolon and a Label
    that supplies the name's first contributing fragment (diagrams/agentflow.md,
    Names, strings, and click text; ast/agentflow.md, AgentflowName). [fixture:
    agentflow/lex-connector-name-click-empty-string-adjacent-text] [fixture:
    agentflow/lex-connector-name-click-empty-string-adjacent-semicolon]
    [fixture:
    agentflow/lex-connector-name-click-empty-string-no-id-adjacent-semicolon]
    [fixture:
    agentflow/lex-connector-name-click-empty-string-trailing-semicolon]
    [fixture: agentflow/lex-connector-name-click-empty-markdown-adjacent-text]
    [fixture:
    agentflow/lex-connector-name-click-empty-markdown-adjacent-semicolon]
    [fixture:
    agentflow/lex-connector-name-click-empty-markdown-trailing-semicolon]
    [fixture:
    agentflow/lex-connector-name-click-empty-markdown-no-id-adjacent-semicolon]
    An empty string may touch an empty markdown string before that Label; each
    erased form remains a separate IgnoredText part. [fixture:
    agentflow/lex-connector-name-click-empty-string-then-markdown] Flow and
    connector headings require one space, title brackets, and touching adjacent
    data. The final click-context exit stays outside Name before a title opener,
    heading data, or a flow heading separator, including when the last part is
    an erased empty string or markdown string; the exit is consumed before
    checking those following units (diagrams/agentflow.md, Names, strings, and
    click text; ast/agentflow.md, AgentflowName). [fixture:
    agentflow/name-click-exit-before-title-tab] [fixture:
    agentflow/name-click-exit-before-title-lf] [fixture:
    agentflow/name-click-exit-before-title-ls] [fixture:
    agentflow/name-click-exit-before-data-tab] [fixture:
    agentflow/name-click-exit-before-separator-space] Bare heading titles leave
    their bracket-interior padding outside the trimmed Label, after the opener
    (ast/agentflow.md, AgentflowLabel). [fixture:
    agentflow/name-heading-title-interior-padding] Global has only a body, and
    unnamed flows have no title or heading data. Empty blocks before a name
    separator belong to the Name; after an explicit title or global heading they
    are body statements. [fixture: agentflow/lex-flow-name-click-mixed]
    [fixture: agentflow/lex-name-click-exit-extra-space] [fixture:
    agentflow/lex-name-click-exit-crlf] [fixture:
    agentflow/lex-name-click-initial-markdown] [fixture:
    agentflow/lex-empty-call-in-flow-name] [fixture:
    agentflow/gram-flow-name-space-between-empty-blocks] [fixture:
    agentflow/gram-connector-name-terminal-click-eof] [fixture:
    agentflow/gram-flow-inline-data] [fixture:
    agentflow/gram-empty-description-after-flow-title] [fixture:
    agentflow/gram-empty-description-after-global]

    Leaf spelling and token kind must also agree with the ordered lexical rule
    at that position. Vertex ids and class suffixes use id units;
    comma-separated id lists exclude comma from each slot; shape properties are
    single id-run units; interpolation and bare callbacks use name units; bare
    container names use name-piece units with their keyword priority. Click ids
    use their own nonwhitespace runs. [fixture:
    agentflow/lex-vertex-equals-alone] [fixture:
    agentflow/lex-vertex-supplementary-alone] [fixture:
    agentflow/gram-bare-callback-global] [fixture:
    agentflow/gram-connector-name-default] [fixture:
    agentflow/gram-style-suffix] [fixture:
    agentflow/gram-class-target-empty-ends] [fixture: agentflow/gram-props]
    [fixture: agentflow/gram-linkstyle-interpolate-default] [fixture:
    agentflow/gram-click-punctuation-id] [fixture:
    agentflow/lex-class-suffix-equals] [fixture:
    agentflow/gram-class-target-global] [fixture:
    agentflow/gram-props-number-unit] [fixture:
    agentflow/gram-interpolate-default-name]

    After an initial string in a click name fragment, a bare continuation cannot
    start another string unit. [fixture:
    agentflow/gram-name-click-second-string]

    Bare label continuations use the ordinary, slanted, ellipse or split-link
    text context, including its delimiter priority; a style literal consists of
    style units, with escaped commas only in classDef. [fixture:
    agentflow/gram-bare-label-open-bracket] [fixture:
    agentflow/gram-bare-label-pipe] [fixture:
    agentflow/gram-slanted-label-open-bracket] [fixture:
    agentflow/gram-ellipse-label-open-paren] [fixture:
    agentflow/lex-style-equals-in-value] [fixture:
    agentflow/gram-classdef-escaped-comma-whitespace-tail] [fixture:
    agentflow/gram-split-edge-string-bare-tail]

    Vertex/group/link fields hold their written occurrences, including repeats:
    group ampersands require whitespace on both sides, vertex suffixes touch,
    property operands touch their colon, and shapes use the shared
    delimiter/name table and property only for [|. Labels retain their nonempty
    written content and initial kind. A complete arrow is one Punctuator: solid
    dashes end in > or x; reference dots have both surrounding dashes. Fields
    give none as startMarker, the matching line/endMarker and the uncapped
    written count. An opening arrow is exactly -- and requires a solid closing
    arrow and label. A pipe label allows at most one following space unit.
    [fixture: agentflow/gram-group-spaces] [fixture:
    agentflow/gram-group-unspaced] [fixture:
    agentflow/gram-node-three-definitions] [fixture:
    agentflow/gram-bracket-shapes] [fixture: agentflow/gram-props] [fixture:
    agentflow/gram-three-edge-kinds] [fixture: agentflow/db-edge-length-cap]
    [fixture: agentflow/gram-split-failure-label] [fixture:
    agentflow/gram-reference-quoted-pipe-label] [fixture:
    agentflow/gram-pipe-label-two-spaces-after]

    DataBlock has complete @{ and } delimiters, RawText interior, and the exact
    written value, including empty and adjacent blocks separately. Only double
    quotes protect an interior caret or brace; the data context does not treat
    backslash as a quote escape. YAML, alias resolution, metadata types and
    shape catalogues are not validated. [fixture:
    agentflow/gram-data-adjacent-multiline-blocks] [fixture:
    agentflow/db-data-block-empty-multiline] [fixture:
    agentflow/lex-data-block-caret] [fixture:
    agentflow/lex-data-block-quoted-caret] [fixture:
    agentflow/lex-data-backslash-quote-is-not-escape] [fixture:
    agentflow/db-data-block-invalid-yaml] [fixture:
    agentflow/div-metadata-yaml-self-alias] In the text left after common
    preprocessing, a diagram comment cannot cut a data block, literal, name,
    split-link text or initial string: those contexts read percent pairs as
    content. Above the default size limit, the common comment regions may still
    cut those values before lexing. [fixture:
    agentflow/div-data-percent-line-is-content] [fixture:
    agentflow/comment-split-edge-label] [fixture:
    agentflow/lex-flow-name-string-comment-content] [fixture:
    agentflow/lex-accessibility-block-comment] [fixture:
    agentflow/comment-default-size-fallback-inline-label]

    Style/class/linkStyle lists retain comma slots and null holes, including
    terminal holes. An id list needs an actual id or comma, and a null style
    still needs a written whitespace unit beyond its required gap. [fixture:
    agentflow/gram-class-one-operand] [fixture:
    agentflow/gram-style-empty-value] ASCII padding consumed by a following
    comment supplies no style unit; non-ASCII whitespace remains a unit.
    [fixture: agentflow/gram-style-null-before-comment] [fixture:
    agentflow/gram-style-null-before-comment-nbsp] Style literals keep leading
    whitespace and exclude trailing padding. Keyword, id/class-value and
    interpolation gaps have the exact one-space width of Agentflow. ClassDef
    retains escaped commas inside its literal; linkStyle has interpolation or
    styles and canonical indices naming preceding chain/group edges, including
    nested bodies. The separate exceedsMaxEdges helper checks the site limit.
    [fixture: agentflow/gram-class-target-empty-ends] [fixture:
    agentflow/gram-classdef-trailing-empty-name] [fixture:
    agentflow/gram-style-all-null] [fixture:
    agentflow/gram-linkstyle-trailing-null-style] [fixture:
    agentflow/db-node-style-first-leading-spaces] [fixture:
    agentflow/gram-classdef-escaped-comma] [fixture:
    agentflow/lex-style-double-space-keyword] [fixture:
    agentflow/lex-class-double-space-value] [fixture:
    agentflow/lex-linkstyle-interpolate-double-space] [fixture:
    agentflow/lex-linkstyle-leading-zero] [fixture:
    agentflow/gram-linkstyle-style-out-of-bounds] [fixture:
    agentflow/config-max-edges-group]

    A URL or tooltip occupies exactly one complete string unit, with no bare
    continuation or merged following string. [fixture:
    agentflow/gram-click-url-merged-strings]

    Click id lists keep null ends. Bare callbacks are Identifier; call names and
    optional arguments are opaque Literals, with padding retained and
    whitespace-only arguments null. A second call can supply arguments after
    empty first parentheses. URL/tooltip strings are closed and nonempty; target
    is the written final target Keyword or null. Each
    textBeforeUrl/textBeforeTooltip item is a complete recognized erased form at
    its declared position, with the following value required. No prefix field
    exists before a callback name or target. Tooltip and target gaps remain one
    space unit. [fixture: agentflow/gram-click-id-empty-ends] [fixture:
    agentflow/gram-click-callback-forms] [fixture:
    agentflow/gram-click-callback-space-args] [fixture:
    agentflow/gram-callback-arguments-after-second-call] [fixture:
    agentflow/gram-url-tooltip-whitespace-only] [fixture:
    agentflow/gram-click-link-forms] [fixture:
    agentflow/gram-click-erased-before-url] [fixture:
    agentflow/gram-click-erased-before-callback-tooltip] [fixture:
    agentflow/lex-mixed-empty-forms-before-url-tooltip] [fixture:
    agentflow/div-empty-description-before-callback-name] [fixture:
    agentflow/div-empty-description-before-link-target]

    Direction uses family priority TB, BT, RL, LR, TD and the last matching
    occurrence within that family; trimmed nonempty prefixes/suffixes are
    IgnoredText. Accessibility line values retain their complete line after
    leading whitespace, including a later physical line, with null only at EOF;
    block closed follows the written brace and an unclosed block reaches EOF. A
    block value stops at its first closing brace, leaving following statements
    outside the value. [fixture: agentflow/db-accessibility-block] The same
    default-size comment and immediate-brace conversion as dbFromTree supplies
    the lexical gaps. Complete frontmatter trivia includes empty and
    whitespace-only lines after its closing delimiter, but preserves the
    indentation of the first nonblank body line. [fixture:
    agentflow/frontmatter-extra-trivia-boundary] [fixture:
    agentflow/frontmatter-extra-trivia-below] [fixture:
    agentflow/frontmatter-extra-whitespace-line-boundary] [fixture:
    agentflow/frontmatter-extra-trivia-above] [fixture:
    agentflow/frontmatter-extra-trivia-indent-above] [fixture:
    agentflow/lex-direction-value-priority] [fixture:
    agentflow/lex-direction-last-selected-occurrence] [fixture:
    agentflow/lex-direction-unclosed-bracket-prefix] [fixture:
    agentflow/db-acctitle-next-line] [fixture: agentflow/db-acctitle-eof]
    [fixture: agentflow/db-accessibility-unclosed-block] [fixture:
    agentflow/comment-default-size-equal-frontmatter] [fixture:
    agentflow/comment-default-size-above-frontmatter] [fixture:
    agentflow/lex-brace-string-keeps-blank-line]

    Before membership filtering, hasOwnProperty followed by another nonempty
    flow candidate rejects; direction/global/style/class/linkStyle/click do not
    contribute candidates. Duplicate ids, unresolved references, containment
    cycles and known removed shapes do not reject. Shared whole-unit checks
    reject internal directive/ignored-semicolon boundaries; unsupported empty
    forms have no free statement or gap field. [fixture:
    agentflow/gram-flow-named-member-hasownproperty] [fixture:
    agentflow/gram-hasownproperty-last-member] [fixture:
    agentflow/gram-flow-hasownproperty-before-empty-statement] [fixture:
    agentflow/db-flow-three-definitions] [fixture:
    agentflow/db-diagnostics-no-semantic-checks] [fixture:
    agentflow/db-diagnostics-containment-cycle] [fixture:
    agentflow/db-data-block-removed-shape] [fixture:
    agentflow/div-directive-in-arrow] [fixture:
    agentflow/div-ignored-semicolon-in-arrow] [fixture:
    agentflow/div-empty-string-statement]

  - usecase: all 26 node types, nullable fields, nonempty lists, child types and
    scalar words follow [ast/usecase.md](../../spec/docs/ast/usecase.md).
    Structural ranges are the hull of written tokens and children, in source
    order, with one complete lower-case usecase-beta header and physical line
    separators. Native gaps use only ASCII HWS; Unicode whitespace remains value
    content where permitted. Each Identifier, quoted string, bare label,
    stereotype, CSS name and CSS value must be a lexical unit of its particular
    position, with keyword/operator priority and numeric alternatives checked. A
    single-quoted StringLiteral must be closed by the same single quote;
    backslash does not escape it. [fixture: usecase/db-all-fields] [fixture:
    usecase/lex-whitespace-leading] [fixture: usecase/lex-unicode-indent]
    [fixture: usecase/lex-number-decimal-id-unit] [fixture:
    usecase/lex-forward-circle-id-prefix] [fixture:
    usecase/lex-native-single-quoted-keys] [fixture:
    usecase/lex-plain-single-apostrophe]

    A CSS name has one Identifier atom, or a dash-prefix Punctuator and one
    Identifier word; HWS between them stays in the name but in no token. RawText
    and String items fragment only at common source cuts. [fixture:
    usecase/lex-class-property-custom-gap] [fixture:
    usecase/lex-css-name-custom-tab] [fixture: usecase/directive-in-label]
    [fixture: usecase/lex-directive-css-name-gap]

    A split opening must be the complete operator selected with its following
    label source: `--o`, `--x` and longer dash runs cannot be split into a
    shorter opening and label text. HWS after the opening keeps that label
    separate. [fixture: usecase/gram-split-opening-forward-circle-prefix]
    [fixture: usecase/gram-split-opening-forward-cross-prefix] [fixture:
    usecase/gram-split-opening-extra-dash] [fixture:
    usecase/gram-split-backward-opening-extra-dash] [fixture:
    usecase/gram-split-opening-circle-prefix-hws-control] [fixture:
    usecase/gram-split-backward-opening-dash-hws-control]

    A JSON prefix switches context before a CSS value component in both style
    and classDef; neither an empty nor a nonempty valid JSON object makes it a
    CSS Literal. [fixture: usecase/gram-style-json-prefix-mode] [fixture:
    usecase/gram-classdef-json-prefix-mode] [fixture:
    usecase/gram-style-json-prefix-nonempty-mode]

    That prefix is checked at each component boundary, including after a Word or
    hash-color, and is not retried inside a plain string, CSS identifier or
    longer Identifier unit. [fixture:
    usecase/gram-style-json-prefix-after-word-mode] [fixture:
    usecase/gram-style-json-prefix-after-hash-mode] [fixture:
    usecase/gram-style-json-prefix-in-string-control] [fixture:
    usecase/gram-style-json-prefix-css-word-control] [fixture:
    usecase/gram-style-json-prefix-identifier-control]

    Actor/entity suffixes, shapes, quoted-only names, actor lists, split and
    semantic relationships, one-level boundaries, metadata assignments, notes,
    JSON prefixes, class/style lists and accessibility forms retain exactly
    their authored children and punctuation. Arrow fields keep written marker,
    line and dash/dot counts. Native metadata validates comma/newline
    separators, key/colon/value line continuity, exact scalar types, target
    vocabularies and final native model constraints; declaration conflicts
    cannot be repaired by later updates. Accessibility values fill the whole
    colon/brace interior, keeping padding and using null only for exactly empty
    content. [fixture: usecase/gram-actor-list] [fixture:
    usecase/db-labeled-arrows] [fixture: usecase/db-semantic-case] [fixture:
    usecase/gram-boundary-nested] [fixture:
    usecase/gram-native-key-newline-colon] [fixture:
    usecase/gram-native-value-newline] [fixture:
    usecase/gram-native-trailing-newline-comma] [fixture:
    usecase/gram-native-quoted-business] [fixture:
    usecase/gram-native-final-invalid-then-valid] [fixture:
    usecase/gram-native-inline-conflict-later-fix] [fixture:
    usecase/gram-a11y-line-raw-padding] [fixture:
    usecase/gram-a11y-whitespace-block]

    After common trivia removal and CR/CRLF normalization, the optional trailing
    comma and physical line breaks between the last property and `}` total at
    most two, with the comma allowed only before the line breaks. ASCII HWS does
    not change the count. [fixture:
    usecase/gram-metadata-trailing-comma-no-newline] [fixture:
    usecase/gram-native-trailing-comma-newline] [fixture:
    usecase/gram-metadata-trailing-comma-two-newlines] [fixture:
    usecase/gram-metadata-trailing-comma-three-newlines] [fixture:
    usecase/gram-metadata-trailing-comma-one-newline-hws] [fixture:
    usecase/gram-metadata-trailing-comma-two-newlines-hws] [fixture:
    usecase/gram-metadata-trailing-comma-one-newline-crlf] [fixture:
    usecase/gram-metadata-trailing-comma-two-newlines-crlf] [fixture:
    usecase/gram-metadata-trailing-comma-three-newlines-crlf] [fixture:
    usecase/gram-metadata-trailing-comma-comment-line] [fixture:
    usecase/gram-metadata-trailing-comma-comment-line-blank-after] [fixture:
    usecase/gram-metadata-no-trailing-comma-two-newlines] [fixture:
    usecase/gram-metadata-no-trailing-comma-three-newlines] [fixture:
    usecase/gram-metadata-no-trailing-comma-four-newlines] [fixture:
    usecase/gram-metadata-no-trailing-comma-two-crlf] [fixture:
    usecase/gram-metadata-no-trailing-comma-three-crlf] [fixture:
    usecase/gram-metadata-no-trailing-comma-two-whitespace-lines] [fixture:
    usecase/gram-metadata-no-trailing-comma-whitespace-lines] [fixture:
    usecase/gram-metadata-no-trailing-comma-two-tab-lines] [fixture:
    usecase/gram-metadata-no-trailing-comma-tab-lines] [fixture:
    usecase/gram-metadata-no-trailing-comma-two-properties-two-newlines]
    [fixture:
    usecase/gram-metadata-no-trailing-comma-two-properties-three-newlines]
    [fixture: usecase/gram-edge-metadata-two-newlines] [fixture:
    usecase/gram-edge-metadata-three-newlines] [fixture:
    usecase/gram-metadata-no-trailing-comma-comment-two-newlines] [fixture:
    usecase/gram-metadata-no-trailing-comma-comment-three-newlines] A comma
    between properties still permits multiple line breaks. [fixture:
    usecase/gram-metadata-property-comma-two-newlines] [fixture:
    usecase/gram-metadata-property-comma-three-newlines]

    UsecaseJsonDataBlock has @, optional HWS, its opening brace, opaque RawText
    interior and the first balancing close. Only double quotes and their
    backslash escapes protect braces. JSON content is not validated; native
    UsecaseMetadata remains syntax. Common whole-unit checks reject source cuts
    inside atomic words/operators, while the HWS after a CSS dash prefix and
    complete JSON-prefix components may contain trivia. The per-diagram tests
    construct and break fixed trees; corpus checks use every recorded usecase
    tree and the common detection fixture. [fixture:
    usecase/gram-json-space-after-at] [fixture:
    usecase/gram-json-double-backslash-before-quote] [fixture:
    usecase/div-json-balanced-invalid-array] [fixture:
    usecase/gram-json-brace-in-single-quote] [fixture:
    usecase/div-directive-raw-json-id] [fixture:
    usecase/lex-directive-whole-json-prefix-boundary] [fixture:
    usecase/lex-directive-css-name-gap] [fixture:
    usecase/div-semicolon-css-property-selected]

  - ishikawa: child fields follow `ISHIKAWA_CHILD_TYPES`, checked against
    ast/ishikawa.md: an optional root, one literal per node, and ordered node
    children. Diagram and node ranges are the hull of their tokens and children;
    a node writes no token outside its text and descendants. [fixture:
    ishikawa/header-only-lf] [fixture:
    ishikawa/header-comment-ps-whitespace-eof] [fixture: ishikawa/db-all-fields]
    [fixture: ishikawa/db-three-definitions] `indent` is a nonnegative integer
    equal to the written line whitespace count, with a tab counted as one,
    excluding directive interiors and common comment regions; on the header line
    only whitespace after the header counts, and a U+2028 or U+2029 ending a
    diagram comment counts with following whitespace, excluding whitespace
    inside that comment. [fixture: ishikawa/db-indent-tab-character] [fixture:
    ishikawa/db-indent-equal-mixed-whitespace] [fixture:
    ishikawa/db-indent-around-directives] [fixture:
    ishikawa/header-same-line-root] [fixture: ishikawa/comment-preserved-u2028]
    [fixture: ishikawa/comment-preserved-u2029] [fixture:
    ishikawa/lex-indent-multiline-directive] [fixture:
    ishikawa/lex-header-indent-multiline-directive] [fixture:
    ishikawa/lex-indent-comment-region-ls] [fixture:
    ishikawa/lex-indent-comment-region-ps] [fixture:
    ishikawa/lex-comment-ps-indent-excludes-body-padding] The first cause is a
    root child, root indentation decides no parent, and later causes at or below
    the first cause's indentation are root children; otherwise the nearest
    earlier cause with strictly smaller indentation is the parent, with siblings
    in source order. [fixture: ishikawa/db-indent-first-cause] [fixture:
    ishikawa/db-indent-root-deeper] [fixture: ishikawa/db-indent-root-shallower]
    [fixture: ishikawa/db-indent-relative-zero] [fixture:
    ishikawa/db-indent-clamp-below-base] [fixture:
    ishikawa/db-indent-nearest-smaller-cause] [fixture: ishikawa/db-indent-jump]
    [fixture: ishikawa/db-indent-pop-several] A literal has its nonempty written
    value, including trailing whitespace, quotes and entities, with directives,
    common comment regions and selected ignored semicolons excluded; its RawText
    tokens are split only at those cuts. [fixture:
    ishikawa/gram-root-trailing-space] [fixture: ishikawa/gram-empty-quotes]
    [fixture: ishikawa/header-root-inline-entity] [fixture:
    ishikawa/directive-root-middle] [fixture:
    ishikawa/comment-ls-region-in-text] [fixture:
    ishikawa/lex-root-style-semicolon] Text starts with neither indentation,
    `%%`, nor a bounded header keyword, has no line break outside removed
    trivia, and runs to the end of its logical line. [fixture:
    ishikawa/lex-header-nonascii-child] [fixture:
    ishikawa/lex-header-middle-label] [fixture:
    ishikawa/gram-root-unclosed-quote] [fixture:
    ishikawa/directive-multiline-joins-node-text] [fixture:
    ishikawa/lex-kelvin-node-text] A diagram writes one complete `ishikawa` or
    `ishikawa-beta` Keyword, ignoring the case of ASCII letters and leaving
    other characters unchanged, with the beta rule first and the ASCII word
    boundary judged on the original characters; split selected headers and a
    header with nothing after it but removed directives are rejected. [fixture:
    ishikawa/header-uppercase] [fixture: ishikawa/header-beta-mixed-case]
    [fixture: ishikawa/detect-kelvin-in-header] [fixture:
    ishikawa/lex-header-kelvin-boundary] [fixture:
    ishikawa/lex-header-dotted-i-boundary] [fixture:
    ishikawa/header-beta-letter-suffix] [fixture: ishikawa/directive-in-header]
    [fixture: ishikawa/div-directive-beta-prefix] [fixture:
    ishikawa/header-only] [fixture: ishikawa/header-directive-only-eof] Blank
    lines, comments and directives create no nodes; successive node texts have a
    line break or a diagram-comment-ending LS/PS between them, and all other gap
    and tail characters are whitespace. [fixture:
    ishikawa/div-header-blank-node] [fixture:
    ishikawa/div-header-trailing-space-node] [fixture:
    ishikawa/gram-between-directive-line] [fixture:
    ishikawa/gram-root-and-child-one-line] [fixture:
    ishikawa/comment-preserved-u2028] [fixture:
    ishikawa/comment-preserved-u2029] Diagram comments have mark `%%` and end
    before a physical line break, U+2028, U+2029, or EOF. [fixture:
    ishikawa/gram-preserved-comment-after-root] [fixture:
    ishikawa/comment-preserved-u2028] [fixture:
    ishikawa/comment-preserved-u2029] [fixture: ishikawa/comment-only-eof]
  - venn: child types, nullable fields, nonempty name and property lists, subset
    arity, the numeric-id label restriction and kind sets follow ast/venn.md.
    Implicit targets are null exactly at an enabled indented text marker;
    ordinary statement starts after a newline end the mode, while blank lines,
    removed comments, common directives and swallowed fragments preserve it. An
    unindented `%%{ }%%` after an empty line ends the mode; immediately after
    the declaration, or prefixed by exactly one ASCII space or tab, it preserves
    the mode, as does a bare `%%` line or an intervening nonempty line of only
    spaces or tabs. Two or more leading spaces or tabs are skipped as one run;
    rule 7 then ends the mode at `%%{` unless rule 2 swallows a separate prefix
    character before the comment. Labels retain their complete written
    interiors, including empty quoted labels; literals retain atom spacing and
    title padding. Layout and whitespace use statement-checks.ts. Diagram
    comments use `%%`, and ignored text is the single non-whitespace code unit
    swallowed immediately before one. Keyword, punctuation and token kinds
    follow `parser/docs/tokens/venn.md`, including separate identifier, numeric
    and whole-color atoms in bare style values. Ordered keyword and title-line
    rules precede identifier atoms. Ordinary statement gaps accept only ASCII
    whitespace, while rule 2 may swallow one Notation whitespace character
    immediately before a `%%` that remains in diagram text. U+2028 and U+2029
    can be swallowed before a bare `%%` or `%%{ }%%`; before a removed common
    comment line or a real directive, they remain invalid ordinary gaps.
    [fixture: venn/gram-comment-prefix-line-separator-bare-percent] [fixture:
    venn/gram-comment-prefix-line-separator-u2029-bare-percent] [fixture:
    venn/gram-comment-prefix-line-separator-brace-comment] [fixture:
    venn/gram-comment-prefix-line-separator-u2029-brace-comment] [fixture:
    venn/gram-comment-prefix-line-separator-between-statements-bare-percent]
    [fixture:
    venn/gram-comment-prefix-line-separator-between-statements-u2029-bare-percent]
    [fixture:
    venn/gram-comment-prefix-line-separator-between-statements-brace-comment]
    [fixture:
    venn/gram-comment-prefix-line-separator-between-statements-u2029-brace-comment]
    [fixture:
    venn/gram-comment-prefix-line-separator-between-statements-implicit-text]
    [fixture:
    venn/gram-comment-prefix-line-separator-between-statements-u2029-implicit-text]
    [fixture: venn/gram-comment-prefix-line-separator] [fixture:
    venn/gram-comment-prefix-line-separator-u2029] [fixture:
    venn/gram-comment-prefix-line-separator-directive] [fixture:
    venn/gram-comment-prefix-line-separator-u2029-directive] [fixture:
    venn/lex-swallowed-nbsp-gap] [fixture: venn/lex-swallowed-vt-gap] [fixture:
    venn/lex-swallowed-ff-gap] [fixture: venn/lex-swallowed-bom-gap] [fixture:
    venn/lex-swallowed-ideographic-gap] [fixture:
    venn/lex-swallowed-nbsp-header] [fixture:
    venn/lex-swallowed-nbsp-between-subsets] [fixture:
    venn/lex-swallowed-nbsp-eof] [fixture: venn/lex-comment-swallowed-vt]
    [fixture: venn/lex-comment-swallowed-ff] [fixture:
    venn/lex-comment-swallowed-nbsp] [fixture: venn/lex-comment-swallowed-ogham]
    [fixture: venn/lex-comment-swallowed-en-quad] [fixture:
    venn/lex-comment-swallowed-em-quad] [fixture:
    venn/lex-comment-swallowed-en-space] [fixture:
    venn/lex-comment-swallowed-em-space] [fixture:
    venn/lex-comment-swallowed-three-per-em] [fixture:
    venn/lex-comment-swallowed-four-per-em] [fixture:
    venn/lex-comment-swallowed-six-per-em] [fixture:
    venn/lex-comment-swallowed-figure] [fixture:
    venn/lex-comment-swallowed-punctuation] [fixture:
    venn/lex-comment-swallowed-thin-space] [fixture:
    venn/lex-comment-swallowed-hair-space] [fixture:
    venn/lex-comment-swallowed-narrow-nbsp] [fixture:
    venn/lex-comment-swallowed-medium-math] [fixture:
    venn/lex-comment-swallowed-ideographic] [fixture:
    venn/lex-comment-swallowed-bom] [fixture: venn/lex-comment-swallowed-cr]
    U+0085 is not whitespace and remains ignored text in that position.
    [fixture: venn/lex-swallowed-nel-gap] A diagram comment stops before a line
    feed, not U+2028 or U+2029
    ([diagrams/venn.md, Comments](../../spec/docs/diagrams/venn.md#comments-and-swallowed-fragments));
    its range for the gap and tail checks includes the separators and whitespace
    between source pieces where common comment regions cut it, through the next
    line feed of diagram text or EOF. [fixture:
    venn/lex-diagram-comment-cut-ls-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ps-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ls-spaces-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ps-spaces-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ls-tab-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ps-tab-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ls-eof-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ps-eof-tree-gap] [fixture:
    venn/lex-diagram-comment-cut-ls-following-real-statement] [fixture:
    venn/lex-diagram-comment-cut-ps-following-real-statement] [fixture:
    venn/lex-diagram-comment-cut-ls-joined-unit] Label tokens cover the complete
    written interior, including padding. `check-tree-venn.test.ts` supplies and
    breaks hand-made trees and breaks recorded trees of named fixtures. The
    corpus checks include every recorded Venn tree and the common detection
    fixture; Venn has no recorded-tree exclusion.
  - c4: child types, nullable fields, nonempty argument lists, exact keyword
    families and diagram kinds follow ast/c4.md; `beforeBody` holds only empty
    description blocks, and a boundary body starts with a significant call.
    C4Literal values retain written text and exclude exterior whitespace except
    in `title` and `accDescription`; strings retain their shared value, raw text
    and closed fields, and named values are nonempty. Calls, named attributes,
    titles, accessibility forms and statement gaps use statement-checks.ts for
    layout, whitespace and hulls. Diagram comments have the mark `%%` and leave
    their line terminator outside. Token kinds and keyword and punctuation
    tables follow `parser/docs/tokens/c4.md`, including `(,` with its ASCII
    spaces and `,,` as single tokens. `check-tree-c4.test.ts` checks hand-made
    trees and breaks the recorded trees of named fixtures. The corpus checks
    include every recorded C4 tree and the common detection fixtures for all
    five diagram kinds; C4 has no recorded-tree exclusion.
  - kanban: child types and value words follow the tables of ast/kanban.md; the
    body is flat and may be empty, as may data and decoration lists. A node has
    a text, a shape, or both, with nonnegative integer indentation matching its
    written whitespace. Text keeps trailing whitespace; a shape holds one
    nonempty label of kind text, string, or markdown, and independent written
    delimiters. Adjacent data blocks touch their node and one another and keep
    opaque interiors, including empty ones; no YAML validation is performed.
    Nonempty icon and class text keep their whitespace, and decoration lines
    stay with the preceding row. Layout, touching, and ranges use
    statement-checks.ts; comments use `%%` and end at a line segment. Token
    kinds and keyword and punctuation tables follow
    `parser/docs/tokens/kanban.md`: node text, bare labels, icon and class text,
    and whole data interiors use `RawText`; quoted labels use one `String` or
    `StringFragment` tokens when cut by directives, comment regions, or ignored
    semicolons. Data delimiters are separate `Punctuator` tokens, and an empty
    interior has no token. Ranges are the hull of each node's tokens and
    children (`parser/docs/positions/kanban.md`). `check-tree-kanban.test.ts`
    checks hand-made trees and breaks the recorded trees of named fixtures. The
    corpus checks include every recorded kanban tree and the common detection
    fixture; kanban has no recorded-tree exclusion.
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
`check-tree-kanban.test.ts` also breaks named recorded trees for token kinds,
cut string and data fragments, indentation, a missing text or shape, shape
closers, label kinds, retained whitespace, the order of adjacent data blocks,
and node ranges. `check-tree-string-tokens.test.ts` changes the kind of a token
of the first string of the recorded tree of a named fixture of the flowchart,
class, state, ER, and sankey diagrams, and requires the check of the tokens of a
string to report it. The tests that require a recorded tree for every node type
or every field leave out the node types whose names start with a prefix of
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
