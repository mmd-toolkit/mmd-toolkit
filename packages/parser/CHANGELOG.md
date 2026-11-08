# @mmd-toolkit/parser

## 0.3.1

### Patch Changes

- [#63](https://github.com/mmd-toolkit/mmd-toolkit/pull/63) [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Reject whitespace between the `(` of a `block` arrow's directions and a `,`
  before the first direction, as mermaid.js does: `a<["L"]>( ,x)` is now a syntax
  error.

- [#64](https://github.com/mmd-toolkit/mmd-toolkit/pull/64) [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Rewrite the README for users: it links to the documentation site and gives an
  overview of the API and of the differences from mermaid.js.
- Updated dependencies [[`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d)]:
  - @mmd-toolkit/ast@0.3.1

## 0.3.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [[`e6b2eb3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/e6b2eb3a11064a761d92fb11cd8190ece250e7e9)]:
  - @mmd-toolkit/ast@0.3.0

## 0.2.1

### Patch Changes

- [#54](https://github.com/mmd-toolkit/mmd-toolkit/pull/54) [`7e28e77`](https://github.com/mmd-toolkit/mmd-toolkit/commit/7e28e770d7d6e30c51a4fcf94918b7e46f165116) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Walk deeply nested trees with `traverseNodes()`. It threw a `RangeError` on
  trees nested thousands deep, which `parse()` returns and mermaid.js accepts.

## 0.2.0

### Minor Changes

- [#51](https://github.com/mmd-toolkit/mmd-toolkit/pull/51) [`73b1cf3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/73b1cf3c2e92370094cd7d8c5ab72a2a4f6348d1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Follow mermaid.js 12.3.0. In `flowchart`, an edge id now stops at `[`, `]`, `(`,
  `)`, `{`, `}`, and `|`, so `A[x@]` and `A-->|x@|B` are accepted, and whitespace
  may follow a data block at the end of a statement. `agentflow` keeps its earlier
  rules for both.

## 0.1.1

### Patch Changes

- [#48](https://github.com/mmd-toolkit/mmd-toolkit/pull/48) [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `agentflow` diagrams with deeply nested flows. `parse()` threw a
  `RangeError` on `flow` and `global` bodies nested thousands deep, which
  mermaid.js accepts.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `block` diagrams with deeply nested composites. `parse()` threw a
  `RangeError` on composites nested thousands deep, which mermaid.js accepts.

- [#48](https://github.com/mmd-toolkit/mmd-toolkit/pull/48) [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `c4` diagrams with deeply nested boundaries. `parse()` threw a
  `RangeError` on boundaries nested thousands deep, which mermaid.js accepts.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `class` diagrams with deeply nested namespaces. `parse()` threw a
  `RangeError` on `namespace` bodies nested thousands deep, which mermaid.js
  accepts.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `er` diagrams with deeply nested subgraphs. `parse()` threw a `RangeError`
  on `subgraph` bodies nested thousands deep, which mermaid.js accepts.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `flowchart` diagrams with deeply nested subgraphs. `parse()` threw a
  `RangeError` on `subgraph` bodies nested thousands deep, which mermaid.js
  accepts.

- [#48](https://github.com/mmd-toolkit/mmd-toolkit/pull/48) [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `sequence` diagrams with deeply nested blocks. `parse()` threw a
  `RangeError` on `loop`, `alt`, and the other blocks nested thousands deep, which
  mermaid.js accepts.

- [#50](https://github.com/mmd-toolkit/mmd-toolkit/pull/50) [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Parse `state` diagrams with deeply nested composite states. `parse()` threw a
  `RangeError` on bodies nested more than a thousand deep, which mermaid.js
  accepts.

## 0.1.0

### Minor Changes

- [#1](https://github.com/mmd-toolkit/mmd-toolkit/pull/1) [`c05ce11`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c05ce112065146b267e4735fab1cf2049c037ea6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - First release.
