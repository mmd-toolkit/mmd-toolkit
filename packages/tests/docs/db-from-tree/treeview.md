# Building a treeview Db from a tree

Japanese version: [treeview.ja.md](./treeview.ja.md)

`treeviewDbOf` reads the accepted flat body defined by
[ast/treeview.md](../../../spec/docs/ast/treeview.md), using the
[direct parent rule](../../../spec/docs/diagrams/treeview.md#indentation-and-parents)
and the [published summary](../db-summaries.md#treeview). It does not decide
acceptance. [fixture: treeview/gram-written-tree] [fixture:
treeview/box-written-tree]

## Building the summary

1. Read ranges through the shared converted text: common source removals,
   physical line-ending conversion, source-wide HTML attribute quotes and entity
   placeholders. Apply the specification's
   [direct box reading](../../../spec/docs/diagrams/treeview.md#box-drawing-reading)
   at original source positions. An enclosed decoration denotes no content or
   following LF; an enclosed branch prefix denotes its indentation, expands
   content tabs to four spaces and excludes the branch line's trailing common
   whitespace. Quote and block boundaries do not protect those lines. Outside
   leaves, prefix and decoration nodes contribute no published item. There is no
   rewritten source, synthetic source token or native YAML node. [fixture:
   treeview/directive-bare-middle] [fixture: treeview/comment-line-in-quotes]
   [fixture: treeview/entity-double] [fixture: treeview/html-bare] [fixture:
   treeview/text-double-crlf] [fixture: treeview/box-quoted-decoration]
   [fixture: treeview/box-block-decoration] [fixture:
   treeview/box-multiline-quoted] [fixture:
   treeview/box-only-branch-content-tab] [fixture:
   treeview/box-multiline-name-tail-trim] [fixture:
   treeview/box-physical-directive-inline] [fixture:
   treeview/box-physical-directive-line] [fixture:
   treeview/box-physical-selected-semicolon] [fixture:
   treeview/box-physical-comment-line] [fixture:
   treeview/box-physical-empty-line] [fixture: treeview/box-physical-ls]
   [fixture: treeview/box-physical-ps] [fixture:
   treeview/box-physical-empty-description]
2. Read accessibility payloads with shared `commonValue`, using empty text for
   null. Line payloads trim their ends and collapse repeated ASCII spaces/tabs;
   blocks also trim each line and collapse repeated physical line breaks. The
   last assignment wins, including empty assignments. Apply shared
   `descriptionOf` to the final description and
   `textReplacementOf(embedded.config)` to both published accessibility fields.
   The defaults are empty strings. Diagram titles, including embedded titles,
   are not published. [fixture: treeview/common-whitespace] [fixture:
   treeview/common-repeat] [fixture: treeview/common-repeat-empty] [fixture:
   treeview/common-block-whitespace-raw] [fixture: treeview/db-all-fields]
   [fixture: treeview/frontmatter-title] [fixture:
   treeview/config-security-level-other]
3. Visit every TreeviewNode in body order. Pop open ancestors whose indent is
   greater than or equal to the new node's indent; append to the last remaining
   ancestor's children, or the outer forest, then push the new node. Files and
   directories both enter the stack. Use the assigned indent without deriving it
   again from line starts: it already accounts for ordinary tabs, trailing runs
   and branch depth. Common statements and decorations leave the stack
   unchanged. Keep initial indentation, duplicate names, empty names and every
   root. Every node has `children`, including an empty list. [fixture:
   treeview/db-indent-pop] [fixture: treeview/db-file-parent] [fixture:
   treeview/db-first-indented] [fixture: treeview/db-duplicate-names] [fixture:
   treeview/db-empty-names] [fixture: treeview/db-tabs-one-unit] [fixture:
   treeview/db-quoted-tail-tab] [fixture: treeview/box-round-below] [fixture:
   treeview/box-decoration-trailing-body]
4. A quoted name is its converted interior with one delimiter removed at each
   end and no escape decoding. A bare name loses only trailing ASCII spaces and
   tabs. If the resulting name ends in `/`, remove that one slash and publish
   nodeType directory; otherwise publish file. Retain quoted padding, internal
   whitespace and remaining slashes. Do not sanitize names. [fixture:
   treeview/db-quote-conversion] [fixture: treeview/db-bare-tail-space]
   [fixture: treeview/db-bare-internal-space] [fixture:
   treeview/db-directory-trailing-space] [fixture: treeview/box-dir-name-trim]
5. Apply annotations in source order, with the last assignment of each kind
   winning. Publish the converted class Identifier as cssClass. Publish a
   nonempty icon Identifier as icon, and an explicit empty icon call as none;
   omit an icon that was never assigned. Trim the converted description payload,
   sanitize it with `textReplacementOf(embedded.config)` and omit an empty final
   description. Class and icon names bypass sanitization. Preserve authored
   annotations independently in the tree. [fixture: treeview/db-repeat-class]
   [fixture: treeview/db-repeat-icon] [fixture:
   treeview/db-repeat-icon-empty-first] [fixture: treeview/db-icon-none]
   [fixture: treeview/db-description-empty] [fixture:
   treeview/annotation-description-repeat-empty] [fixture:
   treeview/config-security-level-other] [fixture:
   treeview/config-security-level-other-html-false]
6. Publish only accTitle, accDescr and nodes. Drop title, the artificial root,
   generated ids, indentation, counters, resolved icon SVG, coordinates, colours
   and drawing settings. No treeView configuration key supplies an acceptance
   condition or a published field. [fixture: treeview/db-all-fields] [fixture:
   treeview/config-drawing-site] [fixture: treeview/config-frontmatter-drawing]
   [fixture: treeview/config-init-drawing]

## Recorded comparisons

Compare with `specified.json` when present, otherwise `expected.json`, using
`embeddedValuesOf` for shared configuration and title. The site security fixture
uses its recorded site configuration; the HTML-in-frontmatter value fixture uses
the specified reading. Check every treeview tree and every common fixture
detected as treeview. An accepting specification reading requires ast.json;
missing records and mismatches are reported with inputs. An error record skips
Db comparison only when its marked reading rejects under `fixtureAccepts`. Keep
opaque cases without a comparison Db explicit under the
[shared comparison rule](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
There is no treeview-local specified reading. [fixture:
treeview/config-security-level-other] [fixture:
treeview/div-html-frontmatter-value] [fixture:
treeview/config-fontfamily-keeps-title] [fixture:
treeview/div-invalid-keeps-config] [fixture: common/detect-minimal-tree-view]
