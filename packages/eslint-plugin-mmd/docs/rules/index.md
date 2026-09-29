# Rules

Japanese version: [index.ja.md](./index.ja.md)

The rules of `eslint-plugin-mmd`, an ESLint language plugin for Mermaid diagram
text built on `@mmd-toolkit/parser`, with one document for each rule. Only
[no-unclosed-directive](./no-unclosed-directive.md) is implemented so far.

## Rule ids

A rule id starts with `mmd`, the namespace of the plugin. A rule is either
common to every diagram type or belongs to one diagram type.

- A common rule has the id `mmd/<name>`, and its document is in this directory.
- A rule of a diagram type has the id `mmd/<diagram>/<name>`, and its document
  is in the directory `<diagram>/`. The directory is named after the document of
  `@mmd-toolkit/spec` that defines the nodes of the diagram type
  (`docs/ast/<diagram>.md`), and its rules apply to every diagram type whose
  tree that document defines: the rules in `flowchart/` apply to `flowchart-v2`,
  `flowchart-elk`, and `swimlane`.

<!-- begin auto-generated rules list -->

✅ The `recommended` configuration enables the rule.

## Common rules

| Rule                                                        | Description                                                                  | ✅  |
| ----------------------------------------------------------- | ---------------------------------------------------------------------------- | --- |
| [no-ignored-init-directive](./no-ignored-init-directive.md) | Disallow a directive meant to configure the diagram that mermaid.js ignores. |     |
| [no-unclosed-directive](./no-unclosed-directive.md)         | Disallow a directive without its closing `}%%`.                              |     |

## flowchart

| Rule                                                                          | Description                                                             | ✅  |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- | --- |
| [no-bare-comment-marker](./flowchart/no-bare-comment-marker.md)               | Disallow a line that holds only `%%`.                                   |     |
| [no-duplicate-description](./flowchart/no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.       |     |
| [no-duplicate-title](./flowchart/no-duplicate-title.md)                       | Disallow an `accTitle` statement that sets the title again.             |     |
| [no-empty-description-block](./flowchart/no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                 |     |
| [no-ignored-text](./flowchart/no-ignored-text.md)                             | Disallow text on a direction line that mermaid.js does not read.        |     |
| [no-redefined-vertex](./flowchart/no-redefined-vertex.md)                     | Disallow writing the shape or the label of a vertex again, differently. |     |
| [no-style-unknown-id](./flowchart/no-style-unknown-id.md)                     | Disallow a `style` statement whose id names no vertex and no subgraph.  |     |
| [no-unclosed-description-block](./flowchart/no-unclosed-description-block.md) | Disallow an `accDescr {` block without its closing `}`.                 |     |

## sequence

| Rule                                                                   | Description                                                                   | ✅  |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- |
| [no-create-destroy](./sequence/no-create-destroy.md)                   | Disallow `create` before `destroy`.                                           |     |
| [no-duplicate-description](./sequence/no-duplicate-description.md)     | Disallow an `accDescr` statement that sets the description again.             |     |
| [no-duplicate-title](./sequence/no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again.         |     |
| [no-empty-description-block](./sequence/no-empty-description-block.md) | Disallow an `accDescr` block that holds no description.                       |     |
| [no-ignored-text](./sequence/no-ignored-text.md)                       | Disallow a line that mermaid.js reads as nothing.                             |     |
| [no-invalid-json](./sequence/no-invalid-json.md)                       | Disallow a `links` or `properties` statement whose text is not a JSON object. |     |
| [no-link-without-separator](./sequence/no-link-without-separator.md)   | Disallow a `link` statement without the `@` between its label and its URL.    |     |

<!-- end auto-generated rules list -->
