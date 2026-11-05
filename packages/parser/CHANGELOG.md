# @mmd-toolkit/parser

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
