# @mmd-toolkit/eslint-plugin

Japanese version: [README.ja.md](./README.ja.md)

An [ESLint](https://eslint.org/) language plugin for
[Mermaid](https://mermaid.js.org/) diagrams. It lints `.mmd` and `.mermaid`
files, and `mermaid` and `mmd` code blocks in Markdown.

It reports text that mermaid.js rejects as a parsing error. Its rules report
mistakes that mermaid.js accepts without a word but reads as something other
than what the author most likely meant, such as a `style` statement for an id
that the diagram never defines.

This is a third-party project, not affiliated with
[mermaid-js](https://mermaid.js.org/). `mmd` here means the Mermaid diagram
syntax, not MultiMarkdown or MikuMikuDance.

Try lint diagnostics, automatic fixes, and editor suggestions in
[ESLint Online Playground](https://eslint-online-playground.netlify.app/#@mmd-toolkit/eslint-plugin).

Documentation: [Linter](https://mmd-toolkit.github.io/mmd-toolkit/linter/).

## Installation

Install the package next to ESLint 10. It is an ES module and needs Node.js
`^20.19.0 || ^22.13.0 || >=24`.

```sh
npm install --save-dev eslint @mmd-toolkit/eslint-plugin
```

When TypeScript checks `eslint.config.ts` with `skipLibCheck` off, also install
[`@mmd-toolkit/ast`](../ast), the types of the tree.

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
text itself.
[Linting Markdown](https://mmd-toolkit.github.io/mmd-toolkit/linter/markdown.html)
shows how to check both.

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
[Configuration comments](https://mmd-toolkit.github.io/mmd-toolkit/linter/comments.html).

## Diagrams and rules

The plugin reads every diagram type of mermaid.js 12.3.0, the version that the
toolkit follows; see
[Diagram support](https://mmd-toolkit.github.io/mmd-toolkit/reference/support.html).
It accepts and rejects the same text as mermaid.js, except for the
[known divergences](../spec/docs/known-divergences.md).

The rules are in two groups, and the
[list of rules](https://mmd-toolkit.github.io/mmd-toolkit/linter/rules/) has
them all, with a document for each rule:

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

- [Linter guide](https://mmd-toolkit.github.io/mmd-toolkit/linter/): setup and
  what is checked.
- [Configuration](https://mmd-toolkit.github.io/mmd-toolkit/linter/configuration.html):
  choosing rules and combining configurations.
- [Rules](https://mmd-toolkit.github.io/mmd-toolkit/linter/rules/): what each
  rule reports, with examples.
- [docs/development.md](./docs/development.md): how the plugin is built and
  tested, for people who work on it.
