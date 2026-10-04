# ESLint configuration

`eslint-plugin-mmd` supports ESLint 10's flat configuration. The examples below
configure Mermaid code blocks in Markdown; see [Getting started](./index.md) for
installation.

## Recommended rules and overrides

Create `eslint.config.mjs` in your project root:

```js
import markdown from "@eslint/markdown"
import mmd from "eslint-plugin-mmd"

export default [
  ...markdown.configs.processor,
  mmd.configs.recommended,
  {
    files: ["**/*.mmd", "**/*.mermaid"],
    rules: {
      "mmd/flowchart/no-undef": "warn",
      "mmd/flowchart/no-bare-comment-marker": "error",
    },
  },
]
```

`mmd.configs.recommended` registers the plugin and its Mermaid language, matches
`.mmd` and `.mermaid` files, and enables the recommended rules as errors. The
Markdown processor extracts `mmd` and `mermaid` code blocks with matching file
extensions.

The final configuration object overrides rules for Mermaid diagrams. Here it
changes `mmd/flowchart/no-undef` to a warning and enables
`mmd/flowchart/no-bare-comment-marker`, which the recommended preset does not
enable. Use `"off"` to disable a rule. Later matching configuration objects
override earlier rule settings.

In Markdown, this configuration checks code blocks. See
[Linting Markdown](./markdown.md) for the limitation on also checking the
Markdown content itself.

## Selecting rules without the preset

Register the plugin and language explicitly to enable only the rules you choose:

```js
import markdown from "@eslint/markdown"
import mmd from "eslint-plugin-mmd"

export default [
  ...markdown.configs.processor,
  {
    files: ["**/*.mmd", "**/*.mermaid"],
    plugins: { mmd },
    language: "mmd/mermaid",
    rules: {
      "mmd/flowchart/no-undef": "error",
    },
  },
]
```

`plugins: { mmd }` gives rules their `mmd/` prefix and makes the language
available. `language: "mmd/mermaid"` tells ESLint to parse the matching files as
Mermaid. Syntax checking runs even if no rules are enabled. The Mermaid language
has no plugin-specific `languageOptions`.

Rule ids have two forms:

- `mmd/<name>` for a common rule, such as `mmd/no-unclosed-directive`.
- `mmd/<diagram>/<name>` for a diagram-specific rule, such as
  `mmd/flowchart/no-undef`.

The [rule list](../../../eslint-plugin-mmd/docs/rules/index.md) marks rules
enabled by the recommended preset with ✅ and rules with editor suggestions with
💡. Suggestions are applied by choosing a proposed change in your editor; they
are not automatic fixes for `eslint --fix`.

## Combining language configurations

Keep other languages' rules scoped to their own files. For example, add this
configuration object to check JavaScript files and `js` code blocks:

```js
const javascriptRules = {
  files: ["**/*.{js,mjs,cjs}"],
  rules: {
    "no-console": "error",
  },
}
```

Include `javascriptRules` in the exported configuration array. Its `files`
pattern also matches JavaScript code blocks extracted from Markdown and does not
apply JavaScript rules to Mermaid diagrams. When using another preset, check
which files it matches before combining it with the Mermaid configuration.

## Standalone diagram files

The configurations above also check standalone `.mmd` and `.mermaid` files:

```sh
npx eslint diagram.mmd
```

If you only lint standalone diagrams, `@eslint/markdown` and its processor are
unnecessary; `export default [mmd.configs.recommended]` is sufficient.

Use [configuration comments](./comments.md) for settings inside one diagram.
