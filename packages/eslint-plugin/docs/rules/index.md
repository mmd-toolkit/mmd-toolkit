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

| Rule                                                                                  | Description                                                                   | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [sequence-no-create-destroy](./sequence-no-create-destroy.md)                         | Disallow `create` before `destroy`.                                           | ✅  |     |     |
| [sequence-no-duplicate-description](./sequence-no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.             | ✅  |     |     |
| [sequence-no-duplicate-title](./sequence-no-duplicate-title.md)                       | Disallow a `title` or `accTitle` statement that sets its title again.         | ✅  |     |     |
| [sequence-no-empty-description-block](./sequence-no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                       | ✅  |     |     |
| [sequence-no-ignored-text](./sequence-no-ignored-text.md)                             | Disallow a line that mermaid.js reads as nothing.                             | ✅  |     |     |
| [sequence-no-invalid-json](./sequence-no-invalid-json.md)                             | Disallow a `links` or `properties` statement whose text is not a JSON object. | ✅  |     |     |
| [sequence-no-link-without-separator](./sequence-no-link-without-separator.md)         | Disallow a `link` statement without the `@` between its label and its URL.    | ✅  |     |     |
| [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.md) | Disallow an `accDescr {` block without its closing `}`.                       | ✅  |     |     |

## class

| Rule                                                                  | Description                                                                   | ✅  | 💡  | 🚧  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [class-no-bare-class-name](./class-no-bare-class-name.md)             | Disallow a class name alone on its line, which changes nothing.               | ✅  |     |     |
| [class-no-duplicate-description](./class-no-duplicate-description.md) | Disallow an `accDescr` statement that sets the description again.             | ✅  |     |     |
| [class-no-duplicate-title](./class-no-duplicate-title.md)             | Disallow an `accTitle` statement that sets the title again.                   | ✅  |     |     |
| [class-no-ignored-text](./class-no-ignored-text.md)                   | Disallow text that mermaid.js does not read.                                  | ✅  |     |     |
| [class-no-inline-comment](./class-no-inline-comment.md)               | Disallow a comment after other text on its line.                              |     |     |     |
| [class-no-redefined-class](./class-no-redefined-class.md)             | Disallow writing the label of a class again, differently.                     | ✅  |     |     |
| [class-no-unclosed-backquote](./class-no-unclosed-backquote.md)       | Disallow a backquoted class name without its closing backquote.               | ✅  |     |     |
| [class-no-undef](./class-no-undef.md)                                 | Disallow a statement that refers to a class that the diagram does not define. | ✅  |     |     |

## state

| Rule                                                                            | Description                                                                    | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --- | --- | --- |
| [state-no-duplicate-description](./state-no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.              | ✅  |     |     |
| [state-no-duplicate-title](./state-no-duplicate-title.md)                       | Disallow an `accTitle` statement that sets the title again.                    | ✅  |     |     |
| [state-no-empty-description-block](./state-no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                        | ✅  |     |     |
| [state-no-ignored-text](./state-no-ignored-text.md)                             | Disallow text that mermaid.js does not read.                                   | ✅  |     |     |
| [state-no-unclosed-description-block](./state-no-unclosed-description-block.md) | Disallow an `accDescr {` block without its closing `}`.                        | ✅  |     |     |
| [state-no-undef](./state-no-undef.md)                                           | Disallow a `style`, `class`, `click`, or `note` statement that names no state. | ✅  |     |     |

## er

| Rule                                                                      | Description                                                                   | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [er-no-duplicate-description](./er-no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.             | ✅  |     |     |
| [er-no-duplicate-title](./er-no-duplicate-title.md)                       | Disallow an `accTitle` statement that sets the title again.                   | ✅  |     |     |
| [er-no-empty-description-block](./er-no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                       | ✅  |     |     |
| [er-no-ignored-text](./er-no-ignored-text.md)                             | Disallow text that mermaid.js does not read.                                  | ✅  |     |     |
| [er-no-redefined-entity](./er-no-redefined-entity.md)                     | Disallow an entity statement that gives an entity a second alias.             | ✅  |     |     |
| [er-no-unclosed-description-block](./er-no-unclosed-description-block.md) | Disallow an `accDescr {` block that a `}` written for something else closes.  | ✅  |     |     |
| [er-no-undef](./er-no-undef.md)                                           | Disallow a `style` or `class` statement that names no entity and no subgraph. | ✅  |     |     |

## journey

| Rule                                                                          | Description                                                           | ✅  | 💡  | 🚧  |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | --- | --- | --- |
| [journey-no-duplicate-description](./journey-no-duplicate-description.md)     | Disallow an `accDescr` statement that sets the description again.     | ✅  |     |     |
| [journey-no-duplicate-title](./journey-no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again. | ✅  |     |     |
| [journey-no-empty-description-block](./journey-no-empty-description-block.md) | Disallow an `accDescr` block that holds no description.               | ✅  |     |     |
| [journey-no-empty-person](./journey-no-empty-person.md)                       | Disallow a person of a task that has no name.                         | ✅  |     |     |
| [journey-no-ignored-text](./journey-no-ignored-text.md)                       | Disallow text in the data of a task that mermaid.js does not read.    | ✅  |     |     |
| [journey-no-invalid-score](./journey-no-invalid-score.md)                     | Disallow a task score that is not a number from 1 to 5.               | ✅  |     |     |

## gantt

| Rule                                                                      | Description                                                                     | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --- | --- | --- |
| [gantt-no-duplicate-description](./gantt-no-duplicate-description.md)     | Disallow an `accDescr` statement that sets the description again.               | ✅  |     |     |
| [gantt-no-duplicate-id](./gantt-no-duplicate-id.md)                       | Disallow a task id that an earlier task already has.                            | ✅  |     |     |
| [gantt-no-duplicate-setting](./gantt-no-duplicate-setting.md)             | Disallow a setting statement that sets its setting again.                       | ✅  |     |     |
| [gantt-no-duplicate-title](./gantt-no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again.           | ✅  |     |     |
| [gantt-no-empty-description-block](./gantt-no-empty-description-block.md) | Disallow an `accDescr` block that holds no description.                         | ✅  |     |     |
| [gantt-no-undef](./gantt-no-undef.md)                                     | Disallow a task id in `click`, `after`, or `until` that is the id of no task.   | ✅  |     |     |
| [gantt-no-unknown-exclude](./gantt-no-unknown-exclude.md)                 | Disallow a word in `excludes` that is neither `weekends` nor the name of a day. | ✅  |     |     |
| [gantt-no-unread-tag](./gantt-no-unread-tag.md)                           | Disallow a tag in the data of a task that mermaid.js does not read as a tag.    | ✅  |     |     |

<!-- end auto-generated rules list -->
