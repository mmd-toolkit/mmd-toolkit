# Radar: building the Db from the tree

Japanese version: [radar.ja.md](./radar.ja.md)

`radarDbOf` reads an accepted [radar tree](../../../spec/docs/ast/radar.md). The
[syntax](../../../spec/docs/diagrams/radar.md#semantic-acceptance-conditions)
defines semantic acceptance; the builder does not decide it again. The result
has exactly the [radar summary](../db-summaries.md#radar) fields. [fixture:
radar/db-all-fields] [fixture: radar/error-reference-label]

## Building the summary from the tree

1. **Reading and order.** Read source ranges through the shared
   [converted-text path](../db-from-tree.md#the-converted-form), including
   common cuts, CR/CRLF, HTML attribute quotes and entity placeholders. Publish
   all axes, then all curves, then options, preserving source order within each
   collection. A later axis can therefore supply a curve's reference. Ignore
   every RadarIgnoredText; native YAML and directives have no properties to
   publish. An independent common directive still has its shared embedded
   effect. [fixture: radar/db-forward-axis] [fixture: radar/line-cr-values]
   [fixture: radar/html-fields] [fixture: radar/entity-labels] [fixture:
   radar/directive-axis-label] [fixture: radar/hidden-yaml-body] [fixture:
   radar/lex-hidden-yaml-global-inside]
2. **Common assignments.** Read title, accTitle and both description forms from
   converted literal ranges, or empty text for null. Use `commonValue`: trim
   line values and collapse runs of two or more ASCII spaces/tabs; block values
   additionally trim each line and collapse repeated physical line breaks. The
   final assignment wins, including an empty assignment that suppresses earlier
   body values. An empty final title leaves `embedded.title`, or the empty
   default; empty accessibility values leave empty defaults. Apply
   `descriptionOf` to the final description, then
   `textReplacementOf(embedded.config)` to all three published fields. [fixture:
   radar/common-all] [fixture: radar/common-line-whitespace] [fixture:
   radar/common-block-whitespace] [fixture: radar/common-repeat] [fixture:
   radar/common-repeat-empty] [fixture: radar/frontmatter-empty-body-title]
   [fixture: radar/db-security-label-padding] [fixture: radar/html-fields]
3. **Labels.** An axis or curve with no label uses its converted name. An
   explicit label uses its converted StringLiteral interior, without quotes, and
   shared `decodedString`: backslash b/f/n/r/t/v/0 become their control
   characters; any other escape loses its backslash without hexadecimal or
   Unicode decoding. Preserve empty labels, label padding, repeated names and
   prototype-shaped names. Labels receive no additional sanitization. Omit
   declaration names from the summary. [fixture: radar/db-empty-labels]
   [fixture: radar/lex-string-conversion] [fixture:
   radar/db-security-label-padding] [fixture: radar/lex-string-multiline]
   [fixture: radar/db-duplicate-axes] [fixture: radar/db-duplicate-curves]
   [fixture: radar/db-prototype-names] [fixture: radar/html-fields]
4. **Entries.** Keep positional entries in written order, even without axes or
   when their count differs from the axis count. Named entries produce one
   numeric value per axis, in axis order, using the first entry with that exact
   name. Duplicate axes repeat that first value; extra names are unpublished.
   Read numeric ranges as doubles and apply shared `numberOrText` to every
   published number: non-finite values are text, and negative zero is zero. Keep
   the tree's raw spellings, optional colons and original entry list unchanged.
   [fixture: radar/db-positional-no-axis] [fixture: radar/db-positional-short]
   [fixture: radar/db-positional-long] [fixture: radar/db-all-fields] [fixture:
   radar/db-detailed-zero-first] [fixture: radar/db-detailed-zero-last]
   [fixture: radar/db-duplicate-axes] [fixture: radar/db-extra-detailed-entry]
   [fixture: radar/db-number-rounded] [fixture: radar/db-number-overflow]
   [fixture: radar/db-number-underflow] [fixture:
   radar/gram-detailed-colon-mixed-spelling]
5. **Options.** Start with showLegend true, ticks 5, max null, min 0 and
   graticule circle. The last occurrence of each option wins, including false
   and zero. Read numeric options as doubles; cap ticks at 32 and apply
   `numberOrText`. Preserve fractional ticks below the cap and a null absent
   maximum. Fixed words become a boolean for showLegend and a string for
   graticule. Do not compute an automatic maximum or clip entries to min/max.
   [fixture: radar/spec-radar-test-ts-f0c0291e] [fixture:
   radar/db-options-repeat] [fixture: radar/db-ticks-cap-last] [fixture:
   radar/db-ticks-cap-before-final] [fixture: radar/db-ticks-cap-fraction]
   [fixture: radar/db-all-fields] [fixture: radar/db-option-overflow] [fixture:
   radar/db-min-above-max]
6. **Configuration.** No radar.* setting supplies Db options or a publication
   rejection condition. Site, frontmatter and init drawing/options settings
   remain shared configuration. Do not derive coordinates, colours or other
   renderer values. [fixture: radar/config-drawing-only] [fixture:
   radar/config-options-site] [fixture: radar/config-frontmatter-options]
   [fixture: radar/config-init-options] [fixture:
   radar/config-frontmatter-options-cannot-reject] [fixture:
   radar/config-init-options-cannot-reject]

## Recorded comparisons

Use `specified.json` when present, otherwise `expected.json`, and obtain shared
configuration and title through `embeddedValuesOf`. The common comparison
reports missing records; an accepting reading must have a tree. An error record
is skipped only when its mark's reading rejects under `fixtureAccepts`. Keep
accepted opaque cases without a comparison Db explicit under
[the shared comparison rule](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
No radar-local specified reading is added. [fixture:
radar/frontmatter-invalid-keeps-config] [fixture:
radar/config-invalid-display-mode] [fixture: radar/div-html-frontmatter-reverse]
[fixture: radar/c4-component-axis-label] [fixture:
radar/div-detect-yaml-bare-secondscan-native-ls]
