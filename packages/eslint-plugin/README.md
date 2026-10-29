# @mmd-toolkit/eslint-plugin

Japanese version: [README.ja.md](./README.ja.md)

An [ESLint](https://eslint.org/) language plugin for Mermaid diagrams. It lints
`.mmd` and `.mermaid` files, and `mermaid` and `mmd` code blocks in Markdown.

It reports text that mermaid.js rejects as a parsing error. Its rules report
mistakes that mermaid.js accepts without a word but reads as something other
than what the author most likely meant, such as a `style` statement for an id
that the diagram never defines. It gives ESLint the tree of
[`@mmd-toolkit/parser`](../parser), so the rules read the tree, not the text.

This is a third-party project, not affiliated with mermaid-js. `mmd` here means
the Mermaid diagram syntax, not MultiMarkdown or MikuMikuDance.

## Installation

The package is not published to npm yet. Once it is, install it next to
ESLint 10. It is an ES module and needs Node.js `^20.19.0 || ^22.13.0 || >=24`.

```sh
npm install --save-dev eslint @mmd-toolkit/eslint-plugin
```

## Usage

Add the `recommended` configuration to `eslint.config.js`:

```js
import mmd from "@mmd-toolkit/eslint-plugin"

export default [mmd.configs.recommended]
```

It registers the plugin, applies the Mermaid language to `.mmd` and `.mermaid`
files, and enables the recommended rules as errors. Then run ESLint on the
files:

```sh
npx eslint "**/*.mmd"
```

To change a rule, add a configuration object after it. A later object overrides
the earlier settings for the files that it matches:

```js
import mmd from "@mmd-toolkit/eslint-plugin"

export default [
  mmd.configs.recommended,
  {
    files: ["**/*.mmd", "**/*.mermaid"],
    rules: {
      "@mmd-toolkit/flowchart-no-undef": "warn",
      "@mmd-toolkit/flowchart-no-unclosed-description-block": "error",
    },
  },
]
```

The `recommended` configuration does not enable the second rule.

## Example

In this diagram, `style C fill:red` styles nothing: mermaid.js accepts the
statement and adds a new vertex named `C`, and `A` and `B` stay unstyled.

```mmd
flowchart LR
  A --> B
  style C fill:red
```

ESLint reports it with `@mmd-toolkit/flowchart-no-undef`, which the
`recommended` configuration enables:

```text
diagram.mmd
  3:9  error  mermaid.js adds a new vertex with these styles for the undefined id `C`  @mmd-toolkit/flowchart-no-undef
```

## Mermaid code blocks in Markdown

The processor of [`@eslint/markdown`](https://github.com/eslint/markdown) gives
each code block a file name that ends with its language, such as `0.mermaid`.
The `recommended` configuration matches the `mermaid` and `mmd` blocks, and
ESLint reports at the places of the Markdown file:

```js
import markdown from "@eslint/markdown"
import mmd from "@mmd-toolkit/eslint-plugin"

export default [...markdown.configs.processor, mmd.configs.recommended]
```

A `mermaid` block whose text holds no diagram is reported as a parsing error. A
block with no line between its fences is not reported.

With this processor, one ESLint run checks the code blocks and not the Markdown
text itself. [Linting Markdown](../docs/pages/linter/markdown.md) shows how to
check both.

## Configuration comments

Mermaid comments (`%%` lines) configure ESLint as JavaScript comments do:

```mmd
flowchart LR
  %% eslint-disable-next-line -- the reason
  A --> B
```

`%% eslint-disable`, `%% eslint-enable`, `%% eslint-disable-next-line`, and
`%% eslint <rule>: <config>` are read. A Mermaid comment fills its line, so
`%% eslint-disable-line` applies only to the comment itself. See
[Configuration comments](../docs/pages/linter/comments.md).

## Diagrams and rules

The plugin reads every diagram type of mermaid.js 12.2.0, the version that the
toolkit follows; see [Diagram support](../docs/pages/reference/support.md). It
accepts and rejects the same text as mermaid.js, except for the
[known divergences](../spec/docs/known-divergences.md).

The rules are in two groups, and [docs/rules/index.md](./docs/rules/index.md)
lists them all, with a document for each rule:

- Rules for one diagram type, with the id `@mmd-toolkit/<diagram>-<name>`, such
  as `@mmd-toolkit/flowchart-no-undef`. Every diagram type except `info` and
  Ishikawa has some.
- Rules for every diagram type, with the id `@mmd-toolkit/<name>`, such as
  `@mmd-toolkit/no-unclosed-directive`. They check directives (`%%{ }%%`). The
  `recommended` configuration enables all of them.

In the list, ✅ marks the rules that the `recommended` configuration enables, 🔧
marks the rules that have a fix, and 💡 marks the rules that offer
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).
The notice at the top of the document of a rule shows the same marks.
`eslint --fix` applies fixes; it does not apply suggestions, which you review
and apply in your editor.

## Documentation

- [Linter guide](../docs/pages/linter/index.md): setup and what is checked.
- [Configuration](../docs/pages/linter/configuration.md): choosing rules and
  combining configurations.
- [docs/rules/index.md](./docs/rules/index.md): the rules.
- [docs/development.md](./docs/development.md): how the plugin is built and
  tested.
