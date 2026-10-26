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

### Treemap

Treemap can preserve the whole Frontmatter and each global Directive as opaque
shared records, so no payload validation is needed in the syntax tree. Malformed
YAML and invalid common configuration types may reject only in Mermaid. The
comparison removes the offending data and retains independent configuration; no
treemap-specific acceptance key is removed. Drawing settings cannot reject valid
syntax or rescue invalid syntax. A retained YAML-looking block has no native
rule and still rejects; this divergence does not promote it to frontmatter or an
ignored form. [fixture: treemap/div-frontmatter-invalid] [fixture:
treemap/div-invalid-keeps-config] [fixture: treemap/div-init-fontfamily-number]
[fixture: treemap/div-init-primitive-wrap] [fixture:
treemap/div-init-invalid-colour-base] [fixture:
treemap/config-frontmatter-drawing] [fixture: treemap/config-init-cannot-rescue]
[fixture: treemap/detect-retained-body-yaml-no-native]

### Railroad

Railroad adds no semantic acceptance key: valid railroad drawing configuration
does not change grammar acceptance. Frontmatter and global init contents remain
opaque source records. Malformed YAML and a numeric railroad.fontFamily may make
Mermaid’s derivation fail while a well-delimited diagram remains accepted by
this specification. Configuration still cannot rescue an invalid rule. [fixture:
railroad/ir-div-frontmatter-invalid] [fixture:
railroad/ir-config-frontmatter-drawing] [fixture:
railroad/ebnf-config-init-drawing] [fixture:
railroad/abnf-config-frontmatter-drawing] [fixture:
railroad/peg-config-init-drawing] [fixture:
railroad/ir-config-frontmatter-fontfamily-number] [fixture:
railroad/ebnf-config-init-fontfamily-number] [fixture:
railroad/abnf-config-frontmatter-fontfamily-number] [fixture:
railroad/peg-config-init-fontfamily-number] [fixture:
railroad/ir-config-frontmatter-cannot-rescue] [fixture:
railroad/ebnf-config-frontmatter-cannot-rescue] [fixture:
railroad/abnf-config-init-cannot-rescue] [fixture:
railroad/peg-config-init-cannot-rescue]

For the first question, the shared Frontmatter and Directive records already
hold everything written; no ignored-text node or loss is needed. The remaining
difference is validation of embedded data rather than railroad structure. The
second answer is the established opaque-data rule: the specification does not
duplicate Mermaid’s YAML/JSON/configuration derivation. Native retained YAML is
separately RailroadIgnoredText and does not apply configuration. [fixture:
railroad/ir-frontmatter-title-only] [fixture: railroad/ir-prefix-yaml-no-bare]
[fixture: railroad/ir-div-frontmatter-invalid]

### Wardley

The tree holds recognized real frontmatter and global directives as shared
opaque records. Native retained YAML instead belongs to WardleyIgnoredText and
applies no configuration. Keeping those nodes does not require parsing embedded
YAML or configuration; the existing opaque rule accepts recognized bodies whose
Mermaid data processing fails, with the specified comparison preserving the
title and other valid configuration. Numeric wardley.fontFamily can fail common
configuration handling, whereas the wardley-beta drawing control does not.
Neither is a new Wardley semantic acceptance setting. [fixture:
wardley/div-frontmatter-invalid] [fixture:
wardley/config-frontmatter-fontfamily-number] [fixture:
wardley/config-init-fontfamily-number] [fixture:
wardley/config-fontfamily-keeps-title] [fixture:
wardley/div-invalid-keeps-config] [fixture:
wardley/config-frontmatter-beta-fontfamily-number] [fixture:
wardley/detect-block-after-directive]

### Cynefin

Shared records hold whole recognized frontmatter/global directives, so do not
reject syntax because their YAML or configuration cannot be read. Apply the
shared comparison-configuration rule rather than letting invalid data erase a
valid title or configuration. Retained native YAML is instead
CynefinIgnoredText. [fixture: cynefin/div-frontmatter-invalid] [fixture:
cynefin/div-init-invalid-colour] [fixture: cynefin/div-init-primitive-wrap]
[fixture: cynefin/config-frontmatter-fontfamily-number] [fixture:
cynefin/config-init-fontfamily-number] [fixture:
cynefin/config-fontfamily-keeps-title] [fixture:
cynefin/div-invalid-keeps-config] [fixture:
cynefin/detect-retained-yaml-properties]

The
[pinned grammar](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/cynefin/cynefin.langium#L4-L30)
and
[public adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/cynefin/cynefinParser.ts#L8-L19)
read the result of the common preprocessing/detection pipeline. The
[Cynefin syntax](../diagrams/cynefin.md) states the direct rule and
[tree](../ast/cynefin.md) retains its authored forms. [fixture:
cynefin/db-all-fields]

### eventmodeling

Eventmodeling has no diagram-specific acceptance key to remove. Frontmatter and
global directive records can hold malformed YAML or rejected configuration
without evaluating it; copying configuration validation into the syntax tree
would violate this opaque-data contract. Numeric embedded
eventmodeling.fontFamily and invalid common theme data can fail Mermaid
configuration derivation. The specified comparison removes only rejected
embedded blocks, retaining independent valid title/configuration and native
retained prefixes. Native data bodies and their json/type tags are authored
syntax, not opaque configuration blocks. [fixture:
eventmodeling/div-frontmatter-invalid] [fixture:
eventmodeling/config-frontmatter-fontfamily-number] [fixture:
eventmodeling/config-init-fontfamily-number] [fixture:
eventmodeling/div-init-invalid-colour] [fixture:
eventmodeling/div-init-primitive-wrap] [fixture:
eventmodeling/config-fontfamily-keeps-title] [fixture:
eventmodeling/div-invalid-keeps-config] [fixture:
eventmodeling/prefix-directive-opaque] [fixture:
eventmodeling/prefix-yaml-opaque] [fixture: eventmodeling/data-all-types]

[event-modeling.langium](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/parser/src/language/eventmodeling/event-modeling.langium#L9-L70)
defines the units; [the diagram syntax](../diagrams/eventmodeling.md) defines
their direct boundaries.

### Treeview

Treeview has no diagram-specific acceptance key. Its frontmatter and directive
bodies remain opaque authored data; no treeView key is removed or specially
retained in the comparison. Invalid YAML, nonstring fontFamily, invalid common
theme data and primitive init combined with wrap can reject in Mermaid while the
opaque reading accepts. Preserve valid neighboring title/configuration when
forming that reference. The
[adapter](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/treeView/parser.ts#L11-L57)
and [diagram syntax](../diagrams/treeview.md#semantic-acceptance-conditions) add
no hidden semantic gate. [fixture: treeview/div-frontmatter-invalid] [fixture:
treeview/config-frontmatter-fontfamily-number] [fixture:
treeview/config-init-fontfamily-number] [fixture:
treeview/div-init-invalid-colour] [fixture: treeview/div-init-primitive-wrap]
[fixture: treeview/config-fontfamily-keeps-title] [fixture:
treeview/div-invalid-keeps-config] [fixture:
treeview/config-frontmatter-cannot-rescue] [fixture:
treeview/config-frontmatter-cannot-reject]

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

- Treemap: the pinned
  [treemap documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treemap.md#L24-L115)
  describes quoted rows, indentation and class definitions, without defining
  this common preprocessing boundary. Searches of the official repository's
  issues and pull requests on 2026-10-25 used `treemap frontmatter`; no
  inspected result establishes a maintainer ruling on this divergence.
  [#6590](https://github.com/mermaid-js/mermaid/pull/6590) introduced treemap
  and was merged on 2025-06-27; it is not a ruling on this boundary.

- Railroad: the
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/railroad.md#L1-L280)
  describes the four notations, EBNF exception, ABNF semicolon comments and PEG
  predicates. It does not define native retained YAML or HTML quote context
  across frontmatter. Searches of the official repository’s issues and pull
  requests on 2026-10-26 used railroad frontmatter, railroad directive, railroad
  semicolon and railroad comment.
  [#7979](https://github.com/mermaid-js/mermaid/issues/7979) concerns demo
  header names (closed, Triage);
  [#6620](https://github.com/mermaid-js/mermaid/issues/6620) is an ABNF diagram
  proposal (open, Discussion Needed). Neither establishes a maintainer defect
  decision for these preprocessing boundaries. This divergence follows the
  existing shared rule, not such a decision. The inspected results do not
  establish that no other relevant issue exists.

- Wardley: the
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/wardley.md#L1-L461)
  shows coordinates, decorations and flows without defining this common
  boundary. Searches of the official issues and pull requests on 2026-10-26 used
  wardley directive, wardley semicolon and wardley flow.
  [#7642](https://github.com/mermaid-js/mermaid/pull/7642) fixes hyphenated
  names and [#7726](https://github.com/mermaid-js/mermaid/pull/7726) removes
  unnecessary sanitization; both are reflected in the pin.
  [#8379](https://github.com/mermaid-js/mermaid/pull/8379) was an open
  configuration-retention PR. The inspected results establish no maintainer
  defect decision for this boundary; the existing direct rule applies. The
  search is not claimed to be exhaustive.
- Cynefin’s
  [pinned syntax documentation](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L21-L111)
  describes fixed domains, quoted items and labeled transitions; its
  [notes](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/cynefin.md#L203-L210)
  state that self transitions are ignored.
  [PR #7535](https://github.com/mermaid-js/mermaid/pull/7535) added the diagram
  and was merged. On 2026-10-26, searches for cynefin parser, cynefin directive,
  cynefin semicolon and cynefin frontmatter found no inspected maintainer
  judgment on this boundary.
  [Issue #7921](https://github.com/mermaid-js/mermaid/issues/7921) was open with
  Status: Triage and requested framework naming/drawing changes, not a ruling on
  these lexical rules.

### eventmodeling

The pinned
[eventmodeling.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/eventmodeling.md#L37-L322)
describes frames, data and tags without defining this shared preprocessing
boundary. Searches of the official issues and pull requests on 2026-10-26 used
eventmodeling title, eventmodeling parser, event modeling data, eventmodeling
accTitle and eventmodeling validator.
[PR #7588](https://github.com/mermaid-js/mermaid/pull/7588), merged on
2026-04-16, adds validator registration; it does not establish a maintainer
ruling on this boundary. The inspected results establish no such ruling; the
existing direct rule applies. The search is not claimed to be exhaustive.

### Treeview

The pinned
[treeView.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/treeView.md#L1-L277)
describes indentation, quoted names, annotations and box drawing, without
defining this common boundary. On 2026-10-26 the official issues/PRs were
searched for `treeView quoted`, `treeView indentation`, `treeView box`,
`treeView quotes`, `treeView whitespace` and `treeView accDescr`.
[PR #7721](https://github.com/mermaid-js/mermaid/pull/7721) is the merged
box-drawing addition;
[Issue #8014](https://github.com/mermaid-js/mermaid/issues/8014) is an open
Enhancement/Triage proposal to omit the header. Inspected results establish no
maintainer defect ruling on this boundary; the existing direct rule applies. The
search is not claimed to be exhaustive.
