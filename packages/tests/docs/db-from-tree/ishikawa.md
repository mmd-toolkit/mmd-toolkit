# Building the Ishikawa Db from the tree

Japanese version: [ishikawa.ja.md](./ishikawa.ja.md)

`src/db-from-tree/ishikawa.ts` builds the summary defined in
[db-summaries.md](../db-summaries.md#ishikawa) from
[ast/ishikawa.md](../../../spec/docs/ast/ishikawa.md), following
[diagrams/ishikawa.md](../../../spec/docs/diagrams/ishikawa.md).

## Building the summary from the tree

1. **Converted text.** Read each IshikawaLiteral's written value and range
   through the shared conversion: omit directives, common comment regions and
   selected ignored semicolons, convert CR and CRLF to LF, references to their
   placeholders, and HTML attribute quotes to single quotes. HTML quote context
   comes from the whole source after frontmatter, including earlier comments and
   nodes. [fixture: ishikawa/directive-root-middle] [fixture:
   ishikawa/directive-multiline-joins-node-text] [fixture:
   ishikawa/div-header-padding-multiline-directive-text] [fixture:
   ishikawa/comment-ls-region-in-text] [fixture:
   ishikawa/lex-indent-multiline-directive] [fixture:
   ishikawa/lex-header-indent-multiline-directive] [fixture:
   ishikawa/lex-indent-comment-region-ls] [fixture:
   ishikawa/lex-indent-comment-region-ps] [fixture: ishikawa/lex-quoted-crlf]
   [fixture: ishikawa/lex-quoted-cr] [fixture:
   ishikawa/header-root-inline-entity] [fixture: ishikawa/entity-root-numeric]
   [fixture: ishikawa/lex-entity-directive-in-node-text] [fixture:
   ishikawa/lex-root-style-three-semicolons-padding] [fixture:
   ishikawa/lex-style-and-classdef-semicolons] [fixture:
   ishikawa/header-root-inline-html] [fixture:
   ishikawa/lex-html-tag-starts-in-comment-line] [fixture:
   ishikawa/lex-html-tag-crosses-directive] [fixture:
   ishikawa/lex-html-tag-ends-in-comment-line]
2. **Node text.** Trim the converted text and apply
   `textReplacementOf(embedded.config)`, the common sanitizer reading described
   in [db-from-tree.md](../db-from-tree.md#the-replacement-of-characters).
   Quotes, internal whitespace, accessibility-looking text and
   data-block-looking text remain text. [fixture:
   ishikawa/gram-root-trailing-space] [fixture:
   ishikawa/gram-child-trailing-space] [fixture: ishikawa/gram-quotes-padding]
   [fixture: ishikawa/lex-root-vt-inside] [fixture: ishikawa/lex-root-ff-inside]
   [fixture: ishikawa/db-acctitle-is-node] [fixture:
   ishikawa/db-accdescr-block-is-nodes] [fixture:
   ishikawa/db-data-block-multiline-is-nodes] [fixture:
   ishikawa/config-security-other] [fixture:
   ishikawa/config-security-other-html-false] [fixture:
   ishikawa/config-security-other-flowchart-html-false] [fixture:
   ishikawa/config-security-other-root-true] [fixture:
   ishikawa/config-security-other-root-false]
3. **Root and parents.** A null diagram root gives `root: null`. [fixture:
   ishikawa/header-comment-ps-whitespace-eof] Otherwise recursively project each
   node to its read `text` and its `children` in tree order, retaining
   repetitions. Parents are already the tree's nesting under the specification's
   parent rule; the builder neither reads `indent` nor chooses parents again.
   [fixture: ishikawa/header-only-lf] [fixture: ishikawa/header-beta-only-lf]
   [fixture: ishikawa/gram-whitespace-only-document] [fixture:
   ishikawa/db-indent-first-cause] [fixture: ishikawa/db-indent-root-deeper]
   [fixture: ishikawa/db-indent-root-shallower] [fixture:
   ishikawa/db-indent-relative-zero] [fixture:
   ishikawa/db-indent-nearest-smaller-cause] [fixture:
   ishikawa/db-three-definitions] [fixture:
   ishikawa/lex-indent-multiline-directive] [fixture:
   ishikawa/lex-header-indent-multiline-directive] [fixture:
   ishikawa/lex-indent-comment-region-ls] [fixture:
   ishikawa/lex-indent-comment-region-ps] [fixture:
   ishikawa/lex-comment-ps-indent-excludes-body-padding]
4. **Common strings.** With a root, apply the common sanitizer once more to its
   read text for `title`, replacing any frontmatter title. Without a root,
   sanitize the embedded frontmatter title or use the empty string, retaining
   whitespace-only titles and the embedded string form of numeric titles.
   [fixture: ishikawa/db-frontmatter-title] [fixture:
   ishikawa/db-frontmatter-rootless] [fixture:
   ishikawa/frontmatter-empty-title-rootless] [fixture:
   ishikawa/frontmatter-null-title-rootless] [fixture:
   ishikawa/frontmatter-whitespace-title-rootless] [fixture:
   ishikawa/frontmatter-numeric-title-rootless] [fixture:
   ishikawa/config-security-other] Both `accTitle` and `accDescr` are empty;
   node text and frontmatter accessibility keys set neither. [fixture:
   ishikawa/db-acctitle-is-node] [fixture: ishikawa/db-accdescr-is-node]
   [fixture: ishikawa/db-frontmatter-accessibility]

## Recorded comparisons

The corpus compares with `specified.json` where it exists, otherwise
`expected.json`; the blank-line and C4 divergences therefore use their recorded
accepted reading. [fixture:
ishikawa/div-header-padding-multiline-directive-text] [fixture:
ishikawa/div-header-comment-multiline-directive-ls] Frontmatter HTML context is
excluded by the shared converter, as the specification requires. Split selected
headers are rejected by the tree check, and opaque embedded data needs no Db
comparison when mermaid.js records a rejection without an accepted specified
reading. [fixture: ishikawa/div-header-blank-node] [fixture:
ishikawa/div-header-inline-comment-ls-node] [fixture:
ishikawa/div-header-comment-directive-value-ps] [fixture:
ishikawa/div-c4-inline-percent-eof] [fixture:
ishikawa/div-frontmatter-open-tag-bare-node] [fixture:
ishikawa/directive-in-beta-header] [fixture: ishikawa/frontmatter-malformed]
