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
  diagram comment has a mark that its diagram has, and ends where its line ends;
  a flowchart and an ER diagram have the mark `%%` for a line of `%%` alone
  before their header, as every diagram type does, and for no other comment; a
  gantt diagram has the marks `%%` and `%` for its diagram comments, and a
  journey diagram and a requirement diagram the marks `#`, `%%`, and `%`; a
  fragment without a mark follows a comment region (parser/docs/tokens.md,
  Comment; [common.md](../../spec/docs/common.md#comment-lines), Comment lines).
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
    `Identifier`, those of a tag `RawText` (one for each fragment where a
    directive cuts it), and those of the URL of a link, one `String` token or
    `StringFragment` tokens where a cut lies inside it; the range of a statement
    and of a call part, which runs from the first of the tokens and child nodes
    of the node to the last, so that a click statement ends at the last part in
    the source whatever the order of its child fields, and the whitespace after
    the last token is outside it; the link, which runs from `"` to `"`; where
    the text of a setting, a title, or a section starts (one whitespace
    character after the keyword) and ends (the end of its line, or before `#` or
    `;` where the statement says so); where the value of an accessibility
    statement starts and ends, which is without the whitespace at its ends;
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
    `Keyword` for the rest; the tokens of a text are `RawText`, those of a
    string `String` or `StringFragment`, those of the text of a direction line
    `RawText`, and those of an empty description block of a body `Keyword` and
    `Punctuator`; a name is `Identifier` after `style` and `classDef` and in the
    names of a `class` statement, `RawText` for a requirement, an element, a
    relationship, and a shorthand, and `Identifier` or `RawText` for a class of
    a `class` statement. The range of a statement is the hull of its tokens and
    child nodes (`parser/docs/positions/requirement.md`).

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
- A string, a label that starts with a string, and a data block have delimiters
  that belong to their own text; the value is the written text without them,
  with the whitespace written inside them, and that whitespace lies in the
  tokens.
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
and breaks the recorded trees of named fixtures. The tests that require a
recorded tree for every node type or every field leave out the node types whose
names start with a prefix of `NODE_TYPE_PREFIXES_WITHOUT_RECORDED_TREES`
(`tests/check-tree-recorded.ts`), the new diagram types whose trees are not
recorded yet; the prefix is removed when the trees are recorded, and the list
stays empty between two diagram types. `tests/check-tree-fields.test.ts` is the
test of the paragraphs above: it reads the recorded trees once and indexes the
first tree that has each node type, and the first in which each field is null
and is not null, and it breaks each field in the tree that the index gives; any
recorded tree that has the field will do, since the problem that the field must
cause has the same message in every tree. It has a named case for each field of
a string that may be null, in each direction, for each rule of `null-fields.ts`,
and for the two parts of a box text, whose message holds the place of a token (a
fixture, a type, a field, and the exact message of the problem at the node),
and, made by hand from the tree of a note with two whitespace characters before
its `:`, the three notes with one, whose text is null and which the check must
accept. `tests/check-tree-values.test.ts` is the test of the value rule: for
every node type with a value, it adds a character to the value at either end and
drops one from either end, and requires each value so made to be reported at its
node, with the message of the rule of the type (the written text, or the tokens
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
