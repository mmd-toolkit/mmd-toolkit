---
since: v0.4.0
---

# @mmd-toolkit/flowchart-no-spaced-stroke

英語版: [flowchart-no-spaced-stroke.md](./flowchart-no-spaced-stroke.md)

`stroke` スタイルの `:` の前に空白を書くことを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

mermaid.js の文書では、`stroke: #f00` のように、
スタイルの名前を `:` の直前に書く。
`:` の前に空白のある `stroke` は、文書に示されている形ではない。
mermaid.js は、リンクのスタイルの中の `stroke:` を探して矢じりの色を決めるので、
ブラウザーが `stroke : #f00` の色で線を描いても、矢じりにはその色を付けない。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
リンクの番号を持つ `linkStyle` の文、`linkStyle default`、
リンクが使うかどうかにかかわらずすべての `classDef` で、
小文字の `stroke` という名前と `:` の間に空白があるスタイルを報告する。
`style` の文の `stroke` は、`style` が頂点か subgraph にスタイルを付け、
リンクには付けないので、この形が影響を与える矢じりがなく、
ブラウザーはそこで `stroke : #f00` を `stroke: #f00` と同じに読むため、
報告しない。
`text-stroke` のように名前が `stroke` で終わるだけのものや、
`Stroke` のように大文字と小文字が違う名前は報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke : #f00, stroke-width: 4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  classDef hot stroke : #f00
  class A hot
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke: #f00, stroke-width: 4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-stroke: error
flowchart LR
  A --> B
  classDef hot stroke: #f00
  class A hot
```

## オプション

この規則にはオプションがない。

## 使わないとき

描画が矢じりに左右されないところでは、
mermaid.js は `stroke : #f00` を意図どおりに読む。
mermaid.js のプルリクエストには、対応するブラウザーで、
矢じりに線と同じ色を与える変更がある。
この形を意図して書くときや、使っている版にその変更が入ったときは、
この規則を無効にする。

## 関連する規則

- [agentflow-no-spaced-stroke](./agentflow-no-spaced-stroke.ja.md)

## 参考

- [mermaid-js/mermaid#7974](https://github.com/mermaid-js/mermaid/pull/7974)
- [mermaid-js/mermaid#1236](https://github.com/mermaid-js/mermaid/issues/1236)

<!-- begin auto-generated rule version -->

## バージョン

この規則は、`@mmd-toolkit/eslint-plugin` v0.4.0 で追加された。

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-spaced-stroke.ts)
- [テストのソース](../../tests/rules/flowchart-no-spaced-stroke.test.ts)

<!-- end auto-generated rule resources -->
