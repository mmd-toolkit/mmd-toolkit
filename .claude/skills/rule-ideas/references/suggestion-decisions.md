# The suggestions and fixes of each rule (records)

The edits that each rule offers, decided with section 8 of
[SKILL.md](../SKILL.md), and which edits are fixes. A criterion named by its
number here is one of section 8 of SKILL.md, and the conditions of each kind of
edit are under The kinds of edits there. Section 8 of SKILL.md says how to
search them.

## The rules

Each rule below offers the edits named with it, under the conditions of its kind
in The kinds of edits of section 8 of SKILL.md; a rule named with none offers
nothing.

- The `<diagram>-no-duplicate-description` and `<diagram>-no-duplicate-title`
  rules of agentflow, architecture, cynefin, er, eventmodeling, flowchart,
  gantt, gitgraph, journey, packet, pie, quadrant, radar, railroad, requirement,
  sequence, state, timeline, treemap, treeview, usecase, venn (title only), and
  wardley: remove this statement; remove the statement before it. May make
  visible: the same rule at a later statement that a statement without text hid
  (`title First`, `title`, and `title Third`; run).
- The `<diagram>-no-empty-description-block` rules of agentflow, architecture,
  cynefin, er, eventmodeling, flowchart, gantt, gitgraph, journey, packet, pie,
  quadrant, radar, railroad, requirement, sequence, state, timeline, treemap,
  treeview, usecase, and wardley: remove the empty block.
- The `<diagram>-no-unclosed-description-block` rules of agentflow, flowchart,
  sequence, state, and xychart: close at the end of the text. Those of er,
  eventmodeling, radar, requirement, treeview, and usecase: none (criterion 3:
  the only closing would give back lines; in treeview, where the block becomes a
  node, closing the name would give back lines too).
- class: none for class-no-duplicate-description, class-no-duplicate-title,
  class-no-bare-class-name, class-no-ignored-text, and
  class-no-unclosed-backquote. In class, a comment after other text on its line
  takes the line break in mermaid.js (the known divergence
  `comment-takes-line-break`), so after such a line, any edit changes the line
  that mermaid.js joins to it (`A %%`, then `B`, is accepted; with `class `
  written before `B`, it is rejected; run), and keeping an edit right would need
  a check of that divergence; the split at a `;` and the closing of a backquoted
  name give back lines (criterion 3). class-no-inline-comment moves the comment
  to a line of its own (all its invalid fixtures are then read as with the
  comment line removed; run); it needs no such check, because a comment after
  other text on the line before is reported by the same rule and moved in the
  same pass. class-no-redefined-class gets none: the likely fix is a new id for
  one of the two classes (criterion 1, as for flowchart-no-redefined-vertex).
  class-no-undef gets none: the text does not show which class was meant.
- c4: none for c4-no-duplicate-description, c4-no-duplicate-title, and
  c4-no-invalid-attribute-key, for the reason of class (comment-takes-line-break
  holds in c4 as well). c4-no-duplicate-style gets none: an argument in a place
  cannot be removed without moving the others, and an empty one gives the empty
  value. c4-no-redefined-element gets none: a declaration also gives other
  values. c4-no-useless-argument and c4-no-undef get none.
- xychart: none for xychart-no-duplicate-description,
  xychart-no-duplicate-title, and xychart-no-empty-description-block. Removing a
  line takes away one line terminator after an axis statement, which changes the
  state of the lexer of mermaid.js, so that it may reject a title that it
  accepted (the known divergence `title-digit-after-axis-statement`: after
  `x-axis A; line [1]`, `title B`, and `title Q1`, removing `title B` is
  rejected, and after `x-axis A; line [1]; line [2]`, `accDescr: a`,
  `accDescr: b`, and `title Q1`, removing the line `accDescr: a` or
  `accDescr: b` is rejected, also with `bar [2]`; run); which results are
  rejected is decided by steps of that lexer that the specification does not
  state. xychart-no-invalid-orientation writes the orientation in lower case
  (run). xychart-no-extra-value gets none: the categories meant for the extra
  values are not in the text. xychart-no-redefined-axis gets none: a statement
  may set only some parts of the axis, so removing either changes parts that the
  other does not set.
- flowchart: flowchart-no-ignored-text gets none (criterion 3: the split gives
  back lines). flowchart-no-redefined-vertex gets none: the likely fix is a new
  id (criterion 1). flowchart-no-undef gets none: which id was meant is not
  known (criterion 1). flowchart-no-redefined-subgraph gets none: the likely fix
  is one title or another id (criterion 1). flowchart-no-spaced-stroke and
  agentflow-no-spaced-stroke remove the whitespace before the `:` of `stroke`
  (run), only when no `stroke` stands after it in the styles of any link that it
  reaches, which no fix changes; otherwise the arrowhead of such a link would
  take this colour while its line takes the later one (run), and no edit is
  offered. Nor is one offered where mermaid.js leaves a `;` out of the style, as
  in `classDef hot stroke :#f00;fill:none`, whose one style is
  `stroke :#f00fill:none`: without the whitespace it is `stroke:#f00fill:none`,
  which colours neither the line nor the arrowhead, as before (run), so the edit
  would only silence the rule (criterion 2). A directive inside the style stays
  where it is: the edit removes the whitespace between the name and the `:` and
  keeps a directive that stands between them, so
  `linkStyle 0 stroke %%{init: {}}%%:#f00` becomes
  `linkStyle 0 stroke%%{init: {}}%%:#f00`, and a directive in the name or in the
  value, as in `s%%{init: {}}%%troke :#f00` and `stroke :#f%%{init: {}}%%00`, is
  left as it is; each result gives the arrowhead the colour of the line (run,
  flowchart and agentflow). Where no text `stroke:` stands before the style in
  the styles of a link, the edit gives the arrowhead of that link the colour of
  its line in place of the colour of the theme (run:
  `linkStyle 0 stroke :#f00`); elsewhere, including where no link takes the
  style, it changes nothing that is drawn (run: `stroke:#00f,stroke :#f00`). The
  edit is a fix (listed under Fixes) on the premise that the author did not mean
  the arrowhead to keep the colour of the theme, which rests on two facts: in
  the styles of a link, the form that the documentation of mermaid.js shows
  gives the arrowhead the colour of the line (run:
  `linkStyle 0 stroke:#ff3,stroke-width:4px,color:red;`, the example of the
  documentation on the first link), so a coloured line with an arrowhead in the
  colour of the theme is written there only in a form that the documentation
  does not show, such as this one; and the rule document says to turn the rule
  off where the form is written on purpose.
- flowchart, agentflow, and usecase: the three
  `<diagram>-no-duplicate-direction` rules remove this statement or the one
  whose direction it differs from (in flowchart, in a later subgraph of an id,
  the last one of the first subgraph); a direction statement with other text on
  its line is not removed, since the text would go with it. A later subgraph of
  an id loses its direction also when the first has none (run). Removing one may
  make visible a later statement that gave the same direction (`direction LR`,
  `direction TD`, `direction TB`; run). agentflow-no-ignored-text gets none
  (criterion 3). agentflow-no-redefined-vertex,
  agentflow-no-redefined-connector, and agentflow-no-redefined-flow get none:
  the likely fix is a new id for one of the two elements or flows (criterion 1).
  usecase-no-duplicate-metadata removes this property or the one before it, as
  venn-no-duplicate-style does (run). Fixture: `actor A`, then
  `A@{ type: hollow }`, `A@{ type: hollow }`, and `A@{ type: awesome }`
  (removing the third offered; removing the second none, since the first
  `hollow` would still be replaced; run: accepted by the parser and by
  mermaid.js; an actor takes `normal`, `hollow`, or `awesome`,
  `packages/spec/docs/diagrams/usecase.md`). usecase-no-redefined-class removes
  this `classDef` or the one before it, not a statement that defines other
  classes too (run). agentflow-no-undef gets none.
- sequence: sequence-no-ignored-text joins a line of only `)`s, with nothing
  between them, to the end of the text after a `:` that ends the line right
  before it, when that text holds at least as many `(`s that no `)` after them
  closes (`A ->> B: call(x`, then `)`, gives the message `call(x)`; run). It
  does not remove the character: the text does not show that the author meant
  nothing there. sequence-no-invalid-json removes each `,` outside a string that
  only whitespace separates from a `}` or `]` after it, when the text before a
  `#` then is a JSON object (run). sequence-no-link-without-separator inserts
  `@` and a space before the last word, when the text holds two or more words
  and the last one holds `://` (run). sequence-no-create-destroy gets none: the
  text does not show at which message the participant was meant to be destroyed,
  and `create A` without `participant` is rejected (run).
- state: state-no-ignored-text inserts a space after the `:` of a note written
  on one line, as the documentation of mermaid.js writes it
  (`note left of A:hi`; run); its other texts get none (the split at a `;` gives
  back lines). state-no-undef gets none, for the reason of class-no-undef.
- er: er-no-ignored-text gets none (criterion 3). er-no-redefined-entity gets
  none: the likely fix is a new name for one of the two entities (criterion 1).
  er-no-undef gets none, for the reason of class-no-undef.
- gantt: gantt-no-duplicate-setting removes this statement or the one of the
  same setting before it (mermaid.js uses the last value for the whole chart;
  run). gantt-no-invalid-tag writes the words of a start of two items in lower
  case, separated by `,` (`b : done crit, 1d` gets the tags and lasts one day;
  run); not for the start of three items, where the tag would have to move
  before the id, nor for an end. gantt-no-unknown-exclude writes the word of
  which the item, of three letters or more, is the start (`weekend`, `sat`;
  run); `weekdays` gets none. gantt-no-duplicate-id gets none: the id meant for
  one of the tasks is not in the text, and removing an id changes which task the
  references name. gantt-no-undef gets none.
- journey: journey-no-empty-person removes the empty person with a comma next to
  it, or, when every person is empty, the colon before the people with them, not
  when the task has text after a third colon (that text would become the people;
  run). journey-no-invalid-score writes `: ` after a score from 1 to 5 followed
  by whitespace or a `,` and more text, when the task has no people and the rest
  does not start with `%%` or a keyword that starts a statement
  (`A: 5 accDescr {}` would get the person `accDescr {}`; run).
  journey-no-ignored-text writes `,` for each colon from the third on, outside
  directives, when no part is empty (run).
- requirement: requirement-no-duplicate-field removes this field or the first
  one of the same kind, whose value mermaid.js keeps, the second only when the
  rule then no longer reports this field (`id: 1`, `id: 2`, `id: 3`; run);
  removing the first may make visible a later field with its value.
  requirement-no-ignored-text gets none (criterion 3).
  requirement-no-duplicate-name gets none: the text does not show whether one
  requirement or two were meant, and removing either statement loses what it
  holds, its classes included. requirement-no-undef gets none.
- mindmap: mindmap-no-duplicate-decoration removes this line or the line of the
  same kind before it on the node (run). mindmap-no-mismatched-shape writes the
  closer of the opener, or the opener of the closer, which is not offered for
  `-)` (each pair is drawn as its shape; run).
- sankey: sankey-no-invalid-value writes the number for `Infinity` in another
  case, digits divided by `_`, a hexadecimal integer with `0x`, and a decimal
  `,` that does not stand before three digits (`"1,234"` may separate thousands;
  run). sankey-no-empty-node gets none.
- treemap: treemap-no-invalid-value writes the number for digits divided by `_`
  and a decimal `,` that does not stand before three digits, as
  sankey-no-invalid-value does (run).
- quadrant: quadrant-no-duplicate-style removes this style or the one of the
  same name before it in the list, with a `,` next to it;
  quadrant-no-redefined-class and quadrant-no-redefined-quadrant remove this
  statement or the one before it (run). quadrant-no-invalid-color writes `#`
  before the value (run), but not when a `;` follows the value, directly or with
  only directives between (`color: f00%%{init: {}}%%;`), where `#f00;` would be
  read as a character reference and the input rejected (run, both). A directive
  inside the style stays where it is, and the `#` goes directly before the first
  character of the value: `color: f%%{init: {}}%%00`,
  `color: %%{init: {}}%%f00`, and `co%%{init: {}}%%lor: f00` become
  `color: #f%%{init: {}}%%00`, `color: %%{init: {}}%%#f00`, and
  `co%%{init: {}}%%lor: #f00`, which draw the point in that colour (run).
  quadrant-no-invalid-coordinate writes `.` for a decimal `,` (run). A
  coordinate with a `,` is always `0`, the `,`, and digits
  (`packages/spec/docs/diagrams/quadrant.md`, the coordinate: `1,5` is
  rejected), so the result is always a number from 0 to 1 and the edit needs no
  condition. Fixture: `A: [0,3, 0,6]` (offered for both coordinates).
  quadrant-no-redefined-axis gets none, for the reason of
  xychart-no-redefined-axis. quadrant-no-undef gets none.
- block: block-no-duplicate-columns and block-no-redefined-style remove this
  statement or the one before it (run). block-no-edge-chain splits the chain
  into edges of one link, each on a line of its own that starts with the id of
  the block before the link (run). block-no-edge-in-composite-head moves a
  single link after the `end`, as `G --> B` (run); a head with more links gets
  none, since the moved links would be a chain. block-no-invalid-direction
  writes a direction without its whitespace (run); a reported direction is
  already in lower case, because a direction in upper case is rejected
  (`packages/spec/docs/diagrams/block.md`, block arrows). Fixture: `( left )`
  (offered, `(left)`). block-no-mismatched-edge writes the opening arrow with
  the line of the arrow after the label, or that arrow with the line of the
  opening one, and moves an arrowhead at the start of the opening arrow to the
  arrow after the label (run). block-no-mismatched-shape writes the closing of
  the opening (run). The openings `[/` and `[\` have two closings each: `/]` and
  `\]` close `[/` as a lean right shape and as a trapezoid, and `\]` and `/]`
  close `[\` as a lean left shape and as an inverted trapezoid. For these two
  openings, it offers both closings, each with a message that names the closing
  it writes (``Close with `/]`.``, ``Close with `\]`.``): both are shapes the
  author may have meant, and the text decides neither. Fixtures: the reported
  forms `block/db-closer-slash-open-with-bracket` and
  `block/db-closer-backslash-open-with-bracket`, and the results
  `block/db-shape-lean-right`, `block/db-shape-trapezoid`,
  `block/db-shape-lean-left`, and `block/db-shape-inv-trapezoid`.
  block-no-spaced-class-id removes the whitespace around the commas of the ids,
  also after a directive there (run). block-no-useless-width removes the width,
  or moves it to the first declaration of the block on its own when no other
  edge writes a width for the block (otherwise the other edge would be reported;
  run). block-no-duplicate-block and block-no-undef get none.
- kanban: kanban-no-duplicate-section gets none: one column or two with
  different ids is not decided by the text.
- venn: venn-no-duplicate-style removes this property or the one before it of
  the same target, with a `,` next to it, or with its statement when it is the
  only property (run). venn-no-invalid-style-key writes the name in lower case
  when that is one of the five; venn-no-duplicate-style may then report it
  (run). venn-no-ignored-text gets none: written with a space before the
  comment, the character is read and rejected (`set A: %% c`; run), and removing
  it loses what the author wrote. venn-no-duplicate-subset and venn-no-undef get
  none.
- architecture: architecture-no-reversed-marker writes the markers as mermaid.js
  draws them, `>` before the line as `<` and `<` after it as `>` (run).
  architecture-no-ungrouped-modifier removes `{group}` (run); declaring the
  service in a group would need the name of the group.
- cynefin, gitgraph, radar, treeview, wardley: cynefin-no-redefined-domain,
  gitgraph-no-duplicate-option, radar-no-duplicate-option,
  treeview-no-duplicate-annotation, and wardley-no-duplicate-annotations,
  wardley-no-duplicate-evolution, wardley-no-duplicate-evolve, and
  wardley-no-duplicate-size remove this statement, option, or annotation or the
  one before it whose value it replaces (the first one where mermaid.js keeps
  the first: wardley-no-duplicate-annotations). The specification names the
  results that are rejected, and those edits are not offered. In gitgraph, the
  effective `id:` and `parent:` of a `merge` or a `cherry-pick` decide
  rejections (the table of rejections in
  `packages/spec/docs/diagrams/gitgraph.md`: a merge id that names a commit, an
  unknown cherry-pick source, a parent that is no immediate parent), so the
  removal of an `id:` or a `parent:` option of those two statements is not
  offered, while that of a `type:` option and every option of `commit` is
  (`cherry-pick id: "missing" id: "B"` without `id: "B"` is rejected; run). In
  wardley, only the coordinates of the first `annotations` are checked
  (`packages/spec/docs/diagrams/wardley.md`: a value at most 1 is multiplied by
  100, and a result below 0 or above 100 is rejected), so removing the first
  `annotations` is offered only when the coordinates of the next one pass that
  check (an annotations position outside the map left first is rejected; run).
  Fixtures: an `id:` and a `type:` repeated in a `merge`, and an `id:` repeated
  in a `cherry-pick` (the `type:` offered, the `id:` none); a later
  `annotations` inside the map and one outside it (offered and none). Removing a
  radar option may make visible a reversed range that it hid (`min 10, max 5`,
  then `min 0`; run). radar-no-reversed-range exchanges the values of the last
  `min` and `max` (run). wardley-no-ignored-link-label removes the label after
  `;` or the label in the arrow (`+>` is accepted; run).
  radar-no-mismatched-entry-count, radar-no-undef, gitgraph-no-redefined-commit,
  wardley-no-duplicate-pipeline (a pipeline also declares its children),
  wardley-no-redefined-node (a declaration also gives other values), and
  wardley-no-undef get none.
- pie, radar, and eventmodeling: pie-no-duplicate-label,
  radar-no-duplicate-entry, and eventmodeling-no-redefined-data get none: the
  likely fix is a new label, the name of another axis, or a new name (criterion
  1). eventmodeling-no-undef gets none.
- The common rules: no-unclosed-directive gets none (criterion 3: closing the
  directive gives back the lines that it took). no-invalid-init-directive writes
  `\u0027` for each reported `'` and `\'`, writes `\"` for each reported `"`,
  and removes each reported trailing comma (the reports in its notes in
  [recommended-decisions.md](recommended-decisions.md); the steps run in Node);
  and writes in lower case a name that ends with `init` or `initialize` only in
  another case when the directive has no argument, a word argument, or JSON that
  mermaid.js reads, with no error in its structure, no trailing comma, and no
  quote that breaks it: mermaid.js reads no JSON from a missing or a word
  argument (read in
  [`directiveRegex`](https://github.com/mermaid-js/mermaid/blob/2086904e76c692331e34a45d7cc3bc30860d040e/packages/mermaid/src/diagram-api/regexes.ts#L12-L13)),
  and with broken JSON the lower case would leave mermaid.js reading no settings
  from the directive (run). no-duplicate-init-key removes this member or the one
  of the same key before it (run).

## Fixes

- These edits are fixes. Each writes what the text already spells in the form
  that mermaid.js reads (the same word in the case that it reads, the same
  number, the separator or the space that the author left out, the same
  statements on lines of their own), and each is decided by its own statement:
  - block-no-invalid-direction (the direction without its whitespace),
    block-no-spaced-class-id (the whitespace around the commas removed), and
    block-no-edge-chain (the chain split into edges of one link);
  - class-no-inline-comment (the comment on a line of its own);
  - gantt-no-invalid-tag, gantt-no-unknown-exclude (only one word of `excludes`
    starts with the item), quadrant-no-invalid-color (the `#`),
    quadrant-no-invalid-coordinate, and xychart-no-invalid-orientation;
  - flowchart-no-spaced-stroke and agentflow-no-spaced-stroke (the whitespace
    before the `:` removed);
  - no-invalid-init-directive (all three edits), sequence-no-invalid-json,
    sequence-no-ignored-text, sequence-no-link-without-separator, and
    state-no-ignored-text (the space after the `:` of a note);
  - sankey-no-invalid-value and treemap-no-invalid-value for `Infinity` in
    another case (sankey), digits divided by `_`, and a hexadecimal integer with
    `0x` (sankey);
  - venn-no-invalid-style-key when no other property of the same target, in any
    statement, sets the same attribute (a name in any case). This condition only
    withholds: no fix writes a new name of an attribute, so another fix cannot
    make it wrong.
- These edits are suggestions, for the reason given with each:
  - removing this statement, option, or part, or the one before it (every rule
    with the two removals): the text does not show which of the two values the
    author meant to keep, and where only this one may go, keeping the earlier
    value is a guess as well;
  - removing an empty block (the `<diagram>-no-empty-description-block` rules)
    and journey-no-empty-person: an empty block or an empty person may be a
    place left to be filled, and the text does not show that the author meant
    nothing there;
  - closing a block at the end of the text: the text does not show where the
    block was meant to end, and the lines after it, kept as its text, may have
    been meant as statements;
  - block-no-mismatched-shape, block-no-mismatched-edge, and
    mindmap-no-mismatched-shape: the text does not show which of the two
    brackets or arrows is the mistake;
  - block-no-useless-width: removing the width loses what the author wrote, and
    where to move it is a choice;
  - wardley-no-ignored-link-label: the text does not show which of the two
    labels was meant;
  - block-no-edge-in-composite-head: an edge places the blocks that it declares
    where it stands, so moving it after the `end` may move them;
  - architecture-no-reversed-marker: it keeps the drawing and changes the text,
    while the author may have meant the direction that the text shows;
  - architecture-no-ungrouped-modifier: removing `{group}` loses the grouping
    that the author meant, which needs the name of a group;
  - radar-no-reversed-range: one of the two numbers may be the mistake instead
    of their order;
  - journey-no-ignored-text: a colon from the third on may belong to the name of
    a person (`Meet at 10:30`);
  - journey-no-invalid-score: the text after the score may belong to the task
    (`Write: 2 drafts` would get the person `drafts`);
  - sankey-no-invalid-value and treemap-no-invalid-value for a decimal `,`:
    `1,5` may be 1.5 or 15;
  - venn-no-invalid-style-key where another property sets the same attribute:
    the edit changes which value mermaid.js uses, which the text does not show
    that the author meant.
