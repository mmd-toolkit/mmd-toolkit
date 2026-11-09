# mmdfmt

## 0.2.0

### Minor Changes

- [#74](https://github.com/mmd-toolkit/mmd-toolkit/pull/74) [`665cc68`](https://github.com/mmd-toolkit/mmd-toolkit/commit/665cc68a639586e3f1faba3379edd2d4f06900f6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - List the files that `--write` would change with the new `--list-different`
  (`-l`), as `--check` did until now: `--check` now reports as Prettier's
  `--check` does, with a warning for each file that is not formatted and a
  summary, and can be given with `--write`.

- [#74](https://github.com/mmd-toolkit/mmd-toolkit/pull/74) [`665cc68`](https://github.com/mmd-toolkit/mmd-toolkit/commit/665cc68a639586e3f1faba3379edd2d4f06900f6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Accept `-w` and `-c` for `--write` and `--check`, the forms `--no-write`,
  `--no-check` and `--no-list-different`, `--check` or `--list-different` with
  `--stdin-filepath`, which prints `(stdin)` when the text would change, and
  `--write` with `--stdin-filepath`, which writes no file, as Prettier does.

- [#72](https://github.com/mmd-toolkit/mmd-toolkit/pull/72) [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Read `printWidth` (and `max_line_length` of `.editorconfig`), `tabWidth`,
  `useTabs`, `embeddedLanguageFormatting`, `singleQuote`, `bracketSpacing`,
  `proseWrap`, and `trailingComma` from the Prettier configuration of a file, so
  that they apply to the diagrams as they do with `prettier-plugin-mmd`; `mmdfmt`
  reads no other option. In a code block in a list or a block quote, the width of
  what stands before each line is taken off `printWidth`.

- [#73](https://github.com/mmd-toolkit/mmd-toolkit/pull/73) [`fa284fb`](https://github.com/mmd-toolkit/mmd-toolkit/commit/fa284fb64aa678defa90027a6257f1e6e53e8323) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Add `resolveConfig(fileUrlOrPath)`, which finds the configuration of a file as
  `mmdfmt` does, `format(source, options)`, which given it returns the text that
  `mmdfmt` writes for the file, `clearConfigCache()`, and their types
  `ReadOptions` and `FormatOptions`, so that a tool such as a language server can
  format the diagrams of a file without running the command.

- [#74](https://github.com/mmd-toolkit/mmd-toolkit/pull/74) [`665cc68`](https://github.com/mmd-toolkit/mmd-toolkit/commit/665cc68a639586e3f1faba3379edd2d4f06900f6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print, with `--write`, each file it formats with the time it took, and
  `(unchanged)` after the files it left as they were, as Prettier does. To list
  only the files that changed, as `--write` did until now, give
  `--write --list-different`.

### Patch Changes

- [#74](https://github.com/mmd-toolkit/mmd-toolkit/pull/74) [`665cc68`](https://github.com/mmd-toolkit/mmd-toolkit/commit/665cc68a639586e3f1faba3379edd2d4f06900f6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Report a `printWidth` or `tabWidth` value that Prettier refuses with the value
  that was written also for a diagram in a list or a block quote, where
  `printWidth: "wide"` was reported as `null`. A value such as `"80"` or `true`,
  which Prettier refuses, was taken there until now, and is reported now as for a
  diagram outside a list.

- [#74](https://github.com/mmd-toolkit/mmd-toolkit/pull/74) [`665cc68`](https://github.com/mmd-toolkit/mmd-toolkit/commit/665cc68a639586e3f1faba3379edd2d4f06900f6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Report an invalid value of an option that `mmdfmt` reads from a Prettier
  configuration, such as `printWidth: "wide"`, also for a diagram that mermaid.js
  rejects, where the diagram's syntax error was reported instead.

- [#74](https://github.com/mmd-toolkit/mmd-toolkit/pull/74) [`665cc68`](https://github.com/mmd-toolkit/mmd-toolkit/commit/665cc68a639586e3f1faba3379edd2d4f06900f6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Print the names of files with `/` between their parts also on Windows, as
  Prettier does: `docs\flow.mmd` is now `docs/flow.mmd`.
- Updated dependencies [[`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a), [`a8d4172`](https://github.com/mmd-toolkit/mmd-toolkit/commit/a8d4172fb7f48e1d9c6eb5ff6703a4484c05c58a)]:
  - prettier-plugin-mmd@0.7.0

## 0.1.0

### Minor Changes

- [#67](https://github.com/mmd-toolkit/mmd-toolkit/pull/67) [`63290ca`](https://github.com/mmd-toolkit/mmd-toolkit/commit/63290ca9df618e822adfbcc80e98a673cf5878c6) Thanks [@ota-meshi](https://github.com/ota-meshi)! - Add `mmdfmt`, a command-line tool that formats Mermaid diagrams and nothing
  else: `.mmd` and `.mermaid` files, and the `mermaid` and `mmd` code blocks of
  Markdown files, whose other text stays byte for byte. A diagram that mermaid.js
  rejects is left as written and reported at its line in the text that the run
  leaves. It formats with Prettier and `prettier-plugin-mmd`, so a project can
  format its diagrams without formatting its Markdown with Prettier. It needs
  Node.js 22.13 or later. Its guide is in the formatter section of the
  documentation site.

### Patch Changes

- Updated dependencies [[`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`b817905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/b8179056e2aebd764c260fbd7fee9a65fe27d00d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`626b905`](https://github.com/mmd-toolkit/mmd-toolkit/commit/626b905d546affb973b08d129e42f7e4c8d6810d), [`dd2658b`](https://github.com/mmd-toolkit/mmd-toolkit/commit/dd2658b2c36a1406aeb5c49a922f724820ebb151)]:
  - prettier-plugin-mmd@0.6.0
  - @mmd-toolkit/parser@0.3.1
