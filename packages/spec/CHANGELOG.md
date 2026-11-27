# @mmd-toolkit/spec

## 0.5.3

### Patch Changes

- [#364](https://github.com/mmd-toolkit/mmd-toolkit/pull/364) [`918b2d3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/918b2d3e6f5ac2a3a6723404fa99288324281932) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Cite fixtures of `accDescr {a} %% c` in `erDiagram`, `flowchart`, and
  `swimlane-beta`, which are rejected, and of `accDescr {a} %%` in `flowchart` and
  `swimlane-beta`, which are accepted: in the comments of `diagrams/er.md`, where
  a `%%` after a unit is no comment, and at the id run of `diagrams/flowchart.md`,
  where the `%%` is the vertex `%%` and a `c` after it is a second vertex on the
  same line.

- [#281](https://github.com/mmd-toolkit/mmd-toolkit/pull/281) [`1c42af9`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1c42af9719afe586b0d963b852bbb579d0bae3b3) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Add the cases of a comment after an `agentflow` name that ends with `end` or
  `global` to the section Shared units and ordered contexts of
  `diagrams/agentflow.md`.

- [#389](https://github.com/mmd-toolkit/mmd-toolkit/pull/389) [`424826a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/424826ae45fd9727c681da56a7f0944519dfa6e7) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Cite more fixtures of trailing whitespace after the `ishikawa` header, in Blank
  lines of `diagrams/ishikawa.md` and in
  `known-divergences/blank-line-after-header-or-comments.md`: an indented root,
  two spaces, a CRLF, a CR, an empty line, a comment line, and a space after a
  directive, which mermaid.js rejects, and a diagram comment or the end of the
  text after the whitespace, which both accept.

- [#395](https://github.com/mmd-toolkit/mmd-toolkit/pull/395) [`040ca26`](https://github.com/mmd-toolkit/mmd-toolkit/commit/040ca267fc7c5c1c17675d697f1eb89ea13777f6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Cite fixtures of comment lines inside a `packet` description block in
  `diagrams/packet.md`: a `%%` right after the opening `{` is text of the
  description, and a `}` on a comment line goes with the comment, so the block is
  closed by a later `}` or, without one, is rejected.

- [#399](https://github.com/mmd-toolkit/mmd-toolkit/pull/399) [`0c11047`](https://github.com/mmd-toolkit/mmd-toolkit/commit/0c1104737705388172c77b1d4d6bd5d14d19ea03) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Cite fixtures of a comment line and a directive line inside a description block
  in a subgraph, in `erDiagram`, `flowchart`, and `swimlane-beta`, in Nodes of
  `ast.md` and in Comment lines of `common.md`: the written text of the
  description leaves out the comment line with its indentation, and the directive
  alone, without the indentation before it.

- [#394](https://github.com/mmd-toolkit/mmd-toolkit/pull/394) [`9961486`](https://github.com/mmd-toolkit/mmd-toolkit/commit/996148657a482bdae074e15a1f0076e133bfe77c) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Say in Indentation and lines of `diagrams/treeview.md` that a space run after a
  quoted name, a class, or an icon becomes the indentation of the next node also
  across empty lines, comment lines, and directive lines, and that with no node
  after it, also after a comment, it reaches the end of the text as indentation
  without a name, which is rejected, and that two such runs do not merge across a
  comment or those lines.

## 0.5.2

### Patch Changes

- [#250](https://github.com/mmd-toolkit/mmd-toolkit/pull/250) [`f6973e7`](https://github.com/mmd-toolkit/mmd-toolkit/commit/f6973e7f135fa1daceff2809c0c90648ae287912) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Cite fixtures of an `agentflow-beta` label that holds only whitespace and
  comments, such as `A[ %% c` followed by a line `]`, also in a pipe label and
  with two comments, and of a comment in a pipe label, in the label comment rules
  of `diagrams/agentflow.md` and in AgentflowLabel of `ast/agentflow.md`: such a
  label is its whitespace, without the comments.

- [#252](https://github.com/mmd-toolkit/mmd-toolkit/pull/252) [`9d68533`](https://github.com/mmd-toolkit/mmd-toolkit/commit/9d68533bacb017b55940f0a4ad129cfba0ed51ee) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Say in Directives inside units of `diagrams/block.md` that a `%%` right after a
  directive is the text of an id, so that `b%%{init: {}}%%%% x` is rejected as a
  directive inside the id `b%%`, which mermaid.js reads as the blocks `b%%` and
  `x`, while `b %%{init: {}}%%%% x` holds the id `%%` and a line
  `%%{init: {}}%%%% x` is a comment line.

## 0.5.1

### Patch Changes

- [#214](https://github.com/mmd-toolkit/mmd-toolkit/pull/214) [`19db290`](https://github.com/mmd-toolkit/mmd-toolkit/commit/19db29066a78881b31bf7c195582ae43c2b2fc1b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Cite the corpus fixture of a colon after the `treemap-beta` header beside the
  one after `treemap`, in the Detection section of `diagrams/treemap.md`, where a
  header colon is rejected.

## 0.5.0

### Minor Changes

- [#95](https://github.com/mmd-toolkit/mmd-toolkit/pull/95) [`c037353`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c037353e31afdc2b8069071afdf00dae3e5281be) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Make a name written without quotes after `style` or `classDef` in
  `requirementDiagram` an `Identifier` node instead of a `RequirementIdentifier`,
  in `names` of `RequirementStyleStatement` and `cssClasses` of
  `RequirementClassDefStatement`, as every other name whose position allows no
  whitespace is (`ast/requirement.md`). An implementation that builds a
  `RequirementIdentifier` there builds an `Identifier` instead.

### Patch Changes

- [#99](https://github.com/mmd-toolkit/mmd-toolkit/pull/99) [`85b6deb`](https://github.com/mmd-toolkit/mmd-toolkit/commit/85b6deb47de8d161a3873a6f106162de833a7f37) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Move every fixture citation out of the sentence it backs, in every document of
  the specification. An implementation finds the fixtures of a sentence in the
  paragraph of citations that follows it, or, for a table row, in its `Fixtures`
  cell.

- [#105](https://github.com/mmd-toolkit/mmd-toolkit/pull/105) [`44a4c19`](https://github.com/mmd-toolkit/mmd-toolkit/commit/44a4c199bd72909b25285ddc3b370ae1d9a51f41) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Put each sentence that only points to another section, such as `See …` or
  `…を参照。`, back right after the sentence it belongs to and before that
  sentence's fixture citations, where moving the citations out of the sentences
  had left it after them.

- [#88](https://github.com/mmd-toolkit/mmd-toolkit/pull/88) [`32f4196`](https://github.com/mmd-toolkit/mmd-toolkit/commit/32f419663a7c1304b17560520d6bbdaf715a3de1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - State which names and texts go on across a comment line after a U+2028 or U+2029
  in them, as the comment lines of `common.md` define, and which end at the U+2028
  instead, in the lexical sections (units, contexts, strings, and comments) of
  every diagram type except `agentflow-beta`, `eventmodeling`, `ishikawa-beta`,
  and `sankey`, in the classes of `quadrantChart`, and in the nodes `ErIdentifier`
  and `QuadrantIdentifier` of the tree: in `stateDiagram`, `X: A`, U+2028, a line
  `%% c`, and a line `B` give X the description `A`, U+2028, `B`, while in
  `block-beta` the id `a` ends at the U+2028. An implementation reads the values
  that go on as one value with the comment line left out, also in the `name` of
  those two nodes.

- [#95](https://github.com/mmd-toolkit/mmd-toolkit/pull/95) [`c037353`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c037353e31afdc2b8069071afdf00dae3e5281be) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Make the shared sentences of `ast.md` and `common.md` on where an unclosed
  directive ends, which quote closes a string, and which node types are named
  `IgnoredText` or `IgnoredStatement` agree with the detailed rules they sum up.
  An implementation that follows the detailed rules needs no change.

## 0.4.0

### Minor Changes

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Reject whitespace between the `(` of a `block` arrow's directions and a `,`
  before the first direction, as mermaid.js does: `a<["L"]>( ,x)` is rejected
  (Block arrows).

### Patch Changes

- [#66](https://github.com/mmd-toolkit/mmd-toolkit/pull/66) [`102b660`](https://github.com/mmd-toolkit/mmd-toolkit/commit/102b660aad8f3b19fef0e2b0022427c121830da9) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Remove the stray spaces after `、` and `。` in the Japanese documents.

- [#64](https://github.com/mmd-toolkit/mmd-toolkit/pull/64) [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Link the Mermaid site from the README.

## 0.3.1

### Patch Changes

- [#59](https://github.com/mmd-toolkit/mmd-toolkit/pull/59) [`4a6be00`](https://github.com/mmd-toolkit/mmd-toolkit/commit/4a6be00cd4dc012d5a75e17540419e6d81eaf4de) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Cite the treemap and treeView fixtures where a directive or an ignored `;` lies
  in the run at the end of a line and the next line is indented.

- [#60](https://github.com/mmd-toolkit/mmd-toolkit/pull/60) [`f41858e`](https://github.com/mmd-toolkit/mmd-toolkit/commit/f41858ef670c82de824f7a0f875b4968abdbf8b8) Thanks [@ota-meshi](https://github.com/ota-meshi)! - State how sequence reads a `-` after an arrow when the destination starts an
  arrow, as in `A ->> -x: b`.

## 0.3.0

### Minor Changes

- [#51](https://github.com/mmd-toolkit/mmd-toolkit/pull/51) [`73b1cf3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/73b1cf3c2e92370094cd7d8c5ab72a2a4f6348d1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Follow mermaid.js 12.3.0. In flowchart, an edge id now stops at `[`, `]`, `(`,
  `)`, `{`, `}`, and `|`, so `A[x@]` and `A-->|x@|B` are accepted, and whitespace
  may follow a data block at the end of a statement. Agentflow keeps its earlier
  rules for both.

## 0.2.0

### Minor Changes

- [#49](https://github.com/mmd-toolkit/mmd-toolkit/pull/49) [`b972b58`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b972b58533d16004b5763e42c2d5cebe14ba625a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `agentflow`, Rejections outside the grammar: the statements in a nested flow or
  a global are no members of the outer flow, and a global and the top level have
  no `hasOwnProperty` member condition. Flows, globals, connectors, and names:
  each `end` closes the innermost open flow or global.

- [#48](https://github.com/mmd-toolkit/mmd-toolkit/pull/48) [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `c4`, Rejections outside the grammar: a boundary is declared by its call, so it
  is a candidate for `UpdateElementStyle` while its body is open, in that body and
  in the bodies nested in it.

### Patch Changes

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `block`, Composites: state what the grammar already decides. Each `end` closes
  the innermost open composite, and what follows it stands in the composite around
  it.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `class`, Namespaces: state what the grammar already decides. Outside a class
  body, each `}` closes the innermost open namespace, items are separated by a
  line break, and what follows a `}` stands in the namespace around it.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `er`, Subgraphs: state what the grammar already decides. What follows an `end`
  stands in the subgraph around it, or in the diagram after the outermost `end`.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `flowchart`, Subgraphs: state what the grammar already decides. Subgraphs nest,
  each `end` closes the innermost open subgraph, and what follows an `end` stands
  in the subgraph around it.

- [#49](https://github.com/mmd-toolkit/mmd-toolkit/pull/49) [`b972b58`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b972b58533d16004b5763e42c2d5cebe14ba625a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `sequence`, Blocks and Rejections outside the grammar: state what the grammar
  and the source order already decide. Blocks and boxes nest, each `end` closes
  the innermost one, a section keyword belongs to the innermost open block, and a
  statement in a block or a section counts once, where it is written.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `state`, Composite states, aliases, and pseudostates: state what the grammar
  already decides. Bodies nest, each `}` unit closes the innermost open body, and
  what follows a `}` stands in the body around it.

## 0.1.0

### Minor Changes

- [#9](https://github.com/mmd-toolkit/mmd-toolkit/pull/9) [`6141704`](https://github.com/mmd-toolkit/mmd-toolkit/commit/61417040d57c59d4f3eca57fd5f8030c54bd6a97) Thanks [@ota-meshi](https://github.com/ota-meshi)! - The specification has versions from this release on. Each version is tagged
  `@mmd-toolkit/spec@<version>` in the repository, and this changelog says what
  changed in the syntax and the tree that it defines, so that an implementation
  can name the version it follows and read what changed since.
