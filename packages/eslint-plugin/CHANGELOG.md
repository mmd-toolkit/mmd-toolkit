# @mmd-toolkit/eslint-plugin

## 0.2.2

### Patch Changes

- Updated dependencies [[`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523), [`1620a8f`](https://github.com/mmd-toolkit/mmd-toolkit/commit/1620a8f03f15f82aeb19b2fb7df3266714669c6b), [`8514d3a`](https://github.com/mmd-toolkit/mmd-toolkit/commit/8514d3a11f485a1a7970136b2d0c1004cbdc2523)]:
  - @mmd-toolkit/parser@0.1.1

## 0.2.1

### Patch Changes

- [#29](https://github.com/mmd-toolkit/mmd-toolkit/pull/29) [`e3c5af2`](https://github.com/mmd-toolkit/mmd-toolkit/commit/e3c5af22e5624e0dd121a3c348a46be33620161a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Point rule documentation links to the mmd-toolkit website.

## 0.2.0

### Minor Changes

- [#5](https://github.com/mmd-toolkit/mmd-toolkit/pull/5) [`c587a27`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c587a272129902d6308c7ee62c137ce3c78cfd33) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `no-invalid-init-directive` reports a `'` inside a `"`-quoted string, an
  unescaped `"` inside a `'`-quoted string, and `\'` in the JSON of an init
  directive, each with a fix, because mermaid.js turns every `'` into `"` before
  reading it. Reports of this rule and of `no-duplicate-init-key` point at the
  character or key concerned, and `sequence-no-invalid-json` removes trailing
  commas only when the value is an object.

## 0.1.0

### Minor Changes

- [#1](https://github.com/mmd-toolkit/mmd-toolkit/pull/1) [`c05ce11`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c05ce112065146b267e4735fab1cf2049c037ea6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - First release.

### Patch Changes

- Updated dependencies [[`c05ce11`](https://github.com/mmd-toolkit/mmd-toolkit/commit/c05ce112065146b267e4735fab1cf2049c037ea6)]:
  - @mmd-toolkit/parser@0.1.0
