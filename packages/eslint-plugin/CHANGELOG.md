# @mmd-toolkit/eslint-plugin

## 0.5.1

### Patch Changes

- Updated dependencies:
  - [@mmd-toolkit/parser@0.4.1](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.4.1)
  - [@mmd-toolkit/ast@0.4.1](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fast%400.4.1)

## 0.5.0

### Minor Changes

- [#82](https://github.com/mmd-toolkit/mmd-toolkit/pull/82) [`7c25dfb`](https://github.com/mmd-toolkit/mmd-toolkit/commit/7c25dfb066f3cb57b60753bddd9ca4cf1aaa8236) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Report a vertex written again in a later `subgraph` or `flow`, which does not
  get it, also when one label is in quotes and the other is not, as `A["x"]` after
  `A[x]`, in `flowchart-no-redefined-vertex` and `agentflow-no-redefined-vertex`.

### Patch Changes

- [#82](https://github.com/mmd-toolkit/mmd-toolkit/pull/82) [`7c25dfb`](https://github.com/mmd-toolkit/mmd-toolkit/commit/7c25dfb066f3cb57b60753bddd9ca4cf1aaa8236) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Fix `agentflow-no-redefined-vertex` after a `connector` declaration: its title
  is plain text even when written as markdown, so `C["API"]` in a later `flow`
  after ``connector C["`API`"]`` is now reported, and ``C["`API`"]`` is not.
- Updated dependencies:
  - [@mmd-toolkit/parser@0.4.0](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.4.0)
  - [@mmd-toolkit/ast@0.4.0](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fast%400.4.0)

## 0.4.0

### Minor Changes

- [#71](https://github.com/mmd-toolkit/mmd-toolkit/pull/71) [`e3072f6`](https://github.com/mmd-toolkit/mmd-toolkit/commit/e3072f69acf8774766bb51eab514a3d3ab43eb12) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Add `quadrant-no-invalid-color`, which reports a `color` or `stroke-color`
  written without `#` (`color: f00`, which browsers do not read) and adds the `#`
  with a fix. It is in `recommended`.

- [#71](https://github.com/mmd-toolkit/mmd-toolkit/pull/71) [`e3072f6`](https://github.com/mmd-toolkit/mmd-toolkit/commit/e3072f69acf8774766bb51eab514a3d3ab43eb12) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Add `flowchart-no-spaced-stroke` and `agentflow-no-spaced-stroke`, which report
  whitespace before the `:` of a `stroke` style (`linkStyle 0 stroke :#f00`), a
  form that the mermaid.js documentation does not show and that mermaid.js does
  not read for the colour of an arrowhead. They remove the whitespace with a fix
  unless that would give a link's arrowhead and line different colours, and they
  are not in `recommended`.

### Patch Changes

- [#64](https://github.com/mmd-toolkit/mmd-toolkit/pull/64) [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Link the pages of the documentation site from the README.
- Updated dependencies:
  - [@mmd-toolkit/ast@0.3.1](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fast%400.3.1)
  - [@mmd-toolkit/parser@0.3.1](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.3.1)

## 0.3.2

### Patch Changes

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
- Updated dependencies:
  - [@mmd-toolkit/ast@0.3.0](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fast%400.3.0)
  - [@mmd-toolkit/parser@0.3.0](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.3.0)

## 0.3.1

### Patch Changes

- Updated dependencies:
  - [@mmd-toolkit/parser@0.2.1](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.2.1)

## 0.3.0

### Minor Changes

- [#51](https://github.com/mmd-toolkit/mmd-toolkit/pull/51) [`73b1cf3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/73b1cf3c2e92370094cd7d8c5ab72a2a4f6348d1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - `flowchart-no-redefined-vertex` and `agentflow-no-redefined-vertex` now also
  report a vertex written in a later subgraph or flow that does not get it,
  because an earlier one already has it, when the statement has no link, class, or
  data block and says nothing new about the vertex.
  `agentflow-no-redefined-connector` reports a connector declaration in a later
  flow in the same way.

- [#51](https://github.com/mmd-toolkit/mmd-toolkit/pull/51) [`73b1cf3`](https://github.com/mmd-toolkit/mmd-toolkit/commit/73b1cf3c2e92370094cd7d8c5ab72a2a4f6348d1) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Follow mermaid.js 12.3.0, which draws the agentflow shape `[/…/]` as its own
  shape instead of a rounded rectangle. `agentflow-no-redefined-vertex` now
  reports `C[/API/]` written after `connector C[API]` as replacing the shape of
  `C`, and its messages and those of `agentflow-no-redefined-connector` name the
  drawn shape where they named the kind.

### Patch Changes

- Updated dependencies:
  - [@mmd-toolkit/parser@0.2.0](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.2.0)

## 0.2.2

### Patch Changes

- Updated dependencies:
  - [@mmd-toolkit/parser@0.1.1](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.1.1)

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

- Updated dependencies:
  - [@mmd-toolkit/parser@0.1.0](https://github.com/mmd-toolkit/mmd-toolkit/releases/tag/%40mmd-toolkit%2Fparser%400.1.0)
