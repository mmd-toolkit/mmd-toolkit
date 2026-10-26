# Building a treemap Db from a tree

Japanese version: [treemap.ja.md](./treemap.ja.md)

`treemapDbOf` reads the accepted flat body defined by
[ast/treemap.md](../../../spec/docs/ast/treemap.md), using the
[parent rule](../../../spec/docs/diagrams/treemap.md#indentation-and-parents)
and the [published summary](../db-summaries.md#treemap). It does not decide
acceptance. [fixture: treemap/gram-written-tree] [fixture:
treemap/db-all-fields]

## Building the summary

1. Read all values through the shared converted text: remove common source
   trivia, normalize physical line endings, convert HTML attribute quotes and
   entities, and retain authored text in the tree. No native hidden YAML or
   directive node exists. [fixture: treemap/directive-name-middle] [fixture:
   treemap/directive-style] [fixture: treemap/html-fields] [fixture:
   treemap/entity-names] [fixture: treemap/line-name-values]
2. Read common values with `commonValue`, using empty text for null. Line values
   are trimmed and repeated ASCII spaces/tabs collapse; block values also trim
   each line and collapse repeated physical line breaks. The final assignment
   wins, including an empty assignment that suppresses earlier body text. An
   empty final title falls back to `embedded.title`, then the empty default.
   Apply `descriptionOf` to the final description and
   `textReplacementOf(embedded.config)` to all three published fields. [fixture:
   treemap/common-repeat] [fixture: treemap/common-repeat-empty] [fixture:
   treemap/common-line-whitespace] [fixture: treemap/common-block-whitespace]
   [fixture: treemap/frontmatter-empty-body-title] [fixture:
   treemap/html-fields] [fixture: treemap/config-security-level-other]
3. Visit sections and leaves in body order. Before each row, pop open sections
   whose indent is greater than or equal to that row's indent. Append the row to
   the last remaining section, or to the outer forest. Push only sections;
   leaves close sections by the same comparison but never take children. Common
   statements and class definitions leave the stack unchanged. Indent already
   counts a preceding line's trailing whitespace, tabs as one each and common
   removals; it is not recomputed from physical line starts. Keep duplicate and
   empty names and multiple outer nodes. [fixture: treemap/db-indent-pop]
   [fixture: treemap/db-leaf-not-parent] [fixture: treemap/db-first-indented]
   [fixture: treemap/db-duplicate-names] [fixture: treemap/db-empty-names]
   [fixture: treemap/db-section-tail-space] [fixture: treemap/db-leaf-tail-tab]
   [fixture: treemap/db-class-indented] [fixture:
   treemap/common-block-empty-interleaved]
4. A name is its converted StringLiteral interior, with both quotes removed and
   no backslash decoding or further sanitization. Keep an explicit selector's
   converted Identifier text, including unresolved names. A section always has
   `children`, including an empty array; a leaf has `value` and no `children`.
   Read its complete numeric spelling by removing commas and calling
   `parseFloat`; underscores and later dots stop the numeric prefix. Apply
   shared `numberOrText` to every published value, recording NaN and overflow as
   text. Do not sum section values. [fixture: treemap/lex-string-conversion]
   [fixture: treemap/db-class-missing] [fixture: treemap/db-number-comma]
   [fixture: treemap/db-number-underscore] [fixture:
   treemap/db-number-multiple-dots] [fixture: treemap/db-number-nan] [fixture:
   treemap/db-number-overflow] [fixture: treemap/config-security-level-other]
5. Keep class ids in first-definition order and append styles on redefinition.
   Read the converted whole style, using empty text for null. Replace each `\,`
   with `§§§`, then each remaining comma with `;`, then each nonoverlapping
   `§§§` with a comma from left to right. Split at `;` and trim only the
   trailing whitespace of each entry. Authored signs participate in the same
   replacement: `a§§§b` becomes `a,b`, `a§§§§b` becomes `a,§b`, and `§§\,x`
   becomes `,§§x`; these restored commas stay inside the entry. Retain leading
   whitespace and empty entries: a null style appends one empty entry. Keep
   unused and prototype-shaped class names. Class definitions do not create
   rows. [fixture: treemap/db-class-repeat] [fixture:
   treemap/db-class-empty-final] [fixture: treemap/db-class-escaped-comma]
   [fixture: treemap/db-style-whitespace] [fixture: treemap/db-class-unused]
   [fixture: treemap/db-prototype-names] [fixture:
   treemap/db-class-style-marker] [fixture: treemap/db-class-style-marker-four]
   [fixture: treemap/db-class-style-marker-escaped-comma]
6. Publish only title, accTitle, accDescr, nodes and classDefs. No treemap
   setting supplies a Db value or acceptance condition. Do not derive compiled
   styles, the artificial root, aggregated values, drawing order, coordinates or
   colours. [fixture: treemap/db-all-fields] [fixture:
   treemap/config-drawing-only] [fixture: treemap/config-frontmatter-drawing]
   [fixture: treemap/config-init-drawing]

## Recorded comparisons

Compare with `specified.json` when present, otherwise `expected.json`, and use
`embeddedValuesOf` for shared configuration and title. An accepting reading must
have an ast.json; skip an error record only when its marked reading rejects
under `fixtureAccepts`. Report missing records and keep opaque cases without a
comparison Db explicit under the
[shared comparison rule](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
There is no treemap-local specified reading. [fixture:
treemap/div-invalid-keeps-config] [fixture:
treemap/div-html-frontmatter-reverse] [fixture: treemap/c4-component-section]
[fixture: treemap/div-retained-before-bare-unicode-line]
