# 木から treemap の Db を組み立てる

英語版: [treemap.md](./treemap.md)

`treemapDbOf` は [ast/treemap.md](../../../spec/docs/ast/treemap.ja.md) の
受理済みの入れ子の木を読み、
[公開される要約](../db-summaries.ja.md#treemap) に従います。
受理は判定しません。
[fixture: treemap/gram-written-tree] [fixture: treemap/db-all-fields]

## 要約の組み立て

1. 値は共有の変換済みテキストから読みます。共通のソース trivia を除き、
   物理改行・HTML 属性の引用符・entity を変換します。
   木には書いた文字を保ちます。
   ネイティブの YAML や directive のノードはありません。
   [fixture: treemap/directive-name-middle] [fixture: treemap/directive-style]
   [fixture: treemap/html-fields] [fixture: treemap/entity-names]
   [fixture: treemap/line-name-values]
2. 共通値は `commonValue` で読み、null は空文字とします。行の値は trim し、
   連続する ASCII 空白・タブを縮めます。block は各行の端も trim し、
   連続する物理改行を縮めます。最後の代入が勝ち、空の代入も前の本文を消します。
   最後の title が空なら `embedded.title`、それもなければ空文字を使います。
   最後の description に `descriptionOf` を適用し、公開する3項目に
   `textReplacementOf(embedded.config)` を適用します。
   [fixture: treemap/common-repeat] [fixture: treemap/common-repeat-empty]
   [fixture: treemap/common-line-whitespace]
   [fixture: treemap/common-block-whitespace]
   [fixture: treemap/frontmatter-empty-body-title]
   [fixture: treemap/html-fields]
   [fixture: treemap/config-security-level-other]
3. Diagram.body の根と外側の文を読む。
   section と leaf の前で statementsBefore を原順で適用し、
   自身の値を写してから section.children を再帰的に訪れる。
   children を持つのは section だけで、leaf は葉のままである。
   indent を読んだり親を再計算したりしない。
   parser が入れ子を作り、checkTree が独立に確かめる。
   前置 gap の classDef と共通の代入も図全体に効き、
   section の出入りでは履歴をリセットしない。
   重複名、空名、複数の根を保つ。
   [fixture: treemap/db-indent-pop] [fixture: treemap/db-leaf-not-parent]
   [fixture: treemap/db-first-indented] [fixture: treemap/db-duplicate-names]
   [fixture: treemap/db-empty-names] [fixture: treemap/db-section-tail-space]
   [fixture: treemap/db-leaf-tail-tab]
   [fixture: treemap/db-class-indented]
   [fixture: treemap/common-block-empty-interleaved]
   [fixture: treemap/gram-nesting-global-class-before-child]
   [fixture: treemap/gram-nesting-title-before-child]
   [fixture: treemap/gram-nesting-statement-before-ancestor-child]
   [fixture: treemap/gram-nesting-statement-after-last-child]
4. 名前は StringLiteral 内部の変換済みテキストで、両端の引用符を外します。
   バックスラッシュを解釈せず、追加の無害化もしません。selector は Identifier の
   変換済みテキストを保ち、未定義の名前も残します。section は空配列でも
   `children` を持ち、leaf は `value` を持って `children` を持ちません。
   数の全表記からコンマを除いて `parseFloat` で読み、下線や後のドットで
   数値の接頭部が終わります。公開する各値に共有の `numberOrText` を使い、
   NaN と overflow は文字列で記録します。section の値を集計しません。
   [fixture: treemap/lex-string-conversion] [fixture: treemap/db-class-missing]
   [fixture: treemap/db-number-comma] [fixture: treemap/db-number-underscore]
   [fixture: treemap/db-number-multiple-dots] [fixture: treemap/db-number-nan]
   [fixture: treemap/db-number-overflow]
   [fixture: treemap/config-security-level-other]
5. class の id は最初の定義順で保ち、再定義では style を末尾に加えます。
   style 全体の変換済みテキストを読み、null は空文字とします。
   各 `\,` を `§§§` に、残る各コンマを `;` に置き換えた後、
   左から重なりのない各 `§§§` をコンマに置き換えます。
   `;` で分け、各項目の末尾の空白だけを trim します。
   書かれた記号も同じ置換に加わります。
   `a§§§b` は `a,b`、`a§§§§b` は `a,§b`、`§§\,x` は `,§§x` となり、
   戻したコンマは項目の内部に残ります。
   先頭の空白と空の項目は残します。null の style も空の項目を1個加えます。
   未使用名や prototype と同じ名前も保ちます。classDef は行を作りません。
   [fixture: treemap/db-class-repeat] [fixture: treemap/db-class-empty-final]
   [fixture: treemap/db-class-escaped-comma]
   [fixture: treemap/db-style-whitespace]
   [fixture: treemap/db-class-unused] [fixture: treemap/db-prototype-names]
   [fixture: treemap/db-class-style-marker]
   [fixture: treemap/db-class-style-marker-four]
   [fixture: treemap/db-class-style-marker-escaped-comma]
6. 公開するのは title・accTitle・accDescr・nodes・classDefs だけです。
   treemap の設定は Db 値や受理条件を与えません。
   コンパイル済み style・人工の根・
   集計値・描画順・座標・色は導きません。
   [fixture: treemap/db-all-fields] [fixture: treemap/config-drawing-only]
   [fixture: treemap/config-frontmatter-drawing]
   [fixture: treemap/config-init-drawing]

## 記録との比較

`specified.json` があればそれと、なければ `expected.json` と比較し、
共有設定と title は `embeddedValuesOf` で得ます。受理する読みには ast.json が
必要です。error の記録を飛ばすのは、
印の読みが `fixtureAccepts` で拒否する場合だけです。
記録の欠落を報告し、比較 Db のない opaque な入力は
[共有の比較規則](../../../spec/docs/known-divergences/embedded-data-opaque.ja.md)
に従って明示します。treemap 専用の specified reading は加えません。
[fixture: treemap/div-invalid-keeps-config]
[fixture: treemap/div-html-frontmatter-reverse]
[fixture: treemap/c4-component-section]
[fixture: treemap/div-retained-before-bare-unicode-line]
