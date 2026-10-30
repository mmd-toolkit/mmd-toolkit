# @mmd-toolkit/quadrant-no-undef

英語版: [quadrant-no-undef.md](./quadrant-no-undef.md)

どの `classDef` も定義しない点のクラスを禁止する。

<!-- begin auto-generated rule notice -->

✅ `recommended` の設定は、この規則を有効にする。

<!-- end auto-generated rule notice -->

点は、`A:::c1: [0.3, 0.6]` のように、`:::` でクラスのスタイルを取る。
名前を書き誤ったときのように、
そのクラスをチャートのどの `classDef` も定義しないとき、
mermaid.js はエラーを出さず、クラスは効かない。
点は、自分のスタイルとテーマのスタイルのままである。

## 規則の詳細

この規則は、象限チャート（`quadrantChart`）に当てる。
`:::` の後のクラス名に合う `classDef` が、
点の前後を含めチャートのどこにもない点を、それぞれ報告する。
名前は大文字小文字を区別するので、`C1` は `c1` を名指さない。
自分のスタイルを持つ点も、未定義のクラスが何も足さないので報告する。

点のクラス名は英字、数字、`_` からなり、
`classDef` の名前はほかの文字も持てるので、`A:::c` はクラス `c-1` を名指さない。

この規則に**反する**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-undef: error
quadrantChart
  Campaign A:::hot: [0.3, 0.6]
  classDef hit color: #f00
```

この規則に**従う**コードの例:

```mmd
%% eslint @mmd-toolkit/quadrant-no-undef: error
quadrantChart
  Campaign A:::hot: [0.3, 0.6]
  classDef hot color: #f00
```

## オプション

この規則にはオプションがない。

## 関連する規則

- [quadrant-no-redefined-class](./quadrant-no-redefined-class.ja.md)

<!-- begin auto-generated rule resources -->

## リソース

- [規則のソース](../../src/rules/quadrant-no-undef.ts)
- [テストのソース](../../tests/rules/quadrant-no-undef.test.ts)

<!-- end auto-generated rule resources -->
