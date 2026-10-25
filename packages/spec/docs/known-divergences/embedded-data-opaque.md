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

The malformed-data examples above go one way: mermaid.js rejects and gives no
Db, while this specification accepts. Embedded configuration can also change
acceptance in both directions, as the gitgraph cases below show. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/div-frontmatter-main-branch-duplicate-default-accepted]

### The comparison Db

The reference removes only the embedded data responsible for the divergence:

1. When Mermaid rejects while deriving configuration from a frontmatter or
   directive block, omit only that rejected block. Keep the other frontmatter
   and directives. [fixture:
   sequence/div-invalid-frontmatter-preserves-wrap-directive]
2. When valid embedded configuration changes a diagram's acceptance conditions,
   read with only the keys used by those conditions removed from that
   configuration. Keep its other values. The gitgraph and packet keys are named
   below. [fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
   [fixture: gitgraph/div-frontmatter-html-labels-default-comparison] [fixture:
   gitgraph/div-init-html-labels-default-comparison]

Keep the frontmatter title as Mermaid derives it, as in
[html-tag-in-frontmatter](./html-tag-in-frontmatter.md). Settings that affect
only the Db also remain: a valid `wrap: true` directive still makes the sequence
message wrap when an invalid frontmatter is omitted. [fixture:
gitgraph/div-frontmatter-main-branch-preserves-title] [fixture:
sequence/div-invalid-frontmatter-preserves-wrap-directive]

If that reference is accepted, `specified.json` records its Db and embedded
values for comparison, even though Mermaid's rejection of the written input
supplies no Db. The comparison Db is `null` only when the reference retains the
same opaque-data rejection; that specified reading still accepts. [fixture:
gitgraph/div-frontmatter-invalid-yaml] [fixture:
gitgraph/div-frontmatter-html-invalid-yaml] [fixture:
info/div-frontmatter-invalid-yaml] [fixture:
info/div-frontmatter-html-invalid-yaml] [fixture:
flowchart/div-data-unknown-shape]

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

Accepting malformed embedded contents uses the reverse-direction criterion in
[known-divergences.md](../known-divergences.md): validating them is unnecessary
to hold their source text. The gitgraph configuration case below also rejects
Mermaid-accepted inputs under reason 2: the direct default-configuration rule
keeps embedded contents opaque. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/docs-syntax-gitgraph-2ea99686]

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

### Pie

Frontmatter holds an invalid YAML body as written, so no syntax node is missing.
Its content does not decide the tree's structure and is not checked: this
specification accepts a leading frontmatter body `title: [` that mermaid.js
rejects as YAML. This includes a written YAML title made invalid by HTML
attribute-quote conversion, like the usecase case. [fixture:
pie/div-review-frontmatter-html-invalid-yaml] [fixture:
usecase/div-gram-frontmatter-html-attribute-quotes] This is the
reverse-direction case only; opaque content never makes this rule reject an
input that mermaid.js accepts. Nonleading hidden YAML is already opaque in
mermaid.js too, so an invalid body there is held by PieIgnoredText and is not
marked. The malformed init argument below is also accepted by both and has no
mark. [fixture: pie/div-review-yaml-leading-invalid] [fixture:
pie/review-yaml-hidden-invalid] [fixture:
pie/lex-yaml-after-comment-invalid-body] [fixture:
pie/review-directive-invalid-init]

### Gitgraph

Frontmatter has a source node whose body remains opaque. Invalid leading YAML
rejected by Mermaid is accepted here. The rejection of the written input
supplies no Db, but the accepted reference defined by the comparison rule
supplies the comparison Db and embedded values recorded in `specified.json`,
under [The comparison Db](#the-comparison-db). For these two frontmatters, that
Db is an empty gitgraph history with the initial `main` branch. [fixture:
gitgraph/div-frontmatter-invalid-yaml] [fixture:
gitgraph/div-frontmatter-html-invalid-yaml] Invalid nonleading hidden YAML
already agrees because GitgraphIgnoredText owns it; malformed init arguments
that Mermaid accepts are not differing inputs. [fixture:
gitgraph/div-frontmatter-invalid-yaml] [fixture:
gitgraph/div-frontmatter-html-invalid-yaml] [fixture:
gitgraph/lex-yaml-invalid-body] [fixture: gitgraph/directive-invalid-init]

Where embedded configuration changes acceptance conditions, this specification
uses the default configuration for those conditions. In gitgraph that means the
initial branch `main` and the default escaping defined in
[Semantic acceptance conditions](../diagrams/gitgraph.md#semantic-acceptance-conditions).
The keys removed from the comparison configuration are `gitGraph.mainBranchName`
and `gitGraph.htmlLabels`. Keep other configuration values and Mermaid's derived
title. [fixture: gitgraph/div-frontmatter-main-branch-preserves-title] [fixture:
gitgraph/div-frontmatter-html-labels-default-comparison] [fixture:
gitgraph/div-init-html-labels-default-comparison]

Under the default secure-key policy, `securityLevel` is secure at every nesting
level. Neither root `securityLevel` nor `gitGraph.securityLevel` can be changed
by frontmatter or init directives; Mermaid already removes those attempted
settings. Site configuration may still supply the gitgraph setting, as described
in the acceptance conditions. [fixture:
gitgraph/frontmatter-security-level-secure] [fixture:
gitgraph/directive-security-level-secure] [fixture:
gitgraph/config-gitgraph-loose]

Frontmatter and directive nodes already hold the written configuration;
interpreting it to choose branches or escaping would read their opaque contents.
The direct rule uses the defaults instead, under reason 2 for the
Mermaid-accepted direction. Site configuration outside the text is still applied
by whoever holds it, as described there. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/docs-syntax-gitgraph-2ea99686] [fixture: gitgraph/config-main-branch]

The frontmatter settings in the two documentation examples make Mermaid accept
checkout of `develop` or `MetroLine1`; this specification rejects those unknown
branches under the default initial name. In the reverse direction, frontmatter
`mainBranchName: dev` makes Mermaid reject `branch dev` as a duplicate or
`checkout main` as unknown; this specification accepts both. An init directive
setting the same name likewise makes `branch dev` reject in Mermaid and accept
here. All five inputs carry this identifier, and their specified readings record
the opposite acceptance. [fixture:
gitgraph/docs-community-contributing-05cdc44b] [fixture:
gitgraph/docs-syntax-gitgraph-2ea99686] [fixture:
gitgraph/div-frontmatter-main-branch-duplicate-default-accepted] [fixture:
gitgraph/div-frontmatter-main-branch-checkout-default-accepted] [fixture:
gitgraph/div-init-main-branch-duplicate-default-accepted]

### Info

Frontmatter already holds its written body. Malformed content, including YAML
made invalid by attribute-quote conversion, does not decide that source
structure and is accepted here although Mermaid rejects it. There is no Db from
the rejection of the written input, but the accepted reference defined by the
comparison rule supplies the comparison Db and embedded values recorded in
`specified.json`, under [The comparison Db](#the-comparison-db). For these two
frontmatters, that Db is `{}`. This rule rejects no Mermaid-accepted input.
Invalid hidden YAML and the recorded malformed init argument already accept in
both and are unmarked. [fixture: info/div-frontmatter-invalid-yaml] [fixture:
info/div-frontmatter-html-invalid-yaml] [fixture:
info/hidden-yaml-preheader-invalid] [fixture: info/directive-invalid-init]

### Packet

Frontmatter/directive nodes hold their bodies without interpreting them for
acceptance. Malformed YAML may reject only in Mermaid. In both acceptance
directions the comparison removes only `packet.bitsPerRow` from valid text
configuration, retaining site configuration, Mermaid's derived frontmatter title
and other valid settings. [fixture: packet/frontmatter-invalid] [fixture:
packet/frontmatter-invalid-keeps-config] [fixture:
packet/config-frontmatter-fraction] [fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site] [fixture:
packet/config-directive-overrides-site]

Use the default `packet.bitsPerRow = 32` for the
[packet acceptance conditions](../diagrams/packet.md#semantic-acceptance-conditions).
The named key removed from comparison configuration is **`packet.bitsPerRow`**.
A fractional width in YAML frontmatter or init can reject in Mermaid and accept
here; overriding a fractional site width with text width 32 can reverse that
difference. In both directions specified.json records acceptance, Db and
embedded values. Whoever holds site configuration applies it; it is not
reconstructed from text configuration. [fixture:
packet/config-frontmatter-fraction] [fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site] [fixture:
packet/config-directive-overrides-site]

Omit a rejected leading frontmatter only from the comparison, keeping a valid
showBits directive beside it. Nonleading hidden YAML is already held by
PacketIgnoredText, so invalid content there alone is not a divergence.
Configuration that changes published rows without changing acceptance follows
the ordinary embedded-configuration path and the
[tests summary](../../../tests/docs/db-summaries.md#packet). [fixture:
packet/frontmatter-invalid-keeps-config] [fixture: packet/hidden-yaml-body]
[fixture: packet/config-frontmatter-row-fraction-accepted] [fixture:
packet/config-init-row-integer]

### Architecture

Architecture retains frontmatter and common directive contents without
validating their embedded data. Malformed YAML, duplicate keys and invalid
common configuration types can therefore be accepted here when Mermaid rejects
them. The comparison removes only the rejected data, retaining independent
configuration. Native hidden YAML/DIRECTIVE bodies are ignored forms, not new
configuration blocks. No architecture acceptance key is removed from valid
embedded configuration: drawing settings, maxEdges and maxTextSize do not change
this diagram's public parse acceptance. [fixture:
architecture/div-frontmatter-invalid-yaml] [fixture:
architecture/div-frontmatter-duplicate-key] [fixture:
architecture/div-init-fontfamily-number] [fixture:
architecture/div-init-primitive-wrap] [fixture:
architecture/div-invalid-keeps-config] [fixture:
architecture/hidden-yaml-before-header] [fixture:
architecture/lex-yaml-global-directive] [fixture:
architecture/config-drawing-only] [fixture: architecture/config-site-maxedges]
[fixture: architecture/config-limit-small]

### Radar

Radar retains leading frontmatter and global directive arguments as opaque
shared records; it does not reject their contents. First ask whether the tree
can preserve them: it can, in Frontmatter and Directive. No radar.* key changes
radar acceptance, so there is no radar-specific acceptance key to remove in
either comparison direction. Site, frontmatter and init drawing/options settings
neither reject valid syntax nor rescue missing named entries. [fixture:
radar/frontmatter-invalid] [fixture: radar/frontmatter-invalid-keeps-config]
[fixture: radar/config-invalid-display-mode] [fixture:
radar/config-drawing-only] [fixture: radar/config-options-site] [fixture:
radar/detect-retained-close-no-lf-control] [fixture:
radar/detect-retained-opener-nbsp] [fixture: radar/detect-retained-closer-u3000]
[fixture: radar/lex-bare-accessibility-ids] [fixture: radar/lex-false-prefix-id]

The remaining reverse acceptance difference is validation of embedded data
outside the diagram grammar. Remove only the offending embedded data for the
comparison, preserving unrelated values under the shared comparison rule. A
native hidden YAML/directive form instead has RadarIgnoredText ownership; radar
does not validate it as an embedded payload. Independent shared configuration
reading still follows the tests summary. [fixture:
radar/frontmatter-invalid-keeps-config] [fixture:
radar/config-invalid-display-mode] [fixture: radar/retained-yaml-control]
[fixture: radar/lex-hidden-yaml-global-inside] [fixture:
radar/detect-retained-three-native]

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

- For pie, [PR #4751](https://github.com/mermaid-js/mermaid/pull/4751), merged
  on 2024-02-11, introduced a hidden YAML rule, separate from global leading
  frontmatter extraction. The pinned
  [syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  does not define validation of these hidden bodies. Searches on 2026-10-23 for
  `pie`, `pie YAML` and `pie frontmatter` found no maintainer decision that
  requires those bodies to be validated. This specification applies the shared
  opaque-data policy to leading frontmatter.

For gitgraph,
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
documents the header and commands. Issue/PR searches on 2026-10-23 used
`gitGraph`, `gitGraph directive`, `gitGraph YAML`, `gitGraph semicolon`,
`gitGraph keyword`, `gitGraph duplicate` and `gitGraph cherry-pick`. No
inspected result settles this common boundary behavior.
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) is closed with
Status: Approved; merged
[#6707](https://github.com/mermaid-js/mermaid/pull/6707) adds a duplicate-id
warning. These facts do not justify any additional divergence.

- Info has no dedicated syntax page. The pinned
  [syntax reference](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  describes diagram declarations and percent comments. Searches of issues and
  pull requests on 2026-10-23 used `info showInfo`, `info directive`,
  `info semicolon` and `info accTitle`.
  [#7601](https://github.com/mermaid-js/mermaid/issues/7601) reports
  info/showInfo rendering and was open with Type: Bug / Error and Status:
  Triage. No inspected result establishes an info-specific maintainer decision
  to reject this syntax; this section follows the existing direct rule.

- The pinned
  [packet documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  shows single positions, ranges and relative counts; it does not define this
  preprocessing boundary. Searches of the official repository's issues and pull
  requests on 2026-10-25 used `packet bitsPerRow`, `packet fractional` and
  `packet maxPacketSize`. No inspected result establishes a maintainer ruling on
  this divergence.

- The pinned
  [architecture.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L21-L175)
  documents the header, declarations and edges, without defining this common
  preprocessing boundary. Searches of the official issues/PRs on 2026-10-25 used
  architecture group undefined, architecture quotes title, architecture reverse,
  architecture unclosed and architecture align.
  [#7211](https://github.com/mermaid-js/mermaid/issues/7211) was open with
  Status: Approved and concerns edges from outer parent groups, not a maintainer
  ruling on this common boundary.

- Radar:
  [radar.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/radar.md#L66-L166)
  documents axes, curves and options. The official issues/PRs were searched on
  2026-10-25 for radar directive, radar semicolon and radar entries; no
  inspected result declares the boundaries above a defect.
  [#7187](https://github.com/mermaid-js/mermaid/issues/7187) is a closed
  documentation report marked Status: Approved.
  [#7188](https://github.com/mermaid-js/mermaid/pull/7188) corrects commas in
  documentation examples; it does not add grammar support for a trailing comma.
