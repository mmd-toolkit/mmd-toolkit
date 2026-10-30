# Building the Usecase Db from the tree

Japanese version: [usecase.ja.md](./usecase.ja.md)

`src/db-from-tree/usecase.ts` builds the stored summary of
[db-summaries.md](../db-summaries.md#usecase) from the written occurrences of
[ast/usecase.md](../../../spec/docs/ast/usecase.md). Native acceptance follows
[diagrams/usecase.md](../../../spec/docs/diagrams/usecase.md); the same model
validation serves `checkTree`. JSON interiors stay opaque.

## Building the summary from the tree

1. **Converted values.** Read the written value and range of each leaf through
   `convertedValuesOf`: remove common directives, comment regions and selected
   semicolons, normalize CR/CRLF to LF, encode entities as placeholders, and
   convert HTML attribute quotes using the whole body after frontmatter. Leave
   string/markdown delimiters out. Element labels, notes, stereotypes and native
   metadata keep these converted characters without the layout sanitizer.
   [fixture: usecase/directive-in-label] [fixture:
   usecase/lex-native-single-quote-comment-region-ls] [fixture:
   usecase/lex-statements-crlf] [fixture: usecase/lex-markdown-cr] [fixture:
   usecase/entity-all-texts] [fixture: usecase/gram-html-double-attribute]
   [fixture: usecase/gram-html-actor-icon] [fixture:
   usecase/lex-style-trigger-metadata-icon]
2. **Names and declarations.** An explicit Identifier gives its converted name.
   A quoted-only name gives its converted content with each non-ASCII-word
   UTF-16 code unit replaced by `_`; the empty content gives an empty id. The
   display label is the converted authored label: markdown keeps `markdown`,
   while bare and plain-quoted labels use `text`. Without a label, use the
   explicit id and `text`. Repeated compatible explicit declarations merge
   classes and retain their position; generated declarations collide even when
   their labels agree. [fixture: usecase/gram-entity-derived-id] [fixture:
   usecase/gram-empty-quoted-name] [fixture:
   usecase/gram-generated-label-repeat] [fixture: usecase/db-three-definitions]
   [fixture: usecase/gram-bare-declaration-label-conflict] [fixture:
   usecase/gram-bare-endpoint-keeps-declared-label]
3. **Resolution and map order.** Collect declarations throughout the diagram
   before resolving bare or quoted-only relationship references. Actor-keyword
   sources and endpoints with a shape, metadata or stereotype declare; other
   endpoints refer, and unresolved ones become implicit usecases. Model maps
   follow the first declaration/endpoint occurrence of each id, independently
   within each kind. Relationships and notes retain statement order. Metadata,
   class and style updates resolve existing targets rather than creating them.
   [fixture: usecase/db-generated-reference] [fixture:
   usecase/gram-generated-reference-not-declaration] [fixture:
   usecase/gram-target-metadata-declaration] [fixture:
   usecase/gram-classes-on-reference-only] [fixture:
   usecase/db-json-source-map-order] [fixture: usecase/db-note-order] [fixture:
   usecase/db-metadata-forward] [fixture: usecase/db-class-forward] [fixture:
   usecase/db-style-forward]
4. **Geometry and membership.** Actors default to `normal` and business false; a
   nonempty icon selects `icon` and retains its text, while an empty icon is
   omitted. Usecases default to ellipse and business false; AST `rectangle`
   becomes Db `rect`. Boundaries default to `rect`, with native type updates
   selecting `package` or `rect`. Trim stereotype interiors with common
   whitespace, retaining a nonempty result. A declaration inside a nonempty
   boundary id gets `parentId`; outside occurrences retain earlier membership,
   and an empty boundary id adds no parent. Do not recreate the omitted members
   list. [fixture: usecase/db-actor-variants] [fixture:
   usecase/gram-actor-icon-clear] [fixture: usecase/db-all-fields] [fixture:
   usecase/gram-stereotype-trimmed-conflict] [fixture:
   usecase/lex-stereotype-bom-padding] [fixture:
   usecase/db-boundary-three-definitions] [fixture:
   usecase/gram-boundary-three-classes-types] [fixture:
   usecase/db-empty-boundary-id]
5. **Native metadata.** Read ordered key/value children, leaving quotes out and
   interpreting only bare `true` and `false` as booleans. Validate each
   property's key, type and vocabulary for its resolved target. Repeated
   actor/usecase declaration properties must agree; boundary properties update.
   Apply all standalone updates after declaration metadata, in their own source
   order. Validate final icon/type/business combinations afterwards, permitting
   a final repair but never erasing an earlier declaration conflict or invalid
   property. An edge animation sets animate true even after an explicit animate
   false. [fixture: usecase/lex-native-single-quoted-keys] [fixture:
   usecase/gram-native-quoted-business] [fixture:
   usecase/gram-metadata-unknown-key] [fixture:
   usecase/gram-metadata-duplicate-inline-conflict] [fixture:
   usecase/gram-metadata-standalone-before-inline] [fixture:
   usecase/gram-native-final-invalid-then-valid] [fixture:
   usecase/gram-native-inline-conflict-later-fix] [fixture:
   usecase/gram-native-invalid-property-later-fix] [fixture:
   usecase/db-animation-order]
6. **Relationships and notes.** Preserve written endpoint order. Association
   arrowType is 0 for a forward point, 1 for a backward point, 2 for no marker,
   3/4 for a forward circle/cross, and 5/6 for a backward circle/cross. A solid
   point or markerless line has minlen equal to its dash count minus one; circle
   and cross kinds have minlen 1. A split line takes its start marker from the
   opening and its length from the closing. Semantic kinds use arrowType 0 and
   minlen 1; include/extend supply their lower-case semantic word as a text
   label. Association labels and note labels keep converted content and kind,
   including empty quoted content. Only explicit relationship ids remain; no
   generated edge/note id or derived note connector is rebuilt. [fixture:
   usecase/db-arrows] [fixture: usecase/db-arrow-length] [fixture:
   usecase/db-labeled-arrows] [fixture: usecase/db-semantic-case] [fixture:
   usecase/gram-edge-empty-markdown-label] [fixture:
   usecase/gram-edge-whitespace-label] [fixture: usecase/db-edge-id-style]
   [fixture: usecase/db-note-order]
7. **Classes and styles.** Accumulate written suffix classes, then apply class
   assignments in their source order. The initial suffix retains repetitions;
   later declarations and class assignments append only classes not already
   present. [fixture: usecase/gram-class-suffix-duplicate] [fixture:
   usecase/gram-class-many] Keep class definitions separate: a later definition
   replaces the styles at that class's original map position. Direct styles
   append. Each CSS declaration is its complete converted range, including
   padding before and after its colon, trimmed at its exterior, with every `\,`
   converted to `,`; keep quoted CSS components as written. Do not compile class
   styles into nodes. [fixture: usecase/db-three-definitions] [fixture:
   usecase/db-classdef-replace] [fixture: usecase/db-style-append] [fixture:
   usecase/lex-css-property-padding] [fixture:
   usecase/lex-style-quoted-value-and-comma] [fixture:
   usecase/gram-styles-components] [fixture:
   usecase/gram-class-styles-resolution-order]
8. **Opaque JSON effects.** Consume exactly one
   `{ id, set: { value, propertyOrder } }` effect per UsecaseJsonStatement in
   authored order. Require the corresponding id and both fields, and reject
   missing, extra or reordered effects. Assign only those two supplied fields;
   classes/styles still come from syntax. Neither the builder nor the tree check
   reads JSON properties or validates JSON content. Map ordering is resolved
   separately from effect consumption. [fixture:
   usecase/db-json-source-map-order] [fixture: usecase/db-json-integer-order]
   [fixture: usecase/db-json-duplicate-order] [fixture:
   usecase/gram-json-object-scalar-overwrite] [fixture:
   usecase/div-gram-json-unquoted-key]
9. **Direction and common strings.** Start with direction `LR`; the last
   direction statement wins, with `TD` normalized to `TB`. The title stays empty
   because this pin clears it after receiving frontmatter. Accessibility lines
   and blocks replace earlier values, with exactly empty content giving empty
   text. Trim the converted title value; descriptions additionally remove
   whitespace after each LF. Apply the shared
   `textReplacementOf(embedded.config)` sanitizer only to accessibility strings.
   Its htmlLabels/securityLevel behavior is defined in
   [db-from-tree.md](../db-from-tree.md#the-replacement-of-characters).
   [fixture: usecase/db-direction-all] [fixture: usecase/db-direction-td]
   [fixture: usecase/frontmatter-title] [fixture: usecase/db-accessibility]
   [fixture: usecase/db-acctitle-empty] [fixture: usecase/db-accdescr-empty]
   [fixture: usecase/config-security-other] [fixture:
   usecase/config-security-other-root-false]

## Recorded comparisons

Use `specified.json` where present, otherwise `expected.json`. Whole-unit
rejections marked directive-as-token-boundary or
ignored-semicolon-as-token-boundary have recorded errors rather than accepted Db
comparisons. Opaque embedded contents rejected by Mermaid have no accepted Db to
compare. The HTML, C4 and leading-percent divergences use the existing
specified-reading mechanism, including an accepted reading whose accessibility
Db differs. No usecase-only divergence mechanism is needed. [fixture:
usecase/div-directive-in-id] [fixture:
usecase/div-semicolon-identifier-selected] [fixture:
usecase/div-gram-json-malformed-escape] [fixture:
usecase/div-html-frontmatter-acc-title-db] [fixture:
usecase/div-c4-dynamic-json] [fixture: usecase/div-comment-preheader-bare]
