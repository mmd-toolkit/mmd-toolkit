# Cynefin: building the Db from the tree

Japanese version: [cynefin.ja.md](./cynefin.ja.md)

`cynefinDbOf` reads an accepted
[Cynefin tree](../../../spec/docs/ast/cynefin.md) and produces exactly the
[Cynefin summary](../db-summaries.md#cynefin). The
[syntax](../../../spec/docs/diagrams/cynefin.md#semantic-acceptance-conditions)
defines acceptance. [fixture: cynefin/db-all-fields] [fixture:
cynefin/gram-transition-first]

## Building the summary from the tree

1. **Converted texts.** Read ranges through the shared
   [converted form](../db-from-tree.md#the-converted-form): common removals,
   CR/CRLF, source-wide HTML attribute quotes and entity placeholders. Read each
   StringLiteral without its quotes, then apply shared `decodedString`:
   b/f/n/r/t/v/0 escapes become control characters; other escapes lose their
   backslash without Unicode or hexadecimal decoding. Keep string whitespace and
   empty strings. Item and transition strings receive no security text
   replacement. Ignore CynefinIgnoredText. [fixture:
   cynefin/lex-string-conversion] [fixture:
   cynefin/lex-transition-string-conversion] [fixture: cynefin/entity-texts]
   [fixture: cynefin/html-texts] [fixture: cynefin/line-string-values] [fixture:
   cynefin/directive-every-field] [fixture:
   cynefin/hidden-yaml-common-directive]
2. **Common assignments.** Read the converted CynefinLiteral range, or empty
   text for null. Apply shared `commonValue`: trim line values and collapse
   repeated ASCII spaces/tabs; block values additionally trim each line and
   collapse repeated line breaks. The final assignment wins, including empty
   assignments that suppress earlier body values. A final empty title uses
   `embedded.title`, or empty text when absent; empty accessibility values use
   empty defaults. Apply shared `descriptionOf` to the final description, then
   `textReplacementOf(embedded.config)` to title, accTitle and accDescr.
   [fixture: cynefin/common-repeat] [fixture: cynefin/common-repeat-empty]
   [fixture: cynefin/common-empty-interleaved] [fixture:
   cynefin/frontmatter-empty-body-title] [fixture:
   cynefin/common-line-whitespace] [fixture: cynefin/common-block-whitespace]
   [fixture: cynefin/config-security-level-other]
3. **Domains.** Each domain statement replaces the entire item list of its name,
   including an empty list. Publish only final lists with at least one item, in
   renderer reference order: complex, complicated, chaotic, clear, confusion.
   Keep item order and duplicates. An empty label counts as an item; retain
   every confusion item, including those beyond the display limit. [fixture:
   cynefin/db-domain-duplicates] [fixture: cynefin/db-domain-empty-first]
   [fixture: cynefin/db-domain-empty-last] [fixture: cynefin/gram-glued-domains]
   [fixture: cynefin/db-empty-texts] [fixture: cynefin/db-all-fields] [fixture:
   cynefin/gram-item-duplicates]
4. **Transitions.** Publish transitions in source order, keeping duplicates and
   undeclared endpoints. Omit self transitions. Include label only when its
   converted string is truthy: an empty string is omitted, whitespace remains.
   The arrow and native gap nodes have no summary fields. [fixture:
   cynefin/db-transition-duplicates] [fixture: cynefin/gram-transition-first]
   [fixture: cynefin/db-self-loops] [fixture: cynefin/db-empty-texts] [fixture:
   cynefin/hidden-all-unit-gaps]

## Recorded comparisons

Use `specified.json` when present, otherwise `expected.json`, and obtain shared
configuration and title through `embeddedValuesOf`. Compare the site security
fixture with its recorded configuration and the frontmatter HTML value fixture
with its specified reading. Report missing accepting trees and mismatches with
their input; skip a parser error only when `fixtureAccepts` rejects its reading.
Accepted opaque cases without a comparison Db remain explicit under
[the shared comparison rule](../../../spec/docs/known-divergences/embedded-data-opaque.md#the-comparison-db).
[fixture: cynefin/config-security-level-other] [fixture:
cynefin/div-html-frontmatter-value] [fixture:
cynefin/config-fontfamily-keeps-title] [fixture:
cynefin/div-invalid-keeps-config]
