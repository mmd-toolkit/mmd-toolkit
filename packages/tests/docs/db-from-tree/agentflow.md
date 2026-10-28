# Building the Agentflow Db from the tree

Japanese version: [agentflow.ja.md](./agentflow.ja.md)

`src/db-from-tree/agentflow.ts` builds the summary defined in
[db-summaries.md](../db-summaries.md#agentflow) from
[ast/agentflow.md](../../../spec/docs/ast/agentflow.md), following
[diagrams/agentflow.md](../../../spec/docs/diagrams/agentflow.md). It shares the
conversion, nested-string, shape-name, style and edge-count helpers with
flowchart where the specification imports the same reading; neither diagram's
builder imports the other builder. `src/db-from-tree/graph.ts` holds the shared
nested-string reading and the numbered linkStyle, class and click Db steps.

## Building the summary from the tree

**Converted text.** Read ranges through the common conversion: exclude
directives and selected ignored semicolons, normalize CR/CRLF, replace entities
by their placeholders, and convert HTML attribute quotes using the whole body
source after frontmatter. Written values are checked separately and keep their
source spelling. [fixture: agentflow/lex-cr] [fixture: agentflow/lex-crlf]
[fixture: agentflow/entity-label-contexts] [fixture:
agentflow/html-attribute-quotes] [fixture: agentflow/directive-in-string]
[fixture: agentflow/lex-style-preprocessing-semicolon]

For Agentflow, common comment-region and leading-whitespace removal applies only
above the default size of 50000 UTF-16 units. Measure after the complete
frontmatter trivia, excluding directives and counting CRLF as one. That trivia
includes empty and whitespace-only lines after the closing delimiter, while the
indentation of the first nonblank body line remains in the measurement.
[fixture: agentflow/frontmatter-extra-trivia-boundary] [fixture:
agentflow/frontmatter-extra-trivia-below] [fixture:
agentflow/frontmatter-extra-whitespace-line-boundary] [fixture:
agentflow/frontmatter-extra-trivia-above] [fixture:
agentflow/frontmatter-extra-trivia-indent-above] At or below the limit, omit
only the diagram comments actually recorded by the tree; comment-looking
strings, callbacks, accessibility text and data remain content. The parser does
not take a site maxTextSize. [fixture: agentflow/comment-default-size-equal]
[fixture: agentflow/comment-default-size-fallback] [fixture:
agentflow/comment-default-size-equal-crlf] [fixture:
agentflow/comment-default-size-above-crlf] [fixture:
agentflow/comment-default-size-equal-inline-directive] [fixture:
agentflow/comment-default-size-above-inline-directive] [fixture:
agentflow/comment-default-size-equal-frontmatter] [fixture:
agentflow/comment-default-size-above-frontmatter] [fixture:
agentflow/comment-quoted-label] [fixture: agentflow/comment-split-edge-label]
[fixture: agentflow/lex-accessibility-block-comment] [fixture:
agentflow/db-metadata-comment-directive-body] [fixture:
agentflow/div-data-percent-line-is-content]

After `}`, fold only the immediately following line whitespace through its first
LF into that LF; keep later blank lines and whitespace without a following LF.
String/markdown delimiters are excluded using the shared nested-string contexts.
[fixture: agentflow/lex-brace-string-keeps-blank-line] [fixture:
agentflow/lex-brace-ls-without-lf] [fixture:
agentflow/gram-target-data-trailing-space] [fixture:
agentflow/gram-flow-name-string-bare-tail] [fixture:
agentflow/gram-split-edge-string-bare-tail]

**Common strings and direction.** The frontmatter title comes from `embedded`,
or is empty. Sanitize it with `textReplacementOf(embedded.config)`, as in
[db-from-tree.md](../db-from-tree.md#the-replacement-of-characters). With no
header direction use TB; normalize TD to TB, `>` to LR, `<` to RL, `v` to TB and
`^` to BT. Other written directions, including BR, stay unchanged. A direction
statement changes only its enclosing flow's direction, not the diagram's.
[fixture: agentflow/frontmatter-title] [fixture:
agentflow/db-frontmatter-null-title] [fixture: agentflow/header-only] [fixture:
agentflow/header-td] [fixture: agentflow/header-br] [fixture:
agentflow/header-right-symbol] [fixture: agentflow/header-left-symbol] [fixture:
agentflow/header-down-symbol] [fixture: agentflow/header-up-symbol] [fixture:
agentflow/gram-direction-in-flow]

**Vertex step.** Keep vertices in first-id order. A bare occurrence supplies its
id as text when no earlier text exists. A shape replaces text, labelType and
bracket type; trim and sanitize its label and remove one pair of enclosing
quotes. Metadata aliases do not change the written shape node. Append styles,
retain classes, and create `props` even when empty. Repeated properties replace
values; an initial own `__proto__` property survives, while adding that key to
already existing empty props does not. [fixture:
agentflow/gram-node-three-definitions] [fixture: agentflow/gram-bracket-shapes]
[fixture: agentflow/gram-props-repeated] [fixture:
agentflow/db-props-proto-after-bare] [fixture:
agentflow/db-props-proto-repeated] [fixture: agentflow/db-data-block-aliases]

An existing edge id makes the vertex step change nothing. The reserved id
`connectors` creates no ordinary vertex, including for a styled or metadata
occurrence. [fixture: agentflow/db-generated-edge-id-metadata-target] [fixture:
agentflow/db-data-block-reserved-connectors] [fixture:
agentflow/spec-agentflow-metadata-no-validation-92cc9f70]

**Groups and links.** Read each group's vertices in order. Apply an occurrence's
class suffix to its comma-separated id parts; apply its adjacent data blocks
after creating the next group member, or after the last member at group end.
Read a link's target group before creating its edges. Each source vertex pairs
with each target vertex, in that order; chains continue from the previous target
group. [fixture: agentflow/gram-group-data] [fixture:
agentflow/gram-style-suffix] [fixture: agentflow/gram-group-spaces] [fixture:
agentflow/gram-edge-chain] [fixture: agentflow/db-data-block-routing]

Sequence, failure and reference arrows give `arrow_point`/normal,
`arrow_cross`/normal, and `arrow_open`/dotted. For a solid arrow, Db length is
the written dash count minus one; for a reference it is the dot count. Cap both
at ten, leaving the tree's length uncapped. Labels use their converted, trimmed,
sanitized text, without enclosing quotes, and their written kind; no label gives
empty text and kind text. [fixture: agentflow/gram-three-edge-kinds] [fixture:
agentflow/db-edge-length-cap] [fixture:
agentflow/lex-reference-long-length-at-cap] [fixture:
agentflow/gram-reference-quoted-pipe-label] [fixture:
agentflow/lex-edge-whitespace-label]

Use a written edge id for the last-source/first-target pair if unused. Otherwise
generate `L_<source>_<target>_0`, then suffixes 2, 3, and so on for earlier
edges with that endpoint pair. Later edges take the current default
interpolation. [fixture: agentflow/gram-edge-id] [fixture:
agentflow/db-edge-id-repeated] [fixture:
agentflow/gram-linkstyle-interpolate-default]

**Names and flows.** A Name is not one normalized label: concatenate only its
Label parts in converted form, excluding their initial string delimiters. Erased
click/empty forms contribute nothing, as does the one whitespace unit outside a
click-context fragment. Trim the joined name for the id: `flow click A`, then
`B`, gives AB; `Handle click events`, then `B`, gives `Handle eventsB`.
[fixture: agentflow/lex-flow-name-click-state] [fixture:
agentflow/lex-flow-name-click-mixed] [fixture:
agentflow/gram-flow-name-quoted-padding] [fixture:
agentflow/gram-flow-name-space-between-empty-blocks] [fixture:
agentflow/lex-empty-string-in-flow-name] [fixture:
agentflow/lex-directive-in-name-empty-block-padding]

AgentflowIgnoredText.kind records the recognized erased form or direction-line
text for tree checks. The Db builder reads neither kind nor value from these
nodes: names use only Label parts, direction statements use their direction
field, and click steps use their operands. [fixture:
agentflow/lex-flow-name-click-state] [fixture:
agentflow/lex-direction-line-greedy] [fixture:
agentflow/gram-empty-description-before-href]

Complete a flow after its body, including nested containers. An unnamed id is
`subGraph` followed by the number of earlier completed declarations, including
repeated ids. A named flow without a title has empty title and labelType text;
an unnamed flow has empty title and labelType markdown. An explicit title uses
its trimmed sanitized text and written kind. Repeated ids append each new member
once to the first record and replace a nonempty title and a supplied direction,
retaining the first labelType and map position. [fixture:
agentflow/gram-flow-all-forms] [fixture: agentflow/gram-nested-unnamed-flow]
[fixture: agentflow/db-flow-three-definitions] [fixture:
agentflow/db-duplicate-flow-empty-last-title] [fixture:
agentflow/db-flow-repeat-before-unnamed]

A vertex statement contributes ids from its groups last to first, each group in
written order. Nested flows and connectors contribute their read ids, nonempty
accessibility texts their trimmed text, and EmptyStatement its semicolon. Other
statements contribute nothing. Build each declaration's candidate list by
removing blank and duplicate members, the flow's own id, global ids, and ids
claimed by earlier completed flows, but retain every `__proto__` occurrence in
that list. An initial declaration keeps that list. A repeated id keeps its
existing members, including repeated `__proto__` occurrences, and appends a
candidate only when it is not already present. Thus a repeated declaration adds
at most one new `__proto__`, including on a third declaration; it does not
collapse repetitions from the initial declaration. Keep original endpoints and
membership rather than layout's collapsed or cycle-adjusted records. [fixture:
agentflow/gram-group-spaces] [fixture: agentflow/lex-accessibility-scope]
[fixture: agentflow/gram-flow-hasownproperty-before-empty-statement] [fixture:
agentflow/lex-flow-prototype-members] [fixture:
agentflow/db-flow-self-reference] [fixture: agentflow/gram-flow-nested]
[fixture: agentflow/db-flow-collapse] [fixture:
agentflow/db-diagnostics-containment-cycle]

[`addSubGraph`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/agentflow/agentflowDb.ts#L1187-L1265)
uses ordinary object keys to remove candidate duplicates, but `includes()` to
merge into an existing member list. Assigning a boolean to the object's
`__proto__` creates no own key, so every occurrence survives the first step; the
merge checks the members already appended as well. [fixture:
agentflow/db-flow-proto-initial-repeated] [fixture:
agentflow/db-flow-proto-redefinition] [fixture:
agentflow/db-flow-ordinary-redefinition] [fixture:
agentflow/db-flow-proto-initial-then-redefinition] [fixture:
agentflow/db-flow-proto-third-definition] [fixture:
agentflow/db-flow-proto-second-then-third] [fixture:
agentflow/db-flow-proto-claimed-by-other] [fixture:
agentflow/db-flow-proto-merge-order]

A flow's last direct direction statement supplies `dir`; nested directions do
not. Otherwise inherit the diagram direction when effective
`flowchart.inheritDir` is truthy; the default is false. A global contributes no
container or outer member: mark its nonempty contributed ids global and release
them from existing and later flow membership. [fixture:
agentflow/gram-direction-in-flow] [fixture: agentflow/config-inherit-site]
[fixture: agentflow/gram-global-nested] [fixture:
agentflow/gram-global-after-flow] [fixture: agentflow/db-global-flow-id]
[fixture: agentflow/db-global-connector-membership]

**Connectors.** A blank read id creates nothing. Otherwise create a connector
vertex with labelType text, empty styles/classes, and no props; its text is the
trimmed sanitized nonempty title or the id. A declaration replaces an ordinary
vertex of the same id; an existing connector keeps metadata/styles/classes and
changes text only for a nonempty title. A subsequent ordinary vertex occurrence
can give it props. [fixture: agentflow/gram-connector-name-whitespace-only]
[fixture: agentflow/gram-connector-all-forms] [fixture:
agentflow/gram-connector-markdown-title] [fixture:
agentflow/db-metadata-before-connector] [fixture:
agentflow/db-connector-three-definitions] [fixture:
agentflow/db-connector-repeated-without-title]

**Classes and styles.** Class application appends the class to the vertex, first
edge, and flow with each id, where present. A style statement applies the vertex
step to its one id, including commas, creating a missing vertex. A classDef
appends styles for each name, including null as empty text, replacing an escaped
comma by a comma. Other style commas remain separators. Trim only trailing style
whitespace in the summary. [fixture: agentflow/db-all-fields] [fixture:
agentflow/gram-class-semicolon] [fixture: agentflow/gram-classdef-multi]
[fixture: agentflow/gram-classdef-escaped-comma] [fixture:
agentflow/gram-style-whitespace-after-comma] [fixture:
agentflow/db-node-style-first-leading-spaces]

Numbered linkStyle replaces each named edge's interpolation when supplied and
styles when present. Add `fill:none` if no style starts with `fill`, testing
leading whitespace too. Without styles keep the existing styles. The default
alternative replaces only the supplied edgeDefaults fields; its styles gain no
`fill:none` and do not overwrite existing edges. [fixture:
agentflow/db-style-leading-whitespace] [fixture:
agentflow/gram-linkstyle-interpolate-index] [fixture:
agentflow/gram-linkstyle-default] [fixture:
agentflow/gram-linkstyle-interpolate-default]

**Clicks and accessibility.** A callback appends `{id, name, args}` for every
id, even unknown ids, with opaque converted name/argument padding and null for
absent arguments. A URL sets each existing vertex's trimmed link and target,
removing either when absent or empty. Both apply class clickable. Tooltips keep
untrimmed sanitized text, replace by id, and retain first-id order. The
textBeforeUrl/textBeforeTooltip fields affect no Db value. [fixture:
agentflow/gram-click-callback-forms] [fixture:
agentflow/gram-click-callback-space-args] [fixture:
agentflow/db-call-name-space-before-parentheses] [fixture:
agentflow/db-click-missing-id] [fixture:
agentflow/db-trailing-click-url-whitespace] [fixture:
agentflow/db-tooltip-three-definitions] [fixture:
agentflow/gram-click-erased-before-url] [fixture:
agentflow/gram-click-erased-before-callback-tooltip]

Accessibility statements replace the common title/description in source order,
including inside flows. Normalize description LF and following whitespace to a
single LF. A missing line value sets empty text; a closed empty block changes
nothing; an unclosed block sets an empty description regardless of retained
text. [fixture: agentflow/lex-accessibility-scope] [fixture:
agentflow/db-accessibility-repeated] [fixture:
agentflow/db-accessibility-whitespace-block] [fixture:
agentflow/db-acctitle-eof] [fixture: agentflow/db-accessibility-empty-block]
[fixture: agentflow/db-accessibility-unclosed-block] [fixture:
agentflow/db-accessibility-empty-unclosed]

**Opaque data effects.** Consume one recorded `dataBlockEffects` entry per
adjacent block group, not per block, in the order of the grammar's Db calls:
vertex-group order above, and heading data after a flow's body completes. Apply
its own fields to an existing flow, then connector, then first edge, then vertex
of that id. An ignored reserved `connectors` occurrence or blank connector id
can have an empty effect without an element. Check that every entry is consumed
once and its id matches. Never parse YAML or reconstruct metadata keys.
[fixture: agentflow/db-data-block-adjacent] [fixture: agentflow/gram-group-data]
[fixture: agentflow/gram-flow-inline-data] [fixture:
agentflow/db-data-block-routing] [fixture:
agentflow/db-connector-edge-id-collision] [fixture:
agentflow/db-flow-connector-collision] [fixture:
agentflow/db-data-block-reserved-connectors] [fixture:
agentflow/db-connector-empty-id-data]

Effects already preserve props, unknown metadata, alias copies and recursive
non-finite number text (`Infinity`, `-Infinity`, `NaN`); they do not expose YAML
syntax as nodes. Diagnostics and derived drawing fields are not built. [fixture:
agentflow/db-metadata-yaml-shared-alias] [fixture:
agentflow/db-data-block-recursive-prototype-keys] [fixture:
agentflow/db-metadata-nested-map-infinity] [fixture:
agentflow/db-metadata-nested-nan] [fixture:
agentflow/db-data-block-presentation-metadata] [fixture:
agentflow/db-diagnostics-no-semantic-checks]

## Recorded comparisons

Compare with `specified.json` when present, otherwise `expected.json`. The
body-only frontmatter HTML and bare-percent pre-header readings use their
specified results; opaque content rejections with no accepted recorded Db have
only a tree check. Whole-unit boundary and tokenless-empty-form rejections are
checked without reconstructing an atom or inventing an ignored statement. No
Agentflow registration is needed in `divergence-removals.ts`: it has no
flowchart registrations either; these six identifiers use the existing common
specified-reading path or the tree's acceptance rules. [fixture:
agentflow/div-frontmatter-attribute-blocks-body-tag] [fixture:
agentflow/div-percent-braces-before-header] [fixture:
agentflow/db-data-block-invalid-yaml] [fixture:
agentflow/div-metadata-yaml-self-alias] [fixture:
agentflow/div-directive-in-arrow] [fixture:
agentflow/div-ignored-semicolon-in-arrow] [fixture:
agentflow/div-empty-string-statement]
