# 木から Usecase の Db を作る

英語版: [usecase.md](./usecase.md)

`src/db-from-tree/usecase.ts` は、
[ast/usecase.md](../../../spec/docs/ast/usecase.ja.md) の記述された出現から、
[db-summaries.md](../db-summaries.ja.md#usecase) の保存済み要約を作ります。
ネイティブな受理条件は
[diagrams/usecase.md](../../../spec/docs/diagrams/usecase.ja.md) に従い、
同じモデル検証を `checkTree` も使います。JSON の内部は不透明に保ちます。

## 木から要約を作る手順

1. **値の変換。** 各葉の記述値と範囲を `convertedValuesOf` で読みます。
   共通の directive、コメント領域、選択されたセミコロンを除き、
   CR/CRLF を LF、エンティティをプレースホルダーに変換します。
   HTML 属性引用符の文脈はフロントマター後の本文全体から取ります。
   文字列・markdown の区切りを除き、要素・ノート・ステレオタイプ・
   ネイティブメタデータにはレイアウトのサニタイザーを適用しません。
   [fixture: usecase/directive-in-label]
   [fixture: usecase/lex-native-single-quote-comment-region-ls]
   [fixture: usecase/lex-statements-crlf] [fixture: usecase/lex-markdown-cr]
   [fixture: usecase/entity-all-texts]
   [fixture: usecase/gram-html-double-attribute]
   [fixture: usecase/gram-html-actor-icon]
   [fixture: usecase/lex-style-trigger-metadata-icon]
2. **名前と宣言。** 明示的な Identifier は変換した名前を使います。
   引用だけの名前は、変換内容の ASCII word 以外の UTF-16 コード単位を、
   一つずつ `_` に置き換えます。空の内容の id は空です。
   表示ラベルは変換したラベルで、markdown は `markdown`、
   裸と通常の引用文字列は `text` です。
   ラベルがなければ明示 id と `text` を使います。
   互換な明示宣言の反復はクラスを蓄積し、元の位置を保ちます。
   生成 id の宣言は、同じラベルでも衝突します。
   [fixture: usecase/gram-entity-derived-id]
   [fixture: usecase/gram-empty-quoted-name]
   [fixture: usecase/gram-generated-label-repeat]
   [fixture: usecase/db-three-definitions]
   [fixture: usecase/gram-bare-declaration-label-conflict]
   [fixture: usecase/gram-bare-endpoint-keeps-declared-label]
3. **解決と Map 順。** 図全体の宣言を集めてから、裸の関連端点と、
   引用だけの関連端点を解決します。actor キーワードの始点、
   図形・メタデータ・ステレオタイプがある端点は宣言です。
   ほかは参照で、未解決なら暗黙の usecase を作ります。
   Map は、各種類の id が宣言か端点に初めて現れた順です。
   関連とノートは文の順を保ちます。
   メタデータ・クラス・スタイルの更新は対象を作りません。
   [fixture: usecase/db-generated-reference]
   [fixture: usecase/gram-generated-reference-not-declaration]
   [fixture: usecase/gram-target-metadata-declaration]
   [fixture: usecase/gram-classes-on-reference-only]
   [fixture: usecase/db-json-source-map-order] [fixture: usecase/db-note-order]
   [fixture: usecase/db-metadata-forward] [fixture: usecase/db-class-forward]
   [fixture: usecase/db-style-forward]
4. **図形と所属。** actor は既定で `normal`、business は false です。
   空でない icon は `icon` 型を選び、そのテキストを残します。
   空の icon は省きます。usecase は既定で ellipse、business は false、
   AST の `rectangle` は Db の `rect` になります。
   boundary は既定で `rect`、ネイティブ type は `package` か `rect` です。
   ステレオタイプの共通空白を trim し、空でない結果を残します。
   空でない boundary id 内の宣言は `parentId` を持ちます。
   外側の出現は既存の所属を消さず、空の boundary id は親を設定しません。
   省略した members 一覧は作り直しません。
   [fixture: usecase/db-actor-variants] [fixture: usecase/gram-actor-icon-clear]
   [fixture: usecase/db-all-fields]
   [fixture: usecase/gram-stereotype-trimmed-conflict]
   [fixture: usecase/lex-stereotype-bom-padding]
   [fixture: usecase/db-boundary-three-definitions]
   [fixture: usecase/gram-boundary-three-classes-types]
   [fixture: usecase/db-empty-boundary-id]
5. **ネイティブメタデータ。** 順序付きのキーと値を読み、引用符を除きます。
   裸の `true` と `false` だけを真偽値にします。
   各プロパティのキー・型・値の集合を、解決した対象に対して検証します。
   actor/usecase の宣言プロパティの反復は一致が必要で、boundary は更新です。
   宣言メタデータの後で、単独更新をその記述順に適用します。
   最終 icon/type/business の組合せを検証し、後の修復は許しますが、
   宣言の衝突や無効なプロパティは消しません。
   edge の animation は、明示 animate false の後でも animate を true にします。
   [fixture: usecase/lex-native-single-quoted-keys]
   [fixture: usecase/gram-native-quoted-business]
   [fixture: usecase/gram-metadata-unknown-key]
   [fixture: usecase/gram-metadata-duplicate-inline-conflict]
   [fixture: usecase/gram-metadata-standalone-before-inline]
   [fixture: usecase/gram-native-final-invalid-then-valid]
   [fixture: usecase/gram-native-inline-conflict-later-fix]
   [fixture: usecase/gram-native-invalid-property-later-fix]
   [fixture: usecase/db-animation-order]
6. **関連とノート。** 端点は記述順です。
   association の arrowType は前向きの矢印が 0、後向きが 1、
   記号なしが 2、前向きの円・交差が 3/4、後向きが 5/6 です。
   実線の矢印・記号なしの minlen はダッシュ数から一つ引いた値、
   円・交差は 1 です。分割線は開始記号を opening、長さを closing から取ります。
   意味付きの種類は arrowType 0、minlen 1 で、
   include/extend は小文字の意味語を text ラベルとして補います。
   関連とノートのラベルは、空の引用内容も含め、変換内容と kind を保ちます。
   明示関連 id だけを残し、生成 edge/note id や派生コネクターは作りません。
   [fixture: usecase/db-arrows] [fixture: usecase/db-arrow-length]
   [fixture: usecase/db-labeled-arrows] [fixture: usecase/db-semantic-case]
   [fixture: usecase/gram-edge-empty-markdown-label]
   [fixture: usecase/gram-edge-whitespace-label]
   [fixture: usecase/db-edge-id-style] [fixture: usecase/db-note-order]
7. **クラスとスタイル。** 記述された接尾クラスを蓄積してから、
   class 指定をその記述順に適用します。最初の接尾部は反復を保ち、
   後の宣言と class 指定は、まだないクラスだけを追記します。
   [fixture: usecase/gram-class-suffix-duplicate]
   [fixture: usecase/gram-class-many]
   クラス定義は独立し、後の定義は元の Map 位置でスタイルを置き換えます。
   直接スタイルは追記します。
   CSS 宣言はコロン前後の空白を含む変換範囲全体で、
   外側だけ trim し、各 `\,` を `,` に変えます。
   引用された CSS 成分は記述を残し、
   クラス定義をノードに展開しません。
   [fixture: usecase/db-three-definitions]
   [fixture: usecase/db-classdef-replace]
   [fixture: usecase/db-style-append]
   [fixture: usecase/lex-css-property-padding]
   [fixture: usecase/lex-style-quoted-value-and-comma]
   [fixture: usecase/gram-styles-components]
   [fixture: usecase/gram-class-styles-resolution-order]
8. **不透明な JSON の effect。** 各 UsecaseJsonStatement に一つずつ、
   `{ id, set: { value, propertyOrder } }` を記述順に消費します。
   対応する id と両フィールドを必須とし、不足・余分・順序違いを拒否します。
   この二つだけを設定し、classes/styles は構文から取ります。
   builder も木の検査も JSON のプロパティを読まず、内容を検証しません。
   Map の順序は effect の消費と別に解決します。
   [fixture: usecase/db-json-source-map-order]
   [fixture: usecase/db-json-integer-order]
   [fixture: usecase/db-json-duplicate-order]
   [fixture: usecase/gram-json-object-scalar-overwrite]
   [fixture: usecase/div-gram-json-unquoted-key]
9. **方向と共通文字列。** 方向は `LR` で始まり、最後の指定を採用して、
   `TD` を `TB` に変えます。固定版がフロントマターの後で clear するため、
   title は空です。アクセシビリティの行とブロックは先の値を置き換え、
   完全に空の内容は空文字列になります。
   変換したタイトル値を trim し、説明では各 LF の後の空白も除きます。
   共通の `textReplacementOf(embedded.config)` サニタイザーは、
   アクセシビリティ文字列だけに適用します。
   htmlLabels/securityLevel の読みは
   [db-from-tree.md](../db-from-tree.ja.md#文字の置き換え) に定義されています。
   [fixture: usecase/db-direction-all] [fixture: usecase/db-direction-td]
   [fixture: usecase/frontmatter-title] [fixture: usecase/db-accessibility]
   [fixture: usecase/db-acctitle-empty] [fixture: usecase/db-accdescr-empty]
   [fixture: usecase/config-security-other]
   [fixture: usecase/config-security-other-root-false]

## 記録との比較

`specified.json` があれば使い、なければ `expected.json` を使います。
原子を分割する directive-as-token-boundary と
ignored-semicolon-as-token-boundary の拒否には、木ではなくエラーがあります。
Mermaid が不透明な内容を拒否した場合は、比較する受理済み Db がありません。
HTML・C4・先頭 percent の乖離には、既存の specified-reading の仕組みを使います。
両方が受理してアクセシビリティの Db が異なる場合も同じです。
usecase 専用の乖離の仕組みは不要です。
[fixture: usecase/div-directive-in-id]
[fixture: usecase/div-semicolon-identifier-selected]
[fixture: usecase/div-gram-json-malformed-escape]
[fixture: usecase/div-html-frontmatter-acc-title-db]
[fixture: usecase/div-c4-dynamic-json]
[fixture: usecase/div-comment-preheader-bare]
