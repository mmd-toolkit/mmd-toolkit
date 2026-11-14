# @mmd-toolkit/ast

## 0.3.2

No changes in this release.

## 0.3.1

### Patch Changes

- [#64](https://github.com/mmd-toolkit/mmd-toolkit/pull/64) [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Link the documentation site from the README.

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
