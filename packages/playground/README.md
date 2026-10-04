# mmd-toolkit Playground

Japanese version: [README.ja.md](./README.ja.md)

Edit Mermaid text, inspect the syntax tree produced by mmd-toolkit, and preview
Prettier formatting in your browser.

Planned public URL:
[Playground](https://mmd-toolkit.github.io/mmd-toolkit/playground/).

Flowchart, sequence, class and state diagrams are supported. The interface is in
English and is intended for desktop browsers.

## Get started

Choose a sample from **Examples**, or paste your Mermaid text into **Source**.
The parser updates the result as you edit. Source stays editable alongside the
**AST** and **Formatted** tabs.

Use the theme button at the top right to switch between light and dark themes.

## Inspect the syntax tree

The **AST** tab offers Tree and JSON views, plus separate views for Tokens,
Comments, Directives and Frontmatter.

- Click a tree row to select it and expand or collapse its children. The arrow
  toggles expansion without changing the selection.
- Select a node or record to highlight its source range and inspect its details.
- Move the source cursor to select the corresponding node or record. The tree
  opens its path and scrolls to the selected row.
- Use **Show more** to reveal further entries in a long list.

## Preview formatting

Select **Formatted** to see the Prettier result. The preview updates as you edit
Source or change **Indent** and **Use tabs**.

**Apply to source** replaces the source with the preview, using LF line endings.
You can undo the replacement with the editor's normal Undo command. Loading a
sample is also undoable.

## Share an input

Choose **Share**, then **Copy Link**, or copy the displayed URL manually. The
link contains the source and indentation settings, including input that the
parser rejects or does not yet support.

The address bar also updates automatically as you edit. Reloading or opening the
URL restores the saved source and indentation settings.

## Documentation

- [Parser](../parser/README.md): supported syntax, AST fields and compatibility.
- [Formatter](../prettier-plugin-mmd/README.md): formatting behavior and
  options.
- [Development](./docs/development.md): local setup, implementation notes,
  checks and GitHub Pages deployment.
