# @mmd-toolkit/spec

## 0.4.1

### Patch Changes

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
