# prettier-plugin-mmd

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
