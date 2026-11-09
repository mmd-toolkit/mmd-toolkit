# prettier-plugin-mmd

## 0.7.0

### Minor Changes

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the `,` between the styles of a class `style` or `classDef` that are words
  without a `:` with no space before it and one space after it:
  `style A bold ,italic` becomes `style A bold, italic`.

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Leave out the whitespace after the `{` of a multi-line `accDescr` block, in
  every diagram type that has one: the line `accDescr { ` (a space after the
  brace) is printed `accDescr {`.

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Put the colons of the tasks of a Gantt `section` one space after its longest
  name when some names are padded. `Short   :a1, 2014-01-01, 3d` above
  `Another long task          :a2, after a1, 2d` becomes:
  
  ```mmd
  Short             :a1, 2014-01-01, 3d
  Another long task :a2, after a1, 2d
  ```

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the `@{ ... }` block of a flowchart, agentflow or kanban node on lines of
  its own, one entry on each line, when the block is on one line that is longer
  than `printWidth`. A one-line
  `A@{ shape: rect, label: "A process step with a long label", pos: "t", h: 60, constraint: "on" }`
  becomes:
  
  ```mmd
  A@{
    shape: rect
    label: "A process step with a long label"
    pos: "t"
    h: 60
    constraint: "on"
  }
  ```

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Type `parsers` and `printers` of the plugin with the name `mermaid`, as the
  plugins of Prettier do, so that `parsers.mermaid` and `printers.mermaid` are
  known to exist. Indexing them with a string variable, as in `parsers[name]`, is
  now a type error: index `plugin.parsers?.[name]` of the default export instead.

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a run of spaces or tabs between the words of a `style`, a `classDef`, or a
  `linkStyle` as one space in flowchart, agentflow, class, state, block, usecase,
  ER, requirement, treemap, and venn diagrams, except where CSS reads it as part
  of the value (inside a string, a comment, or `url(`, or the space that ends an
  escape such as `\20 `) or mermaid.js keeps it (inside `rgb(…)` of a venn
  diagram): `style A fill   #f00` becomes `style A fill #f00`, and
  `classDef c stroke-dasharray: 5    5` becomes
  `classDef c stroke-dasharray: 5 5`. A style that starts with a `:`, or whose `:`
  follows an escaped space, is printed like the others: `style A :  red   x`
  becomes `style A : red x`.

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Leave out the whitespace at the end of the line of a flowchart `subgraph` whose
  name has several words, and print the whitespace between the name and a
  directive after it as one space, also in a swimlane diagram: `subgraph S1 S2 `
  becomes `subgraph S1 S2`, and `subgraph S1 S2   %%{init: {}}%%` becomes
  `subgraph S1 S2 %%{init: {}}%%`. A name of one word keeps it, since that
  whitespace changes the id of the subgraph.

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the styles of a treemap `classDef` with no whitespace before the first `:`
  of a style, one space after it, and one space after each `,`, as the other
  diagram types do: `classDef zz fill : #f00   ,stroke:#00f` becomes
  `classDef zz fill: #f00, stroke: #00f`.

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the styles of a usecase `classDef` and `style` with no space before the
  first `:` and one space after it, as in the other diagram types:
  `style A fill   :  red` becomes `style A fill: red`. A name that ends with
  `stroke` keeps a space before the `:` if one was written
  (`classDef c stroke :#d33` becomes `classDef c stroke : #d33`), since mermaid.js
  colours the arrowheads of a relationship from `stroke:` only.

### Patch Changes

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a statement with a multi-line `@{ ... }` block as written under `useTabs`,
  the indentation of its line included, instead of moving the lines of the block
  with spaces to a depth that is right for one width of a tab only. A kanban node,
  the header of an agentflow container, and a statement that is not at the depth
  of the first thing on its line (`subgraph s; A@{`, `B; end; A@{`), or on a line
  that starts with anything but a statement, a header, an `end`, or the `}` of a
  data block, still move the lines with the node.

## 0.6.0

### Minor Changes

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print `:::` without spaces in `class`, `state`, and `kanban`: `A :::c --> B`
  becomes `A:::c --> B`, and `::: hot` becomes `:::hot`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Attach a title bracket, a generic type, or a data block to the name before it in
  `class`, `agentflow`, and `usecase`: `namespace Auth ["x"]` becomes
  `namespace Auth["x"]`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a data block on one line that holds nothing but spaces and tabs, or
  nothing, as `@{ }` in `flowchart`, `agentflow`, `kanban` and `sequence`: `A@{}`
  and `A@{   }` become `A@{ }`. mermaid.js reads an empty mapping for `@{}`,
  `@{   }`, and `@{ }` alike and draws the same figure.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a label of spaces and tabs only as one space in `flowchart` and
  `agentflow`: `A[   ]` becomes `A[ ]`.

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print one space after the comma between the directions of a `block` arrow:
  `a<["L"]>(x,down)` becomes `a<["L"]>(x, down)`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the classifier of a `class` attribute against its text: `+attr string *`
  becomes `+attr string*`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the arguments of a `click` call in `flowchart`, `agentflow`, `class` and
  `gantt` without whitespace at their ends or before a `,`, and with one space
  after it: `click A call f(  "x" ,y )` becomes `click A call f("x", y)`.
  mermaid.js splits the arguments at the `,` outside quotes and trims each part,
  so the function is called with the same arguments. The whitespace inside quotes
  stays. Where the line holds `style` or `classDef`, a `:`, a `#`, and a `;` in
  this order, whether whitespace stands between that `:` and the last `#` stays as
  written: `click A call f(style:x,#b;c)` is unchanged, since mermaid.js drops the
  last `;` of such a line, and a space after the `,` would change which one.

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Format a `flowchart` or `agentflow` `click` statement whose only line breaks are
  inside a string or in the arguments of a call: `click   A "/u"` followed by a
  tooltip over two lines now has one space after `click`.

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print one space after `flow`, `connector`, and `global` in `agentflow`:
  `flow   F["T"]` becomes `flow F["T"]`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a directive in a gap as the gap prints without it, with the space of the
  gap before the directive and the directive touching the unit after it:
  `A%%{init: {}}%%-->B` and `A  %%{init: {}}%%  --> B` become
  `A %%{init: {}}%%--> B`, and `note%%{init: {}}%% for A "t"` becomes
  `note %%{init: {}}%%for A "t"`. A `;` that mermaid.js ignores in the same gap
  stays against the unit before it. A directive at the start or the end of a line,
  and one in a line that holds `style` or `classDef`, a `:`, a `#`, and a `;` in
  this order (mermaid.js drops the last `;` of such a line), keep whether the gap
  holds whitespace, a run becoming one space. A gap with a U+2028 or U+2029 keeps
  the whitespace written, and so do the gaps of `kanban`, `mindmap`, `treemap` and
  `ishikawa`, where that whitespace is indentation, apart from the directives at
  the end of a text.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the directives that end a text in one form, whatever the whitespace at the
  end of the line: `title T  %%{init: {}}%%  %%{init: {}}%%  ` becomes
  `title T %%{init: {}}%% %%{init: {}}%%`. This holds for the `title`, the
  `accTitle:` line, and the `accDescr:` line of every diagram type, for a node of
  `ishikawa`, `mindmap`, and `treeview`, for a card of `kanban`, and for the
  `dateFormat` and `axisFormat` of `gantt`, the last event of a line of
  `timeline`, and the second description of an alias in `stateDiagram`.

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print empty call parentheses without spaces in `flowchart`, `agentflow`,
  `class`, and `gantt`: `click A call f( )` becomes `click A call f()`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Format a statement that holds a `;` in `architecture`, `c4`, `cynefin`,
  `eventmodeling`, `gitgraph`, `info`, `packet`, `pie`, `radar`, `treemap`,
  `treeview`, `usecase` and `venn` like any other statement, keeping only the
  whitespace that decides which `;` mermaid.js ignores: `commit msg:"style:#x;"`
  becomes `commit msg: "style:#x;"`. A statement over several lines is joined
  unless joining would change which `;` is ignored, and the whitespace beside an
  ignored `;` follows the rule of its gap: `complex "style:#x";"A"` becomes
  `complex "style:#x"; "A"` in `cynefin`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the text of an `ishikawa` node, and the name and the description of a
  `treeview` node, without the spaces and tabs at the end of the line: `R   `
  becomes `R`, and `R ## note  ` becomes `R ## note`. mermaid.js trims these texts
  and draws the same figure. The inside of a quoted name and a description of
  spaces and tabs only stay as written.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a `title` in `gantt`, `journey`, `timeline`, `sequence`, `venn` and `c4`,
  the `accDescription` of a `c4`, and the `dateFormat` and `axisFormat` of a
  `gantt`, without the whitespace at the start and at the end of the text:
  `title   Plan  ` becomes `title Plan`. The last event of a line of a `timeline`
  and the second description of an alias in a `stateDiagram` lose the whitespace
  at their end in the same way. mermaid.js draws both the same. The name of a
  `section` keeps its whitespace, since two sections whose names differ by it are
  two sections, and so do a `tickInterval`, a `todayMarker`, and a `dateFormat` of
  `D`, which are drawn differently with whitespace around them.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Decide each line break of a statement on its own in `sequence`, `class`,
  `block`, `er`, `gantt`, `journey`, `quadrant`, `timeline` and `xychart`: a line
  break next to a comment or a directive, or one that joining would change what
  mermaid.js reads, stays, and the others become whitespace. In a `sequence`,
  `autonumber` with a space at the end of its line, and `5` on the next line,
  become `autonumber 5`. A statement that keeps a line break keeps its styles as
  written.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the text of a `mindmap` node, the text of its shape, its icon, and its
  class without the spaces and tabs at their ends: `a (x)` becomes `a(x)`,
  `b[ y ]` becomes `b[y]`, and `::icon( fa )` becomes `::icon(fa)`. The same holds
  for the cards, labels, icons and classes of a `kanban` board, but not for the id
  of a column, which mermaid.js tells apart from another by its text. mermaid.js
  draws the same node. An icon, a class, or a shape text of spaces and tabs only
  becomes one space, since the grammar rejects an empty one. A string, a text that
  would start a string without its padding, and a text over lines stay as written.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print one space between a keyword and the text or string after it in `quadrant`,
  `sequence`, `state`, and `class`: `x-axisUrgent --> Not Urgent` becomes
  `x-axis Urgent --> Not Urgent`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print one space between the header of a `flowchart` or an `agentflow` and a
  direction written as a symbol: `graph<` becomes `graph <`.

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print one space outside `<<...>>` and none inside it in `class` and `usecase`:
  `class S<< i >>` becomes `class S <<i>>`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the spellings that mermaid.js reads the same and draws the same in the
  form that the examples in its documentation use at least twice as often as any
  other, unless a version of mermaid.js reads or draws that form differently. A
  keyword is printed in the case of the examples (`PARTICIPANT A` becomes
  `participant A`), except `style` and `classDef`, which stay as written because
  mermaid.js reads a line with them in another case differently when a `;` ends
  it. A string between `'` is printed between `"` in the ten diagram types that
  read both (`'a'` becomes `"a"`), and a number of a pie chart, an xychart, a
  treemap, a radar chart, a sankey diagram, and a Venn diagram is printed in the
  shortest form (`1.50` becomes `1.5`). The words of an ER relationship become
  symbols (`A only one to zero or more B` becomes `A ||--o{ B`), `Rel_Up`,
  `Rel_Down`, `Rel_Left`, and `Rel_Right` of a C4 diagram become `Rel_U`, `Rel_D`,
  `Rel_L`, and `Rel_R`, `::=` of the EBNF notation of a railroad diagram becomes
  `=`, a range of a packet diagram with equal ends (`4-4`) becomes the position
  (`4`), and `switch` of a gitGraph becomes `checkout`. The colon after the header
  of a cynefin or a radar diagram is removed. The direction `TD` of an agentflow
  or swimlane header becomes `TB` (not when a directive stands between the header
  and the direction), and the label of a link is printed between the arrows in an
  agentflow diagram (`A -->|x| B` becomes `A -- x --> B`) and between `|` in a
  swimlane diagram. The names of a header, the direction of a flowchart header,
  and the colon after the header of a gitGraph stay as written, since versions of
  mermaid.js read or draw them differently. A spelling that the examples do not
  use in one form, or that changes what mermaid.js reads, stays as written, and so
  do the `direction` statements. The option `singleQuote` has no effect on these
  strings.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the `:` and the text of a one-line `note` in `stateDiagram` with one space
  before the `:` and one after it where mermaid.js drops them:
  `note right of A: x` becomes `note right of A : x`. mermaid.js reads the same
  text and draws the same note. A note whose first two characters after the id are
  not a `:` and a space or a tab stays as written.
  
  Keep the text between the quotes of a floating `note` in `stateDiagram` as
  written, whitespace included, as the inside of a quoted label in `flowchart` is:
  `note "  a  " as N` stays.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the styles of `style`, `classDef` and `linkStyle` in `flowchart`,
  `agentflow`, `class`, `state` and `block` as `ER` and `requirement` print them,
  with one space after the first `:` of a style and after each `,`, and none
  before them: `style A fill:#f9f,stroke:[#333](https://github.com/mmd-toolkit/mmd-toolkit/issues/333)` becomes
  `style A fill: #f9f, stroke: [#333](https://github.com/mmd-toolkit/mmd-toolkit/issues/333)`. The spacing stays as written where
  whitespace decides what mermaid.js reads: whether a space follows the `,` before
  a `fill` or a `stroke:` style of a `linkStyle`, and a `stroke:` with no value
  there, the whitespace between `stroke` and its `:` in a `classDef` or a
  `linkStyle` of `flowchart` and `agentflow`, a backslash in a style, and the
  `color:` and `text-align:` of a `block` `style`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a run of spaces and tabs inside a title, an `accDescr`, and the labels
  that mermaid.js draws as SVG text (the texts of a C4 statement, the strings of a
  `railroad` diagram, and others) as one space: `title Sales   report` becomes
  `title Sales report`, and `quadrant-1 a    b` becomes `quadrant-1 a b`. These
  keep their runs: the labels that it draws as HTML (the nodes and edges of
  `flowchart` and `agentflow`, the descriptions, transitions, and notes of
  `stateDiagram`, the nodes of `mindmap`, the cards of `kanban`, the labels of a
  `class` relation, and every text of `usecase`), the title of a subgraph or a
  `flow` that wraps (a markdown title, a group with a data block, a `swimlane`
  lane), an `accTitle`, the arguments of a C4 statement that are not a label, a
  technology, a type, or a description, the names that other statements refer to,
  a text of spaces and tabs only that is not a string, a text over several lines
  or with a comment, a directive, or a U+2028 or U+2029, and a text with a `<` or
  in a diagram that holds `white-space`.

- [#68](https://github.com/mmd-toolkit/mmd-toolkit/pull/68) [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print one space between the `##` of a `treeview` description and its text:
  `R ##   note` and `R ##note` become `R ## note`.

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Remove the spaces just inside the brackets of titles and labels, including the
  edge labels of `architecture` and the closing `|` of a quoted edge label:
  `subgraph foo[ T ]` becomes `subgraph foo[T]`, and `A["x" ]` becomes `A["x"]`.

### Patch Changes

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Keep the arguments of a call as written in `class` and `gantt` when a comment
  line stands in them, so that formatting no longer changes what mermaid.js reads.

- [#64](https://github.com/mmd-toolkit/mmd-toolkit/pull/64) [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Rewrite the README for users: it links to the documentation site, and one list
  leads to the formatting rules of each diagram type.
- Updated dependencies [[`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d)]:
  - @mmd-toolkit/ast@0.3.1
  - @mmd-toolkit/parser@0.3.1

## 0.5.0

### Minor Changes

- [#58](https://github.com/mmd-toolkit/mmd-toolkit/pull/58) [`1f30d00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1f30d0065688ed391e4af58353532282b8070dda) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Align comment lines in `treemap` and `treeview` with the next row, as in
  `ishikawa`, `kanban`, and `mindmap`. They used to stay at column one. A bare
  `%%` stays at column one, because mermaid.js rejects it indented.

- [#60](https://github.com/mmd-toolkit/mmd-toolkit/pull/60) [`f41858e`](https://github.com/mmd-toolkit/mmd-toolkit/commit/f41858ef670c82de824f7a0f875b4968abdbf8b8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Attach a title to its name in `flowchart`, `agentflow`, `er`, and `usecase`:
  `subgraph S [t]` now prints as `subgraph S[t]`, `flow F [T]` as `flow F[T]`, and
  `systemBoundary S (t)` as `systemBoundary S(t)`, as a node writes `A[t]`.
  mermaid.js reads the same diagram either way.

- [#59](https://github.com/mmd-toolkit/mmd-toolkit/pull/59) [`4a6be00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/4a6be00cd4dc012d5a75e17540419e6d81eaf4de) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Attach a sequence participant's `@{ ... }` data block to its id.
  `participant A @{ "type": "queue" }` now prints as
  `participant A@{ "type": "queue" }`, the form in the Mermaid documentation.
  mermaid.js reads the same diagram either way. A directive, U+2028, or U+2029
  between the id and the block keeps the whitespace as written.

- [#58](https://github.com/mmd-toolkit/mmd-toolkit/pull/58) [`1f30d00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1f30d0065688ed391e4af58353532282b8070dda) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Drop the `;` at the end of `classDef` and `style` lines in `class`, `state`,
  `er`, `requirement`, `block`, `venn`, and `usecase`, as in `flowchart`, when
  mermaid.js reads the line the same without it. A `;` that is part of the value,
  as in `style A fill:red;` in `requirement`, stays.

- [#59](https://github.com/mmd-toolkit/mmd-toolkit/pull/59) [`4a6be00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/4a6be00cd4dc012d5a75e17540419e6d81eaf4de) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Drop the `;` that ends a `classDef` line in `treemap`, as in the other diagram
  types. `classDef important fill:#f96;` now prints as
  `classDef important fill:#f96`. The `;` stays where it is needed: after a
  `classDef` without a style, whose next line would become the style, before
  another statement on the same line, and where mermaid.js reads it as part of an
  entity, as in `fill: #f00;`.

- [#58](https://github.com/mmd-toolkit/mmd-toolkit/pull/58) [`1f30d00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1f30d0065688ed391e4af58353532282b8070dda) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Move multi-line data blocks with their statements. In `flowchart`, `agentflow`,
  `kanban`, and `sequence`, the lines of a `@{ ... }` that opens at the end of a
  line now stand one step inside the statement, with a `}` on its own line at the
  level of the statement, and the same holds for `json` tables in `usecase`. They
  used to stay at the columns where they were written. mermaid.js reads the lines
  and what stands before the `}`, so the differences between the lines stay,
  spaces indent them also with `useTabs`, and a block that moving would make
  mermaid.js read differently stays as written.

- [#59](https://github.com/mmd-toolkit/mmd-toolkit/pull/59) [`4a6be00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/4a6be00cd4dc012d5a75e17540419e6d81eaf4de) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a one-line `@{ ... }` with one space inside each end in `flowchart`,
  `agentflow`, `kanban`, and `sequence`. `A@{shape: rect}` now prints as
  `A@{ shape: rect }`. mermaid.js reads the same data either way. A block that
  touches another block, holds a directive, holds only whitespace, or starts with
  a YAML document marker stays as written, and so do the JSON tables of `usecase`,
  whose braces are part of the JSON.

- [#60](https://github.com/mmd-toolkit/mmd-toolkit/pull/60) [`f41858e`](https://github.com/mmd-toolkit/mmd-toolkit/commit/f41858ef670c82de824f7a0f875b4968abdbf8b8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print a one-line `accDescr { ... }` with one space inside each end, as a
  one-line `@{ ... }` already is: `accDescr {a b}` now prints as
  `accDescr { a b }`. A block that holds a comment, a directive, or a `;` gets no
  added space, nor does a block on a line kept as written, and the blocks of
  `eventmodeling`, whose Db holds the written characters, stay as written.

- [#60](https://github.com/mmd-toolkit/mmd-toolkit/pull/60) [`f41858e`](https://github.com/mmd-toolkit/mmd-toolkit/commit/f41858ef670c82de824f7a0f875b4968abdbf8b8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the ids of a `state` `class` statement and the names of a `class` diagram
  `classDef` statement without whitespace around their commas: `class A, B c` now
  prints as `class A,B c`. In `state`, whitespace before a comma ends the ids, so
  it stays as written.

- [#60](https://github.com/mmd-toolkit/mmd-toolkit/pull/60) [`f41858e`](https://github.com/mmd-toolkit/mmd-toolkit/commit/f41858ef670c82de824f7a0f875b4968abdbf8b8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the punctuation of a `sequence` message or note one way. `+`, `-`, and
  `()` touch the participant, as in `A ->> +B` and `A() ->> ()B`, and the comma of
  a note touches both ids, as in `Note over A,B`. mermaid.js reads the same
  diagram either way. Whitespace around a directive stays as written, and so does
  the space in `A ->> - x`, where `-x` would be read as an arrow.

### Patch Changes

- [#59](https://github.com/mmd-toolkit/mmd-toolkit/pull/59) [`4a6be00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/4a6be00cd4dc012d5a75e17540419e6d81eaf4de) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Fix output that mermaid.js rejected in `treemap` and `treeview`. Where a `;`
  stays and whitespace follows it, as in `classDef zz a:b; %% c`, that whitespace
  indents the next row, and it was printed together with the indentation of the
  row, which mermaid.js reads as a second indentation. It now moves to the row
  once, so the comment or directive touches the `;`.

- [#62](https://github.com/mmd-toolkit/mmd-toolkit/pull/62) [`e6b2eb3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/e6b2eb3a11064a761d92fb11cd8190ece250e7e9) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Move the types of the tree to the new package `@mmd-toolkit/ast`, an optional
  peer dependency of `@mmd-toolkit/parser`, so that installing the formatter or
  the linter no longer downloads them. `@mmd-toolkit/parser` no longer exports
  these types: TypeScript code imports them from `@mmd-toolkit/ast`, installed at
  the same version or a later patch. The declarations of
  `@mmd-toolkit/eslint-plugin` and `prettier-plugin-mmd` read that package too, as
  an optional peer dependency, so a type check of their configuration without
  `skipLibCheck` needs it installed.
  
  The plugins now depend on `@mmd-toolkit/parser` with a caret range, so that the
  formatter and the linter share one parser while both ask for the same minor.
- Updated dependencies [[`e6b2eb3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/e6b2eb3a11064a761d92fb11cd8190ece250e7e9)]:
  - @mmd-toolkit/ast@0.3.0
  - @mmd-toolkit/parser@0.3.0

## 0.4.1

### Patch Changes

- Updated dependencies [[`7e28e77`](https://github.com/mmd-toolkit/mmd-toolkit/commit/7e28e770d7d6e30c51a4fcf94918b7e46f165116)]:
  - @mmd-toolkit/parser@0.2.1

## 0.4.0

### Minor Changes

- [#51](https://github.com/mmd-toolkit/mmd-toolkit/pull/51) [`73b1cf3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/73b1cf3c2e92370094cd7d8c5ab72a2a4f6348d1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Follow mermaid.js 12.3.0. In `flowchart`, `A[ user@example.com ]` is now
  formatted as `A[user@example.com]`, because `A[x@]` is accepted and reads the
  same; `agentflow` still keeps the space. An edge id that starts like an arrow,
  as in `A[x]--a@-->B`, stays attached to the shape before it, so that formatting
  no longer turns it into link text. In `agentflow`, an edge id after a data
  block, as in `A@{ shape: rect }e1@-->B`, stays attached to the block, so that
  the output is no longer rejected.

### Patch Changes

- Updated dependencies [[`73b1cf3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/73b1cf3c2e92370094cd7d8c5ab72a2a4f6348d1)]:
  - @mmd-toolkit/parser@0.2.0

## 0.3.0

### Minor Changes

- [#44](https://github.com/mmd-toolkit/mmd-toolkit/pull/44) [`8ffabbe`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8ffabbe4c14f96eed4f2a054b411b79f17933476) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Normalize indentation of safely formatted `eventmodeling` data and note bodies,
  single-paragraph bodies in `state` notes, and ordinary `accDescr` bodies while
  preserving meaningful text and rendering. Align structural continuations around
  comments and directives, and put spaces around `=` in C4 named attributes so the
  key/value boundary is easier to read.
  
  Clarify block header indentation, keep comment-bearing list and grammar
  alternatives readable, normalize method and supported style boundaries, and
  format ordinary Wardley names containing `style` instead of preserving their
  spacing.
  
  Keep wrapped GWT source-frame names inside their header, and align the trimmed
  first line of state note bodies even when they contain HTML or Markdown. Align
  all eligible paragraph lines, including inline emphasis, same-line code and
  inline `<br/>`, while preserving blank rows at their edges and margins that
  affect block rendering.

### Patch Changes

- Updated dependencies [[`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523)]:
  - @mmd-toolkit/parser@0.1.1

## 0.2.0

### Minor Changes

- [#11](https://github.com/mmd-toolkit/mmd-toolkit/pull/11) [`32a7e4c`](https://github.com/mmd-toolkit/mmd-toolkit/commit/32a7e4cb9b642a55dd6b853cdc83d62b98d4a424) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Lay out composite `railroad-beta` calls on nested lines while keeping plain
  quoted leaves compact and comments readable. Improve `eventmodeling` top-level
  layouts and block-body indentation where rendering is preserved, and align
  `timeline` continuation events and description blocks.

## 0.1.0

### Minor Changes

- [#1](https://github.com/mmd-toolkit/mmd-toolkit/pull/1) [`c05ce11`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c05ce112065146b267e4735fab1cf2049c037ea6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - First release.

### Patch Changes

- Updated dependencies [[`c05ce11`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c05ce112065146b267e4735fab1cf2049c037ea6)]:
  - @mmd-toolkit/parser@0.1.0
