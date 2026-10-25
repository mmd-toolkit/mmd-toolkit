# Architecture: building the Db from the tree

Japanese version: [architecture.ja.md](./architecture.ja.md)

The [syntax](../../../spec/docs/diagrams/architecture.md) defines acceptance;
its [tree](../../../spec/docs/ast/architecture.md) retains authored forms.
`architectureDbOf` reads an accepted tree, without repeating semantic checks.
The result has exactly the
[architecture summary](../db-summaries.md#architecture) fields. [fixture:
architecture/db-mixed] [fixture: architecture/header-beta]

## Building the summary from the tree

1. **Reading and order.** Read values through the shared converted-text path
   described in [db-from-tree.md](../db-from-tree.md#the-converted-form).
   Publish groups, services, junctions, edges and alignments in that order,
   preserving source order within each kind. `nodes` is services followed by
   junctions. Retained hidden forms publish nothing. The diagram title,
   including frontmatter title, is absent from this summary. [fixture:
   architecture/db-mixed] [fixture: architecture/db-junction-order] [fixture:
   architecture/db-edge-forward-nodes] [fixture:
   architecture/db-align-forward-repeat] [fixture:
   architecture/hidden-yaml-three-fences] [fixture:
   architecture/frontmatter-title] [fixture: architecture/common-repeat-empty]
2. **Accessibility.** Read the converted literal range, or empty text for null.
   Use the shared `commonValue` reading: trim line values and collapse runs of
   two or more ASCII spaces/tabs; block values also trim each line and collapse
   repeated physical line breaks. The last assignment wins, including empty
   assignments that suppress earlier values. Apply `descriptionOf` to the final
   description, then `textReplacementOf(embedded.config)` to both accessibility
   fields. Empty final values leave empty defaults. Diagram title statements
   still remain in the tree. [fixture: architecture/common-all] [fixture:
   architecture/common-repeat-empty] [fixture:
   architecture/common-empty-block-after-value] [fixture:
   architecture/common-block-whitespace] [fixture: architecture/html-all-fields]
3. **Declarations.** Read IDs and explicit `in` references from converted
   Identifier ranges; omit `in` when null. Keep case and prototype-shaped names.
   Each service has type service, each junction type junction; groups have no
   type field. A named icon uses its Identifier interior, without parentheses. A
   text icon uses the converted StringLiteral interior and shared
   `decodedString`: decode b, f, n, r, t, v and 0 after backslash, and remove
   the backslash before any other character. Thus a written Unicode-looking
   escape is not interpreted as a Unicode code point. Empty text icons remain
   published. There is no additional label/icon HTML sanitization. [fixture:
   architecture/db-prototype-ids] [fixture: architecture/db-id-case] [fixture:
   architecture/db-service-forward-parent] [fixture:
   architecture/lex-icon-leading-symbols] [fixture:
   architecture/lex-string-conversion] [fixture:
   architecture/lex-string-number-escape] [fixture:
   architecture/db-empty-values] [fixture: architecture/html-all-fields]
4. **Bracketed titles.** Read the whole converted bracket interior, regardless
   of ArchitectureLabel.kind. Trim it. If it starts and ends with the same
   single or double quote, remove its first and last character, then replace
   backslash-double-quote and then backslash-single-quote with their quotes. A
   lone quote becomes empty. Preserve those escapes when the quote condition
   does not hold. Trim again in either case. Do not decode other escapes. Omit a
   null title; preserve an empty converted title. This conversion does not
   change the tree's lexical kind. [fixture: architecture/lex-title-conversion]
   [fixture: architecture/lex-title-padded-quotes] [fixture:
   architecture/lex-title-unquoted-fallback] [fixture:
   architecture/lex-title-cross-quote-escape] [fixture:
   architecture/lex-title-escaped-newline] [fixture:
   architecture/db-empty-values] [fixture: architecture/directive-fields]
   [fixture: architecture/db-title-quote-only-double] [fixture:
   architecture/db-title-quote-only-single] [fixture:
   architecture/db-title-quote-only-padded] [fixture:
   architecture/db-edge-title-quote-only] [fixture:
   architecture/db-title-bare-escaped-double-quote] [fixture:
   architecture/db-title-bare-escaped-single-quote]
5. **Edges.** Read lhsId/rhsId from their converted references, lhsDir/rhsDir
   from the arrow directions, and lhsInto/rhsInto from whether each marker is
   arrow. Either authored marker character means true. Copy lhsGroup/rhsGroup as
   booleans, including false and modifiers on ungrouped nodes. Convert an arrow
   title by step 4, omitting only null. Preserve edge order, duplicate edges,
   self-edges and equal directions. No generated edge ID, adjacency or resolved
   group endpoint is retained. [fixture: architecture/db-directions] [fixture:
   architecture/db-duplicate-edges] [fixture:
   architecture/gram-edge-reversed-labeled-markers] [fixture:
   architecture/db-group-modifier-one-group] [fixture:
   architecture/db-group-modifier-ungrouped] [fixture: architecture/db-mixed]
6. **Alignments.** Publish each direction and the converted member references,
   preserving member order and repeated statements. Do not merge constraints or
   derive layout. An empty diagram has empty nodes, groups, edges and
   layoutHints arrays. Drawing configuration does not affect publication.
   [fixture: architecture/db-align-forward-repeat] [fixture:
   architecture/db-align-layout-conflict] [fixture: architecture/header-beta]
   [fixture: architecture/config-drawing-only]

## Checking recorded trees

The shared comparison uses `embeddedValuesOf` and the fixture's specified
reading when present. Error records are skipped only when the mark's reading
rejects; missing trees for accepted comparable readings are reported. Cases
without a comparison Db remain explicit under
[the comparison Db](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
Native hidden properties are not embedded configuration. [fixture:
architecture/div-invalid-keeps-config] [fixture:
architecture/div-frontmatter-invalid-yaml] [fixture:
architecture/div-retained-bare-second-scan-ls] [fixture:
architecture/lex-yaml-global-directive]
