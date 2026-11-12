# Whether `recommended` enables each rule (records)

The decision of each rule under the criteria of section 7 of
[SKILL.md](../SKILL.md), and what was checked for each criterion. A criterion
named by its number here is one of section 7 of SKILL.md. Section 7 of SKILL.md
says how to search them.

Contents:

- Decisions: a table with a row for each rule, and the reason for a rule that is
  not enabled.
- The notes on what was checked for criteria 1 to 4: first the notes on groups
  of rules that several diagram types share (the title and description rules,
  the empty block rules, the unclosed block rules, the direction line rules);
  then the notes on single rules of flowchart, sequence, class, state, er,
  gantt, journey, requirement, mindmap, timeline, and sankey; then, for each
  later diagram type, a paragraph that names its searches
  (`The XY chart rules.`) and its notes, in this order: XY chart, quadrant,
  block, kanban, C4, venn, agentflow, usecase, pie, gitgraph, packet,
  architecture, radar, treemap, railroad, Cynefin, Wardley, Event Modeling, and
  tree view; last, the note on class-no-inline-comment.

The table below records the decision, with the reason for a rule that is not
enabled, and the rule file sets `recommended` from it. The notes after it give
what was checked for each criterion. The common rules are enabled: each meets
the criteria in every diagram type (run in every diagram type), and their
documents describe every diagram type.

Decisions:

| Rule                                        | Enabled | Reason when not enabled                                                      |
| ------------------------------------------- | ------- | ---------------------------------------------------------------------------- |
| flowchart-no-ignored-text                   | yes     |                                                                              |
| flowchart-no-unclosed-description-block     | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| flowchart-no-empty-description-block        | yes     |                                                                              |
| flowchart-no-duplicate-description          | yes     |                                                                              |
| flowchart-no-duplicate-title                | yes     |                                                                              |
| flowchart-no-redefined-vertex               | yes     |                                                                              |
| flowchart-no-undef                          | yes     |                                                                              |
| flowchart-no-duplicate-direction            | yes     |                                                                              |
| flowchart-no-redefined-subgraph             | yes     |                                                                              |
| flowchart-no-spaced-stroke                  | no      | Criteria 1, 3: [#7974](https://github.com/mermaid-js/mermaid/pull/7974)      |
| no-unclosed-directive                       | yes     |                                                                              |
| no-invalid-init-directive                   | yes     |                                                                              |
| no-duplicate-init-key                       | yes     |                                                                              |
| sequence-no-create-destroy                  | yes     |                                                                              |
| sequence-no-duplicate-description           | yes     |                                                                              |
| sequence-no-duplicate-title                 | yes     |                                                                              |
| sequence-no-empty-description-block         | yes     |                                                                              |
| sequence-no-ignored-text                    | yes     |                                                                              |
| sequence-no-invalid-json                    | yes     |                                                                              |
| sequence-no-link-without-separator          | yes     |                                                                              |
| sequence-no-unclosed-description-block      | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| class-no-bare-class-name                    | yes     |                                                                              |
| class-no-duplicate-description              | yes     |                                                                              |
| class-no-duplicate-title                    | yes     |                                                                              |
| class-no-ignored-text                       | yes     |                                                                              |
| class-no-inline-comment                     | no      | Criteria 1 and 3                                                             |
| class-no-redefined-class                    | yes     |                                                                              |
| class-no-unclosed-backquote                 | yes     |                                                                              |
| class-no-undef                              | yes     |                                                                              |
| state-no-duplicate-description              | yes     |                                                                              |
| state-no-duplicate-title                    | yes     |                                                                              |
| state-no-empty-description-block            | yes     |                                                                              |
| state-no-ignored-text                       | yes     |                                                                              |
| state-no-unclosed-description-block         | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| state-no-undef                              | yes     |                                                                              |
| er-no-duplicate-description                 | yes     |                                                                              |
| er-no-duplicate-title                       | yes     |                                                                              |
| er-no-empty-description-block               | yes     |                                                                              |
| er-no-ignored-text                          | no      | Criterion 3: [#8364](https://github.com/mermaid-js/mermaid/pull/8364) (open) |
| er-no-redefined-entity                      | yes     |                                                                              |
| er-no-unclosed-description-block            | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| er-no-undef                                 | yes     |                                                                              |
| gantt-no-duplicate-description              | yes     |                                                                              |
| gantt-no-duplicate-id                       | yes     |                                                                              |
| gantt-no-duplicate-setting                  | yes     |                                                                              |
| gantt-no-duplicate-title                    | yes     |                                                                              |
| gantt-no-empty-description-block            | yes     |                                                                              |
| gantt-no-undef                              | yes     |                                                                              |
| gantt-no-unknown-exclude                    | yes     |                                                                              |
| gantt-no-invalid-tag                        | yes     |                                                                              |
| journey-no-duplicate-description            | yes     |                                                                              |
| journey-no-duplicate-title                  | yes     |                                                                              |
| journey-no-empty-description-block          | yes     |                                                                              |
| journey-no-empty-person                     | yes     |                                                                              |
| journey-no-ignored-text                     | yes     |                                                                              |
| journey-no-invalid-score                    | yes     |                                                                              |
| requirement-no-duplicate-description        | yes     |                                                                              |
| requirement-no-duplicate-field              | yes     |                                                                              |
| requirement-no-duplicate-name               | yes     |                                                                              |
| requirement-no-duplicate-title              | yes     |                                                                              |
| requirement-no-empty-description-block      | yes     |                                                                              |
| requirement-no-ignored-text                 | yes     |                                                                              |
| requirement-no-unclosed-description-block   | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| requirement-no-undef                        | yes     |                                                                              |
| mindmap-no-duplicate-decoration             | yes     |                                                                              |
| mindmap-no-mismatched-shape                 | yes     |                                                                              |
| timeline-no-duplicate-title                 | yes     |                                                                              |
| timeline-no-duplicate-description           | yes     |                                                                              |
| timeline-no-empty-description-block         | yes     |                                                                              |
| sankey-no-invalid-value                     | yes     |                                                                              |
| sankey-no-empty-node                        | yes     |                                                                              |
| xychart-no-duplicate-title                  | yes     |                                                                              |
| xychart-no-duplicate-description            | yes     |                                                                              |
| xychart-no-empty-description-block          | yes     |                                                                              |
| xychart-no-unclosed-description-block       | yes     |                                                                              |
| xychart-no-invalid-orientation              | yes     |                                                                              |
| xychart-no-redefined-axis                   | yes     |                                                                              |
| xychart-no-extra-value                      | yes     |                                                                              |
| quadrant-no-duplicate-title                 | yes     |                                                                              |
| quadrant-no-duplicate-description           | yes     |                                                                              |
| quadrant-no-empty-description-block         | yes     |                                                                              |
| quadrant-no-redefined-axis                  | yes     |                                                                              |
| quadrant-no-redefined-quadrant              | yes     |                                                                              |
| quadrant-no-redefined-class                 | yes     |                                                                              |
| quadrant-no-undef                           | yes     |                                                                              |
| quadrant-no-duplicate-style                 | yes     |                                                                              |
| quadrant-no-invalid-coordinate              | yes     |                                                                              |
| quadrant-no-invalid-color                   | yes     |                                                                              |
| block-no-edge-chain                         | yes     |                                                                              |
| block-no-edge-in-composite-head             | yes     |                                                                              |
| block-no-duplicate-block                    | yes     |                                                                              |
| block-no-spaced-class-id                    | yes     |                                                                              |
| block-no-undef                              | yes     |                                                                              |
| block-no-duplicate-columns                  | yes     |                                                                              |
| block-no-redefined-style                    | yes     |                                                                              |
| block-no-mismatched-shape                   | yes     |                                                                              |
| block-no-mismatched-edge                    | yes     |                                                                              |
| block-no-useless-width                      | yes     |                                                                              |
| block-no-invalid-direction                  | yes     |                                                                              |
| kanban-no-invalid-metadata-key              | held    |                                                                              |
| kanban-no-invalid-priority                  | held    |                                                                              |
| kanban-no-duplicate-section                 | yes     |                                                                              |
| c4-no-undef                                 | yes     |                                                                              |
| c4-no-invalid-attribute-key                 | yes     |                                                                              |
| c4-no-useless-argument                      | yes     |                                                                              |
| c4-no-duplicate-title                       | yes     |                                                                              |
| c4-no-duplicate-description                 | yes     |                                                                              |
| c4-no-redefined-element                     | yes     |                                                                              |
| c4-no-duplicate-style                       | yes     |                                                                              |
| venn-no-duplicate-title                     | yes     |                                                                              |
| venn-no-duplicate-subset                    | yes     |                                                                              |
| venn-no-duplicate-style                     | yes     |                                                                              |
| venn-no-invalid-style-key                   | yes     |                                                                              |
| venn-no-undef                               | yes     |                                                                              |
| venn-no-ignored-text                        | yes     |                                                                              |
| agentflow-no-duplicate-title                | yes     |                                                                              |
| agentflow-no-duplicate-description          | yes     |                                                                              |
| agentflow-no-empty-description-block        | yes     |                                                                              |
| agentflow-no-unclosed-description-block     | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| agentflow-no-ignored-text                   | yes     |                                                                              |
| agentflow-no-redefined-vertex               | yes     |                                                                              |
| agentflow-no-redefined-connector            | yes     |                                                                              |
| agentflow-no-redefined-flow                 | yes     |                                                                              |
| agentflow-no-duplicate-direction            | yes     |                                                                              |
| agentflow-no-undef                          | yes     |                                                                              |
| agentflow-no-spaced-stroke                  | no      | Criteria 1, 3: [#7974](https://github.com/mermaid-js/mermaid/pull/7974)      |
| usecase-no-duplicate-title                  | yes     |                                                                              |
| usecase-no-duplicate-description            | yes     |                                                                              |
| usecase-no-empty-description-block          | yes     |                                                                              |
| usecase-no-unclosed-description-block       | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| usecase-no-duplicate-direction              | yes     |                                                                              |
| usecase-no-duplicate-metadata               | yes     |                                                                              |
| usecase-no-redefined-class                  | yes     |                                                                              |
| pie-no-duplicate-label                      | yes     |                                                                              |
| pie-no-duplicate-title                      | yes     |                                                                              |
| pie-no-duplicate-description                | yes     |                                                                              |
| pie-no-empty-description-block              | yes     |                                                                              |
| gitgraph-no-duplicate-option                | yes     |                                                                              |
| gitgraph-no-redefined-commit                | yes     |                                                                              |
| gitgraph-no-duplicate-title                 | yes     |                                                                              |
| gitgraph-no-duplicate-description           | yes     |                                                                              |
| gitgraph-no-empty-description-block         | yes     |                                                                              |
| packet-no-duplicate-title                   | yes     |                                                                              |
| packet-no-duplicate-description             | yes     |                                                                              |
| packet-no-empty-description-block           | yes     |                                                                              |
| architecture-no-duplicate-title             | yes     |                                                                              |
| architecture-no-duplicate-description       | yes     |                                                                              |
| architecture-no-empty-description-block     | yes     |                                                                              |
| architecture-no-reversed-marker             | yes     |                                                                              |
| architecture-no-ungrouped-modifier          | yes     |                                                                              |
| radar-no-undef                              | yes     |                                                                              |
| radar-no-duplicate-entry                    | yes     |                                                                              |
| radar-no-mismatched-entry-count             | yes     |                                                                              |
| radar-no-duplicate-option                   | yes     |                                                                              |
| radar-no-reversed-range                     | yes     |                                                                              |
| radar-no-duplicate-title                    | yes     |                                                                              |
| radar-no-duplicate-description              | yes     |                                                                              |
| radar-no-empty-description-block            | yes     |                                                                              |
| radar-no-unclosed-description-block         | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| treemap-no-invalid-value                    | yes     |                                                                              |
| treemap-no-duplicate-title                  | yes     |                                                                              |
| treemap-no-duplicate-description            | yes     |                                                                              |
| treemap-no-empty-description-block          | yes     |                                                                              |
| railroad-no-duplicate-title                 | yes     |                                                                              |
| railroad-no-duplicate-description           | yes     |                                                                              |
| railroad-no-empty-description-block         | yes     |                                                                              |
| cynefin-no-redefined-domain                 | yes     |                                                                              |
| cynefin-no-duplicate-title                  | yes     |                                                                              |
| cynefin-no-duplicate-description            | yes     |                                                                              |
| cynefin-no-empty-description-block          | yes     |                                                                              |
| wardley-no-duplicate-title                  | yes     |                                                                              |
| wardley-no-duplicate-description            | yes     |                                                                              |
| wardley-no-empty-description-block          | yes     |                                                                              |
| wardley-no-undef                            | yes     |                                                                              |
| wardley-no-redefined-node                   | yes     |                                                                              |
| wardley-no-duplicate-evolve                 | yes     |                                                                              |
| wardley-no-duplicate-pipeline               | yes     |                                                                              |
| wardley-no-duplicate-size                   | yes     |                                                                              |
| wardley-no-duplicate-evolution              | yes     |                                                                              |
| wardley-no-duplicate-annotations            | yes     |                                                                              |
| wardley-no-ignored-link-label               | yes     |                                                                              |
| eventmodeling-no-undef                      | yes     |                                                                              |
| eventmodeling-no-redefined-data             | yes     |                                                                              |
| eventmodeling-no-duplicate-title            | yes     |                                                                              |
| eventmodeling-no-duplicate-description      | yes     |                                                                              |
| eventmodeling-no-empty-description-block    | yes     |                                                                              |
| eventmodeling-no-unclosed-description-block | no      | Criterion 1: a description that ends with its own `}` after a `{`            |
| treeview-no-duplicate-annotation            | yes     |                                                                              |
| treeview-no-duplicate-title                 | yes     |                                                                              |
| treeview-no-duplicate-description           | yes     |                                                                              |
| treeview-no-empty-description-block         | yes     |                                                                              |
| treeview-no-unclosed-description-block      | yes     |                                                                              |

The notes give, for each rule or each group of rules that share their cases,
what was checked for criteria 1 to 4, in that order. The readings of criterion 1
are those that the documents state; "run" marks a reading run through mermaid.js
for this decision. The searches run over the issues and the pull requests of
mermaid-js/mermaid; the words are quoted, and what they find does not change the
reading except where this document says that it does.

The title and description rules, `<diagram>-no-duplicate-title` and
`<diagram>-no-duplicate-description` of flowchart, sequence, class, state, er,
gantt, journey, and requirement:

1. Each reported statement replaces the value set before it: the line form and
   the block form; `accTitle:` or `accDescr:` with no text, which takes the next
   line with text (rejected at the end of the text in class and er); a statement
   inside a subgraph (flowchart, er) or a block (sequence), which sets the value
   of the whole diagram; in journey, a line meant as a task that starts with
   `title` in any case (`Title page: 5: Me`). `title` and `accTitle` are counted
   apart (sequence, gantt, journey); in state, a statement inside a composite
   state is a state and is not counted. A statement that sets the value that the
   diagram already has, compared as mermaid.js keeps it, loses nothing and is
   not reported.
2. None: a second value written on purpose leaves the first with nothing to do,
   and a statement inside a subgraph meant for the subgraph is the mistake
   reported.
3. "accTitle multiple", "title twice", "accDescr multiple", "accTitle",
   "accDescr": the items add the statements to other diagram types
   ([#8437](https://github.com/mermaid-js/mermaid/pull/8437),
   [#8140](https://github.com/mermaid-js/mermaid/pull/8140)) or concern C4
   ([#8040](https://github.com/mermaid-js/mermaid/issues/8040)).
4. Keep one statement; the rules of flowchart suggest removing either.

The empty block rules, `<diagram>-no-empty-description-block` of flowchart,
sequence, state, er, gantt, journey, and requirement:

1. The block has no effect: after a description, the block leaves it, and with
   no description before it, the description stays empty. A block of only
   comment lines is not reported.
2. None: a block left to be filled in later is written with a comment in it, as
   `accDescr {`, `%% TODO`, and `}`, which the rule does not report, and the
   documents say so.
3. "accDescr empty", "empty accDescr", "accDescr empty block", "accDescr".
4. Write the description, or remove the block.

The unclosed block rules, `<diagram>-no-unclosed-description-block` of
flowchart, sequence, state, er, and requirement:

1. A block that a `}` of a shape, a data block, a body, or JSON closes takes the
   lines up to it, and a block without a `}` (flowchart, sequence, state) leaves
   the description empty. A description that holds a `{` and ends with its own
   `}` on a later line (`accDescr {`, then `a {b }` in flowchart and sequence;
   `accDescr {`, `uses { here`, and `}` in state, er, and requirement) is
   reported too, and mermaid.js reads it as written; the documents say so. Not
   enabled.
2. The same description.
3. "accDescr unclosed", "accDescr brace".
4. Close the block; flowchart suggests where.

The direction line rules, flowchart-no-ignored-text, class-no-ignored-text,
state-no-ignored-text, er-no-ignored-text, and requirement-no-ignored-text:

1. The statements on a direction line, the text glued to the direction value,
   and, in state and er, the other texts that the documents name are dropped. In
   state, the character that mermaid.js drops after the `:` of a note, as in
   `note left of A:hi`, is reported: the documentation of mermaid.js writes a
   note with a space after the `:`, and written so, as `note left of A : hi`,
   nothing is dropped (run) ("state note colon character", "note first character
   missing", "state note text", "note state" in titles: nothing about it).
2. None: text after the direction that the author means as a comment in the
   syntax of another language, as `direction TB // vertical`, is no comment of
   mermaid.js, and it is dropped (run, in each of the five diagram types); the
   report states that, with no guess about what the author meant.
3. "direction subgraph same line", "direction statement ignored", "subgraph
   direction", "classDiagram direction", "stateDiagram direction", "erDiagram
   direction", "requirement direction", "direction label", "direction keyword
   node": the items concern how a direction is laid out, as
   [#8066](https://github.com/mermaid-js/mermaid/issues/8066). For er,
   [#8364](https://github.com/mermaid-js/mermaid/pull/8364) (open, "fix(er):
   parse keywords and numbers as unquoted relationship labels") reads the text
   after the `:` of a relationship as its role, so that
   `A ||--o{ B : direction TB`, which makes no relationship now (run), would no
   longer be a direction line (criterion 3). er-no-ignored-text is decided again
   when that pull request is closed.
4. Write the statement on a line of its own; flowchart suggests the split.

sequence-no-ignored-text: (1) the character is dropped; (2) none; (3) "sequence
message newline parenthesis"; (4) write the end of the message on its line.

journey-no-ignored-text: (1) the people after the third colon are dropped; (2)
none: people are separated by commas; (3) "journey colon", "journey"; (4)
separate the people with commas.

flowchart-no-undef: (1) `style` makes a vertex that the author did not write,
and `class` and `click` do nothing; (2) none; (3) "style undefined node", "class
nonexistent node", "style node":
[#7040](https://github.com/mermaid-js/mermaid/issues/7040) (closed, approved)
asked for an error, and [#7441](https://github.com/mermaid-js/mermaid/pull/7441)
(merged, in the pinned version) logs a warning and still makes the vertex; (4)
correct the id. An id that mermaid.js gives a link written without one, as
`L_A_B_0`, is an id of the diagram (run: `class L_A_B_0 hot` gives the link the
class); using it is not reported, since it reaches what it names, and that such
an id changes when the links change is no fact of the output.

class-no-undef: (1) the statement changes nothing, or the note has no line; (2)
none; (3) "cssClass not applied", "classDiagram style nonexistent", "cssClass",
"note for class": [#2234](https://github.com/mermaid-js/mermaid/issues/2234)
(open, "Status: Awaiting PR") asks for an error or for `link` to declare the
class, and with either a mistyped name stays a mistake; (4) correct the name.

state-no-undef: (1) `style`, `class`, and `click` change nothing, and a note for
a state that no other statement writes adds that state; (2) none: a note for a
state sketched with a note only adds a state that no statement writes, and the
report states that; (3) "state note nonexistent"; (4) correct the name, or write
the state.

er-no-undef: (1) the statement changes nothing, and an alias is no name; (2)
none; (3) "erDiagram style class"; (4) use the name of the entity.

gantt-no-undef: (1) no task becomes a link, and the start or the end is today's
date; (2) none; (3) "gantt after nonexistent", "gantt after today", "after
gantt": [#8254](https://github.com/mermaid-js/mermaid/pull/8254) (merged) logs a
warning and keeps today's date,
[#6376](https://github.com/mermaid-js/mermaid/pull/6376) (open) adds delays to
`after` and `until`, [#8359](https://github.com/mermaid-js/mermaid/pull/8359)
(open) stops ids of an earlier chart on the page from being found, and
[#4424](https://github.com/mermaid-js/mermaid/issues/4424) (open) concerns ids
written later, which the rule does not report; (4) correct the id.

requirement-no-undef: (1) the statement changes nothing, and a relationship has
no box at that end; (2) none; (3) "requirement relationship missing",
"requirement"; (4) correct the name.

flowchart-no-redefined-vertex: (1) a later shape or label replaces the earlier
one; labels that differ only in their line breaks are not reported, and labels
are otherwise compared as written, so two that differ only in the quotes of an
HTML attribute, which mermaid.js keeps the same, are reported, as the document
says, because the rules compare written values. A subgraph leaves out the
members that a subgraph ended before it has, so a statement in a later subgraph
with no link, class, or data block that says nothing new about a vertex written
before, only its id, or a shape of the same name, property, and label, with both
labels markdown or neither, is reported: the later subgraph does not hold the
vertex (run: `A` in `subgraph a`, then `A` in `subgraph b`, leaves `A` in a). A
label in quotes and a label without them count as one here: after `A[x]`,
`A["x"]` changes only the `labelType` of the Db, from `text` to `string`, a
difference that the formatter lists among the kinds of formatting that change
the Db and are drawn the same
(`packages/prettier-plugin-mmd/docs/printed-form.md`), and the formatter prints
a label in one of the two forms, so formatting would change what is reported if
they counted apart; `A["x"]` is reported as `A[x]` is, and ``A["`**x**`"]`` is
not, since a markdown label draws differently (run). A property is another
matter: the formatter leaves it, so `A[|borders:lt|x]` after `A[x]` still says
something new. It is not reported when the earlier subgraph is nested in the
later one or has its id, where nothing is lost. Each vertex of such a statement
counts apart: `A & B` in b, when a has only `A`, reports `A`, which says nothing
new while `B` joins b, and `A & B --> C` reports neither (run). `A` in b when no
earlier subgraph has it puts it in b, `A --> B` draws its edge, `A[y]`, `A:::c`,
and after `A[x]` also ``A["`**x**`"]`` and `A[|borders:lt|x]` change the Db, and
a bare `c` that only names an earlier subgraph writes a new vertex, so none of
them is reported for this (run). It is the mistake of this rule, an id written
again, in the same statement, as in block-no-duplicate-block; (2) none: no
example of the documentation writes it (run on `flowchart.md` and
`swimlanes.md`); (3) "node label overwritten", "redefine node label", "node
label", "subgraph node two subgraphs", "node multiple subgraphs", "subgraph
duplicate node", "node belongs subgraph", "subgraph members same node":
[#3789](https://github.com/mermaid-js/mermaid/issues/3789) (open, Type:
Enhancement) proposes another statement for labels,
[#2567](https://github.com/mermaid-js/mermaid/issues/2567) (open, Type:
Enhancement) asks to share a node between subgraphs, with no pull request, and
[#8503](https://github.com/mermaid-js/mermaid/pull/8503) (open) changes only a
subgraph that lists one around it; (4) use another id, or write the label once,
and write the vertex in one subgraph.

flowchart-no-duplicate-direction: (1) a later `direction` statement in the body
of a subgraph replaces the direction of the subgraph (run in `flowchart`,
`flowchart-elk`, and `swimlane-beta`); two subgraphs of one id are drawn as one
with the direction of the first (read in `getData`, which gives the layout the
subgraphs from the last to the first, and the layout keeps one node for an id),
so a different direction in a later one is lost and reported; the Db merges the
declarations of an id into the first, which keeps its title, direction, and
position (read in `addSubGraph`; run); `TD` and `TB` are one direction, as the
documentation says; (2) none; (3) the searches of the direction rules above; (4)
write one `direction` statement for each subgraph.

flowchart-no-redefined-subgraph: (1) the declarations of one subgraph id are
merged into the first, which keeps its title, direction, and position, so a
title written in a later declaration is lost (read in `addSubGraph`; run:
`subgraph S [One]` and `subgraph S [Two]` give one subgraph `S` titled `One`
with the members of both, and `subgraph S` and `subgraph S [Two]` one titled
`S`); (2) none: a later declaration without a title, or with the title that the
subgraph has, adds members and loses nothing; the title that the subgraph has is
the title written in its first declaration, or, when that declaration writes
none, the name that it writes, which mermaid.js shows as the title, not an id
that mermaid.js generates (run: `subgraph S` has the title `S`, and
`subgraph a b`, whose id is `subGraph0`, the title `a b`); titles are compared
as written, as the labels of flowchart-no-redefined-vertex. Fixtures:
`subgraph a b`, then `subgraph subGraph0 [a b]` (not reported: the title stays
`a b`), and `subgraph a b`, then `subgraph subGraph0 [subGraph0]` (reported:
`subGraph0` is lost; run); (3) "duplicate subgraph", "subgraph same id",
"subgraph redeclare", "subgraph title overwritten":
[#8326](https://github.com/mermaid-js/mermaid/issues/8326) (closed) and
[#8337](https://github.com/mermaid-js/mermaid/pull/8337) (merged, in the pinned
version) make every layout merge the declarations, as dagre and 11.x did, so
writing a subgraph again to add members is a way of writing; (4) write the title
in the first declaration, or use another id.

flowchart-no-spaced-stroke and agentflow-no-spaced-stroke: (1) the styles that
reach a link are those of its classes, then those of `linkStyle default`, then
those of its own `linkStyle`; the line takes the last declaration named
`stroke`, as CSS does, while mermaid.js takes the colour of the arrowhead from
the first text `stroke:` in them, also one inside a longer name such as
`text-stroke:`, and gives the arrowhead no colour when that text has nothing but
whitespace after it (read in
[`edges.js`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edges.js#L956-L957)
and
[`edgeMarker.ts`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/rendering-util/rendering-elements/edgeMarker.ts#L105-L127);
run). So a `stroke` in lower case, written with whitespace before its `:`, that
gives the line of a link its colour while no text `stroke:` stands before it in
the styles of that link, leaves the arrowhead without that colour (run:
`linkStyle 0 stroke :#f00` draws a red line and an arrowhead in the colour of
the theme). By the exception in section 2 of [SKILL.md](../SKILL.md), the rules
report every such `stroke` in a `linkStyle` or a `classDef`, also where nothing
is lost now: where a later `stroke` gives the line its colour
(`linkStyle default stroke :#f00`, then `linkStyle 0 stroke:#00f`: both are
blue), where a text `stroke:` before it gives the arrowhead its colour
(`stroke:#00f,stroke :#f00`), in a `classDef` that only vertices take, which CSS
reads, and in `linkStyle default` of a diagram with no link (run). A `style` is
not reported: it styles a vertex or a subgraph and never a link (read in
`addVertex`; run: after `A e1@--> B`, `style e1 stroke:#f00` leaves the link as
it was), so mermaid.js does not read its text `stroke:`, CSS reads
`stroke :#f00` there as `stroke:#f00` (run), and no rule reports whitespace
before the `:` of the other names there. Not reported are another name that ends
with `stroke` (`text-stroke :#f00` colours no line, and without the whitespace
it would colour only the arrowhead; run) and another case of the name
(`Stroke :#f00`, which removing the whitespace does not help; read). The styles
of the relationships of a usecase diagram are only read and are not included;
(2) none: the documentation of mermaid.js writes
`linkStyle 3 stroke:#ff3,stroke-width:4px,color:red;`, with no whitespace there,
as for `note left of A:hi`; (3) "linkStyle stroke arrowhead color", "arrowhead
color linkStyle", "marker color stroke linkStyle", "edge marker stroke color":
[#7974](https://github.com/mermaid-js/mermaid/pull/7974) (open) gives the
markers `context-stroke`, with which the arrowhead takes the stroke of the line
in the browsers that support it, and
[#1236](https://github.com/mermaid-js/mermaid/issues/1236) (open) asks for the
same; the rules are not enabled, since they report what mermaid.js reads as
meant (criterion 1) and since that change is open (criterion 3); (4) remove the
whitespace.

class-no-redefined-class: (1) the earlier label is lost; (2) none; (3) "class
label redefine"; (4) use another name, or write the label once.

er-no-redefined-entity: (1) the later alias is ignored; (2) none; (3) "entity
alias", "alias erDiagram"; (4) use another name, or write the alias once.

no-unclosed-directive: (1) the statements on the lines that the directive takes,
or the word after `%%{wrap`, are lost (run in every diagram type); (2) none: the
name and the JSON object or array of the argument may run over several lines,
and a directive at the end of the text or ended by U+2028 or U+2029 takes
nothing and is not reported, since it gives the Db and the settings of the
closed directive (run); a directive closed by the `}%%` of a later directive is
reported too; (3) "directive not closed", "unclosed directive", "directive": the
items concern settings, and the documentation of mermaid.js replaces directives
with the frontmatter ([#7989](https://github.com/mermaid-js/mermaid/pull/7989),
merged), which keeps the reading; (4) close the directive with `}%%`. The rule
is common: the shared preprocessing removes the directive before the lexer of
any diagram type reads the text, and a diagram type that rejects what is left
gives no report (run in every header of the detection table).

no-invalid-init-directive: (1) the settings of every init directive are dropped,
or, for a name in another case, the settings of that directive (run in every
diagram type); mermaid.js turns every `'` into `"` before it reads the JSON
(read in
[`detectDirective`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/utils.ts#L159-L198)),
so it reads any JSON that is valid after that, also one that mixes the two
quotes (`{'theme": "dark"}`), and reads `\'` inside a string of either quote as
`"` (the steps run in Node). Where the JSON is broken after the replacement but
valid as its quotes are written, apart from trailing commas, each character that
makes the difference (a `'` inside a string in `"`, an unescaped `"` inside a
string in `'`) and each trailing comma is reported apart, with its fix; each
`\'` inside a string is reported with its fix too; one `--fix` pass applies them
all; any other JSON that is broken after the replacement is reported once as
invalid, with no fix; (2) none: JSON that is valid after the replacement, as
`{'theme': 'dark'}` and `{"fontFamily": "Arial'}`, and `\u0027` are not reported
([#3640](https://github.com/mermaid-js/mermaid/issues/3640) (open) concerns the
quotes), a word argument or none comes from not knowing the syntax, and a
directive after `%%}%%` on its line drops only its own settings when text
follows the line and those of every init directive on the last line, which the
document states; (3) "init trailing comma", "init directive ignored", "directive
case sensitive", "init json", "json5", "trailing comma init"; (4) correct the
JSON, write `\u0027` for a `'` and `\"` for a `"` inside a string, or write the
name in lower case. The name follows ESLint, where invalid is a form written
incorrectly that does not work as meant (no-invalid-regexp, valid-typeof), as
the reported forms are.

no-duplicate-init-key: (1) the earlier value of a key that one object of the
JSON holds twice is lost (run in every diagram type); (2) none: a key written
again with an equal value, and the keys of two init directives, which the
documentation combines with the last value of each key, are not reported, and
only JSON that mermaid.js reads is checked; (3) "init duplicate key", "init
json"; (4) keep one of the two members.

class-no-inline-comment: see the paragraph after these notes.

sequence-no-create-destroy: (1) nothing is recorded as destroyed; (2) none; (3)
"create destroy": [#4833](https://github.com/mermaid-js/mermaid/issues/4833)
(open) concerns where `create` stands; (4) write `create` and `destroy` as two
statements.

sequence-no-invalid-json: (1) text that is no JSON object gives nothing, or the
characters or the elements of a string or an array; a text that is a JSON object
with the `#` and what follows it, as a URL with a fragment, is not reported,
since mermaid.js cuts a correct JSON object at the `#`; (2) none: `links A:` and
`properties A:` give nothing, and no scene keeps them to be filled in; (3)
"links json", "properties sequence json", "links", "links hash", "links
fragment", "hash sequence" in titles:
[#5419](https://github.com/mermaid-js/mermaid/issues/5419) (open, Type: Bug /
Error) reports that a `#` empties the texts of a sequence diagram; (4) write a
JSON object.

sequence-no-link-without-separator: (1) the label loses its last two characters,
and `link A:` gives an empty link; (2) none: `link` used as a participant id, as
in `link->>B: x`, is a message, not a link statement, and is not reported
(`packages/spec/docs/diagrams/sequence.md`, rule 11 of the statement context:
`link` is a keyword only before spaces or tabs and a character outside
`/\+()<>:,;-` and whitespace); (3) "link @ sequence menu", "link sequence"; (4)
the document names the form `label @ url`.

class-no-bare-class-name: (1) the statement declares nothing; (2) none; (3)
"classDiagram direction lowercase", "classDiagram title", "class diagram title";
(4) the document names `class Foo`, a relation, a member, and the frontmatter
for a title.

class-no-unclosed-backquote: (1) the rest of the text is one name; (2) none; (3)
"class name backtick", "backtick"; (4) close the backquote.

gantt-no-duplicate-id: (1) the id names the later task; (2) none; (3) "gantt
duplicate id", "gantt id"; (4) give the task another id.

gantt-no-duplicate-setting: (1) a later value replaces the earlier one for the
whole chart; a statement that repeats the value, compared as mermaid.js keeps
it, is not reported; (2) none; (3) "gantt dateFormat twice", "gantt multiple
dateFormat", "dateFormat"; (4) keep one statement.

gantt-no-unknown-exclude: (1) the word leaves out nothing; (2) none; (3)
"excludes weekend", "gantt excludes", "excludes weekdays": the items concern the
end dates of tasks over excluded days, as
[#7038](https://github.com/mermaid-js/mermaid/pull/7038), and excludes for a
section ([#5680](https://github.com/mermaid-js/mermaid/issues/5680)); (4) write
`weekends` or the full name of a day.

gantt-no-invalid-tag: (1) the word in the place of the start or the end is read
as a date, which it is not: the chart is not drawn, or the task has no length
(run); the id is not checked, since mermaid.js reads any word there as an id;
(2) none; (3) "gantt tag case", "gantt done crit":
[#4165](https://github.com/mermaid-js/mermaid/issues/4165) (open) concerns a
missing comma before the start; (4) the document names the form, in lower case
at the front, followed by a comma. The names gantt-no-invalid-tag,
xychart-no-invalid-orientation, and block-no-invalid-direction use invalid as
no-invalid-init-directive does: each reports a value written incorrectly (in
another case, without its comma, with whitespace, or in a place where it cannot
stand).

journey-no-empty-person: (1) the journey and its legend get a person with an
empty name; (2) none: `Make tea: 5:`, with the people left to be written, adds a
person that was not written to the journey and its legend, and a task without
people is written `Make tea: 5`; (3) "journey actor empty", "journey"; (4)
remove the comma, or write the name.

journey-no-invalid-score: (1) a score that is no number is lost, with the people
written in it; a number outside the scale has no effect, since the documentation
of mermaid.js defines the score as a number from 1 to 5 that places the face on
the scale; an empty score adds a score 0 that was not written; (2) none: an
empty score left to be decided, as in `Make tea: : Me`, adds a score 0 that was
not written, outside the scale; (3) "journey score", "journey":
[#6262](https://github.com/mermaid-js/mermaid/issues/6262) (open, approved)
concerns how a face outside the scale is drawn, and
[#4248](https://github.com/mermaid-js/mermaid/issues/4248) (open, Type:
Enhancement, Status: Triage) asks for a scale of one's own, with no pull
request; (4) the document names the score, a number from 1 to 5 between the
first and the second colon.

requirement-no-duplicate-field: (1) the first value is kept, and a later field
with the same value, compared as mermaid.js keeps it, is not reported; (2) none:
a second `text:` meant to continue a long text is the mistake reported; (3)
"requirement field", "requirement duplicate"; (4) keep one field.

requirement-no-duplicate-name: (1) a later statement of the same kind loses its
kind or the fields whose values the kept statement does not have; a statement of
the other kind makes a second box of the name, keeps both, and is not reported
(run: two nodes `x`); (2) none; (3) "requirement duplicate", "requirement"; (4)
give one of them another name.

mindmap-no-duplicate-decoration: (1) the last icon line and the last class line
are kept, and a line with the value that the node already has is not reported;
(2) none: no author writes a second icon line to replace the first, and two
class lines for two classes are the mistake reported; (3) "mindmap icon class",
"mindmap": [#7025](https://github.com/mermaid-js/mermaid/pull/7025) (open) and
[#7615](https://github.com/mermaid-js/mermaid/issues/7615) (open) concern how
icons are drawn; (4) the document names one class line, as `:::urgent large`.

mindmap-no-mismatched-shape: (1) the node has the shape of the opener; (2) none;
(3) "mindmap shape", "mindmap"; (4) write the closer of the opener.

The timeline rules, timeline-no-duplicate-title,
timeline-no-duplicate-description, and timeline-no-empty-description-block, have
the notes of the title, description, and empty block rules above; their cases
are those of journey, with a title that takes the whole next line after `title`
at the end of a line, and an empty block before a period or an event (run).
Searches: "timeline title", "timeline section", "timeline accTitle", "timeline
colon", and "timeline hash".

sankey-no-invalid-value: (1) a value with no number at its start is `NaN`, and
the link has no size; text after the number is dropped, as `"1,234"`, which is 1
(run); text after the number that starts with `%%` is not reported; (2) none: a
unit after the number, as in `5 TWh`, is dropped, and the report states that;
(3) "sankey value", "sankey NaN", "sankey number", "sankey comma", "sankey
parseFloat", "sankey" in titles:
[#5995](https://github.com/mermaid-js/mermaid/issues/5995) (open) asks how
negative values are drawn, which the rule does not report; (4) write the number
alone, without separators or units.

sankey-no-empty-node: (1) a source or a target of whitespace only, also in
quotes, adds a node without a name, with the link to it (run); (2) none: a name
deleted with its space kept is the slip reported, as for
journey-no-empty-person; (3) "sankey" in titles; (4) write the name, or remove
the record.

The XY chart rules. Searches: "xychart" in titles and in the text.

- xychart-no-duplicate-title, xychart-no-duplicate-description,
  xychart-no-empty-description-block: the notes of the title, description, and
  empty block rules above; a title in words is compared as mermaid.js joins it,
  and an `accTitle:` at the end of the text sets the empty title (run).
- xychart-no-unclosed-description-block: (1) the block runs to the end of the
  text, takes the statements after it, and leaves the description empty (run);
  the rule reports only a block without its `}`, so no description that
  mermaid.js reads as written is reported; (2) none; (4) close the block.
- xychart-no-invalid-orientation: (1) `Horizontal` and `HORIZONTAL` give a
  vertical chart, also over the setting `chartOrientation: horizontal` (run);
  (2) none: `vertical` in any case is not reported; (4) the document names
  `horizontal` in lower case.
- xychart-no-redefined-axis: (1) a later statement of an axis replaces the
  title, with the empty title when it has none, and the data when it has data
  (run); a statement that only adds what the axis lacked is not reported; (2)
  none; (4) write one statement for each axis.
- xychart-no-extra-value: (1) the values beyond the categories are dropped
  (run); (2) none; (3) [#7798](https://github.com/mermaid-js/mermaid/pull/7798)
  (open) would give the plots before the last `x-axis` the last x axis, so the
  rule checks only the plots after it, where the reading is the same now and
  with that change; (4) write as many values as categories.

The quadrant chart rules. Searches: "quadrant" and "quadrantChart" in titles and
in the text, also with the words point, classDef, coordinates, x-axis, range,
lexer, comma, number, NaN, hex, and radius: the open
[#8084](https://github.com/mermaid-js/mermaid/pull/8084) changes only how the
texts are wrapped when drawn, and
[#7608](https://github.com/mermaid-js/mermaid/issues/7608) (open) asks for other
ranges of the axes.

- quadrant-no-duplicate-title, quadrant-no-duplicate-description,
  quadrant-no-empty-description-block: the notes of the title, description, and
  empty block rules above; a title keeps its quotes and the rest of its line,
  and a description block that is not closed is rejected, so no rule reports it
  (run).
- quadrant-no-redefined-axis, quadrant-no-redefined-quadrant: (1) a later
  statement replaces each text that it sets (run); a text that was empty is not
  counted as lost; (2) none; (4) write one statement for each axis and each
  quadrant.
- quadrant-no-redefined-class: (1) the class has the styles of its last
  definition only, with no merge (run); a style that the later definition drops
  or changes is lost, and one that it adds loses nothing, as for
  usecase-no-redefined-class; (2) none; (4) write the styles in one definition.
- quadrant-no-undef: (1) the class name stays on the point and no class of that
  name is defined (run); the layout finds no class for it, and the drawn point
  has no CSS class of that name (read); (2) none; (4) define the class, or
  correct its name.
- quadrant-no-duplicate-style: (1) the later value of a style replaces the
  earlier one (run); (2) none: a style of a point and one of its class are not
  compared; (4) give each style once.
- quadrant-no-invalid-coordinate: (1) the coordinate is kept as written (run),
  and the layout converts it with the linear scale of d3, which gives no number
  for `0,3` and 5 for `0x5` (run on d3-scale 4.0.2); the rule reports only a
  coordinate that is no number or a number outside 0 to 1, so `0e5` (0) and
  `0b1` (1), drawn at their place, are not reported; a circle without a number
  gets no `cx` or `cy` (read); (2) none: the documentation of mermaid.js writes
  the coordinates as numbers from 0 to 1 with a decimal point; (3) #7608 asks
  for other ranges, which would not make `0,3` a number; (4) write the decimal
  point.
- quadrant-no-invalid-color: (1) a point takes its own styles, then those of the
  last `classDef` of its class, and is drawn with the theme's colour where
  neither gives one and with a border 0px wide where neither gives a width (read
  in `quadrantBuilder.ts`). A `color` or a `stroke-color` of three or six
  hexadecimal digits without `#` passes the check of mermaid.js, which lets the
  `#` be left out, and is drawn as `fill="f00"` or `stroke="f00"`, which the
  browser does not read as a colour, so the point keeps the colour of the theme,
  or its border has none (read in `validateHexCode` and `parseStyles`; run,
  `stroke-color` with `stroke-width: 4px`); `color: red` is rejected. Such a
  value is reported where a point is drawn with it: not where a later value of
  the same name in its statement replaces it (quadrant-no-duplicate-style
  reports that), not in a `classDef` that no point takes or whose value the
  point's own style replaces (run), and, for `stroke-color`, only where the
  point is drawn with a border wider than 0px; (2) none: the documentation of
  mermaid.js writes every colour with `#`; (3) "quadrant point color hex",
  "quadrant color without #", "validateHexCode", "quadrantChart point color";
  (4) write the `#`.

The block diagram rules. Searches: "block" in titles and in the text, also with
the words chain, composite, class, styles, columns, shape, arrow, redefined,
whitespace, duplicate, comma, width, edge, before, direction, label, and link:
the open [#8279](https://github.com/mermaid-js/mermaid/pull/8279) changes a
`style` for an id that no block has, which mermaid.js now rejects, and
[#8310](https://github.com/mermaid-js/mermaid/pull/8310) (open) adds the
accessibility statements.
[#5588](https://github.com/mermaid-js/mermaid/issues/5588) (open, in triage)
asks to reuse an id in two composite blocks, which mermaid.js draws once; no
maintainer has said it will change.

- block-no-edge-chain, block-no-edge-in-composite-head: (1) the chain keeps only
  its last link, with no start, and places neither of its first blocks; the head
  with a link gives a composite with no id and no edge (run); (2) none: the
  documentation of mermaid.js writes one link in an edge and no link after
  `block:`; (4) write one edge for each link, and link the composite after its
  `end`.
- block-no-duplicate-block: (1) a block written again places nothing, and a
  label or shape written again replaces the first one while a width, the
  children, and the `columns` are lost (run); (2) a statement that gives a block
  its first shape is not reported, since it gives the block its label and shape,
  unless it is a block arrow, which gets no directions that way, and neither is
  an edge that repeats the shape; (4) give each block its own id, with the text
  in its label.
- block-no-spaced-class-id, block-no-invalid-direction: (1) the id with its
  whitespace finds no block and makes a new one, whitespace before a comma makes
  the rest of the line the name of the class, and the direction with its
  whitespace is not read by the drawing (run for the Db; the drawing read in
  `blockArrow.ts`); (2) none: the documentation of mermaid.js writes
  `class Backend,Database back` and `(x, down)`, which lose nothing, so the
  whitespace is a way of writing that it does not show, as for
  `note left of A:hi`; (4) write no whitespace there.
- block-no-undef: (1) the class goes to a new block that is not placed (run);
  (2) none: an id declared after the `class` statement is not reported, and a
  class name without a `classDef` is not checked; (4) correct the id.
- block-no-duplicate-columns, block-no-redefined-style: (1) the last `columns`
  sets the count of the whole block, and a later `style` replaces the whole list
  (run); (2) none: the same count and a list that keeps the styles, compared as
  CSS reads whitespace (none at the ends or around the colon, a run as one
  space), are not reported; (4) write one `columns` for each block, and one
  `style` with all the styles.
- block-no-mismatched-shape, block-no-mismatched-edge, block-no-useless-width:
  (1) the block gets no shape, the edge takes its line and markers from the
  arrow after the label only, and the width before a link is dropped with the
  link (run); (2) none: the pairs of the documentation, the same line on both
  sides, and a width equal to the one the block has are not reported; (4) close
  the shape with its pair, write the same line on both sides and the start
  marker on the second arrow, and write the width where the block is declared on
  its own. The name block-no-useless-width follows ESLint, where useless is a
  written value with no effect (no-useless-assignment, no-useless-backreference)
  and unused a declaration never read: the grammar reads the width
  (`node SIZE`), and the action of the edge (`nodeStatement link node`) leaves
  it out of the block.

The kanban rules. Searches: "kanban" in titles and in the text, also with the
words metadata, priority, duplicate, and icon:
[#8117](https://github.com/mermaid-js/mermaid/issues/8117) (open) proposes a key
`status`, which mermaid.js does not read now.

- kanban-no-invalid-metadata-key, kanban-no-invalid-priority: (1) a key other
  than `assigned`, `ticket`, `priority`, `icon`, `label`, and `shape` sets
  nothing, also a key in another case and `ticket:DOC-1` without a space, which
  YAML reads as one key; a priority other than `Very High`, `High`, `Medium`,
  `Low`, and `Very Low` is kept and drawn with no colour (run for the Db; the
  drawing read in `kanbanItem.ts`); (2) none: `Medium`, which the drawing
  handles although the documentation names only four values, and a priority left
  empty are not reported; (4) write the key and the value as the documentation
  writes them. Both rules read the YAML of the metadata, which the tree keeps as
  written, as mermaid.js reads it (JSON_SCHEMA of js-yaml). Their conditions,
  for writing the documents and the fixtures: the key rule reports each key of
  the metadata of a column or an item that is not one of the six, compared with
  its case after YAML has read it (a key in quotes too), with the blocks of one
  node read as one, as mermaid.js joins them; the priority rule reports the
  priority of an item that is not one of the five, as `high`, `" High "`,
  `Urgent`, `0`, another number, or a list, and not one that is missing, `null`,
  `false`, or empty, and not the priority of a column, which mermaid.js does not
  keep. Both are held until after the release; they are not dropped. Their
  documents and fixtures are not in the repository; they are written from this
  note and from runs of mermaid.js. Reading the YAML needs a dependency of the
  plugin, and the lint rules before the release serve mainly to check the shape
  of the tree, so whether to add one is decided after the release; the
  dependency would then be yaml-eslint-parser. A misspelled key in the data of a
  flowchart node, as `A@{ shpe: circle }`, which gives the node no shape without
  an error (run), is a candidate of the same kind and is held in the same way.
- kanban-no-duplicate-section: (1) every column of one id lists every item of
  that id, so the items are drawn once for each column (run); (2) none: columns
  of one id with no item are not reported; (4) give each column its own id.

The C4 rules. Searches: "C4" in titles and the words duplicate, undefined,
UpdateLayoutConfig, UpdateElementStyle before, attribute case, accTitle, sprite,
and offset.

- c4-no-duplicate-title, c4-no-duplicate-description: the notes of the title and
  description rules above; `accTitle:` is not compared, since it sets the
  visible title by a defect of mermaid.js.
- c4-no-undef: (1) a style update whose target does not exist when it is read
  changes nothing (run), also one written before its target; (2) none: the
  documentation of mermaid.js writes the updates at the end of the diagram, so
  an update before its target is not written as it shows, unlike a `class`
  before its vertex in a flowchart, of whose order the documentation says
  nothing; a relationship to an unknown alias is not reported, since drawing
  stops with an error; (4) correct the alias, or move the update after its
  target.
- c4-no-invalid-attribute-key, c4-no-useless-argument: (1) a style key in
  another case is kept as another field, and an argument beyond the parameters
  of a call is not kept (run); (2) none: other unknown keys, and empty entries
  beyond the parameters, are not reported; (4) write the key in its case, and
  the value in its parameter.
- c4-no-redefined-element: (1) a later declaration of an alias replaces the
  label and the kind of an element, and the label and the type of a boundary
  (run); (2) none: the same label again, a first label, a boundary written again
  to add elements, and a default type that nobody wrote are not reported; (4)
  give each element and boundary its own alias.
- c4-no-duplicate-style: (1) a later style update, or a later argument of the
  same update, that gives a field again replaces the earlier value, also with
  the empty value of an empty argument (run); (2) none: a field given the value
  it has, a field the target has not had, `$alias`, `$from`, `$to`, and values
  of declarations are not reported; (3) "UpdateElementStyle", "UpdateRelStyle":
  [#8087](https://github.com/mermaid-js/mermaid/pull/8087) (open) checks the
  colours, which does not change which value is kept; (4) give each field once,
  with a named attribute for one field.

The venn rules. Searches: "venn" in titles, "venn-beta", and "venn" with the
words style, stroke-width, text, title, duplicate, comment, union label, and px:
the open [#8089](https://github.com/mermaid-js/mermaid/pull/8089) sorts the
names of a target before the drawing looks up its style or its area, which the
Db already sorts; the open
[#8471](https://github.com/mermaid-js/mermaid/pull/8471) makes a diagram with no
set an error; [#8076](https://github.com/mermaid-js/mermaid/issues/8076) and
[#7692](https://github.com/mermaid-js/mermaid/issues/7692) (open) concern where
texts and circles are placed. The drawing was read in `vennRenderer.ts` and in
@upsetjs/venn.js 2.0.0, whose layout was also run on the Db of the examples (no
SVG was drawn).

- venn-no-duplicate-title: the notes of the title rules above; a title keeps its
  quotes and the rest of its line, and the title of the frontmatter is not
  compared.
- venn-no-duplicate-subset: (1) the drawing draws an area once for each
  statement: a set written again is a second circle in the next colour, a later
  label replaces the earlier one, a later size of a set replaces the earlier
  one, and two sizes of a union give an overlap between them (run for the sizes;
  the circles and the labels read); (2) none: a set written again so that an
  indented `text` follows it is reported, since it is drawn twice, and the
  document gives `text A A3` at the start of a line for it; (4) declare each
  area once. A subset is a `set` or `union` statement, as in the tree
  (VennSubsetStatement) and in the Db of mermaid.js (`getSubsetData`).
- venn-no-duplicate-style, venn-no-invalid-style-key: (1) a later value of a
  property replaces the earlier one, in one statement (run) and across the
  statements of one target (read in `buildStyleByKey`); the drawing reads only
  the five properties that the documentation lists, and mermaid.js keeps any
  other with its name as written (run for the Db; the drawing read); (2) none: a
  value that the target already has, a property that it has not had, and the
  five properties are not reported; (4) give each property once, and write one
  of the five. The name venn-no-invalid-style-key uses invalid as the names
  above do.
- venn-no-undef: (1) the text node of an area that no statement declares is not
  placed, and a style for it styles nothing (run for the areas of the layout;
  read in `renderTextNodes` and in the lookups of the styles); (2) none: an area
  declared later, the pairs that a larger union adds, and the id of a text node
  for a style of one name are not reported; (4) correct the name, or declare the
  area.
- venn-no-ignored-text: (1) the character is dropped with the comment (run); (2)
  none: a space before `%%` and a `%%` inside a label or a quoted name are not
  reported; (4) remove the character, or complete the statement.

The agentflow rules. Searches: "agentflow" in titles, "agentflow-beta", and
"agentflow" with the words connector, flow title, direction, accDescr,
duplicate, and shape: [#8443](https://github.com/mermaid-js/mermaid/pull/8443)
(merged, in the pinned version) draws `[/…/]` as an input.

- agentflow-no-duplicate-title, agentflow-no-duplicate-description,
  agentflow-no-empty-description-block, agentflow-no-unclosed-description-block,
  agentflow-no-ignored-text: the notes of the flowchart rules above, with what
  agentflow reads differently: a comment line is text after `accTitle:` and
  `accDescr:` and in a block (run), so a block of only a comment is not empty
  and sets the description; an empty block in the name of a flow or a connector
  and before the fields of `click` sets no description and is reported too
  (run); the unclosed block rule has the condition of the flowchart rule and is
  not enabled for the same reason.
- agentflow-no-redefined-vertex, agentflow-no-redefined-connector: (1) a shaped
  vertex or a connector declaration replaces the label, the drawn shape, and the
  kind that the id had, and the first declaration of a connector replaces a
  vertex of the id (run); shapes are compared as drawn, the diamond, the
  hexagon, the subroutine, and `[/…/]` apart and every other bracket shape as a
  rounded rectangle (read in `getTypeFromVertex` and `normaliseNodeShapes`), and
  kinds as agentflow derives them (task, input, decision, action, tool,
  connector), which its default theme `redux-color` draws in their own colours
  (read in `deriveVertexKind` and `styles.ts`; kinds count, since they are part
  of the default drawing of agentflow); (2) none: the id that a connector
  without a title shows, a reference, data blocks, and the same label, drawn
  shape, and kind are not reported; (4) give each element its own id. The two
  rules share one record of each id and part by the statement reported.
  agentflow-no-redefined-vertex also reports a vertex written again in a later
  flow, under the condition of flowchart-no-redefined-vertex (run) with the
  shapes compared as drawn, as above (`A(x)` after `A[x]` is reported though the
  `type` of the Db differs, `round` and `square`; run), except a vertex of a
  `global` block, which stays at the top level: the documentation gives that
  block for a node shared by flows. The condition reads the title of a connector
  as not markdown, since mermaid.js records `text` for it however it is written,
  and the markdown label and the property that a vertex statement gave the
  element stay when the connector is declared again with a title (run). A
  connector that an earlier flow holds counts as its member, and
  agentflow-no-redefined-connector reports in the same way a declaration in a
  later flow with no metadata, with no title or the title that the element has:
  `connector C` in `flow a`, then `connector C` in `flow b`, leaves `C` in a and
  changes nothing (run). Another title is reported for the title; a declaration
  after a bare `C` in an earlier flow takes effect, since `C` becomes a
  connector, and `connector C` in b when no earlier flow has it puts it in b
  (run).
- agentflow-no-redefined-flow: (1) flows of one id are merged, and a later title
  that is not empty replaces the earlier one, in the order in which the flows
  end (run); (2) none: a flow written again without a title to add members is
  not reported; (4) write one title for each id.
- agentflow-no-duplicate-direction: (1) a later direction of a flow, in its body
  or in a later declaration of its id, replaces the earlier one (run); `TD` and
  `TB` are one direction, as the documentation of the flowchart says; (2) none;
  (4) write one direction for each flow. Two `direction` statements in one
  subgraph of a flowchart behave the same (run), which
  flowchart-no-duplicate-direction reports.
- agentflow-no-undef: the notes of flowchart-no-undef; the names of flows and
  connectors are ids, and an id that mermaid.js gives itself (`subGraph0`,
  `L_A_B_0`) is an id of the diagram and is not reported, since it reaches what
  it names (run).

The usecase rules. Searches: "usecase" and "use case" in titles, and "usecase"
with the words duplicate, classDef, metadata, direction, accDescr, animate, and
animation: [#8392](https://github.com/mermaid-js/mermaid/issues/8392) (closed)
and [#8402](https://github.com/mermaid-js/mermaid/pull/8402) (merged, in the
pinned version) draw the guillemets of include and extend.

- usecase-no-duplicate-title, usecase-no-duplicate-description,
  usecase-no-empty-description-block, usecase-no-unclosed-description-block: the
  notes of the flowchart rules above, with what usecase reads differently:
  mermaid.js trims a title and a description and removes the whitespace after
  each line break of a description (read in the visitor and in
  `setAccDescription`); a comment line in a block is removed, so a block of only
  a comment line sets the empty description (run), which is reported by
  usecase-no-duplicate-description after a description and not reported alone,
  as a block left to be filled in later; a block that no `}` closes is rejected,
  and one that the `}` of later metadata or of a JSON object closes takes the
  lines up to it (run), which the unclosed block rule reports with the condition
  of the flowchart rule and is not enabled for the same reason.
- usecase-no-duplicate-direction: (1) the last `direction` statement sets the
  direction, and `TD` is recorded as `TB` (read in `usecaseModelBuilder`; run);
  (2) none; (4) write one `direction` statement.
- usecase-no-duplicate-metadata: (1) an update of a key replaces the value that
  an earlier update gave the actor, the use case, the boundary, or the
  relationship (run); the metadata of a boundary heading takes part in source
  order, and an update after a heading is not reported, since the documentation
  writes it to change the type of the heading; an update wins over the metadata
  of an actor or a use case declaration wherever it stands, the way that the
  documentation writes to change it, so that metadata is not compared (run); (2)
  none: `animate` is not compared, since `animate: false` after
  `animation: slow` is drawn animated, a defect of mermaid.js; names that
  mermaid.js turns into one id (`"Place order"` and `Place_order`) are compared
  as written, which the document states (run); (4) give each key of an element
  one value.
- usecase-no-redefined-class: (1) a later `classDef` replaces the whole
  definition of the class (read in `applyClassDefinitions`), and the drawing
  takes the last value of each property in it (read in `getCompiledStyles`;
  run), so a style that the later definition drops or changes is lost, and one
  that it adds loses nothing; in a flowchart, a block diagram, and an agentflow,
  CSS decides instead (see section 2 of [SKILL.md](../SKILL.md)); property names
  are compared as written, since the drawing gives a style to the label or to
  the shape by its written name (read in `styles2String`), and values as CSS
  reads them, keeping the text of a quoted string (run); (2) none: a definition
  that adds styles or writes them in another order is not reported; (4) write
  one `classDef` for each class.

The pie rules. Searches: "pie duplicate label", "pie same label", "pie" with
title in titles, "pie accDescr", and "populateCommonDb":
[#6485](https://github.com/mermaid-js/mermaid/pull/6485) (closed, not merged)
says of the Langium parsers that only the last value of a title is taken, as
intended. [#7855](https://github.com/mermaid-js/mermaid/pull/7855) (open) moves
the parser of pie to Chevrotain with values byte for byte equal to the current
parser; it does not fix the behavior that the rules rely on, so criterion 3 does
not hold the rules back, and a change that it brings is met when the pinned
mermaid.js is updated.

- pie-no-duplicate-label: (1) a later section of a label is not added, and the
  slice keeps the value of the first section (read in `addSection`; run); (2)
  none: a section that gives the value of the first one, as a number, is not
  reported; (4) give each label one section.
- pie-no-duplicate-title, pie-no-duplicate-description,
  pie-no-empty-description-block: the notes of the title, description, and empty
  block rules above, with what pie reads differently: the parser keeps the last
  `title`, `accTitle`, and `accDescr`, and `populateCommonDb` sets one only when
  it is not empty, so an empty one written last leaves the value empty, or gives
  the title of the frontmatter (run); a comment line in a block is removed, so a
  block of only a comment line leaves the description empty (run), which is
  reported by pie-no-duplicate-description after a description and not reported
  alone, as for usecase; values are compared as the value converter keeps them
  (read in `valueConverter.ts`; run); the frontmatter is not read, and the title
  document states what follows from that.

The gitgraph rules. Searches: "gitGraph duplicate", "gitGraph commit id",
"gitGraph id", "gitGraph parent", "gitGraph message", "gitGraph tag", and
"gitGraph title": besides #6707 below, the items concern merges (as
[#7950](https://github.com/mermaid-js/mermaid/pull/7950), open, which adds
merges of more parents), the layout, and clicks.

- gitgraph-no-duplicate-option: (1) the grammar assigns `id`, `type`, and
  `parent` one value each, so the last one written is kept, and the earlier one
  is lost, also where mermaid.js would have rejected it (read in
  `gitGraph.langium`; run); (2) none: a value given again, a tag, which is
  added, and a message, which the drawing does not show, are not reported; (4)
  give each option one value.
- gitgraph-no-redefined-commit: (1) a later commit of an id takes the place of
  the earlier one in the order of the commits, and the earlier commit, its tags,
  and its type are lost, and the parents of the commits change (run); a `commit`
  with the id of a `merge` replaces the merge (run); mermaid.js writes
  `Commit ID A already exists` to its log at the level `warn` (read in
  `commit()`; [#6707](https://github.com/mermaid-js/mermaid/pull/6707), merged,
  added it to close [#4838](https://github.com/mermaid-js/mermaid/issues/4838),
  where a repeated id broke the drawing), which the default `logLevel`, `fatal`,
  does not show, so the input is accepted silently, as for flowchart-no-undef,
  whose warning [#7441](https://github.com/mermaid-js/mermaid/pull/7441) added;
  the railroad example of the
  [documentation](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/docs/syntax/gitgraph.md#L485-L504)
  writes `commit id:"Boston"` twice, and the second replaces the first, the
  behavior that #4838 reported, so it is no way of writing that the
  documentation shows on purpose; (2) none: the last `id:` of a statement is its
  id, and an id that mermaid.js makes is not compared; (4) give each commit its
  own id.
- gitgraph-no-duplicate-title, gitgraph-no-duplicate-description,
  gitgraph-no-empty-description-block: the notes of the pie rules above, since
  gitgraph reads its titles and descriptions in the same way (read in
  `gitGraphParser.ts`; run).

The packet rules have the notes of the pie rules above, since packet reads its
titles and descriptions in the same way and draws the title (read in `parser.ts`
and `db.ts` of packet; run). Searches: "packet title", "packet accDescr",
"packet accTitle", "packet duplicate label", "packet contiguous", "packet", and
"packet" in titles.

The architecture rules. Searches: "architecture title", "architecture arrow",
"architecture group edge", "architecture group", "architecture-beta group",
"architecture diagram title", "architecture accTitle", and "architecture
accDescr": [#7211](https://github.com/mermaid-js/mermaid/issues/7211) (open)
concerns edges from a group around another group, and
[#7313](https://github.com/mermaid-js/mermaid/issues/7313) (closed) the length
of arrows.

- architecture-no-duplicate-title, architecture-no-duplicate-description,
  architecture-no-empty-description-block: the notes of the pie rules above,
  since architecture reads its titles and descriptions in the same way (read in
  `architectureParser.ts`; run); `title` is not drawn (read in
  `architectureRenderer.ts`), so the title rule compares `accTitle` only, as the
  title rules of the diagram types without a drawn title do.
- architecture-no-reversed-marker: (1) the grammar reads `<` and `>` alike as an
  arrowhead at the end where they stand (read in `architecture.langium`), so
  `>--<` is drawn as `<-->`, and the arrowhead points the other way than written
  (run); (2) none: the documentation writes `<` on the left and `>` on the
  right, and `<` or `>` in a label is text; (4) write `<` on the left and `>` on
  the right.
- architecture-no-ungrouped-modifier: (1) on an end in no group, `{group}` moves
  the end of the edge by the padding of a group and 4, so the edge stops short
  of the service, and no group is drawn (read in `svgDraw.ts`; run); the Db
  rejects `{group}` between two services of one group but not on an end in no
  group (read in `architectureDb.ts`); (2) none: the documentation allows
  `{group}` only for a service in a group, and an end declared in a group,
  before or after the edge, is not reported; (4) remove `{group}`, or declare
  the service in its group.

The radar rules. Searches: "radar curve", "radar entry", "radar duplicate",
"radar ticks", "radar min max", "radar title", "radar accDescr", and "radar
axis": [#8522](https://github.com/mermaid-js/mermaid/pull/8522) (open) draws
equal bounds at the center and leaves a minimum above the maximum as it is (read
in its changes), and [#8301](https://github.com/mermaid-js/mermaid/pull/8301)
and [#6481](https://github.com/mermaid-js/mermaid/pull/6481) (open) add range
values and labels of the rings.

- radar-no-undef, radar-no-duplicate-entry: (1) for each declared axis, a curve
  takes the first entry that names it, so an entry of a name that no axis has
  and a later entry of an axis are left out (read in `computeCurveEntries`;
  run); (2) none: names are ids, not labels, an axis declared after the curve
  counts, and a later entry of the value of the first is not reported; (4)
  correct the name, or give each axis one value. The name radar-no-undef follows
  the `<diagram>-no-undef` rules of the other diagram types for a name that
  nothing declares.
- radar-no-mismatched-entry-count: (1) a curve of values whose count is not the
  count of the axes is not drawn at all, and only its entry in the legend is
  left (read in `drawCurves`; run); (2) none: every axis counts, and a curve
  with axis names is left to the other rules; (4) give one value for each axis.
- radar-no-duplicate-option: (1) the last value of each option is used (read in
  [`setOptions`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagrams/radar/db.ts#L93-L117);
  run); (2) none: a value given again is not reported, and a `ticks` above 32 is
  compared as 32, since mermaid.js draws at most 32 rings; (4) give each option
  one value.
- radar-no-reversed-range: (1) with the minimum above the maximum, every point
  is drawn on the outer ring (read in `relativeRadius`; run); (2) none: an equal
  minimum, a range that cuts off values, and a diagram with no curve drawn are
  not reported, and without `max` the rule does not compute the maximum that
  mermaid.js takes from the values, which the document states; (4) write a `min`
  below the `max`. The name follows architecture-no-reversed-marker for a value
  written the other way round.
- radar-no-duplicate-title, radar-no-duplicate-description,
  radar-no-empty-description-block, radar-no-unclosed-description-block: the
  notes of the pie rules above, since radar reads its titles and descriptions in
  the same way and draws the title (read in `parser.ts` and `renderer.ts` of
  radar; run); every curve holds a `}`, so a block left unclosed is closed by
  the next curve and takes the axes and the curves up to it (run), which the
  unclosed block rule reports with the condition of the usecase rule and is not
  enabled for the same reason.

The treemap rules. Searches: "treemap number", "treemap value", "treemap title",
"treemap accDescr", "treemap classDef", and "treemap whitespace".

- treemap-no-invalid-value: (1) the value converter removes the commas and reads
  the rest with `parseFloat`, so `1_000` is 1, `1.2.3` is 1.2, and `.` is no
  number (read in `valueConverter.ts` of treemap; run); a value holds only
  digits, `_`, `.`, and `,`, so the condition, `_`, more than one `.`, or no
  digit, is exactly a value not read whole; a comma meant as the decimal point
  is removed too (`0,5` is 5, `1.234,5` is 1.2345; run), so a comma after the
  `.` with a digit after it, or with other than three digits after the last
  comma that a digit follows, is reported as well, since no way of writing
  thousands, Western or Indian (`1,00,000`), puts one there; (2) none: `.5`,
  `5.`, commas between groups of thousands, and a comma that no digit follows,
  also after the `.` (`1.5,`, read as 1.5; run), are not reported, and `0,125`,
  written as thousands are, is read as 125 and not reported, which the document
  states; (4) write the number with digits, one `.`, and commas between groups
  of thousands. The name follows sankey-no-invalid-value, which reports the same
  reading of `parseFloat`.
- treemap-no-duplicate-title, treemap-no-duplicate-description,
  treemap-no-empty-description-block: the notes of the pie rules above, since
  treemap reads its titles and descriptions in the same way and draws the title
  (read in `parser.ts` of treemap; run); U+2028 in a block is kept by
  mermaid.js, so a block that differs from an earlier one only by U+2028 for a
  line feed replaces it, and it is reported (run).

The railroad rules have the notes of the architecture rules above for titles and
descriptions: the four dialects read their titles and descriptions in the same
way (read in the parsers of the four dialects; run), the drawing does not show
`title` (read in `railroadRenderer.ts`), so the title rule compares `accTitle`
only, and every rule applies to the four diagram types of railroad. Searches:
"railroad title", "railroad accTitle", "railroad accDescr", "railroad
duplicate", "railroad repeat", and "railroad".

The Cynefin rules. Searches: "cynefin", "cynefin domain", "cynefin title", and
"cynefin duplicate": [#7922](https://github.com/mermaid-js/mermaid/pull/7922)
(open) changes the center and the boundaries of the framework and leaves the
storing of domains and the common values as they are (read in its changes).

- cynefin-no-redefined-domain: (1) the Db stores the items of a domain under its
  name over the items stored before, so an item that a later statement does not
  repeat is lost from the Db and the drawing (read in `cynefinDb.ts`; run); (2)
  none: a statement that keeps every item, also adding or reordering them, is
  not reported, and an item written twice counts twice; items are compared as
  written, escapes too, as for the labels of pie, and a change past the third
  item of `confusion`, which the drawing shows only as a count, is reported,
  both of which the document states; (4) write each domain once. The name
  follows the `<diagram>-no-redefined-*` rules, where a later definition
  replaces an earlier one.
- cynefin-no-duplicate-title, cynefin-no-duplicate-description,
  cynefin-no-empty-description-block: the notes of the pie rules above, since
  Cynefin reads its titles and descriptions in the same way and draws the title
  (run).

The Wardley rules. Searches: "wardley", "wardley link label", "wardley
pipeline", "wardley evolve", "wardley annotations", and "wardley title":
[#7767](https://github.com/mermaid-js/mermaid/pull/7767) (open) places labels on
request, and [#8379](https://github.com/mermaid-js/mermaid/pull/8379) (open)
concerns the configuration.

- wardley-no-undef: (1) a link to a name that is no node is kept but not drawn,
  and an `evolve` of a name that is the id of no node adds no arrow (read in
  `resolveNodeId` and in the parser; run); (2) none: a link may name a child of
  a pipeline by its label, as the documentation shows, and a node declared after
  counts; names are compared as written, and names that mermaid.js makes one by
  decoding escapes or turning the quotes of HTML attributes are a limit that the
  document states; (4) correct the name.
- wardley-no-redefined-node: (1) a node declared again replaces the position,
  the strategy, and the inertia of the earlier one, in the order anchors,
  components, children of pipelines (read in the parser and in `addNode`; run);
  (2) none: equal values, a percentage for a fraction, and an offset of the
  label left out are not reported, and the position of a parent of a pipeline
  along evolution is not compared, since the parent is drawn above its children
  (run); (4) give each node its own id.
- wardley-no-duplicate-evolve, wardley-no-duplicate-pipeline,
  wardley-no-duplicate-size, wardley-no-duplicate-evolution: (1) a later
  `evolve` of a node, a later pipeline of a parent, and a later `size` or
  `evolution` replace the earlier one (read in `addTrend`, `startPipeline`, and
  the parser; run); (2) none: equal values are not reported, children are
  compared without their order, and stage boundaries as drawn; (4) write each
  once.
- wardley-no-duplicate-annotations: (1) only the first `annotations` places the
  box, and a later one has no effect (read in the parser; run); (2) none: a
  later one at the first position, and one in a map with no annotation text, are
  not reported; mermaid.js moves a box that runs over the edge inside it, so two
  positions near the edge may give one box, which the document states; (4) write
  one `annotations`.
- wardley-no-ignored-link-label: (1) the label in the arrow replaces the label
  after `;`, which is lost (read in the parser; run); (2) none: an equal label,
  a label of only spaces, and a link that draws nothing are not reported; a
  writer may also add the label after `;` without knowing that the arrow already
  has one, but the label is lost either way, so the rule needs no guess of the
  intent; (4) write one label.
- wardley-no-duplicate-title, wardley-no-duplicate-description,
  wardley-no-empty-description-block: the notes of the pie rules above, since
  wardley reads its titles and descriptions in the same way and draws the title
  (run).

The Event Modeling rules. Searches: "eventmodeling", "eventmodeling accDescr",
"eventmodeling accTitle", "eventmodeling data block", "eventmodeling source
frame", and "eventmodeling duplicate":
[#8288](https://github.com/mermaid-js/mermaid/issues/8288) (closed) and
[#8296](https://github.com/mermaid-js/mermaid/pull/8296) (merged, in the pinned
version) draw the explicit sources of a reset frame;
[#8287](https://github.com/mermaid-js/mermaid/issues/8287) (closed) and
[#8297](https://github.com/mermaid-js/mermaid/pull/8297) (merged, in the pinned
version) reject a frame name written twice;
[#7935](https://github.com/mermaid-js/mermaid/issues/7935) (open) is the last
character of inline data;
[#8290](https://github.com/mermaid-js/mermaid/issues/8290) (open) proposes other
references and arrows; and
[#7588](https://github.com/mermaid-js/mermaid/pull/7588) (merged) adds the
validator, which the public parse does not run.

- eventmodeling-no-undef: (1) a source that names no frame draws no relation,
  and a frame with sources infers none from the frame before it; a data
  reference that names no data block shows no data, or the inline data in place
  of the block (read in `getState` and `calculateTextProps`; run); (2) none: a
  frame or a block declared after counts, names are compared as written, and the
  frames that `note` and `gwt` name are not checked, since mermaid.js draws none
  of them; the sources of a reset frame are checked as those of a time frame,
  since mermaid.js draws a relation from each explicit source that names a frame
  and none from one that names no frame (read in `decidePositionRelation`),
  while a reset frame without sources infers none; a reference beside inline
  data is reported too, since the reference has no effect and names nothing; (4)
  correct the name.
- eventmodeling-no-redefined-data: (1) a frame shows the first data block of the
  name, and a later block of the name is never shown (read in
  `calculateTextProps`; run); (2) none: a name that no frame references and the
  same content are not reported, and the data type is not compared; contents are
  compared as written, comment lines included, since mermaid.js keeps a comment
  line in the value of a block (run), also a later empty block and a difference
  of spaces, since mermaid.js shows the spaces and the lines as written, and
  character references are a limit that the document states; (4) give each
  content its own name.
- eventmodeling-no-duplicate-title, eventmodeling-no-duplicate-description: (1)
  the parser keeps the last `accTitle` and the last `accDescr`, and
  `populateCommonDb` sets them, since mermaid.js keeps the whole statement with
  its keyword, which is never empty (read in the terminals and
  `populateCommonDb`; run); (2) none: an empty earlier text loses nothing, and
  texts are compared by their words, with the shared helper, so the line form
  and the block form of one text are one description, though mermaid.js keeps
  the keyword in the value; a comment line in a block is text of the description
  and is compared with it, so a block of only a comment line sets that line as
  the description: after `accDescr: First`, such a block replaces it and a later
  `accDescr: Second` replaces the block, and both are reported (run); `title` is
  not compared, since mermaid.js does not draw it (run); (4) keep one statement.
- eventmodeling-no-empty-description-block: (1) the block sets the text of the
  statement, as `accDescr {}`, as the description, and removes an earlier one
  (run); (2) none: a block with a comment line in it is not reported: mermaid.js
  keeps the comment line as the text of the description (run), so the block is
  not empty; a comment line between `accDescr` and its `{` is rejected
  (`packages/spec/docs/diagrams/eventmodeling.md`, common statements), so that
  form is no input of the rule, and a comment after the `}` on its line, as
  `accDescr {} %% later`, is a comment and does not prevent a report (run); (4)
  write the description, or remove the block.
- eventmodeling-no-unclosed-description-block: a frame with inline data holds a
  `}` on its line, so a block left unclosed is closed by it and takes the frames
  up to it (run), which the rule reports with the condition of the usecase rule
  and is not enabled for the same reason; the `}` of a data block stands alone
  on its line, and a block that it closes is not reported, which the document
  states. A `{` in a comment line does not count, as in usecase: the author does
  not mean a comment to open what a later `}` closes (`accDescr { first`,
  `%% see {x`, `second }`, and a frame with inline data close at `second }`, and
  the frame is read as written; not reported; run). Unlike usecase, a `}` in a
  comment line closes the block, since the comment line is text of the block
  (`accDescr { first`, `%% note }`, and a frame give the description up to that
  `}`, and the frame is read as written; run); such a block is not reported,
  since nothing after it is taken, and the comment text kept in the description
  is the defect in the table of [adoption-decisions.md](adoption-decisions.md).

The tree view rules. Searches: "treeView", "treeview annotation", "treeview
icon", "treeview accDescr", "treeview description", "treeview trailing
whitespace", and "treeview class":
[#7527](https://github.com/mermaid-js/mermaid/pull/7527) (merged) adds the
annotations and hiding an icon,
[#7840](https://github.com/mermaid-js/mermaid/pull/7840) (merged) resolves icons
with iconify and `defaultIconPack`, and
[#7721](https://github.com/mermaid-js/mermaid/pull/7721) (merged) adds the
box-drawing form.

- treeview-no-duplicate-annotation: (1) a later annotation of a kind replaces
  the earlier one, also on a later line (read in the grammar and in `populate`;
  run); (2) none: the three kinds are separate, an empty earlier description
  loses nothing, and icons are compared as `getNodeIcon` resolves them without
  configuration, so `icon()` and `icon(none)` are one, and `file` is
  `mermaid-treeview:file`; hiding the icon is a value, so an icon after `icon()`
  is reported; the rule reads no configuration, and a name resolved by
  `defaultIconPack` is a limit that the document states; (4) keep one annotation
  of each kind. The name follows the documentation, which calls them
  annotations.
- treeview-no-duplicate-title, treeview-no-duplicate-description,
  treeview-no-empty-description-block: the notes of the pie rules above, since
  the tree view reads its titles and descriptions in the same way (run); `title`
  is not drawn and not compared; the box-drawing characters at the start of a
  line of a block, and a tab on a line that starts with them, are limits that
  the documents state.
- treeview-no-unclosed-description-block: (1) a block without its `}` is read as
  a node whose name is the text of the block, and the description stays empty
  (read in the terminals; run); (2) none: the condition is a bare name that
  starts with `accDescr`, optional spaces or tabs, and `{`, which no ordinary
  name does, so the rule is enabled; a quoted name is not reported; (4) close
  the block.

class-no-inline-comment: when a line of only whitespace follows the comment and
no comment line follows that line, mermaid.js reads the next line apart, as the
author meant, and the rule reports the comment there too (criterion 1). Whether
mermaid.js will change is not settled: a reply in
[#1646](https://github.com/mermaid-js/mermaid/issues/1646) (closed) says a
comment at the end of a line should be supported, and
[#6401](https://github.com/mermaid-js/mermaid/issues/6401) treats the behavior
as intended (criterion 3).
