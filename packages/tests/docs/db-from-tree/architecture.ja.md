# Architecture: 木から Db を組み立てる

英語版: [architecture.md](./architecture.md)

[構文](../../../spec/docs/diagrams/architecture.ja.md) が受理を定義し、
[木](../../../spec/docs/ast/architecture.ja.md) が書かれた形を保持します。
`architectureDbOf` は受理済みの木を読み、意味上の検査を繰り返しません。
結果の欄は
[architecture の要約](../db-summaries.ja.md#architecture) のとおりです。
[fixture: architecture/db-mixed]
[fixture: architecture/header-beta]

## 木から要約を組み立てる

1. **読みと順序。**
   [db-from-tree.ja.md](../db-from-tree.ja.md#変換した形) の
   共有の変換で値を読む。
   groups、services、junctions、edges、alignments の順に公開し、
   種類ごとに原文順を保つ。
   `nodes` は services の後に junctions を並べる。
   保持した hidden の形は何も公開しない。
   frontmatter の title を含む図全体の title は、この要約に入らない。
   [fixture: architecture/db-mixed]
   [fixture: architecture/db-junction-order]
   [fixture: architecture/db-edge-forward-nodes]
   [fixture: architecture/db-align-forward-repeat]
   [fixture: architecture/hidden-yaml-three-fences]
   [fixture: architecture/frontmatter-title]
   [fixture: architecture/common-repeat-empty]
2. **アクセシビリティ。**
   literal の変換後の range を読み、null なら空のテキストを使う。
   共有の `commonValue` で、行の値の両端を trim し、
   2 個以上続く ASCII 空白・タブをまとめる。
   ブロックの値は、さらに各行を trim し、続く物理改行をまとめる。
   最後の代入を使い、最後の空の代入も前の値を抑える。
   最後の description に `descriptionOf` を適用し、
   両方の欄に `textReplacementOf(embedded.config)` を適用する。
   最後の空の値は、空の初期値を残す。
   図全体の title 文は木には保持する。
   [fixture: architecture/common-all]
   [fixture: architecture/common-repeat-empty]
   [fixture: architecture/common-empty-block-after-value]
   [fixture: architecture/common-block-whitespace]
   [fixture: architecture/html-all-fields]
   [fixture: architecture/config-security-level-other]
3. **宣言。**
   ID と明示的な `in` は、変換後の Identifier の range から読む。
   `in` が null なら省く。
   大文字小文字と、prototype の形をした名前も保つ。
   service の type は service、junction は junction で、group に type はない。
   名前の icon は Identifier の内側を使い、括弧を除く。
   文字の icon は、変換後の StringLiteral の内側を共有の
   `decodedString` で読む。
   バックスラッシュの後の b、f、n、r、t、v、0 は対応する文字にし、
   ほかの文字の前のバックスラッシュは除く。
   Unicode escape の形も Unicode の符号位置には変えない。
   空の文字 icon も公開する。
   label と icon に追加の HTML sanitization は行わない。
   [fixture: architecture/db-prototype-ids]
   [fixture: architecture/db-id-case]
   [fixture: architecture/db-service-forward-parent]
   [fixture: architecture/lex-icon-leading-symbols]
   [fixture: architecture/lex-string-conversion]
   [fixture: architecture/lex-string-number-escape]
   [fixture: architecture/db-empty-values]
   [fixture: architecture/html-all-fields]
4. **角括弧の title。**
   ArchitectureLabel.kind にかかわらず、変換後の角括弧の内側全体を読む。
   trim する。
   同じ一重または二重引用符で始まり終わるなら、最初と最後の 1 字を除き、
   バックスラッシュと二重引用符の組、
   次にバックスラッシュと一重引用符の組を引用符にする。
   引用符 1 字だけなら空になる。
   条件を満たさない場合は、これらの escape を保つ。
   どちらの場合も最後にもう一度 trim する。
   ほかの escape は解かない。
   null の title は省き、変換後の空の title は保つ。
   この変換は木の字句上の kind を変えない。
   [fixture: architecture/lex-title-conversion]
   [fixture: architecture/lex-title-padded-quotes]
   [fixture: architecture/lex-title-unquoted-fallback]
   [fixture: architecture/lex-title-cross-quote-escape]
   [fixture: architecture/lex-title-escaped-newline]
   [fixture: architecture/db-empty-values]
   [fixture: architecture/directive-fields]
   [fixture: architecture/db-title-quote-only-double]
   [fixture: architecture/db-title-quote-only-single]
   [fixture: architecture/db-title-quote-only-padded]
   [fixture: architecture/db-edge-title-quote-only]
   [fixture: architecture/db-title-bare-escaped-double-quote]
   [fixture: architecture/db-title-bare-escaped-single-quote]
   [fixture: architecture/config-security-level-other]
5. **辺。**
   lhsId/rhsId は変換後の参照、lhsDir/rhsDir は arrow の方向から読む。
   lhsInto/rhsInto は marker が arrow かどうかで決める。
   書かれた marker のどちらの文字も true になる。
   lhsGroup/rhsGroup は boolean として写し、
   false と、group に入らないノードの modifier も保つ。
   arrow の title は工程 4 で変換し、null だけを省く。
   辺の順序、重複辺、自己辺、同じ port 方向を保つ。
   生成した辺の ID、隣接情報、解決した group の端点は持たない。
   [fixture: architecture/db-directions]
   [fixture: architecture/db-duplicate-edges]
   [fixture: architecture/gram-edge-reversed-labeled-markers]
   [fixture: architecture/db-group-modifier-one-group]
   [fixture: architecture/db-group-modifier-ungrouped]
   [fixture: architecture/db-mixed]
6. **配置制約。**
   各 direction と変換後の member の参照を公開する。
   member の順序と繰り返した文を保つ。
   制約をまとめたり layout を導出したりしない。
   空の図は nodes、groups、edges、layoutHints が空の配列になる。
   描画の設定は公開を変えない。
   [fixture: architecture/db-align-forward-repeat]
   [fixture: architecture/db-align-layout-conflict]
   [fixture: architecture/header-beta]
   [fixture: architecture/config-drawing-only]

## 記録した木の検査

共有の比較は `embeddedValuesOf` と、
あれば fixture の specified の読みを使います。
印の読みが拒否する場合だけエラーの記録を除外し、
受理されて比較可能な読みの木がなければ報告します。
比較用の Db がない場合は、
[比較用の Db](../../../spec/docs/known-divergences/embedded-data-opaque.ja.md#比較する-db)
の規則に従って明示します。
native hidden の属性は埋め込み設定ではありません。
[fixture: architecture/div-invalid-keeps-config]
[fixture: architecture/div-frontmatter-invalid-yaml]
[fixture: architecture/div-retained-bare-second-scan-ls]
[fixture: architecture/lex-yaml-global-directive]
