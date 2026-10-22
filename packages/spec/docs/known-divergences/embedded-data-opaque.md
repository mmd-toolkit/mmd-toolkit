# embedded-data-opaque

Japanese version: [embedded-data-opaque.ja.md](./embedded-data-opaque.ja.md)

Diagram types: all. This is one of the
[known divergences](../known-divergences.md) of this specification from
mermaid.js.

## The syntax

Three kinds of text in a diagram are data in another language, embedded in it:

- the body of the frontmatter, in YAML;
- the arguments of a directive, such as the JSON after `init:`;
- the `@{ ... }` data blocks in the text of some diagram types: YAML for
  flowchart shape data and sequence participant data, and JSON for usecase
  tables. [fixture: usecase/db-json-values]

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

In kanban, frontmatter and `@{ ... }` contents are opaque. Invalid YAML and
duplicate keys do not reject a well-delimited diagram. [fixture:
kanban/gram-frontmatter-invalid-yaml] [fixture: kanban/gram-metadata-bad-yaml]
[fixture: kanban/gram-metadata-ticket-duplicate] An empty multiline block is
accepted. [fixture: kanban/gram-metadata-empty-multiline] Metadata types and
shape spellings are not validated (see
[Data blocks](../diagrams/kanban.md#data-blocks)). [fixture:
kanban/gram-metadata-shape-number] [fixture: kanban/gram-metadata-shape-camel]
[fixture: kanban/gram-metadata-shape-underscore]

Adjacent kanban data blocks stay separate nodes. [fixture:
kanban/db-metadata-two-items] [fixture: kanban/db-metadata-one-item-reference] A
rejection caused only by their combined embedded content is this divergence as
well. [fixture: kanban/gram-metadata-two-blocks]

An unquoted caret, an unclosed data block, and a brace left after a nested
mapping closes the block are syntax errors. They are not this divergence.
[fixture: kanban/gram-metadata-caret] [fixture: kanban/gram-metadata-unclosed]
[fixture: kanban/gram-metadata-assigned-mapping]

In C4, frontmatter and directive contents are opaque, so invalid YAML such as
`title: [` in a well-delimited frontmatter does not reject the diagram here;
mermaid.js rejects it. [fixture: c4/div-frontmatter-invalid-yaml]

C4 has no `@{ ... }` data-block form. [fixture: c4/gram-data-block]

In venn, invalid YAML such as `title: [` inside a well-delimited frontmatter is
accepted here and rejected by mermaid.js. [fixture: venn/frontmatter-invalid]

Venn has no `@{ ... }` data-block form. [fixture: venn/gram-data-block]
[fixture: venn/frontmatter-empty] [fixture: venn/frontmatter-unclosed] Adjacent
frontmatter delimiter lines and an unclosed frontmatter remain syntax errors.
[fixture: venn/gram-data-block] [fixture: venn/frontmatter-empty] [fixture:
venn/frontmatter-unclosed]

In Ishikawa, well-delimited frontmatter and directive contents are opaque too.
Invalid YAML, including a YAML error caused by the common attribute-quote
conversion, does not reject the diagram here; mermaid.js rejects these
frontmatters. [fixture: ishikawa/frontmatter-malformed] [fixture:
ishikawa/frontmatter-html-title] Adjacent empty delimiter lines and an unclosed
frontmatter remain syntax errors. [fixture: ishikawa/frontmatter-empty]
[fixture: ishikawa/frontmatter-unclosed] `@{...}` has no data-block syntax in
Ishikawa: it is ordinary node text, so malformed-looking or unclosed content
remains text rather than an embedded-data divergence. [fixture:
ishikawa/db-data-block-is-text] [fixture: ishikawa/gram-child-unclosed-brace]

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

## What it means for an author

A diagram with broken YAML in its frontmatter or in a data block, a
configuration value of the wrong type, or a shape that mermaid.js does not know
is accepted by this toolkit and formatted, while mermaid.js rejects it. Such a
mistake is not reported by the parser; checking the values of embedded data is
left to other tools.

## Why mermaid.js reads it so

mermaid.js parses frontmatter and the YAML forms of data blocks as YAML, usecase
table bodies as JSON, and the arguments of some directives as JSON. It derives
configuration and diagram data from them, and checks the result before or while
it draws (see
[Configuration (reference)](../../../tests/docs/configuration.md#configuration-reference)).
A failure of any of these steps rejects the input. [fixture:
usecase/db-json-integer-order] [fixture: usecase/db-json-duplicate-order]
[fixture: usecase/gram-json-object-scalar-overwrite] [fixture:
usecase/gram-json-control-escapes] [fixture:
usecase/div-gram-json-malformed-escape]

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

### Agentflow

AgentflowDataBlock holds the full authored interior of every vertex,
flow-heading, and connector-heading block, including adjacent blocks separately.
Invalid YAML, unknown shape names, invalid metadata types, combined-block YAML
failures, and recursive-alias failures depend on those contents rather than on
building the tree. They are accepted under the existing reverse-direction
criterion. No YAML property tree, key sanitization, or alias resolution is
needed. [fixture: agentflow/db-data-block-invalid-yaml] [fixture:
agentflow/db-data-block-unknown-shape] [fixture:
agentflow/db-metadata-adjacent-no-comma] [fixture:
agentflow/div-metadata-yaml-self-alias] [fixture:
agentflow/div-data-percent-line-is-content] [fixture:
agentflow/gram-data-adjacent-multiline-blocks]

A delimiter failure remains a syntax error: an unclosed block, a brace protected
only by a single quote, or a caret outside the double-quoted data context is not
an embedded-content rejection. Empty multiline blocks already parse in this pin.
[fixture: agentflow/lex-data-block-unclosed] [fixture:
agentflow/lex-data-block-single-quoted-brace] [fixture:
agentflow/lex-data-block-caret] [fixture:
agentflow/db-data-block-empty-multiline]

### Usecase

The usecase JSON table form, `json` followed by an id and `@{ ... }`, is JSON,
not YAML. Its complete brace interior is UsecaseJsonDataBlock.value; frontmatter
and directive contents use their common records. These nodes already hold the
written text. Mermaid's own JSON reader rejects balanced malformed contents,
including unquoted keys, bad escapes, trailing commas, and structural
U+2028/U+2029. This specification accepts these content-only failures under the
existing reverse criterion: JSON validation is unnecessary to construct the
opaque tree. The externally supplied table value and property order do not
become child nodes. [fixture: usecase/div-gram-json-unquoted-key] [fixture:
usecase/div-gram-json-malformed-escape] [fixture:
usecase/div-gram-json-trailing-comma] [fixture: usecase/div-gram-json-u2028]
[fixture: usecase/div-lex-json-ps-whitespace] [fixture:
usecase/db-json-duplicate-order] [fixture: usecase/div-frontmatter-malformed]

Mermaid validates the JSON text and obtains its decoded value with
[`JSON.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseJson.ts#L345-L378).
For a validated object root, it then gathers source property order with
[`PropertyOrderCollector.collect()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseJson.ts#L373-L377).
The collector can also help locate a JSON error; it does not replace JSON
validation. The native metadata property grammar does not use this JSON reader.
[fixture: usecase/db-json-integer-order] [fixture:
usecase/db-json-duplicate-order] [fixture:
usecase/gram-json-object-scalar-overwrite] [fixture:
usecase/gram-json-control-escapes] [fixture:
usecase/div-gram-json-malformed-escape]

Unclosed balancing, a root that does not start with `{`, and text left after the
first balancing close remain syntax errors. Single quotes do not protect braces
in this matcher. Native declaration/update `@{ ... }` is different: it has
UsecaseMetadata and ordered properties, is not an opaque block, and retains all
key/type/combination checks. No input Mermaid accepts is rejected for embedded
contents by this rule. [fixture: usecase/gram-json-empty-delimiter-only]
[fixture: usecase/gram-json-array-root] [fixture:
usecase/gram-json-brace-in-single-quote] [fixture:
usecase/gram-native-quoted-business] [fixture:
usecase/gram-metadata-unknown-key] [fixture:
usecase/lex-native-single-quoted-keys]

## The documentation of mermaid.js and its issues

- The pinned
  [C4 documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L159-L171)
  shows valid YAML frontmatter configuring `c4.wrap`, but states no policy for
  malformed embedded YAML. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-21 with `C4 YAML in:title,body`,
  `C4 "invalid YAML" in:title,body`, and `C4 frontmatter in:title,body` found
  [issue #7949](https://github.com/mermaid-js/mermaid/issues/7949), which
  reports a wrapping configuration problem rather than malformed YAML. No issue
  or pull request about acceptance of invalid YAML in C4 frontmatter was found.

- The pinned
  [venn documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
  shows valid YAML frontmatter, but states no acceptance rule for malformed
  YAML. Searches of issues and pull requests in `mermaid-js/mermaid` on
  2026-10-21 with `venn YAML in:title,body`,
  `venn "invalid YAML" in:title,body`, and `venn frontmatter in:title,body`
  found no report about accepting invalid YAML in venn frontmatter.

- The pinned
  [Ishikawa documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
  describes node text and indentation, but states no acceptance rule for
  malformed embedded YAML. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-21 with `ishikawa`,
  `ishikawa frontmatter in:title,body`, and
  `ishikawa "invalid YAML" in:title,body` found no report about accepting
  invalid YAML in Ishikawa frontmatter.

- The pinned
  [Agentflow metadata documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L233-L268)
  describes YAML blocks on nodes, edges, and containers, including preservation
  of unknown keys and removal of prototype-shaped keys. It states no acceptance
  policy for malformed YAML. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `agentflow YAML in:title,body` found
  [PR #8072](https://github.com/mermaid-js/mermaid/pull/8072), which introduces
  the diagram, and
  [issue #7827](https://github.com/mermaid-js/mermaid/issues/7827), which
  proposes ELK layout configuration. Neither reports acceptance of malformed
  Agentflow YAML.

- The pinned
  [usecase documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  describes JSON tables. Searches of issues and pull requests in
  `mermaid-js/mermaid` on 2026-10-22 with `usecase JSON` found no inspected
  report establishing a maintainer defect judgment for this acceptance behavior.
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048), closed and merged
  on 2026-08-14 with Type: Enhancement, introduces the Chevrotain parser, model
  validation and JSON tables. This divergence follows the shared direct rule,
  not a claim that a bug label approves a grammar change.
