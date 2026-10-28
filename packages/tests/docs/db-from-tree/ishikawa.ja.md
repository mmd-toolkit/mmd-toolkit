# 木から Ishikawa の Db を組み立てる

英語版: [ishikawa.md](./ishikawa.md)

`src/db-from-tree/ishikawa.ts` は [ast/ishikawa.md](../../../spec/docs/ast/ishikawa.md) の木から、
[diagrams/ishikawa.md](../../../spec/docs/diagrams/ishikawa.md) に従い、
[db-summaries.md](../db-summaries.md#ishikawa) の要約を組み立てる。

## 木から要約を組み立てる

1. **変換形。**
   各 IshikawaLiteral の書かれた値と範囲を共通の変換に渡す。
   ディレクティブ、共通のコメント領域、選ばれた無視するセミコロンを除く。
   CR と CRLF を LF、文字参照をプレースホルダー、
   HTML 属性の引用符を単一引用符に変換する。
   HTML 引用符の文脈は、先行するコメントやノードも含め、
   フロントマター後のソース全体から得る。 [fixture: ishikawa/directive-root-middle]
   [fixture: ishikawa/directive-multiline-joins-node-text]
   [fixture: ishikawa/div-header-padding-multiline-directive-text]
   [fixture: ishikawa/comment-ls-region-in-text]
   [fixture: ishikawa/lex-indent-multiline-directive]
   [fixture: ishikawa/lex-header-indent-multiline-directive]
   [fixture: ishikawa/lex-indent-comment-region-ls]
   [fixture: ishikawa/lex-indent-comment-region-ps]
   [fixture: ishikawa/lex-quoted-crlf]
   [fixture: ishikawa/lex-quoted-cr]
   [fixture: ishikawa/header-root-inline-entity]
   [fixture: ishikawa/entity-root-numeric]
   [fixture: ishikawa/lex-entity-directive-in-node-text]
   [fixture: ishikawa/lex-root-style-three-semicolons-padding]
   [fixture: ishikawa/lex-style-and-classdef-semicolons]
   [fixture: ishikawa/header-root-inline-html]
   [fixture: ishikawa/lex-html-tag-starts-in-comment-line]
   [fixture: ishikawa/lex-html-tag-crosses-directive]
   [fixture: ishikawa/lex-html-tag-ends-in-comment-line]
2. **ノード文字列。**
   変換後の文字列を trim し、 `textReplacementOf(embedded.config)` を適用する。
   共通のサニタイザーの読みは [db-from-tree.md](../db-from-tree.md#the-replacement-of-characters) に従う。
   引用符、内部の空白、
   アクセシビリティやデータブロックに見える文字列も残る。 [fixture: ishikawa/gram-root-trailing-space]
   [fixture: ishikawa/gram-child-trailing-space]
   [fixture: ishikawa/gram-quotes-padding]
   [fixture: ishikawa/lex-root-vt-inside]
   [fixture: ishikawa/lex-root-ff-inside]
   [fixture: ishikawa/db-acctitle-is-node]
   [fixture: ishikawa/db-accdescr-block-is-nodes]
   [fixture: ishikawa/db-data-block-multiline-is-nodes]
   [fixture: ishikawa/config-security-other]
   [fixture: ishikawa/config-security-other-html-false]
   [fixture: ishikawa/config-security-other-flowchart-html-false]
   [fixture: ishikawa/config-security-other-root-true]
   [fixture: ishikawa/config-security-other-root-false]
3. **根と親。**
   図の根が null なら `root: null` とする。 [fixture: ishikawa/header-comment-ps-whitespace-eof]
   それ以外は、各ノードを読んだ `text` と木の順序の `children` に再帰的に写す。
   重複も保持する。
   親は仕様の親規則に従った木の入れ子なので、構築側は `indent` を読まず、
   親を選び直さない。 [fixture: ishikawa/header-only-lf]
   [fixture: ishikawa/header-beta-only-lf]
   [fixture: ishikawa/gram-whitespace-only-document]
   [fixture: ishikawa/db-indent-first-cause]
   [fixture: ishikawa/db-indent-root-deeper]
   [fixture: ishikawa/db-indent-root-shallower]
   [fixture: ishikawa/db-indent-relative-zero]
   [fixture: ishikawa/db-indent-nearest-smaller-cause]
   [fixture: ishikawa/db-three-definitions]
   [fixture: ishikawa/lex-indent-multiline-directive]
   [fixture: ishikawa/lex-header-indent-multiline-directive]
   [fixture: ishikawa/lex-indent-comment-region-ls]
   [fixture: ishikawa/lex-indent-comment-region-ps]
   [fixture: ishikawa/lex-comment-ps-indent-excludes-body-padding]
4. **共通の文字列。**
   根があれば、読んだ根の文字列を再度サニタイズし、
   `title` としてフロントマターのタイトルを上書きする。
   根がなければ、埋込みのフロントマターのタイトルをサニタイズする。
   タイトルがなければ空文字列とする。
   空白だけのタイトルと、
   埋込み値の文字列にした数値タイトルも保持する。 [fixture: ishikawa/db-frontmatter-title]
   [fixture: ishikawa/db-frontmatter-rootless]
   [fixture: ishikawa/frontmatter-empty-title-rootless]
   [fixture: ishikawa/frontmatter-null-title-rootless]
   [fixture: ishikawa/frontmatter-whitespace-title-rootless]
   [fixture: ishikawa/frontmatter-numeric-title-rootless]
   [fixture: ishikawa/config-security-other]
   `accTitle` と `accDescr` は常に空である。
   ノード文字列とフロントマターのアクセシビリティキーは両方を設定しない。 [fixture: ishikawa/db-acctitle-is-node]
   [fixture: ishikawa/db-accdescr-is-node]
   [fixture: ishikawa/db-frontmatter-accessibility]

## 記録との比較

コーパスは `specified.json` があればそれと、
なければ `expected.json` と比較する。
空行と C4 の既知の差異では、
記録された受理する読みを使う。 [fixture: ishikawa/div-header-padding-multiline-directive-text]
[fixture: ishikawa/div-header-comment-multiline-directive-ls]
共通の変換は、仕様に従いフロントマターの HTML 文脈を除く。
選ばれたヘッダーの分割は木の検査で拒否する。
不透明な埋込みデータで mermaid.js が拒否を記録し、受理する指定の読みがなければ、
Db の比較はない。 [fixture: ishikawa/div-header-blank-node]
[fixture: ishikawa/div-header-inline-comment-ls-node]
[fixture: ishikawa/div-header-comment-directive-value-ps]
[fixture: ishikawa/div-c4-inline-percent-eof]
[fixture: ishikawa/div-frontmatter-open-tag-bare-node]
[fixture: ishikawa/directive-in-beta-header]
[fixture: ishikawa/frontmatter-malformed]
