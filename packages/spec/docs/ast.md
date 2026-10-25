# Abstract syntax tree

Japanese version: [ast.ja.md](./ast.ja.md)

This document defines the abstract syntax tree of Mermaid text. An
implementation of this specification produces trees that use the node names and
field names defined here. A change to the tree is made here first, and
implementations follow it.

## Design goals

- **Structure and values.** The tree follows ESTree. A node carries the
  structure and the values of what it stands for, and holds its child nodes in
  named fields, such as `Root.body`. No node has a generic list of children.
  Punctuation and keywords are units that no node holds; the fields of a node
  name what they say.

- **Diagram-agnostic root.** The root holds the parts shared by all diagrams.
  The body node type depends on the diagram type.
- **What a node is.** A node type names what the node stands for in the
  language, never how its text is lexed: there is no node type per kind of unit
  and no catch-all node. The role of a node is given by the field that holds it,
  such as `styles` or `arguments`, not by a node type of its own.
- **Structure as written.** The tree shows the structure that the author wrote,
  as the language means it: the same text can have different shapes where its
  positions mean different things, such as `A,B`, which is one name as the id of
  a vertex and a list of names after `class`. The tree does not copy the steps
  by which mermaid.js builds its Db, such as joining parts and splitting them
  again.

## How fields are described

Each node type below has a table of its fields, with a name, a type, and a
meaning. The types are written in words:

- **integer**, **string**, and **boolean** have their usual meaning. A
  **number** may have a fraction.

- **list of**, followed by a type, is a sequence of values of that type, in
  order.
- A type followed by **or null** is either a value of that type or the absence
  of a value.
- Parentheses group a type: **list of (Identifier or null)** is a list whose
  elements are each an Identifier or null.
- A node type name, such as **Identifier**, is a node of that type.

Every field is set when the node is created and is never changed afterwards.

## Nodes

Every node has these fields:

| Field  | Type   | Meaning                                    |
| ------ | ------ | ------------------------------------------ |
| `type` | string | The name of the node type, such as `Root`. |

Each node type adds its own fields, and a node's child nodes are the values of
some of those fields. Each node type states its **child fields**: the fields
whose values are child nodes, in the order in which a tool that walks the tree
visits them, as ESLint does with its visitor keys. A tool follows the child
fields only. Each diagram document that adds a node type states its child fields
in the same way.

The child nodes do not overlap. A list in a child field is in source order, and
the child fields of a node are usually in source order too. They are not where
one field is written in a different place depending on the way of writing: the
fields keep one order, as ESLint's visitor keys of `TemplateLiteral` keep
`quasis` before `expressions` while the source alternates them. The diagram
document says so at each such node; a tool that needs the source order sorts the
child nodes by their ranges.

The **written text** of a unit is its source text without the whitespace and
line terminators that the unit reads before or after it, such as those around an
arrow in flowchart, whose written text is `-->` in `A --> %%{init: {}}%% B`.
[fixture: flowchart/lex-directive-after-arrow] The written text of a value runs
from the start of the written text of its first unit to the end of that of its
last unit, with the whitespace and line terminators between its units. Both
leave out what lies there but is not written as part of the value: the
directives, the comment regions, the `;` that the line rule ignores, and the
empty description blocks before the separator of a statement, each a statement
of its own. Nothing else is left out, added, or rewritten: line terminators,
attribute quotes, and entities stay as the author wrote them, not in
[converted form](./common.md#reading-a-source), which is how the lexer reads a
text. A written text therefore starts or ends with whitespace or a line
terminator only where a unit has whitespace among its own characters, as a
backquoted name of a class diagram that is not closed has at the end of the text
(see below); other whitespace written around a node belongs to no node. The
value of a leaf node is its written text, or the part of it that its node type
names: a [NumericLiteral](#numericliteral) holds the number that its written
text writes, and an [Identifier](#identifier), a
[ClassIdentifier](./ast/class.md#classidentifier), and a style of a class
diagram (see [ClassLiteral](./ast/class.md#classliteral)), the written texts of
its units joined in order. Where the value is the part inside delimiters that
belong to the node's own text, such as the content of a
[StringLiteral](#stringliteral) between its quotes or of the string that a label
starts with, or the text of a data block between `@{` and `}`, it keeps the
whitespace written inside those delimiters, at its ends too: the label of
`A[" x "]` has the value of a space, `x`, and a space, and the first data block
of `A@{`, a line break, `shape: rect`, a line break, and `}` has the value of a
line feed, `shape: rect`, and a line feed. [fixture:
flowchart/tokens-label-string-inner-whitespace] [fixture:
flowchart/gram-data-consecutive-blocks] The two literal nodes,
[StringLiteral](#stringliteral) and [NumericLiteral](#numericliteral), also have
the field `raw`, as ESTree's `Literal` does: it is the source text of the
literal from its first to its last character, with nothing left out, so it keeps
what the written text leaves out, such as the quotes of a string and a directive
or a comment region inside the string.

A node of text that mermaid.js does not read, a node type named
`<Diagram>IgnoredText` or `<Diagram>IgnoredStatement` (see
[Diagram nodes](#diagram-nodes)), such as
[FlowchartIgnoredText](./ast/flowchart.md#flowchartignoredtext) and
[StateIgnoredStatement](./ast/state.md#stateignoredstatement), shows what the
author wrote there as written: its written text is that of a value, which also
leaves out the comments. The whitespace and line terminators between its units
are part of it, and a comment is not: after `state "d" as A`, the lines
`state %% c` and `state {` with a body give A the `textBeforeBody` of `state`, a
space, a line feed, two spaces, and `state`, and in
`state X "" %%{init: {}}%% ""` followed by a line `{` with a body, it is the two
empty strings with the two spaces between them. [fixture:
state/tokens-ignored-text-comment-between-units] [fixture:
state/tokens-ignored-text-hash-comment-between-units] [fixture:
state/tokens-ignored-text-directive-between-empty-strings] [fixture:
state/tokens-ignored-statement-directive-between-empty-strings] [fixture:
class/tokens-ignored-text-directive-before-direction] [fixture:
class/tokens-ignored-text-directive-after-direction] [fixture:
flowchart/tokens-ignored-text-directive-before-direction] A diagram comment that
a comment region cuts (see [Comment lines](./common.md#comment-lines)) is left
out whole, the whitespace inside it included, while the line feed that ends it
stays: in `state X "" %% c`, U+2028, and `%% d`, followed by a line `[*]` and a
line `accDescr {} {` with a body, the comment `%% c` goes on with the line
`[*]`, and the `textBeforeBody` of X is `""`, a space, a line feed, two spaces,
and `accDescr {}`; so it is with `#c` in place of `%% c`, with U+2029 in place
of U+2028, with a space before the U+2028, with spaces before `[*]`, with a line
of only spaces in place of `[*]`, and with `x` and a space in place of `[*]`,
the space included in the comment. [fixture:
state/tokens-ignored-text-comment-cut-by-comment-line] [fixture:
state/tokens-ignored-text-hash-comment-cut-by-comment-line] [fixture:
state/tokens-ignored-text-comment-cut-by-comment-line-paragraph-separator]
[fixture:
state/tokens-ignored-text-hash-comment-cut-by-comment-line-paragraph-separator]
[fixture: state/tokens-ignored-text-comment-cut-space-before-separator]
[fixture: state/tokens-ignored-text-comment-cut-spaces-after-region] [fixture:
state/tokens-ignored-text-comment-cut-spaces-line-after-region] [fixture:
state/tokens-ignored-text-comment-cut-fragment-trailing-space]

A child field whose value is a list may have null elements where its node type
says so, as in ESTree's array holes; a tool that walks the tree skips them.

## Directives and frontmatter

These are not nodes. The root lists them as records in `directives` and
`frontmatter`; no node holds them, and a tool that walks the tree does not visit
them. Each record has a `type`; the fields below hold its content.

### Directive

`type` is `Directive`.

| Field    | Type    | Meaning                                                                         |
| -------- | ------- | ------------------------------------------------------------------------------- |
| `name`   | string  | The directive name, for example `init` in `%%{init: {...}}%%`.                  |
| `value`  | string  | The text between `%%{` and `}%%`, or to the end of the directive when unclosed. |
| `closed` | boolean | Whether the directive ends with `}%%`.                                          |

A directive is one match of the directive scan, which runs over the source text
after the frontmatter (see [common.md](./common.md#where-a-directive-is)),
without the whitespace at its end. An unclosed directive therefore runs to the
end of the text, or ends after a word argument; the whitespace that the scan
takes after the argument is removed with the directive, as the whitespace-only
lines of a comment region are with a comment, and in the tree it is whitespace,
outside the directive. `name` is the directive's name as defined there. The tree
does not parse the argument. `value` holds what is written between the
delimiters, the name included, as the `value` of the frontmatter does.

`Root.directives` plays no part in configuration: this specification does not
parse directive arguments, and mermaid.js finds the directives that configure
the diagram with a scan of its own, which differs from them in rare cases (see
[The configuration scan](../../tests/docs/configuration.md#the-configuration-scan)).

### Frontmatter

`type` is `Frontmatter`.

| Field   | Type   | Meaning                                                              |
| ------- | ------ | -------------------------------------------------------------------- |
| `value` | string | The YAML text between the delimiter lines, as written in the source. |

`value` is the body as defined in [common.md](./common.md#frontmatter); it is
not dedented, and the tree does not parse the YAML.

## Root

`type` is `Root`.

| Field         | Type                | Meaning                                                               |
| ------------- | ------------------- | --------------------------------------------------------------------- |
| `diagramType` | DiagramType         | The diagram type id as mermaid.js reports it, such as `flowchart-v2`. |
| `body`        | DiagramBody         | The diagram body.                                                     |
| `frontmatter` | Frontmatter or null | The frontmatter, if the source has one.                               |
| `directives`  | list of Directive   | Every directive, in source order.                                     |

Its only child field is `body`; `frontmatter` and `directives` are not child
fields.

`diagramType` is the id that
[`mermaid.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/mermaidAPI.ts#L96-L117)
reports as `diagramType`, because fixtures record the same ids. The `graph` and
`flowchart` headers both give `flowchart-v2`; `flowchart-elk` gives
`flowchart-elk`; `swimlane-beta` gives `swimlane`.

**DiagramType** is one of these 38 strings, in the order in which mermaid.js
tries the detectors (see [detection.md](./detection.md)): `error`,
`flowchart-elk`, `mindmap`, `architecture`, `agentflow`, `c4`, `kanban`,
`classDiagram`, `er`, `gantt`, `info`, `pie`, `requirement`, `sequence`,
`swimlane`, `flowchart-v2`, `timeline`, `gitGraph`, `stateDiagram`, `journey`,
`quadrantChart`, `sankey`, `packet`, `xychart`, `block`, `eventmodeling`,
`treeView`, `radar`, `ishikawa`, `treemap`, `railroad`, `railroadEbnf`,
`railroadAbnf`, `railroadPeg`, `venn`, `wardley`, `cynefin`, and `usecase`. They
are the ids of the detectors registered by the pinned mermaid.js, including the
`error` pseudo-diagram and excluding `---`.

mermaid.js also registers a `---` pseudo-diagram, but its parser always throws,
so an input it selects is always rejected. No tree has it, and it is not a
DiagramType. This specification defines the set of DiagramType ids. The list
includes `flowchart-elk`, `mindmap`, and `architecture`, which mermaid.js
registers only when
[`includeLargeFeatures`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagram-api/diagram-orchestration.ts#L85-L87)
is true; it is true in the default entry point of the npm package.

**DiagramBody** is an `ErrorDiagram` or one of the body node types defined in
the diagram sections below: a
[`FlowchartDiagram`](./ast/flowchart.md#flowchartdiagram), a
[`SequenceDiagram`](./ast/sequence.md#sequencediagram), a
[`ClassDiagram`](./ast/class.md#classdiagram), a
[`StateDiagram`](./ast/state.md#statediagram), an
[`ErDiagram`](./ast/er.md#erdiagram), a
[`GanttDiagram`](./ast/gantt.md#ganttdiagram), a
[`JourneyDiagram`](./ast/journey.md#journeydiagram), a
[`RequirementDiagram`](./ast/requirement.md#requirementdiagram), a
[`MindmapDiagram`](./ast/mindmap.md#mindmapdiagram), a
[`TimelineDiagram`](./ast/timeline.md#timelinediagram), a
[`SankeyDiagram`](./ast/sankey.md#sankeydiagram), an
[`XychartDiagram`](./ast/xychart.md#xychartdiagram), a
[`QuadrantDiagram`](./ast/quadrant.md#quadrantdiagram), a
[`BlockDiagram`](./ast/block.md#blockdiagram), a
[`KanbanDiagram`](./ast/kanban.md#kanbandiagram), a
[`C4Diagram`](./ast/c4.md#c4diagram), a
[`VennDiagram`](./ast/venn.md#venndiagram), an
[`IshikawaDiagram`](./ast/ishikawa.md#ishikawadiagram), an
[`AgentflowDiagram`](./ast/agentflow.md#agentflowdiagram), a
[`UsecaseDiagram`](./ast/usecase.md#usecasediagram), a
[`PieDiagram`](./ast/pie.md#piediagram), a
[`GitgraphDiagram`](./ast/gitgraph.md#gitgraphdiagram), an
[`InfoDiagram`](./ast/info.md#infodiagram), a
[`PacketDiagram`](./ast/packet.md#packetdiagram), or an
[`ArchitectureDiagram`](./ast/architecture.md#architecturediagram). [fixture:
packet/gram-mixed] [fixture: architecture/header-beta] [fixture:
architecture/db-mixed]

## ErrorDiagram

`type` is `ErrorDiagram`. A node with no other fields and no child fields.

The body of the `error` pseudo-diagram (see
[common.md](./common.md#diagram-detection)); `diagramType` is `error`.

## Shared leaf nodes

The names and values that an author writes are leaf nodes, each with its own
range, so that a tool can report on one or rewrite it without searching the
source text. The type of each is decided by what the grammar allows to be
written at its position, not by what a written example looks like: the `x` of
`accTitle: x` looks like one word, but the position allows a text with
whitespace, so it is a literal.

- A position where the grammar reads a name without whitespace, or allows only a
  single word without quotes, such as the value of a property: an
  [Identifier](#identifier).
- A position where the grammar asks for a string in quotes: a
  [StringLiteral](#stringliteral).
- A position where the grammar asks for a number: a
  [NumericLiteral](#numericliteral).
- A position where the grammar allows a text without quotes that may contain
  whitespace, and decides where it ends: a literal of the diagram type, such as
  [FlowchartLiteral](./ast/flowchart.md#flowchartliteral).
- A position where the grammar reads a name that may contain whitespace: a name
  node of the diagram type, such as
  [SequenceIdentifier](./ast/sequence.md#sequenceidentifier) and
  [ClassIdentifier](./ast/class.md#classidentifier).

- A position where the grammar allows a text, a string in quotes, a markdown
  string, or a sequence of them, and which of them is written matters as a kind:
  a label of the diagram type, such as
  [FlowchartLabel](./ast/flowchart.md#flowchartlabel), a node with its kind and
  its value.

The first three have the same form in every diagram type, so they are defined
here and their names have no diagram prefix. How a text without quotes, a name
with whitespace, or a label is read, for example whether it keeps the whitespace
at its ends, differs from one diagram type to another, so each diagram document
defines its own literal, name node, and label. None of the three nodes defined
here has child fields. Words from a fixed set, such as a direction, a shape
name, or the marker at an end of an arrow, stay strings in the fields of the
diagram's nodes, as the `kind` of ESTree's nodes does. An arrow is a node of the
diagram, such as [FlowchartArrow](./ast/flowchart.md#flowchartarrow) and
[SequenceArrow](./ast/sequence.md#sequencearrow), whose `value` is its text and
whose markers and line are such words, so that a tool reads them without reading
the characters of the arrow again; the diagrams use the same field names and the
same words for the same things (`startMarker`, `endMarker`, and `line`; `none`,
`arrow`, `cross`, `solid`, and `dotted`), and each diagram document defines its
own. Each diagram document says which of its fields hold which of these nodes
and which units each one is made of.

Text that the author writes but that the diagram does not read, and that has no
effect, is a leaf node too, of a type of the diagram that says so, such as
[FlowchartIgnoredText](./ast/flowchart.md#flowchartignoredtext), so that a tool
can find it without searching the source text. Making such text a node comes
before rejecting the input: a diagram document rejects an input because of such
text only where the tree has no place for a node of it, and then as a known
divergence (see [known-divergences.md](./known-divergences.md)).

### Identifier

A name without whitespace, or a single word without quotes at a position where
the grammar allows nothing else, such as the value of a property. A name is a
word that the grammar reads as a name at its position, such as an id or a class
name; the grammar of that position decides which characters it may contain, so a
click id or an edge id may contain symbols. A name that may contain whitespace
is a name node of the diagram type instead, such as
[SequenceIdentifier](./ast/sequence.md#sequenceidentifier) and
[ClassIdentifier](./ast/class.md#classidentifier). As in ESTree, whether
something is an identifier is a matter of its syntactic form: it need not refer
to anything, as the key of an object and the `prop` of `obj.prop` do not.

| Field  | Type   | Meaning                                              |
| ------ | ------ | ---------------------------------------------------- |
| `name` | string | The texts of its units, joined in order (see below). |

Its `name` is made from the units of the diagram's lexer that it consists of
(units are defined by each diagram document): the written text of each unit (see
[Nodes](#nodes)), joined in order. No whitespace lies inside or between these
units, so the name contains none.

### StringLiteral

A string in quotes: double quotes, or, for the backquoted names of class
diagrams and the backquoted attribute words of ER diagrams, backquotes. A
single-quoted string is also a StringLiteral where a diagram's lexical rules
accept it; it closes with the same quote, and no escapes are decoded. [fixture:
usecase/lex-native-single-quoted-keys] [fixture:
usecase/lex-native-string-backslashes]

| Field    | Type    | Meaning                                                                                                                                                                                                                                                                                  |
| -------- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `value`  | string  | Its content: what the diagram's string rules read between its delimiters, as its written text. With one pair of quotes, it is its written text without them; where a diagram nests delimiters, all of them are left out (for flowchart, see [Strings](./diagrams/flowchart.md#strings)). |
| `raw`    | string  | The source text of the string from its opening quote to its closing quote, or to its last character when it is not closed, with nothing left out and nothing converted: its quotes, and a directive, a comment region, or an ignored `;` inside it, are part of it.                      |
| `closed` | boolean | Whether the string ends with its closing quote.                                                                                                                                                                                                                                          |

`click A href "u"` has the URL with the value `u` and the `raw` `"u"`; in
`click A "u" "one`, a line break, `%% c`, a line break, and `two"`, the tooltip
has the value `one`, a line feed, and `two`, and its `raw` is the whole string,
the comment line included. [fixture: flowchart/gram-click-href] [fixture:
flowchart/tokens-string-literal-comment-line] In the same way, the URL of
`click A href "u%%{init: {}}%%v"` has the value `uv`, and its `raw` is the whole
string, the directive included. [fixture:
flowchart/lex-directive-in-click-href-string]

A string is closed by the next matching quote, as its diagram's lexical rules
define. Where a diagram accepts a string that is not closed when the text ends,
which only a backquoted name in a class diagram is (see
[Strings, backquoted names, and generic types](./diagrams/class.md#strings-backquoted-names-and-generic-types)),
its written text runs to the last character of the source that is not part of a
directive or a comment region, the whitespace and line terminators at the end
included, which mermaid.js reads into the name; line feeds inside it are part of
it too. A directive after that last character is not part of the string:
`A --> `, `` `b``, a space, and `%%{init: {}}%%` at the end of the text has the
string `` `b`` and the space, with the value `b` and a space. [fixture:
class/lex-backquote-unclosed-directive-at-end] In a class diagram, `class`,
`` `x``, a line break, and `%%{init: {}}%%` followed by a line break has the
value `x` and two line feeds, the line feed after the directive included.
[fixture: class/lex-backquote-unclosed-directive-after-line-break] Its `raw` has
no closing quote, and its `value` is its written text without the opening quote.
Its `closed` is false, as the `closed` of a [Directive](#directive) and of a
description block such as
[FlowchartAccDescrBlockStatement](./ast/flowchart.md#flowchartaccdescrblockstatement)
is for those that are not closed; every other StringLiteral has `closed` true. A
tool reads whether a string is closed from this field, and need not compare the
characters of `raw`: a backquote alone on the last line is a backquoted name
that is not closed, whose `raw` is the backquote and the line feed after it.
[fixture: class/lex-backquote-unclosed-alone] [fixture:
class/lex-backquote-unclosed] [fixture:
class/tokens-backquote-unclosed-trailing-whitespace]

### NumericLiteral

A number.

| Field   | Type   | Meaning                                               |
| ------- | ------ | ----------------------------------------------------- |
| `value` | number | The number that its written text writes, as a double. |
| `raw`   | string | The number as written, with nothing left out.         |

In `linkStyle 0,1 stroke:red`, the first number has the value zero and the `raw`
`0`. [fixture: flowchart/db-linkstyle-shared-fill] Which forms a number may take
is decided by the grammar of its position: in flowchart only digits, so every
number is an integer; in sequence also a fraction, so `autonumber .5` starts at
the number one half, with the `raw` `.5`, and `autonumber 05` at five. [fixture:
sequence/db-autonumber-fraction] [fixture: sequence/db-autonumber-leading-zero]
The value is the double nearest to the number written, which may differ from it:
in an XY chart, `bar [` followed by twenty nines and `]` has the value one
followed by twenty zeros, and `line [.` followed by four hundred zeros and `1]`
has the value zero. [fixture: xychart/db-plot-values-large] [fixture:
xychart/db-plot-values-underflow] A number too large for a double is infinity,
or minus infinity with a `-`, as mermaid.js reads it: in an XY chart, `bar [`
followed by four hundred nines and `]` has the value infinity, and the same
number after `-` minus infinity; a range, a scale width, the start and the step
of `autonumber`, and a link style number may be such a number too, which as a
link style number is out of range. [fixture: xychart/db-plot-values-overflow]
[fixture: xychart/db-plot-values-negative-overflow] [fixture:
xychart/db-x-axis-range-overflow] [fixture:
xychart/db-y-axis-range-negative-overflow] [fixture:
state/gram-scale-width-overflow] [fixture:
flowchart/gram-linkstyle-index-overflow] [fixture:
sequence/db-autonumber-start-overflow] [fixture:
sequence/db-autonumber-step-overflow]

## Diagram nodes

The nodes of each diagram type, with their fields and child fields, are defined
in a document of their own under `ast/`:

- [Flowchart](./ast/flowchart.md): the diagram types `flowchart-v2`,
  `flowchart-elk`, and `swimlane`.
- [Sequence](./ast/sequence.md): the diagram type `sequence`.
- [Class](./ast/class.md): the diagram type `classDiagram`.
- [State](./ast/state.md): the diagram type `stateDiagram`.
- [ER](./ast/er.md): the diagram type `er`.
- [Gantt](./ast/gantt.md): the diagram type `gantt`.
- [Journey](./ast/journey.md): the diagram type `journey`.
- [Requirement](./ast/requirement.md): the diagram type `requirement`.
- [Mindmap](./ast/mindmap.md): the diagram type `mindmap`.
- [Timeline](./ast/timeline.md): the diagram type `timeline`.
- [Sankey](./ast/sankey.md): the diagram type `sankey`.
- [XY chart](./ast/xychart.md): the diagram type `xychart`.
- [Quadrant chart](./ast/quadrant.md): the diagram type `quadrantChart`.
- [Block diagram](./ast/block.md): the diagram type `block`.
- [Kanban](./ast/kanban.md): the diagram type `kanban`.
- [Venn](./ast/venn.md): the diagram type `venn`.
- [Ishikawa](./ast/ishikawa.md): the diagram type `ishikawa`.
- [Agentflow](./ast/agentflow.md): the diagram type `agentflow`.
- [Usecase](./ast/usecase.md): the diagram type `usecase`.
- [Pie](./ast/pie.md): the diagram type `pie`. [fixture: pie/header-only]

The name of every node type of a diagram type starts with the name of the
diagram type, such as `FlowchartVertex`, because node types share one set of
names across all diagram types. The [shared leaf nodes](#shared-leaf-nodes) are
shared by all diagram types and have no prefix. A node type of text that
mermaid.js does not read is named `<Diagram>IgnoredText`, or
`<Diagram>IgnoredStatement` where it stands as a statement, such as
`FlowchartIgnoredText` and `StateIgnoredStatement`, and no other node type has a
name that ends so.

- [gitgraph](./ast/gitgraph.md): the diagram type `gitGraph`. [fixture:
  gitgraph/header-only]

- [Info](./ast/info.md): the diagram type `info`. [fixture: info/header-lf]

- [Packet](./ast/packet.md): the diagram type `packet`. [fixture:
  packet/gram-mixed]

- [Architecture](./ast/architecture.md): the diagram type `architecture`.
  [fixture: architecture/header-beta] [fixture: architecture/db-mixed]
