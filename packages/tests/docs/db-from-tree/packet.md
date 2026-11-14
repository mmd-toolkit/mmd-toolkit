# Building the packet Db from the tree

Japanese version: [packet.ja.md](./packet.ja.md)

`src/db-from-tree/packet.ts` builds the [summary](../db-summaries.md#packet)
from [ast/packet.md](../../../spec/docs/ast/packet.md). The tree is already
accepted under the
[syntax and semantic conditions](../../../spec/docs/diagrams/packet.md#semantic-acceptance-conditions).
The builder does not repeat the parser's rejection checks.

## Building the summary from the tree

1. **Converted values.** Use the shared converted-text reader for source cuts,
   CR/CRLF, HTML attribute quotes and entity placeholders. Ignore every
   PacketIgnoredText. Decode the converted StringLiteral interior, leaving out
   its quotes: b/f/n/r/t/v/0 escapes become their control characters; other
   escapes lose the backslash without hexadecimal or Unicode decoding. Keep
   label whitespace and empty labels; labels bypass text replacement. [fixture:
   packet/db-label-escapes] [fixture: packet/db-label-single-escapes] [fixture:
   packet/db-label-space] [fixture: packet/db-label-empty-double] [fixture:
   packet/db-label-empty-single] [fixture: packet/line-crlf-label] [fixture:
   packet/html-all-fields] [fixture: packet/entity-all-text] [fixture:
   packet/directive-label-middle] [fixture: packet/hidden-yaml-body] [fixture:
   packet/config-security-level-other]
2. **Common assignments.** Read title, accTitle and both accDescr forms from
   their converted literal ranges, or empty text for null. Trim line values and
   collapse runs of at least two ASCII spaces/tabs. Block values additionally
   trim each line and collapse repeated physical line breaks. Keep the final
   assignment, including an empty assignment that suppresses earlier body
   values. Publish only a nonempty final value; an empty title leaves the shared
   embedded title, and empty accessibility fields leave empty defaults. Apply
   `textReplacementOf(embedded.config)` to these common fields, and
   `descriptionOf` to the final description before replacement. [fixture:
   packet/common-whitespace] [fixture: packet/accdescr-block-lines] [fixture:
   packet/title-repeat] [fixture: packet/title-repeat-empty] [fixture:
   packet/acctitle-repeat-empty] [fixture: packet/accdescr-block-repeat]
   [fixture: packet/frontmatter-empty-body-title] [fixture:
   packet/html-all-fields] [fixture: packet/config-security-level-other]
3. **Configuration.** Read `packet.bitsPerRow` from the supplied embedded/site
   configuration, with 32 for a missing or null value. `embeddedValuesOf`
   restores a recorded `{ "nonFinite": value }` tag, where value is
   `"Infinity"`, `"-Infinity"` or `"NaN"`, to a number before the builder reads
   it. Strings remain strings. The row-boundary multiplication converts the
   width to a number; the loop guard's addition of 1 concatenates a string
   instead. Thus width `"8"` gives a guard bound of `"81"`, while numeric 8
   gives 9. Do not coerce the width once for both operations. [fixture:
   packet/config-frontmatter-row-negative-fraction] [fixture:
   packet/config-frontmatter-row-negative-fraction-string] [fixture:
   packet/config-init-row-integer] [fixture: packet/config-frontmatter-row-null]
   [fixture: packet/config-init-row-null] [fixture:
   packet/config-frontmatter-row-numeric-string] [fixture:
   packet/config-init-row-numeric-string] [fixture:
   packet/config-frontmatter-row-infinity] [fixture:
   packet/config-init-row-overflow] [fixture: packet/config-frontmatter-row-nan]
   [fixture: packet/config-frontmatter-row-negative-infinity] [fixture:
   packet/config-frontmatter-row-infinity-string]
4. **Logical endpoints.** Start the last logical endpoint at -1. A range uses
   its written start and end, a single block its written start, and a relative
   block the last logical endpoint plus 1 and its written count. Read integers
   as IEEE 754 doubles. Fill an omitted end as `start + count - 1`, with count 1
   for a single block, preserving that operation order and double rounding. Set
   the last logical endpoint to this end before splitting, even when the block
   will publish nothing or the cap has already been reached. [fixture:
   packet/gram-mixed] [fixture: packet/gram-zero-range] [fixture:
   packet/db-precision-rounded] [fixture: packet/db-overflow-wide] [fixture:
   packet/db-explicit-end-rounded-continuity] [fixture:
   packet/db-cap-later-logical-end]
5. **Published rows.** Start at row 1 with an empty working row. For each block,
   while the working row's length is at most `bitsPerRow + 1` and fewer than
   10,000 rows have been published, compare `end + 1` with `row * bitsPerRow`.
   If it fits, append the whole remainder. Otherwise append a block ending at
   `row * bitsPerRow - 1`, and continue with the remainder starting at
   `row * bitsPerRow`. Repeat the label on each split block. When the appended
   endpoint plus 1 equals the row boundary, publish the working row, clear it
   and advance the row number. Stop this block when it fits; retain a partial
   working row for the next block. At the end publish a nonempty working row
   only. Preserve row/block order and duplicates, and apply `numberOrText` to
   each published endpoint. Do not retain the adapter's auxiliary bit counts.
   [fixture: packet/db-row-split] [fixture: packet/db-row-exact] [fixture:
   packet/db-same-label] [fixture: packet/db-cap-following-block-unpublished]
   [fixture: packet/db-frontmatter-infinite-endpoint]
6. **Unusual widths.** Negative width -4, NaN and nonnumeric strings fail the
   guard and publish no rows. Width 0 publishes 10,000 rows with start 0 and end
   -1. Width 2.5 produces fractional endpoints, true produces one-bit rows, and
   numeric Infinity allows finite ranges in a single row. A string `"Infinity"`
   instead concatenates and fails the guard. YAML `1e400` is a string, whereas
   init JSON `1e400` is numeric Infinity. Invalid bare `.nan` and `.inf` in init
   are ignored by the shared embedded reader, leaving the default width.
   [fixture: packet/config-frontmatter-row-negative] [fixture:
   packet/config-init-row-negative] [fixture: packet/config-frontmatter-row-nan]
   [fixture: packet/config-frontmatter-row-text] [fixture:
   packet/config-init-row-text] [fixture: packet/config-frontmatter-row-zero]
   [fixture: packet/config-init-row-zero] [fixture:
   packet/config-frontmatter-row-fraction-accepted] [fixture:
   packet/config-init-row-fraction-accepted] [fixture:
   packet/config-frontmatter-row-true] [fixture: packet/config-init-row-true]
   [fixture: packet/config-frontmatter-row-infinity] [fixture:
   packet/config-init-row-infinity-word-string] [fixture:
   packet/config-frontmatter-row-overflow] [fixture:
   packet/config-init-row-overflow] [fixture: packet/config-init-row-nan-token]
   [fixture: packet/config-init-row-infinity-token]

## Recorded comparisons

Compare `specified.json` when present, otherwise `expected.json`, using
`embeddedValuesOf` for the comparison configuration and shared frontmatter
title. Acceptance uses `fixtureAccepts`; an accepting reading must have a tree.
An error record skips Db comparison only when its mark's reading rejects. Report
missing records and retain explicit cases without a comparison Db. Existing
shared readings handle opaque embedded data, HTML frontmatter, C4 detection and
passed bare lines; no packet-local specified reading is added. [fixture:
packet/config-frontmatter-fraction] [fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site] [fixture:
packet/config-directive-overrides-site] [fixture:
packet/frontmatter-invalid-keeps-config] [fixture:
packet/div-html-frontmatter-value] [fixture: packet/div-c4-hidden-yaml]
[fixture: packet/div-detect-yaml-bare-directive-ls] [fixture:
packet/directive-number-middle] [fixture: packet/div-selected-integer-interior]

Parser records use the parser's default settings. A recorded tree can therefore
have a rejecting comparison reading under site configuration; still check its
tree conditions, but compare no Db for that rejecting reading. The parser tests
apply the externally held site width when checking acceptance. [fixture:
packet/config-fraction-reject] [fixture: packet/config-directive-overrides-site]
[fixture: packet/config-frontmatter-overrides-site] [fixture:
packet/error-rounded-following-wide] [fixture:
packet/error-single-rounded-end-wide]
