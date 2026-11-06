# prettier-plugin-mmd

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
