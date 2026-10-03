# tokenless-empty-forms

Japanese version: [tokenless-empty-forms.ja.md](./tokenless-empty-forms.ja.md)

Diagram types: flowchart, sequence, class, state. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

Some forms are written but hold nothing. In flowchart there are three:

- an **empty string**, `""`, or an empty markdown string;
- an **empty call**, `call` and the whitespace after it, followed by parentheses
  with only whitespace between them, as in `click A call ()`;
- an **empty description block**, `accDescr {}`, with only whitespace between
  the braces.

In sequence, whose grammar has no strings and no `call`, there is the empty
description block only, and so in state, which has no `call` and whose lexer
reads `""` as a string unit with a token in the statement context, where a click
statement takes strings. [fixture: state/lex-string-outside-click] [fixture:
state/gram-click-terminal] In the state context, which `state` enters,
mermaid.js reads no token for an empty string either, but there it lies only
where a unit starts, and the tree holds it in every such place: as a
StateIgnoredText before or after a name, before a body, and before or after the
string of an alias statement, and as a StateIgnoredStatement after `state` or
after another statement on its line (see
[The state string context](../diagrams/state.md#the-state-context)). So such an
input is accepted, as in mermaid.js, and is no part of this divergence.
[fixture: state/gram-state-empty-string-before-name] [fixture:
state/gram-state-empty-string-between-name-and-body] [fixture:
state/gram-state-empty-strings-around-alias-string] [fixture:
state/gram-state-empty-string-after-name] In class there are five: the three of
flowchart, and two that are written in a class name, an **empty backquoted
name**, two backquotes, and an **empty generic type**, two `~`.

An empty description block on a line of its own is the ordinary way to write
one, and is a description block statement that changes nothing:

```mmd
flowchart LR
  accDescr { }
  A
```

[fixture: flowchart/gram-acc-descr-block-empty]

This document is about these forms where the tree of this specification has no
place for them: inside a statement, or next to other text in a value.

## The difference

Each example is a whole diagram.

1. An empty string before the text of a label:

   ```mmd
   flowchart LR
     A[""x]
   ```

2. An empty call before the name of a callback:

   ```mmd
   flowchart LR
     A
     click A call ()cb
   ```

3. An empty string as a whole label:

   ```mmd
   flowchart LR
     A[""]
   ```

4. An empty description block between an arrow and an id:

   ```mmd
   sequenceDiagram
     A->>accDescr {}B: x
   ```

5. An empty description block before a message on its line:

   ```mmd
   sequenceDiagram
     accDescr {} A ->> B: x
   ```

6. An empty backquoted name inside a class name:

   ```mmd
   classDiagram
     class A``B
   ```

7. An empty string at the start of a statement:

   ```mmd
   classDiagram
     "" A --> B
   ```

8. An empty string as a cardinality:

   ```mmd
   classDiagram
     A "" --> B
   ```

| Example | mermaid.js                         | This specification                           |
| ------- | ---------------------------------- | -------------------------------------------- |
| 1       | the vertex A with the label `x`    | rejected                                     |
| 2       | A calls `cb`, as with `click A cb` | rejected                                     |
| 3       | rejected                           | rejected                                     |
| 4       | the message from A to B            | rejected                                     |
| 5       | the message from A to B            | an empty description block, then the message |
| 6       | the class `AB`                     | rejected                                     |
| 7       | the relation from A to B           | rejected                                     |
| 8       | the relation from A to B           | the relation, with an empty cardinality at A |

[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] [fixture:
flowchart/gram-label-empty-string] [fixture:
sequence/gram-empty-description-block-after-arrow] [fixture:
sequence/gram-acc-descr-block-empty-then-statement] [fixture:
class/div-empty-backquoted-in-name] [fixture:
class/div-empty-string-statement-start] [fixture: class/gram-cardinality-empty]

So mermaid.js reads an input with one of these forms as if the form were not
there. It accepts such an input wherever what is left is accepted: between
statements, inside a statement, next to other text in a label, a style, or a
subgraph name, before the ids of a click statement, and right after the header
keyword. It rejects the input where what is left is not accepted: where the form
is all of a value, as in example 3, and where it lies inside what its lexer
reads as one token, such as an arrow or a number, as in `A --""> B` and
`linkStyle 0""0 stroke:red`. [fixture: flowchart/lex-empty-string-in-arrow]
[fixture: flowchart/gram-linkstyle-number-empty-string]

One form of class is read otherwise. mermaid.js reads a direction line of class
with one rule over `direction`, the whitespace, and the value, so an empty
description block between them keeps that rule from matching, and mermaid.js
reads `direction` and the value as the two name parts of a member statement,
which it joins without the whitespace: `direction accDescr {} LR` keeps the
direction `TB` and declares no class, while `direction LR` sets `LR`, and
`direction accDescr {} LR : x` declares the class `directionLR` with the member
`x`. So mermaid.js does not read this input as if the block were not there.
[fixture: class/div-empty-description-block-between-direction-and-value]
[fixture: class/div-empty-description-block-before-direction-value-glued]
[fixture: class/div-empty-description-block-between-direction-and-value-label]

This specification makes such a form a node where the tree has a place for it,
and rejects the input elsewhere. The places are these: an empty description
block where a statement starts, also inside a sequence box, is a description
block statement, which another statement may follow on the same line (examples 5
and the one above), and so is one after the last unit of a statement and before
its separator, as in `A accDescr {}`, `note for A "x" accDescr {}` in class, and
`autonumber accDescr {}` in sequence, and so is one after the header, before its
separator, as in `flowchart LR accDescr {}` and `classDiagram accDescr {}`
followed by a line break (see the sections on empty description blocks before a
separator of
[flowchart](../diagrams/flowchart.md#empty-description-blocks-before-a-separator),
[class](../diagrams/class.md#empty-description-blocks-before-a-separator),
[sequence](../diagrams/sequence.md#empty-description-blocks-before-a-separator),
and [state](../diagrams/state.md#empty-description-blocks-before-a-separator));
[fixture: flowchart/gram-empty-description-block-after-vertex] [fixture:
class/gram-empty-description-block-after-note] [fixture:
sequence/gram-empty-description-block-after-autonumber] [fixture:
flowchart/header-empty-description-block-after-direction] [fixture:
class/header-empty-description-block] in class, an empty string as a cardinality
of a relation or as a tooltip is a StringLiteral with the empty value, which the
Db reads as none (example 8), and an empty generic type at the end of a class
name is its two `~` without a generic. [fixture: class/gram-link-tooltip-empty]
[fixture: class/gram-generic-empty-at-end] In state, nothing separates two
statements, so a statement starts right after each statement:
`A --> B accDescr {}` is a transition and a description block statement, while
in `A --> accDescr {} B` the block lies inside the transition, and the input is
rejected. A block, or a run of blocks with only whitespace between them, after
which a unit continues the statement before it, a `-->`, a `:::`, or a
description after a state reference, lies inside that statement too:
`A accDescr {} --> B` and `A --> B accDescr {} : x` are rejected. [fixture:
state/gram-empty-description-block-after-transition] [fixture:
state/div-empty-description-block-after-arrow] [fixture:
state/div-empty-description-block-in-transition] [fixture:
state/div-empty-description-block-before-label]

An empty description block that lies neither where a statement starts nor before
the separator of a statement or of the header lies inside a statement. The tree
holds the empty strings of the state context and the empty description blocks
before a separator, and inside a composite or alias statement of state, the
blocks before the `{` of a body on the line after the name, in the
`textBeforeBody` that holds the other text that mermaid.js does not read there.
It holds no other empty description block inside a statement, for one of two
reasons:

- (a) Between two units of a statement, holding the block would take a field for
  text that mermaid.js does not read in that gap of the statement's node. Such a
  block can lie in almost every gap of every statement, so every gap of every
  statement node would need such a field.
- (b) Inside a value, such as an arrow, a style, or a name of name parts, no
  field can hold it, since the value lies on both sides of it.

An empty string of the state context, by contrast, lies only where a unit of the
state context starts, which is at a few fixed places of the composite and alias
statements, each with its field, as does a block before the `{` of a body, and a
block before a separator lies after the last unit of a statement, where a
statement can follow. [fixture:
state/gram-empty-description-block-before-alias-body-next-line] The places below
are examples, at least one for each statement node in which mermaid.js accepts
such a block, with the reason that applies; they do not exhaust the places,
which the rule above decides, and the counts below check the rule with generated
inputs. In flowchart:

- Between two units of a FlowchartVertexStatement, with its FlowchartVertexGroup
  and FlowchartLink: `A accDescr {}-->B`, `A-->accDescr {}B`,
  `A accDescr {}& B`, `A & accDescr {}B`, `A e1@accDescr {} --> B`,
  `A --> accDescr {}|t| B`, and `A -->|t| accDescr {}B`. Holding it would take a
  field in that gap (reason a). [fixture:
  flowchart/gram-empty-description-block-before-link] [fixture:
  flowchart/div-empty-description-block-after-arrow-glued] [fixture:
  flowchart/div-empty-description-block-before-ampersand] [fixture:
  flowchart/div-empty-description-block-after-ampersand] [fixture:
  flowchart/div-empty-description-block-after-edge-id] [fixture:
  flowchart/div-empty-description-block-before-link-label] [fixture:
  flowchart/div-empty-description-block-after-link-label]
- Between two units of a FlowchartStyleStatement, a FlowchartClassDefStatement,
  a FlowchartClassStatement, or a FlowchartLinkStyleStatement:
  `style A accDescr {} fill:red`, `style A fill:red accDescr {},stroke:blue`,
  `classDef accDescr {}c fill:red`, `class accDescr {}A c`, and
  `linkStyle accDescr {}0 stroke:red`. Holding it would take a field in that gap
  (reason a). [fixture:
  flowchart/db-style-first-style-after-empty-description-block] [fixture:
  flowchart/div-empty-description-block-before-style-comma] [fixture:
  flowchart/div-empty-description-block-before-classdef-names] [fixture:
  flowchart/div-empty-description-block-before-class-ids] [fixture:
  flowchart/div-empty-description-block-before-linkstyle-numbers]
- Inside a style, a FlowchartLiteral: `style A fill:accDescr {}red`, and
  `style A fill:red accDescr {} %% c`. A `%%` after other text on its line is no
  comment in flowchart but text (see
  [Comment lines](../common.md#comment-lines)), so the style is `fill:red`, two
  spaces, and `%% c`, with the block inside it. No field can hold it there,
  inside a value (reason b). [fixture:
  flowchart/div-empty-description-block-in-style] [fixture:
  flowchart/div-empty-description-block-in-style-before-percent]
- Between two units of a FlowchartClickUrlStatement or a
  FlowchartClickCallbackStatement: `click A accDescr {}href "u"`,
  `click A "u"accDescr {} "t"`, `click A href "u"accDescr {} _blank`, and
  `click A call cb()accDescr {} "t"`. Holding it would take a field in that gap
  (reason a). [fixture: flowchart/div-empty-description-block-before-href]
  [fixture: flowchart/div-empty-description-block-before-click-tooltip]
  [fixture: flowchart/div-empty-description-block-before-link-target] [fixture:
  flowchart/div-empty-description-block-before-callback-tooltip]
- Between two units of a FlowchartSubgraphStatement:
  `subgraph accDescr {} fe [Front end]`, `subgraph accDescr {}"x"y`, and
  `subgraph fe accDescr {} [Front end]`. Holding it would take a field in that
  gap (reason a). [fixture:
  flowchart/div-empty-description-block-before-subgraph-name] [fixture:
  flowchart/gram-subgraph-name-empty-description-block-then-string] [fixture:
  flowchart/div-empty-description-block-before-subgraph-title]
- Inside the name of a subgraph, a FlowchartLabel: `subgraph a accDescr {} b`,
  and `subgraph S accDescr {} %% c`, whose `%% c` is text of the name, as above,
  so that its title is `S`, two spaces, and `%% c`. No field can hold it there,
  inside a value (reason b). [fixture:
  flowchart/gram-empty-description-block-in-subgraph-name] [fixture:
  flowchart/div-empty-description-block-in-subgraph-name-before-percent]

In class:

- Between two units of a ClassRelationStatement, with its ClassName:
  `A accDescr {} --> B` and `A accDescr {}~T~ <|-- B`. Holding it would take a
  field in that gap (reason a). [fixture:
  class/div-empty-description-block-in-statement] [fixture:
  class/div-empty-description-block-before-generic]
- Inside a ClassArrow, or inside a name of name parts, an Identifier:
  `A --accDescr {}> B`, `A accDescr {} - B --> C`, whose name is `A-B`, and
  `direction accDescr {} LR` (see above). No field can hold it there, inside a
  value (reason b). [fixture: class/div-empty-description-block-in-arrow]
  [fixture: class/div-empty-description-block-in-dashed-name] [fixture:
  class/div-empty-description-block-between-direction-and-value]
- Between two units of a ClassNoteStatement, a ClassMemberStatement, a
  ClassLinkStatement, a ClassCallbackStatement, a ClassCssClassStatement, a
  ClassClassDefStatement, a ClassStyleStatement, or a ClassAnnotationStatement:
  `note for accDescr {}A "x"`, `A accDescr {}: x`,
  `click accDescr {}A href "u"`, `click A accDescr {} href "u" "t"`,
  `click A href "u" "t" accDescr {} _self`, `callback A accDescr {} "f"`,
  `click A call f() accDescr {} "t"`, `cssClass accDescr {}"A" c`,
  `cssClass "A" accDescr {} c`, `classDef c accDescr {} fill:red`,
  `style C accDescr {} fill:red`, and `<<interface>> accDescr {} Class01`.
  Holding it would take a field in that gap (reason a). [fixture:
  class/div-empty-description-block-before-note-class] [fixture:
  class/div-empty-description-block-before-member-colon] [fixture:
  class/div-empty-description-block-before-click-class] [fixture:
  class/div-empty-description-block-before-href] [fixture:
  class/div-empty-description-block-before-link-target] [fixture:
  class/div-empty-description-block-in-callback] [fixture:
  class/div-empty-description-block-before-click-call-tooltip] [fixture:
  class/div-empty-description-block-before-css-class-ids] [fixture:
  class/div-empty-description-block-before-css-class-name] [fixture:
  class/div-empty-description-block-in-class-def] [fixture:
  class/div-empty-description-block-in-style] [fixture:
  class/div-empty-description-block-after-annotation]
- Inside the name of a ClassAnnotation: `<<accDescr {}interface>> A`. No field
  can hold it there, inside a value (reason b). [fixture:
  class/div-empty-description-block-in-annotation]

In sequence:

- Between two units of a SequenceMessageStatement: `A->>accDescr {}B: x`,
  `A() accDescr {}->>()B: x`, `A->> accDescr {}+B: x`, and
  `A->>+ accDescr {}B: x`. Holding it would take a field in that gap (reason a).
  [fixture: sequence/gram-empty-description-block-after-arrow] [fixture:
  sequence/div-empty-description-block-after-central-connection] [fixture:
  sequence/div-empty-description-block-before-activation] [fixture:
  sequence/div-empty-description-block-after-activation]
- Between two units of a SequenceNoteStatement: `note accDescr {} left of A: x`,
  `note left of accDescr {} A: x`, and `note over A,accDescr {}B: x`. Holding it
  would take a field in that gap (reason a). [fixture:
  sequence/div-empty-description-block-before-note-placement] [fixture:
  sequence/gram-empty-description-block-after-placement] [fixture:
  sequence/div-empty-description-block-between-note-ids]
- Between two units of a SequenceLinkStatement, a SequenceLinksStatement, a
  SequencePropertiesStatement, or a SequenceDetailsStatement:
  `link accDescr {}A: x@https://u`, `links accDescr {} A: {"a": "https://u"}`,
  `properties accDescr {} A: {}`, and `details accDescr {} A: x`. Holding it
  would take a field in that gap (reason a). [fixture:
  sequence/div-empty-description-block-before-link-id] [fixture:
  sequence/div-empty-description-block-before-links-id] [fixture:
  sequence/div-empty-description-block-before-properties-id] [fixture:
  sequence/div-empty-description-block-before-details-id]
- Between two units of a SequenceAutonumberStatement:
  `autonumber accDescr {}1 2` and `autonumber accDescr {} off`. Holding it would
  take a field in that gap (reason a). [fixture:
  sequence/div-empty-description-block-before-autonumber-numbers] [fixture:
  sequence/div-empty-description-block-before-autonumber-off]
- Between `create` and the keyword of a SequenceParticipantStatement or a
  SequenceDestroyStatement: `create accDescr {}participant A` and
  `create accDescr {} destroy A`. Holding it would take a field in that gap
  (reason a). [fixture: sequence/div-empty-description-block-after-create]
  [fixture: sequence/div-empty-description-block-before-destroy]

In state, all between two units of a statement:

- `A accDescr {} --> B` and `[*] accDescr {} --> A`: a field between the source
  and the arrow of a StateTransitionStatement. [fixture:
  state/div-empty-description-block-in-transition] [fixture:
  state/div-empty-description-block-terminal-before-arrow]
- `A --> accDescr {} B` and `A --> accDescr {} [*]`: a field between the arrow
  and the target of a StateTransitionStatement. [fixture:
  state/div-empty-description-block-after-arrow] [fixture:
  state/div-empty-description-block-before-terminal-target]
- `A --> B accDescr {} : x`: a field before the label of a
  StateTransitionStatement. [fixture:
  state/div-empty-description-block-before-label]
- `A accDescr {} : x`: a field before the description of a
  StateDefinitionStatement. [fixture:
  state/div-empty-description-block-before-description]
- `A accDescr {} :::c --> B` and `A --> B accDescr {} :::c`: a field before the
  `:::` of a StateReference. [fixture:
  state/div-empty-description-block-before-class] [fixture:
  state/div-empty-description-block-before-target-class]
- `A:::accDescr {}c`: a field between the `:::` and the class of a
  StateReference. [fixture:
  state/div-empty-description-block-after-class-separator]
- `click accDescr {} A "u" "t"`: a field before the id of a StateClickStatement.
  [fixture: state/div-empty-description-block-in-click-before-id]
- `click A accDescr {} "u" "t"` and `click A href accDescr {} "u"`: a field
  before the URL of a StateClickStatement. [fixture:
  state/div-empty-description-block-in-click-before-url] [fixture:
  state/div-empty-description-block-in-click-after-href]
- `click A "u" accDescr {} "t"`: a field before the tooltip of a
  StateClickStatement. [fixture:
  state/div-empty-description-block-in-click-before-tooltip]

After the last unit of a statement, before its separator, the block is a
statement, as in `click A "u" "t" accDescr {}` of state. This was checked with
inputs made from the accepted fixtures of flowchart, a third of them, class, and
sequence that have no comment, no directive, and no frontmatter and are not
marked with a divergence, by adding `accDescr {}`, with and without a space
before it, at the end of each line. Of those in which the block lies after a
statement, mermaid.js and this specification read the same 856 in flowchart, 770
accepted and 86 rejected, 638 in class and 97 in sequence, all accepted, with
the Db of the input with the block left out and the whitespace around it kept
where they are accepted: that whitespace keeps its effect, so
`subgraph S accDescr {}` has the id `subGraph0`, as `subgraph S` followed by a
space has, while `subgraph S` has the id `S` (see
[flowchart](../diagrams/flowchart.md#building-the-summary-from-the-tree)). The
86 of flowchart are rejected because of the whitespace before the block (see
[flowchart](../diagrams/flowchart.md#empty-description-blocks-before-a-separator)),
and 59 of the 97 of sequence are accepted although the same line without the
block, with a space at its end, is rejected (see
[sequence](../diagrams/sequence.md#empty-description-blocks-before-a-separator)).
In class, `direction accDescr {}`, a line break, and `LR` is one of them: the
block keeps the two from forming a direction line, in mermaid.js too, so they
are two member statements without a label, and the direction stays `TB`.
[fixture: state/gram-click-empty-description-block-after] [fixture:
flowchart/gram-empty-description-block-after-data-block-space] [fixture:
sequence/gram-empty-description-block-after-autonumber-spaces] [fixture:
class/gram-empty-description-block-after-direction-word]

After the header, before its separator, the block is a statement too. This was
checked with inputs made from the same kind of fixtures of each diagram type,
each header line of its own and about a hundred more, by adding to the end of
the header line one of eight forms: a block with and without a space before it,
after two spaces, followed by one or two spaces, two blocks with and without a
space between them, and a block followed by `;`. mermaid.js and this
specification read all of them the same. In flowchart and class, those accepted
have the Db of the input without the blocks: in flowchart, after a direction,
392 are accepted, while the 65 with the `;` and the 63 in which the block
follows a direction word directly are rejected, and after a header keyword
without a direction, all 16 are rejected; in class, 670 are accepted, while the
111 with the `;` and the 109 in which the block follows the keyword directly are
rejected; in sequence and in state, where a statement starts after the header,
every input with a space before the block is accepted, with the same Db in both.
Before a `;` of a flowchart header, the blocks were checked with 1,440 more
inputs: the two header keywords, the directions `LR`, `>`, `^`, `<`, and `v`,
none, one, or two spaces or a tab before the blocks, one block or two with and
without a space between them, none, a space, or a tab after them, and a `;`, a
line feed, or the end of the text after that. mermaid.js accepts exactly those
that the rule above accepts, with the Db of the input without the blocks.
[fixture: flowchart/header-empty-description-block-after-direction] [fixture:
flowchart/header-empty-description-block-before-semicolon] [fixture:
flowchart/header-empty-description-block-no-direction] [fixture:
class/header-empty-description-block] [fixture:
sequence/header-empty-description-block] [fixture:
state/header-empty-description-block]

Text that only looks like one of these forms is none of them, and both read it
the same: in `A""-->B` the quotes are characters of the vertex `A""`,
`accTitle: ""` has the title `""`, `A[" "]` has a string of one space, and
`A["call ()"]` has the label `call ()`. [fixture:
flowchart/lex-empty-quotes-in-id] [fixture: flowchart/lex-acc-title-quotes]
[fixture: flowchart/gram-label-space-string] [fixture:
flowchart/gram-label-string-call-text]

The difference goes one way only: mermaid.js accepts and this specification
rejects. The documents of the diagram types give examples of them in their Known
divergences sections: [flowchart](../diagrams/flowchart.md#known-divergences),
[sequence](../diagrams/sequence.md#known-divergences),
[class](../diagrams/class.md#known-divergences), and
[state](../diagrams/state.md#known-divergences).

## Why mermaid.js reads it so

The lexer of mermaid.js reads no token for any of these forms. In flowchart, it
passes over the quotes of an empty string
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L82-L87)),
over the `call` and the parentheses of an empty call
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L74-L79)),
and over the `accDescr {` and the `}` of an empty description block
([`flow.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/parser/flow.jison#L35-L37)).
Sequence and state pass over an empty description block in the same way
([`sequenceDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/sequence/parser/sequenceDiagram.jison#L76-L77),
[`stateDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/state/parser/stateDiagram.jison#L93-L95)),
and class over all five forms
([`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L34-L35),
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L53-L62),
and
[`classDiagram.jison`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/class/parser/classDiagram.jison#L106-L112)).
Each of these rules enters or leaves a state of the lexer and returns nothing,
so the grammar never sees the form.

## The rule of this specification, and why

In this specification, each of these forms is read as units, the same units as
when the form is not empty: an empty string is its two quotes, an empty call its
`call` and its parentheses, an empty description block its `accDescr`, `{`, and
`}`. Where no rule of the grammar takes those units, the input is rejected (see
[Strings](../diagrams/flowchart.md#strings),
[Click and callbacks](../diagrams/flowchart.md#click-and-callbacks), and
[Accessibility values](../diagrams/flowchart.md#accessibility-values)).

Such a form can lie between any two units: inside the value of a leaf node, such
as an id, a label, or a style, as well as between the fields of a node. The tree
has no place there for a node of its own, and leaving the form out of the tree
would lose text that the author wrote. This is the first of the reasons for a
known divergence (see [known-divergences.md](../known-divergences.md)). That
mermaid.js reads no token for a text is not by itself a reason to reject it:
where the tree has a place, the form is a node, and the input is accepted, as
with the text that mermaid.js discards around a direction statement, which is a
[FlowchartIgnoredText](../ast/flowchart.md#flowchartignoredtext). [fixture:
flowchart/lex-direction-line-swallows-edge] [fixture:
flowchart/lex-direction-line-text-after-value]

## What it means for an author

Where an author writes one of these forms to mean something empty, mermaid.js
rejects it too: `A[""]`, `A("")`, `A-->|""|B`, `A -- "" --> B`,
`click A href ""`, `subgraph ""`, and `click A call ()` are rejected by both.
[fixture: flowchart/gram-label-empty-string] [fixture:
flowchart/gram-shape-round-empty-string] [fixture:
flowchart/gram-link-text-empty-string] [fixture:
flowchart/gram-link-text-dash-empty-string] [fixture:
flowchart/gram-click-href-empty-string] [fixture:
flowchart/gram-subgraph-name-empty-string-only] [fixture:
flowchart/gram-click-empty-call-only] mermaid.js accepts them only where they
leave nothing, next to other text, where they change nothing that is drawn. This
toolkit rejects such a text and reports the form; removing it gives a text that
both read the same way, in most cases (see below). None of the inputs collected
from the tests, the documentation, and the demos of mermaid.js contains one of
them.

## Counts and how they are checked

The differential test of the parser compares such an input with its **reference
input**: the input without its comment regions and without its empty forms, each
empty string, each empty call from its `call` to its `)`, and each empty
description block that is not a description block statement, because it lies
inside a statement, neither where a statement starts nor before the separator of
a statement or of the header, and is not held by the `textBeforeBody` of a state
statement, from its `accDescr` to its `}`. Whether a block is a statement is
decided without the empty strings and empty calls before it, and blocks written
one after another, with only whitespace between them, are decided together, by
what follows the last of them: in `""accDescr {}` followed by a line break and
`A`, the block starts a statement once the empty string is removed, so it stays
in the reference input. [fixture:
flowchart/lex-empty-string-before-empty-description-block] For one or more
blocks between `direction` and its value on one line in class, the reference
input also leaves out the whitespace around the blocks, so that `direction` and
the value form one word, as mermaid.js joins the two name parts:
`direction accDescr {} LR` has the reference input `directionLR`, and so has
`direction accDescr {}accDescr {}LR`. [fixture:
class/div-empty-description-block-between-direction-and-value] [fixture:
class/div-empty-description-blocks-between-direction-and-value]

Where the lexer of this specification reads the reference input as the units of
the input other than those of the empty forms, and mermaid.js accepts the input,
the parser is to give the reference input the Db that mermaid.js gives the
input: `A[""x]` becomes `A[x]`, and `click A call ()cb` becomes `click A cb`.
[fixture: flowchart/tokens-empty-string-in-label] [fixture:
flowchart/gram-click-empty-call-before-callback] Otherwise the removal joins
what lies on both sides of a form into other units, and mermaid.js may read the
reference input otherwise. In `style A "" fill:red`, the spaces before and after
the empty string become one `space` unit, so the style of the reference input is
`fill:red` instead of a space and `fill:red`. In `A:""::c`, `:` and `::` become
`:::`, so the reference input has the vertex `A` with the class `c` instead of
the vertex `A:::c`. `flowchart""TD` becomes `flowchartTD`, which mermaid.js
rejects. [fixture: flowchart/gram-style-empty-string-before-first-style]
[fixture: flowchart/lex-empty-string-splits-triple-colon] [fixture:
flowchart/header-empty-string-no-space]

Inputs were made from the accepted fixtures of each diagram type that have no
comment, no directive, and no frontmatter and are not marked with a divergence,
by inserting each empty form of the diagram type after each space and at the end
of each line after the header. From each diagram type, about 2,000 of them were
taken at even intervals. Each was run through mermaid.js and through the parser
of this specification, and their acceptance and Db were compared:

| Diagram type | Inputs taken, of those made | Rejected by mermaid.js, accepted by this specification | Accepted by both, a different Db | Accepted by mermaid.js, rejected by this specification |
| ------------ | --------------------------: | -----------------------------------------------------: | -------------------------------: | -----------------------------------------------------: |
| flowchart    |             2,120 of 33,909 |                                                     88 |                                0 |                                                  1,073 |
| sequence     |              2,655 of 7,965 |                                                      0 |                                0 |                                                    105 |
| class        |            2,031 of 115,762 |                                                      0 |                                0 |                                                    678 |

The 88 inputs of flowchart have a data block, which mermaid.js rejects for its
content; they are inputs of [`embedded-data-opaque`](./embedded-data-opaque.md).
The others are read the same by both, among them the 62 of flowchart, 16 of
sequence, and 5 of class whose form is an empty description block before a
separator, which is a statement (see above). For each of the 1,856 inputs that
mermaid.js accepts and this specification rejects, the differential test of the
parser checked that its reference input explains the difference, as described
above, and found none that it does not explain.

The places where a block is held were also checked by where a block can lie and
what comes around it, in every diagram type. The inputs were made from the
accepted fixtures without a divergence, comments, and frontmatter: every
boundary between two tokens, right after a token, right before the next, and at
each line start between them, grouped by the kinds of the two tokens and the
whitespace between them, two of each group, with a block written there in nine
or ten ways (alone, after or before a space or a tab, two blocks with and
without a space between, followed by a comment `%% c`, `# c` in sequence and
state, or a directive). Of the 39,019 inputs, 15,936 are rejected by both and
17,792 accepted by both with the same Db; 5,252 differ as the known divergences
declare them; and the 39 others are the forms that this document and the
documents of the diagram types describe, whose Db is that of the input without
the blocks. Another 4,480 inputs combine, in state, each name or alias line with
what may come before the `{` of a body on the next line: empty description
blocks, empty strings, `%%`, comment lines, and empty lines; their acceptance
and Db agree with mermaid.js. 35,344 more inputs, with the block written in
other ways (`accDescr{}`, its braces on two lines, tabs, CRLF, three blocks,
`;`, `;;`, empty strings, and directives next to it), found no other difference.
Among the declared differences are the inputs where the block keeps a lexer rule
of mermaid.js that spans whitespace from matching, as on the direction line of
class above: in class and state, mermaid.js reads `accTitle accDescr {}: t` as
the name `accTitle` with a member or a description, while its reference input
`accTitle : t` is a title: it is one of the inputs whose reference input
mermaid.js reads otherwise, described above, and no input of this specification
is read as mermaid.js reads it. [fixture:
class/div-empty-description-block-between-acc-title-and-colon] [fixture:
state/div-empty-description-block-between-acc-title-and-colon]
