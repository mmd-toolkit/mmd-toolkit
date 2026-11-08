# @mmd-toolkit/flowchart-no-spaced-link-stroke

英語版:
[flowchart-no-spaced-link-stroke.md](./flowchart-no-spaced-link-stroke.md)

リンクの `stroke` スタイルの `:` の前に空白を書くことを禁止する。

<!-- begin auto-generated rule notice -->

`recommended` の設定は、この規則を有効にしない。

🔧
[`--fix` オプション](https://eslint.org/docs/latest/use/command-line-interface#--fix)
で自動修正できる。

<!-- end auto-generated rule notice -->

リンクには、`linkStyle` の文か、`class` の文で与えるクラスからスタイルを与える。
mermaid.js は線にスタイルを書いたとおりに適用するので、
`stroke :#f00` は線に色を付けるが、
矢じりの色は同じテキストの中の `stroke:` を探して決めるため、
このスタイルでは見つからない。
線は赤くなり、矢じりはテーマの色のままで、エラーは出ない。

## 規則の詳細

この規則は、フローチャート（`flowchart`、`graph`、`flowchart-elk`、
`swimlane-beta`）に当てる。
リンクの番号を持つ `linkStyle` の文、`linkStyle default`、
リンクに `class` の文で与えたクラスの `classDef` で、名前が `stroke` で終わり、
名前と `:` の間に空白があるスタイルを報告する。
`class` の文は、`classDef` の前でも後でもよい。
リンクは、`A e1@--> B` の `e1` のように書いた id か、
`L_A_B_0` のように mermaid.js が付ける id で指す。

頂点にだけ与える `classDef` は報告しない。
頂点は `stroke :#f00` でも色を保つからである。
`:` の後の空白や、`Stroke` のように大文字と小文字が違う名前も報告しない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke :#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A e1@--> B
  classDef hot stroke :#f00
  class e1 hot
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A --> B
  linkStyle 0 stroke:#f00,stroke-width:4px
```

```mmd
%% eslint @mmd-toolkit/flowchart-no-spaced-link-stroke: error
flowchart LR
  A --> B
  classDef hot stroke :#f00
  class A hot
```

## オプション

この規則にはオプションがない。

## 使わないとき

mermaid.js のプルリクエストには、対応するブラウザーで、
矢じりに線と同じ色を与える変更がある。
使っている版にこの変更が入ったら、
`stroke :#f00` と書いた線の色が矢じりにも使われ、
この規則は意図どおりに描かれるテキストを報告することになる。
そのときは、この規則を無効にする。

## 関連する規則

- [agentflow-no-spaced-link-stroke](./agentflow-no-spaced-link-stroke.ja.md)

## 参考

- [mermaid-js/mermaid#7974](https://github.com/mermaid-js/mermaid/pull/7974)
- [mermaid-js/mermaid#1236](https://github.com/mermaid-js/mermaid/issues/1236)

<!-- begin auto-generated rule version -->

## バージョン

この規則は、まだリリースされていない。

<!-- end auto-generated rule version -->

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/flowchart-no-spaced-link-stroke.ts)
- [テストのソース](../../tests/rules/flowchart-no-spaced-link-stroke.test.ts)

<!-- end auto-generated rule resources -->
