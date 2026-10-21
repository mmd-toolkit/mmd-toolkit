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

| Rule                                                        | Description                                                                                                     | ✅  | 💡  | 🚧  |
| ----------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | --- | --- | --- |
| [no-invalid-init-directive](./no-invalid-init-directive.md) | Disallow a directive meant to configure the diagram that is not written validly, so that mermaid.js ignores it. |     |     | 🚧  |
| [no-unclosed-directive](./no-unclosed-directive.md)         | Disallow a directive without its closing `}%%`.                                                                 |     |     |     |

## flowchart

| Rule                                                                                    | Description                                                                                          | ✅  | 💡  | 🚧  |
| --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --- | --- | --- |
| [flowchart-no-duplicate-description](./flowchart-no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.                                    | ✅  | 💡  |     |
| [flowchart-no-duplicate-title](./flowchart-no-duplicate-title.md)                       | Disallow an `accTitle` statement that sets the title again.                                          | ✅  | 💡  |     |
| [flowchart-no-empty-description-block](./flowchart-no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                                              | ✅  | 💡  |     |
| [flowchart-no-ignored-text](./flowchart-no-ignored-text.md)                             | Disallow text on a direction line that mermaid.js drops.                                             | ✅  | 💡  |     |
| [flowchart-no-redefined-vertex](./flowchart-no-redefined-vertex.md)                     | Disallow writing the shape or the label of a vertex again, differently.                              | ✅  |     |     |
| [flowchart-no-unclosed-description-block](./flowchart-no-unclosed-description-block.md) | Disallow an `accDescr {` block without its closing `}`.                                              |     | 💡  |     |
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
| [sequence-no-unclosed-description-block](./sequence-no-unclosed-description-block.md) | Disallow an `accDescr {` block without its closing `}`.                       |     |     |     |

## class

| Rule                                                                  | Description                                                                   | ✅  | 💡  | 🚧  |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [class-no-bare-class-name](./class-no-bare-class-name.md)             | Disallow a class name alone on its line, which changes nothing.               | ✅  |     |     |
| [class-no-duplicate-description](./class-no-duplicate-description.md) | Disallow an `accDescr` statement that sets the description again.             | ✅  |     |     |
| [class-no-duplicate-title](./class-no-duplicate-title.md)             | Disallow an `accTitle` statement that sets the title again.                   | ✅  |     |     |
| [class-no-ignored-text](./class-no-ignored-text.md)                   | Disallow text that mermaid.js drops.                                          | ✅  |     |     |
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
| [state-no-ignored-text](./state-no-ignored-text.md)                             | Disallow text that mermaid.js drops.                                           | ✅  |     |     |
| [state-no-unclosed-description-block](./state-no-unclosed-description-block.md) | Disallow an `accDescr {` block without its closing `}`.                        |     |     |     |
| [state-no-undef](./state-no-undef.md)                                           | Disallow a `style`, `class`, `click`, or `note` statement that names no state. | ✅  |     |     |

## er

| Rule                                                                      | Description                                                                   | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [er-no-duplicate-description](./er-no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.             | ✅  |     |     |
| [er-no-duplicate-title](./er-no-duplicate-title.md)                       | Disallow an `accTitle` statement that sets the title again.                   | ✅  |     |     |
| [er-no-empty-description-block](./er-no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                       | ✅  |     |     |
| [er-no-ignored-text](./er-no-ignored-text.md)                             | Disallow text that mermaid.js drops.                                          |     |     |     |
| [er-no-redefined-entity](./er-no-redefined-entity.md)                     | Disallow an entity statement that gives an entity a second alias.             | ✅  |     |     |
| [er-no-unclosed-description-block](./er-no-unclosed-description-block.md) | Disallow an `accDescr {` block that a `}` written for something else closes.  |     |     |     |
| [er-no-undef](./er-no-undef.md)                                           | Disallow a `style` or `class` statement that names no entity and no subgraph. | ✅  |     |     |

## journey

| Rule                                                                          | Description                                                           | ✅  | 💡  | 🚧  |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- | --- | --- | --- |
| [journey-no-duplicate-description](./journey-no-duplicate-description.md)     | Disallow an `accDescr` statement that sets the description again.     | ✅  |     |     |
| [journey-no-duplicate-title](./journey-no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again. | ✅  |     |     |
| [journey-no-empty-description-block](./journey-no-empty-description-block.md) | Disallow an `accDescr` block that holds no description.               | ✅  |     |     |
| [journey-no-empty-person](./journey-no-empty-person.md)                       | Disallow a person of a task that has no name.                         | ✅  |     |     |
| [journey-no-ignored-text](./journey-no-ignored-text.md)                       | Disallow text in the data of a task that mermaid.js drops.            | ✅  |     |     |
| [journey-no-invalid-score](./journey-no-invalid-score.md)                     | Disallow a task score that is not a number from 1 to 5.               | ✅  |     |     |

## gantt

| Rule                                                                      | Description                                                                     | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | --- | --- | --- |
| [gantt-no-duplicate-description](./gantt-no-duplicate-description.md)     | Disallow an `accDescr` statement that sets the description again.               | ✅  |     |     |
| [gantt-no-duplicate-id](./gantt-no-duplicate-id.md)                       | Disallow a task id that an earlier task already has.                            | ✅  |     |     |
| [gantt-no-duplicate-setting](./gantt-no-duplicate-setting.md)             | Disallow a setting statement that sets its setting again.                       | ✅  |     |     |
| [gantt-no-duplicate-title](./gantt-no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again.           | ✅  |     |     |
| [gantt-no-empty-description-block](./gantt-no-empty-description-block.md) | Disallow an `accDescr` block that holds no description.                         | ✅  |     |     |
| [gantt-no-invalid-tag](./gantt-no-invalid-tag.md)                         | Disallow a tag in the data of a task that mermaid.js does not read as a tag.    | ✅  |     |     |
| [gantt-no-undef](./gantt-no-undef.md)                                     | Disallow a task id in `click`, `after`, or `until` that is the id of no task.   | ✅  |     |     |
| [gantt-no-unknown-exclude](./gantt-no-unknown-exclude.md)                 | Disallow a word in `excludes` that is neither `weekends` nor the name of a day. | ✅  |     |     |

## quadrant

| Rule                                                                            | Description                                                            | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --- | --- | --- |
| [quadrant-no-duplicate-description](./quadrant-no-duplicate-description.md)     | Disallow a statement that sets the description of the chart again.     | ✅  |     |     |
| [quadrant-no-duplicate-style](./quadrant-no-duplicate-style.md)                 | Disallow a style that a point or a class gives again.                  | ✅  |     |     |
| [quadrant-no-duplicate-title](./quadrant-no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again.  | ✅  |     |     |
| [quadrant-no-empty-description-block](./quadrant-no-empty-description-block.md) | Disallow a description block that holds no description.                | ✅  |     |     |
| [quadrant-no-invalid-coordinate](./quadrant-no-invalid-coordinate.md)           | Disallow a coordinate of a point that is not a number from 0 to 1.     | ✅  |     |     |
| [quadrant-no-redefined-axis](./quadrant-no-redefined-axis.md)                   | Disallow an axis statement that replaces a text of the axis.           | ✅  |     |     |
| [quadrant-no-redefined-class](./quadrant-no-redefined-class.md)                 | Disallow a `classDef` statement that replaces the styles of its class. | ✅  |     |     |
| [quadrant-no-redefined-quadrant](./quadrant-no-redefined-quadrant.md)           | Disallow a quadrant statement that replaces the text of its quadrant.  | ✅  |     |     |
| [quadrant-no-undef](./quadrant-no-undef.md)                                     | Disallow a class of a point that no `classDef` defines.                | ✅  |     |     |

## requirement

| Rule                                                                                        | Description                                                                                             | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | --- | --- | --- |
| [requirement-no-duplicate-description](./requirement-no-duplicate-description.md)           | Disallow an `accDescr` statement that sets the description again.                                       | ✅  |     |     |
| [requirement-no-duplicate-field](./requirement-no-duplicate-field.md)                       | Disallow a field that the body of a requirement or an element already has.                              | ✅  |     |     |
| [requirement-no-duplicate-name](./requirement-no-duplicate-name.md)                         | Disallow a requirement or an element that reuses the name of an earlier one.                            | ✅  |     |     |
| [requirement-no-duplicate-title](./requirement-no-duplicate-title.md)                       | Disallow an `accTitle` statement that sets the title again.                                             | ✅  |     |     |
| [requirement-no-empty-description-block](./requirement-no-empty-description-block.md)       | Disallow an `accDescr` block that holds no description.                                                 | ✅  |     |     |
| [requirement-no-ignored-text](./requirement-no-ignored-text.md)                             | Disallow text that mermaid.js drops.                                                                    | ✅  |     |     |
| [requirement-no-unclosed-description-block](./requirement-no-unclosed-description-block.md) | Disallow an `accDescr {` block that a `}` written for something else closes.                            |     |     |     |
| [requirement-no-undef](./requirement-no-undef.md)                                           | Disallow a name in `style`, `class`, `:::`, or a relationship that names no requirement and no element. | ✅  |     |     |

## c4

| Rule                                                            | Description                                                                                       | ✅  | 💡  | 🚧  |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --- | --- | --- |
| [c4-no-duplicate-description](./c4-no-duplicate-description.md) | Disallow a description statement that replaces a different diagram description.                   | ✅  |     |     |
| [c4-no-duplicate-title](./c4-no-duplicate-title.md)             | Disallow a title statement that replaces a different title set by another title statement.        | ✅  |     |     |
| [c4-no-invalid-attribute-key](./c4-no-invalid-attribute-key.md) | Disallow incorrect casing of the color and offset keys in C4 style updates.                       | ✅  |     |     |
| [c4-no-redefined-element](./c4-no-redefined-element.md)         | Disallow a declaration of an element or a boundary that replaces an earlier label, kind, or type. | ✅  |     |     |
| [c4-no-undef](./c4-no-undef.md)                                 | Disallow a style update whose target does not exist when the update is read.                      | ✅  |     |     |
| [c4-no-useless-argument](./c4-no-useless-argument.md)           | Disallow nonempty arguments beyond the parameters that a C4 call reads.                           | ✅  |     |     |

## mindmap

| Rule                                                                    | Description                                                 | ✅  | 💡  | 🚧  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------- | --- | --- | --- |
| [mindmap-no-duplicate-decoration](./mindmap-no-duplicate-decoration.md) | Disallow a second icon or a second class line for one node. | ✅  |     |     |
| [mindmap-no-mismatched-shape](./mindmap-no-mismatched-shape.md)         | Disallow a shape whose closer does not match its opener.    | ✅  |     |     |

## timeline

| Rule                                                                            | Description                                                           | ✅  | 💡  | 🚧  |
| ------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --- | --- | --- |
| [timeline-no-duplicate-description](./timeline-no-duplicate-description.md)     | Disallow an `accDescr` statement that sets the description again.     | ✅  |     |     |
| [timeline-no-duplicate-title](./timeline-no-duplicate-title.md)                 | Disallow a `title` or `accTitle` statement that sets its title again. | ✅  |     |     |
| [timeline-no-empty-description-block](./timeline-no-empty-description-block.md) | Disallow an `accDescr` block that holds no description.               | ✅  |     |     |

## sankey

| Rule                                                    | Description                                                                          | ✅  | 💡  | 🚧  |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ | --- | --- | --- |
| [sankey-no-empty-node](./sankey-no-empty-node.md)       | Disallow a source or a target of whitespace only, which makes a node without a name. | ✅  |     |     |
| [sankey-no-invalid-value](./sankey-no-invalid-value.md) | Disallow a link value that mermaid.js does not read as written.                      | ✅  |     |     |

## xychart

| Rule                                                                                | Description                                                                 | ✅  | 💡  | 🚧  |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | --- | --- | --- |
| [xychart-no-duplicate-description](./xychart-no-duplicate-description.md)           | Disallow a statement that sets the description of the chart again.          | ✅  |     |     |
| [xychart-no-duplicate-title](./xychart-no-duplicate-title.md)                       | Disallow a `title` or `accTitle` statement that sets its title again.       | ✅  |     |     |
| [xychart-no-empty-description-block](./xychart-no-empty-description-block.md)       | Disallow a description block that holds no description.                     | ✅  |     |     |
| [xychart-no-extra-value](./xychart-no-extra-value.md)                               | Disallow a value of a plot beyond the categories of the x axis.             | ✅  |     |     |
| [xychart-no-invalid-orientation](./xychart-no-invalid-orientation.md)               | Disallow an orientation that mermaid.js does not read as `horizontal`.      | ✅  |     |     |
| [xychart-no-redefined-axis](./xychart-no-redefined-axis.md)                         | Disallow an axis statement that replaces the title or the data of the axis. | ✅  |     |     |
| [xychart-no-unclosed-description-block](./xychart-no-unclosed-description-block.md) | Disallow a description block that is not closed by `}`.                     | ✅  |     |     |

## block

| Rule                                                                    | Description                                                                   | ✅  | 💡  | 🚧  |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --- | --- | --- |
| [block-no-duplicate-block](./block-no-duplicate-block.md)               | Disallow declaring a block again.                                             | ✅  |     |     |
| [block-no-duplicate-columns](./block-no-duplicate-columns.md)           | Disallow a `columns` statement that changes the count of its block.           | ✅  |     |     |
| [block-no-edge-chain](./block-no-edge-chain.md)                         | Disallow an edge statement with more than one link.                           | ✅  |     |     |
| [block-no-edge-in-composite-head](./block-no-edge-in-composite-head.md) | Disallow a link in the head of a composite block.                             | ✅  |     |     |
| [block-no-invalid-direction](./block-no-invalid-direction.md)           | Disallow a direction of a block arrow that is not one of the direction words. | ✅  |     |     |
| [block-no-mismatched-edge](./block-no-mismatched-edge.md)               | Disallow an edge with a label whose two arrows do not match.                  | ✅  |     |     |
| [block-no-mismatched-shape](./block-no-mismatched-shape.md)             | Disallow a shape whose closing does not match its opening.                    | ✅  |     |     |
| [block-no-redefined-style](./block-no-redefined-style.md)               | Disallow a `style` statement that loses a style of an earlier one.            | ✅  |     |     |
| [block-no-spaced-class-id](./block-no-spaced-class-id.md)               | Disallow whitespace around a comma in the ids of a `class` statement.         | ✅  |     |     |
| [block-no-undef](./block-no-undef.md)                                   | Disallow a `class` statement for an id that no block has.                     | ✅  |     |     |
| [block-no-useless-width](./block-no-useless-width.md)                   | Disallow a width on the first block of an edge.                               | ✅  |     |     |

## kanban

| Rule                                                            | Description                                                         | ✅  | 💡  | 🚧  |
| --------------------------------------------------------------- | ------------------------------------------------------------------- | --- | --- | --- |
| [kanban-no-duplicate-section](./kanban-no-duplicate-section.md) | Disallow a repeated section id that lists its items more than once. | ✅  |     |     |

<!-- end auto-generated rules list -->
