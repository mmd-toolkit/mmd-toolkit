# embedded-data-opaque

英語版: [embedded-data-opaque.md](./embedded-data-opaque.md)

図種: すべて。
これは、この仕様の mermaid.js との
[既知の差異](../known-divergences.ja.md) の 1 つです。

## 構文

図の中の 3 種のテキストは、別の言語のデータで、図に埋め込まれています。

- フロントマターの本文。YAML です。
- `init:` の後の JSON のような、ディレクティブの引数。
- いくつかの図種のテキストの中の `@{ ... }` のデータブロック。YAML です。
  flowchart のノードの形のデータや、sequence の参加者のデータがそうです。

```mmd
---
title: farm
---
%%{init: {"fontFamily": "serif"}}%%
flowchart LR
  A@{ shape: rect }
```

[fixture: flowchart/frontmatter-title] [fixture:
common/config-font-family-string] [fixture: flowchart/gram-data-shape-known]

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

[fixture: flowchart/frontmatter-invalid-yaml] [fixture:
common/frontmatter-duplicate-key] [fixture: common/config-css-key-not-string]
[fixture: flowchart/div-data-unknown-shape] [fixture:
flowchart/db-data-label-number]

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
  [fixture: common/frontmatter-title-single-quoted-tag] [fixture:
  common/frontmatter-yaml-error] [fixture: common/frontmatter-two-documents]
- 文字列、数、true であるフロントマターの `config` か、その中の `gantt` と、
  一緒にある `displayMode`。
  [fixture: common/frontmatter-display-mode-primitive-config] [fixture:
  common/config-display-mode-gantt-primitive]
- 文字列、数、true である init の設定と、一緒にある wrap ディレクティブ。
  [fixture: common/directive-primitive-init-wrap] [fixture:
  common/directive-primitive-init-two-wrap-substrings]
- mermaid.js がそこに許さない文字を持つ文字列の `themeVariables` と、
  mermaid.js が色として解析できないテーマの変数。
  [fixture: common/config-theme-variables-string-rejected] [fixture:
  common/config-theme-colour-rejected]
- init ディレクティブがあるときに mermaid.js が行う、2 回目の判定の失敗。
  [fixture: common/config-init-detection-rejects]
- 正しい YAML でないデータブロック。
  [fixture: flowchart/div-data-invalid-yaml]
- flowchart の頂点のデータブロックで、中身が改行を持ち、
  値が null の YAML であるもの
  （改行だけ、コメントだけ、`null`、`~`、文書の印だけなど）。
  mermaid.js は、改行を持つ中身を YAML の文書として、
  改行を持たない中身を波括弧の間のマッピングとして読み
  （[`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L143-L151)）、
  その後で値の形を読むので、値がないと `TypeError` で失敗します
  （[`addVertex()`](https://github.com/mermaid-js/mermaid/blob/98a0945418c76238f15df2afaddbba4272656c3b/packages/mermaid/src/diagrams/flowchart/flowDb.ts#L235-L236)）。
  `A@{`、改行、`}` はそこで拒否されますが、
  1 行の `A@{ }` と `A@{ # c }` は両方が受理し、
  mermaid.js が形を読まない辺の id の同じブロックも同じです。
  sequence では、mermaid.js は改行があっても、
  データブロックの中身をマッピングとして読み、
  そのようなブロックを受理します。
  [fixture: flowchart/div-data-block-line-break-only] [fixture:
  flowchart/div-data-block-comment-then-line-break] [fixture:
  flowchart/div-data-block-null-on-own-line] [fixture:
  flowchart/gram-data-block-comment-one-line] [fixture:
  flowchart/gram-data-block-space-only] [fixture:
  flowchart/gram-data-block-edge-line-break-only] [fixture:
  sequence/gram-data-block-line-break-only]

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

mermaid.js は、フロントマターの本文とデータブロックを YAML として、
いくつかのディレクティブの引数を JSON として解析し、
そこから設定と図のデータを得て、描く前か描く間にその結果を検査します
（[設定（参考）](../../../tests/docs/configuration.ja.md#設定参考) を参照）。
そのどの段階が失敗しても、入力は拒否されます。

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
