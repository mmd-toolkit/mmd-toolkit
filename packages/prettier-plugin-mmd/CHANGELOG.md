# prettier-plugin-mmd

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
