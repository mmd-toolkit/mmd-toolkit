# embedded-data-opaque

Japanese version: [embedded-data-opaque.ja.md](./embedded-data-opaque.ja.md)

Diagram types: all. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

Three kinds of text in a diagram are data in another language, embedded in it:

- the body of the frontmatter, in YAML;
- the arguments of a directive, such as the JSON after `init:`;
- the `@{ ... }` data blocks in the text of some diagram types, in YAML, such as
  the shape data of a flowchart node or the data of a sequence participant.

```mmd
---
title: farm
---
%%{init: {"fontFamily": "serif"}}%%
flowchart LR
  A@{ shape: rect }
```

[fixture: flowchart/frontmatter-title] [fixture:
common/config-font-family-string] [fixture: flowchart/gram-data-shape-known]

This specification keeps each of them as written, and neither parses nor checks
it. Where each starts and ends is part of the syntax (see
[Frontmatter](../common.md#frontmatter), [Directives](../common.md#directives),
and the data blocks in the documents of the diagram types). This document is
about what they contain.

## The difference

Each example is a whole diagram.

1. A frontmatter that is no valid YAML:

   ```mmd
   ---
   title: [unclosed
   ---
   flowchart LR
     A
   ```

2. A frontmatter with a key twice:

   ```mmd
   ---
   title: a
   title: b
   ---
   flowchart LR
     A
   ```

3. A number where mermaid.js wants a string:

   ```mmd
   %%{init: {"fontFamily": 5}}%%
   flowchart LR
     A
   ```

4. A shape that mermaid.js does not know:

   ```mmd
   flowchart LR
     A@{ shape: nope }
   ```

5. A number as a label:

   ```mmd
   flowchart LR
     A@{ label: 12 }
   ```

| Example | mermaid.js                     | This specification |
| ------- | ------------------------------ | ------------------ |
| 1       | rejected, `YAMLException`      | accepted           |
| 2       | rejected, `YAMLException`      | accepted           |
| 3       | rejected, `TypeError`          | accepted           |
| 4       | rejected, "No such shape"      | accepted           |
| 5       | the vertex A with the label 12 | the same           |

[fixture: flowchart/frontmatter-invalid-yaml] [fixture:
common/frontmatter-duplicate-key] [fixture: common/config-css-key-not-string]
[fixture: flowchart/div-data-unknown-shape] [fixture:
flowchart/db-data-label-number]

So mermaid.js rejects an input when it cannot parse embedded data, or when the
result has a form that it does not know. This specification accepts every such
input; its tree holds the embedded data as written, as for any other input. The
other inputs that mermaid.js rejects only because of what embedded data contains
are these:

- a YAML error that mermaid.js makes itself when it rewrites `="..."` in a tag
  to `='...'`, as in `title: '<a b="c">'`, and a frontmatter with two YAML
  documents; [fixture: common/frontmatter-title-single-quoted-tag] [fixture:
  common/frontmatter-yaml-error] [fixture: common/frontmatter-two-documents]
- a `displayMode` together with a frontmatter `config`, or a `gantt` in it, that
  is a string, a number, or true; [fixture:
  common/frontmatter-display-mode-primitive-config] [fixture:
  common/config-display-mode-gantt-primitive]
- a wrap directive together with an init configuration that is a string, a
  number, or true; [fixture: common/directive-primitive-init-wrap] [fixture:
  common/directive-primitive-init-two-wrap-substrings]
- a string `themeVariables` with a character that mermaid.js does not allow
  there, and a theme variable that mermaid.js cannot parse as a colour;
  [fixture: common/config-theme-variables-string-rejected] [fixture:
  common/config-theme-colour-rejected]
- a failure of the second detection that mermaid.js runs when there is an init
  directive; [fixture: common/config-init-detection-rejects]
- a data block that is no valid YAML; [fixture: flowchart/div-data-invalid-yaml]
- a data block of a flowchart vertex whose content holds a line break and is
  YAML whose value is null, such as only a line break, only a comment, `null`,
  `~`, or a document marker alone: mermaid.js reads content with a line break as
  a YAML document, and content without one as a mapping between braces
  ([`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L143-L151)),
  and then reads the shape of the value, which fails with a `TypeError` when
  there is none
  ([`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L235-L236)).
  `A@{`, a line break, and `}` is rejected there, while `A@{ }` and `A@{ # c }`,
  on one line, are accepted by both, and so is the same block of an edge id, for
  which mermaid.js reads no shape. In sequence, mermaid.js reads the content of
  a data block as a mapping, also with a line break, and accepts such a block.
  [fixture: flowchart/div-data-block-line-break-only] [fixture:
  flowchart/div-data-block-comment-then-line-break] [fixture:
  flowchart/div-data-block-null-on-own-line] [fixture:
  flowchart/gram-data-block-comment-one-line] [fixture:
  flowchart/gram-data-block-space-only] [fixture:
  flowchart/gram-data-block-edge-line-break-only] [fixture:
  sequence/gram-data-block-line-break-only]

The difference goes one way only: no input is known that mermaid.js accepts and
this specification rejects because of what embedded data contains. mermaid.js
gives no Db for these inputs, so their fixtures record only the rejection.

## Why mermaid.js reads it so

mermaid.js parses the frontmatter body and the data blocks as YAML, and the
arguments of some directives as JSON, derives configuration and diagram data
from them, and checks the result, before or while it draws (see
[Configuration (reference)](../../../tests/docs/configuration.md#configuration-reference)).
A failure of any of these steps rejects the input.

## The rule of this specification, and why

In this specification, embedded data is opaque: the tree holds its text as
written, and acceptance does not depend on what it contains. Building the tree
does not need YAML or JSON, and leaving them out keeps implementations free of
both; a tool that needs the values, such as the title or the configuration,
parses the text itself.

This is not a rejection of an input that mermaid.js accepts, so it needs none of
the reasons for one (see [known-divergences.md](../known-divergences.md)): it
accepts inputs that mermaid.js rejects, and every input that both accept has the
same Db.

## What it means for an author

A diagram with broken YAML in its frontmatter or in a data block, a
configuration value of the wrong type, or a shape that mermaid.js does not know
is accepted by this toolkit and formatted, while mermaid.js rejects it. Such a
mistake is not reported by the parser; checking the values of embedded data is
left to other tools.
