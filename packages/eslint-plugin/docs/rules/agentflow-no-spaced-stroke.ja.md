# @mmd-toolkit/agentflow-no-spaced-stroke

英語版: [agentflow-no-spaced-stroke.md](./agentflow-no-spaced-stroke.md)

`stroke` スタイルの `:` の前に空白を書くことを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

mermaid.js の文書では、`stroke:#f00` のように、
スタイルの名前を `:` の直前に書く。
`:` の前に空白のある `stroke` は、文書に示されている形ではない。
mermaid.js は、リンクのスタイルの中の `stroke:` を探して矢じりの色を決めるので、
ブラウザーが `stroke :#f00` の色で線を描いても、矢じりにはその色を付けない。

## 規則の詳細

この規則は、agentflow 図（`agentflow-beta`）に当てる。
リンクの番号を持つ `linkStyle` の文、`linkStyle default`、
リンクが使うかどうかにかかわらずすべての `classDef` で、
小文字の `stroke` という名前と `:` の間に空白があるスタイルを報告する。
`style` の文の `stroke` は、`style` が頂点か subgraph にスタイルを付け、
リンクには付けないので、この形が影響を与える矢じりがなく、
ブラウザーはそこで `stroke :#f00` を `stroke:#f00` と同じに読むため、
報告しない。
`text-stroke` のように名前が `stroke` で終わるだけのものや、
`Stroke` のように大文字と小文字が違う名前は報告しない。

自動修正は空白を取り除く。
そのスタイルが届くリンクのスタイルの中で、
大文字と小文字や `:` の前の空白の有無にかかわらず、
`stroke` という名前のスタイルが後にあるときは、線は後のスタイルの色になり、
矢じりは最初の `stroke:` の色を取るので、このスタイルか、
それより前のものの色になるため、自動修正を出さない。
リンクのスタイルは、クラスを与えた順にそのクラスのスタイル、
次に `linkStyle default` のスタイル、最後にそのリンク自身のスタイルが並ぶ。
リンクにクラスを与えるには、リンクを書いた文より後に、`class` の文か、
`e1:::hot` のような `:::` を置く。
`linkStyle 0 stroke %%{init: {}}%%:#f00` のように、
スタイルの中に directive があるときや、
`classDef hot stroke :#f00;fill:none` のように、
mermaid.js がスタイルから `;` を落とし、
`stroke :#f00fill:none` という 1 つのスタイルになるときも、
そのスタイルは報告するが、自動修正は出さない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  linkStyle 0 stroke :#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  classDef hot stroke :#f00
  class A hot
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  linkStyle 0 stroke:#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/agentflow-no-spaced-stroke: error
agentflow-beta TB
  A --> B
  classDef hot stroke:#f00
  class A hot
```

## オプション

この規則にはオプションがない。

## 使わないとき

描画が矢じりに左右されないところでは、
mermaid.js は `stroke :#f00` を意図どおりに読む。
mermaid.js のプルリクエストには、対応するブラウザーで、
矢じりに線と同じ色を与える変更がある。
この形を意図して書くときや、使っている版にその変更が入ったときは、
この規則を無効にする。

## 関連する規則

- [flowchart-no-spaced-stroke](./flowchart-no-spaced-stroke.ja.md)

## 参考

- [mermaid-js/mermaid#7974](https://github.com/mermaid-js/mermaid/pull/7974)
- [mermaid-js/mermaid#1236](https://github.com/mermaid-js/mermaid/issues/1236)

<!-- begin auto-generated rule version -->

## バージョン

この規則は、まだリリースされていない。

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/agentflow-no-spaced-stroke.ts)
- [テストのソース](../../tests/rules/agentflow-no-spaced-stroke.test.ts)

<!-- end auto-generated rule resources -->
