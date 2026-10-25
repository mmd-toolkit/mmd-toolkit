# embedded-data-opaque

英語版: [embedded-data-opaque.md](./embedded-data-opaque.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

図の中の 3 種のテキストは、別の言語のデータで、図に埋め込まれています。

- フロントマターの本文。YAML です。
- `init:` の後の JSON のような、ディレクティブの引数。
- いくつかの図種のテキストの中の `@{ ... }` のデータブロック。
  flowchart の形状や sequence の参加者のデータは YAML、
  usecase の表は JSON です。
  [fixture: usecase/db-json-values]

```mmd
---
title: farm
---
%%{init: {"fontFamily": "serif"}}%%
flowchart LR
  A@{ shape: rect }
```

[fixture: flowchart/frontmatter-title]
[fixture: common/config-font-family-string]
[fixture: flowchart/gram-data-shape-known]

この仕様は、そのどれも書かれたとおりに保ち、解析も検査もしません。
それぞれがどこで始まりどこで終わるかは、構文の一部です
（[フロントマター](../common.ja.md#フロントマター)、
[ディレクティブ](../common.ja.md#ディレクティブ)、
各図種の文書のデータブロックを参照）。
この文書は、それらが何を持つかについてのものです。

kanban ではフロントマターと `@{ ... }` の中身は解析しません。
境界が正しければ、
不正な YAML と重複キーは入力を拒否させません。
[fixture: kanban/gram-frontmatter-invalid-yaml]
[fixture: kanban/gram-metadata-bad-yaml]
[fixture: kanban/gram-metadata-ticket-duplicate]

空の複数行ブロックは受理します。
[fixture: kanban/gram-metadata-empty-multiline]

メタデータの型と形名の綴りは検査しません
（[データブロック](../diagrams/kanban.ja.md#データブロック) を参照）。
[fixture: kanban/gram-metadata-shape-number]
[fixture: kanban/gram-metadata-shape-camel]
[fixture: kanban/gram-metadata-shape-underscore]

kanban の隣り合うデータブロックは別々のノードに保ちます。
[fixture: kanban/db-metadata-two-items]
[fixture: kanban/db-metadata-one-item-reference]

連結した埋め込みデータの中身だけによる拒否もこの差異です。
[fixture: kanban/gram-metadata-two-blocks]

二重引用符の外の `^`、閉じないデータブロック、
入れ子のマッピングがブロックを閉じた後に残る波括弧は構文エラーです。
この差異には当たりません。
[fixture: kanban/gram-metadata-caret]
[fixture: kanban/gram-metadata-unclosed]
[fixture: kanban/gram-metadata-assigned-mapping]

C4 では frontmatter とディレクティブの内容は不透明なので、
正しく区切られた frontmatter の `title: [` のような無効な YAML は、
ここでは図を拒否せず、mermaid.js は拒否します。
[fixture: c4/div-frontmatter-invalid-yaml]

C4 には `@{ ... }` のデータブロック形式はありません。
[fixture: c4/gram-data-block]

venn では、
正しく区切られた frontmatter 内の `title: [` などの不正な YAML は、
ここでは受理しますが mermaid.js は拒否します。
[fixture: venn/frontmatter-invalid]

venn に `@{ ... }` のデータブロックの形はありません。
[fixture: venn/gram-data-block]
[fixture: venn/frontmatter-empty]
[fixture: venn/frontmatter-unclosed]

隣り合う frontmatter の区切りの行と、
閉じていない frontmatter は構文エラーのままです。
[fixture: venn/gram-data-block]
[fixture: venn/frontmatter-empty]
[fixture: venn/frontmatter-unclosed]

Ishikawa でも、正しく区切られた frontmatter と directive の内容は不透明です。
共通の属性の引用符の変換が起こす YAML エラーも含め、
不正な YAML だけでは図を拒否しません。
mermaid.js はこれらの frontmatter を拒否します。
[fixture: ishikawa/frontmatter-malformed]
[fixture: ishikawa/frontmatter-html-title]

空の区切り行の隣接と、閉じていない frontmatter は構文エラーのままです。
[fixture: ishikawa/frontmatter-empty]
[fixture: ishikawa/frontmatter-unclosed]

Ishikawa の `@{...}` にデータブロックの構文はなく、通常の節点のテキストです。
不正に見える内容や閉じていない内容も、
埋め込みデータの差異ではなくテキストです。
[fixture: ishikawa/db-data-block-is-text]
[fixture: ishikawa/gram-child-unclosed-brace]

## 差異

どの例も、図の全体です。

1. 正しい YAML でないフロントマター:

   ```mmd
   ---
   title: [unclosed
   ---
   flowchart LR
     A
   ```

2. 同じキーを 2 回持つフロントマター:

   ```mmd
   ---
   title: a
   title: b
   ---
   flowchart LR
     A
   ```

3. mermaid.js が文字列を求める場所の数:

   ```mmd
   %%{init: {"fontFamily": 5}}%%
   flowchart LR
     A
   ```

4. mermaid.js が知らない形:

   ```mmd
   flowchart LR
     A@{ shape: nope }
   ```

5. ラベルとしての数:

   ```mmd
   flowchart LR
     A@{ label: 12 }
   ```

| 例                                            | mermaid.js              | この仕様 |
| --------------------------------------------- | ----------------------- | -------- |
| 1                                             | 拒否、`YAMLException`   | 受理     |
| 2                                             | 拒否、`YAMLException`   | 受理     |
| 3                                             | 拒否、`TypeError`       | 受理     |
| 4                                             | 拒否、「No such shape」 | 受理     |
| 5                                             | ラベル 12 を持つ頂点 A  | 同じ     |
| [fixture: flowchart/frontmatter-invalid-yaml] |
| [fixture: common/frontmatter-duplicate-key]   |
| [fixture: common/config-css-key-not-string]   |
| [fixture: flowchart/div-data-unknown-shape]   |
| [fixture: flowchart/db-data-label-number]     |

つまり mermaid.js は、埋め込まれたデータを解析できないときや、
その結果が知らない形のときに、入力を拒否します。
この仕様は、そのような入力をすべて受理し、
ほかの入力と同じく、その木（構文木、AST）は、
埋め込まれたデータを書かれたとおりに持ちます。
埋め込まれたデータが持つものだけを理由に mermaid.js が拒否する入力は、
ほかに次のものがあります。

- mermaid.js が、`title: '<a b="c">'` のように、
  タグの中の `="..."` を `='...'` に書き換えて自分で作る YAML のエラーと、
  2 つの YAML の文書を持つフロントマター。
  [fixture: common/frontmatter-title-single-quoted-tag]
  [fixture: common/frontmatter-yaml-error]
  [fixture: common/frontmatter-two-documents]

- 文字列、数、true であるフロントマターの `config` か、その中の `gantt` と、
  一緒にある `displayMode`。
  [fixture: common/frontmatter-display-mode-primitive-config]
  [fixture: common/config-display-mode-gantt-primitive]

- 文字列、数、true である init の設定と、一緒にある wrap ディレクティブ。
  [fixture: common/directive-primitive-init-wrap]
  [fixture: common/directive-primitive-init-two-wrap-substrings]

- mermaid.js がそこに許さない文字を持つ文字列の `themeVariables` と、
  mermaid.js が色として解析できないテーマの変数。
  [fixture: common/config-theme-variables-string-rejected]
  [fixture: common/config-theme-colour-rejected]

- init ディレクティブがあるときに mermaid.js が行う、2 回目の判定の失敗。
  [fixture: common/config-init-detection-rejects]

- 正しい YAML でないデータブロック。
  [fixture: flowchart/div-data-invalid-yaml]

- flowchart の頂点のデータブロックで、中身が改行を持ち、
  値が null の YAML であるもの
  （改行だけ、コメントだけ、`null`、`~`、文書の印だけなど）。
  mermaid.js は、改行を持つ中身を YAML の文書として、
  改行を持たない中身を波括弧の間のマッピングとして読み
  （

[`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L143-L151)）、
その後で値の形を読むので、値がないと `TypeError` で失敗します
（

[`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L235-L236)）。
`A@{`、改行、`}` はそこで拒否されますが、
1 行の `A@{ }` と `A@{ # c }` は両方が受理し、
mermaid.js が形を読まない辺の id の同じブロックも同じです。
sequence では、mermaid.js は改行があっても、
データブロックの中身をマッピングとして読み、
そのようなブロックを受理します。
[fixture: flowchart/div-data-block-line-break-only]
[fixture: flowchart/div-data-block-comment-then-line-break]
[fixture: flowchart/div-data-block-null-on-own-line]
[fixture: flowchart/gram-data-block-comment-one-line]
[fixture: flowchart/gram-data-block-space-only]
[fixture: flowchart/gram-data-block-edge-line-break-only]
[fixture: sequence/gram-data-block-line-break-only]

上記の不正なデータの例は一方向です。
mermaid.js は拒否して Db を与えず、この仕様は受理します。
下記の gitgraph の例のように、埋め込み設定は受理を両方向に変える場合もあります。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/div-frontmatter-main-branch-duplicate-default-accepted]

### 比較する Db

参照入力では、差異の原因となる埋め込みデータだけを除きます。

1. フロントマターやディレクティブからの設定の導出で Mermaid が拒否する場合、
   拒否されたブロックだけを除きます。
   ほかのフロントマターやディレクティブは残します。
   [fixture: sequence/div-invalid-frontmatter-preserves-wrap-directive]
2. 正しい埋め込み設定が図の受理条件を変える場合、
   その条件が使う鍵だけを除いた設定で読み、ほかの値は残します。
   gitgraph と packet の鍵は下記で名指しします。
   [fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
   [fixture: gitgraph/div-frontmatter-html-labels-default-comparison]
   [fixture: gitgraph/div-init-html-labels-default-comparison]

フロントマターのタイトルは、
[html-tag-in-frontmatter](./html-tag-in-frontmatter.ja.md)と同じく、
Mermaid が導く値を保ちます。
Db にだけ効く設定も残します。
不正なフロントマターを除いても、正しい `wrap: true` のディレクティブは、
sequence のメッセージを wrap させます。
[fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
[fixture: sequence/div-invalid-frontmatter-preserves-wrap-directive]

その参照入力が受理されると、
元の入力への Mermaid の拒否からは Db を得られなくても、
`specified.json` は参照入力の Db と埋め込み値を比較のために記録します。
比較する Db が `null` になるのは、
参照入力にも同じ不透明なデータによる拒否が残るときだけです。
その場合も、指定の読みは受理です。
[fixture: gitgraph/div-frontmatter-invalid-yaml]
[fixture: gitgraph/div-frontmatter-html-invalid-yaml]
[fixture: info/div-frontmatter-invalid-yaml]
[fixture: info/div-frontmatter-html-invalid-yaml]
[fixture: flowchart/div-data-unknown-shape]

## 書き手にとっての結果

フロントマターやデータブロックの壊れた YAML、型の違う設定の値、
mermaid.js が知らない形を持つ図は、
mmd-toolkit のパーサーで受理され、フォーマッターで整形され、
mermaid.js は拒否します。
そのような誤りを、mmd-toolkit のパーサーは報告しません。
埋め込まれたデータの値の検査は、ほかのツールに任せます。

## mermaid.js がそう読む理由

mermaid.js は、frontmatter と YAML の形のデータブロックを YAML、
usecase の表の本文を JSON、いくつかの directive の引数を JSON として解析します。
そこから設定と図のデータを得て、描く前か描く間に結果を検査します
（[設定（参考）](../../../tests/docs/configuration.ja.md#設定参考) を参照）。
そのどの段階が失敗しても、入力は拒否されます。
[fixture: usecase/db-json-integer-order]
[fixture: usecase/db-json-duplicate-order]
[fixture: usecase/gram-json-object-scalar-overwrite]
[fixture: usecase/gram-json-control-escapes]
[fixture: usecase/div-gram-json-malformed-escape]

## この仕様の規則と、その理由

この仕様は、埋め込まれたデータの中身を解析しません。
木はそのテキストを書かれたとおりに持ち、受理はその中身によりません。
木を作るのに YAML も JSON も要らず、
それを除けば、実装はその両方を持たずに済みます。
タイトルや設定のような値が要るツールは、そのテキストを自分で解析します。

不正な埋め込み内容の受理には、
[known-divergences.ja.md](../known-divergences.ja.md) の逆方向の基準を使います。
ソースのテキストを持つために内容の検証は不要だからです。
下記の gitgraph の設定の例は、理由 2 により Mermaid が受理する入力も拒否します。
既定の設定を使う直接の規則により、埋め込み内容を不透明に保ちます。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/docs-syntax-gitgraph-2ea99686]

### Agentflow

AgentflowDataBlock は頂点、flow の見出し、
connector の見出しの全てのブロックの内部を、隣接するものも別々に、
書かれたまま保持します。
不正な YAML、未知の形の名前、不正な metadata の型、
結合したブロックの YAML の失敗、再帰する alias の失敗は、
木の構築ではなく内容に依存します。
既存の逆方向の条件により受理します。
YAML のプロパティの木、キーの除去、alias の解決は不要です。
[fixture: agentflow/db-data-block-invalid-yaml]
[fixture: agentflow/db-data-block-unknown-shape]
[fixture: agentflow/db-metadata-adjacent-no-comma]
[fixture: agentflow/div-metadata-yaml-self-alias]
[fixture: agentflow/div-data-percent-line-is-content]
[fixture: agentflow/gram-data-adjacent-multiline-blocks]

区切りの失敗は構文の誤りのままです。
閉じないブロック、単引用符だけで保護する波括弧、
二重引用のデータの文脈の外のキャレットは、内容の拒否ではありません。
空の複数行のブロックは、この固定版で既に受理されます。
[fixture: agentflow/lex-data-block-unclosed]
[fixture: agentflow/lex-data-block-single-quoted-brace]
[fixture: agentflow/lex-data-block-caret]
[fixture: agentflow/db-data-block-empty-multiline]

### Usecase

usecase の JSON の表は、json、id、`@{ ... }` の形で、YAML ではなく JSON です。
波括弧の中身全体を UsecaseJsonDataBlock.value に保ち、
frontmatter と directive の内容は共通のレコードに保ちます。
これらの節点で書かれたテキストを保持できます。
mermaid 独自の JSON reader は、裸のキー、不正 escape、末尾コンマ、
構造的な U+2028/U+2029 など、釣り合いのある不正な内容を拒否します。
この仕様は、不透明な木の構築に JSON 検証は不要という既存の逆方向の基準により、
内容だけの失敗を受理します。
外から与える表の value と propertyOrder は子の節点にしません。
[fixture: usecase/div-gram-json-unquoted-key]
[fixture: usecase/div-gram-json-malformed-escape]
[fixture: usecase/div-gram-json-trailing-comma]
[fixture: usecase/div-gram-json-u2028]
[fixture: usecase/div-lex-json-ps-whitespace]
[fixture: usecase/db-json-duplicate-order]
[fixture: usecase/div-frontmatter-malformed]

mermaid は
[`JSON.parse()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseJson.ts#L345-L378)
で JSON の妥当性を検証し、復号した値を得ます。
検証を通った object root では、続いて
[`PropertyOrderCollector.collect()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/usecase/parser/usecaseJson.ts#L373-L377)
でソースのプロパティ順序を集めます。
collector は JSON エラーの位置の特定にも使いますが、
JSON の検証の代わりにはしません。
native metadata のプロパティ文法はこの JSON reader を使いません。
[fixture: usecase/db-json-integer-order]
[fixture: usecase/db-json-duplicate-order]
[fixture: usecase/gram-json-object-scalar-overwrite]
[fixture: usecase/gram-json-control-escapes]
[fixture: usecase/div-gram-json-malformed-escape]

閉じない括弧、{ で始まらない root、
最初の釣り合う閉じの後の残りは構文エラーです。
この matcher で一重引用符は波括弧を保護しません。
宣言や更新の native な `@{ ... }` は別で、
UsecaseMetadata と順序つきのプロパティを持ち、不透明ではありません。
キー、型、組合せの検証をすべて保ちます。
この規則で embedded 内容を理由に、
mermaid が受理する入力を拒否することはありません。
[fixture: usecase/gram-json-empty-delimiter-only]
[fixture: usecase/gram-json-array-root]
[fixture: usecase/gram-json-brace-in-single-quote]
[fixture: usecase/gram-native-quoted-business]
[fixture: usecase/gram-metadata-unknown-key]
[fixture: usecase/lex-native-single-quoted-keys]

### Pie

Frontmatter は不正な YAML の本文を書かれたまま持てるので、
構文のノードが足りないわけではありません。
内容は木の構造を決めず、検査しません。
先頭のフロントマターの本文 `title: [` を、mermaid.js は YAML として拒否し、
この仕様は受理します。
HTML 属性の引用符の変換で、書かれた YAML のタイトルが不正になる場合も、
usecase の場合と同じく含みます。
[fixture: pie/div-review-frontmatter-html-invalid-yaml]
[fixture: usecase/div-gram-frontmatter-html-attribute-quotes]
これは逆方向の場合だけで、不透明な内容を理由に、
mermaid.js が受理する入力をこの規則が拒否することはありません。
先頭以外の隠れた YAML は mermaid.js でもすでに不透明なので、
不正な本文は PieIgnoredText に持ち、印を付けません。
下の不正な init 引数も両者が受理し、印を持ちません。
[fixture: pie/div-review-yaml-leading-invalid]
[fixture: pie/review-yaml-hidden-invalid]
[fixture: pie/lex-yaml-after-comment-invalid-body]
[fixture: pie/review-directive-invalid-init]

### Gitgraph

フロントマターは内容を解釈しないソースのノードを持ちます。
Mermaid が拒否する先頭の不正な YAML は、ここでは受理します。
元の入力への拒否からは Db を得られませんが、
差異の原因となるブロックや鍵だけを除いた参照入力が受理されると、
[比較する Db](#比較する-db)の規則により、
`specified.json` はその Db と埋め込み値を比較のために記録します。
この 2 つのフロントマターでは、その Db は初期分岐 `main` だけの空の履歴です。
[fixture: gitgraph/div-frontmatter-invalid-yaml]
[fixture: gitgraph/div-frontmatter-html-invalid-yaml]
先頭以外の不正な隠れた YAML は GitgraphIgnoredText に持て、既に一致します。
Mermaid が受理する不正な init 引数も差異ではありません。
[fixture: gitgraph/div-frontmatter-invalid-yaml]
[fixture: gitgraph/div-frontmatter-html-invalid-yaml]
[fixture: gitgraph/lex-yaml-invalid-body]
[fixture: gitgraph/directive-invalid-init]

埋め込み設定が受理条件を変える場合、この仕様はその条件に既定の設定を使います。
gitgraph では、初期分岐 `main` と、
[意味上の受理条件](../diagrams/gitgraph.ja.md#意味上の受理条件)で定めた
既定のエスケープです。
比較に使う設定から除く鍵は、
`gitGraph.mainBranchName` と `gitGraph.htmlLabels` です。
ほかの設定の値と、Mermaid が導くタイトルは残します。
[fixture: gitgraph/div-frontmatter-main-branch-preserves-title]
[fixture: gitgraph/div-frontmatter-html-labels-default-comparison]
[fixture: gitgraph/div-init-html-labels-default-comparison]

既定の secure key の規則では、`securityLevel` は入れ子の中も含めて secure です。
root の `securityLevel` と `gitGraph.securityLevel` は、
フロントマターでも init ディレクティブでも変更できません。
これらの設定の試みは、Mermaid が既に除きます。
サイトの設定では、上記の受理条件のとおり gitgraph の値を与えられます。
[fixture: gitgraph/frontmatter-security-level-secure]
[fixture: gitgraph/directive-security-level-secure]
[fixture: gitgraph/config-gitgraph-loose]

フロントマターとディレクティブのノードは、既に書かれた設定を持ちます。
そこから分岐やエスケープを選ぶには、不透明な内容を読む必要があります。
直接の規則では代わりに既定値を使い、
Mermaid が受理する向きには理由 2 を使います。
テキストの外のサイト設定は、上記のとおり設定を持つ側が適用します。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/docs-syntax-gitgraph-2ea99686]
[fixture: gitgraph/config-main-branch]

文書由来の 2 例のフロントマターの設定により、
Mermaid は `develop` または `MetroLine1` の checkout を受理します。
この仕様では既定の初期名を使い、これらを未知の分岐として拒否します。
逆方向では、フロントマターの `mainBranchName: dev` により、
Mermaid は `branch dev` を重複、`checkout main` を未知として拒否します。
この仕様はどちらも受理します。
init ディレクティブで同じ名前を設定した `branch dev` も、
Mermaid では拒否し、ここでは受理します。
5 入力すべてにこの識別子の印を付け、指定の読みには逆の受理を記録します。
[fixture: gitgraph/docs-community-contributing-05cdc44b]
[fixture: gitgraph/docs-syntax-gitgraph-2ea99686]
[fixture: gitgraph/div-frontmatter-main-branch-duplicate-default-accepted]
[fixture: gitgraph/div-frontmatter-main-branch-checkout-default-accepted]
[fixture: gitgraph/div-init-main-branch-duplicate-default-accepted]

### Info

Frontmatter は書かれた本文を既に持ちます。属性の引用符の変換で不正になった
YAML も含め、不正な内容はソースの構造を決めず、Mermaid が拒否してもここでは受
理します。元の入力への拒否からは Db を得られませんが、
差異の原因となるブロックや鍵だけを除いた参照入力が受理されると、
[比較する Db](#比較する-db)の規則により、
`specified.json` はその Db と埋め込み値を比較のために記録します。
この 2 つのフロントマターでは、その Db は `{}` です。
この規則で Mermaid が受理する入力を拒否することはありません。
不正な隠れた YAML と記録済みの不正な init 引数は両方
が受理し、印を付けません。 [fixture: info/div-frontmatter-invalid-yaml]
[fixture: info/div-frontmatter-html-invalid-yaml]
[fixture: info/hidden-yaml-preheader-invalid]
[fixture: info/directive-invalid-init]

### Packet

Frontmatter/directive ノードは内容を受理のために
解釈せず保持する。
不正な YAML は Mermaid だけが拒否する場合がある。
両方向とも比較では有効なテキスト設定から `packet.bitsPerRow` だけを除き、
サイト設定、Mermaid が導いた frontmatter title、ほかの有効な設定を残す。
[fixture: packet/frontmatter-invalid]
[fixture: packet/frontmatter-invalid-keeps-config]
[fixture: packet/config-frontmatter-fraction]
[fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site]
[fixture: packet/config-directive-overrides-site]

受理条件は
[packet の意味上の受理条件](../diagrams/packet.ja.md#意味上の受理条件)
で定め、既定の `packet.bitsPerRow = 32` を使います。
比較設定から除く鍵は **`packet.bitsPerRow`** です。
YAML frontmatter と init の小数幅は、
Mermaid が拒否して本仕様が受理する場合があり、
サイトの小数幅をテキストの 32 で上書きすると逆方向の差異になります。
両方向とも specified.json に受理と Db・埋め込み値を記録します。
サイト設定はそれを持つ者が適用し、テキストの設定から再構築しません。
[fixture: packet/config-frontmatter-fraction]
[fixture: packet/config-directive-fraction]
[fixture: packet/config-frontmatter-overrides-site]
[fixture: packet/config-directive-overrides-site]

不正な先頭 frontmatter は比較からだけ省き、
隣の有効な showBits directive は残します。
非先頭の hidden YAML は PacketIgnoredText が所有するので、
不正な内容だけによる差異ではありません。
受理を変えずに公開行だけを変える設定は通常の embedded configuration として扱い、
[tests の要約](../../../tests/docs/db-summaries.md#packet)に従います。
[fixture: packet/frontmatter-invalid-keeps-config]
[fixture: packet/hidden-yaml-body]
[fixture: packet/config-frontmatter-row-fraction-accepted]
[fixture: packet/config-init-row-integer]

### Architecture

architecture は frontmatter と共通 directive の内容を、
埋め込み data の検証なしで保持する。
不正な YAML、重複 key、共通設定の不正な型により mermaid が拒否しても、
ここでは受理する場合がある。
比較では拒否された data だけを除き、独立した設定は残す。
native hidden YAML/DIRECTIVE の本文は ignored form であり、設定 block ではない。
正しい埋め込み設定から除く architecture の acceptance key はない。
描画設定、maxEdges、maxTextSize はこの図の public parse の受理を変えない。
[fixture: architecture/div-frontmatter-invalid-yaml]
[fixture: architecture/div-frontmatter-duplicate-key]
[fixture: architecture/div-init-fontfamily-number]
[fixture: architecture/div-init-primitive-wrap]
[fixture: architecture/div-invalid-keeps-config]
[fixture: architecture/hidden-yaml-before-header]
[fixture: architecture/lex-yaml-global-directive]
[fixture: architecture/config-drawing-only]
[fixture: architecture/config-site-maxedges]
[fixture: architecture/config-limit-small]

### Radar

radar は先頭の frontmatter と global directive の引数を、
内容を検証しない共有 record として保ちます。
まず木に持てるかを考えると、Frontmatter と Directive に保てます。
radar.* に radar の受理を変える鍵はなく、
両方向の比較から除く radar 固有の acceptance key はありません。
site・frontmatter・init の描画/option 設定は、
正しい構文を拒否させず、不足した名前つき entry も救済しません。
[fixture: radar/frontmatter-invalid]
[fixture: radar/frontmatter-invalid-keeps-config]
[fixture: radar/config-invalid-display-mode]
[fixture: radar/config-drawing-only]
[fixture: radar/config-options-site]
[fixture: radar/detect-retained-close-no-lf-control]
[fixture: radar/detect-retained-opener-nbsp]
[fixture: radar/detect-retained-closer-u3000]
[fixture: radar/lex-bare-accessibility-ids]
[fixture: radar/lex-false-prefix-id]

残る逆方向の受理の差異は、図の文法の外での埋め込みデータの検証です。
比較では共有の比較規則に従い、拒否の原因だけを除き、無関係な値を保ちます。
native hidden YAML/directive は RadarIgnoredText が所有します。
radar は埋め込み payload として検証しません。
独立した共有の設定の読み方は tests の要約に従います。
[fixture: radar/frontmatter-invalid-keeps-config]
[fixture: radar/config-invalid-display-mode]
[fixture: radar/retained-yaml-control]
[fixture: radar/lex-hidden-yaml-global-inside]
[fixture: radar/detect-retained-three-native]

## mermaid.js の文書と issue

- 固定した版の

[C4 の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/c4.md#L159-L171)
は `c4.wrap` を設定する正しい YAML のフロントマターを示し、
不正な埋め込み YAML の扱いは述べていません。
`mermaid-js/mermaid` の issue と pull request を、
2026-10-21 に `C4 YAML in:title,body`、
`C4 "invalid YAML" in:title,body`、
`C4 frontmatter in:title,body` で検索したところ、
[issue #7949](https://github.com/mermaid-js/mermaid/issues/7949)
が見つかりました。
この issue は不正な YAML ではなく、
折り返しの設定についての問題を報告しています。
C4 のフロントマターの不正な YAML の受理を扱う、
issue や pull request は見つかりませんでした。

- ピン留めした

[venn の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/venn.md)
は正しい YAML frontmatter を示しますが、
不正な YAML の受理条件は述べていません。
2026-10-21 に `mermaid-js/mermaid` の issue と PR を
`venn YAML in:title,body`、`venn "invalid YAML" in:title,body`、
`venn frontmatter in:title,body` で検索し、
venn の frontmatter 内の不正な YAML の受理に関する報告は
見つかりませんでした。

- ピン留めした

[Ishikawa の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/ishikawa.md#L11-L38)
は節点のテキストと字下げを説明しますが、
不正な埋め込み YAML の受理条件は述べていません。
2026-10-21 に `mermaid-js/mermaid` の issue と PR を
`ishikawa`、`ishikawa frontmatter in:title,body`、
`ishikawa "invalid YAML" in:title,body` で検索し、
Ishikawa の frontmatter 内の不正な YAML の受理に関する報告は
見つかりませんでした。

- 固定版の

[Agentflow の metadata の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/agentflow.md#L233-L268)
はノード、辺、コンテナーの YAML ブロックと、
未知のキーの保持や prototype の形のキーの除去を説明します。
不正な YAML の受理方針は述べていません。
2026-10-22 に `mermaid-js/mermaid` の issue と pull request を
`agentflow YAML in:title,body` で検索し、
図種を導入する
[PR #8072](https://github.com/mermaid-js/mermaid/pull/8072) と、
ELK の配置設定を提案する
[issue #7827](https://github.com/mermaid-js/mermaid/issues/7827)
が見つかりました。
どちらも Agentflow の不正な YAML の受理を報告するものではありません。

- pin の
  [usecase 文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/usecase.md#L1-L589)
  は JSON の表を説明します。
  2026-10-22 に mermaid-js/mermaid の issue と PR を
  `usecase JSON` で検索し、
  この受理挙動を保守者が欠陥と判断したと示す報告は、
  調べた結果にはありませんでした。
  [PR #8048](https://github.com/mermaid-js/mermaid/pull/8048) は
  Type: Enhancement で、2026-08-14 にマージ済みで閉じています。
  Chevrotain parser、モデル検証、JSON の表を導入します。
  この差異は共有の直接の規則に従うもので、
  bug ラベルを文法変更の承認とは読みません。

- pie では、2024-02-11 にマージされた
  [PR #4751](https://github.com/mermaid-js/mermaid/pull/4751) が、
  共通の先頭フロントマターの抽出とは別の、隠れた YAML の規則を導入しました。
  pin した
  [構文文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/pie.md)
  は、この隠れた本文の検証を定めません。
  2026-10-23 に `pie`、`pie YAML`、`pie frontmatter` で検索しましたが、
  その本文の検証を必要とする保守者の判断は見つかりませんでした。
  この仕様は、共通の不透明なデータの方針を先頭のフロントマターに適用します。

gitgraph の
[gitgraph.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/gitgraph.md)
は、
見出しと各コマンドを説明します。
2026-10-23 に issue・PR を `gitGraph`、`gitGraph directive`、
`gitGraph YAML`、`gitGraph semicolon`、`gitGraph keyword`、
`gitGraph duplicate`、`gitGraph cherry-pick` で検索しました。
確認した結果には、この共通の境界を決定するものはありませんでした。
[#4838](https://github.com/mermaid-js/mermaid/issues/4838) は終了済みで
Status: Approved が付き、
merge 済みの [#6707](https://github.com/mermaid-js/mermaid/pull/6707) は
重複 ID の警告を加えます。これらから追加の差異は作りません。

- info には専用の構文ページがなく、pin した
  [構文の参照](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/intro/syntax-reference.md)
  は図種の宣言と percent コメントを説明します。2026-10-23 に `info showInfo`・
  `info directive`・`info semicolon`・`info accTitle` で issue と PR を検索しま
  した。[#7601](https://github.com/mermaid-js/mermaid/issues/7601) は
  info/showInfo の描画を報告し、open、Type: Bug / Error、Status: Triage でした。
  検査した結果には、この構文の拒否を決める info 固有の保守者の判断はありません。
  この節は既存の直接の規則に従います。

- pin の
  [packet の文書](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/packet.md#L12-L28)
  は単一位置・範囲・相対 count を示します。
  この前処理の境界については定めていません。
  2026-10-25 に `packet bitsPerRow`、`packet fractional`、
  `packet maxPacketSize` で公式 repository の issue・PR を検索しましたが、
  ここでの差異に関する maintainer の判断を示す結果は見つかりませんでした。

- pinned の
  [architecture.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/architecture.md#L21-L175) は見出し・宣言・辺を説明するが、
  この共通の前処理の境界を定義しない。
  2026-10-25 に公式の issue/PR を architecture group undefined、
  architecture quotes title、architecture reverse、architecture unclosed、
  architecture align で検索した。
  [#7211](https://github.com/mermaid-js/mermaid/issues/7211) は
  Open、Status: Approved で、外側の親 group の辺を扱う報告である。
  今回の共通境界に対する maintainer の判断とはしない。

- Radar:
  [radar.md](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/docs/syntax/radar.md#L66-L166) は軸・曲線・option を説明します。
  2026-10-25 に公式の issue/PR を radar directive、radar semicolon、
  radar entries で調べましたが、
  上記の境界を不具合とする判断は見つかりませんでした。
  [#7187](https://github.com/mermaid-js/mermaid/issues/7187) は閉じられた
  Status: Approved の文書報告です。
  [#7188](https://github.com/mermaid-js/mermaid/pull/7188) は、
  文書例の comma の修正で、
  末尾 comma の文法上の対応を追加したものではありません。
