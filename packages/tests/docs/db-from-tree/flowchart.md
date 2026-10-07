# Building the flowchart Db from the tree

Japanese version: [flowchart.ja.md](./flowchart.ja.md)

The steps that build the Db summary of a flowchart diagram from its tree, which
`src/db-from-tree/flowchart.ts` implements (see
[db-from-tree.md](../db-from-tree.md)). The syntax and the tree are defined by
the specification in
[diagrams/flowchart.md](../../../spec/docs/diagrams/flowchart.md) and
[ast/flowchart.md](../../../spec/docs/ast/flowchart.md).

The diagram title from the frontmatter and the Db values that depend on the
configuration do not come from the tree: whoever checks Db values derives them
with mermaid.js's own functions (see
[Configuration (reference)](../configuration.md#configuration-reference)).

## Building the summary from the tree

The summary is built by going through the statements of the diagram in source
order, the statements inside a subgraph before the subgraph itself, and applying
the steps below; this is the order in which the grammar of mermaid.js calls its
Db. So `class S c` in the body of `subgraph S` finds neither a subgraph nor a
vertex `S`, and the label of `S@{ label: x }` there is set on a vertex `S`.
[fixture: flowchart/db-subgraph-body-class-own-id] [fixture:
flowchart/db-subgraph-body-data-block-own-id] Each step reads a value in
[converted form](../../../spec/docs/common.md#reading-a-source), with whitespace
after `}` read as in
[Whitespace after `}`](../../../spec/docs/diagrams/flowchart.md#whitespace-after-);
a data block's value is not read. [fixture:
flowchart/db-converted-line-terminators-in-labels] [fixture:
flowchart/db-converted-line-terminators-in-click-strings] [fixture:
flowchart/db-converted-entity-in-click-strings] [fixture:
flowchart/db-converted-attribute-quote-in-tooltip] [fixture:
flowchart/db-converted-ignored-semicolon-in-tooltip] [fixture:
flowchart/db-converted-brace-whitespace-in-click-strings] Labels contribute
their converted value trimmed of whitespace at both ends, which a value has only
inside the delimiters of the string it starts with or when the label is all
whitespace, and then without the double quote at each end when the trimmed text
is at least two characters and has one at both ends (`A[/ "x"/]` has the text
`x`, as `A["x"]` does, while `A[/ "x /]` has `"x` and `A[/ " /]` has `"`), and
their kind as the label type: `A["x "]` after `A["x"]` leaves the text `x`.
[fixture: flowchart/db-vertex-label-string-trailing-space-redefined] [fixture:
flowchart/db-label-slanted-quote-only] [fixture:
flowchart/db-label-slanted-quote-at-end-only] [fixture:
flowchart/db-label-slanted-quotes-inner-spaces] [fixture:
flowchart/db-label-slanted-two-quotes] [fixture:
flowchart/db-label-markdown-string-trimmed] [fixture:
flowchart/db-label-line-separator-trimmed] The text of a link is made in the
same way. The other values are those of the
[shared leaf nodes](../../../spec/docs/ast.md#shared-leaf-nodes): the `name` of
an Identifier and the `value` of a StringLiteral, a NumericLiteral, or a
FlowchartLiteral. A null element of a list of ids, class names, or styles stands
for the empty text (see **Style statements**). [fixture:
flowchart/db-linkstyle-whitespace-only-style] [fixture:
flowchart/db-classdef-whitespace-only-style] [fixture:
flowchart/db-linkstyle-default-whitespace-only-style] [fixture:
flowchart/db-class-ids-empty-subgraph-id] A null `value` of an accessibility
statement is described under **Accessibility statements** below. The `callback`
of a click statement is the `name` of its Identifier or the `value` of its
FlowchartLiteral, and its `arguments` the `value` of a FlowchartLiteral, as
written (see **Click statements**). [fixture:
flowchart/db-converted-line-terminators-in-callback]

**Direction.** The direction of the header: `<` gives `RL`, `^` gives `BT`, `>`
gives `LR`, `v` and `TD` give `TB`, and any other value, `BR` included, stays as
written. A header without a direction gives `TB`. A direction statement outside
a subgraph changes nothing, also when the header has no direction: `flowchart`,
`direction LR`, and `A-->B` has the direction `TB`. [fixture:
flowchart/db-direction-mapping] [fixture: flowchart/db-direction-br] [fixture:
flowchart/header-direction-next-line] [fixture:
flowchart/db-direction-statement-top-level] [fixture:
flowchart/db-direction-statement-top-level-no-header-direction] [fixture:
flowchart/db-direction-bt] [fixture:
flowchart/header-direction-after-comment-line] [fixture:
flowchart/header-direction-after-empty-line] [fixture:
flowchart/header-direction-after-directive-line] [fixture:
flowchart/header-direction-after-line-separator] [fixture:
flowchart/config-inherit-dir-direction-statement-top-level]

**The vertex step,** with an id, and optionally a label, a shape, styles, and a
property:

1. If an edge with that id exists, nothing happens: `style e1 fill:#f00` after
   `A e1@--> B` adds no vertex and gives no style. [fixture:
   flowchart/db-vertex-edge-id] [fixture: flowchart/db-style-edge-id] [fixture:
   flowchart/db-vertex-edge-id-link-ends] [fixture:
   flowchart/db-vertex-edge-id-vertex-exists]
2. If no vertex has that id, a vertex is added at the end, with the id, the
   label type `text`, and no styles and no classes.
3. With a label, the vertex takes its text and label type from the label, also
   when it has a text already: after `A[Start]-->B`, `C-->A[End]` gives A the
   label `End`. [fixture: flowchart/db-vertex-label-redefined] [fixture:
   flowchart/db-vertex-label-type-replaced] Without one, a vertex that has no
   text yet takes the id as its text, and one that has a text, the empty text
   included, keeps it and its label type: after `A[Start]-->B`, both `A-->C` and
   `C-->A[Start]` leave A with the label `Start`. [fixture:
   flowchart/db-vertex-label-kept-without-label] [fixture:
   flowchart/db-vertex-label-redefined-same] [fixture:
   flowchart/db-vertex-label-type-kept-without-label] [fixture:
   flowchart/db-vertex-label-whitespace-only-kept]
4. With a shape, the Db type of the shape (see
   [Shapes](../../../spec/docs/diagrams/flowchart.md#shapes)) becomes the vertex
   type; with styles, they are appended to the vertex's styles. [fixture:
   flowchart/db-vertex-shape-replaced] [fixture:
   flowchart/db-style-appended-twice]
5. A vertex that has no `props` yet gets them: the property, or an empty set of
   properties without one. A vertex that has `props` gets the property added to
   them, or the value of the property with that name replaced. A property named
   `__proto__` is the exception: added later, it replaces the value of the
   vertex's property `__proto__`, which only the step that made the `props` can
   have given it, and otherwise changes nothing. So after `A`,
   `A[|__proto__:x|text]` leaves the `props` of `A` as the first step made them,
   empty, and so it is after a link, a style statement, or a data block; after
   `A[|b:y|t]`, they keep `b` with the value `y` and get no `__proto__`. A
   `class` statement adds no vertex and does not make them, so a later
   `A[|__proto__:x|text]` makes them with `__proto__`. mermaid.js adds a
   property to existing `props` in
   [`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L229-L233)
   by assigning it to a plain object, where `__proto__` does not become a key.
   [fixture: flowchart/db-props-merge] [fixture:
   flowchart/db-props-existing-vertex] [fixture: flowchart/db-props-replaced]
   [fixture: flowchart/db-props-constructor-existing-vertex] [fixture:
   flowchart/db-vertex-props-proto] [fixture: flowchart/db-props-proto-replaced]
   [fixture: flowchart/db-props-proto-then-other] [fixture:
   flowchart/db-props-proto-existing-vertex] [fixture:
   flowchart/db-props-proto-existing-link-vertex] [fixture:
   flowchart/db-props-proto-after-style] [fixture:
   flowchart/db-props-proto-after-data-block] [fixture:
   flowchart/db-props-proto-after-other-property] [fixture:
   flowchart/db-props-proto-after-class]

**The class step,** with ids and a class name: the class name is appended to the
classes of the vertex with each id, of the first edge with that id, and of the
last subgraph added with that id. [fixture:
flowchart/db-class-on-edge-and-subgraph] [fixture:
flowchart/db-class-vertex-id-with-comma] An item that has the class already gets
it again, and a vertex, an edge, and a subgraph with the same id all get it.
[fixture: flowchart/db-class-vertex-and-subgraph-same-id] [fixture:
flowchart/db-class-last-subgraph-with-id] [fixture:
flowchart/db-class-vertex-and-edge-same-id] [fixture:
flowchart/db-class-applied-twice] It adds no vertex, so an id that no vertex has
yet gets no class: `class C foo` after `A --> B` changes nothing, and after
`class A foo` and then `A --> B`, A has no class. [fixture:
flowchart/db-class-unknown-vertex] [fixture: flowchart/db-class-before-vertex]

**Vertex statements.** For each vertex group, from the first to the last: for
each of its vertices, the vertex step with its shape, then the class step with
the parts of the vertex's id between its `,` characters and its class, if it has
one (so `A,B:::c` gives the class to the vertices `A` and `B`, when they exist,
and none to the vertex `A,B`, and `e1:::c` gives it to the edge `e1`), and then
the data blocks of the vertex before it in the group, if that vertex has any.
[fixture: flowchart/db-class-vertex-id-with-comma-existing] [fixture:
flowchart/db-class-vertex-class-on-edge-id] After the last vertex of a group
come the data blocks of that vertex, so in `A@{ label: x } --> A[y]`, the label
of `A` is `y`. [fixture: flowchart/db-data-before-target-group] After each
link's target group come the link's edges, so in `A e1@--> e1`, a vertex `e1` is
added, and the edge from `A` to it takes the id `e1`. [fixture:
flowchart/db-link-edges-after-target-group] So the data blocks of a vertex that
is followed by `&` apply after the next vertex: in `A@{ label: x } & A[y]`, the
label of `A` is `x`. [fixture: flowchart/db-data-after-next-vertex] The members
of a vertex statement are defined under **Subgraph members** in
[Rejections outside the grammar](../../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar).

**Links.** A link makes the edges that **Link style numbers** in
[Rejections outside the grammar](../../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)
counts, from the group before it to its target group: for each vertex of the
first group, in order, one edge to each vertex of the target group, in order.
Each edge has the start and end ids, the type, stroke, and length of the arrows
(see below; a length above 10 counts as 10), the label's text and label type, or
the empty text and `text` without a label, no classes, and the default
interpolate of `linkStyle default`, if one is set at that point. [fixture:
flowchart/db-arrow-length-cap] [fixture: flowchart/db-arrow-length-cap-lines]
[fixture: flowchart/db-default-interpolate-later-edge] Its id is:

- the edge id of the link, for the first edge whose start is the id of the last
  vertex of the first group and whose end is the id of the first vertex of the
  second, unless an earlier edge has that id. The Db id is the edge id when it
  contains no `@`; when it does, its first `@` is removed and an `@` is added at
  its end. Such an edge has `isUserDefinedId` true; [fixture:
  flowchart/db-edge-id-group] [fixture: flowchart/db-edge-id-reused] [fixture:
  flowchart/db-edge-id-at-sign] [fixture:
  flowchart/db-edge-id-generated-id-taken] [fixture:
  flowchart/db-edge-id-group-duplicate-vertex]
- otherwise `L_`, the start id, `_`, the end id, `_`, and a counter: 0 when no
  earlier edge has the same start and end, and one more than the number of such
  edges otherwise, whatever their ids. The third `A-->B` gets `L_A_B_3`, and an
  `A-->B` after `A e1@-->B` gets `L_A_B_2`. [fixture:
  flowchart/db-edge-id-counter] [fixture:
  flowchart/db-edge-id-counter-after-user-id]

An input with more edges than the site configuration's `maxEdges` is rejected
(see
[Rejections outside the grammar](../../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)).
The edges are counted as there: a link counts one edge for each pair of a vertex
of its first group and a vertex of its target group, and the links in the body
of a subgraph count too. An input with exactly `maxEdges` edges is accepted.
[fixture: flowchart/config-max-edges-equal] [fixture:
flowchart/config-max-edges-group-exceeded] [fixture:
flowchart/config-max-edges-group-equal] [fixture:
flowchart/config-max-edges-in-subgraph-exceeded]

**Arrows.** The link's FlowchartArrow gives a type, a stroke, and a length. The
type comes from its end marker: `arrow_point` for `arrow`, `arrow_cross` for
`cross`, `arrow_circle` for `circle`, and `arrow_open` for `none`. Its start
marker **matches** when it is the same marker as its end marker, other than
`none`; then the type is prefixed with `double_`. The stroke is `invisible` for
the line `invisible`, `dotted` for `dotted`, `normal` for `solid`, and, for
`thick`, `thick` when the start marker is `none` or matches and `normal`
otherwise. The length is, for a dotted line, the arrow's `length`; otherwise it
is the arrow's `length` less one, less one more when the end marker is `none`,
and plus one when the start marker is neither `none` nor matching. These are the
values that mermaid.js derives from the arrow without its last character and
without a matching start marker, which keeps a start marker that does not match:
`---` and `-->` have the length 1, `A x-->B` has the type `arrow_point`, the
stroke `normal`, and the length 2, `A x==>B` the stroke `normal`, `<-->` the
type `double_arrow_point`, `A x---B` the type `arrow_open` and the length 2,
`~~~` the stroke `invisible` and the length 1, and `-..->` the stroke `dotted`
and the length 2. [fixture: flowchart/db-arrow-single-forms] [fixture:
flowchart/lex-link-text-head-letter] [fixture:
flowchart/db-arrow-dotted-start-marker-unmatched] [fixture:
flowchart/db-arrow-thick-start-marker-end-none] That a start marker that does
not match is drawn as no marker and makes the edge longer, as in `A o--> B`, is
reported as a defect in
[issue #1665](https://github.com/mermaid-js/mermaid/issues/1665), open and
approved as a bug as of 2026-10-01, whose comments also report that a link with
text between two such arrows, as in `A o-- test1 --> B`, draws no arrowheads,
which is the type `INVALID` below. [fixture: flowchart/db-arrow-mixed-markers]

For a link with an opening arrow, the FlowchartOpeningArrow gives a type from
its start marker (`arrow_point` for `arrow`, `arrow_cross` for `cross`,
`arrow_circle` for `circle`, and `arrow_open` for `none`) and a stroke from its
line (`thick` for `thick`, `dotted` for `dotted`, and `normal` for `solid`).
When this stroke differs from the stroke of the closing arrow above, the type
and the stroke are `INVALID` and there is no length. This happens only when the
closing arrow is thick and its start marker neither is `none` nor matches, since
the two arrows have the same line: in `A== t x==>B`, the closing arrow's start
marker `cross` makes its stroke `normal`. Otherwise, when the opening arrow's
type is `arrow_open`, the edge takes the type of the closing arrow; when it
equals the closing arrow's type, the type is prefixed with `double_`; and
otherwise the type and the stroke are `INVALID` and there is no length. The
stroke is the one they share, and the length is that of the closing arrow:
`A x-- t --xB` has the type `double_arrow_cross`, while `A x-- t -->B` and
`A x-- t x--x B` are `INVALID`, the second because `arrow_cross` is not
`double_arrow_cross`. [fixture: flowchart/db-arrow-double] [fixture:
flowchart/db-arrow-invalid] [fixture: flowchart/db-arrow-thick-head-invalid]
[fixture: flowchart/db-arrow-dash-head-length] [fixture:
flowchart/db-arrow-closing-double-in-link-text] [fixture:
flowchart/db-arrow-opening-cross-closing-cross] [fixture:
flowchart/db-arrow-opening-cross-closing-double-cross] [fixture:
flowchart/db-arrow-dotted-closing-start-marker]

**Subgraphs.** A subgraph statement adds a subgraph after the statements of its
body, so a nested subgraph comes before the one around it. Its members are those
that **Subgraph members** in
[Rejections outside the grammar](../../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)
defines, the value of an accessibility statement as it is (the line feeds of a
description are not collapsed here); an empty statement outside a subgraph
changes nothing. [fixture: flowchart/gram-empty-statement-top-level] Members
that are empty or all whitespace are left out. Of the others, only the first of
equal members is kept, except that every member `__proto__` is kept, because
mermaid.js keeps the members it has seen as the keys of a plain object, where
`__proto__` does not become a key. Then a member that a subgraph added earlier
already has is left out, `__proto__` included. [fixture:
flowchart/db-subgraph-member-empty-statement] [fixture:
flowchart/db-subgraph-member-empty-statement-end] [fixture:
flowchart/db-subgraph-member-acc-title] [fixture:
flowchart/db-subgraph-member-acc-descr-block] [fixture:
flowchart/db-subgraph-member-empty-acc-descr-block] [fixture:
flowchart/db-subgraph-nested-members] [fixture:
flowchart/db-subgraph-member-proto-twice] [fixture:
flowchart/db-subgraph-member-proto-mixed] [fixture:
flowchart/db-subgraph-member-proto-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-has-own-property-earlier-subgraph] [fixture:
flowchart/db-subgraph-member-constructor-to-string] [fixture:
flowchart/db-subgraph-member-empty-id] [fixture:
flowchart/db-subgraph-member-has-own-property-then-empty-id] A subgraph with the
member `hasOwnProperty` followed by another member is rejected (see
[Rejections outside the grammar](../../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)).
The subgraph has:

- `id`: the id that **Subgraph members** in
  [Rejections outside the grammar](../../../spec/docs/diagrams/flowchart.md#rejections-outside-the-grammar)
  defines, from the name text defined there; the generated id is `subGraph`
  followed by the number of subgraphs added before it, so of two nested
  subgraphs with generated ids, the outer one has the larger number. [fixture:
  flowchart/db-subgraph-counter] [fixture: flowchart/db-subgraph-counter-nested]
- `title`: the value of the title in converted form, trimmed, or the name text
  trimmed when there is no title. [fixture: flowchart/db-subgraph-title-trimmed]
- `labelType`: the kind of the title; without a title, `markdown` when the
  name's kind is `markdown`, that is, when it starts with a markdown string, and
  `text` otherwise, also for a name that starts with a string. [fixture:
  flowchart/db-subgraph-quoted-name] [fixture:
  flowchart/db-subgraph-markdown-name] [fixture:
  flowchart/gram-subgraph-name-markdown-then-text] [fixture:
  flowchart/db-subgraph-title-markdown] [fixture:
  flowchart/db-subgraph-title-overrides-markdown-name]
- `dir`: the direction of the last direction statement in its body, not counting
  those in the body of a nested subgraph. Without one, the diagram's direction,
  as **Direction** above gives it and not that of a subgraph around it, when
  `flowchart.inheritDir` in the
  [effective configuration](../configuration.md#the-effective-configuration)
  counts as true in the test of mermaid.js, that is, when it is anything but
  `false`, zero, NaN, the empty string, and null; otherwise none. `true`, `1`,
  `yes`, and the strings `false` and `0` make the subgraph take the diagram's
  direction, while `false`, `0`, and the empty string do not. A list or a
  mapping written in the frontmatter or a directive does not replace the default
  `false` (see
  [The effective configuration](../configuration.md#the-effective-configuration)),
  and a null is removed by the key filter, so `[]`, `{}`, and `null` do not
  either. [fixture: flowchart/config-inherit-dir-site] [fixture:
  flowchart/config-inherit-dir-frontmatter] [fixture:
  flowchart/config-inherit-dir-fm-one] [fixture:
  flowchart/config-inherit-dir-fm-yes] [fixture:
  flowchart/config-inherit-dir-fm-string-false] [fixture:
  flowchart/config-inherit-dir-fm-string-zero] [fixture:
  flowchart/config-inherit-dir-directive-string-false] [fixture:
  flowchart/config-inherit-dir-fm-false] [fixture:
  flowchart/config-inherit-dir-fm-zero] [fixture:
  flowchart/config-inherit-dir-fm-empty-string] [fixture:
  flowchart/config-inherit-dir-fm-list] [fixture:
  flowchart/config-inherit-dir-fm-mapping] [fixture:
  flowchart/config-inherit-dir-fm-null] [fixture:
  flowchart/db-subgraph-dir-nested-only] [fixture:
  flowchart/config-inherit-dir-nested-diagram-direction] [fixture:
  flowchart/config-inherit-dir-symbol-direction] [fixture:
  flowchart/config-inherit-dir-no-header-direction]
- `classes`: none, until the class step adds some.

**Style statements.** Each style gives its value, or the empty text when it is
null. Its range starts right after the `,` before it, or, for the first style,
at the end of the `space` unit that the rule of the statement reads before
`styles`, with the whitespace there, which mermaid.js reads, and it ends at its
last character that is not whitespace, before the empty description blocks and
the separator of the statement (see
[FlowchartStyleStatement](../../../spec/docs/ast/flowchart.md#flowchartstylestatement)):
the last styles of `classDef c fill:red accDescr {}`,
`linkStyle 0 stroke:red accDescr {}`, and
`linkStyle default stroke:red accDescr {}` are `fill:red`, `stroke:red`, and
`stroke:red`, and in `linkStyle 0 interpolate basis accDescr {} ;`, the style
that is all whitespace is null. [fixture:
flowchart/gram-empty-description-block-after-style-before-semicolon] [fixture:
flowchart/gram-empty-description-block-after-classdef] [fixture:
flowchart/gram-empty-description-block-after-classdef-before-semicolon]
[fixture: flowchart/gram-empty-description-block-after-linkstyle] [fixture:
flowchart/gram-empty-description-block-after-linkstyle-before-semicolon]
[fixture:
flowchart/gram-empty-description-block-splits-spaces-after-interpolate]
[fixture: flowchart/gram-empty-description-block-after-linkstyle-default]
`style` applies the vertex step with the id, not split at commas, and its
styles, so it adds a vertex that no statement has made yet: `style C fill:red`
after `A-->B` adds C with the style `fill:red`. [fixture:
flowchart/db-style-unknown-vertex] A `style` statement before the other
statements of a vertex gives it the style, as `style A fill:red` before `A-->B`
does, and the vertex step does not look at subgraphs, so `style S fill:red`
after `subgraph S` adds a vertex `S` beside the subgraph. [fixture:
flowchart/db-style-before-vertex] [fixture: flowchart/db-style-subgraph-id]
`classDef` reads each `\,` in its styles as `,`; for each class name, a class is
added at the end if none has that name, and the styles are appended to it.
`classDef c fill:a\ ,stroke:b` has the two styles `fill:a\` and `stroke:b`, and
`classDef c fill:a\,  stroke:b` the one style `fill:a,`, two spaces, and
`stroke:b` (see
[Style, class, and link style statements](../../../spec/docs/diagrams/flowchart.md#style-class-and-link-style-statements)).
`class` applies the class step with its ids and class name. [fixture:
flowchart/db-class-def-escaped-comma] [fixture:
flowchart/db-classdef-escape-space-before-comma] [fixture:
flowchart/db-classdef-escape-space-after-comma] [fixture:
flowchart/db-classdef-appended-twice]

**Link style statements.** A `linkStyle` statement first sets the interpolate of
each numbered edge, when it has `interpolate`, and then, when it has styles,
gives each numbered edge its styles, which replace the styles it has; when none
of them starts with `fill`, `fill:none` is added once to the styles, which all
the numbered edges share. The check looks at the styles with the whitespace at
their start, so a style written after whitespace does not start with `fill`:
`linkStyle 0 stroke:#f00 , fill:red` gets `fill:none`. [fixture:
flowchart/db-linkstyle-shared-fill] [fixture:
flowchart/db-linkstyle-leading-space-fill] [fixture:
flowchart/db-linkstyle-leading-line-separator] [fixture:
flowchart/db-linkstyle-later-style-starts-with-fill] [fixture:
flowchart/db-linkstyle-styles-replaced] [fixture:
flowchart/db-linkstyle-interpolate-and-styles] [fixture:
flowchart/db-linkstyle-numbered-edges-only] A statement with `interpolate` and
no styles changes no style: an edge keeps the styles an earlier statement gave
it, and no `fill:none` is added. [fixture:
flowchart/db-linkstyle-interpolate-keeps-style] [fixture:
flowchart/db-linkstyle-interpolate-only] `linkStyle default` sets the default
interpolate, which edges added later take, and, when it has styles, the `style`
of `edgeDefaults`, which is its styles and replaces those of an earlier
statement: no `fill:none` is added, and no edge gets them. Without styles, it
leaves that `style` as it is, null when no statement has set it. [fixture:
flowchart/db-default-linkstyle-interpolate-keeps-style] [fixture:
flowchart/db-default-interpolate-later-edge] [fixture:
flowchart/db-linkstyle-default-no-fill] [fixture:
flowchart/db-linkstyle-default-styles-replaced]

**Click statements.** A click with a callback records a click call for each id
(a null id is the empty text), whether or not a vertex has it: `id`, `name` the
callback, and `args` the `value` of the `arguments`, or null when there is none,
as for `f(  )`; the summary has `clickCalls` only when it has a call. [fixture:
flowchart/gram-click-call] [fixture:
flowchart/tokens-callback-name-trailing-space] [fixture:
flowchart/tokens-callback-arguments-spaces-at-ends] [fixture:
flowchart/db-click-callback-whitespace-arguments] It then applies the class step
with the click's ids and the class `clickable`. [fixture:
flowchart/db-click-class-subgraph] A click with a URL gives each vertex whose id
is one of the click's ids the URL, trimmed and not sanitized, as `link` (none
when it is empty) and the target as `linkTarget` (none when the click has none),
and then applies the same class step. A later click replaces both:
`click A href "u" _blank` followed by `click A href "v"` leaves A with the
`link` `v` and no `linkTarget`, and `click A href "u"` followed by
`click A href " "` leaves it with no `link`. [fixture:
flowchart/db-click-url-replaces-target] [fixture:
flowchart/db-click-url-empty-removes-link] [fixture:
flowchart/db-click-line-separator-in-strings] A tooltip is recorded for each id,
whether or not a vertex has it, with the `value` of its StringLiteral as its
text, not trimmed; a later tooltip for the same id replaces the text and keeps
the position. [fixture: flowchart/db-click-on-edge] [fixture:
flowchart/db-tooltip-unknown-id] [fixture: flowchart/db-tooltip-replaced]
[fixture: flowchart/db-tooltip-untrimmed]

**Accessibility statements.** `accTitle:` sets the title to its value.
`accDescr:` and `accDescr {` set the description to their value, with each line
feed, together with the whitespace that follows it, line feeds included,
replaced by one line feed. mermaid.js trims these texts, which changes nothing,
because a value has no whitespace at its ends. A later statement replaces the
value that an earlier one set, whichever of the two forms each has:
`accTitle: first` followed by `accTitle: second` gives the title `second`, and
so for `accDescr:`; `accDescr { y }` alone gives the description `y`,
`accDescr: x` followed by `accDescr { y }` gives `y`, and `accDescr { first }`
followed by `accDescr: second` gives `second`. A statement inside a subgraph
sets the same description as one outside it, so `accDescr: inner` in a subgraph
followed by `accDescr: outer` after its `end` gives `outer`, and so for
`accTitle:`. [fixture: flowchart/db-acc-title-alone] [fixture:
flowchart/db-acc-descr-line-alone] [fixture: flowchart/db-acc-descr-lines]
[fixture: flowchart/db-acc-descr-collapse-whitespace] [fixture:
flowchart/db-acc-repeated] [fixture: flowchart/db-acc-descr-block-alone]
[fixture: flowchart/db-acc-descr-block-replaces] [fixture:
flowchart/db-acc-descr-line-replaces-block] [fixture:
flowchart/db-acc-descr-outer-replaces-subgraph] [fixture:
flowchart/db-acc-title-replaces] [fixture: flowchart/db-acc-descr-replaces]
[fixture: flowchart/db-acc-title-outer-replaces-subgraph] [fixture:
flowchart/db-acc-descr-collapse-crlf] [fixture:
flowchart/db-acc-descr-collapse-line-separator] [fixture:
flowchart/db-acc-descr-line-separator-kept] [fixture:
flowchart/db-acc-title-line-separator] An `accDescr {` block that is not closed
sets the empty description, whatever its text, because mermaid.js reads its text
and then, at the end of the text, an empty text as a second block: `accDescr: d`
followed by `accDescr { x` at the end of the text gives the empty description,
and the title stays as it was. [fixture: flowchart/lex-acc-descr-block-unclosed]
[fixture: flowchart/db-acc-descr-unclosed-replaces] [fixture:
flowchart/db-acc-descr-unclosed-empty-replaces] [fixture:
flowchart/db-acc-descr-unclosed-keeps-title] Such a block takes the rest of the
text, so a line `B --> C` after `accDescr { x`, or after `accDescr {` and a line
`x`, adds no edge. [fixture: flowchart/db-acc-descr-unclosed-takes-lines]
[fixture: flowchart/db-acc-descr-unclosed-text-next-line] Otherwise, a statement
whose value is null sets the empty text, while a closed description block
without text changes nothing: `accDescr: x` followed by `accDescr:` at the end
of the text gives the empty description, and so does `accDescr { x }` followed
by it, while `accDescr: x` followed by `accDescr {  }` keeps `x`, as
`accDescr { x }` followed by `accDescr {}` does. [fixture:
flowchart/db-acc-title-empty-replaces] [fixture:
flowchart/db-acc-descr-empty-replaces] [fixture:
flowchart/db-acc-descr-block-then-empty-line] [fixture:
flowchart/db-acc-descr-empty-block-keeps] [fixture:
flowchart/db-acc-descr-empty-block-after-block]

## Data blocks in the Db

The values that a data block sets come from `dataBlockEffects` of
`@mmd-toolkit/tests`, one entry per vertex with data blocks: the blocks written
one after another count as one entry. The entries are in source order (see
[`dataBlockEffects`](../embedded-data.md#datablockeffects)): the entries of
`A@{ label: a } & B@{ label: b } --> C@{ label: c } & D@{ label: d }` are those
of `A`, `B`, `C`, and `D`, in this order. [fixture:
flowchart/db-data-block-entries-source-order] At the position given above, the
next entry is applied: its fields are set on the subgraph added last with the
vertex's id, if there is one; otherwise on the first edge with that id, if there
is one; otherwise on the vertex with that id, which the vertex step has already
added. [fixture: flowchart/gram-data-consecutive-blocks] [fixture:
flowchart/db-data-block-subgraph-over-edge] [fixture:
flowchart/db-data-block-last-subgraph-with-id] [fixture:
flowchart/db-data-block-edge-over-vertex]
