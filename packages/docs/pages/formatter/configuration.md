# Prettier configuration

## Project configuration

After [installing Prettier and the plugin](./index.md#installation), register
`prettier-plugin-mmd` in your project's configuration. For example, create
`.prettierrc.json`:

```json
{
  "plugins": ["prettier-plugin-mmd"]
}
```

If your project already has a configuration, add the plugin to its
[`plugins` array](https://prettier.io/docs/plugins#using-plugins). This
configuration loads the plugin for both the CLI and editor integrations.

Prettier [looks for configuration](https://prettier.io/docs/configuration)
starting in the input file's directory and searching its parent directories.

## Select files and run Prettier

To format Mermaid files and Markdown documents throughout your project, run this
command from the project directory:

```sh
npx prettier --write "**/*.{mmd,mermaid,md}"
```

[`--write`](https://prettier.io/docs/cli#--write) updates the selected files.
Quote the pattern so Prettier expands it rather than your shell.

To check formatting without changing files, use
[`--check`](https://prettier.io/docs/cli#--check):

```sh
npx prettier --check "**/*.{mmd,mermaid,md}"
```

Formatting differences produce exit code `1`, so this command can be used in CI.
Use [`.prettierignore`](https://prettier.io/docs/ignore) to exclude files from
formatting and checking.

## Standard input

When reading standard input, supply a file path with
[`--stdin-filepath`](https://prettier.io/docs/cli#--stdin-filepath). Prettier
uses that path to select the parser and find the project's configuration:

```sh
npx prettier --stdin-filepath diagram.mmd < diagram.mmd
```

The formatted text is written to standard output. `--stdin-filepath` does not
write to the named file. For a Markdown document, pass a Markdown path:

```sh
npx prettier --stdin-filepath README.md < README.md
```

When you have no file path, explicitly select the plugin's parser with
[`--parser`](https://prettier.io/docs/options#parser). Run this from the project
directory so Prettier can find the configuration above:

```sh
npx prettier --parser mermaid < diagram.mmd
```

## Use an editor

In VS Code, install the official
[Prettier extension](https://github.com/prettier/prettier-vscode). With the
project's dependencies installed and the plugin registered as above, open a
`.mmd`, `.mermaid`, or Markdown file. Run **Format Document With...** and choose
**Prettier**.

The extension uses your project's Prettier and configuration. Plugins require a
trusted workspace. For default formatter and format-on-save settings, see the
[extension's guide](https://github.com/prettier/prettier-vscode#usage).

## Related pages

- [Options](./options.md): indentation and line endings.
- [Compatibility](../../../prettier-plugin-mmd/docs/compatibility.md):
  formatting guarantees, exceptions, and error handling in Markdown.
