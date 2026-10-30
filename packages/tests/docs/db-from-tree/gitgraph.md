# Building the gitgraph Db from the tree

Japanese version: [gitgraph.ja.md](./gitgraph.ja.md)

`src/db-from-tree/gitgraph.ts` builds the [summary](../db-summaries.md#gitgraph)
from [ast/gitgraph.md](../../../spec/docs/ast/gitgraph.md). The tree is accepted
under the
[semantic conditions](../../../spec/docs/diagrams/gitgraph.md#semantic-acceptance-conditions);
the builder does not repeat the parser's acceptance checks.

## Building the summary from the tree

1. **Converted values.** Use the shared converted-text reader for source cuts,
   CR/CRLF, body HTML attribute quotes and entity markers. Ignore every
   GitgraphIgnoredText. Read bare references as converted text. Decode STRING
   interiors: b/f/n/r/t/v/0 escapes become their control characters; other
   escapes lose the backslash without hexadecimal or Unicode decoding. Do not
   trim strings. [fixture: gitgraph/lex-string-escapes] [fixture:
   gitgraph/lex-cherry-pick-string-escape] [fixture:
   gitgraph/gram-commit-space-values] [fixture: gitgraph/entity-all-fields]
   [fixture: gitgraph/lex-html-attribute-quotes] [fixture:
   gitgraph/lex-yaml-invalid-body]
2. **Configuration and common values.** The configured initial branch name is
   used directly, with its configured order. Sanitize authored branch names,
   ids, parent/source references, ordinary tags and cherry-pick tags with
   `textReplacementOf(embedded.config.gitGraph)`; merge tags bypass it. Common
   text uses the root configuration. Convert line values by trimming common
   whitespace and collapsing runs of at least two ASCII spaces/tabs; blocks
   additionally trim each line and collapse repeated line feeds. The final
   assignment wins even when empty; publish only its nonempty converted value.
   An empty final title leaves the shared converted frontmatter title; an empty
   final accessibility value leaves the cleared default. Descriptions also use
   `descriptionOf`. [fixture: gitgraph/config-main-branch] [fixture:
   gitgraph/config-main-empty-name] [fixture: gitgraph/config-main-html]
   [fixture: gitgraph/html-all-texts] [fixture:
   gitgraph/config-gitgraph-html-false] [fixture:
   gitgraph/config-gitgraph-loose] [fixture:
   gitgraph/config-merge-tag-escape-difference] [fixture:
   gitgraph/html-cherry-pick-tags] [fixture: gitgraph/title-conversion]
   [fixture: gitgraph/accdescr-block] [fixture: gitgraph/common-third-values]
   [fixture: gitgraph/title-repeat-empty] [fixture:
   gitgraph/acctitle-repeat-empty] [fixture: gitgraph/accdescr-repeat-empty]
3. **Generated identities and sequence.** First reserve the final effective
   nonempty authored target id of every commit and merge, including later and
   overwritten commits. In source order, every commit or merge without such an
   id and every cherry-pick creates the next `generated-commit-N`, starting at
   one and skipping reserved or already allocated names. Cherry-pick's id option
   is its source, never a target id. Sequence starts at zero and advances on
   every creation, including a later replacement. [fixture:
   gitgraph/db-generated-ids] [fixture: gitgraph/db-generated-name-collision]
   [fixture: gitgraph/db-random-shaped-custom-id] [fixture:
   gitgraph/gram-commit-repeated-options] [fixture:
   gitgraph/gram-merge-empty-id] [fixture: gitgraph/db-three-definitions]
4. **Publication.** Walk statements in source order, retaining branch tips and
   the selected branch only as intermediate state. Branch creation copies the
   current tip and selects the new branch; checkout/switch selects an existing
   tip. An ordinary commit has its current tip as parent, or no parent on an
   empty branch, and type NORMAL=0, REVERSE=1 or HIGHLIGHT=2. Scalar options
   take the final assignment; tags append and keep empty strings. Map
   replacement keeps the first-id position while replacing all drawing fields,
   including sequence and parents. A parent may equal the new id. Messages
   contribute no summary field. [fixture: gitgraph/gram-switch] [fixture:
   gitgraph/gram-commit-empty-values] [fixture:
   gitgraph/gram-commit-repeated-options] [fixture: gitgraph/db-duplicate-id]
   [fixture: gitgraph/db-three-definitions] [fixture:
   gitgraph/db-duplicate-earlier-id-current-head] [fixture:
   gitgraph/db-prototype-ids]
5. **Merge and cherry-pick.** Merge creates type 3 with current/source parents
   in that order, optional numeric customType, and customId indicating a
   nonempty authored id. Cherry-pick always creates type 4 with current/source
   parents. With authored tags, filter empty tags and suppress the default even
   when all are empty. Without them use `cherry-pick:<source>`, adding
   `|parent:<parent>` only for a merge source, then apply the tag sanitizer.
   [fixture: gitgraph/gram-merge-options] [fixture:
   gitgraph/gram-merge-empty-id] [fixture: gitgraph/gram-cherry-pick] [fixture:
   gitgraph/gram-cherry-pick-tags] [fixture:
   gitgraph/db-cherry-pick-only-empty-tags] [fixture:
   gitgraph/gram-cherry-pick-merge-parent] [fixture:
   gitgraph/gram-cherry-pick-repeated-options]
6. **Result order.** Return commits in first-id insertion order with their
   latest sequence and parents. Sort branches by their numeric order, preserving
   creation order on ties; missing authored order is zero. Parse written order
   digits with shared double semantics, including precision loss and overflow.
   Return only each branch's name. Direction is the written LR/TB/BT or LR when
   absent. [fixture: gitgraph/db-three-definitions] [fixture:
   gitgraph/gram-branch-order] [fixture: gitgraph/gram-branch-order-tie]
   [fixture: gitgraph/config-main-order-negative] [fixture:
   gitgraph/number-precision] [fixture: gitgraph/number-overflow] [fixture:
   gitgraph/header-only] [fixture: gitgraph/header-tb] [fixture:
   gitgraph/header-bt]

## Recorded comparisons

Compare with `specified.json` when present, otherwise `expected.json`, using
`embeddedValuesOf` for configuration and the shared frontmatter title. Atomic
cuts reject under their existing marks. Shared HTML, C4 and bare-percent
readings handle retained YAML and second-scan directive prefixes; the reference
reading must preserve their text and common embedded effects. Opaque leading
YAML rejected by Mermaid has no comparison Db. No diagram-local specified
reading is added. [fixture: gitgraph/div-directive-in-number] [fixture:
gitgraph/div-style-semicolon-in-order-number] [fixture:
gitgraph/div-frontmatter-cross-title-value] [fixture:
gitgraph/div-detect-c4container-id] [fixture:
gitgraph/div-detect-retained-yaml-bare-ls-line] [fixture:
gitgraph/div-detect-retained-directive-bare-bom] [fixture:
gitgraph/div-lex-preheader-bare-between-retained-unicode] [fixture:
gitgraph/div-frontmatter-invalid-yaml] [fixture:
gitgraph/div-frontmatter-html-invalid-yaml]
