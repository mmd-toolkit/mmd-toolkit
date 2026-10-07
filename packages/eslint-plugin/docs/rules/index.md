# Rules

Japanese version: [index.ja.md](./index.ja.md)

The rules of `@mmd-toolkit/eslint-plugin`, an ESLint language plugin for Mermaid
diagram text built on `@mmd-toolkit/parser`, with one document for each rule.

The `recommended` configuration enables the rules marked ✅ in the list below:
their reports are nearly always mistakes to fix.

## Rule ids

A rule id starts with `@mmd-toolkit`, the namespace of the plugin. A common
rule, one for every diagram type, has the id `@mmd-toolkit/<name>`; a rule of a
diagram type has the id `@mmd-toolkit/<diagram>-<name>`. The rules of
`flowchart` apply to `flowchart-v2`, `flowchart-elk`, and `swimlane`.

<!-- begin auto-generated rules list -->

✅ The `recommended` configuration enables the rule.

💡 Manually fixable by
[editor suggestions](https://eslint.org/docs/latest/use/core-concepts#rule-suggestions).

🚧 The rule is not implemented yet: it reports nothing.

## Common rules

| Rule                                                        | Description                                                                  | ✅  | 💡  | 🚧  |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | --- | --- | --- |
| [no-ignored-init-directive](./no-ignored-init-directive.md) | Disallow a directive meant to configure the diagram that mermaid.js ignores. |     |     | 🚧  |
| [no-unclosed-directive](./no-unclosed-directive.md)         | Disallow a directive without its closing `}%%`.                              |     |     |     |

## flowchart

| Rule                                                                                    | Description                                                                                          | ✅  | 💡  | 🚧  |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --- | --- | --- |
| [flowchart-no-bare-comment-marker](./flowchart-no-bare-comment-marker.md)               | Disallow a line that holds only `%%`.                                                                |     | 💡  |     |
| [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.                                    | ✅  | 💡  |     |
| [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)                       | Disallow an `accTitle` statement that sets the title again.                                          | ✅  | 💡  |     |
| [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                                              | ✅  | 💡  |     |
| [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)                             | Disallow text on a direction line that mermaid.js does not read.                                     | ✅  | 💡  |     |
| [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.md)                     | Disallow writing the shape or the label of a vertex again, differently.                              | ✅  |     |     |
| [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md) | Disallow an `accDescr {` block without its closing `}`.                                              | ✅  | 💡  |     |
| [flowchart-no-undef](./flowchart-no-undef.md)                                           | Disallow a `style`, `class`, or `click` statement that names an id that the diagram does not define. | ✅  |     |     |

## sequence

| Rule                                                                            | Description                                                                   | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [sequence-no-create-destroy](./sequence-no-create-destroy.md)                   | Disallow `create` before `destroy`.                                           |     |     | 🚧  |
| [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)     | Disallow an `accDescr` statement that sets the description again.             |     |     | 🚧  |
| [sequence-no-duplicate-title](./sequence-no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again.         |     |     | 🚧  |
| [sequence-no-empty-description-block](./sequence-no-empty-description-block.md) | Disallow an `accDescr` block that holds no description.                       |     |     | 🚧  |
| [sequence-no-ignored-text](./sequence-no-ignored-text.md)                       | Disallow a line that mermaid.js reads as nothing.                             |     |     | 🚧  |
| [sequence-no-invalid-json](./sequence-no-invalid-json.md)                       | Disallow a `links` or `properties` statement whose text is not a JSON object. |     |     | 🚧  |
| [sequence-no-link-without-separator](./sequence-no-link-without-separator.md)   | Disallow a `link` statement without the `@` between its label and its URL.    |     |     | 🚧  |

## class

| Rule                                                                  | Description                                                                   | ✅  | 💡  | 🚧  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [class-no-bare-class-name](./class-no-bare-class-name.md)             | Disallow a class name alone on its line, which changes nothing.               |     |     | 🚧  |
| [class-no-duplicate-description](./class-no-duplicate-description.md) | Disallow an `accDescr` statement that sets the description again.             |     |     | 🚧  |
| [class-no-duplicate-title](./class-no-duplicate-title.md)             | Disallow an `accTitle` statement that sets the title again.                   |     |     | 🚧  |
| [class-no-ignored-text](./class-no-ignored-text.md)                   | Disallow text that mermaid.js does not read.                                  |     |     | 🚧  |
| [class-no-inline-comment](./class-no-inline-comment.md)               | Disallow a comment after other text on its line.                              |     |     | 🚧  |
| [class-no-redefined-class](./class-no-redefined-class.md)             | Disallow writing the label of a class again, differently.                     |     |     | 🚧  |
| [class-no-unclosed-backquote](./class-no-unclosed-backquote.md)       | Disallow a backquoted class name without its closing backquote.               |     |     | 🚧  |
| [class-no-undef](./class-no-undef.md)                                 | Disallow a statement that refers to a class that the diagram does not define. |     |     | 🚧  |

<!-- end auto-generated rules list -->
