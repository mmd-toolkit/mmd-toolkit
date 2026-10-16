# Formatter

`prettier-plugin-mmd` formats Mermaid diagram text with Prettier. Use it for
`.mmd` and `.mermaid` files and Mermaid code blocks in Markdown.

You can try formatting
[online in the Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/)
without installing anything. The **Formatted** tab updates as you edit the
input.

## Installation

Install Prettier and the plugin in your project:

```sh
npm install --save-dev prettier@3 prettier-plugin-mmd
```

## Format your first diagram

Save this input as `diagram.mmd`:

```mmd
flowchart LR
  A --> B; B --> C; C --> D
  subgraph S; E; F; end
```

Load the plugin with
[`--plugin`](https://prettier.io/docs/plugins#using-plugins) and run Prettier
with [`--write`](https://prettier.io/docs/cli#--write) to update the file:

```sh
npx prettier --plugin prettier-plugin-mmd --write diagram.mmd
```

The result puts each statement on its own line and indents the subgraph:

```mmd
flowchart LR
  A --> B
  B --> C
  C --> D
  subgraph S
    E
    F
  end
```

The plugin also formats Mermaid code blocks in Markdown:

```sh
npx prettier --plugin prettier-plugin-mmd --write README.md
```

## Supported inputs

- Standalone files ending in `.mmd` or `.mermaid`.
- Markdown fenced code blocks marked with the language `mermaid` or `mmd`.
  Matching is case-sensitive: `Mermaid` does not match.

If the plugin reports a syntax error, the CLI leaves the file unchanged. In
Markdown, the affected code block is left to Prettier's usual Markdown
formatting.

[Compatibility](../../../prettier-plugin-mmd/docs/compatibility.md) explains the
known differences from mermaid.js and the limits of the formatting guarantees.

## Next steps

- [Configuration](./configuration.md): plugin registration, file selection, CLI
  usage, and editor setup.
- [Options](./options.md): indentation and line endings.
- [Formatting rules](./formatting/index.md): common and diagram-specific
  formatting rules.
