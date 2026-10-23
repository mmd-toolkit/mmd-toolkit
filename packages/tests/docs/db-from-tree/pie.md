# Building the pie Db from the tree

Japanese version: [pie.ja.md](./pie.ja.md)

`src/db-from-tree/pie.ts` builds the [pie summary](../db-summaries.md#pie) from
[ast/pie.md](../../../spec/docs/ast/pie.md), using the acceptance rules of
[diagrams/pie.md](../../../spec/docs/diagrams/pie.md).

## Building the summary from the tree

1. **Converted text.** Use the shared converted-text reader: leave out common
   directives, comment regions and selected semicolons; normalize CR/CRLF to LF;
   convert HTML attribute quotes over the body after frontmatter; encode entity
   markers without decoding them. The tree keeps the written values. Hidden YAML
   and DIRECTIVE nodes contribute nothing to the Db. [fixture:
   pie/directive-label-middle] [fixture: pie/comment-label-line] [fixture:
   pie/style-label-trigger] [fixture: pie/label-crlf] [fixture:
   pie/html-all-texts] [fixture: pie/entity-all-texts] [fixture:
   pie/frontmatter-between-section-parts]
2. **Labels.** Read the converted StringLiteral interior and decode a backslash
   followed by `b`, `f`, `n`, `r`, `t`, `v` or `0` as the corresponding control
   character. Every other escape gives its character without the backslash;
   Unicode and hexadecimal escape spellings are not decoded as numbers. Do not
   trim or sanitize labels. Both quote styles, empty labels and prototype-shaped
   names are ordinary Map keys. [fixture: pie/label-escapes] [fixture:
   pie/label-unknown-escapes] [fixture: pie/label-escaped-quotes] [fixture:
   pie/label-whitespace] [fixture: pie/label-empty] [fixture:
   pie/db-prototype-labels]
3. **Numbers and sections.** Read the number spelling as a shared double. Reject
   a converted value less than zero, including on a duplicate label; negative
   zero and negative underflow pass. Keep only the first value of each converted
   label, in first-label source order. Apply `numberOrText`: negative zero
   becomes zero and overflow becomes `"Infinity"`. [fixture: pie/db-slice-order]
   [fixture: pie/db-three-definitions] [fixture:
   pie/review-db-converted-duplicate-single-double] [fixture:
   pie/db-duplicate-negative] [fixture: pie/db-duplicate-negative-zero]
   [fixture: pie/db-duplicate-first-negative-zero] [fixture:
   pie/review-number-negative-underflow-final] [fixture: pie/number-overflow]
4. **Final common assignments.** Walk all common statements in source order,
   including null and whitespace-only values. For each line value trim common
   whitespace at both ends and replace each run of two or more ASCII spaces or
   tabs with one space. For a block trim whitespace on each physical or LS/PS
   line, collapse those horizontal runs, and collapse consecutive line feeds.
   Quotes and backslashes stay text. Only the final converted nonempty value of
   each field is published. A final empty body title leaves the frontmatter
   title; a final empty accessibility value leaves the initially empty Db field,
   rather than retaining an earlier assignment. [fixture: pie/title-spaces]
   [fixture: pie/review-common-single-tab-lines] [fixture:
   pie/review-common-quotes-backslashes] [fixture:
   pie/review-block-whitespace-only-lines] [fixture:
   pie/review-db-common-third-definitions] [fixture:
   pie/review-acctitle-whitespace-final] [fixture:
   pie/review-accdescr-whitespace-final] [fixture:
   pie/review-frontmatter-whitespace-body-final]
5. **Publication and configuration.** Start with the shared frontmatter title
   supplied by `embedded.title`, which is Mermaid's converted reading, and empty
   accessibility strings. Apply `textReplacementOf(embedded.config)` to the
   title and accessibility strings only. Descriptions additionally remove
   whitespace following each LF, as the shared common Db does. Copy `showData`
   from the diagram; drawing configuration creates no additional summary fields.
   [fixture: pie/frontmatter-html] [fixture: pie/frontmatter-title] [fixture:
   pie/frontmatter-title-overridden] [fixture: pie/accdescr-block] [fixture:
   pie/config-security-other] [fixture: pie/config-other-root-false] [fixture:
   pie/showdata-section-inline] [fixture: pie/config-drawing-only]

## Recorded comparisons

Use `specified.json` where present, otherwise `expected.json`. Atomic directive
and selected-semicolon divergences record rejection, not a Db. Opaque embedded
content rejected by Mermaid supplies no Db to compare. The shared HTML and C4
readings apply to pie. The shared bare-percent reading follows detection through
retained nonleading YAML and second-scan directives, preserving those forms
while removing bare lines and the whitespace and line terminators passed with
them. No pie-specific reading branch is added. [fixture:
pie/div-directive-number] [fixture: pie/div-atomic-semicolon-number] [fixture:
pie/div-review-yaml-leading-invalid] [fixture:
pie/div-review-frontmatter-html-cross-label] [fixture: pie/div-detect-c4-label]
[fixture: pie/div-preheader-bare-ls-blank] [fixture:
pie/div-preheader-retained-yaml-bare-ls] [fixture:
pie/div-preheader-retained-yaml-bare-bom] [fixture:
pie/div-preheader-retained-yaml-bare-ls-line] [fixture:
pie/div-preheader-retained-directive-bare-ls] [fixture:
pie/div-preheader-retained-directive-bare-bom] [fixture:
pie/div-preheader-retained-directive-bare-ls-line] [fixture:
pie/div-preheader-retained-yaml-bare-then-directive] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii] [fixture:
pie/lex-preheader-retained-directive-bare-ascii] [fixture:
pie/lex-preheader-retained-yaml-bare-ascii-line] [fixture:
pie/lex-preheader-retained-directive-bare-ascii-line] [fixture:
pie/lex-preheader-retained-yaml-bare-then-directive-ascii]
