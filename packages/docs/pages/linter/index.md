# Linter

`@mmd-toolkit/eslint-plugin` uses ESLint to report syntax errors and mistakes in
Mermaid diagram text.

## Installation and setup

Install ESLint 10, the plugin, and `@eslint/markdown` in your project:

```sh
npm install --save-dev eslint@10 @mmd-toolkit/eslint-plugin @eslint/markdown
```

Create an [ESLint configuration file][eslint-config] named `eslint.config.mjs`
in the project root:

```js
import markdown from "@eslint/markdown"
import mmdToolkit from "@mmd-toolkit/eslint-plugin"

export default [...markdown.configs.processor, mmdToolkit.configs.recommended]
```

`@eslint/markdown` extracts code blocks from Markdown files for ESLint to check.
`mmdToolkit.configs.recommended` registers the plugin, selects the Mermaid
language for `.mmd` and `.mermaid` files, and enables the plugin's recommended
rules as errors. This also matches `mmd` and `mermaid` code blocks extracted by
the Markdown processor.

This setup checks the code blocks only. The Markdown content itself is outside
its scope; see [Linting Markdown](./markdown.md) for the limitation on checking
both in one ESLint run.

## Lint your first diagram

Save this diagram in a `mermaid` code block in `diagram.md`. The `%% eslint`
comment explicitly enables [`@mmd-toolkit/flowchart-no-undef`][no-undef] for
this diagram:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  style C fill:red
```

Run ESLint:

```sh
npx eslint diagram.md
```

`@mmd-toolkit/flowchart-no-undef` reports `C` in `style C fill:red`. Mermaid
accepts this input and adds a new vertex named `C`; it does not apply the style
to `A` or `B`.

To style `A`, change the id in the `style` statement:

```mmd
%% eslint @mmd-toolkit/flowchart-no-undef: error
flowchart LR
  A --> B
  style A fill:red
```

This input produces no reports with the configuration above.

## What gets checked

The plugin checks syntax before running rules. If it cannot parse the diagram,
ESLint reports a parsing error. Rules check accepted input for particular
mistakes; their reports include the rule id, as in the example above.

Syntax checking uses the same parser as the other tools. See
[diagram support](../reference/support.md) for the supported syntax. Each rule's
documentation explains which diagrams and mistakes it checks.

Some rules have fixes, which `eslint --fix` applies.

Some rules offer [editor suggestions][suggestions]. Review the proposed changes
and choose which one to apply in your editor. Suggestions are not applied by
`eslint --fix`.

## Next steps

- [Configuration](./configuration.md): choose rules, configure errors and
  warnings, and combine Mermaid linting with other ESLint configurations.
- [Markdown](./markdown.md): lint Mermaid code blocks in Markdown files.
- [Configuration comments](./comments.md): configure rules inside a diagram with
  `%%` comments.
- [Rules](../../../eslint-plugin/docs/rules/index.md): rule descriptions,
  applicability, and examples.

[eslint-config]:
  https://eslint.org/docs/latest/use/configure/configuration-files
[no-undef]: ../../../eslint-plugin/docs/rules/flowchart-no-undef.md
[suggestions]: https://eslint.org/docs/latest/use/core-concepts#rule-suggestions
