# Eventmodeling: building the Db from the tree

Japanese version: [eventmodeling.ja.md](./eventmodeling.ja.md)

`eventmodelingDbOf` reads an accepted
[authored tree](../../../spec/docs/ast/eventmodeling.md) and returns the
[eventmodeling summary](../db-summaries.md#eventmodeling). Acceptance belongs to
the
[syntax](../../../spec/docs/diagrams/eventmodeling.md#semantic-acceptance-conditions)
and parser result records. No reference resolution or validator is run here.
[fixture: eventmodeling/gram-written-tree] [fixture:
eventmodeling/db-source-missing] [fixture:
eventmodeling/validator-command-invalid]

## Building the summary from the tree

1. **Converted source.** Use the shared
   [converted form](../db-from-tree.md#the-converted-form) for the supplied
   source and tree: omit common directives and selected semicolons, and the
   comment regions only when the source is longer than `maxTextSize` (comment
   lines are otherwise left in the text, as for agentflow; those outside any
   value are shared Comments, and those inside a block value, a note, an
   `accDescr {…}` or a hidden form are part of its text); normalize CR/CRLF,
   convert source-wide HTML attribute quotes after real frontmatter, and retain
   entity placeholders. Read name segments separately and join qualified names
   with dots. Native ignored forms do not publish configuration. [fixture:
   eventmodeling/entity-texts] [fixture: eventmodeling/entity-common] [fixture:
   eventmodeling/html-common] [fixture: eventmodeling/line-block-values]
   [fixture: eventmodeling/space-qualified-name] [fixture:
   eventmodeling/directive-qualified] [fixture:
   eventmodeling/lex-hidden-yaml-fence-directive]
2. **Whole common terminals.** The tree's common value fields hold payloads
   only. Read the whole statement range, including keyword and delimiters, and
   its immediately preceding surviving ASCII space/tab run, as
   [Common statement values](../../../spec/docs/ast/eventmodeling.md#common-statement-values)
   defines. Count that run after every common removal: spaces on both sides of a
   removed directive or selected semicolon join. For example, a selected
   semicolon changes ` \t; accDescr: D` to ` \t accDescr: D`. When the source is
   longer than `maxTextSize`, a comment region loses its own padding and
   terminating LF; otherwise a comment line's own padding belongs to the comment
   and its LF remains. A closed global directive alone, a blank line and a
   selected semicolon leave LF; LF, LS and PS are outside the horizontal run.
   The accepted tree already satisfies the
   [indentation conditions](../../../spec/docs/diagrams/eventmodeling.md#common-statements):
   judge LF consumption after removals, including a semicolon removal exposing
   LF directly after a native directive closer. An unselected semicolon remains
   syntax, and an empty description block remains a statement boundary; do not
   join prefixes across either. Do not apply common-converter trimming,
   whitespace collapse or escape decoding to these terminals. [fixture:
   eventmodeling/gram-common-leading-directive-both-sides] [fixture:
   eventmodeling/gram-common-leading-directive-before-padding] [fixture:
   eventmodeling/gram-common-leading-directive-after-padding] [fixture:
   eventmodeling/gram-common-leading-directive-after-header] [fixture:
   eventmodeling/gram-common-block-leading-directive] [fixture:
   eventmodeling/gram-common-leading-semicolon-both-sides] [fixture:
   eventmodeling/gram-common-leading-semicolon-after-padding] [fixture:
   eventmodeling/gram-common-leading-semicolon-before-padding] [fixture:
   eventmodeling/gram-common-leading-comment-region-padding] [fixture:
   eventmodeling/lex-common-yaml-comment-line-padding] [fixture:
   eventmodeling/lex-common-block-comment-line-padding] [fixture:
   eventmodeling/lex-common-native-directive-comment-line-padding] [fixture:
   eventmodeling/lex-common-yaml-directive-only-line] [fixture:
   eventmodeling/lex-common-block-directive-only-line] [fixture:
   eventmodeling/lex-common-yaml-blank-line-padding] [fixture:
   eventmodeling/lex-common-block-inline-directive-padding] [fixture:
   eventmodeling/lex-common-selected-semicolon-exposes-lf] [fixture:
   eventmodeling/lex-common-selected-semicolon-padding] [fixture:
   eventmodeling/lex-common-selected-semicolon-before-lf] [fixture:
   eventmodeling/lex-common-unselected-semicolon-padding] [fixture:
   eventmodeling/lex-common-after-block-ls-indented] [fixture:
   eventmodeling/lex-common-after-block-ps-indented] [fixture:
   eventmodeling/gram-common-leading-semicolon-unselected] [fixture:
   eventmodeling/lex-common-empty-description-inline-padding] [fixture:
   eventmodeling/lex-common-empty-description-leaves-lf] [fixture:
   eventmodeling/gram-common-leading-empty-description-boundary]
3. **Accessibility setters.** Start with empty `accTitle` and `accDescr`.
   Process accessibility assignments in source order; the final assignment wins
   even when the payload is null, because its full terminal still contains its
   keyword and delimiters. Apply `textReplacementOf(embedded.config)` to each
   full terminal. For accessibility title remove leading whitespace afterwards.
   For description replace each LF and its following whitespace, including
   further LF, with one LF; keep leading and trailing whitespace elsewhere. Data
   and names receive no security text replacement. Neither an authored diagram
   title nor `embedded.title` enters the summary. [fixture:
   eventmodeling/common-repeat] [fixture: eventmodeling/common-repeat-empty]
   [fixture: eventmodeling/common-description-repeat] [fixture:
   eventmodeling/common-whitespace] [fixture: eventmodeling/common-title-only]
   [fixture: eventmodeling/frontmatter-title] [fixture:
   eventmodeling/config-security-level-other]
4. **Frames.** Read time/reset frame statements in declaration order. A repeated
   name is rejected by mermaid.js, so an accepted tree has none. [fixture:
   eventmodeling/db-frame-duplicates] Publish kind `time` or `reset`, the
   written digit name, unchanged modelEntityType spelling and joined qualified
   entityIdentifier. Publish sourceFrames as a lexically sorted set of the
   written digit names; do not resolve missing, forward or self references.
   Leading zeros remain distinct. [fixture: eventmodeling/db-frame-order]
   [fixture: eventmodeling/db-all-aliases] [fixture:
   eventmodeling/db-qualified-names] [fixture: eventmodeling/db-source-order]
   [fixture: eventmodeling/db-source-leading-zero] [fixture:
   eventmodeling/db-source-missing] [fixture: eventmodeling/db-source-forward]
   [fixture: eventmodeling/db-source-self]
5. **Data selection and text.** Index the first data declaration of each name
   across the whole body. For a frame's data reference, use that first block if
   present; otherwise use its inline data, or null. An empty first block is
   still selected, and later same-name declarations cannot replace it. Read
   converted body text including braces or quotes, excluding its type tag and
   named gaps; do not decode backslashes or parse the declared data language.
   Include a block's immediately following converted LF, including the logical
   appended LF at source EOF. A space, LS or PS serving only as a closing
   lookahead is not included. Preserve the body-present closing choice already
   represented by the accepted node. Publish `{kind, value}` with kind `inline`
   or `block`. [fixture: eventmodeling/db-data-first] [fixture:
   eventmodeling/db-data-empty-first] [fixture:
   eventmodeling/db-data-reference-inline] [fixture:
   eventmodeling/db-data-unresolved-inline] [fixture:
   eventmodeling/db-data-unresolved] [fixture:
   eventmodeling/db-reset-data-reference] [fixture:
   eventmodeling/lex-inline-empty] [fixture:
   eventmodeling/lex-inline-quote-conversion] [fixture:
   eventmodeling/data-all-types] [fixture: eventmodeling/data-block-types]
   [fixture: eventmodeling/data-block-close-eof] [fixture:
   eventmodeling/data-block-close-space] [fixture:
   eventmodeling/lex-block-close-ps-boundary] [fixture:
   eventmodeling/lex-block-adjacent-later-close]

The summary omits model entities, notes, GWT, unused data, type tags, native
ignored forms and drawing computations. Their authored nodes still belong to the
tree and its checker. [fixture: eventmodeling/db-entities-notes-gwt] [fixture:
eventmodeling/db-data-unused] [fixture: eventmodeling/gram-written-tree]

## Recorded comparisons

Use `specified.json` when present, otherwise `expected.json`, with configuration
from `embeddedValuesOf`. Include every eventmodeling tree and every common
fixture detecting eventmodeling. Compare the site security fixture using its
site configuration, and the frontmatter HTML value case through its specified
reading. Report missing accepting trees and mismatches with inputs; skip an
error record only when `fixtureAccepts` rejects its reading. Keep accepted cases
without a comparison Db explicit under
[the shared rule](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
[fixture: common/detect-minimal-eventmodeling] [fixture:
eventmodeling/config-security-level-other] [fixture:
eventmodeling/div-html-frontmatter-value] [fixture:
eventmodeling/config-fontfamily-keeps-title] [fixture:
eventmodeling/div-invalid-keeps-config]
