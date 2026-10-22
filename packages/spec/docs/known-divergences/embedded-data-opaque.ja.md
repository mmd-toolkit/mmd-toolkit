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
[fixture: kanban/gram-metadata-caret] [fixture: kanban/gram-metadata-unclosed]
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
[fixture: venn/gram-data-block] [fixture: venn/frontmatter-empty]
[fixture: venn/frontmatter-unclosed]

隣り合う frontmatter の区切りの行と、
閉じていない frontmatter は構文エラーのままです。
[fixture: venn/gram-data-block] [fixture: venn/frontmatter-empty]
[fixture: venn/frontmatter-unclosed]

Ishikawa でも、正しく区切られた frontmatter と directive の内容は不透明です。
共通の属性の引用符の変換が起こす YAML エラーも含め、
不正な YAML だけでは図を拒否しません。
mermaid.js はこれらの frontmatter を拒否します。
[fixture: ishikawa/frontmatter-malformed]
[fixture: ishikawa/frontmatter-html-title]

空の区切り行の隣接と、閉じていない frontmatter は構文エラーのままです。
[fixture: ishikawa/frontmatter-empty] [fixture: ishikawa/frontmatter-unclosed]

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

| 例  | mermaid.js              | この仕様 |
| --- | ----------------------- | -------- |
| 1   | 拒否、`YAMLException`   | 受理     |
| 2   | 拒否、`YAMLException`   | 受理     |
| 3   | 拒否、`TypeError`       | 受理     |
| 4   | 拒否、「No such shape」 | 受理     |
| 5   | ラベル 12 を持つ頂点 A  | 同じ     |

[fixture: flowchart/frontmatter-invalid-yaml]
[fixture: common/frontmatter-duplicate-key]
[fixture: common/config-css-key-not-string]
[fixture: flowchart/div-data-unknown-shape]
[fixture: flowchart/db-data-label-number]

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

差異は一方向だけです。
埋め込まれたデータが持つもののために、
mermaid.js が受理しこの仕様が拒否する入力は、知られていません。
mermaid.js はこれらの入力に Db を与えないので、
その fixture は拒否だけを記録します。

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

これは mermaid.js が受理する入力の拒否ではないので、
そのための理由はどれも要りません
（[known-divergences.ja.md](../known-divergences.ja.md) を参照）。
mermaid.js が拒否する入力を受理するもので、
どちらも受理する入力は、すべて同じ Db を持ちます。

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
